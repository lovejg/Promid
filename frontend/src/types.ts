// 백엔드 DTO와 1:1 매칭되는 타입들 (com.middle.backend.dto / domain)

export interface Coordinate {
  lat: number;
  lng: number;
}

/** 출발지 1개. place(텍스트) 또는 lat/lng(좌표) 중 하나로 보냄. weight는 선택. */
export interface StartRequest {
  place?: string;
  lat?: number;
  lng?: number;
  weight?: number;
}

export interface TotalRequest {
  places: StartRequest[];
  radius?: number;
}

export interface PlaceDto {
  name: string;
  category: string;
  location: Coordinate;
  address: string;
  distance: number;
}

/** GET /api/places/search 후보 1개 (자동완성용) */
export interface PlaceSuggestion {
  name: string;
  location: Coordinate;
  address: string;
}

/** GET /api/nearby 결과 1개 (역 주변 맛집/카페/명소). placeUrl로 카카오맵 딥링크. */
export interface NearbyPlace {
  name: string;
  category: string;
  location: Coordinate;
  address: string;
  distance: number;
  placeUrl: string;
}

/** 대중교통 시간으로 점수 매겨 정렬한 추천 역 1개 (백엔드 RankedPlace) */
export interface RankedPlace {
  place: PlaceDto;
  /** 출발지별 소요시간(분). origins 순서와 1:1. 경로를 못 구한 출발지는 null. */
  minutes: (number | null)[];
  /** minimax 점수(최댓값, 분). 한 명이라도 못 가면 null → 목록 맨 뒤. */
  maxMinutes: number | null;
}

export interface TotalResponse {
  midpoint: Coordinate;
  origins: Coordinate[]; // 각 출발지의 (해석된) 좌표
  places: RankedPlace[];
}

/** 백엔드 GlobalExceptionHandler가 내려주는 에러 형식 */
export interface ErrorResponse {
  status: number;
  message: string;
}
