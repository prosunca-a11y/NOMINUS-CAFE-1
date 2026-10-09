import React, { useState } from 'react';
import { CompanyProfile, CashTrailOperation } from '../data/nominusData';
import { Building2, Plus, Layers, CheckCircle2, Edit3 } from 'lucide-react';

interface MultiCompanyManagerBarProps {
  companies: CompanyProfile[];
  selectedCompanyId: string; // 'ALL' para Vista Consolidada Multiempresa o ID de empresa
  operations: CashTrailOperation[];
  onSelectCompany: (id: string) => void;
  onAddCompany: (newComp: CompanyProfile) => void;
  onUpdateCompany: (updated: CompanyProfile) => void;
}

export const MultiCompanyManagerBar: React.FC<MultiCompanyManagerBarProps> = ({
  companies,
  selectedCompanyId,
  operations,
  onSelectCompany,
  onAddCompany,
  onUpdateCompany,
}) => {
  const [showManageModal, setShowManageModal] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);

  // Estado del formulario para agregar o editar empresa
  const [razonSocial, setRazonSocial] = useState('');
  const [codigoCorto, setCodigoCorto] = useState('');
  const [rif, setRif] = useState('J-');
  const [sucursalPrincipal, setSucursalPrincipal] = useState('Barquisimeto / Portuguesa');
  const [cuentaBanescoVES, setCuentaBanescoVES] = useState('0134-0342-18-');
  const [cuentaBanescoUSD, setCuentaBanescoUSD] = useState(
    '0134-9801-44-0007192831 (Cuenta Custodia USD)'
  );
  const [cupoMensualUSD, setCupoMensualUSD] = useState('200000');
  const [domicilioFiscal, setDomicilioFiscal] = useState('');
  const [registroMercantil, setRegistroMercantil] = useState('');
  const [representanteLegal, setRepresentanteLegal] = useState('Director General');

  const startNewCompany = () => {
    setEditingCompanyId(null);
    setRazonSocial('');
    setCodigoCorto(`EMP-0${companies.length + 1}`);
    setRif('J-');
    setSucursalPrincipal('Barquisimeto / Acarigua');
    setCuentaBanescoVES('0134-0342-18-');
    setCuentaBanescoUSD('0134-9801-44-0007192831 (Cuenta Custodia USD)');
    setCupoMensualUSD('200000');
    setDomicilioFiscal('Zona Industrial, Galpón Principal, Venezuela');
    setRegistroMercantil('Registro Mercantil Primero, N° 22, Tomo 5-A');
    setRepresentanteLegal('Director General');
    setShowManageModal(true);
  };

  const startEditCompany = (comp: CompanyProfile) => {
    setEditingCompanyId(comp.id);
    setRazonSocial(comp.razonSocial);
    setCodigoCorto(comp.codigoCorto);
    setRif(comp.rif);
    setSucursalPrincipal(comp.sucursalPrincipal);
    setCuentaBanescoVES(comp.cuentaBanescoVES);
    setCuentaBanescoUSD(comp.cuentaBanescoUSD);
    setCupoMensualUSD(String(comp.cupoMensualMesaCambioUSD));
    setDomicilioFiscal(comp.domicilioFiscal);
    setRegistroMercantil(comp.registroMercantil);
    setRepresentanteLegal(comp.representanteLegal);
    setShowManageModal(true);
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!razonSocial.trim() || !rif.trim()) return;

    const payload: CompanyProfile = {
      id: editingCompanyId || `emp-${Date.now()}`,
      codigoCorto: codigoCorto.trim() || `EMP-0${companies.length + 1}`,
      razonSocial: razonSocial.trim().toUpperCase(),
      rif: rif.trim().toUpperCase(),
      sucursalPrincipal: sucursalPrincipal.trim() || 'Venezuela',
      cuentaBanescoVES:
        cuentaBanescoVES.trim().length >= 10
          ? cuentaBanescoVES.trim()
          : '0134-0342-18-3421099881',
      cuentaBanescoUSD:
        cuentaBanescoUSD.trim() || '0134-9801-44-0007192831 (Cuenta Custodia USD)',
      cupoMensualMesaCambioUSD: parseFloat(cupoMensualUSD) || 200000,
      domicilioFiscal:
        domicilioFiscal.trim() || 'Zona Agroindustrial Principal, Venezuela',
      registroMercantil:
        registroMercantil.trim() || 'Registro Mercantil Primero, Tomo 10-A',
      representanteLegal: representanteLegal.trim() || 'Representante Legal',
    };

    if (editingCompanyId) {
      onUpdateCompany(payload);
    } else {
      onAddCompany(payload);
      onSelectCompany(payload.id);
    }
    setShowManageModal(false);
  };

  const pastelCards = [
    {
      bg: 'bg-[#DCFCE7]/80 hover:bg-[#DCFCE7]',
      active: 'bg-[#DCFCE7] ring-2 ring-[#15803D]',
      border: 'border-[#86EFAC]',
      accent: 'text-[#14532D]',
    },
    {
      bg: 'bg-[#E0F2FE]/80 hover:bg-[#E0F2FE]',
      active: 'bg-[#E0F2FE] ring-2 ring-[#0369A1]',
      border: 'border-[#7DD3FC]',
      accent: 'text-[#0C4A6E]',
    },
    {
      bg: 'bg-[#FEF9C3]/80 hover:bg-[#FEF9C3]',
      active: 'bg-[#FEF9C3] ring-2 ring-[#A16207]',
      border: 'border-[#FDE047]',
      accent: 'text-[#713F12]',
    },
    {
      bg: 'bg-[#FCE7F3]/80 hover:bg-[#FCE7F3]',
      active: 'bg-[#FCE7F3] ring-2 ring-[#BE185D]',
      border: 'border-[#F9A8D4]',
      accent: 'text-[#831843]',
    },
  ];

  return (
    <div className="bg-white/95 border border-[#D6D3D1] rounded-2xl p-5 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#E7E5E4] pb-3.5">
        <div>
          <span className="text-xs font-bold text-[#15803D]">
            ARQUITECTURA MULTIEMPRESA ACTIVA · GESTIÓN SIMULTÁNEA DE SOCIEDADES Y CUPOS BANESCO
          </span>
          <h2 className="text-base font-bold text-[#1C1917] font-display">
            Selector de Empresa Activa o Consola Consolidada del Grupo Cafetalero ({companies.length} Empresas Registradas)
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onSelectCompany('ALL')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              selectedCompanyId === 'ALL'
                ? 'bg-[#1C1917] text-white border-[#1C1917]'
                : 'bg-[#FAF8F5] text-[#1C1917] border-[#D6D3D1] hover:bg-[#F5F5F4]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Vista Consolidada (Todas las Empresas a la Vez)
          </button>

          <button
            type="button"
            onClick={startNewCompany}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#DCFCE7] border border-[#86EFAC] text-[#14532D] rounded-xl text-xs font-bold hover:bg-[#BBF7D0] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar Nueva Empresa
          </button>
        </div>
      </div>

      {/* Tarjetas de Empresas Registradas con Monitor de Cupo USD en Banesco */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {companies.map((comp, index) => {
          const isSelected = selectedCompanyId === comp.id;
          const style = pastelCards[index % pastelCards.length];
          const compOps = operations.filter((o) => o.empresaId === comp.id);
          const totalVES = compOps.reduce((sum, o) => sum + o.montoAnticipoVES, 0);
          const totalUSD = compOps.reduce((sum, o) => sum + o.montoAdjudicadoUSD, 0);
          const porcentajeCupo = Math.min(
            100,
            Math.round((totalUSD / (comp.cupoMensualMesaCambioUSD || 1)) * 100)
          );

          return (
            <div
              key={comp.id}
              onClick={() => onSelectCompany(comp.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                style.border
              } ${isSelected ? style.active : style.bg}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold text-[#44403C]">
                    {comp.codigoCorto} · RIF: {comp.rif}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditCompany(comp);
                    }}
                    title="Editar datos fiscales y cuentas Banesco de esta empresa"
                    className="p-1 rounded-lg bg-white/80 hover:bg-white text-[#44403C] cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className={`text-sm font-bold ${style.accent} mt-1 leading-snug`}>
                  {comp.razonSocial}
                </h3>
                <p className="text-[11px] text-[#44403C] font-mono mt-0.5">
                  Banesco Bs.: {comp.cuentaBanescoVES}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-black/10 space-y-1.5 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-[#44403C]">Anticipos ({compOps.length} ops):</span>
                  <span className="font-bold text-[#1C1917]">
                    Bs. {totalVES.toLocaleString('es-VE', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-[#44403C]">Cupo USD Banesco Usado:</span>
                  <span className="font-bold text-[#1C1917]">
                    ${totalUSD.toLocaleString('es-VE', { maximumFractionDigits: 0 })} / $
                    {comp.cupoMensualMesaCambioUSD.toLocaleString('es-VE', { maximumFractionDigits: 0 })} ({porcentajeCupo}%)
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal / Panel para Crear o Editar Empresa en el Sistema Multiempresa */}
      {showManageModal && (
        <form
          onSubmit={handleSaveCompany}
          className="bg-[#FAF8F5] border border-[#D6D3D1] rounded-2xl p-5 space-y-4 mt-3"
        >
          <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-3">
            <h3 className="text-sm font-bold text-[#1C1917] font-display">
              {editingCompanyId
                ? 'Editar Datos Fiscales y Cuentas Banesco de la Empresa'
                : 'Registrar Nueva Empresa en NOMINUS CAFÉ 1 (Multiempresa)'}
            </h3>
            <button
              type="button"
              onClick={() => setShowManageModal(false)}
              className="text-xs font-semibold text-[#57534E] hover:text-[#1C1917] cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#44403C] mb-1">
                Razón Social de la Empresa (SENIAT)
              </label>
              <input
                type="text"
                required
                placeholder="Ej. INVERSIONES CAFETALERAS DEL CENTRO, C.A."
                value={razonSocial}
                onChange={(e) => setRazonSocial(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D6D3D1] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-1">
                RIF Jurídico (J-)
              </label>
              <input
                type="text"
                required
                placeholder="J-50192834-1"
                value={rif}
                onChange={(e) => setRif(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#D6D3D1] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-1">
                Código Corto Interno
              </label>
              <input
                type="text"
                required
                placeholder="CAFE-04"
                value={codigoCorto}
                onChange={(e) => setCodigoCorto(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#D6D3D1] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-1">
                Cuenta Corriente Banesco Bs. (20 dígitos)
              </label>
              <input
                type="text"
                required
                value={cuentaBanescoVES}
                onChange={(e) => setCuentaBanescoVES(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#D6D3D1] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-1">
                Cuenta Custodia USD Banesco
              </label>
              <input
                type="text"
                required
                value={cuentaBanescoUSD}
                onChange={(e) => setCuentaBanescoUSD(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#D6D3D1] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-1">
                Cupo Mensual Asignado Mesa de Cambio (USD)
              </label>
              <input
                type="number"
                required
                value={cupoMensualUSD}
                onChange={(e) => setCupoMensualUSD(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-[#D6D3D1] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-1">
                Sucursal / Región Operativa
              </label>
              <input
                type="text"
                value={sucursalPrincipal}
                onChange={(e) => setSucursalPrincipal(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D6D3D1] rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#44403C] mb-1">
                Domicilio Fiscal Completo (Para Recibos y Facturas SENIAT)
              </label>
              <input
                type="text"
                value={domicilioFiscal}
                onChange={(e) => setDomicilioFiscal(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D6D3D1] rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#44403C] mb-1">
                Datos de Registro Mercantil (Para Contratos de Blindaje)
              </label>
              <input
                type="text"
                value={registroMercantil}
                onChange={(e) => setRegistroMercantil(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D6D3D1] rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#1C1917] text-white text-xs font-semibold rounded-xl hover:bg-[#292524] transition-colors cursor-pointer"
            >
              {editingCompanyId ? 'Guardar Cambios de la Empresa' : 'Crear y Activar Empresa'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
