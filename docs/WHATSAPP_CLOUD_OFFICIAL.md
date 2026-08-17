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
- `META_WHATSAPP_SYSTEM_USER_ID`: reservado para la asignación explícita a WABA si Meta la requiere en el flujo final.
- `SUPABASE_SERVICE_ROLE_KEY`: permite que el webhook persista eventos oficiales sin depender de una sesión humana.

## Flujo por comercio

1. El propietario completa Embedded Signup en Meta.
2. La respuesta de sesión aporta WABA ID y Phone Number ID.
3. `POST /api/meta/whatsapp/account` con `action=complete_onboarding` valida los IDs contra Meta, suscribe la app a la WABA y guarda el vínculo del tenant.
4. Si falta registrar el teléfono, el mismo endpoint acepta el PIN de 6 dígitos y llama `/{phone-number-id}/register`.
5. Una vez registrado, `POST /api/meta/whatsapp/send` puede enviar texto o plantillas con el Phone Number ID del comercio.
6. Meta entrega mensajes y estados al webhook. Los eventos se guardan en `whatsapp_cloud_events`, resueltos por Phone Number ID/WABA hacia `company_id`.

## Datos multi-tenant

`whatsapp_cloud_accounts` mantiene una única conexión oficial por comercio. No guarda tokens de Meta por tenant; la credencial de proveedor permanece exclusivamente como secreto global de servidor.

`whatsapp_cloud_events` conserva entregas verificadas e idempotentes. El procesamiento de conversaciones/IA puede consumir estos eventos en una etapa posterior sin mezclar la integración oficial con las tablas legacy de Evolution.

## Estado de publicación

Mientras la verificación empresarial/App Review de Meta esté pendiente, no exponer el botón oficial al cliente final. El SDK, webhook, persistencia y endpoints pueden quedar preparados en producción sin habilitar la UI.
