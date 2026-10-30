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
preencheFiltroUnico('fAno','ano','Todos os anos'); preencheFiltroUnico('fPais','pais','Todos os países');
(()=>{ const a=VARS[VI.ano], p=VARS[VI.pais]; const n=$('notaAno'); if(!n||!a||!p) return;
  n.textContent = (a.values.length<2 && p.values.length<2)? `Por enquanto a base tem ${a.values.length===1? 'um ano ('+a.values[0]+')' : 'um ano'} e um país (${p.values[0]}). Os seletores de ano e país passam a separar e comparar períodos e países quando a planilha unificada, com as colunas Año e País, for carregada.` : ''; n.hidden=!n.textContent; })();
$('moreNews').onclick=()=>{ st.page+=40; renderNews(base().filter(r=>match(r,null))); };

(function(dl){
  DL=dl; $('dlPng').hidden=$('dlSvg').hidden=!HAS_D3; const b=$('dl'); b.hidden=false;
  b.onclick=async()=>{ $('dlMsg').textContent=''; try{ await dl.save({filename:'acoes_2024_recorte.csv', data:csv()}); $('dlMsg').textContent='CSV baixado.'; }catch(err){ $('dlMsg').textContent='Não foi possível baixar.'; } };
})(NATIVE_DL);
setTab(TAB);
// troca de idioma mantendo a aba, as variáveis e os filtros (o estado fica no endereço, depois do #)
{ const li=$('linkIdioma'); if(li) li.addEventListener('click',()=>{ li.href=li.getAttribute('href').split('#')[0]+location.hash; }); }
