/* GERADO por i18n/ferramenta.js a partir de assets/js/app/exportar.js; não edite: edite o original e i18n/es.json */
var IDIOMA='es';
/*
 * Exportação
 * PNG, SVG e downloads pelo navegador.
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

// Native browser downloads (standalone site)
const NATIVE_DL = { save: async ({filename, data}) => {
  const type = filename.endsWith('.csv')? 'text/csv;charset=utf-8' : filename.endsWith('.svg')? 'image/svg+xml' : filename.endsWith('.png')? 'image/png' : 'application/octet-stream';
  const blob = data instanceof Blob? data : new Blob([data], {type});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 1500); return {status:'saved'}; } };
// export
let DL = null;
function svgString(node, css){ const c=node.cloneNode(true); c.removeAttribute('width'); const vb=node.viewBox.baseVal; c.setAttribute('width', vb.width); c.setAttribute('height', vb.height); c.querySelectorAll('[class]').forEach(e=>e.removeAttribute('class'));
  if(css){ const stl=document.createElementNS('http://www.w3.org/2000/svg','style'); stl.textContent=css; c.insertBefore(stl, c.firstChild); }
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(c); }
// fonte Urbanist embutida (para que SVG e PNG exportados mantenham a tipografia em qualquer computador)
let FONTE_CSS=null;
async function fonteEmbutida(){ if(FONTE_CSS) return FONTE_CSS;
  const b64=async u=>{ const buf=await (await fetch(u)).arrayBuffer(); let s=''; const a=new Uint8Array(buf); for(let i=0;i<a.length;i+=8192) s+=String.fromCharCode.apply(null, a.subarray(i,i+8192)); return btoa(s); };
  const [l, le] = await Promise.all([b64('../../assets/fonts/urbanist-latin-wght-normal.woff2'), b64('../../assets/fonts/urbanist-latin-ext-wght-normal.woff2')]);
  FONTE_CSS=`@font-face{font-family:"Urbanist";font-weight:100 900;src:url(data:font/woff2;base64,${l}) format("woff2");unicode-range:U+0000-00FF,U+2000-206F}@font-face{font-family:"Urbanist";font-weight:100 900;src:url(data:font/woff2;base64,${le}) format("woff2");unicode-range:U+0100-02FF,U+1E00-1EFF}`;
  return FONTE_CSS; }
async function pngBlob(node, scale, css){ const s=svgString(node, css), vb=node.viewBox.baseVal; const url=URL.createObjectURL(new Blob([s],{type:'image/svg+xml'})); const img=new Image();
  await new Promise((res,rej)=>{ img.onload=res; img.onerror=rej; img.src=url; }); const cv=document.createElement('canvas'); cv.width=Math.round(vb.width*scale); cv.height=Math.round(vb.height*scale);
  const cx=cv.getContext('2d'); cx.fillStyle='#ffffff'; cx.fillRect(0,0,cv.width,cv.height); cx.drawImage(img,0,0,cv.width,cv.height); URL.revokeObjectURL(url); return await new Promise(r=>cv.toBlob(r,'image/png')); }
const fname = ext => `mapa_${mstate.unit}_${mstate.measure}${mstate.mode==='multi'?'_'+mstate.cmp:''}.${ext}`;
async function doSave(kind){ if(!DL||!SHEET_SVG) return; $('mapMsg').textContent='';
  try{ const data = kind==='png'? await pngBlob(SHEET_SVG, 3) : svgString(SHEET_SVG); await DL.save({filename: fname(kind), data}); $('mapMsg').textContent = kind.toUpperCase()+' baixado.'; }
  catch(err){ $('mapMsg').textContent = err&&err.code==='declined'? '' : 'No se pudo descargar aquí.'; } }
$('dlPng').onclick=()=>doSave('png'); $('dlSvg').onclick=()=>doSave('svg');
