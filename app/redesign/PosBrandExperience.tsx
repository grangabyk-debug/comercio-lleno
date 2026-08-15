const css=`
/* Nueva venta: controles más grandes, legibles y alineados a la marca. Solo presentación. */
main[class*="shell"] [class*="controls"]{
  gap:14px!important;
  padding:18px 19px 20px!important;
  background:
    radial-gradient(circle at 96% 4%,rgba(255,100,29,.10),transparent 28%),
    radial-gradient(circle at 5% 42%,rgba(109,54,216,.08),transparent 34%),
    color-mix(in srgb,var(--surface,#fff) 94%,#f8f3ff)!important;
}
main[class*="shell"] [class*="tools"]{gap:10px!important}
main[class*="shell"] [class*="tool"]{
  min-height:56px!important;
  padding:13px 14px!important;
  border-radius:15px!important;
  font-size:14px!important;
  line-height:1.15!important;
  font-weight:900!important;
  letter-spacing:-.12px!important;
  border:1px solid rgba(109,54,216,.22)!important;
  background:linear-gradient(145deg,rgba(255,255,255,.96),rgba(109,54,216,.055))!important;
  color:#211928!important;
  box-shadow:0 8px 20px rgba(51,30,66,.07),inset 0 1px 0 rgba(255,255,255,.95)!important;
  transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease!important;
}
main[class*="shell"] [class*="tools"] [class*="tool"]:nth-child(2){
  border-color:rgba(255,100,29,.25)!important;
  background:linear-gradient(145deg,rgba(255,255,255,.97),rgba(255,100,29,.065))!important;
}
main[class*="shell"] [class*="tool"]:hover{
  transform:translateY(-1px)!important;
  box-shadow:0 11px 26px rgba(51,30,66,.11),inset 0 1px 0 rgba(255,255,255,.98)!important;
}
main[class*="shell"] [class*="toolActive"]{
  border-color:#7c49dc!important;
  background:linear-gradient(135deg,rgba(109,54,216,.18),rgba(109,54,216,.08))!important;
  color:#5725b1!important;
  box-shadow:0 9px 22px rgba(109,54,216,.13),inset 0 1px 0 rgba(255,255,255,.8)!important;
}
main[class*="shell"] [class*="paymentLabel"]{
  margin-top:2px!important;
  font-size:11.5px!important;
  line-height:1.2!important;
  letter-spacing:.13em!important;
  font-weight:950!important;
  color:#4d4054!important;
}
main[class*="shell"] [class*="payments"]{gap:9px!important}
main[class*="shell"] [class*="payment"]{
  min-height:48px!important;
  padding:12px 8px!important;
  border-radius:14px!important;
  font-size:13.5px!important;
  line-height:1.1!important;
  font-weight:900!important;
  color:#211928!important;
  border:1px solid rgba(109,54,216,.16)!important;
  background:linear-gradient(145deg,rgba(255,255,255,.98),rgba(109,54,216,.035))!important;
  box-shadow:0 6px 16px rgba(40,24,49,.045),inset 0 1px 0 #fff!important;
  transition:transform .14s ease,box-shadow .14s ease,border-color .14s ease!important;
}
main[class*="shell"] [class*="payment"]:nth-child(3n+2){
  background:linear-gradient(145deg,rgba(255,255,255,.98),rgba(255,100,29,.035))!important;
  border-color:rgba(255,100,29,.16)!important;
}
main[class*="shell"] [class*="payment"]:hover{transform:translateY(-1px)!important;box-shadow:0 9px 20px rgba(45,27,57,.08)!important}
main[class*="shell"] [class*="paymentSelected"]{
  color:#fff!important;
  border-color:#7a48dc!important;
  background:linear-gradient(135deg,#6d36d8 0%,#5120b4 72%,#3c1789 100%)!important;
  box-shadow:0 10px 24px rgba(109,54,216,.25),inset 0 1px 0 rgba(255,255,255,.20)!important;
}
main[class*="shell"] [class*="cashRow"]{gap:10px!important}
main[class*="shell"] [class*="cashRow"] label{
  gap:7px!important;
  font-size:13px!important;
  line-height:1.25!important;
  font-weight:900!important;
  color:#2b2230!important;
}
main[class*="shell"] [class*="cashRow"] input{
  min-height:48px!important;
  padding:11px 13px!important;
  border-radius:13px!important;
  font-size:14px!important;
  font-weight:750!important;
  border:1px solid rgba(109,54,216,.20)!important;
  background:rgba(255,255,255,.88)!important;
  box-shadow:inset 0 1px 0 #fff,0 6px 16px rgba(47,30,57,.04)!important;
}
main[class*="shell"] [class*="change"]{
  min-width:82px!important;
  min-height:48px!important;
  padding:8px 12px!important;
  border-radius:13px!important;
  border:1px solid rgba(255,100,29,.22)!important;
  background:linear-gradient(145deg,rgba(255,255,255,.92),rgba(255,100,29,.07))!important;
  box-shadow:0 6px 16px rgba(55,34,27,.04)!important;
}
main[class*="shell"] [class*="change"] span{font-size:10.5px!important;font-weight:850!important}
main[class*="shell"] [class*="change"] strong{font-size:17px!important;font-weight:950!important}
main[class*="shell"] [class*="checkoutBox"]{
  margin-top:2px!important;
  padding:16px!important;
  gap:12px!important;
  border:1px solid rgba(109,54,216,.13)!important;
  border-radius:18px!important;
  background:linear-gradient(145deg,rgba(255,255,255,.82),rgba(109,54,216,.035) 58%,rgba(255,100,29,.04))!important;
  box-shadow:0 12px 30px rgba(43,27,53,.065),inset 0 1px 0 rgba(255,255,255,.9)!important;
  backdrop-filter:blur(8px)!important;
}
main[class*="shell"] [class*="summary"]{
  font-size:13px!important;
  line-height:1.35!important;
  font-weight:700!important;
}
main[class*="shell"] [class*="summary"] strong{font-size:13.5px!important;font-weight:950!important}
main[class*="shell"] [class*="grand"]{margin-top:5px!important;align-items:center!important}
main[class*="shell"] [class*="grand"] span{font-size:14px!important;font-weight:950!important;letter-spacing:.04em!important}
main[class*="shell"] [class*="grand"] strong{font-size:32px!important;font-weight:950!important;letter-spacing:-1px!important}
main[class*="shell"] [class*="checkoutActions"]{gap:10px!important}
main[class*="shell"] [class*="checkoutActions"] button{
  min-height:62px!important;
  border-radius:16px!important;
  font-size:15px!important;
  line-height:1.15!important;
  font-weight:950!important;
  letter-spacing:-.12px!important;
  text-shadow:0 1px 0 rgba(0,0,0,.10)!important;
  transition:transform .16s ease,box-shadow .16s ease,filter .16s ease!important;
}
main[class*="shell"] [class*="checkoutActions"] button:not(:disabled):hover{transform:translateY(-2px)!important;filter:saturate(1.06)!important}
main[class*="shell"] [class*="invoice"]{
  color:#fff!important;
  background:linear-gradient(135deg,#6d36d8 0%,#5120b4 72%,#391381 100%)!important;
  box-shadow:0 13px 28px rgba(109,54,216,.28),inset 0 1px 0 rgba(255,255,255,.22)!important;
}
main[class*="shell"] [class*="charge"]{
  color:#fff!important;
  background:linear-gradient(135deg,#ff641d 0%,#ef5112 72%,#cc3d06 100%)!important;
  box-shadow:0 13px 28px rgba(255,100,29,.25),inset 0 1px 0 rgba(255,255,255,.20)!important;
}
main[class*="shell"] [class*="hint"]{
  padding-top:2px!important;
  font-size:11.5px!important;
  line-height:1.4!important;
  font-weight:700!important;
  color:#6f6374!important;
}
main[class*="shell"] [class*="hint"] b{color:#2f2535!important;font-weight:950!important}
main[class*="shell"] [class*="toolPanel"]{
  padding:13px!important;
  border-radius:14px!important;
  border-color:rgba(109,54,216,.16)!important;
  background:rgba(255,255,255,.72)!important;
  box-shadow:0 8px 18px rgba(43,27,53,.04)!important;
  backdrop-filter:blur(8px)!important;
}
main[class*="shell"] [class*="toolPanel"] label{font-size:11.5px!important;font-weight:900!important}
main[class*="shell"] [class*="toolPanel"] select,main[class*="shell"] [class*="toolPanel"] input{font-size:13.5px!important;min-height:44px!important}
main[class*="shell"] [class*="quick"] button{min-height:38px!important;font-size:12px!important;font-weight:900!important;border-radius:10px!important}

/* Modo oscuro: mantener contraste y transparencias, sin volver el panel blanco. */
main[class*="shell"][class*="dark"] [class*="controls"]{
  background:
    radial-gradient(circle at 96% 4%,rgba(255,100,29,.12),transparent 28%),
    radial-gradient(circle at 5% 42%,rgba(109,54,216,.13),transparent 34%),
    #17131a!important;
}
main[class*="shell"][class*="dark"] [class*="tool"]{
  color:#f4eef7!important;
  border-color:rgba(145,102,230,.25)!important;
  background:linear-gradient(145deg,rgba(37,29,42,.94),rgba(109,54,216,.12))!important;
  box-shadow:0 8px 20px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.055)!important;
}
main[class*="shell"][class*="dark"] [class*="tools"] [class*="tool"]:nth-child(2){background:linear-gradient(145deg,rgba(37,29,42,.94),rgba(255,100,29,.09))!important;border-color:rgba(255,124,70,.23)!important}
main[class*="shell"][class*="dark"] [class*="paymentLabel"],main[class*="shell"][class*="dark"] [class*="cashRow"] label{color:#d8cfe0!important}
main[class*="shell"][class*="dark"] [class*="payment"]{
  color:#eee7f2!important;
  border-color:rgba(145,102,230,.20)!important;
  background:linear-gradient(145deg,#211b25,rgba(109,54,216,.09))!important;
  box-shadow:0 6px 16px rgba(0,0,0,.14),inset 0 1px 0 rgba(255,255,255,.04)!important;
}
main[class*="shell"][class*="dark"] [class*="payment"]:nth-child(3n+2){background:linear-gradient(145deg,#211b25,rgba(255,100,29,.07))!important;border-color:rgba(255,124,70,.18)!important}
main[class*="shell"][class*="dark"] [class*="paymentSelected"]{color:#fff!important;background:linear-gradient(135deg,#7b45e1,#5824bc 72%,#40158d)!important;border-color:#986ced!important}
main[class*="shell"][class*="dark"] [class*="cashRow"] input{background:rgba(33,27,37,.88)!important;color:#f7f2f8!important;border-color:rgba(145,102,230,.24)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.04)!important}
main[class*="shell"][class*="dark"] [class*="change"]{background:linear-gradient(145deg,#211b25,rgba(255,100,29,.08))!important;border-color:rgba(255,124,70,.20)!important}
main[class*="shell"][class*="dark"] [class*="checkoutBox"]{background:linear-gradient(145deg,rgba(33,27,37,.88),rgba(109,54,216,.08) 58%,rgba(255,100,29,.055))!important;border-color:rgba(145,102,230,.18)!important;box-shadow:0 12px 30px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.04)!important}
main[class*="shell"][class*="dark"] [class*="hint"]{color:#aaa0ae!important}
main[class*="shell"][class*="dark"] [class*="hint"] b{color:#f3edf6!important}
main[class*="shell"][class*="dark"] [class*="toolPanel"]{background:rgba(33,27,37,.82)!important;border-color:rgba(145,102,230,.20)!important;box-shadow:0 8px 18px rgba(0,0,0,.16)!important}

@media(max-width:760px){
  main[class*="shell"] [class*="controls"]{padding:16px 14px 18px!important}
  main[class*="shell"] [class*="tool"]{font-size:13.5px!important;min-height:54px!important}
  main[class*="shell"] [class*="payment"]{font-size:13px!important;min-height:48px!important}
  main[class*="shell"] [class*="checkoutBox"]{padding:14px!important}
  main[class*="shell"] [class*="checkoutActions"] button{font-size:15px!important;min-height:60px!important}
}
`

export default function PosBrandExperience(){return <style dangerouslySetInnerHTML={{__html:css}}/>}
