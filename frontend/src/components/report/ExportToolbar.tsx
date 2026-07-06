"use client";

import { useState } from "react";
import { usePermission } from "@/hooks/usePermission";
import { downloadReportExport } from "@/lib/download";
import type { ExportFormat } from "@/types";
import { cn } from "@/lib/utils";

export interface ExportToolbarProps {
  reportId: string;
  fileName: string;
}

const FORMAT_LABELS: Record<ExportFormat, string> = {
  xlsx: "Excel",
  pdf: "PDF",
  csv: "CSV",
};

export function ExportToolbar({ reportId, fileName }: ExportToolbarProps): React.JSX.Element {
  const { canExportFormat } = usePermission();
  const [pendingFormat, setPendingFormat] = useState<ExportFormat | null>(null);

  const allFormats: ExportFormat[] = ["xlsx", "pdf", "csv"];
  const availableFormats = allFormats.filter((format) => canExportFormat(format));

  if (availableFormats.length === 0) {
    return <></>;
  }

  const handleExport = async (format: ExportFormat): Promise<void> => {
    setPendingFormat(format);
    try {
      await downloadReportExport(reportId, format, fileName);
    } finally {
      setPendingFormat(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {availableFormats.map((format) => (
        <button
          key={format}
          type="button"
          disabled={pendingFormat !== null}
          onClick={() => handleExport(format)}
          className={cn(
            "rounded-md border border-input px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-60",
          )}
        >
          {pendingFormat === format ? "Exporting..." : FORMAT_LABELS[format]}
        </button>
      ))}
    </div>
  );
}
