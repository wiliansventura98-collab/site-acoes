/* GERADO por i18n/ferramenta.js a partir de assets/js/app/sintese.js; não edite: edite o original e i18n/es.json */
var IDIOMA='es';
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
const nfmt2 = x => x.toLocaleString('es-AR',{maximumFractionDigits:2, minimumFractionDigits:2}).replace('-','−');
const dBR = s => `${s.slice(6,8)}/${s.slice(4,6)}/${s.slice(0,4)}`;
const MESES_EXT = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

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
  const w=el('div','sin-bars'); w.append(el('h4',null,titulo)); if(!itens.length){ w.append(el('p','meta','Sin datos en este recorte.')); box.append(w); return w; }
  const mx=d3.max(itens,d=>d.n)||1;
  itens.forEach((d,i)=>{ const row=el('button','sin-bar'); row.type='button'; row.title=`${d.nome}: ${fmt(d.n)} noticias (${pct(d.n,total)}). Haga clic para filtrar el recorte.`;
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
const forcaRho = r => { const a=Math.abs(r); return a<0.1? 'nula' : a<0.3? 'débil' : a<0.6? 'moderada' : 'fuerte'; };

/* ---------- mapa e série semanal ---------- */
function sinMapa(box, rows){
  const sheet=el('div','sin-mapa'); box.append(sheet);
  const W=Math.min(520, Math.max(300, sheet.clientWidth||box.clientWidth||400));
  const cl=counts(rows,'localidad'); const N=rows.length;
  const md={unit:'loc', vid:'localidad', c:cl, rate:()=>0, N, mapped: rows.filter(r=>r.v[VI.localidad].some(k=>LOC_XY[k])).length, max:d3.max([...cl].filter(([k])=>LOC_XY[k]), d=>d[1])||1, XY:LOC_XY, spatial:false};
  const mw=W-40, mh=Math.round(mw*1.45), frame=[30, 6, 30+mw, 6+mh];
  const svg=d3.select(sheet).append('svg').attr('viewBox',`0 0 ${W} ${mh+12}`).attr('width','100%').attr('font-family',FONT).attr('role','img').attr('aria-label','Mapa de las noticias por localidad');
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
  lg.append('text').attr('x',0).attr('y',0).attr('font-size',10).attr('font-weight',700).attr('fill',C.ink).text('Noticias por localidad');
  const R0=sh.r(sh.max); vs.forEach(v=>{ const r=sh.r(v); lg.append('circle').attr('cx',R0+2).attr('cy',8+2*R0-r).attr('r',r).attr('fill','none').attr('stroke',C.ink2);
    lg.append('text').attr('x',2*R0+10).attr('y',8+2*R0-2*r+4).attr('font-size',10).attr('fill',C.ink2).text(fmt(v)); });
  sheet.append(el('p','sin-nota',`Círculos con área proporcional al número de noticias que citan cada localidad; ${fmt(N-md.mapped)} noticias del recorte no tienen localidad mapeable (nacionales, virtuales o sin referencia). Haga clic en un círculo para filtrar.`));
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
  const svg=d3.select(w).append('svg').attr('viewBox',`0 0 ${W} ${H}`).attr('width','100%').attr('role','img').attr('aria-label','Noticias por semana en 2024, con semanas pico');
  svg.append('g').attr('class','grid').selectAll('line').data(y.ticks(4)).join('line').attr('x1',m.l).attr('x2',W-m.r).attr('y1',d=>y(d)).attr('y2',d=>y(d));
  svg.append('g').attr('class','axis').attr('transform',`translate(${m.l},0)`).call(d3.axisLeft(y).ticks(4).tickSize(0).tickPadding(5).tickFormat(d=>fmt(d))).call(g=>g.select('.domain').remove());
  const xm=d3.scaleTime().domain([new Date(2024,0,1), new Date(2024,11,31)]).range([m.l, W-m.r]);
  svg.append('g').attr('class','axis').attr('transform',`translate(0,${H-m.b})`).call(d3.axisBottom(xm).ticks(d3.timeMonth.every(1)).tickSize(0).tickPadding(6).tickFormat(d=>MES_ABBR[d.getMonth()]));
  const ehPico=new Set(picos.map(p=>+p.d)), tip=tipFor(w);
  svg.append('g').selectAll('rect').data(semanas.map((d,i)=>({d,n:n[i]}))).join('rect').attr('x',d=>x(+d.d)).attr('width',x.bandwidth()).attr('y',d=>y(d.n)).attr('height',d=>y(0)-y(d.n))
    .attr('fill',d=>ehPico.has(+d.d)? COR_ALTO : '#9fb3c8').attr('rx',1)
    .on('mousemove',(e,d)=>tip.show(e, `Semana del ${d.d.toLocaleDateString('es-AR')}`, [`${fmt(d.n)} noticias`+(ehPico.has(+d.d)? ' · semana pico':'')])).on('mouseleave',()=>tip.hide());
  // marcas dos acontecimentos
  const ge=svg.append('g'); EVENTOS.forEach((e,i)=>{ const xx=xm(e.d); ge.append('line').attr('x1',xx).attr('x2',xx).attr('y1',m.t-6).attr('y2',H-m.b).attr('stroke',COR_EV[e.tipo]||'#7c8aa0').attr('stroke-dasharray','2 3').attr('stroke-width',1);
    ge.append('circle').attr('cx',xx).attr('cy',m.t-12).attr('r',7).attr('fill',COR_EV[e.tipo]||'#7c8aa0');
    ge.append('text').attr('x',xx).attr('y',m.t-8.5).attr('text-anchor','middle').attr('font-size',9).attr('font-weight',800).attr('fill','#fff').text(e.i)
      .append('title').text(`${e.i}. ${e.nome} (${e.d.toLocaleDateString('es-AR')})`); });
  w.append(el('p','sin-nota',`Columnas: noticias por semana (lunes a domingo), según la fecha de inicio de la acción o, a falta de ella, de publicación. En naranja, semanas pico (por encima de Q3 + 1,5 × rango intercuartil = ${nfmt1(corte)} noticias). Círculos numerados: acontecimientos de 2024 (pase el mouse para ver el nombre).`));
  return { picos, n, semanas, corte, comData:ds.length };
}

/* ---------- a síntese ---------- */
function renderSintese(b){
  const body=$('sinBody'); body.textContent=''; if(!HAS_D3) return;
  const rows=b.filter(r=>match(r,null)), N=rows.length, NB=b.length;
  const filtros=filtersText();
  $('sinMeta').textContent=`${fmt(N)} noticias`;
  if(N<10){ sinP(body, `El recorte actual tiene solo **${fmt(N)}** noticias, pocas para una síntesis. Quite algún filtro o elija una de las síntesis listas.`); return; }
  const achados=[];
  // cabeçalho
  const cab=el('header','sin-cab'); body.append(cab);
  cab.append(el('p','sin-kicker', filtros? 'Síntesis del recorte' : 'Síntesis de toda la base'));
  cab.append(el('h3','sin-titulo', filtros? filtros : 'Acciones colectivas registradas por la prensa en la Argentina, 2024'));
  const datas=rows.map(r=>r.sort).filter(s=>s && s!=='00000000').sort();
  const dist=vid=>sinTop(rows,vid).filter(d=>!/nacional|virtual/i.test(d.nome)).length;
  const nOrg=sinTop(rows,'nombremov').length, nProv=sinTop(rows,'provincia').filter(d=>POP[d.k]).length, nLoc=dist('localidad'), nFonte=sinTop(rows,'fuente').length;
  const kp=el('div','sin-kpis'); [[fmt(N),'noticias', filtros? `${pct(N,NB)} de la base` : (st.rep? 'con repetidas':'sin repetidas')],[fmt(nOrg),'organizaciones nombradas'],[fmt(nProv),'provincias'],[fmt(nLoc),'localidades'],[fmt(nFonte),'medios de prensa']]
    .forEach(([n,l,s])=>{ const d=el('div'); d.append(el('b',null,n), el('span',null,l)); if(s) d.append(el('small',null,s)); kp.append(d); });
  cab.append(kp);
  const resumo=el('div','sin-resumo'); cab.append(resumo); // preenchido no fim
  sinP(cab, `Este recorte reúne **${fmt(N)} noticias** de acciones colectivas en la Argentina en 2024${filtros? ` (${pct(N,NB)} de las ${fmt(NB)} noticias de la base)` : ''}`+(datas.length? `, con acciones fechadas del ${dBR(datas[0])} a ${dBR(datas[datas.length-1])}` : '')+`. Citan ${fmt(nOrg)} organizaciones en ${fmt(nProv)} provincias y ${fmt(nLoc)} localidades, y provienen de ${fmt(nFonte)} medios de prensa. La lectura de abajo recorre nueve preguntas; cada una termina con atajos a la pestaña en la que el resultado puede profundizarse.`, 'sin-lead');

  let sec=0;
  /* 1. Quem se mobiliza */
  { const s=sinSecao(body, ++sec, 'Quién se moviliza', 'Tipos de movimiento y organizaciones nombradas en las noticias.');
    const tm=sinTop(rows,'tipomov'), org=sinTop(rows,'nombremov');
    const comTm=rows.filter(r=>r.v[VI.tipomov].some(k=>!ehSemInfo(VARS[VI.tipomov].values[k]))).length;
    if(tm.length===1) sinP(s, `Todas las noticias del recorte con tipo de movimiento informado son de **${capS(tm[0].nome)}**.`);
    else if(tm.length){ const t3=tm.slice(0,3), anyT3=rows.filter(r=>r.v[VI.tipomov].some(k=>t3.some(d=>d.k===k))).length;
      sinP(s, `El tipo de movimiento más presente es **${capS(tm[0].nome)}**, en ${fmt(tm[0].n)} noticias (${pct(tm[0].n,N)} del recorte)`+(tm[1]? `, seguido de ${aspas(tm[1].nome)} (${pct(tm[1].n,N)})`:'')+(tm[2]? ` e ${aspas(tm[2].nome)} (${pct(tm[2].n,N)})`:'')+`. Estos ${t3.length} tipos aparecen en ${pct(anyT3,N)} de las noticias, lo que indica `+(anyT3/N>0.75? 'una movilización concentrada en pocos sujetos.' : 'una movilización distribuida entre varios sujetos.')+(comTm<N? ` En ${fmt(N-comTm)} noticias no se informa el tipo de movimiento.`:''));
      achados.push(`El tipo de movimiento más presente es **${capS(tm[0].nome)}** (${pct(tm[0].n,N)} de las noticias).`); }
    if(org.length){ const comOrg=rows.filter(r=>r.v[VI.nombremov].some(k=>!ehSemInfo(VARS[VI.nombremov].values[k]))).length, t10=org.slice(0,10), any10=rows.filter(r=>r.v[VI.nombremov].some(k=>t10.some(d=>d.k===k))).length;
      sinP(s, `Entre las ${fmt(org.length)} organizaciones nombradas, las más citadas son ${listaPt(org.slice(0,4).map(d=>`**${d.nome}** (${fmt(d.n)})`))}. Las diez más citadas aparecen en ${pct(any10,comOrg)} de las ${fmt(comOrg)} noticias que nombran alguna organización, y ${fmt(org.filter(d=>d.n===1).length)} organizaciones aparecen una sola vez: `+(any10/comOrg>0.6? 'pocas organizaciones de gran visibilidad dominan la cobertura.' : 'la cobertura se reparte entre muchas organizaciones, con una larga cola de colectivos poco citados.')); }
    const g=sinGrade(s); sinBarras(g, 'Tipo de movimiento', tm.slice(0,8), N); sinBarras(g, 'Organizaciones más citadas', org.slice(0,8), N);
    sinIr(s, [['Distribución por tipo de movimiento', ()=>{ st.v='tipomov'; st.x=''; setTab('dist'); }], ['Ficha de la organización más citada', ()=>{ if(org[0]) abrirFicha('nombremov', org[0].k); }], ['Tipología tipo › organizaciones', ()=>{ Object.assign(TYPO,{a:'tipomov', b:'nombremov'}); setTab('typo'); }]]);
  }
  /* 2. Como e por quê */
  { const s=sinSecao(body, ++sec, 'Cómo y por qué', 'Repertorio de acción (acción matriz y derivada), objetivos y direccionalidad.');
    const mz=sinTop(rows,'matriz'), dv=sinTop(rows,'derivada'), ob=sinTop(rows,'objetivos'), dr=sinTop(rows,'direccion');
    if(mz.length) sinP(s, `En el repertorio predomina la acción matriz **${capS(mz[0].nome)}** (${pct(mz[0].n,N)})`+(mz[1]? `, seguida de ${aspas(mz[1].nome)} (${pct(mz[1].n,N)})`:'')+(mz[2]? ` e ${aspas(mz[2].nome)} (${pct(mz[2].n,N)})`:'')+'.'+(dv.length? ` En la forma concreta (acción derivada), las más comunes son ${listaPt(dv.slice(0,3).map(d=>`${aspas(d.nome)} (${fmt(d.n)})`))}.`:''));
    if(ob.length) sinP(s, `En cuanto a los objetivos, los más frecuentes son **${capS(ob[0].nome)}** (${pct(ob[0].n,N)})`+(ob[1]? ` e ${aspas(ob[1].nome)} (${pct(ob[1].n,N)})`:'')+'.'+(dr.length? ` En cuanto a la direccionalidad, predominan las acciones **${capS(dr[0].nome).toLowerCase()}s** (${pct(dr[0].n,N)})`+(dr[1]? `, seguidas de las ${capS(dr[1].nome).toLowerCase()}s (${pct(dr[1].n,N)})`:'')+(dr.find(d=>/defensiva/i.test(d.nome)) && dr[0].nome!=='Defensiva'? `; las acciones defensivas suman ${pct(dr.find(d=>/defensiva/i.test(d.nome)).n,N)}`:'')+'.' : ''));
    if(mz.length && ob.length) achados.push(`El repertorio más común es ${aspas(mz[0].nome)}, y el objetivo más frecuente, ${aspas(ob[0].nome)}.`);
    const g=sinGrade(s); sinBarras(g, 'Acción matriz', mz.slice(0,8), N); sinBarras(g, 'Objetivos', ob.slice(0,8), N);
    // combinações características
    const pares=[['tipomov','objetivos'],['tipomov','matriz'],['matriz','objetivos'],['region','tipomov'],['objetivos','tipoinst']];
    let todos=[]; pares.forEach(([a,c])=>{ todos=todos.concat(sinResiduos(rows,a,c)); });
    const unicos = arr => { const vistos=new Set(); return arr.filter(x=>{ const k=x.A+'|'+x.B; if(vistos.has(k)) return false; vistos.add(k); return true; }); };
    const top=unicos(todos.filter(x=>x.r>=3).sort((x,y)=>y.r-x.r)).slice(0,8);
    const raras=unicos(todos.filter(x=>x.r<=-3).sort((x,y)=>x.r-y.r)).slice(0,6);
    const VR={tipomov:'Tipo de movimiento', objetivos:'Objetivos', matriz:'Acción matriz', region:'Región', tipoinst:'Institución'};
    const oxe = x => { const w=el('span','sin-oxe'), mx=Math.max(x.ob,x.e)||1; const a=el('i','o'), b=el('i','e'); a.style.width=(x.ob/mx*100)+'%'; b.style.width=(x.e/mx*100)+'%'; a.title=`observado: ${fmt(x.ob)}`; b.title=`esperado: ${nfmt1(x.e)}`; w.append(a,b); return w; };
    if(top.length){
      sinP(s, `Las **combinaciones características** muestran lo que es típico de cada grupo, y no solo lo que es frecuente. Las asociaciones más fuertes del recorte son ${listaPt(top.slice(0,3).map(x=>`${aspas(x.A)} com ${aspas(x.B)} (${fmt(x.ob)} noticias, ${nfmt1(x.razao)} veces lo esperado)`))}.`);
      achados.push(`La asociación más marcada es ${aspas(top[0].A)} com ${aspas(top[0].B)}: ${nfmt1(top[0].razao)} veces lo esperado.`);
      // explicação passo a passo, com um exemplo do próprio recorte
      const ex = top.find(x=>x.va==='tipomov' && x.vb==='objetivos' && x.razao<8) || top[0];
      const pa=ex.na/ex.N, pb=ex.nb/ex.N;
      const porOb=[...todos].sort((x,y)=>y.ob-x.ob), freq=(porOb.find(x=>Math.abs(x.r)<1.96 && x.ob>=porOb[0].ob*0.25)||porOb[0]);
      const box=el('div','sin-explica'); box.append(el('h4',null,'Cómo leer: qué es el residuo ajustado'));
      const ol=el('ol'); box.append(ol); const passo=t=>{ const li=el('li'); sinP(li,t); ol.append(li); };
      passo(`**Contar.** De las ${fmt(ex.N)} noticias que informan ${VR[ex.va].toLowerCase()} e ${VR[ex.vb].toLowerCase()}, ${fmt(ex.na)} tienen ${aspas(ex.A)} e ${fmt(ex.nb)} tienen ${aspas(ex.B)}, es decir, ${pct(ex.nb,ex.N)} del total.`);
      passo(`**Calcular lo esperado.** Si las dos cosas no tuvieran ninguna relación, ${aspas(ex.B)} aparecería en las noticias de ${aspas(ex.A)} en la misma proporción que en el total: ${fmt(ex.na)} × ${pct(ex.nb,ex.N)} ≈ **${nfmt1(ex.e)} noticias**. Ese es el valor esperado “por azar”.`);
      passo(`**Comparar.** En la base, las dos aparecen juntas en **${fmt(ex.ob)} noticias**, ${nfmt1(ex.razao)} veces lo esperado.`);
      passo(`**Estandarizar.** El residuo ajustado divide la diferencia entre observado y esperado (${fmt(ex.ob)} − ${nfmt1(ex.e)}) por la variación que suele producir el azar, teniendo en cuenta el tamaño de los grupos: residuo = (observado − esperado) ÷ √(esperado × (1 − ${pct(ex.na,ex.N)}) × (1 − ${pct(ex.nb,ex.N)})) = **${nfmt1(ex.r)}**. Como queda en la misma escala para cualquier par de categorías, permite comparar combinaciones de grupos grandes y pequeños.`);
      passo(`**Leer el número en la regla de abajo.** Cerca de 0: la combinación ocurre tanto como se esperaría. Positivo: ocurre más de lo esperado (atracción). Negativo: menos de lo esperado (rechazo). Los valores más allá de ±1,96 difícilmente son azar (p < 0,05); aquí usamos ±3, más exigente (p < 0,003).`);
      // régua
      const reg=el('div','sin-regua'); const fx=[['≤ −3','mucho menos de lo esperado','mm'],['−3 a −1,96','menos','m'],['−1,96 a +1,96','dentro del azar','z'],['+1,96 a +3','más','p'],['≥ +3','mucho más de lo esperado','pp']];
      fx.forEach(([v,t,c])=>{ const d=el('div','f '+c); d.append(el('b',null,v), el('span',null,t)); reg.append(d); });
      const mk=el('div','marca'); mk.textContent=`exemplo: ${nfmt1(ex.r)} →`; reg.append(mk); box.append(reg);
      sinP(box, `**¿Por qué no basta el porcentaje?** Los grupos grandes aparecen en casi todo. La combinación ${aspas(freq.A)} com ${aspas(freq.B)} é ${freq===porOb[0]? 'la más _frecuente_ del recorte' : 'muy _frecuente_'} (${fmt(freq.ob)} noticias), pero su residuo es ${nfmt1(freq.r).replace("-","−")}: ${Math.abs(freq.r)<1.96? 'ocurre más o menos tanto como se esperaría por el tamaño de los dos grupos, así que es común, pero no característica' : freq.r>0? 'es frecuente y también está por encima de lo esperado' : 'aunque es frecuente, ocurre menos de lo que el tamaño de los grupos haría esperar'}. El residuo descuenta el tamaño de los grupos y responde a otra pregunta: _¿qué distingue a este grupo de los demás?_`);
      sinP(box, `**Precauciones.** El residuo mide asociación en las noticias, no causa. Como una noticia puede tener varias categorías, los conteos son de noticias que tienen las dos categorías. Las combinaciones con menos de 5 noticias no entran.`);
      s.append(box);
      sinTabela(s, 'Combinaciones características: mucho más de lo esperado (residuo ≥ +3)', ['Categoría','Ocurre junto con','Noticias','Esperado','Observado × esperado','Veces','Residuo'],
        top.map(x=>[`${capS(x.A)} (${VR[x.va]})`, `${capS(x.B)} (${VR[x.vb]})`, fmt(x.ob), nfmt1(x.e), oxe(x), nfmt1(x.razao)+'×', nfmt1(x.r)]),
        'Barra oscura: noticias observadas; barra clara: esperadas si no hubiera relación. Cuanto mayor el residuo, más improbable que la combinación sea fruto del azar.', ['','','r','r','','r','r']);
    }
    if(raras.length){
      sinP(s, `También es revelador lo que **casi no ocurre**. Las combinaciones muy por debajo de lo esperado indican distancia entre grupos y agendas: ${listaPt(raras.slice(0,3).map(x=>`${aspas(x.A)} com ${aspas(x.B)} (${fmt(x.ob)} noticias, cuando se esperarían ${nfmt1(x.e)})`))}.`);
      sinTabela(s, 'Combinaciones raras: mucho menos de lo esperado (residuo ≤ −3)', ['Categoría','Ocurre junto con','Noticias','Esperado','Observado × esperado','Veces','Residuo'],
        raras.map(x=>[`${capS(x.A)} (${VR[x.va]})`, `${capS(x.B)} (${VR[x.vb]})`, fmt(x.ob), nfmt1(x.e), oxe(x), nfmt1(x.razao)+'×', nfmt2(x.r).replace(/(,\d)\d$/,'$1')]),
        'Residuo negativo: la combinación aparece menos de lo que el tamaño de los dos grupos haría esperar.', ['','','r','r','','r','r']);
    }
    sinIr(s, [['Movimientos × objetivos (asociación)', ()=>{ st.v='tipomov'; st.x='objetivos'; st.mode='res'; setTab('dist'); }], ['Flujo quién → cómo → por qué', ()=>{ Object.assign(FLOW,{a:'tipomov', b:'matriz', c:'objetivos'}); setTab('flow'); }], ['Tipología de acciones', ()=>{ Object.assign(TYPO,{a:'matriz', b:'derivada'}); setTab('typo'); }]]);
  }
  /* 3. A quem e em que escala */
  { const s=sinSecao(body, ++sec, 'A quién se dirigen y en qué escala', 'Instituciones interpeladas, escala y acciones virtuales.');
    const ti=sinTop(rows,'tipoinst'), es=sinTop(rows,'escala'), vi=sinTop(rows,'virtual'), virt=(vi.find(d=>d.nome==='Sí')||{n:0}).n;
    if(ti.length) sinP(s, `Las acciones se dirigen principalmente a **${capS(ti[0].nome)}** (${pct(ti[0].n,N)})`+(ti[1]? `, a ${aspas(ti[1].nome)} (${pct(ti[1].n,N)})`:'')+(ti[2]? ` y a ${aspas(ti[2].nome)} (${pct(ti[2].n,N)})`:'')+'.'+(es.length? ` La escala predominante es la **${capS(es[0].nome).toLowerCase()}** (${pct(es[0].n,N)})`+(es[1]? `, seguida de la ${capS(es[1].nome).toLowerCase()} (${pct(es[1].n,N)})`:'')+'.' : '')+` ${virt? `${fmt(virt)} noticias (${pct(virt,N)}) registran acciones virtuales.` : 'Ninguna noticia del recorte registra acción virtual.'}`);
    if(ti.length && es.length) achados.push(`El principal interlocutor es ${aspas(ti[0].nome)}, y la escala predominante, la ${capS(es[0].nome).toLowerCase()}.`);
    const g=sinGrade(s); sinBarras(g, 'Institución interpelada', ti.slice(0,8), N); sinBarras(g, 'Escala de la acción', es, N);
    sinIr(s, [['Escala × institución (asociación)', ()=>{ st.v='escala'; st.x='tipoinst'; st.mode='res'; setTab('dist'); }], ['Red de instituciones interpeladas juntas', ()=>{ Object.assign(NET,{v:'tipoinst', n:25, min:3, cor:'com'}); setTab('net'); }]]);
  }
  /* 4. Onde */
  { const s=sinSecao(body, ++sec, 'Dónde', 'Regiones, provincias y localidades; peso de las noticias en relación con la población.');
    const rg=sinTop(rows,'region'), lc=sinTop(rows,'localidad').filter(d=>!/nacional|virtual/i.test(d.nome));
    const popR=new Map(); DEPTS.forEach(f=>{ const v=IND_DEP[f.id], r=f.properties.r; if(v && v.pop && r) popR.set(r,(popR.get(r)||0)+v.pop); }); // população por região a partir dos departamentos (separa o GBA do resto da província de Buenos Aires)
    const popT=d3.sum([...popR.values()]), comReg=d3.sum(rg,d=>d.n);
    const linhas=rg.map(d=>{ const pp=(popR.get(d.nome)||0)/popT, pn=d.n/comReg; return {d, pn, pp, idx: pp? pn/pp : null}; });
    if(rg.length){ const sobre=linhas.filter(l=>l.idx!=null).sort((a,c)=>c.idx-a.idx);
      sinP(s, `La región con más noticias es **${rg[0].nome}**, con ${pct(linhas[0].pn*100,100)} de las noticias con región identificada`+(linhas[0].pp? ` e ${pct(linhas[0].pp*100,100)} de la población del país`:'')+`. En proporción a la población, `+(sobre.length>1? `la región más sobrerrepresentada es **${sobre[0].d.nome}** (${nfmt2(sobre[0].idx)} veces su peso poblacional) y la menos representada es ${sobre[sobre.length-1].d.nome} (${nfmt2(sobre[sobre.length-1].idx)}).` : 'no hay otra región para comparar.')+(lc.length? ` Las localidades más citadas son ${listaPt(lc.slice(0,4).map(d=>`${d.nome.replace(/ \([^)]*\)$/,'')} (${fmt(d.n)})`))}.`:''));
      if(sobre.length>1) achados.push(`${rg[0].nome} concentra ${pct(linhas[0].pn*100,100)} de las noticias con región identificada`+(sobre[0].d.nome===rg[0].nome? ' y es también la región más sobrerrepresentada en relación con la población.' : `; en relación con la población, la región más sobrerrepresentada es ${sobre[0].d.nome}.`)); }
    const g=sinGrade(s); sinMapa(g, rows);
    const col=el('div'); g.append(col);
    if(linhas.length) sinTabela(col, 'Noticias y población por región', ['Región','Noticias','% noticias','% población','Índice'],
      linhas.map(l=>[l.d.nome, fmt(l.d.n), pct(l.pn*100,100), l.pp? pct(l.pp*100,100) : '—', l.idx!=null? nfmt2(l.idx) : '—']),
      'Índice = % de las noticias ÷ % de la población (Censo 2022). Por encima de 1: más noticias de lo que haría esperar el peso poblacional.', ['','r','r','r','r']);
    // destaques por departamento (Poisson)
    const dsP=destaques(mapData(rows,'prov')), dsD=destaques(mapData(rows,'dept'));
    const altos=dsD.feats.filter(x=>x.t==='alto').sort((a,c)=>c.razao-a.razao), altosP=dsP.feats.filter(x=>x.t==='alto').sort((a,c)=>c.razao-a.razao), baixosP=dsP.feats.filter(x=>x.t==='baixo');
    if(altos.length || altosP.length){
      sinP(col, `**Destacados: muy por encima o muy por debajo de lo esperado.** Para cada provincia y departamento, lo _esperado_ es la parte del total de noticias que le correspondería al lugar si las noticias se distribuyeran exactamente como la población (total × población del lugar ÷ población del país, Censo 2022). Se compara con el número _observado_ y se usa la prueba exacta de Poisson para separar las diferencias reales de las variaciones del azar: solo entran lugares con probabilidad menor al 1% (p < 0,01) de tener tantas (o tan pocas) noticias por azar. En este recorte, `+(altosP.length? `las provincias muy por encima de lo esperado son ${listaPt(altosP.slice(0,4).map(x=>`${x.nome} (${fmt(x.O)} noticias, ${nfmt1(x.razao)}× lo esperado)`))}`:'ninguna provincia queda muy por encima de lo esperado')+(baixosP.length? `; quedan muy por debajo ${listaPt(baixosP.slice(0,4).map(x=>x.nome))}`:'')+'. '+(altos.length? `Entre los departamentos, se destacan ${listaPt(altos.slice(0,5).map(x=>`${x.nome} (${nfmt1(x.razao)}×)`))}. Son los lugares que aparecen con contorno naranja en los mapas.` : ''));
      if(altos[0]) achados.push(`El departamento más por encima de lo esperado por la población es ${altos[0].nome} (${nfmt1(altos[0].razao)} vezes).`); }
    sinIr(s, [['Mapa por localidad', ()=>{ Object.assign(mstate,{mode:'one', unit:'loc', measure:'abs', ctx:'', mes:''}); setTab('map'); }], ['Tasa por departamento', ()=>{ Object.assign(mstate,{mode:'one', unit:'dept', measure:'rate', ctx:'', mes:''}); setTab('map'); }], ['Puntos calientes (LISA)', ()=>{ Object.assign(mstate,{mode:'one', unit:'dept', measure:'abs', ctx:'lisa', mes:''}); setTab('map'); }]]);
  }
  /* 5. Quando */
  { const s=sinSecao(body, ++sec, 'Cuándo', 'Ritmo semanal, semanas pico y acontecimientos de 2024.');
    const ms=MES_VALS.map((m,i)=>({m, i, n:counts(rows,'mes').get(i)||0}));
    const nomeMes = x => (x.m.split('· ')[1]||x.m).toLowerCase();
    const msOrd=[...ms].filter(x=>x.n>0).sort((a,c)=>c.n-a.n);
    const intro=el('div'); s.append(intro);
    const sm=sinSemanas(s, rows);
    const picTxt=sm.picos.slice(0,6).map(p=>`semana del ${p.d.toLocaleDateString('es-AR',{day:'2-digit',month:'2-digit'})} (${fmt(p.n)} noticias`+(p.ev.length? `; ${listaPt(p.ev.map(e=>e.curto||e.nome))}`:'')+')');
    const comEv=sm.picos.filter(p=>p.ev.length).length;
    sinP(intro, (msOrd.length? `El mes con más noticias es **${nomeMes(msOrd[0])}** (${fmt(msOrd[0].n)})`+(msOrd[1]? `, seguido de ${nomeMes(msOrd[1])} (${fmt(msOrd[1].n)})`:'')+(msOrd.length>2? `; el de menos noticias es ${nomeMes(msOrd[msOrd.length-1])} (${fmt(msOrd[msOrd.length-1].n)})`:'')+'. ' : '')+
      (sm.picos.length? `Hay **${sm.picos.length} ${sm.picos.length===1? 'semana pico' : 'semanas pico'}**: ${listaPt(picTxt)}. `+(comEv? `${comEv===sm.picos.length? 'Todas coinciden' : `${comEv} de ellas coinciden`} con acontecimientos de 2024, lo que sugiere que la movilización responde al calendario político y a las fechas de lucha.` : 'Ninguna coincide con los acontecimientos marcados, lo que sugiere picos vinculados a conflictos propios del recorte.') : 'No hay semanas pico: la movilización se distribuye sin concentraciones fuera de lo común.'));
    if(sm.picos.length){ const mx=[...sm.picos].sort((a,c)=>c.n-a.n)[0]; achados.push(`La semana más intensa comienza el ${mx.d.toLocaleDateString('es-AR')} (${fmt(mx.n)} noticias${mx.ev.length? ', '+listaPt(mx.ev.map(e=>e.curto||e.nome)) : ''}).`); }
    sinIr(s, [['Serie semanal por tipo de movimiento', ()=>{ SEM.v='tipomov'; setTab('time'); }], ['Serie semanal por objetivos', ()=>{ SEM.v='objetivos'; setTab('time'); }], ['Mapa animado mes a mes', ()=>{ Object.assign(mstate,{mode:'one', unit:'prov', measure:'rate', ctx:'', mes:''}); setTab('map'); }]]);
  }
  /* 6. Com quem */
  { const s=sinSecao(body, ++sec, 'Con quién', 'Articulaciones entre organizaciones que aparecen en las mismas noticias.');
    const iv=VI.nombremov, top=sinTop(rows,'nombremov',40), ids=top.map(d=>d.k), em=new Set(ids), nome=new Map(top.map(d=>[d.k,d.nome])), nN=new Map(top.map(d=>[d.k,d.n]));
    const w=new Map(); rows.forEach(r=>{ const ks=[...new Set(r.v[iv])].filter(k=>em.has(k)).sort((a,c)=>a-c); for(let i=0;i<ks.length;i++) for(let j=i+1;j<ks.length;j++){ const k=ks[i]+'|'+ks[j]; w.set(k,(w.get(k)||0)+1); } });
    const links=[...w].filter(([,x])=>x>=2).map(([k,x])=>{ const [a,c]=k.split('|').map(Number); return {source:a, target:c, w:x}; });
    if(links.length>=3){
      const lv=louvain(ids, links), bt=intermediacao(ids, links), grau=new Map(ids.map(i=>[i,0])); links.forEach(l=>{ grau.set(l.source,grau.get(l.source)+1); grau.set(l.target,grau.get(l.target)+1); });
      const blocos=new Map(); ids.filter(i=>grau.get(i)>0).forEach(i=>{ const c=lv.comm.get(i); if(!blocos.has(c)) blocos.set(c,[]); blocos.get(c).push(i); });
      const bl=[...blocos.values()].filter(m=>m.length>=2).sort((a,c)=>c.length-a.length);
      const forte=[...links].sort((a,c)=>c.w-a.w).slice(0,3), cent=[...ids].sort((a,c)=>grau.get(c)-grau.get(a)||nN.get(c)-nN.get(a)), ponte=[...ids].filter(i=>bt.get(i)>0).sort((a,c)=>bt.get(c)-bt.get(a));
      const sig = k => { const s0=nome.get(k), m=/\(([^)]+)\)\s*$/.exec(s0); return m && m[1].length<=12? m[1] : s0; };
      sinP(s, `Entre las ${fmt(ids.length)} organizaciones más citadas, ${fmt(links.length)} pares aparecen juntos en dos o más noticias. La organización con más aliados es **${sig(cent[0])}** (${fmt(grau.get(cent[0]))} parceiros)`+(cent[1]? `, seguida de ${sig(cent[1])} (${fmt(grau.get(cent[1]))})`:'')+`. Las alianzas más frecuentes son ${listaPt(forte.map(l=>`${sig(l.source)}–${sig(l.target)} (${fmt(l.w)} noticias)`))}.`+(bl.length>1? ` La red se divide en **${bl.length} bloques** de organizaciones que actúan más entre sí; el mayor reúne ${listaPt(bl[0].slice().sort((a,c)=>nN.get(c)-nN.get(a)).slice(0,4).map(sig))}.` : '')+(ponte[0]? ` El principal puente entre bloques (mayor intermediación) es ${sig(ponte[0])}.`:''));
      achados.push(`${sig(cent[0])} es la organización más articulada (${fmt(grau.get(cent[0]))} parceiros)`+(bl.length>1? `, en una red con ${bl.length} blocos.` : '.'));
      const blocoDe=new Map(); bl.forEach((m,i)=>m.forEach(k=>blocoDe.set(k,i+1)));
      sinTabela(s, 'Organizaciones más articuladas', ['Organización','Noticias','Aliados','Intermediación','Bloque'],
        cent.slice(0,8).map(k=>[nome.get(k), fmt(nN.get(k)), fmt(grau.get(k)), nfmt2(bt.get(k)), blocoDe.get(k)? String(blocoDe.get(k)) : '—']),
        'Aliados: organizaciones con 2 o más noticias en común. Intermediación: proporción de los caminos más cortos de la red que pasan por la organización (0 a 1). Bloques: comunidades de Louvain, numeradas de la mayor a la menor.', ['','r','r','r','r']);
    } else sinP(s, 'Hay pocas organizaciones citadas juntas en este recorte para formar una red.');
    sinIr(s, [['Red de organizaciones', ()=>{ Object.assign(NET,{v:'nombremov', n:40, min:2, cor:'com'}); setTab('net'); }], ['Solo las alianzas fuertes', ()=>{ Object.assign(NET,{v:'nombremov', n:40, min:5, cor:'com'}); setTab('net'); }]]);
  }
  /* 7. Estrutura geral (ACM) */
  { const s=sinSecao(body, ++sec, 'La estructura general', 'Análisis de correspondencias múltiples: las grandes oposiciones que organizan las noticias.');
    const vids=ACM_PADRAO.filter(v=>VI[v]!=null && sinTop(rows,v).length>=2);
    const A = vids.length>=3 && N>=40? calcACM(rows, vids, 8) : null;
    if(A && A.coord.length){
      const lado=(d,sinal)=>A.coord.filter(p=>p.k>=0 && Math.sign(p.f[d])===sinal).sort((a,c)=>c.ctr[d]-a.ctr[d]).slice(0,4).map(p=>aspas(p.nome));
      const pc0=A.adjTot? A.adj[0]/A.adjTot : 0, pc1=A.adjTot? A.adj[1]/A.adjTot : 0;
      const n1=lado(0,-1), p1=lado(0,1), n2=lado(1,-1), p2=lado(1,1);
      sinP(s, `Cruzando al mismo tiempo ${listaPt(vids.map(v=>({tipomov:'tipo de movimiento', matriz:'acción matriz', objetivos:'objetivos', direccion:'direccionalidad', escala:'escala', region:'región'}[v]||v)))}, el **primer eje** (${pct(pc0*100,100)} de la inercia corregida) opone ${listaPt(n1)} a ${listaPt(p1)}. El **segundo eje** (${pct(pc1*100,100)}) separa ${listaPt(n2)} de ${listaPt(p2)}. En otras palabras, las noticias se organizan sobre todo por estas oposiciones: las categorías del mismo lado tienden a aparecer en las mismas noticias.`);
      sinTabela(s, null, ['Eje','De un lado','Del otro lado'], [['1 ('+pct(pc0*100,100)+')', listaPt(n1), listaPt(p1)], ['2 ('+pct(pc1*100,100)+')', listaPt(n2), listaPt(p2)]],
        'En cada lado, las cuatro categorías que más contribuyen al eje. La inercia corregida (Benzécri) indica cuánto de la estructura resume cada eje.');
      achados.push(`La principal oposición del recorte separa ${n1.slice(0,2).join(' e ')} de ${p1.slice(0,2).join(' e ')}.`);
    } else sinP(s, 'El recorte es demasiado pequeño u homogéneo para un análisis de correspondencias.');
    sinIr(s, [['Abrir las correspondencias', ()=>{ ACMS.vars=vids.length>=3? vids : ACM_PADRAO.slice(); setTab('acm'); }]]);
  }
  /* 8. Contexto */
  { const s=sinSecao(body, ++sec, 'Frente a qué contexto', 'Relación entre noticias por habitante e indicadores oficiales, por provincia.');
    const md=mapData(rows,'prov');
    const provs=PROVS_FC.filter(f=>f.properties.pi>=0 && POP[f.properties.pi]);
    const cor=Object.keys(CTX_ROT).filter(k=>CTX_LUTAS.has(k)).map(k=>{ const pts=provs.map(f=>({x:(CTX.provincias[f.properties.p]||{})[k], y:md.rate(f.properties.pi)})).filter(p=>p.x!=null && isFinite(p.x));
      if(pts.length<15) return null; const c=correlacoes(pts.map(p=>p.x), pts.map(p=>p.y)); return {k, rot:CTX_ROT[k][0], rho:c.rho, n:pts.length}; }).filter(x=>x && isFinite(x.rho));
    const vis=new Set(); const corU=cor.sort((a,c)=>Math.abs(c.rho)-Math.abs(a.rho)).filter(x=>{ if(vis.has(x.rot)) return false; vis.add(x.rot); return true; });
    const sig=corU.filter(x=>Math.abs(x.rho)>=0.41);
    if(corU.length){
      const pos=sig.filter(x=>x.rho>0), neg=sig.filter(x=>x.rho<0);
      sinP(s, sig.length? `Por provincia, las noticias por 100 mil habitantes ${pos.length? `crecen junto con ${listaPt(pos.slice(0,3).map(x=>`${rotInd(x.rot)} (ρ = ${nfmt2(x.rho)})`))}`:''}${pos.length&&neg.length? ' e ':''}${neg.length? `disminuyen donde es mayor ${listaPt(neg.slice(0,3).map(x=>`${rotInd(x.rot)} (ρ = ${nfmt2(x.rho)})`))}`:''}. Con 24 provincias, solo las correlaciones a partir de ±0,41 son estadísticamente significativas (p < 0,05). Correlación no es causa: indica dónde mirar con más cuidado, no por qué ocurre la movilización.`
        : `Por provincia, ninguno de los indicadores oficiales tiene correlación significativa con las noticias por 100 mil habitantes (todas por debajo de ±0,41, con 24 provincias). La movilización registrada en este recorte no acompaña de forma simple las condiciones medidas por el Censo.`);
      if(sig[0]) achados.push(`El indicador más asociado a las noticias por habitante es ${rotInd(sig[0].rot)} (ρ = ${nfmt2(sig[0].rho)}, relación ${forcaRho(sig[0].rho)} ${sig[0].rho>0? 'positiva' : 'negativa'}).`);
      sinTabela(s, 'Indicadores más asociados a las noticias por habitante (provincias)', ['Indicador','ρ de Spearman','Relación'],
        corU.slice(0,8).map(x=>{ const sp=el('span', 'sin-rho '+(x.rho>0? 'pos':'neg')); const bar=el('i'); bar.style.width=Math.abs(x.rho)*100+'%'; sp.append(bar, document.createTextNode(nfmt2(x.rho))); return [x.rot, sp, `${forcaRho(x.rho)} ${x.rho>0? 'positiva' : 'negativa'}${Math.abs(x.rho)>=0.41? ' · significativa' : ''}`]; }),
        'ρ de Spearman: de −1 a +1, compara el orden de las provincias en los dos indicadores. Positiva: más noticias por habitante donde el indicador es mayor. Solo entran indicadores vinculados a las luchas (los controles demográficos, como conectividad o envejecimiento, quedan fuera). Fuentes: INDEC (Censo 2022), RENABAP (2023), ReNaTEP (2023), Dirección Nacional Electoral (2023) y Registro Nacional de Femicidios (2024).', ['','r','']);
      sinIr(s, [[`Abrir: ${corU[0].rot}`, ()=>{ CTXV.nivel='prov'; CTXV.x=corU[0].k; setTab('ctx'); }], ['Privación × protestas (mapa bivariado)', ()=>{ Object.assign(mstate,{mode:'one', unit:'dept', ctx:'biv_ipmh', mes:''}); setTab('map'); }]]);
    }
  }
  /* 9. Imprensa */
  { const s=sinSecao(body, ++sec, 'Quién cuenta', 'Medios de prensa y concentración de la cobertura.');
    const fo=sinTop(rows,'fuente'), tot=d3.sum(fo,d=>d.n);
    if(fo.length){ const asc=fo.map(d=>d.n).sort(d3.ascending), n=asc.length; let acc=0, area=0, prev=0; asc.forEach(x=>{ acc+=x; area+=(prev+acc/tot)/2/n; prev=acc/tot; }); const gini=1-2*area;
      const t10=d3.sum(fo.slice(0,10),d=>d.n)/tot;
      sinP(s, `Las noticias provienen de ${fmt(fo.length)} medios. Los que más aparecen son ${listaPt(fo.slice(0,3).map(d=>`**${d.nome}** (${pct(d.n,tot)})`))}; los diez mayores suman ${pct(t10*100,100)} de las noticias, y el índice de Gini de la cobertura es ${nfmt2(gini)} (0 = todos los medios con el mismo peso; 1 = un solo medio). `+(gini>0.6? 'La cobertura está concentrada: la imagen de la movilización depende mucho de pocos diarios, sobre todo los de circulación nacional, y las acciones en lugares menos cubiertos pueden estar subregistradas.' : 'La cobertura está relativamente diversificada, lo que da más confianza a la distribución observada.'));
      achados.push(`La cobertura proviene de ${fmt(fo.length)} medios, con Gini de ${nfmt2(gini)}: ${gini>0.6? 'concentrada en pocos diarios' : 'relativamente diversificada'}.`);
      const g=sinGrade(s); sinBarras(g, 'Medios más frecuentes', fo.slice(0,8), tot, 'Porcentajes sobre las noticias con fuente identificada.'); }
    sinIr(s, [['Abrir la pestaña Prensa', ()=>setTab('imp')]]);
  }
  /* considerações */
  { const s=sinSecao(body, ++sec, 'Para seguir la discusión', null);
    sinP(s, 'Los resultados de arriba describen **lo que registró la prensa**, y no toda la movilización ocurrida. Tres preguntas ayudan a llevar la síntesis más lejos:');
    const ul=el('ul','sin-perg'); [
      '¿Los sujetos y repertorios más frecuentes coinciden con los más característicos de cada región (secciones 2 y 4)? Donde no coinciden, hay una especificidad territorial que explicar.',
      '¿Las semanas pico responden al calendario nacional (paros, marchas federales, fechas de lucha) o a conflictos locales? Compare la serie semanal con las fichas de las organizaciones involucradas.',
      '¿Los lugares muy por encima o muy por debajo de lo esperado por la población reflejan la movilización o la cobertura? Contraste el mapa con la pestaña Prensa antes de concluir.'
    ].forEach(t=>ul.append(el('li',null,t))); s.append(ul);
    const nm=el('details','sin-metodo'); nm.append(el('summary',null,'Nota metodológica'));
    sinP(nm, `Base: noticias de acciones colectivas en la Argentina en 2024, leídas y codificadas por investigadores; ${st.rep? 'incluye noticias repetidas' : 'sin noticias repetidas'}. Recorte: ${filtros||'toda la base'}. Una noticia puede tener varias categorías en una misma variable, por eso los porcentajes pueden sumar más de 100%. Combinaciones características: residuos ajustados de Haberman sobre la tabla de coocurrencia (≥ 3; mínimo de 5 noticias). Peso poblacional: Censo 2022 (INDEC). Destacados: número de noticias de cada provincia o departamento comparado con lo esperado por la población, con prueba exacta de Poisson (p < 0,01; mínimo de 3 noticias para “por encima”). Semanas pico: por encima de Q3 + 1,5 × rango intercuartil. Red: 40 organizaciones más citadas, vínculos con 2 o más noticias en común, comunidades de Louvain e intermediación de Brandes. Correspondencias: ACM con codificación difusa y corrección de Benzécri, 8 categorías más frecuentes por variable. Contexto: correlación de Spearman entre noticias por 100 mil habitantes y cada indicador, en las 24 provincias. Los textos se generan automáticamente con estas reglas y deben leerse como punto de partida para la interpretación.`);
    s.append(nm);
  }
  // resumo no topo
  if(achados.length){ resumo.append(el('h4',null,'En síntesis')); const ol=el('ol'); achados.forEach(t=>{ const li=el('li'); sinP(li,t); ol.append(li); }); resumo.append(ol); }
}
EXTRA.sin = renderSintese;

