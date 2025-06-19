import { Tables } from '@/types/database.types';
import { Token } from '@coinbase/onchainkit/token';

export type Message = Tables<'messages'>;
export type ParsedMessage = Omit<Message, 'content'> & MessageContent;
export type ParsedMessageInsert = Omit<Message, 'id' | 'created_at'> & MessageContent;

export type Conversation = Tables<'conversation'>;

/**
 * Role of the participant in the conversation.
 */
export enum ConversationRole {
  User = 'user',
  Agent = 'assistant',
  System = 'system',
  Admin = 'admin',
}

/**
 * Content of the message.
 */
export type MessageContent =
  | TextMessageContent
  | TextRecommendationMessageContent
  | SystemErrorMessageContent
  | OnchainKitMessageContent
  | UniswapSwapMessageContent;

/**
 * Text message content.
 */
export interface TextMessageContent {
  type: 'text';
  content: string;
}

/**
 * Text recommendations for next message content.
 */
export interface TextRecommendationMessageContent {
  type: 'text:recommendation';
  content: Record<string, string>; // keyword -> full_text_message
}

/**
 * System error message content.
 */
export interface SystemErrorMessageContent {
  type: 'system:error';
  content: string;
}

/**
 * OnchainKit message content.
 */
export type OnchainKitMessageContent = OnchainKitSwapMessageContent | OnchainKitTokenMessageContent;

/**
 * OnchainKit swap message content.
 */
export interface OnchainKitSwapMessageContent {
  type: 'onchainkit:swap';
  content: {
    fromToken: Token;
    toToken: Token;
    swappableTokens: Token[];
  };
}

/**
 * OnchainKit token message content.
 */
export interface OnchainKitTokenMessageContent {
  type: 'onchainkit:token';
  content: {
    token: Token;
  };
}

export interface UniswapSwapTokenInfo {
  symbol: string;
  name: string;
  chain: string;
  address: string | null;
  value: number;
  percentage: number;
  type: string;
  price: number;
  quantity: number;
}

/**
 * Uniswap swap message content.
 */
export interface UniswapSwapMessageContent {
  type: 'uniswap:swap';
  content: {
    fromToken: UniswapSwapTokenInfo;
    toToken: UniswapSwapTokenInfo;
    amount: number;
    link?: string;
  };
}
