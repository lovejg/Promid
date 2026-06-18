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

export interface TotalResponse {
  midpoint: Coordinate;
  origins: Coordinate[]; // 각 출발지의 (해석된) 좌표
  places: PlaceDto[];
}

/** 백엔드 GlobalExceptionHandler가 내려주는 에러 형식 */
export interface ErrorResponse {
  status: number;
  message: string;
}
