import { useAuth } from "@/hooks/useAuth";
import { getRolePermissions, canExport, hasSectionAccess } from "@/config/roles.config";
import type { RolePermissions } from "@/config/roles.config";
import type { ExportFormat } from "@/types";

export interface UsePermissionResult {
  permissions: RolePermissions | null;
  canExportFormat: (format: ExportFormat) => boolean;
  canAccessSection: (section: "dashboard" | "reports" | "regulatory" | "audit") => boolean;
}

export function usePermission(): UsePermissionResult {
  const { user } = useAuth();

  if (!user) {
    return {
      permissions: null,
      canExportFormat: () => false,
      canAccessSection: () => false,
    };
  }

  return {
    permissions: getRolePermissions(user.role),
    canExportFormat: (format) => canExport(user.role, format),
    canAccessSection: (section) => hasSectionAccess(user.role, section),
  };
}
