package com.middle.backend.service;

import com.middle.backend.domain.Coordinate;
import com.middle.backend.dto.odsay.OdsayPathResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransitService {
    private static final long ODSAY_DELAY_MS = 200; // ODsay 실제 호출 간 지연(rate-limiting)

    private final RestClient odsayRestClient;

    @Value("${odsay.api-key}")
    private String apiKey;

    private record Leg(Coordinate from, Coordinate to) {}
    // @Service가 붙어서 TransitService는 앱 전체에 인스턴스가 딱 1개 => cache도 1개 => 그냥 hashmap 쓰면 동시 접근(쓰기) 시 터짐
    private final Map<Leg, Integer> cache = new ConcurrentHashMap<>(); // key: 두 좌표, value: 소요시간

    // 두 좌표 간 대중교통(transit) 최소 소요시간(분 단위)
    public int transitMinutes(Coordinate from, Coordinate to) {
        // 캐시 있는지 확인
        Leg key = new Leg(from, to);
        Integer cached = cache.get(key);
        if(cached != null) {
            return cached;   // 캐시 히트는 네트워크를 안 타므로 지연 없이 즉시 반환
        }

        // 캐시 미스 → 실제 ODsay 호출이라 여기서만 지연(버스트 방지)
        sleeper(ODSAY_DELAY_MS);

        OdsayPathResponse res = odsayRestClient.get().uri(b -> b
                        .path("/searchPubTransPathT")
                        .queryParam("SX", from.lng()) // ODsay도 X = lng, Y = lat
                        .queryParam("SY", from.lat())
                        .queryParam("EX", to.lng())
                        .queryParam("EY", to.lat())
                        .queryParam("apiKey", apiKey)
                        .build())
                .retrieve()
                .body(OdsayPathResponse.class);

        // API 레벨 실패(키/IP/throttle 등)는 error 배열로 옴 → 원인을 로그로 남겨 가시화
        if (res != null && res.error() != null && !res.error().isEmpty()) {
            OdsayPathResponse.Error e = res.error().get(0);
            log.warn("ODsay 호출 실패: code={}, msg={}", e.code(), e.message());
            return Integer.MAX_VALUE;
        }
        // 응답은 정상인데 경로가 없음 → 진짜 못 가는 곳 (정상 케이스라 로그 안 함)
        if (res == null || res.result() == null || res.result().path().isEmpty()) {
            return Integer.MAX_VALUE;  // MAX_VALUE는 못 간다는 뜻
        }

        // 결과값 계산 + 캐시에 저장
        int min = res.result().path().stream()
                .mapToInt(p -> p.info().totalTime()).min().orElse(Integer.MAX_VALUE);
        cache.put(key, min);
        return min;
    }

    /* ---------------- 헬퍼 ---------------- */
    private void sleeper(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
