import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";

export default async function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {

  const authResult = await auth();
  const userId = authResult.userId;

  if (!userId) {
    redirect("/sign-in");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
