import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeHighlighterProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

export const CodeHighlighter: React.FC<CodeHighlighterProps> = ({
  code,
  language = "typescript",
  showLineNumbers = true
}) => {
  return (
    <div className="w-full rounded-xl overflow-hidden border border-zinc-800 bg-[#1e1e1e] text-xs font-mono shadow-md">
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        showLineNumbers={showLineNumbers}
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "transparent",
          fontSize: "12px",
          lineHeight: "1.5"
        }}
      >
        {code || "// No code available"}
      </SyntaxHighlighter>
    </div>
  );
};
