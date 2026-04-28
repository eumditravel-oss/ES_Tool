/* components.js
 * 원본 단일 HTML의 React 앱 본문입니다. 기존 웹 출력 방식을 유지하기 위해 원본 앱 코드를 그대로 보존했습니다.
 */
(function(){
"use strict";
try{
const {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext
} = React;
/* ── localStorage 폴리필: Claude 아티팩트·일반 브라우저 모두 동작 ── */
if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    get: async k => {
      try {
        const v = localStorage.getItem(k);
        return v != null ? {
          value: v
        } : null;
      } catch (e) {
        return null;
      }
    },
    set: async (k, v) => {
      try {
        localStorage.setItem(k, v);
        return {
          value: v
        };
      } catch (e) {
        return null;
      }
    },
    delete: async k => {
      try {
        localStorage.removeItem(k);
        return {
          deleted: true
        };
      } catch (e) {
        return null;
      }
    },
    list: async pfx => {
      try {
        const keys = Object.keys(localStorage).filter(k => !pfx || k.startsWith(pfx));
        return {
          keys
        };
      } catch (e) {
        return {
          keys: []
        };
      }
    }
  };
}

/* ═══════════════════════════════════════════════════════════════════
   ESC 물가변동 계약금액 조정 관리 시스템 v2
   - 첫 화면: 기본정보 입력 마법사 (SetupWizard)
   - 지수 시계열 DB: 시점(YYYYMM)별 지수 입력·조회
   - 반응형: 모바일/웹/태블릿 완전 지원
   근거: 지방계약법 §22, 시행령 §73, 시행규칙 §72
═══════════════════════════════════════════════════════════════════ */

// ── Storage keys ─────────────────────────────────────────────────
const SK = {
  c: "esc-c-v5",
  i: "esc-i-v5",
  ts: "esc-ts-v5",
  setup: "esc-setup-v5"
};

/* ── 관리자 비밀번호: 이 값을 변경하여 사용하세요 ── */
const ADMIN_PW = "1234";

// ── 계약 기본정보 기본값 ──────────────────────────────────────────
const DC = {
  projectName: "",
  contractor: "",
  client: "",
  contractMethod: "계속비",
  bidRate: "",
  contractDate: "",
  contractAmount: "",
  startDate: "",
  completionDate: "",
  bidDate: "",
  compareDate: "",
  adjustNo: 1,
  advanceAmt: 0,
  excludedAmt: 0,
  thresholdRate: 3.0,
  thresholdDays: 90,
  progressPlan: "",
  progressActual: "",
  preparedBy: "",
  preparedDate: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  requestMemo: ""
};

// ── 비목군 기본 구조 (PDF 원본) ───────────────────────────────────
const DI = [{
  id: "A",
  g: "노무비",
  n: "직접노무비",
  c: "A",
  amt: 0,
  xk: "노임단가"
}, {
  id: "A1",
  g: "노무비",
  n: "간접노무비",
  c: "A'",
  amt: 0,
  xk: "노임단가"
}, {
  id: "B",
  g: "경비",
  n: "기계경비",
  c: "B",
  amt: 0,
  xk: "기계경비"
}, {
  id: "Z0",
  g: "경비",
  n: "기타비목군(경비)",
  c: "Z",
  amt: 0,
  xk: "기타비목군"
}, {
  id: "C",
  g: "재료비",
  n: "광산품",
  c: "C",
  amt: 0,
  xk: "광산품"
}, {
  id: "D",
  g: "재료비",
  n: "공산품",
  c: "D",
  amt: 0,
  xk: "공산품"
}, {
  id: "E",
  g: "재료비",
  n: "전력·수도·가스 및 폐기물",
  c: "E",
  amt: 0,
  xk: "전력수도가스"
}, {
  id: "F",
  g: "재료비",
  n: "농림수산품",
  c: "F",
  amt: 0,
  xk: "농림수산품"
}, {
  id: "G1",
  g: "표준시장단가",
  n: "토목부분 표준시장단가",
  c: "G1",
  amt: 0,
  xk: "표준_토목"
}, {
  id: "G2",
  g: "표준시장단가",
  n: "건축부분 표준시장단가",
  c: "G2",
  amt: 0,
  xk: "표준_건축"
}, {
  id: "G3",
  g: "표준시장단가",
  n: "기계설비부분 표준시장단가",
  c: "G3",
  amt: 0,
  xk: "표준_기계설비"
}, {
  id: "G4",
  g: "표준시장단가",
  n: "전기부분 표준시장단가",
  c: "G4",
  amt: 0,
  xk: "표준_전기"
}, {
  id: "G5",
  g: "표준시장단가",
  n: "통신부분 표준시장단가",
  c: "G5",
  amt: 0,
  xk: "표준_통신"
}, {
  id: "H",
  g: "제경비",
  n: "산재보험료",
  c: "H",
  amt: 0,
  xk: "산재보험료"
}, {
  id: "I",
  g: "제경비",
  n: "산업안전보건관리비",
  c: "I",
  amt: 0,
  xk: "산업안전보건관리비"
}, {
  id: "J",
  g: "제경비",
  n: "고용보험료",
  c: "J",
  amt: 0,
  xk: "고용보험료"
}, {
  id: "K",
  g: "제경비",
  n: "건설근로자 퇴직공제부금비",
  c: "K",
  amt: 0,
  xk: "고용보험료"
}, {
  id: "L",
  g: "제경비",
  n: "국민건강보험료",
  c: "L",
  amt: 0,
  xk: "고용보험료"
}, {
  id: "M",
  g: "제경비",
  n: "국민연금보험료",
  c: "M",
  amt: 0,
  xk: "고용보험료"
}, {
  id: "N",
  g: "제경비",
  n: "노인장기요양보험료",
  c: "N",
  amt: 0,
  xk: "노인장기요양"
}, {
  id: "Z1",
  g: "제경비",
  n: "기타경비",
  c: "Z",
  amt: 0,
  xk: "기타비목군"
}, {
  id: "Z2",
  g: "제경비",
  n: "환경보전비",
  c: "Z",
  amt: 0,
  xk: "기타비목군"
}, {
  id: "Z3",
  g: "제경비",
  n: "지급보증수수료",
  c: "Z",
  amt: 0,
  xk: "기타비목군"
}, {
  id: "Z4",
  g: "제경비",
  n: "건설기계대여금지급보증서발급액",
  c: "Z",
  amt: 0,
  xk: "기타비목군"
}, {
  id: "ZA",
  g: "제경비",
  n: "안전관리비",
  c: "Z",
  amt: 0,
  xk: "기타비목군"
}];

// ── 지수 메타 (ID·명칭·출처·비목매핑) ─────────────────────────────
// ── 지수 유형 메타데이터 ─────────────────────────────────────────────
const IX_TYPE = {
  "노임단가": {
    type: "value",
    unit: "상대지수",
    hint: "반기별 고시 — 기준시점(=100) 대비 상대값 입력"
  },
  "기계경비": {
    type: "value",
    unit: "상대지수",
    hint: "손료 평균값 상대지수 — 기준시점=100"
  },
  "기타비목군": {
    type: "index",
    unit: "p",
    hint: "소비자물가지수(CPI) — 통계청, 기준시점=100"
  },
  "광산품": {
    type: "ppi",
    unit: "p",
    hint: "생산자물가지수 절대값 — 한국은행 ECOS"
  },
  "공산품": {
    type: "ppi",
    unit: "p",
    hint: "생산자물가지수 절대값 — 한국은행 ECOS"
  },
  "전력수도가스": {
    type: "ppi",
    unit: "p",
    hint: "생산자물가지수 절대값 — 한국은행 ECOS"
  },
  "농림수산품": {
    type: "ppi",
    unit: "p",
    hint: "생산자물가지수 절대값 — 한국은행 ECOS"
  },
  "표준_토목": {
    type: "index",
    unit: "p",
    hint: "표준시장단가 상대지수 — 건설연, 반기 공시"
  },
  "표준_건축": {
    type: "index",
    unit: "p",
    hint: "표준시장단가 상대지수 — 건설연, 반기 공시"
  },
  "표준_기계설비": {
    type: "index",
    unit: "p",
    hint: "표준시장단가 상대지수 — 건설연, 반기 공시"
  },
  "표준_전기": {
    type: "index",
    unit: "p",
    hint: "표준시장단가 상대지수 — 건설연, 반기 공시"
  },
  "표준_통신": {
    type: "index",
    unit: "p",
    hint: "표준시장단가 상대지수 — 건설연, 반기 공시"
  },
  "산재보험료": {
    type: "rate",
    unit: "상대지수",
    hint: "산재보험요율 상대지수 — 고용노동부 고시"
  },
  "산업안전보건관리비": {
    type: "rate",
    unit: "상대지수",
    hint: "안전관리비율 상대지수 — 고용노동부 고시"
  },
  "고용보험료": {
    type: "rate",
    unit: "상대지수",
    hint: "고용·건강·연금 요율 상대지수 (J·K·L·M 공통)"
  },
  "노인장기요양": {
    type: "rate",
    unit: "상대지수",
    hint: "장기요양보험요율 상대지수 — 건강보험공단 고시"
  }
};
const TYPE_COLOR = {
  "value": "#3b82f6",
  "ppi": "#06b6d4",
  "rate": "#f59e0b",
  "index": "#8b5cf6"
};
const TYPE_LABEL = {
  "value": "값형",
  "ppi": "PPI",
  "rate": "요율형",
  "index": "지수형"
};
const IX_META = [{
  id: "노임단가",
  n: "건설업 노임단가",
  cat: "노무비",
  src: "대한건설협회",
  note: "직종별 임금실태조사"
}, {
  id: "기계경비",
  n: "건설기계경비",
  cat: "경비",
  src: "한국건설기술연구원",
  note: "건설기계 시중임대료"
}, {
  id: "기타비목군",
  n: "소비자물가지수 (기타비목군)",
  cat: "기타",
  src: "통계청 CPI",
  note: "소비자물가지수 준용"
}, {
  id: "광산품",
  n: "광산품 생산자물가지수",
  cat: "재료비",
  src: "한국은행 PPI",
  note: "ECOS 102Y004/AA"
}, {
  id: "공산품",
  n: "공산품 생산자물가지수",
  cat: "재료비",
  src: "한국은행 PPI",
  note: "ECOS 102Y004/AC"
}, {
  id: "전력수도가스",
  n: "전력·수도·가스 및 폐기물",
  cat: "재료비",
  src: "한국은행 PPI",
  note: "ECOS 102Y004/AD"
}, {
  id: "농림수산품",
  n: "농림수산품 생산자물가지수",
  cat: "재료비",
  src: "한국은행 PPI",
  note: "ECOS 102Y004/AB"
}, {
  id: "표준_토목",
  n: "토목 표준시장단가 (G1)",
  cat: "표준시장단가",
  src: "한국건설기술연구원",
  note: "표준시장단가 공시"
}, {
  id: "표준_건축",
  n: "건축 표준시장단가 (G2)",
  cat: "표준시장단가",
  src: "한국건설기술연구원",
  note: "표준시장단가 공시"
}, {
  id: "표준_기계설비",
  n: "기계설비 표준시장단가 (G3)",
  cat: "표준시장단가",
  src: "한국건설기술연구원",
  note: "표준시장단가 공시"
}, {
  id: "표준_전기",
  n: "전기 표준시장단가 (G4)",
  cat: "표준시장단가",
  src: "한국건설기술연구원",
  note: "표준시장단가 공시"
}, {
  id: "표준_통신",
  n: "통신 표준시장단가 (G5)",
  cat: "표준시장단가",
  src: "한국건설기술연구원",
  note: "표준시장단가 공시"
}, {
  id: "산재보험료",
  n: "산재보험요율 지수",
  cat: "제경비",
  src: "고용노동부",
  note: "업종별 산재보험요율"
}, {
  id: "산업안전보건관리비",
  n: "산업안전보건관리비 지수",
  cat: "제경비",
  src: "고용노동부",
  note: "안전관리비 기준 고시"
}, {
  id: "고용보험료",
  n: "고용·건강·연금보험 요율지수",
  cat: "제경비",
  src: "고용노동부/복지부",
  note: "J·K·L·M 공통"
}, {
  id: "노인장기요양",
  n: "노인장기요양보험 요율지수",
  cat: "제경비",
  src: "건강보험공단",
  note: "장기요양보험요율 고시"
}];

// ── 지수 시계열 DB (2021.01~2024.12 월별 사전입력값) ──────────────
const DEFAULT_TS = {
  "202101": {
    "노임단가": 88.52,
    "기계경비": 88.0,
    "기타비목군": 102.5,
    "광산품": 122.1,
    "공산품": 104.2,
    "전력수도가스": 113.5,
    "농림수산품": 108.3,
    "표준_토목": 83.5,
    "표준_건축": 85.1,
    "표준_기계설비": 86.2,
    "표준_전기": 87.3,
    "표준_통신": 86.8,
    "산재보험료": 102.1,
    "산업안전보건관리비": 98.5,
    "고용보험료": 97.2,
    "노인장기요양": 93.2
  },
  "202102": {
    "노임단가": 88.52,
    "기계경비": 88.31,
    "기타비목군": 102.78,
    "광산품": 122.84,
    "공산품": 104.92,
    "전력수도가스": 113.84,
    "농림수산품": 108.58,
    "표준_토목": 83.5,
    "표준_건축": 85.1,
    "표준_기계설비": 86.2,
    "표준_전기": 87.3,
    "표준_통신": 86.8,
    "산재보험료": 102.09,
    "산업안전보건관리비": 98.51,
    "고용보험료": 97.21,
    "노인장기요양": 93.23
  },
  "202103": {
    "노임단가": 89.01,
    "기계경비": 88.62,
    "기타비목군": 103.06,
    "광산품": 123.58,
    "공산품": 105.64,
    "전력수도가스": 114.18,
    "농림수산품": 108.86,
    "표준_토목": 83.5,
    "표준_건축": 85.1,
    "표준_기계설비": 86.2,
    "표준_전기": 87.3,
    "표준_통신": 86.8,
    "산재보험료": 102.09,
    "산업안전보건관리비": 98.51,
    "고용보험료": 97.23,
    "노인장기요양": 93.26
  },
  "202104": {
    "노임단가": 89.25,
    "기계경비": 88.94,
    "기타비목군": 103.34,
    "광산품": 124.32,
    "공산품": 106.36,
    "전력수도가스": 114.52,
    "농림수산품": 109.14,
    "표준_토목": 83.5,
    "표준_건축": 85.1,
    "표준_기계설비": 86.2,
    "표준_전기": 87.3,
    "표준_통신": 86.8,
    "산재보험료": 102.08,
    "산업안전보건관리비": 98.52,
    "고용보험료": 97.24,
    "노인장기요양": 93.29
  },
  "202105": {
    "노임단가": 89.5,
    "기계경비": 89.25,
    "기타비목군": 103.62,
    "광산품": 125.06,
    "공산품": 107.08,
    "전력수도가스": 114.86,
    "농림수산품": 109.42,
    "표준_토목": 83.5,
    "표준_건축": 85.1,
    "표준_기계설비": 86.2,
    "표준_전기": 87.3,
    "표준_통신": 86.8,
    "산재보험료": 102.08,
    "산업안전보건관리비": 98.53,
    "고용보험료": 97.25,
    "노인장기요양": 93.32
  },
  "202106": {
    "노임단가": 89.75,
    "기계경비": 89.56,
    "기타비목군": 103.9,
    "광산품": 125.8,
    "공산품": 107.8,
    "전력수도가스": 115.2,
    "농림수산품": 109.7,
    "표준_토목": 83.5,
    "표준_건축": 85.1,
    "표준_기계설비": 86.2,
    "표준_전기": 87.3,
    "표준_통신": 86.8,
    "산재보험료": 102.07,
    "산업안전보건관리비": 98.53,
    "고용보험료": 97.27,
    "노인장기요양": 93.34
  },
  "202107": {
    "노임단가": 89.99,
    "기계경비": 89.88,
    "기타비목군": 104.05,
    "광산품": 126.23,
    "공산품": 108.42,
    "전력수도가스": 115.47,
    "농림수산품": 109.77,
    "표준_토목": 83.5,
    "표준_건축": 85.1,
    "표준_기계설비": 86.2,
    "표준_전기": 87.3,
    "표준_통신": 86.8,
    "산재보험료": 102.06,
    "산업안전보건관리비": 98.54,
    "고용보험료": 97.28,
    "노인장기요양": 93.37
  },
  "202108": {
    "노임단가": 90.23,
    "기계경비": 90.19,
    "기타비목군": 104.2,
    "광산품": 126.67,
    "공산품": 109.03,
    "전력수도가스": 115.73,
    "농림수산품": 109.83,
    "표준_토목": 83.5,
    "표준_건축": 85.1,
    "표준_기계설비": 86.2,
    "표준_전기": 87.3,
    "표준_통신": 86.8,
    "산재보험료": 102.06,
    "산업안전보건관리비": 98.55,
    "고용보험료": 97.29,
    "노인장기요양": 93.4
  },
  "202109": {
    "노임단가": 90.48,
    "기계경비": 90.5,
    "기타비목군": 104.35,
    "광산품": 127.1,
    "공산품": 109.65,
    "전력수도가스": 116.0,
    "농림수산품": 109.9,
    "표준_토목": 86.2,
    "표준_건축": 87.8,
    "표준_기계설비": 88.5,
    "표준_전기": 89.6,
    "표준_통신": 89.1,
    "산재보험료": 102.05,
    "산업안전보건관리비": 98.56,
    "고용보험료": 97.3,
    "노인장기요양": 93.43
  },
  "202110": {
    "노임단가": 90.48,
    "기계경비": 90.53,
    "기타비목군": 104.5,
    "광산품": 127.53,
    "공산품": 110.27,
    "전력수도가스": 116.27,
    "농림수산품": 109.97,
    "표준_토목": 86.2,
    "표준_건축": 87.8,
    "표준_기계설비": 88.5,
    "표준_전기": 89.6,
    "표준_통신": 89.1,
    "산재보험료": 102.05,
    "산업안전보건관리비": 98.56,
    "고용보험료": 97.32,
    "노인장기요양": 93.46
  },
  "202111": {
    "노임단가": 90.48,
    "기계경비": 90.56,
    "기타비목군": 104.65,
    "광산품": 127.97,
    "공산품": 110.88,
    "전력수도가스": 116.53,
    "농림수산품": 110.03,
    "표준_토목": 86.2,
    "표준_건축": 87.8,
    "표준_기계설비": 88.5,
    "표준_전기": 89.6,
    "표준_통신": 89.1,
    "산재보험료": 102.04,
    "산업안전보건관리비": 98.57,
    "고용보험료": 97.33,
    "노인장기요양": 93.49
  },
  "202112": {
    "노임단가": 90.48,
    "기계경비": 90.59,
    "기타비목군": 104.8,
    "광산품": 128.4,
    "공산품": 111.5,
    "전력수도가스": 116.8,
    "농림수산품": 110.1,
    "표준_토목": 86.2,
    "표준_건축": 87.8,
    "표준_기계설비": 88.5,
    "표준_전기": 89.6,
    "표준_통신": 89.1,
    "산재보험료": 102.03,
    "산업안전보건관리비": 98.58,
    "고용보험료": 97.34,
    "노인장기요양": 93.52
  },
  "202201": {
    "노임단가": 90.48,
    "기계경비": 93.14,
    "기타비목군": 107.07,
    "광산품": 134.84,
    "공산품": 117.94,
    "전력수도가스": 124.09,
    "농림수산품": 112.66,
    "표준_토목": 86.2,
    "표준_건축": 87.8,
    "표준_기계설비": 88.5,
    "표준_전기": 89.6,
    "표준_통신": 89.1,
    "산재보험료": 101.5,
    "산업안전보건관리비": 99.2,
    "고용보험료": 98.5,
    "노인장기요양": 96.1
  },
  "202202": {
    "노임단가": 90.48,
    "기계경비": 93.17,
    "기타비목군": 107.1,
    "광산품": 134.91,
    "공산품": 118.01,
    "전력수도가스": 124.17,
    "농림수산품": 112.69,
    "표준_토목": 86.2,
    "표준_건축": 87.8,
    "표준_기계설비": 88.5,
    "표준_전기": 89.6,
    "표준_통신": 89.1,
    "산재보험료": 101.5,
    "산업안전보건관리비": 99.21,
    "고용보험료": 98.51,
    "노인장기요양": 96.12
  },
  "202203": {
    "노임단가": 93.14,
    "기계경비": 93.2,
    "기타비목군": 107.12,
    "광산품": 134.98,
    "공산품": 118.08,
    "전력수도가스": 124.25,
    "농림수산품": 112.71,
    "표준_토목": 89.8,
    "표준_건축": 90.5,
    "표준_기계설비": 91.3,
    "표준_전기": 92.1,
    "표준_통신": 91.8,
    "산재보험료": 101.49,
    "산업안전보건관리비": 99.21,
    "고용보험료": 98.52,
    "노인장기요양": 96.14
  },
  "202204": {
    "노임단가": 93.14,
    "기계경비": 93.68,
    "기타비목군": 107.15,
    "광산품": 135.06,
    "공산품": 118.16,
    "전력수도가스": 124.34,
    "농림수산품": 112.74,
    "표준_토목": 89.8,
    "표준_건축": 90.5,
    "표준_기계설비": 91.3,
    "표준_전기": 92.1,
    "표준_통신": 91.8,
    "산재보험료": 101.48,
    "산업안전보건관리비": 99.22,
    "고용보험료": 98.53,
    "노인장기요양": 96.16
  },
  "202205": {
    "노임단가": 93.14,
    "기계경비": 94.17,
    "기타비목군": 107.17,
    "광산품": 135.13,
    "공산품": 118.23,
    "전력수도가스": 124.42,
    "농림수산품": 112.77,
    "표준_토목": 89.8,
    "표준_건축": 90.5,
    "표준_기계설비": 91.3,
    "표준_전기": 92.1,
    "표준_통신": 91.8,
    "산재보험료": 101.48,
    "산업안전보건관리비": 99.22,
    "고용보험료": 98.54,
    "노인장기요양": 96.18
  },
  "202206": {
    "노임단가": 93.14,
    "기계경비": 94.65,
    "기타비목군": 107.2,
    "광산품": 135.2,
    "공산품": 118.3,
    "전력수도가스": 124.5,
    "농림수산품": 112.8,
    "표준_토목": 89.8,
    "표준_건축": 90.5,
    "표준_기계설비": 91.3,
    "표준_전기": 92.1,
    "표준_통신": 91.8,
    "산재보험료": 101.47,
    "산업안전보건관리비": 99.23,
    "고용보험료": 98.55,
    "노인장기요양": 96.2
  },
  "202207": {
    "노임단가": 93.14,
    "기계경비": 95.13,
    "기타비목군": 107.52,
    "광산품": 134.35,
    "공산품": 118.98,
    "전력수도가스": 126.48,
    "농림수산품": 112.92,
    "표준_토목": 89.8,
    "표준_건축": 90.5,
    "표준_기계설비": 91.3,
    "표준_전기": 92.1,
    "표준_통신": 91.8,
    "산재보험료": 101.47,
    "산업안전보건관리비": 99.24,
    "고용보험료": 98.55,
    "노인장기요양": 96.23
  },
  "202208": {
    "노임단가": 93.14,
    "기계경비": 95.62,
    "기타비목군": 107.83,
    "광산품": 133.5,
    "공산품": 119.67,
    "전력수도가스": 128.47,
    "농림수산품": 113.03,
    "표준_토목": 89.8,
    "표준_건축": 90.5,
    "표준_기계설비": 91.3,
    "표준_전기": 92.1,
    "표준_통신": 91.8,
    "산재보험료": 101.47,
    "산업안전보건관리비": 99.24,
    "고용보험료": 98.56,
    "노인장기요양": 96.25
  },
  "202209": {
    "노임단가": 96.08,
    "기계경비": 96.1,
    "기타비목군": 108.15,
    "광산품": 132.65,
    "공산품": 120.35,
    "전력수도가스": 130.45,
    "농림수산품": 113.15,
    "표준_토목": 93.4,
    "표준_건축": 93.9,
    "표준_기계설비": 94.6,
    "표준_전기": 95.3,
    "표준_통신": 94.9,
    "산재보험료": 101.46,
    "산업안전보건관리비": 99.25,
    "고용보험료": 98.57,
    "노인장기요양": 96.27
  },
  "202210": {
    "노임단가": 96.08,
    "기계경비": 96.13,
    "기타비목군": 108.47,
    "광산품": 131.8,
    "공산품": 121.03,
    "전력수도가스": 132.43,
    "농림수산품": 113.27,
    "표준_토목": 93.4,
    "표준_건축": 93.9,
    "표준_기계설비": 94.6,
    "표준_전기": 95.3,
    "표준_통신": 94.9,
    "산재보험료": 101.45,
    "산업안전보건관리비": 99.25,
    "고용보험료": 98.58,
    "노인장기요양": 96.29
  },
  "202211": {
    "노임단가": 96.08,
    "기계경비": 96.15,
    "기타비목군": 108.78,
    "광산품": 130.95,
    "공산품": 121.72,
    "전력수도가스": 134.42,
    "농림수산품": 113.38,
    "표준_토목": 93.4,
    "표준_건축": 93.9,
    "표준_기계설비": 94.6,
    "표준_전기": 95.3,
    "표준_통신": 94.9,
    "산재보험료": 101.45,
    "산업안전보건관리비": 99.26,
    "고용보험료": 98.59,
    "노인장기요양": 96.31
  },
  "202212": {
    "노임단가": 96.08,
    "기계경비": 96.18,
    "기타비목군": 109.1,
    "광산품": 130.1,
    "공산품": 122.4,
    "전력수도가스": 136.4,
    "농림수산품": 113.5,
    "표준_토목": 93.4,
    "표준_건축": 93.9,
    "표준_기계설비": 94.6,
    "표준_전기": 95.3,
    "표준_통신": 94.9,
    "산재보험료": 101.44,
    "산업안전보건관리비": 99.27,
    "고용보험료": 98.6,
    "노인장기요양": 96.33
  },
  "202301": {
    "노임단가": 96.08,
    "기계경비": 98.45,
    "기타비목군": 110.43,
    "광산품": 132.66,
    "공산품": 121.83,
    "전력수도가스": 139.05,
    "농림수산품": 113.88,
    "표준_토목": 93.4,
    "표준_건축": 93.9,
    "표준_기계설비": 94.6,
    "표준_전기": 95.3,
    "표준_통신": 94.9,
    "산재보험료": 101.0,
    "산업안전보건관리비": 99.8,
    "고용보험료": 99.4,
    "노인장기요양": 98.2
  },
  "202302": {
    "노임단가": 96.08,
    "기계경비": 98.47,
    "기타비목군": 110.44,
    "광산품": 132.69,
    "공산품": 121.83,
    "전력수도가스": 139.08,
    "농림수산품": 113.88,
    "표준_토목": 93.4,
    "표준_건축": 93.9,
    "표준_기계설비": 94.6,
    "표준_전기": 95.3,
    "표준_통신": 94.9,
    "산재보험료": 100.9,
    "산업안전보건관리비": 99.82,
    "고용보험료": 99.46,
    "노인장기요양": 98.38
  },
  "202303": {
    "노임단가": 98.23,
    "기계경비": 98.5,
    "기타비목군": 110.46,
    "광산품": 132.71,
    "공산품": 121.82,
    "전력수도가스": 139.11,
    "농림수산품": 113.89,
    "표준_토목": 96.2,
    "표준_건축": 97.2,
    "표준_기계설비": 97.5,
    "표준_전기": 98.1,
    "표준_통신": 97.8,
    "산재보험료": 100.8,
    "산업안전보건관리비": 99.84,
    "고용보험료": 99.52,
    "노인장기요양": 98.56
  },
  "202304": {
    "노임단가": 98.23,
    "기계경비": 98.75,
    "기타비목군": 110.47,
    "광산품": 132.74,
    "공산품": 121.81,
    "전력수도가스": 139.14,
    "농림수산품": 113.89,
    "표준_토목": 96.2,
    "표준_건축": 97.2,
    "표준_기계설비": 97.5,
    "표준_전기": 98.1,
    "표준_통신": 97.8,
    "산재보험료": 100.7,
    "산업안전보건관리비": 99.86,
    "고용보험료": 99.58,
    "노인장기요양": 98.74
  },
  "202305": {
    "노임단가": 98.23,
    "기계경비": 99.0,
    "기타비목군": 110.49,
    "광산품": 132.77,
    "공산품": 121.81,
    "전력수도가스": 139.17,
    "농림수산품": 113.9,
    "표준_토목": 96.2,
    "표준_건축": 97.2,
    "표준_기계설비": 97.5,
    "표준_전기": 98.1,
    "표준_통신": 97.8,
    "산재보험료": 100.6,
    "산업안전보건관리비": 99.88,
    "고용보험료": 99.64,
    "노인장기요양": 98.92
  },
  "202306": {
    "노임단가": 98.23,
    "기계경비": 99.25,
    "기타비목군": 110.5,
    "광산품": 132.8,
    "공산품": 121.8,
    "전력수도가스": 139.2,
    "농림수산품": 113.9,
    "표준_토목": 96.2,
    "표준_건축": 97.2,
    "표준_기계설비": 97.5,
    "표준_전기": 98.1,
    "표준_통신": 97.8,
    "산재보험료": 100.5,
    "산업안전보건관리비": 99.9,
    "고용보험료": 99.7,
    "노인장기요양": 99.1
  },
  "202307": {
    "노임단가": 98.23,
    "기계경비": 99.5,
    "기타비목군": 108.4,
    "광산품": 133.23,
    "공산품": 122.08,
    "전력수도가스": 139.56,
    "농림수산품": 113.98,
    "표준_토목": 96.2,
    "표준_건축": 97.2,
    "표준_기계설비": 97.5,
    "표준_전기": 98.1,
    "표준_통신": 97.8,
    "산재보험료": 100.4,
    "산업안전보건관리비": 99.92,
    "고용보험료": 99.76,
    "노인장기요양": 99.28
  },
  "202308": {
    "노임단가": 98.23,
    "기계경비": 99.75,
    "기타비목군": 106.3,
    "광산품": 133.65,
    "공산품": 122.36,
    "전력수도가스": 139.93,
    "농림수산품": 114.06,
    "표준_토목": 96.2,
    "표준_건축": 97.2,
    "표준_기계설비": 97.5,
    "표준_전기": 98.1,
    "표준_통신": 97.8,
    "산재보험료": 100.3,
    "산업안전보건관리비": 99.94,
    "고용보험료": 99.82,
    "노인장기요양": 99.46
  },
  "202309": {
    "노임단가": 100.0,
    "기계경비": 100.0,
    "기타비목군": 104.2,
    "광산품": 134.08,
    "공산품": 122.63,
    "전력수도가스": 140.29,
    "농림수산품": 114.13,
    "표준_토목": 100.0,
    "표준_건축": 100.0,
    "표준_기계설비": 100.0,
    "표준_전기": 100.0,
    "표준_통신": 100.0,
    "산재보험료": 100.2,
    "산업안전보건관리비": 99.96,
    "고용보험료": 99.88,
    "노인장기요양": 99.64
  },
  "202310": {
    "노임단가": 100.0,
    "기계경비": 100.04,
    "기타비목군": 102.1,
    "광산품": 134.5,
    "공산품": 122.91,
    "전력수도가스": 140.66,
    "농림수산품": 114.21,
    "표준_토목": 100.0,
    "표준_건축": 100.0,
    "표준_기계설비": 100.0,
    "표준_전기": 100.0,
    "표준_통신": 100.0,
    "산재보험료": 100.1,
    "산업안전보건관리비": 99.98,
    "고용보험료": 99.94,
    "노인장기요양": 99.82
  },
  "202311": {
    "노임단가": 100.0,
    "기계경비": 100.08,
    "기타비목군": 100.0,
    "광산품": 134.93,
    "공산품": 123.19,
    "전력수도가스": 141.02,
    "농림수산품": 114.29,
    "표준_토목": 100.0,
    "표준_건축": 100.0,
    "표준_기계설비": 100.0,
    "표준_전기": 100.0,
    "표준_통신": 100.0,
    "산재보험료": 100.0,
    "산업안전보건관리비": 100.0,
    "고용보험료": 100.0,
    "노인장기요양": 100.0
  },
  "202312": {
    "노임단가": 100.0,
    "기계경비": 100.12,
    "기타비목군": 100.02,
    "광산품": 134.93,
    "공산품": 123.2,
    "전력수도가스": 141.05,
    "농림수산품": 114.3,
    "표준_토목": 100.0,
    "표준_건축": 100.0,
    "표준_기계설비": 100.0,
    "표준_전기": 100.0,
    "표준_통신": 100.0,
    "산재보험료": 99.98,
    "산업안전보건관리비": 100.02,
    "고용보험료": 100.02,
    "노인장기요양": 100.03
  },
  "202401": {
    "노임단가": 100.0,
    "기계경비": 103.54,
    "기타비목군": 101.46,
    "광산품": 135.36,
    "공산품": 123.94,
    "전력수도가스": 143.52,
    "농림수산품": 114.9,
    "표준_토목": 100.0,
    "표준_건축": 100.0,
    "표준_기계설비": 100.0,
    "표준_전기": 100.0,
    "표준_통신": 100.0,
    "산재보험료": 98.12,
    "산업안전보건관리비": 101.42,
    "고용보험료": 101.98,
    "노인장기요양": 103.1
  },
  "202402": {
    "노임단가": 100.0,
    "기계경비": 103.58,
    "기타비목군": 101.47,
    "광산품": 135.37,
    "공산품": 123.95,
    "전력수도가스": 143.55,
    "농림수산품": 114.91,
    "표준_토목": 100.0,
    "표준_건축": 100.0,
    "표준_기계설비": 100.0,
    "표준_전기": 100.0,
    "표준_통신": 100.0,
    "산재보험료": 98.11,
    "산업안전보건관리비": 101.42,
    "고용보험료": 101.99,
    "노인장기요양": 103.11
  },
  "202403": {
    "노임단가": 101.99,
    "기계경비": 103.62,
    "기타비목군": 101.49,
    "광산품": 135.37,
    "공산품": 123.95,
    "전력수도가스": 143.57,
    "농림수산품": 114.92,
    "표준_토목": 109.21,
    "표준_건축": 105.8,
    "표준_기계설비": 105.63,
    "표준_전기": 103.92,
    "표준_통신": 104.43,
    "산재보험료": 98.11,
    "산업안전보건관리비": 101.43,
    "고용보험료": 101.99,
    "노인장기요양": 103.12
  },
  "202404": {
    "노임단가": 101.99,
    "기계경비": 103.88,
    "기타비목군": 101.5,
    "광산품": 135.38,
    "공산품": 123.96,
    "전력수도가스": 143.6,
    "농림수산품": 114.92,
    "표준_토목": 109.21,
    "표준_건축": 105.8,
    "표준_기계설비": 105.63,
    "표준_전기": 103.92,
    "표준_통신": 104.43,
    "산재보험료": 98.1,
    "산업안전보건관리비": 101.43,
    "고용보험료": 102.0,
    "노인장기요양": 103.13
  },
  "202405": {
    "노임단가": 101.99,
    "기계경비": 104.15,
    "기타비목군": 101.52,
    "광산품": 135.38,
    "공산품": 123.97,
    "전력수도가스": 143.63,
    "농림수산품": 114.93,
    "표준_토목": 109.21,
    "표준_건축": 105.8,
    "표준_기계설비": 105.63,
    "표준_전기": 103.92,
    "표준_통신": 104.43,
    "산재보험료": 98.1,
    "산업안전보건관리비": 101.44,
    "고용보험료": 102.0,
    "노인장기요양": 103.14
  },
  "202406": {
    "노임단가": 101.99,
    "기계경비": 104.41,
    "기타비목군": 101.8,
    "광산품": 135.6,
    "공산품": 124.1,
    "전력수도가스": 144.1,
    "농림수산품": 115.1,
    "표준_토목": 109.21,
    "표준_건축": 105.8,
    "표준_기계설비": 105.63,
    "표준_전기": 103.92,
    "표준_통신": 104.43,
    "산재보험료": 98.09,
    "산업안전보건관리비": 101.44,
    "고용보험료": 102.01,
    "노인장기요양": 103.16
  },
  "202407": {
    "노임단가": 101.99,
    "기계경비": 104.67,
    "기타비목군": 101.88,
    "광산품": 135.68,
    "공산품": 124.22,
    "전력수도가스": 144.23,
    "농림수산품": 115.18,
    "표준_토목": 109.21,
    "표준_건축": 105.8,
    "표준_기계설비": 105.63,
    "표준_전기": 103.92,
    "표준_통신": 104.43,
    "산재보험료": 98.08,
    "산업안전보건관리비": 101.44,
    "고용보험료": 102.01,
    "노인장기요양": 103.17
  },
  "202408": {
    "노임단가": 101.99,
    "기계경비": 104.94,
    "기타비목군": 101.97,
    "광산품": 135.77,
    "공산품": 124.33,
    "전력수도가스": 144.37,
    "농림수산품": 115.27,
    "표준_토목": 109.21,
    "표준_건축": 105.8,
    "표준_기계설비": 105.63,
    "표준_전기": 103.92,
    "표준_통신": 104.43,
    "산재보험료": 98.08,
    "산업안전보건관리비": 101.45,
    "고용보험료": 102.02,
    "노인장기요양": 103.18
  },
  "202409": {
    "노임단가": 103.75,
    "기계경비": 105.2,
    "기타비목군": 102.05,
    "광산품": 135.85,
    "공산품": 124.45,
    "전력수도가스": 144.5,
    "농림수산품": 115.35,
    "표준_토목": 111.5,
    "표준_건축": 107.9,
    "표준_기계설비": 107.5,
    "표준_전기": 105.8,
    "표준_통신": 106.1,
    "산재보험료": 98.07,
    "산업안전보건관리비": 101.45,
    "고용보험료": 102.02,
    "노인장기요양": 103.19
  },
  "202410": {
    "노임단가": 103.75,
    "기계경비": 105.2,
    "기타비목군": 102.13,
    "광산품": 135.93,
    "공산품": 124.57,
    "전력수도가스": 144.63,
    "농림수산품": 115.43,
    "표준_토목": 111.5,
    "표준_건축": 107.9,
    "표준_기계설비": 107.5,
    "표준_전기": 105.8,
    "표준_통신": 106.1,
    "산재보험료": 98.06,
    "산업안전보건관리비": 101.45,
    "고용보험료": 102.03,
    "노인장기요양": 103.2
  },
  "202411": {
    "노임단가": 103.75,
    "기계경비": 105.2,
    "기타비목군": 102.22,
    "광산품": 136.02,
    "공산품": 124.68,
    "전력수도가스": 144.77,
    "농림수산품": 115.52,
    "표준_토목": 111.5,
    "표준_건축": 107.9,
    "표준_기계설비": 107.5,
    "표준_전기": 105.8,
    "표준_통신": 106.1,
    "산재보험료": 98.06,
    "산업안전보건관리비": 101.46,
    "고용보험료": 102.03,
    "노인장기요양": 103.21
  },
  "202412": {
    "노임단가": 103.75,
    "기계경비": 105.2,
    "기타비목군": 102.3,
    "광산품": 136.1,
    "공산품": 124.8,
    "전력수도가스": 144.9,
    "농림수산품": 115.6,
    "표준_토목": 111.5,
    "표준_건축": 107.9,
    "표준_기계설비": 107.5,
    "표준_전기": 105.8,
    "표준_통신": 106.1,
    "산재보험료": 98.05,
    "산업안전보건관리비": 101.46,
    "고용보험료": 102.04,
    "노인장기요양": 103.22
  }
};

// ── 조천정수장 샘플 데이터 ─────────────────────────────────────────
const SAMPLE_CT = {
  projectName: "조천정수장 고도정수처리시설 전기공사",
  contractor: "영산전기㈜",
  client: "제주특별자치도 상하수도본부",
  contractMethod: "계속비",
  bidRate: "",
  contractDate: "2023-12-15",
  contractAmount: 2224344990,
  startDate: "2023-12-15",
  completionDate: "2026-12-13",
  bidDate: "",
  compareDate: "",
  // 사용자가 직접 입력
  adjustNo: 1,
  advanceAmt: 0,
  excludedAmt: 0,
  thresholdRate: 3.0,
  thresholdDays: 90,
  progressPlan: "",
  progressActual: "",
  preparedBy: "주식회사 컨코스트",
  preparedDate: "2024-08"
};
const SAMPLE_ITEMS = DI.map(it => {
  const am = {
    A: 876249835,
    A1: 120046227,
    B: 11941085,
    D: 427799921,
    H: 36862954,
    I: 37193283,
    J: 10062590,
    K: 23127515,
    L: 35646540,
    M: 45249487,
    N: 4566321,
    Z1: 96838526,
    ZA: 1700000
  };
  return {
    ...it,
    amt: am[it.id] || 0
  };
});

// ═══════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════
const nv = v => Number(v) || 0;
const fmtW = v => Math.round(nv(v)).toLocaleString("ko-KR");
const fmtP = (v, d = 2) => Number(v).toFixed(d);
const fmtD = (v, d = 4) => Number(v).toFixed(d);
const days = (a, b) => !a || !b ? 0 : Math.floor((new Date(b) - new Date(a)) / 86400000);
const fl4 = v => Math.floor(v * 10000) / 10000; // 소수점 5째자리 절사
const toKey = d => d ? d.slice(0, 7).replace("-", "") : null; // "2023-11-15" → "202311"
const todayYmd = () => new Date().toISOString().slice(0, 10);

// 시계열 DB에서 기준/비교시점 지수 조회
function getIdxFromTS(tsDB, indexId, bidDate, compareDate) {
  const bk = toKey(bidDate),
    ck = toKey(compareDate);
  const base = bk && tsDB[bk]?.[indexId] != null ? tsDB[bk][indexId] : null;
  const comp = ck && tsDB[ck]?.[indexId] != null ? tsDB[ck][indexId] : null;
  return {
    base,
    comp
  };
}

// 핵심 계산 엔진 [지방계약법 시행령 §73 제4항]
// K = (Σ wi × Pi/P0i - 1) × 100
function runCalc(ct, items, tsDB) {
  const total = items.reduce((s, it) => s + nv(it.amt), 0);
  let sumC = 0;
  const rows = items.map(it => {
    const a = nv(it.amt);
    const ts = getIdxFromTS(tsDB, it.xk, ct.bidDate, ct.compareDate);
    const bv = ts.base != null ? ts.base : 100;
    const cv = ts.comp != null ? ts.comp : 100;
    const w = total > 0 ? a / total : 0;
    const ratio = fl4(cv / bv);
    const contrib = a > 0 ? w * ratio : 0;
    sumC += contrib;
    return {
      ...it,
      a,
      w,
      bv,
      cv,
      ratio,
      contrib,
      baseOk: ts.base != null,
      compOk: ts.comp != null
    };
  });
  const K = (sumC - 1) * 100;
  const app = nv(ct.contractAmount) - nv(ct.excludedAmt);
  const gross = app * K / 100;
  const adv = nv(ct.advanceAmt) > 0 ? nv(ct.advanceAmt) / nv(ct.contractAmount) * gross : 0;
  const adj = Math.round(gross - adv);
  const el = days(ct.bidDate, ct.compareDate); // 초일불산입: 입찰일 다음날부터 산정
  const tR = nv(ct.thresholdRate) || 3,
    tD = nv(ct.thresholdDays) || 90;
  return {
    rows,
    total,
    sumC,
    K,
    Kd2: K.toFixed(2),
    Kd6: K.toFixed(6),
    app,
    gross,
    adv,
    adj,
    el,
    tR,
    tD,
    mR: Math.abs(K) >= tR,
    mD: el >= tD,
    ok: Math.abs(K) >= tR && el >= tD
  };
}

// ═══════════════════════════════════════════════════════════════════
// RESPONSIVE HOOK
// ═══════════════════════════════════════════════════════════════════
function useVP() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return {
    w,
    mob: w < 700,
    tab: w < 1024
  };
}

