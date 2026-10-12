// Local context transactions and explicit decisions. No network or package dependencies.
import fs from 'node:fs';
import path from 'node:path';
import {createHash, randomUUID} from 'node:crypto';

export const digest = data => createHash('sha256').update(data).digest('hex');
export class Invalid extends Error { constructor(message, status=400) { super(message); this.status=status; } }
export function need(ok, message, status=400) { if (!ok) throw new Invalid(message,status); }
const id = x => typeof x==='string' && /^[a-z][a-z0-9-]{0,63}$/.test(x);
const text = (x,max=4000) => typeof x==='string' && x.trim().length>0 && x.length<=max;
const object = x => x && typeof x==='object' && !Array.isArray(x);
function keys(x,allowed) { need(object(x) && Object.keys(x).every(k=>allowed.includes(k)), 'Unexpected fields in record.'); }

// Reject symlinks, including parents, before reading or writing a project path.
export function inside(project, relative, exists=true) {
  need(typeof relative==='string' && relative.length>0 && !path.isAbsolute(relative), 'Use a project-relative path.');
  const target=path.resolve(project,relative);
  const rel=path.relative(project,target);
  need(rel && !rel.startsWith('..'+path.sep) && rel!=='..' && !path.isAbsolute(rel), 'Path leaves the project.');
  let cursor=path.parse(target).root;
  for (const part of target.slice(cursor.length).split(path.sep)) {
    cursor=path.join(cursor,part);
    if (fs.existsSync(cursor)) need(!fs.lstatSync(cursor).isSymbolicLink(), 'Symlink paths are unsupported.');
    else need(!exists && cursor===target, 'Path does not exist.');
  }
  return target;
}
export function location(project, profile='product-profile.json') {
  project=path.resolve(project);
  inside(path.parse(project).root,project.slice(path.parse(project).root.length));
  return {project,profile:inside(project,profile)};
}
export function read(loc) {
  inside(loc.project,path.relative(loc.project,loc.profile));
  const p=JSON.parse(fs.readFileSync(loc.profile,'utf8'));
  need(p.schema_version===1 && id(p.product_id), 'Unsupported product profile.');
  if (p.interaction) validateInteraction(p.interaction);
  return p;
}
export function validateInteraction(i) {
  need(object(i) && i.schema_version===1 && object(i.sessions),'Unsupported interaction context.');
  for (const [key,s] of Object.entries(i.sessions)) {
    need(id(key) && s.id===key && Number.isSafeInteger(s.revision) && s.revision>=0 && Number.isSafeInteger(s.decision_revision), 'Invalid session.');
    need(['open','cancelled'].includes(s.status) && Array.isArray(s.events) && Array.isArray(s.results), 'Invalid session state.');
    need(s.events.length===s.revision && s.events.every((e,n)=>e.revision===n+1 && text(e.at) && text(e.actor) && text(e.request_id)), 'Invalid decision history.');
    need(new Set(s.events.map(e=>e.request_id)).size===s.events.length, 'Duplicate decision IDs.');
    if(s.live){
      const l=s.live;
      need(l.schema_version===1&&['active','manual'].includes(l.mode)&&Array.isArray(l.receipts),'Unsupported live context.');
      if(l.owner)need(text(l.owner.actor,100)&&text(l.owner.token,100)&&Number.isSafeInteger(l.owner.expires_at)&&text(l.owner.updated_at)&&['idle','waiting','received','processing'].includes(l.owner.state),'Invalid live owner.');
      const delivered=new Set(),ids=new Set();
      for(const d of l.receipts){
        need(text(d.id,100)&&!ids.has(d.id)&&Array.isArray(d.event_ids)&&d.event_ids.length>0&&new Set(d.event_ids).size===d.event_ids.length,'Invalid delivery identity.');ids.add(d.id);
        need(['processing','completed'].includes(d.status)&&Number.isSafeInteger(d.decision_revision)&&d.decision_revision>=0&&d.decision_revision<=s.decision_revision&&Number.isSafeInteger(d.basis_revision)&&d.basis_revision>=0&&d.basis_revision<=s.revision&&text(d.owner_token,100)&&Array.isArray(d.attempts)&&d.attempts.length>0&&d.attempts.every(a=>text(a.consumer,100)&&text(a.at)),'Invalid delivery state.');
        for(const eid of d.event_ids){need(s.events.some(e=>e.request_id===eid&&['answer','feedback','acceptance','resume'].includes(e.type)&&['browser','chat'].includes(e.channel))&&!delivered.has(eid),'Invalid or overlapping delivered event.');delivered.add(eid);}
        if(d.status==='completed'){
          need(['result','await-answers','reviewed','superseded','blocked','no-change'].includes(d.outcome)&&text(d.message)&&text(d.completed_at),'Invalid completion.');
          need(d.outcome==='result'?s.results.some(r=>r.id===d.result_id&&r.delivery_id===d.id&&r.decision_revision===d.decision_revision):d.result_id===null,'Completion lacks registered result or names an unrelated result.');
        }
      }
      need(l.receipts.filter(d=>d.status==='processing').length<=1,'Competing active deliveries.');
    }
  }
}
export function transaction(loc, change) {
  const lock=loc.profile+'.ui-delivery.lock'; let fd;
  try { fd=fs.openSync(lock,'wx',0o600); } catch { throw new Invalid('Context is busy. Retry after the other write finishes. A lock left by a crash must be checked before removal.',409); }
  let tmp;
  try {
    fs.writeFileSync(fd,JSON.stringify({pid:process.pid}));
    const p=read(loc), result=change(p);
    validateInteraction(p.interaction);
    tmp=loc.profile+'.'+randomUUID()+'.tmp';
    const out=fs.openSync(tmp,'wx',fs.statSync(loc.profile).mode & 0o777);
    try { fs.writeFileSync(out,JSON.stringify(p,null,2)+'\n');fs.fsyncSync(out); } finally { fs.closeSync(out); }
    fs.renameSync(tmp,loc.profile);return result;
  } finally { if(tmp && fs.existsSync(tmp))fs.unlinkSync(tmp);fs.closeSync(fd);fs.unlinkSync(lock); }
}
function asset(loc,a) {
  keys(a,['path','label','sha256']);need(text(a.label,160),'Preview needs a label.');
  need(/\.(html|png|webp|jpg)$/.test(a.path),'Preview must be a self-contained HTML file or an image.');
  const file=inside(loc.project,a.path),bytes=fs.readFileSync(file);
  need(bytes.length<=2_000_000,'Preview is too large.');
  return {path:a.path,label:a.label,sha256:digest(bytes)};
}
export function validateBrief(loc,b) {
  keys(b,['title','scope','facts','questions','screens']);
  need(text(b.title,160) && ['tiny','specified','material'].includes(b.scope),'Invalid brief title or scope.');
  need(Array.isArray(b.facts) && b.facts.length<=30 && Array.isArray(b.questions) && b.questions.length<=20 && Array.isArray(b.screens),'Invalid brief lists.');
  for (const f of b.facts) {
    keys(f,['label','value','status','source']);
    need(text(f.label,160)&&text(f.value)&&text(f.source,500)&&['confirmed','inference'].includes(f.status),'Facts need provenance and confirmed/inference status.');
  }
  const ids=new Set();
  for (const q of b.questions) {
    keys(q,['id','prompt','why','material','kind','options','recommendation']);
    need(id(q.id)&&!ids.has(q.id),'Duplicate or invalid question ID.');ids.add(q.id);
    need(text(q.prompt,240)&&text(q.why,500)&&typeof q.material==='boolean'&&['question','direction'].includes(q.kind),'Invalid question.');
    need(Array.isArray(q.options)&&q.options.length<=8,'Invalid options.');
    const options=new Set();
    for(const o of q.options) {
      keys(o,['id','label','tradeoff','preview']);
      need(id(o.id)&&!options.has(o.id)&&text(o.label,160)&&text(o.tradeoff,500),'Invalid option.');options.add(o.id);
      if(o.preview)o.preview=asset(loc,o.preview);
    }
    if(q.recommendation)need(options.has(q.recommendation),'Recommendation must name an option.');
  }
  for(const s of b.screens){keys(s,['id','label','preview']);need(id(s.id)&&!ids.has(s.id)&&text(s.label,160),'Invalid screen.');ids.add(s.id);s.preview=asset(loc,s.preview);}
  return b;
}
export function init(loc,session,brief) {
  need(id(session),'Invalid session ID.');brief=validateBrief(loc,structuredClone(brief));
  return transaction(loc,p=>{
    p.interaction??={schema_version:1,sessions:{}};
    need(!Object.hasOwn(p.interaction.sessions,session),'Session already exists; resume it without replacing its brief.',409);
    p.interaction.sessions[session]={id:session,brief,revision:0,decision_revision:0,status:'open',events:[],results:[]};
    return session;
  });
}
export function session(loc,id) {const p=read(loc);need(Object.hasOwn(p.interaction?.sessions??{},id),'Session not found.',404);return p.interaction.sessions[id];}
export function decisions(s) {
  const answers=Object.create(null);for(const e of s.events)if(e.type==='answer')answers[e.question_id]=e;
  return answers;
}
export function connection(s, now=Date.now()) {
  const o=s.live?.owner;
  return {mode:s.live?.mode??'manual',status:s.status==='cancelled'?'paused':!o?'disconnected':o.expires_at<=now?'stale':o.state,
    consumer:o?.actor,updated_at:o?.updated_at,expires_at:o?.expires_at};
}
// A lease fences bookkeeping and result publication. It cannot fence arbitrary application edits.
export function liveOwner(s, token) {
  need(s.live?.mode==='active'&&s.live.owner?.token===token&&s.live.owner.expires_at>Date.now(),'Agent ownership expired or disconnected. Reconnect and reconcile the handoff.',409);
  return s.live.owner;
}
export function liveDelivery(s, input) {
  if(s.live?.mode!=='active'&&!input.live_token&&!input.delivery_id)return;
  liveOwner(s,input.live_token);
  const d=s.live.receipts.find(d=>d.id===input.delivery_id);
  need(d?.status==='processing'&&d.owner_token===input.live_token,'Claim this submission before working.',409);
  need(d.decision_revision===s.decision_revision,'Newer submissions arrived. Reconcile the current handoff before dependent work.',409);
  return d;
}
// Activity is evidence of an explicit agent update, not a background job launcher.
export function activity(s, now=Date.now()) {
  const answers=decisions(s),pending=s.brief.scope==='material'&&s.brief.questions.some(q=>q.material&&(!answers[q.id]||answers[q.id].mode==='unsure'));
  const r=s.results.at(-1),w=s.events.filter(e=>e.type==='work'&&e.decision_revision===s.decision_revision).at(-1);
  if(s.status==='cancelled')return {status:'paused',title:'Session paused',message:'Resume when you are ready. Your saved answers and feedback are still here.'};
  if(pending)return {status:'awaiting-answers',title:w?.status==='blocked'?'Help with the open choices':'A few choices remain',message:w?.status==='blocked'?w.message:'Saved answers stay saved. Complete or delegate the open choices before the agent can build.',...(w?.status==='blocked'?{updated_at:w.at}:{})};
  if(r?.decision_revision===s.decision_revision){
    const acceptance=s.events.filter(e=>e.type==='acceptance'&&e.result_id===r.id).at(-1);
    if(acceptance?.decision==='accepted')return {status:'accepted',title:'Result accepted',message:'Your acceptance is saved. This review is complete. You can use the delivered app or request another change below.',result_id:r.id};
    if(acceptance?.decision==='rejected')return {status:'rejected',title:'Result rejected',message:'Your rejection is saved. Use the feedback form below to describe what needs to change.',result_id:r.id};
    return {status:'ready',title:'Your result is ready',message:'Review the result below. You can request another change or explicitly accept this result.',result_id:r.id};
  }
  const c=connection(s,now);
  if(s.live?.mode==='active'){
    if(c.status==='waiting')return {status:'listening',title:'Agent connected and waiting',message:'Your next submitted answer or feedback will return to the active agent. Open choices still need an answer or explicit delegation.'};
    if(c.status==='received')return {status:'received',title:'Agent received this submission',message:'The active agent must read the current saved answers before starting work.'};
    if(c.status==='stale'||c.status==='idle')return {status:'disconnected',title:'Agent disconnected; answers remain saved',message:'The listening lease is idle or expired. Return to the agent conversation to reconnect and reconcile saved work.'};
  }
  if(w){
    if(w.status==='blocked')return {status:'blocked',title:'The agent needs your attention',message:w.message,updated_at:w.at};
    if(now-Date.parse(w.at)>120000)return {status:'stale',title:'No recent agent update',message:'The last update was: '+w.message+' Work may be interrupted. Return to your agent conversation to check; your submissions remain saved.',updated_at:w.at};
    return {status:'working',title:'The agent is working on your UI',message:w.message,updated_at:w.at};
  }
  return {status:'waiting',title:'Saved. Waiting for the agent',message:'Return to your coding-agent conversation and say “Continue '+s.id+'”. Your answers and feedback are saved; submitting here does not automatically start the agent.'};
}
export function work(loc,id,input) {
  keys(input,['base_revision','actor','status','message','live_token','delivery_id']);
  need(Number.isSafeInteger(input.base_revision)&&text(input.actor,100)&&['working','blocked'].includes(input.status)&&text(input.message,500),'Work update needs revision, actor, status and message.');
  return transaction(loc,p=>{
    const s=p.interaction?.sessions?.[id];need(s,'Session not found.',404);
    need(s.status==='open'&&s.revision===input.base_revision,'Work update is stale or session is paused.',409);
    liveDelivery(s,input);
    if(input.live_token){const o=s.live.owner;o.state='processing';o.updated_at=new Date().toISOString();o.expires_at=Date.now()+120000;}
    const answers=decisions(s);
    need(input.status!=='working'||s.brief.scope!=='material'||s.brief.questions.every(q=>!q.material||(answers[q.id]&&answers[q.id].mode!=='unsure')),'Material answers are still pending.',409);
    const e={type:'work',request_id:randomUUID(),revision:s.revision+1,decision_revision:s.decision_revision,at:new Date().toISOString(),actor:input.actor,channel:'agent',status:input.status,message:input.message};
    s.events.push(e);s.revision++;return e;
  });
}
export function handoff(loc,id) {
  const p=read(loc),s=session(loc,id),answers=decisions(s);
  const latest=s.results.at(-1);
  const acceptance=latest?.decision_revision===s.decision_revision?s.events.filter(e=>e.type==='acceptance'&&e.result_id===latest.id).at(-1):undefined;
  const pending=s.brief.scope==='material'?s.brief.questions.filter(q=>q.material&&(!answers[q.id]||answers[q.id].mode==='unsure')):[];
  return {schema_version:1,product_id:p.product_id,session_id:id,revision:s.revision,decision_revision:s.decision_revision,status:s.status,
    brief:s.brief,answers,feedback:s.events.filter(e=>e.type==='feedback'),pending:pending.map(q=>q.id),
    next_action:s.status==='cancelled'?'paused':pending.length?'await-answers':latest?.decision_revision===s.decision_revision?'review-result':'implement',
    activity:activity(s),results:s.results,acceptance:acceptance??{decision:'pending'},
    continuation:{automatic:false,active_session_supported:true,connection:connection(s),trigger:'Use a serviced foreground listen command while the agent is active; otherwise return to chat and read a fresh handoff. No closed-conversation wakeup.'},
    instruction:'Use submitted decisions and scoped feedback; delegated choices require an agent rationale. Acceptance applies only to its named result. No response supplies no approval.'};
}
export function submit(loc,id,input,channel='chat') {
  keys(input,['request_id','base_revision','type','actor','question_id','mode','value','target','text','decision','result_id']);
  need(text(input.request_id,100)&&Number.isSafeInteger(input.base_revision)&&text(input.actor,100),'Submission needs an ID, revision and actor.');
  need(['browser','chat'].includes(channel),'Invalid channel.');
  return transaction(loc,p=>{
    const s=p.interaction?.sessions?.[id];need(s,'Session not found.',404);
    need(!s.events.some(e=>e.request_id===input.request_id),'Submission already saved. Reload the current answers.',409);
    need(s.revision===input.base_revision,'Answers changed since this page loaded. Reload saved answers before submitting.',409);
    need(s.status==='open'||input.type==='resume','Session is paused. Resume before submitting.',409);
    const event={request_id:input.request_id,revision:s.revision+1,at:new Date().toISOString(),actor:input.actor,channel,type:input.type};
    if(input.type==='answer') {
      const q=s.brief.questions.find(q=>q.id===input.question_id);
      need(q && q.material && s.brief.scope==='material','This question does not need an interview.');
      need(['choice','text','delegate','unsure'].includes(input.mode),'Invalid answer mode.');
      if(input.mode==='choice')need(q.options.some(o=>o.id===input.value),'Choose a listed option.');
      else if(input.mode==='text')need(text(input.value),'Write your answer before submitting.');
      else need(input.value===''||input.value===undefined,'Unsure or delegation cannot include a selected answer.');
      Object.assign(event,{question_id:q.id,mode:input.mode,value:input.value??'',supersedes:decisions(s)[q.id]?.request_id??''});
      s.decision_revision++;
    } else if(input.type==='feedback') {
      const targets=[...s.brief.screens.map(x=>x.id),...s.brief.questions.flatMap(q=>q.options.map(o=>q.id+':'+o.id)),...s.results.map(r=>r.id)];
      need(targets.includes(input.target)&&text(input.text),'Select a screen or option and write the requested change.');
      Object.assign(event,{target:input.target,text:input.text});s.decision_revision++;
    } else if(input.type==='acceptance') {
      const r=s.results.at(-1);
      need(r && r.id===input.result_id && r.decision_revision===s.decision_revision,'Review the current result before recording acceptance.',409);
      need(['accepted','rejected'].includes(input.decision),'Choose an explicit acceptance decision.');
      Object.assign(event,{result_id:r.id,decision:input.decision});
    } else if(input.type==='cancel') {s.status='cancelled';if(s.live){s.live.owner=null;s.live.mode='manual';}}
    else if(input.type==='resume') {need(s.status==='cancelled','Session is already open.');s.status='open';}
    else throw new Invalid('Unsupported submission.');
    event.decision_revision=s.decision_revision;
    s.events.push(event);s.revision++;return event;
  });
}
export function result(loc,id,input) {
  keys(input,['base_revision','actor','summary','preview','decisions','feedback_resolutions','live_token','delivery_id']);
  need(text(input.actor,100)&&text(input.summary)&&Array.isArray(input.decisions),'Result needs actor, summary and decision rationales.');
  const preview=asset(loc,input.preview);
  return transaction(loc,p=>{
    const s=p.interaction?.sessions?.[id];need(s,'Session not found.',404);
    const delivery=liveDelivery(s,input);
    const existing=delivery&&s.results.find(r=>r.delivery_id===delivery.id&&r.decision_revision===s.decision_revision);
    if(existing)return existing;
    need(s.status==='open'&&s.revision===input.base_revision,'Result is stale or session is paused.',409);
    const answers=decisions(s);
    need(s.brief.scope!=='material'||s.brief.questions.every(q=>!q.material||(answers[q.id]&&answers[q.id].mode!=='unsure')),'Material answers are still pending.',409);
    for(const d of input.decisions){keys(d,['question_id','choice','rationale']);need(answers[d.question_id]&&text(d.choice)&&text(d.rationale),'Invalid decision rationale.');}
    for(const e of Object.values(answers))need(input.decisions.some(d=>d.question_id===e.question_id),'Explain how every answer informed the result.');
    const feedback=s.events.filter(e=>e.type==='feedback'),resolutions=input.feedback_resolutions??[];
    need(Array.isArray(resolutions),'Invalid feedback resolutions.');
    for(const f of resolutions){keys(f,['request_id','resolution']);need(feedback.some(e=>e.request_id===f.request_id)&&text(f.resolution),'Invalid feedback resolution.');}
    need(feedback.every(f=>resolutions.some(r=>r.request_id===f.request_id)),'Explain how each requested change was handled.');
    const r={id:'result-'+(s.results.length+1),at:new Date().toISOString(),basis_revision:s.revision,decision_revision:s.decision_revision,actor:input.actor,summary:input.summary,preview,decisions:input.decisions,feedback_resolutions:resolutions};
    if(delivery)r.delivery_id=delivery.id;
    s.results.push(r);s.revision++;s.events.push({type:'result',request_id:randomUUID(),revision:s.revision,at:r.at,actor:input.actor,channel:'agent',result_id:r.id});return r;
  });
}
export function getAsset(loc,id,key) {
  const s=session(loc,id),assets=[...s.brief.screens.map(x=>x.preview),...s.brief.questions.flatMap(q=>q.options.map(o=>o.preview).filter(Boolean)),...s.results.map(r=>r.preview)];
  const a=assets.find(a=>a.sha256===key);need(a,'Preview not found.',404);
  const bytes=fs.readFileSync(inside(loc.project,a.path));need(digest(bytes)===a.sha256,'Preview changed. Register a new result before reviewing it.',409);
  return {bytes,type:a.path.endsWith('.html')?'text/html; charset=utf-8':a.path.endsWith('.png')?'image/png':a.path.endsWith('.webp')?'image/webp':'image/jpeg'};
}
