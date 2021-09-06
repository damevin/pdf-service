# Prepare
FROM node:14-bullseye-slim AS build-env
WORKDIR /app
COPY .npmrc ./
COPY tsconfig.json ./
COPY package*.json ./
RUN npm ci

# Build
COPY src ./src
RUN npm run build
RUN npm ci --production

# Package
FROM node:14-bullseye-slim
USER node
WORKDIR /app
COPY --chown=node --from=build-env /app/node_modules ./node_modules
COPY --chown=node --from=build-env /app/build ./build

# Deploy
ENV NODE_ENV="production" PORT=4005
EXPOSE ${PORT}
CMD ["node", "build/src/server.js"]
