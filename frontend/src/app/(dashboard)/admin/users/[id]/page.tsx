"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { fetchAdminUserById, updateAdminUser, type AdminUserDetail } from "@/features/admin/api";
import { EMPLOYEE_TYPES, DEPARTMENTS, DESIGNATIONS, BRANCHES, COST_CENTERS } from "@/config/lookups.config";
import { Toggle } from "@/components/common/Toggle";
import { MultiSelect } from "@/components/common/MultiSelect";
import { cn } from "@/lib/utils";

export interface AdminEditUserPageProps {
  params: Promise<{ id: string }>;
}

const schema = z
  .object({
    userId: z.string().min(1, "User ID is required"),
    employeeId: z.string().min(1, "Employee ID is required"),
    rmCode: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    employeeType: z.enum(EMPLOYEE_TYPES),
    mobile: z.string().min(1, "Mobile number is required"),
    email: z.string().email("Enter a valid email"),
    branchCodes: z.array(z.string()),
    costCenterCodes: z.array(z.string()),
    department: z.string().min(1, "Department is required"),
    designation: z.string().min(1, "Designation is required"),
    supervisor: z.string().optional(),
    teamLeader: z.string().optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    passwordRemainSame: z.boolean(),
    isAdmin: z.boolean(),
    isSuperAdmin: z.boolean(),
    authorizedMac: z.string().optional(),
    authorizedIp: z.string().optional(),
    badAttempts: z.string().min(1, "Required").refine((v) => Number(v) >= 1, "Must be at least 1"),
    forcePassChange: z.boolean(),
    checkExpiry: z.boolean(),
    unlockUser: z.boolean(),
    activeUser: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (!values.passwordRemainSame) {
      if (!values.password || values.password.length < 6) {
        ctx.addIssue({ code: "custom", path: ["password"], message: "Password must be at least 6 characters" });
      }
      if (values.password !== values.confirmPassword) {
        ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "Passwords do not match" });
      }
    }
  });

type EditUserFormValues = z.infer<typeof schema>;

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#232B2B] focus:border-transparent placeholder:text-gray-300 " +
  "transition-all duration-200";
const selectClass = cn(inputClass, "appearance-none cursor-pointer");
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500";

const EMPTY_VALUES: EditUserFormValues = {
  userId: "",
  employeeId: "",
  rmCode: "",
  name: "",
  employeeType: "FTE",
  mobile: "",
  email: "",
  branchCodes: [],
  costCenterCodes: [],
  department: "",
  designation: "",
  supervisor: "",
  teamLeader: "",
  password: "",
  confirmPassword: "",
  passwordRemainSame: true,
  isAdmin: false,
  isSuperAdmin: false,
  authorizedMac: "",
  authorizedIp: "",
  badAttempts: "3",
  forcePassChange: false,
  checkExpiry: false,
  unlockUser: false,
  activeUser: true,
};

function toFormValues(detail: AdminUserDetail): EditUserFormValues {
  return {
    userId: detail.userId.replace(/^IPDC-/, ""),
    employeeId: detail.employeeId,
    rmCode: detail.rmCode ?? "",
    name: detail.name,
    employeeType: detail.employeeType,
    mobile: detail.mobile.replace(/^\+88/, ""),
    email: detail.email,
    branchCodes: detail.branchCodes,
    costCenterCodes: detail.costCenterCodes,
    department: detail.department,
    designation: detail.designation,
    supervisor: detail.supervisor ?? "",
    teamLeader: detail.teamLeader ?? "",
    password: "",
    confirmPassword: "",
    passwordRemainSame: detail.passwordRemainSame,
    isAdmin: detail.isAdmin,
    isSuperAdmin: detail.isSuperAdmin,
    authorizedMac: detail.authorizedMac ?? "",
    authorizedIp: detail.authorizedIp ?? "",
    badAttempts: String(detail.badAttempts),
    forcePassChange: detail.forcePassChange,
    checkExpiry: detail.checkExpiry,
    unlockUser: detail.unlockUser,
    activeUser: detail.activeUser,
  };
}

