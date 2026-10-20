import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './password.js';
describe('credenciales', () => {
  it('verifica solo la contraseña que produjo el hash', async () => {
    const hash = await hashPassword('ClaveSegura-123');
    await expect(verifyPassword('ClaveSegura-123', hash)).resolves.toBe(true);
    await expect(verifyPassword('incorrecta', hash)).resolves.toBe(false);
  });
});
