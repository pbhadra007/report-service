package com.ipdc.irs.gateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Validates JWTs issued by the IRS user-service using a shared HMAC secret.
 * Throws the underlying JJWT exception (ExpiredJwtException, SignatureException,
 * MalformedJwtException, etc.) on failure so callers can distinguish failure reasons.
 */
@Slf4j
@Component
public class JwtTokenValidator {

    private final SecretKey signingKey;

    public JwtTokenValidator(@Value("${jwt.secret}") String secret) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    @SuppressWarnings("unchecked")
    public JwtClaims validate(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return JwtClaims.builder()
                .userId(claims.getSubject())
                .username(claims.get("username", String.class))
                .roles((List<String>) claims.get("roles", List.class))
                .issuedAt(claims.getIssuedAt() != null ? claims.getIssuedAt().toInstant() : null)
                .expiresAt(claims.getExpiration() != null ? claims.getExpiration().toInstant() : null)
                .build();
    }
}
