/* കഥക്കൂട് — web app (PWA). Data is kept on this device (IndexedDB) for now; Claude runs through /api on Vercel. */
(function(){
"use strict";
const app=document.getElementById('app'), toastEl=document.getElementById('toast');
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const CAST={
  mittu:{name:'മിട്ടു',what:'തത്ത',trait:'വാചാലൻ, തമാശക്കാരൻ. കഥ പറഞ്ഞുതുടങ്ങുന്നത് മിട്ടുവാണ്.',
    svg:'<svg viewBox="0 0 120 120"><path d="M38 84 L14 112 L46 98Z" fill="#1f8a4c"/><ellipse cx="62" cy="74" rx="30" ry="36" fill="#34b866"/><ellipse cx="70" cy="80" rx="15" ry="24" fill="#1f8a4c"/><circle cx="70" cy="36" r="24" fill="#3fca74"/><path d="M90 30 q22 6 6 24 q-10 -4 -10 -14z" fill="#e2483d"/><circle cx="76" cy="30" r="6" fill="#fff"/><circle cx="78" cy="30" r="3" fill="#1b2a30"/><path d="M52 110h8M66 110h8" stroke="#e08a1e" stroke-width="5" stroke-linecap="round" fill="none"/></svg>'},
  appu:{name:'അപ്പു',what:'ആനക്കുട്ടി',trait:'ശാന്തൻ, ദയയുള്ളവൻ. കൂട്ടുകാരെ സഹായിക്കും.',
    svg:'<svg viewBox="0 0 120 120"><ellipse cx="22" cy="52" rx="20" ry="28" fill="#7f97a8"/><ellipse cx="98" cy="52" rx="20" ry="28" fill="#7f97a8"/><ellipse cx="22" cy="54" rx="11" ry="18" fill="#e7b3b0"/><ellipse cx="98" cy="54" rx="11" ry="18" fill="#e7b3b0"/><circle cx="60" cy="54" r="36" fill="#9db2c1"/><path d="M52 70 q0 34 16 36 q12 0 10 -12 q-8 4 -8 -24z" fill="#8aa1b1"/><circle cx="46" cy="48" r="5" fill="#1b2a30"/><circle cx="74" cy="48" r="5" fill="#1b2a30"/><circle cx="47.500" cy="46.500" r="1.600" fill="#fff"/><circle cx="75.500" cy="46.500" r="1.600" fill="#fff"/></svg>'},
  meenu:{name:'മീനു',what:'9 വയസ്സുള്ള കുട്ടി',trait:'ജിജ്ഞാസു. എപ്പോഴും ചോദ്യങ്ങൾ ചോദിക്കും.',
    svg:'<svg viewBox="0 0 120 120"><path d="M30 116 q30 -52 60 0z" fill="#e2483d"/><path d="M26 44 q-10 30 -2 44" stroke="#22191a" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M94 44 q10 30 2 44" stroke="#22191a" stroke-width="9" stroke-linecap="round" fill="none"/><circle cx="60" cy="48" r="30" fill="#c98b5e"/><path d="M30 46 q4 -34 30 -32 q26 -2 30 32 q-16 -18 -30 -16 q-14 -2 -30 16z" fill="#22191a"/><circle cx="49" cy="52" r="4" fill="#1b2a30"/><circle cx="71" cy="52" r="4" fill="#1b2a30"/><path d="M50 64 q10 8 20 0" stroke="#7a2d22" stroke-width="3" stroke-linecap="round" fill="none"/><circle cx="24" cy="90" r="5" fill="#f0ac12"/><circle cx="96" cy="90" r="5" fill="#f0ac12"/></svg>'},
  kunjan:{name:'കുഞ്ഞൻ',what:'അണ്ണാൻ',trait:'കുസൃതിക്കാരൻ. തമാശയും അബദ്ധങ്ങളും കുഞ്ഞന്റെ വകയാണ്.',
    svg:'<svg viewBox="0 0 120 120"><path d="M78 108 q40 -10 26 -58 q-8 -26 -30 -14 q20 6 14 34 q-4 20 -22 26z" fill="#a8672f"/><ellipse cx="54" cy="82" rx="24" ry="30" fill="#c58142"/><ellipse cx="54" cy="88" rx="13" ry="19" fill="#f3dcbd"/><path d="M38 20l6 16h-12zM66 20l6 16h-12z" fill="#a8672f"/><circle cx="52" cy="44" r="22" fill="#c58142"/><path d="M44 24v20M52 22v22M60 24v20" stroke="#6f411b" stroke-width="3" fill="none"/><circle cx="44" cy="46" r="4" fill="#1b2a30"/><circle cx="62" cy="46" r="4" fill="#1b2a30"/><ellipse cx="53" cy="55" rx="4" ry="3" fill="#6f411b"/></svg>'}
};
const PLACES={forest:'കാട്',river:'പുഴ',school:'സ്കൂൾ',home:'വീട്',sky:'ആകാശം'};
const KINDS={story:'കഥ',poem:'കവിത',drawing:'ചിത്രം'};
const STEPS=['ഫോട്ടോ','എഴുത്ത്','രംഗങ്ങൾ','കാണുക','ബുക്ക്'];

const DEMO={id:'demo',demo:true,title:'തത്തയും മാമ്പഴവും',child:'അമ്മു',kind:'story',consent:true,hasPhoto:false,created:0,
  text:'ഒരു കാട്ടിൽ ഒരു തത്ത ഉണ്ടായിരുന്നു. ഒരു ദിവസം തത്തക്ക് നല്ല വിശപ്പായി. മാവിന്റെ മുകളിൽ ഒരു വലിയ മാമ്പഴം കണ്ടു. പക്ഷേ അത് വളരെ ഉയരത്തിലായിരുന്നു.\n\nഅപ്പോൾ ഒരു ആനക്കുട്ടി വന്നു. ആനക്കുട്ടി തുമ്പിക്കൈ കൊണ്ട് മരം കുലുക്കി. മാമ്പഴം താഴെ വീണു.\n\nതത്തയും ആനക്കുട്ടിയും മാമ്പഴം പങ്കിട്ടു തിന്നു. അവർ നല്ല കൂട്ടുകാരായി.',
  scenes:[
    {place:'forest',lines:[{who:'mittu',text:'എനിക്ക് നല്ല വിശപ്പായി! എന്തെങ്കിലും തിന്നാൻ കിട്ടിയെങ്കിൽ.'}]},
    {place:'forest',lines:[{who:'mittu',text:'അതാ, മാവിന്റെ മുകളിൽ ഒരു വലിയ മാമ്പഴം!'},{who:'mittu',text:'അയ്യോ, അത് വളരെ ഉയരത്തിലാണല്ലോ.'}]},
    {place:'river',lines:[{who:'appu',text:'എന്താ മിട്ടൂ, എന്തിനാ സങ്കടം?'},{who:'mittu',text:'ആ മാമ്പഴം എനിക്ക് എത്തുന്നില്ല.'}]},
    {place:'forest',lines:[{who:'appu',text:'ഞാൻ തുമ്പിക്കൈ കൊണ്ട് മരം കുലുക്കാം. ഒന്ന്, രണ്ട്, മൂന്ന്!'},{who:'kunjan',text:'ഠപ്പ്! മാമ്പഴം താഴെ വീണു!'}]},
    {place:'sky',lines:[{who:'mittu',text:'നമുക്ക് ഇത് പങ്കിട്ടു തിന്നാം.'},{who:'appu',text:'ഇനി നമ്മൾ നല്ല കൂട്ടുകാർ!'}]}
  ]};

/* ---------- cast: the four fixed characters + the teacher's own ---------- */
const MOTIONS={fly:'പറക്കൽ',hop:'ചാട്ടം',walk:'നടത്തം',swim:'നീന്തൽ',stand:'നിൽക്കൽ'};
const BUILTIN_MOTION={mittu:'fly',appu:'walk',meenu:'walk',kunjan:'hop'};
let customChars=[];
function castMap(){
  const m={};Object.keys(CAST).forEach(k=>{m[k]=Object.assign({motion:BUILTIN_MOTION[k]||'stand'},CAST[k])});
  customChars.forEach(c=>{m[c.id]={name:c.name,what:'ടീച്ചർ ചേർത്തത്',motion:MOTIONS[c.motion]?c.motion:'stand',custom:true,
    svg:'<img src="'+c.img+'" alt="'+esc(c.name)+'"'+(c.mirror?' style="transform:scaleX(-1)"':'')+'>'}});
  return m;
}
function isCast(k){return !!(CAST[k]||customChars.some(c=>c.id===k))}
function castOf(k){const m=castMap();return m[k]||m.mittu}

/* ---------- storage on this device (IndexedDB, with in-memory fallback) ---------- */
const store=(function(){
  let dbp=null; const mem={works:new Map(),photos:new Map(),chars:new Map()};
  function open(){
    if(dbp)return dbp;
    dbp=new Promise((res)=>{
      try{
        const rq=indexedDB.open('kathakkoodu',2);
        rq.onupgradeneeded=()=>{const d=rq.result;if(!d.objectStoreNames.contains('works'))d.createObjectStore('works',{keyPath:'id'});if(!d.objectStoreNames.contains('photos'))d.createObjectStore('photos');if(!d.objectStoreNames.contains('chars'))d.createObjectStore('chars',{keyPath:'id'})};
        rq.onsuccess=()=>res(rq.result);
        rq.onerror=()=>res(null);
        rq.onblocked=()=>res(null);
      }catch(e){res(null)}
    });
    return dbp;
  }
  function tx(name,mode,fn){
    return open().then(d=>{
      if(!d)return fn(null);
      return new Promise((res,rej)=>{const t=d.transaction(name,mode);const st=t.objectStore(name);let out;const r=fn(st);
        if(r&&'onsuccess' in r){r.onsuccess=()=>{out=r.result}}
        t.oncomplete=()=>res(out);t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error)});
    });
  }
  return {
    persistent:()=>open().then(d=>!!d),
    list:()=>tx('works','readonly',st=>st?st.getAll():null).then(r=>r||[...mem.works.values()]),
    put:w=>tx('works','readwrite',st=>st?st.put(w):(mem.works.set(w.id,w),null)),
    del:id=>tx('works','readwrite',st=>st?st.delete(id):(mem.works.delete(id),null)).then(()=>tx('photos','readwrite',st=>st?st.delete(id):(mem.photos.delete(id),null))),
    putPhoto:(id,d)=>tx('photos','readwrite',st=>st?st.put(d,id):(mem.photos.set(id,d),null)),
    getPhoto:id=>tx('photos','readonly',st=>st?st.get(id):null).then(r=>r||mem.photos.get(id)||null),
    clist:()=>tx('chars','readonly',st=>st?st.getAll():null).then(r=>r||[...mem.chars.values()]),
    cput:c=>tx('chars','readwrite',st=>st?st.put(c):(mem.chars.set(c.id,c),null)),
    cdel:id=>tx('chars','readwrite',st=>st?st.delete(id):(mem.chars.delete(id),null))
  };
})();

/* ---------- Claude through the server ---------- */
let aiOn=false, needCode=false;
function getCode(){try{return localStorage.getItem('classCode')||''}catch(e){return ''}}
function setCode(v){try{if(v)localStorage.setItem('classCode',v);else localStorage.removeItem('classCode')}catch(e){}}
async function api(path,body){
  const h={'content-type':'application/json'};const c=getCode();if(c)h['x-class-code']=c;
  let r;try{r=await fetch('/api/'+path,{method:'POST',headers:h,body:JSON.stringify(body)})}catch(e){throw {code:'offline'}}
  const j=await r.json().catch(()=>({}));
  if(!r.ok)throw {code:j.error||('http_'+r.status)};
  return j;
}

let persistent=true;

/* ---------- cloud (Supabase) + data layer ----------
   Not logged in: works stay on this device only.
   Logged in: every change is written on the device first (so nothing is lost without internet),
   marked _dirty, then sent to Supabase. Anything still _dirty is sent again when the net comes back. */
let sb=null, sbConfigured=false, user=null, syncing=false, pendingCount=0;
const SB_LIB='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const photoPath=id=>user.id+'/'+id+'.jpg';
function toRow(w){return {id:w.id,title:w.title,child:w.child,kind:w.kind,consent:!!w.consent,text:w.text||'',scenes:w.scenes||[],has_photo:!!w.hasPhoto,created:w.created||Date.now(),updated:w.updated||Date.now()}}
function fromRow(r){return {id:r.id,title:r.title,child:r.child,kind:r.kind,consent:r.consent,text:r.text||'',scenes:Array.isArray(r.scenes)?r.scenes:[],hasPhoto:!!r.has_photo,created:Number(r.created)||0,updated:Number(r.updated)||0}}
function dataUrlToBlob(d){const p=d.split(','),mime=(/data:([^;]+)/.exec(p[0])||[])[1]||'image/jpeg',bin=atob(p[1]),a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return new Blob([a],{type:mime})}
function blobToDataUrl(b){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(b)})}
const mine=w=>user?w._owner===user.id:!w._owner;
const clean0=w=>{const o={};for(const k in w)if(k[0]!=='_')o[k]=w[k];return o};

