import { UserDirectoryLayout } from '@/app/dashboard/users/inner';
import { useSelectedAgentUsersEffect } from '@/hooks/use-agent-effect';

export function AgentUsers() {
  const {
    agentUsers,
    agentUserStatus,
    loadMoreUsers,
    hasMoreUsers,
    isLoadingMore,
    totalUsers,
    refresh,
  } = useSelectedAgentUsersEffect(20);
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
