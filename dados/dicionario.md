# Dicionário de variáveis · base 2024

Contagens sobre 934 notícias únicas (sem as 85 marcadas como repetidas).
Variáveis com vários valores por notícia aparecem separadas por `; ` no arquivo `acoes_2024.csv`.

## Campos de identificação

| Campo | Descrição |
|---|---|
| `codigo` | Código do documento (PDF) da notícia |
| `titulo` | Título da notícia |
| `data_noticia` | Data de publicação (dd/mm/aaaa) |
| `data_inicial`, `data_final` | Período da ação |
| `link` | Endereço da notícia original |
| `status` | `Correta` ou `Repetida` (mesma ação noticiada mais de uma vez) |

## Variáveis analíticas

### `mes` · Mês da notícia

Mês de publicação da notícia.

Grupo: Tempo · categorias: 12 · um valor por notícia

| Categoria mais frequente | Notícias |
|---|---:|
| 03 · Março | 187 |
| 12 · Dezembro | 121 |
| 11 · Novembro | 85 |
| 04 · Abril | 84 |
| 09 · Setembro | 77 |
| 07 · Julho | 72 |
| 06 · Junho | 66 |
| 01 · Janeiro | 61 |

### `escala` · Escala de la acción

Escala espacial da ação: municipal, provincial, regional, nacional ou internacional.

Grupo: Ação · categorias: 5 · um valor por notícia

| Categoria mais frequente | Notícias |
|---|---:|
| Municipal | 421 |
| Nacional | 366 |
| Provincial | 105 |
| Regional | 24 |
| Internacional | 18 |

### `virtual` · ¿Es una acción virtual?

Indica se a ação ocorreu em ambiente virtual.

Grupo: Ação · categorias: 2 · um valor por notícia

| Categoria mais frequente | Notícias |
|---|---:|
| No | 789 |
| Sí | 145 |

### `modalidad` · Modalidad de la acción

Modalidade da ação: socioespacial, socioespacial virtual ou socioterritorial.

Grupo: Ação · categorias: 3 · pode ter vários valores por notícia

| Categoria mais frequente | Notícias |
|---|---:|
| Acción Socioespacial | 843 |
| Acción Socioespacial Virtual | 49 |
| Acción Socioterritorial | 46 |

### `direccion` · Direccionalidad de la acción

Direcionalidade: reivindicativa, propositiva, defensiva, conquistada ou sofrida.

Grupo: Ação · categorias: 5 · um valor por notícia

| Categoria mais frequente | Notícias |
|---|---:|
| Reivindicativa | 583 |
| Propositiva | 184 |
| Defensiva | 110 |
| Conquistada | 35 |
| Sufrida | 22 |

### `matriz` · Acción matriz

Tipologia da ação no nível matriz (categorias em maiúsculas na ficha).

Grupo: Ação · categorias: 10 · pode ter vários valores por notícia

| Categoria mais frequente | Notícias |
|---|---:|
| ACCIONES COMUNICATIVAS | 274 |
| DESPLAZAMIENTOS COLECTIVOS | 236 |
| EVENTOS | 221 |
| CAMPAÑAS | 75 |
| OCUPACIÓN | 62 |
| INTERSECCIONALIDAD INSTITUCIONAL | 59 |
| OTRAS | 54 |
| INTERRUPCIÓN DEL PROCESO PRODUCTIVO | 32 |

### `derivada` · Acción derivada

Tipologia da ação no nível derivado.

Grupo: Ação · categorias: 29 · pode ter vários valores por notícia

| Categoria mais frequente | Notícias |
|---|---:|
| Marcha | 233 |
| Carta/Nota de Repudio/Petitorio | 177 |
| Asamblea | 88 |
| Conferencia de Prensa/declaraciones | 80 |
| Acto/ Lanzamiento/Homenaje | 74 |
| Acciones Legales | 41 |
| Charla/Conversatorio/Foro | 40 |
| Campañas de divulgación/difusión/servicios | 38 |

### `objetivos` · Objetivos de la acción

Objetivos declarados da ação.

Grupo: Ação · categorias: 13 · pode ter vários valores por notícia

