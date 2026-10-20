import { describe, expect, it } from 'vitest';
import { createAppointment } from './create-appointment.js';
import { DomainError } from '../../../shared/domain/errors.js';

const input = {
  tenantId: '11111111-1111-4111-8111-111111111111', studentId: '22222222-2222-4222-8222-222222222222',
  instructorId: '33333333-3333-4333-8333-333333333333', vehicleId: '44444444-4444-4444-8444-444444444444',
  kind: 'PRACTICAL' as const, startsAt: new Date('2026-10-21T10:00:00Z'), endsAt: new Date('2026-10-21T11:00:00Z')
};

function fakePool(error?: { code: string }) {
  return { connect: async () => ({
    query: async (sql: string) => {
      if (sql.startsWith('INSERT') && error) throw error;
      if (sql.startsWith('INSERT')) return { rows: [{ id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }] };
      return { rows: [] };
    }, release() {}
  }) } as any;
}

describe('createAppointment', () => {
  it('rechaza una práctica sin sus recursos', async () => {
    await expect(createAppointment(fakePool(), { ...input, instructorId: undefined }))
      .rejects.toMatchObject({ code: 'INVALID_PRACTICAL_RESOURCES' } satisfies Partial<DomainError>);
  });
  it('traduce la exclusión GiST a un conflicto de agenda', async () => {
    await expect(createAppointment(fakePool({ code: '23P01' }), input))
      .rejects.toMatchObject({ code: 'SCHEDULE_CONFLICT' } satisfies Partial<DomainError>);
  });
  it('crea una reserva cuando PostgreSQL la acepta', async () => {
    await expect(createAppointment(fakePool(), input)).resolves.toEqual({ id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' });
  });
});
