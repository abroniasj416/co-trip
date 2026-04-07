package com.cotrip.ncp;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ncp")
@Getter
@Setter
public class NcpProperties {

    private String clientId;
    private String clientSecret;
}
