/* eslint-disable @typescript-eslint/no-empty-function */
import type { AbstractStorage } from '@laser-pro/storage/abstract-storage';

import { LocalStorageService } from '@laser-pro/storage/local-storage';
import { isNull } from 'lodash';

export interface TokenConfigs {
  storage: AbstractStorage<string, string>;
  key: string;
  refresh: () => Promise<string | null>;
  refreshOffset: number;
}

export abstract class Token {
  private _configs: TokenConfigs = {
    storage: new LocalStorageService(),
    key: 'token',
    refresh: () => Promise.resolve(null),
    refreshOffset: 60 * 1000,
  };
  private _cancelRefresh = () => {};

  public abstract get expiration(): number | null;
  public abstract set expiration(val: number | null);

  public get configs(): TokenConfigs {
    return this._configs;
  }

  public get value(): string | null {
    return this._configs.storage.getItem(this._configs.key);
  }

  public get expired(): boolean {
    if (isNull(this.expiration)) {
      return false;
    } else {
      return this.expiration <= Date.now();
    }
  }

  constructor(configs: Partial<TokenConfigs>) {
    this.config(configs);

    this.refreshToken();
  }

  private refreshToken() {
    this._cancelRefresh();
    if (this.value && !isNull(this.expiration) && !this.expired) {
      const max = 60 * 60 * 1000;
      let timeout = Math.max(this.expiration - Date.now() - this._configs.refreshOffset, 0);
      let tid: number;
      let cancel = false;
      const loop = () => {
        if (timeout > max) {
          timeout = timeout - max;
          tid = window.setTimeout(() => {
            loop();
          }, max);
        } else {
          tid = window.setTimeout(() => {
            if (!cancel) {
              this._configs.refresh().then((token) => {
                if (!cancel && token) {
                  this.set(token);
                }
              });
            }
          }, timeout);
        }
      };
      loop();
      this._cancelRefresh = () => {
        clearTimeout(tid);
        cancel = true;
      };
    }
  }

  config(configs: Partial<TokenConfigs>) {
    Object.keys(configs).forEach((key) => {
      (this._configs as any)[key] = (configs as any)[key];
    });
  }

  set(val: string) {
    this._configs.storage.setItem(this._configs.key, val);
    this.refreshToken();
  }

  remove() {
    this._configs.storage.removeItem(this._configs.key);
    this._cancelRefresh();
  }
}
