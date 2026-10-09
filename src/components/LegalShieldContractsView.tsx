import React, { useState, useEffect } from 'react';
import { LEGAL_TEMPLATES, CompanyProfile } from '../data/nominusData';
import { ShieldCheck, Printer, Copy, Check, Scale, Building2 } from 'lucide-react';

interface LegalShieldContractsViewProps {
  companies: CompanyProfile[];
  selectedCompanyId: string;
}

export const LegalShieldContractsView: React.FC<LegalShieldContractsViewProps> = ({
  companies,
  selectedCompanyId,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(LEGAL_TEMPLATES[0].id);
  const [copied, setCopied] = useState(false);
  const [contractCompanyId, setContractCompanyId] = useState<string>(
    selectedCompanyId === 'ALL' ? companies[0].id : selectedCompanyId
  );

  useEffect(() => {
    if (selectedCompanyId !== 'ALL') {
      setContractCompanyId(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  const activeCompany =
    companies.find((c) => c.id === contractCompanyId) || companies[0];

  // Parámetros personalizables para autocompletar en todos los contratos
  const [clienteNombre, setClienteNombre] = useState('Agropecuaria La Cumbre de Biscucuy, C.A.');
  const [clienteRif, setClienteRif] = useState('J-40918234-6');
  const [fincaNombre, setFincaNombre] = useState('Hacienda Cafetalera El Mirador de Portuguesa');
  const [runsaiCodigo, setRunsaiCodigo] = useState('RUNSAI-PORT-2025-88412');

  const activeTemplate =
    LEGAL_TEMPLATES.find((t) => t.id === selectedTemplateId) || LEGAL_TEMPLATES[0];

  const getPopulatedContractText = (raw: string) => {
    return raw
      .replace(/\{\{EMPRESA_RAZON_SOCIAL\}\}/g, activeCompany.razonSocial)
      .replace(/\{\{EMPRESA_RIF\}\}/g, activeCompany.rif)
      .replace(/\{\{EMPRESA_REGISTRO_MERCANTIL\}\}/g, activeCompany.registroMercantil)
      .replace(/\{\{EMPRESA_DOMICILIO\}\}/g, activeCompany.domicilioFiscal)
      .replace(/\{\{EMPRESA_REPRESENTANTE\}\}/g, activeCompany.representanteLegal)
      .replace(/\{\{EMPRESA_CUENTA_VES\}\}/g, activeCompany.cuentaBanescoVES)
      .replace(/\{\{EMPRESA_CUENTA_USD\}\}/g, activeCompany.cuentaBanescoUSD)
      .replace(
        '__________________________ (en lo adelante "EL CLIENTE ASOCIADO")',
        `${clienteNombre} (en lo adelante "EL CLIENTE ASOCIADO")`
      )
      .replace(
        'productor/empresa agroindustrial __________________________',
        `productor/empresa agroindustrial ${clienteNombre}`
      )
      .replace('titular del RIF N° ______________', `titular del RIF N° ${clienteRif}`)
      .replace('denominada "____________________"', `denominada "${fincaNombre}"`)
      .replace('código RUNSAI N° ______________', `código RUNSAI N° ${runsaiCodigo}`);
  };

  const populatedText = getPopulatedContractText(activeTemplate.contenidoCompleto);

  const handleCopy = () => {
    navigator.clipboard.writeText(populatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Cabecera de Blindaje Legal ante SENIAT, SUDEBAN y Banesco */}
      <div className="bg-[#DCFCE7] border border-[#86EFAC] rounded-2xl p-6 no-print">
        <div className="max-w-4xl space-y-2">
          <p className="text-xs font-semibold text-[#166534]">
            Blindaje Jurídico, Cambiario y Tributario · Convenio Cambiario N° 1 BCV & NIIF 15
          </p>
          <h2 className="text-2xl font-bold text-[#14532D] font-display">
            Centro de Blindaje Legal ante SENIAT, SUDEBAN y Banesco (Cero Ilícitos Cambiarios)
          </h2>
          <p className="text-sm text-[#166534] leading-relaxed">
            El secreto legal para que tu empresa agrícola jamás sea señalada de intermediación cambiaria consiste en demostrar documentalmente que <strong>no vendes dólares a terceros</strong>: tu empresa recibe un <strong>Anticipo en Ventas (Bs.)</strong> para suministrar un bien físico (Café en grano) y un servicio logístico (Flete desde Colombia), adquiere divisas lícitamente por Mesa de Cambio Banesco para pagar al proveedor extranjero, y cierra el ciclo con una <strong>Factura Fiscal SENIAT</strong>.
          </p>
        </div>
      </div>

      {/* 3 Pilares del Blindaje Explicados Claramente */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 no-print">
        <div className="bg-[#E0F2FE] border border-[#BAE6FD] rounded-2xl p-5">
          <div className="flex items-center gap-2 text-[#0369A1] font-bold text-sm mb-2">
            <Building2 className="w-4 h-4" />
            <span>1. Blindaje ante BANESCO y SUDEBAN</span>
          </div>
          <p className="text-xs text-[#0C4A6E] leading-relaxed">
            Cumple con la <strong>Resolución SUDEBAN 083.18</strong> (Debida Diligencia). Cada transferencia en Bolívares que entra a Banesco proviene exclusivamente de cuentas titulares del socio cafetalero, respaldada por su expediente KYC, RIF, Registro Mercantil/RUNSAI y Declaración de Origen Lícito de Fondos.
          </p>
        </div>

        <div className="bg-[#FEF9C3] border border-[#FEF08A] rounded-2xl p-5">
          <div className="flex items-center gap-2 text-[#854D0E] font-bold text-sm mb-2">
            <Scale className="w-4 h-4" />
            <span>2. Exclusión de Ilícito Cambiario (BCV)</span>
          </div>
          <p className="text-xs text-[#713F12] leading-relaxed">
            La Ley de Ilícitos Cambiarios fue derogada y sustituida por el <strong>Convenio Cambiario N° 1 del BCV (2018)</strong>. Operar por la <strong>Mesa de Cambio de Banesco</strong> es 100% legal siempre que los dólares adquiridos se utilicen en el giro propio de la empresa (importación de café y pago de flete internacional).
          </p>
        </div>

        <div className="bg-[#FCE7F3] border border-[#FBCFE8] rounded-2xl p-5">
          <div className="flex items-center gap-2 text-[#9D174D] font-bold text-sm mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>3. Blindaje Tributario ante el SENIAT</span>
          </div>
          <p className="text-xs text-[#831843] leading-relaxed">
            El anticipo en Bs. se contabiliza en <strong>Pasivo (2.1.04.01)</strong>. Al ingresar el café desde Colombia, emites la Factura Fiscal (Providencia 0071): el café en grano crudo va <strong>Exento de IVA (Art. 18 Ley IVA)</strong> y el flete sufre <strong>Retención del 3% de ISLR (Decreto 1.808)</strong>.
          </p>
        </div>
      </div>

      {/* Personalizador de variables del contrato */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 no-print">
        <h3 className="text-sm font-bold text-[#1C1917] mb-3">
          Empresa Suministradora y Datos del Cliente / Asociado para los 4 Modelos Legales
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#15803D] mb-1">
              Empresa Suministradora (Titular Banesco)
            </label>
            <select
              value={contractCompanyId}
              onChange={(e) => setContractCompanyId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold bg-[#DCFCE7]/50 border border-[#86EFAC] rounded-lg text-[#14532D]"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.codigoCorto} — {c.razonSocial.slice(0, 22)}...
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#57534E] mb-1">
              Razón Social o Nombre del Socio/Tercero
            </label>
            <input
              type="text"
              value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#D6D3D1] rounded-lg focus:outline-none focus:border-[#1C1917]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#57534E] mb-1">
              RIF / Cédula del Socio
            </label>
            <input
              type="text"
              value={clienteRif}
              onChange={(e) => setClienteRif(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono border border-[#D6D3D1] rounded-lg focus:outline-none focus:border-[#1C1917]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#57534E] mb-1">
              Nombre de la Finca o Torrefactora
            </label>
            <input
              type="text"
              value={fincaNombre}
              onChange={(e) => setFincaNombre(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#D6D3D1] rounded-lg focus:outline-none focus:border-[#1C1917]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#57534E] mb-1">
              Registro Agrícola RUNSAI / SICA
            </label>
            <input
              type="text"
              value={runsaiCodigo}
              onChange={(e) => setRunsaiCodigo(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono border border-[#D6D3D1] rounded-lg focus:outline-none focus:border-[#1C1917]"
            />
          </div>
        </div>
      </div>

      {/* Selector de Contratos y Visor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-3 no-print">
          {LEGAL_TEMPLATES.map((tpl) => {
            const isSelected = tpl.id === selectedTemplateId;
            return (
              <button
                key={tpl.id}
                onClick={() => setSelectedTemplateId(tpl.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FFF7ED] border-[#FB923C] shadow-sm'
                    : 'bg-white border-[#E7E5E4] hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="text-xs font-semibold text-[#9A3412] mb-1">
                  {tpl.entidadObjetivo}
                </div>
                <div className="text-sm font-bold text-[#1C1917] mb-1.5 leading-snug">
                  {tpl.titulo}
                </div>
                <p className="text-xs text-[#57534E] leading-relaxed">{tpl.resumenUso}</p>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-8">
          <div className="print-sheet bg-white border border-[#D6D3D1] rounded-2xl p-6 lg:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E5E4] no-print">
              <div>
                <span className="text-xs font-semibold text-[#15803D]">
                  {activeTemplate.entidadObjetivo}
                </span>
                <h3 className="text-lg font-bold text-[#1C1917] font-display">
                  {activeTemplate.titulo}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FAF8F5] border border-[#D6D3D1] rounded-xl text-xs font-semibold text-[#1C1917] hover:bg-[#F5F5F4] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#15803D]" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiado' : 'Copiar Contrato'}
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1C1917] text-white rounded-xl text-xs font-semibold hover:bg-[#292524] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir Modelo
                </button>
              </div>
            </div>

            {/* Puntos clave de blindaje incluidos */}
            <div className="bg-[#FAF8F5] border border-[#E7E5E4] rounded-xl p-4 no-print">
              <div className="text-xs font-bold text-[#1C1917] mb-2">
                Cláusulas de Blindaje Incluidas en este Instrumento:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {activeTemplate.clausulasClave.map((cl, i) => (
                  <div key={i} className="text-xs text-[#44403C] flex items-start gap-2">
                    <span className="text-[#15803D] font-bold">·</span>
                    <span>{cl}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Texto Legal Completo */}
            <div className="bg-[#FAF8F5]/50 border border-[#E7E5E4] rounded-xl p-6 font-serif text-sm text-[#1C1917] whitespace-pre-wrap leading-relaxed">
              {populatedText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
