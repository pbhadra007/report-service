package com.ipdc.irs.gateway.ratelimit;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Range;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.data.redis.core.ReactiveZSetOperations;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

/**
 * Redis-backed sliding window rate limiter. Each client key (e.g. "ip:1.2.3.4" or
 * "user:{userId}") maps to a ZSET of request timestamps; requests outside the
 * window are trimmed before counting, so the limit always reflects the last
 * {@code windowSeconds} rather than a fixed bucket.
 */
@Slf4j
@Service
public class RateLimitService {

    private final ReactiveStringRedisTemplate redisTemplate;

    @Value("${ratelimit.capacity:100}")
    private int capacity;

    @Value("${ratelimit.window-seconds:60}")
    private long windowSeconds;

    public RateLimitService(ReactiveStringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public Mono<Boolean> isAllowed(String clientId) {
        String key = "ratelimit:" + clientId;
        ReactiveZSetOperations<String, String> zSetOps = redisTemplate.opsForZSet();

        long now = Instant.now().toEpochMilli();
        long windowStart = now - (windowSeconds * 1000);
        String member = now + ":" + UUID.randomUUID();

        return zSetOps.removeRangeByScore(key, Range.closed((double) Long.MIN_VALUE, (double) windowStart))
                .then(zSetOps.add(key, member, now))
                .then(redisTemplate.expire(key, Duration.ofSeconds(windowSeconds)))
                .then(zSetOps.count(key, Range.closed((double) windowStart, (double) now)))
                .map(count -> count != null && count <= capacity)
                .doOnNext(allowed -> {
                    if (!allowed) {
                        log.debug("Rate limit exceeded for client: {}", clientId);
                    }
                });
    }
}
