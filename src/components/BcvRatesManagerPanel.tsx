import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  BcvDailyRate,
  resolveBcvRateForDate,
  formatDateDDMMYYYY,
  parseDateToISO,
} from '../data/nominusData';
import {
  Upload,
  FileSpreadsheet,
  Calendar,
  Plus,
  Download,
  CheckCircle2,
  Calculator,
  ArrowRight,
  ClipboardPaste,
} from 'lucide-react';

interface BcvRatesManagerPanelProps {
  bcvRates: BcvDailyRate[];
  onUpsertRate: (rate: BcvDailyRate) => void;
  onImportBatchRates: (rates: BcvDailyRate[], fileName: string) => void;
  onQuickRegisterDeposit?: (fecha: string, montoVES: number, tasaAplicada: number) => void;
}

const MONTH_MAP: Record<string, string> = {
  ene: '01',
  enero: '01',
  feb: '02',
  febrero: '02',
  mar: '03',
  marzo: '03',
  abr: '04',
  abril: '04',
  may: '05',
  mayo: '05',
  jun: '06',
  junio: '06',
  jul: '07',
  julio: '07',
  ago: '08',
  agosto: '08',
  sep: '09',
  sept: '09',
  septiembre: '09',
  oct: '10',
  octubre: '10',
  nov: '11',
  noviembre: '11',
  dic: '12',
  diciembre: '12',
};

