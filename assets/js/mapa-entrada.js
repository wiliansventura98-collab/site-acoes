/*
 * Mapa da abertura: a Argentina vai sendo preenchida, dia a dia, pelos pontos das ações noticiadas em 2024
 * e, ao fim do ano, fica parada. Cada ponto é uma ação (notícia única) na localidade citada; pontos no mesmo
 * lugar se espalham num pequeno “girassol”, e por isso as cidades com muitas ações viram manchas.
 *
 * Uso: <figure class="mapa-entrada" data-entrada="dados/entrada.json" data-duracao="8000" data-fundo>…</figure>
 * Com data-fundo, o mapa ocupa todo o cabeçalho (o CSS o põe atrás do texto); no celular, vai de ponta a ponta.
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
        rever: 'Ver de nuevo', rotulo: 'Mapa de la Argentina con un punto por cada acción colectiva informada en 2024',
        nomes: { chile: 'CHILE', bolivia: 'BOLIVIA', paraguai: 'PARAGUAY', brasil: 'BRASIL', uruguai: 'URUGUAY', atlantico: 'OCÉANO\nATLÁNTICO', pacifico: 'OCÉANO PACÍFICO' },
        bandeira: 'Bandera de la Argentina' }
    : { meses: ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'],
        acao: n => n === 1 ? 'ação' : 'ações',
        fim: (n, l) => `<b>${n}</b> ações noticiadas em 2024, em ${l} localidades`,
        rever: 'Ver de novo', rotulo: 'Mapa da Argentina com um ponto para cada ação coletiva noticiada em 2024',
        nomes: { chile: 'CHILE', bolivia: 'BOLÍVIA', paraguai: 'PARAGUAI', brasil: 'BRASIL', uruguai: 'URUGUAI', atlantico: 'OCEANO\nATLÂNTICO', pacifico: 'OCEANO PACÍFICO' },
        bandeira: 'Bandeira da Argentina' };
  const fmt = n => n.toLocaleString(ES ? 'es-AR' : 'pt-BR');
  const el = (tag, at, pai) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); if (pai) pai.append(e); return e; };
  const semMovimento = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // dia do ano (1–366, 2024 é bissexto) → mês (0–11)
  const INICIO_MES = [1, 32, 61, 92, 122, 153, 183, 214, 245, 275, 306, 336];
  const mesDe = d => { let m = 0; while (m < 11 && d >= INICIO_MES[m + 1]) m++; return m; };

  // bandeira argentina: três faixas (celeste, branca, celeste) e o Sol de Maio, com mastro
  function bandeira(pai, x, y, w) {
    const h = w * 0.625, g = el('g', { class: 'me-bandeira', transform: `translate(${x},${y})` }, pai);
    el('title', {}, g).textContent = T.bandeira;
    el('line', { x1: -3, x2: -3, y1: -4, y2: h + 70, class: 'me-mastro' }, g);
    el('rect', { width: w, height: h / 3, fill: '#74acdf' }, g);
    el('rect', { y: h / 3, width: w, height: h / 3, fill: '#ffffff' }, g);
    el('rect', { y: 2 * h / 3, width: w, height: h / 3, fill: '#74acdf' }, g);
    const sol = document.getElementById('sol');
    if (sol) el('use', { href: '#sol', x: w / 2 - h * 0.16, y: h / 2 - h * 0.16, width: h * 0.32, height: h * 0.32 }, g);
    else el('circle', { cx: w / 2, cy: h / 2, r: h * 0.1, fill: '#f6b40e', stroke: '#85340a', 'stroke-width': .8 }, g);
    el('rect', { width: w, height: h, class: 'me-bandeira-borda' }, g);
    return g;
  }

  async function montar(fig) {
    let D;
    try { const r = await fetch(fig.dataset.entrada); if (!r.ok) throw 0; D = await r.json(); } catch (e) { fig.hidden = true; return; }
    const W = D.largura, H = D.altura;
    const [rx, ry, rw, rh] = D.recorte || [0, 0, W, H];

    // ---- mapa: mar com grade, países vizinhos, províncias, contorno, nomes e bandeira ----
    const svg = el('svg', { role: 'img', 'aria-label': T.rotulo, class: 'me-mapa' });
    const cid = 'me-clip-' + Math.random().toString(36).slice(2, 8);
    const clipRect = el('rect', {}, el('clipPath', { id: cid }, el('defs', {}, svg)));
    const quadro = el('g', { 'clip-path': `url(#${cid})` }, svg);
    el('rect', { x: -W, y: -H, width: 3 * W, height: 3 * H, class: 'me-mar' }, quadro);
    if (D.grade) el('path', { d: D.grade, class: 'me-grade' }, quadro);
    if (D.vizinhos) el('path', { d: D.vizinhos, class: 'me-viz' }, quadro);
    const terra = el('g', { class: 'me-terra' }, quadro);
    D.provincias.forEach(p => el('path', { d: p }, terra));
    const divisas = el('g', { class: 'me-divisas' }, quadro);
    D.provincias.forEach(p => el('path', { d: p }, divisas));
    el('path', { d: D.pais, class: 'me-contorno' }, quadro);
    (D.rotulos || []).forEach(([k, x, y, ang]) => {
      const nome = T.nomes[k]; if (!nome) return;
      const oceano = k === 'atlantico' || k === 'pacifico';
      const t = el('text', { x, y, class: (oceano ? 'me-rot me-oceano' : 'me-rot') + ' me-rot-' + k, 'text-anchor': 'middle',
        transform: ang ? `rotate(${ang} ${x} ${y})` : '' }, quadro);
      nome.split('\n').forEach((linha, i) => { const ts = el('tspan', { x, dy: i ? '1.2em' : (nome.includes('\n') ? '-0.2em' : '0.35em') }, t); ts.textContent = linha; });
    });
    const flag = fig.hasAttribute('data-sem-bandeira') ? null : bandeira(quadro, 0, 0, 108);
    const gp = el('g', { class: 'me-pontos' }, quadro);
    const gf = el('g', { class: 'me-flash' }, quadro);
    const moldura = el('rect', { class: 'me-moldura' }, svg);

    // Com data-fundo, o mapa ocupa todo o cabeçalho, atrás do texto: a altura do mapa é a do cabeçalho e o quadro
    // é deslocado para a Argentina começar logo depois do texto. Em tela estreita (ou se a Argentina não couber),
    // mostra só o recorte da Argentina: sem moldura e de ponta a ponta (data-fundo) ou numa moldura (base).
    const cab = fig.hasAttribute('data-fundo') ? fig.closest('header') : null;
    const texto = cab && cab.querySelector('.abertura-txt');
    const [ax0, ax1, ayT, ayB] = D.argentina || [rx + rw * 0.19, rx + rw * 0.83, ry, ry + rh];
    const nav = cab && cab.querySelector('.topo');
    const ajusta = () => {
      let vb = null;
      if (cab && window.innerWidth >= 760) {
        // a Argentina vai de logo abaixo da navegação até perto do pé do cabeçalho, e começa logo depois do texto
        const hr = cab.getBoundingClientRect();
        const topo = nav ? nav.getBoundingClientRect().bottom - hr.top + 6 : 16, pe = 14;
        const s = (hr.height - topo - pe) / (ayB - ayT), vis = hr.width / s;
        const fimTexto = texto ? texto.getBoundingClientRect().right - hr.left + 28 : hr.width * 0.5;
        const x0 = Math.min(ax0 - fimTexto / s, W - vis), y0 = ayT - topo / s;
        if (x0 + vis >= ax1 + 40) vb = [x0, y0, vis, hr.height / s];
      }
      const fundo = !!vb, sangria = !fundo && !!cab;
      fig.classList.toggle('me-fundo', fundo); fig.classList.toggle('me-sangria', sangria);
      if (cab) cab.classList.toggle('com-mapa-fundo', fundo);
      svg.setAttribute('viewBox', (vb || [rx - 2, ry - 2, rw + 4, rh + 4]).join(' '));
      svg.setAttribute('preserveAspectRatio', fundo ? 'xMinYMin meet' : 'xMidYMid meet');
      const r = fundo ? { x: -W, y: -H, width: 3 * W, height: 3 * H, rx: 0 } : { x: rx, y: ry, width: rw, height: rh, rx: sangria ? 0 : 16 };
      for (const k in r) { clipRect.setAttribute(k, r[k]); moldura.setAttribute(k, r[k]); }
      // bandeira: no Atlântico aberto, a leste da Patagônia (fundo) ou junto às Malvinas (recorte)
      if (flag) flag.setAttribute('transform', fundo ? `translate(${Math.min(ax1 + 30, vb[0] + vb[2] - 135)},${ayT + (ayB - ayT) * 0.55})` : `translate(${rx + rw - 140},${ry + rh - 170})`);
    };
    ajusta();
    if (cab && 'ResizeObserver' in window) new ResizeObserver(() => ajusta()).observe(cab); else window.addEventListener('resize', ajusta);

    // posição final de cada ponto: espiral de girassol em torno da localidade
    const vistos = new Map();
    const P = D.pontos.map(([x, y, d]) => {
      const k = `${x},${y}`, i = vistos.get(k) || 0; vistos.set(k, i + 1);
      const a = i * 2.39996, r = 1.55 * Math.sqrt(i);
      return { x: x + r * Math.cos(a), y: y + r * Math.sin(a), d };
    });

    const leg = document.createElement('div'); leg.className = 'me-leg';
    const cont = document.createElement('p'); cont.className = 'me-cont'; cont.setAttribute('aria-live', 'off');
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'me-rever'; btn.textContent = '↻ ' + T.rever; btn.hidden = true;
    leg.append(cont, btn, ...fig.querySelectorAll('figcaption'));
    fig.replaceChildren(svg, leg);

    const nLoc = D.localidades;
    const fimTexto = () => { cont.innerHTML = T.fim(fmt(P.length), fmt(nLoc)); };
    const pontoFinal = (p) => el('circle', { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: 2.1 }, gp);

    let raf = 0;
    function estatico() {
      cancelAnimationFrame(raf); gp.replaceChildren(); gf.replaceChildren();
      P.forEach(pontoFinal);
      fimTexto(); btn.hidden = false; fig.classList.add('me-fim');
    }
    function animar() {
      cancelAnimationFrame(raf); gp.replaceChildren(); gf.replaceChildren();
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
