export type PreviewGig={
 id:string;title:string;category:string;location:string;when:string;pay:string;duration:string;poster:string;posterRole:string;rating:string;verified:boolean;image:string;summary:string;requirements:string[];tags:string[]
}

export const previewGigs:PreviewGig[]=[
 {id:'armar-mueble-palermo',title:'Armar un placard y una biblioteca',category:'Casa y arreglos',location:'Palermo · CABA',when:'Hoy · desde las 17:30',pay:'$38.000',duration:'3–4 h',poster:'Ejemplo',posterRole:'Vista ilustrativa · no es una publicación real',rating:'nuevo',verified:false,image:'https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?auto=compress&cs=tinysrgb&w=900',summary:'Necesito una mano para armar dos muebles nuevos. Tengo herramientas básicas y manuales.',requirements:['Experiencia armando muebles','Cuidado del espacio','Confirmar horario antes de ir'],tags:['Ejemplo','Hoy','Herramientas','Interior']},
 {id:'fotos-emprendimiento-caballito',title:'Fotos y reels para emprendimiento',category:'Contenido y foto',location:'Caballito · CABA',when:'Sábado · 11:00',pay:'$52.000',duration:'2 h',poster:'Ejemplo',posterRole:'Vista ilustrativa · no es una publicación real',rating:'nuevo',verified:false,image:'https://images.pexels.com/photos/3379943/pexels-photo-3379943.jpeg?auto=compress&cs=tinysrgb&w=900',summary:'Buscamos alguien con buen ojo para sacar fotos de producto y 4 reels cortos para redes.',requirements:['Celular o cámara propia','Portfolio simple','Entrega digital en 72 h'],tags:['Ejemplo','Creativo','Sábado','Redes']},
 {id:'paseo-perro-belgrano',title:'Pasear a Milo este sábado',category:'Mascotas',location:'Belgrano · CABA',when:'Sábado · 13:00',pay:'$9.000',duration:'45 min',poster:'Ejemplo',posterRole:'Vista ilustrativa · no es una publicación real',rating:'nuevo',verified:false,image:'https://images.pexels.com/photos/7210748/pexels-photo-7210748.jpeg?auto=compress&cs=tinysrgb&w=900',summary:'Busco una persona responsable para un paseo puntual al mediodía. Milo es mediano, sociable y tiene correa.',requirements:['Buen trato con animales','Puntualidad','Zona Belgrano / Núñez'],tags:['Ejemplo','Puntual','Mascotas','Mediodía']},
 {id:'ayuda-evento-san-telmo',title:'Apoyo puntual para evento de marca',category:'Eventos',location:'San Telmo · CABA',when:'Viernes · 18:00 a 00:00',pay:'$46.000',duration:'6 h',poster:'Ejemplo',posterRole:'Vista ilustrativa · no es una publicación real',rating:'nuevo',verified:false,image:'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=900',summary:'Tarea puntual para recepción de invitados, entrega de acreditaciones y apoyo general durante un lanzamiento.',requirements:['Buen trato con público','Llegar 30 min antes','Confirmar alcance antes de acordar'],tags:['Ejemplo','Evento','Viernes','Noche']},
 {id:'mudanza-almagro',title:'Dos personas para una mini mudanza',category:'Mudanzas',location:'Almagro → Villa Crespo',when:'Mañana · 9:30',pay:'$32.000 c/u',duration:'3 h',poster:'Ejemplo',posterRole:'Vista ilustrativa · no es una publicación real',rating:'nuevo',verified:false,image:'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?auto=compress&cs=tinysrgb&w=900',summary:'Cajas, una mesa, sillas y un sillón chico. Ya tenemos flete; necesitamos ayuda para subir y bajar.',requirements:['Poder cargar peso moderado','Ropa cómoda','Confirmar disponibilidad'],tags:['Ejemplo','Mañana','Físico','3 horas']},
 {id:'excel-negocio-vicente-lopez',title:'Ordenar una planilla de ventas',category:'Administración y Excel',location:'Vicente López · remoto posible',when:'Esta semana',pay:'$44.000',duration:'2–3 h',poster:'Ejemplo',posterRole:'Vista ilustrativa · no es una publicación real',rating:'nuevo',verified:false,image:'https://images.pexels.com/photos/590041/pexels-photo-590041.jpeg?auto=compress&cs=tinysrgb&w=900',summary:'Tenemos un Excel con ventas y productos desordenados. Queremos filtros, totales y una vista simple.',requirements:['Excel intermedio','Explicar lo que hiciste','No compartir información del negocio'],tags:['Ejemplo','Remoto','Excel','Negocio']},
 {id:'cocina-cumple-boedo',title:'Preparación puntual para cumpleaños',category:'Gastronomía',location:'Boedo · CABA',when:'Domingo · 16:00 a 22:00',pay:'$48.000',duration:'6 h',poster:'Ejemplo',posterRole:'Vista ilustrativa · no es una publicación real',rating:'nuevo',verified:false,image:'https://images.pexels.com/photos/4252139/pexels-photo-4252139.jpeg?auto=compress&cs=tinysrgb&w=900',summary:'Servicio puntual para preparar, ordenar y servir comida en un cumpleaños familiar de 35 personas.',requirements:['Experiencia básica de cocina','Orden e higiene','Definir alcance antes de acordar'],tags:['Ejemplo','Domingo','Cocina','Evento']},
 {id:'clases-compu-adulto-mayor',title:'Clase puntual de WhatsApp y trámites digitales',category:'Clases particulares',location:'Flores · CABA',when:'A coordinar',pay:'$18.000 / clase',duration:'1 h',poster:'Ejemplo',posterRole:'Vista ilustrativa · no es una publicación real',rating:'nuevo',verified:false,image:'https://images.pexels.com/photos/7551617/pexels-photo-7551617.jpeg?auto=compress&cs=tinysrgb&w=900',summary:'Buscamos alguien paciente para una clase de uso básico del celular, WhatsApp, turnos y pagos simples.',requirements:['Paciencia','Explicar sin apuro','Encuentro puntual a coordinar'],tags:['Ejemplo','Flexible','Ayuda','1 hora']},
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
