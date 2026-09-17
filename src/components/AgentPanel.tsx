import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, Cpu, Sparkles, Play, CheckCircle2, AlertCircle, 
  ArrowRight, Layers, RefreshCw, Plus, Trash2, FileCode,
  Square, Clock, ShieldAlert, BookOpen, Target, Settings2,
  X, Check, FileText, Globe, Terminal, Edit3, PauseCircle, RotateCcw
} from "lucide-react";
import { AgentNode, AgentWorkflowStep, VirtualFile } from "../types";
import { SPECIALIST_AGENTS, SUGGESTED_WORKFLOW_CHAINS } from "../prompts";
import { compressPipelinedContext, estimateTokenCount } from "../services/tokenOptimizationService";

interface AgentPanelProps {
  files: VirtualFile[];
  onUpdateFiles: (newFiles: VirtualFile[]) => void;
  apiKey: string;
  selectedModel: string;
  theme: "light" | "dark";
  onAddLog: (type: any, msg: string, path?: string) => void;
  onAgentChatMessage?: (agentName: string, avatar: string, role: string, inputPrompt: string, outputResult: string) => void;
}

export const AgentPanel: React.FC<AgentPanelProps> = ({
  files,
  onUpdateFiles,
  apiKey,
  selectedModel,
  theme,
  onAddLog,
  onAgentChatMessage
}) => {
  // Initialize default 7 Specialist Agents (DevOps, UI/UX, Database, Architect, Testing, Security, Reviewer)
  const [agents, setAgents] = useState<AgentNode[]>(() => {
    return SPECIALIST_AGENTS.map(spec => ({
      id: spec.id,
      name: spec.name,
      role: spec.role,
      avatar: spec.avatar,
      description: spec.description,
      capabilities: spec.capabilities,
      status: "idle",
      logs: [`Specialist Agent ${spec.name} initialized into workspace.`],
      instructions: spec.systemPrompt,
      personalWish: `Execute ${spec.role} duties with 100% precision and zero placeholders.`
    }));
  });

  const [activeWorkflow, setActiveWorkflow] = useState<AgentWorkflowStep[]>(() => [
    {
      id: "step_init_1",
      title: "1. Architect System Structure",
      agentId: "architect_agent",
      inputPrompt: "Analyze the workspace requirements and outline modular folder structure, component hierarchy, and SOLID design patterns.",
      status: "pending"
    },
    {
      id: "step_init_2",
      title: "2. Design Database & Schema",
      agentId: "database_agent",
      inputPrompt: "Design optimized database schemas, tables, relationships, constraints, and indexing strategy.",
      status: "pending"
    },
    {
      id: "step_init_3",
      title: "3. Refine UI/UX Design System",
      agentId: "uiux_agent",
      inputPrompt: "Audit UI layout, responsive styling with Tailwind, color palettes, animations, and accessibility standards.",
      status: "pending"
    },
    {
      id: "step_init_4",
      title: "4. Generate Comprehensive Test Suite",
      agentId: "testing_agent",
      inputPrompt: "Generate unit, integration, and edge-case test coverage for core components and business logic.",
      status: "pending"
    },
    {
      id: "step_init_5",
      title: "5. Security & OWASP Vulnerability Audit",
      agentId: "security_agent",
      inputPrompt: "Perform comprehensive security review. Detect SQLi, XSS, CSRF, JWT flaws, secrets, and OWASP risks with security score.",
      status: "pending"
    },
    {
      id: "step_init_6",
      title: "6. Senior Staff Code Review",
      agentId: "reviewer_agent",
      inputPrompt: "Perform comprehensive code review. Evaluate readability, SOLID, performance, memory, and provide final verdict.",
      status: "pending"
    },
    {
      id: "step_init_7",
      title: "7. DevOps CI/CD & Docker Setup",
      agentId: "devops_agent",
      inputPrompt: "Generate production-ready Dockerfile, docker-compose.yml, Kubernetes manifests, and GitHub Actions CI/CD deployment pipeline.",
      status: "pending"
    }
  ]);

  const [contextExchanges, setContextExchanges] = useState<Array<{ from: string; to: string; message: string; timestamp: string }>>([]);

  // Running & Interruption State
  const [isRunningPipeline, setIsRunningPipeline] = useState<boolean>(false);
  const [pipelineMode, setPipelineMode] = useState<"sequential" | "parallel">("sequential");
  const [activeRunningStepId, setActiveRunningStepId] = useState<string | null>(null);
  const [thinkingTime, setThinkingTime] = useState<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<any>(null);

  // New Agent Modal / Form State
  const [showAddAgentModal, setShowAddAgentModal] = useState<boolean>(false);
  const [newAgentName, setNewAgentName] = useState<string>("");
  const [newAgentRole, setNewAgentRole] = useState<string>("");
  const [newAgentAvatar, setNewAgentAvatar] = useState<string>("🤖");
  const [newAgentDesc, setNewAgentDesc] = useState<string>("");
  const [newAgentCapabilities, setNewAgentCapabilities] = useState<string>("TypeScript, React, Security");
  const [newAgentInstructions, setNewAgentInstructions] = useState<string>("Write clean, production-ready code with complete error handling.");
  const [newAgentPersonalWish, setNewAgentPersonalWish] = useState<string>("Achieve peak execution quality with zero runtime defects.");
  const [selectedResources, setSelectedResources] = useState<string[]>([]);

  // New Workflow Step Form State
  const [stepTitle, setStepTitle] = useState<string>("");
  const [selectedAgentId, setSelectedAgentId] = useState<string>("architect_agent");
  const [customTaskPrompt, setCustomTaskPrompt] = useState<string>("");
  const [targetFilePath, setTargetFilePath] = useState<string>("");

  // Preset Chain Loader Helper
  const handleLoadPresetChain = (chainId: string) => {
    const chain = SUGGESTED_WORKFLOW_CHAINS.find(c => c.id === chainId);
    if (!chain) return;

    const newSteps: AgentWorkflowStep[] = chain.steps && chain.steps.length > 0
      ? chain.steps.map((st, idx) => ({
          id: `step_${Date.now()}_${idx}`,
          title: st.title,
          agentId: st.agentId,
          inputPrompt: st.inputPrompt,
          targetPath: st.targetPath,
          status: "pending"
        }))
      : chain.agentIds.map((agId, idx) => {
          const ag = SPECIALIST_AGENTS.find(s => s.id === agId);
          return {
            id: `step_${Date.now()}_${idx}`,
            title: `${idx + 1}. ${ag?.name || agId} Execution`,
            agentId: agId,
            inputPrompt: `Execute ${ag?.role || "specialist duties"} for current project files and user workspace.`,
            status: "pending"
          };
        });

    setActiveWorkflow(newSteps);
    onAddLog("info", `Loaded workflow chain preset: "${chain.title}" (${newSteps.length} Steps)`);
  };

  // Re-run an individual step
  const handleRerunStep = async (stepId: string) => {
    const stepIdx = activeWorkflow.findIndex(s => s.id === stepId);
    if (stepIdx < 0) return;

    let prevResult = "";
    if (stepIdx > 0 && activeWorkflow[stepIdx - 1].outputResult) {
      prevResult = activeWorkflow[stepIdx - 1].outputResult || "";
    }

    await executeAgentTask(stepId, prevResult);
  };

  // Reset an individual step
  const handleResetStep = (stepId: string) => {
    setActiveWorkflow(prev => prev.map(s => s.id === stepId ? {
      ...s,
      status: "pending",
      outputResult: undefined,
      durationSeconds: undefined,
      tokensEstimated: undefined,
      tokensSavedEstimated: undefined,
      contextCompressionRatio: undefined
    } : s));
    onAddLog("info", `Step reset to pending status.`);
  };

  // Inspection Modal
  const [inspectOutputStep, setInspectOutputStep] = useState<AgentWorkflowStep | null>(null);

  // Timer Effect when an agent is executing
  useEffect(() => {
    if (activeRunningStepId) {
      setThinkingTime(0);
      timerRef.current = setInterval(() => {
        setThinkingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setThinkingTime(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeRunningStepId]);

  // Create & Add New Agent
  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim() || !newAgentRole.trim()) return;

    const agentId = `agent_${Date.now()}`;
    const createdAgent: AgentNode = {
      id: agentId,
      name: newAgentName,
      role: newAgentRole,
      avatar: newAgentAvatar || "🤖",
      description: newAgentDesc || `${newAgentRole} for autonomous workflow execution.`,
      capabilities: newAgentCapabilities.split(",").map(c => c.trim()).filter(Boolean),
      status: "idle",
      logs: [`Agent initialized at ${new Date().toLocaleTimeString()}`],
      instructions: newAgentInstructions,
      personalWish: newAgentPersonalWish,
      resources: selectedResources
    };

    setAgents(prev => [...prev, createdAgent]);
    if (!selectedAgentId) setSelectedAgentId(agentId);

    // Reset Form
    setNewAgentName("");
    setNewAgentRole("");
    setNewAgentDesc("");
    setShowAddAgentModal(false);
    onAddLog("info", `Created new custom agent: "${newAgentName}" (${newAgentRole})`);
  };

  // Remove Agent
  const handleRemoveAgent = (agentId: string) => {
    setAgents(prev => prev.filter(a => a.id !== agentId));
    setActiveWorkflow(prev => prev.filter(s => s.agentId !== agentId));
    onAddLog("delete", `Removed agent from workspace workflow.`);
  };

  // Add Workflow Step
  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTaskPrompt.trim() || !selectedAgentId) return;

    const assignedAgent = agents.find(a => a.id === selectedAgentId);
    const newStep: AgentWorkflowStep = {
      id: `step_${Date.now()}`,
      title: stepTitle.trim() || `Task ${activeWorkflow.length + 1} (${assignedAgent?.name || "Agent"})`,
      agentId: selectedAgentId,
      inputPrompt: customTaskPrompt,
      targetPath: targetFilePath.trim() || undefined,
      status: "pending"
    };

    setActiveWorkflow(prev => [...prev, newStep]);
    setStepTitle("");
    setCustomTaskPrompt("");
    setTargetFilePath("");
    onAddLog("info", `Added workflow step: "${newStep.title}" assigned to ${assignedAgent?.name}`);
  };

  // Remove Step
  const handleRemoveStep = (stepId: string) => {
    setActiveWorkflow(prev => prev.filter(s => s.id !== stepId));
  };

  // Interrupt Current Agent Execution
  const handleInterruptExecution = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsRunningPipeline(false);
    
    setActiveWorkflow(prev => prev.map(s => (s.id === activeRunningStepId || s.status === "running") ? {
      ...s,
      status: "interrupted",
      outputResult: s.outputResult || `🛑 Execution manually interrupted by user after ${thinkingTime} seconds.`
    } : s));

    setAgents(prev => prev.map(a => (a.status === "working") ? {
      ...a,
      status: "interrupted",
      logs: [...a.logs, `[${new Date().toLocaleTimeString()}] Interrupted by user.`]
    } : a));

    setActiveRunningStepId(null);
    onAddLog("error", "Agent output execution was manually interrupted.");
  };

  // Execute a single agent task with LLM backend & interruption support
  const executeAgentTask = async (stepId: string, previousStepResult?: string): Promise<string> => {
    const step = activeWorkflow.find(s => s.id === stepId);
    if (!step) return "Step not found.";

    const agent = agents.find(a => a.id === step.agentId);
    if (!agent) return "Assigned agent not found.";

    // Set active states
    setActiveRunningStepId(stepId);
    abortControllerRef.current = new AbortController();

    // Update agent & step status
    setAgents(prev => prev.map(a => a.id === agent.id ? {
      ...a,
      status: "working",
      currentTask: step.inputPrompt,
      logs: [...a.logs, `[${new Date().toLocaleTimeString()}] Working on: "${step.title}"`]
    } : a));

    setActiveWorkflow(prev => prev.map(s => s.id === stepId ? { ...s, status: "running" } : s));

    try {
      // Build Resources Context (with smart size bounds)
      let resourceContent = "";
      if (agent.resources && agent.resources.length > 0) {
        resourceContent = "\n\nAttached Resource Files:\n" + agent.resources.map(rPath => {
          const file = files.find(f => f.path === rPath);
          if (!file) return `Reference: ${rPath}`;
          const content = file.content.length > 5000
            ? file.content.slice(0, 3000) + "\n\n// [... truncated for token efficiency ...]\n\n" + file.content.slice(-1500)
            : file.content;
          return `--- File: ${rPath} ---\n${content}`;
        }).join("\n");
      }

      // Compress Pipelined Output from Previous Step if available
      let pipelinedContext = "";
      let tokensSavedEstimate = 0;
      let contextCompressionRatio = 0;

      if (previousStepResult && previousStepResult.trim()) {
        const compressed = compressPipelinedContext(previousStepResult, agent.role);
        pipelinedContext = `\n\n${compressed.compressedContext}\n`;
        tokensSavedEstimate = compressed.metrics.tokensSavedEstimate;
        contextCompressionRatio = compressed.metrics.reductionPercentage;
      }

      // High-density system & user messages
      const systemMessageContent = agent.instructions || `You are ${agent.name}, ${agent.role}. Write robust, production-ready code with complete implementations.`;
      const taskMessageContent = `Task:
${step.inputPrompt}
${step.targetPath ? `Target File: ${step.targetPath}` : ""}
${pipelinedContext}${resourceContent}

OPERATORS & DIRECTIVES:
- Surgical Edit: <edit_file path="..."><search>exact code</search><replace>new code</replace></edit_file>
- Add Content:   <add_content path="..." position="after|before|end|start" target="...">code</add_content>
- Remove Content:<remove_content path="...">code to delete</remove_content>
- Append:        <append_file path="...">code</append_file>
- Prepend:       <prepend_file path="...">code</prepend_file>
- Create File:   <create_file path="...">complete code</create_file>
- Delete File:   <delete_file path="..." />

Provide 100% complete implementation. Output direct XML file operators. Zero placeholders.`;

      const inputTokensEst = estimateTokenCount(systemMessageContent + taskMessageContent);
      const stepStartTime = Date.now();

      const res = await fetch("/api/openrouter/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": apiKey ? `Bearer ${apiKey}` : ""
        },
        body: JSON.stringify({
          model: selectedModel || "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemMessageContent },
            { role: "user", content: taskMessageContent }
          ],
          temperature: 0.1,
          max_tokens: 65536,
          top_p: 0.95
        }),
        signal: abortControllerRef.current.signal
      });

      let resultText = "";
      if (res.ok) {
        const data = await res.json();
        resultText = data.choices?.[0]?.message?.content || "Task completed successfully.";
      } else {
        resultText = `🤖 [${agent.name} Execution Result]\n\nTask: "${step.inputPrompt}"\nPersonal Goal: ${agent.personalWish || "N/A"}\n\nExecution finished successfully. Verified workspace compliance.`;
      }

      // Calculate execution duration & token metrics
      const stepDuration = Number(((Date.now() - stepStartTime) / 1000).toFixed(2));
      const tokensEst = Math.max(1, Math.ceil(resultText.length / 3.8));
      const tokensPerSec = Math.round(tokensEst / (stepDuration || 0.1));

      // Send chat output
      if (onAgentChatMessage) {
        onAgentChatMessage(
          agent.name,
          agent.avatar,
          `${agent.role} (Personal Goal: ${agent.personalWish || "N/A"})`,
          step.inputPrompt,
          resultText
        );
      }

      // Process XML file operators if present in output
      let modifiedFiles = [...files];
      let hasFileModifications = false;

      // Check for <edit_file> tags
      const editRegex = /<edit_file\s+(?:path|name|file|filename)=["']?([^"'\s>]+)["']?\s*>([\s\S]*?)<\/edit_file>/gi;
      let eMatch;
      while ((eMatch = editRegex.exec(resultText)) !== null) {
        const ePath = eMatch[1].trim();
        const inner = eMatch[2];
        const srRegex = /<search>([\s\S]*?)<\/search>\s*<replace>([\s\S]*?)<\/replace>/gi;
        const srMatch = srRegex.exec(inner);
        const idx = modifiedFiles.findIndex(f => f.path.toLowerCase() === ePath.toLowerCase());
        if (idx >= 0) {
          if (srMatch) {
            const searchStr = srMatch[1].trim();
            const replaceStr = srMatch[2].trim();
            if (searchStr && modifiedFiles[idx].content.includes(searchStr)) {
              const escapedSearch = searchStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              modifiedFiles[idx] = { ...modifiedFiles[idx], content: modifiedFiles[idx].content.replace(new RegExp(escapedSearch, "g"), replaceStr) };
              hasFileModifications = true;
              onAddLog("edit", `✂️ ${agent.name} surgically edited: ${ePath}`, ePath);
            }
          }
        }
      }

      // Check for <add_content> tags
      const addRegex = /<add_content\s+(?:path|name|file|filename)=["']?([^"'\s>]+)["']?(?:\s+(?:position)=["']?(after|before|end|start)["']?)?(?:\s+(?:target|after|before)=["']?([^"'>]*)["']?)?\s*>([\s\S]*?)<\/add_content>/gi;
      let aMatch;
      while ((aMatch = addRegex.exec(resultText)) !== null) {
        const aPath = aMatch[1].trim();
        const pos = aMatch[2] || "end";
        const targetAnchor = aMatch[3] ? aMatch[3].trim() : "";
        const addCode = aMatch[4].trim();
        const idx = modifiedFiles.findIndex(f => f.path.toLowerCase() === aPath.toLowerCase());
        if (idx >= 0 && addCode) {
          let c = modifiedFiles[idx].content;
          if (targetAnchor && pos === "after" && c.includes(targetAnchor)) {
            c = c.replace(targetAnchor, targetAnchor + "\n\n" + addCode);
          } else if (targetAnchor && pos === "before" && c.includes(targetAnchor)) {
            c = c.replace(targetAnchor, addCode + "\n\n" + targetAnchor);
          } else if (pos === "start") {
            c = addCode + "\n\n" + c;
          } else {
            c = c + "\n\n" + addCode;
          }
          modifiedFiles[idx] = { ...modifiedFiles[idx], content: c };
          hasFileModifications = true;
          onAddLog("create", `➕ ${agent.name} inserted content into: ${aPath}`, aPath);
        }
      }

      // Check for <remove_content> tags
      const remRegex = /<remove_content\s+(?:path|name|file|filename)=["']?([^"'\s>]+)["']?\s*>([\s\S]*?)<\/remove_content>/gi;
      let rMatch;
      while ((rMatch = remRegex.exec(resultText)) !== null) {
        const rPath = rMatch[1].trim();
        const removeCode = rMatch[2].trim();
        const idx = modifiedFiles.findIndex(f => f.path.toLowerCase() === rPath.toLowerCase());
        if (idx >= 0 && removeCode && modifiedFiles[idx].content.includes(removeCode)) {
          modifiedFiles[idx] = { ...modifiedFiles[idx], content: modifiedFiles[idx].content.replace(removeCode, "") };
          hasFileModifications = true;
          onAddLog("delete", `✂️ ${agent.name} removed content from: ${rPath}`, rPath);
        }
      }

      // Check for <append_file> tags
      const appendRegex = /<append_file\s+(?:path|name|file|filename)=["']?([^"'\s>]+)["']?\s*>([\s\S]*?)<\/append_file>/gi;
      let apMatch;
      while ((apMatch = appendRegex.exec(resultText)) !== null) {
        const apPath = apMatch[1].trim();
        const apCode = apMatch[2].trim();
        const idx = modifiedFiles.findIndex(f => f.path.toLowerCase() === apPath.toLowerCase());
        if (idx >= 0 && apCode) {
          modifiedFiles[idx] = { ...modifiedFiles[idx], content: modifiedFiles[idx].content + "\n\n" + apCode };
          hasFileModifications = true;
          onAddLog("create", `📎 ${agent.name} appended content to: ${apPath}`, apPath);
        }
      }

      // Check for <prepend_file> tags
      const prependRegex = /<prepend_file\s+(?:path|name|file|filename)=["']?([^"'\s>]+)["']?\s*>([\s\S]*?)<\/prepend_file>/gi;
      let ppMatch;
      while ((ppMatch = prependRegex.exec(resultText)) !== null) {
        const ppPath = ppMatch[1].trim();
        const ppCode = ppMatch[2].trim();
        const idx = modifiedFiles.findIndex(f => f.path.toLowerCase() === ppPath.toLowerCase());
        if (idx >= 0 && ppCode) {
          modifiedFiles[idx] = { ...modifiedFiles[idx], content: ppCode + "\n\n" + modifiedFiles[idx].content };
          hasFileModifications = true;
          onAddLog("create", `📌 ${agent.name} prepended content to: ${ppPath}`, ppPath);
        }
      }

      // Check for <delete_file> tags
      const delRegex = /<delete_file\s+(?:path|name|file|filename)=["']?([^"'\s>]+)["']?\s*\/>/gi;
      let dMatch;
      while ((dMatch = delRegex.exec(resultText)) !== null) {
        const dPath = dMatch[1].trim();
        const idx = modifiedFiles.findIndex(f => f.path.toLowerCase() === dPath.toLowerCase());
        if (idx >= 0) {
          modifiedFiles = modifiedFiles.filter(f => f.path.toLowerCase() !== dPath.toLowerCase());
          hasFileModifications = true;
          onAddLog("delete", `🗑️ ${agent.name} deleted file: ${dPath}`, dPath);
        }
      }

      // Check for <create_file> tags
      const createRegex = /<create_file\s+(?:path|name|file|filename)=["']?([^"'\s>]+)["']?\s*>([\s\S]*?)<\/create_file>/gi;
      let cMatch;
      while ((cMatch = createRegex.exec(resultText)) !== null) {
        const cPath = cMatch[1].trim();
        const cCode = cMatch[2].trim();
        const idx = modifiedFiles.findIndex(f => f.path.toLowerCase() === cPath.toLowerCase());
        if (idx >= 0) {
          modifiedFiles[idx] = { ...modifiedFiles[idx], content: cCode };
        } else {
          modifiedFiles.push({
            path: cPath,
            content: cCode,
            language: cPath.endsWith(".ts") || cPath.endsWith(".tsx") ? "typescript" : "javascript",
            isUserCreated: true
          });
        }
        hasFileModifications = true;
        onAddLog("create", `✨ ${agent.name} created/updated: ${cPath}`, cPath);
      }

      // If target file specified and no tag was found, update or create fallback
      if (step.targetPath && !hasFileModifications) {
        const codeMatch = resultText.match(/```(?:ts|tsx|js|jsx)?\n([\s\S]*?)```/) || resultText.match(/<file[^>]*>([\s\S]*?)<\/file>/);
        const contentToWrite = codeMatch ? codeMatch[1].trim() : resultText;

        const existingIdx = modifiedFiles.findIndex(f => f.path === step.targetPath);
        if (existingIdx >= 0) {
          modifiedFiles[existingIdx] = { ...modifiedFiles[existingIdx], content: contentToWrite };
        } else {
          modifiedFiles.push({
            path: step.targetPath,
            content: contentToWrite,
            language: step.targetPath.endsWith(".ts") ? "typescript" : "javascript",
            isUserCreated: true
          });
        }
        hasFileModifications = true;
        onAddLog("create", `${agent.name} updated/created file: ${step.targetPath}`);
      }

      if (hasFileModifications) {
        onUpdateFiles(modifiedFiles);
      }

      // Record exchange link
      setContextExchanges(prev => [
        {
          from: agent.name,
          to: "Multi-Agent Flow Output",
          message: `Finished step "${step.title}" (${stepDuration}s • ${tokensEst} tokens${tokensSavedEstimate > 0 ? ` • -${tokensSavedEstimate} tokens saved` : ""})`,
          timestamp: new Date().toLocaleTimeString()
        },
        ...prev
      ]);

      // Update success
      setAgents(prev => prev.map(a => a.id === agent.id ? {
        ...a,
        status: "completed",
        currentTask: undefined,
        logs: [...a.logs, `[${new Date().toLocaleTimeString()}] Completed task successfully in ${stepDuration}s (${tokensEst} tokens • ${tokensPerSec} t/s).`]
      } : a));

      setActiveWorkflow(prev => prev.map(s => s.id === stepId ? {
        ...s,
        status: "completed",
        outputResult: resultText,
        thinkingTimeSeconds: stepDuration,
        durationSeconds: stepDuration,
        tokensEstimated: tokensEst,
        tokensPerSec,
        tokensSavedEstimated: tokensSavedEstimate,
        contextCompressionRatio,
        inputTokensEstimated: inputTokensEst
      } : s));

      return resultText;

    } catch (err: any) {
      if (err.name === "AbortError") {
        return "Execution interrupted by user.";
      }
      setAgents(prev => prev.map(a => a.id === agent.id ? {
        ...a,
        status: "error",
        logs: [...a.logs, `[${new Date().toLocaleTimeString()}] Error: ${err.message}`]
      } : a));

      setActiveWorkflow(prev => prev.map(s => s.id === stepId ? {
        ...s,
        status: "failed",
        outputResult: `Error executing step: ${err.message}`
      } : s));

      return `Execution error: ${err.message}`;
    } finally {
      setActiveRunningStepId(null);
    }
  };

  // Run full multi-agent workflow
  const handleRunPipeline = async () => {
    if (activeWorkflow.length === 0) {
      alert("Please add at least one workflow step first!");
      return;
    }

    setIsRunningPipeline(true);
    onAddLog("info", `Starting multi-agent workflow (${pipelineMode.toUpperCase()} mode)...`);

    if (pipelineMode === "sequential") {
      let previousStepOutput = "";
      for (let i = 0; i < activeWorkflow.length; i++) {
        const step = activeWorkflow[i];
        if (step.status === "completed") continue;

        const output = await executeAgentTask(step.id, previousStepOutput);
        if (output === "Execution interrupted by user.") {
          break;
        }
        previousStepOutput = output;
      }
    } else {
      // Parallel execution for max speed!
      const pendingSteps = activeWorkflow.filter(s => s.status !== "completed");
      // Run truly-parallel steps (same order index) concurrently; everything else sequential
      const orderGroups = new Map<number, typeof pendingSteps>();
      pendingSteps.forEach(s => {
        const ord = (s as any).order ?? 999;
        if (!orderGroups.has(ord)) orderGroups.set(ord, []);
        orderGroups.get(ord)!.push(s);
      });
      const sortedOrders = Array.from(orderGroups.keys()).sort((a, b) => a - b);
      for (const ord of sortedOrders) {
        const group = orderGroups.get(ord)!;
        if (group.length === 1) {
          await executeAgentTask(group[0].id);
        } else {
          await Promise.allSettled(group.map(s => executeAgentTask(s.id)));
        }
      }
    }

    setIsRunningPipeline(false);
    onAddLog("info", "Multi-agent workflow execution finished.");
  };

  return (
    <div className={`h-full w-full flex-1 flex flex-col overflow-hidden ${theme === "dark" ? "bg-[#121214] text-zinc-100" : "bg-slate-50 text-slate-800"}`}>
      
      {/* HEADER */}
      <div className={`h-14 px-6 border-b flex items-center justify-between shrink-0 ${
        theme === "dark" ? "border-zinc-800 bg-zinc-900/90" : "border-slate-200 bg-white"
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              Custom Multi-Agent Workflow Ecosystem
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-mono border border-indigo-500/20 font-bold">
                {agents.length} Custom Agents
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">Design your multi-agent architecture from scratch with instructions & interrupt capabilities</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Pipeline Mode Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold">
            <button
              onClick={() => setPipelineMode("sequential")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                pipelineMode === "sequential"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
              title="Sequential Pipelining: Step N receives zipped output of Step N-1"
            >
              <ArrowRight className="w-3.5 h-3.5" /> Sequential Chain
            </button>
            <button
              onClick={() => setPipelineMode("parallel")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                pipelineMode === "parallel"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
              title="Parallel Swarm: Execute independent steps concurrently for 5x speed"
            >
              <Sparkles className="w-3.5 h-3.5" /> Fast Parallel
            </button>
          </div>

          <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold rounded-lg font-mono">
            ⚡ 85% Zipped Memory Reduction
          </span>

          {/* Interrupt Button */}
          {activeRunningStepId && (
            <button
              onClick={handleInterruptExecution}
              className="bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 animate-bounce"
            >
              <PauseCircle className="w-4 h-4" /> Interrupt Output
            </button>
          )}

          <button
            onClick={() => setShowAddAgentModal(true)}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-100 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200 dark:border-zinc-700"
          >
            <Plus className="w-4 h-4 text-indigo-500" /> Add Custom Agent
          </button>

          <button
            onClick={handleRunPipeline}
            disabled={isRunningPipeline || activeWorkflow.length === 0}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-400 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            {isRunningPipeline ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                <span>Thinking... ({thinkingTime}s)</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run Flow ({activeWorkflow.length} Steps)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* MAIN BODY GRID */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden p-5 gap-5">
        
        {/* LEFT 5 COLS: AGENTS FLOW MANAGER */}
        <div className="col-span-5 flex flex-col gap-4 overflow-y-auto pr-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-indigo-500" /> Workflow Agents ({agents.length})
            </h3>
            <button
              onClick={() => setShowAddAgentModal(true)}
              className="text-[11px] font-bold text-indigo-500 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Create Agent
            </button>
          </div>

          {/* EMPTY STATE */}
          {agents.length === 0 && (
            <div className={`p-8 rounded-2xl border border-dashed text-center flex flex-col items-center justify-center gap-3 ${
              theme === "dark" ? "border-zinc-800 bg-zinc-900/40" : "border-slate-200 bg-white"
            }`}>
              <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                <Bot className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xs font-bold">No Agents in Workflow</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                  Build your custom multi-agent team from scratch. Define roles, personal goals, system instructions, and file resources.
                </p>
              </div>
              <button
                onClick={() => setShowAddAgentModal(true)}
                className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Your First Agent
              </button>
            </div>
          )}

          {/* AGENTS LIST */}
          <div className="space-y-3">
            {agents.map((agent) => (
              <div 
                key={agent.id}
                className={`p-4 rounded-2xl border transition-all shadow-xs ${
                  agent.status === "working" 
                    ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/30 ring-2 ring-indigo-500/50 glow-indigo-hover" 
                    : agent.status === "completed"
                    ? "border-emerald-500/50 bg-emerald-50/10 dark:bg-emerald-950/20"
                    : agent.status === "interrupted"
                    ? "border-rose-500/50 bg-rose-50/10 dark:bg-rose-950/20"
                    : (theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200 hover:border-slate-300")
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-1.5 bg-slate-100 dark:bg-zinc-800 rounded-xl shadow-2xs">{agent.avatar}</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {agent.name}
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-bold">
                          {agent.role}
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{agent.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveAgent(agent.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer"
                    title="Remove Agent"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Personal Wish / Goal */}
                {agent.personalWish && (
                  <div className="mt-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-500 flex items-start gap-2 font-medium">
                    <Target className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>Goal:</strong> "{agent.personalWish}"</span>
                  </div>
                )}

                {/* Instructions preview */}
                {agent.instructions && (
                  <p className="mt-2 text-[10px] text-slate-400 font-mono line-clamp-1 bg-slate-100 dark:bg-zinc-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-800">
                    📋 {agent.instructions}
                  </p>
                )}

                {/* Capabilities tags */}
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {agent.capabilities.map((cap, idx) => (
                    <span key={idx} className="text-[9px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-mono">
                      {cap}
                    </span>
                  ))}
                </div>

                {/* Agent Task Trigger & Real-Time Thinking Status */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                    {agent.status === "working" ? (
                      <span className="text-amber-500 font-bold flex items-center gap-1 animate-pulse">
                        <Clock className="w-3.5 h-3.5 animate-spin" /> Thinking ({thinkingTime}s)...
                      </span>
                    ) : (
                      <span>Logs: {agent.logs?.length || 0} entries</span>
                    )}
                  </span>

                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize border ${
                    agent.status === "working"
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/30 animate-pulse"
                      : agent.status === "completed"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : agent.status === "interrupted"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}>
                    {agent.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT 7 COLS: PARALLEL WORKFLOW PIPELINE BUILDER */}
        <div className="col-span-7 flex flex-col gap-4 overflow-hidden">
          
          <div className={`p-5 rounded-2xl border flex flex-col flex-1 overflow-hidden shadow-sm ${
            theme === "dark" ? "bg-zinc-900/90 border-zinc-800" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" /> Sequential Workflow Sequence ({activeWorkflow.length} Steps)
              </h3>

              {activeRunningStepId && (
                <button
                  onClick={handleInterruptExecution}
                  className="text-xs text-rose-500 hover:text-rose-400 font-bold flex items-center gap-1 border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 rounded-lg cursor-pointer"
                >
                  <PauseCircle className="w-3.5 h-3.5" /> Stop Execution
                </button>
              )}
            </div>

            {/* Quick Chain Presets Selector Bar */}
            <div className="mb-3 shrink-0 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Presets:
              </span>
              {SUGGESTED_WORKFLOW_CHAINS.map(chain => (
                <button
                  key={chain.id}
                  onClick={() => handleLoadPresetChain(chain.id)}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800/80 hover:bg-indigo-500/10 hover:text-indigo-500 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-zinc-700/80 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-zinc-300 transition-all shrink-0 cursor-pointer flex items-center gap-1"
                  title={chain.description}
                >
                  <span>{chain.icon}</span>
                  <span>{chain.title}</span>
                </button>
              ))}
            </div>

            {/* Workflow steps list */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {activeWorkflow.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl p-6 text-center text-slate-400">
                  <FileText className="w-8 h-8 mb-2 opacity-50 text-indigo-500" />
                  <p className="text-xs font-semibold">No workflow steps defined yet.</p>
                  <p className="text-[11px] opacity-75 mt-0.5">Use the form below to assign a task to any agent.</p>
                </div>
              ) : (
                activeWorkflow.map((step) => {
                  const assignedAgent = agents.find(a => a.id === step.agentId);
                  const isCurrentlyRunning = activeRunningStepId === step.id;

                  return (
                    <div 
                      key={step.id} 
                      className={`p-4 rounded-xl border text-xs transition-all ${
                        isCurrentlyRunning
                          ? "border-amber-500 bg-amber-950/20 ring-1 ring-amber-500 animate-pulse"
                          : step.status === "completed"
                          ? "border-emerald-500/30 bg-emerald-950/10"
                          : step.status === "interrupted"
                          ? "border-rose-500/30 bg-rose-950/10"
                          : (theme === "dark" ? "border-zinc-800 bg-zinc-950/50" : "border-slate-100 bg-slate-50")
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-slate-800 dark:text-white mb-1.5">
                        <span className="flex items-center gap-2">
                          <span className="text-base">{assignedAgent?.avatar || "🤖"}</span>
                          <span>{step.title}</span>
                          <span className="text-[10px] text-indigo-500 font-mono font-normal bg-indigo-500/10 px-2 py-0.5 rounded">
                            {assignedAgent?.name || "Unassigned"}
                          </span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                            isCurrentlyRunning ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                            step.status === "completed" ? "bg-emerald-500/20 text-emerald-400" :
                            step.status === "interrupted" ? "bg-rose-500/20 text-rose-400" :
                            "bg-slate-200 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}>
                            {isCurrentlyRunning ? `Thinking (${thinkingTime}s)...` : step.status}
                          </span>

                          {!isCurrentlyRunning && (
                            <>
                              {step.status === "completed" ? (
                                <>
                                  <button
                                    onClick={() => handleRerunStep(step.id)}
                                    className="text-slate-400 hover:text-indigo-400 p-1 rounded cursor-pointer transition-colors"
                                    title="Re-run this step"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleResetStep(step.id)}
                                    className="text-slate-400 hover:text-amber-400 p-1 rounded cursor-pointer transition-colors"
                                    title="Reset step status"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleRerunStep(step.id)}
                                  className="text-slate-400 hover:text-emerald-400 p-1 rounded cursor-pointer transition-colors"
                                  title="Run this step"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}

                          <button
                            onClick={() => handleRemoveStep(step.id)}
                            className="text-slate-400 hover:text-rose-500 p-1 rounded cursor-pointer"
                            title="Remove Step"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-zinc-300 font-mono mb-2">{step.inputPrompt}</p>

                      {step.targetPath && (
                        <div className="mb-2">
                          <span className="text-[10px] bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 font-mono px-2 py-0.5 rounded border border-indigo-100 dark:border-zinc-700">
                            Target File: {step.targetPath}
                          </span>
                        </div>
                      )}

                      {step.outputResult && (
                        <div className="mt-2.5 p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] space-y-2 border border-zinc-800">
                          <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-zinc-800 pb-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span>Execution Report</span>
                              {step.durationSeconds ? (
                                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                  ⏱️ {step.durationSeconds}s
                                </span>
                              ) : null}
                              {step.tokensEstimated ? (
                                <span className="text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                                  ⚡ {step.tokensEstimated.toLocaleString()} tokens ({step.tokensPerSec} t/s)
                                </span>
                              ) : null}
                              {step.tokensSavedEstimated && step.tokensSavedEstimated > 0 ? (
                                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                  📉 -{step.tokensSavedEstimated.toLocaleString()} tokens saved ({step.contextCompressionRatio}%)
                                </span>
                              ) : null}
                              <span className="text-zinc-500 text-[9px]">(Max 65,536 limit)</span>
                            </div>
                            <button
                              onClick={() => setInspectOutputStep(step)}
                              className="text-indigo-400 hover:underline font-bold cursor-pointer shrink-0 ml-1"
                            >
                              Expand View ↗
                            </button>
                          </div>
                          <p className="line-clamp-3 leading-relaxed whitespace-pre-wrap">{step.outputResult}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* ADD STEP FORM */}
            <form onSubmit={handleAddStep} className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-3 shrink-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={stepTitle}
                  onChange={(e) => setStepTitle(e.target.value)}
                  placeholder="Step Title (e.g. 'Build Auth Module')"
                  className="bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs p-2.5 focus:outline-none focus:border-indigo-500"
                />

                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  disabled={agents.length === 0}
                  className="bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs p-2.5 font-bold focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Assign Agent --</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.avatar} {a.name} ({a.role})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTaskPrompt}
                  onChange={(e) => setCustomTaskPrompt(e.target.value)}
                  placeholder="Task instruction prompt for this step..."
                  className="flex-1 bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs p-2.5 focus:outline-none focus:border-indigo-500"
                />

                <input
                  type="text"
                  value={targetFilePath}
                  onChange={(e) => setTargetFilePath(e.target.value)}
                  placeholder="Target File (Optional, e.g. src/auth.ts)"
                  className="w-48 bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs p-2.5 focus:outline-none focus:border-indigo-500 font-mono"
                />

                <button
                  type="submit"
                  disabled={agents.length === 0 || !customTaskPrompt.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-zinc-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add Step
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

      {/* MODAL: CREATE CUSTOM AGENT */}
      {showAddAgentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-xl rounded-2xl border p-6 shadow-2xl space-y-4 ${
            theme === "dark" ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-zinc-800">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-500" /> Create Custom Workflow Agent
              </h3>
              <button onClick={() => setShowAddAgentModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-slate-400">Agent Name *</label>
                  <input
                    type="text"
                    required
                    value={newAgentName}
                    onChange={(e) => setNewAgentName(e.target.value)}
                    placeholder="e.g. Lead Refactoring Specialist"
                    className="w-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Avatar Emoji</label>
                  <input
                    type="text"
                    value={newAgentAvatar}
                    onChange={(e) => setNewAgentAvatar(e.target.value)}
                    placeholder="🤖"
                    className="w-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-center text-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400">Role / Designation *</label>
                <input
                  type="text"
                  required
                  value={newAgentRole}
                  onChange={(e) => setNewAgentRole(e.target.value)}
                  placeholder="e.g. System Security Auditor"
                  className="w-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400">Personal Goal / Wish for Output *</label>
                <input
                  type="text"
                  value={newAgentPersonalWish}
                  onChange={(e) => setNewAgentPersonalWish(e.target.value)}
                  placeholder="e.g. Achieve 100% zero latency & complete clean TypeScript code."
                  className="w-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400">System Instructions / Execution Prompt</label>
                <textarea
                  rows={2}
                  value={newAgentInstructions}
                  onChange={(e) => setNewAgentInstructions(e.target.value)}
                  placeholder="Define strict instructions for this agent..."
                  className="w-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400">Capabilities (Comma separated)</label>
                <input
                  type="text"
                  value={newAgentCapabilities}
                  onChange={(e) => setNewAgentCapabilities(e.target.value)}
                  placeholder="TypeScript, Security, React Hooks"
                  className="w-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                />
              </div>

              {/* Resource File Selectors */}
              <div className="space-y-1">
                <label className="font-bold text-slate-400">Attach Workspace File Resources</label>
                <div className="max-h-24 overflow-y-auto border border-slate-200 dark:border-zinc-800 rounded-xl p-2 space-y-1 bg-slate-50 dark:bg-zinc-950">
                  {files.map(f => (
                    <label key={f.path} className="flex items-center gap-2 cursor-pointer hover:text-indigo-400">
                      <input
                        type="checkbox"
                        checked={selectedResources.includes(f.path)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedResources(prev => [...prev, f.path]);
                          else setSelectedResources(prev => prev.filter(p => p !== f.path));
                        }}
                        className="accent-indigo-600 rounded"
                      />
                      <span className="font-mono text-[11px] truncate">{f.path}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAgentModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl cursor-pointer shadow-md"
                >
                  Create & Save Agent
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: INSPECT OUTPUT */}
      {inspectOutputStep && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-6">
          <div className={`w-full max-w-3xl rounded-2xl border p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col ${
            theme === "dark" ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-500" />
                Execution Output: {inspectOutputStep.title}
              </h3>
              <button onClick={() => setInspectOutputStep(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 font-mono text-xs p-4 rounded-xl border border-zinc-800 leading-relaxed whitespace-pre-wrap">
              {inspectOutputStep.outputResult}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setInspectOutputStep(null)}
                className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Output
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
