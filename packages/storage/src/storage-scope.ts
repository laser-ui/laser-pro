import type { StorageConfigs, StorageHook, ValueOptions } from './types';

import { useEventCallback } from '@laser-ui/hooks';
import { isNull, isNumber, isString } from 'lodash';
import { useMemo, useState, useSyncExternalStore } from 'react';

import { LocalStorageService } from './local-storage';
import { MEMORY_STORAGE_PARSER, type AbstractParserOptions } from './parser';

class Store {
  private _listeners: (() => void)[] = [];
  private _key: any;
  private _configs: StorageConfigs;

  constructor(key: any, configs: StorageConfigs) {
    this._key = key;
    this._configs = configs;
  }

  subscribe(onStoreChange: () => void) {
    this._listeners = this._listeners.concat([onStoreChange]);
    return () => {
      this._listeners = this._listeners.filter((f) => f !== onStoreChange);
    };
  }

  getSnapshot() {
    return this._configs.service.getItem(this._key);
  }

  emitChange() {
    for (const listener of this._listeners) {
      listener();
    }
  }
}

export class StorageScope {
  private _stores = new Map<any, Store>();
  private _configs: StorageConfigs;

  private get _parser(): AbstractParserOptions<any> {
    return this._configs.parser ?? this._configs.service.parser ?? MEMORY_STORAGE_PARSER;
  }

  public get configs() {
    return this._configs;
  }

  constructor(configs?: Partial<StorageConfigs>) {
    this._configs = {
      default: {},
      service: new LocalStorageService(),
      ...configs,
    };
  }

  private _getStore(key: any) {
    let store = this._stores.get(key);
    if (!store) {
      store = new Store(key, this._configs);
      this._stores.set(key, store);
    }
    return store;
  }

  config(configs: Partial<StorageConfigs>) {
    Object.keys(configs).forEach((key) => {
      (this._configs as any)[key] = (configs as any)[key];
    });
  }

  get<V>(key: string, options?: ValueOptions<V>): V {
    const { defaultValue = key in this._configs.default ? this._configs.default[key] : null, parser = 'plain' } = options ?? {};

    const { deserializer } = this._parser[parser] as any;

    let value: any = this._configs.service.getItem(key);
    value = isNull(value) ? defaultValue : deserializer(value);

    return value;
  }

  set<V>(key: string, value: V): void {
    const parser = this._parser;
    const originValue = isString(value)
      ? parser.plain.serializer(value)
      : isNumber(value)
        ? parser.number.serializer(value)
        : parser.json.serializer(value);
    this._configs.service.setItem(key, originValue);

    const store = this._stores.get(key);
    if (store) {
      store.emitChange();
    }
  }

  remove(key: string): void {
    this._configs.service.removeItem(key);

    const store = this._stores.get(key);
    if (store) {
      store.emitChange();
    }
  }

  clear() {
    this._configs.service.clear();
    for (const [, store] of this._stores) {
      store.emitChange();
    }
  }

  createStorageHook(): StorageHook {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;

    return <V>(key: string, options?: ValueOptions<V>) => {
      const { defaultValue = key in that._configs.default ? that._configs.default[key] : null, parser = 'plain' } = options ?? {};

      const { serializer, deserializer: _deserializer } = that._parser[parser] as any;

      const store = useMemo(() => {
        const s = that._getStore(key);
        return {
          subscribe: s.subscribe.bind(s),
          getSnapshot: s.getSnapshot.bind(s),
          getServerSnapshot: s.getSnapshot.bind(s),
          emitChange: s.emitChange.bind(s),
        };
      }, [key]);
      const _value: any = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
      const [initDefaultValue] = useState(defaultValue);
      const deserializer = useEventCallback(_deserializer);
      const value = useMemo(() => (isNull(_value) ? initDefaultValue : deserializer(_value)), [_value, deserializer, initDefaultValue]);

      return {
        value,
        set: useEventCallback((val) => {
          const originValue = serializer(typeof val === 'function' ? (val as (prev: V | null) => V)(value) : val);
          that._configs.service.setItem(key, originValue);
          store.emitChange();
        }),
        remove: useEventCallback(() => {
          that._configs.service.removeItem(key);
          store.emitChange();
        }),
      };
    };
  }
}
