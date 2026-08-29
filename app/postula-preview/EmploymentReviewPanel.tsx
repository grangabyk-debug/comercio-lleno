'use client'

import Link from 'next/link'
import {useEffect,useMemo,useState} from 'react'
import {cvAuthClient} from '../cv-ia/cvAuth'
import css from './EmploymentReviewPanel.module.css'

type Review={id:string;direction:string;rating:number;criteria?:Record<string,number>|null;comment?:string|null;reply_body?:string|null;editable_until:string;submitted_at?:string;updated_at:string}
type ReviewData={ok:boolean;status:string;hired_at?:string|null;employment_ended_at?:string|null;review_available_at?:string|null;review_submission_until?:string|null;reply_until?:string|null;can_review:boolean;can_reply?:boolean;can_end_relationship?:boolean;can_mark_hired?:boolean;hire_gate_reason?:string;viewer_role:'candidate'|'employer';job_title:string;company_name:string;mine:Review|null;other:Review|null;error?:string}
type Question={key:string;label:string}

const personQuestions:Question[]=[
 {key:'responsabilidad',label:'Responsabilidad y cumplimiento de lo acordado'},
 {key:'desempeno',label:'Desempeño y calidad en las tareas'},
 {key:'comunicacion',label:'Comunicación y trato profesional'},
 {key:'organizacion',label:'Organización y puntualidad'},
 {key:'trabajo_equipo',label:'Trabajo en equipo y adaptación'}
]
const companyQuestions:Question[]=[
 {key:'claridad',label:'Claridad de las condiciones acordadas'},
 {key:'cumplimiento',label:'Cumplimiento de pagos y acuerdos'},
 {key:'trato',label:'Trato y respeto durante la relación'},
 {key:'comunicacion',label:'Comunicación con la empresa'},
 {key:'organizacion',label:'Organización del trabajo y del proceso'}
]
function dateLabel(value?:string|null){if(!value)return'';return new Date(value).toLocaleDateString('es-AR',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'America/Argentina/Buenos_Aires'})}
function numberLabel(value:number){return Number(value||0).toLocaleString('es-AR',{minimumFractionDigits:1,maximumFractionDigits:2})}
function daysUntil(value?:string|null){if(!value)return null;return Math.max(0,Math.ceil((new Date(value).getTime()-Date.now())/86400000))}
function normalizedScores(review:Review|null,questions:Question[]){const out:Record<string,number>={};for(const q of questions){const n=Number(review?.criteria?.[q.key]||0);if(n>=1&&n<=5)out[q.key]=n}return out}

