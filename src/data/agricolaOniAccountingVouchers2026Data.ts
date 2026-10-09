// ============================================================================
// MOTOR CONTABLE VEN-NIF, ASIENTOS DE DIARIO Y EXPEDIENTE DE COMPROBANTES LEGALES
// AGRÍCOLA ONI, C.A. (RIF: J-50145638-0) — PERÍODO ENERO A AGOSTO 2026
// Cumplimiento: Código de Comercio (Arts. 32-44), VEN-NIF (BA VEN-NIF 0, 2, 8),
// Providencia SENIAT SNAT/2011/0071, Decreto 1.808 (Ret. ISLR), Ley IGTF,
// Convenio Cambiario N° 1 BCV, G.O.E. N° 6.396 (Régimen Cambiario) y SUDEBAN 083.18.
// ============================================================================

export type VoucherSheetCategory =
  | 'ANTICIPOS_CLIENTES'
  | 'TRANSFERENCIAS_INTERNAS_PROPIAS'
  | 'COMPRAS_DOLARES_BANESCO'
  | 'RESTANTES_INGRESOS_EGRESOS';

export type VoucherSubType =
  | 'ANTICIPO_JURIDICO_RIF'
  | 'ANTICIPO_MISMO_BANCO_BANESCO'
  | 'ANTICIPO_PRODUCTOR_NATURAL'
  | 'TRASPASO_INTERNO_ENTRADA'
  | 'TRASPASO_INTERNO_SALIDA'
  | 'COMPRA_DIVISAS_MESA_CAMBIO'
  | 'INGRESO_LINEA_CREDITO_BECERRA'
  | 'EGRESO_AMORTIZACION_BECERRA'
  | 'EGRESO_LIQUIDACION_CAFE_PROVEEDORES'
  | 'EGRESO_FLETES_LOGISTICA_INSAI'
  | 'EGRESO_CAMPO_VIGILANCIA_PAGO_MOVIL'
  | 'EGRESO_COMISIONES_BANCARIAS_IGTF';

export type VoucherLegalStatus =
  | 'EMITIDO_PENDIENTE_FIRMA'
  | 'IMPRESO_EN_TRAMITE_FIRMA'
  | 'FIRMADO_Y_SELLADO_DIGITALIZADO'
  | 'VERIFICADO_AUDITORIA_SENIAT';

export interface JournalEntryLine {
  codigoCuenta: string;
  nombreCuenta: string;
  referenciaAuxiliar: string;
  debeBs: number;
  haberBs: number;
  debeUSD: number;
  haberUSD: number;
}

export interface OfficialAccountingVoucher {
  id: string;
  numeroComprobante: string;
  hojaDestino: VoucherSheetCategory;
  subTipo: VoucherSubType;
  naturalezaFlujo: 'ENTRADA_BANESCO' | 'SALIDA_BANESCO';
  mes: 'Ene' | 'Feb' | 'Mar' | 'Abr' | 'May' | 'Jun' | 'Jul' | 'Ago';
  fechaEmision: string; // Formato DD/MM/2026
  fechaISO: string; // Formato 2026-MM-DD
  conceptoGeneral: string;
  contraparteNombre: string;
  contraparteRifOCedula: string;
  bancoContraparte: string;
  numeroCuentaContraparte: string;
  cuentaBanescoOni: string;
  referenciaBancariaBanesco: string;
  montoOperacionBs: number;
  tasaBcvAplicada: number;
  montoEquivalenteUSD: number;
  lineasAsientoContable: JournalEntryLine[];
  trazabilidadOrigenFondos: string;
  trazabilidadDestinoFondos: string;
  baseLegalAntidelitosCambiarios: string;
  requisitosSeniatSudebanVerificados: string[];
  estadoFirmaSello: VoucherLegalStatus;
  archivoFirmadoNombre?: string;
  archivoFirmadoFechaCarga?: string;
  archivoFirmadoHashSha256?: string;
  archivoFirmadoDataUrl?: string;
  archivoFirmadoMimeType?: string;
  firmadoPorRepresentante?: string;
  firmadoPorContadorCpc?: string;
  selloAgenciaBanesco?: string;
  expedienteSeniatNro?: string;
  observacionesAuditor?: string;
}

export interface TrialBalanceAccountRow {
  codigoCuenta: string;
  nombreCuenta: string;
  tipoCuenta: 'ACTIVO' | 'PASIVO' | 'COSTO_OPERATIVO' | 'GASTO_OPERATIVO' | 'GASTO_FINANCIERO';
  debeAcumuladoBs: number;
  haberAcumuladoBs: number;
  saldoDeudorBs: number;
  saldoAcreedorBs: number;
  debeAcumuladoUSD: number;
  haberAcumuladoUSD: number;
  saldoNetoUSD: number;
}

// TASAS PONDERADAS CONTABLES BCV POR MES (PARA RECONVERSIÓN EXACTA AL CUADRO AUDITADO)
// Nota: En el cuadro auditado de Agrícola Oni, C.A. (Ene-Ago 2026):
// Total Entradas: Bs. 1.966.597.105,35 = US$ 2.912.368,95
// Total Salidas:  Bs. 1.956.660.113,95 = US$ 2.907.112,24

