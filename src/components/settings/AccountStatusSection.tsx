"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/nextjs";

export function AccountStatusSection() {
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user) {
    return null;
  }

  const accountStatus = {
    emailVerified: user.emailAddresses.some((email) => email.verification.status === "verified"),
    accountType: (user.publicMetadata?.plan as string) || "Free",
    lastLogin: user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : "Never",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Status</CardTitle>
        <CardDescription>
          View your account information and status.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Email Verification:</span>
          <Badge
            variant={accountStatus.emailVerified ? "default" : "destructive"}
          >
            {accountStatus.emailVerified ? "Verified" : "Unverified"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Account Type:</span>
          <Badge variant="secondary">{accountStatus.accountType}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Last Login:</span>
          <span className="text-sm text-muted-foreground">
            {accountStatus.lastLogin}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
