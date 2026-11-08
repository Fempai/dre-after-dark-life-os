'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=(name)=>fs.readFileSync(require('node:path').join(__dirname,'..',name),'utf8');
class StorageMock{constructor(){this.data=new Map()}getItem(k){return this.data.has(k)?this.data.get(k):null}setItem(k,v){this.data.set(k,String(v))}removeItem(k){this.data.delete(k)}}
async function main(){
 const storage=new StorageMock(),messages=[],elements=new Map();
 const input={files:[],value:'',onchange:null},status={textContent:''};
 elements.set('#importInput',input);elements.set('#backupStatus',status);elements.set('#exportBtn',{onclick:null});
 const document={readyState:'complete',querySelector:s=>elements.get(s)||null,addEventListener(){},createElement(){return {click(){},remove(){}}},body:{appendChild(){}}};
 const context={window:{dispatchEvent(){},addEventListener(){}},document,localStorage:storage,Storage:StorageMock,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail}},structuredClone,console,confirm:()=>true,setTimeout(fn){messages.push('reload scheduled');},location:{reload(){messages.push('reloaded')}},Blob,URL,Date,FileReader:class{readAsText(f){this.result=f.text;this.onload()}}};
 context.window.window=context.window;vm.createContext(context);
 vm.runInContext(source('state-guard.js'),context,{filename:'state-guard.js'});
 vm.runInContext(source('backup-release.js'),context,{filename:'backup-release.js'});
 storage.setItem('dreLifeOS',JSON.stringify({plants:[{nickname:'TEST-OLD'}],events:[{id:'old'}],habits:[]}));
 const restored={plants:[{nickname:'Audrey'}],events:[],habits:[],_lifeOSBackup:{format:1}};
 input.files=[{text:JSON.stringify(restored)}];input.onchange();
 assert.equal(status.textContent,'Backup restored successfully. Reloading Life OS…');
 const actual=JSON.parse(storage.getItem('dreLifeOS'));
 assert.deepEqual(actual.plants,[{nickname:'Audrey'}]);
 assert.deepEqual(actual.events,[]);
 assert.equal(actual._lifeOSBackup,undefined);
 assert.ok(messages.includes('reload scheduled'));
 const before=storage.getItem('dreLifeOS');
 input.files=[{text:'{"invalid":true}'}];input.onchange();
 assert.equal(storage.getItem('dreLifeOS'),before);
 assert.match(status.textContent,/Backup rejected/);
 console.log('PASS: restore replaces old plants/events, removes backup metadata, schedules reload, rejects invalid backups without changing state.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
