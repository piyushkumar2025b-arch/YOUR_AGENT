import React, { useState, useEffect, useCallback } from "react";
import * as math from "mathjs";
import {
  X,
  Calculator,
  Download,
  Sparkles,
  Layers,
  FileSpreadsheet,
  FileText,
  Activity,
  Sliders,
  AlertCircle,
  TrendingUp,
  Cpu,
  Play,
  Pause,
  RotateCcw,
  Globe,
  Radio,
  Zap,
  RefreshCw,
  Maximize2,
  Minimize2,
  Maximize
} from "lucide-react";

interface MathPlotterModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: "dark" | "light";
}

export type PlotMode = 
  | "2d_function" 
  | "2d_parametric" 
  | "2d_polar" 
  | "3d_surface" 
  | "3d_parametric" 
  | "2d_contour" 
  | "data_statistical"
  | "vector_field"
  | "realtime_stream";

interface Preset {
  name: string;
  category: string;
  mode: PlotMode;
  expr1: string;
  expr2?: string;
  expr3?: string;
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  description: string;
}

const PRESETS: Preset[] = [
  {
    name: "Quantum Wave Function (2D)",
    category: "Physics & Waves",
    mode: "2d_function",
    expr1: "exp(-0.2*x^2) * cos(4*x)",
    xMin: -5,
    xMax: 5,
    description: "Gaussian enveloped wave packet showing spatial localization."
  },
  {
    name: "Damped Harmonic Oscillator",
    category: "Physics & Mechanics",
    mode: "2d_function",
    expr1: "exp(-0.3*x) * sin(5*x)",
    xMin: 0,
    xMax: 10,
    description: "Classic physics model of decaying spring-mass oscillation."
  },
  {
    name: "Polynomial Roots & Extremes",
    category: "Calculus",
    mode: "2d_function",
    expr1: "x^4 - 4*x^2 + x",
    xMin: -3,
    xMax: 3,
    description: "Quartic polynomial with multiple local minima and extrema."
  },
  {
    name: "Butterfly Curve (Parametric 2D)",
    category: "Geometry",
    mode: "2d_parametric",
    expr1: "sin(t) * (exp(cos(t)) - 2*cos(4*t) - sin(t/12)^5)",
    expr2: "cos(t) * (exp(cos(t)) - 2*cos(4*t) - sin(t/12)^5)",
    xMin: 0,
    xMax: 25,
    description: "Transcendental parametric curve discovered by Fay in 1989."
  },
  {
    name: "Lissajous Resonance Curve",
    category: "Engineering",
    mode: "2d_parametric",
    expr1: "sin(3*t + 0.5)",
    expr2: "sin(4*t)",
    xMin: 0,
    xMax: 6.28,
    description: "Harmonic signal phase ratio visualization (3:4 frequency ratio)."
  },
  {
    name: "Rose Curve (Polar 2D)",
    category: "Geometry",
    mode: "2d_polar",
    expr1: "cos(5*theta)",
    xMin: 0,
    xMax: 6.28,
    description: "5-petaled polar mathematical rose curve."
  },
  {
    name: "3D Sombrero / Mexican Hat",
    category: "3D Surfaces",
    mode: "3d_surface",
    expr1: "sin(sqrt(x^2 + y^2) + 0.0001) / (sqrt(x^2 + y^2) + 0.0001)",
    xMin: -8,
    xMax: 8,
    yMin: -8,
    yMax: 8,
    description: "Bessel-like radial ripple function in 3-dimensional space."
  },
  {
    name: "3D Saddle Point / Hyperbolic Paraboloid",
    category: "3D Surfaces",
    mode: "3d_surface",
    expr1: "x^2 - y^2",
    xMin: -4,
    xMax: 4,
    yMin: -4,
    yMax: 4,
    description: "Classic multivariable calculus saddle point stationary behavior."
  },
  {
    name: "3D Helical Helix Curve",
    category: "3D Curves",
    mode: "3d_parametric",
    expr1: "cos(t)",
    expr2: "sin(t)",
    expr3: "t / 5",
    xMin: 0,
    xMax: 30,
    description: "Space trajectory curve representing spiral helical motion."
  },
  {
    name: "Gaussian 2D Contour Heatmap",
    category: "Statistics & Fields",
    mode: "2d_contour",
    expr1: "exp(-(x^2 + y^2)/4) * cos(x) * sin(y)",
    xMin: -5,
    xMax: 5,
    yMin: -5,
    yMax: 5,
    description: "Topographical isoline contour plot with color intensity mapping."
  },
  {
    name: "Vortex Rotational Vector Field",
    category: "Vector Calculus",
    mode: "vector_field",
    expr1: "-y",
    expr2: "x",
    xMin: -5,
    xMax: 5,
    yMin: -5,
    yMax: 5,
    description: "Rotational vector field representing circulation around origin."
  }
];

