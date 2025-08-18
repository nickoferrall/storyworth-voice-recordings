# syntax = docker/dockerfile:1

ARG NODE_VERSION=20.10.0
FROM node:${NODE_VERSION}-slim as base
LABEL fly_launch_runtime="Next.js"
WORKDIR /app
ENV NODE_ENV="production"

FROM base as build
RUN apt-get update -qq && \
    apt-get install -y build-essential pkg-config python-is-python3

# ⬇ remove --link
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

# ⬇ remove --link
COPY . .

RUN yarn run build
RUN yarn install --production=true

FROM base

# static assets & built files
COPY --from=build /app/public        /app/public
COPY --from=build /app/.next         /app/.next
COPY --from=build /app/node_modules  /app/node_modules
COPY --from=build /app/package.json  /app/package.json

# scripts & sources needed at runtime
COPY --from=build /app/src           /app/src
COPY --from=build /app/tsconfig.json /app/tsconfig.json
COPY --from=build /app/lib           /app/lib
COPY --from=build /app/utils         /app/utils

EXPOSE 3000
CMD ["yarn","run","start"]
