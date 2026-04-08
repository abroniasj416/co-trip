# ============================================
# Stage 1: Build
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 캐시 최적화: package.json만 먼저 복사
COPY package.json package-lock.json* ./
RUN npm ci

# 소스 복사 및 빌드
COPY . .

# 빌드 시점 환경변수 (ARG → .env.production 오버라이드 가능)
ARG VITE_API_BASE_URL
ARG VITE_WS_BASE_URL
ARG VITE_NCP_MAP_CLIENT_ID

RUN npm run build

# ============================================
# Stage 2: Production (nginx)
# ============================================
FROM nginx:1.25-alpine

# 커스텀 nginx 설정
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 결과물 복사
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
