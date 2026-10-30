/*
 * Novas leituras: linha do tempo de notícias (aba No tempo) e margem de erro (aba Comparar)
 * 1) Cada notícia é um ponto, empilhado na semana em que a ação começou e colorido pela categoria principal
 *    da variável escolhida, com os acontecimentos de 2024 marcados. Clique abre a ficha da notícia.
 * 2) A diferença entre os grupos A e B da aba Comparar, categoria por categoria, com intervalo de 95%.
 */
const LINHA = { v: 'tipomov' };
novaLeitura('time', function desenharLinha(b) {
  const P = nlPainel('timeSec', 'nlLinha', 'Linha do tempo: cada notícia, semana a semana',
    'Cada ponto é uma notícia, na semana em que a ação começou, com a cor da sua categoria. A série semanal acima mostra o volume; aqui aparecem os casos. Passe o mouse para ver a notícia e clique para abrir a ficha.');
  nlSelectVar(P.ctl, 'nlLinhaV', 'Cor dos pontos', NL_VARS_COR, LINHA, 'v');
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
  const svg = d3.select(box).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('role', 'img').attr('aria-label', 'Linha do tempo das notícias de 2024, uma por ponto');
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
    .on('mousemove', (e, d) => tip.show(e, d.r.titulo || d.r.codigo, [`${d.r.ini || d.r.fecha} · ${d.r.fonte}`, d.cat >= 0 ? cats.nomes[d.cat] : 'Outras categorias ou sem informação', 'Clique para abrir a ficha da notícia']))
    .on('mouseleave', () => tip.hide()).on('click', (e, d) => abrirNoticia(d.r.codigo));
  nlLegenda(box, cats, sel);
  const top = sem.slice().sort((a, b2) => b2[1].length - a[1].length).slice(0, 3);
  const dataSem = w => { const t = new Date(Date.UTC(2024, 0, 1 + w * 7)); return t.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' }); };
  P.leitura.textContent = `${fmt(pts.length)} notícias com data de 2024 no recorte. As semanas com mais notícias começam em ${top.map(([w, ps]) => `${dataSem(w)} (${fmt(ps.length)})`).join(', ')}. Os círculos numerados no alto são os acontecimentos de 2024 (passe o mouse para ver o nome).`;
  nlTabela(P.dados, ['Semana (início)', 'Notícias', ...cats.nomes, 'Outras'], sem.slice().sort((a, b2) => a[0] - b2[0]).map(([w, ps]) => {
    const c = d3.rollup(ps, v => v.length, p => p.cat); return [dataSem(w), fmt(ps.length), ...[...cats.top.keys(), -1].map(i => fmt(c.get(i) || 0))]; }));
  nlCalc(P.calc, [
    'Data de cada notícia: início da ação; na falta dela, data da publicação. Semanas de segunda a domingo, a partir de 1º/1/2024.',
    'Em cada semana, os pontos se empilham em colunas de três, agrupados pela cor; a altura da pilha é o número de notícias da semana.',
    'Cor = a categoria da notícia entre as 7 mais frequentes no recorte (quando tem várias, vale a mais frequente); as demais em cinza.']);
});

novaLeitura('cmp', function desenharMargem(b) {
  const P = nlPainel('cmpSec', 'nlMargem', 'Margem de erro: as diferenças entre A e B com intervalo de 95%',
    'A diferença do gráfico acima (A − B, em pontos percentuais) com a sua margem de erro. Quando a linha cruza o zero, a diferença pode ser acaso; quando fica toda de um lado, é significativa.');
  const box = P.ch; box.querySelectorAll('svg,.nl-vazio-c').forEach(s => s.remove());
  if (typeof CMP === 'undefined' || VI[CMP.av] == null || VI[CMP.y] == null || CMP.y === CMP.av) { box.append(el('p', 'nl-vazio-c', 'Escolha dois grupos e uma variável diferente para comparar.')); return; }
  const iv = VI[CMP.av], v = VARS[iv], rows = b.filter(r => match(r, [CMP.av]));
  const temA = r => r.v[iv].includes(CMP.ak), temB = CMP.bk === 'resto' ? (r => !temA(r) && r.v[iv].some(k => !ehSemInfo(v.values[k]))) : (r => r.v[iv].includes(+CMP.bk));
  const A = rows.filter(temA), B = rows.filter(temB);
  const nomeA = v.values[CMP.ak], nomeB = CMP.bk === 'resto' ? 'demais categorias' : v.values[+CMP.bk];
  if (A.length < 3 || B.length < 3) { box.append(el('p', 'nl-vazio-c', 'Os grupos têm poucas notícias para calcular a margem de erro.')); return; }
  const iy = VI[CMP.y], vy = VARS[iy], ca = counts(A, CMP.y), cb = counts(B, CMP.y);
  const ls = [...new Set([...ca.keys(), ...cb.keys()])].filter(k => !ehSemInfo(vy.values[k])).map(k => {
    const a = ca.get(k) || 0, bb = cb.get(k) || 0, pa = a / A.length, pb = bb / B.length, d = pa - pb;
    const pp = (a + bb) / (A.length + B.length), se = Math.sqrt(pp * (1 - pp) * (1 / A.length + 1 / B.length)); // o mesmo erro-padrão do teste z do gráfico acima
    return { k, nome: vy.values[k], a, b: bb, pa, pb, d, lo: d - 1.96 * se, hi: d + 1.96 * se };
  }).sort((p, q) => (q.a + q.b) - (p.a + p.b)).slice(0, 18).sort((p, q) => q.d - p.d);
  const W = Math.max(360, box.clientWidth || 900), lab = Math.min(300, W * 0.36), m = { t: 26, r: 30, b: 34, l: lab + 12 }, rowH = 24, H = m.t + m.b + ls.length * rowH;
  const ext = Math.max(0.05, d3.max(ls, l => Math.max(Math.abs(l.lo), Math.abs(l.hi))));
  const x = d3.scaleLinear().domain([-ext, ext]).nice().range([m.l, W - m.r]);
  const svg = d3.select(box).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('role', 'img').attr('aria-label', `Diferença entre ${nomeA} e ${nomeB} com intervalo de 95%`);
  svg.append('g').attr('class', 'grid').selectAll('line').data(x.ticks(6)).join('line').attr('x1', d => x(d)).attr('x2', d => x(d)).attr('y1', m.t - 6).attr('y2', H - m.b);
  svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(6).tickFormat(d => (d > 0 ? '+' : d < 0 ? '−' : '') + Math.round(Math.abs(d) * 100) + ' p.p.')).call(g => g.select('.domain').remove());
  svg.append('line').attr('x1', x(0)).attr('x2', x(0)).attr('y1', m.t - 10).attr('y2', H - m.b).attr('stroke', '#13294b').attr('stroke-width', 1.2);
  svg.append('text').attr('x', x(0) - 6).attr('y', m.t - 12).attr('text-anchor', 'end').attr('class', 'nl-mapa-rot').text(`← mais em ${nomeB.length > 26 ? nomeB.slice(0, 25) + '…' : nomeB}`);
  svg.append('text').attr('x', x(0) + 6).attr('y', m.t - 12).attr('class', 'nl-mapa-rot').text(`mais em ${nomeA.length > 26 ? nomeA.slice(0, 25) + '…' : nomeA} →`);
  const tip = tipFor(box), sig = l => l.lo > 0 || l.hi < 0;
  const g = svg.append('g').selectAll('g').data(ls).join('g').attr('transform', (d, i) => `translate(0,${m.t + i * rowH + rowH / 2})`)
    .on('mousemove', (e, d) => tip.show(e, d.nome, [`${nomeA}: ${nlPct(d.pa)} · ${nomeB}: ${nlPct(d.pb)}`, `Diferença: ${d.d >= 0 ? '+' : '−'}${nlN1(Math.abs(d.d) * 100)} p.p.`, `Intervalo de 95%: ${nlN1(d.lo * 100)} a ${nlN1(d.hi * 100)} p.p.`, sig(d) ? 'Significativa: o intervalo não cruza o zero' : 'Não significativa: o intervalo cruza o zero']))
    .on('mouseleave', () => tip.hide());
  g.append('text').attr('x', m.l - 10).attr('dy', '.35em').attr('text-anchor', 'end').attr('class', 'nl-mapa-rot').text(d => d.nome.length > 40 ? d.nome.slice(0, 39) + '…' : d.nome);
  g.append('line').attr('x1', d => x(d.lo)).attr('x2', d => x(d.hi)).attr('stroke', d => sig(d) ? (d.d > 0 ? '#0B5EA8' : '#C2410C') : '#a8b4c2').attr('stroke-width', 2.2).attr('stroke-linecap', 'round');
  g.append('circle').attr('cx', d => x(d.d)).attr('r', 5).attr('fill', d => sig(d) ? (d.d > 0 ? '#0B5EA8' : '#C2410C') : '#fff').attr('stroke', d => sig(d) ? '#fff' : '#7d8a99').attr('stroke-width', 1.5);
  const s = ls.filter(sig);
  P.leitura.textContent = `${fmt(s.length)} de ${fmt(ls.length)} diferenças entre ${nomeA} (${fmt(A.length)} notícias) e ${nomeB} (${fmt(B.length)}) ficam inteiramente de um lado do zero. ` +
    (s.length ? `A maior: ${s.slice().sort((a, b2) => Math.abs(b2.d) - Math.abs(a.d))[0].nome} (${nlN1(Math.abs(s.slice().sort((a, b2) => Math.abs(b2.d) - Math.abs(a.d))[0].d) * 100)} p.p.).` : 'Com estes grupos, nenhuma diferença se separa claramente do acaso.');
  nlTabela(P.dados, ['Categoria', nomeA, nomeB, 'Diferença (p.p.)', 'IC 95% (p.p.)'], ls.map(l => [l.nome, nlPct(l.pa), nlPct(l.pb), nlN1(l.d * 100), `${nlN1(l.lo * 100)} a ${nlN1(l.hi * 100)}`]));
  nlCalc(P.calc, [
    'Diferença = porcentagem de notícias do grupo A com a categoria − a mesma porcentagem no grupo B.',
    'Intervalo de 95%: diferença ± 1,96 × erro-padrão, com o erro-padrão combinado √(p(1 − p)(1/nA + 1/nB)), em que p é a proporção nos dois grupos juntos. É o mesmo erro-padrão do teste z do gráfico acima, por isso o intervalo cruza o zero exatamente quando a diferença não é significativa (os asteriscos coincidem).',
    'Ponto cheio e linha colorida: o intervalo não cruza o zero (diferença significativa a 5%). Ponto vazado e linha cinza: pode ser acaso.',
    'Com poucas notícias numa categoria, o intervalo é aproximado; leia as categorias pequenas com cautela.']);
});
