# Nexo access contract

- `/empresas` is always the standard employer experience, including on mobile.
- Nexo is never offered as an automatic first-entry alternative.
- `/empresas/movil` is the premium Nexo mobile experience.
- Nexo requires an active authorized company subscription with plan `seleccion`, `escala`, or `empresa`.
- The UI gate is not the security boundary: `/api/postula/employer-assistant` re-checks membership and paid entitlement on every request.
- Nexo is scoped to the authenticated company and cannot switch tenant through chat input.
