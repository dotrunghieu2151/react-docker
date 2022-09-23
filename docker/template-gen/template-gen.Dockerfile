FROM node:16-alpine AS deps

WORKDIR /var/www/app/template-gen
COPY ./docker/template-gen/src/package.json ./package.json
RUN yarn install


FROM node:16-alpine as runner
LABEL maintainer="hieu.do@kiaisoft.com"

WORKDIR /var/www/app/template-gen

COPY --from=deps /var/www/app/template-gen/node_modules ./src/node_modules

EXPOSE ${APP_PORT}

WORKDIR /var/www/app/template-gen/src

CMD ["npm", "run", "render-nginx-config"]