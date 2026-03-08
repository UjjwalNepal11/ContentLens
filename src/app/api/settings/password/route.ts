import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {

    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required. Please sign in." },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!newPassword) {
      return NextResponse.json(
        { success: false, error: "New password is required" },
        { status: 400 }
      );
    }

    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();

    console.log("Attempting to change password for user:", userId);

    const userData = await client.users.getUser(userId);

    const hasPassword = userData.passwordEnabled;

    const usersApi = client.users as any;

    if (!hasPassword) {

      console.log("User has no password, creating one");
      await usersApi.createUserPassword(userId, {
        password: newPassword,
      });
    } else {

      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: "Current password is required" },
          { status: 400 }
        );
      }
      console.log("User has password, updating");
      await usersApi.updateUserPassword(userId, {
        currentPassword,
        newPassword,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    console.error("Password change error:", error);
    console.error("Error details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
 
    if (error.errors && error.errors.length > 0) {
      const clerkError = error.errors[0];
      console.error("Clerk error code:", clerkError.code);
      console.error("Clerk error message:", clerkError.message);

      if (clerkError.code === "CURRENT_PASSWORD_INVALID") {
        return NextResponse.json(
          { success: false, error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: clerkError.message || "Failed to change password" },
        { status: 400 }
      );
    }

    if (error.message) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to change password" },
      { status: 500 }
    );
  }
}

