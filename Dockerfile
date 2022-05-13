FROM node:lts-alpine

RUN apk update
RUN apk add vim
RUN mkdir -p /home/node/app && chown node:node /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node ./package*.json ./

RUN npm ci --silent

# COPY --chown=node:node . .

USER node

# RUN node ace migration:run
# RUN node ace db:seed

EXPOSE 3111

# CMD node ace serve --watch