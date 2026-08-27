'use client'

import {useLayoutEffect,useState} from 'react'
import {createPortal} from 'react-dom'

const styles=`
.pmcv-perspective-host>[class*="sectionIntro"],.pmcv-perspective-host>[class*="filterGrid"]{display:none!important}
.pmcv-perspective-host{padding:0!important;background:transparent!important;border:0!important;box-shadow:none!important;overflow:visible!important;width:min(1160px,100%)!important;max-width:1160px!important;margin:18px auto!important}
.pmcv-glass-story{--glass-ink:#171722;--glass-violet:#6858ff;--glass-lime:#d8ff5c;position:relative;isolation:isolate;min-height:520px;display:grid;grid-template-columns:minmax(270px,.72fr) minmax(0,1.28fr);gap:42px;align-items:center;padding:48px;border:1px solid rgba(89,73,205,.15);border-radius:38px;background:linear-gradient(135deg,rgba(255,255,255,.94),rgba(247,245,255,.9) 47%,rgba(241,239,255,.92));box-shadow:0 34px 90px rgba(57,45,126,.12);overflow:hidden;color:var(--glass-ink)}
.pmcv-glass-story::before{content:"";position:absolute;inset:-25%;z-index:-3;background:radial-gradient(circle at 18% 24%,rgba(216,255,92,.30),transparent 18%),radial-gradient(circle at 76% 14%,rgba(104,88,255,.31),transparent 24%),radial-gradient(circle at 82% 82%,rgba(113,205,255,.24),transparent 20%);filter:blur(2px);animation:pmcvGlassMesh 14s ease-in-out infinite alternate}
.pmcv-glass-story::after{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;opacity:.34;background-image:radial-gradient(circle at 1px 1px,rgba(54,48,91,.12) 1px,transparent 0);background-size:18px 18px;mask-image:linear-gradient(115deg,#000 0%,transparent 42%,#000 100%)}
@keyframes pmcvGlassMesh{0%{transform:translate3d(-2%,0,0) scale(1)}50%{transform:translate3d(2%,-2%,0) scale(1.03)}100%{transform:translate3d(0,2%,0) scale(1.01)}}
.pmcv-glass-copy{position:relative;z-index:3}.pmcv-glass-kicker{display:inline-flex;align-items:center;gap:8px;margin-bottom:20px;padding:8px 11px;border:1px solid rgba(83,70,171,.13);border-radius:999px;background:rgba(255,255,255,.58);backdrop-filter:blur(15px);color:#5a4ae1;font-size:9px;font-weight:950;letter-spacing:.13em;box-shadow:inset 0 1px rgba(255,255,255,.75)}.pmcv-glass-kicker i{width:7px;height:7px;border-radius:50%;background:var(--glass-lime);box-shadow:0 0 0 5px rgba(216,255,92,.2)}
.pmcv-glass-copy h2{margin:0!important;max-width:430px!important;color:#171722!important;font-size:clamp(39px,4.2vw,58px)!important;line-height:.94!important;letter-spacing:-.06em!important;text-wrap:balance}.pmcv-glass-copy h2 em{font-style:normal;font-family:Georgia,serif;font-weight:400;color:#6554ed;letter-spacing:-.045em}.pmcv-glass-copy>p{max-width:390px;margin:18px 0 0!important;color:#66677a!important;font-size:13.5px!important;line-height:1.66!important}.pmcv-glass-proof{display:flex;align-items:center;gap:9px;margin-top:24px;color:#45455a;font-size:10px;font-weight:850}.pmcv-glass-proof i{width:25px;height:25px;display:grid;place-items:center;border-radius:50%;background:#191923;color:#d8ff5c;font-style:normal;font-size:11px}
.pmcv-glass-canvas{position:relative;min-height:420px;perspective:1200px}.pmcv-glass-halo{position:absolute;left:50%;top:50%;width:390px;height:390px;border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(255,255,255,.82) 0 25%,rgba(111,94,255,.12) 26% 39%,transparent 40% 100%);filter:drop-shadow(0 28px 50px rgba(73,57,165,.12));animation:pmcvHalo 7s ease-in-out infinite}.pmcv-glass-halo::before,.pmcv-glass-halo::after{content:"";position:absolute;inset:34px;border:1px solid rgba(101,84,238,.16);border-radius:50%}.pmcv-glass-halo::after{inset:78px;border-style:dashed;animation:pmcvRing 18s linear infinite}@keyframes pmcvHalo{50%{transform:translate(-50%,-52%) scale(1.035)}}@keyframes pmcvRing{to{transform:rotate(360deg)}}
.pmcv-glass-source{position:absolute;z-index:4;left:50%;top:50%;width:174px;height:174px;transform:translate(-50%,-50%);display:grid;place-items:center;text-align:center;border:1px solid rgba(255,255,255,.76);border-radius:48px;background:linear-gradient(145deg,rgba(28,28,39,.93),rgba(49,42,93,.9));backdrop-filter:blur(26px);box-shadow:0 25px 60px rgba(36,29,82,.27),inset 0 1px rgba(255,255,255,.15);color:#fff}.pmcv-glass-source::before{content:"";position:absolute;inset:10px;border:1px solid rgba(255,255,255,.08);border-radius:39px}.pmcv-glass-source span{display:grid;place-items:center;width:48px;height:48px;margin:auto;border-radius:16px;background:#d8ff5c;color:#171918;font-size:14px;font-weight:950}.pmcv-glass-source b{display:block;margin-top:11px;font-size:16px;letter-spacing:-.025em}.pmcv-glass-source small{display:block;margin-top:4px;color:#b9b6cd;font-size:9px}
.pmcv-glass-lens{position:absolute;z-index:5;width:245px;padding:18px 19px;border:1px solid rgba(255,255,255,.72);border-radius:24px;background:linear-gradient(145deg,rgba(255,255,255,.72),rgba(255,255,255,.48));backdrop-filter:blur(22px) saturate(1.35);box-shadow:0 22px 48px rgba(50,41,103,.13),inset 0 1px rgba(255,255,255,.92);transform-style:preserve-3d;overflow:hidden}.pmcv-glass-lens::after{content:"";position:absolute;width:100px;height:100px;right:-38px;top:-42px;border-radius:50%;filter:blur(5px);opacity:.55}.pmcv-glass-lens>span{display:flex;align-items:center;gap:7px;color:#79768b;font-size:8px;font-weight:950;letter-spacing:.12em}.pmcv-glass-lens>span::before{content:"";width:7px;height:7px;border-radius:50%;background:currentColor}.pmcv-glass-lens>b{display:block;margin-top:11px;color:#1d1d28;font-size:20px;letter-spacing:-.035em}.pmcv-glass-lens>p{margin:6px 0 0;color:#656578;font-size:10.5px;line-height:1.52}.pmcv-glass-lens.ats{left:1%;top:23px;transform:rotate(-4deg);animation:pmcvLensA 7.8s ease-in-out infinite}.pmcv-glass-lens.ats>span{color:#e16a3c}.pmcv-glass-lens.ats::after{background:#ffb186}.pmcv-glass-lens.selection{right:0;top:78px;transform:rotate(3deg);animation:pmcvLensB 8.7s ease-in-out infinite}.pmcv-glass-lens.selection>span{color:#6654ed}.pmcv-glass-lens.selection::after{background:#a798ff}.pmcv-glass-lens.area{left:13%;bottom:18px;transform:rotate(2deg);animation:pmcvLensC 9.4s ease-in-out infinite}.pmcv-glass-lens.area>span{color:#16895b}.pmcv-glass-lens.area::after{background:#8be2b6}@keyframes pmcvLensA{50%{transform:translate3d(5px,-8px,20px) rotate(-2.5deg)}}@keyframes pmcvLensB{50%{transform:translate3d(-6px,8px,28px) rotate(1.5deg)}}@keyframes pmcvLensC{50%{transform:translate3d(7px,-6px,18px) rotate(.5deg)}}
.pmcv-glass-beam{position:absolute;z-index:2;left:50%;top:50%;width:76%;height:1px;transform:translate(-50%,-50%) rotate(-11deg);background:linear-gradient(90deg,transparent,rgba(101,84,237,.34),rgba(216,255,92,.82),rgba(101,84,237,.34),transparent);box-shadow:0 0 18px rgba(105,88,255,.27);animation:pmcvBeam 4.8s ease-in-out infinite}@keyframes pmcvBeam{0%,100%{opacity:.28;transform:translate(-50%,-50%) rotate(-11deg) scaleX(.82)}50%{opacity:1;transform:translate(-50%,-50%) rotate(-11deg) scaleX(1)}}
@media(max-width:940px){.pmcv-glass-story{grid-template-columns:1fr;gap:20px;padding:34px}.pmcv-glass-copy h2{max-width:720px!important}.pmcv-glass-copy>p{max-width:650px}.pmcv-glass-canvas{min-height:430px}}
@media(max-width:620px){
 .pmcv-perspective-host{margin:12px auto!important}.pmcv-glass-story{padding:26px 16px 22px;border-radius:28px;min-height:0;gap:22px}.pmcv-glass-copy h2{font-size:36px!important}.pmcv-glass-copy>p{font-size:12px!important}.pmcv-glass-proof{margin-top:18px;font-size:9.5px}
 .pmcv-glass-canvas{min-height:0;display:grid;grid-template-columns:1fr;gap:13px;padding:12px 2px 2px;perspective:none}
 .pmcv-glass-halo{z-index:0;left:50%;top:43%;width:310px;height:310px;opacity:.6}.pmcv-glass-beam{display:none}
 .pmcv-glass-source{position:relative;z-index:2;left:auto;top:auto;transform:none;width:100%;height:auto;min-height:76px;padding:12px 15px;border-radius:22px;text-align:left;display:block;order:1}.pmcv-glass-source::before{inset:7px;border-radius:16px}.pmcv-glass-source>div{position:relative;z-index:1;display:grid;grid-template-columns:42px 1fr;grid-template-rows:auto auto;column-gap:11px;align-items:center}.pmcv-glass-source span{grid-row:1/3;width:42px;height:42px;margin:0;border-radius:13px;font-size:12px}.pmcv-glass-source b{margin:0;font-size:14px}.pmcv-glass-source small{margin:2px 0 0;font-size:8px}
 .pmcv-glass-lens{position:relative!important;z-index:3!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;width:100%!important;min-height:118px;padding:17px 18px!important;border-radius:22px!important;transform:none!important;animation:none!important;backdrop-filter:blur(20px) saturate(1.25)}.pmcv-glass-lens>b{font-size:18px}.pmcv-glass-lens>p{font-size:10.5px;max-width:88%}.pmcv-glass-lens.ats{order:2}.pmcv-glass-lens.selection{order:3}.pmcv-glass-lens.area{order:4}
 .pmcv-glass-lens.ats{background:linear-gradient(135deg,rgba(255,255,255,.92),rgba(255,244,238,.72))}.pmcv-glass-lens.selection{background:linear-gradient(135deg,rgba(255,255,255,.92),rgba(242,239,255,.78))}.pmcv-glass-lens.area{background:linear-gradient(135deg,rgba(255,255,255,.92),rgba(234,252,244,.78))}
}
@media(prefers-reduced-motion:reduce){.pmcv-glass-story::before,.pmcv-glass-halo,.pmcv-glass-halo::after,.pmcv-glass-lens,.pmcv-glass-beam{animation:none!important}}
`

