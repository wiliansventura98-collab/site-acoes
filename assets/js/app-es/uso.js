/* GERADO por i18n/ferramenta.js a partir de assets/js/app/uso.js; não edite: edite o original e i18n/es.json */
var IDIOMA='es';
/*
 * Atalhos, downloads e citação (acrescentado em 30/10/2026)
 * - No topo de cada aba: atalhos para as novas leituras que ficam no fim dela, o botão do CSV do recorte e “Como citar”.
 * - Embaixo de cada gráfico: “Baixar PNG” e “Baixar SVG”, com título, filtros e fonte gravados na imagem.
 * - Nas tabelas das novas leituras: “Baixar tabela (CSV)”.
 * Nada do que já existia muda: tudo é desenhado depois do render() original e falhas aqui não interrompem a base.
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

const USO_SITE = 'https://wiliansventura98-collab.github.io/site-acoes/';
const USO_TITULO = 'Banco de Datos de las Luchas por Espacios y Territorios (DATALUTA): Movimientos Socioespaciales y Socioterritoriales Urbanos Argentinos (2024)';
const USO_FONTE = 'Fuente: DATALUTA Argentina 2024 (CC BY 4.0)';
const usoSecao = () => document.querySelector(`.panel[role=tabpanel][aria-labelledby="tab-${TAB}"]`);
const usoSlug = s => (s || 'grafico').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 50) || 'grafico';

{
  const renderAntes = render;
  render = function () {
    renderAntes.apply(this, arguments);
    try { usoAtalhos(); usoBotoesGraficos(); } catch (e) { console.warn('Atajos y descargas:', e); }
  };
}

/* ---------- atalhos no topo da aba ---------- */
function usoAtalhos() {
  const sec = usoSecao(); if (!sec) return;
  let bar = sec.querySelector(':scope > .uso-atalhos');
  if (!bar) {
    bar = el('div', 'uso-atalhos'); bar.setAttribute('role', 'navigation'); bar.setAttribute('aria-label', 'Atajos de esta pestaña');
    const novas = el('div', 'uso-novas');
    const acoes = el('div', 'uso-acoes');
    const csv = el('button', 'uso-bt', 'Descargar recorte (CSV)'); csv.type = 'button'; csv.title = 'Descarga las noticias que pasan por los filtros actuales, con todas las variables';
    csv.onclick = () => { const b = $('dl'); if (b) b.click(); csv.blur(); };
    const cit = el('button', 'uso-bt', 'Cómo citar'); cit.type = 'button'; cit.onclick = usoCitar;
    acoes.append(csv, cit);
    bar.append(novas, acoes); bar._novas = novas;
    const cab = sec.querySelector(':scope > .sechead');
    if (cab) cab.after(bar); else sec.prepend(bar);
  }
  const ps = [...sec.querySelectorAll('.nl-painel')];
  const box = bar._novas; box.textContent = '';
  if (ps.length) {
    box.append(el('span', 'uso-rot', ps.length > 1 ? 'Nuevas lecturas al final de esta pestaña:' : 'Nueva lectura al final de esta pestaña:'));
    ps.forEach(p => {
      const h = p.querySelector('h2'); const nome = (h ? h.textContent : '').split(':')[0].trim();
      const a = el('a', 'uso-ir', nome + ' ↓'); a.href = '#' + p.id;
      a.onclick = e => { e.preventDefault(); p.scrollIntoView({ behavior: 'smooth', block: 'start' }); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } };
      box.append(a);
    });
  }
}

