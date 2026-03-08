import { getPrisma } from "@/lib/prisma";

export const ActivityType = {
  ANALYSIS: "analysis",
  SIGN_IN: "sign_in",
  SIGN_OUT: "sign_out",
  SEARCH: "search",
} as const;

export type ActivityType = (typeof ActivityType)[keyof typeof ActivityType];

export async function recordActivity(
  userId: string,
  type: ActivityType,
  metadata?: object,
): Promise<void> {
  try {
    await getPrisma().activity.create({
      data: {
        userId,
        type,
        metadata: metadata || undefined,
      },
    });

    console.log(
      `[${new Date().toISOString()}] Activity recorded: ${type} for user ${userId}`,
    );
  } catch (error) {

    console.error(`Failed to record activity: ${type}`, error);
  }
}
