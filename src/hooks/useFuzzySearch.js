import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { defaultFuseOptions } from '../utils/fuse-config';

export function useFuzzySearch({ data, debouncedSearch, options = defaultFuseOptions }) {
  // Memoize the Fuse instance
  // Re-create only when data or options change
  const fuse = useMemo(() => {
    return new Fuse(data, options);
  }, [data, options]);

  // Memoize the search results
  // Re-run search only when debounced search term changes
  const results = useMemo(() => {
    const trimmedSearch = debouncedSearch.trim();
    
    // Empty search behavior: skip fuse and return original
    if (!trimmedSearch) {
      return data;
    }

    // Execute search and extract original items
    const searchResults = fuse.search(trimmedSearch);
    return searchResults.map(result => result.item);
  }, [debouncedSearch, fuse, data]);

  return results;
}
