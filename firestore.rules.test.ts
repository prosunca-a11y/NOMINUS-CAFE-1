/**
 * Suite de Verificación de Seguridad Zero-Trust para Firestore Rules (Dirty Dozen TDD)
 * NOMINUS CAFÉ 1 — Cumplimiento SENIAT, SUDEBAN y Banesco
 */

export interface SecurityTestCase {
  id: string;
  title: string;
  collection: string;
  operation: 'create' | 'update' | 'delete' | 'get' | 'list';
  auth: { uid: string; email: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_SECURITY_TESTS: SecurityTestCase[] = [
  {
    id: 'DD-01',
    title: 'Identity Spoofing en /companies (ownerId != request.auth.uid)',
    collection: '/companies/emp-1',
    operation: 'create',
    auth: { uid: 'user-attacker', email: 'attacker@example.com', email_verified: true },
    payload: { id: 'emp-1', ownerId: 'user-victim', razonSocial: 'EMPRESA FALSA C.A.' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-02',
    title: 'Email Spoofing sin email_verified == true',
    collection: '/companies/emp-1',
    operation: 'create',
    auth: { uid: 'user-1', email: 'sac1contable@gmail.com', email_verified: false },
    payload: { id: 'emp-1', ownerId: 'user-1', razonSocial: 'NOMINUS CAFÉ 1, C.A.' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-03',
    title: 'Shadow Field Injection (campo no permitido isVerifiedBySudeban)',
    collection: '/companies/emp-1',
    operation: 'create',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: true },
    payload: { id: 'emp-1', ownerId: 'user-1', isVerifiedBySudeban: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-04',
    title: 'Orphaned Write en /operations apuntando a empresaId ajena o inexistente',
    collection: '/operations/op-99',
    operation: 'create',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: true },
    payload: { id: 'op-99', ownerId: 'user-1', empresaId: 'emp-inexistente' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-05',
    title: 'ID Poisoning con caracteres inválidos fuera de ^[a-zA-Z0-9_\\-]+$',
    collection: '/companies/emp$poisoned!id',
    operation: 'create',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: true },
    payload: { id: 'emp$poisoned!id', ownerId: 'user-1' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-06',
    title: 'Resource Exhaustion (propositoAnticipo > 500 caracteres)',
    collection: '/operations/op-1',
    operation: 'create',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: true },
    payload: { propositoAnticipo: 'X'.repeat(1200) },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-07',
    title: 'Client Timestamp Forgery (createdAt != request.time)',
    collection: '/operations/op-1',
    operation: 'create',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: true },
    payload: { createdAt: '1999-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-08',
    title: 'Immortal Field Mutation (intento de alterar uidUnico en update)',
    collection: '/operations/op-1',
    operation: 'update',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: true },
    payload: { uidUnico: 'UID-ALTERADO-HACK' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-09',
    title: 'Terminal State Bypass (modificar operación ya Cerrada y Declarada SENIAT)',
    collection: '/operations/op-closed',
    operation: 'update',
    auth: { uid: 'user-non-admin', email: 'user@example.com', email_verified: true },
    payload: { montoAnticipoVES: 100.0 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-10',
    title: 'Value Poisoning en Update (etapaTrazabilidad fuera de 1..4)',
    collection: '/operations/op-2',
    operation: 'update',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: true },
    payload: { etapaTrazabilidad: 99 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-11',
    title: 'Unauthorized List Scraping sobre /operations de otros usuarios',
    collection: '/operations',
    operation: 'list',
    auth: { uid: 'user-attacker', email: 'attacker@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-12',
    title: 'Audit Log Tampering (intento de borrar o editar /auditLogs)',
    collection: '/auditLogs/log-1',
    operation: 'delete',
    auth: { uid: 'user-1', email: 'sac1contable@gmail.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
];
