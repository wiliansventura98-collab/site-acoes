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

prontos('distPresets', 'Combinações prontas:', [
  ['Quem se mobiliza', 'Tipos de movimento nas notícias', ()=>{ st.v='tipomov'; st.x=''; }],
  ['Organizações mais citadas', 'Nomes de movimentos e organizações', ()=>{ st.v='nombremov'; st.x=''; }],
  ['Movimentos × objetivos (associação)', 'Que objetivos são típicos de cada tipo de movimento', ()=>{ st.v='tipomov'; st.x='objetivos'; st.mode='res'; }],
  ['Ação matriz × direcionalidade', 'O repertório e o sentido das ações (reivindicar, defender, propor…)', ()=>{ st.v='matriz'; st.x='direccion'; st.mode='res'; }],
  ['Regiões × tipo de movimento (% da linha)', 'O perfil dos movimentos em cada região', ()=>{ st.v='region'; st.x='tipomov'; st.mode='row'; }],
  ['Escala × instituição interpelada', 'A quem as ações se dirigem em cada escala', ()=>{ st.v='escala'; st.x='tipoinst'; st.mode='res'; }],
  ['Onde acontecem as ações', 'Tipos de lugar: ruas, praças, sedes públicas, espaço virtual', ()=>{ st.v='localizacion'; st.x=''; }],
  ['Objetivos × ODS', 'Como os objetivos se ligam aos Objetivos de Desenvolvimento Sustentável', ()=>{ st.v='objetivos'; st.x='ods'; st.mode='res'; }],
]);

prontos('flowPresets', 'Fluxos prontos:', [
  ['Quem → como → por quê', 'Tipo de movimento → ação matriz → objetivos', ()=>Object.assign(FLOW,{a:'tipomov', b:'matriz', c:'objetivos'})],
  ['Onde → quem → contra quem', 'Região → tipo de movimento → instituição interpelada', ()=>Object.assign(FLOW,{a:'region', b:'tipomov', c:'tipoinst'})],
  ['Ação → sentido → escala', 'Ação matriz → direcionalidade → escala', ()=>Object.assign(FLOW,{a:'matriz', b:'direccion', c:'escala'})],
  ['Objetivos → ODS', 'Objetivos da ação → Objetivos de Desenvolvimento Sustentável', ()=>Object.assign(FLOW,{a:'objetivos', b:'ods', c:''})],
  ['Ação matriz → derivada → lugar', 'Do tipo geral de ação à forma concreta e ao lugar onde acontece', ()=>Object.assign(FLOW,{a:'matriz', b:'derivada', c:'localizacion'})],
]);

prontos('typoPresets', 'Tipologias prontas:', [
  ['Ação matriz › derivada', 'A tipologia de ações da base', ()=>Object.assign(TYPO,{a:'matriz', b:'derivada'})],
  ['Tipo de movimento › organizações', 'Quais organizações compõem cada tipo de movimento', ()=>Object.assign(TYPO,{a:'tipomov', b:'nombremov'})],
  ['Região › província', 'O peso de cada província dentro da sua região', ()=>Object.assign(TYPO,{a:'region', b:'provincia'})],
  ['Objetivos › ação matriz', 'Com que tipo de ação se persegue cada objetivo', ()=>Object.assign(TYPO,{a:'objetivos', b:'matriz'})],
  ['Instituição › escala', 'A quem se dirigem as ações e em que escala', ()=>Object.assign(TYPO,{a:'tipoinst', b:'escala'})],
]);

prontos('netPresets', 'Redes prontas:', [
  ['Articulações entre organizações', '40 organizações mais citadas, cor por tipo de movimento', ()=>Object.assign(NET,{v:'nombremov', n:40, min:2, cor:'tipo'})],
  ['Blocos de organizações', 'Mesma rede, colorida por comunidade (quem age mais entre si)', ()=>Object.assign(NET,{v:'nombremov', n:60, min:2, cor:'com'})],
  ['Só as alianças fortes', 'Apenas ligações com 5 ou mais notícias em comum', ()=>Object.assign(NET,{v:'nombremov', n:40, min:5, cor:'com'})],
  ['Objetivos que andam juntos', 'Quais objetivos aparecem nas mesmas notícias', ()=>Object.assign(NET,{v:'objetivos', n:25, min:5, cor:'com'})],
  ['Tipos de movimento que se encontram', 'Alianças entre tipos de movimento', ()=>Object.assign(NET,{v:'tipomov', n:25, min:3, cor:'com'})],
  ['Instituições interpeladas juntas', 'A quem as ações se dirigem ao mesmo tempo', ()=>Object.assign(NET,{v:'tipoinst', n:25, min:3, cor:'com'})],
]);

