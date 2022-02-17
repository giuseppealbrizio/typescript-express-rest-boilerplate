FROM node:16-alpine as base

WORKDIR /usr/src/app
EXPOSE 3000

FROM base as builder
COPY ["package.json", "package-lock.json*", "./"]
RUN npm ci --only-production
COPY ./src ./src
RUN npm run build
RUN npm prune --production

FROM base as release
ENV NODE_ENV=production
USER node
COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist
COPY --chown=node:node . /usr/src/app
CMD ["node", "./dist/bin/server"]
