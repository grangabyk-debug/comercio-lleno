#!/usr/bin/env bash
set -euo pipefail

BASE_SHA="${VERCEL_GIT_PREVIOUS_SHA:-}"

# En el primer deploy sin referencia previa, compilamos por seguridad.
if [ -z "$BASE_SHA" ]; then
  echo "Sin VERCEL_GIT_PREVIOUS_SHA: ejecutar build."
  exit 1
fi

# Si Vercel apunta a un commit previo que ya no está disponible en este checkout
# (por ejemplo, después de rearmar la rama staging), no podemos comparar con
# seguridad. En ese caso hacemos el build en vez de omitirlo por error.
if ! git cat-file -e "${BASE_SHA}^{commit}" 2>/dev/null; then
  echo "El commit previo no está disponible: ejecutar build."
  exit 1
fi

if ! CHANGED_FILES="$(git diff --name-only "$BASE_SHA" HEAD 2>/dev/null)"; then
  echo "No se pudo comparar con el deploy previo: ejecutar build."
  exit 1
fi

if [ -z "$CHANGED_FILES" ]; then
  echo "Sin cambios desde el último deploy: omitir build."
  exit 0
fi

echo "Archivos modificados:"
printf '%s\n' "$CHANGED_FILES"

# Estos cambios no afectan la aplicación web desplegada en Vercel.
# Si todos los cambios están dentro de estas rutas, ahorramos el build.
WEB_RELEVANT="$(printf '%s\n' "$CHANGED_FILES" | grep -Ev '^(native-app/|docs/|\.github/)|\.md$' || true)"

if [ -z "$WEB_RELEVANT" ]; then
  echo "Sólo cambiaron Android, documentación o workflows: omitir build de Vercel."
  exit 0
fi

echo "Hay cambios que afectan la web: ejecutar build."
printf '%s\n' "$WEB_RELEVANT"
exit 1
