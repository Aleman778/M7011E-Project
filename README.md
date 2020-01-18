# m7011e-project
Project in course M7011E Dynamic Web Systems

Link to demo running on free tier EC2: http://18.212.168.216

Link to Trello: https://trello.com/b/0BCM8HOW/m7011e-project

## Architecture
![Architecture](https://github.com/Aleman778/m7011e-project/blob/master/Architecture2.png)

## Docker

### Install docker and docker compose
To install on ubuntu run these comands.
```
    sudo apt update
    sudo apt install docker docker-compose
```

### To run docker without sudo, make a group called docker and join it with your user. 
On linux run these comands.
```
    sudo groupadd docker
    sudo usermod -aG docker $USER
```
You will need to logout and in again for it to update or run this comand.
```
    newgrp docker 
```

### Make docker image and start new containers.
Go in to the project folder.
```
    cd m7011e-project
```
Then run this comand.
```
    docker-compose -f docker-compose.yml up --build
```
Now the whole application should be running with all the diffrent
services in diffrent containers. This runs the containers in develop
mode. Note that `-f docker-compose.yml` can be elided from the command
above since this is the default filename for  docker compose files.

### Start the project in production mode
Simply run this command instead of the above
```
    docker-compose -f production.yml up --build
```

### Manual setup for postgres database on Windows
The automatic initialization script does not work on Windows.
Here is a workaround to manually run the `setup.sh` script in the docker container.
Make sure that the container is running by running `docker-compose up` first.
```
    docker exec -it m7011e-project_db_1 /bin/bash /docker-entrypoint-initdb.d/setup.sh
```

### Migrating the database
You can now migrate the database i.e. drop all tables and recreate. This is useful if you want to quickly clean the data or want to make changes to the table schema. Note that all tables are dropped so this should not included in production versions.
```
    docker exec -it m7011e-project_db_1 /bin/bash /usr/src/db/migrate.sh
```

### Environment variables.
Make a file called `.env` and set these variables to a desired value.
It is recommended to create a safe random secret e.g. using LastPass password generator.
```
    PG_USER=
    PG_PASSWORD=
    CLIMATE_PASSWORD=
    ELECTRICITY_GRID_PASSWORD=
    WS_PRIVATE_KEY= e.g. "myprivatekey"
    WS_SESSION_SECRET= e.g. "keyboard cat"
```
