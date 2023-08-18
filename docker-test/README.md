# Fresh project

Your new Fresh project is ready to go. You can follow the Fresh "Getting
Started" guide here: https://fresh.deno.dev/docs/getting-started

### Usage

Make sure to install Deno: https://deno.land/manual/getting_started/installation

Then start the project:

```
deno task start
```

This will watch the project directory and restart as necessary.

# Docker
### Build
```Dockerfile
FROM ubuntu:22.04

WORKDIR /var/deno
COPY . /var/deno

RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get -y install curl unzip
RUN curl -fsSL https://deno.land/x/install/install.sh | sh

ENV DENO_INSTALL "/root/.deno"
ENV PATH $DENO_INSTALL/bin:$PATH

EXPOSE 8000

CMD ["deno", "task", "start"]
```

```
$ docker pull ubuntu:20.04
20.04: Pulling from library/ubuntu
edaedc954fb5: Pull complete
Digest: sha256:33a5cc25d22c45900796a1aca487ad7a7cb09f09ea00b779e3b2026b4fc2faba
Status: Downloaded newer image for ubuntu:20.04
docker.io/library/ubuntu:20.04

$ docker build -t fresh-test .
...
Successfully built c70d75f763d6
Successfully tagged fresh-test:latest

$ docker images
REPOSITORY   TAG       IMAGE ID       CREATED              SIZE
fresh-test   latest    c70d75f763d6   About a minute ago   246MB
ubuntu       22.04     01f29b872827   13 days ago          77.8MB
ubuntu       20.04     6df894023726   2 weeks ago          72.8MB

```

### Run

```
$ docker run -p 8000:8000 --name fresh-test -it fresh-test

$ docker ps -a
CONTAINER ID  IMAGE       COMMAND            CREATED         STATUS         PORTS                                      NAMES
22a739a07a52  fresh-test  "deno task start"  44 seconds ago  Up 43 seconds  0.0.0.0:8000->8000/tcp, :::8000->8000/tcp  inspiring_swanson
```

### Remove Container and Images
```
$ docker rm $(docker ps -aq)
$ docker rmi $(docker images -q)
```
