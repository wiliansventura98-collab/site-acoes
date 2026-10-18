/*
 * Interface
 * Renderização geral, abas e dica flutuante.
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

function render(){
  save();
  $('var').value=st.v; $('cross').value=st.x; $('rep').checked=st.rep;
  const b=base();
  const nUniq=ROWS.filter(r=>!r.rep).length, nRep=ROWS.length-nUniq;
  const L=$('lede'); L.textContent='';
  L.append(el('b',null,fmt(nUniq)), document.createTextNode(' notícias únicas'), document.createTextNode(' e '), el('b',null,fmt(nRep)), document.createTextNode(' repetidas, codificadas em '+VARS.length+' variáveis. Escolha uma variável para ver a distribuição; clique numa categoria para filtrar a base e listar as notícias.'));
  renderChips();
  const v=VARS[VI[st.v]];
  const rowsV=b.filter(r=>match(r, st.v));
  let note;
  if(st.x && st.x!==st.v){
    const rowsVX=b.filter(r=>match(r, null));
    // for crossing, use all filters (selection applies to both)
    const extra=renderHeat(rowsVX, st.v, st.x);
    $('distTitle').textContent = v.label+' × '+VARS[VI[st.x]].label;
    note = `${fmt(rowsVX.length)} notícias no recorte. Cada célula conta as notícias que têm as duas categorias; clique numa célula para listar essas notícias.` + (extra&&extra.length? ` Mostrando as categorias mais frequentes (ocultas: ${extra.join(' e ')}).`:'');
  } else {
    const nk=renderBars(rowsV, st.v);
    $('distTitle').textContent = v.label;
    const multi = rowsV.some(r=>r.v[VI[st.v]].length>1);
    const semValor = rowsV.filter(r=>!r.v[VI[st.v]].length).length;
    note = `${fmt(rowsV.length)} notícias no recorte · ${fmt(nk||0)} categorias.` + (multi? ' Uma notícia pode ter mais de um valor nesta variável, então os percentuais somam mais de 100%.' : '') + (semValor? ` ${fmt(semValor)} sem valor preenchido.`:'') + (st.f[st.v]? ' Barras em destaque estão filtradas; o gráfico ignora o próprio filtro para mostrar as alternativas.' : '');
  }
  $('distNote').textContent=note;
  if(TAB==='map') renderMap(b);
  if(TAB==='time') renderTime(b);
  renderNews(b.filter(r=>match(r,null)));
}

/* ---------- tabs ---------- */
let TAB='dist';
const TABS={distribuicao:'dist', mapa:'map', tempo:'time'};
function setTab(t, push){
  TAB=t;
  [['dist','tab-dist','dist'],['map','tab-map','mapSec'],['time','tab-time','timeSec']].forEach(([k,tid,sid])=>{
    $(tid).setAttribute('aria-selected', String(k===t)); $(sid).hidden = k!==t; });
  render();
}
document.querySelectorAll('.tabs a').forEach(a=>a.addEventListener('click',e=>{ e.preventDefault(); const k=a.getAttribute('href').slice(1); try{ history.replaceState(null,'','#'+k); }catch(_){} setTab(TABS[k]); }));
const initTab = TABS[(location.hash||'').slice(1)]; if(initTab) TAB=initTab;
window.addEventListener('hashchange',()=>{ const k=TABS[(location.hash||'').slice(1)]; if(k && k!==TAB) setTab(k); });

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
