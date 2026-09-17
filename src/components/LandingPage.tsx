import React, { useState, useEffect } from "react";
import { 
  Bot, Key, Sparkles, ShieldCheck, Github, Globe, 
  Cpu, ExternalLink, Check, Eye, EyeOff,
  Database, Mail, Music, Code, Terminal, Zap, Layout, Lock,
  ChevronRight, ArrowRight, Layers, Activity, Server, FileText,
  Shield, CheckCircle2, Sliders, RefreshCw, Command, Play, Flame,
  HelpCircle, ChevronDown, Award, Rocket, CheckSquare, BarChart3,
  Search, Terminal as TerminalIcon, Sparkle, ShieldAlert, Laptop
} from "lucide-react";
import { DotInteractiveCanvas } from "./DotInteractiveCanvas";
import { DevelopedForSection } from "./DevelopedForSection";
import { VibeCoderVideoCanvas } from "./VibeCoderVideoCanvas";
import { NeonSignature } from "./NeonSignature";
import { InteractiveArchitectureShowcase } from "./InteractiveArchitectureShowcase";
import { LandingPageMetricsBanner } from "./LandingPageMetricsBanner";
import { LandingPageTestimonials } from "./LandingPageTestimonials";
import { HeroInteractiveTerminal } from "./HeroInteractiveTerminal";
import { SystemCapabilitiesMatrix } from "./SystemCapabilitiesMatrix";
import { LiveSystemBenchmarkConsole } from "./LiveSystemBenchmarkConsole";
import { TopScrollProgressBar } from "./TopScrollProgressBar";
import { HumanizedTokenEfficiencyMeter } from "./HumanizedTokenEfficiencyMeter";
import { HumanizedMakerNote } from "./HumanizedMakerNote";
import { isValidOpenRouterKey } from "../utils/keyObfuscation";

// Import locally generated images
import heroDashboardImg from "../assets/images/hero_agent_dashboard_1784901158122.jpg";
import swarmNetworkImg from "../assets/images/swarm_network_nodes_1784901176547.jpg";
import cloudSyncImg from "../assets/images/cloud_security_sync_1784901192412.jpg";

