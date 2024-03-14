Start nginx service
```
sudo docker run -d --name nginx-reverse-proxy -p 80:80 nginx:latest
```

copy configuration
```
sudo docker cp ./default.conf nginx-reverse-proxy:/etc/nginx/conf.d/
```

test configuration
```
sudo docker exec nginx-reverse-proxy nginx -t
```

reload nginx process
```
sudo docker exec nginx-reverse-proxy nginx -s reload
```