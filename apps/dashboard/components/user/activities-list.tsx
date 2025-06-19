'use client';

import { consumePersona } from '@/core/persona';

import { ParsedUser } from '@getgrowly/core';

import { ActivityPreview } from './activity-preview';

interface ActivitiesListProps {
  user: ParsedUser;
  limit?: number;
}

/**
 * Component for displaying a user's activity history in a list format
 */
export function ActivitiesList({ user, limit = 5 }: ActivitiesListProps) {
  const userPersona = consumePersona(user);
  const activities = userPersona.universalTransactions().slice(0, limit);

  if (activities.length === 0) {
    return <p className="text-sm text-muted-foreground">No recent activity</p>;
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <ActivityPreview key={index} activity={activity} userId={user.id} variant="expanded" />
      ))}
    </div>
  );
}
