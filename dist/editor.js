(() => {
  const CSS = `
.ed-editor{position:relative;font:16px/1.65 var(--font-ui);color:var(--text,#37352f);padding:5px 0 100px;min-height:180px}.ed-block{position:relative;min-height:30px;margin:2px 0;display:flex;align-items:flex-start;gap:8px;border-radius:3px}.ed-block.ed-dragging{opacity:.45}.ed-controls{position:absolute;left:-48px;top:3px;display:flex;gap:0;opacity:0;transition:opacity .1s}.ed-block:hover>.ed-controls,.ed-block:focus-within>.ed-controls{opacity:1}.ed-control{width:23px;height:26px;padding:0!important;display:grid;place-items:center;border:0;background:transparent;color:#9b9a97;cursor:pointer;font:20px/1 Arial;border-radius:3px}.ed-control:hover{background:var(--hover,#efefed);color:var(--text,#37352f)}.ed-handle{font-size:17px;letter-spacing:-3px;cursor:pointer}.ed-content{outline:none;flex:1;min-width:0;min-height:27px;white-space:pre-wrap;overflow-wrap:anywhere;border-radius:3px}.ed-content:empty:before{content:attr(data-placeholder);color:#aaa9a6;pointer-events:none}.ed-h1{margin-top:24px}.ed-h1 .ed-content{font-size:29px;font-weight:650;line-height:1.35;letter-spacing:-.55px}.ed-h2{margin-top:19px}.ed-h2 .ed-content{font-size:23px;font-weight:650;line-height:1.45;letter-spacing:-.3px}.ed-h3{margin-top:14px}.ed-h3 .ed-content{font-size:19px;font-weight:650;line-height:1.5}.ed-prefix{flex:none;width:19px;text-align:center;line-height:27px;user-select:none}.ed-todo input{margin:6px 1px 0;width:16px;height:16px;accent-color:#2383e2;flex:none;cursor:pointer}.ed-done .ed-content{text-decoration:line-through;color:#9b9a97}.ed-quote{border-left:3px solid currentColor;padding:1px 0 1px 15px;margin:10px 0}.ed-callout{background:var(--callout,#f5f5f3);border-radius:4px;padding:15px 17px;margin:12px 0;gap:12px}.ed-callout .ed-controls{top:15px}.ed-code{background:var(--callout,#f7f6f3);border-radius:4px;padding:24px 20px;margin:12px 0}.ed-code .ed-content{font:13px/1.7 var(--font-mono)}.ed-code:before{content:'Plain text';position:absolute;right:13px;top:3px;font-size:10px;color:#9b9a97}.ed-divider{padding:12px 0;min-height:27px}.ed-divider hr{border:0;border-top:1px solid var(--line,#e9e9e7);width:100%;margin:0}.ed-toggle-button{border:0;background:transparent;color:inherit;padding:2px 0;cursor:pointer;line-height:25px;width:19px}.ed-toggle .ed-content{margin-left:0}.ed-toggle{flex-wrap:wrap;column-gap:8px;row-gap:0}.ed-toggle>.ed-content{flex-basis:calc(100% - 27px)}.ed-toggle-details{margin:2px 0 4px 27px;flex-basis:calc(100% - 27px);outline:none;min-height:27px;white-space:pre-wrap}.ed-toggle-details:empty:before{content:attr(data-placeholder);color:#aaa9a6}.ed-toggle.ed-folded>.ed-toggle-details{display:none}.ed-block code{font:85% var(--font-mono);background:#f1f1ef;color:#eb5757;padding:2px 4px;border-radius:3px}.ed-link .ed-content{text-decoration:underline;text-decoration-color:#ccc;text-underline-offset:3px}.ed-menu{position:fixed;z-index:400;background:var(--bg,#fff);color:var(--text,#37352f);border:1px solid var(--line,#e9e9e7);border-radius:7px;box-shadow:0 5px 20px #0002,0 0 1px #0002;padding:5px;min-width:235px;max-width:310px;max-height:360px;overflow:auto;font:14px/1.4 var(--font-ui)}.ed-menu-title{padding:8px 9px 5px;color:#9b9a97;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.4px}.ed-menu-item{display:flex;align-items:center;gap:11px;padding:7px 9px;border-radius:4px;cursor:pointer;width:100%;border:0;background:transparent;color:inherit;text-align:left;font:inherit}.ed-menu-item:hover,.ed-menu-item.ed-selected{background:var(--hover,#f1f1ef)}.ed-menu-icon{height:31px;min-width:31px;border:1px solid var(--line,#e9e9e7);border-radius:4px;display:grid;place-items:center;background:var(--bg,#fff);font-size:18px}.ed-menu-copy{display:flex;flex-direction:column}.ed-menu-copy small{font-size:11px;color:#9b9a97}.ed-menu-separator{height:1px;background:var(--line,#e9e9e7);margin:5px -5px}.ed-empty-add{color:#aaa9a6;cursor:text;padding:4px 0}.ed-toolbar{position:fixed;z-index:450;display:flex;background:var(--bg,#fff);border:1px solid var(--line,#e9e9e7);border-radius:5px;box-shadow:0 4px 15px #0002;padding:3px}.ed-toolbar button{font-family:inherit;font-size:14px;line-height:1.4;background:none;border:0;border-radius:3px;height:29px;min-width:31px;color:inherit;cursor:pointer}.ed-toolbar button:hover{background:var(--hover,#eee)}.ed-toolbar button+button{border-left:1px solid var(--line,#eee)}@media(max-width:650px){.ed-controls{left:-27px}.ed-control:first-child{display:none}.ed-editor{font-size:15px}.ed-menu{max-width:calc(100vw - 25px)}}`;

  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);
  const types = [
    ['text','Text','Just start writing with plain text.','T'], ['h1','Heading 1','Big section heading.','H₁'],
    ['h2','Heading 2','Medium section heading.','H₂'], ['h3','Heading 3','Small section heading.','H₃'],
    ['todo','To-do list','Track tasks with a to-do list.','☑'], ['bullet','Bulleted list','Create a simple bulleted list.','•'],
    ['number','Numbered list','Create a list with numbering.','1.'], ['toggle','Toggle list','A collapsible block.','▸'],
    ['quote','Quote','Capture a quote.','“'], ['callout','Callout','Make something stand out.','💡'],
    ['code','Code','Capture a code snippet.','‹›'], ['divider','Divider','Visually divide blocks.','—'],
    ['link','Page link','Label a page reference.','↗']
  ];
  const uid = () => Math.random().toString(36).slice(2,10);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const readText = element => typeof element.innerText === 'string' ? element.innerText : element.textContent;
  function cleanHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = String(html || '');
    template.content.querySelectorAll('script,style,iframe,object,embed').forEach(element => element.remove());
    template.content.querySelectorAll('*').forEach(element => {
      if (!['B','STRONG','I','EM','U','S','STRIKE','CODE','BR','A','SPAN'].includes(element.tagName)) {
        element.replaceWith(...element.childNodes);
        return;
      }
      for (const attribute of [...element.attributes]) element.removeAttribute(attribute.name);
    });
    return template.innerHTML;
  }
  let cleanup = () => {};
  window.Editor = {
    render(container, page, onChange = () => {}) {
      cleanup();
      let blocks = (page.blocks?.length ? page.blocks : [{id:uid(),type:'text',text:''}]).map(block => ({...block,id:block.id || uid()}));
      const root = document.createElement('div');
      root.className = 'ed-editor';
      container.replaceChildren(root);
      let menu = null, toolbar = null, slash = null, selected = 0;
      let menuItems = [], menuOrigin = null, disposed = false, selectionTimer;
      const emit = () => {
        if (disposed) return;
        page.blocks = blocks;
        onChange(blocks.map(block => ({...block})));
      };
      const getBlock = id => blocks.find(block => block.id === id);
      const getEl = id => [...root.querySelectorAll('.ed-block')].find(row => row.dataset.blockId === id)?.querySelector('.ed-content');
      function focus(id, end = true) {
        const element = getEl(id);
        if (!element) return;
        element.focus();
        const range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(!end);
        const selection = getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
      function closeMenu() {
        root.querySelectorAll('[aria-activedescendant]').forEach(element => element.removeAttribute('aria-activedescendant'));
        menu?.remove(); menu = null; slash = null; selected = 0; menuItems = []; menuOrigin = null;
      }
      function closeToolbar() { toolbar?.remove(); toolbar = null; }
      function position(element, rect) {
        element.style.left = Math.max(8, Math.min(rect.left, innerWidth - element.offsetWidth - 12)) + 'px';
        element.style.top = Math.max(8, Math.min(rect.bottom + 5, innerHeight - element.offsetHeight - 12)) + 'px';
      }
      function syncNode(element, block) {
        if (!root.contains(element) || !block) return;
        block.text = readText(element);
        block.html = cleanHTML(element.innerHTML);
        if (!block.text && !element.querySelector('code')) block.html = '';
      }
      function saveNode(element, block) { syncNode(element, block); emit(); }
      function insertAfter(id, type = 'text') {
        const block = {id:uid(),type,text:''};
        blocks.splice(blocks.findIndex(item => item.id === id) + 1, 0, block);
        emit(); paint(); focus(block.id);
        return block;
      }
      function setType(block, type, removeCommand = false) {
        block.type = type;
        if (removeCommand) { block.text = ''; delete block.html; }
        closeMenu(); emit(); paint(); focus(block.id);
      }
      function deleteBlock(block) {
        const index = blocks.indexOf(block);
        blocks.splice(index, 1);
        if (!blocks.length) blocks.push({id:uid(),type:'text',text:''});
        closeMenu(); emit(); paint(); focus(blocks[Math.max(0, index - 1)].id);
      }
      function selectMenuItem(index, moveFocus = false) {
        if (!menuItems.length || !menu) return;
        selected = (index + menuItems.length) % menuItems.length;
        const rows = [...menu.querySelectorAll('.ed-menu-item')];
        rows.forEach((row, itemIndex) => row.classList.toggle('ed-selected', itemIndex === selected));
        rows[selected]?.scrollIntoView?.({block:'nearest'});
        if (slash) getEl(slash.block.id)?.setAttribute('aria-activedescendant', rows[selected].id);
        if (moveFocus) rows[selected]?.focus();
      }
      function openMenu(rect, items, title = 'Basic blocks', origin = document.activeElement) {
        closeMenu();
        menuItems = items;
        menuOrigin = origin;
        menu = document.createElement('div');
        menu.className = 'ed-menu';
        menu.setAttribute('role','menu');
        menu.setAttribute('aria-label', title);
        const caption = document.createElement('div');
        caption.className = 'ed-menu-title'; caption.textContent = title; menu.append(caption);
        items.forEach((item, index) => {
          const row = document.createElement('button');
          row.type = 'button'; row.className = 'ed-menu-item'; row.id = 'ed-command-' + uid();
          row.dataset.menuIndex = index; row.setAttribute('role','menuitem');
          row.innerHTML = `<span class="ed-menu-icon" aria-hidden="true">${escape(item.icon || '⋮')}</span><span class="ed-menu-copy">${escape(item.name)}${item.description ? `<small>${escape(item.description)}</small>` : ''}</span>`;
          row.addEventListener('mousedown', event => event.preventDefault());
          row.addEventListener('click', () => item.action());
          row.addEventListener('focus', () => selectMenuItem(index));
          menu.append(row);
        });
        menu.addEventListener('keydown', event => {
          if (['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
            event.preventDefault();
            selectMenuItem(event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : selected + (event.key === 'ArrowDown' ? 1 : -1), true);
          } else if (event.key === 'Escape') {
            event.preventDefault(); const origin = menuOrigin; closeMenu(); origin?.focus();
          }
        });
        document.body.append(menu); position(menu, rect); selectMenuItem(0);
        if (!origin?.classList?.contains('ed-content')) menu.querySelector('.ed-menu-item')?.focus();
        return menu;
      }
      function showSlash(block, element, query = '') {
        const items = types.filter(type => (type[1] + ' ' + type[0]).toLowerCase().includes(query.toLowerCase())).map(type => ({
          name:type[1], description:type[2], icon:type[3], action:() => setType(block, type[0], true)
        }));
        openMenu(element.getBoundingClientRect(), items, items.length ? 'Basic blocks' : 'No matching blocks', element);
        slash = {block,items}; selectMenuItem(0);
      }
      function blockMenu(block, button) {
        openMenu(button.getBoundingClientRect(), [
          {name:'Turn into',description:'Choose another block type',icon:'↻',action:() => openMenu(button.getBoundingClientRect(), types.map(type => ({name:type[1],icon:type[3],action:() => setType(block,type[0])})), 'Turn into', button)},
          {name:'Duplicate',icon:'⧉',action:() => { const copy = {...block,id:uid()}; blocks.splice(blocks.indexOf(block) + 1,0,copy); closeMenu(); emit(); paint(); focus(copy.id); }},
          {name:'Move up',icon:'↑',action:() => { const index=blocks.indexOf(block); if(index>0){[blocks[index-1],blocks[index]]=[blocks[index],blocks[index-1]];emit();paint();} closeMenu();focus(block.id); }},
          {name:'Move down',icon:'↓',action:() => { const index=blocks.indexOf(block); if(index<blocks.length-1){[blocks[index+1],blocks[index]]=[blocks[index],blocks[index+1]];emit();paint();} closeMenu();focus(block.id); }},
          {name:'Delete',icon:'⌫',action:() => deleteBlock(block)}
        ],'Block actions',button);
      }
      function splitBlock(element, block, type) {
        const selection = getSelection();
        let tailHTML = '', tailText = '';
        if (selection?.rangeCount) {
          const range = selection.getRangeAt(0);
          if (element.contains(range.startContainer) && element.contains(range.endContainer)) {
            range.deleteContents();
            const tail = range.cloneRange();
            tail.setEnd(element, element.childNodes.length);
            const fragment = tail.extractContents();
            const holder = document.createElement('div'); holder.append(fragment);
            tailHTML = cleanHTML(holder.innerHTML); tailText = readText(holder);
          }
        }
        syncNode(element,block);
        if (!block.text && ['bullet','number','todo'].includes(type) && !tailText) {
          block.type = 'text'; delete block.html; emit(); paint(); focus(block.id); return;
        }
        const next = {id:uid(),type:['bullet','number','todo'].includes(type) ? type : 'text',text:tailText,html:tailHTML};
        blocks.splice(blocks.indexOf(block) + 1,0,next);
        emit(); paint(); focus(next.id,false);
      }
      function insertPlainText(element, text) {
        const selection = getSelection();
        if (!selection?.rangeCount || !element.contains(selection.anchorNode)) return;
        const range = selection.getRangeAt(0); range.deleteContents();
        const node = document.createTextNode(text); range.insertNode(node); range.setStartAfter(node); range.collapse(true);
        selection.removeAllRanges(); selection.addRange(range);
      }
      function paint() {
        closeToolbar(); root.replaceChildren(); let number=0;
        blocks.forEach(block => {
          const type = ({paragraph:'text',heading1:'h1',heading2:'h2',heading3:'h3','bulleted-list':'bullet'})[block.type] || block.type;
          number = type === 'number' ? number+1 : 0;
          const row = document.createElement('div');
          row.className = `ed-block ed-${type}${block.checked ? ' ed-done' : ''}${block.folded ? ' ed-folded' : ''}`; row.dataset.blockId=block.id;
          const controls=document.createElement('div'); controls.className='ed-controls';
          controls.innerHTML='<button class="ed-control" type="button" title="Add a block" aria-label="Add a block">+</button><button class="ed-control ed-handle" type="button" title="Block actions" aria-label="Block actions">⠿</button>';
          row.append(controls);
          controls.children[0].addEventListener('click',()=>{const next=insertAfter(block.id);showSlash(next,getEl(next.id));});
          controls.children[1].addEventListener('click',()=>blockMenu(block,controls.children[1]));
          if(type==='divider'){
            row.append(document.createElement('hr'));row.tabIndex=0;row.setAttribute('aria-label','Divider');
            row.addEventListener('keydown',event=>{if(event.key==='Backspace'){event.preventDefault();deleteBlock(block);}if(event.key==='Enter'){event.preventDefault();insertAfter(block.id);}});
            root.append(row);return;
          }
          if(type==='todo'){
            const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=!!block.checked;checkbox.setAttribute('aria-label',`Complete ${block.text || 'task'}`);
            checkbox.addEventListener('change',()=>{block.checked=checkbox.checked;row.classList.toggle('ed-done',block.checked);emit();});row.append(checkbox);
          }
          if(['bullet','number','callout','link'].includes(type)){
            const prefix=document.createElement('span');prefix.className='ed-prefix';prefix.setAttribute('aria-hidden','true');
            prefix.textContent=type==='bullet'?'•':type==='number'?number+'.':type==='callout'?'💡':'↗';row.append(prefix);
          }
          if(type==='toggle'){
            const toggle=document.createElement('button');toggle.type='button';toggle.className='ed-toggle-button';toggle.textContent=block.folded?'▸':'▾';
            toggle.setAttribute('aria-label','Toggle block');toggle.setAttribute('aria-expanded',String(!block.folded));
            toggle.addEventListener('click',()=>{block.folded=!block.folded;toggle.textContent=block.folded?'▸':'▾';toggle.setAttribute('aria-expanded',String(!block.folded));row.classList.toggle('ed-folded',block.folded);emit();});row.append(toggle);
          }
          const element=document.createElement('div');element.className='ed-content';element.contentEditable='true';element.spellcheck=type!=='code';
          element.setAttribute('role','textbox');element.setAttribute('aria-multiline','true');element.setAttribute('aria-label',types.find(item=>item[0]===type)?.[1] || 'Text block');
          element.dataset.placeholder=type==='code'?'Type code…':type==='h1'?'Heading 1':type==='h2'?'Heading 2':type==='h3'?'Heading 3':type==='todo'?'To-do':"Type '/' for commands";
          if(block.html)element.innerHTML=cleanHTML(block.html);else element.textContent=block.text||'';
          element.addEventListener('input',event=>{
            saveNode(element,block); if(event.isComposing)return;
            const text=readText(element);
            if(type!=='code'&&text.startsWith('/')&&!text.includes('\n'))showSlash(block,element,text.slice(1));else if(slash?.block===block)closeMenu();
            if(type==='code')return;
            if(text==='---'){block.type='divider';block.text='';delete block.html;emit();paint();insertAfter(block.id);return;}
            const shortcut={'# ':'h1','## ':'h2','### ':'h3','- ':'bullet','* ':'bullet','1. ':'number','[] ':'todo','> ':'quote'}[text];
            if(shortcut){block.text='';delete block.html;setType(block,shortcut);}
          });
          element.addEventListener('keydown',event=>{
            if(event.isComposing || event.keyCode===229)return;
            if(slash?.block===block&&['ArrowDown','ArrowUp','Enter','Escape'].includes(event.key)){
              event.preventDefault();if(event.key==='Escape')closeMenu();else if(event.key==='Enter')slash.items[selected]?.action();else selectMenuItem(selected+(event.key==='ArrowDown'?1:-1));return;
            }
            if(event.key==='Enter'&&(event.shiftKey||type==='code')){event.preventDefault();insertPlainText(element,'\n');saveNode(element,block);return;}
            if(event.key==='Enter'){event.preventDefault();splitBlock(element,block,type);return;}
            if(event.key==='Backspace'&&!readText(element)){event.preventDefault();if(type!=='text')setType(block,'text');else if(blocks.length>1)deleteBlock(block);return;}
            if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='d'){event.preventDefault();syncNode(element,block);const copy={...block,id:uid()};blocks.splice(blocks.indexOf(block)+1,0,copy);emit();paint();focus(copy.id);}
          });
          element.addEventListener('paste',event=>{event.preventDefault();insertPlainText(element,event.clipboardData.getData('text/plain'));saveNode(element,block);});
          element.addEventListener('blur',()=>saveNode(element,block));row.append(element);
          if(type==='toggle'){
            const details=document.createElement('div');details.className='ed-toggle-details';details.contentEditable='true';details.dataset.placeholder='Empty toggle. Click to write something…';details.setAttribute('role','textbox');details.setAttribute('aria-label','Toggle content');details.setAttribute('aria-multiline','true');details.textContent=block.details||'';
            details.addEventListener('input',()=>{block.details=readText(details);emit();});
            details.addEventListener('paste',event=>{event.preventDefault();insertPlainText(details,event.clipboardData.getData('text/plain'));block.details=readText(details);emit();});row.append(details);
          }
          root.append(row);
        });
        const add=document.createElement('div');add.className='ed-empty-add';add.style.minHeight='60px';
        add.addEventListener('click',()=>{const last=blocks[blocks.length-1];if(last.type==='text'&&!last.text)focus(last.id);else insertAfter(last.id);});root.append(add);
      }
      const onDown=event=>{if(menu&&!menu.contains(event.target)&&!event.target.closest('.ed-control'))closeMenu();if(toolbar&&!toolbar.contains(event.target)&&!root.contains(event.target))closeToolbar();};
      const onKey=event=>{if(event.key==='Escape'){closeMenu();closeToolbar();}};
      function showSelectionToolbar() {
        clearTimeout(selectionTimer);
        selectionTimer=setTimeout(()=>{
          if(disposed||!root.isConnected)return;
          const selection=getSelection();
          const start=selection?.anchorNode?.nodeType===1?selection.anchorNode:selection?.anchorNode?.parentElement;
          const end=selection?.focusNode?.nodeType===1?selection.focusNode:selection?.focusNode?.parentElement;
          const element=start?.closest('.ed-content');
          if(!selection||selection.isCollapsed||!element||!root.contains(element)||end?.closest('.ed-content')!==element){closeToolbar();return;}
          const range=selection.getRangeAt(0).cloneRange();
          const rect=typeof range.getBoundingClientRect==='function'?range.getBoundingClientRect():element.getBoundingClientRect();
          closeToolbar();toolbar=document.createElement('div');toolbar.className='ed-toolbar';toolbar.setAttribute('role','toolbar');toolbar.setAttribute('aria-label','Text formatting');
          for(const [command,label] of [['bold','B'],['italic','𝘐'],['underline','U'],['strikeThrough','S'],['code','‹›']]){
            const button=document.createElement('button');button.type='button';button.title=command==='code'?'Inline code':command;button.setAttribute('aria-label',button.title);button.textContent=label;
            button.addEventListener('mousedown',event=>event.preventDefault());
            button.addEventListener('click',()=>{
              selection.removeAllRanges();selection.addRange(range);
              if(command==='code'){
                const code=document.createElement('code');
                try{range.surroundContents(code);}catch{code.append(range.extractContents());range.insertNode(code);}
              }else document.execCommand(command);
              syncNode(element,getBlock(element.closest('.ed-block').dataset.blockId));emit();closeToolbar();element.focus();
            });toolbar.append(button);
          }
          document.body.append(toolbar);position(toolbar,{left:rect.left,bottom:rect.top-45});
        },0);
      }
      const onUp=event=>{if(!toolbar?.contains(event.target))showSelectionToolbar();};
      const onKeyUp=event=>{if(event.shiftKey||['Shift','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))showSelectionToolbar();};
      const onScroll=event=>{if(menu?.contains(event.target))return;closeMenu();closeToolbar();};
      document.addEventListener('mousedown',onDown);document.addEventListener('keydown',onKey);document.addEventListener('mouseup',onUp);document.addEventListener('keyup',onKeyUp);
      window.addEventListener('resize',onScroll);document.addEventListener('scroll',onScroll,true);paint();
      cleanup=()=>{
        if(disposed)return;disposed=true;clearTimeout(selectionTimer);closeMenu();closeToolbar();
        document.removeEventListener('mousedown',onDown);document.removeEventListener('keydown',onKey);document.removeEventListener('mouseup',onUp);document.removeEventListener('keyup',onKeyUp);
        window.removeEventListener('resize',onScroll);document.removeEventListener('scroll',onScroll,true);
      };
      return {getBlocks:()=>blocks.map(block=>({...block})),focus:()=>focus(blocks[0].id),destroy:cleanup};
    }
  };
})();
