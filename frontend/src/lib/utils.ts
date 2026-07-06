import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | number | Date, pattern = "dd MMM yyyy"): string {
  return format(new Date(date), pattern);
}

export function formatDateTime(date: string | number | Date): string {
  return format(new Date(date), "dd MMM yyyy, HH:mm");
}

export function formatCurrency(value: number, currency = "BDT"): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-BD").format(value);
}