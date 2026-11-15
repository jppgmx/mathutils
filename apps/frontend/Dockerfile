FROM node:26.13.1-alpine3.24 AS base

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci


FROM base AS dev

COPY . .
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173", "--strictPort"]


FROM base AS build

COPY . .
RUN npm run build


FROM alpine:3.24.4 AS prod

COPY --from=build /app/dist /opt/frontend-dist
RUN mkdir -p /srv/frontend

# O Compose montará o volume compartilhado em /srv/frontend.
CMD ["sh", "-ec", "find /srv/frontend -mindepth 1 -depth -delete && cp -a /opt/frontend-dist/. /srv/frontend/"]
