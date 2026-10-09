import React, { useState, useEffect } from 'react';
import { INITIAL_VIGILANTES, VigilanteWorker, CompanyProfile } from '../data/nominusData';
import { Printer } from 'lucide-react';

interface VigilantesPayrollViewProps {
  companies: CompanyProfile[];
  selectedCompanyId: string;
  vigilantes: VigilanteWorker[];
  onAddVigilante: (vig: VigilanteWorker) => void;
  tasaBcvActual: number;
}

export const VigilantesPayrollView: React.FC<VigilantesPayrollViewProps> = ({
  companies,
  selectedCompanyId,
  vigilantes,
  onAddVigilante,
  tasaBcvActual,
}) => {
  const [selectedVigId, setSelectedVigId] = useState<string>(
    INITIAL_VIGILANTES[0]?.id || ''
  );

  // Formulario para agregar nuevo vigilante
  const [nuevaEmpresaId, setNuevaEmpresaId] = useState<string>(
    selectedCompanyId === 'ALL' ? companies[0].id : selectedCompanyId
  );
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaCedula, setNuevaCedula] = useState('');
  const [nuevaUbicacion, setNuevaUbicacion] = useState('Galpón Principal — Agrícola Oni, C.A.');
  const [nuevoBasicoVES, setNuevoBasicoVES] = useState('4200');
  const [nuevoBonoUSD, setNuevoBonoUSD] = useState('130');

  useEffect(() => {
    if (selectedCompanyId !== 'ALL') {
      setNuevaEmpresaId(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  const scopedVigilantes =
    selectedCompanyId === 'ALL'
      ? vigilantes
      : vigilantes.filter((v) => v.empresaId === selectedCompanyId);

  const currentVig =
    scopedVigilantes.find((v) => v.id === selectedVigId) ||
    scopedVigilantes[0] ||
    vigilantes[0];

  const getCompanyById = (empId: string) =>
    companies.find((c) => c.id === empId) || companies[0];

  const currentVigCompany = currentVig
    ? getCompanyById(currentVig.empresaId)
    : getCompanyById(nuevaEmpresaId);

  const calculatePayroll = (v: VigilanteWorker) => {
    const salarioDiario = v.salarioBasicoMensualVES / 30;
    const salarioHoraDiurna = salarioDiario / 8;

    // Art. 117 LOTTT: Bono Nocturno = 30% recargo sobre salario hora normal
    const recargoHoraNocturna = salarioHoraDiurna * 0.30;
    const totalBonoNocturnoVES = v.horasNocturnasMes * recargoHoraNocturna;

    // Art. 118 LOTTT: Horas Extraordinarias = 50% recargo (1.5x valor hora)
    const valorHoraExtra = salarioHoraDiurna * 1.50;
    const totalHorasExtrasVES = v.horasExtrasMes * valorHoraExtra;

    // Art. 120 LOTTT: Domingos / Feriados trabajados = 1.5x salario diario adicional
    const totalDomingosFeriadosVES = v.domingosFeriadosTrabajados * (salarioDiario * 1.50);

    const totalSalarioNormalGrabableVES =
      v.salarioBasicoMensualVES +
      totalBonoNocturnoVES +
      totalHorasExtrasVES +
      totalDomingosFeriadosVES;

    // Deducciones de Ley Venezolana (Trabajador)
    const ivss4Porciento = totalSalarioNormalGrabableVES * 0.04;
    const rpeParoForzoso = totalSalarioNormalGrabableVES * 0.005;
    const faovBanavih = totalSalarioNormalGrabableVES * 0.01;
    const totalDeduccionesVES = ivss4Porciento + rpeParoForzoso + faovBanavih;

    // Beneficios de Alimentación y Bonificación de Resguardo (a Tasa BCV)
    const cestaticketVES = v.cestaticketUSD * tasaBcvActual;
    const bonoResguardoVES = v.bonoProductividadResguardoUSD * tasaBcvActual;

    const netoAPagarBanescoVES =
      totalSalarioNormalGrabableVES - totalDeduccionesVES + cestaticketVES + bonoResguardoVES;
    const equivalenteTotalUSD = netoAPagarBanescoVES / tasaBcvActual;

    return {
      salarioDiario,
      salarioHoraDiurna,
      totalBonoNocturnoVES,
      totalHorasExtrasVES,
      totalDomingosFeriadosVES,
      totalSalarioNormalGrabableVES,
      ivss4Porciento,
      rpeParoForzoso,
      faovBanavih,
      totalDeduccionesVES,
      cestaticketVES,
      bonoResguardoVES,
      netoAPagarBanescoVES,
      equivalenteTotalUSD,
    };
  };

  const currentCalc = currentVig ? calculatePayroll(currentVig) : null;

  const handleAddVigilante = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim() || !nuevaCedula.trim()) return;
    const newWorker: VigilanteWorker = {
      id: `vig-${Date.now()}`,
      empresaId: nuevaEmpresaId,
      nombre: nuevoNombre.trim(),
      cedula: nuevaCedula.trim(),
      cargo: 'Vigilante de Resguardo Agroindustrial',
      ubicacionFinca: nuevaUbicacion,
      turnoModalidad: 'Rotativo 12x12 (Guardia Diurna/Nocturna)',
      salarioBasicoMensualVES: parseFloat(nuevoBasicoVES) || 4000,
      diasTrabajadosMes: 30,
      horasNocturnasMes: 90,
      horasExtrasMes: 14,
      domingosFeriadosTrabajados: 4,
      cestaticketUSD: 40,
      bonoProductividadResguardoUSD: parseFloat(nuevoBonoUSD) || 120,
    };
    onAddVigilante(newWorker);
    setSelectedVigId(newWorker.id);
    setNuevoNombre('');
    setNuevaCedula('');
  };

  return (
    <div className="space-y-8">
      {/* ExplicaciónExperta: Cómo pagan las empresas cafetaleras a sus vigilantes en Venezuela */}
      <div className="bg-[#FCE7F3] border border-[#FBCFE8] rounded-2xl p-6 no-print">
        <div className="max-w-4xl space-y-2">
          <p className="text-xs font-semibold text-[#9D174D]">
            Cumplimiento Laboral Agroindustrial en Venezuela · LOTTT, INPSASEL e IVSS
          </p>
          <h2 className="text-2xl font-bold text-[#831843] font-display">
            ¿Cómo le Pagan las Empresas Cafetaleras y de Acopio a sus Vigilantes en Venezuela?
          </h2>
          <p className="text-sm text-[#831843] leading-relaxed">
            En las comercializadoras de café, trilladoras y centros de acopio en Venezuela (Lara, Portuguesa, Táchira, Mérida y Trujillo), los <strong>vigilantes y celadores rurales</strong> resguardan lotes de café en grano de alto valor en dólares. Para cumplir con la <strong>LOTTT (Arts. 117, 118, 120 y 176)</strong> y a la vez ofrecer un ingreso competitivo sin descapitalizar el pasivo laboral, las empresas estructuran el pago mediante <strong>Esquema Mixto Blindado por Banesco Nómina</strong>:
          </p>
        </div>
      </div>

      {/* 4 Claves del Esquema de Pago a Vigilantes en Venezuela */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <div className="bg-[#E0F2FE] border border-[#BAE6FD] rounded-xl p-4">
          <div className="text-xs font-bold text-[#0369A1] mb-1">
            1. Turnos Rotativos (Art. 176 LOTTT)
          </div>
          <p className="text-xs text-[#0C4A6E] leading-relaxed">
            Se emplean guardias <strong>12x12 o 24x48</strong> en galpones y patios de secado. El horario continuo o por turnos no puede exceder los límites legales semanales promediados en 8 semanas sin pagar las horas extraordinarias correspondientes.
          </p>
        </div>

        <div className="bg-[#FEF9C3] border border-[#FEF08A] rounded-xl p-4">
          <div className="text-xs font-bold text-[#854D0E] mb-1">
            2. Bono Nocturno 30% y Domingos
          </div>
          <p className="text-xs text-[#713F12] leading-relaxed">
            Toda hora entre <strong>7:00 PM y 5:00 AM</strong> lleva un recargo obligatorio del <strong>30% (Art. 117 LOTTT)</strong>. Los domingos y feriados trabajados se pagan con recargo del <strong>50% adicional (1.5x, Art. 120 LOTTT)</strong> más día compensatorio.
          </p>
        </div>

        <div className="bg-[#DCFCE7] border border-[#86EFAC] rounded-xl p-4">
          <div className="text-xs font-bold text-[#166534] mb-1">
            3. Cestaticket ($40 BCV) + Bono Resguardo
          </div>
          <p className="text-xs text-[#14532D] leading-relaxed">
            Además del Salario Básico y recargos de ley en Bs., se paga el <strong>Cestaticket Socialista (equiv. USD 40 a tasa BCV)</strong> y una <strong>Bonificación de Resguardo de Cosecha / Incentivo de Asistencia Perfecta</strong> indexada a tasa BCV.
          </p>
        </div>

        <div className="bg-[#F3E8FF] border border-[#E9D5FF] rounded-xl p-4">
          <div className="text-xs font-bold text-[#6B21A8] mb-1">
            4. Pago por Banesco Pago Electrónico
          </div>
          <p className="text-xs text-[#581C87] leading-relaxed">
            Se dispersa quincenalmente desde la misma cuenta corriente Banesco de la empresa mediante archivo TXT de Nómina, reteniendo <strong>IVSS (4%), FAOV (1%) y Paro Forzoso RPE (0.5%)</strong>, deducible del ISLR de la empresa.
          </p>
        </div>
      </div>

      {/* Tabla General de Vigilantes + Formulario de Nuevo Vigilante */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 no-print">
        <div className="lg:col-span-8 bg-white border border-[#E7E5E4] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#1C1917] font-display">
              Nómina Activa de Vigilantes y Seguridad Rural (Tasa BCV: Bs. {tasaBcvActual.toFixed(2)})
            </h3>
            <span className="text-xs text-[#57534E]">
              Haz clic en un vigilante para ver e imprimir su Recibo LOTTT
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E7E5E4] text-[#57534E]">
                  <th className="py-2.5 px-3 font-semibold">Vigilante / Cédula</th>
                  <th className="py-2.5 px-3 font-semibold">Esquema / Centro de Acopio</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Salario + Recargos</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Cestaticket + Bono</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Neto Banesco Bs.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {scopedVigilantes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 px-4 text-center bg-[#FAF8F5] text-[#44403C]">
                      <div className="font-bold text-[#14532D] mb-1">
                        Nómina Limpia sin Personal Simulado ({currentVigCompany.razonSocial})
                      </div>
                      <p className="text-xs">
                        No hay trabajadores de prueba en la base de datos. Registra el personal real de vigilancia en el formulario de la derecha.
                      </p>
                    </td>
                  </tr>
                ) : (
                  scopedVigilantes.map((v) => {
                    const calc = calculatePayroll(v);
                    const active = v.id === currentVig?.id;
                    const emp = getCompanyById(v.empresaId);
                    return (
                      <tr
                        key={v.id}
                        onClick={() => setSelectedVigId(v.id)}
                        className={`cursor-pointer transition-colors ${
                          active ? 'bg-[#FFF7ED]' : 'hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="font-bold text-[#1C1917]">{v.nombre}</div>
                          <div className="font-mono text-[#57534E]">
                            {v.cedula} · {emp.codigoCorto}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-[#1C1917]">{v.turnoModalidad}</div>
                          <div className="text-[#57534E]">{v.ubicacionFinca}</div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          Bs. {calc.totalSalarioNormalGrabableVES.toLocaleString('es-VE', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-[#0369A1]">
                          Bs. {(calc.cestaticketVES + calc.bonoResguardoVES).toLocaleString('es-VE', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-[#15803D]">
                          Bs. {calc.netoAPagarBanescoVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          <span className="block text-[11px] text-[#57534E] font-normal">
                            (${calc.equivalenteTotalUSD.toFixed(2)} USD)
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Agregar Vigilante */}
        <form
          onSubmit={handleAddVigilante}
          className="lg:col-span-4 bg-white border border-[#E7E5E4] rounded-2xl p-5 space-y-3.5"
        >
          <h3 className="text-sm font-bold text-[#1C1917] font-display">
            Registrar Vigilante en Nómina Multiempresa
          </h3>
          <div>
            <label className="block text-xs font-semibold text-[#15803D] mb-1">
              Empresa Empleadora (Nómina Banesco)
            </label>
            <select
              value={nuevaEmpresaId}
              onChange={(e) => setNuevaEmpresaId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold bg-[#DCFCE7]/40 border border-[#86EFAC] rounded-lg text-[#14532D]"
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
              Nombre Completo del Vigilante
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Pedro José Alvarado"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#D6D3D1] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#57534E] mb-1">Cédula (V-)</label>
            <input
              type="text"
              required
              placeholder="Ej. V-16.442.910"
              value={nuevaCedula}
              onChange={(e) => setNuevaCedula(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono border border-[#D6D3D1] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#57534E] mb-1">
              Galpón o Finca Asignada
            </label>
            <input
              type="text"
              value={nuevaUbicacion}
              onChange={(e) => setNuevaUbicacion(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#D6D3D1] rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#57534E] mb-1">
                Salario Básico (Bs.)
              </label>
              <input
                type="number"
                value={nuevoBasicoVES}
                onChange={(e) => setNuevoBasicoVES(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border border-[#D6D3D1] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#57534E] mb-1">
                Bono Resguardo (USD)
              </label>
              <input
                type="number"
                value={nuevoBonoUSD}
                onChange={(e) => setNuevoBonoUSD(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border border-[#D6D3D1] rounded-lg"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-[#1C1917] text-white text-xs font-semibold rounded-xl hover:bg-[#292524] transition-colors cursor-pointer"
          >
            Agregar a Nómina de Vigilancia
          </button>
        </form>
      </div>

      {/* Recibo de Pago Individual de Vigilante (Imprimible) */}
      {currentVig && currentCalc && (
        <div className="print-sheet bg-white border border-[#D6D3D1] rounded-2xl p-6 lg:p-8 shadow-sm max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-[#E7E5E4] gap-4">
          <div>
            <span className="text-xs font-bold text-[#15803D]">
              RECIBO DE PAGO DE NÓMINA Y RESGUARDO AGROINDUSTRIAL (ART. 106 LOTTT)
            </span>
            <h3 className="text-xl font-bold text-[#1C1917] font-display mt-0.5">
              {currentVigCompany.razonSocial} — RIF {currentVigCompany.rif}
            </h3>
            <p className="text-xs text-[#57534E]">
              Trabajador: <strong>{currentVig.nombre}</strong> · C.I.:{' '}
              <span className="font-mono">{currentVig.cedula}</span> · Ubicación: {currentVig.ubicacionFinca}
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="no-print inline-flex items-center gap-2 px-4 py-2 bg-[#1C1917] text-white text-xs font-semibold rounded-xl hover:bg-[#292524] cursor-pointer whitespace-nowrap shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir Recibo Vigilante
          </button>
        </div>

        <div className="py-5 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs border border-[#E7E5E4]">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E7E5E4] text-[#44403C]">
                <th className="py-2 px-3 font-bold">Concepto Legal (LOTTT)</th>
                <th className="py-2 px-3 font-bold text-right">Cantidad / Base</th>
                <th className="py-2 px-3 font-bold text-right">Asignaciones (Bs.)</th>
                <th className="py-2 px-3 font-bold text-right">Deducciones (Bs.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5E4]">
              <tr>
                <td className="py-2.5 px-3 font-medium">Salario Básico Mensual de Vigilancia</td>
                <td className="py-2.5 px-3 text-right font-mono">{currentVig.diasTrabajadosMes} días</td>
                <td className="py-2.5 px-3 text-right font-mono">
                  {currentVig.salarioBasicoMensualVES.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-3 text-right font-mono">—</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">
                  Bono Nocturno 30% (Art. 117 LOTTT — Guardias Nocturnas)
                </td>
                <td className="py-2.5 px-3 text-right font-mono">{currentVig.horasNocturnasMes} horas</td>
                <td className="py-2.5 px-3 text-right font-mono">
                  {currentCalc.totalBonoNocturnoVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-3 text-right font-mono">—</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">
                  Horas Extraordinarias con Recargo 50% (Art. 118 LOTTT)
                </td>
                <td className="py-2.5 px-3 text-right font-mono">{currentVig.horasExtrasMes} horas</td>
                <td className="py-2.5 px-3 text-right font-mono">
                  {currentCalc.totalHorasExtrasVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-3 text-right font-mono">—</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">
                  Domingos y Feriados Trabajados en Galpón (Art. 120 LOTTT - 1.5x)
                </td>
                <td className="py-2.5 px-3 text-right font-mono">{currentVig.domingosFeriadosTrabajados} días</td>
                <td className="py-2.5 px-3 text-right font-mono">
                  {currentCalc.totalDomingosFeriadosVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-3 text-right font-mono">—</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-[#15803D]">
                  Cestaticket Socialista ($40 USD × Tasa BCV Bs. {tasaBcvActual.toFixed(2)})
                </td>
                <td className="py-2.5 px-3 text-right font-mono">Beneficio No Salarial</td>
                <td className="py-2.5 px-3 text-right font-mono text-[#15803D]">
                  {currentCalc.cestaticketVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-3 text-right font-mono">—</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-[#0369A1]">
                  Bonificación de Resguardo de Café e Incentivo (${currentVig.bonoProductividadResguardoUSD} USD BCV)
                </td>
                <td className="py-2.5 px-3 text-right font-mono">Asistencia 100%</td>
                <td className="py-2.5 px-3 text-right font-mono text-[#0369A1]">
                  {currentCalc.bonoResguardoVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-3 text-right font-mono">—</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-[#9A3412]">
                  Retención Seguro Social Obligatorio (IVSS 4%) + RPE (0.5%) + FAOV (1%)
                </td>
                <td className="py-2.5 px-3 text-right font-mono">5.5% total ley</td>
                <td className="py-2.5 px-3 text-right font-mono">—</td>
                <td className="py-2.5 px-3 text-right font-mono text-[#9A3412]">
                  - {currentCalc.totalDeduccionesVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-[#DCFCE7] font-bold text-[#14532D]">
                <td colSpan={2} className="py-3 px-3 text-right">
                  NETO A TRANSFERIR POR BANESCO NÓMINA (EQUIV. ${currentCalc.equivalenteTotalUSD.toFixed(2)} USD):
                </td>
                <td colSpan={2} className="py-3 px-3 text-right font-mono text-sm">
                  Bs. {currentCalc.netoAPagarBanescoVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      )}
    </div>
  );
};
