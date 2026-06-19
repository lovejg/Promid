package com.middle.backend.service;

import com.middle.backend.domain.Coordinate;
import com.middle.backend.domain.WeightedPoint;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.*;

public class MidpointServiceTest {

    // test니까 굳이 DI 안하고 그냥 객체 생성해서 진행
    private final MidpointService midpointService = new MidpointService();

    @Test
    void checkMid_when_same_weight() {
        List<WeightedPoint> points = List.of(
                new WeightedPoint(new Coordinate(37.0, 127.0), 1),
                new WeightedPoint(new Coordinate(38.0, 127.0), 1)
        );

        Coordinate res = midpointService.calculateMid(points);

        // assertThat(실제값).isEqualTo(기댓값)
        assertThat(res.lat()).isEqualTo(37.5);
        assertThat(res.lng()).isEqualTo(127.0);
    }

    @Test
    void checkMid_when_different_weight() {
        List<WeightedPoint> points = List.of(
                new WeightedPoint(new Coordinate(37.0, 127.0), 3),
                new WeightedPoint(new Coordinate(38.0, 127.0), 1)
        );

        Coordinate res = midpointService.calculateMid(points);

        assertThat(res.lat()).isCloseTo(37.25, within(1e-9)); // 오차 허용
        assertThat(res.lng()).isEqualTo(127.0);
    }

    @Test
    void checkMid_when_empty() {
        // 예외 체크라서 assertThatThrownBy 사용
        assertThatThrownBy(() -> midpointService.calculateMid(List.of())) // 빈 리스트
                .isInstanceOf(IllegalArgumentException.class);
    }
}
