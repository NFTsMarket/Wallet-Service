FROM node:12-alpine

RUN mkdir -p /app
WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

EXPOSE 3001

CMD npm start