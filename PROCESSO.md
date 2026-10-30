# Processo de construção da base · DATALUTA Argentina 2024

**Banco de Dados das Lutas por Espaços e Territórios (DATALUTA) Argentina 2024 · Movimentos Socioespaciais e Socioterritoriais Urbanos**

Este documento registra, de forma cumulativa, tudo o que foi feito para transformar a planilha de codificação das notícias na base interativa publicada. Serve de memória metodológica, de roteiro para refazer a base do zero e de registro das decisões tomadas a cada etapa.

| Item | Informação |
|---|---|
| Responsável | Wilians Ventura Ferreira Souza (Unesp) |
| Site | <https://wiliansventura98-collab.github.io/site-acoes/> (base interativa em `/base/`, página de metodologia em `/sobre/`, versão em espanhol em `/es/`) |
| Repositório | <https://github.com/wiliansventura98-collab/site-acoes> |
| Versão deste documento | 1.6 · 30/10/2026 |
| Versão em Word | [`PROCESSO.docx`](PROCESSO.docx), gerada por `python pipeline/gerar_processo_docx.py` |
| Licença | Base de dados: CC BY 4.0 · código: MIT (ver [`LICENCAS.md`](LICENCAS.md)) |

> **Como manter este documento.** A cada avanço (correção da base, nova variável, nova fonte, nova análise ou mudança de critério): (1) atualize a seção correspondente; (2) acrescente uma entrada no [Registro de alterações](#9-registro-de-alterações), com data, o que mudou e por quê; (3) mova o que foi resolvido para fora das [Pendências](#10-pendências); (4) aumente o número da versão; (5) gere de novo a versão em Word com `python pipeline/gerar_processo_docx.py`. O documento é versionado junto com o código, então o histórico do Git guarda todas as versões anteriores.

---

## Sumário

1. [Visão geral](#1-visão-geral)
2. [Roteiro para refazer a base](#2-roteiro-para-refazer-a-base)
3. [Privacidade e anonimização](#3-privacidade-e-anonimização)
4. [Tratamento das notícias](#4-tratamento-das-notícias)
5. [Espaço: geocodificação e limites](#5-espaço-geocodificação-e-limites)
6. [Indicadores de contexto](#6-indicadores-de-contexto)
7. [O site: abas, medidas e critérios](#7-o-site-abas-medidas-e-critérios)
8. [Verificações de qualidade](#8-verificações-de-qualidade)
9. [Registro de alterações](#9-registro-de-alterações)
10. [Pendências](#10-pendências)

---

## 1. Visão geral

**Objeto.** Notícias de imprensa sobre ações coletivas de movimentos sociais na Argentina em 2024, lidas na íntegra e codificadas por pesquisadoras e pesquisadores numa ficha padronizada (formulário com 22 variáveis exploráveis: tempo, ação, protagonistas, instituições, espaço e fonte).

**Números atuais da base**

| Medida | Valor |
|---|---|
| Notícias codificadas | 1.019 |
| Notícias únicas (usadas por padrão) | 934 (85 marcadas como repetidas) |
| Variáveis exploráveis | 22 |
| Organizações nomeadas | 822 a 867, conforme a regra de contagem (ver seção 4) |
| Províncias com notícias | 24 jurisdições (23 províncias e CABA) |
| Localidades citadas | 130 com ponto no mapa |
| Veículos de imprensa | 508 a 514 |
| Período | 02/01/2024 a 29/12/2024 |

**Arquitetura.** A planilha original nunca é publicada. Um pipeline em Python gera a versão publicável e todos os arquivos de dados. O site é estático (HTML, CSS e JavaScript), hospedado no GitHub Pages. A cada envio ao ramo `main`, o GitHub Actions verifica a privacidade, roda o pipeline, salva os dados gerados e publica.

```
planilha .xlsx (privada)
   │  anonimizar.py            ← descarta nome, sobrenome e e-mail de quem codificou
   ▼
dados/fonte/acoes_2024_fonte.csv (publicável)
   │  construir_site.py
   │    ├─ preparar_dados.py   ← separa valores múltiplos, unifica grafias, deriva o espaço
   │    ├─ geocodificar.py     ← posiciona as localidades
   │    └─ referências         ← limites, população, Censo, RENABAP, ReNaTEP, eleições, femicídios…
   ▼
dados/base.json · geo.json · resumo.json · acoes_2024.csv · dicionario.md
dados/contexto_censo2022_departamentos.csv · relatorio_geocodificacao.csv · camadas/acoes_2024.gpkg
   │
   ▼
site estático: index.html (início) e base/ (base interativa)
```

---

## 2. Roteiro para refazer a base

O roteiro completo também está em [`pipeline/reconstruir.sh`](pipeline/reconstruir.sh), que executa as etapas na ordem.

```bash
# 0. Ambiente (Python 3.12)
python -m pip install -r pipeline/requirements.txt      # pandas, openpyxl, geopandas, pyogrio, shapely

# 1. Versão publicável da planilha (a planilha .xlsx fica FORA do repositório)
python pipeline/anonimizar.py caminho/2024_Base_Tratada.xlsx --ano 2024
#    → dados/fonte/acoes_2024_fonte.csv

# 2. Verificação de privacidade (interrompe se houver planilha, coluna pessoal ou e-mail)
python pipeline/verificar_privacidade.py

# 3. Dados do site, CSVs abertos e GeoPackage
python pipeline/construir_site.py --ano 2024              # --sem-camadas pula o GeoPackage

# 4. Nova verificação, agora sobre os dados gerados
python pipeline/verificar_privacidade.py

# 5. Versão em espanhol (requer Node; o pacote typescript só é usado para ler o JavaScript)
npm install --prefix i18n --no-save --no-package-lock typescript@5.6.3
node i18n/ferramenta.js gerar                           # → es/, assets/js/app-es/, i18n/pendentes.json

# 6. Ver localmente
python -m http.server 8000                                # abrir http://localhost:8000/base/ e /es/base/

# 7. Publicar: enviar ao ramo main; o GitHub Actions (.github/workflows/publicar.yml) repete 2–5 e publica
git add -A && git commit -m "…" && git push
```

**Atualizar a base com uma nova versão da planilha:** repetir os passos 1 a 7. Os arquivos de referência (`pipeline/referencias/`) não precisam ser baixados de novo.

**Cache do navegador:** ao mudar CSS ou JavaScript, trocar o parâmetro `?v=AAAAMMDDx` em `index.html`, `base/index.html` e `assets/js/app/carregar.js`, para que os visitantes recebam a versão nova.

---

## 3. Privacidade e anonimização

- A planilha original contém nome, sobrenome e e-mail de quem codificou. **Ela nunca vai para o repositório**: o `.gitignore` bloqueia `.xlsx`/`.xls`, e `verificar_privacidade.py` falha se encontrar planilhas, colunas fora da lista publicável ou endereços de e-mail nos dados.
- `anonimizar.py` mantém apenas as colunas listadas em `COLUNAS_PUBLICAVEIS` (`pipeline/comum.py`) e descarta as demais: dados pessoais de quem codificou, data de envio do formulário e observações internas de revisão.
- A verificação roda duas vezes no GitHub Actions: antes e depois de gerar os dados.
- Downloads de dados externos só foram feitos com autorização explícita do responsável (18 e 19/10/2026).

---

## 4. Tratamento das notícias

Executado por `pipeline/preparar_dados.py`.

| Passo | Regra |
|---|---|
| Valores múltiplos | Campos com vários valores, separados por `;` ou quebra de linha, viram listas. Uma notícia pode ter, por exemplo, dois tipos de movimento; por isso as porcentagens podem somar mais de 100%. |
| Grafias | Unificação de maiúsculas, acentos e espaços; siglas de movimentos contam junto com o nome completo (ex.: “UTEP” = “Unión de Trabajadores y Trabajadoras de la Economía Popular (UTEP)”); nomes dos ODS padronizados (`ODS n · nome`); veículos de imprensa padronizados; repetições dentro da mesma notícia removidas. |
| Tipologia da ação | O campo “Acción matriz y derivada” é dividido em **ação matriz** (tipo geral) e **ação derivada** (forma concreta). |
| Espaço | A referência espacial (`localidade;departamento;província;código`) gera província, departamento/partido, localidade e **região do INDEC** (Gran Buenos Aires = CABA + 24 partidos; demais partidos de Buenos Aires em Pampeana). |
| Datas | Data de início da ação; na falta dela, data de publicação. Usada na série semanal e no calendário. |
| Ano e país | Duas variáveis novas no início da base (30/10/2026). **Ano**: coluna `Año` (ou `Ano`) da planilha, se existir; senão, o ano da data da notícia. **País**: coluna `País` (ou `Pais`), se existir; senão, “Argentina”. As duas colunas são opcionais em `anonimizar.py` e `verificar_privacidade.py`. Servem para juntar, numa mesma planilha padronizada, vários anos (2020–2024) e outros países (Brasil), e já aparecem como seletores no topo da base. Hoje a base tem um só ano e um só país, então os seletores mostram apenas 2024 e Argentina. |
| Repetidas | Notícias com `Status = Repetida` (a mesma ação noticiada mais de uma vez) ficam fora por padrão; o usuário pode incluí-las. |
| Sem informação | Categorias como “No informa (NI)” são mantidas na base, mas excluídas dos rankings, das combinações características e da ACM. |

**Contagem de organizações e veículos.** O número varia conforme a regra: 867 nomes distintos incluindo menções genéricas, 822 excluindo “nacional/virtual/não informa” (página inicial). A unificação de nomes duplicados ainda não está completa (ver [Pendências](#10-pendências)).

**Saídas:** `dados/base.json` (formato compacto do site), `dados/entrada.json` (mapa animado da abertura), `dados/acoes_2024.csv` (uma linha por notícia), `dados/dicionario.md` (variáveis e categorias mais frequentes).

---

## 5. Espaço: geocodificação e limites

**Geocodificação** (`pipeline/geocodificar.py`), em ordem de tentativa:

1. coordenadas conferidas manualmente (`referencias/coordenadas_manuais.csv`): 13 localidades;
2. GeoNames, pelo nome da localidade dentro da mesma província (`localidades_geonames_ar.csv`): 111;
3. centro do departamento informado (`departamentos.csv`): 6;
4. não localizadas (referências só de província, fora da Argentina etc.): 4.

O relatório completo está em `dados/relatorio_geocodificacao.csv`.

**Limites** (`referencias/limites/`): departamentos derivados de [mgaitan/departamentos_argentina](https://github.com/mgaitan/departamentos_argentina) com o mapshaper (correção dos rótulos trocados de Malvinas e Antártida, recorte do setor antártico, dissolução das comunas da CABA, simplificação de 3%), 512 departamentos/partidos; países vizinhos do Natural Earth 1:50 milhões.

**Topônimos por zoom:** 877 cidades argentinas com população (GeoNames, CC BY 4.0, via pacote `all-the-cities`), em `toponimos_ar.csv`. Capitais sempre visíveis; demais cidades conforme a população e o nível de aproximação.

**Projeção das pranchas:** cônica conforme de Lambert (paralelos 28° S e 46° S, meridiano central 64° O), WGS 84. Detalhe da AMBA em Mercator.

**Mapa navegável:** Leaflet 1.9.4 com mapa base Esri World Light Gray (base e rótulos) e alternativa OpenStreetMap. O mapa base da CARTO foi abandonado em 18/10/2026 porque passou a exigir chave de acesso.

---

## 6. Indicadores de contexto

Arquivos em `pipeline/referencias/contexto/`; fontes completas em [`FONTES.md`](pipeline/referencias/contexto/FONTES.md). Todos entram no site por `construir_site.py` (`contexto()`, `indec_geoportal()`, `lutas_departamentos()`, `lutas_provincias()` e `contexto_site()`).

### 6.1 Fontes em uso no site

| Indicador | Recorte | Ano | Fonte e obtenção |
|---|---|---|---|
| População, área e densidade | 24 jurisdições | 2022 | INDEC, Censo 2022, resultados definitivos; área calculada pelo projeto (Albers) |
| 15 indicadores do Censo ligados às lutas: privação material (IPMH e tipos), água, esgoto, gás, aluguel, secundário completo, frequência escolar de 15 a 17 anos, jovens que não estudam nem trabalham, desocupação, cobertura de saúde, aposentadoria de mulheres, população indígena; mais a densidade, como referência | Departamento e província | 2022 | INDEC, Geoportal estadístico; API `datosestadisticos.indec.gob.ar/api/v1`, lida em 18/10/2026 pelo navegador (o ambiente de execução não alcança o INDEC). Desocupação calculada como desocupados ÷ (ocupados + desocupados). |
| Pobreza, indigência e desocupação | 6 regiões e 31 aglomerados | 2024 | INDEC, Encuesta Permanente de Hogares (2º semestre e 4º trimestre de 2024) |
| Homicídios dolosos por 100 mil hab. | 24 jurisdições | 2024 | Ministério de Segurança, SNIC-SAT |
| Famílias em bairros populares por 1.000 hab. e bairros por 100 mil hab. | Departamento e província | 2023 | RENABAP, arquivo de 05/12/2023 em datos.gob.ar (6.467 bairros, 1.237.795 famílias), somado por departamento |
| Voto em LLA, UxP, JxC e FIT, % dos votos positivos, 1º turno presidencial | Departamento e província | 2023 | Dirección Nacional Electoral, resultados provisórios mesa a mesa (`2023_generales_1.zip`, 1,08 GB descompactado), somados por seção eleitoral |
| Inscritos no ReNaTEP, % da população de 18 a 65 anos | 24 jurisdições | 2023 | Informe *Juventudes y Economía Popular en el ReNaTEP*, cuadro 2 (dados de 04/04/2023) |
| Femicídios por 100 mil mulheres | 24 jurisdições | 2024 | Corte Suprema, Registro Nacional de Femicidios 2024, tabela 6 |

### 6.2 Indicadores retirados do site (19/10/2026)

Por terem pouca ligação direta com as ações coletivas, saíram do site (continuam no CSV de contexto para download): piso revestido, internet, computador, população inativa, crescimento populacional, índice de feminidade, envelhecimento, dependência, filhos por mulher, afrodescendentes, nascidos no exterior, nascidos em outra província e homicídios de 2023 (repetiam a informação de 2024). A densidade e a população ficaram como **referência**, para controlar o efeito do tamanho das cidades.

### 6.3 Compatibilização entre fontes

| Situação | Tratamento |
|---|---|
| Comunas da CABA | A camada de limites tem a cidade inteira: os valores do Censo são os da jurisdição; RENABAP e eleições somam as 15 comunas. |
| Nomes de departamento diferentes | Casamento por nome normalizado, com apelidos em `ALIAS_INDEC` (Censo) e `ALIAS_DEP` (RENABAP e eleições), por exemplo “Dr. Manuel Belgrano” = “Doctor Manuel Belgrano”, “José M. Ezeiza” = “Ezeiza”, “1º de Mayo” = “1 de Mayo”. |
| Tolhuin (2017) e Lezama (2009) | Não existem na camada de limites: RENABAP e eleições somam-se aos departamentos de origem (Río Grande e Chascomús); no Censo ficam sem polígono. |
| Seção eleitoral Antártida Argentina | Fora do mapa. |
| Tierra del Fuego nas eleições | O nome da província tem vírgula; foi preciso uma leitura do CSV que respeita aspas (corrigido em 19/10/2026). |
| El Cuy (Río Negro) no RENABAP | 7.102 famílias registradas para 6.960 habitantes recenseados (bairros de Las Perlas, junto a Neuquén). Quando as famílias passam de um terço da população, as fontes são tratadas como incompatíveis e o valor fica vazio. |
| 2º turno de 2023 | Não está publicado no mesmo formato pela DINE; usa-se o 1º turno. |

---

## 7. O site: abas, medidas e critérios

Código em `assets/js/app/` (módulos carregados em ordem por `carregar.js`). Todas as análises respondem ao **recorte**: os filtros escolhidos pelo usuário.

| Aba | O que faz | Medidas e critérios |
|---|---|---|
| Síntese | Leitura em texto do recorte com produtos visuais e “Em síntese” | Reúne as regras abaixo; 12 sínteses prontas; versão para imprimir |
| Distribuição | Frequências e cruzamentos | Contagem, % da linha, % da coluna e **associação**: resíduo ajustado de Haberman, (O − E) ÷ √(E × (1 − pᵢ) × (1 − pⱼ)), com E = nᵢ × nⱼ ÷ N; χ² e V de Cramér |
| Comparar | Dois recortes lado a lado | Diferença em pontos percentuais; teste z de duas proporções, significativo com \|z\| ≥ 1,96 |
| Fluxos | Diagrama de Sankey (2 ou 3 etapas) | Contagem fracionada: notícia com várias categorias reparte o peso |
| Tipologias | Mapa de árvore | Área ∝ notícias, contagem fracionada |
| Correspondências | ACM | Codificação difusa, autovalores por Jacobi, inércia corrigida de Benzécri, 8 categorias por variável (validada contra numpy: inércia total 5,08; eixos 6,1% e 5,1% brutos, 41,7% e 17,2% corrigidos) |
| Redes | Coocorrência | Ligação com 2 ou mais notícias em comum; comunidades de Louvain; intermediação de Brandes; grau e força |
| Mapa | Pranchas e mapa navegável | Círculos com área ∝ notícias; taxa = notícias ÷ população × 100.000; classes em quintis; **destaques** pelo teste exato de Poisson (esperado = total × população do lugar ÷ população total; laranja com p < 0,01 e 3 ou mais notícias; azul com p < 0,01 para poucas); **bivariado** 3 × 3 (notícias: nenhuma / até a mediana / acima; indicador em tercis); **LISA** (ver 7.1); animação mensal com escala comum |
| Contexto | Dispersão notícias por habitante × indicador | Pearson r e Spearman ρ (fraca até ±0,3; moderada até ±0,6; forte acima); reta de mínimos quadrados (log do indicador quando a escala é logarítmica); **muito acima/abaixo da tendência** quando o resíduo padronizado ≥ +1,5 ou ≤ −1,5; quadrantes pelas medianas |
| No tempo | Mês, calendário diário e série semanal | Semana de segunda a domingo; **pico** acima de Q3 + 1,5 × (Q3 − Q1); 12 acontecimentos de 2024 com fonte (`acontecimentos_2024.csv`) |
| Imprensa | Quem noticia | Curva de Lorenz, Gini, parcela dos 10 maiores, HHI, veículos × regiões em resíduos ajustados |
| Fichas | Prancha de uma organização, tipo, lugar ou objetivo | Perfis em % das notícias da ficha; mapa, detalhe da AMBA, série mensal; exportação PNG/SVG com a fonte Urbanist embutida |

### 7.1 Pontos quentes e frios (LISA)

I de Moran local (Anselin, 1995), por departamento, calculado no navegador (`lisaCalc` em `assets/js/app/mapas.js`):

1. **Taxa bruta** de cada um dos 511 departamentos com população: notícias que citam o departamento ÷ população do Censo 2022 × 100.000 (departamentos sem notícias entram com zero).
2. **Taxa bayesiana empírica global** (Marshall, 1991): taxa suavizada = m + w × (taxa bruta − m), com m = taxa nacional e w = A ÷ (A + m ÷ população), em que A é a variância entre departamentos descontado o ruído de Poisson. Aproxima da média os departamentos pequenos.
3. **Escore z** das taxas suavizadas (média e desvio-padrão dos departamentos).
4. **Vizinhança por contiguidade “rainha”** (fronteira ou vértice em comum, `topojson.neighbors`), pesos padronizados por linha; defasagem espacial = média dos z dos vizinhos. Departamentos sem vizinhos ficam fora.
5. **I local** = zᵢ × média dos z vizinhos. Classes pelos sinais: alto-alto (ponto quente), baixo-baixo (ponto frio), alto-baixo, baixo-alto.
6. **Permutação condicional**: zᵢ fixo e k vizinhos sorteados sem reposição entre os demais departamentos, 499 vezes; p = (nº de sorteios tão extremos + 1) ÷ 500; classe pintada só com p < 0,05. Semente fixa (resultado reprodutível).
7. **I de Moran global** = Σ zᵢ × defasagemᵢ ÷ Σ zᵢ², com p por 199 permutações das taxas.

Cuidados registrados no site: cerca de 511 testes simultâneos (uns 26 falsos positivos esperados a 5%, sem correção de múltiplos testes); dependência da vizinhança e dos limites; a taxa mede cobertura da imprensa. No recorte completo (19/10/2026): 14 pontos quentes (sobretudo Patagônia andina e Tierra del Fuego), 55 pontos frios (sobretudo partidos do Gran Buenos Aires sem notícias), I global = 0,183 (p ≈ 0,005).

**Critérios da Síntese:** combinações características com resíduo ajustado ≥ +3 (p < 0,003) e 5 ou mais notícias; combinações raras com resíduo ≤ −3; peso populacional por região a partir dos departamentos (separa o GBA do resto da província de Buenos Aires); correlações com Spearman nas 24 províncias, significativas a partir de ±0,41 (p < 0,05), só com indicadores ligados às lutas.

**Recursos de leitura:** guia “Como ler” em todas as abas; glossário com 30 termos; 139 combinações prontas, cada uma com leitura em três partes (o que mostra, o que os dados dizem no recorte atual, como foi calculado); quadro “Como foi calculado este mapa”; “Como foi calculado” no Contexto; link que guarda aba, variáveis e filtros no endereço.

**Identidade visual:** fundo branco, tipografia Urbanist (hospedada no próprio site, licença OFL); mapas em Arial para exportação estável. **Mapa animado da abertura** (página inicial e base, desde 30/10/2026; substituiu a ilustração da marcha): a Argentina é preenchida, dia a dia, por um ponto para cada ação noticiada (notícias únicas, na localidade citada, na data de início da ação ou, na falta dela, na de publicação), em cerca de 8 segundos, e depois fica parada; uma barra de semanas embaixo acompanha o ano e o contador mostra o mês e o número de ações. Pontos do mesmo lugar se espalham em espiral, e por isso as cidades com muitas ações viram manchas. Começa quando o mapa aparece na tela, tem o botão “Ver de novo” e, com “reduzir movimento” ativado no sistema, aparece direto no estado final. Dados em `dados/entrada.json` (gerado por `escrever_entrada` em `pipeline/construir_site.py`: contorno das províncias na projeção cônica conforme de Lambert do site, simplificado, e os pontos já projetados, 835 pontos em 122 localidades, 35 KB); desenho em `assets/js/mapa-entrada.js`, sem bibliotecas, e estilo em `assets/css/mapa-entrada.css`. O código da marcha (`assets/js/marcha.js`) continua no repositório, sem uso.

### 7.2 Seletores de ano e país e busca nas notícias

- No topo da base, ao lado da variável e do cruzamento, há **seletores de ano e de país** (`fAno`, `fPais`), que filtram todas as abas, e um **campo de busca** (`qTop`) sempre visível.
- A busca procura a palavra no título, na fonte e no código da notícia, sem diferenciar maiúsculas nem acentos. Ela **filtra todas as abas** (antes valia só para a lista de notícias), aparece como etiqueta “Palavra: …” nos filtros, entra no texto do recorte das pranchas e fica guardada no link (`q=`). O botão “Ver notícias” leva à lista do recorte.

### 7.3 Página “Sobre e metodologia”

`sobre/index.html` (estilo em `assets/css/sobre.css`): o que é a base, como foi construída (codificação, anonimização, padronização, georreferenciação, indicadores, publicação), variáveis por dimensão, fontes oficiais, como os números são calculados, ferramentas, limites, licença e citação. Ligada no menu da página inicial e da base.

### 7.4 Versão em espanhol

- Endereços: `/es/`, `/es/base/` e `/es/sobre/`; o link “Español”/“Português” no menu troca de idioma (na base, mantendo aba e filtros).
- **Como é gerada.** O português continua sendo o original. `i18n/ferramenta.js` (Node) lê o JavaScript com o analisador do TypeScript e as páginas HTML, encontra cada trecho de texto e o troca pela tradução do catálogo `i18n/es.json` (pares “texto em português” → “texto em espanhol”, cerca de 1.800). Palavras curtas que em outros arquivos são chaves internas (meses abreviados, “forte”, “baixo”…) são traduzidas só no arquivo certo, por `i18n/es-contexto.json`. Textos que são iguais nas duas línguas ou não devem ser traduzidos (nomes de organizações, seletores CSS, definições do INDEC já em espanhol) ficam em `i18n/ignorar.json`.
- Saídas geradas (não editar à mão): `es/index.html`, `es/base/index.html`, `es/sobre/index.html` e `assets/js/app-es/*.js`. Rótulos que vêm dos dados (nomes das variáveis, meses, indicadores, acontecimentos) são traduzidos no navegador, logo depois de carregar os JSON (`TR_DADOS` em `assets/js/app-es/carregar.js`). Datas e números usam o formato `es-AR`.
- O GitHub Actions gera a versão em espanhol a cada publicação. **Ao mudar um texto em português**, rode `node i18n/ferramenta.js gerar`: o que ficar sem tradução aparece em `i18n/pendentes.json` (e no site, em português) até ser acrescentado ao catálogo.
- As categorias da base (tipos de movimento, objetivos etc.) já estão em espanhol na planilha e não mudam.


---

## 8. Verificações de qualidade

| Verificação | Resultado |
|---|---|
| Totais do RENABAP | 6.467 bairros e 1.237.795 famílias, iguais aos do registro |
| Totais eleitorais | LLA 29,99% e UxP 36,69% dos votos positivos, iguais ao resultado oficial |
| ReNaTEP | 3.425.500 inscritos com província e 28.025.327 pessoas de 18 a 65 anos, iguais ao cuadro 2 |
| Femicídios | 228 vítimas diretas, igual à tabela 6 |
| Casamento de departamentos | Todos os nomes do RENABAP e das eleições têm polígono, salvo Antártida |
| ACM | Conferida contra implementação em numpy |
| Regressão do site | Script automático abre as 12 abas e clica nas 139 combinações prontas, em português e em espanhol: sem erros (30/10/2026) |
| Versão em espanhol | Catálogo sem pendências (`i18n/pendentes.json` vazio); varredura das páginas em espanhol, depois de clicar nas combinações prontas, sem palavras em português |
| Privacidade | `verificar_privacidade.py` a cada publicação |
| Leiaute | Painéis conferidos em 1300, 1024, 760 e 390 px de largura |

---

## 9. Registro de alterações

Datas no fuso de São Paulo. Os códigos entre colchetes são os commits do repositório.

### 18/10/2026
- **Primeira versão do site** e base interativa 2024 publicadas no GitHub Pages [bf1632d, 5c440c7].
- Navegação por endereço (`#mapa`, `#tempo`), zoom e arraste nos mapas; README com metodologia e fontes [c1a0ced, 3f2981b].
- **Pipeline em Python**, código modular, dados abertos e GeoPackage para QGIS; publicação automática pelo GitHub Actions com verificação de privacidade [a33414f, cc7cd3c].
- Identidade argentina, gráficos especializados e primeiros indicadores oficiais (população, EPH, homicídios) [968ee5c].
- **28 indicadores do Censo 2022 por departamento** (Geoportal do INDEC) e taxas por departamento [9c2705c].
- Nova identidade visual com fundo branco e marcha desenhada; tipografia Urbanist [ee5db14, 504893c].
- Novas análises: associação (resíduos), Comparar, ACM, mapa bivariado, LISA, série semanal com acontecimentos, comunidades, Imprensa, Fichas e links do recorte [3e910b0].
- Guias “Como ler”, exemplos, leituras automáticas, topônimos que mudam com o zoom e ficha em formato de prancha [88a2c6e, c896e9e].
- Mapa navegável mundial, destaques por população (Poisson), combinações prontas em todas as abas, glossário [f80c8bd].
- **Título DATALUTA**, revisão dos textos e troca do mapa base (CARTO exigia chave; passou a Esri/OSM) [81c0a67].
- Título com **Argentina 2024**, **aba Síntese** e novas combinações prontas [ec307a2].
- Síntese: explicação passo a passo do resíduo ajustado, régua de leitura e combinações raras [2ee97ab].

### 19/10/2026
- **Contexto ligado às lutas:** entram RENABAP, ReNaTEP, voto presidencial de 2023 e femicídios; indicadores separados em “ligados às lutas” e “controles” [6f0fe22].
- **Indicadores sem ligação com as lutas retirados do site**; El Cuy deixado vazio no RENABAP; painel do mapa reorganizado em três blocos; quadro “Como foi calculado este mapa”; cálculo da tendência explicado no Contexto; **leitura em três partes para as 139 combinações prontas** [5839d6f].
- Criado este documento de processo e o roteiro `pipeline/reconstruir.sh`.
- **Licenças definidas:** base de dados sob CC BY 4.0 (arquivo `LICENSE`, que o GitHub reconhece) e código sob MIT (`LICENCA-CODIGO`); `LICENCAS.md` explica o que cada uma cobre, lista as condições dos dados de terceiros e traz a forma de citar; rodapés do site e README atualizados. Motivo: sem licença, ninguém tinha permissão formal de reutilizar a base; a CC BY 4.0 é o padrão em dados científicos abertos, garante o crédito e é compatível com o GeoNames e o datos.gob.ar.
- **Versão em Word do documento de processo** (`PROCESSO.docx`), gerada a partir deste arquivo por `pipeline/gerar_processo_docx.py` (pandoc + python-docx), para circular no grupo.
- **LISA explicado passo a passo** no quadro “Como foi calculado este mapa” (abre sozinho na primeira vez), com exemplo numérico de um ponto quente e de um ponto frio, lista dos departamentos, I global e cuidados; dica do mapa mostra z, média dos vizinhos e I local; glossário e guia ampliados. O teste de permutação passou a sortear os vizinhos **sem reposição** (permutação condicional, como no GeoDa); antes sorteava com reposição. Motivo: pedido de deixar claro como o LISA é calculado.


### 28/10/2026
- **Fichas:** a escolha passou a ser uma lista fechada só com as categorias do tipo de ficha escolhido (por exemplo, só objetivos), com o número de notícias, e um campo para filtrar a lista. Motivo: o campo de texto anterior, com sugestões, deixava o navegador misturar valores digitados antes em outros tipos de ficha (nomes de movimentos, províncias).

### 30/10/2026
- **Ano e país** entram como variáveis (colunas opcionais `Año` e `País` da planilha) e como **seletores no topo da base**. Motivo: preparar a base para juntar os cinco anos da Argentina e os dados do Brasil numa só planilha padronizada.
- **Busca mais visível:** campo fixo no topo da base que filtra todas as abas, com etiqueta nos filtros e guardado no link. Motivo: a busca ficava escondida no fim da página e só valia para a lista de notícias.
- **Página “Sobre e metodologia”** (`/sobre/`). Motivo: reunir num só lugar como a base foi feita, com fontes, cálculos, limites e citação.
- **Versão em espanhol** (`/es/`), gerada a partir do português por `i18n/ferramenta.js` com o catálogo `i18n/es.json`; o GitHub Actions passou a gerá-la e a publicar também `sobre/` e `es/`. Motivo: o público da base é sobretudo argentino e latino-americano (CLACSO). [66fd7e9]
- Seção 2, 4, 7 e 8 atualizadas; `pipeline/reconstruir.sh` ganhou o passo da versão em espanhol.
- **Mapa animado na abertura** da página inicial e da base, no lugar da ilustração da marcha: os pontos das ações vão preenchendo a Argentina ao longo de 2024 e depois o mapa fica parado (ver seção 7, Identidade visual). Motivo: pedido de uma entrada mais dinâmica, que mostre já na abertura onde e quando as ações aconteceram. Também: links do menu passam a quebrar linha em telas estreitas (antes vazavam para a direita no celular).
---

## 10. Pendências

- [ ] **Licenças:** o arquivo `LICENSE` foi trocado no GitHub para MIT (commit 6f63b69), mas `LICENCAS.md`, README, página Sobre e rodapés ainda dizem base de dados sob CC BY 4.0 e código sob MIT. Decidir entre manter CC BY 4.0 para os dados (recomendado) ou adotar MIT para tudo, e alinhar os arquivos. Confirmar também com o grupo/centro de pesquisa.
- [ ] Revisão da versão em espanhol por falante nativo (termos como “recorte”, “ficha”, “plancha”).
- [ ] Depositar a base no Zenodo (ou repositório institucional) para obter um DOI e atualizar a citação em `LICENCAS.md`.
- [ ] **Unificar nomes de organizações duplicados** (ex.: grafias diferentes de CTA e CGT). Afeta contagens, fichas e redes.
- [ ] Resultado do **2º turno de 2023** por departamento, se a DINE publicar no formato mesa a mesa.
- [ ] Outras fontes sugeridas e ainda não coletadas: estudantes de universidades nacionais por província, emprego público por província, titulares do Potenciar Trabajo, projetos de mineração e comunidades indígenas registradas.
- [ ] Atualizar o ReNaTEP e o RENABAP quando houver versões oficiais mais recentes.
- [ ] Revisar a codificação de casos em que organizações da economia popular aparecem também como “movimientos sindicales”.
