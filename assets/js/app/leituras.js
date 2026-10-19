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
  'Quem se mobiliza': 'Mostra quais tipos de movimento aparecem nas notícias e com que frequência. É o retrato mais simples de quem são os sujeitos das ações coletivas registradas pela imprensa em 2024. Leia a barra mais longa como o sujeito mais visível, mas lembre que uma notícia pode citar mais de um tipo de movimento.',
  'Organizações mais citadas': 'Lista as organizações nomeadas nas notícias, da mais citada à menos citada. Mostra quais coletivos concentram a visibilidade (por exemplo, centrais sindicais e organizações da economia popular) e quantas organizações aparecem só uma vez, a “cauda longa” de coletivos locais.',
  'Movimentos × objetivos (associação)': 'Cruza quem se mobiliza com o que reivindica. No modo Associação, a tabela não mostra só o que é frequente, mas o que é típico de cada movimento: células azuis indicam combinações que aparecem mais do que o esperado se movimento e objetivo não tivessem relação; vermelhas, menos. É a forma mais direta de ver a pauta própria de cada sujeito.',
  'Ação matriz × direcionalidade': 'Relaciona o tipo geral de ação (comunicativa, deslocamento coletivo, ocupação…) com o sentido da ação (reivindicar, defender, propor, comemorar uma conquista ou reagir a algo sofrido). Ajuda a perceber se certos repertórios são usados sobretudo para defender direitos ameaçados ou para propor e reivindicar.',
  'Regiões × tipo de movimento (% da linha)': 'Para cada região, mostra como as notícias se repartem entre os tipos de movimento (cada linha soma 100%). Permite comparar o perfil da mobilização entre regiões: por exemplo, se o peso dos sindicais ou da economia popular é maior no Gran Buenos Aires ou na Patagônia.',
  'Escala × instituição interpelada': 'Cruza a escala da ação (municipal, provincial, nacional…) com a instituição a quem a ação se dirige. Mostra a coerência territorial das demandas: ações municipais tendem a interpelar governos locais, e ações nacionais, o Estado nacional e o Congresso. Desvios dessa regra indicam conflitos que atravessam escalas.',
  'Onde acontecem as ações': 'Mostra os tipos de lugar em que as ações acontecem: ruas, praças, sedes de órgãos públicos, rotas, espaço virtual. É a dimensão socioespacial do repertório: que espaços são apropriados para tornar a luta visível.',
  'Objetivos × ODS': 'Relaciona os objetivos das ações com os Objetivos de Desenvolvimento Sustentável da ONU atribuídos na codificação. Mostra como as pautas dos movimentos se traduzem na linguagem da agenda internacional (trabalho decente, redução das desigualdades, igualdade de gênero…).',
  'Modalidade × tipo de movimento': 'Separa as ações socioespaciais (que usam o espaço para se manifestar), socioterritoriais (que disputam ou constroem território) e virtuais, e mostra quais movimentos são típicos de cada modalidade. É o cruzamento mais próximo do debate teórico sobre movimentos socioespaciais e socioterritoriais.',
  'Movimentos × instituição interpelada': 'Mostra a quem cada tipo de movimento dirige suas ações. Ajuda a identificar o interlocutor típico de cada sujeito: o Estado nacional, os governos provinciais, as universidades, as empresas ou a polícia.',
  'Objetivos × direcionalidade': 'Cruza o que se reivindica com o sentido da ação. Indica quais pautas aparecem sobretudo em ações defensivas (contra cortes, demissões ou retrocessos) e quais em ações propositivas ou reivindicativas.',
  'Ação derivada × lugar': 'Liga as formas concretas de ação (marcha, assembleia, ato, ocupação, panelaço…) aos lugares onde acontecem. Mostra, por exemplo, que marchas ocupam ruas e praças e que assembleias acontecem em sedes e locais de trabalho.',
  'Regiões × objetivos (% da linha)': 'Para cada região, mostra como as notícias se repartem entre os objetivos. Permite comparar a pauta regional: se as reivindicações laborais, educativas ou de moradia pesam mais em uma região do que em outra.',
  'Escala × tipo de movimento': 'Mostra que movimentos agem em cada escala. Ajuda a distinguir sujeitos que atuam sobretudo localmente (movimentos de bairro, moradia) daqueles que organizam ações de alcance nacional (centrais sindicais, organizações da economia popular).',
  'Virtual × ação matriz (% da linha)': 'Compara o repertório das ações virtuais com o das presenciais. Mostra que tipos de ação migram para o espaço virtual (sobretudo as comunicativas e as campanhas) e quais dependem da presença física no espaço.',
},
flowPresets: {
  'Quem → como → por quê': 'Segue as notícias em três etapas: o tipo de movimento, o tipo de ação que ele usa e o objetivo que persegue. As faixas mais grossas são os caminhos mais frequentes. Serve para ver, por exemplo, por quais repertórios os sindicais chegam às pautas laborais.',
  'Onde → quem → contra quem': 'Liga a região da ação ao tipo de movimento e à instituição interpelada. Mostra a geografia dos conflitos: quem se mobiliza em cada região e contra qual instância do poder.',
  'Ação → sentido → escala': 'Liga a ação matriz à direcionalidade e à escala. Responde: que tipos de ação são defensivos ou propositivos, e em que escala acontecem.',
  'Objetivos → ODS': 'Mostra como cada objetivo das ações se distribui entre os Objetivos de Desenvolvimento Sustentável. Faixas grossas indicam a tradução mais comum de cada pauta na agenda da ONU.',
  'Ação matriz → derivada → lugar': 'Desce do tipo geral de ação à forma concreta e ao lugar onde ela acontece. É a cadeia completa do repertório socioespacial: de “deslocamento coletivo” a “marcha” e a “ruas”.',
  'Modalidade → ação → lugar': 'Parte da modalidade (socioespacial, socioterritorial ou virtual), passa pela ação matriz e chega ao lugar. Mostra como cada modalidade se materializa em ações e espaços concretos.',
  'Quem → por quê → contra quem': 'Liga o tipo de movimento ao objetivo e à instituição interpelada. Permite seguir cada sujeito até a sua pauta e o seu interlocutor.',
  'Onde → como → em que sentido': 'Liga a região à ação matriz e à direcionalidade. Mostra se o repertório e o sentido das ações mudam de uma região para outra.',
  'Escala → interlocutor → objetivo': 'Liga a escala da ação à instituição interpelada e ao objetivo. Mostra que pautas são levadas a cada nível do Estado.',
},
typoPresets: {
  'Ação matriz › derivada': 'A tipologia de ações da base: cada retângulo grande é uma ação matriz e, dentro dele, as ações derivadas (as formas concretas). A área é proporcional ao número de notícias. Mostra quais formas concretas dão corpo a cada tipo geral de ação.',
  'Tipo de movimento › organizações': 'Mostra quais organizações compõem cada tipo de movimento e quanto cada uma pesa nas notícias. Revela se um tipo de movimento é dominado por poucas organizações ou é formado por muitos coletivos pequenos.',
  'Região › província': 'Mostra o peso de cada província dentro da sua região. Útil para saber se a mobilização de uma região está concentrada numa província ou distribuída.',
  'Objetivos › ação matriz': 'Para cada objetivo, mostra com que tipos de ação ele é perseguido. Indica, por exemplo, se as pautas educativas se expressam mais em deslocamentos coletivos e as laborais em interrupções do processo produtivo.',
  'Instituição › escala': 'Para cada instituição interpelada, mostra em que escala as ações acontecem. Ajuda a ver se o Estado nacional é interpelado também por ações locais.',
  'Modalidade › ação matriz': 'Mostra o repertório de cada modalidade: que ações são socioespaciais, quais são socioterritoriais e quais são virtuais.',
  'Região › tipo de movimento': 'Mostra quem se mobiliza em cada região, com área proporcional às notícias. Útil para comparar a composição dos sujeitos entre regiões.',
  'Lugar › ação derivada': 'Para cada tipo de lugar (rua, praça, sede pública…), mostra as formas concretas de ação que ali acontecem. É a leitura do espaço como recurso da ação coletiva.',
  'Objetivos › ODS': 'Mostra, dentro de cada objetivo das ações, os Objetivos de Desenvolvimento Sustentável associados.',
},
netPresets: {
  'Articulações entre organizações': 'Rede das 40 organizações mais citadas: cada círculo é uma organização e cada linha liga duas organizações que aparecem juntas em pelo menos duas notícias. A cor indica o tipo de movimento predominante. Mostra quem age junto com quem.',
  'Blocos de organizações': 'A mesma rede de organizações, agora colorida por comunidade: grupos de organizações que aparecem juntas entre si mais do que com as demais. Ajuda a identificar blocos ou frentes de ação (por exemplo, economia popular, centrais sindicais, esquerda).',
  'Só as alianças fortes': 'Mantém apenas as ligações com cinco ou mais notícias em comum. Some o ruído das parcerias ocasionais e sobram as alianças estáveis do ano.',
  'Objetivos que andam juntos': 'Rede dos objetivos: dois objetivos se ligam quando aparecem na mesma notícia. Mostra que pautas são articuladas nas mesmas ações (por exemplo, laborais e políticas).',
  'Tipos de movimento que se encontram': 'Rede dos tipos de movimento: liga tipos que aparecem nas mesmas notícias. Mostra as alianças entre sujeitos diferentes, como sindicais e estudantis.',
  'Instituições interpeladas juntas': 'Liga as instituições que são interpeladas na mesma ação. Mostra quando uma ação mira ao mesmo tempo, por exemplo, o Estado nacional e o Congresso.',
  'Lugares que se combinam': 'Liga os tipos de lugar citados na mesma ação. Mostra trajetos e combinações espaciais, como marchas que saem de uma praça e chegam a uma sede pública.',
  'Formas de ação combinadas': 'Liga as ações derivadas que aparecem na mesma notícia. Mostra as sequências do repertório, como assembleia seguida de paralisação, ou marcha com ato.',
  'ODS que andam juntos': 'Liga os Objetivos de Desenvolvimento Sustentável atribuídos à mesma notícia. Mostra como as pautas combinam diferentes dimensões da agenda internacional.',
},
mapPresets: {
  'Notícias por localidade': 'Círculos proporcionais ao número de notícias que citam cada cidade. É o mapa mais direto de onde a mobilização foi registrada; mostra a concentração nas capitais e nos grandes centros urbanos.',
  'Taxa por província': 'Pinta cada província pelo número de notícias por 100 mil habitantes. Corrige o efeito do tamanho da população: uma província pequena pode ter poucas notícias e, ainda assim, uma taxa alta.',
  'Taxa por departamento': 'O mesmo cálculo de notícias por 100 mil habitantes, agora por departamento. Mostra contrastes internos às províncias. Os contornos laranja e azul marcam lugares com muito mais ou muito menos notícias do que a população faria esperar.',
  'Privação × protestos (bivariado)': 'Combina, em cada departamento, a privação material dos domicílios (Censo 2022) com as notícias por habitante. Verde-escuro: privação alta e muitas notícias; azul: privação alta e nenhuma notícia; amarelo: privação baixa e muitas notícias. Ajuda a ver onde a carência e a mobilização registrada coincidem e onde não.',
  'Pontos quentes': 'Identifica agrupamentos de departamentos vizinhos com muitas notícias por habitante (pontos quentes, em laranja) ou com poucas (pontos frios, em azul). Mostra se a mobilização forma manchas regionais, e não só pontos isolados.',
  'Notícias sobre a pobreza regional': 'Círculos de notícias por localidade sobre o fundo da pobreza por região estatística (EPH, 2º semestre de 2024). Permite comparar visualmente onde a pobreza é maior e onde se concentram as notícias.',
  'Notícias sobre a densidade': 'Círculos de notícias sobre o fundo da densidade demográfica por departamento. Funciona como controle: mostra quanto da concentração das notícias acompanha simplesmente a concentração da população.',
  'Principais movimentos, um mapa cada': 'Um mapa para cada organização mais citada, na mesma escala. Mostra a geografia de cada organização: quais têm presença nacional e quais são regionais.',
  'Tipos de movimento, um mapa cada': 'Um mapa de taxa por província para cada tipo de movimento, com a mesma legenda. Permite comparar onde cada sujeito é proporcionalmente mais ativo.',
  'Bairros populares × protestos (bivariado)': 'Combina, por departamento, as famílias que vivem em bairros populares (RENABAP) com as notícias por habitante. Mostra se a mobilização registrada aparece onde estão os bairros populares, base das organizações da economia popular e dos movimentos de bairro.',
  'Voto em Milei × protestos (bivariado)': 'Combina, por departamento, o voto em La Libertad Avanza no primeiro turno de 2023 com as notícias por habitante. Ajuda a discutir se a mobilização de 2024 se concentrou em lugares de maior ou menor apoio eleitoral ao governo.',
  'Economia popular por província': 'Pinta as províncias pela proporção de inscritos no registro da economia popular (ReNaTEP) e sobrepõe os círculos de notícias. Mostra onde a economia popular é maior e se a mobilização registrada acompanha esse peso.',
  'Femicídios e notícias feministas (filtra)': 'Pinta as províncias pela taxa de femicídios de 2024 e mostra, em círculos, só as notícias de movimentos feministas (este botão aplica um filtro). Ajuda a discutir se a mobilização feminista registrada acompanha a violência de gênero.',
  'Desocupação × protestos (bivariado)': 'Combina, por departamento, a taxa de desocupação do Censo 2022 com as notícias por habitante. Mostra se a mobilização registrada coincide com os lugares de maior desemprego.',
  'Esgoto × protestos (bivariado)': 'Combina, por departamento, o acesso a esgoto em rede com as notícias por habitante. Como o esgoto é um bom indicador de infraestrutura urbana, ajuda a ver se as notícias se concentram nas áreas mais urbanizadas.',
  'Jovens nem-nem × protestos (bivariado)': 'Combina, por departamento, a proporção de jovens que não estudam nem trabalham com as notícias por habitante. Mostra se a mobilização registrada aparece onde a exclusão juvenil é maior.',
  'Objetivos, um mapa cada': 'Um mapa de taxa por província para cada objetivo principal, com a mesma legenda. Mostra a geografia das pautas: onde as reivindicações laborais, educativas ou de moradia pesam mais.',
  'Ações matriz, um mapa cada': 'Um mapa de círculos para cada tipo de ação. Mostra se certos repertórios (ocupações, interrupções do processo produtivo) são mais concentrados em algumas regiões.',
  'Modalidade, um mapa cada': 'Um mapa para cada modalidade: socioespacial, socioterritorial e virtual. Mostra se as ações que disputam território têm uma geografia diferente das que apenas usam o espaço para se manifestar.',
},
ctxPresets: {
  'Mais pobreza, mais protesto?': 'Cada ponto é um departamento: no eixo horizontal, a privação material dos domicílios (Censo 2022); no vertical, as notícias por 100 mil habitantes. A pergunta é se os lugares mais pobres são os que mais se mobilizam, segundo a imprensa.',
  'Desemprego e mobilização': 'Compara, por província, a desocupação do Censo 2022 com as notícias por habitante. Testa a hipótese de que o desemprego alimenta a ação coletiva, especialmente dos movimentos de desocupados.',
  'Educação e mobilização': 'Compara, por departamento, a proporção de adultos com secundário completo com as notícias por habitante. A escolaridade costuma acompanhar a urbanização e a presença de universidades, o que pode aumentar a mobilização registrada.',
  'Cidade densa, mais notícias?': 'Compara a densidade demográfica das províncias com as notícias por habitante. Funciona como controle: se a relação for forte, parte do que parece efeito das condições sociais pode ser só efeito da urbanização e da presença da imprensa.',
  'Violência e protesto': 'Compara a taxa de homicídios dolosos de 2024 com as notícias por habitante, por província. Ajuda a ver se a violência urbana se associa à mobilização registrada.',
  'Povos indígenas': 'Compara, por departamento, a proporção de população indígena com as notícias por habitante. Ajuda a discutir a visibilidade das lutas dos povos originários na imprensa.',
  'Serviços básicos': 'Compara, por departamento, o acesso a esgoto em rede com as notícias por habitante. Mede se a falta de infraestrutura urbana se associa à mobilização registrada.',
  'Bairros populares e mobilização': 'Compara, por departamento, as famílias em bairros populares (RENABAP) por mil habitantes com as notícias por habitante. Os bairros populares são a base territorial da economia popular e dos movimentos de bairro e de moradia.',
  'Economia popular (RENATEP)': 'Compara, por província, a proporção de inscritos no registro da economia popular com as notícias por habitante. Pergunta se as províncias onde a economia popular é maior são também as de mais mobilização registrada.',
  'Economia popular × notícias da economia popular (filtra)': 'Mesma comparação, mas só com as notícias de movimentos da economia social e solidária e de trabalhadores desocupados (este botão aplica um filtro). Testa se esses movimentos aparecem mais onde está a sua base social.',
  'Femicídios × notícias feministas (filtra)': 'Compara, por província, a taxa de femicídios de 2024 com as notícias de movimentos feministas por habitante (este botão aplica um filtro). Pergunta se a mobilização feminista registrada acompanha a violência de gênero.',
  'Voto em Milei e protesto': 'Compara, por departamento, o voto em La Libertad Avanza no primeiro turno de 2023 com as notícias por habitante em 2024. Ajuda a discutir a relação entre o mapa eleitoral e o mapa da mobilização contra as políticas do novo governo.',
  'Voto na esquerda e protesto': 'Compara, por departamento, o voto na Frente de Izquierda em 2023 com as notícias por habitante. A presença da esquerda costuma acompanhar a organização sindical e estudantil.',
  'Aluguel e mobilização': 'Compara, por departamento, a proporção de domicílios alugados com as notícias por habitante. O aluguel é um indicador do problema da moradia urbana e da presença de inquilinos organizados.',
  'Jovens nem-nem': 'Compara, por departamento, a proporção de jovens de 14 a 24 anos que não estudam nem trabalham com as notícias por habitante. Mede se a exclusão juvenil se associa à mobilização registrada.',
},
timePresets: {
  'Por tipo de movimento': 'Série semana a semana, com as notícias empilhadas por tipo de movimento. Mostra quando cada sujeito entra em cena e se os picos do ano são puxados por um tipo de movimento em particular.',
  'Por ação matriz': 'Série semanal por tipo de ação. Mostra se o repertório muda ao longo do ano, por exemplo, mais deslocamentos coletivos nas grandes datas de mobilização.',
  'Por objetivos': 'Série semanal por objetivo. Mostra que pautas ganham força em cada momento do ano, como as educativas em torno das marchas universitárias.',
  'Por região': 'Série semanal por região. Mostra se os picos de mobilização são nacionais ou concentrados em uma região.',
  'Por escala': 'Série semanal por escala da ação. Mostra quando a mobilização se nacionaliza (paros gerais, marchas federais) e quando predomina a ação local.',
  'Por direcionalidade': 'Série semanal pelo sentido da ação. Mostra se, em certos momentos, as ações defensivas (contra cortes e demissões) crescem em relação às propositivas.',
  'Por instituição interpelada': 'Série semanal por instituição interpelada. Mostra em que momentos o Estado nacional, o Congresso ou as universidades se tornam o alvo principal.',
  'Por lugar da ação': 'Série semanal por tipo de lugar. Mostra quando as ações ocupam ruas e praças e quando se recolhem a sedes ou ao espaço virtual.',
  'Por modalidade': 'Série semanal por modalidade (socioespacial, socioterritorial, virtual). Mostra o ritmo de cada forma de ação ao longo do ano.',
},
sinPresets: {
  'Toda a base': 'A síntese de todas as notícias, sem filtros: o retrato geral das ações coletivas registradas pela imprensa em 2024.',
  'Movimentos sindicais': 'A síntese só das notícias com movimentos sindicais: seus repertórios, pautas, interlocutores, lugares e alianças.',
  'Economia popular e desocupados': 'A síntese das notícias dos movimentos da economia social e solidária e de trabalhadores desocupados, base das organizações como UTEP, MTE e Polo Obrero.',
  'Feministas e LGTTBIQ+': 'A síntese das notícias de movimentos de mulheres, feministas e LGTTBIQ+.',
  'Educação': 'A síntese das notícias com objetivos educativos, que inclui as marchas universitárias de 2024.',
  'Moradia e hábitat': 'A síntese das notícias com objetivos de moradia e hábitat.',
  'Direitos humanos': 'A síntese das notícias com objetivos em torno dos direitos humanos, que inclui o 24 de março.',
  'Gran Buenos Aires': 'A síntese das notícias da região metropolitana de Buenos Aires (CABA e 24 partidos).',
  'Patagônia': 'A síntese das notícias da região patagônica.',
  'Norte (NOA e NEA)': 'A síntese das notícias das regiões Noroeste e Nordeste.',
  'Ações defensivas': 'A síntese das ações de sentido defensivo: as que reagem a cortes, demissões, despejos e outras ameaças.',
  'Escala nacional': 'A síntese das ações de escala nacional.',
},
cmpPresets: {
  'GBA × demais regiões, por tipo de movimento': 'Compara o perfil dos movimentos no Gran Buenos Aires com o do resto do país. Para cada tipo de movimento, mostra a porcentagem nas notícias de cada grupo e se a diferença é significativa.',
  'Sindicais × demais, por ação matriz': 'Compara o repertório dos movimentos sindicais com o de todos os outros. Mostra que tipos de ação são próprios dos sindicatos (como a interrupção do processo produtivo).',
  'Patagônia × Noroeste, por objetivos': 'Compara as pautas de duas regiões distantes e diferentes: a Patagônia e o Noroeste.',
  'Feministas × estudantis, por ação matriz': 'Compara os repertórios de dois sujeitos com forte presença nas ruas: movimentos feministas e estudantis.',
  'Escala nacional × municipal, por instituição interpelada': 'Compara a quem se dirigem as ações nacionais e as municipais. Mostra a correspondência entre escala da ação e nível do Estado.',
  'Ações virtuais × presenciais, por objetivos': 'Compara as pautas das ações virtuais com as das presenciais.',
  'Reivindicativas × defensivas, por tipo de movimento': 'Compara quem faz ações reivindicativas e quem faz ações defensivas. Mostra que sujeitos estão mais na defensiva em 2024.',
  'Pampeana × Patagônia, por ação matriz': 'Compara os repertórios de ação da região Pampeana e da Patagônia.',
  'Economia popular × sindicais, por instituição interpelada': 'Compara a quem se dirigem as organizações da economia popular e os sindicatos. Mostra interlocutores diferentes: ministérios de desenvolvimento social de um lado, empregadores e Estado empregador de outro.',
  'Desocupados × sindicais, por lugar da ação': 'Compara os lugares das ações dos trabalhadores desocupados e dos sindicais: rotas e ruas de um lado, locais de trabalho e sedes de outro.',
  'Socioterritoriais × socioespaciais, por tipo de movimento': 'Compara quem faz ações socioterritoriais (que disputam ou constroem território) e quem faz ações socioespaciais (que usam o espaço para se manifestar).',
  'UTEP × ATE, por ação matriz': 'Compara os repertórios das duas organizações mais citadas: a UTEP, da economia popular, e a ATE, dos trabalhadores do Estado.',
  'CGT × CTA, por objetivos': 'Compara as pautas das duas grandes centrais sindicais.',
  'GBA × Pampeana, por objetivos': 'Compara as pautas da região metropolitana com as do restante da região pampeana.',
  'Defensivas × propositivas, por objetivos': 'Compara as pautas das ações defensivas com as das propositivas.',
  'Ambientalistas × demais, por lugar da ação': 'Compara os lugares das ações ambientalistas com os de todas as outras.',
},
acmPresets: {
  'Quem, como e onde': 'Coloca no mesmo plano tipo de movimento, ação, objetivo, direcionalidade, escala e região. Categorias próximas tendem a aparecer nas mesmas notícias; os eixos resumem as grandes oposições da base.',
  'Repertório de ação': 'Analisa juntas a ação matriz, a direcionalidade, a modalidade, o lugar e a escala. Mostra as grandes famílias de repertório.',
  'Movimentos e objetivos': 'Plano de correspondências entre tipos de movimento, objetivos e direcionalidade: um mapa das pautas de cada sujeito.',
  'Instituições interpeladas': 'Relaciona as instituições interpeladas à escala, à região e à direcionalidade. Mostra os “alvos” típicos de cada tipo de ação.',
  'Espaço da ação': 'Relaciona lugar da ação, dependências públicas, escala e região: a dimensão espacial das ações.',
  'Ação e desenvolvimento sustentável': 'Relaciona ação matriz, objetivos e ODS.',
  'Presencial ou virtual': 'Relaciona ação virtual, modalidade, ação matriz e tipo de movimento: mostra o que distingue as ações virtuais.',
  'Socioespacial ou socioterritorial': 'Relaciona a modalidade com o tipo de movimento, o lugar, a escala e a região: o que distingue ações socioespaciais de socioterritoriais.',
  'Objetivos e interlocutores': 'Relaciona objetivos, instituições interpeladas, escala e direcionalidade: que pautas se dirigem a quem.',
  'Regiões e repertórios': 'Relaciona região, ação matriz, direcionalidade e tipo de movimento: as diferenças regionais de repertório.',
},
ficPresets: {
  'UTEP': 'Ficha da Unión de Trabajadores y Trabajadoras de la Economía Popular, sindicato dos trabalhadores da economia popular que reúne organizações como o MTE e o Movimiento Evita. É a organização mais citada da base.',
  'ATE': 'Ficha da Asociación de Trabajadores del Estado, sindicato dos trabalhadores do setor público, muito ativo em 2024 contra as demissões no Estado.',
  'CGT': 'Ficha da Confederación General del Trabajo, a maior central sindical do país, que convocou paros gerais em 2024.',
  'Movimentos feministas': 'Ficha do tipo de movimento “mulheres/feministas”: onde e quando agem, com que repertório e por quais pautas.',
  'Movimentos estudantis': 'Ficha do tipo de movimento estudantil, protagonista das marchas federais universitárias de 2024.',
  'CABA': 'Ficha da Cidade Autônoma de Buenos Aires, o lugar com mais notícias da base.',
  'Río Negro': 'Ficha da província de Río Negro, uma das que têm mais notícias em relação à população.',
  'Bariloche': 'Ficha de San Carlos de Bariloche, cidade com muito mais notícias do que a sua população faria esperar.',
  'Objetivos educativos': 'Ficha das ações com objetivos educativos: quem as faz, onde e quando.',
  'CTA': 'Ficha da Central de Trabajadores de la Argentina, central sindical que reúne sobretudo trabalhadores estatais e docentes.',
  'MTE': 'Ficha do Movimiento de Trabajadores Excluidos, organização da economia popular integrante da UTEP.',
  'Polo Obrero': 'Ficha do Polo Obrero, organização de trabalhadores desocupados ligada ao Partido Obrero.',
  'Movimiento Evita': 'Ficha do Movimiento Evita, organização da economia popular integrante da UTEP.',
  'Movimentos ambientalistas': 'Ficha dos movimentos ambientalistas: onde e contra quem agem.',
  'Neuquén': 'Ficha da província de Neuquén.',
  'Moradia e hábitat': 'Ficha das ações com objetivos de moradia e hábitat.',
},
};
const PRESET_ABA = { distPresets:'dist', cmpPresets:'cmp', flowPresets:'flow', typoPresets:'typo', acmPresets:'acm', netPresets:'net', mapPresets:'map', ctxPresets:'ctx', timePresets:'time', sinPresets:'sin', ficPresets:'fic' };

