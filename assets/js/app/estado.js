/*
 * Estado no endereço
 * O endereço da página guarda a aba, a variável, o cruzamento, o modo da tabela, as repetidas e os filtros
 * (pelos nomes das categorias), para que um recorte possa ser enviado a outra pessoa e reaberto igual.
 * Ex.: base/#mapa?v=tipomov&f=region:Gran%20Buenos%20Aires
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

const CHAVE_ABA = Object.fromEntries(Object.entries(TABS).map(([k,v])=>[v,k]));
function urlSync(){
  const p=new URLSearchParams();
  p.set('v', st.v); if(st.x) p.set('x', st.x); if(st.rep) p.set('rep','1'); if(st.mode && st.mode!=='n') p.set('m', st.mode);
  const fs=Object.keys(st.f).filter(vid=>st.f[vid].size).map(vid=>vid+':'+[...st.f[vid]].map(k=>VARS[VI[vid]].values[k]).join('|'));
  if(fs.length) p.set('f', fs.join(';'));
  if(TAB==='fic' && FIC.k!=null){ p.set('fv', FIC.v); p.set('fk', VARS[VI[FIC.v]].values[FIC.k]); }
  const novo = '#'+(CHAVE_ABA[TAB]||'distribuicao')+'?'+p.toString();
  if(location.hash!==novo){ try{ history.replaceState(null,'',novo); }catch(e){} }
}
(function lerEndereco(){
  const h=(location.hash||'').slice(1), i=h.indexOf('?'); if(i<0) return;
  const p=new URLSearchParams(h.slice(i+1));
  if(VI[p.get('v')]!=null) st.v=p.get('v');
  st.x = VI[p.get('x')]!=null && p.get('x')!==st.v? p.get('x') : '';
  st.rep = p.get('rep')==='1';
  if(['n','row','col','res'].includes(p.get('m'))) st.mode=p.get('m');
  st.f={};
  (p.get('f')||'').split(';').filter(Boolean).forEach(par=>{ const j=par.indexOf(':'); const vid=par.slice(0,j); if(VI[vid]==null) return;
    const vals=VARS[VI[vid]].values; const ks=par.slice(j+1).split('|').map(n=>vals.indexOf(n)).filter(k=>k>=0); if(ks.length) st.f[vid]=new Set(ks); });
  if(VI[p.get('fv')]!=null){ const k=VARS[VI[p.get('fv')]].values.indexOf(p.get('fk')); if(k>=0){ FIC.v=p.get('fv'); FIC.k=k; } }
})();
// botão para copiar o link do recorte
(function(){
  const box=document.querySelector('.controls-panel'); if(!box) return;
  const bar=el('div','linkbar'); const b=el('button','btn','Copiar link deste recorte'); const msg=el('span','toast');
  b.type='button'; b.onclick=async()=>{ urlSync(); try{ await navigator.clipboard.writeText(location.href); msg.textContent='Link copiado. Quem abrir verá a mesma aba, variáveis e filtros.'; }catch(e){ msg.textContent='Copie o endereço da barra do navegador: ele já guarda este recorte.'; } setTimeout(()=>{ msg.textContent=''; }, 4000); };
  bar.append(b, msg); box.append(bar);
})();
