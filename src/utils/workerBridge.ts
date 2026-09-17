import * as Comlink from "comlink";

export interface MathComputationWorker {
  computeDerivativeAt(expression: string, xVal: number): number;
  computeTrapezoidalIntegral(expression: string, a: number, b: number, steps: number): number;
}

export function createComlinkWorker<T>(workerScriptUrl: string): Comlink.Remote<T> {
  const worker = new Worker(workerScriptUrl, { type: "module" });
  return Comlink.wrap<T>(worker);
}
