import { useState } from "react";
import "./App.css";
import type { Coordinate, StartRequest, TotalResponse } from "./types";
import { ApiError, fetchMidpoint } from "./api";
import KakaoMap from "./KakaoMap";

/** 화면에서 다루는 출발지 입력 상태 (텍스트 또는 좌표) */
interface StartInput {
  place: string;
  coord: Coordinate | null; // '현재 위치' 버튼으로 채워짐
  weight: string; // 빈 문자열이면 기본값(1)
}

const emptyStart = (): StartInput => ({ place: "", coord: null, weight: "" });

function App() {
  const [starts, setStarts] = useState<StartInput[]>([emptyStart(), emptyStart()]);
  const [radius, setRadius] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TotalResponse | null>(null);
  const [editing, setEditing] = useState(true); // 결과가 나오면 false로 (폼 접힘)
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  const showForm = !result || editing;

  const updateStart = (i: number, patch: Partial<StartInput>) =>
    setStarts((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const addStart = () => setStarts((prev) => [...prev, emptyStart()]);

  const removeStart = (i: number) =>
    setStarts((prev) => (prev.length > 2 ? prev.filter((_, idx) => idx !== i) : prev));

  const useMyLocation = (i: number) => {
    if (!navigator.geolocation) {
      setError("이 브라우저는 현재 위치를 지원하지 않아요.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        updateStart(i, {
          coord: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          place: "",
        }),
      () => setError("현재 위치를 가져오지 못했어요. 위치 권한을 확인해 주세요."),
    );
  };

  /** 입력 상태 → 백엔드 StartRequest 변환 (빈 입력은 제외) */
  const toRequestPlaces = (): StartRequest[] =>
    starts
      .map((s): StartRequest | null => {
        const weight = s.weight.trim() ? Number(s.weight) : undefined;
        if (s.coord) return { lat: s.coord.lat, lng: s.coord.lng, weight };
        if (s.place.trim()) return { place: s.place.trim(), weight };
        return null;
      })
      .filter((p): p is StartRequest => p !== null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const places = toRequestPlaces();
    if (places.length < 2) {
      setError("출발지를 2곳 이상 입력해 주세요.");
      return;
    }

    setLoading(true);
    setFocusIndex(null);
    try {
      const data = await fetchMidpoint({
        places,
        radius: radius.trim() ? Number(radius) : undefined,
      });
      setResult(data);
      setEditing(false); // 결과 나오면 폼 접기
      if (data.places.length === 0) {
        setError("중간지점 주변에서 역을 찾지 못했어요. 반경을 넓혀보세요.");
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "알 수 없는 오류가 발생했어요.";
      setError(msg);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">promid</span>
          <span className="brand-tag">공평한 중간지점 찾기</span>
        </div>
        {result && !editing && (
          <button className="edit-btn" onClick={() => setEditing(true)}>
            ✎ 출발지 수정
          </button>
        )}
      </header>

      <main className="main">
        {showForm ? (
          <form className="form-card" onSubmit={onSubmit}>
            <h2 className="card-title">출발지를 입력하세요</h2>
            <p className="card-desc">2곳 이상 입력하면 모두에게 공평한 중간지점을 찾아드려요.</p>

            <div className="starts">
              {starts.map((s, i) => (
                <div className="start-row" key={i}>
                  <span className="start-index">{i + 1}</span>

                  {s.coord ? (
                    <div className="coord-chip">
                      <span>📍 현재 위치 ({s.coord.lat.toFixed(4)}, {s.coord.lng.toFixed(4)})</span>
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() => updateStart(i, { coord: null })}
                      >
                        해제
                      </button>
                    </div>
                  ) : (
                    <input
                      className="place-input"
                      placeholder="장소 입력 (예: 강남역, 여의도역 7번출구)"
                      value={s.place}
                      onChange={(e) => updateStart(i, { place: e.target.value })}
                    />
                  )}

                  <button type="button" className="loc-btn" onClick={() => useMyLocation(i)}>
                    현재위치
                  </button>

                  <input
                    className="weight-input"
                    type="number"
                    min={1}
                    placeholder="비중"
                    value={s.weight}
                    onChange={(e) => updateStart(i, { weight: e.target.value })}
                    title="가중치 (비워두면 1). 클수록 그 사람 쪽으로 중점이 당겨져요."
                  />

                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeStart(i)}
                    disabled={starts.length <= 2}
                    title="출발지 삭제"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button type="button" className="add-btn" onClick={addStart}>
              + 출발지 추가
            </button>

            <div className="form-footer">
              <label className="radius-field">
                검색 반경
                <input
                  className="radius-input"
                  type="number"
                  min={1}
                  placeholder="1000"
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                />
                <span className="unit">m</span>
              </label>

              <div className="actions">
                {result && (
                  <button type="button" className="ghost-btn" onClick={() => setEditing(false)}>
                    취소
                  </button>
                )}
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "찾는 중…" : "중간지점 찾기"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="summary-bar">
            <div className="summary-text">
              <strong>출발지 {result!.origins.length}곳</strong>
              <span className="summary-dot">·</span>
              중간지점 {result!.midpoint.lat.toFixed(5)}, {result!.midpoint.lng.toFixed(5)}
              <span className="summary-dot">·</span>
              추천 역 {result!.places.length}곳
            </div>
          </div>
        )}

        {error && <div className="error-banner">{error}</div>}

        {result && (
          <section className="result-layout">
            <div className="map-pane">
              <KakaoMap
                midpoint={result.midpoint}
                origins={result.origins}
                places={result.places}
                focusIndex={focusIndex}
              />
              <div className="legend">
                <span className="legend-item">
                  <i className="dot dot--origin" /> 출발지
                </span>
                <span className="legend-item">
                  <i className="dot dot--mid" /> 중간지점
                </span>
                <span className="legend-item">
                  <i className="dot dot--place" /> 추천 역
                </span>
              </div>
            </div>

            <aside className="list-pane">
              <div className="list-header">추천 역 {result.places.length}곳</div>
              {result.places.length === 0 ? (
                <div className="list-empty">주변에서 역을 찾지 못했어요. 반경을 넓혀보세요.</div>
              ) : (
                <ul className="station-list">
                  {result.places.map((p, i) => (
                    <li
                      key={`${p.name}-${i}`}
                      className={focusIndex === i ? "station active" : "station"}
                      onClick={() => setFocusIndex(i)}
                    >
                      <span className="station-rank">{i + 1}</span>
                      <div className="station-info">
                        <div className="station-name">
                          {p.name} <span className="station-cat">{p.category}</span>
                        </div>
                        <div className="station-addr">{p.address}</div>
                      </div>
                      <span className="station-dist">{p.distance}m</span>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