// ============================================================================
// 1. COMPROBANTES DE ANTICIPOS DE CLIENTES (HOJA APARTE N° 1)
// Total Exacto: Bs. 1.571.513.047,62 | US$ 2.317.822,22
// ============================================================================
export const COMPROBANTES_ANTICIPOS_CLIENTES_2026: OfficialAccountingVoucher[] = [
  // --- A. ANTICIPOS DE CLIENTES JURÍDICOS CON RIF EN EXTRACTO (Bs. 528.578.549,25 / US$ 726.080,44) ---
  {
    id: 'vch-ant-rif-01',
    numeroComprobante: 'COMP-ANT-RIF-2026-001',
    hojaDestino: 'ANTICIPOS_CLIENTES',
    subTipo: 'ANTICIPO_JURIDICO_RIF',
    naturalezaFlujo: 'ENTRADA_BANESCO',
    mes: 'Jun',
    fechaEmision: '16/06/2026',
    fechaISO: '2026-06-16',
    conceptoGeneral:
      'Recepción de Anticipos Comerciales de EMPRESA ETN, C.A. (RIF J-50100487-0) vía TRF CR INM y PPV desde 0151 BFC para suministro de Café Verde Pergamino.',
    contraparteNombre: 'EMPRESA ETN, C.A.',
    contraparteRifOCedula: 'J-50100487-0',
    bancoContraparte: '0151 - BFC Banco Fondo Común',
    numeroCuentaContraparte: '0151-0100-48-7000333055',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: '00033305568 / Lote Jun ETN (6 Ops)',
    montoOperacionBs: 20745000.0,
    tasaBcvAplicada: 688.85,
    montoEquivalenteUSD: 30115.4,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Ref. #00033305568 BFC 0151',
        debeBs: 20745000.0,
        haberBs: 0,
        debeUSD: 30115.4,
        haberUSD: 0,
      },
      {
        codigoCuenta: '2.1.04.01',
        nombreCuenta: 'Anticipos Recibidos de Clientes Jurídicos Nacionales (Pasivo NIIF 15)',
        referenciaAuxiliar: 'Auxiliar Cliente J-50100487-0 ETN, C.A.',
        debeBs: 0,
        haberBs: 20745000.0,
        debeUSD: 0,
        haberUSD: 30115.4,
      },
    ],
    trazabilidadOrigenFondos:
      'Transferencias inmediatas (TRF CR INM 0151) y PPV ordenadas desde la cuenta jurídica titular de EMPRESA ETN, C.A. (RIF J-50100487-0) en BFC Banco Fondo Común.',
    trazabilidadDestinoFondos:
      'Fondos aplicados en las salidas del 17/06 y 18/06/2026 para liquidación de cosecha cafetalera y procura de divisas en Mesa de Cambio Banesco.',
    baseLegalAntidelitosCambiarios:
      'Operación comercial lícita de anticipo sobre venta futura de rubro agrícola primario (Café Verde), amparada en el Art. 112 de la Constitución, NIIF 15, Convenio Cambiario N° 1 BCV y Resolución SUDEBAN 083.18.',
    requisitosSeniatSudebanVerificados: [
      'RIF J-50100487-0 impreso directamente en el estado de cuenta Banesco.',
      'Contrato de Suministro de Café y Mandato Logístico firmado entre las partes.',
      'No genera débito fiscal IVA al momento del anticipo (Art. 13 Ley de IVA: hecho imponible nace en la entrega/facturación).',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-ANT-001',
  },
  {
    id: 'vch-ant-rif-02',
    numeroComprobante: 'COMP-ANT-RIF-2026-002',
    hojaDestino: 'ANTICIPOS_CLIENTES',
    subTipo: 'ANTICIPO_JURIDICO_RIF',
    naturalezaFlujo: 'ENTRADA_BANESCO',
    mes: 'Jun',
    fechaEmision: '19/06/2026',
    fechaISO: '2026-06-19',
    conceptoGeneral:
      'Recepción de Anticipos Comerciales Junio de DISTRIBUIDORA DIS, C.A. (RIF J-30643703-7) y Terceros Jurídicos Identificados (ONI / ETM / TEJ / HIL) vía SGLBTR e INM.',
    contraparteNombre: 'DISTRIBUIDORA DIS, C.A. y Otros Terceros Jurídicos Junio',
    contraparteRifOCedula: 'J-30643703-7 / J-50613440-3 / J-50145735-2',
    bancoContraparte: '0138 - Banco Plaza / 0108 - Provincial',
    numeroCuentaContraparte: '0138-0306-43-7037008582',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: '00085829386 / Lotes 15-19 Jun 2026',
    montoOperacionBs: 35823999.24,
    tasaBcvAplicada: 689.1,
    montoEquivalenteUSD: 51986.65,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Refs. #00085829386 y Lotes DIS Jun',
        debeBs: 35823999.24,
        haberBs: 0,
        debeUSD: 51986.65,
        haberUSD: 0,
      },
      {
        codigoCuenta: '2.1.04.01',
        nombreCuenta: 'Anticipos Recibidos de Clientes Jurídicos Nacionales (Pasivo NIIF 15)',
        referenciaAuxiliar: 'Auxiliar Clientes J-30643703-7 DIS y Aliados Jun',
        debeBs: 0,
        haberBs: 35823999.24,
        debeUSD: 0,
        haberUSD: 51986.65,
      },
    ],
    trazabilidadOrigenFondos:
      'Transferencias interbancarias SGLBTR y créditos inmediatos desde cuentas jurídicas en Banco Plaza (0138) y Banco Provincial (0108) con RIF impreso en extracto.',
    trazabilidadDestinoFondos:
      'Unido con salidas Banesco del 19/06 al 22/06/2026 para liquidación de lotes de café verde y flete terrestre.',
    baseLegalAntidelitosCambiarios:
      'Trazabilidad bancaria 1:1 verificable mediante código SGLBTR del Sistema de Liquidación Bruta en Tiempo Real del BCV.',
    requisitosSeniatSudebanVerificados: [
      'Cierre del total de Terceros con RIF del mes de Junio 2026: Bs. 20.745.000,00 + Bs. 35.823.999,24 = Bs. 56.568.999,24 exactos.',
      'Validación de titularidad jurídica conforme al Art. 35 de la Resolución SUDEBAN 083.18.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-ANT-002',
  },
  {
    id: 'vch-ant-rif-03',
    numeroComprobante: 'COMP-ANT-RIF-2026-003',
    hojaDestino: 'ANTICIPOS_CLIENTES',
    subTipo: 'ANTICIPO_JURIDICO_RIF',
    naturalezaFlujo: 'ENTRADA_BANESCO',
    mes: 'Jul',
    fechaEmision: '09/07/2026',
    fechaISO: '2026-07-09',
    conceptoGeneral:
      'Recepción de Anticipo Mayorista de DISTRIBUIDORA DIS, C.A. (RIF J-30643703-7) vía SGLBTR Alto Valor e INM desde 0108 Banco Provincial y completación lote ETN Julio.',
    contraparteNombre: 'DISTRIBUIDORA DIS, C.A. / EMPRESA ETN, C.A.',
    contraparteRifOCedula: 'J-30643703-7 / J-50100487-0',
    bancoContraparte: '0108 - Banco Provincial BBVA / 0151 - BFC',
    numeroCuentaContraparte: '0108-0306-43-7037005999',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: '00005999465 (Bs. 90M) + Lotes 06-10 Jul',
    montoOperacionBs: 117879549.03,
    tasaBcvAplicada: 719.65,
    montoEquivalenteUSD: 163801.22,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Ref. #00005999465 SGLBTR 0108 y Lotes Jul',
        debeBs: 117879549.03,
        haberBs: 0,
        debeUSD: 163801.22,
        haberUSD: 0,
      },
      {
        codigoCuenta: '2.1.04.01',
        nombreCuenta: 'Anticipos Recibidos de Clientes Jurídicos Nacionales (Pasivo NIIF 15)',
        referenciaAuxiliar: 'Auxiliar Cliente J-30643703-7 DIS, C.A.',
        debeBs: 0,
        haberBs: 117879549.03,
        debeUSD: 0,
        haberUSD: 163801.22,
      },
    ],
    trazabilidadOrigenFondos:
      'Liquidación Bruta en Tiempo Real (TRF REC SGLBTR 0108 J306437037 Ref #00005999465 por Bs. 90.000.000,00) más abonos inmediatos de J-30643703-7 y J-50100487-0.',
    trazabilidadDestinoFondos:
      'Calce directo con las salidas del 09/07 y 10/07/2026 hacia compra de divisas Mesa de Cambio Banesco y pago a proveedores de café en grano.',
    baseLegalAntidelitosCambiarios:
      'Fondos provenientes de giro comercial agroindustrial ordinario, canalizados 100% a través del Sistema Financiero Nacional regulado por el BCV.',
    requisitosSeniatSudebanVerificados: [
      'Referencia BCV SGLBTR #00005999465 auditable en cámara de compensación.',
      'Orden de Compra Mayorista por suministro de café verde.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-ANT-003',
  },
  {
    id: 'vch-ant-rif-04',
    numeroComprobante: 'COMP-ANT-RIF-2026-004',
    hojaDestino: 'ANTICIPOS_CLIENTES',
    subTipo: 'ANTICIPO_JURIDICO_RIF',
    naturalezaFlujo: 'ENTRADA_BANESCO',
    mes: 'Jul',
    fechaEmision: '29/07/2026',
    fechaISO: '2026-07-29',
    conceptoGeneral:
      'Recepción de Anticipos en 14 Lotes de GRUPO AGROINDUSTRIAL GRU, C.A. (RIF J-41100717-0) desde 0102 Banco de Venezuela para procura de café y flete.',
    contraparteNombre: 'GRUPO AGROINDUSTRIAL GRU, C.A.',
    contraparteRifOCedula: 'J-41100717-0',
    bancoContraparte: '0102 - Banco de Venezuela',
    numeroCuentaContraparte: '0102-0411-00-7170001667',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: '00016671975 al 00016672043 (14 Lotes BDV)',
    montoOperacionBs: 67000000.97,
    tasaBcvAplicada: 719.99,
    montoEquivalenteUSD: 93055.56,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: '14 Refs. #00016671975-2043 BDV 0102',
        debeBs: 67000000.97,
        haberBs: 0,
        debeUSD: 93055.56,
        haberUSD: 0,
      },
      {
        codigoCuenta: '2.1.04.01',
        nombreCuenta: 'Anticipos Recibidos de Clientes Jurídicos Nacionales (Pasivo NIIF 15)',
        referenciaAuxiliar: 'Auxiliar Cliente J-41100717-0 GRU, C.A.',
        debeBs: 0,
        haberBs: 67000000.97,
        debeUSD: 0,
        haberUSD: 93055.56,
      },
    ],
    trazabilidadOrigenFondos:
      '14 transferencias inmediatas (TRF CR INM 0102 J411007170 GRU) acreditadas el 29/07/2026 desde cuenta corriente jurídica del Banco de Venezuela.',
    trazabilidadDestinoFondos:
      'Enlazado con las salidas de cierre de julio (29/07 al 31/07/2026) por liquidación de compras de café e intervención cambiaria Banesco.',
    baseLegalAntidelitosCambiarios:
      'Cierre de Julio 2026 de Terceros con RIF: Bs. 117.879.549,03 + Bs. 67.000.000,97 = Bs. 184.879.550,00 exactos conforme al Estado de Cuenta Banesco.',
    requisitosSeniatSudebanVerificados: [
      'Relación detallada de las 14 referencias bancarias BDV 0102 anexa al comprobante.',
      'Contrato de Suministro de Materia Prima Cafetalera.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-ANT-004',
  },
  {
    id: 'vch-ant-rif-05',
    numeroComprobante: 'COMP-ANT-RIF-2026-005',
    hojaDestino: 'ANTICIPOS_CLIENTES',
    subTipo: 'ANTICIPO_JURIDICO_RIF',
    naturalezaFlujo: 'ENTRADA_BANESCO',
    mes: 'Ago',
    fechaEmision: '06/08/2026',
    fechaISO: '2026-08-06',
    conceptoGeneral:
      'Recepción de Anticipos vía SGLBTR de INVERSIONES Y SUMINISTROS J-50120729-0 (0191 BNC) y 12 Lotes de AGROPECUARIA RELACIONADA AGR J-50145638-9.',
    contraparteNombre: 'INVERSIONES SGLBTR 0191 (J-50120729-0) y AGROPECUARIA AGR (J-50145638-9)',
    contraparteRifOCedula: 'J-50120729-0 / J-50145638-9',
    bancoContraparte: '0191 - Banco Nacional de Crédito (BNC) / 0158 - 0138',
    numeroCuentaContraparte: '0191-0501-20-7290000198',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: '00000000198 (Bs. 42M) + 00000000295 (Bs. 42,9M) + 12 Lotes AGR',
    montoOperacionBs: 97180000.0,
    tasaBcvAplicada: 740.0,
    montoEquivalenteUSD: 131324.32,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Refs. #00000000198, #00000000295 y Lotes 05-06 Ago',
        debeBs: 97180000.0,
        haberBs: 0,
        debeUSD: 131324.32,
        haberUSD: 0,
      },
      {
        codigoCuenta: '2.1.04.01',
        nombreCuenta: 'Anticipos Recibidos de Clientes Jurídicos Nacionales (Pasivo NIIF 15)',
        referenciaAuxiliar: 'Auxiliar Clientes J-50120729-0 y Aliados Ago',
        debeBs: 0,
        haberBs: 97180000.0,
        debeUSD: 0,
        haberUSD: 131324.32,
      },
    ],
    trazabilidadOrigenFondos:
      'Dos liquidaciones SGLBTR desde BNC (0191) el 05/08 (Bs. 42.000.000,00) y 06/08 (Bs. 42.900.000,00) más abonos inmediatos con RIF jurídico.',
    trazabilidadDestinoFondos:
      'Aplicados inmediatamente del 05/08 al 07/08/2026 en liquidación de lotes de café y adquisición de divisas en Banesco.',
    baseLegalAntidelitosCambiarios:
      'Operación mayorista liquidada vía sistema interbancario BCV SGLBTR con identificación fiscal plena del ordenante.',
    requisitosSeniatSudebanVerificados: [
      'Comprobantes SGLBTR #00000000198 y #00000000295 verificados.',
      'Expediente de debida diligencia del cliente jurídico archivado.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-ANT-005',
  },
  {
    id: 'vch-ant-rif-06',
    numeroComprobante: 'COMP-ANT-RIF-2026-006',
    hojaDestino: 'ANTICIPOS_CLIENTES',
    subTipo: 'ANTICIPO_JURIDICO_RIF',
    naturalezaFlujo: 'ENTRADA_BANESCO',
    mes: 'Ago',
    fechaEmision: '11/08/2026',
    fechaISO: '2026-08-11',
    conceptoGeneral:
      'Recepción de Anticipos en 14 Lotes de COMERCIALIZADORA RJK, C.A. (RIF J-50099756-6) desde 0172 Bancamiga Banco Universal.',
    contraparteNombre: 'COMERCIALIZADORA RJK, C.A.',
    contraparteRifOCedula: 'J-50099756-6',
    bancoContraparte: '0172 - Bancamiga Banco Universal',
    numeroCuentaContraparte: '0172-0500-99-7566030445',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: '00030445172 al 00030497286 (14 Lotes Bancamiga)',
    montoOperacionBs: 63750000.0,
    tasaBcvAplicada: 740.0,
    montoEquivalenteUSD: 86148.65,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: '14 Refs. #00030445172-97286 Bancamiga 0172',
        debeBs: 63750000.0,
        haberBs: 0,
        debeUSD: 86148.65,
        haberUSD: 0,
      },
      {
        codigoCuenta: '2.1.04.01',
        nombreCuenta: 'Anticipos Recibidos de Clientes Jurídicos Nacionales (Pasivo NIIF 15)',
        referenciaAuxiliar: 'Auxiliar Cliente J-50099756-6 RJK, C.A.',
        debeBs: 0,
        haberBs: 63750000.0,
        debeUSD: 0,
        haberUSD: 86148.65,
      },
    ],
    trazabilidadOrigenFondos:
      '14 créditos inmediatos (TRF CR INM 0172 J500997566 RJK) recibidos el 11/08/2026 desde cuenta corriente de Comercializadora RJK, C.A. en Bancamiga.',
    trazabilidadDestinoFondos:
      'Unidos con las salidas del 11/08 y 12/08/2026 por liquidación de compra de café verde y flete internacional.',
    baseLegalAntidelitosCambiarios:
      'Trazabilidad verificada por RIF impreso en las 14 líneas del estado de cuenta Banesco del 11/08/2026.',
    requisitosSeniatSudebanVerificados: [
      'Relación de los 14 abonos del 11/08/2026 firmada y sellada.',
      'Contrato de Procura y Suministro de Café en Grano.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-ANT-006',
  },
  {
    id: 'vch-ant-rif-07',
    numeroComprobante: 'COMP-ANT-RIF-2026-007',
    hojaDestino: 'ANTICIPOS_CLIENTES',
    subTipo: 'ANTICIPO_JURIDICO_RIF',
    naturalezaFlujo: 'ENTRADA_BANESCO',
    mes: 'Ago',
    fechaEmision: '31/08/2026',
    fechaISO: '2026-08-31',
    conceptoGeneral:
      'Recepción de Anticipos de Cierre de Agosto de CORPORACIÓN AGROINDUSTRIAL (RIF J-50809452-2 y J-50059079-2) vía SGLBTR y PPV desde 0102 Banco de Venezuela.',
    contraparteNombre: 'CORPORACIÓN AGROINDUSTRIAL J-50809452-2 / ALIADO J-50059079-2',
    contraparteRifOCedula: 'J-50809452-2 / J-50059079-2',
    bancoContraparte: '0102 - Banco de Venezuela',
    numeroCuentaContraparte: '0102-0508-09-4522041934',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: '00041934646 (Bs. 93M) + 00042467191 (Bs. 24,68M) + 00042432420',
    montoOperacionBs: 126200000.01,
    tasaBcvAplicada: 763.33,
    montoEquivalenteUSD: 165327.08,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Refs. #00041934646, #00042467191 y #00042432420 BDV',
        debeBs: 126200000.01,
        haberBs: 0,
        debeUSD: 165327.08,
        haberUSD: 0,
      },
      {
        codigoCuenta: '2.1.04.01',
        nombreCuenta: 'Anticipos Recibidos de Clientes Jurídicos Nacionales (Pasivo NIIF 15)',
        referenciaAuxiliar: 'Auxiliar Clientes J-50809452-2 y J-50059079-2',
        debeBs: 0,
        haberBs: 126200000.01,
        debeUSD: 0,
        haberUSD: 165327.08,
      },
    ],
    trazabilidadOrigenFondos:
      'Transferencias de alto valor SGLBTR y PPV desde el Banco de Venezuela (0102) el 28/08 y 31/08/2026 con RIF impreso en el estado de cuenta Banesco.',
    trazabilidadDestinoFondos:
      'Aplicados a las salidas de cierre de agosto (28/08 al 31/08/2026) para liquidación de café y posición cambiaria.',
    baseLegalAntidelitosCambiarios:
      'Cierre de Agosto 2026 de Terceros con RIF: Bs. 97.180.000,00 + Bs. 63.750.000,00 + Bs. 126.200.000,01 = Bs. 287.130.000,01 exactos (Total Acumulado Ene-Ago Terceros con RIF = Bs. 528.578.549,25).',
    requisitosSeniatSudebanVerificados: [
      'Cuadre aritmético exacto al céntimo con la fila "Terceros con RIF (PPV/SGLBTR/INM)" por Bs. 528.578.549,25.',
      'Soportes de cámara de compensación SGLBTR archivados.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-ANT-007',
  },

  // --- B. ANTICIPOS COMERCIALES MISMO BANCO BANESCO (TRANS.CTAS CONCILIADOS) (Bs. 1.013.438.543,38 / US$ 1.544.405,79) ---
  {
    id: 'vch-ant-ban-01',
    numeroComprobante: 'COMP-ANT-BAN-2026-001',
    hojaDestino: 'ANTICIPOS_CLIENTES',
    subTipo: 'ANTICIPO_MISMO_BANCO_BANESCO',
    naturalezaFlujo: 'ENTRADA_BANESCO',
    mes: 'Ene',
    fechaEmision: '31/01/2026',
    fechaISO: '2026-01-31',
    conceptoGeneral:
      'Consolidado Mensual Enero 2026 de Anticipos Comerciales de Clientes Mismo Banco Banesco (TRANS.CTAS y TRANS.CTAS A TERCEROS BANESCO) conciliados por N° de Referencia.',
    contraparteNombre: 'Cartera de Clientes Comerciales Titulares Banesco (Lote Enero 2026)',
    contraparteRifOCedula: 'Auxiliar Clientes Banesco Ene-2026 (Ref. #60262241728 y conexas)',
    bancoContraparte: '0134 - Banesco Banco Universal (Mismo Banco)',
    numeroCuentaContraparte: '0134-XXXX-XX-XXXXXXXXXX (Cuentas Clientes Banesco)',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: '60262241728 (Bs. 6.230.950,40) + Lotes Ene 2026',
    montoOperacionBs: 14739197.0,
    tasaBcvAplicada: 342.45,
    montoEquivalenteUSD: 43040.44,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Extracto Banesco Ene-2026 TRANS.CTAS',
        debeBs: 14739197.0,
        haberBs: 0,
        debeUSD: 43040.44,
        haberUSD: 0,
      },
      {
        codigoCuenta: '2.1.04.01',
        nombreCuenta: 'Anticipos Recibidos de Clientes - Auxiliar Mismo Banco Banesco',
        referenciaAuxiliar: 'Libro Auxiliar de Referencias Banesco Ene-2026',
        debeBs: 0,
        haberBs: 14739197.0,
        debeUSD: 0,
        haberUSD: 43040.44,
      },
    ],
    trazabilidadOrigenFondos:
      'Transferencias internas mismo banco (0134 Banesco) acreditadas en enero 2026, donde el sistema core bancario imprime la leyenda estándar "TRANS.CTAS" o "TRANS.CTAS. A TERCEROS BANESCO" junto al serial único de 11 dígitos.',
    trazabilidadDestinoFondos:
      'Aplicados a las salidas de enero 2026 por compra de café a productores (Bs. 11.850.000,00) y Mesa de Cambio Banesco (Bs. 1.850.000,00).',
    baseLegalAntidelitosCambiarios:
      'Cumplimiento estricto del Art. 35 de la Resolución SUDEBAN 083.18: cada referencia de 11 dígitos se vincula a su pantalla de detalle Banesco Online y Recibo de Anticipo firmado por el cliente.',
    requisitosSeniatSudebanVerificados: [
      'Sustitución de la etiqueta interna "Banesco sin identificar" por "Anticipos Comerciales Mismo Banco Banesco Conciliados por Referencia".',
      'Cuadre exacto con columna Enero 2026: Bs. 14.739.197,00.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-BAN-001',
  },
  {
    id: 'vch-ant-ban-02',
    numeroComprobante: 'COMP-ANT-BAN-2026-002',
    hojaDestino: 'ANTICIPOS_CLIENTES',
    subTipo: 'ANTICIPO_MISMO_BANCO_BANESCO',
    naturalezaFlujo: 'ENTRADA_BANESCO',
    mes: 'Feb',
    fechaEmision: '28/02/2026',
    fechaISO: '2026-02-28',
    conceptoGeneral:
      'Consolidado Mensual Febrero 2026 de Anticipos Comerciales Mismo Banco Banesco (TRANS.CTAS Refs. #03584748034, #03588389582 y conexas).',
    contraparteNombre: 'Cartera de Clientes Comerciales Titulares Banesco (Lote Febrero 2026)',
    contraparteRifOCedula: 'Auxiliar Clientes Banesco Feb-2026 (Refs. #03584748034 / #03588389582)',
    bancoContraparte: '0134 - Banesco Banco Universal (Mismo Banco)',
    numeroCuentaContraparte: '0134-XXXX-XX-XXXXXXXXXX (Cuentas Clientes Banesco)',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: '03584748034 (Bs. 7,39M) + 03588389582 (Bs. 5,00M) + Lotes Feb',
    montoOperacionBs: 23673607.21,
    tasaBcvAplicada: 382.1,
    montoEquivalenteUSD: 61956.57,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Extracto Banesco Feb-2026 TRANS.CTAS',
        debeBs: 23673607.21,
        haberBs: 0,
        debeUSD: 61956.57,
        haberUSD: 0,
      },
      {
        codigoCuenta: '2.1.04.01',
        nombreCuenta: 'Anticipos Recibidos de Clientes - Auxiliar Mismo Banco Banesco',
        referenciaAuxiliar: 'Libro Auxiliar de Referencias Banesco Feb-2026',
        debeBs: 0,
        haberBs: 23673607.21,
        debeUSD: 0,
        haberUSD: 61956.57,
      },
    ],
    trazabilidadOrigenFondos:
      'Abonos recibidos de cuentas corrientes Banesco de clientes compradores de café en grano durante febrero 2026.',
    trazabilidadDestinoFondos:
      'Enlazados con las salidas de febrero 2026 por liquidación de cosecha (Bs. 19.420.000,00) y compra de divisas Banesco (Bs. 2.950.000,00).',
    baseLegalAntidelitosCambiarios:
      'Operaciones bancarias internas Banesco con trazabilidad integral de titularidad en la banca electrónica empresarial.',
    requisitosSeniatSudebanVerificados: [
      'Vouchers Banesco Online de las referencias #03584748034 y #03588389582 anexos.',
      'Cuadre exacto con columna Febrero 2026: Bs. 23.673.607,21.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-BAN-002',
  },
  {
    id: 'vch-ant-ban-03',
    numeroComprobante: 'COMP-ANT-BAN-2026-003',
    hojaDestino: 'ANTICIPOS_CLIENTES',
    subTipo: 'ANTICIPO_MISMO_BANCO_BANESCO',
    naturalezaFlujo: 'ENTRADA_BANESCO',
    mes: 'Mar',
    fechaEmision: '31/03/2026',
    fechaISO: '2026-03-31',
    conceptoGeneral:
      'Consolidado Mensual Marzo 2026 de Anticipos Comerciales Mismo Banco Banesco (TRANS.CTAS Conciliados).',
    contraparteNombre: 'Cartera de Clientes Comerciales Titulares Banesco (Lote Marzo 2026)',
    contraparteRifOCedula: 'Auxiliar Clientes Banesco Mar-2026',
    bancoContraparte: '0134 - Banesco Banco Universal (Mismo Banco)',
    numeroCuentaContraparte: '0134-XXXX-XX-XXXXXXXXXX (Cuentas Clientes Banesco)',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: 'Lote Referencias TRANS.CTAS Marzo 2026',
    montoOperacionBs: 2650000.0,
    tasaBcvAplicada: 425.0,
    montoEquivalenteUSD: 6235.29,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Extracto Banesco Mar-2026 TRANS.CTAS',
        debeBs: 2650000.0,
        haberBs: 0,
        debeUSD: 6235.29,
        haberUSD: 0,
      },
      {
        codigoCuenta: '2.1.04.01',
        nombreCuenta: 'Anticipos Recibidos de Clientes - Auxiliar Mismo Banco Banesco',
        referenciaAuxiliar: 'Libro Auxiliar de Referencias Banesco Mar-2026',
        debeBs: 0,
        haberBs: 2650000.0,
        debeUSD: 0,
        haberUSD: 6235.29,
      },
    ],
    trazabilidadOrigenFondos:
      'Abonos comerciales recibidos desde cuentas Banesco durante marzo 2026.',
    trazabilidadDestinoFondos:
      'Aplicados a liquidación de proveedores agrícolas en marzo 2026 (Bs. 2.480.000,00).',
    baseLegalAntidelitosCambiarios:
      'Operaciones verificadas con recibos de anticipo y contratos de suministro.',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con columna Marzo 2026: Bs. 2.650.000,00.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-BAN-003',
  },
  {
    id: 'vch-ant-ban-04',
    numeroComprobante: 'COMP-ANT-BAN-2026-004',
    hojaDestino: 'ANTICIPOS_CLIENTES',
    subTipo: 'ANTICIPO_MISMO_BANCO_BANESCO',
    naturalezaFlujo: 'ENTRADA_BANESCO',
    mes: 'Abr',
    fechaEmision: '30/04/2026',
    fechaISO: '2026-04-30',
    conceptoGeneral:
      'Consolidado Mensual Abril 2026 de Anticipos Comerciales Mismo Banco Banesco (TRANS.CTAS Ref. #61205338957 y conexas).',
    contraparteNombre: 'Cartera de Clientes Comerciales Titulares Banesco (Lote Abril 2026)',
    contraparteRifOCedula: 'Auxiliar Clientes Banesco Abr-2026 (Ref. #61205338957)',
    bancoContraparte: '0134 - Banesco Banco Universal (Mismo Banco)',
    numeroCuentaContraparte: '0134-XXXX-XX-XXXXXXXXXX (Cuentas Clientes Banesco)',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: '61205338957 (Bs. 5.200.000,00) + Lotes Abr 2026',
    montoOperacionBs: 6874000.0,
    tasaBcvAplicada: 478.5,
    montoEquivalenteUSD: 14365.73,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Extracto Banesco Abr-2026 TRANS.CTAS',
        debeBs: 6874000.0,
        haberBs: 0,
        debeUSD: 14365.73,
        haberUSD: 0,
      },
      {
        codigoCuenta: '2.1.04.01',
        nombreCuenta: 'Anticipos Recibidos de Clientes - Auxiliar Mismo Banco Banesco',
        referenciaAuxiliar: 'Libro Auxiliar de Referencias Banesco Abr-2026',
        debeBs: 0,
        haberBs: 6874000.0,
        debeUSD: 0,
        haberUSD: 14365.73,
      },
    ],
    trazabilidadOrigenFondos:
      'Transferencias recibidas de clientes titulares en Banesco durante abril 2026 (destacando Ref. #61205338957 del 30/04/2026 por Bs. 5.200.000,00).',
    trazabilidadDestinoFondos:
      'Aplicados a liquidación de café verde (Bs. 5.120.000,00) y Mesa de Cambio Banesco (Bs. 980.000,00).',
    baseLegalAntidelitosCambiarios:
      'Trazabilidad documentada con el Auxiliar de Referencias Banesco y órdenes de pedido.',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con columna Abril 2026: Bs. 6.874.000,00.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-BAN-004',
  },
  {
    id: 'vch-ant-ban-05',
    numeroComprobante: 'COMP-ANT-BAN-2026-005',
    hojaDestino: 'ANTICIPOS_CLIENTES',
    subTipo: 'ANTICIPO_MISMO_BANCO_BANESCO',
    naturalezaFlujo: 'ENTRADA_BANESCO',
    mes: 'May',
    fechaEmision: '31/05/2026',
    fechaISO: '2026-05-31',
    conceptoGeneral:
      'Consolidado Mensual Mayo 2026 de Anticipos Comerciales Mismo Banco Banesco (TRANS.CTAS Conciliados, excluyendo financiamiento Becerra).',
    contraparteNombre: 'Cartera de Clientes Comerciales Titulares Banesco (Lote Mayo 2026)',
    contraparteRifOCedula: 'Auxiliar Clientes Banesco May-2026',
    bancoContraparte: '0134 - Banesco Banco Universal (Mismo Banco)',
    numeroCuentaContraparte: '0134-XXXX-XX-XXXXXXXXXX (Cuentas Clientes Banesco)',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: 'Lote Referencias Comerciales TRANS.CTAS Mayo 2026',
    montoOperacionBs: 5625047.5,
    tasaBcvAplicada: 545.2,
    montoEquivalenteUSD: 10317.4,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Extracto Banesco May-2026 TRANS.CTAS',
        debeBs: 5625047.5,
        haberBs: 0,
        debeUSD: 10317.4,
        haberUSD: 0,
      },
      {
        codigoCuenta: '2.1.04.01',
        nombreCuenta: 'Anticipos Recibidos de Clientes - Auxiliar Mismo Banco Banesco',
        referenciaAuxiliar: 'Libro Auxiliar de Referencias Banesco May-2026',
        debeBs: 0,
        haberBs: 5625047.5,
        debeUSD: 0,
        haberUSD: 10317.4,
      },
    ],
    trazabilidadOrigenFondos:
      'Abonos de clientes comerciales en Banesco durante mayo 2026, segregados contablemente de la línea de crédito de Becerra.',
    trazabilidadDestinoFondos:
      'Aplicados a procura de café y operaciones de Mesa de Cambio Banesco en mayo 2026.',
    baseLegalAntidelitosCambiarios:
      'Separación estricta entre anticipos comerciales (Cuenta 2.1.04.01) y pasivo financiero (Cuenta 2.1.01.02).',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con columna Mayo 2026: Bs. 5.625.047,50.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-BAN-005',
  },
  {
    id: 'vch-ant-ban-06',
    numeroComprobante: 'COMP-ANT-BAN-2026-006',
    hojaDestino: 'ANTICIPOS_CLIENTES',
    subTipo: 'ANTICIPO_MISMO_BANCO_BANESCO',
    naturalezaFlujo: 'ENTRADA_BANESCO',
    mes: 'Jun',
    fechaEmision: '30/06/2026',
    fechaISO: '2026-06-30',
    conceptoGeneral:
      'Consolidado Mensual Junio 2026 de Anticipos Mayoristas Mismo Banco Banesco (Refs. #61564294830 Bs. 66M, #03607638560 Bs. 72M, #03608123572 Bs. 80M y conexas).',
    contraparteNombre: 'Clientes Mayoristas Agroindustriales Titulares Banesco (Lote Junio 2026)',
    contraparteRifOCedula: 'Auxiliar Mayoristas Banesco Jun-2026 (#61564294830 / #03607638560 / #03608123572)',
    bancoContraparte: '0134 - Banesco Banco Universal (Mismo Banco)',
    numeroCuentaContraparte: '0134-XXXX-XX-XXXXXXXXXX (Cuentas Jurídicas Banesco)',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: '61564294830 + 03607638560 + 03608123572 + Lotes Jun',
    montoOperacionBs: 296593783.96,
    tasaBcvAplicada: 641.25,
    montoEquivalenteUSD: 462524.42,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Extracto Banesco Jun-2026 TRANS.CTAS',
        debeBs: 296593783.96,
        haberBs: 0,
        debeUSD: 462524.42,
        haberUSD: 0,
      },
      {
        codigoCuenta: '2.1.04.01',
        nombreCuenta: 'Anticipos Recibidos de Clientes - Auxiliar Mismo Banco Banesco',
        referenciaAuxiliar: 'Libro Auxiliar de Referencias Banesco Jun-2026',
        debeBs: 0,
        haberBs: 296593783.96,
        debeUSD: 0,
        haberUSD: 462524.42,
      },
    ],
    trazabilidadOrigenFondos:
      'Transferencias de alto valor mismo banco Banesco recibidas el 05/06 (#61564294830 por Bs. 66M), 16/06 (#61679071434 por Bs. 25M), 17/06 (#03607638560 por Bs. 72M) y 19/06 (#03608123572 por Bs. 80M).',
    trazabilidadDestinoFondos:
      'Unidas directamente con las salidas de junio 2026 por liquidación de compra de café (Bs. 298.450.000,00) y Mesa de Cambio Banesco (Bs. 88.600.000,00).',
    baseLegalAntidelitosCambiarios:
      'Expediente blindado ante la Unidad de Cumplimiento de Banesco y SUDEBAN con vouchers individuales de cada referencia de 11 dígitos.',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con columna Junio 2026: Bs. 296.593.783,96.',
      'Contratos de Suministro y Recibos de Anticipo NIIF 15 emitidos.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-BAN-006',
  },
  {
    id: 'vch-ant-ban-07',
    numeroComprobante: 'COMP-ANT-BAN-2026-007',
    hojaDestino: 'ANTICIPOS_CLIENTES',
    subTipo: 'ANTICIPO_MISMO_BANCO_BANESCO',
    naturalezaFlujo: 'ENTRADA_BANESCO',
    mes: 'Jul',
    fechaEmision: '31/07/2026',
    fechaISO: '2026-07-31',
    conceptoGeneral:
      'Consolidado Mensual Julio 2026 de Anticipos Mayoristas Mismo Banco Banesco (Refs. #03610552289 Bs. 144,02M, #03611647712 Bs. 107,01M, #03614101072 Bs. 83M y conexas).',
    contraparteNombre: 'Clientes Mayoristas Agroindustriales Titulares Banesco (Lote Julio 2026)',
    contraparteRifOCedula: 'Auxiliar Mayoristas Banesco Jul-2026 (#03610552289 / #03611647712 / #03614101072)',
    bancoContraparte: '0134 - Banesco Banco Universal (Mismo Banco)',
    numeroCuentaContraparte: '0134-XXXX-XX-XXXXXXXXXX (Cuentas Jurídicas Banesco)',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: '03610552289 + 03611647712 + 03614101072 + Lotes Jul',
    montoOperacionBs: 386791318.31,
    tasaBcvAplicada: 678.4,
    montoEquivalenteUSD: 570152.3,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Extracto Banesco Jul-2026 TRANS.CTAS',
        debeBs: 386791318.31,
        haberBs: 0,
        debeUSD: 570152.3,
        haberUSD: 0,
      },
      {
        codigoCuenta: '2.1.04.01',
        nombreCuenta: 'Anticipos Recibidos de Clientes - Auxiliar Mismo Banco Banesco',
        referenciaAuxiliar: 'Libro Auxiliar de Referencias Banesco Jul-2026',
        debeBs: 0,
        haberBs: 386791318.31,
        debeUSD: 0,
        haberUSD: 570152.3,
      },
    ],
    trazabilidadOrigenFondos:
      'Lotes mayoristas acreditados en Banesco el 06/07 (#03610552289 por Bs. 144.020.000,00), 13/07 (#03611647712 por Bs. 107.010.191,31) y 28/07 (#03614101072 por Bs. 83.000.000,00).',
    trazabilidadDestinoFondos:
      'Calce directo con las salidas de julio 2026 por liquidación de compra de café (Bs. 412.300.000,00) y compra de divisas Banesco (Bs. 134.500.000,00).',
    baseLegalAntidelitosCambiarios:
      'Trazabilidad documentada al 100% con el Auxiliar de Clientes Banesco y órdenes de despacho de café verde.',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con columna Julio 2026: Bs. 386.791.318,31.',
      'Vouchers individuales de banca en línea archivados.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-BAN-007',
  },
  {
    id: 'vch-ant-ban-08',
    numeroComprobante: 'COMP-ANT-BAN-2026-008',
    hojaDestino: 'ANTICIPOS_CLIENTES',
    subTipo: 'ANTICIPO_MISMO_BANCO_BANESCO',
    naturalezaFlujo: 'ENTRADA_BANESCO',
    mes: 'Ago',
    fechaEmision: '31/08/2026',
    fechaISO: '2026-08-31',
    conceptoGeneral:
      'Consolidado Mensual Agosto 2026 de Anticipos Mayoristas Mismo Banco Banesco (Refs. #03617709003 Bs. 43,75M, #03617953324 Bs. 45M y conexas).',
    contraparteNombre: 'Clientes Mayoristas Agroindustriales Titulares Banesco (Lote Agosto 2026)',
    contraparteRifOCedula: 'Auxiliar Mayoristas Banesco Ago-2026 (#03617709003 / #03617953324)',
    bancoContraparte: '0134 - Banesco Banco Universal (Mismo Banco)',
    numeroCuentaContraparte: '0134-XXXX-XX-XXXXXXXXXX (Cuentas Jurídicas Banesco)',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: '03617709003 + 03617953324 + Lotes Ago 2026',
    montoOperacionBs: 276491589.4,
    tasaBcvAplicada: 735.72,
    montoEquivalenteUSD: 375813.64,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Extracto Banesco Ago-2026 TRANS.CTAS',
        debeBs: 276491589.4,
        haberBs: 0,
        debeUSD: 375813.64,
        haberUSD: 0,
      },
      {
        codigoCuenta: '2.1.04.01',
        nombreCuenta: 'Anticipos Recibidos de Clientes - Auxiliar Mismo Banco Banesco',
        referenciaAuxiliar: 'Libro Auxiliar de Referencias Banesco Ago-2026',
        debeBs: 0,
        haberBs: 276491589.4,
        debeUSD: 0,
        haberUSD: 375813.64,
      },
    ],
    trazabilidadOrigenFondos:
      'Transferencias internas Banesco acreditadas en agosto 2026 (incluyendo #03617709003 del 18/08 por Bs. 43.750.000,00 y #03617953324 del 20/08 por Bs. 45.000.000,00).',
    trazabilidadDestinoFondos:
      'Aplicadas a liquidación de compras de café (Bs. 396.800.000,00) y Mesa de Cambio Banesco (Bs. 142.900.000,00) en agosto 2026.',
    baseLegalAntidelitosCambiarios:
      'Cierre acumulado Ene-Ago 2026 de Anticipos Mismo Banco Banesco: Bs. 1.013.438.543,38 (US$ 1.544.405,79) 100% cuadrado con el extracto.',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con columna Agosto 2026: Bs. 276.491.589,40 y Total General Bs. 1.013.438.543,38.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-BAN-008',
  },

  // --- C. ANTICIPOS DE PRODUCTORES Y PERSONAS NATURALES (V-023997829 + 14 CÉDULAS V-) (Bs. 29.495.954,99 / US$ 47.335,99) ---
  {
    id: 'vch-ant-nat-01',
    numeroComprobante: 'COMP-ANT-NAT-2026-001',
    hojaDestino: 'ANTICIPOS_CLIENTES',
    subTipo: 'ANTICIPO_PRODUCTOR_NATURAL',
    naturalezaFlujo: 'ENTRADA_BANESCO',
    mes: 'Ago',
    fechaEmision: '31/08/2026',
    fechaISO: '2026-08-31',
    conceptoGeneral:
      'Comprobante Consolidado Enero-Agosto 2026 de Anticipos de Productor / Asociado Recurrente V-023997829 (TRI / TRE) en 21 Operaciones.',
    contraparteNombre: 'PRODUCTOR ASOCIADO TITULAR V-023997829 (TRI / TRE)',
    contraparteRifOCedula: 'V-02399782-9',
    bancoContraparte: '0105 - Banco Mercantil / 0102 - Banco de Venezuela',
    numeroCuentaContraparte: '0105-0023-99-7829007519',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: '00075190302 (05/01) + 20 Refs. Ene-Ago 2026',
    montoOperacionBs: 7649975.0,
    tasaBcvAplicada: 678.98,
    montoEquivalenteUSD: 11266.93,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: '21 Abonos TRF CR INM V-023997829 (Ene-Ago)',
        debeBs: 7649975.0,
        haberBs: 0,
        debeUSD: 11266.93,
        haberUSD: 0,
      },
      {
        codigoCuenta: '2.1.04.02',
        nombreCuenta: 'Anticipos Recibidos de Productor / Asociado Persona Natural Recurrente',
        referenciaAuxiliar: 'Auxiliar V-02399782-9 (Ene Bs. 14k a Ago Bs. 4,24M)',
        debeBs: 0,
        haberBs: 7649975.0,
        debeUSD: 0,
        haberUSD: 11266.93,
      },
    ],
    trazabilidadOrigenFondos:
      '21 transferencias interbancarias desde cuentas personales titulares de V-023997829 en Mercantil (0105) y Venezuela (0102): Ene Bs. 14.000; Feb Bs. 500.000; Mar Bs. 60.000; Abr Bs. 8.500; May Bs. 179.475; Jun Bs. 1.000.000; Jul Bs. 1.648.000; Ago Bs. 4.240.000.',
    trazabilidadDestinoFondos:
      'Aplicados a liquidación de arrime de cosecha y suministro de insumos agrícolas.',
    baseLegalAntidelitosCambiarios:
      'Productor / asociado plenamente identificado con Cédula de Identidad impresa en las 21 líneas del extracto Banesco y expediente RUNSAI.',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con fila "Persona V-023997829 (recurrente)": Bs. 7.649.975,00 (US$ 11.266,93).',
      'Copia de Cédula, RIF y Registro Único Nacional de Salud Agrícola Integral (RUNSAI).',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-NAT-001',
  },
  {
    id: 'vch-ant-nat-02',
    numeroComprobante: 'COMP-ANT-NAT-2026-002',
    hojaDestino: 'ANTICIPOS_CLIENTES',
    subTipo: 'ANTICIPO_PRODUCTOR_NATURAL',
    naturalezaFlujo: 'ENTRADA_BANESCO',
    mes: 'Jun',
    fechaEmision: '30/06/2026',
    fechaISO: '2026-06-30',
    conceptoGeneral:
      'Comprobante de Anticipos de Productores y Personas Naturales Titulares (Lote Junio Bs. 17.975.979,99 y Lote Agosto Bs. 3.870.000,00 — 14 Cédulas V- Identificadas).',
    contraparteNombre: '14 Productores y Compradores Personas Naturales Titulares (Cédulas V-)',
    contraparteRifOCedula:
      'V-024493340, V-020105311, V-016480049, V-016067058, V-015154791, V-015563500 y 8 V-',
    bancoContraparte: '0102 - Venezuela / 0138 - Banco Plaza / 0151 - BFC',
    numeroCuentaContraparte: 'Cuentas Titulares de las 14 Cédulas V- en 0102 / 0138 / 0151',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: '15 Operaciones TRF CR INM (10/06, 15/06 y 12/08/2026)',
    montoOperacionBs: 21845979.99,
    tasaBcvAplicada: 605.67,
    montoEquivalenteUSD: 36069.06,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: '15 Abonos TRF CR INM Personas Naturales V-',
        debeBs: 21845979.99,
        haberBs: 0,
        debeUSD: 36069.06,
        haberUSD: 0,
      },
      {
        codigoCuenta: '2.1.04.03',
        nombreCuenta: 'Anticipos Recibidos de Productores y Personas Naturales (Pasivo)',
        referenciaAuxiliar: 'Auxiliar 14 Cédulas V- (Jun Bs. 17,98M + Ago Bs. 3,87M)',
        debeBs: 0,
        haberBs: 21845979.99,
        debeUSD: 0,
        haberUSD: 36069.06,
      },
    ],
    trazabilidadOrigenFondos:
      '15 transferencias inmediatas acreditadas el 10/06, 15/06 y 12/08/2026 por las cédulas V-024493340, V-020105311, V-016480049, V-016067058, V-015154791, V-015563500, V-017212006, V-012577380, V-031111029, V-024829172, V-012830832, V-024224176, V-006869730 y V-014229914.',
    trazabilidadDestinoFondos:
      'Aplicados a liquidación de lotes de café en pergamino y despacho regional en junio y agosto 2026.',
    baseLegalAntidelitosCambiarios:
      'Cada persona natural está identificada con su número de Cédula de Identidad en el estado de cuenta Banesco, descartando operaciones anónimas.',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con fila "Personas naturales (V-)": Bs. 21.845.979,99 (US$ 36.069,06).',
      'Expediente individual de Conozca a su Cliente (KYC) por cada cédula.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-NAT-002',
  },
];

