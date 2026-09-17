import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

export interface DocumentPage {
  pageNum: number;
  content: string;
  imageDataUrl?: string;
}

export interface ParsedDocumentResult {
  extractedText: string;
  pages: DocumentPage[];
  pageCount: number;
  imageDataUrl?: string;
}

// Ensure pdfjs worker is initialized
if (typeof window !== "undefined" && pdfjsLib) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn("PDF worker initialization warning:", e);
  }
}

/**
 * Enhanced PDF parsing with layout reconstruction (Y-axis sorting & line assembly)
 * and Canvas image rendering for scanned PDFs / page thumbnails.
 */
async function parsePdfFile(file: File): Promise<ParsedDocumentResult> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const pages: DocumentPage[] = [];
  let fullText = "";
  let firstPageImageDataUrl: string | undefined = undefined;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    
    // 1. Reconstruct text line-by-line using spatial layout coordinates
    const textContent = await page.getTextContent();
    const items = textContent.items.map((item: any) => ({
      str: item.str || "",
      x: item.transform ? item.transform[4] : 0,
      y: item.transform ? item.transform[5] : 0,
      hasEOL: !!item.hasEOL
    }));

    // Group items into lines by Y position (~4px threshold)
    const lineMap: { y: number; items: { x: number; str: string }[] }[] = [];

    items.forEach((item) => {
      if (!item.str && !item.hasEOL) return;
      let existingLine = lineMap.find((l) => Math.abs(l.y - item.y) <= 4);
      if (!existingLine) {
        existingLine = { y: item.y, items: [] };
        lineMap.push(existingLine);
      }
      if (item.str) {
        existingLine.items.push({ x: item.x, str: item.str });
      }
    });

    // Sort lines from top (higher Y in PDF coordinates) to bottom
    lineMap.sort((a, b) => b.y - a.y);

    const reconstructedLines: string[] = [];
    lineMap.forEach((line) => {
      // Sort items left to right
      line.items.sort((a, b) => a.x - b.x);
      const lineStr = line.items.map((i) => i.str).join(" ").trim();
      if (lineStr) reconstructedLines.push(lineStr);
    });

    let pageText = reconstructedLines.join("\n").trim();

    // 2. Render Page to Canvas for visual preview & scanned PDF fallback
    let pageImageDataUrl: string | undefined = undefined;
    try {
      const viewport = page.getViewport({ scale: 1.2 });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
        pageImageDataUrl = canvas.toDataURL("image/jpeg", 0.85);
        if (pageNum === 1) {
          firstPageImageDataUrl = pageImageDataUrl;
        }
      }
    } catch (renderErr) {
      console.warn(`Canvas rendering skipped for page ${pageNum}:`, renderErr);
    }

    // If text is empty or sparse (scanned PDF), tag it with OCR vision indicator
    if (!pageText || pageText.length < 30) {
      pageText = `[Scanned / Visual PDF Page ${pageNum} - Vision OCR Enabled]\n` + (pageText || "");
    }

    pages.push({
      pageNum,
      content: pageText,
      imageDataUrl: pageImageDataUrl
    });

    fullText += `--- Page ${pageNum} ---\n${pageText}\n\n`;
  }

  return {
    extractedText: fullText.trim() || `[PDF Document: ${file.name}]`,
    pages,
    pageCount: numPages,
    imageDataUrl: firstPageImageDataUrl
  };
}

/**
 * Enhanced Word (.docx, .doc) parsing with HTML structure conversion (Headings, Tables, Lists)
 */
async function parseDocxFile(file: File): Promise<ParsedDocumentResult> {
  const arrayBuffer = await file.arrayBuffer();
  let markdownContent = "";

  try {
    // Attempt HTML conversion to preserve headings, tables, and lists
    const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
    const htmlStr = htmlResult.value || "";

    if (htmlStr.trim()) {
      markdownContent = htmlStr
        .replace(/<h[1-2][^>]*>(.*?)<\/h[1-2]>/gi, "\n\n## $1\n")
        .replace(/<h[3-6][^>]*>(.*?)<\/h[3-6]>/gi, "\n\n### $1\n")
        .replace(/<li[^>]*>(.*?)<\/li>/gi, "\n- $1")
        .replace(/<tr[^>]*>(.*?)<\/tr>/gi, (_, rowText) => {
          const cells = rowText.replace(/<t[dh][^>]*>(.*?)<\/t[dh]>/gi, " $1 |");
          return `\n|${cells}`;
        })
        .replace(/<p[^>]*>(.*?)<\/p>/gi, "\n\n$1")
        .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
        .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
        .replace(/<[^>]+>/g, ""); // Strip remaining HTML tags
    }
  } catch (err) {
    console.warn("Mammoth HTML conversion fallback to raw text:", err);
  }

  // Fallback to raw text if HTML conversion was empty
  if (!markdownContent.trim()) {
    const rawResult = await mammoth.extractRawText({ arrayBuffer });
    markdownContent = rawResult.value || `[Word Document: ${file.name}]`;
  }

  // Smart section chunking by headings or double newlines
  const rawPages = splitTextIntoLogicalPages(markdownContent);

  return {
    extractedText: markdownContent.trim(),
    pages: rawPages,
    pageCount: rawPages.length
  };
}

