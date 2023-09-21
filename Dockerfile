FROM node:18-alpine AS node-builder
WORKDIR /app/web
COPY web/package.json web/yarn.lock ./
RUN yarn install
COPY web/ .
RUN yarn build

#########

FROM rustlang/rust:nightly-bookworm-slim as rust-builder
WORKDIR /app

COPY --from=node-builder /app/web/dist ./web/dist

COPY ./src ./src
COPY ./Cargo.toml ./Cargo.toml
COPY ./Cargo.lock ./Cargo.lock
COPY ./migrations ./migrations

RUN apt-get update && apt-get install -y build-essential pkg-config libssl-dev
RUN rustup target add x86_64-unknown-linux-gnu

RUN cargo build --release

RUN mv target/release/set-up /app/set-up

#########

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y  iproute2 curl ca-certificates htop
WORKDIR /app
COPY --from=rust-builder /app/set-up .
RUN mkdir /app/data
CMD ["/app/set-up"]

