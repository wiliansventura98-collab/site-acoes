/* GERADO por i18n/ferramenta.js a partir de assets/js/app/leituras.js; não edite: edite o original e i18n/es.json */
var IDIOMA='es';
/*
 * Leituras das combinações prontas
 * Ao clicar numa combinação pronta, aparece logo abaixo dos botões uma caixa com três partes:
 *   1. O que esta combinação mostra: texto fixo que explica a relação e como lê-la;
 *   2. O que os dados dizem: leitura automática, refeita a cada mudança de filtro;
 *   3. Como foi calculado: o método da aba.
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

/* ---------- 1. textos fixos de cada combinação ---------- */
const LEIT = {
distPresets: {
  'Quién se moviliza': 'Muestra qué tipos de movimiento aparecen en las noticias y con qué frecuencia. Es el retrato más simple de quiénes son los sujetos de las acciones colectivas registradas por la prensa en 2024. Lea la barra más larga como el sujeto más visible, pero recuerde que una noticia puede citar más de un tipo de movimiento.',
  'Organizaciones más citadas': 'Enumera las organizaciones nombradas en las noticias, de la más citada a la menos citada. Muestra qué colectivos concentran la visibilidad (por ejemplo, centrales sindicales y organizaciones de la economía popular) y cuántas organizaciones aparecen una sola vez, la “cola larga” de colectivos locales.',
  'Movimientos × objetivos (asociación)': 'Cruza quién se moviliza con lo que reclama. En el modo Asociación, la tabla no muestra solo lo frecuente, sino lo típico de cada movimiento: las celdas azules indican combinaciones que aparecen más de lo esperado si movimiento y objetivo no tuvieran relación; las rojas, menos. Es la forma más directa de ver la agenda propia de cada sujeto.',
  'Acción matriz × direccionalidad': 'Relaciona el tipo general de acción (comunicativa, desplazamiento colectivo, ocupación…) con el sentido de la acción (reivindicar, defender, proponer, celebrar una conquista o reaccionar ante algo sufrido). Ayuda a percibir si ciertos repertorios se usan sobre todo para defender derechos amenazados o para proponer y reivindicar.',
  'Regiones × tipo de movimiento (% de la fila)': 'Para cada región, muestra cómo se reparten las noticias entre los tipos de movimiento (cada fila suma 100%). Permite comparar el perfil de la movilización entre regiones: por ejemplo, si el peso de los sindicales o de la economía popular es mayor en el Gran Buenos Aires o en la Patagonia.',
  'Escala × institución interpelada': 'Cruza la escala de la acción (municipal, provincial, nacional…) con la institución a la que se dirige la acción. Muestra la coherencia territorial de las demandas: las acciones municipales tienden a interpelar a gobiernos locales, y las nacionales, al Estado nacional y al Congreso. Los desvíos de esa regla indican conflictos que atraviesan escalas.',
  'Dónde ocurren las acciones': 'Muestra los tipos de lugar en que ocurren las acciones: calles, plazas, sedes de organismos públicos, rutas, espacio virtual. Es la dimensión socioespacial del repertorio: qué espacios se apropian para hacer visible la lucha.',
  'Objetivos × ODS': 'Relaciona los objetivos de las acciones con los Objetivos de Desarrollo Sostenible de la ONU asignados en la codificación. Muestra cómo las agendas de los movimientos se traducen al lenguaje de la agenda internacional (trabajo decente, reducción de las desigualdades, igualdad de género…).',
  'Modalidad × tipo de movimiento': 'Separa las acciones socioespaciales (que usan el espacio para manifestarse), socioterritoriales (que disputan o construyen territorio) y virtuales, y muestra qué movimientos son típicos de cada modalidad. Es el cruce más cercano al debate teórico sobre movimientos socioespaciales y socioterritoriales.',
  'Movimientos × institución interpelada': 'Muestra a quién dirige sus acciones cada tipo de movimiento. Ayuda a identificar el interlocutor típico de cada sujeto: el Estado nacional, los gobiernos provinciales, las universidades, las empresas o la policía.',
  'Objetivos × direccionalidad': 'Cruza lo que se reclama con el sentido de la acción. Indica qué agendas aparecen sobre todo en acciones defensivas (contra recortes, despidos o retrocesos) y cuáles en acciones propositivas o reivindicativas.',
  'Acción derivada × lugar': 'Vincula las formas concretas de acción (marcha, asamblea, acto, ocupación, cacerolazo…) con los lugares donde ocurren. Muestra, por ejemplo, que las marchas ocupan calles y plazas y que las asambleas ocurren en sedes y lugares de trabajo.',
  'Regiones × objetivos (% de la fila)': 'Para cada región, muestra cómo se reparten las noticias entre los objetivos. Permite comparar la agenda regional: si los reclamos laborales, educativos o de vivienda pesan más en una región que en otra.',
  'Escala × tipo de movimiento': 'Muestra qué movimientos actúan en cada escala. Ayuda a distinguir sujetos que actúan sobre todo localmente (movimientos barriales, de vivienda) de los que organizan acciones de alcance nacional (centrales sindicales, organizaciones de la economía popular).',
  'Virtual × acción matriz (% de la fila)': 'Compara el repertorio de las acciones virtuales con el de las presenciales. Muestra qué tipos de acción migran al espacio virtual (sobre todo las comunicativas y las campañas) y cuáles dependen de la presencia física en el espacio.',
},
flowPresets: {
  'Quién → cómo → por qué': 'Sigue las noticias en tres etapas: el tipo de movimiento, el tipo de acción que usa y el objetivo que persigue. Las bandas más gruesas son los caminos más frecuentes. Sirve para ver, por ejemplo, por qué repertorios los sindicales llegan a las agendas laborales.',
  'Dónde → quién → contra quién': 'Vincula la región de la acción con el tipo de movimiento y la institución interpelada. Muestra la geografía de los conflictos: quién se moviliza en cada región y contra qué instancia del poder.',
  'Acción → sentido → escala': 'Vincula la acción matriz con la direccionalidad y la escala. Responde: qué tipos de acción son defensivos o propositivos, y en qué escala ocurren.',
  'Objetivos → ODS': 'Muestra cómo cada objetivo de las acciones se distribuye entre los Objetivos de Desarrollo Sostenible. Las bandas gruesas indican la traducción más común de cada agenda en la agenda de la ONU.',
  'Acción matriz → derivada → lugar': 'Baja del tipo general de acción a la forma concreta y al lugar donde ocurre. Es la cadena completa del repertorio socioespacial: de “desplazamiento colectivo” a “marcha” y a “calles”.',
  'Modalidad → acción → lugar': 'Parte de la modalidad (socioespacial, socioterritorial o virtual), pasa por la acción matriz y llega al lugar. Muestra cómo cada modalidad se materializa en acciones y espacios concretos.',
  'Quién → por qué → contra quién': 'Vincula el tipo de movimiento con el objetivo y la institución interpelada. Permite seguir a cada sujeto hasta su agenda y su interlocutor.',
  'Dónde → cómo → en qué sentido': 'Vincula la región con la acción matriz y la direccionalidad. Muestra si el repertorio y el sentido de las acciones cambian de una región a otra.',
  'Escala → interlocutor → objetivo': 'Vincula la escala de la acción con la institución interpelada y el objetivo. Muestra qué agendas se llevan a cada nivel del Estado.',
},
typoPresets: {
  'Acción matriz › derivada': 'La tipología de acciones de la base: cada rectángulo grande es una acción matriz y, dentro de él, las acciones derivadas (las formas concretas). El área es proporcional al número de noticias. Muestra qué formas concretas dan cuerpo a cada tipo general de acción.',
  'Tipo de movimiento › organizaciones': 'Muestra qué organizaciones componen cada tipo de movimiento y cuánto pesa cada una en las noticias. Revela si un tipo de movimiento está dominado por pocas organizaciones o formado por muchos colectivos pequeños.',
  'Región › provincia': 'Muestra el peso de cada provincia dentro de su región. Útil para saber si la movilización de una región está concentrada en una provincia o distribuida.',
  'Objetivos › acción matriz': 'Para cada objetivo, muestra con qué tipos de acción se persigue. Indica, por ejemplo, si las agendas educativas se expresan más en desplazamientos colectivos y las laborales en interrupciones del proceso productivo.',
  'Institución › escala': 'Para cada institución interpelada, muestra en qué escala ocurren las acciones. Ayuda a ver si el Estado nacional también es interpelado por acciones locales.',
  'Modalidad › acción matriz': 'Muestra el repertorio de cada modalidad: qué acciones son socioespaciales, cuáles socioterritoriales y cuáles virtuales.',
  'Región › tipo de movimiento': 'Muestra quién se moviliza en cada región, con área proporcional a las noticias. Útil para comparar la composición de los sujetos entre regiones.',
  'Lugar › acción derivada': 'Para cada tipo de lugar (calle, plaza, sede pública…), muestra las formas concretas de acción que ocurren allí. Es la lectura del espacio como recurso de la acción colectiva.',
  'Objetivos › ODS': 'Muestra, dentro de cada objetivo de las acciones, los Objetivos de Desarrollo Sostenible asociados.',
},
netPresets: {
  'Articulaciones entre organizaciones': 'Red de las 40 organizaciones más citadas: cada círculo es una organización y cada línea une dos organizaciones que aparecen juntas en al menos dos noticias. El color indica el tipo de movimiento predominante. Muestra quién actúa junto con quién.',
  'Bloques de organizaciones': 'La misma red de organizaciones, ahora coloreada por comunidad: grupos de organizaciones que aparecen juntas entre sí más que con las demás. Ayuda a identificar bloques o frentes de acción (por ejemplo, economía popular, centrales sindicales, izquierda).',
  'Solo las alianzas fuertes': 'Mantiene solo los vínculos con cinco o más noticias en común. Desaparece el ruido de las alianzas ocasionales y quedan las alianzas estables del año.',
  'Objetivos que van juntos': 'Red de los objetivos: dos objetivos se unen cuando aparecen en la misma noticia. Muestra qué agendas se articulan en las mismas acciones (por ejemplo, laborales y políticas).',
  'Tipos de movimiento que se encuentran': 'Red de los tipos de movimiento: une tipos que aparecen en las mismas noticias. Muestra las alianzas entre sujetos distintos, como sindicales y estudiantiles.',
  'Instituciones interpeladas juntas': 'Une las instituciones interpeladas en la misma acción. Muestra cuándo una acción apunta al mismo tiempo, por ejemplo, al Estado nacional y al Congreso.',
  'Lugares que se combinan': 'Une los tipos de lugar citados en la misma acción. Muestra recorridos y combinaciones espaciales, como marchas que salen de una plaza y llegan a una sede pública.',
  'Formas de acción combinadas': 'Une las acciones derivadas que aparecen en la misma noticia. Muestra las secuencias del repertorio, como asamblea seguida de paro, o marcha con acto.',
  'ODS que van juntos': 'Une los Objetivos de Desarrollo Sostenible asignados a la misma noticia. Muestra cómo las agendas combinan distintas dimensiones de la agenda internacional.',
},
mapPresets: {
  'Noticias por localidad': 'Círculos proporcionales al número de noticias que citan cada ciudad. Es el mapa más directo de dónde se registró la movilización; muestra la concentración en las capitales y en los grandes centros urbanos.',
  'Tasa por provincia': 'Pinta cada provincia según el número de noticias por 100 mil habitantes. Corrige el efecto del tamaño de la población: una provincia pequeña puede tener pocas noticias y, aun así, una tasa alta.',
  'Tasa por departamento': 'El mismo cálculo de noticias por 100 mil habitantes, ahora por departamento. Muestra contrastes dentro de las provincias. Los contornos naranja y azul marcan lugares con muchas más o muchas menos noticias de lo que haría esperar la población.',
  'Privación × protestas (bivariado)': 'Combina, en cada departamento, la privación material de los hogares (Censo 2022) con las noticias por habitante. Verde oscuro: privación alta y muchas noticias; azul: privación alta y ninguna noticia; amarillo: privación baja y muchas noticias. Ayuda a ver dónde coinciden la carencia y la movilización registrada y dónde no.',
  'Puntos calientes': 'Identifica agrupamientos de departamentos vecinos con muchas noticias por habitante (puntos calientes, en naranja) o con pocas (puntos fríos, en azul). Muestra si la movilización forma manchas regionales, y no solo puntos aislados.',
  'Noticias sobre la pobreza regional': 'Círculos de noticias por localidad sobre el fondo de la pobreza por región estadística (EPH, 2º semestre de 2024). Permite comparar visualmente dónde la pobreza es mayor y dónde se concentran las noticias.',
  'Noticias sobre la densidad': 'Círculos de noticias sobre el fondo de la densidad demográfica por departamento. Funciona como control: muestra cuánto de la concentración de las noticias sigue simplemente la concentración de la población.',
  'Principales movimientos, un mapa cada uno': 'Un mapa para cada una de las organizaciones más citadas, en la misma escala. Muestra la geografía de cada organización: cuáles tienen presencia nacional y cuáles son regionales.',
  'Tipos de movimiento, un mapa cada uno': 'Un mapa de tasa por provincia para cada tipo de movimiento, con la misma leyenda. Permite comparar dónde cada sujeto es proporcionalmente más activo.',
  'Barrios populares × protestas (bivariado)': 'Combina, por departamento, las familias que viven en barrios populares (RENABAP) con las noticias por habitante. Muestra si la movilización registrada aparece donde están los barrios populares, base de las organizaciones de la economía popular y de los movimientos barriales.',
  'Voto a Milei × protestas (bivariado)': 'Combina, por departamento, el voto a La Libertad Avanza en la primera vuelta de 2023 con las noticias por habitante. Ayuda a discutir si la movilización de 2024 se concentró en lugares de mayor o menor apoyo electoral al gobierno.',
  'Economía popular por provincia': 'Pinta las provincias según la proporción de inscriptos en el registro de la economía popular (ReNaTEP) y superpone los círculos de noticias. Muestra dónde la economía popular es mayor y si la movilización registrada acompaña ese peso.',
  'Femicidios y noticias feministas (filtra)': 'Pinta las provincias según la tasa de femicidios de 2024 y muestra, en círculos, solo las noticias de movimientos feministas (este botón aplica un filtro). Ayuda a discutir si la movilización feminista registrada acompaña la violencia de género.',
  'Desocupación × protestas (bivariado)': 'Combina, por departamento, la tasa de desocupación del Censo 2022 con las noticias por habitante. Muestra si la movilización registrada coincide con los lugares de mayor desempleo.',
  'Cloacas × protestas (bivariado)': 'Combina, por departamento, el acceso a cloaca en red con las noticias por habitante. Como la cloaca es un buen indicador de infraestructura urbana, ayuda a ver si las noticias se concentran en las áreas más urbanizadas.',
  'Jóvenes ni-ni × protestas (bivariado)': 'Combina, por departamento, la proporción de jóvenes que no estudian ni trabajan con las noticias por habitante. Muestra si la movilización registrada aparece donde la exclusión juvenil es mayor.',
  'Objetivos, un mapa cada uno': 'Un mapa de tasa por provincia para cada objetivo principal, con la misma leyenda. Muestra la geografía de las agendas: dónde pesan más los reclamos laborales, educativos o de vivienda.',
  'Acciones matriz, un mapa cada una': 'Un mapa de círculos para cada tipo de acción. Muestra si ciertos repertorios (ocupaciones, interrupciones del proceso productivo) están más concentrados en algunas regiones.',
  'Modalidad, un mapa cada una': 'Un mapa para cada modalidad: socioespacial, socioterritorial y virtual. Muestra si las acciones que disputan territorio tienen una geografía distinta de las que solo usan el espacio para manifestarse.',
},
ctxPresets: {
  '¿Más pobreza, más protesta?': 'Cada punto es un departamento: en el eje horizontal, la privación material de los hogares (Censo 2022); en el vertical, las noticias por 100 mil habitantes. La pregunta es si los lugares más pobres son los que más se movilizan, según la prensa.',
  'Desempleo y movilización': 'Compara, por provincia, la desocupación del Censo 2022 con las noticias por habitante. Pone a prueba la hipótesis de que el desempleo alimenta la acción colectiva, especialmente de los movimientos de desocupados.',
  'Educación y movilización': 'Compara, por departamento, la proporción de adultos con secundario completo con las noticias por habitante. La escolaridad suele acompañar la urbanización y la presencia de universidades, lo que puede aumentar la movilización registrada.',
  '¿Ciudad densa, más noticias?': 'Compara la densidad demográfica de las provincias con las noticias por habitante. Funciona como control: si la relación es fuerte, parte de lo que parece efecto de las condiciones sociales puede ser solo efecto de la urbanización y de la presencia de la prensa.',
  'Violencia y protesta': 'Compara la tasa de homicidios dolosos de 2024 con las noticias por habitante, por provincia. Ayuda a ver si la violencia urbana se asocia a la movilización registrada.',
  'Pueblos indígenas': 'Compara, por departamento, la proporción de población indígena con las noticias por habitante. Ayuda a discutir la visibilidad de las luchas de los pueblos originarios en la prensa.',
  'Servicios básicos': 'Compara, por departamento, el acceso a cloaca en red con las noticias por habitante. Mide si la falta de infraestructura urbana se asocia a la movilización registrada.',
  'Barrios populares y movilización': 'Compara, por departamento, las familias en barrios populares (RENABAP) por mil habitantes con las noticias por habitante. Los barrios populares son la base territorial de la economía popular y de los movimientos barriales y de vivienda.',
  'Economía popular (RENATEP)': 'Compara, por provincia, la proporción de inscriptos en el registro de la economía popular con las noticias por habitante. Pregunta si las provincias donde la economía popular es mayor son también las de más movilización registrada.',
  'Economía popular × noticias de la economía popular (filtra)': 'La misma comparación, pero solo con las noticias de movimientos de la economía social y solidaria y de trabajadores desocupados (este botón aplica un filtro). Pone a prueba si esos movimientos aparecen más donde está su base social.',
  'Femicidios × noticias feministas (filtra)': 'Compara, por provincia, la tasa de femicidios de 2024 con las noticias de movimientos feministas por habitante (este botón aplica un filtro). Pregunta si la movilización feminista registrada acompaña la violencia de género.',
  'Voto a Milei y protesta': 'Compara, por departamento, el voto a La Libertad Avanza en la primera vuelta de 2023 con las noticias por habitante en 2024. Ayuda a discutir la relación entre el mapa electoral y el mapa de la movilización contra las políticas del nuevo gobierno.',
  'Voto a la izquierda y protesta': 'Compara, por departamento, el voto al Frente de Izquierda en 2023 con las noticias por habitante. La presencia de la izquierda suele acompañar la organización sindical y estudiantil.',
  'Alquiler y movilización': 'Compara, por departamento, la proporción de hogares que alquilan con las noticias por habitante. El alquiler es un indicador del problema de la vivienda urbana y de la presencia de inquilinos organizados.',
  'Jóvenes ni-ni': 'Compara, por departamento, la proporción de jóvenes de 14 a 24 años que no estudian ni trabajan con las noticias por habitante. Mide si la exclusión juvenil se asocia a la movilización registrada.',
},
timePresets: {
  'Por tipo de movimiento': 'Serie semana a semana, con las noticias apiladas por tipo de movimiento. Muestra cuándo entra en escena cada sujeto y si los picos del año los impulsa un tipo de movimiento en particular.',
  'Por acción matriz': 'Serie semanal por tipo de acción. Muestra si el repertorio cambia a lo largo del año, por ejemplo, más desplazamientos colectivos en las grandes fechas de movilización.',
  'Por objetivos': 'Serie semanal por objetivo. Muestra qué agendas ganan fuerza en cada momento del año, como las educativas en torno a las marchas universitarias.',
  'Por región': 'Serie semanal por región. Muestra si los picos de movilización son nacionales o se concentran en una región.',
  'Por escala': 'Serie semanal por escala de la acción. Muestra cuándo la movilización se nacionaliza (paros generales, marchas federales) y cuándo predomina la acción local.',
  'Por direccionalidad': 'Serie semanal según el sentido de la acción. Muestra si, en ciertos momentos, las acciones defensivas (contra recortes y despidos) crecen en relación con las propositivas.',
  'Por institución interpelada': 'Serie semanal por institución interpelada. Muestra en qué momentos el Estado nacional, el Congreso o las universidades se vuelven el blanco principal.',
  'Por lugar de la acción': 'Serie semanal por tipo de lugar. Muestra cuándo las acciones ocupan calles y plazas y cuándo se repliegan a sedes o al espacio virtual.',
  'Por modalidad': 'Serie semanal por modalidad (socioespacial, socioterritorial, virtual). Muestra el ritmo de cada forma de acción a lo largo del año.',
},
sinPresets: {
  'Toda la base': 'La síntesis de todas las noticias, sin filtros: el retrato general de las acciones colectivas registradas por la prensa en 2024.',
  'Movimientos sindicales': 'La síntesis solo de las noticias con movimientos sindicales: sus repertorios, agendas, interlocutores, lugares y alianzas.',
  'Economía popular y desocupados': 'La síntesis de las noticias de los movimientos de la economía social y solidaria y de trabajadores desocupados, base de organizaciones como UTEP, MTE y Polo Obrero.',
  'Feministas y LGTTBIQ+': 'La síntesis de las noticias de movimientos de mujeres, feministas y LGTTBIQ+.',
  'Educación': 'La síntesis de las noticias con objetivos educativos, que incluye las marchas universitarias de 2024.',
  'Vivienda y hábitat': 'La síntesis de las noticias con objetivos de vivienda y hábitat.',
  'Derechos humanos': 'La síntesis de las noticias con objetivos en torno a los derechos humanos, que incluye el 24 de marzo.',
  'Gran Buenos Aires': 'La síntesis de las noticias de la región metropolitana de Buenos Aires (CABA y 24 partidos).',
  'Patagonia': 'La síntesis de las noticias de la región patagónica.',
  'Norte (NOA y NEA)': 'La síntesis de las noticias de las regiones Noroeste y Noreste.',
  'Acciones defensivas': 'La síntesis de las acciones de sentido defensivo: las que reaccionan ante recortes, despidos, desalojos y otras amenazas.',
  'Escala nacional': 'La síntesis de las acciones de escala nacional.',
},
cmpPresets: {
  'GBA × demás regiones, por tipo de movimiento': 'Compara el perfil de los movimientos en el Gran Buenos Aires con el del resto del país. Para cada tipo de movimiento, muestra el porcentaje en las noticias de cada grupo y si la diferencia es significativa.',
  'Sindicales × demás, por acción matriz': 'Compara el repertorio de los movimientos sindicales con el de todos los demás. Muestra qué tipos de acción son propios de los sindicatos (como la interrupción del proceso productivo).',
  'Patagonia × Noroeste, por objetivos': 'Compara las agendas de dos regiones distantes y distintas: la Patagonia y el Noroeste.',
  'Feministas × estudiantiles, por acción matriz': 'Compara los repertorios de dos sujetos con fuerte presencia en las calles: movimientos feministas y estudiantiles.',
  'Escala nacional × municipal, por institución interpelada': 'Compara a quién se dirigen las acciones nacionales y las municipales. Muestra la correspondencia entre la escala de la acción y el nivel del Estado.',
  'Acciones virtuales × presenciales, por objetivos': 'Compara las agendas de las acciones virtuales con las de las presenciales.',
  'Reivindicativas × defensivas, por tipo de movimiento': 'Compara quién hace acciones reivindicativas y quién hace acciones defensivas. Muestra qué sujetos están más a la defensiva en 2024.',
  'Pampeana × Patagonia, por acción matriz': 'Compara los repertorios de acción de la región Pampeana y de la Patagonia.',
  'Economía popular × sindicales, por institución interpelada': 'Compara a quién se dirigen las organizaciones de la economía popular y los sindicatos. Muestra interlocutores distintos: ministerios de desarrollo social por un lado, empleadores y Estado empleador por otro.',
  'Desocupados × sindicales, por lugar de la acción': 'Compara los lugares de las acciones de los trabajadores desocupados y de los sindicales: rutas y calles por un lado, lugares de trabajo y sedes por otro.',
  'Socioterritoriales × socioespaciales, por tipo de movimiento': 'Compara quién hace acciones socioterritoriales (que disputan o construyen territorio) y quién hace acciones socioespaciales (que usan el espacio para manifestarse).',
  'UTEP × ATE, por acción matriz': 'Compara los repertorios de las dos organizaciones más citadas: la UTEP, de la economía popular, y ATE, de los trabajadores del Estado.',
  'CGT × CTA, por objetivos': 'Compara las agendas de las dos grandes centrales sindicales.',
  'GBA × Pampeana, por objetivos': 'Compara las agendas de la región metropolitana con las del resto de la región pampeana.',
  'Defensivas × propositivas, por objetivos': 'Compara las agendas de las acciones defensivas con las de las propositivas.',
  'Ambientalistas × demás, por lugar de la acción': 'Compara los lugares de las acciones ambientalistas con los de todas las demás.',
},
acmPresets: {
  'Quién, cómo y dónde': 'Pone en el mismo plano tipo de movimiento, acción, objetivo, direccionalidad, escala y región. Las categorías cercanas tienden a aparecer en las mismas noticias; los ejes resumen las grandes oposiciones de la base.',
  'Repertorio de acción': 'Analiza juntas la acción matriz, la direccionalidad, la modalidad, el lugar y la escala. Muestra las grandes familias de repertorio.',
  'Movimientos y objetivos': 'Plano de correspondencias entre tipos de movimiento, objetivos y direccionalidad: un mapa de las agendas de cada sujeto.',
  'Instituciones interpeladas': 'Relaciona las instituciones interpeladas con la escala, la región y la direccionalidad. Muestra los “blancos” típicos de cada tipo de acción.',
  'Espacio de la acción': 'Relaciona lugar de la acción, dependencias públicas, escala y región: la dimensión espacial de las acciones.',
  'Acción y desarrollo sostenible': 'Relaciona acción matriz, objetivos y ODS.',
  'Presencial o virtual': 'Relaciona acción virtual, modalidad, acción matriz y tipo de movimiento: muestra qué distingue a las acciones virtuales.',
  'Socioespacial o socioterritorial': 'Relaciona la modalidad con el tipo de movimiento, el lugar, la escala y la región: qué distingue las acciones socioespaciales de las socioterritoriales.',
  'Objetivos e interlocutores': 'Relaciona objetivos, instituciones interpeladas, escala y direccionalidad: qué agendas se dirigen a quién.',
  'Regiones y repertorios': 'Relaciona región, acción matriz, direccionalidad y tipo de movimiento: las diferencias regionales de repertorio.',
},
ficPresets: {
  'UTEP': 'Ficha de la Unión de Trabajadores y Trabajadoras de la Economía Popular, sindicato de los trabajadores de la economía popular que reúne organizaciones como el MTE y el Movimiento Evita. Es la organización más citada de la base.',
  'ATE': 'Ficha de la Asociación de Trabajadores del Estado, sindicato de los trabajadores del sector público, muy activo en 2024 contra los despidos en el Estado.',
  'CGT': 'Ficha de la Confederación General del Trabajo, la mayor central sindical del país, que convocó paros generales en 2024.',
  'Movimientos feministas': 'Ficha del tipo de movimiento “mujeres/feministas”: dónde y cuándo actúan, con qué repertorio y por qué agendas.',
  'Movimientos estudiantiles': 'Ficha del tipo de movimiento estudiantil, protagonista de las marchas federales universitarias de 2024.',
  'CABA': 'Ficha de la Ciudad Autónoma de Buenos Aires, el lugar con más noticias de la base.',
  'Río Negro': 'Ficha de la provincia de Río Negro, una de las que tienen más noticias en relación con su población.',
  'Bariloche': 'Ficha de San Carlos de Bariloche, ciudad con muchas más noticias de lo que haría esperar su población.',
  'Objetivos educativos': 'Ficha de las acciones con objetivos educativos: quién las hace, dónde y cuándo.',
  'CTA': 'Ficha de la Central de Trabajadores de la Argentina, central sindical que reúne sobre todo a trabajadores estatales y docentes.',
  'MTE': 'Ficha del Movimiento de Trabajadores Excluidos, organización de la economía popular integrante de la UTEP.',
  'Polo Obrero': 'Ficha del Polo Obrero, organización de trabajadores desocupados vinculada al Partido Obrero.',
  'Movimiento Evita': 'Ficha del Movimiento Evita, organización de la economía popular integrante de la UTEP.',
  'Movimientos ambientalistas': 'Ficha de los movimientos ambientalistas: dónde y contra quién actúan.',
  'Neuquén': 'Ficha de la provincia de Neuquén.',
  'Vivienda y hábitat': 'Ficha de las acciones con objetivos de vivienda y hábitat.',
},
};
const PRESET_ABA = { distPresets:'dist', cmpPresets:'cmp', flowPresets:'flow', typoPresets:'typo', acmPresets:'acm', netPresets:'net', mapPresets:'map', ctxPresets:'ctx', timePresets:'time', sinPresets:'sin', ficPresets:'fic' };

