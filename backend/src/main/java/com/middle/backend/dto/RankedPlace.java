package com.middle.backend.dto;

import java.util.List;

// minutes: 출발지별 소요시간(origins 순서와 1:1). 경로를 못 구한 출발지는 null.
// maxMinutes: minimax 점수. 한 명이라도 못 가면(null 포함) null → 정렬 시 맨 뒤로.
public record RankedPlace(PlaceDto place, List<Integer> minutes, Integer maxMinutes) {
}
