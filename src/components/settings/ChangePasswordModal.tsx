"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { X, AlertCircle, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps): React.ReactElement | null {
  const { user, isLoaded } = useUser();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const hasPassword = user?.passwordEnabled;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    if (currentPassword && newPassword === currentPassword) {
      setError("New password must be different from your current password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (!user || !isLoaded) {
      setError("User not loaded. Please try again.");
      return;
    }

    setIsLoading(true);

    try {

      await user.updatePassword({
        currentPassword,
        newPassword,
      });

      setSuccess(true);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error("Password change error:", err);

      if (err.errors && err.errors.length > 0) {
        const clerkError = err.errors[0];
        if (clerkError.code === "session_reverification_required") {
          setError("Additional verification required. Please sign out and sign in again, then try changing your password.");
        } else if (clerkError.code === "form_password_incorrect" || clerkError.code === "CURRENT_PASSWORD_INVALID") {
          setError("The current password you entered is incorrect. Please try again.");
        } else {
          setError(clerkError.longMessage || clerkError.message || "Failed to change password");
        }
      } else if (err.message?.includes("additional verification")) {
        setError("Additional verification required. Please sign out and sign in again, then try changing your password.");
      } else {
        setError(err.message || "Failed to change password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 border border-zinc-200 dark:border-zinc-800">
          <p className="text-center text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasPassword) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden border border-zinc-200 dark:border-zinc-800">
          {}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Create Password
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Set up a password for your account
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {}
          <div className="p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Password Not Available
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                You signed up using a social account (like Google or GitHub). To create a password, you need to verify your email first.
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Please check your email for a verification link or contact support.
              </p>
              <Button
                onClick={onClose}
                className="mt-4"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden border border-zinc-200 dark:border-zinc-800">
        {}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Change Password
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Update your password to keep your account secure
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Password Changed Successfully
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Your password has been updated. You can now close this window.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {}
              <Input
                id="currentPassword"
                type="password"
                label="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                required
              />

              {}
              <Input
                id="newPassword"
                type="password"
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                required
              />

              {}
              <Input
                id="confirmPassword"
                type="password"
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
              />

              {}
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Changing Password..." : "Change Password"}
                </Button>
              </div>

              {}
              <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1 pt-2">
                <p className="font-medium">Password tips:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Use at least 8 characters (12+ recommended)</li>
                  <li>Include uppercase and lowercase letters</li>
                  <li>Include numbers and special characters</li>
                </ul>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
