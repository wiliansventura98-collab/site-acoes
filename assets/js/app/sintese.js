/*
 * Síntese
 * Leitura em texto corrido do recorte atual, com produtos (indicadores, barras, mapa, série semanal, tabelas)
 * que reúnem os resultados das outras abas: quem se mobiliza, como e por quê, a quem se dirige, onde, quando,
 * com quem, a estrutura geral (ACM), o contexto e a imprensa. Os textos são gerados por regras simples,
 * descritas na nota metodológica ao final, e são refeitos a cada mudança de filtro.
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

const capS = s => (s && s.length>6 && /\s/.test(s) && s===s.toUpperCase())? s.charAt(0)+s.slice(1).toLowerCase() : (s||'');
const rotInd = s => { const t=s.replace(/, \d{4}$/,''); return /^[A-ZÁÉÍÓÚ][a-záéíóúâêôãõç]/.test(t)? t.charAt(0).toLowerCase()+t.slice(1) : t; };
const aspas = s => `“${capS(s)}”`;
const listaPt = a => a.length<=1? (a[0]||'') : a.slice(0,-1).join(', ')+' e '+a[a.length-1];
const nfmt2 = x => x.toLocaleString('pt-BR',{maximumFractionDigits:2, minimumFractionDigits:2}).replace('-','−');
const dBR = s => `${s.slice(6,8)}/${s.slice(4,6)}/${s.slice(0,4)}`;
const MESES_EXT = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

function sinTop(rows, vid, n){
  const v=VARS[VI[vid]], c=counts(rows,vid);
  return [...c].filter(([k])=>!ehSemInfo(v.values[k])).sort((a,b)=>b[1]-a[1]).slice(0,n||999).map(([k,m])=>({k, vid, nome:v.values[k], n:m}));
}
// resíduos ajustados de uma tabela de co-ocorrência entre duas variáveis (notícias com valor nas duas)
function sinResiduos(rows, va, vb){
  const ia=VI[va], ib=VI[vb]; const R=rows.filter(r=>r.v[ia].length && r.v[ib].length), N=R.length; if(N<20) return [];
  const ca=new Map(), cb=new Map(), o=new Map();
  R.forEach(r=>{ const A=[...new Set(r.v[ia])], B=[...new Set(r.v[ib])];
    A.forEach(a=>ca.set(a,(ca.get(a)||0)+1)); B.forEach(b=>cb.set(b,(cb.get(b)||0)+1)); A.forEach(a=>B.forEach(b=>{ const k=a+'|'+b; o.set(k,(o.get(k)||0)+1); })); });
  const out=[];
  ca.forEach((na,a)=>cb.forEach((nb,b)=>{
    if(na>=N || nb>=N || ehSemInfo(VARS[ia].values[a]) || ehSemInfo(VARS[ib].values[b])) return;
    const ob=o.get(a+'|'+b)||0, e=na*nb/N; if(ob<5) return;
    const r=(ob-e)/Math.sqrt(e*(1-na/N)*(1-nb/N));
    out.push({va, vb, a, b, A:VARS[ia].values[a], B:VARS[ib].values[b], na, nb, N, ob, e, r, razao:ob/e}); }));
  return out.sort((x,y)=>y.r-x.r);
}

/* ---------- peças de página ---------- */
function sinP(box, texto, cls){ // **negrito** e _itálico_ simples, sem HTML
  const p=el('p', cls||null);
  texto.split(/(\*\*[^*]+\*\*|_[^_]+_)/).forEach(t=>{ if(!t) return;
    if(t.startsWith('**')) p.append(el('b',null,t.slice(2,-2))); else if(t.startsWith('_') && t.endsWith('_') && t.length>2) p.append(el('i',null,t.slice(1,-1))); else p.append(document.createTextNode(t)); });
  box.append(p); return p;
}
function sinSecao(body, num, titulo, sub){
  const s=el('section','sin-sec'); const h=el('h3'); h.append(el('span','sin-num',String(num).padStart(2,'0')), document.createTextNode(titulo)); s.append(h);
  if(sub) s.append(el('p','sin-sub',sub));
  body.append(s); return s;
}
function sinIr(box, itens){
  const d=el('div','sin-ir'); d.append(el('span',null,'Aprofundar:'));
  itens.forEach(([txt, fn])=>{ const b=el('button','btn',txt); b.type='button'; b.onclick=()=>{ fn(); window.scrollTo({top:$('tab-sin').getBoundingClientRect().top+scrollY-12, behavior:'smooth'}); }; d.append(b); });
  box.append(d);
}
function sinBarras(box, titulo, itens, total, nota){
  const w=el('div','sin-bars'); w.append(el('h4',null,titulo)); if(!itens.length){ w.append(el('p','meta','Sem dados neste recorte.')); box.append(w); return w; }
  const mx=d3.max(itens,d=>d.n)||1;
  itens.forEach((d,i)=>{ const row=el('button','sin-bar'); row.type='button'; row.title=`${d.nome}: ${fmt(d.n)} notícias (${pct(d.n,total)}). Clique para filtrar o recorte.`;
    const tr=el('span','t'), f=el('i'); f.style.width=Math.max(1.5, d.n/mx*100)+'%'; if(i===0) f.className='um'; tr.append(f);
    row.append(el('span','l',capS(d.nome)), tr, el('span','n',`${fmt(d.n)} · ${pct(d.n,total)}`));
    row.onclick=()=>toggleFilter(d.vid, d.k); w.append(row); });
  if(nota) w.append(el('p','sin-nota',nota));
  box.append(w); return w;
}
function sinTabela(box, titulo, cab, linhas, nota, alinhar){
  const w=el('div','sin-tab'); if(titulo) w.append(el('h4',null,titulo));
  const t=el('table'), th=el('thead'), tr=el('tr'); cab.forEach((c,i)=>{ const x=el('th',null,c); if(alinhar && alinhar[i]==='r') x.className='r'; tr.append(x); }); th.append(tr); t.append(th);
  const tb=el('tbody'); linhas.forEach(l=>{ const r=el('tr'); l.forEach((c,i)=>{ const x=el('td'); if(c instanceof Node) x.append(c); else x.textContent=c; if(alinhar && alinhar[i]==='r') x.className='r'; r.append(x); }); tb.append(r); }); t.append(tb);
  const sc=el('div','sin-scroll'); sc.append(t); w.append(sc); if(nota) w.append(el('p','sin-nota',nota)); box.append(w); return w;
}
const sinGrade = box => { const g=el('div','sin-grid'); box.append(g); return g; };
const forcaRho = r => { const a=Math.abs(r); return a<0.1? 'nula' : a<0.3? 'fraca' : a<0.6? 'moderada' : 'forte'; };

