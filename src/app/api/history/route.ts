import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPrisma } from "@/lib/prisma";
import { AnalysisHistoryItem, AnalysisResult } from "@/lib/types";
import type { Analysis, Activity } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const cursor = searchParams.get("cursor");
    const analytics = searchParams.get("analytics") === "true";

    const limit = Math.min(parseInt(limitParam || "10", 10) || 10, 100);

    const analyses = await getPrisma().analysis.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    let hasMore = false;
    let nextCursor: string | null = null;

    if (analyses.length > limit) {
      const nextItem = analyses[limit];
      hasMore = true;
      nextCursor = nextItem.id;
      analyses.pop();
    }

    // Transform to match the expected format
    const formattedAnalyses: AnalysisHistoryItem[] = analyses.map((analysis: Analysis): AnalysisHistoryItem => {
      // The analysis field contains the full AI response structure
      const analysisData = analysis.analysis as Record<string, unknown>;

      let analysisText = "";
      let confidence = 0;
      let categories: string[] = [];

      if (analysisData && typeof analysisData === "object") {

        if (analysisData.summary) {

          const summary = analysisData.summary as Record<string, string>;
          analysisText = summary.detailedSummary || summary.shortSummary || "";
        } else if (analysisData.analysis) {

          analysisText = analysisData.analysis as string;
        }

        const confValue = analysisData.confidenceScore ?? analysisData.confidence ?? 0;
        confidence = (typeof confValue === 'number' ? confValue : 0) / 100;

        const topics = analysisData.topics as string[] | undefined;
        const keywords = analysisData.keywords as string[] | undefined;
        const cats = analysisData.categories as string[] | undefined;
        categories = topics || keywords || cats || [];
      }

      // Extract filename from text if it exists in the format [File: name] or [Image: name]
      let fileName = (analysis as any).fileName || undefined;
      if (!fileName && analysis.text) {
        if (analysis.text.startsWith("[File: ")) {
          const match = analysis.text.match(/^\[File: (.*?)\]/);
          if (match) fileName = match[1];
        } else if (analysis.text.startsWith("[Image: ")) {
          const match = analysis.text.match(/^\[Image: (.*?)\]/);
          if (match) fileName = match[1];
}
      }

      return {
        id: analysis.id,
        text: fileName || analysis.text,
        analysis: analysisText,
        confidence: confidence,
        categories: categories,

        createdAt: analysis.createdAt instanceof Date
          ? analysis.createdAt.toISOString()
          : analysis.createdAt,
        timestamp: analysis.createdAt instanceof Date
          ? analysis.createdAt.toISOString()
          : analysis.createdAt,
        analysisType: (analysisData?.analysisType as string) || "general",
        fullAnalysis: analysisData as unknown as AnalysisResult | undefined,
        fileName: fileName,
      };
    });

    let analyticsData = null;
    if (analytics) {

      const allAnalyses = await getPrisma().analysis.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      // Transform all analyses for analytics
      const allFormattedAnalyses: AnalysisHistoryItem[] = allAnalyses.map((analysis: Analysis): AnalysisHistoryItem => {
  const analysisData = analysis.analysis as Record<string, unknown>;

  let analysisText = "";
  let confidence = 0;
  let categories: string[] = [];

  if (analysisData && typeof analysisData === "object") {
    if (analysisData.summary) {
      const summary = analysisData.summary as Record<string, string>;
      analysisText = summary.detailedSummary || summary.shortSummary || "";
    } else if (analysisData.analysis) {
      analysisText = analysisData.analysis as string;
    }

    const confValue = analysisData.confidenceScore ?? analysisData.confidence ?? 0;
    confidence = (typeof confValue === 'number' ? confValue : 0) / 100;

    const topics = analysisData.topics as string[] | undefined;
    const keywords = analysisData.keywords as string[] | undefined;
    const cats = analysisData.categories as string[] | undefined;
    categories = topics || keywords || cats || [];
  }

        // Extract filename from text if it exists in the format [File: name] or [Image: name]
        let fileName = (analysis as any).fileName || undefined;
  if (!fileName && analysis.text) {
    if (analysis.text.startsWith("[File: ")) {
      const match = analysis.text.match(/^\[File: (.*?)\]/);
      if (match) fileName = match[1];
    } else if (analysis.text.startsWith("[Image: ")) {
      const match = analysis.text.match(/^\[Image: (.*?)\]/);
      if (match) fileName = match[1];
    }
  }

  return {
    id: analysis.id,
    text: fileName || analysis.text,
    analysis: analysisText,
    confidence: confidence,
    categories: categories,

    createdAt: analysis.createdAt instanceof Date
      ? analysis.createdAt.toISOString()
      : analysis.createdAt,
    timestamp: analysis.createdAt instanceof Date
      ? analysis.createdAt.toISOString()
      : analysis.createdAt,
    analysisType: (analysisData?.analysisType as string) || "general",
    fullAnalysis: analysisData as unknown as AnalysisResult | undefined,
    fileName: fileName,
  };
      });

      const activities = await getPrisma().activity.findMany({
        where: { userId },
      orderBy: { createdAt: "desc" },
      });

  const totalAnalyses = allFormattedAnalyses.length;

  const avgConfidence = totalAnalyses > 0
    ? allFormattedAnalyses.reduce((sum, a) => sum + a.confidence, 0) / totalAnalyses
    : 0;

  const allCategories = allFormattedAnalyses.flatMap(a => a.categories || []);
  const uniqueCategories = [...new Set(allCategories)];

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const todayAnalysesCount = allFormattedAnalyses.filter(
    a => new Date(a.timestamp).getTime() >= todayStart.getTime()
  ).length;

  const todayActivitiesCount = activities.filter(
    (a: Activity) => new Date(a.createdAt).getTime() >= todayStart.getTime() && a.type !== "analysis"
  ).length;

  const todayAnalyses = todayAnalysesCount + todayActivitiesCount;

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayCounts = new Array(7).fill(0);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  allFormattedAnalyses
    .filter(a => new Date(a.timestamp).getTime() >= weekAgo.getTime())
    .forEach(a => {
      const day = new Date(a.timestamp).getDay();
      dayCounts[day]++;
    });

  activities
    .filter((a: Activity) => new Date(a.createdAt).getTime() >= weekAgo.getTime() && a.type !== "analysis")
    .forEach((a: Activity) => {
      const day = new Date(a.createdAt).getDay();
      dayCounts[day]++;
    });

  const maxCount = Math.max(...dayCounts);
  const mostActiveDay = maxCount > 0 ? days[dayCounts.indexOf(maxCount)] : "No activity";

      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const thisPeriodAnalyses = allFormattedAnalyses.filter(
    a => new Date(a.timestamp).getTime() >= sevenDaysAgo.getTime()
  ).length;
  const thisPeriodOther = activities.filter(
    (a: Activity) => new Date(a.createdAt).getTime() >= sevenDaysAgo.getTime() && a.type !== "analysis"
  ).length;
  const thisPeriodTotal = thisPeriodAnalyses + thisPeriodOther;

  const lastPeriodAnalyses = allFormattedAnalyses.filter(a => {
    const ts = new Date(a.timestamp).getTime();
    return ts >= fourteenDaysAgo.getTime() && ts < sevenDaysAgo.getTime();
  }).length;
      const lastPeriodOther = activities.filter((a: Activity) => {
        const ts = new Date(a.createdAt).getTime();
        return ts >= fourteenDaysAgo.getTime() && ts < sevenDaysAgo.getTime();
      }).length;

  const analysesTrendValue = lastPeriodAnalyses > 0
    ? ((thisPeriodAnalyses - lastPeriodAnalyses) / lastPeriodAnalyses) * 100
    : thisPeriodAnalyses > 0 ? 100 : 0;

  const analysesTrendUp = thisPeriodAnalyses > 0 && analysesTrendValue >= 0;

  const avgPerDay = thisPeriodTotal > 0 ? (thisPeriodTotal / 7).toFixed(1) : "0";

      analyticsData = {
    totalAnalyses,
    avgConfidence,
    uniqueCategories: uniqueCategories.length,
    todayAnalyses,
    mostActiveDay,
    analysesTrend: thisPeriodAnalyses === 0 ? "0%" : `${analysesTrendValue >= 0 ? "+" : ""}${analysesTrendValue.toFixed(0)}%`,
    analysesTrendUp,
    avgPerDay,
        activities,
        allAnalyses: allFormattedAnalyses,
      };
    }

    const response = {
      success: true,
      data: formattedAnalyses,
      pagination: {
        nextCursor,
        hasMore,
      },
      ...(analyticsData && { analytics: analyticsData }),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch history:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
