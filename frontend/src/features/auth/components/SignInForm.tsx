"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn, getSession } from "next-auth/react";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  usernameSuffix: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type Operator = "+" | "-" | "×" | "÷";

interface Captcha {
  a: number;
  b: number;
  operator: Operator;
  answer: number;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCaptcha(): Captcha {
  const operator = (["+", "-", "×", "÷"] as const)[Math.floor(Math.random() * 4)];

  if (operator === "-") {
    const a = randInt(10, 20);
    const b = randInt(1, a);
    return { a, b, operator, answer: a - b };
  }

  if (operator === "×") {
    const a = randInt(1, 9);
    const b = randInt(1, 9);
    return { a, b, operator, answer: a * b };
  }

  if (operator === "÷") {
    const b = randInt(1, 9);
    const answer = randInt(1, 9);
    return { a: b * answer, b, operator, answer };
  }

  const a = randInt(1, 20);
  const b = randInt(1, 20);
  return { a, b, operator, answer: a + b };
}

const fieldClassName =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-poppins text-sm text-gray-700 " +
  "focus:outline-none focus:ring-2 focus:ring-[#232B2B] focus:border-transparent placeholder:text-gray-300 " +
  "transition-all duration-200";

interface SignInFormProps {
  onForgotPassword: () => void;
}

export function SignInForm({ onForgotPassword }: SignInFormProps): React.JSX.Element {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState<Captcha>({ a: 0, b: 0, operator: "+", answer: 0 });
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  useEffect(() => {
    // Deferred to after mount so the random captcha renders only on the
    // client, matching the SSR markup and avoiding a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCaptcha(generateCaptcha());
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const regenerateCaptcha = (): void => {
    setCaptcha(generateCaptcha());
    setCaptchaAnswer("");
  };

  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    setServerError(null);
    setCaptchaError(null);

    if (Number(captchaAnswer) !== captcha.answer) {
      setCaptchaError("Incorrect captcha");
      regenerateCaptcha();
      return;
    }

    const result = await signIn("credentials", {
      email: `IPDC-${values.usernameSuffix}`,
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      setServerError("Invalid username or password.");
      regenerateCaptcha();
      return;
    }

    const session = await getSession();
    router.push(session?.user?.isAdmin ? "/admin/dashboard" : "/dashboard");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="username" className="mb-1 text-sm font-medium text-gray-700">
          Username
        </label>
        <div
          className={cn(
            "flex w-full items-center overflow-hidden rounded-xl border border-gray-200 bg-white pl-4 pr-1 focus-within:ring-2 focus-within:ring-[#232B2B]",
            errors.usernameSuffix && "border-red-500",
          )}
        >
          <span className="select-none whitespace-nowrap text-sm font-medium text-gray-400">IPDC-</span>
          <input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="Enter User ID"
            className="min-w-0 flex-1 bg-transparent py-2.5 pl-1 pr-3 font-poppins text-sm text-gray-700 outline-none"
            {...register("usernameSuffix")}
          />
        </div>
        {errors.usernameSuffix && <p className="text-xs text-red-600">{errors.usernameSuffix.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="cursor-pointer text-xs text-[#ED017F] hover:text-[#c4006a]"
          >
            Forget Password
          </button>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter Password"
            className={cn(fieldClassName, "pr-11", errors.password && "border-red-500")}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 py-1.5 pl-5 pr-1.5">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <span>
              {captcha.a} {captcha.operator} {captcha.b} =
            </span>
            <button
              type="button"
              onClick={regenerateCaptcha}
              aria-label="Regenerate captcha"
              className="text-gray-400 transition-transform hover:text-gray-600 hover:rotate-90"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Answer"
            value={captchaAnswer}
            onChange={(event) => setCaptchaAnswer(event.target.value)}
            className="w-28 rounded-xl border border-gray-200 bg-white px-3 py-2 text-center font-poppins text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#232B2B]"
          />
        </div>
        {captchaError && <p className="text-xs text-red-600">{captchaError}</p>}
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 w-full rounded-xl border border-[#232B2B] bg-[#232B2B] py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white hover:text-[#232B2B] disabled:opacity-60"
      >
        {isSubmitting ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
}
