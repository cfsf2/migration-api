FROM node:lts-alpine

RUN mkdir -p /home/node/app/node_modules

WORKDIR /home/node/app

COPY package.json yarn.* ./

RUN apk add --no-cache git

COPY . /home/node/app/

RUN chown -R node:node /home/node

RUN yarn

RUN yarn add mysql

USER node


# RUN node ace migration:run
# RUN node ace db:seed

EXPOSE 3001

ENTRYPOINT ["node","ace","serve","--watch"]
