import { UserDirectoryLayout } from '@/app/dashboard/users/inner';
import { useSelectedAgentUsersEffect } from '@/hooks/use-agent-effect';

export function AgentUsers() {
  const { agentUsers, status } = useSelectedAgentUsersEffect();
  return (
    <UserDirectoryLayout users={agentUsers} loading={status === 'loading'} importEnabled={false} />
  );
}
