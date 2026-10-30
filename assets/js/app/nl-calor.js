/*
 * Novas leituras: mapa de calor reordenado (aba Distribuição) e perfil comparado à base (aba Fichas)
 * 1) Com “Cruzar com” escolhido, mostra os resíduos ajustados do cruzamento com linhas e colunas reordenadas
 *    pelo primeiro eixo da análise de correspondências, para que as combinações características formem blocos.
 * 2) Na ficha aberta, compara cada categoria das variáveis centrais com as demais notícias da base:
 *    diferença em pontos percentuais, com as diferenças significativas destacadas.
 */
novaLeitura('dist', function desenharCalor(b) {
  const P = nlPainel('dist', 'nlCalor', 'Mapa de calor reordenado: os blocos do cruzamento',
    'O mesmo cruzamento da tabela acima, no modo Associação, mas com linhas e colunas reordenadas para que as categorias que andam juntas fiquem vizinhas. Azul = aparecem juntas mais do que o esperado; laranja = menos.');
  const box = P.ch; box.querySelectorAll('svg,.nl-vazio-c').forEach(s => s.remove());
  if (!st.x || st.x === st.v) {
    P.leitura.textContent = '';
    const p = el('p', 'nl-vazio-c', 'Escolha uma variável em “Cruzar com”, no topo da página, para ver este mapa de calor. ');
    const bt = el('button', 'btn', 'Ver um exemplo: tipo de movimento × objetivos'); bt.type = 'button';
    bt.onclick = () => { st.v = 'tipomov'; st.x = 'objetivos'; render(); };
    p.append(bt); box.append(p); nlTabela(P.dados, [], []); return;
  }
  const rows = b.filter(r => match(r, null)), N = rows.length;
  const vr = VARS[VI[st.v]], vc = VARS[VI[st.x]];
  const topo = vid => { const c = counts(rows, vid), v = VARS[VI[vid]]; return order(vid, c).filter(k => !ehSemInfo(v.values[k])).slice(0, 16); };
  let R = topo(st.v), Cc = topo(st.x);
  const O = R.map(() => Cc.map(() => 0)), iR = VI[st.v], iC = VI[st.x];
  const rt = R.map(() => 0), ct = Cc.map(() => 0);
  const posR = new Map(R.map((k, i) => [k, i])), posC = new Map(Cc.map((k, j) => [k, j]));
  rows.forEach(r => { const a = r.v[iR].map(k => posR.get(k)).filter(i => i != null), c = r.v[iC].map(k => posC.get(k)).filter(j => j != null);
    a.forEach(i => { rt[i]++; c.forEach(j => O[i][j]++); }); c.forEach(j => ct[j]++); });
  const res = R.map((_, i) => Cc.map((_, j) => { const E = rt[i] * ct[j] / N; const v = E * (1 - rt[i] / N) * (1 - ct[j] / N); return v > 0 ? (O[i][j] - E) / Math.sqrt(v) : 0; }));
  // seriação: primeiro eixo da análise de correspondências (iteração de potência sobre a matriz de resíduos padronizados)
  const tot = d3.sum(O.flat()) || 1, rm = O.map(l => d3.sum(l) / tot), cm = Cc.map((_, j) => d3.sum(O, l => l[j]) / tot);
  const S = O.map((l, i) => l.map((o, j) => (rm[i] && cm[j]) ? (o / tot - rm[i] * cm[j]) / Math.sqrt(rm[i] * cm[j]) : 0));
  let vv = Cc.map((_, j) => Math.sin(j + 1)), uu = [];
  for (let it = 0; it < 200; it++) {
    uu = S.map(l => d3.sum(l, (s, j) => s * vv[j])); const nu = Math.hypot(...uu) || 1; uu = uu.map(x => x / nu);
    vv = Cc.map((_, j) => d3.sum(S, (l, i) => l[j] * uu[i])); const nv = Math.hypot(...vv) || 1; vv = vv.map(x => x / nv);
  }
  const ordR = R.map((_, i) => i).sort((a, b2) => (uu[a] / Math.sqrt(rm[a] || 1)) - (uu[b2] / Math.sqrt(rm[b2] || 1)));
  const ordC = Cc.map((_, j) => j).sort((a, b2) => (vv[a] / Math.sqrt(cm[a] || 1)) - (vv[b2] / Math.sqrt(cm[b2] || 1)));
  const cel = Math.max(22, Math.min(40, Math.floor(((box.clientWidth || 900) - 300) / Cc.length)));
  const ml = 280, mt = 190, W = ml + cel * Cc.length + 20, H = mt + cel * R.length + 50;
  const cor = d3.scaleDiverging(t => d3.interpolateRgbBasis(['#C2410C', '#F6C9A8', '#ffffff', '#9CC9EC', '#0B5EA8'])(t)).domain([-8, 0, 8]).clamp(true);
  const svg = d3.select(box).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').style('max-width', W + 'px').attr('role', 'img')
    .attr('aria-label', `Mapa de calor reordenado: ${vr.label} × ${vc.label}`);
  const tip = tipFor(box), corta = (t, n) => t.length > n ? t.slice(0, n - 1) + '…' : t;
  ordR.forEach((i, a) => svg.append('text').attr('x', ml - 8).attr('y', mt + a * cel + cel / 2).attr('dy', '.35em').attr('text-anchor', 'end').attr('class', 'nl-mapa-rot').text(corta(vr.values[R[i]], 42)));
  ordC.forEach((j, a) => svg.append('text').attr('transform', `translate(${ml + a * cel + cel / 2},${mt - 8}) rotate(-50)`).attr('class', 'nl-mapa-rot').text(corta(vc.values[Cc[j]], 34)));
  ordR.forEach((i, a) => ordC.forEach((j, c) => {
    const r = res[i][j];
    const g = svg.append('g').attr('transform', `translate(${ml + c * cel},${mt + a * cel})`)
      .on('mousemove', e => tip.show(e, `${vr.values[R[i]]} × ${vc.values[Cc[j]]}`, [`${fmt(O[i][j])} notícias (esperado ${nlN1(rt[i] * ct[j] / N)})`, `Resíduo ajustado: ${nlN1(r)}${Math.abs(r) >= 3 ? ' (característica)' : Math.abs(r) >= 1.96 ? ' (significativa)' : ''}`]))
      .on('mouseleave', () => tip.hide());
    g.append('rect').attr('width', cel - 1).attr('height', cel - 1).attr('fill', O[i][j] || Math.abs(r) >= 1.96 ? cor(r) : '#f6f8fa');
    if (cel >= 26 && Math.abs(r) >= 3) g.append('text').attr('x', cel / 2).attr('y', cel / 2).attr('dy', '.35em').attr('text-anchor', 'middle').attr('class', 'nl-calor-v' + (Math.abs(r) >= 6 ? ' nl-claro' : '')).text(Math.round(r));
  }));
  const lg = svg.append('g').attr('transform', `translate(${ml},${H - 30})`);
  [-8, -6, -3, -1.96, 0, 1.96, 3, 6, 8].forEach((v, k) => { lg.append('rect').attr('x', k * 34).attr('width', 32).attr('height', 10).attr('fill', cor(v));
    lg.append('text').attr('x', k * 34 + 16).attr('y', 24).attr('text-anchor', 'middle').attr('class', 'nl-mapa-rot').text(v === 0 ? '0' : (v > 0 ? '+' : '−') + nlN1(Math.abs(v))); });
  lg.append('text').attr('x', 9 * 34 + 8).attr('y', 9).attr('class', 'nl-mapa-rot').text('resíduo ajustado (números nas células: ≥ 3 em módulo)');
  const fortes = [];
  R.forEach((k, i) => Cc.forEach((kk, j) => { if (res[i][j] >= 3 && O[i][j] >= 5) fortes.push([res[i][j], vr.values[k], vc.values[kk], O[i][j]]); }));
  fortes.sort((a, b2) => b2[0] - a[0]);
  P.leitura.textContent = fortes.length
    ? `As linhas e colunas foram reordenadas pelo primeiro eixo da análise de correspondências. Combinações mais características: ${fortes.slice(0, 4).map(f => `${f[1]} × ${f[2]} (${fmt(f[3])} notícias, resíduo ${nlN1(f[0])})`).join('; ')}.`
    : 'Nenhuma combinação com resíduo ajustado ≥ 3 e pelo menos 5 notícias neste recorte.';
  nlTabela(P.dados, [vr.label, vc.label, 'Notícias', 'Esperado', 'Resíduo ajustado'],
    R.flatMap((k, i) => Cc.map((kk, j) => [vr.values[k], vc.values[kk], O[i][j], rt[i] * ct[j] / N, res[i][j]])).filter(l => l[2] > 0).sort((a, b2) => b2[4] - a[4])
      .map(l => [l[0], l[1], fmt(l[2]), nlN1(l[3]), nlN1(l[4])]));
  nlCalc(P.calc, [
    'Entram as 16 categorias mais frequentes de cada variável no recorte (sem “não informa”).',
    'Cada célula: resíduo ajustado de Haberman = (observado − esperado) ÷ √(esperado × (1 − total da linha ÷ N) × (1 − total da coluna ÷ N)), com esperado = total da linha × total da coluna ÷ N e N = notícias do recorte. É o mesmo cálculo do modo Associação da tabela acima.',
    'Reordenação (seriação): linhas e colunas são ordenadas pela sua coordenada no primeiro eixo de uma análise de correspondências simples da tabela de contagens. Categorias com perfis parecidos ficam vizinhas, e as associações fortes se juntam em blocos ao longo da diagonal.',
    'Escala de cor de −8 a +8 (valores além disso ficam com a cor do extremo). Células sem notícias e sem associação significativa ficam em cinza claro.']);
});

