'use client'

import { FormEvent, useMemo, useRef, useState } from 'react'
import styles from './cv-ia.module.css'

type Result = {
  score: number
  recruiter: number
  fit: number
  clarity: number
  strengths: string[]
  fixes: string[]
}

type Comment = {
  name: string
  role: string
  text: string
}

const initialComments: Comment[] = [
  { name: 'Primeros usuarios', role: 'Esta sección se completa con experiencias reales', text: 'Todavía no publicamos testimonios inventados. Cuando alguien deje una experiencia, va a aparecer acá.' },
]

const plans = [
  {
    name: 'Diagnóstico',
    price: '$0',
    suffix: '',
    badge: 'PARA EMPEZAR',
    features: ['Score general', 'Triple Filtro IA', '3 mejoras prioritarias', 'Compatibilidad con una búsqueda'],
    cta: 'Analizar gratis',
    highlight: false,
  },
  {
    name: 'CV Pro',
    price: '$8.900',
    suffix: ' pago único',
    badge: 'MÁS ELEGIDO',
    features: ['Todo el diagnóstico', 'CV reescrito sin inventar experiencia', 'Versión adaptada a un puesto', 'Carta o mensaje de postulación', 'Perfil de LinkedIn optimizado'],
    cta: 'Quiero mi CV Pro',
    highlight: true,
  },
  {
    name: 'Búsqueda Activa',
    price: '$12.900',
    suffix: ' / 30 días',
    badge: 'PARA BUSCAR EN SERIO',
    features: ['Todo CV Pro', 'Hasta 10 búsquedas analizadas', 'Versiones por empresa y puesto', 'Simulaciones de entrevista', 'Seguimiento de postulaciones'],
    cta: 'Activar Búsqueda Activa',
    highlight: false,
  },
]

function buildResult(jobText: string, fileName: string): Result {
  const source = `${jobText} ${fileName}`.toLowerCase()
  const hasNumbers = /\d/.test(source)
  const hasRole = /(ventas|administr|marketing|analista|comercial|atenci[oó]n|caj|mozo|recepci[oó]n|developer|program|diseñ|log[ií]st)/.test(source)
  const detail = Math.min(18, Math.floor(jobText.trim().length / 45))
  const base = 57 + detail + (hasNumbers ? 4 : 0) + (hasRole ? 5 : 0)
  const score = Math.max(58, Math.min(88, base))
  return {
    score,
    recruiter: Math.max(54, score - 4),
    fit: Math.min(92, score + 3),
    clarity: Math.max(60, score - 1),
    strengths: [
      'Tu perfil tiene información aprovechable para construir una propuesta clara.',
      'Hay experiencia que se puede traducir mejor al lenguaje del puesto buscado.',
      'La base permite una versión más concreta, humana y fácil de escanear.',
    ],
    fixes: [
      'Falta priorizar logros y resultados por encima de una lista de tareas.',
      'Conviene adaptar el resumen inicial al puesto exacto al que te postulás.',
      'Hay palabras y capacidades del aviso que deberían aparecer de forma natural.',
    ],
  }
}

