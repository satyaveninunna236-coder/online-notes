import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Sun, Moon, ChevronLeft, Pin } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { htmlToPlainText, splitNoteContent } from '@/lib/noteContent';

const Sidebar = ({
  filteredNotes,
  activeNote,
  setActiveNote,
  addNote,
  darkMode,
  setDarkMode,
  searchQuery,
  setSearchQuery,
  searchInputRef,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  togglePin,
}) => {
  const navigate = useNavigate();
  const listRef = useRef(null);
  const itemRefs = useRef({});
  const [indicator, setIndicator] = useState({
    top: 0,
    height: 0,
    visible: false,
  });


  const formatDate = (date) => {
    const now = new Date();
    const noteDate = new Date(date);

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const noteDay = new Date(
      noteDate.getFullYear(),
      noteDate.getMonth(),
      noteDate.getDate()
    );

    const diffTime = today - noteDay;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return noteDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7 && diffDays > 0) {
      return noteDate.toLocaleDateString('en-US', { weekday: 'long' });
    }
    return noteDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const previewText = (note) => {
    if (note.passwordProtected) return 'Locked Note';
    const { title, body } = splitNoteContent(note.content || '', note.title || '');
    if (!body) return '';

    let plain = htmlToPlainText(body).trim();
    const trimmedTitle = (title || '').trim();

    if (trimmedTitle && plain.toLowerCase().startsWith(trimmedTitle.toLowerCase())) {
      plain = plain.slice(trimmedTitle.length).trim();
    }

    return plain.substring(0, 60);
  };


  const updateIndicator = () => {
    const el = itemRefs.current[activeNote] || itemRefs.current[Number(activeNote)];
    if (!el) {
      setIndicator((prev) => ({ ...prev, visible: false }));
      return;
    }
    setIndicator({
      top: el.offsetTop,
      height: el.offsetHeight,
      visible: true,
    });
  };

  useLayoutEffect(() => {
    updateIndicator();
    const el = itemRefs.current[activeNote] || itemRefs.current[Number(activeNote)];
    if (el) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeNote, filteredNotes]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeNote, filteredNotes]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.target?.isContentEditable) return;

      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      if (!filteredNotes.length) return;

      e.preventDefault();
      const idx = filteredNotes.findIndex((n) => Number(n.id) === Number(activeNote));
      if (e.key === 'ArrowDown') {
        const next = filteredNotes[Math.min(idx + 1, filteredNotes.length - 1)];
        if (next) setActiveNote(next.id);
      } else {
        const prev = filteredNotes[Math.max(idx - 1, 0)];
        if (prev) setActiveNote(prev.id);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [filteredNotes, activeNote, setActiveNote]);

  return (
    <aside
      className={`
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        absolute md:relative
        w-72 md:w-[280px]
        h-full
        ${darkMode ? 'bg-[#1a1a1a]' : 'bg-white'}
        transition-transform
        duration-300
        ease-in-out
        z-30
        flex
        flex-col
      `}
    >
      <div className={`p-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            {isMobileSidebarOpen && (
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className={`md:hidden p-1 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <ChevronLeft size={20} />
              </button>
            )}

            <button
              onClick={() => navigate('/')}
              className={`
                flex items-center justify-center
                h-10 px-6 rounded-full
                text-sm font-semibold tracking-wide
                transition-all duration-200
                ${darkMode
                  ? 'bg-transparent text-white border border-gray-700 hover:bg-gray-800/40'
                  : 'bg-transparent text-gray-900 border border-gray-300 hover:bg-gray-100'
                }
              `}
            >
              <span>SCRIBYX</span>
            </button>
          </div>

          <div
            className={`
              flex items-center gap-1
              h-10 px-2 rounded-full
              ${darkMode
                ? 'bg-transparent border border-gray-700'
                : 'bg-transparent border border-gray-300'
              }
            `}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={addNote}
                  className={`
                    flex items-center justify-center
                    w-9 h-9 rounded-full
                    transition-colors duration-150
                    ${darkMode
                      ? 'text-gray-200 hover:bg-gray-800'
                      : 'text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <Plus size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>New Note</p>
              </TooltipContent>
            </Tooltip>


            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`
                    flex items-center justify-center
                    w-9 h-9 rounded-full
                    transition-colors duration-150
                    ${darkMode
                      ? 'text-gray-200 hover:bg-gray-800'
                      : 'text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Theme</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${darkMode
              ? 'bg-gray-800/50 border border-gray-800 focus-within:border-gray-700'
              : 'bg-gray-50 border border-gray-200 focus-within:border-gray-300'
            }`}
        >
          <Search size={16} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search (⌘ + k)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`flex-1 bg-transparent outline-none text-sm ${darkMode
                ? 'text-white placeholder-gray-500'
                : 'text-gray-900 placeholder-gray-400'
              }`}
          />
        </div>
      </div>

      <div
        ref={listRef}
        className={`flex-1 overflow-y-auto rounded-2xl relative
          ${darkMode
            ? 'bg-[#111111] border border-gray-800'
            : 'bg-gray-50 border border-gray-200'
          }
        `}
      >
        {filteredNotes.length === 0 ? (
          <div className={`p-8 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <p className="font-medium text-sm">No notes found for</p>
            {searchQuery && (
              <p
                className={`mt-1 text-sm font-semibold break-words ${darkMode ? 'text-white' : 'text-gray-800'
                  }`}
              >
                "{searchQuery}"
              </p>
            )}
            <p className="text-xs mt-2">Try a different keyword or create a new note.</p>
          </div>
        ) : (
          <div className="relative p-2">
            {/* Sliding active highlighter */}
            <div
              aria-hidden
              className={`absolute left-2 right-2 rounded-lg pointer-events-none z-0 transition-all duration-200 ease-out border ${darkMode
                  ? 'bg-blue-600/10 border-blue-600/20'
                  : 'bg-blue-50 border-blue-100'
                }`}
              style={{
                top: indicator.top,
                height: indicator.height,
                opacity: indicator.visible ? 1 : 0,
                transform: 'translateZ(0)',
              }}
            />

            {filteredNotes.map((note) => {
              const isActive = Number(activeNote) === Number(note.id);
              return (
                <div
                  key={note.id}
                  ref={(node) => {
                    if (node) itemRefs.current[note.id] = node;
                    else delete itemRefs.current[note.id];
                  }}
                  onClick={() => setActiveNote(note.id)}
                  className={`
                    relative z-10 p-3 mb-1 cursor-pointer rounded-lg group
                    transition-colors duration-150 border border-transparent
                    ${isActive
                      ? ''
                      : darkMode
                        ? 'hover:bg-gray-800/50'
                        : 'hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          {isActive && (
                            <div
                              className={`w-2 h-2 rounded-full shrink-0 ${darkMode ? 'bg-blue-500' : 'bg-blue-600'
                                }`}
                            />
                          )}
                          {note.isPinned && (
                            <Pin size={12} className={darkMode ? 'text-blue-400 fill-blue-400' : 'text-blue-500 fill-blue-500'} />
                          )}
                          <h3
                            className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'
                              }`}
                          >
                            {note.title}
                          </h3>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePin(note.id);
                          }}
                          className={`opacity-0 group-hover:opacity-100 transition-colors p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-white shadow-sm'}`}
                          title={note.isPinned ? 'Unpin note' : 'Pin note'}
                        >
                          <Pin size={14} className={note.isPinned ? 'text-blue-500 fill-current' : (darkMode ? 'text-gray-400' : 'text-gray-500')} />
                        </button>
                      </div>
                      <p
                        className={`text-xs truncate ${darkMode ? 'text-gray-500' : 'text-gray-500'
                          }`}
                      >
                        {previewText(note) || 'No additional text'}
                      </p>
                      <p
                        className={`text-xs mt-1 ${darkMode ? 'text-gray-600' : 'text-gray-400'
                          }`}
                      >
                        {formatDate(note.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
