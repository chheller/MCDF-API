FROM mhart/alpine-node:10
RUN apk update && apk --no-cache add --virtual builds-deps build-base python
VOLUME ["/opt/stator"]
WORKDIR /opt/stator

COPY ./package.json /opt/stator

CMD ["yarn", "start:dev"]