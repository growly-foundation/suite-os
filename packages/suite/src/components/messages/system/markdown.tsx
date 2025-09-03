import { useTheme } from '@/components/providers/ThemeProvider';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import React, { useEffect, useState } from 'react';

import { TextMessageContent } from '@getgrowly/core';

const cleanHTML = async (content: TextMessageContent['content']) => {
  // First render the markdown normally
  let html = await marked(content);

  // Then add target="_blank" to all links using regex
  html = html.replace(/<a\s+href=/gi, '<a target="_blank" rel="noopener noreferrer" href=');

  // Finally sanitize the HTML
  return DOMPurify.sanitize(html);
};

/**
 * A styled markdown component that uses the theme system for styling
 */
export const Markdown: React.FC<{ content: TextMessageContent['content'] }> = ({ content }) => {
  const { theme } = useTheme();
  const [html, setHtml] = useState('');

  useEffect(() => {
    cleanHTML(content).then(html => setHtml(html));
  }, [content]);

  // Define CSS for markdown styling based on your theme
  const styleTag = `
    .themed-markdown h1, .themed-markdown h2, .themed-markdown h3, .themed-markdown h4, .themed-markdown h5, .themed-markdown h6 {
      color: ${theme.text.primary};
      font-weight: ${theme.typography.fontWeight.semibold};
      margin-top: 1em;
      margin-bottom: 0.5em;
    }

    .themed-markdown * {
      color: ${theme.text.primary};
    }
    
    .themed-markdown p {
      margin-top: 0.5em;
      margin-bottom: 0.5em;
      word-wrap: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
    }
      
    .themed-markdown strong {
      font-weight: ${theme.typography.fontWeight.bold};
      color: ${theme.text.primary};
    }
    
    .themed-markdown em {
      font-style: italic;
      color: ${theme.text.primary};
    }
    
    .themed-markdown a {
      color: ${theme.brand.primary};
      text-decoration: underline;
      word-break: break-all;
    }
    
    .themed-markdown a:hover {
      text-decoration: none;
    }
    
    .themed-markdown code {
      background-color: ${theme.background.subtle};
      padding: 0.2em 0.4em;
      border-radius: ${theme.radius.sm};
      font-size: 0.875em;
      word-break: break-all;
      white-space: pre-wrap;
    }
    
    .themed-markdown pre {
      background-color: ${theme.background.subtle};
      padding: ${theme.spacing.md};
      border-radius: ${theme.radius.md};
      overflow: auto;
      word-wrap: break-word;
      white-space: pre-wrap;
    }
    
    .themed-markdown blockquote {
      border-left: 4px solid ${theme.ui.border.default};
      padding-left: ${theme.spacing.md};
      color: ${theme.text.secondary};
      word-wrap: break-word;
    }
    
    .themed-markdown ul, .themed-markdown ol {
      padding-left: ${theme.spacing.lg};
      word-wrap: break-word;
    }
    
    .themed-markdown table {
      border-collapse: collapse;
      width: 100%;
      table-layout: fixed;
    }
    
    .themed-markdown th, .themed-markdown td {
      border: 1px solid ${theme.ui.border.default};
      padding: ${theme.spacing.sm};
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    
    .themed-markdown th {
      background-color: ${theme.background.paper};
      font-weight: ${theme.typography.fontWeight.semibold};
    }
  `;

  return (
    <div className="gas-text-sm" style={{ margin: 0 }}>
      <style dangerouslySetInnerHTML={{ __html: styleTag }} />
      <div
        className="gas-prose gas-prose-sm dark:gas-prose-invert gas-max-w-none gas-break-words themed-markdown"
        style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
};

// Export the themed markdown message component
export const buildMarkdownMessage = (content: TextMessageContent['content']) => {
  return <Markdown content={content} />;
};
