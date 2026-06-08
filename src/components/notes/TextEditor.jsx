import React, { useRef, useEffect } from 'react';

const TextEditor = ({
  contentRef,
  currentNote,
  updateNoteContent,
  handleSelectionChange,
  handlePaste,
  darkMode,
  globalTextColor,
  globalFontSize,
  globalIsBold,
  globalIsItalic,
  globalIsUnderline
}) => {
  const titleRef = useRef(null);
  const bodyRef = useRef(null);

  // Derive title and body from currentNote.content directly
  const content = currentNote.content || '';
  const firstLineEnd = content.indexOf('\n');
  let title = '';
  let body = '';

  if (firstLineEnd === -1) {
    title = content;
    body = '';
  } else {
    title = content.substring(0, firstLineEnd);
    body = content.substring(firstLineEnd + 1);
  }

  const handleTitleChange = (e) => {
    const newTitle = e.target.value.replace(/\n/g, ''); // Prevent newlines in title
    updateNoteContent(newTitle + '\n' + body);
  };

  const handleBodyChange = (e) => {
    const newBody = e.target.value;
    updateNoteContent(title + '\n' + newBody);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Focus body
      if (bodyRef.current) {
        bodyRef.current.focus();
        // Place cursor at start
        bodyRef.current.setSelectionRange(0, 0);
      }
    }
  };

  const handleTitleSelection = () => {
    if (titleRef.current && handleSelectionChange) {
      handleSelectionChange(titleRef.current.selectionStart);
    }
  };

  const handleBodySelection = () => {
    if (bodyRef.current && handleSelectionChange) {
      // The absolute index is the title length + 1 (for the newline character) + body selection start
      handleSelectionChange(title.length + 1 + bodyRef.current.selectionStart);
    }
  };

  // Sync contentRef to bodyRef for external access (Toolbar, Audio, Search)
  // This allows the "Search" feature to focus the BODY content.
  useEffect(() => {
    if (contentRef) {
      contentRef.current = bodyRef.current;
    }
  }, [contentRef]);

  // Calculate dynamic font size for title
  // Ensure it's always significantly larger than the body text
  const titleFontSize = Math.max(globalFontSize * 1.5, 24);

  return (
    <div className="flex flex-col w-full h-full gap-2">
      {/* Title Input - Designated First Line */}
      <input
        ref={titleRef}
        type="text"
        value={title}
        onChange={handleTitleChange}
        onKeyDown={handleTitleKeyDown}
        onSelect={handleTitleSelection}
        onKeyUp={handleTitleSelection}
        onClick={handleTitleSelection}
        placeholder="New Note"
        className={`w-full bg-transparent px-4 py-2 font-bold outline-none transition-colors duration-200 border-none ${darkMode
          ? 'text-gray-100 placeholder-gray-600'
          : 'text-gray-900 placeholder-gray-300'
          }`}
        style={{
          fontSize: `${titleFontSize}px`,
          // Title keeps its default theme color — color picker only affects the body content.
        }}
      />

      {/* Body Textarea - Rest of Content */}
      <textarea
        ref={bodyRef}
        value={body}
        onChange={handleBodyChange}
        onSelect={handleBodySelection}
        onKeyUp={handleBodySelection}
        onClick={handleBodySelection}
        onPaste={handlePaste}
        placeholder="Start typing..."
        className={`w-full flex-1 resize-none outline-none px-4 py-3 rounded-xl transition-colors duration-200 leading-relaxed tracking-wide ${darkMode
          ? 'bg-[#0f0f0f] text-gray-200 placeholder-gray-500 focus:bg-[#111111]'
          : 'bg-[#fafafa] text-gray-800 placeholder-gray-400 focus:bg-white'
          }`}
        style={{
          color: globalTextColor,
          fontSize: `${globalFontSize}px`,
          fontWeight: globalIsBold ? 'bold' : 'normal',
          fontStyle: globalIsItalic ? 'italic' : 'normal',
          textDecoration: globalIsUnderline ? 'underline' : 'none',
          boxShadow: darkMode
            ? 'inset 0 0 0 1px rgba(255,255,255,0.05)'
            : 'inset 0 0 0 1px rgba(0,0,0,0.05)',
        }}
        // Enable spellcheck
        spellCheck="false"
      />
    </div>
  );
};

export default TextEditor;
