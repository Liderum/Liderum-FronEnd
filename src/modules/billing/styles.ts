// Estilos do módulo de cobrança. Mesma abordagem das demais telas (string CSS + tokens
// --ink/--gold/--cream/--bdr do index.css), então claro/escuro vêm dos tokens.
// Direção visual: "livro-razão" — hairlines douradas, serifa nos títulos, números tabulares.
export const BILLING_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,700;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');
.bl{font-family:'DM Sans',sans-serif;color:var(--ink);display:flex;flex-direction:column;gap:24px;max-width:1120px;margin:0 auto;width:100%;}
.bl *{box-sizing:border-box;}
.bl-eyebrow{font-size:10px;font-weight:600;letter-spacing:1.8px;text-transform:uppercase;color:var(--gold);display:inline-flex;align-items:center;gap:8px;}
.bl-eyebrow::before{content:'';width:22px;height:1px;background:var(--gold);}
.bl-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(28px,3.4vw,40px);font-weight:700;letter-spacing:-0.6px;line-height:1.08;margin:6px 0 6px;}
.bl-h1 em{font-style:italic;color:var(--gold);font-weight:500;}
.bl-lead{font-size:13.5px;color:var(--ink3);line-height:1.65;max-width:56ch;margin:0;}
.bl-h2{font-family:'Cormorant Garamond',serif;font-size:21px;font-weight:700;letter-spacing:-0.3px;margin:0;}
.bl-card{background:var(--card-bg,#fff);border:1px solid var(--bdr);border-radius:14px;box-shadow:var(--shadow);}
.bl-num{font-family:var(--font-numeric);font-variant-numeric:tabular-nums lining-nums;}
.bl-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 20px;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;cursor:pointer;border:1px solid var(--bdr-strong);background:var(--card-bg,#fff);color:var(--ink);transition:transform .15s,box-shadow .2s,background .15s;text-decoration:none;min-height:42px;}
.bl-btn:hover:not(:disabled){background:var(--cream);}
.bl-btn:focus-visible,.bl-radio:focus-within,.bl-input:focus-visible,.bl-select:focus-visible,.bl-tab:focus-visible,.bl-plan:focus-visible{outline:2px solid var(--gold);outline-offset:2px;}
.bl-btn:disabled{opacity:.6;cursor:not-allowed;}
.bl-btn-primary{background:linear-gradient(135deg,var(--brand-gold),var(--brand-gold2));color:#fff;border-color:transparent;}
.bl-btn-primary:hover:not(:disabled){background:linear-gradient(135deg,var(--brand-gold),var(--brand-gold2));transform:translateY(-1px);box-shadow:0 8px 22px rgba(184,146,42,.35);}
.bl-btn-ghost{background:transparent;border-color:transparent;color:var(--ink3);}
.bl-btn-danger{color:#C0392B;border-color:rgba(192,57,43,.3);}
.bl-spin{width:15px;height:15px;border-radius:50%;border:2px solid currentColor;border-right-color:transparent;animation:bl-rot .7s linear infinite;}
@keyframes bl-rot{to{transform:rotate(360deg);}}
@media (prefers-reduced-motion:reduce){.bl-spin{animation-duration:2s;}.bl-btn{transition:none;}}
.bl-input,.bl-select{width:100%;min-height:42px;padding:9px 12px;border-radius:9px;border:1px solid var(--bdr-strong);background:var(--card-bg,#fff);color:var(--ink);font-family:'DM Sans',sans-serif;font-size:13px;}
.bl-label{display:block;font-size:11px;font-weight:600;letter-spacing:.6px;text-transform:uppercase;color:var(--ink3);margin-bottom:6px;}
.bl-alert{display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border-radius:10px;font-size:13px;line-height:1.5;border:1px solid var(--bdr);background:var(--cream);}
.bl-alert-err{background:rgba(192,57,43,.08);border-color:rgba(192,57,43,.28);color:var(--ink);}
.bl-alert-gold{background:rgba(184,146,42,.08);border-color:rgba(184,146,42,.3);}
.bl-skel{background:linear-gradient(90deg,var(--cream),var(--paper2),var(--cream));background-size:200% 100%;animation:bl-sh 1.4s ease infinite;border-radius:8px;}
@keyframes bl-sh{to{background-position:-200% 0;}}
.bl-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;}

/* Planos */
.bl-plans{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px;}
.bl-plan{position:relative;text-align:left;padding:24px 22px 22px;cursor:pointer;font-family:inherit;color:inherit;transition:transform .2s,box-shadow .2s,border-color .2s;overflow:hidden;}
.bl-plan::before{content:'';position:absolute;left:0;right:0;top:0;height:3px;background:linear-gradient(90deg,var(--gold),var(--gold2));opacity:.35;transition:opacity .2s;}
.bl-plan:hover{transform:translateY(-3px);}
.bl-plan[aria-checked='true']{border-color:var(--gold);box-shadow:0 0 0 1px var(--gold),var(--shadow);}
.bl-plan[aria-checked='true']::before{opacity:1;}
.bl-plan-name{font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:700;margin:0 0 2px;}
.bl-plan-code{font-size:10.5px;letter-spacing:1.4px;text-transform:uppercase;color:var(--ink3);}
.bl-plan-price{margin:18px 0 4px;display:flex;align-items:baseline;gap:6px;}
.bl-plan-price strong{font-size:32px;font-weight:600;letter-spacing:-1px;}
.bl-plan-price span{font-size:12px;color:var(--ink3);}
.bl-tag{display:inline-flex;align-items:center;gap:5px;font-size:10.5px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;padding:3px 9px;border-radius:99px;background:rgba(184,146,42,.12);color:var(--gold);}
.bl-grid2{display:grid;grid-template-columns:1.5fr 1fr;gap:20px;align-items:start;}
@media(max-width:900px){.bl-grid2{grid-template-columns:1fr;}}

/* Recibo / resumo */
.bl-receipt{padding:22px;display:flex;flex-direction:column;gap:14px;}
.bl-line{display:flex;align-items:baseline;gap:8px;font-size:13px;}
.bl-line::after{content:'';order:2;flex:1;border-bottom:1px dotted var(--bdr-strong);transform:translateY(-3px);}
.bl-line>:first-child{order:1;color:var(--ink3);}
.bl-line>:last-child{order:3;font-weight:500;}
.bl-total{display:flex;justify-content:space-between;align-items:baseline;padding-top:14px;border-top:1px solid var(--bdr-strong);}
.bl-total strong{font-size:28px;font-weight:600;letter-spacing:-.8px;}
.bl-radios{display:grid;gap:10px;}
.bl-radio{display:flex;gap:12px;align-items:flex-start;padding:12px 14px;border:1px solid var(--bdr-strong);border-radius:10px;cursor:pointer;font-size:13px;}
.bl-radio:has(input:checked){border-color:var(--gold);background:rgba(184,146,42,.06);}
.bl-radio input{margin-top:3px;accent-color:var(--gold);}
.bl-radio small{display:block;color:var(--ink3);font-size:12px;margin-top:2px;}

/* PIX */
.bl-pix{padding:24px;display:grid;gap:18px;justify-items:center;text-align:center;}
.bl-qr{position:relative;padding:14px;background:#fff;border-radius:12px;border:1px solid var(--bdr-strong);}
.bl-qr img{display:block;width:216px;height:216px;image-rendering:pixelated;}
.bl-qr i{position:absolute;width:16px;height:16px;border:2px solid var(--gold);}
.bl-qr i:nth-child(1){top:-1px;left:-1px;border-right:0;border-bottom:0;border-radius:10px 0 0 0;}
.bl-qr i:nth-child(2){top:-1px;right:-1px;border-left:0;border-bottom:0;border-radius:0 10px 0 0;}
.bl-qr i:nth-child(3){bottom:-1px;left:-1px;border-right:0;border-top:0;border-radius:0 0 0 10px;}
.bl-qr i:nth-child(4){bottom:-1px;right:-1px;border-left:0;border-top:0;border-radius:0 0 10px 0;}
.bl-timer{font-size:34px;font-weight:600;letter-spacing:-1px;}
.bl-timer-low{color:#C0392B;}
.bl-copy{width:100%;display:grid;gap:8px;text-align:left;}
.bl-copy textarea{width:100%;min-height:72px;resize:none;border-radius:9px;border:1px dashed var(--bdr-strong);background:var(--cream);color:var(--ink2);font-family:ui-monospace,monospace;font-size:11px;padding:10px;word-break:break-all;}
.bl-steps{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;font-size:12px;color:var(--ink3);}
.bl-live{display:inline-flex;align-items:center;gap:8px;font-size:12px;color:var(--ink3);}
.bl-dot{width:8px;height:8px;border-radius:50%;background:var(--gold);animation:bl-pulse 1.6s ease-in-out infinite;}
@keyframes bl-pulse{50%{opacity:.25;transform:scale(.7);}}
@media (prefers-reduced-motion:reduce){.bl-dot{animation:none;}}

/* Estado terminal */
.bl-end{padding:36px 24px;display:grid;gap:12px;justify-items:center;text-align:center;}
.bl-end-ico{width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(184,146,42,.12);color:var(--gold);}
.bl-end-ico.ok{background:rgba(39,134,87,.14);color:#278657;}
.bl-end-ico.bad{background:rgba(192,57,43,.12);color:#C0392B;}

/* Dashboard admin */
.bl-toolbar{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;}
.bl-seg{display:inline-flex;border:1px solid var(--bdr-strong);border-radius:10px;padding:3px;background:var(--card-bg,#fff);gap:2px;flex-wrap:wrap;}
.bl-tab{border:0;background:transparent;padding:7px 13px;border-radius:7px;font-family:inherit;font-size:12.5px;color:var(--ink3);cursor:pointer;min-height:34px;}
.bl-tab[aria-pressed='true'],.bl-tab[aria-selected='true']{background:var(--brand-dark);color:#fff;}
/* Checkout pós-cadastro (página cheia, fora do DashboardLayout) */
.bl-page{min-height:100vh;background:var(--cream);color:var(--ink);font-family:'DM Sans',sans-serif;}
.bl-page-nav{height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 48px;border-bottom:1px solid var(--bdr);background:rgb(var(--cream-rgb,247 244 239) / .97);}
.bl-logo{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;letter-spacing:-.5px;}
.bl-logo span{color:var(--gold);}
.bl-page-main{padding:40px 48px 72px;}
@media(max-width:900px){.bl-page-nav{padding:0 20px;}.bl-page-main{padding:28px 16px 56px;}}
.bl-stepper{display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:12px;color:var(--ink3);margin:2px 0 4px;}
.bl-stepper li{display:flex;align-items:center;gap:8px;list-style:none;}
.bl-stepper li+li::before{content:'';width:28px;height:1px;background:var(--bdr-strong);}
.bl-stepper .n{width:22px;height:22px;border-radius:50%;border:1px solid var(--bdr-strong);display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;}
.bl-stepper [aria-current='step']{color:var(--ink);font-weight:600;}
.bl-stepper [aria-current='step'] .n{background:var(--gold);border-color:var(--gold);color:#fff;}
.bl-stepper .done .n{background:rgba(39,134,87,.14);border-color:rgba(39,134,87,.4);color:#278657;}
.bl-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px;}
.bl-kpi{padding:18px 20px;display:grid;gap:6px;}
.bl-kpi-l{font-size:10.5px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:var(--ink3);}
.bl-kpi-v{font-size:28px;font-weight:600;letter-spacing:-.8px;}
.bl-delta{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:500;}
.bl-delta.up{color:#278657;}.bl-delta.down{color:#C0392B;}.bl-delta.flat{color:var(--ink3);}
.bl-chart{padding:20px;display:grid;gap:14px;}
.bl-chart-box{height:300px;width:100%;}
.bl-charts{display:grid;grid-template-columns:1.6fr 1fr;gap:18px;}
@media(max-width:960px){.bl-charts{grid-template-columns:1fr;}}
.bl-table-wrap{overflow-x:auto;}
.bl-table{width:100%;border-collapse:collapse;font-size:13px;min-width:640px;}
.bl-table th{font-size:10.5px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--ink3);text-align:left;padding:10px 16px;border-bottom:1px solid var(--bdr-strong);white-space:nowrap;}
.bl-table td{padding:12px 16px;border-bottom:1px solid var(--bdr);}
.bl-table th.r,.bl-table td.r{text-align:right;}
.bl-status{display:inline-flex;font-size:11px;font-weight:600;padding:3px 9px;border-radius:99px;}
.bl-status.Active{background:rgba(39,134,87,.14);color:#278657;}
.bl-status.Trial{background:rgba(184,146,42,.14);color:var(--gold);}
.bl-status.PastDue{background:rgba(214,137,16,.16);color:#B9770E;}
.bl-status.Churned{background:rgba(192,57,43,.12);color:#C0392B;}
.bl-pager{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 16px;font-size:12.5px;color:var(--ink3);flex-wrap:wrap;}
.bl-empty{padding:40px 20px;text-align:center;color:var(--ink3);font-size:13.5px;display:grid;gap:8px;justify-items:center;}
/* Cards de plano (escolha lado a lado; empilhados no mobile) */
.bl-pc-wrap{display:grid;gap:16px;grid-template-columns:minmax(0,2fr) minmax(0,1fr);align-items:stretch;}
.bl-pc-group{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));align-items:stretch;}
@media(max-width:900px){.bl-pc-wrap{grid-template-columns:1fr;}}
@media(max-width:560px){.bl-pc-group{grid-template-columns:1fr;}}
.bl-pc{position:relative;display:flex;flex-direction:column;gap:14px;padding:28px 22px 22px;border-radius:16px;overflow:hidden;cursor:pointer;background:var(--card-bg,#fff);border:1px solid var(--bdr);box-shadow:var(--shadow);transition:transform .22s cubic-bezier(.22,1,.36,1),box-shadow .22s,border-color .2s;}
.bl-pc::before{content:'';position:absolute;left:0;right:0;top:0;height:3px;background:linear-gradient(90deg,var(--gold),var(--gold2));opacity:.3;transition:opacity .2s;}
.bl-pc:hover{transform:translateY(-3px);}
.bl-pc[data-hl='true']{border-color:rgba(184,146,42,.55);background:linear-gradient(180deg,rgba(184,146,42,.07),transparent 38%),var(--card-bg,#fff);}
.bl-pc[data-hl='true']::before{opacity:.85;}
.bl-pc[data-selected='true']{border-color:var(--gold);box-shadow:0 0 0 2px var(--gold),var(--shadow);}
.bl-pc[data-selected='true']::before{opacity:1;}
.bl-pc:has(input:focus-visible){outline:2px solid var(--gold);outline-offset:3px;}
.bl-pc[data-disabled='true']{cursor:not-allowed;opacity:.7;}
.bl-pc[data-disabled='true']:hover{transform:none;}
.bl-pc-ent{cursor:default;background:var(--cream);border-style:dashed;}
.bl-pc-ent:hover{transform:none;}
.bl-pc-badge{position:absolute;top:0;right:18px;background:linear-gradient(135deg,var(--brand-gold),var(--brand-gold2));color:#fff;font-size:9.5px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;padding:6px 10px 7px;border-radius:0 0 8px 8px;}
.bl-pc-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;min-height:22px;}
.bl-pc-name{font-family:'Cormorant Garamond',serif;font-size:30px;font-weight:700;letter-spacing:-.4px;line-height:1;margin:0;}
.bl-pc-tag{font-size:12.5px;color:var(--ink3);line-height:1.5;margin:4px 0 0;min-height:38px;}
.bl-pc-price{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;}
.bl-pc-price strong{font-size:34px;font-weight:600;letter-spacing:-1.2px;}
.bl-pc-price span{font-size:12px;color:var(--ink3);}
.bl-pc-limits{display:grid;grid-template-columns:1fr 1fr;border:1px solid var(--bdr-strong);border-radius:10px;overflow:hidden;}
.bl-pc-limit{padding:10px 12px;display:flex;flex-direction:column;gap:2px;}
.bl-pc-limit+.bl-pc-limit{border-left:1px solid var(--bdr-strong);}
.bl-pc-limit b{font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:700;line-height:1;color:var(--gold);}
.bl-pc-limit small{font-size:10.5px;font-weight:600;letter-spacing:.9px;text-transform:uppercase;color:var(--ink3);}
.bl-pc-list{list-style:none;margin:0;padding:0;display:grid;gap:8px;font-size:13px;line-height:1.4;flex:1;align-content:start;}
.bl-pc-list li{display:flex;gap:9px;align-items:flex-start;}
.bl-pc-list svg{flex-shrink:0;margin-top:2px;color:var(--gold);}
.bl-pc-list.no{color:var(--ink3);flex:0;}
.bl-pc-list.no svg{color:var(--ink3);opacity:.7;}
.bl-pc-sub{font-size:10px;font-weight:600;letter-spacing:1.4px;text-transform:uppercase;color:var(--ink3);margin:2px 0 -4px;}
.bl-pc-pick{margin-top:4px;display:flex;align-items:center;justify-content:center;gap:8px;min-height:42px;border-radius:9px;font-size:13px;font-weight:500;border:1px solid var(--bdr-strong);color:var(--ink);transition:background .15s,color .15s,border-color .15s;}
.bl-pc[data-selected='true'] .bl-pc-pick{background:var(--gold);border-color:var(--gold);color:#fff;}
@media (prefers-reduced-motion:reduce){.bl-pc{transition:none;}.bl-pc:hover{transform:none;}}
`;
