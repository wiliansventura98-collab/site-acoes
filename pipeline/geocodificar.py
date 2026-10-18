"""Etapa 2: posiciona as localidades citadas.

Ordem de tentativa para cada localidade:
1. coordenadas conferidas manualmente (referencias/coordenadas_manuais.csv);
2. GeoNames, pelo nome da localidade dentro da mesma província (referencias/localidades_geonames_ar.csv);
3. centro do departamento informado na referência espacial (referencias/departamentos.csv).

Localidades fora da Argentina ou referências só de província ficam sem ponto e não entram no mapa de localidades.
"""
from __future__ import annotations

import csv

from comum import CABA, REFERENCIAS, ALIAS_DEPARTAMENTO, chave, chave_provincia

# Nomes de província usados pelo GeoNames que diferem da forma comparável usada aqui
ALIAS_GEONAMES = {"buenos aires f d": "ciudad autonoma de buenos aires"}


def _ler(nome):
    with open(REFERENCIAS / nome, encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


def geocodificar(locmeta: dict) -> tuple[dict, list]:
    manuais = {r["localidade"]: [float(r["lon"]), float(r["lat"])] for r in _ler("coordenadas_manuais.csv")}
    geonames = {}
    for r in _ler("localidades_geonames_ar.csv"):
        pk = chave(r["provincia_geonames"])
        geonames.setdefault((chave(r["nome"]), ALIAS_GEONAMES.get(pk, pk)), [round(float(r["lon"]), 4), round(float(r["lat"]), 4)])
    deptos = {(r["chave_departamento"], r["chave_provincia"]): [float(r["lon"]), float(r["lat"])] for r in _ler("departamentos.csv")}

    coords, relatorio = {}, []
    if CABA in manuais:
        coords[CABA] = manuais[CABA]
        relatorio.append({"localidade": CABA, "metodo": "manual", "lon": manuais[CABA][0], "lat": manuais[CABA][1]})
    for rotulo, (loc, dep, prov) in sorted(locmeta.items()):
        pk = chave_provincia(prov)
        metodo, xy = None, None
        if rotulo in manuais:
            metodo, xy = "manual", manuais[rotulo]
        else:
            xy = geonames.get((chave(loc), pk))
            if xy is None and pk == "buenos aires":
                xy = geonames.get((chave(loc), "ciudad autonoma de buenos aires"))
            if xy is not None:
                metodo = "geonames"
            else:
                dk = ALIAS_DEPARTAMENTO.get((chave(dep), pk), chave(dep))
                xy = deptos.get((dk, pk))
                metodo = "centro do departamento" if xy else None
        if xy:
            coords[rotulo] = xy
        relatorio.append({"localidade": rotulo, "metodo": metodo or "não localizada", "lon": xy[0] if xy else "", "lat": xy[1] if xy else ""})
    return coords, relatorio
