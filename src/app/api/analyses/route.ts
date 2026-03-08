import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPrisma } from "@/lib/prisma";
import { AnalysisResult } from "@/lib/types";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const analyses = await getPrisma().analysis.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to match the expected format
    const formattedAnalyses = analyses.map((analysis: any) => {
      // The analysis field contains the full AI response structure
      const analysisData = analysis.analysis as Record<string, unknown>;

      let analysisText = '';
      let confidence = 0;
      let categories: string[] = [];

      if (analysisData && typeof analysisData === 'object') {

        if (analysisData.summary) {

          const summary = analysisData.summary as { detailedSummary?: string; shortSummary?: string };
          analysisText = summary.detailedSummary || summary.shortSummary || '';
        } else if (analysisData.analysis) {

          analysisText = analysisData.analysis as string;
        }

        confidence = ((analysisData.confidenceScore || analysisData.confidence || 0) as number) / 100;

        categories = (analysisData.topics as string[]) || (analysisData.keywords as string[]) || (analysisData.categories as string[]) || [];

        const analysisType = (analysisData?.analysisType as string) || 'general';

        return {
          id: analysis.id,
          text: analysis.text,
          analysis: analysisText,
          confidence: confidence,

          categories: [analysisType, ...categories],

          createdAt: analysis.createdAt instanceof Date
            ? analysis.createdAt.toISOString()
            : analysis.createdAt,
          timestamp: analysis.createdAt instanceof Date
            ? analysis.createdAt.toISOString()
            : analysis.createdAt,
          analysisType: analysisType,
          fullAnalysis: analysisData as unknown as AnalysisResult | undefined,
          fileName: analysis.fileName || undefined,
        };
      }

      return {
        id: analysis.id,
        text: analysis.text,
        analysis: analysisText,
        confidence: confidence,
        categories: categories,
        createdAt: analysis.createdAt instanceof Date
          ? analysis.createdAt.toISOString()
          : analysis.createdAt,
        timestamp: analysis.createdAt instanceof Date
          ? analysis.createdAt.toISOString()
          : analysis.createdAt,
        analysisType: 'general',
        fullAnalysis: undefined,
        fileName: analysis.fileName || undefined,
      };
    });

    return NextResponse.json(
      { success: true, data: formattedAnalyses },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Failed to fetch analyses:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analyses" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("clearAll") === "true";

    if (clearAll) {

      await getPrisma().analysis.updateMany({
        where: { userId, deletedAt: null },
        data: { deletedAt: new Date() },
      });
      return NextResponse.json({ success: true });
    }

    if (id) {

      await getPrisma().analysis.update({
        where: { id, userId },
        data: { deletedAt: new Date() },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Missing id or clearAll parameter" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Failed to delete analysis:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete analysis" },
      { status: 500 },
    );
  }
}
