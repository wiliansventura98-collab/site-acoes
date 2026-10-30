/* GERADO por i18n/ferramenta.js a partir de assets/js/app/prontos.js; não edite: edite o original e i18n/es.json */
var IDIOMA='es';
/*
 * Combinações prontas
 * Botões que abrem, em cada aba, configurações úteis já montadas: um ponto de partida para explorar a base.
 * Parte da base interativa Ações Socioespaciais 2024. Os arquivos são carregados em ordem por carregar.js
 * e compartilham o escopo global (variáveis declaradas aqui ficam visíveis para os arquivos seguintes).
 */

function prontos(id, rotulo, itens){
  const box=$(id); if(!box) return; box.textContent=''; box.append(el('span',null,rotulo));
  itens.forEach(([txt, dica, fn])=>{ const b=el('button','btn',txt); b.type='button'; if(dica) b.title=dica; b.onclick=()=>{ fn(); render(); }; box.append(b); });
}
const idxDe = (vid, nome) => VARS[VI[vid]]? VARS[VI[vid]].values.indexOf(nome) : -1;

prontos('distPresets', 'Combinaciones listas:', [
  ['Quién se moviliza', 'Tipos de movimiento en las noticias', ()=>{ st.v='tipomov'; st.x=''; }],
  ['Organizaciones más citadas', 'Nombres de movimientos y organizaciones', ()=>{ st.v='nombremov'; st.x=''; }],
  ['Movimientos × objetivos (asociación)', 'Qué objetivos son típicos de cada tipo de movimiento', ()=>{ st.v='tipomov'; st.x='objetivos'; st.mode='res'; }],
  ['Acción matriz × direccionalidad', 'El repertorio y el sentido de las acciones (reivindicar, defender, proponer…)', ()=>{ st.v='matriz'; st.x='direccion'; st.mode='res'; }],
  ['Regiones × tipo de movimiento (% de la fila)', 'El perfil de los movimientos en cada región', ()=>{ st.v='region'; st.x='tipomov'; st.mode='row'; }],
  ['Escala × institución interpelada', 'A quién se dirigen las acciones en cada escala', ()=>{ st.v='escala'; st.x='tipoinst'; st.mode='res'; }],
  ['Dónde ocurren las acciones', 'Tipos de lugar: calles, plazas, sedes públicas, espacio virtual', ()=>{ st.v='localizacion'; st.x=''; }],
  ['Objetivos × ODS', 'Cómo se vinculan los objetivos con los Objetivos de Desarrollo Sostenible', ()=>{ st.v='objetivos'; st.x='ods'; st.mode='res'; }],
  ['Modalidad × tipo de movimiento', 'Acciones socioespaciales, socioterritoriales y virtuales: quién hace cada una', ()=>{ st.v='modalidad'; st.x='tipomov'; st.mode='res'; }],
  ['Movimientos × institución interpelada', 'A quién se dirige cada tipo de movimiento', ()=>{ st.v='tipomov'; st.x='tipoinst'; st.mode='res'; }],
  ['Objetivos × direccionalidad', 'Qué objetivos se reivindican, defienden o proponen', ()=>{ st.v='objetivos'; st.x='direccion'; st.mode='res'; }],
  ['Acción derivada × lugar', 'Dónde ocurre cada forma concreta de acción (marcha, asamblea, ocupación…)', ()=>{ st.v='derivada'; st.x='localizacion'; st.mode='res'; }],
  ['Regiones × objetivos (% de la fila)', 'El perfil de los reclamos en cada región', ()=>{ st.v='region'; st.x='objetivos'; st.mode='row'; }],
  ['Escala × tipo de movimiento', 'Qué movimientos actúan en cada escala', ()=>{ st.v='escala'; st.x='tipomov'; st.mode='res'; }],
  ['Virtual × acción matriz (% de la fila)', 'El repertorio de las acciones virtuales y presenciales', ()=>{ st.v='virtual'; st.x='matriz'; st.mode='row'; }],
]);

