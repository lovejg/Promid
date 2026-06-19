package com.middle.backend.service;

import com.middle.backend.domain.Coordinate;
import com.middle.backend.dto.odsay.OdsayPathResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@RequiredArgsConstructor
public class TransitService {
    private final RestClient odsayRestClient;

    @Value("${odsay.api-key}")
    private String apiKey;

    // 두 좌표 간 대중교통 최소 소요시간(분 단위)
    public int transitMinutes(Coordinate from, Coordinate to) {
        OdsayPathResponse res = odsayRestClient.get().uri(b -> b
                        .path("/searchPubTransPathT")
                        .queryParam("SX", from.lng())   // ⚠️ ODsay도 X=lng, Y=lat
                        .queryParam("SY", from.lat())
                        .queryParam("EX", to.lng())
                        .queryParam("EY", to.lat())
                        .queryParam("apiKey", apiKey)   // 원본 키 그대로 (Spring이 1회 인코딩)
                        .build())
                .retrieve()
                .body(OdsayPathResponse.class);

        if(res == null || res.result() == null || res.result().path().isEmpty()) {
            return Integer.MAX_VALUE;
        }

        return res.result().path().stream()
                .mapToInt(p -> p.info().totalTime()).min().orElse(Integer.MAX_VALUE); // MAX_VALUE는 못 간다는 뜻
    }
}
