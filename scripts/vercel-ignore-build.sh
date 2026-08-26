#!/usr/bin/env bash
set -euo pipefail

BRANCH="${VERCEL_GIT_COMMIT_REF:-}"
BASE_SHA="${VERCEL_GIT_PREVIOUS_SHA:-}"
QA_BRANCH="feat/servicios-flex-doble-direccion-20260826"

# Regla de ahorro: Vercel no debe compilar ramas de trabajo/preview.
# Sólo main, staging y la rama explícita de QA pueden consumir un build automático.
if [ -n "$BRANCH" ] && [ "$BRANCH" != "main" ] && [ "$BRANCH" != "staging" ] && [ "$BRANCH" != "$QA_BRANCH" ]; then
  echo "Rama $BRANCH no habilitada para deploy automático: omitir build."
  exit 0
fi

# En main/staging/QA, si no existe una referencia previa confiable, compilamos
# por seguridad para no perder una publicación real o una validación explícita.
if [ -z "$BASE_SHA" ]; then
  echo "Sin VERCEL_GIT_PREVIOUS_SHA en rama deployable: ejecutar build."
  exit 1
fi

if ! git cat-file -e "${BASE_SHA}^{commit}" 2>/dev/null; then
  echo "El commit previo no está disponible en rama deployable: ejecutar build."
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
WEB_RELEVANT="$(printf '%s\n' "$CHANGED_FILES" | grep -Ev '^(native-app/|docs/|\.github/)|\.md$' || true)"

if [ -z "$WEB_RELEVANT" ]; then
  echo "Sólo cambiaron Android, documentación o workflows: omitir build de Vercel."
  exit 0
fi

echo "Hay cambios que afectan la web: ejecutar build."
printf '%s\n' "$WEB_RELEVANT"
exit 1