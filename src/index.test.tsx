import {render, screen} from '@testing-library/react';
import React from 'react';
import {Demo} from '.';

test('renders Demo', () => {
  render(<Demo />);
  expect(screen.queryByTestId('demo')).toHaveTextContent(/Hi/);
});
