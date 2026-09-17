import React, { useState } from "react";
import {
  BookOpen,
  Sparkles,
  Wand2,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Download,
  Share2,
  FileCode,
  Bookmark,
  RefreshCw,
  Play,
  Pause,
  Feather,
  Flame,
  Compass,
  Heart,
  Ghost,
  Shield,
  Zap,
  RotateCcw,
  Plus,
  Trash2,
  ChevronRight,
  BookMarked,
  Sliders,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface StoryChapter {
  id: string;
  chapterNumber: number;
  title: string;
  content: string;
  choices?: string[];
  selectedChoice?: string;
}

export interface Story {
  id: string;
  title: string;
  genre: string;
  tone: string;
  protagonist: string;
  setting: string;
  chapters: StoryChapter[];
  createdAt: string;
}

interface StoryMakerProps {
  apiKey: string;
  selectedModel?: string;
  theme: "light" | "dark";
  onAddLog?: (type: string, message: string) => void;
  onInsertCode?: (path: string, content: string) => void;
}

const GENRES = [
  { id: "sci-fi", label: "Sci-Fi & Cyberpunk", icon: <Zap className="w-4 h-4 text-cyan-400" /> },
  { id: "fantasy", label: "Epic Fantasy", icon: <Shield className="w-4 h-4 text-amber-400" /> },
  { id: "mystery", label: "Noir & Mystery", icon: <Compass className="w-4 h-4 text-indigo-400" /> },
  { id: "horror", label: "Supernatural Thriller", icon: <Ghost className="w-4 h-4 text-rose-400" /> },
  { id: "romance", label: "Romance & Drama", icon: <Heart className="w-4 h-4 text-pink-400" /> },
  { id: "adventure", label: "Action & Expedition", icon: <Flame className="w-4 h-4 text-emerald-400" /> }
];

const TONES = ["Dramatic & Intense", "Whimsical & Magical", "Dark & Gritty", "Humorous & Satirical", "Poetic & Cinematic", "Philosophical"];

const SAMPLE_PROMPTS = [
  "A rogue AI in a neon-lit futuristic Tokyo discovers an ancient human artifact.",
  "An apprentice alchemist accidentally creates a potion that turns shadows into gold.",
  "A detective investigating a silent town where nobody has slept for 7 days.",
  "A time traveler trapped in 1920s Paris with only a broken pocket watch."
];

export const StoryMaker: React.FC<StoryMakerProps> = ({
  apiKey,
  selectedModel,
  theme,
  onAddLog,
  onInsertCode
}) => {
  // Form controls
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("sci-fi");
  const [tone, setTone] = useState("Poetic & Cinematic");
  const [protagonist, setProtagonist] = useState("Kaelen, a renegade starship engineer");
  const [setting, setSetting] = useState("Sub-level 9 of Neo-Vanguard station");
  const [plotOutline, setPlotOutline] = useState("");

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [activeView, setActiveView] = useState<"blueprint" | "story">("blueprint");
  const [customChoiceInput, setCustomChoiceInput] = useState("");
  const [savedStories, setSavedStories] = useState<Story[]>([]);

  // Audio / Speech
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exported, setExported] = useState(false);

  // Generate initial chapter or full story
  const handleGenerateStory = async () => {
    setIsGenerating(true);
    if (onAddLog) onAddLog("story", `Generating Chapter 1 for "${title || 'Untitled Story'}" (${genre})...`);

    const storyPrompt = plotOutline.trim() || SAMPLE_PROMPTS[0];

    try {
      const res = await fetch("/api/openrouter/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": apiKey ? `Bearer ${apiKey}` : ""
        },
        body: JSON.stringify({
          model: selectedModel || "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are an award-winning novelist and master storyteller. Generate Chapter 1 of an immersive, atmospheric story based on the user's choices.
Return strictly a valid JSON object in this exact schema (no markdown formatting outside JSON):
{
  "title": "An evocative, fitting title for the story",
  "chapterTitle": "Chapter 1: Title",
  "chapterContent": "3-4 paragraphs of vivid, well-written narrative narrative with dialogue and rich sensory detail.",
  "choices": [
    "Option 1: Bold action path",
    "Option 2: Stealth or investigative path",
    "Option 3: Unexpected or mystery path"
  ]
}`
            },
            {
              role: "user",
              content: `Genre: ${genre}\nTone: ${tone}\nProtagonist: ${protagonist}\nSetting: ${setting}\nPlot Seed: ${storyPrompt}`
            }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const rawContent = data.choices?.[0]?.message?.content || "";
        const cleanJson = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
        const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleanJson);

        const newStory: Story = {
          id: `story_${Date.now()}`,
          title: parsed.title || title || "The Uncharted Path",
          genre,
          tone,
          protagonist,
          setting,
          createdAt: new Date().toLocaleDateString(),
          chapters: [
            {
              id: `chap_1`,
              chapterNumber: 1,
              title: parsed.chapterTitle || "Chapter 1: The Beginning",
              content: parsed.chapterContent,
              choices: parsed.choices || [
                "Investigate the strange signal emitting from the core.",
                "Conceal your presence and wait for the patrol to pass.",
                "Send an encrypted distress signal to the resistance."
              ]
            }
          ]
        };

        setCurrentStory(newStory);
        setActiveView("story");
        if (onAddLog) onAddLog("story", `Story Chapter 1 generated successfully!`);
      }
    } catch (err) {
      console.warn("Story generation fallback:", err);
      // Fallback generator
      const fallbackStory: Story = {
        id: `story_${Date.now()}`,
        title: title || "Echoes in the Neon Dusk",
        genre,
        tone,
        protagonist,
        setting,
        createdAt: new Date().toLocaleDateString(),
        chapters: [
          {
            id: `chap_1`,
            chapterNumber: 1,
            title: "Chapter 1: The First Resonance",
            content: `The neon rain washed over the reinforced steel grids of ${setting}, reflecting hues of cyan and amber against the dark pavement. ${protagonist} paused, checking the flickering hum of the bio-scanner mounted on their forearm.\n\nA sharp mechanical click echoed from down the alleyway. Something was moving inside the abandoned relay node—a frequency that shouldn't exist in this sector.`,
            choices: [
              "Step into the alleyway with scanner armed.",
              "Retreat up the emergency fire ladder to high ground.",
              "Deploy a micro-drone to recon the relay node."
            ]
          }
        ]
      };
      setCurrentStory(fallbackStory);
      setActiveView("story");
    } finally {
      setIsGenerating(false);
    }
  };

  // Continue story with choice
  const handleContinueStory = async (chosenOption: string) => {
    if (!currentStory) return;
    setIsGenerating(true);
    const nextChapterNum = currentStory.chapters.length + 1;
    if (onAddLog) onAddLog("story", `Generating Chapter ${nextChapterNum} based on choice: "${chosenOption.slice(0, 30)}..."`);

    try {
      const storyHistory = currentStory.chapters
        .map(c => `Chapter ${c.chapterNumber}: ${c.title}\n${c.content}`)
        .join("\n\n");

      const res = await fetch("/api/openrouter/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": apiKey ? `Bearer ${apiKey}` : ""
        },
        body: JSON.stringify({
          model: selectedModel || "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are continuing an ongoing interactive story. Write Chapter ${nextChapterNum} following directly from the user's chosen path.
Return strictly a JSON object matching this schema (no markdown formatting outside JSON):
{
  "chapterTitle": "Chapter ${nextChapterNum}: Title",
  "chapterContent": "3-4 compelling paragraphs detailing the consequences of the choice and moving the plot forward.",
  "choices": [
    "Next Option 1",
    "Next Option 2",
    "Next Option 3"
  ]
}`
            },
            {
              role: "user",
              content: `Prior Story Context:\n${storyHistory}\n\nUser Chosen Action: ${chosenOption}`
            }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const rawContent = data.choices?.[0]?.message?.content || "";
        const cleanJson = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
        const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleanJson);

        const newChap: StoryChapter = {
          id: `chap_${nextChapterNum}`,
          chapterNumber: nextChapterNum,
          title: parsed.chapterTitle || `Chapter ${nextChapterNum}`,
          content: parsed.chapterContent,
          choices: parsed.choices || ["Advance to the next location", "Examine the clue closer", "Face the upcoming threat"]
        };

        const updatedChapters = [...(currentStory.chapters || [])];
        if (updatedChapters.length > 0) {
          updatedChapters[updatedChapters.length - 1].selectedChoice = chosenOption;
        }
        updatedChapters.push(newChap);

        setCurrentStory({ ...currentStory, chapters: updatedChapters });
        if (onAddLog) onAddLog("story", `Chapter ${nextChapterNum} added!`);
      }
    } catch (err) {
      console.warn("Chapter continuation fallback:", err);
      const nextChapNum = currentStory.chapters.length + 1;
      const fallbackChap: StoryChapter = {
        id: `chap_${nextChapNum}`,
        chapterNumber: nextChapNum,
        title: `Chapter ${nextChapNum}: Unfolding Consequences`,
        content: `Taking action on "${chosenOption}", ${protagonist} moved carefully into position. The shadows shifted as an unexpected revelation emerged from the depths of ${setting}.\n\nEvery decision brought both new allies and hidden dangers into sharper focus.`,
        choices: ["Press forward deeper", "Hold position and assemble evidence", "Formulate a new strategy"]
      };

      const updated = [...(currentStory.chapters || [])];
      if (updated.length > 0) {
        updated[updated.length - 1].selectedChoice = chosenOption;
      }
      updated.push(fallbackChap);
      setCurrentStory({ ...currentStory, chapters: updated });
    } finally {
      setIsGenerating(false);
      setCustomChoiceInput("");
    }
  };

  // Voice narration
  const handleToggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!currentStory || !window.speechSynthesis) return;

    const fullText = currentStory.chapters.map(c => `${c.title}. ${c.content}`).join("\n\n");
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Export to workspace
  const handleExportToWorkspace = () => {
    if (!currentStory || !onInsertCode) return;

    const fullMd = `# ${currentStory.title}

*Genre: ${currentStory.genre} | Tone: ${currentStory.tone}*
*Protagonist: ${currentStory.protagonist} | Setting: ${currentStory.setting}*

---

${currentStory.chapters.map(c => `## ${c.title}\n\n${c.content}\n\n${c.selectedChoice ? `*> Chosen Path: ${c.selectedChoice}*\n` : ''}`).join('\n---\n\n')}
`;

    const fileName = `story_${currentStory.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`;
    onInsertCode(fileName, fullMd);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  return (
    <div className={`h-full w-full flex flex-col overflow-hidden ${
      theme === "dark" ? "bg-[#0b0e14] text-slate-100" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Top Banner Header */}
      <div className={`px-6 py-3.5 border-b flex items-center justify-between gap-4 shrink-0 ${
        theme === "dark" ? "bg-[#111622] border-zinc-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-lg shadow-rose-500/20">
            <Feather className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight flex items-center gap-2">
              AI Story Maker & Interactive Novelist
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Choose Your Adventure
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Co-create immersive multi-chapter stories with AI dialogue, branching choices, and voice narration
            </p>
          </div>
        </div>

        {currentStory && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSpeech}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                isSpeaking
                  ? "bg-rose-500 text-white animate-pulse"
                  : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30"
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              <span>{isSpeaking ? "Stop Narration" : "Listen Narration"}</span>
            </button>

            {onInsertCode && (
              <button
                onClick={handleExportToWorkspace}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/20"
              >
                {exported ? <Check className="w-3.5 h-3.5" /> : <FileCode className="w-3.5 h-3.5" />}
                <span>{exported ? "Saved to Workspace" : "Export Markdown"}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Narrow Screen Switcher */}
      <div className={`flex lg:hidden items-center border-b p-2 gap-2 shrink-0 ${
        theme === "dark" ? "bg-[#0d121c] border-zinc-800" : "bg-white border-slate-200"
      }`}>
        <button
          onClick={() => setActiveView("blueprint")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeView === "blueprint"
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Story Blueprint
        </button>
        <button
          onClick={() => setActiveView("story")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeView === "story"
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Read Story {currentStory ? `(${currentStory.chapters.length} Ch)` : ""}
        </button>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden w-full min-h-0">
        {/* Left Sidebar: Controls & Parameters */}
        <div className={`lg:col-span-5 xl:col-span-4 border-r flex flex-col h-full overflow-y-auto p-4 space-y-4 ${
          activeView === "blueprint" ? "flex" : "hidden lg:flex"
        } ${
          theme === "dark" ? "bg-[#0d121c] border-zinc-800" : "bg-white border-slate-200"
        }`}>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Story Blueprint Setup
            </label>
            <p className="text-[11px] text-slate-400">Customize the universe, character, and tone of your AI tale.</p>
          </div>

          {/* Genre Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Genre</label>
            <div className="grid grid-cols-2 gap-2">
              {GENRES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGenre(g.id)}
                  className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer text-left ${
                    genre === g.id
                      ? "bg-amber-500/20 border-amber-500 text-white ring-1 ring-amber-500"
                      : "bg-zinc-900/60 border-zinc-800 text-slate-300 hover:border-zinc-700"
                  }`}
                >
                  {g.icon}
                  <span className="truncate">{g.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tone & Style */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Narrative Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              {TONES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Protagonist */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Protagonist / Main Character</label>
            <input
              type="text"
              value={protagonist}
              onChange={(e) => setProtagonist(e.target.value)}
              placeholder="e.g. Lyra, an exiled starship navigator"
              className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Setting */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Setting & World</label>
            <input
              type="text"
              value={setting}
              onChange={(e) => setSetting(e.target.value)}
              placeholder="e.g. The sunken glass towers of Atlantis"
              className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Plot Seed */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Opening Hook / Plot Seed</label>
            <textarea
              value={plotOutline}
              onChange={(e) => setPlotOutline(e.target.value)}
              rows={3}
              placeholder="Describe the initial mystery or situation..."
              className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Sample prompts */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Need inspiration?</span>
            <div className="space-y-1">
              {SAMPLE_PROMPTS.slice(0, 2).map((sp, idx) => (
                <button
                  key={idx}
                  onClick={() => setPlotOutline(sp)}
                  className="w-full text-left p-2 rounded-lg bg-zinc-900/40 hover:bg-zinc-800 text-[11px] text-slate-300 border border-zinc-800/60 line-clamp-2 cursor-pointer transition-all"
                >
                  "{sp}"
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateStory}
            disabled={isGenerating}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-auto"
          >
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            <span>{isGenerating ? "Crafting Story Chapter..." : "Create New Story"}</span>
          </button>
        </div>

        {/* Right Pane: Interactive Novel View */}
        <div className={`lg:col-span-7 xl:col-span-8 flex flex-col h-full overflow-hidden ${
          activeView === "story" ? "flex" : "hidden lg:flex"
        } ${
          theme === "dark" ? "bg-[#090c12]" : "bg-slate-100"
        }`}>
          {!currentStory ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1">
                <h2 className="text-base font-bold text-slate-100">Your AI Story Canvas Awaits</h2>
                <p className="text-xs text-slate-400">
                  Select a genre, name your hero, and click <strong>Create New Story</strong> to generate your first interactive chapter.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-3xl mx-auto w-full">
              {/* Story Header */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-zinc-900 via-[#131926] to-zinc-900 border border-zinc-800 text-center space-y-2 shadow-xl">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {currentStory.genre.toUpperCase()} • {currentStory.tone}
                </span>
                <h1 className="text-xl font-extrabold text-white tracking-tight">{currentStory.title}</h1>
                <p className="text-xs text-slate-400">
                  Hero: <strong className="text-slate-200">{currentStory.protagonist}</strong> | Setting: <strong className="text-slate-200">{currentStory.setting}</strong>
                </p>
              </div>

              {/* Chapter Timeline */}
              <div className="space-y-6">
                {currentStory.chapters.map((chap, idx) => (
                  <motion.div
                    key={chap.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl bg-[#111723] border border-zinc-800 space-y-4 shadow-md"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                      <h2 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center justify-center border border-amber-500/30">
                          {chap.chapterNumber}
                        </span>
                        {chap.title}
                      </h2>
                      <span className="text-[10px] text-slate-500 font-mono">Chapter {chap.chapterNumber}</span>
                    </div>

                    <div className="text-xs leading-relaxed text-slate-200 space-y-3 font-serif whitespace-pre-line tracking-wide">
                      {chap.content}
                    </div>

                    {chap.selectedChoice && (
                      <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-purple-300 flex items-center gap-2 font-sans">
                        <Check className="w-4 h-4 text-purple-400 shrink-0" />
                        <span><strong>Chosen Path:</strong> "{chap.selectedChoice}"</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Choices Box for Latest Chapter */}
              {currentStory.chapters.length > 0 && (
                <div className="p-6 rounded-3xl bg-[#131926] border border-amber-500/30 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-400 animate-pulse" />
                    <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      What happens next? Choose your path:
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {currentStory.chapters[currentStory.chapters.length - 1].choices?.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleContinueStory(opt)}
                        disabled={isGenerating}
                        className="w-full text-left p-3 rounded-xl bg-zinc-900/80 hover:bg-amber-600/20 text-xs font-semibold text-slate-200 border border-zinc-800 hover:border-amber-500/50 transition-all cursor-pointer flex items-center justify-between group disabled:opacity-50"
                      >
                        <span>{opt}</span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>

                  {/* Custom Choice */}
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={customChoiceInput}
                      onChange={(e) => setCustomChoiceInput(e.target.value)}
                      placeholder="Or type a custom action..."
                      className="flex-1 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && customChoiceInput.trim()) {
                          handleContinueStory(customChoiceInput.trim());
                        }
                      }}
                    />
                    <button
                      onClick={() => customChoiceInput.trim() && handleContinueStory(customChoiceInput.trim())}
                      disabled={isGenerating || !customChoiceInput.trim()}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
