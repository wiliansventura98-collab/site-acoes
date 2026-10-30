/*
 * Versão em espanhol do site, gerada a partir do código em português.
 *
 *   node i18n/ferramenta.js extrair   → lista os textos traduzíveis ainda sem tradução em i18n/pendentes.json
 *   node i18n/ferramenta.js gerar     → gera es/ (páginas) e assets/js/app-es/ (módulos) com i18n/es.json
 *
 * O catálogo i18n/es.json guarda pares { "texto em português": "texto em espanhol" }, na forma exata em que o
 * texto aparece no código (com as mesmas sequências de escape e os mesmos ${…}). O que não estiver no catálogo
 * fica em português. Requer o pacote "typescript" (usado só para ler o JavaScript com segurança).
 */
const fs = require('fs'), path = require('path');
const ts = require(require.resolve('typescript', { paths: [process.env.NODE_PATH || '', path.join(__dirname, 'node_modules')].filter(Boolean) }));
const RAIZ = path.resolve(__dirname, '..');
const CAT = path.join(__dirname, 'es.json');
const IGN = path.join(__dirname, 'ignorar.json');
// traduções que só valem num arquivo (palavras curtas que em outros arquivos são chaves internas)
const CTX = path.join(__dirname, 'es-contexto.json');
const contexto = fs.existsSync(CTX) ? JSON.parse(fs.readFileSync(CTX, 'utf8')) : {};
const catalogo = fs.existsSync(CAT) ? JSON.parse(fs.readFileSync(CAT, 'utf8')) : {};
const ignorar = new Set(fs.existsSync(IGN) ? JSON.parse(fs.readFileSync(IGN, 'utf8')) : []);

const PAGINAS = [['index.html', 'es/index.html'], ['base/index.html', 'es/base/index.html'], ['sobre/index.html', 'es/sobre/index.html']];
const JS_DIR = 'assets/js/app', JS_ES = 'assets/js/app-es';

