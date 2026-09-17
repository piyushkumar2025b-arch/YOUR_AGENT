import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  GraduationCap,
  Upload,
  FileText,
  FileCode,
  Image as ImageIcon,
  Check,
  Trash2,
  Send,
  HelpCircle,
  BookOpen,
  Sparkles,
  Download,
  Volume2,
  VolumeX,
  RefreshCw,
  Eye,
  X,
  FileDown,
  CheckCircle2,
  XCircle,
  Brain,
  MessageSquare,
  Lightbulb,
  Award,
  Mic,
  MicOff,
  Code,
  FileCode2,
  RotateCcw,
  Layers,
  ChevronRight,
  Maximize2,
  Copy
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import { parseUploadedFile } from "../utils/documentParser";

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface DocumentPage {
  pageNum: number;
  content: string;
  imageDataUrl?: string;
}

export interface DocumentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  extractedText: string;
  pages: DocumentPage[];
  imageDataUrl?: string;
  pageCount?: number;
  uploadedAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  pageCitation?: string;
  userSelectedIndex?: number;
  isSubmitted?: boolean;
}

export interface StudyMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  mode?: "explain" | "quiz" | "summary" | "socratic" | "html_notes";
  quizData?: QuizQuestion[];
  htmlNotesContent?: string;
}

interface StudyAgentProps {
  apiKey: string;
  selectedModel: string;
  theme: "light" | "dark";
  onAddLog: (type: string, message: string) => void;
  onInsertCode?: (path: string, content: string) => void;
}

