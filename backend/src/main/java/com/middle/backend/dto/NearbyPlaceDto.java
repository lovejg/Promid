package com.middle.backend.dto;

import com.middle.backend.domain.Coordinate;

// 역 주변 추천 장소(맛집/카페/명소)
// PlaceDto와 거의 같지만 카카오맵 딥링크(placeUrl)가 추가됨
public record NearbyPlaceDto(String name, String category, Coordinate location, String address, int distance,
                             String placeUrl) {
}
