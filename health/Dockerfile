FROM node:23

WORKDIR /app

COPY my-project/package*.json ./my-project/
RUN npm install --prefix my-project

COPY my-project/client/package*.json ./my-project/client/
RUN npm install --prefix my-project/client

COPY my-project/client ./my-project/client

RUN npm run build --prefix my-project/client

COPY my-project ./my-project

RUN cp -r /app/my-project/client/build /app/my-project/public

EXPOSE 8080

CMD ["node", "my-project/server.js"]
