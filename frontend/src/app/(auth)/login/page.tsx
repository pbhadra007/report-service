import Image from "next/image";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage(): React.JSX.Element {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 bg-[#F5F5F5] p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="flex flex-col items-center gap-3">
          <Image src="/images/ipdc-logo.png" alt="IPDC" width={160} height={48} className="h-12 w-auto" priority />
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-xl font-semibold text-gray-800">IPDC Report Service</h1>
            <p className="text-sm text-gray-500">Sign in to your account</p>
          </div>
        </div>

        <div className="mt-6">
          <LoginForm />
        </div>
      </div>

      <p className="text-xs text-gray-400">© 2026 - Business Transformation, IPDC Finance Limited</p>
    </div>
  );
}
