/*
 * Fluxos (diagrama de Sankey)
 * Mostra como as notícias se distribuem entre as categorias de duas ou três variáveis encadeadas
 * (por exemplo: tipo de movimento → ação matriz → objetivos).
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

// Paleta categórica compartilhada (azul-celeste e ouro do Sol de Maio como âncoras)
const PALETA = ['#13294b','#f2a900','#6cace4','#9c3d0f','#2f8a74','#c0392b','#6d5aa8','#b07d2b','#3c6e47','#d46f9a','#36506b','#8a9a2b','#7c4a8a','#c96a1b'];
const COR_OUTROS = '#a3a9b0', COR_SEM = '#cfd3d8';
const ehSemInfo = s => /no informa|^ni$|no indica/i.test(s);

const FLOW = { a:'tipomov', b:'matriz', c:'objetivos', n:8 };
try{ Object.assign(FLOW, JSON.parse(localStorage.getItem('as24f')||'{}')); }catch(e){}
const fsave = () => { try{ localStorage.setItem('as24f', JSON.stringify(FLOW)); }catch(e){} };
fillSelect($('flowA'), false); fillSelect($('flowB'), false); fillSelect($('flowC'), true);
$('flowA').onchange=e=>{ FLOW.a=e.target.value; render(); };
$('flowB').onchange=e=>{ FLOW.b=e.target.value; render(); };
$('flowC').onchange=e=>{ FLOW.c=e.target.value; render(); };
$('flowN').onchange=e=>{ FLOW.n=+e.target.value; render(); };

/* Distribui o peso 1 de cada notícia entre as categorias de cada etapa (contagem fracionada),
   para que todas as etapas somem o total de notícias do recorte. */
function categoriasEtapa(rows, vid, n){
  const c = counts(rows, vid), vals = VARS[VI[vid]].values;
  const top = [...c.keys()].filter(k=>!ehSemInfo(vals[k])).sort((a,b)=>c.get(b)-c.get(a)).slice(0,n);
  const set = new Set(top);
  return { top, of: r => { const v=r.v[VI[vid]]; if(!v.length || v.every(k=>ehSemInfo(vals[k]))) return ['sem'];
    return [...new Set(v.filter(k=>!ehSemInfo(vals[k])).map(k=> set.has(k)? k : 'out'))]; } };
}

