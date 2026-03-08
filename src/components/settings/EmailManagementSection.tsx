"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Mail,
  Check,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmailManagementSection() {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [emailAddresses, setEmailAddresses] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setEmailAddresses(user.emailAddresses);
    }
  }, [user]);

  if (!isLoaded || !user) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Email Addresses
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Manage your email addresses
          </p>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-12 bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
          <div className="h-12 bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
        </div>
      </div>
    );
  }

  const primaryEmail = user.primaryEmailAddress;

  const refreshEmails = async () => {
    setIsLoading(true);
    setError(null);
    try {

      window.location.reload();
    } catch (err: any) {
      console.error("Error refreshing emails:", err);
      setError("Failed to refresh emails");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPrimaryEmail = async (emailId: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await user.update({
        primaryEmailAddressId: emailId,
      });
      setSuccess("Primary email updated successfully");
      setEmailAddresses(user.emailAddresses);
    } catch (err: any) {
      console.error("Error setting primary email:", err);
      setError("Failed to set primary email");
    } finally {
      setIsLoading(false);
    }
  };

  const currentEmails = user.emailAddresses;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Email Addresses
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Manage your email addresses
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshEmails}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-1" />
          )}
          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-sm">
          <CheckCircle className="h-4 w-4" />
          {success}
        </div>
      )}

      <div className="space-y-2">
        {currentEmails.map((email) => {
          const isPrimary = primaryEmail?.id === email.id;
          const isVerified = email.verification?.status === "verified";

          return (
            <div
              key={email.id}
              className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-lg flex-shrink-0 ${isPrimary ? "bg-blue-100 dark:bg-blue-950" : "bg-zinc-100 dark:bg-zinc-700"}`}>
                  <Mail className={`h-4 w-4 ${isPrimary ? "text-blue-600 dark:text-blue-400" : "text-zinc-500 dark:text-zinc-400"}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[180px] sm:max-w-none">
                      {email.emailAddress}
                    </p>
                    {isPrimary && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 flex-shrink-0">
                        <Check className="h-3 w-3 mr-1" />
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {isVerified ? (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                        <AlertCircle className="h-3 w-3" />
                        Unverified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isPrimary && isVerified && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetPrimaryEmail(email.id)}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    Set Primary
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {currentEmails.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No email addresses added
        </p>
      )}

      {currentEmails.length > 0 && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-2">
          To add a new email address, please contact support or use the Clerk dashboard.
        </p>
      )}
    </div>
  );
}
