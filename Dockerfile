FROM rust:1.70.0-alpine as rust-builder
WORKDIR /app
COPY . .
RUN apk add --no-cache build-base openssl-dev pkgconfig
RUN rustup target add x86_64-unknown-linux-musl
RUN cargo build --release --target x86_64-unknown-linux-musl
RUN mv target/x86_64-unknown-linux-musl/release/set-up /app/set-up

FROM node:16-alpine as node-builder
WORKDIR /app
COPY web/package.json web/yarn.lock ./web/
RUN cd web && yarn install
COPY web/ ./web/
RUN cd web && yarn build

FROM alpine:latest
RUN apk add --no-cache bind-tools iputils iproute2 curl ca-certificates htop

WORKDIR /app

COPY --from=rust-builder /app/set-up .

COPY --from=node-builder /app/web/dist ./dist

CMD ["/app/set-up"]

