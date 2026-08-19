# Postulá Mejor Platform V2 — arquitectura de preview

## Principios

- Mantener intacto el producto de CV existente (`/cv-ia`, CV Pro+, Primer CV, Test Vocacional y Búsqueda Activa). La plataforma laboral se agrega alrededor.
- Separar candidato y empleador desde navegación, permisos, dashboards y datos.
- La postulación a empleos es gratuita. Los planes del candidato monetizan herramientas de preparación y búsqueda, no el derecho a postularse.
- La IA asiste, ordena y explica. La decisión de contratación permanece humana.
- No usar edad, género, salud, religión, origen, estado civil u otros datos sensibles/protegidos como señal de ranking.
- Las ofertas externas siempre muestran fuente/canal original. No se representa a un empleador sin autorización.

## Modelo multi-tenant propuesto

### Identidad
- `pm_profiles`: una fila por usuario autenticado, rol primario y datos mínimos.
- `pm_candidate_profiles`: datos laborales y preferencias del candidato.
- `pm_companies`: tenant de empresa, estado de verificación y datos fiscales/comerciales.
- `pm_company_members`: relación usuario-empresa con roles `owner`, `admin`, `recruiter`, `hiring_manager`, `viewer`.

### Empleos y postulaciones
- `pm_jobs`: siempre scopeado por `company_id`; estado `draft`, `review`, `published`, `paused`, `closed`.
- `pm_external_jobs`: catálogo separado con fuente, canonical URL, fecha de chequeo y vencimiento conocido.
- `pm_job_questions`: preguntas filtro por búsqueda; cada pregunta declara si es requerida/preferida y su fundamento laboral.
- `pm_applications`: relación candidato-búsqueda, CV elegido, carta, consentimiento, estado.
- `pm_application_answers`: respuestas de screening.
- `pm_saved_jobs`: guardados del candidato.
- `pm_application_events`: historial visible para candidato y empresa según permisos.

### IA y selección
- `pm_ai_runs`: ejecución de agente, versión, input hash, output, costo y estado.
- `pm_candidate_matches`: score + razones + evidencia + dudas; nunca una decisión final.
- `pm_shortlists`: listas revisables creadas por IA o usuario.
- `pm_interview_guides`: preguntas y scorecards por candidato.
- `pm_audit_flags`: riesgos de sesgo, duplicados, inconsistencias y criterios no permitidos.

### Planes y cobro
- `pm_entitlements`: plan, límites y vigencia por candidato o empresa.
- `pm_usage_counters`: postulaciones analizadas, avisos activos, miembros, ejecuciones IA.
- `pm_payments`: referencia de Mercado Pago, estado e importe. Nunca almacenar datos de tarjeta.

### Owner / handoff
- `pm_handoffs`: cola sólo para postulaciones con consentimiento explícito. Un registro externo no habilita envío automático: requiere un canal válido/autorizado del empleador.

## RLS obligatoria

1. Candidato sólo ve/modifica su perfil, CVs, guardados, postulaciones y eventos permitidos.
2. Miembro de empresa sólo ve datos cuyo `company_id` pertenezca a una membresía activa.
3. `viewer` no puede modificar; `hiring_manager` puede operar búsquedas asignadas; `recruiter/admin/owner` tienen alcance creciente.
4. Ninguna empresa puede consultar perfiles de candidatos fuera de aplicaciones recibidas o productos de sourcing expresamente consentidos.
5. Las tablas de IA/costos/auditoría no son escribibles directamente desde el cliente.
6. Datos de CV y documentos van a storage privado con URLs firmadas de corta duración.
7. Owner interno usa funciones server-side/service role; nunca se expone service role al navegador.

## Seguridad de empleadores

- Registro con Google o email.
- Crear organización separada de la identidad del usuario.
- Verificación progresiva: email/contacto -> CUIT/razón social -> dominio/web -> revisión de riesgo.
- MFA recomendado/obligatorio para administradores de planes Escala/Empresa.
- Auditoría de publicaciones, exportaciones de CV, cambios de roles y accesos sensibles.
- Rate limits para registro, publicación, exportación y acciones masivas.

## Postulación inteligente

- Sólo para roles con compatibilidad suficiente y criterios declarados.
- Nunca hacer spam ni aplicar a cientos de roles sin control.
- Límite diario y de velocidad.
- Personalización de CV/carta antes del envío.
- Confirmación del candidato para cada envío externo; automatización completa sólo cuando exista integración/autorización del canal.
- Mostrar historial de qué se envió, a quién, cuándo y con qué versión de CV.

## Catálogo externo durante bootstrap

- Ingestar únicamente información suficiente para descubrir la oferta; conservar canonical URL y atribución.
- Verificar vigencia con frecuencia y retirar lo cerrado.
- No usar `JobPosting` estructurado para presentar como propia una vacante sin autorización.
- CTA primario hacia la fuente oficial.
- Postulá Mejor puede guardar interés/perfil del candidato sólo con consentimiento claro y revocable.

## Planes de empresa — propuesta de preview

- Gratis: 2 avisos/mes, 30 días, primeros 10 postulantes completos, pipeline básico.
- Impulso: 5 búsquedas activas, 250 postulaciones/mes, filtros y exportación.
- Selección IA: 2.000 postulaciones/mes, shortlist explicado, guías de entrevista y routing.
- Escala: 5.000 postulaciones/mes, múltiples usuarios, 5 agentes, analítica y auditoría.
- Empresa: 10.000+ postulaciones, SSO/MFA, múltiples unidades e integraciones.

Los precios visibles en la preview son hipótesis comerciales y deben validarse contra costo de IA, Mercado Pago, impuestos y competencia antes de producción.
