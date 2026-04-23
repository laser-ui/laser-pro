import { AbstractStorage } from './abstract-storage';
import { MEMORY_STORAGE_PARSER } from './parser';

const MEMORY = new Map();
export class MemoryStorageService extends AbstractStorage<any, any> {
  parser = MEMORY_STORAGE_PARSER;

  getItem(key: any): any | null {
    return MEMORY.get(key);
  }

  setItem(key: any, value: any): void {
    MEMORY.set(key, value);
  }

  removeItem(key: any): void {
    MEMORY.delete(key);
  }

  clear(): void {
    MEMORY.clear();
  }
}