const data={
  async list(){
    const local=(await store.list()).filter(mine);
    if(!user)return local;
    try{
      const {data:rows,error}=await sb.from('works').select('*').order('created',{ascending:false});
      if(error)throw error;
      const byId=new Map(rows.map(r=>[r.id,fromRow(r)]));
      // keep local edits that have not reached the cloud yet
      local.forEach(w=>{if(w._dirty&&(!byId.has(w.id)||(w.updated||0)>=(byId.get(w.id).updated||0)))byId.set(w.id,clean0(w))});
      // refresh the device copy; drop device copies deleted elsewhere
      const cloudIds=new Set(rows.map(r=>r.id));
      for(const w of local){if(!w._dirty&&!cloudIds.has(w.id))await store.del(w.id)}
      for(const r of rows){const lw=local.find(x=>x.id===r.id);if(!lw||!lw._dirty)await store.put(Object.assign(fromRow(r),{_owner:user.id,_photoDirty:lw&&lw._photoDirty}))}
      return [...byId.values()];
    }catch(e){return local.map(clean0)}
  },
  async put(w){
    const prev=(await store.list()).find(x=>x.id===w.id)||{};
    await store.put(Object.assign({},w,{_owner:user?user.id:undefined,_dirty:!!user,_photoDirty:prev._photoDirty}));
    if(user)return sync();
  },
  async del(id){
    await store.del(id);
    if(user){
      const {error}=await sb.from('works').delete().eq('id',id);if(error)throw error;
      await sb.storage.from('photos').remove([photoPath(id)]);
    }
  },
  async putPhoto(id,d){
    await store.putPhoto(id,d);
    if(user){const all=await store.list();const w=all.find(x=>x.id===id);if(w){w._photoDirty=true;await store.put(w)}return sync()}
  },
  async getPhoto(id){
    const d=await store.getPhoto(id);if(d||!user)return d;
    const {data:blob,error}=await sb.storage.from('photos').download(photoPath(id));
    if(error||!blob)return null;
    const url=await blobToDataUrl(blob);await store.putPhoto(id,url);return url;
  }
};
function toCRow(c){return {id:c.id,name:c.name,motion:c.motion,mirror:!!c.mirror,img:c.img,created:c.created||Date.now(),updated:c.updated||Date.now()}}
function fromCRow(r){return {id:r.id,name:r.name,motion:r.motion,mirror:!!r.mirror,img:r.img,created:Number(r.created)||0,updated:Number(r.updated)||0}}
const charData={
  async list(){
    const local=(await store.clist()).filter(mine);
    if(!user)return local;
    try{
      const {data:rows,error}=await sb.from('characters').select('*').order('created',{ascending:true});if(error)throw error;
      const byId=new Map(rows.map(r=>[r.id,fromCRow(r)]));
      local.forEach(c=>{if(c._dirty&&(!byId.has(c.id)||(c.updated||0)>=(byId.get(c.id).updated||0)))byId.set(c.id,clean0(c))});
      const ids=new Set(rows.map(r=>r.id));
      for(const c of local)if(!c._dirty&&!ids.has(c.id))await store.cdel(c.id);
      for(const r of rows){const lc=local.find(x=>x.id===r.id);if(!lc||!lc._dirty)await store.cput(Object.assign(fromCRow(r),{_owner:user.id}))}
      return [...byId.values()];
    }catch(e){return local.map(clean0)}
  },
  async put(c){await store.cput(Object.assign({},clean0(c),{_owner:user?user.id:undefined,_dirty:!!user}));if(user)return sync()},
  async del(id){await store.cdel(id);if(user){const {error}=await sb.from('characters').delete().eq('id',id);if(error)throw error}}
};
async function sync(){
  if(!user||syncing)return;syncing=true;
  try{
    for(const c of (await store.clist()).filter(c=>c._owner===user.id&&c._dirty)){
      const {error}=await sb.from('characters').upsert(toCRow(c));if(error)throw error;
      const now=(await store.clist()).find(x=>x.id===c.id);if(now&&(now.updated||0)<=(c.updated||0))await store.cput(Object.assign(now,{_dirty:false}));
    }
    const todo=(await store.list()).filter(w=>w._owner===user.id&&(w._dirty||w._photoDirty));
    for(const w of todo){
      if(w._photoDirty){
        const d=await store.getPhoto(w.id);
        if(d){const {error}=await sb.storage.from('photos').upload(photoPath(w.id),dataUrlToBlob(d),{upsert:true,contentType:'image/jpeg'});if(error)throw error}
        w._photoDirty=false;
      }
      if(w._dirty){const {error}=await sb.from('works').upsert(toRow(w));if(error)throw error;w._dirty=false}
      // only clear the flags if nothing newer was saved meanwhile
      const now=(await store.list()).find(x=>x.id===w.id);
      if(now&&(now.updated||0)<=(w.updated||0))await store.put(Object.assign(now,{_dirty:w._dirty&&now._dirty,_photoDirty:now._photoDirty&&w._photoDirty}));
    }
  }catch(e){syncing=false;await countPending();throw e}
  syncing=false;await countPending();
}
async function countPending(){
  const before=pendingCount;
  pendingCount=user?(await store.list()).filter(w=>w._owner===user.id&&(w._dirty||w._photoDirty)).length+(await store.clist()).filter(c=>c._owner===user.id&&c._dirty).length:0;
  if(before!==pendingCount&&route()==='shelf')render();
}
async function guestWorks(){return (await store.list()).filter(w=>!w._owner)}
async function guestChars(){return (await store.clist()).filter(c=>!c._owner)}
async function moveGuestWorks(){
  if(!user)return;const g=await guestWorks();
  for(const w of g){w._owner=user.id;w._dirty=true;w._photoDirty=!!w.hasPhoto;w.updated=Date.now();await store.put(w)}
  for(const c of await guestChars()){c._owner=user.id;c._dirty=true;c.updated=Date.now();await store.cput(c)}
  try{await sync();toast(g.length+' സൃഷ്ടികൾ അക്കൗണ്ടിലേക്ക് മാറ്റി')}catch(e){toast('നെറ്റ് വന്നാൽ തനിയെ അപ്‌ലോഡ് ആകും',true)}
  await reloadWorks();
}
async function reloadWorks(){
  try{works=(await data.list()).sort((a,b)=>(b.created||0)-(a.created||0))}catch(e){}
  try{customChars=(await charData.list()).sort((a,b)=>(a.created||0)-(b.created||0))}catch(e){}
  guestCount=user?(await guestWorks()).length+(await guestChars()).length:0;
  if(route()==='cast')render();
  await countPending();
  if(route()==='shelf')render();
}
let guestCount=0, authMsg='', authBusy=false, recovering=false, authEmail='';
async function initCloud(cfg){
  if(!cfg.supabaseUrl||!cfg.supabaseKey)return;
  sbConfigured=true;
  try{
    const mod=await import(SB_LIB);
    sb=mod.createClient(cfg.supabaseUrl,cfg.supabaseKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  }catch(e){sb=null;return}
  sb.auth.onAuthStateChange((ev,session)=>{
    const was=user&&user.id;user=session?session.user:null;
    if(ev==='PASSWORD_RECOVERY'){recovering=true;go('login');return}
    if((user&&user.id)!==was){cur=null;reloadWorks().then(()=>user&&sync().catch(()=>{}));if(route()==='login'&&user&&!recovering)go('shelf');else render()}
  });
  const {data:s}=await sb.auth.getSession();user=s&&s.session?s.session.user:null;
  await reloadWorks();
  if(user)sync().catch(()=>{});
  window.addEventListener('online',()=>{if(user)sync().then(()=>toast('എല്ലാം അപ്‌ലോഡ് ആയി')).catch(()=>{})});
}

let works=[], cur=null, step=0, play={s:0,l:0,on:false,timer:null}, bookPage=0, busy='', confirmDel=false, loaded=false, installEvt=null, confirmRedo=false;
let chain=Promise.resolve();

function toast(msg,bad){toastEl.textContent=msg;toastEl.className=bad?'bad':'';toastEl.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>{toastEl.hidden=true},2600)}
function route(){const h=(location.hash||'#shelf').slice(1);return ['shelf','new','work','cast','plan','login'].includes(h)?h:'shelf'}
function go(h){if(location.hash==='#'+h)render();else location.hash=h}
function stopPlay(){clearTimeout(play.timer);play.on=false;try{window.speechSynthesis&&speechSynthesis.cancel()}catch(e){}}
function doneSteps(w){return [!!w.hasPhoto,!!(w.text&&w.text.trim()),!!(w.scenes&&w.scenes.length)]}

