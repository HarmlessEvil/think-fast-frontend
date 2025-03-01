import { afterAll, afterEach, beforeAll, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { server } from '../src/mocks/node';

expect.extend(matchers);
afterEach(cleanup);

beforeAll(() => server.listen());
afterEach(() => server.restoreHandlers());
afterAll(() => server.close());
