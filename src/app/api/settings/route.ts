import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPrisma } from "@/lib/prisma";

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

    const prisma = getPrisma();

    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId,
          sidebarCollapsed: false,
          scrollPositions: {},
          theme: "light",
          language: "en",
          notifications: true,
          emailNotifications: true,
          autoSave: true,
          privacyMode: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: settings.id,
        userId: settings.userId,
        sidebarCollapsed: settings.sidebarCollapsed,
        scrollPositions: settings.scrollPositions,
        theme: settings.theme,
        language: settings.language,
        notifications: settings.notifications,
        emailNotifications: settings.emailNotifications,
        autoSave: settings.autoSave,
        privacyMode: settings.privacyMode,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const prisma = getPrisma();

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: {
        ...(body.sidebarCollapsed !== undefined && { sidebarCollapsed: body.sidebarCollapsed }),
        ...(body.scrollPositions !== undefined && { scrollPositions: body.scrollPositions }),
        ...(body.theme !== undefined && { theme: body.theme }),
        ...(body.language !== undefined && { language: body.language }),
        ...(body.notifications !== undefined && { notifications: body.notifications }),
        ...(body.emailNotifications !== undefined && { emailNotifications: body.emailNotifications }),
        ...(body.autoSave !== undefined && { autoSave: body.autoSave }),
        ...(body.privacyMode !== undefined && { privacyMode: body.privacyMode }),
      },
      create: {
        userId,
        sidebarCollapsed: body.sidebarCollapsed ?? false,
        scrollPositions: body.scrollPositions ?? {},
        theme: body.theme ?? "light",
        language: body.language ?? "en",
        notifications: body.notifications ?? true,
        emailNotifications: body.emailNotifications ?? true,
        autoSave: body.autoSave ?? true,
        privacyMode: body.privacyMode ?? false,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: settings.id,
        userId: settings.userId,
        sidebarCollapsed: settings.sidebarCollapsed,
        scrollPositions: settings.scrollPositions,
        theme: settings.theme,
        language: settings.language,
        notifications: settings.notifications,
        emailNotifications: settings.emailNotifications,
        autoSave: settings.autoSave,
        privacyMode: settings.privacyMode,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {

  return PUT(request);
}
