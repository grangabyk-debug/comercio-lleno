# CV IA — flujo de producción

CV IA vive en `/cv-ia` dentro del proyecto Vercel de Comercio Lleno, pero funciona como producto y marca aislados.

## Flujo

1. El navegador crea una sesión opaca en la Edge Function `cv-ai`.
2. El usuario carga CV + puesto + oferta.
3. El backend extrae hechos del CV y ejecuta tres evaluaciones separadas: filtro automático, recruiter y responsable del área.
4. CV Pro usa un redactor de mayor calidad y un auditor factual independiente. Si la auditoría falla, hay una corrección automática y una segunda auditoría. Si vuelve a fallar, el resultado no se entrega.
5. Búsqueda Activa reutiliza el CV base aprobado y genera hasta 10 adaptaciones durante 30 días, cada una con auditoría factual y tablero de seguimiento.
6. Los pagos se crean y validan del lado servidor mediante Mercado Pago. El plan solo se habilita luego de verificar un pago aprobado.

## Privacidad y seguridad

- El archivo original se procesa para extraer hechos profesionales y no se persiste como archivo en la base de CV IA.
- Los tokens de sesión y de orden se almacenan hasheados en servidor.
- Las tablas internas tienen RLS habilitado y no exponen acceso directo a anon/authenticated.
- Hay límites diarios para reducir abuso del diagnóstico gratuito y del procesamiento pago.
- Nunca debe agregarse experiencia, métricas, herramientas, títulos o logros no respaldados por el CV del usuario.

## Planes

- Diagnóstico: 1 análisis inicial gratuito.
- CV Pro: ARS 8.900, pago único.
- Búsqueda Activa: ARS 12.900, vigencia 30 días, hasta 10 búsquedas.

## Operación

Central Llena permanece pausado mientras CV IA usa el presupuesto de OpenAI. El backend registra uso de tokens y costo estimado por acción en `cv_ai_usage_events` para poder auditar margen y detectar abusos.