/* ---------- 3. como foi calculado (por aba) ---------- */
function metodoDe(aba){
  switch(aba){
    case 'dist': return st.x? `Conta-se, para cada par de categorias, quantas notícias têm as duas. Modo **Contagem**: o número de notícias. **% da linha**: a célula dividida pelo total da linha (“das notícias desta linha, quantas têm esta coluna?”). **% da coluna**: o mesmo pela coluna. **Associação**: o resíduo ajustado, que compara a contagem com o esperado se as variáveis não tivessem relação (total da linha × total da coluna ÷ total geral), na escala do desvio-padrão; acima de +1,96 ou abaixo de −1,96 a diferença dificilmente é acaso (p < 0,05). Uma notícia com várias categorias conta em cada uma delas.`
      : `Conta-se em quantas notícias do recorte cada categoria aparece; a porcentagem é sobre o total de notícias do recorte. Como uma notícia pode ter várias categorias, as porcentagens podem somar mais de 100%. Notícias repetidas ficam de fora, salvo se a opção estiver marcada.`;
    case 'cmp': return `Para cada categoria, calcula-se a porcentagem das notícias do grupo A e do grupo B que a têm, e a diferença em pontos percentuais. O teste z de diferença de proporções diz se a diferença é grande demais para ser acaso; as diferenças significativas (|z| ≥ 1,96, p < 0,05) aparecem destacadas.`;
    case 'flow': return `Diagrama de Sankey. Cada notícia passa pelas etapas com as suas categorias; quando tem mais de uma categoria numa etapa, o seu peso é repartido igualmente entre elas, para que cada coluna some o total de notícias. A espessura de cada faixa é a soma desses pesos. Aparecem as categorias mais frequentes de cada etapa; as demais ficam em “Outras”.`;
    case 'typo': return `Mapa de árvore. A área de cada retângulo é proporcional ao número de notícias com a combinação; quando uma notícia tem várias categorias, o seu peso é repartido entre elas, para que o total seja o número de notícias.`;
    case 'acm': return `Análise de correspondências múltiplas com codificação difusa (uma notícia com várias categorias reparte o seu peso entre elas), sobre as oito categorias mais frequentes de cada variável. Os eixos resumem as maiores diferenças entre as notícias; a porcentagem de cada eixo é a inércia corrigida pelo método de Benzécri. Categorias próximas no plano tendem a aparecer nas mesmas notícias; as mais afastadas do centro são as que mais distinguem.`;
    case 'net': return `Rede de coocorrência: duas categorias se ligam quando aparecem na mesma notícia, e a espessura da linha é o número de notícias em comum. Entram as ${NET.n} categorias mais citadas e as ligações com ${NET.min} ou mais notícias em comum. Grau = número de parceiros. Comunidades: método de Louvain, que agrupa os nós que se ligam mais entre si. Intermediação (Brandes): parcela dos caminhos mais curtos da rede que passa por cada nó, de 0 a 1.`;
    case 'map': return `Veja o quadro “Como foi calculado este mapa”, logo abaixo da prancha: ele descreve as taxas, as classes de cores e os destaques do mapa atual, com exemplos.`;
    case 'ctx': return `Veja “Como foi calculado” dentro da leitura do gráfico: taxa por habitante, correlação de Spearman, linha de tendência e critério de “muito acima” ou “muito abaixo” da tendência.`;
    case 'time': return `Cada notícia é posta na semana (de segunda a domingo) da data de início da ação ou, na falta dela, da data de publicação. Quando tem várias categorias, o seu peso é repartido entre elas. Semana de pico: acima de Q3 + 1,5 × (Q3 − Q1), sendo Q1 e Q3 o primeiro e o terceiro quartis das semanas do ano. Os acontecimentos marcados vêm de fontes jornalísticas e oficiais (lista no projeto).`;
    case 'sin': return `A síntese é calculada a partir do recorte atual com regras descritas na sua nota metodológica, ao final da aba.`;
    case 'fic': return `A ficha reúne só as notícias que têm a categoria escolhida. As porcentagens dos perfis são sobre essas notícias; uma notícia pode ter várias categorias. O mapa usa círculos proporcionais por localidade.`;
  }
  return '';
}

