/*
 * Novas leituras da aba Mapa
 * 1) Mapa de pontos por categoria: um ponto por ação (notícia × localidade citada), colorido pela categoria
 *    principal da variável escolhida; pontos do mesmo lugar se espalham em espiral. Clique abre a ficha.
 *    Detalhe ampliado da Área Metropolitana de Buenos Aires ao lado.
 * 2) Cartograma: cada província é um círculo com área proporcional à população, perto da sua posição no mapa,
 *    colorido pelas notícias por 100 mil habitantes. Corrige o peso visual de províncias grandes e vazias.
 */
const PONTOS = { v: 'tipomov' };
const NL_VARS_COR = ['tipomov', 'objetivos', 'matriz', 'direccion', 'modalidad', 'escala', 'tipoinst'];

novaLeitura('map', function desenharPontos(b) {
  const P = nlPainel('mapSec', 'nlPontos', 'Mapa de pontos: quem se mobiliza em cada lugar',
    'Cada ponto é uma ação noticiada, na localidade citada, com a cor da sua categoria. Os círculos mostram quanto; os pontos mostram também de quem. Passe o mouse para ver a notícia e clique para abrir a ficha dela.');
  nlSelectVar(P.ctl, 'nlPontosV', 'Cor dos pontos', NL_VARS_COR, PONTOS, 'v');
  const rows = b.filter(r => match(r, null)), iL = VI.localidad;
  const cats = nlCategorias(rows, PONTOS.v, 7);
  const pts = [];
  rows.forEach(r => r.v[iL].forEach(li => { const xy = LOC_XY[li]; if (xy) pts.push({ r, li, xy, cat: cats.catDe(r) }); }));
  const box = P.ch; box.querySelectorAll('svg').forEach(s => s.remove());
  const W = 980, H = 640, mapa = [0, 0, 470, H], ins = [500, 10, 470, 420];
  const svg = d3.select(box).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('role', 'img')
    .attr('aria-label', `Mapa de pontos das notícias por ${VARS[VI[PONTOS.v]].label}`);
  const tip = tipFor(box);
  const desenha = (g, [x0, y0, w, h], ajuste, raio, passo, recorte) => {
    const proj = d3.geoConicConformal().parallels([-28, -46]).rotate([64, 0]).fitExtent([[x0 + 8, y0 + 8], [x0 + w - 8, y0 + h - 8]], ajuste);
    const path = d3.geoPath(proj);
    const cid = 'nlclip' + Math.random().toString(36).slice(2, 7);
    g.append('clipPath').attr('id', cid).append('rect').attr('x', x0).attr('y', y0).attr('width', w).attr('height', h).attr('rx', 10);
    const c = g.append('g').attr('clip-path', `url(#${cid})`);
    c.append('rect').attr('x', x0).attr('y', y0).attr('width', w).attr('height', h).attr('fill', '#dce9f5');
    c.append('g').selectAll('path').data(NEIGH.filter(f => f.properties.name !== 'Argentina')).join('path').attr('d', path).attr('fill', '#efebe2').attr('stroke', '#b9b3a6').attr('stroke-width', .6);
    c.append('g').selectAll('path').data(PROVS_FC).join('path').attr('d', path).attr('fill', '#fffdf6').attr('stroke', '#8fa9c6').attr('stroke-width', recorte ? .5 : .8);
    if (recorte) c.append('path').datum(MESH.dept).attr('d', path).attr('fill', 'none').attr('stroke', '#c3d2e2').attr('stroke-width', .5);
    const vistos = new Map();
    const dados = pts.map(p => { const [px, py] = proj(p.xy); const k = p.li, i = vistos.get(k) || 0; vistos.set(k, i + 1);
      const a = i * 2.39996, rr = passo * Math.sqrt(i); return { ...p, x: px + rr * Math.cos(a), y: py + rr * Math.sin(a) }; })
      .filter(d => d.x >= x0 && d.x <= x0 + w && d.y >= y0 && d.y <= y0 + h)
      .sort((a, b2) => (a.cat < 0) - (b2.cat < 0)); // “outras” por baixo
    const sel = c.append('g').selectAll('circle').data(dados.reverse()).join('circle').attr('cx', d => d.x).attr('cy', d => d.y).attr('r', raio)
      .attr('fill', d => cats.cor(d.cat)).attr('stroke', '#fff').attr('stroke-width', .35).style('cursor', 'pointer')
      .on('mousemove', (e, d) => tip.show(e, d.r.titulo || d.r.codigo, [`${d.r.ini || d.r.fecha} · ${LOC_VALS[d.li]}`, d.cat >= 0 ? cats.nomes[d.cat] : 'Outras categorias ou sem informação', 'Clique para abrir a ficha da notícia']))
      .on('mouseleave', () => tip.hide()).on('click', (e, d) => abrirNoticia(d.r.codigo));
    g.append('rect').attr('x', x0).attr('y', y0).attr('width', w).attr('height', h).attr('rx', 10).attr('fill', 'none').attr('stroke', '#b9cde0');
    return sel;
  };
  const s1 = desenha(svg.append('g'), mapa, ALL, 2.3, 1.6, false);
  const s2 = desenha(svg.append('g'), ins, AMBA_BOX, 3.2, 3.6, true);
  svg.append('text').attr('x', ins[0] + 12).attr('y', ins[1] + 24).attr('class', 'nl-mapa-tit').text('Detalhe: Área Metropolitana de Buenos Aires');
  // resumo por região, no espaço livre abaixo do detalhe
  const iR = VI.region, regs = VARS[iR].values;
  const porReg = d3.rollups(rows.filter(r => r.v[iR].length), v => v, r => r.v[iR][0]).map(([k, rs]) => {
    const c = d3.rollup(rs, v => v.length, cats.catDe); const tot = rs.length;
    const top = [...c].filter(([i]) => i >= 0).sort((a, b2) => b2[1] - a[1])[0];
    return { reg: regs[k], tot, top: top ? cats.nomes[top[0]] : '—', pt: top ? top[1] / tot : 0, c };
  }).sort((a, b2) => b2.tot - a.tot);
  const gx = ins[0], gy = ins[1] + ins[3] + 34, bw = ins[2];
  svg.append('text').attr('x', gx).attr('y', gy - 12).attr('class', 'nl-mapa-tit').text(`Composição por região (${VARS[VI[PONTOS.v]].label.toLowerCase()})`);
  porReg.slice(0, 6).forEach((d, j) => {
    const yy = gy + j * 28, xx = gx + 150, ww = bw - 160; let acc = 0;
    svg.append('text').attr('x', gx).attr('y', yy + 12).attr('class', 'nl-mapa-rot').text(`${d.reg} (${fmt(d.tot)})`);
    [...cats.top.keys(), -1].forEach(i => { const n = d.c.get(i) || 0; if (!n) return; const w = n / d.tot * ww;
      svg.append('rect').attr('x', xx + acc).attr('y', yy).attr('width', Math.max(0, w - .5)).attr('height', 16).attr('fill', cats.cor(i)).attr('class', 'nl-barra').datum({ cat: i })
        .on('mousemove', e => tip.show(e, d.reg, [`${i >= 0 ? cats.nomes[i] : 'Outras'}: ${fmt(n)} notícias (${nlPct(n / d.tot)})`])).on('mouseleave', () => tip.hide());
      acc += w; });
  });
  nlLegenda(box, cats, d3.selectAll([...s1.nodes(), ...s2.nodes(), ...svg.selectAll('.nl-barra').nodes()]));
  const sem = rows.length - new Set(pts.map(p => p.r)).size;
  const regTxt = porReg.slice(0, 4).map(d => `${d.reg}: ${d.top} (${nlPct(d.pt)})`).join('; ');
  P.leitura.textContent = `${fmt(pts.length)} pontos de ${fmt(rows.length - sem)} notícias (as ${fmt(sem)} restantes são nacionais, virtuais ou sem localidade). Categoria mais frequente por região: ${regTxt}.`;
  nlTabela(P.dados, ['Região', 'Notícias', ...cats.nomes, 'Outras'], porReg.map(d => [d.reg, fmt(d.tot), ...[...cats.top.keys(), -1].map(i => fmt(d.c.get(i) || 0))]));
  nlCalc(P.calc, [
    'Um ponto para cada par notícia × localidade citada (uma notícia que cita duas cidades vira dois pontos). Notícias sem localidade no mapa ficam de fora.',
    'Cor = a categoria da notícia entre as 7 mais frequentes no recorte; quando a notícia tem várias, vale a mais frequente delas. As demais ficam em cinza (“Outras”).',
    'Pontos do mesmo lugar se espalham em espiral (girassol) a partir da coordenada da localidade, para que a mancha cresça com o número de ações. A posição exata dentro da mancha não tem significado.',
    'Cores da paleta Okabe-Ito, legível para as formas mais comuns de daltonismo. Passe o mouse na legenda para destacar uma categoria.']);
});

