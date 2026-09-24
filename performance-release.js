/* Life OS — real-device performance + storage release probe */
(()=>{'use strict';const $=s=>document.querySelector(s);
async function render(){
 const host=$('#releasePerformance');if(!host)return;
 let kb=0,media=[];try{kb=new Blob([localStorage.getItem('dreLifeOS')||'']).size/1024}catch{}try{media=await window.LifeMedia?.list?.()||[]}catch{}
 const nav=performance.getEntriesByType('navigation')[0],load=nav?Math.round(nav.loadEventEnd-nav.startTime):null,dom=nav?Math.round(nav.domContentLoadedEventEnd-nav.startTime):null;
 const resources=performance.getEntriesByType('resource'),transfer=Math.round(resources.reduce((n,x)=>n+(x.transferSize||0),0)/1024);
 host.innerHTML=`<article class="card"><p class="eyebrow">DEVICE PERFORMANCE</p><h3>Real-device release profile</h3><div class="ii-item">Structured data · <b>${kb.toFixed(0)} KB</b></div><div class="ii-item">IndexedDB media · <b>${media.length} objects</b></div><div class="ii-item">DOM ready · <b>${dom==null?'not exposed':dom+' ms'}</b></div><div class="ii-item">Window load · <b>${load==null?'not exposed':load+' ms'}</b></div><div class="ii-item">Network transfer this load · <b>${transfer} KB</b></div><p class="quiet">Numbers are descriptive and device/network dependent. Release certification also requires smooth hands-on navigation with the real dataset.</p></article>`;
}
function install(){let h=$('#releaseReadiness');if(!h)return false;let p=$('#releasePerformance');if(!p){p=document.createElement('div');p.id='releasePerformance';h.after(p)}return true}
function run(){if(install())render()}document.addEventListener('click',e=>{if(e.target.closest?.('#nav [data-view="settings"]')||e.target.closest?.('#settingsHealth summary'))setTimeout(run,180)},true);document.addEventListener('toggle',e=>{if(e.target?.id==='settingsHealth'&&e.target.open)setTimeout(run,100)},true);document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(run,1200),{once:true}):setTimeout(run,1200);window.LifePerformance={render:run};
})();