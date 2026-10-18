"""Funções e definições compartilhadas pelas etapas do pipeline."""
from __future__ import annotations

import re
import unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
REFERENCIAS = RAIZ / "pipeline" / "referencias"
DADOS = RAIZ / "dados"
FONTE = DADOS / "fonte"

# Colunas da ficha de codificação que podem ser publicadas. Qualquer coluna fora desta lista
# (nome, sobrenome, e-mail de quem codificou, data de envio do formulário, observações internas)
# é descartada na anonimização.
COLUNAS_PUBLICAVEIS = [
    "CÓDIGO DE NOTICIAS", "Título de la Noticia", "Fuente de la Noticia", "Fecha de la Noticia",
    "Referencia Espacial", "LOCALIZACIÓN DE LA ACCIÓN", "OTRAS LOCALIZACIONES", "DEPENDENCIAS PÚBLICAS",
    "¿ES UNA ACCIÓN VIRTUAL?", "Escala de la Acción", "ACCIÓN MATRIZ y DERIVADA", "ACCIÓN MATRIZ y DERIVADA2",
    "DESCRIBA LA OTRA ACCIÓN MATRIZ Y DERIVADA", "OBJETIVOS DE LA ACCIÓN", "DIRECIONALIDAD DE LA ACCIÓN",
    "FECHA INICIAL DE LA ACCIÓN", "FECHA FINAL DE LA ACCIÓN", "Tipo de movimiento", "Nombre de Movimiento",
    "Nombre de Otro Tipo de Movimiento", "MODALIDAD DE LA ACCIÓN", "Cantidad de personas", "Tipo de Institución",
    "Nombre de la  Institución", "ODS", "ODS 18", "DESCRIBE EL NUEVO OBJETIVO", "Link da notícia", "Mes", "Status",
    "PDFs VINCULADOS (notícias repetidas)",
]
COLUNAS_PESSOAIS = ["Nombre", "Apellido", "E-mail", "Submission Date", "OBSERVACIONES"]

# Variáveis exploráveis: id, rótulo, grupo, ordem natural (em vez de frequência), descrição
VARIAVEIS = [
    ("mes", "Mês da notícia", "Tempo", True, "Mês de publicação da notícia."),
    ("escala", "Escala de la acción", "Ação", False, "Escala espacial da ação: municipal, provincial, regional, nacional ou internacional."),
    ("virtual", "¿Es una acción virtual?", "Ação", False, "Indica se a ação ocorreu em ambiente virtual."),
    ("modalidad", "Modalidad de la acción", "Ação", False, "Modalidade da ação: socioespacial, socioespacial virtual ou socioterritorial."),
    ("direccion", "Direccionalidad de la acción", "Ação", False, "Direcionalidade: reivindicativa, propositiva, defensiva, conquistada ou sofrida."),
    ("matriz", "Acción matriz", "Ação", False, "Tipologia da ação no nível matriz (categorias em maiúsculas na ficha)."),
    ("derivada", "Acción derivada", "Ação", False, "Tipologia da ação no nível derivado."),
    ("objetivos", "Objetivos de la acción", "Ação", False, "Objetivos declarados da ação."),
    ("cantidad", "Cantidad de personas", "Ação", False, "Quantidade de participantes informada na notícia (texto livre)."),
    ("tipomov", "Tipo de movimiento", "Protagonistas", False, "Tipo de movimento protagonista da ação."),
    ("nombremov", "Nombre de movimiento", "Protagonistas", False, "Movimento ou organização protagonista; siglas unificadas ao nome completo."),
    ("tipoinst", "Tipo de institución", "Instituições", False, "Tipo de instituição interpelada pela ação."),
    ("nombreinst", "Nombre de la institución", "Instituições", False, "Instituição interpelada, em categorias padronizadas."),
    ("ods", "ODS", "Instituições", True, "Objetivos de Desenvolvimento Sustentável relacionados à ação."),
    ("provincia", "Provincia", "Espaço", False, "Província citada na referência espacial (inclui CABA e 'Argentina (nacional)')."),
    ("region", "Región (INDEC)", "Espaço", False, "Região estatística do INDEC, derivada do departamento ou da província."),
    ("departamento", "Departamento / partido", "Espaço", False, "Departamento ou partido citado na referência espacial."),
    ("localidad", "Localidad", "Espaço", False, "Localidade citada, no formato 'Localidade (Província)'."),
    ("localizacion", "Localización de la acción", "Espaço", False, "Tipo de lugar onde a ação ocorreu."),
    ("otraslocal", "Otras localizaciones", "Espaço", False, "Detalhamento de outras localizações."),
    ("dependencias", "Dependencias públicas", "Espaço", False, "Tipo de dependência pública onde a ação ocorreu."),
    ("fuente", "Fuente de la noticia", "Fonte", False, "Veículo ou fonte da notícia (grafias unificadas)."),
]

