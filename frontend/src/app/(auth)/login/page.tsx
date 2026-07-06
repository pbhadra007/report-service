import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage(): React.JSX.Element {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-8 bg-muted p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-base font-bold tracking-wide text-primary-foreground">
          IPDC
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-xl font-semibold text-foreground">IPDC Report Service</h1>
          <p className="text-sm text-muted-foreground">Sign in to access your reports</p>
        </div>
      </div>

      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
        <LoginForm />
      </div>
    </div>
  );
}
