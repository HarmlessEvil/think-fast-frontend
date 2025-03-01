import { mergeTests } from '@playwright/test';
import { worker } from './mock-service-worker';

export const test = mergeTests(worker);
