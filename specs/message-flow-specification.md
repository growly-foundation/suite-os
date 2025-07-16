# Suite Message Flow Specification

## Overview

This document specifies the message flow between agents and clients in the Suite AI-powered DeFi engine, based on analysis of the ChatMessageView component and system architecture.

## Message Structure

### ParsedMessage Interface

```typescript
interface ParsedMessage {
  id: string;
  sender: 'user' | 'assistant';
  type: 'text' | 'tool' | 'other';
  content: string;
  created_at: string;
  // Additional fields as needed
}
```

### Message Types

- **Text Messages** (`type === 'text'`): Regular conversation messages
- **Tool Messages** (`type !== 'text'`): Agent tool executions and responses
- **User Messages**: User inputs sent to agents
- **Assistant Messages**: Agent responses and tool executions

## Tool Message Structure

### Tool Implementation Structure

Based on the actual `tools.ts` implementation, tools follow this structure:

```typescript
// Tool Function Type
type ToolFn = () => (input: any) => Promise<ToolOutputValue[]>;

// Tool Output Type
type ToolOutputValue = MessageContent;

// Tool Input Interface
interface ToolInput {
  [key: string]: { description: string; required?: boolean };
}

// Tool Output Description
type ToolOutputDescription = Omit<MessageContent, 'content'> & { description: string };
```

### Tool Message Format

Tools return an array of `MessageContent` objects, which are then processed by the `buildTool` function:

```typescript
// Tool execution flow
export function buildTool(toolFn: ToolFn) {
  const tool = toolFn();
  return async (
    input: any,
    _runManager?: CallbackManagerForToolRun,
    _config?: RunnableConfig
  ): Promise<string> => {
    const logger = new Logger({ name: `Tool: ${toolFn.name}` });
    logger.debug(`Invoked with input:`, input);
    const output = await tool(input);
    logger.debug(`Result:`, output);
    return JSON.stringify(output);
  };
}
```

### Tool Intent Message Examples Based on Uniswap Implementation

#### Portfolio Analysis Tool

```typescript
// Tool function returns MessageContent[]
const analyzePortfolioToolFn: ToolFn = () => {
  return async ({ walletAddress, strategy }): Promise<ToolOutputValue[]> => {
    // ... implementation logic ...

    return [
      {
        type: 'text',
        content: `
## Detailed Portfolio Analysis

**Total Value:** $${totalValue.toFixed(2)}
**Risk Level:** ${riskLevel}
**Stablecoin Allocation:** ${stablecoinPercentage.toFixed(1)}%
**Largest Position:** ${largestTokenPercentage.toFixed(1)}% of portfolio

### Analysis & Recommendation
${detailedReason}
`,
      },
    ];
  };
};
```

#### Portfolio Rebalancing Tool

```typescript
const analyzeAndSuggestRebalance: ToolFn = () => {
  return async ({ walletAddress, strategy }): Promise<ToolOutputValue[]> => {
    // ... implementation logic ...

    return [
      {
        type: 'text',
        content: `
## Portfolio Rebalance Recommendation

I suggest swapping **${tokenAmount.toFixed(6)} ${fromToken.symbol}** (about $${valueToSwap.toFixed(2)}, ${swapPercentage}% of your ${fromToken.symbol} holdings) to **${toToken.symbol}**.

### Strategic Analysis
${analysis.detailedReason}

### Execute the Swap
You can execute this swap on Uniswap: ${uniswapLink}
`,
      },
      {
        type: 'uniswap:swap',
        content: {
          fromToken,
          toToken,
          amount: tokenAmount,
          link: uniswapLink,
        },
      },
    ];
  };
};
```

#### Liquidity Provider Tool

```typescript
const analyzeAndSuggestLiquidityPools: ToolFn = () => {
  return async ({ walletAddress }): Promise<ToolOutputValue[]> => {
    // ... implementation logic ...

    return [
      {
        type: 'text',
        content: `
## Liquidity Provision Recommendation

I recommend providing liquidity to the **${tokenA.symbol}/${tokenB.symbol}** pool on Uniswap.

