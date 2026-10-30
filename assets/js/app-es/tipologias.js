/* GERADO por i18n/ferramenta.js a partir de assets/js/app/tipologias.js; não edite: edite o original e i18n/es.json */
var IDIOMA='es';
/*
 * Tipologias (mapa de árvore)
 * Composição hierárquica das notícias: categorias de uma variável subdivididas pelas de outra
 * (por padrão, ação matriz → ação derivada).
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

const TYPO = { a:'matriz', b:'derivada' };
try{ Object.assign(TYPO, JSON.parse(localStorage.getItem('as24t')||'{}')); }catch(e){}
fillSelect($('typoA'), false); fillSelect($('typoB'), true);
$('typoA').onchange=e=>{ TYPO.a=e.target.value; render(); };
$('typoB').onchange=e=>{ TYPO.b=e.target.value; render(); };

function renderTypo(b){
  try{ localStorage.setItem('as24t', JSON.stringify(TYPO)); }catch(e){}
  $('typoA').value=TYPO.a; $('typoB').value=TYPO.b||'';
  const box=$('typoChart'); box.querySelectorAll('svg').forEach(s=>s.remove());
  if(!HAS_D3) return;
  const rows=b.filter(r=>match(r,null)), N=rows.length;
  const ia=VI[TYPO.a], ib=TYPO.b && TYPO.b!==TYPO.a? VI[TYPO.b] : null;
  const va=VARS[ia].values, vb=ib!=null? VARS[ib].values : null;
  const acc=new Map();
  rows.forEach(r=>{
    const A = r.v[ia].length? r.v[ia] : ['sem'];
    const B = ib==null? [null] : (r.v[ib].length? r.v[ib] : ['sem']);
    const w = 1/(A.length*B.length);
    A.forEach(a=>{ const m=acc.get(a)||new Map(); B.forEach(x=>m.set(x,(m.get(x)||0)+w)); acc.set(a,m); });
  });
  const nomeA = a => a==='sem'? 'Sin información' : va[a];
  const nomeB = x => x==='sem'? 'Sin subcategoría' : x==null? '' : vb[x];
  const root = d3.hierarchy({children:[...acc].map(([a,m])=>({a, name:nomeA(a), children:[...m].map(([x,v])=>({a, x, name:nomeB(x), value:v}))}))})
    .sum(d=>d.value||0).sort((p,q)=>q.value-p.value);
  const W=Math.max(320, box.clientWidth), H=Math.round(Math.max(420, Math.min(680, W*0.62)));
  d3.treemap().tile(d3.treemapSquarify.ratio(1.15)).size([W,H]).paddingOuter(3).paddingTop(22).paddingInner(2).round(true)(root);
  const cor = new Map(root.children.map((c,i)=>[c.data.a, c.data.a==='sem'? COR_SEM : PALETA[i%PALETA.length]]));
  const svg=d3.select(box).append('svg').attr('viewBox',`0 0 ${W} ${H}`).attr('width','100%').attr('role','img').attr('aria-label','Mapa de árbol de las tipologías');
  const tip=tipFor(box);
  const aprox = v => v>=10? fmt(Math.round(v)) : v.toLocaleString('es-AR',{maximumFractionDigits:1});
  const grupos = svg.append('g').selectAll('g').data(root.children).join('g');
  grupos.append('rect').attr('x',d=>d.x0).attr('y',d=>d.y0).attr('width',d=>d.x1-d.x0).attr('height',d=>d.y1-d.y0).attr('fill',d=>cor.get(d.data.a)).attr('rx',3);
  grupos.append('text').attr('class','tm-head').attr('x',d=>d.x0+6).attr('y',d=>d.y0+15)
    .text(d=>{ const w=d.x1-d.x0; if(w<60) return ''; const t=`${d.data.name} · ${aprox(d.value)}`; const max=Math.floor(w/6.6); return t.length>max? t.slice(0,max-1)+'…' : t; });
  const folhas = svg.append('g').selectAll('g').data(root.leaves()).join('g');
  folhas.append('rect').attr('x',d=>d.x0).attr('y',d=>d.y0).attr('width',d=>Math.max(0,d.x1-d.x0)).attr('height',d=>Math.max(0,d.y1-d.y0))
    .attr('fill',d=>{ const base=cor.get(d.data.a); const irmaos=d.parent.children; const i=irmaos.indexOf(d); return d3.interpolateRgb(base,'#ffffff')(0.18+0.5*(i/Math.max(1,irmaos.length))); })
    .attr('rx',2).style('cursor','pointer')
    .on('mousemove',(e,d)=>tip.show(e, ib==null? d.parent.data.name : `${d.parent.data.name} › ${d.data.name}`, [`≈ ${aprox(d.value)} noticias (${pct(d.value,N)} del recorte)`]))
    .on('mouseleave',()=>tip.hide())
    .on('click',(e,d)=>{ if(d.data.a!=='sem') st.f[TYPO.a]=new Set([d.data.a]); if(ib!=null && d.data.x!=='sem' && d.data.x!=null) st.f[TYPO.b]=new Set([d.data.x]); st.page=40; render(); $('newsSec').scrollIntoView({behavior:'smooth',block:'start'}); });
  folhas.append('text').attr('class','tm-leaf').attr('x',d=>d.x0+5).attr('y',d=>d.y0+14)
    .each(function(d){ const w=d.x1-d.x0, h=d.y1-d.y0; if(w<56 || h<30 || ib==null) return; const t=d3.select(this);
      const max=Math.floor((w-8)/6.2); const nm=d.data.name.length>max? d.data.name.slice(0,max-1)+'…' : d.data.name;
      t.append('tspan').attr('x',d.x0+5).text(nm); t.append('tspan').attr('x',d.x0+5).attr('dy','1.2em').attr('class','tm-val').text(aprox(d.value)); });
  $('typoMeta').textContent = `${fmt(N)} noticias en el recorte`;
  $('typoNote').textContent = `Área proporcional al número de noticias. Cada bloque coloreado es una categoría de “${VARS[ia].label}”${ib!=null? `, subdividida por las categorías de “${VARS[ib].label}” que aparecen en las mismas noticias` : ''}. Las noticias con varios valores reparten su peso por igual entre las combinaciones. Haga clic en un rectángulo para filtrar la base.`;
}
