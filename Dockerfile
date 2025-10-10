# builder
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# runner
FROM node:18-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm install --omit=dev

COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/migrations ./migrations
COPY --from=builder /usr/src/app/.env.production ./.env.production
COPY --from=builder /usr/src/app/.env.example ./.env.example

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

CMD [ "npm", "start" ]