import {setSpreadoGlobalState} from '../global';

export interface SpreadoSetupOptions {}

export interface SpreadoSetup {
  useSpreadOut<T>(index: unknown, value: T): T;

  useSpreadIn<T>(index: unknown): T | undefined;
  useSpreadIn<T>(index: unknown, fallback: Partial<T>): T | Partial<T>;
  useSpreadIn<T>(index: unknown, fallback?: Partial<T>): T | Partial<T> | undefined;

  setSpreadOut<T>(index: unknown, value: T): T;
  setSpreadOut<T>(index: unknown, callback: (value?: T) => T): T;

  getSpreadIn<T>(index: unknown): T | undefined;
  getSpreadIn<T>(index: unknown, fallback: Partial<T>): T | Partial<T>;
  getSpreadIn<T>(index: unknown, fallback?: Partial<T>): T | Partial<T> | undefined;
}

export abstract class SpreadoSetupBase implements SpreadoSetup {
  // We leave a consistent form of the base constructor to do better extending in the future.
  // eslint-disable-next-line
  constructor(options: SpreadoSetupOptions) {
    setSpreadoGlobalState({spreadoSetup: this});
  }

  abstract useSpreadOut<T>(index: unknown, value: T): T;
  abstract useSpreadIn<T>(index: unknown, fallback?: Partial<T>): T | Partial<T> | undefined;

  abstract setSpreadOut<T>(index: unknown, value: T | ((value?: T) => T)): T;
  abstract getSpreadIn<T>(index: unknown, fallback?: Partial<T>): T | Partial<T> | undefined;
}