novaLeitura('fic', function desenharPerfil(b) {
  const P = nlPainel('ficSec', 'nlPerfil', 'Perfil comparado: o que é próprio desta ficha',
    'Para cada categoria, a diferença entre a porcentagem nas notícias da ficha e nas demais notícias da base. Barras para a direita: mais frequente na ficha; para a esquerda: menos.');
  const box = P.ch; box.querySelectorAll('.nl-perfil-g,.nl-vazio-c').forEach(s => s.remove());
  if (typeof FIC === 'undefined' || FIC.k == null || VI[FIC.v] == null) { box.append(el('p', 'nl-vazio-c', 'Escolha uma ficha acima para ver o perfil comparado.')); P.leitura.textContent = ''; return; }
  const iF = VI[FIC.v], nomeF = VARS[iF].values[FIC.k];
  const A = b.filter(r => r.v[iF].includes(FIC.k)), Bd = b.filter(r => !r.v[iF].includes(FIC.k));
  if (A.length < 5) { box.append(el('p', 'nl-vazio-c', 'Esta ficha tem poucas notícias para comparar.')); P.leitura.textContent = ''; return; }
  const vars = ['tipomov', 'objetivos', 'matriz', 'escala', 'direccion', 'region'].filter(v => v !== FIC.v && VI[v] != null);
  const blocos = vars.map(vid => {
    const v = VARS[VI[vid]], ca = counts(A, vid), cb = counts(Bd, vid);
    const ls = [...new Set([...ca.keys(), ...cb.keys()])].filter(k => !ehSemInfo(v.values[k])).map(k => {
      const a = ca.get(k) || 0, bb = cb.get(k) || 0, pa = a / A.length, pb = bb / (Bd.length || 1), pp = (a + bb) / (A.length + Bd.length);
      const se = Math.sqrt(pp * (1 - pp) * (1 / A.length + 1 / (Bd.length || 1))); return { k, nome: v.values[k], a, pa, pb, d: pa - pb, z: se ? (pa - pb) / se : 0 };
    }).sort((p, q) => Math.max(q.pa, q.pb) - Math.max(p.pa, p.pb)).slice(0, 7).sort((p, q) => q.d - p.d);
    return { vid, label: v.label, ls };
  });
  const dmax = Math.max(0.1, d3.max(blocos.flatMap(bl => bl.ls), l => Math.abs(l.d)));
  const grade = el('div', 'nl-perfil-g'); box.append(grade);
  const tip = tipFor(box);
  blocos.forEach(bl => {
    const W = 520, rowH = 24, H = 30 + bl.ls.length * rowH, lab = 220, x = d3.scaleLinear().domain([-dmax, dmax]).range([lab + 10, W - 70]);
    const card = el('div', 'nl-perfil-c'); card.append(el('h3', null, bl.label)); grade.append(card);
    const svg = d3.select(card).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('role', 'img').attr('aria-label', `${bl.label}: ${nomeF} comparado às demais notícias`);
    svg.append('line').attr('x1', x(0)).attr('x2', x(0)).attr('y1', 4).attr('y2', H - 4).attr('stroke', '#9fb2c8');
    const g = svg.selectAll('g').data(bl.ls).join('g').attr('transform', (d, i) => `translate(0,${12 + i * rowH})`)
      .on('mousemove', (e, d) => tip.show(e, d.nome, [`${nomeF}: ${nlPct(d.pa)} (${fmt(d.a)} de ${fmt(A.length)})`, `Demais notícias: ${nlPct(d.pb)}`, `Diferença: ${d.d >= 0 ? '+' : '−'}${nlN1(Math.abs(d.d) * 100)} p.p.${Math.abs(d.z) >= 1.96 ? ' (significativa a 5%)' : ''}`]))
      .on('mouseleave', () => tip.hide());
    g.append('text').attr('x', lab).attr('y', rowH / 2).attr('dy', '.35em').attr('text-anchor', 'end').attr('class', 'nl-mapa-rot').text(d => d.nome.length > 34 ? d.nome.slice(0, 33) + '…' : d.nome);
    g.append('rect').attr('x', d => Math.min(x(0), x(d.d))).attr('y', 4).attr('height', rowH - 8).attr('width', d => Math.abs(x(d.d) - x(0)))
      .attr('fill', d => d.d >= 0 ? (Math.abs(d.z) >= 1.96 ? '#0B5EA8' : '#9CC9EC') : (Math.abs(d.z) >= 1.96 ? '#C2410C' : '#F6C9A8'));
    g.append('text').attr('x', W - 64).attr('y', rowH / 2).attr('dy', '.35em').attr('class', 'nl-mapa-rot').text(d => `${nlPct(d.pa)} · ${nlPct(d.pb)}`);
  });
  const sig = blocos.flatMap(bl => bl.ls.filter(l => Math.abs(l.z) >= 1.96 && l.d > 0).map(l => ({ ...l, var: bl.label }))).sort((a, b2) => b2.d - a.d);
  P.leitura.textContent = sig.length
    ? `Em relação às demais notícias, ${nomeF} se distingue sobretudo por: ${sig.slice(0, 4).map(l => `${l.nome} (${nlPct(l.pa)} contra ${nlPct(l.pb)})`).join('; ')}. Nos números à direita de cada barra: porcentagem na ficha · nas demais notícias.`
    : `Nenhuma categoria aparece significativamente mais em ${nomeF} do que nas demais notícias.`;
  nlTabela(P.dados, ['Variável', 'Categoria', 'Na ficha', 'Demais', 'Diferença (p.p.)', 'z'],
    blocos.flatMap(bl => bl.ls.map(l => [bl.label, l.nome, nlPct(l.pa), nlPct(l.pb), nlN1(l.d * 100), nlN1(l.z)])));
  nlCalc(P.calc, [
    `Ficha: ${fmt(A.length)} notícias com “${nomeF}”; demais: ${fmt(Bd.length)} notícias da base sem essa categoria (respeitando a opção de incluir repetidas).`,
    'Para cada variável, as 7 categorias mais frequentes (na ficha ou nas demais). Porcentagem = notícias com a categoria ÷ notícias do grupo; como uma notícia pode ter várias categorias, as porcentagens não somam 100%.',
    'Diferença em pontos percentuais; cor forte quando o teste z de duas proporções é significativo a 5% (|z| ≥ 1,96). Azul: mais frequente na ficha; laranja: menos.']);
});