export default function CvIaExperience() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')
  const [jobText, setJobText] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [commentName, setCommentName] = useState('')
  const [commentText, setCommentText] = useState('')
  const [notice, setNotice] = useState('')

  const ready = useMemo(() => Boolean(fileName && jobText.trim().length > 35), [fileName, jobText])

  function analyze(e?: FormEvent) {
    e?.preventDefault()
    if (!ready || analyzing) return
    setAnalyzing(true)
    setResult(null)
    window.setTimeout(() => {
      setResult(buildResult(jobText, fileName))
      setAnalyzing(false)
      window.setTimeout(() => document.getElementById('resultado')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    }, 1150)
  }

  function choosePlan(plan: string) {
    setNotice(`Preview: el checkout de ${plan} queda listo para conectar al medio de pago cuando aprobemos esta versión.`)
    document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function publishComment(e: FormEvent) {
    e.preventDefault()
    const name = commentName.trim()
    const text = commentText.trim()
    if (!name || text.length < 8) return
    setComments((current) => [{ name, role: 'Experiencia compartida en esta preview', text }, ...current.filter((item) => item.name !== 'Primeros usuarios')])
    setCommentName('')
    setCommentText('')
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="#inicio" aria-label="Inicio CV IA">
          <span className={styles.brandMark}>CV</span>
          <span><b>CV</b> IA<small>candidaturas que compiten mejor</small></span>
        </a>
        <a className={styles.headerCta} href="#analisis">Analizar gratis</a>
      </header>

      <section className={styles.hero} id="inicio">
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>NO ES OTRO GENERADOR DE CV</span>
          <h1>¿Mandás CV y <em>no te llaman?</em></h1>
          <p className={styles.heroLead}>Descubrí qué puede estar frenándote y prepará una candidatura específica para el trabajo que querés.</p>
          <div className={styles.heroTrust}>
            <span>✓ No inventamos experiencia</span>
            <span>✓ Pensado para filtros + personas</span>
            <span>✓ Diagnóstico inicial gratis</span>
          </div>
        </div>

        <form className={styles.analyzerCard} id="analisis" onSubmit={analyze}>
          <div className={styles.stepLabel}><span>1</span><b>Subí tu CV</b><small>PDF o documento · en la preview no se envía a ningún servidor</small></div>
          <input
            ref={fileRef}
            className={styles.fileInput}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
          />
          <button className={`${styles.dropzone} ${fileName ? styles.dropzoneReady : ''}`} type="button" onClick={() => fileRef.current?.click()}>
            <span className={styles.uploadIcon}>↑</span>
            <b>{fileName || 'Elegir mi CV'}</b>
            <small>{fileName ? 'Listo para analizar' : 'Tocá acá para buscarlo en tu celular'}</small>
          </button>

          <div className={styles.stepLabel}><span>2</span><b>Contanos qué trabajo querés</b><small>Pegá el aviso o describí el puesto</small></div>
          <textarea
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder="Ej: Buscamos Analista Comercial para gestionar cuentas, seguimiento de clientes, Excel..."
            rows={5}
          />
          <button className={styles.primaryCta} type="submit" disabled={!ready || analyzing}>
            {analyzing ? 'Analizando candidatura…' : 'Analizar mi CV gratis'}
          </button>
          <p className={styles.microcopy}>Sin tarjeta. Esta preview usa un diagnóstico demostrativo para validar la experiencia antes de conectar la IA real.</p>
        </form>
      </section>

      <section className={styles.valueBand}>
        <div><strong>3</strong><span>miradas distintas</span></div>
        <div><strong>1</strong><span>candidatura enfocada</span></div>
        <div><strong>0</strong><span>experiencia inventada</span></div>
      </section>

      <section className={styles.tripleSection}>
        <div className={styles.sectionIntro}>
          <span>TRIPLE FILTRO</span>
          <h2>Tu CV visto como lo puede ver un proceso real.</h2>
          <p>No alcanza con que quede lindo. Tiene que ser entendible, relevante para el puesto y convincente para una persona.</p>
        </div>
        <div className={styles.filterGrid}>
          <article><span>01</span><b>Filtro automático</b><p>Estructura, legibilidad, palabras relevantes y señales que ayudan a interpretar tu perfil.</p></article>
          <article><span>02</span><b>Recruiter IA</b><p>Evalúa si tu presentación despierta suficiente interés como para avanzar a una entrevista.</p></article>
          <article><span>03</span><b>Responsable del área</b><p>Compara tu experiencia con lo que realmente necesita el puesto, sin rellenar ni exagerar.</p></article>
        </div>
      </section>

      {result && (
        <section className={styles.resultSection} id="resultado">
          <div className={styles.resultHeader}>
            <div>
              <span>DIAGNÓSTICO DE PREVIEW</span>
              <h2>Tenés material. Ahora hay que hacerlo competir mejor.</h2>
              <p>Este resultado es demostrativo: sirve para validar cómo se va a sentir el producto antes de conectar el análisis real.</p>
            </div>
            <div className={styles.scoreRing} style={{ '--score': `${result.score * 3.6}deg` } as React.CSSProperties}>
              <div><strong>{result.score}</strong><small>/100</small></div>
            </div>
          </div>

          <div className={styles.scoreGrid}>
            <div><span>Recruiter</span><b>{result.recruiter}%</b><i><u style={{ width: `${result.recruiter}%` }} /></i></div>
            <div><span>Ajuste al puesto</span><b>{result.fit}%</b><i><u style={{ width: `${result.fit}%` }} /></i></div>
            <div><span>Claridad</span><b>{result.clarity}%</b><i><u style={{ width: `${result.clarity}%` }} /></i></div>
          </div>

          <div className={styles.findingsGrid}>
            <article className={styles.goodBox}><span>LO QUE YA SUMA</span>{result.strengths.map((item) => <p key={item}>✓ {item}</p>)}</article>
            <article className={styles.fixBox}><span>LO QUE CAMBIARÍAMOS PRIMERO</span>{result.fixes.map((item) => <p key={item}>→ {item}</p>)}</article>
          </div>

          <div className={styles.resultUpsell}>
            <div><small>EL SIGUIENTE PASO</small><b>Convertir este diagnóstico en una candidatura lista para enviar.</b><p>Reescribimos, priorizamos y adaptamos sin inventar nada que no hayas hecho.</p></div>
            <button onClick={() => choosePlan('CV Pro')}>Ver CV Pro</button>
          </div>
        </section>
      )}

      <section className={styles.compareSection}>
        <div className={styles.sectionIntro}>
          <span>LA DIFERENCIA</span>
          <h2>Una IA gratis redacta. Nosotros armamos la candidatura.</h2>
        </div>
        <div className={styles.compareCard}>
          <div className={styles.compareHead}><span></span><b>Generador común</b><b>CV IA</b></div>
          {[
            ['Redacta texto', 'Sí', 'Sí'],
            ['Compara contra el puesto', 'Depende del prompt', 'Incluido'],
            ['Evalúa con 3 miradas', 'No', 'Incluido'],
            ['Versiones por búsqueda', 'Manual', 'Incluido'],
            ['Simula entrevista', 'Manual', 'Plan Búsqueda Activa'],
            ['Regla: no inventar experiencia', 'La tenés que pedir', 'Parte del producto'],
          ].map((row) => <div className={styles.compareRow} key={row[0]}><span>{row[0]}</span><i>{row[1]}</i><strong>{row[2]}</strong></div>)}
        </div>
      </section>

      <section className={styles.plansSection} id="planes">
        <div className={styles.sectionIntro}>
          <span>EMPEZÁ GRATIS</span>
          <h2>Pagás cuando querés pasar del diagnóstico a la acción.</h2>
        </div>
        <div className={styles.plansGrid}>
          {plans.map((plan) => (
            <article className={`${styles.plan} ${plan.highlight ? styles.planHighlight : ''}`} key={plan.name}>
              <span className={styles.planBadge}>{plan.badge}</span>
              <h3>{plan.name}</h3>
              <div className={styles.price}><strong>{plan.price}</strong><small>{plan.suffix}</small></div>
              <ul>{plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul>
              <button onClick={() => plan.name === 'Diagnóstico' ? document.getElementById('analisis')?.scrollIntoView({ behavior: 'smooth' }) : choosePlan(plan.name)}>{plan.cta}</button>
            </article>
          ))}
        </div>
        {notice && <div className={styles.notice}>{notice}</div>}
      </section>

      <section className={styles.communitySection}>
        <div className={styles.sectionIntro}>
          <span>COMUNIDAD</span>
          <h2>Experiencias reales, no testimonios inventados.</h2>
          <p>Cuando lancemos, las personas van a poder contar cómo les fue. En esta preview podés probar cómo funciona la sección.</p>
        </div>
        <div className={styles.communityGrid}>
          <div className={styles.commentsList}>
            {comments.map((comment) => (
              <article key={`${comment.name}-${comment.text}`}><div className={styles.avatar}>{comment.name.slice(0, 1).toUpperCase()}</div><div><b>{comment.name}</b><small>{comment.role}</small><p>{comment.text}</p></div></article>
            ))}
          </div>
          <form className={styles.commentForm} onSubmit={publishComment}>
            <b>Dejá un comentario</b>
            <p>En producción se publicará luego de una revisión simple para evitar spam o datos sensibles.</p>
            <input value={commentName} onChange={(e) => setCommentName(e.target.value)} placeholder="Tu nombre" maxLength={30} />
            <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="¿Qué te pareció?" rows={4} maxLength={260} />
            <button type="submit">Publicar en esta preview</button>
          </form>
        </div>
      </section>

      <section className={styles.finalCta}>
        <span>NO BUSQUES “UN CV MÁS LINDO”</span>
        <h2>Prepará una candidatura que tenga una razón para avanzar.</h2>
        <p>El primer diagnóstico es gratis.</p>
        <a href="#analisis">Analizar mi CV</a>
      </section>

      <footer className={styles.footer}>
        <div><b>CV IA</b><span>Preview de producto · Llena Group</span></div>
        <small>Producto en validación. No garantizamos entrevistas ni contrataciones.</small>
      </footer>

      <a className={styles.mobileSticky} href="#analisis">Analizar gratis</a>
    </main>
  )
}
