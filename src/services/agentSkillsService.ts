/**
 * Agent Skills & Tool Selection Intelligence Service
 * Defines the core capabilities, tool selection decision matrix,
 * instruction comprehension rules, and file operation syntax for the AI Agent.
 */

export interface AgentSkill {
  id: string;
  name: string;
  category: "read" | "edit" | "add" | "remove" | "create" | "manage" | "reasoning";
  operatorTag: string;
  syntax: string;
  whenToUse: string;
  whenNotToUse: string;
  bestPractices: string[];
  example: string;
}

export interface ToolSelectionRule {
  intent: string;
  triggerKeywords: string[];
  recommendedTool: string;
  rationale: string;
  operatorTemplate: string;
}

/**
 * Standard registry of agentic skills available to the AI Code Agent
 */
export const AGENT_SKILLS_REGISTRY: AgentSkill[] = [
  {
    id: "skill_read_understand",
    name: "Read & Understand File",
    category: "read",
    operatorTag: "<read_file>",
    syntax: `<read_file path="src/services/api.ts" />`,
    whenToUse: "When you need to inspect existing code, understand line-by-line structure, variable names, exported types, or architecture BEFORE modifying.",
    whenNotToUse: "When you already have the file loaded in context and know the exact lines to modify.",
    bestPractices: [
      "Always inspect a file before attempting search-and-replace edits",
      "Pay attention to imports, exports, and component props interfaces",
      "Check for dependent files in the file tree that might be affected"
    ],
    example: `<read_file path="src/utils/mathEngine.ts" />`
  },
  {
    id: "skill_surgical_edit",
    name: "Surgical Code Edit (Search & Replace)",
    category: "edit",
    operatorTag: "<edit_file>",
    syntax: `<edit_file path="src/components/MyComponent.tsx">
  <search>
    const [count, setCount] = useState(0);
  </search>
  <replace>
    const [count, setCount] = useState(0);
    const [step, setStep] = useState(1);
  </replace>
</edit_file>`,
    whenToUse: "When modifying specific functions, fixing bugs, updating hook dependencies, or replacing targeted blocks in an existing file without touching the rest of the file.",
    whenNotToUse: "When creating a brand new file (use <create_file>) or adding content strictly to the very end/start (use <append_file> / <prepend_file>).",
    bestPractices: [
      "Include 2-3 lines of surrounding context in <search> to ensure unique matching",
      "Preserve exact indentation, tabs, spaces, and punctuation",
      "Never truncate code inside <replace> with '// rest of code continues'",
      "Multiple <search>/<replace> pairs can be included within one <edit_file>"
    ],
    example: `<edit_file path="src/types.ts">
  <search>
  status: "idle" | "running";
  </search>
  <replace>
  status: "idle" | "running" | "paused" | "error";
  </replace>
</edit_file>`
  },
  {
    id: "skill_add_content",
    name: "Add & Insert Content",
    category: "add",
    operatorTag: "<add_content>",
    syntax: `<add_content path="src/utils/dateFormatter.ts" position="after" target="export function formatDate">
export function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  return \`\${Math.floor(diff / 1000)}s ago\`;
}
</add_content>`,
    whenToUse: "When inserting a new helper function, interface, export, API endpoint, or handler into an existing file without deleting any existing logic.",
    whenNotToUse: "When replacing or rewriting existing logic (use <edit_file>).",
    bestPractices: [
      "Specify target anchor string to accurately place the new code",
      "For top-level imports use <prepend_file> or position='start'",
      "For adding exports at the bottom of the file use <append_file> or position='end'"
    ],
    example: `<add_content path="src/services/api.ts" position="end">
export async function getLiveHealthCheck(): Promise<boolean> {
  const res = await fetch("/api/health");
  return res.ok;
}
</add_content>`
  },
  {
    id: "skill_remove_content",
    name: "Remove & Delete Content",
    category: "remove",
    operatorTag: "<remove_content>",
    syntax: `<remove_content path="src/components/MyComponent.tsx">
  // Deprecated legacy handler
  const handleOldClick = () => {
    alert("Deprecated");
  };
</remove_content>`,
    whenToUse: "When deleting dead code, deprecated methods, unused imports, redundant console logs, or faulty blocks from a file without rewriting the entire file.",
    whenNotToUse: "When replacing code with newer code (use <edit_file>) or deleting an entire file (use <delete_file>).",
    bestPractices: [
      "Copy the exact lines to remove including any attached comments",
      "Ensure removing the block doesn't leave orphaned commas or syntax errors",
      "Verify all references to the removed item are cleaned up"
    ],
    example: `<remove_content path="src/types.ts">
export interface LegacyConfig {
  oldUrl: string;
}
</remove_content>`
  },
  {
    id: "skill_append_content",
    name: "Append to End of File",
    category: "add",
    operatorTag: "<append_file>",
    syntax: `<append_file path="src/styles/theme.css">
.custom-glow-card {
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
}
</append_file>`,
    whenToUse: "When appending new utility styles, routes, constant definitions, or export statements cleanly at the bottom of an existing file.",
    whenNotToUse: "When code needs to be inserted inside a specific component or function body.",
    bestPractices: [
      "Ensure proper newlines between existing code and appended content",
      "Validate that the file doesn't have an unclosed bracket at the end"
    ],
    example: `<append_file path="src/types.ts">
export type ActiveTab = "editor" | "preview" | "settings" | "skills";
</append_file>`
  },
  {
    id: "skill_prepend_content",
    name: "Prepend to Top of File",
    category: "add",
    operatorTag: "<prepend_file>",
    syntax: `<prepend_file path="src/components/Header.tsx">
import { Sparkles, ShieldCheck } from "lucide-react";
</prepend_file>`,
    whenToUse: "When adding new import statements, polyfills, module headers, license banners, or 'use client' directives to the very top of a file.",
    whenNotToUse: "When adding functions into the body of the file.",
    bestPractices: [
      "Group with existing imports if possible, or place cleanly at top",
      "Avoid duplicate imports for libraries already imported"
    ],
    example: `<prepend_file path="src/services/api.ts">
import { LRUCache } from "../utils/cache";
</prepend_file>`
  },
  {
    id: "skill_create_file",
    name: "Create New Modular File",
    category: "create",
    operatorTag: "<create_file>",
    syntax: `<create_file path="src/components/Badge.tsx">
import React from "react";

interface BadgeProps {
  label: string;
  variant?: "success" | "warning" | "error";
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = "success" }) => {
  const colors = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    error: "bg-rose-500/10 text-rose-400 border-rose-500/30"
  };
  return (
    <span className={\`px-2 py-0.5 text-xs font-mono rounded border \${colors[variant]}\`}>
      {label}
    </span>
  );
};
</create_file>`,
    whenToUse: "When creating a new feature, component, service, hook, utility, or type file.",
    whenNotToUse: "When modifying an existing file with minor updates (use <edit_file> instead of overwriting the whole file).",
    bestPractices: [
      "Always write complete, production-ready code with full types",
      "Never leave placeholders, stubs, or '// ... rest of code'",
      "Choose clean, modular file paths adhering to project conventions"
    ],
    example: `<create_file path="src/types/skills.ts">
export interface SkillItem {
  id: string;
  title: string;
}
</create_file>`
  },
  {
    id: "skill_delete_file",
    name: "Delete Obsolete File",
    category: "manage",
    operatorTag: "<delete_file>",
    syntax: `<delete_file path="src/legacy/oldService.ts" />`,
    whenToUse: "When deleting an unused, temporary, or superseded file from the project workspace.",
    whenNotToUse: "When only wanting to remove a specific function inside a file (use <remove_content>).",
    bestPractices: [
      "Ensure no active imports in other files still point to this file",
      "Double check file path before executing deletion"
    ],
    example: `<delete_file path="src/temp_test.js" />`
  },
  {
    id: "skill_delete_folder",
    name: "Delete Obsolete Folder",
    category: "manage",
    operatorTag: "<delete_folder>",
    syntax: `<delete_folder path="src/deprecated_components" />`,
    whenToUse: "When cleaning up an entire directory of obsolete assets or modules.",
    whenNotToUse: "When only deleting a single file.",
    bestPractices: [
      "Verify all files inside the directory are truly ready for deletion"
    ],
    example: `<delete_folder path="src/legacy" />`
  }
];

