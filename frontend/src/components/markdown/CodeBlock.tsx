"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // Extract text content from children - handles both string and React element children
    const extractText = (node: React.ReactNode): string => {
      if (typeof node === "string" || typeof node === "number") {
        return String(node);
      }
      if (React.isValidElement<{ children?: React.ReactNode; dangerouslySetInnerHTML?: { __html: string } }>(node)) {
        const { children: childContent, dangerouslySetInnerHTML } = node.props;
        // Recursively extract from children
        if (childContent) {
          return React.Children.toArray(childContent)
            .map(extractText)
            .join("");
        }
        // Check for dangerouslySetInnerHTML (used by react-markdown for code)
        if (dangerouslySetInnerHTML && dangerouslySetInnerHTML.__html) {
          return dangerouslySetInnerHTML.__html;
        }
      }
      return "";
    };

    const text = extractText(children);

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="relative group">
      {/* Copy button - absolute positioned top-right */}
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 z-10 p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-300 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
        aria-label={copied ? "Copied" : "Copy code"}
        type="button"
      >
        {copied ? (
          <Check size={16} className="text-green-400" />
        ) : (
          <Copy size={16} />
        )}
      </button>
      {/* Code content */}
      <pre className={className}>{children}</pre>
    </div>
  );
}
