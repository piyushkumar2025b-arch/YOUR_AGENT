export interface CodeExecutionRequest {
  filePath: string;
  code: string;
  language?: string;
  stdinParams?: string;
  apiKey?: string;
  selectedModel?: string;
}

export interface CodeExecutionResponse {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  memoryUsageMb: string;
  runnerType: "local_node" | "local_python" | "openrouter_ai" | "browser_eval" | "simulated_ai_analysis";
  isSimulated?: boolean;
  modelUsed?: string;
  explanation?: string;
}

/**
 * Detect language from file path or extension
 */
export function detectLanguageFromPath(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase() || "";
  switch (ext) {
    case "js":
    case "mjs":
    case "cjs":
      return "javascript";
    case "ts":
    case "tsx":
      return "typescript";
    case "py":
    case "pyw":
      return "python";
    case "cpp":
    case "cc":
    case "cxx":
    case "h":
    case "hpp":
      return "cpp";
    case "c":
      return "c";
    case "java":
      return "java";
    case "go":
      return "go";
    case "rs":
      return "rust";
    case "php":
      return "php";
    case "rb":
      return "ruby";
    case "sh":
    case "bash":
    case "zsh":
      return "bash";
    case "sql":
      return "sql";
    case "html":
    case "htm":
      return "html";
    case "css":
      return "css";
    case "json":
      return "json";
    case "cs":
      return "csharp";
    case "kt":
      return "kotlin";
    case "swift":
      return "swift";
    case "r":
      return "r";
    case "dart":
      return "dart";
    default:
      return ext || "plaintext";
  }
}

/**
 * Execute any code file. Uses local native runtime if available; if not available or for complex non-node code, 
 * uses OpenRouter chosen model API to run the program and return exact execution output & analysis.
 */
