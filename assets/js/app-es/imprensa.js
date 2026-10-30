/* GERADO por i18n/ferramenta.js a partir de assets/js/app/imprensa.js; não edite: edite o original e i18n/es.json */
var IDIOMA='es';
/*
 * Imprensa
 * Quem noticia as ações: veículos mais frequentes, concentração da cobertura (curva de Lorenz, Gini,
 * parcela dos 10 maiores), veículos × regiões em resíduos ajustados e diversidade de fontes por província.
 * Serve para discutir o viés de cobertura da base.
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

function renderImprensa(b){
  ['impTop','impConc','impReg','impProv'].forEach(id=>{ $(id).textContent=''; });
  if(!HAS_D3) return;
  const rows=b.filter(r=>match(r,'fuente')), iv=VI.fuente, v=VARS[iv];
  const c=counts(rows,'fuente'); const ks=[...c.keys()].filter(k=>!ehSemInfo(v.values[k])).sort((a,q)=>c.get(q)-c.get(a));
  const comFonte=rows.filter(r=>r.v[iv].some(k=>!ehSemInfo(v.values[k]))).length, semFonte=rows.length-comFonte;
  const totC=d3.sum(ks,k=>c.get(k));
  // 1. veículos mais frequentes (barras)
  const top=ks.slice(0,15), boxT=$('impTop'), Wt=Math.max(300, boxT.clientWidth), lab=Math.min(190, Wt*0.42), rh=22, Ht=top.length*rh+10;
  const xt=d3.scaleLinear().domain([0, c.get(top[0])||1]).range([lab+8, Wt-40]);
  const st1=d3.select(boxT).append('svg').attr('viewBox',`0 0 ${Wt} ${Ht}`).attr('width','100%').attr('role','img').attr('aria-label','Medios con más noticias');
  const tip1=tipFor(boxT);
  const g1=st1.selectAll('g').data(top).join('g').attr('transform',(k,i)=>`translate(0,${i*rh+4})`).style('cursor','pointer').on('click',(e,k)=>toggleFilter('fuente',k))
    .on('mousemove',(e,k)=>tip1.show(e, v.values[k], [`${fmt(c.get(k))} noticias · ${pct(c.get(k), comFonte)} de las noticias con fuente`])).on('mouseleave',()=>tip1.hide());
  g1.append('text').attr('x',lab).attr('y',13).attr('text-anchor','end').style('font-size','12.5px').style('fill','var(--ink)').text(k=>{ const s=v.values[k]; return s.length>30? s.slice(0,29)+'…' : s; });
  g1.append('rect').attr('x',lab+8).attr('y',3).attr('height',rh-8).attr('rx',3).attr('width',k=>Math.max(2, xt(c.get(k))-lab-8)).attr('fill','var(--bar)');
  g1.append('text').attr('x',k=>xt(c.get(k))+5).attr('y',14).style('font-size','12px').style('fill','var(--ink-2)').text(k=>fmt(c.get(k)));
  // 2. concentração: curva de Lorenz
  const asc=ks.map(k=>c.get(k)).sort(d3.ascending), n=asc.length; let acc=0; const pts=[[0,0]]; asc.forEach((x,i)=>{ acc+=x; pts.push([(i+1)/n, acc/totC]); });
  const gini = 1 - 2*d3.sum(pts.slice(1).map((p,i)=>(p[0]-pts[i][0])*(p[1]+pts[i][1])/2));
  const top10=d3.sum(ks.slice(0,10),k=>c.get(k))/totC, unicos=ks.filter(k=>c.get(k)===1).length;
  const boxC=$('impConc'), Wc=Math.max(280, boxC.clientWidth), Hc=Math.min(300, Wc*0.8), m={t:10,r:14,b:34,l:44};
  const xc=d3.scaleLinear().domain([0,1]).range([m.l, Wc-m.r]), yc=d3.scaleLinear().domain([0,1]).range([Hc-m.b, m.t]);
  const sc=d3.select(boxC).append('svg').attr('viewBox',`0 0 ${Wc} ${Hc}`).attr('width','100%').attr('role','img').attr('aria-label','Curva de Lorenz de la cobertura');
  sc.append('g').attr('class','axis').attr('transform',`translate(0,${Hc-m.b})`).call(d3.axisBottom(xc).ticks(5).tickFormat(d=>Math.round(d*100)+'%'));
  sc.append('g').attr('class','axis').attr('transform',`translate(${m.l},0)`).call(d3.axisLeft(yc).ticks(5).tickFormat(d=>Math.round(d*100)+'%'));
  sc.append('line').attr('x1',xc(0)).attr('y1',yc(0)).attr('x2',xc(1)).attr('y2',yc(1)).attr('stroke','var(--line-2)').attr('stroke-dasharray','4 4');
  sc.append('path').datum(pts).attr('d',d3.area().x(p=>xc(p[0])).y0(p=>yc(p[0])).y1(p=>yc(p[1]))).attr('fill','#f2a900').attr('fill-opacity',.18);
  sc.append('path').datum(pts).attr('d',d3.line().x(p=>xc(p[0])).y(p=>yc(p[1]))).attr('fill','none').attr('stroke','#13294b').attr('stroke-width',2);
  sc.append('text').attr('class','ax-title').attr('x',Wc-m.r).attr('y',Hc-4).attr('text-anchor','end').text('% acumulado de los medios (del menor al mayor)');
  sc.append('text').attr('class','ax-title').attr('x',m.l+6).attr('y',m.t+10).text('% acumulado de las noticias');
  const pc=el('p','note'); const f2=x=>x.toLocaleString('es-AR',{maximumFractionDigits:2});
  pc.textContent=`${fmt(n)} medios y fuentes distintos. Los 10 mayores reúnen ${pct(top10,1)} de las menciones; ${fmt(unicos)} aparecen una sola vez. Índice de Gini de la cobertura: ${f2(gini)} (0 = noticias distribuidas por igual entre medios; 1 = todas en uno solo).`;
  boxC.append(pc);
  // 3. veículos × regiões (resíduos ajustados)
  const ir=VI.region, rv=VARS[ir], regs=order('region', counts(rows,'region')).filter(k=>!ehSemInfo(rv.values[k]));
  const vt=ks.slice(0,12); const M=new Map(); const R=new Map(), Cc=new Map(); let T=0;
  rows.forEach(r=>{ r.v[iv].forEach(a=>{ if(ehSemInfo(v.values[a])) return; r.v[ir].forEach(g=>{ if(!regs.includes(g)) return; const kk=a+'|'+g; M.set(kk,(M.get(kk)||0)+1); R.set(a,(R.get(a)||0)+1); Cc.set(g,(Cc.get(g)||0)+1); T++; }); }); });
  const t=el('table','heat'), th=el('thead'), hr=el('tr'); hr.append(el('th',null,'Medio ↓ · Región →')); regs.forEach(g=>hr.append(el('th',null,rv.values[g]))); hr.append(el('th',null,'Total')); th.append(hr); t.append(th);
  const tb=el('tbody');
  vt.forEach(a=>{ const tr=el('tr'); tr.append(el('th',null,v.values[a]));
    regs.forEach(g=>{ const O=M.get(a+'|'+g)||0, Ra=R.get(a)||0, Cg=Cc.get(g)||0; const E=T? Ra*Cg/T : 0; const den=Math.sqrt(E*(1-Ra/T)*(1-Cg/T)); const z=den>0? (O-E)/den : 0;
      const td=el('td','c'); td.textContent= O? `${fmt(O)}` : '·'; td.title=`${v.values[a]} × ${rv.values[g]}: ${fmt(O)} noticias (esperado ${E.toLocaleString('es-AR',{maximumFractionDigits:1})}; residuo ${z.toLocaleString('es-AR',{maximumFractionDigits:1})})`;
      if(Math.abs(z)>=1.96){ const tt=Math.min(1,Math.abs(z)/6); td.style.background = z>0? `color-mix(in oklab, #2569ad ${Math.round(18+tt*70)}%, #fff)` : `color-mix(in oklab, #d9822b ${Math.round(18+tt*70)}%, #fff)`; if(tt>0.5) td.style.color='#fff'; }
      tr.append(td); });
    tr.append(el('td','tot',fmt(R.get(a)||0))); tb.append(tr); });
  t.append(tb); $('impReg').append(t);
  // 4. diversidade por província
  const ip=VI.provincia, pv=VARS[ip], pop=(window.__GEO__||{}).pop||{};
  const porProv=new Map(); rows.forEach(r=>{ r.v[ip].forEach(p=>{ if(pop[pv.values[p]]==null) return; const o=porProv.get(p)||{n:0, f:new Map()}; o.n++; r.v[iv].forEach(a=>{ if(!ehSemInfo(v.values[a])) o.f.set(a,(o.f.get(a)||0)+1); }); porProv.set(p,o); }); });
  const lin=[...porProv].map(([p,o])=>{ const fs=[...o.f].sort((a,q)=>q[1]-a[1]); const tot=d3.sum(fs,x=>x[1]); return { p, nome:pv.values[p], n:o.n, fontes:fs.length, principal:fs[0]? v.values[fs[0][0]] : '—', parte:fs[0]&&tot? fs[0][1]/tot : 0, hhi: tot? d3.sum(fs,x=>(x[1]/tot)**2) : 0 }; }).sort((a,q)=>q.n-a.n);
  const t2=el('table','ctx-table'), th2=el('thead'), h2=el('tr'); ['Provincia','Noticias','Fuentes distintas','Fuente principal','Peso de la principal','Concentración (HHI)'].forEach(x=>h2.append(el('th',null,x))); th2.append(h2); t2.append(th2);
  const b2=el('tbody'); const mxn=d3.max(lin,d=>d.n)||1;
  lin.forEach(d=>{ const r=el('tr'); r.append(el('td','nm',d.nome)); const c1=el('td','bar'); barCell(c1,d.n,mxn,fmt(d.n),'#e0a106'); r.append(c1);
    r.append(el('td','num',fmt(d.fontes))); r.append(el('td','mut',d.principal)); const c2=el('td','bar'); barCell(c2,d.parte,1,pct(d.parte,1),'#13294b'); r.append(c2);
    r.append(el('td','num',d.hhi.toLocaleString('es-AR',{minimumFractionDigits:2,maximumFractionDigits:2}))); r.style.cursor='pointer'; r.onclick=()=>toggleFilter('provincia',d.p); b2.append(r); });
  t2.append(b2); $('impProv').append(t2);
  $('impMeta').textContent=`${fmt(comFonte)} noticias con fuente identificada`;
  $('impNote').textContent=`La base registra lo que publicaron la prensa y otras fuentes, y no todas las acciones que ocurrieron. Esta pestaña ayuda a evaluar ese filtro: qué medios dominan, cuán concentrada está la cobertura y si ciertos medios informan más sobre ciertas regiones. ${fmt(semFonte)} noticias del recorte no informan la fuente. En la tabla de regiones, las celdas coloreadas indican combinaciones por encima (azul) o por debajo (naranja) de lo esperado, con residuo ajustado más allá de ±1,96; el número es el conteo. HHI: índice de Herfindahl-Hirschman de las fuentes de cada provincia (cerca de 1 = casi todo de una fuente). Haga clic en un medio o en una provincia para filtrar.`;
}
EXTRA.imp = renderImprensa;
