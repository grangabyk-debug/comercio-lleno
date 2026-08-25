export type CvTemplate={
 id:string
 name:string
 tier:'free'|'pro'
 layout:'classic'|'split'|'sidebar'|'timeline'|'compact'|'editorial'
 design:string
 accent:string
 soft:string
 ink:string
 font:'Arial'|'Georgia'|'Trebuchet MS'|'Verdana'
 category:string
 description:string
 photo:boolean
 scene:'paper'|'desk'|'float'|'stack'
 palette?:string[]
}

const free:CvTemplate[]=[
 {id:'pm-base-ats',name:'Buenos Aires ATS',tier:'free',layout:'classic',design:'ats-line',accent:'#171923',soft:'#f2f3f5',ink:'#111318',font:'Arial',category:'ATS',description:'Una columna, cero adornos y lectura inmediata para ATS.',photo:false,scene:'paper'},
 {id:'pm-claro',name:'Madrid Claro',tier:'free',layout:'split',design:'clean-banner',accent:'#3157d5',soft:'#eef3ff',ink:'#111827',font:'Arial',category:'Profesional',description:'Cabecera horizontal y dos zonas simples, con foto opcional.',photo:true,scene:'float',palette:['#3157d5','#167d69','#7c3aed']},
 {id:'pm-primer-trabajo',name:'Córdoba Inicial',tier:'free',layout:'sidebar',design:'student-side',accent:'#167d69',soft:'#e9f7f3',ink:'#102a26',font:'Trebuchet MS',category:'Primer empleo',description:'Estudios, cursos y habilidades primero; experiencia después.',photo:true,scene:'paper'},
 {id:'pm-administrativo',name:'Lisboa Administrativo',tier:'free',layout:'compact',design:'office-grid',accent:'#6d4bd3',soft:'#f2edff',ink:'#17151f',font:'Arial',category:'Administración',description:'Bloques compactos tipo ficha para administración y recepción.',photo:false,scene:'stack'},
 {id:'pm-servicios',name:'Lima Atención',tier:'free',layout:'classic',design:'service-card',accent:'#d65a3e',soft:'#fff0eb',ink:'#241a17',font:'Verdana',category:'Atención',description:'Sencillo, cálido y directo para comercio, gastronomía y servicios.',photo:true,scene:'desk'},
 {id:'pm-minimal',name:'Oslo Minimal',tier:'free',layout:'editorial',design:'minimal-rule',accent:'#42464f',soft:'#f3f4f6',ink:'#181a1f',font:'Georgia',category:'Minimalista',description:'Mucho aire, una línea editorial y nada que distraiga.',photo:false,scene:'float'},
 {id:'pm-rosario',name:'Rosario Profesional',tier:'free',layout:'split',design:'profile-top',accent:'#1d8a78',soft:'#eaf8f5',ink:'#122823',font:'Arial',category:'Profesional',description:'Foto pequeña arriba y experiencia como protagonista.',photo:true,scene:'desk',palette:['#1d8a78','#3557b7','#8a5b35']},
 {id:'pm-mendoza',name:'Mendoza Fresh',tier:'free',layout:'sidebar',design:'fresh-cap',accent:'#d77b42',soft:'#fff2e8',ink:'#2b1d15',font:'Trebuchet MS',category:'Joven',description:'Cabecera fresca y bloques básicos para perfiles jóvenes.',photo:true,scene:'float'},
 {id:'pm-neuquen',name:'Neuquén Técnico',tier:'free',layout:'timeline',design:'trade-timeline',accent:'#37647a',soft:'#edf5f8',ink:'#17272f',font:'Arial',category:'Técnico',description:'Cronología vertical clara para oficios y perfiles técnicos.',photo:false,scene:'paper'},
 {id:'pm-montevideo',name:'Montevideo Sales',tier:'free',layout:'split',design:'sales-strip',accent:'#d24f67',soft:'#fff0f3',ink:'#2b171d',font:'Verdana',category:'Ventas',description:'Franja lateral simple y foco en experiencia comercial.',photo:true,scene:'stack'},
 {id:'pm-santiago',name:'Santiago Classic',tier:'free',layout:'classic',design:'classic-serif',accent:'#3c4a5a',soft:'#f1f4f7',ink:'#171c22',font:'Georgia',category:'Clásico',description:'CV tradicional renovado, sobrio y fácil de editar.',photo:false,scene:'desk'},
 {id:'pm-palermo',name:'Palermo Color',tier:'free',layout:'editorial',design:'color-corner',accent:'#7d55d9',soft:'#f5f0ff',ink:'#211a2e',font:'Trebuchet MS',category:'Creativo',description:'Un único gesto de color y composición editorial simple.',photo:true,scene:'float',palette:['#7d55d9','#0f8a7a','#d14d5f']},
]

