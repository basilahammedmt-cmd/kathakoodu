/* കഥക്കൂട് — makes an A5 PDF book on the phone. Each page is drawn on a canvas (so Malayalam is shaped by
   the browser itself) and put into the PDF as a picture with jsPDF. Shared by app.js and view.js. */
"use strict";
const KKPdf=(function(){
  const JSPDF='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  const W=874,H=1240;                       // A5 at ~150 dpi
  const FONT='"Noto Sans Malayalam","Manjari",sans-serif';
  const INK='#16303A',BOARD='#1E4B47',WOOD='#B98A4E',CRAYON='#F0AC12',RULE='#CFE0EC',MARGIN='#D9534B';

  function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('lib'));document.head.appendChild(s)})}
  async function lib(){if(!(window.jspdf&&window.jspdf.jsPDF))await loadScript(JSPDF);return window.jspdf.jsPDF}
  function img(src){return new Promise(res=>{if(!src)return res(null);const i=new Image();if(!/^data:/.test(src))i.crossOrigin='anonymous';i.onload=()=>res(i);i.onerror=()=>res(null);i.src=src})}
  function svgSrc(svg){if(!/xmlns=/.test(svg))svg=svg.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"');return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)}
  function canvas(){const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,W,H);return [c,g]}
  function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
  function wrap(g,text,maxW){
    const out=[];
    String(text).split(/\n/).forEach(par=>{let line='';
      par.split(/\s+/).filter(Boolean).forEach(word=>{const t=line?line+' '+word:word;if(g.measureText(t).width>maxW&&line){out.push(line);line=word}else line=t});
      out.push(line)});
    return out;
  }
  function circle(g,x,y,r,col){g.fillStyle=col;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill()}
  // the five places, roughly as the CSS draws them
  function place(g,p,x,y,w,h){
    g.save();rr(g,x,y,w,h,28);g.clip();
    const sky={forest:'#bfe7f5',river:'#cfeefa',school:'#d5eefb',home:'#ffe6c2'}[p];
    const ground={forest:'#7cc46a',river:'#8fd07a',school:'#d9c08a',home:'#9bcf7c'}[p];
    const gl={forest:.62,river:.58,school:.66,home:.66}[p]||.62;
    if(p==='sky'){const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,'#8fd0f5');gr.addColorStop(1,'#d8f1fd');g.fillStyle=gr;g.fillRect(x,y,w,h);
      circle(g,x+w*.8,y+h*.22,h*.12,'#ffd84d');g.fillStyle='#fff';g.beginPath();g.ellipse(x+w*.24,y+h*.3,w*.13,h*.09,0,0,7);g.fill();g.beginPath();g.ellipse(x+w*.56,y+h*.52,w*.11,h*.08,0,0,7);g.fill()}
    else{g.fillStyle=sky;g.fillRect(x,y,w,h*gl);g.fillStyle=ground;g.fillRect(x,y+h*gl,w,h*(1-gl))}
    if(p==='forest'){circle(g,x+w*.14,y+h*.46,h*.3,'#2f8f4e');circle(g,x+w*.86,y+h*.42,h*.34,'#3aa35c');circle(g,x+w*.62,y+h*.3,h*.22,'#57b56f')}
    if(p==='river'){g.fillStyle='#5fb6e6';g.beginPath();g.ellipse(x+w*.5,y+h*.92,w*.46,h*.3,0,0,7);g.fill()}
    if(p==='school'){g.fillStyle='#c9543e';g.fillRect(x+w*.3,y+h*.2,w*.4,h*.46);g.fillStyle='#f6e3b4';g.fillRect(x+w*.36,y+h*.42,w*.28,h*.24)}
    if(p==='home'){g.fillStyle='#f4e2bd';g.fillRect(x+w*.28,y+h*.4,w*.44,h*.3);g.fillStyle='#b5533c';g.beginPath();g.moveTo(x+w*.22,y+h*.42);g.lineTo(x+w*.5,y+h*.14);g.lineTo(x+w*.78,y+h*.42);g.closePath();g.fill()}
    g.restore();
  }
  async function drawActor(g,c,x,y,w,h){
    if(!c)return;const im=await img(c.img||svgSrc(c.svg));if(!im)return;
    const k=Math.min(w/im.width,h/im.height),dw=im.width*k,dh=im.height*k,dx=x+(w-dw)/2,dy=y+h-dh;
    g.save();if(c.mirror){g.translate(dx+dw,dy);g.scale(-1,1);g.drawImage(im,0,0,dw,dh)}else g.drawImage(im,dx,dy,dw,dh);g.restore();
  }
  function footer(g,n,title){g.fillStyle='#577079';g.font='22px '+FONT;g.textAlign='center';g.fillText(n+'   ·   '+title,W/2,H-40);g.textAlign='left'}

  async function cover(w,castOf){
    const [c,g]=canvas();
    g.fillStyle=WOOD;g.fillRect(0,0,W,H);g.fillStyle=BOARD;rr(g,28,28,W-56,H-56,24);g.fill();
    g.fillStyle='#F2F7EE';g.textAlign='center';
    g.font='500 34px '+FONT;g.fillText(KINDS[w.kind]||'കഥ',W/2,250);
    g.font='800 70px '+FONT;const lines=wrap(g,w.title||'',W-180);lines.forEach((l,i)=>g.fillText(l,W/2,360+i*96));
    let y=360+lines.length*96+40;
    g.font='500 38px '+FONT;g.fillText('എഴുതിയത്: '+(w.child||''),W/2,y);g.font='30px '+FONT;g.fillText('ക്ലാസ് 4',W/2,y+56);
    const first=(w.scenes||[])[0];await drawActor(g,castOf(first&&first.lines[0]?first.lines[0].who:'mittu'),W/2-150,H-470,300,300);
    g.fillStyle=CRAYON;g.font='700 30px '+FONT;g.fillText('കഥക്കൂട്',W/2,H-90);g.textAlign='left';
    return c;
  }
  async function photoPage(w,photo,n){
    const [c,g]=canvas();g.fillStyle='#577079';g.font='28px '+FONT;g.fillText('കുട്ടിയുടെ സ്വന്തം കൈയക്ഷരത്തിൽ',70,100);
    const im=await img(photo);if(im){const mw=W-140,mh=H-260,k=Math.min(mw/im.width,mh/im.height);g.drawImage(im,70+(mw-im.width*k)/2,140,im.width*k,im.height*k)}
    footer(g,n,w.title);return c;
  }
  async function storyPage(w,text,sc,castOf,n){
    const [c,g]=canvas();
    g.fillStyle=MARGIN;g.globalAlpha=.6;g.fillRect(52,0,3,H);g.globalAlpha=1;
    let top=70;
    if(sc){place(g,sc.place,80,top,W-150,470);const who=sc.lines[0]?castOf(sc.lines[0].who):null;await drawActor(g,who,110,top+90,260,360);top+=520}
    g.font='36px '+FONT;g.fillStyle=INK;const lh=66;const lines=wrap(g,text,W-170);
    let y=top+60;
    for(const l of lines){if(y>H-110)break;g.strokeStyle=RULE;g.lineWidth=2;g.beginPath();g.moveTo(80,y+16);g.lineTo(W-70,y+16);g.stroke();g.fillText(l,90,y);y+=lh}
    footer(g,n,w.title);return c;
  }

  /* w: the work; castOf(who) → character; photo: data URL or null. Returns a PDF Blob. */
  async function make(w,castOf,photo,onProgress){
    try{await Promise.all([document.fonts.load('800 40px "Noto Sans Malayalam"'),document.fonts.load('400 40px "Noto Sans Malayalam"'),document.fonts.load('500 40px "Noto Sans Malayalam"')])}catch(e){}
    const jsPDF=await lib();
    const pages=[await cover(w,castOf)];let n=2;
    if(photo)pages.push(await photoPage(w,photo,n++));
    const paras=(w.text||'').split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean);
    const sc=w.scenes||[];
    if(!paras.length&&sc.length)sc.forEach(s=>paras.push(s.lines.map(l=>l.text).join('\n')));
    for(let i=0;i<paras.length;i++){pages.push(await storyPage(w,paras[i],sc[Math.min(i,sc.length-1)],castOf,n++));onProgress&&onProgress(i+1,paras.length)}
    const pdf=new jsPDF({unit:'mm',format:'a5',orientation:'portrait',compress:true});
    pages.forEach((cv,i)=>{if(i)pdf.addPage('a5','portrait');pdf.addImage(cv.toDataURL('image/jpeg',.86),'JPEG',0,0,148,210)});
    pdf.setProperties({title:w.title||'കഥ',author:w.child||'',creator:'കഥക്കൂട്'});
    return pdf.output('blob');
  }
  // ASCII only: some phones refuse Malayalam file names and save as "download"
  function fileName(w){const d=new Date(w.created||Date.now()),p=n=>String(n).padStart(2,'0');return 'kathakoodu-'+d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'-'+String(w.id||'').replace(/[^a-z0-9]/gi,'').slice(-4)+'.pdf'}
  return {make,fileName};
})();
