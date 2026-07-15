import {
  type LucideIcon,
  HandCoins,
  Landmark,
  PiggyBank,
  FileQuestion,
  BarChart3,
  ScrollText,
  TrendingUp,
  FolderArchive,
} from "lucide-react";
import type { ReportCategoryId } from "@/config/reports.config";

export interface CategoryIconStyle {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

export const CATEGORY_ICON_STYLES: Record<ReportCategoryId, CategoryIconStyle> = {
  loan: { icon: HandCoins, iconBg: "bg-blue-50", iconColor: "text-blue-500" },
  treasury: { icon: Landmark, iconBg: "bg-purple-50", iconColor: "text-purple-500" },
  deposit: { icon: PiggyBank, iconBg: "bg-green-50", iconColor: "text-green-500" },
  other: { icon: FileQuestion, iconBg: "bg-amber-50", iconColor: "text-amber-500" },
  finance: { icon: BarChart3, iconBg: "bg-pink-50", iconColor: "text-pink-500" },
  "balance-certificate": { icon: ScrollText, iconBg: "bg-indigo-50", iconColor: "text-indigo-500" },
  summary: { icon: TrendingUp, iconBg: "bg-teal-50", iconColor: "text-teal-500" },
  crb: { icon: FolderArchive, iconBg: "bg-rose-50", iconColor: "text-rose-500" },
};
