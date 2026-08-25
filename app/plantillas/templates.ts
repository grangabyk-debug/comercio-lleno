export type CvTemplate={
 id:string
 name:string
 tier:'free'|'pro'
 layout:'classic'|'split'|'sidebar'|'timeline'|'compact'|'editorial'
 accent:string
 soft:string
 ink:string
 font:'Arial'|'Georgia'|'Trebuchet MS'|'Verdana'
 category:string
 description:string
 photo:boolean
 scene:'paper'|'desk'|'float'|'stack'
}

const free:CvTemplate[]=[
 {id:'pm-base-ats',name:'Buenos Aires ATS',tier:'free',layout:'classic',accent:'#171923',soft:'#f2f3f5',ink:'#111318',font:'Arial',category:'ATS',description:'Sobria, limpia y muy fácil de leer por personas y sistemas de selección.',photo:false,scene:'paper'},
 {id:'pm-claro',name:'Madrid Claro',tier:'free',layout:'split',accent:'#3157d5',soft:'#eef3ff',ink:'#111827',font:'Arial',category:'Profesional',description:'Cabecera clara, dos zonas ordenadas y una presencia profesional moderna.',photo:true,scene:'float'},
 {id:'pm-primer-trabajo',name:'Córdoba Inicial',tier:'free',layout:'sidebar',accent:'#167d69',soft:'#e9f7f3',ink:'#102a26',font:'Trebuchet MS',category:'Primer empleo',description:'Da protagonismo a estudios, cursos, habilidades y proyectos aunque tengas poca experiencia.',photo:true,scene:'paper'},
 {id:'pm-administrativo',name:'Lisboa Administrativo',tier:'free',layout:'compact',accent:'#6d4bd3',soft:'#f2edff',ink:'#17151f',font:'Arial',category:'Administración',description:'Compacta, seria y práctica para perfiles administrativos, recepción y back office.',photo:false,scene:'stack'},
 {id:'pm-servicios',name:'Lima Atención',tier:'free',layout:'classic',accent:'#d65a3e',soft:'#fff0eb',ink:'#241a17',font:'Verdana',category:'Atención y ventas',description:'Directa y cálida para atención al cliente, gastronomía, comercio y servicios.',photo:true,scene:'desk'},
 {id:'pm-minimal',name:'Oslo Minimal',tier:'free',layout:'editorial',accent:'#42464f',soft:'#f3f4f6',ink:'#181a1f',font:'Georgia',category:'Minimalista',description:'Mucho aire, tipografía cuidada y foco absoluto en el contenido.',photo:false,scene:'float'},
 {id:'pm-rosario',name:'Rosario Profesional',tier:'free',layout:'split',accent:'#1d8a78',soft:'#eaf8f5',ink:'#122823',font:'Arial',category:'Profesional',description:'Dos columnas equilibradas, foto opcional y una lectura moderna para perfiles generales.',photo:true,scene:'desk'},
 {id:'pm-mendoza',name:'Mendoza Fresh',tier:'free',layout:'sidebar',accent:'#d77b42',soft:'#fff2e8',ink:'#2b1d15',font:'Trebuchet MS',category:'Joven',description:'Más fresca y visual para primeros empleos, estudios, cursos y experiencia temprana.',photo:true,scene:'float'},
 {id:'pm-neuquen',name:'Neuquén Técnico',tier:'free',layout:'timeline',accent:'#37647a',soft:'#edf5f8',ink:'#17272f',font:'Arial',category:'Técnico',description:'Cronología clara para oficios, mantenimiento, operaciones, producción y perfiles técnicos.',photo:false,scene:'paper'},
 {id:'pm-montevideo',name:'Montevideo Sales',tier:'free',layout:'split',accent:'#d24f67',soft:'#fff0f3',ink:'#2b171d',font:'Verdana',category:'Ventas',description:'Con energía visual, pero profesional, para ventas, retail, atención y objetivos comerciales.',photo:true,scene:'stack'},
 {id:'pm-santiago',name:'Santiago Classic',tier:'free',layout:'classic',accent:'#3c4a5a',soft:'#f1f4f7',ink:'#171c22',font:'Georgia',category:'Clásico',description:'Una versión clásica renovada, elegante y fácil de adaptar a casi cualquier profesión.',photo:false,scene:'desk'},
 {id:'pm-palermo',name:'Palermo Color',tier:'free',layout:'editorial',accent:'#7d55d9',soft:'#f5f0ff',ink:'#211a2e',font:'Trebuchet MS',category:'Creativo',description:'Color controlado, foto opcional y composición editorial para perfiles que quieren diferenciarse.',photo:true,scene:'float'},
]

