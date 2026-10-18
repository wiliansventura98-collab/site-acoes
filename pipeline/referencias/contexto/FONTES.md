# Indicadores de contexto · fontes

| Arquivo | Indicador | Recorte | Fonte |
|---|---|---|---|
| `populacao_provincias_2022.csv` | População, área e densidade | 24 jurisdições | INDEC, Censo Nacional de Población, Hogares y Viviendas 2022, **resultados definitivos** (nov. 2023; total 45.892.285). Área calculada pelo projeto em projeção cônica equivalente de Albers sobre a camada de departamentos, sem Malvinas e setor antártico (total 2.779.629 km²). |
| `homicidios_provincias_snic.csv` | Vítimas de homicídios dolosos e taxa por 100 mil hab., 2023 e 2024 | 24 jurisdições | Ministério de Segurança Nacional, SNIC–SAT, *Informe de Homicidios Dolosos 2024*, Tabela 4. |
| `eph_regioes_2024.csv` | Pobreza e indigência (domicílios e pessoas), 2º semestre de 2024; atividade, emprego e desocupação, 4º trimestre de 2024 | 6 regiões estatísticas | INDEC, Encuesta Permanente de Hogares: *Incidencia de la pobreza y la indigencia en 31 aglomerados urbanos, segundo semestre de 2024* e *Mercado de trabajo. Tasas e indicadores socioeconómicos, cuarto trimestre de 2024*. |
| `eph_aglomerados_2024.csv` | Pobreza e indigência em pessoas (2º sem. 2024) e desocupação (4º trim. 2024) | 31 aglomerados urbanos (GBA dividido em CABA e Partidos) | INDEC, EPH, mesmos informes (Quadro 4.1 da pobreza; quadros 2 e 3.1 do mercado de trabalho). `indigencia_cv_alto = 1` marca estimativas com coeficiente de variação acima de 16%. Coordenadas: centro urbano aproximado, atribuído pelo projeto. |
| `indec_geoportal_2022.json` | 28 indicadores do Censo 2022 (privação material, serviços, conectividade, educação, trabalho, saúde, estrutura demográfica, diversidade e migração), população e moradias | 529 departamentos/partidos/comunas e 24 jurisdições | INDEC, [Geoportal estadístico](https://portalgeoestadistico.indec.gob.ar/), lidos da API pública `https://datosestadisticos.indec.gob.ar/api/v1` (`/indicator/{id}/records`) em 18/10/2026. O arquivo guarda o identificador de cada indicador no portal, o recorte escolhido (ex.: ambos os sexos) e a definição oficial. A taxa de desocupação foi calculada pelo projeto como desocupados ÷ (ocupados + desocupados). |

Observações:

- A EPH cobre apenas os 31 aglomerados urbanos; os valores regionais não representam áreas rurais.
- Homicídios por província vêm do SNIC; a população usada pelo SNIC nas taxas é a projeção oficial do INDEC, por isso pode diferir levemente da divisão direta pela população censitária.
- Censo por departamento: as 15 comunas da CABA recebem o valor da cidade inteira (a camada de limites tem a CABA como um polígono). Tolhuin (criado em 2017) e Lezama (2009) não existem na camada de limites usada e ficam sem polígono; as Ilhas Malvinas não têm dado. Seis departamentos de Jujuy, La Rioja e Santiago del Estero foram casados por nome alternativo (`ALIAS_INDEC` em `construir_site.py`).
