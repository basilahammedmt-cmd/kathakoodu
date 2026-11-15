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

/* ---------- storage on this device (IndexedDB, with in-memory fallback) ---------- */
const store=(function(){
  let dbp=null; const mem={works:new Map(),photos:new Map()};
  function open(){
    if(dbp)return dbp;
    dbp=new Promise((res)=>{
      try{
        const rq=indexedDB.open('kathakkoodu',1);
        rq.onupgradeneeded=()=>{const d=rq.result;if(!d.objectStoreNames.contains('works'))d.createObjectStore('works',{keyPath:'id'});if(!d.objectStoreNames.contains('photos'))d.createObjectStore('photos')};
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
    getPhoto:id=>tx('photos','readonly',st=>st?st.get(id):null).then(r=>r||mem.photos.get(id)||null)
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
let works=[], cur=null, step=0, play={s:0,l:0,on:false,timer:null}, bookPage=0, busy='', confirmDel=false, loaded=false, installEvt=null;
let chain=Promise.resolve();

function toast(msg,bad){toastEl.textContent=msg;toastEl.className=bad?'bad':'';toastEl.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>{toastEl.hidden=true},2600)}
function route(){const h=(location.hash||'#shelf').slice(1);return ['shelf','new','work','cast','plan'].includes(h)?h:'shelf'}
function go(h){if(location.hash==='#'+h)render();else location.hash=h}
function stopPlay(){clearTimeout(play.timer);play.on=false;try{window.speechSynthesis&&speechSynthesis.cancel()}catch(e){}}
function doneSteps(w){return [!!w.hasPhoto,!!(w.text&&w.text.trim()),!!(w.scenes&&w.scenes.length)]}

function persist(quiet){
  if(!cur||cur.demo)return;
  const body={id:cur.id,title:cur.title,child:cur.child,kind:cur.kind,consent:!!cur.consent,text:cur.text||'',scenes:cur.scenes||[],hasPhoto:!!cur.hasPhoto,created:cur.created,updated:Date.now()};
  const i=works.findIndex(w=>w.id===body.id);if(i>=0)works[i]=body;else works.unshift(body);
  chain=chain.then(()=>store.put(body)).then(()=>{if(!quiet)toast('സേവ് ചെയ്തു')},()=>toast('സേവ് ചെയ്യാനായില്ല',true));
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
function shelfView(){
  let h=boardHTML()+'<div class="row between"><h2>ക്ലാസ് ഷെൽഫ്</h2><a class="btn" href="#new" style="text-decoration:none">പുതിയ സൃഷ്ടി</a></div>';
  if(loaded&&!persistent) h+='<p class="note bad">ഈ ബ്രൗസറിൽ സൃഷ്ടികൾ സൂക്ഷിക്കാനാവില്ല (ഉദാ: private mode). പേജ് അടച്ചാൽ ഇവ നഷ്ടമാകും.</p>';
  else if(loaded&&works.length) h+='<p class="muted small">ഇപ്പോൾ സൃഷ്ടികൾ ഈ ഫോണിൽ/കമ്പ്യൂട്ടറിൽ മാത്രമാണ് സൂക്ഷിക്കുന്നത്. ടീച്ചർ ലോഗിനും ക്ലൗഡ് സേവും അടുത്ത ഘട്ടത്തിൽ വരും.</p>';
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
function castSel(v,i,j){return '<select data-f="who" data-s="'+i+'" data-l="'+j+'" aria-label="ആര് പറയുന്നു">'+Object.keys(CAST).map(k=>'<option value="'+k+'"'+(k===v?' selected':'')+'>'+CAST[k].name+'</option>').join('')+'</select>'}
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
      '<textarea class="ruled" id="txt" data-f="text" placeholder="ഇവിടെ ടൈപ്പ് ചെയ്യാം, അല്ലെങ്കിൽ ഫോട്ടോയിൽ നിന്ന് വായിപ്പിക്കാം"'+(w.demo?' readonly':'')+'>'+esc(w.text||'')+'</textarea></div>'+
      (canRead?codeBox()+'<div class="row"><button class="btn" data-act="ocr"'+(busy?' disabled':'')+'>'+(busy==='ocr'?'വായിക്കുന്നു…':'ഫോട്ടോയിൽ നിന്ന് കൈയക്ഷരം വായിക്കുക')+'</button></div><p class="muted small">Claude വായിച്ചതിൽ തെറ്റുകൾ വരാം. ടീച്ചർ ഒരിക്കൽ ഒത്തുനോക്കണം. വായിക്കാൻ പറ്റാത്ത വാക്കുകൾ [?] എന്ന് കാണിക്കും.</p>':
       (!w.demo?'<p class="muted small">'+(w.photo?'Claude ഇപ്പോൾ ലഭ്യമല്ല (സെർവറിൽ API key ചേർത്തിട്ടില്ല, അല്ലെങ്കിൽ നെറ്റ് ഇല്ല). ടൈപ്പ് ചെയ്യാം.':'ആദ്യം ഫോട്ടോ ചേർത്താൽ കൈയക്ഷരം തനിയെ വായിപ്പിക്കാം.')+'</p>':''))+
      '<div class="row"><button class="btn ghost" data-act="step" data-n="2">അടുത്തത്: രംഗങ്ങൾ</button></div></div>';
  }
  if(step===2){
    let h='<div class="form">';
    if(aiOn&&!w.demo) h+='<div class="plain form"><p>കഥയുടെ അർത്ഥം മാറ്റാതെ 4–6 രംഗങ്ങളാക്കി, സ്ഥിരം കഥാപാത്രങ്ങൾക്ക് സംഭാഷണം നൽകും.</p>'+codeBox()+'<div class="row"><button class="btn" data-act="scenes"'+((busy||!(w.text||'').trim())?' disabled':'')+'>'+(busy==='scenes'?'രംഗങ്ങൾ ഒരുക്കുന്നു…':(w.scenes&&w.scenes.length?'വീണ്ടും രംഗങ്ങളാക്കുക':'എഴുത്തിനെ രംഗങ്ങളാക്കുക'))+'</button></div>'+(!(w.text||'').trim()?'<p class="muted small">ആദ്യം "എഴുത്ത്" ഘട്ടത്തിൽ കഥ ചേർക്കുക.</p>':'')+'</div>';
    (w.scenes||[]).forEach((sc,i)=>{
      h+='<div class="page scene"><div class="row between"><h3>രംഗം '+(i+1)+'</h3><span class="row"><select data-f="place" data-s="'+i+'" aria-label="സ്ഥലം" style="width:auto">'+Object.keys(PLACES).map(k=>'<option value="'+k+'"'+(k===sc.place?' selected':'')+'>'+PLACES[k]+'</option>').join('')+'</select><button class="x" data-act="delScene" data-s="'+i+'" aria-label="രംഗം കളയുക">×</button></span></div>';
      sc.lines.forEach((ln,j)=>{h+='<div class="line">'+castSel(ln.who,i,j)+'<textarea data-f="line" data-s="'+i+'" data-l="'+j+'" aria-label="സംഭാഷണം">'+esc(ln.text)+'</textarea><button class="x" data-act="delLine" data-s="'+i+'" data-l="'+j+'" aria-label="വരി കളയുക">×</button></div>'});
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
    const who=sc&&sc.lines[0]?CAST[sc.lines[0].who]:null;
    p.push('<div class="book">'+(sc?'<div class="stage '+esc(sc.place)+'" style="aspect-ratio:16/8;flex:none">'+(who?'<div class="actor" style="width:22%;animation:none">'+who.svg+'</div>':'')+'</div>':'')+'<div class="ruled">'+esc(t)+'</div></div>');
  });
  return p;
}
function workView(){
  if(!cur){return shelfView()}
  return '<div class="row between"><a class="btn ghost" href="#shelf" style="text-decoration:none">← ഷെൽഫ്</a>'+(cur.demo?'<span class="chip demo">ഉദാഹരണം, സേവ് ആകില്ല</span>':
    (confirmDel?'<span class="row"><button class="btn danger" data-act="delYes">ഉറപ്പായും കളയുക</button><button class="btn ghost" data-act="delNo">വേണ്ട</button></span>':'<button class="btn ghost" data-act="del">കളയുക</button>'))+'</div>'+
    '<div><h2 style="font-family:var(--hand);font-weight:400;font-size:1.8rem">'+esc(cur.title)+'</h2><p class="muted small">'+esc(KINDS[cur.kind]||'')+' · എഴുതിയത്: '+esc(cur.child)+'</p></div>'+
    '<div class="stepper" role="tablist">'+STEPS.map((s,i)=>'<button data-act="step" data-n="'+i+'" aria-current="'+(i===step)+'"><b>'+(i+1)+'</b>'+s+'</button>').join('')+'</div>'+
    '<div id="stepBox">'+stepHTML()+'</div>';
}
function castView(){
  return '<h2>സ്ഥിരം കഥാപാത്രങ്ങൾ</h2><p class="muted">എല്ലാ കഥകളിലും ഈ നാലുപേരാണ് സംസാരിക്കുന്നത്. അതുകൊണ്ട് കുട്ടികൾക്ക് അവരെ പെട്ടെന്ന് പരിചയമാകും.</p><div class="cast">'+
    Object.keys(CAST).map(k=>{const c=CAST[k];return '<div class="plain">'+c.svg+'<h3>'+c.name+'</h3><span class="chip">'+c.what+'</span><p class="small">'+c.trait+'</p></div>'}).join('')+
    '</div><p class="note">പേരും സ്വഭാവവും കുട്ടികളോട് ചോദിച്ച് മാറ്റാം. കുട്ടികൾ വരച്ച ചിത്രങ്ങൾ തന്നെ കഥാപാത്രമാക്കുന്നത് അടുത്ത പതിപ്പിൽ ചേർക്കാം.</p>';
}
function planView(){
  return '<h2>ആപ്പിന്റെ ഘടന</h2>'+
  '<div class="plain tree"><h3>സ്ക്രീനുകൾ</h3>'+
    '<div><b>ഷെൽഫ്</b><div class="muted small">ക്ലാസ്സിലെ എല്ലാ സൃഷ്ടികളും, ഓരോന്നും ഏത് ഘട്ടത്തിൽ എന്ന്</div></div>'+
    '<div><b>പുതിയ സൃഷ്ടി</b><div class="muted small">പേര്, കുട്ടിയുടെ ആദ്യപേര്, ഇനം, സമ്മതപത്രം</div></div>'+
    '<div><b>സൃഷ്ടിയുടെ പേജ്</b><div class="kid small"><div>1 ഫോട്ടോ: ക്യാമറയിലോ ഗാലറിയിലോ നിന്ന് പേപ്പറിന്റെ ഫോട്ടോ</div><div>2 എഴുത്ത്: കൈയക്ഷരം ടെക്സ്റ്റാക്കുക, ടീച്ചർ തിരുത്തുക</div><div>3 രംഗങ്ങൾ: 4–6 രംഗങ്ങളും സംഭാഷണവും</div><div>4 കാണുക: കഥാപാത്രങ്ങൾ സംസാരിക്കുന്ന ആനിമേഷൻ</div><div>5 ബുക്ക്: മറിച്ചുനോക്കാവുന്ന പുസ്തകം</div></div></div>'+
    '<div><b>കഥാപാത്രങ്ങൾ</b><div class="muted small">മിട്ടു, അപ്പു, മീനു, കുഞ്ഞൻ</div></div></div>'+
  '<div class="plain form"><h3>ഇപ്പോൾ പ്രവർത്തിക്കുന്നത്</h3><ul class="tight"><li>ഫോണിൽ ഇൻസ്റ്റാൾ ചെയ്യാവുന്ന വെബ് ആപ്പ്, നെറ്റ് ഇല്ലെങ്കിലും തുറക്കും</li><li>ഫോണിന്റെ ക്യാമറയിൽ നിന്ന് നേരിട്ട് ഫോട്ടോ</li><li>ഫോട്ടോയിലെ മലയാളം കൈയക്ഷരം Claude വായിക്കുന്നു</li><li>എഴുത്തിനെ രംഗങ്ങളും സംഭാഷണവും ആക്കുന്നു, കൈകൊണ്ട് തിരുത്താം</li><li>ആനിമേഷനായും പുസ്തകമായും കാണാം</li><li>സൃഷ്ടികൾ ഈ ഉപകരണത്തിൽ സേവ് ആകുന്നു</li></ul>'+
    '<h3>ഇനി ചേർക്കേണ്ടത്</h3><ul class="tight"><li>ടീച്ചർ ലോഗിൻ, എല്ലാ ഫോണിലും കാണാവുന്ന ക്ലൗഡ് സേവ് (Supabase)</li><li>കുട്ടിയുടെ സ്വന്തം ശബ്ദം റെക്കോർഡ് ചെയ്യൽ</li><li>MP4 വീഡിയോ ആയും PDF പുസ്തകമായും ഡൗൺലോഡ്</li><li>രക്ഷിതാക്കൾക്ക് QR കോഡ് വഴി പങ്കുവെക്കൽ</li><li>കുട്ടി വരച്ച ചിത്രം തന്നെ അനക്കൽ</li></ul></div>'+
  '<div class="plain form"><h3>ഫോണിൽ ഇൻസ്റ്റാൾ ചെയ്യാൻ</h3><dl class="kv"><dt>Android</dt><dd>Chrome-ൽ ഈ സൈറ്റ് തുറന്ന് മെനുവിലെ "Install app" / "Add to Home screen".</dd><dt>iPhone</dt><dd>Safari-യിൽ തുറന്ന് Share → "Add to Home Screen".</dd><dt>കമ്പ്യൂട്ടർ</dt><dd>Chrome/Edge-ൽ അഡ്രസ് ബാറിലെ ഇൻസ്റ്റാൾ ഐക്കൺ.</dd></dl>'+
    (needCode&&getCode()?'<div class="row"><button class="btn ghost" data-act="clearCode">ക്ലാസ് കോഡ് മാറ്റുക</button></div>':'')+'</div>';
}

function render(){
  stopPlay();
  const r=route();
  if(r==='work'&&!cur){location.hash='shelf';return}
  app.innerHTML=r==='shelf'?shelfView():r==='new'?newView():r==='work'?workView():r==='cast'?castView():planView();
  document.querySelectorAll('nav.tabs a').forEach(a=>{const on=a.dataset.tab===r||(r==='work'&&a.dataset.tab==='shelf');if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  if(r==='work'&&step===3)drawStage();
  if(r==='work')loadPhoto();
}
function renderStep(){stopPlay();const b=document.getElementById('stepBox');if(!b){render();return}
  document.querySelectorAll('.stepper button').forEach((x,i)=>x.setAttribute('aria-current',String(i===step)));
  b.innerHTML=stepHTML();if(step===3)drawStage();loadPhoto()}

/* ---------- player ---------- */
function drawStage(){
  const box=document.getElementById('stageBox');if(!box||!cur)return;
  const sc=cur.scenes[play.s]||cur.scenes[0];if(!sc)return;
  const ln=sc.lines[play.l]||sc.lines[0]||{who:'mittu',text:''};const c=CAST[ln.who]||CAST.mittu;
  box.innerHTML='<div class="stage '+esc(sc.place)+'"><div class="actor">'+c.svg+'</div><div class="bubble"><b>'+c.name+'</b>'+esc(ln.text)+'</div></div>';
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
    const id=cur.id;chain=chain.then(()=>store.putPhoto(id,d)).catch(()=>toast('ഫോട്ടോ സേവ് ചെയ്യാനായില്ല',true));
    persist();
  }catch(e){toast('ഈ ഫോട്ടോ തുറക്കാനായില്ല. മറ്റൊന്ന് ശ്രമിക്കുക.',true)}
}
function loadPhoto(){
  if(!cur||cur.demo||!cur.hasPhoto||cur.photo||cur._loading)return;
  cur._loading=true;const w=cur;
  store.getPhoto(w.id).then(d=>{w._loading=false;
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
  return arr.slice(0,6).map(s=>({place:PLACES[s&&s.place]?s.place:'forest',lines:(Array.isArray(s&&s.lines)?s.lines:[]).slice(0,4).map(l=>({who:CAST[l&&l.who]?l.who:'mittu',text:String((l&&l.text)||'').slice(0,240)})).filter(l=>l.text.trim())})).filter(s=>s.lines.length);
}

/* ---------- events ---------- */
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-act]');if(!t)return;const a=t.dataset.act, s=+t.dataset.s, l=+t.dataset.l;
  if(a==='open'){const id=t.dataset.id;const src=id==='demo'?DEMO:works.find(w=>w.id===id);if(!src)return;
    cur=JSON.parse(JSON.stringify(src));step=doneSteps(cur)[2]?3:doneSteps(cur)[1]?2:doneSteps(cur)[0]?1:0;if(cur.demo)step=3;play.s=0;play.l=0;bookPage=0;confirmDel=false;go('work')}
  else if(a==='step'){step=+t.dataset.n;renderStep();window.scrollTo(0,0)}
  else if(a==='ocr')doOcr();
  else if(a==='scenes')doScenes();
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
  else if(a==='delYes'){const id=cur.id;cur=null;confirmDel=false;works=works.filter(w=>w.id!==id);chain=chain.then(()=>store.del(id)).then(()=>toast('കളഞ്ഞു'),()=>toast('കളയാനായില്ല',true));go('shelf')}
});
document.addEventListener('input',e=>{
  const t=e.target,f=t.dataset&&t.dataset.f;if(!f||!cur||cur.demo)return;
  if(f==='text'){cur.text=t.value;persistSoon()}
  else if(f==='line'){cur.scenes[+t.dataset.s].lines[+t.dataset.l].text=t.value;persistSoon()}
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.classList&&t.classList.contains('photoIn')){onPhoto(t.files&&t.files[0]);t.value='';return}
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
window.addEventListener('hashchange',render);
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvt=e;if(route()==='shelf')render()});
window.addEventListener('appinstalled',()=>{installEvt=null;toast('ഫോണിൽ ചേർത്തു')});

/* ---------- boot ---------- */
render();
(async function(){
  try{persistent=await store.persistent();works=(await store.list()).sort((a,b)=>(b.created||0)-(a.created||0))}catch(e){persistent=false}
  loaded=true;try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
  if(route()==='shelf')render();
  try{const r=await fetch('/api/config',{cache:'no-store'});if(r.ok){const j=await r.json();aiOn=!!j.ai;needCode=!!j.needCode}}catch(e){aiOn=false}
  if(route()==='work')renderStep();
})();
if('serviceWorker' in navigator&&location.protocol!=='file:'){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{})})}
})();