const pro:CvTemplate[]=[
 ['pm-ejecutivo','Budapest Executive','split','#253142','#eef1f4','#171b23','Georgia','Dirección',true,'desk','Cabecera ejecutiva, jerarquía fuerte y una lectura elegante para liderazgo.'],
 ['pm-comercial','Milán Comercial','sidebar','#e85b3b','#fff0eb','#211714','Trebuchet MS','Ventas',true,'float','Una columna de impacto para datos clave y un cuerpo pensado para logros comerciales.'],
 ['pm-tech','Berlín Tech','compact','#3567e8','#edf3ff','#111827','Arial','Tecnología',false,'stack','Retícula precisa, skills visibles y lectura rápida para perfiles digitales y técnicos.'],
 ['pm-hotel','Barcelona Hospitality','sidebar','#9a6a2f','#f8f2e8','#251e16','Georgia','Hotelería',true,'desk','Elegante y cálida para hotelería, turismo, recepción, gastronomía y atención premium.'],
 ['pm-retail','Riga Retail','split','#7a43df','#f3ecff','#21182a','Arial','Retail',true,'paper','Visual sin exagerar, con foco en experiencia, caja, ventas, objetivos y atención.'],
 ['pm-logistica','Praga Operaciones','timeline','#0f766e','#e8f7f5','#102624','Arial','Operaciones',false,'float','Cronología marcada para mostrar continuidad, responsabilidades y evolución operativa.'],
 ['pm-salud','Viena Salud','classic','#277f8a','#eaf7f8','#13272b','Georgia','Salud',true,'paper','Calma visual, buena legibilidad y jerarquía profesional para salud y cuidado.'],
 ['pm-finanzas','Zúrich Finanzas','compact','#163a6b','#edf3fa','#14202e','Arial','Finanzas',false,'desk','Formal, compacta y limpia para finanzas, administración contable y análisis.'],
 ['pm-legal','Londres Legal','editorial','#665043','#f6f1ec','#241d18','Georgia','Legal',false,'paper','Editorial y clásica, con tipografía seria y mucho foco en trayectoria y formación.'],
 ['pm-creative','París Creative','split','#c843d7','#fdf0ff','#211524','Trebuchet MS','Creativo',true,'float','Más expresiva, con color y composición editorial para perfiles creativos.'],
 ['pm-producto','Ámsterdam Product','sidebar','#4f46e5','#eef2ff','#17172a','Arial','Producto',true,'stack','Modular y contemporánea para producto, UX, proyectos y equipos digitales.'],
 ['pm-marketing','Valencia Marketing','editorial','#df4f55','#fff0f1','#291718','Trebuchet MS','Marketing',true,'desk','Titulares fuertes y bloques editoriales para marketing, contenidos y comunicación.'],
 ['pm-datos','Helsinki Data','compact','#2563eb','#eff6ff','#0f1f38','Arial','Datos',false,'paper','Densa pero ordenada para datos, BI, analítica, sistemas y perfiles cuantitativos.'],
 ['pm-ingenieria','Múnich Ingeniería','timeline','#475569','#f1f5f9','#18212e','Arial','Ingeniería',false,'stack','Estructura técnica y cronológica para proyectos, obras, mantenimiento e ingeniería.'],
 ['pm-docencia','Roma Educación','classic','#0f8a5f','#eaf8f1','#14251f','Georgia','Educación',true,'float','Clara y humana para docencia, investigación, formación y perfiles académicos.'],
 ['pm-gastronomia','San Sebastián Gastro','sidebar','#b45309','#fff7ed','#2b1c0d','Trebuchet MS','Gastronomía',true,'desk','Visual y directa para cocina, salón, eventos, hotelería y gastronomía.'],
 ['pm-remoto','Dublín Remote','split','#7c3aed','#f5f3ff','#211735','Arial','Remoto',true,'paper','Ordenada para perfiles remotos, idiomas, herramientas digitales y trabajo por proyectos.'],
 ['pm-liderazgo','Nueva York Leadership','editorial','#111827','#f3f4f6','#111827','Georgia','Management',true,'stack','Una propuesta premium, sobria y con presencia para management y dirección.'],
 ['pm-startup','Austin Startup','compact','#16a34a','#f0fdf4','#122319','Trebuchet MS','Startups',false,'float','Ágil y moderna para perfiles multitarea, producto, growth y equipos chicos.'],
 ['pm-customer','Toronto Customer','sidebar','#0284c7','#f0f9ff','#10232d','Arial','Customer',true,'desk','Amable y profesional para customer success, soporte, ventas y experiencia de cliente.'],
 ['pm-proyectos','Copenhague Project','timeline','#7c2d12','#fff7ed','#29180f','Georgia','Proyectos',false,'paper','Timeline premium para gestión de proyectos, hitos, coordinación y entregables.'],
 ['pm-premium-black','Mónaco Black','split','#111111','#f0f1f2','#111111','Georgia','Premium',true,'float','Negro, blanco y mucha presencia para un CV elegante y diferencial sin perder lectura.'],
 ['pm-pastel','Estocolmo Pastel','editorial','#6d5bd0','#f7f5ff','#211d32','Trebuchet MS','Moderno',true,'desk','Suave, actual y visual para perfiles profesionales que quieren algo menos tradicional.'],
 ['pm-naranja','Sevilla Editorial','sidebar','#ea580c','#fff3e8','#2c1a11','Trebuchet MS','Moderno',true,'stack','Color editorial controlado, estructura fuerte y una identidad visual fácil de recordar.'],
].map((x):CvTemplate=>({id:x[0] as string,name:x[1] as string,tier:'pro',layout:x[2] as CvTemplate['layout'],accent:x[3] as string,soft:x[4] as string,ink:x[5] as string,font:x[6] as CvTemplate['font'],category:x[7] as string,photo:x[8] as boolean,scene:x[9] as CvTemplate['scene'],description:x[10] as string}))

export const cvTemplates=[...free,...pro]
export const freeTemplateCount=free.length
export const proTemplateCount=pro.length
export function getCvTemplate(id:string){return cvTemplates.find(t=>t.id===id)||cvTemplates[0]}
