/* The index includes public HTML and configured CSV sources, built on each update. */
(() => {
 const form=document.getElementById('site-search-form');if(!form)return;
 const input=document.getElementById('site-search-input'),game=document.getElementById('site-search-game'),results=document.getElementById('site-search-results'),status=document.getElementById('search-status'),more=document.getElementById('search-more');
 let index=null,pending=null,limit=20,serial=0;
 const normalize=s=>String(s).normalize('NFKC').toLowerCase().replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60));
 function load(){
  if(index)return Promise.resolve(index);
  if(!pending)pending=fetch('search_index.json').then(r=>{if(!r.ok)throw new Error('index');return r.json();}).then(rows=>index=rows.map(row=>({...row,hay:normalize(row.title+' '+row.text),key:normalize(row.title)}))).catch(e=>{pending=null;throw e;});
  return pending;
 }
 async function render(){
  const request=++serial,q=normalize(input.value.trim());results.replaceChildren();results.hidden=true;more.hidden=true;
  if(!q){status.textContent='作品・アイテム名・場所などから探せます。';return;}
  status.textContent='検索データを読み込んでいます…';
  try{
   const rows=await load();if(request!==serial)return;
   const tokens=q.split(/\s+/);
   const hits=rows.filter(r=>(game.value==='all'||r.games.includes(game.value))&&tokens.every(t=>r.hay.includes(t))).map(r=>({r,score:r.key===q?100:tokens.every(t=>r.key.includes(t))?50:r.kind==='ページ'?10:1})).sort((a,b)=>b.score-a.score).map(x=>x.r);
   status.textContent=hits.length?`${hits.length}件見つかりました（${Math.min(limit,hits.length)}件表示）。`:'見つかりませんでした。作品の指定を変えるか、短い言葉でお試しください。';
   const fragment=document.createDocumentFragment();
   hits.slice(0,limit).forEach(row=>{
    const a=document.createElement('a');a.className='search-result';a.href=row.url;
    const meta=document.createElement('small');meta.textContent=(row.games.length?row.games.map(g=>g.toUpperCase()).join('・'):'サイト情報')+' / '+row.kind;
    const title=document.createElement('strong');title.textContent=row.title;
    const snippet=document.createElement('p');const at=normalize(row.text).indexOf(tokens[0]);const start=Math.max(0,at-35);snippet.textContent=(start?'…':'')+row.text.slice(start,start+140)+(row.text.length>start+140?'…':'');
    a.append(meta,title,snippet);fragment.append(a);
   });
   results.append(fragment);results.hidden=!hits.length;more.hidden=hits.length<=limit;
  }catch(e){if(request===serial)status.textContent='検索データを読み込めませんでした。通信を確認して「検索」を押してください。';}
 }
 let timer;
 input.addEventListener('input',()=>{serial++;clearTimeout(timer);limit=20;timer=setTimeout(render,180);});
 game.addEventListener('change',()=>{clearTimeout(timer);limit=20;render();});
 form.addEventListener('submit',e=>{e.preventDefault();clearTimeout(timer);limit=20;render();});
 more.addEventListener('click',()=>{limit+=20;render();});
})();
