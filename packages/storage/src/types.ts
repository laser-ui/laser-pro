import type { AbstractStorage } from './abstract-storage';
import type { AbstractParserOptions } from './parser';

export {};

export interface StorageConfigs {
  default: any;
  service: AbstractStorage<any, any>;
  parser?: AbstractParserOptions<any>;
}

export interface ValueOptions<T> {
  defaultValue?: T;
  service?: AbstractStorage<any, any>;
  parser?: keyof AbstractParserOptions<any>;
}

export interface StorageHook {
  <V>(
    key: string,
    options: { defaultValue: V; parser?: keyof AbstractParserOptions<any> },
  ): {
    readonly value: V;
    set: (value: V | ((prev: V) => V)) => void;
    remove: () => void;
  };
  <V>(
    key: string,
    options?: { parser?: keyof AbstractParserOptions<any> },
  ): {
    readonly value: V | null;
    set: (value: V | ((prev: V | null) => V)) => void;
    remove: () => void;
  };
  <V>(
    key: string,
    options?: ValueOptions<V>,
  ): {
    readonly value: V | null;
    set: (value: V | ((prev: V | null) => V)) => void;
    remove: () => void;
  };
}
