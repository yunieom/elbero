import type { JourneyApiError } from "../api/journey.api";

export interface JourneyErrorPresentation {
  title: string;
  description: string;
  action: "retry" | "search";
  actionLabel: string;
}

const byCode: Record<string, JourneyErrorPresentation> = {
  INVALID_REQUEST: {
    title: "역을 다시 선택해 주세요",
    description: "출발역과 도착역 정보를 확인해 주세요.",
    action: "search",
    actionLabel: "다른 역 선택",
  },
  UNSUPPORTED_JOURNEY: {
    title: "아직 지원하지 않는 여정이에요",
    description: "현재 지원 노선 안에서 다른 역을 선택해 주세요.",
    action: "search",
    actionLabel: "다른 역 선택",
  },
  DATA_MISSING: {
    title: "엘리베이터 경로 정보가 부족해요",
    description:
      "필수 위치 정보가 없어 검증된 엘리베이터 동선을 안내할 수 없습니다.",
    action: "search",
    actionLabel: "다른 역 선택",
  },
  DATA_CONFLICT: {
    title: "경로 정보를 확인 중이에요",
    description:
      "출처별 정보가 달라 검증 전에는 확정된 동선으로 안내하지 않습니다.",
    action: "search",
    actionLabel: "다른 역 선택",
  },
  FACILITY_STATUS_UNKNOWN: {
    title: "승강기 상태를 확인할 수 없어요",
    description:
      "실시간 상태가 확인되지 않았습니다. 잠시 후 다시 확인해 주세요.",
    action: "retry",
    actionLabel: "상태 다시 확인",
  },
  NO_ACCESSIBLE_ROUTE: {
    title: "현재 이용 가능한 엘리베이터 경로가 없어요",
    description: "운행 중지 시설을 제외한 대체 경로를 찾지 못했습니다.",
    action: "retry",
    actionLabel: "대체 경로 다시 찾기",
  },
  DATA_VERSION_UNSUPPORTED: {
    title: "최신 경로 정보가 필요해요",
    description: "저장된 정보와 현재 데이터 버전이 달라 새로 조회해야 합니다.",
    action: "retry",
    actionLabel: "새로 조회",
  },
};

export function presentJourneyError(
  error: JourneyApiError | null,
): JourneyErrorPresentation {
  if (error?.contractError) {
    return (
      byCode[error.contractError.code] ?? {
        title: "경로를 불러오지 못했어요",
        description: error.contractError.message,
        action: error.contractError.retryable ? "retry" : "search",
        actionLabel: error.contractError.retryable
          ? "다시 시도"
          : "다른 역 선택",
      }
    );
  }
  if (error?.kind === "network") {
    return {
      title: "네트워크에 연결할 수 없어요",
      description: "저장된 여정이 없다면 연결 후 다시 시도해 주세요.",
      action: "retry",
      actionLabel: "연결 다시 확인",
    };
  }
  return {
    title: "경로를 불러오지 못했어요",
    description: error?.message ?? "잠시 후 다시 시도해 주세요.",
    action: "retry",
    actionLabel: "다시 시도",
  };
}
