/*
 * Mapas
 * Pranchas cartográficas: círculos proporcionais, coroplético, filtros espaciais e zoom.
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

/* ---------- map ---------- */
const GEO = window.__GEO__;
const PROV_VALS = VARS[VI.provincia].values, DEPT_VALS = VARS[VI.departamento].values, LOC_VALS = VARS[VI.localidad].values;
const LOC_XY = LOC_VALS.map(v=> GEO.coords[v] || null);
const provIdx = {}; PROV_VALS.forEach((v,i)=>{ provIdx[v]=i; });
const deptIdx = {}; DEPT_VALS.forEach((v,i)=>{ deptIdx[v]=i; });
const POP = {}; Object.entries(GEO.pop).forEach(([k,n])=>{ if(provIdx[k]!=null) POP[provIdx[k]]=n; });
const DEPT_HAS = new Set(), DI_ID = [];
let REGS_FC=[];
let TOPO=null, DEPTS=[], PROVS_FC=[], MESH={}, ALL=null, NEIGH=[], DEPT_XY=[], PROV_XY=[], VIZ_DEP=[];
function mainCentroid(f){ // centroid of the largest part, so islands don't pull the symbol into the sea
  const g=f.geometry; if(g.type!=='MultiPolygon') return d3.geoCentroid(f);
  let best=null, ba=-1; g.coordinates.forEach(c=>{ const p={type:'Polygon',coordinates:c}; const a=d3.geoArea(p); if(a>ba){ ba=a; best=p; } }); return d3.geoCentroid(best); }
if(HAS_D3){
  TOPO = GEO.deptos; const OBJ = TOPO.objects[Object.keys(TOPO.objects)[0]];
  DEPTS = topojson.feature(TOPO, OBJ).features;
  const ROTULOS = GEO.deptLabels || {};
  DEPTS.forEach(f=>{ const p=f.properties; p.n = ROTULOS[f.id] || p.n; p.di = deptIdx[p.n] ?? -1; p.pi = provIdx[p.p] ?? -1; p.c = mainCentroid(f);
    if(p.di>=0){ DEPT_HAS.add(p.di); DEPT_XY[p.di]=p.c; DI_ID[p.di]=f.id; } });
  PROVS_FC = [...d3.group(OBJ.geometries, g=>g.properties.p)].map(([p,gs])=>({type:'Feature', properties:{p, pi: provIdx[p] ?? -1}, geometry: topojson.merge(TOPO, gs)}));
  PROVS_FC.forEach(f=>{ if(f.properties.pi>=0) PROV_XY[f.properties.pi]=mainCentroid(f); });
  VIZ_DEP = topojson.neighbors(OBJ.geometries); // contiguidade (rainha) entre departamentos, para o LISA
  MESH.dept = topojson.mesh(TOPO, OBJ, (a,b)=> a!==b && a.properties.p===b.properties.p);
  MESH.prov = topojson.mesh(TOPO, OBJ, (a,b)=> a!==b && a.properties.p!==b.properties.p && a.properties.r===b.properties.r);
  MESH.reg  = topojson.mesh(TOPO, OBJ, (a,b)=> a!==b && a.properties.r!==b.properties.r);
  MESH.out  = topojson.mesh(TOPO, OBJ, (a,b)=> a===b);
  ALL = {type:'FeatureCollection', features: PROVS_FC};
  REGS_FC = [...d3.group(OBJ.geometries, g=>g.properties.r)].map(([r,gs])=>({type:'Feature', properties:{r}, geometry: topojson.merge(TOPO, gs)}));
  const NO = GEO.neigh.objects[Object.keys(GEO.neigh.objects)[0]];
  NEIGH = topojson.feature(GEO.neigh, NO).features;
}

/* ---------- place-level spatial logic ----------
   A news item can cite several places. Filters select news; spatial filters must also restrict
   which of the cited places are drawn or counted, otherwise a GBA filter shows Jujuy from a
   national protest that cited both. OV[type][i][otherType] = indices of overlapping places. */
const SP = ['region','provincia','departamento','localidad'];
const REG_VALS = VARS[VI.region].values; const regIdx={}; REG_VALS.forEach((v,i)=>{ regIdx[v]=i; });
const OV = {region:[], provincia:[], departamento:[], localidad:[]};
function ovOf(type,i){ return OV[type][i] || (OV[type][i]={region:new Set(),provincia:new Set(),departamento:new Set(),localidad:new Set()}); }
function link(a){ const ent=SP.filter(t=>a[t]!=null && a[t]>=0); ent.forEach(t=>{ const o=ovOf(t,a[t]); ent.forEach(u=>o[u].add(a[u])); }); }
if(HAS_D3) DEPTS.forEach(f=>{ const p=f.properties; link({region: regIdx[p.r], provincia: p.pi, departamento: p.di}); });
Object.entries(GEO.locinfo||{}).forEach(([lab,[d,p,r]])=>{ const li=LOC_VALS.indexOf(lab); if(li<0) return;
  link({localidad: li, departamento: d? deptIdx[d] : undefined, provincia: provIdx[p], region: r? regIdx[r] : undefined}); });
function placeOK(type, i, cons){
  for(const [vid,S] of cons){ if(vid===type){ if(!S.has(i)) return false; continue; }
    const o=OV[type][i]; if(!o) return false; let hit=false; for(const x of o[vid]) if(S.has(x)){ hit=true; break; } if(!hit) return false; }
  return true; }
function spatialCons(exceptVid){ return Object.keys(st.f).filter(v=>SP.includes(v) && v!==exceptVid && st.f[v].size).map(v=>[v, st.f[v]]); }
function keepPlaces(c, type, cons){ if(!SP.includes(type) || !cons.length) return c; const out=new Map(); c.forEach((n,i)=>{ if(placeOK(type,i,cons)) out.set(i,n); }); return out; }

const AMBA_BOX = {type:'Feature',geometry:{type:'Polygon',coordinates:[[[-59.05,-34.25],[-57.85,-34.25],[-57.85,-35.05],[-59.05,-35.05],[-59.05,-34.25]]]}};
// Argentine palette: celeste ramp for rates, sol de Mayo gold for proportional circles. Fixed "paper" colors so the sheet exports as printed.
const C = { paper:'#ffffff', sea:'#dbe8f2', grat:'#b7cadb', neigh:'#ece9e3', neighLine:'#9d9a93', land:'#fbfaf7', ink:'#1b2533', ink2:'#4a5767', ink3:'#7b8695',
  dept:'#c3ccd6', prov:'#5f6f82', reg:'#1d3554', ramp:['#e6f1fa','#b9d7f0','#74acdf','#3f7fbf','#1c4f8a'], zero:'#f8f8f5', sol:'#f6b40e', solDark:'#85340a', sel:'#c2410c', label:'#6d7f93' };
const FONT = 'Arial, Helvetica, sans-serif';

/* ---------- camadas de contexto (indicadores oficiais) ----------
   Relativos em coroplético (província ou região) ou em símbolos de cor (aglomerados);
   população absoluta em círculos vazados. Fontes em pipeline/referencias/contexto/FONTES.md */
const CTX = GEO.contexto || {provincias:{}, regioes:{}, aglomerados:[]};
const CTX_RAMP = ['#f4efe4','#dfd2b9','#c2ad88','#957d58','#5e4c33'];
const CTXDEF = {
  dens:   {nivel:'prov', campo:'densidade_hab_km2', titulo:'Densidade demográfica (hab./km²), 2022', curto:'hab./km²', dec:1,
           fonte:'INDEC, Censo 2022, resultados definitivos; área calculada pelo projeto (projeção equivalente de Albers)'},
  hom24:  {nivel:'prov', campo:'taxa_homicidios_2024', titulo:'Homicídios dolosos por 100 mil hab., 2024', curto:'por 100 mil hab.', dec:2,
           fonte:'Ministerio de Seguridad Nacional, SNIC-SAT, Informe de Homicidios Dolosos 2024'},
  pob:    {nivel:'reg', campo:'pobreza_personas_2s2024', titulo:'Pessoas abaixo da linha de pobreza (%), 2º sem. 2024', curto:'% de pessoas', dec:1,
           fonte:'INDEC, Encuesta Permanente de Hogares, 31 aglomerados urbanos (por região estatística)'},
  ind:    {nivel:'reg', campo:'indigencia_personas_2s2024', titulo:'Pessoas abaixo da linha de indigência (%), 2º sem. 2024', curto:'% de pessoas', dec:1,
           fonte:'INDEC, Encuesta Permanente de Hogares, 31 aglomerados urbanos (por região estatística)'},
  des:    {nivel:'reg', campo:'desocupacao_4t2024', titulo:'Taxa de desocupação (%), 4º trim. 2024', curto:'%', dec:1,
           fonte:'INDEC, Encuesta Permanente de Hogares, mercado de trabalho (por região estatística)'},
  pobAgl: {nivel:'agl', campo:'pobreza_personas_2s2024', titulo:'Pobreza por aglomerado urbano (% de pessoas), 2º sem. 2024', curto:'% de pessoas', dec:1,
           fonte:'INDEC, Encuesta Permanente de Hogares, quadro 4.1'},
  desAgl: {nivel:'agl', campo:'desocupacao_4t2024', titulo:'Desocupação por aglomerado urbano (%), 4º trim. 2024', curto:'%', dec:1,
           fonte:'INDEC, Encuesta Permanente de Hogares, mercado de trabalho'},
  popAbs: {nivel:'pop', titulo:'População residente, 2022 (absoluto)', fonte:'INDEC, Censo 2022, resultados definitivos'},
};
/* Censo 2022 por departamento (INDEC, Geoportal estadístico): coroplético sobre os 511 departamentos/partidos */
const IND = (CTX.indec && CTX.indec.indicadores) || [], IND_DEP = (CTX.indec && CTX.indec.departamentos) || {};
const indAno = d => d.ano || 2022, indTit = d => /20\d\d/.test(d.titulo)? d.titulo : `${d.titulo}, ${indAno(d)}`;
// ordem dos grupos: primeiro os indicadores ligados às lutas, depois os controles demográficos
const IND_TEMAS = grupo => [...new Set(IND.filter(d=>(d.grupo||'lutas')===grupo).map(d=>d.tema))];
const LUTAS_PROV = (CTX.lutas_prov)||[];
IND.forEach(d=>{ CTXDEF['c_'+d.k] = {nivel:'dep', campo:d.k, titulo:indTit(d), curto:d.unidade, dec:d.dec, tema:d.tema, definicao:d.definicao,
  fonte: d.fonte || `INDEC, Censo Nacional de Población, Hogares y Viviendas 2022, via Geoportal estadístico (indicador ${d.ids[0]}: “${d.indec}”)`}; });
LUTAS_PROV.forEach(d=>{ CTXDEF['lp_'+d.campo] = {nivel:'prov', campo:d.campo, titulo:`${d.titulo} (${d.unidade}), ${d.ano}`, curto:d.unidade, dec:d.dec, definicao:d.definicao, fonte:d.fonte}; });
CTXDEF.popDep = {nivel:'popDep', titulo:'População residente por departamento, 2022 (absoluto)', fonte:'INDEC, Censo 2022, via Geoportal estadístico (indicador 37)'};
(()=>{ const s=$('ctxLayer'); if(!IND.length) return;
  const og0=s.querySelector('optgroup'); const op=document.createElement('option'); op.value='popDep'; op.textContent='População absoluta por departamento (círculos)'; og0.append(op);
  const grupo=(g, rot)=>IND_TEMAS(g).forEach(t=>{ const og=document.createElement('optgroup'); og.label=`${rot}${t} · por departamento`;
    IND.filter(d=>d.tema===t && (d.grupo||'lutas')===g).forEach(d=>{ const o=document.createElement('option'); o.value='c_'+d.k; o.textContent=indTit(d).replace(/, 2022$/,''); og.append(o); }); s.append(og); });
  grupo('lutas','');
  if(LUTAS_PROV.length){ const og=document.createElement('optgroup'); og.label='Economia popular e violência de gênero · por província';
    LUTAS_PROV.forEach(d=>{ const o=document.createElement('option'); o.value='lp_'+d.campo; o.textContent=`${d.titulo}, ${d.ano}`; og.append(o); }); s.append(og); }
  grupo('controle','Controles demográficos: '); })();
/* análise espacial: mapa bivariado e pontos quentes (LISA), por departamento */
IND.forEach(d=>{ CTXDEF['biv_'+d.k] = {nivel:'biv', campo:d.k, titulo:`Notícias por 100 mil hab. × ${d.titulo.charAt(0).toLowerCase()+d.titulo.slice(1)}${/20\d\d/.test(d.titulo)? '' : ` (${indAno(d)})`}`, curto:d.unidade, dec:d.dec, indTitulo:d.titulo,
  fonte: d.fonte? `notícias: base do projeto; ${/população/.test(d.fonte)? '' : 'população: INDEC, Censo 2022; '}indicador: ${d.fonte}` : `notícias: base do projeto; população e indicador: INDEC, Censo 2022, via Geoportal estadístico (indicador ${d.ids[0]})`}; });
CTXDEF.lisa = {nivel:'lisa', titulo:'Pontos quentes: notícias por 100 mil hab. (LISA), por departamento', fonte:'notícias: base do projeto; população: INDEC, Censo 2022 (Geoportal estadístico)'};
(()=>{ const s=$('ctxLayer'); if(!IND.length) return;
  const og=document.createElement('optgroup'); og.label='Análise espacial das notícias (por departamento)';
  const o=document.createElement('option'); o.value='lisa'; o.textContent='Pontos quentes e frios (LISA)'; og.append(o); s.append(og);
  const og2=document.createElement('optgroup'); og2.label='Mapa bivariado: notícias por habitante × indicadores ligados às lutas';
  IND.filter(d=>(d.grupo||'lutas')==='lutas').forEach(d=>{ const o=document.createElement('option'); o.value='biv_'+d.k; o.textContent='× '+d.titulo; og2.append(o); }); s.append(og2);
  const og3=document.createElement('optgroup'); og3.label='Mapa bivariado: notícias por habitante × controles demográficos';
  IND.filter(d=>d.grupo==='controle').forEach(d=>{ const o=document.createElement('option'); o.value='biv_'+d.k; o.textContent='× '+d.titulo; og3.append(o); }); s.append(og3); })();