function normalizeExcelDate(rawVal: unknown): string | null {
  if (rawVal === null || rawVal === undefined) return null;

  // Caso 1: Número serial de fecha de Excel (ej. 46027 -> 2026-01-05)
  if (typeof rawVal === 'number' && rawVal > 30000 && rawVal < 70000) {
    const parsed = XLSX.SSF.parse_date_code(rawVal);
    if (parsed && parsed.y && parsed.m && parsed.d) {
      return `${String(parsed.y).padStart(4, '0')}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`;
    }
  }

  if (rawVal instanceof Date && !isNaN(rawVal.getTime())) {
    return rawVal.toISOString().slice(0, 10);
  }

  const str = String(rawVal).trim();
  if (!str) return null;

  // Formato ISO YYYY-MM-DD o YYYY/MM/DD
  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}-${isoMatch[3].padStart(2, '0')}`;
  }

  // Formato Venezolano DD/MM/YYYY o DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
  if (dmyMatch) {
    const year = dmyMatch[3].length === 2 ? `20${dmyMatch[3]}` : dmyMatch[3];
    return `${year}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}`;
  }

  // Formato con mes en texto: "05 de enero de 2026" o "05-ene-2026"
  const textMatch = str
    .toLowerCase()
    .match(/(\d{1,2})[\s\-de/]+([a-záéíóú]+)[\s\-de/]+(\d{4})/);
  if (textMatch) {
    const day = textMatch[1].padStart(2, '0');
    const monthKey = textMatch[2].slice(0, 3);
    const month = MONTH_MAP[textMatch[2]] || MONTH_MAP[monthKey];
    if (month) {
      return `${textMatch[3]}-${month}-${day}`;
    }
  }

  return null;
}

function parseRateNumber(val: unknown): number | null {
  if (typeof val === 'number' && !isNaN(val) && val > 0) {
    return Number(val.toFixed(4));
  }
  if (typeof val === 'string') {
    const cleaned = val
      .replace(/[^\d.,-]/g, '')
      .trim();
    if (!cleaned) return null;
    // Si tiene coma como separador decimal (ej. "35,25" o "1.250,45")
    let normalized = cleaned;
    if (cleaned.includes(',') && cleaned.includes('.')) {
      if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
        normalized = cleaned.replace(/\./g, '').replace(',', '.');
      } else {
        normalized = cleaned.replace(/,/g, '');
      }
    } else if (cleaned.includes(',')) {
      normalized = cleaned.replace(',', '.');
    }
    const num = parseFloat(normalized);
    if (!isNaN(num) && num > 0) {
      return Number(num.toFixed(4));
    }
  }
  return null;
}

export const BcvRatesManagerPanel: React.FC<BcvRatesManagerPanelProps> = ({
  bcvRates,
  onUpsertRate,
  onImportBatchRates,
  onQuickRegisterDeposit,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isOpenModal, setIsOpenModal] = useState(true);
  const [importStatusMsg, setImportStatusMsg] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [showPasteBox, setShowPasteBox] = useState(false);

  // Simulador interactivo pre-configurado con el caso exacto del usuario en formato XX/XX/2XXX:
  // Depósito de 200 Bs. en Banesco el día 05/01/2026
  const [simFechaText, setSimFechaText] = useState('05/01/2026');
  const [simMontoVES, setSimMontoVES] = useState('200.00');
  const [simTipoTasa, setSimTipoTasa] = useState<'VENTA' | 'COMPRA'>('VENTA');

  // Formulario para agregar o editar una fecha manualmente en formato XX/XX/2XXX
  const [nuevaFechaText, setNuevaFechaText] = useState('05/01/2026');
  const [nuevaCompra, setNuevaCompra] = useState('35.1500');
  const [nuevaVenta, setNuevaVenta] = useState('35.2500');
  const [filtroMes, setFiltroMes] = useState<string>('ALL');
  const [busquedaFecha, setBusquedaFecha] = useState<string>('');

  const simFechaISO = parseDateToISO(simFechaText);
  const simResolved = resolveBcvRateForDate(simFechaISO, bcvRates, 36.85);
  const simMontoNum = parseFloat(simMontoVES) || 0;
  const tasaActivaSim =
    simTipoTasa === 'VENTA' ? simResolved.tasaVentaVES : simResolved.tasaCompraVES;
  const usdReconvertidosCompra =
    simResolved.tasaCompraVES > 0 ? simMontoNum / simResolved.tasaCompraVES : 0;
  const usdReconvertidosVenta =
    simResolved.tasaVentaVES > 0 ? simMontoNum / simResolved.tasaVentaVES : 0;
  const comisionBanescoSim = simMontoNum * 0.0025;
  const usdNetoMesaCambio =
    tasaActivaSim > 0 ? (simMontoNum - comisionBanescoSim) / tasaActivaSim : 0;

  // Procesar archivo Excel (.xlsx, .xls, .csv) subido por el usuario
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array', cellDates: false });
      const extractedRates: BcvDailyRate[] = [];

      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json< unknown[] >(worksheet, {
          header: 1,
          defval: '',
        });

        rows.forEach((row) => {
          if (!Array.isArray(row) || row.length < 2) return;

          // Buscar en la fila una celda que sea fecha y celdas numéricas de tasas (Compra / Venta)
          let foundDate: string | null = null;
          const numericRates: number[] = [];

          for (const cell of row) {
            if (!foundDate) {
              const maybeDate = normalizeExcelDate(cell);
              if (maybeDate) {
                foundDate = maybeDate;
                continue;
              }
            }
            const maybeRate = parseRateNumber(cell);
            if (maybeRate !== null && maybeRate > 1 && maybeRate < 100000) {
              numericRates.push(maybeRate);
            }
          }

          if (foundDate && numericRates.length >= 1) {
            const compra = numericRates[0];
            const venta =
              numericRates.length >= 2
                ? numericRates[1]
                : Number((compra + 0.1).toFixed(4));

            extractedRates.push({
              id: `bcv-${foundDate}`,
              fecha: foundDate,
              tasaCompraVES: Math.min(compra, venta),
              tasaVentaVES: Math.max(compra, venta),
              fuente: `Excel BCV (${file.name})`,
            });
          }
        });
      });

      if (extractedRates.length === 0) {
        setImportStatusMsg(
          'No se detectaron filas con formato [Fecha | Tasa Compra | Tasa Venta]. Verifica que el archivo tenga una columna de fecha (ej. 05/01/2026) y columnas numéricas.'
        );
      } else {
        onImportBatchRates(extractedRates, file.name);
        setImportStatusMsg(
          `¡Archivo "${file.name}" cargado con éxito! Se guardaron ${extractedRates.length} tasas diarias BCV (Compra y Venta) en la base de datos.`
        );
      }
    } catch (err) {
      console.error('Error leyendo archivo Excel:', err);
      setImportStatusMsg('Error al procesar el archivo Excel. Intenta con formato .xlsx, .xls o .csv.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Procesar texto pegado directamente desde Excel (Ctrl+C -> Ctrl+V)
  const handleProcessPastedExcel = () => {
    const lines = pasteText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const extracted: BcvDailyRate[] = [];

    lines.forEach((line) => {
      const cols = line.split(/\t|;|,|\s{2,}/).map((c) => c.trim());
      if (cols.length < 2) return;

      let foundDate: string | null = null;
      const numericRates: number[] = [];

      for (const col of cols) {
        if (!foundDate) {
          const maybeDate = normalizeExcelDate(col);
          if (maybeDate) {
            foundDate = maybeDate;
            continue;
          }
        }
        const maybeRate = parseRateNumber(col);
        if (maybeRate !== null && maybeRate > 1 && maybeRate < 100000) {
          numericRates.push(maybeRate);
        }
      }

      if (foundDate && numericRates.length >= 1) {
        const compra = numericRates[0];
        const venta =
          numericRates.length >= 2
            ? numericRates[1]
            : Number((compra + 0.1).toFixed(4));
        extracted.push({
          id: `bcv-${foundDate}`,
          fecha: foundDate,
          tasaCompraVES: Math.min(compra, venta),
          tasaVentaVES: Math.max(compra, venta),
          fuente: 'Pegado Directo desde Excel BCV',
        });
      }
    });

    if (extracted.length > 0) {
      onImportBatchRates(extracted, 'Pegado_Directo_Excel');
      setImportStatusMsg(
        `¡Se importaron ${extracted.length} tasas diarias BCV desde las celdas pegadas de Excel!`
      );
      setPasteText('');
      setShowPasteBox(false);
    } else {
      setImportStatusMsg(
        'No se pudieron identificar fechas y tasas. Ejemplo válido: 05/01/2026   35,15   35,25'
      );
    }
  };

  // Descargar plantilla Excel real (.xlsx) con las tasas BCV en formato XX/XX/2XXX (DD/MM/YYYY)
  const handleDownloadTemplateXLSX = () => {
    const wsData = [
      ['Fecha_BCV_DD_MM_YYYY', 'Tasa_Compra_BCV_VES', 'Tasa_Venta_BCV_VES', 'Fuente_Boletin'],
      ...bcvRates.map((r) => [
        formatDateDDMMYYYY(r.fecha),
        r.tasaCompraVES,
        r.tasaVentaVES,
        r.fuente,
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tasas_Diarias_BCV');
    XLSX.writeFile(wb, 'Tasas_Diarias_BCV_Compra_Venta_2026.xlsx');
  };

  const handleManualSaveRate = (e: React.FormEvent) => {
    e.preventDefault();
    const fechaISO = parseDateToISO(nuevaFechaText);
    const fechaFormateada = formatDateDDMMYYYY(fechaISO);
    const compra = parseFloat(nuevaCompra) || 35.15;
    const venta = parseFloat(nuevaVenta) || 35.25;
    onUpsertRate({
      id: `bcv-${fechaISO}`,
      fecha: fechaISO,
      tasaCompraVES: Number(compra.toFixed(4)),
      tasaVentaVES: Number(venta.toFixed(4)),
      fuente: `Carga Manual / Boletín BCV (${fechaFormateada})`,
    });
    setImportStatusMsg(
      `Tasa del día ${fechaFormateada} guardada en Base de Datos: Compra Bs. ${compra.toFixed(4)} / Venta Bs. ${venta.toFixed(4)}`
    );
  };

  const sortedRates = [...bcvRates]
    .filter((r) => {
      const iso = parseDateToISO(r.fecha);
      const dmy = formatDateDDMMYYYY(r.fecha);
      const matchesMonth =
        filtroMes === 'ALL'
          ? true
          : filtroMes === 'TRIM1'
          ? iso.startsWith('2026-01') ||
            iso.startsWith('2026-02') ||
            iso.startsWith('2026-03')
          : iso.startsWith(filtroMes);
      const q = busquedaFecha.trim();
      const matchesQuery = !q || dmy.includes(q) || iso.includes(q);
      return matchesMonth && matchesQuery;
    })
    .sort((a, b) => parseDateToISO(b.fecha).localeCompare(parseDateToISO(a.fecha)));

  return (
    <div className="bg-white/95 border-2 border-[#86EFAC] rounded-2xl p-5 shadow-sm space-y-5">
      {/* Cabecera del Cargador de Excel BCV */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E7E5E4] pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#15803D] bg-[#DCFCE7] px-3 py-1 rounded-lg">
            <FileSpreadsheet className="w-4 h-4" />
            <span>BASE DE DATOS HISTÓRICA DE TASAS DIARIAS BCV (COMPRA Y VENTA) · CARGADOR EXCEL ACTIVO</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#1C1917] font-display">
            Cargador Directo de Archivo Excel (.xlsx / .xls / .csv) y Reconversión Automática por Fecha
          </h2>
          <p className="text-xs text-[#44403C]">
            El chat de texto no permite adjuntar archivos <code>.xlsx</code>, por lo que hemos integrado el <strong>Cargador de Excel directamente aquí dentro de tu aplicación</strong>. Sube tu archivo Excel del BCV o pega tus columnas y todas las operaciones usarán la tasa exacta del día del depósito.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#15803D] text-white rounded-xl text-xs font-bold hover:bg-[#166534] transition-colors cursor-pointer shadow-sm"
          >
            <Upload className="w-4 h-4" />
            SUBIR ARCHIVO EXCEL (.XLSX / .CSV) AQUÍ
          </button>

          <button
            type="button"
            onClick={() => setShowPasteBox(!showPasteBox)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#FEF9C3] border border-[#FDE047] text-[#713F12] rounded-xl text-xs font-bold hover:bg-[#FEF08A] transition-colors cursor-pointer"
          >
            <ClipboardPaste className="w-4 h-4" />
            Pegar desde Excel
          </button>

          <button
            type="button"
            onClick={handleDownloadTemplateXLSX}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#E0F2FE] border border-[#7DD3FC] text-[#0C4A6E] rounded-xl text-xs font-bold hover:bg-[#BAE6FD] transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Descargar Plantilla .XLSX ({bcvRates.length} fechas)
          </button>

          <button
            type="button"
            onClick={() => setIsOpenModal(!isOpenModal)}
            className="px-3 py-2.5 bg-[#FAF8F5] border border-[#D6D3D1] text-[#1C1917] rounded-xl text-xs font-semibold hover:bg-[#F5F5F4] cursor-pointer"
          >
            {isOpenModal ? 'Contraer Panel BCV' : 'Abrir Panel BCV'}
          </button>
        </div>
      </div>

      {importStatusMsg && (
        <div className="bg-[#DCFCE7] border border-[#86EFAC] rounded-xl p-3.5 flex items-center justify-between text-xs font-semibold text-[#14532D]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
            <span>{importStatusMsg}</span>
          </div>
          <button
            onClick={() => setImportStatusMsg(null)}
            className="underline text-[#166534] ml-4 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Cuadro para pegar celdas directamente desde Excel */}
      {showPasteBox && (
        <div className="bg-[#FEF9C3]/60 border border-[#FDE047] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#713F12]">
              COPIAR Y PEGAR DIRECTAMENTE DESDE TU HOJA EXCEL (Columnas: Fecha | Tasa Compra | Tasa Venta)
            </span>
            <button
              type="button"
              onClick={() => setShowPasteBox(false)}
              className="text-xs text-[#713F12] underline cursor-pointer"
            >
              Ocultar
            </button>
          </div>
          <textarea
            rows={4}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={`Ejemplo copiando y pegando desde Excel:\n05/01/2026\t35,15\t35,25\n06/01/2026\t35,18\t35,28\n07/01/2026\t35,20\t35,30`}
            className="w-full p-3 text-xs font-mono bg-white border border-[#D6D3D1] rounded-xl focus:outline-none focus:border-[#1C1917]"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleProcessPastedExcel}
              className="px-4 py-2 bg-[#1C1917] text-white rounded-xl text-xs font-bold hover:bg-[#292524] cursor-pointer"
            >
              Importar Filas Pegadas a la Base de Datos
            </button>
          </div>
        </div>
      )}

      {isOpenModal && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Columna Izquierda (7 cols): Simulador de Reconversión por Fecha (Caso 05 de Enero 2026 - 200 Bs.) */}
          <div className="lg:col-span-7 bg-[#FAF8F5] border border-[#D6D3D1] rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-2.5">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#15803D]" />
                <h3 className="text-sm font-bold text-[#1C1917]">
                  Reconversión Automática por Fecha de Depósito en Banesco (Ej. 05 de Enero de 2026 · Bs. 200,00)
                </h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#15803D]">
                {simResolved.esFechaExacta
                  ? `Tasa Exacta del ${simResolved.fechaFormateada}`
                  : `Día Hábil (${simResolved.fechaFormateada})`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#44403C] mb-1">
                  1. Fecha Depósito (Formato XX/XX/2XXX)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="DD/MM/2026 (Ej. 05/01/2026)"
                    value={simFechaText}
                    onChange={(e) => setSimFechaText(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-[#D6D3D1] rounded-xl focus:outline-none focus:border-[#1C1917]"
                  />
                  <input
                    type="date"
                    value={simFechaISO}
                    onChange={(e) => setSimFechaText(formatDateDDMMYYYY(e.target.value))}
                    title="Seleccionar en calendario"
                    className="w-9 px-1.5 py-2 text-xs bg-white border border-[#D6D3D1] rounded-xl cursor-pointer shrink-0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#44403C] mb-1">
                  2. Monto Recibido en Banesco (Bs.)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={simMontoVES}
                  onChange={(e) => setSimMontoVES(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-[#D6D3D1] rounded-xl focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#44403C] mb-1">
                  3. Tipo de Tasa BCV a Aplicar
                </label>
                <select
                  value={simTipoTasa}
                  onChange={(e) => setSimTipoTasa(e.target.value as 'VENTA' | 'COMPRA')}
                  className="w-full px-3 py-2 text-xs font-bold bg-white border border-[#D6D3D1] rounded-xl focus:outline-none focus:border-[#1C1917]"
                >
                  <option value="VENTA">Tasa BCV Venta (Compra USD)</option>
                  <option value="COMPRA">Tasa BCV Compra (Recepción)</option>
                </select>
              </div>
            </div>

            {/* Resultado de la Reconversión con la tasa del día seleccionado */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#DCFCE7] border border-[#86EFAC] rounded-xl p-3">
                <div className="text-[11px] font-bold text-[#166534]">
                  TASA COMPRA BCV ({simResolved.fechaFormateada})
                </div>
                <div className="text-base font-mono font-bold text-[#14532D] mt-0.5">
                  Bs. {simResolved.tasaCompraVES.toFixed(4)} / USD
                </div>
                <div className="text-xs font-mono font-semibold text-[#166534] mt-1">
                  Reconversión: <strong>USD {usdReconvertidosCompra.toFixed(2)}</strong>
                </div>
              </div>

              <div className="bg-[#E0F2FE] border border-[#7DD3FC] rounded-xl p-3">
                <div className="text-[11px] font-bold text-[#0369A1]">
                  TASA VENTA BCV ({simResolved.fechaFormateada})
                </div>
                <div className="text-base font-mono font-bold text-[#0C4A6E] mt-0.5">
                  Bs. {simResolved.tasaVentaVES.toFixed(4)} / USD
                </div>
                <div className="text-xs font-mono font-semibold text-[#0369A1] mt-1">
                  Reconversión: <strong>USD {usdReconvertidosVenta.toFixed(2)}</strong>
                </div>
              </div>

              <div className="bg-[#FEF9C3] border border-[#FDE047] rounded-xl p-3">
                <div className="text-[11px] font-bold text-[#854D0E]">
                  NETO MESA CAMBIO BANESCO (-0,25%)
                </div>
                <div className="text-base font-mono font-bold text-[#713F12] mt-0.5">
                  USD {usdNetoMesaCambio.toFixed(2)}
                </div>
                <div className="text-[11px] font-mono text-[#854D0E] mt-1">
                  Comisión Banesco: Bs. {comisionBanescoSim.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSimFechaText('05/01/2026');
                    setSimMontoVES('200.00');
                  }}
                  className="px-3 py-1.5 bg-white border border-[#D6D3D1] rounded-lg text-xs font-semibold text-[#1C1917] hover:bg-[#F5F5F4] cursor-pointer"
                >
                  Cargar Ejemplo: 200 Bs. el 05/01/2026
                </button>
              </div>

              {onQuickRegisterDeposit && (
                <button
                  type="button"
                  onClick={() =>
                    onQuickRegisterDeposit(simFechaISO, simMontoNum, tasaActivaSim)
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1C1917] text-white rounded-xl text-xs font-bold hover:bg-[#292524] transition-colors cursor-pointer"
                >
                  <span>
                    Usar Fecha {simResolved.fechaFormateada} y Bs. {simMontoNum.toFixed(2)} en Nuevo Anticipo Banesco
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Columna Derecha (5 cols): Tabla de Tasas BCV en Base de Datos + Alta Manual */}
          <div className="lg:col-span-5 bg-[#FAF8F5] border border-[#D6D3D1] rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#0369A1]" />
                  Serie Diaria BCV en Base de Datos ({bcvRates.length} días cargados)
                </span>
                <span className="text-[11px] font-semibold text-[#15803D]">
                  Formato Oficial DD/MM/202X
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filtroMes}
                  onChange={(e) => setFiltroMes(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-white border border-[#D6D3D1] rounded-lg text-[#1C1917]"
                >
                  <option value="ALL">Todos los Meses ({bcvRates.length} días)</option>
                  <option value="2026-10">Octubre 2026 (01/10/2026 - 08/10/2026)</option>
                  <option value="2026-09">Septiembre 2026 (30 días)</option>
                  <option value="2026-08">Agosto 2026 (31 días)</option>
                  <option value="2026-07">Julio 2026 (31 días)</option>
                  <option value="2026-06">Junio 2026 (30 días)</option>
                  <option value="2026-05">Mayo 2026 (31 días)</option>
                  <option value="2026-04">Abril 2026 (30 días)</option>
                  <option value="TRIM1">Enero – Marzo 2026 (Incluye 05/01/2026)</option>
                </select>

                <input
                  type="text"
                  value={busquedaFecha}
                  onChange={(e) => setBusquedaFecha(e.target.value)}
                  placeholder="Buscar DD/MM/202X (ej. 05/01/2026)"
                  className="px-2.5 py-1.5 text-xs font-mono bg-white border border-[#D6D3D1] rounded-lg text-[#1C1917]"
                />
              </div>

              <div className="max-h-[165px] overflow-y-auto border border-[#E7E5E4] rounded-xl bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-[#FAF8F5] border-b border-[#E7E5E4]">
                    <tr>
                      <th className="py-1.5 px-2.5 font-bold">Fecha (DD/MM/202X)</th>
                      <th className="py-1.5 px-2.5 font-bold text-right">Compra (Bs.)</th>
                      <th className="py-1.5 px-2.5 font-bold text-right">Venta (Bs.)</th>
                      <th className="py-1.5 px-2.5 font-bold text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E5E4]">
                    {sortedRates.map((r) => {
                      const dmy = formatDateDDMMYYYY(r.fecha);
                      return (
                        <tr
                          key={r.fecha}
                          className={`hover:bg-[#FAF8F5] ${
                            parseDateToISO(r.fecha) === simFechaISO
                              ? 'bg-[#DCFCE7]/50 font-bold'
                              : ''
                          }`}
                        >
                          <td className="py-1.5 px-2.5 font-mono">{dmy}</td>
                          <td className="py-1.5 px-2.5 font-mono text-right text-[#15803D]">
                            {r.tasaCompraVES.toFixed(4)}
                          </td>
                          <td className="py-1.5 px-2.5 font-mono text-right text-[#0369A1]">
                            {r.tasaVentaVES.toFixed(4)}
                          </td>
                          <td className="py-1.5 px-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => setSimFechaText(dmy)}
                              className="text-[11px] font-semibold text-[#1C1917] underline cursor-pointer"
                            >
                              Simular
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Formulario rápido para añadir/actualizar la tasa de un día específico */}
            <form onSubmit={handleManualSaveRate} className="pt-2 border-t border-[#E7E5E4]">
              <div className="text-[11px] font-bold text-[#44403C] mb-1.5">
                Agregar o Actualizar Tasa por Fecha (Formato XX/XX/2XXX):
              </div>
              <div className="grid grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="DD/MM/2026"
                  value={nuevaFechaText}
                  onChange={(e) => setNuevaFechaText(e.target.value)}
                  className="col-span-1 px-2 py-1.5 text-xs font-mono bg-white border border-[#D6D3D1] rounded-lg"
                  required
                />
                <input
                  type="number"
                  step="0.0001"
                  value={nuevaCompra}
                  onChange={(e) => setNuevaCompra(e.target.value)}
                  placeholder="Compra"
                  className="col-span-1 px-2 py-1.5 text-xs font-mono bg-white border border-[#D6D3D1] rounded-lg"
                  required
                />
                <input
                  type="number"
                  step="0.0001"
                  value={nuevaVenta}
                  onChange={(e) => setNuevaVenta(e.target.value)}
                  placeholder="Venta"
                  className="col-span-1 px-2 py-1.5 text-xs font-mono bg-white border border-[#D6D3D1] rounded-lg"
                  required
                />
                <button
                  type="submit"
                  className="col-span-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 bg-[#15803D] text-white rounded-lg text-xs font-bold hover:bg-[#166534] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