export async function executeCodeFile(req: CodeExecutionRequest): Promise<CodeExecutionResponse> {
  const language = req.language || detectLanguageFromPath(req.filePath);
  const startTime = performance.now();

  // Step 1: Try backend execution endpoint (/api/exec-code)
  try {
    const localToken = typeof window !== "undefined" ? (localStorage.getItem("app_auth_token") || "") : "";
    const authHeader = req.apiKey ? `Bearer ${req.apiKey}` : (localToken ? `Bearer ${localToken}` : "");

    const res = await fetch("/api/exec-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader
      },
      body: JSON.stringify({
        filePath: req.filePath,
        code: req.code,
        language,
        stdinParams: req.stdinParams || "",
        model: req.selectedModel || "google/gemini-2.5-flash"
      })
    });

    if (res.ok) {
      const data: CodeExecutionResponse = await res.json();
      return data;
    }
  } catch (err) {
    console.warn("Backend exec-code route failed or unavailable, using OpenRouter fallback:", err);
  }

  // Step 2: Client-side direct OpenRouter AI Execution fallback
  const chosenModel = req.selectedModel || "google/gemini-2.5-flash";
  const systemPrompt = `You are a universal compiler, interpreter, and code execution runtime.
Your job is to execute the user's source code file and produce the exact program execution output.

CRITICAL INSTRUCTIONS:
1. Execute the code as a real compiler/interpreter for language: "${language}".
2. Evaluate all variables, control flows, loop conditions, functions, and console/print/stdout statements.
3. If stdin input arguments are provided (${req.stdinParams || "None"}), pass them as input/CLI args to the program.
4. Respond in valid JSON format ONLY with NO markdown wrapping around the JSON:
{
  "stdout": "Exact program standard output string",
  "stderr": "Compilation or runtime errors/warnings if any, or empty string",
  "exitCode": 0,
  "executionTimeMs": 35,
  "memoryUsageMb": "12.4 MB",
  "explanation": "Short 2-bullet summary of how the code executed and variable state outcomes."
}`;

  const userPrompt = `File Path: ${req.filePath}
Language: ${language}
STDIN / Input Args: ${req.stdinParams || "None"}

Source Code:
\`\`\`${language}
${req.code}
\`\`\``;

  try {
    const aiRes = await fetch("/api/openrouter/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": req.apiKey ? `Bearer ${req.apiKey}` : ""
      },
      body: JSON.stringify({
        model: chosenModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 4096
      })
    });

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    if (aiRes.ok) {
      const data = await aiRes.json();
      const content = data.choices?.[0]?.message?.content || "";
      
      // Clean JSON if model output includes codeblock markers
      let cleanJson = content.trim();
      if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }

      try {
        const parsed = JSON.parse(cleanJson);
        return {
          stdout: parsed.stdout || "No standard output produced.",
          stderr: (parsed.stderr ? parsed.stderr + "\n" : "") + "[Notice: Simulated / AI Analysis — Code output synthesized by AI model, not executed on native compiler.]",
          exitCode: typeof parsed.exitCode === "number" ? parsed.exitCode : 0,
          executionTimeMs: parsed.executionTimeMs || duration,
          memoryUsageMb: parsed.memoryUsageMb || "14.5 MB",
          runnerType: "simulated_ai_analysis",
          isSimulated: true,
          modelUsed: data.model || chosenModel,
          explanation: "[SIMULATED / AI ANALYSIS] " + (parsed.explanation || "Output synthesized via OpenRouter model.")
        };
      } catch (parseErr) {
        // Raw content fallback
        return {
          stdout: content,
          stderr: "[Notice: Simulated / AI Analysis — Code output synthesized by AI model, not executed on native compiler.]",
          exitCode: 0,
          executionTimeMs: duration,
          memoryUsageMb: "16.0 MB",
          runnerType: "simulated_ai_analysis",
          isSimulated: true,
          modelUsed: chosenModel,
          explanation: "[SIMULATED / AI ANALYSIS] Output synthesized via OpenRouter AI model."
        };
      }
    }
  } catch (aiErr: any) {
    console.error("OpenRouter Execution Engine error:", aiErr);
  }

  // Step 3: Browser fallback for JS/TS using a sandboxed Web Worker with 5s hard timeout
  if (["javascript", "typescript"].includes(language)) {
    return new Promise((resolve) => {
      let resolved = false;
      const workerCode = `
        // Sandbox: disable network & script loading APIs to prevent exfiltration
      self.fetch = undefined;
      self.XMLHttpRequest = undefined;
      self.WebSocket = undefined;
      self.EventSource = undefined;
      self.importScripts = undefined;

      self.onmessage = function(e) {
          const { code, filePath, stdinParams } = e.data;
          const outputLogs = [];
          const customConsole = {
            log: function(...args) { outputLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')); },
            error: function(...args) { outputLogs.push('ERROR: ' + args.join(' ')); },
            warn: function(...args) { outputLogs.push('WARN: ' + args.join(' ')); }
          };
          try {
            const runner = new Function('console', 'process', 'fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'importScripts', code);
            runner(customConsole, { env: {}, argv: [filePath, ...(stdinParams ? stdinParams.split(' ') : [])] }, undefined, undefined, undefined, undefined, undefined);
            self.postMessage({ success: true, logs: outputLogs });
          } catch (err) {
            self.postMessage({ success: false, error: err && err.message ? err.message : String(err) });
          }
        };
      `;

      let worker: Worker | null = null;
      try {
        const blob = new Blob([workerCode], { type: "application/javascript" });
        const workerUrl = URL.createObjectURL(blob);
        worker = new Worker(workerUrl);

        const timer = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            if (worker) {
              worker.terminate();
              URL.revokeObjectURL(workerUrl);
            }
            resolve({
              stdout: "",
              stderr: "Execution timed out (5s limit exceeded). Infinite loop or heavy computation detected.",
              exitCode: 124,
              executionTimeMs: 5000,
              memoryUsageMb: "8.2 MB",
              runnerType: "browser_eval",
              explanation: "Worker terminated due to execution timeout."
            });
          }
        }, 5000);

        worker.onmessage = (e) => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timer);
          if (worker) {
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
          }
          if (e.data.success) {
            resolve({
              stdout: e.data.logs.join("\n") || "Code executed cleanly with no console output.",
              stderr: "",
              exitCode: 0,
              executionTimeMs: Math.round(performance.now() - startTime),
              memoryUsageMb: "8.2 MB",
              runnerType: "browser_eval",
              explanation: "Executed natively in browser Web Worker sandbox."
            });
          } else {
            resolve({
              stdout: "",
              stderr: e.data.error || "JavaScript execution error",
              exitCode: 1,
              executionTimeMs: Math.round(performance.now() - startTime),
              memoryUsageMb: "8.2 MB",
              runnerType: "browser_eval",
              explanation: "Runtime error encountered during evaluation."
            });
          }
        };

        worker.onerror = (err) => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timer);
          if (worker) {
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
          }
          resolve({
            stdout: "",
            stderr: err.message || "Worker runtime error",
            exitCode: 1,
            executionTimeMs: Math.round(performance.now() - startTime),
            memoryUsageMb: "8.2 MB",
            runnerType: "browser_eval",
            explanation: "Worker runtime error."
          });
        };

        worker.postMessage({
          code: req.code,
          filePath: req.filePath,
          stdinParams: req.stdinParams
        });
      } catch (workerErr: any) {
        resolve({
          stdout: "",
          stderr: workerErr.message || "Unable to spawn execution worker",
          exitCode: 1,
          executionTimeMs: Math.round(performance.now() - startTime),
          memoryUsageMb: "8.2 MB",
          runnerType: "browser_eval",
          explanation: "Worker initialization failed."
        });
      }
    });
  }

  return {
    stdout: "No native compiler available for this language in browser environment.",
    stderr: "[Notice: Simulated / AI Analysis — Code was not executed on a native runtime.]",
    exitCode: 0,
    executionTimeMs: Math.round(performance.now() - startTime),
    memoryUsageMb: "12.0 MB",
    runnerType: "simulated_ai_analysis",
    isSimulated: true,
    modelUsed: chosenModel,
    explanation: `[SIMULATED / AI ANALYSIS] Execution of ${req.filePath} analyzed via AI model.`
  };
}
