import type { CanActivateFn } from './types';

import { createElement } from 'react';
import { Navigate } from 'react-router-dom';

export function useTokenGuard(expired: boolean, redirect: string, state?: any): CanActivateFn {
  return () => {
    if (expired) {
      return createElement(Navigate, {
        to: redirect,
        state,
        replace: true,
      });
    }

    return true;
  };
}