### Key Details
- **Total Value:** $${totalValueLocked.toFixed(2)}
- **Token Amounts:** ${tokenAmountA?.toFixed(6)} ${tokenA.symbol} + ${tokenAmountB?.toFixed(6)} ${tokenB.symbol}
- **Risk Level:** ${overallRisk}
- **Estimated APR:** ${expectedAPR?.toFixed(1)}%

### Provide Liquidity
You can provide liquidity to this pool directly on Uniswap:
@${uniswapLink}
`,
      },
    ];
  };
};
```

#### Suggest Swap Tool

```typescript
const suggestSwap: ToolFn = () => {
  return async ({ fromToken, toToken, amount, chain, reason }): Promise<ToolOutputValue[]> => {
    // ... implementation logic ...

    return [
      {
        type: 'text',
        content: `
## Swap Recommendation

I suggest swapping **${tokenAmount ? tokenAmount.toFixed(6) : '?'} ${fromToken.symbol}** (about $${valueToSwap.toFixed(2)}) to **${toToken.symbol}**.

### Why make this swap?
${reason}

You can execute this swap on Uniswap:
@${uniswapLink}
`,
      },
      {
        type: 'onchainkit:swap',
        content: {
          fromToken,
          toToken,
          amount: tokenAmount || 0,
          link: uniswapLink,
        },
      },
    ];
  };
};
```

### Tool Message Grouping Rules

1. **Sequential Grouping**: Tool messages are grouped with the preceding agent text message
2. **Intent Continuity**: Tools with related intents should be grouped together
3. **Execution Order**: Tools are executed and grouped in the order they were called
4. **Error Handling**: Failed tool executions must include error information in the result

### Tool Message Display Guidelines

```typescript
// Tool messages should be displayed with clear intent indicators
const renderToolMessage = (toolMessage: ParsedMessage) => {
  return {
    type: toolMessage.type,
    content: toolMessage.content,
    // Additional metadata as needed
  };
};
```

## Message Flow Architecture

### 1. Client-Side Message Processing (ChatMessageView.tsx)

#### Message Grouping Logic

```typescript
// Groups agent text messages with ALL their following tool messages
const groupedMessages = React.useMemo(() => {
  const grouped: Array<{
    message: ParsedMessage;
    toolMessages: ParsedMessage[];
  }> = [];

  for (let i = 0; i < visibleMessages.length; i++) {
    const currentMessage = visibleMessages[i];

    // Skip standalone tool messages (they'll be grouped with agent messages)
    if (currentMessage.sender === 'assistant' && currentMessage.type !== 'text') {
      continue;
    }

    // For agent text messages, collect ALL following tool messages
    if (currentMessage.sender === 'assistant' && currentMessage.type === 'text') {
      const toolMessages: ParsedMessage[] = [];

      // Look ahead for consecutive tool messages from the same agent
      let j = i + 1;
      while (j < visibleMessages.length) {
        const nextMessage = visibleMessages[j];

        // If it's an agent message but not text, it's a tool message
        if (nextMessage.sender === 'assistant' && nextMessage.type !== 'text') {
          toolMessages.push(nextMessage);
          j++;
        } else {
          // Stop when we hit a user message or another agent text message
          break;
        }
      }

      grouped.push({
        message: currentMessage,
        toolMessages,
      });
    }
  }
}, [visibleMessages]);
```

#### Performance Optimizations

- **Pagination**: Shows `MESSAGES_PER_PAGE = 5` messages initially
- **Lazy Loading**: "Load previous messages" button for older messages
- **Memoization**: Uses `React.useMemo` for expensive computations
- **Efficient Rendering**: Groups messages to reduce re-renders

### 2. Real-time State Management

#### Client-Side States

- `isAgentThinking`: Shows "Thinking..." indicator during agent processing
- `isScrollingToBottom`: Auto-scrolls to latest messages
- `isLoadingMessages`: Shows loading state for conversation history
- `visibleMessageCount`: Tracks how many messages are currently visible

