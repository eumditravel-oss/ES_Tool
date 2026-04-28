/*
 * admin.js
 * 관리자 DB 입력/수정 기능을 확장할 때 사용하는 영역입니다.
 * 현재는 기존 앱 UI를 보존하기 위해 전역 헬퍼만 제공합니다.
 */
(function(){
  "use strict";
  window.ESC_ADMIN = window.ESC_ADMIN || {
    defaultPassword: "0000",
    checkPassword(input){
      return String(input || "") === this.defaultPassword;
    },
    getUpdateCycle(type){
      const cycles = {
        labor: "연 2회",
        material: "매월 API",
        equipment: "연 1회",
        standardMarketUnitPrice: "연 2회",
        overheadRate: "연 1회"
      };
      return cycles[type] || "관리자 확인 필요";
    }
  };
})();
