import React, { useState, useEffect } from 'react';
import {
  CashTrailOperation,
  CompanyProfile,
  formatDateDDMMYYYY,
} from '../data/nominusData';
import { Printer } from 'lucide-react';

interface ReceiptGeneratorViewProps {
  companies: CompanyProfile[];
  operations: CashTrailOperation[];
  selectedOpId: string;
  onSelectOp: (id: string) => void;
}

export const ReceiptGeneratorView: React.FC<ReceiptGeneratorViewProps> = ({
  companies,
  operations,
  selectedOpId,
  onSelectOp,
}) => {
  const currentOp = operations.find((o) => o.id === selectedOpId) || operations[0];
  const owningCompany =
    (currentOp && companies.find((c) => c.id === currentOp.empresaId)) || companies[0];

  const [empresaEmisora, setEmpresaEmisora] = useState(owningCompany.razonSocial);
  const [rifEmisora, setRifEmisora] = useState(owningCompany.rif);
  const [domicilioEmisora, setDomicilioEmisora] = useState(owningCompany.domicilioFiscal);
  const [conceptoAdicional, setConceptoAdicional] = useState(
    'Anticipo comercial a cuenta de futura venta y suministro de Café en Grano importado desde Colombia y servicio logístico de flete terrestre internacional/nacional para cubrir déficit de cosecha local.'
  );

  useEffect(() => {
    setEmpresaEmisora(owningCompany.razonSocial);
    setRifEmisora(owningCompany.rif);
    setDomicilioEmisora(owningCompany.domicilioFiscal);
  }, [owningCompany.id, owningCompany.razonSocial, owningCompany.rif, owningCompany.domicilioFiscal]);

  if (!currentOp) {
    return (
      <div className="space-y-6">
        <div className="bg-[#DCFCE7] border border-[#86EFAC] rounded-2xl p-8 text-center space-y-3">
          <div className="text-xs font-bold text-[#166534]">
            BASE DE DATOS SIN DATOS SIMULADOS · {owningCompany.razonSocial} ({owningCompany.rif})
          </div>
          <h2 className="text-2xl font-bold text-[#14532D] font-display">
            Recibos de Anticipo listos para emitirse con información verdadera
          </h2>
          <p className="text-sm text-[#14532D] max-w-2xl mx-auto leading-relaxed">
            La empresa <strong>{owningCompany.razonSocial}</strong> no contiene operaciones simuladas en su base de datos. En cuanto registres el primer anticipo real en el <strong>Módulo 01 (Hoja Banesco y Efectivo)</strong>, aquí podrás visualizar e imprimir su Comprobante Oficial de Anticipo en Ventas (Cuenta 2.1.04.01).
          </p>
        </div>
      </div>
    );
  }

  const equivalenteRefUSD = currentOp.montoAnticipoVES / currentOp.tasaBcvAnticipo;
  const precioRefQuintalUSD =
    currentOp.quintalesComprados > 0
      ? (currentOp.costoCafeUSD + currentOp.fleteInternacionalUSD) / currentOp.quintalesComprados
      : 190;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Encabezado pedagógico y selector de operación */}
      <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-2xl p-6 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <p className="text-xs font-semibold text-[#9A3412]">
              Punto 2 de la Investigación · Documento Pre-llenado y Guía Práctica
            </p>
            <h2 className="text-2xl font-bold text-[#1C1917] font-display">
              Recibo Oficial de Anticipo en Ventas (Blindado para Banesco y SENIAT)
            </h2>
            <p className="text-sm text-[#44403C] leading-relaxed">
              En Venezuela, cuando recibes dinero antes de entregar el café, <strong>NO debes emitir la Factura Fiscal todavía</strong> si la mercancía sigue en Colombia en trámites INSAI, sino un <strong>Recibo de Anticipo de Clientes (Pasivo Cuenta 2.1.04.01)</strong>. La Factura SENIAT se emite al entregar el café y liquidar el flete. Aquí tienes el modelo ya lleno y listo para imprimir.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <select
              value={currentOp.id}
              onChange={(e) => onSelectOp(e.target.value)}
              aria-label="Seleccionar operación para cargar en el recibo"
              className="px-4 py-2.5 bg-white border border-[#FDBA74] rounded-xl text-sm font-medium text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#FB923C]"
            >
              {operations.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.reciboAnticipoNro} — {op.clienteNombre.slice(0, 28)}...
                </option>
              ))}
            </select>

            <button
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1C1917] text-white text-sm font-semibold rounded-xl hover:bg-[#292524] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir Recibo Oficial
            </button>
          </div>
        </div>
      </div>

      {/* Guía Sencilla en 5 Pasos de Cómo Hacerlo */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 no-print">
        {[
          {
            paso: 'Paso 1. Antes de Transferir',
            colorBg: 'bg-[#E0F2FE]',
            colorBorder: 'border-[#BAE6FD]',
            titulo: 'Verifica Titularidad del Socio',
            desc: 'Exige que la transferencia a tu Banesco venga únicamente de la cuenta personal o jurídica del propio caficultor/socio (nunca de terceros ajenos).'
          },
          {
            paso: 'Paso 2. Concepto Bancario',
            colorBg: 'bg-[#DCFCE7]',
            colorBorder: 'border-[#BBF7D0]',
            titulo: 'Descripción en Banesco',
            desc: 'Indica al cliente que coloque en el motivo de transferencia Banesco: "ANTICIPO COMPRA CAFE LOTE AGRICOLA". Jamás colocar "compra divisas" o "cambio".'
          },
          {
            paso: 'Paso 3. Emisión del Recibo',
            colorBg: 'bg-[#FEF9C3]',
            colorBorder: 'border-[#FEF08A]',
            titulo: 'Emite este Comprobante',
            desc: 'Llena este Recibo de Anticipo indicando el monto exacto en Bolívares, el número de referencia de 9 dígitos de Banesco y la tasa BCV del día.'
          },
          {
            paso: 'Paso 4. Asiento Contable',
            colorBg: 'bg-[#FCE7F3]',
            colorBorder: 'border-[#FBCFE8]',
            titulo: 'Registra Pasivo 2.1.04.01',
            desc: 'El contador carga a Banco Banesco (1.1.01.02) y abona a Anticipos Recibidos de Clientes (2.1.04.01). Aún no genera Débito Fiscal IVA.'
          },
          {
            paso: 'Paso 5. Cierre con Factura',
            colorBg: 'bg-[#F3E8FF]',
            colorBorder: 'border-[#E9D5FF]',
            titulo: 'Cruza al Entregar el Café',
            desc: 'Cuando el café cruza de Colombia y se entrega, emites la Factura SENIAT (Café + Flete) y aplicas este Recibo para dejar el saldo en cero.'
          }
        ].map((item, idx) => (
          <div
            key={idx}
            className={`${item.colorBg} border ${item.colorBorder} rounded-xl p-4 flex flex-col justify-between`}
          >
            <div>
              <span className="text-xs font-bold text-[#44403C] block mb-1">{item.paso}</span>
              <h3 className="text-sm font-bold text-[#1C1917] mb-1.5">{item.titulo}</h3>
              <p className="text-xs text-[#44403C] leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Editor rápido de membrete (no-print) */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 no-print">
        <h3 className="text-sm font-bold text-[#1C1917] mb-3">
          Personalizar Datos de Tu Empresa para el Recibo Pre-llenado
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#57534E] mb-1">
              Razón Social de tu Empresa Agrícola
            </label>
            <input
              type="text"
              value={empresaEmisora}
              onChange={(e) => setEmpresaEmisora(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#D6D3D1] rounded-lg focus:outline-none focus:border-[#1C1917]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#57534E] mb-1">RIF de tu Empresa</label>
            <input
              type="text"
              value={rifEmisora}
              onChange={(e) => setRifEmisora(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono border border-[#D6D3D1] rounded-lg focus:outline-none focus:border-[#1C1917]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#57534E] mb-1">
              Dirección Fiscal en Venezuela
            </label>
            <input
              type="text"
              value={domicilioEmisora}
              onChange={(e) => setDomicilioEmisora(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#D6D3D1] rounded-lg focus:outline-none focus:border-[#1C1917]"
            />
          </div>
        </div>
      </div>

      {/* EL RECIBO OFICIAL PRE-LLENADO (Imprimible) */}
      <div className="print-sheet bg-white border border-[#D6D3D1] rounded-2xl p-8 lg:p-10 shadow-sm max-w-5xl mx-auto">
        {/* Cabecera del Recibo */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-[#E7E5E4] gap-4">
          <div>
            <div className="text-xs font-semibold text-[#15803D] mb-1">
              DOCUMENTO CONTABLE DE CONTROL INTERNO · NORMA NIIF 15 / VEN-NIF
            </div>
            <h3 className="text-2xl font-bold text-[#1C1917] font-display">{empresaEmisora}</h3>
            <p className="text-xs text-[#57534E] mt-0.5">
              RIF: <span className="font-mono font-semibold text-[#1C1917]">{rifEmisora}</span> · Giro: Operaciones Agrícolas, Suministro y Logística de Café
            </p>
            <p className="text-xs text-[#57534E]">{domicilioEmisora}</p>
          </div>

          <div className="bg-[#DCFCE7] border border-[#86EFAC] rounded-xl p-4 text-right min-w-[260px]">
            <div className="text-xs font-bold text-[#166534]">COMPROBANTE DE ANTICIPO EN VENTAS</div>
            <div className="text-lg font-bold font-mono text-[#14532D] mt-0.5">
              N° {currentOp.reciboAnticipoNro}
            </div>
            <div className="text-xs text-[#166534] mt-1 font-mono font-bold">
              ID Único: {currentOp.uidUnico}
            </div>
            <div className="text-xs text-[#166534] font-mono">
              Fecha y Hora: {formatDateDDMMYYYY(currentOp.fechaAnticipo)} · {currentOp.horaTransferencia}
            </div>
          </div>
        </div>

        {/* Sección 1: Identificación del Cliente / Asociado Cafetalero */}
        <div className="py-6 border-b border-[#E7E5E4]">
          <h4 className="text-xs font-bold text-[#57534E] mb-3">
            1. DATOS DEL TERCERO O ASOCIADO (TITULAR DE LA CUENTA BANCARIA DE ORIGEN)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#FAF8F5] p-4 rounded-xl border border-[#E7E5E4]">
            <div>
              <span className="text-xs text-[#57534E] block">Nombre del Tercero o Asociado:</span>
              <span className="text-sm font-bold text-[#1C1917]">{currentOp.clienteNombre}</span>
            </div>
            <div>
              <span className="text-xs text-[#57534E] block">Cédula / RIF Verificado SENIAT:</span>
              <span className="text-sm font-bold font-mono text-[#1C1917]">{currentOp.clienteRif}</span>
            </div>
            <div>
              <span className="text-xs text-[#57534E] block">N° Cuenta de Origen (20 dígitos):</span>
              <span className="text-xs font-bold font-mono text-[#0369A1]">{currentOp.numeroCuentaOrigen}</span>
            </div>
            <div>
              <span className="text-xs text-[#57534E] block">Propósito Declarado:</span>
              <span className="text-xs font-semibold text-[#1C1917]">{currentOp.propositoAnticipo}</span>
            </div>
          </div>
        </div>

        {/* Sección 2: Trazabilidad Bancaria en Banesco */}
        <div className="py-6 border-b border-[#E7E5E4]">
          <h4 className="text-xs font-bold text-[#57534E] mb-3">
            2. RASTRO DEL EFECTIVO Y CONCILIACIÓN BANCARIA (ENTRADA EN BOLÍVARES A BANESCO)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3.5 bg-[#E0F2FE]/50 border border-[#BAE6FD] rounded-xl">
              <span className="text-xs text-[#0369A1] block">Banco Emisor del Cliente</span>
              <span className="text-xs font-bold text-[#0C4A6E] mt-1 block">{currentOp.bancoOrigen}</span>
            </div>
            <div className="p-3.5 bg-[#E0F2FE]/50 border border-[#BAE6FD] rounded-xl">
              <span className="text-xs text-[#0369A1] block">Cuenta Banesco Receptora</span>
              <span className="text-xs font-bold font-mono text-[#0C4A6E] mt-1 block">
                {currentOp.cuentaBanescoReceptora}
              </span>
            </div>
            <div className="p-3.5 bg-[#E0F2FE]/50 border border-[#BAE6FD] rounded-xl">
              <span className="text-xs text-[#0369A1] block">N° Referencia Banesco</span>
              <span className="text-sm font-bold font-mono text-[#0C4A6E] mt-0.5 block">
                #{currentOp.referenciaBanesco}
              </span>
            </div>
            <div className="p-3.5 bg-[#DCFCE7] border border-[#86EFAC] rounded-xl">
              <span className="text-xs text-[#166534] block">Monto Recibido en Bolívares</span>
              <span className="text-base font-bold font-mono text-[#14532D] mt-0.5 block">
                Bs. {currentOp.montoAnticipoVES.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#FAF8F5] p-4 rounded-xl border border-[#E7E5E4]">
            <div>
              <span className="text-xs text-[#57534E] block">Tasa Oficial BCV Fecha Anticipo:</span>
              <span className="text-sm font-mono font-bold text-[#1C1917]">
                Bs. {currentOp.tasaBcvAnticipo.toFixed(2)} / USD
              </span>
            </div>
            <div>
              <span className="text-xs text-[#57534E] block">Equivalente Referencial del Anticipo:</span>
              <span className="text-sm font-mono font-bold text-[#1C1917]">
                USD {equivalenteRefUSD.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-xs text-[#57534E] block">Pacto Mesa de Cambio Banesco Vinculado:</span>
              <span className="text-sm font-mono font-bold text-[#15803D]">
                {currentOp.codigoPactoBanesco} (USD {currentOp.montoAdjudicadoUSD.toLocaleString('es-VE', { minimumFractionDigits: 2 })})
              </span>
            </div>
          </div>
        </div>

        {/* Sección 3: Especificación del Pedido de Café y Flete */}
        <div className="py-6 border-b border-[#E7E5E4]">
          <h4 className="text-xs font-bold text-[#57534E] mb-3">
            3. DETALLE DEL LOTE DE CAFÉ Y FLETE INTERNACIONAL RESERVADO CON ESTE ANTICIPO
          </h4>
          <p className="text-xs text-[#44403C] mb-4 leading-relaxed">{conceptoAdicional}</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-[#E7E5E4] text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E7E5E4] text-[#44403C]">
                  <th className="py-2.5 px-3 font-bold">Renglón / Concepto</th>
                  <th className="py-2.5 px-3 font-bold">Origen / Ruta</th>
                  <th className="py-2.5 px-3 font-bold text-right">Cantidad</th>
                  <th className="py-2.5 px-3 font-bold text-right">Equiv. USD</th>
                  <th className="py-2.5 px-3 font-bold text-right">Tratamiento Fiscal al Facturar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                <tr>
                  <td className="py-3 px-3 font-semibold text-[#1C1917]">
                    Reserva de Suministro: {currentOp.variedadCafe}
                  </td>
                  <td className="py-3 px-3 text-[#44403C]">{currentOp.origenCafe}</td>
                  <td className="py-3 px-3 text-right font-mono font-semibold">
                    {currentOp.quintalesComprados} QQ ({currentOp.quintalesComprados * 46} Kg)
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    ${currentOp.costoCafeUSD.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right text-[#15803D] font-medium">
                    Exento de IVA (Art. 18 Ley IVA)
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-[#1C1917]">
                    Provisión de Flete Terrestre y Trámites Aduanales
                  </td>
                  <td className="py-3 px-3 text-[#44403C]">
                    Colombia → Aduana San Antonio/Ureña → Planta Cliente
                  </td>
                  <td className="py-3 px-3 text-right font-mono">1 Viaje / Lote</td>
                  <td className="py-3 px-3 text-right font-mono">
                    ${currentOp.fleteInternacionalUSD.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right text-[#9A3412] font-medium">
                    Sujeto a Retención ISLR 3% (Decreto 1.808)
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-[#FAF8F5] font-bold text-[#1C1917]">
                  <td colSpan={3} className="py-3 px-3 text-right">
                    TOTAL ANTICIPO RECIBIDO EN CUENTA BANESCO (PASIVO 2.1.04.01):
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    USD {currentOp.montoAdjudicadoUSD.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-[#15803D]">
                    Bs. {currentOp.montoAnticipoVES.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Sección 4: Asiento Contable Impreso en el mismo comprobante */}
        <div className="py-6 border-b border-[#E7E5E4]">
          <h4 className="text-xs font-bold text-[#57534E] mb-3">
            4. CODIFICACIÓN CONTABLE AUTOMÁTICA (VEN-NIF) PARA AUDITORÍA SENIAT Y SUDEBAN
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E7E5E4]">
              <div className="font-bold text-[#1C1917] mb-1">
                Asiento N° 1 (Al entrar la transferencia a Banesco):
              </div>
              <div className="flex justify-between font-mono py-1 border-b border-[#E7E5E4]">
                <span>DEBE: 1.1.01.02.01 Banco Banesco Cta. Cte. Bs.</span>
                <span>Bs. {currentOp.montoAnticipoVES.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-mono py-1 pt-1.5 text-[#15803D]">
                <span>HABER: 2.1.04.01.01 Anticipos Recibidos de Clientes</span>
                <span>Bs. {currentOp.montoAnticipoVES.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E7E5E4]">
              <div className="font-bold text-[#1C1917] mb-1">
                Asiento N° 2 (Al adjudicar Banesco Mesa de Cambio):
              </div>
              <div className="flex justify-between font-mono py-1 border-b border-[#E7E5E4]">
                <span>DEBE: 1.1.01.03.01 Banesco Cuenta Custodia USD</span>
                <span>Bs. {(currentOp.montoAnticipoVES - currentOp.comisionBanescoVES).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-mono py-1 border-b border-[#E7E5E4]">
                <span>DEBE: 5.3.01.02 Gasto Comisión Mesa Cambio Banesco</span>
                <span>Bs. {currentOp.comisionBanescoVES.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-mono py-1 pt-1.5 text-[#0369A1]">
                <span>HABER: 1.1.01.02.01 Banco Banesco Cta. Cte. Bs.</span>
                <span>Bs. {currentOp.montoAnticipoVES.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cláusula de Blindaje Legal y Firmas */}
        <div className="pt-6 space-y-6">
          <div className="bg-[#FEF9C3]/60 border border-[#FDE047] rounded-xl p-4 text-xs text-[#44403C] leading-relaxed">
            <strong>DECLARACIÓN DE BLINDAJE CAMBIARIO Y FISCAL (CONVENIO CAMBIARIO N° 1 BCV / SUDEBAN):</strong> El firmante declara bajo fe de juramento que los fondos entregados provienen de cuentas bancarias de su titularidad legítima producto de su actividad agropecuaria en Venezuela, y se entregan exclusivamente como <strong>Anticipo Comercial para el Suministro de Café y Flete Internacional</strong>. La compra posterior de divisas en la Mesa de Cambio de Banesco Banco Universal es realizada por cuenta propia de <strong>{empresaEmisora}</strong> para cancelar a proveedores internacionales de materia prima agrícola, cerrándose el ciclo con la Factura Fiscal SENIAT al momento de la entrega física en Venezuela.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
            <div className="border-t border-[#1C1917] pt-3 text-center">
              <p className="text-xs font-bold text-[#1C1917]">POR {empresaEmisora}</p>
              <p className="text-xs text-[#57534E]">Administración y Cumplimiento · Sello Húmedo</p>
            </div>
            <div className="border-t border-[#1C1917] pt-3 text-center">
              <p className="text-xs font-bold text-[#1C1917]">CONFORME: {currentOp.clienteNombre}</p>
              <p className="text-xs text-[#57534E]">
                RIF / C.I.: {currentOp.clienteRif} · Huella y Firma Titular
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
