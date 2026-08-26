const pexels=(id:number)=>`https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`

const categoryImages:Record<string,string>={
 'casa y arreglos':pexels(6474122),
 'armado e instalacion':pexels(5805491),
 'jardineria y exterior':pexels(6728926),
 'mudanzas':pexels(7464495),
 'fletes y mandados':pexels(13432013),
 'eventos':pexels(1190297),
 'gastronomia':pexels(5779821),
 'mascotas':pexels(7210748),
 'clases particulares':pexels(6929213),
 'idiomas':pexels(5427870),
 'tecnologia y soporte':pexels(7639370),
 'administracion y excel':pexels(34639577),
 'contenido y foto':pexels(3379943),
 'diseno':pexels(13451104),
 'redes sociales':pexels(8360497),
 'belleza y estetica':pexels(3764014),
 'costura y arreglos de ropa':pexels(5830692),
 'compras y tramites':pexels(4971951),
 'deportes y entrenamiento':pexels(2294361),
 'musica y entretenimiento':pexels(16844637),
 'otros':pexels(8488061),
}

const fallback=pexels(8488061)

function key(value:string){
 return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim()
}

const fallbackRules:[RegExp,string][]=[
 [/jardin|pasto|cesped|exterior|plantas|parqu/i,categoryImages['jardineria y exterior']],
 [/armad|instal|mueble|biblioteca|placard/i,categoryImages['armado e instalacion']],
 [/casa|arreglo|repar|pintura|pared|mantenim/i,categoryImages['casa y arreglos']],
 [/mudanza|mover|cajas/i,categoryImages['mudanzas']],
 [/flete|mandado|mensajer|envio|retiro/i,categoryImages['fletes y mandados']],
 [/evento|acredit|recepci|fiesta/i,categoryImages['eventos']],
 [/gastronom|cocina|comida|chef|catering/i,categoryImages['gastronomia']],
 [/mascota|perro|gato|animal|paseo/i,categoryImages['mascotas']],
 [/idioma|ingles|portugues|frances|tradu/i,categoryImages['idiomas']],
 [/clase|profesor|tutor|apoyo escolar/i,categoryImages['clases particulares']],
 [/tecnolog|soporte|comput|pc|notebook|celular/i,categoryImages['tecnologia y soporte']],
 [/excel|admin|planilla|dato|oficina|gestion/i,categoryImages['administracion y excel']],
 [/foto|video|reel|contenido/i,categoryImages['contenido y foto']],
 [/diseno|grafico|ilustr|branding/i,categoryImages['diseno']],
 [/redes|social media|community|instagram|tiktok/i,categoryImages['redes sociales']],
 [/belleza|estetica|maquill|peinado|manicur/i,categoryImages['belleza y estetica']],
 [/costura|ropa|arreglo de ropa|coser|sastr/i,categoryImages['costura y arreglos de ropa']],
 [/compras|tramite|supermercado|gestoria/i,categoryImages['compras y tramites']],
 [/deporte|entrenamiento|fitness|personal trainer/i,categoryImages['deportes y entrenamiento']],
 [/musica|entretenimiento|guitarra|cantante|show/i,categoryImages['musica y entretenimiento']],
]

export function flexCategoryImage(category:string){
 const normalized=key(category)
 return categoryImages[normalized]||fallbackRules.find(([re])=>re.test(normalized))?.[1]||fallback
}
