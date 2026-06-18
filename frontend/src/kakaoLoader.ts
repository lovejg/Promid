// 카카오맵 JS SDK를 한 번만 동적 로드한다. (autoload=false → kakao.maps.load로 명시 초기화)

declare global {
  interface Window {
    // SDK 전역 객체. 타입 정의 패키지를 따로 안 쓰므로 느슨하게 둔다.
    kakao: any;
  }
}

const JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY as string | undefined;

let loadPromise: Promise<void> | null = null;

export function loadKakaoMaps(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    if (!JS_KEY) {
      reject(new Error("VITE_KAKAO_JS_KEY 가 설정되지 않았어요 (frontend/.env.local 확인)."));
      return;
    }
    // 이미 로드된 경우
    if (window.kakao?.maps) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${JS_KEY}&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => resolve());
    };
    script.onerror = () =>
      reject(new Error("카카오맵 SDK 로드 실패 (JavaScript 키 / 도메인 등록을 확인해 주세요)."));
    document.head.appendChild(script);
  });

  return loadPromise;
}
