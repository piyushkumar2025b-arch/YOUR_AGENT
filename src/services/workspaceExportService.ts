import { VirtualFile } from "../types";

// Dynamic JSZip loader for fast code splitting
export const exportSingleFile = (file: VirtualFile) => {
  const blob = new Blob([file.content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.path.split("/").pop() || "file.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportFolderZip = async (folderPath: string, files: VirtualFile[]) => {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const folderPrefix = folderPath.endsWith("/") ? folderPath : folderPath + "/";
  const matched = files.filter(f => f.path.startsWith(folderPrefix));

  if (matched.length === 0) {
    throw new Error(`Folder "${folderPath}" is empty or has no files to export.`);
  }

  matched.forEach(f => {
    const relPath = f.path.slice(folderPrefix.length);
    zip.file(relPath, f.content);
  });

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${folderPath.replace(/\//g, "-")}-folder.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportWorkspaceZip = async (files: VirtualFile[]) => {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  files.forEach(file => {
    zip.file(file.path, file.content);
  });

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = `agent-workspace-${Date.now()}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportWordDocument = async (title: string, promptOrContent: string, contentMaybe?: string) => {
  const promptText = contentMaybe !== undefined ? promptOrContent : "";
  const content = contentMaybe !== undefined ? contentMaybe : promptOrContent;
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");

  const paragraphs: any[] = [
    new Paragraph({
      text: title || "Project Document",
      heading: HeadingLevel.TITLE,
      spacing: { after: 300 }
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated via AI Developer Studio • ${new Date().toLocaleDateString()}`,
          italics: true,
          color: "666666"
        })
      ],
      spacing: { after: 400 }
    })
  ];

  if (promptText) {
    paragraphs.push(
      new Paragraph({
        text: "Objective & Specification",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 150 }
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: promptText,
            color: "333333"
          })
        ],
        spacing: { after: 300 }
      })
    );
  }

  paragraphs.push(
    new Paragraph({
      text: "Content & Implementation",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 150 }
    })
  );

  const lines = (content || "").split("\n");
  for (const line of lines) {
    if (line.trim().startsWith("# ")) {
      paragraphs.push(
        new Paragraph({
          text: line.replace("# ", "").trim(),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 }
        })
      );
    } else if (line.trim().startsWith("## ")) {
      paragraphs.push(
        new Paragraph({
          text: line.replace("## ", "").trim(),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 180, after: 100 }
        })
      );
    } else if (line.trim().startsWith("### ")) {
      paragraphs.push(
        new Paragraph({
          text: line.replace("### ", "").trim(),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 140, after: 80 }
        })
      );
    } else if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      paragraphs.push(
        new Paragraph({
          text: line.replace(/^[-*]\s+/, ""),
          bullet: { level: 0 },
          spacing: { after: 80 }
        })
      );
    } else if (line.trim().length > 0) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun(line)],
          spacing: { after: 120 }
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, "-") || "document"}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportPdfDocument = async (title: string, promptOrContent: string, contentMaybe?: string) => {
  const promptText = contentMaybe !== undefined ? promptOrContent : "";
  const content = contentMaybe !== undefined ? contentMaybe : promptOrContent;
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter"
  });

  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxLineWidth = pageWidth - margin * 2;
  let cursorY = 50;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(24, 24, 27);
  doc.text(title || "Document Summary", margin, cursorY);
  cursorY += 25;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(113, 113, 122);
  doc.text(`Generated on ${new Date().toLocaleDateString()} • AI Developer Studio`, margin, cursorY);
  cursorY += 30;

  if (promptText) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(79, 70, 229);
    doc.text("PROMPT OBJECTIVE:", margin, cursorY);
    cursorY += 16;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(63, 63, 70);
    const splitPrompt = doc.splitTextToSize(promptText, maxLineWidth);
    doc.text(splitPrompt, margin, cursorY);
    cursorY += splitPrompt.length * 14 + 20;
  }

  doc.setDrawColor(228, 228, 231);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 25;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(24, 24, 27);
  doc.text("DOCUMENT CONTENT:", margin, cursorY);
  cursorY += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(39, 39, 42);

  const rawLines = (content || "").split("\n");
  for (const rawLine of rawLines) {
    if (cursorY > 730) {
      doc.addPage();
      cursorY = 50;
    }

    if (rawLine.trim().startsWith("#")) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(24, 24, 27);
      cursorY += 10;
      doc.text(rawLine.replace(/#/g, "").trim(), margin, cursorY);
      cursorY += 16;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(39, 39, 42);
    } else {
      const wrapped = doc.splitTextToSize(rawLine, maxLineWidth);
      doc.text(wrapped, margin, cursorY);
      cursorY += wrapped.length * 14;
    }
  }

  doc.save(`${title.toLowerCase().replace(/[^a-z0-9]/g, "-") || "document"}.pdf`);
};

