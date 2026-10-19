/*
 * Comparar recortes
 * Dois grupos de notícias (A: uma categoria; B: outra categoria ou todas as demais) comparados segundo
 * uma terceira variável, em gráfico de halteres: proporção de notícias de cada grupo com cada categoria,
 * diferença em pontos percentuais e teste z de diferença de proporções.
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

const CMP = { av:'region', ak:null, bk:'resto', y:'tipomov' };
try{ Object.assign(CMP, JSON.parse(localStorage.getItem('as24cmp')||'{}')); }catch(e){}
fillSelect($('cmpAv'), false); fillSelect($('cmpY'), false);
const COR_A = '#2569ad', COR_B = '#e09b00';
$('cmpAv').onchange=e=>{ CMP.av=e.target.value; CMP.ak=null; CMP.bk='resto'; render(); };
$('cmpAk').onchange=e=>{ CMP.ak=+e.target.value; render(); };
$('cmpBk').onchange=e=>{ CMP.bk=e.target.value; render(); };
$('cmpY').onchange=e=>{ CMP.y=e.target.value; render(); };

const CMP_EX = [
  ['GBA × demais regiões, por tipo de movimento', {av:'region', akNome:'Gran Buenos Aires', bk:'resto', y:'tipomov'}],
  ['Sindicais × demais, por ação matriz', {av:'tipomov', akNome:'Movimientos sindicales', bk:'resto', y:'matriz'}],
  ['Patagônia × Noroeste, por objetivos', {av:'region', akNome:'Patagonia', bkNome:'Noroeste (NOA)', y:'objetivos'}],
  ['Feministas × estudantis, por ação matriz', {av:'tipomov', akNome:'Movimientos de mujeres/feministas', bkNome:'Movimientos Estudiantiles', y:'matriz'}],
  ['Escala nacional × municipal, por instituição interpelada', {av:'escala', akNome:'Nacional', bkNome:'Municipal', y:'tipoinst'}],
  ['Ações virtuais × presenciais, por objetivos', {av:'virtual', akNome:'Sí', bkNome:'No', y:'objetivos'}],
  ['Reivindicativas × defensivas, por tipo de movimento', {av:'direccion', akNome:'Reivindicativa', bkNome:'Defensiva', y:'tipomov'}],
  ['Pampeana × Patagônia, por ação matriz', {av:'region', akNome:'Pampeana', bkNome:'Patagonia', y:'matriz'}],
  ['Economia popular × sindicais, por instituição interpelada', {av:'tipomov', akNome:'Movimientos de Economía Social y Solidaria', bkNome:'Movimientos sindicales', y:'tipoinst'}],
  ['Desocupados × sindicais, por lugar da ação', {av:'tipomov', akNome:'Movimientos de trabajadores Desocupados', bkNome:'Movimientos sindicales', y:'localizacion'}],
  ['Socioterritoriais × socioespaciais, por tipo de movimento', {av:'modalidad', akNome:'Acción Socioterritorial', bkNome:'Acción Socioespacial', y:'tipomov'}],
  ['UTEP × ATE, por ação matriz', {av:'nombremov', akNome:'Unión de Trabajadores y Trabajadoras de la Economía Popular (UTEP)', bkNome:'Asociación de Trabajadores del Estado (ATE)', y:'matriz'}],
  ['CGT × CTA, por objetivos', {av:'nombremov', akNome:'Confederación General del Trabajo (CGT)', bkNome:'Central de Trabajadores de la Argentina (CTA)', y:'objetivos'}],
  ['GBA × Pampeana, por objetivos', {av:'region', akNome:'Gran Buenos Aires', bkNome:'Pampeana', y:'objetivos'}],
  ['Defensivas × propositivas, por objetivos', {av:'direccion', akNome:'Defensiva', bkNome:'Propositiva', y:'objetivos'}],
  ['Ambientalistas × demais, por lugar da ação', {av:'tipomov', akNome:'Movimientos Ambientalistas', bk:'resto', y:'localizacion'}],
];
(()=>{ const box=$('cmpPresets'); box.append(el('span',null,'Exemplos prontos:'));
  CMP_EX.forEach(([rot,ex])=>{ const b=el('button','btn',rot); b.type='button'; b.onclick=()=>{ const vals=VARS[VI[ex.av]].values; CMP.av=ex.av; CMP.ak=vals.indexOf(ex.akNome); CMP.bk= ex.bkNome? String(vals.indexOf(ex.bkNome)) : 'resto'; CMP.y=ex.y; render(); }; box.append(b); }); })();

function renderCmp(b){
  if(VI[CMP.av]==null) CMP.av='region'; if(VI[CMP.y]==null) CMP.y='tipomov';
  const iv=VI[CMP.av], v=VARS[iv];
  const rows=b.filter(r=>match(r,[CMP.av]));
  const cA=counts(rows, CMP.av), cats=order(CMP.av, cA).filter(k=>!ehSemInfo(v.values[k]));
  if(CMP.ak==null || !cA.has(CMP.ak)) CMP.ak = cats[0];
  const sa=$('cmpAk'); sa.textContent=''; cats.forEach(k=>{ const o=el('option',null,`${v.values[k]} (${fmt(cA.get(k))})`); o.value=k; sa.append(o); });
  const sb=$('cmpBk'); sb.textContent=''; const o0=el('option',null,'Demais categorias desta variável'); o0.value='resto'; sb.append(o0);
  cats.filter(k=>k!==CMP.ak).forEach(k=>{ const o=el('option',null,`${v.values[k]} (${fmt(cA.get(k))})`); o.value=String(k); sb.append(o); });
  if(CMP.bk!=='resto' && (!cA.has(+CMP.bk) || +CMP.bk===CMP.ak)) CMP.bk='resto';
  $('cmpAv').value=CMP.av; sa.value=String(CMP.ak); sb.value=String(CMP.bk); $('cmpY').value=CMP.y;
  try{ localStorage.setItem('as24cmp', JSON.stringify(CMP)); }catch(e){}
  const box=$('cmpChart'); box.querySelectorAll('svg,.legend').forEach(s=>s.remove());
  if(!HAS_D3) return;
  const temA = r => r.v[iv].includes(CMP.ak), temB = CMP.bk==='resto'? (r => !temA(r) && r.v[iv].some(k=>!ehSemInfo(v.values[k]))) : (r => r.v[iv].includes(+CMP.bk));
  const A=rows.filter(temA), B=rows.filter(temB);
  const nomeA=v.values[CMP.ak], nomeB = CMP.bk==='resto'? `demais categorias (${fmt(B.length)})` : v.values[+CMP.bk];
  if(CMP.y===CMP.av){ $('cmpNote').textContent='Escolha, em “Comparar segundo”, uma variável diferente da que define os grupos.'; $('cmpMeta').textContent=''; return; }
  const iy=VI[CMP.y], vy=VARS[iy];
  const ca=counts(A, CMP.y), cb=counts(B, CMP.y);
  const todas=new Set([...ca.keys(), ...cb.keys()]);
  const linhas=[...todas].filter(k=>!ehSemInfo(vy.values[k])).map(k=>{
    const a=ca.get(k)||0, bb=cb.get(k)||0, pa=A.length? a/A.length : 0, pb=B.length? bb/B.length : 0;
    const pp=(a+bb)/((A.length+B.length)||1), se=Math.sqrt(pp*(1-pp)*(1/(A.length||1)+1/(B.length||1)));
    return { k, a, b:bb, pa, pb, d:pa-pb, z: se>0? (pa-pb)/se : 0 }; })
    .sort((p,q)=>(q.a+q.b)-(p.a+p.b)).slice(0, 18).sort((p,q)=>q.d-p.d);
  const W=Math.max(320, box.clientWidth), lab=Math.min(300, W*0.36), m={t:34, r:96, b:30, l:lab+12}, rowH=26, H=m.t+m.b+linhas.length*rowH;
  const x=d3.scaleLinear().domain([0, Math.max(0.05, d3.max(linhas, d=>Math.max(d.pa,d.pb)))]).nice().range([m.l, W-m.r]);
  const svg=d3.select(box).append('svg').attr('viewBox',`0 0 ${W} ${H}`).attr('width','100%').attr('role','img').attr('aria-label',`Comparação entre ${nomeA} e ${nomeB}`);
  svg.append('g').attr('class','grid').selectAll('line').data(x.ticks(5)).join('line').attr('x1',d=>x(d)).attr('x2',d=>x(d)).attr('y1',m.t-6).attr('y2',H-m.b);
  svg.append('g').attr('class','axis').attr('transform',`translate(0,${H-m.b})`).call(d3.axisBottom(x).ticks(5).tickFormat(d=>Math.round(d*100)+'%')).call(g=>g.select('.domain').remove());
  svg.append('text').attr('class','ax-title').attr('x',W-m.r+10).attr('y',m.t-14).text('A − B (p.p.)');
  const tip=tipFor(box), f1=v=>(v*100).toLocaleString('pt-BR',{maximumFractionDigits:1});
  const g=svg.append('g').selectAll('g').data(linhas).join('g').attr('transform',(d,i)=>`translate(0,${m.t+i*rowH+rowH/2})`).style('cursor','pointer')
    .on('mousemove',(e,d)=>tip.show(e, vy.values[d.k], [`${nomeA}: ${f1(d.pa)}% (${fmt(d.a)} de ${fmt(A.length)})`, `${nomeB}: ${f1(d.pb)}% (${fmt(d.b)} de ${fmt(B.length)})`, `Diferença: ${d.d>=0?'+':'−'}${f1(Math.abs(d.d))} p.p.; z = ${d.z.toLocaleString('pt-BR',{maximumFractionDigits:2})}${Math.abs(d.z)>=1.96? ' (significativa a 5%)' : ' (não significativa)'}`]))
    .on('mouseleave',()=>tip.hide()).on('click',(e,d)=>toggleFilter(CMP.y, d.k));
  g.append('rect').attr('x',0).attr('y',-rowH/2).attr('width',W).attr('height',rowH).attr('fill','transparent');
  g.append('text').attr('class','sc-label').attr('x',m.l-10).attr('y',4).attr('text-anchor','end').style('font-size','12.5px').style('fill','var(--ink)')
    .text(d=>{ const s=vy.values[d.k]; return s.length>Math.floor(lab/6.4)? s.slice(0,Math.floor(lab/6.4)-1)+'…' : s; });
  g.append('line').attr('x1',d=>x(d.pa)).attr('x2',d=>x(d.pb)).attr('stroke',d=>Math.abs(d.z)>=1.96? 'var(--ink-2)' : 'var(--line-2)').attr('stroke-width',2.5);
  g.append('circle').attr('cx',d=>x(d.pb)).attr('r',6).attr('fill',COR_B);
  g.append('circle').attr('cx',d=>x(d.pa)).attr('r',6).attr('fill',COR_A);
  g.append('text').attr('x',W-m.r+10).attr('y',4).style('font-size','12.5px').style('font-weight',d=>Math.abs(d.z)>=1.96? 700 : 400)
    .style('fill',d=>Math.abs(d.z)<1.96? 'var(--ink-3)' : d.d>0? COR_A : '#b37800').text(d=>`${d.d>=0?'+':'−'}${f1(Math.abs(d.d))}${Math.abs(d.z)>=1.96? ' *' : ''}`);
  const lg=el('div','legend'); [[COR_A, `A: ${nomeA} (${fmt(A.length)} notícias)`],[COR_B, `B: ${nomeB}${CMP.bk==='resto'? '' : ` (${fmt(B.length)} notícias)`}`]].forEach(([c,t])=>{ const s=el('span'); const i=el('i','sw'); i.style.background=c; i.style.borderRadius='50%'; s.append(i, document.createTextNode(t)); lg.append(s); });
  box.append(lg);
  // leitura automática: as maiores diferenças significativas em cada direção
  const sig=linhas.filter(d=>Math.abs(d.z)>=1.96), maisA=sig.filter(d=>d.d>0).sort((p,q)=>q.d-p.d).slice(0,3), maisB=sig.filter(d=>d.d<0).sort((p,q)=>p.d-q.d).slice(0,3);
  const junta=a=> a.length<2? a.join('') : a.slice(0,-1).join(', ')+' e '+a[a.length-1];
  const frase=(l,deB)=>junta(l.map(d=> deB? `<b>${vy.values[d.k]}</b> (${f1(d.pb)}% contra ${f1(d.pa)}%)` : `<b>${vy.values[d.k]}</b> (${f1(d.pa)}% contra ${f1(d.pb)}%)`));
  const Lg=$('cmpLeitura'); Lg.hidden=false;
  Lg.innerHTML = `<b>Leitura deste resultado:</b> ` + (!sig.length? `nenhuma diferença entre <b>${nomeA}</b> e <b>${nomeB}</b> é estatisticamente significativa nas categorias de “${vy.label}”; os dois grupos têm perfis parecidos, ou há poucas notícias para afirmar uma diferença.` :
    (maisA.length? `as notícias de <b>${nomeA}</b> têm, proporcionalmente, mais ${frase(maisA)}. ` : '') + (maisB.length? `Já as notícias de <b>${nomeB}</b> têm mais ${frase(maisB,true)}. ` : '') + `As demais diferenças podem ser fruto do acaso.`);
  $('cmpMeta').textContent=`${fmt(A.length)} × ${fmt(B.length)} notícias`;
  const comuns = CMP.bk!=='resto'? rows.filter(r=>temA(r) && r.v[iv].includes(+CMP.bk)).length : 0;
  $('cmpNote').textContent=`Cada linha mostra a proporção das notícias de cada grupo que têm a categoria de “${vy.label}”. As 18 categorias mais frequentes nos dois grupos estão ordenadas da maior vantagem de A à maior vantagem de B. A coluna da direita traz a diferença em pontos percentuais; * marca diferenças significativas a 5% (teste z de duas proporções). Os grupos respeitam os demais filtros ativos.`
    + (comuns? ` ${fmt(comuns)} notícias pertencem aos dois grupos e entram em ambos.` : '') + ' Clique numa linha para filtrar a categoria.';
}
EXTRA.cmp = renderCmp;
