# WhatsApp oficial — Cloud API

Esta integración reemplaza al flujo legacy por QR/Evolution. No reactivar el flujo legacy.

## Meta

- App: Comercio Lleno
- App ID: `1564921658645712`
- Embedded Signup Configuration ID: `1817251942977665`
- Graph API: `v26.0`
- Dominios autorizados: `https://comerciolleno.com/` y `https://www.comerciolleno.com/`
- Callback: `https://www.comerciolleno.com/api/meta/whatsapp/webhook`
- Verify token: configurar mediante `META_WHATSAPP_VERIFY_TOKEN` (el fallback actual conserva el token ya registrado en Meta).

## Secretos de servidor

Nunca guardar valores reales en Git ni enviarlos por chat.

- `META_WHATSAPP_APP_SECRET`: valida `x-hub-signature-256` en webhooks.
- `META_WHATSAPP_SYSTEM_USER_ACCESS_TOKEN`: autoriza Cloud API y Business Management API.
- `META_WHATSAPP_ADMIN_SYSTEM_USER_ACCESS_TOKEN`: opcional; usarlo si el token principal no puede asignar el usuario del sistema a WABA de clientes.
- `META_WHATSAPP_SYSTEM_USER_ID`: ID del usuario del sistema que se asigna a cada WABA.
- `META_WHATSAPP_BUSINESS_ID`: ID del portfolio/business proveedor de Comercio Lleno.
- `SUPABASE_SERVICE_ROLE_KEY`: permite que webhook y mensajería persistan eventos oficiales sin depender de una sesión humana.

La UI oficial se habilita únicamente con `NEXT_PUBLIC_META_WHATSAPP_OFFICIAL_ENABLED=1`. Mantenerlo en `0` hasta que Meta apruebe verificación empresarial y App Review/Advanced Access.

## Flujo por comercio

1. El propietario toca `Conectar con Meta` dentro de Configuración > Integraciones.
2. El frontend abre Embedded Signup usando Facebook Login for Business con el Configuration ID de Comercio Lleno.
3. El evento `WA_EMBEDDED_SIGNUP / FINISH` aporta WABA ID, Phone Number ID y, cuando Meta lo incluye, Business ID del cliente.
4. `POST /api/meta/whatsapp/account` valida IDs, verifica/asigna el system user de Comercio Lleno, obtiene el número real desde Graph API, suscribe la app a la WABA y guarda el vínculo del tenant.
5. Si falta registrar el teléfono, el mismo endpoint acepta el PIN de 6 dígitos y llama `/{phone-number-id}/register`.
6. La facturación se resuelve mediante `/api/meta/whatsapp/billing`, que consulta las líneas de crédito del portfolio proveedor y puede adjuntar una línea a la WABA del cliente guardando el `allocation_config_id`.
7. `GET /api/meta/whatsapp/templates` obtiene las plantillas de la WABA y separa las aprobadas.
8. Una vez registrado, `POST /api/meta/whatsapp/send` envía texto o plantillas con el Phone Number ID del comercio.
9. Para texto libre, Comercio Lleno exige que exista un mensaje entrante dentro de las últimas 24 horas. Fuera de esa ventana exige una plantilla aprobada.
10. Meta entrega mensajes y estados al webhook. Se conserva el evento crudo y además se normaliza la conversación oficial por tenant.
11. Al abrir una conversación, `PATCH /api/meta/whatsapp/conversations` puede marcar localmente como leído y sincronizar el `read` con Cloud API.

## Datos multi-tenant

- `whatsapp_cloud_accounts`: una conexión oficial por comercio; también conserva el estado de facturación (`billing_status`, `credit_line_id`, `allocation_config_id`, `billing_currency`).
- `whatsapp_cloud_events`: eventos crudos, verificados e idempotentes.
- `whatsapp_cloud_conversations`: bandeja normalizada por comercio y teléfono del cliente.
- `whatsapp_cloud_messages`: mensajes entrantes/salientes y estados `sent`, `delivered`, `read` o `failed`.

No se guardan tokens de Meta por tenant; las credenciales del proveedor permanecen exclusivamente como secretos globales del servidor.

## APIs de Comercio Lleno

- `GET/POST/DELETE /api/meta/whatsapp/account`: estado, finalización de onboarding, registro y desconexión.
- `GET/POST/DELETE /api/meta/whatsapp/billing`: diagnóstico y asignación/revocación de línea de crédito del proveedor.
- `GET /api/meta/whatsapp/templates`: plantillas de la WABA y subconjunto aprobado.
- `POST /api/meta/whatsapp/send`: envío oficial. Texto libre sólo dentro de la ventana de atención; plantillas fuera de ella.
- `GET/PATCH /api/meta/whatsapp/conversations`: lista/bandeja, mensajes y marcado de lectura local + Cloud API.
- `GET /api/meta/whatsapp/readiness`: diagnóstico seguro de configuración, sin devolver secretos.
- `GET/POST /api/meta/whatsapp/webhook`: verificación de Meta y recepción firmada de eventos.

## App Review

Meta exige App Review y Advanced Access para liberar Embedded Signup. El checklist de revisión, evidencia y permisos está en `docs/META_APP_REVIEW_WHATSAPP.md`.

## Estado de publicación

Mientras la verificación empresarial/App Review de Meta esté pendiente, no exponer el botón oficial al cliente final. El código puede quedar en producción con la feature flag apagada. Cuando Meta apruebe, cargar secretos, comprobar la facturación del proveedor, probar con un único comercio y recién después activar la UI para todos.