$('sinPrint').onclick=()=>{ document.querySelectorAll('.sin-metodo').forEach(d=>{ d.open=true; }); document.body.classList.add('imprime-sin'); const fim=()=>{ document.body.classList.remove('imprime-sin'); window.removeEventListener('afterprint',fim); }; window.addEventListener('afterprint',fim); window.print(); setTimeout(fim, 1500); };

// sínteses prontas: recortes aplicados à aba
(()=>{ const rec = pares => ()=>{ st.f={}; pares.forEach(([vid,nome])=>{ const k=idxDe(vid,nome); if(k>=0) (st.f[vid]||(st.f[vid]=new Set())).add(k); }); st.page=40; };
  prontos('sinPresets', 'Síntesis listas:', [
    ['Toda la base', 'Quita todos los filtros', ()=>{ st.f={}; }],
    ['Movimientos sindicales', 'Solo noticias con movimientos sindicales', rec([['tipomov','Movimientos sindicales']])],
    ['Economía popular y desocupados', 'Economía social y solidaria o trabajadores desocupados', rec([['tipomov','Movimientos de Economía Social y Solidaria'],['tipomov','Movimientos de trabajadores Desocupados']])],
    ['Feministas y LGTTBIQ+', 'Movimientos de mujeres/feministas o LGTTBIQ+', rec([['tipomov','Movimientos de mujeres/feministas'],['tipomov','Movimientos de LGTTBIQ+']])],
    ['Educación', 'Acciones con objetivos educativos', rec([['objetivos','Objetivos educativos']])],
    ['Vivienda y hábitat', 'Objetivos de vivienda y hábitat', rec([['objetivos','Objetivos por la vivienda y hábitat']])],
    ['Derechos humanos', 'Objetivos en torno a los derechos humanos', rec([['objetivos','Objetivos en torno a Derechos Humanos']])],
    ['Gran Buenos Aires', 'Región metropolitana', rec([['region','Gran Buenos Aires']])],
    ['Patagonia', 'Región patagónica', rec([['region','Patagonia']])],
    ['Norte (NOA y NEA)', 'Noroeste y Noreste', rec([['region','Noroeste (NOA)'],['region','Noreste (NEA)']])],
    ['Acciones defensivas', 'Direccionalidad defensiva', rec([['direccion','Defensiva']])],
    ['Escala nacional', 'Acciones de escala nacional', rec([['escala','Nacional']])],
  ]); })();
