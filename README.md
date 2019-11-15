# m7011e-project
Project in course M7011E Dynamic Web Systems

Link to trello: https://trello.com/b/0BCM8HOW/m7011e-project


# Docker

## Install docker and docker compose
To insall on ubuntu use these comands.
```
    sudo apt update
    sudo apt install docker docker-compose
```

## To run docker without sudo, make a group called docker and join it with your user. 
On linux run these comands.
```
    sudo groupadd docker
    sudo usermod -aG docker $USER
```
You wil need to logout and in agin for it to update or run this comand.
```
    newgrp docker 
```

## Make docker image and start new container
Go in to the project folder.
```
    cd m7011e-project
```
Run this comand to make image.
```
    docker image build -t m7011e:1.0 .
```
Run tis comand to make new container
```
docker container run --publish 3000:3000 --detach --name m7011e m7011e:1.0
```
Now the server should be up and running in a docker conatiner on port 3000.
