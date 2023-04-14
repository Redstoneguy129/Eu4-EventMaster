FROM node:16

ENV DISCORD_TOKEN ""
ENV POSTGRES_USERNAME ""
ENV POSTGRES_PASSWORD ""
ENV POSTGRES_URL ""
ENV POSTGRES_DB ""

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "run", "start"]