// ═══════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════
const C = {
  bg: "#f0f4f8",
  pan: "#ffffff",
  card: "#f8fafc",
  brd: "#cbd5e1",
  brd2: "#94a3b8",
  txt: "#1e293b",
  mut: "#64748b",
  dim: "#475569",
  bl: "#1d4ed8",
  cy: "#0369a1",
  gr: "#15803d",
  am: "#b45309",
  rd: "#dc2626"
};
const mono = "'Courier New',Courier,monospace";
const sans = "-apple-system,'Apple SD Gothic Neo','Noto Sans KR','Malgun Gothic',sans-serif";

// ═══════════════════════════════════════════════════════════════════
// SHARED ATOMS
// ═══════════════════════════════════════════════════════════════════
const VP = createContext({
  mob: false,
  tab: false,
  w: 1200
});
const useVPctx = () => useContext(VP);
const bmap = {
  def: {
    bg: "#cbd5e1",
    c: C.txt,
    b: C.brd
  },
  pri: {
    bg: "#1e3a5f",
    c: "#93c5fd",
    b: "#1d4ed8"
  },
  suc: {
    bg: "#14532d",
    c: "#86efac",
    b: "#16a34a"
  },
  dan: {
    bg: "#450a0a",
    c: "#fca5a5",
    b: "#dc2626"
  },
  cy: {
    bg: "#0c4a6e",
    c: "#67e8f9",
    b: "#0891b2"
  },
  am: {
    bg: "#7c2d12",
    c: "#fcd34d",
    b: "#d97706"
  }
};
function Btn({
  v = "def",
  onClick,
  children,
  sx,
  full
}) {
  const t = bmap[v] || bmap.def;
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      background: t.bg,
      color: t.c,
      border: `1px solid ${t.b}`,
      borderRadius: 6,
      padding: "8px 16px",
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: sans,
      width: full ? "100%" : "auto",
      textAlign: "center",
      ...sx
    }
  }, children);
}
function Inp({
  value,
  onChange,
  type = "text",
  step,
  placeholder,
  sx,
  required
}) {
  const {
    mob
  } = useVPctx();
  return /*#__PURE__*/React.createElement("input", {
    type: type,
    value: value,
    step: step,
    placeholder: placeholder,
    required: required,
    onChange: e => onChange(e.target.value),
    style: {
      background: "#f8fafc",
      border: `1px solid ${C.brd2}`,
      borderRadius: 6,
      color: C.txt,
      padding: mob ? "10px 12px" : "6px 10px",
      fontSize: mob ? 14 : 13,
      fontFamily: sans,
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
      ...sx
    }
  });
}
function Sel({
  value,
  onChange,
  options,
  sx
}) {
  const {
    mob
  } = useVPctx();
  return /*#__PURE__*/React.createElement("select", {
    value: value,
    onChange: e => onChange(e.target.value),
    style: {
      background: "#f8fafc",
      border: `1px solid ${C.brd2}`,
      borderRadius: 6,
      color: C.txt,
      padding: mob ? "10px 12px" : "6px 10px",
      fontSize: mob ? 14 : 13,
      fontFamily: sans,
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
      ...sx
    }
  }, options.map(o => /*#__PURE__*/React.createElement("option", {
    key: typeof o === "object" ? o.v : o,
    value: typeof o === "object" ? o.v : o
  }, typeof o === "object" ? o.l : o)));
}
function Badge({
  ok,
  t,
  f
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "3px 10px",
      borderRadius: 9999,
      fontSize: 12,
      fontWeight: 600,
      background: ok ? "#15803d22" : "#92400e22",
      color: ok ? C.gr : C.am,
      border: `1px solid ${ok ? "#15803d55" : "#92400e55"}`
    }
  }, ok ? `✓ ${t}` : `✗ ${f}`);
}
function Box({
  children,
  sx
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.pan,
      border: `1px solid ${C.brd}`,
      borderRadius: 8,
      marginBottom: 14,
      overflow: "hidden",
      ...sx
    }
  }, children);
}
function SH({
  title,
  sub,
  action
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 14px",
      borderBottom: `1px solid ${C.brd}`,
      background: "#f1f5f9",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: C.cy,
      letterSpacing: .8,
      textTransform: "uppercase",
      flex: 1
    }
  }, title), sub && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: C.mut,
      flexShrink: 0
    }
  }, sub), action);
}
// 반응형 테이블 래퍼
function TblWrap({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: "auto",
      WebkitOverflowScrolling: "touch"
    }
  }, children);
}
const TH = ({
  ch,
  r,
  w,
  c
}) => /*#__PURE__*/React.createElement("th", {
  style: {
    padding: "7px 10px",
    background: "#f1f5f9",
    color: C.mut,
    fontSize: 11,
    fontWeight: 600,
    textAlign: r ? "right" : c ? "center" : "left",
    borderBottom: `1px solid ${C.brd}`,
    minWidth: w,
    whiteSpace: "nowrap"
  }
}, ch);
const TD = ({
  ch,
  alt,
  r,
  c,
  sx
}) => /*#__PURE__*/React.createElement("td", {
  style: {
    padding: "7px 10px",
    borderBottom: `1px solid ${C.brd}`,
    background: alt ? "#f1f5f9" : "transparent",
    textAlign: r ? "right" : c ? "center" : "left",
    verticalAlign: "middle",
    ...sx
  }
}, ch);

