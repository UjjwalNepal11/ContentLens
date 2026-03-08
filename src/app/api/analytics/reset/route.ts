import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPrisma } from "@/lib/prisma";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const prisma = getPrisma();

    await prisma.analysis.deleteMany({
      where: { userId },
    });

    await prisma.activity.deleteMany({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      message: "Analytics data has been reset successfully",
    });
  } catch (error) {
    console.error("Failed to reset analytics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset analytics data" },
      { status: 500 }
    );
  }
}
