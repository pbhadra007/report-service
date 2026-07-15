package com.ipdc.irs.gateway.filter;

import com.ipdc.irs.gateway.security.JwtClaims;
import com.ipdc.irs.gateway.security.JwtTokenValidator;
import io.jsonwebtoken.JwtException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Validates the bearer JWT on every request except the whitelisted public paths.
 * Runs after RequestLoggingFilter (order=-200) so rejections are still logged,
 * and before RateLimitFilter (order=-90) so limits can key off the authenticated user.
 */
@Slf4j
@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    public static final String JWT_CLAIMS_ATTRIBUTE = "jwtClaims";

    private static final List<String> PUBLIC_PATHS = List.of(
            "/actuator/health",
            "/actuator/prometheus",
            "/api/v1/auth/login",
            "/api/v1/auth/refresh"
    );

    private final JwtTokenValidator jwtTokenValidator;

    public JwtAuthenticationFilter(JwtTokenValidator jwtTokenValidator) {
        this.jwtTokenValidator = jwtTokenValidator;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        if (isPublicPath(path)) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return unauthorized(exchange, "Missing or malformed Authorization header");
        }

        String token = authHeader.substring(7);

        try {
            JwtClaims claims = jwtTokenValidator.validate(token);

            ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                    .header("X-User-Id", claims.getUserId())
                    .header("X-User-Roles", claims.getRoles() != null ? String.join(",", claims.getRoles()) : "")
                    .build();

            exchange.getAttributes().put(JWT_CLAIMS_ATTRIBUTE, claims);

            return chain.filter(exchange.mutate().request(mutatedRequest).build());
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("JWT validation failed for path {}: {}", path, e.getMessage());
            return unauthorized(exchange, "Invalid or expired token");
        }
    }

    private boolean isPublicPath(String path) {
        return PUBLIC_PATHS.stream().anyMatch(path::startsWith);
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);
        String body = String.format(
                "{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"%s\"}", message);
        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -100;
    }
}
