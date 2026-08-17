# Meta App Review — WhatsApp oficial de Comercio Lleno

Este documento deja preparado el checklist para liberar Embedded Signup cuando termine la verificación empresarial.

## Permisos

Para liberar Embedded Signup como Tech Provider, solicitar Advanced Access para:

- `business_management`
- `whatsapp_business_management`

Además, la integración de mensajería usa `whatsapp_business_messaging` para enviar mensajes y plantillas desde Cloud API.

## Evidencia a mostrar en la revisión

1. Iniciar sesión en Comercio Lleno como propietario de un comercio de prueba.
2. Abrir Configuración → Integraciones → WhatsApp oficial (activar sólo durante la prueba/revisión).
3. Tocar “Conectar con Meta”.
4. Mostrar que se abre Embedded Signup oficial.
5. Seleccionar/crear la cuenta de WhatsApp Business y el número de prueba.
6. Volver a Comercio Lleno y mostrar que el sistema detecta WABA ID y Phone Number ID sin copiarlos manualmente.
7. Mostrar la suscripción de la WABA y el registro del número.
8. Enviar un mensaje de prueba y mostrar que aparece en la bandeja de conversaciones.
9. Responder desde Comercio Lleno y mostrar estado enviado/entregado/leído si Meta lo devuelve.
10. Mostrar la consulta de plantillas aprobadas.

No mostrar secretos, tokens, App Secret, claves de Supabase ni variables de entorno en el video.

## URLs de producción

- Sitio: `https://www.comerciolleno.com`
- Callback de webhook: `https://www.comerciolleno.com/api/meta/whatsapp/webhook`
- Dominio adicional autorizado: `https://comerciolleno.com/`

## Diagnóstico interno

`GET /api/meta/whatsapp/readiness` devuelve únicamente booleanos/estados y nombres de configuración faltante; nunca devuelve valores secretos.

El botón oficial permanece oculto mediante `NEXT_PUBLIC_META_WHATSAPP_OFFICIAL_ENABLED=0` hasta que Meta apruebe la empresa y la revisión de acceso.

## Flujo técnico que debe quedar operativo

- Embedded Signup → WABA/Phone Number ID.
- Asignación del System User a la WABA.
- Suscripción de la app a la WABA.
- Registro del número con PIN de 6 dígitos.
- Configuración de facturación/crédito para la WABA del cliente.
- Consulta de plantillas aprobadas.
- Webhook oficial con validación `x-hub-signature-256`.
- Mensajes entrantes multi-tenant.
- Mensajes salientes con ventana de atención de 24 horas o plantilla aprobada.
- Estados `sent`, `delivered` y `read`.

## Facturación

La documentación actual de Embedded Signup de Meta incluye el paso de compartir una línea de crédito del proveedor con la WABA del cliente. Comercio Lleno tiene preparado `/api/meta/whatsapp/billing` para consultar líneas disponibles, adjuntar una a una WABA y guardar el `allocation_config_id`. No ejecutar la asignación hasta confirmar la línea de crédito real habilitada en el portfolio proveedor.
