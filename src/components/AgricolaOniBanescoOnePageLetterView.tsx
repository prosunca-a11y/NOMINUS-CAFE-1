import React, { useState } from 'react';
import { CompanyProfile } from '../data/nominusData';
import {
  Printer,
  Copy,
  CheckCircle2,
  FileText,
  Download,
  FileDown,
  ShieldCheck,
  Scale,
  Landmark,
  ArrowRightLeft,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AgricolaOniBanescoOnePageLetterViewProps {
  companies: CompanyProfile[];
  onNavigateToModule?: (moduleId: string) => void;
}

export const AgricolaOniBanescoOnePageLetterView: React.FC<
  AgricolaOniBanescoOnePageLetterViewProps
> = ({ companies, onNavigateToModule }) => {
  const oniCompany =
    companies.find(
      (c) =>
        c.id === 'emp-oni' ||
        c.id.endsWith('_emp-oni') ||
        c.razonSocial.toUpperCase().includes('ONI')
    ) || companies[0];

  const [ciudadEmision, setCiudadEmision] = useState<string>('Caracas / Araure');
  const [fechaCarta, setFechaCarta] = useState<string>('09 de Octubre de 2026');
  const [destinatarioUnidad, setDestinatarioUnidad] = useState<string>(
    'Vicepresidencia de Cumplimiento y Prevención de Legitimación de Capitales / Gerencia de Análisis Financiero (BBU)'
  );
  const [agenciaBanesco, setAgenciaBanesco] = useState<string>(
    'Banesco Banco Universal, C.A. — Banca Corporativa y Agroindustrial'
  );
  const [representanteNombre, setRepresentanteNombre] = useState<string>(
    oniCompany?.representanteLegal || 'Director / Representante Legal Estatutario'
  );
  const [representanteCedula, setRepresentanteCedula] = useState<string>(
    'V-12.458.910'
  );
  const [contadorNombre, setContadorNombre] = useState<string>(
    'Lic. Contador Público Colegiado'
  );
  const [contadorCpc, setContadorCpc] = useState<string>('CPC N° 114.892');
  const [numeroOficio, setNumeroOficio] = useState<string>(
    'ONI-BBU-EJEC-2026-009'
  );
  const [notificationMessage, setNotificationMessage] = useState<string | null>(
    null
  );

  const showNotification = (msg: string) => {
    setNotificationMessage(msg);
    setTimeout(() => {
      setNotificationMessage((prev) => (prev === msg ? null : prev));
    }, 5500);
  };

  // ===========================================================================
  // TEXTO PLANO CONCISO DE 1 PÁGINA PARA PORTAPAPELES / CORREO BANCARIO
  // ===========================================================================
  const plainTextOnePage = `${ciudadEmision}, ${fechaCarta} | OFICIO N° ${numeroOficio}
Señores: BANESCO BANCO UNIVERSAL, C.A. (BBU)
Atención: ${destinatarioUnidad} | ${agenciaBanesco}
Presente.-

ASUNTO: CARTA EXPLICATIVA EJECUTIVA — CONCILIACIÓN ENTRE INGRESOS DECLARADOS EN EEFF (Bs. 92.641.520,01 / USD 116.531,68) Y CRÉDITOS MOVILIZADOS EN BBU (USD 2.781.830,18) — PERÍODO ENERO A AGOSTO 2026.
CLIENTE: ${oniCompany.razonSocial} | RIF: ${oniCompany.rif} | CTA. BANESCO VES: ${oniCompany.cuentaBanescoVES} | CTA. USD: ${oniCompany.cuentaBanescoUSD}

Distinguidos señores:

Yo, ${representanteNombre} (C.I. ${representanteCedula}), en mi carácter de Representante Legal de ${oniCompany.razonSocial} (RIF ${oniCompany.rif}), asistido por nuestro Contador Público Colegiado (${contadorNombre}, ${contadorCpc}), en atención a su solicitud de análisis financiero del período Enero – Agosto 2026, certificamos que NO existe omisión ni discrepancia de ingresos, por cuanto el 95,99% de los créditos movilizados en Banesco corresponde a cuentas patrimoniales del Balance General (Pasivos por Anticipos de Clientes, Traspasos de Cuentas Propias y Línea de Crédito Rotativa) que, por mandato de las normas contables VEN-NIF (NIIF 15), el Art. 13 de la Ley del IVA (SENIAT) y la Resolución SUDEBAN N° 083.18, no constituyen ingresos del Estado de Resultados hasta la entrega física de la cosecha:

1. JUSTIFICACIÓN CONTABLE, TRIBUTARIA (SENIAT) Y BANCARIA (SUDEBAN / BCV) DE LA DIFERENCIA:
• A) Pasivo por Anticipos de Clientes para Procura de Cosecha Cafetalera (Cuenta 2.1.04): Ingresaron Bs. 1.571.513.047,62 (USD 2.317.822,22 — 79,59% del flujo) abonados por compradores industriales identificados con RIF en extracto (DISTRIBUIDORA DIS, C.A. J-30643703-7, EMPRESA ETN, C.A. J-50100487-0 y clientes comerciales Banesco) para asegurar acopio de café verde. Según NIIF 15 (Párr. 106) y Ley de IVA (Art. 13), todo cobro previo a la entrega física con Guía INSAI/SICA se registra como Pasivo en el Balance General. Al 31/08/2026 se habían despachado y devengado en el Estado de Resultados Bs. 92.641.520,01 (USD 116.531,68), quedando Bs. 1.478.871.527,61 (USD 2.201.290,54) en el Pasivo 2.1.04 respaldando inventarios en trilla y entregas en curso.
• B) Traspasos Internos desde Cuentas Propias en Otros Bancos (Cuenta 1.1.01.99): Ingresaron Bs. 208.708.057,73 (USD 308.317,80 — 10,59% del flujo) en 28 transferencias desde cuentas de la propia ${oniCompany.razonSocial} (J-50145638-0) en Mercantil (0105), Provincial (0108), Plaza (0138) y Bancamiga (0172) para centralizar tesorería y adquirir divisas lícitas en Mesa de Cambio Banesco ("Cambiario / Compra $" por USD 556.890,45 destinadas a insumos agrícolas y procura cafetalera conforme al Convenio Cambiario N° 1 BCV). El traslado entre cuentas del mismo titular es reclasificación de efectivo y no ingreso.
• C) Financiamiento Corto Plazo "Crédito Becerra" (Pasivo Financiero 2.1.01.02): Ingresaron Bs. 186.376.000,00 (USD 286.228,93 — 9,83% del flujo) como línea rotativa de capital de trabajo, amortizada y devuelta en un 97,33% (Bs. 181.400.000,00 / USD 278.450,00) desde la misma cuenta Banesco en el período (Sección 11 VEN-NIF PYMES: pasivo financiero, no ingreso).

2. CUADRO RESUMEN DE CONCILIACIÓN EXACTA (ENERO – AGOSTO 2026):
-----------------------------------------------------------------------------------------------------------------
Partida Contable VEN-NIF / Concepto Bancario               Ubicación en EEFF           Monto (Bs.)    Monto (USD)
-----------------------------------------------------------------------------------------------------------------
1. Ingresos Ordinarios Facturados y Entregados (4.1.01.01) Estado de Resultados      92.641.520,01     116.531,68
2. Anticipos Clientes p/ Cosecha en Proceso (Pasivo 2.1.04) Balance General (Pasivo) 1.478.871.527,61  2.201.290,54
3. Traspasos desde Cuentas Propias Otros Bancos (1.1.01.99) Balance General (Activo)  208.708.057,73    308.317,80
4. Línea Rotativa Capital Trabajo "Becerra" (Pasivo 2.1.01) Balance General (Pasivo)  186.376.000,00    286.228,93
-----------------------------------------------------------------------------------------------------------------
TOTAL BRUTO ABONOS EN EXTRACTO BANESCO (282 OPERACIONES)   Libro Mayor Banesco      1.966.597.105,35  2.912.368,95
(-) Diferencial por tasa promedio ponderada de corte BBU   Ajuste Metodológico BBU               —    (130.538,77)
-----------------------------------------------------------------------------------------------------------------
TOTAL CRÉDITOS MOVILIZADOS PROMEDIO REPORTADOS POR BBU     100% CONCILIADO          1.966.597.105,35  2.781.830,18
-----------------------------------------------------------------------------------------------------------------
Nota de Trazabilidad de Salidas (Bs. 1.956.660.113,95 / USD 2.907.112,24): 59,35% Liquidación a productores cafetaleros (USD 1.718.450,12); 19,20% Compra oficial USD Mesa de Cambio Banesco (USD 556.890,45); 9,27% Pago Crédito Becerra (USD 278.450,00); 7,83% Traspasos a cuentas propias (USD 226.910,30); 4,35% Fletes INSAI, IGTF y Nómina LOTTT (USD 126.411,37).

3. SOPORTES DOCUMENTALES QUE SE ANEXAN (FIRMADOS Y SELLADOS):
(1) EEFF Intermedios y Balance de Comprobación al 31/08/2026 visados por CPC (evidenciando Pasivo 2.1.04 e Ingresos 4.1.01); (2) Contratos de Suministro de Café y 16 Comprobantes de Anticipos (DISTRIBUIDORA DIS J-30643703-7, EMPRESA ETN J-50100487-0 y otros); (3) Estados de cuenta propios en Mercantil, Provincial, Plaza y Bancamiga + 9 Comprobantes de Transferencias Internas; (4) Contrato Línea Rotativa Becerra y soportes de pago (97,33% amortizado); (5) 8 Comprobantes de Compra de Divisas Banesco, Guías INSAI/SICA y Declaraciones SENIAT (IVA Forma 30 e ISLR).

Atentamente, por ${oniCompany.razonSocial} (${oniCompany.rif}):

_______________________________          _______________________________          _______________________________
${representanteNombre}                   ${contadorNombre}                        BANESCO BANCO UNIVERSAL, C.A.
C.I. ${representanteCedula} | Rep. Legal   ${contadorCpc} | Contador Público        Acuse de Recibo / Sello Agencia`;

  const handleCopyOnePage = async () => {
    try {
      await navigator.clipboard.writeText(plainTextOnePage);
      showNotification(
        '¡Carta Ejecutiva de 1 Página copiada al portapapeles! Lista para pegar en correo o documento.'
      );
    } catch {
      showNotification('Texto ejecutivo listo para copiar o descargar.');
    }
  };

  // ===========================================================================
  // DESCARGA FUNCIONAL EN WORD (.DOC CALIBRADO ESTRICTAMENTE A 1 SOLA PÁGINA)
  // ===========================================================================
  const handleDownloadWordOnePage = () => {
    const wordHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <title>Carta Ejecutiva 1 Pagina Banesco - ${oniCompany.razonSocial}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page {
            size: 21.59cm 27.94cm;
            margin: 1.25cm 1.4cm 1.2cm 1.4cm;
          }
          body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 8.8pt;
            color: #111111;
            line-height: 1.26;
            margin: 0;
            padding: 0;
          }
          .header-table {
            width: 100%;
            border-bottom: 2px solid #1C1917;
            padding-bottom: 4pt;
            margin-bottom: 6pt;
          }
          .company-title {
            font-size: 13pt;
            font-weight: bold;
            color: #1C1917;
          }
          .company-sub {
            font-size: 7.5pt;
            color: #14532D;
            font-weight: bold;
          }
          .oficio-box {
            border: 1px solid #1C1917;
            background-color: #FAF8F5;
            padding: 4pt 6pt;
            font-size: 7.8pt;
            text-align: right;
          }
          .asunto-box {
            border-left: 3px solid #0369A1;
            background-color: #F0F9FF;
            padding: 5pt 7pt;
            margin: 5pt 0;
            font-size: 8.4pt;
            font-weight: bold;
            color: #0C4A6E;
          }
          .sec-title {
            background-color: #1C1917;
            color: #FFFFFF;
            font-size: 8.3pt;
            font-weight: bold;
            padding: 3pt 6pt;
            margin-top: 6pt;
            margin-bottom: 4pt;
            text-transform: uppercase;
          }
          p {
            margin: 0 0 4.5pt 0;
            text-align: justify;
          }
          .bullet-box {
            border: 1px solid #D6D3D1;
            background-color: #FAF8F5;
            padding: 4.5pt 6pt;
            margin-bottom: 4pt;
            font-size: 8.3pt;
          }
          table.concil-table {
            width: 100%;
            border-collapse: collapse;
            margin: 4pt 0 5pt 0;
            font-size: 8pt;
          }
          table.concil-table th {
            background-color: #14532D;
            color: #FFFFFF;
            padding: 3.5pt 5pt;
            border: 1px solid #14532D;
            text-align: left;
          }
          table.concil-table td {
            padding: 3pt 5pt;
            border: 1px solid #A8A29E;
          }
          .right {
            text-align: right;
          }
          .row-eeff {
            background-color: #DCFCE7;
            font-weight: bold;
          }
          .row-bruto {
            background-color: #F5F5F4;
            font-weight: bold;
          }
          .row-bbu {
            background-color: #E0F2FE;
            font-weight: bold;
            color: #0C4A6E;
          }
          table.sig-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8pt;
          }
          table.sig-table td {
            width: 33.33%;
            border: 1px solid #1C1917;
            padding: 6pt;
            height: 62pt;
            vertical-align: bottom;
            text-align: center;
            font-size: 7.8pt;
            background-color: #FAF8F5;
          }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td style="width: 63%; vertical-align: top;">
              <div class="company-sub">REPÚBLICA BOLIVARIANA DE VENEZUELA · SECTOR AGROINDUSTRIAL CAFETALERO</div>
              <div class="company-title">${oniCompany.razonSocial}</div>
              <div style="font-size: 8pt;">
                <strong>RIF SENIAT:</strong> ${oniCompany.rif} &nbsp;|&nbsp; <strong>Reg. Mercantil:</strong> ${oniCompany.registroMercantil}
              </div>
              <div style="font-size: 7.5pt; color: #44403C;">
                <strong>Domicilio Fiscal:</strong> ${oniCompany.domicilioFiscal}
              </div>
            </td>
            <td style="width: 37%; vertical-align: top;">
              <div class="oficio-box">
                <div style="font-weight: bold; color: #0369A1;">RESPUESTA EJECUTIVA DE CUMPLIMIENTO (1 PÁGINA)</div>
                <div><strong>OFICIO N°:</strong> ${numeroOficio}</div>
                <div><strong>Fecha:</strong> ${ciudadEmision}, ${fechaCarta}</div>
                <div><strong>Cta. Banesco VES:</strong> ${oniCompany.cuentaBanescoVES}</div>
                <div><strong>Cta. Custodia USD:</strong> ${oniCompany.cuentaBanescoUSD}</div>
              </div>
            </td>
          </tr>
        </table>

        <p style="margin-bottom: 4pt;">
          <strong>Señores: BANESCO BANCO UNIVERSAL, C.A. (BBU)</strong> — <strong>Atención:</strong> ${destinatarioUnidad} (${agenciaBanesco}). <strong>Presente.-</strong>
        </p>

        <div class="asunto-box">
          ASUNTO: JUSTIFICACIÓN CONTABLE, LEGAL Y CAMBIARIA DE LA DIFERENCIA ENTRE INGRESOS DECLARADOS EN EEFF (Bs. 92.641.520,01 / USD 116.531,68) Y CRÉDITOS MOVILIZADOS EN BBU (USD 2.781.830,18) — PERÍODO ENERO A AGOSTO 2026.
        </div>

        <p>
          Yo, <strong>${representanteNombre}</strong> (C.I. N° <strong>${representanteCedula}</strong>), actuando como Representante Legal de <strong>${oniCompany.razonSocial}</strong> (RIF <strong>${oniCompany.rif}</strong>), asistido por nuestro Contador Público Colegiado (<strong>${contadorNombre}</strong>, <strong>${contadorCpc}</strong>), en respuesta a su requerimiento sobre el período <strong>Enero – Agosto 2026</strong>, certificamos bajo fe de juramento y conforme a la <strong>Resolución SUDEBAN N° 083.18</strong>, el <strong>Convenio Cambiario N° 1 BCV</strong> y las normas <strong>VEN-NIF (NIIF 15)</strong> que <strong>NO existe inconsistencia ni omisión de ingresos</strong>: la diferencia obedece a que el <strong>95,99% de los abonos recibidos en Banesco proviene de tres (3) cuentas patrimoniales del Balance General (Pasivos y Traspasos Propios)</strong> que por ley no se registran como ventas en el Estado de Resultados:
        </p>

        <div class="sec-title">1. EXPLICACIÓN TÉCNICA DE LAS 3 PARTIDAS DE BALANCE GENERAL MOVILIZADAS EN BANESCO</div>

        <div class="bullet-box">
          <strong>A) Pasivo por Anticipos Recibidos de Clientes para Compra de Cosecha Cafetalera (Cuenta 2.1.04 — Bs. 1.571.513.047,62 / USD 2.317.822,22 Brutos | 79,59% del flujo):</strong> Abonados por clientes industriales con RIF en extracto Banesco (<strong>DISTRIBUIDORA DIS, C.A. J-30643703-7</strong>, <strong>EMPRESA ETN, C.A. J-50100487-0</strong> y compradores mayoristas) bajo contratos de suministro de café verde. Por mandato de la <strong>NIIF 15 (Párr. 106 VEN-NIF)</strong> y el <strong>Art. 13 de la Ley del IVA (SENIAT)</strong>, todo anticipo recibido antes de la entrega física del café con Guía SICA/INSAI debe contabilizarse como un <strong>Pasivo en el Balance General</strong> y no como ingreso. Al 31/08/2026 se habían entregado y facturado en Resultados <strong>Bs. 92.641.520,01 (USD 116.531,68)</strong>, permaneciendo <strong>Bs. 1.478.871.527,61 (USD 2.201.290,54)</strong> en el Pasivo <code>2.1.04</code> respaldando café en beneficio/trilla y despachos en curso.
        </div>

        <div class="bullet-box">
          <strong>B) Transferencias Internas desde Cuentas Propias de AGRÍCOLA ONI, C.A. en Otros Bancos (Cuenta 1.1.01.99 — Bs. 208.708.057,73 / USD 308.317,80 | 10,59% del flujo):</strong> Corresponden a 28 traspasos recibidos desde cuentas propias de la misma empresa (<strong>RIF ${oniCompany.rif}</strong>) en <strong>Mercantil (0105), Provincial (0108), Plaza (0138) y Bancamiga (0172)</strong> para centralizar tesorería y adquirir divisas lícitas en Mesa de Cambio Banesco (<em>"Cambiario / Compra $"</em> por <strong>USD 556.890,45</strong> aplicadas a insumos agrícolas y procura cafetalera según Convenio Cambiario N° 1 BCV). El traslado entre cuentas de un mismo titular es reclasificación de efectivo y no venta.
        </div>

        <div class="bullet-box">
          <strong>C) Línea de Crédito Rotativa de Corto Plazo "Crédito Becerra" (Pasivo Financiero 2.1.01.02 — Bs. 186.376.000,00 / USD 286.228,93 | 9,83% del flujo):</strong> 11 desembolsos de capital de trabajo transitorio para liquidación de cosecha, los cuales fueron <strong>amortizados y devueltos en un 97,33% (Bs. 181.400.000,00 / USD 278.450,00)</strong> desde la misma cuenta Banesco en el período (Sección 11 VEN-NIF PYMES: endeudamiento financiero de Balance General, con saldo neto por pagar al 31/08/2026 de sólo USD 7.778,93).
        </div>

        <div class="sec-title">2. CUADRO DEMOSTRATIVO DE CONCILIACIÓN EXACTA (EEFF VS. CRÉDITOS BBU ENERO – AGOSTO 2026)</div>

        <table class="concil-table">
          <thead>
            <tr>
              <th style="width: 13%;">Cuenta VEN-NIF</th>
              <th style="width: 44%;">Concepto Contable y Naturaleza Bancaria (Enero – Agosto 2026)</th>
              <th style="width: 16%;">Estado Financiero</th>
              <th style="width: 14%; text-align: right;">Bolívares (Bs.)</th>
              <th style="width: 13%; text-align: right;">Divisas (USD)</th>
            </tr>
          </thead>
          <tbody>
            <tr class="row-eeff">
              <td>4.1.01.01</td>
              <td><strong>1. INGRESOS ORDINARIOS DECLARADOS EN EEFF (Ventas entregadas al 31/08/2026)</strong></td>
              <td>Estado de Resultados</td>
              <td class="right">92.641.520,01</td>
              <td class="right">116.531,68</td>
            </tr>
            <tr>
              <td>2.1.04.01 al 03</td>
              <td><strong>2. Pasivo por Anticipos de Clientes en Proceso de Liquidación / Mandato de Acopio</strong> (Bruto USD 2.317.822,22 menos USD 116.531,68 ya facturado en EEFF)</td>
              <td>Balance General (Pasivo NIIF 15)</td>
              <td class="right">1.478.871.527,61</td>
              <td class="right">2.201.290,54</td>
            </tr>
            <tr>
              <td>1.1.01.99</td>
              <td><strong>3. Transferencias Internas desde Cuentas Propias (Mercantil, Provincial, Plaza, Bancamiga)</strong></td>
              <td>Balance General (Activo Efectivo)</td>
              <td class="right">208.708.057,73</td>
              <td class="right">308.317,80</td>
            </tr>
            <tr>
              <td>2.1.01.02</td>
              <td><strong>4. Desembolsos Línea Rotativa "Crédito Becerra"</strong> (Amortizado 97,33% = USD 278.450,00)</td>
              <td>Balance General (Pasivo Financ.)</td>
              <td class="right">186.376.000,00</td>
              <td class="right">286.228,93</td>
            </tr>
            <tr class="row-bruto">
              <td>1.1.01.02</td>
              <td><strong>TOTAL BRUTO DE ABONOS EN EXTRACTO BANESCO (282 OPERACIONES ENE-AGO 2026)</strong></td>
              <td>Libro Mayor Banesco</td>
              <td class="right">1.966.597.105,35</td>
              <td class="right">2.912.368,95</td>
            </tr>
            <tr>
              <td>AJUSTE BBU</td>
              <td colspan="2"><em>Menos: Efecto de tasa promedio ponderada de corte del sistema BBU y partidas de cierre</em></td>
              <td class="right">—</td>
              <td class="right">-130.538,77</td>
            </tr>
            <tr class="row-bbu">
              <td>TOTAL BBU</td>
              <td colspan="2"><strong>CRÉDITOS MOVILIZADOS EN PROMEDIO COMPUTADOS POR ANÁLISIS FINANCIERO BBU</strong></td>
              <td class="right">1.966.597.105,35</td>
              <td class="right">2.781.830,18</td>
            </tr>
          </tbody>
        </table>

        <p style="font-size: 8pt; margin-bottom: 4pt;">
          <strong>Trazabilidad 1:1 de Salidas Bancarias (Bs. 1.956.660.113,95 / USD 2.907.112,24):</strong> (i) Pagos a productores de café verde: <strong>USD 1.718.450,12 (59,35%)</strong>; (ii) Compra lícita de divisas en Mesa de Cambio Banesco: <strong>USD 556.890,45 (19,20%)</strong>; (iii) Amortización Crédito Becerra: <strong>USD 278.450,00 (9,27%)</strong>; (iv) Traspasos a cuentas propias en otros bancos: <strong>USD 226.910,30 (7,83%)</strong>; (v) Fletes INSAI/SICA, Comisiones/IGTF y Nómina Rural LOTTT: <strong>USD 126.411,37 (4,35%)</strong>.
        </p>

        <div class="sec-title">3. RECAUDOS Y SOPORTES DOCUMENTALES QUE SE ANEXAN (FIRMADOS Y SELLADOS)</div>

        <p style="font-size: 8pt; margin-bottom: 4pt;">
          <strong>1)</strong> EEFF Intermedios y Balance de Comprobación al 31/08/2026 visados por Contador Público Colegiado (reflejando el Pasivo <code>2.1.04 Anticipos de Clientes</code> por Bs. 1.571.513.047,62 y los Ingresos EEFF por Bs. 92.641.520,01); <strong>2)</strong> Contratos de Suministro de Café y 16 Comprobantes de Anticipos (<code>COMP-ANT-2026</code> de DISTRIBUIDORA DIS J-30643703-7, EMPRESA ETN J-50100487-0 y otros); <strong>3)</strong> Estados de cuenta propios en Mercantil, Provincial, Plaza y Bancamiga + 9 Comprobantes de Transferencias Internas (<code>COMP-TRP-2026</code>); <strong>4)</strong> Contrato Línea Rotativa Becerra y comprobantes de devolución (97,33% pagado); <strong>5)</strong> 8 Comprobantes de Compra de Divisas Banesco (<code>COMP-DIV-2026</code>), Guías INSAI/SICA y Declaraciones SENIAT (IVA Forma 30 e ISLR).
        </p>

        <table class="sig-table">
          <tr>
            <td>
              ____________________________________<br/>
              <strong>${representanteNombre}</strong><br/>
              C.I. ${representanteCedula} · Representante Legal<br/>
              <strong>${oniCompany.razonSocial} (${oniCompany.rif})</strong><br/>
              <em>Firma Húmeda, Huella y Sello Corporativo</em>
            </td>
            <td>
              ____________________________________<br/>
              <strong>${contadorNombre}</strong><br/>
              <strong>${contadorCpc}</strong> · Contador Público Colegiado<br/>
              Certificación Técnica VEN-NIF / NIIF 15<br/>
              <em>Firma y Sello Húmedo Profesional CPC</em>
            </td>
            <td>
              ____________________________________<br/>
              <strong>BANESCO BANCO UNIVERSAL, C.A.</strong><br/>
              Acuse de Recibo de Agencia / Ejecutivo BBU<br/>
              Fecha y Hora de Recepción de Carpeta<br/>
              <em>Sello Húmedo de Recepción Bancaria</em>
            </td>
          </tr>
        </table>
      </body>
    </html>`;

    const blob = new Blob(['\ufeff', wordHtml], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Carta_Ejecutiva_1_Pagina_Banesco_${oniCompany.rif}_2026.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification(
      '¡Carta Ejecutiva de 1 Sola Página descargada en Word (.DOC)! Calibrada para imprimir en una (1) página.'
    );
  };

  // ===========================================================================
  // DESCARGA FUNCIONAL EN PDF (.PDF CALIBRADO EXACTAMENTE EN 1 SOLA PÁGINA)
  // ===========================================================================
  const handleDownloadPdfOnePage = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter', // 215.9 x 279.4 mm
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 12;
    const contentWidth = pageWidth - marginX * 2;
    let y = 10;

    // 1. ENCABEZADO CORPORATIVO COMPACTO (19mm de alto)
    doc.setFillColor(28, 25, 23);
    doc.rect(marginX, y, contentWidth, 19, 'F');

    doc.setTextColor(134, 239, 172);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.text(
      'REPUBLICA BOLIVARIANA DE VENEZUELA · SECTOR AGROINDUSTRIAL CAFETALERO · CUMPLIMIENTO SUDEBAN / BCV / SENIAT',
      marginX + 3.5,
      y + 4.5
    );

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12.5);
    doc.text(oniCompany.razonSocial, marginX + 3.5, y + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.text(
      `RIF SENIAT: ${oniCompany.rif}  |  ${oniCompany.registroMercantil}`,
      marginX + 3.5,
      y + 14.2
    );
    doc.text(
      `Domicilio Fiscal: ${oniCompany.domicilioFiscal}`,
      marginX + 3.5,
      y + 17.6
    );

    // Bloque derecho del encabezado
    doc.setTextColor(254, 240, 138);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.text(
      `CARTA EJECUTIVA (1 PÁGINA) · OFICIO: ${numeroOficio}`,
      pageWidth - marginX - 3.5,
      y + 5,
      { align: 'right' }
    );
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(
      `Lugar y Fecha: ${ciudadEmision}, ${fechaCarta}`,
      pageWidth - marginX - 3.5,
      y + 9.5,
      { align: 'right' }
    );
    doc.text(
      `Cta. Corriente Banesco VES: ${oniCompany.cuentaBanescoVES}`,
      pageWidth - marginX - 3.5,
      y + 13.8,
      { align: 'right' }
    );
    doc.text(
      `Cta. Custodia Divisas USD: ${oniCompany.cuentaBanescoUSD}`,
      pageWidth - marginX - 3.5,
      y + 17.6,
      { align: 'right' }
    );

    y += 22.5;

    // 2. DESTINATARIO EN 2 LÍNEAS COMPACTAS
    doc.setTextColor(28, 25, 23);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.text(
      `Señores: BANESCO BANCO UNIVERSAL, C.A. (BBU) — ${agenciaBanesco}`,
      marginX,
      y
    );
    y += 3.8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.6);
    const destLine = doc.splitTextToSize(
      `Atención: ${destinatarioUnidad}. Presente.-`,
      contentWidth
    );
    doc.text(destLine, marginX, y);
    y += destLine.length * 3.4 + 1.5;

    // 3. RECUADRO DE ASUNTO
    const asunto =
      'ASUNTO: RESPUESTA EJECUTIVA Y CONCILIACIÓN CONTABLE-FINANCIERA ENTRE LOS INGRESOS DECLARADOS EN EEFF (Bs. 92.641.520,01 / USD 116.531,68) Y LOS CRÉDITOS MOVILIZADOS EN BBU (USD 2.781.830,18) — PERÍODO ENERO A AGOSTO 2026.';
    const asuntoLines = doc.splitTextToSize(asunto, contentWidth - 5);
    const asuntoH = asuntoLines.length * 3.4 + 3;
    doc.setFillColor(240, 249, 255);
    doc.setDrawColor(3, 105, 161);
    doc.rect(marginX, y, contentWidth, asuntoH, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.6);
    doc.setTextColor(12, 74, 110);
    doc.text(asuntoLines, marginX + 2.5, y + 3.6);
    y += asuntoH + 3.5;

    // 4. PÁRRAFO INTRODUCTORIO DIRECTO
    doc.setTextColor(28, 25, 23);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.7);
    const introText = `Yo, ${representanteNombre} (C.I. N° ${representanteCedula}), actuando en mi carácter de Representante Legal de ${oniCompany.razonSocial} (RIF ${oniCompany.rif}), asistido por nuestro Contador Público Colegiado (${contadorNombre}, ${contadorCpc}), en atención a su requerimiento de análisis financiero del período Enero – Agosto 2026, certificamos conforme a la Resolución SUDEBAN N° 083.18 (Debida Diligencia), el Convenio Cambiario N° 1 del BCV y las normas contables VEN-NIF (NIIF 15) que NO existe discrepancia ni omisión de ingresos: la diferencia obedece a que el 95,99% de los abonos en Banesco corresponde a tres (3) partidas patrimoniales de Balance General (Pasivos y Traspasos Propios) que por ley no se registran como ventas en el Estado de Resultados:`;
    const introLines = doc.splitTextToSize(introText, contentWidth);
    doc.text(introLines, marginX, y);
    y += introLines.length * 3.35 + 2;

    // 5. SECCIÓN 1: LAS 3 PARTIDAS DE BALANCE GENERAL
    const drawBanner = (title: string) => {
      doc.setFillColor(28, 25, 23);
      doc.rect(marginX, y, contentWidth, 5.2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text(title, marginX + 2.5, y + 3.7);
      y += 6.8;
    };

    drawBanner(
      '1. JUSTIFICACIÓN CONTABLE (VEN-NIF), TRIBUTARIA (SENIAT) Y BANCARIA (SUDEBAN / BCV) DE LOS FONDOS'
    );

    const drawPoint = (title: string, body: string) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(20, 83, 45);
      doc.text(title, marginX, y);
      y += 3.3;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.4);
      doc.setTextColor(28, 25, 23);
      const lines = doc.splitTextToSize(body, contentWidth);
      doc.text(lines, marginX, y);
      y += lines.length * 3.2 + 1.8;
    };

    drawPoint(
      'A) Pasivo por Anticipos de Clientes para Procura de Cosecha Cafetalera (Cuenta 2.1.04 — Bs. 1.571.513.047,62 / USD 2.317.822,22 Brutos | 79,59%):',
      'Recibidos de compradores industriales identificados con RIF en extracto Banesco (DISTRIBUIDORA DIS, C.A. J-30643703-7, EMPRESA ETN, C.A. J-50100487-0 y clientes comerciales Banesco) bajo contratos de suministro de café verde. Según la NIIF 15 (Párr. 106 VEN-NIF) y el Art. 13 de la Ley del IVA (SENIAT), todo anticipo cobrado antes de la entrega física del grano con Guía INSAI/SICA se registra obligatoriamente como un PASIVO en el Balance General y no como ingreso. Al 31/08/2026 se habían despachado y reconocido en el Estado de Resultados Bs. 92.641.520,01 (USD 116.531,68), quedando Bs. 1.478.871.527,61 (USD 2.201.290,54) en el Pasivo 2.1.04 respaldando lotes de café en beneficio/trilla y entregas en curso.'
    );

    drawPoint(
      `B) Transferencias Internas desde Cuentas Propias de ${oniCompany.razonSocial} en Otros Bancos (Cuenta 1.1.01.99 — Bs. 208.708.057,73 / USD 308.317,80 | 10,59%):`,
      `Corresponden a 28 traspasos propios desde cuentas del mismo titular (${oniCompany.rif}) en Mercantil (0105), Provincial (0108), Plaza (0138) y Bancamiga (0172) ("TRANS. CTAS. PROPIAS OTROS BANCOS") para centralizar tesorería y fondear posturas lícitas en Mesa de Cambio Banesco ("Cambiario / Compra $" por USD 556.890,45 aplicadas a insumos agrícolas y procura cafetalera según Convenio Cambiario N° 1 BCV). El traslado entre cuentas propias es reclasificación de efectivo y no venta.`
    );

    drawPoint(
      'C) Línea de Crédito Rotativa de Capital de Trabajo "Crédito Becerra" (Pasivo Financiero 2.1.01.02 — Bs. 186.376.000,00 / USD 286.228,93 | 9,83%):',
      '11 desembolsos de préstamo puente de corto plazo para liquidación de cosecha, los cuales fueron amortizados y devueltos en un 97,33% (Bs. 181.400.000,00 / USD 278.450,00) desde la misma cuenta Banesco en el período (Sección 11 VEN-NIF PYMES: pasivo financiero de Balance General, quedando un saldo neto de sólo USD 7.778,93).'
    );

    // 6. SECCIÓN 2: TABLA COMPACTA DE CONCILIACIÓN EN 1 PÁGINA
    drawBanner(
      '2. CUADRO RESUMEN DE CONCILIACIÓN EXACTA (EEFF VS. CRÉDITOS MOVILIZADOS BBU ENERO – AGOSTO 2026)'
    );

    autoTable(doc, {
      startY: y - 1,
      margin: { left: marginX, right: marginX },
      head: [
        [
          'Código VEN-NIF',
          'Partida Contable y Naturaleza Bancaria (Enero – Agosto 2026)',
          'Ubicación en EEFF',
          'Monto (Bs.)',
          'Equiv. (USD)',
          '%',
        ],
      ],
      body: [
        [
          '4.1.01.01',
          '1. INGRESOS ORDINARIOS DECLARADOS EN EEFF (Café entregado y facturado al 31/08/2026)',
          'Estado de Resultados',
          '92.641.520,01',
          '116.531,68',
          '4,00%',
        ],
        [
          '2.1.04.01 al 03',
          '2. Pasivo por Anticipos de Clientes en Proceso de Liquidación (Bruto USD 2.317.822,22 - USD 116.531,68)',
          'Balance General (Pasivo NIIF 15)',
          '1.478.871.527,61',
          '2.201.290,54',
          '75,59%',
        ],
        [
          '1.1.01.99',
          '3. Transferencias Internas desde Cuentas Propias (Mercantil, Provincial, Plaza y Bancamiga - 28 Ops)',
          'Balance General (Activo Efectivo)',
          '208.708.057,73',
          '308.317,80',
          '10,59%',
        ],
        [
          '2.1.01.02',
          '4. Desembolsos Línea Rotativa "Crédito Becerra" (Amortizado 97,33% = USD 278.450,00 desde Banesco)',
          'Balance General (Pasivo Financ.)',
          '186.376.000,00',
          '286.228,93',
          '9,83%',
        ],
        [
          '1.1.01.02',
          'TOTAL BRUTO DE ABONOS EN EXTRACTO BANESCO (282 OPERACIONES ENE-AGO 2026)',
          'Libro Mayor Banesco',
          '1.966.597.105,35',
          '2.912.368,95',
          '100,0%',
        ],
        [
          'AJUSTE BBU',
          'Menos: Diferencial por tasa promedio ponderada de corte del sistema BBU y partidas de cierre',
          'Metodología Corte BBU',
          '—',
          '-130.538,77',
          '—',
        ],
        [
          'TOTAL BBU',
          'CRÉDITOS MOVILIZADOS EN PROMEDIO COMPUTADOS POR ANÁLISIS FINANCIERO BBU',
          '100% CONCILIADO',
          '1.966.597.105,35',
          '2.781.830,18',
          '100%',
        ],
      ],
      styles: {
        font: 'helvetica',
        fontSize: 6.9,
        cellPadding: 1.35,
        lineColor: [168, 162, 158],
        lineWidth: 0.12,
      },
      headStyles: {
        fillColor: [20, 83, 45],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 21, fontStyle: 'bold' },
        1: { cellWidth: 91 },
        2: { cellWidth: 33 },
        3: { cellWidth: 24, halign: 'right' },
        4: { cellWidth: 20, halign: 'right', fontStyle: 'bold' },
        5: { cellWidth: 11, halign: 'right' },
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          if (data.row.index === 0) {
            data.cell.styles.fillColor = [220, 252, 231];
            data.cell.styles.fontStyle = 'bold';
          } else if (data.row.index === 4) {
            data.cell.styles.fillColor = [245, 245, 244];
            data.cell.styles.fontStyle = 'bold';
          } else if (data.row.index === 6) {
            data.cell.styles.fillColor = [224, 242, 254];
            data.cell.styles.textColor = [12, 74, 110];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
    });

    y =
      (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 2.5;

    // Nota compacta de Egresos y Compra de Divisas
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.1);
    doc.setTextColor(28, 25, 23);
    const egresosNote =
      'Destino Trazable 1:1 de los Egresos Banesco (Bs. 1.956.660.113,95 / USD 2.907.112,24): (1) Liquidación a productores de café verde: USD 1.718.450,12 (59,35%); (2) Compra lícita de divisas en Mesa de Cambio Banesco ("Cambiario / Compra $"): USD 556.890,45 (19,20%); (3) Devolución Crédito Becerra: USD 278.450,00 (9,27%); (4) Traspasos a cuentas propias otros bancos: USD 226.910,30 (7,83%); (5) Fletes INSAI/SICA, IGTF y Nómina LOTTT: USD 126.411,37 (4,35%).';
    const egresosLines = doc.splitTextToSize(egresosNote, contentWidth);
    doc.text(egresosLines, marginX, y);
    y += egresosLines.length * 3.1 + 2;

    // 7. SECCIÓN 3: RECAUDOS ANEXOS
    drawBanner(
      '3. SOPORTES DOCUMENTALES QUE SE CONSIGNAN ANEXOS (DEBIDAMENTE FIRMADOS Y SELLADOS)'
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(28, 25, 23);
    const anexosText = `1) EEFF Intermedios y Balance de Comprobación al 31/08/2026 visados por CPC (${contadorNombre}, ${contadorCpc}), donde consta el Pasivo 2.1.04 Anticipos de Clientes (Bs. 1.571.513.047,62) y los Ingresos EEFF (Bs. 92.641.520,01);  2) Contratos Comerciales de Suministro de Café y 16 Comprobantes de Anticipos (Serie COMP-ANT-2026: DISTRIBUIDORA DIS J-30643703-7, EMPRESA ETN J-50100487-0 y otros);  3) Estados de cuenta propios en Mercantil (0105), Provincial (0108), Plaza (0138) y Bancamiga (0172) + 9 Comprobantes de Transferencias Internas (COMP-TRP-2026);  4) Contrato Línea Rotativa Becerra y comprobantes de pago (97,33% amortizado);  5) 8 Comprobantes de Compra de Divisas Banesco (COMP-DIV-2026), Guías INSAI/SICA y Declaraciones SENIAT (IVA Forma 30 e ISLR). Sin otro particular, quedamos a su entera disposición.`;
    const anexosLines = doc.splitTextToSize(anexosText, contentWidth);
    doc.text(anexosLines, marginX, y);
    y += anexosLines.length * 3.15 + 3;

    // 8. TRIPLE RECUADRO DE FIRMA Y SELLO HÚMEDO AL PIE DE LA MISMA PÁGINA 1
    const boxW = (contentWidth - 6) / 3;
    const boxH = 26;
    const boxY = Math.min(y, pageHeight - boxH - 10);

    // Recuadro 1
    doc.setDrawColor(28, 25, 23);
    doc.setFillColor(250, 248, 245);
    doc.rect(marginX, boxY, boxW, boxH, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.3);
    doc.setTextColor(28, 25, 23);
    doc.text('1. REPRESENTANTE LEGAL', marginX + 2, boxY + 3.8);
    doc.line(marginX + 3, boxY + 15.5, marginX + boxW - 3, boxY + 15.5);
    doc.setFontSize(7);
    doc.text(representanteNombre, marginX + boxW / 2, boxY + 19, {
      align: 'center',
    });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.text(
      `C.I. ${representanteCedula} · RIF ${oniCompany.rif}`,
      marginX + boxW / 2,
      boxY + 22,
      { align: 'center' }
    );
    doc.text(
      'Firma Húmeda, Huella y Sello',
      marginX + boxW / 2,
      boxY + 24.7,
      { align: 'center' }
    );

    // Recuadro 2
    const box2X = marginX + boxW + 3;
    doc.rect(box2X, boxY, boxW, boxH, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.3);
    doc.setTextColor(20, 83, 45);
    doc.text('2. VISADO CONTADOR PÚBLICO (VEN-NIF)', box2X + 2, boxY + 3.8);
    doc.line(box2X + 3, boxY + 15.5, box2X + boxW - 3, boxY + 15.5);
    doc.setTextColor(28, 25, 23);
    doc.setFontSize(7);
    doc.text(contadorNombre, box2X + boxW / 2, boxY + 19, { align: 'center' });
    doc.setFontSize(6.2);
    doc.text(contadorCpc, box2X + boxW / 2, boxY + 22, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text(
      'Firma y Sello Húmedo Profesional CPC',
      box2X + boxW / 2,
      boxY + 24.7,
      { align: 'center' }
    );

    // Recuadro 3
    const box3X = marginX + (boxW + 3) * 2;
    doc.setFillColor(240, 249, 255);
    doc.rect(box3X, boxY, boxW, boxH, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.3);
    doc.setTextColor(12, 74, 110);
    doc.text('3. ACUSE DE RECIBO BANESCO (BBU)', box3X + 2, boxY + 3.8);
    doc.line(box3X + 3, boxY + 15.5, box3X + boxW - 3, boxY + 15.5);
    doc.setFontSize(6.8);
    doc.text(
      'BANESCO BANCO UNIVERSAL, C.A.',
      box3X + boxW / 2,
      boxY + 19,
      { align: 'center' }
    );
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.text(
      'Sello Húmedo Agencia / Ejecutivo BBU',
      box3X + boxW / 2,
      boxY + 22,
      { align: 'center' }
    );
    doc.text(
      'Fecha, Firma y Hora de Recepción',
      box3X + boxW / 2,
      boxY + 24.7,
      { align: 'center' }
    );

    // Pie de página único (1 de 1)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(120, 113, 108);
    doc.text(
      `${oniCompany.razonSocial} (RIF: ${oniCompany.rif}) — Carta Ejecutiva de Cumplimiento Bancario Banesco (Ene-Ago 2026) · Página Única (1 de 1)`,
      pageWidth / 2,
      pageHeight - 4.5,
      { align: 'center' }
    );

    doc.save(`Carta_Ejecutiva_1_Pagina_Banesco_${oniCompany.rif}_2026.pdf`);
    showNotification(
      '¡PDF Ejecutivo de 1 Sola Página (.PDF) descargado exitosamente! Todo el contenido calza exactamente en 1 hoja tamaño Carta.'
    );
  };

  return (
    <div className="space-y-6">
      {/* PANEL DE CONTROL Y DESCARGA DE LA CARTA EJECUTIVA DE 1 SOLA PÁGINA */}
      <section className="no-print bg-gradient-to-r from-[#DCFCE7] via-[#E0F2FE] to-[#FEF3C7] border-2 border-[#15803D] rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-[#15803D]/20 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold text-[#14532D] uppercase">
              <span>OPCIÓN 2 · MODELO EJECUTIVO RESUMIDO EN 1 SOLA PÁGINA</span>
              <span>·</span>
              <span className="text-[#0369A1]">
                ESPECIAL PARA COMITÉ DE CUMPLIMIENTO Y RIESGO BBU
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-[#1C1917] font-display">
              Carta Ejecutiva de 1 Sola Página para Banesco: Directa, Clara, Concisa y Blindada
            </h2>
            <p className="text-xs text-[#44403C] max-w-4xl leading-relaxed">
              Diseñada por experto bancario para que el analista de <strong>Banesco Banco Universal (BBU)</strong> visualice en <strong>una (1) sola hoja tamaño Carta</strong> la respuesta exacta a su correo: por qué los <strong>Ingresos EEFF (USD 116.531,68)</strong> difieren de los <strong>Créditos Movilizados BBU (USD 2.781.830,18)</strong> bajo protección simultánea de <strong>VEN-NIF (NIIF 15), SENIAT (Art. 13 Ley IVA), SUDEBAN (Res. 083.18) y BCV (Convenio Cambiario N° 1)</strong>.
            </p>
          </div>

          {/* BOTONES DE DESCARGA FUNCIONAL EN WORD (1 PÁGINA) Y PDF (1 PÁGINA) */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleDownloadWordOnePage}
              className="inline-flex items-center gap-2 px-4 py-3 bg-[#1D4ED8] text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-[#1E40AF] transition-colors cursor-pointer shadow-md border border-[#1E3A8A]"
            >
              <FileDown className="w-4 h-4 shrink-0" />
              Descargar en WORD (1 Página .DOC)
            </button>

            <button
              type="button"
              onClick={handleDownloadPdfOnePage}
              className="inline-flex items-center gap-2 px-4 py-3 bg-[#DC2626] text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-[#B91C1C] transition-colors cursor-pointer shadow-md border border-[#991B1B]"
            >
              <Download className="w-4 h-4 shrink-0" />
              Descargar en PDF (1 Página .PDF)
            </button>

            <button
              type="button"
              onClick={handleCopyOnePage}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-[#0369A1] text-white text-xs font-bold rounded-xl hover:bg-[#075985] transition-colors cursor-pointer shadow-sm"
            >
              <Copy className="w-4 h-4 shrink-0" />
              Copiar Resumen
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-[#1C1917] text-white text-xs font-bold rounded-xl hover:bg-[#292524] transition-colors cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4 shrink-0" />
              Imprimir 1 Hoja
            </button>
          </div>
        </div>

        {notificationMessage && (
          <div className="bg-white border-2 border-[#15803D] rounded-xl p-3 flex items-center justify-between text-xs font-bold text-[#14532D] shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
              <span>{notificationMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotificationMessage(null)}
              className="underline cursor-pointer ml-4"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* SELECTOR RÁPIDO ENTRE AMBOS MODELOS DE CARTA (PÁGINAS DIFERENTES DE LA APP) */}
        <div className="bg-white/95 border border-[#D6D3D1] rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-[#1C1917]">
              Tienes disponibles las dos (2) opciones de Carta para Banesco en páginas separadas del sistema:
            </div>
            <div className="text-[11px] text-[#57534E]">
              Puedes presentar la <strong>Carta Ejecutiva de 1 Sola Página</strong> como portada principal ante el Ejecutivo de Banesco, o usar la <strong>Carta Extensa Detallada</strong> como informe ampliado.
            </div>
          </div>

          {onNavigateToModule && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onNavigateToModule('carta-explicativa-banesco-2026')}
                className="px-3.5 py-2 bg-[#E0F2FE] border border-[#38BDF8] text-[#0C4A6E] text-xs font-bold rounded-xl hover:bg-[#BAE6FD] cursor-pointer"
              >
                Ver Opción 1: Carta Extensa Detallada (Módulo 00)
              </button>
              <span className="px-3.5 py-2 bg-[#14532D] text-white text-xs font-bold rounded-xl">
                Activa Opción 2: Carta Ejecutiva 1 Sola Página
              </span>
            </div>
          )}
        </div>

        {/* CAMPOS EDITABLES EN TIEMPO REAL */}
        <div className="bg-white/95 border border-[#D6D3D1] rounded-2xl p-4 space-y-3">
          <div className="text-xs font-bold text-[#1C1917]">
            Personaliza los Datos del Firmante y Destinatario (se actualizan al instante en la vista, el Word de 1 página y el PDF de 1 página):
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#57534E] mb-1">
                Ciudad y Fecha
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  value={ciudadEmision}
                  onChange={(e) => setCiudadEmision(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#D6D3D1] rounded-lg"
                />
                <input
                  type="text"
                  value={fechaCarta}
                  onChange={(e) => setFechaCarta(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#D6D3D1] rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#57534E] mb-1">
                Representante Legal y Cédula
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  value={representanteNombre}
                  onChange={(e) => setRepresentanteNombre(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#D6D3D1] rounded-lg"
                />
                <input
                  type="text"
                  value={representanteCedula}
                  onChange={(e) => setRepresentanteCedula(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#FAF8F5] border border-[#D6D3D1] rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#57534E] mb-1">
                Contador Público y CPC
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  value={contadorNombre}
                  onChange={(e) => setContadorNombre(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#D6D3D1] rounded-lg"
                />
                <input
                  type="text"
                  value={contadorCpc}
                  onChange={(e) => setContadorCpc(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#FAF8F5] border border-[#D6D3D1] rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#57534E] mb-1">
                N° Oficio Interno
              </label>
              <input
                type="text"
                value={numeroOficio}
                onChange={(e) => setNumeroOficio(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono bg-[#FAF8F5] border border-[#D6D3D1] rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* RESUMEN DE LOS 4 BLINDAJES EXPERTOS APLICADOS EN ESTA CARTA DE 1 PÁGINA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white/95 border border-[#86EFAC] rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-[#14532D]">
              <span>1. Blindaje Contable VEN-NIF</span>
              <FileText className="w-4 h-4 text-[#15803D]" />
            </div>
            <p className="text-[11px] text-[#44403C]">
              Invoca <strong>NIIF 15 (Párr. 106)</strong> y <strong>Sección 23 VEN-NIF PYMES</strong>: los anticipos para compra de café son <strong>Pasivos del Contrato (`2.1.04`)</strong> en el Balance General, no ventas devengadas.
            </p>
          </div>

          <div className="bg-white/95 border border-[#7DD3FC] rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-[#0C4A6E]">
              <span>2. Blindaje Tributario SENIAT</span>
              <Scale className="w-4 h-4 text-[#0369A1]" />
            </div>
            <p className="text-[11px] text-[#44403C]">
              Invoca el <strong>Art. 13 de la Ley del IVA</strong>: en bienes muebles corporales (café verde), el hecho imponible e ingreso fiscal nace con la entrega física y Guía INSAI/SICA.
            </p>
          </div>

          <div className="bg-white/95 border border-[#FDE047] rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-[#713F12]">
              <span>3. Blindaje Bancario SUDEBAN</span>
              <ShieldCheck className="w-4 h-4 text-[#A16207]" />
            </div>
            <p className="text-[11px] text-[#44403C]">
              Cumple la <strong>Resolución SUDEBAN 083.18</strong> identificando titulares con RIF en extracto (`J-30643703-7`, `J-50100487-0`), bancos emisores de cuentas propias (`0105`, `0108`, `0138`, `0172`) y amortización del 97,33% del crédito rotativo.
            </p>
          </div>

          <div className="bg-white/95 border border-[#FDBA74] rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-[#7C2D12]">
              <span>4. Blindaje Cambiario BCV</span>
              <Landmark className="w-4 h-4 text-[#C2410C]" />
            </div>
            <p className="text-[11px] text-[#44403C]">
              Justifica el destino agroindustrial del 100% de las compras de divisas en Mesa de Cambio Banesco (<strong>USD 556.890,45</strong>) bajo el <strong>Convenio Cambiario N° 1 del BCV</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================================
          HOJA ÚNICA OFICIAL (1 SOLA PÁGINA CALIBRADA PARA IMPRESIÓN Y ENTREGA)
         ===================================================================== */}
      <article className="bg-white border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-md max-w-[1050px] mx-auto space-y-4 text-[#1C1917] leading-snug">
        {/* ENCABEZADO CORPORATIVO COMPACTO */}
        <header className="border-b-2 border-[#1C1917] pb-3.5 flex flex-col md:flex-row justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-[11px] font-mono font-bold text-[#15803D] tracking-wide">
              REPÚBLICA BOLIVARIANA DE VENEZUELA · SECTOR AGROINDUSTRIAL CAFETALERO · CUMPLIMIENTO BANCARIO
            </div>
            <h1 className="text-xl lg:text-2xl font-bold text-[#1C1917] font-display">
              {oniCompany.razonSocial}
            </h1>
            <div className="text-xs font-mono text-[#44403C]">
              <strong>RIF SENIAT:</strong> {oniCompany.rif} ·{' '}
              <strong>Reg. Mercantil:</strong> {oniCompany.registroMercantil}
            </div>
            <div className="text-[11px] text-[#57534E]">
              <strong>Domicilio Fiscal:</strong> {oniCompany.domicilioFiscal}
            </div>
          </div>

          <div className="bg-[#FAF8F5] border border-[#1C1917] rounded-xl p-3 text-right min-w-[265px] space-y-0.5">
            <div className="text-[10px] font-mono font-bold text-[#0369A1] uppercase">
              CARTA EJECUTIVA DE CUMPLIMIENTO (1 PÁGINA)
            </div>
            <div className="text-xs font-mono font-bold text-[#1C1917]">
              OFICIO N°: {numeroOficio}
            </div>
            <div className="text-[11px] text-[#44403C]">
              <strong>Fecha:</strong> {ciudadEmision}, {fechaCarta}
            </div>
            <div className="text-[10px] font-mono text-[#14532D]">
              Cta. Banesco VES: {oniCompany.cuentaBanescoVES}
            </div>
            <div className="text-[10px] font-mono text-[#0C4A6E]">
              Cta. Custodia USD: {oniCompany.cuentaBanescoUSD}
            </div>
          </div>
        </header>

        {/* DESTINATARIO Y ASUNTO CONCISO */}
        <div className="text-xs space-y-0.5">
          <div>
            <strong>Señores: BANESCO BANCO UNIVERSAL, C.A. (BBU)</strong> —{' '}
            <span className="text-[#44403C]">{agenciaBanesco}</span>
          </div>
          <div>
            <strong>Atención:</strong> {destinatarioUnidad}.{' '}
            <strong>Presente.-</strong>
          </div>
        </div>

        <div className="bg-[#F0F9FF] border-l-4 border-[#0369A1] p-3 rounded-r-xl text-xs font-bold text-[#0C4A6E]">
          ASUNTO: RESPUESTA EJECUTIVA Y CONCILIACIÓN CONTABLE-FINANCIERA ENTRE LOS INGRESOS DECLARADOS EN EEFF (Bs. 92.641.520,01 / USD 116.531,68) Y LOS CRÉDITOS MOVILIZADOS EN BBU (USD 2.781.830,18) — PERÍODO ENERO A AGOSTO 2026.
        </div>

        {/* PÁRRAFO DIRECTO DE APERTURA */}
        <p className="text-xs sm:text-[13px] text-justify">
          Yo, <strong>{representanteNombre}</strong> (C.I. N°{' '}
          <strong>{representanteCedula}</strong>), actuando en mi carácter de Representante Legal de{' '}
          <strong>{oniCompany.razonSocial}</strong> (RIF{' '}
          <strong>{oniCompany.rif}</strong>), asistido por nuestro Contador Público Colegiado (
          <strong>{contadorNombre}</strong>, <strong>{contadorCpc}</strong>), en respuesta a su solicitud de análisis financiero del período{' '}
          <strong>Enero – Agosto 2026</strong>, certificamos conforme a la{' '}
          <strong>Resolución SUDEBAN N° 083.18</strong>, el{' '}
          <strong>Convenio Cambiario N° 1 del BCV</strong> y los principios contables{' '}
          <strong>VEN-NIF (NIIF 15)</strong> que{' '}
          <strong>NO existe discrepancia ni omisión de ingresos</strong>: la diferencia obedece a que el{' '}
          <strong>95,99% de los créditos movilizados en Banesco corresponde a tres (3) partidas patrimoniales del Balance General (Pasivos y Traspasos Propios)</strong> que por mandato legal y contable no se registran como ventas en el Estado de Resultados:
        </p>

        {/* SECCIÓN 1: LAS 3 PARTIDAS DE BALANCE GENERAL EN FORMATO EJECUTIVO */}
        <div className="space-y-2">
          <div className="bg-[#1C1917] text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase">
            1. Justificación Contable (VEN-NIF), Tributaria (SENIAT) y Bancaria (SUDEBAN / BCV) de los Fondos
          </div>

          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="bg-[#FAF8F5] border border-[#D6D3D1] rounded-xl p-3 text-justify">
              <strong className="text-[#14532D]">
                A) Pasivo por Anticipos de Clientes para Procura de Cosecha Cafetalera (Cuenta 2.1.04 — Bs. 1.571.513.047,62 / USD 2.317.822,22 Brutos | 79,59% del flujo):
              </strong>{' '}
              Recibidos de clientes industriales identificados con RIF en el extracto Banesco (
              <strong>DISTRIBUIDORA DIS, C.A. J-30643703-7</strong>,{' '}
              <strong>EMPRESA ETN, C.A. J-50100487-0</strong> y compradores comerciales Banesco) bajo contratos de suministro de café verde para asegurar cosecha y financiar pagos a caficultores. Conforme a la{' '}
              <strong>NIIF 15 (Párr. 106 VEN-NIF)</strong> y al{' '}
              <strong>Art. 13 de la Ley del IVA (SENIAT)</strong>, todo anticipo recibido antes de la entrega física del grano con Guía INSAI/SICA se registra obligatoriamente como un{' '}
              <strong>Pasivo en el Balance General</strong> y no como ingreso. Al 31/08/2026 se habían despachado y reconocido en el Estado de Resultados{' '}
              <strong>Bs. 92.641.520,01 (USD 116.531,68)</strong>, permaneciendo{' '}
              <strong>Bs. 1.478.871.527,61 (USD 2.201.290,54)</strong> en el Pasivo{' '}
              <code>2.1.04</code> respaldando inventarios en trilla y entregas en curso.
            </div>

            <div className="bg-[#FAF8F5] border border-[#D6D3D1] rounded-xl p-3 text-justify">
              <strong className="text-[#0369A1]">
                B) Transferencias Internas desde Cuentas Propias de {oniCompany.razonSocial} en Otros Bancos (Cuenta 1.1.01.99 — Bs. 208.708.057,73 / USD 308.317,80 | 10,59% del flujo):
              </strong>{' '}
              Corresponden a 28 traspasos propios provenientes de cuentas de la misma empresa (
              <strong>RIF {oniCompany.rif}</strong>) en{' '}
              <strong>0105 Mercantil, 0108 Provincial, 0138 Banco Plaza y 0172 Bancamiga</strong> (
              <em>&ldquo;TRANS. CTAS. PROPIAS OTROS BANCOS&rdquo;</em>) para centralizar tesorería y fondear la compra lícita de divisas en Mesa de Cambio Banesco (
              <em>&ldquo;Cambiario / Compra $&rdquo;</em> por{' '}
              <strong>USD 556.890,45</strong> destinadas a insumos agrícolas y procura cafetalera según el Convenio Cambiario N° 1 del BCV). El traslado entre cuentas de un mismo titular es reclasificación de efectivo y no venta.
            </div>

            <div className="bg-[#FAF8F5] border border-[#D6D3D1] rounded-xl p-3 text-justify">
              <strong className="text-[#B45309]">
                C) Línea de Crédito Rotativa de Capital de Trabajo &ldquo;Crédito Becerra&rdquo; (Pasivo Financiero 2.1.01.02 — Bs. 186.376.000,00 / USD 286.228,93 | 9,83% del flujo):
              </strong>{' '}
              11 desembolsos de préstamo puente de corto plazo para liquidación de cosecha, los cuales fueron{' '}
              <strong>amortizados y devueltos en un 97,33% (Bs. 181.400.000,00 / USD 278.450,00)</strong> desde la misma cuenta Banesco en el período (Sección 11 VEN-NIF PYMES: pasivo financiero de Balance General, quedando un saldo neto por pagar al 31/08/2026 de sólo USD 7.778,93).
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: CUADRO RESUMEN DE CONCILIACIÓN EXACTA */}
        <div className="space-y-2">
          <div className="bg-[#1C1917] text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase">
            2. Cuadro Resumen de Conciliación Exacta (EEFF vs. Créditos Movilizados BBU Enero – Agosto 2026)
          </div>

          <div className="overflow-x-auto border border-[#1C1917] rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#14532D] text-white">
                  <th className="py-1.5 px-2.5">Código VEN-NIF</th>
                  <th className="py-1.5 px-2.5">Partida Contable y Naturaleza Bancaria (Enero – Agosto 2026)</th>
                  <th className="py-1.5 px-2.5">Ubicación en EEFF</th>
                  <th className="py-1.5 px-2.5 text-right">Bolívares (Bs.)</th>
                  <th className="py-1.5 px-2.5 text-right">Divisas (USD)</th>
                  <th className="py-1.5 px-2.5 text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                <tr className="bg-[#DCFCE7]/60 font-bold text-[#14532D]">
                  <td className="py-1.5 px-2.5 font-mono">4.1.01.01</td>
                  <td className="py-1.5 px-2.5">
                    1. INGRESOS ORDINARIOS DECLARADOS EN EEFF (Café entregado y facturado al 31/08/2026)
                  </td>
                  <td className="py-1.5 px-2.5">Estado de Resultados</td>
                  <td className="py-1.5 px-2.5 text-right font-mono">92.641.520,01</td>
                  <td className="py-1.5 px-2.5 text-right font-mono">116.531,68</td>
                  <td className="py-1.5 px-2.5 text-right font-mono">4,00%</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-2.5 font-mono font-bold">2.1.04.01 al 03</td>
                  <td className="py-1.5 px-2.5">
                    <strong>2. Pasivo por Anticipos de Clientes en Proceso de Liquidación</strong>{' '}
                    <span className="text-[11px] text-[#57534E]">
                      (Bruto USD 2.317.822,22 menos USD 116.531,68 ya facturado en EEFF)
                    </span>
                  </td>
                  <td className="py-1.5 px-2.5">Balance General (Pasivo NIIF 15)</td>
                  <td className="py-1.5 px-2.5 text-right font-mono">1.478.871.527,61</td>
                  <td className="py-1.5 px-2.5 text-right font-mono font-bold">2.201.290,54</td>
                  <td className="py-1.5 px-2.5 text-right font-mono">75,59%</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-2.5 font-mono font-bold">1.1.01.99</td>
                  <td className="py-1.5 px-2.5">
                    <strong>3. Transferencias Internas desde Cuentas Propias</strong>{' '}
                    <span className="text-[11px] text-[#57534E]">
                      (Mercantil 0105, Provincial 0108, Plaza 0138 y Bancamiga 0172 — 28 Ops)
                    </span>
                  </td>
                  <td className="py-1.5 px-2.5">Balance General (Activo Efectivo)</td>
                  <td className="py-1.5 px-2.5 text-right font-mono">208.708.057,73</td>
                  <td className="py-1.5 px-2.5 text-right font-mono font-bold">308.317,80</td>
                  <td className="py-1.5 px-2.5 text-right font-mono">10,59%</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-2.5 font-mono font-bold">2.1.01.02</td>
                  <td className="py-1.5 px-2.5">
                    <strong>4. Desembolsos Línea Rotativa &ldquo;Crédito Becerra&rdquo;</strong>{' '}
                    <span className="text-[11px] text-[#57534E]">
                      (Amortizado 97,33% = Bs. 181.400.000,00 / USD 278.450,00 desde Banesco)
                    </span>
                  </td>
                  <td className="py-1.5 px-2.5">Balance General (Pasivo Financ.)</td>
                  <td className="py-1.5 px-2.5 text-right font-mono">186.376.000,00</td>
                  <td className="py-1.5 px-2.5 text-right font-mono font-bold">286.228,93</td>
                  <td className="py-1.5 px-2.5 text-right font-mono">9,83%</td>
                </tr>
                <tr className="bg-[#FAF8F5] font-bold border-t border-[#1C1917]">
                  <td className="py-1.5 px-2.5 font-mono">1.1.01.02</td>
                  <td className="py-1.5 px-2.5">
                    TOTAL BRUTO DE ABONOS EN EXTRACTO BANESCO (282 OPERACIONES ENE-AGO 2026)
                  </td>
                  <td className="py-1.5 px-2.5">Libro Mayor Banesco</td>
                  <td className="py-1.5 px-2.5 text-right font-mono">1.966.597.105,35</td>
                  <td className="py-1.5 px-2.5 text-right font-mono">2.912.368,95</td>
                  <td className="py-1.5 px-2.5 text-right font-mono">100,0%</td>
                </tr>
                <tr className="bg-[#FEF9C3]/50 text-[#713F12]">
                  <td className="py-1 px-2.5 font-mono">AJUSTE BBU</td>
                  <td className="py-1 px-2.5" colSpan={2}>
                    <em>
                      Menos: Diferencial por tasa promedio ponderada de corte del sistema BBU y partidas de cierre
                    </em>
                  </td>
                  <td className="py-1 px-2.5 text-right font-mono">—</td>
                  <td className="py-1 px-2.5 text-right font-mono font-bold">-130.538,77</td>
                  <td className="py-1 px-2.5 text-right font-mono">—</td>
                </tr>
                <tr className="bg-[#E0F2FE] font-bold text-[#0C4A6E] border-t border-[#0369A1]">
                  <td className="py-1.5 px-2.5 font-mono">TOTAL BBU</td>
                  <td className="py-1.5 px-2.5" colSpan={2}>
                    CRÉDITOS MOVILIZADOS EN PROMEDIO COMPUTADOS POR ANÁLISIS FINANCIERO BBU (ENERO – AGOSTO 2026)
                  </td>
                  <td className="py-1.5 px-2.5 text-right font-mono">1.966.597.105,35</td>
                  <td className="py-1.5 px-2.5 text-right font-mono">2.781.830,18</td>
                  <td className="py-1.5 px-2.5 text-right font-mono">100%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-[#44403C] bg-[#FAF8F5] border border-[#E7E5E4] rounded-xl p-2.5 text-justify">
            <strong>Destino Trazable 1:1 de las Salidas Bancarias Banesco (Bs. 1.956.660.113,95 / USD 2.907.112,24):</strong>{' '}
            <strong>(1)</strong> Liquidación a productores de café verde:{' '}
            <strong>USD 1.718.450,12 (59,35%)</strong>; <strong>(2)</strong> Compra lícita de divisas en Mesa de Cambio Banesco (<em>&ldquo;Cambiario / Compra $&rdquo;</em>):{' '}
            <strong>USD 556.890,45 (19,20%)</strong>; <strong>(3)</strong> Devolución Crédito Becerra:{' '}
            <strong>USD 278.450,00 (9,27%)</strong>; <strong>(4)</strong> Traspasos a cuentas propias en otros bancos:{' '}
            <strong>USD 226.910,30 (7,83%)</strong>; <strong>(5)</strong> Fletes INSAI/SICA, Comisiones/IGTF y Nómina Rural LOTTT:{' '}
            <strong>USD 126.411,37 (4,35%)</strong>.
          </div>
        </div>

        {/* SECCIÓN 3: RECAUDOS ANEXOS EN FORMATO COMPACTO */}
        <div className="space-y-1.5">
          <div className="bg-[#1C1917] text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase">
            3. Soportes Documentales Consignados en Anexo (Firmados y Sellados)
          </div>
          <p className="text-xs text-justify">
            <strong>1)</strong> EEFF Intermedios y Balance de Comprobación al 31/08/2026 visados por Contador Público Colegiado ({contadorNombre}, {contadorCpc}), reflejando el Pasivo <code>2.1.04 Anticipos de Clientes</code> (Bs. 1.571.513.047,62) y los Ingresos EEFF (Bs. 92.641.520,01);{' '}
            <strong>2)</strong> Contratos Comerciales de Suministro de Café y 16 Comprobantes Oficiales de Anticipos (Serie <code>COMP-ANT-2026</code>: DISTRIBUIDORA DIS J-30643703-7, EMPRESA ETN J-50100487-0 y otros);{' '}
            <strong>3)</strong> Estados de cuenta propios en Mercantil (0105), Provincial (0108), Plaza (0138) y Bancamiga (0172) + 9 Comprobantes de Transferencias Internas (<code>COMP-TRP-2026</code>);{' '}
            <strong>4)</strong> Contrato Línea Rotativa Becerra y comprobantes de pago (97,33% amortizado);{' '}
            <strong>5)</strong> 8 Comprobantes de Compra de Divisas Banesco (<code>COMP-DIV-2026</code>), Guías INSAI/SICA y Declaraciones SENIAT (IVA Forma 30 e ISLR). Sin otro particular, quedamos a su entera disposición.
          </p>
        </div>

        {/* BLOQUES DE FIRMA Y SELLO HÚMEDO EN LA MISMA PÁGINA */}
        <div className="pt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border-2 border-[#1C1917] rounded-2xl p-4 flex flex-col justify-between min-h-[145px] bg-[#FAF8F5]">
            <div className="text-[10px] font-bold text-[#1C1917] uppercase">
              1. REPRESENTANTE LEGAL ({oniCompany.razonSocial})
            </div>
            <div className="border-t-2 border-[#1C1917] pt-2 mt-10 text-center space-y-0.5">
              <div className="text-xs font-bold text-[#1C1917]">
                {representanteNombre}
              </div>
              <div className="text-[11px] font-mono text-[#44403C]">
                C.I. {representanteCedula} · RIF {oniCompany.rif}
              </div>
              <div className="text-[10px] text-[#57534E]">
                Firma Húmeda, Huella y Sello Corporativo
              </div>
            </div>
          </div>

          <div className="border-2 border-[#1C1917] rounded-2xl p-4 flex flex-col justify-between min-h-[145px] bg-[#FAF8F5]">
            <div className="text-[10px] font-bold text-[#14532D] uppercase">
              2. VISADO CONTADOR PÚBLICO (VEN-NIF / NIIF 15)
            </div>
            <div className="border-t-2 border-[#1C1917] pt-2 mt-10 text-center space-y-0.5">
              <div className="text-xs font-bold text-[#1C1917]">{contadorNombre}</div>
              <div className="text-[11px] font-mono font-bold text-[#14532D]">
                {contadorCpc}
              </div>
              <div className="text-[10px] text-[#57534E]">
                Firma y Sello Húmedo Profesional CPC
              </div>
            </div>
          </div>

          <div className="border-2 border-dashed border-[#0369A1] rounded-2xl p-4 flex flex-col justify-between min-h-[145px] bg-[#E0F2FE]/25">
            <div className="text-[10px] font-bold text-[#0C4A6E] uppercase">
              3. ACUSE DE RECIBO — BANESCO (BBU)
            </div>
            <div className="border-t-2 border-[#0369A1] pt-2 mt-10 text-center space-y-0.5">
              <div className="text-xs font-bold text-[#0C4A6E]">
                BANESCO BANCO UNIVERSAL, C.A.
              </div>
              <div className="text-[10px] text-[#0369A1]">
                Sello Húmedo de Agencia, Fecha y Firma de Recepción
              </div>
            </div>
          </div>
        </div>

        {/* BARRA INFERIOR DE DESCARGA RÁPIDA EN WORD Y PDF */}
        <div className="no-print pt-4 border-t border-[#E7E5E4] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#57534E]">
            <strong>Opción 2 (Resumen Ejecutivo en 1 Sola Página)</strong> · Calibrada para imprimir o enviar en PDF/Word de 1 hoja exacta.
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadWordOnePage}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1D4ED8] text-white text-xs font-bold rounded-xl hover:bg-[#1E40AF] transition-colors cursor-pointer shadow-sm"
            >
              <FileDown className="w-4 h-4" />
              Descargar en WORD (1 Página .DOC)
            </button>
            <button
              type="button"
              onClick={handleDownloadPdfOnePage}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#DC2626] text-white text-xs font-bold rounded-xl hover:bg-[#B91C1C] transition-colors cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              Descargar en PDF (1 Página .PDF)
            </button>
          </div>
        </div>
      </article>
    </div>
  );
};
