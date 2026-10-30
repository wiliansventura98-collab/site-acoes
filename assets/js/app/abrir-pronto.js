/*
 * Abrir uma combinação pronta pelo endereço
 * Acrescenta o parâmetro “pronto=ABA:N” ao endereço da base: abre a aba e aplica a N-ésima combinação pronta
 * dela (contando de 0, na ordem em que os botões aparecem). É o que a galeria de perguntas da página inicial
 * usa. Ex.: base/#mapa?pronto=map:4 abre o mapa de pontos quentes. O resto do endereço continua valendo.
 * O parâmetro é lido logo ao carregar (antes que a base reescreva o endereço) e aplicado quando a base
 * termina de abrir a primeira aba.
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */
const lerPronto = () => {
  const h = location.hash || '', i = h.indexOf('?'); if (i < 0) return null;
  const m = /^([a-z]+):(\d+)$/.exec(new URLSearchParams(h.slice(i + 1)).get('pronto') || '');
  return m && Object.values(TABS).includes(m[1]) ? { aba: m[1], n: +m[2] } : null;
};
function aplicarPronto(p) {
  if (!p) return;
  if (TAB !== p.aba) setTab(p.aba);
  const bt = document.querySelectorAll('#' + p.aba + 'Presets button')[p.n];
  if (bt) { bt.click(); const t = document.querySelector('.tabs'); if (t) t.scrollIntoView({ block: 'start' }); }
  urlSync(); // o endereço passa a descrever o recorte aplicado, sem o “pronto”
}
{
  let pendente = lerPronto();
  const setTabOriginal = setTab;
  setTab = function (...args) {
    const r = setTabOriginal.apply(this, args);
    if (pendente) { const p = pendente; pendente = null; setTimeout(() => aplicarPronto(p), 0); }
    return r;
  };
  window.addEventListener('hashchange', () => aplicarPronto(lerPronto()));
}
