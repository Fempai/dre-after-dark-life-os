// One-time clean-start migration requested by Dre on 2026-09-16.
// Clears prototype/test entries while leaving the app's seeded routines and plant roster intact.
(() => {
  const marker = 'dreLifeOS_clean_start_2026_09_16';
  if (!localStorage.getItem(marker)) {
    localStorage.removeItem('dreLifeOS');
    localStorage.setItem(marker, new Date().toISOString());
  }
})();

// Canonical state write guard. This must execute before app.js because the original
// core keeps a long-lived in-memory snapshot while newer modules write namespaces
// directly into dreLifeOS. Merge-on-write prevents a stale core snapshot from
// deleting those newer namespaces.
(()=>{'use strict';
const KEY='dreLifeOS',nativeSet=Storage.prototype.setItem,nativeGet=Storage.prototype.getItem;
if(window.LifeStore)return;
const isObj=x=>x&&typeof x==='object'&&!Array.isArray(x),parse=v=>{try{return JSON.parse(v)}catch{return null}};
const protectedKeys=['personalLabs','commandCenter','signals','signalLinks','integration','calendar','homeSystems','health','relationship','journal','scanInbox'];
function mergeCanonical(current,incoming){if(!isObj(current)||!isObj(incoming))return incoming;let out={...current,...incoming};for(const k of protectedKeys)if(!(k in incoming)&&k in current)out[k]=current[k];out.meta={...(isObj(current.meta)?current.meta:{}),...(isObj(incoming.meta)?incoming.meta:{}),canonicalWriteGuard:1,lastWriteAt:new Date().toISOString()};return out}
Storage.prototype.setItem=function(key,value){if(this===localStorage&&key===KEY){let incoming=parse(value),current=parse(nativeGet.call(this,key));if(isObj(incoming)&&isObj(current))value=JSON.stringify(mergeCanonical(current,incoming))}return nativeSet.call(this,key,value)};
window.LifeStore={key:KEY,read(){return parse(nativeGet.call(localStorage,KEY))||{}},merge(patch={}){let next={...this.read(),...patch};localStorage.setItem(KEY,JSON.stringify(next));return this.read()},mutate(fn){let next=this.read(),result=fn(next);localStorage.setItem(KEY,JSON.stringify(result&&isObj(result)?result:next));window.dispatchEvent(new CustomEvent('lifeos:data-changed',{detail:{source:'life-store'}}));return this.read()}};
})();
