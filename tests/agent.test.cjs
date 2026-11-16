const {test}=require('node:test');
const assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const root=join(__dirname,'../dist');
function setup({webmcp=false,failRegistration=false}={}){
 const dom=new JSDOM(readFileSync(join(root,'index.html'),'utf8'),{url:'https://workspace.test/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
 Object.defineProperty(w.HTMLElement.prototype,'innerText',{get(){return this.textContent},set(v){this.textContent=v}});w.document.execCommand=()=>true;
 const registered=[];
 if(webmcp)w.document.modelContext={registerTool(tool,options){if(failRegistration)throw new Error('Unsupported browser registration');registered.push({tool,options})}};
 for(const name of ['editor.js','database.js','app.js','agent.js'])w.eval(readFileSync(join(root,name),'utf8'));
 return {dom,w,registered,api:w.NotionAgent,read:()=>JSON.parse(w.localStorage.getItem('notion-workspace-v1'))};
}
test('page actions persist, update visible content, and return detached data',t=>{
 const {dom,w,api,read}=setup();t.after(()=>dom.window.close());
 const page=api.execute('notion_create_page',{title:'Agent plan',blocks:[{type:'todo',text:'Ship it',checked:false}]});
 assert.equal(page.blocks.length,1);assert.ok(page.id);assert.equal(read().pages.at(-1).title,'Agent plan');
 page.blocks[0].text='Mutating a returned value must not mutate storage';
 assert.equal(api.execute('notion_read_page',{id:page.id}).blocks[0].text,'Ship it');
 api.execute('notion_append_blocks',{id:page.id,blocks:[{type:'h2',text:'Next steps'}]});
 api.execute('notion_update_page',{id:page.id,title:'Ready',favorite:true});
 api.execute('notion_open_page',{id:page.id});
 assert.equal(w.document.querySelector('.page-title').textContent,'Ready');
 assert.equal(w.document.querySelectorAll('.ed-block').length,2);
 assert.equal(w.document.documentElement.dataset.currentPage,page.id);
 assert.equal(api.execute('notion_list_pages',{query:'Ready'})[0].favorite,true);
 api.execute('notion_trash_page',{id:page.id});
 assert.equal(api.execute('notion_list_pages',{query:'Ready'}).length,0);
 assert.equal(api.execute('notion_list_pages',{query:'Ready',includeTrash:true})[0].trashed,true);
 api.execute('notion_restore_page',{id:page.id});
 assert.equal(api.execute('notion_list_pages',{query:'Ready'}).length,1);
});
test('invalid agent input fails without changing saved pages or tasks',t=>{
 const {dom,api,w}=setup();t.after(()=>dom.window.close());
 const before=w.localStorage.getItem('notion-workspace-v1');const taskCount=api.execute('notion_list_tasks').length;
 for(const [name,input] of [
  ['notion_create_page',{title:'   '}],
  ['notion_create_page',{title:'Bad',blocks:[{type:'text',text:'Hi',html:'<img onerror=alert(1)>'}]}],
  ['notion_create_page',{title:'Bad',parentId:'missing'}],
  ['notion_append_blocks',{id:'studio',blocks:[{type:'text',text:'Bad'}]}],
  ['notion_create_task',{title:'Bad',status:'Invented status'}],
  ['notion_create_task',{title:'Bad',date:'2026-02-31'}],
  ['notion_update_task',{id:'missing',title:'Bad'}],
  ['notion_create_page',{title:'Bad',private:'yes'}],
  ['notion_nonexistent',{}]
 ])assert.throws(()=>api.execute(name,input));
 assert.equal(w.localStorage.getItem('notion-workspace-v1'),before);
 assert.equal(api.execute('notion_list_tasks').length,taskCount);
});
test('task actions and visible forms share persistence and validation',t=>{
 const {dom,w,api}=setup();t.after(()=>dom.window.close());
 const created=api.execute('notion_create_task',{title:'Verify the release',status:'In progress',date:'2026-11-20'});
 api.execute('notion_open_page',{id:'projects'});
 assert.ok(w.document.querySelector('.db-table').textContent.includes('Verify the release'));
 const updated=api.execute('notion_update_task',{id:created.id,status:'Done'});
 assert.equal(updated.status,'Done');
 const stored=JSON.parse(w.localStorage.getItem('notion-tasks-v1'));
 assert.equal(stored.find(x=>x.id===created.id).status,'Done');
 w.document.querySelector('[data-action="new"]').click();
 const form=w.document.querySelector('.db-task-form');form.querySelector('[name="title"]').value='Created through the UI';
 form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 assert.equal(api.execute('notion_list_tasks',{query:'Created through the UI'}).length,1);
 assert.equal(api.execute('notion_list_tasks',{status:'Done'}).some(x=>x.id===created.id),true);
});
test('WebMCP adapter registers actionable tools and rejects invalid arguments',async t=>{
 const {dom,w,api,registered}=setup({webmcp:true});t.after(()=>dom.window.close());
 const result=await api.ready;assert.equal(result.registered,11);assert.equal(registered.length,11);
 const create=registered.find(r=>r.tool.name==='notion_create_page');
 const page=create.tool.execute({title:'WebMCP page'});
 assert.equal(api.execute('notion_read_page',{id:page.id}).title,'WebMCP page');
 assert.throws(()=>create.tool.execute({title:13}));
 w.dispatchEvent(new w.Event('pagehide'));assert.equal(create.options.signal.aborted,true);
});
test('ordinary UI and JavaScript tools work when WebMCP is unavailable or registration fails',async t=>{
 for(const settings of [{},{webmcp:true,failRegistration:true}]){
  const {dom,w,api}=setup(settings);t.after(()=>dom.window.close());
  const result=await api.ready;
  assert.equal(result.registered,0);
  assert.ok(w.document.querySelector('#search'));
  assert.equal(api.execute('notion_list_pages').length,3);
  assert.equal(result.supported,!!settings.webmcp);
 }
});
