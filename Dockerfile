# Download all missing dependencies (Buster-specific)
FROM node:16-buster-slim AS deps-env
RUN cd /tmp
RUN apt update && apt install -y curl
RUN curl -L -O https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6-1/wkhtmltox_0.12.6-1.buster_amd64.deb
RUN apt download libjpeg62-turbo libpng16-16 libxrender1 libfontconfig1 libfreetype6 libxext6 libx11-6 && \
  apt download fontconfig-config libexpat1 libxcb1 && \
  apt download libxau6 libxdmcp6 && \
  apt download libbsd0 libssl1.1
RUN mkdir /dpkg && for deb in *.deb; do dpkg --extract $deb /dpkg || exit 10; done

# Build stage
FROM node:16-buster-slim AS build-env
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
FROM node:16-buster-slim
COPY --from=deps-env /dpkg /
USER node
WORKDIR /app
COPY --from=build-env /app/node_modules ./node_modules
COPY --from=build-env /app/build ./build
COPY fonts ./fonts

# Deploy
ENV NODE_ENV="production" PORT=4005
EXPOSE ${PORT}
CMD ["node", "build/src/server.js"]
