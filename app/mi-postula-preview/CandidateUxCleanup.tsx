const css=`
.pm42-flex-guide>article:first-child{background:linear-gradient(145deg,#f1edff 0%,#dfd7ff 100%)!important;border-color:#cfc4ff!important;box-shadow:0 16px 34px rgba(102,84,237,.10)!important}
.pm42-flex-guide>article:nth-child(2){background:linear-gradient(145deg,#f4ffd6 0%,#ddff72 100%)!important;border-color:#cce95b!important;box-shadow:0 16px 34px rgba(164,196,42,.12)!important}
.pm42-flex-guide>article:first-child h3,.pm42-flex-guide>article:first-child p,.pm42-flex-guide>article:nth-child(2) h3,.pm42-flex-guide>article:nth-child(2) p{color:#17202a!important}
`
export default function CandidateUxCleanup(){return <style>{css}</style>}
