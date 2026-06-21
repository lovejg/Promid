package com.middle.backend.dto;

import com.middle.backend.domain.Coordinate;

// distance: 중점으로부터의 거리
public record PlaceDto(String name, String category, Coordinate location, String address, int distance) {
}
