# Pipeline de dados

Scripts em Python que transformam a planilha de codificação nos dados publicados pelo site. Todo o tratamento é reprodutível: os mesmos arquivos de entrada geram sempre os mesmos resultados.

```
planilha .xlsx ──► anonimizar.py ──► dados/fonte/acoes_2024_fonte.csv
                                            │
                                            ▼
                                   construir_site.py
                     ┌──────────────────────┼───────────────────────┐
             preparar_dados.py        geocodificar.py         (referências)
                     └──────────────────────┼───────────────────────┘
                                            ▼
     dados/base.json · dados/geo.json · dados/acoes_2024.csv · dados/dicionario.md
     dados/relatorio_geocodificacao.csv · dados/camadas/acoes_2024.gpkg
```

## Etapas

| Script | O que faz |
|---|---|
| `anonimizar.py` | Lê a planilha original e mantém apenas as colunas publicáveis. Descarta nome, sobrenome e e-mail de quem codificou, a data de envio do formulário e as observações internas. |
| `preparar_dados.py` | Separa campos com vários valores, unifica grafias (maiúsculas, acentos, siglas de movimentos, ODS, veículos), divide a tipologia em ação matriz e derivada e lê a referência espacial para obter província, departamento/partido, localidade e região do INDEC. |
| `geocodificar.py` | Posiciona cada localidade: coordenadas conferidas manualmente, depois GeoNames dentro da mesma província e, na falta, o centro do departamento. |
| `construir_site.py` | Executa as etapas e grava os arquivos em `dados/`, inclusive o GeoPackage para QGIS. |
| `verificar_privacidade.py` | Interrompe a publicação se encontrar planilhas originais, colunas pessoais ou e-mails nos dados. |
| `comum.py` | Definições compartilhadas: variáveis, regiões, partidos do Gran Buenos Aires, normalização de texto. |

## Executar localmente

```bash
python -m pip install -r pipeline/requirements.txt
python pipeline/anonimizar.py caminho/2024_Base_Tratada.xlsx --ano 2024
python pipeline/construir_site.py --ano 2024
python pipeline/verificar_privacidade.py
```

Para ver o site com os dados novos, sirva a pasta do repositório (por exemplo, `python -m http.server`) e abra `http://localhost:8000/base/`.

## Atualizar a base publicada

1. Gere a versão publicável da planilha com `anonimizar.py` (ou peça ao Claude).
2. Substitua `dados/fonte/acoes_2024_fonte.csv` no repositório.
3. Ao chegar no ramo `main`, o GitHub Actions verifica a privacidade, roda o pipeline, salva os dados gerados e publica o site.

**Nunca envie a planilha `.xlsx` original ao repositório.** Ela contém dados pessoais de quem codificou; o `.gitignore` e a verificação de privacidade bloqueiam esse envio, mas um arquivo enviado fica no histórico do Git mesmo depois de apagado.

## Referências (`pipeline/referencias/`)

| Arquivo | Conteúdo |
|---|---|
| `departamentos.csv` | 512 departamentos/partidos com província, região do INDEC e centróide |
| `localidades_geonames_ar.csv` | Localidades argentinas do GeoNames (via pacote `cities.json`) |
| `coordenadas_manuais.csv` | Localidades conferidas manualmente |
| `contexto/` | Indicadores oficiais de contexto (população, área e densidade; pobreza, indigência e desocupação; homicídios), com fontes em `contexto/FONTES.md` |
| `limites/departamentos.topo.json` | Departamentos simplificados (3%) com província e região |
| `limites/paises_vizinhos.topo.json` | Países limítrofes, Natural Earth 1:50 milhões |

Os limites foram derivados de [mgaitan/departamentos_argentina](https://github.com/mgaitan/departamentos_argentina) com o [mapshaper](https://github.com/mbloch/mapshaper): correção dos rótulos trocados de Malvinas e Antártida, recorte do setor antártico, dissolução das comunas da CABA e simplificação de 3%.