novaLeitura('map', function desenharCartograma(b) {
  const P = nlPainel('mapSec', 'nlCarto', 'Cartograma: as províncias pelo tamanho da população',
    'Cada círculo é uma província, com área proporcional à população e cor pelas notícias por 100 mil habitantes. No mapa comum, a Patagônia, enorme e pouco povoada, ocupa quase toda a imagem; aqui, cada província pesa o que pesa a sua gente.');
  const rows = b.filter(r => match(r, null));
  const md = mapData(rows, 'prov');
  const dados = PROV_VALS.map((nome, i) => ({ i, nome, pop: POP[i], n: md.c.get(i) || 0, xy: PROV_XY[i] })).filter(d => d.pop && d.xy);
  dados.forEach(d => { d.taxa = d.n / d.pop * 1e5; });
  const box = P.ch; box.querySelectorAll('svg').forEach(s => s.remove());
  const W = 760, H = 640;
  const proj = d3.geoConicConformal().parallels([-28, -46]).rotate([64, 0]).fitExtent([[20, 20], [W - 20, H - 20]], ALL);
  const rMax = 78, r = d3.scaleSqrt().domain([0, d3.max(dados, d => d.pop)]).range([0, rMax]);
  dados.forEach(d => { const [x, y] = proj(d.xy); d.x0 = x; d.y0 = y; d.x = x; d.y = y; d.r = Math.max(5, r(d.pop)); });
  const sim = d3.forceSimulation(dados).force('x', d3.forceX(d => d.x0).strength(.25)).force('y', d3.forceY(d => d.y0).strength(.25))
    .force('c', d3.forceCollide(d => d.r + 1.5).iterations(4)).stop();
  for (let k = 0; k < 400; k++) sim.tick();
  const q = d3.scaleQuantile().domain(dados.map(d => d.taxa)).range(['#eaf2fa', '#bcd5ec', '#7fb0dc', '#3f86c4', '#13508f']);
  const svg = d3.select(box).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('role', 'img').attr('aria-label', 'Cartograma de províncias com área proporcional à população');
  svg.append('path').datum(ALL).attr('d', d3.geoPath(proj)).attr('fill', '#f4f1ea').attr('stroke', '#d9d2c3');
  const tip = tipFor(box);
  const g = svg.append('g').selectAll('g').data(dados.sort((a, b2) => b2.r - a.r)).join('g').attr('transform', d => `translate(${d.x},${d.y})`).style('cursor', 'pointer')
    .on('mousemove', (e, d) => tip.show(e, d.nome, [`${fmt(d.pop)} habitantes`, `${fmt(d.n)} notícias · ${nlN1(d.taxa)} por 100 mil hab.`]))
    .on('mouseleave', () => tip.hide()).on('click', (e, d) => toggleFilter('provincia', d.i));
  g.append('circle').attr('r', d => d.r).attr('fill', d => q(d.taxa)).attr('stroke', '#fff').attr('stroke-width', 1.2);
  const curto = n => n.replace(/^CABA.*/, 'CABA').replace('Santiago del Estero', 'Sgo. del Estero').replace('Tierra del Fuego', 'T. del Fuego');
  const rotulos = svg.append('g').style('pointer-events', 'none'); // nomes por cima de todos os círculos
  dados.forEach(d => { const dentro = d.r >= 26;
    rotulos.append('text').attr('x', dentro ? d.x : d.x + d.r + 3).attr('y', d.y).attr('dy', '.35em').attr('text-anchor', dentro ? 'middle' : 'start')
      .attr('class', 'nl-carto-rot' + (dentro ? (q.range().indexOf(q(d.taxa)) >= 3 ? ' nl-claro' : '') : ' nl-fora'))
      .style('font-size', dentro ? Math.min(14, Math.max(10, d.r / 3.4)) + 'px' : null).text(curto(d.nome)); });
  // legenda
  const lg = svg.append('g').attr('transform', `translate(${W - 230},${H - 120})`);
  lg.append('text').attr('class', 'nl-mapa-tit').text('Notícias por 100 mil hab. (quintis)');
  const lim = [d3.min(dados, d => d.taxa), ...q.quantiles(), d3.max(dados, d => d.taxa)];
  q.range().forEach((c, k) => { lg.append('rect').attr('x', k * 42).attr('y', 10).attr('width', 40).attr('height', 12).attr('fill', c);
    lg.append('text').attr('x', k * 42).attr('y', 36).attr('class', 'nl-mapa-rot').text(nlN1(lim[k])); });
  lg.append('text').attr('x', 0).attr('y', 58).attr('class', 'nl-mapa-rot').text('Área do círculo ∝ população (Censo 2022)');
  const ord = dados.slice().sort((a, b2) => b2.taxa - a.taxa);
  P.leitura.textContent = `Buenos Aires (província) e CABA somam ${nlPct((POP[PROV_VALS.indexOf('Buenos Aires')] + (POP[PROV_VALS.findIndex(v => /^CABA/.test(v))] || 0)) / d3.sum(dados, d => d.pop))} da população e por isso dominam o desenho. As maiores taxas do recorte são de ${ord.slice(0, 3).map(d => `${curto(d.nome)} (${nlN1(d.taxa)})`).join(', ')}; as menores, de ${ord.slice(-3).reverse().map(d => `${curto(d.nome)} (${nlN1(d.taxa)})`).join(', ')}.`;
  nlTabela(P.dados, ['Província', 'População', 'Notícias', 'Por 100 mil hab.'], ord.map(d => [d.nome, fmt(d.pop), fmt(d.n), nlN1(d.taxa)]));
  nlCalc(P.calc, [
    'Cartograma de Dorling: cada província vira um círculo com área proporcional à população residente (Censo 2022).',
    'Os círculos partem do centro de cada província no mapa e são afastados o mínimo necessário para não se sobreporem (simulação de forças com colisão), por isso a posição é aproximada.',
    'Cor = notícias do recorte que citam a província ÷ população × 100.000, em cinco classes de quintis.',
    'Clique numa província para filtrar a base por ela.']);
});
