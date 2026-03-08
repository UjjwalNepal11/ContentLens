"use client";

import { useState, useEffect } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X, Mail } from "lucide-react";

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

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | React.ReactNode>("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setFirstNameError(""); setLastNameError(""); setEmailError(""); setPasswordError(""); setConfirmPasswordError("");
    if (!isLoaded) return;
    if (!validateEmail(email)) { setEmailError("Please enter a valid email address"); return; }
    const validation = validatePassword(password);
    if (!validation.isValid) { setPasswordError("Password must meet all requirements: " + validation.errors.join(", ")); return; }
    if (password !== confirmPassword) { setConfirmPasswordError("Passwords do not match"); return; }
    setLoading(true);
    try {
      await signUp.create({ firstName, lastName, emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      if (err.errors && err.errors[0]) {
        const ed = err.errors[0];
        if (ed.code === 'form_identifier_exists' && ed.meta?.paramName === 'email_address') {
          setError(<>An account with this email already exists. <Link href="/sign-in" className="underline font-medium text-indigo-600 dark:text-indigo-400">Sign in instead</Link>.</>);
        } else if (ed.meta?.paramName === "email_address") setEmailError(ed.longMessage || ed.message);
        else if (ed.meta?.paramName === "password") setPasswordError(ed.longMessage || ed.message);
        else if (ed.meta?.paramName === "first_name") setFirstNameError(ed.longMessage || ed.message);
        else if (ed.meta?.paramName === "last_name") setLastNameError(ed.longMessage || ed.message);
        else setError(ed.longMessage || ed.message);
      } else { setError(err.message || "Failed to create account"); }
    } finally { setLoading(false); }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtpCode(v);
    if (otpError) setOtpError("");
    if (v.length === 6) handleVerifyOTP(v);
  };

  const handleVerifyOTP = async (code?: string) => {
    const otp = code || otpCode;
    if (!isLoaded || otp.length !== 6) return;
    setLoading(true); setError("");
    try {
      const r = await signUp.attemptEmailAddressVerification({ code: otp });
      if (r.status === "complete") { await setActive({ session: r.createdSessionId }); router.push("/dashboard"); }
      else setOtpError("Verification failed. Please try again.");
    } catch (err: any) { setOtpError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Invalid verification code"); }
    finally { setLoading(false); }
  };

  const handleGoogleSignUp = async () => {
    if (!isLoaded) return;
    sessionStorage.setItem("oauth_return_url", "/sign-up");
    setGoogleLoading(true);
    try { await signUp.authenticateWithRedirect({ strategy: "oauth_google", redirectUrl: "/sso-callback", redirectUrlComplete: "/dashboard" }); }
    catch (err: any) { setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Failed to sign up with Google"); setGoogleLoading(false); }
  };

  const handleGithubSignUp = async () => {
    if (!isLoaded) return;
    sessionStorage.setItem("oauth_return_url", "/sign-up");
    setGithubLoading(true);
    try { await signUp.authenticateWithRedirect({ strategy: "oauth_github", redirectUrl: "/sso-callback", redirectUrlComplete: "/dashboard" }); }
    catch (err: any) { setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Failed to sign up with GitHub"); setGithubLoading(false); }
  };

  if (!isLoaded) return (<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800"><div className="animate-spin"><Loader2 className="h-8 w-8 text-indigo-500" /></div></div>);

  if (pendingVerification) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-3 sm:p-4">
      <div className="w-full max-w-[350px] sm:max-w-[420px]">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-5 sm:p-8 animate-in fade-in zoom-in duration-300">
<div className="flex justify-center mb-4 sm:mb-6"><div className="h-10 sm:h-12 w-30 sm:w-30 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25"><span className="text-white text-lg sm:text-xl font-bold">ContentLens</span></div></div>
          <div className="text-center mb-5 sm:mb-8"><h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Verify Your Email</h1><p className="text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 text-sm">We sent a verification code to<br /><span className="text-slate-900 dark:text-white font-medium">{email}</span></p></div>
          {emailSent && <div className="mb-4 sm:mb-6 p-2.5 sm:p-3 rounded-lg bg-green-50 dark:bg-green-950/50 border border-green-200/50 dark:border-green-800/50 animate-in slide-in-from-top duration-300"><div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm"><Mail className="h-4 w-4 flex-shrink-0" /><p>Verification code sent! Check your inbox.</p></div></div>}
          {typeof error === 'string' && error && <div className="mb-4 sm:mb-6 p-2.5 sm:p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200/50 dark:border-red-800/50 animate-shake"><p className="text-xs sm:text-sm text-red-600 dark:text-red-400 text-center">{error}</p></div>}
          <form onSubmit={(e) => { e.preventDefault(); handleVerifyOTP(); }} className="space-y-3 sm:space-y-4">
            <Input type="text" label="Verification Code" placeholder="Enter 6-digit code" value={otpCode} onChange={handleOtpChange} error={otpError} required maxLength={6} autoComplete="one-time-code" className="text-center tracking-[0.5em] text-lg" />
            <Button type="submit" className="w-full" loading={loading}>Verify & Create Account</Button>
          </form>
          <div className="text-center mt-4">
            {resendCooldown > 0 ? <p className="text-sm text-slate-500 dark:text-slate-400">Resend code in <span className="font-medium">{resendCooldown}s</span></p> : <button type="button" onClick={async () => { try { await signUp.prepareEmailAddressVerification({ strategy: "email_code" }); setError(""); setEmailSent(true); setResendCooldown(60); setTimeout(() => setEmailSent(false), 5000); } catch { setError("Failed to resend code"); } }} className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">Resend code</button>}
          </div>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5 sm:mt-6"><button type="button" onClick={() => setPendingVerification(false)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors">Go back</button></p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-3 sm:p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 sm:w-80 h-40 sm:h-80 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-2xl sm:blur-3xl ${isVisible ? 'animate-pulse' : 'opacity-0'}`} />
        <div className={`absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 sm:w-80 h-40 sm:h-80 bg-violet-500/20 dark:bg-violet-500/10 rounded-full blur-2xl sm:blur-3xl ${isVisible ? 'animate-pulse' : 'opacity-0'}`} style={{ animationDelay: '1s' }} />
      </div>
      <div className={`w-full max-w-[350px] sm:max-w-[420px] relative z-10 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-5 sm:p-8">
<div className={`flex justify-center mb-4 sm:mb-6 transition-all duration-500 delay-100 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}><div className="h-12 sm:h-14 w-30 sm:w-30 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105 px-2"><span className="text-white text-base sm:text-lg font-bold whitespace-nowrap">ContentLens</span></div></div>
          <div className={`text-center mb-5 sm:mb-8 transition-all duration-500 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}><h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Create Your Account</h1><p className="text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 text-sm sm:text-base">Start using AI analysis today</p></div>
          {typeof error === 'string' && error && <div className="mb-4 sm:mb-6 p-2.5 sm:p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200/50 dark:border-red-800/50 animate-shake"><p className="text-xs sm:text-sm text-red-600 dark:text-red-400 text-center">{error}</p></div>}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 transition-all duration-500 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Input type="text" label="First Name" placeholder="John" value={firstName} onChange={(e) => { setFirstName(e.target.value); if (firstNameError) setFirstNameError(""); }} error={firstNameError} autoComplete="given-name" name="firstName" id="firstName" />
              <Input type="text" label="Last Name" placeholder="Paul" value={lastName} onChange={(e) => { setLastName(e.target.value); if (lastNameError) setLastNameError(""); }} error={lastNameError} autoComplete="family-name" name="lastName" id="lastName" />
            </div>
            <div className={`transition-all duration-500 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}><Input type="email" label="Email" placeholder="john@example.com" value={email} onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }} error={emailError} required autoComplete="email" name="email" id="email" /></div>
            <div className={`transition-all duration-500 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}><Input type="password" label="Password" placeholder="Create a strong password" value={password} onChange={(e) => handlePasswordChange(e.target.value)} error={passwordError} required autoComplete="new-password" name="password" id="password" /></div>
            {password && <div className={`grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 pt-2 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}><PasswordRequirement met={passwordValidation.hasLength} label="8+ characters" /><PasswordRequirement met={passwordValidation.hasUppercase} label="1 uppercase" /><PasswordRequirement met={passwordValidation.hasLowercase} label="1 lowercase" /><PasswordRequirement met={passwordValidation.hasNumber} label="1 number" /><PasswordRequirement met={passwordValidation.hasSpecial} label="1 special" /></div>}
            <div className={`transition-all duration-500 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}><Input type="password" label="Confirm Password" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); if (confirmPasswordError) setConfirmPasswordError(""); }} error={confirmPasswordError} required autoComplete="new-password" name="confirmPassword" id="confirmPassword" /></div>
            <div id="clerk-captcha" />
            <Button type="submit" className={`w-full transition-all duration-500 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} hover:scale-[1.02] active:scale-[0.98]`} loading={loading}>Create Account</Button>
          </form>
          <div className="relative my-4 sm:my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-slate-900 px-2 text-slate-500 dark:text-slate-400">or</span></div></div>
          <Button type="button" variant="google" className={`w-full transition-all duration-500 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} hover:scale-[1.02] active:scale-[0.98]`} onClick={handleGoogleSignUp} loading={googleLoading}><svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>Continue with Google</Button>
          <Button type="button" variant="outline" className={`w-full mt-2 sm:mt-3 transition-all duration-500 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} hover:scale-[1.02] active:scale-[0.98]`} onClick={handleGithubSignUp} loading={githubLoading}><svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>Continue with GitHub</Button>
          <p className={`text-center text-sm text-slate-500 dark:text-slate-400 mt-5 sm:mt-6 transition-all duration-500 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>Already have an account? <Link href="/sign-in" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-all duration-200 hover:underline decoration-2 underline-offset-2">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
