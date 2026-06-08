import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bold, Italic, Underline, Type, Menu, Lock, Moon, Search, Settings, ChevronUp, ChevronDown, Fullscreen, Unlock, ShieldOff, Trash2, Mic } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import AudioRecorder from './AudioRecorder';

const FormattingToolbar = ({
  currentNote,
  setIsMobileSidebarOpen,
  globalIsBold,
  setGlobalIsBold,
  globalIsItalic,
  setGlobalIsItalic,
  globalIsUnderline,
  setGlobalIsUnderline,
  globalFontSize,
  handleFontSizeChange,
  globalTextColor,
  setGlobalTextColor,
  darkMode,
  contentRef,
  onSetPassword,
  onLockNote,
  onRemovePassword,
  lastPassword,
  onDropdownStateChange,
  isFullscreen,
  setIsFullscreen,
  updateNoteFormatting,
  updateNoteContent,
  cursorPosition
}) => {
  const [isAudioRecorderOpen, setIsAudioRecorderOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef(null);
  const mobileSettingsRef = useRef(null);
  const colorPickerRef = useRef(null);
  const [, setUpdateTrigger] = useState(0); // For forcing re-renders to update time
  
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

  // Update the time display every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateTrigger(prev => prev + 1);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Smart format: show "Created" if never edited, "Last edited" if edited
  const formatNoteTime = (note) => {
    const now = new Date();

    // Check if note has been edited (lastEditedAt exists and is not null)
    const hasBeenEdited = note.lastEditedAt && note.lastEditedAt !== null;

    // Use the appropriate timestamp
    const relevantDate = hasBeenEdited ? new Date(note.lastEditedAt) : new Date(note.createdAt || note.timestamp);
    const prefix = hasBeenEdited ? 'Last edited' : 'Created';

    const diffMs = now - relevantDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    // Get the start of today and the note's day (midnight) for accurate day comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const noteDay = new Date(relevantDate.getFullYear(), relevantDate.getMonth(), relevantDate.getDate());
    const diffTime = today - noteDay;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return `${prefix} just now`;
    } else if (diffMins < 60) {
      return `${prefix} ${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${prefix} ${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays === 0) {
      return `${prefix} today at ${relevantDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `${prefix} yesterday`;
    } else if (diffDays < 7) {
      return `${prefix} on ${relevantDate.toLocaleDateString('en-US', { weekday: 'long' })}`;
    } else {
      return `${prefix} on ${relevantDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: diffDays > 365 ? 'numeric' : undefined })}`;
    }
  };

  // Notify parent about dropdown state changes
  useEffect(() => {
    if (onDropdownStateChange) {
      onDropdownStateChange(isSearchOpen || isSettingsOpen);
    }
  }, [isSearchOpen, isSettingsOpen, onDropdownStateChange]);

  const handleSearch = (value) => {
    setSearchQuery(value);

    if (!value || !contentRef?.current) {
      setTotalMatches(0);
      setCurrentMatchIndex(0);
      return;
    }

    const content = currentNote.content.toLowerCase();
    const searchTerm = value.toLowerCase();

    // Count total matches
    const matches = [];
    let index = content.indexOf(searchTerm);
    while (index !== -1) {
      matches.push(index);
      index = content.indexOf(searchTerm, index + 1);
    }

    setTotalMatches(matches.length);
    setCurrentMatchIndex(matches.length > 0 ? 0 : 0);
  };

  const navigateMatch = useCallback((direction) => {
    if (!searchQuery || totalMatches === 0 || !contentRef?.current) return;

    const content = currentNote.content.toLowerCase();
    const searchTerm = searchQuery.toLowerCase();

    // Find all matches from top to bottom
    const matches = [];
    let index = content.indexOf(searchTerm);
    while (index !== -1) {
      matches.push(index);
      index = content.indexOf(searchTerm, index + 1);
    }

    // Calculate new index
    let newIndex = currentMatchIndex + direction;
    if (newIndex < 0) newIndex = matches.length - 1;
    if (newIndex >= matches.length) newIndex = 0;

    setCurrentMatchIndex(newIndex);

    // Highlight the match and scroll to it
    const matchPos = matches[newIndex];
    const textarea = contentRef.current;

    // Set selection
    textarea.focus();
    textarea.setSelectionRange(matchPos, matchPos + searchQuery.length);

    // Calculate proper scroll position
    const textBeforeMatch = content.substring(0, matchPos);
    const linesBeforeMatch = textBeforeMatch.split('\n').length;
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 24;
    const targetScroll = (linesBeforeMatch - 3) * lineHeight; // Show match near top with some padding

    textarea.scrollTop = Math.max(0, targetScroll);
  }, [searchQuery, totalMatches, contentRef, currentNote.content, currentMatchIndex]);

  const handleInsertText = (text) => {
    if (!contentRef.current || !updateNoteContent) return;

    const currentText = currentNote.content || '';
    
    // Use the absolute cursorPosition tracked from TextEditor
    const start = cursorPosition || 0;
    const end = cursorPosition || 0;

    // Insert text at absolute cursor position
    const textToInsert = (start > 0 && currentText[start - 1] !== ' ' && currentText[start - 1] !== '\n' ? ' ' : '') + text; // Add leading space if needed
    const newText = currentText.substring(0, start) + textToInsert + currentText.substring(end);

    updateNoteContent(newText);
  };


  // Reset search when note changes
  useEffect(() => {
    setSearchQuery('');
    setCurrentMatchIndex(0);
    setTotalMatches(0);
  }, [currentNote.id]);

  useEffect(() => {
    if (!isSearchOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
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
        mobileSettingsRef.current && !mobileSettingsRef.current.contains(e.target)) {
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
        {/* Top Row - Title and Menu */}
        <div className={`flex flex-col md:flex-row md:items-center md:justify-between px-3 py-2 gap-2`}>
          {/* Left Section - Title */}
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className={`md:hidden p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
            >
              <Menu size={20} />
            </button>
            <div className="grid grid-cols-[1fr_auto] items-start w-full gap-3">
              {/* Heading */}
              <div className="min-w-0">
                {/* Note Title */}
                <div className="flex flex-col leading-tight">
                  <h2
                    className={`text-[17px] md:text-lg font-semibold line-clamp-1 break-all ${darkMode ? 'text-white' : 'text-gray-900'
                      }`}
                  >
                    {currentNote.title}
                  </h2>

                  {/* Sub status */}
                  <span
                    className={`text-xs font-medium tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                  >
                    {formatNoteTime(currentNote)}
                  </span>
                </div>
              </div>
              {/* Action Icons - Mobile placement */}
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
                        onClick={() => setIsSearchOpen(prev => !prev)}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150 active:scale-95 ${darkMode
                          ? 'hover:bg-gray-800 text-gray-300'
                          : 'hover:bg-white text-gray-700'
                          }`}
                      >
                        <Search size={18} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Search in Note</p>
                    </TooltipContent>
                  </Tooltip>

                  <div className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-150 active:scale-95">
                    {/* Fullscreen button - visible on md+ screens */}
                    <button
                      className={`hidden md:flex items-center justify-center w-full h-full rounded-xl transition-all duration-150 active:scale-95 ${isFullscreen
                        ? darkMode
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-500 text-white'
                        : darkMode
                          ? 'hover:bg-gray-800 text-gray-300'
                          : 'hover:bg-white text-gray-700'
                        }`}
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
                    >
                      <Fullscreen size={18} />
                    </button>

                    {/* Trash button - visible on small screens, now deletes note */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className={`flex md:hidden items-center justify-center w-full h-full rounded-xl transition-all duration-150 active:scale-95 ${darkMode
                            ? 'hover:bg-gray-800 text-gray-300'
                            : 'hover:bg-white text-gray-700'
                            }`}
                          onClick={() => {
                            const event = new KeyboardEvent('keydown', {
                              key: 'Delete',
                              ctrlKey: true,
                              code: 'Delete'
                            });
                            window.dispatchEvent(event);
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete Note</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>




                  <div className="relative" ref={mobileSettingsRef}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setIsSettingsOpen(prev => !prev)}
                          className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150 active:scale-95 ${darkMode
                            ? 'hover:bg-gray-800 text-gray-300'
                            : 'hover:bg-white text-gray-700'
                            }`}
                        >
                          <Settings size={18} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Settings</p>
                      </TooltipContent>
                    </Tooltip>

                    {isSettingsOpen && (
                      <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-lg border z-50 py-1 ${darkMode
                        ? 'bg-[#111111] border-gray-700'
                        : 'bg-white border-gray-200'
                        }`}>
                        {/* Set Password Option */}
                        <button
                          onClick={() => {
                            setIsSettingsOpen(false);
                            onSetPassword(currentNote.id);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${darkMode
                            ? 'hover:bg-gray-800 text-gray-200'
                            : 'hover:bg-gray-100 text-gray-700'
                            }`}
                        >
                          <Lock size={16} className="text-blue-500" />
                          <span>Set Password</span>
                        </button>

                        {/* Lock Note Option - only show if password is already set */}
                        {lastPassword && !currentNote.passwordProtected && (
                          <button
                            onClick={() => {
                              setIsSettingsOpen(false);
                              onLockNote(currentNote.id);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${darkMode
                              ? 'hover:bg-gray-800 text-gray-200'
                              : 'hover:bg-gray-100 text-gray-700'
                              }`}
                          >
                            <Lock size={16} className="text-yellow-500" />
                            <span>Lock Note Now</span>
                          </button>
                        )}

                        {/* Remove Password Option - only show if encrypted content exists */}
                        {currentNote.encryptedContent && (
                          <>
                            <div className={`h-px my-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
                            <button
                              onClick={() => {
                                setIsSettingsOpen(false);
                                onRemovePassword(currentNote.id);
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${darkMode
                                ? 'hover:bg-gray-800 text-red-400'
                                : 'hover:bg-gray-100 text-red-600'
                                }`}
                            >
                              <ShieldOff size={16} />
                              <span>Remove Password</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>


          <div
            className={`flex items-center justify-start gap-2 px-3 py-2 border-t flex-wrap rounded-2xl mx-2 mb-2 shadow-sm ${darkMode ? 'bg-[#111111] border-gray-700' : 'bg-gray-200 border-gray-200'
              }`}
          >
            {/* Text Formatting Group */}
            <div className={`flex items-center gap-1 p-1.5 rounded-xl md:shrink-0 shadow-inner ${darkMode ? 'bg-gray-800/60' : 'bg-white'
              }`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setGlobalIsBold(!globalIsBold)}
                    className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all duration-150 active:scale-95 ${globalIsBold
                      ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
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
                    onClick={() => setGlobalIsItalic(!globalIsItalic)}
                    className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all duration-150 active:scale-95 ${globalIsItalic
                      ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
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
                    onClick={() => setGlobalIsUnderline(!globalIsUnderline)}
                    className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all duration-150 active:scale-95 ${globalIsUnderline
                      ? darkMode ? 'bg-blue-600 text-white ' : 'bg-blue-500 text-white  '
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
            </div>

            {/* Font Size Control */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-2xl md:shrink-0 shadow-inner ${darkMode ? 'bg-gray-800/60' : 'bg-white'
              }`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleFontSizeChange(-1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-2xl text-sm transition-all active:scale-95 ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                      }`}
                  >
                    −
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Decrease font size</p>
                </TooltipContent>
              </Tooltip>

              <span className={`w-10 h-8 flex items-center justify-center text-sm font-medium rounded-md ${darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                {globalFontSize}
              </span>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleFontSizeChange(1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-2xl text-sm transition-all active:scale-95 ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                      }`}
                  >
                    +
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Increase font size</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Color Picker */}
            <div className="relative md:shrink-0" ref={colorPickerRef}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                    className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all duration-150 active:scale-95 ${
                      isColorPickerOpen
                        ? darkMode ? 'bg-gray-700' : 'bg-gray-200'
                        : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-500 shadow-sm transition-transform hover:scale-110"
                      style={{ backgroundColor: globalTextColor }}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Text Color</p>
                </TooltipContent>
              </Tooltip>

              {isColorPickerOpen && (
                <div className={`absolute left-0 md:left-auto md:right-0 mt-2 p-2 w-48 grid grid-cols-5 gap-2 rounded-xl shadow-xl border z-50 animate-fade-in ${darkMode
                  ? 'bg-[#111111] border-gray-700'
                  : 'bg-white border-gray-200'
                  }`}>
                  {PRESET_COLORS.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setGlobalTextColor(color.value);
                        setIsColorPickerOpen(false);
                      }}
                      title={color.name}
                      className={`w-6 h-6 rounded-full border transition-all duration-150 hover:scale-110 active:scale-95 ${
                        globalTextColor === color.value 
                          ? (darkMode ? 'border-white ring-2 ring-blue-500' : 'border-gray-900 ring-2 ring-blue-400') 
                          : (darkMode ? 'border-gray-600' : 'border-gray-300')
                      }`}
                      style={{ backgroundColor: color.value }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Audio Recorder Button */}
            <div className={`hidden md:flex items-center gap-1 p-1.5 rounded-xl md:shrink-0 shadow-inner ${darkMode ? 'bg-gray-800/60' : 'bg-white'
              }`}>
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
                <TooltipContent>
                  <p>Voice to Text</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          {isSearchOpen && (
            <div className={`static mt-3 mx-3 md:mx-0 md:absolute md:right-4 md:top-full md:mt-3 z-50 flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg border w-full md:w-auto ${darkMode
              ? 'bg-[#111111] border-gray-700'
              : 'bg-white border-gray-200'
              }`}>
              <input
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
                  setTotalMatches(0);
                  setCurrentMatchIndex(0);
                }}
                className={`text-xs px-2 py-1 rounded-md shrink-0 flex items-center justify-center ${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                  }`}
              >
                ✕
              </button>
            </div>
          )}
          {/* Action Icons - Desktop (after toolbar) */}
          <div className="hidden md:flex justify-end px-3 pb-2">
            <div
              className={`flex items-center gap-1 p-1.5 rounded-2xl shadow-sm ${darkMode ? 'bg-[#111111]' : 'bg-gray-100'
                }`}
            >

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setIsSearchOpen(prev => !prev)}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150 active:scale-95 ${darkMode
                      ? 'hover:bg-gray-800 text-gray-300'
                      : 'hover:bg-white text-gray-700'
                      }`}
                  >
                    <Search size={18} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Search</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150 active:scale-95 ${isFullscreen
                      ? darkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : darkMode
                        ? 'hover:bg-gray-800 text-gray-300'
                        : 'hover:bg-white text-gray-700'
                      }`}
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    <Fullscreen size={18} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</p>
                </TooltipContent>
              </Tooltip>

              <div className="relative" ref={settingsRef}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setIsSettingsOpen(prev => !prev)}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150 active:scale-95 ${darkMode
                        ? 'hover:bg-gray-800 text-gray-300'
                        : 'hover:bg-white text-gray-700'
                        }`}
                    >
                      <Settings size={18} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Settings</p>
                  </TooltipContent>
                </Tooltip>

                {isSettingsOpen && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-lg border z-50 py-1 ${darkMode
                    ? 'bg-[#111111] border-gray-700'
                    : 'bg-white border-gray-200'
                    }`}>
                    {/* Set Password Option */}
                    <button
                      onClick={() => {
                        setIsSettingsOpen(false);
                        onSetPassword(currentNote.id);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${darkMode
                        ? 'hover:bg-gray-800 text-gray-200'
                        : 'hover:bg-gray-100 text-gray-700'
                        }`}
                    >
                      <Lock size={16} className="text-blue-500" />
                      <span>Set Password</span>
                    </button>

                    {/* Lock Note Option - only show if password is already set */}
                    {lastPassword && !currentNote.passwordProtected && (
                      <button
                        onClick={() => {
                          setIsSettingsOpen(false);
                          onLockNote(currentNote.id);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${darkMode
                          ? 'hover:bg-gray-800 text-gray-200'
                          : 'hover:bg-gray-100 text-gray-700'
                          }`}
                      >
                        <Lock size={16} className="text-yellow-500" />
                        <span>Lock Note Now</span>
                      </button>
                    )}

                    {/* Remove Password Option - only show if encrypted content exists */}
                    {currentNote.encryptedContent && (
                      <>
                        <div className={`h-px my-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
                        <button
                          onClick={() => {
                            setIsSettingsOpen(false);
                            onRemovePassword(currentNote.id);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${darkMode
                            ? 'hover:bg-gray-800 text-red-400'
                            : 'hover:bg-gray-100 text-red-600'
                            }`}
                        >
                          <ShieldOff size={16} />
                          <span>Remove Password</span>
                        </button>
                      </>
                    )}

                    {/* Divider */}
                    <div className={`h-px my-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />

                    {/* Delete Note - ALWAYS visible on desktop */}
                    <button
                      onClick={() => {
                        setIsSettingsOpen(false);
                        const event = new KeyboardEvent('keydown', {
                          key: 'Delete',
                          ctrlKey: true,
                          code: 'Delete'
                        });
                        window.dispatchEvent(event);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${darkMode
                        ? 'hover:bg-gray-800 text-red-400'
                        : 'hover:bg-gray-100 text-red-600'
                        }`}
                    >
                      <Trash2 size={16} />
                      <span>Delete Note</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row - Formatting Tools (All in Single Div) */}
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