prontos('flowPresets', 'Flujos listos:', [
  ['Quién → cómo → por qué', 'Tipo de movimiento → acción matriz → objetivos', ()=>Object.assign(FLOW,{a:'tipomov', b:'matriz', c:'objetivos'})],
  ['Dónde → quién → contra quién', 'Región → tipo de movimiento → institución interpelada', ()=>Object.assign(FLOW,{a:'region', b:'tipomov', c:'tipoinst'})],
  ['Acción → sentido → escala', 'Acción matriz → direccionalidad → escala', ()=>Object.assign(FLOW,{a:'matriz', b:'direccion', c:'escala'})],
  ['Objetivos → ODS', 'Objetivos de la acción → Objetivos de Desarrollo Sostenible', ()=>Object.assign(FLOW,{a:'objetivos', b:'ods', c:''})],
  ['Acción matriz → derivada → lugar', 'Del tipo general de acción a la forma concreta y al lugar donde ocurre', ()=>Object.assign(FLOW,{a:'matriz', b:'derivada', c:'localizacion'})],
  ['Modalidad → acción → lugar', 'Socioespacial o socioterritorial → acción matriz → lugar de la acción', ()=>Object.assign(FLOW,{a:'modalidad', b:'matriz', c:'localizacion'})],
  ['Quién → por qué → contra quién', 'Tipo de movimiento → objetivos → institución interpelada', ()=>Object.assign(FLOW,{a:'tipomov', b:'objetivos', c:'tipoinst'})],
  ['Dónde → cómo → en qué sentido', 'Región → acción matriz → direccionalidad', ()=>Object.assign(FLOW,{a:'region', b:'matriz', c:'direccion'})],
  ['Escala → interlocutor → objetivo', 'Escala → institución interpelada → objetivos', ()=>Object.assign(FLOW,{a:'escala', b:'tipoinst', c:'objetivos'})],
]);

prontos('typoPresets', 'Tipologías listas:', [
  ['Acción matriz › derivada', 'La tipología de acciones de la base', ()=>Object.assign(TYPO,{a:'matriz', b:'derivada'})],
  ['Tipo de movimiento › organizaciones', 'Qué organizaciones componen cada tipo de movimiento', ()=>Object.assign(TYPO,{a:'tipomov', b:'nombremov'})],
  ['Región › provincia', 'El peso de cada provincia dentro de su región', ()=>Object.assign(TYPO,{a:'region', b:'provincia'})],
  ['Objetivos › acción matriz', 'Con qué tipo de acción se persigue cada objetivo', ()=>Object.assign(TYPO,{a:'objetivos', b:'matriz'})],
  ['Institución › escala', 'A quién se dirigen las acciones y en qué escala', ()=>Object.assign(TYPO,{a:'tipoinst', b:'escala'})],
  ['Modalidad › acción matriz', 'El repertorio de las acciones socioespaciales, socioterritoriales y virtuales', ()=>Object.assign(TYPO,{a:'modalidad', b:'matriz'})],
  ['Región › tipo de movimiento', 'Quién se moviliza en cada región', ()=>Object.assign(TYPO,{a:'region', b:'tipomov'})],
  ['Lugar › acción derivada', 'Qué formas de acción ocurren en cada tipo de lugar', ()=>Object.assign(TYPO,{a:'localizacion', b:'derivada'})],
  ['Objetivos › ODS', 'Los Objetivos de Desarrollo Sostenible dentro de cada objetivo', ()=>Object.assign(TYPO,{a:'objetivos', b:'ods'})],
]);

