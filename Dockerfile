
FROM node:alpine AS base

ENV APP_HOME /app
ENV PUBLIC_PATH /${APP_HOME}/public
ENV SERVER_PATH /${APP_HOME}/server
ENV PACKAGE_JSON_PATH /${APP_HOME}/package.json
WORKDIR ${APP_HOME}

# build bundles & run tests
FROM base AS dependencies
COPY . .
RUN npm install
RUN npm run build

# copy runnable code, bundles and package.json
FROM base AS release
COPY --from=dependencies ${PUBLIC_PATH} ${PUBLIC_PATH}
COPY --from=dependencies ${SERVER_PATH} ${SERVER_PATH}
COPY --from=dependencies ${PACKAGE_JSON_PATH} ${PACKAGE_JSON_PATH}
RUN npm install --only=prod

EXPOSE 8080
CMD npm run start