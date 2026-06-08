export const defaultFuseOptions = {
  // At what point does the match algorithm give up.
  // 0.0 requires a perfect match, 1.0 would match anything.
  // 0.35 is a good balance for typo tolerance without returning completely unrelated results.
  threshold: 0.35,

  // Whether the score should be included in the result set.
  includeScore: true,

  // Determines whether to search anywhere in the string (true) or just from the beginning.
  ignoreLocation: true,

  // Minimum number of characters that must be matched before a result is considered a match.
  minMatchCharLength: 2,

  // The keys that will be searched.
  keys: [
    "title",
    "content"
  ]
};
