# ORDER-ajimaru
index.html


<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Harbor & Hearth QR Order + POS</title>
<style>
:root{box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);--bg:#f7f4ef;--card:#fff;--tx:#1e2a32;--mut:#6b7780;--ac:#0f5c7a;--bd:#ddd6ca;--ok:#2f7d4f;--warn:#c27a10}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#14191d;--card:#1e262c;--tx:#eceae4;--mut:#9aa6ae;--ac:#5bb5d6;--bd:#33404a;--ok:#5fc283;--warn:#e8a73c}}
:root[data-theme="dark"]{--bg:#14191d;--card:#1e262c;--tx:#eceae4;--mut:#9aa6ae;--ac:#5bb5d6;--bd:#33404a;--ok:#5fc283;--warn:#e8a73c}
html{scroll-padding-top:env(safe-area-inset-top,0px)}
body{margin:0;background:var(--bg);color:var(--tx);font:15px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif}
nav{display:flex;gap:6px;padding:10px;background:var(--card);border-bottom:1px solid var(--bd);overflow-x:auto}
nav b{margin-right:auto;white-space:nowrap;align-self:center}
button,select,input{font:inherit;color:inherit;background:var(--card);border:1px solid var(--bd);border-radius:8px;padding:7px 12px}
button{cursor:pointer}button.p{background:var(--ac);color:#fff;border-color:var(--ac)}
nav button.on{background:var(--ac);color:#fff}
main{max-width:980px;margin:0 auto;padding:14px}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px}
.c{background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:12px}
.e{font-size:34px}.m{color:var(--mut)}.r{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:4px 0}
.tag{padding:2px 9px;border-radius:99px;font-size:12px;color:#fff}
.new{background:var(--ac)}.preparing{background:var(--warn)}.served{background:var(--ok)}
.timer{display:inline-block;padding:4px 8px;border-radius:999px;font-size:12px;font-weight:700;background:#eaf5eb;color:var(--ok)}
.timer.warn{background:#fff1d6;color:var(--warn)}
.timer.danger{background:#ffe5e5;color:#b42318}
.qr svg{width:100%;height:auto;background:#fff;padding:6px;border-radius:6px;box-sizing:border-box}
.qr{text-align:center}
#ticket{display:none}
.receipt-paper{max-width:360px;margin:0 auto;padding:20px;background:var(--card);border:1px solid var(--bd);color:var(--tx)}
.receipt-title{text-align:center;margin:16px 0;font-size:24px}
.receipt-label{text-align:center;font-size:13px;color:var(--mut)}
.receipt-recipient{display:flex;align-items:baseline;gap:6px;margin:14px 0 18px;font-size:13px}
.receipt-recipient-name{white-space:nowrap}
.receipt-recipient-line{flex:1;min-width:80px;height:1em;border-bottom:1px solid #666}
.receipt-name-input{width:100%;box-sizing:border-box;margin-bottom:10px}
.receipt-meta{font-size:13px;color:var(--mut);text-align:right}
.receipt-items{margin:16px 0;border-top:1px dashed var(--bd);border-bottom:1px dashed var(--bd);padding:8px 0}
.receipt-total{margin-top:8px;padding-top:8px;border-top:1px solid var(--bd);font-size:20px}
.receipt-thanks{text-align:center;margin:18px 0 8px;font-size:13px}
@media print{body.tk main,body.tk nav{display:none}body.tk #ticket{display:block;width:72mm;font:14px monospace;color:#000}}
@media print{nav,.noprint{display:none}body{background:#fff;color:#000}}
@media print{.receipt-paper{width:72mm;max-width:72mm;box-sizing:border-box;margin:0 auto;padding:4mm;border:0;background:#fff;color:#000;font:12px/1.5 monospace}.receipt-meta{color:#000}.receipt-items{border-color:#888}.receipt-total{border-color:#000;font-size:18px}.receipt-thanks{margin-top:6mm}}
</style></head><body>
<nav><b>⚓ あじまるや & 中島駅</b>
<button id="b-customer" onclick="go('customer')">Customer</button>
<button id="b-kitchen" onclick="go('kitchen')">Kitchen</button>
<button id="b-register" onclick="go('register')">Register 会計</button>
<button id="b-qr" onclick="go('qr')">QR Sheet</button></nav>
<main id="app"></main><div id="ticket"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"></script>
<script>
const MENU=[
 {id:1,cat:'定食',n:'唐揚げ定食',p:800,e:''},
 {id:2,cat:'定食',n:'あじまる唐揚げ定食',p:900,e:''},
 {id:3,cat:'定食',n:'とんかつ定食',p:880,e:''},
 {id:4,cat:'定食',n:'みそとんかつ定食',p:900,e:''},
 {id:5,cat:'定食',n:'アジフライ定食',p:850,e:''},
 {id:6,cat:'定食',n:'ミックスフライ定食',p:920,e:''},
 {id:7,cat:'定食',n:'プレーンナンセット',p:770,e:''},
 {id:8,cat:'サブメニュー',n:'ご飯 小',p:150,e:'🍚'},
 {id:9,cat:'サブメニュー',n:'ご飯 中',p:200,e:'🍚'},
 {id:10,cat:'サブメニュー',n:'ご飯 大',p:250,e:'🍚'},
 {id:15,cat:'サブメニュー',n:'その他',p:100,e:''},
 {id:14,cat:'ドリンク',n:'生ビール',p:500,e:'🍺'}
];
const yen=n=>'¥'+Math.round(n).toLocaleString();
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const menuGroups=()=>[
  ['定食', MENU.filter(m=>m.cat==='定食')],
  ['サブメニュー', MENU.filter(m=>m.cat==='サブメニュー')],
  ['ドリンク', MENU.filter(m=>m.cat==='ドリンク')]
];
let orders=[],view='customer',table=1,cart={},riceLarge={},naanSpice='',otherPreset='',otherName='',otherPrice=100,sel=null,receipt=null,bc=null,guestType='All',adultCount=2,childCount=0,allergy='なし';
try{bc=new BroadcastChannel('hh')}catch(e){}
function load(){try{orders=JSON.parse(localStorage.getItem('hh_orders')||'[]')}catch(e){orders=[]}try{receiptHistory=JSON.parse(localStorage.getItem('hh_receipts')||'[]')}catch(e){receiptHistory=[]}}
function save(){try{localStorage.setItem('hh_orders',JSON.stringify(orders))}catch(e){}if(bc)bc.postMessage(1)}
if(bc)bc.onmessage=()=>{load();draw()};
addEventListener('storage',()=>{load();draw()});
function go(v){view=v;draw()}
function renderQrCell(el, value){
  if(typeof qrcode === 'function'){
    const q=qrcode(0,'M');
    q.addData(value);
    q.make();
    el.innerHTML=q.createSvgTag(4);
    return;
  }
  const img=document.createElement('img');
  img.alt='QR code';
  img.style.width='100%';
  img.style.height='auto';
  img.style.display='block';
  img.src='https://api.qrserver.com/v1/create-qr-code/?size=220x220&data='+encodeURIComponent(value);
  el.replaceChildren(img);
}
function draw(){
 ['customer','kitchen','register','qr'].forEach(v=>document.getElementById('b-'+v).className=v==view?'on':'');
 document.getElementById('app').innerHTML=({customer,kitchen,register,qr})[view]();
 autoPrint();
 if(view=='qr')document.querySelectorAll('[data-q]').forEach(d=>renderQrCell(d, customerUrl(d.dataset.q)));
}
const base=()=>location.href.split('#')[0];
const customerUrl=(tableNo)=>{
  const url = new URL(base(), window.location.href);
  url.hash = `#t=${tableNo}`;
  return url.toString();
};
const total=o=>o.items.reduce((s,i)=>s+i.p*i.q,0);
function countdownInfo(ts){
  const remainingMs=Math.max(0,20*60*1000-(Date.now()-ts));
  const totalSec=Math.ceil(remainingMs/1000);
  const min=Math.floor(totalSec/60);
  const sec=totalSec%60;
  const label=`${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  let tone='timer';
  if(totalSec<=5*60)tone='timer warn';
  if(totalSec<=2*60)tone='timer danger';
  return {label,tone};
}
// Customer
function customer(){
 const cnt=Object.values(cart).reduce((a,b)=>a+b,0),sum=MENU.reduce((s,m)=>s+(m.id===15?otherPrice:m.p)*(cart[m.id]||0)+100*(riceLarge[m.id]||0),0),totalPeople=adultCount+childCount;
 const mine=orders.filter(o=>o.table==table&&!o.paid);
 return `<div class="r" style="flex-wrap:wrap"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><h2 style="margin:0">Table ${table}</h2><select onchange="table=+this.value;draw()">${Array.from({length:40},(_,i)=>`<option ${i+1==table?'selected':''}>${i+1}</option>`).join('')}</select></div><label class="m" style="display:flex;align-items:center;gap:8px">Gender<select onchange="guestType=this.value;draw()"><option ${guestType=='All'?'selected':''}>All</option><option ${guestType=='Men'?'selected':''}>Men</option><option ${guestType=='Women'?'selected':''}>Women</option></select></label><label class="m" style="display:flex;align-items:center;gap:8px">大人<select onchange="adultCount=+this.value;draw()">${Array.from({length:10},(_,i)=>`<option value="${i+1}" ${adultCount==i+1?'selected':''}>${i+1}</option>`).join('')}</select></label><label class="m" style="display:flex;align-items:center;gap:8px">子ども<select onchange="childCount=+this.value;draw()">${Array.from({length:10},(_,i)=>`<option value="${i}" ${childCount==i?'selected':''}>${i}</option>`).join('')}</select></label><label class="m" style="display:flex;align-items:center;gap:8px">アレルギー<select onchange="allergy=this.value;draw()"><option ${allergy=='なし'?'selected':''}>なし</option><option ${allergy=='あり'?'selected':''}>あり</option></select></label></div>
 <div class="c" style="margin:10px 0"><div class="m" style="font-size:12px;margin-bottom:6px">Table info</div><div class="r" style="margin:0"><span>大人 ${adultCount} · 子ども ${childCount} · ${guestType}</span><span>アレルギー ${allergy}</span></div></div>
 ${mine.length?`<div class="c" style="margin-bottom:10px"><b>Your orders</b>${mine.map(o=>`<div class="r"><span>#${o.id} · 大人 ${o.adultCount || adultCount} · 子ども ${o.childCount || childCount} · ${o.guestType||'All'} · アレルギー ${o.allergy || 'なし'} · ${o.items.map(i=>i.n+'×'+i.q).join(', ')}</span><span class="tag ${o.status}">${o.status=='new'?'Received':o.status=='preparing'?'Preparing':'Served'}</span></div>`).join('')}</div>`:''}
 ${menuGroups().map(([cat,items])=>`<div style="margin-top:14px"><div class="m" style="font-weight:700;margin-bottom:8px">${cat}</div><div class="g">${items.map(m=>`<div class="c"><div class="e">${m.e}</div><b>${m.n}</b>${m.id===15?`<label style="display:block;margin-top:8px">内容 <select onchange="setOtherPreset(this.value)"><option value="" ${otherPreset===''?'selected':''}>選択してください</option>${MENU.filter(item=>item.cat==='定食').map(item=>`<option value="${item.id}" ${otherPreset==item.id?'selected':''}>${item.id} ${item.n} ${yen(item.p)}</option>`).join('')}</select></label><label style="display:block;margin-top:8px">料金（円） <input type="number" min="0" step="1" value="${otherPrice}" onchange="otherPrice=Math.max(0,Math.round(+this.value||0));draw()"></label>`:`<div class="m">${yen(m.p)}</div>`}${m.cat==='定食'?`<label style="display:block;margin-top:8px">ご飯大盛り <select onchange="riceLarge[${m.id}]=+this.value;draw()"><option value="0" ${!(riceLarge[m.id]||0)?'selected':''}>0個（普通）</option>${Array.from({length:cart[m.id]||0},(_,i)=>i+1).map(q=>`<option value="${q}" ${riceLarge[m.id]===q?'selected':''}>${q}個を大盛り</option>`).join('')}</select> +${yen(100)} / 個</label>`:''}${m.id===7?`<label style="display:block;margin-top:8px">辛さ <select onchange="naanSpice=this.value;draw()"><option value="" ${naanSpice===''?'selected':''}>選択</option>${[0,1,2].map(level=>`<option value="${level}" ${naanSpice==level?'selected':''}>${level}</option>`).join('')}</select></label>`:''}<div class="r"><button onclick="qty(${m.id},-1)">−</button><b>${cart[m.id]||0}</b><button onclick="qty(${m.id},1)">+</button></div></div>`).join('')}</div></div>`).join('')}
 <div class="c r" style="margin-top:12px"><b>${cnt} items · ${yen(sum)} · ${totalPeople}人</b><button class="p" ${cnt?'':'disabled'} onclick="send()">Send order</button></div>`}
function qty(id,d){cart[id]=Math.max(0,(cart[id]||0)+d);riceLarge[id]=Math.min(riceLarge[id]||0,cart[id]);draw()}
function setOtherPreset(id){const item=MENU.find(m=>m.id===Number(id));otherPreset=item?String(item.id):'';otherName=item?item.n:'';otherPrice=item?item.p:100;draw()}
function send(){const items=MENU.filter(m=>cart[m.id]).flatMap(m=>{const largeQty=m.cat==='定食'?Math.min(riceLarge[m.id]||0,cart[m.id]):0,normalQty=cart[m.id]-largeQty,spice=m.id===7&&naanSpice!==''?`（辛さ ${naanSpice}）`:'';const price=m.id===15?otherPrice:m.p,name=m.id===15?(otherName||m.n):m.n;return [normalQty?{n:name+spice,p:price,q:normalQty}:null,largeQty?{n:name+'（ご飯大）'+spice,p:price+100,q:largeQty}:null].filter(Boolean)});if(!items.length)return;
 load();orders.push({id:(orders.reduce((a,o)=>Math.max(a,o.id),0)+1),table,items,status:'new',paid:false,guestType,adultCount,childCount,allergy,t:Date.now()});cart={};riceLarge={};naanSpice='';otherPreset='';otherName='';otherPrice=100;save();draw()}
// Kitchen
let auto=true;
function ticketHTML(o){return `<b style="font-size:22px">Table ${o.table}</b> &nbsp;#${o.id}<br>${new Date(o.t).toLocaleTimeString()}<br>大人: ${o.adultCount || 0} / 子ども: ${o.childCount || 0}<br>アレルギー: ${o.allergy || 'なし'}<br>${o.guestType||'All'}<hr>${o.items.map(i=>`<div style="font-size:18px">${i.q}× ${i.n}</div>`).join('')}<hr>`}
function printTicket(id){const o=orders.find(x=>x.id==id);if(!o)return;document.getElementById('ticket').innerHTML=ticketHTML(o);document.body.classList.add('tk');setTimeout(()=>{window.print();document.body.classList.remove('tk');setTimeout(autoPrint,500)},100)}
function autoPrint(){if(view!='kitchen'||!auto||document.body.classList.contains('tk'))return;let done=[];try{done=JSON.parse(localStorage.getItem('hh_printed')||'[]')}catch(e){}
 const n=orders.find(o=>o.status=='new'&&!o.paid&&!done.includes(o.id));if(!n)return;done.push(n.id);try{localStorage.setItem('hh_printed',JSON.stringify(done))}catch(e){}printTicket(n.id)}
function kitchen(){
 const q=orders.filter(o=>o.status!='served'&&!o.paid);
 return `<div class="r"><h2>Kitchen Display</h2><label><input type="checkbox" ${auto?'checked':''} onchange="auto=this.checked;draw()"> Auto-print new orders</label></div>${q.length?'':'<p class="m">No open tickets.</p>'}<div class="g">${q.map(o=>{const cd=countdownInfo(o.t); return `<div class="c"><div class="r"><b>Table ${o.table} · #${o.id}</b><span class="tag ${o.status}">${o.status}</span><span class="${cd.tone}">${cd.label}</span></div><div class="m">大人 ${o.adultCount || 0} · 子ども ${o.childCount || 0} · ${o.guestType || 'All'} · アレルギー ${o.allergy || 'なし'}</div>${o.items.map(i=>`<div>${i.q}× ${i.n}</div>`).join('')}<div class="m">${new Date(o.t).toLocaleTimeString()} · 20:00 countdown</div><div class="r">${o.status=='new'?`<button class="p" onclick="setS(${o.id},'preparing')">Start cooking</button>`:`<button class="p" onclick="setS(${o.id},'served')">Mark ready / served</button>`}<button onclick="printTicket(${o.id})">Print</button></div></div>`}).join('')}</div>`}
function setS(id,s){load();orders.find(o=>o.id==id).status=s;save();draw()}
// Register
let disc=0,meth='QR pay',receiptHistory=[],showReceiptHistory=false;
function register(){
 if(receipt){const r=receipt;return `<section class="receipt-paper"><div style="text-align:center;font-weight:700">あじまるや</div><div class="receipt-label">レシート</div><h2 class="receipt-title">領収書</h2><label class="noprint">宛名<input class="receipt-name-input" placeholder="宛名を入力" value="${escapeHtml(r.name||'')}" oninput="setReceiptName(this.value)"></label><div class="receipt-recipient"><span>お名前</span><span class="receipt-recipient-name" id="receipt-name-preview">${escapeHtml(r.name||'')}</span><span class="receipt-recipient-line"></span><span>様</span></div><div class="receipt-meta">発行日 ${new Date(r.t).toLocaleString()}<br>テーブル ${r.table}</div><div class="receipt-items">${r.items.map(i=>`<div class="r"><span>${i.n} × ${i.q}</span><span>${yen(i.p*i.q)}</span></div>`).join('')}</div><div class="r"><span>小計</span><span>${yen(r.sub)}</span></div>${r.disc?`<div class="r"><span>割引 (${r.disc}%)</span><span>−${yen(r.sub-r.tot)}</span></div>`:''}<div class="r receipt-total"><b>領収金額</b><b>${yen(r.tot)}</b></div><div class="r"><span>お支払い</span><span>${r.meth}</span></div><div class="receipt-thanks">上記正に領収いたしました</div><div class="r noprint"><button class="p" onclick="window.print()">印刷</button><button onclick="receipt=null;draw()">戻る</button></div></section>`}
 if(showReceiptHistory)return `<div class="r"><h2>領収書履歴</h2><button onclick="showReceiptHistory=false;draw()">戻る</button></div>${receiptHistory.length?receiptHistory.map((r,i)=>`<div class="c r"><span>Table ${r.table} · ${new Date(r.t).toLocaleString()} · ${yen(r.tot)} · ${r.meth}</span><button onclick="openReceipt(${i})">再表示</button></div>`).join(''):'<p class="m">領収書はまだありません。</p>'}`;
 const tabs=[...new Set(orders.filter(o=>!o.paid).map(o=>o.table))].sort((a,b)=>a-b);
 if(!tabs.includes(sel))sel=tabs[0]||null;
 let body='<p class="m">No open tables.</p>';
 if(sel){const os=orders.filter(o=>o.table==sel&&!o.paid),items=os.flatMap(o=>o.items),sub=os.reduce((s,o)=>s+total(o),0),tot=sub*(1-disc/100);
  const orderList=os.map(o=>`<div class="c" style="margin-top:8px"><div class="r"><b>Order #${o.id}</b><button onclick="deleteOrder(${o.id})">Delete</button></div>${o.items.map(i=>`<div class="r"><span>${i.q}× ${i.n}</span><span>${yen(i.p*i.q)}</span></div>`).join('')}<div class="m">大人 ${o.adultCount||0} · 子ども ${o.childCount||0} · ${o.guestType||'All'} · アレルギー ${o.allergy||'なし'}</div></div>`).join('');
  body=`<div class="c">${orderList || '<p class="m">No orders.</p>'}<hr><div class="r"><span>Subtotal</span><span>${yen(sub)}</span></div>
  <div class="r"><span>Discount %</span><input type="number" min="0" max="100" value="${disc}" style="width:80px" onchange="disc=Math.min(100,Math.max(0,+this.value||0));draw()"></div>
  <div class="r"><span>Payment</span><select onchange="meth=this.value">${['Cash','Card','QR pay'].map(m=>`<option ${m==meth?'selected':''}>${m}</option>`).join('')}</select></div>
  <div class="r"><b>Total</b><b>${yen(tot)}</b></div><button class="p" onclick="closeT()">Close table</button></div>`}
 return `<div class="r"><h2>Register 会計</h2><button onclick="showReceiptHistory=true;draw()">領収書履歴 (${receiptHistory.length})</button></div><div class="r" style="justify-content:flex-start;flex-wrap:wrap">${tabs.map(t=>`<button class="${t==sel?'p':''}" onclick="sel=${t};draw()">Table ${t}</button>`).join('')}</div>${body}`}
function setReceiptName(name){if(!receipt)return;receipt.name=name;const index=receiptHistory.indexOf(receipt);if(index>=0)try{localStorage.setItem('hh_receipts',JSON.stringify(receiptHistory))}catch(e){}const preview=document.getElementById('receipt-name-preview');if(preview)preview.textContent=name}
function openReceipt(index){receipt=receiptHistory[index];showReceiptHistory=false;draw()}
function deleteOrder(id){
 load();
 orders = orders.filter(o => o.id !== id);
 save();
 if(sel && !orders.some(o => o.table === sel && !o.paid)) {
   const tabs=[...new Set(orders.filter(o=>!o.paid).map(o=>o.table))].sort((a,b)=>a-b);
   sel = tabs[0] || null;
 }
 draw();
}
function closeT(){load();const os=orders.filter(o=>o.table==sel&&!o.paid),sub=os.reduce((s,o)=>s+total(o),0);
 receipt={table:sel,items:os.flatMap(o=>o.items),sub,disc,tot:sub*(1-disc/100),meth,t:Date.now()};receiptHistory.unshift(receipt);try{localStorage.setItem('hh_receipts',JSON.stringify(receiptHistory))}catch(e){}
 os.forEach(o=>{o.paid=true;o.status='served';o.payment={meth,disc,at:Date.now()}});disc=0;save();draw()}
// QR sheet
let qbase='';
function qr(){const b=qbase||base();return `<h2>Table QR Sheet (1–40)</h2><div class="c noprint" style="margin-bottom:10px"><div class="m">Page address customers will open (must be reachable from their phones)</div><input value="${b}" style="width:100%;box-sizing:border-box" onchange="qbase=this.value.trim();draw()">${/^file:/i.test(b)?'<p style="color:var(--warn)">⚠ file:// addresses only work on this PC. Host the page, then paste its public https address here.</p>':''}</div><p class="m noprint">Each QR code opens the Customer page for that table only. <button onclick="window.print()">Print</button></p><div class="g">${Array.from({length:40},(_,i)=>`<div class="c qr"><div data-q="${i+1}"></div><b>Table ${i+1}</b></div>`).join('')}</div>`}
load();
const m=location.hash.match(/t=(\d+)/);if(m){table=Math.min(40,Math.max(1,+m[1]))}
setInterval(()=>{if(view==='kitchen')draw();},1000);
draw();
</script></body></html>

20261008
<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Harbor & Hearth QR Order + POS</title>
<style>
:root{box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);--bg:#f7f4ef;--card:#fff;--tx:#1e2a32;--mut:#6b7780;--ac:#0f5c7a;--bd:#ddd6ca;--ok:#2f7d4f;--warn:#c27a10}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#14191d;--card:#1e262c;--tx:#eceae4;--mut:#9aa6ae;--ac:#5bb5d6;--bd:#33404a;--ok:#5fc283;--warn:#e8a73c}}
:root[data-theme="dark"]{--bg:#14191d;--card:#1e262c;--tx:#eceae4;--mut:#9aa6ae;--ac:#5bb5d6;--bd:#33404a;--ok:#5fc283;--warn:#e8a73c}
html{scroll-padding-top:env(safe-area-inset-top,0px)}
body{margin:0;background:var(--bg);color:var(--tx);font:15px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif}
nav{display:flex;gap:6px;padding:10px;background:var(--card);border-bottom:1px solid var(--bd);overflow-x:auto}
nav b{margin-right:auto;white-space:nowrap;align-self:center}
button,select,input{font:inherit;color:inherit;background:var(--card);border:1px solid var(--bd);border-radius:8px;padding:7px 12px}
button{cursor:pointer}button.p{background:var(--ac);color:#fff;border-color:var(--ac)}
nav button.on{background:var(--ac);color:#fff}
main{max-width:980px;margin:0 auto;padding:14px}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px}
.c{background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:12px}
.e{font-size:34px}.m{color:var(--mut)}.r{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:4px 0}
.tag{padding:2px 9px;border-radius:99px;font-size:12px;color:#fff}
.new{background:var(--ac)}.preparing{background:var(--warn)}.served{background:var(--ok)}
.timer{display:inline-block;padding:4px 8px;border-radius:999px;font-size:12px;font-weight:700;background:#eaf5eb;color:var(--ok)}
.timer.warn{background:#fff1d6;color:var(--warn)}
.timer.danger{background:#ffe5e5;color:#b42318}
.qr svg{width:100%;height:auto;background:#fff;padding:6px;border-radius:6px;box-sizing:border-box}
.qr{text-align:center}
#ticket{display:none}
.receipt-paper{max-width:360px;margin:0 auto;padding:20px;background:var(--card);border:1px solid var(--bd);color:var(--tx)}
.receipt-title{text-align:center;margin:16px 0;font-size:24px}
.receipt-label{text-align:center;font-size:13px;color:var(--mut)}
.receipt-recipient{display:flex;align-items:baseline;gap:6px;margin:14px 0 18px;font-size:13px}
.receipt-recipient-name{white-space:nowrap}
.receipt-recipient-line{flex:1;min-width:80px;height:1em;border-bottom:1px solid #666}
.receipt-name-input{width:100%;box-sizing:border-box;margin-bottom:10px}
.receipt-meta{font-size:13px;color:var(--mut);text-align:right}
.receipt-items{margin:16px 0;border-top:1px dashed var(--bd);border-bottom:1px dashed var(--bd);padding:8px 0}
.receipt-total{margin-top:8px;padding-top:8px;border-top:1px solid var(--bd);font-size:20px}
.receipt-thanks{text-align:center;margin:18px 0 8px;font-size:13px}
@media print{body.tk main,body.tk nav{display:none}body.tk #ticket{display:block;width:72mm;font:14px monospace;color:#000}}
@media print{nav,.noprint{display:none}body{background:#fff;color:#000}}
@media print{.receipt-paper{width:72mm;max-width:72mm;box-sizing:border-box;margin:0 auto;padding:4mm;border:0;background:#fff;color:#000;font:12px/1.5 monospace}.receipt-meta{color:#000}.receipt-items{border-color:#888}.receipt-total{border-color:#000;font-size:18px}.receipt-thanks{margin-top:6mm}}
</style></head><body>
<nav><b>⚓ あじまるや & 中島駅</b>
<button id="b-customer" onclick="openCustomer()">Customer page</button>
<button id="b-menu" onclick="go('menu')">Menu</button>
<button id="b-kitchen" onclick="go('kitchen')">Kitchen</button>
<button id="b-register" onclick="go('register')">Register 会計</button>
<button id="b-qr" onclick="go('qr')">QR Sheet</button>
<button id="b-auth" onclick="toggleStaffAuth()">Staff sign in</button></nav>
<main id="app"></main><div id="ticket"></div>
<script type="module" src="firebase-sync.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"></script>
<script>
let MENU=[
 {id:1,cat:'定食',n:'唐揚げ定食',p:800,e:''},
 {id:2,cat:'定食',n:'あじまる唐揚げ定食',p:900,e:''},
 {id:3,cat:'定食',n:'とんかつ定食',p:880,e:''},
 {id:4,cat:'定食',n:'みそとんかつ定食',p:900,e:''},
 {id:5,cat:'定食',n:'アジフライ定食',p:850,e:''},
 {id:6,cat:'定食',n:'ミックスフライ定食',p:920,e:''},
 {id:7,cat:'ナンセット',n:'プレーンナンセット',p:770,e:''},
 {id:8,cat:'サブメニュー',n:'ご飯 小',p:150,e:'🍚'},
 {id:9,cat:'サブメニュー',n:'ご飯 中',p:200,e:'🍚'},
 {id:10,cat:'サブメニュー',n:'ご飯 大',p:250,e:'🍚'},
 {id:15,cat:'サブメニュー',n:'その他',p:100,e:''},
 {id:14,cat:'ドリンク',n:'生ビール',p:500,e:'🍺'},
 {id:16,cat:'飲み放題ドリンク',n:'その他（飲み物）',p:0,e:'🥤'}
];
const otherDrinkTypes=[{id:1,n:'生'},{id:2,n:'ハイボール'},{id:3,n:'レモンサワー'},{id:4,n:'お茶'},{id:5,n:'麦焼酎'},{id:6,n:'芋焼酎'}];
const shochuOptions=['水割り','お湯割り','お茶割り','ソーダ割り'];
const yen=n=>'¥'+Math.round(n).toLocaleString();
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const menuGroups=()=>[...new Set(['定食','ラーメン','ナンセット','サブメニュー','ドリンク','居酒屋メニュー','飲み放題ドリンク',...MENU.map(m=>m.cat)])].filter(cat=>MENU.some(item=>item.cat===cat)).map(cat=>[cat,MENU.filter(item=>item.cat===cat)]);
let orders=[],view='register',table=1,cart={},riceLarge={},naanSpice='',otherPreset='',otherName='',otherPrice=100,otherDrinkType=0,otherDrinkOption='',otherDrinkPrice=0,sel=null,receipt=null,guestType='All',adultCount=2,childCount=0,allergy='なし',staffSignedIn=false,staffSyncReady=false,staffEmail='',syncError='',menuDraft=[],menuDirty=false,menuSaving=false,menuMessage='';
function load(){try{receiptHistory=JSON.parse(localStorage.getItem('hh_receipts')||'[]')}catch(e){receiptHistory=[]}}
function save(){try{localStorage.setItem('hh_orders',JSON.stringify(orders))}catch(e){}}
window.addEventListener('firebase-sync-ready',()=>{staffSyncReady=true;draw()},{once:true});
window.addEventListener('firebase-auth-changed',event=>{staffSignedIn=event.detail.isStaff;staffEmail=event.detail.email;if(staffSignedIn)window.firebaseSync.ensureMenu(MENU).catch(error=>{syncError=error.message});draw()});
window.addEventListener('firebase-orders',event=>{orders=event.detail.orders;draw()});
window.addEventListener('firebase-menu',event=>{if(Array.isArray(event.detail.menu)){MENU=event.detail.menu;if(!menuDirty)menuDraft=MENU.map(item=>({...item}))}draw()});
window.addEventListener('firebase-sync-error',event=>{syncError=event.detail?.message||'Firebase connection failed.';draw()});
function toggleStaffAuth(){if(!staffSyncReady)return;syncError='';const action=staffSignedIn?window.firebaseSync.signOut():window.firebaseSync.signInStaff();action.catch(error=>{syncError=error.message;draw()})}
function staffGate(){return `<section class="c"><h2>Staff sign-in required</h2><p class="m">Kitchen and register data are available only to the authorized Google account.</p><button class="p" onclick="toggleStaffAuth()">Sign in with Google</button></section>`}
function menuManager(){
 if(!staffSignedIn)return staffGate();
 if(!menuDraft.length)menuDraft=MENU.map(item=>({...item}));
 return `<div class="r"><h2>Menu Manager</h2><div><button onclick="addMenuItem()">Add item</button> <button onclick="cancelMenuDraft()" ${menuDirty?'':'disabled'}>Cancel</button> <button class="p" onclick="saveMenuDraft()" ${menuDirty&&!menuSaving?'':'disabled'}>${menuSaving?'Saving…':'Save menu'}</button></div></div>${menuMessage?`<p class="m" role="status">${escapeHtml(menuMessage)}</p>`:''}<div class="g">${menuDraft.map((item,index)=>`<div class="c"><div class="r"><b>#${item.id}</b><button onclick="removeMenuItem(${index})">Remove</button></div><label style="display:block;margin:8px 0">Name <input value="${escapeHtml(item.n)}" onchange="editMenuItem(${index},'n',this.value)" style="width:100%;box-sizing:border-box"></label><label style="display:block;margin:8px 0">Category <input value="${escapeHtml(item.cat)}" onchange="editMenuItem(${index},'cat',this.value)" style="width:100%;box-sizing:border-box"></label><label style="display:block;margin:8px 0">Price (¥) <input type="number" min="0" step="1" value="${Number(item.p)||0}" onchange="editMenuItem(${index},'p',this.value)" style="width:100%;box-sizing:border-box"></label></div>`).join('')}</div>`;
}
function editMenuItem(index,field,value){menuDraft[index]={...menuDraft[index],[field]:value};menuDirty=true;menuMessage='';draw()}
function addMenuItem(){const id=Math.max(0,...MENU.map(item=>Number(item.id)||0),...menuDraft.map(item=>Number(item.id)||0))+1;menuDraft.push({id,cat:'定食',n:'',p:0,e:''});menuDirty=true;menuMessage='';draw()}
function removeMenuItem(index){menuDraft.splice(index,1);menuDirty=true;menuMessage='';draw()}
function cancelMenuDraft(){menuDraft=MENU.map(item=>({...item}));menuDirty=false;menuMessage='';draw()}
async function saveMenuDraft(){
 const menu=menuDraft.map(item=>({...item,id:Number(item.id),n:String(item.n).trim(),cat:String(item.cat).trim(),p:Number(item.p),e:String(item.e||'')}));
 if(menu.some(item=>!item.n||!item.cat||!Number.isFinite(item.p)||item.p<0)||new Set(menu.map(item=>item.id)).size!==menu.length){menuMessage='Enter a unique item, category, and non-negative price for every row.';draw();return}
 menuSaving=true;menuMessage='';draw();
 try{await window.firebaseSync.saveMenu(menu);MENU=menu;menuDraft=menu.map(item=>({...item}));menuDirty=false;menuMessage='Menu saved.'}
 catch(error){menuMessage=error.message||'Could not save the menu.'}
 menuSaving=false;draw();
}
function go(v){view=v;draw()}
function renderQrCell(el, value){
  if(typeof qrcode === 'function'){
    const q=qrcode(0,'M');
    q.addData(value);
    q.make();
    el.innerHTML=q.createSvgTag(4);
    return;
  }
  const img=document.createElement('img');
  img.alt='QR code';
  img.style.width='100%';
  img.style.height='auto';
  img.style.display='block';
  img.src='https://api.qrserver.com/v1/create-qr-code/?size=220x220&data='+encodeURIComponent(value);
  el.replaceChildren(img);
}
function draw(){
 ['customer','menu','kitchen','register','qr'].forEach(v=>document.getElementById('b-'+v).className=v==view?'on':'');
 const authButton=document.getElementById('b-auth');authButton.textContent=staffSignedIn?`Sign out ${staffEmail}`:staffSyncReady?'Staff sign in':'Connecting…';authButton.disabled=!staffSyncReady;
 document.getElementById('app').innerHTML=(syncError?`<p role="alert" class="m">${escapeHtml(syncError)}</p>`:'')+({customer,menu:menuManager,kitchen,register,qr})[view]();
 autoPrint();
 if(view=='qr')document.querySelectorAll('[data-q]').forEach(d=>renderQrCell(d, customerUrl(d.dataset.q)));
}
const base=()=>location.href.split('#')[0];
function openCustomer(){location.href=customerUrl(table)}
const customerUrl=(tableNo)=>{
  const url = new URL('customer.html', window.location.href);
  url.hash = `#t=${tableNo}`;
  return url.toString();
};
const total=o=>o.items.reduce((s,i)=>s+i.p*i.q,0);
function countdownInfo(ts){
  const remainingMs=Math.max(0,20*60*1000-(Date.now()-ts));
  const totalSec=Math.ceil(remainingMs/1000);
  const min=Math.floor(totalSec/60);
  const sec=totalSec%60;
  const label=`${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  let tone='timer';
  if(totalSec<=5*60)tone='timer warn';
  if(totalSec<=2*60)tone='timer danger';
  return {label,tone};
}
// Customer
function customer(){
 const cnt=Object.values(cart).reduce((a,b)=>a+b,0),sum=MENU.reduce((s,m)=>s+(m.id===15?otherPrice:m.id===16?otherDrinkPrice:m.p)*(cart[m.id]||0)+100*(riceLarge[m.id]||0),0),totalPeople=adultCount+childCount;
 const mine=orders.filter(o=>o.table==table&&!o.paid);
 return `<div class="r" style="flex-wrap:wrap"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><h2 style="margin:0">Table ${table}</h2><select onchange="table=+this.value;draw()">${Array.from({length:40},(_,i)=>`<option ${i+1==table?'selected':''}>${i+1}</option>`).join('')}</select></div><label class="m" style="display:flex;align-items:center;gap:8px">Gender<select onchange="guestType=this.value;draw()"><option ${guestType=='All'?'selected':''}>All</option><option ${guestType=='Men'?'selected':''}>Men</option><option ${guestType=='Women'?'selected':''}>Women</option></select></label><label class="m" style="display:flex;align-items:center;gap:8px">大人<select onchange="adultCount=+this.value;draw()">${Array.from({length:10},(_,i)=>`<option value="${i+1}" ${adultCount==i+1?'selected':''}>${i+1}</option>`).join('')}</select></label><label class="m" style="display:flex;align-items:center;gap:8px">子ども<select onchange="childCount=+this.value;draw()">${Array.from({length:10},(_,i)=>`<option value="${i}" ${childCount==i?'selected':''}>${i}</option>`).join('')}</select></label><label class="m" style="display:flex;align-items:center;gap:8px">アレルギー<select onchange="allergy=this.value;draw()"><option ${allergy=='なし'?'selected':''}>なし</option><option ${allergy=='あり'?'selected':''}>あり</option></select></label></div>
 <div class="c" style="margin:10px 0"><div class="m" style="font-size:12px;margin-bottom:6px">Table info</div><div class="r" style="margin:0"><span>大人 ${adultCount} · 子ども ${childCount} · ${guestType}</span><span>アレルギー ${allergy}</span></div></div>
 ${mine.length?`<div class="c" style="margin-bottom:10px"><b>Your orders</b>${mine.map(o=>`<div class="r"><span>#${o.id} · 大人 ${o.adultCount || adultCount} · 子ども ${o.childCount || childCount} · ${o.guestType||'All'} · アレルギー ${o.allergy || 'なし'} · ${o.items.map(i=>i.n+'×'+i.q).join(', ')}</span><span class="tag ${o.status}">${o.status=='new'?'Received':o.status=='preparing'?'Preparing':'Served'}</span></div>`).join('')}</div>`:''}
 ${menuGroups().map(([cat,items])=>`<div style="margin-top:14px"><div class="m" style="font-weight:700;margin-bottom:8px">${cat}</div><div class="g">${items.map(m=>`<div class="c"><div class="e">${m.e}</div><b>${m.n}</b>${m.id===15?`<label style="display:block;margin-top:8px">内容 <select onchange="setOtherPreset(this.value)"><option value="" ${otherPreset===''?'selected':''}>選択してください</option>${MENU.filter(item=>item.cat==='定食').map(item=>`<option value="${item.id}" ${otherPreset==item.id?'selected':''}>${item.id} ${item.n} ${yen(item.p)}</option>`).join('')}</select></label><label style="display:block;margin-top:8px">料金（円） <input type="number" min="0" step="1" value="${otherPrice}" onchange="otherPrice=Math.max(0,Math.round(+this.value||0));draw()"></label>`:m.id===16?`<label style="display:block;margin-top:8px">内容 <select onchange="setOtherDrinkType(this.value)"><option value="0" ${otherDrinkType===0?'selected':''}>選択してください</option>${otherDrinkTypes.map(item=>`<option value="${item.id}" ${otherDrinkType===item.id?'selected':''}>${item.id} ${item.n}</option>`).join('')}</select></label>${[5,6].includes(otherDrinkType)?`<label style="display:block;margin-top:8px">OPTION <select onchange="otherDrinkOption=this.value;draw()"><option value="">選択してください</option>${shochuOptions.map(option=>`<option ${otherDrinkOption===option?'selected':''}>${option}</option>`).join('')}</select></label>`:''}<label style="display:block;margin-top:8px">料金（円） <input type="number" min="0" step="1" value="${otherDrinkPrice}" onchange="otherDrinkPrice=Math.max(0,Math.round(+this.value||0));draw()"></label>`:`<div class="m">${yen(m.p)}</div>`}${m.cat==='定食'?`<label style="display:block;margin-top:8px">ご飯大盛り <select onchange="riceLarge[${m.id}]=+this.value;draw()"><option value="0" ${!(riceLarge[m.id]||0)?'selected':''}>0個（普通）</option>${Array.from({length:cart[m.id]||0},(_,i)=>i+1).map(q=>`<option value="${q}" ${riceLarge[m.id]===q?'selected':''}>${q}個を大盛り</option>`).join('')}</select> +${yen(100)} / 個</label>`:''}${m.id===7?`<label style="display:block;margin-top:8px">辛さ <select onchange="naanSpice=this.value;draw()"><option value="" ${naanSpice===''?'selected':''}>選択</option>${[0,1,2].map(level=>`<option value="${level}" ${naanSpice==level?'selected':''}>${level}</option>`).join('')}</select></label>`:''}<div class="r"><button onclick="qty(${m.id},-1)">−</button><b>${cart[m.id]||0}</b><button onclick="qty(${m.id},1)">+</button></div></div>`).join('')}</div></div>`).join('')}
 <div class="c r" style="margin-top:12px"><b>${cnt} items · ${yen(sum)} · ${totalPeople}人</b><button class="p" ${cnt?'':'disabled'} onclick="send()">Send order</button></div>`}
function qty(id,d){cart[id]=Math.max(0,(cart[id]||0)+d);riceLarge[id]=Math.min(riceLarge[id]||0,cart[id]);draw()}
function setOtherPreset(id){const item=MENU.find(m=>m.id===Number(id));otherPreset=item?String(item.id):'';otherName=item?item.n:'';otherPrice=item?item.p:100;draw()}
function setOtherDrinkType(id){otherDrinkType=Number(id)||0;otherDrinkOption='';draw()}
function send(){const items=MENU.filter(m=>cart[m.id]).flatMap(m=>{const largeQty=m.cat==='定食'?Math.min(riceLarge[m.id]||0,cart[m.id]):0,normalQty=cart[m.id]-largeQty,spice=m.id===7&&naanSpice!==''?`（辛さ ${naanSpice}）`:'';const drink=otherDrinkTypes.find(item=>item.id===otherDrinkType),price=m.id===15?otherPrice:m.id===16?otherDrinkPrice:m.p,name=m.id===15?(otherName||m.n):m.id===16?`${drink?drink.n:m.n}${[5,6].includes(otherDrinkType)&&otherDrinkOption?`（${otherDrinkOption}）`:''}`:m.n;return [normalQty?{n:name+spice,p:price,q:normalQty}:null,largeQty?{n:name+'（ご飯大）'+spice,p:price+100,q:largeQty}:null].filter(Boolean)});if(!items.length)return;
 load();orders.push({id:(orders.reduce((a,o)=>Math.max(a,o.id),0)+1),table,items,status:'new',paid:false,guestType,adultCount,childCount,allergy,t:Date.now()});cart={};riceLarge={};naanSpice='';otherPreset='';otherName='';otherPrice=100;otherDrinkType=0;otherDrinkOption='';otherDrinkPrice=0;save();draw()}
// Kitchen
let auto=true;
function ticketHTML(o){return `<b style="font-size:22px">Table ${o.table}</b> &nbsp;#${o.id}<br>${new Date(o.t).toLocaleTimeString()}<br>大人: ${o.adultCount || 0} / 子ども: ${o.childCount || 0}<br>アレルギー: ${o.allergy || 'なし'}<br>${o.guestType||'All'}<hr>${o.items.map(i=>`<div style="font-size:18px">${i.q}× ${i.n}</div>`).join('')}<hr>`}
function printTicket(id){const o=orders.find(x=>x.id==id);if(!o)return;document.getElementById('ticket').innerHTML=ticketHTML(o);document.body.classList.add('tk');setTimeout(()=>{window.print();document.body.classList.remove('tk');setTimeout(autoPrint,500)},100)}
function autoPrint(){if(view!='kitchen'||!auto||document.body.classList.contains('tk'))return;let done=[];try{done=JSON.parse(localStorage.getItem('hh_printed')||'[]')}catch(e){}
 const n=orders.find(o=>o.status=='new'&&!o.paid&&!done.includes(o.id));if(!n)return;done.push(n.id);try{localStorage.setItem('hh_printed',JSON.stringify(done))}catch(e){}printTicket(n.id)}
function kitchen(){
 if(!staffSignedIn)return staffGate();
 const q=orders.filter(o=>o.status!='served'&&!o.paid);
 return `<div class="r"><h2>Kitchen Display</h2><label><input type="checkbox" ${auto?'checked':''} onchange="auto=this.checked;draw()"> Auto-print new orders</label></div>${q.length?'':'<p class="m">No open tickets.</p>'}<div class="g">${q.map(o=>{const cd=countdownInfo(o.t); return `<div class="c"><div class="r"><b>Table ${o.table} · #${o.id}</b><span class="tag ${o.status}">${o.status}</span><span class="${cd.tone}">${cd.label}</span></div><div class="m">大人 ${o.adultCount || 0} · 子ども ${o.childCount || 0} · ${o.guestType || 'All'} · アレルギー ${o.allergy || 'なし'}</div>${o.items.map(i=>`<div>${i.q}× ${i.n}</div>`).join('')}<div class="m">${new Date(o.t).toLocaleTimeString()} · 20:00 countdown</div><div class="r">${o.status=='new'?`<button class="p" onclick="setS(${o.id},'preparing')">Start cooking</button>`:`<button class="p" onclick="setS(${o.id},'served')">Mark ready / served</button>`}<button onclick="printTicket(${o.id})">Print</button></div></div>`}).join('')}</div>`}
async function setS(id,s){const order=orders.find(o=>o.id==id);if(!order)return;try{await window.firebaseSync.updateOrder(order.key,{status:s})}catch(error){syncError=error.message;draw()}}
// Register
let disc=0,meth='QR pay',receiptHistory=[],showReceiptHistory=false;
function register(){
 if(!staffSignedIn)return staffGate();
 if(receipt){const r=receipt;return `<section class="receipt-paper"><div style="text-align:center;font-weight:700">あじまるや</div><div class="receipt-label">レシート</div><h2 class="receipt-title">領収書</h2><label class="noprint">宛名<input class="receipt-name-input" placeholder="宛名を入力" value="${escapeHtml(r.name||'')}" oninput="setReceiptName(this.value)"></label><div class="receipt-recipient"><span>お名前</span><span class="receipt-recipient-name" id="receipt-name-preview">${escapeHtml(r.name||'')}</span><span class="receipt-recipient-line"></span><span>様</span></div><div class="receipt-meta">発行日 ${new Date(r.t).toLocaleString()}<br>テーブル ${r.table}</div><div class="receipt-items">${r.items.map(i=>`<div class="r"><span>${i.n} × ${i.q}</span><span>${yen(i.p*i.q)}</span></div>`).join('')}</div><div class="r"><span>小計</span><span>${yen(r.sub)}</span></div>${r.disc?`<div class="r"><span>割引 (${r.disc}%)</span><span>−${yen(r.sub-r.tot)}</span></div>`:''}<div class="r receipt-total"><b>領収金額</b><b>${yen(r.tot)}</b></div><div class="r"><span>お支払い</span><span>${r.meth}</span></div><div class="receipt-thanks">上記正に領収いたしました</div><div class="r noprint"><button class="p" onclick="window.print()">印刷</button><button onclick="receipt=null;draw()">戻る</button></div></section>`}
 if(showReceiptHistory)return `<div class="r"><h2>領収書履歴</h2><button onclick="showReceiptHistory=false;draw()">戻る</button></div>${receiptHistory.length?receiptHistory.map((r,i)=>`<div class="c r"><span>Table ${r.table} · ${new Date(r.t).toLocaleString()} · ${yen(r.tot)} · ${r.meth}</span><button onclick="openReceipt(${i})">再表示</button></div>`).join(''):'<p class="m">領収書はまだありません。</p>'}`;
 const tabs=[...new Set(orders.filter(o=>!o.paid).map(o=>o.table))].sort((a,b)=>a-b);
 if(!tabs.includes(sel))sel=tabs[0]||null;
 let body='<p class="m">No open tables.</p>';
 if(sel){const os=orders.filter(o=>o.table==sel&&!o.paid),items=os.flatMap(o=>o.items),sub=os.reduce((s,o)=>s+total(o),0),tot=sub*(1-disc/100);
  const orderList=os.map(o=>`<div class="c" style="margin-top:8px"><div class="r"><b>Order #${o.id}</b><button onclick="deleteOrder(${o.id})">Delete</button></div>${o.items.map(i=>`<div class="r"><span>${i.q}× ${i.n}</span><span>${yen(i.p*i.q)}</span></div>`).join('')}<div class="m">大人 ${o.adultCount||0} · 子ども ${o.childCount||0} · ${o.guestType||'All'} · アレルギー ${o.allergy||'なし'}</div></div>`).join('');
  body=`<div class="c">${orderList || '<p class="m">No orders.</p>'}<hr><div class="r"><span>Subtotal</span><span>${yen(sub)}</span></div>
  <div class="r"><span>Discount %</span><input type="number" min="0" max="100" value="${disc}" style="width:80px" onchange="disc=Math.min(100,Math.max(0,+this.value||0));draw()"></div>
  <div class="r"><span>Payment</span><select onchange="meth=this.value">${['Cash','Card','QR pay'].map(m=>`<option ${m==meth?'selected':''}>${m}</option>`).join('')}</select></div>
  <div class="r"><b>Total</b><b>${yen(tot)}</b></div><button class="p" onclick="closeT()">Close table</button></div>`}
 return `<div class="r"><h2>Register 会計</h2><button onclick="showReceiptHistory=true;draw()">領収書履歴 (${receiptHistory.length})</button></div><div class="r" style="justify-content:flex-start;flex-wrap:wrap">${tabs.map(t=>`<button class="${t==sel?'p':''}" onclick="sel=${t};draw()">Table ${t}</button>`).join('')}</div>${body}`}
function setReceiptName(name){if(!receipt)return;receipt.name=name;const index=receiptHistory.indexOf(receipt);if(index>=0)try{localStorage.setItem('hh_receipts',JSON.stringify(receiptHistory))}catch(e){}const preview=document.getElementById('receipt-name-preview');if(preview)preview.textContent=name}
function openReceipt(index){receipt=receiptHistory[index];showReceiptHistory=false;draw()}
function deleteOrder(id){
 const order=orders.find(o=>o.id===id);if(!order)return;
 window.firebaseSync.deleteOrder(order.key).catch(error=>{syncError=error.message;draw()});
}
async function closeT(){const os=orders.filter(o=>o.table==sel&&!o.paid),sub=os.reduce((s,o)=>s+total(o),0),at=Date.now();
 try{await Promise.all(os.map(o=>window.firebaseSync.updateOrder(o.key,{paid:true,status:'served',payment:{meth,disc,at}})))}catch(error){syncError=error.message;draw();return}
 receipt={table:sel,items:os.flatMap(o=>o.items),sub,disc,tot:sub*(1-disc/100),meth,t:at};receiptHistory.unshift(receipt);try{localStorage.setItem('hh_receipts',JSON.stringify(receiptHistory))}catch(e){}disc=0;draw()}
// QR sheet
let qbase='';
function qr(){const b=qbase||base();return `<h2>Table QR Sheet (1–40)</h2><div class="c noprint" style="margin-bottom:10px"><div class="m">Page address customers will open (must be reachable from their phones)</div><input value="${b}" style="width:100%;box-sizing:border-box" onchange="qbase=this.value.trim();draw()">${/^file:/i.test(b)?'<p style="color:var(--warn)">⚠ file:// addresses only work on this PC. Host the page, then paste its public https address here.</p>':''}</div><p class="m noprint">Each QR code opens the Customer page for that table only. <button onclick="window.print()">Print</button></p><div class="g">${Array.from({length:40},(_,i)=>`<div class="c qr"><div data-q="${i+1}"></div><b>Table ${i+1}</b></div>`).join('')}</div>`}
load();
const m=location.hash.match(/t=(\d+)/);if(m){table=Math.min(40,Math.max(1,+m[1]))}
setInterval(()=>{if(view==='kitchen')draw();},1000);
draw();
</script></body></html>

customer.html

<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>あじまるや | ご注文</title>
<style>
:root{box-sizing:border-box;--bg:#f7f4ef;--card:#fff;--tx:#1e2a32;--mut:#6b7780;--ac:#0f5c7a;--bd:#ddd6ca;--ok:#2f7d4f}
@media(prefers-color-scheme:dark){:root{--bg:#14191d;--card:#1e262c;--tx:#eceae4;--mut:#9aa6ae;--ac:#5bb5d6;--bd:#33404a;--ok:#5fc283}}
*{box-sizing:inherit}body{margin:0;background:var(--bg);color:var(--tx);font:15px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif}
header{background:var(--card);border-bottom:1px solid var(--bd);padding:14px max(16px,calc((100vw - 980px)/2))}
header b{font-size:18px}main{max-width:980px;margin:auto;padding:14px}
button,select,input{font:inherit;color:inherit;background:var(--card);border:1px solid var(--bd);border-radius:6px;padding:8px 10px}
button{cursor:pointer}button:disabled{opacity:.45;cursor:not-allowed}.primary{background:var(--ac);color:#fff;border-color:var(--ac)}
.row{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:5px 0;flex-wrap:wrap}.fields{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.field{display:flex;align-items:center;gap:6px}.muted{color:var(--mut)}.section{margin-top:18px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(205px,1fr));gap:10px}
.item,.panel{background:var(--card);border:1px solid var(--bd);border-radius:8px;padding:12px}.item h3{margin:0 0 5px;font-size:16px}.price{color:var(--mut)}.qty{display:flex;align-items:center;gap:12px;margin-top:10px}.qty button{min-width:40px;font-size:19px}
.tag{display:inline-block;background:var(--ac);color:white;border-radius:99px;padding:2px 8px;font-size:12px}.preparing{background:#bd7917}.served{background:var(--ok)}
.summary{position:sticky;bottom:0;margin:14px 0 0;padding:12px;background:var(--card);border:1px solid var(--bd);border-radius:8px;box-shadow:0 -4px 18px #0001}
label{line-height:1.4}input[type=number]{width:100px}.orders{display:grid;gap:6px}.order{display:flex;justify-content:space-between;gap:8px;align-items:flex-start;padding:8px 0;border-top:1px solid var(--bd)}
@media(max-width:520px){header{padding:12px 14px}main{padding:12px}.fields{align-items:stretch}.field{justify-content:space-between;width:100%}.field select{max-width:60%}.item{padding:10px}}
</style>
</head>
<body>
<header><b>あじまるや & 中島駅</b><span class="muted"> · ご注文</span></header>
<main id="app"></main>
<script type="module" src="firebase-sync.js"></script>
<script>
let MENU=[
 {id:1,cat:'定食',n:'唐揚げ定食',p:800,e:''},{id:2,cat:'定食',n:'あじまる唐揚げ定食',p:900,e:''},{id:3,cat:'定食',n:'とんかつ定食',p:880,e:''},{id:4,cat:'定食',n:'みそとんかつ定食',p:900,e:''},{id:5,cat:'定食',n:'アジフライ定食',p:850,e:''},{id:6,cat:'定食',n:'ミックスフライ定食',p:920,e:''},
 {id:7,cat:'ナンセット',n:'プレーンナンセット',p:770,e:''},{id:8,cat:'サブメニュー',n:'ご飯 小',p:150,e:'🍚'},{id:9,cat:'サブメニュー',n:'ご飯 中',p:200,e:'🍚'},{id:10,cat:'サブメニュー',n:'ご飯 大',p:250,e:'🍚'},{id:15,cat:'サブメニュー',n:'その他',p:100,e:''},
 {id:14,cat:'ドリンク',n:'生ビール',p:500,e:'🍺'},{id:16,cat:'飲み放題ドリンク',n:'その他（飲み物）',p:0,e:'🥤'}
];
const drinkTypes=[{id:1,n:'生'},{id:2,n:'ハイボール'},{id:3,n:'レモンサワー'},{id:4,n:'お茶'},{id:5,n:'麦焼酎'},{id:6,n:'芋焼酎'}];
const shochuOptions=['水割り','お湯割り','お茶割り','ソーダ割り'];
const menuGroups=()=>[...new Set(['定食','ラーメン','ナンセット','サブメニュー','ドリンク','居酒屋メニュー','飲み放題ドリンク',...MENU.map(item=>item.cat)])].filter(category=>MENU.some(item=>item.cat===category)).map(category=>[category,MENU.filter(item=>item.cat===category)]);
const yen=n=>'¥'+Math.round(n).toLocaleString();
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let orders=[],table=1,cart={},riceLarge={},naanSpice='',otherPreset='',otherName='',otherPrice=100,otherDrinkType=0,otherDrinkOption='',otherDrinkPrice=0,guestType='All',adultCount=2,childCount=0,allergy='なし',orderPending=false,syncMessage='';
function draw(){
 const count=Object.values(cart).reduce((sum,q)=>sum+q,0),people=adultCount+childCount;
 const total=MENU.reduce((sum,item)=>sum+(item.id===15?otherPrice:item.id===16?otherDrinkPrice:item.p)*(cart[item.id]||0)+100*(riceLarge[item.id]||0),0);
 const mine=orders.filter(order=>order.table===table&&!order.paid);
 document.getElementById('app').innerHTML=`
 <div class="row"><div class="fields"><h1 style="font-size:24px;margin:0">Table ${table}</h1></div></div>
 <div class="panel fields" style="margin-top:10px"><label class="field">大人<select onchange="adultCount=Number(this.value);draw()">${Array.from({length:10},(_,i)=>`<option value="${i+1}" ${adultCount===i+1?'selected':''}>${i+1}</option>`).join('')}</select></label><label class="field">子ども<select onchange="childCount=Number(this.value);draw()">${Array.from({length:10},(_,i)=>`<option value="${i}" ${childCount===i?'selected':''}>${i}</option>`).join('')}</select></label><label class="field">性別<select onchange="guestType=this.value;draw()">${['All','Men','Women'].map(value=>`<option ${guestType===value?'selected':''}>${value}</option>`).join('')}</select></label><label class="field">アレルギー<select onchange="allergy=this.value;draw()"><option ${allergy==='なし'?'selected':''}>なし</option><option ${allergy==='あり'?'selected':''}>あり</option></select></label><span class="muted">合計 ${people}名</span></div>
 ${syncMessage?`<p role="alert" class="muted">${esc(syncMessage)}</p>`:''}
 ${mine.length?`<section class="section panel"><b>注文履歴</b><div class="orders">${mine.map(order=>`<div class="order"><div><b>注文 #${order.id}</b><div class="muted">${order.items.map(item=>`${esc(item.n)} × ${item.q}`).join(', ')}</div><div class="muted">${new Date(order.t).toLocaleTimeString()} · ${yen(order.items.reduce((sum,item)=>sum+item.p*item.q,0))}</div></div><span class="tag ${order.status==='preparing'?'preparing':order.status==='served'?'served':''}">${order.status==='new'?'受付済み':order.status==='preparing'?'調理中':'提供済み'}</span></div>`).join('')}</div></section>`:''}
 ${menuGroups().map(([category,items])=>`<section class="section"><h2 style="font-size:17px;margin:0 0 8px">${category}</h2><div class="grid">${items.map(item=>`<article class="item"><h3>${esc(item.n)}</h3>${item.id===15?`<label>内容<select onchange="setOtherPreset(this.value)"><option value="">選択してください</option>${MENU.filter(option=>option.cat==='定食').map(option=>`<option value="${option.id}" ${otherPreset==option.id?'selected':''}>${option.id} ${esc(option.n)} ${yen(option.p)}</option>`).join('')}</select></label><label style="display:block;margin-top:7px">料金（円）<input type="number" min="0" step="1" value="${otherPrice}" onchange="otherPrice=Math.max(0,Math.round(Number(this.value)||0));draw()"></label>`:item.id===16?`<label>内容<select onchange="setDrinkType(this.value)"><option value="0" ${otherDrinkType===0?'selected':''}>選択してください</option>${drinkTypes.map(option=>`<option value="${option.id}" ${otherDrinkType===option.id?'selected':''}>${option.n}</option>`).join('')}</select></label>${[5,6].includes(otherDrinkType)?`<label style="display:block;margin-top:7px">割り方<select onchange="otherDrinkOption=this.value;draw()"><option value="">選択してください</option>${shochuOptions.map(option=>`<option ${otherDrinkOption===option?'selected':''}>${option}</option>`).join('')}</select></label>`:''}<label style="display:block;margin-top:7px">料金（円）<input type="number" min="0" step="1" value="${otherDrinkPrice}" onchange="otherDrinkPrice=Math.max(0,Math.round(Number(this.value)||0));draw()"></label>`:`<div class="price">${yen(item.p)}</div>`}${item.cat==='定食'?`<label style="display:block;margin-top:7px">ご飯大盛り<select onchange="riceLarge[${item.id}]=Number(this.value);draw()"><option value="0" ${!riceLarge[item.id]?'selected':''}>普通</option>${Array.from({length:cart[item.id]||0},(_,i)=>i+1).map(q=>`<option value="${q}" ${riceLarge[item.id]===q?'selected':''}>${q}個を大盛り</option>`).join('')}</select> +${yen(100)} / 個</label>`:''}${item.id===7?`<label style="display:block;margin-top:7px">辛さ<select onchange="naanSpice=this.value;draw()"><option value="">選択</option>${[0,1,2].map(level=>`<option value="${level}" ${naanSpice==level?'selected':''}>${level}</option>`).join('')}</select></label>`:''}<div class="qty"><button aria-label="${esc(item.n)}を減らす" onclick="changeQty(${item.id},-1)">−</button><b>${cart[item.id]||0}</b><button aria-label="${esc(item.n)}を増やす" onclick="changeQty(${item.id},1)">+</button></div></article>`).join('')}</div></section>`).join('')}
 <div class="summary row"><b>${count}点 · ${yen(total)} · ${people}名</b><button class="primary" ${count&&!orderPending?'':'disabled'} onclick="sendOrder()">${orderPending?'送信中…':'注文する'}</button></div>`;
}
function changeQty(id,delta){cart[id]=Math.max(0,(cart[id]||0)+delta);riceLarge[id]=Math.min(riceLarge[id]||0,cart[id]);draw()}
function setOtherPreset(id){const item=MENU.find(entry=>entry.id===Number(id));otherPreset=item?String(item.id):'';otherName=item?item.n:'';otherPrice=item?item.p:100;draw()}
function setDrinkType(id){otherDrinkType=Number(id)||0;otherDrinkOption='';draw()}
async function sendOrder(){
 const items=MENU.filter(item=>cart[item.id]).flatMap(item=>{
  const large=item.cat==='定食'?Math.min(riceLarge[item.id]||0,cart[item.id]):0,normal=cart[item.id]-large;
  const drink=drinkTypes.find(option=>option.id===otherDrinkType),price=item.id===15?otherPrice:item.id===16?otherDrinkPrice:item.p;
  const name=item.id===15?(otherName||item.n):item.id===16?`${drink?drink.n:item.n}${[5,6].includes(otherDrinkType)&&otherDrinkOption?`（${otherDrinkOption}）`:''}`:item.n;
  const spice=item.id===7&&naanSpice!==''?`（辛さ ${naanSpice}）`:'';
  return [normal?{n:name+spice,p:price,q:normal}:null,large?{n:name+'（ご飯大）'+spice,p:price+100,q:large}:null].filter(Boolean);
 });
 if(!items.length)return;
 if(!window.firebaseSync){syncMessage='注文システムに接続できません。ページを再読み込みしてください。';draw();return}
 orderPending=true;syncMessage='';draw();
 try{
  await window.firebaseSync.createCustomerOrder({id:Date.now(),table,items,status:'new',paid:false,guestType,adultCount,childCount,allergy,t:Date.now()});
  cart={};riceLarge={};naanSpice='';otherPreset='';otherName='';otherPrice=100;otherDrinkType=0;otherDrinkOption='';otherDrinkPrice=0;
 }catch(error){syncMessage='注文を送信できませんでした。通信状態を確認してください。'}
 orderPending=false;draw();
}
window.addEventListener('firebase-sync-ready',()=>window.firebaseSync.startCustomer(remoteOrders=>{orders=remoteOrders;draw()}).catch(()=>{syncMessage='注文システムに接続できません。';draw()}),{once:true});
window.addEventListener('firebase-menu',event=>{if(Array.isArray(event.detail.menu)){MENU=event.detail.menu;draw()}});
window.addEventListener('firebase-sync-error',event=>{syncMessage=event.detail?.message||'データベースに接続できません。';draw()});
const match=location.hash.match(/t=(\d+)/);if(match)table=Math.min(40,Math.max(1,Number(match[1])));draw();
</script>
</body>
</html>

firebase-sync.js

import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInAnonymously, signInWithPopup, signOut } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';
import { get, getDatabase, onChildAdded, onChildChanged, onChildRemoved, onValue, push, ref, remove, set, update } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js';

const firebaseConfig = {
  apiKey: 'AIzaSyAk81HxCeRB3IGekGcsE9OVHmi1sFdLwYM',
  authDomain: 'ajimaru-bcbef.firebaseapp.com',
  databaseURL: 'https://ajimaru-bcbef-default-rtdb.firebaseio.com',
  projectId: 'ajimaru-bcbef',
  storageBucket: 'ajimaru-bcbef.firebasestorage.app',
  messagingSenderId: '893250502168',
  appId: '1:893250502168:web:76740b65a9ca60953fcd6d',
  measurementId: 'G-H39ZKMVY25'
};

const STAFF_EMAIL = 'ajayatimilsina1@gmail.com';
const CUSTOMER_ORDER_KEYS = 'hh_customer_order_keys';
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const ownOrders = new Map();
const customerListeners = new Set();
const watchedOrders = new Map();
const staffOrders = new Map();
let staffOrdersListener = null;

function emit(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function isStaff(user) {
  return Boolean(user && !user.isAnonymous && user.email?.toLowerCase() === STAFF_EMAIL);
}

function normalizeMenu(menu) {
  const values = (Array.isArray(menu) ? menu : Object.values(menu || {})).filter(item => item && typeof item === 'object');
  return values.map(item => ({
    id: Number(item.id),
    cat: String(item.cat || ''),
    n: String(item.n || ''),
    p: Number(item.p),
    e: String(item.e || '')
  })).sort((a, b) => a.id - b.id);
}

function menuRecord(menu) {
  return Object.fromEntries(normalizeMenu(menu).map(item => [String(item.id), item]));
}

function customerOrderKeys() {
  try {
    const keys = JSON.parse(localStorage.getItem(CUSTOMER_ORDER_KEYS) || '[]');
    return Array.isArray(keys) ? keys.filter(key => typeof key === 'string') : [];
  } catch (error) {
    return [];
  }
}

function publishCustomerOrders() {
  const orders = [...ownOrders.values()].sort((a, b) => a.t - b.t);
  customerListeners.forEach(listener => listener(orders));
}

function watchCustomerOrder(key, uid) {
  if (watchedOrders.has(key)) return;
  const unsubscribe = onValue(ref(database, `orders/${key}`), snapshot => {
    const order = snapshot.val();
    if (order && order.customerUid === uid) ownOrders.set(key, { ...order, key });
    else ownOrders.delete(key);
    publishCustomerOrders();
  }, error => emit('firebase-sync-error', { message: error.message }));
  watchedOrders.set(key, unsubscribe);
}

async function ensureCustomer() {
  if (!auth.currentUser) await signInAnonymously(auth);
  return auth.currentUser;
}

async function startCustomer(onOrders) {
  customerListeners.add(onOrders);
  const user = await ensureCustomer();
  customerOrderKeys().forEach(key => watchCustomerOrder(key, user.uid));
  publishCustomerOrders();
  return () => customerListeners.delete(onOrders);
}

async function createCustomerOrder(order) {
  const user = await ensureCustomer();
  const orderRef = push(ref(database, 'orders'));
  const record = { ...order, customerUid: user.uid };
  await set(orderRef, record);
  const keys = customerOrderKeys();
  if (!keys.includes(orderRef.key)) {
    keys.push(orderRef.key);
    localStorage.setItem(CUSTOMER_ORDER_KEYS, JSON.stringify(keys));
  }
  watchCustomerOrder(orderRef.key, user.uid);
  return { ...record, key: orderRef.key };
}

async function signInStaff() {
  const result = await signInWithPopup(auth, new GoogleAuthProvider());
  if (!isStaff(result.user)) {
    await signOut(auth);
    throw new Error(`Staff access is limited to ${STAFF_EMAIL}.`);
  }
  return result.user;
}

async function ensureMenu(defaultMenu) {
  if (!isStaff(auth.currentUser)) throw new Error('Staff sign-in required.');
  const menuRef = ref(database, 'menu');
  const snapshot = await get(menuRef);
  if (!snapshot.exists()) await set(menuRef, menuRecord(defaultMenu));
}

async function saveMenu(menu) {
  if (!isStaff(auth.currentUser)) throw new Error('Staff sign-in required.');
  await set(ref(database, 'menu'), menuRecord(menu));
}

onValue(ref(database, 'menu'), snapshot => {
  emit('firebase-menu', { menu: snapshot.exists() ? normalizeMenu(snapshot.val()) : null });
}, error => emit('firebase-sync-error', { message: error.message }));

function listenForStaffOrders(user) {
  if (!isStaff(user) || staffOrdersListener) return;
  const ordersRef = ref(database, 'orders');
  const publish = () => emit('firebase-orders', {
    orders: [...staffOrders.values()].sort((a, b) => a.t - b.t)
  });
  const handleError = error => emit('firebase-sync-error', { message: error.message });
  const stopAdded = onChildAdded(ordersRef, snapshot => {
    staffOrders.set(snapshot.key, { ...snapshot.val(), key: snapshot.key });
    publish();
  }, handleError);
  const stopChanged = onChildChanged(ordersRef, snapshot => {
    staffOrders.set(snapshot.key, { ...snapshot.val(), key: snapshot.key });
    publish();
  }, handleError);
  const stopRemoved = onChildRemoved(ordersRef, snapshot => {
    staffOrders.delete(snapshot.key);
    publish();
  }, handleError);
  staffOrdersListener = () => {
    stopAdded();
    stopChanged();
    stopRemoved();
    staffOrders.clear();
  };
}

onAuthStateChanged(auth, user => {
  const staff = isStaff(user);
  if (staff) listenForStaffOrders(user);
  else if (staffOrdersListener) {
    staffOrdersListener();
    staffOrdersListener = null;
  }
  emit('firebase-auth-changed', { isStaff: staff, email: staff ? user.email : '' });
});

window.firebaseSync = {
  createCustomerOrder,
  ensureMenu,
  saveMenu,
  signInStaff,
  signOut: () => signOut(auth),
  updateOrder: (key, patch) => update(ref(database, `orders/${key}`), patch),
  deleteOrder: key => remove(ref(database, `orders/${key}`)),
  startCustomer
};

emit('firebase-sync-ready', {});

datebase.rules.json

{
  "rules": {
    ".read": false,
    ".write": false,
    "orders": {
      ".read": "auth != null && auth.token.email === 'ajayatimilsina1@gmail.com' && auth.token.firebase.sign_in_provider === 'google.com'",
      "$orderId": {
        ".read": "auth != null && ((auth.token.email === 'ajayatimilsina1@gmail.com' && auth.token.firebase.sign_in_provider === 'google.com') || data.child('customerUid').val() === auth.uid)",
        ".write": "auth != null && ((auth.token.email === 'ajayatimilsina1@gmail.com' && auth.token.firebase.sign_in_provider === 'google.com') || (auth.token.firebase.sign_in_provider === 'anonymous' && !data.exists() && newData.child('customerUid').val() === auth.uid && newData.child('status').val() === 'new' && newData.child('paid').val() === false))",
        ".validate": "newData.hasChildren(['id', 'table', 'items', 'status', 'paid', 'guestType', 'adultCount', 'childCount', 'allergy', 't', 'customerUid'])",
        "id": {
          ".validate": "newData.isNumber()"
        },
        "table": {
          ".validate": "newData.isNumber() && newData.val() >= 1 && newData.val() <= 40"
        },
        "items": {
          ".validate": "newData.hasChildren()",
          "$itemId": {
            ".validate": "newData.hasChildren(['n', 'p', 'q'])",
            "n": {
              ".validate": "newData.isString() && newData.val().length <= 120"
            },
            "p": {
              ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 10000000"
            },
            "q": {
              ".validate": "newData.isNumber() && newData.val() >= 1 && newData.val() <= 100"
            }
          }
        },
        "status": {
          ".validate": "newData.val() === 'new' || newData.val() === 'preparing' || newData.val() === 'served'"
        },
        "paid": {
          ".validate": "newData.isBoolean()"
        },
        "guestType": {
          ".validate": "newData.val() === 'All' || newData.val() === 'Men' || newData.val() === 'Women'"
        },
        "adultCount": {
          ".validate": "newData.isNumber() && newData.val() >= 1 && newData.val() <= 20"
        },
        "childCount": {
          ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 20"
        },
        "allergy": {
          ".validate": "newData.val() === 'なし' || newData.val() === 'あり'"
        },
        "t": {
          ".validate": "newData.isNumber() && newData.val() <= now"
        },
        "customerUid": {
          ".validate": "newData.isString() && (newData.val() === auth.uid || auth.token.email === 'ajayatimilsina1@gmail.com')"
        }
      }
    },
    "menu": {
      ".read": true,
      ".write": "auth != null && auth.token.email === 'ajayatimilsina1@gmail.com' && auth.token.firebase.sign_in_provider === 'google.com'",
      "$menuId": {
        ".validate": "newData.hasChildren(['id', 'cat', 'n', 'p', 'e'])",
        "id": {
          ".validate": "newData.isNumber()"
        },
        "cat": {
          ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 60"
        },
        "n": {
          ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 120"
        },
        "p": {
          ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 10000000"
        },
        "e": {
          ".validate": "newData.isString() && newData.val().length <= 16"
        }
      }
    }
  }
}
