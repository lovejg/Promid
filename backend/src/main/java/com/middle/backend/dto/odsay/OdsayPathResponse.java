package com.middle.backend.dto.odsay;

import java.util.List;

public record OdsayPathResponse(Result result) {
    // 경로 후보 목록
    public record Result(List<Path> path) {}

    // 경로 후보 한개
    public record Path(Info info) {}

    // 경로 정보
    public record Info(int totalTime) {} // 분 단위
}
