export interface ExcelColumnSpec {
  columna: string;
  campo: string;
  formulaExcel: string;
  normaVenezolana: string;
  propositoBlindaje: string;
}

export const EXCEL_BLINDAJE_SPEC: ExcelColumnSpec[] = [
  {
    columna: 'Columna A - D',
    campo: 'ID Operación, Fecha, Razón Social y RIF del Cliente/Socio',
    formulaExcel: 'Validación de Lista contra Maestro KYC (RIF verificado en Portal SENIAT)',
    normaVenezolana: 'Resolución SUDEBAN 083.18 (Debida Diligencia del Cliente)',
    propositoBlindaje: 'Demuestra a Banesco que el depositante está plenamente identificado y es productor/comercializador del sector café.'
  },
  {
    columna: 'Columna E - G',
    campo: 'Banco Emisor, Ref. Banesco (9 dígitos) y Monto Recibido en Bs. (VES)',
    formulaExcel: '=VALOR(G2) conciliado con extracto MT940 / CSV de Banesco Juridico',
    normaVenezolana: 'NIC 7 (Estado de Flujos de Efectivo) / NIIF 15 (Pasivo por Contrato)',
    propositoBlindaje: 'Registra el ingreso en la cuenta corriente Banesco como Pasivo "Anticipo Recibido de Clientes" (Cuenta 2.1.04.01), nunca como ingreso cambiario.'
  },
  {
    columna: 'Columna H - K',
    campo: 'Fecha Pacto, Código Mesa de Cambio Banesco, Tasa Pactada y Comisión (0.25%)',
    formulaExcel: 'USD Adjudicados (Col L) = (G2 - J2) / I2',
    normaVenezolana: 'Convenio Cambiario N° 1 BCV (Libre Convertibilidad por Mesa de Cambio)',
    propositoBlindaje: 'Prueba ante SUDEBAN y el BCV que la compra de divisas se efectuó en el mercado cambiario formal y que los USD entraron a la Cuenta Custodia Banesco de la empresa.'
  },
  {
    columna: 'Columna M - P',
    campo: 'Proveedor en Colombia, NIT, Quintales (46 kg), Costo FOB USD y Estado INSAI',
    formulaExcel: 'Costo Total Lote USD (Col P) = Quintales * Precio_QQ_USD + Flete_USD',
    normaVenezolana: 'NIC 2 (Inventarios - Costos de Transformación e Importación) / Ley INSAI',
    propositoBlindaje: 'Vincula los USD salientes con mercancía real (café verde/pergamino en almacén Colombia o en tránsito fronterizo San Antonio/Ureña).'
  },
  {
    columna: 'Columna Q - U',
    campo: 'Nro. Factura SENIAT, Tasa BCV Cierre, Venta Café (Exento), Flete y Retención ISLR 3%',
    formulaExcel: 'Diferencial Cambiario (Col U) = (L2 * Tasa_BCV_Factura) - G2',
    normaVenezolana: 'Providencia SNAT/2011/0071, Art. 18 Ley IVA (Café Crudo Exento), Decreto 1.808 (ISLR 3% Flete)',
    propositoBlindaje: 'Cierra contablemente el Anticipo en Ventas contra la Factura Fiscal emitida en Venezuela y calcula los tributos exactos para el SENIAT.'
  }
];

export interface CompetitorAppAnalysis {
  nombre: string;
  categoria: string;
  manejoAnticiposBanesco: string;
  manejoFiscalSeniat: string;
  fortalezas: string[];
  debilidadesParaCafe: string;
}

export const COMPETITOR_APPS_VENEZUELA: CompetitorAppAnalysis[] = [
  {
    nombre: 'GALAC Software (Administrativo + Contabilidad + Retenciones)',
    categoria: 'Líder Tributario en Venezuela',
    manejoAnticiposBanesco: 'Permite registrar Anticipos de Clientes en Bs. y cruzarlos al facturar, pero no vincula automáticamente la compra en Mesa de Cambio Banesco ni el lote físico en Colombia.',
    manejoFiscalSeniat: 'Excelente generación de TXT de Retenciones de IVA, XML de ISLR (Decreto 1.808 código 053 Fletes), libros fiscales multimoneda e IGTF 3%.',
    fortalezas: [
      'Actualización inmediata ante gacetas del SENIAT.',
      'Asientos automáticos de diferencial cambiario según tasa BCV.',
      'Cálculo exacto de retenciones ISLR sobre fletes terrestres (3%).'
    ],
    debilidadesParaCafe: 'Interfaz gris de escritorio tradicional; no tiene trazabilidad de sacos/quintales en frontera ni generador de expediente SUDEBAN para proteger el cupo en dólares Banesco.'
  },
  {
    nombre: 'Profit Plus Administrativo / Contable (2K12 / Cloud)',
    categoria: 'ERP Corporativo Agroindustrial en Venezuela',
    manejoAnticiposBanesco: 'Módulo de Tesorería robusto para anticipos y conciliación bancaria con Banesco, manejo de cuentas custodia en USD y anticipos a proveedores extranjeros.',
    manejoFiscalSeniat: 'Cumple Providencia 0071, maneja artículos exentos (Café en grano verde Art. 18 Ley IVA) combinados con renglones de servicio de flete en una misma factura o facturas separadas.',
    fortalezas: [
      'Control de inventarios en tránsito e importaciones con prorrateo de fletes y aranceles.',
      'Manejo de múltiples sucursales (ej. Barquisimeto, Acarigua, San Cristóbal).'
    ],
    debilidadesParaCafe: 'Requiere consultoría costosa para parametrizar el rastro 1:1 del efectivo entre el socio cafetalero, el pacto de Mesa de Cambio y la guía INSAI.'
  },
  {
    nombre: 'Saint Enterprise Administrativo + Nómina',
    categoria: 'Pyme y Empresas Agrícolas Regionales (Lara, Portuguesa, Andes)',
    manejoAnticiposBanesco: 'Registra pagos adelantados en cuentas por cobrar, muy usado en distribuidoras agrícolas del occidente venezolano.',
    manejoFiscalSeniat: 'Emisión rápida de facturación fiscal y nómina LOTTT (incluyendo turnos de vigilancia rural).',
    fortalezas: [
      'Simplicidad operativa y módulo de Nómina altamente configurable para vigilantes y obreros rurales.',
      'Bajo consumo de recursos en zonas con internet inestable.'
    ],
    debilidadesParaCafe: 'No genera contratos de mandato/suministro ni alertas de cumplimiento bancario SUDEBAN.'
  },
  {
    nombre: 'Alegra Venezuela / Odoo Localización Venezolana',
    categoria: 'SaaS en la Nube Multimoneda',
    manejoAnticiposBanesco: 'Sincronización con tasa BCV diaria y anticipos recibidos en multimoneda.',
    manejoFiscalSeniat: 'Libros de ventas SENIAT en la nube y facturación electrónica/fiscal adaptada.',
    fortalezas: [
      'Experiencia visual moderna y acceso desde teléfonos en las fincas de café.',
      'Conversión instantánea Bs. / USD.'
    ],
    debilidadesParaCafe: 'Carece de blindaje jurídico específico contra ilícitos cambiarios y no documenta el ciclo binacional Colombia-Venezuela.'
  }
];