const pro:CvTemplate[]=[
 {id:'pm-ejecutivo',name:'Budapest Executive',tier:'pro',layout:'split',design:'executive-panel',accent:'#253142',soft:'#eef1f4',ink:'#171b23',font:'Georgia',category:'Dirección',photo:true,scene:'desk',description:'Panel ejecutivo, cabecera sobria y jerarquía de liderazgo.'},
 {id:'pm-comercial',name:'Milán Comercial',tier:'pro',layout:'sidebar',design:'kpi-sidebar',accent:'#e85b3b',soft:'#fff0eb',ink:'#211714',font:'Trebuchet MS',category:'Ventas',photo:true,scene:'float',palette:['#e85b3b','#0f8a7a','#d1a029'],description:'Columna de impacto con indicadores y logros comerciales.'},
 {id:'pm-tech',name:'Berlín Tech',tier:'pro',layout:'compact',design:'tech-console',accent:'#3567e8',soft:'#edf3ff',ink:'#111827',font:'Arial',category:'Tecnología',photo:false,scene:'stack',palette:['#3567e8','#7c3aed','#0f9f78'],description:'Grid técnico, skills visuales y módulos tipo consola.'},
 {id:'pm-hotel',name:'Barcelona Hospitality',tier:'pro',layout:'sidebar',design:'hospitality-luxe',accent:'#9a6a2f',soft:'#f8f2e8',ink:'#251e16',font:'Georgia',category:'Hotelería',photo:true,scene:'desk',description:'Composición elegante con sello premium para hospitalidad.'},
 {id:'pm-retail',name:'Riga Retail',tier:'pro',layout:'split',design:'retail-blocks',accent:'#7a43df',soft:'#f3ecff',ink:'#21182a',font:'Arial',category:'Retail',photo:true,scene:'paper',description:'Bloques modulares y objetivos visibles para retail.'},
 {id:'pm-logistica',name:'Praga Operaciones',tier:'pro',layout:'timeline',design:'ops-route',accent:'#0f766e',soft:'#e8f7f5',ink:'#102624',font:'Arial',category:'Operaciones',photo:false,scene:'float',description:'Ruta cronológica con hitos y responsabilidades operativas.'},
 {id:'pm-salud',name:'Viena Salud',tier:'pro',layout:'classic',design:'health-soft',accent:'#277f8a',soft:'#eaf7f8',ink:'#13272b',font:'Georgia',category:'Salud',photo:true,scene:'paper',description:'Tarjetas suaves, lectura calma y enfoque profesional.'},
 {id:'pm-finanzas',name:'Zúrich Finanzas',tier:'pro',layout:'compact',design:'finance-ledger',accent:'#163a6b',soft:'#edf3fa',ink:'#14202e',font:'Arial',category:'Finanzas',photo:false,scene:'desk',description:'Estética de reporte financiero con datos y métricas.'},
 {id:'pm-legal',name:'Londres Legal',tier:'pro',layout:'editorial',design:'legal-column',accent:'#665043',soft:'#f6f1ec',ink:'#241d18',font:'Georgia',category:'Legal',photo:false,scene:'paper',description:'Columna editorial seria con formación y trayectoria.'},
 {id:'pm-creative',name:'París Creative',tier:'pro',layout:'split',design:'creative-shapes',accent:'#c843d7',soft:'#fdf0ff',ink:'#211524',font:'Trebuchet MS',category:'Creativo',photo:true,scene:'float',palette:['#c843d7','#ef5b3f','#2769d8'],description:'Composición asimétrica con formas y acentos visuales.'},
 {id:'pm-producto',name:'Ámsterdam Product',tier:'pro',layout:'sidebar',design:'product-cards',accent:'#4f46e5',soft:'#eef2ff',ink:'#17172a',font:'Arial',category:'Producto',photo:true,scene:'stack',description:'Experiencia presentada como módulos de producto y proyecto.'},
 {id:'pm-marketing',name:'Valencia Marketing',tier:'pro',layout:'editorial',design:'marketing-stats',accent:'#df4f55',soft:'#fff0f1',ink:'#291718',font:'Trebuchet MS',category:'Marketing',photo:true,scene:'desk',description:'Titular fuerte, resultados y métricas como foco visual.'},
 {id:'pm-datos',name:'Helsinki Data',tier:'pro',layout:'compact',design:'data-dashboard',accent:'#2563eb',soft:'#eff6ff',ink:'#0f1f38',font:'Arial',category:'Datos',photo:false,scene:'paper',palette:['#2563eb','#0f766e','#7c3aed'],description:'Mini dashboard con barras y skills cuantitativos.'},
 {id:'pm-ingenieria',name:'Múnich Ingeniería',tier:'pro',layout:'timeline',design:'blueprint',accent:'#475569',soft:'#f1f5f9',ink:'#18212e',font:'Arial',category:'Ingeniería',photo:false,scene:'stack',description:'Retícula técnica y timeline de proyectos.'},
 {id:'pm-docencia',name:'Roma Educación',tier:'pro',layout:'classic',design:'academic-paper',accent:'#0f8a5f',soft:'#eaf8f1',ink:'#14251f',font:'Georgia',category:'Educación',photo:true,scene:'float',description:'Estética académica con formación, publicaciones y docencia.'},
 {id:'pm-gastronomia',name:'San Sebastián Gastro',tier:'pro',layout:'sidebar',design:'gastro-menu',accent:'#b45309',soft:'#fff7ed',ink:'#2b1c0d',font:'Trebuchet MS',category:'Gastronomía',photo:true,scene:'desk',description:'Jerarquía inspirada en menú editorial para gastronomía.'},
 {id:'pm-remoto',name:'Dublín Remote',tier:'pro',layout:'split',design:'remote-chips',accent:'#7c3aed',soft:'#f5f3ff',ink:'#211735',font:'Arial',category:'Remoto',photo:true,scene:'paper',description:'Idiomas, herramientas y disponibilidad en chips visibles.'},
 {id:'pm-liderazgo',name:'Nueva York Leadership',tier:'pro',layout:'editorial',design:'leadership-dark',accent:'#111827',soft:'#f3f4f6',ink:'#111827',font:'Georgia',category:'Management',photo:true,scene:'stack',description:'Cabecera oscura completa y presencia ejecutiva.'},
 {id:'pm-startup',name:'Austin Startup',tier:'pro',layout:'compact',design:'startup-bold',accent:'#16a34a',soft:'#f0fdf4',ink:'#122319',font:'Trebuchet MS',category:'Startups',photo:false,scene:'float',description:'Tipografía grande y bloques ágiles para perfiles startup.'},
 {id:'pm-customer',name:'Toronto Customer',tier:'pro',layout:'sidebar',design:'customer-score',accent:'#0284c7',soft:'#f0f9ff',ink:'#10232d',font:'Arial',category:'Customer',photo:true,scene:'desk',description:'Satisfacción, comunicación y experiencia de cliente visibles.'},
 {id:'pm-proyectos',name:'Copenhague Project',tier:'pro',layout:'timeline',design:'project-milestones',accent:'#7c2d12',soft:'#fff7ed',ink:'#29180f',font:'Georgia',category:'Proyectos',photo:false,scene:'paper',description:'Hitos de proyecto con fechas y entregables destacados.'},
 {id:'pm-premium-black',name:'Mónaco Black',tier:'pro',layout:'split',design:'black-luxury',accent:'#111111',soft:'#f0f1f2',ink:'#111111',font:'Georgia',category:'Premium',photo:true,scene:'float',description:'Negro, blanco y composición de lujo sin perder lectura.'},
 {id:'pm-pastel',name:'Estocolmo Pastel',tier:'pro',layout:'editorial',design:'pastel-cards',accent:'#6d5bd0',soft:'#f7f5ff',ink:'#211d32',font:'Trebuchet MS',category:'Moderno',photo:true,scene:'desk',palette:['#6d5bd0','#d36d89','#4e9b8c'],description:'Tarjetas suaves y composición contemporánea.'},
 {id:'pm-naranja',name:'Sevilla Editorial',tier:'pro',layout:'sidebar',design:'editorial-orange',accent:'#ea580c',soft:'#fff3e8',ink:'#2c1a11',font:'Trebuchet MS',category:'Moderno',photo:true,scene:'stack',description:'Editorial fuerte, títulos grandes y columna de color.'},
]

export const cvTemplates=[...free,...pro]
export const freeTemplateCount=free.length
export const proTemplateCount=pro.length
export function getCvTemplate(id:string){return cvTemplates.find(t=>t.id===id)||cvTemplates[0]}
