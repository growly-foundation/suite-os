'use client';

import moment from 'moment';
import React, { useEffect, useState } from 'react';

import { ParsedMessage } from '@getgrowly/core';

import { buildSystemErrorMessage } from './system';
import { buildMarkdownMessage } from './system/markdown';
import { buildRecommendationChips } from './system/recommendations';
import { buildTextMessage } from './system/text';
import { buildUniswapSwapMessage } from './uniswap';

export const RenderMessage = ({ message }: { message: ParsedMessage }) => {
  const [time, setTime] = useState(moment(message.created_at).fromNow());

  useEffect(() => {
    setTime(moment(message.created_at).fromNow());
  }, [moment(message.created_at).minutes()]);

  return (
    <React.Fragment>
      <RenderMessageContent message={message} />
      <span className="gas-text-xs gas-opacity-50">{time}</span>
    </React.Fragment>
  );
};

export const RenderMessageContent = ({ message }: { message: ParsedMessage }) => {
  if (message.type === 'text') {
    if (message.sender === 'user') {
      return buildTextMessage(message.content);
    }
    return buildMarkdownMessage(message.content);
  }
  if (message.type === 'text:recommendation') {
    return buildRecommendationChips(message.content);
  }
  if (message.type === 'system:error') {
    return buildSystemErrorMessage(message.content);
  }
  if (message.type === 'uniswap:swap') {
    return buildUniswapSwapMessage(message.content);
  }
  return null;
};
