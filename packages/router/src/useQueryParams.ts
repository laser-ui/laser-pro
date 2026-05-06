import type { JsonValue } from './types';
import type { NavigateOptions } from 'react-router';

import { useEventCallback } from '@laser-ui/hooks';
import * as JSURL from 'jsurl';
import { isEqual, isFunction } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

export function useQueryParams<T extends Record<keyof T, JsonValue>>(defaultValue: T, key: string = useQueryParams.KEY) {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams, setSearchParams] = useState<T>(() => {
    let params: any = {};
    if (typeof window !== 'undefined') {
      const query = new URLSearchParams(window.location.search).get(key);
      params = query ? JSURL.parse(query) : {};
    }
    return { ...defaultValue, ...params };
  });
  const [query, setQuery] = useState(searchParams);
  const queryRef = useRef(query);

  useEffect(() => {
    const urlQuery = new URLSearchParams(location.search).get(key);
    const params = urlQuery ? JSURL.parse(urlQuery) : {};
    const newValue = { ...defaultValue, ...params };
    if (!isEqual(newValue, queryRef.current)) {
      setSearchParams(newValue);
      setQuery(newValue);
      queryRef.current = newValue;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, key]);

  const set = useEventCallback((value: T | ((prev: T) => T)) => {
    const fn = (value: T) => {
      if (!isEqual(value, query)) {
        setQuery(value);
        queryRef.current = value;
      }

      return {
        value,
        saveToUrl: (options?: NavigateOptions) => {
          const searchParams = new URLSearchParams(window.location.search);
          const savedQuery = searchParams.get(key);
          if (!isEqual(value, { ...defaultValue, ...(savedQuery ? JSURL.parse(savedQuery) : {}) })) {
            searchParams.set(key, JSURL.stringify(value));
            navigate('?' + searchParams, { replace: true, ...options });

            setSearchParams(value);
          }
          return value;
        },
      };
    };
    const newValue = isFunction(value) ? value(queryRef.current) : value;
    return fn(newValue);
  });

  const update = useEventCallback((value: Partial<T> | ((prev: T) => Partial<T>), replace?: boolean) => {
    return set({ ...(replace ? defaultValue : query), ...(isFunction(value) ? value(queryRef.current) : value) } as T);
  });

  return { value: query, set, update, saved: searchParams };
}

useQueryParams.KEY = 'q';
