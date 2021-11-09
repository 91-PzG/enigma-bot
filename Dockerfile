FROM node:lts-alpine

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /icu
RUN npm init -y && npm install full-icu
ENV NODE_ICU_DATA=/icu/node_modules/full-icu

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY ./dist ./dist
CMD ["node","dist/main"]