"use client";

import { useState, useEffect } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Check, Eye, EyeOff, Mail, X } from "lucide-react";

const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (password.length < 8) errors.push("At least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("One number");
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push("One special character");
  return { isValid: errors.length === 0, errors };
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const PasswordRequirement = ({ met, label }: { met: boolean; label: string }) => (
  <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
    {met ? <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" /> : <X className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />}
    <span>{label}</span>
  </div>
);

export default function ForgotPasswordPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    hasLength: false, hasUppercase: false, hasLowercase: false, hasNumber: false, hasSpecial: false
  });

  useEffect(() => { setTimeout(() => setIsVisible(true), 100); }, []);
  useEffect(() => { if (resendCooldown > 0) { const t = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000); return () => clearTimeout(t); } }, [resendCooldown]);

  const handlePasswordChange = (value: string) => {
    if (passwordError) setPasswordError("");
    setPassword(value);
    setPasswordValidation({
      hasLength: value.length >= 8,
      hasUppercase: /[A-Z]/.test(value),
      hasLowercase: /[a-z]/.test(value),
      hasNumber: /[0-9]/.test(value),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)
    });
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setEmailError("");
    if (!isLoaded) return;
    if (!validateEmail(email)) { setEmailError("Please enter a valid email address"); return; }
    setLoading(true);
    try {
      await signIn.create({ strategy: "reset_password_email_code", identifier: email });
      setStep("code");
    } catch (err: any) {
      if (err.errors && err.errors[0]) {
        const ed = err.errors[0];
        if (ed.meta?.paramName === "email_address") setEmailError(ed.longMessage || ed.message);
        else setError(ed.longMessage || ed.message);
      } else setError(err.message || "Unable to send reset code. Please try again.");
    } finally { setLoading(false); }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setCodeError(""); setPasswordError(""); setConfirmPasswordError("");
    if (!isLoaded) return;
    if (password !== confirmPassword) { setConfirmPasswordError("Passwords do not match"); return; }
    const validation = validatePassword(password);
    if (!validation.isValid) { setPasswordError("Password must meet requirements: " + validation.errors.join(", ")); return; }
    setLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({ strategy: "reset_password_email_code", code, password });
      if (result.status === "complete") { await setActive({ session: result.createdSessionId }); setSuccess(true); setTimeout(() => router.push("/dashboard"), 2000); }
      else setError("Verification failed. Please try again.");
    } catch (err: any) {
      if (err.errors && err.errors[0]) {
        const ed = err.errors[0];
        if (ed.meta?.paramName === "code") setCodeError(ed.longMessage || ed.message);
        else if (ed.meta?.paramName === "password") setPasswordError(ed.longMessage || ed.message);
        else setError(ed.longMessage || ed.message);
      } else setError(err.message || "Failed to reset password. Invalid code or expired.");
    } finally { setLoading(false); }
  };

  if (!isLoaded) return (<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800"><div className="animate-spin"><Loader2 className="h-8 w-8 text-indigo-500" /></div></div>);

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-3 sm:p-4">
      <div className="w-full max-w-[350px] sm:max-w-[420px]">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-5 sm:p-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="flex justify-center mb-4 sm:mb-6"><div className="h-10 sm:h-12 w-10 sm:w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><Check className="h-5 sm:h-6 w-5 sm:w-6 text-green-600 dark:text-green-400" /></div></div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Password Reset!</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-4 sm:mb-6 text-sm sm:text-base">Your password has been successfully reset. Redirecting to dashboard...</p>
          <Loader2 className="h-5 sm:h-6 w-5 sm:w-6 animate-spin text-indigo-500 mx-auto" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-3 sm:p-4">
      <div className={`w-full max-w-[350px] sm:max-w-[420px] relative z-10 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-5 sm:p-8">
<div className={`text-center mb-5 sm:mb-8 transition-all duration-500 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
<div className="flex justify-center mb-4 sm:mb-6"><div className="h-12 sm:h-14 w-30 sm:w-30 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105 px-2"><span className="text-white text-base sm:text-lg font-bold whitespace-nowrap">ContentLens</span></div></div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{step === "email" ? "Forgot Password?" : "Reset Password"}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 max-w-xs mx-auto text-sm">{step === "email" ? "Enter your email to receive a reset code" : `Enter the code sent to ${email}`}</p>
          </div>
          {error && <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200/50 dark:border-red-800/50 animate-shake"><p className="text-xs sm:text-sm text-red-600 dark:text-red-400 text-center">{error}</p></div>}
          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-3 sm:space-y-4">
              <div className={`transition-all duration-500 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <Input type="email" label="Email" placeholder="Enter your email" value={email} onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }} error={emailError} required autoComplete="email" name="email" id="email" />
              </div>
              <Button type="submit" className={`w-full transition-all duration-500 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} hover:scale-[1.02] active:scale-[0.98]`} loading={loading}>Send Reset Code</Button>
              {emailSent && <div className="p-2.5 sm:p-3 rounded-lg bg-green-50 dark:bg-green-950/50 border border-green-200/50 dark:border-green-800/50"><div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm"><Mail className="h-4 w-4 flex-shrink-0" /><p>Reset code sent! Check your inbox.</p></div></div>}
              <div className="mt-4 text-center">
                <Link href="/sign-in" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center justify-center gap-2 transition-colors hover:underline decoration-2 underline-offset-2"><ArrowLeft className="h-4 w-4" /> Back to Sign In</Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-3 sm:space-y-4">
              <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2 transition-all duration-500 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Didn't receive the code?</span>
                {resendCooldown > 0 ? <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Resend in {resendCooldown}s</span> : <button type="button" onClick={async () => { try { await signIn.create({ strategy: "reset_password_email_code", identifier: email }); setEmailSent(true); setResendCooldown(60); setTimeout(() => setEmailSent(false), 5000); } catch { setError("Failed to resend code"); } }} className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">Resend code</button>}
              </div>
              <div className={`transition-all duration-500 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}><Input type="text" label="Verification Code" placeholder="Enter 6-digit code" value={code} onChange={(e) => { setCode(e.target.value); if (codeError) setCodeError(""); }} error={codeError} required maxLength={6} className="text-center tracking-widest text-lg" autoComplete="one-time-code" name="code" id="code" /></div>
              <div className={`transition-all duration-500 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <Input type="password" label="New Password" placeholder="Enter new password" value={password} onChange={(e) => handlePasswordChange(e.target.value)} error={passwordError} required autoComplete="new-password" name="password" id="password" />
              </div>
              {password && <div className={`grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pt-2 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}><PasswordRequirement met={passwordValidation.hasLength} label="8+ characters" /><PasswordRequirement met={passwordValidation.hasUppercase} label="1 uppercase" /><PasswordRequirement met={passwordValidation.hasLowercase} label="1 lowercase" /><PasswordRequirement met={passwordValidation.hasNumber} label="1 number" /><PasswordRequirement met={passwordValidation.hasSpecial} label="1 special" /></div>}
<Input type="password" label="Confirm Password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); if (confirmPasswordError) setConfirmPasswordError(""); }} error={confirmPasswordError} required autoComplete="new-password" name="confirmPassword" id="confirmPassword" />
              <Button type="submit" className={`w-full transition-all duration-500 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} hover:scale-[1.02] active:scale-[0.98]`} loading={loading}>Reset Password</Button>
              <div className="mt-4 text-center"><button type="button" onClick={() => setStep("email")} className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Change email</button></div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
