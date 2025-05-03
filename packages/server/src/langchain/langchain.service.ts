// src/langchain/langchain.service.ts
import { Injectable } from '@nestjs/common';
import { ChatModelFactory, ChatProvider } from '../utils/model.factory';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';

@Injectable()
export class LangchainService {
  private readonly model: BaseChatModel;

  constructor() {
    const provider: ChatProvider =
      (process.env.MODEL_PROVIDER as ChatProvider) || 'openai';
    this.model = ChatModelFactory.create({
      provider,
      modelName: process.env.MODEL_NAME,
    });
  }

  async chat(userInput: string): Promise<string> {
    const response = await this.model.invoke([
      [
        'system',
        'You are a helpful assistant that expert in Web3 and Crypto, especially DeFi protocol.',
      ],
      ['human', userInput],
    ]);
    return response.content as string;
  }
}
