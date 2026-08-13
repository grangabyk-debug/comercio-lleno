# Edición rápida de productos

- Sólo una fila de producto es editable a la vez.
- Al seleccionar otra fila, los cambios pendientes de la anterior se guardan antes de abrir la siguiente.
- El botón `Guardar cambios` permite guardar explícitamente la fila activa.
- Los campos numéricos cuyo valor es cero se limpian visualmente al recibir foco para facilitar la escritura.
- Los productos con promoción porcentual mantienen bloqueado el precio minorista directo; el descuento se administra desde Promociones.
- El aumento masivo usa una operación atómica de PostgreSQL para precio minorista o mayorista.
