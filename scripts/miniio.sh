#! /bin/bash
mkdir -p ${HOME}/minio/data

docker run \
   -p 9000:9000 \
   -p 9001:9001 \
   --user $(id -u):$(id -g) \
   --name minio1 \
   -e "MINIO_ROOT_USER=idan" \
   -e "MINIO_ROOT_PASSWORD=test12345" \
   -e "MINIO_OPTS=--cors '{"CORSRules":[{"AllowedOrigins":["*"],"AllowedHeaders":["*"],"AllowedMethods":["GET","HEAD","POST","PUT","DELETE"],"MaxAgeSeconds":3000,"ExposeHeaders":["Etag"]}]}'" \
   -v ${HOME}/minio/data:/data \
   -d \
   quay.io/minio/minio server /data --console-address ":9001"