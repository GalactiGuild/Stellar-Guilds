"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/markdown/CodeBlock";

interface BountyDescriptionProps {
  markdown: string;
  className?: string;
  emptyText?: string;
}

export function BountyDescription({
  markdown,
  className = "",
  emptyText = "_Intel pending..._",
}: BountyDescriptionProps) {
  return (
    <div className={`prose prose-invert max-w-none prose-violet ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: ({ children, className }) => (
            <CodeBlock className={className}>{children}</CodeBlock>
          ),
        }}
      >
        {markdown || emptyText}
      </ReactMarkdown>
    </div>
  );
}