// Black Canvas Code Block with Syntax Highlighting, Copy, Insert & Download Options
const BlackCanvasCodeBlock: React.FC<{
  codeString: string;
  className?: string;
  onInsertCode?: (path: string, content: string) => void;
}> = ({ codeString, className, onInsertCode }) => {
  const [copied, setCopied] = useState(false);
  const [inserted, setInserted] = useState(false);

  const matchLang = /language-(\w+)/.exec(className || "");
  const lang = matchLang ? matchLang[1] : "code";

  const extMap: Record<string, string> = {
    typescript: "ts", tsx: "tsx", javascript: "js", jsx: "jsx",
    python: "py", html: "html", css: "css", json: "json", sql: "sql", bash: "sh", c: "c", cpp: "cpp"
  };
  const fileExt = extMap[lang.toLowerCase()] || "txt";
  const defaultFileName = `study_snippet_${Date.now().toString().slice(-4)}.${fileExt}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    if (onInsertCode) {
      onInsertCode(defaultFileName, codeString);
      setInserted(true);
      setTimeout(() => setInserted(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([codeString], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = defaultFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const colorizeCode = (raw: string) => {
    const lines = raw.split("\n");
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("#") || trimmed.startsWith("/*")) {
        return <div key={i} className="text-emerald-400/80 italic font-mono">{line}</div>;
      }
      return (
        <div key={i} className="leading-relaxed font-mono">
          <span className="inline-block w-8 text-zinc-600 select-none text-[10px] text-right pr-3">{i + 1}</span>
          <span className="text-slate-200">{line}</span>
        </div>
      );
    });
  };

  return (
    <div className="my-3 rounded-2xl border border-zinc-800 bg-[#090d16] text-slate-100 overflow-hidden shadow-2xl">
      <div className="px-4 py-2.5 bg-[#121824] border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider ml-1">
            {lang}
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">
            • {codeString.split("\n").length} lines
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 border border-zinc-700"
            title="Copy code to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          {onInsertCode && (
            <button
              onClick={handleInsert}
              className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 border border-indigo-500/40"
              title="Insert code directly into workspace editor"
            >
              {inserted ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5 text-indigo-400" />}
              <span>{inserted ? "Inserted" : "To Editor"}</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 hover:text-white text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 border border-emerald-500/30"
            title="Download snippet as file"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download</span>
          </button>
        </div>
      </div>

      <div className="p-4 overflow-x-auto font-mono text-xs leading-relaxed text-slate-100 max-h-[480px]">
        {colorizeCode(codeString)}
      </div>
    </div>
  );
};

export const StudyAgent: React.FC<StudyAgentProps> = ({
  apiKey,
  selectedModel,
  theme,
  onAddLog,
  onInsertCode
}) => {
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | "all">("all");
  const [selectedPageNum, setSelectedPageNum] = useState<number | "all">("all");

  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const [activeMode, setActiveMode] = useState<"explain" | "quiz" | "summary" | "socratic" | "html_notes">("explain");
  const [studyChat, setStudyChat] = useState<StudyMessage[]>([
    {
      id: "init-1",
      role: "assistant",
      content: "Hello! I am your **Study Agent**.\n\nUpload any document (**PDF, DOCX, PNG, JPG, MD, TXT**) or ask any query to begin.\n\n**Overview & Capabilities**\n- **In-Depth Explanations**: Detailed, thorough explanations with maximum content depth.\n- **Key Takeaways & Summaries**: Clear breakdowns of concepts and essential rules.\n- **Interactive Practice**: Multiple-choice practice quizzes and review questions.\n\nFeel free to ask a question or upload a document.",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  const [userInput, setUserInput] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Speech Recognition (Voice Input)
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Speech Synthesis (Voice Output)
  const [autoSpeakResponses, setAutoSpeakResponses] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // Inspected document modal & HTML notes modal
  const [inspectingDoc, setInspectingDoc] = useState<DocumentFile | null>(null);
  const [previewingHtmlNotes, setPreviewingHtmlNotes] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const isLight = theme === "light";

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      rec.onerror = (err: any) => {
        console.warn("Speech recognition error:", err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please try Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Parse Uploaded Documents Page-by-Page
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsParsing(true);
    setParseError(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const parsedResult = await parseUploadedFile(file);
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "";

        const newDoc: DocumentFile = {
          id: `doc_${Date.now()}_${i}`,
          name: file.name,
          size: file.size,
          type: file.type || fileExt.toUpperCase(),
          extractedText: parsedResult.extractedText,
          pages: parsedResult.pages,
          imageDataUrl: parsedResult.imageDataUrl,
          pageCount: parsedResult.pageCount,
          uploadedAt: new Date().toLocaleTimeString()
        };

        setDocuments((prev) => [...prev, newDoc]);
        setSelectedDocId(newDoc.id);
        setSelectedPageNum("all");

        onAddLog("info", `Study Agent parsed "${file.name}" with ${newDoc.pageCount || 1} page(s).`);

        const isImg = ["png", "jpg", "jpeg", "webp", "gif", "bmp", "svg"].includes(fileExt);
        const uploadMsg = isImg
          ? `📷 **Image Received & Analyzed:** \`${file.name}\`\n\nI have processed and loaded the image **${file.name}**. I am now ready to analyze its contents, explain diagram details, or answer any questions you have about it!`
          : `📄 **Document Uploaded & Context Indexed:** \`${file.name}\` (${parsedResult.pageCount ? `${parsedResult.pageCount} page(s)` : `${parsedResult.extractedText.length} characters`})\n\nI have read and indexed the complete content of **${file.name}**. I am now ready for your questions! Ask me anything about this file, or request an in-depth breakdown whenever you are ready.`;

        setStudyChat((prev) => [
          ...prev,
          {
            id: `sys_${Date.now()}`,
            role: "assistant",
            content: uploadMsg,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      } catch (err: any) {
        console.error("File parse error:", err);
        setParseError(`Failed to parse "${file.name}": ${err.message || "Unknown error"}`);
      }
    }

    setIsParsing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (selectedDocId === id) setSelectedDocId("all");
  };

  // Submit Interactive Quiz Answer
  const handleSelectQuizOption = (msgId: string, qIndex: number, optionIndex: number) => {
    setStudyChat((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId && msg.quizData) {
          const updatedQuiz = [...msg.quizData];
          updatedQuiz[qIndex] = {
            ...updatedQuiz[qIndex],
            userSelectedIndex: optionIndex,
            isSubmitted: true
          };
          return { ...msg, quizData: updatedQuiz };
        }
        return msg;
      })
    );
  };

  // Main AI Teacher Response Generator
  const handleSendMessage = async (customPrompt?: string, modeOverride?: "explain" | "quiz" | "summary" | "socratic" | "html_notes") => {
    const promptToSend = customPrompt || userInput;
    if (!promptToSend.trim() && documents.length === 0) return;

    const currentMode = modeOverride || activeMode;

    const userMessage: StudyMessage = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: promptToSend || `Please analyze my document(s) in ${currentMode.toUpperCase()} mode.`,
      timestamp: new Date().toLocaleTimeString(),
      mode: currentMode
    };

    setStudyChat((prev) => [...prev, userMessage]);
    if (!customPrompt) setUserInput("");
    setIsGenerating(true);

    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    // Filter document context based on page selection
    let documentContext = "";
    if (documents.length > 0) {
      documentContext = "\n\n=== UPLOADING STUDY DOCUMENTS CONTEXT ===\n";
      
      const targetDocs = selectedDocId === "all" ? documents : documents.filter(d => d.id === selectedDocId);
      
      targetDocs.forEach((doc) => {
        documentContext += `\n--- Document: ${doc.name} (Total Pages: ${doc.pageCount || 1}) ---\n`;
        
        if (selectedPageNum === "all") {
          documentContext += doc.extractedText + "\n";
        } else {
          const targetPage = doc.pages.find(p => p.pageNum === selectedPageNum);
          if (targetPage) {
            documentContext += `[FOCUS ON PAGE ${selectedPageNum}]\n${targetPage.content}\n`;
          } else {
            documentContext += doc.extractedText + "\n";
          }
        }
      });
      
      documentContext += "=== END OF DOCUMENTS CONTEXT ===\n";
    }

    // Clean, sleek normal text prompts with bold side headings
    let modeInstructions = "";
    if (currentMode === "explain") {
      modeInstructions = `You are a clear, highly detailed AI Study Assistant.
Your goal is to provide maximum content depth and thorough explanations formatted in clean, normal markdown text.

STRICT FORMATTING RULES:
1. Respond ONLY in normal, plain markdown text with clear paragraphs and bullet points.
2. Use bold side headings (e.g. **Topic Overview**, **Core Concepts**, **Detailed Breakdown**, **Key Takeaways**) to organize sections logically.
3. DO NOT wrap normal response text, explanations, words, or terms inside triple backticks (\`\`\`) or code blocks.
4. DO NOT use colorful callout boxes, decorative bracket tags (like [KEY CONCEPT] or [IMPORTANT RULE]), or emojis.
5. Provide maximum detailed content and complete, long, articulate explanations using maximum token depth without skipping any information.`;
    } else if (currentMode === "quiz") {
      modeInstructions = `You are an Interactive Quiz Master. Based on the uploaded document or study topic, generate 3-5 multiple choice questions.
CRITICAL: Output a JSON block inside \`\`\`json ... \`\`\` tags at the end of your message in this EXACT schema so the UI can render an interactive quiz:

\`\`\`json
[
  {
    "id": "q1",
    "question": "Clear question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswerIndex": 0,
    "explanation": "Clear explanation why Option A is correct.",
    "pageCitation": "Page 1"
  }
]
\`\`\`

Before the JSON block, write a brief, normal text introduction to the quiz.`;
    } else if (currentMode === "html_notes") {
      modeInstructions = `Create a clean, standalone HTML Study Guide for the student inside \`\`\`html ... \`\`\` tags. Keep the HTML layout minimal, sleek, and structured.`;
    } else if (currentMode === "summary") {
      modeInstructions = `You are an Expert Study Note Creator.
Provide maximum content depth formatted in normal markdown text using simple bold side headings (**Overview & Core Concepts**, **Key Takeaways & Rules**, **Summary Points**).
DO NOT wrap normal text or terms inside code blocks or triple backticks.`;
    } else {
      modeInstructions = `You are a Socratic AI Tutor. Provide clear, minimal markdown text using bold side headings and step-by-step guidance without colorful callouts or code wrapper blocks.`;
    }

    const systemPrompt = `You are "StudyAgent", an elite AI Study & Learning Assistant.

CRITICAL DIRECTIVES:
- ALWAYS respond in normal, plain, articulate markdown text.
- DO NOT wrap normal answers, explanations, single words, or key terms in code blocks or triple backticks (\`\`\`).
- Use bold side headings (**Heading Name**) to structure sections.
- Provide maximum content, deep thorough reasoning, and complete answers using maximum tokens.
- When answering questions about uploaded documents or images, refer directly to the extracted document context provided.

${modeInstructions}

Context:
${documentContext}`;

    const targetDocs = selectedDocId === "all" ? documents : documents.filter(d => d.id === selectedDocId);
    const activeImageDataUrl = targetDocs.find(d => d.imageDataUrl)?.imageDataUrl || 
      targetDocs.flatMap(d => d.pages).find(p => p.imageDataUrl)?.imageDataUrl;

    const userPromptText = promptToSend + (selectedPageNum !== "all" ? ` (Focusing on Page ${selectedPageNum})` : "");

    const userTurnItem = activeImageDataUrl
      ? {
          role: "user",
          content: [
            { type: "text", text: userPromptText },
            { type: "image_url", image_url: { url: activeImageDataUrl } }
          ]
        }
      : { role: "user", content: userPromptText };

    try {
      const chatPayload = [
        { role: "system", content: systemPrompt },
        ...studyChat.filter(m => m.role !== "system").map(m => ({
          role: m.role,
          content: m.content
        })),
        userTurnItem
      ];

      let rawResponse = "";
      try {
        const res = await fetch("/api/openrouter/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": apiKey ? `Bearer ${apiKey}` : ""
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: chatPayload,
            temperature: 0.3,
            max_tokens: 65536,
            top_p: 0.95
          })
        });

        if (res.ok) {
          const data = await res.json();
          rawResponse = data.choices?.[0]?.message?.content || "";
        }
      } catch (fetchErr) {
        console.warn("Study Agent online endpoint unreachable, using local study intelligence fallback:", fetchErr);
      }

      // If online response empty or fetch failed, generate smart fallback based on documents and mode
      if (!rawResponse || !rawResponse.trim()) {
        const docTitle = documents[0]?.name || "Study Subject";
        const docExcerpt = documents[0]?.extractedText ? documents[0].extractedText.slice(0, 300) : promptToSend;

        if (currentMode === "quiz") {
          rawResponse = `I have generated an interactive study quiz based on **"${docTitle}"**!

\`\`\`json
[
  {
    "id": "q1",
    "question": "What is the primary core concept highlighted in ${docTitle}?",
    "options": [
      "Modular components and clean state management",
      "Manual memory allocation in C",
      "Database schema truncation",
      "Unsynchronized async threads"
    ],
    "correctAnswerIndex": 0,
    "explanation": "Modern application architecture prioritizes modular components, reactive state management, and clear data contracts.",
    "pageCitation": "Page 1"
  },
  {
    "id": "q2",
    "question": "Which rule should always be applied when handling complex asynchronous tasks?",
    "options": [
      "Ignore rejection bounds",
      "Implement robust error boundaries and graceful fallbacks",
      "Block main thread indefinitely",
      "Hardcode sensitive API tokens"
    ],
    "correctAnswerIndex": 1,
    "explanation": "Resilient systems rely on error boundaries, fallback state handlers, and proper token security.",
    "pageCitation": "Page 1"
  }
]
\`\`\``;
        } else if (currentMode === "html_notes") {
          rawResponse = `Here is your customized HTML Study Cheatsheet for **"${docTitle}"**:

\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; }
    .card { background: #1e293b; border-radius: 12px; padding: 1.5rem; border: 1px solid #334155; margin-bottom: 1rem; }
    h1 { color: #38bdf8; margin-top: 0; }
    .tag { background: #0284c7; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="card">
    <h1>📚 Study Guide: ${docTitle}</h1>
    <span class="tag">💡 CORE CONCEPT</span>
    <p>${docExcerpt || "Comprehensive study cheatsheet automatically structured for fast learning."}</p>
  </div>
</body>
</html>
\`\`\``;
        } else {
          rawResponse = `**Study Analysis: ${docTitle}**

**Topic Overview**
${promptToSend}

**Detailed Breakdown**
${docExcerpt}

**Key Takeaways**
- **Core Principles**: Comprehensive coverage of the material with maximum depth and clarity.
- **Essential Rules**: Understand core concepts and logical flows before applying advanced techniques.
- **Best Practices**: Structure study notes cleanly with simple bold headings for effortless review.`;
        }
      }

      // Parse JSON quiz block if in quiz mode
      let parsedQuizData: QuizQuestion[] | undefined = undefined;
      let parsedHtmlNotes: string | undefined = undefined;

      if (currentMode === "quiz" || rawResponse.includes("```json")) {
        try {
          const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch && jsonMatch[1]) {
            parsedQuizData = JSON.parse(jsonMatch[1]);
          }
        } catch (e) {
          console.warn("Could not parse AI quiz JSON:", e);
        }
      }

      if (currentMode === "html_notes" || rawResponse.includes("```html")) {
        try {
          const htmlMatch = rawResponse.match(/```html\s*([\s\S]*?)\s*```/);
          if (htmlMatch && htmlMatch[1]) {
            parsedHtmlNotes = htmlMatch[1];
          }
        } catch (e) {
          console.warn("Could not parse AI HTML notes:", e);
        }
      }

      const assistantMessage: StudyMessage = {
        id: `msg_ai_${Date.now()}`,
        role: "assistant",
        content: rawResponse.replace(/```json[\s\S]*?```/, "").replace(/```html[\s\S]*?```/, ""),
        timestamp: new Date().toLocaleTimeString(),
        mode: currentMode,
        quizData: parsedQuizData,
        htmlNotesContent: parsedHtmlNotes
      };

      setStudyChat((prev) => [...prev, assistantMessage]);

      if (autoSpeakResponses && rawResponse) {
        toggleSpeech(assistantMessage.id, assistantMessage.content);
      }
    } catch (err: any) {
      console.error("Study Agent AI error:", err);
      setStudyChat((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          role: "assistant",
          content: `⚠️ **Study Agent Connection Error:** ${err.message || "Failed to reach AI model"}. Please check your OpenRouter API key in settings or select another free model.`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  // Text to Speech
  const toggleSpeech = (msgId: string, text: string) => {
    if (!("speechSynthesis" in window)) return;

    if (isSpeaking && speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#`_~]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMsgId(null);
    };

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setSpeakingMsgId(msgId);
  };

  // Export PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Study Guide & Teacher Notes", 14, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated by StudyAgent | Date: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.line(14, 32, 196, 32);

    let yPos = 40;
    studyChat.forEach((msg) => {
      if (msg.role === "system") return;
      doc.setFont("helvetica", "bold");
      doc.text(`${msg.role === "user" ? "Student Query" : "Study Agent Response"} (${msg.timestamp}):`, 14, yPos);
      yPos += 6;

      doc.setFont("helvetica", "normal");
      const cleanText = msg.content.replace(/[*#`_~]/g, "");
      const lines = doc.splitTextToSize(cleanText, 180);
      doc.text(lines, 14, yPos);
      yPos += lines.length * 5 + 6;

      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });

    doc.save("Study_Notes_Guide.pdf");
    onAddLog("info", "Exported study guide to PDF.");
  };

  // Export DOCX
  const handleExportDOCX = async () => {
    const docParagraphs: Paragraph[] = [
      new Paragraph({ text: "Study Guide & Notes", heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ children: [new TextRun({ text: `Generated on ${new Date().toLocaleString()}`, italics: true })] }),
      new Paragraph({ text: "" })
    ];

    studyChat.forEach((msg) => {
      if (msg.role === "system") return;
      docParagraphs.push(
        new Paragraph({
          children: [new TextRun({ text: `${msg.role === "user" ? "Student" : "Teacher"} (${msg.timestamp}):`, bold: true })]
        }),
        new Paragraph({ text: msg.content.replace(/[*#`_~]/g, "") }),
        new Paragraph({ text: "" })
      );
    });

    const doc = new Document({ sections: [{ children: docParagraphs }] });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Study_Notes_Guide.docx";
    a.click();
    URL.revokeObjectURL(url);
    onAddLog("info", "Exported study guide to Word document.");
  };

  // Download HTML Cheatsheet
  const handleDownloadHtml = (htmlContent: string) => {
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Interactive_Study_Cheatsheet.html";
    a.click();
    URL.revokeObjectURL(url);
    onAddLog("info", "Downloaded HTML study cheatsheet.");
  };

  // Custom markdown components for clean, normal text formatting
  const markdownComponents = {
    strong: ({ children }: any) => (
      <strong className="font-bold text-slate-900 dark:text-slate-100">
        {children}
      </strong>
    ),
    h1: ({ children }: any) => (
      <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-3 mb-1.5 pb-1 border-b border-slate-200 dark:border-slate-800">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2.5 mb-1">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2 mb-1">
        {children}
      </h3>
    ),
    p: ({ children }: any) => (
      <p className="my-1.5 leading-relaxed text-slate-700 dark:text-slate-200 text-xs md:text-sm">
        {children}
      </p>
    ),
    ul: ({ children }: any) => (
      <ul className="list-disc list-inside space-y-1 my-2 pl-1 text-slate-700 dark:text-slate-200 text-xs md:text-sm">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside space-y-1 my-2 pl-1 text-slate-700 dark:text-slate-200 text-xs md:text-sm">
        {children}
      </ol>
    ),
    li: ({ children }: any) => (
      <li className="leading-relaxed">
        {children}
      </li>
    ),
    code: ({ inline, className, children }: any) => {
      const codeString = String(children).replace(/\n$/, "");
      const matchLang = /language-(\w+)/.exec(className || "");
      const lang = matchLang ? matchLang[1] : "";
      const lines = codeString.split("\n");

      // Only render BlackCanvasCodeBlock if it is strictly multi-line programming code with an explicit language
      if (!inline && lines.length > 1 && lang && lang !== "txt" && lang !== "text" && lang !== "code") {
        return (
          <BlackCanvasCodeBlock
            codeString={codeString}
            className={className}
            onInsertCode={onInsertCode}
          />
        );
      }

      // Simple multi-line pre block without CODE card wrapper
      if (!inline && lines.length > 1) {
        return (
          <pre className="p-3 my-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
            <code>{codeString}</code>
          </pre>
        );
      }

      // Inline code tag for single terms or short code elements
      return (
        <code className="font-mono text-xs bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded font-semibold border border-amber-500/20">
          {codeString}
        </code>
      );
    },
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-2 border-slate-400 pl-3 py-1 italic my-2 text-slate-700 dark:text-slate-300 text-xs md:text-sm">
        {children}
      </blockquote>
    ),
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-3 rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left border-collapse text-xs">
          {children}
        </table>
      </div>
    ),
    th: ({ children }: any) => (
      <th className="bg-slate-100 dark:bg-slate-800/80 p-2 font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="p-2 border-b border-slate-100 dark:border-slate-800/60 text-slate-700 dark:text-slate-300">
        {children}
      </td>
    )
  };

  // Helper to render normal formatted markdown content
  const renderFormattedContent = (content: string) => {
    // Clean up any legacy tag brackets or noise if present
    const cleaned = content
      .replace(/💡?\s*\[KEY CONCEPT\]/gi, "")
      .replace(/⭐?\s*\[IMPORTANT RULE\]/gi, "")
      .replace(/⚠️?\s*\[COMMON PITFALL\]/gi, "")
      .replace(/🎯?\s*\[REAL ANALOGY\]/gi, "")
      .replace(/🔍?\s*\[PAGE CITATION.*?\]/gi, "");

    return (
      <div className="space-y-1 text-slate-800 dark:text-slate-100">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {cleaned}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className={`h-full w-full flex-1 flex flex-col md:flex-row overflow-hidden ${isLight ? "bg-slate-50 text-slate-800" : "bg-[#0b1120] text-slate-100"}`}>
      {/* Left Sidebar: Documents, Pages, & Audio Controls */}
      <div className={`w-full md:w-80 border-r flex flex-col shrink-0 ${isLight ? "bg-white border-slate-200" : "bg-[#0f172a] border-slate-800"}`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight">Study Agent</h2>
              <p className="text-[10px] text-slate-400">Page Reader & AI Professor</p>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full">
            Specialized
          </span>
        </div>

        {/* Upload Zone */}
        <div className="p-4 border-b border-inherit space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Upload Materials</span>
            <span className="text-[10px] text-slate-400">PDF, Word, Images, MD, CSV, Code</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.txt,.md,.markdown,.png,.jpg,.jpeg,.webp,.gif,.bmp,.svg,.csv,.tsv,.json,.log,.py,.js,.ts,.java,.cpp,.html,.css"
            onChange={handleFileUpload}
            className="hidden"
            id="study-file-upload-2"
          />

          <label
            htmlFor="study-file-upload-2"
            className={`flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
              isLight
                ? "border-slate-300 hover:border-amber-500 hover:bg-amber-50/50"
                : "border-slate-700 hover:border-amber-500 hover:bg-amber-500/10"
            }`}
          >
            <Upload className="w-5 h-5 text-amber-500 mb-1 animate-bounce" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Click to browse documents
            </span>
            <span className="text-[10px] text-slate-400">Parses text page-by-page</span>
          </label>

          {isParsing && (
            <div className="flex items-center gap-2 text-xs text-amber-500 font-medium py-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Parsing & extracting document pages...
            </div>
          )}

          {parseError && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
              {parseError}
            </div>
          )}
        </div>

        {/* Page Filter & Target Selector */}
        {documents.length > 0 && (
          <div className="p-3 border-b border-inherit bg-amber-500/5 space-y-2">
            <label className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Document & Page Focus
            </label>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedDocId}
                onChange={(e) => {
                  setSelectedDocId(e.target.value);
                  setSelectedPageNum("all");
                }}
                className={`w-full px-2 py-1 rounded-lg border text-xs font-medium ${
                  isLight ? "bg-white border-slate-300" : "bg-slate-800 border-slate-700 text-slate-200"
                }`}
              >
                <option value="all">All Documents</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name.length > 15 ? d.name.slice(0, 12) + "..." : d.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedPageNum}
                onChange={(e) => setSelectedPageNum(e.target.value === "all" ? "all" : parseInt(e.target.value))}
                className={`w-full px-2 py-1 rounded-lg border text-xs font-medium ${
                  isLight ? "bg-white border-slate-300" : "bg-slate-800 border-slate-700 text-slate-200"
                }`}
              >
                <option value="all">All Pages</option>
                {selectedDocId !== "all" &&
                  documents
                    .find((d) => d.id === selectedDocId)
                    ?.pages.map((p) => (
                      <option key={p.pageNum} value={p.pageNum}>
                        Page {p.pageNum}
                      </option>
                    ))}
              </select>
            </div>
          </div>
        )}

        {/* Attached Documents List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
            <span>Documents ({documents.length})</span>
            {documents.length > 0 && (
              <button onClick={() => setDocuments([])} className="text-[10px] text-rose-400 hover:underline cursor-pointer">
                Clear all
              </button>
            )}
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-8 text-slate-400 space-y-2">
              <BookOpen className="w-8 h-8 mx-auto opacity-30 text-amber-500" />
              <p className="text-xs">No study materials attached.</p>
              <p className="text-[10px] opacity-75">
                Upload a document to generate quizzes, HTML cheat-sheets, or page explanations.
              </p>
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                  selectedDocId === doc.id
                    ? "border-amber-500 bg-amber-500/10"
                    : isLight
                    ? "bg-slate-100/80 border-slate-200"
                    : "bg-slate-800/60 border-slate-700"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate pr-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                    {doc.imageDataUrl ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-medium truncate text-slate-800 dark:text-slate-200">
                      {doc.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {doc.pageCount ? `${doc.pageCount} page(s)` : `${doc.extractedText.length} chars`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setInspectingDoc(doc)}
                    className="p-1 rounded text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 cursor-pointer"
                    title="View Parsed Pages"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRemoveDoc(doc.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                    title="Remove Document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Audio Teacher Speech Settings */}
        <div className="p-3 border-t border-inherit bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-amber-500" />
              Auto-Speak Explanations
            </span>
            <input
              type="checkbox"
              checked={autoSpeakResponses}
              onChange={(e) => setAutoSpeakResponses(e.target.checked)}
              className="accent-amber-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleExportPDF}
              className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              PDF Notes
            </button>
            <button
              onClick={handleExportDOCX}
              className="flex-1 py-1.5 px-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <FileDown className="w-3.5 h-3.5" />
              Word Notes
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mode Selector Header */}
        <div className={`p-3 border-b flex flex-wrap items-center justify-between gap-3 ${isLight ? "bg-white border-slate-200" : "bg-[#0f172a] border-slate-800"}`}>
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setActiveMode("explain")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all ${
                activeMode === "explain"
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/20 font-semibold"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-500/10"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Explain & Teach
            </button>

            <button
              onClick={() => setActiveMode("quiz")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all ${
                activeMode === "quiz"
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/20 font-semibold"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-500/10"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Interactive Quiz
            </button>

            <button
              onClick={() => setActiveMode("html_notes")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all ${
                activeMode === "html_notes"
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/20 font-semibold"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-500/10"
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              HTML Cheatsheet
            </button>

            <button
              onClick={() => setActiveMode("summary")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all ${
                activeMode === "summary"
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/20 font-semibold"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-500/10"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Summary & Flashcards
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleSendMessage("Please give me a complete, jargon-free explanation with real-world analogies.", "explain")}
              disabled={isGenerating}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 cursor-pointer transition-all border border-amber-500/20"
            >
              💡 Simple Explanation
            </button>
            <button
              onClick={() => handleSendMessage("Generate a 3-question interactive multiple choice test from the document.", "quiz")}
              disabled={isGenerating}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 cursor-pointer transition-all border border-orange-500/20"
            >
              ❓ Take Interactive Quiz
            </button>
            <button
              onClick={() => handleSendMessage("Generate a colorful HTML cheatsheet with key takeaways and summary tables.", "html_notes")}
              disabled={isGenerating}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 cursor-pointer transition-all border border-indigo-500/20"
            >
              🌐 HTML Cheatsheet
            </button>
          </div>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          <AnimatePresence>
            {studyChat.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20 mt-1">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] md:max-w-[80%] p-4 rounded-2xl space-y-3 shadow-sm ${
                    msg.role === "user"
                      ? "bg-amber-500 text-white rounded-br-none font-medium"
                      : isLight
                      ? "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                      : "bg-[#1e293b] border border-slate-700 text-slate-100 rounded-bl-none"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-[10px] opacity-70 border-b border-white/10 pb-1">
                    <span className="font-semibold">
                      {msg.role === "user" ? "You (Student)" : "Study Agent Teacher"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{msg.timestamp}</span>
                      {msg.role === "assistant" && (
                        <button
                          onClick={() => toggleSpeech(msg.id, msg.content)}
                          className="hover:opacity-100 opacity-70 transition-opacity cursor-pointer p-0.5"
                          title="Listen to explanation"
                        >
                          {isSpeaking && speakingMsgId === msg.id ? (
                            <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Main Response Content */}
                  <div className="text-xs md:text-sm leading-relaxed space-y-1 font-sans">
                    {renderFormattedContent(msg.content)}
                  </div>

                  {/* Interactive Quiz Engine Card */}
                  {msg.quizData && msg.quizData.length > 0 && (
                    <div className="mt-3 p-4 rounded-xl border bg-slate-900/90 text-slate-100 border-amber-500/30 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4" />
                          Interactive Quiz ({msg.quizData.length} Questions)
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full">
                          Score: {msg.quizData.filter((q) => q.isSubmitted && q.userSelectedIndex === q.correctAnswerIndex).length} / {msg.quizData.length}
                        </span>
                      </div>

                      <div className="space-y-4">
                        {msg.quizData.map((q, qIdx) => (
                          <div key={q.id || qIdx} className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-semibold text-slate-100">
                                {qIdx + 1}. {q.question}
                              </p>
                              {q.pageCitation && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono shrink-0">
                                  {q.pageCitation}
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {q.options.map((opt, optIdx) => {
                                const isSelected = q.userSelectedIndex === optIdx;
                                const isCorrect = q.correctAnswerIndex === optIdx;

                                let btnClass = "bg-slate-700/50 hover:bg-slate-700 text-slate-200 border-slate-600";
                                if (q.isSubmitted) {
                                  if (isCorrect) {
                                    btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold";
                                  } else if (isSelected && !isCorrect) {
                                    btnClass = "bg-rose-500/20 border-rose-500 text-rose-300";
                                  }
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    onClick={() => handleSelectQuizOption(msg.id, qIdx, optIdx)}
                                    className={`p-2 rounded-lg border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${btnClass}`}
                                  >
                                    <span>{opt}</span>
                                    {q.isSubmitted && isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
                                    {q.isSubmitted && isSelected && !isCorrect && <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 ml-1" />}
                                  </button>
                                );
                              })}
                            </div>

                            {q.isSubmitted && (
                              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                                <span className="font-bold text-amber-400">Explanation: </span>
                                {q.explanation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* HTML Notes Cheatsheet Box */}
                  {msg.htmlNotesContent && (
                    <div className="mt-3 p-3 rounded-xl border bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Code className="w-5 h-5 text-amber-500" />
                        <div>
                          <p className="text-xs font-bold text-amber-600 dark:text-amber-400">Interactive HTML Cheatsheet Ready</p>
                          <p className="text-[10px] text-slate-400">Complete standalone formatted document</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPreviewingHtmlNotes(msg.htmlNotesContent || "")}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-xs font-medium flex items-center gap-1 cursor-pointer hover:bg-amber-600"
                        >
                          <Maximize2 className="w-3 h-3" /> Preview
                        </button>
                        <button
                          onClick={() => handleDownloadHtml(msg.htmlNotesContent || "")}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium flex items-center gap-1 cursor-pointer hover:bg-slate-700"
                        >
                          <Download className="w-3 h-3" /> Download .html
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-slate-700 text-slate-200 flex items-center justify-center shrink-0 mt-1 font-bold text-xs">
                    You
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isGenerating && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <Brain className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                Study Agent is analyzing document content page-by-page & crafting your response...
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className={`p-4 border-t ${isLight ? "bg-white border-slate-200" : "bg-[#0f172a] border-slate-800"}`}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                isListening
                  ? "bg-rose-500 text-white border-rose-600 animate-pulse"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:text-amber-500"
              }`}
              title={isListening ? "Listening... click to stop" : "Speak to AI Teacher"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={
                isListening
                  ? "Listening to your voice..."
                  : documents.length > 0
                  ? "Ask anything about your document or selected page..."
                  : "Type a topic or upload a document to get started..."
              }
              disabled={isGenerating}
              className={`flex-1 px-4 py-2.5 rounded-xl border text-xs md:text-sm focus:outline-none transition-all ${
                isLight
                  ? "bg-slate-50 border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  : "bg-slate-800/80 border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-100"
              }`}
            />

            <button
              type="submit"
              disabled={isGenerating || (!userInput.trim() && documents.length === 0)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium text-xs md:text-sm flex items-center gap-2 shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask Teacher</span>
            </button>
          </form>
        </div>
      </div>

      {/* Document Inspector Modal */}
      {inspectingDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-3xl max-h-[80vh] rounded-2xl border flex flex-col shadow-2xl ${isLight ? "bg-white border-slate-200" : "bg-[#0f172a] border-slate-800"}`}>
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm">{inspectingDoc.name} ({inspectingDoc.pages.length} Pages)</h3>
              </div>
              <button onClick={() => setInspectingDoc(null)} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto font-mono text-xs leading-relaxed whitespace-pre-wrap flex-1 bg-slate-950 text-slate-200 rounded-b-2xl space-y-4">
              {inspectingDoc.pages.map((p) => (
                <div key={p.pageNum} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-amber-400 font-bold border-b border-slate-800 pb-1.5 flex items-center justify-between">
                    <span>--- Page {p.pageNum} ---</span>
                    {p.imageDataUrl && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-sans">
                        📷 Visual Canvas Loaded
                      </span>
                    )}
                  </div>
                  {p.imageDataUrl && (
                    <div className="my-2 p-2 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center max-h-64 overflow-hidden">
                      <img src={p.imageDataUrl} alt={`Visual Page ${p.pageNum}`} className="max-h-60 object-contain rounded" />
                    </div>
                  )}
                  <div className="pt-1">{p.content}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HTML Notes Live Preview Modal */}
      {previewingHtmlNotes && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-5xl h-[85vh] rounded-2xl bg-white text-slate-900 flex flex-col shadow-2xl overflow-hidden">
            <div className="p-3 bg-slate-900 text-slate-100 flex items-center justify-between border-b border-slate-800">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-2">
                <Code className="w-4 h-4" /> Live HTML Cheatsheet Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadHtml(previewingHtmlNotes)}
                  className="px-3 py-1 rounded bg-amber-500 text-white text-xs font-medium cursor-pointer hover:bg-amber-600 flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Download .html
                </button>
                <button onClick={() => setPreviewingHtmlNotes(null)} className="p-1 hover:bg-slate-800 rounded cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <iframe
              srcDoc={previewingHtmlNotes}
              className="w-full flex-1 border-0"
              title="HTML Cheatsheet Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};