// Helper to pre-process math expression shorthand (e.g. "2x" -> "2*x", "3cos(x)" -> "3*cos(x)")
export function preprocessMathExpression(expr: string): string {
  if (!expr) return "";
  let clean = expr.trim();
  // Standardize operators & unicode math symbols
  clean = clean.replace(/×/g, "*").replace(/÷/g, "/").replace(/π/gi, "pi").replace(/θ/gi, "theta");
  // Convert ln(x) -> log(x) for mathjs natural log
  clean = clean.replace(/\bln\(/gi, "log(");
  // Implicit multiplication: number followed by letter or ( e.g. 2x -> 2*x, 3.14x -> 3.14*x, 5(x) -> 5*(x), avoiding scientific notation e.g. 1e-5
  clean = clean.replace(/(\d+(\.\d+)?)(?![eE][+-]?\d)\s*([a-zA-Z(])/g, "$1*$3");
  // Implicit multiplication: ) followed by number or letter or ( e.g. (x+1)2 -> (x+1)*2, (x+1)(x-1) -> (x+1)*(x-1)
  clean = clean.replace(/(\))\s*(\d+|[a-zA-Z(])/g, "$1*$2");
  // Implicit multiplication: variable followed by function e.g. x sin(x) -> x*sin(x)
  clean = clean.replace(/\b(x|y|z|t|theta)\s+(sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|exp|log|sqrt|abs)\b/gi, "$1*$2");
  return clean;
}

let _plotlyCache: any = null;

const getPlotlyEngine = async (): Promise<any> => {
  if (_plotlyCache) return _plotlyCache;

  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && (window as any).Plotly) {
      _plotlyCache = (window as any).Plotly;
      return resolve(_plotlyCache);
    }

    if (typeof document === "undefined") {
      return reject(new Error("DOM is not available"));
    }

    const script = document.createElement("script");
    script.src = "https://cdn.plot.ly/plotly-2.35.2.min.js";
    script.async = true;
    script.onload = () => {
      _plotlyCache = (window as any).Plotly;
      resolve(_plotlyCache);
    };
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
};

export const MathPlotterModal: React.FC<MathPlotterModalProps> = ({
  isOpen,
  onClose,
  theme = "dark"
}) => {
  // DOM element state for container ref safety
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);

  // Callback ref
  const containerRefCallback = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setContainerEl(node);
    }
  }, []);

  // Form State
  const [plotMode, setPlotMode] = useState<PlotMode>("2d_function");
  const [expr1, setExpr1] = useState<string>("sin(x) * x");
  const [expr2, setExpr2] = useState<string>("cos(x)");
  const [expr3, setExpr3] = useState<string>("x / 5");
  
  // Custom Data Points State for Statistical Mode
  const [customDataPoints, setCustomDataPoints] = useState<string>("12, 19, 3, 5, 2, 8, 15, 22, 14, 18, 25, 9, 11");
  const [statChartType, setStatChartType] = useState<"scatter" | "bar" | "histogram" | "box">("scatter");

  // Domain & Range Controls
  const [xMin, setXMin] = useState<number>(-10);
  const [xMax, setXMax] = useState<number>(10);
  const [yMin, setYMin] = useState<number>(-10);
  const [yMax, setYMax] = useState<number>(10);
  const [resolution, setResolution] = useState<number>(150);

  // Calculus Inspector States
  const [evalX0, setEvalX0] = useState<number>(2);
  const [integralA, setIntegralA] = useState<number>(-2);
  const [integralB, setIntegralB] = useState<number>(2);
  const [showTangent, setShowTangent] = useState<boolean>(true);
  const [showIntegralArea, setShowIntegralArea] = useState<boolean>(true);

  // Real-Time Streaming State
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamTime, setStreamTime] = useState<number>(0);
  const [streamSpeed, setStreamSpeed] = useState<number>(60); // update interval ms
  const [streamType, setStreamType] = useState<"wave_2d" | "ripple_3d" | "ecg_medical" | "brownian_stock" | "crypto_ticker">("wave_2d");
  const [cryptoSymbol, setCryptoSymbol] = useState<string>("BTCUSDT");
  const [cryptoPrice, setCryptoPrice] = useState<number>(68500);
  const [liveStreamBuffer, setLiveStreamBuffer] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] });

  // Analysis Outputs
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<{
    roots: number[];
    criticalPoints: { x: number; y: number; type: "min" | "max" }[];
    derivativeAtX0: number | null;
    tangentLineExpr: string | null;
    integralVal: number | null;
    meanVal: number | null;
    stdDevVal: number | null;
    minVal: number | null;
    maxVal: number | null;
    latexFormula: string | null;
  }>({
    roots: [],
    criticalPoints: [],
    derivativeAtX0: null,
    tangentLineExpr: null,
    integralVal: null,
    meanVal: null,
    stdDevVal: null,
    minVal: null,
    maxVal: null,
    latexFormula: null,
  });

  // State for image exporting lock
  const [isExportingImage, setIsExportingImage] = useState<boolean>(false);

  // Full Screen & Auto-Fit Size Fixer States
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isAutoResizing, setIsAutoResizing] = useState<boolean>(false);

  // Force Resize & All-in-One Size Fixer Handler
  const handleForceResize = useCallback(async () => {
    setIsAutoResizing(true);
    try {
      const plotlyEngine = await getPlotlyEngine();
      if (containerEl && plotlyEngine && typeof plotlyEngine.Plots?.resize === "function") {
        plotlyEngine.Plots.resize(containerEl);
      }
      if (typeof renderPlotAndAnalyze === "function") {
        await renderPlotAndAnalyze();
      }
    } catch (err) {
      console.warn("Auto-resize error:", err);
    } finally {
      setTimeout(() => setIsAutoResizing(false), 300);
    }
  }, [containerEl]);

  // Trigger Size Calibrator when Fullscreen toggled or Modal opened
  useEffect(() => {
    if (isOpen && containerEl) {
      const timer = setTimeout(() => {
        handleForceResize();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [isFullScreen, isOpen, containerEl]);

  // Attach ResizeObserver to containerEl
  useEffect(() => {
    if (!containerEl) return;
    const observer = new ResizeObserver(async () => {
      try {
        const plotlyEngine = await getPlotlyEngine();
        if (
          plotlyEngine &&
          typeof plotlyEngine.Plots?.resize === "function" &&
          (containerEl as any)._fullLayout &&
          containerEl.offsetWidth > 0 &&
          containerEl.offsetHeight > 0
        ) {
          plotlyEngine.Plots.resize(containerEl);
        }
      } catch {}
    });
    observer.observe(containerEl);
    return () => observer.disconnect();
  }, [containerEl]);

  // Real-time animation loop effect
  useEffect(() => {
    if (!isStreaming || plotMode !== "realtime_stream") return;

    const interval = setInterval(() => {
      setStreamTime(prev => prev + 0.08);

      // If Crypto Ticker mode, update live buffer with random walk or real fetch
      if (streamType === "crypto_ticker" || streamType === "brownian_stock") {
        setCryptoPrice(prev => {
          const delta = (Math.random() - 0.49) * (prev * 0.003);
          const nextPrice = Number((prev + delta).toFixed(2));
          setLiveStreamBuffer(buf => {
            const currentX = buf?.x || [];
            const currentY = buf?.y || [];
            const nextX = [...currentX, currentX.length + 1];
            const nextY = [...currentY, nextPrice];
            if (nextX.length > 80) {
              nextX.shift();
              nextY.shift();
            }
            return { x: nextX, y: nextY };
          });
          return nextPrice;
        });
      }
    }, streamSpeed);

    return () => clearInterval(interval);
  }, [isStreaming, plotMode, streamSpeed, streamType]);

  // Real-Time Plot re-render effect when stream ticks
  useEffect(() => {
    if (isStreaming && plotMode === "realtime_stream" && containerEl && isOpen) {
      renderRealtimeStreamPlot();
    }
  }, [streamTime, liveStreamBuffer, isStreaming, plotMode, containerEl, isOpen]);

  // Statistical Plot re-render effect when chart type or data changes
  useEffect(() => {
    if (plotMode === "data_statistical" && containerEl && isOpen) {
      renderStatisticalPlot();
    }
  }, [statChartType, customDataPoints, plotMode, containerEl, isOpen]);

  // Fetch real crypto price once if requested
  const fetchRealCryptoPrice = async () => {
    try {
      const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${cryptoSymbol.toUpperCase()}`);
      if (res.ok) {
        const json = await res.json();
        const price = parseFloat(json.price);
        if (!isNaN(price)) {
          setCryptoPrice(price);
        }
      }
    } catch {
      // Fallback to stock base price
    }
  };

  useEffect(() => {
    if (streamType === "crypto_ticker") {
      fetchRealCryptoPrice();
    }
  }, [streamType, cryptoSymbol]);

  // Render & Analysis Trigger
  const renderPlotAndAnalyze = useCallback(async (
    overrideExpr1?: string,
    overrideExpr2?: string,
    overrideExpr3?: string,
    overrideMode?: PlotMode
  ) => {
    if (!containerEl) return;
    setAnalysisError(null);

    const activeMode = overrideMode || plotMode;
    const activeE1 = overrideExpr1 !== undefined ? overrideExpr1 : expr1;
    const activeE2 = overrideExpr2 !== undefined ? overrideExpr2 : expr2;
    const activeE3 = overrideExpr3 !== undefined ? overrideExpr3 : expr3;

    try {
      if (activeMode === "2d_function") {
        await render2DFunctionPlot(activeE1);
      } else if (activeMode === "2d_parametric") {
        await render2DParametricPlot(activeE1, activeE2);
      } else if (activeMode === "2d_polar") {
        await render2DPolarPlot(activeE1);
      } else if (activeMode === "3d_surface") {
        await render3DSurfacePlot(activeE1);
      } else if (activeMode === "3d_parametric") {
        await render3DParametricPlot(activeE1, activeE2, activeE3);
      } else if (activeMode === "2d_contour") {
        await render2DContourPlot(activeE1);
      } else if (activeMode === "data_statistical") {
        await renderStatisticalPlot();
      } else if (activeMode === "vector_field") {
        await renderVectorFieldPlot(activeE1, activeE2);
      } else if (activeMode === "realtime_stream") {
        await renderRealtimeStreamPlot();
      }
    } catch (err: any) {
      console.warn("Plot rendering error:", err);
      setAnalysisError(err?.message || "Invalid mathematical expression or parameters. Press Ctrl+Enter to re-compute.");
    }
  }, [
    containerEl,
    plotMode,
    expr1,
    expr2,
    expr3,
    customDataPoints,
    statChartType,
    xMin,
    xMax,
    yMin,
    yMax,
    resolution,
    evalX0,
    integralA,
    integralB,
    showTangent,
    showIntegralArea,
    streamType,
    cryptoSymbol,
    theme
  ]);

  // Global Ctrl + Enter / Cmd + Enter Keyboard Shortcut Listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        renderPlotAndAnalyze();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, renderPlotAndAnalyze]);

  // Trigger plot whenever dependencies change or modal opens
  useEffect(() => {
    if (!isOpen || !containerEl) return;
    const timer = setTimeout(() => {
      renderPlotAndAnalyze();
    }, 20);
    return () => clearTimeout(timer);
  }, [isOpen, containerEl, renderPlotAndAnalyze]);

  // Safe Scope Helper for mathjs evaluation
  const getSafeScope = (x: number = 0, y: number = 0, z: number = 0, t: number = 0, theta: number = 0) => ({
    x, y, z, t, theta,
    e: Math.E, pi: Math.PI, E: Math.E, PI: Math.PI, phi: 1.618033988749895, tau: Math.PI * 2,
    sin: Math.sin, cos: Math.cos, tan: Math.tan,
    asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2,
    sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
    sec: (v: number) => 1 / Math.cos(v), csc: (v: number) => 1 / Math.sin(v), cot: (v: number) => 1 / Math.tan(v),
    exp: Math.exp, log: Math.log, log10: Math.log10, log2: Math.log2, ln: Math.log,
    sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs, sign: Math.sign,
    floor: Math.floor, ceil: Math.ceil, round: Math.round, trunc: Math.trunc,
    min: Math.min, max: Math.max, pow: Math.pow
  });

  // Helper to extract clean numeric value from numbers or mathjs Complex objects
  const evaluateToNumber = (compiled: math.EvalFunction, scope: any): number | null => {
    try {
      const val = compiled.evaluate(scope);
      if (typeof val === "number") {
        return !isNaN(val) && isFinite(val) ? val : null;
      } else if (val && typeof val === "object" && "re" in val) {
        return (Math.abs((val as any).im || 0) < 1e-10 && !isNaN((val as any).re) && isFinite((val as any).re)) ? (val as any).re : null;
      }
      return null;
    } catch {
      return null;
    }
  };

  // 1. 2D FUNCTION PLOT & CALCULUS
  const render2DFunctionPlot = async (targetExpr?: string) => {
    const exprToUse = targetExpr !== undefined ? targetExpr : expr1;
    const rawExprs = exprToUse.split(",").map(e => e.trim()).filter(Boolean);
    if (rawExprs.length === 0) {
      setAnalysisError("Please enter a valid mathematical expression (e.g. sin(x) * x)");
      return;
    }

    const parsedExprs: any[] = [];
    rawExprs.forEach(e => {
      try {
        const clean = preprocessMathExpression(e);
        parsedExprs.push({ raw: e, compiled: math.parse(clean).compile() });
      } catch (err: any) {
        throw new Error(`Syntax error in "${e}": ${err?.message || "Invalid math format"}`);
      }
    });

    const safeRes = Math.max(20, Math.min(resolution || 150, 400));
    const step = (xMax - xMin) / safeRes;
    const xVals: number[] = [];
    for (let i = 0; i <= safeRes; i++) {
      xVals.push(xMin + i * step);
    }

    const traces: any[] = [];
    const colors = ["#00f2fe", "#ff007f", "#00ffcc", "#a855f7", "#f59e0b"];

    let primaryYVals: (number | null)[] = [];
    let latexStr = "";

    parsedExprs.forEach((item, idx) => {
      const yVals: (number | null)[] = [];
      xVals.forEach(x => {
        const numVal = evaluateToNumber(item.compiled, getSafeScope(x, 0, 0, 0, 0));
        yVals.push(numVal);
      });

      if (idx === 0) {
        primaryYVals = yVals;
        try {
          latexStr = math.parse(preprocessMathExpression(item.raw)).toTex();
        } catch {
          latexStr = item.raw;
        }
      }

      traces.push({
        x: xVals,
        y: yVals as number[],
        type: "scatter",
        mode: "lines",
        name: `f${idx + 1}(x) = ${item.raw}`,
        line: { color: colors[idx % colors.length], width: 3 }
      });
    });

    // Numerical Analysis on Primary Function
    let derivativeVal: number | null = null;
    let tangentExprStr: string | null = null;
    let integralResult: number | null = null;
    const rootsFound: number[] = [];
    const criticalPts: { x: number; y: number; type: "min" | "max" }[] = [];

    if (parsedExprs.length > 0 && primaryYVals.length > 0) {
      const compiled0 = parsedExprs[0].compiled;

      // Tangent Line at evalX0
      try {
        const h = 0.0001;
        const yPlus = evaluateToNumber(compiled0, getSafeScope(evalX0 + h, 0, 0, 0, 0));
        const yMinus = evaluateToNumber(compiled0, getSafeScope(evalX0 - h, 0, 0, 0, 0));
        const y0 = evaluateToNumber(compiled0, getSafeScope(evalX0, 0, 0, 0, 0));

        if (yPlus !== null && yMinus !== null && y0 !== null) {
          derivativeVal = (yPlus - yMinus) / (2 * h);
          tangentExprStr = `y = ${derivativeVal.toFixed(2)}(x - ${evalX0.toFixed(2)}) + ${y0.toFixed(2)}`;

          if (showTangent) {
            const tangentXVals = [evalX0 - 3, evalX0 + 3];
            const tangentYVals = tangentXVals.map(x => y0 + derivativeVal! * (x - evalX0));
            traces.push({
              x: tangentXVals,
              y: tangentYVals,
              type: "scatter",
              mode: "lines",
              name: `Tangent f'(${evalX0}) = ${derivativeVal.toFixed(3)}`,
              line: { color: "#f59e0b", width: 2, dash: "dash" }
            });

            traces.push({
              x: [evalX0],
              y: [y0],
              type: "scatter",
              mode: "markers",
              name: `P(${evalX0}, ${y0.toFixed(2)})`,
              marker: { color: "#f59e0b", size: 9, symbol: "circle" }
            });
          }
        }
      } catch {}

      // Definite Integral trapezoidal calculation with dynamic step cap
      try {
        const span = Math.abs(integralB - integralA);
        const nSteps = Math.min(1000, Math.max(20, Math.floor(span * 50)));
        const intStep = span / nSteps;
        let area = 0;
        const startX = Math.min(integralA, integralB);
        const endX = Math.max(integralA, integralB);

        const shadedX: number[] = [startX];
        const shadedY: number[] = [0];

        for (let i = 0; i <= nSteps; i++) {
          const currX = startX + i * intStep;
          if (currX > endX) break;
          const val = evaluateToNumber(compiled0, getSafeScope(currX, 0, 0, 0, 0));
          if (val !== null) {
            shadedX.push(currX);
            shadedY.push(val);
            if (i > 0) {
              const prevX = startX + (i - 1) * intStep;
              const prevVal = evaluateToNumber(compiled0, getSafeScope(prevX, 0, 0, 0, 0));
              if (prevVal !== null) {
                area += 0.5 * (val + prevVal) * intStep;
              }
            }
          }
        }
        shadedX.push(endX);
        shadedY.push(0);

        integralResult = area;

        if (showIntegralArea) {
          traces.push({
            x: shadedX,
            y: shadedY,
            fill: "tozeroy",
            fillcolor: "rgba(99, 102, 241, 0.25)",
            type: "scatter",
            mode: "lines",
            name: `Integral [${integralA}, ${integralB}] = ${area.toFixed(3)}`,
            line: { color: "rgba(99, 102, 241, 0.6)", width: 1 }
          });
        }
      } catch {}

      // Root & Extrema Detection with linear interpolation
      for (let i = 1; i < xVals.length - 1; i++) {
        const yPrev = primaryYVals[i - 1];
        const yCurr = primaryYVals[i];
        const yNext = primaryYVals[i + 1];

        if (typeof yCurr === "number" && typeof yPrev === "number") {
          if (yPrev * yCurr <= 0) {
            const rootX = yCurr === yPrev ? xVals[i] : xVals[i - 1] + (0 - yPrev) * (xVals[i] - xVals[i - 1]) / (yCurr - yPrev);
            if (rootsFound.length < 6 && isFinite(rootX)) {
              rootsFound.push(Number(rootX.toFixed(3)));
            }
          }

          if (typeof yNext === "number") {
            if (yCurr > yPrev && yCurr > yNext) {
              criticalPts.push({ x: Number(xVals[i].toFixed(2)), y: Number(yCurr.toFixed(2)), type: "max" });
            } else if (yCurr < yPrev && yCurr < yNext) {
              criticalPts.push({ x: Number(xVals[i].toFixed(2)), y: Number(yCurr.toFixed(2)), type: "min" });
            }
          }
        }
      }

      if (criticalPts.length > 0) {
        traces.push({
          x: criticalPts.map(p => p.x),
          y: criticalPts.map(p => p.y),
          type: "scatter",
          mode: "markers+text",
          name: "Extrema (Min/Max)",
          text: criticalPts.map(p => `${p.type.toUpperCase()}(${p.x}, ${p.y})`),
          textposition: "top center",
          marker: { color: "#ec4899", size: 8, symbol: "diamond" }
        });
      }

      const validY = primaryYVals.filter((v): v is number => typeof v === "number");
      if (validY.length > 0) {
        const mean = validY.reduce((a, b) => a + b, 0) / validY.length;
        const variance = validY.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / validY.length;
        const stdDev = Math.sqrt(variance);

        setAnalysisResults({
          roots: rootsFound,
          criticalPoints: criticalPts,
          derivativeAtX0: derivativeVal,
          tangentLineExpr: tangentExprStr,
          integralVal: integralResult,
          meanVal: mean,
          stdDevVal: stdDev,
          minVal: Math.min(...validY),
          maxVal: Math.max(...validY),
          latexFormula: latexStr
        });
      }
    }

    await plotGraph(traces, `2D Function Analysis: y = ${exprToUse}`);
  };

  // 2. 2D PARAMETRIC PLOT
  const render2DParametricPlot = async (targetExpr1?: string, targetExpr2?: string) => {
    const e1 = targetExpr1 !== undefined ? targetExpr1 : expr1;
    const e2 = targetExpr2 !== undefined ? targetExpr2 : expr2;

    const compiledX = math.parse(preprocessMathExpression(e1)).compile();
    const compiledY = math.parse(preprocessMathExpression(e2)).compile();

    const safeRes = Math.max(20, Math.min(resolution || 150, 400));
    const step = (xMax - xMin) / (safeRes * 2);
    const xVals: number[] = [];
    const yVals: number[] = [];

    for (let t = xMin; t <= xMax; t += step) {
      const xVal = evaluateToNumber(compiledX, getSafeScope(0, 0, 0, t, 0));
      const yVal = evaluateToNumber(compiledY, getSafeScope(0, 0, 0, t, 0));
      if (xVal !== null && yVal !== null) {
        xVals.push(xVal);
        yVals.push(yVal);
      }
    }

    const traces: any[] = [{
      x: xVals,
      y: yVals,
      type: "scatter",
      mode: "lines",
      name: `x(t)=${e1}, y(t)=${e2}`,
      line: { color: "#a855f7", width: 3 }
    }];

    await plotGraph(traces, `2D Parametric Curve: t ∈ [${xMin}, ${xMax}]`);
  };

  // 3. 2D POLAR PLOT
  const render2DPolarPlot = async (targetExpr?: string) => {
    const e1 = targetExpr !== undefined ? targetExpr : expr1;
    const compiledR = math.parse(preprocessMathExpression(e1)).compile();
    const safeRes = Math.max(20, Math.min(resolution || 150, 400));
    const thetaStart = xMin;
    const thetaEnd = xMax;
    const step = (thetaEnd - thetaStart) / safeRes;

    const rVals: number[] = [];
    const thetaVals: number[] = [];

    for (let i = 0; i <= safeRes; i++) {
      const theta = thetaStart + i * step;
      const r = evaluateToNumber(compiledR, getSafeScope(0, 0, 0, 0, theta));
      if (r !== null) {
        rVals.push(r);
        thetaVals.push(theta * (180 / Math.PI));
      }
    }

    const traces: any[] = [{
      r: rVals,
      theta: thetaVals,
      type: "scatterpolar",
      mode: "lines",
      name: `r(θ) = ${e1}`,
      line: { color: "#00f2fe", width: 3 }
    }];

    await plotGraph(traces, `2D Polar Curve: r(θ) = ${e1}`);
  };

  // 4. 3D SURFACE PLOT
  const render3DSurfacePlot = async (targetExpr?: string) => {
    const e1 = targetExpr !== undefined ? targetExpr : expr1;
    const compiledZ = math.parse(preprocessMathExpression(e1)).compile();
    const gridRes = Math.min(resolution || 150, 50);

    const xStep = (xMax - xMin) / gridRes;
    const yStep = (yMax - yMin) / gridRes;

    const xVals: number[] = [];
    const yVals: number[] = [];
    const zMatrix: number[][] = [];

    for (let i = 0; i <= gridRes; i++) xVals.push(xMin + i * xStep);
    for (let j = 0; j <= gridRes; j++) yVals.push(yMin + j * yStep);

    for (let j = 0; j <= gridRes; j++) {
      const row: number[] = [];
      const y = yVals[j];
      for (let i = 0; i <= gridRes; i++) {
        const x = xVals[i];
        const z = evaluateToNumber(compiledZ, getSafeScope(x, y, 0, 0, 0));
        row.push(z !== null ? z : 0);
      }
      zMatrix.push(row);
    }

    const traces: any[] = [{
      x: xVals,
      y: yVals,
      z: zMatrix,
      type: "surface",
      colorscale: "Viridis"
    }];

    await plotGraph(traces, `3D Surface: z = ${e1}`, true);
  };

  // 5. 3D PARAMETRIC PLOT
  const render3DParametricPlot = async (targetExpr1?: string, targetExpr2?: string, targetExpr3?: string) => {
    const e1 = targetExpr1 !== undefined ? targetExpr1 : expr1;
    const e2 = targetExpr2 !== undefined ? targetExpr2 : expr2;
    const e3 = targetExpr3 !== undefined ? targetExpr3 : expr3;

    const compiledX = math.parse(preprocessMathExpression(e1)).compile();
    const compiledY = math.parse(preprocessMathExpression(e2)).compile();
    const compiledZ = math.parse(preprocessMathExpression(e3)).compile();

    const safeRes = Math.max(20, Math.min(resolution || 150, 400));
    const step = (xMax - xMin) / (safeRes * 2);
    const xVals: number[] = [];
    const yVals: number[] = [];
    const zVals: number[] = [];

    for (let t = xMin; t <= xMax; t += step) {
      const x = evaluateToNumber(compiledX, getSafeScope(0, 0, 0, t, 0));
      const y = evaluateToNumber(compiledY, getSafeScope(0, 0, 0, t, 0));
      const z = evaluateToNumber(compiledZ, getSafeScope(0, 0, 0, t, 0));
      if (x !== null && y !== null && z !== null) {
        xVals.push(x);
        yVals.push(y);
        zVals.push(z);
      }
    }

    const traces: any[] = [{
      x: xVals,
      y: yVals,
      z: zVals,
      type: "scatter3d",
      mode: "lines",
      line: { color: "#ec4899", width: 6 }
    }];

    await plotGraph(traces, `3D Parametric Trajectory`, true);
  };

  // 6. 2D CONTOUR PLOT
  const render2DContourPlot = async (targetExpr?: string) => {
    const e1 = targetExpr !== undefined ? targetExpr : expr1;
    const compiledZ = math.parse(preprocessMathExpression(e1)).compile();
    const gridRes = Math.min(resolution || 150, 60);

    const xStep = (xMax - xMin) / gridRes;
    const yStep = (yMax - yMin) / gridRes;

    const xVals: number[] = [];
    const yVals: number[] = [];
    const zMatrix: number[][] = [];

    for (let i = 0; i <= gridRes; i++) xVals.push(xMin + i * xStep);
    for (let j = 0; j <= gridRes; j++) yVals.push(yMin + j * yStep);

    for (let j = 0; j <= gridRes; j++) {
      const row: number[] = [];
      const y = yVals[j];
      for (let i = 0; i <= gridRes; i++) {
        const x = xVals[i];
        const z = evaluateToNumber(compiledZ, getSafeScope(x, y, 0, 0, 0));
        row.push(z !== null ? z : 0);
      }
      zMatrix.push(row);
    }

    const traces: any[] = [{
      x: xVals,
      y: yVals,
      z: zMatrix,
      type: "contour",
      colorscale: "Electric"
    }];

    await plotGraph(traces, `2D Contour Heatmap: z = ${e1}`);
  };

  // 7. STATISTICAL PLOT
  const renderStatisticalPlot = async () => {
    const nums = customDataPoints
      .split(/[\s,]+/)
      .map(n => parseFloat(n.trim()))
      .filter(n => !isNaN(n));

    if (nums.length === 0) return;

    const xIndices = nums.map((_, i) => i + 1);

    const trace: any = {
      x: statChartType === "histogram" ? nums : (statChartType === "box" ? undefined : xIndices),
      y: statChartType === "histogram" ? undefined : nums,
      type: statChartType === "scatter" ? "scatter" : (statChartType === "bar" ? "bar" : (statChartType === "histogram" ? "histogram" : "box")),
      mode: statChartType === "scatter" ? "lines+markers" : undefined,
      marker: { color: "#00f2fe", size: 8 },
      name: "Dataset Points"
    } as any;

    const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
    const sorted = [...nums].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0 ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 : sorted[Math.floor(sorted.length / 2)];
    const variance = nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / nums.length;
    const stdDev = Math.sqrt(variance);

    setAnalysisResults({
      roots: [],
      criticalPoints: [],
      derivativeAtX0: null,
      tangentLineExpr: null,
      integralVal: null,
      meanVal: mean,
      stdDevVal: stdDev,
      minVal: Math.min(...nums),
      maxVal: Math.max(...nums),
      latexFormula: `N = ${nums.length}, \\mu = ${mean.toFixed(2)}, \\sigma = ${stdDev.toFixed(2)}, \\text{Median} = ${median}`
    });

    await plotGraph([trace], `Dataset Visualization (${nums.length} samples)`);
  };

  // 8. VECTOR FIELD PLOT
  const renderVectorFieldPlot = async (targetExpr1?: string, targetExpr2?: string) => {
    const e1 = targetExpr1 !== undefined ? targetExpr1 : expr1;
    const e2 = targetExpr2 !== undefined ? targetExpr2 : expr2;

    const compiledU = math.parse(preprocessMathExpression(e1)).compile();
    const compiledV = math.parse(preprocessMathExpression(e2)).compile();

    const gridRes = 14;
    const xStep = (xMax - xMin) / gridRes;
    const yStep = (yMax - yMin) / gridRes;

    const xVals: number[] = [];
    const yVals: number[] = [];
    const uVals: number[] = [];
    const vVals: number[] = [];

    for (let i = 0; i <= gridRes; i++) {
      for (let j = 0; j <= gridRes; j++) {
        const x = xMin + i * xStep;
        const y = yMin + j * yStep;
        const u = evaluateToNumber(compiledU, getSafeScope(x, y, 0, 0, 0));
        const v = evaluateToNumber(compiledV, getSafeScope(x, y, 0, 0, 0));
        if (u !== null && v !== null) {
          xVals.push(x);
          yVals.push(y);
          uVals.push(u);
          vVals.push(v);
        }
      }
    }

    const linesX: (number | null)[] = [];
    const linesY: (number | null)[] = [];
    const scale = 0.35;

    for (let i = 0; i < xVals.length; i++) {
      const x0 = xVals[i];
      const y0 = yVals[i];
      const mag = Math.sqrt(uVals[i] ** 2 + vVals[i] ** 2) || 1;
      const dx = (uVals[i] / mag) * scale;
      const dy = (vVals[i] / mag) * scale;
      const x1 = x0 + dx;
      const y1 = y0 + dy;

      linesX.push(x0, x1, null);
      linesY.push(y0, y1, null);

      // Add small arrowhead
      const arrowLen = scale * 0.25;
      const angle = Math.atan2(dy, dx);
      const leftX = x1 - arrowLen * Math.cos(angle - Math.PI / 6);
      const leftY = y1 - arrowLen * Math.sin(angle - Math.PI / 6);
      const rightX = x1 - arrowLen * Math.cos(angle + Math.PI / 6);
      const rightY = y1 - arrowLen * Math.sin(angle + Math.PI / 6);

      linesX.push(x1, leftX, null);
      linesY.push(y1, leftY, null);
      linesX.push(x1, rightX, null);
      linesY.push(y1, rightY, null);
    }

    const traces: any[] = [
      {
        x: linesX as number[],
        y: linesY as number[],
        type: "scatter",
        mode: "lines",
        line: { color: "#00f2fe", width: 1.8 },
        name: `Vector Field: [${e1}, ${e2}]`
      },
      {
        x: xVals,
        y: yVals,
        type: "scatter",
        mode: "markers",
        marker: { color: "#ff007f", size: 4 },
        name: "Grid Origin Points"
      }
    ];

    await plotGraph(traces, `Vector Field: V = [${e1}, ${e2}]`);
  };

  // 9. REAL-TIME STREAMING PLOT
  const renderRealtimeStreamPlot = async () => {
    const traces: any[] = [];

    if (streamType === "wave_2d") {
      const xVals: number[] = [];
      const yVals: number[] = [];
      const numPts = 100;
      const step = 20 / numPts;

      for (let i = 0; i <= numPts; i++) {
        const x = -10 + i * step;
        const y = Math.sin(x - streamTime) * Math.cos(0.5 * streamTime);
        xVals.push(x);
        yVals.push(y);
      }

      traces.push({
        x: xVals,
        y: yVals,
        type: "scatter",
        mode: "lines",
        name: `Dynamic Wave f(x, t=${streamTime.toFixed(2)})`,
        line: { color: "#00f2fe", width: 3 }
      });

      await plotGraph(traces, `Real-Time Dynamic Wave Signal (t = ${streamTime.toFixed(2)}s)`);

    } else if (streamType === "ripple_3d") {
      const gridRes = 30;
      const xVals: number[] = [];
      const yVals: number[] = [];
      const zMatrix: number[][] = [];

      for (let i = 0; i <= gridRes; i++) xVals.push(-6 + i * (12 / gridRes));
      for (let j = 0; j <= gridRes; j++) yVals.push(-6 + j * (12 / gridRes));

      for (let j = 0; j <= gridRes; j++) {
        const row: number[] = [];
        const y = yVals[j];
        for (let i = 0; i <= gridRes; i++) {
          const x = xVals[i];
          const r = Math.sqrt(x * x + y * y) + 0.0001;
          const z = Math.sin(r - 2 * streamTime) / r;
          row.push(z);
        }
        zMatrix.push(row);
      }

      traces.push({
        x: xVals,
        y: yVals,
        z: zMatrix,
        type: "surface",
        colorscale: "Plasma"
      });

      await plotGraph(traces, `3D Real-Time Ripple Manifold (t = ${streamTime.toFixed(2)}s)`, true);

    } else if (streamType === "ecg_medical") {
      const xVals: number[] = [];
      const yVals: number[] = [];
      const pts = 120;

      for (let i = 0; i < pts; i++) {
        const t = streamTime + (i * 0.05);
        let ecg = Math.sin(t * 3) * 0.2;
        // Add QRS complex
        const phase = t % (2 * Math.PI);
        if (phase > 1.5 && phase < 1.7) ecg += 1.8;
        if (phase > 1.4 && phase <= 1.5) ecg -= 0.5;
        if (phase >= 1.7 && phase < 1.8) ecg -= 0.6;

        xVals.push(i);
        yVals.push(ecg);
      }

      traces.push({
        x: xVals,
        y: yVals,
        type: "scatter",
        mode: "lines",
        name: "Cardiac ECG Waveform",
        line: { color: "#10b981", width: 2.5 }
      });

      await plotGraph(traces, `Live ECG Telemetry Stream (Heart Rate: 72 BPM)`);

    } else if (streamType === "brownian_stock" || streamType === "crypto_ticker") {
      const x = liveStreamBuffer?.x || [];
      const y = liveStreamBuffer?.y || [];

      traces.push({
        x: x.length > 0 ? x : [1],
        y: y.length > 0 ? y : [cryptoPrice],
        type: "scatter",
        mode: "lines+markers",
        name: `${cryptoSymbol} Live Feed`,
        line: { color: "#a855f7", width: 2.5 },
        marker: { size: 4, color: "#ec4899" }
      });

      await plotGraph(traces, `Live Ticker Stream: ${cryptoSymbol} = $${cryptoPrice.toLocaleString()}`);
    }
  };

  // CORE PLOTLY RENDER HANDLER
  const plotGraph = async (traces: any[], title: string, is3D = false) => {
    if (!containerEl) return;

    try {
      const plotlyEngine = await getPlotlyEngine();

      if (!plotlyEngine) {
        setAnalysisError("Plotly engine is currently initializing.");
        return;
      }

      setAnalysisError(null);

      // Purge previous plot layout structure to prevent 2D/3D/Polar subplot conflicts
      if (typeof plotlyEngine.purge === "function") {
        try {
          plotlyEngine.purge(containerEl);
        } catch {}
      }

      if (containerEl) {
        containerEl.innerHTML = "";
        delete (containerEl as any)._fullLayout;
        delete (containerEl as any)._fullData;
        delete (containerEl as any).data;
        delete (containerEl as any).layout;
      }

      await new Promise((res) => requestAnimationFrame(res));

      const isDark = theme === "dark";
      const bgColor = isDark ? "#121215" : "#ffffff";
      const paperColor = isDark ? "#121215" : "#ffffff";
      const textColor = isDark ? "#e4e4e7" : "#18181b";
      const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)";

      const layout: any = {
        title: {
          text: title,
          font: { color: textColor, size: 13, family: "monospace" },
          y: 0.98,
          x: 0.5,
          xanchor: "center"
        },
        autosize: true,
        paper_bgcolor: paperColor,
        plot_bgcolor: bgColor,
        font: { color: textColor, family: "sans-serif" },
        margin: { l: 65, r: 35, t: 70, b: 50 },
        showlegend: true,
        legend: {
          x: 0.5,
          xanchor: "center",
          y: 1.16,
          orientation: "h",
          font: { color: textColor, size: 10 },
          bgcolor: isDark ? "rgba(18, 18, 21, 0.75)" : "rgba(255, 255, 255, 0.75)",
          bordercolor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
          borderwidth: 1
        },
        xaxis: {
          gridcolor: gridColor,
          zerolinecolor: isDark ? "#6366f1" : "#4f46e5",
          zerolinewidth: 1.5,
          title: { text: "X Axis", font: { color: textColor, size: 11 } }
        },
        yaxis: {
          gridcolor: gridColor,
          zerolinecolor: isDark ? "#6366f1" : "#4f46e5",
          zerolinewidth: 1.5,
          title: { text: "Y Axis", font: { color: textColor, size: 11 } }
        }
      };

      if (is3D) {
        layout.scene = {
          xaxis: { gridcolor: gridColor, title: { text: "X" } },
          yaxis: { gridcolor: gridColor, title: { text: "Y" } },
          zaxis: { gridcolor: gridColor, title: { text: "Z" } },
          camera: { eye: { x: 1.4, y: 1.4, z: 1.2 } },
          aspectmode: "auto"
        };
      }

      const config: any = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: []
      };

      const safeLayout: any = {
        ...layout,
        annotations: (layout as any)?.annotations || []
      };

      try {
        if (typeof plotlyEngine.newPlot === "function") {
          await plotlyEngine.newPlot(containerEl, traces || [], safeLayout, config);
        } else if (typeof plotlyEngine.react === "function") {
          await plotlyEngine.react(containerEl, traces || [], safeLayout, config);
        }
      } catch (renderErr) {
        console.warn("Primary Plotly render failed, attempting recovery on fresh tick:", renderErr);
        if (typeof plotlyEngine.purge === "function") {
          try { plotlyEngine.purge(containerEl); } catch {}
        }
        if (containerEl) {
          containerEl.innerHTML = "";
          delete (containerEl as any)._fullLayout;
          delete (containerEl as any)._fullData;
          delete (containerEl as any).data;
          delete (containerEl as any).layout;
        }
        await new Promise((res) => setTimeout(res, 50));
        await plotlyEngine.newPlot(containerEl, traces || [], safeLayout, config);
      }

      requestAnimationFrame(() => {
        try {
          if (
            containerEl &&
            (containerEl as any)._fullLayout &&
            containerEl.offsetWidth > 0 &&
            containerEl.offsetHeight > 0
          ) {
            plotlyEngine.Plots?.resize(containerEl);
          }
        } catch {}
      });
    } catch (plotlyErr: any) {
      console.warn("Plotly react notice:", plotlyErr);
      setAnalysisError("Plot rendering notice: " + (plotlyErr?.message || "Verify formula syntax or domain boundaries."));
    }
  };

  // EXPORT HANDLERS
  const handleExportImage = async (format: "png" | "svg") => {
    if (!containerEl || isExportingImage) return;
    setIsExportingImage(true);
    try {
      const plotlyEngine = await getPlotlyEngine();
      if (plotlyEngine && typeof plotlyEngine.downloadImage === "function") {
        await plotlyEngine.downloadImage(containerEl, {
          format: format,
          width: 1200,
          height: 800,
          filename: `MathVisualizer_${plotMode}_${Date.now()}`
        });
      } else {
        setAnalysisError("Plotly download engine is unavailable.");
      }
    } catch (err: any) {
      console.warn("Export image error:", err);
      if (err?.message?.includes("Snapshotting already in progress")) {
        setAnalysisError("Image generation is already in progress. Please wait a moment.");
      } else {
        setAnalysisError("Export failed: " + (err?.message || "Could not generate image download."));
      }
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Type,Formula,Analysis_Output\n";
    csvContent += `Mode,${plotMode}\n`;
    csvContent += `Formula,${expr1}\n`;
    if (analysisResults.derivativeAtX0 !== null) {
      csvContent += `Derivative_At_X0,${analysisResults.derivativeAtX0}\n`;
    }
    if (analysisResults.integralVal !== null) {
      csvContent += `Integral_Val,${analysisResults.integralVal}\n`;
    }
    if (analysisResults.meanVal !== null) {
      csvContent += `Mean,${analysisResults.meanVal}\n`;
      csvContent += `StdDev,${analysisResults.stdDevVal}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Math_Data_${plotMode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      plotMode,
      formula: expr1,
      formula2: expr2,
      formula3: expr3,
      domainRange: { xMin, xMax, yMin, yMax },
      analysis: analysisResults
    };

    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `Math_Analysis_Report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md transition-all duration-300 ${
      isFullScreen ? "p-0" : "p-2 sm:p-5 overflow-y-auto custom-scrollbar"
    }`}>
      {/* Outer Card Container */}
      <div className={`w-full flex flex-col shadow-2xl border border-zinc-800 bg-[#0d0d10] text-zinc-100 transition-all duration-300 ${
        isFullScreen
          ? "w-screen h-screen max-w-none max-h-none rounded-none border-0 overflow-hidden"
          : "max-w-7xl max-h-[94vh] rounded-2xl overflow-hidden"
      }`}>
        
        {/* TOP HEADER MODAL BAR */}
        <div className={`px-5 py-3 border-b flex items-center justify-between shrink-0 ${
          theme === "dark" ? "bg-[#141418] border-zinc-800" : "bg-slate-50 border-slate-200"
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 text-white shadow-md">
              <Calculator className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight text-white">Interactive Math Engine & Plotter</h2>
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-xs flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-300" /> Real-time 2D/3D Plotly
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Calculus derivatives, definite integrals, 3D surface manifolds, vector fields & real-time live data streams.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* All-in-One Size Fixer Button */}
            <button
              onClick={handleForceResize}
              disabled={isAutoResizing}
              className="px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
              title="All-in-One Size Fixer: Recalibrate canvas viewport, margins, and graph scaling"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isAutoResizing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{isAutoResizing ? "Resizing..." : "Auto-Fit Size"}</span>
            </button>

            {/* Fullscreen Toggle Button */}
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs ${
                isFullScreen
                  ? "border-amber-500/40 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                  : "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
              }`}
              title={isFullScreen ? "Restore Normal Screen Mode" : "Maximize to Full Screen"}
            >
              {isFullScreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Full Screen</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all cursor-pointer"
              title="Close Math Plotter"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MAIN MODAL BODY CONTAINER */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* LEFT CONTROL SIDEBAR (4 COLS) */}
          <div className="lg:col-span-4 p-4 border-r border-zinc-800/80 bg-[#121215] overflow-y-auto space-y-4 custom-scrollbar">
            
            {/* Preset Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Formula Presets
              </label>
              <select
                onChange={(e) => {
                  const found = PRESETS.find(p => p.name === e.target.value);
                  if (found) {
                    setPlotMode(found.mode);
                    setExpr1(found.expr1);
                    setExpr2(found.expr2 || "cos(x)");
                    setExpr3(found.expr3 || "x / 5");
                    if (found.xMin !== undefined) setXMin(found.xMin);
                    if (found.xMax !== undefined) setXMax(found.xMax);
                    if (found.yMin !== undefined) setYMin(found.yMin);
                    if (found.yMax !== undefined) setYMax(found.yMax);
                    renderPlotAndAnalyze(found.expr1, found.expr2 || "cos(x)", found.expr3 || "x / 5", found.mode);
                  }
                }}
                className="w-full p-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-200 text-xs font-semibold focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
              >
                <option value="">-- Choose Mathematical Preset --</option>
                {PRESETS.map((p, idx) => (
                  <option key={idx} value={p.name}>
                    [{p.category}] {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Plot Mode Selection Tabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                Plot Mode
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "2d_function", label: "2D Function" },
                  { id: "2d_parametric", label: "2D Parametric" },
                  { id: "2d_polar", label: "2D Polar" },
                  { id: "3d_surface", label: "3D Surface" },
                  { id: "3d_parametric", label: "3D Curve" },
                  { id: "2d_contour", label: "2D Contour" },
                  { id: "data_statistical", label: "Statistical" },
                  { id: "vector_field", label: "Vector Field" },
                  { id: "realtime_stream", label: "⚡ Real-Time" }
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      const newMode = m.id as PlotMode;
                      setPlotMode(newMode);
                      if (newMode === "realtime_stream") {
                        setIsStreaming(true);
                      }
                      renderPlotAndAnalyze(undefined, undefined, undefined, newMode);
                    }}
                    className={`p-2 rounded-xl border text-[10px] font-bold text-center transition-all cursor-pointer ${
                      plotMode === m.id
                        ? "bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border-cyan-500 text-cyan-300 shadow-sm"
                        : "bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* REAL-TIME STREAM CONTROLS */}
            {plotMode === "realtime_stream" && (
              <div className="space-y-3 p-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    Live Data Streamer
                  </h3>
                  <button
                    onClick={() => setIsStreaming(prev => !prev)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                      isStreaming ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-emerald-600 text-white"
                    }`}
                  >
                    {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isStreaming ? "Pause" : "Start Live"}</span>
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 block mb-1">Signal Type:</label>
                    <select
                      value={streamType}
                      onChange={(e) => setStreamType(e.target.value as any)}
                      className="w-full p-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-cyan-300 text-xs font-bold"
                    >
                      <option value="wave_2d">Dynamic Wave Function f(x, t)</option>
                      <option value="ripple_3d">3D Real-Time Ripple z(x,y,t)</option>
                      <option value="ecg_medical">Medical ECG Heartbeat Stream</option>
                      <option value="brownian_stock">Stock Market Brownian Walk</option>
                      <option value="crypto_ticker">Crypto Public API Ticker</option>
                    </select>
                  </div>

                  {streamType === "crypto_ticker" && (
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={cryptoSymbol}
                        onChange={(e) => setCryptoSymbol(e.target.value.toUpperCase())}
                        placeholder="BTCUSDT, ETHUSDT"
                        className="flex-1 p-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-white font-mono text-xs"
                      />
                      <button
                        onClick={fetchRealCryptoPrice}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300">
                    <span>Frame Interval: {streamSpeed}ms</span>
                    <input
                      type="range"
                      min="20"
                      max="300"
                      value={streamSpeed}
                      onChange={(e) => setStreamSpeed(Number(e.target.value))}
                      className="w-24 accent-cyan-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Function Input Controls */}
            {plotMode !== "realtime_stream" && plotMode !== "data_statistical" && (
              <div className="space-y-3 p-3 rounded-xl border bg-zinc-900/40 border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-400" />
                    Mathematical Expressions
                  </h3>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Press <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-cyan-300 border border-zinc-700">Ctrl</kbd> + <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-cyan-300 border border-zinc-700">Enter</kbd>
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                      {plotMode === "2d_function" ? "f(x) Expression (comma separated for multi-curve):" : 
                       plotMode === "2d_parametric" ? "x(t) Expression:" :
                       plotMode === "2d_polar" ? "r(θ) Expression:" :
                       plotMode === "3d_surface" || plotMode === "2d_contour" ? "z = f(x, y) Expression:" :
                       plotMode === "3d_parametric" ? "x(t) Expression:" :
                       plotMode === "vector_field" ? "u(x, y) Vector Component:" : "Expression:"}
                    </label>
                    <input
                      type="text"
                      value={expr1}
                      onChange={(e) => setExpr1(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                          e.preventDefault();
                          renderPlotAndAnalyze();
                        }
                      }}
                      placeholder="e.g. sin(x) * x"
                      className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-500 transition-all shadow-inner"
                    />
                  </div>

                  {(plotMode === "2d_parametric" || plotMode === "3d_parametric" || plotMode === "vector_field") && (
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                        {plotMode === "vector_field" ? "v(x, y) Vector Component:" : "y(t) Expression:"}
                      </label>
                      <input
                        type="text"
                        value={expr2}
                        onChange={(e) => setExpr2(e.target.value)}
                        onKeyDown={(e) => {
                          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                            e.preventDefault();
                            renderPlotAndAnalyze();
                          }
                        }}
                        placeholder="e.g. cos(t)"
                        className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-pink-400 font-mono text-xs focus:outline-none focus:border-pink-500 transition-all shadow-inner"
                      />
                    </div>
                  )}

                  {plotMode === "3d_parametric" && (
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 block mb-1">z(t) Expression:</label>
                      <input
                        type="text"
                        value={expr3}
                        onChange={(e) => setExpr3(e.target.value)}
                        onKeyDown={(e) => {
                          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                            e.preventDefault();
                            renderPlotAndAnalyze();
                          }
                        }}
                        placeholder="e.g. t / 5"
                        className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-amber-400 font-mono text-xs focus:outline-none shadow-inner"
                      />
                    </div>
                  )}

                  {/* PROMINENT COMPUTE & PLOT BUTTON */}
                  <button
                    type="button"
                    onClick={() => renderPlotAndAnalyze()}
                    className="w-full py-2.5 px-4 my-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border border-indigo-400/30 group"
                  >
                    <Zap className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform animate-pulse" />
                    <span>Compute Values & Build Plot</span>
                    <span className="ml-auto text-[10px] bg-black/40 px-2 py-0.5 rounded border border-white/20 font-mono text-cyan-200">
                      Ctrl + Enter
                    </span>
                  </button>

                  {/* Quick Formula Keypad */}
                  <div className="pt-2 border-t border-zinc-800/60">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Quick Insert Keypad</span>
                      <button
                        type="button"
                        onClick={() => { setExpr1(""); setExpr2(""); setExpr3(""); }}
                        className="text-[9px] text-rose-400 hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    </p>
                    <div className="grid grid-cols-6 gap-1">
                      {["sin(", "cos(", "tan(", "sqrt(", "exp(", "log(", "x", "y", "t", "theta", "^2", "*", "/", "+", "-", "pi"].map((keySymbol) => (
                        <button
                          key={keySymbol}
                          type="button"
                          onClick={() => {
                            const updated = expr1 ? `${expr1}${keySymbol}` : keySymbol;
                            setExpr1(updated);
                          }}
                          className="p-1 rounded text-[10px] font-mono font-bold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-cyan-300 transition-all cursor-pointer"
                        >
                          {keySymbol}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {plotMode === "data_statistical" && (
              <div className="space-y-2 p-3 rounded-xl border bg-zinc-900/40 border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-zinc-400 block">Dataset Points (Comma or Space Separated):</label>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-cyan-300 border border-zinc-700">Ctrl</kbd> + <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-cyan-300 border border-zinc-700">Enter</kbd>
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={customDataPoints}
                  onChange={(e) => setCustomDataPoints(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                      e.preventDefault();
                      renderPlotAndAnalyze();
                    }
                  }}
                  placeholder="e.g. 10, 15, 23, 17, 8, 29, 31"
                  className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-cyan-300 font-mono text-xs focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() => renderPlotAndAnalyze()}
                  className="w-full py-2 px-3 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Compute Statistics & Build Chart</span>
                  <span className="ml-auto text-[10px] bg-black/40 px-1.5 py-0.5 rounded border border-white/20 font-mono">
                    Ctrl + Enter
                  </span>
                </button>

                <div className="flex gap-2">
                  {(["scatter", "bar", "histogram", "box"] as const).map(ct => (
                    <button
                      key={ct}
                      onClick={() => {
                        setStatChartType(ct);
                      }}
                      className={`flex-1 p-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        statChartType === ct ? "bg-cyan-500/20 border-cyan-500 text-cyan-300" : "border-zinc-800 text-zinc-400"
                      }`}
                    >
                      {ct}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Domain & Resolution Sliders */}
            {plotMode !== "realtime_stream" && (
              <div className="space-y-2 p-3 rounded-xl border bg-zinc-900/40 border-zinc-800/80">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  Domain & Resolution
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-semibold text-zinc-400">X Min: {xMin}</label>
                    <input
                      type="range"
                      min="-50"
                      max="0"
                      value={xMin}
                      onChange={(e) => setXMin(Number(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-zinc-400">X Max: {xMax}</label>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={xMax}
                      onChange={(e) => setXMax(Number(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                </div>

                {(plotMode === "3d_surface" || plotMode === "2d_contour" || plotMode === "vector_field") && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] font-semibold text-zinc-400">Y Min: {yMin}</label>
                      <input
                        type="range"
                        min="-50"
                        max="0"
                        value={yMin}
                        onChange={(e) => setYMin(Number(e.target.value))}
                        className="w-full accent-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-zinc-400">Y Max: {yMax}</label>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={yMax}
                        onChange={(e) => setYMax(Number(e.target.value))}
                        className="w-full accent-purple-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-semibold text-zinc-400">Sampling Resolution: {resolution}</label>
                  <input
                    type="range"
                    min="30"
                    max="250"
                    value={resolution}
                    onChange={(e) => setResolution(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Calculus Derivative & Integral Inspector (2D Function Mode) */}
            {plotMode === "2d_function" && (
              <div className="space-y-2 p-3 rounded-xl border bg-zinc-900/40 border-zinc-800/80">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  Calculus Inspector
                </h3>
                
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-zinc-300">Tangent Point (x₀): {evalX0}</label>
                    <label className="flex items-center gap-1 text-[10px] text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showTangent}
                        onChange={(e) => setShowTangent(e.target.checked)}
                        className="accent-amber-500"
                      />
                      Overlay
                    </label>
                  </div>
                  <input
                    type="range"
                    min={xMin}
                    max={xMax}
                    step="0.1"
                    value={evalX0}
                    onChange={(e) => setEvalX0(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div className="space-y-1.5 text-xs pt-1 border-t border-zinc-800">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-zinc-300">Integral Interval [a, b]: [{integralA}, {integralB}]</label>
                    <label className="flex items-center gap-1 text-[10px] text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showIntegralArea}
                        onChange={(e) => setShowIntegralArea(e.target.checked)}
                        className="accent-indigo-500"
                      />
                      Shade
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={integralA}
                      onChange={(e) => setIntegralA(Number(e.target.value))}
                      className="p-1 rounded border border-zinc-800 bg-zinc-950 text-indigo-300 text-xs font-mono"
                    />
                    <input
                      type="number"
                      value={integralB}
                      onChange={(e) => setIntegralB(Number(e.target.value))}
                      className="p-1 rounded border border-zinc-800 bg-zinc-950 text-indigo-300 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT PLOT CANVAS & ANALYSIS REPORT (8 COLS) */}
          <div className="lg:col-span-8 p-4 flex flex-col space-y-3 overflow-y-auto custom-scrollbar">
            
            {/* Error Banner */}
            {analysisError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{analysisError}</span>
              </div>
            )}

            {/* Plot Canvas Header Bar & Size Fixer Controls */}
            <div className="flex items-center justify-between p-2.5 px-3.5 rounded-xl border border-zinc-800 bg-zinc-900/80 text-xs font-semibold shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-zinc-200 font-mono text-[11px] uppercase tracking-wider">
                  Plot Viewport: <span className="text-cyan-400 font-bold">{plotMode.replace("_", " ")}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleForceResize}
                  disabled={isAutoResizing}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/35 text-indigo-300 font-bold text-[11px] flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                  title="All-in-One Size Fixer: Auto-fit plot dimensions and recalibrate margins"
                >
                  <RefreshCw className={`w-3 h-3 text-indigo-400 ${isAutoResizing ? "animate-spin" : ""}`} />
                  <span>{isAutoResizing ? "Calibrating..." : "Auto-Fit Viewport"}</span>
                </button>

                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className={`px-2.5 py-1 rounded-lg border font-bold text-[11px] flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs ${
                    isFullScreen
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30"
                      : "bg-cyan-500/15 border-cyan-500/35 text-cyan-300 hover:bg-cyan-500/25"
                  }`}
                  title={isFullScreen ? "Exit Fullscreen to Normal Screen" : "Expand to Fullscreen"}
                >
                  {isFullScreen ? (
                    <>
                      <Minimize2 className="w-3 h-3 text-amber-300" />
                      <span>Exit Fullscreen</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3 h-3 text-cyan-300" />
                      <span>Expand Screen</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Plotly Canvas Container with Callback Ref */}
            <div className={`relative w-full rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-inner flex flex-col transition-all duration-300 ${
              isFullScreen ? "h-[calc(100vh-290px)] min-h-[500px]" : "h-[500px] min-h-[440px]"
            }`}>
              <div
                ref={containerRefCallback}
                className="w-full h-full"
              />
            </div>

            {/* Action Export Toolbar */}
            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/80 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Export Output:</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleExportImage("png")}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <span>PNG</span>
                </button>

                <button
                  onClick={() => handleExportImage("svg")}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <span>SVG</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>

                <button
                  onClick={handleExportJSON}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>JSON Report</span>
                </button>
              </div>
            </div>

            {/* Analytical Summary Card */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-200 space-y-3">
              <div className="flex items-center justify-between border-b pb-2 border-zinc-800/80">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  Calculus & Analytical Summary
                </h3>
                {analysisResults.latexFormula && (
                  <span className="text-[11px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    LaTeX: {analysisResults.latexFormula}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                
                {/* Derivative */}
                {analysisResults.derivativeAtX0 !== null && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-0.5">
                    <p className="text-[10px] font-bold text-amber-400 uppercase">Derivative f'({evalX0})</p>
                    <p className="text-sm font-mono font-bold text-amber-200">
                      {analysisResults.derivativeAtX0.toFixed(4)}
                    </p>
                    <p className="text-[10px] text-zinc-400">{analysisResults.tangentLineExpr}</p>
                  </div>
                )}

                {/* Definite Integral */}
                {analysisResults.integralVal !== null && (
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 space-y-0.5">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase">Integral ∫ [{integralA}, {integralB}]</p>
                    <p className="text-sm font-mono font-bold text-indigo-200">
                      {analysisResults.integralVal.toFixed(4)}
                    </p>
                    <p className="text-[10px] text-zinc-400">Trapezoidal Area</p>
                  </div>
                )}

                {/* Statistical Mean */}
                {analysisResults.meanVal !== null && (
                  <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 space-y-0.5">
                    <p className="text-[10px] font-bold text-cyan-400 uppercase">Mean (μ) & StdDev (σ)</p>
                    <p className="text-xs font-mono font-bold text-cyan-200">
                      μ = {analysisResults.meanVal.toFixed(2)} | σ = {analysisResults.stdDevVal?.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      Min: {analysisResults.minVal?.toFixed(2)} | Max: {analysisResults.maxVal?.toFixed(2)}
                    </p>
                  </div>
                )}

                {/* Critical Extrema Points */}
                {Array.isArray(analysisResults?.criticalPoints) && analysisResults.criticalPoints.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-pink-500/10 border border-pink-500/20 space-y-0.5 col-span-1 sm:col-span-2 md:col-span-3">
                    <p className="text-[10px] font-bold text-pink-400 uppercase">Local Extrema Points:</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {analysisResults.criticalPoints.map((cp, cIdx) => (
                        <span key={cIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                          {cp.type.toUpperCase()}: ({cp.x}, {cp.y})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Zero Roots */}
                {Array.isArray(analysisResults?.roots) && analysisResults.roots.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-0.5 col-span-1 sm:col-span-2 md:col-span-3">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase">Zero Roots f(x) = 0:</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {analysisResults.roots.map((r, rIdx) => (
                        <span key={rIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          x = {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
