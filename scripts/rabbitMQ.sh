#! /bin/bash
docker run \
    -it --rm \
    --name rabbitmq \
    -p 5672:5672 -p 15672:15672 \
    -e "RABBITMQ_DEFAULT_USER=idan" \
    -e "RABBITMQ_DEFAULT_PASS=test12345" \
    -d \
    rabbitmq:3.12-management