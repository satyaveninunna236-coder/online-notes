import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Undo2,
  Redo2,
  Link as LinkIcon,
  Unlink,
  ExternalLink,
  RemoveFormatting,
  ChevronDown,
  Type,
  Check,
  List,
  ListOrdered,
  Palette,
  Table as TableIcon,
  Image as ImageIcon,
  Plus,
  Trash2,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  FONT_FAMILIES,
  FONT_SIZES,
  HEADING_OPTIONS,
  normalizeUrl,
} from '@/lib/noteContent';

const PRESET_COLORS = [
  { name: 'Default', value: '' },
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#ffffff' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Gray', value: '#6b7280' },
];

function escapeForLinkLabel(text = '') {
  return text
    .replace(/^https?:\/\//i, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function ToolbarBtn({
  onClick,
  active,
  disabled,
  label,
  darkMode,
  children,
  className = '',
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          aria-pressed={!!active}
          disabled={disabled}
          onClick={onClick}
          className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${active
              ? 'bg-blue-600 text-white'
              : darkMode
                ? 'hover:bg-gray-700 text-gray-400'
                : 'hover:bg-gray-200 text-gray-600'
            } ${className}`}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function Group({ darkMode, children, className = '' }) {
  return (
    <div
      className={`flex items-center gap-1 p-1.5 rounded-xl shadow-inner ${darkMode ? 'bg-gray-800/60' : 'bg-white'
        } ${className}`}
    >
      {children}
    </div>
  );
}

function Separator({ darkMode }) {
  return (
    <div
      className={`hidden xl:block w-px h-7 mx-0.5 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'
        }`}
      aria-hidden
    />
  );
}

const DesktopRichToolbar = ({ editor, darkMode, rightSlot }) => {
  const [, setTick] = useState(0);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkError, setLinkError] = useState('');
  const [imageOpen, setImageOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState('');
  const savedSelectionRef = React.useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return undefined;
    const refresh = () => setTick((t) => t + 1);
    editor.on('selectionUpdate', refresh);
    editor.on('transaction', refresh);
    return () => {
      if (!editor.isDestroyed) {
        editor.off('selectionUpdate', refresh);
        editor.off('transaction', refresh);
      }
    };
  }, [editor]);

  const isMac =
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad|iPod/.test(navigator.platform || '');

  const mod = isMac ? '⌘' : 'Ctrl';

  const hasValidEditor = editor && !editor.isDestroyed;

  const isTableActive = hasValidEditor ? editor.isActive('table') : false;

  const activeHeading = (() => {
    if (!hasValidEditor) return HEADING_OPTIONS[0];
    for (const opt of HEADING_OPTIONS) {
      if (opt.value === 'paragraph') {
        if (editor.isActive('paragraph')) return opt;
      } else if (editor.isActive('heading', { level: opt.level })) {
        return opt;
      }
    }
    return HEADING_OPTIONS[0];
  })();

  const activeFont = (() => {
    if (!hasValidEditor) return FONT_FAMILIES[0];
    const current = editor.getAttributes('textStyle').fontFamily || '';
    return (
      FONT_FAMILIES.find((f) => f.value === current) ||
      FONT_FAMILIES.find((f) => f.value && current.includes(f.label)) ||
      FONT_FAMILIES[0]
    );
  })();

  const activeFontSize = (() => {
    if (!hasValidEditor) return FONT_SIZES[0];
    const current = editor.getAttributes('textStyle').fontSize || '';
    return FONT_SIZES.find((s) => s.value === current) || FONT_SIZES[0];
  })();

  const activeColor = hasValidEditor ? (editor.getAttributes('textStyle').color || '') : '';
  const isLinkActive = hasValidEditor ? editor.isActive('link') : false;
  const currentLinkHref = hasValidEditor ? (editor.getAttributes('link').href || '') : '';

  const openLinkPopover = useCallback(() => {
    if (!editor || editor.isDestroyed) return;
    const { from, to } = editor.state.selection;
    savedSelectionRef.current = { from, to };
    setLinkUrl(editor.getAttributes('link').href || '');
    setLinkError('');
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor || editor.isDestroyed) return;
    const normalized = normalizeUrl(linkUrl);
    if (!normalized) {
      setLinkError('Enter a valid URL (e.g. https://example.com)');
      return;
    }

    const saved = savedSelectionRef.current;
    const selection = saved || {
      from: editor.state.selection.from,
      to: editor.state.selection.to,
    };
    const isEmpty = selection.from === selection.to;

    if (isEmpty) {
      const label = escapeForLinkLabel(linkUrl.trim()) || normalized;
      editor
        .chain()
        .focus()
        .insertContent(
          `<a href="${normalized}" class="rte-link" target="_blank" rel="noopener noreferrer nofollow">${label}</a>`
        )
        .run();
    } else {
      editor
        .chain()
        .focus()
        .setTextSelection(selection)
        .extendMarkRange('link')
        .setLink({ href: normalized })
        .run();
    }

    setLinkOpen(false);
    setLinkError('');
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    if (!editor || editor.isDestroyed) return;
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setLinkOpen(false);
  }, [editor]);

  const openLink = useCallback(() => {
    const href = editor?.getAttributes('link').href;
    if (href && typeof window !== 'undefined') {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  }, [editor]);

  const handleInsertImageFile = (e) => {
    const file = e.target.files?.[0];
    if (file && editor && !editor.isDestroyed) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target.result;
        editor.chain().focus().setImage({ src: base64Url }).run();
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
    setImageOpen(false);
  };

  const applyImageUrl = () => {
    if (!editor || editor.isDestroyed) return;
    const normalized = normalizeUrl(imageUrl);
    if (!normalized) {
      setImageError('Enter a valid image URL');
      return;
    }
    editor.chain().focus().setImage({ src: normalized }).run();
    setImageUrl('');
    setImageError('');
    setImageOpen(false);
  };

  if (!hasValidEditor) {
    return (
      <div className="hidden lg:flex items-center justify-start gap-2 flex-wrap">
        {rightSlot}
      </div>
    );
  }

  const canUndo = editor.can().undo();
  const canRedo = editor.can().redo();


  const triggerClass = `h-9 px-2.5 flex items-center gap-1.5 rounded-2xl text-sm font-medium transition-all duration-150 active:scale-95 ${darkMode
      ? 'hover:bg-gray-700 text-gray-300'
      : 'hover:bg-gray-200 text-gray-700'
    }`;

  const menuContentClass = darkMode
    ? 'bg-[#18181b] border-gray-700/80 text-gray-100'
    : 'bg-white border-gray-200 text-gray-900';

  return (
    <div className="hidden lg:flex items-center justify-start gap-2 flex-wrap">
      {/* Undo / Redo */}
      <Group darkMode={darkMode}>
        <ToolbarBtn
          label={`Undo (${mod}+Z)`}
          darkMode={darkMode}
          disabled={!canUndo}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          label={`Redo (${mod}+Shift+Z)`}
          darkMode={darkMode}
          disabled={!canRedo}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 size={16} />
        </ToolbarBtn>
      </Group>

      <Separator darkMode={darkMode} />

      {/* Headings */}
      <Group darkMode={darkMode}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={triggerClass} aria-label="Heading style">
              <Type size={14} />
              <span className="max-w-[88px] truncate">{activeHeading.label}</span>
              <ChevronDown size={14} className="opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className={`w-44 ${menuContentClass}`}>
            {HEADING_OPTIONS.map((opt) => {
              const selected =
                opt.value === 'paragraph'
                  ? activeHeading.value === 'paragraph'
                  : activeHeading.level === opt.level;
              return (
                <DropdownMenuItem
                  key={`${opt.value}-${opt.level ?? 'p'}`}
                  onClick={() => {
                    if (opt.value === 'paragraph') {
                      editor.chain().focus().setParagraph().run();
                    } else {
                      editor.chain().focus().toggleHeading({ level: opt.level }).run();
                    }
                  }}
                  className={`flex items-center justify-between gap-2 ${darkMode ? 'focus:bg-gray-800' : ''
                    }`}
                >
                  <span
                    className={
                      opt.level === 1
                        ? 'text-lg font-bold'
                        : opt.level === 2
                          ? 'text-base font-semibold'
                          : opt.level === 3
                            ? 'text-sm font-semibold'
                            : opt.level === 4
                              ? 'text-sm font-medium'
                              : 'text-sm'
                    }
                  >
                    {opt.label}
                  </span>
                  {selected && <Check size={14} className="text-blue-500" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </Group>

      {/* Font family */}
      <Group darkMode={darkMode}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={triggerClass} aria-label="Font family">
              <span
                className="max-w-[100px] truncate"
                style={{ fontFamily: activeFont.value || undefined }}
              >
                {activeFont.label}
              </span>
              <ChevronDown size={14} className="opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className={`w-48 ${menuContentClass}`}>
            {FONT_FAMILIES.map((font) => {
              const selected = activeFont.value === font.value;
              return (
                <DropdownMenuItem
                  key={font.label}
                  onClick={() => {
                    if (!font.value) {
                      editor.chain().focus().unsetFontFamily().run();
                    } else {
                      editor.chain().focus().setFontFamily(font.value).run();
                    }
                  }}
                  className={`flex items-center justify-between gap-2 ${darkMode ? 'focus:bg-gray-800' : ''
                    }`}
                  style={{ fontFamily: font.value || undefined }}
                >
                  <span>{font.label}</span>
                  {selected && <Check size={14} className="text-blue-500" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </Group>

      {/* Font size — selection scoped */}
      <Group darkMode={darkMode}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={triggerClass} aria-label="Font size">
              <span className="min-w-[2.5rem] text-center">
                {activeFontSize.value ? activeFontSize.label : 'Size'}
              </span>
              <ChevronDown size={14} className="opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className={`w-36 ${menuContentClass}`}>
            {FONT_SIZES.map((size) => {
              const selected = activeFontSize.value === size.value;
              return (
                <DropdownMenuItem
                  key={size.label}
                  onClick={() => {
                    if (!size.value) {
                      editor.chain().focus().unsetFontSize().run();
                    } else {
                      editor.chain().focus().setFontSize(size.value).run();
                    }
                  }}
                  className={`flex items-center justify-between gap-2 ${darkMode ? 'focus:bg-gray-800' : ''
                    }`}
                >
                  <span style={{ fontSize: size.value || '14px' }}>{size.label}</span>
                  {selected && <Check size={14} className="text-blue-500" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </Group>

      <Separator darkMode={darkMode} />

      {/* Marks */}
      <Group darkMode={darkMode}>
        <ToolbarBtn
          label={`Bold (${mod}+B)`}
          darkMode={darkMode}
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          label={`Italic (${mod}+I)`}
          darkMode={darkMode}
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          label={`Underline (${mod}+U)`}
          darkMode={darkMode}
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          label="Strikethrough"
          darkMode={darkMode}
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          label="Inline Code"
          darkMode={darkMode}
          active={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code size={16} />
        </ToolbarBtn>
      </Group>

      {/* Lists */}
      <Group darkMode={darkMode}>
        <ToolbarBtn
          label="Bullet list"
          darkMode={darkMode}
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          label="Numbered list"
          darkMode={darkMode}
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={16} />
        </ToolbarBtn>
      </Group>

      {/* Text color */}
      <Group darkMode={darkMode}>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Text color"
              className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all duration-150 active:scale-95 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <Palette size={16} className={darkMode ? 'text-gray-300' : 'text-gray-700'} />
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className={`w-52 p-2 ${menuContentClass} border`}
          >
            <p
              className={`text-xs font-medium mb-2 px-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
            >
              Text color
            </p>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((color) => {
                const isActive =
                  (!color.value && !activeColor) ||
                  (color.value && activeColor === color.value);
                return (
                  <button
                    key={color.name}
                    type="button"
                    title={color.name}
                    aria-label={color.name}
                    onClick={() => {
                      if (!color.value) {
                        editor.chain().focus().unsetColor().run();
                      } else {
                        editor.chain().focus().setColor(color.value).run();
                      }
                    }}
                    className={`w-7 h-7 rounded-full border transition-all hover:scale-110 flex items-center justify-center ${isActive
                        ? 'ring-2 ring-blue-500 border-transparent'
                        : darkMode
                          ? 'border-gray-600'
                          : 'border-gray-300'
                      }`}
                    style={{
                      backgroundColor:
                        color.value || (darkMode ? '#1a1a1a' : '#ffffff'),
                      backgroundImage: !color.value
                        ? 'linear-gradient(135deg, transparent 45%, #ef4444 45%, #ef4444 55%, transparent 55%)'
                        : undefined,
                    }}
                  >
                    {isActive && color.value && <Check size={12} className={color.value === '#ffffff' ? 'text-black' : 'text-white'} />}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        <ToolbarBtn
          label="Clear formatting"
          darkMode={darkMode}
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
        >
          <RemoveFormatting size={16} />
        </ToolbarBtn>
      </Group>

      <Separator darkMode={darkMode} />

      {/* Tables & Media */}
      <Group darkMode={darkMode}>
        {/* Table Dropdown */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Table"
                  className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all duration-150 active:scale-95 ${
                    isTableActive
                      ? 'bg-blue-600 text-white'
                      : darkMode
                        ? 'hover:bg-gray-700 text-gray-400'
                        : 'hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  <TableIcon size={16} />
                </button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Table options</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start" className={`w-48 ${menuContentClass}`}>
            {!isTableActive ? (
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                }
              >
                <Plus size={15} className="mr-2 text-blue-500" />
                <span>Insert Table (3×3)</span>
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().addRowBefore().run()}
                >
                  <span>Add Row Above</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                >
                  <span>Add Row Below</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().deleteRow().run()}
                  className="text-red-500"
                >
                  <Trash2 size={14} className="mr-2" />
                  <span>Delete Row</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().addColumnBefore().run()}
                >
                  <span>Add Column Left</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                >
                  <span>Add Column Right</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().deleteColumn().run()}
                  className="text-red-500"
                >
                  <Trash2 size={14} className="mr-2" />
                  <span>Delete Column</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().deleteTable().run()}
                  className="text-red-600 font-semibold"
                >
                  <Trash2 size={14} className="mr-2" />
                  <span>Delete Table</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Media / Image Popover */}
        <Popover open={imageOpen} onOpenChange={setImageOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Insert image"
                  className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all duration-150 active:scale-95 ${
                    imageOpen
                      ? 'bg-blue-600 text-white'
                      : darkMode
                        ? 'hover:bg-gray-700 text-gray-400'
                        : 'hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  <ImageIcon size={16} />
                </button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Insert Image</p>
            </TooltipContent>
          </Tooltip>
          <PopoverContent
            align="start"
            className={`w-72 p-3 ${menuContentClass} border`}
          >
            <p
              className={`text-xs font-medium mb-2 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              Insert Image
            </p>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleInsertImageFile}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full mb-3 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium flex items-center justify-center gap-2"
            >
              <ImageIcon size={16} />
              <span>Upload from device</span>
            </button>
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-px flex-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
              <span className="text-[11px] text-gray-400 uppercase tracking-wider">or URL</span>
              <div className={`h-px flex-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
            </div>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setImageError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  applyImageUrl();
                }
              }}
              placeholder="https://example.com/image.png"
              className={`w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
            />
            {imageError && (
              <p className="mt-1.5 text-xs text-red-500">{imageError}</p>
            )}
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={applyImageUrl}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
              >
                Insert from URL
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </Group>

      {/* Links */}
      <Group darkMode={darkMode}>
        <Popover
          open={linkOpen}
          onOpenChange={(open) => {
            setLinkOpen(open);
            if (open) openLinkPopover();
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={isLinkActive ? 'Edit link' : 'Insert link'}
              aria-pressed={isLinkActive}
              className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all duration-150 active:scale-95 ${isLinkActive
                  ? 'bg-blue-600 text-white'
                  : darkMode
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-200 text-gray-600'
                }`}
            >
              <LinkIcon size={16} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className={`w-72 p-3 ${menuContentClass} border`}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <p
              className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
            >
              {isLinkActive ? 'Edit link' : 'Insert link'}
            </p>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => {
                setLinkUrl(e.target.value);
                setLinkError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  applyLink();
                }
              }}
              placeholder="https://example.com"
              className={`w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 ${darkMode
                  ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              autoFocus
            />
            {linkError && (
              <p className="mt-1.5 text-xs text-red-500">{linkError}</p>
            )}
            {isLinkActive && currentLinkHref && (
              <p
                className={`mt-1.5 text-xs truncate ${darkMode ? 'text-blue-500' : 'text-blue-600'
                  }`}
                title={currentLinkHref}
              >
                Active: {currentLinkHref}
              </p>
            )}
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={applyLink}
                className="flex-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
              >
                {isLinkActive ? 'Update' : 'Apply'}
              </button>
              {isLinkActive && (
                <>
                  <button
                    type="button"
                    aria-label="Open link"
                    onClick={openLink}
                    className={`p-1.5 rounded-lg ${darkMode
                        ? 'hover:bg-gray-800 text-gray-300'
                        : 'hover:bg-gray-100 text-gray-600'
                      }`}
                  >
                    <ExternalLink size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Remove link"
                    onClick={removeLink}
                    className={`p-1.5 rounded-lg ${darkMode
                        ? 'hover:bg-gray-800 text-red-400'
                        : 'hover:bg-gray-100 text-red-600'
                      }`}
                  >
                    <Unlink size={16} />
                  </button>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Mic + Settings — injected from parent, part of same flex row Group */}
        {rightSlot}
      </Group>
    </div>
  );
};

export default DesktopRichToolbar;
