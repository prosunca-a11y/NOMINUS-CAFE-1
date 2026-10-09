import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  CompanyProfile,
  CashTrailOperation,
  VigilanteWorker,
  BcvDailyRate,
} from './data/nominusData';
import { OfficialAccountingVoucher } from './data/agricolaOniAccountingVouchers2026Data';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Validar conexión inicial a Firestore conforme a la especificación
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface SecurityAuditLogRecord {
  id: string;
  ownerId: string;
  accion: string;
  entidadTipo:
    | 'EMPRESA'
    | 'ANTICIPO_BANESCO'
    | 'VIGILANTE_LOTTT'
    | 'SISTEMA_AUTH'
    | 'TASA_BCV'
    | 'COMPROBANTE_SENIAT';
  entidadId: string;
  detalle: string;
  createdAt?: unknown;
}

const sanitizeId = (raw: string) =>
  raw.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120) || 'id-1';

const clampStr = (val: string, min: number, max: number, fallback: string) => {
  const trimmed = (val || '').trim();
  if (trimmed.length < min) return fallback.slice(0, max);
  return trimmed.slice(0, max);
};

export async function signInWithGooglePopup() {
  const res = await signInWithPopup(auth, googleProvider);
  return res.user;
}

export async function signOutCurrentUser() {
  await signOut(auth);
}

