/* കഥക്കൂട് — shared by the app (app.js) and the parents' page (view.js). Plain globals on purpose. */
"use strict";
function kkEsc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
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

const MOTIONS={fly:'പറക്കൽ',hop:'ചാട്ടം',walk:'നടത്തം',swim:'നീന്തൽ',stand:'നിൽക്കൽ'};
const BUILTIN_MOTION={mittu:'fly',appu:'walk',meenu:'walk',kunjan:'hop'};
/* all characters: the four fixed ones + a teacher's own list [{id,name,motion,mirror,img}] */
function castMapFrom(custom){
  const m={};Object.keys(CAST).forEach(k=>{m[k]=Object.assign({motion:BUILTIN_MOTION[k]||'stand'},CAST[k])});
  (custom||[]).forEach(c=>{m[c.id]={name:c.name,what:'ടീച്ചർ ചേർത്തത്',motion:MOTIONS[c.motion]?c.motion:'stand',custom:true,img:c.img,mirror:!!c.mirror,
    svg:'<img src="'+c.img+'" alt="'+kkEsc(c.name)+'"'+(c.mirror?' style="transform:scaleX(-1)"':'')+'>'}});
  return m;
}
function actorHTML(c,enter){return '<div class="actor m-'+c.motion+(enter?' enter':'')+'"><div class="body">'+c.svg+'</div></div>'}
/* pages of the flip book; castOf(who) → character */
function bookPagesFor(w,castOf,photo){
  const p=[];
  p.push('<div class="book cover"><p>'+kkEsc(KINDS[w.kind]||'കഥ')+'</p><h2>'+kkEsc(w.title)+'</h2><p>എഴുതിയത്: '+kkEsc(w.child)+'</p><p class="small">ക്ലാസ് 4</p></div>');
  if(photo) p.push('<div class="book"><p class="muted small">കുട്ടിയുടെ സ്വന്തം കൈയക്ഷരത്തിൽ</p><img alt="സൃഷ്ടിയുടെ ഫോട്ടോ" src="'+photo+'"></div>');
  const paras=(w.text||'').split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean);
  if(!paras.length) p.push('<div class="book"><p class="muted">എഴുത്ത് ചേർത്താൽ ഇവിടെ പേജുകളായി കാണാം.</p></div>');
  paras.forEach((t,i)=>{
    const sc=(w.scenes||[])[Math.min(i,(w.scenes||[]).length-1)];
    const who=sc&&sc.lines[0]?castOf(sc.lines[0].who):null;
    p.push('<div class="book">'+(sc?'<div class="stage '+kkEsc(sc.place)+'" style="aspect-ratio:16/8;flex:none">'+(who?'<div class="actor m-still" style="width:22%"><div class="body">'+who.svg+'</div></div>':'')+'</div>':'')+'<div class="ruled">'+kkEsc(t)+'</div></div>');
  });
  return p;
}