#### Avatar Display Logic

```typescript
const shouldShowAvatar = (message: ParsedMessage, previousMessage: ParsedMessage | null) => {
  if (!previousMessage) return true;
  if (message.sender !== previousMessage.sender) return true;
  if (message.created_at && previousMessage.created_at) {
    const timeDiff =
      new Date(message.created_at).getTime() - new Date(previousMessage.created_at).getTime();
    return timeDiff > 600000; // 10 minutes in milliseconds
  }
  return false;
};
```

## Backend Integration Points

### 1. Multi-Agent System Coordination

- **Web3 Agent**: Provides blockchain data and DeFi protocol information
- **Growly Agent**: Handles smart contract interactions and transactions
- **Search Agent**: Retrieves web information and documentation
- **Supervisor Workflow Crafter**: Orchestrates agent responses and tool executions

### 2. Message Delivery Pipeline

1. **User Input**: Sent to Supervisor Workflow Crafter
2. **Agent Selection**: Supervisor determines which agent(s) to engage
3. **Tool Execution**: Agents execute tools (blockchain calls, searches, etc.)
4. **Response Generation**: Agents generate text responses
5. **Message Grouping**: Backend groups text responses with tool messages
6. **Real-time Delivery**: Messages sent to client via WebSocket

### 3. Memory Integration

- **pgvector Database**: Stores agent memory and conversation context
- **Vector Embeddings**: Used for context retrieval and response generation
- **Memory Retrieval**: Affects message context and agent responses

## Optimization Requirements for Task 1.1

### Backend Optimizations Needed

1. **Message Processing**: Efficient delivery of messages to ChatMessageView component
2. **Tool Message Handling**: Proper grouping of agent tool executions
3. **Real-time Coordination**: WebSocket optimization for live updates
4. **Memory Retrieval**: Optimize pgvector queries for message context

### Performance Targets

- **Response Time**: Sub-second agent responses
- **Message Grouping**: Efficient grouping of text and tool messages
- **Real-time Updates**: Smooth WebSocket delivery
- **Memory Access**: Fast pgvector queries for context retrieval

### MCP Server Integration

- **Document Knowledge**: Enhance agent responses with uploaded document content
- **Knowledge Retrieval**: Efficient access to document-based knowledge
- **Context Integration**: Seamless integration with existing message flow

## Technical Constraints

### Client-Side Constraints

- **React Performance**: Efficient rendering of grouped messages
- **Memory Usage**: Handle large conversation histories
- **Real-time Updates**: Smooth WebSocket integration
- **Mobile Responsiveness**: Optimize for mobile devices

### Backend Constraints

- **Database Performance**: Efficient pgvector queries
- **WebSocket Scalability**: Handle multiple concurrent conversations
- **Agent Coordination**: Efficient multi-agent orchestration
- **Tool Execution**: Fast execution of agent tools

## Integration Points for Development

### For Backend Development Agent (Task 1.1)

1. **Message Delivery Optimization**: Ensure efficient message flow to client
2. **Tool Message Processing**: Optimize grouping of agent tool executions
3. **Memory Retrieval**: Optimize pgvector queries for message context
4. **MCP Server Integration**: Integrate document knowledge into message flow

### For Frontend Development Agent

1. **Message Rendering**: Optimize ChatMessageView component performance
2. **Real-time Updates**: Ensure smooth WebSocket integration
3. **Mobile Optimization**: Improve mobile device performance
4. **Loading States**: Optimize loading and thinking indicators

## Success Criteria

- **Message Delivery**: Sub-second message delivery to client
- **Tool Grouping**: Accurate grouping of agent tool executions
- **Memory Performance**: Fast context retrieval from pgvector
- **Real-time Updates**: Smooth WebSocket message delivery
- **MCP Integration**: Seamless document knowledge integration

## Future Considerations

- **Scalability**: Handle growing conversation volumes
- **Multi-language Support**: Internationalization of messages
- **Advanced Grouping**: More sophisticated message grouping algorithms
- **Analytics Integration**: Message flow analytics and insights
