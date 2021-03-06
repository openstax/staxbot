FROM node:8.9.4-alpine

# These packages will seldom change so we run these first to cache them.
RUN apk update && \
    apk upgrade && \
    apk add git

WORKDIR /app

# Cache the node_modules directory.
COPY package*.json yarn.lock ./

RUN yarn

COPY . ./
