# ============================
# Base
# ============================
ARG NODE_VERSION
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
COPY package.json ./
RUN yarn install

# ============================
# Build
# ============================
FROM base AS build
WORKDIR /app
COPY . .
RUN yarn build

# ============================
# Production
# ============================
FROM base AS production
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
RUN yarn install --production
COPY config/env ./config/env
EXPOSE 3000
CMD ["yarn", "start:prod"]
