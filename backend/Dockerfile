# ============================================
# Stage 1: Build
# ============================================
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Gradle wrapper + 설정 파일 먼저 복사 (의존성 캐시)
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./

# gradlew 실행 권한
RUN chmod +x gradlew

# 의존성만 먼저 다운로드 (캐시 레이어)
RUN ./gradlew dependencies --no-daemon || true

# 소스 복사 및 빌드
COPY src src
RUN ./gradlew bootJar --no-daemon -x test

# ============================================
# Stage 2: Production (JRE only)
# ============================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# 보안: non-root 사용자
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/build/libs/*.jar app.jar

RUN chown appuser:appgroup app.jar

USER appuser

EXPOSE 8080

# Spring profile은 환경변수로 주입
ENTRYPOINT ["java", "-jar", "app.jar"]
