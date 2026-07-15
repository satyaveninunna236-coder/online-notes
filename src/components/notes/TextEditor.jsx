import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ensureBodyHtml,
  joinNoteContent,
  splitNoteContent,
} from '@/lib/noteContent';

const createExtensions = () => [
  StarterKit.configure({
    heading: { levels: [1, 2, 3, 4] },
    link: false,
  }),
  TextStyleKit,
  Link.configure({
    openOnClick: false,
    autolink: true,
    linkOnPaste: true,
    defaultProtocol: 'https',
    HTMLAttributes: {
      class: 'rte-link',
      rel: 'noopener noreferrer nofollow',
      target: '_blank',
    },
  }),
  Placeholder.configure({
    placeholder: 'Start typing...',
  }),
];

function formatNoteTime(note) {
  if (!note) return '';

  const now = new Date();
  const hasBeenEdited = note.lastEditedAt && note.lastEditedAt !== null;
  const relevantDate = hasBeenEdited
    ? new Date(note.lastEditedAt)
    : new Date(note.createdAt || note.timestamp);
  const prefix = hasBeenEdited ? 'Last edited' : 'Created';

  const diffMs = now - relevantDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const noteDay = new Date(
    relevantDate.getFullYear(),
    relevantDate.getMonth(),
    relevantDate.getDate()
  );
  const diffDays = Math.floor((today - noteDay) / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return `${prefix} just now`;
  }
  if (diffMins < 60) {
    return `${prefix} ${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  }
  if (diffHours < 24) {
    return `${prefix} ${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }
  if (diffDays === 0) {
    return `${prefix} today at ${relevantDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })}`;
  }
  if (diffDays === 1) {
    return `${prefix} yesterday`;
  }
  if (diffDays < 7) {
    return `${prefix} on ${relevantDate.toLocaleDateString('en-US', { weekday: 'long' })}`;
  }
  return `${prefix} on ${relevantDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: diffDays > 365 ? 'numeric' : undefined,
  })}`;
}

const TextEditor = ({
  contentRef,
  editorRef,
  currentNote,
  updateNoteContent,
  handlePaste,
  darkMode,
  onEditorReady,
}) => {
  const titleRef = useRef(null);
  const noteIdRef = useRef(null);
  const skippingUpdateRef = useRef(false);
  const [, setTimeTick] = useState(0);

  const { title, body } = useMemo(
    () => splitNoteContent(currentNote?.content || ''),
    [currentNote?.content]
  );

  const extensions = useMemo(() => createExtensions(), []);

  const initialHtml = useMemo(() => ensureBodyHtml(body), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const interval = setInterval(() => setTimeTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const editor = useEditor({
    extensions,
    content: initialHtml,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `rte-prose outline-none min-h-[240px] px-4 py-3 leading-relaxed tracking-wide ${
          darkMode ? 'text-gray-200' : 'text-gray-800'
        }`,
        spellcheck: 'false',
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (const item of items) {
          if (item.type.indexOf('image') !== -1) {
            if (handlePaste) handlePaste(event);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (skippingUpdateRef.current) return;
      const html = ed.getHTML();
      const currentTitle =
        titleRef.current?.value ?? splitNoteContent(currentNote?.content || '').title;
      updateNoteContent(joinNoteContent(currentTitle, html === '<p></p>' ? '' : html));
    },
  });

  useEffect(() => {
    if (editorRef) editorRef.current = editor;
    if (onEditorReady) onEditorReady(editor);

    if (contentRef) {
      contentRef.current = editor
        ? {
            type: 'tiptap',
            editor,
            focus: () => editor.commands.focus(),
            insertText: (text) => {
              const needsSpace =
                editor.state.selection.from > 0 &&
                !/\s/.test(
                  editor.state.doc.textBetween(
                    Math.max(0, editor.state.selection.from - 1),
                    editor.state.selection.from
                  )
                );
              editor
                .chain()
                .focus()
                .insertContent(needsSpace ? ` ${text}` : text)
                .run();
            },
            getText: () => editor.getText(),
            getHTML: () => editor.getHTML(),
          }
        : null;
    }

    return () => {
      if (editorRef && editorRef.current === editor) {
        editorRef.current = null;
      }
      if (onEditorReady) onEditorReady(null);
      if (contentRef) contentRef.current = null;
    };
  }, [editor, contentRef, editorRef, onEditorReady]);

  useEffect(() => {
    if (!editor || !currentNote) return;

    const { body: nextBody } = splitNoteContent(currentNote.content || '');
    const html = ensureBodyHtml(nextBody);
    const switched = noteIdRef.current !== currentNote.id;

    const apply = () => {
      skippingUpdateRef.current = true;
      editor.commands.setContent(html || '', { emitUpdate: false });
      skippingUpdateRef.current = false;
    };

    if (switched) {
      noteIdRef.current = currentNote.id;
      apply();
      return;
    }

    const editorEmpty = !editor.getText().trim();
    if (editorEmpty && nextBody && nextBody.trim()) {
      apply();
    }
  }, [currentNote?.id, currentNote?.content, editor, currentNote]);

  useEffect(() => {
    if (!editor) return;
    editor.setOptions({
      editorProps: {
        ...editor.options.editorProps,
        attributes: {
          ...editor.options.editorProps?.attributes,
          class: `rte-prose outline-none min-h-[240px] px-4 py-3 leading-relaxed tracking-wide ${
            darkMode ? 'text-gray-200' : 'text-gray-800'
          }`,
          spellcheck: 'false',
        },
      },
    });
  }, [darkMode, editor]);

  const handleTitleChange = (e) => {
    const newTitle = e.target.value.replace(/\n/g, '');
    const html = editor?.getHTML() || ensureBodyHtml(body);
    updateNoteContent(joinNoteContent(newTitle, html === '<p></p>' ? '' : html));
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      editor?.commands.focus('start');
    }
  };

  const titleFontSize = 28;

  return (
    <div className="flex flex-col w-full h-full gap-1">
      <div className="px-4 pt-1">
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={handleTitleChange}
          onKeyDown={handleTitleKeyDown}
          placeholder="New Note"
          className={`w-full bg-transparent py-1 font-bold outline-none transition-colors duration-200 border-none ${
            darkMode
              ? 'text-gray-100 placeholder-gray-600'
              : 'text-gray-900 placeholder-gray-300'
          }`}
          style={{ fontSize: `${titleFontSize}px` }}
        />
        <p
          className={`text-xs font-medium tracking-wide mt-0.5 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          {formatNoteTime(currentNote)}
        </p>
      </div>

      <div
        className={`w-full flex-1 rounded-xl transition-colors duration-200 overflow-y-auto ${
          darkMode
            ? 'bg-[#0f0f0f] focus-within:bg-[#111111]'
            : 'bg-[#fafafa] focus-within:bg-white'
        }`}
        style={{
          fontSize: '16px',
          boxShadow: darkMode
            ? 'inset 0 0 0 1px rgba(255,255,255,0.05)'
            : 'inset 0 0 0 1px rgba(0,0,0,0.05)',
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TextEditor;
