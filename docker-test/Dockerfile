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
