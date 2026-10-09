/* Smart Scanner: opt-in cloud recognition, explicit review, local filing. */
(()=>{'use strict';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&quot;',"'":'&#39;'}[c]));
let proposal=null,sourceFile=null,busy=false;
function status(t){const x=$('#smartScanStatus');if(x)x.textContent=t}
async function encode(file){const bitmap=await createImageBitmap(file);const max=1400,scale=Math.min(1,max/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close?.();const data=canvas.toDataURL('image/jpeg',0.8);return {mimeType:'image/jpeg',imageBase64:data.split(',')[1]}}
function panel(){let host=$('#smartScanner article');if(!host||$('#scanRecognize'))return;const wrap=document.createElement('div');wrap.id='scanRecognize';wrap.innerHTML='<p class="quiet">Optional AI identification for Kitchen, Conservatory, Beauty and Other. Your photo is sent to Google Gemini free-tier services for analysis. Do not send receipts with personal/payment details or private/sensitive photos. Skin and Hair are manual-only.</p><button id="scanAnalyze" type="button" class="ghost">✨ Analyze selected image</button><div id="scanSuggestion" aria-live="polite"></div>';const save=$('#smartScanSave');save?.parentElement?.insertBefore(wrap,save);$('#scanAnalyze').addEventListener('click',analyze);$('#smartScanInput')?.addEventListener('change',clear);$('#smartScanDest')?.addEventListener('change',clear)}
function clear(){proposal=null;sourceFile=null;const el=$('#scanSuggestion');if(el)el.replaceChildren()}
async function analyze(){if(busy)return;const file=$('#smartScanInput')?.files?.[0],domain=$('#smartScanDest')?.value;
if(!file){status('Choose a picture before analyzing.');return}
if(!['kitchen','plants','beauty','other'].includes(domain)){status('AI recognition is disabled for sensitive Skin/Hair photos. Manual filing remains available.');return}
if(!file.type.startsWith('image/')){status('Select an image file.');return}
busy=true;const btn=$('#scanAnalyze');btn.disabled=true;clear();status('Preparing image for recognition…');
try{const auth=window.LifeAuth;if(!auth)throw Error('Cloud sign-in unavailable');const client=await auth.getClient(),session=await auth.getSession();if(!session?.access_token)throw Error('Sign in with Google in Settings first');
const image=await encode(file);if(image.imageBase64.length>5_600_000)throw Error('Image is too large; choose a smaller photo');
status('Identifying image…');const {data,error}=await client.functions.invoke('smart-recognize',{body:{domain,...image}});
if(error){let message=error.message||'Recognition unavailable';try{const body=await error.context?.json?.();message=body?.error||message}catch{}throw Error(message)}
if(!data?.itemName)throw Error('No item recognized; try another image or file manually');
proposal=data;sourceFile=file;render(data);status('Suggestion ready. Review before filing.');
}catch(e){status('AI recognition: '+(e.message||'Unavailable')+'. Manual Save scan still works.')}finally{busy=false;btn.disabled=false}}
function render(d){const host=$('#scanSuggestion');if(!host)return;host.replaceChildren();const card=document.createElement('div');card.className='card';const h=document.createElement('h4');h.textContent='Review Gemini suggestion';card.append(h);
const field=(label,value)=>{const l=document.createElement('label');l.textContent=label;const input=document.createElement('input');input.value=String(value||'');l.append(input);card.append(l);return input};
const name=field('Item name',d.itemName),brand=field('Brand',d.brand),category=field('Category',d.category);
const descLabel=document.createElement('label');descLabel.textContent='Description / corrections';const desc=document.createElement('textarea');desc.value=d.description||'';descLabel.append(desc);card.append(descLabel);
const small=document.createElement('p');small.className='quiet';small.textContent='AI confidence: '+d.confidence+(d.warnings?.length?' · '+d.warnings.join('; '):'');card.append(small);
const buttons=document.createElement('div');buttons.className='row';const approve=document.createElement('button');approve.type='button';approve.textContent='Approve and save scan';const cancel=document.createElement('button');cancel.type='button';cancel.className='ghost';cancel.textContent='Discard suggestion';buttons.append(approve,cancel);card.append(buttons);host.append(card);
cancel.onclick=()=>{clear();status('Suggestion discarded. Original photo is unchanged.')};
approve.onclick=async()=>{if(!sourceFile||$('#smartScanInput')?.files?.[0]!==sourceFile){clear();status('Photo changed; analyze again.');return}if(!name.value.trim()){status('Enter an item name before saving.');return}
const note=$('#smartScanNote'),lines=[name.value.trim(),brand.value.trim()?'Brand: '+brand.value.trim():'',category.value.trim()?'Category: '+category.value.trim():'',desc.value.trim()].filter(Boolean).join(' · ');if(note)note.value=[note.value.trim(),lines].filter(Boolean).join('\n');clear();status('Suggestion approved. Saving original scan…');$('#smartScanSave')?.click()};
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',panel,{once:true}):panel();
window.LifeSmartScanner={install:panel};
})();