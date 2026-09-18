// Publishing Metrics Bridge
// Life OS -> Supabase Edge Functions. Provider secrets/tokens stay server-side.
(function(){
  const SUPABASE_URL='https://alwtccdiyudsucfioahr.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY='sb_publishable_pNdJfnrcH6zTyroOTCzEgA_zL4M8K43';

  function getAccessToken(){
    try{
      const direct=localStorage.getItem('sb-access-token');
      if(direct) return direct;
      for(let i=0;i<localStorage.length;i++){
        const k=localStorage.key(i)||'';
        if(k.startsWith('sb-')&&k.endsWith('-auth-token')){
          const raw=localStorage.getItem(k); if(!raw) continue;
          const parsed=JSON.parse(raw);
          const token=parsed?.access_token||parsed?.currentSession?.access_token||parsed?.session?.access_token;
          if(token) return token;
        }
      }
    }catch(e){ console.warn('Could not read Supabase session',e); }
    return null;
  }

  async function callEdge(fn,body={}){
    const token=getAccessToken();
    if(!token) throw new Error('Life OS is not signed in. Sign in again, then retry.');
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),15000);
    try{
      const res=await fetch(`${SUPABASE_URL}/functions/v1/${fn}`,{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'apikey':SUPABASE_PUBLISHABLE_KEY,
          'Authorization':`Bearer ${token}`
        },
        body:JSON.stringify(body),
        signal:controller.signal
      });
      let data={};
      try{ data=await res.json(); }catch(_){ data={error:`HTTP ${res.status}`}; }
      if(!res.ok) throw new Error(data.error||data.message||`HTTP ${res.status}`);
      return data;
    }catch(e){
      if(e?.name==='AbortError') throw new Error('Instagram connection request timed out.');
      throw e;
    }finally{ clearTimeout(timer); }
  }

  async function instagram(action='status',extra={}){ return callEdge('instagram',{action,...extra}); }
  async function wordpress(action='status',extra={}){ return callEdge('wordpress',{action,...extra}); }

  window.PublishingMetricsBridge={
    instagram,
    wordpress,
    instagramStatus:()=>instagram('status'),
    instagramAuthorize:()=>instagram('authorize'),
    instagramSync:(instagram_account_id)=>instagram('sync',instagram_account_id?{instagram_account_id}:{}),
    instagramDisconnect:(instagram_account_id)=>instagram('disconnect',instagram_account_id?{instagram_account_id}:{}),
    wordpressStatus:()=>wordpress('status'),
    wordpressSync:()=>wordpress('sync')
  };
})();
