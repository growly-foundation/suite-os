import { Provider } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

export const OpenAIProvider: Provider = {
  provide: 'OPENAI_CLIENT',
  inject: [ConfigService],
  useFactory: (configService: ConfigService): OpenAI => {
    const apiKey = configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      throw new Error('OpenAI API key must be provided');
    }

    return new OpenAI({
      apiKey,
    });
  },
};
