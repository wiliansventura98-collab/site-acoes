/* GERADO por i18n/ferramenta.js a partir de assets/js/app/interface.js; não edite: edite o original e i18n/es.json */
var IDIOMA='es';
/*
 * Interface
 * Renderização geral, abas e dica flutuante.
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

function render(){
  save(); if(typeof urlSync==='function') urlSync();
  $('var').value=st.v; $('cross').value=st.x; $('rep').checked=st.rep;
  const b=base();
  const nUniq=ROWS.filter(r=>!r.rep).length, nRep=ROWS.length-nUniq;
  const L=$('lede'); L.textContent='';
  L.append(document.createTextNode('Quién se moviliza, por qué objetivos, con qué tipo de acción y dónde. '), el('b',null,fmt(nUniq)), document.createTextNode(' noticias únicas (y '+fmt(nRep)+' repetidas), leídas completas y codificadas en '+VARS.length+' variables.'));
  renderKPIs(b);
  renderChips();
  { const sync=(id,vid)=>{ const s=$(id); if(!s) return; const f=st.f[vid]; s.value = f && f.size===1? String([...f][0]) : ''; }; sync('fAno','ano'); sync('fPais','pais'); if(document.activeElement!==$('qTop')) $('qTop').value=st.q||''; if(document.activeElement!==$('q')) $('q').value=st.q||''; }
  const v=VARS[VI[st.v]];
  const rowsV=b.filter(r=>match(r, st.v));
  let note;
  if(st.x && st.x!==st.v){
    const rowsVX=b.filter(r=>match(r, null));
    // for crossing, use all filters (selection applies to both)
    const extra=renderHeat(rowsVX, st.v, st.x);
    $('distTitle').textContent = v.label+' × '+VARS[VI[st.x]].label;
    note = `${fmt(rowsVX.length)} noticias en el recorte. Cada celda cuenta las noticias que tienen las dos categorías; haga clic en una celda para listar esas noticias.` + (extra&&extra.length? ` Se muestran las categorías más frecuentes (ocultas: ${extra.join(' e ')}).`:'');
  } else {
    const nk=renderBars(rowsV, st.v);
    $('distTitle').textContent = v.label;
    const multi = rowsV.some(r=>r.v[VI[st.v]].length>1);
    const semValor = rowsV.filter(r=>!r.v[VI[st.v]].length).length;
    note = `${fmt(rowsV.length)} noticias en el recorte · ${fmt(nk||0)} categorias.` + (multi? ' Una noticia puede tener más de un valor en esta variable, por eso los porcentajes suman más de 100%.' : '') + (semValor? ` ${fmt(semValor)} sin valor completado.`:'') + (st.f[st.v]? ' Las barras destacadas están filtradas; el gráfico ignora su propio filtro para mostrar las alternativas.' : '');
  }
  $('distNote').textContent=note;
  if(TAB==='map') renderMap(b);
  if(TAB==='time') renderTime(b);
  if(TAB==='flow') renderFlow(b);
  if(TAB==='typo') renderTypo(b);
  if(TAB==='net') renderNet(b);
  if(TAB==='ctx') renderCtx(b);
  if(EXTRA[TAB]) EXTRA[TAB](b);
  renderNews(b.filter(r=>match(r,null)));
}

/* ---------- tabs ---------- */
let TAB='dist';
const EXTRA = {}; // abas acrescentadas por módulos posteriores: EXTRA[chave] = função de desenho
const TABS={sintese:'sin', distribuicao:'dist', comparar:'cmp', fluxos:'flow', tipologias:'typo', correspondencias:'acm', redes:'net', mapa:'map', contexto:'ctx', tempo:'time', imprensa:'imp', fichas:'fic'};
const PAINEIS=[['sin','tab-sin','sinSec'],['dist','tab-dist','dist'],['cmp','tab-cmp','cmpSec'],['flow','tab-flow','flowSec'],['typo','tab-typo','typoSec'],['acm','tab-acm','acmSec'],['net','tab-net','netSec'],['map','tab-map','mapSec'],['ctx','tab-ctx','ctxSec'],['time','tab-time','timeSec'],['imp','tab-imp','impSec'],['fic','tab-fic','ficSec']];
const hashTab = () => (location.hash||'').slice(1).split('?')[0];
function setTab(t, push){
  TAB=t;
  PAINEIS.forEach(([k,tid,sid])=>{
    $(tid).setAttribute('aria-selected', String(k===t)); $(sid).hidden = k!==t; });
  render();
}
document.querySelectorAll('.tabs a').forEach(a=>a.addEventListener('click',e=>{ e.preventDefault(); const k=a.getAttribute('href').slice(1); setTab(TABS[k]); }));
const initTab = TABS[hashTab()]; if(initTab) TAB=initTab;
window.addEventListener('hashchange',()=>{ const k=TABS[hashTab()]; if(k && k!==TAB) setTab(k); });

/* ---------- shared tooltip ---------- */
function tipFor(box){
  let t=box.querySelector('.tip'); if(!t){ t=el('div','tip'); t.hidden=true; box.append(t); }
  return {
    show(ev, title, lines){ t.textContent=''; t.append(el('b',null,title)); lines.forEach(l=>{ t.append(el('span',null,l)); t.append(el('br')); }); t.hidden=false;
      const r=box.getBoundingClientRect(); let x=ev.clientX-r.left+12, y=ev.clientY-r.top+12;
      const w=t.offsetWidth, h=t.offsetHeight; if(x+w>r.width-4) x=Math.max(4, ev.clientX-r.left-w-12); if(y+h>r.height-4) y=Math.max(4, ev.clientY-r.top-h-12);
      t.style.left=x+'px'; t.style.top=y+'px'; },
    hide(){ t.hidden=true; }
  };
}
const HAS_D3 = typeof d3!=='undefined' && typeof topojson!=='undefined';

/* ---------- indicadores do cabeçalho ---------- */
function renderKPIs(b){
  const rows = b.filter(r=>match(r,null)), box=$('kpis'); if(!box) return;
  const distintos = vid => { const c=counts(rows, vid); const vals=VARS[VI[vid]].values; let n=0; c.forEach((_,k)=>{ if(!/no informa|^ni$|nacional|virtual/i.test(vals[k])) n++; }); return n; };
  const filtrado = Object.keys(st.f).length>0;
  const itens = [
    [fmt(rows.length), filtrado? `noticias en el recorte (de ${fmt(b.length)})` : 'noticias únicas'],
    [fmt(distintos('nombremov')), 'movimientos y organizaciones'],
    [fmt(distintos('localidad')), 'localidades citadas'],
    [fmt((()=>{ const pop=(window.__GEO__||{}).pop||{}; const vals=VARS[VI.provincia].values; let n=0; counts(rows,'provincia').forEach((_,k)=>{ if(pop[vals[k]]!=null) n++; }); return n; })()), 'de las 24 jurisdicciones'],
    [fmt(distintos('fuente')), 'medios y fuentes'],
  ];
  box.textContent='';
  itens.forEach(([v,l])=>{ const d=el('div','kpi'); d.append(el('b',null,v), el('span',null,l)); box.append(d); });
}
