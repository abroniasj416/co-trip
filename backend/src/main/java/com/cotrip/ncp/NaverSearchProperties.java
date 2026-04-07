package com.cotrip.ncp;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "naver-search")
@Getter
@Setter
public class NaverSearchProperties {

    private String clientId;
    private String clientSecret;
}