| Categoria mais frequente | Notícias |
|---|---:|
| Objetivos laborales | 493 |
| Objetivos por la reproducción social | 308 |
| Objetivos políticos | 296 |
| Objetivos en torno a Derechos Humanos | 251 |
| Objetivos educativos | 218 |
| Objetivos por la igualdad de género | 152 |
| Objetivos por la vivienda y hábitat | 140 |
| Objetivos sanitarios | 103 |

### `cantidad` · Cantidad de personas

Quantidade de participantes informada na notícia (texto livre).

Grupo: Ação · categorias: 83 · um valor por notícia

| Categoria mais frequente | Notícias |
|---|---:|
| No informa (NI) | 809 |
| miles de personas | 17 |
| miles de trabajadores | 10 |
| miles de estudiantes | 5 |
| cientos de personas | 4 |
| cientos de vecinos | 4 |
| cientos de trabajadores | 4 |
| Cientos | 3 |

### `tipomov` · Tipo de movimiento

Tipo de movimento protagonista da ação.

Grupo: Protagonistas · categorias: 16 · pode ter vários valores por notícia

| Categoria mais frequente | Notícias |
|---|---:|
| Movimientos sindicales | 446 |
| Movimientos de Economía Social y Solidaria | 295 |
| Movimientos de trabajadores Desocupados | 164 |
| Movimientos Barriales | 136 |
| Movimientos de DDHH | 130 |
| Movimientos Estudiantiles | 96 |
| Movimientos de mujeres/feministas | 89 |
| Movimientos de LGTTBIQ+ | 58 |

### `nombremov` · Nombre de movimiento

Movimento ou organização protagonista; siglas unificadas ao nome completo.

Grupo: Protagonistas · categorias: 868 · pode ter vários valores por notícia

| Categoria mais frequente | Notícias |
|---|---:|
| Unión de Trabajadores y Trabajadoras de la Economía Popular (UTEP) | 165 |
| Asociación de Trabajadores del Estado (ATE) | 83 |
| Movimiento de Trabajadores Excluidos (MTE) | 73 |
| Confederación General del Trabajo (CGT) | 67 |
| Central de Trabajadores de la Argentina (CTA) | 63 |
| Frente de Organizaciones en Lucha (FOL) | 49 |
| Movimiento Evita | 44 |
| Polo Obrero | 39 |

### `tipoinst` · Tipo de institución

Tipo de instituição interpelada pela ação.

Grupo: Instituições · categorias: 22 · pode ter vários valores por notícia

| Categoria mais frequente | Notícias |
|---|---:|
| Estado Nacional | 375 |
| No informa (NI) | 220 |
| Poder Legislativo | 167 |
| Ministerios/Secretarías | 152 |
| Policía/Fuerzas de seguridad | 151 |
| Universidades Nacionales | 113 |
| Estado Municipal | 106 |
| Poder Judicial | 78 |

### `nombreinst` · Nombre de la institución

Instituição interpelada, em categorias padronizadas.

Grupo: Instituições · categorias: 183 · pode ter vários valores por notícia

| Categoria mais frequente | Notícias |
|---|---:|
| Gobierno nacional/Poder Ejecutivo mencionado | 294 |
| No informa (NI) | 189 |
| Congreso/legislatura mencionado | 186 |
| Policía o fuerza de seguridad mencionada | 170 |
| Ministerio o secretaría estatal mencionado | 162 |
| Universidad pública/nacional mencionada | 99 |
| Empresa/cámara empresarial mencionada | 78 |
| Gobierno Nacional | 60 |

### `ods` · ODS

Objetivos de Desenvolvimento Sustentável relacionados à ação.

Grupo: Instituições · categorias: 17 · pode ter vários valores por notícia

| Categoria mais frequente | Notícias |
|---|---:|
| ODS 10 · Reducción de las desigualdades | 743 |
| ODS 8 · Trabajo decente y crecimiento económico | 490 |
| ODS 16 · Paz, justicia e instituciones sólidas | 374 |
| ODS 1 · Fin de la pobreza | 275 |
| ODS 2 · Hambre cero | 264 |
| ODS 4 · Educación de calidad | 216 |
| ODS 11 · Ciudades y comunidades sostenibles | 198 |
| ODS 5 · Igualdad de género | 161 |

### `provincia` · Provincia

Província citada na referência espacial (inclui CABA e 'Argentina (nacional)').

Grupo: Espaço · categorias: 30 · pode ter vários valores por notícia

