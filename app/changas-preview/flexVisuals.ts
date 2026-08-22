const fallback='https://images.pexels.com/photos/590041/pexels-photo-590041.jpeg?auto=compress&cs=tinysrgb&w=900'
const rules:[RegExp,string][]=[
 [/mascota|perro|animal|paseo/i,'https://images.pexels.com/photos/7210748/pexels-photo-7210748.jpeg?auto=compress&cs=tinysrgb&w=900'],
 [/evento|show|recital|acredit|recepci/i,'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=900'],
 [/mudanza|log[ií]st|carga|dep[oó]sito|traslado/i,'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?auto=compress&cs=tinysrgb&w=900'],
 [/foto|video|reel|contenido|redes|creativ/i,'https://images.pexels.com/photos/3379943/pexels-photo-3379943.jpeg?auto=compress&cs=tinysrgb&w=900'],
 [/gastronom|cocina|comida|mozo|catering/i,'https://images.pexels.com/photos/4252139/pexels-photo-4252139.jpeg?auto=compress&cs=tinysrgb&w=900'],
 [/clase|ayuda|cuidado|acompa/i,'https://images.pexels.com/photos/7551617/pexels-photo-7551617.jpeg?auto=compress&cs=tinysrgb&w=900'],
 [/casa|arreglo|mueble|armado|pintura|repar/i,'https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?auto=compress&cs=tinysrgb&w=900'],
 [/digital|excel|admin|dato|comput|remoto|oficina/i,fallback],
]
export function flexCategoryImage(category:string){return rules.find(([re])=>re.test(category))?.[1]||fallback}
