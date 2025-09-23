import { UserDirectoryLayout } from '@/app/dashboard/users/inner';
import { useAgentUsersInfinite } from '@/hooks/use-agent-effect';

export function AgentUsers({ agentId }: { agentId: string }) {
  const {
    agentUsers,
    agentUserStatus,
    loadMoreUsers,
    hasMoreUsers,
    isLoadingMore,
    totalUsers,
    refresh,
  } = useAgentUsersInfinite(agentId, 20);

  return (
    <UserDirectoryLayout
      users={agentUsers}
      loading={agentUserStatus === 'loading'}
      importEnabled={true}
      hasMoreUsers={hasMoreUsers}
      isLoadingMore={isLoadingMore}
      onLoadMore={loadMoreUsers}
      totalUsers={totalUsers}
      refresh={refresh}
    />
  );
}
