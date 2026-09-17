import React from "react";
import { University } from "../data/comprehensiveUniversitiesData";
import { X, CheckCircle2, ExternalLink, Award, Globe, Building, DollarSign, BookOpen } from "lucide-react";

interface UniversityCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUnis: University[];
  onRemoveUni: (id: string) => void;
  theme: "light" | "dark";
}

export const UniversityCompareModal: React.FC<UniversityCompareModalProps> = ({
  isOpen,
  onClose,
  selectedUnis,
  onRemoveUni,
  theme
}) => {
  if (!isOpen) return null;

  const isDark = theme === "dark";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-5xl max-h-[90vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${
          isDark ? "bg-[#121216] border-zinc-800 text-zinc-100" : "bg-white border-slate-200 text-slate-800"
        }`}
      >
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
          isDark ? "border-zinc-800 bg-zinc-900/80" : "border-slate-200 bg-slate-50"
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">University Comparison Dashboard</h3>
              <p className="text-[11px] text-zinc-500">Compare rankings, tuition, top programs, and entry criteria side-by-side</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-slate-200 text-slate-500"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedUnis.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <p className="text-sm font-semibold text-zinc-400">No universities selected for comparison.</p>
              <p className="text-xs text-zinc-500">Click the "Compare" button on university cards in the main view to compare up to 4 institutions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedUnis.map((uni) => (
                <div
                  key={uni.id || uni.name}
                  className={`p-4 rounded-xl border flex flex-col relative space-y-4 ${
                    isDark ? "bg-zinc-950/80 border-zinc-800" : "bg-slate-50 border-slate-200 shadow-xs"
                  }`}
                >
                  {/* Remove pin button */}
                  <button
                    onClick={() => onRemoveUni(uni.id || uni.name)}
                    className="absolute top-3 right-3 p-1 rounded-md bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 cursor-pointer text-xs"
                    title="Remove from comparison"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div>
                    <span className="text-2xl mr-2">{uni.flag}</span>
                    <h4 className="text-xs font-bold leading-snug mt-1 text-indigo-400">{uni.name}</h4>
                    <p className="text-[10px] text-zinc-500 font-mono flex items-center gap-1 mt-0.5">
                      <Globe className="w-3 h-3 text-zinc-400" /> {uni.city}, {uni.country}
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className={`p-2 rounded-lg border text-center ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"}`}>
                      <span className="text-zinc-500 block text-[9px]">World Rank</span>
                      <span className="font-extrabold text-amber-400 text-xs">#{uni.world_rank || "N/A"}</span>
                    </div>
                    <div className={`p-2 rounded-lg border text-center ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"}`}>
                      <span className="text-zinc-500 block text-[9px]">Acceptance</span>
                      <span className="font-bold text-emerald-400 text-xs">{uni.acceptance_rate || "N/A"}</span>
                    </div>
                  </div>

                  {/* Tuition & Type */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-emerald-400" /> Tuition (Avg)
                      </span>
                      <span className="font-semibold text-xs text-zinc-200">{uni.avg_tuition_usd || "Varies"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <Building className="w-3 h-3 text-cyan-400" /> Type
                      </span>
                      <span className="font-semibold text-xs text-zinc-200">{uni.type}</span>
                    </div>
                  </div>

                  {/* Top Programs */}
                  <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-indigo-400" /> Top Programs
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {uni.top_majors.map((m, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-indigo-950/50 border border-indigo-500/20 text-indigo-300 text-[10px]">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Entry Criteria */}
                  {uni.admission_requirements && (
                    <div className="space-y-1 text-[10px] pt-2 border-t border-zinc-800">
                      <span className="font-bold text-zinc-400">Required Exams & Criteria:</span>
                      <div className="space-y-0.5 text-zinc-400">
                        <div><strong className="text-zinc-300">GPA:</strong> {uni.admission_requirements.gpa}</div>
                        <div><strong className="text-zinc-300">Tests:</strong> {uni.admission_requirements.tests?.join(", ")}</div>
                        <div><strong className="text-zinc-300">Lang:</strong> {uni.admission_requirements.language?.join(", ")}</div>
                      </div>
                    </div>
                  )}

                  {/* Web Link */}
                  {uni.web_pages[0] && (
                    <a
                      href={uni.web_pages[0]}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-auto px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      Website <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
