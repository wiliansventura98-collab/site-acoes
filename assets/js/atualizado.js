/*
 * Data de atualização dos dados: preenche os elementos [data-atualizado] com a data da última mudança na planilha
 * publicável (campo "atualizado" de dados/resumo.json, gerado pelo pipeline). O caminho do resumo vem do
 * atributo data-resumo do próprio elemento.
 */
(function () {
  const ES = document.documentElement.lang === 'es';
  const pre = ES ? 'Datos actualizados el ' : 'Dados atualizados em ';
  const iniciar = () => document.querySelectorAll('[data-atualizado][data-resumo]').forEach(async e => {
    try {
      const r = await fetch(e.dataset.resumo); if (!r.ok) return;
      const d = (await r.json()).atualizado; if (!d) return;
      const [a, m, dia] = d.split('-');
      const t = document.createElement('time'); t.dateTime = d; t.textContent = `${dia}/${m}/${a}`;
      e.textContent = pre; e.append(t); e.hidden = false;
    } catch (err) { /* sem a data, o elemento continua oculto */ }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
