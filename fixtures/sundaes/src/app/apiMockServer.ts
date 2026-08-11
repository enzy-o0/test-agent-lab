import { setupServer } from 'msw/node';
import { handlers } from './apiMockHandler';

export const server = setupServer(...handlers);
