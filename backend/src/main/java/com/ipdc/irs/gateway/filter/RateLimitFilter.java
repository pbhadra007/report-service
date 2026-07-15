package com.ipdc.irs.gateway.filter;

import com.ipdc.irs.gateway.ratelimit.RateLimitService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

/**
 * Runs after JwtAuthenticationFilter (order=-100) so authenticated requests are
 * rate-limited per user rather than per IP; unauthenticated/public-path requests
 * fall back to per-IP limiting.
 */
@Slf4j
@Component
public class RateLimitFilter implements GlobalFilter, Ordered {

    private final RateLimitService rateLimitService;

    public RateLimitFilter(RateLimitService rateLimitService) {
        this.rateLimitService = rateLimitService;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String clientId = resolveClientId(exchange);

        return rateLimitService.isAllowed(clientId)
                .flatMap(allowed -> allowed ? chain.filter(exchange) : tooManyRequests(exchange));
    }

    private String resolveClientId(ServerWebExchange exchange) {
        String userId = exchange.getRequest().getHeaders().getFirst("X-User-Id");
        if (userId != null && !userId.isBlank()) {
            return "user:" + userId;
        }
        InetSocketAddress remoteAddress = exchange.getRequest().getRemoteAddress();
        String ip = remoteAddress != null && remoteAddress.getAddress() != null
                ? remoteAddress.getAddress().getHostAddress()
                : "unknown";
        return "ip:" + ip;
    }

    private Mono<Void> tooManyRequests(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        response.getHeaders().add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);
        String body = "{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Rate limit exceeded\"}";
        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -90;
    }
}
