'use client'

import {useState} from 'react'
import styles from './LandingFeatureTabs.module.css'

type Feature={key:string;label:string;eyebrow:string;title:string;body:string;image:string;alt:string;points:string[];metric:string;metricLabel:string}

const features:Feature[]=[
  {key:'vender',label:'Vender',eyebrow:'01 · VENTAS Y CAJA',title:'Cobrar tiene que ser la parte fácil.',body:'Buscá o escaneá productos, elegí el medio de pago y cerrá la venta sin saltar entre pantallas.',image:'https://images.pexels.com/photos/33688678/pexels-photo-33688678.jpeg?auto=compress&cs=tinysrgb&w=1800',alt:'Interacción en la caja de un supermercado de Buenos Aires',points:['Venta rápida','Caja diaria','Descuentos y promociones'],metric:'1 flujo',metricLabel:'de producto a cobro'},
  {key:'stock',label:'Stock',eyebrow:'02 · PRODUCTOS',title:'El stock acompaña la venta. No va por separado.',body:'Consultá existencias, actualizá precios y detectá productos bajos sin perder tiempo armando planillas paralelas.',image:'https://images.pexels.com/photos/13439959/pexels-photo-13439959.jpeg?auto=compress&cs=tinysrgb&w=1800',alt:'Empleado trabajando en un comercio de Santo Domingo',points:['Stock en tiempo real','Carga y edición rápida','Alertas de bajo stock'],metric:'Siempre',metricLabel:'inventario a mano'},
  {key:'arca',label:'Facturar',eyebrow:'03 · ARCA',title:'La factura sale dentro de la misma venta.',body:'Una vez configurado el certificado y el punto de venta, el proceso fiscal queda integrado al trabajo diario.',image:'https://images.pexels.com/photos/4921262/pexels-photo-4921262.jpeg?auto=compress&cs=tinysrgb&w=1800',alt:'Persona realizando un cobro con terminal de pago',points:['Factura electrónica','Punto de venta configurado','Comprobantes desde el sistema'],metric:'ARCA',metricLabel:'integrado al POS'},
  {key:'movil',label:'Móvil',eyebrow:'04 · CELULAR',title:'Recorré el local sin volver a la caja.',body:'Usá la cámara para leer códigos, consultar productos y corregir stock desde donde está la mercadería.',image:'https://images.pexels.com/photos/16837815/pexels-photo-16837815.jpeg?auto=compress&cs=tinysrgb&w=1800',alt:'Comerciante latina en un mercado de Ciudad de México',points:['Scanner con cámara','Productos y stock','Operación desde el teléfono'],metric:'Web + móvil',metricLabel:'misma cuenta'},
  {key:'ia',label:'IA',eyebrow:'05 · ASISTENTE',title:'Preguntale al negocio en lenguaje normal.',body:'Consultá ventas, tendencias y stock sin armar reportes cada vez. La IA funciona como una capa de lectura sobre la operación.',image:'https://images.pexels.com/photos/6545444/pexels-photo-6545444.jpeg?auto=compress&cs=tinysrgb&w=1800',alt:'Comerciante conversando con una clienta en un local',points:['Consultas de ventas','Señales de stock','Ayuda dentro del sistema'],metric:'Menos',metricLabel:'reportes manuales'},
]

export default function LandingFeatureTabs(){
  const[active,setActive]=useState(0)
  const feature=features[active]
  return <div className={styles.wrap}>
    <div className={styles.tabs} role="tablist" aria-label="Funciones de Comercio Lleno">
      {features.map((item,index)=><button key={item.key} type="button" role="tab" aria-selected={active===index} className={active===index?styles.active:''} onClick={()=>setActive(index)}><span>{String(index+1).padStart(2,'0')}</span>{item.label}</button>)}
    </div>
    <div className={styles.stage} role="tabpanel" key={feature.key}>
      <div className={styles.photo}><img src={feature.image} alt={feature.alt}/><div className={styles.metric}><strong>{feature.metric}</strong><span>{feature.metricLabel}</span></div></div>
      <div className={styles.copy}><p>{feature.eyebrow}</p><h3>{feature.title}</h3><div className={styles.rule}/><p className={styles.body}>{feature.body}</p><ul>{feature.points.map(point=><li key={point}>{point}</li>)}</ul></div>
    </div>
  </div>
}
