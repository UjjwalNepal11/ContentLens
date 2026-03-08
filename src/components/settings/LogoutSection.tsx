"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, AlertTriangle } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { notifySignOut, backupAllData } from "@/lib/store";
import { useState } from "react";

export function LogoutSection() {
  const { signOut } = useClerk();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const handleSignOut = async () => {

    backupAllData();

    notifySignOut();
    await signOut({ redirectUrl: "/" });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Sign Out</CardTitle>
          <CardDescription>
            Sign out of your account on this device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            className="flex items-center gap-2"
            onClick={() => setShowSignOutConfirm(true)}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowSignOutConfirm(false)}
          />

          {}
          <div className="relative bg-white dark:bg-card rounded-lg shadow-xl max-w-md w-full mx-4 p-6 z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground">Sign Out</h3>
                <p className="text-sm text-muted-foreground">Confirm your action</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-muted-foreground mb-6">
              Are you sure you want to sign out? You will need to sign in again to access your account.
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSignOutConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
