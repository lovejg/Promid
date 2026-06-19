import { useEffect, useRef, useState } from "react";
import type { Coordinate, PlaceSuggestion } from "./types";
import { searchPlaces } from "./api";

/** 출발지 한 칸의 입력 상태 (App과 공유) */
export interface StartInput {
  place: string; // 텍스트 또는 선택된 후보 이름
  coord: Coordinate | null; // 후보 선택 / 현재위치로 확정된 좌표
  weight: string; // 빈 문자열이면 기본값(1)
}

interface Props {
  index: number;
  value: StartInput;
  canRemove: boolean;
  onChange: (patch: Partial<StartInput>) => void;
  onRemove: () => void;
  onUseLocation: () => void;
}

const DEBOUNCE_MS = 250;
const MIN_QUERY_LEN = 2; // 1글자(예: "강")는 노이즈뿐이라 검색 안 함

/** 이름에 검색어가 든 곳을 우선 정렬: 시작(0) > 포함(1) > 나머지(2). 동점은 원래 순서 유지. */
function rankByQuery(items: PlaceSuggestion[], query: string): PlaceSuggestion[] {
  const q = query.trim().toLowerCase();
  const score = (name: string) => {
    const n = name.toLowerCase();
    if (n.startsWith(q)) return 0;
    if (n.includes(q)) return 1;
    return 2;
  };
  return items
    .map((item, i) => ({ item, i, s: score(item.name) }))
    .sort((a, b) => a.s - b.s || a.i - b.i)
    .map((x) => x.item);
}

export default function StartField({
  index,
  value,
  canRemove,
  onChange,
  onRemove,
  onUseLocation,
}: Props) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const blurTimer = useRef<number | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // 좌표 확정 상태: 후보를 골랐거나(이름+좌표) 현재위치를 썼을 때
  const confirmed = value.coord !== null;
  const isCurrentLocation = confirmed && value.place === "";

  // 디바운스 자동완성: 텍스트가 있고 아직 좌표 미확정일 때만 검색
  useEffect(() => {
    const q = value.place.trim();
    if (confirmed || q.length < MIN_QUERY_LEN) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const results = await searchPlaces(q, controller.signal);
      setSuggestions(rankByQuery(results, q)); // 이름 매칭 우선 재정렬
      setHighlight(-1);
      if (results.length > 0) setOpen(true);
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [value.place, confirmed]);

  // 키보드로 하이라이트 이동 시, 가려진 항목을 보이게 스크롤
  useEffect(() => {
    if (highlight < 0 || !listRef.current) return;
    const el = listRef.current.children[highlight] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlight]);

  const pick = (s: PlaceSuggestion) => {
    onChange({ place: s.name, coord: s.location });
    setOpen(false);
    setSuggestions([]);
    setHighlight(-1);
  };

  const onInputChange = (text: string) => {
    // 텍스트를 다시 건드리면 이전 좌표 확정은 무효 (직접 타이핑으로 전환)
    onChange(confirmed ? { place: text, coord: null } : { place: text });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      if (highlight >= 0) {
        e.preventDefault(); // 후보 선택 시 폼 제출 막기
        pick(suggestions[highlight]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // 드롭다운 바깥 클릭/포커스 이탈 시 닫기 (후보 클릭은 mousedown으로 먼저 처리됨)
  const onBlur = () => {
    blurTimer.current = window.setTimeout(() => setOpen(false), 120);
  };
  const onFocus = () => {
    if (blurTimer.current) window.clearTimeout(blurTimer.current);
    if (suggestions.length > 0) setOpen(true);
  };

  return (
    <div className="start-row">
      <span className="start-index">{index + 1}</span>

      {isCurrentLocation ? (
        <div className="coord-chip">
          <span>
            📍 현재 위치 ({value.coord!.lat.toFixed(4)}, {value.coord!.lng.toFixed(4)})
          </span>
          <button
            type="button"
            className="link-btn"
            onClick={() => onChange({ coord: null })}
          >
            해제
          </button>
        </div>
      ) : (
        <div className="autocomplete">
          <input
            className={confirmed ? "place-input confirmed" : "place-input"}
            placeholder="장소 입력 (예: 강남역, 여의도역 7번출구)"
            value={value.place}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            autoComplete="off"
          />
          {confirmed && <span className="confirm-check" title="좌표 확정됨">✓</span>}

          {open && suggestions.length > 0 && (
            <ul
              ref={listRef}
              className="suggestions"
              // mousedown이 input blur보다 먼저 떠서, 클릭 선택이 안 씹힘
              onMouseDown={(e) => e.preventDefault()}
            >
              {suggestions.map((s, i) => (
                <li
                  key={`${s.name}-${i}`}
                  className={i === highlight ? "suggestion active" : "suggestion"}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => pick(s)}
                >
                  <span className="suggestion-name">{s.name}</span>
                  <span className="suggestion-addr">{s.address}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button type="button" className="loc-btn" onClick={onUseLocation}>
        현재위치
      </button>

      <input
        className="weight-input"
        type="number"
        min={1}
        placeholder="비중"
        value={value.weight}
        onChange={(e) => onChange({ weight: e.target.value })}
        title="가중치 (비워두면 1). 클수록 그 사람 쪽으로 중점이 당겨져요."
      />

      <button
        type="button"
        className="remove-btn"
        onClick={onRemove}
        disabled={!canRemove}
        title="출발지 삭제"
      >
        ✕
      </button>
    </div>
  );
}