/* ---------- mapa e série semanal ---------- */
function sinMapa(box, rows){
  const sheet=el('div','sin-mapa'); box.append(sheet);
  const W=Math.min(520, Math.max(300, sheet.clientWidth||box.clientWidth||400));
  const cl=counts(rows,'localidad'); const N=rows.length;
  const md={unit:'loc', vid:'localidad', c:cl, rate:()=>0, N, mapped: rows.filter(r=>r.v[VI.localidad].some(k=>LOC_XY[k])).length, max:d3.max([...cl].filter(([k])=>LOC_XY[k]), d=>d[1])||1, XY:LOC_XY, spatial:false};
  const mw=W-40, mh=Math.round(mw*1.45), frame=[30, 6, 30+mw, 6+mh];
  const svg=d3.select(sheet).append('svg').attr('viewBox',`0 0 ${W} ${mh+12}`).attr('width','100%').attr('font-family',FONT).attr('role','img').attr('aria-label','Mapa das notícias por localidade');
  const proj=PROJ().fitExtent([[frame[0]+mw*0.06, frame[1]+mh*0.015],[frame[2]-mw*0.06, frame[3]-mh*0.015]], ALL);
  const sh={max:md.max}; sh.r=d3.scaleSqrt().domain([0,sh.max]).range([0, Math.min(26, mw*0.075)]);
  const tip=tipFor(sheet);
  drawBase(svg.append('g'), proj, frame, md, sh, {circles:true, fill:false, ctx:null, tip, onClick:(vid,i)=>toggleFilter(vid, i), sel:new Set(), labels: [], gstep:5, topo:true, topoK:1, topoModo:'pais'});
  northArrow(svg, frame[2]-22, frame[1]+mh*0.70, 14);
  scaleBar(svg, proj, frame[0]+mw/2, frame[1]+mh/2, frame[0]+mw*0.48, frame[3]-18, mw*0.26, true);
  // legenda simples dos círculos
  const lg=svg.append('g').attr('transform',`translate(${frame[0]+mw*0.62},${frame[1]+mh*0.80})`);
  const vs=[sh.max, Math.max(1,Math.round(sh.max/4))].filter((v,i,a)=>a.indexOf(v)===i);
  lg.append('rect').attr('x',-8).attr('y',-14).attr('width',mw*0.36).attr('height',sh.r(sh.max)*2+34).attr('fill','#fff').attr('fill-opacity',.85).attr('rx',4);
  lg.append('text').attr('x',0).attr('y',0).attr('font-size',10).attr('font-weight',700).attr('fill',C.ink).text('Notícias por localidade');
  const R0=sh.r(sh.max); vs.forEach(v=>{ const r=sh.r(v); lg.append('circle').attr('cx',R0+2).attr('cy',8+2*R0-r).attr('r',r).attr('fill','none').attr('stroke',C.ink2);
    lg.append('text').attr('x',2*R0+10).attr('y',8+2*R0-2*r+4).attr('font-size',10).attr('fill',C.ink2).text(fmt(v)); });
  sheet.append(el('p','sin-nota',`Círculos com área proporcional ao número de notícias que citam cada localidade; ${fmt(N-md.mapped)} notícias do recorte não têm localidade mapeável (nacionais, virtuais ou sem referência). Clique num círculo para filtrar.`));
}
function sinSemanas(box, rows){
  const ds=rows.map(r=>({r, d:dataDe(r)})).filter(x=>x.d);
  const semanas=d3.timeMondays(d3.timeMonday.floor(new Date(2024,0,1)), new Date(2025,0,1)), idx=new Map(semanas.map((d,i)=>[+d,i]));
  const n=semanas.map(()=>0); ds.forEach(x=>{ const i=idx.get(+d3.timeMonday.floor(x.d)); if(i!=null) n[i]++; });
  const ord=[...n].sort(d3.ascending), q1=d3.quantileSorted(ord,.25), q3=d3.quantileSorted(ord,.75), corte=q3+1.5*(q3-q1);
  const picos=semanas.map((d,i)=>({d, n:n[i]})).filter(p=>p.n>corte && p.n>=3);
  picos.forEach(p=>{ const fim=d3.timeDay.offset(p.d,7); p.ev=EVENTOS.filter(e=>e.d>=d3.timeDay.offset(p.d,-2) && e.d<fim); });
  const w=el('div','sin-chart'); box.append(w);
  const W=Math.max(320, w.clientWidth||box.clientWidth||700), H=200, m={t:30,r:10,b:24,l:30};
  const x=d3.scaleBand().domain(semanas.map(d=>+d)).range([m.l, W-m.r]).padding(0.18);
  const y=d3.scaleLinear().domain([0, d3.max(n)||1]).nice().range([H-m.b, m.t]);
  const svg=d3.select(w).append('svg').attr('viewBox',`0 0 ${W} ${H}`).attr('width','100%').attr('role','img').attr('aria-label','Notícias por semana em 2024, com semanas de pico');
  svg.append('g').attr('class','grid').selectAll('line').data(y.ticks(4)).join('line').attr('x1',m.l).attr('x2',W-m.r).attr('y1',d=>y(d)).attr('y2',d=>y(d));
  svg.append('g').attr('class','axis').attr('transform',`translate(${m.l},0)`).call(d3.axisLeft(y).ticks(4).tickSize(0).tickPadding(5).tickFormat(d=>fmt(d))).call(g=>g.select('.domain').remove());
  const xm=d3.scaleTime().domain([new Date(2024,0,1), new Date(2024,11,31)]).range([m.l, W-m.r]);
  svg.append('g').attr('class','axis').attr('transform',`translate(0,${H-m.b})`).call(d3.axisBottom(xm).ticks(d3.timeMonth.every(1)).tickSize(0).tickPadding(6).tickFormat(d=>MES_ABBR[d.getMonth()]));
  const ehPico=new Set(picos.map(p=>+p.d)), tip=tipFor(w);
  svg.append('g').selectAll('rect').data(semanas.map((d,i)=>({d,n:n[i]}))).join('rect').attr('x',d=>x(+d.d)).attr('width',x.bandwidth()).attr('y',d=>y(d.n)).attr('height',d=>y(0)-y(d.n))
    .attr('fill',d=>ehPico.has(+d.d)? COR_ALTO : '#9fb3c8').attr('rx',1)
    .on('mousemove',(e,d)=>tip.show(e, `Semana de ${d.d.toLocaleDateString('pt-BR')}`, [`${fmt(d.n)} notícias`+(ehPico.has(+d.d)? ' · semana de pico':'')])).on('mouseleave',()=>tip.hide());
  // marcas dos acontecimentos
  const ge=svg.append('g'); EVENTOS.forEach((e,i)=>{ const xx=xm(e.d); ge.append('line').attr('x1',xx).attr('x2',xx).attr('y1',m.t-6).attr('y2',H-m.b).attr('stroke',COR_EV[e.tipo]||'#7c8aa0').attr('stroke-dasharray','2 3').attr('stroke-width',1);
    ge.append('circle').attr('cx',xx).attr('cy',m.t-12).attr('r',7).attr('fill',COR_EV[e.tipo]||'#7c8aa0');
    ge.append('text').attr('x',xx).attr('y',m.t-8.5).attr('text-anchor','middle').attr('font-size',9).attr('font-weight',800).attr('fill','#fff').text(e.i)
      .append('title').text(`${e.i}. ${e.nome} (${e.d.toLocaleDateString('pt-BR')})`); });
  w.append(el('p','sin-nota',`Colunas: notícias por semana (segunda a domingo), pela data de início da ação ou, na falta dela, de publicação. Em laranja, semanas de pico (acima de Q3 + 1,5 × intervalo interquartil = ${nfmt1(corte)} notícias). Círculos numerados: acontecimentos de 2024 (passe o mouse para ver o nome).`));
  return { picos, n, semanas, corte, comData:ds.length };
}

