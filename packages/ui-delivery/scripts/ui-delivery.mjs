#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {location,read,init,session,handoff,submit,result,work,activity,getAsset,need,digest} from './interaction.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));

export async function start(loc,id,port=0) {
  session(loc,id);
  // Binds open tabs to this project/session even when a port is reused later.
  const contextId=digest(loc.profile+'\0'+id+'\0'+JSON.stringify(session(loc,id).brief));
  const staticFiles={'/':['review.html','text/html; charset=utf-8'],'/review.js':['review.js','text/javascript; charset=utf-8'],'/review.css':['review.css','text/css; charset=utf-8']};
  let origin;
  const server=http.createServer(async(req,res)=>{
    res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','SAMEORIGIN');
    res.setHeader('Content-Security-Policy',"default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'");
    const send=(status,data,type='application/json')=>{res.writeHead(status,{'Content-Type':type});res.end(type==='application/json'?JSON.stringify(data):data);};
    try {
      need(req.headers.host===new URL(origin).host,'Use the printed loopback address.',403);
      need(!req.headers.origin||req.headers.origin===origin,'Cross-origin access is blocked.',403);
      const url=new URL(req.url,origin);need(!url.search,'Query parameters are unsupported.',404);
      if(req.method==='GET') {
        if(staticFiles[url.pathname]){const [file,type]=staticFiles[url.pathname];return send(200,fs.readFileSync(path.join(here,'review',file)),type);}
        if(url.pathname==='/api/state') {
          const s=session(loc,id),p=read(loc);
          return send(200,{product_id:p.product_id,session_id:id,context_id:contextId,...s,activity:activity(s)});
        }
        if(url.pathname.startsWith('/preview/')) {
          const a=getAsset(loc,id,url.pathname.slice(9));
          res.setHeader('Content-Security-Policy',"sandbox; default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'; frame-ancestors 'self'");
          return send(200,a.bytes,a.type);
        }
      }
      if(req.method==='POST') {
        need(req.headers.origin===origin&&req.headers['content-type']==='application/json'&&req.headers['x-ui-delivery']==='explicit-submit','Submit from this local review page.',403);
        let body='';for await (const chunk of req){body+=chunk;need(Buffer.byteLength(body)<=16000,'Submission is too large.',413);}
        const value=JSON.parse(body);
        if(url.pathname==='/api/submit'){
          need(value.context_id===contextId,'This page belongs to a different project or session. Open the current review URL.',409);
          const {context_id,...input}=value;const saved=submit(loc,id,input,'browser');return send(200,{saved});
        }
        if(url.pathname==='/api/stop'){
          need(!value.context_id||value.context_id===contextId,'This page belongs to a different session.',409);
          send(200,{stopped:true});server.close();return;
        }
      }
      send(404,{error:'Page not found.'});
    }catch(e){send(e.status??400,{error:e.status?e.message:'Unable to read or save this request. Check the local context and try again.'});}
  });
  server.requestTimeout=5000;server.headersTimeout=5000;
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
  origin='http://127.0.0.1:'+server.address().port;
  return {server,url:origin,close:()=>new Promise(r=>server.close(r))};
}

async function main(){
  const [command,...args]=process.argv.slice(2),opts={};
  for(let i=0;i<args.length;i+=2){need(args[i].startsWith('--')&&args[i+1], 'Use --name value arguments.');opts[args[i].slice(2)]=args[i+1];}
  if(!command||command==='help') {
    console.log(`ui-delivery (Node 22 or newer; local files only)
init --project DIR --session ID --brief FILE [--profile product-profile.json]
start --project DIR --session ID [--profile product-profile.json] [--port 8815]
handoff --project DIR --session ID [--profile product-profile.json]
submit --project DIR --session ID --input FILE [--profile product-profile.json]
work --project DIR --session ID --input FILE [--profile product-profile.json]
result --project DIR --session ID --input FILE [--profile product-profile.json]
stop --port PORT
FILE is read from your current directory. Project writes are limited to the existing profile.
start resumes saved state; Ctrl+C or stop ends the server without supplying an answer.
There is no live agent watcher. After submitting, return to your agent conversation;
the agent runs handoff with the same project/profile/session before continuing.
submit is the chat fallback: record only an explicit user's answer, with actor and current revision.
See references/interactive.md for schemas, lock recovery and result handoff.`);return;
  }
  if(command==='stop'){
    const port=Number(opts.port);need(Number.isInteger(port)&&port>0&&port<=65535,'Invalid port.');
    const origin='http://127.0.0.1:'+port;
    const r=await fetch(origin+'/api/stop',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-UI-Delivery':'explicit-submit'},body:'{}'});need(r.ok,'Server did not stop.');console.log('Stopped. Saved answers remain.');return;
  }
  need(opts.project&&opts.session,'Project and session are required.');
  const loc=location(opts.project,opts.profile),input=key=>JSON.parse(fs.readFileSync(opts[key],'utf8'));
  if(command==='init')console.log(JSON.stringify({session:init(loc,opts.session,input('brief'))}));
  else if(command==='handoff')console.log(JSON.stringify(handoff(loc,opts.session),null,2));
  else if(command==='submit')console.log(JSON.stringify(submit(loc,opts.session,input('input'))));
  else if(command==='work')console.log(JSON.stringify(work(loc,opts.session,input('input'))));
  else if(command==='result')console.log(JSON.stringify(result(loc,opts.session,input('input'))));
  else if(command==='start'){
    const port=Number(opts.port??0);need(Number.isInteger(port)&&port>=0&&port<=65535,'Invalid port.');
    const running=await start(loc,opts.session,port);console.log(running.url+' — '+opts.session+'; Ctrl+C to stop.');
    for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>running.server.close());
  }else throw new Error('Unknown command. Use help.');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(e.message);process.exitCode=1;});
