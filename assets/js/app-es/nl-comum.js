/* GERADO por i18n/ferramenta.js a partir de assets/js/app/nl-comum.js; não edite: edite o original e i18n/es.json */
var IDIOMA='es';
/*
 * Novas leituras (comum)
 * Infraestrutura dos painéis acrescentados em 30/10/2026 ao fim de algumas abas (funil, mapa de pontos,
 * cartograma, mapa de calor reordenado, perfil comparado, linha do tempo de notícias, margem de erro).
 * Nada do que já existia muda: cada painel é desenhado depois do render() original, só quando a sua aba
 * está aberta, e falhas num painel novo não interrompem o resto da base.
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

const NOVAS = {}; // NOVAS[aba] = [funções de desenho(b)]
function novaLeitura(aba, fn) { (NOVAS[aba] ||= []).push(fn); }
{
  const renderAnterior = render;
  render = function () {
    renderAnterior.apply(this, arguments);
    if (!HAS_D3) return;
    const b = base();
    (NOVAS[TAB] || []).forEach(fn => { try { fn(b); } catch (e) { console.warn('Nova leitura:', e); } });
  };
}

// cores seguras para daltonismo (Okabe-Ito, com um roxo no lugar do amarelo claro) e cinza para “Outras”
const NL_CORES = ['#0072B2', '#E69F00', '#009E73', '#CC79A7', '#56B4E9', '#D55E00', '#6B4C9A'];
const NL_OUTRAS = '#B8C2CC';

// cria (uma vez) o painel no fim da seção da aba e devolve as partes
function nlPainel(secId, id, titulo, intro) {
  let box = $(id);
  if (!box) {
    box = el('div', 'nl-painel'); box.id = id;
    const cab = el('div', 'sechead'); const h = el('h2', null, titulo); cab.append(h, el('span', 'nl-selo', 'Nueva lectura'));
    const p = el('p', 'note nl-intro', intro);
    const ctl = el('div', 'nl-ctl'); const leitura = el('p', 'nl-leitura');
    const ch = el('div', 'chart nl-chart'); const dados = el('details', 'nl-dados'); dados.append(el('summary', null, 'Ver los datos en una tabla'));
    const calc = el('details', 'calc nl-calc'); calc.append(el('summary', null, 'Cómo se calculó'));
    box.append(cab, p, ctl, leitura, ch, dados, calc);
    const sec = $(secId); (sec || document.body).append(box);
    box._ = { ctl, leitura, ch, dados, calc };
  }
  return box._;
}
// tabela simples dentro do <details> de dados
function nlTabela(det, cab, linhas) {
  det.querySelectorAll('table,.nl-vazio').forEach(n => n.remove());
  if (!linhas.length) { det.append(el('p', 'nl-vazio', 'Sin datos en este recorte.')); return; }
  const t = el('table', 'nl-tab'); const tr = el('tr'); cab.forEach(c => tr.append(el('th', null, c))); const th = el('thead'); th.append(tr); t.append(th);
  const tb = el('tbody'); linhas.forEach(l => { const r = el('tr'); l.forEach(c => r.append(el('td', null, c))); tb.append(r); }); t.append(tb); det.append(t);
}
function nlCalc(det, itens) { det.querySelectorAll('ul').forEach(n => n.remove()); const ul = el('ul'); itens.forEach(t => ul.append(el('li', null, t))); det.append(ul); }
// <select> de variável categórica (só as listadas), guardando a escolha em obj[chave]
function nlSelectVar(ctl, id, rotulo, opcoes, obj, chave) {
  let s = $(id);
  if (!s) {
    const lab = el('label', 'f', rotulo); lab.htmlFor = id; s = el('select'); s.id = id;
    opcoes.filter(v => VI[v] != null).forEach(v => { const o = el('option', null, VARS[VI[v]].label); o.value = v; s.append(o); });
    s.onchange = () => { obj[chave] = s.value; render(); };
    lab.append(s); ctl.append(lab);
  }
  s.value = obj[chave];
  return s;
}
// grupo de botões alternativos
function nlBotoes(ctl, id, opcoes, obj, chave) {
  let g = $(id);
  if (!g) {
    g = el('div', 'seg nl-seg'); g.id = id; g.setAttribute('role', 'group');
    opcoes.forEach(([v, rot]) => { const b = el('button', null, rot); b.type = 'button'; b.dataset.v = v; b.onclick = () => { obj[chave] = v; render(); }; g.append(b); });
    ctl.append(g);
  }
  g.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === obj[chave])));
}
// categorias principais de uma variável no recorte (sem “não informa”) e a categoria de cada notícia
function nlCategorias(rows, vid, n) {
  const v = VARS[VI[vid]], c = counts(rows, vid);
  const top = order(vid, c).filter(k => !ehSemInfo(v.values[k])).slice(0, n);
  const pos = new Map(top.map((k, i) => [k, i]));
  const catDe = r => { let melhor = -1; r.v[VI[vid]].forEach(k => { const p = pos.get(k); if (p != null && (melhor < 0 || p < melhor)) melhor = p; }); return melhor; };
  return { top, nomes: top.map(k => v.values[k]), catDe, cor: i => i < 0 ? NL_OUTRAS : NL_CORES[i % NL_CORES.length] };
}
// legenda em HTML; passar o mouse destaca a categoria
function nlLegenda(box, cats, alvo) {
  box.querySelectorAll('.nl-leg').forEach(n => n.remove());
  const lg = el('div', 'nl-leg');
  [...cats.nomes.map((n, i) => [n, i]), ['Otras y sin información', -1]].forEach(([n, i]) => {
    const it = el('span', 'nl-leg-it'); const sw = el('i'); sw.style.background = cats.cor(i); it.append(sw, document.createTextNode(n)); it.tabIndex = 0;
    const on = () => alvo && alvo.classed('nl-apagado', d => d.cat !== i), off = () => alvo && alvo.classed('nl-apagado', false);
    it.addEventListener('mouseenter', on); it.addEventListener('mouseleave', off); it.addEventListener('focus', on); it.addEventListener('blur', off);
    lg.append(it);
  });
  box.prepend(lg);
}
// limite de controle de Poisson com interpolação (Spiegelhalter, 2005): contínuo, para o funil não sair em degraus
function poissonLim(lambda, p) {
  if (lambda <= 0) return 0;
  let k = 0, termo = Math.exp(-lambda), F = termo, Fant = 0;
  if (termo === 0) { const z = p < 0.5 ? -nlZ(1 - p) : nlZ(p); return Math.max(0, lambda + z * Math.sqrt(lambda)); }
  while (F < p && k < 10000) { k++; termo *= lambda / k; Fant = F; F += termo; }
  const a = (F - p) / (F - Fant || 1);
  return Math.max(0, k - a);
}
// quantil de Poisson (menor k com P(X ≤ k) ≥ p)
function poissonQ(lambda, p) {
  if (lambda <= 0) return 0;
  let k = 0, termo = Math.exp(-lambda), soma = termo;
  if (termo === 0) { // λ grande: aproximação normal com correção de continuidade
    const z = p < 0.5 ? -nlZ(1 - p) : nlZ(p); return Math.max(0, Math.round(lambda + z * Math.sqrt(lambda)));
  }
  while (soma < p && k < 10000) { k++; termo *= lambda / k; soma += termo; }
  return k;
}
function nlZ(p) { // inversa da normal padrão (Acklam), p em (0,1)
  const a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924],
    b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857],
    c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878],
    d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742], pl = 0.02425;
  if (p < pl) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  if (p > 1 - pl) return -nlZ(1 - p);
  const q = p - 0.5, r = q * q; return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}
const nlPct = x => (x * 100).toLocaleString('es-AR', { maximumFractionDigits: 1 }) + '%';
const nlN1 = x => x.toLocaleString('es-AR', { maximumFractionDigits: 1 });
