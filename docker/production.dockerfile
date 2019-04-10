FROM mhart/alpine-node:10
RUN apk update && apk --no-cache add --virtual builds-deps build-base python
VOLUME ["/opt/mcdf/api"]
WORKDIR /opt/mcdf/api

COPY ./package.json /opt/mcdf/api
COPY dist /opt/mcdf/api/dist
COPY node_modules /opt/mcdf/api/node_modules

CMD ["yarn", "start"]`