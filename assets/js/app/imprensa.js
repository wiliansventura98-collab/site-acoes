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
  const st1=d3.select(boxT).append('svg').attr('viewBox',`0 0 ${Wt} ${Ht}`).attr('width','100%').attr('role','img').attr('aria-label','Veículos com mais notícias');
  const tip1=tipFor(boxT);
  const g1=st1.selectAll('g').data(top).join('g').attr('transform',(k,i)=>`translate(0,${i*rh+4})`).style('cursor','pointer').on('click',(e,k)=>toggleFilter('fuente',k))
    .on('mousemove',(e,k)=>tip1.show(e, v.values[k], [`${fmt(c.get(k))} notícias · ${pct(c.get(k), comFonte)} das notícias com fonte`])).on('mouseleave',()=>tip1.hide());
  g1.append('text').attr('x',lab).attr('y',13).attr('text-anchor','end').style('font-size','12.5px').style('fill','var(--ink)').text(k=>{ const s=v.values[k]; return s.length>30? s.slice(0,29)+'…' : s; });
  g1.append('rect').attr('x',lab+8).attr('y',3).attr('height',rh-8).attr('rx',3).attr('width',k=>Math.max(2, xt(c.get(k))-lab-8)).attr('fill','var(--bar)');
  g1.append('text').attr('x',k=>xt(c.get(k))+5).attr('y',14).style('font-size','12px').style('fill','var(--ink-2)').text(k=>fmt(c.get(k)));
  // 2. concentração: curva de Lorenz
  const asc=ks.map(k=>c.get(k)).sort(d3.ascending), n=asc.length; let acc=0; const pts=[[0,0]]; asc.forEach((x,i)=>{ acc+=x; pts.push([(i+1)/n, acc/totC]); });
  const gini = 1 - 2*d3.sum(pts.slice(1).map((p,i)=>(p[0]-pts[i][0])*(p[1]+pts[i][1])/2));
  const top10=d3.sum(ks.slice(0,10),k=>c.get(k))/totC, unicos=ks.filter(k=>c.get(k)===1).length;
  const boxC=$('impConc'), Wc=Math.max(280, boxC.clientWidth), Hc=Math.min(300, Wc*0.8), m={t:10,r:14,b:34,l:44};
  const xc=d3.scaleLinear().domain([0,1]).range([m.l, Wc-m.r]), yc=d3.scaleLinear().domain([0,1]).range([Hc-m.b, m.t]);
  const sc=d3.select(boxC).append('svg').attr('viewBox',`0 0 ${Wc} ${Hc}`).attr('width','100%').attr('role','img').attr('aria-label','Curva de Lorenz da cobertura');
  sc.append('g').attr('class','axis').attr('transform',`translate(0,${Hc-m.b})`).call(d3.axisBottom(xc).ticks(5).tickFormat(d=>Math.round(d*100)+'%'));
  sc.append('g').attr('class','axis').attr('transform',`translate(${m.l},0)`).call(d3.axisLeft(yc).ticks(5).tickFormat(d=>Math.round(d*100)+'%'));
  sc.append('line').attr('x1',xc(0)).attr('y1',yc(0)).attr('x2',xc(1)).attr('y2',yc(1)).attr('stroke','var(--line-2)').attr('stroke-dasharray','4 4');
  sc.append('path').datum(pts).attr('d',d3.area().x(p=>xc(p[0])).y0(p=>yc(p[0])).y1(p=>yc(p[1]))).attr('fill','#f2a900').attr('fill-opacity',.18);
  sc.append('path').datum(pts).attr('d',d3.line().x(p=>xc(p[0])).y(p=>yc(p[1]))).attr('fill','none').attr('stroke','#13294b').attr('stroke-width',2);
  sc.append('text').attr('class','ax-title').attr('x',Wc-m.r).attr('y',Hc-4).attr('text-anchor','end').text('% acumulado dos veículos (do menor ao maior)');
  sc.append('text').attr('class','ax-title').attr('x',m.l+6).attr('y',m.t+10).text('% acumulado das notícias');
  const pc=el('p','note'); const f2=x=>x.toLocaleString('pt-BR',{maximumFractionDigits:2});
  pc.textContent=`${fmt(n)} veículos e fontes diferentes. Os 10 maiores reúnem ${pct(top10,1)} das menções; ${fmt(unicos)} aparecem uma única vez. Índice de Gini da cobertura: ${f2(gini)} (0 = notícias igualmente distribuídas entre veículos; 1 = todas num só).`;
  boxC.append(pc);
  // 3. veículos × regiões (resíduos ajustados)
  const ir=VI.region, rv=VARS[ir], regs=order('region', counts(rows,'region')).filter(k=>!ehSemInfo(rv.values[k]));
  const vt=ks.slice(0,12); const M=new Map(); const R=new Map(), Cc=new Map(); let T=0;
  rows.forEach(r=>{ r.v[iv].forEach(a=>{ if(ehSemInfo(v.values[a])) return; r.v[ir].forEach(g=>{ if(!regs.includes(g)) return; const kk=a+'|'+g; M.set(kk,(M.get(kk)||0)+1); R.set(a,(R.get(a)||0)+1); Cc.set(g,(Cc.get(g)||0)+1); T++; }); }); });
  const t=el('table','heat'), th=el('thead'), hr=el('tr'); hr.append(el('th',null,'Veículo ↓ · Região →')); regs.forEach(g=>hr.append(el('th',null,rv.values[g]))); hr.append(el('th',null,'Total')); th.append(hr); t.append(th);
  const tb=el('tbody');
  vt.forEach(a=>{ const tr=el('tr'); tr.append(el('th',null,v.values[a]));
    regs.forEach(g=>{ const O=M.get(a+'|'+g)||0, Ra=R.get(a)||0, Cg=Cc.get(g)||0; const E=T? Ra*Cg/T : 0; const den=Math.sqrt(E*(1-Ra/T)*(1-Cg/T)); const z=den>0? (O-E)/den : 0;
      const td=el('td','c'); td.textContent= O? `${fmt(O)}` : '·'; td.title=`${v.values[a]} × ${rv.values[g]}: ${fmt(O)} notícias (esperado ${E.toLocaleString('pt-BR',{maximumFractionDigits:1})}; resíduo ${z.toLocaleString('pt-BR',{maximumFractionDigits:1})})`;
      if(Math.abs(z)>=1.96){ const tt=Math.min(1,Math.abs(z)/6); td.style.background = z>0? `color-mix(in oklab, #2569ad ${Math.round(18+tt*70)}%, #fff)` : `color-mix(in oklab, #d9822b ${Math.round(18+tt*70)}%, #fff)`; if(tt>0.5) td.style.color='#fff'; }
      tr.append(td); });
    tr.append(el('td','tot',fmt(R.get(a)||0))); tb.append(tr); });
  t.append(tb); $('impReg').append(t);
  // 4. diversidade por província
  const ip=VI.provincia, pv=VARS[ip], pop=(window.__GEO__||{}).pop||{};
  const porProv=new Map(); rows.forEach(r=>{ r.v[ip].forEach(p=>{ if(pop[pv.values[p]]==null) return; const o=porProv.get(p)||{n:0, f:new Map()}; o.n++; r.v[iv].forEach(a=>{ if(!ehSemInfo(v.values[a])) o.f.set(a,(o.f.get(a)||0)+1); }); porProv.set(p,o); }); });
  const lin=[...porProv].map(([p,o])=>{ const fs=[...o.f].sort((a,q)=>q[1]-a[1]); const tot=d3.sum(fs,x=>x[1]); return { p, nome:pv.values[p], n:o.n, fontes:fs.length, principal:fs[0]? v.values[fs[0][0]] : '—', parte:fs[0]&&tot? fs[0][1]/tot : 0, hhi: tot? d3.sum(fs,x=>(x[1]/tot)**2) : 0 }; }).sort((a,q)=>q.n-a.n);
  const t2=el('table','ctx-table'), th2=el('thead'), h2=el('tr'); ['Província','Notícias','Fontes diferentes','Fonte principal','Parte da principal','Concentração (HHI)'].forEach(x=>h2.append(el('th',null,x))); th2.append(h2); t2.append(th2);
  const b2=el('tbody'); const mxn=d3.max(lin,d=>d.n)||1;
  lin.forEach(d=>{ const r=el('tr'); r.append(el('td','nm',d.nome)); const c1=el('td','bar'); barCell(c1,d.n,mxn,fmt(d.n),'#e0a106'); r.append(c1);
    r.append(el('td','num',fmt(d.fontes))); r.append(el('td','mut',d.principal)); const c2=el('td','bar'); barCell(c2,d.parte,1,pct(d.parte,1),'#13294b'); r.append(c2);
    r.append(el('td','num',d.hhi.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}))); r.style.cursor='pointer'; r.onclick=()=>toggleFilter('provincia',d.p); b2.append(r); });
  t2.append(b2); $('impProv').append(t2);
  $('impMeta').textContent=`${fmt(comFonte)} notícias com fonte identificada`;
  $('impNote').textContent=`A base registra o que a imprensa e outras fontes publicaram, e não todas as ações que aconteceram. Esta aba ajuda a avaliar esse filtro: quais veículos dominam, quão concentrada é a cobertura e se certos veículos noticiam mais certas regiões. ${fmt(semFonte)} notícias do recorte não informam a fonte. Na tabela de regiões, as células coloridas indicam combinações acima (azul) ou abaixo (laranja) do esperado, com resíduo ajustado além de ±1,96; o número é a contagem. HHI: índice de Herfindahl-Hirschman das fontes de cada província (perto de 1 = quase tudo de uma fonte). Clique num veículo ou numa província para filtrar.`;
}
EXTRA.imp = renderImprensa;