function persist(quiet){
  if(!cur||cur.demo)return;
  const body={id:cur.id,title:cur.title,child:cur.child,kind:cur.kind,consent:!!cur.consent,text:cur.text||'',scenes:cur.scenes||[],hasPhoto:!!cur.hasPhoto,created:cur.created,updated:Date.now()};
  const i=works.findIndex(w=>w.id===body.id);if(i>=0)works[i]=body;else works.unshift(body);
  chain=chain.then(()=>data.put(body)).then(()=>{if(!quiet)toast('സേവ് ചെയ്തു')},()=>{if(user)toast('ഫോണിൽ സേവ് ചെയ്തു. നെറ്റ് വന്നാൽ അപ്‌ലോഡ് ആകും.');else toast('സേവ് ചെയ്യാനായില്ല',true)});
}
let typingTimer=null;
function persistSoon(){clearTimeout(typingTimer);typingTimer=setTimeout(()=>persist(true),800)}

/* ---------- views ---------- */
function boardHTML(){
  const n=works.length, ready=works.filter(w=>w.scenes&&w.scenes.length).length;
  return '<header class="board"><h1>കഥക്കൂട്</h1>'+(installEvt?'<button class="install" data-act="install">ഫോണിൽ ചേർക്കുക</button>':'')+'<p>നാലാം ക്ലാസ്സിലെ കുട്ടികളുടെ കഥയും കവിതയും ചിത്രവും സംസാരിക്കുന്ന വീഡിയോയും പുസ്തകവും ആകുന്ന ഇടം.</p>'+
    '<div class="stats"><span><b>'+n+'</b>സൃഷ്ടികൾ</span><span><b>'+ready+'</b>കാണാൻ തയ്യാർ</span></div><span class="chalk" aria-hidden="true"></span></header>';
}
function workCard(w){
  const d=doneSteps(w);
  return '<button class="page work" data-act="open" data-id="'+esc(w.id)+'"><span class="top"><h3>'+esc(w.title||'പേരില്ലാത്ത സൃഷ്ടി')+'</h3>'+
    '<span class="row" style="gap:6px"><span class="chip">'+esc(KINDS[w.kind]||'കഥ')+'</span>'+(w.demo?'<span class="chip demo">ഉദാഹരണം</span>':'')+'</span></span>'+
    '<span class="muted small">എഴുതിയത്: '+esc(w.child||'—')+'</span>'+
    '<span class="steps3"><span class="'+(d[0]?'done':'')+'">ഫോട്ടോ</span><span class="'+(d[1]?'done':'')+'">എഴുത്ത്</span><span class="'+(d[2]?'done':'')+'">രംഗങ്ങൾ</span></span></button>';
}
function accountStrip(){
  if(!loaded)return '';
  if(!sbConfigured) return works.length?'<p class="muted small">സൃഷ്ടികൾ ഈ ഫോണിൽ/കമ്പ്യൂട്ടറിൽ മാത്രമാണ് സൂക്ഷിക്കുന്നത്.</p>':'';
  if(!sb) return '<p class="note bad">ക്ലൗഡുമായി ബന്ധപ്പെടാനായില്ല (നെറ്റ് ഇല്ല?). ഇപ്പോൾ ഈ ഫോണിൽ സേവ് ആകും.</p>';
  if(!user) return '<div class="plain row between"><span class="small">ലോഗിൻ ചെയ്താൽ സൃഷ്ടികൾ ഏത് ഫോണിലും കമ്പ്യൂട്ടറിലും കാണാം.</span><a class="btn ghost" href="#login" style="text-decoration:none">ടീച്ചർ ലോഗിൻ</a></div>';
  let h='<div class="plain form"><div class="row between"><span class="small">ലോഗിൻ: <b>'+esc(user.email||'')+'</b></span><button class="btn ghost" data-act="logout">ലോഗൗട്ട്</button></div>';
  if(pendingCount) h+='<p class="small" style="color:var(--warn)">'+pendingCount+' സൃഷ്ടി ഇനിയും അപ്‌ലോഡ് ആകാനുണ്ട്. നെറ്റ് വന്നാൽ തനിയെ ആകും. <button class="btn ghost" data-act="syncNow" style="padding:4px 10px;font-size:.85rem">ഇപ്പോൾ ശ്രമിക്കുക</button></p>';
  if(guestCount) h+='<div class="row between"><span class="small">ലോഗിൻ ചെയ്യുന്നതിന് മുമ്പ് ഈ ഫോണിൽ ചേർത്ത '+guestCount+' സൃഷ്ടി ഉണ്ട്.</span><button class="btn" data-act="moveGuest">അക്കൗണ്ടിലേക്ക് മാറ്റുക</button></div>';
  return h+'</div>';
}
function loginView(){
  if(!sbConfigured) return '<h2>ടീച്ചർ ലോഗിൻ</h2><p class="note">ക്ലൗഡ് സേവ് ഇതുവരെ സജ്ജമാക്കിയിട്ടില്ല. README-യിലെ Supabase ഘട്ടങ്ങൾ നോക്കുക.</p>';
  if(!sb) return '<h2>ടീച്ചർ ലോഗിൻ</h2><p class="note bad">ലോഗിന് നെറ്റ് വേണം. നെറ്റ് വന്ന ശേഷം പേജ് വീണ്ടും തുറക്കുക.</p>';
  if(recovering) return '<h2>പുതിയ പാസ്‌വേഡ്</h2><form class="form plain" id="newPassForm"><div class="field"><label for="np">പുതിയ പാസ്‌വേഡ് (കുറഞ്ഞത് 8 അക്ഷരം)</label><input type="password" id="np" minlength="8" autocomplete="new-password" required></div><div class="row"><button class="btn" type="submit"'+(authBusy?' disabled':'')+'>സേവ് ചെയ്യുക</button></div>'+(authMsg?'<p class="note">'+esc(authMsg)+'</p>':'')+'</form>';
  if(user) return '<h2>ടീച്ചർ ലോഗിൻ</h2><div class="plain form"><p>ലോഗിൻ ചെയ്തിരിക്കുന്നു: <b>'+esc(user.email||'')+'</b></p><div class="row"><a class="btn" href="#shelf" style="text-decoration:none">ഷെൽഫിലേക്ക്</a><button class="btn ghost" data-act="logout">ലോഗൗട്ട്</button></div></div>';
  return '<h2>ടീച്ചർ ലോഗിൻ</h2><form class="form plain" id="loginForm">'+
    '<div class="field"><label for="le">ഇമെയിൽ</label><input type="email" id="le" autocomplete="email" inputmode="email" required value="'+esc(authEmail)+'"></div>'+
    '<div class="field"><label for="lp">പാസ്‌വേഡ് (കുറഞ്ഞത് 8 അക്ഷരം)</label><input type="password" id="lp" minlength="8" autocomplete="current-password" required></div>'+
    '<div class="row"><button class="btn" type="submit" data-mode="in"'+(authBusy?' disabled':'')+'>ലോഗിൻ</button><button class="btn ghost" type="submit" data-mode="up"'+(authBusy?' disabled':'')+'>പുതിയ അക്കൗണ്ട്</button></div>'+
    '<button class="btn ghost" type="button" data-act="forgot" style="align-self:flex-start;font-size:.9rem">പാസ്‌വേഡ് മറന്നോ?</button>'+
    (authMsg?'<p class="note">'+esc(authMsg)+'</p>':'')+
    '<p class="muted small">ഓരോ ടീച്ചർക്കും സ്വന്തം അക്കൗണ്ട്. ഒരു ടീച്ചറുടെ സൃഷ്ടികൾ മറ്റാർക്കും കാണാനാവില്ല.</p></form>';
}
function authErr(e){const m=(e&&e.message)||'';
  if(/invalid login/i.test(m))return 'ഇമെയിലോ പാസ്‌വേഡോ ശരിയല്ല.';
  if(/not confirmed/i.test(m))return 'ഇമെയിൽ ഇതുവരെ ഉറപ്പിച്ചിട്ടില്ല. ഇൻബോക്സിൽ വന്ന ലിങ്ക് അമർത്തുക.';
  if(/already registered|already exists/i.test(m))return 'ഈ ഇമെയിലിൽ അക്കൗണ്ട് ഉണ്ട്. ലോഗിൻ ചെയ്യുക.';
  if(/password/i.test(m))return 'പാസ്‌വേഡ് കുറഞ്ഞത് 8 അക്ഷരം വേണം.';
  if(/rate|too many/i.test(m))return 'കുറച്ച് കഴിഞ്ഞ് വീണ്ടും ശ്രമിക്കുക.';
  if(/fetch|network/i.test(m))return 'നെറ്റ് കണക്ഷൻ ഇല്ല.';
  return 'നടന്നില്ല: '+m;
}
function shelfView(){
  let h=boardHTML()+'<div class="row between"><h2>ക്ലാസ് ഷെൽഫ്</h2><a class="btn" href="#new" style="text-decoration:none">പുതിയ സൃഷ്ടി</a></div>';
  if(loaded&&!persistent) h+='<p class="note bad">ഈ ബ്രൗസറിൽ സൃഷ്ടികൾ സൂക്ഷിക്കാനാവില്ല (ഉദാ: private mode). പേജ് അടച്ചാൽ ഇവ നഷ്ടമാകും.</p>';
  h+=accountStrip();
  h+='<div class="list">';
  if(works.length) h+=works.map(workCard).join('');
  else h+='<p class="note">'+(loaded?'ഇതുവരെ സൃഷ്ടികളൊന്നും ചേർത്തിട്ടില്ല. ':'ഷെൽഫ് തുറക്കുന്നു… ')+'ആദ്യത്തേത് ചേർക്കാൻ "പുതിയ സൃഷ്ടി" അമർത്തുക. ആപ്പ് എങ്ങനെ പ്രവർത്തിക്കുന്നു എന്ന് കാണാൻ താഴെയുള്ള ഉദാഹരണം തുറന്നുനോക്കാം.</p>'+workCard(DEMO);
  return h+'</div>';
}
function newView(){
  return '<h2>പുതിയ സൃഷ്ടി</h2><form class="form plain" id="newForm">'+
    '<div class="field"><label for="nTitle">സൃഷ്ടിയുടെ പേര്</label><input type="text" id="nTitle" maxlength="80" placeholder="ഉദാ: എന്റെ പൂച്ചക്കുട്ടി" required></div>'+
    '<div class="field"><label for="nChild">കുട്ടിയുടെ ആദ്യപേര് മാത്രം</label><input type="text" id="nChild" maxlength="30" placeholder="ഉദാ: അമ്മു" required></div>'+
    '<div class="field"><label for="nKind">ഇനം</label><select id="nKind"><option value="story">കഥ</option><option value="poem">കവിത</option><option value="drawing">ചിത്രം</option></select></div>'+
    '<label class="check" for="nConsent"><input type="checkbox" id="nConsent"><span>രക്ഷിതാവ് ഒപ്പിട്ട സമ്മതപത്രം കിട്ടിയിട്ടുണ്ട്</span></label>'+
    '<p class="muted small">മുഴുവൻ പേരോ കുട്ടിയുടെ മുഖമുള്ള ഫോട്ടോയോ ചേർക്കരുത്. സമ്മതപത്രം ഇല്ലാതെ സൃഷ്ടി ചേർക്കാനാവില്ല.</p>'+
    '<div class="row"><button class="btn" type="submit">ചേർക്കുക</button><a class="btn ghost" href="#shelf" style="text-decoration:none">വേണ്ട</a></div></form>';
}
function castSel(v,i,j){const m=castMap();if(!m[v])v='mittu';return '<select data-f="who" data-s="'+i+'" data-l="'+j+'" aria-label="ആര് പറയുന്നു">'+Object.keys(m).map(k=>'<option value="'+esc(k)+'"'+(k===v?' selected':'')+'>'+esc(m[k].name)+'</option>').join('')+'</select>'}
function codeBox(){
  if(!needCode||getCode())return '';
  return '<div class="codebox"><div class="field"><label for="codeIn">ക്ലാസ് കോഡ്</label><input type="text" id="codeIn" autocomplete="off" placeholder="സ്കൂൾ തന്ന കോഡ്"></div><button class="btn ghost" data-act="saveCode">ശരി</button></div><p class="muted small">Claude ഉപയോഗിക്കാൻ ഒരിക്കൽ കോഡ് നൽകണം.</p>';
}
function stepHTML(){
  const w=cur;
  if(step===0){
    return '<div class="plain form">'+(w.photo?'<img class="photo" id="photoImg" alt="സൃഷ്ടിയുടെ ഫോട്ടോ" src="'+w.photo+'">':
      (w.hasPhoto?'<p class="muted" id="photoWait">ഫോട്ടോ തുറക്കുന്നു…</p>':'<div class="drop"><p>പേപ്പർ നേരെ വെച്ച്, നല്ല വെളിച്ചത്തിൽ, നിഴൽ വീഴാതെ ഫോട്ടോ എടുക്കുക.</p></div>'))+
      (w.demo?'<p class="note">ഉദാഹരണത്തിന് ഫോട്ടോ ഇല്ല. സ്വന്തം സൃഷ്ടി ചേർത്താൽ ഇവിടെ ഫോട്ടോ ഇടാം.</p>':
      '<div class="pickrow"><label class="btn pick">'+(w.hasPhoto?'വീണ്ടും ഫോട്ടോ എടുക്കുക':'ക്യാമറ തുറക്കുക')+'<input type="file" class="photoIn" accept="image/*" capture="environment"></label>'+
      '<label class="btn ghost pick">ഗാലറിയിൽ നിന്ന്<input type="file" class="photoIn" accept="image/*"></label></div>')+
      '<div class="row"><button class="btn ghost" data-act="step" data-n="1">അടുത്തത്: എഴുത്ത്</button></div></div>';
  }
  if(step===1){
    const canRead=aiOn&&w.photo&&!w.demo;
    return '<div class="plain form"><div class="field"><label for="txt">കുട്ടി എഴുതിയത് (വാക്കുകൾ മാറ്റരുത്, അക്ഷരത്തെറ്റ് മാത്രം തിരുത്താം)</label>'+
      '<textarea class="ruled" id="txt" data-f="text" placeholder="ഇവിടെ ടൈപ്പ് ചെയ്യാം, അല്ലെങ്കിൽ മൈക്ക് അമർത്തി വായിച്ചുകൊടുക്കാം"'+(w.demo?' readonly':'')+'>'+esc(w.text||'')+'</textarea></div>'+
      (w.demo?'':'<div class="row">'+micBtn('txt',true)+'</div><p class="muted small">'+(SR?'മൈക്ക് അമർത്തി കുട്ടിയുടെ കഥ ഉറക്കെ വായിക്കുക. ഒരു ഭാഗം കഴിഞ്ഞാൽ Enter അമർത്തി പുതിയ ഖണ്ഡിക തുടങ്ങാം. കേട്ടെഴുതിയതിൽ തെറ്റുണ്ടെങ്കിൽ ടൈപ്പ് ചെയ്ത് തിരുത്താം.':
        'ഈ ബ്രൗസറിൽ വോയിസ് ബട്ടൺ പ്രവർത്തിക്കില്ല. ഫോണിലെ കീബോർഡിലെ മൈക്ക് (Gboard-ൽ മലയാളം) ഉപയോഗിച്ച് പറഞ്ഞ് എഴുതാം, അല്ലെങ്കിൽ Chrome-ൽ തുറക്കുക.')+'</p>')+
      (canRead?codeBox()+'<div class="row"><button class="btn ghost" data-act="ocr"'+(busy?' disabled':'')+'>'+(busy==='ocr'?'വായിക്കുന്നു…':'ഫോട്ടോയിൽ നിന്ന് Claude വായിക്കട്ടെ')+'</button></div>':'')+
      '<div class="row"><button class="btn ghost" data-act="step" data-n="2">അടുത്തത്: രംഗങ്ങൾ</button></div></div>';
  }
  if(step===2){
    let h='<div class="form">';
    const has=(w.scenes&&w.scenes.length), txt=(w.text||'').trim();
    if(!w.demo){
      h+='<div class="plain form"><h3>രംഗ സഹായി</h3><p>കഥയിലെ വാചകങ്ങൾ 4–6 രംഗങ്ങളായി തിരിച്ച്, സ്ഥലവും ആര് പറയണമെന്നും ഊഹിച്ചുവെക്കും. കുട്ടിയുടെ വാക്കുകൾ മാറില്ല. പിന്നെ ടീച്ചർക്ക് താഴെ തിരുത്താം.</p>'+
        (confirmRedo?'<div class="row"><button class="btn danger" data-act="autoYes">ഇപ്പോഴുള്ള രംഗങ്ങൾ മാറ്റിയെഴുതുക</button><button class="btn ghost" data-act="autoNo">വേണ്ട</button></div>':
        '<div class="row"><button class="btn" data-act="auto"'+(!txt?' disabled':'')+'>'+(has?'വീണ്ടും തനിയെ ഒരുക്കുക':'രംഗങ്ങൾ തനിയെ ഒരുക്കുക')+'</button>'+
        (aiOn?'<button class="btn ghost" data-act="scenes"'+((busy||!txt)?' disabled':'')+'>'+(busy==='scenes'?'Claude ഒരുക്കുന്നു…':'Claude ഒരുക്കട്ടെ')+'</button>':'')+'</div>')+
        (aiOn?codeBox():'')+
        (!txt?'<p class="muted small">ആദ്യം "എഴുത്ത്" ഘട്ടത്തിൽ കഥ ചേർക്കുക.</p>':'')+
        '<details class="tips"><summary>രംഗങ്ങൾ ഒരുക്കാൻ ചില നുറുങ്ങുകൾ</summary><ul class="tight">'+
        '<li>സ്ഥലമോ സമയമോ സംഭവമോ മാറുമ്പോൾ പുതിയ രംഗം തുടങ്ങുക.</li>'+
        '<li>ഓരോ രംഗത്തിലും 1–3 ചെറിയ വരി മതി. നീണ്ട വാചകം രണ്ടായി മുറിക്കാം.</li>'+
        '<li>കഥ പറയുന്നത് മിട്ടു (തത്ത). കഥയിലെ മൃഗമോ കുട്ടിയോ സംസാരിക്കുന്ന ഇടത്ത് അപ്പു, മീനു, കുഞ്ഞൻ എന്നിവരെ തിരഞ്ഞെടുക്കുക.</li>'+
        '<li>കുട്ടിയുടെ സ്വന്തം വാക്കുകൾ തന്നെ ഉപയോഗിക്കുക; പുതിയ സംഭവങ്ങളോ ഗുണപാഠമോ ചേർക്കേണ്ട.</li>'+
        '<li>കുട്ടിയോട് ചോദിക്കാം: "ഇവിടെ ആന എന്തായിരിക്കും പറഞ്ഞത്?" ആ മറുപടി ഒരു വരിയാക്കാം.</li>'+
        '<li>ഓരോ വരിയുടെയും അടുത്തുള്ള മൈക്ക് അമർത്തി പറഞ്ഞും എഴുതാം.</li></ul></details></div>';
    }
    (w.scenes||[]).forEach((sc,i)=>{
      h+='<div class="page scene"><div class="row between"><h3>രംഗം '+(i+1)+'</h3><span class="row"><select data-f="place" data-s="'+i+'" aria-label="സ്ഥലം" style="width:auto">'+Object.keys(PLACES).map(k=>'<option value="'+k+'"'+(k===sc.place?' selected':'')+'>'+PLACES[k]+'</option>').join('')+'</select><button class="x" data-act="delScene" data-s="'+i+'" aria-label="രംഗം കളയുക">×</button></span></div>';
      sc.lines.forEach((ln,j)=>{h+='<div class="line">'+castSel(ln.who,i,j)+'<textarea id="ln-'+i+'-'+j+'" data-f="line" data-s="'+i+'" data-l="'+j+'" aria-label="സംഭാഷണം">'+esc(ln.text)+'</textarea>'+micBtn('ln-'+i+'-'+j,false)+'<button class="x" data-act="delLine" data-s="'+i+'" data-l="'+j+'" aria-label="വരി കളയുക">×</button></div>'});
      h+='<div class="row"><button class="btn ghost" data-act="addLine" data-s="'+i+'">വരി ചേർക്കുക</button></div></div>';
    });
    h+='<div class="row"><button class="btn ghost" data-act="addScene">ഒരു രംഗം ചേർക്കുക</button>'+((w.scenes&&w.scenes.length)?'<button class="btn" data-act="step" data-n="3">വീഡിയോ ആയി കാണുക</button>':'')+'</div></div>';
    return h;
  }
  if(step===3){
    if(!(w.scenes&&w.scenes.length)) return '<p class="note">കാണാൻ രംഗങ്ങൾ വേണം. "രംഗങ്ങൾ" ഘട്ടത്തിൽ അവ ഉണ്ടാക്കുക.</p>';
    return '<div class="form"><div id="stageBox"></div><div class="row" style="justify-content:center"><button class="btn ghost" data-act="prev">മുമ്പത്തേത്</button><button class="btn" data-act="play" id="playBtn">പ്ലേ</button><button class="btn ghost" data-act="next">അടുത്തത്</button></div><div class="dots" id="dots"></div><p class="muted small" style="text-align:center">ഇപ്പോൾ ആപ്പിനുള്ളിൽ കാണാം. കുട്ടിയുടെ ശബ്ദവും MP4 ഡൗൺലോഡും അടുത്ത പതിപ്പിലാണ്.</p></div>';
  }
  const pages=bookPages(); bookPage=Math.min(bookPage,pages.length-1);
  return '<div class="form">'+pages[bookPage]+'<div class="row between"><button class="btn ghost" data-act="bprev"'+(bookPage===0?' disabled':'')+'>മുൻ പേജ്</button><span class="muted small" style="font-variant-numeric:tabular-nums">'+(bookPage+1)+' / '+pages.length+'</span><button class="btn ghost" data-act="bnext"'+(bookPage>=pages.length-1?' disabled':'')+'>അടുത്ത പേജ്</button></div></div>';
}
function bookPages(){
  const w=cur, p=[];
  p.push('<div class="book cover"><p>'+esc(KINDS[w.kind]||'കഥ')+'</p><h2>'+esc(w.title)+'</h2><p>എഴുതിയത്: '+esc(w.child)+'</p><p class="small">ക്ലാസ് 4</p></div>');
  if(w.photo) p.push('<div class="book"><p class="muted small">കുട്ടിയുടെ സ്വന്തം കൈയക്ഷരത്തിൽ</p><img alt="സൃഷ്ടിയുടെ ഫോട്ടോ" src="'+w.photo+'"></div>');
  const paras=(w.text||'').split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean);
  if(!paras.length) p.push('<div class="book"><p class="muted">എഴുത്ത് ചേർത്താൽ ഇവിടെ പേജുകളായി കാണാം.</p></div>');
  paras.forEach((t,i)=>{
    const sc=(w.scenes||[])[Math.min(i,(w.scenes||[]).length-1)];
    const who=sc&&sc.lines[0]?castOf(sc.lines[0].who):null;
    p.push('<div class="book">'+(sc?'<div class="stage '+esc(sc.place)+'" style="aspect-ratio:16/8;flex:none">'+(who?'<div class="actor m-still" style="width:22%"><div class="body">'+who.svg+'</div></div>':'')+'</div>':'')+'<div class="ruled">'+esc(t)+'</div></div>');
  });
  return p;
}
function workView(){
  if(!cur){return shelfView()}
  return '<div class="row between"><a class="btn ghost" href="#shelf" style="text-decoration:none">← ഷെൽഫ്</a>'+(cur.demo?'<span class="chip demo">ഉദാഹരണം, സേവ് ആകില്ല</span>':
    (confirmDel?'<span class="row"><button class="btn danger" data-act="delYes">ഉറപ്പായും കളയുക</button><button class="btn ghost" data-act="delNo">വേണ്ട</button></span>':'<button class="btn ghost" data-act="del">കളയുക</button>'))+'</div>'+
    '<div><h2 style="font-size:1.6rem">'+esc(cur.title)+'</h2><p class="muted small">'+esc(KINDS[cur.kind]||'')+' · എഴുതിയത്: '+esc(cur.child)+'</p></div>'+
    '<div class="stepper" role="tablist">'+STEPS.map((s,i)=>'<button data-act="step" data-n="'+i+'" aria-current="'+(i===step)+'"><b>'+(i+1)+'</b>'+s+'</button>').join('')+'</div>'+
    '<div id="stepBox">'+stepHTML()+'</div>';
}
function motionSel(v,attrs){return '<select '+attrs+'>'+Object.keys(MOTIONS).map(k=>'<option value="'+k+'"'+(k===v?' selected':'')+'>'+MOTIONS[k]+'</option>').join('')+'</select>'}
function castView(){
  let h='<h2>കഥാപാത്രങ്ങൾ</h2><p class="muted">ഈ നാലുപേർ എല്ലാ കഥകളിലും ഉണ്ട്. ടീച്ചർക്ക് സ്വന്തം കഥാപാത്രങ്ങളെയും ചേർക്കാം: കിളി, പൂച്ച, കുട്ടികൾ വരച്ച ചിത്രം…</p><div class="cast">'+
    Object.keys(CAST).map(k=>{const c=CAST[k];return '<div class="plain">'+c.svg+'<h3>'+c.name+'</h3><span class="chip">'+c.what+'</span><p class="small">'+c.trait+'</p></div>'}).join('')+'</div>';
  h+='<h2>ടീച്ചറുടെ കഥാപാത്രങ്ങൾ</h2>';
  if(customChars.length){
    h+='<div class="cast">'+customChars.map(c=>'<div class="plain"><div class="mini stage sky">'+actorHTML(castOf(c.id),false)+'</div><h3>'+esc(c.name)+'</h3>'+
      motionSel(c.motion,'data-cf="motion" data-id="'+esc(c.id)+'" aria-label="ചലനം"')+
      '<label class="check small" style="margin:0"><input type="checkbox" data-cf="mirror" data-id="'+esc(c.id)+'"'+(c.mirror?' checked':'')+'><span>തിരിച്ചിടുക</span></label>'+
      (confirmChar===c.id?'<div class="row"><button class="btn danger" data-act="charDelYes" data-id="'+esc(c.id)+'">കളയുക</button><button class="btn ghost" data-act="charDelNo">വേണ്ട</button></div>':
       '<button class="btn ghost" data-act="charDel" data-id="'+esc(c.id)+'">കളയുക</button>')+'</div>').join('')+'</div>';
  }else h+='<p class="muted small">ഇതുവരെ ഒന്നും ചേർത്തിട്ടില്ല.</p>';
  h+='<form class="plain form" id="charForm"><h3>പുതിയ കഥാപാത്രം ചേർക്കുക</h3>'+
    '<div class="field"><label for="cName">പേര്</label><input type="text" id="cName" maxlength="30" placeholder="ഉദാ: ചിന്നു കിളി" value="'+esc(draft.name)+'" required></div>'+
    '<div class="pickrow"><label class="btn ghost pick">'+(draft.img?'മറ്റൊരു ചിത്രം':'ചിത്രം തിരഞ്ഞെടുക്കുക')+'<input type="file" id="cFile" accept="image/png,image/jpeg,image/webp"></label>'+
    '<label class="btn ghost pick">ക്യാമറ<input type="file" id="cCam" accept="image/*" capture="environment"></label></div>'+
    '<p class="muted small">പശ്ചാത്തലം ഇല്ലാത്ത PNG ആണ് ഏറ്റവും നല്ലത്. വെള്ള പേപ്പറിൽ വരച്ചതോ ഒറ്റ നിറമുള്ള പശ്ചാത്തലമുള്ളതോ ആയ ചിത്രത്തിന്റെ പശ്ചാത്തലം ആപ്പ് മായ്ക്കും.</p>'+
    '<label class="check" for="cBg"><input type="checkbox" id="cBg"'+(draft.removeBg?' checked':'')+'><span>പശ്ചാത്തലം മായ്ക്കുക</span></label>'+
    '<div class="field"><label for="cMotion">എങ്ങനെ അനങ്ങണം</label>'+motionSel(draft.motion,'id="cMotion"')+'</div>'+
    '<label class="check" for="cMirror"><input type="checkbox" id="cMirror"'+(draft.mirror?' checked':'')+'><span>തിരിച്ചിടുക (ചിത്രം ഇടത്തോട്ട് നോക്കുന്നുണ്ടെങ്കിൽ)</span></label>'+
    '<div id="prevBox">'+previewHTML()+'</div>'+
    '<div class="row"><button class="btn" type="submit"'+(draft.img?'':' disabled')+'>കഥാപാത്രം സേവ് ചെയ്യുക</button>'+(draft.img?'<button class="btn ghost" type="button" data-act="replay">വീണ്ടും കാണുക</button>':'')+'</div></form>';
  return h;
}
function previewHTML(){
  if(!draft.img)return '';
  const c={name:draft.name||'പുതിയ കഥാപാത്രം',motion:draft.motion,svg:'<img src="'+draft.img+'" alt=""'+(draft.mirror?' style="transform:scaleX(-1)"':'')+'>'};
  return '<div class="stage '+(draft.motion==='swim'?'river':draft.motion==='fly'?'sky':'forest')+'">'+actorHTML(c,true)+'<div class="bubble"><b>'+esc(c.name)+'</b>നമസ്കാരം കൂട്ടുകാരേ!</div></div>';
}
function drawPreview(){const b=document.getElementById('prevBox');if(b)b.innerHTML=previewHTML()}

