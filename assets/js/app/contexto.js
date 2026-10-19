/*
 * Contexto
 * Relaciona as notícias com indicadores oficiais: dispersão por província (notícias por 100 mil hab.
 * × indicador escolhido), panorama provincial ordenável e quadro das regiões estatísticas.
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

const CTXV = { x:'densidade_hab_km2', ord:'noticias', desc:true, nivel:'prov' };
try{ Object.assign(CTXV, JSON.parse(localStorage.getItem('as24c')||'{}')); }catch(e){}
$('ctxX').onchange=e=>{ CTXV.x=e.target.value; render(); };
document.querySelectorAll('#ctxNivel button').forEach(b=>b.onclick=()=>{ CTXV.nivel=b.dataset.v; render(); });
const REG_ORDEM = ['Gran Buenos Aires','Pampeana','Noroeste (NOA)','Noreste (NEA)','Cuyo','Patagonia'];
const REG_COR = new Map(REG_ORDEM.map((r,i)=>[r, ['#1c4f8a','#5fa3dc','#c96a1b','#2f8a74','#9c3d0f','#6d5aa8'][i]]));
const PROV_REG = (()=>{ const m=new Map(); DEPTS.forEach(f=>{ const p=f.properties.p, r=f.properties.r; const c=m.get(p)||new Map(); c.set(r,(c.get(r)||0)+1); m.set(p,c); });
  const out=new Map(); m.forEach((c,p)=>{ out.set(p, p==='Buenos Aires'? 'Pampeana' : [...c].sort((a,b)=>b[1]-a[1])[0][0]); }); return out; })();
const CTX_ROT = { densidade_hab_km2:['Densidade demográfica, 2022','hab./km²',true], populacao_2022:['População, 2022','habitantes',true],
  taxa_homicidios_2024:['Homicídios dolosos, 2024','por 100 mil hab.',false], taxa_homicidios_2023:['Homicídios dolosos, 2023','por 100 mil hab.',false] };
// indicadores do Censo 2022 (INDEC, Geoportal): disponíveis por província e por departamento
const SO_PROV = new Set(['densidade_hab_km2','populacao_2022','taxa_homicidios_2024','taxa_homicidios_2023']);
IND.forEach(d=>{ CTX_ROT['i_'+d.k]=[indTit(d), d.unidade, d.k==='dens']; });
LUTAS_PROV.forEach(d=>{ CTX_ROT[d.campo]=[`${d.titulo}, ${d.ano}`, d.unidade, false]; SO_PROV.add(d.campo); });
// chaves dos indicadores ligados às lutas (usadas também na Síntese)
const CTX_LUTAS = new Set([...IND.filter(d=>(d.grupo||'lutas')==='lutas').map(d=>'i_'+d.k), ...LUTAS_PROV.map(d=>d.campo)]);
(()=>{ if(!IND.length) return; const s=$('ctxX');
  const pre=document.createElement('optgroup'); pre.label='Controles e violência · só por província'; [...s.querySelectorAll(':scope > option')].forEach(o=>pre.append(o));
  const grupo=(g, rot)=>IND_TEMAS(g).forEach(t=>{ const og=document.createElement('optgroup'); og.label=`${rot}${t}`;
    IND.filter(d=>d.tema===t && (d.grupo||'lutas')===g).forEach(d=>{ const o=document.createElement('option'); o.value='i_'+d.k; o.textContent=indTit(d)+(d.k==='dens'? ' (escala log)' : ''); og.append(o); }); s.append(og); });
  grupo('lutas','');
  if(LUTAS_PROV.length){ const og=document.createElement('optgroup'); og.label='Economia popular e violência de gênero · só por província';
    LUTAS_PROV.forEach(d=>{ const o=document.createElement('option'); o.value=d.campo; o.textContent=`${d.titulo}, ${d.ano} (${d.unidade})`; og.append(o); }); s.append(og); }
  grupo('controle','Controles demográficos: '); s.append(pre); })();

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
  if(!CTX_ROT[CTXV.x]) CTXV.x='densidade_hab_km2';
  const dep = CTXV.nivel==='dept' && IND.length;
  if(dep && SO_PROV.has(CTXV.x)) CTXV.x = CTXV.x==='densidade_hab_km2'? 'i_dens' : 'i_ipmh';
  try{ localStorage.setItem('as24c', JSON.stringify({x:CTXV.x, nivel:CTXV.nivel})); }catch(e){}
  $('ctxX').value=CTXV.x;
  $('ctxX').querySelectorAll('option').forEach(o=>{ o.disabled = dep && SO_PROV.has(o.value); });
  document.querySelectorAll('#ctxNivel button').forEach(x=>x.setAttribute('aria-pressed', String(x.dataset.v===(dep? 'dept':'prov'))));
  const box=$('ctxChart'); box.querySelectorAll('svg').forEach(s=>s.remove());
  if(!HAS_D3) return;
  const vid = dep? 'departamento' : 'provincia';
  const rows=b.filter(r=>match(r,vid));
  const md=mapData(rows, dep? 'dept' : 'prov');
  const [titX, unX, logX] = CTX_ROT[CTXV.x];
  const pts = dep
    ? DEPTS.filter(f=>(IND_DEP[f.id]||{}).pop).map(f=>{ const i=f.properties.di, v=IND_DEP[f.id];
        return { p: f.properties.n, i, n: i>=0? (md.c.get(i)||0) : 0, y: i>=0? md.rate(i) : 0, x: v[CTXV.x.slice(2)], reg: f.properties.r }; })
      .filter(d=>d.x!=null && (!logX || d.x>0))
    : PROVS_FC.filter(f=>f.properties.pi>=0 && POP[f.properties.pi]).map(f=>{ const p=f.properties.p, i=f.properties.pi, c=CTX.provincias[p]||{};
        return { p, i, n: md.c.get(i)||0, y: md.rate(i), x: c[CTXV.x], reg: PROV_REG.get(p) }; }).filter(d=>d.x!=null && (!logX || d.x>0));
  const W=Math.max(320, box.clientWidth), H=Math.round(Math.max(380, Math.min(560, W*0.52))), m={t:16,r:24,b:48,l:58};
  const x=(logX? d3.scaleLog() : d3.scaleLinear()).domain(d3.extent(pts,d=>d.x)).nice().range([m.l, W-m.r]);
  const y=d3.scaleLinear().domain([0, d3.max(pts,d=>d.y)||1]).nice().range([H-m.b, m.t]);
  const rr=d3.scaleSqrt().domain([0, d3.max(pts,d=>d.n)||1]).range(dep? [1.6, W<640? 11 : 16] : [3, W<640? 14 : 20]);
  const svg=d3.select(box).append('svg').attr('viewBox',`0 0 ${W} ${H}`).attr('width','100%').attr('role','img').attr('aria-label','Dispersão: notícias por 100 mil habitantes e indicador');
  svg.append('g').attr('class','grid').selectAll('line').data(y.ticks(5)).join('line').attr('x1',m.l).attr('x2',W-m.r).attr('y1',d=>y(d)).attr('y2',d=>y(d));
  const ticksLog = CTXV.x==='populacao_2022'? [1e5,3e5,1e6,3e6,1e7] : [0.1,1,10,100,1000,10000];
  const fx = v => v>=1e6? (v/1e6).toLocaleString('pt-BR')+' mi' : v>=1e3 && CTXV.x==='populacao_2022'? (v/1e3).toLocaleString('pt-BR')+' mil' : fmt(v);
  const ax = d3.axisBottom(x); if(logX) ax.tickValues(ticksLog.filter(v=>v>=x.domain()[0] && v<=x.domain()[1])).tickFormat(fx); else ax.ticks(6).tickFormat(v=>fmt(v));
  svg.append('g').attr('class','axis').attr('transform',`translate(0,${H-m.b})`).call(ax);
  svg.append('g').attr('class','axis').attr('transform',`translate(${m.l},0)`).call(d3.axisLeft(y).ticks(5).tickFormat(v=>fmt(v))).call(g=>g.select('.domain').remove());
  svg.append('text').attr('class','ax-title').attr('x',W-m.r).attr('y',H-10).attr('text-anchor','end').text(`${titX} (${unX}${logX? ', escala logarítmica':''})`);
  svg.append('text').attr('class','ax-title').attr('x',m.l).attr('y',m.t-4).text(`Notícias por 100 mil hab. (recorte, por ${dep? 'departamento' : 'província'})`);
  const xs=pts.map(d=>logX? Math.log10(d.x) : d.x), ys=pts.map(d=>d.y), cr=pts.length>3? correlacoes(xs,ys) : null;
  if(cr){ const xd=x.domain(), f=v=>cr.a+cr.b*(logX? Math.log10(v) : v);
    const xs2 = logX? d3.range(0,41).map(i=>xd[0]*Math.pow(xd[1]/xd[0], i/40)) : [xd[0], xd[1]];
    svg.append('path').attr('class','trend').attr('d', d3.line().x(v=>x(v)).y(v=>y(Math.max(y.domain()[0], f(v))))(xs2)); }
  // quadrantes pelas medianas e lugares fora da tendência
  const medX=d3.median(pts,d=>d.x), medY=d3.median(pts,d=>d.y);
  if(medX!=null && medY!=null){
    svg.append('line').attr('x1',x(medX)).attr('x2',x(medX)).attr('y1',m.t).attr('y2',H-m.b).attr('stroke','#9aa6b2').attr('stroke-width',1);
    svg.append('line').attr('x1',m.l).attr('x2',W-m.r).attr('y1',y(medY)).attr('y2',y(medY)).attr('stroke','#9aa6b2').attr('stroke-width',1);
    const q=(xx,yy,t,a)=>svg.append('text').attr('x',xx).attr('y',yy).attr('text-anchor',a).style('font-size','11px').style('font-weight',700).style('fill','#7c8aa0').text(t);
    q(W-m.r-4, m.t+12, 'indicador alto · mais notícias', 'end'); q(m.l+6, m.t+12, 'indicador baixo · mais notícias', 'start');
    q(W-m.r-4, H-m.b-6, 'indicador alto · menos notícias', 'end'); q(m.l+6, H-m.b-6, 'indicador baixo · menos notícias', 'start');
  }
  const prev=d=>cr? cr.a+cr.b*(logX? Math.log10(d.x) : d.x) : d.y;
  pts.forEach(d=>{ d.res=d.y-prev(d); });
  const sdRes=d3.deviation(pts,d=>d.res)||1;
  const acima=[...pts].filter(d=>d.n>0 && d.res>1.5*sdRes).sort((a,q)=>q.res-a.res).slice(0,4), abaixo=[...pts].filter(d=>d.res< -1*sdRes).sort((a,q)=>a.res-q.res).slice(0,3);
  const dest=new Set([...acima,...abaixo]);
  const tip=tipFor(box);
  svg.append('g').selectAll('circle').data([...pts].sort((a,q)=>q.n-a.n)).join('circle').attr('cx',d=>x(d.x)).attr('cy',d=>y(d.y)).attr('r',d=>rr(d.n))
    .attr('fill',d=>REG_COR.get(d.reg)||COR_OUTROS).attr('fill-opacity',d=> dep && !d.n? .28 : .82).attr('class','sc-pt').style('cursor','pointer')
    .on('mousemove',(e,d)=>tip.show(e, d.p, [`${fmt(d.n)} notícias · ${nfmt1(d.y)} por 100 mil hab.`, `${titX}: ${d.x.toLocaleString('pt-BR',{maximumFractionDigits:2})} ${unX}`, d.reg]))
    .on('mouseleave',()=>tip.hide()).on('click',(e,d)=>{ if(d.i>=0) toggleFilter(vid, d.i); });
  svg.append('g').selectAll('circle').data([...dest]).join('circle').attr('cx',d=>x(d.x)).attr('cy',d=>y(d.y)).attr('r',d=>rr(d.n)+3.5).attr('fill','none').attr('stroke',d=>d.res>0? COR_ALTO : COR_BAIXO).attr('stroke-width',2).attr('pointer-events','none');
  // rótulos sem sobreposição: os de maior número de notícias têm prioridade
  const curtoP = p => p.replace('CABA (Ciudad de Buenos Aires)','CABA').replace('Santiago del Estero','Sgo. del Estero').replace('Tierra del Fuego','T. del Fuego');
  const ocupados=[]; const rot=[];
  [...dest, ...[...pts].sort((a,q)=>q.n-a.n).filter(d=>!dest.has(d)).slice(0, dep? 12 : 99)].filter(d=>d.n>0 || !dep).forEach(d=>{ const tx=curtoP(d.p).replace(/ \((Buenos Aires|[^)]+)\)$/,''), w=tx.length*5.6, bx=[x(d.x)+rr(d.n)+3, y(d.y)-5, x(d.x)+rr(d.n)+3+w, y(d.y)+6];
    const bate = ocupados.some(o=>!(bx[2]<o[0]||bx[0]>o[2]||bx[3]<o[1]||bx[1]>o[3])) || bx[2]>W-2;
    if(!bate){ ocupados.push(bx); rot.push([d,tx]); } });
  svg.append('g').selectAll('text').data(rot).join('text').attr('class','sc-label').attr('x',([d])=>x(d.x)+rr(d.n)+3).attr('y',([d])=>y(d.y)+3.5).text(([,tx])=>tx);
  box.querySelectorAll('.net-legend').forEach(e=>e.remove());
  const lgd=el('div','net-legend'); REG_ORDEM.forEach(r=>{ const s=el('span'); const sw=el('i'); sw.style.background=REG_COR.get(r); s.append(sw, document.createTextNode(r)); lgd.append(s); });
  const sep=el('b',null,'Destaques e linhas'); sep.style.marginTop='6px'; lgd.append(sep);
  [[COR_ALTO,'Contorno laranja: muito acima da tendência (mais notícias do que o indicador faria esperar)'],[COR_BAIXO,'Contorno azul: muito abaixo da tendência'],['#9aa6b2','Linhas cinzas: medianas (metade dos lugares de cada lado)'],['#7c8aa0','Tracejado: tendência média']].forEach(([c,t],j)=>{
    const sp=el('span'); const sw=el('i'); sw.style.background= j<2? 'transparent' : c; if(j<2){ sw.style.border=`2.5px solid ${c}`; } else { sw.style.height='3px'; sw.style.borderRadius='0'; } sp.append(sw, document.createTextNode(t)); lgd.append(sp); });
  box.append(lgd);
  const f2 = v => (v<0? '−' : '') + Math.abs(v).toLocaleString('pt-BR',{minimumFractionDigits:2, maximumFractionDigits:2});
  $('ctxMeta').textContent= dep? `${fmt(pts.length)} departamentos · ${fmt(pts.filter(d=>d.n).length)} com notícias` : `${pts.length} jurisdições`;
  const defX = IND.find(d=>'i_'+d.k===CTXV.x) || LUTAS_PROV.find(d=>d.campo===CTXV.x);
  { const rho=cr? cr.rho : 0, ar=Math.abs(rho), discorda = cr && Math.sign(cr.r)!==Math.sign(cr.rho) && Math.max(Math.abs(cr.r),ar)>=0.1, forca= discorda? 'inconsistente' : ar<0.1? 'praticamente nenhuma' : ar<0.3? 'fraca' : ar<0.6? 'moderada' : 'forte';
    const nomeInd=(t=>/^[A-ZÁÉÍÓÚ][a-záéíóúâêôãõç]/.test(t)? t.charAt(0).toLowerCase()+t.slice(1) : t)(titX.replace(/, 20\d\d$/,'')), uni=dep? 'departamentos' : 'províncias';
    const sentido = discorda? `a linha de tendência (Pearson, r = ${f2(cr.r)}) e a ordem dos lugares (Spearman) apontam em direções opostas, sinal de que poucos casos extremos puxam a linha; na prática, não há relação consistente entre ${nomeInd} e notícias por habitante` : ar<0.1? `não há relação clara entre ${nomeInd} e notícias por habitante` : rho>0? `onde ${nomeInd} é maior, tende a haver <b>mais</b> notícias por habitante` : `onde ${nomeInd} é maior, tende a haver <b>menos</b> notícias por habitante`;
    const lista=l=>l.map(d=>d.p.replace(/ \((Buenos Aires|[^)]+)\)$/,'')).join(', ');
    const Lg=$('ctxLeitura'); Lg.hidden=!cr;
    if(cr) Lg.innerHTML=`<b>Leitura:</b> relação <b>${forca}</b> (ρ = ${f2(rho)}): ${sentido}, entre ${fmt(pts.length)} ${uni}.` + (acima.length? ` <span style="color:#c45a00">●</span> Muito <b>acima</b> do esperado pela tendência: ${lista(acima)}.` : '') + (abaixo.length? ` <span style="color:#2569ad">●</span> Muito <b>abaixo</b>: ${lista(abaixo)}.` : '') + ` Os quadrantes usam as medianas dos dois eixos.`; }
  $('ctxNote').textContent = (dep? `Cada ponto é um departamento ou partido (área ∝ número de notícias; pontos claros = sem notícias no recorte; cor = região estatística). Eixo vertical: notícias que citam o departamento por 100 mil habitantes (Censo 2022), no recorte atual. `
      : `Cada ponto é uma jurisdição (área ∝ número de notícias; cor = região estatística, com Buenos Aires em Pampeana). Eixo vertical: notícias que citam a província por 100 mil habitantes (Censo 2022, resultados definitivos), no recorte atual. `)
    + (defX && defX.definicao? `Indicador${defX.fonte? '' : ' (INDEC)'}: ${defX.definicao.split(/\n/)[0]} ` : '') + (defX && defX.fonte && !/^INDEC/.test(defX.fonte)? `Fonte: ${defX.fonte}. ` : '')
    + (cr? `Correlação de Pearson r = ${f2(cr.r)}${logX? ' (com o logaritmo do indicador)' : ''}; correlação de postos de Spearman ρ = ${f2(cr.rho)}; n = ${pts.length}. ` : '')
    + 'Associação entre agregados territoriais não indica causalidade nem se aplica a indivíduos (falácia ecológica); a cobertura da imprensa também varia entre províncias.';
  renderCtxTabela(dep? mapData(b.filter(r=>match(r,'provincia')),'prov') : md);
  renderCtxRegioes(b);
  $('ctxSources').textContent = 'Fontes: RENABAP, Registro Nacional de Barrios Populares (versão de 05/12/2023); ReNaTEP, registro da economia popular (dados de 04/04/2023); Dirección Nacional Electoral, eleições gerais de 2023 (categoria Presidente, resultados provisórios); Corte Suprema de Justicia, Registro Nacional de Femicidios 2024; INDEC, Censo Nacional de Población, Hogares y Viviendas 2022, resultados definitivos (população) e indicadores por província e departamento obtidos no Geoportal estadístico do INDEC (portalgeoestadistico.indec.gob.ar: privação material dos domicílios, serviços, conectividade, educação, trabalho, saúde, estrutura demográfica, diversidade e migração); área calculada pelo projeto em projeção equivalente; Ministerio de Seguridad Nacional, SNIC-SAT, Informe de Homicidios Dolosos 2024 (homicídios 2023 e 2024); INDEC, Encuesta Permanente de Hogares: pobreza e indigência no segundo semestre de 2024 e mercado de trabalho no quarto trimestre de 2024 (regiões). Detalhes em pipeline/referencias/contexto/FONTES.md no repositório.';
}

function barCell(td, v, max, txt, cor){
  const w=el('div','cellbar'); const s=el('span'); s.style.width=(max? Math.max(1,v/max*100) : 0)+'%'; if(cor) s.style.background=cor; w.append(s); td.append(w, el('b',null,txt)); }

function renderCtxTabela(md){
  const box=$('ctxTable'); box.textContent='';
  const lin = PROVS_FC.filter(f=>f.properties.pi>=0 && POP[f.properties.pi]).map(f=>{ const p=f.properties.p, i=f.properties.pi, c=CTX.provincias[p]||{};
    return { p, i, reg:PROV_REG.get(p), noticias:md.c.get(i)||0, taxa:md.rate(i), pop:c.populacao_2022, dens:c.densidade_hab_km2, hom:c.taxa_homicidios_2024,
      ipmh:c.i_ipmh, desocup:c.i_desocup, secund:c.i_secund, cloaca:c.i_cloaca }; });
  const cols=[['p','Província'],['reg','Região'],['noticias','Notícias'],['taxa','Notícias / 100 mil hab.'],['pop','População 2022'],['dens','Hab./km²'],['hom','Homicídios / 100 mil hab. (2024)'],
    ['ipmh','Privação material, % domicílios (2022)'],['desocup','Desocupação, % (Censo 2022)'],['secund','Secundário completo, % 25+ (2022)'],['cloaca','Esgoto em rede, % domicílios (2022)']];
  lin.sort((a,q)=>{ const A=a[CTXV.ord], B=q[CTXV.ord]; const r = typeof A==='string'? A.localeCompare(B,'es') : (A??-1)-(B??-1); return CTXV.desc? -r : r; });
  const mx={ noticias:d3.max(lin,d=>d.noticias), taxa:d3.max(lin,d=>d.taxa), hom:d3.max(lin,d=>d.hom||0), ipmh:d3.max(lin,d=>d.ipmh||0), desocup:d3.max(lin,d=>d.desocup||0), secund:100, cloaca:100 };
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
    [['ipmh','#5e4c33'],['desocup','#5fa3dc'],['secund','#2f8a74'],['cloaca','#1c4f8a']].forEach(([k,cor])=>{ const td=el('td','bar'); if(d[k]!=null) barCell(td, d[k], mx[k], d[k].toLocaleString('pt-BR',{minimumFractionDigits:1, maximumFractionDigits:1}), cor); else td.textContent='—'; r.append(td); });
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
  ['Região','Notícias (recorte)','Pobreza, % pessoas (segundo semestre de 2024)','Indigência, % pessoas (segundo semestre de 2024)','Desocupação, % (quarto trimestre de 2024)'].forEach(h=>tr.append(el('th',null,h)));
  th.append(tr); t.append(th); const tb=el('tbody');
  const p1 = v => v==null? '—' : v.toLocaleString('pt-BR',{minimumFractionDigits:1, maximumFractionDigits:1});
  lin.forEach(d=>{ const r=el('tr'); const c1=el('td','nm'); c1.append(el('i','dot')); c1.firstChild.style.background=REG_COR.get(d.r); c1.append(document.createTextNode(d.r)); r.append(c1);
    const c2=el('td','bar'); barCell(c2, d.n, mx.n, `${fmt(d.n)} · ${pct(d.n,N)}`, '#e0a106'); r.append(c2);
    [['pob','#957d58'],['ind','#5e4c33'],['des','#5fa3dc']].forEach(([k,cor])=>{ const td=el('td','bar'); if(d[k]!=null) barCell(td, d[k], mx[k], p1(d[k]), cor); else td.textContent='—'; r.append(td); });
    if(d.k>=0){ r.onclick=()=>toggleFilter('region', d.k); r.style.cursor='pointer'; }
    tb.append(r); });
  t.append(tb); box.append(t);
}
