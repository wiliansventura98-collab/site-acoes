/*
 * Redes de coocorrência
 * Liga categorias que aparecem juntas nas mesmas notícias. Na rede de movimentos, revela as
 * articulações entre organizações que protagonizam ações em comum.
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

const NET = { v:'nombremov', n:40, min:2 };
try{ Object.assign(NET, JSON.parse(localStorage.getItem('as24n')||'{}')); }catch(e){}
fillSelect($('netVar'), false);
$('netVar').onchange=e=>{ NET.v=e.target.value; render(); };
$('netN').onchange=e=>{ NET.n=+e.target.value; render(); };
$('netMin').onchange=e=>{ NET.min=+e.target.value; render(); };

function renderNet(b){
  try{ localStorage.setItem('as24n', JSON.stringify(NET)); }catch(e){}
  $('netVar').value=NET.v; $('netN').value=String(NET.n); $('netMin').value=String(NET.min);
  const box=$('netChart'); box.querySelectorAll('svg,.net-legend').forEach(s=>s.remove());
  if(!HAS_D3) return;
  const rows=b.filter(r=>match(r,null)), iv=VI[NET.v], vals=VARS[iv].values;
  const c=counts(rows, NET.v);
  const top=[...c.keys()].filter(k=>!ehSemInfo(vals[k])).sort((a,q)=>c.get(q)-c.get(a)).slice(0,NET.n), set=new Set(top);
  const pares=new Map();
  rows.forEach(r=>{ const ks=[...new Set(r.v[iv].filter(k=>set.has(k)))].sort((a,q)=>a-q);
    for(let i=0;i<ks.length;i++) for(let j=i+1;j<ks.length;j++){ const key=ks[i]+'|'+ks[j]; pares.set(key,(pares.get(key)||0)+1); } });
  const links=[...pares].filter(([,w])=>w>=NET.min).map(([k,w])=>{ const [s,t]=k.split('|').map(Number); return {source:s, target:t, w}; });
  // cor: para movimentos, o tipo de movimento predominante em suas notícias
  let corDe = () => PALETA[0], legenda=[];
  if(NET.v==='nombremov'){
    const it=VI.tipomov, tv=VARS[it].values, dom=new Map();
    rows.forEach(r=>r.v[iv].forEach(k=>{ if(!set.has(k)) return; const m=dom.get(k)||new Map(); r.v[it].forEach(t=>m.set(t,(m.get(t)||0)+1)); dom.set(k,m); }));
    const tipoDe=k=>{ const m=dom.get(k); if(!m||!m.size) return null; return [...m].sort((a,q)=>q[1]-a[1])[0][0]; };
    const usados=[...new Set(top.map(tipoDe))].filter(t=>t!=null).sort((a,q)=>top.filter(k=>tipoDe(k)===q).length-top.filter(k=>tipoDe(k)===a).length);
    const corT=new Map(usados.map((t,i)=>[t, i<PALETA.length-1? PALETA[i] : COR_OUTROS]));
    corDe = k => corT.get(tipoDe(k)) || COR_OUTROS;
    legenda = usados.map(t=>[corT.get(t), tv[t]]);
  }
  const W=Math.max(320, box.clientWidth), H=Math.round(Math.max(460, Math.min(720, W*0.66)));
  const r=d3.scaleSqrt().domain([0, d3.max(top,k=>c.get(k))||1]).range([4, W<640? 16 : 24]);
  const nodes=top.map(k=>({id:k, n:c.get(k), name:vals[k]}));
  const grau=new Map(top.map(k=>[k,0])); links.forEach(l=>{ grau.set(l.source,grau.get(l.source)+l.w); grau.set(l.target,grau.get(l.target)+l.w); });
  const wmax=d3.max(links,l=>l.w)||1;
  const sim=d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links.map(l=>({...l}))).id(d=>d.id).distance(l=>60+90*(1-l.w/wmax)).strength(l=>0.15+0.5*l.w/wmax))
    .force('charge', d3.forceManyBody().strength(-160))
    .force('collide', d3.forceCollide(d=>r(d.n)+3))
    .force('x', d3.forceX(W/2).strength(0.06)).force('y', d3.forceY(H/2).strength(0.09)).stop();
  for(let i=0;i<450;i++) sim.tick();
  const L=sim.force('link').links();
  const [xmin,xmax]=d3.extent(nodes,d=>d.x), [ymin,ymax]=d3.extent(nodes,d=>d.y), pad=40;
  const sx=d3.scaleLinear().domain([xmin,xmax]).range([pad, W-pad]), sy=d3.scaleLinear().domain([ymin,ymax]).range([pad, H-pad]);
  const svg=d3.select(box).append('svg').attr('viewBox',`0 0 ${W} ${H}`).attr('width','100%').attr('role','img').attr('aria-label','Rede de coocorrência');
  const tip=tipFor(box);
  const wl=d3.scaleLinear().domain([1,wmax]).range([0.8,6]);
  const ls=svg.append('g').selectAll('line').data(L).join('line').attr('class','net-link')
    .attr('x1',d=>sx(d.source.x)).attr('y1',d=>sy(d.source.y)).attr('x2',d=>sx(d.target.x)).attr('y2',d=>sy(d.target.y)).attr('stroke-width',d=>wl(d.w));
  const viz=new Map(top.map(k=>[k,new Set([k])])); L.forEach(l=>{ viz.get(l.source.id).add(l.target.id); viz.get(l.target.id).add(l.source.id); });
  const ns=svg.append('g').selectAll('circle').data(nodes).join('circle').attr('cx',d=>sx(d.x)).attr('cy',d=>sy(d.y)).attr('r',d=>r(d.n))
    .attr('fill',d=>corDe(d.id)).attr('class','net-node').style('cursor','pointer')
    .on('mousemove',(e,d)=>{ const V=viz.get(d.id); ns.attr('opacity',x=>V.has(x.id)?1:.18); ls.attr('opacity',l=>l.source.id===d.id||l.target.id===d.id?1:.06); lb.attr('opacity',x=>V.has(x.id)?1:.15);
      const parceiros=L.filter(l=>l.source.id===d.id||l.target.id===d.id).map(l=>[l.source.id===d.id? l.target.name : l.source.name, l.w]).sort((a,q)=>q[1]-a[1]).slice(0,4);
      tip.show(e, d.name, [`${fmt(d.n)} notícias`, ...parceiros.map(([n,w])=>`com ${n.length>40? n.slice(0,39)+'…' : n}: ${w}`)]); })
    .on('mouseleave',()=>{ ns.attr('opacity',1); ls.attr('opacity',null); lb.attr('opacity',null); tip.hide(); })
    .on('click',(e,d)=>toggleFilter(NET.v, d.id));
  const rotulados=new Set([...nodes].sort((a,q)=>(grau.get(q.id)+q.n)-(grau.get(a.id)+a.n)).slice(0, W<640? 10 : 18).map(d=>d.id));
  const curto = s => { const m=s.match(/\(([^()]{2,14})\)\s*$/); return m? m[1] : (s.length>26? s.slice(0,25)+'…' : s); };
  const lb=svg.append('g').selectAll('text').data(nodes.filter(d=>rotulados.has(d.id))).join('text').attr('class','net-label')
    .attr('x',d=>sx(d.x)).attr('y',d=>sy(d.y)-r(d.n)-4).attr('text-anchor','middle').text(d=>curto(d.name));
  if(legenda.length){ const lg=el('div','net-legend'); lg.append(el('b',null,'Cor: tipo de movimento predominante')); legenda.forEach(([c,t])=>{ const s=el('span'); const sw=el('i'); sw.style.background=c; s.append(sw, document.createTextNode(t)); lg.append(s); }); box.append(lg); }
  const isolados=nodes.filter(d=>grau.get(d.id)===0).length;
  const fortes=[...L].sort((a,q)=>q.w-a.w).slice(0,3).map(l=>`${curto(l.source.name)} e ${curto(l.target.name)} (${l.w})`);
  $('netMeta').textContent=`${fmt(nodes.length)} nós · ${fmt(L.length)} ligações`;
  $('netNote').textContent=`Cada círculo é uma das ${NET.n} categorias mais citadas de “${VARS[iv].label}” no recorte (área ∝ notícias); cada linha liga duas categorias que aparecem juntas em pelo menos ${NET.min} notícia${NET.min>1?'s':''} (espessura ∝ notícias em comum). Posições calculadas por simulação de forças: categorias que agem juntas com frequência ficam próximas.${fortes.length? ' Ligações mais fortes: '+fortes.join('; ')+'.' : ''}${isolados? ` ${isolados} sem ligação no limiar escolhido.` : ''} Passe o mouse para ver os parceiros; clique para filtrar.`;
}
