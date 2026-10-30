FROM node:24-bookworm-slim AS dependencies

WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/mobile/package.json apps/mobile/package.json
COPY packages/contracts/package.json packages/contracts/package.json
RUN npm ci

FROM dependencies AS web-build

ARG EXPO_PUBLIC_API_URL=/api
ARG EXPO_PUBLIC_REPORT_EMAIL=
ARG EXPO_PUBLIC_OPERATOR_NAME=
ARG EXPO_PUBLIC_PRIVACY_URL=
ARG EXPO_PUBLIC_TERMS_URL=
ARG EXPO_PUBLIC_SUPPORT_URL=
ENV EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL}
ENV EXPO_PUBLIC_REPORT_EMAIL=${EXPO_PUBLIC_REPORT_EMAIL}
ENV EXPO_PUBLIC_OPERATOR_NAME=${EXPO_PUBLIC_OPERATOR_NAME}
ENV EXPO_PUBLIC_PRIVACY_URL=${EXPO_PUBLIC_PRIVACY_URL}
ENV EXPO_PUBLIC_TERMS_URL=${EXPO_PUBLIC_TERMS_URL}
ENV EXPO_PUBLIC_SUPPORT_URL=${EXPO_PUBLIC_SUPPORT_URL}

COPY packages/contracts packages/contracts
COPY apps/mobile apps/mobile
RUN npm run build --workspace @elbero/contracts \
  && cd apps/mobile \
  && npx expo export --platform web --output-dir /app/web-dist

FROM nginx:1.27-alpine AS web

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=web-build /app/web-dist /usr/share/nginx/html
EXPOSE 80

FROM dependencies AS metro

ENV CI=1
WORKDIR /app
COPY packages/contracts packages/contracts
COPY apps/mobile apps/mobile
RUN npm run build --workspace @elbero/contracts
WORKDIR /app/apps/mobile
EXPOSE 8081
CMD ["npx", "expo", "start", "--lan", "--port", "8081"]
