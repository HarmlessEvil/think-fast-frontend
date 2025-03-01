import { test as base } from '@playwright/test';
import { createWorkerFixture, MockServiceWorker } from 'playwright-msw';

export const worker = base.extend<{ worker: MockServiceWorker }>({
  worker: createWorkerFixture(),
});