/**
 * Image parser with FileReader DataURL extraction for multimodal vision model input
 */
async function parseImageFile(file: File): Promise<ParsedDocumentResult> {
  const imageDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });

  const textDescription = `[Image Document: ${file.name} - Multimodal Vision Analysis Enabled]\nFormat: ${file.type || "Image"}\nSize: ${(file.size / 1024).toFixed(1)} KB`;

  return {
    extractedText: textDescription,
    pages: [
      {
        pageNum: 1,
        content: textDescription,
        imageDataUrl
      }
    ],
    pageCount: 1,
    imageDataUrl
  };
}

/**
 * Markdown (.md) parser splitting logically along section headers
 */
async function parseMarkdownFile(file: File): Promise<ParsedDocumentResult> {
  const text = await file.text();
  const pages = splitTextIntoLogicalPages(text, /^#{1,3}\s+/m);

  return {
    extractedText: text,
    pages,
    pageCount: pages.length
  };
}

/**
 * CSV parser converting comma-separated rows into formatted Markdown tables
 */
async function parseCsvFile(file: File): Promise<ParsedDocumentResult> {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim());

  if (lines.length === 0) {
    return { extractedText: "[Empty CSV]", pages: [{ pageNum: 1, content: "[Empty CSV]" }], pageCount: 1 };
  }

  const parseRow = (row: string) => {
    // Basic CSV cell extraction respecting quotes
    return row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || row.split(",");
  };

  const headerCells = parseRow(lines[0]).map((c) => c.replace(/^"|"$/g, "").trim());
  const headerRow = `| ${headerCells.join(" | ")} |`;
  const dividerRow = `| ${headerCells.map(() => "---").join(" | ")} |`;

  const dataRows = lines.slice(1, 100).map((line) => {
    const cells = parseRow(line).map((c) => c.replace(/^"|"$/g, "").trim());
    return `| ${cells.join(" | ")} |`;
  });

  const markdownTable = [headerRow, dividerRow, ...dataRows].join("\n");
  const pages = splitTextIntoLogicalPages(markdownTable);

  return {
    extractedText: markdownTable,
    pages,
    pageCount: pages.length
  };
}

/**
 * JSON parser pretty-printing JSON structure
 */
async function parseJsonFile(file: File): Promise<ParsedDocumentResult> {
  const text = await file.text();
  let formatted = text;
  try {
    const obj = JSON.parse(text);
    formatted = JSON.stringify(obj, null, 2);
  } catch {
    // Keep as raw if parse fails
  }

  const pages = splitTextIntoLogicalPages(formatted);

  return {
    extractedText: formatted,
    pages,
    pageCount: pages.length
  };
}

/**
 * Helper to split long text into logical page chunks along headers, paragraphs, or function boundaries
 */
function splitTextIntoLogicalPages(fullText: string, customDelimiter?: RegExp): DocumentPage[] {
  const targetChunkSize = 1800;
  if (!fullText || fullText.length <= targetChunkSize) {
    return [{ pageNum: 1, content: fullText || "[Empty Document]" }];
  }

  let rawBlocks: string[] = [];
  if (customDelimiter) {
    rawBlocks = fullText.split(customDelimiter);
  } else {
    // Split on double newlines or paragraph breaks
    rawBlocks = fullText.split(/\n\n+/);
  }

  const pages: DocumentPage[] = [];
  let currentChunk = "";
  let currentPageNum = 1;

  rawBlocks.forEach((block) => {
    const trimmed = block.trim();
    if (!trimmed) return;

    if ((currentChunk + "\n\n" + trimmed).length > targetChunkSize && currentChunk) {
      pages.push({ pageNum: currentPageNum++, content: currentChunk.trim() });
      currentChunk = trimmed;
    } else {
      currentChunk = currentChunk ? currentChunk + "\n\n" + trimmed : trimmed;
    }
  });

  if (currentChunk.trim()) {
    pages.push({ pageNum: currentPageNum, content: currentChunk.trim() });
  }

  return pages.length > 0 ? pages : [{ pageNum: 1, content: fullText }];
}

/**
 * Main file parser router dispatches file reading based on extension
 */
export async function parseUploadedFile(file: File): Promise<ParsedDocumentResult> {
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "";

  if (fileExt === "pdf") {
    return parsePdfFile(file);
  } else if (fileExt === "docx" || fileExt === "doc") {
    return parseDocxFile(file);
  } else if (["png", "jpg", "jpeg", "webp", "gif", "bmp", "svg"].includes(fileExt)) {
    return parseImageFile(file);
  } else if (fileExt === "md" || fileExt === "markdown") {
    return parseMarkdownFile(file);
  } else if (fileExt === "csv" || fileExt === "tsv") {
    return parseCsvFile(file);
  } else if (fileExt === "json") {
    return parseJsonFile(file);
  } else {
    // Plain Text, Code (.py, .js, .ts, .java, .cpp, .html, .css, .log, .txt)
    const text = await file.text();
    const pages = splitTextIntoLogicalPages(text);
    return {
      extractedText: text,
      pages,
      pageCount: pages.length
    };
  }
}
