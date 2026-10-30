"""Etapa 1: transforma a planilha publicável em registros padronizados.

- separa campos com vários valores (";" ou quebra de linha);
- unifica grafias equivalentes (maiúsculas, acentos, siglas de movimentos, nomes dos ODS, veículos);
- divide a tipologia da ação em nível matriz e derivado;
- lê a referência espacial ("localidade;departamento;província;código") e deriva província,
  departamento/partido, localidade e região do INDEC.
"""
from __future__ import annotations

import collections
import csv
import re
from dataclasses import dataclass, field

import pandas as pd

from comum import (CABA, MESES, NI, REFERENCIAS, VARIAVEIS, ALIAS_DEPARTAMENTO, REGIAO_DA_PROVINCIA, chave,
                   chave_provincia, limpar, nao_informado, partes, regiao_de)

ODS = {1: "Fin de la pobreza", 2: "Hambre cero", 3: "Salud y bienestar", 4: "Educación de calidad", 5: "Igualdad de género",
       6: "Agua limpia y saneamiento", 7: "Energía asequible y no contaminante", 8: "Trabajo decente y crecimiento económico",
       9: "Industria, innovación e infraestructura", 10: "Reducción de las desigualdades", 11: "Ciudades y comunidades sostenibles",
       12: "Producción y consumo responsables", 13: "Acción por el clima", 14: "Vida submarina", 15: "Vida de ecosistemas terrestres",
       16: "Paz, justicia e instituciones sólidas", 17: "Alianzas para lograr los objetivos"}
ODS_ROTULO = {n: f"ODS {n} · {t}" for n, t in ODS.items()}
ODS_SINONIMOS = {"paz justicia e instituciones efectivas": 16, "reduccion de desigualdades": 10,
                 "hambre cero y agricultura sostenible": 2, "comunidad y ciudades sostenibles": 11,
                 "accion contra el cambio climatico global": 13, "energia limpia y asequible": 7,
                 "erradicacion de la pobreza": 1}


@dataclass
class Resultado:
    variaveis: list            # [{id, label, group, ordered, values}]
    linhas: list               # [codigo, titulo, data, ini, fim, link, repetida(0/1), [[índices por variável]]]
    registros: list            # registros legíveis (para CSV e camadas)
    locmeta: dict              # rótulo da localidade -> (localidade, departamento, província) como na planilha
    rotulos_departamento: dict # id do departamento -> rótulo exibido
    locinfo: dict              # rótulo da localidade -> [rótulo do departamento, província, região]
    avisos: list = field(default_factory=list)


def _carregar_departamentos():
    with open(REFERENCIAS / "departamentos.csv", encoding="utf-8") as fh:
        return {(r["chave_departamento"], r["chave_provincia"]): r for r in csv.DictReader(fh)}


def _titulo(nome: str) -> str:
    pequenas = {"de", "del", "la", "las", "los", "y", "e"}
    return " ".join(x if (i and x.lower() in pequenas) else x.capitalize() for i, x in enumerate(nome.lower().split()))


def _sem_instrucao(v: str) -> str:
    """Remove instruções da ficha entre parênteses, como '(indique en el campo…)'."""
    return re.sub(r"\s*\((?:indi|Indi|Describa|cuando)[^)]*\)?", "", v).strip()


def _grupos_espaciais(s):
    """Cada grupo 'localidade;departamento;província;código' da referência espacial."""
    if not limpar(s):
        return []
    return [[limpar(x) for x in g.split(";")] for g in re.split(r"(?<=\d)\s*,\s*", str(s))]


