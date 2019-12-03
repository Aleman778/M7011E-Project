# m7011e-project
Project in course M7011E Dynamic Web Systems

Link to Trello: https://trello.com/b/0BCM8HOW/m7011e-project


# Docker

## Install docker and docker compose
To install on ubuntu run these comands.
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
You will need to logout and in again for it to update or run this comand.
```
    newgrp docker 
```

## Make docker image and start new containers.
Go in to the project folder.
```
    cd m7011e-project
```
Then run this comand.
```
    docker-compose -f docker-compose.yml up --build
```
Now the whole application should be running with all the diffrent services in diffrent containers.

## Environment variables.
Make a file called `.env` and set these variables to a desired value.
```
    PG_USER=
    PG_PASSWORD=
    PG_DB=
    PG_TABLE_WIND=
    PG_TABLE_PROSUMER=
```
