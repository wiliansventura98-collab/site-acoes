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
function svgString(node){ const c=node.cloneNode(true); c.removeAttribute('width'); const vb=node.viewBox.baseVal; c.setAttribute('width', vb.width); c.setAttribute('height', vb.height); c.querySelectorAll('[class]').forEach(e=>e.removeAttribute('class')); return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(c); }
async function pngBlob(node, scale){ const s=svgString(node), vb=node.viewBox.baseVal; const url=URL.createObjectURL(new Blob([s],{type:'image/svg+xml'})); const img=new Image();
  await new Promise((res,rej)=>{ img.onload=res; img.onerror=rej; img.src=url; }); const cv=document.createElement('canvas'); cv.width=Math.round(vb.width*scale); cv.height=Math.round(vb.height*scale);
  const cx=cv.getContext('2d'); cx.fillStyle='#ffffff'; cx.fillRect(0,0,cv.width,cv.height); cx.drawImage(img,0,0,cv.width,cv.height); URL.revokeObjectURL(url); return await new Promise(r=>cv.toBlob(r,'image/png')); }
const fname = ext => `mapa_${mstate.unit}_${mstate.measure}${mstate.mode==='multi'?'_'+mstate.cmp:''}.${ext}`;
async function doSave(kind){ if(!DL||!SHEET_SVG) return; $('mapMsg').textContent='';
  try{ const data = kind==='png'? await pngBlob(SHEET_SVG, 3) : svgString(SHEET_SVG); await DL.save({filename: fname(kind), data}); $('mapMsg').textContent = kind.toUpperCase()+' baixado.'; }
  catch(err){ $('mapMsg').textContent = err&&err.code==='declined'? '' : 'Não foi possível baixar aqui.'; } }
$('dlPng').onclick=()=>doSave('png'); $('dlSvg').onclick=()=>doSave('svg');
