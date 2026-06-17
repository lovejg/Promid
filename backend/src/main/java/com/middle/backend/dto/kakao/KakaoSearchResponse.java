package com.middle.backend.dto.kakao;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record KakaoSearchResponse(List<Document> documents) {

    public record Document(
            @JsonProperty("place_name")          String placeName,
            @JsonProperty("category_group_name") String categoryGroupName,
            @JsonProperty("road_address_name")   String roadAddressName,
            @JsonProperty("address_name")        String addressName,
            String x,         // 경도(lng) — 문자열
            String y,         // 위도(lat) — 문자열
            String distance   // 중점에서 거리(m) — 문자열 (category 검색 sort=distance일 때 채워짐)
    ) {}
}
