/* GERADO por i18n/ferramenta.js a partir de assets/js/app/tempo.js; não edite: edite o original e i18n/es.json */
var IDIOMA='es';
/*
 * No tempo
 * Evolução mensal e pequenos múltiplos por categoria.
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

/* ---------- time ---------- */
const MES_ABBR=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
function colChart(box, data, opts){
  // data: [{k,label,n,on,off}] ; opts: {H, ymax, onClick, tipTitle}
  const W=Math.max(240, box.clientWidth), H=opts.H, m={t:opts.mt||10,r:6,b:22,l:34};
  const s=d3.select(box).append('svg').attr('viewBox',`0 0 ${W} ${H}`).attr('width','100%');
  const x=d3.scaleBand().domain(data.map(d=>d.k)).range([m.l,W-m.r]).padding(0.22);
  const y=d3.scaleLinear().domain([0, opts.ymax||d3.max(data,d=>d.n)||1]).nice().range([H-m.b,m.t]);
  s.append('g').attr('class','grid').selectAll('line').data(y.ticks(4)).join('line').attr('x1',m.l).attr('x2',W-m.r).attr('y1',d=>y(d)).attr('y2',d=>y(d));
  s.append('g').attr('class','axis').attr('transform',`translate(${m.l},0)`).call(d3.axisLeft(y).ticks(4).tickSize(0).tickPadding(6).tickFormat(d=>fmt(d))).call(g=>g.select('.domain').remove());
  s.append('g').attr('class','axis').attr('transform',`translate(0,${H-m.b})`).call(d3.axisBottom(x).tickSize(0).tickPadding(6).tickFormat(k=>data.find(d=>d.k===k).label));
  const tip=tipFor(box);
  const bw=x.bandwidth(), rr=Math.min(4,bw/2);
  s.append('g').selectAll('path').data(data).join('path')
    .attr('class',d=>'col'+(d.on?' on':'')+(d.off?' off':''))
    .attr('d',d=>{ const x0=x(d.k), y0=y(d.n), yb=y(0); const h=yb-y0; if(h<=0) return ''; const r=Math.min(rr,h); return `M${x0},${yb}V${y0+r}Q${x0},${y0} ${x0+r},${y0}H${x0+bw-r}Q${x0+bw},${y0} ${x0+bw},${y0+r}V${yb}Z`; })
    .on('mousemove',(ev,d)=>tip.show(ev, opts.tipTitle(d), [`${fmt(d.n)} noticias`])).on('mouseleave',()=>tip.hide())
    .on('click',(ev,d)=>opts.onClick&&opts.onClick(d));
  // hit areas for tiny bars
  s.append('g').selectAll('rect').data(data).join('rect').attr('x',d=>x(d.k)).attr('width',bw).attr('y',m.t).attr('height',H-m.b-m.t).attr('fill','transparent').style('cursor','pointer')
    .on('mousemove',(ev,d)=>tip.show(ev, opts.tipTitle(d), [`${fmt(d.n)} noticias`])).on('mouseleave',()=>tip.hide()).on('click',(ev,d)=>opts.onClick&&opts.onClick(d));
}
function renderTime(b){
  const main=$('timeMain'), sm=$('timeSm'); main.textContent=''; sm.textContent='';
  if(!HAS_D3){ $('timeNote').textContent='No se pudo cargar la biblioteca de gráficos en esta visualización.'; return; }
  const mesVals=VARS[VI.mes].values; const im=VI.mes;
  const rows=b.filter(r=>match(r,'mes'));
  const c=counts(rows,'mes'); const sel=st.f.mes||new Set();
  const data=mesVals.map((lab,i)=>({k:i, label:MES_ABBR[i], n:c.get(i)||0, on:sel.has(i), off:sel.size&&!sel.has(i), full:lab.split('· ')[1]}));
  $('timeMeta').textContent = fmt(rows.length)+' noticias';
  colChart(main, data, {H: 250, mt:26, onClick:d=>toggleFilter('mes', d.k, !sel.has(d.k)||sel.size>1), tipTitle:d=>d.full+' de 2024'});
  renderCal(b);
  // small multiples by selected variable
  const vid = st.v==='mes'? null : st.v;
  if(!vid){ $('smTitle').textContent='Por categoría'; $('smNote').textContent='Elija otra variable en el selector de arriba para ver las principales categorías mes a mes.'; return; }
  const v=VARS[VI[vid]], iv=VI[vid];
  const rv=b.filter(r=>match(r,'mes'));
  const tot=counts(rv, vid); const top=order(vid,tot).filter(k=>!/no informa/i.test(v.values[k])).slice(0,6);
  if(v.ordered) top.sort((a,b2)=>tot.get(b2)-tot.get(a));
  $('smTitle').textContent = v.label+' · mes a mes';
  $('smNote').textContent = `Las ${top.length} categorías más frecuentes en el recorte, en la misma escala vertical para comparar. Haga clic en una columna para filtrar categoría y mes.`;
  const grid = top.map(k=>{ const cc=new Array(12).fill(0); rv.forEach(r=>{ if(r.v[iv].includes(k)) cc[r.v[im][0]]++; }); return {k,cc}; });
  const ymax = d3.max(grid, g=>d3.max(g.cc))||1;
  grid.forEach(g=>{ const box=el('div','chart'); const h=el('h3'); h.textContent=v.values[g.k]+' · '+fmt(tot.get(g.k)); h.title=v.values[g.k]; box.append(h); sm.append(box);
    colChart(box, g.cc.map((n,i)=>({k:i,label:MES_ABBR[i].slice(0,1),n, on:false, off:false, full:MES_ABBR[i]})), {H:140, ymax, tipTitle:d=>v.values[g.k]+' · '+d.full,
      onClick:d=>{ st.f[vid]=new Set([g.k]); st.f.mes=new Set([d.k]); st.page=40; render(); $('newsSec').scrollIntoView({behavior:'smooth',block:'start'}); }}); });
}
let rz; window.addEventListener('resize',()=>{ clearTimeout(rz); rz=setTimeout(()=>{ if(TAB!=='dist') render(); },200); });

