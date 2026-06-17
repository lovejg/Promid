# promid — 작업 인수인계 문서 (Claude Code용)

> 이 문서 하나만 읽으면 프로젝트 맥락 + 진행 방식 + 현재 위치를 파악하고 바로 이어서 진행할 수 있도록 정리한 핸드오프 문서다.
> (세션이 날아가도 새 세션에서 이걸 읽고 그대로 계속하면 된다. 추가 맥락은 `memory/MEMORY.md`에도 있음.)

---

## 1. 프로젝트가 뭔가

**promid** = 약속 장소 추천 서비스. 두 명(혹은 여러 명)의 출발지를 입력하면 **공평한 중간 지점(가중 중점) 근처의 역/장소**를 찾아준다.

- 기하학적 중점이 산·강 한복판이 되는 문제를 피하려고, 중점 좌표 주변의 **실제 역·장소로 스냅**해서 추천한다.
- 비율(예 7:3)과 검색 반경을 조정할 수 있다.

### 기술 스택
- **Backend**: Spring Boot 4.1, Java 21, Spring Web MVC + Validation (JPA·Security는 MVP에서 제거함)
- **Frontend**: React + Vite + **TypeScript** (아직 시작 안 함, 빈 폴더)
- **External**: Kakao Local API (키워드 장소 검색 + 카테고리 검색)
- 모노레포: `promid/{backend, frontend}`

### 로드맵
1. **MVP(현재)** — 출발지 2+개 입력 → 가중 중점 계산 → 반경 내 역 목록 반환 (stateless, DB 없음)
2. 주소 자동완성, 비율/반경 UI
3. 대중교통 이동시간 기반 정렬
4. 회원/인증 → 집·회사·단골 장소 저장 (이때 JPA·Security 다시 추가)
5. 역 주변 명소·맛집 추천

---

## 2. 협업 방식 (Claude Code의 역할)

- **백엔드(Spring)**: **사용자가 직접 짠다.** Claude는 **가이드** 역할 — "어떤 순서로 / 뭘 / 왜 / 어떻게"를 *같이 설계하며* 임무 형태로 제시하고, 사용자가 짠 코드를 리뷰한다. 사용자가 명시적으로 "이건 네가 짜줘" 할 때만 백엔드 코드를 작성한다.
- **프론트엔드(React/TS)**: **Claude가 전적으로 작성**한다 (백엔드 API에 맞춰서).
- **설정 파일**(build.gradle, application.properties, gradle.properties 등): Claude가 직접 처리.
- **진행 페이스**: 사용자가 질문하면 **답만 하고**, 다음 단계는 준비만 해둔 채 **"진행" 신호를 기다린다.** 멋대로 다음 단계로 넘어가지 않는다.
- 설계는 정답지를 던지지 말고 **사용자와 함께** 결정한다(선택지 + 추천 제시).

---

## 3. 개발 환경 / 주의사항

- Windows에서 IntelliJ IDEA 2026.1 실행, 프로젝트는 WSL(Ubuntu 24.04) `/home/tmakdrl/promid`에 있음 (`\\wsl$` 로 열림).
- **Claude Code는 보통 IntelliJ 통합 터미널에서 돎** → IntelliJ 닫으면 세션 끊김. 복구: `/home/tmakdrl/promid` 에서 `claude --resume`.
- **JDK 21**: `/home/tmakdrl/.jdks/temurin-21.0.11` (시스템: `/usr/lib/jvm/java-21-openjdk-amd64`).
- `backend/gradle.properties` 가 `org.gradle.java.home` 을 위 Temurin으로 고정 → **터미널 빌드는 IDE 상태와 무관하게 항상 됨**: `cd /home/tmakdrl/promid/backend && ./gradlew classes`
- IDE SDK 이슈: WSL 프로젝트라 SDK는 **WSL JDK**여야 함. `Add JDK`로 `\\wsl.localhost\Ubuntu\home\tmakdrl\.jdks\temurin-21.0.11` 지정(Download JDK 쓰지 말 것).
- **Kakao REST API 키**는 `backend/src/main/resources/application-secret.properties`(gitignore됨)에 들어있음.

---

## 4. 지금까지 한 것 (완료)

경로 기준: `backend/src/main/java/com/middle/backend/`

