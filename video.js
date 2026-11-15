/* കഥക്കൂട് — makes a video of the story on the phone, free.
   The scenes are drawn on a canvas frame by frame (same places and motions as the player), the child's
   recorded voice is mixed in with Web Audio, and MediaRecorder records both. MP4 where the browser can
   (Chrome 126+, Safari), otherwise WebM. Recording runs in real time, so a 1-minute story takes ~1 minute.
   Needs pdf.js (drawing helpers) and cast.js. */
"use strict";
const KKVideo=(function(){
  const W=960,H=720,FPS=30;
  const TYPES=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4;codecs=avc1,mp4a','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
  function pickType(){if(!window.MediaRecorder||!MediaRecorder.isTypeSupported)return '';return TYPES.find(t=>MediaRecorder.isTypeSupported(t))||''}
  function supported(){const c=document.createElement('canvas');return !!(window.MediaRecorder&&c.captureStream&&(window.AudioContext||window.webkitAudioContext))}
  function willBeMp4(){return /mp4/.test(pickType())}

  const D=()=>KKPdf.draw;
  const ease=t=>t<0?0:t>1?1:1-Math.pow(1-t,3);
  const lerp=(a,b,t)=>a+(b-a)*t;
  // piecewise path through [t, x, y] points (x, y as fractions of the actor box, like CSS translate %)
  function path(pts,t){for(let i=1;i<pts.length;i++){if(t<=pts[i][0]){const a=pts[i-1],b=pts[i],k=(t-a[0])/(b[0]-a[0]);return [lerp(a[1],b[1],k),lerp(a[2],b[2],k)]}}const l=pts[pts.length-1];return [l[1],l[2]]}
  const ENTER={fly:1.5,hop:1.4,walk:1.6,swim:1.8,stand:.5};

  /* where and how the actor is drawn at time t (seconds since it appeared) */
  function pose(motion,t,enter){
    let dx=0,dy=0,sx=1,sy=1,rot=0,alpha=1;
    const e=ENTER[motion]||.5, k=enter?Math.min(1,t/e):1;
    if(enter&&k<1){
      if(motion==='fly'){[dx,dy]=path([[0,-1.7,-.8],[.45,-.6,-.95],[.75,-.1,-.3],[1,0,0]],ease(k));rot=lerp(-12,0,k)}
      else if(motion==='hop'){dx=lerp(-1.6,0,k);dy=-.22*Math.abs(Math.sin(Math.PI*k*3.5))}
      else if(motion==='walk'){dx=lerp(-1.6,0,ease(k))}
      else if(motion==='swim'){[dx,dy]=path([[0,-1.7,.08],[.5,-.6,-.06],[1,0,0]],ease(k))}
      else {const s=lerp(.6,1,ease(k));sx=sy=s;alpha=k}
    }
    const P=Math.PI*2;
    if(motion==='fly'){const f=(1-Math.cos(P*t/.34))/2;sx*=1+.05*f;sy*=1-.16*f;dy+=-.06*(1-Math.cos(P*t/2.4))/2}
    else if(motion==='hop'){const f=Math.sin(Math.PI*((t/.62)%1));dy+=-.16*f*f;sx*=1.06-.1*f;sy*=.94+.1*f}
    else if(motion==='walk'){rot+=3*Math.sin(P*t/.55);dy+=-.03*Math.abs(Math.sin(P*t/.55))}
    else if(motion==='swim'){rot+=7*Math.sin(P*t/1.2);dy+=-.035*(1-Math.cos(P*t/1.2))}
    else if(motion==='stand'){dy+=-.04*(1-Math.cos(P*t/1.6))/2}
    return {dx,dy,sx,sy,rot,alpha};
  }
  function drawActor(g,im,c,t,enter){
    if(!im)return;
    const bw=W*.34,bh=H*.62,bx=W*.05,by=H-H*(c.motion==='fly'?.26:.04)-bh;
    const p=pose(c.motion,t,enter);
    const k=Math.min(bw/im.width,bh/im.height),dw=im.width*k,dh=im.height*k;
    g.save();g.globalAlpha=p.alpha;
    g.translate(bx+bw/2+p.dx*bw,by+bh+p.dy*bh);           // bottom centre of the box
    g.rotate(p.rot*Math.PI/180);g.scale(p.sx*(c.mirror?-1:1),p.sy);
    g.shadowColor='rgba(0,0,0,.18)';g.shadowOffsetY=4;g.shadowBlur=4;
    g.drawImage(im,-dw/2,-dh,dw,dh);g.restore();
  }
  function bubble(g,name,text,t){
    const {wrap,rr,FONT}=D();
    const x=W*.38,y=H*.06,w=W*.58,pad=24;
    g.font='500 34px '+FONT;const lines=wrap(g,text,w-pad*2).slice(0,6);
    const h=pad*2+36+lines.length*50;
    const pop=Math.min(1,t/.3),s=.9+.1*pop;
    g.save();g.globalAlpha=.3+.7*pop;g.translate(x+w/2,y+h/2);g.scale(s,s);g.translate(-(x+w/2),-(y+h/2));
    g.fillStyle='#FFFDF5';g.strokeStyle='#1B2A30';g.lineWidth=4;rr(g,x,y,w,h,26);g.fill();g.stroke();
    g.fillStyle='rgba(27,42,48,.7)';g.font='700 26px '+FONT;g.fillText(name,x+pad,y+pad+24);
    g.fillStyle='#1B2A30';g.font='500 34px '+FONT;lines.forEach((l,i)=>g.fillText(l,x+pad,y+pad+36+38+i*50));
    g.restore();
  }
  function card(g,lines,sub){
    const {wrap,FONT}=D();
    g.fillStyle='#B98A4E';g.fillRect(0,0,W,H);g.fillStyle='#1E4B47';D().rr(g,24,24,W-48,H-48,22);g.fill();
    g.textAlign='center';g.fillStyle='#F2F7EE';g.font='800 64px '+FONT;
    const L=wrap(g,lines,W-160).slice(0,3);L.forEach((l,i)=>g.fillText(l,W/2,H/2-40-(L.length-1)*44+i*88));
    g.font='500 34px '+FONT;g.fillStyle='#F0AC12';(sub||[]).forEach((s,i)=>g.fillText(s,W/2,H/2+90+i*50));
    g.textAlign='left';
  }

  /* w: work; castOf(who) → character; getAudio(aud) → Promise<Blob|null>; onProgress(fraction).
     Returns {blob, ext, type}. */
  async function make(w,castOf,getAudio,onProgress,signal){
    const type=pickType();if(!supported()||!type)throw new Error('unsupported');
    try{await Promise.all(['800','500','700'].map(x=>document.fonts.load(x+' 40px "Noto Sans Malayalam"')))}catch(e){}
    const AC=window.AudioContext||window.webkitAudioContext,ac=new AC();
    // preload characters and voices, and build the timeline
    const imgs={},segs=[];let t=2.6;                       // title card first
    for(const sc of w.scenes||[])for(const ln of sc.lines){
      const c=castOf(ln.who);
      if(!(ln.who in imgs))imgs[ln.who]=await D().img(c.img||D().svgSrc(c.svg));
      let buf=null;
      if(ln.aud&&getAudio){try{const b=await getAudio(ln.aud);if(b)buf=await ac.decodeAudioData(await b.arrayBuffer())}catch(e){buf=null}}
      const dur=buf?buf.duration+.7:Math.max(2.6,(ln.text||'').length*.095);
      segs.push({sc,ln,c,buf,start:t,dur:Math.max(dur,1.2)});t+=Math.max(dur,1.2);
    }
    const total=t+2.4;                                      // end card
    // mark where the character flies/walks in (new speaker or new scene)
    let lastKey=null,enterAt=0;segs.forEach(s=>{const key=s.sc.place+'|'+(w.scenes||[]).indexOf(s.sc)+'|'+s.ln.who;s.enter=key!==lastKey;if(s.enter)enterAt=s.start;s.since=enterAt;lastKey=key});

    const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
    const dest=ac.createMediaStreamDestination();
    // a silent tone from the very start: some browsers drop the video until the first sound arrives
    const hush=ac.createGain();hush.gain.value=0.0001;const osc=ac.createOscillator();osc.frequency.value=40;osc.connect(hush);hush.connect(dest);osc.start();
    const stream=new MediaStream([...cv.captureStream(FPS).getVideoTracks(),...dest.stream.getAudioTracks()]);
    const rec=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:2500000,audioBitsPerSecond:96000});
    const chunks=[];rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
    const stopped=new Promise(res=>{rec.onstop=res});
    if(ac.state==='suspended')await ac.resume();

    const title=w.title||'',by='എഴുതിയത്: '+(w.child||'')+' · ക്ലാസ് 4';
    let started=null,played=new Set(),seg0=0;
    function frame(now){
      const T=(now-started)/1000;
      if(T<2.6){card(g,title,[by])}
      else if(T>=total-2.4){card(g,'ശുഭം',[title,by])}
      else{
        while(seg0<segs.length-1&&T>=segs[seg0+1].start)seg0++;
        const s=segs[seg0];D().place(g,s.sc.place,0,0,W,H);
        drawActor(g,imgs[s.ln.who],s.c,T-s.since,s.enter||T-s.since<ENTER[s.c.motion]);
        bubble(g,s.c.name,s.ln.text||'',T-s.start);
        if(s.buf&&!played.has(seg0)){played.add(seg0);const src=ac.createBufferSource();src.buffer=s.buf;src.connect(dest);src.start()}
      }
      onProgress&&onProgress(Math.min(1,T/total));
      return T<total;
    }
    // draw the first frame before recording starts so the video does not open black
    card(g,title,[by]);
    rec.start(1000);started=performance.now();
    await new Promise((res,rej)=>{
      // setInterval keeps going when requestAnimationFrame would pause; the screen should stay on anyway
      const iv=setInterval(()=>{
        if(signal&&signal.aborted){clearInterval(iv);rej(new Error('aborted'));return}
        if(!frame(performance.now())){clearInterval(iv);res()}
      },1000/FPS);
    }).catch(e=>{try{rec.stop()}catch(x){}ac.close();throw e});
    await new Promise(r=>setTimeout(r,300));
    rec.stop();await stopped;stream.getTracks().forEach(tr=>tr.stop());ac.close();
    const blob=new Blob(chunks,{type:type.split(';')[0]});
    return {blob,ext:/mp4/.test(type)?'mp4':'webm',type:type.split(';')[0],seconds:Math.round(total)};
  }
  function fileName(w,ext){return KKPdf.fileName(w).replace(/\.pdf$/,'.'+ext)}
  return {make,supported,willBeMp4,fileName};
})();
