/*
 * Núcleo
 * Dados, estado da página, filtros e utilidades comuns.
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

const D = window.__BASE__;
const VARS = D.vars;
const VI = Object.fromEntries(VARS.map((v,i)=>[v.id,i]));
const ROWS = D.rows.map((r,k)=>({k, codigo:r[0], titulo:r[1], fecha:r[2], ini:r[3], fin:r[4], link:r[5], rep:r[6]===1, v:r[7]}));
const dkey = s => { const m=/^(\d\d)\/(\d\d)\/(\d{4})$/.exec(s||''); return m? m[3]+m[2]+m[1] : '00000000'; };
ROWS.forEach(r=>{ r.sort = dkey(r.ini)!=='00000000'? dkey(r.ini) : dkey(r.fecha); r.fonte = (VARS[VI.fuente].values[r.v[VI.fuente][0]]||''); r.hay=(r.titulo+' '+r.fonte+' '+r.codigo).toLowerCase(); });

const $ = id => document.getElementById(id);
const el = (tag, cls, text) => { const e=document.createElement(tag); if(cls) e.className=cls; if(text!=null) e.textContent=text; return e; };
const fmt = n => n.toLocaleString('pt-BR');
const pct = (a,b) => b? (a/b*100).toLocaleString('pt-BR',{maximumFractionDigits:1, minimumFractionDigits: a/b<0.1?1:0})+'%' : '—';

let st = { v:'tipomov', x:'', rep:false, f:{}, showAll:false, mode:'n', q:'', page:40 };
try{ const s=JSON.parse(localStorage.getItem('as24')||'null'); if(s && VI[s.v]!=null){ st.v=s.v; st.x = (s.x && VI[s.x]!=null)? s.x:''; st.rep=!!s.rep; } }catch(e){}
const save = () => { try{ localStorage.setItem('as24', JSON.stringify({v:st.v,x:st.x,rep:st.rep})); }catch(e){} };

// selects
function fillSelect(sel, withNone){
  sel.textContent='';
  if(withNone){ const o=el('option',null,'— nenhum —'); o.value=''; sel.append(o); }
  const groups={};
  VARS.forEach(v=>{ (groups[v.group] ||= []).push(v); });
  for(const g in groups){ const og=el('optgroup'); og.label=g; groups[g].forEach(v=>{ const o=el('option',null,v.label); o.value=v.id; og.append(o); }); sel.append(og); }
}
fillSelect($('var'), false); fillSelect($('cross'), true);

function base(){ return ROWS.filter(r=> st.rep || !r.rep); }
const semAcento = t => String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
ROWS.forEach(r=>{ r.hayN=semAcento(r.hay); });
function match(r, except){
  const ex=[].concat(except);
  // busca por palavra (título, fonte ou código): filtra todas as análises
  if(st.q && !ex.includes('q')){ const q=semAcento(st.q.trim()); if(q && !r.hayN.includes(q)) return false; }
  for(const vid in st.f){ if(ex.includes(vid)) continue; const set=st.f[vid]; if(!set.size) continue;
    const arr=r.v[VI[vid]]; if(!arr.some(x=>set.has(x))) return false; }
  return true;
}
function counts(rows, vid){ const i=VI[vid], c=new Map(); rows.forEach(r=> r.v[i].forEach(x=> c.set(x,(c.get(x)||0)+1))); return c; }
function order(vid, c){
  const v=VARS[VI[vid]]; const ks=[...c.keys()];
  if(v.ordered) return ks.sort((a,b)=>a-b);
  return ks.sort((a,b)=> c.get(b)-c.get(a) || v.values[a].localeCompare(v.values[b],'es'));
}
function toggleFilter(vid, x, only){
  const s = st.f[vid] || (st.f[vid]=new Set());
  if(only){ s.clear(); s.add(x); }
  else if(s.has(x)) s.delete(x); else s.add(x);
  if(!s.size) delete st.f[vid];
  st.page=40; render();
}

function renderChips(){
  const c=$('chips'); c.textContent='';
  const keys=Object.keys(st.f), q=(st.q||'').trim();
  if(!keys.length && !q){ c.append(el('span','lbl','Nenhum filtro ativo. Clique numa categoria do gráfico para filtrar.')); return; }
  const limpaBusca=()=>{ st.q=''; $('q').value=''; $('qTop').value=''; };
  c.append(el('span','lbl','Filtros:'));
  if(q){ const ch=el('span','chip'); const t=el('span'); t.append(el('i',null,'Palavra: '), document.createTextNode(q)); ch.title='Notícias com “'+q+'” no título, na fonte ou no código';
    const b=el('button',null,'×'); b.setAttribute('aria-label','Remover a busca'); b.onclick=()=>{ limpaBusca(); st.page=40; render(); }; ch.append(t,b); c.append(ch); }
  keys.forEach(vid=>{ const v=VARS[VI[vid]];
    st.f[vid].forEach(x=>{ const ch=el('span','chip'); const t=el('span'); const i=el('i',null,v.label+': '); t.append(i, document.createTextNode(v.values[x])); ch.title=v.label+': '+v.values[x];
      const b=el('button',null,'×'); b.setAttribute('aria-label','Remover filtro '+v.values[x]); b.onclick=()=>toggleFilter(vid,x);
      ch.append(t,b); c.append(ch); }); });
  const clr=el('button','btn link','Limpar filtros'); clr.onclick=()=>{ st.f={}; limpaBusca(); st.page=40; render(); }; c.append(clr);
}
