/* Dre After Dark · Life OS — interactive Habit Curriculum
   Uses the app's existing public habit completion/add flows so app state stays authoritative. */
(()=>{'use strict';
const core={
 Foundations:{icon:'🕯️',labels:['Project 5AM','Morning + evening care','Dogs','Habitat reset','Lights out']},
 'Intentional Leisure':{icon:'📚',labels:['Reading ritual','Intentional TV','Protected free time']},
 'Body & Fuel':{icon:'🍷',labels:['Movement','Meals + kitchen rhythm','Hydration']},
 'Creative Life':{icon:'✒️',labels:['Ink & Intrigue','Creative/project block','Learning']},
 'Estate Mastery':{icon:'🗝️',labels:['Rotating deep clean','Laundry rhythm','Conservatory rounds','Weekly review']}
};
const order=Object.keys(core);
const builtin={
 'no-return':'Project 5AM · Remain upright after 5:30',
 'skincare-am':'Morning Vanity Ritual','oral-am':'Morning oral care','hair-am':'Hair · presentable is the goal',
 'dogs-am':'Dogs · morning care','habitat':'15-minute Habitat Reset','dogs-pm':'Dogs · 8 PM bedtime',
 'shower':'Shower + PJs','skincare-pm':'Night face + oral routine','lights':'10 PM lights out'
};
const read=()=>{try{return JSON.parse(localStorage.getItem('dreLifeOS')||'{}')}catch{return {}}};
const sameDay=(a,b=new Date())=>new Date(a).toDateString()===b.toDateString();
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const js=s=>String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
function habitsFor(cluster,db){
 let hs=(db.habits||[]).filter(h=>(h.cluster||'Foundations')===cluster);
 if(cluster==='Foundations'){
   const seen=new Set(hs.map(h=>h.id));
   Object.entries(builtin).forEach(([id,name])=>{if(!seen.has(id))hs.push({id,name,cluster:'Foundations',stage:'Acquisition',assist:3})});
 }
 return hs;
}
function habitRow(h,db,locked){
 const done=(db.events||[]).some(e=>e.domain==='habit'&&e.type===h.id&&sameDay(e.at));
 if(locked)return `<div class="task curriculum-habit locked"><span>🔒</span><div><b>${esc(h.name)}</b></div></div>`;
 return `<div class="task curriculum-habit ${done?'done':''}" data-habit-id="${esc(h.id)}"><button type="button" class="habit-check" onclick="completeHabit('${js(h.id)}')" aria-label="${done?'Completed':'Mark complete'}">${done?'✓':'○'}</button><div><b>${esc(h.name)}</b><br><span class="quiet">${esc(h.frequency||'Daily')} · ${esc(h.stage||'Acquisition')}</span></div></div>`;
}
function render(){
 const root=document.getElementById('habitClusters'); if(!root)return;
 const db=read(),stage=Math.max(0,Math.min(order.length-1,Number(db.curriculumStage)||0));
 root.innerHTML=order.map((name,i)=>{
   const c=core[name],locked=i>stage,status=i<stage?'ESTABLISHED':i===stage?'NOW TRAINING':'LOCKED · NEXT CHAPTER';
   let hs=habitsFor(name,db);
   let body='';
   if(hs.length) body=hs.map(h=>habitRow(h,db,locked)).join('');
   else body=c.labels.map(x=>`<div class="task curriculum-preview"><span>${locked?'🔒':'○'}</span><div>${esc(x)}</div></div>`).join('');
   const customCount=hs.filter(h=>!builtin[h.id]).length;
   return `<article class="card ${i===stage?'accent':''}" data-curriculum-cluster="${esc(name)}"><p class="eyebrow">${status}</p><h3>${c.icon} ${esc(name)}</h3>${body}${i===stage&&i<order.length-1?'<p class="quiet">The next chapter opens when this cluster becomes reliably automatic.</p>':''}${customCount?`<p class="quiet">${customCount} custom ritual${customCount===1?'':'s'} in this chapter.</p>`:''}</article>`;
 }).join('');
}
function syncToday(){
 const db=read(),box=document.getElementById('foundationTasks'); if(!box)return;
 const hs=habitsFor('Foundations',db);
 box.innerHTML=hs.map(h=>habitRow(h,db,false)).join('');
}
function refresh(){render();syncToday()}
function wire(){
 const root=document.getElementById('habitClusters'); if(!root)return;
 // Existing app completion/add handlers remain the source of truth. Repaint after they persist/render.
 document.addEventListener('click',e=>{
   if(e.target.closest('.habit-check,[data-habit],#addHabit,#modalContent button')) setTimeout(refresh,80);
   if(e.target.closest('nav button[data-view="habits"],nav button[data-view="today"]')) setTimeout(refresh,0);
 },true);
 const mo=new MutationObserver(()=>{if(root.dataset.painting)return; root.dataset.painting='1'; requestAnimationFrame(()=>{render();delete root.dataset.painting})});
 mo.observe(root,{childList:true});
 refresh();
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',wire,{once:true}):wire();
})();