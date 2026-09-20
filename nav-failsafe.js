/* Dre After Dark · Life OS — authoritative navigation router */
(()=>{'use strict';
function route(button){
 const id=button&&button.dataset&&button.dataset.view,view=id&&document.getElementById(id);
 if(!view)return;
 document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
 document.querySelectorAll('#nav button[data-view]').forEach(b=>b.classList.remove('active'));
 view.classList.add('active');button.classList.add('active');
 try{localStorage.setItem('dreLifeOS_activeView',id)}catch(e){}
 if(id==='chronicle')window.DiscoveryChronicle?.render?.();
 if(id==='today')window.dispatchEvent(new CustomEvent('lifeos:today-visible'));
}
function bind(){
 const nav=document.getElementById('nav');if(!nav)return false;
 nav.querySelectorAll('button[data-view]').forEach(b=>{
   b.onclick=function(e){e.preventDefault();e.stopPropagation();route(b)};
   b.addEventListener('touchend',function(e){e.preventDefault();e.stopPropagation();route(b)},{passive:false});
 });
 return true;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{bind();setTimeout(bind,500);setTimeout(bind,2000)},{once:true});
else{bind();setTimeout(bind,500);setTimeout(bind,2000)}
window.addEventListener('load',()=>setTimeout(bind,0),{once:true});
window.LifeOSNav={route:id=>{const b=document.querySelector('#nav button[data-view="'+id+'"]');if(b)route(b)},bind};
})();