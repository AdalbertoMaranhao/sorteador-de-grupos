# Sorteador de Grupos

Aplicação web simples para dividir alunos em equipes de forma aleatória. Pode ser usada com uma lista de nomes ou apenas com o total de alunos.

## Recursos

- Define a quantidade de equipes e o total de alunos.
- Aceita nomes colados ou digitados, um aluno por linha.
- Embaralha os alunos e distribui as equipes com tamanhos equilibrados; a diferença entre equipes é de no máximo um aluno.
- Permite sortear o próximo grupo que deve apresentar, informando os grupos que já apresentaram.
- Salva automaticamente o progresso das apresentações neste dispositivo, para continuar depois.
- Exporta a lista de equipes em PDF, sem bibliotecas externas.
- Permite nomear o sorteio e usar esse nome no título e no arquivo PDF exportado.
- Funciona no navegador e não envia os dados dos alunos para um servidor.
- Pode ser instalado como PWA no Android e no iPhone e usado offline após o primeiro acesso completo.

## Como usar

1. Baixe ou clone este repositório.
2. Abra `index.html` em um navegador atualizado.
3. Informe a quantidade de equipes e o total de alunos, ou cole uma lista de nomes.
4. Clique em **Sortear grupos**. O botão **Exportar PDF** fica disponível após o sorteio.

Preencha **Nome do sorteio** para personalizar o título e o nome do PDF (por exemplo, `Biologia - Turma A.pdf`). O campo é opcional e pode ser alterado depois do sorteio, sem mudar os grupos. Sem um nome, o arquivo será `grupos-sorteados.pdf`. Caracteres incompatíveis com nomes de arquivo são substituídos por hífens. O botão **Limpar** também apaga o nome.

Para sortear grupos de apresentação, informe a quantidade de grupos e os números que já apresentaram, separados por vírgula. O grupo sorteado é acrescentado à lista automaticamente.

## Continuar as apresentações depois

A quantidade de grupos e o campo **Já apresentaram** são salvos automaticamente após cada sorteio e sempre que você editar esses campos. Ao fechar e reabrir o aplicativo, o progresso é recuperado e os grupos que já apresentaram continuam fora dos próximos sorteios.

Use **Nova rodada** para apagar a lista de grupos que já apresentaram, mantendo a quantidade de grupos. A nova rodada também é salva automaticamente. **Limpar** apaga somente os dados da divisão de alunos; o progresso das apresentações é preservado. Sortear novas equipes também preserva uma lista de apresentações já iniciada.

O progresso fica somente no armazenamento local do navegador ou PWA utilizado e funciona offline, sem sincronização entre dispositivos ou instalações. Limpar os dados do site ou encerrar uma sessão privada pode apagar esse progresso. Se o navegador bloquear o armazenamento, a página informa que não conseguiu salvar.

## Instalar no smartphone

Publique todos os arquivos em uma hospedagem com **HTTPS**, como o GitHub Pages, e acesse o endereço pelo celular. Abrir o arquivo `index.html` diretamente permite usar o sorteador, mas não habilita a instalação nem o cache offline.

- **Android:** no Chrome, abra o menu do navegador e escolha **Instalar aplicativo** ou **Adicionar à tela inicial**.
- **iPhone/iPad:** no Safari, abra **Compartilhar → Adicionar à Tela de Início** e confirme em **Adicionar**. Ative **Abrir como App**, caso essa opção apareça.

Espere a primeira página carregar completamente com internet antes de usar offline. Depois, abra pelo ícone da tela inicial: o sorteio de equipes, o sorteio de apresentação, o progresso de quem já apresentou e a exportação de PDF funcionam sem conexão. A divisão dos alunos em equipes continua somente na página atual.

Para testar no computador, execute `python3 -m http.server 8000` na pasta do projeto e abra `http://localhost:8000`. No celular, use o endereço HTTPS publicado; um endereço HTTP da rede local não habilita o PWA.

## Arquivos

- `index.html`: estrutura da página.
- `style.css`: estilos e layout responsivo.
- `script.js`: sorteio, distribuição, exibição dos resultados e geração do PDF.
- `pwa.js`: registro do service worker para uso offline.
- `manifest.webmanifest`: nome, aparência, escopo e ícones do aplicativo instalado.
- `sw.js`: cache dos arquivos para uso offline.
- `icons/`: ícones PNG para Android e iOS.

Ao alterar qualquer arquivo listado em `APP_SHELL`, aumente a versão de `CACHE_NAME` em `sw.js` (por exemplo, de `v1` para `v2`). O navegador baixa a atualização ao acessar o aplicativo com internet e a ativa depois que todas as janelas do aplicativo forem fechadas. Reabra para usar a nova versão.

## Tecnologias

HTML, CSS e JavaScript puro. Não requer instalação, etapa de compilação ou dependências.

## Testes

Com Node.js instalado, execute `node --test tests/presentations.test.cjs` para verificar a gravação e recuperação do progresso, a exclusão dos grupos que já apresentaram e o início de uma nova rodada.

## Publicação no GitHub Pages

Como o projeto é estático, pode ser publicado pelo GitHub Pages:

1. Envie os arquivos deste projeto para a branch principal do repositório.
2. Nas configurações do repositório, abra **Pages** e escolha a branch principal e a pasta raiz como origem.

## Licença

Este projeto está licenciado sob a licença **MIT**. Consulte o arquivo [`LICENSE`](LICENSE) para ver o texto completo.
