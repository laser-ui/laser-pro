import type { HttpRequestConfigOverrides } from './types';
import type { AxiosRequestConfig } from 'axios';

import _axios from 'axios';

import { CONFIGS } from './configs';

export function axios(config: AxiosRequestConfig<any>, overrides?: true | HttpRequestConfigOverrides) {
  const axios = CONFIGS.mock ? CONFIGS.mock : _axios;

  if (overrides === true) {
    return axios(config);
  }

  const token = CONFIGS.token;

  let headers = config.headers;
  if (!overrides?.authorization) {
    if (token) {
      headers = Object.assign({}, config.headers);
      headers.Authorization = `Bearer ${token.value}`;
    }
  }

  return axios({
    ...config,
    baseURL: overrides?.baseURL ? config.baseURL : CONFIGS.baseURL,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    url: overrides?.url ? config.url : CONFIGS.transformURL(config.url!),
    headers,
  });
}
