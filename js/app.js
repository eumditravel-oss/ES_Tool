/*
 * app.js
 * 앱 실행 이후 PWA manifest 등 전역 설정을 담당합니다.
 * 실제 기존 화면/컴포넌트 번들은 js/components.js에 보존되어 있습니다.
 */
(function(){
  try{
    var m={"name":"ESC 물가변동 조정 — 주식회사 컨코스트","short_name":"ESC 컨코스트","display":"standalone",
      "background_color":"#f0f4f8","theme_color":"#1e3a5f","start_url":"./",
      "icons":[{"src":"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Crect width='192' height='192' fill='%231e3a5f' rx='36'/%3E%3Ctext x='96' y='135' text-anchor='middle' font-size='110' fill='%23ffffff'%3E%E2%9A%A1%3C/text%3E%3C/svg%3E","sizes":"any","type":"image/svg+xml"}]};
    var b=new Blob([JSON.stringify(m)],{type:'application/json'});
    document.getElementById('pwa-manifest').setAttribute('href',URL.createObjectURL(b));
  }catch(e){}
})();
