/**
 * Token Optimization & Context Compression Utility
 * Ensures tokens are never wasted anywhere in the client-server pipeline.
 */

export interface TokenOptimizationStats {
  originalLength: number;
  compressedLength: number;
  estimatedTokensSaved: number;
  savingsPercentage: number;
}

/**
 * Strips duplicate linebreaks, carriage returns, trailing whitespace,
 * and collapses excessive indentations to save input tokens.
 */
export function sanitizeAndCompressPrompt(text: string): string {
  if (!text) return "";

  // Split on fenced code blocks to avoid mangling indentation inside them
  const parts = text.split(/(```[\s\S]*?```)/g);
  const processed = parts.map((part, i) => {
    if (i % 2 === 1) return part; // odd indexes = inside code fence — leave untouched
    return part
      .replace(/\n{3,}/g, "\n\n")
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n");
  });
  return processed.join("").trim();
}

/**
 * Condenses previous chat turns to avoid re-sending massive raw file copies repeatedly.
 * Keeps the most recent turn fully intact, while summarizing older turns.
 */
export function compressChatHistory(
  messages: Array<{ role: string; content: string }>,
  maxHistoryTurns: number = 8
): Array<{ role: string; content: string }> {
  if (!messages || messages.length === 0) return [];

  // Always keep system prompt if present
  const systemMsg = messages.find((m) => m.role === "system");
  const nonSystemMsgs = messages.filter((m) => m.role !== "system");

  // Keep up to maxHistoryTurns
  const recentTurns = nonSystemMsgs.slice(-maxHistoryTurns);

  const compressed: Array<{ role: string; content: string }> = [];
  if (systemMsg) {
    compressed.push({
      role: "system",
      content: sanitizeAndCompressPrompt(systemMsg.content)
    });
  }

  recentTurns.forEach((msg, index) => {
    const isLatest = index >= recentTurns.length - 2;
    let content = sanitizeAndCompressPrompt(msg.content);

    // If it's an older message and exceeds 1,200 chars (e.g. huge code paste),
    // prune the redundant middle to save tokens while keeping head and tail intent
    if (!isLatest && content.length > 1200) {
      const head = content.slice(0, 600);
      const tail = content.slice(-400);
      content = `${head}\n\n[...context condensed to preserve token quota...]\n\n${tail}`;
    }

    compressed.push({
      role: msg.role,
      content
    });
  });

  return compressed;
}

/**
 * Calculates estimated tokens and savings percentage
 * Roughly 1 token ≈ 4 characters of English text/code
 */
export function calculateTokenSavings(original: string, compressed: string): TokenOptimizationStats {
  const originalLength = original.length;
  const compressedLength = compressed.length;
  const charsSaved = Math.max(0, originalLength - compressedLength);
  const estimatedTokensSaved = Math.round(charsSaved / 4);
  const savingsPercentage = originalLength > 0 ? Math.round((charsSaved / originalLength) * 100) : 0;

  return {
    originalLength,
    compressedLength,
    estimatedTokensSaved,
    savingsPercentage
  };
}

/**
 * Intelligently computes the optimal max_tokens to prevent AI models
 * from wasting output tokens on overly verbose answers.
 */
export function getAdaptiveMaxTokens(prompt: string, requestedMaxTokens?: number): number {
  if (requestedMaxTokens && requestedMaxTokens > 0 && requestedMaxTokens <= 4096) {
    return requestedMaxTokens;
  }

  const lower = prompt.toLowerCase();

  // Full file creation or complete rewrite (highest priority for token allocation)
  if (
    lower.includes("create component") ||
    lower.includes("generate file") ||
    lower.includes("full code") ||
    lower.includes("entire file") ||
    lower.includes("write full")
  ) {
    return 4096;
  }

  // Short queries / questions / status checks
  if (
    lower.startsWith("what") ||
    lower.startsWith("why") ||
    lower.startsWith("how") ||
    lower.includes("explain") ||
    lower.includes("summary") ||
    lower.includes("list") ||
    prompt.length < 150
  ) {
    return 1536; // Fast, concise, zero wasted tokens
  }

  // Balanced default
  return 2560;
}
