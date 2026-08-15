#!/usr/bin/env bash
set -euo pipefail

BASE_SHA="${VERCEL_GIT_PREVIOUS_SHA:-}"

# En el primer deploy sin referencia previa, compilamos por seguridad.
if [ -z "$BASE_SHA" ]; then
  echo "Sin VERCEL_GIT_PREVIOUS_SHA: ejecutar build."
  exit 1
fi

CHANGED_FILES="$(git diff --name-only "$BASE_SHA" HEAD || true)"

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