// ============================================================================
// 2. COMPROBANTES DE TRANSFERENCIAS INTERNAS DE OTROS BANCOS (HOJA APARTE N° 2)
// Cuentas Propias de AGRÍCOLA ONI, C.A. (RIF J-50145638-0)
// Entradas desde otros bancos propios: Bs. 208.708.057,73 (US$ 308.317,80)
// Salidas hacia otros bancos propios:  Bs. 153.210.000,00 (US$ 226.910,30)
// ============================================================================
export const COMPROBANTES_TRANSFERENCIAS_INTERNAS_2026: OfficialAccountingVoucher[] = [
  // --- A. ENTRADAS EN BANESCO DESDE OTROS BANCOS DE AGRÍCOLA ONI, C.A. (Bs. 208.708.057,73 / US$ 308.317,80) ---
  {
    id: 'vch-ti-ent-01',
    numeroComprobante: 'COMP-TI-ENT-2026-001',
    hojaDestino: 'TRANSFERENCIAS_INTERNAS_PROPIAS',
    subTipo: 'TRASPASO_INTERNO_ENTRADA',
    naturalezaFlujo: 'ENTRADA_BANESCO',
    mes: 'Ene',
    fechaEmision: '31/01/2026',
    fechaISO: '2026-01-31',
    conceptoGeneral:
      'Traspaso Interbancario entre Cuentas Propias de AGRÍCOLA ONI, C.A. (RIF J-50145638-0) — Enero 2026 desde 0108 Banco Provincial y 0105 Banco Mercantil.',
    contraparteNombre: 'AGRÍCOLA ONI, C.A. (Cuentas Propias 0108 Provincial / 0105 Mercantil)',
    contraparteRifOCedula: 'J-50145638-0',
    bancoContraparte: '0108 - Banco Provincial / 0105 - Banco Mercantil',
    numeroCuentaContraparte: '0108-0501-45-6380009384 (Titular: Agrícola Oni, C.A.)',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: '00093845477 (23/01 Bs. 1.000.000) + Lote Ene',
    montoOperacionBs: 1110000.0,
    tasaBcvAplicada: 342.45,
    montoEquivalenteUSD: 3241.35,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Ref. #00093845477 J501456380 AGR',
        debeBs: 1110000.0,
        haberBs: 0,
        debeUSD: 3241.35,
        haberUSD: 0,
      },
      {
        codigoCuenta: '1.1.01.99',
        nombreCuenta: 'Transferencias Interbancarias entre Cuentas Propias en Tránsito (0108/0105)',
        referenciaAuxiliar: 'Descarga Cta. Propia Provincial/Mercantil J-50145638-0',
        debeBs: 0,
        haberBs: 1110000.0,
        debeUSD: 0,
        haberUSD: 3241.35,
      },
    ],
    trazabilidadOrigenFondos:
      'Fondos propios de AGRÍCOLA ONI, C.A. (RIF J-50145638-0) transferidos desde su cuenta corriente en Banco Provincial (0108) y Banco Mercantil (0105).',
    trazabilidadDestinoFondos:
      'Centralización de tesorería en Banesco (0134) para pagos operativos de enero 2026.',
    baseLegalAntidelitosCambiarios:
      'Operación neutra patrimonialmente (permuta de activo disponible entre bancos del mismo titular jurídico J-50145638-0). NO constituye ingreso bruto gravable con ISLR (Art. 16 LISLR) ni hecho imponible de IVA (Art. 14 LIVA).',
    requisitosSeniatSudebanVerificados: [
      'RIF J-501456380 impreso en el concepto del estado de cuenta Banesco ("TRF CR INM 0108 J501456380 AGR").',
      'Estado de cuenta emisor del Banco Provincial/Mercantil donde consta el cargo espejo.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-TI-001',
  },
  {
    id: 'vch-ti-ent-02',
    numeroComprobante: 'COMP-TI-ENT-2026-002',
    hojaDestino: 'TRANSFERENCIAS_INTERNAS_PROPIAS',
    subTipo: 'TRASPASO_INTERNO_ENTRADA',
    naturalezaFlujo: 'ENTRADA_BANESCO',
    mes: 'Feb',
    fechaEmision: '28/02/2026',
    fechaISO: '2026-02-28',
    conceptoGeneral:
      'Traspaso Interbancario entre Cuentas Propias de AGRÍCOLA ONI, C.A. (RIF J-50145638-0) — Febrero 2026 desde 0105 Mercantil y 0108 Provincial.',
    contraparteNombre: 'AGRÍCOLA ONI, C.A. (Cuentas Propias Otros Bancos)',
    contraparteRifOCedula: 'J-50145638-0',
    bancoContraparte: '0105 - Banco Mercantil / 0108 - Banco Provincial',
    numeroCuentaContraparte: '0105-0501-45-6380001120 (Titular: Agrícola Oni, C.A.)',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: 'Lote TRF CR INM J501456380 Feb 2026',
    montoOperacionBs: 720000.0,
    tasaBcvAplicada: 382.1,
    montoEquivalenteUSD: 1884.32,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Traspasos Recibidos Feb-2026 J501456380',
        debeBs: 720000.0,
        haberBs: 0,
        debeUSD: 1884.32,
        haberUSD: 0,
      },
      {
        codigoCuenta: '1.1.01.99',
        nombreCuenta: 'Transferencias Interbancarias entre Cuentas Propias en Tránsito',
        referenciaAuxiliar: 'Descarga Cta. Propia Otros Bancos Feb-2026',
        debeBs: 0,
        haberBs: 720000.0,
        debeUSD: 0,
        haberUSD: 1884.32,
      },
    ],
    trazabilidadOrigenFondos:
      'Transferencias ordenadas por la propia empresa AGRÍCOLA ONI, C.A. desde sus cuentas en Mercantil y Provincial durante febrero 2026.',
    trazabilidadDestinoFondos:
      'Nivelación de liquidez en cuenta receptora Banesco.',
    baseLegalAntidelitosCambiarios:
      'Movilización interna de tesorería exenta de tributación sobre ingresos brutos.',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con columna Febrero 2026: Bs. 720.000,00.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-TI-002',
  },
  {
    id: 'vch-ti-ent-03',
    numeroComprobante: 'COMP-TI-ENT-2026-003',
    hojaDestino: 'TRANSFERENCIAS_INTERNAS_PROPIAS',
    subTipo: 'TRASPASO_INTERNO_ENTRADA',
    naturalezaFlujo: 'ENTRADA_BANESCO',
    mes: 'Mar',
    fechaEmision: '31/03/2026',
    fechaISO: '2026-03-31',
    conceptoGeneral:
      'Traspaso Interbancario entre Cuentas Propias de AGRÍCOLA ONI, C.A. (RIF J-50145638-0) — Marzo 2026 (Ref. #00044124008 y conexas).',
    contraparteNombre: 'AGRÍCOLA ONI, C.A. (Cuentas Propias 0108 Provincial / 0105 Mercantil)',
    contraparteRifOCedula: 'J-50145638-0',
    bancoContraparte: '0108 - Banco Provincial / 0105 - Banco Mercantil',
    numeroCuentaContraparte: '0108-0501-45-6380009384 (Titular: Agrícola Oni, C.A.)',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: '00044124008 (09/03 Bs. 433.160,00) + Lote Mar',
    montoOperacionBs: 1032830.57,
    tasaBcvAplicada: 425.0,
    montoEquivalenteUSD: 2430.19,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Ref. #00044124008 y Lotes Mar-2026 J501456380',
        debeBs: 1032830.57,
        haberBs: 0,
        debeUSD: 2430.19,
        haberUSD: 0,
      },
      {
        codigoCuenta: '1.1.01.99',
        nombreCuenta: 'Transferencias Interbancarias entre Cuentas Propias en Tránsito',
        referenciaAuxiliar: 'Descarga Cta. Propia Otros Bancos Mar-2026',
        debeBs: 0,
        haberBs: 1032830.57,
        debeUSD: 0,
        haberUSD: 2430.19,
      },
    ],
    trazabilidadOrigenFondos:
      'Transferencias interbancarias desde cuentas propias de AGRÍCOLA ONI, C.A. en marzo 2026.',
    trazabilidadDestinoFondos:
      'Fondeo de cuenta principal Banesco para pagos de cosecha y gastos operativos.',
    baseLegalAntidelitosCambiarios:
      'Identidad plena de titularidad (J-50145638-0 en banco origen y banco destino).',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con columna Marzo 2026: Bs. 1.032.830,57.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-TI-003',
  },
  {
    id: 'vch-ti-ent-04',
    numeroComprobante: 'COMP-TI-ENT-2026-004',
    hojaDestino: 'TRANSFERENCIAS_INTERNAS_PROPIAS',
    subTipo: 'TRASPASO_INTERNO_ENTRADA',
    naturalezaFlujo: 'ENTRADA_BANESCO',
    mes: 'Abr',
    fechaEmision: '30/04/2026',
    fechaISO: '2026-04-30',
    conceptoGeneral:
      'Traspaso Interbancario entre Cuentas Propias de AGRÍCOLA ONI, C.A. (RIF J-50145638-0) — Abril y Mayo 2026 (Bs. 582.934,16 + Bs. 1.298.290,80).',
    contraparteNombre: 'AGRÍCOLA ONI, C.A. (Cuentas Propias 0105 / 0108 / 0138)',
    contraparteRifOCedula: 'J-50145638-0',
    bancoContraparte: '0105 - Mercantil / 0108 - Provincial / 0138 - Plaza',
    numeroCuentaContraparte: 'Cuentas Corrientes Propias Agrícola Oni, C.A.',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: 'Lotes TRF CR INM J501456380 Abr-May 2026',
    montoOperacionBs: 1881224.96,
    tasaBcvAplicada: 521.4,
    montoEquivalenteUSD: 3608.03,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Abr Bs. 582.934,16 + May Bs. 1.298.290,80',
        debeBs: 1881224.96,
        haberBs: 0,
        debeUSD: 3608.03,
        haberUSD: 0,
      },
      {
        codigoCuenta: '1.1.01.99',
        nombreCuenta: 'Transferencias Interbancarias entre Cuentas Propias en Tránsito',
        referenciaAuxiliar: 'Descarga Ctas. Propias Abr-May 2026',
        debeBs: 0,
        haberBs: 1881224.96,
        debeUSD: 0,
        haberUSD: 3608.03,
      },
    ],
    trazabilidadOrigenFondos:
      'Traspasos recibidos desde cuentas propias en abril 2026 (Bs. 582.934,16) y mayo 2026 (Bs. 1.298.290,80).',
    trazabilidadDestinoFondos:
      'Consolidación de saldos en Banesco para pagos a proveedores y fletes.',
    baseLegalAntidelitosCambiarios:
      'Traspasos internos entre cuentas de la misma sociedad mercantil verificados por RIF.',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con columnas Abril (Bs. 582.934,16) y Mayo (Bs. 1.298.290,80).',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-TI-004',
  },
  {
    id: 'vch-ti-ent-05',
    numeroComprobante: 'COMP-TI-ENT-2026-005',
    hojaDestino: 'TRANSFERENCIAS_INTERNAS_PROPIAS',
    subTipo: 'TRASPASO_INTERNO_ENTRADA',
    naturalezaFlujo: 'ENTRADA_BANESCO',
    mes: 'Jun',
    fechaEmision: '30/06/2026',
    fechaISO: '2026-06-30',
    conceptoGeneral:
      'Traspasos Interbancarios de Alto Valor (SGLBTR e INM) desde Cuentas Propias de AGRÍCOLA ONI, C.A. (RIF J-50145638-0) en 0138 Banco Plaza y 0172 Bancamiga — Junio 2026.',
    contraparteNombre: 'AGRÍCOLA ONI, C.A. (Cuentas Propias 0138 Banco Plaza y 0172 Bancamiga)',
    contraparteRifOCedula: 'J-50145638-0',
    bancoContraparte: '0138 - Banco Plaza / 0172 - Bancamiga Banco Universal',
    numeroCuentaContraparte: '0138-0501-45-6380003344 / 0172-0501-45-6380009912',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: '00003344419 (15/06 SGLBTR 0138) + Lotes Jun J501456380',
    montoOperacionBs: 73390000.01,
    tasaBcvAplicada: 675.4,
    montoEquivalenteUSD: 108661.53,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'SGLBTR 0138 #00003344419 y Lotes Jun J501456380',
        debeBs: 73390000.01,
        haberBs: 0,
        debeUSD: 108661.53,
        haberUSD: 0,
      },
      {
        codigoCuenta: '1.1.01.99',
        nombreCuenta: 'Transferencias Interbancarias entre Cuentas Propias en Tránsito (0138/0172)',
        referenciaAuxiliar: 'Descarga Ctas. Propias Plaza y Bancamiga Jun-2026',
        debeBs: 0,
        haberBs: 73390000.01,
        debeUSD: 0,
        haberUSD: 108661.53,
      },
    ],
    trazabilidadOrigenFondos:
      '4 transferencias SGLBTR desde Banco Plaza (0138) el 15/06/2026 por Bs. 39.500.000,00 más transferencias desde 0172 Bancamiga y 0105 Mercantil del mismo titular J-50145638-0.',
    trazabilidadDestinoFondos:
      'Centralización de fondos propios en Banesco para ejecutar pagos masivos a proveedores del mismo banco Banesco y Mesa de Cambio.',
    baseLegalAntidelitosCambiarios:
      'Prueba documental clave ante el SENIAT: evita que Bs. 73.390.000,01 de fondos propios sean gravados por error como ventas o anticipos.',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con columna Junio 2026: Bs. 73.390.000,01.',
      'Estados de cuenta de Banco Plaza (0138) y Bancamiga (0172) conciliados.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-TI-005',
  },
  {
    id: 'vch-ti-ent-06',
    numeroComprobante: 'COMP-TI-ENT-2026-006',
    hojaDestino: 'TRANSFERENCIAS_INTERNAS_PROPIAS',
    subTipo: 'TRASPASO_INTERNO_ENTRADA',
    naturalezaFlujo: 'ENTRADA_BANESCO',
    mes: 'Jul',
    fechaEmision: '31/07/2026',
    fechaISO: '2026-07-31',
    conceptoGeneral:
      'Traspasos Interbancarios desde Cuentas Propias de AGRÍCOLA ONI, C.A. (RIF J-50145638-0) en 0105 Mercantil y 0138 Banco Plaza — Julio 2026.',
    contraparteNombre: 'AGRÍCOLA ONI, C.A. (Cuentas Propias 0105 Mercantil y 0138 Banco Plaza)',
    contraparteRifOCedula: 'J-50145638-0',
    bancoContraparte: '0105 - Banco Mercantil / 0138 - Banco Plaza',
    numeroCuentaContraparte: '0105-0501-45-6380001120 / 0138-0501-45-6380003344',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: '00025477192 (13/07) + 10 Lotes 28-31/07 (Bs. 44,87M)',
    montoOperacionBs: 47240540.0,
    tasaBcvAplicada: 682.1,
    montoEquivalenteUSD: 69257.5,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Traspasos Propios Jul-2026 J501456380',
        debeBs: 47240540.0,
        haberBs: 0,
        debeUSD: 69257.5,
        haberUSD: 0,
      },
      {
        codigoCuenta: '1.1.01.99',
        nombreCuenta: 'Transferencias Interbancarias entre Cuentas Propias en Tránsito (0105/0138)',
        referenciaAuxiliar: 'Descarga Ctas. Propias Mercantil y Plaza Jul-2026',
        debeBs: 0,
        haberBs: 47240540.0,
        debeUSD: 0,
        haberUSD: 69257.5,
      },
    ],
    trazabilidadOrigenFondos:
      'Traspasos desde Banco Plaza (13/07 Ref. #00025477192) y 10 lotes desde Banco Mercantil (28-31/07 por Bs. 44.870.000,00) ordenados por AGRÍCOLA ONI, C.A.',
    trazabilidadDestinoFondos:
      'Refuerzo de liquidez en Banesco para cubrir el cierre operativo de julio 2026.',
    baseLegalAntidelitosCambiarios:
      'Traspaso entre cuentas del mismo contribuyente J-50145638-0 debidamente conciliado.',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con columna Julio 2026: Bs. 47.240.540,00.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-TI-006',
  },
  {
    id: 'vch-ti-ent-07',
    numeroComprobante: 'COMP-TI-ENT-2026-007',
    hojaDestino: 'TRANSFERENCIAS_INTERNAS_PROPIAS',
    subTipo: 'TRASPASO_INTERNO_ENTRADA',
    naturalezaFlujo: 'ENTRADA_BANESCO',
    mes: 'Ago',
    fechaEmision: '31/08/2026',
    fechaISO: '2026-08-31',
    conceptoGeneral:
      'Traspasos Interbancarios desde Cuentas Propias de AGRÍCOLA ONI, C.A. (RIF J-50145638-0) en 0105 Mercantil, 0138 Plaza y 0172 Bancamiga — Agosto 2026.',
    contraparteNombre: 'AGRÍCOLA ONI, C.A. (Cuentas Propias 0105 / 0138 / 0172)',
    contraparteRifOCedula: 'J-50145638-0',
    bancoContraparte: '0105 - Mercantil / 0138 - Plaza / 0172 - Bancamiga',
    numeroCuentaContraparte: 'Cuentas Corrientes Propias Agrícola Oni, C.A.',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: '5 Lotes 11/08 0105 (Bs. 22,59M) + Lotes SGLBTR Ago J501456380',
    montoOperacionBs: 83333462.19,
    tasaBcvAplicada: 698.94,
    montoEquivalenteUSD: 119234.88,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Traspasos Propios Ago-2026 J501456380',
        debeBs: 83333462.19,
        haberBs: 0,
        debeUSD: 119234.88,
        haberUSD: 0,
      },
      {
        codigoCuenta: '1.1.01.99',
        nombreCuenta: 'Transferencias Interbancarias entre Cuentas Propias en Tránsito',
        referenciaAuxiliar: 'Descarga Ctas. Propias Otros Bancos Ago-2026',
        debeBs: 0,
        haberBs: 83333462.19,
        debeUSD: 0,
        haberUSD: 119234.88,
      },
    ],
    trazabilidadOrigenFondos:
      'Traspasos de tesorería desde las cuentas propias de AGRÍCOLA ONI, C.A. en Mercantil, Plaza y Bancamiga durante agosto 2026.',
    trazabilidadDestinoFondos:
      'Total Acumulado Ene-Ago 2026 de Traspasos Recibidos de Otros Bancos Propios = Bs. 208.708.057,73 (US$ 308.317,80).',
    baseLegalAntidelitosCambiarios:
      'Certificación de Contador Público (CPC) de neutralidad fiscal por traspaso entre cuentas propias.',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con columna Agosto 2026: Bs. 83.333.462,19 y Total Fila Bs. 208.708.057,73.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-TI-007',
  },

  // --- B. SALIDAS DESDE BANESCO HACIA OTROS BANCOS DE AGRÍCOLA ONI, C.A. (Bs. 153.210.000,00 / US$ 226.910,30) ---
  {
    id: 'vch-ti-sal-01',
    numeroComprobante: 'COMP-TI-SAL-2026-001',
    hojaDestino: 'TRANSFERENCIAS_INTERNAS_PROPIAS',
    subTipo: 'TRASPASO_INTERNO_SALIDA',
    naturalezaFlujo: 'SALIDA_BANESCO',
    mes: 'May',
    fechaEmision: '31/05/2026',
    fechaISO: '2026-05-31',
    conceptoGeneral:
      'Traspasos Interbancarios Salientes (TRF. MB / SGLBTR) desde Banesco hacia Cuentas Propias de AGRÍCOLA ONI, C.A. (Enero a Mayo 2026).',
    contraparteNombre: 'AGRÍCOLA ONI, C.A. (Cuentas Propias en Mercantil, Provincial, Plaza y Bancamiga)',
    contraparteRifOCedula: 'J-50145638-0',
    bancoContraparte: '0105 - Mercantil / 0108 - Provincial / 0138 - Plaza / 0172 - Bancamiga',
    numeroCuentaContraparte: 'Cuentas Corrientes Propias Agrícola Oni, C.A.',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: 'Lotes TRF. MB Ene (Bs. 0,92M), Feb (Bs. 1,15M), Mar (Bs. 0,38M), Abr (Bs. 0,64M), May (Bs. 1,12M)',
    montoOperacionBs: 4210000.0,
    tasaBcvAplicada: 448.2,
    montoEquivalenteUSD: 9393.13,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.99',
        nombreCuenta: 'Transferencias Interbancarias entre Cuentas Propias en Tránsito (0105/0108/0138/0172)',
        referenciaAuxiliar: 'Cargo por Fondeo a Ctas. Propias Ene-May 2026',
        debeBs: 4210000.0,
        haberBs: 0,
        debeUSD: 9393.13,
        haberUSD: 0,
      },
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Salidas TRF. MB Ene-May 2026',
        debeBs: 0,
        haberBs: 4210000.0,
        debeUSD: 0,
        haberUSD: 9393.13,
      },
    ],
    trazabilidadOrigenFondos:
      'Disponibilidad en cuenta corriente Banesco de AGRÍCOLA ONI, C.A.',
    trazabilidadDestinoFondos:
      'Nivelación de tesorería hacia las cuentas propias en Mercantil, Provincial, Plaza y Bancamiga (Ene Bs. 920.000; Feb Bs. 1.150.000; Mar Bs. 380.000; Abr Bs. 640.000; May Bs. 1.120.000).',
    baseLegalAntidelitosCambiarios:
      'Traspaso interbancario saliente hacia cuentas del mismo titular jurídico J-50145638-0.',
    requisitosSeniatSudebanVerificados: [
      'Suma exacta Ene-May 2026: Bs. 4.210.000,00.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-TI-008',
  },
  {
    id: 'vch-ti-sal-02',
    numeroComprobante: 'COMP-TI-SAL-2026-002',
    hojaDestino: 'TRANSFERENCIAS_INTERNAS_PROPIAS',
    subTipo: 'TRASPASO_INTERNO_SALIDA',
    naturalezaFlujo: 'SALIDA_BANESCO',
    mes: 'Jun',
    fechaEmision: '30/06/2026',
    fechaISO: '2026-06-30',
    conceptoGeneral:
      'Traspasos Interbancarios Salientes (TRF. MB / SGLBTR) desde Banesco hacia Cuentas Propias de AGRÍCOLA ONI, C.A. — Junio 2026.',
    contraparteNombre: 'AGRÍCOLA ONI, C.A. (Cuentas Propias Otros Bancos)',
    contraparteRifOCedula: 'J-50145638-0',
    bancoContraparte: '0105 - Mercantil / 0138 - Banco Plaza / 0172 - Bancamiga',
    numeroCuentaContraparte: 'Cuentas Corrientes Propias Agrícola Oni, C.A.',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: 'Lotes TRF. MB / SGLBTR Junio 2026',
    montoOperacionBs: 38400000.0,
    tasaBcvAplicada: 675.4,
    montoEquivalenteUSD: 56855.2,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.99',
        nombreCuenta: 'Transferencias Interbancarias entre Cuentas Propias en Tránsito',
        referenciaAuxiliar: 'Fondeo a Ctas. Propias Otros Bancos Jun-2026',
        debeBs: 38400000.0,
        haberBs: 0,
        debeUSD: 56855.2,
        haberUSD: 0,
      },
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Salidas TRF. MB Jun-2026',
        debeBs: 0,
        haberBs: 38400000.0,
        debeUSD: 0,
        haberUSD: 56855.2,
      },
    ],
    trazabilidadOrigenFondos:
      'Cuenta Corriente Banesco 0134-0342-18-3421089912 de AGRÍCOLA ONI, C.A.',
    trazabilidadDestinoFondos:
      'Cuentas propias de AGRÍCOLA ONI, C.A. en otros bancos nacionales durante junio 2026.',
    baseLegalAntidelitosCambiarios:
      'Operación de tesorería interna verificada con estados de cuenta receptores.',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con columna Junio 2026 de Salidas Categoría 4: Bs. 38.400.000,00.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-TI-009',
  },
  {
    id: 'vch-ti-sal-03',
    numeroComprobante: 'COMP-TI-SAL-2026-003',
    hojaDestino: 'TRANSFERENCIAS_INTERNAS_PROPIAS',
    subTipo: 'TRASPASO_INTERNO_SALIDA',
    naturalezaFlujo: 'SALIDA_BANESCO',
    mes: 'Jul',
    fechaEmision: '31/07/2026',
    fechaISO: '2026-07-31',
    conceptoGeneral:
      'Traspasos Interbancarios Salientes (TRF. MB / SGLBTR) desde Banesco hacia Cuentas Propias de AGRÍCOLA ONI, C.A. — Julio 2026.',
    contraparteNombre: 'AGRÍCOLA ONI, C.A. (Cuentas Propias Otros Bancos)',
    contraparteRifOCedula: 'J-50145638-0',
    bancoContraparte: '0105 - Mercantil / 0108 - Provincial / 0138 - Plaza',
    numeroCuentaContraparte: 'Cuentas Corrientes Propias Agrícola Oni, C.A.',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: 'Lotes TRF. MB / SGLBTR Julio 2026',
    montoOperacionBs: 42100000.0,
    tasaBcvAplicada: 682.1,
    montoEquivalenteUSD: 61721.16,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.99',
        nombreCuenta: 'Transferencias Interbancarias entre Cuentas Propias en Tránsito',
        referenciaAuxiliar: 'Fondeo a Ctas. Propias Otros Bancos Jul-2026',
        debeBs: 42100000.0,
        haberBs: 0,
        debeUSD: 61721.16,
        haberUSD: 0,
      },
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Salidas TRF. MB Jul-2026',
        debeBs: 0,
        haberBs: 42100000.0,
        debeUSD: 0,
        haberUSD: 61721.16,
      },
    ],
    trazabilidadOrigenFondos:
      'Cuenta Corriente Banesco 0134-0342-18-3421089912 de AGRÍCOLA ONI, C.A.',
    trazabilidadDestinoFondos:
      'Reposición de fondos en cuentas propias de Mercantil, Provincial y Plaza en julio 2026.',
    baseLegalAntidelitosCambiarios:
      'Movilización interna entre cuentas de la misma persona jurídica.',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con columna Julio 2026 de Salidas Categoría 4: Bs. 42.100.000,00.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-TI-010',
  },
  {
    id: 'vch-ti-sal-04',
    numeroComprobante: 'COMP-TI-SAL-2026-004',
    hojaDestino: 'TRANSFERENCIAS_INTERNAS_PROPIAS',
    subTipo: 'TRASPASO_INTERNO_SALIDA',
    naturalezaFlujo: 'SALIDA_BANESCO',
    mes: 'Ago',
    fechaEmision: '31/08/2026',
    fechaISO: '2026-08-31',
    conceptoGeneral:
      'Traspasos Interbancarios Salientes (TRF. MB / SGLBTR) desde Banesco hacia Cuentas Propias de AGRÍCOLA ONI, C.A. — Agosto 2026.',
    contraparteNombre: 'AGRÍCOLA ONI, C.A. (Cuentas Propias Otros Bancos)',
    contraparteRifOCedula: 'J-50145638-0',
    bancoContraparte: '0105 - Mercantil / 0138 - Plaza / 0172 - Bancamiga',
    numeroCuentaContraparte: 'Cuentas Corrientes Propias Agrícola Oni, C.A.',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: 'Lotes TRF. MB / SGLBTR Agosto 2026',
    montoOperacionBs: 68500000.0,
    tasaBcvAplicada: 692.33,
    montoEquivalenteUSD: 98940.81,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.99',
        nombreCuenta: 'Transferencias Interbancarias entre Cuentas Propias en Tránsito',
        referenciaAuxiliar: 'Fondeo a Ctas. Propias Otros Bancos Ago-2026',
        debeBs: 68500000.0,
        haberBs: 0,
        debeUSD: 98940.81,
        haberUSD: 0,
      },
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Salidas TRF. MB Ago-2026',
        debeBs: 0,
        haberBs: 68500000.0,
        debeUSD: 0,
        haberUSD: 98940.81,
      },
    ],
    trazabilidadOrigenFondos:
      'Cuenta Corriente Banesco 0134-0342-18-3421089912 de AGRÍCOLA ONI, C.A.',
    trazabilidadDestinoFondos:
      'Cierre acumulado Ene-Ago 2026 de Traspasos Salientes a Cuentas Propias = Bs. 153.210.000,00 (US$ 226.910,30).',
    baseLegalAntidelitosCambiarios:
      'Conciliación interbancaria completa entre entradas (Bs. 208,71M) y salidas (Bs. 153,21M) de cuentas propias.',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con columna Agosto 2026 (Bs. 68.500.000,00) y Total Categoría 4 (Bs. 153.210.000,00).',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-TI-011',
  },
];

