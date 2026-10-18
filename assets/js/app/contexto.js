/*
 * Contexto
 * Relaciona as notícias com indicadores oficiais: dispersão por província (notícias por 100 mil hab.
 * × indicador escolhido), panorama provincial ordenável e quadro das regiões estatísticas.
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

const CTXV = { x:'densidade_hab_km2', ord:'noticias', desc:true };
$('ctxX').onchange=e=>{ CTXV.x=e.target.value; render(); };
const REG_ORDEM = ['Gran Buenos Aires','Pampeana','Noroeste (NOA)','Noreste (NEA)','Cuyo','Patagonia'];
const REG_COR = new Map(REG_ORDEM.map((r,i)=>[r, ['#1c4f8a','#5fa3dc','#c96a1b','#2f8a74','#9c3d0f','#6d5aa8'][i]]));
const PROV_REG = (()=>{ const m=new Map(); DEPTS.forEach(f=>{ const p=f.properties.p, r=f.properties.r; const c=m.get(p)||new Map(); c.set(r,(c.get(r)||0)+1); m.set(p,c); });
  const out=new Map(); m.forEach((c,p)=>{ out.set(p, p==='Buenos Aires'? 'Pampeana' : [...c].sort((a,b)=>b[1]-a[1])[0][0]); }); return out; })();
const CTX_ROT = { densidade_hab_km2:['Densidade demográfica, 2022','hab./km²',true], populacao_2022:['População, 2022','habitantes',true],
  taxa_homicidios_2024:['Homicídios dolosos, 2024','por 100 mil hab.',false], taxa_homicidios_2023:['Homicídios dolosos, 2023','por 100 mil hab.',false] };

function correlacoes(xs, ys){
  const n=xs.length, mx=d3.mean(xs), my=d3.mean(ys);
  const cov=d3.sum(xs.map((x,i)=>(x-mx)*(ys[i]-my))), vx=d3.sum(xs.map(x=>(x-mx)**2)), vy=d3.sum(ys.map(y=>(y-my)**2));
  const r = cov/Math.sqrt(vx*vy);
  const rank = a => { const o=a.map((v,i)=>[v,i]).sort((p,q)=>p[0]-q[0]); const rk=new Array(n); let i=0; while(i<n){ let j=i; while(j+1<n && o[j+1][0]===o[i][0]) j++; for(let k=i;k<=j;k++) rk[o[k][1]]=(i+j)/2+1; i=j+1; } return rk; };
  const rx=rank(xs), ry=rank(ys), mrx=d3.mean(rx), mry=d3.mean(ry);
  const rho = d3.sum(rx.map((x,i)=>(x-mrx)*(ry[i]-mry)))/Math.sqrt(d3.sum(rx.map(x=>(x-mrx)**2))*d3.sum(ry.map(y=>(y-mry)**2)));
  return { r, rho, b: cov/vx, a: my - cov/vx*mx };
}

function renderCtx(b){
  $('ctxX').value=CTXV.x;
  const box=$('ctxChart'); box.querySelectorAll('svg').forEach(s=>s.remove());
  if(!HAS_D3) return;
  const rows=b.filter(r=>match(r,'provincia'));
  const md=mapData(rows,'prov');
  const [titX, unX, logX] = CTX_ROT[CTXV.x];
  const pts = PROVS_FC.filter(f=>f.properties.pi>=0 && POP[f.properties.pi]).map(f=>{ const p=f.properties.p, i=f.properties.pi, c=CTX.provincias[p]||{};
    return { p, i, n: md.c.get(i)||0, y: md.rate(i), x: c[CTXV.x], reg: PROV_REG.get(p) }; }).filter(d=>d.x!=null && d.x>0);
  const W=Math.max(320, box.clientWidth), H=Math.round(Math.max(380, Math.min(560, W*0.52))), m={t:16,r:24,b:48,l:58};
  const x=(logX? d3.scaleLog() : d3.scaleLinear()).domain(d3.extent(pts,d=>d.x)).nice().range([m.l, W-m.r]);
  const y=d3.scaleLinear().domain([0, d3.max(pts,d=>d.y)||1]).nice().range([H-m.b, m.t]);
  const rr=d3.scaleSqrt().domain([0, d3.max(pts,d=>d.n)||1]).range([3, W<640? 14 : 20]);
  const svg=d3.select(box).append('svg').attr('viewBox',`0 0 ${W} ${H}`).attr('width','100%').attr('role','img').attr('aria-label','Dispersão: notícias por 100 mil habitantes e indicador');
  svg.append('g').attr('class','grid').selectAll('line').data(y.ticks(5)).join('line').attr('x1',m.l).attr('x2',W-m.r).attr('y1',d=>y(d)).attr('y2',d=>y(d));
  const ticksLog = CTXV.x==='populacao_2022'? [1e5,3e5,1e6,3e6,1e7] : [1,10,100,1000,10000];
  const fx = v => v>=1e6? (v/1e6).toLocaleString('pt-BR')+' mi' : v>=1e3 && CTXV.x==='populacao_2022'? (v/1e3).toLocaleString('pt-BR')+' mil' : fmt(v);
  const ax = d3.axisBottom(x); if(logX) ax.tickValues(ticksLog.filter(v=>v>=x.domain()[0] && v<=x.domain()[1])).tickFormat(fx); else ax.ticks(6).tickFormat(v=>fmt(v));
  svg.append('g').attr('class','axis').attr('transform',`translate(0,${H-m.b})`).call(ax);
  svg.append('g').attr('class','axis').attr('transform',`translate(${m.l},0)`).call(d3.axisLeft(y).ticks(5).tickFormat(v=>fmt(v))).call(g=>g.select('.domain').remove());
  svg.append('text').attr('class','ax-title').attr('x',W-m.r).attr('y',H-10).attr('text-anchor','end').text(`${titX} (${unX}${logX? ', escala logarítmica':''})`);
  svg.append('text').attr('class','ax-title').attr('x',m.l).attr('y',m.t-4).text('Notícias por 100 mil hab. (recorte)');
  const xs=pts.map(d=>logX? Math.log10(d.x) : d.x), ys=pts.map(d=>d.y), cr=pts.length>3? correlacoes(xs,ys) : null;
  if(cr){ const xd=x.domain(), f=v=>cr.a+cr.b*(logX? Math.log10(v) : v);
    const xs2 = logX? d3.range(0,41).map(i=>xd[0]*Math.pow(xd[1]/xd[0], i/40)) : [xd[0], xd[1]];
    svg.append('path').attr('class','trend').attr('d', d3.line().x(v=>x(v)).y(v=>y(Math.max(y.domain()[0], f(v))))(xs2)); }
  const tip=tipFor(box);
  svg.append('g').selectAll('circle').data([...pts].sort((a,q)=>q.n-a.n)).join('circle').attr('cx',d=>x(d.x)).attr('cy',d=>y(d.y)).attr('r',d=>rr(d.n))
    .attr('fill',d=>REG_COR.get(d.reg)||COR_OUTROS).attr('fill-opacity',.82).attr('class','sc-pt').style('cursor','pointer')
    .on('mousemove',(e,d)=>tip.show(e, d.p, [`${fmt(d.n)} notícias · ${nfmt1(d.y)} por 100 mil hab.`, `${titX}: ${d.x.toLocaleString('pt-BR',{maximumFractionDigits:2})} ${unX}`, d.reg]))
    .on('mouseleave',()=>tip.hide()).on('click',(e,d)=>toggleFilter('provincia', d.i));
  // rótulos sem sobreposição: os de maior número de notícias têm prioridade
  const curtoP = p => p.replace('CABA (Ciudad de Buenos Aires)','CABA').replace('Santiago del Estero','Sgo. del Estero').replace('Tierra del Fuego','T. del Fuego');
  const ocupados=[]; const rot=[];
  [...pts].sort((a,q)=>q.n-a.n).forEach(d=>{ const tx=curtoP(d.p), w=tx.length*5.6, bx=[x(d.x)+rr(d.n)+3, y(d.y)-5, x(d.x)+rr(d.n)+3+w, y(d.y)+6];
    const bate = ocupados.some(o=>!(bx[2]<o[0]||bx[0]>o[2]||bx[3]<o[1]||bx[1]>o[3])) || bx[2]>W-2;
    if(!bate){ ocupados.push(bx); rot.push([d,tx]); } });
  svg.append('g').selectAll('text').data(rot).join('text').attr('class','sc-label').attr('x',([d])=>x(d.x)+rr(d.n)+3).attr('y',([d])=>y(d.y)+3.5).text(([,tx])=>tx);
  box.querySelectorAll('.net-legend').forEach(e=>e.remove());
  const lgd=el('div','net-legend'); REG_ORDEM.forEach(r=>{ const s=el('span'); const sw=el('i'); sw.style.background=REG_COR.get(r); s.append(sw, document.createTextNode(r)); lgd.append(s); }); box.append(lgd);
  const f2 = v => v.toLocaleString('pt-BR',{minimumFractionDigits:2, maximumFractionDigits:2});
  $('ctxMeta').textContent=`${pts.length} jurisdições`;
  $('ctxNote').textContent = `Cada ponto é uma jurisdição (área ∝ número de notícias; cor = região estatística, com Buenos Aires em Pampeana). Eixo vertical: notícias que citam a província por 100 mil habitantes (Censo 2022, resultados definitivos), no recorte atual. `
    + (cr? `Correlação de Pearson r = ${f2(cr.r)}${logX? ' (com o logaritmo do indicador)' : ''}; correlação de postos de Spearman ρ = ${f2(cr.rho)}; n = ${pts.length}. ` : '')
    + 'Associação entre agregados territoriais não indica causalidade nem se aplica a indivíduos (falácia ecológica); a cobertura da imprensa também varia entre províncias.';
  renderCtxTabela(md);
  renderCtxRegioes(b);
  $('ctxSources').textContent = 'Fontes: INDEC, Censo Nacional de Población, Hogares y Viviendas 2022, resultados definitivos (população); área calculada pelo projeto em projeção equivalente; Ministerio de Seguridad Nacional, SNIC-SAT, Informe de Homicidios Dolosos 2024 (homicídios 2023 e 2024); INDEC, Encuesta Permanente de Hogares: pobreza e indigência no 2º semestre de 2024 e mercado de trabalho no 4º trimestre de 2024 (regiões). Detalhes em pipeline/referencias/contexto/FONTES.md no repositório.';
}

function barCell(td, v, max, txt, cor){
  const w=el('div','cellbar'); const s=el('span'); s.style.width=(max? Math.max(1,v/max*100) : 0)+'%'; if(cor) s.style.background=cor; w.append(s); td.append(w, el('b',null,txt)); }

function renderCtxTabela(md){
  const box=$('ctxTable'); box.textContent='';
  const lin = PROVS_FC.filter(f=>f.properties.pi>=0 && POP[f.properties.pi]).map(f=>{ const p=f.properties.p, i=f.properties.pi, c=CTX.provincias[p]||{};
    return { p, i, reg:PROV_REG.get(p), noticias:md.c.get(i)||0, taxa:md.rate(i), pop:c.populacao_2022, dens:c.densidade_hab_km2, hom:c.taxa_homicidios_2024 }; });
  const cols=[['p','Província'],['reg','Região'],['noticias','Notícias'],['taxa','Notícias / 100 mil hab.'],['pop','População 2022'],['dens','Hab./km²'],['hom','Homicídios / 100 mil hab. (2024)']];
  lin.sort((a,q)=>{ const A=a[CTXV.ord], B=q[CTXV.ord]; const r = typeof A==='string'? A.localeCompare(B,'es') : (A??-1)-(B??-1); return CTXV.desc? -r : r; });
  const mx={ noticias:d3.max(lin,d=>d.noticias), taxa:d3.max(lin,d=>d.taxa), hom:d3.max(lin,d=>d.hom||0) };
  const t=el('table','ctx-table'), th=el('thead'), tr=el('tr');
  cols.forEach(([k,l])=>{ const h=el('th',null,l+(CTXV.ord===k? (CTXV.desc?' ↓':' ↑') : '')); h.tabIndex=0; h.style.cursor='pointer';
    const go=()=>{ if(CTXV.ord===k) CTXV.desc=!CTXV.desc; else { CTXV.ord=k; CTXV.desc = !(k==='p'||k==='reg'); } renderCtxTabela(md); }; h.onclick=go; h.onkeydown=e=>{ if(e.key==='Enter') go(); }; tr.append(h); });
  th.append(tr); t.append(th);
  const tb=el('tbody');
  lin.forEach(d=>{ const r=el('tr');
    const c1=el('td','nm'); c1.append(el('i','dot')); c1.firstChild.style.background=REG_COR.get(d.reg); c1.append(document.createTextNode(d.p)); r.append(c1);
    r.append(el('td','mut',d.reg));
    const c3=el('td','bar'); barCell(c3, d.noticias, mx.noticias, fmt(d.noticias), '#e0a106'); r.append(c3);
    const c4=el('td','bar'); barCell(c4, d.taxa, mx.taxa, nfmt1(d.taxa), '#5fa3dc'); r.append(c4);
    r.append(el('td','num', d.pop? fmt(d.pop) : '—'));
    r.append(el('td','num', d.dens!=null? d.dens.toLocaleString('pt-BR',{maximumFractionDigits:1}) : '—'));
    const c7=el('td','bar'); if(d.hom!=null) barCell(c7, d.hom, mx.hom, d.hom.toLocaleString('pt-BR',{minimumFractionDigits:2}), '#957d58'); else c7.textContent='—'; r.append(c7);
    r.onclick=()=>toggleFilter('provincia', d.i); r.style.cursor='pointer';
    tb.append(r); });
  t.append(tb); box.append(t);
}

function renderCtxRegioes(b){
  const box=$('ctxRegions'); box.textContent='';
  const rows=b.filter(r=>match(r,'region')), c=keepPlaces(counts(rows,'region'),'region',spatialCons('region')), N=rows.length;
  const lin=REG_ORDEM.map(r=>{ const k=REG_VALS.indexOf(r), e=CTX.regioes[r]||{}; return { r, k, n: k>=0? (c.get(k)||0) : 0, pob:e.pobreza_personas_2s2024, ind:e.indigencia_personas_2s2024, des:e.desocupacao_4t2024 }; });
  const mx={ n:d3.max(lin,d=>d.n)||1, pob:d3.max(lin,d=>d.pob||0), ind:d3.max(lin,d=>d.ind||0), des:d3.max(lin,d=>d.des||0) };
  const t=el('table','ctx-table'); const th=el('thead'); const tr=el('tr');
  ['Região','Notícias (recorte)','Pobreza, % pessoas (2º sem. 2024)','Indigência, % pessoas (2º sem. 2024)','Desocupação, % (4º trim. 2024)'].forEach(h=>tr.append(el('th',null,h)));
  th.append(tr); t.append(th); const tb=el('tbody');
  const p1 = v => v==null? '—' : v.toLocaleString('pt-BR',{minimumFractionDigits:1, maximumFractionDigits:1});
  lin.forEach(d=>{ const r=el('tr'); const c1=el('td','nm'); c1.append(el('i','dot')); c1.firstChild.style.background=REG_COR.get(d.r); c1.append(document.createTextNode(d.r)); r.append(c1);
    const c2=el('td','bar'); barCell(c2, d.n, mx.n, `${fmt(d.n)} · ${pct(d.n,N)}`, '#e0a106'); r.append(c2);
    [['pob','#957d58'],['ind','#5e4c33'],['des','#5fa3dc']].forEach(([k,cor])=>{ const td=el('td','bar'); if(d[k]!=null) barCell(td, d[k], mx[k], p1(d[k]), cor); else td.textContent='—'; r.append(td); });
    if(d.k>=0){ r.onclick=()=>toggleFilter('region', d.k); r.style.cursor='pointer'; }
    tb.append(r); });
  t.append(tb); box.append(t);
}
