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

const free: CvTemplate[]=[
 {id:'pm-base-ats',name:'Base ATS',tier:'free',layout:'classic',accent:'#111827',soft:'#f3f4f6',ink:'#111827',font:'Arial',category:'ATS',description:'Simple, legible y pensada para sistemas de selección.',photo:false,scene:'paper'},
 {id:'pm-claro',name:'Claro Profesional',tier:'free',layout:'split',accent:'#3456d1',soft:'#eef2ff',ink:'#111827',font:'Arial',category:'Profesional',description:'Dos zonas limpias, buena jerarquía y lectura rápida.',photo:true,scene:'float'},
 {id:'pm-primer-trabajo',name:'Primer Trabajo',tier:'free',layout:'sidebar',accent:'#167d69',soft:'#e9f7f3',ink:'#102a26',font:'Trebuchet MS',category:'Inicial',description:'Ideal para estudios, cursos, proyectos y habilidades.',photo:true,scene:'paper'},
 {id:'pm-administrativo',name:'Administrativo',tier:'free',layout:'compact',accent:'#6d28d9',soft:'#f3e8ff',ink:'#171717',font:'Arial',category:'Oficina',description:'Ordenado y compacto para experiencia operativa.',photo:false,scene:'stack'},
 {id:'pm-servicios',name:'Servicios',tier:'free',layout:'classic',accent:'#d45a3a',soft:'#fff0ea',ink:'#241a17',font:'Verdana',category:'Atención',description:'Directo para atención, recepción, ventas y gastronomía.',photo:true,scene:'desk'},
 {id:'pm-minimal',name:'Minimal',tier:'free',layout:'editorial',accent:'#3f3f46',soft:'#f4f4f5',ink:'#18181b',font:'Georgia',category:'General',description:'Muy limpio, con foco total en contenido y experiencia.',photo:false,scene:'float'},
]

const pro: CvTemplate[]=[
 ['pm-ejecutivo','Ejecutivo','split','#202633','#eef0f4','#171b23','Georgia','Dirección',true,'desk'],
 ['pm-comercial','Comercial Impacto','sidebar','#ef5b3d','#fff0ec','#211714','Trebuchet MS','Ventas',true,'float'],
 ['pm-tech','Tech Grid','compact','#3157d5','#edf2ff','#111827','Arial','Tecnología',false,'stack'],
 ['pm-hotel','Hotel & Hospitality','sidebar','#9a6a2f','#f8f2e8','#251e16','Georgia','Hotelería',true,'desk'],
 ['pm-retail','Retail Pro','split','#8a2be2','#f4eaff','#1f1728','Arial','Retail',true,'paper'],
 ['pm-logistica','Logística','timeline','#0f766e','#e8f7f5','#102624','Arial','Operaciones',false,'float'],
 ['pm-salud','Salud Serena','classic','#207e8c','#eaf7f8','#13272b','Georgia','Salud',true,'paper'],
 ['pm-finanzas','Finanzas','compact','#163a6b','#edf3fa','#14202e','Arial','Finanzas',false,'desk'],
 ['pm-legal','Legal','editorial','#5b4636','#f6f1ec','#241d18','Georgia','Legal',false,'paper'],
 ['pm-creative','Creative Studio','split','#d946ef','#fdf0ff','#211524','Trebuchet MS','Creativo',true,'float'],
 ['pm-producto','Producto','sidebar','#4f46e5','#eef2ff','#17172a','Arial','Producto',true,'stack'],
 ['pm-marketing','Marketing','editorial','#e5484d','#fff0f1','#291718','Trebuchet MS','Marketing',true,'desk'],
 ['pm-datos','Data','compact','#2563eb','#eff6ff','#0f1f38','Arial','Datos',false,'paper'],
 ['pm-ingenieria','Ingeniería','timeline','#475569','#f1f5f9','#18212e','Arial','Ingeniería',false,'stack'],
 ['pm-docencia','Educación','classic','#0f8a5f','#eaf8f1','#14251f','Georgia','Educación',true,'float'],
 ['pm-gastronomia','Gastronomía','sidebar','#b45309','#fff7ed','#2b1c0d','Trebuchet MS','Gastronomía',true,'desk'],
 ['pm-remoto','Remote','split','#7c3aed','#f5f3ff','#211735','Arial','Remoto',true,'paper'],
 ['pm-liderazgo','Liderazgo','editorial','#111827','#f3f4f6','#111827','Georgia','Management',true,'stack'],
 ['pm-startup','Startup','compact','#16a34a','#f0fdf4','#122319','Trebuchet MS','Startups',false,'float'],
 ['pm-customer','Customer Success','sidebar','#0284c7','#f0f9ff','#10232d','Arial','Customer',true,'desk'],
 ['pm-proyectos','Project Manager','timeline','#7c2d12','#fff7ed','#29180f','Georgia','Proyectos',false,'paper'],
 ['pm-premium-black','Black Signature','split','#0a0a0a','#f4f4f5','#111111','Georgia','Premium',true,'float'],
 ['pm-pastel','Pastel','editorial','#6d5bd0','#f7f5ff','#211d32','Trebuchet MS','Moderno',true,'desk'],
 ['pm-naranja','Naranja Editorial','sidebar','#ea580c','#fff3e8','#2c1a11','Trebuchet MS','Moderno',true,'stack'],
].map((x):CvTemplate=>({id:x[0] as string,name:x[1] as string,tier:'pro',layout:x[2] as CvTemplate['layout'],accent:x[3] as string,soft:x[4] as string,ink:x[5] as string,font:x[6] as CvTemplate['font'],category:x[7] as string,description:'Diseño avanzado con mayor jerarquía visual, habilidades y logros destacados.',photo:x[8] as boolean,scene:x[9] as CvTemplate['scene']}))

export const cvTemplates=[...free,...pro]
export const freeTemplateCount=free.length
export const proTemplateCount=pro.length
export function getCvTemplate(id:string){return cvTemplates.find(t=>t.id===id)||cvTemplates[0]}
