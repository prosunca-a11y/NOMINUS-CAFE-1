import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import {
  auth,
  db,
  signInWithGooglePopup,
  signOutCurrentUser,
  createCompanyInFirestore,
  updateCompanyInFirestore,
  createOperationInFirestore,
  updateOperationTraceabilityInFirestore,
  createVigilanteInFirestore,
  saveBcvRateInFirestore,
  saveBatchBcvRatesInFirestore,
  deleteCompanyFromFirestore,
  deleteOperationFromFirestore,
  deleteVigilanteFromFirestore,
  saveSignedVoucherInFirestore,
  saveBatchSignedVouchersInFirestore,
  writeSecurityAuditLog,
  handleFirestoreError,
  OperationType,
  SecurityAuditLogRecord,
} from './firebase';
import {
  TODOS_LOS_COMPROBANTES_BANESCO_2026,
  OfficialAccountingVoucher,
} from './data/agricolaOniAccountingVouchers2026Data';
import {
  AgricolaOniAccountingAndVouchersSuiteView,
  OniAccountingSubSheet,
} from './components/AgricolaOniAccountingAndVouchersSuiteView';
import {
  INITIAL_OPERATIONS,
  INITIAL_COMPANIES,
  INITIAL_VIGILANTES,
  INITIAL_BCV_RATES,
  isSimulatedCompany,
  isSimulatedOperation,
  isSimulatedVigilante,
  CashTrailOperation,
  CompanyProfile,
  VigilanteWorker,
  BcvDailyRate,
} from './data/nominusData';
import { MultiCompanyManagerBar } from './components/MultiCompanyManagerBar';
import { BcvRatesManagerPanel } from './components/BcvRatesManagerPanel';
import { BanescoLedgerAndCashTrailView } from './components/BanescoLedgerAndCashTrailView';
import { ReceiptGeneratorView } from './components/ReceiptGeneratorView';
import { LegalShieldContractsView } from './components/LegalShieldContractsView';
import { VigilantesPayrollView } from './components/VigilantesPayrollView';
import { DeepResearchAndUxReportView } from './components/DeepResearchAndUxReportView';
import { SecurityDatabaseCenterView } from './components/SecurityDatabaseCenterView';
import { AgricolaOniBankAuditSheetView } from './components/AgricolaOniBankAuditSheetView';
import { AgricolaOniBanescoResponseLetterView } from './components/AgricolaOniBanescoResponseLetterView';
import {
  Landmark,
  FileCheck2,
  Scale,
  Shield,
  BookOpen,
  Lock,
  LogIn,
  LogOut,
  FileSpreadsheet,
  ArrowRightLeft,
  DollarSign,
  FolderArchive,
  FileText,
} from 'lucide-react';

type ActiveModule =
  | 'carta-explicativa-banesco-2026'
  | 'contabilidad-banesco-2026'
  | 'comprobantes-anticipos-2026'
  | 'comprobantes-traspasos-2026'
  | 'comprobantes-dolares-banesco-2026'
  | 'comprobantes-restantes-2026'
  | 'repositorio-seniat-2026'
  | 'auditoria-oni-2026'
  | 'hoja-banesco'
  | 'recibo-anticipo'
  | 'blindaje-legal'
  | 'vigilantes-lottt'
  | 'investigacion-ux'
  | 'seguridad-bd';

