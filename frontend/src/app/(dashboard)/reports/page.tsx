"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchReportCatalogue } from "@/features/reports/api";
import { REPORT_CATEGORIES } from "@/config/reports.config";
import type { ReportCategory } from "@/types";
import { formatDateTime } from "@/lib/utils";

export default function ReportsPage(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ReportCategory | "ALL">("ALL");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["reports", "catalogue"],
    queryFn: fetchReportCatalogue,
  });

  const filteredReports = useMemo(() => {
    if (!data) return [];
    return data.filter((report) => {
      const matchesSearch = report.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "ALL" || report.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [data, search, category]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-foreground">Report Catalogue</h1>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search reports..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ReportCategory | "ALL")}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="ALL">All categories</option>
          {REPORT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading reports...</p>}
      {isError && <p className="text-sm text-destructive">Failed to load report catalogue.</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredReports.map((report) => (
          <Link
            key={report.id}
            href={`/reports/${report.id}`}
            className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4 hover:border-primary"
          >
            <p className="text-xs font-medium text-muted-foreground">{report.category}</p>
            <p className="text-base font-semibold text-foreground">{report.name}</p>
            <p className="text-xs text-muted-foreground">
              {report.lastGeneratedAt
                ? `Last generated: ${formatDateTime(report.lastGeneratedAt)}`
                : "Not yet generated"}
            </p>
            <p className="text-xs text-muted-foreground">
              Export: {report.exportFormats.join(", ").toUpperCase()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
