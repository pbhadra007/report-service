"use client";

import { use, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { generateReport } from "@/features/reports/api";
import type { ReportFilterParams, ReportResult } from "@/features/reports/types";
import { ReportFilters } from "@/components/report/ReportFilters";
import { ReportTable } from "@/components/report/ReportTable";
import { ExportToolbar } from "@/components/report/ExportToolbar";
import { useCobStore } from "@/store/cobStore";

export interface ReportViewerPageProps {
  params: Promise<{ id: string }>;
}

export default function ReportViewerPage({ params }: ReportViewerPageProps): React.JSX.Element {
  const { id } = use(params);
  const cobStatus = useCobStore((state) => state.cobStatus);
  const [result, setResult] = useState<ReportResult | null>(null);

  const mutation = useMutation({
    mutationFn: (filters: ReportFilterParams) => generateReport(id, filters),
    onSuccess: (data) => setResult(data),
  });

  const handleApply = (filters: ReportFilterParams): void => {
    mutation.mutate({ cobDate: cobStatus?.cobDate, ...filters });
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">
          {result?.name ?? "Report Viewer"}
        </h1>
        {result && <ExportToolbar reportId={id} fileName={result.name} />}
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <ReportFilters onApply={handleApply} />

        <div className="flex-1 overflow-hidden">
          {mutation.isPending && (
            <p className="text-sm text-muted-foreground">Generating report...</p>
          )}
          {mutation.isError && (
            <p className="text-sm text-destructive">Failed to generate report.</p>
          )}
          {!mutation.isPending && result && (
            <ReportTable columns={result.columns} rows={result.rows} />
          )}
          {!mutation.isPending && !result && (
            <p className="text-sm text-muted-foreground">
              Apply filters and generate the report to view data.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
