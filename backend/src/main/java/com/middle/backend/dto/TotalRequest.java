package com.middle.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;

public record TotalRequest(@NotNull @Size(min = 2) List<@Valid StartRequest> places, @Positive Integer radius) {
    // 압축 생성자
    public TotalRequest {
        if (radius == null) radius = 1000;
    }
}
