import { useEffect, useState } from "react";
import type { Coordinate, NearbyPlace } from "./types";
import { searchNearby } from "./api";

const TABS = ["맛집", "카페", "명소"] as const;
type Tab = (typeof TABS)[number];

/** 역 하나의 좌표(center)를 받아, 탭(맛집/카페/명소)별로 주변 장소를 lazy fetch해서 보여준다.
 *  각 항목은 카카오맵 상세 페이지(placeUrl)로 새 탭 딥링크. */
export default function NearbyPanel({ center }: { center: Coordinate }) {
  const [tab, setTab] = useState<Tab>("맛집");
  const [items, setItems] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(false);
    searchNearby(center, tab, ctrl.signal)
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => {
        if (ctrl.signal.aborted) return; // 탭 전환/언마운트로 취소된 요청은 무시
        setItems([]);
        setError(true);
        setLoading(false);
      });
    return () => ctrl.abort();
  }, [center.lat, center.lng, tab]);

  return (
    <div className="nearby">
      <div className="nearby-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={t === tab ? "nearby-tab active" : "nearby-tab"}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="nearby-status">불러오는 중…</div>
      ) : error ? (
        <div className="nearby-status">주변 장소를 불러오지 못했어요.</div>
      ) : items.length === 0 ? (
        <div className="nearby-status">주변에 {tab}이(가) 없어요.</div>
      ) : (
        <ul className="nearby-grid">
          {items.map((it, i) => (
            <li key={`${it.name}-${i}`}>
              <a
                className="nearby-card"
                href={it.placeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="nearby-go">↗</span>
                <span className="nearby-name">{it.name}</span>
                <span className="nearby-sub">
                  <span className="nearby-cat">{it.category}</span>
                  <span className="nearby-dist">{it.distance}m</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
