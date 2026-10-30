/*
 * Página “Produções”: lê dados/producoes.csv (uma linha por produção) e monta a lista, agrupada por ano,
 * com filtro por tipo e busca. O CSV é editado à mão (ou no GitHub); colunas:
 * ano, tipo, titulo, autores, onde, link, resumo, resumo_es.
 */
(function () {
  const ES = document.documentElement.lang === 'es';
  const TIPOS_ES = { 'Artigo': 'Artículo', 'Capítulo de livro': 'Capítulo de libro', 'Livro': 'Libro', 'Apresentação': 'Presentación',
    'Tese ou dissertação': 'Tesis o disertación', 'Relatório': 'Informe', 'Material didático': 'Material didáctico',
    'Base de dados': 'Base de datos', 'Documento técnico': 'Documento técnico' };
  const T = ES
    ? { todos: 'Todos', conta: n => n === 1 ? '1 producción' : `${n} producciones`, vazio: 'Ninguna producción coincide con la búsqueda.',
        erro: 'No se pudo cargar la lista de producciones.', abrir: 'Abrir', tipo: t => TIPOS_ES[t] || t }
    : { todos: 'Todos', conta: n => n === 1 ? '1 produção' : `${n} produções`, vazio: 'Nenhuma produção corresponde à busca.',
        erro: 'Não foi possível carregar a lista de produções.', abrir: 'Abrir', tipo: t => t };

  // CSV com aspas (campos com vírgula ou quebra de linha entre aspas duplas)
  function lerCSV(txt) {
    const linhas = []; let campo = '', linha = [], aspas = false;
    txt = txt.replace(/^﻿/, '');
    for (let i = 0; i < txt.length; i++) {
      const c = txt[i];
      if (aspas) { if (c === '"') { if (txt[i + 1] === '"') { campo += '"'; i++; } else aspas = false; } else campo += c; }
      else if (c === '"') aspas = true;
      else if (c === ',') { linha.push(campo); campo = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && txt[i + 1] === '\n') i++; linha.push(campo); campo = ''; if (linha.some(x => x.trim())) linhas.push(linha); linha = []; }
      else campo += c;
    }
    if (campo || linha.length) { linha.push(campo); if (linha.some(x => x.trim())) linhas.push(linha); }
    const cab = (linhas.shift() || []).map(s => s.trim());
    return linhas.map(l => Object.fromEntries(cab.map((k, i) => [k, (l[i] || '').trim()])));
  }
  const semAcento = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

  async function iniciar() {
    const lista = document.getElementById('prodLista'), conta = document.getElementById('prodConta');
    if (!lista) return;
    let itens;
    try { const r = await fetch(lista.dataset.fonte); if (!r.ok) throw 0; itens = lerCSV(await r.text()); }
    catch (e) { conta.textContent = T.erro; return; }
    itens.sort((a, b) => (+b.ano || 0) - (+a.ano || 0) || a.titulo.localeCompare(b.titulo));
    let tipo = '', q = '';
    const tipos = [...new Set(itens.map(i => i.tipo).filter(Boolean))].sort((a, b) => T.tipo(a).localeCompare(T.tipo(b)));
    const box = document.getElementById('prodTipos');
    const botao = (rot, val) => { const b = el('button', 'prod-tipo', rot); b.type = 'button'; b.setAttribute('aria-pressed', String(val === tipo));
      b.onclick = () => { tipo = val; box.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); desenhar(); }; return b; };
    box.append(botao(T.todos, ''), ...tipos.map(t => botao(T.tipo(t), t)));
    const busca = document.getElementById('prodBusca');
    busca.addEventListener('input', () => { q = semAcento(busca.value.trim()); desenhar(); });

    function desenhar() {
      const vis = itens.filter(i => (!tipo || i.tipo === tipo) && (!q || semAcento([i.titulo, i.autores, i.onde, i.resumo, i.resumo_es].join(' ')).includes(q)));
      conta.textContent = vis.length ? T.conta(vis.length) : T.vazio;
      lista.textContent = '';
      const anos = [...new Set(vis.map(i => i.ano || '—'))];
      anos.forEach(ano => {
        const sec = el('section', 'prod-ano'); sec.append(el('h2', null, ano));
        const ul = el('ul');
        vis.filter(i => (i.ano || '—') === ano).forEach(i => {
          const li = el('li', 'prod-item');
          li.append(el('span', 'prod-badge', T.tipo(i.tipo)));
          const h = el('h3');
          if (/^https?:\/\//.test(i.link)) { const a = el('a', null, i.titulo); a.href = i.link; a.target = '_blank'; a.rel = 'noopener'; h.append(a); } else h.textContent = i.titulo;
          li.append(h);
          li.append(el('p', 'prod-ref', [i.autores, i.onde].filter(Boolean).join(' · ')));
          const res = ES ? (i.resumo_es || i.resumo) : (i.resumo || i.resumo_es);
          if (res) li.append(el('p', 'prod-resumo', res));
          ul.append(li);
        });
        sec.append(ul); lista.append(sec);
      });
    }
    desenhar();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
