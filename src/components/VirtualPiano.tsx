import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Volume2,
  Sliders,
  Sparkles,
  Music2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Zap,
  Disc,
  Info
} from "lucide-react";
import {
  audioSynthEngine,
  PianoPreset,
  getNoteFrequency
} from "../services/audioSynthEngine";

interface VirtualPianoProps {
  theme?: "light" | "dark" | string;
  onNotePlay?: (note: string) => void;
}

// 3 Full Octaves: C3 to B5
const WHITE_NOTES = ["C", "D", "E", "F", "G", "A", "B"];
const BLACK_NOTE_OFFSETS: Record<number, string> = {
  0: "C#", // between C & D
  1: "D#", // between D & E
  3: "F#", // between F & G
  4: "G#", // between G & A
  5: "A#"  // between A & B
};

// Keyboard mappings for Octave 4 (Middle C) and parts of Octave 5
const KEY_MAP: Record<string, string> = {
  // Lower / Octave 4
  a: "C4",
  w: "C#4",
  s: "D4",
  e: "D#4",
  d: "E4",
  f: "F4",
  t: "F#4",
  g: "G4",
  y: "G#4",
  h: "A4",
  u: "A#4",
  j: "B4",
  // Upper / Octave 5
  k: "C5",
  o: "C#5",
  l: "D5",
  p: "D#5",
  ";": "E5",
  "'": "F5"
};