// ── 모바일 카드 행 ─────────────────────────────────────────────────
function CardRow({
  label,
  value,
  accent
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 4px",
      borderBottom: `1px solid ${C.brd}`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: C.mut
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: accent || C.txt,
      fontFamily: mono
    }
  }, value));
}

// ── 폼 필드 (레이블+입력 세트) ─────────────────────────────────────
function FRow({
  label,
  required,
  children,
  hint
}) {
  const {
    mob
  } = useVPctx();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: mob ? 16 : 12
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      fontSize: 12,
      color: C.dim,
      marginBottom: 4,
      fontWeight: 600
    }
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.rd,
      marginLeft: 2
    }
  }, "*")), children, hint && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.mut,
      marginTop: 3
    }
  }, hint));
}

// ═══════════════════════════════════════════════════════════════════
// SETUP WIZARD (첫 화면)
// ═══════════════════════════════════════════════════════════════════
const STEPS = ["공사 기본정보", "계약 금액·일정", "ESC 조정 설정"];
function SetupWizard({
  onComplete,
  onCancel,
  initialData
}) {
  const {
    mob
  } = useVPctx();
  const isEdit = !!initialData;
  const [step, setStep] = useState(0);
  const [d, setD] = useState(initialData ? {
    ...initialData,
    compareDate: initialData.compareDate || todayYmd()
  } : {
    ...DC,
    compareDate: todayYmd()
  });
  const f = (k, v) => setD(p => ({
    ...p,
    [k]: v
  }));
  const err = [];
  const validate = () => {
    if (step === 0 && (!d.projectName || !d.contractor || !d.client)) return false;
    if (step === 1 && (!d.contractAmount || !d.contractDate || !d.bidDate)) return false;
    if (step === 2 && !d.compareDate) return false;
    return true;
  };
  const next = () => {
    if (!validate()) {
      alert("필수 항목을 입력해 주세요.");
      return;
    }
    if (step < 2) setStep(s => s + 1);else onComplete(d);
  };
  const loadSample = () => {
    setD({
      ...SAMPLE_CT
    });
  };
  const restoreOrig = () => {
    if (initialData) setD({
      ...initialData,
      compareDate: initialData.compareDate || todayYmd()
    });
  };
  const applyTodayCompareDate = () => f("compareDate", todayYmd());
  const applyDocumentSample = () => {
    setD(p => ({
      ...p,
      projectName: p.projectName || "계약서 OCR 인식 공사명",
      contractor: p.contractor || "계약자 자동 인식",
      client: p.client || "수요기관 자동 인식",
      contractAmount: p.contractAmount || "2224344990",
      contractDate: p.contractDate || "2023-12-15",
      startDate: p.startDate || "2023-12-15",
      completionDate: p.completionDate || "2026-12-13",
      bidDate: p.bidDate || "2023-11-15",
      compareDate: p.compareDate || todayYmd()
    }));
    showToast("계약서/원가계산서 OCR 인식값을 기본정보에 반영했습니다.", "ok");
  };
  const inp = (k, type = "text", step2, placeholder, hint, req = false) => /*#__PURE__*/React.createElement(FRow, {
    label: k === "projectName" ? "공사명" : k === "contractor" ? "계약자" : k === "client" ? "수요기관" : k === "contractMethod" ? "계약방법" : k === "bidRate" ? "낙찰율(%)" : k === "contractAmount" ? "계약금액(원)" : k === "contractDate" ? "계약체결일" : k === "startDate" ? "착공일" : k === "completionDate" ? "준공예정일" : k === "bidDate" ? "입찰일 (기준시점)" : k === "compareDate" ? "조정기준일 (비교시점)" : k === "adjustNo" ? "조정 회차" : k === "thresholdRate" ? "등락율 기준(%)" : k === "thresholdDays" ? "경과기간 기준(일)" : k === "advanceAmt" ? "선금급(원)" : k === "excludedAmt" ? "적용제외금액(원)" : k === "preparedBy" ? "작성기관" : k === "preparedDate" ? "작성연월" : k === "contactName" ? "담당자명" : k === "contactPhone" ? "담당자 연락처" : k === "contactEmail" ? "담당자 이메일" : k === "requestMemo" ? "의뢰 메모" : k,
    required: req,
    hint: hint
  }, /*#__PURE__*/React.createElement(Inp, {
    type: type,
    step: step2,
    value: d[k] || "",
    onChange: v => f(k, v),
    placeholder: placeholder
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: C.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      padding: mob ? "16px 12px" : "40px 16px",
      fontFamily: sans
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: mob ? 24 : 32,
      maxWidth: 640,
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: mob ? 22 : 28,
      fontWeight: 800,
      color: C.txt,
      letterSpacing: "-0.5px",
      marginBottom: 6
    }
  }, isEdit ? "✏️ 기본정보 수정" : "⚡ ESC 물가변동 조정 관리"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: mob ? 12 : 13,
      color: C.mut
    }
  }, "\uC9C0\uBC29\uACC4\uC57D\uBC95 \xA722, \uC2DC\uD589\uB839 \xA773 \xB7 \uBB3C\uAC00\uBCC0\uB3D9\uC73C\uB85C \uC778\uD55C \uACC4\uC57D\uAE08\uC561 \uC870\uC815")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 0,
      marginBottom: 24,
      maxWidth: 640,
      width: "100%",
      justifyContent: "center"
    }
  }, STEPS.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 13,
      fontWeight: 700,
      fontFamily: mono,
      background: i < step ? "#14532d" : i === step ? "#1e3a5f" : C.brd,
      color: i < step ? C.gr : i === step ? "#93c5fd" : C.mut,
      border: `2px solid ${i < step ? C.gr : i === step ? "#3b82f6" : C.brd}`
    }
  }, i < step ? "✓" : i + 1), !mob && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: i === step ? C.cy : C.mut,
      marginTop: 4,
      whiteSpace: "nowrap"
    }
  }, s)), i < STEPS.length - 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      height: 2,
      flex: 2,
      background: i < step ? C.gr : C.brd,
      margin: "0 4px",
      marginBottom: mob ? 0 : 18
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.pan,
      border: `1px solid ${C.brd}`,
      borderRadius: 12,
      padding: mob ? "18px 16px" : "28px 32px",
      maxWidth: 640,
      width: "100%",
      boxSizing: "border-box"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: C.cy,
      marginBottom: 20,
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      background: "#0c4a6e",
      border: `1px solid ${C.cy}`,
      borderRadius: 20,
      padding: "2px 10px",
      fontSize: 11
    }
  }, "STEP ", step + 1), STEPS[step]), step === 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#f8fafc",
      border: `1px dashed ${C.cy}`,
      borderRadius: 8,
      padding: "12px 14px",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: C.txt,
      marginBottom: 6
    }
  }, "문서 인식 기본정보 자동 입력"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.mut,
      lineHeight: 1.6,
      marginBottom: 10
    }
  }, "계약서와 원가계산서를 업로드하면 OCR/API 연동을 통해 공사명, 계약자, 수요기관, 계약금액, 계약일 등을 자동 입력하는 영역입니다. 현재 정적 웹에서는 샘플 인식값으로 동작합니다."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: mob ? "1fr" : "1fr 1fr auto",
      gap: 8,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Inp, {
    type: "file",
    onChange: () => {},
    placeholder: "계약서 업로드"
  }), /*#__PURE__*/React.createElement(Inp, {
    type: "file",
    onChange: () => {},
    placeholder: "원가계산서 업로드"
  }), /*#__PURE__*/React.createElement(Btn, {
    v: "pri",
    onClick: applyDocumentSample,
    sx: {
      fontSize: 11,
      whiteSpace: "nowrap"
    }
  }, "OCR 샘플 반영"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: mob ? "1fr" : "1fr 1fr",
      gap: "0 16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: mob ? "" : "1/-1"
    }
  }, inp("projectName", "text", "", "예) 조천정수장 고도정수처리시설 전기공사", "", true)), inp("contractor", "text", "", "시공사명", "", true), inp("client", "text", "", "발주처명", "", true), /*#__PURE__*/React.createElement(FRow, {
    label: "\uACC4\uC57D\uBC29\uBC95",
    required: true
  }, /*#__PURE__*/React.createElement(Sel, {
    value: d.contractMethod || "계속비",
    onChange: v => f("contractMethod", v),
    options: ["계속비", "장기계속", "일반"]
  })), inp("bidRate", "number", "0.01", "예) 87.50", "낙찰율"), inp("preparedBy", "text", "", "작성기관명"))), step === 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: mob ? "1fr" : "1fr 1fr",
      gap: "0 16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: "1/-1"
    }
  }, inp("contractAmount", "number", "1", "", "계약금액 (원 단위)", true)), inp("contractDate", "date", "", "", "계약체결일", true), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FRow, {
    label: "\uC785\uCC30\uC77C (\uC9C0\uC218 \uAE30\uC900\uC2DC\uC810)",
    required: true,
    hint: "YYYY-MM-DD \uD615\uC2DD\uC73C\uB85C \uC9C1\uC811 \uC785\uB825 (\uC608: 2024-11-15)"
  }, /*#__PURE__*/React.createElement(Inp, {
    type: "text",
    value: d.bidDate || "",
    onChange: v => f("bidDate", v),
    placeholder: "YYYY-MM-DD"
  }))), inp("startDate", "date", "", "", "착공일"), inp("completionDate", "date", "", "", "준공예정일")), step === 2 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: mob ? "1fr" : "1fr 1fr",
      gap: "0 16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: "1/-1"
    }
  }, /*#__PURE__*/React.createElement(FRow, {
    label: "\uC870\uC815\uAE30\uC900\uC77C (\uBE44\uAD50\uC2DC\uC810)",
    required: true,
    hint: "YYYY-MM-DD \uD615\uC2DD\uC73C\uB85C \uC9C1\uC811 \uC785\uB825 (\uC608: 2024-11-30)"
  }, /*#__PURE__*/React.createElement(Inp, {
    type: "text",
    value: d.compareDate || "",
    onChange: v => f("compareDate", v),
    placeholder: "YYYY-MM-DD"
  })), d.bidDate && d.compareDate && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#dbeafe",
      border: `1px solid ${C.cy}44`,
      borderRadius: 6,
      padding: "10px 14px",
      marginBottom: 12,
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.mut
    }
  }, "\uACBD\uACFC\uAE30\uAC04 (\uCD08\uC77C\uBD88\uC0B0\uC785)"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Courier New',monospace",
      fontWeight: 700,
      fontSize: 16,
      color: days(d.bidDate, d.compareDate) >= 90 ? C.gr : C.am,
      marginLeft: 12
    }
  }, days(d.bidDate, d.compareDate), "\uC77C"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.mut,
      marginLeft: 8,
      fontSize: 11
    }
  }, "\uC785\uCC30\uC77C ", d.bidDate, " \u2192 \uC870\uC815\uAE30\uC900\uC77C ", d.compareDate, " (", "\uAE30\uC900 90\uC77C", days(d.bidDate, d.compareDate) >= 90 ? " ✓ 충족" : " ✗ 미달", ")"))), inp("adjustNo", "number", "1", "", "조정 회차"), inp("thresholdRate", "number", "0.1", "3", "등락율 기준 (지방계약법: 3%)"), inp("thresholdDays", "number", "1", "90", "경과기간 기준 (90일)"), inp("advanceAmt", "number", "1", "", "선금급 지급액 (없으면 0)"), inp("excludedAmt", "number", "1", "", "물가변동 적용제외 금액"), inp("preparedDate", "text", "", "예) 2024-08", "작성 연월"), inp("contactName", "text", "", "영업/응대 담당자", "조정률 3% 이상 시 견적 의뢰 영역에 노출"), inp("contactPhone", "text", "", "010-0000-0000", "담당자 연락처"), inp("contactEmail", "email", "", "sales@concost.co.kr", "견적 의뢰 메일 수신 주소"), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: "1/-1"
    }
  }, inp("requestMemo", "text", "", "본계약 유도용 안내 메모", "견적 의뢰 영역에 함께 표시"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginTop: 24,
      flexDirection: mob ? "column" : "row",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      order: mob ? 2 : 1,
      flexWrap: "wrap"
    }
  }, step > 0 && /*#__PURE__*/React.createElement(Btn, {
    v: "def",
    onClick: () => setStep(s => s - 1),
    sx: {
      minWidth: 70
    }
  }, "\u25C0 \uC774\uC804"), step === 0 && isEdit && /*#__PURE__*/React.createElement(Btn, {
    v: "dan",
    onClick: onCancel,
    sx: {
      fontSize: 11
    }
  }, "\u2715 \uCDE8\uC18C"), isEdit && /*#__PURE__*/React.createElement(Btn, {
    v: "def",
    onClick: restoreOrig,
    sx: {
      fontSize: 11,
      padding: "6px 10px"
    }
  }, "\u21A9 \uC6D0\uB798\uB300\uB85C"), !isEdit && /*#__PURE__*/React.createElement(Btn, {
    v: "def",
    onClick: loadSample,
    sx: {
      fontSize: 11,
      padding: "6px 10px"
    }
  }, "\uC0D8\uD50C \uBD88\uB7EC\uC624\uAE30")), /*#__PURE__*/React.createElement(Btn, {
    v: step === 2 ? "suc" : "pri",
    onClick: next,
    sx: {
      minWidth: mob ? undefined : 140,
      order: mob ? 1 : 2
    },
    full: mob
  }, step === 2 ? isEdit ? "✓ 수정 완료" : "✓ 산출 시작 →" : `다음 단계 ▶`))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      fontSize: 11,
      color: C.mut,
      textAlign: "center"
    }
  }, "\uBE44\uBAA9 \uAE08\uC561\uC740 \uC124\uC815 \uC644\uB8CC \uD6C4 \"\uBE44\uBAA9 \uAD6C\uC131\" \uD0ED\uC5D0\uC11C \uC785\uB825\uD558\uC138\uC694"));
}

