import { openDB } from 'idb';

const DB_NAME = 'mylink-photos';
const STORE_NAME = 'photos';
const DB_VERSION = 1;

function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export async function savePhoto(slot, dataUrl) {
  const db = await getDB();
  await db.put(STORE_NAME, dataUrl, `slot-${slot}`);
}

export async function getPhoto(slot) {
  const db = await getDB();
  return db.get(STORE_NAME, `slot-${slot}`);
}

export async function getAllPhotos() {
  const db = await getDB();
  const photos = {};
  for (let i = 0; i < 3; i++) {
    const val = await db.get(STORE_NAME, `slot-${i}`);
    if (val) photos[i] = val;
  }
  return photos;
}

export async function deletePhoto(slot) {
  const db = await getDB();
  await db.delete(STORE_NAME, `slot-${slot}`);
}

export async function clearAllPhotos() {
  const db = await getDB();
  await db.clear(STORE_NAME);
}
