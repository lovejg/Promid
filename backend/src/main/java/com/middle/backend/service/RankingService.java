package com.middle.backend.service;

import com.middle.backend.domain.Coordinate;
import com.middle.backend.dto.PlaceDto;
import com.middle.backend.dto.RankedPlace;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RankingService {
    private static final int TOP_N = 5; // ODsay 호출 수 = 후보수 × 사람수. 빈도제한 회피 위해 5개로 제한

    private final TransitService transitService;

    // 출발지 -> 후보역 소요시간 가지고 점수를 매기고, 그걸로 정렬해서 최종 후보군 반환
    public List<RankedPlace> rank(List<Coordinate> origins, List<PlaceDto> candidates) {
        List<RankedPlace> res = new ArrayList<>();
        List<PlaceDto> candi = candidates.stream().limit(TOP_N).toList(); // 거리 순으로 8개(제일 가까운 거 8개)
        for (PlaceDto placeDto : candi) {
            List<Integer> timeList = new ArrayList<>();
            boolean unreachable = false; // 한 명이라도 경로를 못 구했는지
            for (Coordinate origin : origins) {
                int time = transitService.transitMinutes(origin, placeDto.location());
                if (time == Integer.MAX_VALUE) {   // 센티넬 → 응답엔 null로 노출
                    timeList.add(null);
                    unreachable = true;
                } else {
                    timeList.add(time);
                }
            }
            // 못 가는 사람이 있으면 점수 없음(null) → 정렬 시 맨 뒤. 아니면 최댓값(minimax).
            Integer max = unreachable ? null : Collections.max(timeList);
            res.add(new RankedPlace(placeDto, timeList, max));
        }
        // maxMinutes 오름차순, null(못 감)은 맨 뒤로
        res.sort(Comparator.comparing(RankedPlace::maxMinutes,
                Comparator.nullsLast(Comparator.naturalOrder())));
        return res;
    }
}
