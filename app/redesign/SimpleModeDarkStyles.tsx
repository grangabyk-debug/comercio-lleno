import styles from './simple-mode.module.css'

export default function SimpleModeDarkStyles(){
  return <style>{`
    html:has(main[class*="dark"]) .${styles.overlay}{background:#15201c!important;color:#eef5f1!important}
    html:has(main[class*="dark"]) .${styles.top} p{color:#a9bbb2!important}
    html:has(main[class*="dark"]) .${styles.scanner}{background:#1d2b25!important;border-color:#3b5148!important;color:#b4c5bd!important}
    html:has(main[class*="dark"]) .${styles.aiCard}{background:#18231f!important;color:#eef5f1!important}
    html:has(main[class*="dark"]) .${styles.aiMessages}{background:#111916!important}
    html:has(main[class*="dark"]) .${styles.bot}{background:#22302a!important;border-color:#3b5148!important;color:#eef5f1!important}
    html:has(main[class*="dark"]) .${styles.aiCard} input{background:#111916!important;border-color:#3b5148!important;color:#eef5f1!important}
  `}</style>
}
