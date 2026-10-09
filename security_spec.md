# Especificación de Seguridad Zero-Trust — NOMINUS CAFÉ 1 (Firestore ABAC)

## 1. Invariantes de Datos (Data Invariants)
1. **Aislamiento de Identidad y Verificación de Correo (`email_verified`)**: Ningún documento puede crearse, leerse, actualizarse o eliminarse sin un usuario autenticado con Google Sign-In (`request.auth != null && request.auth.token.email_verified == true`), garantizando que `ownerId == request.auth.uid`.
2. **Consistencia Relacional Multiempresa (Master Gate)**: Ninguna operación de anticipo (`/operations/{operationId}`) ni registro de vigilante (`/vigilantes/{vigilanteId}`) puede crearse sin que exista previamente la empresa matriz (`/companies/$(incoming().empresaId)`) y su `ownerId` coincida exactamente con `request.auth.uid`.
3. **Inmutabilidad de Campos Críticos ("Immortal Fields")**: Los campos `id`, `ownerId`, `empresaId`, `uidUnico` y `createdAt` son estrictamente inmutables después de la creación del documento (`incoming().field == existing().field`).
4. **Integridad Temporal del Servidor (`request.time`)**: Todo documento exige `incoming().createdAt == request.time` en `create` y `incoming().updatedAt == request.time` en `update`.
5. **Bloqueo de Estado Terminal Fiscal (`Terminal State Locking`)**: Una vez que una operación alcanza la etapa final `existing().etapaTrazabilidad == 4` y `existing().estadoContable == 'Cerrado y Declarado SENIAT'`, queda bloqueada contra modificaciones ordinarias salvo corrección administrativa verificada (`isAdmin()`).
6. **Inmutabilidad Total de la Bitácora (`auditLogs`)**: Los registros en `/auditLogs/{logId}` son estrictamente *append-only* (`allow update, delete: if false;`).
7. **Consultas List Seguras (`Query Enforcer`)**: Toda regla `allow list` evalúa explícitamente `resource.data.ownerId == request.auth.uid` (sin delegar seguridad al cliente y sin usar `get()` dentro de `list`).

## 2. The "Dirty Dozen" Payloads (12 Ataques de Prueba que retornan `PERMISSION_DENIED`)
1. **Payload 01 — Identity Spoofing en `/companies`**: Usuario `uid_A` intenta crear una empresa con `ownerId: "uid_B"`.
2. **Payload 02 — Unverified Email Spoofing**: Usuario con `email_verified: false` intenta crear un registro en `/companies`.
3. **Payload 03 — Shadow Field Injection ("Shadow Update")**: Envío de un documento en `/companies` con un campo fantasma no autorizado `isVerifiedBySudeban: true`.
4. **Payload 04 — Orphaned Write en `/operations`**: Intento de crear un anticipo apuntando a un `empresaId` inexistente o perteneciente a otro usuario.
5. **Payload 05 — ID Poisoning Attack**: Intento de crear un documento con un ID que contiene caracteres especiales o supera 128 caracteres (`../../admin_hack`).
6. **Payload 06 — Resource Exhaustion ("Denial of Wallet")**: Envío de `propositoAnticipo` con una cadena de 10.000 caracteres (límite máximo: 500).
7. **Payload 07 — Client Timestamp Forgery**: Intento de crear una operación con un `createdAt` pasado o futuro distinto de `request.time`.
8. **Payload 08 — Immortal Field Mutation**: Intento de actualizar `uidUnico` o `ownerId` de una operación existente en `/operations`.
9. **Payload 09 — Terminal State Bypass**: Intento de modificar el monto o etapa de una operación cuyo estado actual ya es `'Cerrado y Declarado SENIAT'` (`etapaTrazabilidad == 4`) por un usuario no administrador.
10. **Payload 10 — Value Poisoning en Update**: Intento de actualizar `etapaTrazabilidad` con un string `"cuatro"` o el número `99` fuera del rango `1..4`.
11. **Payload 11 — Unauthorized List Scraping**: Intento de ejecutar un `list` global sobre `/operations` sin filtrar por `ownerId == request.auth.uid`.
12. **Payload 12 — Audit Log Tampering**: Intento de actualizar o eliminar un registro existente en `/auditLogs/{logId}`.
