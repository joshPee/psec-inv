export type UserRole = 'Security Officer' | 'Supervisor' | 'Sector Head' | 'Admin';

export interface Permission {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  'Security Officer': 1,
  'Supervisor': 2,
  'Sector Head': 3,
  'Admin': 4,
};

export const PAGE_PERMISSIONS: Record<string, UserRole[]> = {
  // Dashboard - accessible by all
  '/admin/dashboard': ['Security Officer', 'Supervisor', 'Sector Head', 'Admin'],
  
  // Visitors section - accessible by all
  '/admin/check-in': ['Security Officer', 'Supervisor', 'Sector Head', 'Admin'],
  '/admin/visitors': ['Security Officer', 'Supervisor', 'Sector Head', 'Admin'],
  '/admin/pre-registration': ['Security Officer', 'Supervisor', 'Sector Head', 'Admin'],
  '/admin/visitor-history': ['Security Officer', 'Supervisor', 'Sector Head', 'Admin'],
  '/admin/check-out': ['Security Officer', 'Supervisor', 'Sector Head', 'Admin'],
  
  // Watchlist - view all, edit only Supervisor+
  '/admin/watchlist': ['Security Officer', 'Supervisor', 'Sector Head', 'Admin'],
  
  // Hosts & Staff - view all, edit only Supervisor+
  '/admin/hosts-staff': ['Security Officer', 'Supervisor', 'Sector Head', 'Admin'],
  
  // Vehicles - accessible by all
  '/admin/vehicles': ['Security Officer', 'Supervisor', 'Sector Head', 'Admin'],
  
  // Incidents - Supervisor+
  '/admin/incidents': ['Supervisor', 'Sector Head', 'Admin'],
  
  // Shift Handover - Supervisor+
  '/admin/shift-handover': ['Supervisor', 'Sector Head', 'Admin'],
  
  // Reports - Supervisor+
  '/admin/reports': ['Supervisor', 'Sector Head', 'Admin'],
  
  // Settings - Sector Head only
  '/admin/settings': ['Sector Head', 'Admin'],
  '/admin/visitor-categories': ['Sector Head', 'Admin'],
  '/admin/audit-log': ['Sector Head', 'Admin'],
};

export function canAccessPage(userRole: UserRole, path: string): boolean {
  const allowedRoles = PAGE_PERMISSIONS[path];
  if (!allowedRoles) return true; // Default to allow if not explicitly defined
  return allowedRoles.includes(userRole);
}

export function canEditResource(userRole: UserRole, resource: string): boolean {
  const editPermissions: Record<string, UserRole[]> = {
    'watchlist': ['Supervisor', 'Sector Head', 'Admin'],
    'hosts-staff': ['Supervisor', 'Sector Head', 'Admin'],
    'visitor-categories': ['Sector Head', 'Admin'],
    'audit-log': ['Sector Head', 'Admin'],
    'settings': ['Sector Head', 'Admin'],
  };
  
  const allowedRoles = editPermissions[resource];
  if (!allowedRoles) return false;
  return allowedRoles.includes(userRole);
}

export function getPermissions(userRole: UserRole, resource: string): Permission {
  return {
    canView: canAccessPage(userRole, `/admin/${resource}`),
    canEdit: canEditResource(userRole, resource),
    canDelete: canEditResource(userRole, resource), // Same as edit for now
  };
}