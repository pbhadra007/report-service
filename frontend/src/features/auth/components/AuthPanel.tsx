"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

type View = "signin" | "signup" | "forgot";

export function AuthPanel(): React.JSX.Element {
  const [view, setView] = useState<View>("signin");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string): void => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="w-full">
      {view === "forgot" ? (
        <div className="mb-6 flex w-full rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setView("signin")}
            className="flex-1 rounded-xl bg-white px-6 py-2 text-sm font-semibold text-[#232B2B] shadow-sm"
          >
            Sign In
          </button>
        </div>
      ) : (
        <div className="relative mb-6 flex w-full rounded-xl bg-gray-100 p-1">
          <div
            className={cn(
              "absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-xl bg-white shadow-sm transition-transform duration-300 ease-out",
              view === "signup" && "translate-x-full",
            )}
          />
          <button
            type="button"
            onClick={() => setView("signin")}
            className={cn(
              "relative z-10 flex-1 rounded-xl px-6 py-2 text-sm transition-colors",
              view === "signin" ? "font-semibold text-[#232B2B]" : "font-medium text-gray-400",
            )}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setView("signup")}
            className={cn(
              "relative z-10 flex-1 rounded-xl px-6 py-2 text-sm transition-colors",
              view === "signup" ? "font-semibold text-[#232B2B]" : "font-medium text-gray-400",
            )}
          >
            Sign Up
          </button>
        </div>
      )}

      <div key={view} className="animate-fade-in">
        {view === "signin" && <SignInForm onForgotPassword={() => setView("forgot")} />}
        {view === "signup" && <SignUpForm onBackToSignIn={() => setView("signin")} />}
        {view === "forgot" && (
          <ForgotPasswordForm
            onBackToSignIn={() => setView("signin")}
            onResetSuccess={() => {
              showToast("Password reset successful");
              setView("signin");
            }}
          />
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#232B2B] px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