/* ---------- 3. como foi calculado (por aba) ---------- */
function metodoDe(aba){
  switch(aba){
    case 'dist': return st.x? `Para cada par de categorías se cuenta cuántas noticias tienen las dos. Modo **Conteo**: el número de noticias. **% de la fila**: la celda dividida por el total de la fila (“de las noticias de esta fila, ¿cuántas tienen esta columna?”). **% de la columna**: lo mismo por columna. **Asociación**: el residuo ajustado, que compara el conteo con lo esperado si las variables no tuvieran relación (total de la fila × total de la columna ÷ total general), en la escala de la desviación estándar; por encima de +1,96 o por debajo de −1,96 la diferencia difícilmente es azar (p < 0,05). Una noticia con varias categorías cuenta en cada una de ellas.`
      : `Se cuenta en cuántas noticias del recorte aparece cada categoría; el porcentaje es sobre el total de noticias del recorte. Como una noticia puede tener varias categorías, los porcentajes pueden sumar más de 100%. Las noticias repetidas quedan fuera, salvo que la opción esté marcada.`;
    case 'cmp': return `Para cada categoría se calcula el porcentaje de las noticias del grupo A y del grupo B que la tienen, y la diferencia en puntos porcentuales. La prueba z de diferencia de proporciones dice si la diferencia es demasiado grande para ser azar; las diferencias significativas (|z| ≥ 1,96, p < 0,05) aparecen destacadas.`;
    case 'flow': return `Diagrama de Sankey. Cada noticia pasa por las etapas con sus categorías; cuando tiene más de una categoría en una etapa, su peso se reparte por igual entre ellas, para que cada columna sume el total de noticias. El grosor de cada banda es la suma de esos pesos. Aparecen las categorías más frecuentes de cada etapa; las demás quedan en “Otras”.`;
    case 'typo': return `Mapa de árbol. El área de cada rectángulo es proporcional al número de noticias con la combinación; cuando una noticia tiene varias categorías, su peso se reparte entre ellas, para que el total sea el número de noticias.`;
    case 'acm': return `Análisis de correspondencias múltiples con codificación difusa (una noticia con varias categorías reparte su peso entre ellas), sobre las ocho categorías más frecuentes de cada variable. Los ejes resumen las mayores diferencias entre las noticias; el porcentaje de cada eje es la inercia corregida por el método de Benzécri. Las categorías cercanas en el plano tienden a aparecer en las mismas noticias; las más alejadas del centro son las que más distinguen.`;
    case 'net': return `Red de coocurrencia: dos categorías se unen cuando aparecen en la misma noticia, y el grosor de la línea es el número de noticias en común. Entran las ${NET.n} categorías más citadas y los vínculos con ${NET.min} o más noticias en común. Grado = número de aliados. Comunidades: método de Louvain, que agrupa los nodos que más se vinculan entre sí. Intermediación (Brandes): proporción de los caminos más cortos de la red que pasa por cada nodo, de 0 a 1.`;
    case 'map': return `Vea el recuadro “Cómo se calculó este mapa”, justo debajo de la plancha: describe las tasas, las clases de colores y los destacados del mapa actual, con ejemplos.`;
    case 'ctx': return `Vea “Cómo se calculó” dentro de la lectura del gráfico: tasa por habitante, correlación de Spearman, línea de tendencia y criterio de “muy por encima” o “muy por debajo” de la tendencia.`;
    case 'time': return `Cada noticia se ubica en la semana (de lunes a domingo) de la fecha de inicio de la acción o, a falta de ella, de la fecha de publicación. Cuando tiene varias categorías, su peso se reparte entre ellas. Semana pico: por encima de Q3 + 1,5 × (Q3 − Q1), donde Q1 y Q3 son el primer y el tercer cuartil de las semanas del año. Los acontecimientos marcados provienen de fuentes periodísticas y oficiales (lista en el proyecto).`;
    case 'sin': return `La síntesis se calcula a partir del recorte actual con reglas descritas en su nota metodológica, al final de la pestaña.`;
    case 'fic': return `La ficha reúne solo las noticias que tienen la categoría elegida. Los porcentajes de los perfiles son sobre esas noticias; una noticia puede tener varias categorías. El mapa usa círculos proporcionales por localidad.`;
  }
  return '';
}

