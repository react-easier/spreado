import '@testing-library/jest-dom';
import {configure} from '@testing-library/react';

// For *ByTestId APIs, let them look for [data-tn] attributes on DOM nodes by default.
configure({testIdAttribute: 'data-tn'});
