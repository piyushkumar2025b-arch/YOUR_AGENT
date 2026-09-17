import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Search,
  ExternalLink,
  Sparkles,
  Globe,
  RefreshCw,
  Building2,
  BookOpen,
  Bookmark,
  CheckCircle2,
  Share2,
  Download,
  Zap,
  MapPin,
  Filter,
  DollarSign,
  Award,
  Layers,
  BarChart3,
  SlidersHorizontal,
  ChevronRight
} from "lucide-react";
import {
  COMPREHENSIVE_UNIVERSITIES,
  POPULAR_COUNTRIES,
  University
} from "../data/comprehensiveUniversitiesData";
import { UniversityCompareModal } from "./UniversityCompareModal";
import { UniversityAiCounselor } from "./UniversityAiCounselor";

interface UniversitiesAgentProps {
  apiKey?: string;
  selectedModel?: string;
  theme: "light" | "dark";
  onAddLog?: (type: string, msg: string) => void;
}

export const UniversitiesAgent: React.FC<UniversitiesAgentProps> = ({
  apiKey,
  selectedModel = "google/gemini-2.5-flash",
  theme,
  onAddLog
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "Public" | "Private">("ALL");
  const [maxTuitionFilter, setMaxTuitionFilter] = useState<number>(70000);
  
  const [universities, setUniversities] = useState<University[]>(COMPREHENSIVE_UNIVERSITIES);
  const [selectedUni, setSelectedUni] = useState<University | null>(COMPREHENSIVE_UNIVERSITIES[0]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeDetailTab, setActiveDetailTab] = useState<"overview" | "criteria" | "counselor" | "programs">("overview");
  
  // Bookmarks & Compare State
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("bookmarked_universities");
      return saved ? JSON.parse(saved) : ["mit", "iitb", "oxford"];
    } catch {
      return ["mit", "iitb", "oxford"];
    }
  });

  const [compareList, setCompareList] = useState<University[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem("bookmarked_universities", JSON.stringify(bookmarkedIds));
    } catch {
      // ignore
    }
  }, [bookmarkedIds]);

  // Live search + API merge
  const handleSearchUniversities = async (queryTerm: string) => {
    const q = queryTerm.trim();
    if (!q) {
      setUniversities(COMPREHENSIVE_UNIVERSITIES);
      return;
    }
    setIsLoading(true);
    if (onAddLog) onAddLog("agent", `Querying Hipolabs Global Education API & Local Index for "${q}"...`);

    try {
      let remoteData: University[] = [];
      const resName = await fetch(`/api/universities?name=${encodeURIComponent(q)}`).catch(() => null);
      if (resName && resName.ok) {
        const json = await resName.json();
        remoteData = json.map((item: any, idx: number) => ({
          id: `remote-${idx}-${item.name.toLowerCase().replace(/\s+/g, "-")}`,
          name: item.name,
          country: item.country,
          state_province: item["state-province"] || undefined,
          city: item.country,
          web_pages: item.web_pages || [],
          domains: item.domains || [],
          type: "Public",
          top_majors: ["General Higher Education & Research"],
          flag: POPULAR_COUNTRIES.find(c => c.name.toLowerCase() === item.country?.toLowerCase())?.flag || "🏛️",
          description: `Accredited institution located in ${item.country}.`
        }));
      }

      // Merge local comprehensive dataset with remote API results
      const lowerQ = q.toLowerCase();
      const localMatches = COMPREHENSIVE_UNIVERSITIES.filter(
        (u) =>
          u.name.toLowerCase().includes(lowerQ) ||
          u.country.toLowerCase().includes(lowerQ) ||
          u.city.toLowerCase().includes(lowerQ) ||
          u.top_majors.some((m) => m.toLowerCase().includes(lowerQ))
      );

      const mergedMap = new Map<string, University>();
      localMatches.forEach((u) => mergedMap.set(u.name.toLowerCase(), u));
      remoteData.forEach((u) => {
        if (!mergedMap.has(u.name.toLowerCase())) {
          mergedMap.set(u.name.toLowerCase(), u);
        }
      });

      const finalMerged = Array.from(mergedMap.values());
      setUniversities(finalMerged.length > 0 ? finalMerged : COMPREHENSIVE_UNIVERSITIES);
      if (finalMerged.length > 0) {
        setSelectedUni(finalMerged[0]);
        if (onAddLog) onAddLog("success", `Found ${finalMerged.length} institutions for "${q}"!`);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleCompare = (uni: University) => {
    setCompareList((prev) => {
      const exists = prev.some((u) => u.name === uni.name);
      if (exists) {
        return prev.filter((u) => u.name !== uni.name);
      }
      if (prev.length >= 4) {
        alert("You can compare up to 4 universities simultaneously.");
        return prev;
      }
      return [...prev, uni];
    });
  };

  // Filtered List
  const filteredList = universities.filter((u) => {
    if (showBookmarksOnly && !bookmarkedIds.includes(u.id)) return false;
    
    if (selectedCountryCode !== "ALL") {
      const targetCountry = POPULAR_COUNTRIES.find(c => c.code === selectedCountryCode)?.name;
      if (targetCountry && u.country.toLowerCase() !== targetCountry.toLowerCase()) {
        return false;
      }
    }

    if (typeFilter !== "ALL" && u.type !== typeFilter) return false;

    if (searchQuery) {
      const sq = searchQuery.toLowerCase();
      const nameMatch = u.name.toLowerCase().includes(sq);
      const countryMatch = u.country.toLowerCase().includes(sq);
      const cityMatch = u.city?.toLowerCase().includes(sq);
      const majorMatch = u.top_majors.some(m => m.toLowerCase().includes(sq));
      if (!nameMatch && !countryMatch && !cityMatch && !majorMatch) return false;
    }

    return true;
  });

  const isDark = theme === "dark";

  return (
    <div className={`h-full w-full flex-1 flex flex-col overflow-hidden ${isDark ? "bg-[#101014] text-zinc-100" : "bg-slate-50 text-slate-900"}`}>
      {/* Top Header */}
      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-4 shrink-0 ${
        isDark ? "border-zinc-800 bg-zinc-950/80" : "border-slate-200 bg-white shadow-xs"
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white rounded-2xl shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-tight flex items-center gap-2">
              Global Universities & Admissions Hub
            </h2>
            <p className="text-xs text-zinc-400">Discover top institutions, QS rankings, admissions odds, and AI SOP counselors</p>
          </div>
        </div>

        {/* Global Controls & Search Bar */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchUniversities(searchQuery)}
              placeholder="Search university, city, or major..."
              className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs outline-none transition-all ${
                isDark ? "bg-zinc-900 border-zinc-800 text-white focus:border-indigo-500" : "bg-white border-slate-200 text-slate-800"
              }`}
            />
          </div>

          <button
            onClick={() => handleSearchUniversities(searchQuery)}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Search</span>
          </button>

          <button
            onClick={() => setIsCompareModalOpen(true)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              compareList.length > 0
                ? "bg-purple-600 text-white border-purple-500 shadow-md"
                : isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800" : "bg-white border-slate-200 text-slate-700"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
            <span>Compare ({compareList.length})</span>
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className={`px-4 py-2.5 border-b flex items-center gap-2 overflow-x-auto shrink-0 text-xs ${
        isDark ? "bg-zinc-950 border-zinc-800" : "bg-slate-100 border-slate-200"
      }`}>
        <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Countries:
        </span>

        {POPULAR_COUNTRIES.map((c) => (
          <button
            key={c.code}
            onClick={() => setSelectedCountryCode(c.code)}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
              selectedCountryCode === c.code
                ? "bg-indigo-600 text-white shadow-xs"
                : isDark ? "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white" : "bg-white border border-slate-200 text-slate-700"
            }`}
          >
            <span>{c.flag}</span>
            <span>{c.name}</span>
          </button>
        ))}

        <div className="h-4 w-px bg-zinc-800 shrink-0 mx-1" />

        {/* Saved Filter */}
        <button
          onClick={() => setShowBookmarksOnly((prev) => !prev)}
          className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 shrink-0 cursor-pointer transition-all ${
            showBookmarksOnly
              ? "bg-amber-600 text-white shadow-xs"
              : isDark ? "bg-zinc-900 border border-zinc-800 text-amber-400 hover:bg-zinc-800" : "bg-white border border-slate-200 text-amber-600"
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 fill-current" />
          <span>Saved ({bookmarkedIds.length})</span>
        </button>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className={`px-2.5 py-1 rounded-lg font-semibold border outline-none text-[11px] cursor-pointer ${
            isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-white border-slate-200 text-slate-700"
          }`}
        >
          <option value="ALL">Type: All</option>
          <option value="Public">Public Universities</option>
          <option value="Private">Private Universities</option>
        </select>
      </div>

      {/* Main Grid Layout */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 p-4 lg:p-6 gap-6 max-w-7xl mx-auto w-full">
        {/* Left List Pane (5 cols) */}
        <div className={`lg:col-span-5 flex flex-col rounded-2xl border overflow-hidden ${
          isDark ? "bg-zinc-900/90 border-zinc-800" : "bg-white border-slate-200 shadow-xs"
        }`}>
          <div className={`p-3 border-b flex items-center justify-between shrink-0 text-xs ${
            isDark ? "bg-zinc-950 border-zinc-800 text-zinc-400" : "bg-slate-50 border-slate-200 text-slate-600"
          }`}>
            <span className="font-bold">
              Showing {filteredList.length} Universities
            </span>
            <span className="text-[10px] font-mono text-zinc-500">QS World Rankings Index</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredList.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <p className="text-xs text-zinc-400 font-semibold">No universities match your filters.</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCountryCode("ALL");
                    setTypeFilter("ALL");
                    setShowBookmarksOnly(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredList.map((uni) => {
                const isSelected = selectedUni?.name === uni.name;
                const isBookmarked = bookmarkedIds.includes(uni.id);
                const isComparing = compareList.some((u) => u.name === uni.name);

                return (
                  <div
                    key={uni.id || uni.name}
                    onClick={() => setSelectedUni(uni)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-2 group ${
                      isSelected
                        ? "bg-indigo-500/15 border-indigo-500/50 text-indigo-200 shadow-md"
                        : isDark
                        ? "bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 text-zinc-300"
                        : "bg-slate-50 border-slate-200/90 hover:bg-slate-100 text-slate-800"
                    }`}
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{uni.flag}</span>
                        <h4 className="text-xs font-extrabold truncate group-hover:text-indigo-400 transition-colors">
                          {uni.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-zinc-500" /> {uni.city}, {uni.country}
                        </span>
                        {uni.world_rank && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold">
                            #{uni.world_rank}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {uni.top_majors?.slice(0, 2).map((m, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-zinc-800 text-[9px] text-zinc-400 font-sans">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className="flex flex-col items-end gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleBookmark(uni.id)}
                        className={`p-1 rounded-md transition-colors ${
                          isBookmarked ? "text-amber-400" : "text-zinc-600 hover:text-zinc-300"
                        }`}
                        title="Save to bookmarks"
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
                      </button>

                      <button
                        onClick={() => toggleCompare(uni)}
                        className={`p-1 rounded-md text-[10px] font-bold ${
                          isComparing ? "text-purple-400 bg-purple-500/10" : "text-zinc-500 hover:text-zinc-300"
                        }`}
                        title="Toggle comparison"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Detail & Analytics Pane (7 cols) */}
        <div className={`lg:col-span-7 flex flex-col rounded-2xl border overflow-hidden ${
          isDark ? "bg-zinc-900/90 border-zinc-800" : "bg-white border-slate-200 shadow-xs"
        }`}>
          {selectedUni ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-800 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{selectedUni.flag}</span>
                    <div>
                      <h2 className="text-base font-extrabold text-indigo-400 leading-snug">{selectedUni.name}</h2>
                      <p className="text-xs text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500" /> {selectedUni.city}, {selectedUni.country}
                        {selectedUni.state_province && ` (${selectedUni.state_province})`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleBookmark(selectedUni.id)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                      bookmarkedIds.includes(selectedUni.id)
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${bookmarkedIds.includes(selectedUni.id) ? "fill-current" : ""}`} />
                    <span>{bookmarkedIds.includes(selectedUni.id) ? "Saved" : "Save"}</span>
                  </button>

                  {selectedUni.web_pages[0] && (
                    <a
                      href={selectedUni.web_pages[0]}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      Official Site <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Sub Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                <button
                  onClick={() => setActiveDetailTab("overview")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeDetailTab === "overview"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  <Award className="w-3.5 h-3.5" /> Overview
                </button>

                <button
                  onClick={() => setActiveDetailTab("criteria")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeDetailTab === "criteria"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" /> Tuition & Entry
                </button>

                <button
                  onClick={() => setActiveDetailTab("programs")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeDetailTab === "programs"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" /> Programs & Majors
                </button>

                <button
                  onClick={() => setActiveDetailTab("counselor")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeDetailTab === "counselor"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                      : "bg-zinc-900 border border-zinc-800 text-indigo-300 hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> AI Admissions Counselor
                </button>
              </div>

              {/* TAB 1: OVERVIEW */}
              {activeDetailTab === "overview" && (
                <div className="space-y-4 text-xs">
                  {/* Metric Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className={`p-3 rounded-xl border text-center ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-slate-50 border-slate-200"}`}>
                      <span className="text-[10px] text-zinc-500 uppercase font-bold block">QS World Rank</span>
                      <span className="text-base font-extrabold text-amber-400">#{selectedUni.world_rank || "N/A"}</span>
                    </div>

                    <div className={`p-3 rounded-xl border text-center ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-slate-50 border-slate-200"}`}>
                      <span className="text-[10px] text-zinc-500 uppercase font-bold block">Acceptance Rate</span>
                      <span className="text-base font-extrabold text-emerald-400">{selectedUni.acceptance_rate || "N/A"}</span>
                    </div>

                    <div className={`p-3 rounded-xl border text-center ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-slate-50 border-slate-200"}`}>
                      <span className="text-[10px] text-zinc-500 uppercase font-bold block">Est. Year</span>
                      <span className="text-base font-extrabold text-cyan-400">{selectedUni.est_year || "N/A"}</span>
                    </div>

                    <div className={`p-3 rounded-xl border text-center ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-slate-50 border-slate-200"}`}>
                      <span className="text-[10px] text-zinc-500 uppercase font-bold block">Institution Type</span>
                      <span className="text-base font-extrabold text-indigo-400">{selectedUni.type}</span>
                    </div>
                  </div>

                  {/* Description Card */}
                  <div className={`p-4 rounded-xl border space-y-2 ${isDark ? "bg-zinc-950 border-zinc-800 text-zinc-300" : "bg-slate-50 border-slate-200"}`}>
                    <h4 className="font-bold text-indigo-400 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" /> About {selectedUni.name}
                    </h4>
                    <p className="leading-relaxed text-xs">
                      {selectedUni.description || `${selectedUni.name} is an esteemed institution situated in ${selectedUni.city}, ${selectedUni.country}, recognized worldwide for academic rigor and research contributions.`}
                    </p>
                  </div>

                  {/* Official Domains */}
                  <div className={`p-4 rounded-xl border space-y-2 ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-slate-50 border-slate-200"}`}>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block">Registered Internet Domains</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedUni.domains.map((d, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-cyan-400 font-mono text-[11px]">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CRITERIA & TUITION */}
              {activeDetailTab === "criteria" && (
                <div className="space-y-4 text-xs">
                  <div className={`p-4 rounded-xl border space-y-3 ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-slate-50 border-slate-200"}`}>
                    <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4" /> Average Annual Tuition
                    </h4>
                    <p className="text-lg font-extrabold text-white">{selectedUni.avg_tuition_usd || "Consult Official Portal"}</p>
                    <p className="text-[11px] text-zinc-400">
                      Note: Tuition varies significantly by degree program (Undergraduate vs Master's/PhD) and residency status.
                    </p>
                  </div>

                  {selectedUni.admission_requirements && (
                    <div className={`p-4 rounded-xl border space-y-3 ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-slate-50 border-slate-200"}`}>
                      <h4 className="font-bold text-indigo-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Standard Admission Prerequisites
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="font-bold text-zinc-400 block mb-0.5">Minimum GPA Threshold:</span>
                          <span className="font-semibold text-zinc-200">{selectedUni.admission_requirements.gpa}</span>
                        </div>

                        <div>
                          <span className="font-bold text-zinc-400 block mb-0.5">Standardized Tests:</span>
                          <span className="font-semibold text-zinc-200">{selectedUni.admission_requirements.tests?.join(", ")}</span>
                        </div>

                        <div>
                          <span className="font-bold text-zinc-400 block mb-0.5">Language Proficiency:</span>
                          <span className="font-semibold text-zinc-200">{selectedUni.admission_requirements.language?.join(", ")}</span>
                        </div>

                        <div>
                          <span className="font-bold text-zinc-400 block mb-0.5">Dossier Documents:</span>
                          <span className="font-semibold text-zinc-200">{selectedUni.admission_requirements.documents?.join(", ")}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PROGRAMS */}
              {activeDetailTab === "programs" && (
                <div className="space-y-4 text-xs">
                  <div className={`p-4 rounded-xl border space-y-3 ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-slate-50 border-slate-200"}`}>
                    <h4 className="font-bold text-indigo-400 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" /> Highlighted Academic Majors & Research Thrusts
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedUni.top_majors.map((major, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-2">
                          <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="font-semibold text-zinc-200">{major}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: AI COUNSELOR */}
              {activeDetailTab === "counselor" && (
                <UniversityAiCounselor
                  university={selectedUni}
                  apiKey={apiKey}
                  selectedModel={selectedModel}
                  theme={theme}
                />
              )}
            </div>
          ) : (
            <div className="text-center py-24 text-xs text-zinc-500">
              Select a university from the list to view detailed academic metrics and AI counseling.
            </div>
          )}
        </div>
      </div>

      {/* Comparison Modal */}
      <UniversityCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        selectedUnis={compareList}
        onRemoveUni={(id) => setCompareList((prev) => prev.filter((u) => u.id !== id && u.name !== id))}
        theme={theme}
      />
    </div>
  );
};
