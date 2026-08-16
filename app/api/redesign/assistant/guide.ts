function normalise(value:string){return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim()}

const overview=`Comercio Lleno es un sistema POS online para comercios. Desde la misma plataforma podés vender y cobrar, manejar productos y stock, controlar caja, consultar reportes, facturar electrónicamente con ARCA, trabajar con lectores de códigos e impresoras térmicas, usar Mercado Pago Point, vincular WhatsApp, aprovechar funciones de IA y operar funciones clave desde el celular. También cuenta con modo offline para sostener la operación cuando se corta Internet.`

const productGuide=`Para agregar o editar un producto:
1. Entrá a Productos desde el menú principal.
2. Para crear uno nuevo, tocá Agregar producto y completá nombre, código si corresponde, categoría, precio, costo y stock.
3. Para modificar uno existente, buscalo y abrí su ficha.
4. Revisá los datos y tocá Guardar.
Si manejás stock, también podés definir mínimos para detectar faltantes y preparar reposición.`

const whatsappGuide=`Para asociar WhatsApp al comercio:
1. Entrá a Configuración.
2. Abrí Integraciones y elegí WhatsApp.
3. Tocá Vincular WhatsApp por QR.
4. En el celular del comercio abrí WhatsApp > Dispositivos vinculados > Vincular un dispositivo.
5. Escaneá el QR que muestra Comercio Lleno.
6. Esperá a que el estado cambie a Conectado y, si querés, usá Enviar mensaje de test para comprobarlo.
Desde esa misma sección podés revisar automatizaciones y funciones de WhatsApp + IA. Para desvincular el número, usá Desvincular WhatsApp.`

const mercadoPagoGuide=`Para vincular un Mercado Pago Point físico:
1. Entrá a Configuración > Integraciones > Mercado Pago.
2. Tocá Conectar Mercado Pago y autorizá la cuenta si el sistema te lo pide.
3. Con el Point encendido y asociado a esa cuenta, elegilo en la lista de dispositivos.
4. Tocá Usar este Point para configurarlo en modo PDV.
5. Cuando figure Point listo, al cobrar con Mercado Pago el importe se envía al Point; Comercio Lleno espera la confirmación del pago antes de cerrar la venta. En pagos divididos, se envía solamente la parte correspondiente a Mercado Pago.`

const arcaGuide=`La facturación electrónica con ARCA se configura desde Configuración > Ventas y facturación > ARCA. Ahí podés revisar el estado de conexión, servicio, punto de venta y entorno. Una vez completada la configuración fiscal, la emisión queda integrada al flujo de venta. Si ARCA no está listo, revisá primero el estado que muestra esa pantalla antes de intentar facturar.`

const printerGuide=`La impresora se configura desde Configuración > Equipos y dispositivos > Impresora y tickets. Comercio Lleno contempla impresoras térmicas de 58 y 80 mm y lectores USB. Elegí el formato y el modo de impresión que correspondan a tu equipo, guardá la configuración y hacé una prueba antes de usarla en caja.`

const mobileGuide=`Sí, Comercio Lleno está pensado para usarse también desde el celular. La experiencia móvil permite consultar y operar funciones clave del negocio, vender, buscar productos, escanear códigos y trabajar con caja y facturación según los permisos del usuario. La configuración móvil está en Configuración > Equipos y dispositivos > Móvil.`

const stockGuide=`El stock se administra desde Productos y desde Configuración > Ventas y facturación > Stock. Cada venta puede descontar existencias automáticamente. También podés trabajar con stock mínimo, consultar productos con stock bajo y usar Pedido IA+ para priorizar reposición según demanda reciente y existencias.`

const usersGuide=`Los accesos se administran desde Configuración > Usuarios y permisos. El propietario puede crear usuarios y definir qué puede hacer cada persona: vender, abrir o cerrar caja, ver reportes, administrar stock, editar productos, gestionar compras, proveedores, clientes, promociones y otras funciones sensibles. Cada usuario ve solamente lo que habilitan su rol y sus permisos.`

