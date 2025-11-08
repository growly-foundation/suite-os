import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatOpenAI } from '@langchain/openai';

export type ChatProvider = 'openai' | 'anthropic' | 'bedrock';

interface ChatModelOptions {
  provider: ChatProvider;
  temperature?: number;
  modelName?: string;
  verbose?: boolean;
}

export class ChatModelFactory {
  static create(options: ChatModelOptions): BaseChatModel {
    const { provider, temperature = 0.7, modelName, verbose = false } = options;

    switch (provider) {
      case 'openai':
        return new ChatOpenAI({
          modelName: modelName ?? 'gpt-4o-mini',
          temperature,
          streaming: true,
          openAIApiKey: process.env.OPENAI_API_KEY!,
          verbose,
        });

      default:
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}
