/*
 * Mapa da abertura: a Argentina vai sendo preenchida, dia a dia, pelos pontos das ações noticiadas em 2024
 * e, ao fim do ano, fica parada. Cada ponto é uma ação (notícia única) na localidade citada; pontos no mesmo
 * lugar se espalham num pequeno “girassol”, e por isso as cidades com muitas ações viram manchas.
 *
 * Uso: <figure class="mapa-entrada" data-entrada="dados/entrada.json" data-duracao="8000">…</figure>
 * Os dados (contorno já projetado e pontos ordenados por data) são gerados por pipeline/construir_site.py.
 * Sem bibliotecas. Com “reduzir movimento” ativado no sistema, o mapa aparece direto no estado final.
 */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const ES = document.documentElement.lang === 'es';
  const T = ES
    ? { meses: ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
        acao: n => n === 1 ? 'acción' : 'acciones',
        fim: (n, l) => `<b>${n}</b> acciones informadas en 2024, en ${l} localidades`,
        rever: 'Ver de nuevo', rotulo: 'Mapa de la Argentina con un punto por cada acción colectiva informada en 2024' }
    : { meses: ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'],
        acao: n => n === 1 ? 'ação' : 'ações',
        fim: (n, l) => `<b>${n}</b> ações noticiadas em 2024, em ${l} localidades`,
        rever: 'Ver de novo', rotulo: 'Mapa da Argentina com um ponto para cada ação coletiva noticiada em 2024' };
  const fmt = n => n.toLocaleString(ES ? 'es-AR' : 'pt-BR');
  const el = (tag, at, pai) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); if (pai) pai.append(e); return e; };
  const semMovimento = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // dia do ano (1–366, 2024 é bissexto) → mês (0–11)
  const INICIO_MES = [1, 32, 61, 92, 122, 153, 183, 214, 245, 275, 306, 336];
  const mesDe = d => { let m = 0; while (m < 11 && d >= INICIO_MES[m + 1]) m++; return m; };

  async function montar(fig) {
    let D;
    try { const r = await fetch(fig.dataset.entrada); if (!r.ok) throw 0; D = await r.json(); } catch (e) { fig.hidden = true; return; }
    const W = D.largura, H = D.altura, PAD = 6;

    // ---- mapa ----
    const svg = el('svg', { viewBox: `${-PAD} ${-PAD} ${W + 2 * PAD} ${H + 2 * PAD}`, role: 'img', 'aria-label': T.rotulo, class: 'me-mapa' });
    const terra = el('g', { class: 'me-terra' }, svg);
    D.provincias.forEach(p => el('path', { d: p }, terra));
    el('path', { d: D.pais, class: 'me-contorno' }, svg);
    const gp = el('g', { class: 'me-pontos' }, svg);
    const gf = el('g', { class: 'me-flash' }, svg);

    // posição final de cada ponto: espiral de girassol em torno da localidade
    const vistos = new Map();
    const P = D.pontos.map(([x, y, d]) => {
      const k = `${x},${y}`, i = vistos.get(k) || 0; vistos.set(k, i + 1);
      const a = i * 2.39996, r = 1.55 * Math.sqrt(i);
      return { x: x + r * Math.cos(a), y: y + r * Math.sin(a), d };
    });

    // ---- linha do tempo: barras por semana e contador ----
    const semanas = new Array(53).fill(0); P.forEach(p => semanas[Math.min(52, Math.floor((p.d - 1) / 7))]++);
    const mx = Math.max(...semanas);
    const tl = el('svg', { viewBox: '0 0 530 46', class: 'me-tempo', 'aria-hidden': 'true', preserveAspectRatio: 'none' });
    const barras = semanas.map((n, i) => el('rect', { x: i * 10 + 1, width: 8, y: 34 - Math.max(1.5, n / mx * 32), height: Math.max(1.5, n / mx * 32), class: 'me-barra' }, tl));
    el('line', { x1: 0, x2: 530, y1: 34.5, y2: 34.5, class: 'me-eixo' }, tl);
    INICIO_MES.forEach((d, m) => { const x = (d - 1) / 366 * 530; const t = el('text', { x: x + 2, y: 45, class: 'me-mes' }, tl); t.textContent = T.meses[m].slice(0, 3); });
    const agulha = el('line', { x1: 0, x2: 0, y1: 0, y2: 36, class: 'me-agulha' }, tl);

    const leg = document.createElement('div'); leg.className = 'me-leg';
    const cont = document.createElement('p'); cont.className = 'me-cont'; cont.setAttribute('aria-live', 'off');
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'me-rever'; btn.textContent = '↻ ' + T.rever; btn.hidden = true;
    leg.append(cont, btn);
    fig.replaceChildren(svg, tl, leg, ...fig.querySelectorAll('figcaption'));

    const nLoc = D.localidades;
    const fimTexto = () => { cont.innerHTML = T.fim(fmt(P.length), fmt(nLoc)); };
    const pontoFinal = (p) => el('circle', { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: 2.1 }, gp);

    let raf = 0;
    function estatico() {
      cancelAnimationFrame(raf); gp.replaceChildren(); gf.replaceChildren();
      P.forEach(pontoFinal);
      barras.forEach(b => b.classList.add('on')); agulha.setAttribute('transform', 'translate(530,0)');
      fimTexto(); btn.hidden = false; fig.classList.add('me-fim');
    }
    function animar() {
      cancelAnimationFrame(raf); gp.replaceChildren(); gf.replaceChildren(); barras.forEach(b => b.classList.remove('on'));
      fig.classList.remove('me-fim'); btn.hidden = true;
      const dur = +fig.dataset.duracao || 8000; let i = 0, t0 = null;
      const passo = (t) => {
        if (t0 === null) t0 = t;
        const dia = Math.min(366, 1 + (t - t0) / dur * 366);
        while (i < P.length && P[i].d <= dia) {
          const p = P[i++], c = pontoFinal(p); c.classList.add('nasce');
          const f = el('circle', { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: 2.4, class: 'onda' }, gf);
          f.addEventListener('animationend', () => f.remove(), { once: true });
        }
        const sem = Math.floor((dia - 1) / 7); barras.forEach((b, k) => b.classList.toggle('on', k <= sem));
        agulha.setAttribute('transform', `translate(${((dia - 1) / 366 * 530).toFixed(1)},0)`);
        cont.innerHTML = `<b>${T.meses[mesDe(Math.floor(dia))]} de 2024</b> · ${fmt(i)} ${T.acao(i)}`;
        if (dia < 366) raf = requestAnimationFrame(passo);
        else { gf.replaceChildren(); fimTexto(); btn.hidden = false; fig.classList.add('me-fim'); }
      };
      raf = requestAnimationFrame(passo);
    }
    btn.onclick = () => (semMovimento() ? estatico() : animar());

    if (semMovimento() || !('IntersectionObserver' in window)) { estatico(); return; }
    // começa quando o mapa aparece na tela
    const io = new IntersectionObserver(ents => { if (ents.some(e => e.isIntersecting)) { io.disconnect(); animar(); } }, { threshold: 0.25 });
    io.observe(fig);
  }

  const iniciar = () => document.querySelectorAll('figure.mapa-entrada[data-entrada]').forEach(montar);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
