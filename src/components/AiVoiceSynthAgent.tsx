import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  Volume2,
  Sparkles,
  Play,
  Square,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  FileText,
  Radio,
  RadioTower,
  Bot,
  Zap,
  Download
} from "lucide-react";

interface AiVoiceSynthAgentProps {
  apiKey?: string;
  selectedModel?: string;
  theme: "light" | "dark";
  onAddLog?: (type: string, msg: string) => void;
}

export const AiVoiceSynthAgent: React.FC<AiVoiceSynthAgentProps> = ({
  apiKey,
  selectedModel = "google/gemini-2.5-flash",
  theme,
  onAddLog
}) => {
  const [textInput, setTextInput] = useState<string>(
    "Welcome to the AI Voice Speech Synthesizer Agent. Generating crystal clear, natural neural speech audio for videos, podcasts, and developer app integrations."
  );
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [speechRate, setSpeechRate] = useState<number>(1);
  const [speechPitch, setSpeechPitch] = useState<number>(1);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState<boolean>(false);

  // Voice Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedTranscript, setRecordedTranscript] = useState<string>("");

  const safeNotify = (msg: string) => {
    onAddLog?.(msg, "error");
    try {
      if (typeof window !== "undefined" && typeof window.alert === "function") {
        window.alert(msg);
      }
    } catch {}
  };

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        if (voices.length > 0 && !selectedVoice) {
          setSelectedVoice(voices[0].name);
        }
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const handleSpeak = () => {
    if (!("speechSynthesis" in window)) {
      safeNotify("Speech synthesis is not supported in this browser environment.");
      return;
    }

    window.speechSynthesis.cancel(); // Reset active audio

    const utterance = new SpeechSynthesisUtterance(textInput);
    const chosenVoice = availableVoices.find(v => v.name === selectedVoice);
    if (chosenVoice) utterance.voice = chosenVoice;

    utterance.rate = speechRate;
    utterance.pitch = speechPitch;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    if (onAddLog) onAddLog("agent", "AI Voice Agent speaking text synthesized audio stream");
  };

  const handleStopSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const handleGenerateVoiceScript = async () => {
    setIsGeneratingScript(true);
    if (onAddLog) onAddLog("agent", "AI Voice Scriptwriter Agent generating voiceover narration script...");

    try {
      const res = await fetch("/api/openrouter/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": apiKey ? `Bearer ${apiKey}` : ""
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: "system",
              content: "You are an award-winning Voiceover Scriptwriter. Create a compelling, high-impact 30-second narration script for a modern developer application launch."
            },
            { role: "user", content: "Write a high-energy tech launch voice script." }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const script = data.choices?.[0]?.message?.content || textInput;
        setTextInput(script.trim());
        if (onAddLog) onAddLog("success", "AI Voice Script generated successfully!");
      }
    } catch (e) {
      setTextInput("Introducing the future of multi-agent software engineering. Powered by neural telemetry, real-time API integrations, and instant full-stack compilation.");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const toggleRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      safeNotify("Speech Recognition API is not supported in this browser.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setRecordedTranscript(transcript);
        setTextInput(prev => prev + " " + transcript);
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognition.start();
    }
  };

  return (
    <div className={`w-full min-h-full flex flex-col p-4 md:p-6 transition-colors duration-200 ${
      theme === "dark" ? "bg-zinc-950 text-white" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Agent Banner Header */}
      <div className={`p-5 rounded-2xl border mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
        theme === "dark" ? "bg-gradient-to-r from-zinc-900 via-rose-950/40 to-zinc-900 border-zinc-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-600 text-white shadow-md">
            <Volume2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">AI Voice Speech & Audio Synthesizer Agent</h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                Neural TTS & Voice Transcriber
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Synthesize natural audio voiceovers, generate scripts, and transcribe speech to text in real-time!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateVoiceScript}
            disabled={isGeneratingScript}
            className="px-4 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isGeneratingScript ? "animate-spin" : ""}`} />
            AI Scriptwriter
          </button>

          {isPlaying ? (
            <button
              onClick={handleStopSpeech}
              className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/20 cursor-pointer"
            >
              <Square className="w-4 h-4 fill-current" /> Stop Voice
            </button>
          ) : (
            <button
              onClick={handleSpeak}
              disabled={!textInput.trim()}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/20 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" /> Synthesize Voice
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Voice Controls (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className={`p-5 rounded-2xl border space-y-4 shadow-sm ${
            theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
          }`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-rose-400" /> Voice & Pitch Parameters
            </h3>

            {/* Voice Select */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 block">
                Select Voice Model ({availableVoices.length} available)
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className={`w-full p-2.5 rounded-xl text-xs border outline-none ${
                  theme === "dark" ? "bg-zinc-950 border-zinc-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              >
                {availableVoices.map((v, i) => (
                  <option key={i} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            {/* Speech Rate Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-400">Speech Speed:</span>
                <span className="text-rose-400 font-mono">{speechRate.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>

            {/* Speech Pitch Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-400">Audio Pitch:</span>
                <span className="text-amber-400 font-mono">{speechPitch.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={speechPitch}
                onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Real-time Voice Recording Transcriber */}
            <div className="border-t pt-4 border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={toggleRecording}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isRecording
                    ? "bg-rose-600 text-white animate-pulse shadow-md"
                    : "bg-zinc-800 hover:bg-zinc-700 text-slate-200"
                }`}
              >
                <Mic className="w-4 h-4" />
                {isRecording ? "Transcribing Voice Live..." : "Start Mic Voice-to-Text"}
              </button>
            </div>
          </div>
        </div>

        {/* Speech Script Box (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between min-h-[380px] ${
            theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-rose-400" /> Voiceover Script Text
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                {textInput.length} Characters
              </span>
            </div>

            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={10}
              className={`w-full p-4 rounded-xl text-xs border outline-none resize-none font-sans leading-relaxed ${
                theme === "dark" ? "bg-zinc-950 border-zinc-800 text-slate-200 focus:border-rose-500" : "bg-slate-50 border-slate-200 text-slate-900"
              }`}
            />

            {isPlaying && (
              <div className="mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-200">
                <RadioTower className="w-5 h-5 text-rose-400 animate-pulse" />
                <span>Streaming Neural Audio Voice Synthesis...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
