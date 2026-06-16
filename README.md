# promid

두 명(혹은 여러 명)의 출발지를 입력하면 **공평한 중간 지점(중점) 근처의 역/장소**를 찾아주는 약속 장소 추천 서비스.

기하학적 중점이 산·강 한복판이 되는 문제를 피하기 위해, 중점 좌표 주변의 실제 역·장소로 스냅(snap)해서 추천한다. 비율(예: 7:3)과 검색 반경을 조정할 수 있다.

## 구조 (모노레포)

```
promid/
├── backend/    Spring Boot (Java 21) — 중점 계산 + 지도 API 연동 REST 서버
└── frontend/   React (Vite) — 사용자 UI
```

## 기술 스택

- **Backend**: Spring Boot 4.1, Java 21, Spring Web MVC, (추후) JPA + Security
- **Frontend**: React + Vite
- **External**: Kakao Local API (지오코딩, 카테고리/장소 검색)

## 로드맵

1. **MVP** — 주소 2개 입력 → 가중 중점 계산 → 반경 내 역 목록 반환 (stateless)
2. 주소 자동완성, 비율/반경 UI
3. 대중교통 이동시간 기반 정렬
4. 회원/인증 → 집·회사·단골 약속장소 저장
5. 역 주변 명소·맛집 추천
