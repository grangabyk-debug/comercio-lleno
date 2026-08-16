import Script from 'next/script'

export const META_WHATSAPP_APP_ID='1564921658645712'
export const META_WHATSAPP_CONFIG_ID='1817251942977665'
export const META_GRAPH_VERSION='v26.0'

export default function MetaWhatsAppSdk(){
  const init=`
window.fbAsyncInit=function(){
  window.FB.init({
    appId:'${META_WHATSAPP_APP_ID}',
    autoLogAppEvents:true,
    xfbml:true,
    version:'${META_GRAPH_VERSION}'
  });
};`

  return (
    <>
      <Script id="meta-whatsapp-sdk-init" strategy="afterInteractive">{init}</Script>
      <Script
        id="meta-facebook-jssdk"
        src="https://connect.facebook.net/en_US/sdk.js"
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
    </>
  )
}