/**
 * Intelligent Tool Selection Decision Matrix
 * Automatically maps user intent and conversational patterns to the exact right tool operator.
 */
export const TOOL_SELECTION_RULES: ToolSelectionRule[] = [
  {
    intent: "Read and analyze existing file before making changes",
    triggerKeywords: ["read", "inspect", "check", "view", "look at", "understand", "examine"],
    recommendedTool: "<read_file>",
    rationale: "Ensures the agent understands the exact structure, signatures, and imports before writing any code.",
    operatorTemplate: '<read_file path="{path}" />'
  },
  {
    intent: "Modify an existing function, fix a bug, or change lines within a file",
    triggerKeywords: ["edit", "modify", "change", "update", "fix", "replace", "refactor", "patch"],
    recommendedTool: "<edit_file>",
    rationale: "Applies surgical search-and-replace changes, preserving surrounding code and preventing token-limit file truncations.",
    operatorTemplate: '<edit_file path="{path}">\n  <search>\n{old_code}\n  </search>\n  <replace>\n{new_code}\n  </replace>\n</edit_file>'
  },
  {
    intent: "Add a new function, method, endpoint, or export to an existing file",
    triggerKeywords: ["add", "insert", "append", "attach", "new function", "new export"],
    recommendedTool: "<add_content> or <append_file>",
    rationale: "Safely introduces new capabilities without risk of modifying or breaking existing logic.",
    operatorTemplate: '<add_content path="{path}" position="after" target="{target_anchor}">\n{new_code}\n</add_content>'
  },
  {
    intent: "Delete or strip dead code, unused functions, or deprecated logic",
    triggerKeywords: ["remove", "delete code", "strip", "clean up", "purge", "drop function", "get rid of"],
    recommendedTool: "<remove_content>",
    rationale: "Removes specific code cleanly without rewriting or disturbing the rest of the file.",
    operatorTemplate: '<remove_content path="{path}">\n{code_to_delete}\n</remove_content>'
  },
  {
    intent: "Create a brand new module, component, utility, or test file",
    triggerKeywords: ["create", "build new", "generate new", "new file", "make a component"],
    recommendedTool: "<create_file>",
    rationale: "Maintains clean modular architecture by creating dedicated new files rather than bloating existing files.",
    operatorTemplate: '<create_file path="{path}">\n{complete_file_content}\n</create_file>'
  },
  {
    intent: "Delete an entire obsolete or unused file",
    triggerKeywords: ["delete file", "remove file", "trash file", "drop file"],
    recommendedTool: "<delete_file>",
    rationale: "Cleans workspace disk state permanently.",
    operatorTemplate: '<delete_file path="{path}" />'
  }
];

