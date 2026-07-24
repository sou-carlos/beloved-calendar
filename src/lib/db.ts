import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';
import type { Person } from '../models';

const DB_NAME = 'beloved-calendar-db';
const DB_VERSION = 1;
const STORE_PEOPLE = 'people';

let dbPromise: Promise<IDBPDatabase> | null = null;

async function initDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_PEOPLE)) {
          const store = db.createObjectStore(STORE_PEOPLE, { keyPath: 'id' });
          store.createIndex('by-name', 'name');
          store.createIndex('by-birthDate', 'birthDate');
        }
      },
    });
  }
  return dbPromise;
}

export async function getAllPeople(): Promise<Person[]> {
  const db = await initDB();
  return (await db.getAll(STORE_PEOPLE)) as Person[];
}

export async function getPerson(id: string): Promise<Person | undefined> {
  const db = await initDB();
  return (await db.get(STORE_PEOPLE, id)) as Person | undefined;
}

export async function addPerson(person: Person): Promise<void> {
  const db = await initDB();
  await db.add(STORE_PEOPLE, person);
}

export async function upsertPerson(person: Person): Promise<void> {
  const db = await initDB();
  await db.put(STORE_PEOPLE, person);
}

export async function deletePerson(id: string): Promise<void> {
  const db = await initDB();
  await db.delete(STORE_PEOPLE, id);
}

export async function clearAll(): Promise<void> {
  const db = await initDB();
  await db.clear(STORE_PEOPLE);
}

export { initDB };
