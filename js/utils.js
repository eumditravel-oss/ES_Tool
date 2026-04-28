/*
 * utils.js
 * 화면 전반에서 재사용할 공통 유틸리티 영역입니다.
 */
(function(){
  "use strict";
  const DAY = 24 * 60 * 60 * 1000;
  window.ESC_UTILS = window.ESC_UTILS || {
    toNumber(value){
      if (value == null || value === "") return 0;
      const n = Number(String(value).replace(/,/g, ""));
      return Number.isFinite(n) ? n : 0;
    },
    formatMoney(value){
      return Math.round(this.toNumber(value)).toLocaleString("ko-KR");
    },
    formatPercent(value, digits = 2){
      const n = this.toNumber(value);
      return n.toFixed(digits) + "%";
    },
    diffDays(from, to){
      const a = new Date(from);
      const b = new Date(to);
      if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
      return Math.floor((b.getTime() - a.getTime()) / DAY);
    },
    todayISO(){
      const d = new Date();
      const tz = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - tz).toISOString().slice(0, 10);
    }
  };
})();
