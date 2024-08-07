import type { AbstractParserOptions } from './parser';

import { useEventCallback } from '@laser-ui/hooks';
import { isNull, isNumber, isString } from 'lodash';
import { useMemo, useSyncExternalStore } from 'react';

import { CONFIGS, config } from './configs';
import { MEMORY_STORAGE_PARSER } from './memory-storage';

class Store {
  private _listeners: (() => void)[] = [];
  private _key: any;

  constructor(key: any) {
    this._key = key;
  }

  subscribe(onStoreChange: () => void) {
    this._listeners = this._listeners.concat([onStoreChange]);
    return () => {
      this._listeners = this._listeners.filter((f) => f !== onStoreChange);
    };
  }

  getSnapshot() {
    return CONFIGS.service.getItem(this._key);
  }

  emitChange() {
    for (const listener of this._listeners) {
      listener();
    }
  }
}
const STROES = new Map<any, Store>();

export interface Options<T> {
  defaultValue?: T;
  parser?: keyof AbstractParserOptions<any>;
}
export function useStorage<V>(
  key: string,
  options: { defaultValue: V; parser?: keyof AbstractParserOptions<any> },
): {
  readonly value: V;
  set: (value: V | ((prev: V) => V)) => void;
  remove: () => void;
};
export function useStorage<V>(
  key: string,
  options?: { parser?: keyof AbstractParserOptions<any> },
): {
  readonly value: V | null;
  set: (value: V | ((prev: V | null) => V)) => void;
  remove: () => void;
};
export function useStorage<V>(
  key: string,
  options?: Options<V>,
): {
  readonly value: V | null;
  set: (value: V | ((prev: V | null) => V)) => void;
  remove: () => void;
} {
  const { defaultValue = key in CONFIGS.default ? CONFIGS.default[key] : null, parser = 'plain' } = options ?? {};

  const { serializer, deserializer } = (CONFIGS.parser ?? CONFIGS.service.parser ?? MEMORY_STORAGE_PARSER)[parser] as any;

  const store = useMemo(() => {
    let store = STROES.get(key);
    if (!store) {
      store = new Store(key);
      STROES.set(key, store);
    }
    return {
      subscribe: store.subscribe.bind(store),
      getSnapshot: store.getSnapshot.bind(store),
      getServerSnapshot: store.getSnapshot.bind(store),
      emitChange: store.emitChange.bind(store),
    };
  }, [key]);
  const _value: any = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const value = useMemo(() => (isNull(_value) ? defaultValue : deserializer(_value)), [_value]);

  return {
    value,
    set: useEventCallback((val) => {
      const originValue = serializer(typeof val === 'function' ? (val as (prev: V | null) => V)(value) : val);
      CONFIGS.service.setItem(key, originValue);
      store.emitChange();
    }),
    remove: useEventCallback(() => {
      CONFIGS.service.removeItem(key);
      store.emitChange();
    }),
  };
}

useStorage.get = <V>(key: string, options?: Options<V>): V => {
  const { defaultValue = key in CONFIGS.default ? CONFIGS.default[key] : null, parser = 'plain' } = options ?? {};

  const { deserializer } = (CONFIGS.parser ?? CONFIGS.service.parser ?? MEMORY_STORAGE_PARSER)[parser] as any;

  let value: any = CONFIGS.service.getItem(key);
  value = isNull(value) ? defaultValue : deserializer(value);

  return value;
};
useStorage.set = <V>(key: string, value: V): void => {
  const parser = CONFIGS.parser ?? CONFIGS.service.parser ?? MEMORY_STORAGE_PARSER;
  const originValue = isString(value)
    ? parser.plain.serializer(value)
    : isNumber(value)
      ? parser.number.serializer(value)
      : parser.json.serializer(value);
  CONFIGS.service.setItem(key, originValue);

  const store = STROES.get(key);
  if (store) {
    store.emitChange();
  }
};
useStorage.remove = (key: string): void => {
  CONFIGS.service.removeItem(key);

  const store = STROES.get(key);
  if (store) {
    store.emitChange();
  }
};
useStorage.clear = () => {
  CONFIGS.service.clear();
  for (const [, store] of STROES) {
    store.emitChange();
  }
};
useStorage.config = config;
useStorage.configs = CONFIGS;