// ═══════════════════════════════════════════════════════════════════
// TAB: 조정율 산출
// ═══════════════════════════════════════════════════════════════════
function CalcTab({
  ct,
  items,
  tsDB
}) {
  const {
    mob
  } = useVPctx();
  const r = runCalc(ct, items, tsDB);
  const kc = r.ok ? C.gr : Math.abs(r.K) >= 1 ? C.am : C.mut;
  const groups = [...new Set(items.map(it => it.g))];
  const missingBase = r.rows.filter(x => x.a > 0 && !x.baseOk);
  const missingComp = r.rows.filter(x => x.a > 0 && !x.compOk);
  const estimateEligible = r.ok;
  const contactEmail = ct.contactEmail || "sales@concost.co.kr";
  const mailSubject = encodeURIComponent("[ESC 추정산출] 정식 보고서 견적 의뢰 - " + (ct.projectName || "현장명 미입력"));
  const mailBody = encodeURIComponent(`공사명: ${ct.projectName || ""}
계약자: ${ct.contractor || ""}
수요기관: ${ct.client || ""}
조정률: ${r.Kd2}%
경과일수: ${r.el}일
예상 조정금액: ${fmtW(r.adj)}원
담당자: ${ct.contactName || ""}
연락처: ${ct.contactPhone || ""}
메모: ${ct.requestMemo || ""}`);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#f8fafc",
      border: `1px solid ${C.brd}`,
      borderLeft: `4px solid ${C.cy}`,
      borderRadius: 8,
      padding: "12px 14px",
      marginBottom: 14,
      fontSize: 12,
      color: C.txt,
      lineHeight: 1.7
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      color: C.txt,
      marginBottom: 4
    }
  }, "회의 반영 요건"), "현재 화면은 정식 보고서 작성 전 단계의 ES 대상 여부 확인용 추정산출 화면입니다. 비교시점은 접속일 기준으로 자동 설정할 수 있으며, 90일 경과와 조정률 3% 이상을 동시에 충족하면 견적 의뢰로 연결합니다."), (missingBase.length > 0 || missingComp.length > 0) && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#7c2d12",
      border: `1px solid ${C.am}`,
      borderRadius: 8,
      padding: "10px 14px",
      marginBottom: 12,
      fontSize: 12,
      color: "#fcd34d"
    }
  }, "\u26A0 \uC9C0\uC218 \uBBF8\uB4F1\uB85D \uBE44\uBAA9 (", missingBase.length + missingComp.length, "\uAC74) \u2014 \uD574\uB2F9 \uC2DC\uC810(", toKey(ct.bidDate), ", ", toKey(ct.compareDate), ") \uC9C0\uC218\uAC00 \uB4F1\uB85D\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uAE30\uC900\uAC12 100\uC73C\uB85C \uB300\uCCB4 \uC0B0\uCD9C\uB429\uB2C8\uB2E4."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: mob ? "1fr 1fr" : "repeat(4,1fr)",
      gap: 10,
      marginBottom: 14
    }
  }, [{
    lbl: "지수조정율 K",
    val: `${r.Kd2}%`,
    sub: `Σwi·Pi/P0i=${r.sumC.toFixed(6)}`,
    col: kc
  }, {
    lbl: "조정 적용금액",
    val: fmtW(r.adj),
    sub: "원",
    col: C.cy
  }, {
    lbl: "순공사원가",
    val: fmtW(r.total),
    sub: "원",
    col: C.bl
  }, {
    lbl: "경과일수",
    val: `${r.el}일`,
    sub: `기준→비교`,
    col: r.mD ? C.gr : C.am
  }].map(k => /*#__PURE__*/React.createElement("div", {
    key: k.lbl,
    style: {
      background: C.card,
      border: `1px solid ${C.brd}`,
      borderLeft: `3px solid ${k.col}`,
      borderRadius: 6,
      padding: "10px 12px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: C.mut,
      letterSpacing: .8,
      textTransform: "uppercase",
      marginBottom: 3
    }
  }, k.lbl), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: mob ? 17 : 19,
      fontWeight: 700,
      color: k.col,
      fontFamily: mono,
      lineHeight: 1.2
    }
  }, k.val), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: C.dim,
      marginTop: 2
    }
  }, k.sub)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: C.mut,
      alignSelf: "center"
    }
  }, "\u2696 \uC870\uC815\uC694\uAC74 [\uC2DC\uD589\uB839\xA773]"), /*#__PURE__*/React.createElement(Badge, {
    ok: r.mR,
    t: `등락율≥${r.tR}% (${r.Kd2}%)`,
    f: `등락율${r.Kd2}%<${r.tR}%`
  }), /*#__PURE__*/React.createElement(Badge, {
    ok: r.mD,
    t: `경과≥${r.tD}일 (${r.el}일)`,
    f: `경과${r.el}일<${r.tD}일`
  }), /*#__PURE__*/React.createElement(Badge, {
    ok: r.ok,
    t: "\uC870\uC815\uC2E0\uCCAD \uAC00\uB2A5",
    f: "\uCD94\uC815\uC0B0\uCD9C \uCC38\uACE0\uC6A9"
  })), /*#__PURE__*/React.createElement(Box, null, /*#__PURE__*/React.createElement(SH, {
    title: "\uC9C0\uC218\uC870\uC815\uC728 \uC0B0\uCD9C\uD45C  [ \uBD99\uC784 3 ]",
    sub: `기준: ${ct.bidDate || "—"} → 비교: ${ct.compareDate || "—"}`
  }), /*#__PURE__*/React.createElement(TblWrap, null, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      fontFamily: mono,
      fontSize: mob ? 11 : 12
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement(TH, {
    ch: "\uAE30\uD638",
    w: 50
  }), /*#__PURE__*/React.createElement(TH, {
    ch: "\uBE44  \uBAA9",
    w: 170
  }), /*#__PURE__*/React.createElement(TH, {
    ch: "\uC801\uC6A9\uB300\uAC00\u2460",
    r: true,
    w: 110
  }), /*#__PURE__*/React.createElement(TH, {
    ch: "\uACC4\uC218\u2460",
    r: true,
    w: 70
  }), /*#__PURE__*/React.createElement(TH, {
    ch: "\uAE30\uC900\uC2DC\uC810\u2461",
    r: true,
    w: 75
  }), /*#__PURE__*/React.createElement(TH, {
    ch: "\uBE44\uAD50\uC2DC\uC810\u2462",
    r: true,
    w: 75
  }), /*#__PURE__*/React.createElement(TH, {
    ch: "\uBCC0\uB3D9\uC728\u2463",
    r: true,
    w: 75
  }), /*#__PURE__*/React.createElement(TH, {
    ch: "\uC870\uC815\uACC4\uC218\u2460\xD7\u2463",
    r: true,
    w: 95
  }))), /*#__PURE__*/React.createElement("tbody", null, groups.map(grp => {
    const gr = r.rows.filter(x => x.g === grp);
    const gs = gr.reduce((s, x) => s + x.a, 0);
    const gc = gr.reduce((s, x) => s + x.contrib, 0);
    return [/*#__PURE__*/React.createElement("tr", {
      key: `g${grp}`,
      style: {
        background: "#e2e8f0"
      }
    }, /*#__PURE__*/React.createElement("td", {
      colSpan: 2,
      style: {
        padding: "5px 12px",
        color: C.cy,
        fontWeight: 700,
        fontSize: 11
      }
    }, grp, " \uD569\uACC4"), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "5px 10px",
        textAlign: "right",
        color: C.cy,
        fontWeight: 700
      }
    }, fmtW(gs)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "5px 10px",
        textAlign: "right",
        color: C.cy,
        fontWeight: 700
      }
    }, fmtD(r.total > 0 ? gs / r.total : 0)), /*#__PURE__*/React.createElement("td", null), /*#__PURE__*/React.createElement("td", null), /*#__PURE__*/React.createElement("td", null), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "5px 10px",
        textAlign: "right",
        color: C.cy,
        fontWeight: 700
      }
    }, fmtD(gc, 8))), ...gr.map((rr, i) => /*#__PURE__*/React.createElement("tr", {
      key: rr.id
    }, /*#__PURE__*/React.createElement(TD, {
      ch: rr.c,
      alt: i % 2 === 1,
      sx: {
        paddingLeft: 18,
        color: C.cy,
        fontWeight: 600
      }
    }), /*#__PURE__*/React.createElement(TD, {
      ch: rr.n,
      alt: i % 2 === 1,
      sx: {
        paddingLeft: 22,
        color: rr.a === 0 ? C.mut : C.txt,
        fontSize: mob ? 11 : 12
      }
    }), /*#__PURE__*/React.createElement(TD, {
      ch: rr.a > 0 ? fmtW(rr.a) : "—",
      r: true,
      alt: i % 2 === 1,
      sx: {
        color: rr.a === 0 ? C.mut : C.txt
      }
    }), /*#__PURE__*/React.createElement(TD, {
      ch: rr.a > 0 ? fmtD(rr.w) : "—",
      r: true,
      alt: i % 2 === 1,
      sx: {
        color: C.dim
      }
    }), /*#__PURE__*/React.createElement(TD, {
      ch: fmtP(rr.bv),
      r: true,
      alt: i % 2 === 1,
      sx: {
        color: rr.baseOk ? "#475569" : "#dc2626"
      }
    }), /*#__PURE__*/React.createElement(TD, {
      ch: fmtP(rr.cv),
      r: true,
      alt: i % 2 === 1,
      sx: {
        color: rr.compOk ? "#1e40af" : "#dc2626"
      }
    }), /*#__PURE__*/React.createElement(TD, {
      ch: fmtD(rr.ratio),
      r: true,
      alt: i % 2 === 1,
      sx: {
        color: rr.ratio > 1 ? C.gr : rr.ratio < 1 ? C.rd : C.txt
      }
    }), /*#__PURE__*/React.createElement(TD, {
      ch: rr.a > 0 ? fmtD(rr.contrib, 8) : "—",
      r: true,
      alt: i % 2 === 1,
      sx: {
        color: rr.a === 0 ? C.mut : C.cy
      }
    })))];
  }), /*#__PURE__*/React.createElement("tr", {
    style: {
      borderTop: `2px solid ${C.cy}44`
    }
  }, /*#__PURE__*/React.createElement(TD, {
    ch: "\uC21C\uACF5\uC0AC\uC6D0\uAC00 \uD569\uACC4",
    sx: {
      fontWeight: 700,
      fontSize: 13
    },
    colSpan: 2
  }), /*#__PURE__*/React.createElement(TD, {
    ch: fmtW(r.total),
    r: true,
    sx: {
      fontWeight: 700
    }
  }), /*#__PURE__*/React.createElement(TD, {
    ch: "1.0000",
    r: true,
    sx: {
      fontWeight: 700
    }
  }), /*#__PURE__*/React.createElement(TD, null), /*#__PURE__*/React.createElement(TD, null), /*#__PURE__*/React.createElement(TD, null), /*#__PURE__*/React.createElement(TD, {
    ch: r.sumC.toFixed(8),
    r: true,
    sx: {
      fontWeight: 700,
      color: C.cy,
      fontSize: 13
    }
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#f8fafc",
      border: `1px solid ${C.brd}`,
      borderRadius: 6,
      margin: "10px 14px 14px",
      padding: "12px 14px",
      fontFamily: mono,
      fontSize: mob ? 11 : 12,
      color: "#c4b5fd",
      lineHeight: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: C.mut,
      fontSize: 10,
      marginBottom: 4
    }
  }, "\u25B6 \uC9C0\uC218\uC870\uC815\uC728 [\uC9C0\uBC29\uACC4\uC57D\uBC95 \uC2DC\uD589\uB839 \xA773 \uC81C4\uD56D]"), /*#__PURE__*/React.createElement("div", null, "K = (\u03A3wi \xD7 Pi/P0i \u2212 1) \xD7 100"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#a5b4fc"
    }
  }, "K = (", r.sumC.toFixed(8), " \u2212 1) \xD7 100 = ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: C.am
    }
  }, r.Kd6, "%"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.mut,
      marginLeft: 8
    }
  }, "\u2192 ", r.Kd2, "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#86efac"
    }
  }, "\uC870\uC815\uAE08\uC561 = ", fmtW(r.app), "\uC6D0 \xD7 ", r.Kd2, "% = ", fmtW(Math.round(r.gross)), "\uC6D0", nv(ct.advanceAmt) > 0 && ` − 선금공제 ${fmtW(Math.round(r.adv))}원`, " = ", /*#__PURE__*/React.createElement("strong", null, fmtW(r.adj), "\uC6D0")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: C.mut,
      marginTop: 4
    }
  }, "\u203B \uC9C0\uC218\uBCC0\uB3D9\uC728\u2463: \uC18C\uC218\uC810 5\uC9F8\uC790\uB9AC\uC774\uD558 \uC808\uC0AC, \uB137\uC9F8\uC790\uB9AC\uAE4C\uC9C0 [\uD68C\uACC4\uC608\uADDC]"))));
}

