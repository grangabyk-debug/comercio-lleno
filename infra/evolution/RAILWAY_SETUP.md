# Railway setup

1. Create a Railway project named `comercio-lleno-whatsapp`.
2. Add managed PostgreSQL and Redis services.
3. Add a Docker Image service using `evoapicloud/evolution-api:v2.3.7`.
4. Attach a persistent volume at `/evolution/instances`.
5. Generate a public HTTPS domain for the Evolution service.
6. Configure Evolution to use the PostgreSQL and Redis services through Railway private networking.
7. Configure the Comercio Lleno Preview with the Evolution public URL and its server-side credential.
8. Redeploy the Preview and test from `Configuración > WhatsApp`.

The existing `docker-compose.yml` and `Caddyfile` in this folder are the VPS migration path for later scaling.
