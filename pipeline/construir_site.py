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
import csv
import json
import sys

import pandas as pd

from comum import DADOS, FONTE, REFERENCIAS, VARIAVEIS, CABA
from geocodificar import geocodificar
from preparar_dados import preparar


def _json(obj, caminho):
    caminho.write_text(json.dumps(obj, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


def _populacao():
    with open(REFERENCIAS / "populacao_provincias_2022.csv", encoding="utf-8") as fh:
        return {r["provincia"]: int(r["populacao_2022"]) for r in csv.DictReader(fh)}


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
    deps = []
    for gid, props, geom in _topo_para_geometrias(topo):
        rot = res.rotulos_departamento.get(gid, props.get("n"))
        deps.append({"id": gid, "departamento": rot, "provincia": props.get("p"), "regiao": props.get("r"),
                     "noticias": conta["departamento"].get(rot, 0), "geometry": geom})
    gdep = gpd.GeoDataFrame(deps, crs="EPSG:4326")
    gdep.to_file(caminho, layer="departamentos", driver="GPKG")

    provs = []
    for p, grupo in gdep.groupby("provincia"):
        n = conta["provincia"].get(p, 0); habitantes = pop.get(p)
        provs.append({"provincia": p, "populacao_2022": habitantes, "noticias": n,
                      "taxa_100mil_hab": round(n / habitantes * 1e5, 2) if habitantes else None,
                      "geometry": unary_union(list(grupo.geometry)).buffer(0)})
    gpd.GeoDataFrame(provs, crs="EPSG:4326").to_file(caminho, layer="provincias", driver="GPKG")

    regs = [{"regiao": r, "noticias": conta["region"].get(r, 0), "geometry": unary_union(list(g.geometry)).buffer(0)}
            for r, g in gdep.groupby("regiao")]
    gpd.GeoDataFrame(regs, crs="EPSG:4326").to_file(caminho, layer="regioes", driver="GPKG")

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
           "coords": coords, "pop": _populacao(), "locinfo": res.locinfo, "deptLabels": res.rotulos_departamento},
          DADOS / "geo.json")
    escrever_csv(res, DADOS / f"acoes_{a.ano}.csv")
    escrever_dicionario(res, DADOS / "dicionario.md", a.ano)
    with open(DADOS / "relatorio_geocodificacao.csv", "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=["localidade", "metodo", "lon", "lat"]); w.writeheader(); w.writerows(relatorio)
    if not a.sem_camadas:
        escrever_camadas(res, coords, relatorio, DADOS / "camadas" / f"acoes_{a.ano}.gpkg")

    unicas = sum(1 for r in res.linhas if not r[6])
    metodos = collections.Counter(r["metodo"] for r in relatorio)
    print(f"{len(res.linhas)} notícias ({unicas} únicas), {len(res.variaveis)} variáveis; localidades: {dict(metodos)}")
    for aviso in res.avisos:
        print("AVISO:", aviso)


if __name__ == "__main__":
    main()