const POP_D = []; DEPTS.forEach(f=>{ const v=IND_DEP[f.id]; if(f.properties.di>=0 && v && v.pop) POP_D[f.properties.di]=v.pop; });
const popOf = (unit, i) => unit==='dept'? POP_D[i] : unit==='prov'? POP[i] : null;
const ctxEscolha = k => (k && CTXDEF[k]) || null;
function ctxValor(def, chave){ if(!def) return null; const fonte = def.nivel==='prov'? CTX.provincias : def.nivel==='reg'? CTX.regioes : def.nivel==='dep'? IND_DEP : null; const r = fonte && fonte[chave]; return r? r[def.campo] : null; }
function ctxClasses(def){
  let vals = def.nivel==='agl'? CTX.aglomerados.map(a=>a[def.campo]) : Object.values(def.nivel==='prov'? CTX.provincias : def.nivel==='dep'? IND_DEP : CTX.regioes).map(r=>r[def.campo]);
  vals = vals.filter(v=>v!=null && isFinite(v)).sort(d3.ascending);
  const k = Math.min(5, vals.length), rnd = v => +v.toFixed(def.dec);
  const th = [...new Set(d3.range(1,k).map(i=>rnd(d3.quantileSorted(vals, i/k))))].filter(x=>x>vals[0] && x<vals[vals.length-1]);
  const ramp = CTX_RAMP.slice(CTX_RAMP.length-(th.length+1));
  const color = v => { if(v==null || !isFinite(v)) return '#f1f1ef'; let i=0; while(i<th.length && v>th[i]) i++; return ramp[i]; };
  const f = v => v.toLocaleString('pt-BR',{minimumFractionDigits:def.dec, maximumFractionDigits:def.dec});
  const lo=[vals[0], ...th], hi=[...th, vals[vals.length-1]];
  return { color, items: ramp.map((c,i)=>[c, i===0? `${f(lo[i])} a ${f(hi[i])}` : `mais de ${f(lo[i])} a ${f(hi[i])}`]), fmt:f };
}
/* ---------- bivariado e LISA ---------- */
const BIV_X=['#ffffff','#f7d27a','#f2a900'], BIV_Y=['#ffffff','#a9cdee','#2569ad'];
const mult=(a,b)=>{ const p=d3.rgb(a), q=d3.rgb(b); return d3.rgb(p.r*q.r/255, p.g*q.g/255, p.b*q.b/255).formatHex(); };
const BIV = BIV_Y.map(y=>BIV_X.map(x=>mult(x,y)));
function taxasDept(b){ // notícias e notícias por 100 mil hab. por departamento (id da camada de limites)
  const md=mapData(b.filter(r=>match(r,'departamento')),'dept'), out=new Map();
  DEPTS.forEach(f=>{ const v=IND_DEP[f.id]; if(!v || !v.pop) return; const i=f.properties.di, n=i>=0? (md.c.get(i)||0) : 0; out.set(f.id,{n, pop:v.pop, rate:n/v.pop*1e5}); });
  return out; }
function bivCalc(def, T){
  const pos=[...T.values()].filter(t=>t.n>0).map(t=>t.rate).sort(d3.ascending), med=pos.length? d3.quantileSorted(pos,.5) : 0;
  const iv=Object.values(IND_DEP).map(r=>r[def.campo]).filter(v=>v!=null).sort(d3.ascending), t1=d3.quantileSorted(iv,1/3), t2=d3.quantileSorted(iv,2/3);
  const xs=t=>!t||!t.n? 0 : t.rate<=med? 1 : 2, ys=v=>v==null? null : v<=t1? 0 : v<=t2? 1 : 2;
  const cel=BIV.map(r=>r.map(()=>0)); DEPTS.forEach(f=>{ const t=T.get(f.id), y=ys((IND_DEP[f.id]||{})[def.campo]); if(t && y!=null) cel[y][xs(t)]++; });
  return { med, t1, t2, cel, cls:f=>{ const t=T.get(f.id), y=ys((IND_DEP[f.id]||{})[def.campo]); return (y==null||!t)? null : [xs(t), y]; } };
}
function lisaCalc(T){
  const ts=[...T.values()]; let N=0, P=0; ts.forEach(t=>{ N+=t.n; P+=t.pop; });
  const bb=N/P, pm=P/ts.length; let s2=0; ts.forEach(t=>{ s2+=t.pop*(t.n/t.pop-bb)**2; }); s2/=P; const a=Math.max(0, s2-bb/pm);
  // taxa bayesiana empírica global (Marshall): estabiliza departamentos pouco populosos
  const x=DEPTS.map(f=>{ const t=T.get(f.id); if(!t) return null; const r=t.n/t.pop; return (bb + (a+bb/t.pop>0? a/(a+bb/t.pop) : 0)*(r-bb))*1e5; });
  const val=x.map((v,i)=>v!=null? i : -1).filter(i=>i>=0), mu=d3.mean(val,i=>x[i]), sd=d3.deviation(val,i=>x[i])||1;
  const z=x.map(v=>v==null? null : (v-mu)/sd);
  const viz=VIZ_DEP.map((ns,i)=>z[i]==null? [] : ns.filter(j=>z[j]!=null));
  const lag=z.map((zi,i)=>viz[i].length? d3.mean(viz[i],j=>z[j]) : null);
  let rs=20241; const rnd=()=>{ rs=(rs*1103515245+12345)&0x7fffffff; return rs/0x7fffffff; };
  const R=499, cls=new Array(DEPTS.length).fill(null), pv=new Array(DEPTS.length).fill(null);
  z.forEach((zi,i)=>{ if(zi==null || !viz[i].length) return; const k=viz[i].length, Ii=zi*lag[i]; let cnt=0;
    // permutação condicional: o valor do departamento fica fixo e sorteiam-se k “vizinhos” ao acaso entre os demais, sem reposição
    const outros=val.filter(j=>j!==i), m=outros.length;
    for(let r=0;r<R;r++){ let sm=0; for(let q=0;q<k;q++){ const t=q+Math.floor(rnd()*(m-q)); const tmp=outros[q]; outros[q]=outros[t]; outros[t]=tmp; sm+=z[outros[q]]; } const Is=zi*sm/k; if(Ii>=0? Is>=Ii : Is<=Ii) cnt++; }
    const p=(cnt+1)/(R+1); pv[i]=p; if(p<0.05) cls[i] = zi>0? (lag[i]>0? 'HH':'HL') : (lag[i]<0? 'LL':'LH'); else cls[i]='ns'; });
  const comViz=z.map((zi,i)=>zi!=null && viz[i].length? i : -1).filter(i=>i>=0), den=d3.sum(comViz,i=>z[i]**2);
  const Iglob=d3.sum(comViz,i=>z[i]*lag[i])/den;
  let maior=0; const zz=comViz.map(i=>z[i]);
  for(let r=0;r<199;r++){ const perm=zz.slice(); for(let q=perm.length-1;q>0;q--){ const j=Math.floor(rnd()*(q+1)); [perm[q],perm[j]]=[perm[j],perm[q]]; }
    const pz=new Map(comViz.map((i,q)=>[i,perm[q]])); const Ir=d3.sum(comViz,i=>pz.get(i)*d3.mean(viz[i],j=>pz.has(j)? pz.get(j) : z[j]))/den; if(Ir>=Iglob) maior++; }
  const n={HH:0,LL:0,HL:0,LH:0,ns:0}; cls.forEach(c=>{ if(c) n[c]++; });
  // detalhes por departamento, para a explicação do cálculo
  const det=new Map(DEPTS.map((f,i)=>{ const t=T.get(f.id); return [f.id, t? {nome:/\(/.test(f.properties.n)? f.properties.n : `${f.properties.n} (${f.properties.p})`, n:t.n, pop:t.pop, bruta:t.n/t.pop*1e5, eb:x[i], z:z[i], lag:lag[i], k:viz[i].length, Ii: z[i]!=null && lag[i]!=null? z[i]*lag[i] : null, p:pv[i], cls:cls[i]} : null]; }));
  const semViz=z.filter((zi,i)=>zi!=null && !viz[i].length).length;
  return { cls:new Map(DEPTS.map((f,i)=>[f.id, cls[i]])), pv:new Map(DEPTS.map((f,i)=>[f.id, pv[i]])), eb:new Map(DEPTS.map((f,i)=>[f.id, x[i]])), I:Iglob, pI:(maior+1)/200, n, det,
    par:{N, P, taxa:bb*1e5, a, mu, sd, R, nDep:val.length, semViz} };
}
const LISA_COR = { HH:'#c45a00', LL:'#2569ad', HL:'#f6c768', LH:'#a9cdee', ns:'#f4f4f1' };
const LISA_ROT = { HH:'Alto cercado de alto (ponto quente)', LL:'Baixo cercado de baixo (ponto frio)', HL:'Alto cercado de baixo', LH:'Baixo cercado de alto', ns:'Não significativo (p ≥ 0,05)' };
let ESP_CACHE={k:null, v:null};

/* ---------- topônimos: nomes que aparecem conforme o zoom ----------
   Províncias e capitais em todas as escalas; cidades por população a partir de certos níveis de aproximação;
   departamentos/partidos nas aproximações maiores e no detalhe da AMBA. Rótulos sem sobreposição, com halo branco. */
const TOPO_PTS = ((GEO.toponimos)||[]).map(([n,lon,lat,pop,t])=>({n,lon,lat,pop,t}));
const limiarCidade = k => k>=18? 2000 : k>=10? 10000 : k>=6? 30000 : k>=3.5? 80000 : k>=2? 250000 : Infinity;
function topoLayer(m, proj, box, k, modo){
  const [x0,y0,x1,y1]=box, ocup=[], out=[];
  const cabe=(bx)=>{ if(bx[0]<x0+4 || bx[2]>x1-4 || bx[1]<y0+4 || bx[3]>y1-4) return false; if(ocup.some(o=>!(bx[2]<o[0]||bx[0]>o[2]||bx[3]<o[1]||bx[1]>o[3]))) return false; ocup.push(bx); return true; };
  const larg=(t,size,w)=>{ _cv.font=`${w||400} ${size}px ${FONT}`; return _cv.measureText(t).width; };
  // 1) províncias (até aproximação moderada)
  if(modo==='pais' && k<6) PROVS_FC.forEach(f=>{ const c=f.properties.pi>=0? PROV_XY[f.properties.pi] : mainCentroid(f); const p=proj(c); if(!p) return;
    const nome=f.properties.p.replace(/^CABA.*$/,'CABA').toUpperCase(); if(nome==='CABA') return; const sz=k>=2.5? 10.5 : 8.5, w=larg(nome,sz,600)*1.12;
    const bx=[p[0]-w/2, p[1]-sz, p[0]+w/2, p[1]+3]; if(cabe(bx)) out.push({tipo:'prov', x:p[0], y:p[1], t:nome, sz}); });
  // 2) cidades: capitais sempre; demais pela população e pelo zoom
  const lim = modo==='amba'? 250000 : modo==='mini'? (k>=2? 1e6 : Infinity) : limiarCidade(k);
  TOPO_PTS.filter(c=> modo==='mini'? (c.t!=='D' && k>=2) : (c.t!=='D' || c.pop>=lim)).forEach(c=>{ const p=proj([c.lon,c.lat]); if(!p || p[0]<x0 || p[0]>x1 || p[1]<y0 || p[1]>y1) return;
    const imp=c.t==='C'? 3 : c.t==='A'? 2 : c.pop>=500000? 2 : 1, sz=modo==='mini'? 8.5 : imp===3? 12 : imp===2? 11 : 10, w=larg(c.n,sz,imp>=2?700:500);
    const cands=[[p[0]+5, p[1]+sz*0.35, 'start'], [p[0]-5, p[1]+sz*0.35, 'end'], [p[0], p[1]-6, 'middle'], [p[0], p[1]+sz+4, 'middle']];
    for(const [tx,ty,a] of cands){ const xa= a==='start'? tx : a==='end'? tx-w : tx-w/2; const bx=[xa-1, ty-sz, xa+w+1, ty+3]; if(cabe(bx)){ ocup.push([p[0]-3,p[1]-3,p[0]+3,p[1]+3]); out.push({tipo:'cid', x:p[0], y:p[1], tx, ty, a, t:c.n, sz, imp}); break; } } });
  // 3) departamentos e partidos
  if((modo==='pais' && k>=8) || modo==='amba') DEPTS.forEach(f=>{ if(modo==='amba' && f.properties.r!=='Gran Buenos Aires') return; const p=proj(f.properties.c); if(!p) return;
    const nome=f.properties.n.replace(/\s*\([^)]*\)\s*$/,'').replace(/^CABA.*/,'CABA'); const sz=modo==='amba'? 9 : 9.5, w=larg(nome,sz,400);
    const bx=[p[0]-w/2-1, p[1]-sz, p[0]+w/2+1, p[1]+3]; if(cabe(bx)) out.push({tipo:'dep', x:p[0], y:p[1], t:nome, sz}); });
  const g=m.append('g').attr('class','toponimos').attr('pointer-events','none');
  out.forEach(d=>{
    if(d.tipo==='cid'){ g.append('circle').attr('cx',d.x).attr('cy',d.y).attr('r', d.imp===3? 3.4 : d.imp===2? 2.8 : 2.1).attr('fill', d.imp>=2? C.ink : '#ffffff').attr('stroke',C.ink).attr('stroke-width',1);
      g.append('text').attr('x',d.tx).attr('y',d.ty).attr('text-anchor',d.a).attr('font-size',d.sz).attr('font-family',FONT).attr('font-weight',d.imp>=2? 700 : 500).attr('fill',C.ink)
        .attr('paint-order','stroke').attr('stroke','#ffffff').attr('stroke-width',3).attr('stroke-linejoin','round').attr('stroke-opacity',.9).text(d.t); }
    else if(d.tipo==='prov') g.append('text').attr('x',d.x).attr('y',d.y).attr('text-anchor','middle').attr('font-size',d.sz).attr('font-family',FONT).attr('font-weight',600).attr('letter-spacing',1.2).attr('fill','#6d7f93')
        .attr('paint-order','stroke').attr('stroke','#ffffff').attr('stroke-width',2.5).attr('stroke-opacity',.7).text(d.t);
    else g.append('text').attr('x',d.x).attr('y',d.y).attr('text-anchor','middle').attr('font-size',d.sz).attr('font-family',FONT).attr('font-style','italic').attr('fill','#56677c')
        .attr('paint-order','stroke').attr('stroke','#ffffff').attr('stroke-width',2.5).attr('stroke-opacity',.85).text(d.t); });
  return out.length;
}

