package com.middle.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class OdsayConfig {

    // ODsay는 인증을 헤더가 아니라 apiKey 쿼리 파라미터로 받음 → baseUrl만 설정.
    @Bean
    public RestClient odsayRestClient(@Value("${odsay.api.base-url}") String baseUrl) {
        return RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }
}