export async function writeSecurityAuditLog(
  uid: string,
  accion: string,
  entidadTipo: SecurityAuditLogRecord['entidadTipo'],
  entidadId: string,
  detalle: string
) {
  const logId = sanitizeId(`log-${Date.now()}-${Math.floor(Math.random() * 9999)}`);
  const path = `auditLogs/${logId}`;
  try {
    await setDoc(doc(db, 'auditLogs', logId), {
      id: logId,
      ownerId: uid,
      accion: clampStr(accion, 2, 120, 'REGISTRO_AUDITORIA'),
      entidadTipo,
      entidadId: sanitizeId(entidadId),
      detalle: clampStr(detalle, 2, 500, 'Operacion verificada en Firestore.'),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function createCompanyInFirestore(
  uid: string,
  company: CompanyProfile,
  skipAudit = false
) {
  const docId = sanitizeId(`${uid}_${company.id}`);
  const path = `companies/${docId}`;
  try {
    await setDoc(doc(db, 'companies', docId), {
      id: docId,
      ownerId: uid,
      codigoCorto: clampStr(company.codigoCorto, 1, 40, 'EMP-01'),
      razonSocial: clampStr(company.razonSocial, 2, 200, 'EMPRESA CAFETALERA C.A.'),
      rif: clampStr(company.rif, 5, 30, 'J-50481920-1'),
      domicilioFiscal: clampStr(
        company.domicilioFiscal,
        2,
        400,
        'Zona Industrial, Venezuela'
      ),
      registroMercantil: clampStr(
        company.registroMercantil,
        2,
        300,
        'Registro Mercantil Primero'
      ),
      representanteLegal: clampStr(
        company.representanteLegal,
        2,
        160,
        'Director General'
      ),
      cuentaBanescoVES: clampStr(
        company.cuentaBanescoVES,
        10,
        60,
        '0134-0342-18-3421089912'
      ),
      cuentaBanescoUSD: clampStr(
        company.cuentaBanescoUSD,
        10,
        120,
        '0134-9801-11-0004819201 (Cuenta Custodia USD)'
      ),
      cupoMensualMesaCambioUSD: Math.max(
        0,
        Math.min(100000000, Number(company.cupoMensualMesaCambioUSD) || 200000)
      ),
      sucursalPrincipal: clampStr(
        company.sucursalPrincipal,
        2,
        160,
        'Barquisimeto / Portuguesa'
      ),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    if (!skipAudit) {
      await writeSecurityAuditLog(
        uid,
        'ALTA_EMPRESA_MULTIEMPRESA',
        'EMPRESA',
        docId,
        `Empresa registrada: ${company.razonSocial} (${company.rif}) Cta Banesco: ${company.cuentaBanescoVES}`
      );
    }
    return docId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateCompanyInFirestore(
  uid: string,
  company: CompanyProfile
) {
  const docId = company.id.startsWith(`${uid}_`)
    ? company.id
    : sanitizeId(`${uid}_${company.id}`);
  const path = `companies/${docId}`;
  try {
    await updateDoc(doc(db, 'companies', docId), {
      codigoCorto: clampStr(company.codigoCorto, 1, 40, 'EMP-01'),
      razonSocial: clampStr(company.razonSocial, 2, 200, 'EMPRESA CAFETALERA C.A.'),
      rif: clampStr(company.rif, 5, 30, 'J-50481920-1'),
      domicilioFiscal: clampStr(
        company.domicilioFiscal,
        2,
        400,
        'Zona Industrial, Venezuela'
      ),
      registroMercantil: clampStr(
        company.registroMercantil,
        2,
        300,
        'Registro Mercantil Primero'
      ),
      representanteLegal: clampStr(
        company.representanteLegal,
        2,
        160,
        'Director General'
      ),
      cuentaBanescoVES: clampStr(
        company.cuentaBanescoVES,
        10,
        60,
        '0134-0342-18-3421089912'
      ),
      cuentaBanescoUSD: clampStr(
        company.cuentaBanescoUSD,
        10,
        120,
        '0134-9801-11-0004819201 (Cuenta Custodia USD)'
      ),
      cupoMensualMesaCambioUSD: Math.max(
        0,
        Math.min(100000000, Number(company.cupoMensualMesaCambioUSD) || 200000)
      ),
      sucursalPrincipal: clampStr(
        company.sucursalPrincipal,
        2,
        160,
        'Barquisimeto / Portuguesa'
      ),
      updatedAt: serverTimestamp(),
    });
    await writeSecurityAuditLog(
      uid,
      'ACTUALIZACION_EMPRESA',
      'EMPRESA',
      docId,
      `Actualizados datos fiscales/bancarios de ${company.razonSocial} (${company.rif})`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createOperationInFirestore(
  uid: string,
  op: CashTrailOperation,
  skipAudit = false
) {
  const docId = op.id.startsWith(`${uid}_`) ? op.id : sanitizeId(`${uid}_${op.id}`);
  const scopedEmpresaId = op.empresaId.startsWith(`${uid}_`)
    ? op.empresaId
    : sanitizeId(`${uid}_${op.empresaId}`);
  const path = `operations/${docId}`;
  try {
    await setDoc(doc(db, 'operations', docId), {
      id: docId,
      ownerId: uid,
      empresaId: scopedEmpresaId,
      uidUnico: clampStr(op.uidUnico, 5, 80, 'UID-BAN-2026-0001'),
      codigoOperacion: clampStr(op.codigoOperacion, 3, 60, 'NC1-2026-0001'),
      fechaAnticipo: clampStr(op.fechaAnticipo, 8, 30, '2026-10-08'),
      horaTransferencia: clampStr(op.horaTransferencia, 4, 20, '10:00:00'),
      clienteNombre: clampStr(op.clienteNombre, 2, 200, 'Asociado Cafetalero'),
      clienteRif: clampStr(op.clienteRif, 4, 30, 'J-00000000-0'),
      clienteTipoCuenta: op.clienteTipoCuenta,
      bancoOrigen: clampStr(op.bancoOrigen, 2, 120, '0134 - Banesco'),
      numeroCuentaOrigen: clampStr(
        op.numeroCuentaOrigen,
        10,
        60,
        '0134-0089-24-0891045512'
      ),
      cuentaBanescoReceptora: clampStr(
        op.cuentaBanescoReceptora,
        10,
        60,
        '0134-0342-18-3421089912'
      ),
      referenciaBanesco: clampStr(op.referenciaBanesco, 3, 60, '900000001'),
      montoAnticipoVES: Math.max(1, Number(op.montoAnticipoVES) || 1000),
      propositoAnticipo: clampStr(
        op.propositoAnticipo,
        5,
        500,
        'Anticipo en ventas para compra de cafe en el exterior.'
      ),
      tasaBcvAnticipo: Math.max(1, Number(op.tasaBcvAnticipo) || 36.85),
      fechaMesaCambio: clampStr(op.fechaMesaCambio, 4, 30, '2026-10-08'),
      horaMesaCambio: clampStr(op.horaMesaCambio, 4, 20, '11:30:00'),
      codigoPactoBanesco: clampStr(op.codigoPactoBanesco, 3, 60, 'MC-BAN-2026'),
      tasaMesaCambio: Math.max(1, Number(op.tasaMesaCambio) || 36.88),
      comisionBanescoVES: Math.max(0, Number(op.comisionBanescoVES) || 0),
      montoAdjudicadoUSD: Math.max(0, Number(op.montoAdjudicadoUSD) || 0),
      cuentaBanescoDivisas: clampStr(
        op.cuentaBanescoDivisas,
        5,
        120,
        '0134-9801-11-0004819201 (Cuenta Custodia USD)'
      ),
      fechaCompraExterior: clampStr(op.fechaCompraExterior, 4, 30, '2026-10-08'),
      referenciaPagoExterior: clampStr(
        op.referenciaPagoExterior,
        3,
        80,
        'INT-PAY-COL-001'
      ),
      proveedorExterior: clampStr(
        op.proveedorExterior,
        2,
        200,
        'Exportadora Cafetera Colombia'
      ),
      origenCafe: clampStr(op.origenCafe, 2, 200, 'Cucuta, Colombia'),
      variedadCafe: op.variedadCafe,
      quintalesComprados: Math.max(1, Number(op.quintalesComprados) || 10),
      costoCafeUSD: Math.max(0, Number(op.costoCafeUSD) || 0),
      fleteInternacionalUSD: Math.max(0, Number(op.fleteInternacionalUSD) || 0),
      estadoLogistico: op.estadoLogistico,
      permisoInsai: clampStr(op.permisoInsai, 2, 120, 'INSAI-2026'),
      numeroFacturaSeniat: clampStr(op.numeroFacturaSeniat, 2, 80, 'PENDIENTE'),
      fechaFacturaSeniat: clampStr(op.fechaFacturaSeniat, 4, 30, '2026-10-15'),
      tasaBcvFacturacion: Math.max(1, Number(op.tasaBcvFacturacion) || 36.85),
      subtotalCafeVES: Math.max(0, Number(op.subtotalCafeVES) || 0),
      subtotalFleteVES: Math.max(0, Number(op.subtotalFleteVES) || 0),
      ivaFleteVES: Math.max(0, Number(op.ivaFleteVES) || 0),
      retencionIslrFleteVES: Math.max(0, Number(op.retencionIslrFleteVES) || 0),
      diferencialCambiarioVES: Number(op.diferencialCambiarioVES) || 0,
      estadoContable: op.estadoContable,
      etapaTrazabilidad: op.etapaTrazabilidad,
      reciboAnticipoNro: clampStr(op.reciboAnticipoNro, 3, 60, 'REC-ANT-001'),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (!skipAudit) {
      await writeSecurityAuditLog(
        uid,
        'REGISTRO_ANTICIPO_BANESCO',
        'ANTICIPO_BANESCO',
        docId,
        `Anticipo ${op.uidUnico} por Bs. ${op.montoAnticipoVES.toFixed(2)} desde Cta ${op.numeroCuentaOrigen} (${op.clienteNombre})`
      );
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateOperationTraceabilityInFirestore(
  uid: string,
  op: CashTrailOperation
) {
  const docId = op.id.startsWith(`${uid}_`) ? op.id : sanitizeId(`${uid}_${op.id}`);
  const path = `operations/${docId}`;
  try {
    await updateDoc(doc(db, 'operations', docId), {
      etapaTrazabilidad: op.etapaTrazabilidad,
      estadoContable: op.estadoContable,
      estadoLogistico: op.estadoLogistico,
      numeroFacturaSeniat: clampStr(op.numeroFacturaSeniat, 2, 80, 'PENDIENTE'),
      fechaFacturaSeniat: clampStr(op.fechaFacturaSeniat, 4, 30, '2026-10-15'),
      permisoInsai: clampStr(op.permisoInsai, 2, 120, 'INSAI-2026'),
      referenciaPagoExterior: clampStr(
        op.referenciaPagoExterior,
        3,
        80,
        'INT-PAY-COL-001'
      ),
      updatedAt: serverTimestamp(),
    });
    await writeSecurityAuditLog(
      uid,
      `AVANCE_TRAZABILIDAD_ETAPA_${op.etapaTrazabilidad}`,
      'ANTICIPO_BANESCO',
      docId,
      `Operacion ${op.uidUnico} actualizada a Etapa ${op.etapaTrazabilidad}/4 (${op.estadoContable})`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createVigilanteInFirestore(
  uid: string,
  vig: VigilanteWorker,
  skipAudit = false
) {
  const docId = vig.id.startsWith(`${uid}_`) ? vig.id : sanitizeId(`${uid}_${vig.id}`);
  const scopedEmpresaId = vig.empresaId.startsWith(`${uid}_`)
    ? vig.empresaId
    : sanitizeId(`${uid}_${vig.empresaId}`);
  const path = `vigilantes/${docId}`;
  try {
    await setDoc(doc(db, 'vigilantes', docId), {
      id: docId,
      ownerId: uid,
      empresaId: scopedEmpresaId,
      nombre: clampStr(vig.nombre, 2, 160, 'Vigilante Rural'),
      cedula: clampStr(vig.cedula, 4, 30, 'V-00000000'),
      cargo: clampStr(vig.cargo, 2, 120, 'Vigilante Agroindustrial'),
      ubicacionFinca: clampStr(vig.ubicacionFinca, 2, 200, 'Galpon Principal'),
      turnoModalidad: vig.turnoModalidad,
      salarioBasicoMensualVES: Math.max(0, Number(vig.salarioBasicoMensualVES) || 4000),
      diasTrabajadosMes: Math.max(0, Math.min(31, Number(vig.diasTrabajadosMes) || 30)),
      horasNocturnasMes: Math.max(0, Math.min(400, Number(vig.horasNocturnasMes) || 84)),
      horasExtrasMes: Math.max(0, Math.min(200, Number(vig.horasExtrasMes) || 12)),
      domingosFeriadosTrabajados: Math.max(
        0,
        Math.min(15, Number(vig.domingosFeriadosTrabajados) || 4)
      ),
      cestaticketUSD: Math.max(0, Math.min(1000, Number(vig.cestaticketUSD) || 40)),
      bonoProductividadResguardoUSD: Math.max(
        0,
        Math.min(10000, Number(vig.bonoProductividadResguardoUSD) || 120)
      ),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    if (!skipAudit) {
      await writeSecurityAuditLog(
        uid,
        'ALTA_VIGILANTE_LOTTT',
        'VIGILANTE_LOTTT',
        docId,
        `Vigilante registrado en nomina segura: ${vig.nombre} (${vig.cedula})`
      );
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function saveBcvRateInFirestore(
  uid: string,
  rate: BcvDailyRate,
  skipAudit = false
) {
  const docId = sanitizeId(`${uid}_bcv_${rate.fecha}`);
  const path = `bcvRates/${docId}`;
  try {
    await setDoc(doc(db, 'bcvRates', docId), {
      id: docId,
      ownerId: uid,
      fecha: clampStr(rate.fecha, 8, 20, '2026-01-05'),
      tasaCompraVES: Math.max(0.0001, Math.min(1000000, Number(rate.tasaCompraVES) || 35.15)),
      tasaVentaVES: Math.max(0.0001, Math.min(1000000, Number(rate.tasaVentaVES) || 35.25)),
      fuente: clampStr(rate.fuente, 2, 160, 'BCV Oficial - Excel Importado'),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    if (!skipAudit) {
      await writeSecurityAuditLog(
        uid,
        'ACTUALIZACION_TASA_BCV_DIARIA',
        'TASA_BCV',
        docId,
        `Tasa BCV ${rate.fecha}: Compra Bs. ${rate.tasaCompraVES.toFixed(4)} / Venta Bs. ${rate.tasaVentaVES.toFixed(4)} (${rate.fuente})`
      );
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function saveBatchBcvRatesInFirestore(
  uid: string,
  rates: BcvDailyRate[],
  nombreArchivo: string,
  skipAudit = false
) {
  const CHUNK_SIZE = 150;
  try {
    for (let i = 0; i < rates.length; i += CHUNK_SIZE) {
      const chunk = rates.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      for (const rate of chunk) {
        const docId = sanitizeId(`${uid}_bcv_${rate.fecha}`);
        batch.set(doc(db, 'bcvRates', docId), {
          id: docId,
          ownerId: uid,
          fecha: clampStr(rate.fecha, 8, 20, '2026-01-05'),
          tasaCompraVES: Math.max(0.0001, Math.min(1000000, Number(rate.tasaCompraVES) || 35.15)),
          tasaVentaVES: Math.max(0.0001, Math.min(1000000, Number(rate.tasaVentaVES) || 35.25)),
          fuente: clampStr(rate.fuente, 2, 160, 'BCV Oficial - Serie Diaria 6 Meses'),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
    }
    if (!skipAudit) {
      await writeSecurityAuditLog(
        uid,
        'SINCRONIZACION_SERIE_DIARIA_BCV_6_MESES',
        'TASA_BCV',
        sanitizeId(`batch-${Date.now()}`),
        `Almacenadas ${rates.length} tasas diarias BCV (Compra y Venta) en base de datos (${nombreArchivo})`
      );
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'bcvRates');
  }
}

export async function deleteCompanyFromFirestore(uid: string, companyDocId: string) {
  const docId = companyDocId.startsWith(`${uid}_`)
    ? companyDocId
    : sanitizeId(`${uid}_${companyDocId}`);
  const path = `companies/${docId}`;
  try {
    await deleteDoc(doc(db, 'companies', docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function deleteOperationFromFirestore(
  uid: string,
  operationDocId: string,
  skipAudit = false
) {
  const docId = operationDocId.startsWith(`${uid}_`)
    ? operationDocId
    : sanitizeId(`${uid}_${operationDocId}`);
  const path = `operations/${docId}`;
  try {
    await deleteDoc(doc(db, 'operations', docId));
    if (!skipAudit) {
      await writeSecurityAuditLog(
        uid,
        'DEPURACION_REGISTRO_OPERACION',
        'ANTICIPO_BANESCO',
        docId,
        `Registro eliminado de la base de datos: ${docId}`
      );
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function deleteVigilanteFromFirestore(uid: string, vigilanteDocId: string) {
  const docId = vigilanteDocId.startsWith(`${uid}_`)
    ? vigilanteDocId
    : sanitizeId(`${uid}_${vigilanteDocId}`);
  const path = `vigilantes/${docId}`;
  try {
    await deleteDoc(doc(db, 'vigilantes', docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveSignedVoucherInFirestore(
  uid: string,
  voucher: OfficialAccountingVoucher,
  skipAudit = false
) {
  const docId = sanitizeId(`${uid}_${voucher.id}`);
  const path = `signedVouchers/${docId}`;
  try {
    await setDoc(doc(db, 'signedVouchers', docId), {
      id: docId,
      ownerId: uid,
      voucherId: clampStr(voucher.id, 2, 80, 'vch-oni-01'),
      numeroComprobante: clampStr(voucher.numeroComprobante, 3, 80, 'COMP-ONI-2026-001'),
      hojaDestino: clampStr(voucher.hojaDestino, 3, 60, 'ANTICIPOS_CLIENTES'),
      mes: clampStr(voucher.mes, 2, 10, 'Ago'),
      fechaEmision: clampStr(voucher.fechaEmision, 6, 20, '31/08/2026'),
      montoOperacionBs: Math.max(0, Number(voucher.montoOperacionBs) || 0),
      montoEquivalenteUSD: Math.max(0, Number(voucher.montoEquivalenteUSD) || 0),
      estadoFirmaSello: voucher.estadoFirmaSello,
      archivoFirmadoNombre: clampStr(
        voucher.archivoFirmadoNombre || 'PENDIENTE_ESCANEO_FIRMADO.pdf',
        1,
        200,
        'PENDIENTE_ESCANEO_FIRMADO.pdf'
      ),
      archivoFirmadoFechaCarga: clampStr(
        voucher.archivoFirmadoFechaCarga || 'PENDIENTE',
        4,
        40,
        'PENDIENTE'
      ),
      archivoFirmadoHashSha256: clampStr(
        voucher.archivoFirmadoHashSha256 || 'SHA256-PENDIENTE-CARGA',
        6,
        128,
        'SHA256-PENDIENTE-CARGA'
      ),
      firmadoPorRepresentante: clampStr(
        voucher.firmadoPorRepresentante || 'Representante Legal Agrícola Oni, C.A.',
        2,
        160,
        'Representante Legal Agrícola Oni, C.A.'
      ),
      firmadoPorContadorCpc: clampStr(
        voucher.firmadoPorContadorCpc || 'Contador Público Colegiado (CPC)',
        2,
        160,
        'Contador Público Colegiado (CPC)'
      ),
      selloAgenciaBanesco: clampStr(
        voucher.selloAgenciaBanesco || 'Sello Húmedo Agrícola Oni / Recepción Banesco',
        2,
        160,
        'Sello Húmedo Agrícola Oni / Recepción Banesco'
      ),
      expedienteSeniatNro: clampStr(
        voucher.expedienteSeniatNro || 'EXP-SENIAT-ONI-2026',
        2,
        100,
        'EXP-SENIAT-ONI-2026'
      ),
      observacionesAuditor: clampStr(
        voucher.observacionesAuditor ||
          'Comprobante resguardado en Repositorio SENIAT con trazabilidad Banesco.',
        2,
        500,
        'Comprobante resguardado en Repositorio SENIAT con trazabilidad Banesco.'
      ),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (!skipAudit) {
      await writeSecurityAuditLog(
        uid,
        'RESGUARDO_COMPROBANTE_REPOSITORIO_SENIAT',
        'COMPROBANTE_SENIAT',
        docId,
        `Comprobante ${voucher.numeroComprobante} (${voucher.estadoFirmaSello}) guardado en Repositorio SENIAT: ${voucher.archivoFirmadoNombre || 'Emitido'}`
      );
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveBatchSignedVouchersInFirestore(
  uid: string,
  vouchers: OfficialAccountingVoucher[],
  skipAudit = false
) {
  const CHUNK_SIZE = 50;
  try {
    for (let i = 0; i < vouchers.length; i += CHUNK_SIZE) {
      const chunk = vouchers.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      for (const voucher of chunk) {
        const docId = sanitizeId(`${uid}_${voucher.id}`);
        batch.set(doc(db, 'signedVouchers', docId), {
          id: docId,
          ownerId: uid,
          voucherId: clampStr(voucher.id, 2, 80, 'vch-oni-01'),
          numeroComprobante: clampStr(voucher.numeroComprobante, 3, 80, 'COMP-ONI-2026-001'),
          hojaDestino: clampStr(voucher.hojaDestino, 3, 60, 'ANTICIPOS_CLIENTES'),
          mes: clampStr(voucher.mes, 2, 10, 'Ago'),
          fechaEmision: clampStr(voucher.fechaEmision, 6, 20, '31/08/2026'),
          montoOperacionBs: Math.max(0, Number(voucher.montoOperacionBs) || 0),
          montoEquivalenteUSD: Math.max(0, Number(voucher.montoEquivalenteUSD) || 0),
          estadoFirmaSello: voucher.estadoFirmaSello,
          archivoFirmadoNombre: clampStr(
            voucher.archivoFirmadoNombre || 'PENDIENTE_ESCANEO_FIRMADO.pdf',
            1,
            200,
            'PENDIENTE_ESCANEO_FIRMADO.pdf'
          ),
          archivoFirmadoFechaCarga: clampStr(
            voucher.archivoFirmadoFechaCarga || 'PENDIENTE',
            4,
            40,
            'PENDIENTE'
          ),
          archivoFirmadoHashSha256: clampStr(
            voucher.archivoFirmadoHashSha256 || 'SHA256-PENDIENTE-CARGA',
            6,
            128,
            'SHA256-PENDIENTE-CARGA'
          ),
          firmadoPorRepresentante: clampStr(
            voucher.firmadoPorRepresentante || 'Representante Legal Agrícola Oni, C.A.',
            2,
            160,
            'Representante Legal Agrícola Oni, C.A.'
          ),
          firmadoPorContadorCpc: clampStr(
            voucher.firmadoPorContadorCpc || 'Contador Público Colegiado (CPC)',
            2,
            160,
            'Contador Público Colegiado (CPC)'
          ),
          selloAgenciaBanesco: clampStr(
            voucher.selloAgenciaBanesco || 'Sello Húmedo Agrícola Oni / Recepción Banesco',
            2,
            160,
            'Sello Húmedo Agrícola Oni / Recepción Banesco'
          ),
          expedienteSeniatNro: clampStr(
            voucher.expedienteSeniatNro || 'EXP-SENIAT-ONI-2026',
            2,
            100,
            'EXP-SENIAT-ONI-2026'
          ),
          observacionesAuditor: clampStr(
            voucher.observacionesAuditor ||
              'Comprobante resguardado en Repositorio SENIAT con trazabilidad Banesco.',
            2,
            500,
            'Comprobante resguardado en Repositorio SENIAT con trazabilidad Banesco.'
          ),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
    }
    if (!skipAudit) {
      await writeSecurityAuditLog(
        uid,
        'SINCRONIZACION_REPOSITORIO_COMPROBANTES_SENIAT',
        'COMPROBANTE_SENIAT',
        sanitizeId(`batch-vch-${Date.now()}`),
        `Sincronizados ${vouchers.length} comprobantes oficiales Ene-Ago 2026 de AGRÍCOLA ONI, C.A. en el Repositorio SENIAT.`
      );
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'signedVouchers');
  }
}