/* ---------- a síntese ---------- */
function renderSintese(b){
  const body=$('sinBody'); body.textContent=''; if(!HAS_D3) return;
  const rows=b.filter(r=>match(r,null)), N=rows.length, NB=b.length;
  const filtros=filtersText();
  $('sinMeta').textContent=`${fmt(N)} notícias`;
  if(N<10){ sinP(body, `O recorte atual tem apenas **${fmt(N)}** notícias, poucas para uma síntese. Remova algum filtro ou escolha uma das sínteses prontas.`); return; }
  const achados=[];
  // cabeçalho
  const cab=el('header','sin-cab'); body.append(cab);
  cab.append(el('p','sin-kicker', filtros? 'Síntese do recorte' : 'Síntese de toda a base'));
  cab.append(el('h3','sin-titulo', filtros? filtros : 'Ações coletivas registradas pela imprensa na Argentina, 2024'));
  const datas=rows.map(r=>r.sort).filter(s=>s && s!=='00000000').sort();
  const dist=vid=>sinTop(rows,vid).filter(d=>!/nacional|virtual/i.test(d.nome)).length;
  const nOrg=sinTop(rows,'nombremov').length, nProv=sinTop(rows,'provincia').filter(d=>POP[d.k]).length, nLoc=dist('localidad'), nFonte=sinTop(rows,'fuente').length;
  const kp=el('div','sin-kpis'); [[fmt(N),'notícias', filtros? `${pct(N,NB)} da base` : (st.rep? 'com repetidas':'sem repetidas')],[fmt(nOrg),'organizações nomeadas'],[fmt(nProv),'províncias'],[fmt(nLoc),'localidades'],[fmt(nFonte),'veículos de imprensa']]
    .forEach(([n,l,s])=>{ const d=el('div'); d.append(el('b',null,n), el('span',null,l)); if(s) d.append(el('small',null,s)); kp.append(d); });
  cab.append(kp);
  const resumo=el('div','sin-resumo'); cab.append(resumo); // preenchido no fim
  sinP(cab, `Este recorte reúne **${fmt(N)} notícias** de ações coletivas na Argentina em 2024${filtros? ` (${pct(N,NB)} das ${fmt(NB)} notícias da base)` : ''}`+(datas.length? `, com ações datadas de ${dBR(datas[0])} a ${dBR(datas[datas.length-1])}` : '')+`. Elas citam ${fmt(nOrg)} organizações em ${fmt(nProv)} províncias e ${fmt(nLoc)} localidades, e vêm de ${fmt(nFonte)} veículos de imprensa. A leitura abaixo percorre nove perguntas; cada uma termina com atalhos para a aba em que o resultado pode ser aprofundado.`, 'sin-lead');

  let sec=0;
  /* 1. Quem se mobiliza */
  { const s=sinSecao(body, ++sec, 'Quem se mobiliza', 'Tipos de movimento e organizações nomeadas nas notícias.');
    const tm=sinTop(rows,'tipomov'), org=sinTop(rows,'nombremov');
    const comTm=rows.filter(r=>r.v[VI.tipomov].some(k=>!ehSemInfo(VARS[VI.tipomov].values[k]))).length;
    if(tm.length===1) sinP(s, `Todas as notícias do recorte com tipo de movimento informado são de **${capS(tm[0].nome)}**.`);
    else if(tm.length){ const t3=tm.slice(0,3), anyT3=rows.filter(r=>r.v[VI.tipomov].some(k=>t3.some(d=>d.k===k))).length;
      sinP(s, `O tipo de movimento mais presente é **${capS(tm[0].nome)}**, em ${fmt(tm[0].n)} notícias (${pct(tm[0].n,N)} do recorte)`+(tm[1]? `, seguido de ${aspas(tm[1].nome)} (${pct(tm[1].n,N)})`:'')+(tm[2]? ` e ${aspas(tm[2].nome)} (${pct(tm[2].n,N)})`:'')+`. Esses ${t3.length} tipos aparecem em ${pct(anyT3,N)} das notícias, o que indica `+(anyT3/N>0.75? 'uma mobilização concentrada em poucos sujeitos.' : 'uma mobilização distribuída entre vários sujeitos.')+(comTm<N? ` Em ${fmt(N-comTm)} notícias o tipo de movimento não é informado.`:''));
      achados.push(`O tipo de movimento mais presente é **${capS(tm[0].nome)}** (${pct(tm[0].n,N)} das notícias).`); }
    if(org.length){ const comOrg=rows.filter(r=>r.v[VI.nombremov].some(k=>!ehSemInfo(VARS[VI.nombremov].values[k]))).length, t10=org.slice(0,10), any10=rows.filter(r=>r.v[VI.nombremov].some(k=>t10.some(d=>d.k===k))).length;
      sinP(s, `Entre as ${fmt(org.length)} organizações nomeadas, as mais citadas são ${listaPt(org.slice(0,4).map(d=>`**${d.nome}** (${fmt(d.n)})`))}. As dez mais citadas aparecem em ${pct(any10,comOrg)} das ${fmt(comOrg)} notícias que nomeiam alguma organização, e ${fmt(org.filter(d=>d.n===1).length)} organizações aparecem uma única vez: `+(any10/comOrg>0.6? 'poucas organizações de grande visibilidade dominam a cobertura.' : 'a cobertura se espalha por muitas organizações, com uma longa cauda de coletivos pouco citados.')); }
    const g=sinGrade(s); sinBarras(g, 'Tipo de movimento', tm.slice(0,8), N); sinBarras(g, 'Organizações mais citadas', org.slice(0,8), N);
    sinIr(s, [['Distribuição por tipo de movimento', ()=>{ st.v='tipomov'; st.x=''; setTab('dist'); }], ['Ficha da organização mais citada', ()=>{ if(org[0]) abrirFicha('nombremov', org[0].k); }], ['Tipologia tipo › organizações', ()=>{ Object.assign(TYPO,{a:'tipomov', b:'nombremov'}); setTab('typo'); }]]);
  }
  /* 2. Como e por quê */
  { const s=sinSecao(body, ++sec, 'Como e por quê', 'Repertório de ação (ação matriz e derivada), objetivos e direcionalidade.');
    const mz=sinTop(rows,'matriz'), dv=sinTop(rows,'derivada'), ob=sinTop(rows,'objetivos'), dr=sinTop(rows,'direccion');
    if(mz.length) sinP(s, `No repertório, predomina a ação matriz **${capS(mz[0].nome)}** (${pct(mz[0].n,N)})`+(mz[1]? `, seguida de ${aspas(mz[1].nome)} (${pct(mz[1].n,N)})`:'')+(mz[2]? ` e ${aspas(mz[2].nome)} (${pct(mz[2].n,N)})`:'')+'.'+(dv.length? ` Na forma concreta (ação derivada), as mais comuns são ${listaPt(dv.slice(0,3).map(d=>`${aspas(d.nome)} (${fmt(d.n)})`))}.`:''));
    if(ob.length) sinP(s, `Quanto aos objetivos, os mais frequentes são **${capS(ob[0].nome)}** (${pct(ob[0].n,N)})`+(ob[1]? ` e ${aspas(ob[1].nome)} (${pct(ob[1].n,N)})`:'')+'.'+(dr.length? ` Quanto à direcionalidade, predominam as ações **${capS(dr[0].nome).toLowerCase()}s** (${pct(dr[0].n,N)})`+(dr[1]? `, seguidas das ${capS(dr[1].nome).toLowerCase()}s (${pct(dr[1].n,N)})`:'')+(dr.find(d=>/defensiva/i.test(d.nome)) && dr[0].nome!=='Defensiva'? `; as ações defensivas somam ${pct(dr.find(d=>/defensiva/i.test(d.nome)).n,N)}`:'')+'.' : ''));
    if(mz.length && ob.length) achados.push(`O repertório mais comum é ${aspas(mz[0].nome)}, e o objetivo mais frequente, ${aspas(ob[0].nome)}.`);
    const g=sinGrade(s); sinBarras(g, 'Ação matriz', mz.slice(0,8), N); sinBarras(g, 'Objetivos', ob.slice(0,8), N);
    // combinações características
    const pares=[['tipomov','objetivos'],['tipomov','matriz'],['matriz','objetivos'],['region','tipomov'],['objetivos','tipoinst']];
    let todos=[]; pares.forEach(([a,c])=>{ todos=todos.concat(sinResiduos(rows,a,c)); });
    const unicos = arr => { const vistos=new Set(); return arr.filter(x=>{ const k=x.A+'|'+x.B; if(vistos.has(k)) return false; vistos.add(k); return true; }); };
    const top=unicos(todos.filter(x=>x.r>=3).sort((x,y)=>y.r-x.r)).slice(0,8);
    const raras=unicos(todos.filter(x=>x.r<=-3).sort((x,y)=>x.r-y.r)).slice(0,6);
    const VR={tipomov:'Tipo de movimento', objetivos:'Objetivos', matriz:'Ação matriz', region:'Região', tipoinst:'Instituição'};
    const oxe = x => { const w=el('span','sin-oxe'), mx=Math.max(x.ob,x.e)||1; const a=el('i','o'), b=el('i','e'); a.style.width=(x.ob/mx*100)+'%'; b.style.width=(x.e/mx*100)+'%'; a.title=`observado: ${fmt(x.ob)}`; b.title=`esperado: ${nfmt1(x.e)}`; w.append(a,b); return w; };
    if(top.length){
      sinP(s, `As **combinações características** mostram o que é típico de cada grupo, e não só o que é frequente. As associações mais fortes do recorte são ${listaPt(top.slice(0,3).map(x=>`${aspas(x.A)} com ${aspas(x.B)} (${fmt(x.ob)} notícias, ${nfmt1(x.razao)} vezes o esperado)`))}.`);
      achados.push(`A associação mais marcante é ${aspas(top[0].A)} com ${aspas(top[0].B)}: ${nfmt1(top[0].razao)} vezes o esperado.`);
      // explicação passo a passo, com um exemplo do próprio recorte
      const ex = top.find(x=>x.va==='tipomov' && x.vb==='objetivos' && x.razao<8) || top[0];
      const pa=ex.na/ex.N, pb=ex.nb/ex.N;
      const porOb=[...todos].sort((x,y)=>y.ob-x.ob), freq=(porOb.find(x=>Math.abs(x.r)<1.96 && x.ob>=porOb[0].ob*0.25)||porOb[0]);
      const box=el('div','sin-explica'); box.append(el('h4',null,'Como ler: o que é o resíduo ajustado'));
      const ol=el('ol'); box.append(ol); const passo=t=>{ const li=el('li'); sinP(li,t); ol.append(li); };
      passo(`**Contar.** Das ${fmt(ex.N)} notícias que informam ${VR[ex.va].toLowerCase()} e ${VR[ex.vb].toLowerCase()}, ${fmt(ex.na)} têm ${aspas(ex.A)} e ${fmt(ex.nb)} têm ${aspas(ex.B)}, ou seja, ${pct(ex.nb,ex.N)} do total.`);
      passo(`**Calcular o esperado.** Se as duas coisas não tivessem relação nenhuma, ${aspas(ex.B)} apareceria nas notícias de ${aspas(ex.A)} na mesma proporção do total: ${fmt(ex.na)} × ${pct(ex.nb,ex.N)} ≈ **${nfmt1(ex.e)} notícias**. Esse é o valor esperado “por acaso”.`);
      passo(`**Comparar.** Na base, as duas aparecem juntas em **${fmt(ex.ob)} notícias**, ${nfmt1(ex.razao)} vezes o esperado.`);
      passo(`**Padronizar.** O resíduo ajustado divide a diferença entre observado e esperado (${fmt(ex.ob)} − ${nfmt1(ex.e)}) pela variação que o acaso costuma produzir, levando em conta o tamanho dos grupos: resíduo = (observado − esperado) ÷ √(esperado × (1 − ${pct(ex.na,ex.N)}) × (1 − ${pct(ex.nb,ex.N)})) = **${nfmt1(ex.r)}**. Como fica na mesma escala para qualquer par de categorias, permite comparar combinações de grupos grandes e pequenos.`);
      passo(`**Ler o número na régua abaixo.** Perto de 0: a combinação acontece o quanto se esperaria. Positivo: acontece mais do que o esperado (atração). Negativo: menos do que o esperado (afastamento). Valores além de ±1,96 dificilmente são acaso (p < 0,05); aqui usamos ±3, mais exigente (p < 0,003).`);
      // régua
      const reg=el('div','sin-regua'); const fx=[['≤ −3','muito menos que o esperado','mm'],['−3 a −1,96','menos','m'],['−1,96 a +1,96','dentro do acaso','z'],['+1,96 a +3','mais','p'],['≥ +3','muito mais que o esperado','pp']];
      fx.forEach(([v,t,c])=>{ const d=el('div','f '+c); d.append(el('b',null,v), el('span',null,t)); reg.append(d); });
      const mk=el('div','marca'); mk.textContent=`exemplo: ${nfmt1(ex.r)} →`; reg.append(mk); box.append(reg);
      sinP(box, `**Por que não basta a porcentagem?** Grupos grandes aparecem em quase tudo. A combinação ${aspas(freq.A)} com ${aspas(freq.B)} é ${freq===porOb[0]? 'a mais _frequente_ do recorte' : 'muito _frequente_'} (${fmt(freq.ob)} notícias), mas o seu resíduo é ${nfmt1(freq.r).replace("-","−")}: ${Math.abs(freq.r)<1.96? 'ela acontece mais ou menos o quanto se esperaria pelo tamanho dos dois grupos, então é comum, mas não característica' : freq.r>0? 'ela é frequente e também acima do esperado' : 'apesar de frequente, acontece menos do que o tamanho dos grupos faria esperar'}. O resíduo desconta o tamanho dos grupos e responde a outra pergunta: _o que distingue este grupo dos demais?_`);
      sinP(box, `**Cuidados.** O resíduo mede associação nas notícias, não causa. Como uma notícia pode ter várias categorias, as contagens são de notícias que têm as duas categorias. Combinações com menos de 5 notícias não entram.`);
      s.append(box);
      sinTabela(s, 'Combinações características: muito mais do que o esperado (resíduo ≥ +3)', ['Categoria','Ocorre junto com','Notícias','Esperado','Observado × esperado','Vezes','Resíduo'],
        top.map(x=>[`${capS(x.A)} (${VR[x.va]})`, `${capS(x.B)} (${VR[x.vb]})`, fmt(x.ob), nfmt1(x.e), oxe(x), nfmt1(x.razao)+'×', nfmt1(x.r)]),
        'Barra escura: notícias observadas; barra clara: esperadas se não houvesse relação. Quanto maior o resíduo, mais improvável que a combinação seja fruto do acaso.', ['','','r','r','','r','r']);
    }
    if(raras.length){
      sinP(s, `Também é revelador o que **quase não acontece**. Combinações bem abaixo do esperado indicam afastamento entre grupos e pautas: ${listaPt(raras.slice(0,3).map(x=>`${aspas(x.A)} com ${aspas(x.B)} (${fmt(x.ob)} notícias, quando se esperariam ${nfmt1(x.e)})`))}.`);
      sinTabela(s, 'Combinações raras: muito menos do que o esperado (resíduo ≤ −3)', ['Categoria','Ocorre junto com','Notícias','Esperado','Observado × esperado','Vezes','Resíduo'],
        raras.map(x=>[`${capS(x.A)} (${VR[x.va]})`, `${capS(x.B)} (${VR[x.vb]})`, fmt(x.ob), nfmt1(x.e), oxe(x), nfmt1(x.razao)+'×', nfmt2(x.r).replace(/(,\d)\d$/,'$1')]),
        'Resíduo negativo: a combinação aparece menos do que o tamanho dos dois grupos faria esperar.', ['','','r','r','','r','r']);
    }
    sinIr(s, [['Movimentos × objetivos (associação)', ()=>{ st.v='tipomov'; st.x='objetivos'; st.mode='res'; setTab('dist'); }], ['Fluxo quem → como → por quê', ()=>{ Object.assign(FLOW,{a:'tipomov', b:'matriz', c:'objetivos'}); setTab('flow'); }], ['Tipologia de ações', ()=>{ Object.assign(TYPO,{a:'matriz', b:'derivada'}); setTab('typo'); }]]);
  }
  /* 3. A quem e em que escala */
  { const s=sinSecao(body, ++sec, 'A quem se dirigem e em que escala', 'Instituições interpeladas, escala e ações virtuais.');
    const ti=sinTop(rows,'tipoinst'), es=sinTop(rows,'escala'), vi=sinTop(rows,'virtual'), virt=(vi.find(d=>d.nome==='Sí')||{n:0}).n;
    if(ti.length) sinP(s, `As ações se dirigem principalmente a **${capS(ti[0].nome)}** (${pct(ti[0].n,N)})`+(ti[1]? `, a ${aspas(ti[1].nome)} (${pct(ti[1].n,N)})`:'')+(ti[2]? ` e a ${aspas(ti[2].nome)} (${pct(ti[2].n,N)})`:'')+'.'+(es.length? ` A escala predominante é a **${capS(es[0].nome).toLowerCase()}** (${pct(es[0].n,N)})`+(es[1]? `, seguida da ${capS(es[1].nome).toLowerCase()} (${pct(es[1].n,N)})`:'')+'.' : '')+` ${virt? `${fmt(virt)} notícias (${pct(virt,N)}) registram ações virtuais.` : 'Nenhuma notícia do recorte registra ação virtual.'}`);
    if(ti.length && es.length) achados.push(`O principal interlocutor é ${aspas(ti[0].nome)}, e a escala predominante, a ${capS(es[0].nome).toLowerCase()}.`);
    const g=sinGrade(s); sinBarras(g, 'Instituição interpelada', ti.slice(0,8), N); sinBarras(g, 'Escala da ação', es, N);
    sinIr(s, [['Escala × instituição (associação)', ()=>{ st.v='escala'; st.x='tipoinst'; st.mode='res'; setTab('dist'); }], ['Rede de instituições interpeladas juntas', ()=>{ Object.assign(NET,{v:'tipoinst', n:25, min:3, cor:'com'}); setTab('net'); }]]);
  }
  /* 4. Onde */
  { const s=sinSecao(body, ++sec, 'Onde', 'Regiões, províncias e localidades; peso das notícias em relação à população.');
    const rg=sinTop(rows,'region'), lc=sinTop(rows,'localidad').filter(d=>!/nacional|virtual/i.test(d.nome));
    const popR=new Map(); DEPTS.forEach(f=>{ const v=IND_DEP[f.id], r=f.properties.r; if(v && v.pop && r) popR.set(r,(popR.get(r)||0)+v.pop); }); // população por região a partir dos departamentos (separa o GBA do resto da província de Buenos Aires)
    const popT=d3.sum([...popR.values()]), comReg=d3.sum(rg,d=>d.n);
    const linhas=rg.map(d=>{ const pp=(popR.get(d.nome)||0)/popT, pn=d.n/comReg; return {d, pn, pp, idx: pp? pn/pp : null}; });
    if(rg.length){ const sobre=linhas.filter(l=>l.idx!=null).sort((a,c)=>c.idx-a.idx);
      sinP(s, `A região com mais notícias é **${rg[0].nome}**, com ${pct(linhas[0].pn*100,100)} das notícias com região identificada`+(linhas[0].pp? ` e ${pct(linhas[0].pp*100,100)} da população do país`:'')+`. Em proporção à população, `+(sobre.length>1? `a região mais sobrerrepresentada é **${sobre[0].d.nome}** (${nfmt2(sobre[0].idx)} vezes o seu peso populacional) e a menos representada é ${sobre[sobre.length-1].d.nome} (${nfmt2(sobre[sobre.length-1].idx)}).` : 'não há outra região para comparar.')+(lc.length? ` As localidades mais citadas são ${listaPt(lc.slice(0,4).map(d=>`${d.nome.replace(/ \([^)]*\)$/,'')} (${fmt(d.n)})`))}.`:''));
      if(sobre.length>1) achados.push(`${rg[0].nome} concentra ${pct(linhas[0].pn*100,100)} das notícias com região identificada`+(sobre[0].d.nome===rg[0].nome? ' e é também a região mais sobrerrepresentada em relação à população.' : `; em relação à população, a região mais sobrerrepresentada é ${sobre[0].d.nome}.`)); }
    const g=sinGrade(s); sinMapa(g, rows);
    const col=el('div'); g.append(col);
    if(linhas.length) sinTabela(col, 'Notícias e população por região', ['Região','Notícias','% notícias','% população','Índice'],
      linhas.map(l=>[l.d.nome, fmt(l.d.n), pct(l.pn*100,100), l.pp? pct(l.pp*100,100) : '—', l.idx!=null? nfmt2(l.idx) : '—']),
      'Índice = % das notícias ÷ % da população (Censo 2022). Acima de 1: mais notícias do que o peso populacional faria esperar.', ['','r','r','r','r']);
    // destaques por departamento (Poisson)
    const dsP=destaques(mapData(rows,'prov')), dsD=destaques(mapData(rows,'dept'));
    const altos=dsD.feats.filter(x=>x.t==='alto').sort((a,c)=>c.razao-a.razao), altosP=dsP.feats.filter(x=>x.t==='alto').sort((a,c)=>c.razao-a.razao), baixosP=dsP.feats.filter(x=>x.t==='baixo');
    if(altos.length || altosP.length){
      sinP(col, `**Destaques.** Comparando as notícias com o que se esperaria pela população (teste de Poisson, p < 0,01), `+(altosP.length? `as províncias muito acima do esperado são ${listaPt(altosP.slice(0,4).map(x=>`${x.nome} (${fmt(x.O)} notícias, ${nfmt1(x.razao)}× o esperado)`))}`:'nenhuma província fica muito acima do esperado')+(baixosP.length? `; ficam muito abaixo ${listaPt(baixosP.slice(0,4).map(x=>x.nome))}`:'')+'. '+(altos.length? `Entre os departamentos, sobressaem ${listaPt(altos.slice(0,5).map(x=>`${x.nome} (${nfmt1(x.razao)}×)`))}. São os lugares que aparecem com contorno laranja nos mapas.` : ''));
      if(altos[0]) achados.push(`O departamento mais acima do esperado pela população é ${altos[0].nome} (${nfmt1(altos[0].razao)} vezes).`); }
    sinIr(s, [['Mapa por localidade', ()=>{ Object.assign(mstate,{mode:'one', unit:'loc', measure:'abs', ctx:'', mes:''}); setTab('map'); }], ['Taxa por departamento', ()=>{ Object.assign(mstate,{mode:'one', unit:'dept', measure:'rate', ctx:'', mes:''}); setTab('map'); }], ['Pontos quentes (LISA)', ()=>{ Object.assign(mstate,{mode:'one', unit:'dept', measure:'abs', ctx:'lisa', mes:''}); setTab('map'); }]]);
  }
  /* 5. Quando */
  { const s=sinSecao(body, ++sec, 'Quando', 'Ritmo semanal, semanas de pico e acontecimentos de 2024.');
    const ms=MES_VALS.map((m,i)=>({m, i, n:counts(rows,'mes').get(i)||0}));
    const nomeMes = x => (x.m.split('· ')[1]||x.m).toLowerCase();
    const msOrd=[...ms].filter(x=>x.n>0).sort((a,c)=>c.n-a.n);
    const intro=el('div'); s.append(intro);
    const sm=sinSemanas(s, rows);
    const picTxt=sm.picos.slice(0,6).map(p=>`semana de ${p.d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})} (${fmt(p.n)} notícias`+(p.ev.length? `; ${listaPt(p.ev.map(e=>e.curto||e.nome))}`:'')+')');
    const comEv=sm.picos.filter(p=>p.ev.length).length;
    sinP(intro, (msOrd.length? `O mês com mais notícias é **${nomeMes(msOrd[0])}** (${fmt(msOrd[0].n)})`+(msOrd[1]? `, seguido de ${nomeMes(msOrd[1])} (${fmt(msOrd[1].n)})`:'')+(msOrd.length>2? `; o de menos notícias é ${nomeMes(msOrd[msOrd.length-1])} (${fmt(msOrd[msOrd.length-1].n)})`:'')+'. ' : '')+
      (sm.picos.length? `Há **${sm.picos.length} ${sm.picos.length===1? 'semana de pico' : 'semanas de pico'}**: ${listaPt(picTxt)}. `+(comEv? `${comEv===sm.picos.length? 'Todas coincidem' : `${comEv} delas coincidem`} com acontecimentos de 2024, o que sugere que a mobilização responde ao calendário político e às datas de luta.` : 'Nenhuma coincide com os acontecimentos marcados, o que sugere picos ligados a conflitos próprios do recorte.') : 'Não há semanas de pico: a mobilização se distribui sem concentrações fora do comum.'));
    if(sm.picos.length){ const mx=[...sm.picos].sort((a,c)=>c.n-a.n)[0]; achados.push(`A semana mais intensa começa em ${mx.d.toLocaleDateString('pt-BR')} (${fmt(mx.n)} notícias${mx.ev.length? ', '+listaPt(mx.ev.map(e=>e.curto||e.nome)) : ''}).`); }
    sinIr(s, [['Série semanal por tipo de movimento', ()=>{ SEM.v='tipomov'; setTab('time'); }], ['Série semanal por objetivos', ()=>{ SEM.v='objetivos'; setTab('time'); }], ['Mapa animado mês a mês', ()=>{ Object.assign(mstate,{mode:'one', unit:'prov', measure:'rate', ctx:'', mes:''}); setTab('map'); }]]);
  }
  /* 6. Com quem */
  { const s=sinSecao(body, ++sec, 'Com quem', 'Articulações entre organizações que aparecem nas mesmas notícias.');
    const iv=VI.nombremov, top=sinTop(rows,'nombremov',40), ids=top.map(d=>d.k), em=new Set(ids), nome=new Map(top.map(d=>[d.k,d.nome])), nN=new Map(top.map(d=>[d.k,d.n]));
    const w=new Map(); rows.forEach(r=>{ const ks=[...new Set(r.v[iv])].filter(k=>em.has(k)).sort((a,c)=>a-c); for(let i=0;i<ks.length;i++) for(let j=i+1;j<ks.length;j++){ const k=ks[i]+'|'+ks[j]; w.set(k,(w.get(k)||0)+1); } });
    const links=[...w].filter(([,x])=>x>=2).map(([k,x])=>{ const [a,c]=k.split('|').map(Number); return {source:a, target:c, w:x}; });
    if(links.length>=3){
      const lv=louvain(ids, links), bt=intermediacao(ids, links), grau=new Map(ids.map(i=>[i,0])); links.forEach(l=>{ grau.set(l.source,grau.get(l.source)+1); grau.set(l.target,grau.get(l.target)+1); });
      const blocos=new Map(); ids.filter(i=>grau.get(i)>0).forEach(i=>{ const c=lv.comm.get(i); if(!blocos.has(c)) blocos.set(c,[]); blocos.get(c).push(i); });
      const bl=[...blocos.values()].filter(m=>m.length>=2).sort((a,c)=>c.length-a.length);
      const forte=[...links].sort((a,c)=>c.w-a.w).slice(0,3), cent=[...ids].sort((a,c)=>grau.get(c)-grau.get(a)||nN.get(c)-nN.get(a)), ponte=[...ids].filter(i=>bt.get(i)>0).sort((a,c)=>bt.get(c)-bt.get(a));
      const sig = k => { const s0=nome.get(k), m=/\(([^)]+)\)\s*$/.exec(s0); return m && m[1].length<=12? m[1] : s0; };
      sinP(s, `Entre as ${fmt(ids.length)} organizações mais citadas, ${fmt(links.length)} pares aparecem juntos em duas ou mais notícias. A organização com mais parceiros é **${sig(cent[0])}** (${fmt(grau.get(cent[0]))} parceiros)`+(cent[1]? `, seguida de ${sig(cent[1])} (${fmt(grau.get(cent[1]))})`:'')+`. As alianças mais frequentes são ${listaPt(forte.map(l=>`${sig(l.source)}–${sig(l.target)} (${fmt(l.w)} notícias)`))}.`+(bl.length>1? ` A rede se divide em **${bl.length} blocos** de organizações que agem mais entre si; o maior reúne ${listaPt(bl[0].slice().sort((a,c)=>nN.get(c)-nN.get(a)).slice(0,4).map(sig))}.` : '')+(ponte[0]? ` A principal ponte entre blocos (maior intermediação) é ${sig(ponte[0])}.`:''));
      achados.push(`${sig(cent[0])} é a organização mais articulada (${fmt(grau.get(cent[0]))} parceiros)`+(bl.length>1? `, numa rede com ${bl.length} blocos.` : '.'));
      const blocoDe=new Map(); bl.forEach((m,i)=>m.forEach(k=>blocoDe.set(k,i+1)));
      sinTabela(s, 'Organizações mais articuladas', ['Organização','Notícias','Parceiros','Intermediação','Bloco'],
        cent.slice(0,8).map(k=>[nome.get(k), fmt(nN.get(k)), fmt(grau.get(k)), nfmt2(bt.get(k)), blocoDe.get(k)? String(blocoDe.get(k)) : '—']),
        'Parceiros: organizações com 2 ou mais notícias em comum. Intermediação: parcela dos caminhos mais curtos da rede que passam pela organização (0 a 1). Blocos: comunidades de Louvain, numeradas do maior para o menor.', ['','r','r','r','r']);
    } else sinP(s, 'Há poucas organizações citadas juntas neste recorte para formar uma rede.');
    sinIr(s, [['Rede de organizações', ()=>{ Object.assign(NET,{v:'nombremov', n:40, min:2, cor:'com'}); setTab('net'); }], ['Só as alianças fortes', ()=>{ Object.assign(NET,{v:'nombremov', n:40, min:5, cor:'com'}); setTab('net'); }]]);
  }
  /* 7. Estrutura geral (ACM) */
  { const s=sinSecao(body, ++sec, 'A estrutura geral', 'Análise de correspondências múltiplas: as grandes oposições que organizam as notícias.');
    const vids=ACM_PADRAO.filter(v=>VI[v]!=null && sinTop(rows,v).length>=2);
    const A = vids.length>=3 && N>=40? calcACM(rows, vids, 8) : null;
    if(A && A.coord.length){
      const lado=(d,sinal)=>A.coord.filter(p=>p.k>=0 && Math.sign(p.f[d])===sinal).sort((a,c)=>c.ctr[d]-a.ctr[d]).slice(0,4).map(p=>aspas(p.nome));
      const pc0=A.adjTot? A.adj[0]/A.adjTot : 0, pc1=A.adjTot? A.adj[1]/A.adjTot : 0;
      const n1=lado(0,-1), p1=lado(0,1), n2=lado(1,-1), p2=lado(1,1);
      sinP(s, `Cruzando ao mesmo tempo ${listaPt(vids.map(v=>({tipomov:'tipo de movimento', matriz:'ação matriz', objetivos:'objetivos', direccion:'direcionalidade', escala:'escala', region:'região'}[v]||v)))}, o **primeiro eixo** (${pct(pc0*100,100)} da inércia corrigida) opõe ${listaPt(n1)} a ${listaPt(p1)}. O **segundo eixo** (${pct(pc1*100,100)}) separa ${listaPt(n2)} de ${listaPt(p2)}. Em outras palavras, as notícias se organizam sobretudo por essas oposições: categorias do mesmo lado tendem a aparecer nas mesmas notícias.`);
      sinTabela(s, null, ['Eixo','De um lado','Do outro lado'], [['1 ('+pct(pc0*100,100)+')', listaPt(n1), listaPt(p1)], ['2 ('+pct(pc1*100,100)+')', listaPt(n2), listaPt(p2)]],
        'Em cada lado, as quatro categorias que mais contribuem para o eixo. A inércia corrigida (Benzécri) indica quanto da estrutura cada eixo resume.');
      achados.push(`A principal oposição do recorte separa ${n1.slice(0,2).join(' e ')} de ${p1.slice(0,2).join(' e ')}.`);
    } else sinP(s, 'O recorte é pequeno ou homogêneo demais para uma análise de correspondências.');
    sinIr(s, [['Abrir as correspondências', ()=>{ ACMS.vars=vids.length>=3? vids : ACM_PADRAO.slice(); setTab('acm'); }]]);
  }
  /* 8. Contexto */
  { const s=sinSecao(body, ++sec, 'Diante de que contexto', 'Relação entre notícias por habitante e indicadores oficiais, por província.');
    const md=mapData(rows,'prov');
    const provs=PROVS_FC.filter(f=>f.properties.pi>=0 && POP[f.properties.pi]);
    const cor=Object.keys(CTX_ROT).filter(k=>!/populacao|homicidios_2023|^i_pop$|^i_viv$/.test(k)).map(k=>{ const pts=provs.map(f=>({x:(CTX.provincias[f.properties.p]||{})[k], y:md.rate(f.properties.pi)})).filter(p=>p.x!=null && isFinite(p.x));
      if(pts.length<15) return null; const c=correlacoes(pts.map(p=>p.x), pts.map(p=>p.y)); return {k, rot:CTX_ROT[k][0], rho:c.rho, n:pts.length}; }).filter(x=>x && isFinite(x.rho));
    const vis=new Set(); const corU=cor.sort((a,c)=>Math.abs(c.rho)-Math.abs(a.rho)).filter(x=>{ if(vis.has(x.rot)) return false; vis.add(x.rot); return true; });
    const sig=corU.filter(x=>Math.abs(x.rho)>=0.41);
    if(corU.length){
      const pos=sig.filter(x=>x.rho>0), neg=sig.filter(x=>x.rho<0);
      sinP(s, sig.length? `Por província, as notícias por 100 mil habitantes ${pos.length? `crescem junto com ${listaPt(pos.slice(0,3).map(x=>`${rotInd(x.rot)} (ρ = ${nfmt2(x.rho)})`))}`:''}${pos.length&&neg.length? ' e ':''}${neg.length? `diminuem onde é maior ${listaPt(neg.slice(0,3).map(x=>`${rotInd(x.rot)} (ρ = ${nfmt2(x.rho)})`))}`:''}. Com 24 províncias, só correlações a partir de ±0,41 são estatisticamente significativas (p < 0,05). Correlação não é causa: indica onde olhar com mais cuidado, não por que a mobilização acontece.`
        : `Por província, nenhum dos indicadores oficiais tem correlação significativa com as notícias por 100 mil habitantes (todas abaixo de ±0,41, com 24 províncias). A mobilização registrada neste recorte não acompanha de forma simples as condições medidas pelo Censo.`);
      if(sig[0]) achados.push(`O indicador mais associado às notícias por habitante é ${rotInd(sig[0].rot)} (ρ = ${nfmt2(sig[0].rho)}, relação ${forcaRho(sig[0].rho)} ${sig[0].rho>0? 'positiva' : 'negativa'}).`);
      sinTabela(s, 'Indicadores mais associados às notícias por habitante (províncias)', ['Indicador','ρ de Spearman','Relação'],
        corU.slice(0,8).map(x=>{ const sp=el('span', 'sin-rho '+(x.rho>0? 'pos':'neg')); const bar=el('i'); bar.style.width=Math.abs(x.rho)*100+'%'; sp.append(bar, document.createTextNode(nfmt2(x.rho))); return [x.rot, sp, `${forcaRho(x.rho)} ${x.rho>0? 'positiva' : 'negativa'}${Math.abs(x.rho)>=0.41? ' · significativa' : ''}`]; }),
        'ρ de Spearman: de −1 a +1, compara a ordem das províncias nos dois indicadores. Positiva: mais notícias por habitante onde o indicador é maior. Fontes: Censo 2022 (INDEC) e Ministério de Segurança.', ['','r','']);
      sinIr(s, [[`Abrir: ${corU[0].rot}`, ()=>{ CTXV.nivel='prov'; CTXV.x=corU[0].k; setTab('ctx'); }], ['Privação × protestos (mapa bivariado)', ()=>{ Object.assign(mstate,{mode:'one', unit:'dept', ctx:'biv_ipmh', mes:''}); setTab('map'); }]]);
    }
  }
  /* 9. Imprensa */
  { const s=sinSecao(body, ++sec, 'Quem conta', 'Veículos de imprensa e concentração da cobertura.');
    const fo=sinTop(rows,'fuente'), tot=d3.sum(fo,d=>d.n);
    if(fo.length){ const asc=fo.map(d=>d.n).sort(d3.ascending), n=asc.length; let acc=0, area=0, prev=0; asc.forEach(x=>{ acc+=x; area+=(prev+acc/tot)/2/n; prev=acc/tot; }); const gini=1-2*area;
      const t10=d3.sum(fo.slice(0,10),d=>d.n)/tot;
      sinP(s, `As notícias vêm de ${fmt(fo.length)} veículos. Os que mais aparecem são ${listaPt(fo.slice(0,3).map(d=>`**${d.nome}** (${pct(d.n,tot)})`))}; os dez maiores somam ${pct(t10*100,100)} das notícias, e o índice de Gini da cobertura é ${nfmt2(gini)} (0 = todos os veículos com o mesmo peso; 1 = um só veículo). `+(gini>0.6? 'A cobertura é concentrada: a imagem da mobilização depende muito de poucos jornais, sobretudo os de circulação nacional, e as ações em lugares menos cobertos podem estar sub-registradas.' : 'A cobertura é relativamente diversificada, o que dá mais confiança à distribuição observada.'));
      achados.push(`A cobertura vem de ${fmt(fo.length)} veículos, com Gini de ${nfmt2(gini)}: ${gini>0.6? 'concentrada em poucos jornais' : 'relativamente diversificada'}.`);
      const g=sinGrade(s); sinBarras(g, 'Veículos mais frequentes', fo.slice(0,8), tot, 'Porcentagens sobre as notícias com fonte identificada.'); }
    sinIr(s, [['Abrir a aba Imprensa', ()=>setTab('imp')]]);
  }
  /* considerações */
  { const s=sinSecao(body, ++sec, 'Para continuar a discussão', null);
    sinP(s, 'Os resultados acima descrevem **o que a imprensa registrou**, e não toda a mobilização ocorrida. Três perguntas ajudam a levar a síntese adiante:');
    const ul=el('ul','sin-perg'); [
      'Os sujeitos e repertórios mais frequentes coincidem com os mais característicos de cada região (seções 2 e 4)? Onde não coincidem, há uma especificidade territorial a explicar.',
      'As semanas de pico respondem ao calendário nacional (paros, marchas federais, datas de luta) ou a conflitos locais? Compare a série semanal com as fichas das organizações envolvidas.',
      'Os lugares muito acima ou muito abaixo do esperado pela população refletem a mobilização ou a cobertura? Confronte o mapa com a aba Imprensa antes de concluir.'
    ].forEach(t=>ul.append(el('li',null,t))); s.append(ul);
    const nm=el('details','sin-metodo'); nm.append(el('summary',null,'Nota metodológica'));
    sinP(nm, `Base: notícias de ações coletivas na Argentina em 2024, lidas e codificadas por pesquisadores; ${st.rep? 'inclui notícias repetidas' : 'sem notícias repetidas'}. Recorte: ${filtros||'toda a base'}. Uma notícia pode ter várias categorias numa mesma variável, por isso as porcentagens podem somar mais de 100%. Combinações características: resíduos ajustados de Haberman sobre a tabela de co-ocorrência (≥ 3; mínimo de 5 notícias). Peso populacional: Censo 2022 (INDEC). Destaques: número de notícias de cada província ou departamento comparado ao esperado pela população, com teste exato de Poisson (p < 0,01; mínimo de 3 notícias para “acima”). Semanas de pico: acima de Q3 + 1,5 × intervalo interquartil. Rede: 40 organizações mais citadas, ligações com 2 ou mais notícias em comum, comunidades de Louvain e intermediação de Brandes. Correspondências: ACM com codificação difusa e correção de Benzécri, 8 categorias mais frequentes por variável. Contexto: correlação de Spearman entre notícias por 100 mil habitantes e cada indicador, nas 24 províncias. Os textos são gerados automaticamente por essas regras e devem ser lidos como ponto de partida para a interpretação.`);
    s.append(nm);
  }
  // resumo no topo
  if(achados.length){ resumo.append(el('h4',null,'Em síntese')); const ol=el('ol'); achados.forEach(t=>{ const li=el('li'); sinP(li,t); ol.append(li); }); resumo.append(ol); }
}
EXTRA.sin = renderSintese;

