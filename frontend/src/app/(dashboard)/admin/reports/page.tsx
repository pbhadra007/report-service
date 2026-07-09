import { FileText } from "lucide-react";

export default function AdminReportManagementPage(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Report Management</h1>
        <p className="text-sm text-gray-400">Manage the report catalogue and per-user report access.</p>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF0F9]">
          <FileText className="h-6 w-6 text-[#ED017F]" />
        </div>
        <p className="text-sm font-semibold text-gray-800">Report management coming soon</p>
        <p className="max-w-sm text-xs text-gray-400">
          Report catalogue editing and access assignment tools will be available here in a future release.
        </p>
      </div>
    </div>
  );
}
