/**
 * High-Performance Editor Utilities & Algorithms
 * Implements line-offset indexing, LRU syntax caching, and O(log N) cursor lookup
 */

// Line offset indexer: computes line starts once and uses binary search for O(log N) cursor positioning
export class LineOffsetIndex {
  private lineOffsets: number[] = [0];
  private cachedContent: string = "";

  public update(content: string): void {
    if (this.cachedContent === content) return;
    this.cachedContent = content;
    const offsets: number[] = [0];
    const len = content.length;
    for (let i = 0; i < len; i++) {
      if (content.charCodeAt(i) === 10) {
        offsets.push(i + 1);
      }
    }
    this.lineOffsets = offsets;
  }

  public getPosition(offset: number): { line: number; col: number } {
    const offsets = this.lineOffsets;
    if (offsets.length === 0) return { line: 1, col: 1 };

    // Binary search for greatest line offset <= offset
    let low = 0;
    let high = offsets.length - 1;
    let lineIdx = 0;

    while (low <= high) {
      const mid = (low + high) >> 1;
      if (offsets[mid] <= offset) {
        lineIdx = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    const line = lineIdx + 1;
    const col = offset - offsets[lineIdx] + 1;
    return { line, col };
  }

  public getOffset(line: number): number {
    const idx = Math.max(0, Math.min(this.lineOffsets.length - 1, line - 1));
    return this.lineOffsets[idx] || 0;
  }

  public getLineCount(): number {
    return this.lineOffsets.length;
  }
}

// Global LRU Cache for syntax highlighting
const SYNTAX_CACHE = new Map<string, string>();
const MAX_SYNTAX_CACHE = 200;

export function getCachedHighlight(key: string): string | undefined {
  return SYNTAX_CACHE.get(key);
}

export function setCachedHighlight(key: string, html: string): void {
  if (SYNTAX_CACHE.size >= MAX_SYNTAX_CACHE) {
    const oldest = SYNTAX_CACHE.keys().next().value;
    if (oldest) SYNTAX_CACHE.delete(oldest);
  }
  SYNTAX_CACHE.set(key, html);
}

// Fast 32-bit hash for code strings
export function fastCodeHash(str: string): number {
  let hash = 5381;
  const len = str.length;
  // Step through larger files to sample quickly in O(1) time
  const step = len > 500 ? Math.floor(len / 50) : 1;
  for (let i = 0; i < len; i += step) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