/* ---------- explicação do cálculo do mapa atual (caixa "Como foi calculado este mapa") ---------- */
function explicaMapa(md, o, unit, cdef){
  const C0=$('mapCalcCorpo'); if(!C0) return; C0.textContent='';
  const ul=el('ul'); C0.append(ul);
  const item = html => { const li=el('li'); const pp=sinPseguro(html); li.append(...pp); ul.append(li); };
  const nUn = unit==='dept'? 'departamento' : unit==='prov'? 'província' : 'localidade';
  item(`**O que se conta.** Cada notícia do recorte é atribuída ${unit==='loc'? 'às localidades' : unit==='dept'? 'aos departamentos' : 'às províncias'} que ela cita (uma notícia que cita dois lugares conta para os dois). Notícias de escala nacional, virtuais ou sem lugar identificável ficam de fora: ${fmt(md.N-md.mapped)} das ${fmt(md.N)} neste recorte.`);
  if(o.circles) item(`**Círculos.** A área de cada círculo é proporcional ao número de notícias que citam a ${nUn} (o raio cresce com a raiz quadrada), para que um círculo com o dobro de notícias tenha o dobro da área, e não o dobro do diâmetro. O maior círculo do mapa corresponde a ${fmt(md.max||0)} notícias.`);
  if(o.fill) item(`**Cores (taxa por habitante).** Para cada ${nUn}: notícias ÷ população do Censo 2022 × 100.000. As classes são quintis: os lugares com pelo menos uma notícia são ordenados pela taxa e divididos em cinco grupos do mesmo tamanho; o branco indica nenhuma notícia. A taxa compara lugares de tamanhos diferentes, mas em lugares pouco populosos uma só notícia já gera um valor alto.`);
  if(o.dest && o.dest.feats.length){
    const al=o.dest.feats.filter(d=>d.t==='alto').sort((a,q)=>q.razao-a.razao), ba=o.dest.feats.filter(d=>d.t==='baixo').sort((a,q)=>a.razao-q.razao);
    const ex=al[0], P=d3.sum(unit==='dept'? DEPTS.filter(f=>(IND_DEP[f.id]||{}).pop).map(f=>IND_DEP[f.id].pop) : PROVS_FC.filter(f=>f.properties.pi>=0 && POP[f.properties.pi]).map(f=>POP[f.properties.pi]));
    const pe = d => unit==='dept'? IND_DEP[d.f.id].pop : POP[d.f.properties.pi];
    const nm = d => d.nome; // com a província entre parênteses, para evitar ambiguidades (ex.: “Capital”)
    const pfmt = p => p<0.0001? '< 0,0001' : p.toLocaleString('pt-BR',{maximumFractionDigits:4});
    item(`**Contornos: muito acima ou muito abaixo do esperado.** A pergunta é: _este lugar tem mais (ou menos) notícias do que o tamanho da sua população faria esperar?_ (1) O **esperado** é a parte do total que caberia ao lugar se as notícias se distribuíssem exatamente como a população: total de notícias do mapa (${fmt(o.dest.tot)}) × população do lugar ÷ população do país. (2) Compara-se com o **observado**. (3) Como números pequenos variam muito por acaso, usa-se o **teste exato de Poisson**, que dá a probabilidade de ver uma diferença tão grande só por acaso. O contorno **laranja** marca lugares com 3 notícias ou mais e probabilidade menor que 1% (p < 0,01) de ter tantas notícias por acaso; o **azul**, lugares com probabilidade menor que 1% de ter tão poucas.`
      + (ex? ` **Exemplo:** ${nm(ex)} tem ${fmt(pe(ex))} habitantes (${(pe(ex)/P*100).toLocaleString('pt-BR',{maximumFractionDigits:3})}% da população); o esperado seria ${fmt(o.dest.tot)} × ${(pe(ex)/P*100).toLocaleString('pt-BR',{maximumFractionDigits:3})}% ≈ ${nfmt1(ex.E)} notícia${ex.E>=1.95? 's' : ''}, mas há ${fmt(ex.O)}: ${nfmt1(ex.razao)} vezes o esperado (p ${pfmt(ex.p)}).` : ''));
    if(al.length) item(`**Acima do esperado (${al.length}):** ${al.slice(0,8).map(d=>`${nm(d)}: ${fmt(d.O)} observadas × ${nfmt1(d.E)} esperadas`).join('; ')}${al.length>8? '; …' : '.'}`);
    if(ba.length) item(`**Abaixo do esperado (${ba.length}):** ${ba.slice(0,8).map(d=>`${nm(d)}: ${fmt(d.O)} observadas × ${nfmt1(d.E)} esperadas`).join('; ')}${ba.length>8? '; …' : '.'} Lugares abaixo do esperado podem ter pouca mobilização ou pouca cobertura da imprensa: confira na aba Imprensa.`);
  } else if(unit==='loc') item(`**Contornos de destaque** aparecem só por departamento ou província, porque dependem da população do lugar.`);
  if(cdef && cdef.nivel==='biv') item(`**Mapa bivariado.** Cada departamento recebe uma cor que junta duas informações. No eixo das notícias: nenhuma notícia; até a mediana das taxas dos departamentos com notícias; acima dela. No eixo do indicador (“${cdef.indTitulo}”): tercis, isto é, os departamentos ordenados pelo indicador e divididos em três grupos iguais (baixo, médio, alto). As nove combinações são cores misturadas de amarelo (notícias) e azul (indicador). Fonte do indicador: ${cdef.fonte}.`);
  else if(cdef && cdef.nivel==='lisa'){ const L=ESP_CACHE.v; const nf=(v,d=1)=>(v<0? '−' : '')+Math.abs(v).toLocaleString('pt-BR',{maximumFractionDigits:d, minimumFractionDigits:d});
    const pfm=p=>p<0.0021? '0,002 (o menor possível com 499 sorteios)' : nf(p,3);
    item(`**Pontos quentes e frios (LISA).** LISA quer dizer _Local Indicator of Spatial Association_ (indicador local de associação espacial). Aqui se usa o **I de Moran local** (Anselin, 1995). A pergunta é: _este departamento e os seus vizinhos têm, juntos, mais (ou menos) notícias por habitante do que o resto do país, de um jeito que dificilmente seria acaso?_ O cálculo tem seis passos.`);
    if(L){ const P=L.par;
      item(`**Passo 1 · Taxa bruta.** Para cada um dos ${fmt(P.nDep)} departamentos com população no Censo 2022: notícias do recorte que citam o departamento ÷ população × 100.000. Departamentos sem notícias entram com taxa zero. No país, ${fmt(P.N)} citações para ${fmt(P.P)} habitantes: ${nf(P.taxa,2)} por 100 mil.`);
      item(`**Passo 2 · Suavização (taxa bayesiana empírica, método de Marshall).** Em departamentos pequenos, uma única notícia faz a taxa disparar. Por isso cada taxa é “puxada” em direção à média nacional, com mais força quanto menor a população: taxa suavizada = média + peso × (taxa bruta − média), com peso = A ÷ (A + média ÷ população), onde A = ${nf(P.a*1e10,2)} × 10⁻¹⁰ é a variação entre departamentos que não se explica pelo acaso. Um departamento grande mantém quase a sua taxa; um pequeno fica perto da média.`);
      item(`**Passo 3 · Padronização.** As taxas suavizadas viram escores z: (taxa − ${nf(P.mu,2)}) ÷ ${nf(P.sd,2)}, isto é, quantos desvios-padrão cada departamento está acima (+) ou abaixo (−) da média dos departamentos.`);
      item(`**Passo 4 · Vizinhos.** São vizinhos os departamentos que compartilham fronteira ou vértice com ele (contiguidade do tipo “rainha”), segundo a camada de limites. Calcula-se a **média dos escores z dos vizinhos** (a “defasagem espacial”). ${P.semViz? `${fmt(P.semViz)} departamentos sem vizinhos (ilhas) ficam fora.` : ''}`);
      item(`**Passo 5 · I local = z do departamento × média dos z dos vizinhos.** Positivo quando os dois têm o mesmo sinal (alto com alto, baixo com baixo); negativo quando são opostos. A classe sai dos sinais: **alto-alto** (ponto quente, laranja), **baixo-baixo** (ponto frio, azul), **alto-baixo** (amarelo claro: departamento alto cercado de baixos) e **baixo-alto** (azul claro).`);
      item(`**Passo 6 · Teste de permutação.** Para saber se o I local poderia ser acaso, o valor do departamento fica fixo e se sorteiam, ${fmt(P.R)} vezes, vizinhos ao acaso entre os demais departamentos (o mesmo número de vizinhos que ele tem), recalculando o I. O valor p é a parte dos sorteios com I tão extremo quanto o observado: p = (sorteios tão extremos + 1) ÷ (${fmt(P.R)} + 1). Só se pinta a classe quando **p < 0,05**; os demais ficam em cinza (“não significativo”).`);
      const ds=[...L.det.values()].filter(Boolean), hh=ds.filter(d=>d.cls==='HH').sort((a,q)=>q.Ii-a.Ii), ll=ds.filter(d=>d.cls==='LL').sort((a,q)=>q.Ii-a.Ii);
      const ex=hh.find(d=>d.n>0 && d.k>=2) || hh[0];
      if(ex) item(`**Exemplo: ${ex.nome}.** ${fmt(ex.n)} notícias para ${fmt(ex.pop)} habitantes = taxa bruta de ${nf(ex.bruta,1)} por 100 mil; suavizada, ${nf(ex.eb,1)}; escore z = ${nf(ex.z,2)}. Tem ${fmt(ex.k)} vizinhos, cuja média de z é ${nf(ex.lag,2)}. I local = ${nf(ex.z,2)} × ${nf(ex.lag,2)} = ${nf(ex.Ii,2)}. Nos sorteios, p = ${pfm(ex.p)}: como os dois são positivos e p < 0,05, é um **ponto quente**.`);
      const exl=ll[0];
      if(exl) item(`**Exemplo de ponto frio: ${exl.nome}.** ${fmt(exl.n)} notícias para ${fmt(exl.pop)} habitantes; z = ${nf(exl.z,2)}, média dos ${fmt(exl.k)} vizinhos = ${nf(exl.lag,2)}, I local = ${nf(exl.Ii,2)}, p = ${pfm(exl.p)}.`);
      item(`**Resultado neste recorte:** ${fmt(L.n.HH)} pontos quentes${hh.length? ` (${hh.slice(0,10).map(d=>d.nome).join('; ')}${hh.length>10? '; …' : ''})` : ''}; ${fmt(L.n.LL)} pontos frios${ll.length? ` (${ll.slice(0,8).map(d=>d.nome).join('; ')}${ll.length>8? '; …' : ''})` : ''}; ${fmt(L.n.HL)} altos isolados e ${fmt(L.n.LH)} baixos isolados; ${fmt(L.n.ns)} não significativos.`);
      item(`**Medida global (I de Moran).** Resume o mapa inteiro: soma de z × média dos z vizinhos ÷ soma de z², com pesos padronizados por linha. Vale ${nf(L.I,3)}, com p ≈ ${nf(L.pI,3)} em 199 permutações das taxas entre os departamentos. ${L.pI<0.05 && L.I>0? 'Positivo e significativo: departamentos parecidos tendem a ficar perto uns dos outros, formando manchas.' : 'Sem agrupamento espacial claro no conjunto do mapa.'}`);
      item(`**Cuidados.** (a) São cerca de ${fmt(P.nDep)} testes ao mesmo tempo: com p < 0,05, uns ${fmt(Math.round(P.nDep*0.05))} departamentos poderiam aparecer como significativos só por acaso; leia as manchas formadas por vários departamentos com mais confiança do que casos isolados. (b) O resultado depende da definição de vizinhança e da camada de limites. (c) A taxa mede notícias, não protestos: regiões com mais cobertura de imprensa tendem a sair mais quentes. (d) Os sorteios usam semente fixa, para que o mapa seja sempre o mesmo para o mesmo recorte.`);
    } else item(`**Pontos quentes (LISA).** O cálculo aparece aqui quando o mapa termina de ser desenhado.`); }
  else if(cdef && cdef.nivel!=='pop') item(`**Camada de contexto.** “${cdef.titulo}”, ${cdef.nivel==='reg'? 'por região estatística' : cdef.nivel==='agl'? 'por aglomerado urbano' : cdef.nivel==='prov'? 'por província' : 'por departamento'}, em cinco classes de quintis (do mais claro ao mais escuro). Fonte: ${cdef.fonte}.${cdef.definicao? ' Definição: ' + cdef.definicao.split(/\n/)[0] : ''}`);
  if(mstate.mes) item(`**Período.** Só as notícias do mês escolhido; a escala dos círculos é comum a todos os meses, para que a animação compare meses entre si.`);
}
// texto com **negrito** e _itálico_ → nós (sem HTML)
function sinPseguro(t){ const out=[]; t.split(/(\*\*[^*]+\*\*|_[^_]+_)/).forEach(x=>{ if(!x) return; if(x.startsWith('**')) out.push(el('b',null,x.slice(2,-2))); else if(/^_.+_$/.test(x)) out.push(el('i',null,x.slice(1,-1))); else out.push(document.createTextNode(x)); }); return out; }

