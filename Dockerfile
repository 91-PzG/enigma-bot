FROM node:12.22.7-alpine As development

WORKDIR /usr/src/enigma
COPY package*.json ./
RUN npm install rimraf -g
RUN npm install 
COPY . .
RUN npm run build

FROM node:12.22.7-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/enigma

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /usr/src/enigma/dist ./dist

CMD [ "npm", "run", "pm2" ]