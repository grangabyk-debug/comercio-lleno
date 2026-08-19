# Comercio Lleno — benchmark competitivo y primeras prioridades (19/08/2026)

## Competidores verificados
### Alegra POS (Argentina)
- Trial: 15 días sin medio de pago ni permanencia.
- POS Emprendedor: ARS 19.999 + IVA/mes; Pyme 27.999; Pro 40.999; Plus 68.999.
- Facturación electrónica incluida, caja/turnos, vendedores, reportes, listas de precios, multibodega, Zapier/API según plan, soporte 24/7.
- Mensaje comercial: vender/facturar rápido, nube, celular/tablet/PC, facilidad para primerizos.
Fuente: https://www.alegra.com/argentina/pos/precios/ y https://www.alegra.com/argentina/facturacion-electronica/

### Contabilium
- Trial: 10 días.
- Standard ARS 122.000 + IVA/mes; Pro 179.000; Full 245.000 (precios publicados al relevamiento).
- Escala por comprobantes, SKU, CUIT, usuarios, puntos de venta e integraciones.
Fuente: https://contabilium.com/ar/planes

### Xubio
- Plan Emprendedor gratis y planes pagos con 14 días de prueba.
- Facturación electrónica, integraciones Tiendanube/MercadoLibre/MercadoPago/MercadoShops, listas de precios, stock, impuestos, tareas, app móvil y usuarios según plan.
Fuente: https://xubio.com/ar/precios-emprendedores

### Loyverse
- POS, dashboard, inventario esencial, fidelización, KDS, display cliente y multitienda gratis; add-ons de historial, empleados e inventario avanzado con trial de 14 días.
- Diferencial fuerte: móvil/tablet, programa de lealtad, tickets abiertos, multi-tienda y ecosistema modular.
Fuente: https://loyverse.com/pricing y https://loyverse.com/features

## Señal de Google Ads propia — últimos 7 días
Lectura de la cuenta conectada “Comercio Lleno”, sin modificar campañas:
- Campaña Plan Impulso: 2.136 impresiones, 200 clics, ARS 161.018,77 de gasto, 0 conversiones registradas.
- Alta Intención / 3 Meses Gratis: 794 impresiones, 81 clics, ARS 50.729,89, 0 conversiones registradas.
- Búsquedas con gasto o volumen que muestran intención demasiado amplia/ruidosa: “apps para pymes”, “codelector”, “ioma facturación”, “crm que es”, “erp que es”, marcas ajenas y búsquedas de software gratis.
- Señales más cercanas al producto: “sistema pos”, “punto de venta”, “software punto de venta”, “control de stock y ventas”, “sistema stock”, “factura electrónica”.

## Diagnóstico inicial
1. Antes de subir presupuesto, resolver medición de conversión. Cero conversiones registradas con >280 clics en las dos campañas recientes impide optimizar con confianza.
2. Separar intención por problema: POS/ventas; stock; facturación ARCA; gestión de comercio. No mezclar “apps para pymes” genérico con intención transaccional.
3. Negativas candidatas para revisión humana: IOMA, SAP, qué es CRM, qué es ERP, Amadeus, descargas/full/crack, marcas/portales no relacionados. No aplicar automáticamente.
4. El trial de 3 meses es mucho más largo que Alegra/Contabilium/Xubio/Loyverse (10–15 días). Puede ser un gancho potente, pero necesita onboarding con hitos para no transformarse en 90 días sin activación ni urgencia.

## Brechas / oportunidades a priorizar
P0 — conversión y confianza:
- onboarding guiado con checklist real (caja, productos, facturación, primer ticket);
- centro “Aprendé Comercio Lleno” con recorridos por tarea y videos/GIF cortos;
- demo interactiva de venta y facturación antes del registro;
- instrumentación de eventos: trial_started, first_product, cash_opened, first_sale, first_invoice, day_3_active, day_7_active, trial_to_paid.

P1 — producto comercialmente vendible:
- fidelización/CRM simple (historial + puntos/beneficios);
- inventario avanzado: órdenes de compra, proveedores, transferencias, conteos, valorización y alertas;
- multi-sucursal consolidada con comparativas;
- permisos y rendimiento por empleado;
- recibo digital/email y mejor postventa;
- integraciones ecommerce/marketplaces como prioridad de roadmap (validar APIs y demanda antes de desarrollar).

P2 — diferenciación:
- “Copiloto del dueño”: resumen diario accionable, anomalías de caja/stock/ventas y recomendaciones explicables;
- salud del comercio: alertas de productos inmovilizados, quiebres, margen y horarios de venta;
- biblioteca de configuraciones por rubro para que el alta sea plug-and-play.

## Landing preview — arquitectura recomendada
Hero orientado a resultado → prueba 3 meses + “sin tarjeta” sólo si realmente aplica → demo de 60 segundos → selector por necesidad (Vender / Facturar ARCA / Stock / Controlar desde el celular / Empleados / Sucursales) → recorrido “así vendés” en 3 pasos → funciones agrupadas por tarea, no por menú técnico → comparación “qué reemplaza” → explicación del trial con hitos → seguridad/soporte → FAQ concreta → CTA persistente móvil.

No publicar esta rama a producción sin aprobación.
