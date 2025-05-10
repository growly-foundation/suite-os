import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Agent } from '@growly/core';

const calculateAvatarNumber = (str: string, max: number): number => {
  const num =
    (str
      .split('')
      .map(v => v.charCodeAt(0))
      .reduce((p, c) => p + c, 0) %
      max) +
    1;
  return num;
};

export const AgentAvatar = ({
  agent,
  width = 40,
  height = 40,
}: {
  agent: Agent;
  width?: number;
  height?: number;
}) => {
  return (
    <Avatar style={{ width, height }}>
      <AvatarImage
        src={`/agent-avatars/agent-avatar-${calculateAvatarNumber(agent.name, 7)}.webp`}
      />
      <AvatarFallback>{agent.name}</AvatarFallback>
    </Avatar>
  );
};
