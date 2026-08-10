'use client'

import Link from 'next/link'

const cards = [['Ventas de hoy','$ 0','Sin ventas registradas'],['Productos','0','Listos para importar'],['Stock bajo','0','Sin alertas'],['Caja','Cerrada','Abrila para comenzar']]

export default function Dashboard(){return <main className="app"><header className="appbar"><Link className="brand" href="/">Comercio <span>Lleno</span></Link><div>Panel de administración</div></header><div className="content"><h1>Resumen</h1><p className="muted">Todo lo que pasa en tu comercio, en un solo lugar.</p><section className="cards">{cards.map(([title,value,desc])=><div className="card" key={title}><span>{title}</span><strong>{value}</strong><small>{desc}</small></div>)}</section><section className="menu"><Link href="/">🧾 <b>Punto de venta</b><small>Abrir caja</small></Link><Link href="/products">📦 <b>Productos</b><small>Precios, códigos y stock</small></Link><Link href="/sales">📊 <b>Ventas</b><small>Historial y comprobantes</small></Link><Link href="/customers">👥 <b>Clientes</b><small>Datos y facturación</small></Link><Link href="/cash">💰 <b>Caja</b><small>Apertura y cierre</small></Link><Link href="/import">📥 <b>Importar Excel</b><small>Cargar productos masivamente</small></Link><Link href="/settings">⚙️ <b>Configuración</b><small>Comercio, ARCA e impresión</small></Link></section></div></main>}
