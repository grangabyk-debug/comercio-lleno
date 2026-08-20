# FacturaLlena

Subproducto mobile-first de Comercio Llena para facturación electrónica ARCA.

## Estado de la primera versión
- Reutiliza sesión/tenant de Comercio Llena.
- Reutiliza configuración ARCA por empresa (certificado, CUIT, punto de venta y ambiente).
- Emisión real habilitada únicamente para Factura C / consumidor final mediante `arca-invoice`.
- No simula CAE: la pantalla de éxito aparece sólo si ARCA devuelve autorización.
- Genera PDF fiscal con datos del emisor, punto de venta, numeración, total, CAE, vencimiento y QR ARCA.
- Compartir PDF usa Web Share API cuando el dispositivo lo permite; fallback a descarga.
- WhatsApp y mail tienen accesos directos de texto como fallback.

## Seguridad fiscal
No habilitar A/B, notas de crédito/débito ni receptores identificados sólo cambiando la UI. Esos flujos requieren extender el payload WSFE y sus validaciones.

La primera emisión en producción debe ser iniciada manualmente por el usuario para evitar crear comprobantes fiscales durante QA automatizado.
