import type { NavigateOptions } from 'react-router';

import { useEventCallback } from '@laser-ui/hooks';
import * as JSURL from 'jsurl';
import { isEqual } from 'lodash';
import { useState } from 'react';
import { useNavigate } from 'react-router';

export function useQueryParams<T>(defaultValue: T) {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useState<T>(() => {
    let params: any = {};
    if (typeof window !== 'undefined') {
      const query = new URLSearchParams(window.location.search).get(useQueryParams.KEY);
      params = query ? JSURL.parse(query) : {};
    }
    return { ...defaultValue, ...params };
  });
  const [query, setQuery] = useState(searchParams);

  const set = useEventCallback((value: T) => {
    if (!isEqual(value, query)) {
      setQuery(value);
    }

    return {
      value,
      saveToUrl: (options?: NavigateOptions) => {
        const searchParams = new URLSearchParams(window.location.search);
        const query = searchParams.get(useQueryParams.KEY);
        if (!isEqual(value, { ...defaultValue, ...(query ? JSURL.parse(query) : {}) })) {
          searchParams.set(useQueryParams.KEY, JSURL.stringify(value));
          navigate('?' + searchParams, { replace: true, ...options });

          setSearchParams(value);
        }
        return value;
      },
    };
  });

  const update = useEventCallback((value: Partial<T>, replace?: boolean) => {
    return set({ ...(replace ? defaultValue : query), ...value } as T);
  });

  return { value: query, set, update, saved: searchParams };
}

useQueryParams.KEY = 'q';