/* ---------- calendário diário (data de início da ação) ---------- */
const DIAS_SEM = ['dom','lun','mar','mié','jue','vie','sáb'];
function renderCal(b){
  const box=$('calChart'); box.querySelectorAll('svg').forEach(s=>s.remove());
  const rows=b.filter(r=>match(r,'mes'));
  const porDia=new Map(); let fora=0;
  rows.forEach(r=>{ const m=/^(\d\d)\/(\d\d)\/(\d{4})$/.exec(r.ini||''); if(!m || m[3]!=='2024'){ fora++; return; } const k=`2024-${m[2]}-${m[1]}`; porDia.set(k,(porDia.get(k)||0)+1); });
  const ini=new Date(2024,0,1), dias=d3.timeDays(ini, new Date(2025,0,1));
  const W=Math.max(320, box.clientWidth), left=34, top=20, semanas=d3.timeWeek.count(ini, new Date(2024,11,31))+1;
  const cs=Math.max(6, Math.min(18, Math.floor((W-left-8)/semanas))), H=top+7*cs+30;
  const max=d3.max([...porDia.values()])||1;
  const cor=d3.scaleQuantize().domain([1, max]).range(['#d5e6f5','#a9cdeb','#74acdf','#3f7fbf','#1c4f8a']);
  const svg=d3.select(box).append('svg').attr('viewBox',`0 0 ${W} ${H}`).attr('width','100%').attr('role','img').attr('aria-label','Calendario de acciones en 2024');
  const tip=tipFor(box);
  const fmtD=d3.timeFormat('%Y-%m-%d'), xw=d=>left+d3.timeWeek.count(ini,d)*cs, yd=d=>top+d.getDay()*cs;
  svg.append('g').selectAll('rect').data(dias).join('rect').attr('x',xw).attr('y',yd).attr('width',cs-2).attr('height',cs-2).attr('rx',2)
    .attr('fill',d=>{ const n=porDia.get(fmtD(d)); return n? cor(n) : 'var(--cal-zero)'; })
    .on('mousemove',(e,d)=>{ const n=porDia.get(fmtD(d))||0; tip.show(e, d.toLocaleDateString('es-AR',{weekday:'long', day:'2-digit', month:'long'}), [`${fmt(n)} ${n===1?'acción iniciada':'acciones iniciadas'}`]); })
    .on('mouseleave',()=>tip.hide());
  d3.range(12).forEach(mi=>{ const d=new Date(2024,mi,1); svg.append('text').attr('class','cal-lab').attr('x',xw(d)).attr('y',top-6).text(MES_ABBR[mi]); });
  [1,3,5].forEach(i=>svg.append('text').attr('class','cal-lab').attr('x',left-6).attr('y',top+i*cs+cs*0.7).attr('text-anchor','end').text(DIAS_SEM[i]));
  const lg=svg.append('g').attr('transform',`translate(${left},${top+7*cs+12})`);
  lg.append('text').attr('class','cal-lab').attr('x',0).attr('y',9).text('menos');
  ['var(--cal-zero)',...cor.range()].forEach((c,i)=>lg.append('rect').attr('x',40+i*(cs)).attr('y',0).attr('width',cs-2).attr('height',cs-2).attr('rx',2).attr('fill',c));
  lg.append('text').attr('class','cal-lab').attr('x',40+6*cs+4).attr('y',9).text(`más (máx. ${fmt(max)} por día)`);
  const top3=[...porDia].sort((a,q)=>q[1]-a[1]).slice(0,3).map(([k,n])=>{ const [y,m,d]=k.split('-'); return `${d}/${m} (${n})`; });
  $('calMeta').textContent = `${fmt(rows.length-fora)} acciones con fecha en 2024` + (top3.length? ` · días con más acciones: ${top3.join(', ')}` : '');
}
