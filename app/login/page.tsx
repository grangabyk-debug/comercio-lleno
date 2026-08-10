'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('grangabyk@gmail.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Completá email y contraseña.'); return }
    // El alta de Auth real se conecta cuando creemos el usuario en Supabase Auth.
    // El acceso demo permite probar toda la interfaz sin tocar datos fiscales.
    localStorage.setItem('comercio_demo_user', JSON.stringify({ email, role: 'owner', company: 'La Económica' }))
    router.push('/')
  }

  return <main className="loginShell">
    <div className="loginCard">
      <div className="brand loginBrand">Comercio <span>Lleno</span></div>
      <p className="loginEyebrow">Punto de venta y gestión</p>
      <h1>Ingresar</h1>
      <p className="muted">Accedé a La Económica.</p>
      <form onSubmit={submit} className="loginForm">
        <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" /></label>
        <label>Contraseña<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" /></label>
        {error && <div className="errorBox">{error}</div>}
        <button className="primary" type="submit">Ingresar</button>
      </form>
      <small className="demoNote">Modo de prueba activado. La autenticación fiscal y el usuario real de Supabase se configurarán antes de usarlo en producción.</small>
    </div>
  </main>
}
