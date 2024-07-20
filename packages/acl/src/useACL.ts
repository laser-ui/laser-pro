import type { Control, ControlMode } from './types';

import { isArray } from 'lodash';
import { useSyncExternalStore } from 'react';

let _full = false;
let _controls = new Set<Control>();

let controls: Control[] = [];
let listeners: (() => void)[] = [];

function emitChange() {
  controls = Array.from(_controls);
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

function getSnapshot() {
  return controls;
}

export const acl = {
  get controls() {
    return controls;
  },
  get full() {
    return _full;
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

export function useACL() {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return acl;
}
