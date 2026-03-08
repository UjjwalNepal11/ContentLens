import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPrisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
const CACHE_CONTROL = 'public, s-maxage=30, stale-while-revalidate=60';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const activities = await getPrisma().activity.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    const formattedActivities = activities.map((activity: any) => ({
      id: activity.id,
      type: activity.type,
      timestamp: activity.createdAt,
      details: activity.metadata as any,
    }));

    return NextResponse.json(
      { success: true, data: formattedActivities },
      {
        status: 200,
        headers: {
          'Cache-Control': CACHE_CONTROL,
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch activities" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { type, details } = body;

    const activity = await getPrisma().activity.create({
      data: {
        userId,
        type,
        metadata: details,
      },
    });

    return NextResponse.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.error("Failed to save activity:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save activity" },
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
    const clearAll = searchParams.get("clearAll") === "true";

    if (clearAll) {

      await getPrisma().activity.updateMany({
        where: { userId, deletedAt: null },
        data: { deletedAt: new Date() },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Missing clearAll parameter" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Failed to delete activity:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete activity" },
      { status: 500 },
    );
  }
}
