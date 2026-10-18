/*
 * Notícias
 * Lista das notícias do recorte e exportação em CSV.
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

let current=[];
function renderNews(rows){
  const q=st.q.trim().toLowerCase();
  const list = (q? rows.filter(r=>r.hay.includes(q)) : rows).slice().sort((a,b)=> a.sort<b.sort?-1: a.sort>b.sort?1: a.codigo.localeCompare(b.codigo));
  current=list;
  $('newsCount').textContent = fmt(list.length)+' notícia'+(list.length===1?'':'s');
  const vid=st.v, iv=VI[vid], v=VARS[iv];
  $('vcol').textContent=v.label;
  const tb=$('newsBody'); tb.textContent='';
  if(!list.length){ const tr=el('tr'); const td=el('td','empty','Nenhuma notícia corresponde a este recorte.'); td.colSpan=4; tr.append(td); tb.append(tr); }
  list.slice(0,st.page).forEach(r=>{
    const tr=el('tr');
    const d=el('td','d', r.ini||r.fecha); if(r.fin && r.fin!==r.ini){ d.append(el('br')); d.append(document.createTextNode('→ '+r.fin)); }
    const t=el('td','t');
    if(/^https?:\/\//.test(r.link)){ const a=el('a',null,r.titulo||'(sem título)'); a.href=r.link; a.target='_blank'; a.rel='noopener'; t.append(a); } else t.append(el('span',null,r.titulo));
    const cd=el('span','code',r.codigo); if(r.rep) cd.append(el('span','tag','repetida')); t.append(cd);
    const s=el('td','s',r.fonte);
    const vv=el('td','v', r.v[iv].map(x=>v.values[x]).join(' · ') || '—');
    tr.append(d,t,s,vv); tb.append(tr);
  });
  const more=$('moreNews'); more.hidden = list.length<=st.page;
  more.textContent = `Mostrar mais (${fmt(Math.min(40, list.length-st.page))} de ${fmt(list.length-st.page)} restantes)`;
}


// CSV download
function csv(){
  const esc=s=>{ s=String(s??''); return /[",;\n]/.test(s)? '"'+s.replace(/"/g,'""')+'"' : s; };
  const head=['codigo','titulo','fecha_noticia','fecha_inicial','fecha_final','link','status',...VARS.map(v=>v.label)];
  const lines=[head.map(esc).join(',')];
  current.forEach(r=> lines.push([r.codigo,r.titulo,r.fecha,r.ini,r.fin,r.link,r.rep?'Repetida':'Correta',...VARS.map((v,i)=>r.v[i].map(x=>v.values[x]).join('; '))].map(esc).join(',')));
  return '﻿'+lines.join('\r\n');
}
