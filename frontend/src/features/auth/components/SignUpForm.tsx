"use client";

import { useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Mail, Phone } from "lucide-react";

const SENIORITY_OPTIONS = [
  "Junior Officer",
  "Officer",
  "Senior Officer",
  "Assistant Manager",
  "Deputy Manager",
  "Manager",
  "Senior Manager",
  "Assistant Vice President",
  "Vice President",
  "Senior Vice President",
  "Executive Vice President",
  "Deputy Managing Director",
] as const;

const DEPARTMENT_OPTIONS = [
  "IT & BT",
  "Finance",
  "Credit",
  "Treasury",
  "Deposit",
  "Operations",
  "HR",
  "Compliance",
  "Internal Audit",
  "Legal",
  "Marketing",
  "Admin",
] as const;

const EMPLOYEE_TYPE_OPTIONS = ["FTE", "OTS", "ITN", "CONTRACT", "INTERN"] as const;

const DESIGNATION_OPTIONS = [
  "Relationship Manager",
  "Credit Analyst",
  "Branch Manager",
  "Operations Officer",
  "Recovery Officer",
  "Compliance Officer",
  "IT Officer",
  "HR Officer",
  "Finance Officer",
  "System Administrator",
] as const;

const EMAIL_DOMAIN = "@ipdcbd.com";

const signUpSchema = z.object({
  userIdSuffix: z.string().min(1, "User ID is required").regex(/^[A-Za-z0-9-]+$/, "Only letters and numbers allowed"),
  name: z.string().min(1, "Name is required"),
  emailLocalPart: z
    .string()
    .min(1, "Email ID is required")
    .regex(/^[A-Za-z0-9._-]+$/, "Only letters, numbers, dots and hyphens allowed"),
  mobileSuffix: z.string().min(1, "Mobile number is required").regex(/^\d+$/, "Digits only"),
  designation: z.string().min(1, "Designation is required"),
  seniority: z.string().min(1, "Seniority is required"),
  department: z.string().min(1, "Department is required"),
  employeeType: z.string().min(1, "Employee type is required"),
  supervisor: z.string().min(1, "Supervisor is required"),
  teamLeader: z.string().min(1, "Team Leader is required"),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
  onBackToSignIn: () => void;
}

interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

function Field({ label, error, children }: FieldProps): React.JSX.Element {
  return (
    <div className="mb-4 w-full">
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label} <span className="text-red-500">*</span>
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

const inputClassName =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-poppins text-sm text-gray-700 " +
  "focus:outline-none focus:ring-2 focus:ring-[#232B2B] focus:border-transparent placeholder:text-gray-300 " +
  "transition-all duration-200 appearance-none";

interface PrefixFieldProps {
  prefix: string;
  placeholder: string;
  type?: "text" | "tel";
  registration: UseFormRegisterReturn;
}

function PrefixField({ prefix, placeholder, type = "text", registration }: PrefixFieldProps): React.JSX.Element {
  return (
    <div className="flex w-full items-center overflow-hidden rounded-xl border border-gray-200 bg-white pl-4 pr-1 focus-within:ring-2 focus-within:ring-[#232B2B]">
      <span className="select-none whitespace-nowrap text-sm font-medium text-gray-400">{prefix}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent py-2.5 pl-1 pr-3 font-poppins text-sm text-gray-700 outline-none"
        {...registration}
      />
    </div>
  );
}

interface SuffixFieldProps {
  suffix: string;
  placeholder: string;
  registration: UseFormRegisterReturn;
}

function SuffixField({ suffix, placeholder, registration }: SuffixFieldProps): React.JSX.Element {
  return (
    <div className="flex w-full items-center overflow-hidden rounded-xl border border-gray-200 bg-white pl-4 pr-1 focus-within:ring-2 focus-within:ring-[#232B2B]">
      <input
        type="text"
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent py-2.5 pr-1 font-poppins text-sm text-gray-700 outline-none"
        {...registration}
      />
      <span className="select-none whitespace-nowrap pr-3 text-sm font-medium text-gray-400">{suffix}</span>
    </div>
  );
}

export function SignUpForm({ onBackToSignIn }: SignUpFormProps): React.JSX.Element {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (): Promise<void> => {
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <CheckCircle2 className="h-14 w-14 text-green-500" />
        <h2 className="text-lg font-semibold text-[#232B2B]">Thank You for Submitting Your Request!</h2>
        <p className="text-sm text-gray-500">Please contact the BT Team:</p>
        <div className="flex flex-col items-center gap-1 text-sm text-gray-600">
          <span className="flex items-center gap-2">
            <Phone className="h-4 w-4" /> Extension: 888
          </span>
          <span className="flex items-center gap-2">
            <Mail className="h-4 w-4" /> btteam@ipdcbd.com
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            reset();
            setSubmitted(false);
            onBackToSignIn();
          }}
          className="mt-4 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          ← Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto w-full max-w-sm">
      <Field label="User ID (As Employee ID)" error={errors.userIdSuffix?.message}>
        <PrefixField prefix="IPDC-" placeholder="Enter employee number" registration={register("userIdSuffix")} />
      </Field>
      <Field label="Name" error={errors.name?.message}>
        <input className={inputClassName} {...register("name")} />
      </Field>
      <Field label="Email ID" error={errors.emailLocalPart?.message}>
        <SuffixField suffix={EMAIL_DOMAIN} placeholder="Enter email ID" registration={register("emailLocalPart")} />
      </Field>
      <Field label="Mobile No." error={errors.mobileSuffix?.message}>
        <PrefixField
          prefix="+88"
          placeholder="01XXXXXXXXX"
          type="tel"
          registration={register("mobileSuffix")}
        />
      </Field>
      <Field label="Designation" error={errors.designation?.message}>
        <select className={inputClassName} defaultValue="" {...register("designation")}>
          <option value="" disabled>
            Select...
          </option>
          {DESIGNATION_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Seniority" error={errors.seniority?.message}>
        <select className={inputClassName} defaultValue="" {...register("seniority")}>
          <option value="" disabled>
            Select...
          </option>
          {SENIORITY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Department" error={errors.department?.message}>
        <select className={inputClassName} defaultValue="" {...register("department")}>
          <option value="" disabled>
            Select...
          </option>
          {DEPARTMENT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Employee Type" error={errors.employeeType?.message}>
        <select className={inputClassName} defaultValue="" {...register("employeeType")}>
          <option value="" disabled>
            Select...
          </option>
          {EMPLOYEE_TYPE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Supervisor" error={errors.supervisor?.message}>
        <input className={inputClassName} {...register("supervisor")} />
      </Field>
      <Field label="Team Leader" error={errors.teamLeader?.message}>
        <input className={inputClassName} {...register("teamLeader")} />
      </Field>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl border border-[#232B2B] bg-[#232B2B] py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white hover:text-[#232B2B] disabled:opacity-60"
      >
        {isSubmitting ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
}
