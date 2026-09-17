// Custom robust syntax highlighter matching VS Code Dark+ colors with full language support & bracket pair colorization

const encodeTokenId = (index: number): string => {
  const binary = index.toString(2);
  let encoded = "\u200B";
  for (let i = 0; i < binary.length; i++) {
    encoded += binary[i] === "0" ? "\u200C" : "\u200D";
  }
  encoded += "\u200B";
  return encoded;
};

const decodeTokenId = (encodedStr: string): number => {
  let binary = "";
  for (let i = 1; i < encodedStr.length - 1; i++) {
    binary += encodedStr[i] === "\u200C" ? "0" : "1";
  }
  return parseInt(binary, 2);
};

// Fast LRU Cache for syntax highlighting to prevent repeated regex passes
export const highlightCache = new Map<string, string>();
const MAX_CACHE_SIZE = 160;

export function quickCodeHash(str: string): number {
  let hash = 0x811c9dc5;
  const len = str.length;
  for (let i = 0; i < len; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export const highlightCode = (code: string, language: string): string => {
  if (!code) return "";

  const lang = (language || "text").toLowerCase();
  // Escape HTML entities to prevent rendering issues
  const escapedBase = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  if (!lang || lang === "text") {
    return escapedBase;
  }

  // Protection against freezing on large files (> 35KB)
  if (code.length > 35000) {
    return escapedBase;
  }

  // Check cache using fast hash rather than entire code string copy
  const cacheKey = `${lang}:${code.length}:${quickCodeHash(code)}`;
  const cached = highlightCache.get(cacheKey);
  if (cached) return cached;

  let escaped = escapedBase;
  const tokens: { className: string; text: string }[] = [];

  const addToken = (text: string, className: string): string => {
    const index = tokens.length;
    tokens.push({ className, text });
    return encodeTokenId(index);
  };

  // 1. Strings & JSON Keys (preserve strings so keywords inside strings aren't highlighted)
  if (lang === "json") {
    escaped = escaped.replace(/(["'])(?:\\.|[^\\])*?\1(\s*:)/g, (match, p1, p2) => {
      const keyStr = match.slice(0, match.lastIndexOf(":"));
      return addToken(keyStr, "text-[#9cdcfe] font-semibold") + p2;
    });
  }

  escaped = escaped.replace(/(["'])(?:\\.|[^\\])*?\1/g, (match) => {
    return addToken(match, "text-[#ce9178]"); // VS Code coral string
  });
  if (["javascript", "typescript", "jsx", "tsx", "js", "ts"].includes(lang)) {
    escaped = escaped.replace(/`[\s\S]*?`/g, (match) => {
      return addToken(match, "text-[#ce9178]");
    });
  }

  // 2. Comments
  escaped = escaped.replace(/\/\*[\s\S]*?\*\//g, (match) => {
    return addToken(match, "text-[#6a9955] italic"); // VS Code green comment
  });
  if (["python", "sh", "bash", "yaml"].includes(lang)) {
    escaped = escaped.replace(/#.*/g, (match) => {
      return addToken(match, "text-[#6a9955] italic");
    });
  } else {
    escaped = escaped.replace(/\/\/.*/g, (match) => {
      return addToken(match, "text-[#6a9955] italic");
    });
  }

  // 3. Preprocessor directives and system headers for C and C++ (.c, .cpp, .cc, .h, .hpp)
  if (["c", "cpp", "cc", "h", "hpp"].includes(lang)) {
    escaped = escaped.replace(/(#(?:include|define|undef|ifdef|ifndef|if|else|elif|endif|pragma|error|warning))\b/g, (match) => {
      return addToken(match, "text-[#c586c0] font-bold"); // Magenta directive
    });
    escaped = escaped.replace(/(&lt;[a-zA-Z0-9_./]+\.h&gt;|&lt;[a-zA-Z0-9_./]+&gt;)/g, (match) => {
      return addToken(match, "text-[#ce9178] font-medium"); // Header file
    });
  }

  // 4. Language specific markup (HTML, XML, JSX, TSX)
  if (["html", "xml", "jsx", "tsx", "svg"].includes(lang)) {
    escaped = escaped.replace(/(&lt;\/?[a-zA-Z0-9:-]+)/g, (match) => {
      return addToken(match, "text-[#569cd6] font-semibold");
    });
    escaped = escaped.replace(/(\b[a-zA-Z0-9:-]+)(?=\s*=)/g, (match) => {
      return addToken(match, "text-[#9cdcfe]");
    });
  }

  if (lang === "css") {
    escaped = escaped.replace(/([a-zA-Z-]+\s*:)/g, (match) => {
      return addToken(match, "text-[#9cdcfe]");
    });
  }

  // 5. Control Flow Keywords (Purple/Magenta text-[#c586c0])
  const controlKeywords = [
    "return", "if", "else", "switch", "case", "default", "break", "continue", "for", "while",
    "do", "try", "catch", "finally", "throw", "import", "export", "from", "async", "await", "yield",
    "pass", "raise"
  ];
  const controlRegex = new RegExp(`\\b(${controlKeywords.join("|")})\\b`, "g");
  escaped = escaped.replace(controlRegex, (_, m) => addToken(m, "text-[#c586c0] font-bold"));

  // 6. Declaration/Storage Keywords (Cyan/Blue text-[#569cd6])
  let keywords: string[] = [];
  if (["javascript", "typescript", "jsx", "tsx", "js", "ts"].includes(lang)) {
    keywords = [
      "class", "const", "let", "var", "function", "extends", "super", "this", "new", "typeof",
      "void", "delete", "in", "instanceof", "as", "implements", "interface", "package",
      "private", "protected", "public", "static", "any", "boolean", "constructor", "declare",
      "get", "module", "require", "set", "type", "string", "number", "of"
    ];
  } else if (lang === "python") {
    keywords = [
      "False", "None", "True", "and", "assert", "class", "def", "del", "elif",
      "global", "in", "is", "lambda", "nonlocal", "not", "or", "with",
      "print", "len", "range", "int", "str", "float", "list", "dict", "set", "tuple"
    ];
  } else if (["c", "cpp", "cc", "h", "hpp"].includes(lang)) {
    keywords = [
      "auto", "char", "const", "double", "enum", "extern", "float", "inline", "int", "long",
      "register", "restrict", "short", "signed", "sizeof", "static", "struct", "typedef",
      "union", "unsigned", "void", "volatile", "_Bool", "namespace", "using", "public",
      "private", "protected", "template", "typename", "virtual", "override", "nullptr",
      "bool", "true", "false", "size_t", "NULL", "main", "printf", "scanf", "malloc", "free"
    ];
  } else if (lang === "java") {
    keywords = [
      "abstract", "boolean", "byte", "char", "class", "double", "extends", "final",
      "float", "implements", "instanceof", "int", "interface", "long", "native", "new",
      "package", "private", "protected", "public", "short", "static", "super", "this",
      "void", "volatile", "true", "false", "null"
    ];
  } else if (lang === "sql") {
    keywords = [
      "SELECT", "FROM", "WHERE", "INSERT", "INTO", "UPDATE", "DELETE", "CREATE", "TABLE",
      "DROP", "ALTER", "ADD", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "ON", "GROUP",
      "BY", "HAVING", "ORDER", "ASC", "DESC", "LIMIT", "OFFSET", "AND", "OR", "NOT",
      "NULL", "PRIMARY", "KEY", "FOREIGN", "REFERENCES", "VALUES", "AS", "DEFAULT"
    ];
  } else if (lang === "json") {
    keywords = ["true", "false", "null"];
  }

  if (keywords.length > 0) {
    const keywordRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "g");
    escaped = escaped.replace(keywordRegex, (_, m) => addToken(m, "text-[#569cd6] font-semibold"));
  }

  // 7. Classes & Types (Capitalized identifiers -> Teal text-[#4ec9b0])
  escaped = escaped.replace(/\b([A-Z][a-zA-Z0-9_]*)\b/g, (_, m) => addToken(m, "text-[#4ec9b0] font-medium"));

  // 8. Functions (Identifiers preceding parentheses -> Yellow text-[#dcdcaa])
  escaped = escaped.replace(/\b([a-z_][a-zA-Z0-9_]*)(?=\s*\()/gi, (_, m) => addToken(m, "text-[#dcdcaa]"));

  // 9. Numbers (Light Green text-[#b5cea8])
  escaped = escaped.replace(/\b(\d+(?:\.\d+)?)\b/g, (_, m) => addToken(m, "text-[#b5cea8] font-medium"));

  // 10. Bracket Pair Colorization (VS Code gold, orchid, sky blue)
  escaped = escaped.replace(/([{}])/g, (_, m) => addToken(m, "text-[#ffd700] font-bold"));
  escaped = escaped.replace(/([()])/g, (_, m) => addToken(m, "text-[#da70d6] font-bold"));
  escaped = escaped.replace(/([\[\]])/g, (_, m) => addToken(m, "text-[#17aeef] font-bold"));

  // 11. Expand token placeholders back into clean HTML spans
  const result = escaped.replace(/\u200B[\u200C\u200D]+\u200B/g, (match) => {
    const idx = decodeTokenId(match);
    const token = tokens[idx];
    return token ? `<span class="${token.className}">${token.text}</span>` : "";
  });

  if (highlightCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = highlightCache.keys().next().value;
    if (oldestKey) highlightCache.delete(oldestKey);
  }
  highlightCache.set(cacheKey, result);

  return result;
};
