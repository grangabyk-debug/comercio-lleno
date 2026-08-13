# Comercio Lleno — paquete 2026-08-13

- Productos y stock: edición de una fila por vez, auto-guardado al cambiar de producto, limpieza de ceros al enfocar campos numéricos y botón Guardar cambios.
- Aumento masivo por porcentaje para precio minorista o mayorista mediante RPC atómico y tenant-aware. Las promociones porcentuales conservan su descuento al aumentar precios minoristas.
- Nueva venta: carrito limitado con scroll interno y cobro/totales concentrados en la columna derecha.
- Móvil: redirección desde dashboard completo, aviso de versión simplificada e IA flotante arrastrable.
- Asistente IA: respuestas directas sobre métricas frecuentes, Pedido IA+ por demanda/stock y fallbacks de modelos ligeros.
- Seguridad IA: validación de token Supabase, usuario auth real, perfil activo exacto por auth.uid, tenant y permisos antes de cualquier consulta/modelo, más rate limiting y registro privado de solicitudes.