/* ---------- destaques: lugares com notícias muito acima ou abaixo do esperado pela população ----------
   Esperado = total de notícias do recorte × (população do lugar ÷ população total). Teste exato de Poisson, p < 0,01. */
const COR_ALTO='#c45a00', COR_BAIXO='#2569ad';
function poisCdf(O, E){ if(O<0) return 0; let t=Math.exp(-E), soma=t; for(let k=1;k<=O;k++){ t*=E/k; soma+=t; } return Math.min(1,soma); }
function destaques(md){
  const feats = md.unit==='dept'? DEPTS.filter(f=>(IND_DEP[f.id]||{}).pop) : PROVS_FC.filter(f=>f.properties.pi>=0 && POP[f.properties.pi]);
  const popF = f => md.unit==='dept'? IND_DEP[f.id].pop : POP[f.properties.pi], obsF = f => { const i = md.unit==='dept'? f.properties.di : f.properties.pi; return i>=0? (md.c.get(i)||0) : 0; };
  const tot=d3.sum(feats,obsF), P=d3.sum(feats,popF), out=[];
  if(tot<10) return {feats:[], tot};
  feats.forEach(f=>{ const O=obsF(f), E=tot*popF(f)/P, nome = md.unit==='dept'? f.properties.n : f.properties.p;
    const pAlto = 1-poisCdf(O-1,E), pBaixo = poisCdf(O,E);
    if(O>=3 && O>E && pAlto<0.01) out.push({f, t:'alto', O, E, p:pAlto, nome, razao:O/E});
    else if(O<E && pBaixo<0.01) out.push({f, t:'baixo', O, E, p:pBaixo, nome, razao:O/E}); });
  return { feats: out, tot };
}

const PROJ = () => d3.geoConicConformal().parallels([-28,-46]).rotate([64,0]);
const mstate = { unit:'loc', measure:'abs', mode:'one', cmp:'nombremov', n:6, author:'', ctx:'', mes:'' };
try{ const s=JSON.parse(localStorage.getItem('as24m2')||'null'); if(s){ Object.assign(mstate, s); if(VI[mstate.cmp]==null) mstate.cmp='nombremov'; } }catch(e){}
const msave = () => { try{ localStorage.setItem('as24m2', JSON.stringify(mstate)); }catch(e){} };
const RATE_OK = u => u==='prov' || u==='dept';
fillSelect($('cmpVar'), false);
document.querySelectorAll('#mapUnit button').forEach(b=>b.onclick=()=>{ mstate.unit=b.dataset.v; if(!RATE_OK(mstate.unit)) mstate.measure='abs'; render(); });
document.querySelectorAll('#mapMeasure button').forEach(b=>b.onclick=()=>{ if(b.disabled) return; mstate.measure=b.dataset.v; render(); });
document.querySelectorAll('#mapMode button').forEach(b=>b.onclick=()=>{ mstate.mode=b.dataset.v; render(); });
$('cmpVar').onchange=e=>{ mstate.cmp=e.target.value; render(); };
$('ctxLayer').onchange=e=>{ mstate.ctx=e.target.value; render(); };
$('mapTopo').onchange=e=>{ mstate.topo=e.target.checked; render(); };
$('mapDest').onchange=e=>{ mstate.dest=e.target.checked; render(); };
const MES_VALS = VARS[VI.mes].values;
MES_VALS.forEach((m,i)=>{ const o=el('option',null,m.replace(/^\d\d · /,'')); o.value=String(i); $('mapMes').append(o); });
$('mapMes').onchange=e=>{ mstate.mes=e.target.value; pararAnim(); render(); };
let ANIM=null;
function pararAnim(){ if(ANIM){ clearInterval(ANIM); ANIM=null; } $('mapPlay').textContent='Animar mês a mês'; $('mapPlay').setAttribute('aria-pressed','false'); }
$('mapPlay').onclick=()=>{ if(ANIM) return pararAnim();
  $('mapPlay').textContent='Parar'; $('mapPlay').setAttribute('aria-pressed','true');
  const passo=()=>{ const i = mstate.mes===''? 0 : (+mstate.mes+1) % MES_VALS.length; mstate.mes=String(i); render(); };
  passo(); ANIM=setInterval(passo, 1600); };
$('cmpN').onchange=e=>{ mstate.n=+e.target.value; render(); };
let at; $('author').oninput=e=>{ clearTimeout(at); at=setTimeout(()=>{ mstate.author=e.target.value.trim(); render(); },400); };
const nfmt1 = x => x.toLocaleString('pt-BR',{maximumFractionDigits:1, minimumFractionDigits:1});

// text helpers (SVG has no wrapping)
const _cv = document.createElement('canvas').getContext('2d');
function wrapText(text, size, maxW, weight){ _cv.font=`${weight||400} ${size}px ${FONT}`; const out=[]; let cur='';
  String(text).split(/\s+/).forEach(w=>{ const t=cur? cur+' '+w : w; if(_cv.measureText(t).width>maxW && cur){ out.push(cur); cur=w; } else cur=t; }); if(cur) out.push(cur); return out; }
function textBlock(g, x, y, text, size, maxW, o={}){ const lines=wrapText(text,size,maxW,o.weight); const lh=size*(o.lh||1.32);
  const t=g.append('text').attr('x',x).attr('y',y).attr('font-size',size).attr('font-family',FONT).attr('fill',o.fill||C.ink).attr('font-weight',o.weight||400);
  (o.max? lines.slice(0,o.max) : lines).forEach((l,i)=>t.append('tspan').attr('x',x).attr('dy', i? lh : 0).text(l));
  const n = o.max? Math.min(o.max, lines.length) : lines.length; return (n-1)*lh + size; }

function kmPerPx(proj, cx, cy){ const a=proj.invert([cx-50,cy]), b=proj.invert([cx+50,cy]); return d3.geoDistance(a,b)*6371.0088/100; }
function scaleBar(g, proj, cx, cy, x, y, maxPx, backing){
  const k=kmPerPx(proj,cx,cy), target=maxPx*k; let km=1; [1,2,5,10,20,25,50,100,200,250,500,1000].forEach(s=>{ if(s<=target) km=s; });
  const px=km/k, h=5;
  if(backing) g.append('rect').attr('x',x-8).attr('y',y-17).attr('width',px+44).attr('height',30).attr('fill','#ffffff').attr('fill-opacity',.88).attr('rx',2);
  [0,1,2,3].forEach(i=>g.append('rect').attr('x',x+i*px/4).attr('y',y).attr('width',px/4).attr('height',h).attr('fill', i%2? '#ffffff' : C.ink).attr('stroke',C.ink).attr('stroke-width',.7));
  [[0,'0'],[px/2,fmt(km/2)],[px,fmt(km)+' km']].forEach(([dx,l],i)=>g.append('text').attr('x',x+dx).attr('y',y-4).attr('font-size',9.5).attr('font-family',FONT).attr('fill',C.ink2).attr('text-anchor', i===2? 'start':'middle').attr('dx', i===2? -4 : 0).text(l));
  return px;
}
function northArrow(g, x, y, s){
  g.append('path').attr('d',`M${x},${y} L${x+s*.42},${y+s*1.25} L${x},${y+s*.95} Z`).attr('fill',C.ink);
  g.append('path').attr('d',`M${x},${y} L${x-s*.42},${y+s*1.25} L${x},${y+s*.95} Z`).attr('fill','#ffffff').attr('stroke',C.ink).attr('stroke-width',.8);
  g.append('text').attr('x',x).attr('y',y-3).attr('text-anchor','middle').attr('font-size',s*.62).attr('font-weight',700).attr('font-family',FONT).attr('fill',C.ink).text('N');
}
const degLat = v => `${Math.abs(v).toLocaleString('pt-BR')}° S`, degLon = v => `${Math.abs(v).toLocaleString('pt-BR')}° O`;
function graticuleLabels(g, proj, box, step, size){
  const [x0,y0,x1,y1]=box;
  for(let lon=-85; lon<=-40; lon+=step){ let prev=null; for(let lat=-70; lat<=-10; lat+=0.05){ const p=proj([lon,lat]); if(prev && (prev[1]-y1)*(p[1]-y1)<=0){ const t=(y1-prev[1])/(p[1]-prev[1]); const x=prev[0]+t*(p[0]-prev[0]);
        if(x>x0+8 && x<x1-8){ g.append('line').attr('x1',x).attr('x2',x).attr('y1',y1).attr('y2',y1+4).attr('stroke',C.ink).attr('stroke-width',.7);
          g.append('text').attr('x',x).attr('y',y1+14).attr('text-anchor','middle').attr('font-size',size).attr('font-family',FONT).attr('fill',C.ink2).text(degLon(lon)); } break; } prev=p; } }
  for(let lat=-60; lat<=-15; lat+=step){ let prev=null; for(let lon=-90; lon<=-35; lon+=0.05){ const p=proj([lon,lat]); if(prev && (prev[0]-x0)*(p[0]-x0)<=0){ const t=(x0-prev[0])/(p[0]-prev[0]); const y=prev[1]+t*(p[1]-prev[1]);
        if(y>y0+8 && y<y1-8){ g.append('line').attr('x1',x0-4).attr('x2',x0).attr('y1',y).attr('y2',y).attr('stroke',C.ink).attr('stroke-width',.7);
          g.append('text').attr('x',x0-6).attr('y',y+3.5).attr('text-anchor','end').attr('font-size',size).attr('font-family',FONT).attr('fill',C.ink2).text(degLat(lat)); } break; } prev=p; } }
}

// classes for rates (quantiles of non-zero values, pooled when several maps share one legend)
function classify(values){
  const vals = values.filter(v=>v>0).sort(d3.ascending);
  if(!vals.length) return { color:()=>C.zero, items:[[C.zero,'0 (sem registro)']] };
  const rnd = v => Math.round(v*10)/10;
  let th = [...new Set([.2,.4,.6,.8].map(q=>rnd(d3.quantileSorted(vals,q))))].filter(t=>t>0 && t<vals[vals.length-1]);
  const n = th.length+1, ramp = C.ramp.slice(5-n);
  const color = v => { if(!(v>0)) return C.zero; let k=0; while(k<th.length && v>th[k]) k++; return ramp[k]; };
  const lo = [vals[0], ...th.map(t=> t+0.1)], hi = [...th, vals[vals.length-1]];
  const items=[[C.zero,'0 (sem registro)']];
  ramp.forEach((c,k)=> items.push([c, lo[k]>=hi[k]? nfmt1(hi[k]) : `${nfmt1(lo[k])} a ${nfmt1(hi[k])}`]));
  return { color, items };
}

const UNIT_VID = { loc:'localidad', dept:'departamento', prov:'provincia' };
const rateIds = unit => (unit==='dept'? DEPTS.map(f=>f.properties.di) : PROVS_FC.map(f=>f.properties.pi)).filter(i=>i>=0);
const UNIT_XY = u => u==='loc'? LOC_XY : u==='dept'? DEPT_XY : PROV_XY;
function mapData(rows, unit, extra){
  const vid = UNIT_VID[unit], XY = UNIT_XY(unit);
  const cons = spatialCons(vid).concat(extra||[]);
  const c = keepPlaces(counts(rows, vid), vid, cons);
  const rate = i => { const P=popOf(unit,i); return P? (c.get(i)||0)/P*1e5 : 0; };
  const iv=VI[vid]; const mapped = rows.filter(r=>r.v[iv].some(i=>!!XY[i] && c.has(i))).length;
  const max = d3.max([...c].filter(([i])=>XY[i]), d=>d[1]) || 0;
  return { unit, vid, c, rate, N: rows.length, mapped, max, XY, spatial: cons.length>0 };
}

