import { describe, expect, it } from 'vitest';
import { setCreditLimit } from './finance.js';
const pool = () => ({ connect: async () => ({ query: async () => ({ rows: [] }), release() {} }) }) as any;
it('configura límite de crédito del tenant', async () => await expect(setCreditLimit(pool(), '11111111-1111-4111-8111-111111111111', 500)).resolves.toEqual({ creditLimit: 500 }));
