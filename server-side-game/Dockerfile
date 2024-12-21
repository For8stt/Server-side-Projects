# Docker
# Yulian Kisil

FROM node:lts

WORKDIR /app

COPY package.json /app/
RUN npm install

COPY . .

EXPOSE 8080
EXPOSE 8082


CMD ["npm", "start"]
