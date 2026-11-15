/* കഥക്കൂട് — the page parents open from the QR code. Read-only: video with the child's voice, flip book, PDF. */
(function(){
"use strict";
const app=document.getElementById('app'), toastEl=document.getElementById('toast'), esc=kkEsc;
function toast(m,bad){toastEl.textContent=m;toastEl.className=bad?'bad':'';toastEl.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>{toastEl.hidden=true},2600)}
function fail(msg){app.innerHTML='<header class="board"><h1>കഥക്കൂട്</h1><p>'+esc(msg)+'</p><span class="chalk" aria-hidden="true"></span></header>'}

let w=null, root='', castOf=null, play={s:0,l:0,on:false,timer:null}, bookPage=0, voice=null, last=null, pdf={busy:false,url:''};

function stopVoice(){if(voice){voice.onended=null;try{voice.pause()}catch(e){}voice=null}}
function stageHTML(){
  const sc=w.scenes[play.s]||w.scenes[0];if(!sc)return '';
  const ln=sc.lines[play.l]||sc.lines[0];const c=castOf(ln.who);
  const key=play.s+'|'+ln.who, enter=key!==last;last=key;
  return '<div class="stage '+esc(sc.place)+'">'+actorHTML(c,enter)+'<div class="bubble"><b>'+esc(c.name)+'</b>'+esc(ln.text)+'</div></div>';
}
function drawStage(){
  const box=document.getElementById('stageBox');if(box)box.innerHTML=stageHTML();
  const dots=document.getElementById('dots');if(dots)dots.innerHTML=w.scenes.map((s,i)=>'<i class="'+(i<=play.s?'on':'')+'"></i>').join('');
  const pb=document.getElementById('playBtn');if(pb)pb.textContent=play.on?'നിർത്തുക':'പ്ലേ';
}
function advance(dir){
  const sc=w.scenes;let s=play.s,l=play.l+dir;
  if(l>=(sc[s]?sc[s].lines.length:0)){s++;l=0}
  if(l<0){s--;l=s>=0?Math.max(0,sc[s].lines.length-1):0}
  if(s<0){s=0;l=0}
  if(s>=sc.length){play.on=false;play.s=0;play.l=0;last=null;drawStage();return false}
  play.s=s;play.l=l;drawStage();return true;
}
function tick(){
  clearTimeout(play.timer);stopVoice();if(!play.on)return;
  const ln=(w.scenes[play.s]||{lines:[]}).lines[play.l];
  const ms=Math.max(2600,((ln&&ln.text)||'').length*95);
  const next=()=>{if(advance(1))tick()}, wait=()=>{play.timer=setTimeout(next,ms)};
  if(!(ln&&ln.aud))return wait();
  voice=new Audio(root+'a/'+encodeURIComponent(ln.aud));
  voice.onended=()=>{play.timer=setTimeout(next,600)};
  voice.play().catch(wait);
}
function bookHTML(){
  const pages=bookPagesFor(w,castOf,w.photo?root+w.photo:null);bookPage=Math.min(bookPage,pages.length-1);
  return pages[bookPage]+'<div class="row between"><button class="btn ghost" data-act="bprev"'+(bookPage===0?' disabled':'')+'>മുൻ പേജ്</button><span class="muted small">'+(bookPage+1)+' / '+pages.length+'</span><button class="btn ghost" data-act="bnext"'+(bookPage>=pages.length-1?' disabled':'')+'>അടുത്ത പേജ്</button></div>';
}
function render(){
  const hasScenes=w.scenes&&w.scenes.length;
  app.innerHTML='<header class="board"><h1>'+esc(w.title)+'</h1><p>'+esc(KINDS[w.kind]||'കഥ')+' · എഴുതിയത്: '+esc(w.child)+' · ക്ലാസ് 4</p><span class="chalk" aria-hidden="true"></span></header>'+
    (hasScenes?'<div class="form"><div id="stageBox"></div><div class="row" style="justify-content:center"><button class="btn ghost" data-act="prev">മുമ്പത്തേത്</button><button class="btn" data-act="play" id="playBtn">പ്ലേ</button><button class="btn ghost" data-act="next">അടുത്തത്</button></div><div class="dots" id="dots"></div></div>':'')+
    '<h2>പുസ്തകം</h2><div class="form" id="bookBox">'+bookHTML()+'</div>'+
    '<div class="plain row">'+(pdf.url?'<a class="btn" style="text-decoration:none" href="'+pdf.url+'" download="'+esc(KKPdf.fileName(w))+'">PDF സേവ് ചെയ്യുക</a>':'<button class="btn" data-act="pdf"'+(pdf.busy?' disabled':'')+'>'+(pdf.busy?'PDF ഒരുക്കുന്നു…':'PDF ആയി ഡൗൺലോഡ് ചെയ്യുക')+'</button>')+'</div>'+
    '<p class="muted small foot">ടീച്ചർ പങ്കിട്ടത് · കഥക്കൂട്</p>';
  if(hasScenes)drawStage();
}
document.addEventListener('click',async e=>{
  const t=e.target.closest('[data-act]');if(!t||!w)return;const a=t.dataset.act;
  if(a==='play'){play.on=!play.on;drawStage();if(play.on)tick();else{clearTimeout(play.timer);stopVoice()}}
  else if(a==='next'){advance(1);if(play.on)tick()}
  else if(a==='prev'){advance(-1);if(play.on)tick()}
  else if(a==='bnext'||a==='bprev'){bookPage=Math.max(0,bookPage+(a==='bnext'?1:-1));document.getElementById('bookBox').innerHTML=bookHTML()}
  else if(a==='pdf'){
    pdf.busy=true;render();
    try{const blob=await KKPdf.make(w,castOf,w.photo?root+w.photo:null);pdf={busy:false,url:URL.createObjectURL(blob)};
      const x=document.createElement('a');x.href=pdf.url;x.download=KKPdf.fileName(w);document.body.appendChild(x);x.click();x.remove()}
    catch(err){pdf={busy:false,url:''};toast('PDF ഉണ്ടാക്കാനായില്ല',true)}
    render();
  }
});

(async function(){
  const base=decodeURIComponent(location.hash.slice(1));
  if(!/^[\w-]{1,64}\/[0-9a-f]{32}$/i.test(base))return fail('ഈ ലിങ്ക് ശരിയല്ല. ടീച്ചറോട് പുതിയ QR കോഡ് ചോദിക്കുക.');
  let cfg={};try{cfg=await (await fetch('/api/config',{cache:'no-store'})).json()}catch(e){}
  if(!cfg.supabaseUrl)return fail('കഥ തുറക്കാനായില്ല. കുറച്ച് കഴിഞ്ഞ് വീണ്ടും ശ്രമിക്കുക.');
  root=cfg.supabaseUrl.replace(/\/$/,'')+'/storage/v1/object/public/shared/'+base+'/';
  try{
    const r=await fetch(root+'bundle.json?t='+Date.now(),{cache:'no-store'});
    if(!r.ok)return fail('ഈ കഥ ഇപ്പോൾ പങ്കിടുന്നില്ല. ടീച്ചറോട് ചോദിക്കുക.');
    w=await r.json();
  }catch(e){return fail('നെറ്റ് കണക്ഷൻ ഇല്ല. പിന്നീട് വീണ്ടും തുറക്കുക.')}
  w.scenes=Array.isArray(w.scenes)?w.scenes:[];
  const m=castMapFrom(Array.isArray(w.chars)?w.chars:[]);castOf=k=>m[k]||m.mittu;
  document.title=w.title+' — കഥക്കൂട്';
  render();
})();
})();
