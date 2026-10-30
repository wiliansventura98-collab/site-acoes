/* GERADO por i18n/ferramenta.js a partir de assets/js/app/iniciar.js; não edite: edite o original e i18n/es.json */
var IDIOMA='es';
/*
 * Inicialização
 * Liga os controles e desenha a página.
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

$('var').onchange=e=>{ st.v=e.target.value; if(st.x===st.v) st.x=''; st.showAll=false; render(); };
$('cross').onchange=e=>{ st.x=e.target.value===st.v? '' : e.target.value; st.showAll=false; render(); };
$('rep').onchange=e=>{ st.rep=e.target.checked; render(); };
// busca por palavra: os dois campos (no topo e na lista de notícias) ficam sincronizados e filtram todas as abas
let qt; const busca=e=>{ clearTimeout(qt); const v=e.target.value; (e.target.id==='q'? $('qTop') : $('q')).value=v; qt=setTimeout(()=>{ st.q=v; st.page=40; render(); },300); };
$('q').oninput=busca; $('qTop').oninput=busca;
$('verNoticias').onclick=e=>{ e.preventDefault(); $('newsSec').scrollIntoView({behavior:'smooth', block:'start'}); };
// ano e país: filtros comuns sobre as variáveis "ano" e "pais"
function preencheFiltroUnico(id, vid, rotTodos){ const s=$(id), v=VARS[VI[vid]]; if(!v) { s.closest('label').hidden=true; return; }
  s.textContent=''; const o0=el('option',null,rotTodos); o0.value=''; s.append(o0);
  v.values.forEach((nome,k)=>{ const o=el('option',null,nome); o.value=String(k); s.append(o); });
  s.onchange=e=>{ const k=e.target.value; if(k==='') delete st.f[vid]; else st.f[vid]=new Set([+k]); st.page=40; render(); }; }
preencheFiltroUnico('fAno','ano','Todos los años'); preencheFiltroUnico('fPais','pais','Todos los países');
(()=>{ const a=VARS[VI.ano], p=VARS[VI.pais]; const n=$('notaAno'); if(!n||!a||!p) return;
  n.textContent = (a.values.length<2 && p.values.length<2)? `Por ahora la base tiene ${a.values.length===1? 'un año ('+a.values[0]+')' : 'un año'} y un país (${p.values[0]}). Los selectores de año y país permitirán separar y comparar períodos y países cuando se cargue la planilla unificada, con las columnas Año y País.` : ''; n.hidden=!n.textContent; })();
$('moreNews').onclick=()=>{ st.page+=40; renderNews(base().filter(r=>match(r,null))); };

(function(dl){
  DL=dl; $('dlPng').hidden=$('dlSvg').hidden=!HAS_D3; const b=$('dl'); b.hidden=false;
  b.onclick=async()=>{ $('dlMsg').textContent=''; try{ await dl.save({filename:'acoes_2024_recorte.csv', data:csv()}); $('dlMsg').textContent='CSV descargado.'; }catch(err){ $('dlMsg').textContent='No se pudo descargar.'; } };
})(NATIVE_DL);
setTab(TAB);
// troca de idioma mantendo a aba, as variáveis e os filtros (o estado fica no endereço, depois do #)
{ const li=$('linkIdioma'); if(li) li.addEventListener('click',()=>{ li.href=li.getAttribute('href').split('#')[0]+location.hash; }); }
