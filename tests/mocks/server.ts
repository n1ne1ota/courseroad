import { setupServer } from 'msw/node';

import { authHandlers } from './handlers/auth-handlers';
import { paymentsHandlers } from './handlers/payments-handlers';
import { storageHandlers } from './handlers/storage-handlers';

export const server = setupServer(...authHandlers, ...paymentsHandlers, ...storageHandlers);
