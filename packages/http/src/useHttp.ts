import type { Http, HttpRequestConfig, HttpRequestConfigOverrides, HttpResponse } from './types';
import type { AxiosError, AxiosResponse } from 'axios';

import { useEventCallback, useUnmount } from '@laser-ui/hooks';
import { useRef } from 'react';

import { axios } from './axios';
import { CONFIGS, config } from './configs';

export function useHttp(err: (error: AxiosError) => void): Http {
  const aborts = useRef<Set<() => void>>(new Set());

  const http: any = useEventCallback(
    <T = any, D = any>(config: HttpRequestConfig<D>, overrides?: true | HttpRequestConfigOverrides): HttpResponse<T> => {
      const controller = new AbortController();
      const abort = () => {
        controller.abort();
      };
      aborts.current.add(abort);

      const request: any = new Promise<T>((resolve, reject) => {
        axios({ ...config, signal: controller.signal }, overrides)
          .then((res: AxiosResponse<T, D>) => {
            resolve(res.data);
          })
          .catch((error: AxiosError<T, D>) => {
            reject(error);
            err(error);
          });
      });
      request.abort = abort;

      return request;
    },
  );
  http.abort = () => {
    for (const abort of aborts.current) {
      abort();
    }
    aborts.current.clear();
  };
  useUnmount(() => {
    http.abort();
  });

  return http;
}

useHttp.config = config;
useHttp.configs = CONFIGS;
