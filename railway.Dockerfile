ARG NODE_VERSION=20.11.0
FROM node:${NODE_VERSION}-alpine AS base

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm@10
ARG TURBO_MAJOR_VERSION=2
# RUN npm install -g turbo@^${TURBO_MAJOR_VERSION}
COPY . .
# RUN turbo prune api --docker

FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm@10
WORKDIR /app
COPY --from=builder /app ./
RUN pnpm install --frozen-lockfile
RUN pnpm prisma generate --schema ./prisma/schema.prisma
RUN pnpm build



FROM base AS packager
WORKDIR /app

# copy root workspace files
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/package.json ./package.json



# copy api application files
COPY --from=installer /app/dist ./dist
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/package.json ./package.json
COPY --from=installer /app/prisma ./prisma

ENV NODE_ENV=production
RUN npm install -g pnpm@10
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs
EXPOSE 8080

CMD ["pnpm", "start"]