prontos('netPresets', 'Redes listas:', [
  ['Articulaciones entre organizaciones', 'Las 40 organizaciones más citadas, color por tipo de movimiento', ()=>Object.assign(NET,{v:'nombremov', n:40, min:2, cor:'tipo'})],
  ['Bloques de organizaciones', 'La misma red, coloreada por comunidad (quiénes actúan más entre sí)', ()=>Object.assign(NET,{v:'nombremov', n:60, min:2, cor:'com'})],
  ['Solo las alianzas fuertes', 'Solo vínculos con 5 o más noticias en común', ()=>Object.assign(NET,{v:'nombremov', n:40, min:5, cor:'com'})],
  ['Objetivos que van juntos', 'Qué objetivos aparecen en las mismas noticias', ()=>Object.assign(NET,{v:'objetivos', n:25, min:5, cor:'com'})],
  ['Tipos de movimiento que se encuentran', 'Alianzas entre tipos de movimiento', ()=>Object.assign(NET,{v:'tipomov', n:25, min:3, cor:'com'})],
  ['Instituciones interpeladas juntas', 'A quién se dirigen las acciones al mismo tiempo', ()=>Object.assign(NET,{v:'tipoinst', n:25, min:3, cor:'com'})],
  ['Lugares que se combinan', 'Tipos de lugar citados en la misma acción (calle, plaza, sede pública…)', ()=>Object.assign(NET,{v:'localizacion', n:25, min:3, cor:'com'})],
  ['Formas de acción combinadas', 'Acciones derivadas que aparecen juntas (marcha + acto, asamblea + paro…)', ()=>Object.assign(NET,{v:'derivada', n:30, min:3, cor:'com'})],
  ['ODS que van juntos', 'Objetivos de Desarrollo Sostenible en las mismas noticias', ()=>Object.assign(NET,{v:'ods', n:20, min:3, cor:'com'})],
]);

const mapa = o => ()=>{ Object.assign(mstate, {mode:'one', ctx:'', mes:'', measure:'abs'}, o); if(typeof pararAnim==='function') pararAnim(); };
prontos('mapPresets', 'Mapas listos:', [
  ['Noticias por localidad', 'Círculos proporcionales por ciudad', mapa({unit:'loc'})],
  ['Tasa por provincia', 'Noticias por 100 mil habitantes, en colores', mapa({unit:'prov', measure:'rate'})],
  ['Tasa por departamento', 'Noticias por 100 mil habitantes, por departamento', mapa({unit:'dept', measure:'rate'})],
  ['Privación × protestas (bivariado)', 'Dónde hay carencias y dónde hay noticias de protesta', mapa({unit:'dept', ctx:'biv_ipmh'})],
  ['Puntos calientes', 'Agrupamientos de departamentos con muchas o pocas noticias', mapa({unit:'dept', ctx:'lisa'})],
  ['Noticias sobre la pobreza regional', 'Círculos por localidad sobre la pobreza de la EPH por región', mapa({unit:'loc', ctx:'pob'})],
  ['Noticias sobre la densidad', 'Círculos por departamento sobre la densidad del Censo 2022', mapa({unit:'dept', ctx:'c_dens'})],
  ['Principales movimientos, un mapa cada uno', 'Mapas lado a lado para las organizaciones más citadas', mapa({unit:'loc', mode:'multi', cmp:'nombremov', n:6})],
  ['Tipos de movimiento, un mapa cada uno', 'Mapas lado a lado por tipo de movimiento', mapa({unit:'prov', mode:'multi', cmp:'tipomov', n:6, measure:'rate'})],
  ['Barrios populares × protestas (bivariado)', 'Familias en barrios populares (RENABAP) y noticias por habitante, por departamento', mapa({unit:'dept', ctx:'biv_bp_fam'})],
  ['Voto a Milei × protestas (bivariado)', 'Voto a La Libertad Avanza en 2023 y noticias por habitante, por departamento', mapa({unit:'dept', ctx:'biv_v_lla'})],
  ['Economía popular por provincia', 'Inscriptos en el ReNaTEP (% de la población de 18 a 65 años), con los círculos de noticias', mapa({unit:'loc', ctx:'lp_renatep_pct'})],
  ['Femicidios y noticias feministas (filtra)', 'Tasa de femicidios 2024 por provincia, con las noticias de movimientos feministas', ()=>{ mapa({unit:'loc', ctx:'lp_femicidios_taxa_2024'})(); st.f={tipomov:new Set([idxDe('tipomov','Movimientos de mujeres/feministas')].filter(k=>k>=0))}; }],
  ['Desocupación × protestas (bivariado)', 'Desocupación del Censo 2022 y noticias por habitante, por departamento', mapa({unit:'dept', ctx:'biv_desocup'})],
  ['Cloacas × protestas (bivariado)', 'Acceso a cloaca en red y noticias por habitante, por departamento', mapa({unit:'dept', ctx:'biv_cloaca'})],
  ['Jóvenes ni-ni × protestas (bivariado)', 'Jóvenes que no estudian ni trabajan y noticias por habitante', mapa({unit:'dept', ctx:'biv_nini'})],
  ['Objetivos, un mapa cada uno', 'Tasa por provincia para cada objetivo principal', mapa({unit:'prov', mode:'multi', cmp:'objetivos', n:6, measure:'rate'})],
  ['Acciones matriz, un mapa cada una', 'Dónde ocurre cada tipo de acción', mapa({unit:'loc', mode:'multi', cmp:'matriz', n:6})],
  ['Modalidad, un mapa cada una', 'Acciones socioespaciales, socioterritoriales y virtuales en el territorio', mapa({unit:'loc', mode:'multi', cmp:'modalidad', n:3})],
]);

