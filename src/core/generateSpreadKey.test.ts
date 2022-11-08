import {uniqueId} from 'lodash';

import {generateSpreadKey} from './generateSpreadKey';
import {SpreadIndex} from './SpreadIndex';

describe('generateSpreadKey', () => {
  test('stringifies plain object', () => {
    const o = {x: uniqueId()};
    expect(generateSpreadKey(o)).toBe(JSON.stringify(o));
  });

  test('stringifies null', () => {
    expect(generateSpreadKey(null)).toBe('null');
  });

  test('stringifies undefined', () => {
    expect(generateSpreadKey(undefined)).toBe('undefined');
  });

  test('returns the uniqueness attribute of spread index', () => {
    const i = uniqueId();
    const spreadIndex = new SpreadIndex(i);
    expect(generateSpreadKey(spreadIndex)).toBe(i);
  });
});
