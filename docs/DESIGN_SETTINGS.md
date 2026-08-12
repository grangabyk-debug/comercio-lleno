# Diseño por comercio

Comercio Lleno guarda `companies.design_settings` por tenant.

Opciones disponibles:

- colorTheme: `emerald`, `ocean`, `graphite`
- fontSize: `compact`, `standard`, `large`
- fontWeight: `soft`, `balanced`, `strong`
- fontFamily: `modern`, `classic`, `rounded`

La interfaz aplica primero el valor cacheado por company_id y luego sincroniza el valor persistido en Supabase.

El reset de scroll del Rediseño V2 sólo actúa al cambiar de sección desde la barra lateral principal. Acciones internas de POS, pagos, productos o pestañas de configuración no deben modificar la posición vertical.
