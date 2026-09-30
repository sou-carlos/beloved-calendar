import { openDB, type IDBPDatabase } from "idb";
import type { Person } from "../models";
import { getAllPeople } from "./db";
import { apiMutate, apiRequest, AuthError } from "./auth";

export interface RemoteRecord {
  id: string;
  version: number;
  person: Person | null;
}
interface Mutation {
  accountId: string;
  operationId: string;
  id: string;
  baseVersion: number;
  person: Person | null;
}
export interface LocalRecord extends RemoteRecord {
  editId?: string;
  mutation?: Mutation & { editId: string };
  conflict?: RemoteRecord;
  problem?: string;
}
function comparable(value: unknown): string {
  return JSON.stringify(value, (_key, item) => {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      return Object.fromEntries(
        Object.keys(item)
          .sort()
          .filter((key) => item[key] != null)
          .map((key) => [key, item[key]]),
      );
    }
    return item;
  });
}
interface SyncResult {
  accountId: string;
  operationId: string;
  status: "accepted" | "conflict";
  record: RemoteRecord;
}
const databases = new Map<string, Promise<IDBPDatabase>>();
const running = new Map<string, Promise<void>>();
export const DATA_EVENT = "beloved-data-changed";
const channel =
  typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel("beloved-sync")
    : null;
