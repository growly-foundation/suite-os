import { TextMessageContent } from '@getgrowly/core';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import React, { useEffect, useState } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';

const cleanHTML = async (content: TextMessageContent['content']) =>
  DOMPurify.sanitize(await marked(content));

// Create a proper React component for markdown rendering
const MarkdownContent: React.FC<{ content: TextMessageContent['content'] }> = ({ content }) => {
  const { theme } = useTheme();
  const [html, setHtml] = useState('');

  useEffect(() => {
    cleanHTML(content).then(html => setHtml(html));
  }, [content]);

  return (
    <p className="text-sm" style={{ margin: 0 }}>
      <div className="prose prose-sm dark:prose-invert max-w-none break-words">
        <div
          style={{
            color: theme.text.primary,
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </p>
  );
};

// Factory function that returns the component
export const buildMarkdownMessage = (content: TextMessageContent['content']) => {
  return <MarkdownContent content={content} />;
};
