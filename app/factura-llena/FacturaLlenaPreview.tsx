'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './factura-llena.module.css'

type DeferredPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

export default function FacturaLlenaPreview(){
  const [amount, setAmount] = useState('85000')
  const [client, setClient] = useState('Juan Pérez')
  const [concept, setConcept] = useState('Servicio profesional')
  const [done, setDone] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<DeferredPrompt | null>(null)

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as DeferredPrompt)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const total = Number(amount.replace(/\D/g, '')) || 0

  async function install(){
    if (installPrompt) {
      await installPrompt.prompt()
      await installPrompt.userChoice
      setInstallPrompt(null)
      return
    }
    document.getElementById('instalar')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return <main className={styles.page}>
    <header className={styles.header}>
      <Link href="/" className={styles.group}>LLENA GROUP</Link>
      <div className={styles.logo}><span>F</span><strong>Factura Llena</strong></div>
      <button className={styles.installSmall} onClick={install}>Instalar app</button>
    </header>

    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <div className={styles.eyebrow}><span/> HECHO PARA ARGENTINA · ARCA</div>
        <h1>Facturá.<br/><em>Y seguí con tu día.</em></h1>
        <p>Una app para emitir facturas electrónicas desde el celular sin perderte entre menús. Cliente, concepto, importe y listo.</p>
        <div className={styles.heroActions}>
          <button className={styles.primary} onClick={() => document.getElementById('demo')?.scrollIntoView({behavior:'smooth'})}>Probar cómo se siente</button>
          <button className={styles.secondary} onClick={install}>Descargar app</button>
        </div>
        <div className={styles.trustLine}><b>Factura A, B y C</b><span>CAE automático</span><span>PDF + QR</span><span>WhatsApp</span></div>
      </div>

      <div className={styles.heroVisual}>
        <div className={styles.photoCard}>
          <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=85" alt="Persona trabajando desde su celular en un comercio"/>
          <div className={styles.photoShade}/>
          <div className={styles.photoCaption}><span>EN MOVIMIENTO</span><b>Tu facturador vive en el bolsillo.</b></div>
        </div>
        <div className={styles.floatInvoice}>
          <span className={styles.successDot}/><small>FACTURA AUTORIZADA</small>
          <strong>{money.format(85000)}</strong>
          <p>CAE obtenido · lista para compartir</p>
        </div>
      </div>
    </section>

    <section className={styles.demoSection} id="demo">
      <div className={styles.demoIntro}>
        <span>UNA MANO. CUATRO DATOS.</span>
        <h2>Así de simple debería ser facturar.</h2>
        <p>La zona importante queda abajo, al alcance del pulgar. Nada crítico depende de menús escondidos.</p>
      </div>

      <div className={styles.phoneWrap}>
        <div className={styles.phone}>
          <div className={styles.phoneTop}><span>9:41</span><b>Factura Llena</b><i/></div>
          {!done ? <div className={styles.phoneScreen}>
            <div className={styles.greeting}><small>NUEVA FACTURA</small><h3>¿A quién le facturamos?</h3></div>
            <label>Cliente<input value={client} onChange={e=>setClient(e.target.value)} /></label>
            <label>Concepto<input value={concept} onChange={e=>setConcept(e.target.value)} /></label>
            <div className={styles.typeRow}><button className={styles.activeType}>Factura C</button><button>Consumidor final</button></div>
            <label className={styles.amountLabel}>Importe<div><span>$</span><input inputMode="numeric" value={amount} onChange={e=>setAmount(e.target.value.replace(/\D/g,''))}/></div></label>
            <div className={styles.thumbZone}>
              <div><small>TOTAL</small><strong>{money.format(total)}</strong></div>
              <button onClick={()=>setDone(true)}>Emitir factura</button>
            </div>
          </div> : <div className={styles.successScreen}>
            <div className={styles.bigCheck}>✓</div>
            <small>FACTURA AUTORIZADA</small>
            <h3>{money.format(total)}</h3>
            <p>{client}<br/>{concept}</p>
            <div className={styles.cae}>CAE 74123456789012 <span>Vto. 30/08/2026</span></div>
            <button>Compartir por WhatsApp</button>
            <button className={styles.ghostPhone}>Ver PDF</button>
            <button className={styles.textPhone} onClick={()=>setDone(false)}>Hacer otra factura</button>
          </div>}
          <div className={styles.phoneNav}><span>Inicio</span><button>＋</button><span>Facturas</span></div>
        </div>
        <div className={styles.handNote}><span>01</span><p><b>Zona pulgar</b><br/>La acción principal siempre está cerca del borde inferior.</p></div>
        <div className={styles.handNoteSecond}><span>02</span><p><b>Sin miedo</b><br/>Antes de emitir se ve claramente tipo, cliente e importe.</p></div>
      </div>
    </section>

    <section className={styles.aiBand}>
      <div>
        <span>DESPUÉS, TODAVÍA MÁS SIMPLE</span>
        <h2>Decilo como hablás.</h2>
        <p>“Facturale a Juan 85 mil por reparación.” Factura Llena prepara el comprobante y vos confirmás antes de enviarlo a ARCA.</p>
      </div>
      <div className={styles.voiceCard}>
        <div className={styles.wave}><i/><i/><i/><i/><i/><i/><i/></div>
        <p>Facturale a Hotel Central $350.000 por asesoramiento de agosto.</p>
        <div className={styles.aiResult}><small>PREPARADO</small><b>Factura B · $350.000</b><span>Hotel Central · Servicios</span><button>Revisar y emitir</button></div>
      </div>
    </section>

    <section className={styles.featureGrid}>
      <article><span>01</span><h3>ARCA sin vueltas</h3><p>Facturas A, B y C, notas de crédito, CAE, QR y PDF fiscal.</p></article>
      <article><span>02</span><h3>Cobrá ahí mismo</h3><p>Link de Mercado Pago para pasar de factura emitida a cobro.</p></article>
      <article><span>03</span><h3>Compartí en un toque</h3><p>PDF por WhatsApp o email, sin descargar y buscar archivos.</p></article>
      <article><span>04</span><h3>Tus clientes quedan</h3><p>CUIT, condición fiscal y datos frecuentes listos para la próxima.</p></article>
    </section>

    <section className={styles.pricing} id="planes">
      <div className={styles.priceHeading}><span>PRECIOS ARGENTINOS</span><h2>Empezá gratis.<br/>Pagá cuando te sirva.</h2><p>Precios finales de lanzamiento expresados en pesos argentinos. Sin contratos largos.</p></div>
      <div className={styles.cards}>
        <article><small>INICIO</small><strong>$0</strong><span>/ mes</span><p>Para probar y emitir hasta 20 comprobantes.</p><button>Empezar gratis</button></article>
        <article className={styles.featured}><div className={styles.popular}>MÁS ELEGIDO</div><small>EMPRENDEDOR</small><strong>$8.900</strong><span>/ mes</span><p>Hasta 200 comprobantes + clientes + PDF + WhatsApp.</p><button>Elegir Emprendedor</button></article>
        <article><small>NEGOCIO</small><strong>$14.900</strong><span>/ mes</span><p>Hasta 1.000 comprobantes + Mercado Pago + reportes.</p><button>Elegir Negocio</button></article>
      </div>
      <p className={styles.priceFoot}>Necesitás más volumen o una API para tu sistema? Planes Pro y Developers disponibles más adelante.</p>
    </section>

    <section className={styles.installSection} id="instalar">
      <div className={styles.installPhoto}><img src="https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=85" alt="Emprendedora usando un celular para gestionar su negocio"/></div>
      <div className={styles.installCopy}>
        <span>NO NECESITÁS PLAY STORE</span>
        <h2>Instalala directo en tu celular.</h2>
        <p>Factura Llena funciona como app web instalable. La agregás a tu pantalla de inicio y se abre como una aplicación, a pantalla completa.</p>
        <button className={styles.primary} onClick={installPrompt ? install : undefined}>{installPrompt ? 'Instalar Factura Llena' : 'Abrir desde Android y tocar “Agregar a pantalla de inicio”'}</button>
        <small>En esta preview la instalación depende del navegador y del dispositivo.</small>
      </div>
    </section>

    <section className={styles.bridge}>
      <div><span>¿CRECIÓ TU NEGOCIO?</span><h2>Factura Llena no te encierra.</h2><p>Cuando necesites caja, stock, ventas, empleados o punto de venta, podés dar el salto a Comercio Llena sin empezar de cero.</p></div>
      <Link href="/">Conocer Comercio Llena →</Link>
    </section>

    <footer className={styles.footer}><div className={styles.logo}><span>F</span><strong>Factura Llena</strong></div><p>Un producto de Llena Group · Argentina</p><p className={styles.previewTag}>PREVIEW DE PRODUCTO · NO EMITE COMPROBANTES REALES</p></footer>
  </main>
}
