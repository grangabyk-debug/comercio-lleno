import type {PreviewJob} from '../postula-preview/jobs'

function norm(value:string){return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim()}
function indexFor(value:string,length:number){let hash=0;for(let i=0;i<value.length;i++)hash=((hash<<5)-hash+value.charCodeAt(i))|0;return Math.abs(hash)%length}
function choose(job:PreviewJob,images:string[]){return images[indexFor(job.slug||job.title,images.length)]}
const img=(id:number)=>`https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1100`

/**
 * Visuales ilustrativos elegidos por la tarea concreta, no sólo por el rubro.
 * La selección es determinista por slug y prioriza palabras del título antes de
 * categorías generales para evitar fotos que no tengan relación con el puesto.
 */
export function jobVisual(job:PreviewJob){
  const t=norm(`${job.title} ${job.area} ${job.tags.join(' ')} ${job.summary}`)

  if(/hotel.*recepcion|recepcion.*hotel|front desk|concierge/.test(t))return choose(job,[img(5371676),img(5137951),img(14036250)])
  if(/agente de viajes|agente.*turismo|travel agent|venta.*viaje|viaje.*venta/.test(t))return choose(job,[img(36624800),img(7820326)])
  if(/fruta|verdura|verduler|produce|frescos/.test(t))return choose(job,[img(16154014),img(8475198)])
  if(/cajer|cajas|checkout|cashier|linea de cajas/.test(t))return choose(job,[img(36772947),img(20157487),img(12935050)])
  if(/repositor|reposicion|stockista|merchandis|gondola/.test(t))return choose(job,[img(5380920),img(10163508),img(14458537)])
  if(/carnic|carnicer|despost|depost|fiambr|butcher/.test(t))return choose(job,[img(32801861),img(7883930),img(19352815)])
  if(/cocin|gastronom|barista|chef|panader|pasteler|mozo|camarer|vajilla|restaurante/.test(t))return choose(job,[img(36473250),img(30120987),img(8093546)])
  if(/limpieza|maestranza|mucama|housekeeping|higiene/.test(t))return choose(job,[img(4239146),img(4108715)])
  if(/deposit|logistic|almacen|operario|produccion|abastecimiento|forklift|inventario|expedicion|picking/.test(t))return choose(job,[img(36552175),img(4483864),img(4487361),img(6169166)])
  if(/chofer|repart|delivery|conductor|mensajer|camion/.test(t))return choose(job,[img(4391470),img(7363196)])
  if(/constru|obra|electric|plomer|mantenim|tecnico|mecan|soldador/.test(t))return choose(job,[img(28663713),img(37556452),img(30411827),img(159306)])
  if(/customer support|customer service|soporte|call center|contact center|help desk/.test(t))return choose(job,[img(7709290),img(7709257)])
  if(/developer|back-end|backend|front-end|frontend|software engineer|programador|programming|coding/.test(t))return choose(job,[img(7988114),img(3861972),img(1181675)])
  if(/data|analytics|business intelligence|\bbi\b/.test(t))return choose(job,[img(8062280),img(1181675),img(5685973)])
  if(/strategy|performance|consultor|consultoria|planning|project manager|product manager|producto/.test(t))return choose(job,[img(8062280),img(5685973),img(3184339)])
  if(/venta|comercial|retail|vendedor|promotor|shopping|salon/.test(t))return choose(job,[img(3184465),img(4199490),img(3769747)])
  if(/atencion|recepcion|secretar/.test(t))return choose(job,[img(7709257),img(10347149),img(7610787)])
  if(/administr|finanz|contab|asistente|office|tesorer|auditor|banco|bank|trainee|estudiante/.test(t))return choose(job,[img(8062280),img(5685973),img(3184339)])
  if(/recursos humanos|rrhh|talent|recruit|seleccion/.test(t))return choose(job,[img(3184465),img(3184306)])
  if(/marketing|publicidad|social media|comunicacion|contenido/.test(t))return choose(job,[img(3184292),img(3184287)])
  if(/disen|ux|ui|creativ|grafico/.test(t))return choose(job,[img(3861969),img(196644)])
  if(/tecnolog|ingenier|sistemas|devops|cloud/.test(t))return choose(job,[img(7988089),img(32755772),img(1181675)])
  if(/hotel|turismo|reservas|viajes|hospitality/.test(t))return choose(job,[img(5371676),img(7820326),img(261102)])
  if(/salud|medical|medic|enfermer|odont|clinica|farmac|laboratorio/.test(t))return choose(job,[img(5452201),img(3845126)])
  if(/seguridad|vigilador|guardia|control de acceso/.test(t))return choose(job,[img(7714787),img(7714743)])
  if(/educacion|docent|profesor|maestr|capacit|trainer/.test(t))return choose(job,[img(5212345),img(3184644)])
  if(/legal|abogad|juridic|compliance/.test(t))return choose(job,[img(5668473),img(6077326)])
  if(/agro|campo|agric|rural|granja/.test(t))return choose(job,[img(2132250),img(2255801)])
  return choose(job,[img(3184418),img(3184291),img(3768126)])
}
