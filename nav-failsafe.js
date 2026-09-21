/* Dre After Dark · Life OS — non-destructive navigation stabilizer */
(()=>{'use strict';
function stabilize(button){
 const id=button?.dataset?.view,view=id&&document.getElementById(id);
 if(!view)return false;
 document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
 document.querySelectorAll('#nav button[data-view]').forEach(b=>b.classList.remove('active'));
 view.classList.add('active');button.classList.add('active');
 try{localStorage.setItem('dreLifeOS_activeView',id)}catch(e){}
 if(id==='chronicle')window.DiscoveryChronicle?.render?.();
 if(id==='today')window.dispatchEvent(new CustomEvent('lifeos:today-visible'));
 return true;
}
function bind(){
 const nav=document.getElementById('nav');if(!nav||nav.dataset.navStabilizer==='1')return !!nav;
 nav.dataset.navStabilizer='1';
 /* Do not replace module onclick handlers: dynamic views use them to render their contents. */
 nav.addEventListener('click',e=>{
   const b=e.target.closest?.('button[data-view]');if(!b)return;
   /* Let the owning module/core router render first, then only stabilize visibility. */
   setTimeout(()=>stabilize(b),20);
 },false);
 return true;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{bind();setTimeout(bind,500)},{once:true});
else{bind();setTimeout(bind,500)}
window.addEventListener('load',()=>setTimeout(bind,0),{once:true});
window.LifeOSNav={route:id=>{
 const b=document.querySelector('#nav button[data-view="'+id+'"]');
 if(!b)return false;
 b.click();
 setTimeout(()=>stabilize(b),20);
 return true;
},bind,stabilize};
})();