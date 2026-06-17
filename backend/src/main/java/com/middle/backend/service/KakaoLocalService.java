package com.middle.backend.service;

import com.middle.backend.domain.Coordinate;
import com.middle.backend.dto.PlaceDto;
import com.middle.backend.dto.kakao.KakaoSearchResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
@RequiredArgsConstructor
public class KakaoLocalService {
    private final RestClient kakaoRestClient;

    public Coordinate geocode(String query) {
        KakaoSearchResponse res = kakaoRestClient.get().uri(uriBuilder -> uriBuilder
                        .path("/v2/local/search/keyword.json")
                        .queryParam("query", query)
                        .build())
                .retrieve()
                .body(KakaoSearchResponse.class);

        var docs = res.documents(); // 검색어 장소 리스트
        if(docs == null || docs.isEmpty()) {
            throw new IllegalArgumentException("좌표를 찾을 수 없습니다: " + query);
        }
        var first = docs.get(0); // 검색어와 가장 가까운
        return new Coordinate(Double.parseDouble(first.y()), Double.parseDouble(first.x())); // lat이 y고, lng가 x
    }

    public List<PlaceDto> searchStations(Coordinate center, Integer radius) {
        KakaoSearchResponse res = kakaoRestClient.get().uri(uriBuilder -> uriBuilder
                        .path("/v2/local/search/category.json")
                        .queryParam("category_group_code", "SW8")
                        .queryParam("x", center.lng())
                        .queryParam("y", center.lat())
                        .queryParam("radius", radius)
                        .queryParam("sort", "distance")
                        .build())
                .retrieve()
                .body(KakaoSearchResponse.class);

        var placeList = res.documents().stream().map(d -> new PlaceDto(
                d.placeName(),
                d.categoryGroupName(),
                new Coordinate(Double.parseDouble(d.y()), Double.parseDouble(d.x())),
                (d.roadAddressName() != null && !d.roadAddressName().isBlank()) ? d.roadAddressName() : d.addressName(),
                Integer.parseInt(d.distance()))).toList();

        return placeList;
    }
}
