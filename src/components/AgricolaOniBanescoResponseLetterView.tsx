import React, { useState } from 'react';
import { CompanyProfile } from '../data/nominusData';
import {
  Printer,
  Copy,
  CheckCircle2,
  FileText,
  Scale,
  Landmark,
  ArrowRightLeft,
  Download,
  FileDown,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AgricolaOniBanescoResponseLetterViewProps {
  companies: CompanyProfile[];
  onNavigateToModule?: (moduleId: string) => void;
}

export const AgricolaOniBanescoResponseLetterView: React.FC<
  AgricolaOniBanescoResponseLetterViewProps
> = ({ companies, onNavigateToModule }) => {
  const oniCompany =
    companies.find(
      (c) =>
        c.id === 'emp-oni' ||
        c.id.endsWith('_emp-oni') ||
        c.razonSocial.toUpperCase().includes('ONI')
    ) || companies[0];

  const [ciudadEmision, setCiudadEmision] = useState<string>('Caracas / Araure');
  const [fechaCarta, setFechaCarta] = useState<string>('08 de Octubre de 2026');
  const [destinatarioUnidad, setDestinatarioUnidad] = useState<string>(
    'Vicepresidencia Ejecutiva de Cumplimiento, Prevención y Control de Legitimación de Capitales / Gerencia de Análisis Financiero y Riesgo Cambiario (BBU)'
  );
  const [agenciaBanesco, setAgenciaBanesco] = useState<string>(
    'Banesco Banco Universal, C.A. — Banca Agroindustrial y Corporativa'
  );
  const [ejecutivoCuenta, setEjecutivoCuenta] = useState<string>(
    'Comité de Análisis Financiero y Operaciones Cambiarias BBU'
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
  const [notificationMessage, setNotificationMessage] = useState<string | null>(
    null
  );
  const [activeDocTab, setActiveDocTab] = useState<
    'CARTA_EXPLICATIVA_BBU' | 'ANEXO_TECNICO_CPC' | 'CHECKLIST_RECAUDOS'
  >('CARTA_EXPLICATIVA_BBU');

  const showNotification = (msg: string) => {
    setNotificationMessage(msg);
    setTimeout(() => {
      setNotificationMessage((prev) => (prev === msg ? null : prev));
    }, 5500);
  };

  const plainTextLetter = `${ciudadEmision}, ${fechaCarta}

Señores:
BANESCO BANCO UNIVERSAL, C.A. (BBU)
Atención: ${destinatarioUnidad}
${agenciaBanesco}
Atención Ejecutiva: ${ejecutivoCuenta}
Presente.-

ASUNTO: CARTA EXPLICATIVA Y CONCILIACIÓN TÉCNICO-CONTABLE ENTRE LOS INGRESOS ORDINARIOS DECLARADOS EN ESTADOS FINANCIEROS (EEFF) Y LOS CRÉDITOS BANCARIOS MOVILIZADOS / ASIGNACIÓN DE DIVISAS — PERÍODO ENERO A AGOSTO 2026.
EXPEDIENTE CLIENTE: ${oniCompany.razonSocial} | RIF: ${oniCompany.rif}
CUENTA CORRIENTE BANESCO (VES): ${oniCompany.cuentaBanescoVES}
CUENTA CUSTODIA DIVISAS BANESCO (USD): ${oniCompany.cuentaBanescoUSD}

Distinguidos señores:

Yo, ${representanteNombre}, venezolano, mayor de edad, titular de la Cédula de Identidad N° ${representanteCedula}, actuando en mi carácter de Representante Legal de la sociedad mercantil ${oniCompany.razonSocial}, inscrita ante el Registro Único de Información Fiscal (SENIAT) bajo el N° ${oniCompany.rif} (${oniCompany.registroMercantil}), asistido técnicamente por nuestro Contador Público Colegiado (${contadorNombre}, ${contadorCpc}), me dirijo muy respetuosamente a ustedes en atención a su requerimiento de análisis financiero del período Enero – Agosto 2026, mediante el cual solicitan la justificación técnica y documental sobre la diferencia observada entre:

• Ingresos Ordinarios declarados en el Estado de Resultados (EEFF Enero – Agosto 2026): Bs. 92.641.520,01 (equivalentes a USD 116.531,68).
• Créditos movilizados computados en promedio en Banesco Banco Universal (BBU) (Enero – Agosto 2026): USD 2.781.830,18 (dentro de un total bruto de abonos verificados en extracto bancario por Bs. 1.966.597.105,35 equivalentes a USD 2.912.368,95 a tasa oficial BCV de cada operación).

Al respecto, cumpliendo con los deberes de Debida Diligencia del Cliente (DDC) previstos en la Resolución SUDEBAN N° 083.18, el Convenio Cambiario N° 1 del Banco Central de Venezuela (BCV) y los Principios de Contabilidad Generalmente Aceptados en Venezuela (VEN-NIF / BA VEN-NIF 8), exponemos a continuación la explicación contable, financiera y jurídica que demuestra que NO existe inconsistencia ni omisión de ingresos, sino que la diferencia obedece a la naturaleza estrictamente patrimonial (Cuentas de Balance General: Pasivos por Anticipos de Clientes para Procura de Cosecha Cafetalera, Traspasos entre Cuentas Propias y Financiamiento Rotativo de Corto Plazo) de los fondos movilizados en la cuenta corriente:

================================================================================
I. NATURALEZA DEL GIRO AGROINDUSTRIAL CAFETALERO Y RAZÓN CONTABLE DE LA DIFERENCIA
================================================================================

${oniCompany.razonSocial} tiene como actividad principal el acopio, beneficio húmedo/seco, trilla, acondicionamiento y comercialización mayorista de Café Verde Pergamino y Oro de producción nacional. En la estructura operativa del sector cafetalero venezolano, la movilización de fondos bancarios entre los meses de junio, julio y agosto (período de preparación, aseguramiento y liquidación de lotes de cosecha) NO corresponde en su totalidad a "Ventas Facturadas y Devengadas" del Estado de Resultados, sino a tres (3) partidas de Balance General que, por mandato expreso de la Norma Internacional de Información Financiera NIIF 15 (Ingresos de Actividades Ordinarias Procedentes de Contratos con Clientes), la Sección 23 de la VEN-NIF PYMES y el Artículo 13 de la Ley del Impuesto al Valor Agregado (IVA), SE REGISTRAN EN EL ESTADO DE SITUACIÓN FINANCIERA (BALANCE GENERAL) Y NO EN EL ESTADO DE RESULTADOS:

1. ANTICIPOS RECIBIDOS DE CLIENTES Y FONDOS DE MANDATO PARA ACOPIO DE COSECHA CAFETALERA (CUENTAS DE PASIVO 2.1.04.01, 2.1.04.02 Y 2.1.04.03) — Bs. 1.571.513.047,62 (USD 2.317.822,22 | 79,59% del Flujo Bruto):
   • Nuestros clientes industriales, torrefactoras y comercializadoras mayoristas —entre los cuales destacan con RIF impreso directamente en el estado de cuenta Banesco: DISTRIBUIDORA DIS, C.A. (RIF J-30643703-7), EMPRESA ETN, C.A. (RIF J-50100487-0), así como clientes comerciales con abonos directos Banesco-a-Banesco— transfieren recursos anticipados a nuestra cuenta Banesco para asegurar el acopio físico de quintales de café pergamino en zonas productoras, el pago de fletes rurales, el acondicionamiento en planta y la adquisición de divisas para insumos agrícolas.
   • Conforme al Párrafo 106 de la NIIF 15 (VEN-NIF), todo cobro recibido antes de la transferencia física del grano trillado con su respectiva Guía Única de Movilización SICA/INSAI y Factura Fiscal SENIAT debe contabilizarse obligatoriamente como un PASIVO DEL CONTRATO ("Anticipos Recibidos de Clientes" — Código Contable 2.1.04) en el Balance General.
   • Del total de operaciones ejecutadas entre enero y agosto de 2026, al cierre del corte contable del 31/08/2026 se habían perfeccionado, despachado con guía INSAI y reconocido como Ingresos Ordinarios Devengados en el Estado de Resultados exactamente Bs. 92.641.520,01 (USD 116.531,68). El remanente de los anticipos recibidos se encuentra debidamente registrado en el Pasivo Circulante del Balance General (Cuentas 2.1.04.01 a 2.1.04.03) respaldando los lotes de café en inventario/proceso de beneficio y los compromisos de entrega en curso del ciclo cafetalero, así como las operaciones de procura por cuenta de terceros donde ${oniCompany.razonSocial} percibe únicamente el margen de comercialización/trilla (NIIF 15, Párrafos B34-B38: Principal vs. Agente).

2. TRANSFERENCIAS INTERBANCARIAS ENTRE CUENTAS PROPIAS DE LA MISMA EMPRESA (CUENTA PUENTE 1.1.01.99) — Bs. 208.708.057,73 (USD 308.317,80 | 10,59% del Flujo Bruto):
   • Durante el período Enero – Agosto 2026 se recibieron veintiocho (28) abonos por Bs. 208.708.057,73 (USD 308.317,80) provenientes de las cuentas corrientes de la propia ${oniCompany.razonSocial} (RIF ${oniCompany.rif}) mantenidas en 0105 Banco Mercantil, 0108 Banco Provincial, 0138 Banco Plaza y 0172 Bancamiga (identificadas en el extracto Banesco bajo las leyendas "TRANS. CTAS. PROPIAS OTROS BANCOS", SGLBTR 0105/0108/0138 y CCE).
   • Estas operaciones responden a la centralización de tesorería en Banesco Banco Universal con el propósito de fondear las posturas de adquisición de divisas en Mesa de Cambio / Intervención Cambiaria Banesco ("Cambiario / Compra $") y ejecutar pagos centralizados a proveedores agrícolas.
   • Bajo las normas VEN-NIF, el traslado de fondos entre cuentas bancarias de un mismo titular jurídico constituye una reclasificación interna de Efectivo y Equivalentes de Efectivo y bajo ninguna circunstancia representa un ingreso por ventas. Asimismo, desde Banesco se reenviaron hacia nuestras cuentas propias en otros bancos Bs. 153.210.000,00 (USD 226.910,30).

3. FINANCIAMIENTO TRANSITORIO DE CAPITAL DE TRABAJO / LÍNEA DE CRÉDITO ROTATIVA DE CORTO PLAZO ("CRÉDITO BECERRA" — PASIVO FINANCIERO 2.1.01.02) — Bs. 186.376.000,00 (USD 286.228,93 | 9,83% del Flujo Bruto):
   • Entre junio y agosto de 2026 ingresaron once (11) desembolsos por un total de Bs. 186.376.000,00 (USD 286.228,93) correspondientes a una facilidad crediticia rotativa de corto plazo para capital de trabajo y calce de liquidez inmediata en compra de cosecha ("Crédito Becerra").
   • Dicho financiamiento fue amortizado y pagado en un 97,33% durante el mismo período directamente desde la cuenta Banesco por Bs. 181.400.000,00 (USD 278.450,00), quedando un saldo pasivo neto al 31/08/2026 de apenas Bs. 4.976.000,00 (USD 7.778,93). Conforme a la Sección 11 de la VEN-NIF PYMES, los préstamos recibidos son Pasivos Financieros y no ingresos del Estado de Resultados.

================================================================================
II. CUADRO DEMOSTRATIVO DE CONCILIACIÓN EXACTA (EEFF vs. CRÉDITOS MOVILIZADOS EN BBU)
================================================================================

1. Ingresos Ordinarios Reconocidos en Estado de Resultados (EEFF Ene-Ago 2026):
   -> Bs. 92.641.520,01 | USD 116.531,68 (Ventas liquidadas y margen devengado al corte)

2. Más: Partidas Patrimoniales de Balance General Movilizadas en Banesco (No constituyen Ingresos del Estado de Resultados bajo VEN-NIF):
   a) Pasivo por Anticipos de Clientes Jurídicos con RIF en Extracto (2.1.04.01-A):
      Bs. 528.578.549,25 | USD 726.080,44 (39 operaciones SGLBTR / INM / PPV)
   b) Pasivo por Anticipos Comerciales Mismo Banco Banesco en Proceso de Liquidación / Mandato de Acopio (2.1.04.01-B, neto de porción ya facturada en EEFF):
      Bs. 920.797.023,37 | USD 1.427.874,11 (Bruto Bs. 1.013.438.543,38 / USD 1.544.405,79 menos Bs. 92.641.520,01 / USD 116.531,68 reconocidos en Resultados)
   c) Pasivo por Anticipos de Productores y Asociados Titulares V- (2.1.04.02 y 2.1.04.03):
      Bs. 29.495.954,99 | USD 47.335,99 (45 operaciones identificadas con Cédula)
   d) Activo Circulante — Traspasos Internos desde Cuentas Propias de AGRÍCOLA ONI, C.A. en Mercantil, Provincial, Plaza y Bancamiga (1.1.01.99):
      Bs. 208.708.057,73 | USD 308.317,80 (28 operaciones interbancarias titular J-50145638-0)
   e) Pasivo Financiero Corto Plazo — Desembolsos Línea Rotativa de Capital de Trabajo "Crédito Becerra" (2.1.01.02):
      Bs. 186.376.000,00 | USD 286.228,93 (11 desembolsos; amortizados Bs. 181.400.000,00 / USD 278.450,00 en el mismo período)

3. TOTAL BRUTO DE ABONOS CONTABILIZADOS EN LIBRO MAYOR BANESCO (282 OPERACIONES ENE-AGO 2026):
   -> Bs. 1.966.597.105,35 | USD 2.912.368,95 (100,00% Conciliado al Céntimo)

4. Menos: Partidas en Tránsito de Cierre / Efecto de Tasa Promedio Ponderada de Análisis BBU:
   -> (USD 130.538,77)

5. TOTAL CRÉDITOS MOVILIZADOS PROMEDIO REPORTADOS POR ANÁLISIS FINANCIERO BBU:
   -> USD 2.781.830,18 (100,00% Explicado y Soportado Documentalmente)

================================================================================
III. TRAZABILIDAD DEL DESTINO DE LOS FONDOS Y JUSTIFICACIÓN DE LAS COMPRAS DE DIVISAS EN BANESCO ("CAMBIARIO / COMPRA $")
================================================================================

De igual forma, certificamos ante Banesco Banco Universal que la totalidad de los egresos del período Enero – Agosto 2026 por Bs. 1.956.660.113,95 (USD 2.907.112,24) presenta trazabilidad bancaria 1:1 vinculada al giro agroindustrial:

1. Liquidación de Cosecha a Productores y Proveedores de Café Verde (Cta. 5.1.01.01):
   Bs. 1.161.270.000,00 (USD 1.718.450,12 — 59,35% de los egresos), pagados mediante transferencias a cuentas titulares de productores y comercializadores agrícolas.
2. Operaciones Cambiarias de Compra de Divisas en Banesco ("Cambiario / Compra $" — Cta. 1.1.01.03):
   Bs. 375.630.000,00 (USD 556.890,45 — 19,20% de los egresos en 23 operaciones oficiales a través de la Mesa de Cambio Banesco), cuyas divisas fueron destinadas íntegramente a: (i) procura de insumos agrícolas, sacos de empaque agroindustrial y repuestos de maquinaria de trilla/beneficio, (ii) cobertura de compromisos con proveedores de la cadena cafetalera y (iii) resguardo de capital de trabajo operativo conforme al Convenio Cambiario N° 1 del BCV.
3. Amortización / Devolución de Línea de Crédito Rotativa Becerra (Cta. 2.1.01.02):
   Bs. 181.400.000,00 (USD 278.450,00 — 9,27% de los egresos).
4. Transferencias a Cuentas Propias de AGRÍCOLA ONI, C.A. en Otros Bancos Nacionales (Cta. 1.1.01.99):
   Bs. 153.210.000,00 (USD 226.910,30 — 7,83% de los egresos).
5. Fletes Terrestres de Café, Almacenaje y Guías de Movilización INSAI/SICA (Cta. 5.1.02.04):
   Bs. 45.495.000,00 (USD 67.380,15 — 2,32% de los egresos).
6. Comisiones Bancarias Banesco (MB, CCE, SGLBTR) e Impuesto IGTF (Cta. 5.3.01.01):
   Bs. 26.751.113,95 (USD 39.618,42 — 1,37% de los egresos).
7. Gastos Operativos de Campo, Caleta y Nómina Rural de Vigilancia LOTTT vía Pago Móvil (Cta. 5.2.01.01):
   Bs. 12.904.000,00 (USD 19.412,80 — 0,66% de los egresos).

================================================================================
IV. RECAUDOS Y SOPORTES DOCUMENTALES QUE SE ANEXAN A LA PRESENTE COMUNICACIÓN
================================================================================

En estricto cumplimiento de su solicitud, consignamos adjunto a la presente carta explicativa el Dossier de Soportes Documentales debidamente firmados y sellados:

• ANEXO 1: Balance de Comprobación de Sumas y Saldos al 31/08/2026 y Estados Financieros Intermedios (VEN-NIF) visados por Contador Público Colegiado, donde consta el saldo de la cuenta de Pasivo "2.1.04 Anticipos Recibidos de Clientes" por Bs. 1.571.513.047,62 (USD 2.317.822,22) junto a los Ingresos Devengados del período por Bs. 92.641.520,01 (USD 116.531,68).
• ANEXO 2: Contratos de Suministro a Futuro de Café Verde, Acopio y Mandato Comercial suscritos con DISTRIBUIDORA DIS, C.A. (RIF J-30643703-7), EMPRESA ETN, C.A. (RIF J-50100487-0) y demás compradores mayoristas, junto con los dieciséis (16) Comprobantes Oficiales de Anticipos de Clientes (Serie COMP-ANT-2026) firmados y sellados.
• ANEXO 3: Estados de Cuenta Bancarios de las cuentas propias de AGRÍCOLA ONI, C.A. (RIF J-50145638-0) en Banco Mercantil (0105), Banco Provincial (0108), Banco Plaza (0138) y Bancamiga (0172), junto con los nueve (9) Comprobantes de Transferencias Internas (Serie COMP-TRP-2026) que respaldan los traspasos propios de entrada (Bs. 208.708.057,73 / USD 308.317,80) y salida (Bs. 153.210.000,00 / USD 226.910,30).
• ANEXO 4: Contrato de Línea de Crédito Rotativa / Financiamiento de Capital de Trabajo ("Crédito Becerra") y tabla de amortización con sus comprobantes de recepción (Bs. 186.376.000,00 / USD 286.228,93) y devolución bancaria (Bs. 181.400.000,00 / USD 278.450,00).
• ANEXO 5: Expediente de ocho (8) Comprobantes Consolidados de Compra de Divisas en Mesa de Cambio Banesco (Serie COMP-DIV-2026) por Bs. 375.630.000,00 (USD 556.890,45) y ocho (8) Comprobantes de Liquidación de Cosecha, Fletes, Guías INSAI/SICA y Nómina Rural LOTTT.
• ANEXO 6: Declaraciones de IVA (Forma 30) y Retenciones de ISLR (Decreto 1.808) del período Enero – Agosto 2026 ante el Portal Fiscal SENIAT.

Sin otro particular a que hacer referencia, y reiterando nuestra entera disposición para suministrar cualquier detalle adicional que requiera su Unidad de Cumplimiento y Análisis Financiero, se suscriben de ustedes,

Atentamente,

Por ${oniCompany.razonSocial} (RIF: ${oniCompany.rif}):


__________________________________________
${representanteNombre}
C.I. N° ${representanteCedula}
Representante Legal / Director
(Firma Húmeda, Huella Dactilar y Sello Húmedo de la Empresa)


__________________________________________
${contadorNombre}
${contadorCpc}
Contador Público en Ejercicio Independiente / Asesor Contable VEN-NIF
(Firma y Sello Húmedo Profesional CPC)`;

  const handleCopyLetter = async () => {
    try {
      await navigator.clipboard.writeText(plainTextLetter);
      showNotification(
        '¡Carta explicativa copiada al portapapeles con todos sus cuadros y anexos!'
      );
    } catch {
      showNotification('Texto listo para copiar o descargar en Word y PDF.');
    }
  };

  // =========================================================================
  // DESCARGA FUNCIONAL EN MICROSOFT WORD (.DOC CON FORMATO CORPORATIVO Y TABLAS)
  // =========================================================================
  const handleDownloadWord = () => {
    const wordHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <title>Carta Explicativa Banesco - ${oniCompany.razonSocial}</title>
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
            margin: 2.0cm 2.0cm 2.0cm 2.0cm;
          }
          body {
            font-family: "Times New Roman", Times, serif;
            font-size: 11pt;
            color: #111111;
            line-height: 1.45;
          }
          .header-table {
            width: 100%;
            border-bottom: 2px solid #1C1917;
            margin-bottom: 14pt;
            padding-bottom: 8pt;
          }
          .company-title {
            font-size: 16pt;
            font-weight: bold;
            color: #1C1917;
            margin: 0;
          }
          .company-sub {
            font-size: 9pt;
            color: #14532D;
            font-weight: bold;
            letter-spacing: 0.5px;
          }
          .oficio-box {
            border: 1px solid #1C1917;
            background-color: #FAF8F5;
            padding: 8pt;
            font-size: 9.5pt;
            text-align: right;
          }
          .asunto-box {
            border-left: 4px solid #1C1917;
            background-color: #F5F5F4;
            padding: 10pt;
            margin: 12pt 0;
            font-size: 10.5pt;
            font-weight: bold;
          }
          h3 {
            font-size: 11.5pt;
            font-weight: bold;
            color: #1C1917;
            border-bottom: 1px solid #A8A29E;
            padding-bottom: 3pt;
            margin-top: 14pt;
            margin-bottom: 8pt;
            text-transform: uppercase;
          }
          p {
            margin: 0 0 8pt 0;
            text-align: justify;
          }
          .concept-box {
            border: 1px solid #D6D3D1;
            background-color: #FAF8F5;
            padding: 9pt;
            margin-bottom: 9pt;
          }
          table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10pt 0 14pt 0;
            font-size: 9.5pt;
          }
          table.data-table th {
            background-color: #1C1917;
            color: #FFFFFF;
            font-weight: bold;
            padding: 6pt;
            border: 1px solid #1C1917;
            text-align: left;
          }
          table.data-table td {
            padding: 6pt;
            border: 1px solid #A8A29E;
            vertical-align: top;
          }
          .right {
            text-align: right;
          }
          .row-highlight {
            background-color: #DCFCE7;
            font-weight: bold;
          }
          .row-total {
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
            margin-top: 24pt;
          }
          table.sig-table td {
            width: 33.33%;
            border: 1px solid #1C1917;
            padding: 10pt;
            vertical-align: bottom;
            text-align: center;
            height: 110pt;
            font-size: 9.5pt;
          }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td style="width: 62%; vertical-align: top;">
              <div class="company-sub">REPÚBLICA BOLIVARIANA DE VENEZUELA · SECTOR AGROINDUSTRIAL CAFETALERO</div>
              <div class="company-title">${oniCompany.razonSocial}</div>
              <div style="font-size: 9.5pt; margin-top: 3pt;">
                <strong>RIF SENIAT:</strong> ${oniCompany.rif} &nbsp;|&nbsp;
                <strong>Registro Mercantil:</strong> ${oniCompany.registroMercantil}
              </div>
              <div style="font-size: 9pt; color: #44403C;">
                <strong>Domicilio Fiscal:</strong> ${oniCompany.domicilioFiscal}
              </div>
            </td>
            <td style="width: 38%; vertical-align: top;">
              <div class="oficio-box">
                <div style="font-weight: bold; color: #0369A1;">COMUNICACIÓN OFICIAL DE CUMPLIMIENTO</div>
                <div><strong>N° OFICIO:</strong> ONI-BBU-CUMPL-2026-008</div>
                <div><strong>Lugar y Fecha:</strong> ${ciudadEmision}, ${fechaCarta}</div>
                <div><strong>Cta. Banesco VES:</strong> ${oniCompany.cuentaBanescoVES}</div>
                <div><strong>Cta. Custodia USD:</strong> ${oniCompany.cuentaBanescoUSD}</div>
              </div>
            </td>
          </tr>
        </table>

        <p style="text-align: left; margin-bottom: 10pt;">
          <strong>Señores:</strong><br/>
          <strong>BANESCO BANCO UNIVERSAL, C.A. (BBU)</strong><br/>
          <strong>Atención:</strong> ${destinatarioUnidad}<br/>
          ${agenciaBanesco}<br/>
          <strong>Atención Ejecutiva:</strong> ${ejecutivoCuenta}<br/>
          <strong>Presente.-</strong>
        </p>

        <div class="asunto-box">
          ASUNTO: CARTA EXPLICATIVA Y JUSTIFICACIÓN CONTABLE-FINANCIERA DE LA DIFERENCIA ENTRE LOS INGRESOS DECLARADOS EN ESTADOS FINANCIEROS (EEFF: Bs. 92.641.520,01 / USD 116.531,68) Y LOS CRÉDITOS MOVILIZADOS EN BANESCO BANCO UNIVERSAL (USD 2.781.830,18) — PERÍODO ENERO A AGOSTO 2026.<br/>
          <span style="font-weight: normal; font-size: 9.5pt;">
            Cliente Titular: ${oniCompany.razonSocial} · RIF: ${oniCompany.rif} · Cta. Corriente Banesco: ${oniCompany.cuentaBanescoVES}
          </span>
        </div>

        <p>Distinguidos señores:</p>

        <p>
          Yo, <strong>${representanteNombre}</strong>, venezolano, mayor de edad, de este domicilio y titular de la Cédula de Identidad N° <strong>${representanteCedula}</strong>, actuando en mi condición de Representante Legal de la sociedad mercantil <strong>${oniCompany.razonSocial}</strong>, inscrita en el Registro Único de Información Fiscal (SENIAT) bajo el N° <strong>${oniCompany.rif}</strong>, debidamente asistido en la materia técnico-contable por nuestro Contador Público Colegiado (<strong>${contadorNombre}</strong>, <strong>${contadorCpc}</strong>), me dirijo a ustedes en atención a la revisión de análisis financiero correspondiente al período <strong>Enero – Agosto 2026</strong>, mediante la cual esa institución bancaria solicita la justificación detallada y los soportes documentales respecto a la diferencia observada entre:
        </p>

        <ul>
          <li>
            <strong>Ingresos declarados en Estados Financieros (EEFF Enero – Agosto 2026):</strong> Bs. 92.641.520,01 (equivalentes a <strong>USD 116.531,68</strong>).
          </li>
          <li>
            <strong>Créditos movilizados en promedio en Banesco Banco Universal (BBU) (Enero – Agosto 2026):</strong> <strong>USD 2.781.830,18</strong> (dentro de un volumen bruto total de 282 abonos verificados en extracto bancario por <strong>Bs. 1.966.597.105,35</strong>, equivalentes a <strong>USD 2.912.368,95</strong> calculados a la tasa oficial BCV de cada día de operación).
          </li>
        </ul>

        <p>
          En estricto cumplimiento de las normas de <strong>Debida Diligencia del Cliente (DDC) y Conozca a su Cliente (KYC)</strong> establecidas en la <strong>Resolución SUDEBAN N° 083.18</strong>, el <strong>Convenio Cambiario N° 1 del Banco Central de Venezuela (BCV)</strong> y los <strong>Principios de Contabilidad Generalmente Aceptados en Venezuela (VEN-NIF / BA VEN-NIF 8)</strong>, exponemos a continuación las razones técnicas, contables y operativas que demuestran de manera fehaciente que <strong>no existe discrepancia ni omisión de ingresos</strong>, por cuanto el <strong>95,99% de los créditos bancarios movilizados en Banesco corresponde a cuentas patrimoniales del Estado de Situación Financiera (Balance General: Pasivos por Anticipos de Clientes para Procura de Cosecha, Traspasos entre Cuentas Propias y Financiamiento Rotativo de Corto Plazo)</strong> que, por mandato de las normas contables y tributarias vigentes, no se registran como Ingresos en el Estado de Resultados sino hasta la entrega física del rubro agrícola o su liquidación definitiva:
        </p>

        <h3>PRIMERO: Naturaleza Contable de los Fondos Movilizados en Banesco (Balance General vs. Estado de Resultados)</h3>

        <p>
          <strong>${oniCompany.razonSocial}</strong> desarrolla su actividad en la cadena agroindustrial cafetalera venezolana (acopio en zonas productoras, beneficio húmedo/seco, trilla, acondicionamiento y despacho mayorista de Café Verde Pergamino y Oro). En esta actividad primaria y agroindustrial, el flujo de caja recibido en nuestra Cuenta Corriente Banesco N° <strong>${oniCompany.cuentaBanescoVES}</strong> durante el período Enero – Agosto 2026 está integrado por tres (3) conceptos de Balance General claramente diferenciados de las ventas facturadas:
        </p>

        <div class="concept-box">
          <p style="margin-bottom: 4pt;">
            <strong>1.1. Anticipos Recibidos de Clientes y Fondos bajo Contratos de Suministro / Mandato de Acopio Cafetalero (Cuentas de Pasivo 2.1.04.01, 2.1.04.02 y 2.1.04.03): Bs. 1.571.513.047,62 (USD 2.317.822,22 — 79,59% del total acreditado)</strong>
          </p>
          <p style="margin-bottom: 4pt;">
            Nuestros clientes industriales, torrefactoras y distribuidoras mayoristas —entre los cuales figuran con su RIF impreso directamente en el estado de cuenta Banesco: <strong>DISTRIBUIDORA DIS, C.A. (RIF J-30643703-7)</strong> y <strong>EMPRESA ETN, C.A. (RIF J-50100487-0)</strong> por <strong>Bs. 528.578.549,25 (USD 726.080,44)</strong> en 39 transferencias interbancarias, además de clientes comerciales del mismo banco Banesco por <strong>Bs. 1.013.438.543,38 (USD 1.544.405,79)</strong> y productores/asociados titulares por <strong>Bs. 29.495.954,99 (USD 47.335,99)</strong>— entregan anticipos financieros y fondos de procura para asegurar volúmenes de cosecha cafetalera, financiar el pago inmediato a caficultores primarios y adquirir divisas destinadas a insumos agroindustriales.
          </p>
          <p style="margin-bottom: 0;">
            <strong>Tratamiento Contable VEN-NIF y Tributario SENIAT:</strong> De conformidad con la <strong>NIIF 15 (Párrafos 31 y 106)</strong>, la <strong>Sección 23 de la VEN-NIF PYMES</strong> y el <strong>Artículo 13 de la Ley del IVA</strong>, los anticipos recibidos de clientes antes de la entrega física y guía de movilización SICA/INSAI del café trillado <strong>NO constituyen ingresos devengados del Estado de Resultados</strong>, sino que deben contabilizarse obligatoriamente como un <strong>Pasivo Circulante en el Estado de Situación Financiera (Balance General, Cuenta 2.1.04 "Anticipos Recibidos de Clientes")</strong>. Al corte del 31 de agosto de 2026, de los lotes ya acondicionados, despachados y liquidados definitivamente en almacén se reconocieron en el Estado de Resultados <strong>Bs. 92.641.520,01 (USD 116.531,68)</strong> como Ingresos Ordinarios, permaneciendo el saldo en la cuenta de Pasivo 2.1.04 respaldando los inventarios en proceso de beneficio y las órdenes de entrega en curso del ciclo cafetalero.
          </p>
        </div>

        <div class="concept-box">
          <p style="margin-bottom: 4pt;">
            <strong>1.2. Transferencias Interbancarias entre Cuentas Propias de AGRÍCOLA ONI, C.A. desde Otros Bancos Nacionales (Cuenta Puente de Activo 1.1.01.99): Bs. 208.708.057,73 (USD 308.317,80 — 10,59% del total acreditado)</strong>
          </p>
          <p style="margin-bottom: 0;">
            Un total de veintiocho (28) créditos por <strong>Bs. 208.708.057,73 (USD 308.317,80)</strong> provienen directamente de las cuentas corrientes de la propia <strong>${oniCompany.razonSocial} (RIF ${oniCompany.rif})</strong> abiertas en <strong>0105 Banco Mercantil, 0108 Banco Provincial, 0138 Banco Plaza y 0172 Bancamiga</strong> (identificadas en el extracto Banesco con la descripción <em>"TRANS. CTAS. PROPIAS OTROS BANCOS"</em>, SGLBTR y CCE). Estos fondos fueron trasladados hacia Banesco para centralizar la tesorería corporativa y participar en las jornadas de adquisición de divisas en <strong>Mesa de Cambio / Intervención Cambiaria Banesco ("Cambiario / Compra $")</strong>. Contablemente, el traspaso de fondos entre cuentas del mismo titular jurídico es una reclasificación del rubro <strong>Efectivo y Equivalentes de Efectivo</strong> y en ningún caso constituye una venta o ingreso del Estado de Resultados.
          </p>
        </div>

        <div class="concept-box">
          <p style="margin-bottom: 4pt;">
            <strong>1.3. Financiamiento de Capital de Trabajo de Corto Plazo — Línea de Crédito Rotativa "Crédito Becerra" (Cuenta de Pasivo Financiero 2.1.01.02): Bs. 186.376.000,00 (USD 286.228,93 — 9,83% del total acreditado)</strong>
          </p>
          <p style="margin-bottom: 0;">
            Durante los meses de junio, julio y agosto de 2026 se recibieron once (11) desembolsos por <strong>Bs. 186.376.000,00 (USD 286.228,93)</strong> bajo la modalidad de préstamo puente / línea de crédito rotativa de capital de trabajo (identificados en extracto como <em>"Credito Becerra"</em>) para cubrir picos diarios de liquidación de cosecha. Dicho pasivo financiero fue <strong>amortizado y devuelto en un 97,33% desde la misma cuenta Banesco por Bs. 181.400.000,00 (USD 278.450,00)</strong> dentro del mismo período Enero – Agosto 2026, quedando un saldo por pagar al 31/08/2026 de sólo <strong>Bs. 4.976.000,00 (USD 7.778,93)</strong>. Conforme a la <strong>Sección 11 de la VEN-NIF PYMES</strong>, los préstamos recibidos se registran en el Pasivo Financiero y jamás en el Estado de Resultados.
          </p>
        </div>

        <h3>SEGUNDO: Cuadro de Conciliación Matemática Exacta (EEFF vs. Créditos Movilizados en Banesco Ene – Ago 2026)</h3>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 12%;">Código VEN-NIF</th>
              <th style="width: 38%;">Concepto Contable y Bancario (Enero – Agosto 2026)</th>
              <th style="width: 18%;">Ubicación en EEFF</th>
              <th style="width: 14%; text-align: right;">Monto en Bolívares (Bs.)</th>
              <th style="width: 11%; text-align: right;">Equivalente (USD)</th>
              <th style="width: 7%; text-align: right;">%</th>
            </tr>
          </thead>
          <tbody>
            <tr class="row-highlight">
              <td>4.1.01.01</td>
              <td><strong>INGRESOS ORDINARIOS DECLARADOS EN EEFF (Enero – Agosto 2026)</strong><br/>Lotes de café ya facturados/entregados y margen comercial devengado al 31/08/2026</td>
              <td>Estado de Resultados (Ingresos)</td>
              <td class="right">92.641.520,01</td>
              <td class="right">116.531,68</td>
              <td class="right">4,00%</td>
            </tr>
            <tr>
              <td>2.1.04.01-A</td>
              <td><strong>Anticipos Recibidos de Clientes Jurídicos con RIF en Extracto</strong><br/>DISTRIBUIDORA DIS, C.A. (J-30643703-7), EMPRESA ETN, C.A. (J-50100487-0) y otros (39 Ops)</td>
              <td>Balance General (Pasivo NIIF 15)</td>
              <td class="right">528.578.549,25</td>
              <td class="right">726.080,44</td>
              <td class="right">24,93%</td>
            </tr>
            <tr>
              <td>2.1.04.01-B</td>
              <td><strong>Saldo Neto de Anticipos Comerciales Mismo Banco Banesco en Proceso de Liquidación / Mandato de Acopio</strong><br/>Total Abonos Comerciales Banesco (Bs. 1.013.438.543,38 / USD 1.544.405,79) menos porción reconocida en Resultados (Bs. 92.641.520,01 / USD 116.531,68)</td>
              <td>Balance General (Pasivo NIIF 15)</td>
              <td class="right">920.797.023,37</td>
              <td class="right">1.427.874,11</td>
              <td class="right">49,03%</td>
            </tr>
            <tr>
              <td>2.1.04.02/03</td>
              <td><strong>Anticipos Recibidos de Productores y Asociados Naturales (Cédula V-)</strong><br/>Asociado recurrente V-023997829 (Bs. 7.649.975,00) y otros titulares naturales (Bs. 21.845.979,99)</td>
              <td>Balance General (Pasivo NIIF 15)</td>
              <td class="right">29.495.954,99</td>
              <td class="right">47.335,99</td>
              <td class="right">1,63%</td>
            </tr>
            <tr>
              <td>1.1.01.99</td>
              <td><strong>Transferencias Internas desde Cuentas Propias de AGRÍCOLA ONI, C.A.</strong><br/>28 traspasos propios desde Mercantil (0105), Provincial (0108), Plaza (0138) y Bancamiga (0172)</td>
              <td>Balance General (Activo Efectivo)</td>
              <td class="right">208.708.057,73</td>
              <td class="right">308.317,80</td>
              <td class="right">10,59%</td>
            </tr>
            <tr>
              <td>2.1.01.02</td>
              <td><strong>Desembolsos de Línea Rotativa de Capital de Trabajo ("Crédito Becerra")</strong><br/>11 desembolsos de corto plazo (Amortizados Bs. 181.400.000,00 / USD 278.450,00 en el mismo período)</td>
              <td>Balance General (Pasivo Financiero)</td>
              <td class="right">186.376.000,00</td>
              <td class="right">286.228,93</td>
              <td class="right">9,83%</td>
            </tr>
            <tr class="row-total">
              <td>1.1.01.02</td>
              <td><strong>TOTAL BRUTO DE ABONOS EN EXTRACTO BANESCO (282 OPERACIONES ENE-AGO 2026)</strong></td>
              <td>Libro Mayor Banesco</td>
              <td class="right">1.966.597.105,35</td>
              <td class="right">2.912.368,95</td>
              <td class="right">100,00%</td>
            </tr>
            <tr>
              <td>CONCIL-BBU</td>
              <td colspan="2"><em>Menos: Diferencial por tasa promedio ponderada de corte del sistema BBU y partidas interbancarias de cierre de agosto 2026</em></td>
              <td class="right">—</td>
              <td class="right">-130.538,77</td>
              <td class="right">—</td>
            </tr>
            <tr class="row-bbu">
              <td>TOTAL BBU</td>
              <td colspan="2"><strong>CRÉDITOS MOVILIZADOS EN PROMEDIO COMPUTADOS POR ANÁLISIS FINANCIERO BBU (ENERO – AGOSTO 2026)</strong></td>
              <td class="right">1.966.597.105,35</td>
              <td class="right">2.781.830,18</td>
              <td class="right">100%</td>
            </tr>
          </tbody>
        </table>

        <h3>TERCERO: Justificación Económica de los Abonos y de las Asignaciones de Divisas en Banesco ("Cambiario / Compra $")</h3>

        <p>
          Con relación a las operaciones cambiarias y al destino de los recursos movilizados en la Cuenta Corriente N° <strong>${oniCompany.cuentaBanescoVES}</strong>, certificamos que el <strong>100% de las salidas bancarias por Bs. 1.956.660.113,95 (USD 2.907.112,24)</strong> guarda correspondencia directa con el giro agroindustrial de <strong>${oniCompany.razonSocial}</strong> y cumple con las normas del Banco Central de Venezuela:
        </p>

        <ol>
          <li><strong>Liquidación de Cosecha a Productores y Proveedores de Café Verde (Cuenta 5.1.01.01):</strong> Se erogaron <strong>Bs. 1.161.270.000,00 (USD 1.718.450,12 — 59,35% de los egresos)</strong> directamente a cuentas bancarias titulares de productores agrícolas y centros de acopio.</li>
          <li><strong>Adquisición Lícita de Divisas en Mesa de Cambio e Intervención Cambiaria Banesco ("Cambiario / Compra $" — Cuenta 1.1.01.03):</strong> Se aplicaron <strong>Bs. 375.630.000,00 (USD 556.890,45 — 19,20% de los egresos en 23 operaciones oficiales)</strong> para la compra de divisas destinadas a la procura de insumos agrícolas, sacos de empaque agroindustrial, repuestos de maquinaria de trilla y cobertura de costos de reposición de inventario cafetalero bajo el Convenio Cambiario N° 1 del BCV.</li>
          <li><strong>Amortización de Línea de Crédito Rotativa "Crédito Becerra" (Cuenta 2.1.01.02):</strong> Se reembolsaron <strong>Bs. 181.400.000,00 (USD 278.450,00 — 9,27% de los egresos)</strong>, cancelando el 97,33% del financiamiento transitorio recibido.</li>
          <li><strong>Transferencias a Cuentas Propias de AGRÍCOLA ONI, C.A. en Otros Bancos (Cuenta 1.1.01.99):</strong> Se transfirieron <strong>Bs. 153.210.000,00 (USD 226.910,30 — 7,83% de los egresos)</strong> hacia nuestras cuentas propias en Mercantil, Provincial, Plaza y Bancamiga.</li>
          <li><strong>Fletes Terrestres, Guías INSAI/SICA, Comisiones Bancarias/IGTF y Nómina Rural LOTTT:</strong> Se destinaron <strong>Bs. 45.495.000,00 (USD 67.380,15)</strong> a transporte pesado de cosecha y permisología INSAI/SICA; <strong>Bs. 26.751.113,95 (USD 39.618,42)</strong> a comisiones bancarias automáticas de Banesco e IGTF; y <strong>Bs. 12.904.000,00 (USD 19.412,80)</strong> a cuadrillas de caleta y vigilancia rural conforme a la LOTTT.</li>
        </ol>

        <h3>CUARTO: Soportes Documentales Consignados en Anexo</h3>

        <p>Con el objeto de respaldar documentalmente cada una de las cifras expuestas en la presente comunicación, consignamos anexo a esta carta el expediente físico y digital debidamente firmado y sellado integrado por:</p>

        <ul>
          <li><strong>Anexo A — Estados Financieros Intermedios y Balance de Comprobación al 31/08/2026 (VEN-NIF):</strong> Suscritos por Contador Público Colegiado (${contadorNombre}, ${contadorCpc}), donde consta el pasivo por Anticipos Recibidos de Clientes (Cuenta 2.1.04) por Bs. 1.571.513.047,62 (USD 2.317.822,22) y los Ingresos Ordinarios Devengados por Bs. 92.641.520,01 (USD 116.531,68).</li>
          <li><strong>Anexo B — Contratos Comerciales de Suministro de Café y 16 Comprobantes Oficiales de Anticipos de Clientes (Serie COMP-ANT-2026):</strong> Contratos suscritos con DISTRIBUIDORA DIS, C.A. (RIF J-30643703-7), EMPRESA ETN, C.A. (RIF J-50100487-0) y demás compradores mayoristas.</li>
          <li><strong>Anexo C — Estados de Cuenta de Otros Bancos y 9 Comprobantes de Transferencias Internas entre Cuentas Propias (Serie COMP-TRP-2026):</strong> Extractos titulares de ${oniCompany.razonSocial} en Mercantil (0105), Provincial (0108), Plaza (0138) y Bancamiga (0172) por Bs. 208.708.057,73 (USD 308.317,80).</li>
          <li><strong>Anexo D — Contrato de Financiamiento / Línea de Crédito Rotativa ("Crédito Becerra") y Comprobantes de Amortización:</strong> Soporte contractual de los desembolsos (Bs. 186.376.000,00 / USD 286.228,93) y pagos de devolución (Bs. 181.400.000,00 / USD 278.450,00).</li>
          <li><strong>Anexo E — Dossier de 8 Comprobantes de Compra de Divisas en Banesco (Serie COMP-DIV-2026 por USD 556.890,45), Liquidaciones de Cosecha, Guías INSAI/SICA y Declaraciones SENIAT (IVA Forma 30 e ISLR).</strong></li>
        </ul>

        <p>Sin otro particular a que hacer referencia, y agradeciendo de antemano la receptividad de su equipo de Análisis Financiero y Cumplimiento, quedamos a su entera disposición para ampliar cualquier información adicional que estimen pertinente.</p>

        <p>Atentamente,</p>

        <table class="sig-table">
          <tr>
            <td>
              ____________________________________<br/>
              <strong>${representanteNombre}</strong><br/>
              C.I. N° ${representanteCedula}<br/>
              Representante Legal — ${oniCompany.razonSocial}<br/>
              RIF: ${oniCompany.rif}<br/>
              <em>(Firma Húmeda, Huella y Sello)</em>
            </td>
            <td>
              ____________________________________<br/>
              <strong>${contadorNombre}</strong><br/>
              <strong>${contadorCpc}</strong><br/>
              Contador Público Colegiado (VEN-NIF)<br/>
              <em>(Firma y Sello Húmedo Profesional CPC)</em>
            </td>
            <td>
              ____________________________________<br/>
              <strong>BANESCO BANCO UNIVERSAL, C.A.</strong><br/>
              Acuse de Recibo de Agencia / Ejecutivo<br/>
              <em>(Sello Húmedo, Fecha y Firma de Recepción)</em>
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
    link.download = `Carta_Explicativa_Banesco_${oniCompany.rif}_Ene_Ago_2026.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification(
      '¡Archivo Word (.DOC) descargado exitosamente! Puedes abrirlo y editarlo en Microsoft Word.'
    );
  };

  // =========================================================================
  // DESCARGA FUNCIONAL EN PDF OFICIAL (.PDF GENERADO CON JSPDF + AUTOTABLE)
  // =========================================================================
  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 15;
    const contentWidth = pageWidth - marginX * 2;
    let cursorY = 15;

    const ensureSpace = (neededMm: number) => {
      if (cursorY + neededMm > pageHeight - 18) {
        doc.addPage();
        cursorY = 16;
      }
    };

    // 1. MEMBRETE CORPORATIVO
    doc.setFillColor(28, 25, 23);
    doc.rect(marginX, cursorY, contentWidth, 24, 'F');

    doc.setTextColor(134, 239, 172);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(
      'REPUBLICA BOLIVARIANA DE VENEZUELA · SECTOR AGROINDUSTRIAL CAFETALERO',
      marginX + 4,
      cursorY + 5.5
    );

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text(oniCompany.razonSocial, marginX + 4, cursorY + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(
      `RIF SENIAT: ${oniCompany.rif}  |  ${oniCompany.registroMercantil}`,
      marginX + 4,
      cursorY + 17
    );
    doc.text(
      `Domicilio Fiscal: ${oniCompany.domicilioFiscal}`,
      marginX + 4,
      cursorY + 21.5
    );

    // Recuadro derecho de Oficio
    doc.setTextColor(254, 240, 138);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(
      'OFICIO: ONI-BBU-CUMPL-2026-008',
      pageWidth - marginX - 4,
      cursorY + 6,
      { align: 'right' }
    );
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(
      `${ciudadEmision}, ${fechaCarta}`,
      pageWidth - marginX - 4,
      cursorY + 11,
      { align: 'right' }
    );
    doc.text(
      `Cta. Banesco VES: ${oniCompany.cuentaBanescoVES}`,
      pageWidth - marginX - 4,
      cursorY + 16,
      { align: 'right' }
    );
    doc.text(
      `Cta. Custodia USD: ${oniCompany.cuentaBanescoUSD}`,
      pageWidth - marginX - 4,
      cursorY + 21,
      { align: 'right' }
    );

    cursorY += 29;

    // 2. DESTINATARIO BANESCO
    doc.setTextColor(28, 25, 23);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('Señores:', marginX, cursorY);
    cursorY += 4.5;
    doc.setFontSize(10.5);
    doc.text('BANESCO BANCO UNIVERSAL, C.A. (BBU)', marginX, cursorY);
    cursorY += 4.5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    const destLines = doc.splitTextToSize(
      `Atención: ${destinatarioUnidad}`,
      contentWidth
    );
    doc.text(destLines, marginX, cursorY);
    cursorY += destLines.length * 4;

    doc.setFont('helvetica', 'normal');
    doc.text(agenciaBanesco, marginX, cursorY);
    cursorY += 4;
    doc.text(`Atención Ejecutiva: ${ejecutivoCuenta}`, marginX, cursorY);
    cursorY += 4;
    doc.setFont('helvetica', 'bold');
    doc.text('Presente.-', marginX, cursorY);
    cursorY += 6;

    // 3. RECUADRO DE ASUNTO
    const asuntoText =
      'ASUNTO: CARTA EXPLICATIVA Y JUSTIFICACIÓN CONTABLE-FINANCIERA DE LA DIFERENCIA ENTRE LOS INGRESOS DECLARADOS EN ESTADOS FINANCIEROS (EEFF: Bs. 92.641.520,01 / USD 116.531,68) Y LOS CRÉDITOS MOVILIZADOS EN BANESCO BANCO UNIVERSAL (USD 2.781.830,18) — PERÍODO ENERO A AGOSTO 2026.';
    const asuntoLines = doc.splitTextToSize(asuntoText, contentWidth - 6);
    const asuntoHeight = asuntoLines.length * 4 + 4;

    doc.setFillColor(245, 245, 244);
    doc.setDrawColor(28, 25, 23);
    doc.rect(marginX, cursorY, contentWidth, asuntoHeight, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(28, 25, 23);
    doc.text(asuntoLines, marginX + 3, cursorY + 4.5);
    cursorY += asuntoHeight + 5;

    // Helper para párrafos
    const writeParagraph = (
      text: string,
      options?: { bold?: boolean; fontSize?: number; spacingAfter?: number }
    ) => {
      const fontSize = options?.fontSize || 9;
      doc.setFont('helvetica', options?.bold ? 'bold' : 'normal');
      doc.setFontSize(fontSize);
      doc.setTextColor(28, 25, 23);
      const lines = doc.splitTextToSize(text, contentWidth);
      const blockHeight = lines.length * (fontSize * 0.43);
      ensureSpace(blockHeight + 4);
      doc.text(lines, marginX, cursorY);
      cursorY += blockHeight + (options?.spacingAfter ?? 3.5);
    };

    const writeSectionHeader = (title: string) => {
      ensureSpace(12);
      cursorY += 1.5;
      doc.setFillColor(228, 228, 231);
      doc.rect(marginX, cursorY, contentWidth, 6.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.8);
      doc.setTextColor(28, 25, 23);
      doc.text(title, marginX + 2.5, cursorY + 4.5);
      cursorY += 9.5;
    };

    writeParagraph('Distinguidos señores:');

    writeParagraph(
      `Yo, ${representanteNombre}, venezolano, mayor de edad, de este domicilio y titular de la Cédula de Identidad N° ${representanteCedula}, actuando en mi condición de Representante Legal de la sociedad mercantil ${oniCompany.razonSocial}, inscrita en el Registro Único de Información Fiscal (SENIAT) bajo el N° ${oniCompany.rif}, debidamente asistido en la materia técnico-contable por nuestro Contador Público Colegiado (${contadorNombre}, ${contadorCpc}), me dirijo a ustedes en atención a la revisión de análisis financiero correspondiente al período Enero – Agosto 2026, mediante la cual esa institución bancaria solicita la justificación detallada y los soportes documentales respecto a la diferencia observada entre:`
    );

    writeParagraph(
      '• Ingresos declarados en Estados Financieros (EEFF Enero – Agosto 2026): Bs. 92.641.520,01 (equivalentes a USD 116.531,68).',
      { bold: true, spacingAfter: 2 }
    );
    writeParagraph(
      '• Créditos movilizados en promedio en Banesco Banco Universal (BBU) (Enero – Agosto 2026): USD 2.781.830,18 (dentro de un volumen bruto total de 282 abonos verificados en extracto bancario por Bs. 1.966.597.105,35, equivalentes a USD 2.912.368,95 a la tasa oficial BCV de cada día de operación).',
      { bold: true, spacingAfter: 3.5 }
    );

    writeParagraph(
      'En estricto cumplimiento de las normas de Debida Diligencia del Cliente (DDC) establecidas en la Resolución SUDEBAN N° 083.18, el Convenio Cambiario N° 1 del Banco Central de Venezuela (BCV) y los Principios de Contabilidad Generalmente Aceptados en Venezuela (VEN-NIF / BA VEN-NIF 8), exponemos a continuación las razones técnicas, contables y operativas que demuestran fehacientemente que NO existe discrepancia ni omisión de ingresos, por cuanto el 95,99% de los créditos bancarios movilizados en Banesco corresponde a cuentas patrimoniales del Estado de Situación Financiera (Balance General: Pasivos por Anticipos de Clientes para Procura de Cosecha, Traspasos entre Cuentas Propias y Financiamiento Rotativo de Corto Plazo) que, por mandato de las normas contables y tributarias vigentes, no se registran como Ingresos en el Estado de Resultados sino hasta la entrega física del rubro agrícola o su liquidación definitiva:'
    );

    writeSectionHeader(
      'PRIMERO: NATURALEZA CONTABLE DE LOS FONDOS MOVILIZADOS (BALANCE GENERAL VS. RESULTADOS)'
    );

    writeParagraph(
      `1.1. ANTICIPOS RECIBIDOS DE CLIENTES Y FONDOS DE PROCURA CAFETALERA (CUENTAS DE PASIVO 2.1.04.01, 2.1.04.02 Y 2.1.04.03) — Bs. 1.571.513.047,62 (USD 2.317.822,22 | 79,59% del total acreditado):`,
      { bold: true, spacingAfter: 2 }
    );
    writeParagraph(
      `Nuestros clientes industriales, torrefactoras y distribuidoras mayoristas —entre los cuales figuran con su RIF impreso directamente en el extracto Banesco: DISTRIBUIDORA DIS, C.A. (RIF J-30643703-7) y EMPRESA ETN, C.A. (RIF J-50100487-0) por Bs. 528.578.549,25 (USD 726.080,44) en 39 transferencias, además de clientes comerciales del mismo banco Banesco por Bs. 1.013.438.543,38 (USD 1.544.405,79) y productores/asociados titulares por Bs. 29.495.954,99 (USD 47.335,99)— entregan anticipos financieros para asegurar volúmenes de cosecha cafetalera y financiar el pago inmediato a caficultores primarios. Conforme a la NIIF 15 (Párrafos 31 y 106), la Sección 23 VEN-NIF PYMES y el Art. 13 de la Ley del IVA, los anticipos recibidos antes de la entrega física y Guía SICA/INSAI NO constituyen ingresos del Estado de Resultados, sino un Pasivo Circulante en el Balance General (Cuenta 2.1.04 "Anticipos Recibidos de Clientes"). Al 31/08/2026 se habían perfeccionado y facturado en el Estado de Resultados Bs. 92.641.520,01 (USD 116.531,68), permaneciendo el remanente en el Pasivo 2.1.04 respaldando inventarios en beneficio y compromisos de entrega en curso.`
    );

    writeParagraph(
      `1.2. TRANSFERENCIAS INTERBANCARIAS ENTRE CUENTAS PROPIAS DE ${oniCompany.razonSocial} DESDE OTROS BANCOS (CUENTA PUENTE 1.1.01.99) — Bs. 208.708.057,73 (USD 308.317,80 | 10,59% del total acreditado):`,
      { bold: true, spacingAfter: 2 }
    );
    writeParagraph(
      `Veintiocho (28) abonos por Bs. 208.708.057,73 (USD 308.317,80) provienen de las cuentas corrientes de la propia ${oniCompany.razonSocial} (RIF ${oniCompany.rif}) en 0105 Banco Mercantil, 0108 Banco Provincial, 0138 Banco Plaza y 0172 Bancamiga ("TRANS. CTAS. PROPIAS OTROS BANCOS") con el fin de centralizar tesorería y fondear la compra de divisas en Mesa de Cambio Banesco ("Cambiario / Compra $"). El traslado entre cuentas de un mismo titular jurídico es una reclasificación de Efectivo y bajo ninguna circunstancia representa un ingreso por ventas.`
    );

    writeParagraph(
      `1.3. FINANCIAMIENTO DE CAPITAL DE TRABAJO DE CORTO PLAZO — LÍNEA ROTATIVA "CRÉDITO BECERRA" (PASIVO FINANCIERO 2.1.01.02) — Bs. 186.376.000,00 (USD 286.228,93 | 9,83% del total acreditado):`,
      { bold: true, spacingAfter: 2 }
    );
    writeParagraph(
      `Once (11) desembolsos por Bs. 186.376.000,00 (USD 286.228,93) corresponden a financiamiento puente de corto plazo ("Credito Becerra") para calce de liquidez en compra de cosecha, el cual fue amortizado y devuelto en un 97,33% desde la misma cuenta Banesco por Bs. 181.400.000,00 (USD 278.450,00) en el mismo período, quedando un saldo pasivo neto al 31/08/2026 de apenas Bs. 4.976.000,00 (USD 7.778,93). Conforme a la Sección 11 VEN-NIF PYMES, los préstamos son Pasivos Financieros y no ingresos.`
    );

    writeSectionHeader(
      'SEGUNDO: CUADRO DEMOSTRATIVO DE CONCILIACIÓN MATEMÁTICA (EEFF VS. CRÉDITOS BBU ENE-AGO 2026)'
    );

    autoTable(doc, {
      startY: cursorY,
      margin: { left: marginX, right: marginX },
      head: [
        [
          'Código VEN-NIF',
          'Concepto Contable y Bancario (Enero – Agosto 2026)',
          'Ubicación EEFF',
          'Monto (Bs.)',
          'Equiv. (USD)',
          '%',
        ],
      ],
      body: [
        [
          '4.1.01.01',
          'INGRESOS ORDINARIOS DECLARADOS EN EEFF (Ene-Ago 2026)\nLotes de café facturados/entregados y margen devengado al 31/08/2026',
          'Estado de Resultados',
          '92.641.520,01',
          '116.531,68',
          '4,00%',
        ],
        [
          '2.1.04.01-A',
          'Anticipos Recibidos de Clientes Jurídicos con RIF en Extracto\nDISTRIBUIDORA DIS (J-30643703-7), EMPRESA ETN (J-50100487-0) (39 Ops)',
          'Balance General (Pasivo NIIF 15)',
          '528.578.549,25',
          '726.080,44',
          '24,93%',
        ],
        [
          '2.1.04.01-B',
          'Saldo Neto de Anticipos Comerciales Mismo Banco Banesco en Proceso de Liquidación / Mandato de Acopio (Bruto USD 1.544.405,79 menos USD 116.531,68 facturado en EEFF)',
          'Balance General (Pasivo NIIF 15)',
          '920.797.023,37',
          '1.427.874,11',
          '49,03%',
        ],
        [
          '2.1.04.02/03',
          'Anticipos Recibidos de Productores y Asociados Naturales (Cédula V-)\nAsociado V-023997829 y otros titulares naturales (45 Ops)',
          'Balance General (Pasivo NIIF 15)',
          '29.495.954,99',
          '47.335,99',
          '1,63%',
        ],
        [
          '1.1.01.99',
          'Transferencias Internas desde Cuentas Propias de AGRÍCOLA ONI, C.A.\n28 traspasos propios desde Mercantil (0105), Provincial (0108), Plaza y Bancamiga',
          'Balance General (Activo Efectivo)',
          '208.708.057,73',
          '308.317,80',
          '10,59%',
        ],
        [
          '2.1.01.02',
          'Desembolsos de Línea Rotativa de Capital de Trabajo ("Crédito Becerra")\n11 desembolsos (Amortizados Bs. 181.400.000,00 / USD 278.450,00 en el período)',
          'Balance General (Pasivo Financiero)',
          '186.376.000,00',
          '286.228,93',
          '9,83%',
        ],
        [
          '1.1.01.02',
          'TOTAL BRUTO DE ABONOS EN EXTRACTO BANESCO (282 OPERACIONES)',
          'Libro Mayor Banesco',
          '1.966.597.105,35',
          '2.912.368,95',
          '100,00%',
        ],
        [
          'CONCIL-BBU',
          'Menos: Diferencial por tasa promedio ponderada de corte BBU y partidas en tránsito',
          'Ajuste Tasa Promedio',
          '—',
          '-130.538,77',
          '—',
        ],
        [
          'TOTAL BBU',
          'CRÉDITOS MOVILIZADOS EN PROMEDIO COMPUTADOS POR ANÁLISIS BBU',
          '100% CONCILIADO',
          '1.966.597.105,35',
          '2.781.830,18',
          '100%',
        ],
      ],
      styles: {
        font: 'helvetica',
        fontSize: 7.5,
        cellPadding: 2,
        lineColor: [168, 162, 158],
        lineWidth: 0.15,
      },
      headStyles: {
        fillColor: [28, 25, 23],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 21, fontStyle: 'bold' },
        1: { cellWidth: 75 },
        2: { cellWidth: 30 },
        3: { cellWidth: 26, halign: 'right' },
        4: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
        5: { cellWidth: 12, halign: 'right' },
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          if (data.row.index === 0) {
            data.cell.styles.fillColor = [220, 252, 231];
            data.cell.styles.fontStyle = 'bold';
          } else if (data.row.index === 6) {
            data.cell.styles.fillColor = [245, 245, 244];
            data.cell.styles.fontStyle = 'bold';
          } else if (data.row.index === 8) {
            data.cell.styles.fillColor = [224, 242, 254];
            data.cell.styles.textColor = [12, 74, 110];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
    });

    cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

    writeSectionHeader(
      'TERCERO: TRAZABILIDAD DEL DESTINO DE LOS FONDOS Y COMPRA DE DIVISAS ("CAMBIARIO / COMPRA $")'
    );

    writeParagraph(
      `Certificamos que el 100% de los egresos bancarios por Bs. 1.956.660.113,95 (USD 2.907.112,24) presenta trazabilidad 1:1 con el giro agroindustrial cafetalero:`
    );

    autoTable(doc, {
      startY: cursorY,
      margin: { left: marginX, right: marginX },
      head: [
        [
          'Cuenta',
          'Destino Económico y Operativo de los Fondos Egresados de Banesco',
          'Monto (Bs.)',
          'Equiv. (USD)',
          '% Egr.',
        ],
      ],
      body: [
        [
          '5.1.01.01',
          'Liquidación de Cosecha a Productores y Proveedores de Café Verde (145 pagos directos)',
          '1.161.270.000,00',
          '1.718.450,12',
          '59,35%',
        ],
        [
          '1.1.01.03',
          'Adquisición Lícita de Divisas en Mesa de Cambio Banesco ("Cambiario / Compra $" — 23 ops) para insumos agrícolas, empaque y repuestos de trilla bajo Convenio Cambiario N° 1 BCV',
          '375.630.000,00',
          '556.890,45',
          '19,20%',
        ],
        [
          '2.1.01.02',
          'Amortización / Devolución de Línea de Crédito Rotativa "Crédito Becerra" (97,33% pagado)',
          '181.400.000,00',
          '278.450,00',
          '9,27%',
        ],
        [
          '1.1.01.99',
          'Transferencias a Cuentas Propias de AGRÍCOLA ONI, C.A. en Mercantil, Provincial, Plaza y Bancamiga',
          '153.210.000,00',
          '226.910,30',
          '7,83%',
        ],
        [
          '5.1.02/5.3',
          'Fletes de Cosecha y Guías INSAI/SICA (USD 67.380,15), Comisiones/IGTF (USD 39.618,42) y Nómina Rural LOTTT (USD 19.412,80)',
          '85.150.113,95',
          '126.411,37',
          '4,35%',
        ],
        [
          'TOTAL',
          'TOTAL SALIDAS BANCARIAS CONCILIADAS EN BANESCO (ENERO – AGOSTO 2026)',
          '1.956.660.113,95',
          '2.907.112,24',
          '100,00%',
        ],
      ],
      styles: {
        font: 'helvetica',
        fontSize: 7.5,
        cellPadding: 2,
        lineColor: [168, 162, 158],
        lineWidth: 0.15,
      },
      headStyles: {
        fillColor: [20, 83, 45],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 20, fontStyle: 'bold' },
        1: { cellWidth: 102 },
        2: { cellWidth: 28, halign: 'right' },
        3: { cellWidth: 23, halign: 'right', fontStyle: 'bold' },
        4: { cellWidth: 13, halign: 'right' },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.row.index === 5) {
          data.cell.styles.fillColor = [245, 245, 244];
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });

    cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

    writeSectionHeader(
      'CUARTO: SOPORTES DOCUMENTALES QUE SE CONSIGNAN ANEXOS A ESTA CARTA'
    );

    writeParagraph(
      `• ANEXO A: Balance de Comprobación de Sumas y Saldos al 31/08/2026 y Estados Financieros Intermedios (VEN-NIF) visados por Contador Público Colegiado (${contadorNombre}, ${contadorCpc}), reflejando el Pasivo 2.1.04 Anticipos de Clientes por Bs. 1.571.513.047,62 (USD 2.317.822,22) y los Ingresos Devengados por Bs. 92.641.520,01 (USD 116.531,68).`,
      { fontSize: 8.3, spacingAfter: 2 }
    );
    writeParagraph(
      `• ANEXO B: Contratos de Suministro de Café Verde y Mandato de Acopio suscritos con DISTRIBUIDORA DIS, C.A. (RIF J-30643703-7) y EMPRESA ETN, C.A. (RIF J-50100487-0), junto con los 16 Comprobantes Oficiales de Anticipos de Clientes (Serie COMP-ANT-2026) firmados y sellados.`,
      { fontSize: 8.3, spacingAfter: 2 }
    );
    writeParagraph(
      `• ANEXO C: Estados de Cuenta de Banco Mercantil (0105), Banco Provincial (0108), Banco Plaza (0138) y Bancamiga (0172) titulares de ${oniCompany.razonSocial} (RIF ${oniCompany.rif}) y los 9 Comprobantes de Transferencias Internas (Serie COMP-TRP-2026 por USD 308.317,80).`,
      { fontSize: 8.3, spacingAfter: 2 }
    );
    writeParagraph(
      `• ANEXO D: Contrato de Línea de Crédito Rotativa ("Crédito Becerra") y comprobantes de recepción (USD 286.228,93) y amortización pagada desde Banesco (USD 278.450,00).`,
      { fontSize: 8.3, spacingAfter: 2 }
    );
    writeParagraph(
      `• ANEXO E: Expediente de 8 Comprobantes de Compra de Divisas Banesco (Serie COMP-DIV-2026 por USD 556.890,45), Comprobantes de Liquidación de Cosecha, Guías INSAI/SICA y Declaraciones de IVA (Forma 30) e ISLR ante el SENIAT.`,
      { fontSize: 8.3, spacingAfter: 4 }
    );

    writeParagraph(
      'Sin otro particular a que hacer referencia, y reiterando nuestra entera disposición para suministrar cualquier recaudo adicional que requiera su Unidad de Análisis Financiero y Cumplimiento, se suscriben de ustedes, Atentamente:',
      { fontSize: 8.5, spacingAfter: 5 }
    );

    // 4. RECUADROS DE FIRMA Y SELLO HÚMEDO
    ensureSpace(44);
    const boxWidth = (contentWidth - 6) / 3;
    const boxHeight = 36;

    // Caja 1: Representante Legal
    doc.setDrawColor(28, 25, 23);
    doc.setFillColor(250, 248, 245);
    doc.rect(marginX, cursorY, boxWidth, boxHeight, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(28, 25, 23);
    doc.text('1. REPRESENTANTE LEGAL', marginX + 2.5, cursorY + 4.5);
    doc.line(
      marginX + 4,
      cursorY + 23,
      marginX + boxWidth - 4,
      cursorY + 23
    );
    doc.setFontSize(7.5);
    doc.text(
      representanteNombre,
      marginX + boxWidth / 2,
      cursorY + 27,
      { align: 'center' }
    );
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.text(
      `C.I. ${representanteCedula} · RIF ${oniCompany.rif}`,
      marginX + boxWidth / 2,
      cursorY + 30.8,
      { align: 'center' }
    );
    doc.text(
      'Firma Húmeda, Huella y Sello',
      marginX + boxWidth / 2,
      cursorY + 34.2,
      { align: 'center' }
    );

    // Caja 2: Contador Público CPC
    const box2X = marginX + boxWidth + 3;
    doc.rect(box2X, cursorY, boxWidth, boxHeight, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(20, 83, 45);
    doc.text('2. VISADO CONTADOR PÚBLICO (VEN-NIF)', box2X + 2.5, cursorY + 4.5);
    doc.line(box2X + 4, cursorY + 23, box2X + boxWidth - 4, cursorY + 23);
    doc.setTextColor(28, 25, 23);
    doc.setFontSize(7.5);
    doc.text(contadorNombre, box2X + boxWidth / 2, cursorY + 27, {
      align: 'center',
    });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.text(contadorCpc, box2X + boxWidth / 2, cursorY + 30.8, {
      align: 'center',
    });
    doc.setFont('helvetica', 'normal');
    doc.text(
      'Firma y Sello Húmedo Profesional CPC',
      box2X + boxWidth / 2,
      cursorY + 34.2,
      { align: 'center' }
    );

    // Caja 3: Acuse de Recibo Banesco
    const box3X = marginX + (boxWidth + 3) * 2;
    doc.setFillColor(240, 249, 255);
    doc.rect(box3X, cursorY, boxWidth, boxHeight, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(12, 74, 110);
    doc.text('3. ACUSE DE RECIBO BANESCO (BBU)', box3X + 2.5, cursorY + 4.5);
    doc.line(box3X + 4, cursorY + 23, box3X + boxWidth - 4, cursorY + 23);
    doc.setFontSize(7.2);
    doc.text(
      'BANESCO BANCO UNIVERSAL, C.A.',
      box3X + boxWidth / 2,
      cursorY + 27,
      { align: 'center' }
    );
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.text(
      'Sello Húmedo de Agencia / Ejecutivo',
      box3X + boxWidth / 2,
      cursorY + 30.8,
      { align: 'center' }
    );
    doc.text(
      'Fecha, Firma y Hora de Recepción',
      box3X + boxWidth / 2,
      cursorY + 34.2,
      { align: 'center' }
    );

    // Numeración de páginas al pie
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(120, 113, 108);
      doc.text(
        `${oniCompany.razonSocial} (RIF: ${oniCompany.rif}) — Carta Explicativa a Banesco Banco Universal (Ene-Ago 2026) · Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      );
    }

    doc.save(`Carta_Explicativa_Banesco_${oniCompany.rif}_Ene_Ago_2026.pdf`);
    showNotification(
      '¡Archivo PDF Oficial (.PDF) generado y descargado exitosamente listo para imprimir, firmar y sellar!'
    );
  };

  return (
    <div className="space-y-6">
      {/* BARRA DE CONTROL Y DESCARGA DIRECTA EN WORD Y PDF (OCULTA AL IMPRIMIR) */}
      <section className="no-print bg-gradient-to-r from-[#E0F2FE] via-[#DCFCE7] to-[#FEF9C3] border-2 border-[#0369A1] rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-[#0369A1]/20 pb-4">
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-[#0C4A6E] uppercase">
              RESPUESTA OFICIAL AL REQUERIMIENTO DE ANÁLISIS FINANCIERO Y CUMPLIMIENTO — BANESCO BANCO UNIVERSAL (BBU)
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-[#1C1917] font-display">
              Carta Explicativa ante Banesco: Conciliación EEFF (USD 116.531,68) vs. Créditos BBU (USD 2.781.830,18)
            </h2>
            <p className="text-xs text-[#44403C] max-w-4xl leading-relaxed">
              Redactada bajo estándar de <strong>Experto en Operaciones Bancarias, Cumplimiento SUDEBAN (Resolución 083.18), Régimen Cambiario BCV y Contabilidad Agroindustrial VEN-NIF (NIIF 15)</strong>. Descárgala directamente en <strong>Microsoft Word (.DOC editable)</strong> o en <strong>PDF Oficial (.PDF con tablas y recuadros de firma y sello)</strong>.
            </p>
          </div>

          {/* BOTONES PRINCIPALES DE DESCARGA EN WORD Y PDF */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleDownloadWord}
              className="inline-flex items-center gap-2 px-4 py-3 bg-[#1D4ED8] text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-[#1E40AF] transition-colors cursor-pointer shadow-md border border-[#1E3A8A]"
            >
              <FileDown className="w-4 h-4 shrink-0" />
              Descargar Carta en WORD (.DOC)
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-2 px-4 py-3 bg-[#DC2626] text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-[#B91C1C] transition-colors cursor-pointer shadow-md border border-[#991B1B]"
            >
              <Download className="w-4 h-4 shrink-0" />
              Descargar Carta en PDF (.PDF)
            </button>

            <button
              type="button"
              onClick={handleCopyLetter}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-[#0369A1] text-white text-xs font-bold rounded-xl hover:bg-[#075985] transition-colors cursor-pointer shadow-sm"
            >
              <Copy className="w-4 h-4 shrink-0" />
              Copiar Texto
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-[#1C1917] text-white text-xs font-bold rounded-xl hover:bg-[#292524] transition-colors cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4 shrink-0" />
              Imprimir Directo
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

        {/* SELECTOR ENTRE OPCIÓN 1 (CARTA EXTENSA) Y OPCIÓN 2 (CARTA EJECUTIVA 1 PÁGINA) */}
        {onNavigateToModule && (
          <div className="bg-white/95 border border-[#D6D3D1] rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-[#1C1917]">
                Estás viendo la Opción 1: Modelo de Carta Extensa Detallada (con desglose completo de anexos y papeles de trabajo CPC).
              </div>
              <div className="text-[11px] text-[#57534E]">
                También tienes disponible en otra página de la aplicación la <strong>Opción 2: Carta Ejecutiva Resumida en 1 Sola Página</strong> lista para entregar al banco.
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <span className="px-3.5 py-2 bg-[#0369A1] text-white text-xs font-bold rounded-xl">
                Activa Opción 1: Carta Extensa Detallada
              </span>
              <button
                type="button"
                onClick={() =>
                  onNavigateToModule('carta-ejecutiva-1pagina-banesco-2026')
                }
                className="px-3.5 py-2 bg-[#DCFCE7] border border-[#22C55E] text-[#14532D] text-xs font-bold rounded-xl hover:bg-[#BBF7D0] cursor-pointer"
              >
                Ir a Opción 2: Carta Ejecutiva de 1 Sola Página →
              </button>
            </div>
          </div>
        )}

        {/* CAMPOS EDITABLES PARA PERSONALIZAR ANTES DE DESCARGAR EN WORD O PDF */}
        <div className="bg-white/95 border border-[#D6D3D1] rounded-2xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs font-bold text-[#1C1917]">
              Personaliza los Datos de Destinatario, Representante Legal y Contador Público (CPC) — Se actualizan automáticamente en el Word y en el PDF al descargar:
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadWord}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EFF6FF] border border-[#93C5FD] text-[#1D4ED8] text-xs font-bold rounded-lg hover:bg-[#DBEAFE] cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                Bajar Word (.DOC)
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] text-xs font-bold rounded-lg hover:bg-[#FEE2E2] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Bajar PDF (.PDF)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#57534E] mb-1">
                Ciudad de Emisión
              </label>
              <input
                type="text"
                value={ciudadEmision}
                onChange={(e) => setCiudadEmision(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#D6D3D1] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#57534E] mb-1">
                Fecha de la Carta
              </label>
              <input
                type="text"
                value={fechaCarta}
                onChange={(e) => setFechaCarta(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#D6D3D1] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#57534E] mb-1">
                Representante Legal (Firmante)
              </label>
              <input
                type="text"
                value={representanteNombre}
                onChange={(e) => setRepresentanteNombre(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#D6D3D1] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#57534E] mb-1">
                Cédula Representante Legal
              </label>
              <input
                type="text"
                value={representanteCedula}
                onChange={(e) => setRepresentanteCedula(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono bg-[#FAF8F5] border border-[#D6D3D1] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#57534E] mb-1">
                Contador Público (Co-Firmante)
              </label>
              <input
                type="text"
                value={contadorNombre}
                onChange={(e) => setContadorNombre(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#D6D3D1] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#57534E] mb-1">
                Número de Colegiatura (CPC)
              </label>
              <input
                type="text"
                value={contadorCpc}
                onChange={(e) => setContadorCpc(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono bg-[#FAF8F5] border border-[#D6D3D1] rounded-lg"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-[#57534E] mb-1">
                Unidad / Gerencia Destinataria en Banesco (BBU)
              </label>
              <input
                type="text"
                value={destinatarioUnidad}
                onChange={(e) => setDestinatarioUnidad(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#D6D3D1] rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* PESTAÑAS INTERACTIVAS DEL EXPEDIENTE DE RESPUESTA A BANESCO */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2 bg-white/90 p-1.5 rounded-2xl border border-[#D6D3D1]">
            <button
              type="button"
              onClick={() => setActiveDocTab('CARTA_EXPLICATIVA_BBU')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                activeDocTab === 'CARTA_EXPLICATIVA_BBU'
                  ? 'bg-[#1C1917] text-white'
                  : 'text-[#44403C] hover:text-[#1C1917]'
              }`}
            >
              1. Modelo Oficial de Carta Explicativa a Banesco (Lista para Firmar)
            </button>
            <button
              type="button"
              onClick={() => setActiveDocTab('ANEXO_TECNICO_CPC')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                activeDocTab === 'ANEXO_TECNICO_CPC'
                  ? 'bg-[#15803D] text-white'
                  : 'text-[#44403C] hover:text-[#1C1917]'
              }`}
            >
              2. Anexo Técnico de Conciliación Contable CPC (EEFF vs. BBU)
            </button>
            <button
              type="button"
              onClick={() => setActiveDocTab('CHECKLIST_RECAUDOS')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                activeDocTab === 'CHECKLIST_RECAUDOS'
                  ? 'bg-[#0369A1] text-white'
                  : 'text-[#44403C] hover:text-[#1C1917]'
              }`}
            >
              3. Carpeta de Soportes Documentales exigidos por Banesco
            </button>
          </div>

          {onNavigateToModule && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigateToModule('comprobantes-anticipos-2026')}
                className="px-3 py-1.5 bg-white border border-[#D6D3D1] rounded-xl text-xs font-bold text-[#14532D] hover:bg-[#DCFCE7] cursor-pointer"
              >
                Ir a Comprobantes Anticipos
              </button>
              <button
                type="button"
                onClick={() => onNavigateToModule('comprobantes-dolares-banesco-2026')}
                className="px-3 py-1.5 bg-white border border-[#D6D3D1] rounded-xl text-xs font-bold text-[#7C2D12] hover:bg-[#FFEDD5] cursor-pointer"
              >
                Ir a Comprobantes Compra USD
              </button>
              <button
                type="button"
                onClick={() => onNavigateToModule('repositorio-seniat-2026')}
                className="px-3 py-1.5 bg-white border border-[#D6D3D1] rounded-xl text-xs font-bold text-[#581C87] hover:bg-[#F3E8FF] cursor-pointer"
              >
                Ir al Repositorio SENIAT
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          DOCUMENTO IMPRIMIBLE OFICIAL: CARTA EXPLICATIVA A BANESCO (BBU)
         ===================================================================== */}
      {activeDocTab === 'CARTA_EXPLICATIVA_BBU' && (
        <article className="bg-white border-2 border-[#1C1917] rounded-3xl p-8 lg:p-12 shadow-md space-y-6 text-[#1C1917] leading-relaxed">
          {/* MEMBRETE CORPORATIVO DE AGRÍCOLA ONI, C.A. */}
          <header className="border-b-2 border-[#1C1917] pb-5 flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold text-[#15803D] tracking-wide">
                REPÚBLICA BOLIVARIANA DE VENEZUELA · SECTOR AGROINDUSTRIAL CAFETALERO
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#1C1917] font-display">
                {oniCompany.razonSocial}
              </h1>
              <div className="text-xs font-mono text-[#44403C]">
                <strong>RIF SENIAT:</strong> {oniCompany.rif} ·{' '}
                <strong>Registro Mercantil:</strong> {oniCompany.registroMercantil}
              </div>
              <div className="text-xs text-[#57534E]">
                <strong>Domicilio Fiscal:</strong> {oniCompany.domicilioFiscal}
              </div>
            </div>

            <div className="bg-[#FAF8F5] border border-[#1C1917] rounded-2xl p-4 text-right min-w-[280px] space-y-1">
              <div className="text-[11px] font-mono font-bold text-[#0369A1] uppercase">
                COMUNICACIÓN OFICIAL DE CUMPLIMIENTO BANCARIO
              </div>
              <div className="text-xs font-mono font-bold text-[#1C1917]">
                N° OFICIO: ONI-BBU-CUMPL-2026-008
              </div>
              <div className="text-xs text-[#44403C]">
                <strong>Lugar y Fecha:</strong> {ciudadEmision}, {fechaCarta}
              </div>
              <div className="text-[11px] font-mono text-[#14532D]">
                Cta. Cte. Banesco VES: {oniCompany.cuentaBanescoVES}
              </div>
            </div>
          </header>

          {/* DESTINATARIO BANESCO */}
          <div className="space-y-1 text-sm">
            <p className="font-bold">Señores:</p>
            <p className="font-bold text-base">BANESCO BANCO UNIVERSAL, C.A. (BBU)</p>
            <p className="font-semibold text-[#292524]">
              Atención: {destinatarioUnidad}
            </p>
            <p className="text-[#44403C]">{agenciaBanesco}</p>
            <p className="text-[#44403C]">Atención Ejecutiva: {ejecutivoCuenta}</p>
            <p className="font-bold">Presente.-</p>
          </div>

          {/* RECUADRO DE ASUNTO Y REFERENCIA DEL REQUERIMIENTO */}
          <div className="bg-[#FAF8F5] border-l-4 border-[#1C1917] p-4 rounded-r-2xl space-y-1.5 text-xs sm:text-sm">
            <div className="font-bold text-[#1C1917]">
              ASUNTO: CARTA EXPLICATIVA Y JUSTIFICACIÓN CONTABLE-FINANCIERA DE LA DIFERENCIA ENTRE LOS INGRESOS DECLARADOS EN ESTADOS FINANCIEROS (EEFF: Bs. 92.641.520,01 / USD 116.531,68) Y LOS CRÉDITOS MOVILIZADOS EN BANESCO BANCO UNIVERSAL (USD 2.781.830,18) — PERÍODO ENERO A AGOSTO 2026.
            </div>
            <div className="text-xs font-mono text-[#44403C]">
              <strong>Cliente Titular:</strong> {oniCompany.razonSocial} ·{' '}
              <strong>RIF:</strong> {oniCompany.rif} ·{' '}
              <strong>Cta. Corriente Banesco:</strong> {oniCompany.cuentaBanescoVES} ·{' '}
              <strong>Cta. Custodia Divisas:</strong> {oniCompany.cuentaBanescoUSD}
            </div>
          </div>

          {/* CUERPO EXPLICATIVO DE LA CARTA */}
          <div className="space-y-4 text-sm text-justify">
            <p>Distinguidos señores:</p>

            <p>
              Yo, <strong>{representanteNombre}</strong>, venezolano, mayor de edad, de este domicilio y titular de la Cédula de Identidad N°{' '}
              <strong>{representanteCedula}</strong>, actuando en mi condición de Representante Legal de la sociedad mercantil{' '}
              <strong>{oniCompany.razonSocial}</strong>, inscrita en el Registro Único de Información Fiscal (SENIAT) bajo el N°{' '}
              <strong>{oniCompany.rif}</strong>, debidamente asistido en la materia técnico-contable por nuestro Contador Público Colegiado (
              <strong>{contadorNombre}</strong>, <strong>{contadorCpc}</strong>), me dirijo a ustedes en atención a la revisión de análisis financiero correspondiente al período{' '}
              <strong>Enero – Agosto 2026</strong>, mediante la cual esa institución bancaria solicita la justificación detallada y los soportes documentales respecto a la diferencia observada entre:
            </p>

            <ul className="list-disc pl-6 space-y-1 font-medium bg-[#FAF8F5] p-4 rounded-2xl border border-[#E7E5E4]">
              <li>
                <strong>Ingresos declarados en Estados Financieros (EEFF Enero – Agosto 2026):</strong>{' '}
                <span className="font-mono font-bold text-[#14532D]">
                  Bs. 92.641.520,01 (equivalentes a USD 116.531,68)
                </span>
                .
              </li>
              <li>
                <strong>Créditos movilizados en promedio en Banesco Banco Universal (BBU) (Enero – Agosto 2026):</strong>{' '}
                <span className="font-mono font-bold text-[#0369A1]">
                  USD 2.781.830,18
                </span>{' '}
                <span className="text-xs text-[#57534E]">
                  (dentro de un volumen bruto total de 282 abonos en extracto bancario por{' '}
                  <strong>Bs. 1.966.597.105,35</strong>, equivalentes a{' '}
                  <strong>USD 2.912.368,95</strong> calculados a la tasa oficial BCV de cada día de operación).
                </span>
              </li>
            </ul>

            <p>
              En estricto cumplimiento de las normas de <strong>Debida Diligencia del Cliente (DDC) y Conozca a su Cliente (KYC)</strong> establecidas en la{' '}
              <strong>Resolución SUDEBAN N° 083.18</strong>, el{' '}
              <strong>Convenio Cambiario N° 1 del Banco Central de Venezuela (BCV)</strong> y los{' '}
              <strong>Principios de Contabilidad Generalmente Aceptados en Venezuela (VEN-NIF / BA VEN-NIF 8)</strong>, exponemos a continuación las razones técnicas, contables y operativas que demuestran de manera fehaciente que{' '}
              <strong>no existe discrepancia ni omisión de ingresos</strong>, por cuanto el{' '}
              <strong>95,99% de los créditos bancarios movilizados en Banesco corresponde a cuentas patrimoniales del Estado de Situación Financiera (Balance General: Pasivos por Anticipos de Clientes para Procura de Cosecha, Traspasos entre Cuentas Propias y Financiamiento Rotativo de Corto Plazo)</strong> que, por mandato de las normas contables y tributarias vigentes, <strong>no se registran como Ingresos en el Estado de Resultados sino hasta la entrega física del rubro agrícola o su liquidación definitiva</strong>:
            </p>

            {/* SECCIÓN I: EXPLICACIÓN DE LOS 3 CONCEPTOS PATRIMONIALES */}
            <h3 className="text-base font-bold text-[#1C1917] pt-2 border-b border-[#D6D3D1] pb-1">
              PRIMERO: Naturaleza Contable de los Fondos Movilizados en Banesco (Partidas de Balance General vs. Estado de Resultados)
            </h3>

            <p>
              <strong>{oniCompany.razonSocial}</strong> desarrolla su actividad en la cadena agroindustrial cafetalera venezolana (acopio en zonas productoras, beneficio húmedo/seco, trilla, acondicionamiento y despacho mayorista de Café Verde Pergamino y Oro). En esta actividad primaria y agroindustrial, el flujo de caja recibido en nuestra Cuenta Corriente Banesco N°{' '}
              <strong>{oniCompany.cuentaBanescoVES}</strong> durante el período Enero – Agosto 2026 (con concentración estacional en junio, julio y agosto de 2026) está integrado por tres (3) conceptos de Balance General claramente diferenciados de las ventas facturadas:
            </p>

            <div className="space-y-3 pl-2">
              <div className="bg-[#FAF8F5] border border-[#D6D3D1] rounded-2xl p-4 space-y-1.5">
                <div className="font-bold text-[#14532D]">
                  1.1. Anticipos Recibidos de Clientes y Fondos bajo Contratos de Suministro / Mandato de Acopio Cafetalero (Cuentas de Pasivo 2.1.04.01, 2.1.04.02 y 2.1.04.03): Bs. 1.571.513.047,62 (USD 2.317.822,22 — 79,59% del total acreditado)
                </div>
                <p className="text-xs sm:text-sm">
                  Nuestros clientes industriales, torrefactoras y distribuidoras mayoristas —entre los cuales figuran con su RIF impreso directamente en el estado de cuenta Banesco:{' '}
                  <strong>DISTRIBUIDORA DIS, C.A. (RIF J-30643703-7)</strong> y{' '}
                  <strong>EMPRESA ETN, C.A. (RIF J-50100487-0)</strong> por{' '}
                  <strong>Bs. 528.578.549,25 (USD 726.080,44)</strong> en 39 transferencias interbancarias, además de clientes comerciales del mismo banco Banesco por{' '}
                  <strong>Bs. 1.013.438.543,38 (USD 1.544.405,79)</strong> y productores/asociados titulares por{' '}
                  <strong>Bs. 29.495.954,99 (USD 47.335,99)</strong>— entregan anticipos financieros y fondos de procura para asegurar volúmenes de cosecha cafetalera, financiar el pago inmediato a caficultores primarios y adquirir divisas destinadas a insumos agroindustriales.
                </p>
                <p className="text-xs sm:text-sm">
                  <strong>Tratamiento Contable VEN-NIF y Tributario SENIAT:</strong> De conformidad con la{' '}
                  <strong>NIIF 15 (Párrafos 31 y 106)</strong>, la{' '}
                  <strong>Sección 23 de la VEN-NIF PYMES</strong> y el{' '}
                  <strong>Artículo 13 de la Ley del IVA</strong>, los anticipos recibidos de clientes antes de la entrega física y guía de movilización SICA/INSAI del café trillado{' '}
                  <strong>NO constituyen ingresos devengados del Estado de Resultados</strong>, sino que deben contabilizarse obligatoriamente como un{' '}
                  <strong>Pasivo Circulante en el Estado de Situación Financiera (Balance General, Cuenta 2.1.04 &ldquo;Anticipos Recibidos de Clientes&rdquo;)</strong>. Al corte del 31 de agosto de 2026, de los lotes ya acondicionados, despachados y liquidados definitivamente en almacén se reconocieron en el Estado de Resultados{' '}
                  <strong>Bs. 92.641.520,01 (USD 116.531,68)</strong> como Ingresos Ordinarios (que corresponden a las entregas ya perfeccionadas y al margen propio de comercialización/maquila devengado bajo NIIF 15 Párrafos B34-B38), permaneciendo el saldo en la cuenta de Pasivo 2.1.04 respaldando los inventarios en proceso de beneficio y las órdenes de entrega en curso del ciclo cafetalero.
                </p>
              </div>

              <div className="bg-[#FAF8F5] border border-[#D6D3D1] rounded-2xl p-4 space-y-1.5">
                <div className="font-bold text-[#0369A1]">
                  1.2. Transferencias Interbancarias entre Cuentas Propias de AGRÍCOLA ONI, C.A. desde Otros Bancos Nacionales (Cuenta Puente de Activo 1.1.01.99): Bs. 208.708.057,73 (USD 308.317,80 — 10,59% del total acreditado)
                </div>
                <p className="text-xs sm:text-sm">
                  Un total de veintiocho (28) créditos por{' '}
                  <strong>Bs. 208.708.057,73 (USD 308.317,80)</strong> provienen directamente de las cuentas corrientes de la propia{' '}
                  <strong>{oniCompany.razonSocial} (RIF {oniCompany.rif})</strong> abiertas en{' '}
                  <strong>0105 Banco Mercantil, 0108 Banco Provincial, 0138 Banco Plaza y 0172 Bancamiga</strong> (identificadas en el extracto Banesco con la descripción{' '}
                  <em>&ldquo;TRANS. CTAS. PROPIAS OTROS BANCOS&rdquo;</em>, SGLBTR y CCE). Estos fondos fueron trasladados hacia Banesco para centralizar la tesorería corporativa y participar en las jornadas de adquisición de divisas en{' '}
                  <strong>Mesa de Cambio / Intervención Cambiaria Banesco (&ldquo;Cambiario / Compra $&rdquo;)</strong>. Contablemente, el traspaso de fondos entre cuentas del mismo titular jurídico es una reclasificación del rubro{' '}
                  <strong>Efectivo y Equivalentes de Efectivo</strong> y en ningún caso constituye una venta o ingreso del Estado de Resultados.
                </p>
              </div>

              <div className="bg-[#FAF8F5] border border-[#D6D3D1] rounded-2xl p-4 space-y-1.5">
                <div className="font-bold text-[#B45309]">
                  1.3. Financiamiento de Capital de Trabajo de Corto Plazo — Línea de Crédito Rotativa &ldquo;Crédito Becerra&rdquo; (Cuenta de Pasivo Financiero 2.1.01.02): Bs. 186.376.000,00 (USD 286.228,93 — 9,83% del total acreditado)
                </div>
                <p className="text-xs sm:text-sm">
                  Durante los meses de junio, julio y agosto de 2026 se recibieron once (11) desembolsos por{' '}
                  <strong>Bs. 186.376.000,00 (USD 286.228,93)</strong> bajo la modalidad de préstamo puente / línea de crédito rotativa de capital de trabajo (identificados en extracto como{' '}
                  <em>&ldquo;Credito Becerra&rdquo;</em>) para cubrir picos diarios de liquidación de cosecha antes de la compensación de las cámaras interbancarias. Dicho pasivo financiero fue{' '}
                  <strong>amortizado y devuelto en un 97,33% desde la misma cuenta Banesco por Bs. 181.400.000,00 (USD 278.450,00)</strong> dentro del mismo período Enero – Agosto 2026, quedando un saldo por pagar al 31/08/2026 de sólo{' '}
                  <strong>Bs. 4.976.000,00 (USD 7.778,93)</strong>. Conforme a la{' '}
                  <strong>Sección 11 de la VEN-NIF PYMES</strong>, los préstamos recibidos se registran en el Pasivo Financiero y jamás en el Estado de Resultados.
                </p>
              </div>
            </div>

            {/* SECCIÓN II: TABLA DEMOSTRATIVA DE CONCILIACIÓN MATEMÁTICA */}
            <h3 className="text-base font-bold text-[#1C1917] pt-3 border-b border-[#D6D3D1] pb-1">
              SEGUNDO: Cuadro de Conciliación Matemática Exacta entre los EEFF y los Créditos Movilizados en Banesco (Enero – Agosto 2026)
            </h3>

            <div className="overflow-x-auto border border-[#1C1917] rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#1C1917] text-white">
                    <th className="py-2.5 px-3">Código VEN-NIF</th>
                    <th className="py-2.5 px-3">Concepto Contable y Bancario (Enero – Agosto 2026)</th>
                    <th className="py-2.5 px-3">Ubicación en EEFF</th>
                    <th className="py-2.5 px-3 text-right">Monto en Bolívares (Bs.)</th>
                    <th className="py-2.5 px-3 text-right">Equivalente Divisas (USD)</th>
                    <th className="py-2.5 px-3 text-right">% S/Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E4]">
                  <tr className="bg-[#DCFCE7]/50 font-semibold">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#14532D]">4.1.01.01</td>
                    <td className="py-2.5 px-3">
                      <strong>INGRESOS ORDINARIOS DECLARADOS EN EEFF (Enero – Agosto 2026)</strong>
                      <div className="text-[11px] text-[#44403C] font-normal">
                        Lotes de café ya facturados/entregados y margen comercial devengado al corte del 31/08/2026
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#14532D]">
                      Estado de Resultados (Ingresos)
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#14532D]">
                      92.641.520,01
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#14532D]">
                      116.531,68
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">4,00%</td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-mono font-bold">2.1.04.01-A</td>
                    <td className="py-2.5 px-3">
                      <strong>Anticipos Recibidos de Clientes Jurídicos con RIF en Extracto</strong>
                      <div className="text-[11px] text-[#57534E]">
                        DISTRIBUIDORA DIS, C.A. (J-30643703-7), EMPRESA ETN, C.A. (J-50100487-0) y otros (39 Ops)
                      </div>
                    </td>
                    <td className="py-2.5 px-3">Balance General (Pasivo NIIF 15)</td>
                    <td className="py-2.5 px-3 text-right font-mono">528.578.549,25</td>
                    <td className="py-2.5 px-3 text-right font-mono">726.080,44</td>
                    <td className="py-2.5 px-3 text-right font-mono">24,93%</td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-mono font-bold">2.1.04.01-B</td>
                    <td className="py-2.5 px-3">
                      <strong>Saldo Neto de Anticipos Comerciales Mismo Banco Banesco en Proceso de Liquidación / Mandato de Acopio</strong>
                      <div className="text-[11px] text-[#57534E]">
                        Total Abonos Comerciales Banesco (Bs. 1.013.438.543,38 / USD 1.544.405,79) menos porción ya reconocida en Resultados (Bs. 92.641.520,01 / USD 116.531,68)
                      </div>
                    </td>
                    <td className="py-2.5 px-3">Balance General (Pasivo NIIF 15)</td>
                    <td className="py-2.5 px-3 text-right font-mono">920.797.023,37</td>
                    <td className="py-2.5 px-3 text-right font-mono">1.427.874,11</td>
                    <td className="py-2.5 px-3 text-right font-mono">49,03%</td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-mono font-bold">2.1.04.02/03</td>
                    <td className="py-2.5 px-3">
                      <strong>Anticipos Recibidos de Productores y Asociados Naturales (Cédula V-)</strong>
                      <div className="text-[11px] text-[#57534E]">
                        Asociado recurrente V-023997829 (Bs. 7.649.975,00) y otros titulares naturales (Bs. 21.845.979,99)
                      </div>
                    </td>
                    <td className="py-2.5 px-3">Balance General (Pasivo NIIF 15)</td>
                    <td className="py-2.5 px-3 text-right font-mono">29.495.954,99</td>
                    <td className="py-2.5 px-3 text-right font-mono">47.335,99</td>
                    <td className="py-2.5 px-3 text-right font-mono">1,63%</td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-mono font-bold">1.1.01.99</td>
                    <td className="py-2.5 px-3">
                      <strong>Transferencias Internas desde Cuentas Propias de AGRÍCOLA ONI, C.A.</strong>
                      <div className="text-[11px] text-[#57534E]">
                        28 traspasos propios desde Mercantil (0105), Provincial (0108), Plaza (0138) y Bancamiga (0172)
                      </div>
                    </td>
                    <td className="py-2.5 px-3">Balance General (Activo Efectivo)</td>
                    <td className="py-2.5 px-3 text-right font-mono">208.708.057,73</td>
                    <td className="py-2.5 px-3 text-right font-mono">308.317,80</td>
                    <td className="py-2.5 px-3 text-right font-mono">10,59%</td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-mono font-bold">2.1.01.02</td>
                    <td className="py-2.5 px-3">
                      <strong>Desembolsos de Línea Rotativa de Capital de Trabajo (&ldquo;Crédito Becerra&rdquo;)</strong>
                      <div className="text-[11px] text-[#57534E]">
                        11 desembolsos de corto plazo (Amortizados Bs. 181.400.000,00 / USD 278.450,00 en el mismo período)
                      </div>
                    </td>
                    <td className="py-2.5 px-3">Balance General (Pasivo Financiero)</td>
                    <td className="py-2.5 px-3 text-right font-mono">186.376.000,00</td>
                    <td className="py-2.5 px-3 text-right font-mono">286.228,93</td>
                    <td className="py-2.5 px-3 text-right font-mono">9,83%</td>
                  </tr>

                  <tr className="bg-[#FAF8F5] font-bold border-t-2 border-[#1C1917]">
                    <td className="py-2.5 px-3 font-mono">1.1.01.02</td>
                    <td className="py-2.5 px-3">
                      TOTAL BRUTO DE ABONOS EN EXTRACTO BANESCO (282 OPERACIONES ENE-AGO 2026)
                    </td>
                    <td className="py-2.5 px-3">Libro Mayor Banesco</td>
                    <td className="py-2.5 px-3 text-right font-mono">1.966.597.105,35</td>
                    <td className="py-2.5 px-3 text-right font-mono">2.912.368,95</td>
                    <td className="py-2.5 px-3 text-right font-mono">100,00%</td>
                  </tr>

                  <tr className="bg-[#FEF9C3]/60 text-[#713F12]">
                    <td className="py-2 px-3 font-mono">CONCIL-BBU</td>
                    <td className="py-2 px-3" colSpan={2}>
                      <em>
                        Menos: Diferencial por tasa promedio ponderada de corte del sistema BBU y partidas interbancarias de cierre de agosto 2026
                      </em>
                    </td>
                    <td className="py-2 px-3 text-right font-mono">—</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">-130.538,77</td>
                    <td className="py-2 px-3 text-right font-mono">—</td>
                  </tr>

                  <tr className="bg-[#E0F2FE] font-bold text-[#0C4A6E] border-t border-[#0369A1]">
                    <td className="py-2.5 px-3 font-mono">TOTAL BBU</td>
                    <td className="py-2.5 px-3" colSpan={2}>
                      CRÉDITOS MOVILIZADOS EN PROMEDIO COMPUTADOS POR ANÁLISIS FINANCIERO BBU (ENERO – AGOSTO 2026)
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">1.966.597.105,35</td>
                    <td className="py-2.5 px-3 text-right font-mono text-sm">
                      2.781.830,18
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">CONCILIADO</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SECCIÓN III: JUSTIFICACIÓN DE LA ASIGNACIÓN DE DIVISAS Y APLICACIÓN DE LOS FONDOS */}
            <h3 className="text-base font-bold text-[#1C1917] pt-3 border-b border-[#D6D3D1] pb-1">
              TERCERO: Justificación Económica de los Abonos y de las Asignaciones de Divisas en Banesco (&ldquo;Cambiario / Compra $&rdquo;)
            </h3>

            <p>
              Con relación a las operaciones cambiarias y al destino de los recursos movilizados en la Cuenta Corriente N°{' '}
              <strong>{oniCompany.cuentaBanescoVES}</strong>, certificamos que el{' '}
              <strong>100% de las salidas bancarias por Bs. 1.956.660.113,95 (USD 2.907.112,24)</strong> guarda correspondencia directa con el ciclo productivo de{' '}
              <strong>{oniCompany.razonSocial}</strong> y cumple con las normas del Banco Central de Venezuela:
            </p>

            <ol className="list-decimal pl-6 space-y-1.5 text-xs sm:text-sm">
              <li>
                <strong>Liquidación de Cosecha a Productores y Proveedores de Café Verde (Cuenta 5.1.01.01):</strong>{' '}
                Se erogaron <strong>Bs. 1.161.270.000,00 (USD 1.718.450,12 — 59,35% de los egresos)</strong> directamente a cuentas bancarias titulares de productores agrícolas y centros de acopio para honrar los compromisos de suministro de café pergamino financiados por los anticipos de nuestros clientes.
              </li>
              <li>
                <strong>Adquisición Lícita de Divisas en Mesa de Cambio e Intervención Cambiaria Banesco (&ldquo;Cambiario / Compra $&rdquo; — Cuenta 1.1.01.03):</strong>{' '}
                Se aplicaron <strong>Bs. 375.630.000,00 (USD 556.890,45 — 19,20% de los egresos en 23 operaciones oficiales)</strong> para la compra de divisas a través de Banesco Banco Universal. Dichas divisas fueron destinadas a la procura de insumos agrícolas, sacos de empaque agroindustrial, repuestos de maquinaria de beneficio/trilla y cobertura de costos de reposición de inventario cafetalero bajo el Convenio Cambiario N° 1 del BCV.
              </li>
              <li>
                <strong>Amortización de Línea de Crédito Rotativa &ldquo;Crédito Becerra&rdquo; (Cuenta 2.1.01.02):</strong>{' '}
                Se reembolsaron <strong>Bs. 181.400.000,00 (USD 278.450,00 — 9,27% de los egresos)</strong>, cancelando el 97,33% del financiamiento transitorio recibido.
              </li>
              <li>
                <strong>Transferencias a Cuentas Propias de AGRÍCOLA ONI, C.A. en Otros Bancos (Cuenta 1.1.01.99):</strong>{' '}
                Se transfirieron <strong>Bs. 153.210.000,00 (USD 226.910,30 — 7,83% de los egresos)</strong> hacia nuestras cuentas propias en Mercantil, Provincial, Plaza y Bancamiga para pagos operativos en plazas del interior del país.
              </li>
              <li>
                <strong>Fletes Terrestres, Guías INSAI/SICA, Comisiones Bancarias/IGTF y Nómina Rural LOTTT:</strong>{' '}
                Se destinaron <strong>Bs. 45.495.000,00 (USD 67.380,15)</strong> a transporte pesado de cosecha y permisología sanitaria INSAI/SICA;{' '}
                <strong>Bs. 26.751.113,95 (USD 39.618,42)</strong> a comisiones bancarias automáticas de Banesco e Impuesto a las Grandes Transacciones Financieras (IGTF); y{' '}
                <strong>Bs. 12.904.000,00 (USD 19.412,80)</strong> a cuadrillas de caleta y vigilancia rural conforme a la LOTTT.
              </li>
            </ol>

            {/* SECCIÓN IV: SOPORTES DOCUMENTALES ANEXOS */}
            <h3 className="text-base font-bold text-[#1C1917] pt-3 border-b border-[#D6D3D1] pb-1">
              CUARTO: Soportes Documentales Consignados en Anexo para Respaldar la Presente Justificación
            </h3>

            <p>
              Con el objeto de respaldar documentalmente cada una de las cifras expuestas en la presente comunicación, consignamos anexo a esta carta el expediente físico y digital debidamente firmado y sellado integrado por:
            </p>

            <ul className="list-disc pl-6 space-y-1.5 text-xs sm:text-sm">
              <li>
                <strong>Anexo A — Estados Financieros Intermedios y Balance de Comprobación al 31/08/2026 (VEN-NIF):</strong>{' '}
                Suscritos por Contador Público Colegiado ({contadorNombre}, {contadorCpc}), donde se evidencia en el Estado de Situación Financiera (Balance General) el pasivo por{' '}
                <strong>Anticipos Recibidos de Clientes (Cuenta 2.1.04)</strong> por{' '}
                <strong>Bs. 1.571.513.047,62 (USD 2.317.822,22)</strong> y en el Estado de Resultados los{' '}
                <strong>Ingresos Ordinarios Devengados</strong> al corte por{' '}
                <strong>Bs. 92.641.520,01 (USD 116.531,68)</strong>.
              </li>
              <li>
                <strong>Anexo B — Contratos Comerciales de Suministro de Café y 16 Comprobantes Oficiales de Anticipos de Clientes (Serie COMP-ANT-2026):</strong>{' '}
                Contratos de suministro a futuro, acopio y mandato comercial suscritos con{' '}
                <strong>DISTRIBUIDORA DIS, C.A. (RIF J-30643703-7)</strong>,{' '}
                <strong>EMPRESA ETN, C.A. (RIF J-50100487-0)</strong> y demás compradores mayoristas, acompañados de sus comprobantes de ingreso firmados y sellados con trazabilidad bancaria SGLBTR/Banesco.
              </li>
              <li>
                <strong>Anexo C — Estados de Cuenta de Otros Bancos y 9 Comprobantes de Transferencias Internas entre Cuentas Propias (Serie COMP-TRP-2026):</strong>{' '}
                Extractos bancarios titulares de <strong>{oniCompany.razonSocial} (RIF {oniCompany.rif})</strong> en Banco Mercantil (0105), Banco Provincial (0108), Banco Plaza (0138) y Bancamiga (0172) que demuestran el origen propio de los{' '}
                <strong>Bs. 208.708.057,73 (USD 308.317,80)</strong> ingresados por traspasos de tesorería.
              </li>
              <li>
                <strong>Anexo D — Contrato de Financiamiento / Línea de Crédito Rotativa (&ldquo;Crédito Becerra&rdquo;) y Comprobantes de Amortización:</strong>{' '}
                Soporte contractual de los desembolsos recibidos por{' '}
                <strong>Bs. 186.376.000,00 (USD 286.228,93)</strong> y de los pagos de devolución ejecutados desde Banesco por{' '}
                <strong>Bs. 181.400.000,00 (USD 278.450,00)</strong>.
              </li>
              <li>
                <strong>Anexo E — Dossier de 8 Comprobantes de Compra de Divisas en Banesco (Serie COMP-DIV-2026 por USD 556.890,45) y Soportes de Liquidación de Cosecha / Guías INSAI-SICA / Declaraciones SENIAT (IVA e ISLR):</strong>{' '}
                Respaldo integral del uso lícito y productivo de las divisas adquiridas y de los pagos a productores cafetaleros.
              </li>
            </ul>

            <p className="pt-2">
              Sin otro particular a que hacer referencia, y agradeciendo de antemano la receptividad de su equipo de Análisis Financiero y Cumplimiento, quedamos a su entera disposición para ampliar cualquier información o suministrar los auxiliares contables adicionales que estimen pertinentes.
            </p>

            <p>Atentamente,</p>
          </div>

          {/* BLOQUES DE FIRMA Y SELLO HÚMEDO (REPRESENTANTE LEGAL, CONTADOR CPC Y RECEPCIÓN BANESCO) */}
          <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-2 border-[#1C1917] rounded-2xl p-5 flex flex-col justify-between min-h-[190px] bg-[#FAF8F5]">
              <div className="text-[11px] font-bold text-[#1C1917] uppercase">
                1. FIRMA Y SELLO DEL REPRESENTANTE LEGAL ({oniCompany.razonSocial})
              </div>
              <div className="border-t-2 border-[#1C1917] pt-3 mt-14 text-center space-y-0.5">
                <div className="text-xs font-bold text-[#1C1917]">
                  {representanteNombre}
                </div>
                <div className="text-[11px] font-mono text-[#44403C]">
                  C.I. N° {representanteCedula} · Representante Legal
                </div>
                <div className="text-[10px] text-[#57534E]">
                  RIF: {oniCompany.rif} (Firma Húmeda, Huella y Sello)
                </div>
              </div>
            </div>

            <div className="border-2 border-[#1C1917] rounded-2xl p-5 flex flex-col justify-between min-h-[190px] bg-[#FAF8F5]">
              <div className="text-[11px] font-bold text-[#14532D] uppercase">
                2. VISADO Y CERTIFICACIÓN TÉCNICA DEL CONTADOR PÚBLICO (VEN-NIF)
              </div>
              <div className="border-t-2 border-[#1C1917] pt-3 mt-14 text-center space-y-0.5">
                <div className="text-xs font-bold text-[#1C1917]">{contadorNombre}</div>
                <div className="text-[11px] font-mono font-bold text-[#14532D]">
                  {contadorCpc}
                </div>
                <div className="text-[10px] text-[#57534E]">
                  Contador Público Colegiado (Firma y Sello Húmedo CPC)
                </div>
              </div>
            </div>

            <div className="border-2 border-dashed border-[#0369A1] rounded-2xl p-5 flex flex-col justify-between min-h-[190px] bg-[#E0F2FE]/25">
              <div className="text-[11px] font-bold text-[#0C4A6E] uppercase">
                3. ACUSE DE RECIBO — BANESCO BANCO UNIVERSAL, C.A. (BBU)
              </div>
              <div className="border-t-2 border-[#0369A1] pt-3 mt-14 text-center space-y-0.5">
                <div className="text-xs font-bold text-[#0C4A6E]">
                  Sello Húmedo de Agencia / Ejecutivo de Cuenta Banesco
                </div>
                <div className="text-[10px] text-[#0369A1]">
                  Fecha de Recepción, Firma y Hora de Consignación de Recaudos
                </div>
              </div>
            </div>
          </div>

          {/* BARRA INFERIOR DE DESCARGA RÁPIDA EN WORD Y PDF AL FINAL DE LA CARTA */}
          <div className="no-print pt-6 border-t border-[#E7E5E4] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#57534E]">
              Documento oficial generado con trazabilidad bancaria 1:1 para <strong>{oniCompany.razonSocial} ({oniCompany.rif})</strong>.
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadWord}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1D4ED8] text-white text-xs font-bold rounded-xl hover:bg-[#1E40AF] transition-colors cursor-pointer shadow-sm"
              >
                <FileDown className="w-4 h-4" />
                Descargar Carta en WORD (.DOC)
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#DC2626] text-white text-xs font-bold rounded-xl hover:bg-[#B91C1C] transition-colors cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                Descargar Carta en PDF (.PDF)
              </button>
            </div>
          </div>
        </article>
      )}

      {/* =====================================================================
          PESTAÑA 2: ANEXO TÉCNICO DE CONCILIACIÓN CONTABLE CPC
         ===================================================================== */}
      {activeDocTab === 'ANEXO_TECNICO_CPC' && (
        <section className="bg-white border-2 border-[#1C1917] rounded-3xl p-8 shadow-md space-y-6">
          <div className="border-b-2 border-[#1C1917] pb-4 flex flex-col md:flex-row justify-between gap-4">
            <div>
              <div className="text-xs font-mono font-bold text-[#15803D]">
                PAPEL DE TRABAJO Y DICTAMEN DE CONCILIACIÓN BANCARIA-CONTABLE (BA VEN-NIF 8 / NIIF 15)
              </div>
              <h3 className="text-2xl font-bold text-[#1C1917] font-display">
                Anexo Técnico CPC: Por qué los Créditos Bancarios (USD 2.781.830,18) superan a las Ventas del Estado de Resultados (USD 116.531,68)
              </h3>
            </div>
            <div className="text-right font-mono text-xs text-[#44403C]">
              <div>Empresa: {oniCompany.razonSocial}</div>
              <div>RIF: {oniCompany.rif}</div>
              <div>Período: 01/01/2026 al 31/08/2026</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#DCFCE7]/60 border border-[#86EFAC] rounded-2xl p-4 space-y-1">
              <div className="text-xs font-bold text-[#14532D]">
                1. Estado de Resultados (Ingresos EEFF)
              </div>
              <div className="text-xl font-mono font-bold text-[#14532D]">
                USD 116.531,68
              </div>
              <div className="text-xs font-mono text-[#166534]">
                Bs. 92.641.520,01
              </div>
              <p className="text-[11px] text-[#14532D] pt-1">
                Representa únicamente las ventas de café cuya obligación de desempeño (entrega física + Guía SICA/INSAI + Factura SENIAT) ya fue culminada al 31/08/2026.
              </p>
            </div>

            <div className="bg-[#E0F2FE]/70 border border-[#7DD3FC] rounded-2xl p-4 space-y-1">
              <div className="text-xs font-bold text-[#0C4A6E]">
                2. Partidas de Balance General Movilizadas
              </div>
              <div className="text-xl font-mono font-bold text-[#0C4A6E]">
                USD 2.795.837,27
              </div>
              <div className="text-xs font-mono text-[#0369A1]">
                Bs. 1.873.955.585,34
              </div>
              <p className="text-[11px] text-[#0C4A6E] pt-1">
                Suma de Anticipos de Clientes pendientes de liquidar en Balance General (`2.1.04`), Traspasos de Cuentas Propias (`1.1.01.99`) y Línea Rotativa Becerra (`2.1.01.02`).
              </p>
            </div>

            <div className="bg-[#FEF9C3]/80 border border-[#FDE047] rounded-2xl p-4 space-y-1">
              <div className="text-xs font-bold text-[#713F12]">
                3. Total Movilizado Banesco / Promedio BBU
              </div>
              <div className="text-xl font-mono font-bold text-[#713F12]">
                USD 2.781.830,18 (BBU)
              </div>
              <div className="text-xs font-mono text-[#854D0E]">
                Bruto Extracto: USD 2.912.368,95 (Bs. 1.966.597.105,35)
              </div>
              <p className="text-[11px] text-[#713F12] pt-1">
                100% conciliado con los 41 comprobantes contables y los 282 abonos verificados mes a mes de Enero a Agosto 2026.
              </p>
            </div>
          </div>

          <div className="bg-[#FAF8F5] border border-[#D6D3D1] rounded-2xl p-5 space-y-3 text-xs sm:text-sm">
            <h4 className="font-bold text-[#1C1917] text-base">
              Fundamentación Normativa para el Analista de Riesgo y Cumplimiento de Banesco:
            </h4>
            <p>
              <strong>1. Por qué un Anticipo de Cliente no aparece en el renglón de &ldquo;Ingresos / Ventas&rdquo; de los EEFF:</strong>{' '}
              En la contabilidad financiera regida por la Federación de Colegios de Contadores Públicos de Venezuela (FCCPV — VEN-NIF), cuando un comprador mayorista como{' '}
              <strong>DISTRIBUIDORA DIS, C.A. (J-30643703-7)</strong> o{' '}
              <strong>EMPRESA ETN, C.A. (J-50100487-0)</strong> abona fondos en Banesco para asegurar cosecha de café verde, el asiento contable obligatorio es un{' '}
              <strong>Débito a Banco Banesco (Activo `1.1.01.02`)</strong> contra un{' '}
              <strong>Crédito a Anticipos Recibidos de Clientes (Pasivo `2.1.04.01`)</strong>. Si el contador registrara esos anticipos directamente como &ldquo;Ingresos por Ventas&rdquo; antes de entregar el café, estaría violando la NIIF 15 (reconocimiento prematuro de ingresos) y generando un débito fiscal anticipado improcedente ante el SENIAT.
            </p>
            <p>
              <strong>2. Por qué las Transferencias de Cuentas Propias suman créditos en el banco pero no son ingresos:</strong>{' '}
              Cuando <strong>AGRÍCOLA ONI, C.A.</strong> transfiere <strong>Bs. 208.708.057,73 (USD 308.317,80)</strong> desde sus propias cuentas en Mercantil, Provincial, Plaza o Bancamiga hacia Banesco para comprar divisas en Mesa de Cambio, el sistema informático del banco lo computa dentro de los &ldquo;Créditos Movilizados en BBU&rdquo;, pero contablemente es el mismo dinero de la empresa cambiando de institución financiera (Activo Banco A contra Activo Banco B).
            </p>
            <p>
              <strong>3. Por qué la Línea de Crédito Rotativa (&ldquo;Crédito Becerra&rdquo;) suma créditos en el banco pero no es ingreso:</strong>{' '}
              Los <strong>Bs. 186.376.000,00 (USD 286.228,93)</strong> recibidos como préstamo puente de capital de trabajo y devueltos casi en su totalidad (<strong>Bs. 181.400.000,00 / USD 278.450,00</strong>) desde la misma cuenta Banesco aumentan el volumen de créditos movilizados en la cuenta, pero su naturaleza es de endeudamiento de corto plazo (Pasivo Financiero `2.1.01.02`) con efecto neto cercano a cero sobre el patrimonio.
            </p>
          </div>
        </section>
      )}

      {/* =====================================================================
          PESTAÑA 3: CHECKLIST DE SOPORTES DOCUMENTALES PARA ENTREGAR AL BANCO
         ===================================================================== */}
      {activeDocTab === 'CHECKLIST_RECAUDOS' && (
        <section className="bg-white border-2 border-[#1C1917] rounded-3xl p-8 shadow-md space-y-6">
          <div className="border-b-2 border-[#1C1917] pb-4">
            <div className="text-xs font-mono font-bold text-[#0369A1]">
              GUÍA DE ARMADO DE CARPETA FÍSICA Y DIGITAL PARA CONSIGNAR EN BANESCO
            </div>
            <h3 className="text-2xl font-bold text-[#1C1917] font-display">
              Lista de Verificación de los Soportes Documentales Exigidos en el Correo de Banesco
            </h3>
            <p className="text-xs text-[#44403C] mt-1">
              Todos estos documentos ya están generados dentro de este sistema listos para imprimir, firmar y sellar en los Módulos 01 al 06:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-[#D6D3D1] rounded-2xl p-5 bg-[#FAF8F5] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#14532D]">
                  RECAUDO 01 · CARTA EXPLICATIVA Y EEFF
                </span>
                <FileText className="w-4 h-4 text-[#15803D]" />
              </div>
              <h4 className="font-bold text-sm text-[#1C1917]">
                Carta Explicativa Firmada + Balance de Comprobación VEN-NIF (Ene-Ago 2026)
              </h4>
              <p className="text-xs text-[#44403C]">
                Descarga en Word o PDF la Carta Explicativa de la Pestaña 1 (2 ejemplares: uno para el expediente Banesco y otro para que te sellen el acuse de recibo) acompañada del Balance de Comprobación del <strong>Módulo 01 (Contabilidad Banesco)</strong> donde consta la cuenta de Pasivo <code>2.1.04 Anticipos de Clientes</code>.
              </p>
            </div>

            <div className="border border-[#D6D3D1] rounded-2xl p-5 bg-[#FAF8F5] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#1D4ED8]">
                  RECAUDO 02 · SOPORTE DE ANTICIPOS (USD 2.317.822,22)
                </span>
                <Scale className="w-4 h-4 text-[#1D4ED8]" />
              </div>
              <h4 className="font-bold text-sm text-[#1C1917]">
                Contratos de Suministro de Café y 16 Comprobantes de Anticipos de Clientes
              </h4>
              <p className="text-xs text-[#44403C]">
                Imprime desde el <strong>Módulo 02 (Comprobantes Anticipos)</strong> los 16 comprobantes de la serie <code>COMP-ANT-2026</code> (incluyendo DISTRIBUIDORA DIS J-30643703-7 y EMPRESA ETN J-50100487-0) junto con los Contratos Marco de Suministro y Mandato del <strong>Módulo 10 (Blindaje y Contratos)</strong>.
              </p>
            </div>

            <div className="border border-[#D6D3D1] rounded-2xl p-5 bg-[#FAF8F5] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#B45309]">
                  RECAUDO 03 · SOPORTE DE CUENTAS PROPIAS (USD 308.317,80)
                </span>
                <ArrowRightLeft className="w-4 h-4 text-[#B45309]" />
              </div>
              <h4 className="font-bold text-sm text-[#1C1917]">
                9 Comprobantes de Transferencias Internas + Estados de Cuenta Otros Bancos
              </h4>
              <p className="text-xs text-[#44403C]">
                Imprime desde el <strong>Módulo 03 (Transf. Internas)</strong> los 9 comprobantes <code>COMP-TRP-2026</code> y anexa copia de los encabezados de estados de cuenta de <strong>AGRÍCOLA ONI, C.A. (J-50145638-0)</strong> en Mercantil (0105), Provincial (0108), Plaza (0138) y Bancamiga (0172).
              </p>
            </div>

            <div className="border border-[#D6D3D1] rounded-2xl p-5 bg-[#FAF8F5] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#7C2D12]">
                  RECAUDO 04 · PRÉSTAMO BECERRA (USD 286.228,93) Y DIVISAS (USD 556.890,45)
                </span>
                <Landmark className="w-4 h-4 text-[#7C2D12]" />
              </div>
              <h4 className="font-bold text-sm text-[#1C1917]">
                Comprobantes de Línea Rotativa Becerra y Compras de Dólares Banesco
              </h4>
              <p className="text-xs text-[#44403C]">
                Imprime desde el <strong>Módulo 04 (Compras Dólares)</strong> los 8 comprobantes <code>COMP-DIV-2026</code> y desde el <strong>Módulo 05 (Restantes Ing/Egr)</strong> los comprobantes de recepción y devolución del Crédito Becerra (<code>COMP-ING-BEC</code> y <code>COMP-EGR-BEC</code>) que prueban que el préstamo ya fue devuelto en un 97,33%.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
