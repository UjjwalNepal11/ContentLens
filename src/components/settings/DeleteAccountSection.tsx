"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function DeleteAccountSection() {
  const { user } = useUser();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      await user.delete();
      router.push("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      setIsDeleting(false);
    }
  };

  return (
    <Card className="border-red-200 dark:border-red-900">
      <CardHeader>
        <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
        <CardDescription>
          Irreversible actions for your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-medium">Delete Account</p>
            <p className="text-sm text-muted-foreground">
              Permanently remove your account and all of its data.
            </p>
          </div>
          {showConfirm ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          ) : (
            <Button
              variant="destructive"
              onClick={() => setShowConfirm(true)}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
