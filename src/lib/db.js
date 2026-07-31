import Dexie from 'dexie';

export const db = new Dexie('scrybyx-db');

db.version(1).stores({
  notes: 'id, createdAt, updatedAt, syncStatus, deleted, deviceId, version',
  settings: 'key, value'
});
