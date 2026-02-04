import React from 'react';
import { marked } from 'marked';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const htmlContent = marked.parse(content, { gfm: true, breaks: true });

  return (
    <div
      className={`prose prose-invert max-w-none ${className}`} // prose-invert for dark mode
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default MarkdownRenderer;