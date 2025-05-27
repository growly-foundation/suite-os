import { MessageContent } from '@getgrowly/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { CallbackManagerForToolRun } from '@langchain/core/callbacks/manager';
import { RunnableConfig } from '@langchain/core/runnables';
import { DynamicStructuredTool } from '@langchain/core/tools';

export interface ToolInput {
  [key: string]: { description: string; required?: boolean };
}
export type ToolOutputDescription = Omit<MessageContent, 'content'> & { description: string };
export type ToolOutputValue = MessageContent;
export type ToolFn = (configService?: ConfigService) => (input: any) => Promise<ToolOutputValue[]>;

export const makeToolDescription = ({
  description,
  condition,
  input,
  output,
}: {
  description: string;
  condition?: string;
  input?: ToolInput;
  output: ToolOutputDescription[];
}) => {
  return `
${description}

${condition}

Input:
${
  input
    ? Object.entries(input)
        .map(
          ([key, { description, required }]) =>
            `- ${key}: ${description} ${required ? '(required)' : ''}`
        )
        .join('\n')
    : ''
}

Output:
${makeToolOutput(output as any)}
`;
};

export const makeToolOutput = (output: ToolOutputValue[]) => {
  return JSON.parse(JSON.stringify(output));
};

export function buildTool(toolFn: ToolFn, configService?: ConfigService) {
  const tool = configService ? toolFn(configService) : toolFn();
  return async (
    input: any,
    _runManager?: CallbackManagerForToolRun,
    _config?: RunnableConfig
  ): Promise<string> => {
    const logger = new Logger(`Tool: ${toolFn.name}`);
    logger.debug(`Invoked with input:`, input);
    const output = await tool(input);
    logger.debug(`Result:`, output);
    return JSON.stringify(output);
  };
}

export function collectTools(
  tools: Record<string, DynamicStructuredTool>
): DynamicStructuredTool[] {
  return Object.values(tools);
}
