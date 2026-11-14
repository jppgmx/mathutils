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

## Estado inicial

Arquitetura inicial definida: Docker Compose com serviços de frontend, backend e
Nginx. Em desenvolvimento, o Nginx faz proxy para o Vite e para o FastAPI; em
produção, serve o frontend compilado por volume compartilhado e encaminha a API
ao backend. A implementação da infraestrutura ainda está pendente.

As decisões e convenções para agentes estão no [AGENTS.md](./AGENTS.md).
