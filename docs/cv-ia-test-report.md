# CV IA — prueba previa a producción

Fecha de prueba: 2026-08-18.

## Pruebas realizadas

- Health del backend y configuración de OpenAI: OK.
- Creación y recuperación de sesión opaca: OK.
- Diagnóstico real con CV de prueba: OK.
- Extracción factual de experiencia, formación, habilidades y contacto: OK.
- Triple evaluación (filtro, recruiter, responsable): OK.
- Corrección de reglas de fecha actual y keywords: OK en segunda versión.
- CV Pro con redactor + auditor separado: OK.
- El auditor rechazó un primer borrador que modificaba un título académico y formulaba afirmaciones demasiado libres; la autocorrección generó una segunda versión aprobada con 99% de confianza factual.
- Búsqueda Activa: el primer intento de adaptación fue frenado por control factual; después de agregar autocorrección + segunda auditoría, la versión final fue aprobada con 99% de confianza y match de prueba de 90%.
- Creación de preferencia de Mercado Pago para CV Pro ARS 8.900: OK.
- Verificación de una orden no pagada: se mantuvo correctamente en estado `pending`; no se otorgó un plan sin pago aprobado.
- Build de Vercel para la rama CV IA: OK.

## Costos observados en la prueba

El diagnóstico de prueba consumió aproximadamente USD 0,0023 de API. La generación CV Pro, incluyendo una autocorrección y segunda auditoría, consumió aproximadamente USD 0,0399 adicionales. Una adaptación de Búsqueda Activa que necesitó autocorrección consumió aproximadamente USD 0,0789.

Los costos son observaciones de esta prueba y pueden variar según longitud del CV, oferta, salida y necesidad de reintentos.
