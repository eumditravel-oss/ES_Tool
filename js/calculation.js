/*
 * calculation.js
 * ES 추정산출 판단 로직을 분리해두는 영역입니다.
 * 기존 화면 내부 계산식은 components.js 안에 그대로 보존되어 있습니다.
 */
(function(){
  "use strict";
  const U = window.ESC_UTILS;
  window.ESC_CALC = window.ESC_CALC || {
    isElapsed90Days(baseDate, compareDate){
      return U.diffDays(baseDate, compareDate) >= 90;
    },
    isOverThreePercent(rate){
      return U.toNumber(rate) >= 3;
    },
    isSalesLead(rate, elapsedDays){
      return U.toNumber(rate) >= 3 && U.toNumber(elapsedDays) >= 90;
    },
    estimateAdjustmentAmount(contractAmount, rate){
      return Math.round(U.toNumber(contractAmount) * U.toNumber(rate) / 100);
    },
    judgeEligibility({ baseDate, compareDate, rate }){
      const elapsedDays = U.diffDays(baseDate, compareDate);
      const passed90Days = elapsedDays >= 90;
      const passed3Percent = U.toNumber(rate) >= 3;
      return {
        elapsedDays,
        passed90Days,
        passed3Percent,
        eligible: passed90Days && passed3Percent
      };
    },
    weightedRate(items){
      const list = Array.isArray(items) ? items : [];
      const totalAmount = list.reduce((sum, item) => sum + U.toNumber(item.amount), 0);
      if (!totalAmount) return 0;
      return list.reduce((sum, item) => {
        return sum + (U.toNumber(item.amount) / totalAmount) * U.toNumber(item.rate);
      }, 0);
    }
  };
})();
