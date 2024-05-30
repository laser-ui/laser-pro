import type { CanActivateFn } from './types';
import type { Token } from '@laser-pro/auth';

import { isNull } from 'lodash';
import { createElement } from 'react';
import { Navigate } from 'react-router-dom';

export function useTokenGuard(token: Token, redirect: string, state?: any): CanActivateFn {
  return () => {
    if (isNull(token.value) || token.expired) {
      return createElement(Navigate, {
        to: redirect,
        state,
        replace: true,
      });
    }

    return true;
  };
}
