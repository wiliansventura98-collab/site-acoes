"""Etapa 3: gera tudo o que o site e os usuários da base consomem.

Uso:
    python pipeline/construir_site.py            # lê dados/fonte/acoes_2024_fonte.csv

Saídas em dados/:
    base.json                      notícias e variáveis no formato compacto lido pela base interativa
    geo.json                       limites, coordenadas, população e relações espaciais usados pelos mapas
    acoes_2024.csv                 base tratada, uma linha por notícia (UTF-8, abre no Excel e no R)
    dicionario.md                  dicionário de variáveis com as categorias mais frequentes
    relatorio_geocodificacao.csv   como cada localidade foi posicionada
    camadas/acoes_2024.gpkg        camadas para QGIS/ArcGIS (requer geopandas)
"""
from __future__ import annotations

import argparse
import collections
import functools
import csv
import json
import os
import sys

import pandas as pd

from comum import DADOS, FONTE, REFERENCIAS, VARIAVEIS, CABA
from geocodificar import geocodificar
from preparar_dados import preparar


def _json(obj, caminho):
    caminho.write_text(json.dumps(obj, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


CONTEXTO = REFERENCIAS / "contexto"


def _ler_csv(nome):
    with open(CONTEXTO / nome, encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


def _num(v):
    try:
        return int(v) if str(v).lstrip("-").isdigit() else float(v)
    except (TypeError, ValueError):
        return None


def _populacao():
    return {r["provincia"]: int(r["populacao_2022"]) for r in _ler_csv("populacao_provincias_2022.csv")}


@functools.lru_cache(maxsize=1)
def contexto():
    """Indicadores oficiais por província, região e aglomerado (ver referencias/contexto/FONTES.md)."""
    prov = {}
    for r in _ler_csv("populacao_provincias_2022.csv"):
        prov[r["provincia"]] = {k: _num(v) for k, v in r.items() if k != "provincia"}
    for r in _ler_csv("homicidios_provincias_snic.csv"):
        prov.setdefault(r["provincia"], {}).update({k: _num(v) for k, v in r.items() if k != "provincia"})
    reg = {r["regiao"]: {k: _num(v) for k, v in r.items() if k != "regiao"} for r in _ler_csv("eph_regioes_2024.csv")}
    agl = [{k: (v if k in ("aglomerado", "provincia", "regiao") else _num(v)) for k, v in r.items()} for r in _ler_csv("eph_aglomerados_2024.csv")]
    indec = indec_geoportal(prov.keys())
    for p, vals in indec["provincias"].items():
        prov.setdefault(p, {}).update({"i_" + k: v for k, v in vals.items()})
    extra, defs = lutas_provincias()
    for p, vals in extra.items():
        if p not in prov:
            print("Província sem correspondência:", p)
        prov.setdefault(p, {}).update(vals)
    return {"provincias": prov, "regioes": reg, "aglomerados": agl, "indec": indec, "lutas_prov": defs}


# Indicadores do Censo 2022 obtidos no Geoportal estadístico do INDEC (API datosestadisticos.indec.gob.ar).
# chave: (rótulo, unidade curta, tema, casas decimais, sentido)  sentido +1: valores altos = mais carência
INDEC_INDICADORES = {
    "ipmh":      ("Domicílios com privação material (IPMH, incidência)", "% dos domicílios", "Desigualdade e privação", 1, 1),
    "ipmhConv":  ("Domicílios com privação convergente (corrente e patrimonial)", "% dos domicílios", "Desigualdade e privação", 1, 1),
    "ipmhCorr":  ("Domicílios só com privação de recursos correntes", "% dos domicílios", "Desigualdade e privação", 1, 1),
    "ipmhPatr":  ("Domicílios só com privação patrimonial", "% dos domicílios", "Desigualdade e privação", 1, 1),
    "agua":      ("Domicílios com água de rede pública", "% dos domicílios", "Moradia e serviços", 1, -1),
    "cloaca":    ("Domicílios com esgoto ligado à rede pública", "% dos domicílios", "Moradia e serviços", 1, -1),
    "gas":       ("Domicílios que cozinham com gás de rede ou eletricidade", "% dos domicílios", "Moradia e serviços", 1, -1),
    "pisos":     ("Domicílios com piso revestido", "% dos domicílios", "Moradia e serviços", 1, -1),
    "alquila":   ("Domicílios em moradia alugada", "% dos domicílios", "Moradia e serviços", 1, 0),
    "internet":  ("Domicílios com internet", "% dos domicílios", "Conectividade", 1, -1),
    "compu":     ("Domicílios com computador ou tablet", "% dos domicílios", "Conectividade", 1, -1),
    "secund":    ("Pessoas de 25 anos ou mais com secundário completo", "% (25 anos e +)", "Educação", 1, -1),
    "asist1517": ("Frequência escolar de 15 a 17 anos", "% (15 a 17 anos)", "Educação", 1, -1),
    "nini":      ("Jovens de 14 a 24 anos que não estudam nem trabalham", "% (14 a 24 anos)", "Educação", 1, 1),
    "desocup":   ("Taxa de desocupação (desocupados ÷ população ativa)", "% da pop. ativa", "Trabalho e proteção", 1, 1),
    "inact":     ("População de 14 anos ou mais inativa", "% (14 anos e +)", "Trabalho e proteção", 1, 0),
    "salud":     ("Pessoas de 18 a 64 anos com plano ou cobertura de saúde", "% (18 a 64 anos)", "Trabalho e proteção", 1, -1),
    "jubM":      ("Mulheres de 60 anos ou mais com aposentadoria ou pensão", "% (60 anos e +)", "Trabalho e proteção", 1, -1),
    "dens":      ("Densidade demográfica", "hab./km²", "População", 1, 0),
    "crec":      ("Crescimento anual médio da população, 2010-2022", "por mil hab.", "População", 1, 0),
    "fem":       ("Índice de feminidade", "mulheres por 100 homens", "População", 0, 0),
    "env":       ("Índice de envelhecimento", "65+ por 100 de 0 a 14", "População", 0, 0),
    "dep":       ("Índice de dependência potencial", "inativos por 100 ativos", "População", 0, 0),
    "hijos":     ("Média de filhos por mulher de 14 a 49 anos", "filhos", "População", 2, 0),
    "indig":     ("População indígena ou descendente de povos indígenas", "% da população", "Diversidade e migração", 1, 0),
    "afro":      ("População afrodescendente", "% da população", "Diversidade e migração", 1, 0),
    "extr":      ("Nascidos em outro país", "% da população", "Diversidade e migração", 1, 0),
    "otraProv":  ("Nascidos em outra província", "% da população", "Diversidade e migração", 1, 0),
}
# Indicadores com pouca ligação direta com as lutas: ficam disponíveis, mas num grupo à parte ("controles demográficos")
CONTROLES = {"pisos", "internet", "compu", "inact", "dens", "crec", "fem", "env", "dep", "hijos", "afro", "extr", "otraProv"}
TEMA_NOVO = {"indig": "Povos originários"}

# Departamentos com nomes diferentes nas duas bases; Tolhuin (2017) e Lezama (2009) não existem na camada de limites usada
ALIAS_INDEC = {"38021": "doctor manuel belgrano|jujuy", "46028": "coronel felipe varela|la rioja",
               "46056": "general angel v penaloza|la rioja", "46070": "general juan f quiroga|la rioja",
               "46084": "general ocampo|la rioja", "86098": "juan f ibarra|santiago del estero"}


def indec_geoportal(nomes_provincia):
    """Lê referencias/contexto/indec_geoportal_2022.json e devolve valores por departamento (id da camada de limites)
    e por província (nome usado no site), mais as definições oficiais de cada indicador."""
    from comum import chave, chave_provincia
    arq = CONTEXTO / "indec_geoportal_2022.json"
    if not arq.exists():
        return {"indicadores": [], "departamentos": {}, "provincias": {}}
    bruto = json.loads(arq.read_text(encoding="utf-8"))
    prov_cod = {c: chave_provincia(n) for c, n in bruto["provincias"]["nomes"].items()}
    nome_site = {chave_provincia(n): n for n in nomes_provincia}
    nome_site.setdefault("ciudad autonoma de buenos aires", next((n for n in nomes_provincia if n.startswith("CABA")), "CABA"))
    ids = {r["id"] for r in csv.DictReader(open(REFERENCIAS / "departamentos.csv", encoding="utf-8"))}

    def valores(v):
        out = {k: v.get(k) for k in INDEC_INDICADORES if k in v}
        o, d = v.get("ocup"), v.get("desoc")
        out["desocup"] = round(d / (o + d) * 100, 1) if o and d is not None else None
        out["pop"] = v.get("pob"); out["viv"] = v.get("viv")
        return {k: (round(x, 2) if isinstance(x, float) else x) for k, x in out.items() if x is not None}

    provs = {nome_site.get(prov_cod[c], prov_cod[c]): valores(v) for c, v in bruto["provincias"]["valores"].items()}
    deps, sem_par = {}, []
    for c, v in bruto["departamentos"]["valores"].items():
        if c.startswith("02"):
            continue  # comunas da CABA: a camada de limites tem a cidade inteira (valores da jurisdição)
        k = ALIAS_INDEC.get(c) or chave(bruto["departamentos"]["nomes"][c]) + "|" + prov_cod[c[:2]]
        if k in ids:
            deps[k] = valores(v)
        else:
            sem_par.append(f"{c} {bruto['departamentos']['nomes'][c]}")
    caba = next((k for k in ids if k.startswith("CABA|")), None)
    if caba:
        deps[caba] = provs[nome_site["ciudad autonoma de buenos aires"]]
    if sem_par:
        print("INDEC sem polígono correspondente:", "; ".join(sem_par))
    meta = bruto["meta"]
    inds = []
    for k, (rot, un, tema, dec, sentido) in INDEC_INDICADORES.items():
        m = meta.get("ocup" if k == "desocup" else k, {})
        dm = m.get("dep", {})
        inds.append({"k": k, "titulo": rot, "unidade": un, "tema": TEMA_NOVO.get(k, tema), "dec": dec, "sentido": sentido,
                     "indec": dm.get("titulo"), "definicao": (dm.get("definicao") or "").strip()[:600],
                     "ids": [m.get("dep_id"), m.get("prov_id")], "ano": 2022,
                     "grupo": "controle" if k in CONTROLES else "lutas",
                     "fonte": f"INDEC, Censo Nacional de Población, Hogares y Viviendas 2022, via Geoportal estadístico (indicador {m.get('dep_id')}: “{dm.get('titulo')}”)"})
    lutas_departamentos(ids, deps, provs, nome_site, inds)
    return {"indicadores": inds, "departamentos": deps, "provincias": provs,
            "fonte": "INDEC, Censo Nacional de Población, Hogares y Viviendas 2022, via Geoportal estadístico (portalgeoestadistico.indec.gob.ar)"}


# Nomes de departamento que diferem entre as fontes e a camada de limites (chave normalizada → chave da camada).
# Tolhuin (desmembrado de Río Grande em 2017) e Lezama (de Chascomús em 2009) somam-se ao departamento de origem.
ALIAS_DEP = {"jose m ezeiza": "ezeiza", "dr manuel belgrano": "doctor manuel belgrano", "juan b alberdi": "juan bautista alberdi",
             "coronel de marina l rosales": "coronel de marina leonardo rosales", "1o de mayo": "1 de mayo",
             "angel vicente penaloza": "general angel v penaloza", "general juan facundo quiroga": "general juan f quiroga",
             "general ortiz de ocampo": "general ocampo", "tolhuin": "rio grande", "lezama": "chascomus"}

# Indicadores ligados às lutas que não vêm do Censo (ver referencias/contexto/FONTES.md)
LUTAS_DEP = {
    "bp_fam": ("Famílias em bairros populares (RENABAP)", "por 1.000 hab.", "Bairros populares e economia popular", 1, 1, 2023,
               "Registro Nacional de Barrios Populares (RENABAP), Subsecretaría de Integración Socio Urbana, versão de 05/12/2023 (datos.gob.ar); população: INDEC, Censo 2022",
               "Famílias que vivem em bairros populares (assentamentos e vilas com pelo menos 8 famílias, sem título de propriedade e sem acesso regular a dois ou mais serviços básicos) por 1.000 habitantes."),
    "bp_n":   ("Bairros populares (RENABAP)", "por 100 mil hab.", "Bairros populares e economia popular", 1, 1, 2023,
               "Registro Nacional de Barrios Populares (RENABAP), versão de 05/12/2023; população: INDEC, Censo 2022",
               "Número de bairros populares registrados por 100 mil habitantes."),
    "v_lla":  ("Voto em La Libertad Avanza (Milei), 1º turno 2023", "% dos votos positivos", "Política: eleições presidenciais de 2023", 1, 0, 2023,
               "Dirección Nacional Electoral, resultados provisórios das eleições gerais de 22/10/2023, categoria Presidente (argentina.gob.ar/dine)",
               "Votos em La Libertad Avanza (Javier Milei) sobre os votos positivos para presidente no primeiro turno."),
    "v_uxp":  ("Voto em Unión por la Patria (Massa), 1º turno 2023", "% dos votos positivos", "Política: eleições presidenciais de 2023", 1, 0, 2023,
               "Dirección Nacional Electoral, resultados provisórios das eleições gerais de 22/10/2023, categoria Presidente",
               "Votos em Unión por la Patria (Sergio Massa) sobre os votos positivos para presidente no primeiro turno."),
    "v_jxc":  ("Voto em Juntos por el Cambio (Bullrich), 1º turno 2023", "% dos votos positivos", "Política: eleições presidenciais de 2023", 1, 0, 2023,
               "Dirección Nacional Electoral, resultados provisórios das eleições gerais de 22/10/2023, categoria Presidente",
               "Votos em Juntos por el Cambio (Patricia Bullrich) sobre os votos positivos para presidente no primeiro turno."),
    "v_fit":  ("Voto na Frente de Izquierda (Bregman), 1º turno 2023", "% dos votos positivos", "Política: eleições presidenciais de 2023", 2, 0, 2023,
               "Dirección Nacional Electoral, resultados provisórios das eleições gerais de 22/10/2023, categoria Presidente",
               "Votos na Frente de Izquierda y de Trabajadores – Unidad (Myriam Bregman) sobre os votos positivos para presidente no primeiro turno."),
}
LUTAS_PROV = [  # só por província: campo, título, unidade, tema, casas, ano, fonte, definição
    ("renatep_pct", "Inscritos no RENATEP (economia popular)", "% da pop. de 18 a 65 anos", "Bairros populares e economia popular", 1, 2023,
     "Registro Nacional de Trabajadores y Trabajadoras de la Economía Popular (ReNaTEP), informe “Juventudes y Economía Popular en el ReNaTEP”, dados de 04/04/2023, cuadro 2",
     "Trabalhadoras e trabalhadores da economia popular inscritos no registro nacional, em relação à população de 18 a 65 anos."),
    ("femicidios_taxa_2024", "Femicídios", "por 100 mil mulheres", "Violência de gênero", 2, 2024,
     "Corte Suprema de Justicia de la Nación, Oficina de la Mujer, Registro Nacional de Femicidios de la Justicia Argentina 2024, tabela 6",
     "Vítimas diretas de femicídio (inclui travesticídios/transfemicídios) por 100 mil mulheres, por jurisdição de ocorrência."),
]


def lutas_departamentos(ids, deps, provs, nome_site, inds):
    """Acrescenta aos indicadores do Censo os bairros populares (RENABAP) e o voto de 2023, por departamento e por província."""
    from comum import chave, chave_provincia
    pop_prov = _populacao()
    k_caba = next((k for k in ids if k.startswith("CABA|")), None)

    def id_dep(prov, dep):
        p = chave_provincia(prov)
        if p.startswith("ciudad autonoma") or p == "caba":
            return k_caba
        d = chave(dep); d = ALIAS_DEP.get(d, d)
        return f"{d}|{p}" if f"{d}|{p}" in ids else None

    def nome_prov(prov):
        p = chave_provincia(prov)
        return nome_site.get(p) or (nome_site.get("ciudad autonoma de buenos aires") if p in ("caba", "ciudad autonoma de buenos aires") else None)

    soma_d, soma_p, sem = collections.defaultdict(collections.Counter), collections.defaultdict(collections.Counter), []
    arq = CONTEXTO / "renabap_departamentos_2023.csv"
    if arq.exists():
        for r in _ler_csv(arq.name):
            c = collections.Counter(bp_n=int(r["barrios_populares"]), bp_f=int(r["familias_aprox"]))
            k = id_dep(r["provincia"], r["departamento"])
            if k: soma_d[k].update(c)
            else: sem.append("RENABAP " + r["departamento"])
            if nome_prov(r["provincia"]): soma_p[nome_prov(r["provincia"])].update(c)
    arq = CONTEXTO / "eleicoes_2023_generales_departamentos.csv"
    if arq.exists():
        for r in _ler_csv(arq.name):
            c = collections.Counter(pos=int(r["votos_positivos"]), lla=int(r["la_libertad_avanza"]), uxp=int(r["union_por_la_patria"]),
                                    jxc=int(r["juntos_por_el_cambio"]), fit=int(r["frente_de_izquierda"]))
            k = id_dep(r["distrito"], r["seccion"])
            if k: soma_d[k].update(c)
            elif "antartida" not in chave(r["seccion"]): sem.append("Eleições " + r["seccion"])
            if nome_prov(r["distrito"]): soma_p[nome_prov(r["distrito"])].update(c)
    if sem:
        print("Lutas sem polígono correspondente:", "; ".join(sem))

    def valores(c, pop):
        out = {}
        if pop:
            out["bp_fam"] = round(c["bp_f"] / pop * 1000, 1)
            out["bp_n"] = round(c["bp_n"] / pop * 1e5, 1)
        if c["pos"]:
            for k in ("lla", "uxp", "jxc", "fit"):
                out["v_" + k] = round(c[k] / c["pos"] * 100, 2)
        return out
    for k, v in deps.items():
        v.update(valores(soma_d.get(k, collections.Counter()), v.get("pop")))
    for nome, v in provs.items():
        v.update(valores(soma_p.get(nome, collections.Counter()), pop_prov.get(nome) or v.get("pop")))
    for k, (rot, un, tema, dec, sentido, ano, fonte, definicao) in LUTAS_DEP.items():
        inds.append({"k": k, "titulo": rot, "unidade": un, "tema": tema, "dec": dec, "sentido": sentido, "indec": None,
                     "definicao": definicao, "ids": [None, None], "ano": ano, "grupo": "lutas", "fonte": fonte})


def lutas_provincias():
    """RENATEP e femicídios: só existem por província."""
    out = {}
    arq = CONTEXTO / "renatep_provincias_2023.csv"
    if arq.exists():
        for r in _ler_csv(arq.name):
            out.setdefault(r["provincia"], {})["renatep_pct"] = round(int(r["inscritos_renatep"]) / int(r["pop_18_65"]) * 100, 1)
    arq = CONTEXTO / "femicidios_provincias_2024.csv"
    if arq.exists():
        for r in _ler_csv(arq.name):
            out.setdefault(r["provincia"], {})["femicidios_taxa_2024"] = float(r["taxa_por_100mil_mulheres"])
    defs = [{"campo": c, "titulo": t, "unidade": u, "tema": te, "dec": d, "ano": a, "fonte": f, "definicao": df}
            for c, t, u, te, d, a, f, df in LUTAS_PROV]
    return out, defs


def _toponimos():
    """Cidades com população (GeoNames, via all-the-cities) para os nomes que aparecem conforme o zoom dos mapas.
    Formato compacto: [nome, lon, lat, população, tipo] com tipo C = capital nacional, A = capital provincial, D = demais."""
    arq = REFERENCIAS / "toponimos_ar.csv"
    if not arq.exists():
        return []
    with open(arq, encoding="utf-8") as fh:
        return [[r["nome"], round(float(r["lon"]), 4), round(float(r["lat"]), 4), int(r["populacao"]),
                 "C" if r["tipo_geonames"] == "PPLC" else "A" if r["tipo_geonames"] == "PPLA" else "D"] for r in csv.DictReader(fh)]


def _eventos():
    """Acontecimentos de 2024 marcados na linha do tempo (referencias/acontecimentos_2024.csv)."""
    arq = REFERENCIAS / "acontecimentos_2024.csv"
    if not arq.exists():
        return []
    with open(arq, encoding="utf-8") as fh:
        return [{"data": r["data"], "nome": r["acontecimento"], "curto": r.get("rotulo") or r["acontecimento"], "tipo": r["tipo"], "fonte": r["fonte"]} for r in csv.DictReader(fh)]


def escrever_csv(res, caminho):
    cab = ["codigo", "titulo", "data_noticia", "data_inicial", "data_final", "link", "status"] + [v[0] for v in VARIAVEIS]
    with open(caminho, "w", newline="", encoding="utf-8-sig") as fh:
        w = csv.writer(fh)
        w.writerow(cab)
        for r in res.registros:
            w.writerow([r["codigo"], r["titulo"], r["data"], r["inicio"], r["fim"], r["link"], r["status"]]
                       + ["; ".join(r["v"][vid]) for vid, *_ in VARIAVEIS])


def escrever_dicionario(res, caminho, ano):
    unicas = [r for r in res.registros if r["status"] != "Repetida"]
    linhas = [f"# Dicionário de variáveis · base {ano}", "",
              f"Contagens sobre {len(unicas)} notícias únicas (sem as {len(res.registros) - len(unicas)} marcadas como repetidas).",
              "Variáveis com vários valores por notícia aparecem separadas por `; ` no arquivo `acoes_{ano}.csv`.".replace("{ano}", str(ano)),
              "", "## Campos de identificação", "",
              "| Campo | Descrição |", "|---|---|",
              "| `codigo` | Código do documento (PDF) da notícia |", "| `titulo` | Título da notícia |",
              "| `data_noticia` | Data de publicação (dd/mm/aaaa) |", "| `data_inicial`, `data_final` | Período da ação |",
              "| `link` | Endereço da notícia original |", "| `status` | `Correta` ou `Repetida` (mesma ação noticiada mais de uma vez) |",
              "", "## Variáveis analíticas", ""]
    for vid, rot, grp, _, desc in VARIAVEIS:
        cont = collections.Counter(x for r in unicas for x in r["v"][vid])
        multi = any(len(r["v"][vid]) > 1 for r in unicas)
        linhas += [f"### `{vid}` · {rot}", "", f"{desc}", "",
                   f"Grupo: {grp} · categorias: {len(cont)} · {'pode ter vários valores por notícia' if multi else 'um valor por notícia'}", "",
                   "| Categoria mais frequente | Notícias |", "|---|---:|"]
        linhas += [f"| {k.replace('|', '/')} | {n} |" for k, n in cont.most_common(8)]
        linhas.append("")
    caminho.write_text("\n".join(linhas), encoding="utf-8")


def escrever_contexto_csv(res, caminho):
    """Indicadores do Censo 2022 por departamento ao lado das notícias, para análise em planilha, R ou QGIS."""
    ctx = contexto()["indec"]
    unicas = [r for r in res.registros if r["status"] != "Repetida"]
    conta = collections.Counter(x for r in unicas for x in r["v"]["departamento"])
    topo = json.loads((REFERENCIAS / "limites" / "departamentos.topo.json").read_text(encoding="utf-8"))
    obj = next(iter(topo["objects"].values()))
    cols = ["pop", "viv", *INDEC_INDICADORES, *LUTAS_DEP]
    with open(caminho, "w", newline="", encoding="utf-8-sig") as fh:
        w = csv.writer(fh)
        w.writerow(["id", "departamento", "provincia", "regiao", "noticias", "noticias_100mil_hab"] + cols)
        for g in sorted(obj["geometries"], key=lambda g: (g["properties"]["p"], g["properties"]["n"])):
            gid, p = g["id"], g["properties"]; rot = res.rotulos_departamento.get(gid, p["n"]); v = ctx["departamentos"].get(gid, {})
            n = conta.get(rot, 0)
            w.writerow([gid, rot, p["p"], p["r"], n, round(n / v["pop"] * 1e5, 2) if v.get("pop") else ""] + [v.get(k, "") for k in cols])


def _topo_para_geometrias(topo):
    """Decodifica TopoJSON quantizado em geometrias shapely (sem dependências extras)."""
    from shapely.geometry import MultiPolygon, Polygon
    sx, sy = topo["transform"]["scale"]; tx, ty = topo["transform"]["translate"]
    arcos = []
    for arc in topo["arcs"]:
        x = y = 0; pts = []
        for dx, dy in arc:
            x += dx; y += dy; pts.append((x * sx + tx, y * sy + ty))
        arcos.append(pts)

    def anel(idx):
        pts = []
        for i in idx:
            a = arcos[i] if i >= 0 else arcos[~i][::-1]
            pts.extend(a if not pts else a[1:])
        return pts

    obj = next(iter(topo["objects"].values()))
    for g in obj["geometries"]:
        if g["type"] == "Polygon":
            polys = [g["arcs"]]
        elif g["type"] == "MultiPolygon":
            polys = g["arcs"]
        else:
            continue
        geom = MultiPolygon([Polygon(anel(p[0]), [anel(h) for h in p[1:]]) for p in polys]).buffer(0)
        yield g.get("id"), g.get("properties", {}), geom


def escrever_camadas(res, coords, relatorio, caminho):
    # Data fixa nos metadados do GeoPackage: o arquivo só muda quando os dados mudam
    os.environ.setdefault("OGR_CURRENT_DATE", "2024-12-31T00:00:00.000Z")
    try:
        import geopandas as gpd
        from shapely.geometry import Point
        from shapely.ops import unary_union
    except ImportError:
        print("geopandas não instalado: camadas GeoPackage não geradas.")
        return
    unicas = [r for r in res.registros if r["status"] != "Repetida"]
    conta = {vid: collections.Counter(x for r in unicas for x in r["v"][vid]) for vid in ("localidad", "departamento", "provincia", "region")}
    pop = _populacao()
    metodo = {r["localidade"]: r["metodo"] for r in relatorio}
    caminho.parent.mkdir(parents=True, exist_ok=True)
    if caminho.exists():
        caminho.unlink()

    loc = [{"localidade": k, "departamento": (res.locinfo.get(k) or [None])[0], "provincia": (res.locinfo.get(k) or [None, None])[1],
            "regiao": (res.locinfo.get(k) or [None, None, None])[2], "metodo_localizacao": metodo.get(k), "noticias": conta["localidad"][k],
            "geometry": Point(*coords[k])} for k in coords]
    gpd.GeoDataFrame(loc, crs="EPSG:4326").to_file(caminho, layer="localidades", driver="GPKG")

    topo = json.loads((REFERENCIAS / "limites" / "departamentos.topo.json").read_text(encoding="utf-8"))
    ctx = contexto()
    ind_dep = ctx["indec"]["departamentos"]
    deps = []
    for gid, props, geom in _topo_para_geometrias(topo):
        rot = res.rotulos_departamento.get(gid, props.get("n"))
        v = ind_dep.get(gid, {})
        n = conta["departamento"].get(rot, 0)
        deps.append({"id": gid, "departamento": rot, "provincia": props.get("p"), "regiao": props.get("r"),
                     "noticias": n, "noticias_100mil_hab": round(n / v["pop"] * 1e5, 2) if v.get("pop") else None,
                     **{"censo_" + k: v.get(k) for k in ["pop", "viv", *INDEC_INDICADORES]}, "geometry": geom})
    gdep = gpd.GeoDataFrame(deps, crs="EPSG:4326")
    gdep.to_file(caminho, layer="departamentos", driver="GPKG")

    provs = []
    for p, grupo in gdep.groupby("provincia"):
        n = conta["provincia"].get(p, 0); habitantes = pop.get(p); c = ctx["provincias"].get(p, {})
        provs.append({"provincia": p, "populacao_2022": habitantes, "area_km2": c.get("area_km2"),
                      "densidade_hab_km2": c.get("densidade_hab_km2"), "noticias": n,
                      "noticias_100mil_hab": round(n / habitantes * 1e5, 2) if habitantes else None,
                      "taxa_homicidios_2023": c.get("taxa_homicidios_2023"), "taxa_homicidios_2024": c.get("taxa_homicidios_2024"),
                      **{"censo_" + k: c.get("i_" + k) for k in INDEC_INDICADORES},
                      "geometry": unary_union(list(grupo.geometry)).buffer(0)})
    gpd.GeoDataFrame(provs, crs="EPSG:4326").to_file(caminho, layer="provincias", driver="GPKG")

    regs = [{"regiao": r, "noticias": conta["region"].get(r, 0), **ctx["regioes"].get(r, {}),
             "geometry": unary_union(list(g.geometry)).buffer(0)} for r, g in gdep.groupby("regiao")]
    gpd.GeoDataFrame(regs, crs="EPSG:4326").to_file(caminho, layer="regioes", driver="GPKG")
    agl = [{**{k: v for k, v in a.items() if k not in ("lon", "lat")}, "geometry": Point(a["lon"], a["lat"])} for a in ctx["aglomerados"]]
    gpd.GeoDataFrame(agl, crs="EPSG:4326").to_file(caminho, layer="aglomerados_eph", driver="GPKG")

    pontos = []
    for r in unicas:
        for k in r["v"]["localidad"]:
            if k in coords:
                pontos.append({"codigo": r["codigo"], "titulo": r["titulo"], "data_noticia": r["data"], "data_inicial": r["inicio"],
                               "link": r["link"], "localidade": k, "provincia": (res.locinfo.get(k) or [None, None])[1],
                               "regiao": (res.locinfo.get(k) or [None, None, None])[2],
                               **{vid: "; ".join(r["v"][vid]) for vid in ("escala", "direccion", "matriz", "derivada", "objetivos",
                                                                         "tipomov", "nombremov", "tipoinst", "fuente")},
                               "geometry": Point(*coords[k])})
    gpd.GeoDataFrame(pontos, crs="EPSG:4326").to_file(caminho, layer="noticias_por_localidade", driver="GPKG")
    print(f"Camadas: {len(loc)} localidades, {len(deps)} departamentos, {len(provs)} províncias, {len(regs)} regiões, "
          f"{len(pontos)} pontos notícia×localidade")


# Texto curto das faixas da marcha desenhada na abertura: os objetivos mais frequentes da base
LEMA_CURTO = {"objetivos laborales": "Trabajo", "objetivos por la reproduccion social": "Reproducción social",
              "objetivos politicos": "Política", "objetivos en torno a derechos humanos": "Derechos humanos",
              "objetivos educativos": "Educación", "objetivos por la igualdad de genero": "Igualdad de género",
              "objetivos por la vivienda y habitat": "Vivienda y hábitat", "objetivos sanitarios": "Salud",
              "objetivos socioambientales": "Ambiente", "objetivos lgttbiq": "Diversidad", "objetivos de reconocimiento": "Reconocimiento"}


def lemas(regs, n=9):
    from comum import chave
    cont = collections.Counter(x for r in regs for x in r["v"]["objetivos"])
    out = []
    for k, c in cont.most_common():
        curto = LEMA_CURTO.get(chave(k))
        if curto:
            out.append([curto, c])
    return out[:n]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--ano", type=int, default=2024)
    ap.add_argument("--sem-camadas", action="store_true", help="não gera o GeoPackage")
    a = ap.parse_args()

    fonte = FONTE / f"acoes_{a.ano}_fonte.csv"
    if not fonte.exists():
        sys.exit(f"Arquivo de entrada não encontrado: {fonte}. Gere-o com pipeline/anonimizar.py.")
    df = pd.read_csv(fonte, dtype=str, keep_default_na=False)
    res = preparar(df)
    coords, relatorio = geocodificar(res.locmeta)
    coords = {k: v for k, v in coords.items() if k in res.locinfo or k == CABA}

    DADOS.mkdir(exist_ok=True)
    _json({"vars": res.variaveis, "rows": res.linhas}, DADOS / "base.json")
    limites = REFERENCIAS / "limites"
    _json({"deptos": json.loads((limites / "departamentos.topo.json").read_text(encoding="utf-8")),
           "neigh": json.loads((limites / "paises_vizinhos.topo.json").read_text(encoding="utf-8")),
           "coords": coords, "pop": _populacao(), "locinfo": res.locinfo, "deptLabels": res.rotulos_departamento,
           "contexto": contexto(), "eventos": _eventos(), "toponimos": _toponimos()},
          DADOS / "geo.json")
    escrever_csv(res, DADOS / f"acoes_{a.ano}.csv")
    escrever_contexto_csv(res, DADOS / "contexto_censo2022_departamentos.csv")
    escrever_dicionario(res, DADOS / "dicionario.md", a.ano)
    with open(DADOS / "relatorio_geocodificacao.csv", "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=["localidade", "metodo", "lon", "lat"]); w.writeheader(); w.writerows(relatorio)
    if not a.sem_camadas:
        escrever_camadas(res, coords, relatorio, DADOS / "camadas" / f"acoes_{a.ano}.gpkg")

    unicas = sum(1 for r in res.linhas if not r[6])
    # Resumo para a página inicial
    regs_unicos = [r for r in res.registros if r["status"] != "Repetida"]
    pop = _populacao()
    distintos = lambda vid, ok=lambda s: True: len({x for r in regs_unicos for x in r["v"][vid] if ok(x)})
    sem_info = lambda s: not any(t in s.lower() for t in ("no informa", "nacional", "virtual"))
    _json({"noticias": len(res.linhas), "unicas": unicas, "variaveis": len(res.variaveis),
           "movimentos": distintos("nombremov", sem_info), "localidades": distintos("localidad", sem_info),
           "provincias": distintos("provincia", lambda s: s in pop), "fontes": distintos("fuente", sem_info),
           "aglomerados_contexto": len(contexto()["aglomerados"]) - 1, "lemas": lemas(regs_unicos)}, DADOS / "resumo.json")
    metodos = collections.Counter(r["metodo"] for r in relatorio)
    print(f"{len(res.linhas)} notícias ({unicas} únicas), {len(res.variaveis)} variáveis; localidades: {dict(metodos)}")
    for aviso in res.avisos:
        print("AVISO:", aviso)


if __name__ == "__main__":
    main()