/* ---------- making a character image: cut away a plain background, crop, shrink ---------- */
let draft={name:'',img:'',motion:'fly',mirror:false,removeBg:true,src:null}, confirmChar=null;
function loadImg(file){return new Promise((res,rej)=>{const u=URL.createObjectURL(file),im=new Image();im.onload=()=>{URL.revokeObjectURL(u);res(im)};im.onerror=()=>{URL.revokeObjectURL(u);rej(new Error('img'))};im.src=u})}
function cutout(im,removeBg,max){
  const k=Math.min(1,max/Math.max(im.width,im.height)),W=Math.max(1,Math.round(im.width*k)),H=Math.max(1,Math.round(im.height*k));
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');g.drawImage(im,0,0,W,H);
  const id=g.getImageData(0,0,W,H),px=id.data;
  // already transparent around the edges? then leave it alone
  let edgeAlpha=0,edgeN=0;for(let x=0;x<W;x++){edgeAlpha+=px[x*4+3]+px[((H-1)*W+x)*4+3];edgeN+=2}
  const hasAlpha=edgeAlpha/edgeN<200;
  if(removeBg&&!hasAlpha){
    // background colour = average of the four corners; flood from every edge pixel that is close to it
    const corner=[[0,0],[W-1,0],[0,H-1],[W-1,H-1]].map(([x,y])=>(y*W+x)*4);
    const bg=[0,1,2].map(i=>corner.reduce((a,o)=>a+px[o+i],0)/4);
    const near=(o,t)=>Math.max(Math.abs(px[o]-bg[0]),Math.abs(px[o+1]-bg[1]),Math.abs(px[o+2]-bg[2]))<t;
    const seen=new Uint8Array(W*H),stack=[];
    const push=(x,y)=>{const i=y*W+x;if(!seen[i]&&near(i*4,52)){seen[i]=1;stack.push(i)}};
    for(let x=0;x<W;x++){push(x,0);push(x,H-1)}for(let y=0;y<H;y++){push(0,y);push(W-1,y)}
    while(stack.length){const i=stack.pop(),x=i%W,y=(i/W)|0;px[i*4+3]=0;
      if(x>0)push(x-1,y);if(x<W-1)push(x+1,y);if(y>0)push(x,y-1);if(y<H-1)push(x,y+1)}
    // soften the edge: half-transparent pixels next to removed ones that are still fairly close to the background
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x;if(seen[i])continue;
      if((seen[i-1]||seen[i+1]||seen[i-W]||seen[i+W])&&near(i*4,90))px[i*4+3]=110}
    g.putImageData(id,0,0);
  }
  // crop to what is left
  let x0=W,y0=H,x1=-1,y1=-1;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(px[(y*W+x)*4+3]>24){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
  if(x1<0)return null;
  const pad=4;x0=Math.max(0,x0-pad);y0=Math.max(0,y0-pad);x1=Math.min(W-1,x1+pad);y1=Math.min(H-1,y1+pad);
  const out=document.createElement('canvas');out.width=x1-x0+1;out.height=y1-y0+1;out.getContext('2d').drawImage(cv,x0,y0,out.width,out.height,0,0,out.width,out.height);
  return out.toDataURL('image/png');
}
function makeCharImg(){
  if(!draft.src)return;
  let d=null;for(const max of [480,380,300,240]){d=cutout(draft.src,draft.removeBg,max);if(!d||d.length<380000)break}
  if(!d){toast('ചിത്രത്തിൽ ഒന്നും ബാക്കിയില്ല. "പശ്ചാത്തലം മായ്ക്കുക" ഓഫ് ചെയ്തുനോക്കൂ.',true);d=cutout(draft.src,false,300)}
  draft.img=d||'';
}
function planView(){
  return '<h2>ആപ്പിന്റെ ഘടന</h2>'+
  '<div class="plain tree"><h3>സ്ക്രീനുകൾ</h3>'+
    '<div><b>ഷെൽഫ്</b><div class="muted small">ക്ലാസ്സിലെ എല്ലാ സൃഷ്ടികളും, ഓരോന്നും ഏത് ഘട്ടത്തിൽ എന്ന്</div></div>'+
    '<div><b>പുതിയ സൃഷ്ടി</b><div class="muted small">പേര്, കുട്ടിയുടെ ആദ്യപേര്, ഇനം, സമ്മതപത്രം</div></div>'+
    '<div><b>സൃഷ്ടിയുടെ പേജ്</b><div class="kid small"><div>1 ഫോട്ടോ: ക്യാമറയിലോ ഗാലറിയിലോ നിന്ന് പേപ്പറിന്റെ ഫോട്ടോ</div><div>2 എഴുത്ത്: കൈയക്ഷരം ടെക്സ്റ്റാക്കുക, ടീച്ചർ തിരുത്തുക</div><div>3 രംഗങ്ങൾ: 4–6 രംഗങ്ങളും സംഭാഷണവും</div><div>4 കാണുക: കഥാപാത്രങ്ങൾ സംസാരിക്കുന്ന ആനിമേഷൻ</div><div>5 ബുക്ക്: മറിച്ചുനോക്കാവുന്ന പുസ്തകം</div></div></div>'+
    '<div><b>കഥാപാത്രങ്ങൾ</b><div class="muted small">മിട്ടു, അപ്പു, മീനു, കുഞ്ഞൻ, ഒപ്പം ടീച്ചർ ചേർക്കുന്നവരും</div></div></div>'+
  '<div class="plain form"><h3>ഇപ്പോൾ പ്രവർത്തിക്കുന്നത്</h3><ul class="tight"><li>ഫോണിൽ ഇൻസ്റ്റാൾ ചെയ്യാവുന്ന വെബ് ആപ്പ്, നെറ്റ് ഇല്ലെങ്കിലും തുറക്കും</li><li>ഫോണിന്റെ ക്യാമറയിൽ നിന്ന് നേരിട്ട് ഫോട്ടോ</li><li>ടീച്ചർക്ക് ടൈപ്പ് ചെയ്യാം, അല്ലെങ്കിൽ മൈക്ക് അമർത്തി പറഞ്ഞ് എഴുതാം (ഫ്രീ)</li><li>രംഗ സഹായി: കുട്ടിയുടെ വാചകങ്ങൾ തനിയെ രംഗങ്ങളാക്കുന്നു, ടീച്ചർ തിരുത്തുന്നു (ഫ്രീ)</li><li>ടീച്ചർക്ക് സ്വന്തം കഥാപാത്രം ചേർക്കാം; അത് പറന്നും ചാടിയും നീന്തിയും വന്ന് സംസാരിക്കും (ഫ്രീ)</li><li>ആനിമേഷനായും പുസ്തകമായും കാണാം</li><li>ടീച്ചർ ലോഗിൻ, ഏത് ഫോണിലും കാണാവുന്ന ക്ലൗഡ് സേവ്</li></ul>'+
    '<h3>ഇനി ചേർക്കേണ്ടത്</h3><ul class="tight"><li>കുട്ടിയുടെ സ്വന്തം ശബ്ദം റെക്കോർഡ് ചെയ്യൽ</li><li>MP4 വീഡിയോ ആയും PDF പുസ്തകമായും ഡൗൺലോഡ്</li><li>രക്ഷിതാക്കൾക്ക് QR കോഡ് വഴി പങ്കുവെക്കൽ</li></ul></div>'+
  '<div class="plain form"><h3>ഫോണിൽ ഇൻസ്റ്റാൾ ചെയ്യാൻ</h3><p>മറ്റ് ടീച്ചർമാർക്ക് ഈ ലിങ്ക് അയച്ചാൽ മതി (QR കോഡും അവിടെയുണ്ട്): <a href="/install">'+esc(location.host)+'/install</a></p><dl class="kv"><dt>Android</dt><dd>Chrome-ൽ ഈ സൈറ്റ് തുറന്ന് മെനുവിലെ "Install app" / "Add to Home screen".</dd><dt>iPhone</dt><dd>Safari-യിൽ തുറന്ന് Share → "Add to Home Screen".</dd><dt>കമ്പ്യൂട്ടർ</dt><dd>Chrome/Edge-ൽ അഡ്രസ് ബാറിലെ ഇൻസ്റ്റാൾ ഐക്കൺ.</dd></dl>'+
    (needCode&&getCode()?'<div class="row"><button class="btn ghost" data-act="clearCode">ക്ലാസ് കോഡ് മാറ്റുക</button></div>':'')+'</div>';
}

