const toMin=t=>{const m=/^(\d{2}):(\d{2})$/.exec(t||'');return m?(+m[1])*60+(+m[2]):null};
const pad2=n=>String(n).padStart(2,'0');
const fmtMin=m=>{m=((Math.round(m)%1440)+1440)%1440;return pad2(Math.floor(m/60))+':'+pad2(m%60)};
const fmtRemain=sec=>{const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return h?`${h}時間${pad2(m)}分${pad2(s)}秒`:`${m}分${pad2(s)}秒`};
// cfg: {open:'HH:MM',close:'HH:MM',extra:minutes added to close (negative shortens),closed:manual stop}
function openState(cfg){
 if(!cfg)return {open:true,known:false};
 if(cfg.closed)return {open:false,known:true,manual:true};
 const o=toMin(cfg.open),c=toMin(cfg.close);
 if(o===null||c===null)return {open:true,known:false};
 const extra=Number(cfg.extra)||0,end=c+extra,now=new Date();
 const n=now.getHours()*60+now.getMinutes()+now.getSeconds()/60;
 const span=((end-o)%1440+1440)%1440||1440,since=((n-o)%1440+1440)%1440;
 const open=since<span;
 return {open,known:true,extra,endText:fmtMin(end),remainSec:open?Math.ceil((span-since)*60):0};
}
function bannerText(label,cfg){
 const st=openState(cfg);
 if(!st.known)return '';
 if(st.manual)return `${label}：現在受付を停止しています`;
 const range=`${cfg.open}〜${st.endText}`;
 if(!st.open)return `${label}：時間外（${range}）`;
 const ext=st.extra>0?`（延長 +${st.extra}分）`:st.extra<0?`（短縮 ${st.extra}分）`:'';
 return `${label}：受付中 ${range}${ext} ・ 残り ${fmtRemain(st.remainSec)}`;
}