const ctxp = (nivel, x) => ()=>{ CTXV.nivel=nivel; CTXV.x=x; };
prontos('ctxPresets', 'Preguntas listas:', [
  ['¿Más pobreza, más protesta?', 'Privación material de los hogares × noticias, por departamento', ctxp('dept','i_ipmh')],
  ['Desempleo y movilización', 'Desocupación (Censo 2022) × noticias, por provincia', ctxp('prov','i_desocup')],
  ['Educación y movilización', 'Secundario completo × noticias, por departamento', ctxp('dept','i_secund')],
  ['¿Ciudad densa, más noticias?', 'Densidad demográfica × noticias, por provincia', ctxp('prov','densidade_hab_km2')],
  ['Violencia y protesta', 'Homicidios dolosos 2024 × noticias, por provincia', ctxp('prov','taxa_homicidios_2024')],
  ['Pueblos indígenas', 'Población indígena × noticias, por departamento', ctxp('dept','i_indig')],
  ['Servicios básicos', 'Cloaca en red × noticias, por departamento', ctxp('dept','i_cloaca')],
  ['Barrios populares y movilización', 'Familias en barrios populares (RENABAP) × noticias, por departamento', ctxp('dept','i_bp_fam')],
  ['Economía popular (RENATEP)', 'Inscriptos en el registro de la economía popular × noticias, por provincia', ctxp('prov','renatep_pct')],
  ['Economía popular × noticias de la economía popular (filtra)', 'ReNaTEP × noticias de los movimientos de economía social y de desocupados', ()=>{ CTXV.nivel='prov'; CTXV.x='renatep_pct'; st.f={tipomov:new Set([idxDe('tipomov','Movimientos de Economía Social y Solidaria'), idxDe('tipomov','Movimientos de trabajadores Desocupados')].filter(k=>k>=0))}; }],
  ['Femicidios × noticias feministas (filtra)', 'Tasa de femicidios 2024 × noticias de movimientos feministas, por provincia', ()=>{ CTXV.nivel='prov'; CTXV.x='femicidios_taxa_2024'; st.f={tipomov:new Set([idxDe('tipomov','Movimientos de mujeres/feministas')].filter(k=>k>=0))}; }],
  ['Voto a Milei y protesta', 'Voto a La Libertad Avanza (1ª vuelta 2023) × noticias, por departamento', ctxp('dept','i_v_lla')],
  ['Voto a la izquierda y protesta', 'Voto al Frente de Izquierda (1ª vuelta 2023) × noticias, por departamento', ctxp('dept','i_v_fit')],
  ['Alquiler y movilización', 'Hogares en vivienda alquilada × noticias, por departamento', ctxp('dept','i_alquila')],
  ['Jóvenes ni-ni', 'Jóvenes que no estudian ni trabajan × noticias, por departamento', ctxp('dept','i_nini')],
]);

