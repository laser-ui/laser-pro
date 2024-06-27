import { AbstractStorage } from './abstract-storage';
import { STORAGE_PARSER } from './parser';

export class SessionStorageService extends AbstractStorage<string, string> {
  parser = STORAGE_PARSER;

  getItem(key: string): string | null {
    return sessionStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    sessionStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  clear(): void {
    sessionStorage.clear();
  }
}
