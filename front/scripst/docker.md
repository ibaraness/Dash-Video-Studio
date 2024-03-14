Build the front docker image
```
docker build -t react-nginx-app .  
```

Run the docker image
```
docker run --name react-nginx-app -p 8080:80 -d react-nginx-app
```

