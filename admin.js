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
const yen=n=>'¥'+Math.round(n).toLocaleString();
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const menuGroups=()=>[...new Set(['定食','ラーメン','ナンセット','サブメニュー','ドリンク','居酒屋メニュー','飲み放題ドリンク',...MENU.map(m=>m.cat)])].filter(cat=>MENU.some(item=>item.cat===cat)).map(cat=>[cat,MENU.filter(item=>item.cat===cat)]);
let orders=[],view=window.ADMIN_VIEW||'home',settings={},settingsMessage='',sel=null,receipt=null,staffSignedIn=false,staffSyncReady=false,staffEmail='',syncError='',menuDraft=[],menuDirty=false,menuSaving=false,menuMessage='';
function load(){try{receiptHistory=JSON.parse(localStorage.getItem('hh_receipts')||'[]')}catch(e){receiptHistory=[]}}
function save(){try{localStorage.setItem('hh_orders',JSON.stringify(orders))}catch(e){}}
window.addEventListener('firebase-sync-ready',()=>{staffSyncReady=true;draw()},{once:true});
window.addEventListener('firebase-auth-changed',event=>{staffSignedIn=event.detail.isStaff;staffEmail=event.detail.email;if(staffSignedIn)window.firebaseSync.ensureMenu(MENU).catch(error=>{syncError=error.message});draw()});
window.addEventListener('firebase-orders',event=>{orders=event.detail.orders;draw()});
window.addEventListener('firebase-menu',event=>{if(Array.isArray(event.detail.menu)){MENU=event.detail.menu;if(!menuDirty)menuDraft=cloneMenu(MENU)}draw()});
window.addEventListener('firebase-sync-error',event=>{syncError=event.detail?.message||'Firebase connection failed.';draw()});
window.addEventListener('firebase-settings',event=>{settings=event.detail.settings||{};draw()});
function toggleStaffAuth(){if(!staffSyncReady)return;syncError='';const action=staffSignedIn?window.firebaseSync.signOut():window.firebaseSync.signInStaff();action.catch(error=>{syncError=error.message;draw()})}
function staffGate(){return `<section class="c"><h2>Staff sign-in required</h2><p class="m">Kitchen and register data are available only to the authorized Google account.</p><button class="p" onclick="toggleStaffAuth()">Sign in with Google</button></section>`}
const cloneMenu=menu=>menu.map(item=>({...item,opts:(item.opts||[]).map(o=>({...o}))}));
const menuCats=()=>[...new Set(menuDraft.map(item=>item.cat))];
function menuManager(){
 if(!staffSignedIn)return staffGate();
 if(!menuDraft.length)menuDraft=cloneMenu(MENU);
 const bulk=menuCats().map((cat,ci)=>{const list=menuDraft.filter(item=>item.cat===cat),out=list.filter(item=>item.out).length;return `<div class="r"><span><b>${escapeHtml(cat)}</b> <span class="m">欠品 ${out}/${list.length}</span></span><span><button onclick="bulkOut(${ci},true)">まとめて欠品</button> <button onclick="bulkOut(${ci},false)">まとめて販売再開</button></span></div>`}).join('');
 const card=(item,index)=>`<div class="c" style="${item.out?'opacity:.65':''}"><div class="r"><b>#${item.id}</b><label><input type="checkbox" ${item.out?'checked':''} onchange="setOut(${index},this.checked)"> 欠品</label><button onclick="removeMenuItem(${index})">Remove</button></div><label style="display:block;margin:8px 0">Name <input value="${escapeHtml(item.n)}" oninput="editMenuItem(${index},'n',this.value)" style="width:100%;box-sizing:border-box"></label><label style="display:block;margin:8px 0">Category <input value="${escapeHtml(item.cat)}" oninput="editMenuItem(${index},'cat',this.value)" style="width:100%;box-sizing:border-box"></label><label style="display:block;margin:8px 0">Price (¥) <input type="number" min="0" step="1" value="${Number(item.p)||0}" oninput="editMenuItem(${index},'p',this.value)" style="width:100%;box-sizing:border-box"></label><div class="m">OPTION（名前 / 追加料金）</div>${(item.opts||[]).map((o,oi)=>`<div class="r"><input value="${escapeHtml(o.n)}" placeholder="名前" oninput="editOpt(${index},${oi},'n',this.value)" style="flex:1;min-width:0"><input type="number" min="0" step="1" value="${Number(o.p)||0}" oninput="editOpt(${index},${oi},'p',this.value)" style="width:80px"><button onclick="removeOpt(${index},${oi})">×</button></div>`).join('')}<button onclick="addOpt(${index})">+ OPTION</button></div>`;
 return `<div class="r"><h2>Menu Manager</h2><div><button onclick="addMenuItem()">Add item</button> <button id="menu-cancel" onclick="cancelMenuDraft()" ${menuDirty?'':'disabled'}>Cancel</button> <button id="menu-save" class="p" onclick="saveMenuDraft()" ${menuDirty&&!menuSaving?'':'disabled'}>${menuSaving?'Saving…':'Save menu'}</button></div></div>${menuMessage?`<p class="m" role="status">${escapeHtml(menuMessage)}</p>`:''}<div class="c" style="margin-bottom:10px"><b>カテゴリ別 欠品</b>${bulk}</div><div class="g">${menuDraft.map(card).join('')}</div>`;
}
function markDirty(){menuDirty=true;menuMessage='';const save=document.getElementById('menu-save'),cancel=document.getElementById('menu-cancel');if(save)save.disabled=menuSaving;if(cancel)cancel.disabled=false}
function editMenuItem(index,field,value){menuDraft[index]={...menuDraft[index],[field]:value};markDirty()}
function editOpt(index,oi,field,value){menuDraft[index].opts[oi][field]=value;markDirty()}
function addOpt(index){menuDraft[index].opts=[...(menuDraft[index].opts||[]),{n:'',p:0}];markDirty();draw()}
function removeOpt(index,oi){menuDraft[index].opts.splice(oi,1);markDirty();draw()}
function setOut(index,flag){menuDraft[index].out=flag;markDirty();draw()}
function bulkOut(ci,flag){const cat=menuCats()[ci];menuDraft.forEach(item=>{if(item.cat===cat)item.out=flag});markDirty();draw()}
function addMenuItem(){const id=Math.max(0,...MENU.map(item=>Number(item.id)||0),...menuDraft.map(item=>Number(item.id)||0))+1;menuDraft.push({id,cat:'定食',n:'',p:0,e:'',out:false,opts:[]});menuDirty=true;menuMessage='';draw()}
function removeMenuItem(index){menuDraft.splice(index,1);menuDirty=true;menuMessage='';draw()}
function cancelMenuDraft(){menuDraft=cloneMenu(MENU);menuDirty=false;menuMessage='';draw()}
async function saveMenuDraft(){
 const menu=menuDraft.map(item=>({...item,id:Number(item.id),n:String(item.n).trim(),cat:String(item.cat).trim(),p:Number(item.p),e:String(item.e||''),out:item.out===true,opts:(item.opts||[]).map(o=>({n:String(o.n).trim(),p:Number(o.p)||0})).filter(o=>o.n)}));
 if(menu.some(item=>!item.n||!item.cat||!Number.isFinite(item.p)||item.p<0||item.opts.some(o=>o.p<0))||new Set(menu.map(item=>item.id)).size!==menu.length){menuMessage='Enter a unique item, category, and non-negative price for every row.';draw();return}
 menuSaving=true;menuMessage='';draw();
 try{await window.firebaseSync.saveMenu(menu);MENU=menu;menuDraft=cloneMenu(menu);menuDirty=false;menuMessage='Menu saved.'}
 catch(error){menuMessage=error.message||'Could not save the menu.'}
 menuSaving=false;draw();
}
const NAV=[['menu','menu.html','Menu'],['kitchen','kitchen.html','Kitchen'],['register','register.html','Register 会計'],['qr','qr.html','QR Sheet'],['settings','settings.html','営業・配達設定']];
function buildNav(){document.getElementById('nav').innerHTML=`<b>⚓ あじまるや & 中島駅</b><a href="index.html">Home</a><a href="customer.html#t=1">Customer page</a><a href="delivery.html">配達ページ</a>${NAV.map(([v,href,label])=>`<a href="${href}" class="${v==view?'on':''}">${label}</a>`).join('')}<button id="b-auth" onclick="toggleStaffAuth()">Staff sign in</button>`}
function home(){return `<h2>Staff</h2><div class="g">${[['menu.html','Menu'],['kitchen.html','Kitchen'],['register.html','Register 会計'],['qr.html','QR Sheet'],['settings.html','営業・配達設定'],['customer.html#t=1','Customer page'],['delivery.html','配達ページ (Delivery)']].map(([href,label])=>`<a class="c" href="${href}" style="color:inherit;text-decoration:none"><b>${label}</b></a>`).join('')}</div>`}
const dsettings=()=>({hours:{open:'11:00',close:'22:00',closed:false,...settings.hours},delivery:{open:'11:00',close:'21:00',extra:0,eta:45,markup:30,closed:false,...settings.delivery}});
async function setSetting(group,field,value){const next=curSettings();next[group][field]=value;try{await window.firebaseSync.saveSettings(next);settingsDraft=null;settingsMessage='Saved.'}catch(error){settingsMessage=error.message||'Could not save.'}draw()}
let settingsDraft=null;
const curSettings=()=>settingsDraft||dsettings();
function editSetting(group,field,value){settingsDraft=curSettings();settingsDraft[group][field]=value;settingsMessage='';const save=document.getElementById('settings-save');if(save)save.disabled=false}
async function saveSettingsDraft(){try{await window.firebaseSync.saveSettings(curSettings());settingsDraft=null;settingsMessage='Saved.'}catch(error){settingsMessage=error.message||'Could not save.'}draw()}
const adjustExtra=delta=>setSetting('delivery','extra',Math.max(-240,Math.min(240,(Number(curSettings().delivery.extra)||0)+delta)));
function settingsView(){
 if(!staffSignedIn)return staffGate();
 const {hours:h,delivery:d}=curSettings();
 const time=(group,field,label,v)=>`<label style="display:block;margin:8px 0">${label} <input type="time" value="${v}" oninput="editSetting('${group}','${field}',this.value)"></label>`;
 const num=(group,field,label,v,min,max)=>`<label style="display:block;margin:8px 0">${label} <input type="number" min="${min}" max="${max}" step="1" value="${v}" style="width:100px" oninput="editSetting('${group}','${field}',Math.min(${max},Math.max(${min},Math.round(+this.value||0))))"></label>`;
 const stop=(group,closed)=>`<button class="${closed?'p':''}" onclick="setSetting('${group}','closed',${!closed})">${closed?'受付を再開':'受付を停止 (営業終了)'}</button>`;
 const extra=Number(d.extra)||0;
 return `<div class="r"><h2>営業時間・配達設定</h2><button id="settings-save" class="p" onclick="saveSettingsDraft()" ${settingsDraft?'':'disabled'}>保存</button></div>${settingsMessage?`<p class="m" role="status">${escapeHtml(settingsMessage)}</p>`:''}<div class="g">
 <div class="c"><h3>営業時間 (店内注文)</h3><p><b id="live-h">${escapeHtml(bannerText('営業時間',h))}</b></p>${time('hours','open','開始',h.open)}${time('hours','close','終了',h.close)}${stop('hours',h.closed)}</div>
 <div class="c"><h3>配達</h3><p><b id="live-d">${escapeHtml(bannerText('配達受付',d))}</b></p>${time('delivery','open','開始',d.open)}${time('delivery','close','終了',d.close)}${num('delivery','eta','配達所要時間 (分)',d.eta,5,240)}${num('delivery','markup','配達価格の上乗せ (%)',d.markup,0,200)}${stop('delivery',d.closed)}
 <hr><div class="m">時間調整 (現在 ${extra>0?'延長 +':extra<0?'短縮 ':''}${extra}分)</div><div class="r" style="justify-content:flex-start;flex-wrap:wrap"><button onclick="adjustExtra(-15)">短縮 −15</button><button onclick="adjustExtra(-5)">短縮 −5</button><button onclick="adjustExtra(5)">延長 +5</button><button onclick="adjustExtra(15)">延長 +15</button><button onclick="adjustExtra(30)">延長 +30</button><button onclick="setSetting('delivery','extra',0)">リセット</button></div></div></div>`}
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
 const authButton=document.getElementById('b-auth');authButton.textContent=staffSignedIn?`Sign out ${staffEmail}`:staffSyncReady?'Staff sign in':'Connecting…';authButton.disabled=!staffSyncReady;
 document.getElementById('app').innerHTML=(syncError?`<p role="alert" class="m">${escapeHtml(syncError)}</p>`:'')+({home,menu:menuManager,kitchen,register,qr,settings:settingsView})[view]();
 autoPrint();
 if(view=='qr'){document.querySelectorAll('[data-q]').forEach(d=>renderQrCell(d, customerUrl(d.dataset.q)));document.querySelectorAll('[data-qd]').forEach(d=>renderQrCell(d,deliveryUrl()))}
}
const base=()=>location.href.split('#')[0];
const deliveryUrl=()=>new URL('delivery.html',window.location.href).toString();
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
// Kitchen
let auto=true;
const tbl=o=>o.type==='delivery'?'配達':'Table '+o.table;
const noteInfo=o=>`${o.allergy==='あり'&&o.allergyNote?'（'+escapeHtml(o.allergyNote)+'）':''}${o.receipt?' · 領収書必要':''}`;
const deliveryInfo=o=>o.type==='delivery'&&o.customer?`<div>${escapeHtml(o.customer.name)} · ${escapeHtml(o.customer.phone)}</div><div>〒${escapeHtml(o.customer.postal)} ${escapeHtml(o.customer.address)}</div><div>目印: ${escapeHtml(o.customer.landmark)}</div>`:'';
function orderAction(o){const b=(s,t)=>`<button class="p" onclick="setS(${o.id},'${s}')">${t}</button>`;if(o.status=='new')return b('preparing','Start cooking');if(o.type==='delivery'&&o.status=='preparing')return b('delivering','配達へ出発');return b('served',o.type==='delivery'?'配達完了':'Mark ready / served')}
function ticketHTML(o){return `<b style="font-size:22px">${tbl(o)}</b> &nbsp;#${o.id}<br>${deliveryInfo(o)}${new Date(o.t).toLocaleTimeString()}<br>大人: ${o.adultCount || 0} / 子ども: ${o.childCount || 0}<br>アレルギー: ${o.allergy || 'なし'}${noteInfo(o)}<br>${o.guestType||'All'}<hr>${o.items.map(i=>`<div style="font-size:18px">${i.q}× ${i.n}</div>`).join('')}<hr>`}
function printTicket(id){const o=orders.find(x=>x.id==id);if(!o)return;document.getElementById('ticket').innerHTML=ticketHTML(o);document.body.classList.add('tk');setTimeout(()=>{window.print();document.body.classList.remove('tk');setTimeout(autoPrint,500)},100)}
function autoPrint(){if(view!='kitchen'||!auto||document.body.classList.contains('tk'))return;let done=[];try{done=JSON.parse(localStorage.getItem('hh_printed')||'[]')}catch(e){}
 const n=orders.find(o=>o.status=='new'&&!o.paid&&!done.includes(o.id));if(!n)return;done.push(n.id);try{localStorage.setItem('hh_printed',JSON.stringify(done))}catch(e){}printTicket(n.id)}
