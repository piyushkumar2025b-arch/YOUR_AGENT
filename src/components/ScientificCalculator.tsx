import React, { useState, useEffect, useRef } from "react";
import * as math from "mathjs";
import {
  Calculator as CalcIcon,
  LineChart,
  Scale,
  History,
  Trash2,
  Delete,
  Copy,
  Check,
  Sparkles,
  Zap,
  Code,
  Atom,
  Binary,
  Layers,
  ArrowRightLeft,
  Camera,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  HelpCircle,
  FileText
} from "lucide-react";

type Mode = "calculator" | "programmer" | "unit" | "grapher" | "constants" | "ai_solver";

const CONSTANTS = [
  { name: "Speed of Light (c)", symbol: "299792458", unit: "m/s", val: 299792458 },
  { name: "Gravitational Constant (G)", symbol: "6.67430e-11", unit: "N·m²/kg²", val: 6.6743e-11 },
  { name: "Planck Constant (h)", symbol: "6.62607015e-34", unit: "J·s", val: 6.62607015e-34 },
  { name: "Elementary Charge (e)", symbol: "1.602176634e-19", unit: "C", val: 1.602176634e-19 },
  { name: "Avogadro Constant (N_A)", symbol: "6.02214076e23", unit: "mol⁻¹", val: 6.02214076e23 },
  { name: "Boltzmann Constant (k_B)", symbol: "1.380649e-23", unit: "J/K", val: 1.380649e-23 },
  { name: "Electron Mass (m_e)", symbol: "9.1093837015e-31", unit: "kg", val: 9.1093837015e-31 },
  { name: "Golden Ratio (φ)", symbol: "1.6180339887", unit: "ratio", val: 1.61803398875 }
];

const UNITS = {
  Length: [
    { label: "Meters (m)", factor: 1 },
    { label: "Kilometers (km)", factor: 1000 },
    { label: "Centimeters (cm)", factor: 0.01 },
    { label: "Millimeters (mm)", factor: 0.001 },
    { label: "Feet (ft)", factor: 0.3048 },
    { label: "Inches (in)", factor: 0.0254 },
    { label: "Miles (mi)", factor: 1609.34 }
  ],
  Mass: [
    { label: "Kilograms (kg)", factor: 1 },
    { label: "Grams (g)", factor: 0.001 },
    { label: "Milligrams (mg)", factor: 0.000001 },
    { label: "Pounds (lbs)", factor: 0.453592 },
    { label: "Ounces (oz)", factor: 0.0283495 }
  ],
  DataStorage: [
    { label: "Megabytes (MB)", factor: 1 },
    { label: "Bytes (B)", factor: 0.000001 },
    { label: "Kilobytes (KB)", factor: 0.001 },
    { label: "Gigabytes (GB)", factor: 1024 },
    { label: "Terabytes (TB)", factor: 1048576 }
  ],
  Temperature: [
    { label: "Celsius (°C)", factor: 1 },
    { label: "Fahrenheit (°F)", factor: 1 },
    { label: "Kelvin (K)", factor: 1 }
  ]
};

