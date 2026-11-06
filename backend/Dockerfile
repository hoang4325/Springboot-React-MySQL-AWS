# Multi-stage build for Spring Boot Backend (Java 21)
# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /build

# Copy Maven wrapper and pom.xml first to take advantage of Docker layer caching
COPY mvnw pom.xml ./
COPY .mvn .mvn

RUN sed -i 's/\r$//' ./mvnw && chmod +x ./mvnw && ./mvnw dependency:go-offline -B

# Copy application source code
COPY src ./src

# Build the application (skip tests during container build for faster deploy)
RUN ./mvnw clean package -DskipTests

# Stage 2: Minimal JRE Runtime
FROM eclipse-temurin:21-jre-alpine

# Security: create non-root user
RUN addgroup -S spring && adduser -S spring -G spring

WORKDIR /app

# Copy the built jar from builder stage
COPY --from=builder /build/target/todo-backend-*.jar app.jar

# Change ownership to non-root user
RUN chown -R spring:spring /app

USER spring:spring

EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
