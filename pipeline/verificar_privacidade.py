"""Verificação de privacidade executada antes de publicar.

Falha (código de saída 1) se encontrar no repositório:
- planilhas originais (.xlsx/.xls), que contêm dados pessoais de quem codificou;
- colunas pessoais ou fora da lista publicável em dados/fonte/;
- endereços de e-mail nos arquivos de dados publicados.
"""
from __future__ import annotations

import csv
import re
import subprocess
import sys

from comum import COLUNAS_OPCIONAIS, COLUNAS_PESSOAIS, COLUNAS_PUBLICAVEIS, DADOS, FONTE, RAIZ

EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")


def main() -> int:
    problemas = []
    try:
        rastreados = subprocess.run(["git", "ls-files"], cwd=RAIZ, capture_output=True, text=True, check=True).stdout.split()
    except Exception:
        rastreados = [str(p.relative_to(RAIZ)) for p in RAIZ.rglob("*") if p.is_file() and ".git" not in p.parts]
    problemas += [f"Planilha original no repositório: {f}" for f in rastreados if f.lower().endswith((".xlsx", ".xls"))]

    for arq in sorted(FONTE.glob("*.csv")):
        with open(arq, encoding="utf-8") as fh:
            cab = next(csv.reader(fh), [])
        extras = [c for c in cab if c not in COLUNAS_PUBLICAVEIS + COLUNAS_OPCIONAIS]
        pessoais = [c for c in cab if c in COLUNAS_PESSOAIS]
        if pessoais or extras:
            problemas.append(f"{arq.name}: colunas não publicáveis {pessoais or extras}")

    for arq in list(DADOS.rglob("*.csv")) + list(DADOS.rglob("*.json")) + list(DADOS.rglob("*.md")):
        achados = set(EMAIL.findall(arq.read_text(encoding="utf-8", errors="ignore")))
        if achados:
            problemas.append(f"{arq.relative_to(RAIZ)}: {len(achados)} endereço(s) de e-mail encontrado(s)")

    if problemas:
        print("Verificação de privacidade FALHOU:")
        for p in problemas:
            print(" -", p)
        return 1
    print("Verificação de privacidade: nenhum dado pessoal encontrado.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
