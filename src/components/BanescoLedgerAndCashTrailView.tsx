import React, { useState, useEffect } from 'react';
import {
  CashTrailOperation,
  CompanyProfile,
  BcvDailyRate,
  resolveBcvRateForDate,
  formatDateDDMMYYYY,
  parseDateToISO,
} from '../data/nominusData';
import {
  Download,
  Plus,
  Search,
  FileText,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';

interface BanescoLedgerAndCashTrailViewProps {
  companies: CompanyProfile[];
  selectedCompanyId: string; // 'ALL' o el id de una empresa
  operations: CashTrailOperation[];
  bcvRates: BcvDailyRate[];
  tasaBcvActual: number;
  onAddOperation: (op: CashTrailOperation) => void;
  onUpdateOperation: (updatedOp: CashTrailOperation) => void;
  onDeleteOperation?: (id: string) => void;
  onOpenReceipt: (id: string) => void;
}

const generateUniqueAuditId = (seq: number) => {
  const hex = Math.floor(1000 + Math.random() * 9000)
    .toString(16)
    .toUpperCase();
  const paddedSeq = String(seq).padStart(4, '0');
  return `UID-BAN-2026-${hex}-${paddedSeq}`;
};

export const BanescoLedgerAndCashTrailView: React.FC<BanescoLedgerAndCashTrailViewProps> = ({
  companies,
  selectedCompanyId,
  operations,
  bcvRates,
  tasaBcvActual,
  onAddOperation,
  onUpdateOperation,
  onDeleteOperation,
  onOpenReceipt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedAuditOpId, setSelectedAuditOpId] = useState<string>(operations[0]?.id || 'op-1');
  const [showNewForm, setShowNewForm] = useState(true);
  const [registroExitosoMsg, setRegistroExitosoMsg] = useState<string | null>(null);
  const [tipoTasaAplicadaForm, setTipoTasaAplicadaForm] = useState<'VENTA' | 'COMPRA'>('VENTA');

  // Empresa receptora para el nuevo registro (se sincroniza con la empresa activa)
  const [targetEmpresaId, setTargetEmpresaId] = useState<string>(
    selectedCompanyId === 'ALL' ? companies[0].id : selectedCompanyId
  );

  useEffect(() => {
    if (selectedCompanyId !== 'ALL') {
      setTargetEmpresaId(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  const targetCompany =
    companies.find((c) => c.id === targetEmpresaId) || companies[0];

  // Campos exhaustivos exigidos para cada Anticipo en Ventas en Banesco
  const [uidPreview, setUidPreview] = useState(() =>
    generateUniqueAuditId(operations.length + 1)
  );
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteRif, setClienteRif] = useState('J-');
  const [clienteTipo, setClienteTipo] = useState<
    'Jurídica (Empresa)' | 'Natural (Productor Titular)'
  >('Jurídica (Empresa)');
  const [bancoOrigen, setBancoOrigen] = useState(
    '0134 - Banesco Banco Universal (Mismo Banco)'
  );
  const [numeroCuentaOrigen, setNumeroCuentaOrigen] = useState('0134-');
  const [referenciaBanesco, setReferenciaBanesco] = useState('');
  const [fechaAnticipoText, setFechaAnticipoText] = useState('08/10/2026');
  const [horaTransferencia, setHoraTransferencia] = useState('10:30:00');
  const [montoVES, setMontoVES] = useState('');
  const [propositoAnticipo, setPropositoAnticipo] = useState(
    'Anticipo en ventas para compra de café en grano en el exterior (Colombia) y logística de flete terrestre internacional para cubrir demanda nacional.'
  );
  const [quintales, setQuintales] = useState('');
  const [origenCafe, setOrigenCafe] = useState('Cúcuta / Norte de Santander, Colombia');
  const [proveedorExterior] = useState(
    'Exportadora Cafetera del Norte S.A.S. (NIT 900.412.881-2)'
  );

  const fechaAnticipo = parseDateToISO(fechaAnticipoText);

  // Filtrar operaciones por Empresa seleccionada (o todas si selectedCompanyId === 'ALL')
  const companyScopedOps =
    selectedCompanyId === 'ALL'
      ? operations
      : operations.filter((op) => op.empresaId === selectedCompanyId);

  const filteredOps = companyScopedOps.filter((op) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      op.clienteNombre.toLowerCase().includes(q) ||
      op.clienteRif.toLowerCase().includes(q) ||
      op.referenciaBanesco.includes(q) ||
      op.numeroCuentaOrigen.includes(q) ||
      op.uidUnico.toLowerCase().includes(q) ||
      op.codigoOperacion.toLowerCase().includes(q) ||
      formatDateDDMMYYYY(op.fechaAnticipo).includes(q) ||
      op.fechaAnticipo.includes(q);
    const matchesFilter = statusFilter === 'ALL' || op.estadoContable === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const auditOp =
    filteredOps.find((o) => o.id === selectedAuditOpId) ||
    filteredOps[0] ||
    companyScopedOps[0] ||
    operations[0];

  const getCompanyById = (empId: string) =>
    companies.find((c) => c.id === empId) || companies[0];

  // Totales de la Hoja Contable Banesco (según vista de empresa activa o consolidada)
  const totalAnticiposVES = companyScopedOps.reduce((acc, o) => acc + o.montoAnticipoVES, 0);
  const totalDivisasBanescoUSD = companyScopedOps.reduce((acc, o) => acc + o.montoAdjudicadoUSD, 0);
  const totalQuintales = companyScopedOps.reduce((acc, o) => acc + o.quintalesComprados, 0);
  const totalFletesFacturadosVES = companyScopedOps.reduce((acc, o) => acc + o.subtotalFleteVES, 0);
  const totalRetencionesIslrVES = companyScopedOps.reduce(
    (acc, o) => acc + o.retencionIslrFleteVES,
    0
  );

  // 1. Exportar CSV Estándar Multiempresa
  const handleExportCSV = () => {
    const headers = [
      'Empresa_Receptora',
      'RIF_Empresa_Receptora',
      'ID_Unico_Trazabilidad',
      'Codigo_Expediente',
      'Fecha_Transferencia',
      'Hora_Transferencia',
      'Nombre_Tercero_O_Asociado',
      'RIF_Cedula_Titular',
      'Tipo_Cuenta_Titular',
      'Banco_De_Origen',
      'Numero_Cuenta_Origen_20_Digitos',
      'Cuenta_Banesco_Receptora_Empresa',
      'Referencia_Bancaria_Banesco',
      'Monto_Recibido_Bolivares_VES',
      'Proposito_Del_Anticipo',
      'Tasa_BCV_Recepcion',
      'Fecha_Compra_Divisas_Banesco',
      'Codigo_Pacto_Mesa_Cambio',
      'Tasa_Mesa_Cambio_Banesco',
      'Comision_Banesco_VES',
      'Divisas_Adjudicadas_USD',
      'Cuenta_Custodia_USD_Banesco',
      'Fecha_Pago_Exterior',
      'Ref_Pago_Internacional',
      'Proveedor_Cafe_Exterior',
      'Origen_Cafe_Exterior',
      'Quintales_46Kg',
      'Costo_Cafe_Exterior_USD',
      'Flete_Internacional_USD',
      'Permiso_Fitosanitario_INSAI',
      'Factura_Fiscal_SENIAT',
      'Venta_Cafe_Exento_VES',
      'Servicio_Flete_VES',
      'Retencion_ISLR_3Porciento_VES',
      'Etapa_Flujo_Trazabilidad',
      'Estado_Contable_SENIAT',
    ];

    const rows = companyScopedOps.map((o) => {
      const emp = getCompanyById(o.empresaId);
      return [
        `"${emp.razonSocial}"`,
        emp.rif,
        o.uidUnico,
        o.codigoOperacion,
        formatDateDDMMYYYY(o.fechaAnticipo),
        o.horaTransferencia,
        `"${o.clienteNombre.replace(/"/g, '""')}"`,
        o.clienteRif,
        `"${o.clienteTipoCuenta}"`,
        `"${o.bancoOrigen}"`,
        o.numeroCuentaOrigen,
        o.cuentaBanescoReceptora,
        o.referenciaBanesco,
        o.montoAnticipoVES.toFixed(2),
        `"${o.propositoAnticipo.replace(/"/g, '""')}"`,
        o.tasaBcvAnticipo.toFixed(2),
        formatDateDDMMYYYY(o.fechaMesaCambio),
        o.codigoPactoBanesco,
        o.tasaMesaCambio.toFixed(2),
        o.comisionBanescoVES.toFixed(2),
        o.montoAdjudicadoUSD.toFixed(2),
        `"${o.cuentaBanescoDivisas}"`,
        formatDateDDMMYYYY(o.fechaCompraExterior),
        o.referenciaPagoExterior,
        `"${o.proveedorExterior.replace(/"/g, '""')}"`,
        `"${o.origenCafe.replace(/"/g, '""')}"`,
        o.quintalesComprados,
        o.costoCafeUSD.toFixed(2),
        o.fleteInternacionalUSD.toFixed(2),
        `"${o.permisoInsai}"`,
        o.numeroFacturaSeniat,
        o.subtotalCafeVES.toFixed(2),
        o.subtotalFleteVES.toFixed(2),
        o.retencionIslrFleteVES.toFixed(2),
        `Etapa ${o.etapaTrazabilidad} de 4`,
        `"${o.estadoContable}"`,
      ];
    });

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Registro_Multiempresa_Anticipos_Banesco_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 2. Exportar Formato Nativo Microsoft Excel (.xls) Multiempresa
  const handleExportExcelXLS = () => {
    const tableRows = companyScopedOps
      .map((o) => {
        const emp = getCompanyById(o.empresaId);
        return `
      <tr>
        <td style="font-weight:bold;">${emp.razonSocial} (${emp.rif})</td>
        <td style="font-family:monospace;font-weight:bold;">${o.uidUnico}</td>
        <td>${o.codigoOperacion}</td>
        <td>${o.fechaAnticipo} ${o.horaTransferencia}</td>
        <td>${o.clienteNombre}</td>
        <td>${o.clienteRif}</td>
        <td>${o.bancoOrigen}</td>
        <td style="mso-number-format:'\\@';font-family:monospace;">${o.numeroCuentaOrigen}</td>
        <td style="mso-number-format:'\\@';font-family:monospace;">${o.cuentaBanescoReceptora}</td>
        <td style="mso-number-format:'\\@';font-family:monospace;">${o.referenciaBanesco}</td>
        <td style="mso-number-format:'#.##0,00';font-weight:bold;">${o.montoAnticipoVES.toFixed(2)}</td>
        <td>${o.propositoAnticipo}</td>
        <td>${o.codigoPactoBanesco}</td>
        <td style="mso-number-format:'#.##0,00';">${o.tasaMesaCambio.toFixed(2)}</td>
        <td style="mso-number-format:'#.##0,00';font-weight:bold;">${o.montoAdjudicadoUSD.toFixed(2)}</td>
        <td>${o.proveedorExterior}</td>
        <td>${o.origenCafe}</td>
        <td>${o.quintalesComprados}</td>
        <td style="mso-number-format:'#.##0,00';">${o.costoCafeUSD.toFixed(2)}</td>
        <td style="mso-number-format:'#.##0,00';">${o.fleteInternacionalUSD.toFixed(2)}</td>
        <td>${o.numeroFacturaSeniat}</td>
        <td style="mso-number-format:'#.##0,00';">${o.retencionIslrFleteVES.toFixed(2)}</td>
        <td>Etapa ${o.etapaTrazabilidad}/4 - ${o.estadoContable}</td>
      </tr>`;
      })
      .join('');

    const excelHTML = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8" />
      </head>
      <body>
        <h3>SISTEMA MULTIEMPRESA NOMINUS CAFÉ 1 — LIBRO AUXILIAR DE ANTICIPOS EN VENTAS BANESCO Y TRAZABILIDAD CAMBIARIA</h3>
        <table border="1">
          <thead style="background-color:#DCFCE7;font-weight:bold;">
            <tr>
              <th>Empresa Receptora (RIF)</th>
              <th>ID Único Trazabilidad</th>
              <th>Expediente</th>
              <th>Fecha y Hora Transferencia</th>
              <th>Nombre del Tercero o Asociado</th>
              <th>RIF / Cédula</th>
              <th>Banco de Origen</th>
              <th>N° Cuenta de Origen (20 Dígitos)</th>
              <th>Cuenta Banesco Receptora</th>
              <th>Ref. Banesco</th>
              <th>Monto Recibido (Bs. VES)</th>
              <th>Propósito Declarado del Anticipo</th>
              <th>Pacto Mesa Cambio Banesco</th>
              <th>Tasa Pacto</th>
              <th>Divisas Adjudicadas (USD)</th>
              <th>Proveedor Exterior (Colombia)</th>
              <th>Origen del Café</th>
              <th>Quintales (46 Kg)</th>
              <th>Costo Café (USD)</th>
              <th>Flete Cobrado (USD)</th>
              <th>Factura Fiscal SENIAT</th>
              <th>Retención ISLR Flete 3% (Bs.)</th>
              <th>Estado de Trazabilidad</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF' + excelHTML], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Libro_Multiempresa_Anticipos_Banesco_NominusCafe1.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 3. Exportar Comprobante de Asientos Contables Multiempresa (Galac, Profit Plus, Saint)
  const handleExportAccountingSoftwareCSV = () => {
    const headers = [
      'Empresa_RIF',
      'Razon_Social_Empresa',
      'Fecha_Asiento',
      'Comprobante_UID',
      'Codigo_Cuenta_VEN_NIF',
      'Nombre_Cuenta_Contable',
      'Descripcion_Movimiento_SENIAT_SUDEBAN',
      'Referencia_Bancaria',
      'Debe_VES',
      'Haber_VES',
    ];

    const journalLines: string[][] = [];
    companyScopedOps.forEach((o) => {
      const emp = getCompanyById(o.empresaId);
      journalLines.push([
        emp.rif,
        `"${emp.razonSocial}"`,
        o.fechaAnticipo,
        o.uidUnico,
        '1.1.01.02.01',
        `"Banco Banesco Cta. Cte. Bs. (${emp.cuentaBanescoVES})"`,
        `"Recepcion Anticipo Cta Origen ${o.numeroCuentaOrigen} - ${o.clienteNombre}"`,
        o.referenciaBanesco,
        o.montoAnticipoVES.toFixed(2),
        '0.00',
      ]);
      journalLines.push([
        emp.rif,
        `"${emp.razonSocial}"`,
        o.fechaAnticipo,
        o.uidUnico,
        '2.1.04.01.01',
        '"Anticipos Recibidos de Clientes (Pasivo NIIF 15)"',
        `"${o.propositoAnticipo.slice(0, 70)}"`,
        o.reciboAnticipoNro,
        '0.00',
        o.montoAnticipoVES.toFixed(2),
      ]);
      journalLines.push([
        emp.rif,
        `"${emp.razonSocial}"`,
        o.fechaMesaCambio,
        o.uidUnico,
        '1.1.01.03.01',
        `"Banco Banesco Cuenta Custodia USD (${emp.cuentaBanescoUSD})"`,
        `"Adjudicacion Divisas Mesa de Cambio ${o.codigoPactoBanesco} (${o.montoAdjudicadoUSD.toFixed(2)} USD)"`,
        o.codigoPactoBanesco,
        (o.montoAnticipoVES - o.comisionBanescoVES).toFixed(2),
        '0.00',
      ]);
      journalLines.push([
        emp.rif,
        `"${emp.razonSocial}"`,
        o.fechaMesaCambio,
        o.uidUnico,
        '5.3.01.02.01',
        '"Gasto Comision Bancaria Mesa de Cambio Banesco"',
        `"Comision 0.25% Mesa Cambio Pacto ${o.codigoPactoBanesco}"`,
        o.codigoPactoBanesco,
        o.comisionBanescoVES.toFixed(2),
        '0.00',
      ]);
      journalLines.push([
        emp.rif,
        `"${emp.razonSocial}"`,
        o.fechaMesaCambio,
        o.uidUnico,
        '1.1.01.02.01',
        `"Banco Banesco Cta. Cte. Bs. (${emp.cuentaBanescoVES})"`,
        `"Cargo por Compra Divisas Mesa de Cambio ${o.codigoPactoBanesco}"`,
        o.codigoPactoBanesco,
        '0.00',
        o.montoAnticipoVES.toFixed(2),
      ]);
    });

    const csvContent =
      '\uFEFF' + [headers.join(','), ...journalLines.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Asientos_Multiempresa_Galac_Profit_Saint.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBankChange = (selectedBank: string) => {
    setBancoOrigen(selectedBank);
    const bankCode = selectedBank.slice(0, 4);
    if (/^\d{4}$/.test(bankCode)) {
      setNumeroCuentaOrigen(`${bankCode}-0089-24-`);
    }
  };

  // Tasa BCV resuelta automáticamente según la fecha exacta del depósito (ej. 2026-01-05)
  const resolvedFormRate = resolveBcvRateForDate(fechaAnticipo, bcvRates, tasaBcvActual);
  const tasaActivaDelDia =
    tipoTasaAplicadaForm === 'VENTA'
      ? resolvedFormRate.tasaVentaVES
      : resolvedFormRate.tasaCompraVES;
  const montoFormNum = parseFloat(montoVES) || 0;
  const reconversionAutomaticaUSD =
    tasaActivaDelDia > 0 ? montoFormNum / tasaActivaDelDia : 0;

  const handleCreateOperation = (e: React.FormEvent) => {
    e.preventDefault();
    const montoNum = parseFloat(montoVES) || 200;
    const qqNum = Math.max(1, parseInt(quintales, 10) || 1);
    const comisionBanesco = montoNum * 0.0025;
    const tasaRecepcionDia = Number(tasaActivaDelDia.toFixed(4));
    const tasaMesa = Number(resolvedFormRate.tasaVentaVES.toFixed(4));
    const usdAdjudicados = (montoNum - comisionBanesco) / tasaMesa;
    const fleteUSD = usdAdjudicados * 0.11;
    const cafeUSD = usdAdjudicados - fleteUSD;

    const newOp: CashTrailOperation = {
      id: `op-${Date.now()}`,
      empresaId: targetCompany.id,
      uidUnico: uidPreview,
      codigoOperacion: `${targetCompany.codigoCorto.slice(0, 3)}-2026-00${operations.length + 41}`,
      fechaAnticipo,
      horaTransferencia:
        horaTransferencia.length === 5 ? `${horaTransferencia}:00` : horaTransferencia,
      clienteNombre:
        clienteNombre.trim() || 'Productores Asociados de Café del Occidente, C.A.',
      clienteRif: clienteRif.trim() || 'J-41299012-4',
      clienteTipoCuenta: clienteTipo,
      bancoOrigen,
      numeroCuentaOrigen:
        numeroCuentaOrigen.trim().length >= 10
          ? numeroCuentaOrigen.trim()
          : '0134-0089-24-0891234567',
      cuentaBanescoReceptora: targetCompany.cuentaBanescoVES,
      referenciaBanesco:
        referenciaBanesco.trim() ||
        String(Math.floor(800000000 + Math.random() * 199999999)),
      montoAnticipoVES: montoNum,
      propositoAnticipo:
        propositoAnticipo.trim() ||
        'Anticipo en ventas para compra de café en el exterior y transporte internacional.',
      tasaBcvAnticipo: tasaRecepcionDia,
      fechaMesaCambio: fechaAnticipo,
      horaMesaCambio: '11:30:00',
      codigoPactoBanesco: `MC-BAN-2026-${Math.floor(90000 + Math.random() * 9999)}`,
      tasaMesaCambio: tasaMesa,
      comisionBanescoVES: Math.round(comisionBanesco * 100) / 100,
      montoAdjudicadoUSD: Math.round(usdAdjudicados * 100) / 100,
      cuentaBanescoDivisas: targetCompany.cuentaBanescoUSD,
      fechaCompraExterior: fechaAnticipo,
      referenciaPagoExterior: `INT-PAY-COL-${Math.floor(775200 + Math.random() * 4000)}`,
      proveedorExterior,
      origenCafe,
      variedadCafe: 'Café Verde Arábica Lavado',
      quintalesComprados: qqNum,
      costoCafeUSD: Math.round(cafeUSD * 100) / 100,
      fleteInternacionalUSD: Math.round(fleteUSD * 100) / 100,
      estadoLogistico: 'En Almacén Colombia (Trámite INSAI)',
      permisoInsai: `EN TRÁMITE: SOL-INSAI-2026-${Math.floor(12100 + Math.random() * 800)}`,
      numeroFacturaSeniat: 'PENDIENTE AL INGRESO ADUANAL',
      fechaFacturaSeniat: '2026-10-16',
      tasaBcvFacturacion: tasaBcvActual,
      subtotalCafeVES: Math.round(cafeUSD * tasaRecepcionDia * 100) / 100,
      subtotalFleteVES: Math.round(fleteUSD * tasaRecepcionDia * 100) / 100,
      ivaFleteVES: 0,
      retencionIslrFleteVES: Math.round(fleteUSD * tasaRecepcionDia * 0.03 * 100) / 100,
      diferencialCambiarioVES: 0,
      estadoContable: 'Anticipo Abierto (Pasivo 2.1.04)',
      etapaTrazabilidad: 2,
      reciboAnticipoNro: `REC-${targetCompany.codigoCorto.slice(0, 3)}-2026-0${104 + operations.length}`,
    };

    onAddOperation(newOp);
    setSelectedAuditOpId(newOp.id);
    setRegistroExitosoMsg(
      `Registro ${newOp.uidUnico} almacenado en ${targetCompany.razonSocial}. Aplicada tasa BCV del día ${resolvedFormRate.fechaAplicada} (Bs. ${tasaRecepcionDia.toFixed(4)}/USD → Reconversión: USD ${reconversionAutomaticaUSD.toFixed(2)}).`
    );
    setUidPreview(generateUniqueAuditId(operations.length + 42));
    setClienteNombre('');
    setReferenciaBanesco('');
    setTimeout(() => setRegistroExitosoMsg(null), 5000);
  };

  const handleSetTraceabilityStage = (op: CashTrailOperation, stage: 1 | 2 | 3 | 4) => {
    let estadoContable: CashTrailOperation['estadoContable'] = op.estadoContable;
    let estadoLogistico: CashTrailOperation['estadoLogistico'] = op.estadoLogistico;
    let factura = op.numeroFacturaSeniat;

    if (stage === 1) {
      estadoContable = 'Anticipo Abierto (Pasivo 2.1.04)';
      estadoLogistico = 'En Almacén Colombia (Trámite INSAI)';
    } else if (stage === 2) {
      estadoContable = 'Divisas En Custodia Banesco';
      estadoLogistico = 'En Almacén Colombia (Trámite INSAI)';
    } else if (stage === 3) {
      estadoContable = 'Anticipo Abierto (Pasivo 2.1.04)';
      estadoLogistico = 'En Tránsito Frontera (San Antonio / Ureña)';
    } else if (stage === 4) {
      estadoContable = 'Cerrado y Declarado SENIAT';
      estadoLogistico = 'Entregado y Facturado en Venezuela';
      if (!factura.startsWith('FACT-')) {
        factura = `FACT-A-000189${Math.floor(6 + Math.random() * 90)}`;
      }
    }

    onUpdateOperation({
      ...op,
      etapaTrazabilidad: stage,
      estadoContable,
      estadoLogistico,
      numeroFacturaSeniat: factura,
    });
  };

  return (
    <div className="space-y-8">
      {/* RESUMEN DE LAS 4 ETAPAS DEL FLUJO DE FONDOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#DCFCE7] border border-[#86EFAC] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-[#166534]">
              ETAPA 1 · RECEPCIÓN DEL ANTICIPO (BS.)
            </span>
            <h3 className="text-base font-bold text-[#14532D] mt-1 font-display">
              Cuenta Origen Socio → Banesco Empresa
            </h3>
            <p className="text-xs text-[#166534] mt-1 leading-relaxed">
              Captura empresa receptora, banco emisor, cuenta origen de 20 dígitos, fecha/hora exacta, monto en Bs. y propósito.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#86EFAC] flex justify-between items-baseline">
            <span className="text-xs font-medium text-[#166534]">Total Recibido:</span>
            <span className="text-base font-bold font-mono text-[#14532D]">
              Bs. {totalAnticiposVES.toLocaleString('es-VE', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        <div className="bg-[#E0F2FE] border border-[#BAE6FD] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-[#0369A1]">
              ETAPA 2 · COMPRA DE DIVISAS BANESCO
            </span>
            <h3 className="text-base font-bold text-[#0C4A6E] mt-1 font-display">
              Mesa de Cambio BCV (Cuenta Custodia USD)
            </h3>
            <p className="text-xs text-[#0C4A6E] mt-1 leading-relaxed">
              Cada empresa gestiona su propio cupo mensual de divisas en Banesco Mesa de Cambio (Convenio Cambiario N° 1 BCV).
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#BAE6FD] flex justify-between items-baseline">
            <span className="text-xs font-medium text-[#0369A1]">Divisas Adjudicadas:</span>
            <span className="text-base font-bold font-mono text-[#0C4A6E]">
              USD {totalDivisasBanescoUSD.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="bg-[#FEF9C3] border border-[#FEF08A] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-[#854D0E]">
              ETAPA 3 · ADQUISICIÓN CAFÉ EXTERIOR
            </span>
            <h3 className="text-base font-bold text-[#713F12] mt-1 font-display">
              Pago a Exportador en Colombia / INSAI
            </h3>
            <p className="text-xs text-[#713F12] mt-1 leading-relaxed">
              Los USD de cada empresa pagan los lotes de café en Colombia y su resguardo mientras se emiten permisos INSAI.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#FEF08A] flex justify-between items-baseline">
            <span className="text-xs font-medium text-[#854D0E]">Volumen Comprado:</span>
            <span className="text-base font-bold font-mono text-[#713F12]">
              {totalQuintales} Quintales ({totalQuintales * 46} Kg)
            </span>
          </div>
        </div>

        <div className="bg-[#FCE7F3] border border-[#FBCFE8] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-[#9D174D]">
              ETAPA 4 · FACTURA SENIAT + COBRO FLETE
            </span>
            <h3 className="text-base font-bold text-[#831843] mt-1 font-display">
              Cierre del Anticipo e Impuestos SENIAT
            </h3>
            <p className="text-xs text-[#831843] mt-1 leading-relaxed">
              Entrega del café al asociado, cobro de flete internacional, emisión de Factura Fiscal SENIAT y retención ISLR 3%.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#FBCFE8] flex justify-between items-baseline">
            <span className="text-xs font-medium text-[#9D174D]">Fletes / ISLR 3%:</span>
            <span className="text-xs font-bold font-mono text-[#831843]">
              Bs. {totalFletesFacturadosVES.toLocaleString('es-VE', { maximumFractionDigits: 0 })} / Ret: Bs. {totalRetencionesIslrVES.toLocaleString('es-VE', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      {/* FORMULARIO EXHAUSTIVO DE CAPTURA MULTIEMPRESA DE ANTICIPO EN VENTAS EN BANESCO */}
      <div className="bg-white border border-[#D6D3D1] rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E5E4]">
          <div>
            <span className="text-xs font-bold text-[#15803D]">
              CAPTURA EXHAUSTIVA MULTIEMPRESA · CUMPLIMIENTO SUDEBAN 083.18 Y SENIAT
            </span>
            <h2 className="text-xl font-bold text-[#1C1917] font-display mt-0.5">
              Registrar Nuevo Anticipo en Ventas en Banesco ({targetCompany.razonSocial})
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setShowNewForm(!showNewForm)}
            className="px-4 py-2 bg-[#FAF8F5] border border-[#D6D3D1] rounded-xl text-xs font-semibold text-[#1C1917] hover:bg-[#F5F5F4] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {showNewForm ? 'Ocultar Formulario de Captura' : 'Mostrar Formulario de Captura'}
          </button>
        </div>

        {registroExitosoMsg && (
          <div className="bg-[#DCFCE7] border border-[#86EFAC] text-[#14532D] px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between">
            <span>{registroExitosoMsg}</span>
            <button
              onClick={() => setRegistroExitosoMsg(null)}
              className="text-xs underline ml-4 cursor-pointer"
            >
              Cerrar aviso
            </button>
          </div>
        )}

        {showNewForm && (
          <form onSubmit={handleCreateOperation} className="space-y-5">
            {/* Fila 1: Selector de Empresa Receptora, ID Único, Fecha, Hora y Referencia Banesco */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-[#FAF8F5] p-4 rounded-xl border border-[#E7E5E4]">
              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1">
                  Empresa Receptora (Banesco)
                </label>
                <select
                  value={targetEmpresaId}
                  onChange={(e) => setTargetEmpresaId(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-bold bg-white border border-[#D6D3D1] rounded-lg text-[#1C1917]"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.codigoCorto} — {c.razonSocial.slice(0, 22)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14532D] mb-1">
                  Identificador Único (Auto)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={uidPreview}
                    className="w-full px-2.5 py-2 text-xs font-mono font-bold bg-[#DCFCE7] text-[#14532D] border border-[#86EFAC] rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setUidPreview(generateUniqueAuditId(operations.length + 41))}
                    title="Generar nuevo identificador único"
                    className="p-2 bg-white border border-[#D6D3D1] rounded-lg hover:bg-[#F5F5F4] cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#1C1917]" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#44403C] mb-1">
                  Fecha Transferencia (XX/XX/2XXX)
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    required
                    placeholder="DD/MM/2026"
                    value={fechaAnticipoText}
                    onChange={(e) => setFechaAnticipoText(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs font-mono font-bold bg-white border border-[#D6D3D1] rounded-lg"
                  />
                  <input
                    type="date"
                    value={fechaAnticipo}
                    onChange={(e) => setFechaAnticipoText(formatDateDDMMYYYY(e.target.value))}
                    title="Seleccionar en calendario"
                    className="w-9 px-1 py-2 text-xs bg-white border border-[#D6D3D1] rounded-lg cursor-pointer shrink-0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#44403C] mb-1">
                  Hora Transferencia (HH:MM:SS)
                </label>
                <input
                  type="time"
                  step="1"
                  required
                  value={horaTransferencia}
                  onChange={(e) => setHoraTransferencia(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#D6D3D1] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#44403C] mb-1">
                  N° Referencia Banesco (9 dígitos)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 974829104"
                  value={referenciaBanesco}
                  onChange={(e) => setReferenciaBanesco(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-[#D6D3D1] rounded-lg"
                />
              </div>
            </div>

            {/* Fila 2: Tercero o Asociado, RIF, Banco de Origen y Número de Cuenta de Origen (20 dígitos) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#44403C] mb-1">
                  Nombre del Tercero o Asociado (Titular)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Agropecuaria El Cafetal de Lara, C.A."
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D6D3D1] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#44403C] mb-1">
                  RIF / Cédula y Tipo de Cuenta del Asociado
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="J-40123981-2"
                    value={clienteRif}
                    onChange={(e) => setClienteRif(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs font-mono bg-white border border-[#D6D3D1] rounded-lg"
                  />
                  <select
                    value={clienteTipo}
                    onChange={(e) => setClienteTipo(e.target.value as any)}
                    className="w-full px-2 py-2 text-xs bg-white border border-[#D6D3D1] rounded-lg"
                  >
                    <option value="Jurídica (Empresa)">Jurídica</option>
                    <option value="Natural (Productor Titular)">Personal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#44403C] mb-1">
                  Banco de Origen (Venezuela)
                </label>
                <select
                  value={bancoOrigen}
                  onChange={(e) => handleBankChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D6D3D1] rounded-lg"
                >
                  <option value="0134 - Banesco Banco Universal (Mismo Banco)">
                    0134 - Banesco Banco Universal
                  </option>
                  <option value="0105 - Banco Mercantil">0105 - Banco Mercantil</option>
                  <option value="0108 - Banco Provincial BBVA">
                    0108 - Banco Provincial BBVA
                  </option>
                  <option value="0102 - Banco de Venezuela">0102 - Banco de Venezuela</option>
                  <option value="0191 - Banco Nacional de Crédito (BNC)">
                    0191 - Banco Nacional de Crédito (BNC)
                  </option>
                  <option value="0114 - Bancaribe">0114 - Bancaribe</option>
                  <option value="0172 - Bancamiga Banco Universal">
                    0172 - Bancamiga Banco Universal
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#44403C] mb-1">
                  Número de Cuenta de Origen (20 dígitos)
                </label>
                <input
                  type="text"
                  required
                  placeholder="0134-0089-24-0891045512"
                  value={numeroCuentaOrigen}
                  onChange={(e) => setNumeroCuentaOrigen(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#D6D3D1] rounded-lg"
                />
              </div>
            </div>

            {/* Fila 3: Monto en Bolívares, Propósito del Anticipo y Parámetros de Trazabilidad Exterior */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
              <div className="lg:col-span-3">
                <label className="block text-xs font-bold text-[#14532D] mb-1">
                  Monto en Bolívares Recibido (Bs. VES)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={montoVES}
                  onChange={(e) => setMontoVES(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono font-bold bg-[#DCFCE7]/40 border border-[#86EFAC] rounded-lg text-[#14532D]"
                />
              </div>

              <div className="lg:col-span-5">
                <label className="block text-xs font-semibold text-[#44403C] mb-1">
                  Propósito Específico del Anticipo (Declaración Comercial y SUDEBAN)
                </label>
                <input
                  type="text"
                  required
                  value={propositoAnticipo}
                  onChange={(e) => setPropositoAnticipo(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D6D3D1] rounded-lg"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-[#44403C] mb-1">
                  Quintales Café Exterior (46 Kg)
                </label>
                <input
                  type="number"
                  required
                  value={quintales}
                  onChange={(e) => setQuintales(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#D6D3D1] rounded-lg"
                />
              </div>

              <div className="lg:col-span-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#1C1917] text-white text-xs font-semibold rounded-xl hover:bg-[#292524] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Guardar Anticipo
                </button>
              </div>
            </div>

            {/* Panel de Reconversión Automática BCV según la Fecha Exacta del Depósito */}
            <div className="bg-[#E0F2FE] border border-[#7DD3FC] rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-[#0C4A6E]">
                  RECONVERSIÓN AUTOMÁTICA BCV PARA LA FECHA SELECCIONADA ({resolvedFormRate.fechaFormateada}):
                </div>
                <div className="text-xs text-[#0369A1]">
                  Tasa de Compra BCV: <strong className="font-mono">Bs. {resolvedFormRate.tasaCompraVES.toFixed(4)}</strong> · Tasa de Venta BCV: <strong className="font-mono">Bs. {resolvedFormRate.tasaVentaVES.toFixed(4)}</strong> ({resolvedFormRate.fuente})
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={tipoTasaAplicadaForm}
                  onChange={(e) => setTipoTasaAplicadaForm(e.target.value as 'VENTA' | 'COMPRA')}
                  className="px-3 py-1.5 text-xs font-bold bg-white border border-[#7DD3FC] rounded-lg text-[#0C4A6E]"
                >
                  <option value="VENTA">Usar Tasa Venta BCV (Bs. {resolvedFormRate.tasaVentaVES.toFixed(4)})</option>
                  <option value="COMPRA">Usar Tasa Compra BCV (Bs. {resolvedFormRate.tasaCompraVES.toFixed(4)})</option>
                </select>

                <div className="bg-white border border-[#7DD3FC] rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-[#0C4A6E]">
                  Bs. {montoFormNum.toLocaleString('es-VE', { minimumFractionDigits: 2 })} = USD {reconversionAutomaticaUSD.toFixed(2)}
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* TABLA EXHAUSTIVA DE ANTICIPOS BANESCO + CENTRO DE EXPORTACIÓN CONTABLE */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-[#E7E5E4]">
          <div>
            <span className="text-xs font-bold text-[#15803D]">
              {selectedCompanyId === 'ALL'
                ? 'VISTA CONSOLIDADA MULTIEMPRESA · TODAS LAS EMPRESAS DEL GRUPO'
                : `LIBRO AUXILIAR DE: ${getCompanyById(selectedCompanyId).razonSocial} (${
                    getCompanyById(selectedCompanyId).rif
                  })`}
            </span>
            <h2 className="text-xl font-bold text-[#1C1917] font-display mt-0.5">
              Libro Maestro de Anticipos en Ventas Banesco y Seguimiento del Flujo de Fondos
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleExportExcelXLS}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#DCFCE7] border border-[#86EFAC] text-[#14532D] text-xs font-bold rounded-xl hover:bg-[#BBF7D0] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Exportar Excel (.xls)
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#E0F2FE] border border-[#BAE6FD] text-[#0C4A6E] text-xs font-bold rounded-xl hover:bg-[#BAE6FD]/60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Exportar CSV Completo
            </button>
            <button
              onClick={handleExportAccountingSoftwareCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1C1917] text-white text-xs font-semibold rounded-xl hover:bg-[#292524] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Asientos Software Contable (CSV)
            </button>
          </div>
        </div>

        {/* Controles de Búsqueda y Filtro */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por ID único, socio, cuenta origen, referencia Banesco..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF8F5] border border-[#D6D3D1] rounded-xl focus:outline-none focus:border-[#1C1917]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#FAF8F5] border border-[#E7E5E4] rounded-xl">
            {[
              { id: 'ALL', label: 'Todos los Registros' },
              { id: 'Anticipo Abierto (Pasivo 2.1.04)', label: 'Pasivo Abierto (En Colombia)' },
              { id: 'Divisas En Custodia Banesco', label: 'USD en Banesco Custodia' },
              { id: 'Cerrado y Declarado SENIAT', label: 'Cerrados con Factura SENIAT' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-[#1C1917] text-white'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla Exhaustiva Multiempresa */}
        <div className="overflow-x-auto border border-[#E7E5E4] rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E7E5E4] text-[#44403C]">
                <th className="py-3 px-3 font-bold">Empresa Receptora / ID Único</th>
                <th className="py-3 px-3 font-bold">Tercero o Asociado / RIF</th>
                <th className="py-3 px-3 font-bold">Banco y N° Cuenta de Origen</th>
                <th className="py-3 px-3 font-bold text-right">Monto Recibido (Bs.)</th>
                <th className="py-3 px-3 font-bold">Propósito Declarado del Anticipo</th>
                <th className="py-3 px-3 font-bold">Flujo Divisas → Café Exterior</th>
                <th className="py-3 px-3 font-bold text-right">Acciones / Recibo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5E4]">
              {filteredOps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 px-6 text-center bg-[#FAF8F5]">
                    <div className="max-w-xl mx-auto space-y-2">
                      <div className="text-sm font-bold text-[#14532D]">
                        BASE DE DATOS LIMPIA PARA {targetCompany.razonSocial} ({targetCompany.rif}) — 0 REGISTROS SIMULADOS
                      </div>
                      <p className="text-xs text-[#44403C] leading-relaxed">
                        Se han eliminado todos los datos simulados. El libro auxiliar en Cloud Firestore está en cero y preparado para recibir únicamente las operaciones reales de anticipos en ventas en Banesco de <strong>{targetCompany.razonSocial}</strong>. Utiliza el formulario superior para registrar tu primera transferencia verdadera.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOps.map((op) => {
                  const isSelected = op.id === auditOp?.id;
                  const emp = getCompanyById(op.empresaId);
                  return (
                    <tr
                      key={op.id}
                      onClick={() => setSelectedAuditOpId(op.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#FFF7ED]' : 'hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <div className="font-bold text-[#1C1917]">
                          {emp.codigoCorto} · {emp.rif}
                        </div>
                        <div className="font-mono font-bold text-[#14532D] mt-0.5">{op.uidUnico}</div>
                        <div className="font-mono text-[#57534E] text-[11px]">
                          {formatDateDDMMYYYY(op.fechaAnticipo)} · {op.horaTransferencia}
                        </div>
                      </td>

                      <td className="py-3 px-3 align-top max-w-[210px]">
                        <div className="font-bold text-[#1C1917] leading-snug">{op.clienteNombre}</div>
                        <div className="font-mono text-[#57534E] mt-0.5">
                          {op.clienteRif} · {op.clienteTipoCuenta}
                        </div>
                      </td>

                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <div className="font-semibold text-[#1C1917]">{op.bancoOrigen}</div>
                        <div className="font-mono text-[#0369A1] font-medium mt-0.5">
                          Cta Origen: {op.numeroCuentaOrigen}
                        </div>
                        <div className="font-mono text-[11px] text-[#57534E]">
                          Cta Banesco Destino: {op.cuentaBanescoReceptora} (Ref #{op.referenciaBanesco})
                        </div>
                      </td>

                      <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                        <div className="font-mono font-bold text-[#14532D] text-sm">
                          Bs. {op.montoAnticipoVES.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="font-mono text-[11px] text-[#57534E]">
                          Tasa BCV: Bs. {op.tasaBcvAnticipo.toFixed(2)}
                        </div>
                      </td>

                      <td className="py-3 px-3 align-top max-w-[240px]">
                        <p className="text-xs text-[#44403C] leading-relaxed">
                          {op.propositoAnticipo}
                        </p>
                      </td>

                      <td className="py-3 px-3 align-top max-w-[220px]">
                        <div className="font-mono font-bold text-[#0C4A6E]">
                          USD {op.montoAdjudicadoUSD.toLocaleString('es-VE', { minimumFractionDigits: 2 })} ({op.codigoPactoBanesco})
                        </div>
                        <div className="text-[11px] font-semibold text-[#1C1917] mt-0.5">
                          {op.quintalesComprados} QQ · {op.origenCafe}
                        </div>
                        <div className="text-[11px] font-bold text-[#854D0E] mt-0.5">
                          Etapa {op.etapaTrazabilidad}/4 · {op.estadoContable}
                        </div>
                      </td>

                      <td
                        className="py-3 px-3 align-top text-right space-y-1.5 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onOpenReceipt(op.id)}
                          className="w-full px-2.5 py-1.5 bg-[#DCFCE7] text-[#14532D] border border-[#86EFAC] rounded-lg text-[11px] font-bold hover:bg-[#BBF7D0] transition-colors cursor-pointer"
                        >
                          Recibo {op.reciboAnticipoNro}
                        </button>
                        {op.etapaTrazabilidad < 4 && (
                          <button
                            onClick={() =>
                              handleSetTraceabilityStage(
                                op,
                                (op.etapaTrazabilidad + 1) as 1 | 2 | 3 | 4
                              )
                            }
                            className="w-full px-2.5 py-1.5 bg-[#1C1917] text-white rounded-lg text-[11px] font-semibold hover:bg-[#292524] transition-colors cursor-pointer"
                          >
                            Avanzar a Etapa {op.etapaTrazabilidad + 1}/4
                          </button>
                        )}
                        {onDeleteOperation && (
                          <button
                            onClick={() => onDeleteOperation(op.id)}
                            className="w-full px-2.5 py-1 bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5] rounded-lg text-[11px] font-semibold hover:bg-[#FECACA] transition-colors cursor-pointer"
                          >
                            Eliminar Registro
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MECANISMO DE TRAZABILIDAD INTERACTIVO DE 4 NODOS */}
      {auditOp && (
        <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-2xl p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#FED7AA]">
            <div>
              <div className="text-xs font-bold text-[#9A3412]">
                EMPRESA TITULAR: {getCompanyById(auditOp.empresaId).razonSocial} (RIF{' '}
                {getCompanyById(auditOp.empresaId).rif}) · ID ÚNICO:{' '}
                <span className="font-mono text-[#1C1917]">{auditOp.uidUnico}</span>
              </div>
              <h3 className="text-xl font-bold text-[#1C1917] font-display mt-0.5">
                Seguimiento Verificable de Fondos: {auditOp.clienteNombre} ({auditOp.clienteRif})
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#44403C]">Etapa Actual del Fondo:</span>
              {([1, 2, 3, 4] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => handleSetTraceabilityStage(auditOp, st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    auditOp.etapaTrazabilidad === st
                      ? 'bg-[#1C1917] text-white'
                      : 'bg-white border border-[#FDBA74] text-[#9A3412] hover:bg-[#FFEDD5]'
                  }`}
                >
                  Etapa {st}/4
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className={`rounded-2xl p-4 border ${
                auditOp.etapaTrazabilidad >= 1
                  ? 'bg-[#DCFCE7] border-[#86EFAC]'
                  : 'bg-white border-[#E7E5E4]'
              }`}
            >
              <div className="text-xs font-bold text-[#166534] mb-1">
                NODO 1 · RECEPCIÓN EN BANESCO (BS.)
              </div>
              <div className="text-sm font-bold text-[#14532D] font-mono">
                Bs. {auditOp.montoAnticipoVES.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </div>
              <div className="mt-2 space-y-1 text-xs text-[#166534]">
                <div>
                  <strong>Fecha/Hora:</strong> {formatDateDDMMYYYY(auditOp.fechaAnticipo)} {auditOp.horaTransferencia}
                </div>
                <div>
                  <strong>Banco Origen:</strong> {auditOp.bancoOrigen}
                </div>
                <div className="font-mono">
                  <strong>Cta Origen:</strong> {auditOp.numeroCuentaOrigen}
                </div>
                <div className="font-mono">
                  <strong>Cta Destino Banesco:</strong> {auditOp.cuentaBanescoReceptora}
                </div>
                <div className="font-mono">
                  <strong>Ref. Banesco:</strong> #{auditOp.referenciaBanesco}
                </div>
              </div>
            </div>

            <div
              className={`rounded-2xl p-4 border ${
                auditOp.etapaTrazabilidad >= 2
                  ? 'bg-[#E0F2FE] border-[#BAE6FD]'
                  : 'bg-white border-[#E7E5E4] opacity-75'
              }`}
            >
              <div className="text-xs font-bold text-[#0369A1] mb-1">
                NODO 2 · COMPRA DIVISAS BANESCO
              </div>
              <div className="text-sm font-bold text-[#0C4A6E] font-mono">
                USD {auditOp.montoAdjudicadoUSD.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </div>
              <div className="mt-2 space-y-1 text-xs text-[#0C4A6E]">
                <div>
                  <strong>Fecha/Hora Pacto:</strong> {formatDateDDMMYYYY(auditOp.fechaMesaCambio)} {auditOp.horaMesaCambio}
                </div>
                <div className="font-mono">
                  <strong>Código Pacto BCV:</strong> {auditOp.codigoPactoBanesco}
                </div>
                <div className="font-mono">
                  <strong>Tasa Mesa Cambio:</strong> Bs. {auditOp.tasaMesaCambio.toFixed(2)} / USD
                </div>
                <div className="font-mono">
                  <strong>Comisión (0.25%):</strong> Bs. {auditOp.comisionBanescoVES.toFixed(2)}
                </div>
                <div>
                  <strong>Abono en:</strong> {auditOp.cuentaBanescoDivisas}
                </div>
              </div>
            </div>

            <div
              className={`rounded-2xl p-4 border ${
                auditOp.etapaTrazabilidad >= 3
                  ? 'bg-[#FEF9C3] border-[#FEF08A]'
                  : 'bg-white border-[#E7E5E4] opacity-75'
              }`}
            >
              <div className="text-xs font-bold text-[#854D0E] mb-1">
                NODO 3 · COMPRA DE CAFÉ EN EL EXTERIOR
              </div>
              <div className="text-sm font-bold text-[#713F12] font-mono">
                {auditOp.quintalesComprados} QQ ({auditOp.quintalesComprados * 46} Kg)
              </div>
              <div className="mt-2 space-y-1 text-xs text-[#713F12]">
                <div>
                  <strong>Proveedor:</strong> {auditOp.proveedorExterior}
                </div>
                <div>
                  <strong>Origen:</strong> {auditOp.origenCafe}
                </div>
                <div className="font-mono">
                  <strong>Ref. Pago Exterior:</strong> {auditOp.referenciaPagoExterior}
                </div>
                <div className="font-mono">
                  <strong>Costo Café FOB:</strong> USD {auditOp.costoCafeUSD.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                </div>
                <div>
                  <strong>Permiso INSAI:</strong> {auditOp.permisoInsai}
                </div>
              </div>
            </div>

            <div
              className={`rounded-2xl p-4 border ${
                auditOp.etapaTrazabilidad >= 4
                  ? 'bg-[#FCE7F3] border-[#FBCFE8]'
                  : 'bg-white border-[#E7E5E4] opacity-75'
              }`}
            >
              <div className="text-xs font-bold text-[#9D174D] mb-1">
                NODO 4 · FACTURA SENIAT Y CIERRE
              </div>
              <div className="text-sm font-bold text-[#831843] font-mono">
                {auditOp.numeroFacturaSeniat}
              </div>
              <div className="mt-2 space-y-1 text-xs text-[#831843]">
                <div className="font-mono">
                  <strong>Café (Exento Art. 18):</strong> Bs.{' '}
                  {auditOp.subtotalCafeVES.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                </div>
                <div className="font-mono">
                  <strong>Flete Cobrado:</strong> Bs.{' '}
                  {auditOp.subtotalFleteVES.toLocaleString('es-VE', { minimumFractionDigits: 2 })} (USD{' '}
                  {auditOp.fleteInternacionalUSD.toFixed(2)})
                </div>
                <div className="font-mono">
                  <strong>Retención ISLR (3%):</strong> Bs.{' '}
                  {auditOp.retencionIslrFleteVES.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                </div>
                <div>
                  <strong>Estado Pasivo 2.1.04:</strong> {auditOp.estadoContable}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
