/*
 * Carregamento da base interativa.
 * Busca os dados gerados pelo pipeline (dados/base.json e dados/geo.json) e, em seguida,
 * executa os módulos da aplicação na ordem em que dependem uns dos outros.
 */
(async function carregar() {
  const MODULOS = ['nucleo', 'distribuicao', 'noticias', 'interface', 'mapas', 'fluxos', 'tipologias', 'redes', 'contexto', 'exportar', 'tempo', 'comparar', 'correspondencias', 'semanas', 'imprensa', 'fichas', 'estado', 'iniciar'];
  const lede = document.getElementById('lede');

  const json = async (url) => {
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
    return r.json();
  };
  const script = (src) => new Promise((ok, falha) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = ok;
    s.onerror = () => falha(new Error(`Não foi possível carregar ${src}`));
    document.body.appendChild(s);
  });

  try {
    const [base, geo] = await Promise.all([json('../dados/base.json'), json('../dados/geo.json')]);
    window.__BASE__ = base;
    window.__GEO__ = geo;
    for (const m of MODULOS) await script(`../assets/js/app/${m}.js?v=20261018d`);
  } catch (erro) {
    console.error(erro);
    if (lede) lede.textContent = 'Não foi possível carregar a base. Verifique a conexão e recarregue a página.';
  }
})();
