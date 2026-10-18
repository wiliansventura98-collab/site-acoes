/*
 * Marcha
 * Ilustração gerada em SVG: uma coluna de manifestantes atravessa a página levando faixas com os
 * objetivos mais frequentes da base (dados/resumo.json → "lemas") e bandeiras argentinas ao fundo.
 * A faixa de cabeceira, no centro da primeira fileira, leva o objetivo mais citado.
 * Uso: <svg class="marcha" data-resumo="dados/resumo.json" data-altura="380"></svg>
 */
(function(){
  const NS = 'http://www.w3.org/2000/svg';
  const COR = { tinta:'#13294b', celeste:'#6cace4', celesteM:'#9cc6ec', celesteC:'#d4e6f6', sol:'#f2a900', branco:'#ffffff' };
  const FONTE = '"Urbanist", "Helvetica Neue", Arial, sans-serif';

  function rng(seed){ return function(){ seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function el(tag, attrs, pai){ const e = document.createElementNS(NS, tag); for(const k in attrs) e.setAttribute(k, attrs[k]); if(pai) pai.appendChild(e); return e; }
  const ctx = document.createElement('canvas').getContext('2d');
  function largura(txt, px){ ctx.font = `800 ${px}px ${FONTE}`; return ctx.measureText(txt).width; }

  // Uma pessoa em silhueta, com os pés em (x, y) e altura s. pose: 'livre' | 'punho' | 'segura' (mãos no mastro em hx)
  function pessoa(g, x, y, s, cor, pose, r, hx){
    const sw = s*0.085, passo = (r()-.5)*0.22*s;
    const quadril = y - 0.45*s, ombro = y - 0.79*s;
    const linha = (x1,y1,x2,y2,w) => el('path', {d:`M${x1.toFixed(1)},${y1.toFixed(1)}L${x2.toFixed(1)},${y2.toFixed(1)}`, stroke:cor, 'stroke-width':(w||sw).toFixed(1), 'stroke-linecap':'round', fill:'none'}, g);
    linha(x-0.045*s, quadril, x-0.11*s+passo, y);
    linha(x+0.045*s, quadril, x+0.10*s-passo*0.6, y);
    const w1 = 0.125*s, w2 = 0.095*s;
    el('path', {d:`M${x-w1},${ombro+0.03*s} Q${x-w1},${ombro} ${x-w1+0.05*s},${ombro} L${x+w1-0.05*s},${ombro} Q${x+w1},${ombro} ${x+w1},${ombro+0.03*s} L${x+w2},${quadril} L${x-w2},${quadril} Z`, fill:cor}, g);
    el('circle', {cx:x.toFixed(1), cy:(y-0.885*s).toFixed(1), r:(0.072*s).toFixed(1), fill:cor}, g);
    const bw = sw*0.92;
    if(pose==='segura'){
      const lado = hx < x ? -1 : 1;
      linha(x+lado*0.11*s, ombro+0.02*s, hx, y-1.0*s, bw);
      linha(x-lado*0.11*s, ombro+0.02*s, x-lado*0.15*s, y-0.52*s, bw);
    } else if(pose==='punho'){
      const lado = r() < .5 ? -1 : 1;
      linha(x+lado*0.11*s, ombro+0.02*s, x+lado*0.17*s, y-1.13*s, bw);
      el('circle', {cx:(x+lado*0.17*s).toFixed(1), cy:(y-1.15*s).toFixed(1), r:(0.045*s).toFixed(1), fill:cor}, g);
      linha(x-lado*0.11*s, ombro+0.02*s, x-lado*0.16*s, y-0.52*s, bw);
    } else {
      linha(x-0.11*s, ombro+0.02*s, x-0.16*s, y-0.52*s, bw);
      linha(x+0.11*s, ombro+0.02*s, x+0.15*s+passo*0.3, y-0.53*s, bw);
    }
  }

  // Bandeira argentina ondulando num mastro
  function bandeira(g, x, y, s, r, mastro){
    const topo = y - 1.75*s, w = 0.55*s, h = 0.36*s, o = (r()*.5+.5)*0.06*s;
    el('path', {d:`M${x},${y-0.95*s}L${x},${topo}`, stroke:mastro, 'stroke-width':(0.03*s).toFixed(1), 'stroke-linecap':'round'}, g);
    const faixa = (y0, cor) => el('path', {d:`M${x},${y0} q${w/2},${-o} ${w},${0} l0,${h/3} q${-w/2},${o} ${-w},0 Z`, fill:cor}, g);
    faixa(topo, COR.celeste); faixa(topo+h/3, COR.branco); faixa(topo+2*h/3, COR.celeste);
    el('circle', {cx:x+w*0.5, cy:topo+h/2-o*0.25, r:h*0.08, fill:COR.sol}, g);
    el('path', {d:`M${x},${topo} q${w/2},${-o} ${w},0 l0,${h} q${-w/2},${o} ${-w},0 Z`, fill:'none', stroke:mastro, 'stroke-width':0.6, 'stroke-opacity':.35}, g);
  }

  // Faixa (pancarta) segurada por duas pessoas
  function faixa(g, cx, y, s, texto, estilo, r){
    const fs = s*0.2, tw = largura(texto.toUpperCase(), fs), w = tw + s*0.5, h = s*0.33;
    const x0 = cx - w/2, x1 = cx + w/2, topo = y - 1.38*s;
    const mastro = estilo.mastro;
    pessoa(g, x0+0.02*s, y, s, estilo.gente, 'segura', r, x0);
    pessoa(g, x1-0.02*s, y + (r()-.5)*0.02*s, s, estilo.gente, 'segura', r, x1);
    [x0, x1].forEach(px => el('path', {d:`M${px},${y-0.93*s}L${px},${topo-0.06*s}`, stroke:mastro, 'stroke-width':(0.035*s).toFixed(1), 'stroke-linecap':'round'}, g));
    const ond = s*0.03;
    el('path', {d:`M${x0},${topo} Q${cx},${topo+ond} ${x1},${topo} L${x1},${topo+h} Q${cx},${topo+h+ond} ${x0},${topo+h} Z`, fill:estilo.fundo, stroke:estilo.borda, 'stroke-width':1.2}, g);
    if(estilo.listras){
      const lh = h*0.16;
      el('path', {d:`M${x0},${topo} Q${cx},${topo+ond} ${x1},${topo} L${x1},${topo+lh} Q${cx},${topo+lh+ond} ${x0},${topo+lh} Z`, fill:COR.celeste}, g);
      el('path', {d:`M${x0},${topo+h-lh} Q${cx},${topo+h-lh+ond} ${x1},${topo+h-lh} L${x1},${topo+h} Q${cx},${topo+h+ond} ${x0},${topo+h} Z`, fill:COR.celeste}, g);
    }
    const t = el('text', {x:cx, y:(topo+h/2+fs*0.36+ond*0.5).toFixed(1), 'text-anchor':'middle', 'font-family':FONTE, 'font-weight':800, 'font-size':fs.toFixed(1), fill:estilo.texto, 'letter-spacing':(fs*0.02).toFixed(1)}, g);
    t.textContent = texto.toUpperCase();
    return [x0 - 0.15*s, x1 + 0.15*s];
  }

  // Faixa de cabeceira: longa, à altura do peito, levada pela primeira fileira
  function cabecera(g, cx, y, s, texto){
    const fs = s*0.17, tw = largura(texto.toUpperCase(), fs), w = tw + s*0.9, h = s*0.3;
    const x0 = cx - w/2, x1 = cx + w/2, topo = y - 0.74*s, ond = s*0.025;
    el('path', {d:`M${x0},${topo} Q${cx},${topo+ond} ${x1},${topo} L${x1},${topo+h} Q${cx},${topo+h+ond} ${x0},${topo+h} Z`, fill:COR.branco, stroke:COR.tinta, 'stroke-width':1.4}, g);
    const lh = h*0.17;
    el('path', {d:`M${x0},${topo} Q${cx},${topo+ond} ${x1},${topo} L${x1},${topo+lh} Q${cx},${topo+lh+ond} ${x0},${topo+lh} Z`, fill:COR.celeste}, g);
    el('path', {d:`M${x0},${topo+h-lh} Q${cx},${topo+h-lh+ond} ${x1},${topo+h-lh} L${x1},${topo+h} Q${cx},${topo+h+ond} ${x0},${topo+h} Z`, fill:COR.celeste}, g);
    [x0, x1].forEach(px => el('path', {d:`M${px},${topo-0.08*s}L${px},${topo+h+0.1*s}`, stroke:COR.tinta, 'stroke-width':(0.03*s).toFixed(1), 'stroke-linecap':'round'}, g));
    const t = el('text', {x:cx, y:(topo+h/2+fs*0.36+ond*0.5).toFixed(1), 'text-anchor':'middle', 'font-family':FONTE, 'font-weight':800, 'font-size':fs.toFixed(1), fill:COR.tinta}, g);
    t.textContent = texto.toUpperCase();
  }

  function desenhar(svg, lemas){
    const H = +svg.dataset.altura || 360, r = rng(+svg.dataset.semente || 2024);
    const W = Math.max(520, Math.round(H * (svg.clientWidth || 1600) / (svg.clientHeight || H)));
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMax meet');
    // só entram as faixas que cabem inteiras, sem se sobrepor às da mesma fileira
    const cabe = (lista, cx, w) => { const a = cx - w/2, b = cx + w/2; if(a < 8 || b > W - 8 || lista.some(([p,q]) => a < q + 24 && b > p - 24)) return false; lista.push([a,b]); return true; };
    const L = (lemas && lemas.length ? lemas : [['Trabajo',1],['Derechos humanos',1],['Educación',1]]).slice(0, 7);
    // fundo: multidão clara com bandeiras; meio: cartazes erguidos em mastros; frente: faixas de cabeceira
    const fundo = { y:H*0.66, s:H*0.30, gente:COR.celesteC, passo:0.28 };
    const meio  = { y:H*0.83, s:H*0.42, gente:COR.celesteM, passo:0.34 };
    const frente= { y:H*1.00, s:H*0.56, gente:COR.tinta, passo:0.40 };
    const gF = el('g', {class:'fileira f0'}, svg), gM = el('g', {class:'fileira f1'}, svg), gR = el('g', {class:'fileira f2'}, svg);
    let x = -fundo.s*0.2, n = 0;
    while(x < W + fundo.s*0.3){ const ss = fundo.s*(0.9+r()*0.16);
      if(n % (H < 200 ? 14 : 8) === 3) bandeira(gF, x+0.12*ss, fundo.y, ss, r, '#a9c7e4');
      pessoa(gF, x, fundo.y + (r()-.5)*0.05*fundo.s, ss, fundo.gente, r() < .12 ? 'punho' : 'livre', r);
      x += fundo.s*fundo.passo*(0.7 + r()*0.6); n++; }
    // meio: cartazes com os objetivos 2, 3, 6 e 7
    const estiloMeio = { fundo:COR.sol, borda:COR.sol, texto:COR.tinta, mastro:'#7a9cc0', gente:COR.celesteM };
    const cart = [[L[1], 0.31], [L[2], 0.69], [L[5], 0.05], [L[6], 0.95]].filter(c => c[0]);
    const gCart = el('g', {}, null), ocupado = [];
    const usados = [];
    cart.forEach(([[txt], px]) => { const w = largura(txt.toUpperCase(), meio.s*0.2) + meio.s*0.5 + meio.s*0.3; if(cabe(usados, W*px, w)) ocupado.push(faixa(gCart, W*px, meio.y, meio.s, txt, estiloMeio, r)); });
    x = -meio.s*0.2;
    while(x < W + meio.s*0.3){
      if(!ocupado.some(([a,b]) => x > a - meio.s*0.08 && x < b + meio.s*0.08)) pessoa(gM, x, meio.y + (r()-.5)*0.03*meio.s, meio.s*(0.92+r()*0.14), meio.gente, r() < .14 ? 'punho' : 'livre', r);
      x += meio.s*meio.passo*(0.75 + r()*0.6); }
    gM.appendChild(gCart);
    // frente: gente e, por cima, as cabeceiras com os objetivos 1, 4 e 5
    x = -frente.s*0.2;
    const sobCartaz = x => usados.some(([a,b]) => x > a - frente.s*0.3 && x < b + frente.s*0.3);
    while(x < W + frente.s*0.3){ pessoa(gR, x, frente.y + (r()-.5)*0.02*frente.s, frente.s*(0.94+r()*0.1), frente.gente, r() < .2 && !sobCartaz(x) ? 'punho' : 'livre', r);
      x += frente.s*frente.passo*(0.8 + r()*0.5); }
    const usadosF = [];
    [[L[0], 0.5], [L[3], 0.17], [L[4], 0.83]].filter(c => c[0]).forEach(([[txt], px]) => { const w = largura(txt.toUpperCase(), frente.s*0.17) + frente.s*0.9; if(cabe(usadosF, W*px, w)) cabecera(gR, W*px, frente.y, frente.s, txt); });
    el('path', {d:`M0,${H-0.5}L${W},${H-0.5}`, stroke:COR.tinta, 'stroke-width':1}, svg);
    const tit = el('title', {}, null); tit.textContent = 'Ilustração: marcha com faixas dos objetivos mais frequentes nas notícias: ' + L.map(l=>l[0]).join(', ');
    svg.insertBefore(tit, svg.firstChild);
    svg.setAttribute('role', 'img');
    svg.classList.add('pronta');
  }

  function iniciar(){
    document.querySelectorAll('svg.marcha').forEach(svg => {
      const url = svg.dataset.resumo;
      const vai = lemas => (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => desenhar(svg, lemas));
      if(!url) return vai(null);
      fetch(url, {cache:'no-cache'}).then(r => r.ok ? r.json() : null).then(d => { svg._lemas = d && d.lemas; vai(svg._lemas); }).catch(() => vai(null));
      // redesenha quando a largura muda bastante (rotação do celular, janela redimensionada)
      if('ResizeObserver' in window){ let w0 = svg.clientWidth, t; new ResizeObserver(() => { if(Math.abs(svg.clientWidth - w0) < 40) return; w0 = svg.clientWidth; clearTimeout(t); t = setTimeout(() => desenhar(svg, svg._lemas), 150); }).observe(svg); }
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