function render(){
  stopPlay();micStop();drawStage.last=null;
  const r=route();
  if(r==='work'&&!cur){location.hash='shelf';return}
  app.innerHTML=r==='shelf'?shelfView():r==='new'?newView():r==='work'?workView():r==='cast'?castView():r==='login'?loginView():planView();
  document.querySelectorAll('nav.tabs a').forEach(a=>{const on=a.dataset.tab===r||((r==='work'||r==='login')&&a.dataset.tab==='shelf');if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  if(r==='work'&&step===3)drawStage();
  if(r==='work')loadPhoto();
}
function renderStep(){stopPlay();micStop();const b=document.getElementById('stepBox');if(!b){render();return}
  document.querySelectorAll('.stepper button').forEach((x,i)=>x.setAttribute('aria-current',String(i===step)));
  b.innerHTML=stepHTML();if(step===3)drawStage();loadPhoto()}

/* ---------- player ---------- */
function actorHTML(c,enter){return '<div class="actor m-'+c.motion+(enter?' enter':'')+'"><div class="body">'+c.svg+'</div></div>'}
function drawStage(){
  const box=document.getElementById('stageBox');if(!box||!cur)return;
  const sc=cur.scenes[play.s]||cur.scenes[0];if(!sc)return;
  const ln=sc.lines[play.l]||sc.lines[0]||{who:'mittu',text:''};const c=castOf(ln.who);
  // the character flies/walks in only when the speaker or the scene changes
  const key=play.s+'|'+ln.who, enter=key!==drawStage.last;drawStage.last=key;
  box.innerHTML='<div class="stage '+esc(sc.place)+'">'+actorHTML(c,enter)+'<div class="bubble"><b>'+esc(c.name)+'</b>'+esc(ln.text)+'</div></div>';
  let d='';cur.scenes.forEach((s,i)=>{d+='<i class="'+(i<=play.s?'on':'')+'"></i>'});
  const dots=document.getElementById('dots');if(dots)dots.innerHTML=d;
  const pb=document.getElementById('playBtn');if(pb)pb.textContent=play.on?'നിർത്തുക':'പ്ലേ';
}
function advance(dir){
  const sc=cur.scenes;let s=play.s,l=play.l+dir;
  if(l>=(sc[s]?sc[s].lines.length:0)){s++;l=0}
  if(l<0){s--;l=s>=0?Math.max(0,sc[s].lines.length-1):0}
  if(s<0){s=0;l=0}
  if(s>=sc.length){play.on=false;play.s=0;play.l=0;drawStage();return false}
  play.s=s;play.l=l;drawStage();return true;
}
function tick(){
  clearTimeout(play.timer);if(!play.on)return;
  const ln=(cur.scenes[play.s]||{lines:[]}).lines[play.l];
  const ms=Math.max(2600,((ln&&ln.text)||'').length*95);
  play.timer=setTimeout(()=>{if(advance(1))tick()},ms);
}

/* ---------- photo ---------- */
function shrink(file,max,q){return new Promise((res,rej)=>{
  const url=URL.createObjectURL(file),img=new Image();
  img.onload=()=>{const k=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);
    c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);res(c.toDataURL('image/jpeg',q))};
  img.onerror=()=>{URL.revokeObjectURL(url);rej(new Error('img'))};img.src=url})}
