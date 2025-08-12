import { API_URL } from '@/constants';
import axios from 'axios';

import { AgentId, MessageContent } from '@getgrowly/core';

// Temporary type definitions until core package exports are fixed
export type StreamingMessageType =
  | 'stream:status'
  | 'stream:text'
  | 'stream:tool'
  | 'stream:complete'
  | 'stream:error';

export interface StreamingMessage {
  type: StreamingMessageType;
  timestamp: number;
}

export interface StreamingStatusMessage extends StreamingMessage {
  type: 'stream:status';
  content: {
    status: 'thinking' | 'tool_calling' | 'processing' | 'generating';
    message: string;
    toolName?: string;
  };
}

export interface StreamingTextMessage extends StreamingMessage {
  type: 'stream:text';
  content: {
    chunk: string;
    isComplete: boolean;
  };
}

export interface StreamingToolMessage extends StreamingMessage {
  type: 'stream:tool';
  content: MessageContent;
}

export interface StreamingCompleteMessage extends StreamingMessage {
  type: 'stream:complete';
  content: {
    totalTokens?: number;
    processingTime: number;
  };
}

export interface StreamingErrorMessage extends StreamingMessage {
  type: 'stream:error';
  content: {
    error: string;
    code?: string;
  };
}

export type StreamingResponse =
  | StreamingStatusMessage
  | StreamingTextMessage
  | StreamingToolMessage
  | StreamingCompleteMessage
  | StreamingErrorMessage;

export interface AgentChatResponse {
  agent: string;
  tools: MessageContent[];
}

export class ChatService {
  constructor() {}

  async chat(payload: {
    message: string;
    agentId: AgentId;
    userId: string;
    stepId: AgentId;
    isBeastMode?: boolean;
  }): Promise<{
    reply: AgentChatResponse;
  }> {
    try {
      const response = await axios.post(`${API_URL}/chat`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * Streaming chat using Server-Sent Events for real-time communication
   */
  async *chatStream(payload: {
    message: string;
    agentId: AgentId;
    userId: string;
    stepId: AgentId;
    isBeastMode?: boolean;
  }): AsyncGenerator<StreamingResponse, void, unknown> {
    console.log('🔍 Frontend chatStream received payload:', payload);

    if (!payload.message || !payload.agentId || !payload.userId) {
      throw new Error(`Missing required parameters`);
    }

    const params = new URLSearchParams({
      message: encodeURIComponent(payload.message),
      agentId: payload.agentId,
      userId: payload.userId,
      stepId: payload.stepId,
      isBeastMode: payload.isBeastMode?.toString() || 'false',
    });

    const sseUrl = `${API_URL}/chat/stream?${params.toString()}`;
    console.log('🔗 Creating EventSource with URL:', sseUrl);

    const eventSource = new EventSource(sseUrl);
    const messageQueue: StreamingResponse[] = [];
    let isComplete = false;
    let hasError = false;

    eventSource.onopen = () => {
      console.log('✅ SSE connection opened');
    };

    eventSource.onmessage = event => {
      try {
        console.log('📨 Raw SSE message:', event.data);
        const message: StreamingResponse = JSON.parse(event.data);
        messageQueue.push(message);

        if (message.type === 'stream:complete' || message.type === 'stream:error') {
          isComplete = true;
          eventSource.close();
        }
      } catch (err) {
        console.error('❌ Parse error:', err);
        hasError = true;
        eventSource.close();
      }
    };

    eventSource.onerror = err => {
      console.error('❌ EventSource error:', err);
      hasError = true;
      eventSource.close();
    };

    try {
      while (!isComplete || messageQueue.length > 0) {
        if (hasError) {
          throw new Error('SSE connection failed');
        }

        if (messageQueue.length > 0) {
          const message = messageQueue.shift();
          if (message) {
            yield message;
          }
        } else if (!isComplete) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    } finally {
      eventSource.close();
    }
  }
}

export const chatService = new ChatService();
