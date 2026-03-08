import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
 
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const client = await clerkClient();

    const sessionsResponse = await client.sessions.getSessionList({ userId });

    const sessions = (sessionsResponse as any).data || [];

    if (sessions.length > 0) {
      console.log("Raw session data:", JSON.stringify(sessions[0], null, 2));
    }

    const formattedSessions = await Promise.all(sessions.map(async (session: any) => {
      const deviceInfo = session.device || session.actor?.device || {};
      const locationInfo = session.location || session.actor?.location || {};

      let detailedSession = session;
      try {
        const sessionDetail = await client.sessions.getSession(session.id);
        detailedSession = (sessionDetail as any) || session;
      } catch (e) {

      }

      const detailedLocation = detailedSession.location || detailedSession.actor?.location || {};

      const city = detailedLocation.city || locationInfo.city || session.city || "";
      const region = detailedLocation.region || locationInfo.region || session.region || "";
      const country = detailedLocation.country || locationInfo.country || session.country || "";

      const locationParts = [city, region, country].filter(Boolean);
      const locationString = locationParts.length > 0 ? locationParts.join(", ") : "Unknown location";

      return {
        id: session.id,
        status: session.status,
        expireAt: session.expireAt,
        lastActiveAt: session.lastActiveAt,
        deviceType: deviceInfo.type || session.deviceType || "desktop",
        deviceBrowser: deviceInfo.browser || session.browser || "Browser",
        location: locationString,
      };
    }));

    formattedSessions.sort((a: any, b: any) => {
      const dateA = new Date(a.lastActiveAt || 0).getTime();
      const dateB = new Date(b.lastActiveAt || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      data: formattedSessions,
    });
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID required" },
        { status: 400 }
      );
    }

    const client = await clerkClient();

    await client.sessions.revokeSession(sessionId);

    return NextResponse.json({
      success: true,
      message: "Session revoked successfully",
    });
  } catch (error) {
    console.error("Failed to revoke session:", error);
    return NextResponse.json(
      { success: false, error: "Failed to revoke session" },
      { status: 500 }
    );
  }
}