/* ---------- 2. o que os dados dizem (leitura automática) ---------- */
const nm1 = s => capS(String(s||'')).replace(/ \((Buenos Aires|[^)]+)\)$/,'');
function topCats(rows, vid, n){ return sinTop(rows, vid, n); }
function dizDe(aba, b){
  const rows=b.filter(r=>match(r,null)), N=rows.length;
  if(N<5) return 'El recorte actual tiene pocas noticias para una lectura.';
  try{
  switch(aba){
    case 'dist': {
      const v=VARS[VI[st.v]];
      if(!st.x){ const t=topCats(rows, st.v, 5); if(!t.length) return 'Sin categorías en este recorte.';
        const t3=t.slice(0,3), any=rows.filter(r=>r.v[VI[st.v]].some(k=>t3.some(d=>d.k===k))).length;
        return `De las ${fmt(N)} noticias del recorte, la categoría más frecuente es **${nm1(t[0].nome)}** (${fmt(t[0].n)} noticias, ${pct(t[0].n,N)})`+(t[1]? `, seguida de ${nm1(t[1].nome)} (${pct(t[1].n,N)})`:'')+(t[2]? ` e ${nm1(t[2].nome)} (${pct(t[2].n,N)})`:'')+`. Las tres primeras aparecen en ${pct(any,N)} de las noticias.`; }
      const res=sinResiduos(rows, st.v, st.x); if(!res.length) return 'Pocas combinaciones con 5 o más noticias en este recorte para evaluar la asociación.';
      const pos=res.filter(x=>x.r>=1.96).slice(0,3), neg=res.filter(x=>x.r<=-1.96).sort((a,q)=>a.r-q.r).slice(0,3);
      const f = x => `${nm1(x.A)} con ${nm1(x.B)} (${fmt(x.ob)} noticias, cuando se esperarían ${nfmt1(x.e)}; residuo ${nfmt1(x.r).replace('-','−')})`;
      return (pos.length? `Las combinaciones que más se **atraen** (más noticias de lo esperado) son ${listaPt(pos.map(f))}. ` : 'Ninguna combinación queda claramente por encima de lo esperado. ')
        + (neg.length? `Las que más se **repelen** (menos de lo esperado) son ${listaPt(neg.map(f))}. ` : '')
        + `En palabras simples: las primeras son características unas de otras; las segundas rara vez aparecen juntas.`; }
    case 'cmp': { const t=$('cmpLeitura'); return t && !t.hidden? t.innerText.replace(/^Leitura:\s*/,'') : 'Elija los dos grupos para ver la lectura.'; }
    case 'acm': { const t=$('acmLeitura'); return t && !t.hidden? t.innerText.replace(/^Leitura:\s*/,'') : 'El recorte es demasiado pequeño para el análisis.'; }
    case 'ctx': { const t=$('ctxLeitura'); if(!t || t.hidden) return 'Sin datos suficientes para la correlación.'; const c=t.cloneNode(true); c.querySelectorAll('details').forEach(d=>d.remove()); const tx=c.innerText.replace(/^Leitura:\s*/,''); const um=tx.split(/(?<=\.)\s+●/)[0]; return um + (tx.length>um.length+5? ' Los lugares muy por encima o muy por debajo de la tendencia se nombran en la lectura justo debajo del gráfico, con los valores observados y previstos y el cálculo paso a paso.' : ''); }
    case 'flow': {
      const etapas=[FLOW.a, FLOW.b, FLOW.c].filter(x=>x && VI[x]!=null); if(etapas.length<2) return '';
      const top=etapas.map(vid=>new Set(topCats(rows, vid, FLOW.n||8).map(d=>d.k)));
      const cont=new Map(); rows.forEach(r=>{ const cs=etapas.map((vid,i)=>r.v[VI[vid]].filter(k=>top[i].has(k))); if(cs.some(c=>!c.length)) return; const w=1/cs.reduce((p,c)=>p*c.length,1);
        const go=(i,pref)=>{ if(i===cs.length){ const k=pref.join('|'); cont.set(k,(cont.get(k)||0)+w); return; } cs[i].forEach(x=>go(i+1,[...pref,x])); }; go(0,[]); });
      const cam=[...cont].sort((a,q)=>q[1]-a[1]).slice(0,3).map(([k,w])=>({ks:k.split('|').map(Number), w}));
      if(!cam.length) return 'Sin caminos completos en este recorte.';
      const nomeC = c => c.ks.map((k,i)=>nm1(VARS[VI[etapas[i]]].values[k])).join(' → ');
      const a0=topCats(rows, etapas[0], 1)[0];
      let sai=''; if(a0){ const dest=new Map(); rows.filter(r=>r.v[VI[etapas[0]]].includes(a0.k)).forEach(r=>{ const ks=r.v[VI[etapas[1]]]; ks.forEach(k=>dest.set(k,(dest.get(k)||0)+1/ks.length)); });
        const d1=[...dest].sort((a,q)=>q[1]-a[1])[0]; if(d1) sai=` De la mayor categoría de la primera etapa, ${nm1(a0.nome)}, la banda más gruesa va hacia ${nm1(VARS[VI[etapas[1]]].values[d1[0]])} (${pct(d1[1], a0.n)} de sus noticias).`; }
      return `Los caminos más frecuentes son ${listaPt(cam.map(c=>`**${nomeC(c)}** (${nfmt1(c.w)} noticias)`))}.`+sai; }
    case 'typo': {
      const ia=VI[TYPO.a], ib=TYPO.b && TYPO.b!==TYPO.a? VI[TYPO.b] : null; const pais=topCats(rows, TYPO.a, 3); if(!pais.length) return '';
      let t=`El mayor bloque es **${nm1(pais[0].nome)}** (${fmt(pais[0].n)} noticias, ${pct(pais[0].n,N)})`+(pais[1]? `, seguido de ${nm1(pais[1].nome)} (${pct(pais[1].n,N)})`:'')+'.';
      if(ib!=null){ pais.slice(0,2).forEach(p=>{ const sub=topCats(rows.filter(r=>r.v[ia].includes(p.k)), TYPO.b, 2); if(sub.length) t+=` Dentro de ${nm1(p.nome)}, predomina ${nm1(sub[0].nome)} (${pct(sub[0].n,p.n)} de las noticias del bloque)`+(sub[1]? `, seguido de ${nm1(sub[1].nome)} (${pct(sub[1].n,p.n)})`:'')+'.'; }); }
      return t; }
    case 'net': {
      const iv=VI[NET.v], top=topCats(rows, NET.v, NET.n), ids=top.map(d=>d.k), em=new Set(ids), nome=new Map(top.map(d=>[d.k,d.nome]));
      const w=new Map(); rows.forEach(r=>{ const ks=[...new Set(r.v[iv])].filter(k=>em.has(k)).sort((a,c)=>a-c); for(let i=0;i<ks.length;i++) for(let j=i+1;j<ks.length;j++){ const k=ks[i]+'|'+ks[j]; w.set(k,(w.get(k)||0)+1); } });
      const links=[...w].filter(([,x])=>x>=NET.min).map(([k,x])=>{ const [a,c]=k.split('|').map(Number); return {source:a,target:c,w:x}; });
      if(!links.length) return 'Ningún vínculo alcanza el mínimo elegido en este recorte.';
      const g=new Map(ids.map(i=>[i,0])); links.forEach(l=>{ g.set(l.source,g.get(l.source)+1); g.set(l.target,g.get(l.target)+1); });
      const lv=louvain(ids, links), com=new Map(); ids.filter(i=>g.get(i)).forEach(i=>{ const c=lv.comm.get(i); com.set(c,(com.get(c)||0)+1); });
      const cent=[...ids].sort((a,c)=>g.get(c)-g.get(a)).slice(0,3), forte=[...links].sort((a,c)=>c.w-a.w).slice(0,3), isol=ids.filter(i=>!g.get(i)).length;
      return `Entre las ${fmt(ids.length)} categorías de la red, ${fmt(links.length)} pares aparecen juntos en ${NET.min} o más noticias. Quien tiene más aliados: ${listaPt(cent.map(k=>`**${nm1(nome.get(k))}** (${g.get(k)})`))}. Los vínculos más fuertes son ${listaPt(forte.map(l=>`${nm1(nome.get(l.source))} – ${nm1(nome.get(l.target))} (${l.w} noticias)`))}. La red forma ${[...com.values()].filter(x=>x>=2).length} bloques (comunidades)${isol? `, y ${isol} quedan sin vínculos` : ''}.`; }
    case 'time': {
      const iv=VI[SEM.v], v=VARS[iv], P=SEM_PICOS.picos||[];
      const tot=topCats(rows, SEM.v, 3);
      let t=`A lo largo del año, predominan ${listaPt(tot.map(d=>`${nm1(d.nome)} (${pct(d.n,N)})`))}. `;
      if(!P.length) return t+'No hay semanas pico en este recorte: la movilización se distribuye sin concentraciones fuera de lo común.';
      const dom = p => { const fim=d3.timeDay.offset(p.d,7), c=new Map(); rows.forEach(r=>{ const d=dataDe(r); if(!d || d<p.d || d>=fim) return; r.v[iv].forEach(k=>{ if(!ehSemInfo(v.values[k])) c.set(k,(c.get(k)||0)+1); }); }); const m=[...c].sort((a,q)=>q[1]-a[1])[0]; return m? nm1(v.values[m[0]]) : '—'; };
      const evs = p => EVENTOS.filter(e=>e.d>=d3.timeDay.offset(p.d,-2) && e.d<d3.timeDay.offset(p.d,7)).map(e=>e.curto||e.nome);
      return t+`Hay ${P.length} ${P.length===1? 'semana pico' : 'semanas pico'}: ${listaPt(P.slice(0,5).map(p=>{ const e=evs(p); return `la de ${p.d.toLocaleDateString('es-AR',{day:'2-digit',month:'2-digit'})} (${fmt(Math.round(p.n))} noticias, impulsada por ${dom(p)}${e.length? '; '+listaPt(e) : ''})`; }))}.`; }
    case 'map': {
      const cdef=ctxEscolha(mstate.ctx), unit=mstate.unit;
      if(mstate.mode==='multi'){ const cv=mstate.cmp, cats=topCats(rows, cv, mstate.n||6); const vidU=UNIT_VID[unit];
        return `Cada mapa muestra una categoría de ${VARS[VI[cv]].label.toLowerCase()}. Donde más aparece cada una: ${listaPt(cats.map(c=>{ const t=topCats(rows.filter(r=>r.v[VI[cv]].includes(c.k)), vidU, 1)[0]; return `${nm1(c.nome)}: ${t? nm1(t.nome)+' ('+fmt(t.n)+')' : '—'}`; }))}.`; }
      if(cdef && cdef.nivel==='biv'){ const B=bivCalc(cdef, taxasDept(b)), c=B.cel;
        return `De los departamentos, ${fmt(c[2][2])} combinam ${rotInd(cdef.indTitulo)} **alto** y **muchas** noticias por habitante (verde oscuro); ${fmt(c[2][0])} tienen el indicador alto y **ninguna** noticia (azul); ${fmt(c[0][2])} tienen el indicador bajo y muchas noticias (amarillo); ${fmt(c[0][0])} tienen los dos bajos (blanco). `+(c[2][2]>c[0][2]? 'Hay más departamentos en los que indicador alto y movilización coinciden que lo contrario.' : 'La movilización registrada aparece más donde el indicador es bajo que donde es alto.'); }
      if(cdef && cdef.nivel==='lisa'){ const L=ESP_CACHE.v; if(!L) return '';
        return `Hay ${fmt(L.n.HH)} departamentos en puntos calientes (muchas noticias por habitante rodeados de vecinos también con muchas), ${fmt(L.n.LL)} en puntos fríos y ${fmt(L.n.HL+L.n.LH)} casos aislados (alto rodeado de bajos o lo contrario). El I de Moran global es ${nfmt2(L.I)} (p ≈ ${nfmt2(L.pI)}): ${L.pI<0.05 && L.I>0? 'las noticias por habitante forman manchas espaciales, y no puntos dispersos' : 'no hay agrupamiento espacial claro'}.`; }
      const vidU=UNIT_VID[unit], t=topCats(rows, vidU, 5).filter(d=>!/nacional|virtual/i.test(d.nome));
      let s=`Los lugares con más noticias son ${listaPt(t.slice(0,4).map(d=>`${nm1(d.nome)} (${fmt(d.n)})`))}. `;
      if(unit!=='loc'){ const md=mapData(rows.filter(r=>match(r,vidU)), unit), D=destaques(md), al=D.feats.filter(d=>d.t==='alto').sort((a,q)=>q.razao-a.razao), ba=D.feats.filter(d=>d.t==='baixo');
        s+= al.length? `En relación con la población, quedan muy por encima de lo esperado ${listaPt(al.slice(0,4).map(d=>`${nm1(d.nome)} (${nfmt1(d.razao)} vezes)`))}` : 'Ningún lugar queda muy por encima de lo esperado por la población';
        s+= ba.length? `; muy por debajo, ${listaPt(ba.slice(0,3).map(d=>nm1(d.nome)))}.` : '.'; }
      if(cdef && cdef.nivel==='prov'){ const prov=PROVS_FC.filter(f=>f.properties.pi>=0 && POP[f.properties.pi]), md=mapData(rows.filter(r=>match(r,'provincia')),'prov');
        const pts=prov.map(f=>({x:(CTX.provincias[f.properties.p]||{})[cdef.campo], y:md.rate(f.properties.pi)})).filter(p=>p.x!=null);
        if(pts.length>5){ const c=correlacoes(pts.map(p=>p.x), pts.map(p=>p.y)); s+=` Entre la capa de contexto y las noticias por habitante de las provincias, la correlación de Spearman es ${nfmt2(c.rho)} (${forcaRho(c.rho)}${Math.abs(c.rho)>=0.41? ', significativa' : ', no significativa con 24 provincias'}).`; } }
      return s; }
    case 'sin': { const r=document.querySelectorAll('.sin-resumo li'); return `La síntesis de abajo se rehízo para este recorte (${fmt(N)} noticias). Los tres primeros hallazgos: ${[...r].slice(0,3).map(li=>li.innerText.replace(/\.$/,'')).join('; ')}.`; }
    case 'fic': { const v=VARS[VI[FIC.v]], nome=v.values[FIC.k]; if(FIC.k==null) return ''; const rr=base().filter(r=>r.v[VI[FIC.v]].includes(FIC.k));
      const tm=topCats(rr,'tipomov',2), mz=topCats(rr,'matriz',2), ob=topCats(rr,'objetivos',2), pv=topCats(rr,'provincia',3).filter(d=>!/nacional|virtual/i.test(d.nome));
      return `**${nm1(nome)}** aparece en ${fmt(rr.length)} noticias. `+(FIC.v!=='tipomov' && tm[0]? `Tipo de movimiento más asociado: ${nm1(tm[0].nome)} (${pct(tm[0].n,rr.length)}). ` : '')+(mz[0]? `Repertorio principal: ${nm1(mz[0].nome)} (${pct(mz[0].n,rr.length)}). ` : '')+(ob[0]? `Objetivo más frecuente: ${nm1(ob[0].nome)} (${pct(ob[0].n,rr.length)}). ` : '')+(pv.length && FIC.v!=='provincia' && FIC.v!=='localidad'? `Donde más aparece: ${listaPt(pv.map(d=>nm1(d.nome)))}.` : ''); }
  }
  }catch(e){ return ''; }
  return '';
}

