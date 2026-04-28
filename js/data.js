/*
 * data.js
 * ESC 추정산출 프로그램의 기준 데이터/요건/API 연동 계획을 분리 관리합니다.
 * 기존 화면 출력 방식은 components.js에 보존되어 있으며, 이 파일은 DB/API/영업 연계 기준값을 제공합니다.
 */
(function(){
  "use strict";
  window.ESC_DATA = window.ESC_DATA || {
    appName: "ESC 물가변동 조정 — 주식회사 컨코스트",
    companyName: "주식회사 컨코스트",
    sourceMode: "static-split",
    serviceModel: {
      purpose: "모바일/웹에서 현재 시점 기준 ES 청구 대상 여부를 간편하게 추정",
      membershipPriceGuide: "월 2~3만 원 수준 소액 멤버십",
      salesGoal: "조정률 3% 이상 현장을 정식 보고서 작성 본계약으로 유도"
    },
    frontendRequirements: {
      documentOcr: ["계약서 업로드", "원가계산서 업로드", "공사명/계약자/수요기관/계약금액/계약일 자동 입력"],
      compareDatePolicy: "사용자가 접속한 당일 날짜를 조정기준일 기본값으로 사용",
      outputSummary: ["계약 현황", "조정률", "경과 일수", "예상 등락 금액"],
      salesCta: "조정률 3% 이상 및 90일 경과 시 견적 의뢰 버튼과 담당자 연락처 노출"
    },
    indexSources: {
      material: "한국은행 API(PPI) / 매월 자동 업데이트",
      overheadRate: "조달청 등 공공 API / 자동 수집 검토",
      labor: "관리자 수기 입력 또는 파일 업로드 / 연 2회 + 필요 시 추가",
      equipment: "관리자 수기 입력 또는 파일 업로드 / 연 1회",
      standardMarketUnitPrice: "관리자 수기 입력 또는 파일 업로드 / 연 2회"
    },
    infraPolicy: {
      webRole: "입력 및 결과 확인 UI",
      localServerRole: "복잡한 연산, 대용량 데이터 저장, 정식 보고서 산출",
      reason: "대형 현장의 엑셀 수식 전체 실시간 처리 시 속도/부하 문제가 발생할 수 있음"
    },
    salesContactDefault: {
      name: "컨코스트 담당자",
      phone: "연락처 입력 필요",
      email: "sales@concost.co.kr"
    },
    meetingRequirements: [
      "정식 보고서 전 단계의 ES 대상 여부 추정산출 서비스",
      "사용자는 도급 내역서상 원가를 항목별로 분개 입력",
      "조정기준일은 접속 당일 날짜를 기본값으로 자동 설정",
      "90일 경과와 조정률 3% 이상 조건을 동시에 판단",
      "산출 결과는 한 페이지 안에서 계약 현황/조정률/경과일수/예상 등락금액을 출력",
      "3% 이상 대상 현장에는 견적 의뢰 또는 담당자 연락처를 노출",
      "재료비는 한국은행 PPI API, 제경비율은 조달청 등 API 연동 검토",
      "API 불가 데이터는 관리자 수기 입력 또는 정형 파일 업로드로 관리",
      "복잡한 연산과 저장은 내부 로컬 서버 처리, 웹은 결과 확인 중심"
    ]
  };
})();
