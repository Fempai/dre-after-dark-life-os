/* Dre After Dark · Life OS — single Supabase auth authority */
(()=>{
const SB='https://alwtccdiyudsucfioahr.supabase.co',KEY='sb_publishable_v1AZYAfBP6vA0nrxcWQI6g_sWFt5PYU',APP='https://fempai.github.io/dre-after-dark-life-os/';
let client=null,readyResolve;const ready=new Promise(r=>readyResolve=r);
async function loadSDK(){if(window.supabase)return;const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';await new Promise((r,j)=>{s.onload=r;s.onerror=j;document.head.appendChild(s)})}
function safeCallbackReport(){
 const hash=new URLSearchParams(location.hash.replace(/^#/,'')),query=new URLSearchParams(location.search);
 const hasAccess=hash.has('access_token'),hasRefresh=hash.has('refresh_token'),hasCode=query.has('code');
 const error=query.get('error_description')||hash.get('error_description')||query.get('error')||hash.get('error');
 return {returnedFromOAuth:hasAccess||hasRefresh||hasCode||!!error,hasAccessToken:hasAccess,hasRefreshToken:hasRefresh,hasAuthorizationCode:hasCode,error:error||null,urlOrigin:location.origin,urlPath:location.pathname};
}
function showDiagnostics(report,session,sessionError){
 const cloud=document.getElementById('cloudState')?.closest('article');if(!cloud)return;
 let box=document.getElementById('authDiagnostics');if(!box){box=document.createElement('div');box.id='authDiagnostics';box.style.cssText='margin-top:1rem;padding:1rem;border:1px solid rgba(255,255,255,.18);border-radius:14px;font-size:.9rem;white-space:pre-wrap;word-break:break-word';cloud.appendChild(box)}
 const lines=['AUTH DIAGNOSTICS',`OAuth return detected: ${report.returnedFromOAuth?'YES':'NO'}`,`Access token returned: ${report.hasAccessToken?'YES':'NO'}`,`Refresh token returned: ${report.hasRefreshToken?'YES':'NO'}`,`Authorization code returned: ${report.hasAuthorizationCode?'YES':'NO'}`,`Supabase session: ${session?'YES':'NO'}`,`Session user: ${session?.user?.email||'none'}`,`Callback error: ${report.error||'none'}`,`Session error: ${sessionError||'none'}`,`Return location: ${report.urlOrigin}${report.urlPath}`];
 box.textContent=lines.join('\n');
}
async function boot(){
 const callbackReport=safeCallbackReport();
 await loadSDK();
 client=window.supabase.createClient(SB,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'implicit'}});
 upgrade();
 client.auth.onAuthStateChange((event,session)=>{setTimeout(async()=>{await paint(session);if(event==='SIGNED_IN'&&session)await restoreCloudIfNeeded(session)},0)});
 const result=await client.auth.getSession(),session=result.data.session,error=result.error;
 if(callbackReport.returnedFromOAuth||error)showDiagnostics(callbackReport,session,error?.message||null);
 if(error)paintError(error.message);else{await paint(session);if(session)await restoreCloudIfNeeded(session)}
 readyResolve(client);
}
async function signIn(){
 const x=document.getElementById('cloudState');if(x)x.textContent='Opening Google sign-in…';
 const {data,error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:APP,scopes:'openid email profile'}});
 if(error){paintError(error.message);showDiagnostics({...safeCallbackReport(),error:error.message},null,error.message)}
 else if(data?.url){sessionStorage.setItem('lifeOSOAuthStarted','1')}
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
 const verify=await client.from('life_os_profiles').select('settings,updated_at').eq('user_id',session.user.id).maybeSingle();
 if(verify.error)return paintError('Upload completed, but verification failed: '+verify.error.message);
 const remote=verify.data?.settings?.life_os;
 if(!remote||typeof remote!=='object')return paintError('Upload completed, but the cloud copy could not be verified.');
 const localBytes=new Blob([JSON.stringify(snapshot)]).size,remoteBytes=new Blob([JSON.stringify(remote)]).size;
 const localEvents=Array.isArray(snapshot.events)?snapshot.events.length:0,remoteEvents=Array.isArray(remote.events)?remote.events.length:0;
 if(localBytes!==remoteBytes||localEvents!==remoteEvents)return paintError(`Cloud verification mismatch (local ${localBytes} B/${localEvents} events; cloud ${remoteBytes} B/${remoteEvents} events).`);
 localStorage.setItem('dreLifeOSCloudUser',session.user.id);if(x)x.textContent=`Cloud verified · ${session.user.email||'Google account'} · ${remoteBytes} B · ${remoteEvents} events · ${new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}`;
}
async function restoreCloudIfNeeded(session){
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
window.LifeAuth={signIn,signOut,syncNow,getClient:async()=>{await ready;return client},getSession:async()=>{await ready;return (await client.auth.getSession()).data.session},ready};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot):boot();
})();