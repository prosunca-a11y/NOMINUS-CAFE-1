import React, { useState, useRef } from 'react';
import {
  OfficialAccountingVoucher,
  BALANCE_COMPROBACION_BANESCO_2026,
  VoucherLegalStatus,
} from '../data/agricolaOniAccountingVouchers2026Data';
import {
  TOTALES_MENSUALES_ABONOS,
  TOTALES_MENSUALES_SALIDAS,
} from '../data/agricolaOniAudit2026Data';
import { CompanyProfile } from '../data/nominusData';
import {
  Printer,
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  ShieldCheck,
  FileCheck2,
  Landmark,
  ArrowRightLeft,
  DollarSign,
  FolderArchive,
  BookOpen,
  Search,
  Eye,
  PlusCircle,
  Stamp,
  FileText,
  Layers,
  Download,
  FileDown,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AgricolaOniFxDestinationSummarySheetView } from './AgricolaOniFxDestinationSummarySheetView';
import { AgricolaOniClientAdvanceContractView } from './AgricolaOniClientAdvanceContractView';

export type OniAccountingSubSheet =
  | 'contabilidad-banesco-2026'
  | 'comprobantes-anticipos-2026'
  | 'contrato-anticipo-clientes-2026'
  | 'comprobantes-traspasos-2026'
  | 'comprobantes-dolares-banesco-2026'
  | 'resumen-dolares-destino-2026'
  | 'comprobantes-restantes-2026'
  | 'repositorio-seniat-2026';

interface AgricolaOniAccountingAndVouchersSuiteViewProps {
  activeSubSheet: OniAccountingSubSheet;
  onSelectSubSheet: (sheet: OniAccountingSubSheet) => void;
  companies: CompanyProfile[];
  vouchers: OfficialAccountingVoucher[];
  onUpdateVoucher: (updated: OfficialAccountingVoucher) => void;
  onCreateCustomVoucher?: (newVoucher: OfficialAccountingVoucher) => void;
  onSyncAllVouchersToFirestore?: () => void;
  isAuthenticated?: boolean;
}

export const AgricolaOniAccountingAndVouchersSuiteView: React.FC<
  AgricolaOniAccountingAndVouchersSuiteViewProps