$('sinPrint').onclick=()=>{ document.querySelectorAll('.sin-metodo').forEach(d=>{ d.open=true; }); document.body.classList.add('imprime-sin'); const fim=()=>{ document.body.classList.remove('imprime-sin'); window.removeEventListener('afterprint',fim); }; window.addEventListener('afterprint',fim); window.print(); setTimeout(fim, 1500); };

// sínteses prontas: recortes aplicados à aba
(()=>{ const rec = pares => ()=>{ st.f={}; pares.forEach(([vid,nome])=>{ const k=idxDe(vid,nome); if(k>=0) (st.f[vid]||(st.f[vid]=new Set())).add(k); }); st.page=40; };
  prontos('sinPresets', 'Sínteses prontas:', [
    ['Toda a base', 'Remove todos os filtros', ()=>{ st.f={}; }],
    ['Movimentos sindicais', 'Só notícias com movimentos sindicais', rec([['tipomov','Movimientos sindicales']])],
    ['Economia popular e desocupados', 'Economia social e solidária ou trabalhadores desocupados', rec([['tipomov','Movimientos de Economía Social y Solidaria'],['tipomov','Movimientos de trabajadores Desocupados']])],
    ['Feministas e LGTTBIQ+', 'Movimentos de mulheres/feministas ou LGTTBIQ+', rec([['tipomov','Movimientos de mujeres/feministas'],['tipomov','Movimientos de LGTTBIQ+']])],
    ['Educação', 'Ações com objetivos educativos', rec([['objetivos','Objetivos educativos']])],
    ['Moradia e hábitat', 'Objetivos por moradia e hábitat', rec([['objetivos','Objetivos por la vivienda y hábitat']])],
    ['Direitos humanos', 'Objetivos em torno dos direitos humanos', rec([['objetivos','Objetivos en torno a Derechos Humanos']])],
    ['Gran Buenos Aires', 'Região metropolitana', rec([['region','Gran Buenos Aires']])],
    ['Patagônia', 'Região patagônica', rec([['region','Patagonia']])],
    ['Norte (NOA e NEA)', 'Noroeste e Nordeste', rec([['region','Noroeste (NOA)'],['region','Noreste (NEA)']])],
    ['Ações defensivas', 'Direcionalidade defensiva', rec([['direccion','Defensiva']])],
    ['Escala nacional', 'Ações de escala nacional', rec([['escala','Nacional']])],
  ]); })();
