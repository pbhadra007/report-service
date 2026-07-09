import { Settings } from "lucide-react";

export default function AdminSettingsPage(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-400">System configuration for the IPDC Report Service.</p>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF0F9]">
          <Settings className="h-6 w-6 text-[#ED017F]" />
        </div>
        <p className="text-sm font-semibold text-gray-800">Settings coming soon</p>
        <p className="max-w-sm text-xs text-gray-400">
          System-wide configuration options will be available here in a future release.
        </p>
      </div>
    </div>
  );
}
