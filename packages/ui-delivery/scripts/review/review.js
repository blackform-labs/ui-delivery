let state, saving=false, pausedDrafts=[], remoteUpdate, generation=0, stopped=false;
const $=id=>document.getElementById(id);
const activityPanel=$('activity'),noticePanel=$('notice');
function el(tag,text,attrs={}){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);return n;}
function notice(message,error=false){$('notice').textContent=message;$('notice').className=error?'error':'';$('notice').focus();}
async function request(url,body){const r=await fetch(url,body?{method:'POST',headers:{'Content-Type':'application/json','X-UI-Delivery':'explicit-submit'},body:JSON.stringify(body)}:{});const data=await r.json();if(!r.ok)throw Error(data.error);return data;}
async function load(){generation++;state=await request('/api/state');remoteUpdate=undefined;render();}
function draftsExcept(input){
  return [...document.querySelectorAll('form')].filter(f=>input.type!=='answer'||f.dataset.question!==input.question_id).filter(f=>input.type!=='feedback'||!f.dataset.feedback).map(f=>({question:f.dataset.question,feedback:f.dataset.feedback,selected:f.querySelector('input:checked')?.value,text:f.querySelector('textarea')?.value,target:f.querySelector('select')?.value,dirty:f.dataset.dirty==='true',open:f.closest('details')?.open}));
}
function restoreDrafts(drafts){
  for(const d of drafts){const f=[...document.querySelectorAll('form')].find(f=>d.question?f.dataset.question===d.question:f.dataset.feedback===d.feedback);if(!f)continue;
    for(const r of f.querySelectorAll('input[type=radio]'))r.checked=r.value===d.selected;
    if(f.querySelector('textarea'))f.querySelector('textarea').value=d.text??'';
    if(f.querySelector('select'))f.querySelector('select').value=d.target??'';
    if(d.dirty)f.dataset.dirty='true';
    if(d.open&&f.closest('details'))f.closest('details').open=true;
  }
}
async function send(input){
  if(saving)return;
  const drafts=input.type==='resume'?pausedDrafts:draftsExcept(input);
  if(input.type==='cancel')pausedDrafts=drafts;
  saving=true;generation++;
  const buttons=[...document.querySelectorAll('button,input,textarea,select')].map(b=>[b,b.disabled]);buttons.forEach(([b])=>b.disabled=true);
  try{await request('/api/submit',{...input,context_id:state.context_id,request_id:crypto.randomUUID(),base_revision:state.revision,actor:'local-owner'});await load();restoreDrafts(drafts);notice(input.type==='cancel'?'Session paused. No acceptance was recorded.':input.type==='resume'?'Session resumed. Saved answers are ready.':input.type==='feedback'?'Saved. Your feedback was received. See the collaboration status for the next step.':input.type==='acceptance'?(input.decision==='accepted'?'Result accepted. Your acceptance is saved; this review is complete.':'Result rejected. Your decision is saved; describe what needs to change below.'):'Saved. Your answer was received. See the collaboration status for the next step.');}
  catch(e){notice(e.message,true);}finally{saving=false;buttons.forEach(([b,disabled])=>b.disabled=disabled);}
}
function preview(a,parent){const html=a.path.endsWith('.html'),node=el(html?'iframe':'img',undefined,html?{title:a.label,src:'/preview/'+a.sha256,sandbox:'',class:'preview'}:{alt:a.label,src:'/preview/'+a.sha256,class:'preview image'});parent.append(node);}
function section(title){const s=el('section');s.append(el('h2',title));$('content').append(s);return s;}
function answerText(a,q){return a.mode==='unsure'?'Unsure; needs clarification':a.mode==='delegate'?'Delegated to the agent':a.mode==='choice'?q.options.find(o=>o.id===a.value).label:a.value;}
function question(q,saved){
  const f=el('form'),fs=el('fieldset');f.dataset.question=q.id;f.append(fs);fs.append(el('legend',q.prompt),el('p',q.why,{class:'meta'}));
  const choices=el('div',undefined,{class:'options'});fs.append(choices);
  for(const o of q.options){
    const box=el('div',undefined,{class:'option'}),label=el('label'),radio=el('input',undefined,{type:'radio',name:q.id,value:'choice:'+o.id});
    if(saved?.mode==='choice'&&saved.value===o.id)radio.checked=true;
    label.append(radio,el('span',o.label));box.append(label,el('p',o.tradeoff));
    if(o.preview)preview(o.preview,box);if(q.recommendation===o.id)box.append(el('p','Agent recommendation · not a submitted answer',{class:'meta'}));choices.append(box);
  }
  const writing=el('label',undefined,{class:'inline'}),wr=el('input',undefined,{type:'radio',name:q.id,value:'text'});wr.checked=saved?.mode==='text';writing.append(wr,el('span','Write an answer'));fs.append(writing);
  const textLabel=el('label','Your answer',{class:'write'}),ta=el('textarea',undefined,{maxlength:'4000'});if(saved?.mode==='text')ta.value=saved.value;textLabel.append(ta);fs.append(textLabel);ta.addEventListener('input',()=>wr.checked=true);
  const unsure=el('label',undefined,{class:'inline'}),ur=el('input',undefined,{type:'radio',name:q.id,value:'unsure'});ur.checked=saved?.mode==='unsure';unsure.append(ur,el('span',"I'm unsure; help me work this out"));fs.append(unsure);
  const delegation=el('label',undefined,{class:'inline'}),dr=el('input',undefined,{type:'radio',name:q.id,value:'delegate'});dr.checked=saved?.mode==='delegate';delegation.append(dr,el('span','Let the agent decide and explain its choice'));fs.append(delegation);
  const b=el('button',saved?'Save revised answer':'Submit answer',{type:'submit',class:'primary'});fs.append(b);
  f.onsubmit=e=>{e.preventDefault();const value=f.querySelector('input:checked')?.value;if(!value)return notice('Choose an option, write an answer, say you are unsure, or delegate the decision.',true);const[mode,choice]=value.split(':');if(mode==='text'&&!ta.value.trim())return notice('Write your answer before submitting.',true);send({type:'answer',question_id:q.id,mode,value:mode==='text'?ta.value:choice??''});};return f;
}
function render(){
  $('title').textContent=state.brief.title;$('session').textContent=state.product_id+' / '+state.session_id;
  $('intro').textContent=state.status==='cancelled'?'This session is paused. Resume when you are ready.':state.brief.scope==='material'?'Answer the open questions, then review the result. You can revise saved answers at any time.':'This task is ready for implementation. No interview is needed.';
  $('continuation').textContent='During a live session, submitted answers and feedback reach the connected agent. If the agent is disconnected, return to your conversation to reconnect or use the saved handoff. This page cannot start a closed conversation.';
  showActivity(state);
  $('content').replaceChildren();$('pause').textContent=state.status==='cancelled'?'Resume session':'Pause session';
  const facts=section('Project context'),grid=el('div',undefined,{class:'facts'});facts.append(grid);
  for(const f of state.brief.facts){const block=el('div',undefined,{class:'fact'});block.append(el('h3',f.label),el('p',f.value),el('p',f.status==='confirmed'?'Confirmed':'Agent inference',{class:f.status==='inference'?'meta inference':'meta'}),el('p',f.source,{class:'meta'}));grid.append(block);}
  const answers=Object.create(null);state.events.filter(e=>e.type==='answer').forEach(e=>answers[e.question_id]=e);
  const relevant=state.brief.scope==='material'?state.brief.questions.filter(q=>q.material):[],pending=relevant.filter(q=>!answers[q.id]||answers[q.id].mode==='unsure');
  if(state.status==='open'){
    const open=section('Open questions');if(!pending.length)open.append(el('p','No open questions. Your answers are saved; the collaboration status below shows what happens next.',{class:'empty'}));pending.forEach(q=>open.append(question(q,answers[q.id])));
  }
  const settled=relevant.filter(q=>answers[q.id]&&answers[q.id].mode!=='unsure');
  if(settled.length){const saved=section('Saved answers');for(const q of settled){const d=el('details',undefined,{class:'saved'});d.append(el('summary',q.prompt+' — '+answerText(answers[q.id],q)),el('p','Saved '+new Date(answers[q.id].at).toLocaleString()+'. Previous answers remain in the history.',{class:'meta'}));if(state.status==='open')d.append(question(q,answers[q.id]));saved.append(d);}}
  const screens=section('Review the work');screens.append(activityPanel,noticePanel);
  const lastFeedback=state.events.filter(e=>e.type==='feedback').at(-1);
  if(lastFeedback)screens.append(el('p','Feedback received '+new Date(lastFeedback.at).toLocaleString()+': “'+lastFeedback.text+'”',{class:'feedback-receipt'}));
  for(const s of state.brief.screens){screens.append(el('h3',s.label));preview(s.preview,screens);}
  const r=state.results.at(-1);
  if(r){const wrap=el('div',undefined,{class:'result'});screens.append(wrap);wrap.append(el('h3','Latest result'),el('p',r.summary));preview(r.preview,wrap);
    const current=r.decision_revision===state.decision_revision;
    const acceptance=state.events.filter(e=>e.type==='acceptance'&&e.result_id===r.id).at(-1);
    wrap.append(el('p',current?(acceptance?.decision==='accepted'?'Review complete — you accepted this result.':acceptance?.decision==='rejected'?'You rejected this result. Add feedback below to explain the changes you want.':'Ready for your review.'):'Your answers or feedback changed. The agent needs to update this result.',{class:'meta'}));
    const why=el('details');why.append(el('summary','How your answers shaped this result'));for(const d of r.decisions)why.append(el('p',d.choice+': '+d.rationale));wrap.append(why);
    wrap.append(el('p',acceptance?(current?'Decision saved '+new Date(acceptance.at).toLocaleString()+': '+acceptance.decision+'.':'Prior decision: '+acceptance.decision+'. Acceptance of the updated work is pending.'):'Finished-work acceptance: pending.',{class:'decision-receipt'}));
    for(const f of r.feedback_resolutions??[])why.append(el('p',f.resolution));
    if(current&&state.status==='open'){const actions=el('div',undefined,{class:'actions'});for(const[label,value]of[['Accept this result','accepted'],['Reject this result','rejected']]){const selected=acceptance?.decision===value,b=el('button',selected?(value==='accepted'?'Accepted':'Rejected'):label,{type:'button'});b.disabled=selected;if(selected)b.className='recorded-decision';b.onclick=()=>send({type:'acceptance',result_id:r.id,decision:value});actions.append(b);}wrap.append(actions);}
  }else screens.append(el('p','The agent has not submitted a finished result yet. Choosing a direction does not accept finished work.',{class:'empty'}));
  const targets=[...state.brief.screens.map(s=>[s.id,s.label]),...state.brief.questions.flatMap(q=>q.options.map(o=>[q.id+':'+o.id,q.prompt+' / '+o.label])),...state.results.map(r=>[r.id,r.id+' / '+r.summary])];
  if(targets.length&&state.status==='open'){
    const f=el('form'),label=el('label','Screen or option',{class:'write'}),select=el('select');f.dataset.feedback='review';select.append(el('option','Choose a screen or option',{value:''}));for(const[id,name]of targets)select.append(el('option',name,{value:id}));label.append(select);f.append(label);
    const write=el('label','Requested change',{class:'write'}),ta=el('textarea',undefined,{maxlength:'4000'});write.append(ta);f.append(write,el('button','Send feedback',{type:'submit'}));f.onsubmit=e=>{e.preventDefault();send({type:'feedback',target:select.value,text:ta.value});};screens.append(f);
  }
  if(state.events.length){const history=section('Decision history'),d=el('details'),list=el('ol',undefined,{class:'history'});d.append(el('summary','View '+state.events.length+' saved events'),list);for(const e of state.events){let description=e.type;if(e.type==='answer')description=e.question_id+': '+answerText(e,state.brief.questions.find(q=>q.id===e.question_id));if(e.type==='feedback')description='Requested change on '+e.target+': '+e.text;if(e.type==='acceptance')description=e.decision+' '+e.result_id;if(e.type==='result')description='Agent submitted '+e.result_id;if(e.type==='work')description='Agent update: '+e.message;list.append(el('li',description+' · '+e.actor+' · '+e.channel+' · '+new Date(e.at).toLocaleString()+(e.supersedes?' · Revises an earlier answer':'')));}history.append(d);}
}
$('reload').onclick=()=>{pausedDrafts=[];return load().then(()=>notice('Loaded saved answers. Unsaved drafts were discarded.')).catch(e=>notice(e.message,true));};
$('pause').onclick=()=>send({type:state.status==='cancelled'?'resume':'cancel'});
$('stop').onclick=async()=>{try{stopped=true;await request('/api/stop',{context_id:state.context_id});notice('Local server stopped. Your answers are saved. Restart it to resume.');document.querySelectorAll('button').forEach(b=>b.disabled=true);}catch(e){stopped=false;notice(e.message,true);}};
load().catch(e=>notice('Review could not load. Check that the local server is running. '+e.message,true));

