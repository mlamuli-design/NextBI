
FROM node:22.15.0

WORKDIR /app

COPY package.json .

COPY . .

RUN npm install 

RUN npm run build 

EXPOSE 3000

CMD ["npm", "run", "start"]
