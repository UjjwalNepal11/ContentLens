"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { AnalyticsCharts, transformHistoryToUsageData, transformHistoryToPerformanceData } from "@/components/charts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  CheckCircle,
  Zap,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalysisHistoryItem } from "@/lib/types";

export const dynamic = 'force-dynamic';

interface AnalyticsData {
  totalAnalyses: number;
  avgConfidence: number;
  uniqueCategories: number;
  todayAnalyses: number;
  mostActiveDay: string;
  analysesTrend: string;
  analysesTrendUp: boolean;
  avgPerDay: string;
  activities: Array<{
    id: string;
    type: string;
    timestamp: Date;
    details?: Record<string, unknown>;
  }>;
}

const getAnalysisTimestamp = (item: AnalysisHistoryItem): number => {
  const ts = item.timestamp;
  if (ts instanceof Date) {
    return ts.getTime();
  }
  return new Date(ts).getTime();
};

const timestampGreaterOrEqual = (item: AnalysisHistoryItem, date: Date): boolean => {
  return getAnalysisTimestamp(item) >= date.getTime();
};

const timestampBetween = (item: AnalysisHistoryItem, start: Date, end: Date): boolean => {
  const ts = getAnalysisTimestamp(item);
  return ts >= start.getTime() && ts < end.getTime();
};

