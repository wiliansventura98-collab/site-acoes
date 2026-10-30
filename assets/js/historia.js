/*
 * História guiada de 2024 (historia/index.html): mapa e série semanal fixos ao lado de passos de texto.
 * Ao rolar, cada passo (data-de, data-ate = dias do ano) acende no mapa as ações do período, deixa as anteriores
 * em segundo plano e marca o período na série semanal. Dados: dados/entrada.json (os mesmos do mapa da abertura).
 */
(function () {
  const NS = 'http://www.w3.org/2000/svg', ES = document.documentElement.lang === 'es';
  const el = (t, at, pai) => { const e = document.createElementNS(NS, t); for (const k in at) e.setAttribute(k, at[k]); if (pai) pai.append(e); return e; };
  const MESES = ES ? ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'] : ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const MESX = ES ? ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'] : ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const INI = [1, 32, 61, 92, 122, 153, 183, 214, 245, 275, 306, 336];
  const mes = d => { let m = 0; while (m < 11 && d >= INI[m + 1]) m++; return m; };
  const fmt = n => n.toLocaleString(ES ? 'es-AR' : 'pt-BR');
  async function iniciar() {
    const fig = document.getElementById('hFigura'); if (!fig) return;
    let D; try { D = await (await fetch(fig.dataset.entrada)).json(); } catch (e) { fig.hidden = true; return; }
    const [rx, ry, rw, rh] = D.recorte;
    // mapa
    const svg = el('svg', { viewBox: `${rx} ${ry} ${rw} ${rh}`, role: 'img', 'aria-label': ES ? 'Mapa de la Argentina con las acciones del período' : 'Mapa da Argentina com as ações do período', class: 'h-svg' });
    const cid = 'hclip'; el('rect', { x: rx, y: ry, width: rw, height: rh, rx: 16 }, el('clipPath', { id: cid }, el('defs', {}, svg)));
    const q = el('g', { 'clip-path': `url(#${cid})` }, svg);
    el('rect', { x: rx, y: ry, width: rw, height: rh, class: 'me-mar' }, q);
    if (D.grade) el('path', { d: D.grade, class: 'me-grade' }, q);
    if (D.vizinhos) el('path', { d: D.vizinhos, class: 'me-viz' }, q);
    const terra = el('g', { class: 'me-terra' }, q); D.provincias.forEach(p => el('path', { d: p }, terra));
    const div = el('g', { class: 'me-divisas' }, q); D.provincias.forEach(p => el('path', { d: p }, div));
    el('path', { d: D.pais, class: 'me-contorno' }, q);
    const vistos = new Map();
    const P = D.pontos.map(([x, y, d]) => { const k = x + ',' + y, i = vistos.get(k) || 0; vistos.set(k, i + 1); const a = i * 2.39996, r = 1.55 * Math.sqrt(i); return { x: x + r * Math.cos(a), y: y + r * Math.sin(a), d }; });
    const gp = el('g', {}, q);
    const nos = P.map(p => el('circle', { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: 2.3, class: 'h-p' }, gp));
    document.getElementById('hMapa').append(svg);
    // série semanal
    const sem = new Array(53).fill(0); P.forEach(p => sem[Math.min(52, Math.floor((p.d - 1) / 7))]++);
    const mx = Math.max(...sem), SW = 530, SH = 90;
    const s2 = el('svg', { viewBox: `0 0 ${SW} ${SH}`, class: 'h-svg-serie', role: 'img', 'aria-label': ES ? 'Acciones por semana en 2024' : 'Ações por semana em 2024' });
    const faixa = el('rect', { x: 0, y: 0, width: 0, height: 66, class: 'h-faixa' }, s2);
    const barras = sem.map((n, i) => el('rect', { x: i * 10 + 1, width: 8, y: 66 - n / mx * 60, height: n / mx * 60, class: 'h-b' }, s2));
    el('line', { x1: 0, x2: SW, y1: 66.5, y2: 66.5, class: 'h-eixo' }, s2);
    INI.forEach((d, m) => { const t = el('text', { x: (d - 1) / 7 * 10 + 2, y: 80, class: 'h-mes' }, s2); t.textContent = MESES[m]; });
    document.getElementById('hSerie').append(s2);
    // textos dos passos: período e contagem
    const passos = [...document.querySelectorAll('.h-passo')];
    passos.forEach(s => { const de = +s.dataset.de, ate = +s.dataset.ate, n = P.filter(p => p.d >= de && p.d <= ate).length;
      const q1 = s.querySelector('[data-quando]'); if (q1) q1.textContent = (de === 1 && ate === 366) ? '2024' : (mes(de) === mes(ate) ? MESX[mes(de)] : `${MESX[mes(de)]} – ${MESX[mes(ate)]}`) + ' de 2024';
      const c = s.querySelector('[data-conta]'); if (c) c.textContent = fmt(n);
      const ct = s.querySelector('[data-conta-txt]'); if (ct) ct.textContent = ES ? (de === 1 && ate === 366 ? 'acciones en el mapa en todo el año' : 'acciones en el mapa en este período') : (de === 1 && ate === 366 ? 'ações no mapa no ano inteiro' : 'ações no mapa neste período'); });
    function mostra(s) {
      const de = +s.dataset.de, ate = +s.dataset.ate, todos = de === 1 && ate === 366;
      passos.forEach(x => x.classList.toggle('h-ativo', x === s));
      nos.forEach((c, i) => { const d = P[i].d; c.setAttribute('class', 'h-p ' + (d >= de && d <= ate ? (todos ? 'h-todos' : 'h-atual') : d < de ? 'h-antes' : 'h-depois')); });
      if (!todos) nos.forEach((c, i) => { const d = P[i].d; if (d >= de && d <= ate) gp.append(c); }); // as ações do período por cima
      barras.forEach((b, i) => { const w0 = i * 7 + 1, w1 = w0 + 6; b.setAttribute('class', 'h-b ' + (w1 >= de && w0 <= ate ? 'h-b-on' : w1 < de ? 'h-b-antes' : '')); });
      faixa.setAttribute('x', (de - 1) / 7 * 10); faixa.setAttribute('width', todos ? 0 : (ate - de + 1) / 7 * 10);
    }
    const io = new IntersectionObserver(ents => { ents.filter(e => e.isIntersecting).forEach(e => mostra(e.target)); }, { rootMargin: '-45% 0px -45% 0px' });
    passos.forEach(s => io.observe(s));
    mostra(passos[0]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