/* ---------- PNG e SVG de cada gráfico ---------- */
function usoBotoesGraficos() {
  const sec = usoSecao(); if (!sec) return;
  sec.querySelectorAll('.chart').forEach(ch => {
    if (ch.closest('.sm')) return; // gráficos pequenos lado a lado: sem botões, para não quebrar a grade
    const temSvg = [...ch.querySelectorAll('svg')].some(s => s.viewBox && s.viewBox.baseVal && s.viewBox.baseVal.width > 150 && !s.closest('.tip'));
    let bar = ch.nextElementSibling && ch.nextElementSibling.classList.contains('uso-baixar') ? ch.nextElementSibling : null;
    if (!bar) {
      bar = el('div', 'uso-baixar');
      const msg = el('span', 'toast');
      const mk = (tipo, rot) => { const b = el('button', 'uso-bt uso-bt-p', rot); b.type = 'button'; b.onclick = () => usoBaixarGrafico(ch, tipo, msg); return b; };
      bar.append(mk('png', 'Descargar PNG'), mk('svg', 'Descargar SVG'), msg);
      ch.after(bar);
    }
    bar.hidden = !temSvg;
  });
}
function usoTituloDe(ch) {
  const p = ch.closest('.nl-painel'); if (p) { const h = p.querySelector('h2'); if (h) return h.textContent.trim(); }
  // o título mais próximo antes do gráfico, dentro da aba
  const sec = ch.closest('.panel'); let melhor = null;
  sec.querySelectorAll('h2,h3').forEach(h => { if (h.offsetParent !== null && (h.compareDocumentPosition(ch) & Node.DOCUMENT_POSITION_FOLLOWING)) melhor = h; });
  return melhor ? melhor.textContent.trim() : document.title;
}
const USO_PROPS = ['fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'opacity', 'font-size', 'font-weight', 'font-style', 'text-anchor', 'dominant-baseline', 'paint-order', 'display', 'visibility', 'mix-blend-mode'];
function usoCopiaEstilos(orig, copia) {
  const o = [orig, ...orig.querySelectorAll('*')], c = [copia, ...copia.querySelectorAll('*')];
  o.forEach((e, i) => {
    const d = c[i]; if (!d) return;
    const cs = getComputedStyle(e);
    const st = USO_PROPS.map(p => { const v = cs.getPropertyValue(p); return v ? `${p}:${v}` : ''; }).filter(Boolean);
    if (e.tagName === 'text' || e.tagName === 'tspan') st.push('font-family:Urbanist,Arial,sans-serif');
    d.setAttribute('style', st.join(';')); d.removeAttribute('class');
  });
}
let USO_FONTE_CSS = null;
async function usoFonte() {
  if (USO_FONTE_CSS != null) return USO_FONTE_CSS;
  try {
    const sc = document.querySelector('script[src*="carregar.js"]'); const raiz = new URL('../../fonts/', sc ? sc.src : location.href);
    const b64 = async u => { const buf = await (await fetch(new URL(u, raiz))).arrayBuffer(); let s = ''; const a = new Uint8Array(buf); for (let i = 0; i < a.length; i += 8192) s += String.fromCharCode.apply(null, a.subarray(i, i + 8192)); return btoa(s); };
    const [l, le] = await Promise.all([b64('urbanist-latin-wght-normal.woff2'), b64('urbanist-latin-ext-wght-normal.woff2')]);
    USO_FONTE_CSS = `@font-face{font-family:"Urbanist";font-weight:100 900;src:url(data:font/woff2;base64,${l}) format("woff2");unicode-range:U+0000-00FF,U+2000-206F}@font-face{font-family:"Urbanist";font-weight:100 900;src:url(data:font/woff2;base64,${le}) format("woff2");unicode-range:U+0100-02FF,U+1E00-1EFF}`;
  } catch (e) { USO_FONTE_CSS = ''; }
  return USO_FONTE_CSS;
}
// texto dos filtros ativos (o mesmo resumo que aparece na barra de filtros, se houver)
function usoFiltros() {
  const n = (typeof base === 'function' && typeof match === 'function') ? base().filter(r => match(r, null)).length : null;
  const partes = [];
  try {
    for (const vid in st.f) { const v = VARS[VI[vid]]; if (!v || !st.f[vid] || !st.f[vid].size) continue; partes.push(v.label + ': ' + [...st.f[vid]].map(k => v.values[k]).join(', ')); }
    if (st.q) partes.push('búsqueda: “' + st.q + '”');
  } catch (e) { }
  return (partes.length ? 'Recorte: ' + partes.join(' · ') : 'Recorte: todas las noticias') + (n != null ? ` (${fmt(n)} noticias)` : '');
}
function usoQuebra(txt, max) { const ps = txt.split(' '), ls = []; let l = ''; ps.forEach(p => { if ((l + ' ' + p).trim().length > max) { if (l) ls.push(l); l = p; } else l = (l + ' ' + p).trim(); }); if (l) ls.push(l); return ls; }
async function usoMontaSvg(ch) {
  const NS = 'http://www.w3.org/2000/svg';
  const svgs = [...ch.querySelectorAll('svg')].filter(s => s.viewBox && s.viewBox.baseVal && s.viewBox.baseVal.width > 150 && !s.closest('.tip') && s.getBoundingClientRect().width > 0);
  if (!svgs.length) throw new Error('sin gráfico');
  const W = Math.max(...svgs.map(s => s.viewBox.baseVal.width));
  const titulo = usoTituloDe(ch), fs = Math.max(13, W / 60);
  const linT = usoQuebra(titulo, Math.round(W / (fs * 0.56))), linF = usoQuebra(usoFiltros(), Math.round(W / (fs * 0.5)));
  const topo = 16 + linT.length * fs * 1.35 + linF.length * fs * 1.2 + 10;
  const out = document.createElementNS(NS, 'svg'); out.setAttribute('xmlns', NS);
  let y = topo;
  svgs.forEach(s => {
    const vb = s.viewBox.baseVal, c = s.cloneNode(true); usoCopiaEstilos(s, c);
    const esc = Math.min(1, W / vb.width);
    c.setAttribute('x', 0); c.setAttribute('y', y); c.setAttribute('width', vb.width * esc); c.setAttribute('height', vb.height * esc);
    c.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.width} ${vb.height}`); c.setAttribute('overflow', 'visible');
    out.append(c); y += vb.height * esc + 12;
  });
  const H = y + fs * 1.6 + 8;
  const M = 20; out.setAttribute('viewBox', `${-M} ${-M / 2} ${W + 2 * M} ${H + M}`); out.setAttribute('width', W + 2 * M); out.setAttribute('height', H + M);
  const fundo = document.createElementNS(NS, 'rect'); fundo.setAttribute('x', -M); fundo.setAttribute('y', -M / 2); fundo.setAttribute('width', W + 2 * M); fundo.setAttribute('height', H + M); fundo.setAttribute('fill', '#ffffff'); out.prepend(fundo);
  const txt = (t, x, yy, tam, peso, cor) => { const e = document.createElementNS(NS, 'text'); e.setAttribute('x', x); e.setAttribute('y', yy); e.setAttribute('style', `font-family:Urbanist,Arial,sans-serif;font-size:${tam}px;font-weight:${peso};fill:${cor}`); e.textContent = t; out.append(e); };
  let yy = 12 + fs;
  linT.forEach(l => { txt(l, 0, yy, fs * 1.1, 750, '#13294b'); yy += fs * 1.35; });
  linF.forEach(l => { txt(l, 0, yy, fs * 0.85, 500, '#4a5a70'); yy += fs * 1.2; });
  txt(USO_FONTE + ' · ' + USO_SITE, 0, H - 8, fs * 0.8, 500, '#4a5a70');
  const css = await usoFonte();
  if (css) { const stl = document.createElementNS(NS, 'style'); stl.textContent = css; out.prepend(stl); }
  return { svg: '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(out), W: W + 2 * M, H: H + M, titulo };
}
async function usoBaixarGrafico(ch, tipo, msg) {
  msg.textContent = '';
  try {
    const { svg, W, H, titulo } = await usoMontaSvg(ch);
    let data = svg;
    if (tipo === 'png') {
      const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })); const img = new Image();
      await new Promise((ok, falha) => { img.onload = ok; img.onerror = falha; img.src = url; });
      const k = Math.min(3, 4000 / W), cv = document.createElement('canvas'); cv.width = Math.round(W * k); cv.height = Math.round(H * k);
      const cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height); cx.drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url);
      data = await new Promise(r => cv.toBlob(r, 'image/png'));
    }
    await NATIVE_DL.save({ filename: `dataluta_${usoSlug(titulo)}.${tipo}`, data });
    msg.textContent = tipo.toUpperCase() + ' baixado.';
  } catch (e) { console.warn(e); msg.textContent = 'No se pudo descargar este gráfico.'; }
  setTimeout(() => { msg.textContent = ''; }, 4000);
}

/* ---------- CSV das tabelas das novas leituras ---------- */
{
  const tabelaAntes = nlTabela;
  nlTabela = function (det, cab, linhas) {
    tabelaAntes.apply(this, arguments);
    det.querySelectorAll('.uso-tab-csv').forEach(n => n.remove());
    if (!linhas.length) return;
    const b = el('button', 'uso-bt uso-bt-p uso-tab-csv', 'Descargar tabla (CSV)'); b.type = 'button';
    b.onclick = () => {
      const q = v => { const s = String(v == null ? '' : v); return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
      const corpo = [cab, ...linhas].map(l => l.map(q).join(';')).join('\n');
      const h = det.closest('.nl-painel') && det.closest('.nl-painel').querySelector('h2');
      NATIVE_DL.save({ filename: `dataluta_tabela_${usoSlug(h ? h.textContent : 'tabela')}.csv`, data: '﻿' + corpo + '\n\n' + q(usoFiltros()) + '\n' + q(USO_FONTE) + '\n' });
    };
    det.append(b);
  };
}

/* ---------- Como citar ---------- */
function usoCitacoes() {
  const hoje = new Date();
  const MESES = ['jan.', 'fev.', 'mar.', 'abr.', 'maio', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
  const acesso = (typeof IDIOMA !== 'undefined' && IDIOMA === 'es') ? hoje.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }) : `${hoje.getDate()} ${MESES[hoje.getMonth()]} ${hoje.getFullYear()}`;
  return [
    ['ABNT', `SOUZA, Wilians Ventura Ferreira et al. ${USO_TITULO}. 2026. Base de datos. Disponible en: ${USO_SITE}. Consultado el: ${acesso}.`],
    ['APA', `Souza, W. V. F., et al. (2026). ${USO_TITULO} [Base de datos]. ${USO_SITE}`],
    ['BibTeX', `@misc{dataluta2024,\n  author = {Souza, Wilians Ventura Ferreira and others},\n  title = {${USO_TITULO}},\n  year = {2026},\n  howpublished = {Base de datos},\n  url = {${USO_SITE}},\n  note = {Licencia CC BY 4.0}\n}`]
  ];
}
function usoCitar() {
  let dlg = $('usoCitar');
  if (!dlg) {
    dlg = el('dialog', 'uso-dlg'); dlg.id = 'usoCitar'; dlg.setAttribute('aria-labelledby', 'usoCitarT');
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
    document.body.append(dlg);
  }
  dlg.textContent = '';
  const fechar = el('button', 'fn-fechar', '×'); fechar.type = 'button'; fechar.setAttribute('aria-label', 'Cerrar'); fechar.onclick = () => dlg.close();
  const h = el('h2', null, 'Cómo citar la base'); h.id = 'usoCitarT';
  dlg.append(fechar, h, el('p', 'note', 'La base está bajo la licencia CC BY 4.0: puede usarse y adaptarse para cualquier fin, siempre que se cite la fuente. Al usar un gráfico descargado de aquí, mantenga la línea de fuente que viene en la imagen.'));
  usoCitacoes().forEach(([nome, texto]) => {
    const bloco = el('div', 'uso-cit');
    const cab = el('div', 'uso-cit-cab'); cab.append(el('b', null, nome));
    const msg = el('span', 'toast');
    const cp = el('button', 'uso-bt uso-bt-p', 'Copiar'); cp.type = 'button';
    cp.onclick = async () => { try { await navigator.clipboard.writeText(texto); msg.textContent = 'Copiado.'; } catch (e) { msg.textContent = 'Seleccione el texto y cópielo.'; } setTimeout(() => { msg.textContent = ''; }, 3000); };
    cab.append(cp, msg);
    bloco.append(cab, el('pre', null, texto));
    dlg.append(bloco);
  });
  const mais = el('p', 'note');
  const a = el('a', null, 'Licencias, fuentes de terceros y archivo de citación en GitHub'); a.href = 'https://github.com/wiliansventura98-collab/site-acoes/blob/main/LICENCAS.md'; a.target = '_blank'; a.rel = 'noopener';
  mais.append(a); dlg.append(mais);
  dlg.showModal();
}
