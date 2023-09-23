FROM node:18-alpine AS node-builder
WORKDIR /app/web
COPY web/package.json web/yarn.lock ./
RUN yarn install
COPY web/ .
RUN yarn build

#########

FROM rust:1.72.1-slim as rust-builder
WORKDIR /app

COPY --from=node-builder /app/web/dist ./web/dist

COPY ./src ./src
COPY ./Cargo.toml ./Cargo.toml
COPY ./Cargo.lock ./Cargo.lock
COPY ./migrations ./migrations

RUN cargo build --release

RUN mv target/release/set-up /app/set-up

#########

FROM gcr.io/distroless/cc-debian12

WORKDIR /app
COPY --from=rust-builder /app/set-up .
ENTRYPOINT ["/app/set-up"]

