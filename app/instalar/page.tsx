import type { Metadata } from 'next'
import InstallClient from './InstallClient'

export const metadata:Metadata={
  title:'Instalar Comercio Lleno',
  description:'Instalá Comercio Lleno en tu teléfono.',
  manifest:'/manifest.webmanifest?v=20260823-2',
  robots:{index:false,follow:false},
}

const capture=`
(function(){
  if(window.__clDedicatedCaptureReady)return;
  window.__clDedicatedCaptureReady=true;
  window.addEventListener('beforeinstallprompt',function(event){
    event.preventDefault();
    window.__clDedicatedInstallPrompt=event;
    window.dispatchEvent(new Event('comercio:dedicated-install-ready'));
  });
  window.addEventListener('appinstalled',function(){
    window.__clDedicatedInstallPrompt=null;
    window.__clDedicatedInstalled=true;
  });
})();`

export default function InstallPage(){
  return <>
    <script id="cl-dedicated-install-capture" dangerouslySetInnerHTML={{__html:capture}}/>
    <InstallClient/>
  </>
}