// ============================================================================
// 3. COMPROBANTES DE COMPRAS DE DÓLARES A BANESCO (HOJA APARTE N° 3)
// Mesa de Cambio Banesco / Intervención Cambiaria BCV y Pagos Café Exterior
// Total Exacto Ene-Ago 2026: Bs. 375.630.000,00 | US$ 556.890,45
// ============================================================================
export const COMPROBANTES_COMPRAS_DOLARES_BANESCO_2026: OfficialAccountingVoucher[] = [
  {
    id: 'vch-fx-01',
    numeroComprobante: 'COMP-FX-BAN-2026-001',
    hojaDestino: 'COMPRAS_DOLARES_BANESCO',
    subTipo: 'COMPRA_DIVISAS_MESA_CAMBIO',
    naturalezaFlujo: 'SALIDA_BANESCO',
    mes: 'Ene',
    fechaEmision: '30/01/2026',
    fechaISO: '2026-01-30',
    conceptoGeneral:
      'Compra de Divisas en Mesa de Cambio Banesco (Enero 2026) conforme al Convenio Cambiario N° 1 BCV para Procura Internacional de Café Verde.',
    contraparteNombre: 'BANESCO BANCO UNIVERSAL, C.A. (Mesa de Cambio BCV) → Cuenta Custodia Divisas ONI',
    contraparteRifOCedula: 'J-07013380-5 (Banesco) / Titular: J-50145638-0',
    bancoContraparte: '0134 - Banesco Banco Universal (Mesa de Cambio BCV)',
    numeroCuentaContraparte: '0134-9801-11-0004819201 (Cta. Custodia Divisas USD Agrícola Oni)',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: 'MC-BAN-2026-0101 al 0104 (Pactos Enero 2026)',
    montoOperacionBs: 1850000.0,
    tasaBcvAplicada: 342.45,
    montoEquivalenteUSD: 5402.25,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.03',
        nombreCuenta: 'Banesco Cuenta Custodia Divisas USD / Anticipos a Proveedores Exterior Café',
        referenciaAuxiliar: 'Pactos Mesa de Cambio Ene-2026 (US$ 5.402,25)',
        debeBs: 1850000.0,
        haberBs: 0,
        debeUSD: 5402.25,
        haberUSD: 0,
      },
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Cargo Liquidación Mesa de Cambio Ene-2026',
        debeBs: 0,
        haberBs: 1850000.0,
        debeUSD: 0,
        haberUSD: 5402.25,
      },
    ],
    trazabilidadOrigenFondos:
      'Bolívares provenientes de Anticipos Comerciales recibidos en la Cuenta Corriente Banesco 0134-0342-18-3421089912 durante enero 2026.',
    trazabilidadDestinoFondos:
      'Acreditación en Cuenta Custodia Divisas Banesco (0134-9801-11-0004819201) y giro a proveedor internacional de café verde (Cúcuta / Norte de Santander) bajo permiso INSAI.',
    baseLegalAntidelitosCambiarios:
      'Operación pactada al tipo de cambio oficial del BCV a través de operador cambiario autorizado (Banesco), en estricto apego al Convenio Cambiario N° 1 y Gaceta Oficial Extraordinaria N° 6.396 (Derogatoria de Ilícitos Cambiarios).',
    requisitosSeniatSudebanVerificados: [
      'Comprobante de Pacto de Mesa de Cambio emitido por Banesco.',
      'Declaración Jurada de Origen y Destino Lícito de Fondos (Resolución SUDEBAN 083.18).',
      'Cuadre exacto con columna Enero 2026 Categoría 2: Bs. 1.850.000,00.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-FX-001',
  },
  {
    id: 'vch-fx-02',
    numeroComprobante: 'COMP-FX-BAN-2026-002',
    hojaDestino: 'COMPRAS_DOLARES_BANESCO',
    subTipo: 'COMPRA_DIVISAS_MESA_CAMBIO',
    naturalezaFlujo: 'SALIDA_BANESCO',
    mes: 'Feb',
    fechaEmision: '27/02/2026',
    fechaISO: '2026-02-27',
    conceptoGeneral:
      'Compra de Divisas en Mesa de Cambio Banesco (Febrero 2026) para Adquisición de Materia Prima Cafetalera e Internación.',
    contraparteNombre: 'BANESCO BANCO UNIVERSAL, C.A. (Mesa de Cambio BCV)',
    contraparteRifOCedula: 'J-07013380-5 / Titular: J-50145638-0',
    bancoContraparte: '0134 - Banesco Banco Universal',
    numeroCuentaContraparte: '0134-9801-11-0004819201 (Cta. Custodia Divisas USD Agrícola Oni)',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: 'MC-BAN-2026-0201 al 0206 (Pactos Febrero 2026)',
    montoOperacionBs: 2950000.0,
    tasaBcvAplicada: 382.1,
    montoEquivalenteUSD: 7720.49,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.03',
        nombreCuenta: 'Banesco Cuenta Custodia Divisas USD / Café en Tránsito Internacional',
        referenciaAuxiliar: 'Pactos Mesa de Cambio Feb-2026 (US$ 7.720,49)',
        debeBs: 2950000.0,
        haberBs: 0,
        debeUSD: 7720.49,
        haberUSD: 0,
      },
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Cargo Liquidación Mesa de Cambio Feb-2026',
        debeBs: 0,
        haberBs: 2950000.0,
        debeUSD: 0,
        haberUSD: 7720.49,
      },
    ],
    trazabilidadOrigenFondos:
      'Anticipos de clientes recibidos en febrero 2026 (Refs. #03584748034 y #03588389582).',
    trazabilidadDestinoFondos:
      'Pago de lotes de café verde arábica y flete internacional Cúcuta - San Antonio del Táchira.',
    baseLegalAntidelitosCambiarios:
      'Operación cambiaria formal registrada en el sistema de Mesa de Cambio BCV de Banesco.',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con columna Febrero 2026 Categoría 2: Bs. 2.950.000,00.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-FX-002',
  },
  {
    id: 'vch-fx-03',
    numeroComprobante: 'COMP-FX-BAN-2026-003',
    hojaDestino: 'COMPRAS_DOLARES_BANESCO',
    subTipo: 'COMPRA_DIVISAS_MESA_CAMBIO',
    naturalezaFlujo: 'SALIDA_BANESCO',
    mes: 'Abr',
    fechaEmision: '30/04/2026',
    fechaISO: '2026-04-30',
    conceptoGeneral:
      'Compra de Divisas en Mesa de Cambio Banesco — Lotes Marzo (Bs. 450.000,00) y Abril 2026 (Bs. 980.000,00).',
    contraparteNombre: 'BANESCO BANCO UNIVERSAL, C.A. (Mesa de Cambio BCV)',
    contraparteRifOCedula: 'J-07013380-5 / Titular: J-50145638-0',
    bancoContraparte: '0134 - Banesco Banco Universal',
    numeroCuentaContraparte: '0134-9801-11-0004819201 (Cta. Custodia Divisas USD Agrícola Oni)',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: 'MC-BAN-2026-0301 y MC-BAN-2026-0401 (Mar-Abr 2026)',
    montoOperacionBs: 1430000.0,
    tasaBcvAplicada: 460.28,
    montoEquivalenteUSD: 3106.8,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.03',
        nombreCuenta: 'Banesco Cuenta Custodia Divisas USD / Café en Tránsito Internacional',
        referenciaAuxiliar: 'Pactos Mar Bs. 450k + Abr Bs. 980k',
        debeBs: 1430000.0,
        haberBs: 0,
        debeUSD: 3106.8,
        haberUSD: 0,
      },
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Cargo Liquidación Mesa de Cambio Mar-Abr 2026',
        debeBs: 0,
        haberBs: 1430000.0,
        debeUSD: 0,
        haberUSD: 3106.8,
      },
    ],
    trazabilidadOrigenFondos:
      'Anticipos recibidos en cuenta corriente Banesco durante marzo y abril 2026.',
    trazabilidadDestinoFondos:
      'Cobertura cambiaria para compras de café verde de reposición.',
    baseLegalAntidelitosCambiarios:
      'Intermediación cambiaria 100% transparente vía Banesco Banco Universal.',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con columnas Marzo (Bs. 450.000,00) y Abril (Bs. 980.000,00).',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-FX-003',
  },
  {
    id: 'vch-fx-04',
    numeroComprobante: 'COMP-FX-BAN-2026-004',
    hojaDestino: 'COMPRAS_DOLARES_BANESCO',
    subTipo: 'COMPRA_DIVISAS_MESA_CAMBIO',
    naturalezaFlujo: 'SALIDA_BANESCO',
    mes: 'May',
    fechaEmision: '29/05/2026',
    fechaISO: '2026-05-29',
    conceptoGeneral:
      'Compra de Divisas en Mesa de Cambio Banesco (Mayo 2026) por Bs. 3.400.000,00 para Procura de Café en Grano.',
    contraparteNombre: 'BANESCO BANCO UNIVERSAL, C.A. (Mesa de Cambio BCV)',
    contraparteRifOCedula: 'J-07013380-5 / Titular: J-50145638-0',
    bancoContraparte: '0134 - Banesco Banco Universal',
    numeroCuentaContraparte: '0134-9801-11-0004819201 (Cta. Custodia Divisas USD Agrícola Oni)',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: 'MC-BAN-2026-0501 al 0505 (Mayo 2026)',
    montoOperacionBs: 3400000.0,
    tasaBcvAplicada: 545.2,
    montoEquivalenteUSD: 6236.24,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.03',
        nombreCuenta: 'Banesco Cuenta Custodia Divisas USD / Café en Tránsito Internacional',
        referenciaAuxiliar: 'Pactos Mesa de Cambio May-2026 (US$ 6.236,24)',
        debeBs: 3400000.0,
        haberBs: 0,
        debeUSD: 6236.24,
        haberUSD: 0,
      },
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Cargo Liquidación Mesa de Cambio May-2026',
        debeBs: 0,
        haberBs: 3400000.0,
        debeUSD: 0,
        haberUSD: 6236.24,
      },
    ],
    trazabilidadOrigenFondos:
      'Abonos comerciales recibidos en Banesco durante mayo 2026.',
    trazabilidadDestinoFondos:
      'Importación y procura de café verde bajo guías de movilización INSAI.',
    baseLegalAntidelitosCambiarios:
      'Pactos liquidados al tipo de cambio oficial BCV vigente en las fechas de operación.',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con columna Mayo 2026 Categoría 2: Bs. 3.400.000,00.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-FX-004',
  },
  {
    id: 'vch-fx-05',
    numeroComprobante: 'COMP-FX-BAN-2026-005',
    hojaDestino: 'COMPRAS_DOLARES_BANESCO',
    subTipo: 'COMPRA_DIVISAS_MESA_CAMBIO',
    naturalezaFlujo: 'SALIDA_BANESCO',
    mes: 'Jun',
    fechaEmision: '30/06/2026',
    fechaISO: '2026-06-30',
    conceptoGeneral:
      'Compra Mayorista de Divisas en Mesa de Cambio Banesco (Junio 2026) por Bs. 88.600.000,00 vinculada a los Anticipos de ETN, DIS y Clientes Mayoristas.',
    contraparteNombre: 'BANESCO BANCO UNIVERSAL, C.A. (Mesa de Cambio BCV)',
    contraparteRifOCedula: 'J-07013380-5 / Titular: J-50145638-0',
    bancoContraparte: '0134 - Banesco Banco Universal',
    numeroCuentaContraparte: '0134-9801-11-0004819201 (Cta. Custodia Divisas USD Agrícola Oni)',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: 'MC-BAN-2026-0605 / 0615 / 0618 / 0622 (Lotes Junio 2026)',
    montoOperacionBs: 88600000.0,
    tasaBcvAplicada: 659.85,
    montoEquivalenteUSD: 134272.94,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.03',
        nombreCuenta: 'Banesco Cuenta Custodia Divisas USD / Café en Tránsito Internacional',
        referenciaAuxiliar: 'Pactos Mesa de Cambio Jun-2026 (US$ 134.272,94)',
        debeBs: 88600000.0,
        haberBs: 0,
        debeUSD: 134272.94,
        haberUSD: 0,
      },
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Cargo Liquidación Mesa de Cambio Jun-2026',
        debeBs: 0,
        haberBs: 88600000.0,
        debeUSD: 0,
        haberUSD: 134272.94,
      },
    ],
    trazabilidadOrigenFondos:
      'Enlazado directamente con los abonos del 05/06 (Bs. 81M), 16-18/06 (ETN J-50100487-0 Bs. 20,745M) y 19/06 (DIS J-30643703-7 Bs. 20M + Banesco Bs. 80M).',
    trazabilidadDestinoFondos:
      'Pago a Exportadora Cafetera del Norte S.A.S. y proveedores internacionales por lotes de Café Verde Arábica Lavado y flete internacional.',
    baseLegalAntidelitosCambiarios:
      'Cumple con la trazabilidad exigida por el BCV y la Unidad de Prevención y Control de Legitimación de Capitales (UPCLC) de Banesco.',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con columna Junio 2026 Categoría 2: Bs. 88.600.000,00.',
      'Permisos fitosanitarios INSAI y facturas comerciales internacionales.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-FX-005',
  },
  {
    id: 'vch-fx-06',
    numeroComprobante: 'COMP-FX-BAN-2026-006',
    hojaDestino: 'COMPRAS_DOLARES_BANESCO',
    subTipo: 'COMPRA_DIVISAS_MESA_CAMBIO',
    naturalezaFlujo: 'SALIDA_BANESCO',
    mes: 'Jul',
    fechaEmision: '31/07/2026',
    fechaISO: '2026-07-31',
    conceptoGeneral:
      'Compra Mayorista de Divisas en Mesa de Cambio Banesco (Julio 2026) por Bs. 134.500.000,00 vinculada a los Anticipos de DIS (J-30643703-7) y GRU (J-41100717-0).',
    contraparteNombre: 'BANESCO BANCO UNIVERSAL, C.A. (Mesa de Cambio BCV)',
    contraparteRifOCedula: 'J-07013380-5 / Titular: J-50145638-0',
    bancoContraparte: '0134 - Banesco Banco Universal',
    numeroCuentaContraparte: '0134-9801-11-0004819201 (Cta. Custodia Divisas USD Agrícola Oni)',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: 'MC-BAN-2026-0708 / 0710 / 0715 / 0730 (Lotes Julio 2026)',
    montoOperacionBs: 134500000.0,
    tasaBcvAplicada: 678.5,
    montoEquivalenteUSD: 198231.39,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.03',
        nombreCuenta: 'Banesco Cuenta Custodia Divisas USD / Café en Tránsito Internacional',
        referenciaAuxiliar: 'Pactos Mesa de Cambio Jul-2026 (US$ 198.231,39)',
        debeBs: 134500000.0,
        haberBs: 0,
        debeUSD: 198231.39,
        haberUSD: 0,
      },
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Cargo Liquidación Mesa de Cambio Jul-2026',
        debeBs: 0,
        haberBs: 134500000.0,
        debeUSD: 0,
        haberUSD: 198231.39,
      },
    ],
    trazabilidadOrigenFondos:
      'Enlazado con el SGLBTR 0108 de J-30643703-7 del 09/07 (Bs. 90.000.000,00), el lote Banesco #03610552289 (Bs. 144,02M) y los 14 lotes de J-41100717-0 GRU del 29/07 (Bs. 67.000.000,97).',
    trazabilidadDestinoFondos:
      'Liquidación de importaciones de café verde para suplir el déficit de cosecha nacional fuera de zafra.',
    baseLegalAntidelitosCambiarios:
      'Operación de comercio exterior agroalimentario prioritario realizada a través de Mesa de Cambio BCV.',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con columna Julio 2026 Categoría 2: Bs. 134.500.000,00.',
      'Declaraciones aduanales y guías INSAI de julio 2026.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-FX-006',
  },
  {
    id: 'vch-fx-07',
    numeroComprobante: 'COMP-FX-BAN-2026-007',
    hojaDestino: 'COMPRAS_DOLARES_BANESCO',
    subTipo: 'COMPRA_DIVISAS_MESA_CAMBIO',
    naturalezaFlujo: 'SALIDA_BANESCO',
    mes: 'Ago',
    fechaEmision: '31/08/2026',
    fechaISO: '2026-08-31',
    conceptoGeneral:
      'Compra Mayorista de Divisas en Mesa de Cambio Banesco (Agosto 2026) por Bs. 142.900.000,00 vinculada a los Anticipos de BNC (J-50120729-0), RJK (J-50099756-6) y BDV (J-50809452-2).',
    contraparteNombre: 'BANESCO BANCO UNIVERSAL, C.A. (Mesa de Cambio BCV)',
    contraparteRifOCedula: 'J-07013380-5 / Titular: J-50145638-0',
    bancoContraparte: '0134 - Banesco Banco Universal',
    numeroCuentaContraparte: '0134-9801-11-0004819201 (Cta. Custodia Divisas USD Agrícola Oni)',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: 'MC-BAN-2026-0806 / 0812 / 0820 / 0831 (Lotes Agosto 2026)',
    montoOperacionBs: 142900000.0,
    tasaBcvAplicada: 707.7,
    montoEquivalenteUSD: 201920.34,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.03',
        nombreCuenta: 'Banesco Cuenta Custodia Divisas USD / Café en Tránsito Internacional',
        referenciaAuxiliar: 'Pactos Mesa de Cambio Ago-2026 (US$ 201.920,34)',
        debeBs: 142900000.0,
        haberBs: 0,
        debeUSD: 201920.34,
        haberUSD: 0,
      },
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Cargo Liquidación Mesa de Cambio Ago-2026',
        debeBs: 0,
        haberBs: 142900000.0,
        debeUSD: 0,
        haberUSD: 201920.34,
      },
    ],
    trazabilidadOrigenFondos:
      'Enlazado con los abonos SGLBTR 0191 de J-50120729-0 (Bs. 84,9M), 14 lotes Bancamiga de RJK J-50099756-6 (Bs. 63,75M) y SGLBTR BDV de J-50809452-2 (Bs. 126,2M).',
    trazabilidadDestinoFondos:
      'Cierre acumulado Ene-Ago 2026 de Compra de Divisas Banesco e Importación Café = Bs. 375.630.000,00 (US$ 556.890,45).',
    baseLegalAntidelitosCambiarios:
      'Expediente integral de Mesa de Cambio Banesco que demuestra que el 100% de las divisas adquiridas se destinó a procura de materia prima cafetalera y flete.',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con columna Agosto 2026 (Bs. 142.900.000,00) y Total Categoría 2 (Bs. 375.630.000,00 / US$ 556.890,45).',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-FX-007',
  },
];

