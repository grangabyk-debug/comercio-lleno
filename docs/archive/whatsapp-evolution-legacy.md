# WhatsApp legacy por QR — archivado

Estado: **DESHABILITADO**.

Esta implementación usaba una sesión de WhatsApp Web/Evolution API (Baileys) vinculada por QR. Se retira del uso de Comercio Lleno y no debe volver a exponerse ni invocarse en producción.

La implementación anterior permanece recuperable en el historial de Git para referencia técnica, pero todos sus endpoints de ejecución quedan cerrados. La nueva integración de WhatsApp debe realizarse exclusivamente con **WhatsApp Business Platform / Cloud API oficial de Meta** y el flujo oficial de onboarding para clientes.

No reutilizar `EVOLUTION_API_URL`, `EVOLUTION_API_KEY` ni `EVOLUTION_WEBHOOK_SECRET` para nuevas funcionalidades.
