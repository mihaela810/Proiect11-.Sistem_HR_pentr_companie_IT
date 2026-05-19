FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

ENV CHOKIDAR_USEPOLLING=true
ENV WDS_SOCKET_PORT=0
ENV HOST=0.0.0.0
ENV PORT=3001

EXPOSE 3001

CMD ["npm", "start"]