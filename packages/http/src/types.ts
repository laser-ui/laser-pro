import type { AxiosRequestConfig } from 'axios';

export {};

export interface HttpRequestConfigOverrides {
  baseURL?: boolean;
  url?: boolean;
  authorization?: boolean;
}

export interface HttpRequestConfig<T> extends AxiosRequestConfig<T> {
  url: string;
}

export interface HttpResponse<T> extends Promise<T> {
  abort: () => void;
}

export interface Http {
  <T = any, D = any>(config: HttpRequestConfig<D>, overrides?: true | HttpRequestConfigOverrides): HttpResponse<T>;
  abort: () => void;
}
