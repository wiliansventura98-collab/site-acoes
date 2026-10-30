/* GERADO por i18n/ferramenta.js a partir de assets/js/app/nl-funil.js; não edite: edite o original e i18n/es.json */
var IDIOMA='es';
/*
 * Nova leitura: gráfico de funil (aba Contexto)
 * Cada ponto é uma província (ou departamento): no eixo horizontal, a população; no vertical, as notícias por
 * 100 mil habitantes. A linha do meio é a taxa do país; as faixas mostram até onde a taxa de um lugar daquele
 * tamanho pode ir só por acaso (Poisson, 95% e 99,8%). Lugares fora do funil têm mais (ou menos) notícias do que
 * o acaso explicaria. Evita o ranking de taxas, em que lugares pequenos sobem ou descem por puro acaso.
 */
const FUNIL = { u: 'prov' };
novaLeitura('ctx', function desenharFunil(b) {
  const P = nlPainel('ctxSec', 'nlFunil', 'Embudo: ¿quién está realmente por encima o por debajo del promedio?',
    'Cada punto es un lugar, con la población en el eje horizontal y las noticias por 100 mil habitantes en el vertical. Dentro del embudo, la diferencia con el promedio del país puede ser solo azar; fuera de él, no.');
  nlBotoes(P.ctl, 'nlFunilU', [['prov', 'Provincias'], ['dept', 'Departamentos']], FUNIL, 'u');
  const rows = b.filter(r => match(r, null)), u = FUNIL.u;
  const md = mapData(rows, u), vals = u === 'prov' ? PROV_VALS : DEPT_VALS;
  // províncias: as 24; departamentos: todos os 511 com população, inclusive os que nenhuma notícia cita
  const lugares = u === 'prov'
    ? vals.map((nome, i) => ({ i, nome, pop: popOf(u, i), n: md.c.get(i) || 0 })).filter(d => d.pop > 0)
    : DEPTS.map(f => { const di = f.properties.di, v = IND_DEP[f.id]; return { i: di, nome: f.properties.n, pop: v && v.pop, n: di >= 0 ? (md.c.get(di) || 0) : 0 }; }).filter(d => d.pop > 0);
  const N = d3.sum(lugares, d => d.n), POPT = d3.sum(lugares, d => d.pop), p0 = POPT ? N / POPT : 0;
  const box = P.ch; box.querySelectorAll('svg').forEach(s => s.remove());
  if (!N) { P.leitura.textContent = 'Sin noticias con lugar identificado en este recorte.'; nlTabela(P.dados, [], []); return; }
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
    .attr('aria-label', 'Gráfico de embudo: noticias por 100 mil habitantes en función de la población');
  svg.append('g').attr('class', 'grid').selectAll('line').data(y.ticks(6)).join('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', d => y(d)).attr('y2', d => y(d));
  svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).tickValues(marcas).tickFormat(d => d >= 1e6 ? nlN1(d / 1e6) + ' mi' : d >= 1e3 ? Math.round(d / 1e3) + ' mil' : d)).call(g => g.select('.domain').remove());
  svg.append('g').attr('class', 'axis').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(6)).call(g => g.select('.domain').remove());
  svg.append('text').attr('class', 'ax-title').attr('x', W - m.r).attr('y', H - 8).attr('text-anchor', 'end').text('Población (Censo 2022, escala logarítmica)');
  svg.append('text').attr('class', 'ax-title').attr('x', m.l).attr('y', m.t - 6).text('Noticias por 100 mil hab.');
  // faixas do funil
  const xs = d3.range(0, 121).map(t => Math.exp(Math.log(x.domain()[0]) + t / 120 * (Math.log(x.domain()[1]) - Math.log(x.domain()[0]))));
  const faixa = (pi, ps) => d3.area().x(p => x(p)).y0(p => y(lim(p, pi))).y1(p => y(lim(p, ps))).curve(d3.curveMonotoneX)(xs);
  svg.append('path').attr('d', faixa(0.001, 0.999)).attr('class', 'nl-funil-998');
  svg.append('path').attr('d', faixa(0.025, 0.975)).attr('class', 'nl-funil-95');
  svg.append('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', y(p0 * 1e5)).attr('y2', y(p0 * 1e5)).attr('class', 'nl-funil-media');
  svg.append('text').attr('x', W - m.r).attr('y', y(p0 * 1e5) - 5).attr('text-anchor', 'end').attr('class', 'nl-funil-rot').text(`promedio del país: ${nlN1(p0 * 1e5)}`);
  const tip = tipFor(box), nome = d => u === 'dept' ? d.nome : d.nome;
  const pts = svg.append('g').selectAll('circle').data(lugares.sort((a, b2) => b2.pop - a.pop)).join('circle')
    .attr('cx', d => x(d.pop)).attr('cy', d => y(d.taxa)).attr('r', u === 'prov' ? 6 : 3.4).attr('class', d => 'nl-fp nl-fp-' + d.cls)
    .style('cursor', 'pointer')
    .on('mousemove', (e, d) => tip.show(e, nome(d), [`${fmt(d.n)} noticias · ${fmt(d.pop)} habitantes`, `${nlN1(d.taxa)} noticias por 100 mil hab.`, `Esperado según el promedio del país: ${nlN1(d.E)} noticias`,
      d.c998 > 0 ? 'Por encima del embudo de 99,8%: mucho más de lo que explicaría el azar' : d.c95 > 0 ? 'Por encima del embudo de 95%' : d.c998 < 0 ? 'Por debajo del embudo de 99,8%: mucho menos de lo que explicaría el azar' : d.c95 < 0 ? 'Por debajo del embudo de 95%' : 'Dentro del embudo: la diferencia puede ser azar']))
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
  const unid = u === 'prov' ? 'provincias' : 'departamentos';
  P.leitura.innerHTML = '';
  P.leitura.append(document.createTextNode(`Con el promedio del país en ${nlN1(p0 * 1e5)} noticias por 100 mil habitantes, ${fmt(acima.length)} ${unid} quedan por encima del embudo de 99,8%`
    + (acima.length ? ` (${lista(acima)})` : '') + ` e ${fmt(abaixo.length)} abaixo` + (abaixo.length ? ` (${lista(abaixo.slice().reverse())})` : '')
    + `. Los demás están dentro del embudo: su diferencia con el promedio puede ser azar, aunque la tasa parezca alta.`));
  nlTabela(P.dados, [u === 'prov' ? 'Provincia' : 'Departamento', 'Noticias', 'Población', 'Por 100 mil hab.', 'Esperado', 'Situación'],
    lugares.filter(d => d.n > 0 || d.c95 !== 0).sort((a, b2) => z(b2) - z(a)).map(d => [d.nome, fmt(d.n), fmt(d.pop), nlN1(d.taxa), nlN1(d.E),
      d.c998 > 0 ? 'por encima (99,8%)' : d.c95 > 0 ? 'por encima (95%)' : d.c998 < 0 ? 'por debajo (99,8%)' : d.c95 < 0 ? 'por debajo (95%)' : 'dentro']));
  nlCalc(P.calc, [
    'Tasa = noticias del recorte que citan el lugar ÷ población del Censo 2022 × 100.000 (una noticia que cita dos lugares cuenta en ambos).',
    'Promedio del país = suma de las noticias ÷ suma de la población de los lugares con población conocida.',
    'Esperado = promedio del país × población del lugar. Si las noticias fueran solo azar en torno al promedio, el número de un lugar seguiría una distribución de Poisson con ese valor esperado.',
    'Límites del embudo: cuantiles de la distribución de Poisson del esperado, interpolados entre números enteros para formar una curva continua (método de Spiegelhalter, 2005); un lugar está fuera cuando el número observado supera el límite.',
    'Las franjas muestran, para cada tamaño de población, el intervalo que contiene el 95% (franja oscura) y el 99,8% (franja clara) de los resultados posibles solo por azar. Por eso el embudo es ancho a la izquierda (los lugares pequeños varían mucho) y estrecho a la derecha.',
    'Colores: naranja oscuro = por encima de 99,8%; naranja = por encima de 95%; azul oscuro = por debajo de 99,8%; azul = por debajo de 95%; gris = dentro del embudo.',
    'Eje vertical en raíz cuadrada, para que entren lugares muy pequeños; en departamentos, los pocos valores extremos quedan en el borde superior del gráfico.']);
});