/* ---------- caixa de leitura ---------- */
const PRONTO_ATIVO = {};
const assinatura = aba => JSON.stringify([aba==='dist'? [st.v,st.x,st.mode] : aba==='flow'? FLOW : aba==='typo'? TYPO : aba==='net'? NET : aba==='map'? [mstate.unit,mstate.measure,mstate.mode,mstate.cmp,mstate.ctx] : aba==='ctx'? [CTXV.x,CTXV.nivel] : aba==='time'? SEM.v : aba==='acm'? ACMS.vars : aba==='cmp'? CMP : aba==='fic'? [FIC.v,FIC.k] : 0,
  Object.keys(st.f).sort().map(k=>[k,[...st.f[k]].sort()])]);
function caixaLeitura(id){
  let c=$(id+'Leit'); if(c) return c;
  c=el('div','pronto-leitura'); c.id=id+'Leit'; c.hidden=true; c.setAttribute('aria-live','polite');
  $(id).after(c); return c;
}
function mostrarLeitura(id){
  const A=PRONTO_ATIVO[id]; if(!A) return; const aba=PRESET_ABA[id]; const c=caixaLeitura(id); c.textContent=''; c.hidden=false;
  const cab=el('div','pl-cab'); cab.append(el('span','pl-kicker','Lectura de la combinación'), el('b',null,A.rotulo));
  const fecha=el('button','pl-fecha','×'); fecha.type='button'; fecha.title='Cerrar la lectura'; fecha.setAttribute('aria-label','Cerrar la lectura'); fecha.onclick=()=>{ delete PRONTO_ATIVO[id]; c.hidden=true; }; cab.append(fecha); c.append(cab);
  const mudou = assinatura(aba)!==A.sig;
  if(mudou){ const n=el('p','pl-aviso','Usted cambió las opciones después de abrir esta combinación. El primer texto describe la combinación original; la lectura de los datos describe lo que está ahora en la pantalla.'); c.append(n); }
  const bloco=(tit, txt)=>{ if(!txt) return; const d=el('div','pl-bloco'); d.append(el('h4',null,tit)); const p=el('p'); p.append(...sinPseguro(txt)); d.append(p); c.append(d); };
  bloco('Qué muestra esta combinación', (LEIT[id]||{})[A.rotulo] || A.dica);
  const ft=filtersText(); bloco('Qué dicen los datos', (ft && aba!=='sin' && aba!=='fic'? `_Recorte actual: ${ft} (use “Limpiar filtros” para volver a la base completa)._ ` : '') + dizDe(aba, base()));
  bloco('Cómo se calculó', metodoDe(aba));
}
// clique em qualquer combinação pronta: registra e mostra a leitura depois do redesenho
document.querySelectorAll('.presets').forEach(box=>{ const id=box.id; if(!PRESET_ABA[id]) return;
  box.addEventListener('click', e=>{ const b=e.target.closest('button'); if(!b) return;
    box.querySelectorAll('button').forEach(x=>x.classList.toggle('ativo', x===b));
    setTimeout(()=>{ PRONTO_ATIVO[id]={rotulo:b.textContent, dica:b.title, sig:assinatura(PRESET_ABA[id])}; mostrarLeitura(id); }, 0); }); });
// a cada redesenho, atualiza a leitura da aba visível
const _renderSemLeitura = render;
render = function(){ _renderSemLeitura(); Object.keys(PRONTO_ATIVO).forEach(id=>{ if(PRESET_ABA[id]===TAB) mostrarLeitura(id); }); };