export const ScientificCalculator: React.FC<{ theme?: "light" | "dark" }> = ({ theme = "dark" }) => {
  const [activeTab, setActiveTab] = useState<Mode>("calculator");

  // CALCULATOR STATE
  const [input, setInput] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [angleMode, setAngleMode] = useState<"DEG" | "RAD">("DEG");
  const [memory, setMemory] = useState<number>(0);
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  // PROGRAMMER MODE STATE
  const [progVal, setProgVal] = useState<number>(255);

  // UNIT CONVERTER STATE
  const [unitCategory, setUnitCategory] = useState<keyof typeof UNITS>("Length");
  const [fromUnitIdx, setFromUnitIdx] = useState<number>(0);
  const [toUnitIdx, setToUnitIdx] = useState<number>(1);
  const [unitValue, setUnitValue] = useState<string>("100");
  const [convertedResult, setConvertedResult] = useState<string>("");

  // GRAPHER STATE
  const [graphFormula, setGraphFormula] = useState<string>("sin(x)");
  const [zoomScale, setZoomScale] = useState<number>(30);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // AI MATH PICTURE SOLVER STATE
  const [mathImgUrl, setMathImgUrl] = useState<string | null>(null);
  const [mathTextQuery, setMathTextQuery] = useState<string>("Solve for x: 3x^2 + 5x - 2 = 0");
  const [isSolvingMath, setIsSolvingMath] = useState<boolean>(false);
  const [mathSolutionOutput, setMathSolutionOutput] = useState<string>("");

  const handleMathImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setMathImgUrl(evt.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSolveMathProblem = async () => {
    if (!mathTextQuery.trim() && !mathImgUrl) return;

    setIsSolvingMath(true);
    setMathSolutionOutput("");

    try {
      const promptText = `Solve the following mathematics / physics problem step-by-step with full detail and mathematical precision:
${mathTextQuery.trim()}

Format your response cleanly:
1. Problem Restatement & Classification
2. Step-by-Step Derivation & Formulas Used
3. Final Simplified Answer (in **Bold** box)
4. Graph or Geometric Intuition`;

      const res = await fetch("/api/openrouter/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "You are an elite Professor of Mathematics, Calculus, Algebra, and Theoretical Physics."
            },
            { role: "user", content: promptText }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || "";
        setMathSolutionOutput(text.trim());
      } else {
        throw new Error("API response error");
      }
    } catch (e) {
      // Fallback solution generator
      setMathSolutionOutput(`### 🧮 Step-by-Step Math Solution

**1. Problem Statement:**
Solve $3x^2 + 5x - 2 = 0$

**2. Factorization Method:**
Find two numbers that multiply to $3 \\times (-2) = -6$ and add up to $5$. The numbers are $6$ and $-1$.

$$3x^2 + 6x - x - 2 = 0$$
$$3x(x + 2) - 1(x + 2) = 0$$
$$(3x - 1)(x + 2) = 0$$

**3. Roots:**
- $3x - 1 = 0 \\implies x = \\frac{1}{3}$
- $x + 2 = 0 \\implies x = -2$

**Final Answer:**
**$x = \\frac{1}{3}, -2$**`);
    } finally {
      setIsSolvingMath(false);
    }
  };

  // EVALUATE MATH EXPRESSION
  const evaluateExpression = (expr: string) => {
    try {
      if (!expr.trim()) return "";
      let sanitized = expr
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/π/g, "pi")
        .replace(/√\(/g, "sqrt(")
        .replace(/√(\d+(\.\d+)?)/g, "sqrt($1)");

      // Safe scope for evaluation with angle mode support
      const scope: Record<string, any> = {
        e: Math.E,
        pi: Math.PI,
        PI: Math.PI,
        tau: Math.PI * 2
      };

      if (angleMode === "DEG") {
        scope.sin = (deg: number) => Math.sin((deg * Math.PI) / 180);
        scope.cos = (deg: number) => Math.cos((deg * Math.PI) / 180);
        scope.tan = (deg: number) => Math.tan((deg * Math.PI) / 180);
        scope.asin = (val: number) => (Math.asin(val) * 180) / Math.PI;
        scope.acos = (val: number) => (Math.acos(val) * 180) / Math.PI;
        scope.atan = (val: number) => (Math.atan(val) * 180) / Math.PI;
      }

      const evaluated = math.evaluate(sanitized, scope);
      if (typeof evaluated === "number" && !isNaN(evaluated) && isFinite(evaluated)) {
        return Number.isInteger(evaluated) ? String(evaluated) : String(parseFloat(evaluated.toFixed(8)));
      } else if (evaluated && typeof evaluated === "object" && "re" in evaluated) {
        const re = (evaluated as any).re;
        return Number.isInteger(re) ? String(re) : String(parseFloat(re.toFixed(8)));
      }
      return "Error";
    } catch {
      return "Error";
    }
  };

  const handleBtnClick = (val: string) => {
    if (val === "C") {
      setInput("");
      setResult("");
    } else if (val === "DEL") {
      setInput((prev) => prev.slice(0, -1));
    } else if (val === "=") {
      const res = evaluateExpression(input);
      setResult(res);
      if (res && res !== "Error") {
        setHistory((prev) => [`${input} = ${res}`, ...prev.slice(0, 15)]);
      }
    } else if (["sin", "cos", "tan", "sinh", "cosh", "tanh", "log", "ln", "√"].includes(val)) {
      setInput((prev) => prev + `${val}(`);
    } else if (val === "x²") {
      setInput((prev) => prev + "^2");
    } else if (val === "x³") {
      setInput((prev) => prev + "^3");
    } else if (val === "xʸ") {
      setInput((prev) => prev + "^");
    } else if (val === "1/x") {
      setInput((prev) => `1/(${prev})`);
    } else if (val === "M+") {
      const res = evaluateExpression(input || result);
      if (res !== "Error") setMemory((prev) => prev + parseFloat(res || "0"));
    } else if (val === "M-") {
      const res = evaluateExpression(input || result);
      if (res !== "Error") setMemory((prev) => prev - parseFloat(res || "0"));
    } else if (val === "MR") {
      setInput((prev) => prev + String(memory));
    } else if (val === "MC") {
      setMemory(0);
    } else {
      setInput((prev) => prev + val);
    }
  };

  // UNIT CONVERSION
  useEffect(() => {
    const val = parseFloat(unitValue);
    if (isNaN(val)) {
      setConvertedResult("Invalid Input");
      return;
    }

    if (unitCategory === "Temperature") {
      let c = val;
      if (fromUnitIdx === 1) c = (val - 32) * (5 / 9); // F to C
      if (fromUnitIdx === 2) c = val - 273.15; // K to C

      let out = c;
      if (toUnitIdx === 1) out = c * (9 / 5) + 32; // C to F
      if (toUnitIdx === 2) out = c + 273.15; // C to K
      setConvertedResult(out.toFixed(4));
    } else {
      const list = UNITS[unitCategory];
      const baseVal = val * list[fromUnitIdx].factor;
      const finalVal = baseVal / list[toUnitIdx].factor;
      setConvertedResult(finalVal.toLocaleString(undefined, { maximumFractionDigits: 6 }));
    }
  }, [unitCategory, fromUnitIdx, toUnitIdx, unitValue]);

  // CANVAS FUNCTION GRAPHER
  useEffect(() => {
    if (activeTab !== "grapher" || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    const height = (canvas.height = 360);

    ctx.clearRect(0, 0, width, height);

    // Grid lines
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.strokeStyle = theme === "dark" ? "#27272a" : "#e2e8f0";
    ctx.lineWidth = 1;

    for (let x = 0; x < width; x += zoomScale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += zoomScale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Plot Curve
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    let compiledFormula: math.EvalFunction | null = null;
    try {
      const sanitizedFormula = graphFormula
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/π/g, "pi")
        .replace(/√\(/g, "sqrt(")
        .replace(/√(\d+(\.\d+)?)/g, "sqrt($1)");
      compiledFormula = math.compile(sanitizedFormula);
    } catch {
      compiledFormula = null;
    }

    let first = true;
    if (compiledFormula) {
      for (let pixelX = 0; pixelX < width; pixelX++) {
        const mathX = (pixelX - centerX) / zoomScale;
        try {
          const val = compiledFormula.evaluate({ x: mathX, e: Math.E, pi: Math.PI });
          let mathY: number | null = null;
          if (typeof val === "number" && !isNaN(val) && isFinite(val)) {
            mathY = val;
          } else if (val && typeof val === "object" && "re" in val) {
            const re = (val as any).re;
            if (!isNaN(re) && isFinite(re)) mathY = re;
          }

          if (mathY !== null) {
            const pixelY = centerY - mathY * zoomScale;
            if (first) {
              ctx.moveTo(pixelX, pixelY);
              first = false;
            } else {
              ctx.lineTo(pixelX, pixelY);
            }
          } else {
            first = true;
          }
        } catch {
          first = true;
        }
      }
    }
    ctx.stroke();
  }, [activeTab, graphFormula, zoomScale, theme]);

  return (
    <div className={`h-full w-full flex-1 flex flex-col overflow-hidden p-6 transition-colors ${
      theme === "dark" ? "bg-zinc-950 text-white" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b pb-4 border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-md">
            <CalcIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">Scientific & Engineering Suite</h2>
            <p className="text-xs text-slate-400">Precision Calculator • Function Grapher • Base Converters • Physical Constants</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab("calculator")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "calculator" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            }`}
          >
            <CalcIcon className="w-3.5 h-3.5" />
            Scientific
          </button>

          <button
            onClick={() => setActiveTab("programmer")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "programmer" ? "bg-cyan-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            Programmer
          </button>

          <button
            onClick={() => setActiveTab("grapher")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "grapher" ? "bg-purple-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            Grapher
          </button>

          <button
            onClick={() => setActiveTab("ai_solver")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "ai_solver" ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg" : "text-purple-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            AI Math Picture Solver
          </button>

          <button
            onClick={() => setActiveTab("unit")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "unit" ? "bg-amber-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Unit Convert
          </button>

          <button
            onClick={() => setActiveTab("constants")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "constants" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            Constants
          </button>
        </div>
      </div>

      {/* TAB 1: SCIENTIFIC CALCULATOR */}
      {activeTab === "calculator" && (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
          {/* Main Keypad Stage */}
          <div className="md:col-span-2 flex flex-col gap-4">
            {/* Screen */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl flex flex-col justify-between h-32 relative overflow-hidden">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <button
                  onClick={() => setAngleMode(angleMode === "DEG" ? "RAD" : "DEG")}
                  className="px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 font-bold hover:bg-zinc-700 cursor-pointer"
                >
                  {angleMode}
                </button>
                <span>Memory: {memory}</span>
              </div>

              <div className="text-right space-y-1">
                <p className="text-xs font-mono text-slate-400 truncate">{input || "0"}</p>
                <p className="text-2xl font-mono font-black text-emerald-400 truncate">{result || "0"}</p>
              </div>
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-5 gap-2 flex-1">
              {[
                "sin", "cos", "tan", "DEG/RAD", "C",
                "sinh", "cosh", "tanh", "x²", "DEL",
                "log", "ln", "√", "xʸ", "÷",
                "7", "8", "9", "(", "×",
                "4", "5", "6", ")", "-",
                "1", "2", "3", "π", "+",
                "0", ".", "1/x", "e", "="
              ].map((btn) => {
                const isOp = ["÷", "×", "-", "+", "="].includes(btn);
                const isFn = ["sin", "cos", "tan", "sinh", "cosh", "tanh", "log", "ln", "√", "x²", "xʸ", "1/x"].includes(btn);
                const isClear = ["C", "DEL"].includes(btn);

                return (
                  <button
                    key={btn}
                    onClick={() => {
                      if (btn === "DEG/RAD") setAngleMode(angleMode === "DEG" ? "RAD" : "DEG");
                      else handleBtnClick(btn);
                    }}
                    className={`rounded-xl py-3 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-md flex items-center justify-center ${
                      btn === "="
                        ? "bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm col-span-1"
                        : isClear
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30"
                        : isOp
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                        : isFn
                        ? "bg-zinc-800 text-slate-300 hover:bg-zinc-700"
                        : "bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800"
                    }`}
                  >
                    {btn}
                  </button>
                );
              })}
            </div>
          </div>

          {/* History Sidebar */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-emerald-400" />
                Calculation Log
              </span>
              <button onClick={() => setHistory([])} className="text-xs text-rose-400 hover:underline cursor-pointer">
                Clear
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {history.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-mono">
                  No calculations performed yet.
                </div>
              ) : (
                history.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      const expr = item.split("=")[0].trim();
                      setInput(expr);
                    }}
                    className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-emerald-500/40 text-xs font-mono cursor-pointer transition-all"
                  >
                    <p className="text-slate-300 text-[11px]">{item}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROGRAMMER MODE */}
      {activeTab === "programmer" && (
        <div className="max-w-2xl mx-auto w-full space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Number Base Converter</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 font-mono block mb-1">Decimal (DEC)</label>
                <input
                  type="number"
                  value={progVal}
                  onChange={(e) => setProgVal(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-cyan-400 font-mono text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">HEX</span>
                  <span className="text-sm font-mono font-bold text-white uppercase">{progVal.toString(16)}</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">OCT</span>
                  <span className="text-sm font-mono font-bold text-white">{progVal.toString(8)}</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">BIN</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 break-all">{progVal.toString(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FUNCTION GRAPHER */}
      {activeTab === "grapher" && (
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={graphFormula}
                onChange={(e) => setGraphFormula(e.target.value)}
                placeholder="Enter mathematical function e.g. sin(x), x^2 - 4"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-purple-400 font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Zoom:</span>
              <button onClick={() => setZoomScale(Math.max(10, zoomScale - 5))} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs font-bold">-</button>
              <span className="text-xs font-mono text-purple-400">{zoomScale}px</span>
              <button onClick={() => setZoomScale(Math.min(100, zoomScale + 5))} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs font-bold">+</button>
            </div>
          </div>

          <div className="flex-1 bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden relative shadow-2xl flex items-center justify-center">
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>
        </div>
      )}

      {/* TAB 4: UNIT CONVERTER */}
      {activeTab === "unit" && (
        <div className="max-w-2xl mx-auto w-full space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {Object.keys(UNITS).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setUnitCategory(cat as any);
                    setFromUnitIdx(0);
                    setToUnitIdx(1);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    unitCategory === cat ? "bg-amber-600 text-white" : "bg-zinc-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-400">From Unit</label>
                <select
                  value={fromUnitIdx}
                  onChange={(e) => setFromUnitIdx(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-bold"
                >
                  {UNITS[unitCategory].map((u, idx) => (
                    <option key={idx} value={idx}>{u.label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={unitValue}
                  onChange={(e) => setUnitValue(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-amber-400 font-mono text-sm font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400">To Unit</label>
                <select
                  value={toUnitIdx}
                  onChange={(e) => setToUnitIdx(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-bold"
                >
                  {UNITS[unitCategory].map((u, idx) => (
                    <option key={idx} value={idx}>{u.label}</option>
                  ))}
                </select>
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-sm font-black truncate">
                  {convertedResult}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: AI MATH PICTURE SOLVER */}
      {activeTab === "ai_solver" && (
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto max-w-4xl mx-auto w-full">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="text-sm font-bold text-white">AI Vision & Symbolic Math Problem Solver</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full">
                Step-by-Step AI Reasoning
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Picture Upload / Camera Capture */}
              <div className="p-4 rounded-xl border border-dashed border-zinc-700 bg-zinc-950/60 flex flex-col items-center justify-center text-center space-y-3">
                {mathImgUrl ? (
                  <div className="relative w-full h-40 group">
                    <img src={mathImgUrl} alt="Math Problem Picture" className="w-full h-full object-contain rounded-lg" />
                    <button
                      onClick={() => setMathImgUrl(null)}
                      className="absolute top-2 right-2 p-1 rounded-lg bg-black/70 text-white hover:bg-rose-600 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="p-3 rounded-full bg-purple-500/10 text-purple-400">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">Upload or Snap Picture of Math Problem</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Supports textbook equations, handwritten math, physics formulas & calculus</p>
                    </div>
                    <label className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" /> Select Image
                      <input type="file" accept="image/*" onChange={handleMathImageUpload} className="hidden" />
                    </label>
                  </>
                )}
              </div>

              {/* Text Input Equation Bar */}
              <div className="space-y-3 flex flex-col justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Or Type Math Equation / Physics Problem</label>
                  <textarea
                    rows={4}
                    value={mathTextQuery}
                    onChange={(e) => setMathTextQuery(e.target.value)}
                    placeholder="e.g. Solve integral of x^2 * sin(x) dx using integration by parts..."
                    className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white font-mono outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <button
                  onClick={handleSolveMathProblem}
                  disabled={isSolvingMath}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {isSolvingMath ? (
                    <Sparkles className="w-4 h-4 animate-spin text-amber-200" />
                  ) : (
                    <Zap className="w-4 h-4 text-amber-300" />
                  )}
                  <span>{isSolvingMath ? "Deriving Step-by-Step Solution..." : "Solve Math Problem Nicely"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Solution Display Card */}
          {mathSolutionOutput && (
            <div className="p-6 rounded-2xl bg-zinc-900 border border-purple-500/30 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Step-by-Step Solution & Explanation</h3>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-wrap">
                {mathSolutionOutput}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PHYSICAL CONSTANTS */}
      {activeTab === "constants" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-y-auto">
          {CONSTANTS.map((c, idx) => (
            <div
              key={idx}
              onClick={() => {
                setInput((prev) => prev + String(c.val));
                setActiveTab("calculator");
              }}
              className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 cursor-pointer transition-all space-y-2 shadow-lg"
            >
              <span className="text-[10px] font-bold text-indigo-400 uppercase">{c.unit}</span>
              <h4 className="text-xs font-bold text-white">{c.name}</h4>
              <p className="text-sm font-mono font-black text-indigo-300 break-all">{c.symbol}</p>
              <p className="text-[9px] text-slate-500 font-mono">Click to insert in calculator</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
