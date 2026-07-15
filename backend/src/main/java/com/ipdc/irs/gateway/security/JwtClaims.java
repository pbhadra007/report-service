package com.ipdc.irs.gateway.security;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class JwtClaims {

    private String userId;
    private String username;
    private List<String> roles;
    private Instant issuedAt;
    private Instant expiresAt;
}
