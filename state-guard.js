/* Dre After Dark · Life OS — canonical state write guard
   Prevents older long-lived module snapshots from deleting namespaces written by newer modules. */
(()=>{'use strict';
const KEY='dreLifeOS',nativeSet=Storage.prototype.setItem,nativeGet=Storage.prototype.getItem;
const isObj=x=>x&&typeof x==='object'&&!Array.isArray(x);
const protectedKeys=['personalLabs','commandCenter','signals','signalLinks','integration','calendar','homeSystems','health','relationship','journal','scanInbox'];
function parse(v){try{return JSON.parse(v)}catch{return null}}
function mergeCanonical(current,incoming){if(!isObj(current)||!isObj(incoming))return incoming;let out={...current,...incoming};for(const k of protectedKeys){if(!(k in incoming)&&k in current)out[k]=current[k]}
// Preserve namespaces unknown to an older writer. Core fields intentionally remain incoming-authoritative.
for(const [k,v] of Object.entries(current)){if(!(k in incoming)&&!(k in out))out[k]=v}
out.meta={...(isObj(current.meta)?current.meta:{}),...(isObj(incoming.meta)?incoming.meta:{}),canonicalWriteGuard:1,lastWriteAt:new Date().toISOString()};return out}
Storage.prototype.setItem=function(key,value){if(this===localStorage&&key===KEY){let incoming=parse(value),current=parse(nativeGet.call(this,key));if(isObj(incoming)&&isObj(current))value=JSON.stringify(mergeCanonical(current,incoming))}return nativeSet.call(this,key,value)};
window.LifeStore={key:KEY,read(){return parse(nativeGet.call(localStorage,KEY))||{}},merge(patch={}){let next={...this.read(),...patch};localStorage.setItem(KEY,JSON.stringify(next));return this.read()},mutate(fn){let next=this.read(),result=fn(next);localStorage.setItem(KEY,JSON.stringify(result&&isObj(result)?result:next));window.dispatchEvent(new CustomEvent('lifeos:data-changed',{detail:{source:'life-store'}}));return this.read()}};
})();