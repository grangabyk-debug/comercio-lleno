export type Solution = {
  slug: string
  eyebrow: string
  title: string
  accent: string
  description: string
  intro: string
  painTitle: string
  pains: string[]
  uses: string[]
  searchTerms: string[]
  faq: { question: string; answer: string }[]
}

export const solutions: Solution[] = [
  {
    slug: 'sistema-para-kioscos',
    eyebrow: 'SISTEMA PARA KIOSCOS',
    title: 'Vendé rápido incluso cuando',
    accent: 'hay fila en el mostrador.',
    description: 'Sistema POS para kioscos con ventas, stock, caja, lector de códigos, impresora térmica y seguimiento desde el celular.',
    intro: 'Comercio Lleno concentra en una sola pantalla lo que más necesita un kiosco: cobrar rápido, encontrar productos, controlar faltantes y saber cómo viene la caja.',
    painTitle: 'Menos tiempo buscando. Más tiempo vendiendo.',
    pains: ['Muchos productos y precios que cambian seguido', 'Necesidad de cobrar rápido en horarios de mayor movimiento', 'Faltantes que se descubren recién cuando el cliente pide', 'Caja difícil de controlar cuando trabajan varias personas'],
    uses: ['Venta rápida desde mostrador', 'Búsqueda y scanner de códigos', 'Control de stock y productos', 'Caja y seguimiento de ventas', 'Facturación electrónica ARCA', 'Consulta del negocio desde el celular'],
    searchTerms: ['sistema para kioscos', 'programa para kiosco', 'pos para kiosco', 'control de stock kiosco'],
    faq: [
      {question:'¿Sirve para un kiosco con muchos productos?',answer:'Sí. Podés cargar productos, buscarlos por nombre o código y trabajar con lector de códigos para acelerar el mostrador.'},
      {question:'¿Puedo controlar el kiosco desde el celular?',answer:'Sí. La versión móvil permite consultar y operar funciones clave del comercio desde una pantalla chica.'},
      {question:'¿Incluye facturación electrónica?',answer:'Sí. Comercio Lleno contempla facturación electrónica ARCA una vez configurados los datos fiscales, certificado y punto de venta.'},
    ],
  },
  {
    slug: 'sistema-para-almacenes',
    eyebrow: 'SISTEMA PARA ALMACENES',
    title: 'Ordená ventas, caja y stock',
    accent: 'sin complicar el mostrador.',
    description: 'Sistema para almacenes y autoservicios con punto de venta, control de stock, caja, facturación ARCA y gestión desde computadora o celular.',
    intro: 'Ideal para almacenes que necesitan pasar de la libreta o planilla a un sistema simple, sin perder velocidad al momento de atender.',
    painTitle: 'Todo lo importante del almacén, en un mismo lugar.',
    pains: ['Precios y stock repartidos entre papeles o planillas', 'Difícil saber cuánto se vendió realmente durante el día', 'Productos que se terminan sin aviso', 'Información del negocio que queda sólo en la computadora del local'],
    uses: ['Ventas y caja diaria', 'Productos y precios', 'Alertas y control de stock', 'Scanner de códigos', 'Facturación ARCA', 'Seguimiento desde el celular'],
    searchTerms: ['sistema para almacenes', 'programa para almacén', 'sistema de ventas almacén', 'stock para almacén'],
    faq: [
      {question:'¿Tengo que cargar todo antes de empezar?',answer:'No. La idea es que puedas crear tu comercio y completar la configuración progresivamente.'},
      {question:'¿Funciona con lector de códigos?',answer:'Sí. Comercio Lleno contempla lectores USB y también herramientas móviles para trabajar con códigos.'},
      {question:'¿Puedo ver las ventas del día desde afuera del local?',answer:'Sí. La experiencia móvil está pensada para consultar y gestionar el negocio desde el celular.'},
    ],
  },
  {
    slug: 'sistema-para-ferreterias',
    eyebrow: 'SISTEMA PARA FERRETERÍAS',
    title: 'Encontrá cada producto y',
    accent: 'mantené el stock bajo control.',
    description: 'Software para ferreterías con ventas, productos, control de stock, caja, facturación electrónica y acceso desde celular.',
    intro: 'Cuando el catálogo crece, encontrar rápido un producto y saber si queda stock pasa a ser parte de la venta. Comercio Lleno reúne ambas cosas en el mismo flujo.',
    painTitle: 'Un catálogo grande no debería volver lenta la atención.',
    pains: ['Muchísimas referencias y variantes', 'Stock difícil de recordar de memoria', 'Búsquedas lentas durante la atención', 'Necesidad de seguir ventas y caja sin estar siempre en el local'],
    uses: ['Buscador de productos', 'Stock por producto', 'Venta desde POS', 'Lectores de códigos', 'Caja y reportes', 'Facturación electrónica ARCA'],
    searchTerms: ['sistema para ferreterías', 'software ferretería', 'programa de stock ferretería', 'pos ferretería'],
    faq: [
      {question:'¿Puedo manejar muchos productos?',answer:'Sí. El sistema está orientado a catálogos comerciales y permite buscar, vender y controlar stock desde el mismo entorno.'},
      {question:'¿Sirve para controlar caja?',answer:'Sí. Ventas y caja forman parte del flujo principal de Comercio Lleno.'},
      {question:'¿Tiene prueba gratis?',answer:'Sí. Podés crear una cuenta y probar Comercio Lleno durante 14 días sin tarjeta.'},
    ],
  },
  {
    slug: 'sistema-para-locales-de-ropa',
    eyebrow: 'SISTEMA PARA LOCALES DE ROPA',
    title: 'Controlá el negocio sin perder',
    accent: 'de vista el mostrador.',
    description: 'Sistema de ventas para locales de ropa con stock, caja, productos, facturación electrónica ARCA y gestión móvil.',
    intro: 'Comercio Lleno ayuda a ordenar ventas, productos y caja para que el equipo pueda atender y el dueño pueda seguir el negocio desde cualquier lugar.',
    painTitle: 'Información clara para vender y reponer mejor.',
    pains: ['Stock que cambia durante todo el día', 'Necesidad de saber qué se vendió sin revisar tickets uno por uno', 'Caja y ventas difíciles de conciliar', 'Poca visibilidad cuando el dueño no está en el local'],
    uses: ['Ventas desde mostrador', 'Productos y stock', 'Caja diaria', 'Reportes de ventas', 'Facturación ARCA', 'Panel desde celular'],
    searchTerms: ['sistema para local de ropa', 'software para indumentaria', 'pos local de ropa', 'control de stock ropa'],
    faq: [
      {question:'¿Puedo usarlo desde el celular?',answer:'Sí. Comercio Lleno tiene una experiencia móvil específica para operar y consultar el negocio.'},
      {question:'¿Puedo empezar sin configurar ARCA?',answer:'Sí. Podés crear la cuenta y completar la configuración fiscal después desde Configuración.'},
      {question:'¿Cuánto dura la prueba?',answer:'La prueba gratuita dura 14 días y no requiere tarjeta para comenzar.'},
    ],
  },
  {
    slug: 'sistema-para-dieteticas',
    eyebrow: 'SISTEMA PARA DIETÉTICAS',
    title: 'Stock, caja y ventas',
    accent: 'en una operación simple.',
    description: 'Sistema POS para dietéticas con control de productos, stock, ventas, caja, facturación ARCA y acceso desde celular.',
    intro: 'Una dietética puede tener cientos de productos y una rotación muy distinta entre categorías. Comercio Lleno te da una vista más ordenada de la operación diaria.',
    painTitle: 'Que el stock deje de depender de la memoria.',
    pains: ['Gran variedad de productos', 'Reposición frecuente', 'Precios que necesitan actualización', 'Necesidad de controlar ventas y caja en el mismo sistema'],
    uses: ['Gestión de productos', 'Control de stock', 'POS de ventas', 'Caja y movimientos', 'Facturación electrónica', 'Seguimiento móvil'],
    searchTerms: ['sistema para dietética', 'programa para dietética', 'pos dietética', 'stock dietética'],
    faq: [
      {question:'¿Me ayuda a controlar faltantes?',answer:'Sí. El control de stock está integrado con productos y ventas para que tengas una referencia actualizada de existencias.'},
      {question:'¿Puedo imprimir tickets?',answer:'Sí. Comercio Lleno contempla impresoras térmicas de 58 y 80 mm.'},
      {question:'¿Funciona online?',answer:'Sí. Es un sistema web y además cuenta con capacidades pensadas para continuidad operativa cuando hay problemas de conectividad.'},
    ],
  },
  {
    slug: 'sistema-para-pet-shops',
    eyebrow: 'SISTEMA PARA PET SHOPS',
    title: 'Organizá productos, ventas y stock',
    accent: 'desde una sola pantalla.',
    description: 'Sistema de gestión para pet shops con punto de venta, stock, productos, caja, facturación ARCA y versión móvil.',
    intro: 'Alimentos, accesorios, higiene y muchas referencias conviven en el mismo local. Comercio Lleno ayuda a ordenar esa operación sin sumar complejidad.',
    painTitle: 'Más visibilidad del negocio, menos controles manuales.',
    pains: ['Productos de muchas marcas y presentaciones', 'Reposición constante de artículos de alta rotación', 'Dificultad para revisar ventas y caja al cierre', 'Necesidad de consultar el negocio a distancia'],
    uses: ['Venta y caja', 'Catálogo de productos', 'Stock actualizado', 'Scanner de códigos', 'Facturación ARCA', 'Acceso desde celular'],
    searchTerms: ['sistema para pet shop', 'software pet shop', 'pos pet shop', 'control de stock pet shop'],
    faq: [
      {question:'¿Funciona con códigos de barra?',answer:'Sí. El sistema contempla lectores USB y herramientas de escaneo para agilizar la identificación de productos.'},
      {question:'¿Puedo usarlo en más de una sucursal?',answer:'El plan publicado actualmente incluye hasta 2 sucursales.'},
      {question:'¿Puedo probarlo antes de pagar?',answer:'Sí. La prueba es de 14 días sin tarjeta.'},
    ],
  },
  {
    slug: 'sistema-para-perfumerias',
    eyebrow: 'SISTEMA PARA PERFUMERÍAS',
    title: 'Vendé y controlá stock',
    accent: 'sin trabajar con planillas.',
    description: 'Sistema para perfumerías con ventas, stock, productos, caja, lector de códigos, facturación ARCA y gestión móvil.',
    intro: 'Comercio Lleno reúne catálogo, stock, ventas y caja para que una perfumería pueda operar con información más clara y menos controles paralelos.',
    painTitle: 'Un sistema para la operación diaria real.',
    pains: ['Catálogo amplio y precios que cambian', 'Productos similares que necesitan búsqueda rápida', 'Stock difícil de controlar manualmente', 'Necesidad de revisar ventas sin estar físicamente en el local'],
    uses: ['Productos y precios', 'Venta rápida', 'Control de stock', 'Caja', 'Facturación electrónica', 'Consulta móvil'],
    searchTerms: ['sistema para perfumería', 'programa perfumería', 'pos perfumería', 'stock perfumería'],
    faq: [
      {question:'¿Tiene buscador de productos?',answer:'Sí. La operación de ventas está pensada para encontrar productos y trabajar con códigos de manera ágil.'},
      {question:'¿Puedo facturar con ARCA?',answer:'Sí. La facturación electrónica se integra una vez completada la configuración fiscal correspondiente.'},
      {question:'¿Necesito instalar un programa?',answer:'Comercio Lleno es una plataforma web, por lo que la operación principal se realiza desde el navegador.'},
    ],
  },
  {
    slug: 'control-de-stock-para-comercios',
    eyebrow: 'CONTROL DE STOCK PARA COMERCIOS',
    title: 'Sabé qué tenés antes de',
    accent: 'descubrirlo en el mostrador.',
    description: 'Control de stock online para comercios integrado con ventas, productos, caja, scanner y seguimiento desde celular.',
    intro: 'El stock sirve cuando forma parte de la venta. Comercio Lleno conecta productos, existencias y operación diaria para reducir controles manuales.',
    painTitle: 'El stock deja de ser una planilla aparte.',
    pains: ['Faltantes detectados tarde', 'Stock anotado en distintos lugares', 'Diferencias entre lo vendido y lo disponible', 'Dificultad para consultar existencias fuera del local'],
    uses: ['Productos centralizados', 'Stock conectado con ventas', 'Búsqueda y códigos', 'Consulta móvil', 'Caja y ventas en el mismo sistema', 'Operación web'],
    searchTerms: ['control de stock para comercios', 'sistema de stock', 'programa de inventario comercio', 'stock online negocio'],
    faq: [
      {question:'¿El stock está separado de las ventas?',answer:'No. La propuesta es trabajar productos, ventas y existencias dentro del mismo sistema.'},
      {question:'¿Puedo consultar stock desde el celular?',answer:'Sí. La experiencia móvil permite trabajar y consultar información comercial desde el teléfono.'},
      {question:'¿Sirve sólo para stock?',answer:'No. Comercio Lleno también incluye ventas, caja, facturación y otras herramientas de gestión comercial.'},
    ],
  },
  {
    slug: 'punto-de-venta-online',
    eyebrow: 'PUNTO DE VENTA ONLINE',
    title: 'Un POS para vender hoy y',
    accent: 'seguir el negocio después.',
    description: 'Punto de venta online para comercios en Argentina con ventas, stock, caja, ARCA, scanner, impresora térmica y acceso móvil.',
    intro: 'No es sólo una pantalla para cobrar. Comercio Lleno conecta el mostrador con stock, caja, facturación y seguimiento del negocio.',
    painTitle: 'El punto de venta como centro de la operación.',
    pains: ['Sistemas de caja aislados del stock', 'Procesos duplicados para vender y facturar', 'Poca información cuando termina el turno', 'Dependencia de una única computadora'],
    uses: ['POS online', 'Caja y ventas', 'Productos y stock', 'Facturación ARCA', 'Impresora térmica y scanner', 'Acceso desde celular'],
    searchTerms: ['punto de venta online', 'pos online argentina', 'sistema pos comercio', 'software punto de venta'],
    faq: [
      {question:'¿Qué necesito para usar el POS?',answer:'Podés comenzar desde un navegador. Luego podés sumar lector de códigos, impresora térmica y la configuración fiscal que necesites.'},
      {question:'¿Tiene versión móvil?',answer:'Sí. Comercio Lleno incluye una experiencia móvil específica para operar el comercio.'},
      {question:'¿Puedo probarlo gratis?',answer:'Sí. Tenés 14 días de prueba sin tarjeta.'},
    ],
  },
  {
    slug: 'sistema-de-caja-para-comercios',
    eyebrow: 'SISTEMA DE CAJA PARA COMERCIOS',
    title: 'La caja conectada con',
    accent: 'lo que realmente vendés.',
    description: 'Sistema de caja para comercios con ventas, productos, stock, facturación electrónica y control desde computadora o celular.',
    intro: 'En lugar de cerrar el día comparando información de varios lados, Comercio Lleno reúne la operación de venta y caja dentro del mismo entorno.',
    painTitle: 'Menos conciliación manual al final del día.',
    pains: ['Ventas y caja registradas por separado', 'Dificultad para revisar movimientos', 'Poco control cuando trabajan empleados', 'Información que no está disponible fuera del local'],
    uses: ['Ventas conectadas con caja', 'Seguimiento de movimientos', 'Productos y stock', 'Facturación ARCA', 'Usuarios y operación comercial', 'Acceso móvil'],
    searchTerms: ['sistema de caja para comercio', 'programa de caja', 'caja online comercio', 'sistema ventas y caja'],
    faq: [
      {question:'¿La caja se integra con las ventas?',answer:'Sí. Ventas y caja forman parte del mismo flujo operativo.'},
      {question:'¿Puedo usar empleados?',answer:'Comercio Lleno contempla usuarios y operación por empleados dentro de la gestión del comercio.'},
      {question:'¿Puedo entrar desde otro dispositivo?',answer:'Sí. Al ser una plataforma web y contar con experiencia móvil, podés acceder desde distintos dispositivos compatibles.'},
    ],
  },
]

export const solutionsBySlug = Object.fromEntries(solutions.map((solution) => [solution.slug, solution])) as Record<string, Solution>
