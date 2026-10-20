export const Roles = ['SUPERADMIN', 'CEA_ADMIN', 'INSTRUCTOR', 'STUDENT', 'RECEPTION'] as const;
export type Role = (typeof Roles)[number];
