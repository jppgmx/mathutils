FROM python:3.14.10-alpine3.24 AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"

WORKDIR /app

RUN addgroup -g 10001 mathutils \
    && adduser -D -u 10001 -G mathutils mathutils

EXPOSE 8000


FROM base AS build

COPY ./requirements.txt .
RUN python -m venv /opt/venv \
    && python -m pip install --no-cache-dir -r requirements.txt


FROM base AS dev

COPY --from=build /opt/venv /opt/venv
COPY --chown=mathutils:mathutils app ./app

USER mathutils

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]


FROM dev AS tests

USER root

COPY requirements-test.txt .
RUN python -m pip install --no-cache-dir -r requirements-test.txt
COPY --chown=mathutils:mathutils tests ./tests

USER mathutils

CMD ["python", "-m", "pytest", "tests", "-v", "-p", "no:cacheprovider"]


FROM base AS prod

COPY --from=build /opt/venv /opt/venv
COPY --chown=mathutils:mathutils app ./app

USER mathutils

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
