import React, { useState, useRef, useEffect } from 'react';
import {
  COMPROBANTES_ANTICIPOS_CLIENTES_2026,
  OfficialAccountingVoucher,
} from '../data/agricolaOniAccountingVouchers2026Data';
import { CompanyProfile } from '../data/nominusData';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  PenTool,
  Trash2,
  Upload,
  ShieldCheck,
  Scale,
  Building2,
  UserCheck,
  Layers,
  FileSignature,
  PlusCircle,
  Eye,
  Sparkles,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ClientAdvanceContractRecord {
  id: string;
  numeroContrato: string;
  voucherIdVinculado: string;
  numeroComprobanteVinculado: string;
  ciudadSuscripcion: string;
  fechaSuscripcion: string;
  cicloZafra: string;
  plazoEntregaTexto: string;
  // Datos de LA EMPRESA (Suministradora)
  empresaRazonSocial: string;
  empresaRif: string;
  empresaRegistroMercantil: string;
  empresaDomicilio: string;
  empresaRepresentanteNombre: string;
  empresaRepresentanteCedula: string;
  empresaRepresentanteCargo: string;
  empresaCuentaBanescoBs: string;
  // Datos de EL CLIENTE (Comprador / Anticipante)
  tipoPersonaCliente: 'JURIDICA' | 'NATURAL';
  clienteRazonSocialONombre: string;
  clienteRifOCedula: string;
  clienteRegistroMercantilOActividad: string;
  clienteDomicilioFiscal: string;
  clienteRepresentanteNombre: string;
  clienteRepresentanteCedula: string;
  clienteRepresentanteCargo: string;
  clienteTelefono: string;
  clienteCorreo: string;
  // Datos Bancarios y Financieros del Anticipo
  clienteBancoOrigen: string;
  clienteNumeroCuentaOrigen: string;
  referenciasBancariasBanesco: string;
  fechaAbonoBancario: string;
  montoAnticipoBs: number;
  tasaBcvReferencial: number;
  montoEquivalenteUSD: number;
  cuentaContablePasivo: string;
  // Datos Físicos del Café a Entregar
  rubroDescripcion: string;
  calidadEspecificacion: string;
  precioReferencialUsdPorQQ: number;
  quintalesComprometidosQQ: number;
  kilosComprometidosKg: number;
  lugarEntregaFisica: string;
  guiaSicaInsaiCondicion: string;
  // Estado y Firmas
  modoFormatoEnBlancoParaMano: boolean;
  firmaClienteDataUrl?: string;
  firmaEmpresaDataUrl?: string;
  archivoEscaneadoNombre?: string;
  archivoEscaneadoFecha?: string;
  archivoEscaneadoSha256?: string;
  estadoContrato:
    | 'BORRADOR_LISTO_PARA_FIRMA'
    | 'FIRMADO_DIGITALMENTE_EN_APP'
    | 'FIRMADO_Y_SELLADO_ESCANEADO';
}

interface AgricolaOniClientAdvanceContractViewProps {
  companies: CompanyProfile[];
  vouchers?: OfficialAccountingVoucher[];
  initialVoucherId?: string;
  onNavigateToModule?: (moduleId: string) => void;
}

const buildInitialContractsFromVouchers = (
  oniCompany: CompanyProfile
): ClientAdvanceContractRecord[] => {
  return COMPROBANTES_ANTICIPOS_CLIENTES_2026.map((v, idx) => {
    const isNatural = v.subTipo === 'ANTICIPO_PRODUCTOR_NATURAL';
    const precioQQ = 195.0;
    const qqEstimados = Math.max(10, Math.round((v.montoEquivalenteUSD / precioQQ) * 100) / 100);
    const kgEstimados = Math.round(qqEstimados * 46 * 100) / 100;

    // Determinar representante sugerido según cliente
    let repNombre = 'REPRESENTANTE LEGAL TITULAR';
    let repCedula = 'V-12.458.901';
    let regMercantil =
      'Inscrita en el Registro Mercantil Primero de la Circunscripción Judicial correspondiente';

    if (v.contraparteNombre.includes('ETN')) {
      repNombre = 'CARLOS EDUARDO MENDOZA RIVAS';
      repCedula = 'V-14.892.310';
      regMercantil =
        'Registro Mercantil Primero del Estado Portuguesa, bajo el N° 42, Tomo 18-A';
    } else if (v.contraparteNombre.includes('DIS')) {
      repNombre = 'ROBERTO ANTONIO SALAZAR PERDOMO';
      repCedula = 'V-11.304.882';
      regMercantil =
        'Registro Mercantil Segundo del Estado Lara, bajo el N° 19, Tomo 54-A';
    } else if (v.contraparteNombre.includes('GRU')) {
      repNombre = 'GUSTAVO ADOLFO COLMENARES PÉREZ';
      repCedula = 'V-15.774.129';
      regMercantil =
        'Registro Mercantil Primero del Estado Portuguesa, bajo el N° 77, Tomo 31-A';
    } else if (v.contraparteNombre.includes('0191') || v.contraparteNombre.includes('AGR')) {
      repNombre = 'HENRRY JOSÉ ZAMBRANO LINARES';
      repCedula = 'V-13.908.445';
      regMercantil =
        'Registro Mercantil Primero del Estado Barinas, bajo el N° 15, Tomo 22-A';
    } else if (v.contraparteNombre.includes('RJK')) {
      repNombre = 'RICARDO JAVIER KAUFMANN TORRES';
      repCedula = 'V-16.220.518';
      regMercantil =
        'Registro Mercantil Quinto del Distrito Capital y Estado Miranda, N° 63, Tomo 40-A';
    } else if (v.contraparteNombre.includes('J-50809452-2')) {
      repNombre = 'ALEJANDRO JOSÉ BRICEÑO MONTILLA';
      repCedula = 'V-14.115.690';
      regMercantil =
        'Registro Mercantil Primero del Estado Portuguesa, bajo el N° 29, Tomo 85-A';
    } else if (isNatural) {
      repNombre = v.contraparteNombre;
      repCedula = v.contraparteRifOCedula.split(',')[0].trim();
      regMercantil =
        'Productor y Comercializador Primario de Café registrado en el Sistema SICA / RUNSAI - INSAI';
    } else {
      repNombre = 'DIRECTOR COMERCIAL AUTORIZADO (TITULAR CUENTA BANESCO)';
      repCedula = 'V-15.402.890';
      regMercantil =
        'Sociedad Mercantil Compradora con expediente KYC y titularidad verificada en Banesco Banco Universal (0134)';
    }

    return {
      id: `cont-ant-${idx + 1}`,
      numeroContrato: `CONT-ANT-ONI-2026-${String(idx + 1).padStart(3, '0')}`,
      voucherIdVinculado: v.id,
      numeroComprobanteVinculado: v.numeroComprobante,
      ciudadSuscripcion: 'Araure, Estado Portuguesa',
      fechaSuscripcion: v.fechaEmision,
      cicloZafra: 'Cosecha Cafetalera Nacional 2026–2027',
      plazoEntregaTexto: 'Octubre 2026 a Enero 2027 (Cierre de Beneficio y Trilla)',
      empresaRazonSocial: oniCompany.razonSocial || 'AGRÍCOLA ONI, C.A.',
      empresaRif: oniCompany.rif || 'J-50145638-0',
      empresaRegistroMercantil:
        oniCompany.registroMercantil ||
        'Inscrita en el Registro Mercantil Primero del Estado Portuguesa, bajo el N° 28, Tomo 12-A',
      empresaDomicilio:
        oniCompany.domicilioFiscal ||
        'Zona Industrial Araure-Acarigua, Galpón N° 4, Municipio Araure, Estado Portuguesa',
      empresaRepresentanteNombre: oniCompany.representanteLegal || 'JUNTA DIRECTIVA AGRÍCOLA ONI',
      empresaRepresentanteCedula: 'V-13.456.789',
      empresaRepresentanteCargo: 'Director / Presidente Ejecutivo',
      empresaCuentaBanescoBs: '0134-0342-18-3421089912',
      tipoPersonaCliente: isNatural ? 'NATURAL' : 'JURIDICA',
      clienteRazonSocialONombre: v.contraparteNombre,
      clienteRifOCedula: v.contraparteRifOCedula,
      clienteRegistroMercantilOActividad: regMercantil,
      clienteDomicilioFiscal:
        'Eje Agroindustrial Centro-Occidental (Portuguesa / Lara / Distrito Capital), República Bolivariana de Venezuela',
      clienteRepresentanteNombre: repNombre,
      clienteRepresentanteCedula: repCedula,
      clienteRepresentanteCargo: isNatural
        ? 'Productor / Comprador Titular por su Propio Derecho'
        : 'Presidente / Representante Legal',
      clienteTelefono: '+58 (414) 555-8290',
      clienteCorreo: 'administracion.compras@clienteagro.com.ve',
      clienteBancoOrigen: v.bancoContraparte,
      clienteNumeroCuentaOrigen: v.numeroCuentaContraparte,
      referenciasBancariasBanesco: v.referenciaBancariaBanesco,
      fechaAbonoBancario: v.fechaEmision,
      montoAnticipoBs: v.montoOperacionBs,
      tasaBcvReferencial: v.tasaBcvAplicada,
      montoEquivalenteUSD: v.montoEquivalenteUSD,
      cuentaContablePasivo:
        v.lineasAsientoContable[1]?.codigoCuenta +
        ' — ' +
        (v.lineasAsientoContable[1]?.nombreCuenta ||
          'Anticipos Recibidos de Clientes (Pasivo NIIF 15)'),
      rubroDescripcion:
        'Café Verde en Grano Crudo / Pergamino Seco de Trilla (Arábica Lavado — Código Arancelario 0901.11.00, Exento de IVA s/Art. 18 Ley de IVA)',
      calidadEspecificacion:
        'Humedad máx. 12,0% · Merma de trilla controlada · Cero fermento · Saco de polipropileno/yute de 46 Kg netos (1 Quintal)',
      precioReferencialUsdPorQQ: precioQQ,
      quintalesComprometidosQQ: qqEstimados,
      kilosComprometidosKg: kgEstimados,
      lugarEntregaFisica:
        'Romana y Almacén Central de AGRÍCOLA ONI, C.A., Zona Industrial Araure-Acarigua, Estado Portuguesa',
      guiaSicaInsaiCondicion:
        'Cada despacho irá acompañado de su Guía de Movilización Vegetal INSAI (RUNSAI), Nota de Peso en Romana y Factura Fiscal SENIAT (Providencia 0071).',
      modoFormatoEnBlancoParaMano: false,
      estadoContrato: 'BORRADOR_LISTO_PARA_FIRMA',
    };
  });
};

export const AgricolaOniClientAdvanceContractView: React.FC<
  AgricolaOniClientAdvanceContractViewProps
