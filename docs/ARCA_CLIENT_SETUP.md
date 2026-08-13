# Configuración ARCA en Comercio Lleno

## Para el propietario del comercio

Entrá en **Configuración → ARCA** y seguí el asistente en orden.

1. **CUIT y CSR**
   - Cargá el CUIT/CUIL de 11 dígitos.
   - Tocá **Generar CSR**.
   - Comercio Lleno genera una clave RSA de 2048 bits y guarda la clave privada cifrada en Supabase Vault.
   - El navegador recibe únicamente el CSR. Se puede copiar o descargar como `.csr`.

2. **Trámite en ARCA**
   - En producción, entrá a **Administración de Certificados Digitales** con Clave Fiscal.
   - Creá un certificado usando el CSR generado por Comercio Lleno.
   - Descargá el certificado `.crt` que entrega ARCA.
   - En **Administrador de Relaciones de Clave Fiscal**, autorizá el servicio de factura electrónica `wsfe` para el certificado.
   - Creá o verificá un punto de venta con modalidad **Web Services**.
   - Para homologación/pruebas, el certificado se tramita en WSASS.

3. **Subir certificado**
   - Volvé a Comercio Lleno y subí el `.crt`.
   - El sistema comprueba que el certificado corresponda exactamente a la clave privada con la que se generó el CSR.
   - Si el CUIT del certificado no coincide, se rechaza.

4. **Punto de venta**
   - Elegí Producción u Homologación.
   - Cargá el número de punto de venta Web Services.
   - Tocá **Guardar y conectar ARCA** y luego **Probar conexión**.

Actualmente el asistente habilita la emisión fiscal que ya soporta Comercio Lleno como **Factura C**. Factura A/B requiere incorporar primero el tratamiento de IVA y condiciones fiscales correspondientes; no se habilita automáticamente para evitar emitir comprobantes incorrectos.

## Carga avanzada

Si el cliente ya posee un certificado y su clave privada, puede usar **Ya tengo certificado + clave privada**. Ambos archivos se validan entre sí antes de guardarse cifrados. No se deben enviar certificados o claves por WhatsApp ni reutilizar credenciales entre comercios.

## Para soporte de Comercio Lleno

- Cada comercio tiene su fila propia en `arca_tenant_settings`.
- Los clientes nuevos usan `credential_slot = tenant_vault`.
- Los IDs de secretos se guardan en `arca_tenant_credentials`; el contenido de certificado y clave privada vive cifrado en Supabase Vault.
- Usuarios autenticados normales no tienen permisos de lectura sobre `arca_tenant_credentials` ni sobre los RPC de Vault.
- `arca-test` y `arca-invoice` obtienen siempre el `company_id` desde el usuario autenticado antes de resolver credenciales.
- **La Económica** conserva por compatibilidad su `credential_slot = pilot_default`. No asignar ese slot a ningún otro comercio.
- Para diagnosticar un cliente: revisar Configuración → ARCA → **Probar conexión**. El error debe resolverse sobre ese tenant, nunca cambiando credenciales globales.
- Si se regenera el CSR, el certificado anterior deja de corresponder con la nueva clave. Hay que tramitar y subir un certificado nuevo.

## Seguridad

- La clave privada generada por Comercio Lleno nunca se muestra ni se descarga al navegador.
- Certificado y clave se resuelven exclusivamente del lado servidor.
- La configuración ARCA sólo puede iniciarla el rol **Propietario**.
- `arca-setup`, `arca-test` y `arca-invoice` requieren autenticación; la facturación siempre se resuelve contra el tenant de la sesión.