function renderFlow(b){
  fsave();
  $('flowA').value=FLOW.a; $('flowB').value=FLOW.b; $('flowC').value=FLOW.c||''; $('flowN').value=String(FLOW.n);
  const box=$('flowChart'); box.querySelectorAll('svg').forEach(s=>s.remove());
  if(!HAS_D3 || !d3.sankey){ $('flowNote').textContent='Não foi possível carregar a biblioteca do diagrama.'; return; }
  const stages = [...new Set([FLOW.a, FLOW.b, FLOW.c].filter(Boolean))];
  if(stages.length<2){ $('flowNote').textContent='Escolha ao menos duas variáveis diferentes.'; return; }
  const rows = b.filter(r=>match(r,null));
  const cats = stages.map(vid=>categoriasEtapa(rows, vid, FLOW.n));
  const nodes = new Map(), links = new Map();
  const nid = (s,k) => `${s}|${k}`;
  const label = (s,k) => k==='out'? 'Outras categorias' : k==='sem'? 'Sem informação' : VARS[VI[stages[s]]].values[k];
  stages.forEach((vid,s)=>{ cats[s].top.forEach((k,i)=>nodes.set(nid(s,k),{id:nid(s,k), s, k, name:label(s,k), color:PALETA[i%PALETA.length]})); });
  rows.forEach(r=>{
    const per = cats.map(c=>c.of(r));
    per.forEach((ks,s)=>ks.forEach(k=>{ if(!nodes.has(nid(s,k))) nodes.set(nid(s,k),{id:nid(s,k), s, k, name:label(s,k), color: k==='out'? COR_OUTROS : COR_SEM}); }));
    for(let s=0; s<per.length-1; s++){
      const w = 1/(per[s].length*per[s+1].length);
      per[s].forEach(a=>per[s+1].forEach(c=>{ const key=nid(s,a)+'>'+nid(s+1,c); links.set(key,(links.get(key)||0)+w); }));
    }
  });
  const nodeArr=[...nodes.values()], linkArr=[...links].map(([k,v])=>{ const [s,t]=k.split('>'); return {source:s, target:t, value:v}; });
  const W=Math.max(320, box.clientWidth), perStage=d3.max(stages.map((_,s)=>nodeArr.filter(n=>n.s===s).length));
  const H=Math.max(380, perStage*44);
  const narrow = W<640;
  const sankey = d3.sankey().nodeId(d=>d.id).nodeWidth(14).nodePadding(narrow? 8 : 12).nodeAlign(d3.sankeyJustify)
    .nodeSort((a,b)=> (a.k==='out'||a.k==='sem') - (b.k==='out'||b.k==='sem') || b.value-a.value)
    .extent([[narrow? 4 : 8, 8],[W-(narrow? 4 : 8), H-8]]);
  const g = sankey({nodes: nodeArr.map(d=>({...d})), links: linkArr.map(d=>({...d}))});
  const svg=d3.select(box).append('svg').attr('viewBox',`0 0 ${W} ${H}`).attr('width','100%').attr('role','img').attr('aria-label','Diagrama de fluxos entre variáveis');
  const tip=tipFor(box), N=rows.length;
  const aprox = v => v>=10? fmt(Math.round(v)) : v.toLocaleString('pt-BR',{maximumFractionDigits:1});
  const lk = svg.append('g').attr('fill','none').selectAll('path').data(g.links).join('path')
    .attr('d', d3.sankeyLinkHorizontal()).attr('stroke', d=>d.source.color).attr('stroke-opacity',.32).attr('stroke-width', d=>Math.max(1,d.width))
    .on('mousemove',(e,d)=>{ d3.select(e.currentTarget).attr('stroke-opacity',.6); tip.show(e, `${d.source.name} → ${d.target.name}`, [`≈ ${aprox(d.value)} notícias (${pct(d.value,N)} do recorte)`]); })
    .on('mouseleave',e=>{ d3.select(e.currentTarget).attr('stroke-opacity',.32); tip.hide(); });
  const nd = svg.append('g').selectAll('g').data(g.nodes).join('g');
  nd.append('rect').attr('x',d=>d.x0).attr('y',d=>d.y0).attr('width',d=>d.x1-d.x0).attr('height',d=>Math.max(1,d.y1-d.y0)).attr('fill',d=>d.color).attr('rx',2)
    .style('cursor', d=> (d.k==='out'||d.k==='sem')? 'default' : 'pointer')
    .on('mousemove',(e,d)=>{ lk.attr('stroke-opacity', l=> l.source===d||l.target===d? .62 : .12); tip.show(e, d.name, [`≈ ${aprox(d.value)} notícias (${pct(d.value,N)} do recorte)`, VARS[VI[stages[d.s]]].label]); })
    .on('mouseleave',()=>{ lk.attr('stroke-opacity',.32); tip.hide(); })
    .on('click',(e,d)=>{ if(d.k!=='out' && d.k!=='sem') toggleFilter(stages[d.s], d.k); });
  const ultimo = stages.length-1;
  nd.append('text').attr('class','sk-label')
    .attr('x', d=> d.s===ultimo? d.x0-6 : d.x1+6).attr('y', d=>(d.y0+d.y1)/2).attr('dy','0.35em')
    .attr('text-anchor', d=> d.s===ultimo? 'end' : 'start')
    .text(d=>{ const max = narrow? 22 : 38; const n = d.name.length>max? d.name.slice(0,max-1)+'…' : d.name; return (d.y1-d.y0)>=9? `${n} · ${aprox(d.value)}` : ''; });
  // títulos das etapas
  stages.forEach((vid,s)=>{ const xs=g.nodes.filter(n=>n.s===s); if(!xs.length) return; const x=xs[0].x0;
    svg.append('text').attr('class','sk-stage').attr('x', s===ultimo? x+14 : x).attr('y', 0).attr('dy','-0.2em').attr('text-anchor', s===ultimo? 'end':'start').text(VARS[VI[vid]].label); });
  svg.attr('viewBox',`0 -18 ${W} ${H+18}`);
  $('flowMeta').textContent = `${fmt(N)} notícias no recorte`;
  $('flowNote').textContent = `Cada faixa liga categorias que aparecem na mesma notícia; a espessura é proporcional ao número de notícias. Contagem fracionada: uma notícia com 2 categorias numa etapa e 3 na seguinte reparte seu peso igualmente entre as 6 combinações, de modo que cada etapa soma o total do recorte. “Outras categorias” reúne as que estão fora das ${FLOW.n} principais; “Sem informação” reúne notícias sem valor ou com NI. Clique numa categoria para filtrar a base.`;
}
