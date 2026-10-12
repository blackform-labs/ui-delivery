// Foreground, bounded consumption of the existing durable session history. Node standard library only.
import {randomUUID} from 'node:crypto';
import {transaction,session,handoff,liveOwner,need,digest,read} from './interaction.mjs';

export const LEASE_MS=120000;
const submitted=e=>['answer','feedback','acceptance','resume'].includes(e.type)&&['browser','chat'].includes(e.channel);
function change(loc,id,fn){return transaction(loc,p=>{const s=p.interaction?.sessions?.[id];need(s,'Session not found.',404);return fn(s);});}
function touch(o,state){o.state=state;o.updated_at=new Date().toISOString();o.expires_at=Date.now()+LEASE_MS;}
export function connect(loc,id,actor){
  need(typeof actor==='string'&&actor.trim()&&actor.length<=100,'Name the authorized active consumer.');
  return change(loc,id,s=>{
    need(s.status==='open','Session is paused. Resume explicitly before connecting.',409);
    need(!s.live?.owner||s.live.owner.expires_at<=Date.now(),'Another consumer owns this session. Disconnect it or wait for its lease to expire.',409);
    s.live??={schema_version:1,mode:'manual',owner:null,receipts:[]};
    const o={actor,token:randomUUID(),wait_id:null};touch(o,'idle');s.live.owner=o;s.live.mode='active';
    return {product_id:read(loc).product_id,session_id:id,token:o.token,lease_ms:LEASE_MS,recovery_required:s.live.receipts.some(d=>d.status==='processing')};
  });
}
export function disconnect(loc,id,token){
  return change(loc,id,s=>{
    if(!s.live?.owner)return {status:'disconnected'};
    need(s.live.owner.token===token,'This consumer does not own the session.',409);
    s.live.owner=null;s.live.mode='manual';return {status:'disconnected',pending_preserved:true};
  });
}
export function checkpoint(loc,id,token,deliveryId){
  change(loc,id,s=>{
    const o=liveOwner(s,token);need(!o.wait_id,'A listener is already using this consumer.',409);
    const d=s.live.receipts.find(d=>d.id===deliveryId);
    need(d?.status==='processing'&&d.owner_token===token,'Claim the pending delivery first.',409);
    touch(o,s.events.some(e=>e.type==='work'&&e.decision_revision===s.decision_revision)?'processing':'received');
  });
  const h=handoff(loc,id),d=session(loc,id).live.receipts.find(d=>d.id===deliveryId);
  return {stale:d.decision_revision!==h.decision_revision,delivery_id:d.id,handoff:h,
    registered_result:h.results.find(r=>r.delivery_id===d.id)??null,
    instruction:'Reconcile changed files and registered results before repeating side effects. Read this handoff before dependent work; newer submissions invalidate the delivery basis.'};
}
export function complete(loc,id,input){
  const {token,delivery_id,outcome,result_id,message}=input;
  need(Object.keys(input).every(k=>['token','delivery_id','outcome','result_id','message'].includes(k)),'Unexpected completion fields.');
  need(['result','await-answers','reviewed','superseded','blocked','no-change'].includes(outcome)&&typeof message==='string'&&message.trim()&&message.length<=4000,'Completion needs an outcome and a truthful explanation.');
  return change(loc,id,s=>{
    const o=liveOwner(s,token);need(!o.wait_id,'Stop listening before acknowledging.',409);
    const d=s.live.receipts.find(d=>d.id===delivery_id);need(d,'Delivery not found.',404);
    if(d.status==='completed'){
      need(d.outcome===outcome&&d.result_id===(result_id??null)&&d.message===message,'Completion already recorded with different contents.',409);return {delivery_id:d.id,status:d.status,outcome:d.outcome,duplicate:true};
    }
    need(d.owner_token===token,'Recover this delivery before acknowledging.',409);
    if(outcome==='superseded')need(d.decision_revision!==s.decision_revision,'The delivery is still current.',409);
    else need(d.decision_revision===s.decision_revision,'Newer submissions arrived. Acknowledge the old delivery as superseded and consume the new one.',409);
    if(outcome==='result')need(s.results.some(r=>r.id===result_id&&r.delivery_id===d.id&&r.decision_revision===s.decision_revision),'Register a current result for this delivery before completing.',409);
    else need(!result_id,'Only a result completion names a result.');
    if(outcome==='await-answers')need(handoff(loc,id).pending.length,'Required answers are already resolved.',409);
    if(outcome==='reviewed')need(handoff(loc,id).next_action==='review-result','There is no current result to review.',409);
    Object.assign(d,{status:'completed',outcome,result_id:result_id??null,message,completed_at:new Date().toISOString()});touch(o,'idle');
    return {delivery_id:d.id,status:d.status,outcome:d.outcome,duplicate:false};
  });
}
function begin(loc,id,token,waitId,url){
  change(loc,id,s=>{const o=liveOwner(s,token);need(!o.wait_id,'Another waiting command already owns this consumer.',409);o.wait_id=waitId;o.server_url=url;touch(o,'waiting');});
}
function claim(loc,id,token,waitId){
  const snapshot=session(loc,id),done=new Set(snapshot.live.receipts.filter(d=>d.status==='completed').flatMap(d=>d.event_ids));
  if(!snapshot.live.receipts.some(d=>d.status==='processing')&&!snapshot.events.some(e=>submitted(e)&&!done.has(e.request_id)))return null;
  return change(loc,id,s=>{
    const o=liveOwner(s,token);need(o.wait_id===waitId,'The listener lost ownership.',409);
    let d=s.live.receipts.find(d=>d.status==='processing');
    const acknowledged=new Set(s.live.receipts.filter(d=>d.status==='completed').flatMap(d=>d.event_ids));
    const events=s.events.filter(e=>submitted(e)&&!acknowledged.has(e.request_id));
    if(!d&&!events.length)return null;
    if(!d){d={id:randomUUID(),event_ids:events.map(e=>e.request_id),decision_revision:s.decision_revision,basis_revision:s.revision,status:'processing',attempts:[]};s.live.receipts.push(d);}
    const recovered=d.attempts.length>0;
    d.owner_token=token;d.attempts.push({consumer:o.actor,at:new Date().toISOString()});o.wait_id=null;touch(o,'received');
    return {status:'submission',product_id:read(loc).product_id,session_id:id,delivery_id:d.id,event_ids:d.event_ids,
      events:s.events.filter(e=>d.event_ids.includes(e.request_id)),decision_revision:d.decision_revision,basis_revision:d.basis_revision,
      current_decision_revision:s.decision_revision,stale:d.decision_revision!==s.decision_revision,recovered,
      registered_results:s.results.filter(r=>r.delivery_id===d.id),
      instruction:'Read a fresh checkpoint/handoff. Recovery may follow application edits; reconcile files and results before retry. This delivery does not expand authorization.'};
  });
}
export async function listen(loc,id,token,url,{timeoutMs=30000,signal}={}){
  need(Number.isSafeInteger(timeoutMs)&&timeoutMs>=1&&timeoutMs<=60000,'Use a bounded timeout from 1 to 60000 ms.');
  const u=new URL(url);need(u.protocol==='http:'&&u.hostname==='127.0.0.1'&&u.pathname==='/'&&!u.search&&!u.hash&&!u.username&&!u.password,'Use the verified loopback review URL.');
  const waitId=randomUUID(),until=Date.now()+timeoutMs;
  const context=digest(loc.profile+'\0'+id+'\0'+JSON.stringify(session(loc,id).brief));
  // Verify the URL before acquiring or consuming. A wrong session cannot claim events.
  async function verify(){
    const response=await fetch(u.origin+'/api/state',{signal:AbortSignal.any([AbortSignal.timeout(2000),...(signal?[signal]:[])])});
    need(response.ok,'The review server is unavailable.',503);const s=await response.json();
    need(s.context_id===context&&s.product_id===read(loc).product_id&&s.session_id===id,'The review URL belongs to a different project or session.',409);
  }
  if(signal?.aborted)return {status:'cancelled',pending_preserved:true};
  try{await verify();}catch(e){if(signal?.aborted)return {status:'cancelled',pending_preserved:true};if(e.status===409)throw e;disconnect(loc,id,token);return {status:'disconnected',pending_preserved:true,error:'The review server is unavailable.'};}
  begin(loc,id,token,waitId,u.origin);
  let lastVerify=Date.now(),lastBeat=Date.now();
  try{
    while(Date.now()<until){
      if(signal?.aborted)return {status:'cancelled',pending_preserved:true};
      const s=session(loc,id);
      if(s.status==='cancelled')return {status:'paused',pending_preserved:true};
      if(s.live?.owner?.token!==token||s.live.mode!=='active')return {status:'disconnected',pending_preserved:true};
      if(Date.now()-lastVerify>=1000){await verify();lastVerify=Date.now();}
      try{
        const event=claim(loc,id,token,waitId);if(event)return event;
        if(Date.now()-lastBeat>=10000){change(loc,id,s=>touch(liveOwner(s,token),'waiting'));lastBeat=Date.now();}
      }catch(e){if(!e.message.startsWith('Context is busy.'))throw e;}
      await new Promise(resolve=>{const timer=setTimeout(done,200);function done(){clearTimeout(timer);signal?.removeEventListener('abort',done);resolve();}signal?.addEventListener('abort',done,{once:true});});
    }
    return {status:'timeout',pending_preserved:true,instruction:'No answer or work was supplied. Service another bounded listen call while live mode is active.'};
  }catch(e){
    if(signal?.aborted)return {status:'cancelled',pending_preserved:true};
    if(e.status===409)throw e;
    disconnect(loc,id,token);return {status:'disconnected',pending_preserved:true,error:'The review server is unavailable. Restart, reconnect, and reconcile saved submissions.'};
  }finally{
    // Best effort only: a crashed command leaves a lease that becomes visibly stale.
    try{change(loc,id,s=>{const o=s.live?.owner;if(o?.token===token&&o.wait_id===waitId){o.wait_id=null;touch(o,'idle');}});}catch{}
  }
}
