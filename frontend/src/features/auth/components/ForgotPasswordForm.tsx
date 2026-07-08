"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Step = "request" | "otp" | "reset";
type OtpMethod = "sms" | "email";

interface ForgotPasswordFormProps {
  onBackToSignIn: () => void;
  onResetSuccess: () => void;
}

const RESEND_SECONDS = 30;

const inputClassName =
  "w-full rounded-full border border-gray-200 bg-white px-4 py-3 font-poppins text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300";

const submitButtonClassName =
  "w-full rounded-full border border-[#232B2B] bg-[#232B2B] py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-white hover:text-[#232B2B] disabled:opacity-60";

export function ForgotPasswordForm({ onBackToSignIn, onResetSuccess }: ForgotPasswordFormProps): React.JSX.Element {
  const [step, setStep] = useState<Step>("request");
  const [userId, setUserId] = useState("");
  const [method, setMethod] = useState<OtpMethod>("sms");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (step !== "otp" || secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [step, secondsLeft]);

  const handleRequestSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    setStep("otp");
    setSecondsLeft(RESEND_SECONDS);
    setOtp(Array(6).fill(""));
  };

  const handleResendOtp = (): void => {
    setSecondsLeft(RESEND_SECONDS);
    setOtp(Array(6).fill(""));
    otpRefs.current[0]?.focus();
  };

  const handleOtpChange = (index: number, value: string): void => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = (): void => {
    if (otp.some((digit) => digit === "")) {
      setOtpError("Enter the complete 6-digit OTP");
      return;
    }
    setOtpError(null);
    setStep("reset");
  };

  const handleResetSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordError(null);
    onResetSuccess();
  };

  if (step === "reset") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-1 py-2 text-center">
          <span className="text-3xl">✅</span>
          <h2 className="text-base font-semibold text-[#232B2B]">Identity Verified!</h2>
        </div>
        <form onSubmit={handleResetSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className={inputClassName}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className={inputClassName}
            />
          </div>
          {passwordError && <p className="text-xs text-red-600">{passwordError}</p>}
          <button type="submit" className={submitButtonClassName}>
            Reset Password
          </button>
        </form>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="text-3xl">📱</span>
        <div>
          <h2 className="text-base font-semibold text-[#232B2B]">OTP Sent!</h2>
          <p className="mt-1 text-sm text-gray-500">Enter the OTP sent to your registered SMS/Email</p>
        </div>

        <div className="flex items-center justify-center gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                otpRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(event) => handleOtpChange(index, event.target.value)}
              onKeyDown={(event) => handleOtpKeyDown(index, event)}
              className="h-10 w-10 rounded-full border border-gray-200 text-center text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          ))}
        </div>
        {otpError && <p className="text-xs text-red-600">{otpError}</p>}

        <button
          type="button"
          onClick={handleResendOtp}
          disabled={secondsLeft > 0}
          className="text-sm text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:hover:text-gray-400"
        >
          Resend OTP{secondsLeft > 0 ? ` (00:${secondsLeft.toString().padStart(2, "0")})` : ""}
        </button>

        <div className="flex w-full flex-col gap-3">
          <button type="button" onClick={handleVerifyOtp} className={submitButtonClassName}>
            Verify OTP
          </button>
          <button type="button" onClick={onBackToSignIn} className="text-sm text-gray-400 hover:text-gray-600">
            ← Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 w-full rounded-full border border-gray-200 bg-gray-50 py-3 text-center text-sm font-semibold text-gray-700">
        Forget Password
      </div>

      <form onSubmit={handleRequestSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Enter User ID</label>
          <input
            placeholder="IPDC-"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            className={inputClassName}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Send OTP via</label>
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-[#232B2B] px-6 py-2 text-sm font-medium text-white">OTP</span>

            <button type="button" onClick={() => setMethod("sms")} className="flex items-center gap-2 text-sm text-gray-700">
              SMS
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border-2",
                  method === "sms" ? "border-[#232B2B]" : "border-gray-300",
                )}
              >
                {method === "sms" && <span className="h-3 w-3 rounded-full bg-[#232B2B]" />}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMethod("email")}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              Email
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border-2",
                  method === "email" ? "border-[#232B2B]" : "border-gray-300",
                )}
              >
                {method === "email" && <span className="h-3 w-3 rounded-full bg-[#232B2B]" />}
              </span>
            </button>
          </div>
        </div>

        <button type="submit" className={submitButtonClassName}>
          Submit
        </button>

        <button type="button" onClick={onBackToSignIn} className="text-center text-sm text-gray-400 hover:text-gray-600">
          ← Back to Sign In
        </button>
      </form>
    </div>
  );
}
