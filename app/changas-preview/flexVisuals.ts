const fallback='https://images.pexels.com/photos/590041/pexels-photo-590041.jpeg?auto=compress&cs=tinysrgb&w=900'
const rules:[RegExp,string][]=[
 [/mascota|perro|animal|paseo/i,'https://images.pexels.com/photos/7210748/pexels-photo-7210748.jpeg?auto=compress&cs=tinysrgb&w=900'],
 [/evento|show|recital|acredit|recepci|música|entretenimiento/i,'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=900'],
 [/mudanza|flete|log[ií]st|carga|dep[oó]sito|traslado|reparto|mensajer|mandado/i,'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?auto=compress&cs=tinysrgb&w=900'],
 [/foto|video|reel|contenido|redes|creativ|diseño/i,'https://images.pexels.com/photos/3379943/pexels-photo-3379943.jpeg?auto=compress&cs=tinysrgb&w=900'],
 [/gastronom|cocina|comida|mozo|catering/i,'https://images.pexels.com/photos/4252139/pexels-photo-4252139.jpeg?auto=compress&cs=tinysrgb&w=900'],
 [/clase|idioma|niñ|cuidado|acompa|adulto/i,'https://images.pexels.com/photos/7551617/pexels-photo-7551617.jpeg?auto=compress&cs=tinysrgb&w=900'],
 [/casa|arreglo|mueble|armado|instal|pintura|repar|limpieza|jard[ií]n|exterior|costura/i,'https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?auto=compress&cs=tinysrgb&w=900'],
 [/digital|excel|admin|dato|comput|tecnolog|soporte|remoto|oficina|trámite/i,fallback],
 [/deporte|entrenamiento|fitness/i,'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=900'],
 [/belleza|estética|maquill|peinado/i,'https://images.pexels.com/photos/3764014/pexels-photo-3764014.jpeg?auto=compress&cs=tinysrgb&w=900'],
]
export function flexCategoryImage(category:string){return rules.find(([re])=>re.test(category))?.[1]||fallback}