channel?.addEventListener("message", (event) => {
  window.dispatchEvent(new CustomEvent(DATA_EVENT, { detail: event.data }));
});
function changed(accountId: string) {
  window.dispatchEvent(new CustomEvent(DATA_EVENT, { detail: accountId }));
  channel?.postMessage(accountId);
}
function database(accountId: string) {
  let db = databases.get(accountId);
  if (!db) {
    db = openDB(`beloved-account-${accountId}`, 1, {
      upgrade(database) {
        database.createObjectStore("records", { keyPath: "id" });
        database.createObjectStore("meta");
      },
    });
    databases.set(accountId, db);
    void db.catch(() => databases.delete(accountId));
  }
  return db;
}
export async function accountRecords(
  accountId: string,
): Promise<LocalRecord[]> {
  return (await database(accountId)).getAll("records");
}
export async function saveAccountPerson(
  accountId: string,
  id: string,
  person: Person | null,
  expected?: Person,
) {
  const db = await database(accountId);
  const tx = db.transaction("records", "readwrite");
  const old: LocalRecord | undefined = await tx.store.get(id);
  await tx.store.put({
    ...old,
    id,
    version: old?.version || 0,
    person,
    editId: crypto.randomUUID(),
    problem: undefined,
    conflict:
      old?.conflict ||
      (old && expected && comparable(old.person) !== comparable(expected)
        ? { id, version: old.version, person: old.person }
        : undefined),
  });
  await tx.done;
  changed(accountId);
}
export async function importGuest(accountId: string) {
  const guests = await getAllPeople();
  const db = await database(accountId);
  const tx = db.transaction("records", "readwrite");
  let added = 0;
  for (const person of guests) {
    // Preserve IDs, including legacy IDs. Existing records and tombstones are never replaced.
    if (await tx.store.get(person.id)) continue;
    await tx.store.put({
      id: person.id,
      version: 0,
      person: { ...person, gifts: person.gifts || [] },
      editId: crypto.randomUUID(),
    });
    added++;
  }
  await tx.done;
  changed(accountId);
  return added;
}
export async function resolveConflict(
  accountId: string,
  id: string,
  choice: "local" | "remote" | "both",
) {
  const db = await database(accountId);
  const tx = db.transaction("records", "readwrite");
  const row: LocalRecord | undefined = await tx.store.get(id);
  if (row?.conflict) {
    if (choice === "both" && row.person) {
      const copyId = crypto.randomUUID();
      await tx.store.put({
        id: copyId,
        version: 0,
        person: {
          ...row.person,
          id: copyId,
          name: row.person.name.slice(0, 65) + " (cópia local)",
        },
        editId: crypto.randomUUID(),
      });
    }
    await tx.store.put(
      choice === "local"
        ? {
            id,
            version: row.conflict.version,
            person: row.person,
            editId: crypto.randomUUID(),
          }
        : row.conflict,
    );
  }
  await tx.done;
  changed(accountId);
}
async function prepare(accountId: string, id: string) {
  const db = await database(accountId);
  const tx = db.transaction("records", "readwrite");
  const row: LocalRecord | undefined = await tx.store.get(id);
  let operation: LocalRecord["mutation"];
  if (row?.editId && !row.conflict && !row.problem) {
    operation = row.mutation || {
      accountId,
      operationId: crypto.randomUUID(),
      id,
      baseVersion: row.version,
      person: row.person,
      editId: row.editId,
    };
    if (!row.mutation) await tx.store.put({ ...row, mutation: operation });
  }
  await tx.done;
  return operation;
}
async function acknowledge(
  accountId: string,
  operation: NonNullable<LocalRecord["mutation"]>,
  result: SyncResult,
) {
  if (
    result.accountId !== accountId ||
    result.operationId !== operation.operationId ||
    result.record.id !== operation.id
  )
    throw new Error("Resposta de sincronização inválida.");
  const db = await database(accountId);
  const tx = db.transaction("records", "readwrite");
  const row: LocalRecord | undefined = await tx.store.get(operation.id);
  if (row?.mutation?.operationId === operation.operationId) {
    if (result.status === "conflict") {
      await tx.store.put({
        ...row,
        mutation: undefined,
        conflict: result.record,
      });
    } else if (row.editId === operation.editId) {
      await tx.store.put(result.record);
    } else {
      // An edit made while the request was in flight remains pending, rebased on the acknowledgment.
      await tx.store.put({
        ...row,
        version: result.record.version,
        mutation: undefined,
      });
    }
  }
  await tx.done;
  changed(accountId);
}
async function merge(accountId: string, records: RemoteRecord[]) {
  const db = await database(accountId);
  const tx = db.transaction("records", "readwrite");
  for (const remote of records) {
    const row: LocalRecord | undefined = await tx.store.get(remote.id);
    if (row?.mutation || (row && remote.version < row.version)) continue;
    if (row?.editId) {
      if (remote.version !== row.version)
        await tx.store.put({ ...row, conflict: remote });
    } else await tx.store.put(remote);
  }
  await tx.done;
  await db.put("meta", Date.now(), "lastSync");
  changed(accountId);
}
export async function lastSync(accountId: string): Promise<number | undefined> {
  return (await database(accountId)).get("meta", "lastSync");
}
export async function syncAccount(
  accountId: string,
  stillActive: () => boolean = () => true,
) {
  const active = running.get(accountId);
  if (active) return active;
  const task = (async () => {
    if (!navigator.onLine || !stillActive()) return;
    // Requests always carry the expected account ID; the server verifies it against the session.
    for (const row of await accountRecords(accountId)) {
      if (!stillActive()) return;
      const operation = await prepare(accountId, row.id);
      if (!operation) continue;
      const { editId: _editId, ...body } = operation;
      try {
        const result = await apiMutate<SyncResult>("/sync", body);
        await acknowledge(accountId, operation, result);
      } catch (error) {
        if (!(error instanceof AuthError) || error.status !== 400) throw error;
        // A definitive validation rejection must not block unrelated records or trap a corrected edit.
        const db = await database(accountId);
        const tx = db.transaction("records", "readwrite");
        const current: LocalRecord | undefined = await tx.store.get(row.id);
        if (current?.mutation?.operationId === operation.operationId) {
          await tx.store.put({
            ...current,
            mutation: undefined,
            problem:
              current.editId === operation.editId ? error.message : undefined,
          });
        }
        await tx.done;
        changed(accountId);
      }
    }
    if (!stillActive()) return;
    const snapshot = await apiRequest<{
      accountId: string;
      records: RemoteRecord[];
    }>(`/sync?accountId=${encodeURIComponent(accountId)}`);
    if (snapshot.accountId !== accountId)
      throw new Error("A conta mudou durante a sincronização.");
    await merge(accountId, snapshot.records);
  })();
  running.set(accountId, task);
  try {
    await task;
  } finally {
    running.delete(accountId);
  }
}
