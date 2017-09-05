
FROM node:alpine

ENV APP_HOME /app
WORKDIR ${APP_HOME}

RUN npm install
RUN npm run build

EXPOSE 8080
CMD npm run start
