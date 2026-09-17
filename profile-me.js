/* Dre After Dark · Life OS — Profile Me
   Longitudinal behavioral dossier built from raw Life OS events.
   Descriptive analytics only: observations, associations, predictions with evidence labels.
*/
(() => {
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const getState = () => { try { return JSON.parse(localStorage.getItem('dreLifeOS')||'{}'); } catch { return {}; } };
  const events = () => getState().events || [];
  const daysObserved = ev => new Set(ev.map(e => String(e.at||e.date||'').slice(0,10)).filter(Boolean)).size;
  const pct = (a,b) => b ? Math.round(a/b*100) : 0;
  const confidence = n => n < 7 ? ['INSUFFICIENT EVIDENCE','Keep logging. Life OS will not invent a pattern from a handful of observations.'] : n < 21 ? ['EMERGING','A pattern may be forming; treat it as preliminary.'] : n < 60 ? ['DEVELOPING','Enough repeated observations for a useful descriptive signal.'] : ['ESTABLISHED','Repeated longitudinal evidence supports a stable descriptive pattern.'];
  const classify = ev => {
    const text = `${ev.domain||''} ${ev.event||''} ${ev.detail||''}`.toLowerCase();
    const groups = {
      'Temporal Architecture':['wake','sleep','lights out','morning','evening','latency','duration'],
      'Executive Function':['habit','vertical','rescue','stuck','initiation','routine','capacity'],
      'Environmental Context':['calendar','social','workday','weekend','deviation','interrupt','conflict'],
      'Ritual Automaticity':['habit','ritual','graduate','foundation','reading','tv','skincare'],
      'Domestic Systems':['house','estate','clean','trash','dog','laundry','kitchen'],
      'Body · Nutrition · Vanity':['meal','food','weight','hydration','skin','hair','beauty','shower'],
      'Conservatory':['plant','water','leaf','prune','repot','feed','conservatory'],
      'Leisure Ecology':['read','book','tv','leisure','free time','project','creative']
    };
    return Object.fromEntries(Object.entries(groups).map(([k,words])=>[k,words.some(w=>text.includes(w))]));
  };
  const build = () => {
    const ev = events(); const n=ev.length; const days=daysObserved(ev); const [label,note]=confidence(days);
    const counts={}; Object.keys(classify({})).forEach(k=>counts[k]=0);
    ev.forEach(e=>{const c=classify(e); Object.keys(c).forEach(k=>{if(c[k])counts[k]++})});
    const ranked=Object.entries(counts).sort((a,b)=>b[1]-a[1]);
    const coverage=ranked.filter(([,v])=>v>0).length;
    return {ev,n,days,label,note,counts,ranked,coverage};
  };
  const insight = (name,count,total) => {
    const share=pct(count,total); let text;
    if(!count) text='No usable observations yet.';
    else if(count<7) text=`${count} signals logged. More observations are required before interpretation.`;
    else text=`${count} relevant signals (${share}% of logged events) are available for longitudinal analysis.`;
    return `<article class="profile-domain"><div><span class="eyebrow">${esc(name)}</span><strong>${count}</strong></div><p>${text}</p><button class="profile-evidence" data-domain="${esc(name)}">Show evidence</button></article>`;
  };
  const render = () => {
    const root=$('#profileMeRoot'); if(!root)return; const d=build();
    root.innerHTML=`
      <section class="profile-cover card"><p class="eyebrow">SUBJECT: DRE · LONGITUDINAL DOSSIER</p><h2>Profile Me</h2><p class="profile-deck">What does your actual behavior reveal when memory, guilt and guesswork are removed?</p><div class="metrics"><div><strong>${d.days}</strong><span>observed days</span></div><div><strong>${d.n}</strong><span>behavioral events</span></div><div><strong>${d.coverage}/8</strong><span>domains sampled</span></div><div><strong>${d.label}</strong><span>evidence maturity</span></div></div><p class="quiet">${d.note}</p></section>
      <section class="card"><div class="sectionhead"><div><p class="eyebrow">BEHAVIORAL ARCHITECTURE</p><h3>Evidence map</h3></div><button id="profileRefresh">Recalculate</button></div><div class="profile-grid">${d.ranked.map(([k,v])=>insight(k,v,d.n)).join('')}</div></section>
      <section class="grid two"><article class="card"><p class="eyebrow">INTERPRETATION LADDER</p><h3>What Life OS is allowed to say</h3><p><b>Observation</b> — what was logged.</p><p><b>Association</b> — variables repeatedly moved together.</p><p><b>Prediction</b> — historical outcomes under comparable conditions, with sample size and confidence.</p><p><b>Causation</b> — never inferred from ordinary tracking alone.</p></article><article class="card"><p class="eyebrow">NEXT BEST DATA</p><h3>Improve the dossier</h3><p>${d.days<21?'Keep logging ordinary days, especially deviations. Variation is useful evidence.':'Your dataset can support comparisons. Use Experiments and annotations to test specific questions.'}</p><p class="quiet">Raw events remain underneath every summary so future analyses can ask questions we have not invented yet.</p></article></section>
      <section class="card"><p class="eyebrow">ANNUAL DOSSIER</p><h3>${new Date().getFullYear()} · The Architecture of Dre</h3><p>Temporal Architecture · Executive Function Profile · Environmental Sensitivity · Ritual Automaticity · Recovery & Resilience · Leisure Ecology · Domestic Systems · Body / Vanity / Nutrition · Conservatory · Predictive Models · What Changed · Questions Worth Testing Next</p><button id="profileShare">Create I&I dossier card</button></section>`;
    root.querySelectorAll('.profile-evidence').forEach(b=>b.onclick=()=>showEvidence(b.dataset.domain));
    $('#profileRefresh')?.addEventListener('click',render); $('#profileShare')?.addEventListener('click',shareCard);
  };
  const showEvidence = domain => {
    const ev=events().filter(e=>classify(e)[domain]).slice(-40).reverse();
    const html=`<p class="eyebrow">EVIDENCE · ${esc(domain)}</p><h2>Underlying observations</h2>${ev.length?`<div class="tablewrap"><table><thead><tr><th>Date</th><th>Event</th><th>Detail</th></tr></thead><tbody>${ev.map(e=>`<tr><td>${esc(String(e.at||e.date||'').slice(0,16).replace('T',' '))}</td><td>${esc(e.event||e.domain||'')}</td><td>${esc(e.detail||'')}</td></tr>`).join('')}</tbody></table></div>`:'<p>No evidence yet.</p>'}`;
    if(window.openLifeModal) window.openLifeModal(html); else { const m=$('#modal'),c=$('#modalContent'); if(c)c.innerHTML=html; m?.classList.remove('hidden'); }
  };
  const shareCard = async () => {
    const d=build(); const text=`THE ARCHITECTURE OF DRE · ${new Date().getFullYear()}\n${d.days} observed days · ${d.n} behavioral events · ${d.coverage}/8 domains sampled\nEvidence maturity: ${d.label}\n\nA life, deliberately arranged. · Dre After Dark · Life OS`;
    try { if(navigator.share) await navigator.share({title:'The Architecture of Dre',text}); else { await navigator.clipboard.writeText(text); alert('Dossier summary copied.'); } } catch(e){}
  };
  const install = () => {
    if($('#profile')) return;
    const nav=$('#nav'); const settings=$('#settings'); if(!nav||!settings)return;
    const b=document.createElement('button'); b.dataset.view='profile'; b.textContent='Profile Me'; nav.insertBefore(b, nav.querySelector('[data-view="settings"]'));
    const s=document.createElement('section'); s.id='profile'; s.className='view'; s.innerHTML='<div id="profileMeRoot"></div>'; settings.parentNode.insertBefore(s,settings);
    b.addEventListener('click',()=>{document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));document.querySelectorAll('#nav button').forEach(x=>x.classList.remove('active'));s.classList.add('active');b.classList.add('active');render();});
  };
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',install):install();
})();