import type { TokenConfigs } from './types';

import { isUndefined } from 'lodash';

let token: Token;
export abstract class Token {
  private _value: string;
  private _configs: TokenConfigs = {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    refresh: () => {},
    refreshOffset: 60 * 1000,
  };

  public get value(): string {
    return this._value;
  }

  public get configs(): TokenConfigs {
    return this._configs;
  }

  public abstract get expiration(): number;
  public abstract set expiration(val: number);

  public get expired(): boolean {
    if (this.expiration === 0) {
      return false;
    }
    return Date.now() > this.expiration;
  }

  constructor(value: string, configs: Partial<TokenConfigs>) {
    if (token) {
      token.destroy();
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    token = this;

    this._value = value;
    Object.keys(configs).forEach((key) => {
      (this._configs as any)[key] = (configs as any)[key];
    });

    this.refreshToken();
  }

  private refreshTokenTid?: number;
  private refreshToken() {
    if (this.expiration !== 0 && !this.expired) {
      const max = 60 * 60 * 1000;
      let timeout = Math.max(this.expiration - this._configs.refreshOffset - Date.now(), 0);
      const loop = () => {
        if (timeout > max) {
          timeout = timeout - max;
          this.refreshTokenTid = window.setTimeout(() => {
            this.refreshTokenTid = undefined;
            loop();
          }, max);
        } else {
          this.refreshTokenTid = window.setTimeout(() => {
            this.refreshTokenTid = undefined;
            this._configs.refresh();
          }, timeout);
        }
      };
      loop();
    }
  }

  public destroy() {
    if (!isUndefined(this.refreshTokenTid)) {
      clearTimeout(this.refreshTokenTid);
    }
  }
}
