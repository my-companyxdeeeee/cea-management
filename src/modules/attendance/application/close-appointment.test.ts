import { describe, expect, it } from 'vitest';
import { closeAppointment } from './close-appointment.js';
const pool = (kind: string | null = 'PRACTICAL') => ({ connect: async () => ({ query: async (sql: string) => { if (sql.startsWith('SELECT')) return { rows: kind ? [{ kind, vehicle_id: 'vehicle-1' }] : [], rowCount: kind ? 1 : 0 }; return { rows: [] }; }, release() {} }) }) as any;
const input = { tenantId: '11111111-1111-4111-8111-111111111111', userId: '22222222-2222-4222-8222-222222222222', appointmentId: '33333333-3333-4333-8333-333333333333', checkIn: new Date('2026-10-21T10:00:00Z'), checkOut: new Date('2026-10-21T11:00:00Z'), verificationMethod: 'DIGITAL' as const, endingMileageKm: 101 };
describe('closeAppointment', () => {
  it('cierra práctica y actualiza kilometraje', async () => await expect(closeAppointment(pool(), input)).resolves.toEqual({ appointmentId: input.appointmentId, status: 'COMPLETED' }));
  it('exige kilometraje final en práctica', async () => await expect(closeAppointment(pool(), { ...input, endingMileageKm: undefined })).rejects.toMatchObject({ code: 'ENDING_MILEAGE_REQUIRED' }));
});
