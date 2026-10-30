/*
 * Nova leitura: gráfico de funil (aba Contexto)
 * Cada ponto é uma província (ou departamento): no eixo horizontal, a população; no vertical, as notícias por
 * 100 mil habitantes. A linha do meio é a taxa do país; as faixas mostram até onde a taxa de um lugar daquele
 * tamanho pode ir só por acaso (Poisson, 95% e 99,8%). Lugares fora do funil têm mais (ou menos) notícias do que
 * o acaso explicaria. Evita o ranking de taxas, em que lugares pequenos sobem ou descem por puro acaso.
 */
const FUNIL = { u: 'prov' };
novaLeitura('ctx', function desenharFunil(b) {
  const P = nlPainel('ctxSec', 'nlFunil', 'Funil: quem está de fato acima ou abaixo da média?',
    'Cada ponto é um lugar, com a população no eixo horizontal e as notícias por 100 mil habitantes no vertical. Dentro do funil, a diferença em relação à média do país pode ser só acaso; fora dele, não.');
  nlBotoes(P.ctl, 'nlFunilU', [['prov', 'Províncias'], ['dept', 'Departamentos']], FUNIL, 'u');
  const rows = b.filter(r => match(r, null)), u = FUNIL.u;
  const md = mapData(rows, u), vals = u === 'prov' ? PROV_VALS : DEPT_VALS;
  // províncias: as 24; departamentos: todos os 511 com população, inclusive os que nenhuma notícia cita
  const lugares = u === 'prov'
    ? vals.map((nome, i) => ({ i, nome, pop: popOf(u, i), n: md.c.get(i) || 0 })).filter(d => d.pop > 0)
    : DEPTS.map(f => { const di = f.properties.di, v = IND_DEP[f.id]; return { i: di, nome: f.properties.n, pop: v && v.pop, n: di >= 0 ? (md.c.get(di) || 0) : 0 }; }).filter(d => d.pop > 0);
  const N = d3.sum(lugares, d => d.n), POPT = d3.sum(lugares, d => d.pop), p0 = POPT ? N / POPT : 0;
  const box = P.ch; box.querySelectorAll('svg').forEach(s => s.remove());
  if (!N) { P.leitura.textContent = 'Sem notícias com lugar identificado neste recorte.'; nlTabela(P.dados, [], []); return; }
  const lim = (pop, p) => poissonLim(p0 * pop, p) / pop * 1e5;
  lugares.forEach(d => {
    d.taxa = d.n / d.pop * 1e5; d.E = p0 * d.pop;
    const fora = (pi, ps) => d.n > poissonLim(d.E, ps) ? 1 : d.n < poissonLim(d.E, pi) ? -1 : 0;
    d.c95 = fora(0.025, 0.975); d.c998 = fora(0.001, 0.999);
    d.cls = d.c998 > 0 ? 'a2' : d.c95 > 0 ? 'a1' : d.c998 < 0 ? 'b2' : d.c95 < 0 ? 'b1' : 'm';
  });
  const W = Math.max(340, box.clientWidth || 900), H = 430, m = { t: 18, r: 24, b: 48, l: 58 };
  const ext = d3.extent(lugares, d => d.pop), x = d3.scaleLog().domain([ext[0] / 1.25, ext[1] * 1.25]).range([m.l, W - m.r]);
  const marcas = [1e3, 2e3, 5e3, 1e4, 2e4, 5e4, 1e5, 2e5, 5e5, 1e6, 2e6, 5e6, 1e7, 2e7].filter(v => v >= x.domain()[0] && v <= x.domain()[1]);
  const yMax = Math.max(d3.quantile(lugares.map(d => d.taxa).sort(d3.ascending), u === 'dept' ? 0.995 : 1) * 1.08, p0 * 1e5 * 3);
  const y = d3.scaleSqrt().domain([0, yMax]).nice().range([H - m.b, m.t]).clamp(true);
  const svg = d3.select(box).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('role', 'img')
    .attr('aria-label', 'Gráfico de funil: notícias por 100 mil habitantes em função da população');
  svg.append('g').attr('class', 'grid').selectAll('line').data(y.ticks(6)).join('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', d => y(d)).attr('y2', d => y(d));
  svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).tickValues(marcas).tickFormat(d => d >= 1e6 ? nlN1(d / 1e6) + ' mi' : d >= 1e3 ? Math.round(d / 1e3) + ' mil' : d)).call(g => g.select('.domain').remove());
  svg.append('g').attr('class', 'axis').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(6)).call(g => g.select('.domain').remove());
  svg.append('text').attr('class', 'ax-title').attr('x', W - m.r).attr('y', H - 8).attr('text-anchor', 'end').text('População (Censo 2022, escala logarítmica)');
  svg.append('text').attr('class', 'ax-title').attr('x', m.l).attr('y', m.t - 6).text('Notícias por 100 mil hab.');
  // faixas do funil
  const xs = d3.range(0, 121).map(t => Math.exp(Math.log(x.domain()[0]) + t / 120 * (Math.log(x.domain()[1]) - Math.log(x.domain()[0]))));
  const faixa = (pi, ps) => d3.area().x(p => x(p)).y0(p => y(lim(p, pi))).y1(p => y(lim(p, ps))).curve(d3.curveMonotoneX)(xs);
  svg.append('path').attr('d', faixa(0.001, 0.999)).attr('class', 'nl-funil-998');
  svg.append('path').attr('d', faixa(0.025, 0.975)).attr('class', 'nl-funil-95');
  svg.append('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', y(p0 * 1e5)).attr('y2', y(p0 * 1e5)).attr('class', 'nl-funil-media');
  svg.append('text').attr('x', W - m.r).attr('y', y(p0 * 1e5) - 5).attr('text-anchor', 'end').attr('class', 'nl-funil-rot').text(`média do país: ${nlN1(p0 * 1e5)}`);
  const tip = tipFor(box), nome = d => u === 'dept' ? d.nome : d.nome;
  const pts = svg.append('g').selectAll('circle').data(lugares.sort((a, b2) => b2.pop - a.pop)).join('circle')
    .attr('cx', d => x(d.pop)).attr('cy', d => y(d.taxa)).attr('r', u === 'prov' ? 6 : 3.4).attr('class', d => 'nl-fp nl-fp-' + d.cls)
    .style('cursor', 'pointer')
    .on('mousemove', (e, d) => tip.show(e, nome(d), [`${fmt(d.n)} notícias · ${fmt(d.pop)} habitantes`, `${nlN1(d.taxa)} notícias por 100 mil hab.`, `Esperado pela média do país: ${nlN1(d.E)} notícias`,
      d.c998 > 0 ? 'Acima do funil de 99,8%: muito mais do que o acaso explicaria' : d.c95 > 0 ? 'Acima do funil de 95%' : d.c998 < 0 ? 'Abaixo do funil de 99,8%: muito menos do que o acaso explicaria' : d.c95 < 0 ? 'Abaixo do funil de 95%' : 'Dentro do funil: a diferença pode ser acaso']))
    .on('mouseleave', () => tip.hide()).on('click', (e, d) => { if (d.i >= 0) toggleFilter(md.vid, d.i); });
  // nomes dos lugares mais fora do funil
  const z = d => (d.n - d.E) / Math.sqrt(Math.max(d.E, 0.5));
  const rot = lugares.filter(d => d.c95 !== 0).sort((a, b2) => Math.abs(z(b2)) - Math.abs(z(a))).slice(0, u === 'prov' ? 12 : 10);
  const postos = []; // evita nomes sobrepostos
  const rotOk = rot.filter(d => { const px = x(d.pop), py = y(d.taxa); if (postos.some(([a, c]) => Math.abs(a - px) < 90 && Math.abs(c - py) < 13)) return false; postos.push([px, py]); return true; });
  svg.append('g').selectAll('text').data(rotOk).join('text').attr('class', 'nl-funil-nome').attr('x', d => x(d.pop) + 7).attr('y', d => y(d.taxa) + 4)
    .text(d => d.nome.replace(/ \((Ciudad de )?Buenos Aires\)$/, '').replace(/^CABA.*/, 'CABA'));
  const acima = lugares.filter(d => d.c998 > 0), abaixo = lugares.filter(d => d.c998 < 0);
  const lista = arr => arr.sort((a, b2) => z(b2) - z(a)).slice(0, 5).map(d => d.nome.replace(/ \(.*\)$/, '')).join(', ');
  const unid = u === 'prov' ? 'províncias' : 'departamentos';
  P.leitura.innerHTML = '';
  P.leitura.append(document.createTextNode(`Com a média do país em ${nlN1(p0 * 1e5)} notícias por 100 mil habitantes, ${fmt(acima.length)} ${unid} ficam acima do funil de 99,8%`
    + (acima.length ? ` (${lista(acima)})` : '') + ` e ${fmt(abaixo.length)} abaixo` + (abaixo.length ? ` (${lista(abaixo.slice().reverse())})` : '')
    + `. Os demais estão dentro do funil: a diferença deles em relação à média pode ser acaso, mesmo quando a taxa parece alta.`));
  nlTabela(P.dados, [u === 'prov' ? 'Província' : 'Departamento', 'Notícias', 'População', 'Por 100 mil hab.', 'Esperado', 'Situação'],
    lugares.filter(d => d.n > 0 || d.c95 !== 0).sort((a, b2) => z(b2) - z(a)).map(d => [d.nome, fmt(d.n), fmt(d.pop), nlN1(d.taxa), nlN1(d.E),
      d.c998 > 0 ? 'acima (99,8%)' : d.c95 > 0 ? 'acima (95%)' : d.c998 < 0 ? 'abaixo (99,8%)' : d.c95 < 0 ? 'abaixo (95%)' : 'dentro']));
  nlCalc(P.calc, [
    'Taxa = notícias do recorte que citam o lugar ÷ população do Censo 2022 × 100.000 (uma notícia que cita dois lugares conta nos dois).',
    'Média do país = soma das notícias ÷ soma da população dos lugares com população conhecida.',
    'Esperado = média do país × população do lugar. Se as notícias fossem só acaso em torno da média, o número de um lugar seguiria uma distribuição de Poisson com esse valor esperado.',
    'Limites do funil: quantis da distribuição de Poisson do esperado, interpolados entre números inteiros para formar uma curva contínua (método de Spiegelhalter, 2005); um lugar está fora quando o número observado passa do limite.',
    'As faixas mostram, para cada tamanho de população, o intervalo que contém 95% (faixa escura) e 99,8% (faixa clara) dos resultados possíveis só por acaso. Por isso o funil é largo à esquerda (lugares pequenos variam muito) e estreito à direita.',
    'Cores: laranja-escuro = acima de 99,8%; laranja = acima de 95%; azul-escuro = abaixo de 99,8%; azul = abaixo de 95%; cinza = dentro do funil.',
    'Eixo vertical em raiz quadrada, para caber lugares muito pequenos; em departamentos, os poucos valores extremos ficam no topo do gráfico.']);
});
