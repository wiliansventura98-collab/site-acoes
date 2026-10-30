/*
 * Ficha da notícia
 * Acrescenta à base uma ficha para cada notícia, com link próprio (#…&noticia=CÓDIGO): tudo o que foi codificado,
 * agrupado como na planilha, a localização num mapa pequeno, notícias parecidas e botões para abrir a notícia
 * original, copiar o link e sugerir uma correção. Não muda nada do que já existia: a lista de notícias ganha
 * um botão “Ficha” em cada linha, e o endereço ganha o parâmetro “noticia” só enquanto a ficha está aberta.
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

const REPO_ISSUES = 'https://github.com/wiliansventura98-collab/site-acoes/issues/new';
const POR_CODIGO = new Map(ROWS.map(r => [r.codigo, r]));
let NOTICIA_ABERTA = null;

// link para sugerir uma correção (formulário do GitHub com campos já preenchidos)
function linkCorrecao(r) {
  const p = new URLSearchParams({ template: 'correcao.yml' });
  if (r) { p.set('title', 'Correção: ' + r.codigo); p.set('codigo', r.codigo); p.set('titulo_noticia', r.titulo || ''); }
  else p.set('title', 'Notícia que faltou na base');
  return REPO_ISSUES + '?' + p.toString();
}

// notícias parecidas: mais categorias em comum nas variáveis centrais; empate → data mais próxima
const VARS_PARECIDAS = [['nombremov', 3], ['tipomov', 2], ['objetivos', 2], ['matriz', 1], ['derivada', 1], ['localidad', 2], ['provincia', 1]];
function parecidas(r, n = 5) {
  const dia = s => { const m = /^(\d{4})(\d\d)(\d\d)$/.exec(s); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) / 864e5 : 0; };
  const d0 = dia(r.sort);
  return ROWS.filter(o => o !== r && !o.rep).map(o => {
    let s = 0; const em = [];
    VARS_PARECIDAS.forEach(([vid, w]) => { const i = VI[vid]; if (i == null) return;
      const comuns = o.v[i].filter(x => r.v[i].includes(x)); if (comuns.length) { s += w * comuns.length; em.push(vid); } });
    return { o, s, dd: Math.abs(dia(o.sort) - d0), em };
  }).filter(x => x.s >= 3).sort((a, b) => b.s - a.s || a.dd - b.dd).slice(0, n);
}

// mapa pequeno: contorno das províncias e o(s) ponto(s) das localidades citadas
function miniMapa(r) {
  if (typeof d3 === 'undefined' || typeof topojson === 'undefined' || !window.__GEO__) return null;
  const G = window.__GEO__, obj = G.deptos.objects[Object.keys(G.deptos.objects)[0]];
  const pts = r.v[VI.localidad].map(x => VARS[VI.localidad].values[x]).filter(n => G.coords[n]).map(n => ({ n, c: G.coords[n] }));
  const W = 150, H = 300;
  const terra = topojson.feature(G.deptos, obj);
  const pr = d3.geoConicConformal().parallels([-28, -46]).rotate([64, 0]).fitSize([W - 8, H - 8], terra);
  const path = d3.geoPath(pr);
  const svg = d3.create('svg').attr('viewBox', `-4 -4 ${W} ${H}`).attr('class', 'fn-mapa').attr('role', 'img')
    .attr('aria-label', pts.length ? 'Localização: ' + pts.map(p => p.n).join(', ') : 'Sem localidade no mapa');
  svg.append('path').attr('d', path(topojson.merge(G.deptos, obj.geometries))).attr('class', 'fn-terra');
  svg.append('path').attr('d', path(topojson.mesh(G.deptos, obj, (a, b) => a !== b && a.properties.p !== b.properties.p))).attr('class', 'fn-divisa');
  pts.forEach(p => { const [x, y] = pr(p.c); svg.append('circle').attr('cx', x).attr('cy', y).attr('r', 5).attr('class', 'fn-ponto'); });
  return { svg: svg.node(), n: pts.length };
}

function abrirNoticia(codigo, { semHistorico } = {}) {
  const r = POR_CODIGO.get(codigo); if (!r) return;
  NOTICIA_ABERTA = codigo;
  let dlg = $('fichaNoticia');
  if (!dlg) {
    dlg = el('dialog', 'fn'); dlg.id = 'fichaNoticia'; dlg.setAttribute('aria-labelledby', 'fnTitulo');
    dlg.addEventListener('close', () => { NOTICIA_ABERTA = null; urlSync(); });
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
    document.body.append(dlg);
  }
  dlg.textContent = '';
  const fechar = el('button', 'fn-fechar', '×'); fechar.type = 'button'; fechar.title = 'Fechar a ficha'; fechar.setAttribute('aria-label', 'Fechar a ficha'); fechar.onclick = () => dlg.close();
  const cab = el('header', 'fn-cab');
  cab.append(el('p', 'fn-kicker', 'Ficha da notícia · ' + r.codigo + (r.rep ? ' · repetida' : '')));
  const h = el('h2', null, r.titulo || '(sem título)'); h.id = 'fnTitulo'; cab.append(h);
  const datas = [['Data da notícia', r.fecha], ['Início da ação', r.ini], ['Fim da ação', r.fin !== r.ini ? r.fin : '']].filter(x => x[1]);
  cab.append(el('p', 'fn-meta', [r.fonte, ...datas.map(([k, v]) => k + ': ' + v)].filter(Boolean).join(' · ')));
  const acoes = el('div', 'fn-acoes');
  if (/^https?:\/\//.test(r.link)) { const a = el('a', 'btn', 'Abrir a notícia original ↗'); a.href = r.link; a.target = '_blank'; a.rel = 'noopener'; acoes.append(a); }
  const cp = el('button', 'btn', 'Copiar o link desta ficha'); cp.type = 'button';
  const msg = el('span', 'toast');
  cp.onclick = async () => { urlSync(); try { await navigator.clipboard.writeText(location.href); msg.textContent = 'Link copiado.'; } catch (e) { msg.textContent = 'Copie o endereço da barra do navegador.'; } setTimeout(() => { msg.textContent = ''; }, 3500); };
  const cor = el('a', 'btn fn-primario', 'Sugerir uma correção'); cor.href = linkCorrecao(r); cor.target = '_blank'; cor.rel = 'noopener';
  cor.title = 'Abre um formulário no GitHub (é preciso ter uma conta) com o código desta notícia já preenchido';
  acoes.append(cp, cor, msg); cab.append(acoes);

  const corpo = el('div', 'fn-corpo');
  const campos = el('div', 'fn-campos');
  const grupos = {};
  VARS.forEach((v, i) => { const vals = r.v[i].map(x => v.values[x]).filter(Boolean); if (!vals.length) return; (grupos[v.group] ||= []).push([v, vals]); });
  for (const g in grupos) {
    const sec = el('section', 'fn-grupo'); sec.append(el('h3', null, g));
    const dl = el('dl');
    grupos[g].forEach(([v, vals]) => { dl.append(el('dt', null, v.label)); const dd = el('dd'); vals.forEach((t, j) => { if (j) dd.append(document.createTextNode(' · ')); dd.append(el('span', 'fn-val', t)); }); dl.append(dd); });
    sec.append(dl); campos.append(sec);
  }
  const lado = el('aside', 'fn-lado');
  const mm = miniMapa(r);
  if (mm) { lado.append(el('h3', null, 'Onde')); lado.append(mm.svg); if (!mm.n) lado.append(el('p', 'fn-nota', 'Notícia sem localidade no mapa (nacional, virtual ou sem referência espacial).')); }
  const par = parecidas(r);
  if (par.length) {
    lado.append(el('h3', null, 'Notícias parecidas'));
    const ul = el('ul', 'fn-parecidas');
    par.forEach(({ o, em }) => { const li = el('li'); const b = el('button', 'fn-link', o.titulo || o.codigo); b.type = 'button'; b.onclick = () => abrirNoticia(o.codigo);
      li.append(b, el('span', 'fn-nota', (o.ini || o.fecha) + ' · em comum: ' + em.map(vid => VARS[VI[vid]].label.toLowerCase()).join(', '))); ul.append(li); });
    lado.append(ul);
    lado.append(el('p', 'fn-nota', 'Parecidas = mais categorias em comum (organização, tipo de movimento, objetivos, ação, lugar); empate desfeito pela data mais próxima.'));
  }
  corpo.append(campos, lado);
  dlg.append(fechar, cab, corpo);
  if (!dlg.open) { try { dlg.showModal(); } catch (e) { dlg.setAttribute('open', ''); } }
  dlg.scrollTop = 0;
  if (!semHistorico) urlSync();
}

// o endereço guarda a ficha aberta: acrescenta “noticia=…” ao que estado.js já escreve
{
  const urlSyncOriginal = urlSync;
  urlSync = function () {
    urlSyncOriginal();
    if (!NOTICIA_ABERTA) return;
    const h = location.hash || '#', i = h.indexOf('?');
    const p = new URLSearchParams(i < 0 ? '' : h.slice(i + 1)); p.set('noticia', NOTICIA_ABERTA);
    const novo = (i < 0 ? h : h.slice(0, i)) + '?' + p.toString();
    if (location.hash !== novo) { try { history.replaceState(null, '', novo); } catch (e) {} }
  };
}

// cada linha da lista de notícias ganha um botão “Ficha” (a lista em si continua igual)
{
  const renderNewsOriginal = renderNews;
  renderNews = function (rows) {
    renderNewsOriginal(rows);
    document.querySelectorAll('#newsBody tr').forEach((tr, i) => {
      const r = current[i], t = tr.querySelector('td.t'); if (!r || !t || t.querySelector('.fn-abrir')) return;
      const b = el('button', 'fn-abrir', 'Ficha'); b.type = 'button'; b.title = 'Abrir a ficha completa desta notícia';
      b.onclick = () => abrirNoticia(r.codigo); t.append(b);
    });
  };
}

// quadro “Encontrou um erro? Falta alguma notícia?” logo acima da lista de notícias
{
  const sec = $('newsSec');
  if (sec) {
    const box = el('aside', 'fn-contribuir'); box.setAttribute('aria-label', 'Sugestões e correções');
    const txt = el('div');
    txt.append(el('b', null, 'Encontrou um erro ou falta alguma notícia?'),
      el('span', null, 'Envie uma sugestão: a equipe revisa antes de mudar a base. Para corrigir uma notícia específica, abra a ficha dela (botão “Ficha”) e use “Sugerir uma correção”, que já leva o código.'));
    const bts = el('div', 'fn-contribuir-bts');
    const b1 = el('a', 'btn fn-primario', 'Apontar um erro'); b1.href = REPO_ISSUES + '?template=correcao.yml&title=' + encodeURIComponent('Correção: ');
    const b2 = el('a', 'btn', 'Sugerir notícia que faltou'); b2.href = linkCorrecao(null);
    [b1, b2].forEach(a => { a.target = '_blank'; a.rel = 'noopener'; });
    bts.append(b1, b2);
    box.append(txt, bts);
    const head = sec.querySelector('.sechead');
    if (head) head.after(box); else sec.prepend(box);
  }
}

// abre a ficha pedida no endereço (#…&noticia=CÓDIGO) e acompanha mudanças do endereço
function lerNoticiaDoEndereco() {
  const h = location.hash || '', i = h.indexOf('?'); if (i < 0) return;
  const c = new URLSearchParams(h.slice(i + 1)).get('noticia');
  if (c && c !== NOTICIA_ABERTA && POR_CODIGO.has(c)) abrirNoticia(c, { semHistorico: true });
}
window.addEventListener('hashchange', lerNoticiaDoEndereco);
setTimeout(lerNoticiaDoEndereco, 0);
