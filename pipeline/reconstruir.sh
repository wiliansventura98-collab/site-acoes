#!/usr/bin/env bash
# Refaz a base DATALUTA Argentina 2024 do zero, na ordem descrita em PROCESSO.md (seção 2).
#
# Uso:
#   bash pipeline/reconstruir.sh caminho/2024_Base_Tratada.xlsx   # a partir da planilha original (privada)
#   bash pipeline/reconstruir.sh                                  # a partir de dados/fonte/acoes_2024_fonte.csv
#
# A planilha .xlsx contém dados pessoais de quem codificou e nunca deve ser enviada ao repositório.
set -euo pipefail
cd "$(dirname "$0")/.."
ANO="${ANO:-2024}"

echo "== 0. Dependências"
python -m pip install -q -r pipeline/requirements.txt

if [ "${1:-}" != "" ]; then
  echo "== 1. Versão publicável da planilha"
  python pipeline/anonimizar.py "$1" --ano "$ANO"
fi

echo "== 2. Verificação de privacidade (entrada)"
python pipeline/verificar_privacidade.py

echo "== 3. Dados do site, CSVs abertos e GeoPackage"
python pipeline/construir_site.py --ano "$ANO"

echo "== 4. Verificação de privacidade (dados gerados)"
python pipeline/verificar_privacidade.py

echo "Pronto. Para ver localmente: python -m http.server 8000 e abra http://localhost:8000/base/"
echo "Lembre de registrar a mudança em PROCESSO.md (seções 9 e 10)."
