import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPrisma } from "@/lib/prisma";
import { Analysis } from "@prisma/client";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10) || 10, 50);

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const prisma = getPrisma();

    const analyses = await prisma.analysis.findMany({
      where: {
        userId,
        deletedAt: null,
        OR: [
          { text: { contains: query, mode: 'insensitive' } },
          { analysis: { path: [], string_contains: query } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const results = analyses.map((analysis: Analysis) => {
      const analysisData = analysis.analysis as any;
      return {
        id: analysis.id,
        type: 'analysis',
        text: analysis.text,
        analysis: analysisData?.summary?.detailedSummary || 
                analysisData?.summary?.shortSummary || 
                analysisData?.analysis || '',
        confidence: ((analysisData?.confidenceScore || analysisData?.confidence || 0) as number) / 100,
        categories: analysisData?.topics || analysisData?.keywords || analysisData?.categories || [],
        timestamp: analysis.createdAt,
        analysisType: analysisData?.analysisType || 'general',
      };
    });

    try {
      await prisma.activity.create({
        data: {
          userId,
          type: 'search',
          metadata: {
            query,
            resultCount: results.length,
          },
        },
      });
    } catch (activityError) {

      console.error("Failed to record search activity:", activityError);
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Failed to search:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search" },
      { status: 500 },
    );
  }
}
