#! /bin/bash
docker run \
   -p 5432:5432 \
   --name pg_local \
   -e "POSTGRES_DB=video" \
   -e "POSTGRES_USER=video" \
   -e "POSTGRES_PASSWORD=test12345" \
   -v pgdata:/var/lib/postgresql/data \
   -d \
   postgres \