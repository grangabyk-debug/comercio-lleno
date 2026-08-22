self.addEventListener('install',()=>self.skipWaiting())
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()))

self.addEventListener('push',event=>{
  let data={}
  try{data=event.data?.json()||{}}catch{data={body:event.data?.text()||''}}
  const title=data.title||'Postulá Mejor'
  const options={
    body:data.body||'Tenés una novedad en Postulá Mejor.',
    tag:data.tag||'postula-mejor',
    data:{url:data.url||'/mi-cuenta',type:data.type||'notification'},
    icon:'/favicon.ico',
    badge:'/favicon.ico',
    renotify:true,
  }
  event.waitUntil(self.registration.showNotification(title,options))
})

self.addEventListener('notificationclick',event=>{
  event.notification.close()
  const target=new URL(event.notification.data?.url||'/mi-cuenta',self.location.origin).href
  event.waitUntil((async()=>{
    const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true})
    for(const client of windows){
      if('navigate'in client)await client.navigate(target).catch(()=>undefined)
      if('focus'in client)return client.focus()
    }
    return self.clients.openWindow(target)
  })())
})