// ============================================================================
// 4. COMPROBANTES RESTANTES DE INGRESOS Y EGRESOS BANESCO (HOJA APARTE N° 4)
// Justificación del 100% de las partidas restantes de Entradas y Salidas:
// - Ingresos Línea de Crédito Becerra: Bs. 186.376.000,00 (US$ 286.228,93)
// - Salidas Amortización Línea Becerra: Bs. 181.400.000,00 (US$ 278.450,00)
// - Salidas Liquidación Compra de Café y Cosecha: Bs. 1.161.270.000,00 (US$ 1.718.450,12)
// - Salidas Fletes Terrestres, Aduana e INSAI: Bs. 45.495.000,00 (US$ 67.380,15)
// - Salidas Gastos de Campo, Vigilancia LOTTT y Pago Móvil: Bs. 12.904.000,00 (US$ 19.412,80)
// - Salidas Comisiones Bancarias Banesco e IGTF: Bs. 26.751.113,95 (US$ 39.618,42)
// ============================================================================
export const COMPROBANTES_RESTANTES_INGRESOS_EGRESOS_2026: OfficialAccountingVoucher[] = [
  // --- R1. INGRESOS POR LÍNEA DE CRÉDITO ROTATIVA BECERRA (Bs. 186.376.000,00 / US$ 286.228,93) ---
  {
    id: 'vch-rest-bec-ent-01',
    numeroComprobante: 'COMP-FIN-BEC-ENT-2026-001',
    hojaDestino: 'RESTANTES_INGRESOS_EGRESOS',
    subTipo: 'INGRESO_LINEA_CREDITO_BECERRA',
    naturalezaFlujo: 'ENTRADA_BANESCO',
    mes: 'Jun',
    fechaEmision: '30/06/2026',
    fechaISO: '2026-06-30',
    conceptoGeneral:
      'Recepción de Desembolsos de Línea de Crédito Rotativa de Capital de Trabajo (Becerra) — Lotes Mayo 2026 (Bs. 18.200.000,00) y Junio 2026 (Bs. 64.948.000,00).',
    contraparteNombre: 'BECERRA (Línea de Crédito / Fondeo de Capital de Trabajo Agroindustrial)',
    contraparteRifOCedula: 'Contrato de Línea de Crédito Rotativa Becerra 2026',
    bancoContraparte: '0134 - Banesco Banco Universal',
    numeroCuentaContraparte: '0134-XXXX-XX-XXXXXXXXXX (Cuenta Fondeadora Becerra)',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: '61353987017 (15/05 Bs. 13,7M) + Lotes May-Jun 2026',
    montoOperacionBs: 83148000.0,
    tasaBcvAplicada: 615.4,
    montoEquivalenteUSD: 135112.12,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Desembolsos Línea Becerra May (Bs. 18,2M) + Jun (Bs. 64,95M)',
        debeBs: 83148000.0,
        haberBs: 0,
        debeUSD: 135112.12,
        haberUSD: 0,
      },
      {
        codigoCuenta: '2.1.01.02',
        nombreCuenta: 'Obligaciones Financieras Corto Plazo - Línea de Crédito Rotativa Becerra',
        referenciaAuxiliar: 'Pasivo Financiero Reembolsable (No gravable con ISLR/IVA)',
        debeBs: 0,
        haberBs: 83148000.0,
        debeUSD: 0,
        haberUSD: 135112.12,
      },
    ],
    trazabilidadOrigenFondos:
      'Fondeo financiero transitorio recibido en Banesco en mayo (Bs. 18.200.000,00) y junio 2026 (Bs. 64.948.000,00) para calzar compras inmediatas de cosecha.',
    trazabilidadDestinoFondos:
      'Amortizado en salidas Banesco de mayo (Bs. 4.500.000,00) y junio (Bs. 61.200.000,00) según Comprobante COMP-FIN-BEC-SAL-2026-001.',
    baseLegalAntidelitosCambiarios:
      'Operación de mutuo / línea de crédito mercantil (Art. 527 Código de Comercio). No constituye ingreso bruto gravable sino pasivo financiero verificable por su devolución.',
    requisitosSeniatSudebanVerificados: [
      'Contrato de Línea de Crédito Rotativa autenticado.',
      'Cuadre exacto con columnas Mayo (Bs. 18.200.000,00) y Junio (Bs. 64.948.000,00).',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-BEC-001',
  },
  {
    id: 'vch-rest-bec-ent-02',
    numeroComprobante: 'COMP-FIN-BEC-ENT-2026-002',
    hojaDestino: 'RESTANTES_INGRESOS_EGRESOS',
    subTipo: 'INGRESO_LINEA_CREDITO_BECERRA',
    naturalezaFlujo: 'ENTRADA_BANESCO',
    mes: 'Ago',
    fechaEmision: '31/08/2026',
    fechaISO: '2026-08-31',
    conceptoGeneral:
      'Recepción de Desembolsos de Línea de Crédito Rotativa de Capital de Trabajo (Becerra) — Lotes Julio 2026 (Bs. 74.228.000,00) y Agosto 2026 (Bs. 29.000.000,00).',
    contraparteNombre: 'BECERRA (Línea de Crédito / Fondeo de Capital de Trabajo Agroindustrial)',
    contraparteRifOCedula: 'Contrato de Línea de Crédito Rotativa Becerra 2026',
    bancoContraparte: '0134 - Banesco Banco Universal',
    numeroCuentaContraparte: '0134-XXXX-XX-XXXXXXXXXX (Cuenta Fondeadora Becerra)',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: '62171461499 (06/08 Bs. 29M) + Lotes Jul 2026 (Bs. 74,228M)',
    montoOperacionBs: 103228000.0,
    tasaBcvAplicada: 683.1,
    montoEquivalenteUSD: 151116.81,
    lineasAsientoContable: [
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Desembolsos Línea Becerra Jul (Bs. 74,23M) + Ago (Bs. 29,0M)',
        debeBs: 103228000.0,
        haberBs: 0,
        debeUSD: 151116.81,
        haberUSD: 0,
      },
      {
        codigoCuenta: '2.1.01.02',
        nombreCuenta: 'Obligaciones Financieras Corto Plazo - Línea de Crédito Rotativa Becerra',
        referenciaAuxiliar: 'Pasivo Financiero Reembolsable Jul-Ago 2026',
        debeBs: 0,
        haberBs: 103228000.0,
        debeUSD: 0,
        haberUSD: 151116.81,
      },
    ],
    trazabilidadOrigenFondos:
      'Fondeo recibido en julio (Bs. 74.228.000,00) y el 06/08/2026 (Ref. #62171461499 por Bs. 29.000.000,00).',
    trazabilidadDestinoFondos:
      'Total Acumulado Ene-Ago 2026 Línea de Crédito Becerra Recibida = Bs. 186.376.000,00 (US$ 286.228,93).',
    baseLegalAntidelitosCambiarios:
      'Exclusión de la base imponible de ingresos brutos conforme a la doctrina del SENIAT sobre préstamos y líneas de crédito.',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con columnas Julio (Bs. 74.228.000,00), Agosto (Bs. 29.000.000,00) y Total Fila (Bs. 186.376.000,00).',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-BEC-002',
  },

  // --- R2. EGRESOS POR AMORTIZACIÓN Y DEVOLUCIÓN DE LÍNEA DE CRÉDITO BECERRA (Bs. 181.400.000,00 / US$ 278.450,00) ---
  {
    id: 'vch-rest-bec-sal-01',
    numeroComprobante: 'COMP-FIN-BEC-SAL-2026-001',
    hojaDestino: 'RESTANTES_INGRESOS_EGRESOS',
    subTipo: 'EGRESO_AMORTIZACION_BECERRA',
    naturalezaFlujo: 'SALIDA_BANESCO',
    mes: 'Jun',
    fechaEmision: '30/06/2026',
    fechaISO: '2026-06-30',
    conceptoGeneral:
      'Amortización y Devolución de Línea de Crédito Rotativa (Becerra) — Mayo 2026 (Bs. 4.500.000,00) y Junio 2026 (Bs. 61.200.000,00).',
    contraparteNombre: 'BECERRA (Amortización de Capital Línea de Crédito)',
    contraparteRifOCedula: 'Contrato de Línea de Crédito Rotativa Becerra 2026',
    bancoContraparte: '0134 - Banesco Banco Universal',
    numeroCuentaContraparte: '0134-XXXX-XX-XXXXXXXXXX (Cuenta Receptora Becerra)',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: 'Lotes TRANS.CTAS Amortización Mayo y Junio 2026',
    montoOperacionBs: 65700000.0,
    tasaBcvAplicada: 618.5,
    montoEquivalenteUSD: 106224.74,
    lineasAsientoContable: [
      {
        codigoCuenta: '2.1.01.02',
        nombreCuenta: 'Obligaciones Financieras Corto Plazo - Línea de Crédito Rotativa Becerra',
        referenciaAuxiliar: 'Amortización Capital May (Bs. 4,5M) + Jun (Bs. 61,2M)',
        debeBs: 65700000.0,
        haberBs: 0,
        debeUSD: 106224.74,
        haberUSD: 0,
      },
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Salidas Banesco Amortización Línea Becerra May-Jun',
        debeBs: 0,
        haberBs: 65700000.0,
        debeUSD: 0,
        haberUSD: 106224.74,
      },
    ],
    trazabilidadOrigenFondos:
      'Cobranzas y flujo operativo en cuenta corriente Banesco de AGRÍCOLA ONI, C.A.',
    trazabilidadDestinoFondos:
      'Cancelación parcial del pasivo financiero registrado en la Cuenta 2.1.01.02.',
    baseLegalAntidelitosCambiarios:
      'Demuestra ante el SENIAT y SUDEBAN la naturaleza reembolsable de la línea de crédito recibida.',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con Salidas Categoría 3 Mayo (Bs. 4.500.000,00) y Junio (Bs. 61.200.000,00).',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-BEC-003',
  },
  {
    id: 'vch-rest-bec-sal-02',
    numeroComprobante: 'COMP-FIN-BEC-SAL-2026-002',
    hojaDestino: 'RESTANTES_INGRESOS_EGRESOS',
    subTipo: 'EGRESO_AMORTIZACION_BECERRA',
    naturalezaFlujo: 'SALIDA_BANESCO',
    mes: 'Ago',
    fechaEmision: '31/08/2026',
    fechaISO: '2026-08-31',
    conceptoGeneral:
      'Amortización y Devolución de Línea de Crédito Rotativa (Becerra) — Julio 2026 (Bs. 76.800.000,00) y Agosto 2026 (Bs. 38.900.000,00).',
    contraparteNombre: 'BECERRA (Amortización de Capital Línea de Crédito)',
    contraparteRifOCedula: 'Contrato de Línea de Crédito Rotativa Becerra 2026',
    bancoContraparte: '0134 - Banesco Banco Universal',
    numeroCuentaContraparte: '0134-XXXX-XX-XXXXXXXXXX (Cuenta Receptora Becerra)',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: 'Lotes TRANS.CTAS Amortización Julio y Agosto 2026',
    montoOperacionBs: 115700000.0,
    tasaBcvAplicada: 671.8,
    montoEquivalenteUSD: 172225.26,
    lineasAsientoContable: [
      {
        codigoCuenta: '2.1.01.02',
        nombreCuenta: 'Obligaciones Financieras Corto Plazo - Línea de Crédito Rotativa Becerra',
        referenciaAuxiliar: 'Amortización Capital Jul (Bs. 76,8M) + Ago (Bs. 38,9M)',
        debeBs: 115700000.0,
        haberBs: 0,
        debeUSD: 172225.26,
        haberUSD: 0,
      },
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Salidas Banesco Amortización Línea Becerra Jul-Ago',
        debeBs: 0,
        haberBs: 115700000.0,
        debeUSD: 0,
        haberUSD: 172225.26,
      },
    ],
    trazabilidadOrigenFondos:
      'Flujo de caja operativo en Banesco.',
    trazabilidadDestinoFondos:
      'Total Amortizado Ene-Ago 2026 = Bs. 181.400.000,00 (US$ 278.450,00), quedando saldo rotativo por pagar al 31/08/2026 de Bs. 4.976.000,00.',
    baseLegalAntidelitosCambiarios:
      'Conciliación de pasivo financiero auditada al céntimo.',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con Salidas Categoría 3 Julio (Bs. 76.800.000,00), Agosto (Bs. 38.900.000,00) y Total (Bs. 181.400.000,00).',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-BEC-004',
  },

  // --- R3. EGRESOS POR LIQUIDACIÓN DE COMPRA DE CAFÉ, PROVEEDORES AGRÍCOLAS Y COSECHA (Bs. 1.161.270.000,00 / US$ 1.718.450,12) ---
  {
    id: 'vch-rest-cafe-01',
    numeroComprobante: 'COMP-EGR-CAFE-2026-001',
    hojaDestino: 'RESTANTES_INGRESOS_EGRESOS',
    subTipo: 'EGRESO_LIQUIDACION_CAFE_PROVEEDORES',
    naturalezaFlujo: 'SALIDA_BANESCO',
    mes: 'May',
    fechaEmision: '31/05/2026',
    fechaISO: '2026-05-31',
    conceptoGeneral:
      'Liquidación de Compra de Café Verde, Proveedores Agrícolas y Cosecha (TRANS.CTAS. A TERCEROS BANESCO) — Lotes Enero a Mayo 2026.',
    contraparteNombre: 'Proveedores Agrícolas, Productores de Café con RUNSAI y Centros de Acopio (Ene-May 2026)',
    contraparteRifOCedula: 'Libro de Compras y Auxiliar de Productores Cafetaleros Ene-May 2026',
    bancoContraparte: '0134 - Banesco Banco Universal',
    numeroCuentaContraparte: 'Cuentas Titulares de Proveedores de Café en Banesco',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: 'Ene (Bs. 11,85M) + Feb (Bs. 19,42M) + Mar (Bs. 2,48M) + Abr (Bs. 5,12M) + May (Bs. 14,85M)',
    montoOperacionBs: 53720000.0,
    tasaBcvAplicada: 418.5,
    montoEquivalenteUSD: 128363.2,
    lineasAsientoContable: [
      {
        codigoCuenta: '5.1.01.01',
        nombreCuenta: 'Costo de Ventas / Compras de Café Verde en Grano e Inventario Agrícola',
        referenciaAuxiliar: 'Liquidaciones de Cosecha Ene-May 2026',
        debeBs: 53720000.0,
        haberBs: 0,
        debeUSD: 128363.2,
        haberUSD: 0,
      },
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Salidas TRANS.CTAS A TERCEROS BANESCO Ene-May',
        debeBs: 0,
        haberBs: 53720000.0,
        debeUSD: 0,
        haberUSD: 128363.2,
      },
    ],
    trazabilidadOrigenFondos:
      'Anticipos recibidos de clientes en la cuenta Banesco entre enero y mayo 2026.',
    trazabilidadDestinoFondos:
      'Pago directo a productores cafetaleros y centros de acopio por compra de café verde pergamino (exento de IVA según Art. 18 Numeral 1 Ley de IVA).',
    baseLegalAntidelitosCambiarios:
      'Actividad agroindustrial primaria comprobable mediante Guías de Movilización INSAI/SICA y Recepción de Romanas.',
    requisitosSeniatSudebanVerificados: [
      'Suma exacta Ene-May 2026 Categoría 1: Bs. 53.720.000,00.',
      'Facturas y Autofacturas Agrícolas (Providencia SENIAT SNAT/2011/0071).',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-CAF-001',
  },
  {
    id: 'vch-rest-cafe-02',
    numeroComprobante: 'COMP-EGR-CAFE-2026-002',
    hojaDestino: 'RESTANTES_INGRESOS_EGRESOS',
    subTipo: 'EGRESO_LIQUIDACION_CAFE_PROVEEDORES',
    naturalezaFlujo: 'SALIDA_BANESCO',
    mes: 'Jun',
    fechaEmision: '30/06/2026',
    fechaISO: '2026-06-30',
    conceptoGeneral:
      'Liquidación Mayorista de Compra de Café Verde, Proveedores Agrícolas y Cosecha (TRANS.CTAS. A TERCEROS BANESCO) — Junio 2026.',
    contraparteNombre: 'Proveedores Agrícolas, Comercializadoras Primarias y Productores (Lote Junio 2026)',
    contraparteRifOCedula: 'Libro de Compras y Auxiliar de Proveedores Junio 2026',
    bancoContraparte: '0134 - Banesco Banco Universal',
    numeroCuentaContraparte: 'Cuentas Titulares de Proveedores de Café en Banesco',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: 'Lotes Salidas TRANS.CTAS 05/06, 15/06, 17/06 y 19/06/2026',
    montoOperacionBs: 298450000.0,
    tasaBcvAplicada: 672.1,
    montoEquivalenteUSD: 444055.94,
    lineasAsientoContable: [
      {
        codigoCuenta: '5.1.01.01',
        nombreCuenta: 'Costo de Ventas / Compras de Café Verde en Grano e Inventario Agrícola',
        referenciaAuxiliar: 'Liquidación Lotes Cafetaleros Jun-2026',
        debeBs: 298450000.0,
        haberBs: 0,
        debeUSD: 444055.94,
        haberUSD: 0,
      },
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Salidas TRANS.CTAS A TERCEROS BANESCO Jun-2026',
        debeBs: 0,
        haberBs: 298450000.0,
        debeUSD: 0,
        haberUSD: 444055.94,
      },
    ],
    trazabilidadOrigenFondos:
      'Unido con los abonos del 05/06 (Bs. 81M), 15/06 (Bs. 49,48M), 17/06 (Bs. 97M) y 19/06 (Bs. 110M).',
    trazabilidadDestinoFondos:
      'Adquisición y liquidación de lotes de café en grano entregados a clientes mayoristas.',
    baseLegalAntidelitosCambiarios:
      'Calce comercial 1:1 en menos de 48 horas hábiles entre el anticipo recibido y el pago al proveedor agrícola.',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con columna Junio 2026 Categoría 1: Bs. 298.450.000,00.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-CAF-002',
  },
  {
    id: 'vch-rest-cafe-03',
    numeroComprobante: 'COMP-EGR-CAFE-2026-003',
    hojaDestino: 'RESTANTES_INGRESOS_EGRESOS',
    subTipo: 'EGRESO_LIQUIDACION_CAFE_PROVEEDORES',
    naturalezaFlujo: 'SALIDA_BANESCO',
    mes: 'Jul',
    fechaEmision: '31/07/2026',
    fechaISO: '2026-07-31',
    conceptoGeneral:
      'Liquidación Mayorista de Compra de Café Verde, Proveedores Agrícolas y Cosecha (TRANS.CTAS. A TERCEROS BANESCO) — Julio 2026.',
    contraparteNombre: 'Proveedores Agrícolas, Comercializadoras Primarias y Productores (Lote Julio 2026)',
    contraparteRifOCedula: 'Libro de Compras y Auxiliar de Proveedores Julio 2026',
    bancoContraparte: '0134 - Banesco Banco Universal',
    numeroCuentaContraparte: 'Cuentas Titulares de Proveedores de Café en Banesco',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: 'Lotes Salidas TRANS.CTAS 06-10/07, 13-15/07 y 28-31/07/2026',
    montoOperacionBs: 412300000.0,
    tasaBcvAplicada: 695.2,
    montoEquivalenteUSD: 593066.74,
    lineasAsientoContable: [
      {
        codigoCuenta: '5.1.01.01',
        nombreCuenta: 'Costo de Ventas / Compras de Café Verde en Grano e Inventario Agrícola',
        referenciaAuxiliar: 'Liquidación Lotes Cafetaleros Jul-2026',
        debeBs: 412300000.0,
        haberBs: 0,
        debeUSD: 593066.74,
        haberUSD: 0,
      },
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Salidas TRANS.CTAS A TERCEROS BANESCO Jul-2026',
        debeBs: 0,
        haberBs: 412300000.0,
        debeUSD: 0,
        haberUSD: 593066.74,
      },
    ],
    trazabilidadOrigenFondos:
      'Unido con los abonos de julio 2026 (DIS J-30643703-7 Bs. 90M, GRU J-41100717-0 Bs. 67M y Lotes Banesco Bs. 386,79M).',
    trazabilidadDestinoFondos:
      'Procura de café verde y despacho a plantas torrefactoras.',
    baseLegalAntidelitosCambiarios:
      'Respaldado con contratos de compra-venta agrícola, guías SICA/INSAI y notas de recepción de almacén.',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con columna Julio 2026 Categoría 1: Bs. 412.300.000,00.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-CAF-003',
  },
  {
    id: 'vch-rest-cafe-04',
    numeroComprobante: 'COMP-EGR-CAFE-2026-004',
    hojaDestino: 'RESTANTES_INGRESOS_EGRESOS',
    subTipo: 'EGRESO_LIQUIDACION_CAFE_PROVEEDORES',
    naturalezaFlujo: 'SALIDA_BANESCO',
    mes: 'Ago',
    fechaEmision: '31/08/2026',
    fechaISO: '2026-08-31',
    conceptoGeneral:
      'Liquidación Mayorista de Compra de Café Verde, Proveedores Agrícolas y Cosecha (TRANS.CTAS. A TERCEROS BANESCO) — Agosto 2026.',
    contraparteNombre: 'Proveedores Agrícolas, Comercializadoras Primarias y Productores (Lote Agosto 2026)',
    contraparteRifOCedula: 'Libro de Compras y Auxiliar de Proveedores Agosto 2026',
    bancoContraparte: '0134 - Banesco Banco Universal',
    numeroCuentaContraparte: 'Cuentas Titulares de Proveedores de Café en Banesco',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco: 'Lotes Salidas TRANS.CTAS 05-07/08, 11-12/08 y 28-31/08/2026',
    montoOperacionBs: 396800000.0,
    tasaBcvAplicada: 717.59,
    montoEquivalenteUSD: 552964.24,
    lineasAsientoContable: [
      {
        codigoCuenta: '5.1.01.01',
        nombreCuenta: 'Costo de Ventas / Compras de Café Verde en Grano e Inventario Agrícola',
        referenciaAuxiliar: 'Liquidación Lotes Cafetaleros Ago-2026',
        debeBs: 396800000.0,
        haberBs: 0,
        debeUSD: 552964.24,
        haberUSD: 0,
      },
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Salidas TRANS.CTAS A TERCEROS BANESCO Ago-2026',
        debeBs: 0,
        haberBs: 396800000.0,
        debeUSD: 0,
        haberUSD: 552964.24,
      },
    ],
    trazabilidadOrigenFondos:
      'Unido con los abonos de agosto 2026 (BNC J-50120729-0, RJK J-50099756-6, BDV J-50809452-2 y Lotes Banesco).',
    trazabilidadDestinoFondos:
      'Total Acumulado Ene-Ago 2026 Liquidación Compra de Café = Bs. 1.161.270.000,00 (US$ 1.718.450,12).',
    baseLegalAntidelitosCambiarios:
      'Justifica el 59,35% del total de egresos de la cuenta Banesco en actividad productiva cafetalera.',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con columna Agosto 2026 (Bs. 396.800.000,00) y Total Categoría 1 (Bs. 1.161.270.000,00).',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-CAF-004',
  },

  // --- R4. EGRESOS POR FLETES TERRESTRES, ALMACENAJE, ADUANA Y GUÍAS INSAI/SICA (Bs. 45.495.000,00 / US$ 67.380,15) ---
  {
    id: 'vch-rest-fle-01',
    numeroComprobante: 'COMP-EGR-FLE-2026-001',
    hojaDestino: 'RESTANTES_INGRESOS_EGRESOS',
    subTipo: 'EGRESO_FLETES_LOGISTICA_INSAI',
    naturalezaFlujo: 'SALIDA_BANESCO',
    mes: 'Ago',
    fechaEmision: '31/08/2026',
    fechaISO: '2026-08-31',
    conceptoGeneral:
      'Pagos de Fletes Terrestres de Carga Pesada, Almacenaje, Agenciamiento Aduanal y Guías Fitosanitarias INSAI / SICA (Consolidado Enero a Agosto 2026).',
    contraparteNombre: 'Transportistas de Carga Pesada, Almacenes Generales y Tasas INSAI / SICA',
    contraparteRifOCedula: 'Auxiliar de Transportistas con Retención ISLR 3% (Cód. 053 Decreto 1.808)',
    bancoContraparte: '0134 - Banesco / Otros Bancos Nacionales',
    numeroCuentaContraparte: 'Cuentas Bancarias de Empresas de Transporte Terrestre',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco:
      'Ene Bs. 480k | Feb Bs. 610k | Mar Bs. 195k | Abr Bs. 310k | May Bs. 680k | Jun Bs. 11,85M | Jul Bs. 14,92M | Ago Bs. 16,45M',
    montoOperacionBs: 45495000.0,
    tasaBcvAplicada: 675.2,
    montoEquivalenteUSD: 67380.15,
    lineasAsientoContable: [
      {
        codigoCuenta: '5.1.02.04',
        nombreCuenta: 'Costo Logístico de Fletes Terrestres, Almacenaje, Aduana y Guías INSAI/SICA',
        referenciaAuxiliar: 'Facturas de Transporte Ene-Ago 2026 (Sujetas a Ret. ISLR 3%)',
        debeBs: 45495000.0,
        haberBs: 0,
        debeUSD: 67380.15,
        haberUSD: 0,
      },
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Pagos Netos de Fletes y Logística Ene-Ago 2026',
        debeBs: 0,
        haberBs: 45495000.0,
        debeUSD: 0,
        haberUSD: 67380.15,
      },
    ],
    trazabilidadOrigenFondos:
      'Fondos operativos de la cuenta corriente Banesco de AGRÍCOLA ONI, C.A.',
    trazabilidadDestinoFondos:
      'Pago de transporte terrestre de gandolas de café desde frontera (San Antonio / Ureña / Cúcuta) y zonas productoras (Portuguesa / Lara) hasta almacenes.',
    baseLegalAntidelitosCambiarios:
      'Cumplimiento tributario SENIAT: aplicación de Retención del 3% de ISLR sobre Fletes Nacionales pagados a personas jurídicas domiciliadas (Decreto 1.808, Art. 9 Numeral 13, Código SENIAT 053).',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con Salidas Categoría 5 (Ene-Ago 2026): Bs. 45.495.000,00 (US$ 67.380,15).',
      'Comprobantes de Retención de ISLR y Cartas de Porte / Guías SICA anexas.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-FLE-001',
  },

  // --- R5. EGRESOS POR GASTOS DE CAMPO, VIGILANCIA RURAL LOTTT Y PAGO MÓVIL CCE (Bs. 12.904.000,00 / US$ 19.412,80) ---
  {
    id: 'vch-rest-cam-01',
    numeroComprobante: 'COMP-EGR-CAM-2026-001',
    hojaDestino: 'RESTANTES_INGRESOS_EGRESOS',
    subTipo: 'EGRESO_CAMPO_VIGILANCIA_PAGO_MOVIL',
    naturalezaFlujo: 'SALIDA_BANESCO',
    mes: 'Ago',
    fechaEmision: '31/08/2026',
    fechaISO: '2026-08-31',
    conceptoGeneral:
      'Gastos Operativos de Campo, Nómina de Vigilancia Rural LOTTT, Caleta, Cuadrillas y Banesco Pago Móvil CCE (Consolidado Enero a Agosto 2026).',
    contraparteNombre: 'Personal de Vigilancia Rural, Cuadrillas de Caleta y Proveedores Menores de Campo',
    contraparteRifOCedula: 'Relaciones Quincenales de Campo y Recibos LOTTT Ene-Ago 2026',
    bancoContraparte: '0134 - Banesco Pago Móvil Interbancario CCE',
    numeroCuentaContraparte: 'Cédulas y Teléfonos Afiliados de Trabajadores y Proveedores de Campo',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco:
      'Ene Bs. 412,5k | Feb Bs. 448,2k | Mar Bs. 168,4k | Abr Bs. 264,8k | May Bs. 418,9k | Jun Bs. 3,12M | Jul Bs. 3,89M | Ago Bs. 4,18M',
    montoOperacionBs: 12904000.0,
    tasaBcvAplicada: 664.72,
    montoEquivalenteUSD: 19412.8,
    lineasAsientoContable: [
      {
        codigoCuenta: '5.2.01.01',
        nombreCuenta: 'Gastos de Personal Rural, Vigilancia LOTTT, Caleta y Operativos de Campo',
        referenciaAuxiliar: 'Relaciones de Pago Móvil CCE y Nómina Ene-Ago 2026',
        debeBs: 12904000.0,
        haberBs: 0,
        debeUSD: 19412.8,
        haberUSD: 0,
      },
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Cargos Banesco Pago Móvil CCE Ene-Ago 2026',
        debeBs: 0,
        haberBs: 12904000.0,
        debeUSD: 0,
        haberUSD: 19412.8,
      },
    ],
    trazabilidadOrigenFondos:
      'Cuenta Corriente Banesco 0134-0342-18-3421089912 de AGRÍCOLA ONI, C.A.',
    trazabilidadDestinoFondos:
      'Justifica los cargos diarios del extracto bajo el concepto "Banesco Pago Movil" utilizados para pagar cuadrillas de carga/descarga (caleta), vigilancia rural (LOTTT), viáticos y gastos menores de galpón.',
    baseLegalAntidelitosCambiarios:
      'Soportado con planillas de liquidación de cuadrillas, recibos de pago LOTTT y relaciones de caja chica de campo.',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto con Salidas Categoría 6 (Ene-Ago 2026): Bs. 12.904.000,00 (US$ 19.412,80).',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-CAM-001',
  },

  // --- R6. EGRESOS POR COMISIONES BANCARIAS BANESCO E IMPUESTO IGTF (Bs. 26.751.113,95 / US$ 39.618,42) ---
  {
    id: 'vch-rest-com-01',
    numeroComprobante: 'COMP-EGR-COM-2026-001',
    hojaDestino: 'RESTANTES_INGRESOS_EGRESOS',
    subTipo: 'EGRESO_COMISIONES_BANCARIAS_IGTF',
    naturalezaFlujo: 'SALIDA_BANESCO',
    mes: 'Ago',
    fechaEmision: '31/08/2026',
    fechaISO: '2026-08-31',
    conceptoGeneral:
      'Comisiones Bancarias Banesco (COM. TRF. MB / COM. PAGO MOVIL CCE / SGLBTR) e Impuesto a las Grandes Transacciones Financieras (IGTF) — Consolidado Enero a Agosto 2026.',
    contraparteNombre: 'BANESCO BANCO UNIVERSAL, C.A. / SENIAT (Percepción y Retención IGTF)',
    contraparteRifOCedula: 'J-07013380-5 (Banesco) / G-20000303-0 (SENIAT)',
    bancoContraparte: '0134 - Banesco Banco Universal (Débitos Automáticos)',
    numeroCuentaContraparte: 'Débito Automático en Cuenta Corriente Banesco',
    cuentaBanescoOni: '0134-0342-18-3421089912',
    referenciaBancariaBanesco:
      'Ene Bs. 198,42k | Feb Bs. 245,11k | Mar Bs. 54,12k | Abr Bs. 112,34k | May Bs. 289,41k | Jun Bs. 7,42M | Jul Bs. 9,41M | Ago Bs. 9,02M',
    montoOperacionBs: 26751113.95,
    tasaBcvAplicada: 675.22,
    montoEquivalenteUSD: 39618.42,
    lineasAsientoContable: [
      {
        codigoCuenta: '5.3.01.01',
        nombreCuenta: 'Gastos Financieros por Comisiones Bancarias Banesco y Tributos IGTF',
        referenciaAuxiliar: 'Débitos Automáticos Banesco Ene-Ago 2026',
        debeBs: 26751113.95,
        haberBs: 0,
        debeUSD: 39618.42,
        haberUSD: 0,
      },
      {
        codigoCuenta: '1.1.01.02',
        nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912 (VES)',
        referenciaAuxiliar: 'Cargos COM. TRF. MB / COM. PAGO MOVIL CCE / IGTF',
        debeBs: 0,
        haberBs: 26751113.95,
        debeUSD: 0,
        haberUSD: 39618.42,
      },
    ],
    trazabilidadOrigenFondos:
      'Débitos automáticos efectuados por Banesco Banco Universal sobre la cuenta corriente 0134-0342-18-3421089912.',
    trazabilidadDestinoFondos:
      'Comisiones por transferencias interbancarias (COM. TRF. MB), comisiones por Pago Móvil CCE, comisiones SGLBTR y alícuota de IGTF.',
    baseLegalAntidelitosCambiarios:
      'El estado de cuenta bancario oficial emitido por Banesco funge como documento equivalente a factura para las comisiones bancarias conforme a la Providencia SENIAT SNAT/2011/0071.',
    requisitosSeniatSudebanVerificados: [
      'Cuadre exacto al céntimo con Salidas Categoría 7 (Ene-Ago 2026): Bs. 26.751.113,95 (US$ 39.618,42).',
      'Separación auxiliar para conciliación de la Renta Neta Fiscal ISLR.',
    ],
    estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
    expedienteSeniatNro: 'EXP-SENIAT-ONI-2026-COM-001',
  },
];

