FROM node:14.0.0-alpine

WORKDIR /usr/src/notification-service

COPY *.json ./
COPY .env ./

RUN npm install

COPY ./src ./src

CMD npx wait-port rabbitmq:5672 && \
    npm run dev
