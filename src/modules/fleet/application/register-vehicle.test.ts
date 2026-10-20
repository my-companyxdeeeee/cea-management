import { describe, expect, it } from 'vitest';
import { registerVehicle } from './register-vehicle.js';
const pool = (code?: string) => ({ connect: async () => ({ query: async (sql: string) => { if (sql.startsWith('INSERT') && code) throw { code }; if (sql.startsWith('INSERT')) return { rows: [{ id: 'vehicle-1', is_available: true }] }; return { rows: [] }; }, release() {} }) }) as any;
const input = { tenantId: '11111111-1111-4111-8111-111111111111', plate: ' abc123 ', brand: 'Marca', model: '2025', category: 'B1', mileageKm: 100 };
describe('registerVehicle', () => {
  it('normaliza la placa y registra un vehículo disponible', async () => await expect(registerVehicle(pool(), input)).resolves.toEqual({ id: 'vehicle-1', is_available: true }));
  it('rechaza placa duplicada por tenant', async () => await expect(registerVehicle(pool('23505'), input)).rejects.toMatchObject({ code: 'VEHICLE_PLATE_EXISTS' }));
});
