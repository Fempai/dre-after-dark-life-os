/* Dre After Dark · Life OS — navigation failsafe */
(()=>{'use strict';
function route(button){const id=button?.dataset?.view,view=id&&document.getElementById(id);if(!view)return;document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));document.querySelectorAll('#nav button[data-view]').forEach(b=>b.classList.remove('active'));view.classList.add('active');button.classList.add('active');try{localStorage.setItem('dreLifeOS_activeView',id)}catch{}if(id==='archive'&&typeof window.renderArchive==='function')window.renderArchive();if(id==='chronicle')window.DiscoveryChronicle?.activate?.();if(id==='today')window.dispatchEvent(new CustomEvent('lifeos:today-visible'))}
document.addEventListener('click',e=>{const b=e.target.closest?.('#nav button[data-view]');if(!b)return;setTimeout(()=>route(b),0)},true);
window.LifeOSNav={route:id=>{const b=document.querySelector('#nav button[data-view="'+id+'"]');if(b)route(b)}};
})();