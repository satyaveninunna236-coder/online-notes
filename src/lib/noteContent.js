/**
 * Note content format: `title\n` + HTML body (TipTap).
 * Legacy plain-text bodies are converted to HTML on load.
 */

export function splitNoteContent(content = '') {
  const raw = content ?? '';
  const idx = raw.indexOf('\n');
  if (idx === -1) {
    return { title: raw, body: '' };
  }
  return {
    title: raw.slice(0, idx),
    body: raw.slice(idx + 1),
  };
}

export function joinNoteContent(title = '', bodyHtml = '') {
  return `${title}\n${bodyHtml ?? ''}`;
}

export function escapeHtml(text = '') {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function looksLikeHtml(value = '') {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

/** Convert legacy plain-text body into TipTap-friendly HTML. */
export function ensureBodyHtml(body = '') {
  if (!body || !String(body).trim()) return '';
  if (looksLikeHtml(body)) return body;

  return String(body)
    .split('\n')
    .map((line) => {
      const escaped = escapeHtml(line);
      return escaped ? `<p>${escaped}</p>` : '<p></p>';
    })
    .join('');
}

export function htmlToPlainText(html = '') {
  if (!html) return '';
  if (typeof document === 'undefined') {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  const el = document.createElement('div');
  el.innerHTML = html;
  return el.textContent || '';
}

/**
 * Find case-insensitive text matches in a TipTap/ProseMirror document.
 * Searches across mark boundaries (e.g. bold mid-word) and block text runs.
 * Returns [{ from, to }, ...] in document positions.
 */
export function findTextMatchesInEditor(editor, searchTerm) {
  if (!editor || !searchTerm) return [];

  const needle = searchTerm.toLowerCase();
  if (!needle) return [];

  const { doc } = editor.state;
  let haystack = '';
  /** @type {number[]} text index -> document position */
  const indexToPos = [];

  doc.descendants((node, pos) => {
    if (node.isText && node.text) {
      for (let i = 0; i < node.text.length; i += 1) {
        indexToPos.push(pos + i);
        haystack += node.text[i].toLowerCase();
      }
      return;
    }

    // Keep block separation so multi-word search still works across lines
    if (node.isBlock && haystack.length > 0 && !haystack.endsWith('\n')) {
      indexToPos.push(pos);
      haystack += '\n';
    }
  });

  const matches = [];
  let start = 0;
  while (start <= haystack.length - needle.length) {
    const found = haystack.indexOf(needle, start);
    if (found === -1) break;

    const from = indexToPos[found];
    const lastIdx = found + needle.length - 1;
    const to = indexToPos[lastIdx] + 1;

    if (typeof from === 'number' && typeof to === 'number' && to > from) {
      matches.push({ from, to });
    }
    start = found + 1;
  }

  return matches;
}

export const FONT_FAMILIES = [
  { label: 'Default', value: '' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Poppins', value: 'Poppins, sans-serif' },
  { label: 'Open Sans', value: '"Open Sans", sans-serif' },
  { label: 'Merriweather', value: 'Merriweather, serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Monospace', value: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' },
];

export const FONT_SIZES = [
  { label: 'Default', value: '' },
  { label: '12', value: '12px' },
  { label: '14', value: '14px' },
  { label: '16', value: '16px' },
  { label: '18', value: '18px' },
  { label: '20', value: '20px' },
  { label: '24', value: '24px' },
  { label: '28', value: '28px' },
  { label: '32', value: '32px' },
  { label: '36', value: '36px' },
  { label: '48', value: '48px' },
];

export const HEADING_OPTIONS = [
  { label: 'Paragraph', value: 'paragraph', level: null },
  { label: 'Heading 1', value: 'heading', level: 1 },
  { label: 'Heading 2', value: 'heading', level: 2 },
  { label: 'Heading 3', value: 'heading', level: 3 },
  { label: 'Heading 4', value: 'heading', level: 4 },
];

export function normalizeUrl(url = '') {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) return trimmed;
  if (/^www\./i.test(trimmed)) return `https://${trimmed}`;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return null;
}