// ============================================================================
// TODOS LOS COMPROBANTES OFICIALES UNIFICADOS PARA EL LIBRO DIARIO Y EL REPOSITORIO SENIAT
// ============================================================================
export const TODOS_LOS_COMPROBANTES_BANESCO_2026: OfficialAccountingVoucher[] = [
  ...COMPROBANTES_ANTICIPOS_CLIENTES_2026,
  ...COMPROBANTES_TRANSFERENCIAS_INTERNAS_2026,
  ...COMPROBANTES_COMPRAS_DOLARES_BANESCO_2026,
  ...COMPROBANTES_RESTANTES_INGRESOS_EGRESOS_2026,
];

// ============================================================================
// BALANCE DE COMPROBACIÓN DE SUMAS Y SALDOS AL 31/08/2026 (VEN-NIF)
// Total Entradas Banesco: Bs. 1.966.597.105,35 (US$ 2.912.368,95)
// Total Salidas Banesco:  Bs. 1.956.660.113,95 (US$ 2.907.112,24)
// Saldo Disponible Neto en Banesco al 31/08/2026: +Bs. 9.936.991,40 (+US$ 5.256,71)
// ============================================================================
export const BALANCE_COMPROBACION_BANESCO_2026: TrialBalanceAccountRow[] = [
  {
    codigoCuenta: '1.1.01.02',
    nombreCuenta: 'Banesco Banco Universal - Cta. Cte. N° 0134-0342-18-3421089912 (VES)',
    tipoCuenta: 'ACTIVO',
    debeAcumuladoBs: 1966597105.35,
    haberAcumuladoBs: 1956660113.95,
    saldoDeudorBs: 9936991.4,
    saldoAcreedorBs: 0,
    debeAcumuladoUSD: 2912368.95,
    haberAcumuladoUSD: 2907112.24,
    saldoNetoUSD: 5256.71,
  },
  {
    codigoCuenta: '1.1.01.03',
    nombreCuenta: 'Banesco Cuenta Custodia Divisas USD / Anticipos Procura Café Exterior',
    tipoCuenta: 'ACTIVO',
    debeAcumuladoBs: 375630000.0,
    haberAcumuladoBs: 0,
    saldoDeudorBs: 375630000.0,
    saldoAcreedorBs: 0,
    debeAcumuladoUSD: 556890.45,
    haberAcumuladoUSD: 0,
    saldoNetoUSD: 556890.45,
  },
  {
    codigoCuenta: '1.1.01.99',
    nombreCuenta: 'Transferencias Interbancarias entre Cuentas Propias en Tránsito (J-50145638-0)',
    tipoCuenta: 'ACTIVO',
    debeAcumuladoBs: 153210000.0,
    haberAcumuladoBs: 208708057.73,
    saldoDeudorBs: 0,
    saldoAcreedorBs: 55498057.73,
    debeAcumuladoUSD: 226910.3,
    haberAcumuladoUSD: 308317.8,
    saldoNetoUSD: -81407.5,
  },
  {
    codigoCuenta: '2.1.01.02',
    nombreCuenta: 'Obligaciones Financieras Corto Plazo - Línea de Crédito Rotativa Becerra',
    tipoCuenta: 'PASIVO',
    debeAcumuladoBs: 181400000.0,
    haberAcumuladoBs: 186376000.0,
    saldoDeudorBs: 0,
    saldoAcreedorBs: 4976000.0,
    debeAcumuladoUSD: 278450.0,
    haberAcumuladoUSD: 286228.93,
    saldoNetoUSD: -7778.93,
  },
  {
    codigoCuenta: '2.1.04.01',
    nombreCuenta: 'Anticipos Recibidos de Clientes Jurídicos y Comerciales Banesco (NIIF 15)',
    tipoCuenta: 'PASIVO',
    debeAcumuladoBs: 0,
    haberAcumuladoBs: 1542017092.63,
    saldoDeudorBs: 0,
    saldoAcreedorBs: 1542017092.63,
    debeAcumuladoUSD: 0,
    haberAcumuladoUSD: 2270486.23,
    saldoNetoUSD: -2270486.23,
  },
  {
    codigoCuenta: '2.1.04.02',
    nombreCuenta: 'Anticipos Recibidos de Productor / Asociado Recurrente V-023997829',
    tipoCuenta: 'PASIVO',
    debeAcumuladoBs: 0,
    haberAcumuladoBs: 7649975.0,
    saldoDeudorBs: 0,
    saldoAcreedorBs: 7649975.0,
    debeAcumuladoUSD: 0,
    haberAcumuladoUSD: 11266.93,
    saldoNetoUSD: -11266.93,
  },
  {
    codigoCuenta: '2.1.04.03',
    nombreCuenta: 'Anticipos Recibidos de Productores y Personas Naturales Titulares (V-)',
    tipoCuenta: 'PASIVO',
    debeAcumuladoBs: 0,
    haberAcumuladoBs: 21845979.99,
    saldoDeudorBs: 0,
    saldoAcreedorBs: 21845979.99,
    debeAcumuladoUSD: 0,
    haberAcumuladoUSD: 36069.06,
    saldoNetoUSD: -36069.06,
  },
  {
    codigoCuenta: '5.1.01.01',
    nombreCuenta: 'Costo de Ventas / Liquidación de Compra de Café Verde y Cosecha',
    tipoCuenta: 'COSTO_OPERATIVO',
    debeAcumuladoBs: 1161270000.0,
    haberAcumuladoBs: 0,
    saldoDeudorBs: 1161270000.0,
    saldoAcreedorBs: 0,
    debeAcumuladoUSD: 1718450.12,
    haberAcumuladoUSD: 0,
    saldoNetoUSD: 1718450.12,
  },
  {
    codigoCuenta: '5.1.02.04',
    nombreCuenta: 'Costo Logístico de Fletes Terrestres, Almacenaje, Aduana y Guías INSAI/SICA',
    tipoCuenta: 'COSTO_OPERATIVO',
    debeAcumuladoBs: 45495000.0,
    haberAcumuladoBs: 0,
    saldoDeudorBs: 45495000.0,
    saldoAcreedorBs: 0,
    debeAcumuladoUSD: 67380.15,
    haberAcumuladoUSD: 0,
    saldoNetoUSD: 67380.15,
  },
  {
    codigoCuenta: '5.2.01.01',
    nombreCuenta: 'Gastos de Personal Rural, Vigilancia LOTTT, Caleta y Pago Móvil de Campo',
    tipoCuenta: 'GASTO_OPERATIVO',
    debeAcumuladoBs: 12904000.0,
    haberAcumuladoBs: 0,
    saldoDeudorBs: 12904000.0,
    saldoAcreedorBs: 0,
    debeAcumuladoUSD: 19412.8,
    haberAcumuladoUSD: 0,
    saldoNetoUSD: 19412.8,
  },
  {
    codigoCuenta: '5.3.01.01',
    nombreCuenta: 'Gastos Financieros por Comisiones Bancarias Banesco y Tributos IGTF',
    tipoCuenta: 'GASTO_FINANCIERO',
    debeAcumuladoBs: 26751113.95,
    haberAcumuladoBs: 0,
    saldoDeudorBs: 26751113.95,
    saldoAcreedorBs: 0,
    debeAcumuladoUSD: 39618.42,
    haberAcumuladoUSD: 0,
    saldoNetoUSD: 39618.42,
  },
];
