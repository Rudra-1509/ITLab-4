FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install

COPY backend ./backend

RUN npx prisma generate --schema=./backend/prisma/schema.prisma
RUN npm run build

EXPOSE 8002

CMD ["node", "dist/backend/services/events/src/index.js"]
