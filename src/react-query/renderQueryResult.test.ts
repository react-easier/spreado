import {random, uniqueId} from 'lodash';
import {
  renderInfiniteQueryResult,
  renderQueriesResults,
  renderQueryResult,
} from './renderQueryResult';

describe('renderQueryResult', () => {
  test('works', () => {
    const data = uniqueId();
    expect(renderQueryResult(data)).toMatchObject({data});
  });
});

describe('renderQueriesResults', () => {
  test('works', () => {
    const paramsList = [{data: uniqueId()}, {data: random()}];
    expect(renderQueriesResults(paramsList)).toEqual(
      paramsList.map(({data}) => expect.objectContaining({data}))
    );
  });
});

describe('renderInfiniteQueryResult', () => {
  test('works', () => {
    const data = {pages: [uniqueId()], pageParams: [uniqueId()]};
    expect(renderInfiniteQueryResult(data)).toMatchObject({data});
  });
});
