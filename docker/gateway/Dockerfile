# --- Stage 1: production dependencies ---
FROM node:22-alpine AS installer

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

COPY apps/gateway/dist/package.json apps/gateway/dist/pnpm-lock.yaml ./

# pnpm 10: autorise explicitement le build natif de bcrypt
RUN printf "allowBuilds:\n  bcrypt: true\n" > pnpm-workspace.yaml

RUN pnpm install --prod --frozen-lockfile

# --- Stage 2: runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=installer /app/node_modules ./node_modules

COPY apps/gateway/dist/main.js ./

EXPOSE 8000

CMD ["node", "main.js"]

#RUN pnpm nx build api

#CMD ["node", "dist/apps/api/main.js"]