| Categoria mais frequente | Notícias |
|---|---:|
| CABA (Ciudad de Buenos Aires) | 255 |
| Buenos Aires | 192 |
| Santa Fe | 74 |
| Río Negro | 48 |
| Córdoba | 44 |
| Neuquén | 35 |
| Argentina (nacional) | 27 |
| Entre Ríos | 25 |

### `region` · Región (INDEC)

Região estatística do INDEC, derivada do departamento ou da província.

Grupo: Espaço · categorias: 6 · pode ter vários valores por notícia

| Categoria mais frequente | Notícias |
|---|---:|
| Gran Buenos Aires | 307 |
| Pampeana | 288 |
| Patagonia | 118 |
| Noroeste (NOA) | 42 |
| Noreste (NEA) | 38 |
| Cuyo | 28 |

### `departamento` · Departamento / partido

Departamento ou partido citado na referência espacial.

Grupo: Espaço · categorias: 103 · pode ter vários valores por notícia

| Categoria mais frequente | Notícias |
|---|---:|
| CABA (Ciudad de Buenos Aires) | 254 |
| Rosario (Santa Fe) | 47 |
| La Plata (Buenos Aires) | 40 |
| General Pueyrredón (Buenos Aires) | 38 |
| Capital (Córdoba) | 32 |
| Bariloche (Río Negro) | 26 |
| Confluencia (Neuquén) | 25 |
| Paraná (Entre Ríos) | 19 |

### `localidad` · Localidad

Localidade citada, no formato 'Localidade (Província)'.

Grupo: Espaço · categorias: 133 · pode ter vários valores por notícia

| Categoria mais frequente | Notícias |
|---|---:|
| CABA (Ciudad de Buenos Aires) | 254 |
| Rosario (Santa Fe) | 47 |
| La Plata (Buenos Aires) | 40 |
| Mar del Plata (Buenos Aires) | 38 |
| Córdoba (Córdoba) | 32 |
| Argentina (nacional) | 27 |
| Neuquén (Neuquén) | 22 |
| Paraná (Entre Ríos) | 19 |

### `localizacion` · Localización de la acción

Tipo de lugar onde a ação ocorreu.

Grupo: Espaço · categorias: 18 · pode ter vários valores por notícia

| Categoria mais frequente | Notícias |
|---|---:|
| Calles, esquinas | 302 |
| Otras | 292 |
| Espacio Virtual | 200 |
| Dependencias públicas | 165 |
| Barrios | 76 |
| Plazas | 44 |
| Sedes de centros culturales | 35 |
| Sedes privadas (empresas, etc.) | 32 |

### `otraslocal` · Otras localizaciones

Detalhamento de outras localizações.

Grupo: Espaço · categorias: 177 · pode ter vários valores por notícia

| Categoria mais frequente | Notícias |
|---|---:|
| Sedes de organizaciones | 145 |
| Espacios públicos | 99 |
| Lugares de trabajo | 8 |
| No informa (NI) | 6 |
| Sedes sindicales | 5 |
| Congreso de la Nación | 5 |
| Ministerio de Capital Humano | 4 |
| Plaza de Mayo | 4 |

### `dependencias` · Dependencias públicas

Tipo de dependência pública onde a ação ocorreu.

Grupo: Espaço · categorias: 9 · pode ter vários valores por notícia

| Categoria mais frequente | Notícias |
|---|---:|
| Reparticiones del poder ejecutivo | 64 |
| Reparticiones del poder legislativo | 47 |
| Reparticiones del poder judicial | 32 |
| Universidades | 23 |
| Escuelas y colegios | 21 |
| Hospitales | 7 |
| Policía o fuerza de seguridad mencionada | 1 |
| Ministerio o secretaría estatal mencionado | 1 |

### `fuente` · Fuente de la noticia

Veículo ou fonte da notícia (grafias unificadas).

Grupo: Fonte · categorias: 515 · um valor por notícia

| Categoria mais frequente | Notícias |
|---|---:|
| Página/12 | 53 |
| No informa (NI) | 38 |
| Diario Río Negro | 19 |
| ATE | 16 |
| LM Neuquén | 10 |
| Canal Abierto | 9 |
| PCR | 9 |
| Tiempo Argentino | 8 |
