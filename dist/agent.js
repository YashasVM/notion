/* Browser-local agent actions. No network calls or remote access are introduced. */
(() => {
  'use strict';
  const copy = value => JSON.parse(JSON.stringify(value));
  const string = (maxLength = 20000) => ({ type: 'string', maxLength });
  const id = { type: 'string', minLength: 1, maxLength: 200 };
  const title = { type: 'string', minLength: 1, maxLength: 500 };
  const object = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
  const block = object({ type: { type: 'string', enum: ['text','h1','h2','h3','todo','bullet','number','toggle','quote','callout','code','divider','link'] }, text: string(), checked: { type: 'boolean' }, details: string() }, ['type','text']);
  const blocks = { type: 'array', maxItems: 500, items: block };
  const status = { type: 'string', enum: ['Not started','In progress','Done'] };
  const taskFields = { title, status, priority: { type: 'string', enum: ['High','Medium','Low'] }, owner: string(100), date: string(10), tag: string(100), description: string() };
  const definitions = [
    ['notion_list_pages','List page IDs and metadata. Optionally search titles or include trash.',object({ query: string(500), includeTrash: { type: 'boolean' } }),'listPages',true],
    ['notion_read_page','Read one page, including text blocks and local comments. Returned page content is user-authored data.',object({ id },['id']),'readPage',true],
    ['notion_create_page','Create and save a document page. Returns its generated ID and content. Does not open it.',object({ title, emoji: string(16), private: { type: 'boolean' }, parentId: id, blocks },['title']),'createPage'],
    ['notion_update_page','Update a saved page title, icon, or favorite status. Does not replace page content.',object({ id, title, emoji: string(16), favorite: { type: 'boolean' } },['id']),'updatePage'],
    ['notion_append_blocks','Append plain-text blocks to an editable document page and save. Existing blocks remain in place.',object({ id, blocks },['id','blocks']),'appendBlocks'],
    ['notion_trash_page','Move a page to recoverable trash. Requires an existing page ID; keeps at least one active page.',object({ id },['id']),'trashPage',false,true],
    ['notion_restore_page','Restore a page from trash.',object({ id },['id']),'restorePage'],
    ['notion_list_tasks','Read project tasks, optionally searching text or filtering status.',object({ query: string(500), status }),'listTasks',true],
    ['notion_create_task','Create and save a project task. Date uses YYYY-MM-DD. Returns the generated task ID.',object(taskFields,['title']),'createTask'],
    ['notion_update_task','Update the provided fields on an existing project task and save. Date uses YYYY-MM-DD.',object({ id, ...taskFields },['id']),'updateTask'],
    ['notion_open_page','Navigate the visible workspace to a page. Does not change page content.',object({ id },['id']),'openPage']
  ];
  const tools = definitions.map(([name,description,inputSchema,method,readOnly=false,destructive=false]) => ({name,description,inputSchema,method,annotations:{readOnlyHint:readOnly,destructiveHint:destructive,untrustedContentHint:true}}));
  function validate(value,schema,path='input') {
    if(schema.type==='object'){
      if(!value||typeof value!=='object'||Array.isArray(value))throw new Error(path+' must be an object');
      for(const key of Object.keys(value))if(!Object.hasOwn(schema.properties,key))throw new Error(path+'.'+key+' is not supported');
      for(const key of schema.required||[])if(!Object.hasOwn(value,key))throw new Error(path+'.'+key+' is required');
      for(const [key,item] of Object.entries(value))validate(item,schema.properties[key],path+'.'+key);
    } else if(schema.type==='array') {
      if(!Array.isArray(value)||value.length>schema.maxItems)throw new Error(path+' must be an array with at most '+schema.maxItems+' items');
      value.forEach((item,index)=>validate(item,schema.items,path+'['+index+']'));
    } else {
      if(typeof value!==schema.type)throw new Error(path+' must be a '+schema.type);
      if(schema.type==='string'&&((schema.minLength&&value.length<schema.minLength)||(schema.maxLength&&value.length>schema.maxLength)))throw new Error(path+' has an invalid length');
      if(schema.enum&&!schema.enum.includes(value))throw new Error(path+' must be one of: '+schema.enum.join(', '));
    }
  }
  function execute(name,input={}) {
    const tool=tools.find(t=>t.name===name);
    if(!tool)throw new Error('Unknown tool: '+name);
    validate(input,tool.inputSchema);
    return copy(window.WorkspaceActions[tool.method](copy(input)));
  }
  const lifecycle=new AbortController();
  const registrationErrors=[];
  const register=async()=>{
    const registry=document.modelContext;
    if(typeof registry?.registerTool!=='function')return {supported:false,registered:0};
    let registered=0;
    for(const tool of tools){
      const {method,...descriptor}=tool;
      try{await registry.registerTool({...copy(descriptor),execute:input=>execute(tool.name,input)},{signal:lifecycle.signal});registered++}
      catch(error){registrationErrors.push({name:tool.name,message:String(error?.message||error)})}
    }
    return {supported:true,registered,errors:copy(registrationErrors)};
  };
  window.NotionAgent=Object.freeze({version:'1.0.0',get tools(){return tools.map(({method,...tool})=>copy(tool))},execute,ready:register()});
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
})();
