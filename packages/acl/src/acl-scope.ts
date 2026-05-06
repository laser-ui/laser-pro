import type { Control, ControlMode } from './types';

import { isArray } from 'lodash';
import { useMemo, useSyncExternalStore } from 'react';

export class AclScope {
  private _full = false;
  private _controls = new Set<Control>();
  private _listeners: (() => void)[] = [];

  public controls: Control[] = [];

  private emitChange() {
    this.controls = Array.from(this._controls);
    for (const listener of this._listeners) {
      listener();
    }
  }

  private subscribe(onChange: () => void) {
    this._listeners = this._listeners.concat([onChange]);
    return () => {
      this._listeners = this._listeners.filter((f) => f !== onChange);
    };
  }

  private getSnapshot() {
    return this.controls;
  }

  createAcl() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    return {
      get controls() {
        return that.controls;
      },
      get full() {
        return that._full;
      },
      setFull: (full: boolean) => {
        that._full = full;
        that.emitChange();
      },
      set: (control: Control[]) => {
        that._controls = new Set(control);
        that.emitChange();
      },
      add: (control: Control | Control[]) => {
        for (const v of isArray(control) ? control : [control]) {
          that._controls.add(v);
        }
        that.emitChange();
      },
      remove: (control: Control | Control[]) => {
        for (const v of isArray(control) ? control : [control]) {
          that._controls.delete(v);
        }
        that.emitChange();
      },
      can: (control: Control | Control[], mode: ControlMode = 'one') => {
        if (that._full) {
          return true;
        }

        const controls = isArray(control) ? control : [control];
        if (mode === 'one') {
          return controls.some((v) => that._controls.has(v));
        } else {
          return controls.every((v) => that._controls.has(v));
        }
      },
    };
  }

  createAclHook() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    // eslint-disable-next-line
    const fixReactCompiler = (...args: any[]) => {};
    return () => {
      const controls = useSyncExternalStore(that.subscribe.bind(that), that.getSnapshot.bind(that), that.getSnapshot.bind(that));
      return useMemo(() => {
        fixReactCompiler(controls);
        return that.createAcl.bind(that)();
      }, [controls]);
    };
  }
}
