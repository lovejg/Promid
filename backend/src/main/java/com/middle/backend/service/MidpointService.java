package com.middle.backend.service;

import com.middle.backend.domain.Coordinate;
import com.middle.backend.domain.WeightedPoint;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MidpointService {

    public Coordinate calculate(List<WeightedPoint> points) {
        if(points == null || points.isEmpty()) {
            throw new IllegalArgumentException("중점 계산에는 최소 1개 이상의 점이 필요합니다.");
        }

        double sumWeight = 0.0;
        double sumLat = 0.0;
        double sumLng = 0.0;
        for (WeightedPoint point : points) {
            sumWeight += point.weight();
            sumLat += point.coordinate().lat() * point.weight();
            sumLng += point.coordinate().lng() * point.weight();
        }
        return new Coordinate(sumLat / sumWeight, sumLng / sumWeight);
    }
}
