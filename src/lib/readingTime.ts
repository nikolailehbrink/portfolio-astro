// Cache for reading time calculations to avoid recalculating
const readingTimeCache = new Map<string, { time: number; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const MAX_CACHE_SIZE = 1000; // Prevent unbounded growth

// Simple hash function for better cache key generation
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

// Clean up expired cache entries
function cleanupCache() {
  const now = Date.now();
  for (const [key, value] of readingTimeCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      readingTimeCache.delete(key);
    }
  }
}

export function estimateReadingTime(text?: string) {
  if (!text) {
    return 0;
  }

  // Use a proper hash of the text content as cache key
  const textHash = simpleHash(text);
  const now = Date.now();
  
  const cached = readingTimeCache.get(textHash);
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.time;
  }

  const wordsPerMinute = 200; // Average reading speed
  const words = text.trim().split(/\s+/).length;
  const readingTime = Math.ceil(words / wordsPerMinute);
  
  // Clean up cache if it gets too large
  if (readingTimeCache.size >= MAX_CACHE_SIZE) {
    cleanupCache();
  }
  
  // Cache the result with timestamp
  readingTimeCache.set(textHash, { time: readingTime, timestamp: now });
  
  return readingTime;
}

export type ReadingTime = ReturnType<typeof estimateReadingTime>;
