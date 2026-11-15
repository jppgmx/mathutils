# Backend — mathutils

API Python com FastAPI e Uvicorn. Execute os comandos abaixo na raiz do repositório.

## Estágios Docker

O [Dockerfile](./Dockerfile) usa `base` para compartilhar configurações e usuário.
Os targets são:

- `build`: instala as [dependências da aplicação](./requirements.txt) em `/opt/venv`.
- `dev`: copia o ambiente virtual e o código; executa Uvicorn com `--reload`.
- `tests`: deriva de `dev`, instala as [dependências de teste](./requirements-test.txt) e executa pytest.
- `prod`: copia somente o ambiente virtual da aplicação e seu código; executa sem reload. É o target padrão.

Todos os targets de execução usam o usuário `mathutils` (UID 10001).
O código fica em `/app/app`; o ambiente virtual fica fora dessa pasta para que
um futuro bind mount em `/app` não esconda as dependências.

## Construir e testar

```bash
docker build --target dev -t mathutils-backend:dev ./apps/backend
docker build --target tests -t mathutils-backend:tests ./apps/backend
docker run --rm mathutils-backend:tests
docker build --target prod -t mathutils-backend:prod ./apps/backend
```

O build de `tests` prepara a imagem; a suíte só roda com `docker run`.
O build de `prod` não executa os testes automaticamente: rode a suíte antes de publicar.

O endpoint `GET /api/health` deve responder HTTP 200 com `{"status":"ok"}`.
A [suíte inicial](./tests/test_health.py) verifica status, tipo de conteúdo e JSON.

`EXPOSE 8000` documenta a porta interna; não a publica no host.
Os arquivos `compose.yml` e `compose.dev.yml`, na raiz, incluem o backend e o
proxy Nginx. O override de dev monta o código em `/app` e seleciona o target
`dev`; produção seleciona `prod`, sem bind mount do código e sem reload.
Consulte os comandos no [README principal](../../README.md).

O endpoint de saúde está implementado, mas a configuração de `healthcheck` do
Compose e a espera por `service_healthy` no gateway permanecem pendentes.