export default function EmploymentReviewPanel({applicationId}:{applicationId:string}){
 const [data,setData]=useState<ReviewData|null>(null),[scores,setScores]=useState<Record<string,number>>({}),[comment,setComment]=useState(''),[reply,setReply]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[error,setError]=useState('')
 const employer=data?.viewer_role==='employer',questions=employer?personQuestions:companyQuestions,otherQuestions=employer?companyQuestions:personQuestions
 const completed=questions.every(q=>Number(scores[q.key])>=1&&Number(scores[q.key])<=5)
 const average=useMemo(()=>{const values=questions.map(q=>Number(scores[q.key]||0)).filter(Boolean);return values.length===5?values.reduce((a,b)=>a+b,0)/5:0},[scores,questions])
 async function request(body?:Record<string,unknown>){
  const {data:auth}=await cvAuthClient().auth.getSession();const token=auth.session?.access_token
  if(!token)throw new Error('Iniciá sesión para ver esta experiencia.')
  const r=await fetch(body?'/api/postula/reviews':`/api/postula/reviews?application_id=${encodeURIComponent(applicationId)}`,body?{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({application_id:applicationId,...body})}:{headers:{Authorization:`Bearer ${token}`},cache:'no-store'})
  const payload=await r.json().catch(()=>({}));if(!r.ok)throw new Error(payload?.error||'No pudimos actualizar la evaluación.');return payload as ReviewData
 }
 function apply(next:ReviewData){setData(next);const qs=next.viewer_role==='employer'?personQuestions:companyQuestions;setScores(normalizedScores(next.mine,qs));setComment(String(next.mine?.comment||''));setReply(String(next.other?.reply_body||''))}
 async function load(){try{apply(await request())}catch(e){setError(e instanceof Error?e.message:'No pudimos cargar la evaluación.')}}
 useEffect(()=>{void load()},[applicationId])
 async function saveReview(){if(!completed||busy)return;setBusy(true);setError('');setNotice('');try{const next=await request({action:'review',criteria:scores,comment});apply(next);setNotice('Evaluación guardada. El promedio de estas 5 respuestas ya forma tu calificación de esta experiencia.')}catch(e){setError(e instanceof Error?e.message:'No pudimos guardar la evaluación.')}finally{setBusy(false)}}
 async function saveReply(){if(!data?.other?.id||!reply.trim()||busy)return;setBusy(true);setError('');setNotice('');try{const next=await request({action:'reply',review_id:data.other.id,reply});apply(next);setNotice('Tu observación quedó guardada.')}catch(e){setError(e instanceof Error?e.message:'No pudimos guardar la observación.')}finally{setBusy(false)}}
 if(error&&!data)return <div className={css.panel}><div className={css.error}>{error}</div></div>
 if(!data||data.status!=='hired')return null
 const otherName=employer?'postulante':'empresa',mineName=employer?'a esta persona':'a esta empresa',waitDays=daysUntil(data.review_available_at)
 if(!data.can_review&&!data.mine&&data.review_available_at&&new Date(data.review_available_at).getTime()>Date.now())return <section className={css.panel} aria-label="Calificación de experiencia laboral"><div className={css.head}><div><span>EXPERIENCIA LABORAL VERIFICADA</span><h3>La evaluación se habilita a los 30 días.</h3><p>La contratación ya está confirmada. Cuando se cumplan 30 días, ambas partes van a poder responder 5 preguntas del 1 al 5.</p></div><div className={css.deadline}>Desde {dateLabel(data.review_available_at)}</div></div><div className={css.waiting}><div><b>{waitDays===1?'Falta 1 día.':`Faltan ${waitDays??30} días.`}</b><p>No tenés que hacer nada ahora. La calificación se habilita automáticamente cuando llegue la fecha.</p></div></div><div className={css.notice}>Cada lado califica por separado. Después de recibir una evaluación hay 30 días para dejar una observación o réplica. <Link href="/politica-evaluaciones">Ver cómo funciona</Link>.</div></section>
 return <section className={css.panel} aria-label="Calificación de experiencia laboral">
  <div className={css.head}><div><span>EXPERIENCIA LABORAL VERIFICADA</span><h3>Evaluación de 5 criterios</h3><p>Respondé cada punto del 1 al 5. El promedio de las cinco respuestas es la calificación final de esta experiencia.</p></div><div className={css.deadline} data-open={data.can_review}>{data.can_review?(data.mine?`Editable hasta ${dateLabel(data.mine.editable_until)}`:`Disponible hasta ${dateLabel(data.review_submission_until)}`):'Período cerrado'}</div></div>
  <div className={css.grid}>
   <div className={css.card}><small>TU EVALUACIÓN</small><h4>Calificá {mineName}</h4>{data.can_review?<><div className={css.questions}>{questions.map((q,index)=><div className={css.question} key={q.key}><div><b>{index+1}. {q.label}</b><span>{scores[q.key]?`${scores[q.key]}/5`:'Elegí del 1 al 5'}</span></div><div className={css.scale} aria-label={q.label}>{[1,2,3,4,5].map(n=><button type="button" key={n} data-on={scores[q.key]===n} onClick={()=>setScores(v=>({...v,[q.key]:n}))} aria-label={`${q.label}: ${n} de 5`}>{n}</button>)}</div></div>)}</div><div className={css.average} data-ready={completed}><span>Promedio</span><b>{completed?`${numberLabel(average)} / 5`:'Completá las 5 respuestas'}</b></div><textarea className={css.textarea} maxLength={1200} value={comment} onChange={e=>setComment(e.target.value)} placeholder="Comentario opcional sobre esta experiencia. Evitá datos sensibles o personales."/><button type="button" className={css.action} disabled={busy||!completed} onClick={()=>void saveReview()}>{busy?'Guardando…':data.mine?'Actualizar evaluación':'Guardar evaluación'}</button><div className={css.mini}>La evaluación es opcional. Una vez enviada, la otra parte tiene 30 días para responder u observarla.</div></>:data.mine?<ReviewSummary review={data.mine} questions={questions}/>:<div className={css.closed}>No dejaste una evaluación durante el período habilitado.</div>}{data.mine?.reply_body&&<div className={css.reply}><b>Respuesta recibida</b><p>{data.mine.reply_body}</p></div>}</div>
   <div className={css.card}><small>EVALUACIÓN RECIBIDA</small><h4>Lo que indicó {otherName}</h4>{data.other?<><ReviewSummary review={data.other} questions={otherQuestions}/>{data.can_reply?<><textarea className={css.textarea} maxLength={1200} value={reply} onChange={e=>setReply(e.target.value)} placeholder="Si querés aclarar algo o no estás de acuerdo, podés dejar una réplica u observación."/><button type="button" className={`${css.action} ${css.secondary}`} disabled={busy||!reply.trim()} onClick={()=>void saveReply()}>{data.other.reply_body?'Actualizar observación':'Responder / dejar observación'}</button><div className={css.mini}>Podés responder hasta {dateLabel(data.other.editable_until)}.</div></>:data.other.reply_body&&<div className={css.reply}><b>Tu observación</b><p>{data.other.reply_body}</p></div>}</>:<div className={css.closed}>La otra parte todavía no dejó una evaluación.</div>}</div>
  </div>
  {notice&&<div className={css.saved}>{notice}</div>}{error&&<div className={css.error}>{error}</div>}
  <div className={css.notice}>La evaluación se habilita 30 días después de la contratación. Son 5 preguntas, cada una del 1 al 5; su promedio forma la calificación. <Link href="/politica-evaluaciones">Cómo funciona</Link>.</div>
 </section>
}

function ReviewSummary({review,questions}:{review:Review;questions:Question[]}){return <div className={css.review}><strong>★ {numberLabel(Number(review.rating))} / 5</strong><div className={css.reviewCriteria}>{questions.map(q=>{const value=Number(review.criteria?.[q.key]||0);return value?<span key={q.key}><b>{q.label}</b><em>{value}/5</em></span>:null})}</div>{review.comment&&<p>{review.comment}</p>}</div>}
