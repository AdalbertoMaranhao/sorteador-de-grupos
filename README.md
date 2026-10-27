# Sorteador de Grupos

Aplicação web simples para dividir alunos em equipes de forma aleatória. Pode ser usada com uma lista de nomes ou apenas com o total de alunos.

## Recursos

- Define a quantidade de equipes e o total de alunos.
- Aceita nomes colados ou digitados, um aluno por linha.
- Embaralha os alunos e distribui as equipes com tamanhos equilibrados; a diferença entre equipes é de no máximo um aluno.
- Permite sortear o próximo grupo que deve apresentar, informando os grupos que já apresentaram.
- Exporta a lista de equipes em PDF, sem bibliotecas externas.
- Funciona no navegador e não envia os dados dos alunos para um servidor.
- Pode ser instalado como PWA no Android e no iPhone e usado offline após o primeiro acesso completo.

## Como usar

1. Baixe ou clone este repositório.
2. Abra `index.html` em um navegador atualizado.
3. Informe a quantidade de equipes e o total de alunos, ou cole uma lista de nomes.
4. Clique em **Sortear grupos**. O botão **Exportar PDF** fica disponível após o sorteio.

Para sortear grupos de apresentação, informe a quantidade de grupos e os números que já apresentaram, separados por vírgula. O grupo sorteado é acrescentado à lista automaticamente.

## Instalar no smartphone

Publique todos os arquivos em uma hospedagem com **HTTPS**, como o GitHub Pages, e acesse o endereço pelo celular. Abrir o arquivo `index.html` diretamente permite usar o sorteador, mas não habilita a instalação nem o cache offline.

- **Android:** no Chrome, toque em **Instalar aplicativo** quando o botão aparecer. Também é possível usar o menu do navegador e escolher **Instalar aplicativo** ou **Adicionar à tela inicial**.
- **iPhone/iPad:** no Safari, abra **Compartilhar → Adicionar à Tela de Início** e confirme em **Adicionar**. Ative **Abrir como App**, caso essa opção apareça.

Espere a primeira página carregar completamente com internet antes de usar offline. Depois, abra pelo ícone da tela inicial: o sorteio de equipes, o sorteio de apresentação e a exportação de PDF funcionam sem conexão. A instalação não salva os nomes nem os sorteios; eles continuam somente na página atual.

Para testar no computador, execute `python3 -m http.server 8000` na pasta do projeto e abra `http://localhost:8000`. No celular, use o endereço HTTPS publicado; um endereço HTTP da rede local não habilita o PWA.

## Arquivos

- `index.html`: estrutura da página.
- `style.css`: estilos e layout responsivo.
- `script.js`: sorteio, distribuição, exibição dos resultados e geração do PDF.
- `pwa.js`: registro do service worker e interface de instalação.
- `manifest.webmanifest`: nome, aparência, escopo e ícones do aplicativo instalado.
- `sw.js`: cache dos arquivos para uso offline.
- `icons/`: ícones PNG para Android e iOS.

Ao alterar qualquer arquivo listado em `APP_SHELL`, aumente a versão de `CACHE_NAME` em `sw.js` (por exemplo, de `v1` para `v2`). O navegador baixa a atualização ao acessar o aplicativo com internet e a ativa depois que todas as janelas do aplicativo forem fechadas. Reabra para usar a nova versão.

## Tecnologias

HTML, CSS e JavaScript puro. Não requer instalação, etapa de compilação ou dependências.

## Publicação no GitHub Pages

Como o projeto é estático, pode ser publicado pelo GitHub Pages:

1. Envie os arquivos deste projeto para a branch principal do repositório.
2. Nas configurações do repositório, abra **Pages** e escolha a branch principal e a pasta raiz como origem.

## Licença

Este projeto está licenciado sob a licença **MIT**. Consulte o arquivo [`LICENSE`](LICENSE) para ver o texto completo.