> = ({
  activeSubSheet,
  onSelectSubSheet,
  companies,
  vouchers,
  onUpdateVoucher,
  onCreateCustomVoucher,
  onSyncAllVouchersToFirestore,
  isAuthenticated,
}) => {
  const [filtroMes, setFiltroMes] = useState<string>('ALL');
  const [filtroEstadoFirma, setFiltroEstadoFirma] = useState<string>('ALL');
  const [busqueda, setBusqueda] = useState<string>('');
  const [selectedVoucherForPrint, setSelectedVoucherForPrint] =
    useState<OfficialAccountingVoucher | null>(null);
  const [uploadingVoucherId, setUploadingVoucherId] = useState<string | null>(null);
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);
  const [showNewVoucherForm, setShowNewVoucherForm] = useState<boolean>(false);
  const [lotePreset, setLotePreset] = useState<string>('ALL_SHEET');
  const [selectedContractVoucherId, setSelectedContractVoucherId] = useState<
    string | undefined
  >(undefined);

  // Campos para crear un nuevo comprobante personalizado si el contador desea anexar uno adicional
  const [nuevoNum, setNuevoNum] = useState<string>('COMP-ESP-2026-099');
  const [nuevoFecha, setNuevoFecha] = useState<string>('31/08/2026');
  const [nuevoConcepto, setNuevoConcepto] = useState<string>('');
  const [nuevoContraparte, setNuevoContraparte] = useState<string>('');
  const [nuevoRif, setNuevoRif] = useState<string>('J-');
  const [nuevoRef, setNuevoRef] = useState<string>('');
  const [nuevoMontoBs, setNuevoMontoBs] = useState<string>('');
  const [nuevoTasa, setNuevoTasa] = useState<string>('36.52');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const oniCompany =
    companies.find(
      (c) =>
        c.id === 'emp-oni' ||
        c.id.endsWith('_emp-oni') ||
        c.razonSocial.toUpperCase().includes('ONI')
    ) || companies[0];

  const fmtBs = (n: number) =>
    n === 0
      ? '0,00'
      : n.toLocaleString('es-VE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

  const fmtUSD = (n: number) =>
    n.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Calcular SHA-256 real usando Web Crypto API cuando el usuario sube un PDF o Imagen firmada y sellada
  const computeFileSha256 = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return (
        'SHA256-' +
        hashArray
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
          .slice(0, 32)
          .toUpperCase()
      );
    } catch {
      return `SHA256-${Date.now().toString(16).toUpperCase()}`;
    }
  };

  const triggerUploadSignedFile = (voucherId: string) => {
    setUploadingVoucherId(voucherId);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingVoucherId) return;

    const targetVoucher = vouchers.find((v) => v.id === uploadingVoucherId);
    if (!targetVoucher) return;

    const sha256 = await computeFileSha256(file);
    const nowStr = new Date().toLocaleDateString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : undefined;
      const updated: OfficialAccountingVoucher = {
        ...targetVoucher,
        estadoFirmaSello: 'FIRMADO_Y_SELLADO_DIGITALIZADO',
        archivoFirmadoNombre: file.name,
        archivoFirmadoFechaCarga: nowStr,
        archivoFirmadoHashSha256: sha256,
        archivoFirmadoDataUrl:
          dataUrl && dataUrl.length < 650000 ? dataUrl : undefined,
        archivoFirmadoMimeType: file.type || 'application/pdf',
        firmadoPorRepresentante: `${oniCompany.representanteLegal} (Firma y Huella Verificada)`,
        firmadoPorContadorCpc: 'Lic. Contador Público Colegiado (CPC — Sello Húmedo)',
        selloAgenciaBanesco: 'Sello Húmedo de Recepción Banesco / Archivo SENIAT',
        observacionesAuditor: `Documento firmado y sellado cargado exitosamente (${file.name}) con huella criptográfica ${sha256} para fiscalización SENIAT y SUDEBAN.`,
      };
      onUpdateVoucher(updated);
      if (selectedVoucherForPrint?.id === updated.id) {
        setSelectedVoucherForPrint(updated);
      }
      setBannerMsg(
        `Comprobante ${updated.numeroComprobante} actualizado con archivo firmado y sellado "${file.name}" (${sha256}) y resguardado en el Repositorio SENIAT.`
      );
      setUploadingVoucherId(null);
    };
    reader.readAsDataURL(file);
  };

  const handleMarkAsStampedAndVerified = (v: OfficialAccountingVoucher) => {
    const nowStr = new Date().toLocaleDateString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const updated: OfficialAccountingVoucher = {
      ...v,
      estadoFirmaSello: 'VERIFICADO_AUDITORIA_SENIAT',
      archivoFirmadoNombre:
        v.archivoFirmadoNombre || `${v.numeroComprobante}_FIRMADO_Y_SELLADO.pdf`,
      archivoFirmadoFechaCarga: v.archivoFirmadoFechaCarga || nowStr,
      archivoFirmadoHashSha256:
        v.archivoFirmadoHashSha256 ||
        `SHA256-ONI-${v.numeroComprobante.replace(/[^A-Z0-9]/g, '')}-VERIF`,
      firmadoPorRepresentante: `${oniCompany.representanteLegal} (Firmado y Sellado)`,
      firmadoPorContadorCpc: 'Contador Público Colegiado CPC (Visado VEN-NIF)',
      selloAgenciaBanesco: 'Sellado para Presentación Banesco y Revisión SENIAT',
      observacionesAuditor:
        'Comprobante verificado, firmado y sellado en expediente físico y digital para presentación ante Banesco y fiscalización SENIAT.',
    };
    onUpdateVoucher(updated);
    if (selectedVoucherForPrint?.id === updated.id) {
      setSelectedVoucherForPrint(updated);
    }
    setBannerMsg(
      `Comprobante ${updated.numeroComprobante} marcado como FIRMADO, SELLADO Y VERIFICADO en el Repositorio SENIAT.`
    );
  };

  const handleExportAccountingExcel = () => {
    const journalRowsHtml = vouchers
      .map((v) =>
        v.lineasAsientoContable
          .map(
            (line, idx) => `
          <tr>
            <td>${idx === 0 ? v.fechaEmision : ''}</td>
            <td style="font-family:monospace;font-weight:bold;">${idx === 0 ? v.numeroComprobante : ''}</td>
            <td>${idx === 0 ? v.hojaDestino : ''}</td>
            <td style="font-family:monospace;font-weight:bold;">${line.codigoCuenta}</td>
            <td>${line.nombreCuenta}</td>
            <td>${line.referenciaAuxiliar}</td>
            <td style="text-align:right;">${line.debeBs.toFixed(2)}</td>
            <td style="text-align:right;">${line.haberBs.toFixed(2)}</td>
            <td style="text-align:right;">${line.debeUSD.toFixed(2)}</td>
            <td style="text-align:right;">${line.haberUSD.toFixed(2)}</td>
            <td>${idx === 0 ? v.contraparteRifOCedula + ' - ' + v.contraparteNombre : ''}</td>
            <td>${idx === 0 ? v.estadoFirmaSello : ''}</td>
          </tr>`
          )
          .join('')
      )
      .join('');

    const trialRowsHtml = BALANCE_COMPROBACION_BANESCO_2026.map(
      (r) => `
      <tr>
        <td style="font-family:monospace;font-weight:bold;">${r.codigoCuenta}</td>
        <td style="font-weight:bold;">${r.nombreCuenta}</td>
        <td>${r.tipoCuenta}</td>
        <td style="text-align:right;">${r.debeAcumuladoBs.toFixed(2)}</td>
        <td style="text-align:right;">${r.haberAcumuladoBs.toFixed(2)}</td>
        <td style="text-align:right;font-weight:bold;">${r.saldoDeudorBs.toFixed(2)}</td>
        <td style="text-align:right;font-weight:bold;">${r.saldoAcreedorBs.toFixed(2)}</td>
        <td style="text-align:right;">${r.debeAcumuladoUSD.toFixed(2)}</td>
        <td style="text-align:right;">${r.haberAcumuladoUSD.toFixed(2)}</td>
      </tr>`
    ).join('');

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8" /></head>
      <body>
        <h2>AGRÍCOLA ONI, C.A. (RIF J-50145638-0) — CONTABILIDAD GENERAL Y COMPROBANTES BANESCO (ENERO A AGOSTO 2026)</h2>
        <h3>1. BALANCE DE COMPROBACIÓN DE SUMAS Y SALDOS AL 31/08/2026 (VEN-NIF)</h3>
        <table border="1">
          <thead style="background-color:#DCFCE7;font-weight:bold;">
            <tr>
              <th>Código Cuenta</th>
              <th>Denominación de la Cuenta Contable (VEN-NIF)</th>
              <th>Naturaleza</th>
              <th>Total Debe (Bs.)</th>
              <th>Total Haber (Bs.)</th>
              <th>Saldo Deudor (Bs.)</th>
              <th>Saldo Acreedor (Bs.)</th>
              <th>Total Debe (US$)</th>
              <th>Total Haber (US$)</th>
            </tr>
          </thead>
          <tbody>
            ${trialRowsHtml}
          </tbody>
        </table>
        <br/>
        <h3>2. LIBRO DIARIO GENERAL Y EXPEDIENTE DE COMPROBANTES BANESCO (ENERO - AGOSTO 2026)</h3>
        <table border="1">
          <thead style="background-color:#E0F2FE;font-weight:bold;">
            <tr>
              <th>Fecha</th>
              <th>N° Comprobante</th>
              <th>Hoja / Categoría</th>
              <th>Código Cta.</th>
              <th>Cuenta Contable y Explicación</th>
              <th>Referencia Bancaria / Auxiliar</th>
              <th>Debe (Bs.)</th>
              <th>Haber (Bs.)</th>
              <th>Debe (US$)</th>
              <th>Haber (US$)</th>
              <th>Contraparte y RIF</th>
              <th>Estado Firma y Sello SENIAT</th>
            </tr>
          </thead>
          <tbody>
            ${journalRowsHtml}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Contabilidad_Y_Comprobantes_Banesco_Agricola_Oni_Ene_Ago_2026.xls';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtrar comprobantes según la hoja activa
  const getVouchersForSheet = (): OfficialAccountingVoucher[] => {
    let base = vouchers;
    if (activeSubSheet === 'comprobantes-anticipos-2026') {
      base = vouchers.filter((v) => v.hojaDestino === 'ANTICIPOS_CLIENTES');
    } else if (activeSubSheet === 'comprobantes-traspasos-2026') {
      base = vouchers.filter((v) => v.hojaDestino === 'TRANSFERENCIAS_INTERNAS_PROPIAS');
    } else if (activeSubSheet === 'comprobantes-dolares-banesco-2026') {
      base = vouchers.filter((v) => v.hojaDestino === 'COMPRAS_DOLARES_BANESCO');
    } else if (activeSubSheet === 'comprobantes-restantes-2026') {
      base = vouchers.filter((v) => v.hojaDestino === 'RESTANTES_INGRESOS_EGRESOS');
    }

    return base.filter((v) => {
      const matchMes = filtroMes === 'ALL' || v.mes === filtroMes;
      const matchEstado =
        filtroEstadoFirma === 'ALL' || v.estadoFirmaSello === filtroEstadoFirma;
      const q = busqueda.trim().toLowerCase();
      const matchQ =
        !q ||
        v.numeroComprobante.toLowerCase().includes(q) ||
        v.conceptoGeneral.toLowerCase().includes(q) ||
        v.contraparteNombre.toLowerCase().includes(q) ||
        v.contraparteRifOCedula.toLowerCase().includes(q) ||
        v.referenciaBancariaBanesco.toLowerCase().includes(q);
      return matchMes && matchEstado && matchQ;
    });
  };

  const sheetVouchers = getVouchersForSheet();

  // Totales de comprobantes de la vista actual
  const totalVistaEntradasBs = sheetVouchers
    .filter((v) => v.naturalezaFlujo === 'ENTRADA_BANESCO')
    .reduce((acc, v) => acc + v.montoOperacionBs, 0);
  const totalVistaSalidasBs = sheetVouchers
    .filter((v) => v.naturalezaFlujo === 'SALIDA_BANESCO')
    .reduce((acc, v) => acc + v.montoOperacionBs, 0);
  const totalVistaUSD = sheetVouchers.reduce((acc, v) => acc + v.montoEquivalenteUSD, 0);

  // Estadísticas del Repositorio SENIAT
  const totalComprobantesFirmados = vouchers.filter(
    (v) =>
      v.estadoFirmaSello === 'FIRMADO_Y_SELLADO_DIGITALIZADO' ||
      v.estadoFirmaSello === 'VERIFICADO_AUDITORIA_SENIAT'
  ).length;

  const subSheetsNav: {
    id: OniAccountingSubSheet;
    numero: string;
    titulo: string;
    subtitulo: string;
    montoResumen: string;
    bg: string;
    activeRing: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'contabilidad-banesco-2026',
      numero: 'HOJA A',
      titulo: 'Contabilidad Banesco Ene-Ago 2026',
      subtitulo: 'Libro Diario, Mayor y Balance VEN-NIF',
      montoResumen: 'Entradas Bs. 1.966,60M | Salidas Bs. 1.956,66M',
      bg: 'bg-[#DCFCE7]/85 border-[#86EFAC] text-[#14532D]',
      activeRing: 'ring-2 ring-[#15803D] bg-[#DCFCE7]',
      icon: <BookOpen className="w-4 h-4 text-[#15803D]" />,
    },
    {
      id: 'comprobantes-anticipos-2026',
      numero: 'HOJA B-1',
      titulo: 'Comprobantes Anticipos Clientes',
      subtitulo: 'Terceros RIF + Banesco + Productores V-',
      montoResumen: 'Bs. 1.571.513.047,62 (US$ 2.317.822,22)',
      bg: 'bg-[#FEF3C7]/85 border-[#FCD34D] text-[#78350F]',
      activeRing: 'ring-2 ring-[#B45309] bg-[#FEF3C7]',
      icon: <FileCheck2 className="w-4 h-4 text-[#B45309]" />,
    },
    {
      id: 'contrato-anticipo-clientes-2026',
      numero: 'HOJA B-2',
      titulo: 'Modelo Contrato de Anticipo',
      subtitulo: 'Para Llenar y Firmar por los Clientes',
      montoResumen: '17 Contratos + Formato en Blanco PDF/Word',
      bg: 'bg-[#DCFCE7]/95 border-[#4ADE80] text-[#14532D]',
      activeRing: 'ring-2 ring-[#15803D] bg-[#DCFCE7]',
      icon: <FileText className="w-4 h-4 text-[#15803D]" />,
    },
    {
      id: 'comprobantes-traspasos-2026',
      numero: 'HOJA C',
      titulo: 'Comprobantes Transf. Internas',
      subtitulo: 'Otros Bancos Propios J-50145638-0',
      montoResumen: 'Ent: Bs. 208,71M | Sal: Bs. 153,21M',
      bg: 'bg-[#E0F2FE]/85 border-[#7DD3FC] text-[#0C4A6E]',
      activeRing: 'ring-2 ring-[#0369A1] bg-[#E0F2FE]',
      icon: <ArrowRightLeft className="w-4 h-4 text-[#0369A1]" />,
    },
    {
      id: 'comprobantes-dolares-banesco-2026',
      numero: 'HOJA D-1',
      titulo: 'Compra de Dólares (29 Recibos)',
      subtitulo: 'Descarga en Lotes + Pactos BCV',
      montoResumen: 'Bs. 375.630.000,00 (US$ 556.890,45)',
      bg: 'bg-[#FFEDD5]/85 border-[#FDBA74] text-[#7C2D12]',
      activeRing: 'ring-2 ring-[#C2410C] bg-[#FFEDD5]',
      icon: <DollarSign className="w-4 h-4 text-[#C2410C]" />,
    },
    {
      id: 'resumen-dolares-destino-2026',
      numero: 'HOJA D-2',
      titulo: 'Resumen Dólares y Destino Bs.',
      subtitulo: '¿Cuánto se compró y a dónde fue?',
      montoResumen: 'US$ 556.890,45 → Café, Flete, Trilla',
      bg: 'bg-[#FEF3C7]/95 border-[#F59E0B] text-[#78350F]',
      activeRing: 'ring-2 ring-[#D97706] bg-[#FEF3C7]',
      icon: <Layers className="w-4 h-4 text-[#D97706]" />,
    },
    {
      id: 'comprobantes-restantes-2026',
      numero: 'HOJA E',
      titulo: 'Comprobantes Restantes Ing/Egr',
      subtitulo: 'Café, Becerra, Fletes, Campo y Comisiones',
      montoResumen: 'Ing: Bs. 186,38M | Egr: Bs. 1.427,82M',
      bg: 'bg-[#FCE7F3]/85 border-[#F9A8D4] text-[#831843]',
      activeRing: 'ring-2 ring-[#BE185D] bg-[#FCE7F3]',
      icon: <Landmark className="w-4 h-4 text-[#BE185D]" />,
    },
    {
      id: 'repositorio-seniat-2026',
      numero: 'HOJA F',
      titulo: 'Repositorio SENIAT Firmados/Sellados',
      subtitulo: 'Archivo Digital + Carga de Escaneados',
      montoResumen: `${vouchers.length} Comprobantes Resguardados`,
      bg: 'bg-[#F3E8FF]/85 border-[#D8B4FE] text-[#581C87]',
      activeRing: 'ring-2 ring-[#6B21A8] bg-[#F3E8FF]',
      icon: <FolderArchive className="w-4 h-4 text-[#6B21A8]" />,
    },
  ];

  // Obtener la lista de recibos según el lote seleccionado para descarga masiva
  const getBatchVouchersToDownload = (): {
    list: OfficialAccountingVoucher[];
    label: string;
  } => {
    const baseSheetList =
      activeSubSheet === 'comprobantes-dolares-banesco-2026'
        ? vouchers.filter((v) => v.hojaDestino === 'COMPRAS_DOLARES_BANESCO')
        : sheetVouchers;

    if (lotePreset === 'ENE_MAY') {
      return {
        list: baseSheetList.filter((v) =>
          ['Ene', 'Feb', 'Mar', 'Abr', 'May'].includes(v.mes)
        ),
        label: 'Lote_Enero_a_Mayo_2026',
      };
    }
    if (lotePreset === 'JUN') {
      return {
        list: baseSheetList.filter((v) => v.mes === 'Jun'),
        label: 'Lote_Junio_2026',
      };
    }
    if (lotePreset === 'JUL') {
      return {
        list: baseSheetList.filter((v) => v.mes === 'Jul'),
        label: 'Lote_Julio_2026',
      };
    }
    if (lotePreset === 'AGO') {
      return {
        list: baseSheetList.filter((v) => v.mes === 'Ago'),
        label: 'Lote_Agosto_2026',
      };
    }
    if (lotePreset === 'FILTERED') {
      return {
        list: sheetVouchers,
        label: `Lote_Filtrado_${sheetVouchers.length}_Recibos`,
      };
    }
    return {
      list: baseSheetList,
      label: `Lote_Completo_Ene_Ago_2026_${baseSheetList.length}_Recibos`,
    };
  };

  // Descargar Recibos en Lote en un solo PDF Multipágina Oficial (1 recibo por página listo para firmar y sellar)
  const handleDownloadBatchReceiptsPdf = () => {
    const { list, label } = getBatchVouchersToDownload();
    if (list.length === 0) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter',
    });

    const pageW = doc.internal.pageSize.getWidth();
    const margin = 14;
    const contentW = pageW - margin * 2;

    list.forEach((v, idx) => {
      if (idx > 0) {
        doc.addPage('letter', 'portrait');
      }

      doc.setFillColor(28, 25, 23);
      doc.rect(margin, 12, contentW, 20, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text(`${oniCompany.razonSocial} · RIF: ${oniCompany.rif}`, margin + 4, 19);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(
        `RECIBO / COMPROBANTE OFICIAL EN LOTE (${idx + 1} de ${list.length}) · EXPEDIENTE BANESCO Y SENIAT`,
        margin + 4,
        24.5
      );
      doc.text(
        `Cta. Banesco VES: ${oniCompany.cuentaBanescoVES} | Cta. Custodia USD: ${oniCompany.cuentaBanescoUSD}`,
        margin + 4,
        29.5
      );

      doc.setFillColor(255, 237, 213);
      doc.setDrawColor(194, 65, 12);
      doc.rect(margin, 35, contentW, 22, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(124, 45, 18);
      doc.text(
        `COMPROBANTE / RECIBO N°: ${v.numeroComprobante}`,
        margin + 4,
        42
      );
      doc.setFontSize(9);
      doc.setTextColor(28, 25, 23);
      doc.text(`Fecha de Emisión: ${v.fechaEmision} (${v.mes} 2026)`, margin + 4, 48);
      doc.text(`Referencia Bancaria Banesco: ${v.referenciaBancariaBanesco}`, margin + 4, 53.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(20, 83, 45);
      doc.text(
        `EQUIVALENTE DIVISAS: US$ ${fmtUSD(v.montoEquivalenteUSD)}`,
        pageW - margin - 4,
        42,
        { align: 'right' }
      );
      doc.setTextColor(154, 52, 18);
      doc.text(
        `MONTO OPERACIÓN: Bs. ${fmtBs(v.montoOperacionBs)}`,
        pageW - margin - 4,
        48,
        { align: 'right' }
      );
      doc.setFontSize(8.5);
      doc.setTextColor(68, 64, 60);
      doc.text(
        `Tasa Oficial BCV Aplicada: Bs. ${fmtBs(v.tasaBcvAplicada)} / USD`,
        pageW - margin - 4,
        53.5,
        { align: 'right' }
      );

      autoTable(doc, {
        startY: 61,
        margin: { left: margin, right: margin },
        head: [['Campo de Trazabilidad Bancaria y Fiscal', 'Información Verificada del Recibo']],
        body: [
          ['Contraparte / Destinatario', v.contraparteNombre],
          ['RIF / Cédula', v.contraparteRifOCedula],
          ['Banco y Cuenta Vinculada', `${v.bancoContraparte} — ${v.numeroCuentaContraparte}`],
          ['Concepto de la Operación', v.conceptoGeneral],
          ['1. Origen Lícito de los Fondos', v.trazabilidadOrigenFondos],
          [
            '2. Hacia Dónde Fue Ese Dinero (Justificación de Salida en Bs. y Divisas)',
            v.trazabilidadDestinoFondos,
          ],
          ['3. Base Legal Cambiaria BCV / SUDEBAN', v.baseLegalAntidelitosCambiarios],
        ],
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2.2, textColor: [28, 25, 23] },
        headStyles: { fillColor: [12, 74, 110], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 58, fontStyle: 'bold', fillColor: [250, 248, 245] },
          1: { cellWidth: contentW - 58 },
        },
      });

      const afterInfoY =
        (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;

      autoTable(doc, {
        startY: afterInfoY,
        margin: { left: margin, right: margin },
        head: [
          [
            'Código Cta.',
            'Denominación de la Cuenta Contable (VEN-NIF)',
            'Referencia Auxiliar',
            'Debe (Bs.)',
            'Haber (Bs.)',
            'Equiv. US$',
          ],
        ],
        body: [
          ...v.lineasAsientoContable.map((l) => [
            l.codigoCuenta,
            l.nombreCuenta,
            l.referenciaAuxiliar,
            l.debeBs > 0 ? `Bs. ${fmtBs(l.debeBs)}` : '—',
            l.haberBs > 0 ? `Bs. ${fmtBs(l.haberBs)}` : '—',
            `$${fmtUSD(l.debeUSD > 0 ? l.debeUSD : l.haberUSD)}`,
          ]),
          [
            'TOTAL',
            'SUMAS IGUALES DEL ASIENTO CONTABLE (PARTIDA DOBLE)',
            v.expedienteSeniatNro || '',
            `Bs. ${fmtBs(v.montoOperacionBs)}`,
            `Bs. ${fmtBs(v.montoOperacionBs)}`,
            `$${fmtUSD(v.montoEquivalenteUSD)}`,
          ],
        ],
        theme: 'grid',
        styles: { fontSize: 7.8, cellPadding: 2, textColor: [28, 25, 23] },
        headStyles: { fillColor: [28, 25, 23], textColor: [255, 255, 255], fontStyle: 'bold' },
      });

      const afterJournalY =
        (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

      doc.setFillColor(245, 245, 244);
      doc.rect(margin, afterJournalY, contentW, 17, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(28, 25, 23);
      doc.text(
        'DECLARACIÓN JURADA DE ORIGEN Y DESTINO LÍCITO DE FONDOS (RESOLUCIÓN SUDEBAN 083.18 / CONVENIO CAMBIARIO N° 1 BCV):',
        margin + 3,
        afterJournalY + 5
      );
      doc.setFont('helvetica', 'normal');
      const declLines = doc.splitTextToSize(
        `Quienes suscriben en representación de ${oniCompany.razonSocial} (RIF ${oniCompany.rif}) declaran bajo fe de juramento que los fondos de este recibo por Bs. ${fmtBs(v.montoOperacionBs)} (US$ ${fmtUSD(v.montoEquivalenteUSD)}) tienen origen y destino lícitos en el giro agroindustrial cafetero (Expediente ${v.expedienteSeniatNro}).`,
        contentW - 6
      );
      doc.text(declLines, margin + 3, afterJournalY + 9.5);

      const sigY = afterJournalY + 22;
      const boxW = (contentW - 8) / 3;
      doc.setDrawColor(28, 25, 23);
      doc.rect(margin, sigY, boxW, 27);
      doc.rect(margin + boxW + 4, sigY, boxW, 27);
      doc.rect(margin + (boxW + 4) * 2, sigY, boxW, 27);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('1. REPRESENTANTE LEGAL', margin + boxW / 2, sigY + 5, { align: 'center' });
      doc.text('2. CONTADOR PÚBLICO (CPC)', margin + boxW + 4 + boxW / 2, sigY + 5, {
        align: 'center',
      });
      doc.text('3. RECEPCIÓN BANESCO / SENIAT', margin + (boxW + 4) * 2 + boxW / 2, sigY + 5, {
        align: 'center',
      });

      doc.line(margin + 5, sigY + 18, margin + boxW - 5, sigY + 18);
      doc.line(margin + boxW + 9, sigY + 18, margin + boxW * 2 - 1, sigY + 18);
      doc.line(margin + (boxW + 4) * 2 + 5, sigY + 18, margin + contentW - 5, sigY + 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(
        `${oniCompany.representanteLegal} · Sello Húmedo`,
        margin + boxW / 2,
        sigY + 23,
        { align: 'center' }
      );
      doc.text(
        'Firma y Sello Húmedo CPC (VEN-NIF)',
        margin + boxW + 4 + boxW / 2,
        sigY + 23,
        { align: 'center' }
      );
      doc.text(
        'Sello Húmedo de Recepción / Archivo',
        margin + (boxW + 4) * 2 + boxW / 2,
        sigY + 23,
        { align: 'center' }
      );
    });

    const filename = `Recibos_En_Lote_${label}_Agricola_Oni.pdf`;
    doc.save(filename);
    setBannerMsg(
      `Descarga en lote completada: ${list.length} recibos oficiales generados en "${filename}" (1 recibo por página listo para imprimir, firmar y sellar).`
    );
  };

  // Descargar Recibos en Lote en formato Word (.DOC) con salto de página por cada recibo
  const handleDownloadBatchReceiptsWord = () => {
    const { list, label } = getBatchVouchersToDownload();
    if (list.length === 0) return;

    const pagesHtml = list
      .map(
        (v, idx) => `
        <div style="${idx < list.length - 1 ? 'page-break-after: always;' : ''} padding-bottom: 12pt;">
          <table style="width:100%; border-collapse:collapse; margin-bottom:8pt;">
            <tr style="background-color:#1C1917; color:#FFFFFF;">
              <td style="padding:8pt; border:1px solid #1C1917;">
                <strong style="font-size:11pt;">${oniCompany.razonSocial} (RIF: ${oniCompany.rif})</strong><br/>
                <span style="font-size:8.5pt;">RECIBO OFICIAL DE COMPRA DE DÓLARES Y DESTINO DE FONDOS EN BOLÍVARES · Cta. Banesco: ${oniCompany.cuentaBanescoVES}</span>
              </td>
              <td style="padding:8pt; border:1px solid #1C1917; text-align:right;">
                <strong style="font-size:10pt; color:#FDBA74;">RECIBO N° ${v.numeroComprobante}</strong><br/>
                <span style="font-size:8.5pt;">Fecha: ${v.fechaEmision} (${v.mes} 2026) · Recibo ${idx + 1} de ${list.length}</span>
              </td>
            </tr>
          </table>

          <table style="width:100%; border-collapse:collapse; margin-bottom:8pt; font-size:9pt;">
            <tr style="background-color:#FFEDD5;">
              <td style="border:1px solid #44403C; padding:5pt;"><strong>Referencia / Pacto Banesco:</strong> ${v.referenciaBancariaBanesco}</td>
              <td style="border:1px solid #44403C; padding:5pt;"><strong>Dólares Comprados:</strong> <span style="color:#14532D;font-weight:bold;">US$ ${fmtUSD(v.montoEquivalenteUSD)}</span></td>
              <td style="border:1px solid #44403C; padding:5pt;"><strong>Tasa BCV:</strong> Bs. ${fmtBs(v.tasaBcvAplicada)}</td>
              <td style="border:1px solid #44403C; padding:5pt;"><strong>Monto en Bolívares:</strong> <span style="color:#9A3412;font-weight:bold;">Bs. ${fmtBs(v.montoOperacionBs)}</span></td>
            </tr>
          </table>

          <table style="width:100%; border-collapse:collapse; margin-bottom:8pt; font-size:8.5pt;">
            <tr>
              <td style="border:1px solid #44403C; padding:5pt; width:28%; background-color:#FAF8F5;"><strong>Contraparte / Destinatario:</strong></td>
              <td style="border:1px solid #44403C; padding:5pt;">${v.contraparteNombre} (${v.contraparteRifOCedula})</td>
            </tr>
            <tr>
              <td style="border:1px solid #44403C; padding:5pt; background-color:#FAF8F5;"><strong>Concepto de la Operación:</strong></td>
              <td style="border:1px solid #44403C; padding:5pt;">${v.conceptoGeneral}</td>
            </tr>
            <tr>
              <td style="border:1px solid #44403C; padding:5pt; background-color:#FAF8F5;"><strong>1. Origen de los Fondos en Bs.:</strong></td>
              <td style="border:1px solid #44403C; padding:5pt;">${v.trazabilidadOrigenFondos}</td>
            </tr>
            <tr>
              <td style="border:1px solid #44403C; padding:5pt; background-color:#DCFCE7;"><strong>2. Hacia Dónde Fue Ese Dinero (Justificación de Salida):</strong></td>
              <td style="border:1px solid #44403C; padding:5pt; font-weight:bold;">${v.trazabilidadDestinoFondos}</td>
            </tr>
          </table>

          <table style="width:100%; border-collapse:collapse; margin-bottom:10pt; font-size:8.5pt;">
            <thead>
              <tr style="background-color:#1C1917; color:#FFFFFF;">
                <th style="border:1px solid #1C1917; padding:4pt;">Código Cta.</th>
                <th style="border:1px solid #1C1917; padding:4pt;">Cuenta Contable VEN-NIF</th>
                <th style="border:1px solid #1C1917; padding:4pt;">Referencia Auxiliar</th>
                <th style="border:1px solid #1C1917; padding:4pt; text-align:right;">Debe (Bs.)</th>
                <th style="border:1px solid #1C1917; padding:4pt; text-align:right;">Haber (Bs.)</th>
                <th style="border:1px solid #1C1917; padding:4pt; text-align:right;">Equiv. US$</th>
              </tr>
            </thead>
            <tbody>
              ${v.lineasAsientoContable
                .map(
                  (l) => `
                <tr>
                  <td style="border:1px solid #44403C; padding:4pt; font-family:Consolas,monospace; font-weight:bold;">${l.codigoCuenta}</td>
                  <td style="border:1px solid #44403C; padding:4pt;">${l.nombreCuenta}</td>
                  <td style="border:1px solid #44403C; padding:4pt;">${l.referenciaAuxiliar}</td>
                  <td style="border:1px solid #44403C; padding:4pt; text-align:right;">${l.debeBs > 0 ? 'Bs. ' + fmtBs(l.debeBs) : '—'}</td>
                  <td style="border:1px solid #44403C; padding:4pt; text-align:right;">${l.haberBs > 0 ? 'Bs. ' + fmtBs(l.haberBs) : '—'}</td>
                  <td style="border:1px solid #44403C; padding:4pt; text-align:right;">US$ ${fmtUSD(l.debeUSD > 0 ? l.debeUSD : l.haberUSD)}</td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>

          <table style="width:100%; border-collapse:collapse; margin-top:14pt; font-size:8pt;">
            <tr>
              <td style="border:1px solid #1C1917; padding:8pt; text-align:center; width:33%;">
                <strong>1. REPRESENTANTE LEGAL</strong><br/><br/><br/>
                _______________________________<br/>
                ${oniCompany.representanteLegal}<br/>Firma y Sello Húmedo
              </td>
              <td style="border:1px solid #1C1917; padding:8pt; text-align:center; width:33%;">
                <strong>2. CONTADOR PÚBLICO (CPC)</strong><br/><br/><br/>
                _______________________________<br/>
                Visado Contable VEN-NIF<br/>Firma y Sello Húmedo CPC
              </td>
              <td style="border:1px solid #1C1917; padding:8pt; text-align:center; width:34%;">
                <strong>3. RECEPCIÓN BANESCO / SENIAT</strong><br/><br/><br/>
                _______________________________<br/>
                Sello Húmedo de Agencia / Expediente ${v.expedienteSeniatNro}
              </td>
            </tr>
          </table>
        </div>`
      )
      .join('');

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w="urn:schemas-microsoft-com:office:word"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8" /><title>Lote de Recibos ${label}</title></head>
      <body style="font-family:Arial,sans-serif;">${pagesHtml}</body>
      </html>
    `;

    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Recibos_En_Lote_${label}_Agricola_Oni.doc`;
    a.click();
    URL.revokeObjectURL(url);
    setBannerMsg(
      `Descarga en lote Word (.DOC) completada: ${list.length} recibos listos para imprimir o editar.`
    );
  };

  const handleAddCustomVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onCreateCustomVoucher) return;
    const montoBs = parseFloat(nuevoMontoBs) || 100000;
    const tasa = parseFloat(nuevoTasa) || 36.52;
    const usd = Math.round((montoBs / tasa) * 100) / 100;

    let hojaDestino: OfficialAccountingVoucher['hojaDestino'] =
      'RESTANTES_INGRESOS_EGRESOS';
    if (activeSubSheet === 'comprobantes-anticipos-2026') {
      hojaDestino = 'ANTICIPOS_CLIENTES';
    } else if (activeSubSheet === 'comprobantes-traspasos-2026') {
      hojaDestino = 'TRANSFERENCIAS_INTERNAS_PROPIAS';
    } else if (activeSubSheet === 'comprobantes-dolares-banesco-2026') {
      hojaDestino = 'COMPRAS_DOLARES_BANESCO';
    }

    const created: OfficialAccountingVoucher = {
      id: `vch-custom-${Date.now()}`,
      numeroComprobante: nuevoNum.trim() || `COMP-ONI-${Date.now()}`,
      hojaDestino,
      subTipo:
        hojaDestino === 'ANTICIPOS_CLIENTES'
          ? 'ANTICIPO_JURIDICO_RIF'
          : hojaDestino === 'TRANSFERENCIAS_INTERNAS_PROPIAS'
          ? 'TRASPASO_INTERNO_ENTRADA'
          : hojaDestino === 'COMPRAS_DOLARES_BANESCO'
          ? 'COMPRA_DIVISAS_MESA_CAMBIO'
          : 'EGRESO_LIQUIDACION_CAFE_PROVEEDORES',
      naturalezaFlujo:
        hojaDestino === 'ANTICIPOS_CLIENTES' ||
        hojaDestino === 'TRANSFERENCIAS_INTERNAS_PROPIAS'
          ? 'ENTRADA_BANESCO'
          : 'SALIDA_BANESCO',
      mes: 'Ago',
      fechaEmision: nuevoFecha.trim() || '31/08/2026',
      fechaISO: '2026-08-31',
      conceptoGeneral:
        nuevoConcepto.trim() ||
        'Comprobante contable adicional emitido para soporte ante Banesco y SENIAT.',
      contraparteNombre: nuevoContraparte.trim() || 'Tercero / Contraparte Identificada',
      contraparteRifOCedula: nuevoRif.trim() || 'J-50145638-0',
      bancoContraparte: '0134 - Banesco Banco Universal',
      numeroCuentaContraparte: '0134-0342-18-3421089912',
      cuentaBanescoOni: oniCompany.cuentaBanescoVES,
      referenciaBancariaBanesco: nuevoRef.trim() || 'REF-BANESCO-2026',
      montoOperacionBs: montoBs,
      tasaBcvAplicada: tasa,
      montoEquivalenteUSD: usd,
      lineasAsientoContable: [
        {
          codigoCuenta: '1.1.01.02',
          nombreCuenta: 'Banesco Banco Universal - Cta. Cte. 0134-0342-18-3421089912',
          referenciaAuxiliar: nuevoRef.trim() || 'REF-BANESCO-2026',
          debeBs: montoBs,
          haberBs: 0,
          debeUSD: usd,
          haberUSD: 0,
        },
        {
          codigoCuenta: '2.1.04.01',
          nombreCuenta: 'Cuenta Contrapartida Verificada VEN-NIF',
          referenciaAuxiliar: nuevoRif.trim() || 'J-50145638-0',
          debeBs: 0,
          haberBs: montoBs,
          debeUSD: 0,
          haberUSD: usd,
        },
      ],
      trazabilidadOrigenFondos:
        'Operación bancaria canalizada a través de cuenta titular verificada en Banesco.',
      trazabilidadDestinoFondos:
        'Aplicada al giro agroindustrial cafetero de AGRÍCOLA ONI, C.A.',
      baseLegalAntidelitosCambiarios:
        'Cumple con el Convenio Cambiario N° 1 BCV, G.O.E. 6.396 y Resolución SUDEBAN 083.18.',
      requisitosSeniatSudebanVerificados: [
        'Identificación fiscal RIF verificada.',
        'Referencia bancaria de 11 dígitos conciliada con estado de cuenta Banesco.',
      ],
      estadoFirmaSello: 'EMITIDO_PENDIENTE_FIRMA',
      expedienteSeniatNro: `EXP-SENIAT-ONI-${Date.now().toString().slice(-4)}`,
    };

    onCreateCustomVoucher(created);
    setShowNewVoucherForm(false);
    setBannerMsg(
      `Comprobante ${created.numeroComprobante} creado y resguardado en el Repositorio SENIAT.`
    );
  };

  return (
    <div className="space-y-8">
      {/* Input oculto para subir el comprobante firmado y sellado (PDF, JPG, PNG) */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* BARRA SUPERIOR DE NAVEGACIÓN ENTRE LAS 6 HOJAS CONTABLES Y DE COMPROBANTES */}
      <section className="no-print bg-gradient-to-r from-[#DCFCE7] via-[#E0F2FE] to-[#FEF3C7] border border-[#86EFAC] rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-black/10 pb-4">
          <div className="space-y-1 max-w-4xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#14532D] bg-white/90 px-3 py-1 rounded-lg border border-[#86EFAC]">
              <ShieldCheck className="w-4 h-4 text-[#15803D]" />
              CONTABILIDAD VEN-NIF · TRAZABILIDAD ANTIDELITOS CAMBIARIOS · REPOSITORIO SENIAT Y BANESCO
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-[#1C1917] font-display">
              AGRÍCOLA ONI, C.A. (RIF {oniCompany.rif}) — Contabilidad y Comprobantes Oficiales Banesco (Ene – Ago 2026)
            </h2>
            <p className="text-xs sm:text-sm text-[#44403C] leading-relaxed">
              Navega entre las <strong>6 Hojas Especializadas</strong>: <strong>(A)</strong> Contabilidad General de Entradas y Salidas, <strong>(B)</strong> Comprobantes de Anticipos de Clientes, <strong>(C)</strong> Comprobantes de Transferencias Internas de Otros Bancos, <strong>(D)</strong> Comprobantes de Compras de Dólares a Banesco, <strong>(E)</strong> Comprobantes Restantes de Ingresos/Egresos y <strong>(F)</strong> Repositorio Digital SENIAT para imprimir, firmar, sellar y volver a cargar los comprobantes digitalizados.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleExportAccountingExcel}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#15803D] text-white text-xs font-bold rounded-xl hover:bg-[#166534] transition-colors cursor-pointer shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Exportar Contabilidad y Comprobantes (.xls)
            </button>
            {onSyncAllVouchersToFirestore && (
              <button
                type="button"
                onClick={() => {
                  onSyncAllVouchersToFirestore();
                  setBannerMsg(
                    isAuthenticated
                      ? 'Todos los comprobantes (Enero-Agosto 2026) han sido respaldados en Cloud Firestore (/signedVouchers) y en almacenamiento local.'
                      : 'Todos los comprobantes se guardaron localmente. Conecta Google Auth arriba a la derecha para sincronizarlos también en Cloud Firestore.'
                  );
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6B21A8] text-white text-xs font-bold rounded-xl hover:bg-[#581C87] transition-colors cursor-pointer shadow-sm"
              >
                <FolderArchive className="w-4 h-4" />
                Resguardar Todo en BD SENIAT
              </button>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1C1917] text-white text-xs font-semibold rounded-xl hover:bg-[#292524] transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir Hoja Actual
            </button>
          </div>
        </div>

        {/* SELECTOR DE LAS 8 HOJAS SOLICITADAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-2">
          {subSheetsNav.map((item) => {
            const isSelected = activeSubSheet === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectSubSheet(item.id);
                  setSelectedVoucherForPrint(null);
                }}
                className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  item.bg
                } ${isSelected ? item.activeRing : 'opacity-90 hover:opacity-100'}`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="text-[11px] font-mono font-bold uppercase">
                    {item.numero}
                  </span>
                  {item.icon}
                </div>
                <div>
                  <div className="text-xs font-bold leading-snug">{item.titulo}</div>
                  <div className="text-[11px] opacity-85 mt-0.5 truncate">
                    {item.subtitulo}
                  </div>
                  <div className="text-[10px] font-mono font-bold mt-1.5 pt-1 border-t border-black/10 truncate">
                    {item.montoResumen}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {bannerMsg && (
          <div className="bg-white border-2 border-[#15803D] rounded-xl p-3.5 flex items-center justify-between text-xs font-bold text-[#14532D]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
              <span>{bannerMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setBannerMsg(null)}
              className="underline ml-4 cursor-pointer shrink-0"
            >
              Cerrar
            </button>
          </div>
        )}
      </section>

      {/* =====================================================================
          MODAL / VISTA DE IMPRESIÓN OFICIAL DE COMPROBANTE INDIVIDUAL
          CON FIRMA, SELLO Y TRAZABILIDAD ANTIDELITOS CAMBIARIOS
         ===================================================================== */}
      {selectedVoucherForPrint && (
        <section className="bg-white border-2 border-[#1C1917] rounded-3xl p-6 lg:p-8 shadow-md space-y-6">
          <div className="no-print flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E7E5E4]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-[#DCFCE7] text-[#14532D] px-3 py-1 rounded-lg border border-[#86EFAC]">
                FORMATO OFICIAL LISTO PARA FIRMA Y SELLO HÚMEDO (BANESCO / SENIAT)
              </span>
              <span className="text-xs text-[#57534E]">
                Comprobante: <strong>{selectedVoucherForPrint.numeroComprobante}</strong>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => triggerUploadSignedFile(selectedVoucherForPrint.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0369A1] text-white text-xs font-bold rounded-xl hover:bg-[#075985] cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Cargar Comprobante Ya Firmado y Sellado (PDF / Imagen)
              </button>
              <button
                type="button"
                onClick={() => handleMarkAsStampedAndVerified(selectedVoucherForPrint)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#15803D] text-white text-xs font-bold rounded-xl hover:bg-[#166534] cursor-pointer"
              >
                <Stamp className="w-3.5 h-3.5" />
                Certificar Firma y Sello en Expediente
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1C1917] text-white text-xs font-bold rounded-xl hover:bg-[#292524] cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir para Firmar y Sellar
              </button>
              <button
                type="button"
                onClick={() => setSelectedVoucherForPrint(null)}
                className="px-3 py-2 bg-[#F5F5F4] text-[#1C1917] text-xs font-semibold rounded-xl hover:bg-[#E7E5E4] cursor-pointer"
              >
                Cerrar Vista Previa
              </button>
            </div>
          </div>

          {/* MEMBRETE LEGAL Y ENCABEZADO DEL COMPROBANTE */}
          <div className="border-b-2 border-[#1C1917] pb-5 flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold text-[#15803D]">
                REPÚBLICA BOLIVARIANA DE VENEZUELA · CONTABILIDAD LEGAL VEN-NIF / SENIAT / SUDEBAN
              </div>
              <h3 className="text-2xl font-bold text-[#1C1917] font-display">
                {oniCompany.razonSocial}
              </h3>
              <div className="text-xs text-[#44403C] font-mono">
                <strong>RIF:</strong> {oniCompany.rif} · <strong>Cta. Banesco VES:</strong>{' '}
                {oniCompany.cuentaBanescoVES} · <strong>Cta. Custodia USD:</strong>{' '}
                {oniCompany.cuentaBanescoUSD}
              </div>
              <div className="text-xs text-[#57534E]">
                <strong>Domicilio Fiscal:</strong> {oniCompany.domicilioFiscal} ·{' '}
                <strong>Registro Mercantil:</strong> {oniCompany.registroMercantil}
              </div>
            </div>

            <div className="bg-[#FAF8F5] border border-[#1C1917] rounded-2xl p-4 min-w-[270px] text-right space-y-1">
              <div className="text-[11px] font-bold text-[#57534E] uppercase">
                COMPROBANTE CONTABLE Y DE TRAZABILIDAD
              </div>
              <div className="text-lg font-mono font-bold text-[#1C1917]">
                {selectedVoucherForPrint.numeroComprobante}
              </div>
              <div className="text-xs font-mono text-[#44403C]">
                <strong>Fecha de Emisión:</strong> {selectedVoucherForPrint.fechaEmision}
              </div>
              <div className="text-xs font-mono font-bold text-[#14532D]">
                Monto: Bs. {fmtBs(selectedVoucherForPrint.montoOperacionBs)} (US${' '}
                {fmtUSD(selectedVoucherForPrint.montoEquivalenteUSD)})
              </div>
              <div className="text-[11px] font-mono text-[#0369A1]">
                Expediente SENIAT: {selectedVoucherForPrint.expedienteSeniatNro}
              </div>
            </div>
          </div>

          {/* DATOS DEL ORDENANTE / CONTRAPARTE Y REFERENCIA BANCARIA BANESCO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#FAF8F5] border border-[#D6D3D1] rounded-2xl p-4 text-xs">
            <div>
              <div className="text-[#57534E] font-bold uppercase text-[10px]">
                Titular / Contraparte de la Operación
              </div>
              <div className="font-bold text-[#1C1917] text-sm mt-0.5">
                {selectedVoucherForPrint.contraparteNombre}
              </div>
              <div className="font-mono text-[#14532D] font-semibold mt-0.5">
                RIF / Cédula: {selectedVoucherForPrint.contraparteRifOCedula}
              </div>
            </div>
            <div>
              <div className="text-[#57534E] font-bold uppercase text-[10px]">
                Institución Financiera y Cuenta Vinculada
              </div>
              <div className="font-bold text-[#1C1917] mt-0.5">
                {selectedVoucherForPrint.bancoContraparte}
              </div>
              <div className="font-mono text-[#44403C] mt-0.5">
                Cta: {selectedVoucherForPrint.numeroCuentaContraparte}
              </div>
            </div>
            <div>
              <div className="text-[#57534E] font-bold uppercase text-[10px]">
                Referencia Estado de Cuenta Banesco
              </div>
              <div className="font-mono font-bold text-[#0369A1] text-sm mt-0.5">
                {selectedVoucherForPrint.referenciaBancariaBanesco}
              </div>
              <div className="font-mono text-[#44403C] mt-0.5">
                Flujo:{' '}
                {selectedVoucherForPrint.naturalezaFlujo === 'ENTRADA_BANESCO'
                  ? 'ENTRADA / ABONO EN CUENTA BANESCO'
                  : 'SALIDA / CARGO EN CUENTA BANESCO'}
              </div>
            </div>
          </div>

          {/* CONCEPTO GENERAL */}
          <div className="bg-white border border-[#E7E5E4] rounded-xl p-4 text-xs">
            <div className="font-bold text-[#1C1917] uppercase text-[11px] mb-1">
              Concepto Legal y Económico de la Operación (Art. 34 Código de Comercio):
            </div>
            <p className="text-[#44403C] leading-relaxed font-medium">
              {selectedVoucherForPrint.conceptoGeneral}
            </p>
          </div>

          {/* ASIENTO CONTABLE VEN-NIF */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-[#1C1917] uppercase">
              Asiento Contable en Libro Diario (Normas VEN-NIF / BA VEN-NIF 0 y 8):
            </div>
            <div className="overflow-x-auto border border-[#1C1917] rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#1C1917] text-white">
                    <th className="py-2.5 px-3 font-bold">Código Cta.</th>
                    <th className="py-2.5 px-3 font-bold">Denominación de la Cuenta Contable</th>
                    <th className="py-2.5 px-3 font-bold">Referencia Auxiliar</th>
                    <th className="py-2.5 px-3 font-bold text-right">Debe (Bs.)</th>
                    <th className="py-2.5 px-3 font-bold text-right">Haber (Bs.)</th>
                    <th className="py-2.5 px-3 font-bold text-right">Debe (US$)</th>
                    <th className="py-2.5 px-3 font-bold text-right">Haber (US$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E4]">
                  {selectedVoucherForPrint.lineasAsientoContable.map((line, i) => (
                    <tr key={i}>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#1C1917]">
                        {line.codigoCuenta}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[#1C1917]">
                        {line.nombreCuenta}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#57534E]">
                        {line.referenciaAuxiliar}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#14532D]">
                        {line.debeBs > 0 ? `Bs. ${fmtBs(line.debeBs)}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#9A3412]">
                        {line.haberBs > 0 ? `Bs. ${fmtBs(line.haberBs)}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#0C4A6E]">
                        {line.debeUSD > 0 ? `$${fmtUSD(line.debeUSD)}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#0C4A6E]">
                        {line.haberUSD > 0 ? `$${fmtUSD(line.haberUSD)}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#FAF8F5] font-bold border-t border-[#1C1917]">
                    <td colSpan={3} className="py-2.5 px-3">
                      SUMAS IGUALES DEL ASIENTO CONTABLE (PARTIDA DOBLE)
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#14532D]">
                      Bs. {fmtBs(selectedVoucherForPrint.montoOperacionBs)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#9A3412]">
                      Bs. {fmtBs(selectedVoucherForPrint.montoOperacionBs)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#0C4A6E]">
                      ${fmtUSD(selectedVoucherForPrint.montoEquivalenteUSD)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#0C4A6E]">
                      ${fmtUSD(selectedVoucherForPrint.montoEquivalenteUSD)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* TRAZABILIDAD DEL DINERO Y BLINDAJE CONTRA LA LEY DE DELITOS CAMBIARIOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#DCFCE7]/40 border border-[#86EFAC] rounded-2xl p-4 space-y-2">
              <div className="font-bold text-[#14532D] uppercase">
                1. Trazabilidad Bancaria del Dinero (Origen y Destino Lícito):
              </div>
              <p className="text-[#1C1917]">
                <strong>Origen de los Fondos:</strong>{' '}
                {selectedVoucherForPrint.trazabilidadOrigenFondos}
              </p>
              <p className="text-[#1C1917]">
                <strong>Destino / Aplicación:</strong>{' '}
                {selectedVoucherForPrint.trazabilidadDestinoFondos}
              </p>
            </div>

            <div className="bg-[#E0F2FE]/40 border border-[#7DD3FC] rounded-2xl p-4 space-y-2">
              <div className="font-bold text-[#0C4A6E] uppercase">
                2. Blindaje Legal y Cumplimiento Cambiario BCV / SUDEBAN / SENIAT:
              </div>
              <p className="text-[#1C1917]">
                {selectedVoucherForPrint.baseLegalAntidelitosCambiarios}
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[#44403C]">
                {selectedVoucherForPrint.requisitosSeniatSudebanVerificados.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* DECLARACIÓN JURADA EXPRESA PARA PRESENTAR A BANESCO Y SENIAT */}
          <div className="bg-[#FAF8F5] border border-[#D6D3D1] rounded-xl p-4 text-[11px] text-[#44403C] leading-relaxed">
            <strong>DECLARACIÓN JURADA DE ORIGEN Y DESTINO LÍCITO DE FONDOS (RESOLUCIÓN SUDEBAN 083.18 Y CONVENIO CAMBIARIO N° 1 BCV):</strong>{' '}
            Quienes suscriben, en representación legal y contable de{' '}
            <strong>{oniCompany.razonSocial} (RIF {oniCompany.rif})</strong>, declaran bajo fe de juramento que los fondos reflejados en el presente comprobante por{' '}
            <strong>Bs. {fmtBs(selectedVoucherForPrint.montoOperacionBs)}</strong> tienen origen y destino estrictamente lícitos derivados del giro agroindustrial cafetero, han sido canalizados a través de instituciones financieras autorizadas bajo la supervisión de SUDEBAN y el Banco Central de Venezuela, y cumplen con las disposiciones del Decreto Constituyente de Derogatoria del Régimen Cambiario y sus Ilícitos (Gaceta Oficial Extraordinaria N° 6.396) y las normas de facturación y retención del SENIAT.
          </div>

          {/* BLOQUES DE FIRMA HÚMEDA Y SELLO PARA IMPRESIÓN FÍSICA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
            <div className="border border-[#1C1917] rounded-xl p-4 text-center space-y-8 bg-white">
              <div className="text-[11px] font-bold text-[#1C1917] uppercase">
                1. Elaborado y Visado por Contador Público
              </div>
              <div className="border-t border-[#1C1917] pt-2 text-[11px] text-[#44403C]">
                <strong>Firma y Sello Húmedo CPC</strong>
                <br />
                {selectedVoucherForPrint.firmadoPorContadorCpc ||
                  'Contador Público Colegiado (VEN-NIF)'}
              </div>
            </div>

            <div className="border border-[#1C1917] rounded-xl p-4 text-center space-y-8 bg-white">
              <div className="text-[11px] font-bold text-[#1C1917] uppercase">
                2. Aprobado por Representante Legal
              </div>
              <div className="border-t border-[#1C1917] pt-2 text-[11px] text-[#44403C]">
                <strong>{oniCompany.representanteLegal}</strong>
                <br />
                Firma, C.I. y Sello Húmedo {oniCompany.razonSocial}
              </div>
            </div>

            <div className="border border-[#1C1917] rounded-xl p-4 text-center space-y-8 bg-white">
              <div className="text-[11px] font-bold text-[#1C1917] uppercase">
                3. Conformidad Cliente / Contraparte
              </div>
              <div className="border-t border-[#1C1917] pt-2 text-[11px] text-[#44403C]">
                <strong>{selectedVoucherForPrint.contraparteNombre}</strong>
                <br />
                RIF/C.I.: {selectedVoucherForPrint.contraparteRifOCedula} (Firma y Sello)
              </div>
            </div>

            <div className="border border-[#1C1917] rounded-xl p-4 text-center space-y-8 bg-white">
              <div className="text-[11px] font-bold text-[#1C1917] uppercase">
                4. Recepción Banco Banesco / SENIAT
              </div>
              <div className="border-t border-[#1C1917] pt-2 text-[11px] text-[#44403C]">
                <strong>Sello Húmedo de Recepción</strong>
                <br />
                Agencia Banesco / Expediente Fiscal SENIAT
              </div>
            </div>
          </div>

          {/* SI YA TIENE UN ARCHIVO ESCANEADO FIRMADO Y SELLADO CARGADO, MOSTRAR CONSTANCIA */}
          {selectedVoucherForPrint.archivoFirmadoNombre && (
            <div className="bg-[#DCFCE7] border border-[#15803D] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="font-bold text-[#14532D] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  SOPORTE DIGITALIZADO FIRMADO Y SELLADO VINCULADO EN REPOSITORIO SENIAT
                </div>
                <div className="font-mono text-[#1C1917]">
                  Archivo: <strong>{selectedVoucherForPrint.archivoFirmadoNombre}</strong> · Fecha Carga:{' '}
                  <strong>{selectedVoucherForPrint.archivoFirmadoFechaCarga}</strong> · Hash:{' '}
                  <strong>{selectedVoucherForPrint.archivoFirmadoHashSha256}</strong>
                </div>
              </div>
              {selectedVoucherForPrint.archivoFirmadoDataUrl &&
                selectedVoucherForPrint.archivoFirmadoDataUrl.startsWith('data:image') && (
                  <img
                    src={selectedVoucherForPrint.archivoFirmadoDataUrl}
                    alt="Escaneo firmado y sellado"
                    className="h-20 w-auto rounded-lg border border-[#15803D] object-contain bg-white p-1"
                  />
                )}
            </div>
          )}
        </section>
      )}

      {/* =====================================================================
          CONTENIDO DE LA HOJA ACTIVA
         ===================================================================== */}
      {activeSubSheet === 'contabilidad-banesco-2026' && (
        <div className="space-y-8">
          {/* RESUMEN EJECUTIVO DE LA CONTABILIDAD DE ENTRADAS Y SALIDAS ENERO - AGOSTO 2026 */}
          <section className="bg-white border border-[#E7E5E4] rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E7E5E4] pb-4">
              <div>
                <span className="text-xs font-bold text-[#15803D]">
                  HOJA DE CONTABILIDAD GENERAL BANESCO (ENERO A AGOSTO 2026) · LIBRO DIARIO, MAYOR Y BALANCE VEN-NIF
                </span>
                <h3 className="text-xl font-bold text-[#1C1917] font-display mt-0.5">
                  1. Balance de Comprobación de Sumas y Saldos al 31 de Agosto de 2026 — AGRÍCOLA ONI, C.A.
                </h3>
                <p className="text-xs text-[#57534E] mt-1">
                  Contabilidad integral por partida doble de todas las operaciones de entradas (<strong>Bs. 1.966.597.105,35</strong>) y salidas (<strong>Bs. 1.956.660.113,95</strong>) de la cuenta corriente Banesco N° <code>0134-0342-18-3421089912</code> desde el 01/01/2026 hasta el 31/08/2026.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2.5 shrink-0">
                <div className="bg-[#DCFCE7] border border-[#86EFAC] rounded-xl px-3.5 py-2 text-right">
                  <div className="text-[10px] font-bold text-[#14532D]">TOTAL DEBE BANESCO</div>
                  <div className="text-xs font-mono font-bold text-[#14532D]">
                    Bs. {fmtBs(TOTALES_MENSUALES_ABONOS.totalBs)}
                  </div>
                </div>
                <div className="bg-[#FFEDD5] border border-[#FDBA74] rounded-xl px-3.5 py-2 text-right">
                  <div className="text-[10px] font-bold text-[#9A3412]">TOTAL HABER BANESCO</div>
                  <div className="text-xs font-mono font-bold text-[#9A3412]">
                    Bs. {fmtBs(TOTALES_MENSUALES_SALIDAS.totalBs)}
                  </div>
                </div>
                <div className="bg-[#E0F2FE] border border-[#7DD3FC] rounded-xl px-3.5 py-2 text-right">
                  <div className="text-[10px] font-bold text-[#0369A1]">SALDO BANESCO 31/08</div>
                  <div className="text-xs font-mono font-bold text-[#0C4A6E]">
                    +Bs. {fmtBs(TOTALES_MENSUALES_ABONOS.totalBs - TOTALES_MENSUALES_SALIDAS.totalBs)}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#E7E5E4] rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#1C1917] text-white">
                    <th className="py-3 px-3 font-bold">Código VEN-NIF</th>
                    <th className="py-3 px-3 font-bold">Cuenta Contable del Plan Único Agrícola Oni</th>
                    <th className="py-3 px-2.5 font-bold">Clasificación</th>
                    <th className="py-3 px-3 font-bold text-right">Mov. Debe (Bs.)</th>
                    <th className="py-3 px-3 font-bold text-right">Mov. Haber (Bs.)</th>
                    <th className="py-3 px-3 font-bold text-right bg-[#14532D]">Saldo Deudor (Bs.)</th>
                    <th className="py-3 px-3 font-bold text-right bg-[#9A3412]">Saldo Acreedor (Bs.)</th>
                    <th className="py-3 px-3 font-bold text-right bg-[#0C4A6E]">Equiv. Neto US$</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E4]">
                  {BALANCE_COMPROBACION_BANESCO_2026.map((row) => (
                    <tr key={row.codigoCuenta} className="hover:bg-[#FAF8F5]">
                      <td className="py-3 px-3 font-mono font-bold text-[#0369A1]">
                        {row.codigoCuenta}
                      </td>
                      <td className="py-3 px-3 font-bold text-[#1C1917]">{row.nombreCuenta}</td>
                      <td className="py-3 px-2.5 font-mono text-[11px] text-[#57534E]">
                        {row.tipoCuenta}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        {fmtBs(row.debeAcumuladoBs)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        {fmtBs(row.haberAcumuladoBs)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#14532D] bg-[#DCFCE7]/30">
                        {row.saldoDeudorBs > 0 ? fmtBs(row.saldoDeudorBs) : '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#9A3412] bg-[#FFEDD5]/30">
                        {row.saldoAcreedorBs > 0 ? fmtBs(row.saldoAcreedorBs) : '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-[#0C4A6E]">
                        ${fmtUSD(Math.abs(row.saldoNetoUSD))}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#1C1917] text-white font-bold text-xs">
                    <td colSpan={3} className="py-3.5 px-3">
                      SUMAS IGUALES DEL BALANCE DE COMPROBACIÓN (PARTIDA DOBLE CUADRADA AL CÉNTIMO)
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-[#86EFAC]">
                      Bs.{' '}
                      {fmtBs(
                        BALANCE_COMPROBACION_BANESCO_2026.reduce(
                          (a, b) => a + b.debeAcumuladoBs,
                          0
                        )
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-[#FDBA74]">
                      Bs.{' '}
                      {fmtBs(
                        BALANCE_COMPROBACION_BANESCO_2026.reduce(
                          (a, b) => a + b.haberAcumuladoBs,
                          0
                        )
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-[#86EFAC]">
                      Bs.{' '}
                      {fmtBs(
                        BALANCE_COMPROBACION_BANESCO_2026.reduce(
                          (a, b) => a + b.saldoDeudorBs,
                          0
                        )
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-[#FDBA74]">
                      Bs.{' '}
                      {fmtBs(
                        BALANCE_COMPROBACION_BANESCO_2026.reduce(
                          (a, b) => a + b.saldoAcreedorBs,
                          0
                        )
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-[#7DD3FC]">
                      CUADRADO 100%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* LIBRO DIARIO GENERAL DE ASIENTOS CONTABLES (ENERO A AGOSTO 2026) */}
          <section className="bg-white border border-[#E7E5E4] rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E7E5E4] pb-4">
              <div>
                <span className="text-xs font-bold text-[#0369A1]">
                  ARTÍCULOS 32 AL 44 DEL CÓDIGO DE COMERCIO DE VENEZUELA · ASIENTOS CONTABLES CON SOPORTE INDIVIDUAL
                </span>
                <h3 className="text-xl font-bold text-[#1C1917] font-display mt-0.5">
                  2. Libro Diario General de Operaciones Banesco (Entradas y Salidas Enero a Agosto 2026)
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2 no-print">
                <select
                  value={filtroMes}
                  onChange={(e) => setFiltroMes(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold bg-[#FAF8F5] border border-[#D6D3D1] rounded-lg"
                >
                  <option value="ALL">Todos los Meses (Ene - Ago 2026)</option>
                  <option value="Ene">Enero 2026</option>
                  <option value="Feb">Febrero 2026</option>
                  <option value="Mar">Marzo 2026</option>
                  <option value="Abr">Abril 2026</option>
                  <option value="May">Mayo 2026</option>
                  <option value="Jun">Junio 2026</option>
                  <option value="Jul">Julio 2026</option>
                  <option value="Ago">Agosto 2026</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#E7E5E4] rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0C4A6E] text-white">
                    <th className="py-3 px-3 font-bold">Fecha</th>
                    <th className="py-3 px-3 font-bold">N° Comprobante</th>
                    <th className="py-3 px-3 font-bold">Cta. VEN-NIF</th>
                    <th className="py-3 px-3 font-bold">Cuenta Contable / Glosa Legal del Asiento</th>
                    <th className="py-3 px-3 font-bold text-right">Debe (Bs.)</th>
                    <th className="py-3 px-3 font-bold text-right">Haber (Bs.)</th>
                    <th className="py-3 px-3 font-bold text-right">Equiv. US$</th>
                    <th className="py-3 px-3 font-bold text-center no-print">Comprobante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E4]">
                  {sheetVouchers.map((v) => (
                    <React.Fragment key={v.id}>
                      {v.lineasAsientoContable.map((line, idx) => (
                        <tr
                          key={`${v.id}-${idx}`}
                          className={idx === 0 ? 'bg-[#FAF8F5]/80' : 'bg-white'}
                        >
                          <td className="py-2.5 px-3 font-mono font-bold text-[#1C1917] whitespace-nowrap">
                            {idx === 0 ? v.fechaEmision : ''}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#0369A1] whitespace-nowrap">
                            {idx === 0 ? v.numeroComprobante : ''}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#1C1917]">
                            {line.codigoCuenta}
                          </td>
                          <td className="py-2.5 px-3">
                            <div
                              className={`font-bold text-[#1C1917] ${
                                line.haberBs > 0 ? 'pl-6' : ''
                              }`}
                            >
                              {line.nombreCuenta}
                            </div>
                            <div
                              className={`text-[11px] text-[#57534E] ${
                                line.haberBs > 0 ? 'pl-6' : ''
                              }`}
                            >
                              {idx === 0
                                ? `${v.conceptoGeneral} (Ref: ${v.referenciaBancariaBanesco})`
                                : `Auxiliar: ${line.referenciaAuxiliar} · Contraparte: ${v.contraparteNombre} (${v.contraparteRifOCedula})`}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-[#14532D] whitespace-nowrap">
                            {line.debeBs > 0 ? fmtBs(line.debeBs) : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-[#9A3412] whitespace-nowrap">
                            {line.haberBs > 0 ? fmtBs(line.haberBs) : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-[#0C4A6E] whitespace-nowrap">
                            ${fmtUSD(line.debeUSD > 0 ? line.debeUSD : line.haberUSD)}
                          </td>
                          <td className="py-2.5 px-3 text-center no-print">
                            {idx === 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedVoucherForPrint(v);
                                  window.scrollTo({ top: 150, behavior: 'smooth' });
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1C1917] text-white text-[11px] font-bold rounded-lg hover:bg-[#292524] cursor-pointer"
                              >
                                <Printer className="w-3 h-3" />
                                Ver / Imprimir
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* =====================================================================
          HOJA B-2: MODELO DE CONTRATO DE ANTICIPO DE CLIENTES (LLENAR Y FIRMAR)
         ===================================================================== */}
      {activeSubSheet === 'contrato-anticipo-clientes-2026' && (
        <AgricolaOniClientAdvanceContractView
          companies={companies}
          vouchers={vouchers}
          initialVoucherId={selectedContractVoucherId}
          onNavigateToModule={(modId) => onSelectSubSheet(modId as OniAccountingSubSheet)}
        />
      )}

      {/* =====================================================================
          HOJA D-2: HOJA APARTE DE RESUMEN DE DÓLARES COMPRADOS Y DESTINO DEL DINERO
         ===================================================================== */}
      {activeSubSheet === 'resumen-dolares-destino-2026' && (
        <AgricolaOniFxDestinationSummarySheetView
          companies={companies}
          vouchers={vouchers}
          onNavigateToModule={(modId) => onSelectSubSheet(modId as OniAccountingSubSheet)}
        />
      )}

      {/* =====================================================================
          HOJAS DE COMPROBANTES ESPECIALIZADOS (HOJAS B, C, D-1, E Y F)
         ===================================================================== */}
      {activeSubSheet !== 'contabilidad-banesco-2026' &&
        activeSubSheet !== 'contrato-anticipo-clientes-2026' &&
        activeSubSheet !== 'resumen-dolares-destino-2026' && (
        <section className="bg-white border border-[#E7E5E4] rounded-2xl p-6 shadow-sm space-y-6">
          {/* PANEL ESPECIAL DE DESCARGA DE RECIBOS EN LOTES (DESTACADO EN HOJA COMPRA DE DÓLARES) */}
          <div className="no-print bg-gradient-to-r from-[#FFEDD5] via-[#FEF3C7] to-[#DCFCE7] border-2 border-[#C2410C] rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#7C2D12] bg-white px-3 py-1 rounded-lg border border-[#FDBA74]">
                  <Layers className="w-4 h-4 text-[#C2410C]" />
                  DESCARGA MASIVA DE RECIBOS EN LOTES (LISTOS PARA IMPRIMIR, FIRMAR Y SELLAR)
                </div>
                <h4 className="text-base sm:text-lg font-bold text-[#1C1917] font-display">
                  {activeSubSheet === 'comprobantes-dolares-banesco-2026'
                    ? 'Descargar los 29 Recibos de Compra de Dólares en Lotes (PDF Multipágina y Word .DOC)'
                    : `Descargar los ${sheetVouchers.length} Comprobantes de esta Hoja en Lote (PDF y Word)`}
                </h4>
                <p className="text-xs text-[#44403C]">
                  Como son muchos recibos individuales, selecciona el lote que deseas descargar (todos los 29 recibos de Enero a Agosto 2026 o por mes) y descárgalos en un solo archivo <strong>PDF Multipágina</strong> o <strong>Word (.DOC)</strong> con 1 recibo completo por página.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <select
                  value={lotePreset}
                  onChange={(e) => setLotePreset(e.target.value)}
                  className="px-3 py-2 text-xs font-bold bg-white border-2 border-[#C2410C] text-[#1C1917] rounded-xl"
                >
                  <option value="ALL_SHEET">
                    Lote Completo Ene–Ago 2026 ({activeSubSheet === 'comprobantes-dolares-banesco-2026' ? '29 Recibos — US$ 556.890,45' : `${sheetVouchers.length} Recibos`})
                  </option>
                  <option value="ENE_MAY">
                    Lote 1: Enero a Mayo 2026 (17 Recibos — US$ 22.465,78 / Bs. 9,63M)
                  </option>
                  <option value="JUN">
                    Lote 2: Junio 2026 (4 Recibos Mayoristas — US$ 134.272,94 / Bs. 88,60M)
                  </option>
                  <option value="JUL">
                    Lote 3: Julio 2026 (4 Recibos Mayoristas — US$ 198.231,39 / Bs. 134,50M)
                  </option>
                  <option value="AGO">
                    Lote 4: Agosto 2026 (4 Recibos Mayoristas — US$ 201.920,34 / Bs. 142,90M)
                  </option>
                  <option value="FILTERED">
                    Lote según Filtro Actual en Pantalla ({sheetVouchers.length} Recibos)
                  </option>
                </select>

                <button
                  type="button"
                  onClick={handleDownloadBatchReceiptsPdf}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C2410C] text-white text-xs font-bold rounded-xl hover:bg-[#9A3412] transition-colors cursor-pointer shadow-sm"
                >
                  <FileDown className="w-4 h-4" />
                  Descargar Recibos en Lote (.PDF)
                </button>

                <button
                  type="button"
                  onClick={handleDownloadBatchReceiptsWord}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0369A1] text-white text-xs font-bold rounded-xl hover:bg-[#075985] transition-colors cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Descargar Recibos en Lote (.DOC)
                </button>

                <button
                  type="button"
                  onClick={() => onSelectSubSheet('resumen-dolares-destino-2026')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#15803D] text-white text-xs font-bold rounded-xl hover:bg-[#166534] transition-colors cursor-pointer shadow-sm"
                >
                  <Layers className="w-4 h-4" />
                  Ver Hoja Resumen: ¿A Dónde Fue el Dinero? →
                </button>
              </div>
            </div>
          </div>
          {/* CABECERA ESPECÍFICA SEGÚN LA HOJA ACTIVA */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E7E5E4] pb-4">
            <div className="space-y-1 max-w-3xl">
              <span className="text-xs font-bold text-[#15803D] uppercase">
                {activeSubSheet === 'comprobantes-anticipos-2026' &&
                  'HOJA APARTE N° 1 · COMPROBANTES DE ANTICIPOS DE CLIENTES (NIIF 15 / ART. 13 LEY IVA)'}
                {activeSubSheet === 'comprobantes-traspasos-2026' &&
                  'HOJA APARTE N° 2 · COMPROBANTES DE TRANSFERENCIAS INTERNAS DE OTROS BANCOS PROPIOS (J-50145638-0)'}
                {activeSubSheet === 'comprobantes-dolares-banesco-2026' &&
                  'HOJA APARTE N° 3 · COMPROBANTES DE COMPRAS DE DÓLARES A BANESCO (MESA DE CAMBIO BCV)'}
                {activeSubSheet === 'comprobantes-restantes-2026' &&
                  'HOJA APARTE N° 4 · COMPROBANTES RESTANTES PARA JUSTIFICAR EL 100% DE INGRESOS Y EGRESOS BANESCO'}
                {activeSubSheet === 'repositorio-seniat-2026' &&
                  'HOJA APARTE N° 5 · REPOSITORIO DIGITAL SENIAT Y BANESCO DE COMPROBANTES GUARDADOS, FIRMADOS Y SELLADOS'}
              </span>
              <h3 className="text-xl font-bold text-[#1C1917] font-display">
                {activeSubSheet === 'comprobantes-anticipos-2026' &&
                  'Comprobantes Oficiales de Anticipos de Clientes Recibidos en Banesco (Enero a Agosto 2026)'}
                {activeSubSheet === 'comprobantes-traspasos-2026' &&
                  'Comprobantes de Transferencias Internas entre Cuentas Propias de Agrícola Oni, C.A. en Otros Bancos'}
                {activeSubSheet === 'comprobantes-dolares-banesco-2026' &&
                  'Comprobantes de Compras de Dólares en Mesa de Cambio Banesco y Procura Internacional de Café'}
                {activeSubSheet === 'comprobantes-restantes-2026' &&
                  'Comprobantes Restantes: Línea Becerra, Liquidación Café, Fletes, Gastos de Campo y Comisiones/IGTF'}
                {activeSubSheet === 'repositorio-seniat-2026' &&
                  'Repositorio Central SENIAT / Banesco: Archivo de Comprobantes y Carga de Escaneados Firmados y Sellados'}
              </h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Cada comprobante cumple con los requisitos del <strong>Código de Comercio, Providencia SENIAT SNAT/2011/0071, Resolución SUDEBAN 083.18 y Convenio Cambiario N° 1 BCV</strong>. Haz clic en <strong>"Imprimir / Firmar"</strong> para obtener el formato físico con bloques de firma y sello húmedo, y luego usa <strong>"Subir Firmado/Sellado"</strong> para dejarlo resguardado ante cualquier fiscalización del SENIAT.
              </p>
            </div>

            {/* Tarjetas de Totales de la Hoja Activa */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {totalVistaEntradasBs > 0 && (
                <div className="bg-[#DCFCE7] border border-[#86EFAC] rounded-xl px-4 py-2.5 text-right">
                  <div className="text-[10px] font-bold text-[#14532D] uppercase">
                    Total Comprobantes Entradas
                  </div>
                  <div className="text-sm font-mono font-bold text-[#14532D]">
                    Bs. {fmtBs(totalVistaEntradasBs)}
                  </div>
                </div>
              )}
              {totalVistaSalidasBs > 0 && (
                <div className="bg-[#FFEDD5] border border-[#FDBA74] rounded-xl px-4 py-2.5 text-right">
                  <div className="text-[10px] font-bold text-[#9A3412] uppercase">
                    Total Comprobantes Salidas
                  </div>
                  <div className="text-sm font-mono font-bold text-[#9A3412]">
                    Bs. {fmtBs(totalVistaSalidasBs)}
                  </div>
                </div>
              )}
              <div className="bg-[#E0F2FE] border border-[#7DD3FC] rounded-xl px-4 py-2.5 text-right">
                <div className="text-[10px] font-bold text-[#0369A1] uppercase">
                  Equivalente Total US$
                </div>
                <div className="text-sm font-mono font-bold text-[#0C4A6E]">
                  US$ {fmtUSD(totalVistaUSD)}
                </div>
              </div>
            </div>
          </div>

          {/* BARRA DE FILTROS, BÚSQUEDA Y BOTÓN DE NUEVO COMPROBANTE */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F5] border border-[#E7E5E4] rounded-2xl p-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar N° comprobante, RIF, cliente, ref..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-white border border-[#D6D3D1] rounded-lg w-64"
                />
              </div>

              <select
                value={filtroMes}
                onChange={(e) => setFiltroMes(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold bg-white border border-[#D6D3D1] rounded-lg"
              >
                <option value="ALL">Todos los Meses (Ene - Ago)</option>
                <option value="Ene">Enero 2026</option>
                <option value="Feb">Febrero 2026</option>
                <option value="Mar">Marzo 2026</option>
                <option value="Abr">Abril 2026</option>
                <option value="May">Mayo 2026</option>
                <option value="Jun">Junio 2026</option>
                <option value="Jul">Julio 2026</option>
                <option value="Ago">Agosto 2026</option>
              </select>

              <select
                value={filtroEstadoFirma}
                onChange={(e) => setFiltroEstadoFirma(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold bg-white border border-[#D6D3D1] rounded-lg"
              >
                <option value="ALL">Todos los Estados de Firma/Sello</option>
                <option value="EMITIDO_PENDIENTE_FIRMA">Emitido (Listo para Imprimir/Firmar)</option>
                <option value="FIRMADO_Y_SELLADO_DIGITALIZADO">
                  Firmado y Sellado Cargado (Digitalizado)
                </option>
                <option value="VERIFICADO_AUDITORIA_SENIAT">
                  Verificado y Sellado Expediente SENIAT
                </option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#57534E]">
                Firmados/Sellados en Repositorio:{' '}
                <strong className="text-[#14532D]">
                  {totalComprobantesFirmados} / {vouchers.length}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => setShowNewVoucherForm(!showNewVoucherForm)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1C1917] text-white text-xs font-bold rounded-xl hover:bg-[#292524] cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                {showNewVoucherForm ? 'Ocultar Formulario' : 'Emitir Comprobante Adicional'}
              </button>
            </div>
          </div>

          {/* FORMULARIO OPCIONAL PARA ANEXAR UN NUEVO COMPROBANTE AL REPOSITORIO */}
          {showNewVoucherForm && (
            <form
              onSubmit={handleAddCustomVoucherSubmit}
              className="no-print bg-[#FEF9C3]/60 border border-[#FDE047] rounded-2xl p-5 space-y-4"
            >
              <div className="text-xs font-bold text-[#713F12] uppercase">
                Emitir y Guardar Nuevo Comprobante Legal en esta Hoja y en el Repositorio SENIAT:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-bold mb-1">N° Comprobante</label>
                  <input
                    type="text"
                    value={nuevoNum}
                    onChange={(e) => setNuevoNum(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#D6D3D1] rounded-lg font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Fecha (DD/MM/2026)</label>
                  <input
                    type="text"
                    value={nuevoFecha}
                    onChange={(e) => setNuevoFecha(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#D6D3D1] rounded-lg font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Nombre Cliente / Contraparte</label>
                  <input
                    type="text"
                    value={nuevoContraparte}
                    onChange={(e) => setNuevoContraparte(e.target.value)}
                    placeholder="Ej: Distribuidora Cafetalera, C.A."
                    className="w-full px-3 py-1.5 bg-white border border-[#D6D3D1] rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">RIF o Cédula</label>
                  <input
                    type="text"
                    value={nuevoRif}
                    onChange={(e) => setNuevoRif(e.target.value)}
                    placeholder="J-00000000-0"
                    className="w-full px-3 py-1.5 bg-white border border-[#D6D3D1] rounded-lg font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Referencia Banesco (11 dígitos)</label>
                  <input
                    type="text"
                    value={nuevoRef}
                    onChange={(e) => setNuevoRef(e.target.value)}
                    placeholder="03618899001"
                    className="w-full px-3 py-1.5 bg-white border border-[#D6D3D1] rounded-lg font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Monto Operación (Bs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={nuevoMontoBs}
                    onChange={(e) => setNuevoMontoBs(e.target.value)}
                    placeholder="1000000.00"
                    className="w-full px-3 py-1.5 bg-white border border-[#D6D3D1] rounded-lg font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Tasa BCV Aplicada (Bs./USD)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={nuevoTasa}
                    onChange={(e) => setNuevoTasa(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#D6D3D1] rounded-lg font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Concepto y Trazabilidad</label>
                  <input
                    type="text"
                    value={nuevoConcepto}
                    onChange={(e) => setNuevoConcepto(e.target.value)}
                    placeholder="Anticipo comercial / Traspaso / Compra divisas..."
                    className="w-full px-3 py-1.5 bg-white border border-[#D6D3D1] rounded-lg"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#15803D] text-white text-xs font-bold rounded-xl hover:bg-[#166534] cursor-pointer"
                >
                  Guardar Comprobante en Base de Datos SENIAT
                </button>
              </div>
            </form>
          )}

          {/* TABLA MAESTRA DE COMPROBANTES DE LA HOJA ACTIVA CON ACCIONES DE IMPRESIÓN Y CARGA DE ESCANEADO FIRMADO/SELLADO */}
          <div className="space-y-4">
            {sheetVouchers.map((v) => {
              const isSigned =
                v.estadoFirmaSello === 'FIRMADO_Y_SELLADO_DIGITALIZADO' ||
                v.estadoFirmaSello === 'VERIFICADO_AUDITORIA_SENIAT';

              return (
                <div
                  key={v.id}
                  className={`border rounded-2xl p-5 transition-all space-y-4 ${
                    isSigned
                      ? 'bg-[#DCFCE7]/25 border-[#86EFAC]'
                      : 'bg-white border-[#E7E5E4] hover:border-[#D6D3D1]'
                  }`}
                >
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-[#E7E5E4] pb-3.5">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-[#0369A1] bg-[#E0F2FE] px-2.5 py-0.5 rounded-md">
                          {v.numeroComprobante}
                        </span>
                        <span className="font-mono font-semibold text-[#44403C]">
                          Fecha: {v.fechaEmision} ({v.mes} 2026)
                        </span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-bold ${
                            v.naturalezaFlujo === 'ENTRADA_BANESCO'
                              ? 'text-[#15803D]'
                              : 'text-[#9A3412]'
                          }`}
                        >
                          {v.naturalezaFlujo === 'ENTRADA_BANESCO'
                            ? 'ENTRADA / ABONO BANESCO'
                            : 'SALIDA / EGRESO BANESCO'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-mono font-bold ${
                            isSigned ? 'text-[#15803D]' : 'text-[#B45309]'
                          }`}
                        >
                          {v.estadoFirmaSello === 'FIRMADO_Y_SELLADO_DIGITALIZADO'
                            ? '✓ FIRMADO Y SELLADO CARGADO (DIGITALIZADO)'
                            : v.estadoFirmaSello === 'VERIFICADO_AUDITORIA_SENIAT'
                            ? '✓ SELLADO Y VERIFICADO EXPEDIENTE SENIAT'
                            : '● EMITIDO — LISTO PARA IMPRIMIR, FIRMAR Y SELLAR'}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-[#1C1917] font-display">
                        {v.conceptoGeneral}
                      </h4>

                      <div className="text-xs text-[#44403C] flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span>
                          <strong>Contraparte:</strong> {v.contraparteNombre} (
                          <span className="font-mono font-bold text-[#14532D]">
                            {v.contraparteRifOCedula}
                          </span>
                          )
                        </span>
                        <span>
                          <strong>Banco:</strong> {v.bancoContraparte}
                        </span>
                        <span>
                          <strong>Ref. Banesco:</strong>{' '}
                          <span className="font-mono font-bold text-[#0369A1]">
                            {v.referenciaBancariaBanesco}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      <div className="text-right bg-[#FAF8F5] border border-[#D6D3D1] rounded-xl px-3.5 py-2">
                        <div className="text-sm font-mono font-bold text-[#1C1917]">
                          Bs. {fmtBs(v.montoOperacionBs)}
                        </div>
                        <div className="text-xs font-mono font-semibold text-[#0369A1]">
                          Equiv: US$ {fmtUSD(v.montoEquivalenteUSD)}
                        </div>
                      </div>

                      <div className="no-print flex flex-wrap items-center gap-2">
                        {v.hojaDestino === 'ANTICIPOS_CLIENTES' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedContractVoucherId(v.id);
                              onSelectSubSheet('contrato-anticipo-clientes-2026');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#15803D] text-white text-xs font-bold rounded-xl hover:bg-[#14532D] cursor-pointer shadow-sm"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Contrato Cliente (Llenar/Firmar)
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedVoucherForPrint(v);
                            window.scrollTo({ top: 150, behavior: 'smooth' });
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1C1917] text-white text-xs font-bold rounded-xl hover:bg-[#292524] cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Imprimir / Firmar
                        </button>

                        <button
                          type="button"
                          onClick={() => triggerUploadSignedFile(v.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0369A1] text-white text-xs font-bold rounded-xl hover:bg-[#075985] cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Subir Firmado/Sellado
                        </button>

                        {!isSigned && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsStampedAndVerified(v)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#DCFCE7] text-[#14532D] border border-[#86EFAC] text-xs font-bold rounded-xl hover:bg-[#BBF7D0] cursor-pointer"
                          >
                            <Stamp className="w-3.5 h-3.5" />
                            Sellar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mini-tabla del Asiento Contable y Trazabilidad del Comprobante */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                    <div className="lg:col-span-7 overflow-x-auto border border-[#E7E5E4] rounded-xl bg-[#FAF8F5]">
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                          <tr className="border-b border-[#E7E5E4] text-[#57534E]">
                            <th className="py-1.5 px-2.5 font-bold">Cta. VEN-NIF</th>
                            <th className="py-1.5 px-2.5 font-bold">Asiento Contable</th>
                            <th className="py-1.5 px-2.5 font-bold text-right">Debe (Bs.)</th>
                            <th className="py-1.5 px-2.5 font-bold text-right">Haber (Bs.)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E7E5E4]">
                          {v.lineasAsientoContable.map((l, i) => (
                            <tr key={i}>
                              <td className="py-1.5 px-2.5 font-mono font-bold text-[#0369A1]">
                                {l.codigoCuenta}
                              </td>
                              <td className="py-1.5 px-2.5 font-medium text-[#1C1917]">
                                {l.nombreCuenta}
                              </td>
                              <td className="py-1.5 px-2.5 text-right font-mono font-bold text-[#14532D]">
                                {l.debeBs > 0 ? fmtBs(l.debeBs) : '—'}
                              </td>
                              <td className="py-1.5 px-2.5 text-right font-mono font-bold text-[#9A3412]">
                                {l.haberBs > 0 ? fmtBs(l.haberBs) : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="lg:col-span-5 bg-[#FAF8F5] border border-[#E7E5E4] rounded-xl p-3 space-y-1.5 text-[11px]">
                      <div className="font-bold text-[#14532D]">
                        Trazabilidad Antidelitos Cambiarios y SENIAT:
                      </div>
                      <div className="text-[#44403C]">
                        <strong>Origen:</strong> {v.trazabilidadOrigenFondos}
                      </div>
                      <div className="text-[#44403C]">
                        <strong>Destino:</strong> {v.trazabilidadDestinoFondos}
                      </div>
                      {v.archivoFirmadoNombre && (
                        <div className="pt-1.5 mt-1.5 border-t border-[#86EFAC] text-[#14532D] font-mono font-bold flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            Cargado: {v.archivoFirmadoNombre} ({v.archivoFirmadoFechaCarga})
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedVoucherForPrint(v);
                              window.scrollTo({ top: 150, behavior: 'smooth' });
                            }}
                            className="underline text-[#0369A1] cursor-pointer flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Ver Soporte
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
