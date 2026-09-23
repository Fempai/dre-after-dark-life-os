/* Life OS — authoritative habit interaction layer */
(()=>{'use strict';
const K='dreLifeOS',same=(a,b=new Date())=>new Date(a).toDateString()===b.toDateString();
function read(){try{return JSON.parse(localStorage.getItem(K)||'{}')}catch{return{}}}
function write(d){localStorage.setItem(K,JSON.stringify(d))}
function toast(t){let x=document.getElementById('toast');if(!x)return;x.textContent=t;x.classList.add('show');setTimeout(()=>x.classList.remove('show'),1800)}
function idFrom(el){return el?.dataset?.habitToggle||el?.dataset?.habit||el?.dataset?.complete||el?.closest?.('[data-habit-id]')?.dataset?.habitId||null}
function toggle(id){
 if(!id)return;
 let d=read();d.events=Array.isArray(d.events)?d.events:[];
 let i=-1;for(let n=d.events.length-1;n>=0;n--){let e=d.events[n];if(e.domain==='habit'&&e.type===id&&same(e.at)){i=n;break}}
 if(i>=0){d.events.splice(i,1);write(d);toast('Completion removed. 🗝️')}
 else{let h=(d.habits||[]).find(x=>x.id===id);d.events.push({id:(crypto.randomUUID?.()||String(Date.now())),at:new Date().toISOString(),domain:'habit',type:id,detail:h?.name||id,energy:d.energy});write(d);toast(id==='no-return'?'Verticality confirmed. 🕯️':'Tiny victory recorded ✨')}
 window.LifeHabitCurriculum?.refresh?.();window.HabitCommand?.render?.();
 try{window.dispatchEvent(new CustomEvent('lifeos:habit-change',{detail:{id}}))}catch{}
}
function handle(e){let b=e.target.closest?.('[data-habit-toggle],[data-habit],[data-complete],.habit-check');let id=idFrom(b);if(!id)return;e.preventDefault();e.stopImmediatePropagation();toggle(id)}
document.addEventListener('pointerup',handle,true);
window.LifeHabitInteractions={toggle};
})();