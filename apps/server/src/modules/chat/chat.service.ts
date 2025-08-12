import { Injectable, Logger, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';

import { AgentService } from '../agent/agent.service';

interface ChatRequest {
  message: string;
  userId: string;
  agentId: string;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly agentService: AgentService) {}

  async dumbChat({ message, userId, agentId }: ChatRequest) {
    try {
      this.logger.log('Processing with multi-agent supervisor...');
      const reply = await this.agentService.chat({
        message,
        userId,
        agentId,
      });
      // Return the response
      return reply;
    } catch (error) {
      this.logger.error(`Error in chat processing: ${error.message}`, error.stack);
      throw error;
    }
  }

  chatStream({ message, userId, agentId }: ChatRequest): Observable<MessageEvent> {
    return new Observable<MessageEvent>(observer => {
      // Use an async function to handle the async generator
      const processStream = async () => {
        try {
          this.logger.log('🎬 Starting stream processing...');
          const streamIterator = this.agentService.chatStream({ message, userId, agentId });

          // Send initial heartbeat to establish connection
          observer.next({
            data: JSON.stringify({
              type: 'stream:status',
              timestamp: Date.now(),
              content: { status: 'processing', message: 'Stream started' },
            }),
          });

          let messageCount = 0;
          for await (const chunk of streamIterator) {
            messageCount++;
            this.logger.debug(`📤 Emitting chunk #${messageCount}:`, chunk.type);

            observer.next({
              data: JSON.stringify(chunk),
              type: chunk.type,
            });

            // Small delay to ensure messages are sent
            await new Promise(resolve => setTimeout(resolve, 1));
          }

          this.logger.log(`✅ Stream completed successfully. Sent ${messageCount} messages.`);
          observer.complete();
        } catch (error) {
          this.logger.error(`❌ Error in streaming chat: ${error.message}`, error.stack);

          // Send error message to client
          observer.next({
            data: JSON.stringify({
              type: 'stream:error',
              timestamp: Date.now(),
              content: { error: error.message, code: 'STREAMING_ERROR' },
            }),
          });

          observer.error(error);
        }
      };

      // Start the async process
      processStream();

      // Cleanup function
      return () => {
        this.logger.debug('🧹 Stream subscription cancelled');
      };
    });
  }

  async advancedChat({ message, userId, agentId }: ChatRequest) {
    try {
      this.logger.log('Processing with multi-agent supervisor...');
      const reply = await this.agentService.advancedChat({
        message,
        userId,
        agentId,
      });
      // Return the response
      return reply;
    } catch (error) {
      this.logger.error(`Error in chat processing: ${error.message}`, error.stack);
      throw error;
    }
  }
}
