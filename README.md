# Sorteador de Grupos

Aplicação web simples para dividir alunos em equipes de forma aleatória. Pode ser usada com uma lista de nomes ou apenas com o total de alunos.

## Recursos

- Define a quantidade de equipes e o total de alunos.
- Aceita nomes colados ou digitados, um aluno por linha.
- Embaralha os alunos e distribui as equipes com tamanhos equilibrados; a diferença entre equipes é de no máximo um aluno.
- Permite sortear o próximo grupo que deve apresentar, informando os grupos que já apresentaram.
- Exporta a lista de equipes em PDF, sem bibliotecas externas.
- Funciona no navegador e não envia os dados dos alunos para um servidor.

## Como usar

1. Baixe ou clone este repositório.
2. Abra `index.html` em um navegador atualizado.
3. Informe a quantidade de equipes e o total de alunos, ou cole uma lista de nomes.
4. Clique em **Sortear grupos**. O botão **Exportar PDF** fica disponível após o sorteio.

Para sortear grupos de apresentação, informe a quantidade de grupos e os números que já apresentaram, separados por vírgula. O grupo sorteado é acrescentado à lista automaticamente.

## Arquivos

- `index.html`: estrutura da página.
- `style.css`: estilos e layout responsivo.
- `script.js`: sorteio, distribuição, exibição dos resultados e geração do PDF.

## Tecnologias

HTML, CSS e JavaScript puro. Não requer instalação, etapa de compilação ou dependências.

## Publicação no GitHub Pages

Como o projeto é estático, pode ser publicado pelo GitHub Pages:

1. Envie os arquivos deste projeto para a branch principal do repositório.
2. Nas configurações do repositório, abra **Pages** e escolha a branch principal e a pasta raiz como origem.

## Licença

Este projeto está licenciado sob a licença **MIT**. Consulte o arquivo [`LICENSE`](LICENSE) para ver o texto completo.
