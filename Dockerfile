# syntax=docker/dockerfile:1

ARG NODE_VERSION=24
FROM node:${NODE_VERSION}-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
# pnpm comes from the "packageManager" field in package.json.
RUN corepack enable
WORKDIR /app

# Dependencies change far less often than source, so they get their own layer.
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Validates /content and prerenders every page. Needs network once, for the
# Google Fonts that next/font downloads at build time.
FROM base AS build
# Canonical origin baked into canonical URLs, the sitemap and share images.
ARG SITE_URL=http://localhost:3000
ENV NEXT_STANDALONE=1 \
    SITE_URL=${SITE_URL}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:${NODE_VERSION}-slim AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
WORKDIR /app

COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
# Standalone output leaves public/ out, so the static icons would 404.
COPY --from=build --chown=node:node /app/public ./public
# Standalone tracing cannot see this directory (its path is built at runtime),
# but the server reads it to resolve URLs, so it must be copied explicitly.
COPY --from=build --chown=node:node /app/content ./content

USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
CMD ["node", "server.js"]
