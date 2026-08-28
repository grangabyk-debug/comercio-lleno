import {postulaProductMetadata} from '../postulaProductMetadata'
import SupportHelp from '../postula-preview/SupportHelp'
import CandidateUxCleanup from './CandidateUxCleanup'
import '../postula-preview/support-help-v21.css'
import './account-readable-v35.css'

export const metadata=postulaProductMetadata

const avatarCacheCss=`
.pm-avatar-cache-ready .pm34-mini-avatar,
.pm-avatar-cache-ready .pm34-avatar{
 background-image:var(--pm-candidate-avatar-cache);
 background-position:center;
 background-size:cover;
 background-repeat:no-repeat;
 color:transparent!important;
 text-shadow:none!important;
}
`

const avatarCacheScript=`(()=>{
 const P='pm:candidate-avatar:',C='pm-avatar-cache-ready',V='--pm-candidate-avatar-cache',TTL=2700000;
 let key='';
 const clear=()=>{document.documentElement.style.removeProperty(V);document.documentElement.classList.remove(C);if(key){try{sessionStorage.removeItem(key)}catch{}}};
 const apply=u=>{const value=String(u||'');if(!/^https?:\\/\\//i.test(value)){clear();return}document.documentElement.style.setProperty(V,'url("'+value.replace(/["\\\\]/g,'\\\\$&')+'")');document.documentElement.classList.add(C);const probe=new Image();probe.onerror=clear;probe.src=value};
 const read=()=>{const n=document.querySelector('.pm34-avatar');const v=n&&n.style?n.style.backgroundImage:'';const m=v&&v.match(/^url\\(["']?(.*?)["']?\\)$/);return m&&m[1]?m[1]:''};
 const persist=()=>{if(!key)return;const url=read();if(!url)return;try{sessionStorage.setItem(key,JSON.stringify({url,expiresAt:Date.now()+TTL}))}catch{}};
 const capture=()=>{setTimeout(persist,700);setTimeout(persist,1800);setTimeout(()=>{const url=read();if(url)persist();else if(document.querySelector('.pm34-avatar'))clear()},5000)};
 const start=()=>{
  try{
   const raw=localStorage.getItem('sb-pejkycdttogpmmdntzuq-auth-token');
   if(raw){const parsed=JSON.parse(raw);const uid=parsed&&parsed.user&&parsed.user.id;if(uid){key=P+uid;const saved=sessionStorage.getItem(key);if(saved){const c=JSON.parse(saved);if(c&&c.url&&c.expiresAt>Date.now()+30000)apply(c.url);else clear()}}}
  }catch{clear()}
  capture();
 };
 document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')persist()});
 window.addEventListener('pagehide',persist);
 document.addEventListener('change',e=>{const t=e.target;if(t&&t.tagName==='INPUT'&&t.type==='file')capture()},true);
})()`

export default function Layout({children}:{children:React.ReactNode}){
 return <><style dangerouslySetInnerHTML={{__html:avatarCacheCss}}/><script dangerouslySetInnerHTML={{__html:avatarCacheScript}}/><CandidateUxCleanup/>{children}<SupportHelp audience="candidate"/></>
}