export default function AdminEditUserPage({ params }: AdminEditUserPageProps): React.JSX.Element {
  const { id } = use(params);
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "error">("idle");

  const userQuery = useQuery({
    queryKey: ["admin", "users", id],
    queryFn: () => fetchAdminUserById(id),
    retry: false,
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(schema),
    values: userQuery.data ? toFormValues(userQuery.data) : EMPTY_VALUES,
  });

  const passwordRemainSame = watch("passwordRemainSame");

  const mutation = useMutation({
    mutationFn: (values: EditUserFormValues) =>
      updateAdminUser(id, {
        ...values,
        userId: `IPDC-${values.userId}`,
        mobile: `+88${values.mobile}`,
        badAttempts: Number(values.badAttempts),
      }),
    onSuccess: () => router.push("/admin/users"),
    onError: () => setStatus("error"),
  });

  const onSubmit = (values: EditUserFormValues): void => {
    setStatus("idle");
    mutation.mutate(values);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/users"
          aria-label="Back to User Management"
          className="rounded-xl p-2 transition-colors hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Edit User</h1>
          <p className="text-sm text-gray-400">{userQuery.data?.name ?? `User ID: ${id}`}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-500 uppercase tracking-wide">User Details</h2>

          {userQuery.isError && (
            <p className="mb-4 text-xs text-amber-600">Could not load this user&apos;s details — showing a blank form.</p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="userId" className={labelClass}>
                User ID *
              </label>
              <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-gray-50 opacity-70 focus-within:ring-2 focus-within:ring-[#232B2B]">
                <span className="select-none border-r border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-400">
                  IPDC-
                </span>
                <input
                  id="userId"
                  readOnly
                  {...register("userId")}
                  className="flex-1 cursor-not-allowed bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="employeeId" className={labelClass}>
                Employee ID *
              </label>
              <input id="employeeId" {...register("employeeId")} className={inputClass} />
              {errors.employeeId && <p className="mt-1 text-xs text-red-600">{errors.employeeId.message}</p>}
            </div>

            <div>
              <label htmlFor="rmCode" className={labelClass}>
                RM Code
              </label>
              <input id="rmCode" {...register("rmCode")} className={inputClass} />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="name" className={labelClass}>
                Name *
              </label>
              <input id="name" {...register("name")} className={inputClass} />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="employeeType" className={labelClass}>
                Employee Type *
              </label>
              <select id="employeeType" {...register("employeeType")} className={selectClass}>
                {EMPLOYEE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="mobile" className={labelClass}>
                Mobile *
              </label>
              <div className="flex overflow-hidden rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-[#232B2B]">
                <span className="select-none border-r border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-400">
                  +88
                </span>
                <input
                  id="mobile"
                  {...register("mobile")}
                  className="flex-1 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none"
                />
              </div>
              {errors.mobile && <p className="mt-1 text-xs text-red-600">{errors.mobile.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>
                Email *
              </label>
              <input id="email" type="email" {...register("email")} className={inputClass} />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <span className={labelClass}>Branch</span>
              <Controller
                control={control}
                name="branchCodes"
                render={({ field }) => (
                  <MultiSelect options={BRANCHES} selected={field.value} onChange={field.onChange} placeholder="Select branches..." />
                )}
              />
            </div>

            <div>
              <span className={labelClass}>Cost Center</span>
              <Controller
                control={control}
                name="costCenterCodes"
                render={({ field }) => (
                  <MultiSelect
                    options={COST_CENTERS}
                    selected={field.value}
                    onChange={field.onChange}
                    placeholder="Select cost centers..."
                  />
                )}
              />
            </div>

            <div>
              <label htmlFor="department" className={labelClass}>
                Department *
              </label>
              <select id="department" {...register("department")} className={selectClass}>
                <option value="">Select department</option>
                {DEPARTMENTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.department && <p className="mt-1 text-xs text-red-600">{errors.department.message}</p>}
            </div>

            <div>
              <label htmlFor="designation" className={labelClass}>
                Designation *
              </label>
              <select id="designation" {...register("designation")} className={selectClass}>
                <option value="">Select designation</option>
                {DESIGNATIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.designation && <p className="mt-1 text-xs text-red-600">{errors.designation.message}</p>}
            </div>

            <div>
              <label htmlFor="supervisor" className={labelClass}>
                Supervisor
              </label>
              <input id="supervisor" {...register("supervisor")} className={inputClass} />
            </div>

            <div>
              <label htmlFor="teamLeader" className={labelClass}>
                Team Leader
              </label>
              <input id="teamLeader" {...register("teamLeader")} className={inputClass} />
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                New Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Leave blank to keep current password"
                disabled={passwordRemainSame}
                {...register("password")}
                className={cn(inputClass, passwordRemainSame && "cursor-not-allowed opacity-50")}
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className={labelClass}>
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                disabled={passwordRemainSame}
                {...register("confirmPassword")}
                className={cn(inputClass, passwordRemainSame && "cursor-not-allowed opacity-50")}
              />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-gray-100 pt-6">
            <Controller
              control={control}
              name="passwordRemainSame"
              render={({ field }) => <Toggle label="User Password Remain Same" checked={field.value} onChange={field.onChange} />}
            />
            <Controller
              control={control}
              name="isAdmin"
              render={({ field }) => <Toggle label="Admin" checked={field.value} onChange={field.onChange} />}
            />
            <Controller
              control={control}
              name="isSuperAdmin"
              render={({ field }) => <Toggle label="Super Admin" checked={field.value} onChange={field.onChange} />}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-500 uppercase tracking-wide">Security Policy Setup</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="authorizedMac" className={labelClass}>
                Authorized MAC
              </label>
              <input id="authorizedMac" {...register("authorizedMac")} className={inputClass} />
            </div>

            <div>
              <label htmlFor="authorizedIp" className={labelClass}>
                Authorized IP
              </label>
              <input id="authorizedIp" {...register("authorizedIp")} className={inputClass} />
            </div>

            <div>
              <label htmlFor="badAttempts" className={labelClass}>
                No of Bad Attempts *
              </label>
              <input id="badAttempts" type="number" min={1} {...register("badAttempts")} className={inputClass} />
              {errors.badAttempts && <p className="mt-1 text-xs text-red-600">{errors.badAttempts.message}</p>}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-gray-100 pt-6">
            <Controller
              control={control}
              name="forcePassChange"
              render={({ field }) => <Toggle label="Force Pass Change" checked={field.value} onChange={field.onChange} />}
            />
            <Controller
              control={control}
              name="checkExpiry"
              render={({ field }) => <Toggle label="Check Expiry" checked={field.value} onChange={field.onChange} />}
            />
            <Controller
              control={control}
              name="unlockUser"
              render={({ field }) => <Toggle label="Unlock User" checked={field.value} onChange={field.onChange} />}
            />
            <Controller
              control={control}
              name="activeUser"
              render={({ field }) => <Toggle label="Active User" checked={field.value} onChange={field.onChange} />}
            />
          </div>
        </div>

        {status === "error" && <p className="text-sm font-medium text-red-600">Failed to save changes. Please try again.</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#232B2B] text-white text-sm
                      font-semibold border border-transparent hover:bg-white hover:text-[#232B2B]
                      hover:border-[#232B2B] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
          >
            {mutation.isPending && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {mutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      <footer className="mt-2 text-center text-xs text-gray-400">© 2026 - Business Transformation, IPDC Finance Limited</footer>
    </div>
  );
}