export interface UserFeedbackInsight {
  perfilUsuario: string;
  regionVenezuela: string;
  problemaCriticoDetectado: string;
  solucionEnNominusCafe1: string;
}

export const USER_NEEDS_INSIGHTS: UserFeedbackInsight[] = [
  {
    perfilUsuario: 'Gerente de Administración en Comercializadora Agrícola',
    regionVenezuela: 'Barquisimeto (Lara) / Acarigua (Portuguesa)',
    problemaCriticoDetectado: '"Cuando recibimos varias transferencias en Bolívares de socios cafetaleros en una misma semana y pedimos Mesa de Cambio en Banesco, Cumplimiento nos pide justificar en 24 horas el origen de los fondos o nos congelan el cupo en dólares."',
    solucionEnNominusCafe1: 'Generador de Dossier Banesco en 1 Clic: vincula cada referencia de transferencia Banesco con el Recibo de Anticipo en Ventas, el Contrato de Suministro y la Declaración Jurada SUDEBAN del socio.'
  },
  {
    perfilUsuario: 'Contador Público Colegiado (CPC) Asesor del Sector Café',
    regionVenezuela: 'San Cristóbal / Rubio (Táchira) y Mérida',
    problemaCriticoDetectado: '"El mayor dolor de cabeza es el Diferencial Cambiario: el cliente envía Bs. el lunes a tasa 36.40, Banesco adjudica los dólares el martes a 36.45, el café espera permiso INSAI en Cúcuta 5 días y facturamos el lunes siguiente a tasa BCV 36.85. Cuadrar el pasivo del anticipo contra la factura y el flete en Excel toma horas."',
    solucionEnNominusCafe1: 'Motor Automático VEN-NIF de 3 Tasas: calcula al instante la Tasa de Recepción del Anticipo, la Tasa de Mesa de Cambio Banesco y la Tasa BCV de Facturación SENIAT, generando el asiento contable exacto.'
  },
  {
    perfilUsuario: 'Productor / Dueño de Finca y Torrefactora Asociada',
    regionVenezuela: 'Biscucuy (Portuguesa) / Boconó (Trujillo)',
    problemaCriticoDetectado: '"Necesito saber en tiempo real si mis Bolívares ya se convirtieron en dólares en Banesco, cuántos quintales de café colombiano me aseguraron, si la gandola ya cruzó por San Antonio y cuánto me van a cobrar de flete en la factura."',
    solucionEnNominusCafe1: 'Rastreador Visual de 4 Etapas con colores pasteles alegres + Portal de Pedidos Anticipados Ágiles y Club de Fidelización con descuento en flete por volumen de quintales.'
  },
  {
    perfilUsuario: 'Encargado de Recursos Humanos en Centro de Acopio Cafetalero',
    regionVenezuela: 'Zona Industrial de Barquisimeto / Guanare',
    problemaCriticoDetectado: '"Pagarles a los vigilantes de los galpones de café es delicado: trabajan guardias nocturnas, domingos y feriados cuidando sacos muy valiosos. Si calculamos mal el bono nocturno (30%) o el Cestaticket a tasa BCV, nos exponemos a reclamos en la Inspectoría del Trabajo (INPSASEL / Minpptrass)."',
    solucionEnNominusCafe1: 'Módulo Integrado de Nómina de Vigilantes LOTTT: calcula automáticamente turnos 12x12 y 24x48, Bono Nocturno 30% (Art. 117), Horas Extras 50% (Art. 118), Feriados/Domingos (Art. 120), Cestaticket ($40 BCV) y retenciones IVSS/FAOV/RPE.'
  }
];
