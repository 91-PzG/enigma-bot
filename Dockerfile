FROM node:lts-alpine

# Adds environment variables
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Sets the timezone
ARG TZ='Europe/Berlin'

ENV DEFAULT_TZ ${TZ}

RUN apk upgrade --update \
  && apk add -U tzdata \
  && cp /usr/share/zoneinfo/${DEFAULT_TZ} /etc/localtime \
  && apk del tzdata \
  && rm -rf \
  /var/cache/apk/*


#Adds ICU (Localisation)
WORKDIR /icu
RUN npm init -y && npm install full-icu
ENV NODE_ICU_DATA=/icu/node_modules/full-icu

# Set up for the actual program
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY ./dist ./dist

# Starts the bot
CMD ["node","dist/main"]