# Fincra Converter Service

## Running the app

### On Server with Docker running the backing services

```bash
pnpm install
touch .env # Create a .env file at the root of your project. This env is used solely for managing Prisma
echo DATABASE_URL="postgres://postgres:postgres@localhost:5432/bloomers-backend-new?schema=public" >> .env # add DATABASE_URL to the .env
echo NODE_ENV="development" >> .env # add NODE_ENV to the .env
cp sample.env development.env # copy sample env to development.env
docker compose --profile backing_service up --detach # Start up the backing services using docker
pnpm prisma:migrate:dev # Run migrate command to apply migrations
pnpm prisma:seed:dev # Run seed script to seed the database
pnpm start:dev # Run development server in watch mode.
```

### Everything on Docker

```bash
touch .env # Create a .env file at the root of your project. This env is used solely for managing Prisma
echo DATABASE_URL="postgres://postgres:postgres@postgres:5432/bloomers-backend-new?schema=public" >> .env # add DATABASE_URL to the .env
echo NODE_ENV="development" >> .env # add NODE_ENV to the .env
cp sample.env development.env # copy sample env to development.env
docker compose --profile backing_service --profile backend up # Start up the backing services using docker
```

## Documentation

The local documentation can be found [here](http://localhost:8080/swagger)

## Local Email Trap

The local email trap can be found [here](http://localhost:8025)

## Usage

### Local Demo Account

```toml
role = HospitalAdmin
username = samson@test.com
password = sam-pass
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```
