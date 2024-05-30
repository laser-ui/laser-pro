import type { AxiosRequestConfig } from 'axios';

import _axios from 'axios';
import { isNull } from 'lodash';

import { CONFIGS } from './configs';

export function axios(config: AxiosRequestConfig<any>) {
  const axios = CONFIGS.mock ? CONFIGS.mock : _axios;
  const token = CONFIGS.token;

  const headers: any = Object.assign({}, config.headers);
  if (token && !isNull(token.value)) {
    headers.Authorization = headers.Authorization || `Bearer ${token.value}`;
  }

  return axios({
    ...config,
    baseURL: config.baseURL || CONFIGS.baseURL,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    url: config.url || CONFIGS.transformURL(config.url!),
    headers,
  });
}
