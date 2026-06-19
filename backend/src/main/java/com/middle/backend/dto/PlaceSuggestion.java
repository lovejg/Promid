package com.middle.backend.dto;

import com.middle.backend.domain.Coordinate;

public record PlaceSuggestion(String name, Coordinate location, String address) {
}
