/*
 * Redes de coocorrência
 * Liga categorias que aparecem juntas nas mesmas notícias. Na rede de movimentos, revela as
 * articulações entre organizações que protagonizam ações em comum.
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

const NET = { v:'nombremov', n:40, min:2, cor:'tipo', ord:'grau' };
try{ Object.assign(NET, JSON.parse(localStorage.getItem('as24n')||'{}')); }catch(e){}
fillSelect($('netVar'), false);
$('netVar').onchange=e=>{ NET.v=e.target.value; render(); };
$('netN').onchange=e=>{ NET.n=+e.target.value; render(); };
$('netMin').onchange=e=>{ NET.min=+e.target.value; render(); };
$('netCor').onchange=e=>{ NET.cor=e.target.value; render(); };

/* comunidades por modularidade (Louvain, fase de movimentação local repetida com agregação) */
function louvain(ids, links){
  let comm=new Map(ids.map(i=>[i,i]));
  let nodes=ids.slice(), E=links.map(l=>({s:l.source, t:l.target, w:l.w}));
  const m2=2*d3.sum(E,e=>e.w)||1;
  let membros=new Map(ids.map(i=>[i,[i]]));
  for(let nivel=0; nivel<6; nivel++){
    const adj=new Map(nodes.map(n=>[n,new Map()])), k=new Map(nodes.map(n=>[n,0]));
    E.forEach(e=>{ if(e.s===e.t){ k.set(e.s,k.get(e.s)+2*e.w); adj.get(e.s).set(e.s,(adj.get(e.s).get(e.s)||0)+2*e.w); return; }
      adj.get(e.s).set(e.t,(adj.get(e.s).get(e.t)||0)+e.w); adj.get(e.t).set(e.s,(adj.get(e.t).get(e.s)||0)+e.w); k.set(e.s,k.get(e.s)+e.w); k.set(e.t,k.get(e.t)+e.w); });
    const c=new Map(nodes.map(n=>[n,n])), tot=new Map(nodes.map(n=>[n,k.get(n)]));
    let mudou=true, voltas=0, algum=false;
    while(mudou && voltas<30){ mudou=false; voltas++;
      nodes.forEach(n=>{ const cn=c.get(n), kn=k.get(n); const pesos=new Map(); adj.get(n).forEach((w,j)=>{ if(j===n) return; const cj=c.get(j); pesos.set(cj,(pesos.get(cj)||0)+w); });
        tot.set(cn, tot.get(cn)-kn); let melhor=cn, ganho=(pesos.get(cn)||0)-tot.get(cn)*kn/m2;
        pesos.forEach((w,cj)=>{ const g=w-tot.get(cj)*kn/m2; if(g>ganho+1e-12){ ganho=g; melhor=cj; } });
        tot.set(melhor, tot.get(melhor)+kn); if(melhor!==cn){ c.set(n,melhor); mudou=true; algum=true; } }); }
    if(!algum) break;
    const novos=new Map(); nodes.forEach(n=>{ const cn=c.get(n); if(!novos.has(cn)) novos.set(cn,[]); novos.get(cn).push(...membros.get(n)); });
    membros=novos; nodes=[...novos.keys()];
    const agg=new Map(); E.forEach(e=>{ const a=c.get(e.s), b=c.get(e.t); const kk=a<b? a+'|'+b : b+'|'+a; agg.set(kk,(agg.get(kk)||0)+e.w); });
    E=[...agg].map(([kk,w])=>{ const [a,b]=kk.split('|').map(Number); return {s:a,t:b,w}; });
  }
  membros.forEach((ms,cid)=>ms.forEach(i=>comm.set(i,cid)));
  // modularidade final
  const kk=new Map(ids.map(i=>[i,0])); links.forEach(l=>{ kk.set(l.source,kk.get(l.source)+l.w); kk.set(l.target,kk.get(l.target)+l.w); });
  let Qm=0; links.forEach(l=>{ if(comm.get(l.source)===comm.get(l.target)) Qm+=2*l.w; }); const totC=new Map(); ids.forEach(i=>{ const ci=comm.get(i); totC.set(ci,(totC.get(ci)||0)+kk.get(i)); });
  totC.forEach(t=>{ Qm-=t*t/m2; }); Qm/=m2;
  return { comm, Q:Qm };
}
/* intermediação (Brandes), em grafo não ponderado */
function intermediacao(ids, links){
  const adj=new Map(ids.map(i=>[i,[]])); links.forEach(l=>{ adj.get(l.source).push(l.target); adj.get(l.target).push(l.source); });
  const B=new Map(ids.map(i=>[i,0]));
  ids.forEach(s=>{ const S=[], P=new Map(ids.map(i=>[i,[]])), sg=new Map(ids.map(i=>[i,0])), d=new Map(ids.map(i=>[i,-1])); sg.set(s,1); d.set(s,0); const Qq=[s];
    while(Qq.length){ const v=Qq.shift(); S.push(v); adj.get(v).forEach(w=>{ if(d.get(w)<0){ Qq.push(w); d.set(w,d.get(v)+1); } if(d.get(w)===d.get(v)+1){ sg.set(w,sg.get(w)+sg.get(v)); P.get(w).push(v); } }); }
    const de=new Map(ids.map(i=>[i,0])); while(S.length){ const w=S.pop(); P.get(w).forEach(v=>{ de.set(v, de.get(v)+sg.get(v)/sg.get(w)*(1+de.get(w))); }); if(w!==s) B.set(w,B.get(w)+de.get(w)); } });
  const n=ids.length, norm=n>2? (n-1)*(n-2) : 1; B.forEach((v,k)=>B.set(k, v/norm)); // grafo não direcionado: soma dupla / ((n-1)(n-2))
  return B;
}

