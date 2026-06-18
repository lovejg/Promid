package com.middle.backend.dto;

import com.middle.backend.domain.Coordinate;

import java.util.List;

public record TotalResponse(Coordinate midpoint, List<Coordinate> origins, List<PlaceDto> places) {
}