export default function App() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('carta-explicativa-banesco-2026');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [isSyncingFirestore, setIsSyncingFirestore] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLogRecord[]>([]);
  const seededUsersRef = useRef<Set<string>>(new Set());

  const [companies, setCompanies] = useState<CompanyProfile[]>(() => {
    try {
      // Purgar claves antiguas con datos de demostración
      localStorage.removeItem('nominus_cafe_1_companies_v1');
      const saved = localStorage.getItem('nominus_cafe_1_companies_v4_clean');
      if (saved) {
        const parsed: CompanyProfile[] = JSON.parse(saved);
        const realCompanies = parsed
          .filter((c) => !isSimulatedCompany(c))
          .map((c) =>
            c.id === 'emp-oni' || c.razonSocial.toUpperCase().includes('ONI')
              ? { ...c, rif: 'J-50145638-0' }
              : c
          );
        if (realCompanies.length > 0) return realCompanies;
      }
      return INITIAL_COMPANIES;
    } catch {
      return INITIAL_COMPANIES;
    }
  });

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    INITIAL_COMPANIES[0].id
  );

  const [operations, setOperations] = useState<CashTrailOperation[]>(() => {
    try {
      // Purgar claves antiguas con operaciones simuladas
      localStorage.removeItem('nominus_cafe_1_ops_v1');
      localStorage.removeItem('nominus_cafe_1_ops_v2');
      localStorage.removeItem('nominus_cafe_1_ops_v3');
      const saved = localStorage.getItem('nominus_cafe_1_ops_v4_clean');
      if (saved) {
        const parsed: CashTrailOperation[] = JSON.parse(saved);
        return parsed.filter((op) => !isSimulatedOperation(op));
      }
      return INITIAL_OPERATIONS;
    } catch {
      return INITIAL_OPERATIONS;
    }
  });

  const [vigilantes, setVigilantes] = useState<VigilanteWorker[]>(() => {
    try {
      localStorage.removeItem('nominus_cafe_1_vigilantes_v1');
      const saved = localStorage.getItem('nominus_cafe_1_vigilantes_v4_clean');
      if (saved) {
        const parsed: VigilanteWorker[] = JSON.parse(saved);
        return parsed.filter((v) => !isSimulatedVigilante(v));
      }
      return INITIAL_VIGILANTES;
    } catch {
      return INITIAL_VIGILANTES;
    }
  });

  const [bcvRates, setBcvRates] = useState<BcvDailyRate[]>(() => {
    try {
      const saved = localStorage.getItem('nominus_cafe_1_bcv_rates_v2');
      if (saved) {
        const parsed: BcvDailyRate[] = JSON.parse(saved);
        if (parsed.length >= INITIAL_BCV_RATES.length) {
          return parsed;
        }
      }
      return INITIAL_BCV_RATES;
    } catch {
      return INITIAL_BCV_RATES;
    }
  });

  const [selectedReceiptOpId, setSelectedReceiptOpId] = useState<string>(
    INITIAL_OPERATIONS[0]?.id || ''
  );
  const [tasaBcvActual, setTasaBcvActual] = useState<number>(36.85);

  const [vouchers, setVouchers] = useState<OfficialAccountingVoucher[]>(() => {
    try {
      const saved = localStorage.getItem('nominus_cafe_1_oni_vouchers_2026_v1');
      if (saved) {
        const parsed: OfficialAccountingVoucher[] = JSON.parse(saved);
        if (parsed.length >= TODOS_LOS_COMPROBANTES_BANESCO_2026.length) {
          return parsed;
        }
      }
      return TODOS_LOS_COMPROBANTES_BANESCO_2026;
    } catch {
      return TODOS_LOS_COMPROBANTES_BANESCO_2026;
    }
  });

  // Escuchar cambios de autenticación de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Suscripción en tiempo real a Firestore cuando el usuario está autenticado
  useEffect(() => {
    if (!authReady || !currentUser || !currentUser.emailVerified) {
      setAuditLogs([]);
      return;
    }

    const uid = currentUser.uid;
    setIsSyncingFirestore(true);

    const companiesQuery = query(
      collection(db, 'companies'),
      where('ownerId', '==', uid)
    );
    const opsQuery = query(
      collection(db, 'operations'),
      where('ownerId', '==', uid)
    );
    const vigQuery = query(
      collection(db, 'vigilantes'),
      where('ownerId', '==', uid)
    );
    const logsQuery = query(
      collection(db, 'auditLogs'),
      where('ownerId', '==', uid)
    );
    const ratesQuery = query(
      collection(db, 'bcvRates'),
      where('ownerId', '==', uid)
    );
    const signedVouchersQuery = query(
      collection(db, 'signedVouchers'),
      where('ownerId', '==', uid)
    );

    const unsubCompanies = onSnapshot(
      companiesQuery,
      async (snapshot) => {
        if (snapshot.empty && !seededUsersRef.current.has(uid)) {
          seededUsersRef.current.add(uid);
          try {
            // Registrar únicamente AGRÍCOLA ONI, C.A. en limpio (sin operaciones ni nóminas simuladas)
            for (const comp of INITIAL_COMPANIES) {
              await createCompanyInFirestore(uid, comp, true);
            }
            await saveBatchBcvRatesInFirestore(
              uid,
              INITIAL_BCV_RATES,
              'Serie_Historica_Diaria_Ultimos_6_Meses_BCV',
              true
            );
            await writeSecurityAuditLog(
              uid,
              'EMPRESA_AGRICOLA_ONI_LISTA_EN_CERO',
              'EMPRESA',
              `${uid}_emp-oni`,
              `Base de datos preparada en limpio para AGRÍCOLA ONI, C.A. (0 operaciones simuladas) con ${INITIAL_BCV_RATES.length} tasas diarias BCV oficiales.`
            );
          } catch (e) {
            console.error('Error inicializando AGRÍCOLA ONI, C.A. en Firestore:', e);
          }
          setIsSyncingFirestore(false);
          return;
        }

        if (!snapshot.empty) {
          const allDocs = snapshot.docs.map((d) => {
            const data = d.data();
            const isOni =
              data.id === 'emp-oni' ||
              String(data.razonSocial || '').toUpperCase().includes('ONI');
            return {
              id: data.id,
              codigoCorto: data.codigoCorto,
              razonSocial: data.razonSocial,
              rif: isOni ? 'J-50145638-0' : data.rif,
              domicilioFiscal: data.domicilioFiscal,
              registroMercantil: data.registroMercantil,
              representanteLegal: data.representanteLegal,
              cuentaBanescoVES: data.cuentaBanescoVES,
              cuentaBanescoUSD: data.cuentaBanescoUSD,
              cupoMensualMesaCambioUSD: Number(data.cupoMensualMesaCambioUSD),
              sucursalPrincipal: data.sucursalPrincipal,
            } as CompanyProfile;
          });

          // Eliminar de Firestore cualquier empresa simulada previa
          const simulatedCompanies = allDocs.filter((c) => isSimulatedCompany(c));
          const realCompanies = allDocs.filter((c) => !isSimulatedCompany(c));

          if (simulatedCompanies.length > 0) {
            for (const simComp of simulatedCompanies) {
              try {
                await deleteCompanyFromFirestore(uid, simComp.id);
              } catch (err) {
                console.error('Error purgando empresa simulada:', err);
              }
            }
          }

          // Asegurar que AGRÍCOLA ONI, C.A. exista siempre en la base de datos
          const hasOni = realCompanies.some(
            (c) =>
              c.id === 'emp-oni' ||
              c.id.endsWith('_emp-oni') ||
              c.razonSocial.toUpperCase().includes('AGRÍCOLA ONI') ||
              c.razonSocial.toUpperCase().includes('AGRICOLA ONI')
          );

          if (!hasOni && !seededUsersRef.current.has(`${uid}_ensure_oni`)) {
            seededUsersRef.current.add(`${uid}_ensure_oni`);
            try {
              await createCompanyInFirestore(uid, INITIAL_COMPANIES[0], true);
            } catch (err) {
              console.error('Error creando AGRÍCOLA ONI, C.A.:', err);
            }
          }

          const finalCompanies =
            realCompanies.length > 0 ? realCompanies : INITIAL_COMPANIES;
          setCompanies(finalCompanies);
          setSelectedCompanyId((prev) =>
            prev === 'ALL' || finalCompanies.some((c) => c.id === prev)
              ? prev
              : finalCompanies[0].id
          );
        }
        setIsSyncingFirestore(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'companies');
      }
    );

    const unsubOps = onSnapshot(
      opsQuery,
      async (snapshot) => {
        const loadedOps: CashTrailOperation[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: data.id,
            empresaId: data.empresaId,
            uidUnico: data.uidUnico,
            codigoOperacion: data.codigoOperacion,
            fechaAnticipo: data.fechaAnticipo,
            horaTransferencia: data.horaTransferencia,
            clienteNombre: data.clienteNombre,
            clienteRif: data.clienteRif,
            clienteTipoCuenta: data.clienteTipoCuenta,
            bancoOrigen: data.bancoOrigen,
            numeroCuentaOrigen: data.numeroCuentaOrigen,
            cuentaBanescoReceptora: data.cuentaBanescoReceptora,
            referenciaBanesco: data.referenciaBanesco,
            montoAnticipoVES: Number(data.montoAnticipoVES),
            propositoAnticipo: data.propositoAnticipo,
            tasaBcvAnticipo: Number(data.tasaBcvAnticipo),
            fechaMesaCambio: data.fechaMesaCambio,
            horaMesaCambio: data.horaMesaCambio,
            codigoPactoBanesco: data.codigoPactoBanesco,
            tasaMesaCambio: Number(data.tasaMesaCambio),
            comisionBanescoVES: Number(data.comisionBanescoVES),
            montoAdjudicadoUSD: Number(data.montoAdjudicadoUSD),
            cuentaBanescoDivisas: data.cuentaBanescoDivisas,
            fechaCompraExterior: data.fechaCompraExterior,
            referenciaPagoExterior: data.referenciaPagoExterior,
            proveedorExterior: data.proveedorExterior,
            origenCafe: data.origenCafe,
            variedadCafe: data.variedadCafe,
            quintalesComprados: Number(data.quintalesComprados),
            costoCafeUSD: Number(data.costoCafeUSD),
            fleteInternacionalUSD: Number(data.fleteInternacionalUSD),
            estadoLogistico: data.estadoLogistico,
            permisoInsai: data.permisoInsai,
            numeroFacturaSeniat: data.numeroFacturaSeniat,
            fechaFacturaSeniat: data.fechaFacturaSeniat,
            tasaBcvFacturacion: Number(data.tasaBcvFacturacion),
            subtotalCafeVES: Number(data.subtotalCafeVES),
            subtotalFleteVES: Number(data.subtotalFleteVES),
            ivaFleteVES: Number(data.ivaFleteVES),
            retencionIslrFleteVES: Number(data.retencionIslrFleteVES),
            diferencialCambiarioVES: Number(data.diferencialCambiarioVES),
            estadoContable: data.estadoContable,
            etapaTrazabilidad: data.etapaTrazabilidad as 1 | 2 | 3 | 4,
            reciboAnticipoNro: data.reciboAnticipoNro,
          };
        });

        // Purgar automáticamente de Firestore cualquier operación simulada anterior
        const simulatedOps = loadedOps.filter((op) => isSimulatedOperation(op));
        const realOps = loadedOps.filter((op) => !isSimulatedOperation(op));

        setOperations(realOps);

        if (simulatedOps.length > 0) {
          for (const simOp of simulatedOps) {
            try {
              await deleteOperationFromFirestore(uid, simOp.id, true);
            } catch (err) {
              console.error('Error eliminando operación simulada:', err);
            }
          }
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'operations');
      }
    );

    const unsubVig = onSnapshot(
      vigQuery,
      async (snapshot) => {
        const loadedVig: VigilanteWorker[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: data.id,
            empresaId: data.empresaId,
            nombre: data.nombre,
            cedula: data.cedula,
            cargo: data.cargo,
            ubicacionFinca: data.ubicacionFinca,
            turnoModalidad: data.turnoModalidad,
            salarioBasicoMensualVES: Number(data.salarioBasicoMensualVES),
            diasTrabajadosMes: Number(data.diasTrabajadosMes),
            horasNocturnasMes: Number(data.horasNocturnasMes),
            horasExtrasMes: Number(data.horasExtrasMes),
            domingosFeriadosTrabajados: Number(data.domingosFeriadosTrabajados),
            cestaticketUSD: Number(data.cestaticketUSD),
            bonoProductividadResguardoUSD: Number(
              data.bonoProductividadResguardoUSD
            ),
          };
        });

        // Purgar automáticamente de Firestore cualquier vigilante simulado anterior
        const simulatedVig = loadedVig.filter((v) => isSimulatedVigilante(v));
        const realVig = loadedVig.filter((v) => !isSimulatedVigilante(v));

        setVigilantes(realVig);

        if (simulatedVig.length > 0) {
          for (const simV of simulatedVig) {
            try {
              await deleteVigilanteFromFirestore(uid, simV.id);
            } catch (err) {
              console.error('Error eliminando vigilante simulado:', err);
            }
          }
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'vigilantes');
      }
    );

    const unsubLogs = onSnapshot(
      logsQuery,
      (snapshot) => {
        const loadedLogs: SecurityAuditLogRecord[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: data.id,
            ownerId: data.ownerId,
            accion: data.accion,
            entidadTipo: data.entidadTipo,
            entidadId: data.entidadId,
            detalle: data.detalle,
            createdAt: data.createdAt,
          };
        });
        setAuditLogs(loadedLogs.reverse());
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'auditLogs');
      }
    );

    const unsubRates = onSnapshot(
      ratesQuery,
      async (snapshot) => {
        const loadedRates: BcvDailyRate[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: data.id,
            fecha: data.fecha,
            tasaCompraVES: Number(data.tasaCompraVES),
            tasaVentaVES: Number(data.tasaVentaVES),
            fuente: data.fuente,
          };
        });

        // Garantizar en estado local que los 281 días (últimos 6 meses + trimestre inicial 2026) estén siempre completos
        const mergedMap = new Map<string, BcvDailyRate>();
        INITIAL_BCV_RATES.forEach((r) => mergedMap.set(r.fecha, r));
        loadedRates.forEach((r) => mergedMap.set(r.fecha, r));
        setBcvRates(Array.from(mergedMap.values()));

        // Sincronizar únicamente las fechas faltantes hacia Firestore (evitando sobrescribir documentos ya existentes)
        const existingFechas = new Set(loadedRates.map((r) => r.fecha));
        const missingRates = INITIAL_BCV_RATES.filter(
          (r) => !existingFechas.has(r.fecha)
        );

        if (
          missingRates.length > 0 &&
          !seededUsersRef.current.has(`${uid}_bcv_full`)
        ) {
          seededUsersRef.current.add(`${uid}_bcv_full`);
          try {
            await saveBatchBcvRatesInFirestore(
              uid,
              missingRates,
              'Actualizacion_Automatica_6_Meses_Diarios_BCV',
              true
            );
          } catch (e) {
            console.error('Aviso sincronizando serie de 6 meses BCV:', e);
          }
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'bcvRates');
      }
    );

    const unsubSignedVouchers = onSnapshot(
      signedVouchersQuery,
      async (snapshot) => {
        if (snapshot.empty && !seededUsersRef.current.has(`${uid}_vouchers_2026`)) {
          seededUsersRef.current.add(`${uid}_vouchers_2026`);
          try {
            await saveBatchSignedVouchersInFirestore(
              uid,
              TODOS_LOS_COMPROBANTES_BANESCO_2026,
              true
            );
          } catch (e) {
            console.error('Aviso sincronizando comprobantes iniciales SENIAT:', e);
          }
          return;
        }

        if (!snapshot.empty) {
          const remoteMap = new Map<string, Record<string, unknown>>();
          snapshot.docs.forEach((d) => {
            const data = d.data();
            remoteMap.set(String(data.voucherId || ''), data);
          });

          setVouchers((prev) =>
            prev.map((v) => {
              const rem = remoteMap.get(v.id);
              if (!rem) return v;
              return {
                ...v,
                estadoFirmaSello:
                  (rem.estadoFirmaSello as OfficialAccountingVoucher['estadoFirmaSello']) ||
                  v.estadoFirmaSello,
                archivoFirmadoNombre:
                  String(rem.archivoFirmadoNombre || '') !== 'PENDIENTE_ESCANEO_FIRMADO.pdf'
                    ? String(rem.archivoFirmadoNombre || '')
                    : v.archivoFirmadoNombre,
                archivoFirmadoFechaCarga:
                  String(rem.archivoFirmadoFechaCarga || '') !== 'PENDIENTE'
                    ? String(rem.archivoFirmadoFechaCarga || '')
                    : v.archivoFirmadoFechaCarga,
                archivoFirmadoHashSha256:
                  String(rem.archivoFirmadoHashSha256 || '') !== 'SHA256-PENDIENTE-CARGA'
                    ? String(rem.archivoFirmadoHashSha256 || '')
                    : v.archivoFirmadoHashSha256,
                firmadoPorRepresentante:
                  String(rem.firmadoPorRepresentante || '') || v.firmadoPorRepresentante,
                firmadoPorContadorCpc:
                  String(rem.firmadoPorContadorCpc || '') || v.firmadoPorContadorCpc,
                selloAgenciaBanesco:
                  String(rem.selloAgenciaBanesco || '') || v.selloAgenciaBanesco,
                expedienteSeniatNro:
                  String(rem.expedienteSeniatNro || '') || v.expedienteSeniatNro,
                observacionesAuditor:
                  String(rem.observacionesAuditor || '') || v.observacionesAuditor,
              };
            })
          );
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'signedVouchers');
      }
    );

    return () => {
      unsubCompanies();
      unsubOps();
      unsubVig();
      unsubLogs();
      unsubRates();
      unsubSignedVouchers();
    };
  }, [authReady, currentUser]);

  // Respaldo local en paralelo (claves limpias sin datos simulados)
  useEffect(() => {
    try {
      localStorage.setItem('nominus_cafe_1_companies_v4_clean', JSON.stringify(companies));
    } catch {
      // ignore
    }
  }, [companies]);

  useEffect(() => {
    try {
      localStorage.setItem('nominus_cafe_1_ops_v4_clean', JSON.stringify(operations));
    } catch {
      // ignore
    }
  }, [operations]);

  useEffect(() => {
    try {
      localStorage.setItem('nominus_cafe_1_vigilantes_v4_clean', JSON.stringify(vigilantes));
    } catch {
      // ignore
    }
  }, [vigilantes]);

  useEffect(() => {
    try {
      localStorage.setItem('nominus_cafe_1_bcv_rates_v2', JSON.stringify(bcvRates));
    } catch {
      // ignore
    }
  }, [bcvRates]);

  useEffect(() => {
    try {
      localStorage.setItem('nominus_cafe_1_oni_vouchers_2026_v1', JSON.stringify(vouchers));
    } catch {
      // ignore
    }
  }, [vouchers]);

  const handleUpdateVoucher = async (updated: OfficialAccountingVoucher) => {
    setVouchers((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    if (currentUser && currentUser.emailVerified) {
      await saveSignedVoucherInFirestore(currentUser.uid, updated);
    }
  };

  const handleCreateCustomVoucher = async (newVoucher: OfficialAccountingVoucher) => {
    setVouchers((prev) => [newVoucher, ...prev]);
    if (currentUser && currentUser.emailVerified) {
      await saveSignedVoucherInFirestore(currentUser.uid, newVoucher);
    }
  };

  const handleSyncAllVouchersToFirestore = async () => {
    if (currentUser && currentUser.emailVerified) {
      await saveBatchSignedVouchersInFirestore(currentUser.uid, vouchers);
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithGooglePopup();
    } catch (e) {
      console.error('Error al iniciar sesión con Google:', e);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutCurrentUser();
    } catch (e) {
      console.error('Error al cerrar sesión:', e);
    }
  };

  const handleAddCompany = async (newComp: CompanyProfile) => {
    setCompanies((prev) => [...prev, newComp]);
    if (currentUser && currentUser.emailVerified) {
      await createCompanyInFirestore(currentUser.uid, newComp);
    }
  };

  const handleUpdateCompany = async (updated: CompanyProfile) => {
    setCompanies((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    if (currentUser && currentUser.emailVerified) {
      await updateCompanyInFirestore(currentUser.uid, updated);
    }
  };

  const handleAddOperation = async (newOp: CashTrailOperation) => {
    setOperations((prev) => [newOp, ...prev]);
    setSelectedReceiptOpId(newOp.id);
    if (currentUser && currentUser.emailVerified) {
      await createOperationInFirestore(currentUser.uid, newOp);
    }
  };

  const handleUpdateOperation = async (updatedOp: CashTrailOperation) => {
    setOperations((prev) =>
      prev.map((op) => (op.id === updatedOp.id ? updatedOp : op))
    );
    if (currentUser && currentUser.emailVerified) {
      await updateOperationTraceabilityInFirestore(currentUser.uid, updatedOp);
    }
  };

  const handleDeleteOperation = async (opId: string) => {
    setOperations((prev) => prev.filter((op) => op.id !== opId));
    if (currentUser && currentUser.emailVerified) {
      await deleteOperationFromFirestore(currentUser.uid, opId);
    }
  };

  const handleAddVigilante = async (newVig: VigilanteWorker) => {
    setVigilantes((prev) => [...prev, newVig]);
    if (currentUser && currentUser.emailVerified) {
      await createVigilanteInFirestore(currentUser.uid, newVig);
    }
  };

  const handleUpsertBcvRate = async (newRate: BcvDailyRate) => {
    setBcvRates((prev) => {
      const exists = prev.some((r) => r.fecha === newRate.fecha);
      if (exists) {
        return prev.map((r) => (r.fecha === newRate.fecha ? newRate : r));
      }
      return [...prev, newRate];
    });
    if (currentUser && currentUser.emailVerified) {
      await saveBcvRateInFirestore(currentUser.uid, newRate);
    }
  };

  const handleImportBatchBcvRates = async (
    importedRates: BcvDailyRate[],
    fileName: string
  ) => {
    setBcvRates((prev) => {
      const map = new Map<string, BcvDailyRate>();
      prev.forEach((r) => map.set(r.fecha, r));
      importedRates.forEach((r) => map.set(r.fecha, r));
      return Array.from(map.values());
    });
    if (currentUser && currentUser.emailVerified) {
      await saveBatchBcvRatesInFirestore(currentUser.uid, importedRates, fileName);
    }
  };

  const handleQuickRegisterDepositFromBcvSim = (
    fecha: string,
    montoVES: number,
    tasaAplicada: number
  ) => {
    const targetComp =
      selectedCompanyId === 'ALL'
        ? companies[0]
        : companies.find((c) => c.id === selectedCompanyId) || companies[0];
    const comisionBanesco = Math.round(montoVES * 0.0025 * 100) / 100;
    const usdAdjudicados =
      Math.round(((montoVES - comisionBanesco) / tasaAplicada) * 100) / 100;
    const fleteUSD = Math.round(usdAdjudicados * 0.11 * 100) / 100;
    const cafeUSD = Math.round((usdAdjudicados - fleteUSD) * 100) / 100;

    const newOp: CashTrailOperation = {
      id: `op-${Date.now()}`,
      empresaId: targetComp.id,
      uidUnico: `UID-BAN-2026-${Math.floor(1000 + Math.random() * 9000)
        .toString(16)
        .toUpperCase()}-00${operations.length + 45}`,
      codigoOperacion: `${targetComp.codigoCorto.slice(0, 3)}-2026-00${operations.length + 45}`,
      fechaAnticipo: fecha,
      horaTransferencia: '10:15:00',
      clienteNombre: `Asociado Cafetalero (Depósito ${fecha})`,
      clienteRif: 'J-40918234-6',
      clienteTipoCuenta: 'Jurídica (Empresa)',
      bancoOrigen: '0134 - Banesco Banco Universal (Mismo Banco)',
      numeroCuentaOrigen: '0134-0089-24-0891045512',
      cuentaBanescoReceptora: targetComp.cuentaBanescoVES,
      referenciaBanesco: String(Math.floor(800000000 + Math.random() * 199999999)),
      montoAnticipoVES: montoVES,
      propositoAnticipo: `Anticipo en ventas recibido el ${fecha} reconvertido con la tasa oficial BCV de ese día (Bs. ${tasaAplicada.toFixed(4)}/USD = USD ${usdAdjudicados.toFixed(2)}) para compra de café en el exterior.`,
      tasaBcvAnticipo: tasaAplicada,
      fechaMesaCambio: fecha,
      horaMesaCambio: '11:30:00',
      codigoPactoBanesco: `MC-BAN-2026-${Math.floor(90000 + Math.random() * 9999)}`,
      tasaMesaCambio: tasaAplicada,
      comisionBanescoVES: comisionBanesco,
      montoAdjudicadoUSD: usdAdjudicados,
      cuentaBanescoDivisas: targetComp.cuentaBanescoUSD,
      fechaCompraExterior: fecha,
      referenciaPagoExterior: `INT-PAY-COL-${Math.floor(775200 + Math.random() * 4000)}`,
      proveedorExterior: 'Exportadora Cafetera del Norte S.A.S. (NIT 900.412.881-2)',
      origenCafe: 'Cúcuta, Norte de Santander, Colombia',
      variedadCafe: 'Café Verde Arábica Lavado',
      quintalesComprados: Math.max(1, Math.round(cafeUSD / 170)),
      costoCafeUSD: cafeUSD,
      fleteInternacionalUSD: fleteUSD,
      estadoLogistico: 'En Almacén Colombia (Trámite INSAI)',
      permisoInsai: `EN TRÁMITE: SOL-INSAI-2026-${Math.floor(12100 + Math.random() * 800)}`,
      numeroFacturaSeniat: 'PENDIENTE AL INGRESO ADUANAL',
      fechaFacturaSeniat: '2026-10-16',
      tasaBcvFacturacion: tasaAplicada,
      subtotalCafeVES: Math.round(cafeUSD * tasaAplicada * 100) / 100,
      subtotalFleteVES: Math.round(fleteUSD * tasaAplicada * 100) / 100,
      ivaFleteVES: 0,
      retencionIslrFleteVES: Math.round(fleteUSD * tasaAplicada * 0.03 * 100) / 100,
      diferencialCambiarioVES: 0,
      estadoContable: 'Anticipo Abierto (Pasivo 2.1.04)',
      etapaTrazabilidad: 2,
      reciboAnticipoNro: `REC-${targetComp.codigoCorto.slice(0, 3)}-2026-0${108 + operations.length}`,
    };

    handleAddOperation(newOp);
    setActiveModule('hoja-banesco');
  };

  const handleOpenReceipt = (opId: string) => {
    setSelectedReceiptOpId(opId);
    setActiveModule('recibo-anticipo');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeCompanyObj =
    selectedCompanyId === 'ALL'
      ? null
      : companies.find((c) => c.id === selectedCompanyId) || companies[0];

  const menuModules: {
    id: ActiveModule;
    numero: string;
    tituloCorto: string;
    subtitulo: string;
    pastelBg: string;
    pastelActiveBg: string;
    pastelBorder: string;
    textAccent: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'carta-explicativa-banesco-2026',
      numero: '00',
      tituloCorto: 'Carta Respuesta Banesco',
      subtitulo: 'EEFF USD 116k vs BBU USD 2.78M',
      pastelBg: 'bg-[#E0F2FE]/90 hover:bg-[#E0F2FE]',
      pastelActiveBg: 'bg-[#E0F2FE] ring-2 ring-[#0369A1]',
      pastelBorder: 'border-[#38BDF8]',
      textAccent: 'text-[#0C4A6E]',
      icon: <FileText className="w-5 h-5 text-[#0369A1]" />,
    },
    {
      id: 'contabilidad-banesco-2026',
      numero: '01',
      tituloCorto: 'Contabilidad Banesco 2026',
      subtitulo: 'Libro Diario, Mayor y Balance Ene-Ago',
      pastelBg: 'bg-[#DCFCE7]/85 hover:bg-[#DCFCE7]',
      pastelActiveBg: 'bg-[#DCFCE7] ring-2 ring-[#15803D]',
      pastelBorder: 'border-[#86EFAC]',
      textAccent: 'text-[#14532D]',
      icon: <BookOpen className="w-5 h-5 text-[#15803D]" />,
    },
    {
      id: 'comprobantes-anticipos-2026',
      numero: '02',
      tituloCorto: 'Comprobantes Anticipos',
      subtitulo: 'Hoja Anticipos Clientes (Bs. 1.571,5M)',
      pastelBg: 'bg-[#FEF3C7]/85 hover:bg-[#FEF3C7]',
      pastelActiveBg: 'bg-[#FEF3C7] ring-2 ring-[#B45309]',
      pastelBorder: 'border-[#FCD34D]',
      textAccent: 'text-[#78350F]',
      icon: <FileCheck2 className="w-5 h-5 text-[#B45309]" />,
    },
    {
      id: 'comprobantes-traspasos-2026',
      numero: '03',
      tituloCorto: 'Transf. Internas Bancos',
      subtitulo: 'Cuentas Propias ONI J-50145638-0',
      pastelBg: 'bg-[#E0F2FE]/85 hover:bg-[#E0F2FE]',
      pastelActiveBg: 'bg-[#E0F2FE] ring-2 ring-[#0369A1]',
      pastelBorder: 'border-[#7DD3FC]',
      textAccent: 'text-[#0C4A6E]',
      icon: <ArrowRightLeft className="w-5 h-5 text-[#0369A1]" />,
    },
    {
      id: 'comprobantes-dolares-banesco-2026',
      numero: '04',
      tituloCorto: 'Compras Dólares Banesco',
      subtitulo: 'Mesa de Cambio BCV (US$ 556.890,45)',
      pastelBg: 'bg-[#FFEDD5]/85 hover:bg-[#FFEDD5]',
      pastelActiveBg: 'bg-[#FFEDD5] ring-2 ring-[#C2410C]',
      pastelBorder: 'border-[#FDBA74]',
      textAccent: 'text-[#7C2D12]',
      icon: <DollarSign className="w-5 h-5 text-[#C2410C]" />,
    },
    {
      id: 'comprobantes-restantes-2026',
      numero: '05',
      tituloCorto: 'Comprobantes Restantes',
      subtitulo: 'Café, Becerra, Fletes, Campo e IGTF',
      pastelBg: 'bg-[#FCE7F3]/85 hover:bg-[#FCE7F3]',
      pastelActiveBg: 'bg-[#FCE7F3] ring-2 ring-[#BE185D]',
      pastelBorder: 'border-[#F9A8D4]',
      textAccent: 'text-[#831843]',
      icon: <Landmark className="w-5 h-5 text-[#BE185D]" />,
    },
    {
      id: 'repositorio-seniat-2026',
      numero: '06',
      tituloCorto: 'Repositorio SENIAT / Sello',
      subtitulo: 'Guardar y Cargar Firmados/Sellados',
      pastelBg: 'bg-[#F3E8FF]/85 hover:bg-[#F3E8FF]',
      pastelActiveBg: 'bg-[#F3E8FF] ring-2 ring-[#6B21A8]',
      pastelBorder: 'border-[#D8B4FE]',
      textAccent: 'text-[#581C87]',
      icon: <FolderArchive className="w-5 h-5 text-[#6B21A8]" />,
    },
    {
      id: 'auditoria-oni-2026',
      numero: '07',
      tituloCorto: 'Cuadros Auditoría ONI',
      subtitulo: 'Cuadro Abonos + Salidas por Categoría',
      pastelBg: 'bg-[#FEF9C3]/85 hover:bg-[#FEF9C3]',
      pastelActiveBg: 'bg-[#FEF9C3] ring-2 ring-[#A16207]',
      pastelBorder: 'border-[#FDE047]',
      textAccent: 'text-[#713F12]',
      icon: <FileSpreadsheet className="w-5 h-5 text-[#A16207]" />,
    },
    {
      id: 'hoja-banesco',
      numero: '08',
      tituloCorto: 'Hoja Banesco y Efectivo',
      subtitulo: 'Anticipos Bs. → USD → Café → SENIAT',
      pastelBg: 'bg-[#DCFCE7]/70 hover:bg-[#DCFCE7]',
      pastelActiveBg: 'bg-[#DCFCE7] ring-2 ring-[#15803D]',
      pastelBorder: 'border-[#86EFAC]',
      textAccent: 'text-[#14532D]',
      icon: <Landmark className="w-5 h-5 text-[#15803D]" />,
    },
    {
      id: 'recibo-anticipo',
      numero: '09',
      tituloCorto: 'Recibo Anticipo Lleno',
      subtitulo: 'Comprobante 2.1.04 + Guía 5 Pasos',
      pastelBg: 'bg-[#FFEDD5]/70 hover:bg-[#FFEDD5]',
      pastelActiveBg: 'bg-[#FFEDD5] ring-2 ring-[#C2410C]',
      pastelBorder: 'border-[#FDBA74]',
      textAccent: 'text-[#7C2D12]',
      icon: <FileCheck2 className="w-5 h-5 text-[#C2410C]" />,
    },
    {
      id: 'blindaje-legal',
      numero: '10',
      tituloCorto: 'Blindaje y Contratos',
      subtitulo: 'SENIAT, SUDEBAN, Banesco y Flete',
      pastelBg: 'bg-[#E0F2FE]/70 hover:bg-[#E0F2FE]',
      pastelActiveBg: 'bg-[#E0F2FE] ring-2 ring-[#0369A1]',
      pastelBorder: 'border-[#7DD3FC]',
      textAccent: 'text-[#0C4A6E]',
      icon: <Scale className="w-5 h-5 text-[#0369A1]" />,
    },
    {
      id: 'vigilantes-lottt',
      numero: '11',
      tituloCorto: 'Pago de Vigilantes',
      subtitulo: 'Nómina Rural LOTTT y Resguardo',
      pastelBg: 'bg-[#FCE7F3]/70 hover:bg-[#FCE7F3]',
      pastelActiveBg: 'bg-[#FCE7F3] ring-2 ring-[#BE185D]',
      pastelBorder: 'border-[#F9A8D4]',
      textAccent: 'text-[#831843]',
      icon: <Shield className="w-5 h-5 text-[#BE185D]" />,
    },
    {
      id: 'seguridad-bd',
      numero: '12',
      tituloCorto: 'Base Datos y Seguridad',
      subtitulo: 'Firestore Zero-Trust y Auditoría',
      pastelBg: 'bg-[#F3E8FF]/80 hover:bg-[#F3E8FF]',
      pastelActiveBg: 'bg-[#F3E8FF] ring-2 ring-[#6B21A8]',
      pastelBorder: 'border-[#D8B4FE]',
      textAccent: 'text-[#581C87]',
      icon: <Lock className="w-5 h-5 text-[#6B21A8]" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917]">
      {/* TOP BAR CONTRACT: 3 Zonas limpias separadas por gap-8 */}
      <header className="no-print sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-sm border-b border-[#E7E5E4] px-6 py-3.5">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-8">
          {/* Zona 1: Brand Title */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveModule('hoja-banesco');
            }}
            className="text-xl font-bold tracking-tight text-[#1C1917] font-display whitespace-nowrap shrink-0"
          >
            NOMINUS CAFÉ 1
          </a>

          {/* Zona 2: enlaces de navegación limpios en una sola línea */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-[#44403C]">
            <button
              onClick={() => setActiveModule('carta-explicativa-banesco-2026')}
              className={`hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeModule === 'carta-explicativa-banesco-2026'
                  ? 'text-[#0369A1] font-bold underline'
                  : ''
              }`}
            >
              Carta Respuesta Banesco
            </button>
            <button
              onClick={() => setActiveModule('contabilidad-banesco-2026')}
              className={`hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeModule === 'contabilidad-banesco-2026'
                  ? 'text-[#1C1917] font-bold underline'
                  : ''
              }`}
            >
              Contabilidad Banesco
            </button>
            <button
              onClick={() => setActiveModule('comprobantes-anticipos-2026')}
              className={`hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeModule === 'comprobantes-anticipos-2026'
                  ? 'text-[#1C1917] font-bold underline'
                  : ''
              }`}
            >
              Comprobantes Anticipos
            </button>
            <button
              onClick={() => setActiveModule('comprobantes-traspasos-2026')}
              className={`hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeModule === 'comprobantes-traspasos-2026'
                  ? 'text-[#1C1917] font-bold underline'
                  : ''
              }`}
            >
              Transf. Internas
            </button>
            <button
              onClick={() => setActiveModule('comprobantes-dolares-banesco-2026')}
              className={`hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeModule === 'comprobantes-dolares-banesco-2026'
                  ? 'text-[#1C1917] font-bold underline'
                  : ''
              }`}
            >
              Compras Dólares
            </button>
            <button
              onClick={() => setActiveModule('comprobantes-restantes-2026')}
              className={`hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeModule === 'comprobantes-restantes-2026'
                  ? 'text-[#1C1917] font-bold underline'
                  : ''
              }`}
            >
              Restantes Ing/Egr
            </button>
            <button
              onClick={() => setActiveModule('repositorio-seniat-2026')}
              className={`hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeModule === 'repositorio-seniat-2026'
                  ? 'text-[#1C1917] font-bold underline'
                  : ''
              }`}
            >
              Repositorio SENIAT
            </button>
            <button
              onClick={() => setActiveModule('auditoria-oni-2026')}
              className={`hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeModule === 'auditoria-oni-2026' ? 'text-[#1C1917] font-bold underline' : ''
              }`}
            >
              Cuadros Auditoría
            </button>
          </nav>

          {/* Zona 3: 1 Acción Primaria (Autenticación / Sesión Segura) */}
          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <button
                onClick={() => setActiveModule('seguridad-bd')}
                className="px-4 py-2 text-xs font-semibold text-[#14532D] bg-[#DCFCE7] border border-[#86EFAC] rounded-xl hover:bg-[#BBF7D0] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                BD Cifrada: {currentUser.email?.split('@')[0]}
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#1C1917] rounded-xl hover:bg-[#292524] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Conectar Google Auth
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL (1440px Baseline) */}
      <main id="top" className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* HERO COMPACTO + GESTOR MULTIEMPRESA + MENÚ PRINCIPAL DE COLORES PASTELES ALEGRES */}
        <section className="no-print bg-gradient-to-r from-[#DCFCE7] via-[#FEF9C3] to-[#FFEDD5] border border-[#D6D3D1] rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl space-y-2">
              <div className="text-xs font-semibold text-[#14532D]">
                Plataforma Multiempresa Cafetalera · Cloud Firestore Zero-Trust · Cumplimiento SENIAT, SUDEBAN y Banesco
              </div>
              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1C1917] font-display leading-tight"
                style={{ textWrap: 'balance' }}
              >
                Sistema Multiempresa de Rastro del Efectivo, Anticipos Banesco y Base de Datos Segura
              </h1>
              <p className="text-sm text-[#44403C] leading-relaxed">
                Lleva simultáneamente varias empresas agroindustriales con respaldo en Cloud Firestore protegido por reglas criptográficas ABAC: controla el cupo mensual de divisas en Banesco de cada sociedad, contabiliza sus anticipos en ventas en Bolívares y audita cada operación ante el SENIAT y SUDEBAN.
              </p>
            </div>

            {/* Control Interactivo de Tasa Oficial BCV en Tiempo Real */}
            <div className="bg-white/95 border border-[#D6D3D1] rounded-2xl p-4 min-w-[260px] shrink-0">
              <label className="block text-xs font-bold text-[#44403C] mb-1">
                Tasa Oficial BCV Vigente (Bs. / USD)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#15803D]">Bs.</span>
                <input
                  type="number"
                  step="0.01"
                  value={tasaBcvActual}
                  onChange={(e) => setTasaBcvActual(parseFloat(e.target.value) || 36.85)}
                  className="w-full px-3 py-1.5 text-base font-mono font-bold text-[#1C1917] bg-[#FAF8F5] border border-[#D6D3D1] rounded-lg focus:outline-none focus:border-[#1C1917]"
                />
              </div>
              <div className="text-[11px] text-[#57534E] mt-1.5">
                Modo Activo:{' '}
                <span className="font-bold text-[#1C1917]">
                  {activeCompanyObj
                    ? `${activeCompanyObj.codigoCorto} (${activeCompanyObj.rif})`
                    : `Consolidado (${companies.length} Empresas)`}
                </span>
              </div>
            </div>
          </div>

          {/* PANEL DE CONTROL MULTIEMPRESA */}
          <MultiCompanyManagerBar
            companies={companies}
            selectedCompanyId={selectedCompanyId}
            operations={operations}
            onSelectCompany={setSelectedCompanyId}
            onAddCompany={handleAddCompany}
            onUpdateCompany={handleUpdateCompany}
          />

          {/* CARGADOR DIRECTO DE ARCHIVO EXCEL DE TASAS DIARIAS BCV (COMPRA Y VENTA) + SIMULADOR 05 ENERO 2026 */}
          <BcvRatesManagerPanel
            bcvRates={bcvRates}
            onUpsertRate={handleUpsertBcvRate}
            onImportBatchRates={handleImportBatchBcvRates}
            onQuickRegisterDeposit={handleQuickRegisterDepositFromBcvSim}
          />

          {/* MENÚ PRINCIPAL FOCAL CON COLORES PASTELES ALEGRES */}
          <div className="bg-white/90 backdrop-blur-sm border border-[#D6D3D1] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold text-[#1C1917]">
                MENÚ INTERACTIVO DE MÓDULOS NOMINUS CAFÉ 1 — SELECCIONA LA HOJA QUE DESEAS AUDITAR:
              </span>
              <span className="text-xs text-[#57534E] hidden sm:inline">
                7 Módulos Multiempresa · Hoja Auditoría AGRÍCOLA ONI Ene-Ago 2026 Activa
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
              {menuModules.map((mod) => {
                const isActive = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveModule(mod.id)}
                    className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      mod.pastelBorder
                    } ${isActive ? mod.pastelActiveBg : mod.pastelBg}`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-xs font-mono font-bold text-[#44403C]">
                        MÓDULO {mod.numero}
                      </span>
                      {mod.icon}
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${mod.textAccent} whitespace-nowrap truncate`}>
                        {mod.tituloCorto}
                      </div>
                      <div className="text-xs text-[#44403C] mt-0.5 truncate">
                        {mod.subtitulo}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* RENDERIZADO DEL MÓDULO ACTIVO */}
        <section>
          {activeModule === 'carta-explicativa-banesco-2026' && (
            <AgricolaOniBanescoResponseLetterView
              companies={companies}
              onNavigateToModule={(modId) => setActiveModule(modId as ActiveModule)}
            />
          )}

          {(activeModule === 'contabilidad-banesco-2026' ||
            activeModule === 'comprobantes-anticipos-2026' ||
            activeModule === 'comprobantes-traspasos-2026' ||
            activeModule === 'comprobantes-dolares-banesco-2026' ||
            activeModule === 'comprobantes-restantes-2026' ||
            activeModule === 'repositorio-seniat-2026') && (
            <AgricolaOniAccountingAndVouchersSuiteView
              activeSubSheet={activeModule as OniAccountingSubSheet}
              onSelectSubSheet={(sheet) => setActiveModule(sheet)}
              companies={companies}
              vouchers={vouchers}
              onUpdateVoucher={handleUpdateVoucher}
              onCreateCustomVoucher={handleCreateCustomVoucher}
              onSyncAllVouchersToFirestore={handleSyncAllVouchersToFirestore}
              isAuthenticated={Boolean(currentUser && currentUser.emailVerified)}
            />
          )}

          {activeModule === 'auditoria-oni-2026' && (
            <AgricolaOniBankAuditSheetView
              companies={companies}
              onImportVerifiedRealOperations={(ops) => {
                ops.forEach((op) => handleAddOperation(op));
              }}
            />
          )}

          {activeModule === 'hoja-banesco' && (
            <BanescoLedgerAndCashTrailView
              companies={companies}
              selectedCompanyId={selectedCompanyId}
              operations={operations}
              bcvRates={bcvRates}
              tasaBcvActual={tasaBcvActual}
              onAddOperation={handleAddOperation}
              onUpdateOperation={handleUpdateOperation}
              onDeleteOperation={handleDeleteOperation}
              onOpenReceipt={handleOpenReceipt}
            />
          )}

          {activeModule === 'recibo-anticipo' && (
            <ReceiptGeneratorView
              companies={companies}
              operations={operations}
              selectedOpId={selectedReceiptOpId}
              onSelectOp={setSelectedReceiptOpId}
            />
          )}

          {activeModule === 'blindaje-legal' && (
            <LegalShieldContractsView
              companies={companies}
              selectedCompanyId={selectedCompanyId}
            />
          )}

          {activeModule === 'vigilantes-lottt' && (
            <VigilantesPayrollView
              companies={companies}
              selectedCompanyId={selectedCompanyId}
              vigilantes={vigilantes}
              onAddVigilante={handleAddVigilante}
              tasaBcvActual={tasaBcvActual}
            />
          )}

          {activeModule === 'investigacion-ux' && (
            <DeepResearchAndUxReportView
              companies={companies}
              selectedCompanyId={selectedCompanyId}
              tasaBcvActual={tasaBcvActual}
              onCreatePreOrder={(newOp) => {
                handleAddOperation(newOp);
              }}
            />
          )}

          {activeModule === 'seguridad-bd' && (
            <SecurityDatabaseCenterView
              currentUser={currentUser}
              authReady={authReady}
              isSyncingFirestore={isSyncingFirestore}
              auditLogs={auditLogs}
              onSignIn={handleSignIn}
              onSignOut={handleSignOut}
            />
          )}
        </section>
      </main>

      {/* FOOTER SOBRIO Y FUNCIONAL */}
      <footer className="no-print border-t border-[#E7E5E4] bg-white px-6 py-5 mt-12">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#57534E]">
          <div>
            <strong>NOMINUS CAFÉ 1 — SISTEMA MULTIEMPRESA CON BASE DE DATOS SEGURA FIRESTORE</strong> · Cumplimiento SENIAT, SUDEBAN y Banesco.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveModule('seguridad-bd')}
              className="hover:text-[#1C1917] underline cursor-pointer"
            >
              Centro de Seguridad y Auditoría
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveModule('blindaje-legal')}
              className="hover:text-[#1C1917] underline cursor-pointer"
            >
              Contratos SUDEBAN/SENIAT
            </button>
            <span>·</span>
            <button
              onClick={() => window.print()}
              className="hover:text-[#1C1917] underline cursor-pointer"
            >
              Imprimir Expediente
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