interface LandingPageProps {
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  availableModels: { id: string; name: string }[];
  onEnterWorkspace: (workspaceName: string, authType: "google" | "github" | "guest") => void;
  onGoogleSignIn: () => Promise<any>;
  theme: "light" | "dark";
  onToggleTheme?: () => void;
  onOpenMathPlotter?: () => void;
  onOpenSecurityShield?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  apiKey,
  onSaveApiKey,
  selectedModel,
  onSelectModel,
  availableModels,
  onEnterWorkspace,
  onGoogleSignIn,
  theme,
  onToggleTheme,
  onOpenMathPlotter,
  onOpenSecurityShield
}) => {
  const [localKey, setLocalKey] = useState<string>(apiKey || "");
  const [showKey, setShowKey] = useState<boolean>(false);
  const [keySaved, setKeySaved] = useState<boolean>(!!apiKey);
  const [workspaceName, setWorkspaceName] = useState<string>("Enterprise Dev Studio");
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Live Swarm Simulator State
  const [simTask, setSimTask] = useState<string>("Build E-Commerce SaaS with Supabase & Stripe");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simStep, setSimStep] = useState<number>(0);
  const [simLogs, setSimLogs] = useState<string[]>([]);

  // FAQ Accordion Toggle State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Auth Mode State (Direct Guest Entry, OAuth, or Email)
  const [authMode, setAuthMode] = useState<"guest" | "oauth" | "email">("guest");
  const [emailInput, setEmailInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [isSignUp, setIsSignUp] = useState<boolean>(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleGuestEntry = () => {
    onEnterWorkspace(workspaceName.trim() || "Guest Developer Studio", "guest");
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setAuthError("Please provide both email and password.");
      return;
    }
    setIsAuthLoading(true);
    setAuthError(null);

    try {
      const endpoint = isSignUp ? "/api/auth/signup" : "/api/auth/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput.trim(),
          password: passwordInput,
          name: workspaceName || "Studio Developer"
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setAuthError(data.error || "Authentication failed.");
      } else {
        if (data.token) {
          localStorage.setItem("app_auth_token", data.token);
        }
        onEnterWorkspace(workspaceName.trim() || "Enterprise Dev Studio", "google");
      }
    } catch (err: any) {
      setAuthError(err.message || "Connection error during authentication.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Prevent default right click menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Listen for message events from OAuth callback popups
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Strictly enforce same-origin for OAuth completion messages
      if (event.origin !== window.location.origin) {
        return;
      }
      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        setIsAuthLoading(false);
        onEnterWorkspace(workspaceName.trim() || "Enterprise Dev Studio", event.data.provider || "github");
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [workspaceName, onEnterWorkspace]);

  const handleSaveKey = () => {
    onSaveApiKey(localKey.trim());
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2500);
  };

  const handleGoogleAuth = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      await onGoogleSignIn();
      onEnterWorkspace(workspaceName.trim() || "Enterprise Dev Studio", "google");
    } catch (err: any) {
      if (err?.message?.includes("popup-closed-by-user")) {
        setAuthError("Google Sign-in popup was closed. Please try again.");
      } else {
        setAuthError(err?.message || "Google Sign-In failed. Please try signing in again.");
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGithubAuth = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/github/url");
      if (!res.ok) {
        throw new Error("Unable to reach authentication service.");
      }
      const data = await res.json();
      if (!data.configured || !data.url) {
        setAuthError(data.message || "GitHub OAuth is not configured on this deployment. Please sign in with Email, Google, or enter as Guest.");
        setIsAuthLoading(false);
        return;
      }

      const popup = window.open(
        data.url,
        "github_oauth_popup",
        "width=600,height=700,scrollbars=yes,status=yes"
      );

      if (!popup) {
        setAuthError("Popup blocked by browser. Please allow popups to sign in with GitHub.");
        setIsAuthLoading(false);
      }
    } catch (err: any) {
      setAuthError(`GitHub authentication error: ${err.message || "Failed to launch popup"}`);
      setIsAuthLoading(false);
    }
  };

  // Run Interactive Swarm Simulator
  const runSwarmSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimStep(1);
    setSimLogs(["[Swarm Master] Task received: " + simTask]);

    setTimeout(() => {
      setSimStep(2);
      setSimLogs(prev => [...prev, "[Architect Agent] Created system AST graph & folder blueprint"]);
    }, 1200);

    setTimeout(() => {
      setSimStep(3);
      setSimLogs(prev => [...prev, "[Coder Agent] Generating type-safe React & Supabase schema files..."]);
    }, 2500);

    setTimeout(() => {
      setSimStep(4);
      setSimLogs(prev => [...prev, "[QA Agent] Executing build compiler & AST security checks..."]);
    }, 3800);

    setTimeout(() => {
      setSimStep(5);
      setSimLogs(prev => [...prev, "[Swarm Master] SUCCESS! Workspace compiled cleanly on Port 3000."]);
      setIsSimulating(false);
    }, 5000);
  };

  const faqData = [
    {
      q: "How does the Zero Token Waste guarantee work?",
      a: "We actively prevent token burn in three ways: 1) Every completed AI response is cached in memory for 10 minutes—if you re-run an identical query or ask the same diagnostic, it returns instantly with 0 tokens spent. 2) In multi-turn chat, previous file dumps are distilled so you aren't re-uploading tens of thousands of characters on every turn. 3) Prompts are automatically compressed to collapse redundant whitespace before reaching any LLM."
    },
    {
      q: "Do I have to sign up or enter a credit card to use this?",
      a: "No! You can click 'Start as Guest' and immediately start coding, testing terminal commands, and building components in under 2 seconds. No credit card, no email required."
    },
    {
      q: "Are my API keys and personal files safe?",
      a: "100% yes. If you bring your own OpenRouter or Gemini key, it is stored strictly in your browser's private localStorage. It is never persisted on any external database, and you can clear it anytime with one click."
    },
    {
      q: "How does the Google Workspace integration work?",
      a: "Through our Google Studio panel, you can export your project files into Google Sheets spreadsheets with file size and status tracking, or generate structured architecture specs in Google Docs. You can also upload sketches and wireframes to Gemini Vision to convert them directly into React components."
    },
    {
      q: "Can I export my code to GitHub or download it as a ZIP?",
      a: "Yes. You can commit directly to your GitHub repositories or download a self-contained ZIP file of your entire workspace anytime. There is zero vendor lock-in."
    }
  ];

  return (
    <div 
      className="min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-300 bg-[#060709] text-zinc-100 font-sans"
    >
      {/* TOP SCROLL PROGRESS BAR (Isolated GPU-accelerated) */}
      <TopScrollProgressBar />

      {/* PHYSICS INTERACTIVE DOT GRID CANVAS (Cursor deflection theme) */}
      <DotInteractiveCanvas theme="dark" className="opacity-75" />

      {/* AMBIENT GLOW ORBS (Pure CSS Radial Gradients - zero blur re-compositing lag) */}
      <div 
        className="absolute top-12 left-1/4 w-[38rem] h-[38rem] rounded-full pointer-events-none" 
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0.02) 50%, transparent 70%)" }} 
      />
      <div 
        className="absolute top-1/3 right-1/4 w-[36rem] h-[36rem] rounded-full pointer-events-none" 
        style={{ background: "radial-gradient(circle, rgba(6,182,212,0.10) 0%, rgba(6,182,212,0.02) 50%, transparent 70%)" }} 
      />
      <div 
        className="absolute bottom-1/3 left-1/3 w-[36rem] h-[36rem] rounded-full pointer-events-none" 
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.08) 0%, rgba(168,85,247,0.01) 50%, transparent 70%)" }} 
      />

      {/* HUMAN-CENTERED NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 rounded-2xl shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-wider text-white">STUDIO FLOW</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30 font-bold">ZERO TOKEN WASTE</span>
              </div>
              <p className="text-[11px] font-medium text-zinc-400">A thoughtful, human workspace for software creators</p>
            </div>
          </div>

          {/* NAV LINKS */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-zinc-400">
            <a href="#maker-note" onClick={(e) => { e.preventDefault(); scrollToSection("maker-note"); }} className="hover:text-white transition-colors cursor-pointer">Why We Built This</a>
            <a href="#token-efficiency" onClick={(e) => { e.preventDefault(); scrollToSection("token-efficiency"); }} className="hover:text-white transition-colors cursor-pointer">Zero Token Waste</a>
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection("features"); }} className="hover:text-white transition-colors cursor-pointer">Features</a>
            <a href="#simulator" onClick={(e) => { e.preventDefault(); scrollToSection("simulator"); }} className="hover:text-white transition-colors cursor-pointer">Interactive Demo</a>
            <a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection("faq"); }} className="hover:text-white transition-colors cursor-pointer">Honest FAQ</a>
            <a href="#auth-section" onClick={(e) => { e.preventDefault(); scrollToSection("auth-section"); }} className="hover:text-white transition-colors cursor-pointer">Start Building</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Port 3000 Active</span>
            </div>

            {/* SECURITY SHIELD & ATTACK LAB BUTTON IN NAVBAR */}
            {onOpenSecurityShield && (
              <button
                type="button"
                onClick={onOpenSecurityShield}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                title="Open Security Shield & Live Penetration Testing Lab"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Security Lab</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
                  A+
                </span>
              </button>
            )}

            {/* DIRECT GUEST ENTRY BUTTON IN NAVBAR */}
            <button
              type="button"
              onClick={handleGuestEntry}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer border border-emerald-400/30"
              title="Direct instant access to workspace with all tools & agents (no login required)"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
              <span>Direct Guest Entry</span>
            </button>

            <a
              href="#auth-section"
              onClick={(e) => { e.preventDefault(); scrollToSection("auth-section"); }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-16 pb-20 z-10 space-y-24">
        
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold shadow-lg shadow-emerald-500/10">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Built for developers who value clarity, focus, and craft</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white">
            Code with Flow. <br />
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
              Never Waste a Token.
            </span>
          </h1>

          <p className="text-sm md:text-lg leading-relaxed text-zinc-300 max-w-3xl mx-auto font-normal">
            A calm, distraction-free environment to prototype, build, and ship full-stack web apps. Describe what you want in plain English; get clean, type-safe React code running live in your browser with real Google Workspace and Firestore integrations.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleGuestEntry}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-sm transition-all shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 flex items-center gap-2.5 border border-emerald-400/30 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
              <span>Start as Guest (No Login • 2 Secs)</span>
              <ArrowRight className="w-4 h-4 text-emerald-200" />
            </button>

            <a
              href="#auth-section"
              onClick={(e) => { e.preventDefault(); scrollToSection("auth-section"); }}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm transition-all shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Sign In with Google / GitHub</span>
              <ChevronRight className="w-4 h-4" />
            </a>

            <a
              href="#token-efficiency"
              onClick={(e) => { e.preventDefault(); scrollToSection("token-efficiency"); }}
              className="px-8 py-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 font-bold text-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>See Zero-Waste Metrics</span>
            </a>
          </div>

        </div>

        {/* HERO SHOWCASE FRAME WITH GENERATED AI UI IMAGE */}
        <div className="relative max-w-5xl mx-auto rounded-3xl p-2 bg-gradient-to-b from-indigo-500/30 via-zinc-800/50 to-cyan-500/30 shadow-2xl shadow-indigo-500/20">
          <div className="rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 relative group">
            
            {/* WINDOW TOP BAR */}
            <div className="h-10 bg-zinc-900/90 border-b border-zinc-800 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 text-xs font-mono text-zinc-500">AgentSwarmStudio.app — Live Control Room</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
                <span className="text-emerald-400 font-bold">● Active Agents: 6</span>
                <span className="text-indigo-400 font-bold">● Model: Gemini 2.5 Flash</span>
              </div>
            </div>

            {/* GENERATED HERO IMAGE */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-950">
              <img 
                src={heroDashboardImg} 
                alt="Agent Swarm Studio Control Room UI" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* OVERLAY GLASS BADGES */}
              <div className="absolute top-6 left-6 p-4 rounded-2xl bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 shadow-2xl space-y-1 max-w-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <span>Swarm Agent #1 (Code Architect)</span>
                </div>
                <p className="text-[11px] font-mono text-zinc-300">
                  "Analyzing project AST, initializing Supabase database schema, executing TypeScript tests..."
                </p>
              </div>

              <div className="absolute bottom-6 right-6 p-4 rounded-2xl bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 shadow-2xl flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Sandboxed Build Verified</div>
                  <div className="text-[11px] font-mono text-zinc-400">0 Errors • 100% Type-Safe • Hot-Reload Active</div>
                </div>
              </div>

            </div>

          </div>

          {/* INTERACTIVE HERO TERMINAL */}
          <HeroInteractiveTerminal 
            onLaunchWorkspace={() => {
              const authSec = document.getElementById("auth-section");
              if (authSec) authSec.scrollIntoView({ behavior: "smooth" });
            }} 
            onOpenMathPlotter={onOpenMathPlotter}
          />
        </div>

        {/* HUMAN TRUST METRICS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md">
          <div className="space-y-1 text-center md:text-left">
            <div className="text-3xl font-black text-emerald-400 font-mono">0 Wasted Tokens</div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Smart Distillation & Caching</div>
          </div>
          <div className="space-y-1 text-center md:text-left">
            <div className="text-3xl font-black text-white font-mono">100% Private</div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Zero Server Key Retention</div>
          </div>
          <div className="space-y-1 text-center md:text-left">
            <div className="text-3xl font-black text-cyan-400 font-mono">Google Studio</div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Native Sheets, Docs & Vision</div>
          </div>
          <div className="space-y-1 text-center md:text-left">
            <div className="text-3xl font-black text-indigo-400 font-mono">Port 3000</div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Live Sandboxed Compiler</div>
          </div>
        </div>

        {/* MAKER'S NOTE: WHY WE BUILT THIS */}
        <div id="maker-note">
          <HumanizedMakerNote />
        </div>

        {/* LIVE ZERO-TOKEN-WASTE ENGINE TELEMETRY */}
        <div id="token-efficiency">
          <HumanizedTokenEfficiencyMeter />
        </div>

        {/* HUMAN-CENTERED WORKFLOWS */}
        <section id="why-special" className="space-y-12 pt-4">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold font-mono tracking-widest text-indigo-400 uppercase">THOUGHTFUL BY DESIGN</span>
            <h2 className="text-3xl md:text-5xl font-black text-white">Built for Real Human Workflows</h2>
            <p className="text-sm md:text-base text-zinc-400 leading-relaxed">
              We stripped away the annoying AI gimmicks and focused on what actually helps developers build and ship software with peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 hover:border-emerald-500/50 transition-all duration-300 space-y-4 hover:-translate-y-1 group">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl w-fit group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Zero Token Waste</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Repetitive questions hit our in-memory cache instantly. Multi-turn histories are distilled to save up to 80% of prompt tokens without losing context.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 hover:border-cyan-500/50 transition-all duration-300 space-y-4 hover:-translate-y-1 group">
              <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl w-fit group-hover:bg-cyan-500 group-hover:text-white transition-all">
                <Code className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Code You Can Read</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Standard, clean React 18, TypeScript, and Tailwind CSS. No weird proprietary frameworks or tangled spaghetti code that you cannot maintain.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 hover:border-purple-500/50 transition-all duration-300 space-y-4 hover:-translate-y-1 group">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl w-fit group-hover:bg-purple-500 group-hover:text-white transition-all">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Google & Cloud Ready</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Export file inventories to Google Sheets, architecture specs to Google Docs, or connect live Firestore database records with a single click.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/50 transition-all duration-300 space-y-4 hover:-translate-y-1 group">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl w-fit group-hover:bg-amber-500 group-hover:text-white transition-all">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Multimodal Vision</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Drop in a photo of a whiteboard wireframe, napkin sketch, or Figma screenshot to generate production-ready React components in seconds.
              </p>
            </div>

          </div>

        </section>

        {/* REAL-TIME SYSTEM METRICS BANNER */}
        <LandingPageMetricsBanner />

        {/* LIVE SYSTEM BENCHMARK CONSOLE */}
        <LiveSystemBenchmarkConsole />

        {/* INTERACTIVE ARCHITECTURE SHOWCASE */}
        <InteractiveArchitectureShowcase />

        {/* SYSTEM CAPABILITIES MATRIX */}
        <SystemCapabilitiesMatrix 
          onLaunchWorkspace={() => {
            const authSec = document.getElementById("auth-section");
            if (authSec) authSec.scrollIntoView({ behavior: "smooth" });
          }} 
          onOpenMathPlotter={onOpenMathPlotter}
        />

        {/* DEVELOPED FOR SECTION */}
        <DevelopedForSection />

        {/* PRODUCTION READY FEATURE TESTIMONIALS */}
        <LandingPageTestimonials />

        {/* INTERACTIVE LIVE SWARM SIMULATOR PLAYGROUND */}
        <section id="simulator" className="space-y-8 pt-8">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold font-mono tracking-widest text-cyan-400 uppercase">INTERACTIVE DEMO</span>
            <h2 className="text-3xl md:text-5xl font-black text-white">Live Swarm Execution Simulator</h2>
            <p className="text-sm md:text-base text-zinc-400 leading-relaxed">
              Experience how our multi-agent swarm decomposes tasks and executes multi-file code updates live before launching your workspace.
            </p>
          </div>

          <div className="max-w-4xl mx-auto rounded-3xl p-8 bg-zinc-900/90 border border-zinc-800/90 shadow-2xl space-y-6 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <input
                type="text"
                value={simTask}
                onChange={(e) => setSimTask(e.target.value)}
                placeholder="Enter a task to simulate (e.g. Build Realtime Chat App)"
                className="flex-1 w-full rounded-2xl p-4 text-xs font-mono bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                onClick={runSwarmSimulation}
                disabled={isSimulating}
                className="w-full md:w-auto px-6 py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isSimulating ? "Swarm Executing..." : "Run Live Simulation"}</span>
              </button>
            </div>

            {/* SIMULATOR STEPS PROGRESS BAR */}
            <div className="grid grid-cols-5 gap-2">
              {[
                "1. Task Init",
                "2. AST Blueprint",
                "3. Code Generation",
                "4. Build Compiler",
                "5. Deployment"
              ].map((stepLabel, idx) => {
                const isActive = simStep >= idx + 1;
                return (
                  <div 
                    key={idx}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isActive 
                        ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300 font-bold" 
                        : "bg-zinc-950 border-zinc-800 text-zinc-500 font-medium"
                    }`}
                  >
                    <div className="text-[10px] font-mono">{stepLabel}</div>
                  </div>
                );
              })}
            </div>

            {/* LIVE SIMULATOR CONSOLE LOG STREAM */}
            <div className="rounded-2xl bg-zinc-950 p-4 border border-zinc-800 font-mono text-xs text-emerald-400 h-36 overflow-y-auto space-y-1.5 shadow-inner">
              <div className="text-zinc-500 border-b border-zinc-800 pb-1 mb-2 text-[10px] flex items-center justify-between">
                <span>TERMINAL_OUTPUT_STREAM</span>
                <span>STATUS: {isSimulating ? "RUNNING" : simStep === 5 ? "SUCCESS" : "IDLE"}</span>
              </div>
              {simLogs.map((log, i) => (
                <div key={i} className="leading-relaxed flex items-center gap-2">
                  <span className="text-cyan-400">❯</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TOP FEATURES SHOWCASE WITH RICH IMAGES & STYLES */}
        <section id="features" className="space-y-16 pt-8">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold font-mono tracking-widest text-cyan-400 uppercase">DEEP FEATURE MATRIX</span>
            <h2 className="text-3xl md:text-5xl font-black text-white">Enterprise Feature Showcase</h2>
            <p className="text-sm md:text-base text-zinc-400 leading-relaxed">
              Explore the full suite of autonomous agent capabilities engineered for modern software development teams.
            </p>
          </div>

          {/* FEATURE SHOWCASE 1: SWARM NETWORKS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800/90 shadow-2xl relative overflow-hidden group">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-bold">
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span>Feature #01 — Autonomous Multi-Agent Swarms</span>
              </div>

              <h3 className="text-2xl md:text-4xl font-black text-white leading-tight">
                Collaborative Swarm Intelligence with Live Execution Streams
              </h3>

              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                Configure dedicated specialized agents for Code Architecture, Frontend Design, Security Audits, and Quality Assurance. Each agent executes in sequence, broadcasting thinking plans, live code edits, and execution logs directly into your workspace.
              </p>

              <ul className="space-y-3 font-mono text-xs text-zinc-300">
                <li className="flex items-center gap-2 text-indigo-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Customizable system roles, agent wishes & file attachments</span>
                </li>
                <li className="flex items-center gap-2 text-indigo-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Live stop & emergency pause controls during swarm loops</span>
                </li>
                <li className="flex items-center gap-2 text-indigo-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Real-time thinking tree rendering with expandable step details</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden border border-zinc-700/80 shadow-2xl group-hover:scale-[1.02] transition-transform duration-500">
                <img 
                  src={swarmNetworkImg} 
                  alt="Swarm Network Visualization" 
                  referrerPolicy="no-referrer"
                  className="w-full aspect-[16/9] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-xs font-mono text-cyan-300 flex items-center justify-between">
                  <span>● Node Sync Active: 12 Agents connected</span>
                  <span className="text-emerald-400 font-bold">Latency: 12ms</span>
                </div>
              </div>
            </div>
          </div>

          {/* FEATURE SHOWCASE 2: DATABASE & CLOUD SYNC */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800/90 shadow-2xl relative overflow-hidden group">
            
            <div className="lg:col-span-6 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-bold">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>Feature #02 — GitHub & Supabase Sync Pipeline</span>
              </div>

              <h3 className="text-2xl md:text-4xl font-black text-white leading-tight">
                Seamless Code Repository & Cloud Postgres Sync
              </h3>

              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                Connect your workspace directly to GitHub repositories to create commits and pull requests. Execute SQL queries directly on your Supabase Postgres database with interactive table inspection, schema migration generators, and live data viewers.
              </p>

              <ul className="space-y-3 font-mono text-xs text-zinc-300">
                <li className="flex items-center gap-2 text-cyan-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>1-Click GitHub Repository Commit & Sync</span>
                </li>
                <li className="flex items-center gap-2 text-cyan-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Supabase SQL Query Editor & DB Schema Explorer</span>
                </li>
                <li className="flex items-center gap-2 text-cyan-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Instant Export to Zip, PDF, & Word (.docx) formats</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-6 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden border border-zinc-700/80 shadow-2xl group-hover:scale-[1.02] transition-transform duration-500">
                <img 
                  src={cloudSyncImg} 
                  alt="Cloud Database Sync Pipeline" 
                  referrerPolicy="no-referrer"
                  className="w-full aspect-[16/9] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-xs font-mono text-indigo-300 flex items-center justify-between">
                  <span>● Supabase Postgres Connected</span>
                  <span className="text-cyan-400 font-bold">GitHub Sync: Ready</span>
                </div>
              </div>
            </div>

          </div>

          {/* FEATURE SHOWCASE 3: WORKSPACE & MEDIA SUITE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4 hover:border-amber-500/40 transition-all">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl w-fit">
                <Mail className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">Google Workspace & Gmail</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Compose and send emails directly through Gmail, summarize inbox threads, and archive completed projects to Google Drive.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4 hover:border-purple-500/40 transition-all">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl w-fit">
                <Music className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">JioSaavn & Media Player</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Listen to curated focus tracks, coding playlists, or search YouTube videos with real-time AI transcript summarization.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4 hover:border-emerald-500/40 transition-all">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl w-fit">
                <Code className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">Sandboxed JS Execution</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Run JavaScript and TypeScript code snippets inside an isolated browser sandbox with real-time console log capturing.
              </p>
            </div>

          </div>

        </section>

        {/* MODEL COMPARISON MATRIX */}
        <section id="matrix" className="space-y-8 pt-8">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold font-mono tracking-widest text-indigo-400 uppercase">MODEL INTELLIGENCE</span>
            <h2 className="text-3xl md:text-5xl font-black text-white">OpenRouter Model Matrix</h2>
            <p className="text-sm md:text-base text-zinc-400 leading-relaxed">
              Compare speed, context window, and code reasoning scores across top integrated AI model brains.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-900/80 shadow-2xl">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-zinc-800 text-xs font-mono uppercase text-zinc-400 bg-zinc-950/80">
                  <th className="p-4 pl-6">Model Identifier</th>
                  <th className="p-4">Provider</th>
                  <th className="p-4">Context Window</th>
                  <th className="p-4">Coding Score</th>
                  <th className="p-4 pr-6">Primary Use Case</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs font-mono">
                <tr className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-4 pl-6 font-bold text-indigo-400">google/gemini-2.5-flash</td>
                  <td className="p-4 text-zinc-300">Google AI</td>
                  <td className="p-4 text-emerald-400 font-bold">1,000,000 Tokens</td>
                  <td className="p-4 text-amber-400 font-bold">98.5%</td>
                  <td className="p-4 pr-6 text-zinc-400">Ultra-fast multi-file code generation</td>
                </tr>
                <tr className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-4 pl-6 font-bold text-cyan-400">anthropic/claude-3.5-sonnet</td>
                  <td className="p-4 text-zinc-300">Anthropic</td>
                  <td className="p-4 text-emerald-400 font-bold">200,000 Tokens</td>
                  <td className="p-4 text-amber-400 font-bold">99.1%</td>
                  <td className="p-4 pr-6 text-zinc-400">Complex system architecture & refactoring</td>
                </tr>
                <tr className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-4 pl-6 font-bold text-purple-400">deepseek/deepseek-r1</td>
                  <td className="p-4 text-zinc-300">DeepSeek AI</td>
                  <td className="p-4 text-emerald-400 font-bold">128,000 Tokens</td>
                  <td className="p-4 text-amber-400 font-bold">97.8%</td>
                  <td className="p-4 pr-6 text-zinc-400">Deep mathematical logic & chain-of-thought</td>
                </tr>
                <tr className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-4 pl-6 font-bold text-emerald-400">meta-llama/llama-3.3-70b</td>
                  <td className="p-4 text-zinc-300">Meta AI</td>
                  <td className="p-4 text-emerald-400 font-bold">128,000 Tokens</td>
                  <td className="p-4 text-amber-400 font-bold">94.2%</td>
                  <td className="p-4 pr-6 text-zinc-400">Open-weight balanced task execution</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ ACCORDION SECTION */}
        <section id="faq" className="space-y-8 pt-8 max-w-4xl mx-auto">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold font-mono tracking-widest text-emerald-400 uppercase">HONEST & TRANSPARENT</span>
            <h2 className="text-3xl md:text-5xl font-black text-white">Frequently Asked Questions</h2>
            <p className="text-sm text-zinc-400">Clear, straightforward answers about our token conservation, guest mode, and cloud tools.</p>
          </div>

          <div className="space-y-4">
            {faqData.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/80 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-6 text-left flex items-center justify-between text-sm font-bold text-white hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180 text-indigo-400" : "text-zinc-500"}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-xs text-zinc-300 leading-relaxed border-t border-zinc-800/50 pt-4">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* AUTHENTICATION & KEY SETUP CARD (THE GATEWAY) */}
        <section id="auth-section" className="space-y-8 pt-12">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold font-mono tracking-widest text-emerald-400 uppercase">NO OBSTACLES</span>
            <h2 className="text-3xl md:text-5xl font-black text-white">Start Building in Seconds</h2>
            <p className="text-sm md:text-base text-zinc-400 leading-relaxed">
              Choose how you want to work: jump straight in with 1-click Guest Mode, sync with Google or GitHub, or bring your custom API key.
            </p>
          </div>

          <VibeCoderVideoCanvas className="max-w-3xl mx-auto">
            
            {/* STEP 1: KEY & MODEL (OPTIONAL) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-emerald-400">
                  <Key className="w-4 h-4 text-emerald-400" /> Option A: Custom Model Key (Optional)
                </h3>
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 hover:underline"
                >
                  <span>Get OpenRouter Key</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-8 relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={localKey}
                    onChange={(e) => setLocalKey(e.target.value)}
                    placeholder="Paste OpenRouter Key (or skip to enter directly)"
                    className={`w-full rounded-2xl p-4 text-xs font-mono bg-zinc-950/90 border ${
                      localKey && !isValidOpenRouterKey(localKey)
                        ? "border-rose-500 focus:ring-rose-500"
                        : "border-zinc-800 focus:ring-emerald-500"
                    } text-white placeholder-zinc-500 focus:outline-none focus:ring-2`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-4 top-4 text-zinc-400 hover:text-white"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {localKey && !isValidOpenRouterKey(localKey) && (
                    <p className="text-[10px] text-rose-400 font-medium mt-1.5 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      OpenRouter API keys start with "sk-or-". Please verify the key format.
                    </p>
                  )}
                </div>

                <div className="md:col-span-4">
                  <button
                    onClick={handleSaveKey}
                    className="w-full h-full min-h-[48px] bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25"
                  >
                    {keySaved ? (
                      <>
                        <Check className="w-4 h-4 text-white" /> Key Saved!
                      </>
                    ) : (
                      "Save Custom Key"
                    )}
                  </button>
                </div>
              </div>

              {/* MODEL SELECTOR */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-zinc-400 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" /> Preferred AI Model Brain
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => onSelectModel(e.target.value)}
                  className="w-full rounded-2xl p-4 text-xs font-bold font-mono bg-zinc-950/90 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {Array.from(new Map((availableModels || []).map(m => [m.id, m])).values()).map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.id})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* STEP 2: WORKSPACE & AUTH */}
            <div className="space-y-4 border-t border-zinc-800 pt-6">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-indigo-400">
                <Layout className="w-4 h-4 text-indigo-400" /> Option B: Choose Your Entry Mode
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400">Workspace Title</label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Enterprise Autonomous Dev Studio"
                  className="w-full rounded-2xl p-4 text-xs font-bold bg-zinc-950/90 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {authError && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                  {authError}
                </div>
              )}

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-center gap-1.5 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => setAuthMode("guest")}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      authMode === "guest"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Instant Guest</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode("oauth")}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      authMode === "oauth" ? "bg-indigo-600 text-white shadow-md" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>OAuth SSO</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode("email")}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      authMode === "email" ? "bg-indigo-600 text-white shadow-md" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Email Auth</span>
                  </button>
                </div>

                {authMode === "guest" ? (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-zinc-950 to-cyan-950/20 border border-emerald-500/30 space-y-4 text-left">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                            NO ACCOUNT NEEDED
                          </span>
                          <span className="text-zinc-400 text-xs font-medium">100% Free Instant Access</span>
                        </div>
                        <h4 className="text-base font-bold text-white">Direct Guest Developer Entry</h4>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          Jump straight into the workspace studio with full access to the active code editor, terminal runner, multi-agent panels, photo editor, games, and math visualizers.
                        </p>
                      </div>
                      <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 shrink-0 hidden sm:flex">
                        <Bot className="w-6 h-6 text-emerald-400" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center">
                        <span className="text-[10px] text-zinc-400 block font-semibold">Terminal</span>
                        <span className="text-xs font-bold text-emerald-400">Port 3000 Active</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center">
                        <span className="text-[10px] text-zinc-400 block font-semibold">Multi-Agents</span>
                        <span className="text-xs font-bold text-cyan-400">15+ Built-in</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center">
                        <span className="text-[10px] text-zinc-400 block font-semibold">Sandbox</span>
                        <span className="text-xs font-bold text-amber-400">Node / Bash / Py</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center">
                        <span className="text-[10px] text-zinc-400 block font-semibold">Persistence</span>
                        <span className="text-xs font-bold text-indigo-400">Local Disk Cache</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGuestEntry}
                      className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-sm shadow-xl shadow-emerald-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/40"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
                      <span>Enter Workspace Directly as Guest</span>
                      <ArrowRight className="w-4 h-4 text-emerald-200" />
                    </button>
                  </div>
                ) : authMode === "oauth" ? (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={handleGoogleAuth}
                        disabled={isAuthLoading}
                        className="bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs p-4 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-3 shadow-xl hover:scale-102 active:scale-95"
                      >
                        <Globe className="w-5 h-5 text-blue-600" />
                        <span>Sign In with Google</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleGithubAuth}
                        disabled={isAuthLoading}
                        className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs p-4 rounded-2xl border border-zinc-800 transition-all cursor-pointer flex items-center justify-center gap-3 shadow-xl hover:scale-102 active:scale-95"
                      >
                        <Github className="w-5 h-5 text-white" />
                        <span>Sign In with GitHub</span>
                      </button>
                    </div>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={handleGuestEntry}
                        className="text-xs text-zinc-400 hover:text-emerald-400 font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Prefer to skip authentication? Enter directly as Guest &rarr;</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    <form onSubmit={handleEmailAuth} className="space-y-3 bg-zinc-950/80 p-5 rounded-2xl border border-zinc-800">
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span className="font-bold text-white">{isSignUp ? "Create Real Account" : "Sign In to Account"}</span>
                        <button
                          type="button"
                          onClick={() => setIsSignUp(!isSignUp)}
                          className="text-indigo-400 hover:underline font-bold"
                        >
                          {isSignUp ? "Already have an account? Sign In" : "Need an account? Register"}
                        </button>
                      </div>

                      <div className="space-y-2">
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="Enter email address (e.g. user@domain.com)"
                          className="w-full rounded-xl p-3 text-xs bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                        <input
                          type="password"
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="Enter password (min 6 characters)"
                          className="w-full rounded-xl p-3 text-xs bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isAuthLoading}
                        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/30 cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isAuthLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        )}
                        <span>{isSignUp ? "Register & Enter Studio" : "Authenticate & Enter Studio"}</span>
                      </button>
                    </form>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={handleGuestEntry}
                        className="text-xs text-zinc-400 hover:text-emerald-400 font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>No account yet? Enter directly as Guest &rarr;</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </VibeCoderVideoCanvas>

        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-800 py-8 text-center text-xs text-zinc-400 z-10 bg-zinc-950/80">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-white">Agent Swarm Studio Enterprise</span>
          </div>
          <p>© 2026 Agent Swarm Studio. Built for autonomous AI engineering.</p>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Security</span>
            <span>•</span>
            <span>API Status</span>
          </div>
        </div>

        {/* PIYUSH KUMAR NEON REVOLVING SIGNATURE */}
        <NeonSignature />
      </footer>

    </div>
  );
};