- **build.gradle**: JPA·Security 제거. `validation` + `webmvc`만. (stateless MVP)
- **Kakao 키 배선**: `application.properties` 에 `kakao.api.base-url=https://dapi.kakao.com` + `spring.config.import=optional:classpath:application-secret.properties`. 실제 키는 secret 파일에.
- **입력 DTO**
  - `dto/StartRequest` — `(String place, Double lat, Double lng, @Positive Integer weight)`. 압축 생성자에서 weight null→1. `@AssertTrue isInputProvided()` 로 "place 또는 좌표 중 하나 필수" 강제.
  - `dto/TotalRequest` — `(@NotNull @Size(min=2) @Valid List<StartRequest> places, @Positive Integer radius)`. 압축 생성자에서 radius null→1000.
- **출력 DTO**
  - `domain/Coordinate` — `record (double lat, double lng)`. 프로젝트 전반 재사용 값객체.
  - `dto/PlaceDto` — `(String name, String category, Coordinate location, String address, int distance)`.
  - `dto/TotalResponse` — `(Coordinate midpoint, List<PlaceDto> places)`.
- **로직**
  - `domain/WeightedPoint` — `record (Coordinate coordinate, int weight)`.
  - `service/MidpointService.calculate(List<WeightedPoint>)` — 가중평균 중점. 빈 리스트 방어 포함.

### 핵심 설계 결정 (왜 그렇게 했나)
- 출발지는 **N명 리스트**(2명 고정 아님).
- 출발지 입력은 **텍스트(place) 또는 좌표(lat/lng) 둘 중 하나** — 현재위치 버튼은 좌표로, "여의도역 7번출구" 같은 건 텍스트로. 그래서 셋 다 nullable.
- 텍스트→좌표는 **주소 지오코딩이 아니라 Kakao 키워드 검색** 사용(역·건물명·주소 다 처리되니까).
- weight/radius는 **선택 + 기본값**(weight=1 균등, radius=1000m). weight는 상대 비율이라 정수면 충분.
- ⚠️ **Kakao 좌표는 `x=경도(lng)`, `y=위도(lat)`** — 매핑 시 반드시 주의. 우리 `Coordinate`는 `(lat, lng)` 순으로 통일.

---

## 5. 다음 할 일 — 임무 4: Kakao 연동

서버 처리 흐름: ①입력 → ②텍스트→좌표(지오코딩) → ③가중 중점(완료) → ④중점 주변 역 검색 → ⑤응답.
임무 4는 ②와 ④를 채운다. 하위 3단계:

- **4-A. `config/KakaoConfig`** ← 현재 여기
  - `RestClient` 빈 등록. `RestClient.Builder` 주입받아 `.baseUrl(${kakao.api.base-url})` + `.defaultHeader(HttpHeaders.AUTHORIZATION, "KakaoAK " + ${kakao.rest-api-key})`.
- **4-B. Kakao 응답 매핑 DTO**
  - 키워드 검색/카테고리 검색 응답(`{ documents: [...] }`)을 받을 record. 필드는 snake_case라 `@JsonProperty`로 매핑(place_name, category_group_name, road_address_name, address_name, x, y, distance).
- **4-C. `service/KakaoLocalService`**
  - `Coordinate geocode(String query)` → `GET /v2/local/search/keyword.json?query=...` 첫 결과 좌표.
  - `List<PlaceDto> searchStations(Coordinate center, int radius)` → `GET /v2/local/search/category.json?category_group_code=SW8&x={lng}&y={lat}&radius={radius}&sort=distance` 결과를 PlaceDto로 변환.

그 다음:
- **임무 5**: `controller` — `POST /api/midpoint` 하나로 조립 (`@Valid TotalRequest` → 각 출발지 좌표 해석(좌표 있으면 그대로, 없으면 geocode) → MidpointService → searchStations → TotalResponse).
- **임무 6**: CORS 설정(프론트 Vite dev 서버) + 전역 예외 처리(`@RestControllerAdvice`).
- 그 후 **프론트엔드(React/TS) Claude가 작성.**

---

## 6. 자주 쓰는 명령
```bash
cd /home/tmakdrl/promid/backend
./gradlew classes   # 컴파일 확인
./gradlew test      # 테스트
./gradlew bootRun   # 서버 기동 (8080)
```
