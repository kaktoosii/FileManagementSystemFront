
FROM node:lts-alpine3.19 AS build

WORKDIR /app

COPY ./package.json ./
COPY ./yarn.lock ./

RUN yarn

COPY . .

RUN yarn build

FROM nginx:1.24-alpine

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/shop/browser /usr/share/nginx/html

EXPOSE 80
