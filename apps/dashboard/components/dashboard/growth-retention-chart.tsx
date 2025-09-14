'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardState } from '@/hooks/use-dashboard';
import { useDashboardDataQueries } from '@/hooks/use-dashboard-queries';
import { Users } from 'lucide-react';
import moment from 'moment';
import { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { TimeRange } from '../ui/time-range-selector';

interface GrowthRetentionChartProps {
  className?: string;
  timeRange?: TimeRange;
}

export function GrowthRetentionChart({ className, timeRange }: GrowthRetentionChartProps) {
  const { selectedOrganization } = useDashboardState();
  const {
    data: { users },
  } = useDashboardDataQueries(selectedOrganization?.id);

  // Calculate growth and retention data
  const chartData = useMemo(() => {
    if (!users || users.length === 0) {
      return [];
    }

    // Filter users based on time range if provided
    let filteredUsers = users;
    if (timeRange) {
      filteredUsers = users.filter(user => {
        const createdAt = moment(user.created_at);
        return createdAt.isBetween(timeRange.startDate, timeRange.endDate, 'day', '[]');
      });
    }

    // Determine if we should show daily or monthly data
    const showDaily = timeRange?.id === '7d' || timeRange?.id === '30d';
    const dateFormat = showDaily ? 'YYYY-MM-DD' : 'YYYY-MM';
    const displayFormat = showDaily ? 'MMM DD' : 'MMM YYYY';

    // Group users by date/month
    const groupedData: Record<string, { newUsers: number; retainedUsers: number }> = {};

    filteredUsers.forEach(user => {
      const createdAt = moment(user.created_at);
      const dateKey = createdAt.format(dateFormat);

      if (!groupedData[dateKey]) {
        groupedData[dateKey] = { newUsers: 0, retainedUsers: 0 };
      }

      groupedData[dateKey].newUsers++;
    });

    // Calculate retention
    const retentionPeriod = showDaily ? 7 : 30; // 7 days retention for daily view, 30 days for monthly
    const retentionDate = moment().subtract(retentionPeriod, 'days');

    filteredUsers.forEach(user => {
      const createdAt = moment(user.created_at);
      const dateKey = createdAt.format(dateFormat);

      if (createdAt.isBefore(retentionDate)) {
        if (groupedData[dateKey]) {
          groupedData[dateKey].retainedUsers++;
        }
      }
    });

    // If showing daily data, ensure all days in range have entries
    if (showDaily && timeRange) {
      let currentDate = moment(timeRange.startDate);
      const endDate = moment(timeRange.endDate);

      while (currentDate.isSameOrBefore(endDate, 'day')) {
        const dateKey = currentDate.format(dateFormat);
        if (!groupedData[dateKey]) {
          groupedData[dateKey] = { newUsers: 0, retainedUsers: 0 };
        }
        currentDate = currentDate.add(1, 'day');
      }
    }

    // Convert to array and sort by date
    return Object.entries(groupedData)
      .map(([date, data]) => ({
        date: moment(date).format(displayFormat),
        newUsers: data.newUsers,
        retentionRate: data.newUsers > 0 ? (data.retainedUsers / data.newUsers) * 100 : 0,
      }))
      .sort(
        (a, b) => moment(a.date, displayFormat).valueOf() - moment(b.date, displayFormat).valueOf()
      );
  }, [users, timeRange]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    if (chartData.length === 0) return { totalGrowth: 0, avgRetention: 0, growthTrend: 0 };

    const totalGrowth = chartData.reduce((sum, item) => sum + item.newUsers, 0);
    const avgRetention =
      chartData.reduce((sum, item) => sum + item.retentionRate, 0) / chartData.length;

    // Calculate growth trend (comparing last 3 months vs previous 3 months)
    const recentMonths = chartData.slice(-3);
    const previousMonths = chartData.slice(-6, -3);

    const recentGrowth = recentMonths.reduce((sum, item) => sum + item.newUsers, 0);
    const previousGrowth = previousMonths.reduce((sum, item) => sum + item.newUsers, 0);
    const growthTrend =
      previousGrowth > 0 ? ((recentGrowth - previousGrowth) / previousGrowth) * 100 : 0;

    return { totalGrowth, avgRetention, growthTrend };
  }, [chartData]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">User Growth & Retention</CardTitle>
            <CardDescription className="text-xs">
              {timeRange ? `${timeRange.label} - ` : ''}Monthly new user signups and retention rates
            </CardDescription>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              <span className="text-muted-foreground">New Users</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
              <span className="text-muted-foreground">Retention Rate</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="space-y-4">
            {/* Summary Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{summaryMetrics.totalGrowth}</div>
                <div className="text-xs text-muted-foreground">Total New Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {summaryMetrics.avgRetention.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Avg Retention</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${summaryMetrics.growthTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summaryMetrics.growthTrend >= 0 ? '+' : ''}
                  {summaryMetrics.growthTrend.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Growth Trend</div>
              </div>
            </div>

            {/* Chart */}
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={value => {
                      const isDaily = timeRange?.id === '7d' || timeRange?.id === '30d';
                      return isDaily
                        ? moment(value, 'MMM DD').format('DD')
                        : moment(value, 'MMM YYYY').format('MMM');
                    }}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => {
                      return [name === 'New Users' ? value : `${value}%`, name];
                    }}
                    labelFormatter={label => {
                      const isDaily = timeRange?.id === '7d' || timeRange?.id === '30d';
                      return isDaily ? `Date: ${label}` : `Month: ${label}`;
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="newUsers"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    name="New Users"
                  />
                  <Line
                    type="monotone"
                    dataKey="retentionRate"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="5 5"
                    name="Retention Rate (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {timeRange ? 'No data available for selected time range' : 'No user data available'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
