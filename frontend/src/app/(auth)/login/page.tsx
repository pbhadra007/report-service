import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage(): React.JSX.Element {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-8 bg-muted p-6">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-xl font-semibold text-foreground">IPDC Report Service</h1>
        <p className="text-sm text-muted-foreground">Sign in to access your reports</p>
      </div>
      <LoginForm />
    </div>
  );
}