prontos('timePresets', 'Ver en el tiempo:', [
  ['Por tipo de movimiento', 'Serie semanal apilada por tipos de movimiento', ()=>{ SEM.v='tipomov'; }],
  ['Por acción matriz', 'Cómo cambia el repertorio a lo largo del año', ()=>{ SEM.v='matriz'; }],
  ['Por objetivos', 'Qué reclamos ganan fuerza en cada momento', ()=>{ SEM.v='objetivos'; }],
  ['Por región', 'Dónde se concentra la movilización cada semana', ()=>{ SEM.v='region'; }],
  ['Por escala', 'Acciones locales, provinciales y nacionales a lo largo del año', ()=>{ SEM.v='escala'; }],
  ['Por direccionalidad', 'Reivindicar, defender, proponer: el sentido de las acciones en el tiempo', ()=>{ SEM.v='direccion'; }],
  ['Por institución interpelada', 'A quién se dirigen las acciones en cada momento del año', ()=>{ SEM.v='tipoinst'; }],
  ['Por lugar de la acción', 'Calles, plazas, sedes públicas y espacio virtual a lo largo del año', ()=>{ SEM.v='localizacion'; }],
  ['Por modalidad', 'Acciones socioespaciales, socioterritoriales y virtuales en el tiempo', ()=>{ SEM.v='modalidad'; }],
]);

const fic = (vid, nome) => [vid, idxDe(vid, nome)];
prontos('ficPresets', 'Fichas sugeridas:', [
  ['UTEP', 'Unión de Trabajadores y Trabajadoras de la Economía Popular', fic('nombremov','Unión de Trabajadores y Trabajadoras de la Economía Popular (UTEP)')],
  ['ATE', 'Asociación de Trabajadores del Estado', fic('nombremov','Asociación de Trabajadores del Estado (ATE)')],
  ['CGT', 'Confederación General del Trabajo', fic('nombremov','Confederación General del Trabajo (CGT)')],
  ['Movimientos feministas', 'Tipo de movimiento', fic('tipomov','Movimientos de mujeres/feministas')],
  ['Movimientos estudiantiles', 'Tipo de movimiento', fic('tipomov','Movimientos Estudiantiles')],
  ['CABA', 'Ciudad Autónoma de Buenos Aires', fic('provincia','CABA (Ciudad de Buenos Aires)')],
  ['Río Negro', 'Provincia', fic('provincia','Río Negro')],
  ['Bariloche', 'Localidad', fic('localidad','San Carlos de Bariloche (Río Negro)')],
  ['Objetivos educativos', 'Objetivo', fic('objetivos','Objetivos educativos')],
  ['CTA', 'Central de Trabajadores de la Argentina', fic('nombremov','Central de Trabajadores de la Argentina (CTA)')],
  ['MTE', 'Movimiento de Trabajadores Excluidos', fic('nombremov','Movimiento de Trabajadores Excluidos (MTE)')],
  ['Polo Obrero', 'Organización de trabajadores desocupados', fic('nombremov','Polo Obrero')],
  ['Movimiento Evita', 'Organización de la economía popular', fic('nombremov','Movimiento Evita')],
  ['Movimientos ambientalistas', 'Tipo de movimiento', fic('tipomov','Movimientos Ambientalistas')],
  ['Neuquén', 'Provincia', fic('provincia','Neuquén')],
  ['Vivienda y hábitat', 'Objetivo', fic('objetivos','Objetivos por la vivienda y hábitat')],
].filter(([, , [vid,k]])=>k>=0).map(([t,d,[vid,k]])=>[t,d,()=>{ FIC.v=vid; FIC.k=k; $('ficBusca').value=''; $('ficK').dataset.v=''; }]));

// link do glossário no topo: abre e rola até ele
(()=>{ const a=$('linkGloss'); if(!a) return; a.onclick=e=>{ e.preventDefault(); const g=$('glossario'); g.querySelector('details').open=true; g.scrollIntoView({behavior:'smooth', block:'start'}); }; })();
