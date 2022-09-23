FROM node:16.17-alpine AS deps
ARG PROJECT_PATH

WORKDIR /var/www/app
COPY ${PROJECT_PATH}/package.json ./
RUN npm install


FROM node:16.17-alpine AS runner
ARG PROJECT_PATH

COPY ${PROJECT_PATH} /var/www/app/src
COPY --from=deps /var/www/app/node_modules /var/www/app/src/node_modules
WORKDIR /var/www/app/src

CMD ["npm", "run", "build:dev"]
