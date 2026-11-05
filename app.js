const $=id=>document.getElementById(id);
let stream=null,facing='user',shots=[],busy=false;
const video=$('video'),canvas=$('strip'),ctx=canvas.getContext('2d');
function say(t){$('status').textContent=t}
async function camera(){
 try{
  if(stream)stream.getTracks().forEach(t=>t.stop());
  stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:facing,width:{ideal:1280},height:{ideal:720}}});
  video.srcObject=stream;$('cameraHint').style.display='none';$('capture').disabled=false;$('switchCamera').disabled=false;
  say('Kamera aktif. Siap berfoto.');
 }catch(e){say('Kamera gagal dibuka. Pastikan izin kamera diberikan dan aplikasi dibuka melalui HTTPS atau localhost.');}
}
$('startCamera').onclick=camera;
$('switchCamera').onclick=()=>{facing=facing==='user'?'environment':'user';camera()};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function countdown(seconds){
 const el=$('countdown');el.style.display='block';
 for(let n=seconds;n>0;n--){el.textContent=n;await wait(1000)}
 el.textContent='📸';await wait(350);el.style.display='none';
}
function snap(){
 const c=document.createElement('canvas');c.width=1000;c.height=750;const x=c.getContext('2d');
 // Mirror the front-facing camera for a natural selfie preview.
 if(facing==='user'){x.translate(c.width,0);x.scale(-1,1)}
 x.drawImage(video,0,0,c.width,c.height);return c;
}
$('capture').onclick=async()=>{
 if(busy||!stream)return;busy=true;$('capture').disabled=true;shots=[];
 const count=Number($('photoCount').value),timer=Number($('timer').value);
 for(let i=0;i<count;i++){say(`Foto ${i+1} dari ${count}…`);await countdown(timer);shots.push(snap());await wait(550)}
 renderStrip();$('result').style.display='block';say('Selesai! Hasil foto siap disimpan atau dicetak.');$('capture').disabled=false;busy=false;
};
function renderStrip(){
 const n=shots.length,w=800,photoH=520,gap=22,top=180,bottom=220;
 canvas.width=w;canvas.height=top+n*photoH+(n-1)*gap+bottom;
 ctx.fillStyle='#ffd329';ctx.fillRect(0,0,w,canvas.height);
 ctx.fillStyle='#171717';ctx.fillRect(22,22,w-44,canvas.height-44);
 ctx.fillStyle='#ffd329';ctx.fillRect(38,38,w-76,canvas.height-76);
 ctx.fillStyle='#171717';ctx.textAlign='center';ctx.font='1000 64px system-ui';ctx.fillText('SEBLAK STORY',w/2,112);
 ctx.font='bold 24px system-ui';ctx.fillText('SETIAP MANGKOK PUNYA CERITA',w/2,151);
 let y=top;
 shots.forEach(s=>{
  ctx.fillStyle='#171717';ctx.fillRect(52,y-8,w-104,photoH+16);
  // Crop to fill a 696 x 520 photo area.
  const sw=s.width,sh=s.height,ratio=696/520,sr=sw/sh;
  let sx=0,sy=0,ssw=sw,ssh=sh;
  if(sr>ratio){ssw=sh*ratio;sx=(sw-ssw)/2}else{ssh=sw/ratio;sy=(sh-ssh)/2}
  ctx.drawImage(s,sx,sy,ssw,ssh,52,y,696,photoH);y+=photoH+gap;
 });
 const guest=$('guestName').value.trim();
 ctx.fillStyle='#171717';ctx.textAlign='center';ctx.font='bold 30px system-ui';ctx.fillText(guest?guest.toUpperCase():'MOMEN SERU BERSAMA KAMI',w/2,canvas.height-125);
 ctx.font='bold 23px system-ui';ctx.fillText('Jl. Supriadi depan gg Bahra',w/2,canvas.height-82);
 ctx.font='20px system-ui';ctx.fillText(new Date().toLocaleDateString('id-ID'),w/2,canvas.height-48);
 $('thumbs').innerHTML='';shots.forEach(s=>{const im=document.createElement('img');im.className='thumb';im.src=s.toDataURL();$('thumbs').append(im)});
}
$('save').onclick=()=>{const a=document.createElement('a');a.download='Seblak-Story-Photobooth.png';a.href=canvas.toDataURL('image/png');a.click()};
$('print').onclick=()=>window.print();
$('retake').onclick=()=>{$('result').style.display='none';shots=[];say('Siap foto ulang.')};
$('fullscreen').onclick=()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.()};
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));