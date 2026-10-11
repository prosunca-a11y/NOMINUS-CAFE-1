import React, { useState } from 'react';
import { CompanyProfile } from '../data/nominusData';
import {
  OfficialAccountingVoucher,
  RESUMEN_DESTINO_DOLARES_COMPRADOS_2026,
  DESGLOSE_MENSUAL_DOLARES_Y_DESTINO_BS_2026,
  COMPROBANTES_COMPRAS_DOLARES_BANESCO_2026,
} from '../data/agricolaOniAccountingVouchers2026Data';
import {
  CUADRO_SALIDAS_BANCO_POR_CATEGORIA,
  TOTALES_MENSUALES_SALIDAS,
  TOTALES_MENSUALES_ABONOS,
} from '../data/agricolaOniAudit2026Data';
import {
  FileDown,
  Download,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  ShieldCheck,
  DollarSign,
  ArrowRightLeft,
  Landmark,
  Layers,
  Truck,
  PackageCheck,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AgricolaOniFxDestinationSummarySheetViewProps {
  companies: CompanyProfile[];
  vouchers?: OfficialAccountingVoucher[];
  onNavigateToModule?: (moduleId: string) => void;
}

export const AgricolaOniFxDestinationSummarySheetView: React.FC<
  AgricolaOniFxDestinationSummarySheetViewProps
> = ({ companies, vouchers, onNavigateToModule }) => {
  const [filtroMes, setFiltroMes] = useState<string>('ALL');
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);

  const oniCompany =
    companies.find(
      (c) =>
        c.id === 'emp-oni' ||
        c.id.endsWith('_emp-oni') ||
        c.razonSocial.toUpperCase().includes('ONI')
    ) || companies[0];

  const fxVouchers = (
    vouchers && vouchers.some((v) => v.hojaDestino === 'COMPRAS_DOLARES_BANESCO')
      ? vouchers.filter((v) => v.hojaDestino === 'COMPRAS_DOLARES_BANESCO')
      : COMPROBANTES_COMPRAS_DOLARES_BANESCO_2026
  ).filter((v) => filtroMes === 'ALL' || v.mes === filtroMes);

  const allFxVouchers =
    vouchers && vouchers.some((v) => v.hojaDestino === 'COMPRAS_DOLARES_BANESCO')
      ? vouchers.filter((v) => v.hojaDestino === 'COMPRAS_DOLARES_BANESCO')
      : COMPROBANTES_COMPRAS_DOLARES_BANESCO_2026;

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

  const totalFxUSD = 556890.45;
  const totalFxBs = 375630000.0;
  const totalQuintales = 2490;

  // ==========================================================================
  // 1. DESCARGAR HOJA RESUMEN DE DÓLARES COMPRADOS Y DESTINO DEL DINERO (.PDF)
  // ==========================================================================
  const handleDownloadSummaryPdf = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'letter',
    });

    const pageW = doc.internal.pageSize.getWidth();
    const margin = 12;

    // Membrete Corporativo
    doc.setFillColor(20, 83, 45);
    doc.rect(margin, 10, pageW - margin * 2, 18, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(
      `${oniCompany.razonSocial} (RIF: ${oniCompany.rif}) — HOJA RESUMEN DE DÓLARES COMPRADOS Y DESTINO DEL DINERO`,
      margin + 4,
      17
    );
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(
      `Justificación de Salida de Divisas y Aplicación en Bolívares (Enero – Agosto 2026) | Cta. Banesco VES: ${oniCompany.cuentaBanescoVES} | Cta. Custodia USD: ${oniCompany.cuentaBanescoUSD}`,
      margin + 4,
      23.5
    );

    // Tabla 1: Destino Específico de los US$ 556.890,45 (Bs. 375.630.000,00)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(28, 25, 23);
    doc.text(
      '1. CUADRO RESUMEN: ¿CUÁNTOS FUERON LOS DÓLARES COMPRADOS (US$ 556.890,45) Y HACIA DÓNDE FUE ESE DINERO (BS. 375.630.000,00)?',
      margin,
      34
    );

    autoTable(doc, {
      startY: 36.5,
      margin: { left: margin, right: margin },
      head: [
        [
          '#',
          'Cta. VEN-NIF',
          'Destino / Hacia Dónde Fue el Dinero (Ya Cambiado/Aplicado en Bolívares)',
          'Beneficiarios y Proveedores Receptoras',
          'Soporte Legal / Fiscal',
          'Dólares (US$)',
          'Bolívares (Bs.)',
          '% Total',
        ],
      ],
      body: [
        ...RESUMEN_DESTINO_DOLARES_COMPRADOS_2026.map((r) => [
          r.item,
          r.codigoCuentaVenNif,
          r.categoriaDestino,
          r.beneficiariosPrincipales,
          r.soporteDocumental,
          `$${fmtUSD(r.montoUSD)}`,
          `Bs. ${fmtBs(r.montoEquivalenteBs)}`,
          `${fmtUSD(r.porcentajeDelTotal)}%`,
        ]),
        [
          'TOT',
          'CUADRE 1:1',
          'TOTAL DÓLARES COMPRADOS Y JUSTIFICADOS EN SU SALIDA / APLICACIÓN (29 RECIBOS)',
          '100% Trazable en Extracto Banesco',
          '29 Comprobantes Firmados/Sellados',
          `$${fmtUSD(totalFxUSD)}`,
          `Bs. ${fmtBs(totalFxBs)}`,
          '100,00%',
        ],
      ],
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 1.8, textColor: [28, 25, 23] },
      headStyles: { fillColor: [28, 25, 23], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 22, fontStyle: 'bold' },
        2: { cellWidth: 68 },
        3: { cellWidth: 52 },
        4: { cellWidth: 44 },
        5: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
        6: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
        7: { cellWidth: 14, halign: 'right', fontStyle: 'bold' },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.row.index === RESUMEN_DESTINO_DOLARES_COMPRADOS_2026.length) {
          data.cell.styles.fillColor = [220, 252, 231];
          data.cell.styles.textColor = [20, 83, 45];
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });

    const afterT1 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

    // Tabla 2: Desglose Mensual Enero - Agosto 2026
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(28, 25, 23);
    doc.text(
      '2. DESGLOSE MENSUAL (ENERO A AGOSTO 2026): DÓLARES COMPRADOS Y APLICACIÓN EN BOLÍVARES POR CATEGORÍA DE DESTINO',
      margin,
      afterT1
    );

    autoTable(doc, {
      startY: afterT1 + 2.5,
      margin: { left: margin, right: margin },
      head: [
        [
          'Mes',
          'Recibos',
          'Dólares Comprados',
          'Tasa BCV',
          'Bolívares Liquidados',
          '1. Compra Café Verde (82,25%)',
          '2. Fletes e INSAI (11,50%)',
          '3. Trilla y Sacos (6,00%)',
          '4. Comisión BCV (0,25% | IGTF Bs. 0%)',
          'QQ Café',
        ],
      ],
      body: [
        ...DESGLOSE_MENSUAL_DOLARES_Y_DESTINO_BS_2026.map((m) => [
          m.mesNombre,
          `${m.cantidadRecibos} Rec.`,
          `$${fmtUSD(m.dolaresCompradosUSD)}`,
          fmtBs(m.tasaPromedioBcv),
          `Bs. ${fmtBs(m.bolivaresLiquidadosBs)}`,
          `Bs. ${fmtBs(m.destinoCafeProveedoresBs)} ($${fmtUSD(m.destinoCafeProveedoresUSD)})`,
          `Bs. ${fmtBs(m.destinoFletesLogisticaBs)} ($${fmtUSD(m.destinoFletesLogisticaUSD)})`,
          `Bs. ${fmtBs(m.destinoTrillaInsumosBs)} ($${fmtUSD(m.destinoTrillaInsumosUSD)})`,
          `Bs. ${fmtBs(m.destinoComisionesIgtfBs)} ($${fmtUSD(m.destinoComisionesIgtfUSD)})`,
          `${m.quintalesCafeRespaldados} QQ`,
        ]),
        [
          'TOTAL ENE-AGO',
          '29 Rec.',
          `$${fmtUSD(totalFxUSD)}`,
          '674,51',
          `Bs. ${fmtBs(totalFxBs)}`,
          'Bs. 308.955.675,00 ($458.042,39)',
          'Bs. 43.197.450,00 ($64.042,40)',
          'Bs. 22.537.800,00 ($33.413,43)',
          'Bs. 939.075,00 ($1.392,23)',
          `${totalQuintales} QQ`,
        ],
      ],
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1.5, textColor: [28, 25, 23] },
      headStyles: { fillColor: [12, 74, 110], textColor: [255, 255, 255], fontStyle: 'bold' },
      didParseCell: (data) => {
        if (
          data.section === 'body' &&
          data.row.index === DESGLOSE_MENSUAL_DOLARES_Y_DESTINO_BS_2026.length
        ) {
          data.cell.styles.fillColor = [224, 242, 254];
          data.cell.styles.textColor = [12, 74, 110];
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });

    // Página 2: Destino Integral de TODAS las Salidas en Bolívares de la Cuenta Banesco (Bs. 1.956.660.113,95 = US$ 2.907.112,24)
    doc.addPage('letter', 'landscape');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(20, 83, 45);
    doc.text(
      '3. DESTINO GENERAL DE TODOS LOS FONDOS EN BOLÍVARES Y DIVISAS MOVILIZADOS EN LA CUENTA BANESCO (BS. 1.956.660.113,95 = US$ 2.907.112,24)',
      margin,
      16
    );

    autoTable(doc, {
      startY: 19,
      margin: { left: margin, right: margin },
      head: [
        [
          'Cta. Contable',
          'Destino del Dinero que Salió de la Cuenta Banesco (Ya Cambiado/Movilizado en Bolívares)',
          'Naturaleza Económica y Contable VEN-NIF',
          'Total Salida (Bs.)',
          'Equivalente (US$)',
          '% Salidas',
        ],
      ],
      body: [
        ...CUADRO_SALIDAS_BANCO_POR_CATEGORIA.map((s) => [
          s.codigoCuentaContable,
          s.origenOCategoria,
          s.naturalezaContable,
          `Bs. ${fmtBs(s.totalBs)}`,
          `$${fmtUSD(s.totalUSD)}`,
          `${fmtUSD(s.porcentajeTotal)}%`,
        ]),
        [
          'TOTAL SALIDAS',
          'TOTAL SALIDAS JUSTIFICADAS DE LA CUENTA BANESCO (ENERO – AGOSTO 2026)',
          '100% Respaldado con Comprobantes Firmados y Sellados',
          `Bs. ${fmtBs(TOTALES_MENSUALES_SALIDAS.totalBs)}`,
          `$${fmtUSD(TOTALES_MENSUALES_SALIDAS.totalUSD)}`,
          '100,00%',
        ],
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2.2, textColor: [28, 25, 23] },
      headStyles: { fillColor: [154, 52, 18], textColor: [255, 255, 255], fontStyle: 'bold' },
      didParseCell: (data) => {
        if (data.section === 'body' && data.row.index === CUADRO_SALIDAS_BANCO_POR_CATEGORIA.length) {
          data.cell.styles.fillColor = [255, 237, 213];
          data.cell.styles.textColor = [124, 45, 18];
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });

    doc.save('Resumen_Dolares_Comprados_Y_Destino_Del_Dinero_Agricola_Oni_2026.pdf');
    setBannerMsg(
      'Archivo PDF "Resumen_Dolares_Comprados_Y_Destino_Del_Dinero_Agricola_Oni_2026.pdf" descargado exitosamente.'
    );
  };

  // ==========================================================================
  // 2. DESCARGAR HOJA RESUMEN EN WORD EDITABLE (.DOC)
  // ==========================================================================
  const handleDownloadSummaryWord = () => {
    const destRowsHtml = RESUMEN_DESTINO_DOLARES_COMPRADOS_2026.map(
      (r) => `
      <tr>
        <td style="text-align:center;font-weight:bold;">${r.item}</td>
        <td style="font-family:Consolas,monospace;font-weight:bold;">${r.codigoCuentaVenNif}</td>
        <td><strong>${r.categoriaDestino}</strong><br/><span style="font-size:8.5pt;color:#444;">${r.descripcionExplicativa}</span></td>
        <td>${r.beneficiariosPrincipales}</td>
        <td>${r.soporteDocumental}</td>
        <td style="text-align:right;font-family:Consolas,monospace;font-weight:bold;">US$ ${fmtUSD(r.montoUSD)}</td>
        <td style="text-align:right;font-family:Consolas,monospace;font-weight:bold;">Bs. ${fmtBs(r.montoEquivalenteBs)}</td>
        <td style="text-align:right;font-family:Consolas,monospace;font-weight:bold;">${fmtUSD(r.porcentajeDelTotal)}%</td>
      </tr>`
    ).join('');

    const monthlyRowsHtml = DESGLOSE_MENSUAL_DOLARES_Y_DESTINO_BS_2026.map(
      (m) => `
      <tr>
        <td style="font-weight:bold;">${m.mesNombre}</td>
        <td style="text-align:center;">${m.cantidadRecibos}</td>
        <td style="text-align:right;font-family:Consolas,monospace;font-weight:bold;">US$ ${fmtUSD(m.dolaresCompradosUSD)}</td>
        <td style="text-align:right;font-family:Consolas,monospace;">Bs. ${fmtBs(m.tasaPromedioBcv)}</td>
        <td style="text-align:right;font-family:Consolas,monospace;font-weight:bold;">Bs. ${fmtBs(m.bolivaresLiquidadosBs)}</td>
        <td style="text-align:right;font-family:Consolas,monospace;">Bs. ${fmtBs(m.destinoCafeProveedoresBs)}<br/><small>(US$ ${fmtUSD(m.destinoCafeProveedoresUSD)})</small></td>
        <td style="text-align:right;font-family:Consolas,monospace;">Bs. ${fmtBs(m.destinoFletesLogisticaBs)}<br/><small>(US$ ${fmtUSD(m.destinoFletesLogisticaUSD)})</small></td>
        <td style="text-align:right;font-family:Consolas,monospace;">Bs. ${fmtBs(m.destinoTrillaInsumosBs)}<br/><small>(US$ ${fmtUSD(m.destinoTrillaInsumosUSD)})</small></td>
        <td style="text-align:right;font-family:Consolas,monospace;">Bs. ${fmtBs(m.destinoComisionesIgtfBs)}<br/><small>(US$ ${fmtUSD(m.destinoComisionesIgtfUSD)})</small></td>
      </tr>`
    ).join('');

    const globalSalidasHtml = CUADRO_SALIDAS_BANCO_POR_CATEGORIA.map(
      (s) => `
      <tr>
        <td style="font-family:Consolas,monospace;font-weight:bold;">${s.codigoCuentaContable}</td>
        <td style="font-weight:bold;">${s.origenOCategoria}</td>
        <td>${s.naturalezaContable}</td>
        <td style="text-align:right;font-family:Consolas,monospace;font-weight:bold;">Bs. ${fmtBs(s.totalBs)}</td>
        <td style="text-align:right;font-family:Consolas,monospace;font-weight:bold;">US$ ${fmtUSD(s.totalUSD)}</td>
        <td style="text-align:right;font-family:Consolas,monospace;">${fmtUSD(s.porcentajeTotal)}%</td>
      </tr>`
    ).join('');

    const wordHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w="urn:schemas-microsoft-com:office:word"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <title>Hoja Resumen Dólares Comprados y Destino del Dinero - ${oniCompany.razonSocial}</title>
        <style>
          @page { size: 8.5in 11in; margin: 0.6in; }
          body { font-family: Arial, sans-serif; font-size: 9.5pt; color: #1C1917; line-height: 1.35; }
          h1, h2, h3 { margin: 4pt 0; color: #14532D; }
          table { width: 100%; border-collapse: collapse; margin: 8pt 0; font-size: 8.5pt; }
          th, td { border: 1px solid #44403C; padding: 4pt 5pt; vertical-align: top; }
          th { background-color: #1C1917; color: #FFFFFF; font-weight: bold; }
        </style>
      </head>
      <body>
        <h2>${oniCompany.razonSocial} (RIF: ${oniCompany.rif})</h2>
        <h3>HOJA RESUMEN DE DÓLARES COMPRADOS Y DESTINO DEL DINERO (ENERO – AGOSTO 2026)</h3>
        <p><strong>Cuenta Corriente Banesco (VES):</strong> ${oniCompany.cuentaBanescoVES} | <strong>Cuenta Custodia Divisas Banesco (USD):</strong> ${oniCompany.cuentaBanescoUSD}</p>
        <p>El presente informe resume la totalidad de los dólares comprados/liquidados en Banesco durante el período Enero – Agosto 2026 (<strong>US$ ${fmtUSD(totalFxUSD)}</strong> equivalentes a <strong>Bs. ${fmtBs(totalFxBs)}</strong> en 29 recibos verificables) y demuestra hacia dónde fue dirigido cada dólar y bolívar resultante dentro de la cadena agroindustrial cafetalera, así como el destino general de los <strong>Bs. ${fmtBs(TOTALES_MENSUALES_SALIDAS.totalBs)} (US$ ${fmtBs(TOTALES_MENSUALES_SALIDAS.totalUSD)})</strong> egresados de la cuenta bancaria.</p>

        <h3>1. CUADRO RESUMEN: DÓLARES COMPRADOS (US$ 556.890,45) Y HACIA DÓNDE FUE ESE DINERO (BS. 375.630.000,00)</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Cta. VEN-NIF</th>
              <th>Categoría de Destino / Aplicación de los Fondos</th>
              <th>Beneficiarios / Receptores del Pago</th>
              <th>Soporte Documental</th>
              <th>Monto en Dólares</th>
              <th>Monto en Bolívares</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            ${destRowsHtml}
            <tr style="background-color:#DCFCE7;font-weight:bold;">
              <td colspan="5">TOTAL DÓLARES COMPRADOS Y APLICADOS (29 RECIBOS ENERO - AGOSTO 2026)</td>
              <td style="text-align:right;">US$ ${fmtUSD(totalFxUSD)}</td>
              <td style="text-align:right;">Bs. ${fmtBs(totalFxBs)}</td>
              <td style="text-align:right;">100,00%</td>
            </tr>
          </tbody>
        </table>

        <h3>ESTATUS LEGAL DEL IGTF APLICADO EN LOS CÁLCULOS (GACETA OFICIAL EXTRAORDINARIA N° 6.821)</h3>
        <table>
          <thead>
            <tr>
              <th>Transacción</th>
              <th>Alícuota Anterior</th>
              <th>Alícuota Actual</th>
              <th>Detalles Legales Aplicados en Contabilidad</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Operaciones en Bolívares (Sujetos Pasivos Especiales)</strong></td>
              <td style="text-align:center;">2% (Derogada)</td>
              <td style="text-align:center;font-weight:bold;color:#14532D;">0% (Bs. 0,00)</td>
              <td>Reducida a cero (0%) mediante el <strong>Decreto N° 4.972</strong> publicado en la <strong>Gaceta Oficial Extraordinaria N° 6.821 el 12 de julio de 2024</strong>. Todos los pagos en Bolívares desde Banesco tienen 0% de IGTF.</td>
            </tr>
            <tr>
              <td><strong>Pagos en Divisas o Criptoactivos</strong></td>
              <td style="text-align:center;">3%</td>
              <td style="text-align:center;font-weight:bold;color:#9A3412;">3%</td>
              <td>Sigue completamente vigente (3%) únicamente cuando se realizan pagos en divisas o criptoactivos a Sujetos Pasivos Especiales (contribuyentes especiales).</td>
            </tr>
          </tbody>
        </table>

        <h3>2. CUADRO MENSUAL DE DÓLARES COMPRADOS Y DESTINO EN BOLÍVARES (ENERO A AGOSTO 2026)</h3>
        <table>
          <thead>
            <tr>
              <th>Mes</th>
              <th>Recibos</th>
              <th>Dólares Comprados</th>
              <th>Tasa BCV</th>
              <th>Bolívares Liquidados</th>
              <th>1. Compra Café Verde (82,25%)</th>
              <th>2. Fletes e INSAI (11,50%)</th>
              <th>3. Trilla y Sacos (6,00%)</th>
              <th>4. Comisión BCV (0,25% | IGTF Bs. 0%)</th>
            </tr>
          </thead>
          <tbody>
            ${monthlyRowsHtml}
          </tbody>
        </table>

        <h3>3. DESTINO GENERAL DE TODAS LAS SALIDAS EN BOLÍVARES DE LA CUENTA BANESCO (BS. 1.956.660.113,95 = US$ 2.907.112,24)</h3>
        <table>
          <thead>
            <tr>
              <th>Cuenta VEN-NIF</th>
              <th>Partida de Salida en Bolívares (Extracto Banesco)</th>
              <th>Naturaleza Contable</th>
              <th>Total Salida (Bs.)</th>
              <th>Equivalente (US$)</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            ${globalSalidasHtml}
            <tr style="background-color:#FFEDD5;font-weight:bold;">
              <td colspan="3">TOTAL SALIDAS JUSTIFICADAS DE LA CUENTA CORRIENTE BANESCO (ENERO – AGOSTO 2026)</td>
              <td style="text-align:right;">Bs. ${fmtBs(TOTALES_MENSUALES_SALIDAS.totalBs)}</td>
              <td style="text-align:right;">US$ ${fmtUSD(TOTALES_MENSUALES_SALIDAS.totalUSD)}</td>
              <td style="text-align:right;">100,00%</td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', wordHtml], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Hoja_Resumen_Dolares_Comprados_Y_Destino_Agricola_Oni_2026.doc';
    a.click();
    URL.revokeObjectURL(url);
    setBannerMsg(
      'Archivo Word (.DOC) "Hoja_Resumen_Dolares_Comprados_Y_Destino_Agricola_Oni_2026.doc" descargado exitosamente.'
    );
  };

  // ==========================================================================
  // 3. DESCARGAR LOS 29 RECIBOS DE COMPRA DE DÓLARES EN LOTE (.PDF MULTIPÁGINA)
  // ==========================================================================
  const handleDownloadBatchFxReceiptsPdf = (targetList: OfficialAccountingVoucher[], labelLote: string) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter',
    });

    const pageW = doc.internal.pageSize.getWidth();
    const margin = 14;
    const contentW = pageW - margin * 2;

    targetList.forEach((v, index) => {
      if (index > 0) {
        doc.addPage('letter', 'portrait');
      }

      // Encabezado del Recibo Individual
      doc.setFillColor(28, 25, 23);
      doc.rect(margin, 12, contentW, 20, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text(`${oniCompany.razonSocial} · RIF: ${oniCompany.rif}`, margin + 4, 19);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(
        `RECIBO OFICIAL DE COMPRA DE DIVISAS Y TRAZABILIDAD DE DESTINO EN BOLÍVARES · LOTE: ${labelLote}`,
        margin + 4,
        24.5
      );
      doc.text(
        `Cta. Corriente Banesco VES: ${oniCompany.cuentaBanescoVES} | Cta. Custodia USD: ${oniCompany.cuentaBanescoUSD}`,
        margin + 4,
        29.5
      );

      // Caja de Identificación del Recibo
      doc.setFillColor(255, 237, 213);
      doc.setDrawColor(194, 65, 12);
      doc.rect(margin, 35, contentW, 22, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(124, 45, 18);
      doc.text(
        `RECIBO N°: ${v.numeroComprobante}   (Pág. ${index + 1} de ${targetList.length})`,
        margin + 4,
        42
      );
      doc.setFontSize(9);
      doc.setTextColor(28, 25, 23);
      doc.text(`Fecha de Operación: ${v.fechaEmision} (${v.mes} 2026)`, margin + 4, 48);
      doc.text(`Referencia / Pacto Banesco: ${v.referenciaBancariaBanesco}`, margin + 4, 53.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(20, 83, 45);
      doc.text(
        `DÓLARES COMPRADOS: US$ ${fmtUSD(v.montoEquivalenteUSD)}`,
        pageW - margin - 4,
        42,
        { align: 'right' }
      );
      doc.setTextColor(154, 52, 18);
      doc.text(
        `MONTO EN BOLÍVARES: Bs. ${fmtBs(v.montoOperacionBs)}`,
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

      // Datos de Contraparte y Concepto
      autoTable(doc, {
        startY: 61,
        margin: { left: margin, right: margin },
        head: [['Campo de Verificación Bancaria y Fiscal', 'Detalle Registrado en Libros y Estado de Cuenta Banesco']],
        body: [
          ['Contraparte / Destinatario de los Fondos', v.contraparteNombre],
          ['RIF / Identificación Fiscal', v.contraparteRifOCedula],
          ['Institución Financiera y Cuenta', `${v.bancoContraparte} — ${v.numeroCuentaContraparte}`],
          ['Concepto Económico (Art. 34 Cód. Comercio)', v.conceptoGeneral],
          ['1. Origen de los Bolívares en Banesco', v.trazabilidadOrigenFondos],
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

      // Asiento Contable VEN-NIF
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

      // Declaración Jurada
      doc.setFillColor(245, 245, 244);
      doc.rect(margin, afterJournalY, contentW, 18, 'F');
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
        `Certificamos bajo fe de juramento que los fondos de este recibo por Bs. ${fmtBs(v.montoOperacionBs)} (US$ ${fmtUSD(v.montoEquivalenteUSD)}) tienen origen y destino estrictamente lícitos dentro del giro agroindustrial cafetero de ${oniCompany.razonSocial} (RIF ${oniCompany.rif}), habiendo sido destinados a compra de café verde, flete terrestre, trilla y tributos conforme a los soportes del expediente ${v.expedienteSeniatNro}.`,
        contentW - 6
      );
      doc.text(declLines, margin + 3, afterJournalY + 9.5);

      // Bloques de Firma y Sello
      const sigY = afterJournalY + 24;
      const boxW = (contentW - 8) / 3;
      doc.setDrawColor(28, 25, 23);
      doc.rect(margin, sigY, boxW, 28);
      doc.rect(margin + boxW + 4, sigY, boxW, 28);
      doc.rect(margin + (boxW + 4) * 2, sigY, boxW, 28);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('1. REPRESENTANTE LEGAL', margin + boxW / 2, sigY + 5, { align: 'center' });
      doc.text('2. CONTADOR PÚBLICO (CPC)', margin + boxW + 4 + boxW / 2, sigY + 5, {
        align: 'center',
      });
      doc.text('3. RECEPCIÓN BANESCO / SENIAT', margin + (boxW + 4) * 2 + boxW / 2, sigY + 5, {
        align: 'center',
      });

      doc.line(margin + 5, sigY + 19, margin + boxW - 5, sigY + 19);
      doc.line(margin + boxW + 9, sigY + 19, margin + boxW * 2 - 1, sigY + 19);
      doc.line(margin + (boxW + 4) * 2 + 5, sigY + 19, margin + contentW - 5, sigY + 19);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(
        `${oniCompany.representanteLegal} · Sello Húmedo`,
        margin + boxW / 2,
        sigY + 24,
        { align: 'center' }
      );
      doc.text(
        'Firma y Sello Húmedo CPC (VEN-NIF)',
        margin + boxW + 4 + boxW / 2,
        sigY + 24,
        { align: 'center' }
      );
      doc.text(
        'Sello Húmedo de Recepción / Archivo',
        margin + (boxW + 4) * 2 + boxW / 2,
        sigY + 24,
        { align: 'center' }
      );
    });

    doc.save(`Lote_${targetList.length}_Recibos_Compra_Dolares_Banesco_Agricola_Oni_2026.pdf`);
    setBannerMsg(
      `Se descargaron en lote ${targetList.length} recibos oficiales en un solo PDF multipágina ("Lote_${targetList.length}_Recibos_Compra_Dolares_Banesco_Agricola_Oni_2026.pdf") listos para imprimir, firmar y sellar.`
    );
  };

  return (
    <div className="space-y-8">
      {/* CABECERA PRINCIPAL Y ACCIONES DE DESCARGA DIRECTA */}
      <section className="no-print bg-gradient-to-r from-[#FFEDD5] via-[#FEF3C7] to-[#DCFCE7] border border-[#FDBA74] rounded-3xl p-6 lg:p-7 shadow-sm space-y-5">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-black/10 pb-4">
          <div className="space-y-1.5 max-w-4xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#7C2D12] bg-white/90 px-3 py-1 rounded-lg border border-[#FDBA74]">
              <ShieldCheck className="w-4 h-4 text-[#C2410C]" />
              HOJA APARTE DE RESUMEN · JUSTIFICACIÓN DE SALIDA DE DÓLARES Y DESTINO EN BOLÍVARES (ENERO – AGOSTO 2026)
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-[#1C1917] font-display">
              Resumen de Dólares Comprados (US$ 556.890,45) y Hacia Dónde Fue Ese Dinero Convertido en Bolívares
            </h2>
            <p className="text-xs sm:text-sm text-[#44403C] leading-relaxed">
              Esta hoja resume con precisión contable <strong>cuántos fueron los dólares comprados en Banesco</strong> de Enero a Agosto 2026 (<strong>US$ 556.890,45 = Bs. 375.630.000,00</strong> en 29 recibos) y demuestra <strong>hacia dónde fue ese dinero una vez cambiado/liquidado en Bolívares</strong> (compra de café verde a productores, flete terrestre, trilla, sacos y comisiones/IGTF), además del destino total de los <strong>Bs. 1.956.660.113,95 (US$ 2.907.112,24)</strong> movilizados en la cuenta.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleDownloadSummaryPdf}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#9A3412] text-white text-xs font-bold rounded-xl hover:bg-[#7C2D12] transition-colors cursor-pointer shadow-sm"
            >
              <FileDown className="w-4 h-4" />
              Descargar Resumen en PDF (.PDF)
            </button>
            <button
              type="button"
              onClick={handleDownloadSummaryWord}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0369A1] text-white text-xs font-bold rounded-xl hover:bg-[#075985] transition-colors cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              Descargar Resumen en WORD (.DOC)
            </button>
            <button
              type="button"
              onClick={() =>
                handleDownloadBatchFxReceiptsPdf(allFxVouchers, 'Enero-Agosto-2026-29-Recibos')
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#15803D] text-white text-xs font-bold rounded-xl hover:bg-[#166534] transition-colors cursor-pointer shadow-sm"
            >
              <Layers className="w-4 h-4" />
              Descargar 29 Recibos en Lote (.PDF)
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1C1917] text-white text-xs font-semibold rounded-xl hover:bg-[#292524] transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir Hoja
            </button>
          </div>
        </div>

        {/* 4 TARJETAS DE SÍNTESIS EJECUTIVA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white/95 border border-[#FDBA74] rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs font-bold text-[#9A3412] uppercase">
              <span>1. Total Dólares Comprados Banesco</span>
              <DollarSign className="w-4 h-4 text-[#C2410C]" />
            </div>
            <div className="text-xl font-mono font-bold text-[#1C1917] mt-1">
              US$ {fmtUSD(totalFxUSD)}
            </div>
            <div className="text-xs font-mono text-[#7C2D12] font-semibold mt-0.5">
              Equiv. Liquidado: Bs. {fmtBs(totalFxBs)}
            </div>
            <div className="text-[11px] text-[#57534E] mt-1">
              29 Recibos Oficiales (Enero – Agosto 2026)
            </div>
          </div>

          <div className="bg-white/95 border border-[#86EFAC] rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs font-bold text-[#14532D] uppercase">
              <span>2. Destino Café Verde (82,25%)</span>
              <PackageCheck className="w-4 h-4 text-[#15803D]" />
            </div>
            <div className="text-xl font-mono font-bold text-[#14532D] mt-1">
              US$ 458.042,39
            </div>
            <div className="text-xs font-mono text-[#166534] font-semibold mt-0.5">
              Pagado en Bs.: Bs. 308.955.675,00
            </div>
            <div className="text-[11px] text-[#57534E] mt-1">
              2.490 Quintales (46 Kg) · IGTF en Bs.: 0% (Decreto 4.972)
            </div>
          </div>

          <div className="bg-white/95 border border-[#7DD3FC] rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs font-bold text-[#0369A1] uppercase">
              <span>3. Fletes, Trilla y Comisión BCV (17,75%)</span>
              <Truck className="w-4 h-4 text-[#0369A1]" />
            </div>
            <div className="text-xl font-mono font-bold text-[#0C4A6E] mt-1">
              US$ 98.848,06
            </div>
            <div className="text-xs font-mono text-[#0369A1] font-semibold mt-0.5">
              Pagado en Bs.: Bs. 66.674.325,00
            </div>
            <div className="text-[11px] text-[#57534E] mt-1">
              Gandolas INSAI (11,50%) + Trilla (6,00%) + Comisión BCV (0,25%)
            </div>
          </div>

          <div className="bg-white/95 border border-[#D8B4FE] rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs font-bold text-[#6B21A8] uppercase">
              <span>4. Total Salidas Cuenta en Bs.</span>
              <Landmark className="w-4 h-4 text-[#6B21A8]" />
            </div>
            <div className="text-xl font-mono font-bold text-[#581C87] mt-1">
              US$ {fmtUSD(TOTALES_MENSUALES_SALIDAS.totalUSD)}
            </div>
            <div className="text-xs font-mono text-[#6B21A8] font-semibold mt-0.5">
              Total Egresos: Bs. {fmtBs(TOTALES_MENSUALES_SALIDAS.totalBs)}
            </div>
            <div className="text-[11px] text-[#57534E] mt-1">
              100% Conciliado con Entradas (Bs. {fmtBs(TOTALES_MENSUALES_ABONOS.totalBs)})
            </div>
          </div>
        </div>

        {onNavigateToModule && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-black/10 text-xs">
            <span className="font-semibold text-[#44403C]">
              Accesos Rápidos Vinculados a esta Hoja Resumen:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigateToModule('comprobantes-dolares-banesco-2026')}
                className="px-3 py-1.5 bg-[#1C1917] text-white font-bold rounded-lg hover:bg-[#292524] cursor-pointer"
              >
                Ir a Hoja Compra de Dólares (29 Recibos Individuales) →
              </button>
              <button
                type="button"
                onClick={() => onNavigateToModule('carta-ejecutiva-1pagina-banesco-2026')}
                className="px-3 py-1.5 bg-white text-[#14532D] border border-[#15803D] font-bold rounded-lg hover:bg-[#DCFCE7] cursor-pointer"
              >
                Ver Carta 1 Página Banesco
              </button>
              <button
                type="button"
                onClick={() => onNavigateToModule('carta-explicativa-banesco-2026')}
                className="px-3 py-1.5 bg-white text-[#0C4A6E] border border-[#0369A1] font-bold rounded-lg hover:bg-[#E0F2FE] cursor-pointer"
              >
                Ver Carta Extensa Banesco
              </button>
            </div>
          </div>
        )}

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
          CUADRO LEGAL TRIBUTARIO: RESUMEN DEL ESTATUS DEL IGTF (DECRETO N° 4.972 — G.O.E. 6.821)
         ===================================================================== */}
      <section className="bg-[#F0FDF4] border-2 border-[#16A34A] rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0" />
            <h3 className="text-base font-bold text-[#14532D] font-display">
              Verificación Tributaria Aplicada: Resumen del Estatus Vigente del IGTF (SENIAT / BCV)
            </h3>
          </div>
          <span className="text-[11px] font-mono font-bold bg-white text-[#14532D] px-3 py-1 rounded-lg border border-[#86EFAC]">
            Decreto N° 4.972 · G.O.E. N° 6.821 (12/07/2024)
          </span>
        </div>
        <div className="overflow-x-auto border border-[#86EFAC] rounded-xl bg-white">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#14532D] text-white">
                <th className="py-2.5 px-3 font-bold">Transacción</th>
                <th className="py-2.5 px-3 font-bold text-center">Alícuota Anterior</th>
                <th className="py-2.5 px-3 font-bold text-center">Alícuota Actual</th>
                <th className="py-2.5 px-3 font-bold">Detalles Legales y Aplicación en AGRÍCOLA ONI, C.A.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5E4]">
              <tr className="bg-[#F0FDF4]/60">
                <td className="py-2.5 px-3 font-bold text-[#1C1917]">
                  Operaciones en Bolívares (Sujetos Pasivos Especiales)
                </td>
                <td className="py-2.5 px-3 text-center font-mono line-through text-[#991B1B]">
                  2% (Derogada)
                </td>
                <td className="py-2.5 px-3 text-center font-mono font-bold text-[#15803D] text-sm">
                  0% (Bs. 0,00)
                </td>
                <td className="py-2.5 px-3 text-[#44403C]">
                  <strong>Reducida a cero (0%) mediante el Decreto N° 4.972 publicado en la Gaceta Oficial Extraordinaria N° 6.821 el 12 de julio de 2024.</strong> Por tanto, todos los pagos de café, fletes y trilla pagados en Bolívares desde Banesco tienen <strong>0% de IGTF</strong> (sólo aplica comisión bancaria BCV 0,25%).
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-[#1C1917]">
                  Pagos en Divisas o Criptoactivos
                </td>
                <td className="py-2.5 px-3 text-center font-mono text-[#44403C]">3%</td>
                <td className="py-2.5 px-3 text-center font-mono font-bold text-[#9A3412] text-sm">
                  3%
                </td>
                <td className="py-2.5 px-3 text-[#44403C]">
                  <strong>Sigue completamente vigente (3%)</strong> únicamente cuando se realizan pagos en divisas o criptoactivos a Sujetos Pasivos Especiales (contribuyentes especiales).
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* =====================================================================
          CUADRO 1: ¿CUÁNTOS FUERON LOS DÓLARES COMPRADOS Y HACIA DÓNDE FUE ESE DINERO?
         ===================================================================== */}
      <section className="bg-white border border-[#E7E5E4] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#E7E5E4] pb-4">
          <div>
            <span className="text-xs font-bold text-[#C2410C] uppercase">
              CUADRO 1 · JUSTIFICACIÓN ESPECÍFICA DE LA PARTIDA DE COMPRA DE DÓLARES (29 PACTOS ENERO – AGOSTO 2026)
            </span>
            <h3 className="text-xl font-bold text-[#1C1917] font-display mt-0.5">
              1. ¿Cuántos Fueron los Dólares Comprados (US$ 556.890,45) y Hacia Dónde Fue Ese Dinero (Bs. 375.630.000,00)?
            </h3>
            <p className="text-xs text-[#57534E] mt-1">
              Explicación contable y operativa para Banesco y el SENIAT: una vez adquiridos/liquidados los recursos equivalentes a <strong>US$ 556.890,45 (Bs. 375.630.000,00)</strong>, el dinero se aplicó íntegramente a las siguientes <strong>4 áreas de costo agroindustrial cafetero</strong>:
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-[#1C1917] rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1C1917] text-white">
                <th className="py-3 px-3 font-bold text-center">#</th>
                <th className="py-3 px-3 font-bold">Cta. VEN-NIF</th>
                <th className="py-3 px-3 font-bold">
                  Hacia Dónde Fue el Dinero (Destino y Aplicación Productiva)
                </th>
                <th className="py-3 px-3 font-bold">Beneficiarios / Receptores Finales</th>
                <th className="py-3 px-3 font-bold">Soporte Documental Verificable</th>
                <th className="py-3 px-3 font-bold text-right bg-[#14532D]">
                  Dólares Aplicados (US$)
                </th>
                <th className="py-3 px-3 font-bold text-right bg-[#9A3412]">
                  Equivalente en Bolívares (Bs.)
                </th>
                <th className="py-3 px-3 font-bold text-right">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5E4]">
              {RESUMEN_DESTINO_DOLARES_COMPRADOS_2026.map((row) => (
                <tr key={row.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3 px-3 font-mono font-bold text-center text-[#1C1917]">
                    {row.item}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-[#0369A1] whitespace-nowrap">
                    {row.codigoCuentaVenNif}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-[#1C1917]">{row.categoriaDestino}</div>
                    <div className="text-[11px] text-[#57534E] mt-0.5 leading-relaxed">
                      {row.descripcionExplicativa}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[#44403C] font-medium">
                    {row.beneficiariosPrincipales}
                  </td>
                  <td className="py-3 px-3 text-[#44403C]">{row.soporteDocumental}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-[#14532D] bg-[#DCFCE7]/30 whitespace-nowrap">
                    US$ {fmtUSD(row.montoUSD)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-[#9A3412] bg-[#FFEDD5]/30 whitespace-nowrap">
                    Bs. {fmtBs(row.montoEquivalenteBs)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-[#1C1917]">
                    {fmtUSD(row.porcentajeDelTotal)}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#DCFCE7] border-t-2 border-[#15803D] font-bold text-[#14532D] text-xs">
                <td colSpan={5} className="py-3.5 px-3">
                  TOTAL DÓLARES COMPRADOS Y DESTINO DEL DINERO 100% JUSTIFICADO (29 RECIBOS ENERO – AGOSTO 2026)
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-sm">
                  US$ {fmtUSD(totalFxUSD)}
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-sm text-[#9A3412]">
                  Bs. {fmtBs(totalFxBs)}
                </td>
                <td className="py-3.5 px-3 text-right font-mono">100,00%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* =====================================================================
          CUADRO 2: MATRIZ MENSUAL ENERO A AGOSTO 2026 (DÓLARES COMPRADOS Y DESTINO EN BS.)
         ===================================================================== */}
      <section className="bg-white border border-[#E7E5E4] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#E7E5E4] pb-4">
          <div>
            <span className="text-xs font-bold text-[#0369A1] uppercase">
              CUADRO 2 · TRAZABILIDAD CRONOLÓGICA MENSUAL (ENERO A AGOSTO 2026)
            </span>
            <h3 className="text-xl font-bold text-[#1C1917] font-display mt-0.5">
              2. Relación Mensual de Dólares Comprados y Distribución del Dinero en Bolívares por Mes
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto border border-[#E7E5E4] rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0C4A6E] text-white">
                <th className="py-3 px-2.5 font-bold">Mes 2026</th>
                <th className="py-3 px-2 font-bold text-center">Recibos</th>
                <th className="py-3 px-2.5 font-bold text-right bg-[#14532D]">
                  Dólares Comprados (US$)
                </th>
                <th className="py-3 px-2 font-bold text-right">Tasa BCV</th>
                <th className="py-3 px-2.5 font-bold text-right bg-[#9A3412]">
                  Monto Cambiado (Bs.)
                </th>
                <th className="py-3 px-2.5 font-bold text-right">
                  1. Pago Café Verde (82,25%)
                </th>
                <th className="py-3 px-2.5 font-bold text-right">
                  2. Fletes e INSAI (11,50%)
                </th>
                <th className="py-3 px-2.5 font-bold text-right">
                  3. Trilla y Sacos (6,00%)
                </th>
                <th className="py-3 px-2.5 font-bold text-right">
                  4. Comisión BCV (0,25% | IGTF Bs. 0%)
                </th>
                <th className="py-3 px-2 font-bold text-center">QQ Café</th>
                <th className="py-3 px-2.5 font-bold">Contratos / Clientes Vinculados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5E4]">
              {DESGLOSE_MENSUAL_DOLARES_Y_DESTINO_BS_2026.map((m) => (
                <tr key={m.mesCodigo} className="hover:bg-[#FAF8F5]">
                  <td className="py-2.5 px-2.5 font-bold text-[#1C1917] whitespace-nowrap">
                    {m.mesNombre}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono font-bold text-[#0369A1]">
                    {m.cantidadRecibos}
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-mono font-bold text-[#14532D] bg-[#DCFCE7]/25 whitespace-nowrap">
                    US$ {fmtUSD(m.dolaresCompradosUSD)}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-[#57534E]">
                    {fmtBs(m.tasaPromedioBcv)}
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-mono font-bold text-[#9A3412] bg-[#FFEDD5]/25 whitespace-nowrap">
                    Bs. {fmtBs(m.bolivaresLiquidadosBs)}
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-mono whitespace-nowrap">
                    <div className="font-bold text-[#1C1917]">
                      Bs. {fmtBs(m.destinoCafeProveedoresBs)}
                    </div>
                    <div className="text-[10px] text-[#14532D]">
                      US$ {fmtUSD(m.destinoCafeProveedoresUSD)}
                    </div>
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-mono whitespace-nowrap">
                    <div className="font-bold text-[#1C1917]">
                      Bs. {fmtBs(m.destinoFletesLogisticaBs)}
                    </div>
                    <div className="text-[10px] text-[#0369A1]">
                      US$ {fmtUSD(m.destinoFletesLogisticaUSD)}
                    </div>
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-mono whitespace-nowrap">
                    <div className="font-bold text-[#1C1917]">
                      Bs. {fmtBs(m.destinoTrillaInsumosBs)}
                    </div>
                    <div className="text-[10px] text-[#57534E]">
                      US$ {fmtUSD(m.destinoTrillaInsumosUSD)}
                    </div>
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-mono whitespace-nowrap">
                    <div className="font-bold text-[#1C1917]">
                      Bs. {fmtBs(m.destinoComisionesIgtfBs)}
                    </div>
                    <div className="text-[10px] text-[#9A3412]">
                      US$ {fmtUSD(m.destinoComisionesIgtfUSD)}
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono font-bold text-[#14532D]">
                    {m.quintalesCafeRespaldados} QQ
                  </td>
                  <td className="py-2.5 px-2.5 text-[11px] text-[#44403C]">
                    {m.clientesYContratosVinculados}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#1C1917] text-white font-bold text-xs">
                <td className="py-3 px-2.5">TOTAL ENE – AGO</td>
                <td className="py-3 px-2 text-center font-mono">29</td>
                <td className="py-3 px-2.5 text-right font-mono text-[#86EFAC]">
                  US$ {fmtUSD(totalFxUSD)}
                </td>
                <td className="py-3 px-2 text-right font-mono">674,51</td>
                <td className="py-3 px-2.5 text-right font-mono text-[#FDBA74]">
                  Bs. {fmtBs(totalFxBs)}
                </td>
                <td className="py-3 px-2.5 text-right font-mono text-[#86EFAC]">
                  Bs. 308.955.675,00
                  <br />
                  (US$ 458.042,39)
                </td>
                <td className="py-3 px-2.5 text-right font-mono text-[#7DD3FC]">
                  Bs. 43.197.450,00
                  <br />
                  (US$ 64.042,40)
                </td>
                <td className="py-3 px-2.5 text-right font-mono">
                  Bs. 22.537.800,00
                  <br />
                  (US$ 33.413,43)
                </td>
                <td className="py-3 px-2.5 text-right font-mono text-[#FDBA74]">
                  Bs. 939.075,00
                  <br />
                  (US$ 1.392,23)
                </td>
                <td className="py-3 px-2 text-center font-mono text-[#86EFAC]">
                  {totalQuintales} QQ
                </td>
                <td className="py-3 px-2.5 text-[11px] text-[#E7E5E4]">
                  100% Conciliado con Estado de Cuenta Banesco
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* =====================================================================
          CUADRO 3: DESTINO GENERAL DE TODAS LAS SALIDAS EN BOLÍVARES DE LA CUENTA BANESCO
          (PARA JUSTIFICAR LOS US$ 2.907.112,24 / BS. 1.956.660.113,95 YA CAMBIADOS A BOLÍVARES)
         ===================================================================== */}
      <section className="bg-white border border-[#E7E5E4] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#E7E5E4] pb-4">
          <div>
            <span className="text-xs font-bold text-[#15803D] uppercase">
              CUADRO 3 · JUSTIFICACIÓN GLOBAL DEL 100% DE LOS FONDOS QUE SALIERON EN BOLÍVARES DE LA CUENTA BANESCO
            </span>
            <h3 className="text-xl font-bold text-[#1C1917] font-display mt-0.5">
              3. Destino General de los Fondos Movilizados en Bolívares en Banesco (Bs. 1.956.660.113,95 = US$ 2.907.112,24)
            </h3>
            <p className="text-xs text-[#57534E] mt-1">
              Dado que en el sector primario venezolano los caficultores rurales, el transporte pesado, las cuadrillas de campo y los traspasos bancarios se pagan en <strong>Bolívares (VES)</strong>, este cuadro demuestra hacia dónde salió cada Bolívar (y su equivalente en Dólares) de la cuenta corriente Banesco N° <code>0134-0342-18-3421089912</code>:
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-[#E7E5E4] rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1C1917] text-white">
                <th className="py-3 px-3 font-bold">Cta. VEN-NIF</th>
                <th className="py-3 px-3 font-bold">
                  Hacia Dónde Salió el Dinero en Bolívares desde Banesco (Enero – Agosto 2026)
                </th>
                <th className="py-3 px-3 font-bold">Naturaleza Contable y Soporte</th>
                <th className="py-3 px-3 font-bold text-right bg-[#9A3412]">
                  Total Salida en Bolívares (Bs.)
                </th>
                <th className="py-3 px-3 font-bold text-right bg-[#14532D]">
                  Equivalente en Dólares (US$)
                </th>
                <th className="py-3 px-3 font-bold text-right">% Salidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5E4]">
              {CUADRO_SALIDAS_BANCO_POR_CATEGORIA.map((row) => (
                <tr key={row.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3 px-3 font-mono font-bold text-[#0369A1]">
                    {row.codigoCuentaContable}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-[#1C1917]">{row.origenOCategoria}</div>
                    <div className="text-[11px] text-[#57534E] mt-0.5">{row.observacionCPC}</div>
                  </td>
                  <td className="py-3 px-3 text-[#44403C] font-medium">
                    {row.naturalezaContable}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-[#9A3412] bg-[#FFEDD5]/25 whitespace-nowrap">
                    Bs. {fmtBs(row.totalBs)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-[#14532D] bg-[#DCFCE7]/25 whitespace-nowrap">
                    US$ {fmtUSD(row.totalUSD)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-[#1C1917]">
                    {fmtUSD(row.porcentajeTotal)}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#FFEDD5] border-t-2 border-[#C2410C] font-bold text-[#7C2D12] text-xs">
                <td colSpan={3} className="py-3.5 px-3">
                  TOTAL SALIDAS EN BOLÍVARES Y DÓLARES EQUIVALENTES JUSTIFICADAS (ENERO – AGOSTO 2026)
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-sm">
                  Bs. {fmtBs(TOTALES_MENSUALES_SALIDAS.totalBs)}
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-sm text-[#14532D]">
                  US$ {fmtUSD(TOTALES_MENSUALES_SALIDAS.totalUSD)}
                </td>
                <td className="py-3.5 px-3 text-right font-mono">100,00%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* =====================================================================
          CUADRO 4: DETALLE DE LOS 29 RECIBOS INDIVIDUALES DE COMPRA DE DÓLARES
          Y SU DESTINO ESPECÍFICO + DESCARGA EN LOTES
         ===================================================================== */}
      <section className="bg-white border border-[#E7E5E4] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E7E5E4] pb-4">
          <div>
            <span className="text-xs font-bold text-[#7C2D12] uppercase">
              CUADRO 4 · RELACIÓN DE LOS 29 RECIBOS DE COMPRA DE DÓLARES Y SU DESTINO INDIVIDUAL
            </span>
            <h3 className="text-xl font-bold text-[#1C1917] font-display mt-0.5">
              4. Detalle de los 29 Recibos de Compra de Dólares (Enero – Agosto 2026) y Hacia Dónde Fue Cada Lote
            </h3>
          </div>

          <div className="no-print flex flex-wrap items-center gap-2">
            <select
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="px-3 py-2 text-xs font-bold bg-[#FAF8F5] border border-[#D6D3D1] rounded-xl"
            >
              <option value="ALL">Todos los Meses (29 Recibos — US$ 556.890,45)</option>
              <option value="Ene">Enero 2026 (4 Recibos — US$ 5.402,25)</option>
              <option value="Feb">Febrero 2026 (6 Recibos — US$ 7.720,49)</option>
              <option value="Mar">Marzo 2026 (1 Recibo — US$ 977,67)</option>
              <option value="Abr">Abril 2026 (1 Recibo — US$ 2.129,13)</option>
              <option value="May">Mayo 2026 (5 Recibos — US$ 6.236,24)</option>
              <option value="Jun">Junio 2026 (4 Recibos — US$ 134.272,94)</option>
              <option value="Jul">Julio 2026 (4 Recibos — US$ 198.231,39)</option>
              <option value="Ago">Agosto 2026 (4 Recibos — US$ 201.920,34)</option>
            </select>

            <button
              type="button"
              onClick={() =>
                handleDownloadBatchFxReceiptsPdf(
                  fxVouchers,
                  filtroMes === 'ALL' ? 'Completo-29-Recibos' : `Mes-${filtroMes}-2026`
                )
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#15803D] text-white text-xs font-bold rounded-xl hover:bg-[#166534] cursor-pointer shadow-sm"
            >
              <Layers className="w-4 h-4" />
              Descargar Lote Actual ({fxVouchers.length} Recibos) en PDF
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-[#E7E5E4] rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1C1917] text-white">
                <th className="py-2.5 px-3 font-bold">N° Recibo</th>
                <th className="py-2.5 px-2.5 font-bold">Fecha</th>
                <th className="py-2.5 px-3 font-bold">Pacto Banesco</th>
                <th className="py-2.5 px-3 font-bold text-right bg-[#14532D]">
                  Dólares Comprados
                </th>
                <th className="py-2.5 px-2.5 font-bold text-right">Tasa BCV</th>
                <th className="py-2.5 px-3 font-bold text-right bg-[#9A3412]">
                  Bolívares Cambiados
                </th>
                <th className="py-2.5 px-3 font-bold">
                  Hacia Dónde Fue Ese Dinero (Desglose de Salida en Café, Flete, Trilla y Comisión)
                </th>
                <th className="py-2.5 px-3 font-bold">Proveedor / Destinatario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5E4]">
              {fxVouchers.map((v) => (
                <tr key={v.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#0369A1] whitespace-nowrap">
                    {v.numeroComprobante}
                  </td>
                  <td className="py-2.5 px-2.5 font-mono whitespace-nowrap">{v.fechaEmision}</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-[#1C1917] whitespace-nowrap">
                    {v.referenciaBancariaBanesco}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-[#14532D] bg-[#DCFCE7]/25 whitespace-nowrap">
                    US$ {fmtUSD(v.montoEquivalenteUSD)}
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-mono text-[#57534E]">
                    {fmtBs(v.tasaBcvAplicada)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-[#9A3412] bg-[#FFEDD5]/25 whitespace-nowrap">
                    Bs. {fmtBs(v.montoOperacionBs)}
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-[#1C1917] leading-relaxed">
                    {v.trazabilidadDestinoFondos}
                  </td>
                  <td className="py-2.5 px-3 text-[11px] font-medium text-[#44403C]">
                    {v.contraparteNombre}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
