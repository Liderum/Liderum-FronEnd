export const PAYMENTS_CSS = `
.pg{font-family:'DM Sans',sans-serif;color:var(--ink,#1A1814);display:flex;flex-direction:column;gap:18px;}
.pg *{box-sizing:border-box;}
.pg-ledger{background:linear-gradient(135deg,var(--brand-dark,#1A1814) 0%,#2C2820 100%);border-radius:14px;padding:22px 26px;color:#fff;position:relative;overflow:hidden;}
.pg-ledger::after{content:'';position:absolute;top:-50px;right:-30px;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(184,146,42,0.18) 0%,transparent 70%);pointer-events:none;}
.pg-ledger-head{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;position:relative;z-index:1;}
.pg-eyebrow{font-size:10.5px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.5);font-weight:500;}
.pg-contract{font-family:'Cormorant Garamond',serif;font-size:clamp(28px,4vw,38px);font-weight:700;line-height:1.05;font-variant-numeric:tabular-nums lining-nums;}
.pg-pct{font-size:13px;color:rgba(255,255,255,0.85);text-align:right;}
.pg-pct strong{font-family:'Cormorant Garamond',serif;font-size:30px;color:var(--gold2,#D4A843);font-weight:700;display:block;line-height:1;}
.pg-bar{height:10px;border-radius:10px;background:rgba(255,255,255,0.12);margin-top:16px;overflow:hidden;position:relative;z-index:1;}
.pg-bar-sched{position:absolute;inset:0 auto 0 0;background:rgba(212,168,67,0.35);border-radius:10px;transition:width .5s ease;}
.pg-bar-paid{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,var(--gold,#B8922A),var(--gold2,#D4A843));border-radius:10px;transition:width .5s ease;}
.pg-bar-legend{display:flex;gap:16px;margin-top:8px;font-size:11px;color:rgba(255,255,255,0.6);flex-wrap:wrap;position:relative;z-index:1;}
.pg-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:5px;}
.pg-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;}
.pg-card{background:var(--card-bg,#fff);border:1px solid var(--bdr,rgba(26,24,20,0.10));border-radius:10px;padding:14px 16px;box-shadow:0 2px 8px rgba(26,24,20,0.03);min-width:0;}
.pg-card-label{font-size:10.5px;color:var(--ink3,#7A7670);font-weight:500;text-transform:uppercase;letter-spacing:.4px;}
.pg-card-val{font-family:var(--font-numeric,'DM Sans'),sans-serif;font-size:19px;font-weight:600;font-variant-numeric:tabular-nums lining-nums;margin-top:4px;overflow:hidden;text-overflow:ellipsis;}
.pg-card-sub{font-size:11px;color:var(--ink3,#7A7670);margin-top:2px;}
.pg-alert{display:flex;gap:10px;align-items:flex-start;padding:11px 14px;border-radius:10px;font-size:12.5px;line-height:1.45;border:1px solid;}
.pg-alert.warn{background:#FFF6DD;border-color:rgba(154,106,0,0.25);color:#7A5400;}
.pg-alert.err{background:#FDEDEC;border-color:rgba(192,57,43,0.25);color:#962D22;}
.pg-alert.info{background:#EEF4FB;border-color:rgba(41,98,160,0.2);color:#25507F;}
.pg-alert button{margin-left:auto;background:none;border:none;color:inherit;font-weight:600;cursor:pointer;text-decoration:underline;font-family:inherit;font-size:inherit;white-space:nowrap;}
.pg-toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}
.pg-filters{display:grid;grid-template-columns:repeat(2,minmax(0,340px));grid-template-rows:repeat(3,auto);grid-auto-flow:column;gap:12px 32px;}
.pg-ff{display:flex;flex-direction:column;gap:5px;min-width:0;}
.pg-ff-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--ink3,#7A7670);}
.pg-ff .lds-wrap,.pg-ff .ldd-wrap{width:100%;}
.pg-search{position:relative;width:100%;}
.pg-search svg{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--ink3,#7A7670);pointer-events:none;}
.pg-input{width:100%;padding:9px 12px;border-radius:8px;border:1px solid rgba(26,24,20,0.15);font-family:'DM Sans',sans-serif;font-size:13px;background:var(--card-bg,#fff);color:var(--ink,#1A1814);}
.pg-search .pg-input{padding-left:32px;}
.pg-input:focus-visible,.pg-btn:focus-visible,.pg-iconbtn:focus-visible,.pg-drop:focus-visible{outline:2px solid var(--gold,#B8922A);outline-offset:1px;}
.pg-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;border:1px solid rgba(26,24,20,0.12);background:var(--card-bg,#fff);color:var(--ink,#1A1814);font-family:'DM Sans',sans-serif;transition:all .14s;white-space:nowrap;}
.pg-btn:hover:not(:disabled){background:var(--cream,#F7F4EF);}
.pg-btn.primary{background:linear-gradient(135deg,var(--brand-gold),var(--brand-gold2));color:#fff;border:none;}
.pg-btn.primary:hover:not(:disabled){filter:brightness(.95);background:linear-gradient(135deg,var(--brand-gold),var(--brand-gold2));}
.pg-btn.danger{background:#FDEDEC;color:#C0392B;border-color:rgba(192,57,43,0.2);}
.pg-btn:disabled{opacity:.5;cursor:not-allowed;}
.pg-btn.sm{padding:5px 10px;font-size:11.5px;}
.pg-iconbtn{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;border:1px solid transparent;background:none;color:var(--ink3,#7A7670);cursor:pointer;transition:all .14s;}
.pg-iconbtn:hover:not(:disabled){background:var(--cream,#F7F4EF);color:var(--ink,#1A1814);}
.pg-iconbtn:disabled{opacity:.4;cursor:not-allowed;}
.pg-tablewrap{background:var(--card-bg,#fff);border:1px solid var(--bdr,rgba(26,24,20,0.10));border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(26,24,20,0.04);}
.pg-scroll{overflow-x:auto;}
.pg-table{width:100%;border-collapse:collapse;font-size:12.5px;min-width:760px;}
.pg-table th{text-align:left;font-size:10.5px;text-transform:uppercase;letter-spacing:.5px;color:var(--ink3,#7A7670);font-weight:600;padding:11px 14px;background:var(--cream,#F7F4EF);border-bottom:1px solid rgba(26,24,20,0.08);white-space:nowrap;}
.pg-table th button{background:none;border:none;font:inherit;text-transform:inherit;letter-spacing:inherit;color:inherit;cursor:pointer;display:inline-flex;gap:4px;align-items:center;padding:0;}
.pg-table th.num,.pg-table td.num{text-align:right;}
.pg-table td{padding:12px 14px;border-bottom:1px solid rgba(26,24,20,0.06);vertical-align:middle;}
.pg-table tr:last-child td{border-bottom:none;}
.pg-table tbody tr{transition:background .12s;}
.pg-table tbody tr:hover{background:rgba(247,244,239,0.6);}
.pg-table tr.cancelled td{opacity:.55;}
.pg-num{font-variant-numeric:tabular-nums lining-nums;font-weight:600;white-space:nowrap;}
.pg-desc{font-weight:500;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.pg-sub{font-size:11px;color:var(--ink3,#7A7670);}
.pg-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap;}
.pg-type{font-size:11px;font-weight:500;padding:2px 8px;border-radius:6px;background:var(--cream,#F7F4EF);border:1px solid rgba(26,24,20,0.08);}
.pg-clip{display:inline-flex;align-items:center;gap:5px;border:1px solid rgba(26,24,20,0.12);background:var(--card-bg,#fff);border-radius:8px;padding:4px 9px;font-size:11.5px;cursor:pointer;font-family:inherit;color:var(--ink,#1A1814);}
.pg-clip:hover{background:var(--cream,#F7F4EF);}
.pg-clip.none{color:#9A6A00;border-style:dashed;}
.pg-actions{display:flex;gap:2px;justify-content:flex-end;}
.pg-pager{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 14px;border-top:1px solid rgba(26,24,20,0.08);font-size:12px;color:var(--ink3,#7A7670);flex-wrap:wrap;}
.pg-empty{text-align:center;padding:48px 20px;color:var(--ink3,#7A7670);}
.pg-empty h3{font-family:'Cormorant Garamond',serif;font-size:20px;color:var(--ink,#1A1814);margin:10px 0 4px;}
.pg-skel{height:14px;border-radius:6px;background:linear-gradient(90deg,#EFEDE8,#F7F4EF,#EFEDE8);background-size:200% 100%;animation:pgsk 1.2s infinite;}
@keyframes pgsk{0%{background-position:200% 0}100%{background-position:-200% 0}}
.pg-field{margin-bottom:14px;}
.pg-chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;}
.pg-chip{border:1px solid rgba(184,146,42,0.4);background:rgba(184,146,42,0.06);color:var(--gold,#B8922A);border-radius:20px;padding:5px 12px;font-size:11.5px;font-weight:500;cursor:pointer;font-family:inherit;}
.pg-chip:hover{background:rgba(184,146,42,0.14);}
.pg-drop{border:1.5px dashed rgba(26,24,20,0.25);border-radius:12px;padding:22px 16px;text-align:center;background:var(--cream,#F7F4EF);transition:all .15s;cursor:pointer;}
.pg-drop.over{border-color:var(--gold,#B8922A);background:rgba(184,146,42,0.08);}
.pg-drop strong{display:block;font-size:13px;margin-top:6px;}
.pg-drop span{font-size:11.5px;color:var(--ink3,#7A7670);}
.pg-rows{display:flex;flex-direction:column;gap:8px;margin-top:12px;}
.pg-row{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid rgba(26,24,20,0.1);border-radius:10px;background:var(--card-bg,#fff);}
.pg-row-info{flex:1;min-width:0;}
.pg-row-name{font-size:12.5px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.pg-prog{height:5px;border-radius:5px;background:rgba(26,24,20,0.08);margin-top:6px;overflow:hidden;}
.pg-prog>i{display:block;height:100%;background:linear-gradient(90deg,var(--gold,#B8922A),var(--gold2,#D4A843));transition:width .2s;}
.pg-err{color:#C0392B;font-size:11px;margin-top:4px;}
.pg-preview{position:fixed;inset:0;background:rgba(26,24,20,0.8);z-index:1100;display:flex;flex-direction:column;padding:12px;}
.pg-preview-bar{display:flex;justify-content:space-between;align-items:center;color:#fff;gap:10px;padding:4px 4px 10px;font-size:13px;}
.pg-preview-body{flex:1;min-height:0;background:#fff;border-radius:10px;display:flex;align-items:center;justify-content:center;overflow:auto;}
.pg-preview-body img{max-width:100%;max-height:100%;object-fit:contain;}
.pg-preview-body iframe{width:100%;height:100%;border:0;}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;}
.pg-seg{display:inline-flex;gap:2px;background:var(--card-bg,#fff);border:1px solid var(--bdr,rgba(26,24,20,0.10));border-radius:10px;padding:4px;align-self:flex-start;max-width:100%;overflow-x:auto;}
.pg-seg button{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:7px;border:none;background:none;font-family:'DM Sans',sans-serif;font-size:12.5px;color:var(--ink3,#7A7670);cursor:pointer;white-space:nowrap;transition:all .16s;}
.pg-seg button:hover{color:var(--ink,#1A1814);background:var(--cream,#F7F4EF);}
.pg-seg button[aria-checked=true]{color:var(--gold,#B8922A);background:rgba(184,146,42,0.1);font-weight:500;}
.pg-seg button:focus-visible{outline:2px solid var(--gold,#B8922A);outline-offset:1px;}
@media(max-width:720px){.pg-filters{grid-template-columns:minmax(0,1fr);grid-template-rows:none;grid-auto-flow:row;}}
@media(max-width:640px){.pg-ledger{padding:18px;}.pg-pct{text-align:left;}}
@media(prefers-reduced-motion:reduce){.pg-bar-paid,.pg-bar-sched,.pg-prog>i{transition:none}.pg-skel{animation:none}}
`;