const CHORD_INTERVALS: Record<string, number[]> = {
  single: [0],
  major: [0, 4, 7],
  minor: [0, 3, 7],
  seventh: [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  sus4: [0, 5, 7],
  octaves: [0, 12]
};

export const VirtualPiano: React.FC<VirtualPianoProps> = ({
  theme = "dark",
  onNotePlay
}) => {
  const isDark = theme !== "light";

  const [preset, setPreset] = useState<PianoPreset>("grand");
  const [octaveShift, setOctaveShift] = useState<number>(0); // -2 to +2
  const [isSustainOn, setIsSustainOn] = useState<boolean>(false);
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [chordMode, setChordMode] = useState<string>("single");
  const [showKeyLabels, setShowKeyLabels] = useState<boolean>(true);
  const [velocity, setVelocity] = useState<number>(0.85);

  // Arpeggiator state
  const [isArpOn, setIsArpOn] = useState<boolean>(false);
  const [arpSpeed, setArpSpeed] = useState<number>(140); // ms per step
  const [arpPattern, setArpPattern] = useState<"up" | "down" | "updown" | "random">("up");
  const arpTimerRef = useRef<number | null>(null);
  const heldArpNotesRef = useRef<string[]>([]);

  // Toggle sustain
  const toggleSustain = useCallback(() => {
    setIsSustainOn((prev) => {
      const next = !prev;
      audioSynthEngine.setSustainPedal(next);
      return next;
    });
  }, []);

  // Play single note with chord expansion
  const triggerNoteOn = useCallback(
    (baseNote: string) => {
      const match = baseNote.match(/^([A-G]#?)(\d+)$/);
      if (!match) return;

      const noteName = match[1];
      const baseOctave = parseInt(match[2], 10) + octaveShift;
      const fullBaseNote = `${noteName}${baseOctave}`;

      const intervals = CHORD_INTERVALS[chordMode] || [0];
      const noteNamesAll = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
      const baseIndex = noteNamesAll.indexOf(noteName);

      const notesToPlay: string[] = [];

      intervals.forEach((semitones) => {
        const totalIndex = baseIndex + semitones;
        const noteIdx = ((totalIndex % 12) + 12) % 12;
        const octDelta = Math.floor(totalIndex / 12);
        const chordNote = `${noteNamesAll[noteIdx]}${baseOctave + octDelta}`;
        notesToPlay.push(chordNote);
      });

      if (isArpOn) {
        // Add to held arp notes
        heldArpNotesRef.current = Array.from(new Set([...heldArpNotesRef.current, ...notesToPlay]));
      } else {
        notesToPlay.forEach((n) => {
          audioSynthEngine.playPianoNote(n, preset, velocity);
          if (onNotePlay) onNotePlay(n);
        });
      }

      setActiveNotes((prev) => new Set([...prev, ...notesToPlay]));
    },
    [preset, octaveShift, chordMode, isArpOn, velocity, onNotePlay]
  );

  // Stop single note
  const triggerNoteOff = useCallback(
    (baseNote: string) => {
      const match = baseNote.match(/^([A-G]#?)(\d+)$/);
      if (!match) return;

      const noteName = match[1];
      const baseOctave = parseInt(match[2], 10) + octaveShift;
      const intervals = CHORD_INTERVALS[chordMode] || [0];
      const noteNamesAll = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
      const baseIndex = noteNamesAll.indexOf(noteName);

      const notesToStop: string[] = [];

      intervals.forEach((semitones) => {
        const totalIndex = baseIndex + semitones;
        const noteIdx = ((totalIndex % 12) + 12) % 12;
        const octDelta = Math.floor(totalIndex / 12);
        const chordNote = `${noteNamesAll[noteIdx]}${baseOctave + octDelta}`;
        notesToStop.push(chordNote);
      });

      if (isArpOn) {
        heldArpNotesRef.current = heldArpNotesRef.current.filter((n) => !notesToStop.includes(n));
      } else {
        notesToStop.forEach((n) => {
          audioSynthEngine.stopPianoNote(n);
        });
      }

      setActiveNotes((prev) => {
        const updated = new Set(prev);
        notesToStop.forEach((n) => updated.delete(n));
        return updated;
      });
    },
    [octaveShift, chordMode, isArpOn]
  );

  // Arpeggiator loop
  useEffect(() => {
    if (!isArpOn) {
      if (arpTimerRef.current !== null) {
        window.clearInterval(arpTimerRef.current);
        arpTimerRef.current = null;
      }
      return;
    }

    let step = 0;
    let direction = 1;

    arpTimerRef.current = window.setInterval(() => {
      const notes = heldArpNotesRef.current;
      if (notes.length === 0) return;

      let noteToPlay: string;
      if (arpPattern === "random") {
        noteToPlay = notes[Math.floor(Math.random() * notes.length)];
      } else if (arpPattern === "down") {
        step = (step + notes.length - 1) % notes.length;
        noteToPlay = notes[step];
      } else if (arpPattern === "updown") {
        if (notes.length === 1) {
          noteToPlay = notes[0];
        } else {
          step += direction;
          if (step >= notes.length - 1) {
            direction = -1;
            step = notes.length - 1;
          } else if (step <= 0) {
            direction = 1;
            step = 0;
          }
          noteToPlay = notes[step];
        }
      } else {
        // "up"
        step = (step + 1) % notes.length;
        noteToPlay = notes[step];
      }

      audioSynthEngine.playPianoNote(noteToPlay, preset, velocity);
      if (onNotePlay) onNotePlay(noteToPlay);
    }, arpSpeed);

    return () => {
      if (arpTimerRef.current !== null) {
        window.clearInterval(arpTimerRef.current);
        arpTimerRef.current = null;
      }
    };
  }, [isArpOn, arpSpeed, arpPattern, preset, velocity, onNotePlay]);

  // QWERTY Computer Keyboard listener
  useEffect(() => {
    const pressedKeys = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing inside an input, textarea, or contentEditable
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest(".monaco-editor"))
      ) {
        return;
      }

      // Spacebar toggles sustain pedal
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        toggleSustain();
        return;
      }

      const key = e.key.toLowerCase();
      if (KEY_MAP[key] && !pressedKeys.has(key)) {
        pressedKeys.add(key);
        triggerNoteOn(KEY_MAP[key]);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (KEY_MAP[key]) {
        pressedKeys.delete(key);
        triggerNoteOff(KEY_MAP[key]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [triggerNoteOn, triggerNoteOff, toggleSustain]);

  // Generate piano keys for Octaves 3, 4, and 5
  const octaves = [3, 4, 5];

  return (
    <div
      className={`rounded-2xl border flex flex-col p-4 select-none transition-all ${
        isDark ? "bg-[#18181b] border-zinc-800 text-zinc-100" : "bg-white border-slate-200 text-slate-800 shadow-sm"
      }`}
    >
      {/* HEADER / CONTROL STRIP */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800/60 dark:border-zinc-800 mb-4">
        {/* Instrument Preset Selector */}
        <div className="flex items-center gap-2">
          <Music2 className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-bold tracking-tight">Sound Preset:</span>
          <div className="flex items-center bg-zinc-900/80 dark:bg-zinc-900 border border-zinc-700/60 rounded-xl p-0.5 text-xs">
            {(
              [
                { id: "grand", label: "Grand Piano", icon: "🎹" },
                { id: "rhodes", label: "Rhodes EP", icon: "⚡" },
                { id: "synth", label: "80s Poly Synth", icon: "🚀" },
                { id: "felt", label: "Soft Felt", icon: "🧸" },
                { id: "chiptune", label: "8-Bit Arcade", icon: "🕹️" },
                { id: "organ", label: "Pipe Organ", icon: "⛪" }
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                onClick={() => setPreset(p.id)}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  preset === p.id
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                }`}
              >
                <span>{p.icon}</span>
                <span className="hidden sm:inline">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Octave & Dynamics Strip */}
        <div className="flex items-center gap-3">
          {/* Octave Transpose */}
          <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-700/60 rounded-xl px-2 py-1 text-xs">
            <span className="text-zinc-400 font-medium">Octave:</span>
            <button
              onClick={() => setOctaveShift((prev) => Math.max(-2, prev - 1))}
              disabled={octaveShift <= -2}
              className="p-1 rounded hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
              title="Octave Down"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono font-bold w-4 text-center">
              {octaveShift > 0 ? `+${octaveShift}` : octaveShift}
            </span>
            <button
              onClick={() => setOctaveShift((prev) => Math.min(2, prev + 1))}
              disabled={octaveShift >= 2}
              className="p-1 rounded hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
              title="Octave Up"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Chord Mode Trigger */}
          <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-700/60 rounded-xl px-2 py-1 text-xs">
            <span className="text-zinc-400 font-medium">Chord:</span>
            <select
              value={chordMode}
              onChange={(e) => setChordMode(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="single" className="bg-zinc-900">Single Note</option>
              <option value="major" className="bg-zinc-900">Major Triad</option>
              <option value="minor" className="bg-zinc-900">Minor Triad</option>
              <option value="seventh" className="bg-zinc-900">Dominant 7th</option>
              <option value="maj7" className="bg-zinc-900">Major 7th</option>
              <option value="sus4" className="bg-zinc-900">Sus4 Chord</option>
              <option value="octaves" className="bg-zinc-900">Octave Stack</option>
            </select>
          </div>

          {/* Sustain Pedal Button */}
          <button
            onClick={toggleSustain}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isSustainOn
                ? "bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-xs"
                : "border-zinc-700/60 text-zinc-400 hover:bg-zinc-800"
            }`}
            title="Toggle Sustain Pedal (Hold notes after release). Shortcut: Spacebar"
          >
            <Disc className={`w-3.5 h-3.5 ${isSustainOn ? "animate-spin text-amber-400" : ""}`} />
            <span>Sustain {isSustainOn ? "ON" : "OFF"}</span>
          </button>
        </div>
      </div>

      {/* SECONDARY ROW: ARPEGGIATOR & VELOCITY CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs mb-4 px-1">
        {/* Arpeggiator controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsArpOn((prev) => !prev)}
            className={`px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              isArpOn
                ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                : "border-zinc-800 text-zinc-400 hover:bg-zinc-800/80"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Arp {isArpOn ? "Active" : "Off"}</span>
          </button>

          {isArpOn && (
            <>
              <select
                value={arpPattern}
                onChange={(e) => setArpPattern(e.target.value as any)}
                className="bg-zinc-900 border border-zinc-700/60 rounded-lg px-2 py-1 text-xs text-zinc-300 focus:outline-hidden"
              >
                <option value="up">Up ↗</option>
                <option value="down">Down ↘</option>
                <option value="updown">Up / Down ↕</option>
                <option value="random">Random 🔀</option>
              </select>

              <div className="flex items-center gap-1 text-zinc-400">
                <span>Speed:</span>
                <input
                  type="range"
                  min="60"
                  max="280"
                  value={arpSpeed}
                  onChange={(e) => setArpSpeed(parseInt(e.target.value, 10))}
                  className="w-20 accent-cyan-500 cursor-pointer"
                />
                <span className="font-mono w-10 text-right">{arpSpeed}ms</span>
              </div>
            </>
          )}
        </div>

        {/* Velocity / Touch slider and Labels toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400">Velocity:</span>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={velocity}
              onChange={(e) => setVelocity(parseFloat(e.target.value))}
              className="w-20 accent-indigo-500 cursor-pointer"
            />
            <span className="font-mono text-zinc-300 w-8">{Math.round(velocity * 100)}%</span>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-zinc-400 hover:text-zinc-200">
            <input
              type="checkbox"
              checked={showKeyLabels}
              onChange={(e) => setShowKeyLabels(e.target.checked)}
              className="accent-indigo-500 rounded"
            />
            <span>Key Hints</span>
          </label>
        </div>
      </div>

      {/* PIANO KEYBOARD VIEW */}
      <div className="relative overflow-x-auto pb-2 scrollbar-thin">
        <div className="inline-flex min-w-[760px] w-full h-44 relative bg-zinc-950 p-2 rounded-xl shadow-inner border border-zinc-800">
          {octaves.map((octave) => {
            const effectiveOctave = octave + octaveShift;
            return (
              <div key={octave} className="flex relative flex-1">
                {WHITE_NOTES.map((whiteNote, idx) => {
                  const noteId = `${whiteNote}${effectiveOctave}`;
                  const isActive = activeNotes.has(noteId);

                  // QWERTY key hint for octave 4
                  let keyHint = "";
                  if (octave === 4) {
                    for (const [k, n] of Object.entries(KEY_MAP)) {
                      if (n === `${whiteNote}4`) {
                        keyHint = k.toUpperCase();
                        break;
                      }
                    }
                  } else if (octave === 5 && (whiteNote === "C" || whiteNote === "D" || whiteNote === "E" || whiteNote === "F")) {
                    for (const [k, n] of Object.entries(KEY_MAP)) {
                      if (n === `${whiteNote}5`) {
                        keyHint = k.toUpperCase();
                        break;
                      }
                    }
                  }

                  const blackNote = BLACK_NOTE_OFFSETS[idx];
                  const blackNoteId = blackNote ? `${blackNote}${effectiveOctave}` : null;
                  const isBlackActive = blackNoteId ? activeNotes.has(blackNoteId) : false;

                  let blackKeyHint = "";
                  if (blackNote && octave === 4) {
                    for (const [k, n] of Object.entries(KEY_MAP)) {
                      if (n === `${blackNote}4`) {
                        blackKeyHint = k.toUpperCase();
                        break;
                      }
                    }
                  } else if (blackNote && octave === 5) {
                    for (const [k, n] of Object.entries(KEY_MAP)) {
                      if (n === `${blackNote}5`) {
                        blackKeyHint = k.toUpperCase();
                        break;
                      }
                    }
                  }

                  return (
                    <div key={noteId} className="relative flex-1 h-full">
                      {/* White Key */}
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault();
                          triggerNoteOn(noteId);
                        }}
                        onMouseUp={() => triggerNoteOff(noteId)}
                        onMouseLeave={() => triggerNoteOff(noteId)}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          triggerNoteOn(noteId);
                        }}
                        onTouchEnd={() => triggerNoteOff(noteId)}
                        className={`w-full h-full rounded-b-lg border-x border-b transition-all flex flex-col justify-end items-center pb-2 cursor-pointer ${
                          isActive
                            ? "bg-indigo-200 border-indigo-400 translate-y-0.5 shadow-inner"
                            : "bg-linear-to-b from-zinc-100 to-zinc-200 hover:from-white hover:to-zinc-100 border-zinc-400/80 shadow-md"
                        }`}
                      >
                        {showKeyLabels && (
                          <div className="flex flex-col items-center pointer-events-none select-none">
                            <span className="text-[10px] font-bold text-zinc-700">{noteId}</span>
                            {keyHint && (
                              <span className="text-[9px] font-mono px-1 rounded bg-zinc-300/80 text-zinc-900 mt-0.5">
                                {keyHint}
                              </span>
                            )}
                          </div>
                        )}
                      </button>

                      {/* Black Key (Overlapping on right boundary) */}
                      {blackNote && blackNoteId && (
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            triggerNoteOn(blackNoteId);
                          }}
                          onMouseUp={(e) => {
                            e.stopPropagation();
                            triggerNoteOff(blackNoteId);
                          }}
                          onMouseLeave={() => triggerNoteOff(blackNoteId)}
                          onTouchStart={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            triggerNoteOn(blackNoteId);
                          }}
                          onTouchEnd={() => triggerNoteOff(blackNoteId)}
                          className={`absolute top-0 right-[-32%] w-[64%] h-[60%] z-20 rounded-b-md transition-all flex flex-col justify-end items-center pb-1.5 cursor-pointer ${
                            isBlackActive
                              ? "bg-indigo-600 border border-indigo-400 translate-y-0.5 shadow-inner"
                              : "bg-linear-to-b from-zinc-900 to-zinc-800 hover:from-zinc-800 hover:to-zinc-700 border-x border-b border-black shadow-lg"
                          }`}
                        >
                          {showKeyLabels && (
                            <div className="flex flex-col items-center pointer-events-none select-none">
                              <span className="text-[8px] font-semibold text-zinc-300">{blackNote}</span>
                              {blackKeyHint && (
                                <span className="text-[8px] font-mono px-1 rounded bg-zinc-950 text-indigo-300 mt-0.5">
                                  {blackKeyHint}
                                </span>
                              )}
                            </div>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* QUICK FOOTER TIPS */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/40 mt-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>Tip: Play naturally with QWERTY keys (A-L for white keys, W, E, T, Y, U, O, P for black keys). Press Spacebar for sustain!</span>
        </div>
        <span className="font-mono text-xs text-zinc-400 hidden sm:inline">
          Active: {Array.from(activeNotes).join(", ") || "None"}
        </span>
      </div>
    </div>
  );
};

export default VirtualPiano;
