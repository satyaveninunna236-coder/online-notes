import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';

export function useNotesDb() {
  const [isMigrating, setIsMigrating] = useState(true);

  // Retrieve notes (excluding deleted ones for now, but keeping them in DB for sync)
  const notes = useLiveQuery(
    async () => {
      const allNotes = await db.notes.filter(note => !note.deleted).toArray();
      // Sort newest to oldest, but pinned at the top
      return allNotes.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        const getNoteTime = (note) => {
          const dateVal = note.updatedAt || note.lastEditedAt || note.timestamp || note.createdAt || note.id;
          if (!dateVal) return 0;
          const time = new Date(dateVal).getTime();
          return isNaN(time) ? 0 : time;
        };

        return getNoteTime(b) - getNoteTime(a);
      });
    },
    []
  );

  // Active Note State
  const activeNoteItem = useLiveQuery(() => db.settings.get('activeNote'));
  const [activeNoteState, setActiveNoteState] = useState(null);

  useEffect(() => {
    if (activeNoteItem !== undefined && activeNoteItem !== null && activeNoteItem.value !== undefined) {
      setActiveNoteState(activeNoteItem.value);
    }
  }, [activeNoteItem]);

  // Dark Mode State
  const darkModeItem = useLiveQuery(() => db.settings.get('darkMode'));
  const darkMode = darkModeItem ? darkModeItem.value : false;

  // One-time migration from localStorage
  useEffect(() => {
    const migrateData = async () => {
      try {
        const migrationDone = await db.settings.get('migrationDone');
        if (migrationDone && migrationDone.value) {
          setIsMigrating(false);
          return;
        }

        // Perform migration
        const storedNotes = localStorage.getItem('notes');
        if (storedNotes) {
          const parsedNotes = JSON.parse(storedNotes);
          const migratedNotes = parsedNotes.map(note => ({
            ...note,
            createdAt: note.createdAt || note.timestamp || new Date(),
            updatedAt: note.lastEditedAt || new Date(),
            syncStatus: 'pending',
            deleted: false,
            deviceId: 'local',
            version: 1
          }));

          await db.notes.bulkAdd(migratedNotes);
        }

        // Migrate other settings like darkMode and activeNote if needed
        const storedDarkMode = localStorage.getItem('darkMode');
        if (storedDarkMode) {
          await db.settings.put({ key: 'darkMode', value: storedDarkMode === 'true' });
        }
        
        const storedActiveNote = localStorage.getItem('activeNote');
        if (storedActiveNote) {
          await db.settings.put({ key: 'activeNote', value: parseInt(storedActiveNote) });
        }

        await db.settings.put({ key: 'migrationDone', value: true });
        setIsMigrating(false);
      } catch (err) {
        console.error("Migration failed:", err);
        setIsMigrating(false); // don't block app load
      }
    };

    migrateData();
  }, []);

  // Synchronize notes to localStorage whenever notes change
  useEffect(() => {
    if (notes && !isMigrating) {
      try {
        localStorage.setItem('notes', JSON.stringify(notes));
      } catch (err) {
        console.warn('Failed to sync notes to localStorage:', err);
      }
    }
  }, [notes, isMigrating]);

  // Synchronize activeNote to localStorage
  useEffect(() => {
    if (activeNoteState !== null && activeNoteState !== undefined) {
      localStorage.setItem('activeNote', String(activeNoteState));
    } else {
      localStorage.removeItem('activeNote');
    }
  }, [activeNoteState]);

  // Synchronize darkMode to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const addNote = async (noteData) => {
    const newNote = {
      ...noteData,
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: 'pending',
      deleted: false,
      deviceId: 'local',
      version: 1
    };
    const id = await db.notes.add(newNote);
    // Instant localStorage backup
    try {
      const current = JSON.parse(localStorage.getItem('notes') || '[]');
      localStorage.setItem('notes', JSON.stringify([newNote, ...current]));
    } catch {
      // Ignore
    }
    return id;
  };

  const updateNote = async (id, changes) => {
    const res = await db.notes.update(id, {
      ...changes,
      updatedAt: new Date(),
      syncStatus: 'pending',
      version: changes.version ? changes.version + 1 : 1
    });
    // Instant localStorage backup
    try {
      const current = JSON.parse(localStorage.getItem('notes') || '[]');
      const updated = current.map(n => Number(n.id) === Number(id) ? { ...n, ...changes, updatedAt: new Date() } : n);
      localStorage.setItem('notes', JSON.stringify(updated));
    } catch {
      // Ignore
    }
    return res;
  };

  const deleteNote = async (id) => {
    // Soft delete for sync purposes
    const res = await db.notes.update(id, {
      deleted: true,
      updatedAt: new Date(),
      syncStatus: 'pending'
    });
    // Instant localStorage backup
    try {
      const current = JSON.parse(localStorage.getItem('notes') || '[]');
      const updated = current.filter(n => Number(n.id) !== Number(id));
      localStorage.setItem('notes', JSON.stringify(updated));
    } catch {
      // Ignore
    }
    return res;
  };

  const togglePin = async (id) => {
    const note = await db.notes.get(id);
    if (note) {
      const res = await db.notes.update(id, {
        isPinned: !note.isPinned,
        updatedAt: new Date(),
        syncStatus: 'pending'
      });
      try {
        const current = JSON.parse(localStorage.getItem('notes') || '[]');
        const updated = current.map(n => Number(n.id) === Number(id) ? { ...n, isPinned: !n.isPinned } : n);
        localStorage.setItem('notes', JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return res;
    }
  };

  const setActiveNote = async (id) => {
    const val = (id !== null && id !== undefined) ? Number(id) : null;
    setActiveNoteState(val);
    if (val !== null) {
      await db.settings.put({ key: 'activeNote', value: val });
      localStorage.setItem('activeNote', String(val));
    } else {
      await db.settings.put({ key: 'activeNote', value: null });
      localStorage.removeItem('activeNote');
    }
  };
  
  const setDarkMode = async (isDark) => {
    await db.settings.put({ key: 'darkMode', value: isDark });
    localStorage.setItem('darkMode', String(isDark));
  };

  return {
    notes: notes || [],
    isMigrating,
    addNote,
    updateNote,
    deleteNote,
    togglePin,
    activeNote: activeNoteState,
    setActiveNote,
    darkMode,
    setDarkMode
  };
}