def preparar(df: pd.DataFrame) -> Resultado:
    deptos = _carregar_departamentos()
    avisos = []
    ods_desconhecidos = collections.Counter()

    # Siglas de movimentos: "UTEP" passa a contar junto com "Unión de Trabajadores… (UTEP)"
    todos_mov = collections.Counter(p for s in df["Nombre de Movimiento"] for p in partes(s))
    sigla_nome = {}
    for nome, _ in todos_mov.most_common():
        m = re.search(r"\(([^()]+)\)\s*$", nome)
        if m:
            sigla_nome.setdefault(m.group(1).strip().lower(), nome)

    def movimentos(s):
        out = []
        for p in partes(s):
            p = nao_informado(p)
            m = re.search(r"\(([^()]+)\)\s*$", p)
            if m and m.group(1).strip().lower() in sigla_nome:
                p = sigla_nome[m.group(1).strip().lower()]
            elif p.lower() in sigla_nome:
                p = sigla_nome[p.lower()]
            out.append(p)
        return out

    def ods(s):
        out = []
        for p in partes(s):
            m = re.match(r"^(?:ODS\s*)?(\d{1,2})\b", p)
            if m and int(m.group(1)) in ODS:
                out.append(ODS_ROTULO[int(m.group(1))])
            elif re.match(r"^\d+$", p):
                ods_desconhecidos[p] += 1
            else:
                k = chave(p)
                hit = [n for n, t in ODS.items() if chave(t)[:12] == k[:12]]
                if hit:
                    out.append(ODS_ROTULO[hit[0]])
                elif k in ODS_SINONIMOS:
                    out.append(ODS_ROTULO[ODS_SINONIMOS[k]])
                elif k == "ni":
                    out.append(NI)
                else:
                    ods_desconhecidos[p] += 1
        return out

    def acao(row):
        matriz, derivada = [], []
        for col in ("ACCIÓN MATRIZ y DERIVADA", "ACCIÓN MATRIZ y DERIVADA2"):
            for p in partes(row[col]):
                if p.upper().startswith("OTRAS"):
                    matriz.append("OTRAS")
                elif p == p.upper():
                    matriz.append(p)
                else:
                    derivada.append(p)
        return matriz, derivada

    def fonte(s):
        v = limpar(s)
        if re.match(r"(?i)^p[áa]gina\s*[|/_ ]?\s*12(\.com\.ar)?$", v):
            return "Página/12"
        return nao_informado(v)

    locmeta = collections.defaultdict(list)
    grafias_depto = collections.defaultdict(collections.Counter)
    prov_do_depto = {}

    def espaco(s):
        provs, locs, deps, regs = [], [], [], []
        for f in _grupos_espaciais(s):
            if len(f) < 3:
                v = " ".join(f).strip()
                if v:
                    provs.append(v); locs.append(v)
                continue
            loc, dep, prov = f[0], f[1], re.sub(r",\s*Antártida.*", "", f[2])
            for pv in prov.split("/"):
                pv = pv.strip()
                pv = {"Argentina": "Argentina (nacional)", "CABA": CABA}.get(pv, pv)
                if pv:
                    provs.append(pv)
            p0 = prov.split("/")[0].strip()
            if loc == "CABA" or p0 == "CABA":
                locs.append(CABA)
            elif loc == "Argentina" or p0 == "Argentina":
                locs.append("Argentina (nacional)")
            elif p0 and len(f) >= 4 and re.match(r"^\d+$", f[3] or ""):
                rot = f"{loc} ({p0})"
                locmeta[rot].append((loc, dep, p0))
                locs.append(rot)
            else:
                locs.append(loc)
            # departamento e região
            pk = chave_provincia(prov)
            if pk == "ciudad autonoma de buenos aires":
                deps.append("CABA|ciudad autonoma de buenos aires"); regs.append("Gran Buenos Aires"); continue
            if chave(loc) == "amba" or chave(dep) == "amba":
                regs.append("Gran Buenos Aires"); continue
            dk = ALIAS_DEPARTAMENTO.get((chave(dep), pk), chave(dep))
            if (dk, pk) in deptos:
                gid = f"{dk}|{pk}"
                deps.append(gid); grafias_depto[gid][dep] += 1; prov_do_depto[gid] = prov
                regs.append(regiao_de(dk, pk))
            elif pk in REGIAO_DA_PROVINCIA:
                regs.append(REGIAO_DA_PROVINCIA[pk] if pk != "buenos aires" else "Buenos Aires (partido não informado)")
        return provs, locs, deps, [r for r in regs if r]

    registros = []
    for _, r in df.iterrows():
        matriz, derivada = acao(r)
        provs, locs, deps, regs = espaco(r["Referencia Espacial"])
        mes = int(float(r["Mes"]))
        ano = next((limpar(r[c]) for c in ("Año", "Ano") if c in r.index and limpar(r[c])), "")
        if not ano:
            m_ano = re.search(r"(\d{4})\s*$", limpar(r["FECHA INICIAL DE LA ACCIÓN"]) or limpar(r["Fecha de la Noticia"]) or "")
            ano = m_ano.group(1) if m_ano else ""
        pais = next((limpar(r[c]) for c in ("País", "Pais") if c in r.index and limpar(r[c])), "Argentina")
        v = {
            "ano": [str(int(float(ano)))] if ano else [],
            "pais": [pais],
            "mes": [f"{mes:02d} · {MESES[mes - 1]}"],
            "escala": [limpar(r["Escala de la Acción"])],
            "virtual": [limpar(r["¿ES UNA ACCIÓN VIRTUAL?"])],
            "modalidad": partes(r["MODALIDAD DE LA ACCIÓN"]),
            "direccion": [_sem_instrucao(p) for p in partes(r["DIRECIONALIDAD DE LA ACCIÓN"])],
            "matriz": matriz, "derivada": derivada,
            "objetivos": [nao_informado(p) for p in partes(r["OBJETIVOS DE LA ACCIÓN"])],
            "cantidad": [nao_informado(limpar(r["Cantidad de personas"]))] if limpar(r["Cantidad de personas"]) else [],
            "tipomov": [nao_informado(p) for p in partes(r["Tipo de movimiento"])],
            "nombremov": movimentos(r["Nombre de Movimiento"]),
            "tipoinst": [nao_informado(p) for p in partes(r["Tipo de Institución"])],
            "nombreinst": [nao_informado(p) for p in partes(r["Nombre de la  Institución"])],
            "ods": ods(r["ODS"]),
            "provincia": provs, "region": regs, "departamento": deps, "localidad": locs,
            "localizacion": [_sem_instrucao(p) for p in partes(r["LOCALIZACIÓN DE LA ACCIÓN"])],
            "otraslocal": [nao_informado(p) for p in partes(r["OTRAS LOCALIZACIONES"])],
            "dependencias": [nao_informado(p) for p in partes(r["DEPENDENCIAS PÚBLICAS"])],
            "fuente": [fonte(r["Fuente de la Noticia"])],
        }
        registros.append({"v": v, "codigo": limpar(r["CÓDIGO DE NOTICIAS"]), "titulo": limpar(r["Título de la Noticia"]),
                          "data": limpar(r["Fecha de la Noticia"]), "inicio": limpar(r["FECHA INICIAL DE LA ACCIÓN"]),
                          "fim": limpar(r["FECHA FINAL DE LA ACCIÓN"]), "link": limpar(r["Link da notícia"]),
                          "status": limpar(r["Status"])})

    # Rótulos dos departamentos: grafia da planilha (preferindo a que não está toda em maiúsculas)
    rotulos = {"CABA|ciudad autonoma de buenos aires": CABA}
    for gid, cont in grafias_depto.items():
        g = sorted(cont.items(), key=lambda kv: (kv[0].isupper(), -kv[1]))[0][0]
        rotulos[gid] = f"{_titulo(g) if g.isupper() else g} ({prov_do_depto[gid]})"
    for reg in registros:
        reg["v"]["departamento"] = [rotulos[x] for x in reg["v"]["departamento"]]

    # Unifica grafias equivalentes dentro de cada variável e remove repetições na mesma notícia
    valores = {}
    for vid, *_ in VARIAVEIS:
        cont = collections.Counter(x for reg in registros for x in reg["v"][vid])
        melhor = {}
        for val, _ in cont.most_common():
            melhor.setdefault(chave(val) or val, val)
        for reg in registros:
            vistos = []
            for x in reg["v"][vid]:
                y = melhor[chave(x) or x]
                if y not in vistos:
                    vistos.append(y)
            reg["v"][vid] = vistos
        vals = sorted({x for reg in registros for x in reg["v"][vid]})
        if vid == "ods":
            vals.sort(key=lambda s: int(re.search(r"\d+", s).group()) if re.search(r"\d+", s) else 99)
        valores[vid] = vals

    variaveis = [{"id": vid, "label": rot, "group": grp, "ordered": ordn, "values": valores[vid]}
                 for vid, rot, grp, ordn, _ in VARIAVEIS]
    idx = {vid: {v: i for i, v in enumerate(vals)} for vid, vals in valores.items()}
    linhas = [[reg["codigo"], reg["titulo"], reg["data"], reg["inicio"], reg["fim"], reg["link"],
               1 if reg["status"] == "Repetida" else 0,
               [[idx[vid][x] for x in reg["v"][vid]] for vid, *_ in VARIAVEIS]] for reg in registros]

    # Localidade -> departamento, província e região (filtros espaciais no nível do lugar)
    meta = {rot: collections.Counter(lst).most_common(1)[0][0] for rot, lst in locmeta.items()}
    locinfo = {CABA: [CABA, CABA, "Gran Buenos Aires"]}
    for rot, (loc, dep, prov) in meta.items():
        if rot not in idx["localidad"]:
            continue
        pk = chave_provincia(prov)
        dk = ALIAS_DEPARTAMENTO.get((chave(dep), pk), chave(dep))
        gid = f"{dk}|{pk}"
        plab = CABA if pk == "ciudad autonoma de buenos aires" else prov
        locinfo[rot] = [rotulos.get(gid), plab, regiao_de(dk, pk) if (dk, pk) in deptos else REGIAO_DA_PROVINCIA.get(pk)]

    if ods_desconhecidos:
        avisos.append(f"Valores de ODS não reconhecidos: {dict(ods_desconhecidos)}")
    return Resultado(variaveis, linhas, registros, meta, rotulos, locinfo, avisos)