const branchesGuide=`Las sucursales se administran desde Configuración > Comercio > Datos y sucursales. El local principal funciona como primera sucursal y el propietario puede agregar otras. La información se mantiene dentro del comercio correspondiente y las funciones que soportan sucursal respetan ese alcance.`

const offlineGuide=`Comercio Lleno tiene modo offline para sostener la operación cuando se corta Internet en un equipo que ya tenga una copia local preparada. Las ventas pueden quedar en cola y sincronizarse al recuperar conexión. Las funciones que dependen de servicios externos, como una autorización fiscal en línea, pueden quedar pendientes hasta volver a tener Internet.`

const aiGuide=`El Asistente IA puede consultar datos reales del comercio autenticado, según los permisos del usuario: ventas por fecha o período, facturación registrada, ticket promedio, productos más vendidos, cantidad de productos, precios, stock bajo y prioridades de reposición. Además puede explicarte cómo usar Comercio Lleno, sus integraciones, configuración, versión móvil y funciones publicadas del sistema.`

const supportGuide=`Si necesitás una persona, dentro del Asistente IA está el bloque Ayuda humana. Al abrirlo podés escribir sin salir de Comercio Lleno y el mensaje llega a la bandeja de soporte de Central Llena.`

const trialGuide=`La propuesta publicada de Comercio Lleno incluye una prueba de 14 días sin tarjeta. El sistema está orientado a que durante la prueba puedas cargar productos, vender y recorrer el flujo real del mostrador. Para condiciones comerciales vigentes, tomá siempre como referencia la sección Precio de comerciolleno.com.`

export function commerceGuideAnswer(question:string){
  const q=normalise(question)
  if(!q)return null

  if(/como (agrego|agregar|creo|crear|edito|editar).*(producto)|producto.*(agrego|agregar|edito|editar)/.test(q))return productGuide
  if(/whatsapp|wsp/.test(q)&&/(asoci|vincul|conect|qr|configur|automat|ia|mensaje)/.test(q))return whatsappGuide
  if(/mercado pago|point|posnet/.test(q)&&/(asoci|vincul|conect|configur|cobrar|terminal|dispositivo)/.test(q))return mercadoPagoGuide
  if(/arca|factura electronica|facturacion electronica|wsfe|punto de venta fiscal/.test(q))return arcaGuide
  if(/impresora|ticket|58 mm|80 mm|termica|lector usb/.test(q)&&/(configur|conect|imprim|papel|scanner|lector)/.test(q))return printerGuide
  if(/celular|movil|telefono|android|scanner movil/.test(q)&&/(usar|funcion|configur|vender|manejar|controlar|escanear)/.test(q))return mobileGuide
  if(/stock|inventario|reposicion|reponer/.test(q)&&/(como|configur|manejar|control|funcion|sirve|bajo|minimo)/.test(q))return stockGuide
  if(/usuario|empleado|permiso|rol/.test(q)&&/(crear|configur|administr|puede|acceso)/.test(q))return usersGuide
  if(/sucursal|local principal/.test(q)&&/(crear|agregar|configur|administr|manejar)/.test(q))return branchesGuide
  if(/offline|sin internet|sin conexion|se corta internet/.test(q))return offlineGuide
  if(/ayuda humana|soporte humano|hablar con (una )?persona/.test(q))return supportGuide
  if(/14 dias|prueba gratis|sin tarjeta|precio|cuanto cuesta/.test(q))return trialGuide
  if(/que (puedo|se puede) hacer con ia|que hace (la )?ia|para que sirve (el )?asistente|asistente ia/.test(q))return aiGuide
  if(/que (puedo|se puede) hacer con comercio lleno|que es comercio lleno|para que sirve comercio lleno|funciones de comercio lleno|que incluye comercio lleno|contame.*comercio lleno|caracteristicas.*comercio lleno/.test(q))return overview

  return null
}
