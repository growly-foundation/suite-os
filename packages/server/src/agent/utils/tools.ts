export const makeToolDescription = ({
  description,
  condition,
  input,
  output,
}: {
  description: string;
  condition?: string;
  input?: Record<string, { description: string; required?: boolean }>;
  output: Record<string, { description: string }>;
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
${Object.entries(output).map(([key, { description }]) => `- ${key}: ${description}`)}
`;
};
