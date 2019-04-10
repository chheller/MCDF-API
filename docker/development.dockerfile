FROM mhart/alpine-node:10
RUN apk update && apk --no-cache add --virtual builds-deps build-base python
VOLUME ["/opt/mcdf/api"]
WORKDIR /opt/mcdf/api

COPY ./package.json /opt/mcdf/api

CMD ["yarn", "start:dev"]