"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  sendPasswordResetCode,
  verifyPasswordResetCode,
  resetCustomerPassword,
} from "@/lib/customerApi";

const STEP_EMAIL = 0;
const STEP_CODE = 1;
const STEP_PASSWORD = 2;
const STEP_DONE = 3;

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60;

function extractMessage(data, fallback) {
  const msg =
    data?.message ?? data?.Message ?? data?.result?.message ?? data?.result?.Message ?? "";
  return (typeof msg === "string" && msg.trim()) || fallback;
}

function isApiSuccess(data) {
  const code = data?.statusCode ?? data?.StatusCode;
  if (code === 200) return true;
  if (code === -99) return false;
  if (data?.success === true) return true;
  if (code != null && code !== 200) return false;
  return data?.result != null;
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(STEP_EMAIL);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const codeRefs = useRef([]);
  const timerRef = useRef(null);

  const startCooldown = useCallback(() => {
    setResendCooldown(RESEND_COOLDOWN);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => clearInterval(timerRef.current), []);

  useEffect(() => {
    if (step === STEP_CODE) codeRefs.current[0]?.focus();
  }, [step]);

  const handleSendCode = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const data = await sendPasswordResetCode({ email: email.trim() });
      if (!isApiSuccess(data)) {
        setError(extractMessage(data, "Could not send reset code. Please try again."));
        return;
      }
      setStep(STEP_CODE);
      setCode(Array(CODE_LENGTH).fill(""));
      startCooldown();
    } catch (err) {
      setError(parseApiError(err, "Failed to send reset code. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || loading) return;
    setError("");
    setLoading(true);
    try {
      const data = await sendPasswordResetCode({ email: email.trim() });
      if (!isApiSuccess(data)) {
        setError(extractMessage(data, "Could not resend code. Please try again."));
        return;
      }
      setCode(Array(CODE_LENGTH).fill(""));
      startCooldown();
    } catch (err) {
      setError(parseApiError(err, "Failed to resend code. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...code];
    next[index] = value;
    setCode(next);
    setError("");
    if (value && index < CODE_LENGTH - 1) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = Array(CODE_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setCode(next);
    const focusIdx = Math.min(pasted.length, CODE_LENGTH - 1);
    codeRefs.current[focusIdx]?.focus();
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError("");

    const codeStr = code.join("");
    if (codeStr.length < CODE_LENGTH) {
      setError(`Enter the ${CODE_LENGTH}-digit code sent to your email`);
      return;
    }

    setLoading(true);
    try {
      const data = await verifyPasswordResetCode({
        email: email.trim(),
        otp: codeStr,
      });
      if (!isApiSuccess(data)) {
        setError(extractMessage(data, "Invalid or expired code. Please try again."));
        return;
      }
      setStep(STEP_PASSWORD);
    } catch (err) {
      setError(parseApiError(err, "Invalid or expired code. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!newPassword) {
      setError("New password is required");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const data = await resetCustomerPassword({
        email: email.trim(),
        otp: code.join(""),
        newPassword,
        confirmPassword,
      });
      if (!isApiSuccess(data)) {
        setError(extractMessage(data, "Could not reset password. Please try again."));
        return;
      }
      setStep(STEP_DONE);
    } catch (err) {
      setError(parseApiError(err, "Failed to reset password. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}</style>

      <div className="max-w-md mx-auto px-4 py-12 sm:py-16 font-poppins">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8">
          {step === STEP_EMAIL && (
            <EmailStep
              email={email}
              setEmail={setEmail}
              error={error}
              loading={loading}
              onSubmit={handleSendCode}
            />
          )}

          {step === STEP_CODE && (
            <CodeStep
              email={email}
              code={code}
              codeRefs={codeRefs}
              error={error}
              loading={loading}
              resendCooldown={resendCooldown}
              onCodeChange={handleCodeChange}
              onCodeKeyDown={handleCodeKeyDown}
              onCodePaste={handleCodePaste}
              onSubmit={handleVerifyCode}
              onResend={handleResendCode}
              onBack={() => {
                setStep(STEP_EMAIL);
                setError("");
              }}
            />
          )}

          {step === STEP_PASSWORD && (
            <PasswordStep
              error={error}
              loading={loading}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              showNewPassword={showNewPassword}
              setShowNewPassword={setShowNewPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              onSubmit={handleResetPassword}
            />
          )}

          {step === STEP_DONE && <DoneStep />}

          {step !== STEP_DONE && (
            <p className="text-center text-sm text-slate-500 mt-6">
              <Link href="/signin" className="hover:text-slate-700">
                Back to Sign In
              </Link>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

function EmailStep({ email, setEmail, error, loading, onSubmit }) {
  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Forgot Password</h1>
        <p className="text-slate-600 text-sm mt-2">
          Enter your email and we&apos;ll send you a code to reset your password.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm text-black border border-slate-300 rounded-md outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E]/20 bg-white"
            placeholder="you@example.com"
            autoComplete="email"
            disabled={loading}
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#0D1B3E] hover:bg-[#1a2d5c] text-white font-semibold px-4 py-3 rounded-md text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Spinner /> Sending code...
            </>
          ) : (
            "Send reset code"
          )}
        </button>
      </form>
    </>
  );
}

function CodeStep({
  email,
  code,
  codeRefs,
  error,
  loading,
  resendCooldown,
  onCodeChange,
  onCodeKeyDown,
  onCodePaste,
  onSubmit,
  onResend,
  onBack,
}) {
  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Enter Code</h1>
        <p className="text-slate-600 text-sm mt-2">
          We&apos;ve sent a {CODE_LENGTH}-digit code to{" "}
          <span className="font-medium text-slate-800">{email}</span>
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3 text-center">
            Verification Code
          </label>
          <div className="flex justify-center gap-2" onPaste={onCodePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (codeRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => onCodeChange(i, e.target.value)}
                onKeyDown={(e) => onCodeKeyDown(i, e)}
                disabled={loading}
                className="w-11 h-12 text-center text-lg font-semibold text-black border border-slate-300 rounded-md outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E]/20 bg-white disabled:opacity-50"
              />
            ))}
          </div>
          {error && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#0D1B3E] hover:bg-[#1a2d5c] text-white font-semibold px-4 py-3 rounded-md text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Spinner /> Verifying...
            </>
          ) : (
            "Verify code"
          )}
        </button>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={onBack}
            className="text-slate-500 hover:text-slate-700"
          >
            &larr; Change email
          </button>
          <button
            type="button"
            onClick={onResend}
            disabled={resendCooldown > 0 || loading}
            className="text-[#0D1B3E] hover:text-[#1a2d5c] font-medium disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
          </button>
        </div>
      </form>
    </>
  );
}

function PasswordStep({
  error,
  loading,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  onSubmit,
}) {
  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">New Password</h1>
        <p className="text-slate-600 text-sm mt-2">
          Create a new password for your account.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            New Password
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 pr-10 text-sm text-black border border-slate-300 rounded-md outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E]/20 bg-white"
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={loading}
            />
            <TogglePasswordButton
              show={showNewPassword}
              onToggle={() => setShowNewPassword((v) => !v)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 pr-10 text-sm text-black border border-slate-300 rounded-md outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E]/20 bg-white"
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={loading}
            />
            <TogglePasswordButton
              show={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((v) => !v)}
            />
          </div>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#0D1B3E] hover:bg-[#1a2d5c] text-white font-semibold px-4 py-3 rounded-md text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Spinner /> Resetting password...
            </>
          ) : (
            "Reset password"
          )}
        </button>
      </form>
    </>
  );
}

function DoneStep() {
  return (
    <div className="text-center py-4">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
        <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-slate-900">Password Reset Successful</h2>
      <p className="text-sm text-slate-600 mt-2">
        Your password has been updated. You can now sign in with your new password.
      </p>
      <Link
        href="/signin"
        className="mt-6 inline-block w-full bg-[#0D1B3E] hover:bg-[#1a2d5c] text-white font-semibold px-4 py-3 rounded-md text-sm transition-colors text-center"
      >
        Sign In
      </Link>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function TogglePasswordButton({ show, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0D1B3E]/30 rounded"
      tabIndex={-1}
      aria-label={show ? "Hide password" : "Show password"}
    >
      {show ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );
}

function parseApiError(err, fallback) {
  const raw = err?.message ?? "";
  const suffix = raw.replace(/^API error \d+: /i, "").trim();
  if (!suffix) return fallback;
  try {
    const j = JSON.parse(suffix);
    if (j && typeof j.message === "string" && j.message.trim()) return j.message;
  } catch {
    /* not JSON */
  }
  return suffix || fallback;
}
