FROM node:alpine

ENV APP_HOME /app
ENV PUBLIC_PATH /${APP_HOME}/public
ENV SERVER_PATH /${APP_HOME}/server
ENV NODE_MODULES_PATH /${APP_HOME}/node_modules

COPY public/ ${PUBLIC_PATH}
COPY server/ ${SERVER_PATH}
COPY node_modules/ ${NODE_MODULES_PATH}

WORKDIR ${APP_HOME}

EXPOSE 8080
CMD node server/start.js
