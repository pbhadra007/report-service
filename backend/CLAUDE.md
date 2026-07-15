Read CLAUDE.md carefully — you are building the IRS API Gateway 
as specified by the Software Architect.

Create the complete Maven project structure exactly as defined:

1. pom.xml — copy exactly from CLAUDE.md
   Spring Boot 3.2.5, Spring Cloud Gateway, Redis Reactive,
   JJWT 0.12.5, Eureka Client, Actuator, Prometheus, Lombok

2. src/main/java/com/ipdc/irs/gateway/
   IrsApiGatewayApplication.java        (main class)
   security/JwtClaims.java              (Lombok @Data @Builder)
   security/JwtTokenValidator.java      (JJWT validation)
   filter/JwtAuthenticationFilter.java  (GlobalFilter order=-100)
   filter/RateLimitFilter.java          (GlobalFilter order=-90)
   filter/RequestLoggingFilter.java     (GlobalFilter order=-200)
   ratelimit/RateLimitService.java      (Redis sliding window)
   config/RedisConfig.java
   config/SecurityConfig.java
   exception/GatewayExceptionHandler.java

3. src/main/resources/
   application.yml       (base config with all routes)
   application-dev.yml   (localhost URLs, no Eureka, debug logs)
   application-prod.yml  (env vars, SSL, WARN logging)

4. Dockerfile (multi-stage, eclipse-temurin:17, non-root user)

5. docker-compose.yml
   Services: redis, zookeeper, kafka, eureka, api-gateway
   With healthchecks and correct depends_on

After creating all files:
  mvn clean package -DskipTests
  Fix any compilation errors.
  
Then run:
  docker-compose up redis eureka -d
  mvn spring-boot:run -Dspring.profiles.active=dev

Verify:
  curl http://localhost:8080/actuator/health
  → should return {"status":"UP"}