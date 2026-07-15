package com.ipdc.irs.gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Runs first (order=-200, before auth/rate-limit) so every request — including
 * rejected ones — gets a correlation ID and an access log entry.
 */
@Slf4j
@Component
public class RequestLoggingFilter implements GlobalFilter, Ordered {

    public static final String CORRELATION_ID_HEADER = "X-Correlation-Id";
    public static final String CORRELATION_ID_ATTRIBUTE = "correlationId";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        String correlationId = request.getHeaders().getFirst(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
        }
        String finalCorrelationId = correlationId;

        ServerHttpRequest mutatedRequest = request.mutate()
                .header(CORRELATION_ID_HEADER, finalCorrelationId)
                .build();
        exchange.getAttributes().put(CORRELATION_ID_ATTRIBUTE, finalCorrelationId);

        long startTime = System.currentTimeMillis();
        log.info("[{}] --> {} {}", finalCorrelationId, request.getMethod(), request.getURI());

        ServerWebExchange mutatedExchange = exchange.mutate().request(mutatedRequest).build();

        return chain.filter(mutatedExchange)
                .doOnSuccess(v -> logCompletion(mutatedExchange, finalCorrelationId, startTime))
                .doOnError(err -> log.error("[{}] <-- {} {} failed after {}ms: {}",
                        finalCorrelationId, request.getMethod(), request.getURI(),
                        System.currentTimeMillis() - startTime, err.getMessage()));
    }

    private void logCompletion(ServerWebExchange exchange, String correlationId, long startTime) {
        long duration = System.currentTimeMillis() - startTime;
        int status = exchange.getResponse().getStatusCode() != null
                ? exchange.getResponse().getStatusCode().value()
                : 0;
        log.info("[{}] <-- {} ({}ms)", correlationId, status, duration);
    }

    @Override
    public int getOrder() {
        return -200;
    }
}
