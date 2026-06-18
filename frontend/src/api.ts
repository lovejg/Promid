import type { TotalRequest, TotalResponse, ErrorResponse } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

/** 백엔드가 내려준 ErrorResponse.message를 담는 에러 */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

/** POST /api/midpoint — 중간지점 + 주변 역 추천 */
export async function fetchMidpoint(req: TotalRequest): Promise<TotalResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/midpoint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
  } catch {
    // 네트워크 단절 / 서버 미기동 등
    throw new ApiError(0, "서버에 연결할 수 없어요. 백엔드가 켜져 있는지 확인해 주세요.");
  }

  if (!res.ok) {
    let message = `요청 실패 (HTTP ${res.status})`;
    try {
      const body = (await res.json()) as ErrorResponse;
      if (body?.message) message = body.message;
    } catch {
      // 본문 파싱 실패 시 기본 메시지 유지
    }
    throw new ApiError(res.status, message);
  }

  return (await res.json()) as TotalResponse;
}