function renderNet(b){
  try{ localStorage.setItem('as24n', JSON.stringify(NET)); }catch(e){}
  $('netVar').value=NET.v; $('netN').value=String(NET.n); $('netMin').value=String(NET.min); $('netCor').value=NET.cor;
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
  // comunidades e centralidade (sempre calculadas; a cor por comunidade é opcional)
  const LV=louvain(top, links), BT=intermediacao(top, links);
  const tamC=new Map(); top.forEach(k=>{ const ci=LV.comm.get(k); tamC.set(ci,(tamC.get(ci)||0)+1); });
  const ordC=[...tamC].filter(([,n])=>n>1).sort((a,q)=>q[1]-a[1]).map(([ci])=>ci), numC=new Map(ordC.map((ci,i)=>[ci,i+1]));
  if(NET.cor==='com'){
    corDe = k => { const i=numC.get(LV.comm.get(k)); return i? (i-1<PALETA.length-1? PALETA[i-1] : COR_OUTROS) : '#d5dbe3'; };
    legenda = ordC.slice(0, PALETA.length-1).map((ci,i)=>{ const lider=top.filter(k=>LV.comm.get(k)===ci).sort((a,q)=>c.get(q)-c.get(a))[0];
      return [PALETA[i], `Bloco ${i+1}: ${tamC.get(ci)} nós, em torno de ${vals[lider].replace(/\s*\([^)]*\)\s*$/,'')}`]; });
    if(top.some(k=>!numC.get(LV.comm.get(k)))) legenda.push(['#d5dbe3','Sem bloco (nó isolado no limiar)']);
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
  if(legenda.length){ const lg=el('div','net-legend'); lg.append(el('b',null, NET.cor==='com'? `Cor: comunidade (Louvain, modularidade Q = ${LV.Q.toLocaleString('pt-BR',{maximumFractionDigits:2})})` : 'Cor: tipo de movimento predominante')); legenda.forEach(([c,t])=>{ const s=el('span'); const sw=el('i'); sw.style.background=c; s.append(sw, document.createTextNode(t)); lg.append(s); }); box.append(lg); }
  const isolados=nodes.filter(d=>grau.get(d.id)===0).length;
  const fortes=[...L].sort((a,q)=>q.w-a.w).slice(0,3).map(l=>`${curto(l.source.name)} e ${curto(l.target.name)} (${l.w})`);
  $('netMeta').textContent=`${fmt(nodes.length)} nós · ${fmt(L.length)} ligações`;
  // tabela de centralidade
  const lin=top.map(k=>({k, nome:vals[k], n:c.get(k), grau:links.filter(l=>l.source===k||l.target===k).length, forca:grau.get(k), bt:BT.get(k), bloco:numC.get(LV.comm.get(k))||null }));
  const cols=[['nome','Nó'],['n','Notícias'],['grau','Parceiros (grau)'],['forca','Notícias em comum (força)'],['bt','Intermediação'],['bloco','Bloco']];
  lin.sort((a,q)=>{ const A=a[NET.ord], B=q[NET.ord]; return typeof A==='string'? A.localeCompare(B,'es') : (B??-1)-(A??-1); });
  const tb=$('netCent'); tb.textContent=''; const t=el('table','ctx-table'), th=el('thead'), tr=el('tr');
  cols.forEach(([k,l])=>{ const h=el('th',null,l+(NET.ord===k? ' ↓' : '')); h.tabIndex=0; h.style.cursor='pointer'; const go=()=>{ NET.ord=k; render(); }; h.onclick=go; h.onkeydown=e=>{ if(e.key==='Enter') go(); }; tr.append(h); });
  th.append(tr); t.append(th); const body=el('tbody'); const mx={n:d3.max(lin,d=>d.n), grau:d3.max(lin,d=>d.grau)||1, forca:d3.max(lin,d=>d.forca)||1, bt:d3.max(lin,d=>d.bt)||1};
  lin.slice(0,25).forEach(d=>{ const r=el('tr'); r.append(el('td','nm',d.nome));
    [['n','#e0a106',fmt],['grau','#6cace4',fmt],['forca','#2569ad',fmt],['bt','#13294b',v=>v.toLocaleString('pt-BR',{minimumFractionDigits:3,maximumFractionDigits:3})]].forEach(([k,cor,f])=>{ const td=el('td','bar'); barCell(td, d[k], mx[k], f(d[k]), cor); r.append(td); });
    const tdb=el('td','num', d.bloco? String(d.bloco) : '—'); if(d.bloco && d.bloco<=PALETA.length-1){ tdb.style.color=PALETA[d.bloco-1]; tdb.style.fontWeight=800; } r.append(tdb);
    r.style.cursor='pointer'; r.onclick=()=>toggleFilter(NET.v, d.k); body.append(r); });
  t.append(body); tb.append(t);
  $('netCentNote').textContent=`Os 25 nós com maior valor na coluna escolhida. Grau: com quantos outros nós há ligação no limiar escolhido; força: soma das notícias em comum; intermediação (Brandes, normalizada de 0 a 1): quanto o nó está nos caminhos mais curtos entre os demais, isto é, quanto ele faz a ponte entre grupos; bloco: comunidade detectada pelo método de Louvain (modularidade Q = ${LV.Q.toLocaleString('pt-BR',{maximumFractionDigits:2})}).`;
  $('netNote').textContent=`Cada círculo é uma das ${NET.n} categorias mais citadas de “${VARS[iv].label}” no recorte (área ∝ notícias); cada linha liga duas categorias que aparecem juntas em pelo menos ${NET.min} notícia${NET.min>1?'s':''} (espessura ∝ notícias em comum). Posições calculadas por simulação de forças: categorias que agem juntas com frequência ficam próximas.${fortes.length? ' Ligações mais fortes: '+fortes.join('; ')+'.' : ''}${isolados? ` ${isolados} sem ligação no limiar escolhido.` : ''} Passe o mouse para ver os parceiros; clique para filtrar.`;
}