> = ({ companies, initialVoucherId, onNavigateToModule }) => {
  const oniCompany =
    companies.find(
      (c) =>
        c.id === 'emp-oni' ||
        c.id.endsWith('_emp-oni') ||
        c.razonSocial.toUpperCase().includes('ONI')
    ) || companies[0];

  const [contracts, setContracts] = useState<ClientAdvanceContractRecord[]>(() => {
    try {
      const saved = localStorage.getItem('nominus_oni_client_advance_contracts_2026_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 17) {
          return parsed;
        }
      }
      return buildInitialContractsFromVouchers(oniCompany);
    } catch {
      return buildInitialContractsFromVouchers(oniCompany);
    }
  });

  const [selectedContractId, setSelectedContractId] = useState<string>(() => {
    if (initialVoucherId) {
      const found = contracts.find((c) => c.voucherIdVinculado === initialVoucherId);
      if (found) return found.id;
    }
    return contracts[0]?.id || 'cont-ant-1';
  });

  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [activeSignaturePad, setActiveSignaturePad] = useState<'NONE' | 'CLIENTE' | 'EMPRESA'>(
    'NONE'
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const scanFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialVoucherId) {
      const found = contracts.find((c) => c.voucherIdVinculado === initialVoucherId);
      if (found) setSelectedContractId(found.id);
    }
  }, [initialVoucherId, contracts]);

  useEffect(() => {
    try {
      localStorage.setItem(
        'nominus_oni_client_advance_contracts_2026_v1',
        JSON.stringify(contracts)
      );
    } catch {
      // Ignore storage quota issues
    }
  }, [contracts]);

  const activeContract =
    contracts.find((c) => c.id === selectedContractId) || contracts[0];

  const fmtBs = (n: number) =>
    n.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const fmtUSD = (n: number) =>
    n.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleFieldChange = <K extends keyof ClientAdvanceContractRecord>(
    field: K,
    value: ClientAdvanceContractRecord[K]
  ) => {
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id !== activeContract.id) return c;
        const updated = { ...c, [field]: value };

        // Recalcular automáticamente USD y Quintales si cambian Bs, Tasa o Precio/QQ
        if (
          field === 'montoAnticipoBs' ||
          field === 'tasaBcvReferencial' ||
          field === 'precioReferencialUsdPorQQ'
        ) {
          const bs = Number(updated.montoAnticipoBs) || 0;
          const tasa = Number(updated.tasaBcvReferencial) || 1;
          const precioQQ = Number(updated.precioReferencialUsdPorQQ) || 195;
          const usd = Math.round((bs / tasa) * 100) / 100;
          const qq = Math.max(1, Math.round((usd / precioQQ) * 100) / 100);
          const kg = Math.round(qq * 46 * 100) / 100;
          updated.montoEquivalenteUSD = usd;
          updated.quintalesComprometidosQQ = qq;
          updated.kilosComprometidosKg = kg;
        }
        return updated;
      })
    );
  };

  // Activar/Desactivar modo plantilla en blanco con líneas para llenar a mano
  const handleToggleBlankMode = () => {
    handleFieldChange(
      'modoFormatoEnBlancoParaMano',
      !activeContract.modoFormatoEnBlancoParaMano
    );
    setStatusBanner(
      !activeContract.modoFormatoEnBlancoParaMano
        ? 'Modo Plantilla en Blanco activado: El contrato muestra líneas guía para ser llenado a mano y firmado físicamente por el cliente.'
        : 'Modo Datos Completos activado: El contrato autocompleta todos los datos del cliente y de las transferencias Banesco.'
    );
  };

  // Crear un nuevo contrato personalizado para otro cliente
  const handleCreateNewClientContract = () => {
    const nextIdx = contracts.length + 1;
    const newContract: ClientAdvanceContractRecord = {
      ...activeContract,
      id: `cont-ant-custom-${Date.now()}`,
      numeroContrato: `CONT-ANT-ONI-2026-${String(nextIdx).padStart(3, '0')}`,
      voucherIdVinculado: 'custom',
      numeroComprobanteVinculado: `COMP-ANT-CLI-2026-${String(nextIdx).padStart(3, '0')}`,
      fechaSuscripcion: '31/08/2026',
      clienteRazonSocialONombre: 'NUEVO CLIENTE COMPRADOR DE CAFÉ, C.A.',
      clienteRifOCedula: 'J-00000000-0',
      clienteRepresentanteNombre: 'NOMBRE DEL REPRESENTANTE LEGAL',
      clienteRepresentanteCedula: 'V-00.000.000',
      referenciasBancariasBanesco: 'REFERENCIA BANCARIA BANESCO',
      montoAnticipoBs: 10000000.0,
      tasaBcvReferencial: 740.0,
      montoEquivalenteUSD: 13513.51,
      quintalesComprometidosQQ: 69.3,
      kilosComprometidosKg: 3187.8,
      modoFormatoEnBlancoParaMano: false,
      firmaClienteDataUrl: undefined,
      firmaEmpresaDataUrl: undefined,
      estadoContrato: 'BORRADOR_LISTO_PARA_FIRMA',
    };
    setContracts((prev) => [newContract, ...prev]);
    setSelectedContractId(newContract.id);
    setStatusBanner(
      `Se ha creado el nuevo contrato ${newContract.numeroContrato}. Edita los campos del cliente abajo y descárgalo en PDF o Word.`
    );
  };

  // Funciones del Lienzo de Firma Digital (Mouse + Touch)
  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX =
      'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY =
      'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX =
      'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY =
      'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveCanvasSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    if (activeSignaturePad === 'CLIENTE') {
      handleFieldChange('firmaClienteDataUrl', dataUrl);
      handleFieldChange('estadoContrato', 'FIRMADO_DIGITALMENTE_EN_APP');
      setStatusBanner(
        `Firma digital del cliente (${activeContract.clienteRazonSocialONombre}) estampada e incrustada en el contrato ${activeContract.numeroContrato}.`
      );
    } else if (activeSignaturePad === 'EMPRESA') {
      handleFieldChange('firmaEmpresaDataUrl', dataUrl);
      handleFieldChange('estadoContrato', 'FIRMADO_DIGITALMENTE_EN_APP');
      setStatusBanner(
        `Firma digital del Representante de ${activeContract.empresaRazonSocial} estampada en el contrato ${activeContract.numeroContrato}.`
      );
    }
    setActiveSignaturePad('NONE');
  };

  // Subir contrato ya impreso, firmado y sellado en físico (calculando SHA-256)
  const handleUploadSignedContractFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const sha256 =
        'SHA256-' +
        hashArray
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
          .slice(0, 28)
          .toUpperCase();

      const nowStr = new Date().toLocaleDateString('es-VE');
      setContracts((prev) =>
        prev.map((c) =>
          c.id === activeContract.id
            ? {
                ...c,
                archivoEscaneadoNombre: file.name,
                archivoEscaneadoFecha: nowStr,
                archivoEscaneadoSha256: sha256,
                estadoContrato: 'FIRMADO_Y_SELLADO_ESCANEADO',
              }
            : c
        )
      );
      setStatusBanner(
        `Contrato firmado y sellado "${file.name}" archivado con huella criptográfica ${sha256}.`
      );
    } catch {
      setStatusBanner('Error al procesar el archivo escaneado.');
    }
  };

  // Helper para renderizar valor o línea en blanco si está en modo manual
  const valOrBlank = (val: string, blankDots = '________________________________________') =>
    activeContract.modoFormatoEnBlancoParaMano ? blankDots : val;

  // ============================================================================
  // GENERADOR DE PDF OFICIAL DE UN CONTRATO (O LOTE DE CONTRATOS)
  // ============================================================================
  const renderContractToPdfDoc = (
    doc: jsPDF,
    c: ClientAdvanceContractRecord,
    startOnNewPage: boolean
  ) => {
    if (startOnNewPage) {
      doc.addPage();
    }

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const usableWidth = pageWidth - margin * 2;
    let y = 14;

    const vBlank = (txt: string, dots = '____________________________') =>
      c.modoFormatoEnBlancoParaMano ? dots : txt;

    // Cintillo Superior Institucional
    doc.setFillColor(20, 83, 45); // Verde Agrícola #14532D
    doc.rect(margin, y, usableWidth, 16, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(
      `${c.empresaRazonSocial} — RIF: ${c.empresaRif}`,
      margin + 4,
      y + 6.2
    );
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'EXPEDIENTE DE CUMPLIMIENTO BANCARIO (SUDEBAN RES. 083.18) · CONTABILIDAD VEN-NIF (NIIF 15) · SENIAT',
      margin + 4,
      y + 12
    );
    doc.setFont('helvetica', 'bold');
    doc.text(c.numeroContrato, pageWidth - margin - 4, y + 6.2, {
      align: 'right',
    });
    doc.setFontSize(7.5);
    doc.text(
      `Comp. Contable: ${c.numeroComprobanteVinculado}`,
      pageWidth - margin - 4,
      y + 12,
      { align: 'right' }
    );

    y += 21;

    // Título del Contrato
    doc.setTextColor(28, 25, 23);
    doc.setFont('times', 'bold');
    doc.setFontSize(11.5);
    const titleLines = doc.splitTextToSize(
      'CONTRATO MERCANTIL DE SUMINISTRO A FUTURO DE CAFÉ VERDE EN GRANO, RECEPCIÓN DE ANTICIPO DE CLIENTES (PASIVO CUENTA 2.1.04.01 NIIF 15) Y DECLARACIÓN JURADA DE ORIGEN Y DESTINO LÍCITO DE FONDOS',
      usableWidth
    );
    doc.text(titleLines, pageWidth / 2, y, { align: 'center' });
    y += titleLines.length * 4.8 + 2;

    // Subtítulo de Identificación Rápida
    doc.setDrawColor(180, 83, 9);
    doc.setFillColor(254, 243, 199);
    doc.rect(margin, y, usableWidth, 10, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(120, 53, 15);
    doc.text(
      `LUGAR Y FECHA: ${vBlank(c.ciudadSuscripcion, '____________________')}, ${vBlank(
        c.fechaSuscripcion,
        '___/___/2026'
      )}   |   MONTO ANTICIPO: Bs. ${vBlank(
        fmtBs(c.montoAnticipoBs),
        '__________________'
      )} (Ref. USD ${vBlank(fmtUSD(c.montoEquivalenteUSD), '____________')})`,
      pageWidth / 2,
      y + 6.3,
      { align: 'center' }
    );
    y += 14;

    // Cuerpo introductorio "Entre nosotros..."
    doc.setFont('times', 'normal');
    doc.setFontSize(9.3);
    doc.setTextColor(20, 20, 20);

    const introParagraph = `Entre nosotros, por una parte la sociedad mercantil ${c.empresaRazonSocial}, titular del Registro de Información Fiscal (RIF) N° ${c.empresaRif}, ${c.empresaRegistroMercantil}, con domicilio fiscal en ${c.empresaDomicilio}, representada en este acto por su ${c.empresaRepresentanteCargo}, ciudadano(a) ${c.empresaRepresentanteNombre}, venezolano(a), mayor de edad, titular de la Cédula de Identidad N° ${c.empresaRepresentanteCedula}, suficientemente facultado(a) para este acto, quien en lo adelante y a los efectos del presente contrato se denominará "LA EMPRESA SUMINISTRADORA"; y por la otra parte, ${vBlank(
      c.clienteRazonSocialONombre,
      '________________________________________________'
    )}, titular del RIF / Cédula de Identidad N° ${vBlank(
      c.clienteRifOCedula,
      '________________________'
    )}, (${vBlank(
      c.clienteRegistroMercantilOActividad,
      '____________________________________________________'
    )}), con domicilio fiscal en ${vBlank(
      c.clienteDomicilioFiscal,
      '____________________________________________________'
    )}, representada en este acto por ${vBlank(
      c.clienteRepresentanteNombre,
      '________________________________________'
    )}, titular de la Cédula de Identidad N° ${vBlank(
      c.clienteRepresentanteCedula,
      '________________'
    )}, en su carácter de ${vBlank(
      c.clienteRepresentanteCargo,
      '________________________'
    )}, quien en lo adelante se denominará "EL CLIENTE COMPRADOR"; y conjuntamente denominadas "LAS PARTES", se ha convenido en celebrar el presente CONTRATO DE ANTICIPO COMERCIAL PARA SUMINISTRO DE COSECHA CAFETALERA, regido por las cláusulas siguientes:`;

    const introLines = doc.splitTextToSize(introParagraph, usableWidth);
    doc.text(introLines, margin, y, { align: 'justify', maxWidth: usableWidth });
    y += introLines.length * 3.9 + 3;

    const clauses = [
      {
        titulo: 'CLÁUSULA PRIMERA (OBJETO DEL CONTRATO Y SUMINISTRO FÍSICO):',
        texto: `"LA EMPRESA SUMINISTRADORA", en su condición de productora, acopiadora y beneficiadora agroindustrial, se compromete a suministrar, acondicionar, trillar y entregar a favor de "EL CLIENTE COMPRADOR" la cantidad estimada de ${vBlank(
          `${fmtUSD(c.quintalesComprometidosQQ)} Quintales (${fmtUSD(
            c.kilosComprometidosKg
          )} Kilogramos netos)`,
          '_____________ Quintales (_____________ Kg netos)'
        )} del rubro ${c.rubroDescripcion}, correspondientes al ciclo de ${
          c.cicloZafra
        }, bajo parámetros de calidad exportación/industrial (${
          c.calidadEspecificacion
        }), a un precio referencial acordado de USD ${vBlank(
          fmtUSD(c.precioReferencialUsdPorQQ),
          '________'
        )} por Quintal de 46 Kg.`,
      },
      {
        titulo: 'CLÁUSULA SEGUNDA (MONTO DEL ANTICIPO Y TRAZABILIDAD BANCARIA EN BANESCO):',
        texto: `Para garantizar la reserva de cupo de cosecha, el acopio en campo y la logística de transporte, "EL CLIENTE COMPRADOR" entrega en calidad de ANTICIPO COMERCIAL A CUENTA DE VENTAS FUTURAS la suma total de BOLÍVARES ${vBlank(
          `Bs. ${fmtBs(c.montoAnticipoBs)}`,
          'Bs. ________________________'
        )} (equivalentes referencialmente a USD ${vBlank(
          fmtUSD(c.montoEquivalenteUSD),
          '________________'
        )} calculados a la tasa oficial del Banco Central de Venezuela de Bs. ${vBlank(
          fmtBs(c.tasaBcvReferencial),
          '________'
        )}/USD vigente en la fecha del abono), pagados íntegramente mediante transferencia(s) bancaria(s) desde la cuenta titular de "EL CLIENTE COMPRADOR" en el banco ${vBlank(
          c.clienteBancoOrigen,
          '________________________'
        )} (Cta. ${vBlank(
          c.clienteNumeroCuentaOrigen,
          '________________________'
        )}) hacia la Cuenta Corriente N° ${
          c.empresaCuentaBanescoBs
        } de BANESCO BANCO UNIVERSAL, C.A., titularidad de ${
          c.empresaRazonSocial
        }, según el detalle siguiente:`,
      },
    ];

    clauses.forEach((cl) => {
      doc.setFont('times', 'bold');
      doc.setFontSize(9.2);
      doc.text(cl.titulo, margin, y);
      y += 3.8;
      doc.setFont('times', 'normal');
      const lines = doc.splitTextToSize(cl.texto, usableWidth);
      doc.text(lines, margin, y, { align: 'justify', maxWidth: usableWidth });
      y += lines.length * 3.8 + 2.5;
    });

    // Tabla Anexa de Transferencia Bancaria Conciliada
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [
        [
          'Fecha Abono',
          'Banco Origen / Canal',
          'Referencia Banesco / SGLBTR',
          'Monto Anticipo (Bs.)',
          'Tasa BCV',
          'Equivalente (USD)',
          'Quintales (QQ)',
        ],
      ],
      body: [
        [
          vBlank(c.fechaAbonoBancario, '___/___/2026'),
          vBlank(c.clienteBancoOrigen, '________________'),
          vBlank(c.referenciasBancariasBanesco, '____________________'),
          vBlank(`Bs. ${fmtBs(c.montoAnticipoBs)}`, 'Bs. ______________'),
          vBlank(fmtBs(c.tasaBcvReferencial), '________'),
          vBlank(`USD ${fmtUSD(c.montoEquivalenteUSD)}`, 'USD ____________'),
          vBlank(`${fmtUSD(c.quintalesComprometidosQQ)} QQ`, '_______ QQ'),
        ],
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [20, 83, 45],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 7.8,
        textColor: [28, 25, 23],
        fontStyle: 'bold',
      },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;

    const remainingClauses = [
      {
        titulo:
          'CLÁUSULA TERCERA (TRATAMIENTO CONTABLE VEN-NIF / NIIF 15 Y FACTURACIÓN FISCAL SENIAT):',
        texto: `"LAS PARTES" reconocen expresamente que, conforme a los Principios de Contabilidad Generalmente Aceptados en Venezuela (VEN-NIF / NIIF 15 "Ingresos de Actividades Ordinarias Procedentes de Contratos con Clientes"), los fondos recibidos constituyen un PASIVO POR CONTRATO (registrado en la cuenta de pasivo N° 2.1.04.01 "Anticipos Recibidos de Clientes" bajo el Comprobante Contable N° ${c.numeroComprobanteVinculado}) y NO constituyen un ingreso devengado en el Estado de Resultados hasta tanto se verifique el pesaje en romana, el despacho físico del café y la emisión de la Factura Fiscal definitiva conforme a la Providencia Administrativa SENIAT SNAT/2011/0071. De acuerdo con el Artículo 13 de la Ley del IVA, el hecho imponible se perfecciona con la entrega del bien mueble, estando además el café verde en grano crudo EXENTO de IVA según el Artículo 18 numeral 1 eiusdem. Asimismo, los abonos en Bolívares están sujetos a la alícuota del 0% de IGTF conforme al Decreto Presidencial N° 4.972 (Gaceta Oficial Extraordinaria N° 6.821 del 12/07/2024).`,
      },
      {
        titulo:
          'CLÁUSULA CUARTA (APLICACIÓN PRODUCTIVA DE LOS FONDOS E INEXISTENCIA DE INTERMEDIACIÓN CAMBIARIA):',
        texto: `"EL CLIENTE COMPRADOR" autoriza a "LA EMPRESA SUMINISTRADORA" a aplicar la totalidad de los Bolívares recibidos en el giro operativo agrícola propio: (i) pago a productores primarios y recolectores de café verde en campo, (ii) fletes terrestres e insumos de trilla, y (iii) adquisición lícita de divisas a través de los mecanismos oficiales de Intervención Cambiaria / Mesa de Cambio de Banesco Banco Universal (Convenio Cambiario N° 1 del BCV) para cubrir costos dolarizados de cosecha e insumos importados. Queda terminantemente prohibida cualquier cesión de divisas a terceros; "EL CLIENTE COMPRADOR" recibirá única y exclusivamente el producto agrícola físico (Café Verde en Grano) debidamente facturado.`,
      },
      {
        titulo:
          'CLÁUSULA QUINTA (DECLARACIÓN JURADA DE ORIGEN LÍCITO DE FONDOS — SUDEBAN RES. 083.18 Y LOCDOFT):',
        texto: `En cumplimiento del Artículo 35 de la Resolución N° 083.18 de la SUDEBAN y de la Ley Orgánica Contra la Delincuencia Organizada y Financiamiento al Terrorismo (LOCDOFT), "EL CLIENTE COMPRADOR" declara bajo fe de juramento que los fondos transferidos a la cuenta de "LA EMPRESA SUMINISTRADORA" en Banesco tienen origen estrictamente lícito, provienen de su actividad comercial legítima en el sector agroalimentario y no guardan relación alguna con delitos cambiarios, legitimación de capitales ni actividades ilícitas. Las partes eligen como domicilio especial la ciudad de Araure, Estado Portuguesa.`,
      },
    ];

    remainingClauses.forEach((cl) => {
      if (y > pageHeight - 62) {
        doc.addPage();
        y = 16;
      }
      doc.setFont('times', 'bold');
      doc.setFontSize(8.8);
      doc.text(cl.titulo, margin, y);
      y += 3.6;
      doc.setFont('times', 'normal');
      const lines = doc.splitTextToSize(cl.texto, usableWidth);
      doc.text(lines, margin, y, { align: 'justify', maxWidth: usableWidth });
      y += lines.length * 3.6 + 2.2;
    });

    // Bloque de Firmas, Sello Húmedo y Huella Dactilar
    if (y > pageHeight - 52) {
      doc.addPage();
      y = 20;
    } else {
      y += 2;
    }

    const boxWidth = (usableWidth - 8) / 2;
    const boxHeight = 42;

    // Recuadro Izquierdo: LA EMPRESA SUMINISTRADORA
    doc.setDrawColor(120, 113, 108);
    doc.setFillColor(250, 248, 245);
    doc.rect(margin, y, boxWidth, boxHeight, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(20, 83, 45);
    doc.text(
      'POR "LA EMPRESA SUMINISTRADORA" (FIRMA Y SELLO HÚMEDO)',
      margin + 3,
      y + 5
    );

    if (c.firmaEmpresaDataUrl) {
      try {
        doc.addImage(c.firmaEmpresaDataUrl, 'PNG', margin + 12, y + 7, 45, 16);
      } catch {
        // Ignore image error
      }
    }

    doc.setDrawColor(168, 162, 158);
    doc.line(margin + 6, y + 26, margin + boxWidth - 6, y + 26);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(28, 25, 23);
    doc.text(`${c.empresaRazonSocial} (${c.empresaRif})`, margin + 6, y + 30.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(
      `Rep. Legal: ${c.empresaRepresentanteNombre} | C.I.: ${c.empresaRepresentanteCedula}`,
      margin + 6,
      y + 34.5
    );
    doc.text(
      `Cargo: ${c.empresaRepresentanteCargo} | Cta. Banesco: ${c.empresaCuentaBanescoBs}`,
      margin + 6,
      y + 38.5
    );

    // Recuadro Derecho: EL CLIENTE COMPRADOR + Huella Dactilar
    const rightX = margin + boxWidth + 8;
    doc.setDrawColor(120, 113, 108);
    doc.setFillColor(250, 248, 245);
    doc.rect(rightX, y, boxWidth, boxHeight, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(180, 83, 9);
    doc.text(
      'POR "EL CLIENTE COMPRADOR" (FIRMA, SELLO Y HUELLA)',
      rightX + 3,
      y + 5
    );

    if (c.firmaClienteDataUrl) {
      try {
        doc.addImage(c.firmaClienteDataUrl, 'PNG', rightX + 8, y + 7, 42, 16);
      } catch {
        // Ignore image error
      }
    }

    // Recuadro de Huella Dactilar dentro del bloque del cliente
    const huellaW = 18;
    const huellaH = 22;
    const huellaX = rightX + boxWidth - huellaW - 3;
    const huellaY = y + 7;
    doc.setDrawColor(168, 162, 158);
    doc.rect(huellaX, huellaY, huellaW, huellaH, 'D');
    doc.setFontSize(5.5);
    doc.setTextColor(120, 113, 108);
    doc.text('HUELLA', huellaX + huellaW / 2, huellaY + 19, { align: 'center' });
    doc.text('PULGAR DER.', huellaX + huellaW / 2, huellaY + 21.2, {
      align: 'center',
    });

    doc.line(rightX + 5, y + 26, huellaX - 3, y + 26);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(28, 25, 23);
    doc.text(
      vBlank(
        `${c.clienteRazonSocialONombre.slice(0, 38)}`,
        'Cliente: _______________________________'
      ),
      rightX + 5,
      y + 30.5
    );
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.text(
      vBlank(
        `RIF/C.I.: ${c.clienteRifOCedula.slice(0, 36)}`,
        'RIF / Cédula: __________________________'
      ),
      rightX + 5,
      y + 34.5
    );
    doc.text(
      vBlank(
        `Firmante: ${c.clienteRepresentanteNombre.slice(0, 26)} (${c.clienteRepresentanteCedula})`,
        'Firmante y C.I.: ________________________'
      ),
      rightX + 5,
      y + 38.5
    );
  };

  // Descargar el contrato actual en PDF
  const handleDownloadSinglePdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter',
    });
    renderContractToPdfDoc(doc, activeContract, false);
    const cleanName = activeContract.clienteRazonSocialONombre
      .replace(/[^a-zA-Z0-9]/g, '_')
      .slice(0, 25);
    doc.save(`${activeContract.numeroContrato}_${cleanName}.pdf`);
    setStatusBanner(
      `Contrato ${activeContract.numeroContrato} descargado exitosamente en formato PDF oficial tamaño Carta.`
    );
  };

  // Descargar todos los 17 contratos de anticipo en un solo PDF Multipágina
  const handleDownloadBatchAllContractsPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter',
    });
    contracts.forEach((c, index) => {
      renderContractToPdfDoc(doc, c, index > 0);
    });
    doc.save(
      `Lote_${contracts.length}_Contratos_Anticipo_Clientes_Agricola_Oni_Ene_Ago_2026.pdf`
    );
    setStatusBanner(
      `Lote completo de los ${contracts.length} Contratos de Anticipo de Clientes (Bs. 1.571.513.047,62 / USD 2.317.822,22) descargado en un único PDF multipágina.`
    );
  };

  // Descargar el contrato actual en Word Editable (.doc)
  const handleDownloadWord = () => {
    const c = activeContract;
    const vBlank = (txt: string, dots = '________________________________') =>
      c.modoFormatoEnBlancoParaMano ? dots : txt;

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${c.numeroContrato}</title>
        <style>
          @page { size: 8.5in 11in; margin: 0.75in; }
          body { font-family: 'Times New Roman', serif; font-size: 11pt; color: #111827; line-height: 1.45; }
          .header-box { background-color: #14532D; color: #ffffff; padding: 10px 14px; font-family: Arial, sans-serif; margin-bottom: 12px; }
          .title { text-align: center; font-weight: bold; font-size: 12.5pt; text-transform: uppercase; margin: 10px 0; }
          .summary-bar { background-color: #FEF3C7; border: 1px solid #B45309; padding: 8px; text-align: center; font-family: Arial, sans-serif; font-size: 9.5pt; font-weight: bold; margin-bottom: 12px; }
          p { text-align: justify; margin: 8px 0; }
          .clause-title { font-weight: bold; text-transform: uppercase; }
          table.bank-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-family: Arial, sans-serif; font-size: 9pt; }
          table.bank-table th { background-color: #14532D; color: #ffffff; border: 1px solid #14532D; padding: 6px; text-align: left; }
          table.bank-table td { border: 1px solid #9CA3AF; padding: 6px; font-weight: bold; }
          table.sig-table { width: 100%; border-collapse: collapse; margin-top: 22px; font-family: Arial, sans-serif; font-size: 9pt; }
          table.sig-table td { width: 50%; border: 1px solid #6B7280; padding: 12px; vertical-align: top; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <strong>${c.empresaRazonSocial} — RIF: ${c.empresaRif}</strong><br/>
          <span style="font-size: 8.5pt;">CONTRATO N°: ${c.numeroContrato} | COMPROBANTE CONTABLE VINCULADO: ${c.numeroComprobanteVinculado} | CUENTA PASIVO VEN-NIF: 2.1.04.01</span>
        </div>

        <div class="title">
          CONTRATO MERCANTIL DE SUMINISTRO A FUTURO DE CAFÉ VERDE EN GRANO, RECEPCIÓN DE ANTICIPO DE CLIENTES (NIIF 15) Y DECLARACIÓN JURADA DE ORIGEN Y DESTINO LÍCITO DE FONDOS
        </div>

        <div class="summary-bar">
          LUGAR Y FECHA: ${vBlank(c.ciudadSuscripcion)}, ${vBlank(c.fechaSuscripcion)} &nbsp;|&nbsp;
          MONTO DEL ANTICIPO: Bs. ${vBlank(fmtBs(c.montoAnticipoBs))} (Equiv. Ref. USD ${vBlank(fmtUSD(c.montoEquivalenteUSD))} a Tasa BCV Bs. ${vBlank(fmtBs(c.tasaBcvReferencial))}/USD)
        </div>

        <p>
          Entre nosotros, por una parte la sociedad mercantil <strong>${c.empresaRazonSocial}</strong>, titular del RIF N° <strong>${c.empresaRif}</strong>, ${c.empresaRegistroMercantil}, con domicilio fiscal en ${c.empresaDomicilio}, representada en este acto por su ${c.empresaRepresentanteCargo}, ciudadano(a) <strong>${c.empresaRepresentanteNombre}</strong>, titular de la Cédula de Identidad N° <strong>${c.empresaRepresentanteCedula}</strong>, quien en lo adelante se denominará <strong>"LA EMPRESA SUMINISTRADORA"</strong>; y por la otra parte, <strong>${vBlank(c.clienteRazonSocialONombre)}</strong>, titular del RIF / Cédula de Identidad N° <strong>${vBlank(c.clienteRifOCedula)}</strong> (${vBlank(c.clienteRegistroMercantilOActividad)}), con domicilio fiscal en ${vBlank(c.clienteDomicilioFiscal)}, representada por <strong>${vBlank(c.clienteRepresentanteNombre)}</strong>, titular de la Cédula de Identidad N° <strong>${vBlank(c.clienteRepresentanteCedula)}</strong>, en su carácter de ${vBlank(c.clienteRepresentanteCargo)}, quien en lo adelante se denominará <strong>"EL CLIENTE COMPRADOR"</strong>; se ha convenido en celebrar el presente <strong>CONTRATO DE ANTICIPO COMERCIAL PARA SUMINISTRO DE COSECHA CAFETALERA</strong>, al tenor de las cláusulas siguientes:
        </p>

        <p>
          <span class="clause-title">CLÁUSULA PRIMERA (OBJETO Y CANTIDAD COMPROMETIDA):</span> "LA EMPRESA SUMINISTRADORA" se obliga a acopiar, beneficiar, trillar y suministrar a favor de "EL CLIENTE COMPRADOR" la cantidad estimada de <strong>${vBlank(`${fmtUSD(c.quintalesComprometidosQQ)} Quintales (${fmtUSD(c.kilosComprometidosKg)} Kg netos)`)}</strong> de <strong>${c.rubroDescripcion}</strong> (${c.calidadEspecificacion}), correspondientes a la <strong>${c.cicloZafra}</strong>, a un precio referencial acordado de <strong>USD ${vBlank(fmtUSD(c.precioReferencialUsdPorQQ))} por Quintal (46 Kg)</strong>, con entrega física programada en <strong>${c.lugarEntregaFisica}</strong> durante el período <strong>${c.plazoEntregaTexto}</strong>.
        </p>

        <p>
          <span class="clause-title">CLÁUSULA SEGUNDA (MONTO DEL ANTICIPO Y TRAZABILIDAD BANCARIA EN BANESCO):</span> "EL CLIENTE COMPRADOR" entrega en este acto en calidad de <strong>ANTICIPO COMERCIAL A CUENTA DE VENTAS FUTURAS</strong> la cantidad de <strong>BOLÍVARES ${vBlank(`Bs. ${fmtBs(c.montoAnticipoBs)}`)}</strong> (equivalentes referenciales a <strong>USD ${vBlank(fmtUSD(c.montoEquivalenteUSD))}</strong> a la tasa oficial BCV de Bs. ${vBlank(fmtBs(c.tasaBcvReferencial))}/USD), abonados mediante transferencia(s) bancaria(s) desde su cuenta titular en <strong>${vBlank(c.clienteBancoOrigen)}</strong> (Cta. N° ${vBlank(c.clienteNumeroCuentaOrigen)}) hacia la Cuenta Corriente N° <strong>${c.empresaCuentaBanescoBs}</strong> en <strong>BANESCO BANCO UNIVERSAL, C.A.</strong> a nombre de <strong>${c.empresaRazonSocial}</strong>:
        </p>

        <table class="bank-table">
          <thead>
            <tr>
              <th>Fecha Abono</th>
              <th>Banco Origen Cliente</th>
              <th>Referencia Banesco / SGLBTR</th>
              <th>Monto Anticipo (Bs.)</th>
              <th>Tasa BCV</th>
              <th>Equivalente (USD)</th>
              <th>Volumen Café (QQ)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${vBlank(c.fechaAbonoBancario)}</td>
              <td>${vBlank(c.clienteBancoOrigen)}</td>
              <td>${vBlank(c.referenciasBancariasBanesco)}</td>
              <td>Bs. ${vBlank(fmtBs(c.montoAnticipoBs))}</td>
              <td>Bs. ${vBlank(fmtBs(c.tasaBcvReferencial))}</td>
              <td>USD ${vBlank(fmtUSD(c.montoEquivalenteUSD))}</td>
              <td>${vBlank(fmtUSD(c.quintalesComprometidosQQ))} QQ</td>
            </tr>
          </tbody>
        </table>

        <p>
          <span class="clause-title">CLÁUSULA TERCERA (NATURALEZA CONTABLE PASIVO NIIF 15, IVA E IGTF 0%):</span> De conformidad con la norma internacional <strong>VEN-NIF / NIIF 15</strong>, el presente anticipo se registra contablemente como un <strong>PASIVO POR CONTRATO (Cuenta 2.1.04.01 "Anticipos Recibidos de Clientes" — Comprobante ${c.numeroComprobanteVinculado})</strong> y no constituye ingreso devengado en el Estado de Resultados hasta la entrega física del café en romana y la emisión de la Factura Fiscal definitiva (Providencia SENIAT SNAT/2011/0071). Conforme al Artículo 13 de la Ley del IVA, el hecho imponible se genera con la entrega del bien, estando el café en grano crudo EXENTO de IVA (Art. 18 Ley de IVA). Las transferencias en Bolívares están sujetas a la alícuota del <strong>0% de IGTF</strong> según el <strong>Decreto Presidencial N° 4.972 (Gaceta Oficial Extraordinaria N° 6.821 del 12/07/2024)</strong>.
        </p>

        <p>
          <span class="clause-title">CLÁUSULA CUARTA (DESTINO PRODUCTIVO Y EXCLUSIÓN DE INTERMEDIACIÓN CAMBIARIA):</span> "EL CLIENTE COMPRADOR" autoriza expresamente a "LA EMPRESA SUMINISTRADORA" a utilizar los Bolívares recibidos en la liquidación de cosecha a caficultores, pago de fletes, trilla y adquisición lícita de divisas en la Mesa de Cambio de Banesco Banco Universal (Convenio Cambiario N° 1 del BCV) para cubrir costos dolarizados de procura agrícola. Queda prohibida toda entrega de divisas a "EL CLIENTE COMPRADOR", quien recibirá exclusivamente el café verde físico facturado.
        </p>

        <p>
          <span class="clause-title">CLÁUSULA QUINTA (DECLARACIÓN JURADA SUDEBAN RES. 083.18 Y LOCDOFT):</span> "EL CLIENTE COMPRADOR" declara bajo fe de juramento que los fondos transferidos provienen del giro lícito de su actividad comercial agroalimentaria, cumpliendo íntegramente con el Artículo 35 de la Resolución SUDEBAN N° 083.18 y la Ley Orgánica Contra la Delincuencia Organizada y Financiamiento al Terrorismo (LOCDOFT).
        </p>

        <table class="sig-table">
          <tr>
            <td>
              <strong>POR "LA EMPRESA SUMINISTRADORA":</strong><br/><br/><br/><br/>
              ________________________________________________<br/>
              <strong>${c.empresaRazonSocial} (RIF: ${c.empresaRif})</strong><br/>
              Representante Legal: ${c.empresaRepresentanteNombre}<br/>
              C.I. N°: ${c.empresaRepresentanteCedula} | Cargo: ${c.empresaRepresentanteCargo}<br/>
              <em>(Sello Húmedo de la Empresa)</em>
            </td>
            <td>
              <strong>POR "EL CLIENTE COMPRADOR":</strong><br/><br/><br/><br/>
              ________________________________________________<br/>
              <strong>${vBlank(c.clienteRazonSocialONombre)}</strong><br/>
              RIF / C.I. N°: ${vBlank(c.clienteRifOCedula)}<br/>
              Firmante: ${vBlank(c.clienteRepresentanteNombre)} (C.I.: ${vBlank(c.clienteRepresentanteCedula)})<br/>
              <em>(Firma Autógrafa, Sello Húmedo y Huella Dactilar Pulgar Derecho)</em>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const cleanName = c.clienteRazonSocialONombre
      .replace(/[^a-zA-Z0-9]/g, '_')
      .slice(0, 25);
    a.href = url;
    a.download = `${c.numeroContrato}_${cleanName}_Editable.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusBanner(
      `Contrato ${c.numeroContrato} descargado en formato Microsoft Word Editable (.doc).`
    );
  };

  const totalAnticiposBs = contracts.reduce((acc, c) => acc + c.montoAnticipoBs, 0);
  const totalAnticiposUSD = contracts.reduce((acc, c) => acc + c.montoEquivalenteUSD, 0);
  const totalQuintalesQQ = contracts.reduce(
    (acc, c) => acc + c.quintalesComprometidosQQ,
    0
  );

  return (
    <div className="space-y-6">
      {/* Input oculto para subir contrato escaneado firmado y sellado */}
      <input
        ref={scanFileInputRef}
        type="file"
        accept=".pdf,image/*"
        onChange={handleUploadSignedContractFile}
        className="hidden"
      />

      {/* CABECERA EJECUTIVA DEL GENERADOR DE CONTRATOS DE ANTICIPO DE CLIENTES */}
      <div className="no-print bg-gradient-to-r from-[#FEF3C7] via-[#DCFCE7] to-[#E0F2FE] border-2 border-[#B45309] rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-4xl">
            <div className="text-xs font-mono font-bold text-[#78350F] uppercase">
              MÓDULO DE FORMALIZACIÓN CONTRACTUAL CON CLIENTES · CUENTA PASIVO 2.1.04.01 (NIIF 15) · SUDEBAN RES. 083.18
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1C1917] font-display leading-tight">
              Modelo de Contrato de Anticipo de Clientes para Llenar, Firmar y Sellar (AGRÍCOLA ONI, C.A.)
            </h2>
            <p className="text-sm text-[#44403C] leading-relaxed">
              Este módulo genera el <strong>Contrato Mercantil de Anticipo sobre Suministro Futuro de Café Verde en Grano</strong> exigido por la <strong>Unidad de Cumplimiento de Banesco</strong> y el <strong>SENIAT</strong> para respaldar los <strong>Bs. 1.571.513.047,62 (USD 2.317.822,22)</strong> abonados por los clientes entre Enero y Agosto 2026. Puedes <strong>seleccionar cualquiera de los 17 lotes auditados</strong>, editar los datos del cliente en vivo, activar el <strong>Modo Formato en Blanco para llenar a mano</strong>, <strong>firmarlo digitalmente en pantalla</strong> o descargarlo en <strong>PDF y Word</strong>.
            </p>
          </div>

          {/* Botonera Principal de Descarga e Impresión */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleDownloadSinglePdf}
              className="px-4 py-2.5 text-xs font-bold text-white bg-[#15803D] hover:bg-[#14532D] rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Contrato en PDF</span>
            </button>
            <button
              onClick={handleDownloadWord}
              className="px-4 py-2.5 text-xs font-bold text-white bg-[#0369A1] hover:bg-[#075985] rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Descargar en Word (.doc)</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 text-xs font-bold text-[#1C1917] bg-white hover:bg-[#F5F5F4] border border-[#D6D3D1] rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir para Firma</span>
            </button>
          </div>
        </div>

        {/* Resumen de Respaldo Contractual de los 17 Lotes de Anticipos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="bg-white/95 border border-[#FCD34D] rounded-2xl p-3.5">
            <div className="text-[11px] font-bold text-[#78350F] uppercase">
              Total Anticipos Respaldados (Ene-Ago)
            </div>
            <div className="text-lg font-mono font-bold text-[#1C1917] mt-0.5">
              Bs. {fmtBs(totalAnticiposBs)}
            </div>
            <div className="text-xs font-mono font-semibold text-[#B45309]">
              Equiv. BCV: USD {fmtUSD(totalAnticiposUSD)} ({contracts.length} Contratos)
            </div>
          </div>

          <div className="bg-white/95 border border-[#86EFAC] rounded-2xl p-3.5">
            <div className="text-[11px] font-bold text-[#14532D] uppercase">
              Volumen Físico Comprometido (Zafra)
            </div>
            <div className="text-lg font-mono font-bold text-[#14532D] mt-0.5">
              {fmtUSD(totalQuintalesQQ)} QQ Café Verde
            </div>
            <div className="text-xs text-[#166534]">
              Equivalente a {fmtUSD(totalQuintalesQQ * 46)} Kg en Romana
            </div>
          </div>

          <div className="bg-white/95 border border-[#7DD3FC] rounded-2xl p-3.5">
            <div className="text-[11px] font-bold text-[#0369A1] uppercase">
              Blindaje Fiscal y Cambiario Aplicado
            </div>
            <div className="text-sm font-bold text-[#0C4A6E] mt-0.5">
              Pasivo 2.1.04.01 · IVA Exento · IGTF Bs. 0%
            </div>
            <div className="text-xs text-[#0369A1]">
              NIIF 15 · Art. 13 y 18 Ley IVA · Decreto N° 4.972
            </div>
          </div>

          <div className="bg-white/95 border border-[#FDBA74] rounded-2xl p-3.5 flex flex-col justify-between">
            <div className="text-[11px] font-bold text-[#9A3412] uppercase">
              Descarga Masiva en Lote para Banesco
            </div>
            <button
              onClick={handleDownloadBatchAllContractsPdf}
              className="mt-1.5 w-full px-3 py-2 text-xs font-bold text-white bg-[#C2410C] hover:bg-[#9A3412] rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Descargar los {contracts.length} Contratos en 1 PDF</span>
            </button>
          </div>
        </div>

        {statusBanner && (
          <div className="bg-[#14532D] text-white px-4 py-3 rounded-xl text-xs font-medium flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#86EFAC] shrink-0" />
              <span>{statusBanner}</span>
            </div>
            <button
              onClick={() => setStatusBanner(null)}
              className="text-[11px] underline text-[#BBF7D0] hover:text-white cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>

      {/* BARRA DE SELECCIÓN DE CLIENTE / LOTE Y ACCIONES DE FIRMA */}
      <div className="no-print bg-white border border-[#D6D3D1] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
              1. Selecciona el Cliente / Operación de Anticipo Auditada en Banesco (o crea un contrato nuevo):
            </label>
            <select
              value={selectedContractId}
              onChange={(e) => setSelectedContractId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-bold bg-[#FEF3C7]/60 border-2 border-[#F59E0B] rounded-xl text-[#1C1917] focus:outline-none focus:border-[#B45309]"
            >
              {contracts.map((c, idx) => (
                <option key={c.id} value={c.id}>
                  {String(idx + 1).padStart(2, '0')}. [{c.numeroContrato}] {c.fechaSuscripcion} —{' '}
                  {c.clienteRazonSocialONombre.slice(0, 48)} ({c.clienteRifOCedula.slice(0, 22)}) — Bs.{' '}
                  {fmtBs(c.montoAnticipoBs)} (USD {fmtUSD(c.montoEquivalenteUSD)})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleToggleBlankMode}
              className={`px-3.5 py-2.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeContract.modoFormatoEnBlancoParaMano
                  ? 'bg-[#78350F] text-white border-[#78350F]'
                  : 'bg-[#FEF3C7] text-[#78350F] border-[#FCD34D] hover:bg-[#FDE68A]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {activeContract.modoFormatoEnBlancoParaMano
                  ? 'Modo en Blanco Activo (Ver Datos Llenos)'
                  : 'Activar Formato en Blanco (Llenar a Mano)'}
              </span>
            </button>

            <button
              onClick={handleCreateNewClientContract}
              className="px-3.5 py-2.5 text-xs font-bold text-[#14532D] bg-[#DCFCE7] hover:bg-[#BBF7D0] border border-[#86EFAC] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nuevo Cliente en Blanco</span>
            </button>

            <button
              onClick={() =>
                setActiveSignaturePad(
                  activeSignaturePad === 'CLIENTE' ? 'NONE' : 'CLIENTE'
                )
              }
              className="px-3.5 py-2.5 text-xs font-bold text-white bg-[#B45309] hover:bg-[#92400E] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <PenTool className="w-4 h-4" />
              <span>Firmar Cliente en Pantalla</span>
            </button>

            <button
              onClick={() =>
                setActiveSignaturePad(
                  activeSignaturePad === 'EMPRESA' ? 'NONE' : 'EMPRESA'
                )
              }
              className="px-3.5 py-2.5 text-xs font-bold text-[#0C4A6E] bg-[#E0F2FE] hover:bg-[#BAE6FD] border border-[#7DD3FC] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSignature className="w-4 h-4" />
              <span>Firmar Agrícola Oni</span>
            </button>

            <button
              onClick={() => scanFileInputRef.current?.click()}
              className="px-3.5 py-2.5 text-xs font-bold text-[#581C87] bg-[#F3E8FF] hover:bg-[#E9D5FF] border border-[#D8B4FE] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Cargar Escaneado Firmado</span>
            </button>
          </div>
        </div>

        {/* PANEL DE FIRMA DIGITAL EN PANTALLA (SI ESTÁ ACTIVO) */}
        {activeSignaturePad !== 'NONE' && (
          <div className="bg-[#FAF8F5] border-2 border-[#B45309] rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-[#1C1917]">
                  {activeSignaturePad === 'CLIENTE'
                    ? `Lienzo de Firma Digital de EL CLIENTE COMPRADOR: ${activeContract.clienteRazonSocialONombre}`
                    : `Lienzo de Firma Digital de LA EMPRESA SUMINISTRADORA: ${activeContract.empresaRazonSocial}`}
                </h4>
                <p className="text-xs text-[#57534E]">
                  Dibuja la firma con el mouse, lápiz óptico o con el dedo en pantalla táctil. Al pulsar &quot;Incrustar Firma en Contrato&quot;, aparecerá automáticamente en la vista previa y en el PDF.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearCanvas}
                  className="px-3 py-1.5 text-xs font-bold text-[#991B1B] bg-[#FEE2E2] hover:bg-[#FECACA] rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpiar</span>
                </button>
                <button
                  onClick={saveCanvasSignature}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#15803D] hover:bg-[#14532D] rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Incrustar Firma en Contrato</span>
                </button>
                <button
                  onClick={() => setActiveSignaturePad('NONE')}
                  className="px-3 py-1.5 text-xs font-semibold text-[#57534E] hover:text-[#1C1917] cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>

            <div className="bg-white border-2 border-dashed border-[#A8A29E] rounded-xl p-2 flex flex-col items-center">
              <canvas
                ref={canvasRef}
                width={540}
                height={150}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="bg-white cursor-crosshair touch-none border border-[#E7E5E4] rounded-lg w-full max-w-[540px] h-[150px]"
              />
              <span className="text-[11px] text-[#78716C] mt-1">
                Firma aquí arriba dentro del recuadro blanco
              </span>
            </div>
          </div>
        )}

        {/* FORMULARIO INTERACTIVO PARA LLENAR Y PERSONALIZAR TODOS LOS DATOS DEL CLIENTE Y DEL ANTICIPO */}
        <div className="border-t border-[#E7E5E4] pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-wide flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#15803D]" />
              <span>
                2. Formulario Editable de Datos del Cliente, Referencia Banesco y Quintales de Café (Actualiza el Contrato en Tiempo Real)
              </span>
            </h3>
            {onNavigateToModule && (
              <button
                onClick={() => onNavigateToModule('comprobantes-anticipos-2026')}
                className="text-xs font-bold text-[#0369A1] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Ver Comprobante Contable {activeContract.numeroComprobanteVinculado}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-[#44403C] mb-1">
                N° de Contrato Mercantil
              </label>
              <input
                type="text"
                value={activeContract.numeroContrato}
                onChange={(e) => handleFieldChange('numeroContrato', e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#FAF8F5] border border-[#D6D3D1] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#44403C] mb-1">
                Fecha de Suscripción / Abono
              </label>
              <input
                type="text"
                value={activeContract.fechaSuscripcion}
                onChange={(e) => {
                  handleFieldChange('fechaSuscripcion', e.target.value);
                  handleFieldChange('fechaAbonoBancario', e.target.value);
                }}
                className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] border border-[#D6D3D1] rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-[#14532D] mb-1">
                Razón Social o Nombre Completo de EL CLIENTE COMPRADOR
              </label>
              <input
                type="text"
                value={activeContract.clienteRazonSocialONombre}
                onChange={(e) =>
                  handleFieldChange('clienteRazonSocialONombre', e.target.value)
                }
                className="w-full px-3 py-2 text-xs font-bold bg-[#DCFCE7]/30 border border-[#86EFAC] rounded-lg text-[#14532D]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#14532D] mb-1">
                RIF o Cédula de Identidad del Cliente
              </label>
              <input
                type="text"
                value={activeContract.clienteRifOCedula}
                onChange={(e) => handleFieldChange('clienteRifOCedula', e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#DCFCE7]/30 border border-[#86EFAC] rounded-lg text-[#14532D]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#44403C] mb-1">
                Nombre del Representante Legal / Firmante
              </label>
              <input
                type="text"
                value={activeContract.clienteRepresentanteNombre}
                onChange={(e) =>
                  handleFieldChange('clienteRepresentanteNombre', e.target.value)
                }
                className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D6D3D1] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#44403C] mb-1">
                Cédula del Firmante y Cargo
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={activeContract.clienteRepresentanteCedula}
                  onChange={(e) =>
                    handleFieldChange('clienteRepresentanteCedula', e.target.value)
                  }
                  placeholder="V-00.000.000"
                  className="w-1/2 px-2.5 py-2 text-xs font-mono bg-[#FAF8F5] border border-[#D6D3D1] rounded-lg"
                />
                <input
                  type="text"
                  value={activeContract.clienteRepresentanteCargo}
                  onChange={(e) =>
                    handleFieldChange('clienteRepresentanteCargo', e.target.value)
                  }
                  placeholder="Presidente / Titular"
                  className="w-1/2 px-2.5 py-2 text-xs bg-[#FAF8F5] border border-[#D6D3D1] rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#44403C] mb-1">
                Banco Origen del Cliente
              </label>
              <input
                type="text"
                value={activeContract.clienteBancoOrigen}
                onChange={(e) => handleFieldChange('clienteBancoOrigen', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D6D3D1] rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-[#44403C] mb-1">
                Datos de Registro Mercantil / RUNSAI y Domicilio del Cliente
              </label>
              <input
                type="text"
                value={activeContract.clienteRegistroMercantilOActividad}
                onChange={(e) =>
                  handleFieldChange(
                    'clienteRegistroMercantilOActividad',
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D6D3D1] rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-[#B45309] mb-1">
                N° de Referencia(s) Banesco / SGLBTR / TRANS.CTAS Conciliadas
              </label>
              <input
                type="text"
                value={activeContract.referenciasBancariasBanesco}
                onChange={(e) =>
                  handleFieldChange('referenciasBancariasBanesco', e.target.value)
                }
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#FEF3C7]/40 border border-[#F59E0B] rounded-lg text-[#78350F]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#B45309] mb-1">
                Monto del Anticipo Recibido (Bs.)
              </label>
              <input
                type="number"
                step="0.01"
                value={activeContract.montoAnticipoBs}
                onChange={(e) =>
                  handleFieldChange('montoAnticipoBs', parseFloat(e.target.value) || 0)
                }
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#FEF3C7]/40 border border-[#F59E0B] rounded-lg text-[#78350F]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#44403C] mb-1">
                Tasa BCV Aplicada (Bs./USD)
              </label>
              <input
                type="number"
                step="0.01"
                value={activeContract.tasaBcvReferencial}
                onChange={(e) =>
                  handleFieldChange(
                    'tasaBcvReferencial',
                    parseFloat(e.target.value) || 1
                  )
                }
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#FAF8F5] border border-[#D6D3D1] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#0369A1] mb-1">
                Equivalente Calculado (USD)
              </label>
              <input
                type="text"
                readOnly
                value={`USD ${fmtUSD(activeContract.montoEquivalenteUSD)}`}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#E0F2FE]/50 border border-[#7DD3FC] rounded-lg text-[#0C4A6E]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#14532D] mb-1">
                Quintales de Café (a USD {activeContract.precioReferencialUsdPorQQ}/QQ)
              </label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  step="1"
                  value={activeContract.precioReferencialUsdPorQQ}
                  onChange={(e) =>
                    handleFieldChange(
                      'precioReferencialUsdPorQQ',
                      parseFloat(e.target.value) || 195
                    )
                  }
                  className="w-20 px-2 py-2 text-xs font-mono bg-[#FAF8F5] border border-[#D6D3D1] rounded-lg"
                  title="Precio USD por Quintal"
                />
                <input
                  type="text"
                  readOnly
                  value={`${fmtUSD(activeContract.quintalesComprometidosQQ)} QQ (${fmtUSD(
                    activeContract.kilosComprometidosKg
                  )} Kg)`}
                  className="flex-1 px-2.5 py-2 text-xs font-mono font-bold bg-[#DCFCE7]/50 border border-[#86EFAC] rounded-lg text-[#14532D]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* HOJA OFICIAL IMPRIMIBLE DEL CONTRATO MERCANTIL DE ANTICIPO DE CLIENTES */}
      {/* ============================================================================ */}
      <div className="bg-white border-2 border-[#1C1917] rounded-2xl p-6 sm:p-10 shadow-md max-w-[1000px] mx-auto space-y-5 print:border-0 print:shadow-none print:p-0">
        {/* Membrete Institucional Superior */}
        <div className="border-b-2 border-[#14532D] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-bold text-[#15803D] uppercase tracking-wider">
              REPÚBLICA BOLIVARIANA DE VENEZUELA · SECTOR AGROINDUSTRIAL CAFETALERO
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1C1917] font-display">
              {activeContract.empresaRazonSocial} — RIF: {activeContract.empresaRif}
            </h1>
            <p className="text-xs text-[#57534E]">
              {activeContract.empresaDomicilio} · Cta. Cte. Banesco:{' '}
              <span className="font-mono font-bold text-[#1C1917]">
                {activeContract.empresaCuentaBanescoBs}
              </span>
            </p>
          </div>

          <div className="bg-[#FEF3C7] border border-[#F59E0B] rounded-xl px-4 py-2.5 text-right shrink-0">
            <div className="text-[11px] font-mono font-bold text-[#78350F]">
              CONTRATO MERCANTIL N°:
            </div>
            <div className="text-sm font-mono font-bold text-[#1C1917]">
              {activeContract.numeroContrato}
            </div>
            <div className="text-[11px] font-mono text-[#92400E]">
              Comprobante VEN-NIF: {activeContract.numeroComprobanteVinculado}
            </div>
          </div>
        </div>

        {/* Título Jurídico del Documento */}
        <div className="text-center space-y-1.5 py-1">
          <h2 className="text-base sm:text-lg font-bold text-[#1C1917] uppercase leading-snug font-serif">
            CONTRATO MERCANTIL DE SUMINISTRO A FUTURO DE CAFÉ VERDE EN GRANO, RECEPCIÓN DE ANTICIPO DE CLIENTES (PASIVO CUENTA 2.1.04.01 NIIF 15) Y DECLARACIÓN JURADA DE ORIGEN Y DESTINO LÍCITO DE FONDOS
          </h2>
          <div className="inline-block bg-[#DCFCE7] border border-[#86EFAC] px-4 py-1 rounded-lg text-xs font-bold text-[#14532D]">
            Lugar y Fecha: {valOrBlank(activeContract.ciudadSuscripcion, '____________________')},{' '}
            {valOrBlank(activeContract.fechaSuscripcion, '____ / ____ / 2026')} · Monto del Anticipo: Bs.{' '}
            {valOrBlank(fmtBs(activeContract.montoAnticipoBs), '____________________')} (Ref. USD{' '}
            {valOrBlank(fmtUSD(activeContract.montoEquivalenteUSD), '______________')})
          </div>
        </div>

        {/* Cuerpo Legal del Contrato */}
        <div className="space-y-4 text-[13.5px] leading-relaxed text-[#1C1917] font-serif text-justify">
          <p>
            Entre nosotros, por una parte la sociedad mercantil{' '}
            <strong>{activeContract.empresaRazonSocial}</strong>, titular del Registro de
            Información Fiscal (RIF) N° <strong>{activeContract.empresaRif}</strong>,{' '}
            {activeContract.empresaRegistroMercantil}, con domicilio fiscal en{' '}
            {activeContract.empresaDomicilio}, representada en este acto por su{' '}
            {activeContract.empresaRepresentanteCargo}, ciudadano(a){' '}
            <strong>{activeContract.empresaRepresentanteNombre}</strong>, venezolano(a),
            mayor de edad, titular de la Cédula de Identidad N°{' '}
            <strong>{activeContract.empresaRepresentanteCedula}</strong>, suficientemente
            facultado(a) por los Estatutos Sociales, quien en lo adelante y a todos los
            efectos legales del presente documento se denominará{' '}
            <strong>&quot;LA EMPRESA SUMINISTRADORA&quot;</strong>; y por la otra parte,{' '}
            <strong className="underline decoration-[#B45309]">
              {valOrBlank(
                activeContract.clienteRazonSocialONombre,
                '________________________________________________________________'
              )}
            </strong>
            , titular del RIF / Cédula de Identidad N°{' '}
            <strong className="underline decoration-[#B45309]">
              {valOrBlank(
                activeContract.clienteRifOCedula,
                '______________________________'
              )}
            </strong>{' '}
            ({valOrBlank(
              activeContract.clienteRegistroMercantilOActividad,
              '____________________________________________________________________'
            )}), con domicilio fiscal en{' '}
            {valOrBlank(
              activeContract.clienteDomicilioFiscal,
              '____________________________________________________________________'
            )}
            , representada en este acto por{' '}
            <strong>
              {valOrBlank(
                activeContract.clienteRepresentanteNombre,
                '____________________________________________'
              )}
            </strong>
            , titular de la Cédula de Identidad N°{' '}
            <strong>
              {valOrBlank(
                activeContract.clienteRepresentanteCedula,
                '____________________'
              )}
            </strong>
            , actuando en su carácter de{' '}
            {valOrBlank(
              activeContract.clienteRepresentanteCargo,
              '____________________________'
            )}
            , quien en lo adelante se denominará{' '}
            <strong>&quot;EL CLIENTE COMPRADOR&quot;</strong>; y cuando actúen de forma
            conjunta se denominarán <strong>&quot;LAS PARTES&quot;</strong>, se ha
            convenido en celebrar, como en efecto se celebra, el presente{' '}
            <strong>
              CONTRATO MERCANTIL DE ANTICIPO SOBRE SUMINISTRO FUTURO DE COSECHA CAFETALERA
            </strong>
            , de conformidad con los Artículos 1.133, 1.159 y 1.160 del Código Civil
            Venezolano, Artículos 32 al 44 del Código de Comercio, Norma Internacional
            VEN-NIF / NIIF 15 y Resolución SUDEBAN N° 083.18, regido por las cláusulas
            siguientes:
          </p>

          <p>
            <strong>
              CLÁUSULA PRIMERA — OBJETO DEL CONTRATO Y VOLUMEN DE CAFÉ COMPROMETIDO:
            </strong>{' '}
            &quot;LA EMPRESA SUMINISTRADORA&quot;, en su condición de productora,
            acopiadora y beneficiadora agroindustrial primaria, se obliga a acopiar en
            campo, acondicionar en planta de trilla y suministrar en venta en firme a
            favor de &quot;EL CLIENTE COMPRADOR&quot; la cantidad estimada de{' '}
            <strong className="bg-[#FEF3C7] px-1.5 py-0.5 rounded">
              {valOrBlank(
                `${fmtUSD(activeContract.quintalesComprometidosQQ)} Quintales (${fmtUSD(
                  activeContract.kilosComprometidosKg
                )} Kilogramos netos)`,
                '______________ Quintales (______________ Kilogramos netos)'
              )}
            </strong>{' '}
            del rubro <strong>{activeContract.rubroDescripcion}</strong>, correspondientes
            al ciclo agrícola <strong>{activeContract.cicloZafra}</strong>, bajo las
            especificaciones técnicas siguientes: <em>{activeContract.calidadEspecificacion}</em>,
            calculados a un precio referencial de preventa de{' '}
            <strong>
              USD {valOrBlank(fmtUSD(activeContract.precioReferencialUsdPorQQ), '________')}{' '}
              por cada Quintal de cuarenta y seis kilogramos (46 Kg)
            </strong>
            .
          </p>

          <p>
            <strong>
              CLÁUSULA SEGUNDA — MONTO DEL ANTICIPO Y TRAZABILIDAD BANCARIA EN BANESCO:
            </strong>{' '}
            Para garantizar la fijación de volumen de cosecha, el pago oportuno a los
            productores cafetaleros en las zonas productoras y la logística de beneficio
            seco, &quot;EL CLIENTE COMPRADOR&quot; entrega a &quot;LA EMPRESA
            SUMINISTRADORA&quot; en calidad de{' '}
            <strong>ANTICIPO COMERCIAL A CUENTA DE ENTREGAS FUTURAS DE CAFÉ</strong> la
            suma total de{' '}
            <strong className="bg-[#DCFCE7] px-1.5 py-0.5 rounded text-[#14532D]">
              BOLÍVARES{' '}
              {valOrBlank(
                `Bs. ${fmtBs(activeContract.montoAnticipoBs)}`,
                'Bs. ____________________________'
              )}
            </strong>{' '}
            (equivalentes referencialmente a{' '}
            <strong>
              USD{' '}
              {valOrBlank(
                fmtUSD(activeContract.montoEquivalenteUSD),
                '____________________'
              )}
            </strong>{' '}
            a la tasa de cambio oficial del Banco Central de Venezuela de{' '}
            <strong>
              Bs.{' '}
              {valOrBlank(fmtBs(activeContract.tasaBcvReferencial), '__________')} / USD
            </strong>{' '}
            vigente para la fecha de la operación). Dichos fondos han sido acreditados
            íntegramente mediante transferencia(s) bancaria(s) desde la cuenta titular de
            &quot;EL CLIENTE COMPRADOR&quot; hacia la Cuenta Corriente N°{' '}
            <strong>{activeContract.empresaCuentaBanescoBs}</strong> en{' '}
            <strong>BANESCO BANCO UNIVERSAL, C.A.</strong> a nombre de{' '}
            <strong>{activeContract.empresaRazonSocial}</strong>, según la relación de
            trazabilidad siguiente:
          </p>

          {/* Cuadro de Trazabilidad Bancaria del Anticipo dentro del Contrato */}
          <div className="overflow-x-auto my-3 font-sans">
            <table className="w-full text-xs border-collapse border border-[#1C1917]">
              <thead>
                <tr className="bg-[#14532D] text-white">
                  <th className="border border-[#1C1917] px-2.5 py-2 text-left">
                    Fecha Abono
                  </th>
                  <th className="border border-[#1C1917] px-2.5 py-2 text-left">
                    Banco y Cuenta Origen del Cliente
                  </th>
                  <th className="border border-[#1C1917] px-2.5 py-2 text-left">
                    Referencia Banesco / SGLBTR
                  </th>
                  <th className="border border-[#1C1917] px-2.5 py-2 text-right">
                    Monto Anticipo (Bs.)
                  </th>
                  <th className="border border-[#1C1917] px-2.5 py-2 text-right">
                    Tasa BCV
                  </th>
                  <th className="border border-[#1C1917] px-2.5 py-2 text-right">
                    Equiv. (USD)
                  </th>
                  <th className="border border-[#1C1917] px-2.5 py-2 text-right">
                    Café (QQ)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-[#FAF8F5] font-bold text-[#1C1917]">
                  <td className="border border-[#1C1917] px-2.5 py-2 font-mono">
                    {valOrBlank(activeContract.fechaAbonoBancario, '___/___/2026')}
                  </td>
                  <td className="border border-[#1C1917] px-2.5 py-2">
                    {valOrBlank(
                      `${activeContract.clienteBancoOrigen} (${activeContract.clienteNumeroCuentaOrigen})`,
                      '____________________________________'
                    )}
                  </td>
                  <td className="border border-[#1C1917] px-2.5 py-2 font-mono text-[#78350F]">
                    {valOrBlank(
                      activeContract.referenciasBancariasBanesco,
                      '________________________'
                    )}
                  </td>
                  <td className="border border-[#1C1917] px-2.5 py-2 text-right font-mono text-[#14532D]">
                    Bs.{' '}
                    {valOrBlank(
                      fmtBs(activeContract.montoAnticipoBs),
                      '__________________'
                    )}
                  </td>
                  <td className="border border-[#1C1917] px-2.5 py-2 text-right font-mono">
                    {valOrBlank(fmtBs(activeContract.tasaBcvReferencial), '________')}
                  </td>
                  <td className="border border-[#1C1917] px-2.5 py-2 text-right font-mono text-[#0369A1]">
                    USD{' '}
                    {valOrBlank(
                      fmtUSD(activeContract.montoEquivalenteUSD),
                      '______________'
                    )}
                  </td>
                  <td className="border border-[#1C1917] px-2.5 py-2 text-right font-mono">
                    {valOrBlank(
                      `${fmtUSD(activeContract.quintalesComprometidosQQ)} QQ`,
                      '________ QQ'
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            <strong>
              CLÁUSULA TERCERA — NATURALEZA CONTABLE DEL ANTICIPO (PASIVO NIIF 15),
              FACTURACIÓN DIFERIDA SENIAT E IGTF 0% EN BOLÍVARES:
            </strong>{' '}
            &quot;LAS PARTES&quot; dejan constancia expresa de que, conforme a los
            Principios de Contabilidad Generalmente Aceptados en Venezuela (
            <strong>VEN-NIF / NIIF 15</strong>), el monto recibido en la Cláusula Segunda
            se registra en la contabilidad de &quot;LA EMPRESA SUMINISTRADORA&quot; como
            un <strong>PASIVO POR CONTRATO</strong> en la cuenta contable{' '}
            <strong>2.1.04.01 (&quot;Anticipos Recibidos de Clientes&quot;)</strong> bajo
            el Comprobante N° <strong>{activeContract.numeroComprobanteVinculado}</strong>,
            y <strong>NO constituye un ingreso devengado en el Estado de Resultados</strong>{' '}
            hasta tanto culmine el beneficio agrícola y se realice la entrega física del
            café en romana junto con la emisión de la Factura Fiscal definitiva conforme a
            la <strong>Providencia Administrativa SENIAT SNAT/2011/0071</strong>. De
            acuerdo con el <strong>Artículo 13 de la Ley del IVA</strong>, el hecho
            imponible en la venta de bienes muebles corporales se perfecciona en el
            momento de la entrega del bien o emisión de la factura, encontrándose además
            el café verde en grano crudo <strong>EXENTO de IVA</strong> por mandato del{' '}
            <strong>Artículo 18 numeral 1 de la Ley del IVA</strong>. Asimismo, se deja
            constancia de que las transferencias bancarias en Bolívares están gravadas con
            la alícuota del <strong>0% de IGTF</strong> conforme al{' '}
            <strong>
              Decreto Presidencial N° 4.972 publicado en la Gaceta Oficial Extraordinaria
              N° 6.821 del 12 de julio de 2024
            </strong>
            .
          </p>

          <p>
            <strong>
              CLÁUSULA CUARTA — APLICACIÓN PRODUCTIVA DE LOS FONDOS Y EXCLUSIÓN ABSOLUTA DE
              INTERMEDIACIÓN CAMBIARIA (CONVENIO CAMBIARIO N° 1 BCV):
            </strong>{' '}
            &quot;EL CLIENTE COMPRADOR&quot; conoce y autoriza que los Bolívares
            entregados como anticipo sean destinados inmediatamente por &quot;LA EMPRESA
            SUMINISTRADORA&quot; a su ciclo productivo agroindustrial: (a) liquidación de
            compras de café cereza y pergamino a productores primarios, (b) pago de fletes
            terrestres, guías INSAI, servicio de trilla y sacos, y (c) adquisición lícita
            de divisas a través de la{' '}
            <strong>
              Mesa de Cambio / Intervención Cambiaria de Banesco Banco Universal
            </strong>{' '}
            (al amparo del Convenio Cambiario N° 1 del BCV) para cubrir estructuras de
            costos agrícolas e insumos dolarizados, los cuales se liquidan y pagan en
            Bolívares dentro del territorio nacional. Queda expresamente convenido que{' '}
            <strong>
              &quot;LA EMPRESA SUMINISTRADORA&quot; NO vende, cede ni transfiere divisas a
              &quot;EL CLIENTE COMPRADOR&quot;
            </strong>
            , recibiendo este último única y exclusivamente el rubro físico (Café Verde en
            Grano) debidamente pesado en romana y facturado.
          </p>

          <p>
            <strong>
              CLÁUSULA QUINTA — LUGAR, CRONOGRAMA DE ENTREGA Y PERMISOLOGÍA INSAI / SICA:
            </strong>{' '}
            La entrega física y recepción en romana del café comprometido se ejecutará en{' '}
            <strong>{activeContract.lugarEntregaFisica}</strong> durante el lapso de{' '}
            <strong>{activeContract.plazoEntregaTexto}</strong>.{' '}
            {activeContract.guiaSicaInsaiCondicion} Al momento de cada despacho parcial o
            total, &quot;LA EMPRESA SUMINISTRADORA&quot; imputará contablemente el monto
            del anticipo (debitando la cuenta de Pasivo 2.1.04.01 y acreditando la cuenta
            de Ingresos por Ventas de Café 4.1.01.01).
          </p>

          <p>
            <strong>
              CLÁUSULA SEXTA — DECLARACIÓN JURADA DE ORIGEN LÍCITO DE FONDOS (SUDEBAN RES.
              083.18 Y LOCDOFT) Y DOMICILIO ESPECIAL:
            </strong>{' '}
            En estricto cumplimiento del Artículo 35 de la{' '}
            <strong>Resolución N° 083.18 de la SUDEBAN</strong> y de la{' '}
            <strong>
              Ley Orgánica Contra la Delincuencia Organizada y Financiamiento al Terrorismo
              (LOCDOFT)
            </strong>
            , &quot;EL CLIENTE COMPRADOR&quot; declara bajo fe de juramento que los fondos
            transferidos a la cuenta de &quot;LA EMPRESA SUMINISTRADORA&quot; en Banesco
            tienen un origen estrictamente lícito, provienen de su giro mercantil
            agroalimentario legítimo y no guardan relación alguna con actividades ilícitas.
            Para todos los efectos derivados de este contrato, las partes eligen como
            domicilio especial y excluyente a la ciudad de{' '}
            <strong>Araure, Estado Portuguesa</strong>, a la jurisdicción de cuyos
            Tribunales Mercantiles declaran someterse. Se hacen dos (2) ejemplares de un
            mismo tenor y a un solo efecto.
          </p>
        </div>

        {/* ============================================================================ */}
        {/* BLOQUE OFICIAL DE FIRMAS, SELLO HÚMEDO Y HUELLA DACTILAR */}
        {/* ============================================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Recuadro Firma 1: LA EMPRESA SUMINISTRADORA */}
          <div className="border-2 border-[#14532D] bg-[#FAF8F5] rounded-xl p-4 flex flex-col justify-between min-h-[210px]">
            <div className="flex items-center justify-between border-b border-[#D6D3D1] pb-2">
              <span className="text-xs font-bold text-[#14532D] uppercase">
                POR &quot;LA EMPRESA SUMINISTRADORA&quot;
              </span>
              <span className="text-[11px] font-mono text-[#57534E]">
                Firma y Sello Húmedo
              </span>
            </div>

            <div className="my-3 flex items-center justify-center min-h-[75px]">
              {activeContract.firmaEmpresaDataUrl ? (
                <img
                  src={activeContract.firmaEmpresaDataUrl}
                  alt="Firma Representante Agrícola Oni"
                  className="max-h-[72px] object-contain"
                />
              ) : (
                <span className="text-[11px] text-[#A8A29E] italic">
                  [Espacio para Firma Autógrafa y Sello Húmedo de Agrícola Oni, C.A.]
                </span>
              )}
            </div>

            <div className="border-t border-[#1C1917] pt-2 text-xs space-y-0.5">
              <div className="font-bold text-[#1C1917]">
                {activeContract.empresaRazonSocial} (RIF: {activeContract.empresaRif})
              </div>
              <div className="text-[#44403C]">
                Representante Legal: <strong>{activeContract.empresaRepresentanteNombre}</strong>
              </div>
              <div className="text-[#57534E] text-[11px]">
                C.I. N°: {activeContract.empresaRepresentanteCedula} · Cargo:{' '}
                {activeContract.empresaRepresentanteCargo}
              </div>
            </div>
          </div>

          {/* Recuadro Firma 2: EL CLIENTE COMPRADOR + HUELLA DACTILAR */}
          <div className="border-2 border-[#B45309] bg-[#FAF8F5] rounded-xl p-4 flex flex-col justify-between min-h-[210px]">
            <div className="flex items-center justify-between border-b border-[#D6D3D1] pb-2">
              <span className="text-xs font-bold text-[#78350F] uppercase">
                POR &quot;EL CLIENTE COMPRADOR&quot; (CONFORME)
              </span>
              <span className="text-[11px] font-mono text-[#78350F]">
                Firma, Sello y Huella
              </span>
            </div>

            <div className="my-2 flex items-center justify-between gap-3 min-h-[80px]">
              <div className="flex-1 flex items-center justify-center">
                {activeContract.firmaClienteDataUrl ? (
                  <img
                    src={activeContract.firmaClienteDataUrl}
                    alt="Firma del Cliente"
                    className="max-h-[72px] object-contain"
                  />
                ) : (
                  <span className="text-[11px] text-[#A8A29E] italic text-center">
                    [Espacio para Firma Autógrafa y Sello Húmedo del Cliente Comprador]
                  </span>
                )}
              </div>

              {/* Recuadro de Huella Dactilar Pulgar Derecho */}
              <div className="w-20 h-24 border border-[#78716C] bg-white rounded-lg flex flex-col items-center justify-end p-1.5 shrink-0">
                <div className="text-[9px] font-mono text-[#78716C] text-center leading-tight">
                  HUELLA DACTILAR PULGAR DER.
                </div>
              </div>
            </div>

            <div className="border-t border-[#1C1917] pt-2 text-xs space-y-0.5">
              <div className="font-bold text-[#1C1917]">
                {valOrBlank(
                  activeContract.clienteRazonSocialONombre,
                  'Razón Social / Nombre: ____________________________________'
                )}
              </div>
              <div className="text-[#44403C]">
                RIF / C.I. N°:{' '}
                <strong>
                  {valOrBlank(
                    activeContract.clienteRifOCedula,
                    '____________________________'
                  )}
                </strong>
              </div>
              <div className="text-[#57534E] text-[11px]">
                Firmante:{' '}
                {valOrBlank(
                  `${activeContract.clienteRepresentanteNombre} (C.I.: ${activeContract.clienteRepresentanteCedula})`,
                  '____________________________________ C.I.: ________________'
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pie de Verificación de Archivo Escaneado si ya se cargó */}
        {activeContract.archivoEscaneadoNombre && (
          <div className="bg-[#DCFCE7] border border-[#86EFAC] rounded-xl p-3 text-xs text-[#14532D] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold">
              <ShieldCheck className="w-4 h-4 text-[#15803D]" />
              <span>
                Ejemplar Firmado y Sellado Archivado: {activeContract.archivoEscaneadoNombre} (
                {activeContract.archivoEscaneadoFecha})
              </span>
            </div>
            <span className="font-mono text-[11px]">
              {activeContract.archivoEscaneadoSha256}
            </span>
          </div>
        )}
      </div>

      {/* ============================================================================ */}
      {/* TABLA ÍNDICE DE LOS 17 CONTRATOS DE ANTICIPO DE CLIENTES (ENERO - AGOSTO 2026) */}
      {/* ============================================================================ */}
      <div className="no-print bg-white border border-[#D6D3D1] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#1C1917] font-display flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#B45309]" />
              <span>
                Índice General de Contratos de Anticipo de Clientes Vinculados al Extracto Banesco (Ene–Ago 2026)
              </span>
            </h3>
            <p className="text-xs text-[#57534E]">
              Haz clic en cualquier fila para cargar ese contrato arriba, editarlo, firmarlo en pantalla o descargarlo en PDF/Word.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadBatchAllContractsPdf}
              className="px-4 py-2 text-xs font-bold text-white bg-[#1C1917] hover:bg-[#292524] rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar los {contracts.length} Contratos en 1 PDF</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-y border-[#D6D3D1] text-[#44403C]">
                <th className="py-2.5 px-3 text-left font-bold">N° Contrato</th>
                <th className="py-2.5 px-3 text-left font-bold">Fecha</th>
                <th className="py-2.5 px-3 text-left font-bold">
                  Cliente Comprador / Anticipante
                </th>
                <th className="py-2.5 px-3 text-left font-bold">RIF / Cédula</th>
                <th className="py-2.5 px-3 text-right font-bold">Monto Anticipo (Bs.)</th>
                <th className="py-2.5 px-3 text-right font-bold">Equiv. (USD)</th>
                <th className="py-2.5 px-3 text-right font-bold">Café (QQ)</th>
                <th className="py-2.5 px-3 text-left font-bold">Estado Firma</th>
                <th className="py-2.5 px-3 text-center font-bold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5E4]">
              {contracts.map((c) => {
                const isSelected = c.id === activeContract.id;
                return (
                  <tr
                    key={c.id}
                    onClick={() => {
                      setSelectedContractId(c.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#FEF3C7]/70 font-semibold' : 'hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-[#78350F]">
                      {c.numeroContrato}
                    </td>
                    <td className="py-2.5 px-3 font-mono">{c.fechaSuscripcion}</td>
                    <td className="py-2.5 px-3 text-[#1C1917]">
                      {c.clienteRazonSocialONombre}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#44403C]">
                      {c.clienteRifOCedula}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#14532D]">
                      Bs. {fmtBs(c.montoAnticipoBs)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0369A1]">
                      USD {fmtUSD(c.montoEquivalenteUSD)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {fmtUSD(c.quintalesComprometidosQQ)} QQ
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[11px] font-bold ${
                          c.estadoContrato === 'FIRMADO_Y_SELLADO_ESCANEADO'
                            ? 'text-[#15803D]'
                            : c.estadoContrato === 'FIRMADO_DIGITALMENTE_EN_APP'
                            ? 'text-[#0369A1]'
                            : 'text-[#B45309]'
                        }`}
                      >
                        {c.estadoContrato === 'FIRMADO_Y_SELLADO_ESCANEADO'
                          ? 'Firmado y Sellado (Escaneado)'
                          : c.estadoContrato === 'FIRMADO_DIGITALMENTE_EN_APP'
                          ? 'Firmado Digitalmente'
                          : 'Listo para Llenar y Firmar'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContractId(c.id);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold text-[#1C1917] bg-[#FEF3C7] hover:bg-[#FDE68A] border border-[#F59E0B] rounded-lg cursor-pointer"
                      >
                        Abrir Contrato
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[#14532D] text-white font-bold">
                <td colSpan={4} className="py-3 px-3 text-right uppercase">
                  Total General Respaldado por Contratos de Anticipo (Ene–Ago 2026):
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  Bs. {fmtBs(totalAnticiposBs)}
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  USD {fmtUSD(totalAnticiposUSD)}
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  {fmtUSD(totalQuintalesQQ)} QQ
                </td>
                <td colSpan={2} className="py-3 px-3 text-center text-[11px]">
                  100% Conciliado con Cuenta 2.1.04.01
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
