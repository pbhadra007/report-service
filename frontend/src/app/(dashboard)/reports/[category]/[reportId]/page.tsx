"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { getCategoryById, getReportById, REPORT_PARAM_FIELDS } from "@/config/reports.config";
import type { ReportParamKey } from "@/config/reports.config";
import { useReportAccess } from "@/hooks/useReportAccess";
import { generateReport } from "@/features/reports/api";
import { downloadReportBlob } from "@/lib/download";
import type { ReportOutputFormat } from "@/features/reports/types";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { cn } from "@/lib/utils";

export interface ReportParameterFormPageProps {
  params: Promise<{ category: string; reportId: string }>;
}

interface ReportFormValues {
  format: ReportOutputFormat;
  [key: string]: string;
}

function buildSchema(paramKeys: ReportParamKey[]) {
  const shape: Record<string, z.ZodTypeAny> = {
    format: z.enum(["PDF", "XLS"]),
  };
  for (const key of paramKeys) {
    shape[key] = key === "asOnDate" ? z.string().min(1, "As On Date is required") : z.string();
  }
  return z.object(shape);
}

const FORMAT_OPTIONS: { value: ReportOutputFormat; label: string; icon: string }[] = [
  { value: "PDF", label: "PDF Format", icon: "📄" },
  { value: "XLS", label: "Excel Format", icon: "📊" },
];

export default function ReportParameterFormPage({
  params,
}: ReportParameterFormPageProps): React.JSX.Element {
  const { category: categorySlug, reportId: reportIdParam } = use(params);
  const category = getCategoryById(categorySlug);
  const report = getReportById(Number(reportIdParam));
  const { accessibleReportIds, isLoading: isAccessLoading } = useReportAccess();

  if (!category || !report || report.category !== category.id) {
    notFound();
  }

  const schema = useMemo(() => buildSchema(report.params), [report]);

  const defaultValues = useMemo<ReportFormValues>(() => {
    const values: ReportFormValues = { format: "PDF" };
    for (const key of report.params) {
      values[key] = "";
    }
    return values;
  }, [report]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<ReportFormValues>,
    defaultValues,
  });

  const [selectedFormat, setSelectedFormat] = useState<ReportOutputFormat>("PDF");
  const formatField = register("format", {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      setSelectedFormat(event.target.value as ReportOutputFormat),
  });
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const mutation = useMutation({
    mutationFn: (values: ReportFormValues) => {
      const { format, ...rest } = values;
      return generateReport(report.reportId, rest, format);
    },
    onSuccess: (blob, values) => {
      downloadReportBlob(blob, report.name.replace(/\s+/g, "_"), values.format);
      setStatus("success");
    },
    onError: () => setStatus("error"),
  });

  const onSubmit = (values: ReportFormValues): void => {
    setStatus("idle");
    mutation.mutate(values);
  };

  const hasAccess = accessibleReportIds.includes(report.reportId);
  if (!isAccessLoading && !hasAccess) {
    notFound();
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: category.label, href: `/reports/${category.id}` },
          { label: report.name },
        ]}
      />

      <Link href={`/reports/${category.id}`} className="w-fit text-sm text-gray-500 hover:text-ipdc-pink">
        ← Back to {category.label} Reports
      </Link>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-800">{report.name}</h1>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
              ID: {report.reportId}
            </span>
          </div>
          <div className="my-4 border-t border-gray-100" />

          <h2 className="mb-4 text-sm font-semibold text-gray-600">Report Parameters</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {report.params.map((key) => {
              const field = REPORT_PARAM_FIELDS[key];
              return (
                <div key={key} className="flex flex-col gap-1.5">
                  <label htmlFor={key} className="text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  <input
                    id={key}
                    type={field.type}
                    placeholder={field.placeholder}
                    {...register(key)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-ipdc-pink focus:ring-2 focus:ring-ipdc-pink"
                  />
                  {errors[key] && <p className="text-xs text-red-600">{errors[key]?.message}</p>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-600">Report Format</h2>
          <div className="grid grid-cols-2 gap-4">
            {FORMAT_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-4 text-center transition",
                  selectedFormat === option.value
                    ? "border-2 border-ipdc-pink bg-ipdc-pink-50"
                    : "border-gray-200 hover:border-ipdc-pink",
                )}
              >
                <input type="radio" value={option.value} className="sr-only" {...formatField} />
                <span className="text-2xl">{option.icon}</span>
                <span className="text-sm font-medium text-gray-700">{option.label}</span>
                <span className="text-xs text-ipdc-pink">
                  {selectedFormat === option.value ? "● Selected" : "○"}
                </span>
              </label>
            ))}
          </div>
        </div>

        {status === "success" && (
          <p className="text-sm font-medium text-green-700">Report generated successfully</p>
        )}
        {status === "error" && (
          <p className="text-sm font-medium text-red-600">Failed to generate report. Please try again.</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-ipdc-pink px-8 py-3 text-sm font-semibold text-white hover:bg-ipdc-pink-dark disabled:opacity-60"
          >
            {mutation.isPending && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {mutation.isPending ? "Generating..." : "Generate Report"}
          </button>
          <button
            type="button"
            onClick={() => {
              reset(defaultValues);
              setSelectedFormat("PDF");
              setStatus("idle");
            }}
            className="ml-3 rounded-lg border border-gray-300 px-8 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Reset Input
          </button>
        </div>
      </form>

      <footer className="mt-auto pt-6 text-xs text-gray-400">
        © 2026 - Business Transformation, IPDC Finance Limited
      </footer>
    </div>
  );
}
