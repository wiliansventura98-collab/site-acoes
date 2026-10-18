/*
 * Fichas
 * Perfil de uma categoria (movimento, tipo de movimento, província, departamento, localidade, objetivo ou ação):
 * volume, período, evolução mensal, mapa das localidades, repertório, objetivos, parceiros e notícias recentes.
 * A ficha considera todas as notícias (com ou sem as repetidas, conforme a opção acima), sem os demais filtros.
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

const FIC = { v:'nombremov', k:null };
try{ Object.assign(FIC, JSON.parse(localStorage.getItem('as24fic')||'{}')); }catch(e){}
$('ficV').onchange=e=>{ FIC.v=e.target.value; FIC.k=null; $('ficK').value=''; render(); };
$('ficK').onchange=e=>{ const v=VARS[VI[FIC.v]]; const nome=e.target.value.replace(/\s+\(\d[\d.]*\)$/,''); const k=v.values.indexOf(nome); if(k>=0){ FIC.k=k; render(); } };
$('ficK').oninput=e=>{ const v=VARS[VI[FIC.v]]; const nome=e.target.value.replace(/\s+\(\d[\d.]*\)$/,''); const k=v.values.indexOf(nome); if(k>=0 && k!==FIC.k){ FIC.k=k; render(); } };
function abrirFicha(vid, k){ FIC.v=vid; FIC.k=k; setTab('fic'); }

function renderFicha(b){
  if(VI[FIC.v]==null) FIC.v='nombremov';
  $('ficV').value=FIC.v;
  const iv=VI[FIC.v], v=VARS[iv];
  const c=counts(b, FIC.v); const ks=[...c.keys()].filter(k=>!ehSemInfo(v.values[k])).sort((a,q)=>c.get(q)-c.get(a));
  const dl=$('ficList'); if(dl.dataset.v!==FIC.v){ dl.textContent=''; ks.forEach(k=>{ const o=el('option'); o.value=`${v.values[k]} (${fmt(c.get(k))})`; dl.append(o); }); dl.dataset.v=FIC.v; }
  if(FIC.k==null || !c.has(FIC.k)) FIC.k=ks[0];
  try{ localStorage.setItem('as24fic', JSON.stringify(FIC)); }catch(e){}
  if(document.activeElement!==$('ficK')) $('ficK').value=v.values[FIC.k]||'';
  const box=$('ficBody'); box.textContent='';
  if(FIC.k==null){ box.append(el('p','empty','Nenhuma categoria disponível.')); return; }
  const rows=b.filter(r=>r.v[iv].includes(FIC.k));
  const datas=rows.map(r=>r.sort).filter(s=>s && s!=='00000000').sort(), dd=s=>`${s.slice(6,8)}/${s.slice(4,6)}/${s.slice(0,4)}`;
  $('ficMeta').textContent=`${fmt(rows.length)} notícias`;
  // cabeçalho
  const cab=el('div','fic-cab');
  const h=el('h3','fic-nome', v.values[FIC.k]); cab.append(h);
  const resumo=el('p','fic-res'); resumo.textContent=`${v.label} · ${fmt(rows.length)} notícias (${pct(rows.length, b.length)} da base)` + (datas.length? ` · de ${dd(datas[0])} a ${dd(datas[datas.length-1])}` : '');
  const bt=el('button','btn','Filtrar a base por esta categoria'); bt.onclick=()=>{ st.f={}; st.f[FIC.v]=new Set([FIC.k]); st.page=40; setTab('dist'); };
  cab.append(resumo, bt); box.append(cab);
  const grade=el('div','fic-grid'); box.append(grade);
  // evolução mensal
  const cMes=el('div','chart fic-card'); cMes.append(el('h3','h3','Notícias por mês')); grade.append(cMes);
  const cm=counts(rows,'mes'); if(HAS_D3) colChart(cMes, VARS[VI.mes].values.map((lab,i)=>({k:i, label:MES_ABBR[i].slice(0,1), n:cm.get(i)||0, full:lab.split('· ')[1]})), {H:150, tipTitle:d=>d.full});
  // mapa das localidades
  const cMap=el('div','chart fic-card'); cMap.append(el('h3','h3','Onde')); grade.append(cMap);
  if(HAS_D3){ const cl=counts(rows,'localidad'); const pts=[...cl].filter(([k])=>LOC_XY[k]).map(([k,n])=>({k,n,xy:LOC_XY[k]}));
    const W=Math.max(220, cMap.clientWidth||300), H=Math.round(W*1.25), proj=PROJ().fitExtent([[6,6],[W-6,H-6]], ALL), path=d3.geoPath(proj);
    const s=d3.select(cMap).append('svg').attr('viewBox',`0 0 ${W} ${H}`).attr('width','100%');
    s.append('g').selectAll('path').data(PROVS_FC).join('path').attr('d',path).attr('fill','#f2f6fa').attr('stroke','#c9d6e3').attr('stroke-width',.6);
    const r=d3.scaleSqrt().domain([0, d3.max(pts,p=>p.n)||1]).range([2.5, 16]); const tip=tipFor(cMap);
    s.append('g').selectAll('circle').data(pts.sort((a,q)=>q.n-a.n)).join('circle').attr('cx',p=>proj(p.xy)[0]).attr('cy',p=>proj(p.xy)[1]).attr('r',p=>r(p.n)).attr('fill','#f2a900').attr('fill-opacity',.85).attr('stroke','#85340a').attr('stroke-width',.6)
      .on('mousemove',(e,p)=>tip.show(e, LOC_VALS[p.k], [`${fmt(p.n)} notícias`])).on('mouseleave',()=>tip.hide());
    const sem=rows.length-rows.filter(r0=>r0.v[VI.localidad].some(k=>LOC_XY[k])).length; if(sem) cMap.append(el('p','meta',`${fmt(sem)} notícias sem localidade mapeável (nacionais, virtuais ou sem referência).`)); }
  // perfis
  const perf=[['tipomov','Tipo de movimento'],['nombremov','Movimentos e organizações'],['matriz','Ação matriz'],['objetivos','Objetivos'],['direccion','Direcionalidade'],['escala','Escala'],['provincia','Províncias'],['tipoinst','Instituições interpeladas']].filter(([vid])=>VI[vid]!=null && (vid!==FIC.v || vid==='nombremov')).map(([vid,tit])=>[vid, vid===FIC.v? 'Parceiros: aparecem nas mesmas notícias' : tit]);
  perf.forEach(([vid,tit])=>{ const card=el('div','fic-card'); card.append(el('h3','h3',tit)); const vv=VARS[VI[vid]]; const cc=counts(rows,vid);
    const top=[...cc].filter(([k])=>!ehSemInfo(vv.values[k]) && !(vid===FIC.v && k===FIC.k)).sort((a,q)=>q[1]-a[1]).slice(0,6);
    if(!top.length){ card.append(el('p','meta','Sem informação.')); grade.append(card); return; }
    const mx=top[0][1]; const lista=el('div','fic-bars');
    top.forEach(([k,n])=>{ const lin=el('div','fic-bar'); lin.title='Abrir a ficha'; const nm=el('span',null,vv.values[k]); const tr=el('i'); const fl=el('b'); fl.style.width=(n/mx*100)+'%'; tr.append(fl);
      lin.append(nm, tr, el('em',null,`${fmt(n)} · ${pct(n, rows.length)}`));
      const ficavel=[...$('ficV').options].some(o=>o.value===vid); if(ficavel){ lin.style.cursor='pointer'; lin.onclick=()=>{ FIC.v=vid; FIC.k=k; $('ficK').value=''; $('ficList').dataset.v=''; render(); }; }
      lista.append(lin); });
    card.append(lista); grade.append(card); });
  // notícias recentes
  const news=el('div','fic-card fic-news'); news.append(el('h3','h3','Notícias mais recentes')); const ul=el('ul');
  [...rows].sort((a,q)=>q.sort.localeCompare(a.sort)).slice(0,8).forEach(r=>{ const li=el('li'); const a=el('a',null,r.titulo); a.href=r.link; a.target='_blank'; a.rel='noopener'; li.append(el('span','meta',(r.fecha||'')+' · '), a, el('span','meta',' · '+r.fonte)); ul.append(li); });
  news.append(ul); box.append(news);
}
EXTRA.fic = renderFicha;