export const generateBentoSvg = (title: string, promptText: string): string => {
  const safeTitle = (title || "Bento Showcase").replace(/[<>&]/g, "");
  const safePrompt = (promptText || "Automated layout").replace(/[<>&]/g, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#090d16" />
    </linearGradient>
    <linearGradient id="neonAccent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="50%" stop-color="#a855f7" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="675" fill="url(#bgGrad)" rx="24"/>

  <!-- Header Section -->
  <text x="60" y="80" fill="#a5b4fc" font-family="system-ui, sans-serif" font-size="14" font-weight="700" letter-spacing="2">AI DEVELOPER STUDIO • BENTO SPEC</text>
  <text x="60" y="125" fill="#ffffff" font-family="system-ui, sans-serif" font-size="34" font-weight="800">${safeTitle}</text>
  <text x="60" y="155" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="16">${safePrompt}</text>

  <!-- Bento Card 1: Core Engine -->
  <rect x="60" y="190" width="480" height="200" rx="16" fill="#1e293b" fill-opacity="0.7" stroke="#334155" stroke-width="1.5" />
  <circle cx="95" cy="225" r="16" fill="#6366f1" fill-opacity="0.2" />
  <text x="90" y="231" fill="#818cf8" font-family="system-ui, sans-serif" font-size="16" font-weight="bold">⚡</text>
  <text x="125" y="230" fill="#ffffff" font-family="system-ui, sans-serif" font-size="18" font-weight="700">Multi-Model Architecture</text>
  <text x="95" y="270" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="14">OpenRouter Swarm + Gemini 2.5 Flash</text>
  <text x="95" y="295" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="14">Adaptive Reasoning &amp; Low-Latency Streaming</text>
  <rect x="95" y="335" width="200" height="6" rx="3" fill="url(#neonAccent)"/>

  <!-- Bento Card 2: Security & Sandbox -->
  <rect x="560" y="190" width="580" height="200" rx="16" fill="#1e293b" fill-opacity="0.7" stroke="#334155" stroke-width="1.5" />
  <circle cx="595" cy="225" r="16" fill="#10b981" fill-opacity="0.2" />
  <text x="590" y="231" fill="#34d399" font-family="system-ui, sans-serif" font-size="16" font-weight="bold">🛡️</text>
  <text x="625" y="230" fill="#ffffff" font-family="system-ui, sans-serif" font-size="18" font-weight="700">Hardened Sandboxed Execution</text>
  <text x="595" y="270" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="14">Strict SSRF Filter, Timing-Safe Token Verifier</text>
  <text x="595" y="295" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="14">Zero-Leak Environment Isolation &amp; Rate Guards</text>
  <rect x="595" y="335" width="280" height="6" rx="3" fill="#10b981"/>

  <!-- Bento Card 3: Codebase Virtual System -->
  <rect x="60" y="410" width="700" height="215" rx="16" fill="#1e293b" fill-opacity="0.7" stroke="#334155" stroke-width="1.5" />
  <text x="95" y="450" fill="#ffffff" font-family="system-ui, sans-serif" font-size="18" font-weight="700">Virtual In-Memory Tree</text>
  <text x="95" y="485" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="14">Realtime syntax tree diffing and instant browser hydration</text>
  <text x="95" y="515" fill="#64748b" font-family="monospace" font-size="13">&gt; Initializing modular multi-agent workers...</text>
  <text x="95" y="540" fill="#64748b" font-family="monospace" font-size="13">&gt; Live hot-swapping enabled with zero frame drop</text>
  <text x="95" y="575" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">Status: Online &amp; Optimized (60 FPS)</text>

  <!-- Bento Card 4: Metrics -->
  <rect x="780" y="410" width="360" height="215" rx="16" fill="#1e293b" fill-opacity="0.7" stroke="#334155" stroke-width="1.5" />
  <text x="815" y="450" fill="#ffffff" font-family="system-ui, sans-serif" font-size="18" font-weight="700">Performance Index</text>
  <text x="815" y="510" fill="#a855f7" font-family="system-ui, sans-serif" font-size="44" font-weight="800">1000x</text>
  <text x="815" y="545" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="14">Parallel Modular Execution</text>
  <text x="815" y="585" fill="#10b981" font-family="system-ui, sans-serif" font-size="13" font-weight="600">✓ Parallel Chunk Loading Active</text>
</svg>`;
};