// base map: sea, graticule, neighbours, Argentina (+choropleth), boundaries, labels; then circles
function drawBase(g, proj, box, md, sh, o){
  const path = d3.geoPath(proj); const [x0,y0,x1,y1]=box;
  const cid = 'clip'+Math.random().toString(36).slice(2,8);
  g.append('clipPath').attr('id',cid).append('rect').attr('x',x0).attr('y',y0).attr('width',x1-x0).attr('height',y1-y0);
  const mc = g.append('g').attr('clip-path',`url(#${cid})`);
  mc.append('rect').attr('x',x0).attr('y',y0).attr('width',x1-x0).attr('height',y1-y0).attr('fill',C.sea);
  const m = mc.append('g').attr('class','zoomable');
  m.append('path').datum(d3.geoGraticule().step([o.gstep||5,o.gstep||5]).extent([[-100,-75],[-30,-5]])()).attr('d',path).attr('fill','none').attr('stroke',C.grat).attr('stroke-width',.5);
  m.append('g').selectAll('path').data(NEIGH).join('path').attr('d',path).attr('fill', d=>d.properties.name==='Argentina'? C.land : C.neigh).attr('stroke', d=>d.properties.name==='Argentina'? 'none' : C.neighLine).attr('stroke-width',.6);
  const tip=o.tip, sel=o.sel||new Set();
  const tipText = i => { const n=md.c.get(i)||0; const L=[`${fmt(n)} notícias · ${pct(n, md.N)} do recorte`]; const P=popOf(md.unit,i); if(P) L.push(`${nfmt1(md.rate(i))} notícias por 100 mil hab. (${fmt(P)} hab.)`);
    const chaveCtx = o.ctx && ((md.unit==='prov' && o.ctx.nivel==='prov')? PROV_VALS[i] : (md.unit==='dept' && o.ctx.nivel==='dep')? DI_ID[i] : null);
    if(o.dest && o.dest.idx && o.dest.idx.has(i)){ const d=o.dest.idx.get(i), f1=v=>v.toLocaleString('pt-BR',{maximumFractionDigits:1});
      L.push(d.t==='alto'? `▲ Destaque: ${f1(d.razao)} vezes o esperado pela população (esperado ≈ ${f1(d.E)})` : `▼ Destaque: bem abaixo do esperado pela população (esperado ≈ ${f1(d.E)})`); }
    if(chaveCtx!=null){ const v=ctxValor(o.ctx, chaveCtx); if(v!=null) L.push(`${o.ctx.titulo.replace(/, 20\d\d.*$/,'')}: ${o.ctxCls.fmt(v)} ${o.ctx.curto}`); } return L; };
  const ev = (s, nameOf, idxOf) => { if(!tip) return s; return s.attr('class','hit')
      .on('mousemove',(e,d)=>{ const i=idxOf(d); if(i<0) return tip.hide(); tip.show(e, nameOf(d), tipText(i)); })
      .on('mouseleave',()=>tip.hide()).on('click',(e,d)=>{ const i=idxOf(d); if(i>=0) o.onClick(md.vid, i); }); };
  const cdef = o.ctx, cpoly = cdef && ['prov','reg','dep'].includes(cdef.nivel), cdep = cpoly && cdef.nivel==='dep';
  const espec = !!o.esp;
  const deptFill = cdep || espec || (o.fill && md.unit==='dept');
  if(espec){ // bivariado ou LISA, por departamento
    const sE = m.append('g').selectAll('path').data(DEPTS).join('path').attr('d',path).attr('fill', f=>o.esp.cor(f)).attr('class','hit');
    if(tip) sE.on('mousemove',(e,f)=>tip.show(e, f.properties.n, o.esp.tip(f))).on('mouseleave',()=>tip.hide())
      .on('click',(e,f)=>{ if(f.properties.di>=0) o.onClick('departamento', f.properties.di); });
  } else if(cpoly){ // camada de contexto em coroplético (substitui o fundo neutro)
    const feats = cdep? DEPTS : cdef.nivel==='prov'? PROVS_FC : REGS_FC;
    const chaveF = f => cdep? f.id : cdef.nivel==='prov'? f.properties.p : f.properties.r;
    const nomeF = f => cdep? f.properties.n : chaveF(f);
    const sCtx = m.append('g').selectAll('path').data(feats).join('path').attr('d',path).attr('fill', f=>o.ctxCls.color(ctxValor(cdef, chaveF(f))));
    const casa = (md.unit==='prov' && cdef.nivel==='prov') || (md.unit==='dept' && cdep);
    if(tip && !casa) sCtx.on('mousemove',(e,f)=>{ const v=ctxValor(cdef, chaveF(f)); tip.show(e, nomeF(f), [v==null? 'sem dado' : `${o.ctxCls.fmt(v)} ${cdef.curto}`, cdef.titulo]); }).on('mouseleave',()=>tip.hide());
    if(casa) ev(sCtx, f=> cdep? f.properties.n : f.properties.p, f=> cdep? f.properties.di : f.properties.pi);
  } else if(o.fill){ // choropleth of rates (provinces or departments)
    const fe = md.unit==='dept'? DEPTS : PROVS_FC, ix = f => md.unit==='dept'? f.properties.di : f.properties.pi;
    ev(m.append('g').selectAll('path').data(fe).join('path').attr('d',path).attr('fill',f=> ix(f)>=0? sh.color(md.rate(ix(f))) : C.zero), f=> md.unit==='dept'? f.properties.n : f.properties.p, ix);
  } else {
    const land = m.append('g').selectAll('path').data(md.unit==='prov'? PROVS_FC : DEPTS).join('path').attr('d',path).attr('fill',C.land);
    if(md.unit!=='loc') ev(land, f=> md.unit==='prov'? f.properties.p : f.properties.n, f=> md.unit==='prov'? f.properties.pi : f.properties.di);
  }
  // boundary hierarchy: departments < provinces < regions
  if(!o.fill && !cpoly) m.append('path').datum(MESH.dept).attr('d',path).attr('fill','none').attr('stroke',C.dept).attr('stroke-width', o.small? .2 : .35);
  else if(deptFill) m.append('path').datum(MESH.dept).attr('d',path).attr('fill','none').attr('stroke','#ffffff').attr('stroke-opacity',.75).attr('stroke-width', o.small? .15 : .3);
  m.append('path').datum(MESH.prov).attr('d',path).attr('fill','none').attr('stroke',C.prov).attr('stroke-width', o.small? .55 : 1);
  m.append('path').datum(MESH.reg).attr('d',path).attr('fill','none').attr('stroke',C.reg).attr('stroke-width', o.small? 1.3 : 2.3).attr('stroke-linejoin','round');
  m.append('path').datum(MESH.out).attr('d',path).attr('fill','none').attr('stroke',C.reg).attr('stroke-width', o.small? .8 : 1.2);
  if(sel.size && md.vid!=='localidad'){
    const feats = md.vid==='provincia'? PROVS_FC.filter(f=>sel.has(f.properties.pi)) : DEPTS.filter(f=>sel.has(f.properties.di));
    m.append('g').selectAll('path').data(feats).join('path').attr('d',path).attr('fill','none').attr('stroke',C.sel).attr('stroke-width',2.2).attr('pointer-events','none');
  }
  // place labels
  (o.labels||[]).forEach(([t,lon,lat,opt])=>{ const p=proj([lon,lat]); if(!p || p[0]<x0+20 || p[0]>x1-20 || p[1]<y0+12 || p[1]>y1-8) return;
    const tx=m.append('text').attr('x',p[0]).attr('y',p[1]).attr('text-anchor','middle').attr('font-size',(opt&&opt.size)||10).attr('font-family',FONT).attr('fill',C.label).attr('letter-spacing',(opt&&opt.ls)||1.2).attr('font-style',(opt&&opt.italic)?'italic':'normal');
    if(opt&&opt.rot) tx.attr('transform',`rotate(${opt.rot} ${p[0]} ${p[1]})`);
    String(t).split('\n').forEach((l,i)=>tx.append('tspan').attr('x',p[0]).attr('dy', i? '1.2em' : 0).text(l)); });
  if(cdef && cdef.nivel==='pop'){ // população absoluta: círculos vazados
    const pts = PROVS_FC.filter(f=>f.properties.pi>=0 && POP[f.properties.pi]).map(f=>({p:f.properties.p, n:POP[f.properties.pi], xy:proj(PROV_XY[f.properties.pi])})).sort((a,b)=>b.n-a.n);
    const sp = m.append('g').selectAll('circle').data(pts).join('circle').attr('cx',d=>d.xy[0]).attr('cy',d=>d.xy[1]).attr('r',d=>o.popR(d.n))
      .attr('fill','none').attr('stroke','#5e4c33').attr('stroke-width', o.small? .7 : 1.1).attr('stroke-dasharray','3 2');
    if(tip) sp.on('mousemove',(e,d)=>tip.show(e, d.p, [`${fmt(d.n)} habitantes (Censo 2022)`])).on('mouseleave',()=>tip.hide());
  }
  if(cdef && cdef.nivel==='popDep'){ // população absoluta por departamento: círculos vazados
    const pts = DEPTS.map(f=>({n:(IND_DEP[f.id]||{}).pop, nm:f.properties.n, xy:proj(f.properties.c)})).filter(d=>d.n && d.xy && d.xy[0]>x0-30 && d.xy[0]<x1+30 && d.xy[1]>y0-30 && d.xy[1]<y1+30).sort((a,b)=>b.n-a.n);
    const sp = m.append('g').selectAll('circle').data(pts).join('circle').attr('cx',d=>d.xy[0]).attr('cy',d=>d.xy[1]).attr('r',d=>o.popDR(d.n))
      .attr('fill','#957d58').attr('fill-opacity',.08).attr('stroke','#5e4c33').attr('stroke-width', o.small? .5 : .8);
    if(tip) sp.on('mousemove',(e,d)=>tip.show(e, d.nm, [`${fmt(d.n)} habitantes (Censo 2022)`])).on('mouseleave',()=>tip.hide());
  }
  if(o.dest && o.dest.feats.length){ // contornos dos destaques
    const gd=m.append('g').attr('pointer-events','none');
    gd.selectAll('path').data(o.dest.feats).join('path').attr('d',d=>path(d.f)).attr('fill','none').attr('stroke',d=>d.t==='alto'? COR_ALTO : COR_BAIXO).attr('stroke-width',o.small? 1.4 : 2.4).attr('stroke-linejoin','round');
  }
  if(o.circles){
    const pts=[]; md.c.forEach((n,i)=>{ if(md.XY[i]){ const xy=proj(md.XY[i]); if(xy && xy[0]>x0-40 && xy[0]<x1+40 && xy[1]>y0-40 && xy[1]<y1+40) pts.push({i,n,xy}); } });
    pts.sort((a,b)=>b.n-a.n);
    ev(m.append('g').selectAll('circle').data(pts).join('circle').attr('cx',d=>d.xy[0]).attr('cy',d=>d.xy[1]).attr('r',d=>Math.max(o.small?1.6:2.2, sh.r(d.n)))
      .attr('fill',C.sol).attr('fill-opacity', o.fill? .72 : .85).attr('stroke', d=> sel.has(d.i)? C.sel : C.solDark).attr('stroke-width', d=> sel.has(d.i)? 2.2 : (o.small? .6 : .8)),
      d=> (md.unit==='loc'? LOC_VALS : md.unit==='dept'? DEPT_VALS : PROV_VALS)[d.i], d=>d.i);
  }
  if(cdef && cdef.nivel==='agl'){ // aglomerados urbanos da EPH: quadrados coloridos pelo indicador
    const s = o.small? 7 : 11;
    const ag = CTX.aglomerados.map(a=>({...a, xy:proj([a.lon,a.lat])})).filter(a=>a.xy);
    const sq = m.append('g').selectAll('rect').data(ag).join('rect').attr('x',d=>d.xy[0]-s/2).attr('y',d=>d.xy[1]-s/2).attr('width',s).attr('height',s)
      .attr('fill',d=>o.ctxCls.color(d[cdef.campo])).attr('stroke','#2b2216').attr('stroke-width', o.small? .6 : .9);
    if(tip) sq.on('mousemove',(e,d)=>tip.show(e, d.aglomerado, [`${o.ctxCls.fmt(d[cdef.campo])} ${cdef.curto}`, cdef.titulo])).on('mouseleave',()=>tip.hide());
  }
  if(o.topo) topoLayer(m, proj, box, o.topoK||1, o.topoModo||'pais');
  g.append('rect').attr('x',x0).attr('y',y0).attr('width',x1-x0).attr('height',y1-y0).attr('fill','none').attr('stroke',C.ink).attr('stroke-width',o.small? .7 : 1);
  return m;
}
const LABELS = [
  ['CHILE',-74.7,-44.0,{rot:-90,size:10.5,ls:3}], ['BOLÍVIA',-64.2,-21.2,{size:10.5,ls:2}], ['PARAGUAI',-58.6,-23.4,{size:10.5,ls:2}],
  ['BRASIL',-52.5,-26.8,{size:10.5,ls:2}], ['URUGUAI',-55.9,-32.7,{size:10,ls:2}],
  ['OCEANO\nATLÂNTICO',-55.2,-41.2,{italic:true,size:12,ls:2}], ['OCEANO\nPACÍFICO',-78.2,-47.5,{italic:true,size:12,ls:2}] ];
const LABELS_AMBA = [['URUGUAI',-57.98,-34.33,{size:10,ls:2}], ['Rio da Prata',-58.0,-34.62,{italic:true,size:11,ls:1}]];

