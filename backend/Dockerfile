FROM node:20-alpine3.18
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# #NestJs environment
# ENV NEST_MODE=dev

# #PostgresQL
# ENV POSTGRES_HOST=host.docker.internal
# ENV POSTGRES_PORT=5432
# ENV POSTGRES_USER=video
# ENV POSTGRES_PASSWORD=test12345
# ENV POSTGRES_DATABASE=video

# #Min.io S3 storage server
# ENV MINIO_HOST=host.docker.internal
# ENV MINIO_PORT=9000
# ENV MINIO_ACCESS_KEY=fPupsiMbwIzi5YhF6ueI
# ENV MINIO_SECRET_KEY=YRCJwWbwpD7HJkS0qhHahA2FsbN7ANjJwcG4kxPJ

# #Redis
# ENV REDIS_HOST=host.docker.internal
# ENV REDIS_PORT=6379

RUN corepack enable

WORKDIR /app

COPY package*.json ./

RUN pnpm install

COPY . .

EXPOSE 3000

RUN pnpm run build

CMD ["pnpm", "start:prod"]
