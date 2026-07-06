"use client";

import { useState } from "react";
import type { ReportFilterParams } from "@/features/reports/types";
import { cn } from "@/lib/utils";

export interface ReportFiltersProps {
  initialFilters?: ReportFilterParams;
  onApply: (filters: ReportFilterParams) => void;
}

export function ReportFilters({ initialFilters, onApply }: ReportFiltersProps): React.JSX.Element {
  const [filters, setFilters] = useState<ReportFilterParams>(initialFilters ?? {});

  const updateField = (field: keyof ReportFilterParams, value: string): void => {
    setFilters((prev) => ({ ...prev, [field]: value || undefined }));
  };

  const inputClass =
    "rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="flex w-64 shrink-0 flex-col gap-4 border-r border-border p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="dateFrom" className="text-xs font-medium text-muted-foreground">
          Date from
        </label>
        <input
          id="dateFrom"
          type="date"
          className={inputClass}
          value={filters.dateFrom ?? ""}
          onChange={(e) => updateField("dateFrom", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="dateTo" className="text-xs font-medium text-muted-foreground">
          Date to
        </label>
        <input
          id="dateTo"
          type="date"
          className={inputClass}
          value={filters.dateTo ?? ""}
          onChange={(e) => updateField("dateTo", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="branchId" className="text-xs font-medium text-muted-foreground">
          Branch
        </label>
        <input
          id="branchId"
          type="text"
          placeholder="All branches"
          className={inputClass}
          value={filters.branchId ?? ""}
          onChange={(e) => updateField("branchId", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="productId" className="text-xs font-medium text-muted-foreground">
          Product
        </label>
        <input
          id="productId"
          type="text"
          placeholder="All products"
          className={inputClass}
          value={filters.productId ?? ""}
          onChange={(e) => updateField("productId", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="sector" className="text-xs font-medium text-muted-foreground">
          Sector
        </label>
        <input
          id="sector"
          type="text"
          placeholder="All sectors"
          className={inputClass}
          value={filters.sector ?? ""}
          onChange={(e) => updateField("sector", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="currency" className="text-xs font-medium text-muted-foreground">
          Currency
        </label>
        <input
          id="currency"
          type="text"
          placeholder="BDT"
          className={inputClass}
          value={filters.currency ?? ""}
          onChange={(e) => updateField("currency", e.target.value)}
        />
      </div>

      <button
        type="button"
        onClick={() => onApply(filters)}
        className={cn(
          "mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
        )}
      >
        Apply filters
      </button>
    </div>
  );
}
