import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bold, Italic, Underline, Menu, Lock, Search, ChevronUp, ChevronDown, Fullscreen, ShieldOff, Trash2, Mic, MoreVertical, Check, List, ListOrdered, Palette } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import AudioRecorder from './AudioRecorder';
import DesktopRichToolbar from './DesktopRichToolbar';
import { findTextMatchesInEditor, FONT_SIZES } from '@/lib/noteContent';

const FormattingToolbar = ({
  currentNote,
  setIsMobileSidebarOpen,
  darkMode,
  contentRef,
  editor,
  onSetPassword,
  onLockNote,
  onRemovePassword,
  lastPassword,
  onDropdownStateChange,
  isFullscreen,
  setIsFullscreen,
}) => {
  const [isAudioRecorderOpen, setIsAudioRecorderOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchStorage = editor?.storage.search || { results: [], currentIndex: 0 };
  const totalMatches = searchStorage.results.length;
  const currentMatchIndex = searchStorage.currentIndex;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef(null);
  const mobileSettingsRef = useRef(null);
  const desktopToolbarSettingsRef = useRef(null);
  const searchInputRef = useRef(null);
  const colorPickerRef = useRef(null);
  const [, setEditorTick] = useState(0);

  useEffect(() => {
    if (!editor) return undefined;
    const refresh = () => setEditorTick((t) => t + 1);
    editor.on('selectionUpdate', refresh);
    editor.on('transaction', refresh);
    return () => {
      editor.off('selectionUpdate', refresh);
      editor.off('transaction', refresh);
    };
  }, [editor]);

  // Scroll to active match when it changes
  useEffect(() => {
    if (totalMatches > 0 && isSearchOpen) {
      requestAnimationFrame(() => {
        const activeHighlight = document.querySelector('.search-result-active');
        if (activeHighlight) {
          activeHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
  }, [currentMatchIndex, totalMatches, isSearchOpen]);

  const PRESET_COLORS = [
    { name: 'Default', value: darkMode ? '#ffffff' : '#000000' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Gray', value: '#6b7280' },
  ];

  const isBold = editor?.isActive('bold') ?? false;
  const isItalic = editor?.isActive('italic') ?? false;
  const isUnderline = editor?.isActive('underline') ?? false;
  const activeColor = editor?.getAttributes('textStyle')?.color || (darkMode ? '#ffffff' : '#000000');
  const activeFontSizeValue = editor?.getAttributes('textStyle')?.fontSize || '';
  const activeFontSize =
    FONT_SIZES.find((s) => s.value === activeFontSizeValue) || FONT_SIZES[0];

  const menuPanelClass = `w-52 ${darkMode ? 'bg-[#111111] border-gray-700' : 'bg-white border-gray-200'
    }`;

  const renderSettingsMenuItems = (includeDelete, includeFullscreen = true) => (
    <>
      <DropdownMenuItem
        onClick={() => {
          setIsSearchOpen(true);
        }}
        className="cursor-pointer"
      >
        <Search className="text-gray-500 mr-2" size={16} />
        <span>Search in note</span>
      </DropdownMenuItem>

      {includeFullscreen && (
        <>
          <DropdownMenuItem
            onClick={() => {
              setIsFullscreen(!isFullscreen);
            }}
            className="cursor-pointer"
          >
            <Fullscreen className={`mr-2 ${isFullscreen ? 'text-blue-500' : 'text-gray-500'}`} size={16} />
            <span>{isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}</span>
          </DropdownMenuItem>

          <div className={`h-px my-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
        </>
      )}

      <DropdownMenuItem
        onClick={() => {
          onSetPassword(currentNote.id);
        }}
        className="cursor-pointer"
      >
        <Lock className="text-gray-500 mr-2" size={16} />
        <span>Set Password</span>
      </DropdownMenuItem>

      {lastPassword && !currentNote.passwordProtected && (
        <DropdownMenuItem
          onClick={() => {
            onLockNote(currentNote.id);
          }}
          className="cursor-pointer"
        >
          <Lock className="text-yellow-500 mr-2" size={16} />
          <span>Lock Note Now</span>
        </DropdownMenuItem>
      )}

      {currentNote.encryptedContent && (
        <DropdownMenuItem
          onClick={() => {
            onRemovePassword(currentNote.id);
          }}
          className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-500 dark:focus:bg-red-950/50"
        >
          <ShieldOff size={16} className="mr-2" />
          <span>Remove Password</span>
        </DropdownMenuItem>
      )}

      {includeDelete && (
        <>
          <div className={`h-px my-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
          <DropdownMenuItem
            onClick={() => {
              // Defer the event dispatch to prevent Radix UI pointer-events lock collisions.
              // The DropdownMenu must fully close before the AlertDialog opens.
              setTimeout(() => {
                window.dispatchEvent(
                  new KeyboardEvent('keydown', {
                    key: 'Delete',
                    ctrlKey: true,
                    code: 'Delete',
                  })
                );
              }, 150);
            }}
            className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-500 dark:focus:bg-red-950/50"
          >
            <Trash2 size={16} className="mr-2" />
            <span className="font-medium">Delete Note</span>
          </DropdownMenuItem>
        </>
      )}

    </>
  );

  useEffect(() => {
    if (onDropdownStateChange) {
      onDropdownStateChange(isSearchOpen || isSettingsOpen);
    }
  }, [isSearchOpen, isSettingsOpen, onDropdownStateChange]);

  const handleSearch = (value) => {
    setSearchQuery(value);
    if (editor) {
      editor.commands.setSearchTerm(value.trim());
    }
  };

  const navigateMatch = useCallback((direction) => {
    if (!editor || totalMatches === 0) return;
    if (direction === 1) {
      editor.commands.nextMatch();
    } else {
      editor.commands.prevMatch();
    }
  }, [editor, totalMatches]);

  const handleInsertText = (text) => {
    if (contentRef?.current?.insertText) {
      contentRef.current.insertText(text);
      return;
    }
    if (editor) {
      editor.chain().focus().insertContent(text).run();
    }
  };


  useEffect(() => {
    setSearchQuery('');
    if (editor) {
      editor.commands.clearSearch();
    }
  }, [currentNote.id, editor]);

  useEffect(() => {
    if (!isSearchOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setSearchQuery('');
        if (editor) editor.commands.clearSearch();
        return;
      }

      if (e.key === 'Enter' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (e.key === 'ArrowUp') {
          navigateMatch(-1);
        } else {
          navigateMatch(1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchOpen, searchQuery, totalMatches, currentMatchIndex, navigateMatch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target) &&
        mobileSettingsRef.current && !mobileSettingsRef.current.contains(e.target) &&
        desktopToolbarSettingsRef.current && !desktopToolbarSettingsRef.current.contains(e.target)) {
        setIsSettingsOpen(false);
      }
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target)) {
        setIsColorPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <>
      <div className={`relative flex flex-col border-b w-full ${darkMode ? 'border-gray-800 bg-[#1a1a1a]' : 'border-gray-100 bg-white'
        }`}>
        <div className={`flex items-center justify-between px-3 py-2 gap-2`}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className={`md:hidden p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="flex md:hidden items-center gap-1 shrink-0">
            <div
              className={`flex items-center gap-1 p-1.5 rounded-2xl shadow-sm ${darkMode ? 'bg-[#111111]' : 'bg-gray-100'
                }`}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setIsAudioRecorderOpen(true)}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150 active:scale-95 ${isAudioRecorderOpen
                      ? darkMode ? 'bg-red-600 text-white' : 'bg-red-500 text-white'
                      : darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-white text-gray-700'
                      }`}
                  >
                    <Mic size={18} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Voice to Text</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-150 active:scale-95 ${darkMode
                      ? 'hover:bg-gray-800 text-gray-300'
                      : 'hover:bg-white text-gray-700'
                      }`}
                    onClick={() => {
                      window.dispatchEvent(
                        new KeyboardEvent('keydown', {
                          key: 'Delete',
                          ctrlKey: true,
                          code: 'Delete',
                        })
                      );
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Note</p>
                </TooltipContent>
              </Tooltip>

              <DropdownMenu onOpenChange={setIsSettingsOpen}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150 active:scale-95 ${isSettingsOpen
                            ? darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'
                            : darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-white text-gray-700'
                          }`}
                        aria-label="More options"
                      >
                        <MoreVertical size={18} />
                      </button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>More</p>
                  </TooltipContent>
                </Tooltip>

                <DropdownMenuContent align="end" sideOffset={8} className={menuPanelClass}>
                  {renderSettingsMenuItems(false, false)}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div
          className={`flex items-center justify-start gap-2 px-3 py-2 border-t flex-wrap rounded-2xl mx-auto mb-2 shadow-sm w-fit ${darkMode ? 'bg-[#111111] border-gray-700' : 'bg-gray-200 border-gray-200'
            }`}
        >
          <DesktopRichToolbar
            editor={editor}
            darkMode={darkMode}
            rightSlot={
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setIsAudioRecorderOpen(true)}
                      className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all duration-150 active:scale-95 ${isAudioRecorderOpen
                        ? darkMode ? 'bg-red-600 text-white' : 'bg-red-500 text-white'
                        : darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                        }`}
                    >
                      <Mic size={18} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p>Voice to Text</p></TooltipContent>
                </Tooltip>

                <DropdownMenu onOpenChange={setIsSettingsOpen}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          aria-label="More options"
                          className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all duration-150 active:scale-95 ${isSettingsOpen
                              ? darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'
                              : darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                            }`}
                        >
                          <MoreVertical size={16} />
                        </button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent><p>More options</p></TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end" sideOffset={8} className={menuPanelClass}>
                    {renderSettingsMenuItems(true, true)}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            }
          />

          {/* Mobile / tablet formatting */}
          <div className={`flex lg:hidden items-center gap-1 p-1.5 rounded-xl md:shrink-0 shadow-inner ${darkMode ? 'bg-gray-800/60' : 'bg-white'
            }`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="Bold"
                  aria-pressed={isBold}
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all duration-150 active:scale-95 ${isBold
                    ? 'bg-blue-600 text-white'
                    : darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                    }`}
                >
                  <Bold size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bold</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="Italic"
                  aria-pressed={isItalic}
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all duration-150 active:scale-95 ${isItalic
                    ? 'bg-blue-600 text-white'
                    : darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                    }`}
                >
                  <Italic size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Italic</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="Underline"
                  aria-pressed={isUnderline}
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all duration-150 active:scale-95 ${isUnderline
                    ? 'bg-blue-600 text-white'
                    : darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                    }`}
                >
                  <Underline size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Underline</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="Bullet list"
                  aria-pressed={editor?.isActive('bulletList')}
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all duration-150 active:scale-95 ${editor?.isActive('bulletList')
                    ? 'bg-blue-600 text-white'
                    : darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                    }`}
                >
                  <List size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bullet list</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="Numbered list"
                  aria-pressed={editor?.isActive('orderedList')}
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all duration-150 active:scale-95 ${editor?.isActive('orderedList')
                    ? 'bg-blue-600 text-white'
                    : darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                    }`}
                >
                  <ListOrdered size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Numbered list</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Font size dropdown — selection scoped (mobile / tablet) */}
          <div className={`flex lg:hidden items-center gap-1 px-1.5 py-1 rounded-2xl md:shrink-0 shadow-inner ${darkMode ? 'bg-gray-800/60' : 'bg-white'
            }`}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`h-9 px-2.5 flex items-center gap-1 rounded-2xl text-sm font-medium transition-all ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
                    }`}
                  aria-label="Font size"
                >
                  <span>{activeFontSize.value ? activeFontSize.label : 'Size'}</span>
                  <ChevronDown size={14} className="opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className={`w-36 ${darkMode ? 'bg-[#111111] border-gray-700 text-gray-100' : 'bg-white border-gray-200'}`}
              >
                {FONT_SIZES.map((size) => {
                  const selected = activeFontSize.value === size.value;
                  return (
                    <DropdownMenuItem
                      key={size.label}
                      onClick={() => {
                        if (!size.value) {
                          editor?.chain().focus().unsetFontSize().run();
                        } else {
                          editor?.chain().focus().setFontSize(size.value).run();
                        }
                      }}
                      className={`flex items-center justify-between gap-2 ${darkMode ? 'focus:bg-gray-800' : ''}`}
                    >
                      <span>{size.label}</span>
                      {selected && <Check size={14} className="text-blue-500" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Color Picker — mobile/tablet; desktop has its own in rich toolbar */}
          <div className="relative md:shrink-0 lg:hidden">
            <Popover open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <button
                      className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all duration-150 active:scale-95 ${isColorPickerOpen
                        ? darkMode ? 'bg-gray-700' : 'bg-gray-200'
                        : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                        }`}
                    >
                      <Palette size={16} className={darkMode ? 'text-gray-300' : 'text-gray-700'} />
                      {activeColor && (
                        <div
                          className="absolute bottom-1 w-4 h-0.5 rounded-full"
                          style={{ backgroundColor: activeColor }}
                        />
                      )}
                    </button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Text Color</p>
                </TooltipContent>
              </Tooltip>

              <PopoverContent 
                className={`w-48 p-2 rounded-xl shadow-xl border z-50 ${darkMode ? 'bg-[#111111] border-gray-700' : 'bg-white border-gray-200'}`}
                align="center"
              >
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_COLORS.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        editor?.chain().focus().setColor(color.value).run();
                        setIsColorPickerOpen(false);
                      }}
                      title={color.name}
                      className={`w-6 h-6 rounded-full border transition-all duration-150 hover:scale-110 active:scale-95 flex items-center justify-center ${activeColor === color.value
                        ? (darkMode ? 'border-white ring-2 ring-blue-500' : 'border-gray-900 ring-2 ring-blue-500')
                        : (darkMode ? 'border-gray-600' : 'border-gray-300')
                        }`}
                      style={{ backgroundColor: color.value }}
                    >
                      {activeColor === color.value && <Check size={12} className={color.value === '#ffffff' ? 'text-black' : 'text-white'} />}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

        </div>
        {isSearchOpen && (
          <div className={`static mt-3 mx-3 md:mx-0 md:absolute md:right-4 md:top-full md:mt-3 z-50 flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg border w-[calc(100%-1.5rem)] md:w-auto ${darkMode
            ? 'bg-[#111111] border-gray-700'
            : 'bg-white border-gray-200'
            }`}>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search in note..."
              autoFocus
              className={`flex-1 min-w-0 text-sm outline-none bg-transparent ${darkMode ? 'text-white placeholder-gray-400' : 'text-gray-800 placeholder-gray-500'
                }`}
            />
            {totalMatches > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                <span className={`text-xs font-medium whitespace-nowrap ${darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`} title="Click arrows to jump to matches">
                  {currentMatchIndex + 1}/{totalMatches}
                </span>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => navigateMatch(-1)}
                    className={`p-1 rounded transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    title="Previous match (selects text)"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() => navigateMatch(1)}
                    className={`p-1 rounded transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    title="Next match (selects text)"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
              </div>
            )}
            <button
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
                if (editor) editor.commands.clearSearch();
              }}
              className={`text-xs px-2 py-1 rounded-md shrink-0 flex items-center justify-center ${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                }`}
            >
              ✕
            </button>
          </div>
        )}
      </div>
      <AudioRecorder
        isOpen={isAudioRecorderOpen}
        onClose={() => setIsAudioRecorderOpen(false)}
        onInsert={handleInsertText}
        darkMode={darkMode}
      />
    </>
  );
};

export default FormattingToolbar;