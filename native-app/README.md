# Comercio Lleno Android

Beta Android de Comercio Lleno que mantiene la misma experiencia visual y funcional de `https://www.comerciolleno.com/movil`.

## Alcance de esta beta

- Login con las mismas cuentas de Comercio Lleno.
- Inicio / Nueva venta / Productos / Caja / Movimientos según la experiencia móvil vigente.
- Escáner de códigos con la cámara del teléfono.
- Inteligencia artificial móvil.
- Configuración y permisos asociados al usuario/comercio.
- Misma base de datos y mismos datos que la web.
- Fallback visual cuando la app no puede conectarse al servidor.

## Identidad Android

- App ID: `com.llenagroup.comerciolleno`
- Nombre: `Comercio Lleno`
- Versión inicial: `1.0.0-beta.1`

## Compilación

El workflow `Build Comercio Lleno Android Beta` crea un APK debug automáticamente en la rama `app/android-mobile-v1` y lo publica como artefacto de GitHub Actions.

## Nota de distribución

Esta primera compilación es una beta instalable para pruebas reales en Android. Antes de una publicación en Google Play se debe crear una firma release permanente, generar el AAB, completar ficha/privacidad y validar la estrategia final de contenido web embebido.
