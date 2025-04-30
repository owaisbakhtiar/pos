import { useAuth } from '../context/AuthContext';

/**
 * Hook to check if the user has the required role(s)
 * @param allowedRoles Array of roles allowed to access the resource
 * @returns Boolean indicating whether the user has access
 */
export function useRoleAccess(allowedRoles: string[]) {
  const { userRole, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !userRole) {
    return false;
  }
  
  return allowedRoles.includes(userRole);
} 