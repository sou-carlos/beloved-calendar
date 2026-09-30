import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Person } from "../models";
import * as guest from "../lib/db";
import * as sync from "../lib/sync";
import { AuthError } from "../lib/auth";
import { useAuth } from "./AuthProvider";

interface CalendarContextValue {
  people: Person[];
  loading: boolean;
  error: string;
  pending: number;
  conflicts: sync.LocalRecord[];
  problems: sync.LocalRecord[];
  syncing: boolean;
  syncError: string;
  online: boolean;
  lastSync?: number;
  guestCount: number;
  accountId?: string;
  save: (person: Person, expected?: Person) => Promise<void>;
  remove: (id: string, expected?: Person) => Promise<void>;
  syncNow: () => Promise<void>;
  importGuests: () => Promise<number>;
  resolve: (id: string, choice: "local" | "remote" | "both") => Promise<void>;
}
const Context = createContext<CalendarContextValue | null>(null);
export function CalendarProvider({ children }: { children: ReactNode }) {
  const { account } = useAuth();
  return (
    <ScopedCalendarProvider
      key={account?.id || "guest"}
      accountId={account?.id}
    >
      {children}
    </ScopedCalendarProvider>
  );
}

function ScopedCalendarProvider({
  accountId,
  children,
}: {
  accountId?: string;
  children: ReactNode;
}) {
  const auth = useAuth();
  const refreshSession = useRef(auth.refresh);
  refreshSession.current = auth.refresh;
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<sync.LocalRecord[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [online, setOnline] = useState(navigator.onLine);
  const [lastSynced, setLastSynced] = useState<number>();
  const [guestCount, setGuestCount] = useState(0);
  const mounted = useRef(true);
  const busy = useRef(false);
  const reads = useRef(0);
  const refresh = useCallback(async () => {
    const read = ++reads.current;
    try {
      if (accountId) {
        const [records, guests, last] = await Promise.all([
          sync.accountRecords(accountId),
          guest.getAllPeople(),
          sync.lastSync(accountId),
        ]);
        if (!mounted.current || read !== reads.current) return;
        setRows(records);
        setPeople(
          records.flatMap((row) =>
            row.person
              ? [{ ...row.person, gifts: row.person.gifts || [] }]
              : [],
          ),
        );
        setGuestCount(
          guests.filter(
            (person) => !records.some((row) => row.id === person.id),
          ).length,
        );
        setLastSynced(last);
      } else {
        const records = await guest.getAllPeople();
        if (!mounted.current || read !== reads.current) return;
        setPeople(
          records.map((person) => ({ ...person, gifts: person.gifts || [] })),
        );
      }
      setError("");
    } catch {
      if (mounted.current)
        setError(
          "Não foi possível abrir seus dados. Recarregue a página para tentar novamente.",
        );
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [accountId]);

  const syncNow = useCallback(async () => {
    if (!accountId || busy.current || !navigator.onLine) return;
    busy.current = true;
    setSyncing(true);
    try {
      await sync.syncAccount(accountId, () => mounted.current);
      if (mounted.current) setSyncError("");
    } catch (failure) {
      if (
        mounted.current &&
        failure instanceof AuthError &&
        (failure.status === 401 || failure.status === 409)
      ) {
        void refreshSession.current();
      }
      if (mounted.current)
        setSyncError(
          failure instanceof AuthError &&
            (failure.status === 401 || failure.status === 409)
            ? "Entre novamente na mesma conta para sincronizar. Suas alterações estão guardadas neste dispositivo."
            : "Não foi possível sincronizar. Suas alterações estão guardadas; tentaremos novamente.",
        );
    } finally {
      busy.current = false;
      if (mounted.current) {
        setSyncing(false);
        await refresh();
      }
    }
  }, [accountId, refresh]);

  useEffect(() => {
    mounted.current = true;
    void refresh();
    void syncNow();
    const dataChanged = (event: Event) => {
      if ((event as CustomEvent).detail === accountId) void refresh();
    };
    const connected = () => {
      setOnline(navigator.onLine);
      void syncNow();
    };
    window.addEventListener(sync.DATA_EVENT, dataChanged);
    window.addEventListener("online", connected);
    window.addEventListener("offline", connected);
    window.addEventListener("focus", connected);
    const timer = window.setInterval(() => {
      if (!document.hidden) void syncNow();
    }, 15000);
    return () => {
      mounted.current = false;
      window.clearInterval(timer);
      window.removeEventListener(sync.DATA_EVENT, dataChanged);
      window.removeEventListener("online", connected);
      window.removeEventListener("offline", connected);
      window.removeEventListener("focus", connected);
    };
  }, [accountId, refresh, syncNow]);

  const pending = rows.filter(
    (row) => row.editId && !row.conflict && !row.problem,
  ).length;
  // Flush edits made while an earlier operation was in flight, without a retry loop on failure.
  useEffect(() => {
    if (!pending || syncing || syncError || !online) return;
    const timer = window.setTimeout(() => void syncNow(), 400);
    return () => window.clearTimeout(timer);
  }, [pending, syncing, syncError, online, syncNow]);

  const value: CalendarContextValue = {
    accountId,
    people,
    loading,
    error,
    pending,
    conflicts: rows.filter((row) => row.conflict),
    problems: rows.filter((row) => row.problem),
    syncing,
    syncError,
    online,
    lastSync: lastSynced,
    guestCount,
    syncNow,
    async save(person, expected) {
      if (accountId)
        await sync.saveAccountPerson(accountId, person.id, person, expected);
      else await guest.upsertPerson(person);
      await refresh();
      void syncNow();
    },
    async remove(id, expected) {
      if (accountId)
        await sync.saveAccountPerson(accountId, id, null, expected);
      else await guest.deletePerson(id);
      await refresh();
      void syncNow();
    },
    async importGuests() {
      if (!accountId) return 0;
      const count = await sync.importGuest(accountId);
      await refresh();
      void syncNow();
      return count;
    },
    async resolve(id, choice) {
      if (!accountId) return;
      await sync.resolveConflict(accountId, id, choice);
      await refresh();
      void syncNow();
    },
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useCalendar() {
  const value = useContext(Context);
  if (!value) throw new Error("CalendarProvider não encontrado.");
  return value;
}
