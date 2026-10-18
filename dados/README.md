# Dados

Arquivos gerados pelo [pipeline](../pipeline/). Não edite à mão: eles são recriados a cada publicação.

| Arquivo | Para quê |
|---|---|
| [`acoes_2024.csv`](acoes_2024.csv) | Base tratada, uma linha por notícia. Campos com vários valores vêm separados por `; `. Abre no Excel, LibreOffice, R e Python. |
| [`dicionario.md`](dicionario.md) | Descrição de cada variável e suas categorias mais frequentes. |
| [`camadas/acoes_2024.gpkg`](camadas/acoes_2024.gpkg) | GeoPackage para QGIS ou ArcGIS (ver abaixo). |
| [`relatorio_geocodificacao.csv`](relatorio_geocodificacao.csv) | Como cada localidade foi posicionada (manual, GeoNames ou centro do departamento). |
| `base.json`, `geo.json` | Formato compacto lido pela base interativa. |
| `fonte/acoes_2024_fonte.csv` | Entrada do pipeline: planilha de codificação sem dados pessoais. |

## Camadas do GeoPackage

Abra o arquivo no QGIS (arrastar para o mapa ou *Camada → Adicionar camada vetorial*). Todas as camadas estão em WGS 84 (EPSG:4326); para medir áreas e distâncias, reprojete para uma projeção da Argentina, como POSGAR 2007 (EPSG:5343 a 5349).

| Camada | Geometria | Atributos principais |
|---|---|---|
| `localidades` | ponto | localidade, departamento, província, região, método de localização, nº de notícias |
| `departamentos` | polígono | departamento/partido, província, região, nº de notícias |
| `provincias` | polígono | província, população 2022, nº de notícias, taxa por 100 mil habitantes |
| `regioes` | polígono | região do INDEC, nº de notícias |
| `noticias_por_localidade` | ponto | uma linha por notícia × localidade, com título, data, link, escala, direcionalidade, tipologia, objetivos, movimento, instituição e fonte |

As contagens consideram as notícias únicas (sem as marcadas como repetidas). Uma notícia que cita vários lugares conta em cada um deles. Para representar valores absolutos, use símbolos proporcionais; para coropléticos, use a taxa por habitante.
