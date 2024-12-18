import type { CanActivateFn } from './types';

import { Navigate } from 'react-router-dom';

export function useTokenGuard(expired: boolean, redirect: string, state?: any): CanActivateFn {
  return () => {
    if (expired) {
      return <Navigate to={redirect} state={state} replace />;
    }

    return true;
  };
}
