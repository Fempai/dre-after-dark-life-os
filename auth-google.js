/* Dre After Dark · Life OS — Google sign-in via Supabase Auth */
(()=>{
const SB='https://alwtccdiyudsucfioahr.supabase.co',KEY='sb_publishable_v1AZYAfBP6vA0nrxcWQI6g_sWFt5PYU',APP='https://fempai.github.io/dre-after-dark-life-os/';
let client;
async function boot(){
 if(!window.supabase){const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';await new Promise((r,j)=>{s.onload=r;s.onerror=j;document.head.appendChild(s)})}
 client=window.supabase.createClient(SB,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'}});
 upgrade();
 await finishOAuthCallback();
 await paint();
 client.auth.onAuthStateChange(()=>setTimeout(paint,0));
}
async function finishOAuthCallback(){
 const u=new URL(location.href), code=u.searchParams.get('code'), err=u.searchParams.get('error_description')||u.searchParams.get('error');
 if(err){paintError(decodeURIComponent(err));cleanURL();return}
 if(code){
   const {error}=await client.auth.exchangeCodeForSession(code);
   if(error){paintError(error.message);return}
   cleanURL();
 }
}
function cleanURL(){history.replaceState({},document.title,location.pathname+location.hash)}
async function signIn(){
 const x=document.getElementById('cloudState');if(x)x.textContent='Opening Google sign-in…';
 const {data,error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:APP,scopes:'openid email profile',skipBrowserRedirect:true}});
 if(error)return paintError(error.message);
 if(data?.url)location.assign(data.url);else paintError('Google did not return a sign-in URL.');
}
async function signOut(){await client.auth.signOut();await paint()}
function paintError(t){const x=document.getElementById('cloudState');if(x)x.textContent='Sign-in needs attention: '+t}
async function paint(){
 const {data:{session},error}=await client.auth.getSession();
 const x=document.getElementById('cloudState'),g=document.getElementById('googleLifeSignIn'),o=document.getElementById('googleLifeSignOut');
 if(error)return paintError(error.message);
 if(session){if(x)x.textContent=`Cloud identity connected · ${session.user.email||'Google account'}`;if(g)g.classList.add('hidden');if(o)o.classList.remove('hidden')}
 else{if(x)x.textContent='Sign in with Google to protect cloud data and persistent integrations.';if(g)g.classList.remove('hidden');if(o)o.classList.add('hidden')}
}
function upgrade(){
 const cloud=document.getElementById('cloudState')?.closest('article');if(!cloud||document.getElementById('googleLifeSignIn'))return;
 ['email','password','signup','signin','signout'].forEach(id=>{const e=document.getElementById(id);if(e)e.style.display='none'});
 const wrap=document.createElement('div');wrap.innerHTML=`<button id="googleLifeSignIn" class="primary" style="width:100%;margin:.75rem 0">G&nbsp;&nbsp; Continue with Google</button><button id="googleLifeSignOut" class="ghost hidden" style="width:100%;margin:.5rem 0">Sign out of Life OS</button><p class="quiet">Your Google password is never entered into or stored by Life OS.</p>`;
 cloud.insertBefore(wrap,document.getElementById('syncBtn'));document.getElementById('googleLifeSignIn').onclick=signIn;document.getElementById('googleLifeSignOut').onclick=signOut;
}
window.LifeAuth={signIn,signOut,getClient:()=>client};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot):boot();
})();