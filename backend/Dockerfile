# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -q clean package -DskipTests

# ---- Runtime stage ----
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# curl is needed for the container HEALTHCHECK / compose healthcheck below
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -r irs && useradd -r -g irs -d /app -s /usr/sbin/nologin irs \
    && mkdir -p /app/logs \
    && chown -R irs:irs /app

COPY --from=build /workspace/target/irs-api-gateway.jar /app/app.jar

USER irs

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
