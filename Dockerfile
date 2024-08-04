FROM node:18-alpine AS node-builder
WORKDIR /app/web
RUN npm install -g pnpm
COPY web/package.json web/pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile
COPY web/ .
RUN pnpm build

#########
FROM rust:1.72.1-slim as rust-builder
WORKDIR /app
COPY --from=node-builder /app/web/dist ./web/dist
COPY ./src ./src
COPY ./Cargo.toml ./Cargo.toml
COPY ./Cargo.lock ./Cargo.lock
RUN cargo build --release
RUN mv target/release/set-up /app/set-up

#########
FROM gcr.io/distroless/cc-debian12
WORKDIR /app
COPY --from=rust-builder /app/set-up .
ENTRYPOINT ["/app/set-up"]