/* ---------- 2. o que os dados dizem (leitura automática) ---------- */
const nm1 = s => capS(String(s||'')).replace(/ \((Buenos Aires|[^)]+)\)$/,'');
function topCats(rows, vid, n){ return sinTop(rows, vid, n); }
function dizDe(aba, b){
  const rows=b.filter(r=>match(r,null)), N=rows.length;
  if(N<5) return 'O recorte atual tem poucas notícias para uma leitura.';
  try{
  switch(aba){
    case 'dist': {
      const v=VARS[VI[st.v]];
      if(!st.x){ const t=topCats(rows, st.v, 5); if(!t.length) return 'Sem categorias neste recorte.';
        const t3=t.slice(0,3), any=rows.filter(r=>r.v[VI[st.v]].some(k=>t3.some(d=>d.k===k))).length;
        return `Das ${fmt(N)} notícias do recorte, a categoria mais frequente é **${nm1(t[0].nome)}** (${fmt(t[0].n)} notícias, ${pct(t[0].n,N)})`+(t[1]? `, seguida de ${nm1(t[1].nome)} (${pct(t[1].n,N)})`:'')+(t[2]? ` e ${nm1(t[2].nome)} (${pct(t[2].n,N)})`:'')+`. As três primeiras aparecem em ${pct(any,N)} das notícias.`; }
      const res=sinResiduos(rows, st.v, st.x); if(!res.length) return 'Poucas combinações com 5 ou mais notícias neste recorte para avaliar a associação.';
      const pos=res.filter(x=>x.r>=1.96).slice(0,3), neg=res.filter(x=>x.r<=-1.96).sort((a,q)=>a.r-q.r).slice(0,3);
      const f = x => `${nm1(x.A)} com ${nm1(x.B)} (${fmt(x.ob)} notícias, quando se esperariam ${nfmt1(x.e)}; resíduo ${nfmt1(x.r).replace('-','−')})`;
      return (pos.length? `As combinações que mais **atraem** (mais notícias do que o esperado) são ${listaPt(pos.map(f))}. ` : 'Nenhuma combinação fica claramente acima do esperado. ')
        + (neg.length? `As que mais se **afastam** (menos do que o esperado) são ${listaPt(neg.map(f))}. ` : '')
        + `Em palavras simples: as primeiras são características umas das outras; as segundas raramente aparecem juntas.`; }
    case 'cmp': { const t=$('cmpLeitura'); return t && !t.hidden? t.innerText.replace(/^Leitura:\s*/,'') : 'Escolha os dois grupos para ver a leitura.'; }
    case 'acm': { const t=$('acmLeitura'); return t && !t.hidden? t.innerText.replace(/^Leitura:\s*/,'') : 'O recorte é pequeno demais para a análise.'; }
    case 'ctx': { const t=$('ctxLeitura'); if(!t || t.hidden) return 'Sem dados suficientes para a correlação.'; const c=t.cloneNode(true); c.querySelectorAll('details').forEach(d=>d.remove()); const tx=c.innerText.replace(/^Leitura:\s*/,''); const um=tx.split(/(?<=\.)\s+●/)[0]; return um + (tx.length>um.length+5? ' Os lugares muito acima ou muito abaixo da tendência estão nomeados na leitura logo abaixo do quadro, com os valores observados e previstos e o cálculo passo a passo.' : ''); }
    case 'flow': {
      const etapas=[FLOW.a, FLOW.b, FLOW.c].filter(x=>x && VI[x]!=null); if(etapas.length<2) return '';
      const top=etapas.map(vid=>new Set(topCats(rows, vid, FLOW.n||8).map(d=>d.k)));
      const cont=new Map(); rows.forEach(r=>{ const cs=etapas.map((vid,i)=>r.v[VI[vid]].filter(k=>top[i].has(k))); if(cs.some(c=>!c.length)) return; const w=1/cs.reduce((p,c)=>p*c.length,1);
        const go=(i,pref)=>{ if(i===cs.length){ const k=pref.join('|'); cont.set(k,(cont.get(k)||0)+w); return; } cs[i].forEach(x=>go(i+1,[...pref,x])); }; go(0,[]); });
      const cam=[...cont].sort((a,q)=>q[1]-a[1]).slice(0,3).map(([k,w])=>({ks:k.split('|').map(Number), w}));
      if(!cam.length) return 'Sem caminhos completos neste recorte.';
      const nomeC = c => c.ks.map((k,i)=>nm1(VARS[VI[etapas[i]]].values[k])).join(' → ');
      const a0=topCats(rows, etapas[0], 1)[0];
      let sai=''; if(a0){ const dest=new Map(); rows.filter(r=>r.v[VI[etapas[0]]].includes(a0.k)).forEach(r=>{ const ks=r.v[VI[etapas[1]]]; ks.forEach(k=>dest.set(k,(dest.get(k)||0)+1/ks.length)); });
        const d1=[...dest].sort((a,q)=>q[1]-a[1])[0]; if(d1) sai=` Da maior categoria da primeira etapa, ${nm1(a0.nome)}, a faixa mais grossa vai para ${nm1(VARS[VI[etapas[1]]].values[d1[0]])} (${pct(d1[1], a0.n)} das suas notícias).`; }
      return `Os caminhos mais frequentes são ${listaPt(cam.map(c=>`**${nomeC(c)}** (${nfmt1(c.w)} notícias)`))}.`+sai; }
    case 'typo': {
      const ia=VI[TYPO.a], ib=TYPO.b && TYPO.b!==TYPO.a? VI[TYPO.b] : null; const pais=topCats(rows, TYPO.a, 3); if(!pais.length) return '';
      let t=`O maior bloco é **${nm1(pais[0].nome)}** (${fmt(pais[0].n)} notícias, ${pct(pais[0].n,N)})`+(pais[1]? `, seguido de ${nm1(pais[1].nome)} (${pct(pais[1].n,N)})`:'')+'.';
      if(ib!=null){ pais.slice(0,2).forEach(p=>{ const sub=topCats(rows.filter(r=>r.v[ia].includes(p.k)), TYPO.b, 2); if(sub.length) t+=` Dentro de ${nm1(p.nome)}, predomina ${nm1(sub[0].nome)} (${pct(sub[0].n,p.n)} das notícias do bloco)`+(sub[1]? `, seguido de ${nm1(sub[1].nome)} (${pct(sub[1].n,p.n)})`:'')+'.'; }); }
      return t; }
    case 'net': {
      const iv=VI[NET.v], top=topCats(rows, NET.v, NET.n), ids=top.map(d=>d.k), em=new Set(ids), nome=new Map(top.map(d=>[d.k,d.nome]));
      const w=new Map(); rows.forEach(r=>{ const ks=[...new Set(r.v[iv])].filter(k=>em.has(k)).sort((a,c)=>a-c); for(let i=0;i<ks.length;i++) for(let j=i+1;j<ks.length;j++){ const k=ks[i]+'|'+ks[j]; w.set(k,(w.get(k)||0)+1); } });
      const links=[...w].filter(([,x])=>x>=NET.min).map(([k,x])=>{ const [a,c]=k.split('|').map(Number); return {source:a,target:c,w:x}; });
      if(!links.length) return 'Nenhuma ligação atinge o mínimo escolhido neste recorte.';
      const g=new Map(ids.map(i=>[i,0])); links.forEach(l=>{ g.set(l.source,g.get(l.source)+1); g.set(l.target,g.get(l.target)+1); });
      const lv=louvain(ids, links), com=new Map(); ids.filter(i=>g.get(i)).forEach(i=>{ const c=lv.comm.get(i); com.set(c,(com.get(c)||0)+1); });
      const cent=[...ids].sort((a,c)=>g.get(c)-g.get(a)).slice(0,3), forte=[...links].sort((a,c)=>c.w-a.w).slice(0,3), isol=ids.filter(i=>!g.get(i)).length;
      return `Entre as ${fmt(ids.length)} categorias da rede, ${fmt(links.length)} pares aparecem juntos em ${NET.min} ou mais notícias. Quem tem mais parceiros: ${listaPt(cent.map(k=>`**${nm1(nome.get(k))}** (${g.get(k)})`))}. As ligações mais fortes são ${listaPt(forte.map(l=>`${nm1(nome.get(l.source))} – ${nm1(nome.get(l.target))} (${l.w} notícias)`))}. A rede forma ${[...com.values()].filter(x=>x>=2).length} blocos (comunidades)${isol? `, e ${isol} ficam sem ligação` : ''}.`; }
    case 'time': {
      const iv=VI[SEM.v], v=VARS[iv], P=SEM_PICOS.picos||[];
      const tot=topCats(rows, SEM.v, 3);
      let t=`Ao longo do ano, predominam ${listaPt(tot.map(d=>`${nm1(d.nome)} (${pct(d.n,N)})`))}. `;
      if(!P.length) return t+'Não há semanas de pico neste recorte: a mobilização se distribui sem concentrações fora do comum.';
      const dom = p => { const fim=d3.timeDay.offset(p.d,7), c=new Map(); rows.forEach(r=>{ const d=dataDe(r); if(!d || d<p.d || d>=fim) return; r.v[iv].forEach(k=>{ if(!ehSemInfo(v.values[k])) c.set(k,(c.get(k)||0)+1); }); }); const m=[...c].sort((a,q)=>q[1]-a[1])[0]; return m? nm1(v.values[m[0]]) : '—'; };
      const evs = p => EVENTOS.filter(e=>e.d>=d3.timeDay.offset(p.d,-2) && e.d<d3.timeDay.offset(p.d,7)).map(e=>e.curto||e.nome);
      return t+`Há ${P.length} ${P.length===1? 'semana de pico' : 'semanas de pico'}: ${listaPt(P.slice(0,5).map(p=>{ const e=evs(p); return `a de ${p.d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})} (${fmt(Math.round(p.n))} notícias, puxada por ${dom(p)}${e.length? '; '+listaPt(e) : ''})`; }))}.`; }
    case 'map': {
      const cdef=ctxEscolha(mstate.ctx), unit=mstate.unit;
      if(mstate.mode==='multi'){ const cv=mstate.cmp, cats=topCats(rows, cv, mstate.n||6); const vidU=UNIT_VID[unit];
        return `Cada mapa mostra uma categoria de ${VARS[VI[cv]].label.toLowerCase()}. Onde cada uma mais aparece: ${listaPt(cats.map(c=>{ const t=topCats(rows.filter(r=>r.v[VI[cv]].includes(c.k)), vidU, 1)[0]; return `${nm1(c.nome)}: ${t? nm1(t.nome)+' ('+fmt(t.n)+')' : '—'}`; }))}.`; }
      if(cdef && cdef.nivel==='biv'){ const B=bivCalc(cdef, taxasDept(b)), c=B.cel;
        return `Dos departamentos, ${fmt(c[2][2])} combinam ${rotInd(cdef.indTitulo)} **alto** e **muitas** notícias por habitante (verde-escuro); ${fmt(c[2][0])} têm o indicador alto e **nenhuma** notícia (azul); ${fmt(c[0][2])} têm o indicador baixo e muitas notícias (amarelo); ${fmt(c[0][0])} têm os dois baixos (branco). `+(c[2][2]>c[0][2]? 'Há mais departamentos em que indicador alto e mobilização coincidem do que o contrário.' : 'A mobilização registrada aparece mais onde o indicador é baixo do que onde é alto.'); }
      if(cdef && cdef.nivel==='lisa'){ const L=ESP_CACHE.v; if(!L) return '';
        return `Há ${fmt(L.n.HH)} departamentos em pontos quentes (muitas notícias por habitante cercados de vizinhos também com muitas), ${fmt(L.n.LL)} em pontos frios e ${fmt(L.n.HL+L.n.LH)} casos isolados (alto cercado de baixos ou o contrário). O I de Moran global é ${nfmt2(L.I)} (p ≈ ${nfmt2(L.pI)}): ${L.pI<0.05 && L.I>0? 'as notícias por habitante formam manchas espaciais, e não pontos dispersos' : 'não há agrupamento espacial claro'}.`; }
      const vidU=UNIT_VID[unit], t=topCats(rows, vidU, 5).filter(d=>!/nacional|virtual/i.test(d.nome));
      let s=`Os lugares com mais notícias são ${listaPt(t.slice(0,4).map(d=>`${nm1(d.nome)} (${fmt(d.n)})`))}. `;
      if(unit!=='loc'){ const md=mapData(rows.filter(r=>match(r,vidU)), unit), D=destaques(md), al=D.feats.filter(d=>d.t==='alto').sort((a,q)=>q.razao-a.razao), ba=D.feats.filter(d=>d.t==='baixo');
        s+= al.length? `Em relação à população, ficam muito acima do esperado ${listaPt(al.slice(0,4).map(d=>`${nm1(d.nome)} (${nfmt1(d.razao)} vezes)`))}` : 'Nenhum lugar fica muito acima do esperado pela população';
        s+= ba.length? `; muito abaixo, ${listaPt(ba.slice(0,3).map(d=>nm1(d.nome)))}.` : '.'; }
      if(cdef && cdef.nivel==='prov'){ const prov=PROVS_FC.filter(f=>f.properties.pi>=0 && POP[f.properties.pi]), md=mapData(rows.filter(r=>match(r,'provincia')),'prov');
        const pts=prov.map(f=>({x:(CTX.provincias[f.properties.p]||{})[cdef.campo], y:md.rate(f.properties.pi)})).filter(p=>p.x!=null);
        if(pts.length>5){ const c=correlacoes(pts.map(p=>p.x), pts.map(p=>p.y)); s+=` Entre a camada de contexto e as notícias por habitante das províncias, a correlação de Spearman é ${nfmt2(c.rho)} (${forcaRho(c.rho)}${Math.abs(c.rho)>=0.41? ', significativa' : ', não significativa com 24 províncias'}).`; } }
      return s; }
    case 'sin': { const r=document.querySelectorAll('.sin-resumo li'); return `A síntese abaixo foi refeita para este recorte (${fmt(N)} notícias). Os três primeiros achados: ${[...r].slice(0,3).map(li=>li.innerText.replace(/\.$/,'')).join('; ')}.`; }
    case 'fic': { const v=VARS[VI[FIC.v]], nome=v.values[FIC.k]; if(FIC.k==null) return ''; const rr=base().filter(r=>r.v[VI[FIC.v]].includes(FIC.k));
      const tm=topCats(rr,'tipomov',2), mz=topCats(rr,'matriz',2), ob=topCats(rr,'objetivos',2), pv=topCats(rr,'provincia',3).filter(d=>!/nacional|virtual/i.test(d.nome));
      return `**${nm1(nome)}** aparece em ${fmt(rr.length)} notícias. `+(FIC.v!=='tipomov' && tm[0]? `Tipo de movimento mais associado: ${nm1(tm[0].nome)} (${pct(tm[0].n,rr.length)}). ` : '')+(mz[0]? `Repertório principal: ${nm1(mz[0].nome)} (${pct(mz[0].n,rr.length)}). ` : '')+(ob[0]? `Objetivo mais frequente: ${nm1(ob[0].nome)} (${pct(ob[0].n,rr.length)}). ` : '')+(pv.length && FIC.v!=='provincia' && FIC.v!=='localidad'? `Onde mais aparece: ${listaPt(pv.map(d=>nm1(d.nome)))}.` : ''); }
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
  const cab=el('div','pl-cab'); cab.append(el('span','pl-kicker','Leitura da combinação'), el('b',null,A.rotulo));
  const fecha=el('button','pl-fecha','×'); fecha.type='button'; fecha.title='Fechar a leitura'; fecha.setAttribute('aria-label','Fechar a leitura'); fecha.onclick=()=>{ delete PRONTO_ATIVO[id]; c.hidden=true; }; cab.append(fecha); c.append(cab);
  const mudou = assinatura(aba)!==A.sig;
  if(mudou){ const n=el('p','pl-aviso','Você mudou as escolhas depois de abrir esta combinação. O primeiro texto descreve a combinação original; a leitura dos dados descreve o que está na tela agora.'); c.append(n); }
  const bloco=(tit, txt)=>{ if(!txt) return; const d=el('div','pl-bloco'); d.append(el('h4',null,tit)); const p=el('p'); p.append(...sinPseguro(txt)); d.append(p); c.append(d); };
  bloco('O que esta combinação mostra', (LEIT[id]||{})[A.rotulo] || A.dica);
  const ft=filtersText(); bloco('O que os dados dizem', (ft && aba!=='sin' && aba!=='fic'? `_Recorte atual: ${ft} (use “Limpar filtros” para voltar à base inteira)._ ` : '') + dizDe(aba, base()));
  bloco('Como foi calculado', metodoDe(aba));
}
// clique em qualquer combinação pronta: registra e mostra a leitura depois do redesenho
document.querySelectorAll('.presets').forEach(box=>{ const id=box.id; if(!PRESET_ABA[id]) return;
  box.addEventListener('click', e=>{ const b=e.target.closest('button'); if(!b) return;
    box.querySelectorAll('button').forEach(x=>x.classList.toggle('ativo', x===b));
    setTimeout(()=>{ PRONTO_ATIVO[id]={rotulo:b.textContent, dica:b.title, sig:assinatura(PRESET_ABA[id])}; mostrarLeitura(id); }, 0); }); });
// a cada redesenho, atualiza a leitura da aba visível
const _renderSemLeitura = render;
render = function(){ _renderSemLeitura(); Object.keys(PRONTO_ATIVO).forEach(id=>{ if(PRESET_ABA[id]===TAB) mostrarLeitura(id); }); };