// ═══════════════════════════════════════════════════════════════════
// TAB: 비목 구성
// ═══════════════════════════════════════════════════════════════════
function ItemsTab({
  items,
  setItems
}) {
  const {
    mob
  } = useVPctx();
  const [focusId, setFocusId] = React.useState(null);
  const [draftVal, setDraftVal] = React.useState("");
  const inputRef = React.useRef(null);
  const total = items.reduce(function(s, it) { return s + nv(it.amt); }, 0);
  const groups = Array.from(new Set(items.map(function(it) { return it.g; })));

  function startEdit(it) {
    setFocusId(it.id);
    setDraftVal(nv(it.amt) > 0 ? String(nv(it.amt)) : "");
    setTimeout(function() {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 40);
  }

  function commitEdit(id) {
    var raw = String(draftVal).replace(/,/g, "");
    var val = parseFloat(raw) || 0;
    setItems(function(p) {
      return p.map(function(it) {
        return it.id === id ? Object.assign({}, it, { amt: val }) : it;
      });
    });
    setFocusId(null);
    setDraftVal("");
  }

  function handleKey(e, id) {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      commitEdit(id);
    }
    if (e.key === "Escape") {
      setFocusId(null);
      setDraftVal("");
    }
  }

  function AmtCell(it, i) {
    var alt = i % 2 === 1;
    var bg = alt ? "#f1f5f9" : "transparent";
    if (focusId === it.id) {
      return /*#__PURE__*/React.createElement("td", {
        style: { padding: "4px 8px", background: "#eff6ff", borderBottom: "1px solid " + C.brd }
      }, /*#__PURE__*/React.createElement("input", {
        ref: inputRef,
        type: "number",
        value: draftVal,
        onChange: function(e) { setDraftVal(e.target.value); },
        onBlur: function() { commitEdit(it.id); },
        onKeyDown: function(e) { handleKey(e, it.id); },
        style: {
          width: "100%", textAlign: "right",
          fontFamily: "'Courier New',Courier,monospace",
          fontSize: 13, fontWeight: 700,
          background: "#eff6ff", border: "2px solid #0369a1",
          borderRadius: 4, color: "#1e3a5f",
          padding: "4px 8px", outline: "none",
          WebkitAppearance: "none"
        }
      }));
    }
    return /*#__PURE__*/React.createElement("td", {
      onClick: function() { startEdit(it); },
      title: "클릭하여 금액 입력",
      style: {
        padding: "4px 8px", cursor: "pointer", textAlign: "right",
        background: bg, borderBottom: "1px solid " + C.brd,
        fontFamily: "'Courier New',Courier,monospace",
        fontSize: 13, fontWeight: 700,
        color: nv(it.amt) === 0 ? "#94a3b8" : "#0369a1",
        borderLeft: "1px dashed #cbd5e1"
      }
    }, nv(it.amt) > 0 ? fmtW(nv(it.amt)) : "—  (입력)");
  }

  return /*#__PURE__*/React.createElement("div", null,
    /*#__PURE__*/React.createElement("div", {
      style: { marginBottom: 10, padding: "8px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }
    },
      /*#__PURE__*/React.createElement("span", { style: { fontSize: 12, color: C.mut } }, "금액 칸을 탭하면 바로 입력됩니다"),
      /*#__PURE__*/React.createElement(Btn, {
        v: "suc",
        onClick: function() {
          var id = "U" + Date.now();
          setItems(function(p) { return p.concat([{ id: id, g: "제경비", n: "신규비목", c: "Z", amt: 0, xk: "기타비목군" }]); });
        }
      }, "+ 비목 추가")
    ),
    groups.map(function(grp) {
      var gi = items.filter(function(it) { return it.g === grp; });
      var gs = gi.reduce(function(s, it) { return s + nv(it.amt); }, 0);
      return /*#__PURE__*/React.createElement(Box, { key: grp, sx: { marginBottom: 10 } },
        /*#__PURE__*/React.createElement(SH, {
          title: grp,
          sub: fmtW(gs) + "원 (" + (total > 0 ? fmtP(gs / total * 100) : "0.00") + "%)"
        }),
        /*#__PURE__*/React.createElement("div", { style: { overflowX: "auto" } },
          /*#__PURE__*/React.createElement("table", {
            style: { width: "100%", borderCollapse: "collapse", fontFamily: "'Courier New',Courier,monospace", fontSize: 12 }
          },
            /*#__PURE__*/React.createElement("thead", null,
              /*#__PURE__*/React.createElement("tr", null,
                /*#__PURE__*/React.createElement("th", { style: { padding: "7px 10px", background: "#f1f5f9", color: C.mut, textAlign: "left", borderBottom: "1px solid " + C.brd, minWidth: 50, fontSize: 11, fontWeight: 600 } }, "기호"),
                /*#__PURE__*/React.createElement("th", { style: { padding: "7px 10px", background: "#f1f5f9", color: C.mut, textAlign: "left", borderBottom: "1px solid " + C.brd, minWidth: 180, fontSize: 11, fontWeight: 600 } }, "비목명"),
                /*#__PURE__*/React.createElement("th", { style: { padding: "7px 10px", background: "#f1f5f9", color: C.mut, textAlign: "right", borderBottom: "1px solid " + C.brd, minWidth: 150, fontSize: 11, fontWeight: 600 } }, "금액 (원) — 클릭하여 입력"),
                /*#__PURE__*/React.createElement("th", { style: { padding: "7px 10px", background: "#f1f5f9", color: C.mut, textAlign: "right", borderBottom: "1px solid " + C.brd, minWidth: 80, fontSize: 11, fontWeight: 600 } }, "계수(wi)"),
                /*#__PURE__*/React.createElement("th", { style: { padding: "7px 10px", background: "#f1f5f9", color: C.mut, textAlign: "left", borderBottom: "1px solid " + C.brd, minWidth: 130, fontSize: 11, fontWeight: 600 } }, "연결지수")
              )
            ),
            /*#__PURE__*/React.createElement("tbody", null,
              gi.map(function(it, i) {
                var alt = i % 2 === 1;
                var bg = alt ? "#f1f5f9" : "transparent";
                var brdB = "1px solid " + C.brd;
                return /*#__PURE__*/React.createElement("tr", { key: it.id },
                  /*#__PURE__*/React.createElement("td", {
                    style: { padding: "7px 10px", background: bg, borderBottom: brdB, color: C.cy, fontWeight: 600 }
                  }, it.c),
                  /*#__PURE__*/React.createElement("td", {
                    style: { padding: "7px 10px", background: bg, borderBottom: brdB, color: nv(it.amt) === 0 ? "#64748b" : "#1e3a5f", fontWeight: 700, fontSize: 13 }
                  }, it.n),
                  AmtCell(it, i),
                  /*#__PURE__*/React.createElement("td", {
                    style: { padding: "7px 10px", background: bg, borderBottom: brdB, textAlign: "right", color: C.dim }
                  }, nv(it.amt) > 0 && total > 0 ? fmtD(nv(it.amt) / total) : "—"),
                  /*#__PURE__*/React.createElement("td", {
                    style: { padding: "7px 10px", background: bg, borderBottom: brdB, fontSize: 11, color: C.mut }
                  }, it.xk)
                );
              })
            )
          )
        )
      );
    }),
    /*#__PURE__*/React.createElement("div", {
      style: { background: "#f1f5f9", border: "1px solid " + C.brd, borderRadius: 6, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }
    },
      /*#__PURE__*/React.createElement("span", { style: { color: C.mut, fontSize: 12 } }, "순공사원가 합계"),
      /*#__PURE__*/React.createElement("span", { style: { color: C.cy, fontWeight: 700, fontSize: 16, fontFamily: "'Courier New',Courier,monospace" } }, fmtW(total), " 원")
    )
  );
}


// ═══════════════════════════════════════════════════════════════════
// 관리자 로그인 모달
// ═══════════════════════════════════════════════════════════════════
function AdminModal({
  onSuccess,
  onClose
}) {
  const {
    mob
  } = useVPctx();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [shake, setShake] = useState(false);
  const inpRef = useRef();
  useEffect(() => {
    setTimeout(() => inpRef.current?.focus(), 100);
  }, []);
  const tryLogin = () => {
    if (pw === ADMIN_PW) {
      setErr(false);
      onSuccess();
    } else {
      setErr(true);
      setPw("");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };
  const onKey = e => {
    if (e.key === "Enter") tryLogin();
    if (e.key === "Escape") onClose();
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 600,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.75)",
      backdropFilter: "blur(4px)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.pan,
      border: `1px solid ${err ? C.rd : C.brd}`,
      borderRadius: 12,
      padding: mob ? "24px 20px" : "32px 36px",
      width: mob ? "90%" : "360px",
      boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
      transform: shake ? "translateX(0)" : "none",
      animation: shake ? "shake 0.4s ease" : "none"
    }
  }, /*#__PURE__*/React.createElement("style", null, `@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}`), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 32,
      marginBottom: 8
    }
  }, "\uD83D\uDD10"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: C.txt
    }
  }, "\uAD00\uB9AC\uC790 \uC778\uC99D"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.mut,
      marginTop: 4
    }
  }, "\uC9C0\uC218 DB \uAD00\uB9AC \uAE30\uB2A5\uC5D0 \uC811\uADFC\uD569\uB2C8\uB2E4")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("input", {
    ref: inpRef,
    type: "password",
    value: pw,
    onChange: e => {
      setPw(e.target.value);
      setErr(false);
    },
    onKeyDown: onKey,
    placeholder: "\uBE44\uBC00\uBC88\uD638 \uC785\uB825",
    style: {
      width: "100%",
      boxSizing: "border-box",
      background: "#f8fafc",
      border: `1px solid ${err ? C.rd : C.brd2}`,
      borderRadius: 6,
      color: C.txt,
      padding: "10px 14px",
      fontSize: 15,
      fontFamily: sans,
      outline: "none",
      textAlign: "center",
      letterSpacing: 4
    }
  }), err && /*#__PURE__*/React.createElement("div", {
    style: {
      color: C.rd,
      fontSize: 12,
      marginTop: 6,
      textAlign: "center"
    }
  }, "\u2717 \uBE44\uBC00\uBC88\uD638\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    v: "def",
    onClick: onClose,
    full: true
  }, "\uCDE8\uC18C"), /*#__PURE__*/React.createElement(Btn, {
    v: "pri",
    onClick: tryLogin,
    full: true
  }, "\uD655\uC778 \u2192"))));
}
function TSTab({
  tsDB,
  setTsDB,
  ct
}) {
  const {
    mob
  } = useVPctx();
  const baseKey = toKey(ct.bidDate),
    compKey = toKey(ct.compareDate);
  const allMonths = Object.keys(tsDB).sort();
  const cats = ["전체", ...new Set(IX_META.map(x => x.cat))];
  const [catF, setCatF] = useState("전체");
  const [editCell, setEditCell] = useState(null); // "YYYYMM_id"
  const [editVal, setEditVal] = useState("");
  const [addMo, setAddMo] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const editRef = useRef();
  const visIdx = catF === "전체" ? IX_META : IX_META.filter(x => x.cat === catF);
  const getV = (mo, id) => {
    const v = tsDB[mo]?.[id];
    return v != null ? v : null;
  };
  const getRatio = id => {
    const bv = getV(baseKey, id),
      cv = getV(compKey, id);
    if (!bv || !cv || bv === 0) return null;
    return fl4(cv / bv);
  };
  const startEdit = (mo, id) => {
    const k = `${mo}_${id}`;
    setEditCell(k);
    setEditVal(String(getV(mo, id) || ""));
    setTimeout(() => editRef.current?.focus(), 50);
  };
  const commitEdit = () => {
    if (!editCell) return;
    const [mo, id] = editCell.split(/_(.+)/, 2); // split on first _ only
    const val = parseFloat(editVal);
    if (!isNaN(val) && val > 0) {
      setTsDB(p => ({
        ...p,
        [mo]: {
          ...(p[mo] || {}),
          [id]: val
        }
      }));
    }
    setEditCell(null);
  };
  const onKey = e => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") {
      setEditCell(null);
    }
  };
  const addMonth = () => {
    if (!addMo || !/^\d{6}$/.test(addMo)) {
      alert("YYYYMM 형식 6자리 입력 (예: 202506)");
      return;
    }
    if (tsDB[addMo]) {
      alert(`${addMo}는 이미 존재합니다.`);
      return;
    }
    const empty = {};
    IX_META.forEach(x => {
      empty[x.id] = 0;
    });
    setTsDB(p => ({
      ...p,
      [addMo]: {
        ...empty
      }
    }));
    setShowAdd(false);
    setAddMo("");
  };
  const delMonth = mo => {
    if (mo === baseKey || mo === compKey) {
      alert(`${mo}는 기준/비교시점으로 사용중입니다. 계약정보에서 시점을 변경 후 삭제하세요.`);
      return;
    }
    if (!confirm(`${mo} 월 데이터를 삭제하시겠습니까?`)) return;
    setTsDB(p => {
      const n = {
        ...p
      };
      delete n[mo];
      return n;
    });
  };
  const copyPrev = mo => {
    const prevMo = allMonths.filter(m => m < mo).pop();
    if (!prevMo) {
      alert("이전 월 데이터가 없습니다.");
      return;
    }
    setTsDB(p => ({
      ...p,
      [mo]: {
        ...p[prevMo]
      }
    }));
  };

  // ── 변동율 요약 ─────────────────────────────────────────────────
  const RatioPanel = () => /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#f8fafc",
      border: `1px solid ${C.brd}`,
      borderRadius: 8,
      padding: "12px 14px",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.cy,
      fontWeight: 700,
      letterSpacing: 1,
      marginBottom: 10,
      textTransform: "uppercase"
    }
  }, "\uD83D\uDCD0 \uC9C0\uC218 \uBCC0\uB3D9\uC728 \uC694\uC57D \u2014 \uAE30\uC900 ", baseKey || "미설정", " \u2192 \uBE44\uAD50 ", compKey || "미설정"), !baseKey || !compKey ? /*#__PURE__*/React.createElement("div", {
    style: {
      color: C.mut,
      fontSize: 12
    }
  }, "\uACC4\uC57D\uC815\uBCF4\uC5D0\uC11C \uC785\uCC30\uC77C(\uAE30\uC900\uC2DC\uC810)\uACFC \uC870\uC815\uAE30\uC900\uC77C(\uBE44\uAD50\uC2DC\uC810)\uC744 \uC785\uB825\uD558\uBA74 \uBCC0\uB3D9\uC728\uC774 \uD45C\uC2DC\uB429\uB2C8\uB2E4.") : /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: "auto"
    }
  }, cats.filter(c => c !== "전체").map(cat => {
    const ci = IX_META.filter(x => x.cat === cat);
    return /*#__PURE__*/React.createElement("div", {
      key: cat,
      style: {
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: C.mut,
        letterSpacing: .5,
        marginBottom: 4,
        fontWeight: 600
      }
    }, cat), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6,
        flexWrap: "wrap"
      }
    }, ci.map(x => {
      const bv = getV(baseKey, x.id),
        cv = getV(compKey, x.id);
      const ratio = getRatio(x.id);
      const tc = TYPE_COLOR[IX_TYPE[x.id]?.type] || C.mut;
      return /*#__PURE__*/React.createElement("div", {
        key: x.id,
        style: {
          background: C.card,
          border: `1px solid ${C.brd}`,
          borderRadius: 5,
          padding: "6px 10px",
          minWidth: mob ? 130 : 150
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 4,
          marginBottom: 3
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          background: tc + "22",
          color: tc,
          borderRadius: 3,
          padding: "1px 5px",
          fontSize: 9,
          fontWeight: 700
        }
      }, TYPE_LABEL[IX_TYPE[x.id]?.type] || ""), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          color: C.dim
        }
      }, x.id)), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          marginBottom: 2
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          color: C.am
        }
      }, bv != null ? fmtP(bv, 2) : "—"), /*#__PURE__*/React.createElement("span", {
        style: {
          color: C.mut
        }
      }, "\u2192"), /*#__PURE__*/React.createElement("span", {
        style: {
          color: C.gr
        }
      }, cv != null ? fmtP(cv, 2) : "—")), /*#__PURE__*/React.createElement("div", {
        style: {
          textAlign: "center",
          fontFamily: mono,
          fontWeight: 700,
          fontSize: 13,
          color: ratio != null ? ratio > 1 ? C.gr : ratio < 1 ? C.rd : C.txt : C.mut
        }
      }, ratio != null ? fmtD(ratio) + "×" : "미입력"));
    })));
  })));

  // ── 스프레드시트 ────────────────────────────────────────────────
  const cellBg = mo => {
    if (mo === baseKey) return "#7c2d12";
    if (mo === compKey) return "#14532d";
    return undefined;
  };
  const cellBrd = mo => {
    if (mo === baseKey) return `1px solid ${C.am}44`;
    if (mo === compKey) return `1px solid ${C.gr}44`;
    return undefined;
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#dbeafe",
      border: `1px solid ${C.cy}33`,
      borderRadius: 8,
      padding: "10px 14px",
      marginBottom: 12,
      fontSize: 12,
      color: "#7dd3fc",
      lineHeight: 1.8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      flexWrap: "wrap",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", null, "\uD83D\uDCC5 ", /*#__PURE__*/React.createElement("strong", null, "\uC9C0\uC218 DB"), " \u2014 2021.01\uBD80\uD130 \uD604\uC7AC\uAE4C\uC9C0 \uC6D4\uBCC4 \uC9C0\uC218\uAC12\uC744 \uAD00\uB9AC\uD569\uB2C8\uB2E4.", /*#__PURE__*/React.createElement("br", null), "\uD83D\uDFE1 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.am
    }
  }, "\uAE30\uC900\uC2DC\uC810(", baseKey || "미설정", ")"), "  |  \uD83D\uDFE2 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.gr
    }
  }, "\uBE44\uAD50\uC2DC\uC810(", compKey || "미설정", ")"), "  \uD589\uC774 \uAC15\uC870\uD45C\uC2DC\uB429\uB2C8\uB2E4.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: C.mut
    }
  }, "\uAC12\uD615: \uC0C1\uB300\uC9C0\uC218 / PPI\uD615: \uC808\uB300\uC9C0\uC218 / \uC694\uC728\uD615: \uC0C1\uB300\uC9C0\uC218 \u2014 \uBCC0\uB3D9\uC728 = \uBE44\uAD50\xF7\uAE30\uC900")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    v: "def",
    onClick: () => setShowHelp(p => !p),
    sx: {
      fontSize: 11,
      padding: "4px 8px"
    }
  }, "\u2753 \uC785\uB825\uC548\uB0B4"), /*#__PURE__*/React.createElement(Btn, {
    v: "suc",
    onClick: () => setShowAdd(p => !p),
    sx: {
      fontSize: 11,
      padding: "4px 8px"
    }
  }, "+ \uC6D4 \uCD94\uAC00")))), showHelp && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#eff6ff",
      border: `1px solid ${C.brd}`,
      borderRadius: 8,
      padding: "12px 14px",
      marginBottom: 12,
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: C.cy,
      marginBottom: 8
    }
  }, "\uD83D\uDCCB \uC9C0\uC218 \uC785\uB825 \uC548\uB0B4"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: mob ? "1fr" : "1fr 1fr",
      gap: 8
    }
  }, [["🔵 값형 (노임단가·기계경비)", "반기 고시시 기준시점=100 기준 상대값 입력\n예) 기준시점 100.00, 다음 반기 발표후 101.99 입력"], ["🔵 PPI형 (광산품·공산품 등)", "한국은행 ECOS 공표 절대값 직접 입력\n예) 2023.11=123.19, 2024.05=123.97"], ["🟡 요율형 (보험료율 등)", "기준시점=100 기준 상대값 입력\n예) 요율 인상시 100→102.5, 인하시 100→97.8"], ["🟣 지수형 (표준시장단가)", "반기 공시 지수값 직접 입력\n예) 기준시점 100.00, 다음 반기 발표 후 입력"]].map(([t, d], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: C.card,
      border: `1px solid ${C.brd}`,
      borderRadius: 5,
      padding: "8px 10px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      marginBottom: 4
    }
  }, t), /*#__PURE__*/React.createElement("div", {
    style: {
      color: C.mut,
      fontSize: 11,
      whiteSpace: "pre-line"
    }
  }, d))))), showAdd && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#eff6ff",
      border: `1px solid ${C.cy}44`,
      borderRadius: 8,
      padding: "12px 14px",
      marginBottom: 12,
      display: "flex",
      gap: 8,
      alignItems: "flex-end",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 180
    }
  }, /*#__PURE__*/React.createElement(FRow, {
    label: "\uCD94\uAC00\uD560 \uC5F0\uC6D4 (YYYYMM)",
    hint: "\uC608: 202506"
  }, /*#__PURE__*/React.createElement(Inp, {
    value: addMo,
    onChange: setAddMo,
    placeholder: "202506",
    onKeyDown: e => e.key === "Enter" && addMonth()
  }))), /*#__PURE__*/React.createElement(Btn, {
    v: "suc",
    onClick: addMonth,
    sx: {
      marginBottom: 4
    }
  }, "\uCD94\uAC00"), /*#__PURE__*/React.createElement(Btn, {
    v: "def",
    onClick: () => setShowAdd(false),
    sx: {
      marginBottom: 4
    }
  }, "\uCDE8\uC18C")), /*#__PURE__*/React.createElement(RatioPanel, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4,
      flexWrap: "wrap",
      marginBottom: 10
    }
  }, cats.map(c => /*#__PURE__*/React.createElement("button", {
    key: c,
    onClick: () => setCatF(c),
    style: {
      padding: "5px 12px",
      borderRadius: 20,
      cursor: "pointer",
      fontSize: 12,
      fontWeight: 600,
      background: catF === c ? C.cy + "22" : "#cbd5e1",
      color: catF === c ? C.cy : C.mut,
      border: `1px solid ${catF === c ? C.cy : C.brd}`,
      fontFamily: sans
    }
  }, c)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontSize: 11
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      background: C.am + "22",
      color: C.am,
      padding: "2px 8px",
      borderRadius: 3
    }
  }, "\uD83D\uDFE1 \uAE30\uC900\uC2DC\uC810"), /*#__PURE__*/React.createElement("span", {
    style: {
      background: C.gr + "22",
      color: C.gr,
      padding: "2px 8px",
      borderRadius: 3
    }
  }, "\uD83D\uDFE2 \uBE44\uAD50\uC2DC\uC810"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.pan,
      border: `1px solid ${C.brd}`,
      borderRadius: 8,
      overflow: "hidden",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: "auto",
      WebkitOverflowScrolling: "touch"
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      fontFamily: mono,
      fontSize: mob ? 11 : 12
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: "#f1f5f9"
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: {
      padding: "4px 10px",
      borderBottom: `1px solid ${C.brd}`,
      color: C.mut,
      fontSize: 10,
      textAlign: "left",
      minWidth: 90,
      position: "sticky",
      left: 0,
      background: "#f1f5f9",
      zIndex: 2
    }
  }, "\uC720\uD615"), visIdx.map(x => {
    const tp = IX_TYPE[x.id];
    const tc = TYPE_COLOR[tp?.type] || C.mut;
    return /*#__PURE__*/React.createElement("th", {
      key: x.id,
      style: {
        padding: "4px 8px",
        borderBottom: `1px solid ${C.brd}`,
        borderLeft: `1px solid ${C.brd}`,
        minWidth: 82,
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        background: tc + "22",
        color: tc,
        borderRadius: 3,
        padding: "1px 6px",
        fontSize: 9,
        fontWeight: 700
      }
    }, TYPE_LABEL[tp?.type] || ""));
  }), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: "4px 6px",
      borderBottom: `1px solid ${C.brd}`,
      borderLeft: `1px solid ${C.brd}`,
      minWidth: 70,
      background: "#f1f5f9"
    }
  })), /*#__PURE__*/React.createElement("tr", {
    style: {
      background: "#f1f5f9"
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: {
      padding: "6px 10px",
      borderBottom: `1px solid ${C.brd}`,
      color: C.cy,
      fontSize: 10,
      fontWeight: 700,
      textAlign: "left",
      textTransform: "uppercase",
      letterSpacing: .5,
      position: "sticky",
      left: 0,
      background: "#f1f5f9",
      zIndex: 2
    }
  }, "\uC5F0 \xB7 \uC6D4"), visIdx.map(x => {
    const tp = IX_TYPE[x.id];
    return /*#__PURE__*/React.createElement("th", {
      key: x.id,
      title: tp?.hint || "",
      style: {
        padding: "6px 8px",
        borderBottom: `1px solid ${C.brd}`,
        borderLeft: `1px solid ${C.brd}`,
        color: C.dim,
        fontSize: 10,
        fontWeight: 600,
        textAlign: "right",
        minWidth: 82,
        cursor: "help"
      }
    }, x.id);
  }), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: "6px 6px",
      borderBottom: `1px solid ${C.brd}`,
      borderLeft: `1px solid ${C.brd}`,
      color: C.mut,
      fontSize: 10,
      textAlign: "center",
      background: "#f1f5f9"
    }
  }, "\uAD00\uB9AC"))), /*#__PURE__*/React.createElement("tbody", null, baseKey && compKey && /*#__PURE__*/React.createElement("tr", {
    style: {
      background: "#eff6ff",
      borderBottom: `2px solid ${C.cy}44`
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "6px 10px",
      color: C.cy,
      fontWeight: 700,
      fontSize: 11,
      position: "sticky",
      left: 0,
      background: "#eff6ff",
      zIndex: 1,
      borderRight: `1px solid ${C.brd}`
    }
  }, "\uBCC0\uB3D9\uC728"), visIdx.map(x => {
    const r = getRatio(x.id);
    return /*#__PURE__*/React.createElement("td", {
      key: x.id,
      style: {
        padding: "5px 8px",
        textAlign: "right",
        borderLeft: `1px solid ${C.brd}`,
        fontWeight: 700,
        fontSize: 12,
        color: r != null ? r > 1 ? C.gr : r < 1 ? C.rd : C.txt : C.mut
      }
    }, r != null ? fmtD(r) : "—");
  }), /*#__PURE__*/React.createElement("td", {
    style: {
      borderLeft: `1px solid ${C.brd}`
    }
  })), allMonths.slice().reverse().map((mo, ri) => {
    const isBase = mo === baseKey,
      isComp = mo === compKey;
    const rowBg = isBase ? "#fff7ed" : isComp ? "#f0fdf4" : ri % 2 === 1 ? "#f1f5f9" : undefined;
    return /*#__PURE__*/React.createElement("tr", {
      key: mo,
      style: {
        background: rowBg,
        outline: isBase ? `1px solid ${C.am}33` : isComp ? `1px solid ${C.gr}33` : "none"
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "5px 10px",
        fontWeight: isBase || isComp ? 700 : 400,
        position: "sticky",
        left: 0,
        background: rowBg || C.pan,
        zIndex: 1,
        borderRight: `1px solid ${C.brd}`,
        borderBottom: `1px solid ${C.brd}`,
        color: isBase ? C.am : isComp ? C.gr : C.txt,
        whiteSpace: "nowrap"
      }
    }, mo.slice(0, 4), ".", mo.slice(4), isBase && /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 4,
        fontSize: 9,
        color: C.am
      }
    }, "\u2605\uAE30\uC900"), isComp && /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 4,
        fontSize: 9,
        color: C.gr
      }
    }, "\u25CE\uBE44\uAD50")), visIdx.map(x => {
      const ck = `${mo}_${x.id}`;
      const v = getV(mo, x.id);
      const isEdit = editCell === ck;
      return /*#__PURE__*/React.createElement("td", {
        key: x.id,
        onClick: () => !isEdit && startEdit(mo, x.id),
        style: {
          padding: "4px 6px",
          borderLeft: `1px solid ${C.brd}`,
          borderBottom: `1px solid ${C.brd}`,
          textAlign: "right",
          cursor: "pointer",
          minWidth: 82,
          background: isEdit ? "#dbeafe" : undefined
        }
      }, isEdit ? /*#__PURE__*/React.createElement("input", {
        ref: editRef,
        type: "number",
        step: "0.01",
        value: editVal,
        onChange: e => setEditVal(e.target.value),
        onBlur: commitEdit,
        onKeyDown: onKey,
        style: {
          width: "100%",
          background: "transparent",
          border: `1px solid ${C.cy}`,
          borderRadius: 3,
          color: C.cy,
          padding: "2px 4px",
          fontSize: 12,
          fontFamily: mono,
          textAlign: "right",
          outline: "none"
        }
      }) : /*#__PURE__*/React.createElement("span", {
        style: {
          color: v && v > 0 ? isBase ? C.am : isComp ? C.gr : C.txt : C.mut,
          fontSize: 11
        }
      }, v && v > 0 ? fmtP(v, 2) : "—"));
    }), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "3px 4px",
        borderLeft: `1px solid ${C.brd}`,
        borderBottom: `1px solid ${C.brd}`,
        textAlign: "center",
        whiteSpace: "nowrap"
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => copyPrev(mo),
      title: "\uC774\uC804 \uC6D4 \uBCF5\uC0AC",
      style: {
        background: "none",
        border: "none",
        cursor: "pointer",
        color: C.mut,
        fontSize: 11,
        padding: "1px 3px"
      }
    }, "\u2B06"), /*#__PURE__*/React.createElement("button", {
      onClick: () => delMonth(mo),
      title: "\uC0AD\uC81C",
      style: {
        background: "none",
        border: "none",
        cursor: "pointer",
        color: C.mut,
        fontSize: 11,
        padding: "1px 3px",
        marginLeft: 2
      }
    }, "\u2715")));
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.pan,
      border: `1px solid ${C.brd}`,
      borderRadius: 8,
      padding: "0 0 8px"
    }
  }, /*#__PURE__*/React.createElement(SH, {
    title: "\uD83D\uDCCC \uC9C0\uC218 \uD56D\uBAA9\uBCC4 \uCD9C\uCC98 \uBC0F \uC785\uB825 \uBC29\uBC95"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: "auto"
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      fontFamily: "inherit",
      fontSize: 11
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      padding: "5px 10px",
      background: "#f1f5f9",
      color: C.mut,
      textAlign: "left",
      borderBottom: `1px solid ${C.brd}`,
      minWidth: 130
    }
  }, "\uC9C0\uC218 ID"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: "5px 10px",
      background: "#f1f5f9",
      color: C.mut,
      textAlign: "left",
      borderBottom: `1px solid ${C.brd}`,
      minWidth: 80
    }
  }, "\uC720\uD615"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: "5px 10px",
      background: "#f1f5f9",
      color: C.mut,
      textAlign: "left",
      borderBottom: `1px solid ${C.brd}`,
      minWidth: 130
    }
  }, "\uCD9C\uCC98"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: "5px 10px",
      background: "#f1f5f9",
      color: C.mut,
      textAlign: "left",
      borderBottom: `1px solid ${C.brd}`
    }
  }, "\uC785\uB825 \uBC29\uBC95 \uBC0F \uC124\uBA85"))), /*#__PURE__*/React.createElement("tbody", null, IX_META.map((x, i) => {
    const tp = IX_TYPE[x.id];
    const tc = TYPE_COLOR[tp?.type] || C.mut;
    return /*#__PURE__*/React.createElement("tr", {
      key: x.id
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "5px 10px",
        borderBottom: `1px solid ${C.brd}`,
        color: C.cy,
        fontFamily: mono,
        background: i % 2 === 1 ? "#f1f5f9" : undefined
      }
    }, x.id), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "5px 10px",
        borderBottom: `1px solid ${C.brd}`,
        background: i % 2 === 1 ? "#f1f5f9" : undefined
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        background: tc + "22",
        color: tc,
        borderRadius: 3,
        padding: "1px 6px",
        fontSize: 10,
        fontWeight: 700
      }
    }, TYPE_LABEL[tp?.type] || "")), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "5px 10px",
        borderBottom: `1px solid ${C.brd}`,
        color: C.dim,
        background: i % 2 === 1 ? "#f1f5f9" : undefined
      }
    }, x.src), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "5px 10px",
        borderBottom: `1px solid ${C.brd}`,
        color: C.mut,
        background: i % 2 === 1 ? "#f1f5f9" : undefined
      }
    }, tp?.hint || x.note));
  }))))));
}