// Live status never silently rebases another user's decisions or discards local drafts.
function showActivity(snapshot,offline=false){
  const c=snapshot.connection;
  const connections={waiting:'Agent connected and waiting.',received:'Agent received this submission.',processing:'Agent processing this submission.',paused:'Session paused. Saved answers remain.',stale:'Agent disconnected; answers remain saved. The connection expired.',idle:'Agent disconnected; answers remain saved. No waiting command is active.',disconnected:'Agent disconnected; answers remain saved. Return to your conversation to connect.'};
  const connectionText=offline?'Local server disconnected. Saved answers remain; keep this page open to retain drafts.':connections[c?.status??'disconnected'];
  if($('agent-connection').textContent!==connectionText)$('agent-connection').textContent=connectionText;
  const a=snapshot.activity;
  const title=offline?'Connection lost; saved submissions remain':a?.title??'Checking the agent status';
  const message=offline?'The local server is unavailable. Keep this page open to retain drafts; updates resume when the same server returns.':a?.message??'Restart the local review server to load live status support.';
  if($('activity-title').textContent!==title)$('activity-title').textContent=title;
  const detail=message+(a?.updated_at&&!offline?' Last agent update: '+new Date(a.updated_at).toLocaleTimeString()+'.':'');
  if($('activity-message').textContent!==detail)$('activity-message').textContent=detail;
  $('view-update').hidden=!remoteUpdate||offline;
  if(remoteUpdate)$('view-update').textContent=remoteUpdate.results.at(-1)?.id!==state.results.at(-1)?.id?'View new result':'Review saved updates';
}
async function poll(){
  const basis=generation;
  try{
    if(!state||saving||stopped)return;
    const fresh=await request('/api/state');
    if(saving||basis!==generation||stopped)return;
    if(fresh.context_id!==state.context_id){stopped=true;$('activity-title').textContent='This address now belongs to another session';$('activity-message').textContent='Your drafts are still on this page. Return to your agent conversation for the correct session URL.';$('view-update').hidden=true;return;}
    if(fresh.revision<state.revision)return;
    if(fresh.revision>state.revision){
      const added=fresh.events.filter(e=>e.revision>state.revision);
      if(!remoteUpdate&&added.every(e=>e.type==='work')){state.revision=fresh.revision;state.events=fresh.events;state.activity=fresh.activity;}
      else remoteUpdate=fresh;
      if(fresh.decision_revision!==state.decision_revision||fresh.results.at(-1)?.id!==state.results.at(-1)?.id)document.querySelectorAll('.result .actions button').forEach(b=>b.disabled=true);
    }
    showActivity(fresh);
  }catch{if(state&&basis===generation&&!saving&&!stopped)showActivity(state,true);}
  finally{if(!stopped)setTimeout(poll,1500);}
}
$('content').addEventListener('input',e=>{const f=e.target.closest('form');if(f)f.dataset.dirty='true';});
$('content').addEventListener('change',e=>{const f=e.target.closest('form');if(f)f.dataset.dirty='true';});
$('view-update').onclick=async()=>{
  if(saving)return;
  const drafts=(state.status==='cancelled'?pausedDrafts:draftsExcept({})).filter(d=>d.dirty);
  saving=true;generation++;
  const controls=[...document.querySelectorAll('button,input,textarea,select')].map(b=>[b,b.disabled]);controls.forEach(([b])=>b.disabled=true);
  try{
    const fresh=await request('/api/state');
    if(fresh.context_id!==state.context_id)throw Error('This address belongs to another session. Return to your agent conversation.');
    state=fresh;remoteUpdate=undefined;render();
    noticePanel.textContent=drafts.length?'Saved updates loaded. Your unsaved drafts are retained.':'Latest saved updates loaded.';noticePanel.className='';
    if(state.status==='cancelled')pausedDrafts=drafts;else{restoreDrafts(drafts);pausedDrafts=[];}
    const target=document.querySelector('.result h3')??$('title');target.tabIndex=-1;target.focus();
  }catch(e){notice(e.message,true);}
  finally{saving=false;controls.forEach(([b,disabled])=>b.disabled=disabled);}
};
setTimeout(poll,1500);
