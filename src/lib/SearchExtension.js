import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export const SearchPluginKey = new PluginKey('search');

export const SearchExtension = Extension.create({
  name: 'search',

  addStorage() {
    return {
      searchTerm: '',
      results: [],
      currentIndex: 0,
    };
  },

  addCommands() {
    return {
      setSearchTerm: (searchTerm) => ({ editor, tr }) => {
        editor.storage.search.searchTerm = searchTerm;
        editor.storage.search.currentIndex = 0;
        tr.setMeta(SearchPluginKey, { type: 'update' });
        return true;
      },
      setSearchIndex: (index) => ({ editor, tr }) => {
        editor.storage.search.currentIndex = index;
        tr.setMeta(SearchPluginKey, { type: 'update' });
        return true;
      },
      nextMatch: () => ({ editor, tr }) => {
        const { results, currentIndex } = editor.storage.search;
        if (results.length === 0) return false;
        let nextIndex = currentIndex + 1;
        if (nextIndex >= results.length) nextIndex = 0;
        editor.storage.search.currentIndex = nextIndex;
        tr.setMeta(SearchPluginKey, { type: 'update' });
        return true;
      },
      prevMatch: () => ({ editor, tr }) => {
        const { results, currentIndex } = editor.storage.search;
        if (results.length === 0) return false;
        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) prevIndex = results.length - 1;
        editor.storage.search.currentIndex = prevIndex;
        tr.setMeta(SearchPluginKey, { type: 'update' });
        return true;
      },
      clearSearch: () => ({ editor, tr }) => {
        editor.storage.search.searchTerm = '';
        editor.storage.search.results = [];
        editor.storage.search.currentIndex = 0;
        tr.setMeta(SearchPluginKey, { type: 'update' });
        return true;
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: SearchPluginKey,
        state: {
          init: () => DecorationSet.empty,
          apply: (tr, oldState) => {
            const searchStorage = this.editor.storage.search;
            const searchTerm = searchStorage.searchTerm?.toLowerCase() || '';

            if (!searchTerm) {
              searchStorage.results = [];
              searchStorage.currentIndex = 0;
              return DecorationSet.empty;
            }

            const meta = tr.getMeta(SearchPluginKey);
            if (!tr.docChanged && !meta) {
              // If document didn't change and no search meta update, keep old decorations
              // We could map them, but it's fine for simple updates to just map or return
              // Actually if doc changed, we recalculate completely. 
              // If doc didn't change, we still return oldState. Wait, mapping is needed if we didn't recalculate?
              // Yes, but we DO recalculate if doc changed. So if doc didn't change, oldState is perfectly valid!
              return oldState;
            }

            const doc = tr.doc;
            const results = [];
            let haystack = '';
            const indexToPos = [];

            doc.descendants((node, pos) => {
              if (node.isText && node.text) {
                for (let i = 0; i < node.text.length; i += 1) {
                  indexToPos.push(pos + i);
                  haystack += node.text[i].toLowerCase();
                }
                return;
              }
              // Keep block separation so multi-word search still works across lines, but avoids matching across boundaries
              if (node.isBlock && haystack.length > 0 && !haystack.endsWith('\n')) {
                indexToPos.push(pos);
                haystack += '\n';
              }
            });

            let start = 0;
            while (start <= haystack.length - searchTerm.length) {
              const found = haystack.indexOf(searchTerm, start);
              if (found === -1) break;

              const from = indexToPos[found];
              const lastIdx = found + searchTerm.length - 1;
              const to = indexToPos[lastIdx] + 1;

              if (typeof from === 'number' && typeof to === 'number' && to > from) {
                results.push({ from, to });
              }
              start = found + 1;
            }

            searchStorage.results = results;
            if (searchStorage.currentIndex >= results.length) {
              searchStorage.currentIndex = Math.max(0, results.length - 1);
            }

            const decorations = results.map((match, index) => {
              const isActive = index === searchStorage.currentIndex;
              return Decoration.inline(match.from, match.to, {
                class: isActive ? 'search-result-active' : 'search-result',
              });
            });

            return DecorationSet.create(doc, decorations);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});
