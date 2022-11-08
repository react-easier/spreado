import {SpreadIndex} from './SpreadIndex';

export function generateSpreadKey(index: unknown): string {
  if (index instanceof SpreadIndex) {
    return index._i;
  }
  return JSON.stringify(index) + '';
}
