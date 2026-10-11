// Shared enhancements; existing page calculations and CSV loaders stay independent.
(() => {
  function wrapTables(){
    document.querySelectorAll('.site-content table').forEach(table=>{
      if(table.closest('.table-wrap,.table-scroll'))return;
      const wrap=document.createElement('div');wrap.className='table-scroll';wrap.tabIndex=0;
      wrap.setAttribute('role','region');wrap.setAttribute('aria-label','データ表（横スクロールできます）');
      table.before(wrap);wrap.append(table);
    });
  }
  wrapTables();
  const root=document.querySelector('.site-content');
  if(root)new MutationObserver(wrapTables).observe(root,{childList:true,subtree:true});
  // Direct links to each database tab from the game hub.
  function openTab(){
    const id=location.hash.slice(1);
    const tab=Array.from(document.querySelectorAll('.tab-btn')).find(b=>b.dataset.target===id);
    if(tab)tab.click();
  }
  openTab();window.addEventListener('hashchange',openTab);
})();
