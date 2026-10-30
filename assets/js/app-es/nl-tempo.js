/* GERADO por i18n/ferramenta.js a partir de assets/js/app/nl-tempo.js; não edite: edite o original e i18n/es.json */
var IDIOMA='es';
/*
 * Novas leituras: linha do tempo de notícias (aba No tempo) e margem de erro (aba Comparar)
 * 1) Cada notícia é um ponto, empilhado na semana em que a ação começou e colorido pela categoria principal
 *    da variável escolhida, com os acontecimentos de 2024 marcados. Clique abre a ficha da notícia.
 * 2) A diferença entre os grupos A e B da aba Comparar, categoria por categoria, com intervalo de 95%.
 */
const LINHA = { v: 'tipomov' };
novaLeitura('time', function desenharLinha(b) {
  const P = nlPainel('timeSec', 'nlLinha', 'Línea de tiempo: cada noticia, semana a semana',
    'Cada punto es una noticia, en la semana en que comenzó la acción, con el color de su categoría. La serie semanal de arriba muestra el volumen; aquí aparecen los casos. Pase el mouse para ver la noticia y haga clic para abrir la ficha.');
  nlSelectVar(P.ctl, 'nlLinhaV', 'Color de los puntos', NL_VARS_COR, LINHA, 'v');
  const rows = b.filter(r => match(r, null));
  const cats = nlCategorias(rows, LINHA.v, 7);
  const dia = s => { const m = /^(2024)(\d\d)(\d\d)$/.exec(s); return m ? Math.floor((Date.UTC(2024, +m[2] - 1, +m[3]) - Date.UTC(2024, 0, 1)) / 864e5) + 1 : null; };
  const pts = rows.map(r => ({ r, d: dia(r.sort), cat: cats.catDe(r) })).filter(p => p.d);
  const box = P.ch; box.querySelectorAll('svg').forEach(s => s.remove());
  const sem = d3.groups(pts, p => Math.floor((p.d - 1) / 7));
  const W = Math.max(700, box.clientWidth || 1100), ml = 30, mr = 14, cols = 53, cw = (W - ml - mr) / cols;
  const porLinha = 3, passo = cw / porLinha, raio = Math.max(1.6, passo / 2 - .5);
  const maxN = d3.max(sem, s => s[1].length) || 1, alt = Math.ceil(maxN / porLinha) * passo;
  const mt = 64, H = mt + alt + 34;
  const svg = d3.select(box).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('role', 'img').attr('aria-label', 'Línea de tiempo de las noticias de 2024, una por punto');
  const base0 = mt + alt;
  // meses
  const INI = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  INI.forEach((d, m) => { const x = ml + d / 7 * cw; svg.append('line').attr('x1', x).attr('x2', x).attr('y1', mt - 6).attr('y2', base0 + 4).attr('stroke', '#e3e9f0');
    svg.append('text').attr('x', x + 3).attr('y', base0 + 20).attr('class', 'nl-mapa-rot').text(MES[m]); });
  svg.append('line').attr('x1', ml).attr('x2', W - mr).attr('y1', base0 + .5).attr('y2', base0 + .5).attr('stroke', '#9fb2c8');
  // acontecimentos
  const tip = tipFor(box);
  (window.__GEO__.eventos || []).forEach((e, n) => { const d = dia(e.data.replace(/-/g, '')); if (!d) return; const x = ml + (d - 1) / 7 * cw;
    svg.append('line').attr('x1', x).attr('x2', x).attr('y1', 22).attr('y2', base0).attr('stroke', '#6b7c93').attr('stroke-dasharray', '2 3');
    const g = svg.append('g').attr('transform', `translate(${x},${14 + (n % 2) * 18})`).style('cursor', 'default')
      .on('mousemove', ev => tip.show(ev, e.nome, [e.data.split('-').reverse().join('/')])).on('mouseleave', () => tip.hide());
    g.append('circle').attr('r', 8).attr('fill', '#13294b'); g.append('text').attr('text-anchor', 'middle').attr('dy', '.35em').attr('class', 'nl-ev-n').text(n + 1); });
  const dados = [];
  sem.forEach(([w, ps]) => { ps.sort((a, b2) => (a.cat < 0 ? 99 : a.cat) - (b2.cat < 0 ? 99 : b2.cat) || a.d - b2.d);
    ps.forEach((p, k) => dados.push({ ...p, x: ml + w * cw + (k % porLinha) * passo + passo / 2, y: base0 - Math.floor(k / porLinha) * passo - passo / 2 })); });
  const sel = svg.append('g').selectAll('circle').data(dados).join('circle').attr('cx', d => d.x).attr('cy', d => d.y).attr('r', raio).attr('fill', d => cats.cor(d.cat)).style('cursor', 'pointer')
    .on('mousemove', (e, d) => tip.show(e, d.r.titulo || d.r.codigo, [`${d.r.ini || d.r.fecha} · ${d.r.fonte}`, d.cat >= 0 ? cats.nomes[d.cat] : 'Otras categorías o sin información', 'Haga clic para abrir la ficha de la noticia']))
    .on('mouseleave', () => tip.hide()).on('click', (e, d) => abrirNoticia(d.r.codigo));
  nlLegenda(box, cats, sel);
  const top = sem.slice().sort((a, b2) => b2[1].length - a[1].length).slice(0, 3);
  const dataSem = w => { const t = new Date(Date.UTC(2024, 0, 1 + w * 7)); return t.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' }); };
  P.leitura.textContent = `${fmt(pts.length)} noticias con fecha de 2024 en el recorte. Las semanas con más noticias comienzan el ${top.map(([w, ps]) => `${dataSem(w)} (${fmt(ps.length)})`).join(', ')}. Los círculos numerados arriba son los acontecimientos de 2024 (pase el mouse para ver el nombre).`;
  nlTabela(P.dados, ['Semana (inicio)', 'Noticias', ...cats.nomes, 'Otras'], sem.slice().sort((a, b2) => a[0] - b2[0]).map(([w, ps]) => {
    const c = d3.rollup(ps, v => v.length, p => p.cat); return [dataSem(w), fmt(ps.length), ...[...cats.top.keys(), -1].map(i => fmt(c.get(i) || 0))]; }));
  nlCalc(P.calc, [
    'Fecha de cada noticia: inicio de la acción; a falta de ella, fecha de publicación. Semanas de lunes a domingo, a partir del 1/1/2024.',
    'En cada semana, los puntos se apilan en columnas de tres, agrupados por color; la altura de la pila es el número de noticias de la semana.',
    'Color = la categoría de la noticia entre las 7 más frecuentes en el recorte (cuando tiene varias, vale la más frecuente); las demás en gris.']);
});

novaLeitura('cmp', function desenharMargem(b) {
  const P = nlPainel('cmpSec', 'nlMargem', 'Margen de error: las diferencias entre A y B con intervalo del 95%',
    'La diferencia del gráfico de arriba (A − B, en puntos porcentuales) con su margen de error. Cuando la línea cruza el cero, la diferencia puede ser azar; cuando queda toda de un lado, es significativa.');
  const box = P.ch; box.querySelectorAll('svg,.nl-vazio-c').forEach(s => s.remove());
  if (typeof CMP === 'undefined' || VI[CMP.av] == null || VI[CMP.y] == null || CMP.y === CMP.av) { box.append(el('p', 'nl-vazio-c', 'Elija dos grupos y una variable diferente para comparar.')); return; }
  const iv = VI[CMP.av], v = VARS[iv], rows = b.filter(r => match(r, [CMP.av]));
  const temA = r => r.v[iv].includes(CMP.ak), temB = CMP.bk === 'resto' ? (r => !temA(r) && r.v[iv].some(k => !ehSemInfo(v.values[k]))) : (r => r.v[iv].includes(+CMP.bk));
  const A = rows.filter(temA), B = rows.filter(temB);
  const nomeA = v.values[CMP.ak], nomeB = CMP.bk === 'resto' ? 'demás categorías' : v.values[+CMP.bk];
  if (A.length < 3 || B.length < 3) { box.append(el('p', 'nl-vazio-c', 'Los grupos tienen pocas noticias para calcular el margen de error.')); return; }
  const iy = VI[CMP.y], vy = VARS[iy], ca = counts(A, CMP.y), cb = counts(B, CMP.y);
  const ls = [...new Set([...ca.keys(), ...cb.keys()])].filter(k => !ehSemInfo(vy.values[k])).map(k => {
    const a = ca.get(k) || 0, bb = cb.get(k) || 0, pa = a / A.length, pb = bb / B.length, d = pa - pb;
    const pp = (a + bb) / (A.length + B.length), se = Math.sqrt(pp * (1 - pp) * (1 / A.length + 1 / B.length)); // o mesmo erro-padrão do teste z do gráfico acima
    return { k, nome: vy.values[k], a, b: bb, pa, pb, d, lo: d - 1.96 * se, hi: d + 1.96 * se };
  }).sort((p, q) => (q.a + q.b) - (p.a + p.b)).slice(0, 18).sort((p, q) => q.d - p.d);
  const W = Math.max(360, box.clientWidth || 900), lab = Math.min(300, W * 0.36), m = { t: 26, r: 30, b: 34, l: lab + 12 }, rowH = 24, H = m.t + m.b + ls.length * rowH;
  const ext = Math.max(0.05, d3.max(ls, l => Math.max(Math.abs(l.lo), Math.abs(l.hi))));
  const x = d3.scaleLinear().domain([-ext, ext]).nice().range([m.l, W - m.r]);
  const svg = d3.select(box).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('role', 'img').attr('aria-label', `Diferencia entre ${nomeA} e ${nomeB} con intervalo del 95%`);
  svg.append('g').attr('class', 'grid').selectAll('line').data(x.ticks(6)).join('line').attr('x1', d => x(d)).attr('x2', d => x(d)).attr('y1', m.t - 6).attr('y2', H - m.b);
  svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(6).tickFormat(d => (d > 0 ? '+' : d < 0 ? '−' : '') + Math.round(Math.abs(d) * 100) + ' p.p.')).call(g => g.select('.domain').remove());
  svg.append('line').attr('x1', x(0)).attr('x2', x(0)).attr('y1', m.t - 10).attr('y2', H - m.b).attr('stroke', '#13294b').attr('stroke-width', 1.2);
  svg.append('text').attr('x', x(0) - 6).attr('y', m.t - 12).attr('text-anchor', 'end').attr('class', 'nl-mapa-rot').text(`← más en ${nomeB.length > 26 ? nomeB.slice(0, 25) + '…' : nomeB}`);
  svg.append('text').attr('x', x(0) + 6).attr('y', m.t - 12).attr('class', 'nl-mapa-rot').text(`más en ${nomeA.length > 26 ? nomeA.slice(0, 25) + '…' : nomeA} →`);
  const tip = tipFor(box), sig = l => l.lo > 0 || l.hi < 0;
  const g = svg.append('g').selectAll('g').data(ls).join('g').attr('transform', (d, i) => `translate(0,${m.t + i * rowH + rowH / 2})`)
    .on('mousemove', (e, d) => tip.show(e, d.nome, [`${nomeA}: ${nlPct(d.pa)} · ${nomeB}: ${nlPct(d.pb)}`, `Diferencia: ${d.d >= 0 ? '+' : '−'}${nlN1(Math.abs(d.d) * 100)} p.p.`, `Intervalo del 95%: ${nlN1(d.lo * 100)} a ${nlN1(d.hi * 100)} p.p.`, sig(d) ? 'Significativa: el intervalo no cruza el cero' : 'No significativa: el intervalo cruza el cero']))
    .on('mouseleave', () => tip.hide());
  g.append('text').attr('x', m.l - 10).attr('dy', '.35em').attr('text-anchor', 'end').attr('class', 'nl-mapa-rot').text(d => d.nome.length > 40 ? d.nome.slice(0, 39) + '…' : d.nome);
  g.append('line').attr('x1', d => x(d.lo)).attr('x2', d => x(d.hi)).attr('stroke', d => sig(d) ? (d.d > 0 ? '#0B5EA8' : '#C2410C') : '#a8b4c2').attr('stroke-width', 2.2).attr('stroke-linecap', 'round');
  g.append('circle').attr('cx', d => x(d.d)).attr('r', 5).attr('fill', d => sig(d) ? (d.d > 0 ? '#0B5EA8' : '#C2410C') : '#fff').attr('stroke', d => sig(d) ? '#fff' : '#7d8a99').attr('stroke-width', 1.5);
  const s = ls.filter(sig);
  P.leitura.textContent = `${fmt(s.length)} de ${fmt(ls.length)} diferencias entre ${nomeA} (${fmt(A.length)} noticias) y ${nomeB} (${fmt(B.length)}) quedan enteramente de un lado del cero. ` +
    (s.length ? `La mayor: ${s.slice().sort((a, b2) => Math.abs(b2.d) - Math.abs(a.d))[0].nome} (${nlN1(Math.abs(s.slice().sort((a, b2) => Math.abs(b2.d) - Math.abs(a.d))[0].d) * 100)} p.p.).` : 'Con estos grupos, ninguna diferencia se separa claramente del azar.');
  nlTabela(P.dados, ['Categoría', nomeA, nomeB, 'Diferencia (p.p.)', 'IC 95% (p.p.)'], ls.map(l => [l.nome, nlPct(l.pa), nlPct(l.pb), nlN1(l.d * 100), `${nlN1(l.lo * 100)} a ${nlN1(l.hi * 100)}`]));
  nlCalc(P.calc, [
    'Diferencia = porcentaje de noticias del grupo A con la categoría − el mismo porcentaje en el grupo B.',
    'Intervalo del 95%: diferencia ± 1,96 × error estándar, con el error estándar combinado √(p(1 − p)(1/nA + 1/nB)), donde p es la proporción en los dos grupos juntos. Es el mismo error estándar de la prueba z del gráfico de arriba, por eso el intervalo cruza el cero exactamente cuando la diferencia no es significativa (los asteriscos coinciden).',
    'Punto lleno y línea de color: el intervalo no cruza el cero (diferencia significativa al 5%). Punto hueco y línea gris: puede ser azar.',
    'Con pocas noticias en una categoría, el intervalo es aproximado; lea las categorías pequeñas con cautela.']);
});
