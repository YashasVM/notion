import {readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';
const context={window:{WorkspaceActions:{},addEventListener(){}},document:{},AbortController};
vm.runInNewContext(readFileSync('dist/agent.js','utf8'),context);
writeFileSync('dist/agent-tools.json',JSON.stringify({version:context.window.NotionAgent.version,transport:'browser-local',tools:context.window.NotionAgent.tools},null,2)+'\n');
