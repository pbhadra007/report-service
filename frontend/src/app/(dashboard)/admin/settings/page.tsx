"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchAppSettings, updateAppSettings, DEFAULT_APP_SETTINGS } from "@/features/admin/settingsApi";
import { Toggle } from "@/components/common/Toggle";

const schema = z.object({
  appName: z.string().min(1, "App name is required"),
  supportEmail: z.string().email("Enter a valid email"),
  footerText: z.string().min(1, "Footer text is required"),
  maintenanceMode: z.boolean(),
});

type SettingsFormValues = z.infer<typeof schema>;

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#232B2B] focus:border-transparent placeholder:text-gray-300 " +
  "transition-all duration-200";
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500";

export default function AdminSettingsPage(): React.JSX.Element {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const settingsQuery = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: fetchAppSettings,
    retry: false,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(schema),
    values: settingsQuery.data ?? DEFAULT_APP_SETTINGS,
  });

  const mutation = useMutation({
    mutationFn: (values: SettingsFormValues) => updateAppSettings(values),
    onSuccess: () => setStatus("success"),
    onError: () => setStatus("error"),
  });

  const onSubmit = (values: SettingsFormValues): void => {
    setStatus("idle");
    mutation.mutate(values);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-400">App-level configuration for the IPDC Report Service.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-500 uppercase tracking-wide">App Settings</h2>

          {settingsQuery.isError && (
            <p className="mb-4 text-xs text-amber-600">
              Could not load saved settings — showing defaults.
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="appName" className={labelClass}>
                App Name *
              </label>
              <input id="appName" {...register("appName")} className={inputClass} />
              {errors.appName && <p className="mt-1 text-xs text-red-600">{errors.appName.message}</p>}
            </div>

            <div>
              <label htmlFor="supportEmail" className={labelClass}>
                Support Email *
              </label>
              <input id="supportEmail" type="email" {...register("supportEmail")} className={inputClass} />
              {errors.supportEmail && <p className="mt-1 text-xs text-red-600">{errors.supportEmail.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="footerText" className={labelClass}>
                Footer Text *
              </label>
              <input id="footerText" {...register("footerText")} className={inputClass} />
              {errors.footerText && <p className="mt-1 text-xs text-red-600">{errors.footerText.message}</p>}
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-6">
            <Controller
              control={control}
              name="maintenanceMode"
              render={({ field }) => <Toggle label="Maintenance Mode" checked={field.value} onChange={field.onChange} />}
            />
            <p className="mt-2 text-xs text-gray-400">
              When enabled, non-admin users see a maintenance notice instead of the report portal.
            </p>
          </div>
        </div>

        {status === "success" && <p className="text-sm font-medium text-green-700">Settings saved successfully.</p>}
        {status === "error" && <p className="text-sm font-medium text-red-600">Failed to save settings. Please try again.</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#ED017F] text-white text-sm
                      font-semibold border border-[#ED017F] hover:bg-white hover:text-[#ED017F]
                      transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
          >
            {mutation.isPending && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {mutation.isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}