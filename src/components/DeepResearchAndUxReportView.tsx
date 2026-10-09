import React, { useState } from 'react';
import {
  EXCEL_BLINDAJE_SPEC,
  COMPETITOR_APPS_VENEZUELA,
  USER_NEEDS_INSIGHTS,
} from '../data/researchReportData';
import { CashTrailOperation, CompanyProfile } from '../data/nominusData';
import { BookOpen, Award, Sparkles, CheckCircle2, Truck, Layers, Printer } from 'lucide-react';

interface DeepResearchAndUxReportViewProps {
  companies: CompanyProfile[];
  selectedCompanyId: string;
  tasaBcvActual: number;
  onCreatePreOrder: (newOp: CashTrailOperation) => void;
}

export const DeepResearchAndUxReportView: React.FC<DeepResearchAndUxReportViewProps> = ({
  companies,
  selectedCompanyId,
  tasaBcvActual,
  onCreatePreOrder,
}) => {
  const activeCompany =
    companies.find((c) => c.id === selectedCompanyId) || companies[0];
  // Simulador interactivo de Pedido Anticipado Ágil + Fidelización (Punto 5 del Reporte)
  const [socioNombre, setSocioNombre] = useState('Hacienda Santa Teresa de Chabasquén, C.A.');
  const [socioRif, setSocioRif] = useState('J-41008912-3');
  const [quintalesPedido, setQuintalesPedido] = useState<number>(180);
  const [variedadSeleccionada, setVariedadSeleccionada] = useState<
    'Café Verde Arábica Lavado' | 'Café Pergamino Seco' | 'Café Verde Caturra Excelso'
  >('Café Verde Arábica Lavado');
  const [origenColombia, setOrigenColombia] = useState('Cúcuta / Norte de Santander, Colombia');
  const [refBanescoSim, setRefBanescoSim] = useState('984120553');
  const [pedidoCreadoMsg, setPedidoCreadoMsg] = useState(false);

  // Cálculo del Sistema de Fidelización por Volumen de Quintales ("Club Cosecha Segura")
  const getTierFidelizacion = (qq: number) => {
    if (qq >= 200) {
      return {
        nivel: 'Nivel Esmeralda Cosecha Mayor (200+ QQ)',
        descuentoFletePorcentaje: 15,
        prioridadMesaCambio: 'Prioridad Alta Lote Consolidado Banesco (24h)',
        diasAlmacenajeGratisColombia: 15,
        bgColor: 'bg-[#DCFCE7]',
        borderColor: 'border-[#86EFAC]',
      };
    }
    if (qq >= 100) {
      return {
        nivel: 'Nivel Ámbar Productor Asociado (100 - 199 QQ)',
        descuentoFletePorcentaje: 8,
        prioridadMesaCambio: 'Prioridad Estándar Banesco (48h)',
        diasAlmacenajeGratisColombia: 10,
        bgColor: 'bg-[#FEF9C3]',
        borderColor: 'border-[#FEF08A]',
      };
    }
    return {
      nivel: 'Nivel Semilla Aliado Cafetalero (10 - 99 QQ)',
      descuentoFletePorcentaje: 3,
      prioridadMesaCambio: 'Lote Agrupado Semanal Banesco',
      diasAlmacenajeGratisColombia: 5,
      bgColor: 'bg-[#E0F2FE]',
      borderColor: 'border-[#BAE6FD]',
    };
  };

  const precioPorQuintalUSD =
    variedadSeleccionada === 'Café Verde Caturra Excelso'
      ? 175
      : variedadSeleccionada === 'Café Verde Arábica Lavado'
      ? 170
      : 162;

  const fleteBasePorQuintalUSD = 21.5;
  const tier = getTierFidelizacion(quintalesPedido);
  const fleteConDescuentoPorQQ =
    fleteBasePorQuintalUSD * (1 - tier.descuentoFletePorcentaje / 100);

  const totalCafeUSD = quintalesPedido * precioPorQuintalUSD;
  const totalFleteUSD = quintalesPedido * fleteConDescuentoPorQQ;
  const totalOperacionUSD = totalCafeUSD + totalFleteUSD;
  const anticipoRequeridoVES = totalOperacionUSD * tasaBcvActual;

  const handleConfirmAgilePreOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const comisionBanesco = anticipoRequeridoVES * 0.0025;
    const newOp: CashTrailOperation = {
      id: `op-${Date.now()}`,
      empresaId: activeCompany.id,
      uidUnico: `UID-BAN-2026-${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}-00${Math.floor(45 + Math.random() * 50)}`,
      codigoOperacion: `${activeCompany.codigoCorto.slice(0, 3)}-2026-00${Math.floor(45 + Math.random() * 50)}`,
      fechaAnticipo: '2026-10-08',
      horaTransferencia: '11:15:00',
      clienteNombre: socioNombre,
      clienteRif: socioRif,
      clienteTipoCuenta: 'Jurídica (Empresa)',
      bancoOrigen: '0134 - Banesco Banco Universal (Mismo Banco)',
      numeroCuentaOrigen: '0134-0089-24-0891049921',
      cuentaBanescoReceptora: activeCompany.cuentaBanescoVES,
      referenciaBanesco: refBanescoSim,
      montoAnticipoVES: Math.round(anticipoRequeridoVES * 100) / 100,
      propositoAnticipo: 'Anticipo en ventas para compra de café en el exterior (Colombia) y servicio de flete internacional bajo Club Cosecha Segura.',
      tasaBcvAnticipo: tasaBcvActual,
      fechaMesaCambio: '2026-10-08',
      horaMesaCambio: '14:20:00',
      codigoPactoBanesco: `MC-BAN-2026-${Math.floor(10000 + Math.random() * 89999)}`,
      tasaMesaCambio: Math.round((tasaBcvActual + 0.04) * 100) / 100,
      comisionBanescoVES: Math.round(comisionBanesco * 100) / 100,
      montoAdjudicadoUSD: Math.round(totalOperacionUSD * 100) / 100,
      cuentaBanescoDivisas: activeCompany.cuentaBanescoUSD,
      fechaCompraExterior: '2026-10-09',
      referenciaPagoExterior: `INT-PAY-COL-${Math.floor(775000 + Math.random() * 9000)}`,
      proveedorExterior: 'Exportadora Cafetera del Norte S.A.S. (NIT 900.412.881-2)',
      origenCafe: origenColombia,
      variedadCafe: variedadSeleccionada,
      quintalesComprados: quintalesPedido,
      costoCafeUSD: Math.round(totalCafeUSD * 100) / 100,
      fleteInternacionalUSD: Math.round(totalFleteUSD * 100) / 100,
      estadoLogistico: 'En Almacén Colombia (Trámite INSAI)',
      permisoInsai: 'EN TRÁMITE: SOL-INSAI-2026-NUEVO',
      numeroFacturaSeniat: 'PENDIENTE AL INGRESO ADUANAL',
      fechaFacturaSeniat: '2026-10-16',
      tasaBcvFacturacion: tasaBcvActual,
      subtotalCafeVES: Math.round(totalCafeUSD * tasaBcvActual * 100) / 100,
      subtotalFleteVES: Math.round(totalFleteUSD * tasaBcvActual * 100) / 100,
      ivaFleteVES: 0,
      retencionIslrFleteVES: Math.round(totalFleteUSD * tasaBcvActual * 0.03 * 100) / 100,
      diferencialCambiarioVES: 0,
      estadoContable: 'Anticipo Abierto (Pasivo 2.1.04)',
      etapaTrazabilidad: 2,
      reciboAnticipoNro: `REC-ANT-2026-0${Math.floor(108 + Math.random() * 90)}`,
    };
    onCreatePreOrder(newOp);
    setPedidoCreadoMsg(true);
    setTimeout(() => setPedidoCreadoMsg(false), 4000);
  };

  return (
    <div className="space-y-10">
      {/* Banner Principal de Investigación */}
      <div className="bg-[#E0F2FE] border border-[#BAE6FD] rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="max-w-4xl space-y-2">
            <p className="text-xs font-semibold text-[#0369A1]">
              Investigación Profunda Puntos 1, 3, 4 y 5 + Informe Maestro para el Diseñador Web
            </p>
            <h2 className="text-2xl font-bold text-[#0C4A6E] font-display">
              Estudio Científico-Contable, Benchmarking de Apps en Venezuela y Prototipo de Pedidos Anticipados y Fidelización
            </h2>
            <p className="text-sm text-[#0C4A6E] leading-relaxed">
              Este módulo reúne la investigación normativa y académica (VEN-NIF, NIIF 15, NIC 2, SUDEBAN 083.18, Convenio Cambiario N° 1 BCV), el estudio de las aplicaciones líderes en Venezuela y el <strong>Informe Técnico para el Diseñador Web</strong> con el simulador en vivo de Pedidos Anticipados Ágiles y Fidelización Cafetalera.
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="no-print inline-flex items-center gap-2 px-4 py-2.5 bg-[#1C1917] text-white text-xs font-semibold rounded-xl hover:bg-[#292524] cursor-pointer whitespace-nowrap shrink-0"
          >
            <Printer className="w-4 h-4" />
            Imprimir Informe Completo
          </button>
        </div>
      </div>

      {/* PUNTO 1: Investigación Académica y Manuales de Estructuración Excel / ERP para Proteger el Cupo en Dólares */}
      <section className="bg-white border border-[#E7E5E4] rounded-2xl p-6 lg:p-8 space-y-6">
        <div className="border-b border-[#E7E5E4] pb-4">
          <span className="text-xs font-bold text-[#15803D]">
            PUNTO 1 · INVESTIGACIÓN ACADÉMICA, MANUALES VEN-NIF Y PROTECCIÓN DEL CUPO EN DÓLARES BANESCO
          </span>
          <h3 className="text-xl font-bold text-[#1C1917] font-display mt-1">
            ¿Cómo Estructurar la Hoja Contable y Procedimientos Automáticos para que Banesco NO recorte ni bloquee el Cupo en Dólares?
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#FAF8F5] border border-[#E7E5E4] rounded-xl p-4">
            <h4 className="text-sm font-bold text-[#1C1917] mb-1.5">
              A. Principio NIIF 15 (Pasivos por Contratos con Clientes)
            </h4>
            <p className="text-xs text-[#44403C] leading-relaxed">
              Según la doctrina contable de la Federación de Colegios de Contadores Públicos de Venezuela (FCCPV — BA VEN-NIF 8), todo bolívar recibido antes de la transferencia física de los sacos de café debe reconocerse como un <strong>Pasivo por Anticipo de Clientes (Cuenta 2.1.04.01)</strong>. Esto demuestra ante el SENIAT y SUDEBAN que la empresa tiene una deuda comercial de entrega de producto agrícola, no una operación de corretaje financiero.
            </p>
          </div>

          <div className="bg-[#FAF8F5] border border-[#E7E5E4] rounded-xl p-4">
            <h4 className="text-sm font-bold text-[#1C1917] mb-1.5">
              B. Principio NIC 2 (Inventarios en Tránsito y Flete)
            </h4>
            <p className="text-xs text-[#44403C] leading-relaxed">
              Mientras el café comprado en Colombia permanece en almacenes de Cúcuta o Bucaramanga esperando el Permiso Fitosanitario de Importación (INSAI) y nacionalización, los dólares pagados desde Banesco Custodia se activan en la cuenta <strong>1.1.03.05 Inventario de Café en Tránsito Internacional</strong>, acumulando el costo FOB más los gastos de flete y aduana.
            </p>
          </div>

          <div className="bg-[#FAF8F5] border border-[#E7E5E4] rounded-xl p-4">
            <h4 className="text-sm font-bold text-[#1C1917] mb-1.5">
              C. Regla de Oro de Cumplimiento Banesco (Cupo USD)
            </h4>
            <p className="text-xs text-[#44403C] leading-relaxed">
              Los manuales de Prevención de Legitimación de Capitales (Resolución SUDEBAN 083.18) activan alertas cuando una cuenta jurídica recibe múltiples transferencias en Bs. y solicita el 100% en Mesa de Cambio el mismo día sin soporte. Para blindar el cupo: <strong>(1) Solo recibir de cuentas titulares del socio con RIF, (2) Mantener calce 1:1 con Órdenes de Compra de Café y (3) Entregar trimestralmente el Dossier de Facturas SENIAT cerradas a tu Ejecutivo Banesco.</strong>
            </p>
          </div>
        </div>

        {/* Tabla de Estructura Exacta de Hojas de Excel / Base de Datos */}
        <div>
          <h4 className="text-sm font-bold text-[#1C1917] mb-3">
            Arquitectura de Columnas y Fórmulas Obligatorias para tu Sistema / Hoja de Excel Maestra:
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-[#E7E5E4] text-xs">
              <thead>
                <tr className="bg-[#DCFCE7] border-b border-[#86EFAC] text-[#14532D]">
                  <th className="py-2.5 px-3 font-bold">Bloque de Columnas</th>
                  <th className="py-2.5 px-3 font-bold">Campos Obligatorios</th>
                  <th className="py-2.5 px-3 font-bold">Fórmula / Regla de Automatización</th>
                  <th className="py-2.5 px-3 font-bold">Base Legal Venezuela</th>
                  <th className="py-2.5 px-3 font-bold">Por qué Protege tu Cupo USD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {EXCEL_BLINDAJE_SPEC.map((spec, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF8F5]">
                    <td className="py-3 px-3 font-mono font-bold text-[#1C1917] whitespace-nowrap">
                      {spec.columna}
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#1C1917]">{spec.campo}</td>
                    <td className="py-3 px-3 font-mono text-[#0369A1]">{spec.formulaExcel}</td>
                    <td className="py-3 px-3 text-[#15803D] font-medium">{spec.normaVenezolana}</td>
                    <td className="py-3 px-3 text-[#44403C]">{spec.propositoBlindaje}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* PUNTOS 3 Y 4: Análisis de Apps Líderes en Venezuela y Patrones Extraídos */}
      <section className="bg-white border border-[#E7E5E4] rounded-2xl p-6 lg:p-8 space-y-6">
        <div className="border-b border-[#E7E5E4] pb-4">
          <span className="text-xs font-bold text-[#9A3412]">
            PUNTOS 3 Y 4 · BENCHMARKING DE APPS EN VENEZUELA Y PATRONES DE ÉXITO
          </span>
          <h3 className="text-xl font-bold text-[#1C1917] font-display mt-1">
            Análisis Comparativo de Software Contable/Cafetalero en Venezuela y Qué Aprovechamos en NOMINUS CAFÉ 1
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {COMPETITOR_APPS_VENEZUELA.map((app, i) => (
            <div key={i} className="bg-[#FAF8F5] border border-[#E7E5E4] rounded-2xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold text-[#9A3412]">{app.categoria}</span>
                  <h4 className="text-base font-bold text-[#1C1917]">{app.nombre}</h4>
                </div>
              </div>
              <p className="text-xs text-[#44403C]">
                <strong>Manejo de Anticipos Banesco:</strong> {app.manejoAnticiposBanesco}
              </p>
              <p className="text-xs text-[#44403C]">
                <strong>Cumplimiento SENIAT:</strong> {app.manejoFiscalSeniat}
              </p>
              <div className="pt-2 border-t border-[#E7E5E4]">
                <span className="text-xs font-bold text-[#15803D] block mb-1">
                  Patrones que extrajimos para NOMINUS CAFÉ 1:
                </span>
                <ul className="space-y-1 text-xs text-[#44403C]">
                  {app.fortalezas.map((f, j) => (
                    <li key={j}>· {f}</li>
                  ))}
                </ul>
              </div>
              <div className="text-xs text-[#9A3412] bg-[#FFF7ED] p-2.5 rounded-lg border border-[#FED7AA]">
                <strong>Brecha superada por nuestra app:</strong> {app.debilidadesParaCafe}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PUNTO 5: Necesidades Reales de los Usuarios (Foros, Contadores y Caficultores) */}
      <section className="bg-white border border-[#E7E5E4] rounded-2xl p-6 lg:p-8 space-y-6">
        <div className="border-b border-[#E7E5E4] pb-4">
          <span className="text-xs font-bold text-[#6B21A8]">
            PUNTO 5 · NECESIDADES REALES DE LOS USUARIOS EN VENEZUELA
          </span>
          <h3 className="text-xl font-bold text-[#1C1917] font-display mt-1">
            Hallazgos en Foros de Contadores Venezolanos, Productores de Café y Administradores Agroindustriales
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {USER_NEEDS_INSIGHTS.map((insight, idx) => (
            <div key={idx} className="bg-[#FAF8F5] border border-[#E7E5E4] rounded-2xl p-5 space-y-2.5">
              <div className="text-xs font-bold text-[#6B21A8]">
                {insight.perfilUsuario} · {insight.regionVenezuela}
              </div>
              <p className="text-xs italic text-[#44403C] bg-white p-3 rounded-xl border border-[#E7E5E4]">
                {insight.problemaCriticoDetectado}
              </p>
              <p className="text-xs text-[#14532D] bg-[#DCFCE7]/70 p-3 rounded-xl border border-[#86EFAC]">
                <strong>Solución implementada en NOMINUS CAFÉ 1:</strong> {insight.solucionEnNominusCafe1}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* INFORME PARA EL DISEÑADOR WEB + SIMULADOR EN VIVO DE PEDIDOS ANTICIPADOS Y FIDELIZACIÓN */}
      <section className="bg-[#FFF7ED] border border-[#FED7AA] rounded-2xl p-6 lg:p-8 space-y-8">
        <div className="border-b border-[#FED7AA] pb-5">
          <span className="text-xs font-bold text-[#9A3412]">
            ESPECIFICACIÓN DE DISEÑO WEB · UX/UI PASTEL ALEGRE, MENÚ FOCAL, FIDELIZACIÓN Y PEDIDOS ANTICIPADOS ÁGILES
          </span>
          <h3 className="text-2xl font-bold text-[#1C1917] font-display mt-1">
            Informe Directriz para el Diseñador Web y Prototipo Funcional de Pedidos Anticipados ("Club Cosecha Segura")
          </h3>
          <p className="text-sm text-[#44403C] mt-1 leading-relaxed">
            A continuación se presenta la guía arquitectónica aplicada en esta misma aplicación y el módulo interactivo de <strong>Pedidos Anticipados Ágiles y Fidelización por Volumen de Quintales</strong> para los socios cafetaleros.
          </p>
        </div>

        {/* Directrices de Diseño para el Diseñador Web */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border border-[#FED7AA] rounded-xl p-5">
            <h4 className="text-sm font-bold text-[#1C1917] mb-2">
              1. Jerarquía Visual hacia el Menú Principal (Focal Anchor)
            </h4>
            <p className="text-xs text-[#44403C] leading-relaxed">
              El menú de navegación utiliza una <strong>Barra de Módulos Pastel de Alto Contraste Perceptual</strong> ubicada en la zona superior central del flujo visual. Cada pestaña del menú emplea un tono pastel alegre diferenciado (Verde Menta Banesco `#DCFCE7`, Durazno Cosecha `#FFEDD5`, Azul Cielo Aduana `#E0F2FE`, Lavanda Legal `#F3E8FF`, Rosa Nómina `#FCE7F3`) con tipografía oscura `#1C1917` (contraste &gt; 11:1 WCAG AAA) que dirige instantáneamente la mirada del usuario hacia las 5 acciones clave.
            </p>
          </div>

          <div className="bg-white border border-[#FED7AA] rounded-xl p-5">
            <h4 className="text-sm font-bold text-[#1C1917] mb-2">
              2. Sistema de Fidelización Personalizado ("Club Cosecha Segura")
            </h4>
            <p className="text-xs text-[#44403C] leading-relaxed">
              Premia a los productores y torrefactoras que programan sus anticipos en ventas con antelación:
              <br />· <strong>Nivel Semilla (10–99 QQ):</strong> 3% desc. en flete desde Colombia.
              <br />· <strong>Nivel Ámbar (100–199 QQ):</strong> 8% desc. en flete + 10 días de bodega libre en Cúcuta.
              <br />· <strong>Nivel Esmeralda (200+ QQ):</strong> 15% desc. en flete + prioridad 24h en Mesa de Cambio Banesco.
            </p>
          </div>

          <div className="bg-white border border-[#FED7AA] rounded-xl p-5">
            <h4 className="text-sm font-bold text-[#1C1917] mb-2">
              3. Pedidos Anticipados Ágiles en 3 Pasos (Zero-Friction)
            </h4>
            <p className="text-xs text-[#44403C] leading-relaxed">
              En lugar de formularios complejos, el socio selecciona: <strong>(1) Quintales y Variedad de Café, (2) Origen en Colombia, y (3) Referencia de su transferencia Banesco</strong>. El sistema calcula en milisegundos los Bolívares requeridos a tasa BCV, el descuento de fidelización en el flete, el código de anticipo y lo inyecta directo en la Hoja Contable Banesco.
            </p>
          </div>
        </div>

        {/* Simulador en Vivo de Pedido Anticipado Ágil y Fidelización */}
        <div className="bg-white border border-[#D6D3D1] rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#E7E5E4]">
            <div>
              <span className="text-xs font-bold text-[#15803D]">
                PROTOTIPO INTERACTIVO EN VIVO · CREA UN PEDIDO ANTICIPADO Y ENVÍALO A LA HOJA BANESCO
              </span>
              <h4 className="text-lg font-bold text-[#1C1917] font-display">
                Cotizador Ágil de Anticipo en Ventas + Calculadora de Fidelización en Flete Colombia-Venezuela
              </h4>
            </div>
            <div className={`${tier.bgColor} border ${tier.borderColor} px-4 py-2 rounded-xl text-xs font-bold text-[#1C1917]`}>
              {tier.nivel} · {tier.descuentoFletePorcentaje}% Descuento en Flete Aplicado
            </div>
          </div>

          <form onSubmit={handleConfirmAgilePreOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#44403C] mb-1">
                    Razón Social del Socio / Finca Cafetalera
                  </label>
                  <input
                    type="text"
                    required
                    value={socioNombre}
                    onChange={(e) => setSocioNombre(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#D6D3D1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#44403C] mb-1">
                    RIF Verificado SENIAT
                  </label>
                  <input
                    type="text"
                    required
                    value={socioRif}
                    onChange={(e) => setSocioRif(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-[#D6D3D1] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#44403C] mb-1">
                    Cantidad de Quintales (Sacos 46 Kg)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={2000}
                    value={quintalesPedido}
                    onChange={(e) => setQuintalesPedido(Number(e.target.value) || 50)}
                    className="w-full px-3 py-2 text-sm font-mono font-bold border border-[#D6D3D1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#44403C] mb-1">
                    Variedad de Café a Importar
                  </label>
                  <select
                    value={variedadSeleccionada}
                    onChange={(e) => setVariedadSeleccionada(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-[#D6D3D1] rounded-lg bg-white"
                  >
                    <option value="Café Verde Arábica Lavado">Café Verde Arábica Lavado ($170/QQ)</option>
                    <option value="Café Verde Caturra Excelso">Café Verde Caturra Excelso ($175/QQ)</option>
                    <option value="Café Pergamino Seco">Café Pergamino Seco ($162/QQ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#44403C] mb-1">
                    Referencia Transferencia Banesco
                  </label>
                  <input
                    type="text"
                    required
                    value={refBanescoSim}
                    onChange={(e) => setRefBanescoSim(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-[#D6D3D1] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#44403C] mb-1">
                  Centro de Despacho en Colombia y Ruta Aduanal
                </label>
                <select
                  value={origenColombia}
                  onChange={(e) => setOrigenColombia(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#D6D3D1] rounded-lg bg-white"
                >
                  <option value="Cúcuta / Norte de Santander, Colombia">
                    Bodega Cúcuta, Norte de Santander → Aduana San Antonio del Táchira
                  </option>
                  <option value="Bucaramanga, Santander, Colombia (Zona Franca)">
                    Zona Franca Bucaramanga, Santander → Aduana Ureña / San Cristóbal
                  </option>
                  <option value="Ocaña / Catatumbo, Colombia">
                    Centro Cafetero Ocaña → Cruce Terrestre Autorizado INSAI
                  </option>
                </select>
              </div>
            </div>

            {/* Resumen Financiero Automático del Pedido Anticipado */}
            <div className="lg:col-span-5 bg-[#FAF8F5] border border-[#E7E5E4] rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#57534E]">Costo Lote de Café ({quintalesPedido} QQ):</span>
                  <span className="font-mono font-bold text-[#1C1917]">
                    USD {totalCafeUSD.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#57534E]">
                    Flete Colombia-Vzla (con {tier.descuentoFletePorcentaje}% desc. Fidelización):
                  </span>
                  <span className="font-mono font-bold text-[#0369A1]">
                    USD {totalFleteUSD.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#57534E]">Beneficio Logístico Incluido:</span>
                  <span className="font-semibold text-[#15803D]">
                    {tier.diasAlmacenajeGratisColombia} días almacenaje gratis en Colombia
                  </span>
                </div>
                <div className="border-t border-[#D6D3D1] pt-2 flex justify-between text-sm font-bold text-[#1C1917]">
                  <span>Total Divisas a Comprar en Banesco:</span>
                  <span className="font-mono">
                    USD {totalOperacionUSD.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-[#DCFCE7] border border-[#86EFAC] rounded-lg p-3 flex justify-between items-center">
                  <span className="text-xs font-bold text-[#14532D]">
                    Anticipo a Transferir a Banesco (Bs.):
                  </span>
                  <span className="text-base font-mono font-bold text-[#14532D]">
                    Bs. {anticipoRequeridoVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#1C1917] text-white text-xs font-semibold rounded-xl hover:bg-[#292524] transition-colors cursor-pointer"
              >
                Registrar Pedido Anticipado en Hoja Contable Banesco
              </button>

              {pedidoCreadoMsg && (
                <div className="text-xs font-bold text-[#15803D] text-center bg-[#DCFCE7] py-2 rounded-lg">
                  ¡Pedido Anticipado registrado en la Hoja Contable Banesco y Recibo generado!
                </div>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};
