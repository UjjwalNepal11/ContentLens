"use client";

import { useUser } from "@clerk/nextjs";
import {
  Link2,
  CheckCircle,
  Github,
  Chrome,
  Twitter,
  Facebook,
  LucideIcon
} from "lucide-react";

const providerIcons: Record<string, LucideIcon> = {
  github: Github,
  google: Chrome,
  twitter: Twitter,
  facebook: Facebook,
};

const providerNames: Record<string, string> = {
  github: "GitHub",
  google: "Google",
  twitter: "Twitter",
  facebook: "Facebook",
  microsoft: "Microsoft",
  apple: "Apple",
};

export function ConnectedAccountsSection() {
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user) {
    return null;
  }

  const externalAccounts = user.externalAccounts;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Connected Accounts
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Manage your connected social accounts
        </p>
      </div>

      <div className="space-y-2">
        {externalAccounts.map((account) => {
          const provider = account.provider;
          const ProviderIcon = providerIcons[provider] || Link2;
          const providerName = providerNames[provider] || provider;
          const isVerified = account.verification?.status === "verified";

          return (
            <div
              key={account.id}
              className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-700 flex-shrink-0">
                  <ProviderIcon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {providerName}
                    </p>
                    {isVerified && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex-shrink-0">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[200px]">
                    {account.emailAddress || "Account connected"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {externalAccounts.length === 0 && (
        <div className="text-center py-4 text-zinc-500 dark:text-zinc-400">
          <Link2 className="h-8 w-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
          <p className="text-sm">No connected accounts</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Connect a social account to sign in faster
          </p>
        </div>
      )}
    </div>
  );
}