NI = "No informa (NI)"
CABA = "CABA (Ciudad de Buenos Aires)"
MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]

REGIOES_POR_PROVINCIA = {
    "Noroeste (NOA)": ["jujuy", "salta", "tucuman", "catamarca", "santiago del estero", "la rioja"],
    "Noreste (NEA)": ["corrientes", "chaco", "formosa", "misiones"],
    "Cuyo": ["mendoza", "san juan", "san luis"],
    "Pampeana": ["cordoba", "entre rios", "la pampa", "santa fe", "buenos aires"],
    "Patagonia": ["chubut", "neuquen", "rio negro", "santa cruz", "tierra del fuego"],
    "Gran Buenos Aires": ["ciudad autonoma de buenos aires"],
}
REGIAO_DA_PROVINCIA = {p: r for r, ps in REGIOES_POR_PROVINCIA.items() for p in ps}
# Os 24 partidos do Gran Buenos Aires (INDEC)
PARTIDOS_GBA = {
    "almirante brown", "avellaneda", "berazategui", "esteban echeverria", "ezeiza", "florencio varela", "general san martin",
    "hurlingham", "ituzaingo", "jose c paz", "la matanza", "lanus", "lomas de zamora", "malvinas argentinas", "merlo", "moreno",
    "moron", "quilmes", "san fernando", "san isidro", "san miguel", "tigre", "tres de febrero", "vicente lopez",
}
ALIAS_PROVINCIA = {
    "tierra del fuego antartida e islas del atlantico sur": "tierra del fuego",
    "caba": "ciudad autonoma de buenos aires",
}
ALIAS_DEPARTAMENTO = {
    ("dr manuel belgrano", "jujuy"): "doctor manuel belgrano",
    ("la capital", "san luis"): "juan martin de pueyrredon",
    ("capital", "san luis"): "juan martin de pueyrredon",
}


def limpar(s) -> str:
    """Texto sem espaços repetidos; vazio para nulos."""
    if s is None or (isinstance(s, float) and s != s):
        return ""
    return re.sub(r"\s+", " ", str(s)).strip()


def partes(s, separadores: str = r";|\n") -> list[str]:
    """Divide um campo com vários valores."""
    if s is None or (isinstance(s, float) and s != s):
        return []
    return [p for p in (limpar(x) for x in re.split(separadores, str(s))) if p]


def chave(s) -> str:
    """Forma comparável: sem acentos, minúsculas, só letras e números."""
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


def chave_provincia(nome: str) -> str:
    k = chave(re.sub(r",\s*Antártida.*", "", nome or ""))
    return ALIAS_PROVINCIA.get(k, k)


def regiao_de(chave_depto: str, chave_prov: str) -> str | None:
    if chave_prov == "buenos aires" and chave_depto in PARTIDOS_GBA:
        return "Gran Buenos Aires"
    return REGIAO_DA_PROVINCIA.get(chave_prov)


def nao_informado(v: str) -> str:
    return NI if chave(v) in {"ni", "no informa ni", "no informa", "no indica", "n i", "no informado"} else v
