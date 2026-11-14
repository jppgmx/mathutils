# Orientações para agentes — mathutils

## Projeto e escopo

- mathutils é uma aplicação fullstack de utilitários matemáticos para estudantes.
- Repositório: https://github.com/jppgmx/mathutils. Kanban: https://github.com/users/jppgmx/projects/11.
- A primeira entrega é a infraestrutura de desenvolvimento e produção. A calculadora de conjuntos entra depois: cortes retos, cortes livres e conjuntos soltos, nessa ordem.
- Estas são decisões de arquitetura; não presuma que serviços ou comandos já estejam implementados. Confira os arquivos e o README antes de executar.

## Organização e tecnologias

- `apps/frontend/`: React + Vite + TypeScript; Node.js e npm, com `package-lock.json` versionado e `npm ci` para instalações reproduzíveis.
- `apps/backend/`: Python + FastAPI + Uvicorn; pip e dependências com versões fixadas.
- `gateway/`: configurações do Nginx.
- `docs/`: documentação complementar e decisões que precisem de mais contexto.
- `compose.yaml`: produção. `compose.dev.yaml`: ajustes aplicados sobre a configuração base para desenvolvimento.
- Fixe versões compatíveis de runtimes e dependências durante a implementação; evite imagens com a tag `latest`.
- React Konva é a escolha para o editor, cuja instalação pertence à tarefa seguinte. Banco de dados, autenticação e persistência ficam fora da infraestrutura inicial.

## Contratos entre serviços

- Nginx é o único serviço com porta publicada no host; porta local padrão proposta: `8080`.
- Frontend e backend se comunicam pelo mesmo domínio. No navegador, use caminhos relativos como `/api/health`; nunca nomes internos como `http://backend:8000`.
- Preserve o prefixo `/api/` no proxy. O backend deve expor `GET /api/health`, com HTTP 200 e JSON `{"status":"ok"}`.
- Portas internas previstas: Nginx `80`, Vite `5173` e Uvicorn `8000`. Vite e Uvicorn precisam escutar em `0.0.0.0` nos contêineres.
- Dev: Nginx encaminha a interface para o Vite, incluindo WebSocket de HMR, e `/api/` para o backend. Código local por bind mounts; Vite com HMR e Uvicorn com `--reload`.
- Prod: o frontend é compilado durante o build da imagem; seu serviço copia os artefatos para um volume compartilhado e encerra com sucesso. Nginx monta esse volume somente para leitura e só inicia após a publicação dos arquivos e a prontidão do backend.
- A publicação deve remover arquivos obsoletos de builds anteriores; dependências de desenvolvimento e código local montado não fazem parte da execução em produção.
- O fallback da interface para `index.html` não pode transformar erros de `/api/` ou assets inexistentes em respostas HTML de sucesso.
- Desenho, prévias de corte e interação imediata ficam no frontend; interpretação e avaliação das expressões matemáticas ficam no backend.

## Tarefas e etiquetas

- Cada tarefa deve ser uma issue do repositório, adicionada ao Kanban.
- Título: `MU-XX — Descrição da tarefa`. `XX` é o número da issue, com pelo menos dois dígitos: issue #1 → `MU-01`; #12 → `MU-12`; #100 → `MU-100`. Não mantenha um contador paralelo.
- Como o GitHub atribui o número ao criar a issue, ajuste o prefixo do título após a criação, se necessário.
- Reutilize as etiquetas existentes. `task` identifica tarefas; `infrastructure`, `frontend` e `backend` identificam áreas. Use `bug`, `enhancement`, `documentation` e `accessibility` quando aplicáveis.
- Toda tarefa deve conter objetivo, escopo, checklist de implementação e checklist de validação.
- Fluxo: **A fazer → Em andamento → Concluído**. Só conclua após a implementação e a validação; registre impedimentos e verificações não executadas.

## Trabalho e validação

- `main` mantém a base estável; `development` integra as entregas. Crie branches de tarefa a partir de `development`, seguindo `task/MU-XX-descricao`, como `task/MU-01-infraestrutura`.
- Envie alterações por PR da branch de tarefa para `development`; promova versões por PR de `development` para `main`. Evite commits diretos nas duas branches permanentes após a inicialização do repositório.
- Prefira squash ao integrar tarefas em `development` e merge commit ao promover `development` para `main`, preservando a ancestralidade das branches permanentes. Atualize `development` com eventuais correções exclusivas de `main` antes de continuar.
- Preserve alterações existentes e mantenha as mudanças no escopo da tarefa. Escreva documentação e descrições de tarefas em português.
- Mantenha este arquivo curto e atualizado; procedimentos extensos e repetidos podem virar skills quando o fluxo estiver estabelecido.
- Use subagentes quando houver solicitação do usuário ou instrução aplicável; delimite arquivos e contratos para evitar edições concorrentes conflitantes.
- Não versione segredos, `.env`, `node_modules`, ambientes virtuais, caches ou artefatos de build. Mantenha `.env.example` com valores de exemplo seguros.
- Ao implementar infraestrutura, valide a configuração efetiva dos dois ambientes, os builds, a página pelo Nginx e o health check pelo proxy.
- Em dev, verifique HMR do React e recarga do Python. Em prod, verifique a entrega estática, o término bem-sucedido do frontend, o fallback e a atualização dos artefatos.
- Execute verificações adequadas às mudanças, incluindo build/typecheck do frontend e verificações pertinentes do backend. Documente os comandos reais no README quando forem implementados.
- Relate o que foi verificado e os resultados. Não declare que um teste passou se não foi executado.
