FROM node:14.0.0-alpine

WORKDIR /usr/src/user-service

COPY *.json ./
COPY .env ./

RUN npm install

COPY ./src ./src

CMD npm run dev
