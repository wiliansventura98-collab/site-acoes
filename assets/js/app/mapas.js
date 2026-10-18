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
const DEPT_HAS = new Set();
let REGS_FC=[];
let TOPO=null, DEPTS=[], PROVS_FC=[], MESH={}, ALL=null, NEIGH=[], DEPT_XY=[], PROV_XY=[];
function mainCentroid(f){ // centroid of the largest part, so islands don't pull the symbol into the sea
  const g=f.geometry; if(g.type!=='MultiPolygon') return d3.geoCentroid(f);
  let best=null, ba=-1; g.coordinates.forEach(c=>{ const p={type:'Polygon',coordinates:c}; const a=d3.geoArea(p); if(a>ba){ ba=a; best=p; } }); return d3.geoCentroid(best); }
if(HAS_D3){
  TOPO = GEO.deptos; const OBJ = TOPO.objects[Object.keys(TOPO.objects)[0]];
  DEPTS = topojson.feature(TOPO, OBJ).features;
  const ROTULOS = GEO.deptLabels || {};
  DEPTS.forEach(f=>{ const p=f.properties; p.n = ROTULOS[f.id] || p.n; p.di = deptIdx[p.n] ?? -1; p.pi = provIdx[p.p] ?? -1; if(p.di>=0){ DEPT_HAS.add(p.di); DEPT_XY[p.di]=mainCentroid(f); } });
  PROVS_FC = [...d3.group(OBJ.geometries, g=>g.properties.p)].map(([p,gs])=>({type:'Feature', properties:{p, pi: provIdx[p] ?? -1}, geometry: topojson.merge(TOPO, gs)}));
  PROVS_FC.forEach(f=>{ if(f.properties.pi>=0) PROV_XY[f.properties.pi]=mainCentroid(f); });
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
  hom23:  {nivel:'prov', campo:'taxa_homicidios_2023', titulo:'Homicídios dolosos por 100 mil hab., 2023', curto:'por 100 mil hab.', dec:2,
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
const ctxEscolha = k => (k && CTXDEF[k]) || null;
function ctxValor(def, chave){ if(!def) return null; const fonte = def.nivel==='prov'? CTX.provincias : def.nivel==='reg'? CTX.regioes : null; const r = fonte && fonte[chave]; return r? r[def.campo] : null; }
function ctxClasses(def){
  let vals = def.nivel==='agl'? CTX.aglomerados.map(a=>a[def.campo]) : Object.values(def.nivel==='prov'? CTX.provincias : CTX.regioes).map(r=>r[def.campo]);
  vals = vals.filter(v=>v!=null && isFinite(v)).sort(d3.ascending);
  const k = Math.min(5, vals.length), rnd = v => +v.toFixed(def.dec);
  const th = [...new Set(d3.range(1,k).map(i=>rnd(d3.quantileSorted(vals, i/k))))].filter(x=>x>vals[0] && x<vals[vals.length-1]);
  const ramp = CTX_RAMP.slice(CTX_RAMP.length-(th.length+1));
  const color = v => { if(v==null || !isFinite(v)) return '#f1f1ef'; let i=0; while(i<th.length && v>th[i]) i++; return ramp[i]; };
  const f = v => v.toLocaleString('pt-BR',{minimumFractionDigits:def.dec, maximumFractionDigits:def.dec});
  const lo=[vals[0], ...th], hi=[...th, vals[vals.length-1]];
  return { color, items: ramp.map((c,i)=>[c, i===0? `${f(lo[i])} a ${f(hi[i])}` : `mais de ${f(lo[i])} a ${f(hi[i])}`]), fmt:f };
}
const PROJ = () => d3.geoConicConformal().parallels([-28,-46]).rotate([64,0]);
const mstate = { unit:'loc', measure:'abs', mode:'one', cmp:'nombremov', n:6, author:'', ctx:'' };
try{ const s=JSON.parse(localStorage.getItem('as24m2')||'null'); if(s){ Object.assign(mstate, s); if(VI[mstate.cmp]==null) mstate.cmp='nombremov'; } }catch(e){}
const msave = () => { try{ localStorage.setItem('as24m2', JSON.stringify(mstate)); }catch(e){} };
const RATE_OK = u => u==='prov';
fillSelect($('cmpVar'), false);
document.querySelectorAll('#mapUnit button').forEach(b=>b.onclick=()=>{ mstate.unit=b.dataset.v; if(!RATE_OK(mstate.unit)) mstate.measure='abs'; render(); });
document.querySelectorAll('#mapMeasure button').forEach(b=>b.onclick=()=>{ if(b.disabled) return; mstate.measure=b.dataset.v; render(); });
document.querySelectorAll('#mapMode button').forEach(b=>b.onclick=()=>{ mstate.mode=b.dataset.v; render(); });
$('cmpVar').onchange=e=>{ mstate.cmp=e.target.value; render(); };
$('ctxLayer').onchange=e=>{ mstate.ctx=e.target.value; render(); };
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
const UNIT_XY = u => u==='loc'? LOC_XY : u==='dept'? DEPT_XY : PROV_XY;
function mapData(rows, unit, extra){
  const vid = UNIT_VID[unit], XY = UNIT_XY(unit);
  const cons = spatialCons(vid).concat(extra||[]);
  const c = keepPlaces(counts(rows, vid), vid, cons);
  const rate = i => POP[i]? (c.get(i)||0)/POP[i]*1e5 : 0;
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
  const tipText = i => { const n=md.c.get(i)||0; const L=[`${fmt(n)} notícias · ${pct(n, md.N)} do recorte`]; if(md.unit==='prov' && POP[i]) L.push(`${nfmt1(md.rate(i))} por 100 mil hab.`);
    if(md.unit==='prov' && o.ctx && o.ctx.nivel==='prov'){ const v=ctxValor(o.ctx, PROV_VALS[i]); if(v!=null) L.push(`${o.ctxCls.fmt(v)} ${o.ctx.curto} (${o.ctx.titulo.split(',')[0].toLowerCase()})`); } return L; };
  const ev = (s, nameOf, idxOf) => { if(!tip) return s; return s.attr('class','hit')
      .on('mousemove',(e,d)=>{ const i=idxOf(d); if(i<0) return tip.hide(); tip.show(e, nameOf(d), tipText(i)); })
      .on('mouseleave',()=>tip.hide()).on('click',(e,d)=>{ const i=idxOf(d); if(i>=0) o.onClick(md.vid, i); }); };
  const cdef = o.ctx, cpoly = cdef && (cdef.nivel==='prov' || cdef.nivel==='reg');
  if(cpoly){ // camada de contexto em coroplético (substitui o fundo neutro)
    const feats = cdef.nivel==='prov'? PROVS_FC : REGS_FC;
    const nome = f => cdef.nivel==='prov'? f.properties.p : f.properties.r;
    const sCtx = m.append('g').selectAll('path').data(feats).join('path').attr('d',path).attr('fill', f=>o.ctxCls.color(ctxValor(cdef, nome(f))));
    if(tip && md.unit!=='prov') sCtx.on('mousemove',(e,f)=>{ const v=ctxValor(cdef, nome(f)); tip.show(e, nome(f), [v==null? 'sem dado' : `${o.ctxCls.fmt(v)} ${cdef.curto}`, cdef.titulo]); }).on('mouseleave',()=>tip.hide());
    if(md.unit==='prov') ev(sCtx, f=>f.properties.p, f=>f.properties.pi);
  } else if(o.fill){ // choropleth of rates (provinces)
    ev(m.append('g').selectAll('path').data(PROVS_FC).join('path').attr('d',path).attr('fill',f=> f.properties.pi>=0? sh.color(md.rate(f.properties.pi)) : C.zero), f=>f.properties.p, f=>f.properties.pi);
  } else {
    const land = m.append('g').selectAll('path').data(md.unit==='prov'? PROVS_FC : DEPTS).join('path').attr('d',path).attr('fill',C.land);
    if(md.unit!=='loc') ev(land, f=> md.unit==='prov'? f.properties.p : f.properties.n, f=> md.unit==='prov'? f.properties.pi : f.properties.di);
  }
  // boundary hierarchy: departments < provinces < regions
  if(!o.fill && !cpoly) m.append('path').datum(MESH.dept).attr('d',path).attr('fill','none').attr('stroke',C.dept).attr('stroke-width', o.small? .2 : .35);
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
    if(d.nivel==='pop'){
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
  [['Limite internacional',C.neighLine,.9],['Limite regional (INDEC)',C.reg,2.3],['Limite provincial',C.prov,1],['Limite de departamento / partido',C.dept,.6]].forEach(([l,c,wd])=>{
    if((o.fill || (o.ctx && (o.ctx.nivel==='prov'||o.ctx.nivel==='reg'))) && wd===.6) return;
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
  if(o.fill) s.push(`Valores relativos em coroplético: taxa = notícias ÷ população residente × 100.000. População: INDEC, Censo Nacional de Población, Hogares y Viviendas 2022, resultados definitivos. Classes por quantis (até 5 classes) dos valores não nulos${multi?', comuns a todos os mapas':''}.`);
  if(o.ctx){ const d=o.ctx; s.push(d.nivel==='pop'? `Camada de contexto: população residente em 2022 em círculos vazados proporcionais (área ∝ habitantes), no centróide de cada província; fonte: ${d.fonte}.`
    : `Camada de contexto: ${d.titulo}, ${d.nivel==='agl'? 'em símbolos de cor nos 31 aglomerados urbanos da EPH (valores urbanos, não provinciais)' : d.nivel==='reg'? 'em coroplético por região estatística (valores dos aglomerados urbanos de cada região)' : 'em coroplético por província'}; classes por quantis; fonte: ${d.fonte}.`); }
  if(md.spatial) s.push('Filtros espaciais aplicados ao lugar: só são representados os lugares dentro das unidades selecionadas, mesmo quando a notícia também cita outros lugares.');
  s.push('Limites: departamentos/partidos (linha fina), províncias (média) e regiões estatísticas do INDEC (grossa): Gran Buenos Aires (CABA e 24 partidos), Pampeana, Noroeste, Noreste, Cuyo e Patagonia.');
  const zk = (multi? ZOOM.multi : ZOOM.one).k; if(zk>1) s.push(`Vista ampliada (×${zk.toLocaleString('pt-BR',{maximumFractionDigits:1})}) em relação ao país inteiro.`);
  s.push(`Sistema de coordenadas geográficas, datum WGS 84; projeção cônica conforme de Lambert (paralelos-padrão 28° S e 46° S; meridiano central 64° O); grade de ${gridStep(zk).toLocaleString('pt-BR')}°; escala gráfica válida para o centro do mapa.`);
  const ft = filtersText(multi? [md.vid, mstate.cmp] : md.vid);
  s.push(`Fonte dos dados: Base de notícias de ações coletivas 2024 (${fmt(md.N)} notícias${st.rep?', incluindo repetidas':', sem repetidas'}${ft? '; recorte: '+ft : ''}; ${fmt(md.N-md.mapped)} sem localização mapeável nesta escala). Base cartográfica: departamentos (mgaitan/departamentos_argentina), simplificada; países limítrofes: Natural Earth 1:50 milhões.`);
  s.push(`Elaboração: ${mstate.author || 'não informada'}, ${today}.`);
  return s.join(' ');
}
function mapTitle(md, o){
  const u = md.unit==='loc'? 'localidade' : md.unit==='dept'? 'departamento / partido' : 'província';
  const t = o.fill && o.circles? `Notícias de ações coletivas por ${u}: taxa por 100 mil habitantes e valores absolutos` : o.fill? `Notícias de ações coletivas por 100 mil habitantes, por ${u}` : `Notícias de ações coletivas por ${u}`;
  return t + ' · Argentina, 2024';
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
  if(!RATE_OK(mstate.unit)) mstate.measure='abs';
  const cdef = ctxEscolha(mstate.ctx), cpoly = !!cdef && (cdef.nivel==='prov' || cdef.nivel==='reg');
  if(cpoly) mstate.measure='abs';
  $('ctxLayer').value = mstate.ctx || '';
  document.querySelectorAll('#mapUnit button').forEach(x=>x.setAttribute('aria-pressed', String(x.dataset.v===mstate.unit)));
  document.querySelectorAll('#mapMeasure button').forEach(x=>{ x.setAttribute('aria-pressed', String(x.dataset.v===mstate.measure)); x.disabled = x.dataset.v!=='abs' && (!RATE_OK(mstate.unit) || cpoly); x.title = !x.disabled? '' : cpoly? 'Com uma camada de contexto em coroplético, as notícias aparecem em círculos' : 'Taxa disponível para províncias (população por departamento e localidade não incluída)'; });
  document.querySelectorAll('#mapMode button').forEach(x=>x.setAttribute('aria-pressed', String(x.dataset.v===mstate.mode)));
  $('cmpWrap').hidden = $('cmpNWrap').hidden = mstate.mode!=='multi';
  $('cmpVar').value = mstate.cmp; $('cmpN').value = String(mstate.n);
  if(document.activeElement!==$('author')) $('author').value = mstate.author;
  msave();
  const box=$('sheet'); box.querySelectorAll('svg').forEach(s=>s.remove()); $('mapRank').textContent='';
  if(!HAS_D3){ $('mapNote').textContent='Não foi possível carregar a biblioteca de mapas nesta visualização.'; return; }
  const unit = mstate.unit, vid = UNIT_VID[unit];
  const o = { circles: mstate.measure!=='rate', fill: mstate.measure!=='abs', ctx: cdef, ctxCls: cdef && cdef.nivel!=='pop'? ctxClasses(cdef) : null };
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
    const sh = { max: md.max||1 };
    if(o.fill) Object.assign(sh, classify(PROVS_FC.map(f=>f.properties.pi).filter(i=>i>=0).map(md.rate)));
    const wide = W>=780;
    let y = M+14;
    y += textBlock(svg, M, y+4, mapTitle(md, o), 19, W-2*M, {weight:700}) + 10;
    const ft = filtersText(vid);
    y += textBlock(svg, M, y+4, ft? `Recorte: ${ft} · ${fmt(md.N)} notícias` : `Todas as notícias${st.rep?'':' únicas'} · ${fmt(md.N)}`, 12.5, W-2*M, {fill:C.ink2}) + 14;
    const GL = 40; // room for latitude labels
    const fx0 = M+GL, fw = (wide? Math.round(W*0.56) : W-2*M) - GL, fh = Math.round(fw*1.58);
    const frame = [fx0, y, fx0+fw, y+fh];
    const proj = zoomProj(PROJ().fitExtent([[fx0+fw*0.06, y+fh*0.015],[fx0+fw*0.94, y+fh*0.985]], ALL), ZOOM.one, [fx0, y]);
    const zk = ZOOM.one.k, gs = gridStep(zk);
    sh.r = d3.scaleSqrt().domain([0, sh.max]).range([0, Math.min(38, fw*0.08)*(o.fill? 0.72 : 1)]);
    o.popR = d3.scaleSqrt().domain([0, 18e6]).range([0, Math.min(52, fw*0.11)]);
    const gm = svg.append('g');
    const mm = drawBase(gm, proj, frame, md, sh, {...o, tip, onClick, sel: st.f[vid], labels: fw>=380? LABELS : [], gstep: gs});
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
    drawBase(svg.append('g'), iproj, iframe, md, sh, {...o, tip, onClick, sel: st.f[vid], gstep:0.25, labels: LABELS_AMBA});
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
    $('mapNote').textContent = baWarn + (RATE_OK(unit)? '' : 'Para localidades e departamentos o mapa mostra valores absolutos (círculos); a taxa por habitante está disponível por província. ') + `${fmt(md.N-md.mapped)} notícias do recorte ficam fora do mapa por serem de escala nacional, virtuais, sem referência espacial ou no exterior.`;
  } else {
    const cv = mstate.cmp, icv = VI[cv], cvar = VARS[icv];
    const rowsAll = b.filter(r=>match(r, [vid, cv]));
    const tot = counts(rowsAll, cv);
    const cats = order(cv, tot).filter(k=>!/no informa|^ni$/i.test(cvar.values[k])).sort((a,c)=>tot.get(c)-tot.get(a)).slice(0, mstate.n);
    if(!cats.length){ $('mapNote').textContent='Nenhuma categoria com notícias neste recorte.'; svg.remove(); return; }
    const sets = cats.map(k=>({k, md: mapData(rowsAll.filter(r=>r.v[icv].includes(k)), unit, SP.includes(cv)? [[cv, new Set([k])]] : [])}));
    const sh = { max: d3.max(sets, s=>s.md.max)||1 };
    if(o.fill){ const ids=PROVS_FC.map(f=>f.properties.pi).filter(i=>i>=0); Object.assign(sh, classify(sets.flatMap(s=>ids.map(s.md.rate)))); }
    const maxC = Math.min(sets.length, W>=1050? 4 : W>=760? 3 : W>=500? 2 : 1);
    let cols = maxC; for(let c=maxC; c>=Math.max(1,maxC-1); c--){ if((Math.ceil(sets.length/c)*c - sets.length) < (Math.ceil(sets.length/cols)*cols - sets.length)) cols=c; }
    const gap = 16, cw = (W-2*M-(cols-1)*gap)/cols, ch = Math.round(cw*1.5);
    let y = M+14;
    y += textBlock(svg, M, y+4, mapTitle(sets[0].md, o) + ' · segundo ' + cvar.label, 19, W-2*M, {weight:700}) + 10;
    const ft = filtersText([vid, cv]);
    y += textBlock(svg, M, y+4, `${cats.length} categorias mais frequentes de “${cvar.label}”${ft? ' · recorte: '+ft : ''} · mesma escala em todos os mapas`, 12.5, W-2*M, {fill:C.ink2}) + 16;
    sh.r = d3.scaleSqrt().domain([0, sh.max]).range([0, Math.min(26, cw*0.1)*(o.fill? 0.75 : 1)]);
    o.popR = d3.scaleSqrt().domain([0, 18e6]).range([0, Math.min(34, cw*0.13)]);
    let projRef=null;
    sets.forEach((s,j)=>{
      const col=j%cols, row=Math.floor(j/cols), x0=M+col*(cw+gap), y0=y+row*(ch+50);
      const g=svg.append('g');
      textBlock(g, x0, y0+10, cvar.values[s.k], 12, cw, {weight:700, max:2});
      g.append('text').attr('x',x0).attr('y',y0+40).attr('font-size',10.5).attr('fill',C.ink2).text(`${fmt(s.md.N)} notícias · ${fmt(s.md.mapped)} no mapa`);
      const fr=[x0, y0+46, x0+cw, y0+46+ch];
      const proj = zoomProj(PROJ().fitExtent([[x0+cw*0.05, y0+50],[x0+cw*0.95, y0+42+ch]], ALL), ZOOM.multi, [x0, y0+46]); projRef = projRef||proj;
      const gz = g.append('g');
      const mz = drawBase(gz, proj, fr, s.md, sh, {...o, small:true, tip, onClick:(v,i)=>{ st.f[cv]=new Set([s.k]); toggleFilter(v,i,true); }, sel: st.f[vid], gstep: gridStep(ZOOM.multi.k)});
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
    $('mapNote').textContent = `Cada mapa mostra as notícias que têm a categoria indicada, dentro do recorte atual, na mesma escala para comparação.` + (RATE_OK(unit)? '' : ' Para localidades e departamentos os mapas mostram valores absolutos (círculos).');
  }
  svg.attr('viewBox', `0 0 ${W} ${Math.ceil(H)}`); svg.select('.bgpaper').attr('width',W).attr('height',Math.ceil(H));
  SHEET_SVG = svg.node();
  if(ctlFrame) zoomControls(box, ctlFrame, mstate.mode);
}
