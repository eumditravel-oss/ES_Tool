/*
 * data.js
 * ESC 추정산출 프로그램의 기준 데이터/샘플 DB를 분리해두는 영역입니다.
 * 현재 원본 앱은 자체 내부 데이터를 사용하므로, 이 파일은 향후 DB/API 연동 시 우선 수정하는 기준 파일로 사용합니다.
 */
(function(){
  "use strict";
  window.ESC_DATA = window.ESC_DATA || {
    appName: "ESC 물가변동 조정 — 주식회사 컨코스트",
    companyName: "주식회사 컨코스트",
    sourceMode: "static-split",
    indexSources: {
      material: "한국은행 PPI/API 연동 예정",
      labor: "관리자 수기 입력 / 연 2회",
      equipment: "관리자 수기 입력 / 연 1회",
      standardMarketUnitPrice: "관리자 수기 입력 / 연 2회",
      overheadRate: "관리자 수기 입력 / 연 1회"
    },
    meetingRequirements: [
      "사용자가 확인하고 싶은 비교시점을 기준으로 추정산출",
      "90일 경과와 3% 이상 조건을 동시에 판단",
      "도급내역서상 원가 배분 입력 후 지수 비교",
      "재료비는 API 연동, 노무비 등은 관리자 입력 구조로 관리",
      "정식 보고서 이전 단계의 대상 여부 확인용 웹 서비스로 운영",
      "대상 가능 현장은 보고서 의뢰 또는 담당자 연결로 전환"
    ]
  };
})();
