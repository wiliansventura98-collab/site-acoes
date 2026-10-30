/* GERADO por i18n/ferramenta.js a partir de assets/js/app/distribuicao.js; não edite: edite o original e i18n/es.json */
var IDIOMA='es';
/*
 * Distribuição e cruzamento
 * Gráfico de barras por categoria e tabela de calor entre duas variáveis.
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

function renderBars(rowsV, vid){
  const body=$('distBody'); body.textContent='';
  const c=keepPlaces(counts(rowsV, vid), vid, spatialCons(vid)), ks=order(vid,c), N=rowsV.length, v=VARS[VI[vid]];
  const sel=st.f[vid]||new Set();
  const tools=$('distTools'); tools.textContent='';
  if(!ks.length){ body.append(el('div','empty','Ninguna noticia con valor en esta variable dentro del recorte.')); return; }
  const max=Math.max(...ks.map(k=>c.get(k)));
  const LIM=20; const shown = st.showAll? ks : ks.slice(0,LIM);
  const wrap=el('div','bars'); wrap.setAttribute('role','list');
  shown.forEach(k=>{
    const n=c.get(k); const row=el('div','row'+(sel.size? (sel.has(k)?' on':' off'):''));
    row.setAttribute('role','listitem'); row.tabIndex=0;
    row.title='Clic para filtrar · Mayús+clic para sumar a la selección';
    const nm=el('div','name',v.values[k]);
    const tr=el('div','track'); const fl=el('div','fill'); fl.style.width=(n/max*100)+'%'; tr.append(fl);
    const val=el('div','val',fmt(n)); val.append(el('small',null,pct(n,N)));
    row.append(nm,tr,val);
    const act=(e)=>{ if(sel.has(k)&&sel.size===1&&!e.shiftKey) toggleFilter(vid,k); else toggleFilter(vid,k,!e.shiftKey); };
    row.onclick=act; row.onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); act(e);} };
    wrap.append(row);
  });
  body.append(wrap);
  if(ks.length>LIM){ const b=el('button','btn more', st.showAll? 'Mostrar solo las 20 mayores' : `Mostrar todas las ${fmt(ks.length)} categorías`); b.onclick=()=>{ st.showAll=!st.showAll; render(); }; body.append(b); }
  return ks.length;
}

function mix(t){ // blend heat-0 → heat-1 via color-mix
  return `color-mix(in oklab, var(--heat-1) ${Math.round(t*100)}%, var(--heat-0))`;
}
function renderHeat(rowsV, vid, xid){
  const body=$('distBody'); body.textContent='';
  const iv=VI[vid], ix=VI[xid], v=VARS[iv], x=VARS[ix];
  const cv=keepPlaces(counts(rowsV,vid), vid, spatialCons(vid)), cx=keepPlaces(counts(rowsV,xid), xid, spatialCons(xid));
  const bothSp = SP.includes(vid) && SP.includes(xid);
  const rk=order(vid,cv), ck=order(xid,cx);
  const RL= st.showAll? rk : rk.slice(0,20), CL=ck.slice(0,12);
  const tools=$('distTools'); tools.textContent='';
  const seg=el('div','seg'); [['n','Conteo'],['row','% de la fila'],['col','% de la columna'],['res','Asociación']].forEach(([m,l])=>{ const b=el('button',null,l); b.setAttribute('aria-pressed', st.mode===m); b.onclick=()=>{st.mode=m; render();}; seg.append(b); });
  tools.append(seg);
  if(!rk.length||!ck.length){ body.append(el('div','empty','Sin combinaciones dentro del recorte.')); return; }
  const M=new Map(); rowsV.forEach(r=>{ r.v[iv].forEach(a=>{ r.v[ix].forEach(b=>{ if(bothSp && !placeOK(vid,a,[[xid,new Set([b])]])) return; const kk=a+'|'+b; M.set(kk,(M.get(kk)||0)+1); }); }); });
  // associação: resíduos ajustados de Haberman sobre a tabela completa de pares (todas as categorias)
  const RT=new Map(), CT=new Map(); let T=0; M.forEach((n,kk)=>{ const [a,b]=kk.split('|').map(Number); RT.set(a,(RT.get(a)||0)+n); CT.set(b,(CT.get(b)||0)+n); T+=n; });
  const resid=(a,b)=>{ const O=M.get(a+'|'+b)||0, R=RT.get(a)||0, Cc=CT.get(b)||0; if(!T||!R||!Cc) return 0; const E=R*Cc/T; const den=Math.sqrt(E*(1-R/T)*(1-Cc/T)); return den>0? (O-E)/den : 0; };
  const val=(a,b)=>{ const n=M.get(a+'|'+b)||0; if(st.mode==='row') return [n, n/cv.get(a)]; if(st.mode==='col') return [n, n/cx.get(b)]; if(st.mode==='res') return [n, resid(a,b)]; return [n,n]; };
  let mx=0; RL.forEach(a=>CL.forEach(b=>{ const [,q]=val(a,b); if(Math.abs(q)>mx) mx=Math.abs(q); }));
  if(st.mode==='res') mx=Math.max(mx, 4);
  const sc=el('div','scroll'); const t=el('table','heat'); const th=el('thead'); const hr=el('tr');
  hr.append(el('th',null, v.label+' ↓ · '+x.label+' →'));
  CL.forEach(b=>{ const h=el('th',null,x.values[b]); h.title=x.values[b]; hr.append(h); });
  hr.append(el('th',null,'Total')); th.append(hr); t.append(th);
  const tb=el('tbody');
  RL.forEach(a=>{ const tr=el('tr'); tr.append(el('th',null,v.values[a]));
    CL.forEach(b=>{ const [n,q]=val(a,b); const res=st.mode==='res'; const td=el('td','c'+(n||res?'':' z'));
      td.textContent = res? (q>=0? '+' : '−')+Math.abs(q).toLocaleString('es-AR',{minimumFractionDigits:1,maximumFractionDigits:1}) : n? (st.mode==='n'? fmt(n) : pct(q,1)) : '·';
      if(res){ const tt=Math.min(1, Math.abs(q)/mx); td.style.background = Math.abs(q)<1.96? 'transparent' : q>0? `color-mix(in oklab, #2569ad ${Math.round(18+tt*72)}%, #ffffff)` : `color-mix(in oklab, #d9822b ${Math.round(18+tt*72)}%, #ffffff)`;
        td.style.color = Math.abs(q)>=1.96 && tt>0.5? '#ffffff' : Math.abs(q)<1.96? 'var(--ink-3)' : 'var(--ink)';
        td.title=`${v.values[a]} × ${x.values[b]}: ${fmt(n)} noticias; residuo ajustado ${q.toLocaleString('es-AR',{maximumFractionDigits:2})} (${Math.abs(q)<1.96? 'dentro de lo esperado' : q>0? 'más de lo esperado' : 'menos de lo esperado'})`; }
      if(n){ if(!res){ const tt=mx? q/mx : 0; td.style.background=mix(tt); td.style.color = tt>0.55? 'var(--panel)' : 'var(--ink)';
        td.title=`${v.values[a]} × ${x.values[b]}: ${fmt(n)} noticias`; } td.tabIndex=0;
        const go=()=>{ (st.f[vid]=new Set([a])); (st.f[xid]=new Set([b])); st.page=40; render(); $('newsSec').scrollIntoView({behavior:'smooth',block:'start'}); };
        td.onclick=go; td.onkeydown=e=>{ if(e.key==='Enter'){ go(); } }; }
      tr.append(td); });
    tr.append(el('td','tot',fmt(cv.get(a)))); tb.append(tr); });
  t.append(tb); sc.append(t); body.append(sc);
  if(st.mode==='res'){ // qui-quadrado e V de Cramér sobre a tabela completa
    let chi=0; const ra=[...RT.keys()], cb=[...CT.keys()];
    ra.forEach(a=>cb.forEach(b=>{ const E=RT.get(a)*CT.get(b)/T; if(E>0){ const O=M.get(a+'|'+b)||0; chi+=(O-E)**2/E; } }));
    const df=(ra.length-1)*(cb.length-1), V=T? Math.sqrt(chi/(T*Math.max(1,Math.min(ra.length,cb.length)-1))) : 0;
    const forca = V<0.1? 'muy débil' : V<0.2? 'débil' : V<0.3? 'moderada' : 'fuerte';
    const f2 = n => n.toLocaleString('es-AR',{maximumFractionDigits:2});
    const p=el('p','note assoc');
    p.innerHTML = `<b>Lectura:</b> cada celda muestra el residuo ajustado: cuánto aparece la combinación por encima (azul) o por debajo (naranja) de lo que se esperaría si las dos variables fueran independientes. Los valores más allá de ±1,96 son significativos al 5%; las celdas blancas están dentro de lo esperado. <b>Tabla completa:</b> χ² = ${f2(chi)}, ${fmt(df)} grados de libertad, V de Cramér = ${f2(V)} (asociación ${forca}), sobre ${fmt(T)} pares noticia × categoría. Como una noticia puede tener varios valores, los pares no son independientes: lea la prueba como indicativa.`;
    const lg=el('div','legend'); [['#2569ad','Más de lo esperado'],['#d9822b','Menos de lo esperado'],['#ffffff','Dentro de lo esperado (|r| < 1,96)']].forEach(([c,l])=>{ const s=el('span'); const i=el('i','sw'); i.style.background=c; s.append(i, document.createTextNode(l)); lg.append(s); });
    body.append(lg, p);
  }
  const extra=[]; if(rk.length>RL.length) extra.push(`${rk.length-RL.length} filas`); if(ck.length>CL.length) extra.push(`${ck.length-CL.length} columnas`);
  if(rk.length>20){ const b=el('button','btn more', st.showAll? 'Mostrar solo las 20 filas mayores' : `Mostrar todas las ${fmt(rk.length)} filas`); b.onclick=()=>{ st.showAll=!st.showAll; render(); }; body.append(b); }
  return extra;
}
