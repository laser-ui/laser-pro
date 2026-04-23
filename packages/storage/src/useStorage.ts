import { StorageScope } from './storage-scope';

export const storageScope = new StorageScope();
export const useStorage = storageScope.createStorageHook();
