"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { ActivityType, ActivityRecord } from "@/lib/store";
import { AnalysisHistoryItem } from "@/lib/types";

const emptyUsageTrendData: { name: string; analyses: number; searches: number }[] = [];

const emptyPerformanceData: { name: string; analyses: number; avgConfidence: number }[] = [];

const COLORS = [
  "#06b6d4",
  "#8b5cf6",
  "#f59e0b",
  "#f43f5e",
  "#14b8a6",
];

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

function ChartCard({ title, description, children, className }: ChartCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-card p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1",
        className,
      )}
    >
      <div className="mb-4 animate-fadeIn">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card/95 p-3 shadow-md backdrop-blur-sm">
        <p className="font-medium text-card-foreground">{label}</p>
        {payload.map((entry, index) => (
          <p
            key={index}
            className="text-sm"
            style={{ color: entry.color }}
          >
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

interface UsageTrendChartProps {
  className?: string;
  data?: { name: string; analyses: number; searches: number }[];
}

export function UsageTrendChart({ className, data }: UsageTrendChartProps) {
  const chartData = data && data.length > 0 ? data : emptyUsageTrendData;

  const totalAnalyses = chartData.reduce((sum, item) => sum + item.analyses, 0);
  const totalSearches = chartData.reduce((sum, item) => sum + item.searches, 0);

  return (
    <ChartCard
      title="Activity Trend"
      description="Daily activity over the past week"
      className={className}
    >
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border/50"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "16px" }}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
            <Line
              type="monotone"
              dataKey="analyses"
              name="Analyses"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={{ fill: "var(--chart-1)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="searches"
              name="Searches"
              stroke="var(--chart-2)"
              strokeWidth={2}
              dot={{ fill: "var(--chart-2)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {totalAnalyses === 0 && totalSearches === 0 && (
        <p className="text-sm text-muted-foreground text-center mt-2">
          No activity data yet. Start using the app to see trends.
        </p>
      )}
    </ChartCard>
  );
}

interface PerformanceChartProps {
  className?: string;
  data?: { name: string; analyses: number; avgConfidence: number }[];
}

export function PerformanceChart({ className, data }: PerformanceChartProps) {
  const chartData = data && data.length > 0 ? data : emptyPerformanceData;

  const totalAnalyses = chartData.reduce((sum, item) => sum + item.analyses, 0);
  const avgConfidence = totalAnalyses > 0
    ? chartData.reduce((sum, item) => sum + (item.avgConfidence || 0), 0) / chartData.filter(d => d.avgConfidence > 0).length || 0
    : 0;

  return (
    <ChartCard
      title="Weekly Performance"
      description="Analyses and average confidence by week"
      className={className}
    >
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border/50"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
              label={{ value: "Analyses", angle: -90, position: "insideLeft" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
              domain={[0, 100]}
              label={{ value: "Confidence %", angle: 90, position: "insideRight" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "16px" }}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
            <Bar
              yAxisId="left"
              dataKey="analyses"
              name="Analyses"
              fill="var(--chart-1)"
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="avgConfidence"
              name="Avg Confidence"
              stroke="var(--chart-2)"
              strokeWidth={2}
              dot={{ fill: "var(--chart-2)", strokeWidth: 2, r: 4 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {totalAnalyses === 0 && (
        <p className="text-sm text-muted-foreground text-center mt-2">
          No performance data yet. Start analyzing to see metrics.
        </p>
      )}
    </ChartCard>
  );
}

interface ActivityDistributionChartProps {
  className?: string;
  data?: { name: string; value: number }[];
}

export function ActivityDistributionChart({ className, data }: ActivityDistributionChartProps) {
  const emptyDistribution: { name: string; value: number }[] = [];

  const chartData = data && data.length > 0 ? data : emptyDistribution;
  const hasData = chartData.some(d => d.value > 0);

  return (
    <ChartCard
      title="Activity Distribution"
      description="Breakdown of activity types"
      className={className}
    >
      <div className="h-[300px] w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                  if (cx === undefined || cy === undefined || midAngle === undefined || outerRadius === undefined) {
                    return null;
                  }
                  const radius = outerRadius * 1.1;
                  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

                  return (
                    <text
                      x={x}
                      y={y}
                      fill="var(--foreground)"
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                      fontSize={12}
                    >
                      {`${((percent || 0) * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: "16px" }}
                formatter={(value) => (
                  <span className="text-sm text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No activity data yet</p>
          </div>
        )}
      </div>
    </ChartCard>
  );
}

interface CategoryBreakdownChartProps {
  className?: string;
  data?: { name: string; value: number }[];
}

export function CategoryBreakdownChart({ className, data }: CategoryBreakdownChartProps) {
  const chartData = data && data.length > 0 ? data : [];

  return (
    <ChartCard
      title="Top Categories"
      description="Most frequently identified categories"
      className={className}
    >
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{
              top: 5,
              right: 30,
              left: 40,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border/50"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              name="Count"
              fill="var(--chart-1)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

interface AnalyticsChartsProps {
  className?: string;
  usageData?: { name: string; analyses: number; searches: number }[];
  performanceData?: { name: string; analyses: number; avgConfidence: number }[];
  distributionData?: { name: string; value: number }[];
  categoryData?: { name: string; value: number }[];
}

export function AnalyticsCharts({ className, usageData, performanceData, distributionData, categoryData }: AnalyticsChartsProps) {
  return (
    <div className={cn("grid gap-6 md:grid-cols-2", className)}>
      <div className="min-h-[250px] sm:min-h-[300px]">
        <UsageTrendChart data={usageData} />
      </div>
      <div className="min-h-[250px] sm:min-h-[300px]">
        <PerformanceChart data={performanceData} />
      </div>
      {distributionData && distributionData.length > 0 && (
        <div className="min-h-[250px] sm:min-h-[300px]">
          <ActivityDistributionChart data={distributionData} />
        </div>
      )}
      {categoryData && categoryData.length > 0 && (
        <div className="min-h-[250px] sm:min-h-[300px]">
          <CategoryBreakdownChart data={categoryData} />
        </div>
      )}
    </div>
  );
}

const getTimestampValue = (item: AnalysisHistoryItem): number => {
  const ts = item.timestamp;
  if (ts instanceof Date) {
    return ts.getTime();
  }
  return new Date(ts).getTime();
};

const getActivityRecordTimestampValue = (activity: ActivityRecord): number => {
  const ts = activity.timestamp;
  if (ts instanceof Date) {
    return ts.getTime();
  }
  return new Date(ts).getTime();
};

export function transformHistoryToUsageData(
  history: AnalysisHistoryItem[],
  activities?: ActivityRecord[]
): { name: string; analyses: number; searches: number }[] {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const result: { name: string; analyses: number; searches: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const dayAnalyses = history.filter(
      (item) => {
        const ts = getTimestampValue(item);
        return ts >= date.getTime() && ts < nextDate.getTime();
      }
    );

    let searchesCount = 0;
    if (activities && activities.length > 0) {
      const daySearchActivities = activities.filter(
        (activity) => {
          const ts = getActivityRecordTimestampValue(activity);
          return ts >= date.getTime() && ts < nextDate.getTime() && activity.type === "search";
        }
      );
      searchesCount = daySearchActivities.length;
    }

    result.push({
      name: days[date.getDay()],
      analyses: dayAnalyses.length,
      searches: searchesCount,
    });
  }

  return result;
}

export function transformActivitiesToUsageData(activities: ActivityRecord[]): { name: string; analyses: number; searches: number }[] {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const result: { name: string; analyses: number; searches: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const dayActivities = activities.filter(
      (activity) => {
        const ts = getActivityRecordTimestampValue(activity);
        return ts >= date.getTime() && ts < nextDate.getTime();
      }
    );

    const analysesCount = dayActivities.filter(a => a.type === "analysis").length;
    const searchesCount = dayActivities.filter(a => a.type === "search").length;

    result.push({
      name: days[date.getDay()],
      analyses: analysesCount,
      searches: searchesCount,
    });
  }

  return result;
}

export function transformActivitiesToPerformanceData(activities: ActivityRecord[]): { name: string; analyses: number; avgConfidence: number }[] {
  const weeks = ["4 Weeks Ago", "3 Weeks Ago", "2 Weeks Ago", "Last Week", "This Week"];
  const today = new Date();
  const result: { name: string; analyses: number; avgConfidence: number }[] = [];

  for (let i = 4; i >= 0; i--) {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - (i * 7) - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekActivities = activities.filter(
      (activity) => {
        const ts = getActivityRecordTimestampValue(activity);
        return ts >= weekStart.getTime() && ts < weekEnd.getTime();
      }
    );

    const analysesCount = weekActivities.filter(a => a.type === "analysis").length;
    const activitiesWithConfidence = weekActivities.filter(a => a.details?.confidence !== undefined);
    const avgConfidence = activitiesWithConfidence.length > 0
      ? activitiesWithConfidence.reduce((sum, a) => sum + (Number(a.details?.confidence) || 0), 0) / activitiesWithConfidence.length * 100
      : 0;

    result.push({
      name: weeks[4 - i],
      analyses: analysesCount,
      avgConfidence: Math.round(avgConfidence),
    });
  }

  return result;
}

export function transformHistoryToPerformanceData(history: AnalysisHistoryItem[]): { name: string; analyses: number; avgConfidence: number }[] {
  const weeks = ["4 Weeks Ago", "3 Weeks Ago", "2 Weeks Ago", "Last Week", "This Week"];
  const today = new Date();
  const result: { name: string; analyses: number; avgConfidence: number }[] = [];

  for (let i = 4; i >= 0; i--) {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - (i * 7) - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekActivities = history.filter(
      (item) => {
        const ts = getTimestampValue(item);
        return ts >= weekStart.getTime() && ts < weekEnd.getTime();
      }
    );

    const avgConfidence = weekActivities.length > 0
      ? weekActivities.reduce((sum, item) => sum + item.confidence, 0) / weekActivities.length * 100
      : 0;

    result.push({
      name: weeks[4 - i],
      analyses: weekActivities.length,
      avgConfidence: Math.round(avgConfidence),
    });
  }

  return result;
}
