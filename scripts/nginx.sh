sudo docker run \
    -d --name nginx-reverse-proxy2 \
    -p 80:80 \
    nginx:latest

sudo docker cp ./default.conf nginx-reverse-proxy2:/etc/nginx/conf.d/
sudo docker exec nginx-reverse-proxy2 nginx -s reload