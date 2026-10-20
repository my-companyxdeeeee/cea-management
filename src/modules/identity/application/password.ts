import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(scryptCallback);
const keyLength = 64;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('base64url');
  const derived = await scrypt(password, salt, keyLength) as Buffer;
  return `scrypt$${salt}$${derived.toString('base64url')}`;
}
export async function verifyPassword(password: string, encoded: string) {
  const [algorithm, salt, expected] = encoded.split('$');
  if (algorithm !== 'scrypt' || !salt || !expected) return false;
  const actual = await scrypt(password, salt, keyLength) as Buffer;
  const target = Buffer.from(expected, 'base64url');
  return target.length === actual.length && timingSafeEqual(target, actual);
}
