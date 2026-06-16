package com.middle.backend.dto;

import com.middle.backend.domain.Coordinate;

public record PlaceDto(String name, String category, Coordinate location, String address, int distance) {
}
