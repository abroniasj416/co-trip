package com.cotrip;

import com.cotrip.auth.jwt.JwtProperties;
import com.cotrip.ncp.NaverSearchProperties;
import com.cotrip.ncp.NcpProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableConfigurationProperties({JwtProperties.class, NcpProperties.class, NaverSearchProperties.class})
@EnableJpaAuditing
public class CotripApplication {

    public static void main(String[] args) {
        SpringApplication.run(CotripApplication.class, args);
    }
}
