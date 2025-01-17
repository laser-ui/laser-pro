import type { NavigateOptions } from 'react-router';

import { useEventCallback } from '@laser-ui/hooks';
import * as JSURL from 'jsurl';
import { isEqual } from 'lodash';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

export function useQuery<T>(defaultParams: T) {
  const navigate = useNavigate();

  const [_params, setParams] = useState<Partial<T>>(() => {
    if (typeof window !== 'undefined') {
      const param = new URLSearchParams(window.location.search).get(useQuery.KEY);
      return param ? JSURL.parse(param) : {};
    }
    return {};
  });

  const params = useMemo<T>(() => ({ ...defaultParams, ..._params }), [_params]);
  const update = useEventCallback(
    (
      value: Partial<T>,
      options?: {
        clear?: boolean;
        navigateOptions?: NavigateOptions;
      },
    ) => {
      const { clear = false, navigateOptions } = options ?? {};

      const paramsAdded: Partial<T> = clear ? value : { ..._params, ...value };
      const paramsMerged = { ...defaultParams, ...paramsAdded };

      if (!isEqual(paramsMerged, params)) {
        setParams(paramsAdded);

        if (navigateOptions) {
          const newSearchParams = new URLSearchParams(window.location.search);
          newSearchParams.set(useQuery.KEY, JSURL.stringify(paramsAdded));
          navigate('?' + newSearchParams, { replace: true, ...navigateOptions });
        }
      }

      return paramsMerged;
    },
  );

  return [params, update] as const;
}

useQuery.KEY = 'q';