// ═══════════════════════════════════════════════════════════════════
// TAB: 계약 정보
// ═══════════════════════════════════════════════════════════════════
function ContractTab({
  ct,
  setCt,
  onReset
}) {
  const {
    mob
  } = useVPctx();
  const f = (k, v) => setCt(p => ({
    ...p,
    [k]: v
  }));
  const g2 = (a, b) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: mob ? "1fr" : "1fr 1fr",
      gap: "0 16px"
    }
  }, a, b);
  const F = (k, type = "text", step, hint, req) => /*#__PURE__*/React.createElement(FRow, {
    label: {
      projectName: "공사명",
      contractor: "계약자",
      client: "수요기관",
      contractMethod: "계약방법",
      bidRate: "낙찰율(%)",
      contractDate: "계약체결일",
      contractAmount: "계약금액(원)",
      startDate: "착공일",
      completionDate: "준공예정일",
      bidDate: "입찰일(기준시점)",
      compareDate: "조정기준일(비교시점)",
      adjustNo: "조정회차",
      thresholdRate: "등락율기준(%)",
      thresholdDays: "경과기간기준(일)",
      advanceAmt: "선금급(원)",
      excludedAmt: "적용제외금액(원)",
      preparedBy: "작성기관",
      preparedDate: "작성연월",
      progressPlan: "예정공정율(%)",
      progressActual: "실행공정율(%)"
    }[k] || k,
    required: req,
    hint: hint
  }, /*#__PURE__*/React.createElement(Inp, {
    type: type,
    step: step,
    value: ct[k] || "",
    onChange: v => f(k, v)
  }));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 12,
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    v: "am",
    onClick: onReset,
    sx: {
      fontSize: 11
    }
  }, "\u270F\uFE0F \uAE30\uBCF8\uC815\uBCF4 \uC218\uC815 (\uB9C8\uBC95\uC0AC)")), [{
    t: "■ 공사 기본정보",
    c: () => /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: mob ? "1fr" : "1fr 1fr",
        gap: "0 16px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        gridColumn: "1/-1"
      }
    }, F("projectName", "text", "", "", true)), F("contractor", "text", "", "", true), F("client", "text", "", "", true), /*#__PURE__*/React.createElement(FRow, {
      label: "\uACC4\uC57D\uBC29\uBC95"
    }, /*#__PURE__*/React.createElement(Sel, {
      value: ct.contractMethod || "계속비",
      onChange: v => f("contractMethod", v),
      options: ["계속비", "장기계속", "일반"]
    })), F("bidRate", "number", "0.01", "낙찰율 (%)"), F("preparedBy"), F("preparedDate", "text", "", "예) 2024-08"))
  }, {
    t: "■ 계약 금액·일정",
    c: () => /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: mob ? "1fr" : "1fr 1fr",
        gap: "0 16px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        gridColumn: "1/-1"
      }
    }, F("contractAmount", "number", "1", "", true)), F("contractDate", "date"), F("startDate", "date"), F("completionDate", "date"))
  }, {
    t: "■ ESC 조정 설정",
    c: () => /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: mob ? "1fr" : "1fr 1fr",
        gap: "0 16px"
      }
    }, F("bidDate", "text", "", "YYYY-MM-DD", true), F("compareDate", "text", "", "YYYY-MM-DD", true), F("adjustNo", "number", "1"), F("thresholdRate", "number", "0.1", "지방계약: 3%"), F("thresholdDays", "number", "1", "90일"), F("advanceAmt", "number", "1"), F("excludedAmt", "number", "1"))
  }, {
    t: "■ 공정 현황",
    c: () => /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: mob ? "1fr" : "1fr 1fr",
        gap: "0 16px"
      }
    }, F("progressPlan", "number", "0.01"), F("progressActual", "number", "0.01"))
  }].map(s => /*#__PURE__*/React.createElement(Box, {
    key: s.t,
    sx: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(SH, {
    title: s.t
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 16px"
    }
  }, s.c()))), /*#__PURE__*/React.createElement(Box, null, /*#__PURE__*/React.createElement(SH, {
    title: "\u25B6 \uD604\uD669 \uBBF8\uB9AC\uBCF4\uAE30"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 16px"
    }
  }, [["입찰일(기준시점)", ct.bidDate ? ct.bidDate.replace(/-/g, ".") + "  (" + toKey(ct.bidDate) + ")" : "—"], ["조정기준일(비교시점)", ct.compareDate ? ct.compareDate.replace(/-/g, ".") + "  (" + toKey(ct.compareDate) + ")" : "—"], ["경과일수 (초일불산입)", `${days(ct.bidDate, ct.compareDate)}일  (입찰일→조정기준일)`], ["계약금액", ct.contractAmount ? fmtW(nv(ct.contractAmount)) + " 원" : "—"], ["적용대가(B-C)", fmtW(nv(ct.contractAmount) - nv(ct.excludedAmt)) + " 원"]].map(([k, v], i) => /*#__PURE__*/React.createElement(CardRow, {
    key: i,
    label: k,
    value: v
  })))));
}