async function onPhoto(file){
  if(!file||!cur||cur.demo)return;
  try{
    let d=await shrink(file,1600,.72);
    if(d.length>900000)d=await shrink(file,1200,.62);
    if(d.length>900000)d=await shrink(file,900,.5);
    cur.photo=d;cur.hasPhoto=true;renderStep();
    const id=cur.id;chain=chain.then(()=>data.putPhoto(id,d)).catch(()=>{if(!user)toast('ഫോട്ടോ സേവ് ചെയ്യാനായില്ല',true)});
    persist();
  }catch(e){toast('ഈ ഫോട്ടോ തുറക്കാനായില്ല. മറ്റൊന്ന് ശ്രമിക്കുക.',true)}
}
function loadPhoto(){
  if(!cur||cur.demo||!cur.hasPhoto||cur.photo||cur._loading)return;
  cur._loading=true;const w=cur;
  data.getPhoto(w.id).then(d=>{w._loading=false;
    if(typeof d==='string'&&d.indexOf('data:image/')===0){w.photo=d;if(cur===w&&route()==='work'&&(step===0||step===1||step===4))renderStep()}
    else{const el=document.getElementById('photoWait');if(el)el.textContent='ഫോട്ടോ കണ്ടെത്താനായില്ല. വീണ്ടും ചേർക്കുക.'}},()=>{w._loading=false});
}

