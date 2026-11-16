const {test}=require('node:test');const assert=require('node:assert/strict');const {JSDOM}=require('jsdom');const fs=require('node:fs');const path=require('node:path');const root=path.join(__dirname,'../dist');
function setup({forceHover=false}={}){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://workspace.test/',runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window;let onAppearance;
 const appearance={matches:false,addEventListener(name,fn){onAppearance=fn}};
 w.matchMedia=()=>appearance;w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
 Object.defineProperty(w.HTMLElement.prototype,'innerText',{get(){return this.textContent},set(v){this.textContent=v}});w.document.execCommand=()=>true;
 for(const name of ['style.css','motion.css','polish.css']){const style=w.document.createElement('style');style.textContent=fs.readFileSync(path.join(root,name),'utf8');w.document.head.append(style)}
 for(const name of ['editor.js','database.js','app.js','agent.js'])w.eval(fs.readFileSync(path.join(root,name),'utf8'));
 if(forceHover)for(const style of w.document.querySelectorAll('style'))style.textContent=style.textContent.replaceAll(':hover','[data-test-hover]');
 const $=s=>w.document.querySelector(s),click=s=>{assert($(s),'Missing '+s);$(s).click()};
 return {dom,w,$,click,appearance,changeAppearance(){onAppearance?.()},api:w.NotionAgent};
}
const tick=()=>new Promise(resolve=>queueMicrotask(resolve));
function contrast(a,b){function lum(color){const hex=color.replace('#','');const rgb=hex.length===6?[0,2,4].map(n=>parseInt(hex.slice(n,n+2),16)):color.match(/[\d.]+/g).slice(0,3).map(Number);return rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0)}const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
test('task fields retain readable foreground and background through hover/focus in both themes',async t=>{
 const {dom,w,$,click,api}=setup({forceHover:true});t.after(()=>w.close());
 api.execute('notion_open_page',{id:'projects'});click('[data-action="new"]');await tick();
 for(const dark of [false,true]){
  w.document.body.classList.toggle('dark',dark);
  const token=name=>w.getComputedStyle(w.document.body).getPropertyValue(name).trim()||w.getComputedStyle(w.document.documentElement).getPropertyValue(name).trim();
  const resolve=value=>value.startsWith('var(')?token(value.slice(4,-1)):value;
  for(const selector of ['select[name="owner"]','select[name="priority"]','input[name="date"]','input[name="tag"]']){
   const el=$(selector);el.setAttribute('data-test-hover','');
   let style=w.getComputedStyle(el);assert.ok(contrast(resolve(style.color),resolve(style.backgroundColor==='rgba(0, 0, 0, 0)'?style.background:style.backgroundColor))>=4.5,`${selector} hover contrast in ${dark?'dark':'light'}`);
   el.focus();style=w.getComputedStyle(el);assert.ok(contrast(resolve(style.color),resolve(style.backgroundColor==='rgba(0, 0, 0, 0)'?style.background:style.backgroundColor))>=4.5,`${selector} focus contrast`);el.blur();el.removeAttribute('data-test-hover');
  }
 }
});
test('dialogs receive keyboard focus, trap Tab, and restore the trigger when closed',async t=>{
 const {w,$,click}=setup();t.after(()=>w.close());$('#settings').focus();click('#settings');await tick();
 assert.ok($('.modal').contains(w.document.activeElement));assert.ok(w.document.body.classList.contains('dialog-open'));
 const last=$('#save-settings');last.focus();last.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));assert.equal(w.document.activeElement,$('.modal .close'));
 click('.close');assert.equal(w.document.activeElement,$('#settings'));assert.equal(w.document.body.classList.contains('dialog-open'),false);
});
test('renaming a page updates its breadcrumb and sidebar without losing the editor',t=>{
 const {w,$}=setup();t.after(()=>w.close());const title=$('.page-title');title.textContent='A clearer title';title.dispatchEvent(new w.Event('input',{bubbles:true}));
 assert.ok($('.breadcrumbs').textContent.includes('A clearer title'));assert.equal($('.side-row[data-page="studio"] .nav-label').textContent,'A clearer title');
 assert.equal(w.document.title,'A clearer title | Notion');assert.equal(w.document.querySelectorAll('#workspace').length,1);assert.equal($('#collapse').tagName,'BUTTON');
});
test('menus and database tabs support arrow navigation and search opens above task dialogs',async t=>{
 const {w,$,click,api}=setup();t.after(()=>w.close());api.execute('notion_open_page',{id:'projects'});
 click('[data-action="filter"]');const first=$('.db-popover button');first.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));assert.notEqual(w.document.activeElement,first);
 w.document.activeElement.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));assert.equal($('.db-popover'),null);
 const tab=$('[data-view="table"]');tab.focus();tab.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));assert.equal(w.document.activeElement.dataset.view,'board');assert.equal($('[data-view="board"]').getAttribute('aria-selected'),'true');
 click('[data-action="new"]');await tick();w.document.activeElement.dispatchEvent(new w.KeyboardEvent('keydown',{key:'k',ctrlKey:true,bubbles:true,cancelable:true}));await tick();assert.equal($('.db-modal-overlay'),null);assert.equal(w.document.activeElement,$('#search-query'));
});
test('mobile sidebar dismisses via backdrop and appearance follows the system without rerendering',t=>{
 const {w,$,click,appearance,changeAppearance}=setup();t.after(()=>w.close());Object.defineProperty(w,'innerWidth',{value:390,writable:true});click('#mobile-menu');assert.equal($('#sidebar-backdrop').hidden,false);assert.equal($('#mobile-menu').getAttribute('aria-expanded'),'true');click('#sidebar-backdrop');assert.equal($('#sidebar-backdrop').hidden,true);
 click('#settings');$('#theme').value='system';click('#save-settings');const title=$('.page-title');appearance.matches=true;changeAppearance();assert.equal(w.document.body.classList.contains('dark'),true);assert.equal(w.document.documentElement.style.colorScheme,'dark');assert.equal($('.page-title'),title);
});
test('backups include saved tasks and imports preserve existing pages while remapping nested pages',async t=>{
 const {w,$,click,api}=setup();t.after(()=>w.close());let exported;api.execute('notion_create_task',{title:'Existing task'});
 w.Blob=class{constructor(parts){this.parts=parts}};w.URL.createObjectURL=blob=>{exported=JSON.parse(blob.parts[0]);return 'blob:test'};w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=()=>{};
 click('#settings');click('#backup');assert.equal(exported.tasks.length,1);
 let pending;const backup={pages:[{id:'parent',title:'Imported parent',blocks:[]},{id:'child',parent:'parent',title:'Imported child',blocks:[]}],tasks:[{id:'import-task',title:'Imported task',status:'Not started',priority:'High',owner:'Alex',date:'',tag:'Import',description:''}]};
 const originalClick=w.HTMLInputElement.prototype.click;w.HTMLInputElement.prototype.click=function(){if(this.type==='file'){Object.defineProperty(this,'files',{value:[{text:async()=>JSON.stringify(backup)}]});pending=this.onchange()}else originalClick.call(this)};
 click('#restore');await pending;
 const pages=api.execute('notion_list_pages');const parent=pages.find(p=>p.title==='Imported parent'),child=pages.find(p=>p.title==='Imported child');assert.equal(child.parentId,parent.id);assert.equal(pages.length,5);assert.equal(api.execute('notion_list_tasks').length,2);
 api.execute('notion_open_page',{id:'projects'});assert.ok($('.db-table').textContent.includes('Imported task'));assert.ok($('.db-table').textContent.includes('Existing task'));
});
test('duplicating the home page retains its content and deleting it synchronizes the URL',t=>{
 const {w,$,click}=setup();t.after(()=>w.close());click('#more');click('[data-duplicate]');assert.equal(w.document.querySelectorAll('.project-card').length,0);click('#more');click('[data-delete]');assert.equal(w.location.hash.slice(1),w.document.documentElement.dataset.currentPage);
});