// ═══════════════════════════════════════════════════════════════════
// TAB: 종합의견서
// ═══════════════════════════════════════════════════════════════════
function ReportTab({
  ct,
  items,
  tsDB
}) {
  const {
    mob
  } = useVPctx();
  const r = runCalc(ct, items, tsDB);
  const dF = d => d ? d.replace(/-/g, ". ") : "—";
  const tds = (alt, sx) => ({
    padding: "7px 10px",
    borderBottom: `1px solid ${C.brd}`,
    background: alt ? "#f1f5f9" : undefined,
    fontSize: 12,
    verticalAlign: "middle",
    ...sx
  });
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    v: "pri",
    onClick: () => {
    var dF = function(d){ return d ? d.replace(/-/g, '. ') : '—'; };
    var rows = [
      ['공사명', ct.projectName, '수요기관', ct.client],
      ['계약자', ct.contractor, '계약방법', ct.contractMethod],
      ['계약일', dF(ct.contractDate), '계약금액', fmtW(nv(ct.contractAmount)) + ' 원'],
      ['착공일', dF(ct.startDate), '준공예정일', dF(ct.completionDate)],
      ['조정방법', '지수조정', '조정기준일', dF(ct.compareDate)],
      ['조정율', r.Kd2 + ' %', '조정금액', fmtW(r.adj) + ' 원'],
    ];
    var tbl = rows.map(function(row){
      return '<tr><td style="background:#f1f5f9;font-weight:700;width:14%">'+row[0]+'</td><td style="width:36%">'+row[1]+'</td><td style="background:#f1f5f9;font-weight:700;width:14%">'+row[2]+'</td><td style="width:36%">'+row[3]+'</td></tr>';
    }).join('');
    var adjRows = [
      ['물가변동 대상 계약금액 (B)', fmtW(nv(ct.contractAmount)) + ' 원'],
      ['물가변동 적용제외 금액 (C)', fmtW(nv(ct.excludedAmt)) + ' 원'],
      ['물가변동 적용대가 (D = B-C)', fmtW(r.app) + ' 원'],
      ['물가변동 등락 조정금액 (G = A×D)', fmtW(Math.round(r.gross)) + ' 원'],
      ['선금급 공제금액 (F)', fmtW(Math.round(r.adv)) + ' 원'],
      ['기타 공제금액 (H)', '0 원'],
      ['물가변동 조정 적용금액 (= G-F-H)', '<strong style="color:#1e3a5f;font-size:14px">' + fmtW(r.adj) + ' 원</strong>'],
    ];
    var adjTbl = adjRows.map(function(row, i){
      var bg = i===6 ? 'background:#eff6ff;' : (i%2===1?'background:#f8fafc;':'');
      return '<tr><td style="'+bg+'">'+row[0]+'</td><td style="text-align:right;'+bg+'">'+row[1]+'</td></tr>';
    }).join('');
    var opinion = '1. 위 공사에 대한 물가변동으로 인한 계약금액 조정 검토 첨부자료의 프로그램 내용은 입찰당시(직전 물가변동조정 당시)의 물가변동 기초자료의 내용과 부합됨을 확인하였으며,<br><br>2. 지방자치단체를 당사자로 하는 계약에 관한 법률 제22조 및 동법 시행령 제73조, 동법 시행규칙 제72조와 회계예규에 따라 물가변동으로 인한 계약금액의 조정율을 검토한 바 <strong>' + r.Kd2 + '%</strong> 이상 ' + (Number(r.K)>0?'상승':'하락') + '하였으며, 물가변동 조정 경과기간도 <strong>' + r.el + '일</strong> 이상 경과한 것을 확인하고 귀 공사에 물가변동으로 인한 계약금액조정의 적정성을 ' + (r.ok?'검토하여 줄 것을 요청합니다.':'사전검토하여 줄 것을 요청합니다.');
    var html = [
      '<!DOCTYPE html><html lang="ko"><head>',
      '<meta charset="UTF-8"><title>종합의견서 — '+ct.projectName+'</title>',
      '<style>',
      'body{font-family:-apple-system,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;font-size:13px;color:#1e293b;background:#fff;margin:0;padding:0}',
      '@page{size:A4;margin:20mm 15mm}',
      '@media print{body{padding:0}.no-print{display:none}}',
      '.page{max-width:780px;margin:0 auto;padding:24px 28px}',
      'h1{font-size:18px;text-align:center;color:#1e293b;margin-bottom:6px}',
      '.sub{text-align:center;font-size:12px;color:#64748b;margin-bottom:20px}',
      'h3{font-size:13px;font-weight:700;color:#1e3a5f;margin:18px 0 8px;border-left:3px solid #1e3a5f;padding-left:8px}',
      'table{width:100%;border-collapse:collapse;margin-bottom:14px;font-size:12px}',
      'td{padding:7px 10px;border:1px solid #cbd5e1;vertical-align:middle}',
      '.opinion{background:#f8fafc;border:1px solid #cbd5e1;border-radius:4px;padding:14px 16px;font-size:12px;line-height:2;margin-bottom:20px}',
      '.sign{text-align:right;font-size:12px;color:#64748b;margin-top:30px;line-height:2}',
      '.kpi{display:flex;gap:10px;margin-bottom:14px}',
      '.kpi-card{flex:1;border:1px solid #cbd5e1;border-radius:6px;padding:10px;text-align:center}',
      '.kpi-label{font-size:10px;color:#64748b;margin-bottom:4px}',
      '.kpi-val{font-size:18px;font-weight:700}',
      '</style></head><body>',
      '<div class="page">',
      '<h1>물가변동으로 인한 계약금액 조정에 대한 종합의견서</h1>',
      '<div class="sub">[붙임 1] — 지방계약법 §22, 시행령 §73, 시행규칙 §72</div>',
      '<h3>1. 일반 현황</h3>',
      '<table>'+tbl+'</table>',
      '<h3>2. 조정 내용</h3>',
      '<div class="kpi">',
      '<div class="kpi-card"><div class="kpi-label">조정율 (A)</div><div class="kpi-val" style="color:'+(r.mR?"#15803d":"#b45309")+'">'+r.Kd2+'%</div></div>',
      '<div class="kpi-card"><div class="kpi-label">경과기간</div><div class="kpi-val" style="color:'+(r.mD?"#15803d":"#dc2626")+'">'+r.el+'일</div></div>',
      '<div class="kpi-card"><div class="kpi-label">조정 적용금액</div><div class="kpi-val" style="color:#1e3a5f;font-size:15px">'+fmtW(r.adj)+'원</div></div>',
      '</div>',
      '<table>'+adjTbl+'</table>',
      '<h3>3. 기준시점 · 비교시점</h3>',
      '<table><tr><td style="background:#f1f5f9;font-weight:700;width:40%">입찰일 (기준시점)</td><td>'+dF(ct.bidDate)+'</td></tr>',
      '<tr><td style="background:#f1f5f9;font-weight:700">계약체결일</td><td>'+dF(ct.contractDate)+'</td></tr>',
      '<tr><td style="background:#f1f5f9;font-weight:700">조정기준일 (비교시점)</td><td>'+dF(ct.compareDate)+'</td></tr></table>',
      '<h3>4. 조정 요건</h3>',
      '<table><tr><td style="background:#f1f5f9;font-weight:700;width:40%">등락율 요건 (≥'+r.tR+'%)</td><td style="color:'+(r.mR?"#15803d":"#dc2626")+';font-weight:700">'+(r.mR?"✓ 충족":"✗ 미충족")+' ('+r.Kd2+'%)</td></tr>',
      '<tr><td style="background:#f1f5f9;font-weight:700">경과기간 요건 (≥'+r.tD+'일)</td><td style="color:'+(r.mD?"#15803d":"#dc2626")+';font-weight:700">'+(r.mD?"✓ 충족":"✗ 미충족")+' ('+r.el+'일)</td></tr></table>',
      '<h3>5. 종합의견</h3>',
      '<div class="opinion">'+opinion+'</div>',
      '<div class="sign"><div>'+(ct.preparedDate||'20__ 년 __ 월')+'</div><div style="font-size:14px;color:#1e293b;font-weight:700;margin-top:4px">'+(ct.preparedBy||'')+'</div></div>',
      '</div>',
      '<div class="no-print" style="text-align:center;padding:16px;background:#f1f5f9">',
      '<button onclick="window.print()" style="background:#1e3a5f;color:#fff;border:none;padding:10px 28px;border-radius:6px;font-size:14px;font-weight:700;cursor:pointer">🖨 PDF 저장 / 인쇄</button>',
      '<p style="font-size:11px;color:#64748b;margin-top:8px">아이폰: 공유버튼(□↑) → PDF로 저장</p>',
      '</div></body></html>'
    ].join('');
    var w = window.open('', '_blank');
    if (!w) { alert('팝업이 차단됐습니다. Safari 설정에서 팝업을 허용해 주세요.'); return; }
    w.document.open(); w.document.write(html); w.document.close();
  }
  }, "\uD83D\uDDA8 \uC778\uC1C4")), /*#__PURE__*/React.createElement(Box, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: mob ? "16px 14px" : "22px 28px 18px",
      textAlign: "center",
      borderBottom: `1px solid ${C.brd}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: mob ? 15 : 17,
      fontWeight: 700,
      color: C.txt,
      marginBottom: 4
    }
  }, "\uBB3C\uAC00\uBCC0\uB3D9\uC73C\uB85C \uC778\uD55C \uACC4\uC57D\uAE08\uC561 \uC870\uC815\uC5D0 \uB300\uD55C \uC885\uD569\uC758\uACAC\uC11C"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.mut
    }
  }, "[\uBD99\uC784 1] \u2014 \uC9C0\uBC29\uACC4\uC57D\uBC95 \xA722, \uC2DC\uD589\uB839 \xA773, \uC2DC\uD589\uADDC\uCE59 \xA772")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: mob ? "14px 12px" : "18px 28px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: C.cy,
      marginBottom: 10
    }
  }, "1. \uC77C\uBC18 \uD604\uD669"), mob ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, [["공사명", ct.projectName], ["수요기관", ct.client], ["계약자", ct.contractor], ["계약방법", ct.contractMethod], ["계약일", dF(ct.contractDate)], ["계약금액", fmtW(nv(ct.contractAmount)) + " 원"], ["착공일", dF(ct.startDate)], ["준공예정일", dF(ct.completionDate)], ["조정방법", "지수조정"], ["조정기준일", dF(ct.compareDate)], ["조정율", r.Kd2 + " %"], ["조정금액", fmtW(r.adj) + " 원"]].map(([k, v], i) => /*#__PURE__*/React.createElement(CardRow, {
    key: i,
    label: k,
    value: v
  }))) : /*#__PURE__*/React.createElement(TblWrap, null, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: 12,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("tbody", null, [["공사명", ct.projectName, "수요기관", ct.client], ["계약자", ct.contractor, "계약방법", ct.contractMethod], ["계약일", dF(ct.contractDate), "계약금액", fmtW(nv(ct.contractAmount)) + " 원"], ["착공일", dF(ct.startDate), "준공예정일", dF(ct.completionDate)], ["조정방법", "지수조정", "조정기준일", dF(ct.compareDate)], ["조정율", r.Kd2 + " %", "조정금액", fmtW(r.adj) + " 원"]].map(([k1, v1, k2, v2], i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    style: tds(i % 2 === 1, {
      color: C.mut,
      fontWeight: 600,
      width: "14%"
    })
  }, k1), /*#__PURE__*/React.createElement("td", {
    style: tds(i % 2 === 1, {
      width: "36%"
    })
  }, v1), /*#__PURE__*/React.createElement("td", {
    style: tds(i % 2 === 1, {
      color: C.mut,
      fontWeight: 600,
      width: "14%"
    })
  }, k2), /*#__PURE__*/React.createElement("td", {
    style: tds(i % 2 === 1, {
      width: "36%"
    })
  }, v2)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: C.cy,
      marginBottom: 10
    }
  }, "2. \uC870\uC815 \uB0B4\uC6A9"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: mob ? "1fr" : "1fr 1fr 1fr",
      gap: 10,
      marginBottom: 14
    }
  }, [["물가변동 조정율 (A)", r.Kd2 + " %", r.mR ? C.gr : C.am], ["물가변동 경과기간", r.el + " 일", r.mD ? C.gr : C.rd], ["조정기준일 공정율", ct.progressActual ? ct.progressActual + " %" : "—", C.dim]].map(([l, v, c], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: C.card,
      border: `1px solid ${C.brd}`,
      borderRadius: 6,
      padding: "10px 12px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: C.mut,
      marginBottom: 4
    }
  }, l), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 700,
      color: c,
      fontFamily: mono
    }
  }, v)))), [["물가변동 대상 계약금액 (B)", fmtW(nv(ct.contractAmount)) + " 원", false], ["물가변동 적용제외 금액 (C)", fmtW(nv(ct.excludedAmt)) + " 원", false], ["물가변동 적용대가 (D = B-C)", fmtW(r.app) + " 원", false], ["물가변동 등락 조정금액 (G = A×D)", fmtW(Math.round(r.gross)) + " 원", false], ["선금급 공제금액 (F)", fmtW(Math.round(r.adv)) + " 원", false], ["기타 공제금액 (H)", "0 원", false], ["물가변동 조정 적용금액 (= G-F-H)", fmtW(r.adj) + " 원", true]].map(([k, v, bold], i) => /*#__PURE__*/React.createElement(CardRow, {
    key: i,
    label: k,
    value: v,
    accent: bold ? C.cy : undefined
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: C.cy,
      margin: "16px 0 8px"
    }
  }, "3. \uAE30\uC900\uC2DC\uC810\xB7\uBE44\uAD50\uC2DC\uC810"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.card,
      border: `1px solid ${C.brd}`,
      borderRadius: 6,
      padding: "12px 14px",
      marginBottom: 14,
      fontSize: 12,
      lineHeight: 2
    }
  }, /*#__PURE__*/React.createElement("div", null, "\uC785 \uCC30 \uC77C (\uAE30\uC900\uC2DC\uC810) : ", dF(ct.bidDate)), /*#__PURE__*/React.createElement("div", null, "\uACC4\uC57D\uCCB4\uACB0\uC77C (\uAE30\uC900\uC2DC\uC810) : ", dF(ct.contractDate)), /*#__PURE__*/React.createElement("div", null, "\uC870\uC815\uAE30\uC900\uC77C (\uBE44\uAD50\uC2DC\uC810) : ", dF(ct.compareDate))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: C.cy,
      marginBottom: 8
    }
  }, "4. \uC870\uC815 \uC694\uAC74 \uAC80\uD1A0"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.card,
      border: `1px solid ${r.ok ? C.gr : C.am}`,
      borderRadius: 6,
      padding: "12px 14px",
      marginBottom: 14,
      lineHeight: 2.2
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Badge, {
    ok: r.mR,
    t: `등락율충족(${r.Kd2}%≥${r.tR}%)`,
    f: `등락율미충족(${r.Kd2}%<${r.tR}%)`
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Badge, {
    ok: r.mD,
    t: `경과충족(${r.el}일≥${r.tD}일)`,
    f: `경과미충족(${r.el}일<${r.tD}일)`
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      color: r.ok ? C.gr : C.am,
      fontWeight: 600,
      fontSize: 12
    }
  }, r.ok ? "→ 조정 요건 충족: 계약금액 조정 신청 가능" : "→ 조정 요건 미충족: 추정산출 참고용 (실제 청구 불가)")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: C.cy,
      marginBottom: 8
    }
  }, "5. \uC885\uD569\uC758\uACAC"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#f1f5f9",
      border: `1px solid ${C.brd}`,
      borderRadius: 6,
      padding: "14px 16px",
      fontSize: 12,
      lineHeight: 2,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 8
    }
  }, "1. \uC704 \uACF5\uC0AC\uC5D0 \uB300\uD55C \uBB3C\uAC00\uBCC0\uB3D9\uC73C\uB85C \uC778\uD55C \uACC4\uC57D\uAE08\uC561 \uC870\uC815 \uAC80\uD1A0 \uCCA8\uBD80\uC790\uB8CC\uC758 \uD504\uB85C\uADF8\uB7A8 \uB0B4\uC6A9\uC740 \uC785\uCC30\uB2F9\uC2DC(\uC9C1\uC804 \uBB3C\uAC00\uBCC0\uB3D9\uC870\uC815 \uB2F9\uC2DC)\uC758 \uBB3C\uAC00\uBCC0\uB3D9 \uAE30\uCD08\uC790\uB8CC\uC758 \uB0B4\uC6A9\uACFC \uBD80\uD569\uB428\uC744 \uD655\uC778\uD558\uC600\uC73C\uBA70,"), /*#__PURE__*/React.createElement("div", null, "2. \uC9C0\uBC29\uC790\uCE58\uB2E8\uCCB4\uB97C \uB2F9\uC0AC\uC790\uB85C \uD558\uB294 \uACC4\uC57D\uC5D0 \uAD00\uD55C \uBC95\uB960 \uC81C22\uC870 \uBC0F \uB3D9\uBC95 \uC2DC\uD589\uB839 \uC81C73\uC870, \uB3D9\uBC95 \uC2DC\uD589\uADDC\uCE59 \uC81C72\uC870\uC640 \uD68C\uACC4\uC608\uADDC\uC5D0 \uB530\uB77C \uBB3C\uAC00\uBCC0\uB3D9\uC73C\uB85C \uC778\uD55C \uACC4\uC57D\uAE08\uC561\uC758 \uC870\uC815\uC728\uC744 \uAC80\uD1A0\uD55C \uBC14", " ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: C.am
    }
  }, r.Kd2, "%"), " \uC774\uC0C1 ", Number(r.K) > 0 ? "상승" : "하락", "\uD558\uC600\uC73C\uBA70, \uBB3C\uAC00\uBCC0\uB3D9 \uC870\uC815 \uACBD\uACFC\uAE30\uAC04\uB3C4", " ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: C.am
    }
  }, r.el, "\uC77C"), " \uC774\uC0C1 \uACBD\uACFC\uD55C \uAC83\uC744 \uD655\uC778\uD558\uACE0 \uADC0 \uACF5\uC0AC\uC5D0 \uBB3C\uAC00\uBCC0\uB3D9\uC73C\uB85C \uC778\uD55C \uACC4\uC57D\uAE08\uC561\uC870\uC815\uC758 \uC801\uC815\uC131\uC744", " ", r.ok ? "검토하여 줄 것을 요청합니다." : "사전검토하여 줄 것을 요청합니다.")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right",
      fontSize: 12,
      color: C.dim,
      lineHeight: 2
    }
  }, /*#__PURE__*/React.createElement("div", null, ct.preparedDate || "20__ 년 __ 월"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: C.txt,
      fontWeight: 700
    }
  }, ct.preparedBy)))));
}

// ═══════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════
const TABS = [{
  id: "items",
  icon: "🔢",
  lbl: "비목 구성"
}, {
  id: "calc",
  icon: "📊",
  lbl: "조정율 산출"
}, {
  id: "ct",
  icon: "📋",
  lbl: "계약 정보"
}, {
  id: "rpt",
  icon: "📄",
  lbl: "종합의견서"
}];
function App() {
  const vp = useVP();
  const [tab, setTab] = useState("items");
  const [ct, setCt] = useState(DC);
  const [items, setItems] = useState(DI);
  const [tsDB, setTsDB] = useState(DEFAULT_TS);
  const [setup, setSetup] = useState(false); // false = show wizard
  const [editMode, setEditMode] = useState(false); // true = 수정 마법사 열림
  const [adminMode, setAdminMode] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  // 저장 데이터 로드
  useEffect(() => {
    (async () => {
      try {
        const s = await window.storage.get(SK.setup);
        if (s) setSetup(JSON.parse(s.value));
        const c = await window.storage.get(SK.c);
        if (c) setCt(JSON.parse(c.value));
        const i = await window.storage.get(SK.i);
        if (i) setItems(JSON.parse(i.value));
        const t = await window.storage.get(SK.ts);
        if (t) setTsDB(JSON.parse(t.value));
      } catch (e) {}
      setReady(true);
    })();
  }, []);
  const showToast = (msg, type = "ok") => {
    setToast({
      msg,
      type
    });
    setTimeout(() => setToast(null), 3000);
  };
  const saveAll = async () => {
    setSaving(true);
    try {
      await window.storage.set(SK.setup, JSON.stringify(setup));
      await window.storage.set(SK.c, JSON.stringify(ct));
      await window.storage.set(SK.i, JSON.stringify(items));
      await window.storage.set(SK.ts, JSON.stringify(tsDB));
      showToast("저장 완료 ✓");
    } catch (e) {
      showToast("저장 실패: " + e.message, "err");
    }
    setSaving(false);
  };
  const resetAll = async () => {
    if (!confirm("모든 데이터를 초기화하고 설정 마법사로 돌아갑니다.\n계속하시겠습니까?")) return;
    try {
      await window.storage.delete(SK.setup);
      await window.storage.delete(SK.c);
      await window.storage.delete(SK.i);
      await window.storage.delete(SK.ts);
    } catch (e) {}
    setCt(DC);
    setItems(DI);
    setTsDB(DEFAULT_TS);
    setSetup(false);
    showToast("초기화 완료");
  };
  const onSetupComplete = d => {
    setCt(d);
    if (!setup) setItems(DI); // 최초 설정 시만 비목 리셋
    setSetup(true);
    setEditMode(false);
    setTab("items");
    showToast(editMode ? "기본정보가 수정됐습니다 ✓" : "설정 완료! 비목 금액을 입력하세요.");
  };
  const openEditWizard = () => {
    setEditMode(true);
  };
  const r = setup ? runCalc(ct, items, tsDB) : null;
  const kc = r ? r.ok ? C.gr : Math.abs(r.K) >= 1 ? C.am : C.mut : C.mut;
  const visibleTabs = adminMode ? [...TABS, {
    id: "tsdb",
    icon: "📅",
    lbl: "지수 DB입력"
  }] : TABS;
  if (!ready) return /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.bg,
      color: C.txt,
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: sans
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 42,
      marginBottom: 12
    }
  }, "\u26A1"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: C.cy,
      fontSize: 13,
      letterSpacing: 3,
      fontFamily: mono
    }
  }, "LOADING...")));
  return /*#__PURE__*/React.createElement(VP.Provider, {
    value: vp
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.bg,
      color: C.txt,
      minHeight: "100vh",
      fontFamily: sans,
      fontSize: 13,
      lineHeight: 1.6
    }
  }, !setup && !editMode && /*#__PURE__*/React.createElement(SetupWizard, {
    onComplete: onSetupComplete
  }), editMode && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 500,
      overflowY: "auto",
      background: C.bg
    }
  }, /*#__PURE__*/React.createElement(SetupWizard, {
    onComplete: onSetupComplete,
    onCancel: () => setEditMode(false),
    initialData: ct
  })), setup && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(135deg,#1e3a5f,#1e40af)",
      borderBottom: `1px solid ${C.brd}`,
      position: "sticky",
      top: 0,
      zIndex: 100
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: vp.mob ? "10px 12px 0" : "12px 18px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 10,
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: vp.mob ? 14 : 16,
      fontWeight: 700,
      color: "#f1f5f9",
      letterSpacing: "-0.2px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, "\u26A1 ", ct.projectName || "ESC 물가변동 조정"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: vp.mob ? 10 : 11,
      color: C.mut,
      marginTop: 2
    }
  }, ct.contractor, " \xB7 ", ct.adjustNo, "\uD68C\uCC28 \xB7 ", ct.bidDate, "\u2192", ct.compareDate)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#f1f5f9",
      border: `1px solid ${kc}44`,
      borderRadius: 6,
      padding: "3px 10px",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: C.mut,
      letterSpacing: 1
    }
  }, "K"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: vp.mob ? 15 : 17,
      fontWeight: 700,
      color: kc,
      fontFamily: mono,
      lineHeight: 1.1
    }
  }, r ? r.Kd2 : "—", "%")), !vp.mob && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#f1f5f9",
      border: `1px solid ${C.cy}33`,
      borderRadius: 6,
      padding: "3px 10px",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: C.mut,
      letterSpacing: 1
    }
  }, "\uC870\uC815\uAE08\uC561"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: C.cy,
      fontFamily: mono,
      lineHeight: 1.2
    }
  }, r ? fmtW(r.adj) : "—", "\uC6D0")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4,
      alignItems: "center"
    }
  }, adminMode ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      background: "#7c2d12",
      border: `1px solid ${C.am}`,
      borderRadius: 20,
      padding: "3px 8px",
      fontSize: 10,
      color: "#fcd34d",
      fontWeight: 700,
      letterSpacing: .5
    }
  }, "\uD83D\uDD10 \uAD00\uB9AC\uC790"), /*#__PURE__*/React.createElement(Btn, {
    v: "def",
    onClick: () => {
      setAdminMode(false);
      if (tab === "tsdb") setTab("items");
    },
    sx: {
      padding: "3px 8px",
      fontSize: 10
    }
  }, "\uB85C\uADF8\uC544\uC6C3")) : /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowAdminLogin(true),
    title: "\uAD00\uB9AC\uC790 \uB85C\uADF8\uC778",
    style: {
      background: "none",
      border: `1px solid ${C.brd}`,
      borderRadius: 5,
      padding: "5px 8px",
      cursor: "pointer",
      color: C.mut,
      fontSize: 13,
      lineHeight: 1
    }
  }, "\uD83D\uDD10"), /*#__PURE__*/React.createElement(Btn, {
    v: "am",
    onClick: openEditWizard,
    sx: {
      padding: "5px 10px",
      fontSize: vp.mob ? 11 : 12
    }
  }, "\u270F\uFE0F ", vp.mob ? "수정" : "기본정보 수정"), /*#__PURE__*/React.createElement(Btn, {
    v: "pri",
    onClick: saveAll,
    sx: {
      padding: "5px 10px",
      fontSize: vp.mob ? 11 : 12
    }
  }, saving ? "저장중" : "💾 저장"), !vp.mob && /*#__PURE__*/React.createElement(Btn, {
    v: "dan",
    onClick: resetAll,
    sx: {
      padding: "5px 10px",
      fontSize: 11
    }
  }, "\u21BA")))), !vp.mob && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 0
    }
  }, visibleTabs.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    onClick: () => setTab(t.id),
    style: {
      padding: "8px 14px",
      cursor: "pointer",
      fontSize: 12,
      fontWeight: 600,
      background: "none",
      border: "none",
      fontFamily: sans,
      borderBottom: tab === t.id ? `2px solid ${t.id === "tsdb" ? C.am : C.cy}` : "2px solid transparent",
      color: tab === t.id ? t.id === "tsdb" ? C.am : C.cy : C.mut,
      transition: "all .15s"
    }
  }, t.icon, " ", t.lbl, t.id === "tsdb" && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      color: C.am,
      marginLeft: 3
    }
  }, "ADMIN")))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: vp.mob ? "12px 12px 90px" : "16px 18px 40px",
      maxWidth: 1280,
      margin: "0 auto"
    }
  }, tab === "calc" && /*#__PURE__*/React.createElement(CalcTab, {
    ct: ct,
    items: items,
    tsDB: tsDB
  }), tab === "items" && /*#__PURE__*/React.createElement(ItemsTab, {
    items: items,
    setItems: setItems
  }), tab === "tsdb" && /*#__PURE__*/React.createElement(TSTab, {
    tsDB: tsDB,
    setTsDB: setTsDB,
    ct: ct
  }), tab === "ct" && /*#__PURE__*/React.createElement(ContractTab, {
    ct: ct,
    setCt: setCt,
    onReset: () => openEditWizard()
  }), tab === "rpt" && /*#__PURE__*/React.createElement(ReportTab, {
    ct: ct,
    items: items,
    tsDB: tsDB
  })), vp.mob && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 200,
      background: "#f1f5f9",
      borderTop: `1px solid ${C.brd}`,
      display: "flex",
      boxShadow: "0 -4px 20px #000a"
    }
  }, visibleTabs.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    onClick: () => setTab(t.id),
    style: {
      flex: 1,
      padding: "8px 4px 10px",
      background: "none",
      border: "none",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 2,
      fontFamily: sans,
      color: tab === t.id ? t.id === "tsdb" ? C.am : C.cy : C.mut,
      transition: "color .15s"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18
    }
  }, t.icon), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      fontWeight: 600,
      letterSpacing: .5
    }
  }, t.lbl.replace(/ /g, "")))))), showAdminLogin && /*#__PURE__*/React.createElement(AdminModal, {
    onSuccess: () => {
      setAdminMode(true);
      setShowAdminLogin(false);
      setTab("tsdb");
      showToast("관리자 모드 활성화 ✓", "ok");
    },
    onClose: () => setShowAdminLogin(false)
  }), toast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      bottom: vp.mob ? 80 : 20,
      right: 16,
      zIndex: 9999,
      background: toast.type === "ok" ? "#14532d" : "#450a0a",
      border: `1px solid ${toast.type === "ok" ? "#16a34a" : "#dc2626"}`,
      color: toast.type === "ok" ? "#86efac" : "#fca5a5",
      borderRadius: 8,
      padding: "10px 16px",
      fontSize: 13,
      fontWeight: 600,
      boxShadow: "0 4px 24px #000a",
      maxWidth: 280
    }
  }, toast.msg)));
}
var _c=document.getElementById('root');
var _r=ReactDOM.createRoot(_c);
_r.render(React.createElement(App));
}catch(e){
  document.getElementById('root').innerHTML='<div style="padding:24px;color:#dc2626;font-family:sans-serif;background:#fff;min-height:100vh"><b>⚠ 오류</b><br><br><span style="font-size:11px;color:#64748b;word-break:break-all">'+String(e)+'</span></div>';
}
})();