/* ---------- Claude ---------- */
function aiErr(e){const c=e&&e.code;
  if(c==='bad_code'){setCode('');return 'ക്ലാസ് കോഡ് ശരിയല്ല. വീണ്ടും നൽകുക.'}
  if(c==='no_key')return 'സെർവറിൽ Claude API key ചേർത്തിട്ടില്ല. കൈകൊണ്ട് ടൈപ്പ് ചെയ്യാം.';
  if(c==='rate_limited'||c==='busy')return 'ഇപ്പോൾ തിരക്കാണ്. കുറച്ച് കഴിഞ്ഞ് വീണ്ടും ശ്രമിക്കുക.';
  if(c==='image_rejected')return 'ഈ ഫോട്ടോ വായിക്കാനായില്ല. കൂടുതൽ വ്യക്തമായ ഒന്ന് ശ്രമിക്കുക.';
  if(c==='offline')return 'നെറ്റ് കണക്ഷൻ ഇല്ല. പിന്നീട് ശ്രമിക്കുക.';
  return 'ഇത്തവണ നടന്നില്ല. വീണ്ടും ശ്രമിക്കുക.'}
async function doOcr(){
  if(busy||!aiOn||!cur.photo)return;
  if(needCode&&!getCode()){toast('ആദ്യം ക്ലാസ് കോഡ് നൽകുക',true);return}
  busy='ocr';renderStep();const w=cur;
  try{
    const r=await api('ocr',{image:w.photo,kind:w.kind});
    const t=(r.text||'').trim();
    if(t==='NO_TEXT'||!t)toast('ഫോട്ടോയിൽ എഴുത്ത് കണ്ടില്ല. കുട്ടി പറഞ്ഞത് ടൈപ്പ് ചെയ്യാം.',true);
    else{w.text=t;if(cur===w)persist()}
  }catch(e){toast(aiErr(e),true)}
  busy='';if(cur===w&&route()==='work')renderStep();
}
async function doScenes(){
  if(busy||!aiOn||!(cur.text||'').trim())return;
  if(needCode&&!getCode()){toast('ആദ്യം ക്ലാസ് കോഡ് നൽകുക',true);return}
  busy='scenes';renderStep();const w=cur;
  try{
    const r=await api('scenes',{title:w.title,kind:w.kind,text:w.text});
    const sc=clean(r&&r.scenes);
    if(!sc.length)toast('രംഗങ്ങൾ ഉണ്ടാക്കാനായില്ല. വീണ്ടും ശ്രമിക്കുക.',true);
    else{w.scenes=sc;play.s=0;play.l=0;if(cur===w)persist()}
  }catch(e){toast(aiErr(e),true)}
  busy='';if(cur===w&&route()==='work')renderStep();
}
function clean(arr){
  if(!Array.isArray(arr))return [];
  return arr.slice(0,6).map(s=>({place:PLACES[s&&s.place]?s.place:'forest',lines:(Array.isArray(s&&s.lines)?s.lines:[]).slice(0,4).map(l=>({who:isCast(l&&l.who)?l.who:'mittu',text:String((l&&l.text)||'').slice(0,240)})).filter(l=>l.text.trim())})).filter(s=>s.lines.length);
}