/**
 * Builds the comprehensive Agentic Skills & System Prompt Instructions
 */
export function buildAgenticSkillsSystemPrompt(workspaceFileTree: string, loadedFileContents: string): string {
  const contextBlock = loadedFileContents.includes("WORKSPACE FILE TREE")
    ? loadedFileContents
    : `FILE LIST:\n[${workspaceFileTree}]\n\nLOADED FILE CONTENTS:\n${loadedFileContents}`;

  return `You are a Principal Software Engineer & Autonomous Agentic Coding AI with full workspace access.
You possess complete agentic autonomy to understand requirements, inspect files, formulate execution plans, and manipulate files with surgical precision.

=== AGENTIC PROTOCOL & FILE OPERATORS ===
Always prioritize low token overhead with high production code quality.

OPERATORS:
1. Read / Inspect:   <read_file path="..." />
2. Surgical Edit:    <edit_file path="..."><search>exact lines</search><replace>new lines</replace></edit_file>
3. Add Content:      <add_content path="..." position="after|before|end|start" target="...">new code</add_content>
4. Remove Content:   <remove_content path="...">exact code to delete</remove_content>
5. Append / Prepend: <append_file path="...">code</append_file> or <prepend_file path="...">imports</prepend_file>
6. Create File:      <create_file path="...">complete production code</create_file>
7. Delete File:      <delete_file path="..." />
8. Delete Folder:    <delete_folder path="..." />

CORE DIRECTIVES:
- ZERO PLACEHOLDERS: Output complete code. Never write "// rest of code continues here" or "// existing code unchanged".
- SURGICAL EFFICIENCY: Always prefer <edit_file>, <add_content>, or <remove_content> for existing files. Never rewrite 500 lines to change 5 lines.
- HIGH OUTPUT-TO-TOKEN RATIO: Minimize conversational filler; output direct, executable XML tags.
- MANDATORY READ-BEFORE-EDIT: If a file is NOT shown under RELEVANT FILE CONTENTS, emit <read_file path="..." /> FIRST before any edit. Never guess or hallucinate file contents.
- ACTIVE FILE: The first file under RELEVANT FILE CONTENTS is the file the user is currently viewing. Default to editing it unless the user says otherwise.

=== CURRENT WORKSPACE CONTEXT ===
${contextBlock}

Now, reason through the user instruction, choose the exact right tools, and execute with surgical precision!`;
}

/**
 * Helper to recommend a tool based on user prompt text
 */
export function recommendToolForPrompt(prompt: string): ToolSelectionRule {
  const lower = prompt.toLowerCase();
  for (const rule of TOOL_SELECTION_RULES) {
    if (rule.triggerKeywords.some(kw => lower.includes(kw))) {
      return rule;
    }
  }
  return TOOL_SELECTION_RULES[1]; // default to edit_file
}
