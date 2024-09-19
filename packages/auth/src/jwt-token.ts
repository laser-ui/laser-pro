import type { TokenConfigs } from './types';

import { Token } from './abstract-token';
import { base64url } from './base64url';

export interface JWTTokenPayload {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  nbf: number;
  iat: number;
  jti: string;
}
export class JWTToken<T extends JWTTokenPayload> extends Token {
  private _payload: T;

  public get payload(): T {
    return this._payload;
  }

  public get expiration(): number {
    return this._payload.exp * 1000;
  }
  public set expiration(val: number) {
    throw new Error('You should not change `expiration` when use JWT!');
  }

  constructor(value: string, configs: Partial<TokenConfigs>) {
    super(value, configs);

    const [, payload] = value.split('.');
    this._payload = JSON.parse(base64url.decode(payload));
  }
}
