# Instruções para o Claude neste repositório

- A cada mudança na base, nos dados, nas fontes, nos critérios ou nas análises do site, atualize `PROCESSO.md`: a seção correspondente, o **Registro de alterações** (data, o que mudou, por quê, commit) e as **Pendências**; aumente a versão no topo; depois gere a versão em Word com `python pipeline/gerar_processo_docx.py`.
- Nunca envie a planilha `.xlsx` original nem dados pessoais de quem codificou; só o CSV gerado por `pipeline/anonimizar.py` vai para `dados/fonte/`.
- Ao mudar CSS ou JavaScript, troque o parâmetro `?v=` em `index.html`, `base/index.html` e `assets/js/app/carregar.js`.
