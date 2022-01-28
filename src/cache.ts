export const createBuildCache = (
  buildCallback: (key: string, input: string) => Promise<string> | string
) => {
  const cache = new Map<string, { input: string; output: string }>();
  return async (key: string, input: string) => {
    let cacheEntry = cache.get(key);
    if (cacheEntry == null || cacheEntry?.input !== input) {
      cacheEntry = { input, output: await buildCallback(key, input) };
      cache.set(key, cacheEntry);
      return cacheEntry.output;
    }
    return cacheEntry.output;
  };
};
