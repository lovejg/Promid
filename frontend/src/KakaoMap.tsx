import { useEffect, useRef, useState } from "react";
import type { Coordinate, RankedPlace } from "./types";
import { loadKakaoMaps } from "./kakaoLoader";

interface Props {
  midpoint: Coordinate;
  origins: Coordinate[];
  places: RankedPlace[];
  /** 리스트에서 선택된 역 인덱스 (해당 마커로 지도 이동) */
  focusIndex?: number | null;
}

export default function KakaoMap({ midpoint, origins, places, focusIndex }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const boundsRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 1) 지도 생성 + 마커 그리기 (midpoint/origins/places가 바뀔 때마다)
  useEffect(() => {
    let cancelled = false;

    loadKakaoMaps()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const kakao = window.kakao;
        const center = new kakao.maps.LatLng(midpoint.lat, midpoint.lng);

        // 지도 인스턴스는 한 번만 생성, 이후엔 center만 갱신
        if (!mapRef.current) {
          mapRef.current = new kakao.maps.Map(containerRef.current, { center, level: 5 });
        } else {
          mapRef.current.setCenter(center);
        }
        const map = mapRef.current;

        // 기존 마커 제거
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        const addMarker = (c: Coordinate, label: string, cls: string) => {
          const pos = new kakao.maps.LatLng(c.lat, c.lng);
          const marker = new kakao.maps.Marker({ position: pos, map });
          const overlay = new kakao.maps.CustomOverlay({
            position: pos,
            yAnchor: 2.2,
            content: `<div class="map-label ${cls}">${label}</div>`,
          });
          overlay.setMap(map);
          markersRef.current.push(marker, overlay);
          return pos;
        };

        const bounds = new kakao.maps.LatLngBounds();

        // 출발지(파랑) → 중간지점(빨강) → 추천 역(보라)
        origins.forEach((o, i) => bounds.extend(addMarker(o, `출발지 ${i + 1}`, "map-label--origin")));
        bounds.extend(addMarker(midpoint, "중간지점", "map-label--mid"));
        places.forEach((p, i) =>
          bounds.extend(addMarker(p.place.location, `${i + 1}. ${p.place.name}`, "map-label--place")),
        );

        boundsRef.current = bounds;
        map.relayout(); // 컨테이너 크기 반영
        map.setBounds(bounds);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });

    return () => {
      cancelled = true;
    };
  }, [midpoint, origins, places]);

  // 2) 리스트에서 역 선택 시 해당 위치로 부드럽게 이동
  useEffect(() => {
    if (focusIndex == null || !mapRef.current) return;
    const p = places[focusIndex];
    if (!p) return;
    const kakao = window.kakao;
    mapRef.current.panTo(new kakao.maps.LatLng(p.place.location.lat, p.place.location.lng));
  }, [focusIndex, places]);

  // 3) 창 크기 변경 시 지도 다시 맞춤
  useEffect(() => {
    const onResize = () => {
      const map = mapRef.current;
      if (!map) return;
      map.relayout();
      if (boundsRef.current) map.setBounds(boundsRef.current);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (error) {
    return <div className="map-error">지도를 불러오지 못했어요: {error}</div>;
  }

  return <div ref={containerRef} className="map" />;
}
