# mathutils

Utilitários matemáticos em uma aplicação fullstack com backend Python + FastAPI
e frontend React + Vite + TypeScript.

## Repositório

- Origem Git: `https://github.com/jppgmx/mathutils.git`
- Branch inicial: `main`

## Fluxo de branches

- `main`: base estável.
- `development`: integração das entregas.
- `task/MU-XX-descricao`: trabalho de uma tarefa, criado a partir de `development`.

As tarefas entram por PR em `development`, preferencialmente com squash. A
promoção para `main` ocorre por PR de `development`, com merge commit para
preservar o histórico entre as branches permanentes.

## Organização das tarefas

[GitHub Project — mathutils](https://github.com/users/jppgmx/projects/11)

O quadro Kanban usa três colunas: **A fazer → Em andamento → Concluído**.
As tarefas podem ser criadas como issues no repositório e adicionadas ao quadro.

Primeira tarefa: [MU-01 — Organizar a infraestrutura do mathutils](https://github.com/jppgmx/mathutils/issues/1).

## Infraestrutura

- `compose.yml`: produção, com build estático do frontend e Uvicorn sem reload.
- `compose.dev.yml`: ajustes de desenvolvimento sobre a base de produção.
- `gateway/`: configurações Nginx de desenvolvimento e produção.

Somente o Nginx publica porta no host: por padrão, acesse `http://localhost:8080`.
A interface consulta `/api/health` na mesma origem; o proxy preserva `/api/`.
Não é necessário instalar Node.js, npm ou Python no host.

### Pré-requisitos

Docker Engine e Docker Compose com suporte a `!override` (Compose 2.24.4 ou
superior). Execute os comandos a seguir na raiz do repositório.

Na primeira configuração, copie o exemplo e ajuste os valores se necessário:

```bash
cp .env.example .env
```

`COMPOSE_PROJECT_NAME` define o nome do projeto (padrão `mathutils`) e separa
contêineres, redes e volumes. `HOST_PORT` define a única porta publicada
(padrão `8080`). Ambos têm valores padrão, então o Compose também funciona sem
`.env`. O arquivo local é ignorado pelo Git; o exemplo não contém segredos.
Para ambientes paralelos, use nomes de projeto e portas diferentes.

### Versões reproduzíveis

| Componente | Imagem ou versão |
| --- | --- |
| Node.js | `node:26.13.1-alpine3.24` |
| Python | `python:3.14.10-alpine3.24` |
| Nginx | `nginx:1.30.6-alpine3.24` |
| Publicador dos estáticos | `alpine:3.24.4` |

As dependências diretas npm usam versões exatas em `package.json`; o lockfile
versionado fixa também as transitivas e a instalação usa `npm ci`.
As dependências Python da aplicação e as diretas de teste usam `==`.
As imagens são as oficiais de [Node.js](https://github.com/nodejs/docker-node),
[Python](https://github.com/docker-library/python),
[Nginx](https://github.com/nginx/docker-nginx) e
[Alpine](https://github.com/alpinelinux/docker-alpine).

### Desenvolvimento

```bash
docker compose -f compose.yml -f compose.dev.yml config
docker compose -f compose.yml -f compose.dev.yml build
docker compose -f compose.yml -f compose.dev.yml up -d
docker compose -f compose.yml -f compose.dev.yml ps -a
docker compose -f compose.yml -f compose.dev.yml logs -f
docker compose -f compose.yml -f compose.dev.yml down
```

Vite escuta em `0.0.0.0:5173` e Uvicorn em `0.0.0.0:8000`, com `--reload`.
O Nginx encaminha a interface e o WebSocket do HMR ao Vite. Os bind mounts de
`apps/frontend` e `apps/backend` permitem editar o código no host; o volume
`frontend_node_modules` preserva as dependências Linux do frontend.
A rede de dev permite acesso externo para instalar dependências. O gateway
aguarda a saúde HTTP do backend e o início do Vite, sem exigir um build estático.

### Produção

```bash
docker compose -f compose.yml config
docker compose -f compose.yml build
docker compose -f compose.yml up -d
docker compose -f compose.yml ps -a
docker compose -f compose.yml logs -f
docker compose -f compose.yml down
```

O frontend compila durante o build. Seu contêiner publica os arquivos no volume
Docker `app-frontend` e termina com código 0; `Exited (0)` é esperado.
O Nginx espera essa conclusão e a saúde HTTP do backend antes de iniciar. Ele
monta os mesmos estáticos somente para leitura em `/usr/share/nginx/html`,
entrega a interface sem Vite e encaminha a API ao backend. Não há bind mount de
código nem de artefatos do host na execução de produção; apenas a configuração
do Nginx é montada a partir do repositório.

O volume é dedicado aos artefatos: seu conteúdo, incluindo arquivos ocultos e
obsoletos, é removido pelo publicador antes da cópia. `down` preserva o volume,
e a próxima publicação substitui seu conteúdo. A antiga pasta local
`app-frontend/` deixou de ser utilizada e continua ignorada pelo Git.

O health check consulta `/api/health` e verifica HTTP 200 e o JSON
`{"status":"ok"}` a cada 5 segundos, com timeout de 3 segundos, 10 tentativas
e 5 segundos iniciais de tolerância. A rede de produção usa `internal: true`;
frontend e backend permanecem nela. O Nginx também participa de uma rede de
entrada, permitindo publicar a porta no host, e é o único serviço com essa porta.

Para publicar uma atualização, pare o ambiente e reconstrua as imagens antes
de subir novamente, evitando servir os arquivos enquanto são substituídos:

```bash
docker compose -f compose.yml down
docker compose -f compose.yml build
docker compose -f compose.yml up -d
```

Pare o ambiente ativo antes de alternar entre dev e produção no mesmo projeto.
Por padrão ambos usam o projeto `mathutils` e a porta 8080. `down` preserva os volumes;
não é necessário usar `down -v` para alternar ambientes.

### Verificações e dependências

```bash
docker compose -f compose.yml -f compose.dev.yml exec -T frontend npm run lint
docker compose -f compose.yml -f compose.dev.yml exec -T frontend npm test
docker compose -f compose.yml exec -T gateway nginx -t
curl -i http://localhost:8080/api/health
```

Os dois primeiros comandos exigem dev em execução. O teste do Nginx e a
consulta HTTP podem ser feitos em produção; `curl` é opcional no host. O health
check deve retornar HTTP 200 com `{"status":"ok"}`. Builds de produção do
frontend executam a checagem TypeScript e a compilação Vite.

Para adicionar uma dependência de frontend em dev, execute
`docker compose -f compose.yml -f compose.dev.yml exec frontend npm install --save-exact <pacote>`
e versione `package.json` e `package-lock.json`. Use `npm ci` para reproduzir o
lockfile. Após alterações de dependências, reconstrua as imagens; em um volume
`node_modules` já existente, execute também `npm ci` no serviço de dev.

No backend, mantenha versões exatas em `requirements.txt` e
`requirements-test.txt`, reconstrua a imagem e execute a suíte. Os targets e
comandos de teste estão nos READMEs do [frontend](apps/frontend/README.md) e do
[backend](apps/backend/README.md).

As evidências das validações de infraestrutura e eventuais limitações ficam
registradas na [MU-01](https://github.com/jppgmx/mathutils/issues/1).

As decisões e convenções para agentes estão no [AGENTS.md](./AGENTS.md).