// texto que parece prosa a traduzir (e não identificador, seletor, cor, CSS ou caminho)
const ehTexto = t => {
  const s = t.trim();
  if (s.length < 2 || !/[A-Za-zÀ-ú]/.test(s)) return false;
  if (/^[#.]?[a-z][\w-]*$/.test(s) && !/[À-ú]/.test(s)) return false;              // id, classe, chave
  if (/^(#[0-9a-f]{3,8}|\d+(px|em|%)|rgba?\(|translate|M[\d-])/i.test(s)) return false; // cor, medida, path SVG
  if (/^[\w./:-]+\.(js|json|css|png|svg|woff2|csv|gpkg|html)(\?.*)?$/.test(s)) return false; // arquivo
  if (/^https?:\/\//.test(s) && !/\s/.test(s)) return false;
  if (/^(font|stroke|fill|text|data|aria|role|class|style|width|height|transform|cursor|opacity|display|viewBox)[\w-]*$/.test(s)) return false;
  return /[\s]/.test(s) || /[À-ú]/.test(s) || /^[A-ZÁÉÍÓÚ][a-záéíóúãõâêôç]+$/.test(s);
};

// fragmentos de texto do JavaScript: [início, fim, texto bruto] (sem as aspas/crases e sem ${ … })
function fragmentosJS(fonte, nome) {
  const sf = ts.createSourceFile(nome, fonte, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const out = [];
  const visita = n => {
    const k = n.kind, ini = n.getStart(sf), fim = n.getEnd();
    if (k === ts.SyntaxKind.StringLiteral) {
      // ignora chaves de objeto e argumentos de require/import
      out.push([ini + 1, fim - 1, fonte.slice(ini + 1, fim - 1)]);
    } else if (k === ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
      out.push([ini + 1, fim - 1, fonte.slice(ini + 1, fim - 1)]);
    } else if (k === ts.SyntaxKind.TemplateHead) {
      out.push([ini + 1, fim - 2, fonte.slice(ini + 1, fim - 2)]);
    } else if (k === ts.SyntaxKind.TemplateMiddle) {
      out.push([ini + 1, fim - 2, fonte.slice(ini + 1, fim - 2)]);
    } else if (k === ts.SyntaxKind.TemplateTail) {
      out.push([ini + 1, fim - 1, fonte.slice(ini + 1, fim - 1)]);
    }
    ts.forEachChild(n, visita);
  };
  visita(sf);
  return out;
}

// fragmentos de texto do HTML: nós de texto e atributos legíveis (fora de <script>, <style> e <svg>)
function fragmentosHTML(fonte) {
  const out = [], mascara = fonte.replace(/<(script|style|svg|symbol)\b[\s\S]*?<\/\1>/gi, m => ' '.repeat(m.length));
  let m;
  const reTexto = />([^<>]+)</g;
  while ((m = reTexto.exec(mascara))) {
    const bruto = m[1], ini = m.index + 1, a = bruto.search(/\S/); if (a < 0) continue;
    const t = bruto.trim(); out.push([ini + a, ini + a + t.length, t]);
  }
  const reAttr = /\s(title|placeholder|aria-label|alt|content|label)="([^"]*)"/g;
  while ((m = reAttr.exec(mascara))) {
    const ini = m.index + m[0].indexOf('"') + 1; out.push([ini, ini + m[2].length, m[2]]);
  }
  return out;
}

function aplica(fonte, frags, arq) {
  let saida = '', pos = 0, feitos = 0; const local = contexto[arq] || {};
  frags.sort((a, b) => a[0] - b[0]).forEach(([ini, fim, t]) => {
    if (ini < pos) return; const tr = t in local ? local[t] : catalogo[t];
    if (tr != null && tr !== t) { saida += fonte.slice(pos, ini) + tr; pos = fim; feitos++; }
  });
  return [saida + fonte.slice(pos), feitos];
}

const modo = process.argv[2] || 'gerar';
const pend = {};
const registra = (arq, t) => { if (ehTexto(t) && !(t in catalogo) && !ignorar.has(t)) (pend[t] = pend[t] || []).push(arq); };

// ---------- JavaScript ----------
const arqsJS = fs.readdirSync(path.join(RAIZ, JS_DIR)).filter(f => f.endsWith('.js'));
if (modo === 'gerar') fs.mkdirSync(path.join(RAIZ, JS_ES), { recursive: true });
let total = 0;
for (const f of arqsJS) {
  let fonte = fs.readFileSync(path.join(RAIZ, JS_DIR, f), 'utf8');
  const frags = fragmentosJS(fonte, f);
  frags.forEach(([, , t]) => registra(JS_DIR + '/' + f, t));
  if (modo === 'gerar') {
    let [saida, n] = aplica(fonte, frags, f); total += n;
    if (f === 'carregar.js') saida = saida.replace(/\.\.\/dados\//g, '../../dados/').replace(/\.\.\/assets\/js\/app\//g, '../../assets/js/app-es/');
    if (f === 'exportar.js') saida = saida.replace(/'\.\.\/assets\/fonts\//g, "'../../assets/fonts/");
    saida = `/* GERADO por i18n/ferramenta.js a partir de ${JS_DIR}/${f}; não edite: edite o original e i18n/es.json */\nvar IDIOMA='es';\n` + saida;
    fs.writeFileSync(path.join(RAIZ, JS_ES, f), saida);
  }
}

// ---------- textos que vêm dos dados (rótulos de variáveis, meses, indicadores, acontecimentos) ----------
// traduzidos no navegador, logo depois de carregar os JSON (ver TR_DADOS em assets/js/app-es/carregar.js)
const dadosTexto = (() => {
  const b = JSON.parse(fs.readFileSync(path.join(RAIZ, 'dados/base.json'), 'utf8'));
  const g = JSON.parse(fs.readFileSync(path.join(RAIZ, 'dados/geo.json'), 'utf8'));
  const out = new Set();
  b.vars.forEach(v => { out.add(v.label); out.add(v.group); if (v.id === 'mes') v.values.forEach(x => out.add(x)); });
  const c = g.contexto || {};
  ((c.indec || {}).indicadores || []).forEach(d => ['titulo', 'unidade', 'tema', 'definicao', 'fonte'].forEach(k => d[k] && out.add(d[k])));
  (c.lutas_prov || []).forEach(d => ['titulo', 'unidade', 'tema', 'definicao', 'fonte'].forEach(k => d[k] && out.add(d[k])));
  (g.eventos || []).forEach(e => { out.add(e.nome); out.add(e.curto); });
  return [...out].filter(t => t && /[A-Za-zÀ-ú]/.test(t));
})();
dadosTexto.forEach(t => { if (!(t in catalogo) && !ignorar.has(t) && /[\s]|[À-ú]/.test(t)) (pend[t] = pend[t] || []).push('dados'); });
if (modo === 'gerar') {
  const tr = {}; dadosTexto.forEach(t => { if (catalogo[t] != null && catalogo[t] !== t) tr[t] = catalogo[t]; });
  const arq = path.join(RAIZ, JS_ES, 'carregar.js');
  let c = fs.readFileSync(arq, 'utf8');
  c = c.replace("window.__GEO__ = geo;", "window.__GEO__ = geo; traduzDados(base, geo);");
  c = c.replace("(async function carregar() {", `const TR_DADOS = ${JSON.stringify(tr)};
function traduzDados(b, g) {
  const t = s => (s != null && TR_DADOS[s]) || s;
  b.vars.forEach(v => { v.label = t(v.label); v.group = t(v.group); if (v.id === 'mes') v.values = v.values.map(t); });
  const c = g.contexto || {};
  ((c.indec || {}).indicadores || []).concat(c.lutas_prov || []).forEach(d => ['titulo', 'unidade', 'tema', 'definicao', 'fonte'].forEach(k => { if (d[k]) d[k] = t(d[k]); }));
  (g.eventos || []).forEach(e => { e.nome = t(e.nome); e.curto = t(e.curto); });
}
(async function carregar() {`);
  fs.writeFileSync(arq, c);
}

// ---------- páginas ----------
for (const [orig, dest] of PAGINAS) {
  const fonte = fs.readFileSync(path.join(RAIZ, orig), 'utf8');
  const frags = fragmentosHTML(fonte);
  frags.forEach(([, , t]) => registra(orig, t));
  if (modo !== 'gerar') continue;
  let [saida, n] = aplica(fonte, frags, orig); total += n;
  const prof = orig.split('/').length - 1; // 0 para index.html, 1 para base/ e sobre/
  // caminhos relativos: a página fica um nível mais fundo (es/…)
  saida = saida.replace(/(href|src|data-resumo|data-entrada)="(?!https?:|#|data:|mailto:)([^"]*)"/g, (m0, at, url) => {
    if (/^(\.\.\/)?es\//.test(url)) return m0; // links de idioma tratados abaixo
    return `${at}="../${url}"`;
  });
  saida = saida.replace('<html lang="pt-BR">', '<html lang="es">').replace('aria-label="Ilustração de uma marcha"', 'aria-label="Ilustración de una marcha"');
  saida = saida.replace(/assets\/js\/app\/carregar\.js/g, 'assets/js/app-es/carregar.js');
  // link de idioma: na versão em espanhol aponta para o português
  const volta = prof === 0 ? '../' : `../../${orig.split('/')[0]}/`;
  saida = saida.replace(/<a href="(\.\.\/)?(\.\.\/)?es\/[^"]*" hreflang="es" lang="es"( id="linkIdioma")?>Español<\/a>/,
    `<a href="${volta}" hreflang="pt-BR" lang="pt-BR"$3>Português</a>`);
  fs.mkdirSync(path.dirname(path.join(RAIZ, dest)), { recursive: true });
  fs.writeFileSync(path.join(RAIZ, dest), `<!-- GERADO por i18n/ferramenta.js a partir de ${orig}; não edite -->\n` + saida);
}

const np = Object.keys(pend).length;
fs.writeFileSync(path.join(__dirname, 'pendentes.json'), JSON.stringify(pend, null, 1));
console.log(`${modo}: ${total} trechos traduzidos; ${np} textos sem tradução (i18n/pendentes.json)`);
