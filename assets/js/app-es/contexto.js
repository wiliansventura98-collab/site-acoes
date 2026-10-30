/* GERADO por i18n/ferramenta.js a partir de assets/js/app/contexto.js; não edite: edite o original e i18n/es.json */
var IDIOMA='es';
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
const CTX_ROT = { densidade_hab_km2:['Densidad demográfica, 2022','hab./km²',true], populacao_2022:['Población, 2022','habitantes',true],
  taxa_homicidios_2024:['Homicidios dolosos, 2024','por 100 mil hab.',false] };
// indicadores do Censo 2022 (INDEC, Geoportal): disponíveis por província e por departamento
const SO_PROV = new Set(['densidade_hab_km2','populacao_2022','taxa_homicidios_2024']);
IND.forEach(d=>{ CTX_ROT['i_'+d.k]=[indTit(d), d.unidade, d.k==='dens']; });
LUTAS_PROV.forEach(d=>{ CTX_ROT[d.campo]=[`${d.titulo}, ${d.ano}`, d.unidade, false]; SO_PROV.add(d.campo); });
// chaves dos indicadores ligados às lutas (usadas também na Síntese)
const CTX_LUTAS = new Set([...IND.filter(d=>(d.grupo||'lutas')==='lutas').map(d=>'i_'+d.k), ...LUTAS_PROV.map(d=>d.campo)]);
(()=>{ if(!IND.length) return; const s=$('ctxX');
  const pre=document.createElement('optgroup'); pre.label='Controles y violencia · solo por provincia'; [...s.querySelectorAll(':scope > option')].forEach(o=>pre.append(o));
  const grupo=(g, rot)=>IND_TEMAS(g).forEach(t=>{ const og=document.createElement('optgroup'); og.label=`${rot}${t}`;
    IND.filter(d=>d.tema===t && (d.grupo||'lutas')===g).forEach(d=>{ const o=document.createElement('option'); o.value='i_'+d.k; o.textContent=indTit(d)+(d.k==='dens'? ' (escala log)' : ''); og.append(o); }); s.append(og); });
  grupo('lutas','');
  if(LUTAS_PROV.length){ const og=document.createElement('optgroup'); og.label='Economía popular y violencia de género · solo por provincia';
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
  const svg=d3.select(box).append('svg').attr('viewBox',`0 0 ${W} ${H}`).attr('width','100%').attr('role','img').attr('aria-label','Dispersión: noticias por 100 mil habitantes e indicador');
  svg.append('g').attr('class','grid').selectAll('line').data(y.ticks(5)).join('line').attr('x1',m.l).attr('x2',W-m.r).attr('y1',d=>y(d)).attr('y2',d=>y(d));
  const ticksLog = CTXV.x==='populacao_2022'? [1e5,3e5,1e6,3e6,1e7] : [0.1,1,10,100,1000,10000];
  const fx = v => v>=1e6? (v/1e6).toLocaleString('es-AR')+' mi' : v>=1e3 && CTXV.x==='populacao_2022'? (v/1e3).toLocaleString('es-AR')+' mil' : fmt(v);
  const ax = d3.axisBottom(x); if(logX) ax.tickValues(ticksLog.filter(v=>v>=x.domain()[0] && v<=x.domain()[1])).tickFormat(fx); else ax.ticks(6).tickFormat(v=>fmt(v));
  svg.append('g').attr('class','axis').attr('transform',`translate(0,${H-m.b})`).call(ax);
  svg.append('g').attr('class','axis').attr('transform',`translate(${m.l},0)`).call(d3.axisLeft(y).ticks(5).tickFormat(v=>fmt(v))).call(g=>g.select('.domain').remove());
  svg.append('text').attr('class','ax-title').attr('x',W-m.r).attr('y',H-10).attr('text-anchor','end').text(`${titX} (${unX}${logX? ', escala logarítmica':''})`);
  svg.append('text').attr('class','ax-title').attr('x',m.l).attr('y',m.t-4).text(`Noticias por 100 mil hab. (recorte, por ${dep? 'departamento' : 'provincia'})`);
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
    q(W-m.r-4, m.t+12, 'indicador alto · más noticias', 'end'); q(m.l+6, m.t+12, 'indicador bajo · más noticias', 'start');
    q(W-m.r-4, H-m.b-6, 'indicador alto · menos noticias', 'end'); q(m.l+6, H-m.b-6, 'indicador bajo · menos noticias', 'start');
  }
  const prev=d=>cr? cr.a+cr.b*(logX? Math.log10(d.x) : d.x) : d.y;
  pts.forEach(d=>{ d.res=d.y-prev(d); });
  const sdRes=d3.deviation(pts,d=>d.res)||1;
  // destaques: resíduo padronizado (observado − previsto pela reta) ÷ desvio-padrão dos resíduos; |z| ≥ 1,5, até 4 de cada lado
  const LIM_Z=1.5; pts.forEach(d=>{ d.prev=prev(d); d.z=d.res/sdRes; });
  const acima=[...pts].filter(d=>d.n>0 && d.z>=LIM_Z).sort((a,q)=>q.z-a.z).slice(0,4), abaixo=[...pts].filter(d=>d.z<=-LIM_Z).sort((a,q)=>a.z-q.z).slice(0,4);
  const dest=new Set([...acima,...abaixo]);
  const tip=tipFor(box);
  svg.append('g').selectAll('circle').data([...pts].sort((a,q)=>q.n-a.n)).join('circle').attr('cx',d=>x(d.x)).attr('cy',d=>y(d.y)).attr('r',d=>rr(d.n))
    .attr('fill',d=>REG_COR.get(d.reg)||COR_OUTROS).attr('fill-opacity',d=> dep && !d.n? .28 : .82).attr('class','sc-pt').style('cursor','pointer')
    .on('mousemove',(e,d)=>tip.show(e, d.p, [`${fmt(d.n)} noticias · ${nfmt1(d.y)} por 100 mil hab.`, `${titX}: ${d.x.toLocaleString('es-AR',{maximumFractionDigits:2})} ${unX}`, d.reg]))
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
  const sep=el('b',null,'Destacados y líneas'); sep.style.marginTop='6px'; lgd.append(sep);
  [[COR_ALTO,'Contorno naranja: muy por encima de la tendencia (el lugar tiene más noticias por habitante de lo que la recta prevé para su valor del indicador, con una diferencia de 1,5 desviaciones estándar o más)'],[COR_BAIXO,'Contorno azul: muy por debajo de la tendencia (diferencia de −1,5 desviaciones estándar o menos)'],['#9aa6b2','Líneas grises: medianas (la mitad de los lugares a cada lado)'],['#7c8aa0','Línea punteada: tendencia media']].forEach(([c,t],j)=>{
    const sp=el('span'); const sw=el('i'); sw.style.background= j<2? 'transparent' : c; if(j<2){ sw.style.border=`2.5px solid ${c}`; } else { sw.style.height='3px'; sw.style.borderRadius='0'; } sp.append(sw, document.createTextNode(t)); lgd.append(sp); });
  box.append(lgd);
  const nfmt2v = v => (v<0? '−' : '') + Math.abs(v).toLocaleString('es-AR',{maximumFractionDigits:2, minimumFractionDigits:2});
  const f2 = v => (v<0? '−' : '') + Math.abs(v).toLocaleString('es-AR',{minimumFractionDigits:2, maximumFractionDigits:2});
  $('ctxMeta').textContent= dep? `${fmt(pts.length)} departamentos · ${fmt(pts.filter(d=>d.n).length)} con noticias` : `${pts.length} jurisdicciones`;
  const defX = IND.find(d=>'i_'+d.k===CTXV.x) || LUTAS_PROV.find(d=>d.campo===CTXV.x);
  { const rho=cr? cr.rho : 0, ar=Math.abs(rho), discorda = cr && Math.sign(cr.r)!==Math.sign(cr.rho) && Math.max(Math.abs(cr.r),ar)>=0.1, forca= discorda? 'inconsistente' : ar<0.1? 'prácticamente ninguna' : ar<0.3? 'débil' : ar<0.6? 'moderada' : 'fuerte';
    const nomeInd=(t=>/^[A-ZÁÉÍÓÚ][a-záéíóúâêôãõç]/.test(t)? t.charAt(0).toLowerCase()+t.slice(1) : t)(titX.replace(/, 20\d\d$/,'')), uni=dep? 'departamentos' : 'provincias';
    const sentido = discorda? `la línea de tendencia (Pearson, r = ${f2(cr.r)}) y el orden de los lugares (Spearman) apuntan en direcciones opuestas, señal de que pocos casos extremos tiran de la línea; en la práctica, no hay una relación consistente entre ${nomeInd} y noticias por habitante` : ar<0.1? `no hay una relación clara entre ${nomeInd} y noticias por habitante` : rho>0? `onde ${nomeInd} es mayor, tiende a haber <b>más</b> noticias por habitante` : `onde ${nomeInd} es mayor, tiende a haber <b>menos</b> noticias por habitante`;
    const nfz=v=>(v<0? '−' : '+')+Math.abs(v).toLocaleString('es-AR',{maximumFractionDigits:1, minimumFractionDigits:1});
    const lista=l=>l.map(d=>`${d.p.replace(/ \((Buenos Aires|[^)]+)\)$/,'')} (${nfmt1(d.y)} noticias por 100 mil hab., cuando la tendencia preveía ${nfmt1(Math.max(0,d.prev))}; ${nfz(d.z)} desviaciones estándar)`).join('; ');
    const Lg=$('ctxLeitura'); Lg.hidden=!cr;
    if(cr) Lg.innerHTML=`<b>Lectura:</b> relación <b>${forca}</b> (ρ = ${f2(rho)}): ${sentido}, entre ${fmt(pts.length)} ${uni}.` + (acima.length? ` <span style="color:#c45a00">●</span> Muy <b>por encima</b> de lo esperado por la tendencia: ${lista(acima)}.` : '') + (abaixo.length? ` <span style="color:#2569ad">●</span> Muy <b>por debajo</b>: ${lista(abaixo)}.` : '') + ` Los cuadrantes usan las medianas de los dos ejes.`
      + `<details class="calc"><summary>Cómo se calculó</summary><ol>`
      + `<li><b>Eje vertical (tasa):</b> número de noticias del recorte que citan el lugar ÷ población del Censo 2022 × 100.000. Una noticia que cita dos lugares cuenta para ambos; las noticias nacionales o virtuales, sin lugar, quedan fuera.</li>`
      + `<li><b>Relación (ρ de Spearman):</b> ordena los lugares por el indicador y por la tasa y mide si los dos órdenes coinciden: +1 = mismo orden, −1 = orden inverso, 0 = ninguna relación. Hasta ±0,3 es débil; de ±0,3 a ±0,6, moderada; por encima, fuerte. El r de Pearson, en la nota debajo del gráfico, mide lo mismo con la recta.</li>`
      + `<li><b>Tendencia (línea punteada):</b> recta de mínimos cuadrados que mejor resume la relación${logX? ', calculada con el logaritmo del indicador' : ''} (tasa prevista = ${nfmt2v(cr.a)} ${cr.b<0? '−' : '+'} ${Math.abs(cr.b).toLocaleString('es-AR',{maximumSignificantDigits:3})} × ${logX? 'log₁₀ del indicador' : 'indicador'}).</li>`
      + `<li><b>Muy por encima o muy por debajo:</b> para cada lugar, la recta da la tasa “prevista” por su valor del indicador. La diferencia entre la tasa observada y la prevista (el residuo) se divide por la desviación estándar de todos los residuos (${nfmt2v(sdRes)} noticias por 100 mil hab.). Quien queda a <b>+1,5 desviaciones estándar o más</b> recibe contorno naranja; a <b>−1,5 o menos</b>, contorno azul. Se muestran hasta cuatro de cada lado. En otras palabras: son los lugares que el indicador por sí solo no explica, y que merecen una mirada atenta.</li>`
      + `</ol></details>`; }
  $('ctxNote').textContent = (dep? `Cada punto es un departamento o partido (área ∝ número de noticias; puntos claros = sin noticias en el recorte; color = región estadística). Eje vertical: noticias que citan el departamento por 100 mil habitantes (Censo 2022), en el recorte actual. `
      : `Cada punto es una jurisdicción (área ∝ número de noticias; color = región estadística, con Buenos Aires en Pampeana). Eje vertical: noticias que citan la provincia por 100 mil habitantes (Censo 2022, resultados definitivos), en el recorte actual. `)
    + (defX && defX.definicao? `Indicador${defX.fonte? '' : ' (INDEC)'}: ${defX.definicao.split(/\n/)[0]} ` : '') + (defX && defX.fonte && !/^INDEC/.test(defX.fonte)? `Fonte: ${defX.fonte}. ` : '')
    + (cr? `Correlación de Pearson r = ${f2(cr.r)}${logX? ' (con el logaritmo del indicador)' : ''}; correlación de rangos de Spearman ρ = ${f2(cr.rho)}; n = ${pts.length}. ` : '')
    + 'La asociación entre agregados territoriales no indica causalidad ni se aplica a individuos (falacia ecológica); la cobertura de la prensa también varía entre provincias.';
  renderCtxTabela(dep? mapData(b.filter(r=>match(r,'provincia')),'prov') : md);
  renderCtxRegioes(b);
  $('ctxSources').textContent = 'Fuentes: RENABAP, Registro Nacional de Barrios Populares (versión del 05/12/2023); ReNaTEP, registro de la economía popular (datos del 04/04/2023); Dirección Nacional Electoral, elecciones generales de 2023 (categoría Presidente, resultados provisorios); Corte Suprema de Justicia, Registro Nacional de Femicidios 2024; INDEC, Censo Nacional de Población, Hogares y Viviendas 2022, resultados definitivos (población) e indicadores por provincia y departamento obtenidos en el Geoportal estadístico del INDEC (portalgeoestadistico.indec.gob.ar: privación material de los hogares, servicios, conectividad, educación, trabajo, salud, estructura demográfica, diversidad y migración); superficie calculada por el proyecto en proyección equivalente; Ministerio de Seguridad Nacional, SNIC-SAT, Informe de Homicidios Dolosos 2024 (homicidios 2024); INDEC, Encuesta Permanente de Hogares: pobreza e indigencia en el segundo semestre de 2024 y mercado de trabajo en el cuarto trimestre de 2024 (regiones). Detalles en pipeline/referencias/contexto/FONTES.md en el repositorio.';
}

function barCell(td, v, max, txt, cor){
  const w=el('div','cellbar'); const s=el('span'); s.style.width=(max? Math.max(1,v/max*100) : 0)+'%'; if(cor) s.style.background=cor; w.append(s); td.append(w, el('b',null,txt)); }

function renderCtxTabela(md){
  const box=$('ctxTable'); box.textContent='';
  const lin = PROVS_FC.filter(f=>f.properties.pi>=0 && POP[f.properties.pi]).map(f=>{ const p=f.properties.p, i=f.properties.pi, c=CTX.provincias[p]||{};
    return { p, i, reg:PROV_REG.get(p), noticias:md.c.get(i)||0, taxa:md.rate(i), pop:c.populacao_2022, dens:c.densidade_hab_km2, hom:c.taxa_homicidios_2024,
      ipmh:c.i_ipmh, desocup:c.i_desocup, secund:c.i_secund, cloaca:c.i_cloaca }; });
  const cols=[['p','Provincia'],['reg','Región'],['noticias','Noticias'],['taxa','Noticias / 100 mil hab.'],['pop','Población 2022'],['dens','Hab./km²'],['hom','Homicidios / 100 mil hab. (2024)'],
    ['ipmh','Privación material, % hogares (2022)'],['desocup','Desocupación, % (Censo 2022)'],['secund','Secundario completo, % 25+ (2022)'],['cloaca','Cloaca en red, % hogares (2022)']];
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
    r.append(el('td','num', d.dens!=null? d.dens.toLocaleString('es-AR',{maximumFractionDigits:1}) : '—'));
    const c7=el('td','bar'); if(d.hom!=null) barCell(c7, d.hom, mx.hom, d.hom.toLocaleString('es-AR',{minimumFractionDigits:2}), '#957d58'); else c7.textContent='—'; r.append(c7);
    [['ipmh','#5e4c33'],['desocup','#5fa3dc'],['secund','#2f8a74'],['cloaca','#1c4f8a']].forEach(([k,cor])=>{ const td=el('td','bar'); if(d[k]!=null) barCell(td, d[k], mx[k], d[k].toLocaleString('es-AR',{minimumFractionDigits:1, maximumFractionDigits:1}), cor); else td.textContent='—'; r.append(td); });
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
  ['Región','Noticias (recorte)','Pobreza, % personas (segundo semestre de 2024)','Indigencia, % personas (segundo semestre de 2024)','Desocupación, % (cuarto trimestre de 2024)'].forEach(h=>tr.append(el('th',null,h)));
  th.append(tr); t.append(th); const tb=el('tbody');
  const p1 = v => v==null? '—' : v.toLocaleString('es-AR',{minimumFractionDigits:1, maximumFractionDigits:1});
  lin.forEach(d=>{ const r=el('tr'); const c1=el('td','nm'); c1.append(el('i','dot')); c1.firstChild.style.background=REG_COR.get(d.r); c1.append(document.createTextNode(d.r)); r.append(c1);
    const c2=el('td','bar'); barCell(c2, d.n, mx.n, `${fmt(d.n)} · ${pct(d.n,N)}`, '#e0a106'); r.append(c2);
    [['pob','#957d58'],['ind','#5e4c33'],['des','#5fa3dc']].forEach(([k,cor])=>{ const td=el('td','bar'); if(d[k]!=null) barCell(td, d[k], mx[k], p1(d[k]), cor); else td.textContent='—'; r.append(td); });
    if(d.k>=0){ r.onclick=()=>toggleFilter('region', d.k); r.style.cursor='pointer'; }
    tb.append(r); });
  t.append(tb); box.append(t);
}