const mapa = o => ()=>{ Object.assign(mstate, {mode:'one', ctx:'', mes:'', measure:'abs'}, o); if(typeof pararAnim==='function') pararAnim(); };
prontos('mapPresets', 'Mapas prontos:', [
  ['Notícias por localidade', 'Círculos proporcionais por cidade', mapa({unit:'loc'})],
  ['Taxa por província', 'Notícias por 100 mil habitantes, em cores', mapa({unit:'prov', measure:'rate'})],
  ['Taxa por departamento', 'Notícias por 100 mil habitantes, por departamento', mapa({unit:'dept', measure:'rate'})],
  ['Privação × protestos (bivariado)', 'Onde há carência e onde há notícias de protesto', mapa({unit:'dept', ctx:'biv_ipmh'})],
  ['Pontos quentes', 'Agrupamentos de departamentos com muitas ou poucas notícias', mapa({unit:'dept', ctx:'lisa'})],
  ['Notícias sobre a pobreza regional', 'Círculos por localidade sobre a pobreza da EPH por região', mapa({unit:'loc', ctx:'pob'})],
  ['Notícias sobre a densidade', 'Círculos por departamento sobre a densidade do Censo 2022', mapa({unit:'dept', ctx:'c_dens'})],
  ['Principais movimentos, um mapa cada', 'Mapas lado a lado para as organizações mais citadas', mapa({unit:'loc', mode:'multi', cmp:'nombremov', n:6})],
  ['Tipos de movimento, um mapa cada', 'Mapas lado a lado por tipo de movimento', mapa({unit:'prov', mode:'multi', cmp:'tipomov', n:6, measure:'rate'})],
]);

const ctxp = (nivel, x) => ()=>{ CTXV.nivel=nivel; CTXV.x=x; };
prontos('ctxPresets', 'Perguntas prontas:', [
  ['Mais pobreza, mais protesto?', 'Privação material dos hogares × notícias, por departamento', ctxp('dept','i_ipmh')],
  ['Desemprego e mobilização', 'Desocupação (Censo 2022) × notícias, por província', ctxp('prov','i_desocup')],
  ['Educação e mobilização', 'Secundário completo × notícias, por departamento', ctxp('dept','i_secund')],
  ['Cidade densa, mais notícias?', 'Densidade demográfica × notícias, por província', ctxp('prov','densidade_hab_km2')],
  ['Violência e protesto', 'Homicídios dolosos 2024 × notícias, por província', ctxp('prov','taxa_homicidios_2024')],
  ['Povos indígenas', 'População indígena × notícias, por departamento', ctxp('dept','i_indig')],
  ['Serviços básicos', 'Esgoto em rede × notícias, por departamento', ctxp('dept','i_cloaca')],
]);

prontos('timePresets', 'Ver no tempo:', [
  ['Por tipo de movimento', 'Série semanal empilhada pelos tipos de movimento', ()=>{ SEM.v='tipomov'; }],
  ['Por ação matriz', 'Como o repertório muda ao longo do ano', ()=>{ SEM.v='matriz'; }],
  ['Por objetivos', 'Que reivindicações ganham força em cada momento', ()=>{ SEM.v='objetivos'; }],
  ['Por região', 'Onde se concentra a mobilização em cada semana', ()=>{ SEM.v='region'; }],
  ['Por escala', 'Ações locais, provinciais e nacionais ao longo do ano', ()=>{ SEM.v='escala'; }],
  ['Por direcionalidade', 'Reivindicar, defender, propor: o sentido das ações no tempo', ()=>{ SEM.v='direccion'; }],
]);

const fic = (vid, nome) => [vid, idxDe(vid, nome)];
prontos('ficPresets', 'Fichas sugeridas:', [
  ['UTEP', 'Unión de Trabajadores y Trabajadoras de la Economía Popular', fic('nombremov','Unión de Trabajadores y Trabajadoras de la Economía Popular (UTEP)')],
  ['ATE', 'Asociación de Trabajadores del Estado', fic('nombremov','Asociación de Trabajadores del Estado (ATE)')],
  ['CGT', 'Confederación General del Trabajo', fic('nombremov','Confederación General del Trabajo (CGT)')],
  ['Movimentos feministas', 'Tipo de movimento', fic('tipomov','Movimientos de mujeres/feministas')],
  ['Movimentos estudantis', 'Tipo de movimento', fic('tipomov','Movimientos Estudiantiles')],
  ['CABA', 'Cidade Autônoma de Buenos Aires', fic('provincia','CABA (Ciudad de Buenos Aires)')],
  ['Río Negro', 'Província', fic('provincia','Río Negro')],
  ['Bariloche', 'Localidade', fic('localidad','San Carlos de Bariloche (Río Negro)')],
  ['Objetivos educativos', 'Objetivo', fic('objetivos','Objetivos educativos')],
].filter(([, , [vid,k]])=>k>=0).map(([t,d,[vid,k]])=>[t,d,()=>{ FIC.v=vid; FIC.k=k; $('ficK').value=''; $('ficList').dataset.v=''; }]));

// link do glossário no topo: abre e rola até ele
(()=>{ const a=$('linkGloss'); if(!a) return; a.onclick=e=>{ e.preventDefault(); const g=$('glossario'); g.querySelector('details').open=true; g.scrollIntoView({behavior:'smooth', block:'start'}); }; })();
