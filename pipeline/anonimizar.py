"""Gera a versão publicável da planilha de codificação.

Mantém apenas as colunas da lista COLUNAS_PUBLICAVEIS e descarta dados pessoais de quem codificou
(nome, sobrenome, e-mail), a data de envio do formulário e as observações internas de revisão.

Uso:
    python pipeline/anonimizar.py caminho/para/2024_Base_Tratada.xlsx --ano 2024

Saída:
    dados/fonte/acoes_<ano>_fonte.csv
"""
from __future__ import annotations

import argparse
import re
import sys

import pandas as pd

from comum import COLUNAS_PUBLICAVEIS, FONTE


def anonimizar(planilha: str, ano: int) -> str:
    df = pd.read_excel(planilha, dtype=str)
    # A coluna de código traz o ano no nome ("CÓDIGO DE NOTICIAS - 2024"); padroniza.
    df = df.rename(columns={c: "CÓDIGO DE NOTICIAS" for c in df.columns if re.match(r"^CÓDIGO DE NOTICIAS", str(c))})
    faltando = [c for c in COLUNAS_PUBLICAVEIS if c not in df.columns]
    if faltando:
        sys.exit(f"Colunas esperadas não encontradas na planilha: {faltando}")
    publico = df[COLUNAS_PUBLICAVEIS].fillna("")
    destino = FONTE / f"acoes_{ano}_fonte.csv"
    destino.parent.mkdir(parents=True, exist_ok=True)
    publico.to_csv(destino, index=False, encoding="utf-8")
    descartadas = [c for c in df.columns if c not in COLUNAS_PUBLICAVEIS]
    print(f"{len(publico)} registros gravados em {destino.relative_to(FONTE.parent.parent)}")
    print(f"Colunas descartadas: {descartadas}")
    return str(destino)


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("planilha")
    ap.add_argument("--ano", type=int, default=2024)
    a = ap.parse_args()
    anonimizar(a.planilha, a.ano)
