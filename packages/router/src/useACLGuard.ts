import type { CanActivateFn } from './types';

import { useACL } from '@laser-pro/acl';
import { isObject } from 'lodash';
import { createElement } from 'react';
import { Navigate } from 'react-router-dom';

export function useACLGuard(redirect: string, state?: any): CanActivateFn {
  const acl = useACL();
  return (route) => {
    if (route.data && route.data.acl) {
      const params = isObject(route.data.acl) && 'control' in route.data.acl ? route.data.acl : { control: route.data.acl };
      if (!acl.can(params.control, params.mode)) {
        return createElement(Navigate, {
          to: redirect,
          state,
          replace: true,
        });
      }
    }

    return true;
  };
}
