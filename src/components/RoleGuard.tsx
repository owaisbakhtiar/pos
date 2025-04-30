import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { useRoleAccess } from '../hooks/useRoleAccess';

interface RoleGuardProps {
  allowedRoles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component to conditionally render content based on user role
 * @param allowedRoles Array of roles allowed to access the content
 * @param children Content to render if the user has access
 * @param fallback Optional content to render if the user doesn't have access
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  allowedRoles, 
  children, 
  fallback = null 
}) => {
  const hasAccess = useRoleAccess(allowedRoles);
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}; 