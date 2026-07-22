import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, MessageSquare, ArrowUp, ArrowDown, CornerDownLeft, X } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { useFuzzySearch } from '../hooks/useFuzzySearch';

const CommandPalette = ({ isOpen, onClose, darkMode, notes = [], onSelectNote, onNewNote }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Search over the actual notes with fuzzy matching
  const filteredNotes = useFuzzySearch({
    data: notes,
    debouncedSearch,
  });

  // Limit to top 5 recent or matched chats
  const displayNotes = filteredNotes.slice(0, 5);

  // The first item is "New Chat", followed by the matched/recent notes
  const totalItems = 1 + displayNotes.length;

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      // Focus input when opened
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex === 0) {
          if (onNewNote) onNewNote(searchQuery);
          onClose();
        } else {
          const selectedNote = displayNotes[selectedIndex - 1];
          if (selectedNote && onSelectNote) {
            onSelectNote(selectedNote.id);
          }
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, totalItems, onClose]);

  if (!isOpen) return null;

  // Use dynamic colors based on darkMode prop
  const bgMain = darkMode ? '#0A0A0A' : '#FFFFFF';
  const bgOverlay = darkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.4)';
  const borderCol = darkMode ? '#262626' : '#E5E5E5';
  const bgHover = darkMode ? '#1A1A1A' : '#F3F4F6';
  const textPrimary = darkMode ? '#F5F5F5' : '#111827';
  const textSecondary = darkMode ? '#A3A3A3' : '#6B7280';
  const textMuted = darkMode ? '#737373' : '#9CA3AF';

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] animate-fade-in"
      style={{ backgroundColor: bgOverlay, backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-slide-in-up"
        style={{ backgroundColor: bgMain, border: `1px solid ${borderCol}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Area */}
        <div className="flex items-center px-4 py-4 border-b" style={{ borderColor: borderCol }}>
          <Search size={20} style={{ color: textSecondary }} className="mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-neutral-500"
            style={{ color: textPrimary }}
            placeholder="Search notes by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => {
                setSearchQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors ml-2 flex-shrink-0"
              title="Clear search"
            >
              <X size={16} style={{ color: textSecondary }} />
            </button>
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden p-2 scrollbar-thin">
          
          {/* CHATS Section */}
          <div className="px-3 py-2">
            <h3 className="text-xs font-semibold tracking-wider mb-2" style={{ color: textMuted }}>
              CHATS
            </h3>
            
            {/* New Chat Action (Index 0) */}
            <div 
              className="flex items-center px-3 py-3 rounded-lg cursor-pointer transition-colors"
              style={selectedIndex === 0 ? { backgroundColor: bgHover } : {}}
              onMouseEnter={() => setSelectedIndex(0)}
              onClick={() => {
                if (onNewNote) onNewNote(searchQuery);
                onClose();
              }}
            >
              <Plus size={18} style={{ color: textSecondary }} className="mr-4 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium" style={{ color: textPrimary }}>
                  {searchQuery.trim() && displayNotes.length === 0 ? `New Chat with "${searchQuery.trim()}"` : 'New Chat'}
                </div>
                <div className="text-xs mt-0.5" style={{ color: textSecondary }}>Start a new conversation</div>
              </div>
            </div>
          </div>

          {/* RESULTS Section */}
          <div className="px-3 py-2 mt-2">
            <h3 className="text-xs font-semibold tracking-wider mb-2" style={{ color: textMuted }}>
              {searchQuery.trim() ? 'SEARCH RESULTS' : 'RECENT'}
            </h3>
            
            <div className="flex flex-col gap-1">
              {displayNotes.length === 0 ? (
                <div className="px-3 py-8 text-sm text-center" style={{ color: textMuted }}>
                  No results found for "{searchQuery}"
                </div>
              ) : (
                displayNotes.map((note, idx) => {
                  // The index for notes is offset by 1 because of "New Chat"
                  const itemIndex = idx + 1;
                  const isSelected = selectedIndex === itemIndex;
                  
                  return (
                    <div 
                      key={note.id}
                      className="flex items-center px-3 py-3 rounded-lg cursor-pointer transition-colors"
                      style={isSelected ? { backgroundColor: bgHover } : {}}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      onClick={() => {
                        if (onSelectNote) onSelectNote(note.id);
                        onClose();
                      }}
                    >
                      <MessageSquare size={18} style={{ color: textSecondary }} className="mr-4 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium" style={{ color: textPrimary }}>{note.title || 'Untitled Note'}</div>
                        <div className="text-xs mt-0.5 line-clamp-1" style={{ color: textSecondary }}>
                          {note.content?.substring(0, 50) || 'No content'}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t flex items-center justify-between text-xs" style={{ borderColor: borderCol, color: textMuted }}>
          <div>{totalItems} result(s)</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="flex items-center justify-center w-5 h-5 rounded border" style={{ backgroundColor: bgHover, borderColor: borderCol }}>
                <ArrowUp size={12} />
              </span>
              <span className="flex items-center justify-center w-5 h-5 rounded border" style={{ backgroundColor: bgHover, borderColor: borderCol }}>
                <ArrowDown size={12} />
              </span>
              <span>Navigate</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <span className="flex items-center justify-center w-6 h-5 rounded border" style={{ backgroundColor: bgHover, borderColor: borderCol }}>
                <CornerDownLeft size={12} />
              </span>
              <span>Select</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="flex items-center justify-center px-1.5 h-5 rounded border font-medium" style={{ backgroundColor: bgHover, borderColor: borderCol }}>
                Esc
              </span>
              <span>Close</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default CommandPalette;
