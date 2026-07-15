"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, FileText, FileSpreadsheet, Check } from "lucide-react";
import { getCategoryById, getReportById, REPORT_PARAM_FIELDS } from "@/config/reports.config";
import type { ReportParamKey } from "@/config/reports.config";
import { useReportAccess } from "@/hooks/useReportAccess";
import { generateReport } from "@/features/reports/api";
import { downloadReportBlob } from "@/lib/download";
import type { ReportOutputFormat } from "@/features/reports/types";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { BentoDatePicker } from "@/components/common/BentoDatePicker";
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
    const field = REPORT_PARAM_FIELDS[key];
    const isRequired = field.type === "date" && field.required !== false;
    shape[key] = isRequired ? z.string().min(1, `${field.label} is required`) : z.string();
  }
  return z.object(shape);
}

const FORMAT_OPTIONS: { value: ReportOutputFormat; label: string; icon: typeof FileText }[] = [
  { value: "PDF", label: "PDF Format", icon: FileText },
  { value: "XLS", label: "Excel Format", icon: FileSpreadsheet },
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
    control,
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/reports/${category.id}`}
          aria-label={`Back to ${category.label} Reports`}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Link>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: category.label, href: `/reports/${category.id}` },
            { label: report.name },
          ]}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-800">{report.name}</h1>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              Report ID: {report.reportId}
            </span>
          </div>
          <div className="my-4 border-t border-gray-100" />

          <h2 className="mb-4 text-sm font-semibold text-gray-500 uppercase tracking-wide">Report Parameters</h2>
          <div className={cn("grid grid-cols-1 gap-4", report.params.length > 1 && "sm:grid-cols-2")}>
            {report.params.map((key) => {
              const field = REPORT_PARAM_FIELDS[key];
              return (
                <div key={key} className="flex flex-col gap-1.5">
                  <label htmlFor={key} className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {field.label}
                  </label>
                  {field.type === "date" ? (
                    <Controller
                      name={key}
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <BentoDatePicker id={key} value={value} onChange={onChange} />
                      )}
                    />
                  ) : (
                    <input
                      id={key}
                      type={field.type}
                      placeholder={field.placeholder}
                      {...register(key)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700
                                outline-none focus:outline-none focus:ring-2 focus:ring-[#232B2B] focus:border-transparent
                                placeholder:text-gray-300 transition-all duration-200"
                    />
                  )}
                  {errors[key] && <p className="text-xs text-red-600">{errors[key]?.message}</p>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-500 uppercase tracking-wide">Select Format</h2>
          <div className="grid grid-cols-2 gap-4">
            {FORMAT_OPTIONS.map((option) => {
              const isSelected = selectedFormat === option.value;
              const Icon = option.icon;
              return (
                <label
                  key={option.value}
                  className={cn(
                    "relative flex cursor-pointer flex-col items-center gap-2 rounded-xl p-4 text-center transition-all duration-200",
                    isSelected ? "border-2 border-[#232B2B] bg-gray-50" : "border border-gray-200 hover:border-gray-300",
                  )}
                >
                  <input type="radio" value={option.value} className="sr-only" {...formatField} />
                  {isSelected && (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#ed017f]">
                      <Check className="h-3 w-3 text-white" />
                    </span>
                  )}
                  <Icon className="h-6 w-6 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{option.label}</span>
                </label>
              );
            })}
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
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#ed017f] text-white text-sm
                      font-semibold border border-[#ed017f] hover:bg-white hover:text-[#ed017f]
                      transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
          >
            {mutation.isPending && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
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
            className="px-6 py-2.5 rounded-full bg-white text-gray-700 text-sm font-medium border border-gray-200
                      hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            Reset Input
          </button>
        </div>
      </form>
    </div>
  );
}