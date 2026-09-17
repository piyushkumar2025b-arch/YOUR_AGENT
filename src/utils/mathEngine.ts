import * as math from "mathjs";

export interface EvaluationResult {
  xVals: number[];
  yVals: (number | null)[];
  isValid: boolean;
  error?: string;
  latex?: string;
}

export interface CalculusAnalysis {
  derivativeAtX0: number | null;
  tangentLineExpr: string | null;
  integralVal: number | null;
  roots: number[];
  criticalPoints: { x: number; y: number; type: "min" | "max" }[];
  mean: number | null;
  stdDev: number | null;
  min: number | null;
  max: number | null;
}

/**
 * Safely compiles and evaluates a 2D math expression f(x) over a domain [xMin, xMax].
 */
export function safeEvaluate2DFunction(
  exprStr: string,
  xMin: number,
  xMax: number,
  resolution: number = 150
): EvaluationResult {
  try {
    const trimmed = exprStr.trim();
    if (!trimmed) {
      return { xVals: [], yVals: [], isValid: false, error: "Empty expression" };
    }

    const node = math.parse(trimmed);
    const compiled = node.compile();
    let latex = "";
    try {
      latex = node.toTex();
    } catch {
      latex = trimmed;
    }

    const step = (xMax - xMin) / resolution;
    const xVals: number[] = [];
    const yVals: (number | null)[] = [];

    for (let i = 0; i <= resolution; i++) {
      const x = xMin + i * step;
      xVals.push(Number(x.toFixed(4)));
      try {
        const val = compiled.evaluate({ x, e: Math.E, pi: Math.PI });
        if (typeof val === "number" && !isNaN(val) && isFinite(val) && Math.abs(val) < 1e6) {
          yVals.push(val);
        } else if (typeof val === "object" && val && "re" in val) {
          // Complex number fallback: take real part
          yVals.push(val.re);
        } else {
          yVals.push(null);
        }
      } catch {
        yVals.push(null);
      }
    }

    return { xVals, yVals, isValid: true, latex };
  } catch (err: any) {
    return {
      xVals: [],
      yVals: [],
      isValid: false,
      error: err?.message || "Invalid expression format",
    };
  }
}

/**
 * Computes calculus analysis: derivative, tangent, definite integral, roots, and extrema.
 */
export function analyzeFunction(
  exprStr: string,
  xVals: number[],
  yVals: (number | null)[],
  evalX0: number,
  integralA: number,
  integralB: number
): CalculusAnalysis {
  let derivativeAtX0: number | null = null;
  let tangentLineExpr: string | null = null;
  let integralVal: number | null = null;
  const roots: number[] = [];
  const criticalPoints: { x: number; y: number; type: "min" | "max" }[] = [];

  try {
    const trimmed = exprStr.trim();
    if (!trimmed) throw new Error("Empty expression");

    const compiled = math.parse(trimmed).compile();

    // 1. Derivative at evalX0
    try {
      const h = 0.0001;
      const yPlus = compiled.evaluate({ x: evalX0 + h, e: Math.E, pi: Math.PI });
      const yMinus = compiled.evaluate({ x: evalX0 - h, e: Math.E, pi: Math.PI });
      const deriv = (yPlus - yMinus) / (2 * h);
      const y0 = compiled.evaluate({ x: evalX0, e: Math.E, pi: Math.PI });

      if (typeof deriv === "number" && !isNaN(deriv) && isFinite(deriv)) {
        derivativeAtX0 = deriv;
        tangentLineExpr = `y = ${deriv.toFixed(3)}(x - ${evalX0.toFixed(2)}) + ${y0.toFixed(3)}`;
      }
    } catch {}

    // 2. Definite Integral [integralA, integralB]
    try {
      const step = 0.005;
      const startX = Math.min(integralA, integralB);
      const endX = Math.max(integralA, integralB);
      let area = 0;
      let prevVal: number | null = null;

      for (let x = startX; x <= endX; x += step) {
        try {
          const val = compiled.evaluate({ x, e: Math.E, pi: Math.PI });
          if (typeof val === "number" && !isNaN(val) && isFinite(val)) {
            if (prevVal !== null) {
              area += 0.5 * (val + prevVal) * step;
            }
            prevVal = val;
          } else {
            prevVal = null;
          }
        } catch {
          prevVal = null;
        }
      }
      integralVal = area;
    } catch {}

    // 3. Root and Extrema Detection
    for (let i = 1; i < xVals.length - 1; i++) {
      const yPrev = yVals[i - 1];
      const yCurr = yVals[i];
      const yNext = yVals[i + 1];

      if (typeof yCurr === "number" && !isNaN(yCurr)) {
        // Zero root crossing
        if (typeof yPrev === "number" && yPrev * yCurr <= 0 && Math.abs(yCurr) < 5) {
          if (roots.length < 6) {
            roots.push(Number(xVals[i].toFixed(3)));
          }
        }

        // Extrema
        if (typeof yPrev === "number" && typeof yNext === "number") {
          if (yCurr > yPrev && yCurr > yNext) {
            criticalPoints.push({
              x: Number(xVals[i].toFixed(2)),
              y: Number(yCurr.toFixed(2)),
              type: "max",
            });
          } else if (yCurr < yPrev && yCurr < yNext) {
            criticalPoints.push({
              x: Number(xVals[i].toFixed(2)),
              y: Number(yCurr.toFixed(2)),
              type: "min",
            });
          }
        }
      }
    }
  } catch {}

  // Statistical summary on valid y values
  const validY = yVals.filter((v): v is number => typeof v === "number" && !isNaN(v));
  let mean: number | null = null;
  let stdDev: number | null = null;
  let min: number | null = null;
  let max: number | null = null;

  if (validY.length > 0) {
    min = Math.min(...validY);
    max = Math.max(...validY);
    mean = validY.reduce((a, b) => a + b, 0) / validY.length;
    const variance = validY.reduce((a, b) => a + Math.pow(b - mean!, 2), 0) / validY.length;
    stdDev = Math.sqrt(variance);
  }

  return {
    derivativeAtX0,
    tangentLineExpr,
    integralVal,
    roots,
    criticalPoints,
    mean,
    stdDev,
    min,
    max,
  };
}
