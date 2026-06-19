package com.middle.backend.controller;

import com.middle.backend.domain.Coordinate;
import com.middle.backend.domain.WeightedPoint;
import com.middle.backend.dto.*;
import com.middle.backend.service.KakaoLocalService;
import com.middle.backend.service.MidpointService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Validated
public class MidPointController {
    private final MidpointService midpointService;
    private final KakaoLocalService kakaoLocalService;

    @PostMapping("/api/midpoint")
    public TotalResponse recommend(@Valid @RequestBody TotalRequest request) {
        List<WeightedPoint> points = request.places().stream().map(this::toWeightedPoint).toList();
        Coordinate mid = midpointService.calculateMid(points);
        List<Coordinate> origins = points.stream().map(WeightedPoint::coordinate).toList();
        List<PlaceDto> places = kakaoLocalService.searchStations(mid, request.radius());
        return new TotalResponse(mid, origins, places);
    }

    @GetMapping("/api/places/search")
    public List<PlaceSuggestion> search(@RequestParam @NotBlank String query) {
        return kakaoLocalService.searchPlaces(query);
    }


    /* ---------------- 헬퍼 ----------------*/

    private WeightedPoint toWeightedPoint(StartRequest s) {
        Coordinate coord = (s.lat() != null && s.lng() != null)
                ? new Coordinate(s.lat(), s.lng())
                : kakaoLocalService.geocode(s.place());
        return new WeightedPoint(coord, s.weight());
    }
}
