package com.cotrip.auth.jwt;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "jwt")
@Getter
@Setter
public class JwtProperties {

    /** HMAC-SHA256 서명용 Base64 인코딩 시크릿 키 */
    private String secret;

    /** Access Token 유효 기간 (밀리초) */
    private long expirationMs;
}
