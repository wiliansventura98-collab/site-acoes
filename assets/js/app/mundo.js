/*
 * Mapa navegável
 * Alternativa à prancha cartográfica: mapa “deslizante” (Leaflet) sobre o mapa base da CARTO com dados do
 * OpenStreetMap, que pode ser arrastado e aproximado livremente para qualquer país do mundo. Os nomes de
 * lugares do mapa base ficam por cima das camadas e mudam conforme o zoom. As camadas da base (círculos,
 * taxas, contexto do INDEC, bivariado, pontos quentes e destaques) são as mesmas da prancha.
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

const WEB = { map:null, grupo:null, legenda:null };
const TEM_LEAFLET = typeof L!=='undefined';
document.querySelectorAll('#mapVis button').forEach(b=>b.onclick=()=>{ mstate.vis=b.dataset.v; if(mstate.vis==='web') mstate.mode='one'; render(); });

function webIniciar(){
  const box=$('wmap');
  WEB.map=L.map(box, { preferCanvas:true, worldCopyJump:true, minZoom:2, maxZoom:18, zoomSnap:0.5, zoomControl:true });
  WEB.map.createPane('rotulos'); WEB.map.getPane('rotulos').style.zIndex=650; WEB.map.getPane('rotulos').style.pointerEvents='none';
  const att='Mapa base © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a> · Dados: base do projeto, INDEC';
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {subdomains:'abcd', maxZoom:19, attribution:att}).addTo(WEB.map);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {subdomains:'abcd', maxZoom:19, pane:'rotulos'}).addTo(WEB.map);
  L.control.scale({imperial:false, position:'bottomright'}).addTo(WEB.map);
  WEB.grupo=L.layerGroup().addTo(WEB.map);
  WEB.legenda=L.control({position:'bottomleft'}); WEB.legenda.onAdd=()=>{ const d=L.DomUtil.create('div','wleg'); L.DomEvent.disableScrollPropagation(d); L.DomEvent.disableClickPropagation(d); return d; }; WEB.legenda.addTo(WEB.map);
  const casa=L.control({position:'topleft'}); casa.onAdd=()=>{ const b=L.DomUtil.create('button','wbtn'); b.type='button'; b.title='Voltar para a Argentina'; b.textContent='⌂ Argentina'; b.onclick=e=>{ e.stopPropagation(); WEB.map.fitBounds([[-55.3,-73.8],[-21.7,-53.5]]); }; return b; }; casa.addTo(WEB.map);
  WEB.map.fitBounds([[-55.3,-73.8],[-21.7,-53.5]]);
}

function renderWeb(b, cdef){
  const box=$('wmap');
  if(!TEM_LEAFLET){ box.hidden=false; box.textContent='Não foi possível carregar a biblioteca do mapa navegável.'; return; }
  box.hidden=false;
  if(!WEB.map) webIniciar();
  setTimeout(()=>WEB.map.invalidateSize(), 0);
  WEB.grupo.clearLayers();
  const unit=mstate.unit, vid=UNIT_VID[unit], rows=b.filter(r=>match(r, vid)), md=mapData(rows, unit);
  const fN=v=>v.toLocaleString('pt-BR',{maximumFractionDigits:1});
  const leg=[]; let notaFundo='';
  const poly=(feats, estilo, tip, clique)=>{ const g=L.geoJSON({type:'FeatureCollection', features:feats}, { style:estilo, onEachFeature:(f,l)=>{ if(tip) l.bindTooltip(()=>tip(f), {sticky:true}); if(clique) l.on('click',()=>clique(f)); } }); g.addTo(WEB.grupo); return g; };
  const linha = {weight:.6, color:'#ffffff', opacity:.9};
  let desenhouFundo=false, circulos = mstate.measure!=='rate';
  // camadas de contexto e análises espaciais
  if(cdef && ['dep','prov','reg'].includes(cdef.nivel)){
    const cls=ctxClasses(cdef), feats = cdef.nivel==='dep'? DEPTS : cdef.nivel==='prov'? PROVS_FC : REGS_FC;
    const chave=f=> cdef.nivel==='dep'? f.id : cdef.nivel==='prov'? f.properties.p : f.properties.r, nome=f=> cdef.nivel==='dep'? f.properties.n : chave(f);
    poly(feats, f=>({...linha, fillColor:cls.color(ctxValor(cdef, chave(f))), fillOpacity:.82}), f=>{ const v=ctxValor(cdef, chave(f)); return `<b>${nome(f)}</b><br>${v==null? 'sem dado' : cls.fmt(v)+' '+cdef.curto}`; });
    leg.push(['tit', cdef.titulo], ...cls.items.map(([c,l])=>['cor', c, `${l} ${cdef.curto}`])); desenhouFundo=true;
  } else if(cdef && (cdef.nivel==='biv' || cdef.nivel==='lisa')){
    const T=taxasDept(b);
    if(cdef.nivel==='biv'){ const B=bivCalc(cdef,T);
      poly(DEPTS, f=>{ const c=B.cls(f); return {...linha, fillColor: c? BIV[c[1]][c[0]] : '#f1f1ef', fillOpacity:.88}; }, f=>{ const t=T.get(f.id), v=(IND_DEP[f.id]||{})[cdef.campo]; return `<b>${f.properties.n}</b><br>${t? `${fmt(t.n)} notícias · ${fN(t.rate)} por 100 mil hab.` : 'sem dado'}<br>${cdef.indTitulo}: ${v==null? 'sem dado' : v.toLocaleString('pt-BR',{maximumFractionDigits:cdef.dec})} ${cdef.curto}`; }, f=>{ if(f.properties.di>=0) toggleFilter('departamento', f.properties.di); });
      leg.push(['tit', cdef.titulo], ['cor', BIV[2][0], 'Indicador alto, nenhuma notícia'], ['cor', BIV[2][2], 'Indicador alto, muitas notícias'], ['cor', BIV[0][2], 'Indicador baixo, muitas notícias'], ['cor', BIV[0][0], 'Indicador baixo, nenhuma notícia'], ['txt', 'Tons intermediários: situações no meio do caminho.']);
    } else { const Lr=lisaCalc(T);
      poly(DEPTS, f=>({...linha, fillColor:LISA_COR[Lr.cls.get(f.id)]||'#f1f1ef', fillOpacity:.85}), f=>{ const t=T.get(f.id), c=Lr.cls.get(f.id); return `<b>${f.properties.n}</b><br>${t? `${fmt(t.n)} notícias · ${fN(t.rate)} por 100 mil hab.` : 'sem dado'}<br>${c? LISA_ROT[c] : ''}`; }, f=>{ if(f.properties.di>=0) toggleFilter('departamento', f.properties.di); });
      leg.push(['tit', cdef.titulo], ...['HH','LL','HL','LH','ns'].map(c=>['cor', LISA_COR[c], `${LISA_ROT[c]}: ${Lr.n[c]}`]), ['txt', `I de Moran global = ${Lr.I.toLocaleString('pt-BR',{maximumFractionDigits:3})}`]); }
    circulos=false; desenhouFundo=true;
  } else if(mstate.measure!=='abs' && unit!=='loc'){
    const sh=classify(rateIds(unit).map(md.rate)), feats = unit==='dept'? DEPTS : PROVS_FC, ix=f=> unit==='dept'? f.properties.di : f.properties.pi;
    poly(feats, f=>({...linha, fillColor: ix(f)>=0? sh.color(md.rate(ix(f))) : C.zero, fillOpacity:.85}), f=>{ const i=ix(f), nm= unit==='dept'? f.properties.n : f.properties.p; return `<b>${nm}</b><br>${i>=0? `${fmt(md.c.get(i)||0)} notícias · ${fN(md.rate(i))} por 100 mil hab.` : 'sem notícias'}`; }, f=>{ const i=ix(f); if(i>=0) toggleFilter(vid, i); });
    leg.push(['tit','Notícias por 100 mil habitantes'], ...sh.items.map(([c,l])=>['cor', c, l])); desenhouFundo=true;
  }
  if(!desenhouFundo) poly(unit==='prov'? PROVS_FC : DEPTS, ()=>({weight:.5, color:'#9aa6b2', opacity:.6, fill:false}));
  // limites de províncias por cima
  L.geoJSON(MESH.prov, {style:{weight:1.1, color:'#5f6f82', opacity:.8}, interactive:false}).addTo(WEB.grupo);
  L.geoJSON(MESH.reg, {style:{weight:2.2, color:'#1d3554', opacity:.8}, interactive:false}).addTo(WEB.grupo);
  // população (círculos vazados) e aglomerados
  if(cdef && (cdef.nivel==='pop' || cdef.nivel==='popDep')){
    const pts = cdef.nivel==='pop'? PROVS_FC.filter(f=>f.properties.pi>=0 && POP[f.properties.pi]).map(f=>({n:POP[f.properties.pi], nm:f.properties.p, c:PROV_XY[f.properties.pi]}))
      : DEPTS.map(f=>({n:(IND_DEP[f.id]||{}).pop, nm:f.properties.n, c:f.properties.c})).filter(d=>d.n);
    const r=d3.scaleSqrt().domain([0, d3.max(pts,d=>d.n)]).range([0, cdef.nivel==='pop'? 46 : 26]);
    pts.forEach(d=>L.circleMarker([d.c[1], d.c[0]], {radius:r(d.n), color:'#5e4c33', weight:1, dashArray:'3 2', fill:false}).bindTooltip(`<b>${d.nm}</b><br>${fmt(d.n)} habitantes`).addTo(WEB.grupo));
    leg.push(['tit', cdef.titulo], ['txt','Círculos vazados: área proporcional à população.']);
  }
  if(cdef && cdef.nivel==='agl'){ const cls=ctxClasses(cdef);
    CTX.aglomerados.forEach(a=>L.circleMarker([a.lat,a.lon], {radius:7, color:'#2b2216', weight:1, fillColor:cls.color(a[cdef.campo]), fillOpacity:1}).bindTooltip(`<b>${a.aglomerado}</b><br>${cls.fmt(a[cdef.campo])} ${cdef.curto}`).addTo(WEB.grupo));
    leg.push(['tit', cdef.titulo], ...cls.items.map(([c,l])=>['cor', c, `${l} ${cdef.curto}`])); }
  // destaques
  const dest = (unit!=='loc' && mstate.dest!==false && !(cdef && (cdef.nivel==='biv'||cdef.nivel==='lisa')))? destaques(md) : null;
  if(dest && dest.feats.length){
    dest.feats.forEach(d=>L.geoJSON(d.f, {style:{weight:3, color: d.t==='alto'? COR_ALTO : COR_BAIXO, fill:false}, interactive:false}).addTo(WEB.grupo));
    leg.push(['tit','Destaques (contorno)'], ['borda', COR_ALTO, `Muito acima do esperado pela população: ${dest.feats.filter(d=>d.t==='alto').length}`], ['borda', COR_BAIXO, `Muito abaixo do esperado: ${dest.feats.filter(d=>d.t!=='alto').length}`]);
  }
  // círculos de notícias
  if(circulos){
    const pts=[]; md.c.forEach((n,i)=>{ const xy=md.XY[i]; if(xy) pts.push({i,n,xy}); }); pts.sort((a,q)=>q.n-a.n);
    const r=d3.scaleSqrt().domain([0, md.max||1]).range([0, 34]);
    const nomes = unit==='loc'? LOC_VALS : unit==='dept'? DEPT_VALS : PROV_VALS;
    pts.forEach(p=>L.circleMarker([p.xy[1], p.xy[0]], {radius:Math.max(3, r(p.n)), color:'#85340a', weight:1, fillColor:'#f6b40e', fillOpacity:.82})
      .bindTooltip(`<b>${nomes[p.i]}</b><br>${fmt(p.n)} notícias · ${pct(p.n, md.N)} do recorte` + (popOf(unit,p.i)? `<br>${fN(md.rate(p.i))} por 100 mil hab.` : ''))
      .on('click',()=>toggleFilter(vid, p.i)).addTo(WEB.grupo));
    const mx=md.max||1, ref=[...new Set([mx, Math.max(1,Math.round(mx/4)), Math.max(1,Math.round(mx/16))])];
    leg.push(['tit', `Notícias por ${unit==='loc'? 'localidade' : unit==='dept'? 'departamento' : 'província'}`], ...ref.map(v=>['circ', Math.max(3,r(v)), `${fmt(v)} notícias`]));
  }
  // legenda
  const lg=document.querySelector('.wleg'); lg.textContent='';
  leg.forEach(it=>{ if(it[0]==='tit'){ lg.append(el('b',null,it[1])); return; } if(it[0]==='txt'){ lg.append(el('p',null,it[1])); return; }
    const d=el('div','wl'); const sw=el('i');
    if(it[0]==='cor'){ sw.style.background=it[1]; } else if(it[0]==='borda'){ sw.style.border=`2.5px solid ${it[1]}`; sw.style.background='transparent'; } else { const s=Math.min(30,it[1]*2); sw.style.width=s+'px'; sw.style.height=s+'px'; sw.style.borderRadius='50%'; sw.style.background='rgba(246,180,14,.7)'; sw.style.border='1px solid #85340a'; }
    d.append(sw, document.createTextNode(it[2])); lg.append(d); });
  if(!leg.length) lg.append(el('p',null,'Escolha uma medida ou camada.'));
  $('mapTitle').textContent='Mapa navegável'; $('mapMeta').textContent=`${fmt(md.mapped)} de ${fmt(md.N)} notícias no mapa`;
  $('mapNote').textContent = 'Arraste para mover e use a rolagem do mouse, os botões +/− ou a pinça para aproximar: o mapa vai a qualquer lugar do mundo, e os nomes de cidades, bairros e ruas aparecem conforme o zoom. O botão “⌂ Argentina” volta à vista inicial. Passe o mouse sobre um lugar para ver os números; clique para filtrar. Para a prancha cartográfica com escala, grade, nota técnica e exportação, volte a “Prancha cartográfica”.';
}
