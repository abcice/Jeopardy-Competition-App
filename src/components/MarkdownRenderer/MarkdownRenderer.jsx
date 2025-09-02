// src/components/MarkdownRenderer/MarkdownRenderer.jsx
import React from "react";
import ReactMarkdown from "react-markdown";
import { CodeBlock, dracula } from "react-code-blocks";

export default function MarkdownRenderer({ content }) {
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const languageMatch = /language-(\w+)/.exec(className || "");
          return !inline && languageMatch ? (
            <CodeBlock
              text={String(children).replace(/\n$/, "")}
              language={languageMatch[1]}
              showLineNumbers={true}
              theme={dracula}
            />
          ) : (
            <code
              style={{
                backgroundColor: "#f0f0f0",
                padding: "2px 6px",
                borderRadius: "4px",
              }}
              {...props}
            >
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
