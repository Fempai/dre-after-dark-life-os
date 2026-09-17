/* Dre After Dark · Life OS — single Supabase auth authority */
(()=>{
const SB='https://alwtccdiyudsucfioahr.supabase.co',KEY='sb_publishable_v1AZYAfBP6vA0nrxcWQI6g_sWFt5PYU',APP='https://fempai.github.io/dre-after-dark-life-os/';
let client=null,readyResolve;const ready=new Promise(r=>readyResolve=r);
async function loadSDK(){if(window.supabase)return;const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';await new Promise((r,j)=>{s.onload=r;s.onerror=j;document.head.appendChild(s)})}
async function boot(){
 await loadSDK();
 // GitHub Pages is a browser-only app, so use Supabase's browser OAuth flow.
 // One client owns the persisted Supabase session for auth, sync and Calendar.
 client=window.supabase.createClient(SB,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'implicit'}});
 upgrade();
 client.auth.onAuthStateChange((event,session)=>{setTimeout(async()=>{await paint(session);if(event==='SIGNED_IN'&&session)await restoreCloudIfNeeded(session)},0)});
 const {data:{session},error}=await client.auth.getSession();
 if(error)paintError(error.message);else{await paint(session);if(session)await restoreCloudIfNeeded(session)}
 readyResolve(client);
}
async function signIn(){
 const x=document.getElementById('cloudState');if(x)x.textContent='Opening Google sign-in…';
 const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:APP,scopes:'openid email profile'}});
 if(error)paintError(error.message);
}
async function signOut(){await client.auth.signOut();await paint(null)}
function localState(){try{return JSON.parse(localStorage.getItem('dreLifeOS')||'null')}catch{return null}}
function saveLocal(v){localStorage.setItem('dreLifeOS',JSON.stringify(v))}
async function syncNow(){
 const {data:{session}}=await client.auth.getSession();if(!session){paintError('Sign in with Google first.');return}
 const x=document.getElementById('cloudState');if(x)x.textContent='Syncing Life OS to Supabase…';
 const snapshot=localState()||{};
 const {error}=await client.from('life_os_profiles').upsert({user_id:session.user.id,settings:{life_os:snapshot},updated_at:new Date().toISOString()},{onConflict:'user_id'});
 if(error)return paintError(error.message);
 localStorage.setItem('dreLifeOSCloudUser',session.user.id);if(x)x.textContent=`Cloud synced · ${session.user.email||'Google account'} · ${new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}`;
}
async function restoreCloudIfNeeded(session){
 // Never overwrite an established local device automatically. Restore only when this browser has no Life OS state.
 if(localState())return;
 const {data,error}=await client.from('life_os_profiles').select('settings').eq('user_id',session.user.id).maybeSingle();
 if(error||!data?.settings?.life_os)return;
 saveLocal(data.settings.life_os);localStorage.setItem('dreLifeOSCloudUser',session.user.id);location.reload();
}
function paintError(t){const x=document.getElementById('cloudState');if(x)x.textContent='Sign-in needs attention: '+t}
async function paint(session){
 if(session===undefined){const r=await client.auth.getSession();session=r.data.session}
 const x=document.getElementById('cloudState'),g=document.getElementById('googleLifeSignIn'),o=document.getElementById('googleLifeSignOut'),s=document.getElementById('syncBtn');
 if(session){if(x)x.textContent=`Cloud identity connected · ${session.user.email||'Google account'}`;g?.classList.add('hidden');o?.classList.remove('hidden');if(s)s.disabled=false}
 else{if(x)x.textContent='Sign in with Google to protect cloud data and persistent integrations.';g?.classList.remove('hidden');o?.classList.add('hidden');if(s)s.disabled=true}
}
function upgrade(){
 const cloud=document.getElementById('cloudState')?.closest('article');if(!cloud)return;
 ['email','password','signup','signin','signout'].forEach(id=>{const e=document.getElementById(id);if(e)e.style.display='none'});
 let g=document.getElementById('googleLifeSignIn');if(!g){const wrap=document.createElement('div');wrap.innerHTML=`<button id="googleLifeSignIn" class="primary" style="width:100%;margin:.75rem 0">G&nbsp;&nbsp; Continue with Google</button><button id="googleLifeSignOut" class="ghost hidden" style="width:100%;margin:.5rem 0">Sign out of Life OS</button><p class="quiet">One Supabase identity protects Life OS cloud sync and authorizes persistent integrations.</p>`;cloud.insertBefore(wrap,document.getElementById('syncBtn'));g=document.getElementById('googleLifeSignIn')}
 g.onclick=signIn;document.getElementById('googleLifeSignOut').onclick=signOut;const s=document.getElementById('syncBtn');if(s)s.onclick=syncNow;
}
window.LifeAuth={signIn,signOut,syncNow,getClient:async()=>{await ready;return client},getSession:async()=>{await ready;return (await client.auth.getSession()).data.session,},ready};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot):boot();
})();