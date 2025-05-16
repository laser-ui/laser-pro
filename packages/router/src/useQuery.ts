import type { NavigateOptions } from 'react-router';

import { useEventCallback } from '@laser-ui/hooks';
import * as JSURL from 'jsurl';
import { isEqual } from 'lodash';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';

export function useQuery<T>(defaultParams: T) {
  const navigate = useNavigate();

  const defaultParamsRef = useRef(defaultParams);
  const [params, setParams] = useState<Partial<T>>(() => {
    if (typeof window !== 'undefined') {
      const param = new URLSearchParams(window.location.search).get(useQuery.KEY);
      return param ? JSURL.parse(param) : {};
    }
    return {};
  });
  const allParams = { ...defaultParamsRef.current, ...params };

  const update = useEventCallback(
    (
      value: Partial<T>,
      options?: {
        replace?: boolean;
        navigateOptions?: NavigateOptions;
      },
    ) => {
      const { replace = false, navigateOptions } = options ?? {};

      const currentParams: Partial<T> = replace ? value : { ...params, ...value };
      const currentAllParams = { ...defaultParamsRef.current, ...currentParams };

      if (!isEqual(currentAllParams, allParams)) {
        setParams(currentParams);
      }

      if (navigateOptions) {
        const searchParams = new URLSearchParams(window.location.search);
        const value = JSURL.stringify(currentAllParams);
        if (searchParams.get(useQuery.KEY) !== value) {
          searchParams.set(useQuery.KEY, value);
          navigate('?' + searchParams, { replace: true, ...navigateOptions });
        }
      }

      return currentAllParams;
    },
  );

  return [allParams, update] as const;
}

useQuery.KEY = 'q';
