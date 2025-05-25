import { MessageContent } from '@getgrowly/core';
import { ConfigService } from '@nestjs/config';

export interface ToolInput {
  [key: string]: { description: string; required?: boolean };
}
export type ToolOutputDescription = Omit<MessageContent, 'content'> & { description: string };
export type ToolOutputValue = MessageContent;
export type ToolFn = (configService: ConfigService) => (input: any) => Promise<ToolOutputValue[]>;

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
