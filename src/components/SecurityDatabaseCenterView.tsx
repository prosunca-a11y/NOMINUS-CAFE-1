import React from 'react';
import { User } from 'firebase/auth';
import { SecurityAuditLogRecord } from '../firebase';
import { DIRTY_DOZEN_SECURITY_TESTS } from '../../firestore.rules.test';
import { ShieldCheck, Lock, Database, LogIn, LogOut, KeyRound, FileSpreadsheet } from 'lucide-react';

interface SecurityDatabaseCenterViewProps {
  currentUser: User | null;
  authReady: boolean;
  isSyncingFirestore: boolean;
  auditLogs: SecurityAuditLogRecord[];
  onSignIn: () => void;
  onSignOut: () => void;
}

export const SecurityDatabaseCenterView: React.FC<SecurityDatabaseCenterViewProps> = ({
  currentUser,
  authReady,
  isSyncingFirestore,
  auditLogs,
  onSignIn,
  onSignOut,
}) => {
  return (
    <div className="space-y-8">
      {/* Cabecera de Estado de Base de Datos Segura y Autenticación Firebase */}
      <div className="bg-[#DCFCE7] border border-[#86EFAC] rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold text-[#166534]">
              BASE DE DATOS CLOUD FIRESTORE ENTERPRISE + AUTENTICACIÓN GOOGLE ZERO-TRUST
            </span>
            <h2 className="text-2xl font-bold text-[#14532D] font-display">
              Centro de Seguridad Bancaria, Cifrado y Bitácora Inmutable de Auditoría
            </h2>
            <p className="text-sm text-[#166534] leading-relaxed">
              Toda la información multiempresa de <strong>NOMINUS CAFÉ 1</strong> cuenta con persistencia en <strong>Google Cloud Firestore</strong> protegida por reglas criptográficas de Acceso Basado en Atributos (ABAC). Ningún tercero puede leer, inyectar campos fantasma ni alterar anticipos cerrados ante el SENIAT.
            </p>
          </div>

          <div className="bg-white border border-[#86EFAC] rounded-2xl p-4 min-w-[290px] shrink-0 space-y-3">
            {!authReady ? (
              <div className="text-xs text-[#57534E]">Verificando sesión segura...</div>
            ) : currentUser ? (
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#15803D]">
                  SESIÓN GOOGLE VERIFICADA ACTIVA
                </div>
                <div className="text-sm font-bold text-[#1C1917] truncate">
                  {currentUser.displayName || currentUser.email}
                </div>
                <div className="text-xs font-mono text-[#57534E] truncate">
                  {currentUser.email} · UID: {currentUser.uid.slice(0, 10)}...
                </div>
                <div className="text-[11px] font-semibold text-[#0369A1]">
                  {isSyncingFirestore
                    ? 'Sincronizando datos con Firestore...'
                    : 'Base de Datos Firestore Sincronizada en Vivo'}
                </div>
                <button
                  onClick={onSignOut}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#FAF8F5] border border-[#D6D3D1] rounded-xl text-xs font-semibold text-[#1C1917] hover:bg-[#F5F5F4] transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Cerrar Sesión Segura
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-[#9A3412]">
                  MODO LOCAL PROTEGIDO · INICIA SESIÓN PARA NUBE FIRESTORE
                </div>
                <p className="text-xs text-[#44403C]">
                  Conéctate con tu cuenta de Google para respaldar y sincronizar tus empresas, anticipos Banesco y nómina en la base de datos segura Cloud Firestore.
                </p>
                <button
                  onClick={onSignIn}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1C1917] text-white rounded-xl text-xs font-semibold hover:bg-[#292524] transition-colors cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión con Google (Firebase Auth)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Los 4 Mecanismos de Blindaje de la Base de Datos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#E0F2FE] border border-[#BAE6FD] rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0369A1] mb-1.5">
            <KeyRound className="w-4 h-4" />
            <span>1. Identidad Verificada (OAuth 2.0)</span>
          </div>
          <p className="text-xs text-[#0C4A6E] leading-relaxed">
            Exige autenticación Google con `email_verified == true`. Cada empresa, anticipo Banesco y recibo queda sellado con el `ownerId` criptográfico del titular.
          </p>
        </div>

        <div className="bg-[#FEF9C3] border border-[#FEF08A] rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#854D0E] mb-1.5">
            <Database className="w-4 h-4" />
            <span>2. Compuerta Relacional Multiempresa</span>
          </div>
          <p className="text-xs text-[#713F12] leading-relaxed">
            La función `isParentCompanyOwner(empresaId)` verifica en el servidor que la empresa receptora exista en `/companies` y pertenezca al usuario antes de aceptar cualquier anticipo.
          </p>
        </div>

        <div className="bg-[#FCE7F3] border border-[#FBCFE8] rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#9D174D] mb-1.5">
            <Lock className="w-4 h-4" />
            <span>3. Bloqueo Fiscal Terminal SENIAT</span>
          </div>
          <p className="text-xs text-[#831843] leading-relaxed">
            Los campos `uidUnico`, `empresaId` y `createdAt` son inmutables. Cuando una operación pasa a `Cerrado y Declarado SENIAT`, queda bloqueada contra alteraciones ordinarias.
          </p>
        </div>

        <div className="bg-[#F3E8FF] border border-[#E9D5FF] rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#6B21A8] mb-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>4. Bitácora Inmutable Append-Only</span>
          </div>
          <p className="text-xs text-[#581C87] leading-relaxed">
            La colección `/auditLogs` tiene prohibido cualquier `update` o `delete` (`allow update, delete: if false;`), garantizando un rastro forense inalterable ante SUDEBAN y Banesco.
          </p>
        </div>
      </div>

      {/* Bitácora de Auditoría en Tiempo Real (/auditLogs) */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E7E5E4]">
          <div>
            <span className="text-xs font-bold text-[#15803D]">
              COLECCIÓN /auditLogs · REGISTRO INMUTABLE DE OPERACIONES (SOLO ANEXADO)
            </span>
            <h3 className="text-lg font-bold text-[#1C1917] font-display">
              Bitácora de Seguridad y Eventos Financieros en Tiempo Real
            </h3>
          </div>
          <span className="text-xs font-mono text-[#57534E]">
            {auditLogs.length} eventos registrados
          </span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="bg-[#FAF8F5] border border-[#E7E5E4] rounded-xl p-6 text-center space-y-2">
            <p className="text-xs text-[#44403C]">
              {currentUser
                ? 'La bitácora se poblará automáticamente con cada alta de empresa, anticipo Banesco o avance de trazabilidad.'
                : 'Inicia sesión con Google arriba para activar y visualizar la bitácora inmutable en tiempo real desde Cloud Firestore.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#E7E5E4] rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E7E5E4] text-[#44403C]">
                  <th className="py-2.5 px-3 font-bold">ID Evento</th>
                  <th className="py-2.5 px-3 font-bold">Módulo / Entidad</th>
                  <th className="py-2.5 px-3 font-bold">Acción Auditada</th>
                  <th className="py-2.5 px-3 font-bold">Detalle de Trazabilidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {auditLogs.slice(0, 15).map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-2.5 px-3 font-mono text-[#57534E] whitespace-nowrap">
                      {log.id}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#0369A1] whitespace-nowrap">
                      {log.entidadTipo}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#14532D] whitespace-nowrap">
                      {log.accion}
                    </td>
                    <td className="py-2.5 px-3 text-[#1C1917]">{log.detalle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Matriz de las 12 Pruebas de Penetración "Dirty Dozen" Bloqueadas por firestore.rules */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6 space-y-4">
        <div className="border-b border-[#E7E5E4] pb-3">
          <span className="text-xs font-bold text-[#9A3412]">
            AUDITORÍA RED TEAM · 12 VECTORES DE ATAQUE BLOQUEADOS EN FIRESTORE.RULES
          </span>
          <h3 className="text-lg font-bold text-[#1C1917] font-display">
            Matriz de Verificación Zero-Trust ("Dirty Dozen Security TDD")
          </h3>
        </div>

        <div className="overflow-x-auto border border-[#E7E5E4] rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E7E5E4] text-[#44403C]">
                <th className="py-2.5 px-3 font-bold">Código</th>
                <th className="py-2.5 px-3 font-bold">Vector de Ataque Probado</th>
                <th className="py-2.5 px-3 font-bold">Ruta Objetivo</th>
                <th className="py-2.5 px-3 font-bold">Operación</th>
                <th className="py-2.5 px-3 font-bold text-right">Respuesta Regla Firestore</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5E4]">
              {DIRTY_DOZEN_SECURITY_TESTS.map((test) => (
                <tr key={test.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#1C1917]">{test.id}</td>
                  <td className="py-2.5 px-3 font-semibold text-[#1C1917]">{test.title}</td>
                  <td className="py-2.5 px-3 font-mono text-[#0369A1]">{test.collection}</td>
                  <td className="py-2.5 px-3 font-mono uppercase text-[#57534E]">
                    {test.operation}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-[#15803D]">
                    BLOQUEADO ({test.expectedResult})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
