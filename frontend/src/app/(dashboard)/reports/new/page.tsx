"use client";

import { useState } from "react";
import { usePermission } from "@/hooks/usePermission";

const AVAILABLE_FIELDS = [
  "branchName",
  "productName",
  "outstandingAmount",
  "disbursedAmount",
  "sector",
  "currency",
  "cobDate",
];

export default function NewReportBuilderPage(): React.JSX.Element {
  const { permissions } = usePermission();
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [reportName, setReportName] = useState("");

  if (!permissions?.dynamicReportBuilder) {
    return (
      <p className="text-sm text-muted-foreground">
        You do not have permission to access the dynamic report builder.
      </p>
    );
  }

  const toggleField = (field: string): void => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-foreground">Dynamic Report Builder</h1>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reportName" className="text-sm font-medium text-foreground">
          Report name
        </label>
        <input
          id="reportName"
          type="text"
          value={reportName}
          onChange={(e) => setReportName(e.target.value)}
          className="w-72 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">Select fields</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {AVAILABLE_FIELDS.map((field) => (
            <label
              key={field}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground"
            >
              <input
                type="checkbox"
                checked={selectedFields.includes(field)}
                onChange={() => toggleField(field)}
              />
              {field}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          disabled={selectedFields.length === 0}
          className="rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-60"
        >
          Preview (first 100 rows)
        </button>
        <button
          type="button"
          disabled={!reportName || selectedFields.length === 0}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          Save report definition
        </button>
      </div>
    </div>
  );
}
