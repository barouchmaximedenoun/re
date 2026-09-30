FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY nx.json ./
COPY tsconfig.json ./
COPY tsconfig.base.json ./
COPY eslint.config.mjs ./

COPY apps/web ./apps/web
COPY libs ./libs

RUN pnpm install --frozen-lockfile

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# ENV NX_SKIP_SYNC=true pas sur que ce soit reconnu
RUN pnpm nx sync && pnpm nx build web

EXPOSE 3000

#CMD ["pnpm", "nx", "serve", "web", "--host", "0.0.0.0", "--port", "3000"]
WORKDIR /app/apps/web
CMD ["pnpm", "exec", "next", "start", "-H", "0.0.0.0", "-p", "3000"]