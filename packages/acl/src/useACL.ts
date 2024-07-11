import type { Control, ControlMode } from './types';

import { isArray } from 'lodash';
import { useSyncExternalStore } from 'react';

let listeners: (() => void)[] = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(onStoreChange: () => void) {
  listeners = listeners.concat([onStoreChange]);
  return () => {
    listeners = listeners.filter((f) => f !== onStoreChange);
  };
}

let _full = false;
let _controls = new Set<Control>();
function getSnapshot() {
  return {
    get controls() {
      return Array.from(_controls);
    },
    setFull: (full: boolean) => {
      _full = full;
      emitChange();
    },
    set: (control: Control[]) => {
      _controls = new Set(control);
      emitChange();
    },
    add: (control: Control | Control[]) => {
      for (const v of isArray(control) ? control : [control]) {
        _controls.add(v);
      }
      emitChange();
    },
    remove: (control: Control | Control[]) => {
      for (const v of isArray(control) ? control : [control]) {
        _controls.delete(v);
      }
      emitChange();
    },
    can: (control: Control | Control[], mode: ControlMode = 'one') => {
      if (_full) {
        return true;
      }

      const controls = isArray(control) ? control : [control];
      if (mode === 'one') {
        return controls.some((v) => _controls.has(v));
      } else {
        return controls.every((v) => _controls.has(v));
      }
    },
  };
}

export const acl = getSnapshot();

export function useACL() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