function legendBlock(g, x, y, w, md, sh, o){
  let yy = y;
  const head = t => { g.append('text').attr('x',x).attr('y',yy).attr('font-size',12).attr('font-weight',700).attr('font-family',FONT).attr('fill',C.ink).text(t); yy += 12; };
  if(o.circles){
    head(md.unit==='loc'? 'Notícias por localidade (absoluto)' : md.unit==='dept'? 'Notícias por departamento (absoluto)' : 'Notícias por província (absoluto)');
    const max = sh.max||1; const nice = v => v>=20? Math.round(v/10)*10 : Math.max(1, Math.round(v));
    const ref = [...new Set([max, nice(max/4), nice(max/16)])].filter(v=>v>0 && v<=max);
    const R = sh.r(max), cx = x+R+2, base = yy+2*R+4;
    ref.forEach(v=>{ const r=sh.r(v); g.append('circle').attr('cx',cx).attr('cy',base-r).attr('r',r).attr('fill',C.sol).attr('fill-opacity',.25).attr('stroke',C.solDark).attr('stroke-width',.8);
      g.append('line').attr('x1',cx).attr('x2',cx+R+10).attr('y1',base-2*r).attr('y2',base-2*r).attr('stroke',C.ink3).attr('stroke-width',.6);
      g.append('text').attr('x',cx+R+14).attr('y',base-2*r+3.5).attr('font-size',10.5).attr('font-family',FONT).attr('fill',C.ink2).text(fmt(v)); });
    yy = base + 18;
  }
  if(o.fill){
    head('Notícias por 100 mil habitantes (taxa)');
    sh.items.forEach(([col,lab])=>{ g.append('rect').attr('x',x).attr('y',yy).attr('width',18).attr('height',11).attr('fill',col).attr('stroke','#9aa6b2').attr('stroke-width',.5);
      g.append('text').attr('x',x+26).attr('y',yy+9.5).attr('font-size',10.5).attr('font-family',FONT).attr('fill',C.ink2).text(lab); yy += 16; });
    yy += 8;
  }
  if(o.ctx){
    const d=o.ctx;
    yy += textBlock(g, x, yy, `Contexto: ${d.titulo}`, 12, w, {weight:700}) + 6;
    if(d.nivel==='biv' && o.esp){
      const B=o.esp.b, cs=Math.min(54, (w-110)/3), gx=x+70, gy=yy+4, f=v=>v.toLocaleString('pt-BR',{maximumFractionDigits:d.dec});
      const ind=d.indTitulo.charAt(0).toLowerCase()+d.indTitulo.slice(1);
      const txt=(tx,ty,t,o2={})=>g.append('text').attr('x',tx).attr('y',ty).attr('font-size',o2.size||10.5).attr('font-family',FONT).attr('fill',o2.fill||C.ink2).attr('font-weight',o2.w||400).attr('text-anchor',o2.a||'start').text(t);
      for(let yi=0; yi<3; yi++) for(let xi=0; xi<3; xi++){ g.append('rect').attr('x',gx+xi*cs).attr('y',gy+(2-yi)*cs).attr('width',cs).attr('height',cs).attr('fill',BIV[yi][xi]).attr('stroke','#9aa6b2').attr('stroke-width',.5);
        g.append('text').attr('x',gx+xi*cs+cs/2).attr('y',gy+(2-yi)*cs+cs/2+3.5).attr('text-anchor','middle').attr('font-size',10).attr('font-family',FONT).attr('fill', d3.hsl(BIV[yi][xi]).l<0.5? '#ffffff' : C.ink2).text(B.cel[yi][xi]); }
      // rótulos das linhas (indicador) e das colunas (notícias)
      [['alto',2,`> ${f(B.t2)}`],['médio',1,`${f(B.t1)}–${f(B.t2)}`],['baixo',0,`< ${f(B.t1)}`]].forEach(([l,yi,vv])=>{ txt(gx-6, gy+(2-yi)*cs+cs/2-1, l, {a:'end', fill:C.ink, w:700}); txt(gx-6, gy+(2-yi)*cs+cs/2+10, vv, {a:'end', size:9}); });
      [['nenhuma',0],['poucas',1],['muitas',2]].forEach(([l,xi])=>txt(gx+xi*cs+cs/2, gy+3*cs+13, l, {a:'middle', fill:C.ink, w:700}));
      txt(gx+1.5*cs, gy+3*cs+27, `Notícias por 100 mil hab. (poucas: até ${nfmt1(B.med)}; muitas: acima)`, {a:'middle', size:9.5});
      g.append('text').attr('transform',`translate(${x+8},${gy+1.5*cs}) rotate(-90)`).attr('text-anchor','middle').attr('font-size',9.5).attr('font-family',FONT).attr('fill',C.ink2).text(d.curto);
      yy = gy+3*cs+50;
      yy += textBlock(g, x, yy, 'Como ler: cada cor junta duas informações do departamento.', 11, w, {weight:700}) + 6;
      [[BIV[2][0], `Azul: ${ind} alto e nenhuma notícia de ação coletiva.`],
       [BIV[2][2], `Verde-escuro: ${ind} alto e muitas notícias.`],
       [BIV[0][2], `Amarelo: ${ind} baixo e muitas notícias.`],
       [BIV[0][0], `Branco: ${ind} baixo e nenhuma notícia.`]].forEach(([cor,t])=>{
        g.append('rect').attr('x',x).attr('y',yy-1).attr('width',16).attr('height',12).attr('fill',cor).attr('stroke','#9aa6b2').attr('stroke-width',.5);
        yy += textBlock(g, x+24, yy+9, t, 10.5, w-24, {fill:C.ink2}) + 6; });
      yy += textBlock(g, x, yy+4, 'Os números dentro dos quadrados são quantos departamentos há em cada combinação.', 10, w, {fill:C.ink3}) + 8;
    } else if(d.nivel==='lisa' && o.esp){
      ['HH','LL','HL','LH','ns'].forEach(c=>{ g.append('rect').attr('x',x).attr('y',yy).attr('width',18).attr('height',11).attr('fill',LISA_COR[c]).attr('stroke','#9aa6b2').attr('stroke-width',.5);
        g.append('text').attr('x',x+26).attr('y',yy+9.5).attr('font-size',10.5).attr('font-family',FONT).attr('fill',C.ink2).text(`${LISA_ROT[c]}: ${o.esp.L.n[c]}`); yy += 16; });
      yy += 6 + textBlock(g, x, yy+10, `I de Moran global = ${o.esp.L.I.toLocaleString('pt-BR',{maximumFractionDigits:3})} (p = ${o.esp.L.pI.toLocaleString('pt-BR',{maximumFractionDigits:3})}, 199 permutações).`, 10.5, w, {fill:C.ink, weight:700}) + 10;
    } else if(d.nivel==='popDep'){
      const ref=[1.5e6, 3e5, 5e4], R=o.popDR(ref[0]), cx=x+R+2, base=yy+2*R+4;
      ref.forEach(v=>{ const r=o.popDR(v); g.append('circle').attr('cx',cx).attr('cy',base-r).attr('r',r).attr('fill','#957d58').attr('fill-opacity',.08).attr('stroke','#5e4c33');
        g.append('text').attr('x',cx+R+14).attr('y',base-2*r+3.5).attr('font-size',10.5).attr('font-family',FONT).attr('fill',C.ink2).text(fmt(v)+' hab.'); });
      yy = base + 14;
    } else if(d.nivel==='pop'){
      const ref=[20e6, 5e6, 1e6], R=o.popR(ref[0]), cx=x+R+2, base=yy+2*R+4;
      ref.forEach(v=>{ const r=o.popR(v); g.append('circle').attr('cx',cx).attr('cy',base-r).attr('r',r).attr('fill','none').attr('stroke','#5e4c33').attr('stroke-dasharray','3 2');
        g.append('text').attr('x',cx+R+14).attr('y',base-2*r+3.5).attr('font-size',10.5).attr('font-family',FONT).attr('fill',C.ink2).text(fmt(v)+' hab.'); });
      yy = base + 14;
    } else {
      o.ctxCls.items.forEach(([col,lab])=>{ if(d.nivel==='agl') g.append('rect').attr('x',x+4).attr('y',yy+1).attr('width',10).attr('height',10).attr('fill',col).attr('stroke','#2b2216').attr('stroke-width',.8);
        else g.append('rect').attr('x',x).attr('y',yy).attr('width',18).attr('height',11).attr('fill',col).attr('stroke','#9aa6b2').attr('stroke-width',.5);
        g.append('text').attr('x',x+26).attr('y',yy+9.5).attr('font-size',10.5).attr('font-family',FONT).attr('fill',C.ink2).text(`${lab} ${d.curto}`); yy += 16; });
    }
    yy += textBlock(g, x, yy+8, `Fonte: ${d.fonte}.`, 9.5, w, {fill:C.ink3}) + 18;
  }
  if(o.dest && o.dest.feats.length){
    yy += textBlock(g, x, yy, 'Destaques (contorno)', 12, w, {weight:700}) + 6;
    [[COR_ALTO,'Muito acima do esperado pela população'],[COR_BAIXO,'Muito abaixo do esperado pela população']].forEach(([c,l])=>{ const n=o.dest.feats.filter(d=>(d.t==='alto')===(c===COR_ALTO)).length;
      g.append('rect').attr('x',x+1).attr('y',yy).attr('width',16).attr('height',11).attr('fill','none').attr('stroke',c).attr('stroke-width',2.2);
      g.append('text').attr('x',x+26).attr('y',yy+9.5).attr('font-size',10.5).attr('font-family',FONT).attr('fill',C.ink2).text(`${l}: ${n}`); yy+=16; });
    yy += textBlock(g, x, yy+4, 'Esperado = notícias do recorte repartidas conforme a população. Contorno só quando a diferença é grande demais para ser acaso (teste de Poisson, p < 0,01).', 9.5, w, {fill:C.ink3}) + 12;
  }
  [['Limite internacional',C.neighLine,.9],['Limite regional (INDEC)',C.reg,2.3],['Limite provincial',C.prov,1],['Limite de departamento / partido',C.dept,.6]].forEach(([l,c,wd])=>{
    if(((o.fill && md.unit!=='dept') || (o.ctx && (o.ctx.nivel==='prov'||o.ctx.nivel==='reg'))) && wd===.6) return;
    g.append('line').attr('x1',x).attr('x2',x+18).attr('y1',yy+5).attr('y2',yy+5).attr('stroke',c).attr('stroke-width',wd);
    g.append('text').attr('x',x+26).attr('y',yy+9).attr('font-size',10.5).attr('font-family',FONT).attr('fill',C.ink2).text(l); yy += 15; });
  g.append('rect').attr('x',x).attr('y',yy+1).attr('width',18).attr('height',10).attr('fill',C.sea).attr('stroke','#9aa6b2').attr('stroke-width',.4);
  g.append('text').attr('x',x+26).attr('y',yy+9.5).attr('font-size',10.5).attr('font-family',FONT).attr('fill',C.ink2).text('Oceano e rios'); yy += 15;
  return yy - y;
}

function filtersText(except){
  const ex = [].concat(except||[]);
  const parts = Object.keys(st.f).filter(v=>!ex.includes(v)).map(vid=>{ const v=VARS[VI[vid]]; return `${v.label}: ${[...st.f[vid]].map(x=>v.values[x]).join(' ou ')}`; });
  return parts.join('; ');
}
function techNote(md, sh, o, multi){
  const today = new Date().toLocaleDateString('pt-BR');
  const unitTxt = md.unit==='loc'? 'localidade' : md.unit==='dept'? 'departamento/partido' : 'província';
  const art = md.unit==='dept'? 'o' : 'a', de = md.unit==='dept'? 'do' : 'da';
  const s = ['NOTA TÉCNICA.'];
  if(o.circles) s.push(`Valores absolutos em círculos proporcionais: a área de cada círculo é proporcional ao número de notícias que citam ${art} ${unitTxt} (raio ∝ √n; maior círculo = ${fmt(sh.max||0)} notícias${multi?', mesma escala em todos os mapas':''}). ${md.unit==='loc'? 'Localidades posicionadas pelo GeoNames; na falta, no centro do departamento.' : `Círculos no centróide ${de} ${unitTxt} (da maior porção de terra, quando há ilhas).`} Notícias que citam vários lugares contam em cada um.`);
  if(o.fill) s.push(`Valores relativos em coroplético: taxa = notícias ÷ população residente ${md.unit==='dept'? 'do departamento/partido' : 'da província'} × 100.000. População: INDEC, Censo Nacional de Población, Hogares y Viviendas 2022, resultados definitivos${md.unit==='dept'? ' (Geoportal estadístico)' : ''}. Classes por quantis (até 5 classes) dos valores não nulos${multi?', comuns a todos os mapas':''}.${md.unit==='dept'? ' Em departamentos pouco populosos, uma única notícia gera taxas altas: leia junto com os valores absolutos.' : ''}`);
  if(o.ctx){ const d=o.ctx; s.push(d.nivel==='pop'? `Camada de contexto: população residente em 2022 em círculos vazados proporcionais (área ∝ habitantes), no centróide de cada província; fonte: ${d.fonte}.`
    : d.nivel==='biv'? `Mapa bivariado por departamento/partido: a cor combina as notícias por 100 mil habitantes (colunas: sem notícias, até a mediana e acima da mediana dos departamentos com notícias) com os tercis do indicador “${d.indTitulo}” entre os 511 departamentos (linhas); classes 3 × 3 por mistura multiplicativa de amarelo e azul. Fonte: ${d.fonte}.`
    : d.nivel==='lisa'? `Pontos quentes e frios por departamento/partido: indicador local de associação espacial (LISA, I de Moran local) sobre a taxa bayesiana empírica de notícias por 100 mil habitantes (estimador global de Marshall, que estabiliza departamentos pouco populosos); vizinhança por contiguidade de rainha com pesos padronizados por linha; significância por 499 permutações condicionais (p < 0,05, sem correção para comparações múltiplas). Fonte: ${d.fonte}.`
    : d.nivel==='popDep'? `Camada de contexto: população residente em 2022 em círculos vazados proporcionais (área ∝ habitantes), no centróide de cada departamento/partido; fonte: ${d.fonte}.`
    : `Camada de contexto: ${d.titulo}, ${d.nivel==='agl'? 'em símbolos de cor nos 31 aglomerados urbanos da EPH (valores urbanos, não provinciais)' : d.nivel==='reg'? 'em coroplético por região estatística (valores dos aglomerados urbanos de cada região)' : d.nivel==='dep'? 'em coroplético por departamento/partido (CABA como um todo; sem dado para as Ilhas Malvinas)' : 'em coroplético por província'}; classes por quantis${d.nivel==='dep'? ' dos 511 departamentos' : ''}; fonte: ${d.fonte}.${d.definicao? ' Definição do INDEC: '+d.definicao.split(/\n/)[0] : ''}`); }
  if(o.dest && o.dest.feats.length) s.push(`Destaques: contorno laranja nos lugares com mais notícias do que o esperado pela sua população e azul nos que têm menos (esperado = ${fmt(o.dest.tot)} notícias do recorte repartidas proporcionalmente à população; teste exato de Poisson unicaudal, p < 0,01; para “acima”, mínimo de 3 notícias).`);
  if(md.spatial) s.push('Filtros espaciais aplicados ao lugar: só são representados os lugares dentro das unidades selecionadas, mesmo quando a notícia também cita outros lugares.');
  s.push('Limites: departamentos/partidos (linha fina), províncias (média) e regiões estatísticas do INDEC (grossa): Gran Buenos Aires (CABA e 24 partidos), Pampeana, Noroeste, Noreste, Cuyo e Patagonia.');
  const zk = (multi? ZOOM.multi : ZOOM.one).k; if(zk>1) s.push(`Vista ampliada (×${zk.toLocaleString('pt-BR',{maximumFractionDigits:1})}) em relação ao país inteiro.`);
  if(mstate.topo!==false) s.push(`Topônimos: GeoNames (CC BY 4.0); capitais sempre visíveis, demais cidades conforme a população e o nível de aproximação.`);
  s.push(`Sistema de coordenadas geográficas, datum WGS 84; projeção cônica conforme de Lambert (paralelos-padrão 28° S e 46° S; meridiano central 64° O); grade de ${gridStep(zk).toLocaleString('pt-BR')}°; escala gráfica válida para o centro do mapa.`);
  const ft = filtersText(multi? [md.vid, mstate.cmp] : md.vid);
  if(mstate.mes!=='' && mstate.mes!=null) s.push(`Período: notícias de ${MES_VALS[+mstate.mes].replace(/^\d\d · /,'').toLowerCase()} de 2024 (mês da notícia).`);
  s.push(`Fonte dos dados: Base de notícias de ações coletivas 2024 (${fmt(md.N)} notícias${st.rep?', incluindo repetidas':', sem repetidas'}${ft? '; recorte: '+ft : ''}; ${fmt(md.N-md.mapped)} sem localização mapeável nesta escala). Base cartográfica: departamentos (mgaitan/departamentos_argentina), simplificada; países limítrofes: Natural Earth 1:50 milhões.`);
  s.push(`Elaboração: ${mstate.author || 'não informada'}, ${today}.`);
  return s.join(' ');
}
function mapTitle(md, o){
  const u = md.unit==='loc'? 'localidade' : md.unit==='dept'? 'departamento / partido' : 'província';
  const t = o.esp? o.ctx.titulo.replace(/, por departamento$/,'') + ', por departamento / partido' : o.fill && o.circles? `Notícias de ações coletivas por ${u}: taxa por 100 mil habitantes e valores absolutos` : o.fill? `Notícias de ações coletivas por 100 mil habitantes, por ${u}` : `Notícias de ações coletivas por ${u}`;
  return t + (mstate.mes!=='' && mstate.mes!=null? ` · Argentina, ${MES_VALS[+mstate.mes].replace(/^\d\d · /,'').toLowerCase()} de 2024` : ' · Argentina, 2024');
}