export default function CvPerspectiveRebuild(){
 const [host,setHost]=useState<HTMLElement|null>(null)
 useLayoutEffect(()=>{
  const mount=()=>{
   const grid=document.querySelector('.pmcv-shell [class*="filterGrid"]') as HTMLElement|null
   const section=grid?.closest('section') as HTMLElement|null
   if(!section)return false
   section.classList.add('pmcv-perspective-host')
   setHost(section)
   return true
  }
  if(mount())return
  const observer=new MutationObserver(()=>{if(mount())observer.disconnect()})
  observer.observe(document.body,{childList:true,subtree:true})
  const timer=window.setTimeout(()=>observer.disconnect(),5000)
  return()=>{window.clearTimeout(timer);observer.disconnect()}
 },[])
 if(!host)return null
 return createPortal(<>
  <style>{styles}</style>
  <div className="pmcv-glass-story" aria-label="Tres perspectivas que revisan tu candidatura">
   <div className="pmcv-glass-copy">
    <span className="pmcv-glass-kicker"><i/>LECTURA EN CONTEXTO</span>
    <h2>Tu experiencia, vista con <em>tres criterios distintos.</em></h2>
    <p>No convertimos tu CV en una lista de checks. Lo miramos desde el sistema que lo recibe, la persona que selecciona y el área que necesita resolver el trabajo.</p>
    <div className="pmcv-glass-proof"><i>✓</i><span>Una sola fuente: lo que realmente figura en tu CV.</span></div>
   </div>
   <div className="pmcv-glass-canvas" aria-hidden="true">
    <div className="pmcv-glass-halo"/><div className="pmcv-glass-beam"/>
    <div className="pmcv-glass-source"><div><span>CV</span><b>Tu candidatura</b><small>sin inventar experiencia</small></div></div>
    <article className="pmcv-glass-lens ats"><span>LECTURA AUTOMÁTICA</span><b>Filtro ATS</b><p>Orden, legibilidad y coincidencia real con el aviso.</p></article>
    <article className="pmcv-glass-lens selection"><span>PRIMERA IMPRESIÓN</span><b>Selección</b><p>Qué se entiende rápido y qué puede frenar una entrevista.</p></article>
    <article className="pmcv-glass-lens area"><span>CRITERIO DEL PUESTO</span><b>Responsable del área</b><p>Si tu experiencia demuestra capacidad para ese trabajo concreto.</p></article>
   </div>
  </div>
 </>,host)
}
