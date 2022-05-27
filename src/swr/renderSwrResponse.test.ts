import {uniqueId} from 'lodash';
import {renderSwrResponse} from './renderSwrResponse';

describe('renderSwrResponse', () => {
  test('works', () => {
    const data = uniqueId();
    expect(renderSwrResponse(data)).toMatchObject({data});
  });
});