function kitchen(){
 if(!staffSignedIn)return staffGate();
 const q=orders.filter(o=>o.status!='served'&&!o.paid);
 return `<div class="r"><h2>Kitchen Display</h2><label><input type="checkbox" ${auto?'checked':''} onchange="auto=this.checked;draw()"> Auto-print new orders</label></div>${q.length?'':'<p class="m">No open tickets.</p>'}<div class="g">${q.map(o=>{const cd=countdownInfo(o.t); return `<div class="c"><div class="r"><b>${tbl(o)} · #${o.id}</b><span class="tag ${o.status}">${o.status}</span><span class="${cd.tone}">${cd.label}</span></div>${deliveryInfo(o)}<div class="m">大人 ${o.adultCount || 0} · 子ども ${o.childCount || 0} · ${o.guestType || 'All'} · アレルギー ${o.allergy || 'なし'}${noteInfo(o)}</div>${o.items.map(i=>`<div>${i.q}× ${i.n}</div>`).join('')}<div class="m">${new Date(o.t).toLocaleTimeString()} · 20:00 countdown</div><div class="r">${orderAction(o)}<button onclick="printTicket(${o.id})">Print</button></div></div>`}).join('')}</div>`}
async function setS(id,s){const order=orders.find(o=>o.id==id);if(!order)return;try{await window.firebaseSync.updateOrder(order.key,{status:s})}catch(error){syncError=error.message;draw()}}
// Register
let disc=0,meth='QR pay',receiptHistory=[],showReceiptHistory=false;
const grp=o=>o.type==='delivery'?'D'+o.key:String(o.table);
const grpLabel=g=>g[0]==='D'?'配達 '+escapeHtml(orders.find(o=>grp(o)===g)?.customer?.name||''):'Table '+g;
const tl=r=>/^\d+$/.test(r.table)?'Table '+r.table:escapeHtml(r.table);
function register(){
 if(!staffSignedIn)return staffGate();
 if(receipt){const r=receipt;return `<section class="receipt-paper"><div style="text-align:center;font-weight:700">あじまるや</div><div class="receipt-label">レシート</div><h2 class="receipt-title">領収書</h2><label class="noprint">宛名<input class="receipt-name-input" placeholder="宛名を入力" value="${escapeHtml(r.name||'')}" oninput="setReceiptName(this.value)"></label><div class="receipt-recipient"><span>お名前</span><span class="receipt-recipient-name" id="receipt-name-preview">${escapeHtml(r.name||'')}</span><span class="receipt-recipient-line"></span><span>様</span></div><div class="receipt-meta">発行日 ${new Date(r.t).toLocaleString()}<br>${tl(r)}</div><div class="receipt-items">${r.items.map(i=>`<div class="r"><span>${i.n} × ${i.q}</span><span>${yen(i.p*i.q)}</span></div>`).join('')}</div><div class="r"><span>小計</span><span>${yen(r.sub)}</span></div>${r.disc?`<div class="r"><span>割引 (${r.disc}%)</span><span>−${yen(r.sub-r.tot)}</span></div>`:''}<div class="r receipt-total"><b>領収金額</b><b>${yen(r.tot)}</b></div><div class="r"><span>お支払い</span><span>${r.meth}</span></div><div class="receipt-thanks">上記正に領収いたしました</div><div class="r noprint"><button class="p" onclick="window.print()">印刷</button><button onclick="receipt=null;draw()">戻る</button></div></section>`}
 if(showReceiptHistory)return `<div class="r"><h2>領収書履歴</h2><button onclick="showReceiptHistory=false;draw()">戻る</button></div>${receiptHistory.length?receiptHistory.map((r,i)=>`<div class="c r"><span>${tl(r)} · ${new Date(r.t).toLocaleString()} · ${yen(r.tot)} · ${r.meth}</span><button onclick="openReceipt(${i})">再表示</button></div>`).join(''):'<p class="m">領収書はまだありません。</p>'}`;
 const tabs=[...new Set(orders.filter(o=>!o.paid).map(grp))].sort((a,b)=>(a[0]==='D')-(b[0]==='D')||a.localeCompare(b,undefined,{numeric:true}));
 if(!tabs.includes(sel))sel=tabs[0]||null;
 let body='<p class="m">No open tables.</p>';
 if(sel){const os=orders.filter(o=>grp(o)===sel&&!o.paid),items=os.flatMap(o=>o.items),sub=os.reduce((s,o)=>s+total(o),0),tot=sub*(1-disc/100);
  const orderList=os.map(o=>`<div class="c" style="margin-top:8px"><div class="r"><b>Order #${o.id}</b><button onclick="deleteOrder(${o.id})">Delete</button></div>${deliveryInfo(o)}${o.items.map(i=>`<div class="r"><span>${i.q}× ${i.n}</span><span>${yen(i.p*i.q)}</span></div>`).join('')}<div class="m">大人 ${o.adultCount||0} · 子ども ${o.childCount||0} · ${o.guestType||'All'} · アレルギー ${o.allergy||'なし'}${noteInfo(o)}</div></div>`).join('');
  body=`<div class="c">${orderList || '<p class="m">No orders.</p>'}<hr><div class="r"><span>Subtotal</span><span>${yen(sub)}</span></div>
  <div class="r"><span>Discount %</span><input type="number" min="0" max="100" value="${disc}" style="width:80px" onchange="disc=Math.min(100,Math.max(0,+this.value||0));draw()"></div>
  <div class="r"><span>Payment</span><select onchange="meth=this.value">${['Cash','Card','QR pay'].map(m=>`<option ${m==meth?'selected':''}>${m}</option>`).join('')}</select></div>
  <div class="r"><b>Total</b><b>${yen(tot)}</b></div><button class="p" onclick="closeT()">Close table</button></div>`}
 return `<div class="r"><h2>Register 会計</h2><button onclick="showReceiptHistory=true;draw()">領収書履歴 (${receiptHistory.length})</button></div><div class="r" style="justify-content:flex-start;flex-wrap:wrap">${tabs.map(t=>`<button class="${t==sel?'p':''}" onclick="sel='${t}';draw()">${grpLabel(t)}</button>`).join('')}</div>${body}`}
function setReceiptName(name){if(!receipt)return;receipt.name=name;const index=receiptHistory.indexOf(receipt);if(index>=0)try{localStorage.setItem('hh_receipts',JSON.stringify(receiptHistory))}catch(e){}const preview=document.getElementById('receipt-name-preview');if(preview)preview.textContent=name}
function openReceipt(index){receipt=receiptHistory[index];showReceiptHistory=false;draw()}
function deleteOrder(id){
 const order=orders.find(o=>o.id===id);if(!order)return;
 window.firebaseSync.deleteOrder(order.key).catch(error=>{syncError=error.message;draw()});
}
async function closeT(){const os=orders.filter(o=>grp(o)===sel&&!o.paid),sub=os.reduce((s,o)=>s+total(o),0),at=Date.now();
 try{await Promise.all(os.map(o=>window.firebaseSync.updateOrder(o.key,{paid:true,status:'served',payment:{meth,disc,at}})))}catch(error){syncError=error.message;draw();return}
 receipt={table:sel[0]==='D'?'配達':sel,items:os.flatMap(o=>o.items),sub,disc,tot:sub*(1-disc/100),meth,t:at};receiptHistory.unshift(receipt);try{localStorage.setItem('hh_receipts',JSON.stringify(receiptHistory))}catch(e){}disc=0;draw()}
// QR sheet
let qbase='';
function qr(){const b=qbase||base();return `<h2>Table QR Sheet (1–40)</h2><div class="c noprint" style="margin-bottom:10px"><div class="m">Page address customers will open (must be reachable from their phones)</div><input value="${b}" style="width:100%;box-sizing:border-box" onchange="qbase=this.value.trim();draw()">${/^file:/i.test(b)?'<p style="color:var(--warn)">⚠ file:// addresses only work on this PC. Host the page, then paste its public https address here.</p>':''}</div><p class="m noprint">Each QR code opens the Customer page for that table only. <button onclick="window.print()">Print</button></p><div class="g"><div class="c qr"><div data-qd="1"></div><b>配達 (Delivery)</b></div>${Array.from({length:40},(_,i)=>`<div class="c qr"><div data-q="${i+1}"></div><b>Table ${i+1}</b></div>`).join('')}</div>`}
load();
buildNav();
setInterval(()=>{if(view==='kitchen')draw();if(view==='settings'){const s=dsettings(),h=document.getElementById('live-h'),d=document.getElementById('live-d');if(h)h.textContent=bannerText('営業時間',s.hours);if(d)d.textContent=bannerText('配達受付',s.delivery)}},1000);
draw();
