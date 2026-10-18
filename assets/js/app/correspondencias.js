/*
 * Análise de correspondências múltiplas (ACM)
 * Codificação disjuntiva "difusa": em cada variável ativa, a notícia distribui peso 1 entre suas categorias
 * (1/k quando tem k categorias); categorias fora das principais vão para "Outras (variável)".
 * Análise de correspondências da matriz indicadora pela decomposição espectral de SᵀS (método de Jacobi).
 * Coordenadas principais das categorias, contribuições aos eixos e inércias brutas e corrigidas (Benzécri).
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

const ACM_PADRAO = ['tipomov','matriz','objetivos','direccion','escala','region'];
const ACM_OK = VARS.filter(v=>v.values.length>=2 && v.values.length<=120 && !['mes','cantidad','localidad','departamento','nombremov','nombreinst','fuente','otraslocal','provincia'].includes(v.id)).map(v=>v.id);
const ACMS = { vars: ACM_PADRAO.filter(x=>ACM_OK.includes(x)), n:8, ax:'0,1', rows:false };
try{ const s=JSON.parse(localStorage.getItem('as24acm')||'null'); if(s){ Object.assign(ACMS, s); ACMS.vars=ACMS.vars.filter(x=>ACM_OK.includes(x)); } }catch(e){}
(()=>{ const box=$('acmVars'); ACM_OK.forEach(id=>{ const l=el('label','chk'); const i=document.createElement('input'); i.type='checkbox'; i.value=id; i.checked=ACMS.vars.includes(id);
  i.onchange=()=>{ ACMS.vars = [...box.querySelectorAll('input:checked')].map(x=>x.value); render(); }; l.append(i, document.createTextNode(VARS[VI[id]].label)); box.append(l); }); })();
$('acmN').onchange=e=>{ ACMS.n=+e.target.value; render(); };
$('acmAx').onchange=e=>{ ACMS.ax=e.target.value; render(); };
$('acmRows').onchange=e=>{ ACMS.rows=e.target.checked; render(); };

const ACM_EX = [
  ['Quem, como e onde', ['tipomov','matriz','objetivos','direccion','escala','region']],
  ['Repertório de ação', ['matriz','direccion','modalidad','localizacion','escala']],
  ['Movimentos e objetivos', ['tipomov','objetivos','direccion']],
  ['Instituições interpeladas', ['tipoinst','escala','region','direccion']],
];
(()=>{ const box=$('acmPresets'); box.append(el('span',null,'Combinações prontas:'));
  ACM_EX.forEach(([rot,vs])=>{ const b=el('button','btn',rot); b.type='button'; b.onclick=()=>{ ACMS.vars=vs.filter(x=>ACM_OK.includes(x)); $('acmVars').querySelectorAll('input').forEach(i=>{ i.checked=ACMS.vars.includes(i.value); }); render(); }; box.append(b); }); })();

function jacobi(A0){ // autovalores e autovetores de matriz simétrica
  const n=A0.length, A=A0.map(r=>r.slice()), V=A0.map((_,i)=>A0.map((__,j)=>i===j?1:0));
  for(let sweep=0; sweep<60; sweep++){
    let off=0; for(let i=0;i<n;i++) for(let j=i+1;j<n;j++) off+=A[i][j]*A[i][j];
    if(off<1e-20) break;
    for(let p=0;p<n;p++) for(let q=p+1;q<n;q++){
      if(Math.abs(A[p][q])<1e-15) continue;
      const th=(A[q][q]-A[p][p])/(2*A[p][q]), t=Math.sign(th||1)/(Math.abs(th)+Math.sqrt(th*th+1)), c=1/Math.sqrt(t*t+1), s=t*c;
      for(let k=0;k<n;k++){ const akp=A[k][p], akq=A[k][q]; A[k][p]=c*akp-s*akq; A[k][q]=s*akp+c*akq; }
      for(let k=0;k<n;k++){ const apk=A[p][k], aqk=A[q][k]; A[p][k]=c*apk-s*aqk; A[q][k]=s*apk+c*aqk; }
      for(let k=0;k<n;k++){ const vkp=V[k][p], vkq=V[k][q]; V[k][p]=c*vkp-s*vkq; V[k][q]=s*vkp+c*vkq; }
    }
  }
  return A.map((r,i)=>({val:r[i], vec:V.map(row=>row[i])})).sort((a,b)=>b.val-a.val);
}

function calcACM(rows, vids, nTop){
  const cols=[]; // {vid, k (índice da categoria ou -1 = outras), nome}
  const mapa = {};
  vids.forEach(vid=>{ const iv=VI[vid], v=VARS[iv], c=counts(rows, vid);
    const top=order(vid,c).filter(k=>!ehSemInfo(v.values[k])).sort((a,b)=>c.get(b)-c.get(a)).slice(0,nTop);
    mapa[vid]={}; top.forEach(k=>{ mapa[vid][k]=cols.length; cols.push({vid, k, nome:v.values[k]}); });
    const resto = [...c.keys()].some(k=>!top.includes(k)) || rows.some(r=>!r.v[iv].length);
    if(resto){ mapa[vid].o=cols.length; cols.push({vid, k:-1, nome:`Outras · ${v.label}`}); } });
  const J=cols.length, Q=vids.length, n=rows.length;
  if(J<3 || n<10) return null;
  const Z=rows.map(r=>{ const z=new Float64Array(J); vids.forEach(vid=>{ const ks=r.v[VI[vid]]; const alvo=ks.length? ks.map(k=> mapa[vid][k]!=null? mapa[vid][k] : mapa[vid].o) : [mapa[vid].o];
    const u=alvo.filter(x=>x!=null); u.forEach(j=>{ z[j]+=1/u.length; }); }); return z; });
  const tot=n*Q, rmass=1/n, c=new Float64Array(J); Z.forEach(z=>{ for(let j=0;j<J;j++) c[j]+=z[j]/tot; });
  const keep=[...Array(J).keys()].filter(j=>c[j]>0);
  // S = D_r^-1/2 (P - r cᵀ) D_c^-1/2 ;  P_ij = Z_ij/tot
  const S=Z.map(z=>keep.map(j=>(z[j]/tot - rmass*c[j])/Math.sqrt(rmass*c[j])));
  const K=keep.length, StS=Array.from({length:K},()=>new Array(K).fill(0));
  S.forEach(s=>{ for(let a=0;a<K;a++){ const sa=s[a]; if(!sa) continue; for(let b=a;b<K;b++) StS[a][b]+=sa*s[b]; } });
  for(let a=0;a<K;a++) for(let b=0;b<a;b++) StS[a][b]=StS[b][a];
  const eig=jacobi(StS).filter(e=>e.val>1e-12);
  const totalIn=eig.reduce((s,e)=>s+e.val,0);
  const nd=Math.min(3, eig.length);
  const colsK=keep.map(j=>cols[j]), mass=keep.map(j=>c[j]);
  const coord=colsK.map((col,a)=>({ ...col, mass:mass[a], f:eig.slice(0,nd).map(e=>e.vec[a]/Math.sqrt(mass[a])*Math.sqrt(e.val)) }));
  coord.forEach((p,a)=>{ p.ctr=eig.slice(0,nd).map((e,d)=>mass[a]*p.f[d]*p.f[d]/e.val); });
  // coordenadas das notícias: f_i = (S v_k)_i / sqrt(r_i)
  const rowsC=S.map(s=>eig.slice(0,nd).map(e=>{ let t=0; for(let a=0;a<K;a++) t+=s[a]*e.vec[a]; return t/Math.sqrt(rmass); }));
  // correção de Benzécri (exata para codificação disjuntiva completa; aproximação quando há notícias com vários valores)
  const lam=eig.map(e=>e.val), adj=lam.map(l=> l>1/Q? Math.pow(Q/(Q-1)*(l-1/Q),2) : 0), adjTot=adj.reduce((s,x)=>s+x,0);
  return { coord, rowsC, lam, totalIn, adj, adjTot, n, Q, J:K };
}

let ACM_CACHE = { chave:null, res:null };
function renderACM(b){
  ACMS.vars=ACMS.vars.filter(x=>ACM_OK.includes(x));
  try{ localStorage.setItem('as24acm', JSON.stringify(ACMS)); }catch(e){}
  $('acmN').value=String(ACMS.n); $('acmAx').value=ACMS.ax; $('acmRows').checked=ACMS.rows;
  const box=$('acmChart'); box.querySelectorAll('svg,.legend').forEach(s=>s.remove()); $('acmCtr').textContent='';
  if(!HAS_D3) return;
  if(ACMS.vars.length<2){ $('acmNote').textContent='Marque pelo menos duas variáveis ativas.'; $('acmMeta').textContent=''; return; }
  const rows=b.filter(r=>match(r,null));
  const chave=JSON.stringify([ACMS.vars, ACMS.n, rows.length, rows.length? rows[0].k : 0, rows.length? rows[rows.length-1].k : 0, Object.keys(st.f).map(k=>[k,[...st.f[k]]])]);
  let R = ACM_CACHE.chave===chave? ACM_CACHE.res : null;
  if(!R){ R=calcACM(rows, ACMS.vars, ACMS.n); ACM_CACHE={chave, res:R}; }
  if(!R){ $('acmNote').textContent='Notícias ou categorias insuficientes no recorte para a análise.'; $('acmMeta').textContent=''; return; }
  const [d1,d2]=ACMS.ax.split(',').map(Number);
  if(R.lam.length<=d2){ $('acmNote').textContent='O recorte tem dimensões insuficientes para estes eixos.'; return; }
  const pct1=v=>(v*100).toLocaleString('pt-BR',{maximumFractionDigits:1});
  const pts=R.coord.filter(p=>p.f[d1]!=null && p.f[d2]!=null);
  const W=Math.max(320, box.clientWidth), H=Math.round(Math.max(460, Math.min(760, W*0.72))), m={t:20,r:20,b:40,l:20};
  const ext=d3.extent(pts.flatMap(p=>[p.f[d1]])), eyt=d3.extent(pts.flatMap(p=>[p.f[d2]]));
  const pad=v=>[v[0]-(v[1]-v[0])*0.08, v[1]+(v[1]-v[0])*0.08];
  // mesma escala nos dois eixos (distâncias comparáveis)
  const [x0,x1]=pad(ext), [y0,y1]=pad(eyt), k=Math.min((W-m.l-m.r)/(x1-x0), (H-m.t-m.b)/(y1-y0));
  const cx=(W-m.l-m.r-(x1-x0)*k)/2+m.l, cy=(H-m.t-m.b-(y1-y0)*k)/2+m.t;
  const X=v=>cx+(v-x0)*k, Y=v=>cy+(y1-v)*k;
  const svg=d3.select(box).append('svg').attr('viewBox',`0 0 ${W} ${H}`).attr('width','100%').attr('role','img').attr('aria-label','Plano fatorial da análise de correspondências múltiplas');
  svg.append('line').attr('x1',m.l).attr('x2',W-m.r).attr('y1',Y(0)).attr('y2',Y(0)).attr('stroke','var(--line-2)').attr('stroke-dasharray','4 4');
  svg.append('line').attr('y1',m.t).attr('y2',H-m.b).attr('x1',X(0)).attr('x2',X(0)).attr('stroke','var(--line-2)').attr('stroke-dasharray','4 4');
  svg.append('text').attr('class','ax-title').attr('x',W-m.r).attr('y',Y(0)-6).attr('text-anchor','end').text(`Eixo ${d1+1} · ${pct1(R.lam[d1]/R.totalIn)}% da inércia${R.adjTot? ` (${pct1(R.adj[d1]/R.adjTot)}% corrigida)` : ''}`);
  svg.append('text').attr('class','ax-title').attr('x',X(0)+6).attr('y',m.t+10).text(`Eixo ${d2+1} · ${pct1(R.lam[d2]/R.totalIn)}%${R.adjTot? ` (${pct1(R.adj[d2]/R.adjTot)}% corrigida)` : ''}`);
  // nomes dos polos nas bordas do plano
  const curto2=t=>t.replace(/^Movimientos? (de |por la |por )?/i,'').replace(/^Objetivos (en torno a |por la |por el |de |por )?/i,'').slice(0,22);
  const poloTxt=(d,s)=>pts.filter(p=>p.k>=0 && s*p.f[d]>0).sort((a,q)=>q.ctr[d]-a.ctr[d]).slice(0,2).map(p=>curto2(p.nome)).join(' · ');
  const pl=(x,y,t,a)=>svg.append('text').attr('x',x).attr('y',y).attr('text-anchor',a).style('font-size','11px').style('font-weight',700).style('fill','#2569ad').attr('paint-order','stroke').attr('stroke','#fff').attr('stroke-width',3).text(t);
  pl(m.l+2, Y(0)+16, '← '+poloTxt(d1,-1), 'start'); pl(W-m.r-2, Y(0)+16, poloTxt(d1,1)+' →', 'end');
  pl(X(0)-8, H-m.b+4, '↓ '+poloTxt(d2,-1), 'end'); pl(X(0)-8, m.t+26, '↑ '+poloTxt(d2,1), 'end');
  if(ACMS.rows){ svg.append('g').selectAll('circle').data(R.rowsC).join('circle').attr('cx',d=>X(d[d1])).attr('cy',d=>Y(d[d2])).attr('r',1.6).attr('fill','var(--ink-3)').attr('opacity',.22); }
  const cor=new Map(ACMS.vars.map((v,i)=>[v, PALETA[i % PALETA.length]]));
  const mmax=d3.max(pts,p=>p.mass)||1, rr=d3.scaleSqrt().domain([0,mmax]).range([2.5, W<640? 8 : 12]);
  const tip=tipFor(box);
  const f2=v=>v.toLocaleString('pt-BR',{maximumFractionDigits:2});
  svg.append('g').selectAll('circle').data(pts).join('circle').attr('cx',p=>X(p.f[d1])).attr('cy',p=>Y(p.f[d2])).attr('r',p=>rr(p.mass))
    .attr('fill',p=>cor.get(p.vid)).attr('fill-opacity',p=>p.k<0? .35 : .9).attr('stroke','#fff').attr('stroke-width',1.2).style('cursor',p=>p.k<0? 'default':'pointer')
    .on('mousemove',(e,p)=>tip.show(e, p.nome, [VARS[VI[p.vid]].label, `Coordenadas: ${f2(p.f[d1])}; ${f2(p.f[d2])}`, `Contribuição: eixo ${d1+1} ${pct1(p.ctr[d1])}% · eixo ${d2+1} ${pct1(p.ctr[d2])}%`, `Peso (massa): ${pct1(p.mass)}%`]))
    .on('mouseleave',()=>tip.hide()).on('click',(e,p)=>{ if(p.k>=0) toggleFilter(p.vid, p.k); });
  // rótulos: os de maior contribuição primeiro, sem sobreposição
  const ocup=[], rot=[]; const curto=s=>s.replace(/^Movimientos? (de |por la |por )?/i,'').replace(/^Objetivos (en torno a |por la |por el |de |por )?/i,'').slice(0,34);
  [...pts].sort((a,q)=>(q.ctr[d1]+q.ctr[d2])-(a.ctr[d1]+a.ctr[d2])).forEach(p=>{ const t=curto(p.nome), w=t.length*5.9, x=X(p.f[d1])+rr(p.mass)+3, y=Y(p.f[d2]);
    const bx=[x, y-7, x+w, y+5]; if(bx[2]>W-2 || ocup.some(o=>!(bx[2]<o[0]||bx[0]>o[2]||bx[3]<o[1]||bx[1]>o[3]))) return; ocup.push(bx); rot.push([p,t,x,y]); });
  svg.append('g').selectAll('text').data(rot).join('text').attr('class','sk-label').attr('x',d=>d[2]).attr('y',d=>d[3]+3.5).style('font-size','11.5px').style('fill',d=>d[0].k<0? 'var(--ink-3)' : 'var(--ink)').text(d=>d[1]);
  const lg=el('div','legend'); ACMS.vars.forEach(v=>{ const s=el('span'); const i=el('i','sw'); i.style.background=cor.get(v); i.style.borderRadius='50%'; s.append(i, document.createTextNode(VARS[VI[v]].label)); lg.append(s); }); box.append(lg);
  $('acmMeta').textContent=`${fmt(R.n)} notícias · ${R.Q} variáveis · ${R.J} categorias`;
  $('acmNote').textContent=`Categorias próximas no plano tendem a aparecer nas mesmas notícias; categorias distantes do centro são as mais características. Distâncias calculadas em coordenadas principais, com a mesma escala nos dois eixos; tamanho do ponto ∝ peso da categoria. Inércia total ${f2(R.totalIn)}; entre parênteses, a inércia corrigida de Benzécri, mais realista na ACM. Pontos claros são categorias agrupadas como “Outras”. O cálculo considera os filtros ativos. Clique numa categoria para filtrar.`;
  // leitura automática dos eixos
  const polo=(d,sinal)=>pts.filter(p=>p.k>=0 && sinal*p.f[d]>0).sort((a,q)=>q.ctr[d]-a.ctr[d]).slice(0,3).map(p=>`<b>${p.nome}</b>`).join(', ');
  const pc=d=>R.adjTot? pct1(R.adj[d]/R.adjTot) : pct1(R.lam[d]/R.totalIn);
  const Lg=$('acmLeitura'); Lg.hidden=false;
  Lg.innerHTML=`<b>Leitura deste plano:</b> o <b>eixo ${d1+1}</b> (horizontal, ${pc(d1)}% da informação) opõe ${polo(d1,-1)} (à esquerda) a ${polo(d1,1)} (à direita). O <b>eixo ${d2+1}</b> (vertical, ${pc(d2)}%) opõe ${polo(d2,-1)} (embaixo) a ${polo(d2,1)} (em cima). Notícias com as categorias de um mesmo lado tendem a ser parecidas entre si; procure no gráfico quais outras categorias aparecem perto delas.`;
  // contribuições
  const ctr=$('acmCtr');
  [d1,d2].forEach(d=>{ const col=el('div'); col.append(el('h3','h3',`Eixo ${d+1}`));
    const lado=(s)=>{ const l=pts.filter(p=>s*p.f[d]>0 && p.k>=0).sort((a,q)=>q.ctr[d]-a.ctr[d]).slice(0,6); const u=el('ul','acm-list');
      l.forEach(p=>{ const li=el('li'); const i=el('i','dot'); i.style.background=cor.get(p.vid); li.append(i, document.createTextNode(p.nome), el('b',null,` ${pct1(p.ctr[d])}%`)); u.append(li); }); return u; };
    const neg=el('div'); neg.append(el('p','meta',`Polo negativo (${d===d1? 'esquerda' : 'baixo'})`), lado(-1));
    const pos=el('div'); pos.append(el('p','meta',`Polo positivo (${d===d1? 'direita' : 'cima'})`), lado(1));
    col.append(neg,pos); ctr.append(col); });
}
EXTRA.acm = renderACM;
