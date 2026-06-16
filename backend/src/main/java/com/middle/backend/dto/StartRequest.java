package com.middle.backend.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Positive;

public record StartRequest(String place, Double lat, Double lng, @Positive Integer weight) {
    // 압축 생성자
    public StartRequest {
        if (weight == null) weight = 1; // 가중치 미입력 시 균등(모두 1)
    }

    @AssertTrue(message = "위치값이 반드시 입력돼야 합니다.")
    public boolean isInputProvided() {
        boolean hasPlace = place != null && !place.isBlank();
        boolean hasCoord = lat != null && lng != null;
        return hasPlace || hasCoord;
    }
}
