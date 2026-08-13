# Seguridad del Asistente IA

El endpoint `/api/redesign/assistant` no acepta consultas anónimas.

Orden de autorización:
1. Requiere `Authorization: Bearer <Supabase access token>`.
2. Valida el token contra Supabase Auth `/auth/v1/user`.
3. Ejecuta `authorize_ai_request()` con el JWT del usuario.
4. La función exige `auth.uid()`, existencia en `auth.users`, `profiles.id = auth.uid()`, perfil activo y comercio válido.
5. Recién después se consultan datos tenant-scoped o se invoca AI Gateway.
6. Se aplican límites por usuario (60/10 min y 500/24 h).

`AI_GATEWAY_API_KEY`/OIDC permanecen exclusivamente en código de servidor. El navegador nunca recibe credenciales del Gateway.