/* ---------- zoom & pan (Google-Maps-like) ----------
   The zoom is baked into the projection on every redraw, so the scale bar, grid labels and symbol sizes stay
   correct and the exported sheet shows the zoomed view. During a gesture the drawn group is only transformed. */
const ZOOM = { one:{k:1,x:0,y:0}, multi:{k:1,x:0,y:0} };
let ZINIT = false, ZCTL = null, zTimer = null;
const toGlobal = (z,O) => d3.zoomIdentity.translate(z.x + (1-z.k)*O[0], z.y + (1-z.k)*O[1]).scale(z.k);
const toLocal = (t,O) => ({k:t.k, x:t.x + (t.k-1)*O[0], y:t.y + (t.k-1)*O[1]});
function zoomProj(proj, z, O){ const k=z.k; const [tx,ty]=proj.translate(); return proj.scale(proj.scale()*k).translate([O[0]+k*(tx-O[0])+z.x, O[1]+k*(ty-O[1])+z.y]); }
const gridStep = k => k>=20? 0.5 : k>=8? 1 : k>=3? 2 : 5;
function attachZoom(sel, key, O, frame, content){
  const [x0,y0,x1,y1]=frame; const t0=toGlobal(ZOOM[key],O);
  const zb = d3.zoom().scaleExtent([1,40]).wheelDelta(ev => -ev.deltaY * (ev.deltaMode===1? 0.05 : ev.deltaMode? 1 : 0.003)).extent([[x0,y0],[x1,y1]]).translateExtent([[x0,y0],[x1,y1]])
    .filter(ev => ev.type==='wheel'? (ev.ctrlKey||ev.metaKey) : ev.type.startsWith('touch')? (ev.touches? ev.touches.length>1 : false) : (!ev.button && ev.type!=='dblclick'))
    .on('zoom', ev=>{ if(ZINIT) return; const t=ev.transform, k=t.k/t0.k; content.attr('transform',`translate(${t.x-k*t0.x},${t.y-k*t0.y}) scale(${k})`); })
    .on('end', ev=>{ if(ZINIT) return; const z=toLocal(ev.transform,O); const p=ZOOM[key]; if(Math.abs(z.k-p.k)<1e-6 && Math.abs(z.x-p.x)<.5 && Math.abs(z.y-p.y)<.5) return; ZOOM[key]=z; clearTimeout(zTimer); zTimer=setTimeout(()=>renderMap(base()), 30); });
  sel.call(zb).on('dblclick.zoom', null);
  ZINIT=true; sel.call(zb.transform, t0); ZINIT=false;
  sel.style('touch-action','pan-x pan-y').style('cursor', ZOOM[key].k>1? 'grab' : null);
  return zb;
}
function zoomControls(box, frame, key){
  box.querySelectorAll('.zoomctl,.zoomhint').forEach(e=>e.remove());
  const svg=box.querySelector('svg'); const vbW=svg.viewBox.baseVal.width||1; const s=box.clientWidth/vbW;
  const c=el('div','zoomctl'); c.style.left=((frame[2]-8)*s - 34)+'px'; c.style.top=((frame[1]+8)*s)+'px';
  const mk=(txt,label,fn)=>{ const b=el('button',null,txt); b.type='button'; b.title=label; b.setAttribute('aria-label',label); b.onclick=fn; c.append(b); };
  const run = f => { if(!ZCTL) return; f(ZCTL.sel.transition().duration(220), ZCTL.zb); };
  mk('+','Aproximar',()=>run((s,z)=>s.call(z.scaleBy,1.7)));
  mk('−','Afastar',()=>run((s,z)=>s.call(z.scaleBy,1/1.7)));
  mk('⤢','Ver o país inteiro',()=>run((s,z)=>s.call(z.transform,d3.zoomIdentity)));
  box.append(c);
  const h=el('div','zoomhint','Use Ctrl + rolagem (⌘ no Mac) ou pinça para aproximar; arraste para mover'); h.hidden=true; box.append(h);
  if(!box._wheelHint){ box._wheelHint=true; let ht; box.addEventListener('wheel',e=>{ if(e.ctrlKey||e.metaKey) return; const hh=box.querySelector('.zoomhint'); if(!hh) return; hh.hidden=false; clearTimeout(ht); ht=setTimeout(()=>{ hh.hidden=true; },1400); },{passive:true}); }
}

