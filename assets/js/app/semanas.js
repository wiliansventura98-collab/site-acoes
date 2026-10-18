/*
 * Semana a semana e acontecimentos
 * Série semanal em áreas empilhadas (data de início da ação; na falta, data da notícia) por categorias de uma
 * variável, com os acontecimentos políticos de 2024 marcados (pipeline/referencias/acontecimentos_2024.csv).
 * Os acontecimentos também aparecem no gráfico mensal e no calendário diário.
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

const EVENTOS = ((window.__GEO__||{}).eventos||[]).map((e,i)=>({ ...e, i:i+1, d:new Date(e.data+'T12:00:00') }));
const SEM = { v:'tipomov', n:6, ev:true };
try{ Object.assign(SEM, JSON.parse(localStorage.getItem('as24sem')||'{}')); }catch(e){}
fillSelect($('semVar'), false);
$('semVar').onchange=e=>{ SEM.v=e.target.value; render(); };
$('semN').onchange=e=>{ SEM.n=+e.target.value; render(); };
$('semEv').onchange=e=>{ SEM.ev=e.target.checked; render(); };
const COR_EV = { trabalho:'#c45a00', educação:'#2569ad', legislativo:'#13294b', calendário:'#7c8aa0' };

const _cvS = document.createElement('canvas').getContext('2d');
const dataDe = r => { const s=r.sort; if(!s || s==='00000000' || s.slice(0,4)!=='2024') return null; return new Date(+s.slice(0,4), +s.slice(4,6)-1, +s.slice(6,8)); };

function renderSemanas(b){
  if(VI[SEM.v]==null || SEM.v==='mes') SEM.v='tipomov';
  try{ localStorage.setItem('as24sem', JSON.stringify(SEM)); }catch(e){}
  $('semVar').value=SEM.v; $('semN').value=String(SEM.n); $('semEv').checked=SEM.ev;
  const box=$('semChart'); box.querySelectorAll('svg,.legend').forEach(s=>s.remove());
  if(!HAS_D3) return;
  const iv=VI[SEM.v], v=VARS[iv], rows=b.filter(r=>match(r,null)).filter(r=>dataDe(r));
  const tot=counts(rows, SEM.v), top=order(SEM.v, tot).filter(k=>!ehSemInfo(v.values[k])).sort((a,q)=>tot.get(q)-tot.get(a)).slice(0, SEM.n);
  const semanas=d3.timeMondays(d3.timeMonday.floor(new Date(2024,0,1)), new Date(2025,0,1));
  const idx=new Map(semanas.map((d,i)=>[+d,i]));
  const series=[...top, 'outros'], M=semanas.map(d=>({d, ...Object.fromEntries(series.map(k=>[k,0]))}));
  rows.forEach(r=>{ const i=idx.get(+d3.timeMonday.floor(dataDe(r))); if(i==null) return; const ks=r.v[iv]; const meus=ks.filter(k=>top.includes(k));
    if(meus.length) meus.forEach(k=>{ M[i][k]+=1/meus.length; }); else M[i].outros+=1; });  // cada notícia soma 1 na semana, repartida entre suas categorias
  const stack=d3.stack().keys(series).order(d3.stackOrderNone)(M);
  const W=Math.max(320, box.clientWidth), H=Math.round(Math.max(300, Math.min(420, W*0.36))), m={t:SEM.ev? 84 : 12, r:12, b:26, l:36};
  const x=d3.scaleTime().domain([new Date(2024,0,1), new Date(2024,11,31)]).range([m.l, W-m.r]);
  const y=d3.scaleLinear().domain([0, d3.max(M, d=>d3.sum(series, k=>d[k]))||1]).nice().range([H-m.b, m.t]);
  const svg=d3.select(box).append('svg').attr('viewBox',`0 0 ${W} ${H}`).attr('width','100%').attr('role','img').attr('aria-label','Notícias por semana em 2024');
  svg.append('g').attr('class','grid').selectAll('line').data(y.ticks(4)).join('line').attr('x1',m.l).attr('x2',W-m.r).attr('y1',d=>y(d)).attr('y2',d=>y(d));
  svg.append('g').attr('class','axis').attr('transform',`translate(${m.l},0)`).call(d3.axisLeft(y).ticks(4).tickSize(0).tickPadding(6).tickFormat(d=>fmt(d))).call(g=>g.select('.domain').remove());
  svg.append('g').attr('class','axis').attr('transform',`translate(0,${H-m.b})`).call(d3.axisBottom(x).ticks(d3.timeMonth.every(1)).tickSize(0).tickPadding(6).tickFormat(d=>MES_ABBR[d.getMonth()]));
  const cor=k=> k==='outros'? COR_OUTROS : PALETA[top.indexOf(k) % PALETA.length];
  const area=d3.area().x(d=>x(d.data.d)+((x(d3.timeDay.offset(d.data.d,7))-x(d.data.d))/2)).y0(d=>y(d[0])).y1(d=>y(d[1])).curve(d3.curveMonotoneX);
  const tip=tipFor(box);
  svg.append('g').selectAll('path').data(stack).join('path').attr('d',area).attr('fill',s=>cor(s.key)).attr('fill-opacity',.88).attr('stroke','#fff').attr('stroke-width',.6);
  if(SEM.ev){
    const ge=svg.append('g');
    // rótulos curtos em duas alturas alternadas, para não se sobreporem
    const ultimo=[-1e9,-1e9,-1e9];
    _cvS.font='700 11px Urbanist, Arial, sans-serif';
    EVENTOS.forEach(e=>{ const xx=x(e.d), cor=COR_EV[e.tipo]||'#13294b', w=_cvS.measureText(e.curto||'').width+26;
      let fila=ultimo.findIndex(u=>xx-10>u); if(fila<0) fila=ultimo.indexOf(Math.min(...ultimo)); ultimo[fila]=xx+w;
      const yc = 12 + fila*22;
      ge.append('line').attr('x1',xx).attr('x2',xx).attr('y1',yc+8).attr('y2',H-m.b).attr('stroke',cor).attr('stroke-width',1.2).attr('stroke-dasharray','3 3');
      ge.append('circle').attr('cx',xx).attr('cy',yc).attr('r',8).attr('fill',cor);
      ge.append('text').attr('x',xx).attr('y',yc+3.5).attr('text-anchor','middle').attr('font-size',9.5).attr('font-weight',800).attr('fill','#fff').text(e.i);
      ge.append('text').attr('x',xx+11).attr('y',yc+4).attr('font-size',11).attr('font-weight',700).attr('fill',cor).attr('paint-order','stroke').attr('stroke','#fff').attr('stroke-width',3).text(e.curto||''); });
  }
  // camada de interação por semana
  const bw=(W-m.l-m.r)/semanas.length;
  svg.append('g').selectAll('rect').data(M).join('rect').attr('x',d=>x(d.d)).attr('width',bw).attr('y',m.t).attr('height',H-m.b-m.t).attr('fill','transparent')
    .on('mousemove',(ev,d)=>{ const fim=d3.timeDay.offset(d.d,6); const evs=EVENTOS.filter(e=>e.d>=d.d && e.d<=d3.timeDay.offset(fim,1));
      tip.show(ev, `Semana de ${d.d.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})} a ${fim.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}`,
        [`${fmt(Math.round(d3.sum(series,k=>d[k])))} notícias`, ...series.filter(k=>d[k]>0).sort((a,q)=>d[q]-d[a]).slice(0,4).map(k=>`${k==='outros'? 'Outras categorias' : v.values[k]}: ${d[k].toLocaleString('pt-BR',{maximumFractionDigits:1})}`), ...evs.map(e=>`● ${e.i}. ${e.nome}`)]); })
    .on('mouseleave',()=>tip.hide());
  const lg=el('div','legend'); series.forEach(k=>{ const s=el('span'); const i=el('i','sw'); i.style.background=cor(k); s.append(i, document.createTextNode(k==='outros'? 'Outras categorias e sem informação' : v.values[k])); lg.append(s); }); box.append(lg);
  $('semMeta').textContent=`${fmt(rows.length)} notícias com data em 2024`;
  $('semNote').textContent=`Notícias por semana (segunda a domingo) pela data de início da ação ou, na falta dela, pela data da notícia, empilhadas pelas ${top.length} categorias mais frequentes de “${v.label}”. Cada notícia soma 1 na sua semana, repartida igualmente quando tem várias categorias. Os números no alto marcam acontecimentos de 2024; a lista abaixo traz as datas e as fontes.`;
  // cartões: notícias na semana do acontecimento comparadas à semana típica (mediana do ano)
  const totSem=M.map(d=>d3.sum(series,k=>d[k])), mediana=d3.median(totSem)||1;
  const ol=$('semEventos'); ol.textContent='';
  EVENTOS.forEach(e=>{ const seg=d3.timeMonday.floor(e.d), i=idx.get(+seg), n=i!=null? Math.round(totSem[i]) : 0, razao=n/mediana;
    const daSemana=rows.filter(r=>+d3.timeMonday.floor(dataDe(r))===+seg);
    const cat=counts(daSemana, SEM.v), topCat=[...cat].filter(([k])=>!ehSemInfo(v.values[k])).sort((a,q)=>q[1]-a[1])[0];
    const li=el('li','ev-card'); li.style.borderTopColor=COR_EV[e.tipo]||'#13294b';
    const cab=el('div','ev-cab'); const bola=el('i','evb',String(e.i)); bola.style.background=COR_EV[e.tipo]||'#13294b';
    cab.append(bola, el('b',null, e.d.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})), el('span','ev-tipo', e.tipo)); li.append(cab);
    li.append(el('p','ev-nome', e.nome));
    const num=el('div','ev-num'); num.append(el('strong',null,fmt(n)), el('span',null,` notícias na semana · ${razao>=1.05? razao.toLocaleString('pt-BR',{maximumFractionDigits:1})+'× uma semana típica' : razao<=0.95? 'abaixo de uma semana típica' : 'como uma semana típica'} (${mediana.toLocaleString('pt-BR',{maximumFractionDigits:0})})`)); li.append(num);
    if(topCat) li.append(el('p','meta',`Mais citado na semana em “${v.label}”: ${v.values[topCat[0]]} (${fmt(topCat[1])})`));
    if(daSemana.length){ const det=el('details'); det.append(el('summary',null,'Ver as notícias da semana')); const ul=el('ul');
      daSemana.slice().sort((a,q)=>a.sort.localeCompare(q.sort)).slice(0,10).forEach(r=>{ const lii=el('li'); const a=el('a',null,r.titulo); a.href=r.link; a.target='_blank'; a.rel='noopener'; lii.append(a); ul.append(lii); });
      if(daSemana.length>10) ul.append(el('li','meta',`e mais ${fmt(daSemana.length-10)}.`)); det.append(ul); li.append(det); }
    if(/^https?:/.test(e.fonte)){ const a=el('a','ev-fonte','Fonte da data'); a.href=e.fonte; a.target='_blank'; a.rel='noopener'; li.append(a); } else li.append(el('span','meta','Data fixa do calendário anual.'));
    ol.append(li); });
}

// acontecimentos também no gráfico mensal e no calendário
const _renderTimeOrig = renderTime;
renderTime = function(b){
  _renderTimeOrig(b);
  if(!HAS_D3) return;
  const svgM=d3.select('#timeMain svg'); if(!svgM.empty()){
    const vb=svgM.attr('viewBox').split(' ').map(Number), W=vb[2], ml=34, mr=6, band=(W-ml-mr)/12;
    EVENTOS.forEach(e=>{ const mi=e.d.getMonth(), frac=(e.d.getDate()-1)/new Date(2024,mi+1,0).getDate(); const xx=ml+band*(mi+0.11+0.78*frac);
      svgM.append('circle').attr('cx',xx).attr('cy',11).attr('r',6.5).attr('fill',COR_EV[e.tipo]||'#13294b').append('title').text(`${e.d.toLocaleDateString('pt-BR')}: ${e.nome}`);
      svgM.append('text').attr('x',xx).attr('y',14).attr('text-anchor','middle').attr('font-size',8).attr('font-weight',800).attr('fill','#fff').attr('pointer-events','none').text(e.i); });
  }
  const svgC=d3.select('#calChart svg'); if(!svgC.empty()){
    const vb=svgC.attr('viewBox').split(' ').map(Number), W=vb[2], left=34, top=20, ini=new Date(2024,0,1), semanas=d3.timeWeek.count(ini, new Date(2024,11,31))+1;
    const cs=Math.max(6, Math.min(18, Math.floor((W-left-8)/semanas)));
    EVENTOS.forEach(e=>{ svgC.append('rect').attr('x',left+d3.timeWeek.count(ini,e.d)*cs-1).attr('y',top+e.d.getDay()*cs-1).attr('width',cs).attr('height',cs).attr('rx',3)
      .attr('fill','none').attr('stroke',COR_EV[e.tipo]||'#13294b').attr('stroke-width',2).append('title').text(`${e.i}. ${e.nome}`); });
  }
  renderSemanas(b);
};
