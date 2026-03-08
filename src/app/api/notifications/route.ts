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

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const prisma = getPrisma();

    const where = {
      userId,
      deletedAt: null,
      ...(unreadOnly && { read: false }),
    };

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, read: false, deletedAt: null },
    });

    return NextResponse.json({
      success: true,
      data: notifications.map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        read: n.read,
        metadata: n.metadata,
        createdAt: n.createdAt,
      })),
      unreadCount,
    });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
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
    const { title, message, type, metadata } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: "Title and message are required" },
        { status: 400 },
      );
    }

    const prisma = getPrisma();

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: type || "info",
        metadata: metadata || {},
        read: false,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: notification.read,
        metadata: notification.metadata,
        createdAt: notification.createdAt,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create notification" },
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
    const { id, read, markAllRead } = body;
    const prisma = getPrisma();

    if (markAllRead) {

      await prisma.notification.updateMany({
        where: { userId, read: false, deletedAt: null },
        data: { read: true },
      });
      return NextResponse.json({ success: true });
    }

    if (id) {

      const notification = await prisma.notification.update({
        where: { id, userId },
        data: { read: read ?? true },
      });
      return NextResponse.json({
        success: true,
        data: {
          id: notification.id,
          read: notification.read,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Notification ID is required" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Failed to update notification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update notification" },
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

    const prisma = getPrisma();

    if (clearAll) {

      await prisma.notification.updateMany({
        where: { userId, deletedAt: null },
        data: { deletedAt: new Date() },
      });
      return NextResponse.json({ success: true });
    }

    if (id) {

      await prisma.notification.update({
        where: { id, userId },
        data: { deletedAt: new Date() },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Notification ID is required" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Failed to delete notification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete notification" },
      { status: 500 },
    );
  }
}
