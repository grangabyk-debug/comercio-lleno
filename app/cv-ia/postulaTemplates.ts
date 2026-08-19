export type PostulaTemplateTier='free'|'pro'
export type PostulaTemplate={id:string;name:string;tier:PostulaTemplateTier;tagline:string;bestFor:string;accent:string;variant:string}

export const SOURCE_TEMPLATE_KEY='postula_source_template_v1'
export const DESIRED_TEMPLATE_KEY='postula_desired_template_v1'

export const POSTULA_TEMPLATES:PostulaTemplate[]=[
 {id:'pm01',name:'Clara',tier:'free',tagline:'Simple, limpia y fácil de editar.',bestFor:'Primer empleo y perfiles generales',accent:'#6b61ff',variant:'clear'},
 {id:'pm02',name:'Ordenada',tier:'free',tagline:'Jerarquía visual sin exagerar.',bestFor:'Administración, ventas y atención',accent:'#176b5b',variant:'ordered'},
 {id:'pm03',name:'ATS Simple',tier:'free',tagline:'Una columna y lectura directa.',bestFor:'Portales de empleo y búsquedas ATS',accent:'#30343b',variant:'ats'},
 {id:'pm04',name:'Executive',tier:'pro',tagline:'Fuerte, sobria y muy profesional.',bestFor:'Mandos medios, liderazgo y gestión',accent:'#1f4b73',variant:'executive'},
 {id:'pm05',name:'Editorial',tier:'pro',tagline:'Una composición con presencia de revista.',bestFor:'Comunicación, marketing y perfiles creativos',accent:'#8f2848',variant:'editorial'},
 {id:'pm06',name:'Studio',tier:'pro',tagline:'Moderna, espaciosa y visual.',bestFor:'Diseño, contenido y servicios',accent:'#6957ff',variant:'studio'},
 {id:'pm07',name:'Impact',tier:'pro',tagline:'Encabezado potente y lectura rápida.',bestFor:'Comercial, ventas y posiciones dinámicas',accent:'#d2762e',variant:'impact'},
 {id:'pm08',name:'Minimal Luxe',tier:'pro',tagline:'Elegante, cálida y diferenciada.',bestFor:'Hospitality, premium y atención al cliente',accent:'#8c6a4a',variant:'luxe'},
 {id:'pm09',name:'Tech Grid',tier:'pro',tagline:'Estructura técnica con bloques precisos.',bestFor:'Tecnología, producto y operaciones',accent:'#176b5b',variant:'tech'},
 {id:'pm10',name:'Portfolio',tier:'pro',tagline:'Más expresiva, sin perder orden.',bestFor:'Creativos, fotografía y perfiles híbridos',accent:'#b43a68',variant:'portfolio'},
]

export function getPostulaTemplate(id:string|null|undefined){return POSTULA_TEMPLATES.find(t=>t.id===String(id||'').toLowerCase())||null}
export function templateIdFromName(name:string){const m=String(name||'').match(/PostulaMejor-CV-(PM\d{2})/i);return getPostulaTemplate(m?.[1]?.toLowerCase())?.id||null}
export function templateIdFromText(text:string){const m=String(text||'').match(/POSTULAMEJOR_TEMPLATE:(pm\d{2})/i);return getPostulaTemplate(m?.[1]?.toLowerCase())?.id||null}
