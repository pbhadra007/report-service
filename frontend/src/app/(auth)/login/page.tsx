import Image from "next/image";
import { AuthPanel } from "@/features/auth/components/AuthPanel";

export default function LoginPage(): React.JSX.Element {
  return (
    <div className="flex h-screen w-full flex-1">
      <div className="relative hidden w-1/2 flex-col items-center justify-center bg-[#F2F1EE] px-12 md:flex">
        <div className="flex max-w-md flex-col items-center text-center">
          <h1 className="text-4xl font-bold text-[#232B2B]">Welcome Back!</h1>
          <p className="mt-2 text-sm text-gray-500">Sign in to IPDC Report Service</p>

          <svg
            width="280"
            height="180"
            viewBox="0 0 280 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mt-10"
          >
            <rect x="24" y="28" width="232" height="130" rx="20" fill="#232B2B" opacity="0.04" />
            <rect x="16" y="20" width="232" height="130" rx="20" fill="#E8E6E1" />
            <circle cx="70" cy="60" r="10" fill="#ED017F" opacity="0.35" />
            <rect x="100" y="52" width="120" height="10" rx="5" fill="#ffffff" />
            <rect x="100" y="72" width="90" height="8" rx="4" fill="#ffffff" opacity="0.8" />
            <rect x="48" y="104" width="184" height="8" rx="4" fill="#ffffff" opacity="0.8" />
            <rect x="48" y="122" width="130" height="8" rx="4" fill="#ffffff" opacity="0.6" />
          </svg>
        </div>

        <p className="absolute bottom-8 px-6 text-center text-xs text-gray-400">
          © 2026 - Business Transformation, IPDC Finance Limited
        </p>
      </div>

      <div className="flex w-full flex-col overflow-y-auto bg-white px-6 md:w-1/2">
        <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-8 py-16">
          <Image
            src="/images/ipdc-logo.png"
            alt="IPDC Finance"
            width={140}
            height={50}
            className="mx-auto mb-8 object-contain"
            priority
          />
          <AuthPanel />
        </div>
      </div>
    </div>
  );
}
