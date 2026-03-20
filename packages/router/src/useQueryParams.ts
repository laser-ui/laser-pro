import type { JsonValue } from './types';
import type { NavigateOptions } from 'react-router';

import { useEventCallback } from '@laser-ui/hooks';
import * as JSURL from 'jsurl';
import { isEqual, isFunction } from 'lodash';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';

export function useQueryParams<T extends Record<keyof T, JsonValue>>(defaultValue: T, key: string = useQueryParams.KEY) {
  const navigate = useNavigate();

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
          const query = searchParams.get(key);
          if (!isEqual(value, { ...defaultValue, ...(query ? JSURL.parse(query) : {}) })) {
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
