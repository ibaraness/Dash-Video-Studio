#! /bin/bash
docker run \
   -p 6379:6379 \
   --name redis_local \
   -d \
   redis:7.2.4 \