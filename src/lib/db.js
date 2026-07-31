import Dexie from 'dexie';

export const db = new Dexie('scrybyx-db');

db.version(2).stores({
  notes: 'id, updatedAt, createdAt, syncStatus, deleted, isPinned',
  settings: 'key'
}).upgrade(tx => {
  return tx.table('notes').toCollection().modify(note => {
    note.isPinned = false;
  });
});

db.version(1).stores({
  notes: 'id, updatedAt, createdAt, syncStatus, deleted',
  settings: 'key'
});
