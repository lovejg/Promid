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

NEXT — 임무 5: `controller` POST /api/midpoint. @Valid @RequestBody TotalRequest → resolve each StartRequest to Coordinate (coords if present, else geocode(place)) → WeightedPoint(weight) → MidpointService.calculate → KakaoLocalService.searchStations(midpoint, radius) → TotalResponse.
Then 임무 6: CORS (Vite dev server) + @RestControllerAdvice exception handling. Then frontend (React/TS).