let SHEET_SVG = null;
function renderMap(b){
  const b0=b, comMes = mstate.mes!=='' && mstate.mes!=null;
  if(comMes){ const im=+mstate.mes; b=b.filter(r=>r.v[VI.mes].includes(im)); }
  const nomeMes = comMes? MES_VALS[+mstate.mes].replace(/^\d\d · /,'').toLowerCase() : '';
  $('mapMes').value = mstate.mes||''; $('mapTopo').checked = mstate.topo!==false; $('mapDest').checked = mstate.dest!==false;
  if(!RATE_OK(mstate.unit)) mstate.measure='abs';
  const cdef = ctxEscolha(mstate.ctx), cpoly = !!cdef && ['prov','reg','dep','biv','lisa'].includes(cdef.nivel);
  if(cpoly) mstate.measure='abs';
  $('ctxLayer').value = mstate.ctx || '';
  document.querySelectorAll('#mapUnit button').forEach(x=>x.setAttribute('aria-pressed', String(x.dataset.v===mstate.unit)));
  document.querySelectorAll('#mapMeasure button').forEach(x=>{ x.setAttribute('aria-pressed', String(x.dataset.v===mstate.measure)); x.disabled = x.dataset.v!=='abs' && (!RATE_OK(mstate.unit) || cpoly); x.title = !x.disabled? '' : cpoly? 'Com uma camada de contexto em coroplético, as notícias aparecem em círculos' : 'Taxa disponível para províncias e departamentos (sem população por localidade)'; });
  document.querySelectorAll('#mapMode button').forEach(x=>x.setAttribute('aria-pressed', String(x.dataset.v===mstate.mode)));
  $('cmpWrap').hidden = $('cmpNWrap').hidden = mstate.mode!=='multi';
  $('cmpVar').value = mstate.cmp; $('cmpN').value = String(mstate.n);
  if(document.activeElement!==$('author')) $('author').value = mstate.author;
  msave();
  const ehWeb = mstate.vis==='web';
  document.querySelectorAll('#mapVis button').forEach(x=>x.setAttribute('aria-pressed', String(x.dataset.v===(ehWeb? 'web' : 'prancha'))));
  $('sheet').hidden=ehWeb; $('wmap').hidden=!ehWeb; const sb=document.querySelector('#mapSec .sheetbar'); if(sb) sb.hidden=ehWeb; $('mapMode').closest('label').hidden=ehWeb;
  if(ehWeb){ $('mapCalcCorpo').textContent='No mapa navegável valem os mesmos cálculos da prancha: círculos com área proporcional às notícias que citam cada lugar; cores com notícias por 100 mil habitantes (Censo 2022) em quintis; contornos laranja e azul para lugares com muito mais ou muito menos notícias do que a população faria esperar (teste exato de Poisson, p < 0,01). Volte à prancha cartográfica para ver o cálculo detalhado, com exemplos.'; $('mapRank').textContent=''; $('cmpWrap').hidden=$('cmpNWrap').hidden=true; if(typeof renderWeb==='function') renderWeb(b, cdef); return; }
  const box=$('sheet'); box.querySelectorAll('svg').forEach(s=>s.remove()); $('mapRank').textContent='';
  if(!HAS_D3){ $('mapNote').textContent='Não foi possível carregar a biblioteca de mapas nesta visualização.'; return; }
  const unit = mstate.unit, vid = UNIT_VID[unit];
  const o = { circles: mstate.measure!=='rate', fill: mstate.measure!=='abs', ctx: cdef, ctxCls: cdef && !['pop','popDep','biv','lisa'].includes(cdef.nivel)? ctxClasses(cdef) : null };
  if(cdef && (cdef.nivel==='biv' || cdef.nivel==='lisa') && HAS_D3){
    const T=taxasDept(b), fN=v=>v.toLocaleString('pt-BR',{maximumFractionDigits:1});
    if(cdef.nivel==='biv'){ const B=bivCalc(cdef, T);
      o.esp={ b:B, cor:f=>{ const c=B.cls(f); return c? BIV[c[1]][c[0]] : '#f1f1ef'; },
        tip:f=>{ const t=T.get(f.id), v=(IND_DEP[f.id]||{})[cdef.campo]; return t? [`${fmt(t.n)} notícias · ${fN(t.rate)} por 100 mil hab.`, `${cdef.indTitulo}: ${v==null? 'sem dado' : v.toLocaleString('pt-BR',{maximumFractionDigits:cdef.dec})} ${cdef.curto}`] : ['sem dado']; } };
    } else {
      const chave=JSON.stringify([b.length, b.length? b[0].k:0, b.length? b[b.length-1].k:0, Object.keys(st.f).map(k=>[k,[...st.f[k]]]), mstate.mes]);
      const L = ESP_CACHE.k===chave? ESP_CACHE.v : (ESP_CACHE={k:chave, v:lisaCalc(T)}).v;
      o.esp={ L, cor:f=>LISA_COR[L.cls.get(f.id)] || '#f1f1ef',
        tip:f=>{ const t=T.get(f.id), c=L.cls.get(f.id); return t? [`${fmt(t.n)} notícias · ${fN(t.rate)} por 100 mil hab.`, `Taxa suavizada (bayesiana empírica): ${fN(L.eb.get(f.id)||0)}`, ...(()=>{ const d=L.det.get(f.id); if(!d || d.z==null || d.lag==null) return []; const g=v=>(v<0? '−' : '')+Math.abs(v).toLocaleString('pt-BR',{maximumFractionDigits:2, minimumFractionDigits:2}); return [`z = ${g(d.z)} · média dos ${d.k} vizinhos = ${g(d.lag)} · I local = ${g(d.Ii)}`]; })(), c? `${LISA_ROT[c]}${L.pv.get(f.id)!=null? ` (p = ${L.pv.get(f.id).toLocaleString('pt-BR',{maximumFractionDigits:3})})` : ''}` : 'sem vizinhos'] : ['sem dado']; } };
    }
    o.circles=false; o.fill=false;
  }
  const W = Math.max(320, box.clientWidth);
  const svg = d3.select(box).append('svg').attr('font-family',FONT).attr('width','100%');
  svg.append('rect').attr('class','bgpaper').attr('x',0).attr('y',0).attr('fill',C.paper);
  const tip = tipFor(box);
  const onClick = (v,i)=>toggleFilter(v,i);
  const M = 22;
  let H; var ctlFrame = null;
  if(mstate.mode==='one'){
    const rows = b.filter(r=>match(r, vid));
    const md = mapData(rows, unit);
    o.dest = (unit!=='loc' && mstate.dest!==false && !o.esp)? destaques(md) : null;
    if(o.dest) o.dest.idx = new Map(o.dest.feats.map(d=>[unit==='dept'? d.f.properties.di : d.f.properties.pi, d]).filter(([i])=>i>=0));
    // no modo mensal, a escala dos círculos é a do mês com mais notícias, para que os meses sejam comparáveis
    const sh = { max: comMes? (d3.max(MES_VALS, (_,m)=>mapData(b0.filter(r=>r.v[VI.mes].includes(m) && match(r, vid)), unit).max)||1) : (md.max||1) };
    if(o.fill) Object.assign(sh, classify(rateIds(unit).map(md.rate)));
    const wide = W>=780;
    let y = M+14;
    y += textBlock(svg, M, y+4, mapTitle(md, o), 19, W-2*M, {weight:700}) + 10;
    const ft = filtersText(vid);
    y += textBlock(svg, M, y+4, (ft? `Recorte: ${ft} · ${fmt(md.N)} notícias` : `Todas as notícias${st.rep?'':' únicas'} · ${fmt(md.N)}`) + (comMes? ` em ${nomeMes} (escala dos círculos comum a todos os meses)` : ''), 12.5, W-2*M, {fill:C.ink2}) + 14;
    const GL = 40; // room for latitude labels
    const fx0 = M+GL, fw = (wide? Math.round(W*0.56) : W-2*M) - GL, fh = Math.round(fw*1.58);
    const frame = [fx0, y, fx0+fw, y+fh];
    const proj = zoomProj(PROJ().fitExtent([[fx0+fw*0.06, y+fh*0.015],[fx0+fw*0.94, y+fh*0.985]], ALL), ZOOM.one, [fx0, y]);
    const zk = ZOOM.one.k, gs = gridStep(zk);
    sh.r = d3.scaleSqrt().domain([0, sh.max]).range([0, Math.min(38, fw*0.08)*(o.fill? 0.72 : 1)]);
    o.popR = d3.scaleSqrt().domain([0, 18e6]).range([0, Math.min(52, fw*0.11)]);
    o.popDR = d3.scaleSqrt().domain([0, 2e6]).range([0, Math.min(30, fw*0.065)]);
    const gm = svg.append('g');
    const mm = drawBase(gm, proj, frame, md, sh, {...o, tip, onClick, sel: st.f[vid], labels: fw>=380? LABELS : [], gstep: gs, topo: mstate.topo!==false, topoK: ZOOM.one.k, topoModo:'pais'});
    const zbOne = attachZoom(gm, 'one', [fx0, y], frame, mm);
    mm.append('path').datum(AMBA_BOX).attr('d',d3.geoPath(proj)).attr('fill','none').attr('stroke',C.ink).attr('stroke-dasharray','3 2').attr('stroke-width',.9).attr('pointer-events','none');
    graticuleLabels(svg, proj, frame, gs, 9.5);
    // scale + north inside the frame, over the Atlantic
    northArrow(svg, fx0+fw-26, y+fh*0.70, 20);
    scaleBar(svg, proj, fx0+fw/2, y+fh/2, fx0+fw*0.50, y+fh-22, fw*0.26, true);
    if(zk>1) svg.append('text').attr('x',fx0+8).attr('y',y+fh-10).attr('font-size',10).attr('fill',C.ink2).text(`Ampliação ×${zk.toLocaleString('pt-BR',{maximumFractionDigits:1})}`);
    ZCTL = {sel: gm, zb: zbOne}; var ctlFrame = frame;
    // right column (or below)
    let rx, ry, rw;
    if(wide){ rx = fx0+fw+30; ry = y; rw = W-rx-M; } else { rx = M; ry = y+fh+30; rw = W-2*M; }
    const ih = Math.round(rw*0.66);
    const iframe=[rx, ry, rx+rw, ry+ih];
    const iproj = d3.geoMercator().fitExtent([[rx+2, ry+2],[rx+rw-2, ry+ih-2]], AMBA_BOX);
    drawBase(svg.append('g'), iproj, iframe, md, sh, {...o, tip, onClick, sel: st.f[vid], gstep:0.25, labels: LABELS_AMBA, topo: mstate.topo!==false, topoModo:'amba'});
    svg.append('rect').attr('x',rx+6).attr('y',ry+6).attr('width',Math.min(rw-12, 236)).attr('height',18).attr('fill','#ffffff').attr('fill-opacity',.88);
    svg.append('text').attr('x',rx+11).attr('y',ry+19).attr('font-size',11).attr('font-weight',700).attr('fill',C.ink).text('Detalhe: Área Metropolitana de Buenos Aires');
    scaleBar(svg, iproj, rx+rw/2, ry+ih/2, rx+16, ry+ih-14, Math.min(90, rw*0.3), true);
    let ly = ry+ih+24;
    ly += legendBlock(svg, rx, ly, rw, md, sh, o) + 12;
    ly += textBlock(svg, rx, ly, techNote(md, sh, o, false), 10, rw, {fill:C.ink2, lh:1.38}) + 8;
    H = Math.max(y+fh+22, ly) + M;
    // HTML ranking
    const val = i => o.fill && !o.circles? md.rate(i) : (md.c.get(i)||0);
    const keys=[...md.c.keys()].filter(i=>md.XY[i]).sort((a,c)=>val(c)-val(a)).slice(0,12);
    const rk=$('mapRank'); rk.append(el('h3',null, (o.fill && !o.circles)? 'Maiores taxas por 100 mil hab.' : unit==='loc'? 'Localidades com mais notícias' : unit==='prov'? 'Províncias com mais notícias' : 'Departamentos com mais notícias'));
    const cols=el('div','cols'); keys.forEach(i=>{ const d=el('div'); d.tabIndex=0; d.append(el('span',null,VARS[VI[vid]].values[i]), el('b',null, (o.fill && !o.circles)? nfmt1(val(i)) : fmt(val(i)))); const go=()=>toggleFilter(vid,i); d.onclick=go; d.onkeydown=e=>{ if(e.key==='Enter') go(); }; cols.append(d); }); rk.append(cols);
    $('mapTitle').textContent = 'Mapa'; $('mapMeta').textContent = `${fmt(md.mapped)} de ${fmt(md.N)} notícias no mapa`;
    const regSel = st.f.region? [...st.f.region].map(i=>REG_VALS[i]) : [];
    const baWarn = unit==='prov' && regSel.some(r=>r==='Gran Buenos Aires'||r==='Pampeana') ? 'A província de Buenos Aires se divide entre as regiões Gran Buenos Aires e Pampeana; para separar as duas, use Departamentos ou Localidades. ' : '';
    const bivNota = cdef && cdef.nivel==='biv'? `Mapa bivariado: a cor de cada departamento combina o nível de “${cdef.indTitulo}” (do branco ao azul, de baixo a alto) com as notícias por habitante (do branco ao amarelo, de nenhuma a muitas). Onde os dois são altos, a cor fica verde-escura. Veja “Como ler” na legenda. ` : '';
    const altos = o.dest? o.dest.feats.filter(d=>d.t==='alto').sort((a,q)=>q.razao-a.razao) : [];
    const destNota = o.dest && o.dest.feats.length? `Destaques: ${altos.length} lugares com notícias muito acima do esperado pela população (contorno laranja${altos.length? ', por exemplo ' + altos.slice(0,4).map(d=>d.nome.replace(/ \((Buenos Aires|[^)]+)\)$/,'')).join(', ') : ''}) e ${o.dest.feats.length-altos.length} muito abaixo (contorno azul). ` : (unit==='loc' && mstate.dest!==false? 'Os destaques por população aparecem quando a unidade é departamento ou província. ' : '');
    explicaMapa(md, o, unit, cdef);
    if(cdef && cdef.nivel==='lisa' && !explicaMapa.lisaAberto){ $('mapCalc').open=true; explicaMapa.lisaAberto=true; } // na primeira vez, mostra o cálculo do LISA aberto
    $('mapNote').textContent = destNota + bivNota + baWarn + (RATE_OK(unit)? '' : 'Para localidades, o mapa mostra valores absolutos (círculos); a taxa por habitante está disponível por departamento e por província. ') + `${fmt(md.N-md.mapped)} notícias do recorte ficam fora do mapa por serem de escala nacional, virtuais, sem referência espacial ou no exterior.`;
  } else {
    const cv = mstate.cmp, icv = VI[cv], cvar = VARS[icv];
    const rowsAll = b.filter(r=>match(r, [vid, cv]));
    const tot = counts(rowsAll, cv);
    const cats = order(cv, tot).filter(k=>!/no informa|^ni$/i.test(cvar.values[k])).sort((a,c)=>tot.get(c)-tot.get(a)).slice(0, mstate.n);
    if(!cats.length){ $('mapNote').textContent='Nenhuma categoria com notícias neste recorte.'; svg.remove(); return; }
    const sets = cats.map(k=>({k, md: mapData(rowsAll.filter(r=>r.v[icv].includes(k)), unit, SP.includes(cv)? [[cv, new Set([k])]] : [])}));
    const sh = { max: d3.max(sets, s=>s.md.max)||1 };
    if(o.fill){ const ids=rateIds(unit); Object.assign(sh, classify(sets.flatMap(s=>ids.map(s.md.rate)))); }
    const maxC = Math.min(sets.length, W>=1050? 4 : W>=760? 3 : W>=500? 2 : 1);
    let cols = maxC; for(let c=maxC; c>=Math.max(1,maxC-1); c--){ if((Math.ceil(sets.length/c)*c - sets.length) < (Math.ceil(sets.length/cols)*cols - sets.length)) cols=c; }
    const gap = 16, cw = (W-2*M-(cols-1)*gap)/cols, ch = Math.round(cw*1.5);
    let y = M+14;
    y += textBlock(svg, M, y+4, mapTitle(sets[0].md, o) + ' · segundo ' + cvar.label, 19, W-2*M, {weight:700}) + 10;
    const ft = filtersText([vid, cv]);
    y += textBlock(svg, M, y+4, `${cats.length} categorias mais frequentes de “${cvar.label}”${ft? ' · recorte: '+ft : ''} · mesma escala em todos os mapas`, 12.5, W-2*M, {fill:C.ink2}) + 16;
    sh.r = d3.scaleSqrt().domain([0, sh.max]).range([0, Math.min(26, cw*0.1)*(o.fill? 0.75 : 1)]);
    o.popR = d3.scaleSqrt().domain([0, 18e6]).range([0, Math.min(34, cw*0.13)]);
    o.popDR = d3.scaleSqrt().domain([0, 2e6]).range([0, Math.min(20, cw*0.08)]);
    let projRef=null;
    sets.forEach((s,j)=>{
      const col=j%cols, row=Math.floor(j/cols), x0=M+col*(cw+gap), y0=y+row*(ch+50);
      const g=svg.append('g');
      textBlock(g, x0, y0+10, cvar.values[s.k], 12, cw, {weight:700, max:2});
      g.append('text').attr('x',x0).attr('y',y0+40).attr('font-size',10.5).attr('fill',C.ink2).text(`${fmt(s.md.N)} notícias · ${fmt(s.md.mapped)} no mapa`);
      const fr=[x0, y0+46, x0+cw, y0+46+ch];
      const proj = zoomProj(PROJ().fitExtent([[x0+cw*0.05, y0+50],[x0+cw*0.95, y0+42+ch]], ALL), ZOOM.multi, [x0, y0+46]); projRef = projRef||proj;
      const gz = g.append('g');
      const mz = drawBase(gz, proj, fr, s.md, sh, {...o, small:true, tip, onClick:(v,i)=>{ st.f[cv]=new Set([s.k]); toggleFilter(v,i,true); }, sel: st.f[vid], gstep: gridStep(ZOOM.multi.k), topo: mstate.topo!==false, topoK: ZOOM.multi.k, topoModo:'mini'});
      const zbC = attachZoom(gz, 'multi', [x0, y0+46], fr, mz);
      if(j===0){ ZCTL = {sel: gz, zb: zbC}; ctlFrame = fr; }
      northArrow(g, x0+cw-14, y0+46+ch*0.70, 11);
    });
    const rowsN = Math.ceil(sets.length/cols);
    let ly = y + rowsN*(ch+50) + 10;
    const lx = M, lw = W-2*M;
    const colW = W>=760? Math.min(330, lw*0.34) : lw;
    const lgH = legendBlock(svg, lx, ly, colW, sets[0].md, sh, o);
    const sbX = W>=760? lx+colW+20 : lx, sbY = W>=760? ly+4 : ly+lgH+18;
    svg.append('text').attr('x',sbX).attr('y',sbY).attr('font-size',12).attr('font-weight',700).attr('fill',C.ink).text('Escala (cada mapa)');
    const [pcx, pcy] = projRef([-64,-38]);
    scaleBar(svg, projRef, pcx, pcy, sbX, sbY+24, Math.min(140, cw*0.5), false);
    const noteX = W>=760? sbX : lx, noteY = sbY+52, noteW = W>=760? W-M-noteX : lw;
    const md0 = {...sets[0].md, N: rowsAll.length, mapped: rowsAll.filter(r=>r.v[VI[vid]].some(i=>UNIT_XY(unit)[i])).length};
    const nh = textBlock(svg, noteX, noteY, techNote(md0, sh, o, true), 10, noteW, {fill:C.ink2, lh:1.38});
    H = Math.max(ly+lgH, noteY+nh) + M;
    $('mapTitle').textContent = 'Mapas por categoria'; $('mapMeta').textContent = `${cats.length} mapas · ${cvar.label}`;
    $('mapCalcCorpo').textContent=''; $('mapCalcCorpo').append(...sinPseguro(`Cada mapa repete o cálculo só com as notícias que têm a categoria indicada (${cvar.label}), dentro do recorte atual. Todos os mapas usam a mesma escala de círculos${RATE_OK(unit)? ' e as mesmas classes de cores (quintis calculados com as taxas de todos os mapas juntos)' : ''}, para que possam ser comparados lado a lado. Taxa = notícias ÷ população do Censo 2022 × 100.000.`));
    $('mapNote').textContent = `Cada mapa mostra as notícias que têm a categoria indicada, dentro do recorte atual, na mesma escala para comparação.` + (RATE_OK(unit)? '' : ' Para localidades, os mapas mostram valores absolutos (círculos).');
  }
  svg.attr('viewBox', `0 0 ${W} ${Math.ceil(H)}`); svg.select('.bgpaper').attr('width',W).attr('height',Math.ceil(H));
  SHEET_SVG = svg.node();
  if(ctlFrame) zoomControls(box, ctlFrame, mstate.mode);
}
