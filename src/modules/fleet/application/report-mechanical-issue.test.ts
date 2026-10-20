import { describe, expect, it } from 'vitest';
import { reportMechanicalIssue } from './report-mechanical-issue.js';
const pool = (found = true) => ({ connect: async () => ({ query: async () => ({ rows: found ? [{ id: 'vehicle-1' }] : [], rowCount: found ? 1 : 0 }), release() {} }) }) as any;
const input = { tenantId: '11111111-1111-4111-8111-111111111111', vehicleId: '22222222-2222-4222-8222-222222222222', active: true, note: 'Freno' };
describe('reportMechanicalIssue', () => {
  it('bloquea un vehículo con falla', async () => await expect(reportMechanicalIssue(pool(), input)).resolves.toEqual({ vehicleId: 'vehicle-1', mechanicalIssueActive: true }));
  it('rechaza otro tenant', async () => await expect(reportMechanicalIssue(pool(false), input)).rejects.toMatchObject({ code: 'VEHICLE_NOT_FOUND' }));
});
