import { UserDirectoryLayout } from '@/app/dashboard/users/inner';
import { useSelectedAgentUsersEffect } from '@/hooks/use-agent-effect';

export function AgentUsers() {
  const { agentUsers, agentUserStatus } = useSelectedAgentUsersEffect();
  return <UserDirectoryLayout users={agentUsers} loading={agentUserStatus === 'loading'} />;
}
