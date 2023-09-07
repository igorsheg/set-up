# Stage 0: Build the Node.js application
FROM node:16-alpine AS node-builder
WORKDIR /app/web
COPY web/package.json web/yarn.lock ./
RUN yarn install
COPY web/ .
RUN yarn build


FROM rust:1.70.0-alpine as rust-builder
WORKDIR /app
RUN rustup default nightly

COPY --from=node-builder /app/web/dist ./web/dist

COPY ./src ./src
COPY ./Cargo.toml ./Cargo.toml
COPY ./Cargo.lock ./Cargo.lock

RUN apk add --no-cache build-base openssl-dev pkgconfig
RUN rustup target add x86_64-unknown-linux-musl

RUN cargo build --release --target x86_64-unknown-linux-musl
RUN mv target/x86_64-unknown-linux-musl/release/set-up /app/set-up

FROM alpine:latest
RUN apk add --no-cache bind-tools iputils iproute2 curl ca-certificates htop

WORKDIR /app

COPY --from=rust-builder /app/set-up .

CMD ["/app/set-up"]
