/*
 * Inicialização
 * Liga os controles e desenha a página.
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

$('var').onchange=e=>{ st.v=e.target.value; if(st.x===st.v) st.x=''; st.showAll=false; render(); };
$('cross').onchange=e=>{ st.x=e.target.value===st.v? '' : e.target.value; st.showAll=false; render(); };
$('rep').onchange=e=>{ st.rep=e.target.checked; render(); };
let qt; $('q').oninput=e=>{ clearTimeout(qt); qt=setTimeout(()=>{ st.q=e.target.value; st.page=40; renderNews(base().filter(r=>match(r,null))); },150); };
$('moreNews').onclick=()=>{ st.page+=40; renderNews(base().filter(r=>match(r,null))); };

(function(dl){
  DL=dl; $('dlPng').hidden=$('dlSvg').hidden=!HAS_D3; const b=$('dl'); b.hidden=false;
  b.onclick=async()=>{ $('dlMsg').textContent=''; try{ await dl.save({filename:'acoes_2024_recorte.csv', data:csv()}); $('dlMsg').textContent='CSV baixado.'; }catch(err){ $('dlMsg').textContent='Não foi possível baixar.'; } };
})(NATIVE_DL);
setTab(TAB);
