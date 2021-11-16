FROM node:lts-alpine

# Adds environment variables
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Sets the timezone
RUN apk add --no-cache tzdata
ENV TZ Europe/Berlin

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