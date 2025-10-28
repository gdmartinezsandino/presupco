<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>

## Overview

This service powers the Presupco Platform, handling:

- Authentication and user management

- Mailing and activation flows

- Redis caching

- MongoDB persistence

- Real-time support (WebSockets-ready)

It supports both local development and Dockerized production environments.

## Environments

### Local Development (Recommended)

For day-to-day work, use the local environment without Docker, except for Redis.

You would need to have a file with env variables for development environment.

Duplicate `config/env/example.env` to `config/env/development.env` this will be the file that we will use in development mode, and looks like this:

```bash
APP_NAME=presupco
APP_URL=http://presupco.io

SERVER_PORT=3000
JWT_SECRET=jwt-secret
JWT_EXPIRES_IN=1h

WEBAPP_DOMAIN=webapp
WEBAPP_PORT=4200
WEBAPP_URL=http://webapp:4200

# Mongo Config
MONGO_HOST=localhost
MONGO_PORT=27017
MONGODB_URI=mongodb://localhost:27017/presupco

# Redis Config
REDIS_HOST=localhost
REDIS_PORT=6379

# Mailing Config
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=
MAIL_FROM=no-reply@presupco.io

```

Then, start the `server` using:

```bash
../scripts/dev.sh
```

### Production Environment (Docker)

Use the included docker-compose.yml to build and deploy the entire stack:

- Server (NestJS)
- MongoDB
- Redis

You can automate everything using:

```bash
../scripts/prod.sh
```

This script:

- Exports environment variables for Docker
- Builds the images using the correct Dockerfile
- Starts all containers in detached mode (-d)

Once running:

- API: http://localhost:3000/api/v1
- MongoDB: Accessible internally as mongo:27017
- Redis: Accessible internally as redis:6379
