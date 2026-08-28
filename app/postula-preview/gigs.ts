export type PreviewGig={
 id:string;title:string;category:string;location:string;when:string;pay:string;duration:string;poster:string;posterRole:string;rating:string;verified:boolean;image:string;summary:string;requirements:string[];tags:string[];listingType?:'request'|'offer'
}

export const previewGigs:PreviewGig[]=[
 {id:'tecnico-aire-caba',title:'Instalo y reparo aires acondicionados',category:'Casa y arreglos',location:'CABA y GBA',when:'Disponibilidad esta semana',pay:'Desde $35.000',duration:'Turnos a coordinar',poster:'Martín R.',posterRole:'Vista ilustrativa · publicación de muestra',rating:'nuevo',verified:false,image:'https://images.pexels.com/photos/5463575/pexels-photo-5463575.jpeg?auto=compress&cs=tinysrgb&w=900',summary:'Soy técnico en refrigeración. Hago instalación, mantenimiento y reparación de equipos split e inverter. Presupuesto según equipo y zona.',requirements:['Consultar disponibilidad antes de coordinar','Confirmar modelo y falla del equipo','El presupuesto final se acuerda antes del servicio'],tags:['Técnico','Aire acondicionado','CABA','Presupuesto'],listingType:'offer'},
 {id:'fotografia-producto-servicio',title:'Hago fotos y reels para productos y marcas',category:'Contenido y foto',location:'CABA · también edición remota',when:'Agenda abierta',pay:'Desde $45.000',duration:'Sesiones desde 2 h',poster:'Camila F.',posterRole:'Vista ilustrativa · publicación de muestra',rating:'nuevo',verified:false,image:'https://images.pexels.com/photos/3379943/pexels-photo-3379943.jpeg?auto=compress&cs=tinysrgb&w=900',summary:'Ofrezco fotografía de producto, contenido para redes y reels cortos. Trabajo por proyecto y entrego el material editado digitalmente.',requirements:['Contar cantidad de productos y piezas','Definir locación o modalidad','Acordar entrega y precio antes de empezar'],tags:['Fotografía','Reels','Contenido','Por proyecto'],listingType:'offer'},
 {id:'armar-mueble-palermo',title:'Armar un placard y una biblioteca',category:'Casa y arreglos',location:'Palermo · CABA',when:'Hoy · desde las 17:30',pay:'$38.000',duration:'3–4 h',poster:'Lucía M.',posterRole:'Vista ilustrativa · publicación de muestra',rating:'nuevo',verified:false,image:'https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?auto=compress&cs=tinysrgb&w=900',summary:'Necesito una mano para armar dos muebles nuevos. Tengo herramientas básicas y manuales.',requirements:['Experiencia armando muebles','Cuidado del espacio','Confirmar horario antes de ir'],tags:['Hoy','Herramientas','Interior','Armado'],listingType:'request'},
 {id:'fotos-emprendimiento-caballito',title:'Fotos y reels para emprendimiento',category:'Contenido y foto',location:'Caballito · CABA',when:'Sábado · 11:00',pay:'$52.000',duration:'2 h',poster:'Sofía D.',posterRole:'Vista ilustrativa · publicación de muestra',rating:'nuevo',verified:false,image:'https://images.pexels.com/photos/3379943/pexels-photo-3379943.jpeg?auto=compress&cs=tinysrgb&w=900',summary:'Busco a alguien con buen ojo para sacar fotos de producto y 4 reels cortos para redes, como un trabajo puntual.',requirements:['Celular o cámara propia','Portfolio simple','Entrega digital en 72 h'],tags:['Creativo','Sábado','Redes','Contenido'],listingType:'request'},
 {id:'paseo-perro-belgrano',title:'Pasear a Milo este sábado',category:'Mascotas',location:'Belgrano · CABA',when:'Sábado · 13:00',pay:'$9.000',duration:'45 min',poster:'Nicolás A.',posterRole:'Vista ilustrativa · publicación de muestra',rating:'nuevo',verified:false,image:'https://images.pexels.com/photos/7210748/pexels-photo-7210748.jpeg?auto=compress&cs=tinysrgb&w=900',summary:'Busco una persona responsable para un paseo puntual al mediodía. Milo es mediano, sociable y tiene correa.',requirements:['Buen trato con animales','Puntualidad','Zona Belgrano / Núñez'],tags:['Puntual','Mascotas','Mediodía','Belgrano'],listingType:'request'},
 {id:'ayuda-evento-san-telmo',title:'Apoyo puntual para evento de marca',category:'Eventos',location:'San Telmo · CABA',when:'Viernes · 18:00 a 00:00',pay:'$46.000',duration:'6 h',poster:'Martina P.',posterRole:'Vista ilustrativa · publicación de muestra',rating:'nuevo',verified:false,image:'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=900',summary:'Tarea puntual para recepción de invitados, entrega de acreditaciones y apoyo general durante un lanzamiento.',requirements:['Buen trato con público','Llegar 30 min antes','Confirmar alcance antes de acordar'],tags:['Evento','Viernes','Noche','Recepción'],listingType:'request'},
 {id:'mudanza-almagro',title:'Dos personas para una mini mudanza',category:'Mudanzas',location:'Almagro → Villa Crespo',when:'Mañana · 9:30',pay:'$32.000 c/u',duration:'3 h',poster:'Joaquín C.',posterRole:'Vista ilustrativa · publicación de muestra',rating:'nuevo',verified:false,image:'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?auto=compress&cs=tinysrgb&w=900',summary:'Cajas, una mesa, sillas y un sillón chico. Ya tenemos flete; necesitamos ayuda para subir y bajar.',requirements:['Poder cargar peso moderado','Ropa cómoda','Confirmar disponibilidad'],tags:['Mañana','Físico','3 horas','Mudanza'],listingType:'request'},
 {id:'excel-negocio-vicente-lopez',title:'Ordenar una planilla de ventas',category:'Administración y Excel',location:'Vicente López · remoto posible',when:'Esta semana',pay:'$44.000',duration:'2–3 h',poster:'Valentina S.',posterRole:'Vista ilustrativa · publicación de muestra',rating:'nuevo',verified:false,image:'https://images.pexels.com/photos/590041/pexels-photo-590041.jpeg?auto=compress&cs=tinysrgb&w=900',summary:'Tenemos un Excel con ventas y productos desordenados. Queremos filtros, totales y una vista simple.',requirements:['Excel intermedio','Explicar lo que hiciste','No compartir información del negocio'],tags:['Remoto','Excel','Negocio','Administración'],listingType:'request'},
 {id:'cocina-cumple-boedo',title:'Preparación puntual para cumpleaños',category:'Gastronomía',location:'Boedo · CABA',when:'Domingo · 16:00 a 22:00',pay:'$48.000',duration:'6 h',poster:'Paula B.',posterRole:'Vista ilustrativa · publicación de muestra',rating:'nuevo',verified:false,image:'https://images.pexels.com/photos/4252139/pexels-photo-4252139.jpeg?auto=compress&cs=tinysrgb&w=900',summary:'Servicio puntual para preparar, ordenar y servir comida en un cumpleaños familiar de 35 personas.',requirements:['Experiencia básica de cocina','Orden e higiene','Definir alcance antes de acordar'],tags:['Domingo','Cocina','Evento','Boedo'],listingType:'request'},
 {id:'clases-compu-adulto-mayor',title:'Clase puntual de WhatsApp y trámites digitales',category:'Clases particulares',location:'Flores · CABA',when:'A coordinar',pay:'$18.000 / clase',duration:'1 h',poster:'Federico G.',posterRole:'Vista ilustrativa · publicación de muestra',rating:'nuevo',verified:false,image:'https://images.pexels.com/photos/7551617/pexels-photo-7551617.jpeg?auto=compress&cs=tinysrgb&w=900',summary:'Busco a alguien paciente para una clase de uso básico del celular, WhatsApp, turnos y pagos simples.',requirements:['Paciencia','Explicar sin apuro','Encuentro puntual a coordinar'],tags:['Flexible','Ayuda','1 hora','Celular'],listingType:'request'},
]

export const gigCategories=[
 'Para hoy',
 'Casa y arreglos',
 'Armado e instalación',
 'Jardinería y exterior',
 'Mudanzas',
 'Fletes y mandados',
 'Eventos',
 'Gastronomía',
 'Mascotas',
 'Clases particulares',
 'Idiomas',
 'Tecnología y soporte',
 'Administración y Excel',
 'Contenido y foto',
 'Diseño',
 'Redes sociales',
 'Belleza y estética',
 'Costura y arreglos de ropa',
 'Compras y trámites',
 'Deportes y entrenamiento',
 'Música y entretenimiento',
 'Otros'
]