export default function AnalyticsPage() {

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [historyItems, setHistoryItems] = useState<AnalysisHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const fetchAnalyticsData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await fetch('/api/history?analytics=true');
      const result = await response.json();

      if (result.success) {

        if (result.analytics) {
          setAnalyticsData({
            ...result.analytics,
            activities: result.analytics.activities || [],
          });
        }

        if (result.analytics?.allAnalyses) {
          setHistoryItems(result.analytics.allAnalyses.map((item: any) => ({
            id: item.id,
            text: item.text,
            analysis: item.analysis,
            confidence: item.confidence,
            categories: item.categories || [],
            analysisType: item.analysisType || 'general',
            timestamp: new Date(item.timestamp),
          })));
        } else if (result.data) {

          setHistoryItems(result.data.map((item: any) => ({
            id: item.id,
            text: item.text,
            analysis: item.analysis,
            confidence: item.confidence,
            categories: item.categories || [],
            analysisType: item.analysisType || 'general',
            timestamp: new Date(item.timestamp),
          })));
        }
      } else {
        setError(result.error || 'Failed to fetch analytics data');
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to fetch analytics data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      fetchAnalyticsData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [mounted, fetchAnalyticsData]);

  const handleReset = () => {

    setShowResetConfirm(true);
  };

  const confirmReset = async () => {
    try {

      const response = await fetch('/api/analytics/reset', {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {

        setAnalyticsData(null);
        setHistoryItems([]);

        setResetMessage(result.message || "Analytics data has been reset successfully");
        setTimeout(() => setResetMessage(""), 3000);
      } else {
        console.error('Failed to reset analytics:', result.error);
        setError(result.error || 'Failed to reset analytics data');
      }
    } catch (err) {
      console.error('Failed to reset analytics:', err);
      setError('Failed to reset analytics data');
    } finally {
      setShowResetConfirm(false);
    }
  };

  const cancelReset = () => {
    setShowResetConfirm(false);
  };

  const isReady = mounted;

  const analysisItems = useMemo(() => {
    return historyItems;
  }, [historyItems]);

  const totalAnalyses = analyticsData?.totalAnalyses ?? analysisItems.length;

  const hasAnalyticsData = totalAnalyses > 0 || historyItems.length > 0;

  const avgConfidence = useMemo(() => {
    if (analyticsData?.avgConfidence !== undefined) {
      return analyticsData.avgConfidence;
    }
    const itemsWithConfidence = analysisItems.filter(
      (a) => a.confidence !== undefined && a.confidence > 0
    );
    if (itemsWithConfidence.length === 0) return 0;
    return itemsWithConfidence.reduce(
      (acc, a) => acc + a.confidence,
      0
    ) / itemsWithConfidence.length;
  }, [analysisItems, analyticsData]);

  const allCategories = useMemo(() => {
    return analysisItems.flatMap(a => a.categories || []);
  }, [analysisItems]);
  const uniqueCategories = analyticsData?.uniqueCategories ?? [...new Set(allCategories)].length;

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    allCategories.forEach(cat => {
      if (cat) counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [allCategories]);

  const { trend: categoriesTrend, trendUp: categoriesTrendUp } = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const twentyOneDaysAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);

    const thisPeriodActivities = analysisItems.filter(a => timestampGreaterOrEqual(a, sevenDaysAgo));
    const lastPeriodActivities = analysisItems.filter(a => timestampBetween(a, fourteenDaysAgo, sevenDaysAgo));
    const previousPeriodActivities = analysisItems.filter(a => timestampBetween(a, twentyOneDaysAgo, fourteenDaysAgo));

    const thisPeriodCategories = [...new Set(thisPeriodActivities.flatMap(a => a.categories || []))];
    const lastPeriodCategories = [...new Set(lastPeriodActivities.flatMap(a => a.categories || []))];
    const previousPeriodCategories = [...new Set(previousPeriodActivities.flatMap(a => a.categories || []))];

    const thisPeriodCount = thisPeriodCategories.length;
    const lastPeriodCount = lastPeriodCategories.length;
    const previousPeriodCount = previousPeriodCategories.length;

    if (thisPeriodCount === 0) {
      return { trend: "0%", trendUp: false };
    }

    if (lastPeriodCount === 0 && previousPeriodCount > 0) {
      if (previousPeriodCount === 0) return { trend: "+100%", trendUp: true };
      const percentChange = ((thisPeriodCount - previousPeriodCount) / previousPeriodCount) * 100;
      return {
        trend: `${percentChange >= 0 ? "+" : ""}${percentChange.toFixed(0)}%`,
        trendUp: percentChange >= 0
      };
    }

    if (lastPeriodCount === 0) {
      return { trend: "+100%", trendUp: true };
    }

    const percentChange = ((thisPeriodCount - lastPeriodCount) / lastPeriodCount) * 100;
    return {
      trend: `${percentChange >= 0 ? "+" : ""}${percentChange.toFixed(0)}%`,
      trendUp: percentChange >= 0
    };
  }, [analysisItems]);

  const analysisTypes = analysisItems
    .filter(a => a.analysisType)
    .map(a => a.analysisType || "");
  const uniqueAnalysisTypes = [...new Set(analysisTypes)].length;

  const { trend: analysesTrend, trendUp: analysesTrendUp } = useMemo(() => {
    if (analyticsData?.analysesTrend) {
      return {
        trend: analyticsData.analysesTrend,
        trendUp: analyticsData.analysesTrendUp,
      };
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const twentyOneDaysAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);

    const thisPeriod = analysisItems.filter(a => timestampGreaterOrEqual(a, sevenDaysAgo)).length;

    const lastPeriod = analysisItems.filter(a => timestampBetween(a, fourteenDaysAgo, sevenDaysAgo)).length;

    const previousPeriod = analysisItems.filter(a => timestampBetween(a, twentyOneDaysAgo, fourteenDaysAgo)).length;

    if (thisPeriod === 0) {
      return { trend: "0%", trendUp: false };
    }

    if (lastPeriod === 0 && previousPeriod > 0) {
      if (previousPeriod === 0) return { trend: "+100%", trendUp: true };
      const percentChange = ((thisPeriod - previousPeriod) / previousPeriod) * 100;
      return {
        trend: `${percentChange >= 0 ? "+" : ""}${percentChange.toFixed(0)}%`,
        trendUp: percentChange >= 0
      };
    }

    if (lastPeriod === 0) {
      return { trend: "+100%", trendUp: true };
    }

    const percentChange = ((thisPeriod - lastPeriod) / lastPeriod) * 100;
    return {
      trend: `${percentChange >= 0 ? "+" : ""}${percentChange.toFixed(0)}%`,
      trendUp: percentChange >= 0
    };
  }, [analysisItems, analyticsData]);

  const { trend: confidenceTrend, trendUp: confidenceTrendUp } = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const twentyOneDaysAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);

    const thisPeriodItems = analysisItems.filter(a => timestampGreaterOrEqual(a, sevenDaysAgo));
    const lastPeriodItems = analysisItems.filter(a => timestampBetween(a, fourteenDaysAgo, sevenDaysAgo));
    const previousPeriodItems = analysisItems.filter(a => timestampBetween(a, twentyOneDaysAgo, fourteenDaysAgo));

    const thisPeriodAvg = thisPeriodItems.length > 0
      ? thisPeriodItems.reduce((acc, a) => acc + a.confidence, 0) / thisPeriodItems.length
      : 0;
    const lastPeriodAvg = lastPeriodItems.length > 0
      ? lastPeriodItems.reduce((acc, a) => acc + a.confidence, 0) / lastPeriodItems.length
      : 0;
    const previousPeriodAvg = previousPeriodItems.length > 0
      ? previousPeriodItems.reduce((acc, a) => acc + a.confidence, 0) / previousPeriodItems.length
      : 0;

    if (thisPeriodItems.length === 0) {
      return { trend: "0%", trendUp: false };
    }

    if (lastPeriodItems.length === 0 && previousPeriodItems.length > 0) {
      if (previousPeriodAvg === 0) return { trend: "+100%", trendUp: true };
      const percentChange = ((thisPeriodAvg - previousPeriodAvg) / previousPeriodAvg) * 100;
      return {
        trend: `${percentChange >= 0 ? "+" : ""}${percentChange.toFixed(0)}%`,
        trendUp: percentChange >= 0
      };
    }

    if (lastPeriodItems.length === 0) {
      return { trend: "+100%", trendUp: true };
    }

    if (lastPeriodAvg === 0) return { trend: "+100%", trendUp: true };

    const percentChange = ((thisPeriodAvg - lastPeriodAvg) / lastPeriodAvg) * 100;
    return {
      trend: `${percentChange >= 0 ? "+" : ""}${percentChange.toFixed(0)}%`,
      trendUp: percentChange >= 0
    };
  }, [analysisItems]);

  const todayActivities = useMemo(() => {
    return analyticsData?.todayAnalyses ?? 0;
  }, [analyticsData]);

  const mostActiveDay = useMemo(() => {
    if (analyticsData?.mostActiveDay) {
      return analyticsData.mostActiveDay;
    }

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayCounts = new Array(7).fill(0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    analysisItems.filter(a => timestampGreaterOrEqual(a, weekAgo)).forEach(a => {
      const day = new Date(getAnalysisTimestamp(a)).getDay();
      dayCounts[day]++;
    });

    const maxCount = Math.max(...dayCounts);
    if (maxCount === 0) return "No activity";
    return days[dayCounts.indexOf(maxCount)];
  }, [analysisItems, analyticsData]);

  const avgPerDay = useMemo(() => {
    if (analyticsData?.avgPerDay) {
      return analyticsData.avgPerDay;
    }
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekItems = analysisItems.filter(a => timestampGreaterOrEqual(a, weekAgo));
    return weekItems.length > 0 ? (weekItems.length / 7).toFixed(1) : "0";
  }, [analysisItems, analyticsData]);

  const usageData = useMemo(() => {

    const activities = analyticsData?.activities?.map((a: any) => ({
      id: a.id,
      type: a.type,

      timestamp: a.createdAt ? new Date(a.createdAt) : (a.timestamp ? new Date(a.timestamp) : new Date()),

      details: a.metadata || a.details,
    })) || [];
    return transformHistoryToUsageData(analysisItems, activities);
  }, [analysisItems, analyticsData]);
  const performanceData = useMemo(() => transformHistoryToPerformanceData(analysisItems), [analysisItems]);

  const distributionData = useMemo(() => {
    const activities = analyticsData?.activities || [];

    const analysesCount = totalAnalyses;
    const searchesCount = activities.filter((a: any) => a.type === "search").length;
    const signInsCount = activities.filter((a: any) => a.type === "sign_in").length;
    const signUpsCount = activities.filter((a: any) => a.type === "sign_up").length;
    const signOutsCount = activities.filter((a: any) => a.type === "sign_out").length;

    return [
      { name: "Analyses", value: analysesCount },
      { name: "Searches", value: searchesCount },
      { name: "Sign Ins", value: signInsCount },
      { name: "Sign Ups", value: signUpsCount },
      { name: "Sign Outs", value: signOutsCount },
    ].filter(d => d.value > 0);
  }, [analyticsData, totalAnalyses]);

  const stats = [
    {
      title: "Total Analyses",
      value: totalAnalyses.toString(),
      description: "All time analyses performed",
      icon: Activity,
      trend: analysesTrend,
      trendUp: analysesTrendUp,
    },
    {
      title: "Avg. Confidence",
      value: `${(avgConfidence * 100).toFixed(1)}%`,
      description: "Average confidence score",
      icon: Target,
      trend: confidenceTrend,
      trendUp: confidenceTrendUp,
    },
    {
      title: "Categories Used",
      value: uniqueCategories.toString(),
      description: "Unique categories identified",
      icon: CheckCircle,
      trend: categoriesTrend,
      trendUp: categoriesTrendUp,
    },
    {
      title: "Today's Activity",
      value: todayActivities.toString(),
      description: `Most active: ${mostActiveDay}`,
      icon: Zap,
      trend: `~${avgPerDay}/day avg`,
      trendUp: todayActivities > 0,
    },
  ];

  if (!isReady) {
    return (
      <div className="space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Analytics
          </h1>
          <p className="text-muted-foreground mt-2">
            View insights and statistics about your analysis activity.
          </p>
        </div>
        {}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-card p-6 shadow-sm border border-border animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-muted" />
                <div className="h-4 w-16 rounded bg-muted" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-8 w-20 rounded bg-muted" />
                <div className="h-4 w-32 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
        {}
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="rounded-xl bg-card p-6 shadow-sm border border-border animate-pulse">
              <div className="h-6 w-32 rounded bg-muted mb-4" />
              <div className="h-[300px] rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fadeInDown">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent inline-block">
            Analytics
          </h1>
          <p className="text-muted-foreground mt-2">
            View insights and statistics about your analysis activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          {resetMessage && (
            <span className="text-sm text-green-600 dark:text-green-400 mr-2">{resetMessage}</span>
          )}
          {hasAnalyticsData && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={cancelReset}
          />

          {}
          <div className="relative bg-white dark:bg-card rounded-lg shadow-xl max-w-md w-full mx-4 p-6 z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground">Reset Analytics Data</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-muted-foreground mb-6">
              Are you sure you want to reset all analytics data? This will permanently delete all your analysis history and activities. This action cannot be restored.
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={cancelReset}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmReset}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      )}

      {}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="rounded-xl bg-card p-4 sm:p-6 shadow-sm border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fadeInUp relative overflow-hidden group"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20">
                  <stat.icon className="h-5 sm:h-6 w-5 sm:w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className={`flex items-center text-xs sm:text-sm font-medium ${
                  stat.trendUp ? "text-emerald-500" : "text-rose-500"
                }`}>
                  {stat.trendUp ? (
                    <TrendingUp className="mr-1 h-3 sm:h-4 w-3 sm:w-4" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 sm:h-4 w-3 sm:w-4" />
                  )}
                  <span className="hidden xs:inline">{stat.trend}</span>
                  <span className="xs:hidden text-xs">{stat.trend}</span>
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-600 to-violet-600 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">{stat.title}</p>
                <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                  {stat.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {}
      <AnalyticsCharts
        usageData={usageData}
        performanceData={performanceData}
        distributionData={distributionData}
        categoryData={categoryData}
      />

      {}
      {analysisItems.length > 0 && (
        <div className="rounded-xl bg-card p-6 shadow-sm border border-border">
          <h3 className="text-lg font-semibold mb-4">Recent Activity Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Most Recent Analysis</span>
              <span className="font-medium">
                {analysisItems[0]?.analysisType || "General"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Latest Confidence</span>
              <span className="font-medium">
                {analysisItems[0]?.confidence ? `${(analysisItems[0].confidence * 100).toFixed(1)}%` : "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Total Categories Found</span>
              <span className="font-medium">{allCategories.length}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Analysis Types Used</span>
              <span className="font-medium">{uniqueAnalysisTypes}</span>
            </div>
          </div>
        </div>
      )}

      {analysisItems.length === 0 && (
        <div className="rounded-xl bg-card p-6 shadow-sm border border-border text-center py-12">
          <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Analytics Yet</h3>
          <p className="text-muted-foreground">
            Start analyzing text to see your analytics data here.
          </p>
        </div>
      )}
    </div>
  );
}
