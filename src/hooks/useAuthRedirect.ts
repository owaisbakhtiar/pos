import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to redirect users based on authentication status
 * @param requireAuth Whether the route requires authentication
 */
export function useAuthRedirect(requireAuth: boolean = true) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      // Redirect to login if authentication is required but user is not authenticated
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' as never }],
      });
    } else if (!requireAuth && isAuthenticated) {
      // Redirect to home if authentication is not required but user is authenticated
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' as never }],
      });
    }
  }, [isAuthenticated, isLoading, navigation, requireAuth]);
} 