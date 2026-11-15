# Frontend — mathutils

Interface React + Vite + TypeScript. A página inicial consulta `GET /api/health`
na mesma origem e apresenta carregamento, sucesso ou erro. A consulta tem limite
de 10 segundos e pode ser repetida pelo botão de verificação.

## Docker

Execute na raiz do repositório:

```bash
docker build --target dev -t mathutils-frontend:dev ./apps/frontend
docker run --rm mathutils-frontend:dev npm run lint
docker run --rm mathutils-frontend:dev npm test
docker build --target prod -t mathutils-frontend:prod ./apps/frontend
```

O [Dockerfile](./Dockerfile) contém quatro estágios:

- `base`: instala dependências com `npm ci`, usando o lockfile versionado.
- `dev`: executa Vite em `0.0.0.0:5173`, com porta fixa e suporte a HMR.
- `build`: executa `npm run build`, incluindo checagem TypeScript, e gera `dist`.
- `prod`: usa Alpine, sem Node.js, para publicar os arquivos compilados no volume
  montado em `/srv/frontend`. Remove os arquivos antigos antes da cópia e encerra.

O volume deve ser dedicado aos estáticos: todo o seu conteúdo é substituído.
O Nginx deverá montar o mesmo volume somente para leitura. O serviço de publicação
precisa terminar com sucesso antes de o Nginx iniciar.

## Desenvolvimento e integração

Os arquivos `compose.yml` e `compose.dev.yml`, na raiz, integram o frontend ao
Nginx e ao backend. Consulte os comandos no [README principal](../../README.md).
Somente o Nginx publica porta no host:

- `/` e o WebSocket de HMR são encaminhados ao Vite em desenvolvimento.
- `/api/` é encaminhado ao backend, preservando o prefixo.
- Em produção, o publicador grava no volume Docker `app-frontend`, que o Nginx
  monta somente para leitura em `/usr/share/nginx/html`.

O bind mount do código em `/app` deve preservar as dependências do contêiner,
por exemplo com um volume separado em `/app/node_modules`.

Sem o proxy da API, acessar somente o Vite pode mostrar um erro de conexão ou
uma resposta HTML inesperada; isso não valida a integração com o backend.

## Dependências e verificações

Use `npm install --save-exact <pacote>` para adicionar dependências e versione os dois
manifestos. Para reproduzir as versões existentes, use `npm ci`.

O Dockerfile fixa Node.js em `26.13.1-alpine3.24`; dependências diretas usam
versões exatas, e o lockfile fixa as transitivas. Com Node.js 26.13.1 e npm
instalados, também é possível executar, dentro desta pasta:

```bash
npm ci
npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
```

Um override restrito a `@typescript-eslint/typescript-estree@8.72.2` fixa
`minimatch` em `11.0.8` para corrigir o
[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).
Ele preserva as versões de TypeScript e ESLint do projeto e deve ser removido
quando o typescript-eslint publicado adotar uma versão corrigida dessa dependência.

`npm run build` verifica os tipos e compila; `npm run lint` verifica o código.
`npm test` usa o runner nativo do Node.js para testar o contrato da API com
respostas simuladas: sucesso, erro HTTP, HTML, JSON inválido e falha de rede.
Os testes não exigem bibliotecas adicionais nem iniciam o backend.
A validação integrada de dev já confirmou a consulta pelo proxy, o protocolo
WebSocket de HMR e eventos de atualização após edição no host. A inspeção visual
da atualização e da preservação de estado no navegador não foi repetida nessa
verificação; as evidências e limitações estão registradas na MU-01.
