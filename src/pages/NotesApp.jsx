import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNotesDb } from '../hooks/useNotesDb';
import Sidebar from '../components/notes/Sidebar';
import FormattingToolbar from '../components/notes/FormattingToolbar';
import ImagesGrid from '../components/notes/ImagesGrid';
import TextEditor from '../components/notes/TextEditor';
import CommandPalette from '../components/CommandPalette';
import { Lock, Unlock, ShieldOff, X, FileText, Plus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";


const AppleNotes = () => {
  // Add cursor position state
  const {
    notes,
    isMigrating,
    addNote: dbAddNote,
    updateNote: dbUpdateNote,
    deleteNote: dbDeleteNote,
    togglePin: dbTogglePin,
    activeNote,
    setActiveNote,
    darkMode,
    setDarkMode
  } = useNotesDb();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  // Global formating state removed - moved to individual notes
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const contentRef = useRef(null);
  const editorRef = useRef(null);
  const searchInputRef = useRef(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ open: false, noteId: null });
  const [editor, setEditor] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const showToast = useCallback((message) => {
    setToast({ visible: true, message });
    setTimeout(() => {
      setToast({ visible: false, message: '' });
    }, 2500);
  }, []);

  const currentNote = notes?.find(n => Number(n.id) === Number(activeNote)) || (notes?.length > 0 ? notes[0] : null);

  useEffect(() => {
    if (isMigrating) return;
    
    if (notes && notes.length > 0 && (activeNote === null || activeNote === undefined)) {
      // If no active note is selected, select the first note
      setActiveNote(notes[0].id);
    }
  }, [notes, isMigrating, activeNote, setActiveNote]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 500) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const addNote = (customTitle) => {
    setSearchQuery('');
    const titleText = typeof customTitle === 'string' && customTitle.trim() ? customTitle.trim() : 'New Note';
    const bodyHtml = titleText !== 'New Note' ? `<h1>${titleText}</h1><p></p>` : '';
    const now = new Date();
    const newNote = {
      id: Date.now(),
      title: titleText,
      content: `${titleText}\n${bodyHtml}`,
      images: [],
      timestamp: now,
      createdAt: now,
      lastEditedAt: now,
      fontSize: 16,
      isBold: false,
      isItalic: false,
      isUnderline: false,
      textColor: darkMode ? '#ffffff' : '#000000'
    };
    setActiveNote(newNote.id);
    dbAddNote(newNote);
  };

  const deleteNote = (id) => {
    const targetId = Number(id);
    const newNotes = notes.filter(n => Number(n.id) !== targetId);
    let nextActive = null;

    if (newNotes.length > 0) {
      if (Number(activeNote) === targetId) {
        nextActive = newNotes[0].id;
      } else {
        nextActive = activeNote;
      }
    }

    dbDeleteNote(targetId).then(() => {
      setActiveNote(nextActive);
    });

    showToast('Note deleted successfully');
  };

  const requestDeleteNote = useCallback((id) => {
    setDeleteConfirmation({ open: true, noteId: id });
  }, []);

  const updateNoteContent = (content) => {
    const firstLine = (content || '').split('\n')[0] || '';
    const plainTitle = firstLine.replace(/<[^>]+>/g, '').substring(0, 30);
    dbUpdateNote(activeNote, {
      content,
      title: plainTitle || 'New Note',
      timestamp: new Date(),
      lastEditedAt: new Date()
    });
  };

  const updateNoteFormatting = (updates) => {
    dbUpdateNote(activeNote, updates);
  };

  const handlePaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let item of items) {
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();

        // Use FileReader to convert to Base64 for persistence
        const reader = new FileReader();
        reader.onload = (event) => {
          const imgUrl = event.target.result;
          const current = notes.find(n => n.id === activeNote);
          dbUpdateNote(activeNote, {
            images: [...(current?.images || []), imgUrl],
            lastEditedAt: new Date()
          });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date) => {
    const now = new Date();
    const noteDate = new Date(date);

    // Get the start of today and the note's day (midnight) for accurate day comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const noteDay = new Date(noteDate.getFullYear(), noteDate.getMonth(), noteDate.getDate());

    // Calculate difference in days
    const diffTime = today - noteDay;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Today - show time
      return noteDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      // Yesterday
      return 'Yesterday';
    } else if (diffDays < 7 && diffDays > 0) {
      // Within last week - show day name
      return noteDate.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      // Older - show date
      return noteDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  useEffect(() => {
    // Note: To avoid excessive DB updates, we could just render with appropriate colors
    // or update them individually here if needed.
    notes.forEach(n => {
      if (darkMode && (n.textColor === '#000000' || !n.textColor)) {
        dbUpdateNote(n.id, { textColor: '#ffffff' });
      }
      if (!darkMode && (n.textColor === '#ffffff' || !n.textColor)) {
        dbUpdateNote(n.id, { textColor: '#000000' });
      }
    });
  }, [darkMode, notes.length]);

  useEffect(() => {
    const handleKeyboard = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        addNote();
        showToast('New note created');
      }

      if (e.ctrlKey && (e.key === 'Backspace' || e.key === 'Delete')) {
        e.preventDefault();
        if (currentNote) {
          requestDeleteNote(currentNote.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [addNote, showToast, currentNote, requestDeleteNote]);

  const navigateHome = () => {
    setActiveNote(1);
    setSearchQuery('');
    setIsMobileSidebarOpen(false);
  };

  const simpleEncrypt = (text, password) => {
    // Add a verification marker at the start
    const marker = '::VALID::';
    const textWithMarker = marker + text;
    return btoa(unescape(encodeURIComponent(textWithMarker.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ password.charCodeAt(i % password.length))).join(''))));
  };

  const simpleDecrypt = (data, password) => {
    try {
      const decoded = decodeURIComponent(escape(atob(data)));
      const decrypted = decoded.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ password.charCodeAt(i % password.length))).join('');

      // Check if the marker is present
      const marker = '::VALID::';
      if (decrypted.startsWith(marker)) {
        return decrypted.substring(marker.length); // Remove marker and return actual content
      }
      return null; // Invalid password
    } catch {
      return null;
    }
  };

  const [passwordPrompt, setPasswordPrompt] = useState({ open: false, noteId: null });
  const [passwordInput, setPasswordInput] = useState('');
  const [setPasswordMode, setSetPasswordMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [lastPassword, setLastPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

  const handleSetPassword = (noteId) => {
    setPasswordPrompt({ open: true, noteId });
    setSetPasswordMode(true);
    setNewPassword('');
  };

  const handleUnlockNote = (noteId) => {
    setPasswordPrompt({ open: true, noteId });
    setSetPasswordMode(false);
    setPasswordInput('');
  };

  const handleLockNote = (noteId) => {
    const note = notes.find(n => n.id === noteId);
    if (note && lastPassword && note.content) {
      dbUpdateNote(noteId, {
        encryptedContent: simpleEncrypt(note.content, lastPassword),
        content: '',
        passwordProtected: true
      });
      showToast('Note locked successfully');
    } else {
      showToast('Cannot lock: password missing');
    }
  };

  const handlePasswordSubmit = () => {
    if (setPasswordMode) {
      if (!newPassword || newPassword.length < 4) {
        setPasswordError(true);
        setPasswordErrorMessage('Password must be at least 4 characters');
        setTimeout(() => {
          setPasswordError(false);
          setPasswordErrorMessage('');
        }, 3000);
        return;
      }
      const note = notes.find(n => n.id === passwordPrompt.noteId);
      dbUpdateNote(passwordPrompt.noteId, {
        encryptedContent: simpleEncrypt(note?.content || '', newPassword),
        content: '',
        passwordProtected: true
      });
      setLastPassword(newPassword);
      setPasswordPrompt({ open: false, noteId: null });
      setPasswordError(false);
      setPasswordErrorMessage('');
      showToast('Password set successfully');
    } else {
      const note = notes.find(n => n.id === passwordPrompt.noteId);
      if (!note || !note.encryptedContent) {
        setPasswordError(true);
        setPasswordErrorMessage('No encrypted content found');
        setTimeout(() => {
          setPasswordError(false);
          setPasswordErrorMessage('');
        }, 3000);
        return;
      }

      const decrypted = simpleDecrypt(note.encryptedContent, passwordInput);

      if (decrypted !== null) {
        // Password is correct - store encrypted content for re-locking but clear content field
        dbUpdateNote(passwordPrompt.noteId, {
          content: decrypted,
          passwordProtected: false
        });
        setLastPassword(passwordInput);
        setPasswordPrompt({ open: false, noteId: null });
        setPasswordInput(''); // Clear password input
        setPasswordError(false);
        setPasswordErrorMessage('');
        showToast('Note unlocked successfully');
      } else {
        // Password is incorrect
        setPasswordError(true);
        setPasswordErrorMessage('Incorrect password. Please try again.');
        setPasswordInput(''); // Clear the input for retry
        // Remove error state after animation
        setTimeout(() => {
          setPasswordError(false);
          setPasswordErrorMessage('');
        }, 3000);
      }
    }
  };

  const handleRemovePassword = (noteId) => {
    dbUpdateNote(noteId, {
        passwordProtected: false,
        encryptedContent: '',
        content: n.content
      });
    showToast('Password removed');
  };

  return (
    <div className={`h-screen flex ${darkMode ? 'bg-[#1a1a1a] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex-1 flex relative overflow-hidden">
        {!isFullscreen && (
          <Sidebar
            togglePin={dbTogglePin}
            notes={notes}
            filteredNotes={filteredNotes}
            activeNote={activeNote}
            setActiveNote={setActiveNote}
            addNote={addNote}
            deleteNote={deleteNote}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchInputRef={searchInputRef}
            isMobileSidebarOpen={isMobileSidebarOpen}
            setIsMobileSidebarOpen={setIsMobileSidebarOpen}
            navigateHome={navigateHome}
          />
        )}

        {/* Mobile overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Main Editor Area */}
        <main className={`flex-1 flex flex-col min-w-0 ${darkMode ? 'bg-[#1a1a1a]' : 'bg-white'
          }`}>
          {currentNote ? (
            <>
              {currentNote.passwordProtected ? (
                <div className="flex flex-col items-center justify-center h-full p-4 sm:p-8">
                  <div className={`rounded-2xl shadow-xl border flex flex-col items-center px-6 py-10 sm:px-10 sm:py-12 w-full max-w-sm ${darkMode
                    ? 'bg-gray-800/50 border-gray-700 backdrop-blur-lg'
                    : 'bg-white border-gray-200'
                    }`}>
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'
                      }`}>
                      <Lock size={40} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                    </div>
                    <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                      Note Locked
                    </h2>
                    <p className={`text-center mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                      This note is password protected. Enter your password to view its contents.
                    </p>
                    <button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2"
                      onClick={() => handleUnlockNote(currentNote.id)}
                    >
                      <Unlock size={18} />
                      Unlock Note
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <FormattingToolbar
                    currentNote={currentNote}
                    setIsMobileSidebarOpen={setIsMobileSidebarOpen}
                    darkMode={darkMode}
                    contentRef={contentRef}
                    editor={editor}
                    onSetPassword={handleSetPassword}
                    onLockNote={handleLockNote}
                    onRemovePassword={handleRemovePassword}
                    lastPassword={lastPassword}
                    onDropdownStateChange={setIsDropdownOpen}
                    isFullscreen={isFullscreen}
                    setIsFullscreen={setIsFullscreen}
                  />

                  <div className="flex-1 overflow-y-auto">
                    <div className="w-full h-full px-6 pb-6 pt-2 max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
                      <ImagesGrid
                        currentNote={currentNote}
                        notes={notes}
                        updateNote={dbUpdateNote}
                        activeNote={activeNote}
                      />
                      {hydrated && (
                        <TextEditor
                          key={currentNote.id}
                          contentRef={contentRef}
                          editorRef={editorRef}
                          currentNote={currentNote}
                          updateNoteContent={updateNoteContent}
                          handlePaste={handlePaste}
                          darkMode={darkMode}
                          onEditorReady={setEditor}
                        />
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                <FileText size={32} />
              </div>
              <h2 className={`text-2xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                No Note Selected
              </h2>
              <p className={`text-sm max-w-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Select a note from the sidebar or create a new note to start typing.
              </p>
              <button
                onClick={() => addNote()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm flex items-center gap-2"
              >
                <Plus size={18} />
                Create New Note
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Toast Notification */}
      {toast.visible && (
        <div className={`fixed z-50 animate-slide-in ${isDropdownOpen
          ? 'bottom-6 left-1/2 -translate-x-1/2' // Dropdown open: centered at bottom on all screens
          : 'bottom-6 left-1/2 -translate-x-1/2 md:top-[100px] md:left-auto md:right-6 md:bottom-auto md:translate-x-0' // Dropdown closed: normal position
          }`}>
          <div className={`px-4 py-3 rounded-lg shadow-xl border flex items-center gap-2 ${darkMode
            ? 'bg-gray-800 border-gray-700 text-white'
            : 'bg-white border-gray-200 text-gray-900'
            }`}>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {passwordPrompt.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div
            className={`relative w-full max-w-md rounded-3xl shadow-2xl border transition-all duration-300 scale-100 animate-fade-in ${darkMode
              ? 'bg-gray-900 border-gray-700'
              : 'bg-white border-gray-200'
              }`}
          >
            {/* Close Button */}
            <button
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${darkMode
                ? 'hover:bg-gray-700 text-gray-400'
                : 'hover:bg-gray-100 text-gray-500'
                }`}
              onClick={() => setPasswordPrompt({ open: false, noteId: null })}
            >
              <X size={20} />
            </button>

            {/* Icon */}
            <div className="flex justify-center mt-8">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'
                  }`}
              >
                <Lock size={28} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
              </div>
            </div>

            {/* Content */}
            <div className="px-8 pb-8 pt-6">
              <h2
                className={`text-2xl font-semibold text-center mb-2 ${darkMode ? 'text-white' : 'text-gray-900'
                  }`}
              >
                {setPasswordMode ? 'Set Password' : 'Unlock Note'}
              </h2>

              <p
                className={`text-center text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
              >
                {setPasswordMode
                  ? 'Create a password to protect this note'
                  : 'Enter your password to unlock this note'}
              </p>

              {/* Input */}
              <input
                type="password"
                className={`w-full px-4 py-3 rounded-xl border text-center font-medium tracking-wide focus:outline-none focus:ring-2 transition-all ${passwordError
                  ? 'border-red-500 focus:ring-red-500 animate-shake'
                  : 'focus:ring-blue-500'
                  } ${darkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                value={setPasswordMode ? newPassword : passwordInput}
                onChange={(e) => {
                  setPasswordError(false);
                  setPasswordErrorMessage('');
                  setPasswordMode
                    ? setNewPassword(e.target.value)
                    : setPasswordInput(e.target.value);
                }}
                placeholder={setPasswordMode ? 'Enter password (min 4 chars)' : 'Enter password'}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />

              {/* Error Message */}
              {passwordError && passwordErrorMessage && (
                <div className={`mt-3 px-4 py-2.5 rounded-lg flex items-center gap-2 ${darkMode
                  ? 'bg-red-500/10 border border-red-500/20'
                  : 'bg-red-50 border border-red-200'
                  }`}>
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-red-400' : 'text-red-600'
                    }`}>
                    {passwordErrorMessage}
                  </p>
                </div>
              )}

              {/* Action Button */}
              <button
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold py-3 rounded-xl transition-all duration-150"
                onClick={handlePasswordSubmit}
              >
                {setPasswordMode ? 'Set Password' : 'Unlock'}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={deleteConfirmation.open}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmation({ open: false, noteId: null });
        }}
      >
        <AlertDialogContent className={darkMode ? 'bg-[#1a1a1a] border-gray-800 text-white' : 'bg-white'}>
          <AlertDialogHeader>
            <AlertDialogTitle className={darkMode ? 'text-white' : 'text-gray-900'}>Delete note?</AlertDialogTitle>
            <AlertDialogDescription className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
              This action cannot be undone. This will permanently delete your note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className={darkMode ? 'bg-transparent border-gray-700 hover:bg-gray-800 text-white hover:text-white' : ''}
              onClick={() => setDeleteConfirmation({ open: false, noteId: null })}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                if (deleteConfirmation.noteId) {
                  const idToDel = deleteConfirmation.noteId;
                  // Allow native Radix behavior to close the dialog first
                  setDeleteConfirmation({ open: false, noteId: null });
                  
                  // Wait for the exit animation to completely finish (300ms) before doing heavy state updates
                  setTimeout(() => {
                    deleteNote(idToDel);
                  }, 300);
                }
              }}
            >
              Delete Note
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        darkMode={darkMode}
        notes={notes}
        onSelectNote={setActiveNote}
        onNewNote={addNote}
      />
    </div>
  );
};

export default AppleNotes;