import { TextMessageContent } from '@growly/core';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';

const cleanHTML = async (content: TextMessageContent['content']) =>
  DOMPurify.sanitize(await marked(content));

export const buildMarkdownMessage = (content: TextMessageContent['content'], time: string) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [html, setHtml] = useState('');

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    cleanHTML(content).then(html => setHtml(html));
  }, [content]);

  console.log(content);

  return (
    <p className="text-sm">
      <div className="prose prose-sm dark:prose-invert max-w-none break-words">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <br />
      <span className="text-xs opacity-50">{time}</span>
    </p>
  );
};
