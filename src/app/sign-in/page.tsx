"use client";

import { useState, useEffect } from "react";
import { useSignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, AlertTriangle } from "lucide-react";

const REMEMBER_ME_KEY = "clerk_remember_me";
const SAVED_EMAIL_KEY = "clerk_saved_email";

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isLoaded: isUserLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {

    if (isUserLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isUserLoaded, isSignedIn, router]);

  useEffect(() => {

    if (isUserLoaded && !isSignedIn) {
      setTimeout(() => setIsVisible(true), 100);
    }
  }, [isUserLoaded, isSignedIn]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem(SAVED_EMAIL_KEY);
      const rememberMeFlag = localStorage.getItem(REMEMBER_ME_KEY);

      if (savedEmail) setEmail(savedEmail);
      if (rememberMeFlag === "true") setRememberMe(true);

      const lockoutTime = localStorage.getItem("signin_lockout_until");
      if (lockoutTime) {
        const lockout = parseInt(lockoutTime);
        if (lockout > Date.now()) {
          setLockoutUntil(lockout);
        } else {
          localStorage.removeItem("signin_lockout_until");
          localStorage.removeItem("signin_failed_attempts");
        }
      }

      const attempts = localStorage.getItem("signin_failed_attempts");
      if (attempts) setFailedAttempts(parseInt(attempts));
    }
  }, []);

  useEffect(() => {
    if (lockoutUntil) {
      const interval = setInterval(() => {
        if (Date.now() >= lockoutUntil) {
          setLockoutUntil(null);
          setFailedAttempts(0);
          localStorage.removeItem("signin_lockout_until");
          localStorage.removeItem("signin_failed_attempts");
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutUntil]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailError("");
    setPasswordError("");

    if (!isLoaded) return;
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn.create({ identifier: email, password });

      if (result.status === "complete") {
        if (rememberMe) {
          localStorage.setItem(REMEMBER_ME_KEY, "true");
          localStorage.setItem(SAVED_EMAIL_KEY, email);
        } else {
          localStorage.removeItem(REMEMBER_ME_KEY);
          localStorage.removeItem(SAVED_EMAIL_KEY);
        }
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err: any) {
      if (err.errors?.[0]) {
        const errorData = err.errors[0];
        if (errorData.meta?.paramName === "email_address") {
          setEmailError(errorData.longMessage || errorData.message);
        } else if (errorData.meta?.paramName === "password") {
          setPasswordError(errorData.longMessage || errorData.message);
        } else {
          setError(errorData.longMessage || errorData.message);
        }
      } else {
        setError(err.message || "Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;
    sessionStorage.setItem("oauth_return_url", "/sign-in");
    setGoogleLoading(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: any) {
      const firstError = err.errors?.[0];
      setError(firstError?.longMessage || firstError?.message || "Failed to sign in with Google");
      setGoogleLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    if (!isLoaded) return;
    sessionStorage.setItem("oauth_return_url", "/sign-in");
    setGithubLoading(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_github",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: any) {
      const firstError = err.errors?.[0];
      setError(firstError?.longMessage || firstError?.message || "Failed to sign in with GitHub");
      setGithubLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="animate-spin">
          <Loader2 className="h-8 w-8 text-indigo-500" />
        </div>
      </div>
    );
  }

  const remainingAttempts = Math.max(0, 5 - failedAttempts);
  const isLockedOut = lockoutUntil !== null;
  const lockoutSeconds = lockoutUntil ? Math.ceil((lockoutUntil - Date.now()) / 1000) : 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-3 sm:p-4 relative overflow-hidden">
      {}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 sm:w-80 h-40 sm:h-80 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-2xl sm:blur-3xl animate-pulse ${isVisible ? 'animate-pulse' : 'opacity-0'}`} />
        <div className={`absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 sm:w-80 h-40 sm:h-80 bg-violet-500/20 dark:bg-violet-500/10 rounded-full blur-2xl sm:blur-3xl animate-pulse ${isVisible ? 'animate-pulse' : 'opacity-0'}`} style={{ animationDelay: '1s' }} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-gradient-to-br from-indigo-500/10 to-violet-500/10 dark:from-indigo-500/5 dark:to-violet-500/5 rounded-full blur-2xl sm:blur-3xl ${isVisible ? 'animate-pulse' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }} />
      </div>

      <div className={`w-full max-w-[350px] sm:max-w-[420px] relative z-10 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {failedAttempts > 0 && !isLockedOut && (
          <div className={`mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/50 dark:border-amber-800/50 flex items-center gap-2 sm:gap-3 backdrop-blur-sm transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} style={{ transitionDelay: '100ms' }}>
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 flex-shrink-0 animate-bounce" />
            <div>
              <p className="text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-400">
                {failedAttempts === 1 ? "1 failed attempt" : `${failedAttempts} failed attempts`}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500">
                {remainingAttempts} attempts remaining before lockout
              </p>
            </div>
          </div>
        )}

        {isLockedOut && (
          <div className="mb-3 sm:mb-4 p-3 sm:p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/50 dark:border-red-800/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0 animate-pulse" />
              <p className="text-sm sm:font-medium text-red-700 dark:text-red-400">Account temporarily locked</p>
            </div>
            <p className="text-xs sm:text-sm text-red-600 dark:text-red-500">
              Too many failed attempts. Please wait <span className="font-mono font-bold">{lockoutSeconds}</span> seconds before trying again.
            </p>
          </div>
        )}

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-5 sm:p-8">
{}
<div className={`flex justify-center mb-4 sm:mb-6 transition-all duration-500 delay-100 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
<div className="h-12 sm:h-14 w-30 sm:w-30 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105 px-2">
              <span className="text-white text-base sm:text-lg font-bold whitespace-nowrap">ContentLens</span>
            </div>
          </div>

          <div className={`text-center mb-5 sm:mb-8 transition-all duration-500 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h1>
<p className="text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 text-sm sm:text-base">Sign in to your ContentLens Dashboard</p>
          </div>

          {error && (
            <div className="mb-4 sm:mb-6 p-2.5 sm:p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200/50 dark:border-red-800/50 animate-shake">
              <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className={`transition-all duration-500 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Input
                type="email"
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
                error={emailError}
                required
                autoComplete="email"
                name="email"
                id="email"
              />
            </div>

            <div className={`transition-all duration-500 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(""); }}
                error={passwordError}
                required
                autoComplete="current-password"
                name="password"
                id="password"
              />
            </div>

            <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 transition-all duration-500 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 group-hover:scale-110"
                />
                <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-all duration-200 hover:underline decoration-2 underline-offset-2">
                Forgot password?
              </Link>
            </div>

            <div id="clerk-captcha" />

            <Button
              type="submit"
              className={`w-full transition-all duration-500 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} hover:scale-[1.02] active:scale-[0.98]`}
              loading={loading}
            >
              Sign In
            </Button>
          </form>

          <div className="relative my-4 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 dark:text-slate-400">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="google"
            className={`w-full transition-all duration-500 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} hover:scale-[1.02] active:scale-[0.98]`}
            onClick={handleGoogleSignIn}
            loading={googleLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          <Button
            type="button"
            variant="outline"
            className={`w-full mt-2 sm:mt-3 transition-all duration-500 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} hover:scale-[1.02] active:scale-[0.98]`}
            onClick={handleGithubSignIn}
            loading={githubLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
          </Button>

          <p className={`text-center text-sm text-slate-500 dark:text-slate-400 mt-5 sm:mt-6 transition-all duration-500 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-all duration-200 hover:underline decoration-2 underline-offset-2">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
