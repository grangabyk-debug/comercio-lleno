import type {PreviewJob} from '../postula-preview/jobs'

function norm(value:string){return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim()}
function indexFor(value:string,length:number){let hash=0;for(let i=0;i<value.length;i++)hash=((hash<<5)-hash+value.charCodeAt(i))|0;return Math.abs(hash)%length}
function choose(job:PreviewJob,images:string[]){return images[indexFor(job.slug||job.title,images.length)]}
const img=(id:number)=>`https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1100`

/**
 * Visuales ilustrativos por puesto. La selección usa título, área, tags y resumen,
 * y es determinista por slug para evitar que las tarjetas cambien en cada render.
 * Las fotos ilustran el tipo de tarea: no representan instalaciones ni personal real
 * de la empresa publicada.
 */
export function jobVisual(job:PreviewJob){
  const t=norm(`${job.title} ${job.area} ${job.tags.join(' ')} ${job.summary}`)
  if(/fruta|verdura|verduler|produce|frescos/.test(t))return choose(job,[img(16154014),img(8475198),img(16154026),img(8476596)])
  if(/cajer|cajas|checkout|cashier|linea de cajas/.test(t))return choose(job,[img(36772947),img(20157487),img(33688678),img(10028807)])
  if(/carnic|carnicer|despost|depost|fiambr|butcher/.test(t))return choose(job,[img(32801861),img(7883930),img(19352815)])
  if(/cocin|gastronom|barista|chef|panader|pasteler|mozo|camarer|vajilla|restaurante/.test(t))return choose(job,[img(18483758),img(17086289),img(36430036),img(2544829)])
  if(/pintor|pintura|pintar/.test(t))return choose(job,[img(5691549),img(6474458)])
  if(/limpieza|maestranza|mucama|housekeeping|higiene/.test(t))return choose(job,[img(4239146),img(4108715)])
  if(/deposit|logistic|almacen|operario|produccion|repositor|abastecimiento|forklift|inventario|expedicion/.test(t))return choose(job,[img(7019259),img(7019306),img(24601958),img(7019225)])
  if(/chofer|repart|delivery|conductor|mensajer|camion/.test(t))return choose(job,[img(4391470),img(7363196)])
  if(/constru|obra|electric|plomer|mantenim|tecnico|mecan|soldador/.test(t))return choose(job,[img(28663713),img(37556452),img(30411827),img(159306)])
  if(/venta|comercial|retail|vendedor|promotor|shopping|salon/.test(t))return choose(job,[img(3184465),img(4199490),img(3769747)])
  if(/atencion|customer|soporte|call center|recepcion|contact center/.test(t))return choose(job,[img(7709087),img(3184465)])
  if(/administr|finanz|contab|asistente|secretar|office|tesorer|auditor|banco|bank/.test(t))return choose(job,[img(3184339),img(3760067),img(3184418)])
  if(/recursos humanos|rrhh|talent|recruit|seleccion/.test(t))return choose(job,[img(3184465),img(3184306)])
  if(/marketing|publicidad|social media|comunicacion|contenido/.test(t))return choose(job,[img(3184292),img(3184287)])
  if(/disen|ux|ui|creativ|grafico/.test(t))return choose(job,[img(3861969),img(196644)])
  if(/tecnolog|developer|software|data|qa|ingenier|sistemas|programador|devops|cloud/.test(t))return choose(job,[img(3861969),img(1181675),img(574071)])
  if(/hotel|turismo|reservas|viajes|hospitality/.test(t))return choose(job,[img(261102),img(164595)])
  if(/salud|medical|medic|enfermer|odont|clinica|farmac|laboratorio/.test(t))return choose(job,[img(5452201),img(3845126)])
  if(/seguridad|vigilador|guardia|control de acceso/.test(t))return choose(job,[img(7714787),img(7714743)])
  if(/educacion|docent|profesor|maestr|capacit|trainer/.test(t))return choose(job,[img(5212345),img(3184644)])
  if(/legal|abogad|juridic|compliance/.test(t))return choose(job,[img(5668473),img(6077326)])
  if(/agro|campo|agric|rural|granja/.test(t))return choose(job,[img(2132250),img(2255801)])
  return choose(job,[img(3184418),img(3184291),img(3768126)])
}
