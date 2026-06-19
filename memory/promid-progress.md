---
name: promid-progress
description: Current build progress on promid backend — what's done and the next task
metadata:
  type: project
---

Backend build order (user writes, Claude guides — see [[promid-collaboration-model]]):

DONE:
- build.gradle: removed JPA & Security (stateless MVP); validation + webmvc only.
- Kakao key wiring: application.properties imports optional application-secret.properties (gitignored) holding `kakao.rest-api-key`; `kakao.api.base-url=https://dapi.kakao.com`.
- Input DTOs: `StartRequest`(place, lat, lng, weight) with @AssertTrue requiring place-or-coords, weight defaults to 1 (Integer); `TotalRequest`(places @NotNull @Size(min=2) @Valid, radius defaults 1000).
- Output DTOs: `domain/Coordinate`(lat,lng record), `dto/PlaceDto`, `dto/TotalResponse`.
- Logic: `service/MidpointService.calculate(List<WeightedPoint>)` — weighted average. `domain/WeightedPoint`(Coordinate, int weight).

- 임무 4 Kakao 연동 DONE:
  - `config/KakaoConfig` — @Configuration/@Bean RestClient with baseUrl + `Authorization: KakaoAK {key}` defaultHeader.
  - `dto/kakao/KakaoSearchResponse` — record(documents) + nested Document with @JsonProperty (place_name etc.), x/y/distance as String.
  - `service/KakaoLocalService` (@RequiredArgsConstructor, final RestClient) — geocode(query) via keyword.json (first doc, Coordinate(y,x)); searchStations(center,radius) via category.json?category_group_code=SW8&x=lng&y=lat&radius&sort=distance → List<PlaceDto>.

- 임무 5 controller DONE:
  - `controller/MidPointController` (@RestController, @RequiredArgsConstructor, final MidpointService+KakaoLocalService) — POST /api/midpoint, @Valid @RequestBody TotalRequest → stream places.map(toWeightedPoint).toList() → calculateMid → searchStations(mid, request.radius()) → TotalResponse. Private helper toWeightedPoint: coords if present else geocode(place).
  - NOTE: MidpointService method renamed calculate → `calculateMid` (clarity).

- SMOKE TEST PASSED (live bootRun + curl POST /api/midpoint): both coord-input and text-input(geocode) paths work end-to-end. 강남역↔여의도역 → midpoint (37.5099,126.976) → 동작역 9/4호선 within 1000m, sorted by distance. Kakao x/y swap correct.
  - GOTCHA fixed: KakaoConfig was injecting `RestClient.Builder` bean — that bean isn't auto-configured in this Boot 4.1 setup → startup failed. Changed to static `RestClient.builder()`. (Earlier I wrongly told user the IDE autowire warning was ignorable.)
  - KAKAO CONSOLE: app `promid` initially had 카카오맵(OPEN_MAP_AND_LOCAL) service DISABLED → 403. User enabled it in developers.kakao.com → 제품 설정 → 카카오맵.

- 임무 6 DONE (CORS + exception handling + warning cleanup):
  - `config/WebConfig` implements WebMvcConfigurer — addCorsMappings /api/** allowedOrigins http://localhost:5173, methods GET/POST. (no deps → no @RequiredArgsConstructor)
  - `dto/ErrorResponse`(int status, String message).
  - `exception/GlobalExceptionHandler` @RestControllerAdvice — handles IllegalArgumentException → 400 + e.getMessage(); MethodArgumentNotValidException → 400 + first error's getDefaultMessage() (MVP: single message).
  - 6-C: TotalRequest `@Valid List<StartRequest>` → `List<@Valid StartRequest>` (fixes HV000271 deprecation).
  - SMOKE TEST PASSED: ①valid→200; ②places size<2→400 "size must be between 2..."; ③no place/coords→400 "위치값이 반드시 입력돼야 합니다."; ④bad place name→400 "좌표를 찾을 수 없습니다: ...".

*** BACKEND MVP COMPLETE *** Full flow works live: input validation → coord resolution (coords or geocode) → weighted midpoint → station search → response, with clean 400 errors.

- FRONTEND scaffolded + fully built by Claude (React 19 + Vite 8 + TS 6) in frontend/:
  - src/types.ts (DTO mirror), src/api.ts (fetchMidpoint + ApiError reads ErrorResponse.message), src/kakaoLoader.ts (dynamic Kakao Maps JS SDK load via VITE_KAKAO_JS_KEY), src/KakaoMap.tsx (map + 중점/역 markers + CustomOverlay labels + panTo on list select), src/App.tsx (N start-point form: text OR 현재위치 geolocation, optional weight/radius; result = map + station list), src/App.css, src/index.css reset, src/vite-env.d.ts (env typing).
  - Map choice: KAKAO MAP JS SDK (user chose, over Leaflet). Needs user console setup: (1) JavaScript 키 → frontend/.env.local VITE_KAKAO_JS_KEY (gitignored; .env.example committed), (2) register http://localhost:5173 as Web platform in Kakao Developers.
  - Run: backend `./gradlew bootRun` (8080) + frontend `npm run dev -- --port 5173 --strictPort`. CORS allows 5173. Kakao JS SDK domain must be registered at [플랫폼 키]>[JavaScript 키]>[JavaScript SDK 도메인] (NOT 제품 링크 관리).
  - Browser-tested live: form → map(출발지·중점·역 markers) + station list works. Then FULL REDESIGN (bigger map via grid 1fr/360px calc(100vh-200px), collapsible form, legend, responsive).

- 임무 7 DONE — tests: `src/test/.../service/MidpointServiceTest` (JUnit5+AssertJ, no Spring) — 1:1 중점, 가중치 3:1, 빈 리스트 예외. User wrote, taught Given-When-Then. `./gradlew test` green.

- 임무 8 DONE — 주소 자동완성 (roadmap step 2):
  - Backend: `GET /api/places/search?query=` (@RequestParam @NotBlank + class @Validated) → `searchPlaces` returns `List<PlaceSuggestion>`(name, location, address) via keyword.json, empty list (not exception) when no results. Added `ConstraintViolationException` handler → 400 (else blank query gave 500).
  - Frontend (Claude): `StartField.tsx` component — debounced(250ms) search w/ AbortController, dropdown (name+address), full keyboard (↑↓ wrap / Enter picks & blocks submit / Esc) + scrollIntoView, pick→confirms coord (green ✓, sends lat/lng not text), retyping clears coord, name-match ranking (startsWith>includes>rest), MIN_QUERY_LEN=2 (Kakao keyword search ≠ prefix typeahead). api.ts searchPlaces, types.ts PlaceSuggestion.

- ROADMAP 3 DIRECTION DECIDED (not yet built): transit-time fairness as 2-layer — distance midpoint = search anchor (cheap/stable), transit time = RANK the ~15 candidate stations (bounded API calls). Fairness metric: minimax (protect worst-off person) preferred over min-gap/min-sum. Still need: routing API choice (ODsay etc.). See docs/DECISIONS.md #10.

- Decision log started at docs/DECISIONS.md (portfolio material) — see [[decision-log-convention]].

NEXT — roadmap step 3 (transit-time ranking) when user signals: pick routing API + confirm fairness metric, then design mission. Steps 4 (auth/JPA·Security) and 5 (nearby attractions) later.
