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
RUN npm run build


FROM nginx:alpine AS builder

# nginx:alpine contains NGINX_VERSION environment variable, like so:
# ENV NGINX_VERSION 1.15.0

# Add-on module version
# ENV NCHAN_VERSION 1.1.15

# Download sources
# download module here:
# check: https://gist.github.com/hermanbanken/96f0ff298c162a522ddbba44cad31081
# RUN wget "https://github.com/slact/nchan/archive/v${NCHAN_VERSION}.tar.gz" -O nchan.tar.gz

# For latest build deps, see https://github.com/nginxinc/docker-nginx/blob/master/mainline/alpine/Dockerfile
WORKDIR /root/

# check: https://www.sobyte.net/post/2022-04/docker-nginx-brotli/
RUN apk add  --update --no-cache --virtual .build-deps \
  gcc \
  libc-dev \
  make \
  openssl \
  pcre-dev \
  zlib-dev \
  linux-headers \
  curl \
  gnupg \
  libxslt-dev \
  gd-dev \
  geoip-dev \
  build-base \
  git \
  && wget http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz \
  && tar zxf nginx-${NGINX_VERSION}.tar.gz \
  && git clone https://github.com/google/ngx_brotli.git \
  && cd ngx_brotli \
  && git submodule update --init --recursive \
  && cd ../nginx-${NGINX_VERSION} \
  && ./configure \
  --add-dynamic-module=../ngx_brotli \
  --with-http_gzip_static_module \
  --with-compat \
  && make modules

FROM nginx:alpine as server
# Extract the dynamic module
COPY --from=builder /root/nginx-${NGINX_VERSION}/objs/ngx_http_brotli_filter_module.so /usr/local/nginx/modules/ngx_http_brotli_filter_module.so
COPY --from=builder /root/nginx-${NGINX_VERSION}/objs/ngx_http_brotli_static_module.so /usr/local/nginx/modules/ngx_http_brotli_static_module.so

COPY --from=runner /var/www/app/dist /var/www/app/dist

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]