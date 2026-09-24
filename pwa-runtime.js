/* Dre After Dark · Life OS — PWA runtime + install certification */
(()=>{'use strict';
if(!('serviceWorker'in navigator))return;
let deferredInstall=null;
function installed(){return matchMedia('(display-mode: standalone)').matches||navigator.standalone===true}
function certify(){let box=document.getElementById('pwaCertification');if(!box)return;let standalone=installed(),controlled=!!navigator.serviceWorker.controller,secure=location.protocol==='https:',ok=standalone&&controlled&&secure;box.innerHTML=`<article class="card ${ok?'accent':''}"><p class="eyebrow">📱 INSTALLED APP CERTIFICATION</p><h3>${ok?'Standalone runtime verified ✓':'Installed runtime check'}</h3><p class="quiet">Launch mode: <b>${standalone?'Standalone ✓':'Browser'}</b> · Service worker: <b>${controlled?'Controlled ✓':'Waiting'}</b> · Secure origin: <b>${secure?'HTTPS ✓':'No'}</b></p><p class="quiet">${ok?'Life OS is running as the installed app, outside the normal browser tab.':'Open Life OS from its installed home-screen/app icon to complete this release gate.'}</p></article>`}function paint(){
 const b=document.getElementById('installBtn');if(!b)return;
 if(installed()){b.classList.add('hidden');b.disabled=true;b.textContent='Install app';b.setAttribute('aria-label','Life OS is installed');certify();return}
 if(deferredInstall){b.classList.remove('hidden');b.disabled=false;b.textContent='Install app';b.setAttribute('aria-label','Install Life OS app');return}
 b.classList.add('hidden');
 certify();
}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;paint()});
window.addEventListener('appinstalled',()=>{deferredInstall=null;paint();let t=document.querySelector('#toast');if(t){t.textContent='Life OS installed ✓';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),4000)}});
window.addEventListener('load',async()=>{try{
 let r=await navigator.serviceWorker.register('./sw.js?v=20260923-release03',{updateViaCache:'none'});
 window.LifePWA={registration:r,update:()=>r.update(),get installed(){return installed()},install:async()=>{if(!deferredInstall)return false;deferredInstall.prompt();let choice=await deferredInstall.userChoice;if(choice.outcome==='accepted')deferredInstall=null;paint();return choice.outcome==='accepted'}};
 let b=document.getElementById('installBtn');if(b)b.onclick=()=>window.LifePWA.install();
 paint();certify();navigator.serviceWorker.addEventListener('controllerchange',certify);
 r.addEventListener('updatefound',()=>{let w=r.installing;if(!w)return;w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)window.dispatchEvent(new CustomEvent('lifeos:pwa-update'))})})
}catch(e){console.warn('[LifeOS PWA]',e)}});
window.addEventListener('lifeos:pwa-update',()=>{let t=document.querySelector('#toast');if(t){t.textContent='Life OS update ready. Reload when convenient.';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),5000)}})
})();