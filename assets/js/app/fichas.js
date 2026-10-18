/*
 * Fichas
 * Prancha de uma categoria (movimento, tipo de movimento, província, departamento, localidade, objetivo ou ação),
 * no mesmo padrão das pranchas de mapa: título, indicadores, mapa com escala, norte, grade e topônimos,
 * detalhe da AMBA, evolução mensal, perfis em barras, nota técnica e exportação em PNG e SVG.
 * A ficha considera todas as notícias (com ou sem as repetidas, conforme a opção acima), sem os demais filtros.
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

const FIC = { v:'nombremov', k:null };
try{ Object.assign(FIC, JSON.parse(localStorage.getItem('as24fic')||'{}')); }catch(e){}
const ficNome = s => s.replace(/\s+\(\d[\d.]*\)$/,'');
$('ficV').onchange=e=>{ FIC.v=e.target.value; FIC.k=null; $('ficK').value=''; render(); };
const ficEscolhe = e => { const v=VARS[VI[FIC.v]]; const k=v.values.indexOf(ficNome(e.target.value)); if(k>=0 && k!==FIC.k){ FIC.k=k; render(); } };
$('ficK').onchange=ficEscolhe; $('ficK').oninput=ficEscolhe;
function abrirFicha(vid, k){ FIC.v=vid; FIC.k=k; setTab('fic'); }
let FIC_SVG = null;

function barras(g, x, y, w, titulo, itens, total, onClick){
  let yy=y; g.append('text').attr('x',x).attr('y',yy+12).attr('font-size',13).attr('font-weight',700).attr('font-family',FONT).attr('fill',C.ink).text(titulo); yy+=22;
  if(!itens.length){ g.append('text').attr('x',x).attr('y',yy+10).attr('font-size',11).attr('font-family',FONT).attr('fill',C.ink3).text('Sem informação.'); return yy+20-y; }
  const lab=Math.min(w*0.52, 230), mx=itens[0][1], bw=w-lab-70;
  itens.forEach(([nome,n,k])=>{ _cv.font=`400 11px ${FONT}`; let t=nome; while(_cv.measureText(t).width>lab-8 && t.length>4) t=t.slice(0,-2); if(t!==nome) t=t.replace(/.$/,'…');
    const gg=g.append('g').style('cursor', onClick&&k!=null? 'pointer' : 'default'); if(onClick && k!=null) gg.on('click',()=>onClick(k));
    gg.append('title').text(`${nome}: ${fmt(n)} notícias`);
    gg.append('text').attr('x',x).attr('y',yy+10).attr('font-size',11).attr('font-family',FONT).attr('fill',C.ink).text(t);
    gg.append('rect').attr('x',x+lab).attr('y',yy+2).attr('width',bw).attr('height',9).attr('rx',4).attr('fill','#e6edf4');
    gg.append('rect').attr('x',x+lab).attr('y',yy+2).attr('width',Math.max(2,bw*n/mx)).attr('height',9).attr('rx',4).attr('fill','#4a90d9');
    gg.append('text').attr('x',x+lab+bw+6).attr('y',yy+10).attr('font-size',10.5).attr('font-family',FONT).attr('fill',C.ink2).text(`${fmt(n)} · ${pct(n,total)}`);
    yy+=17; });
  return yy-y+6;
}
function mensal(g, x, y, w, h, cm){
  g.append('text').attr('x',x).attr('y',y+12).attr('font-size',13).attr('font-weight',700).attr('font-family',FONT).attr('fill',C.ink).text('Notícias por mês');
  const top=y+24, base=y+h-16, mx=d3.max(d3.range(12),i=>cm.get(i)||0)||1, bw=(w-30)/12, ys=d3.scaleLinear().domain([0,mx]).nice().range([base, top+8]);
  ys.ticks(3).forEach(t=>{ g.append('line').attr('x1',x+24).attr('x2',x+w).attr('y1',ys(t)).attr('y2',ys(t)).attr('stroke','#e6edf4');
    g.append('text').attr('x',x+20).attr('y',ys(t)+3.5).attr('text-anchor','end').attr('font-size',9.5).attr('font-family',FONT).attr('fill',C.ink3).text(fmt(t)); });
  d3.range(12).forEach(i=>{ const n=cm.get(i)||0, xx=x+28+i*bw;
    g.append('rect').attr('x',xx).attr('y',ys(n)).attr('width',bw*0.72).attr('height',base-ys(n)).attr('rx',2).attr('fill','#4a90d9').append('title').text(`${VARS[VI.mes].values[i].split('· ')[1]}: ${fmt(n)} notícias`);
    g.append('text').attr('x',xx+bw*0.36).attr('y',base+12).attr('text-anchor','middle').attr('font-size',9.5).attr('font-family',FONT).attr('fill',C.ink3).text(MES_ABBR[i]); });
  // acontecimentos de 2024 como marcas no alto
  (typeof EVENTOS!=='undefined'? EVENTOS : []).forEach(e=>{ const mi=e.d.getMonth(), fr=(e.d.getDate()-1)/31, xx=x+28+(mi+fr*0.72)*bw;
    g.append('circle').attr('cx',xx).attr('cy',top+2).attr('r',5).attr('fill',COR_EV[e.tipo]||'#13294b').append('title').text(`${e.d.toLocaleDateString('pt-BR')}: ${e.nome}`); });
  return h;
}

function renderFicha(b){
  if(VI[FIC.v]==null) FIC.v='nombremov';
  $('ficV').value=FIC.v;
  const iv=VI[FIC.v], v=VARS[iv];
  const c=counts(b, FIC.v); const ks=[...c.keys()].filter(k=>!ehSemInfo(v.values[k])).sort((a,q)=>c.get(q)-c.get(a));
  const dl=$('ficList'); if(dl.dataset.v!==FIC.v){ dl.textContent=''; ks.forEach(k=>{ const o=el('option'); o.value=`${v.values[k]} (${fmt(c.get(k))})`; dl.append(o); }); dl.dataset.v=FIC.v; }
  if(FIC.k==null || !c.has(FIC.k)) FIC.k=ks[0];
  try{ localStorage.setItem('as24fic', JSON.stringify(FIC)); }catch(e){}
  if(document.activeElement!==$('ficK')) $('ficK').value=v.values[FIC.k]||'';
  const box=$('ficBody'); box.querySelectorAll('.fic-sheet,.fic-bar-tools,.fic-news').forEach(e=>e.remove());
  if(FIC.k==null || !HAS_D3) return;
  const rows=b.filter(r=>r.v[iv].includes(FIC.k)), N=rows.length, nome=v.values[FIC.k];
  const datas=rows.map(r=>r.sort).filter(s=>s && s!=='00000000').sort(), dd=s=>`${s.slice(6,8)}/${s.slice(4,6)}/${s.slice(0,4)}`;
  $('ficMeta').textContent=`${fmt(N)} notícias`;
  const abre=(vid)=>(k)=>{ FIC.v=vid; FIC.k=k; $('ficK').value=''; $('ficList').dataset.v=''; render(); };
  const ficaveis=new Set([...$('ficV').options].map(o=>o.value));
  const top=(vid, n=6)=>{ const vv=VARS[VI[vid]], cc=counts(rows,vid); return [...cc].filter(([k])=>!ehSemInfo(vv.values[k]) && !(vid===FIC.v && k===FIC.k)).sort((a,q)=>q[1]-a[1]).slice(0,n).map(([k,n2])=>[vv.values[k], n2, k]); };
  const distintos=vid=>{ const vv=VARS[VI[vid]]; return [...counts(rows,vid).keys()].filter(k=>!ehSemInfo(vv.values[k]) && !/nacional|virtual/i.test(vv.values[k]) && !(vid===FIC.v && k===FIC.k)).length; };
  const sheet=el('div','sheet fic-sheet'); box.append(sheet);
  const W=Math.max(340, sheet.clientWidth||box.clientWidth), M=24, wide=W>=900;
  const svg=d3.select(sheet).append('svg').attr('font-family',FONT).attr('width','100%');
  svg.append('rect').attr('class','bgpaper').attr('fill','#ffffff');
  const tip=tipFor(sheet);
  let y=M+4;
  svg.append('text').attr('x',M).attr('y',y+10).attr('font-size',12).attr('font-family',FONT).attr('fill',C.ink3).text(`Ficha · ${v.label}`); y+=18;
  y += textBlock(svg, M, y+20, nome, wide? 26 : 21, W-2*M, {weight:700}) + 10;
  y += textBlock(svg, M, y+12, `${fmt(N)} notícias de ações coletivas (${pct(N,b.length)} da base)` + (datas.length? `, de ${dd(datas[0])} a ${dd(datas[datas.length-1])}` : '') + ' · Argentina, 2024', 13, W-2*M, {fill:C.ink2}) + 14;
  // indicadores
  const kp=[[fmt(N),'notícias'],[fmt(distintos('provincia')),'províncias'],[fmt(distintos('localidad')),'localidades'],[fmt(distintos('nombremov')), FIC.v==='nombremov'? 'organizações parceiras' : 'organizações'],[fmt(counts(rows,'mes').size),'meses com notícias']];
  const nk = W<620? 3 : kp.length, kw=(W-2*M)/nk, linhas=Math.ceil(kp.length/nk);
  svg.append('line').attr('x1',M).attr('x2',W-M).attr('y1',y).attr('y2',y).attr('stroke',C.ink).attr('stroke-width',1);
  kp.forEach(([n,l],i)=>{ const cx=M+(i%nk)*kw, cy=y+Math.floor(i/nk)*58;
    svg.append('text').attr('x',cx).attr('y',cy+32).attr('font-size',wide? 28 : 22).attr('font-weight',800).attr('font-family',FONT).attr('fill',C.ink).text(n);
    textBlock(svg, cx, cy+48, l, 11, kw-8, {fill:C.ink2, max:2}); });
  y+=linhas*58+8; svg.append('line').attr('x1',M).attr('x2',W-M).attr('y1',y).attr('y2',y).attr('stroke','#dbe5ef');
  y+=16;
  // mapa
  const cl=counts(rows,'localidad'); const md={unit:'loc', vid:'localidad', c:cl, rate:()=>0, N, mapped: rows.filter(r=>r.v[VI.localidad].some(k=>LOC_XY[k])).length, max:d3.max([...cl].filter(([k])=>LOC_XY[k]), d=>d[1])||1, XY:LOC_XY, spatial:false};
  const GL=38, mw=(wide? Math.round(W*0.42) : W-2*M)-GL, mh=Math.round(mw*1.5), fx=M+GL, frame=[fx, y, fx+mw, y+mh];
  const proj=PROJ().fitExtent([[fx+mw*0.06, y+mh*0.015],[fx+mw*0.94, y+mh*0.985]], ALL);
  const sh={max:md.max}; sh.r=d3.scaleSqrt().domain([0,sh.max]).range([0, Math.min(30, mw*0.08)]);
  drawBase(svg.append('g'), proj, frame, md, sh, {circles:true, fill:false, ctx:null, tip, onClick:()=>{}, sel:new Set(), labels: mw>=380? LABELS : [], gstep:5, topo:true, topoK:1, topoModo:'pais'});
  graticuleLabels(svg, proj, frame, 5, 9);
  northArrow(svg, fx+mw-22, y+mh*0.70, 16);
  scaleBar(svg, proj, fx+mw/2, y+mh/2, fx+mw*0.48, y+mh-20, mw*0.26, true);
  let colY, colX, colW;
  if(wide){ colX=fx+mw+30; colW=W-M-colX; colY=y; } else { colX=M; colW=W-2*M; colY=y+mh+30; }
  // detalhe AMBA quando há notícias na região
  const temAMBA=[...cl.keys()].some(k=>{ const p=LOC_XY[k]; return p && p[0]>-59.05 && p[0]<-57.85 && p[1]<-34.25 && p[1]>-35.05; });
  let cy=colY;
  if(temAMBA){ const iw=Math.min(colW, 360), ih=Math.round(iw*0.62), ifr=[colX, cy, colX+iw, cy+ih];
    drawBase(svg.append('g'), d3.geoMercator().fitExtent([[colX+2,cy+2],[colX+iw-2,cy+ih-2]], AMBA_BOX), ifr, md, sh, {circles:true, fill:false, ctx:null, tip, onClick:()=>{}, sel:new Set(), gstep:0.25, labels:LABELS_AMBA, topo:true, topoModo:'amba'});
    svg.append('rect').attr('x',colX+6).attr('y',cy+6).attr('width',170).attr('height',17).attr('fill','#fff').attr('fill-opacity',.9);
    svg.append('text').attr('x',colX+11).attr('y',cy+18).attr('font-size',10.5).attr('font-weight',700).attr('fill',C.ink).text('Detalhe: Área Metropolitana');
    if(iw<colW){ // legenda dos círculos ao lado do detalhe
      legendBlock(svg, colX+iw+18, cy+8, colW-iw-18, md, sh, {circles:true}); }
    cy+=ih+18;
    if(iw>=colW) cy += legendBlock(svg, colX, cy, colW, md, sh, {circles:true}) + 8;
  } else { cy += legendBlock(svg, colX, cy, colW, md, sh, {circles:true}) + 8; }
  cy += mensal(svg, colX, cy, colW, 130, counts(rows,'mes')) + 14;
  // perfis em duas colunas
  const perf=[[FIC.v==='tipomov'? 'nombremov' : 'tipomov', FIC.v==='tipomov'? 'Organizações' : 'Tipo de movimento'], ['nombremov', FIC.v==='nombremov'? 'Parceiros (nas mesmas notícias)' : 'Organizações'], ['matriz','Ação matriz'], ['objetivos','Objetivos'], ['tipoinst','Instituições interpeladas'], ['escala','Escala da ação']]
    .filter(([vid],i,a)=>VI[vid]!=null && (vid!==FIC.v || vid==='nombremov') && a.findIndex(z=>z[0]===vid)===i);
  const pc= colW>=520? 2 : 1, pw=(colW-(pc-1)*20)/pc; let px=0, linhaH=0, py=cy;
  perf.slice(0, pc===2? 6 : 4).forEach(([vid,tit],i)=>{ const hh=barras(svg, colX+px*(pw+20), py, pw, tit, top(vid), N, ficaveis.has(vid)? abre(vid) : null); linhaH=Math.max(linhaH,hh);
    px++; if(px===pc){ px=0; py+=linhaH+8; linhaH=0; } });
  py+=linhaH;
  let yFim=Math.max(y+mh+22, py);
  // nota técnica
  const hoje=new Date().toLocaleDateString('pt-BR');
  const nota=`NOTA TÉCNICA. Ficha gerada a partir da base de notícias de ações coletivas na Argentina em 2024 (${fmt(b.length)} notícias${st.rep?', incluindo repetidas':', sem repetidas'}; sem os filtros da página). Mapa: círculos proporcionais ao número de notícias que citam cada localidade (área ∝ n); localidades pelo GeoNames; ${fmt(N-md.mapped)} notícias sem localidade mapeável (nacionais, virtuais ou sem referência). Projeção cônica conforme de Lambert (paralelos 28° S e 46° S; meridiano central 64° O), datum WGS 84; topônimos: GeoNames (CC BY 4.0). Perfis: porcentagens sobre as ${fmt(N)} notícias da ficha; uma notícia pode ter várias categorias. Marcas no gráfico mensal: acontecimentos de 2024. Elaboração: ${mstate.author || 'não informada'}, ${hoje}.`;
  yFim += textBlock(svg, M, yFim+14, nota, 10, W-2*M, {fill:C.ink2, lh:1.38}) + 10;
  const H=yFim+M;
  svg.attr('viewBox',`0 0 ${W} ${Math.ceil(H)}`); svg.select('.bgpaper').attr('width',W).attr('height',Math.ceil(H));
  FIC_SVG=svg.node();
  // ferramentas
  const tools=el('div','sheetbar fic-bar-tools'); const t1=el('div','tools');
  const slug=nome.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-zA-Z0-9]+/g,'_').slice(0,40).toLowerCase();
  const msg=el('span','toast');
  const salva=async kind=>{ try{ const data = kind==='png'? await pngBlob(FIC_SVG, 3) : svgString(FIC_SVG); await (DL||NATIVE_DL).save({filename:`ficha_${slug}.${kind}`, data}); msg.textContent=kind.toUpperCase()+' baixado.'; }catch(e){ msg.textContent='Não foi possível baixar aqui.'; } };
  const bp=el('button','btn','Baixar PNG'); bp.onclick=()=>salva('png'); const bs=el('button','btn','Baixar SVG'); bs.onclick=()=>salva('svg');
  const bf=el('button','btn','Filtrar a base por esta categoria'); bf.onclick=()=>{ st.f={}; st.f[FIC.v]=new Set([FIC.k]); st.page=40; setTab('dist'); };
  t1.append(bp,bs,bf,msg); tools.append(el('span','meta','Passe o mouse no mapa para ver as localidades; clique nas barras para abrir outra ficha.'), t1); box.append(tools);
  // notícias recentes
  const news=el('div','fic-news'); news.append(el('h3','h3','Notícias mais recentes')); const ul=el('ul');
  [...rows].sort((a,q)=>q.sort.localeCompare(a.sort)).slice(0,10).forEach(r=>{ const li=el('li'); const a=el('a',null,r.titulo); a.href=r.link; a.target='_blank'; a.rel='noopener'; li.append(el('span','meta',(r.fecha||'')+' · '), a, el('span','meta',' · '+r.fonte)); ul.append(li); });
  news.append(ul); box.append(news);
}
EXTRA.fic = renderFicha;