/* ---------- free scene helper (no AI): splits the child's own sentences into scenes ---------- */
const WHO_WORDS=[['appu',['ആന','അപ്പു']],['mittu',['തത്ത','മിട്ടു','കിളി','പക്ഷി','കാക്ക','മൈന','കുരുവി']],['kunjan',['അണ്ണാ','കുഞ്ഞൻ','പൂച്ച','മുയൽ','കുരങ്ങ','എലി','പട്ടി','നായ','ആമ']],['meenu',['മീനു','അമ്മു','കുട്ടി','ഞാൻ','കൂട്ടുകാരി']]];
const PLACE_WORDS=[['river',['പുഴ','നദി','കുളം','കടൽ','തോട്','വെള്ളത്തി','മീൻ']],['school',['സ്കൂൾ','ക്ലാസ്','പള്ളിക്കൂട','ടീച്ചർ','മാഷ്']],['home',['വീട്','അമ്മ','അച്ഛൻ','മുറ്റ','അടുക്കള']],['sky',['ആകാശ','മേഘ','ചന്ദ്ര','നക്ഷത്ര','സൂര്യ','പറന്ന','മഴവില്ല','രാത്രി']],['forest',['കാട','മര','മാവ','തോട്ട','പൂവ','കുന്ന']]];
function findIn(text,table){for(const [k,words] of table){if(words.some(wd=>text.indexOf(wd)>=0))return k}return null}
function chunk(sentence,max){
  const out=[];let curr='';
  sentence.split(/\s+/).forEach(word=>{if(curr&&(curr+' '+word).length>max){out.push(curr);curr=word}else curr=curr?curr+' '+word:word});
  if(curr)out.push(curr);return out;
}
function autoScenes(text,kind){
  const paras=String(text||'').split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
  // sentences (poem: each written line), with very long unpunctuated speech cut at word boundaries
  let sents=[];
  paras.forEach((pa,pi)=>{
    const parts=kind==='poem'?pa.split(/\n+/):pa.replace(/\n+/g,' ').split(/(?<=[.!?।])\s+/);
    parts.map(x=>x.trim()).filter(Boolean).forEach(x=>chunk(x,110).forEach(c=>sents.push({t:c,p:pi})));
  });
  if(!sents.length)return [];
  // how many scenes: follow paragraphs when they give 4–6, otherwise ~2–3 sentences per scene
  let n=paras.length>=4&&paras.length<=6?paras.length:Math.round(sents.length/2.5);
  n=Math.max(1,Math.min(6,Math.min(sents.length,Math.max(4,n))));
  let groups=[];
  if(n===paras.length){groups=paras.map((_,pi)=>sents.filter(x=>x.p===pi).map(x=>x.t))}
  else{const per=sents.length/n;for(let g=0;g<n;g++)groups.push(sents.slice(Math.round(g*per),Math.round((g+1)*per)).map(x=>x.t))}
  let lastPlace='forest';
  return groups.filter(g=>g.length).map(g=>{
    const all=g.join(' ');const place=findIn(all,PLACE_WORDS)||lastPlace;lastPlace=place;
    // keep at most 3 lines: join the extra sentences onto the last one
    let lines=g.slice(0,3);if(g.length>3)lines[2]=g.slice(2).join(' ');
    return {place,lines:lines.map(t=>{
      const quoted=/["“”'‘’]/.test(t);
      const custom=findIn(t,customChars.map(c=>[c.id,[c.name]]));
      const who=custom||(quoted?(findIn(t,WHO_WORDS)||'meenu'):'mittu');
      return {who,text:t.slice(0,240)};
    })};
  });
}
function applyAuto(){
  const sc=autoScenes(cur.text,cur.kind);
  if(!sc.length){toast('ആദ്യം കഥ ചേർക്കുക',true);return}
  cur.scenes=sc;play.s=0;play.l=0;persist(true);renderStep();toast('രംഗങ്ങൾ ഒരുക്കി. ഇനി തിരുത്താം.');
}

/* ---------- voice typing (browser speech recognition, free) ---------- */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition||null;
let rec=null, recTarget=null;
const MIC_SVG='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
function micBtn(id,big){
  if(!SR)return '';
  return '<button type="button" class="'+(big?'btn ghost mic':'x mic')+'" data-act="mic" data-target="'+id+'" aria-label="പറഞ്ഞ് എഴുതുക">'+MIC_SVG+(big?'<span>പറഞ്ഞ് എഴുതുക</span>':'')+'</button>';
}
function micUI(){
  document.querySelectorAll('[data-act=mic]').forEach(b=>{const on=!!rec&&b.dataset.target===recTarget;b.classList.toggle('on',on);
    const sp=b.querySelector('span');if(sp)sp.textContent=on?'കേൾക്കുന്നു… നിർത്താൻ അമർത്തുക':'പറഞ്ഞ് എഴുതുക'});
}
function micStop(){
  if(!rec)return;const r=rec;rec=null;recTarget=null;try{r.onend=null;r.stop()}catch(e){}micUI();
}
function micStart(id){
  if(!SR){toast('ഈ ബ്രൗസറിൽ വോയിസ് ഇല്ല. കീബോർഡിലെ മൈക്ക് ഉപയോഗിക്കുക.',true);return}
  micStop();
  const el=document.getElementById(id);if(!el)return;
  let committed=el.value;
  const r=new SR();r.lang='ml-IN';r.continuous=true;r.interimResults=true;
  const join=(a,b)=>!a?b:(/[\s\n]$/.test(a)?a+b:a+' '+b);
  r.onresult=ev=>{
    const box=document.getElementById(id);if(!box)return;
    let interim='';
    for(let i=ev.resultIndex;i<ev.results.length;i++){const t=ev.results[i][0].transcript.trim();if(!t)continue;
      if(ev.results[i].isFinal)committed=join(committed,t);else interim=join(interim,t)}
    box.value=interim?join(committed,interim):committed;
    box.dispatchEvent(new Event('input',{bubbles:true}));
  };
  r.onerror=ev=>{
    if(ev.error==='not-allowed'||ev.error==='service-not-allowed'){toast('മൈക്കിന് അനുമതി വേണം. ബ്രൗസറിന്റെ സെറ്റിംഗ്സിൽ അനുവദിക്കുക.',true);micStop()}
    else if(ev.error==='network'){toast('വോയിസിന് നെറ്റ് വേണം.',true);micStop()}
    else if(ev.error==='language-not-supported'){toast('ഈ ഫോണിൽ മലയാളം വോയിസ് ഇല്ല. കീബോർഡിലെ മൈക്ക് ഉപയോഗിക്കുക.',true);micStop()}
  };
  // phones stop listening after a pause: start again until the teacher presses stop
  r.onend=()=>{if(rec!==r)return;const box=document.getElementById(id);if(box)box.value=committed;
    try{r.start()}catch(e){micStop()}};
  rec=r;recTarget=id;
  try{r.start()}catch(e){rec=null;recTarget=null;toast('മൈക്ക് തുടങ്ങാനായില്ല.',true)}
  micUI();
}

/* ---------- events ---------- */
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-act]');if(!t)return;const a=t.dataset.act, s=+t.dataset.s, l=+t.dataset.l;
  if(a==='open'){const id=t.dataset.id;const src=id==='demo'?DEMO:works.find(w=>w.id===id);if(!src)return;
    cur=JSON.parse(JSON.stringify(src));step=doneSteps(cur)[2]?3:doneSteps(cur)[1]?2:doneSteps(cur)[0]?1:0;if(cur.demo)step=3;play.s=0;play.l=0;bookPage=0;confirmDel=false;go('work')}
  else if(a==='step'){step=+t.dataset.n;confirmRedo=false;renderStep();window.scrollTo(0,0)}
  else if(a==='ocr')doOcr();
  else if(a==='scenes')doScenes();
  else if(a==='logout')doLogout();
  else if(a==='replay')drawPreview();
  else if(a==='charDel'){confirmChar=t.dataset.id;render()}
  else if(a==='charDelNo'){confirmChar=null;render()}
  else if(a==='charDelYes'){const id=t.dataset.id;confirmChar=null;customChars=customChars.filter(c=>c.id!==id);charData.del(id).then(()=>toast('കളഞ്ഞു'),()=>toast('ക്ലൗഡിൽ നിന്ന് കളയാനായില്ല',true));render()}
  else if(a==='moveGuest')moveGuestWorks();
  else if(a==='syncNow')sync().then(()=>toast('എല്ലാം അപ്‌ലോഡ് ആയി'),()=>toast('ഇപ്പോഴും നെറ്റ് ഇല്ല',true));
  else if(a==='forgot')doForgot();
  else if(a==='auto'){if(cur.scenes&&cur.scenes.length){confirmRedo=true;renderStep()}else applyAuto()}
  else if(a==='autoYes'){confirmRedo=false;applyAuto()}
  else if(a==='autoNo'){confirmRedo=false;renderStep()}
  else if(a==='mic'){const id=t.dataset.target;if(rec&&recTarget===id)micStop();else micStart(id)}
  else if(a==='saveCode'){const v=(document.getElementById('codeIn')||{}).value;if(v&&v.trim()){setCode(v.trim());renderStep()}}
  else if(a==='clearCode'){setCode('');render();toast('കോഡ് മാറ്റി. അടുത്ത തവണ വീണ്ടും ചോദിക്കും.')}
  else if(a==='install'){if(installEvt){installEvt.prompt();installEvt.userChoice.finally(()=>{installEvt=null;render()})}}
  else if(a==='addScene'){cur.scenes=cur.scenes||[];if(cur.scenes.length<8){cur.scenes.push({place:'forest',lines:[{who:'mittu',text:''}]});persist(true);renderStep()}}
  else if(a==='delScene'){cur.scenes.splice(s,1);persist();renderStep()}
  else if(a==='addLine'){if(cur.scenes[s].lines.length<4){cur.scenes[s].lines.push({who:'mittu',text:''});persist(true);renderStep()}}
  else if(a==='delLine'){cur.scenes[s].lines.splice(l,1);if(!cur.scenes[s].lines.length)cur.scenes.splice(s,1);persist();renderStep()}
  else if(a==='play'){play.on=!play.on;drawStage();if(play.on)tick();else clearTimeout(play.timer)}
  else if(a==='next'){advance(1);if(play.on)tick()}
  else if(a==='prev'){advance(-1);if(play.on)tick()}
  else if(a==='bnext'){bookPage++;renderStep()}
  else if(a==='bprev'){bookPage=Math.max(0,bookPage-1);renderStep()}
  else if(a==='del'){confirmDel=true;render()}
  else if(a==='delNo'){confirmDel=false;render()}
  else if(a==='delYes'){const id=cur.id;cur=null;confirmDel=false;works=works.filter(w=>w.id!==id);chain=chain.then(()=>data.del(id)).then(()=>toast('കളഞ്ഞു'),()=>toast(user?'ക്ലൗഡിൽ നിന്ന് കളയാനായില്ല. നെറ്റ് നോക്കുക.':'കളയാനായില്ല',true));go('shelf')}
});
document.addEventListener('input',e=>{
  if(e.target.id==='cName'){draft.name=e.target.value;const b=document.querySelector('#prevBox .bubble b');if(b)b.textContent=draft.name||'പുതിയ കഥാപാത്രം';return}
  const t=e.target,f=t.dataset&&t.dataset.f;if(!f||!cur||cur.demo)return;
  if(f==='text'){cur.text=t.value;persistSoon()}
  else if(f==='line'){cur.scenes[+t.dataset.s].lines[+t.dataset.l].text=t.value;persistSoon()}
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.classList&&t.classList.contains('photoIn')){onPhoto(t.files&&t.files[0]);t.value='';return}
  if(t.id==='cFile'||t.id==='cCam'){const f=t.files&&t.files[0];t.value='';if(!f)return;
    loadImg(f).then(im=>{draft.src=im;draft.name=(document.getElementById('cName')||{}).value||draft.name;makeCharImg();render()},()=>toast('ഈ ചിത്രം തുറക്കാനായില്ല',true));return}
  if(t.id==='cBg'){draft.removeBg=t.checked;makeCharImg();drawPreview();return}
  if(t.id==='cMotion'){draft.motion=t.value;drawPreview();return}
  if(t.id==='cMirror'){draft.mirror=t.checked;drawPreview();return}
  if(t.dataset&&t.dataset.cf){const c=customChars.find(x=>x.id===t.dataset.id);if(!c)return;
    if(t.dataset.cf==='motion')c.motion=t.value;else c.mirror=t.checked;c.updated=Date.now();
    charData.put(c).catch(()=>{});render();return}
  const f=t.dataset&&t.dataset.f;if(!f||!cur)return;
  if(f==='who')cur.scenes[+t.dataset.s].lines[+t.dataset.l].who=t.value;
  else if(f==='place')cur.scenes[+t.dataset.s].place=t.value;
  if(f==='text'||f==='line'){clearTimeout(typingTimer)}
  persist();
});
document.addEventListener('submit',e=>{
  if(e.target.id!=='newForm')return;e.preventDefault();
  const title=document.getElementById('nTitle').value.trim(),child=document.getElementById('nChild').value.trim().split(/\s+/)[0]||'';
  if(!title||!child){toast('പേരുകൾ പൂരിപ്പിക്കുക',true);return}
  if(!document.getElementById('nConsent').checked){toast('സമ്മതപത്രം കിട്ടിയ ശേഷം മാത്രം ചേർക്കുക',true);return}
  cur={id:'w'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),title,child,kind:document.getElementById('nKind').value,consent:true,text:'',scenes:[],hasPhoto:false,created:Date.now()};
  step=0;play.s=0;play.l=0;bookPage=0;confirmDel=false;persist();go('work');
});
document.addEventListener('submit',async e=>{
  if(e.target.id==='charForm'){
    e.preventDefault();const name=(document.getElementById('cName').value||'').trim();
    if(!name){toast('കഥാപാത്രത്തിന് ഒരു പേര് നൽകുക',true);return}
    if(!draft.img){toast('ആദ്യം ഒരു ചിത്രം തിരഞ്ഞെടുക്കുക',true);return}
    const c={id:'c_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),name,motion:draft.motion,mirror:draft.mirror,img:draft.img,created:Date.now(),updated:Date.now()};
    customChars.push(c);draft={name:'',img:'',motion:'fly',mirror:false,removeBg:true,src:null};
    charData.put(c).then(()=>toast(name+' ചേർത്തു. ഇനി രംഗങ്ങളിൽ "ആര് പറയുന്നു" ലിസ്റ്റിൽ കാണാം.'),()=>toast('ഫോണിൽ സേവ് ചെയ്തു. നെറ്റ് വന്നാൽ അപ്‌ലോഡ് ആകും.'));
    render();window.scrollTo(0,0);return;
  }
  if(e.target.id==='loginForm'){
    e.preventDefault();if(authBusy||!sb)return;
    const mode=(e.submitter&&e.submitter.dataset.mode)||'in';
    const email=document.getElementById('le').value.trim(),password=document.getElementById('lp').value;authEmail=email;
    authBusy=true;authMsg='';render();
    try{
      if(mode==='up'){
        const {data:d,error}=await sb.auth.signUp({email,password,options:{emailRedirectTo:location.origin+'/#shelf'}});
        if(error)throw error;
        authMsg=d.session?'':'അക്കൗണ്ട് ഉണ്ടാക്കി. '+email+' എന്ന ഇമെയിലിൽ വന്ന ലിങ്ക് അമർത്തി ഉറപ്പിച്ച ശേഷം ലോഗിൻ ചെയ്യുക.';
      }else{
        const {error}=await sb.auth.signInWithPassword({email,password});if(error)throw error;
      }
    }catch(err){authMsg=authErr(err)}
    authBusy=false;if(route()==='login')render();
  }
  else if(e.target.id==='newPassForm'){
    e.preventDefault();if(authBusy)return;authBusy=true;render();
    const {error}=await sb.auth.updateUser({password:document.getElementById('np').value});
    authBusy=false;
    if(error){authMsg=authErr(error);render()}else{recovering=false;authMsg='';toast('പാസ്‌വേഡ് മാറ്റി');go('shelf')}
  }
});
async function doForgot(){
  const email=(document.getElementById('le')||{}).value;
  if(!email||!email.trim()){authMsg='ആദ്യം മുകളിൽ ഇമെയിൽ ടൈപ്പ് ചെയ്യുക.';render();return}
  const {error}=await sb.auth.resetPasswordForEmail(email.trim(),{redirectTo:location.origin+'/#login'});
  authMsg=error?authErr(error):'പാസ്‌വേഡ് മാറ്റാനുള്ള ലിങ്ക് '+email.trim()+' എന്ന ഇമെയിലിലേക്ക് അയച്ചു.';render();
}
async function doLogout(){
  if(!sb||!user)return;
  try{await sync()}catch(e){}
  if(pendingCount){toast('ചില സൃഷ്ടികൾ ഇനിയും അപ്‌ലോഡ് ആകാനുണ്ട്. നെറ്റ് ഉള്ളപ്പോൾ ലോഗൗട്ട് ചെയ്യുക.',true);return}
  // remove this teacher's copies from the device so the next person on this phone can't see them
  const uid=user.id;for(const w of (await store.list()).filter(x=>x._owner===uid))await store.del(w.id);
  for(const c of (await store.clist()).filter(x=>x._owner===uid))await store.cdel(c.id);
  await sb.auth.signOut();user=null;cur=null;works=[];await reloadWorks();toast('ലോഗൗട്ട് ചെയ്തു');go('shelf');
}
window.addEventListener('hashchange',render);
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvt=e;if(route()==='shelf')render()});
window.addEventListener('appinstalled',()=>{installEvt=null;toast('ഫോണിൽ ചേർത്തു')});

/* ---------- boot ---------- */
render();
(async function(){
  try{persistent=await store.persistent();works=(await store.list()).filter(w=>!w._owner).sort((a,b)=>(b.created||0)-(a.created||0));customChars=(await store.clist()).filter(c=>!c._owner)}catch(e){persistent=false}
  loaded=true;try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
  if(route()==='shelf')render();
  let cfg={};
  try{const r=await fetch('/api/config',{cache:'no-store'});if(r.ok){cfg=await r.json();aiOn=!!cfg.ai;needCode=!!cfg.needCode}}catch(e){aiOn=false}
  if(route()==='work')renderStep();
  await initCloud(cfg);
  if(route()==='shelf'||route()==='login')render();
})();
if('serviceWorker' in navigator&&location.protocol!=='file:'){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{})})}
})();
