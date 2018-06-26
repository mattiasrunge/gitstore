FROM node:10-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache --virtual=build-dependencies git openssh-client

COPY . .

RUN npm install --only=production && cd client && npm install --only=production

CMD [ "npm", "start" ]
