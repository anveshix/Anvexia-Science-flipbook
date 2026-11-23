/* Read-only audit of the existing app over its live preview. */
const {chromium}=require('playwright');
const fs=require('fs'),crypto=require('crypto'),path=require('path');
(async()=>{const b=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--disable-dev-shm-usage','--no-sandbox']});const p=await b.newPage({viewport:{width:1440,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});await p.goto('http://127.0.0.1:8080/?world=c9_cell&spread=0',{waitUntil:'load',timeout:60000});await p.waitForTimeout(900);
const result=await p.evaluate(()=>{
 const keys=WORLD.plate2dKeys();
 const chapters=CATALOGUE_ALL.map(c=>{const w=getWorld(c.id), pack=CHAPTER_PACKS[c.id];return {id:c.id,cls:c.cls,title:c.title,hi:c.hi,subject:c.subject,student:STUDENT_CHAPTERS.includes(c.id),hasAuthoredWorld:!!WORLDS[c.id],hasRuntimePack:!!pack,spreads:w.spreads.map((sp,i)=>({index:i+1,section:String(sp.section||''),id:String(sp.id||''),title:sp.title||'',titleHi:sp.titleHi||'',sceneType:sp.scene&&sp.scene.type||'',scene:sp.scene||null,plate2dKey:keys.includes(c.id+':'+sp.section)}))}});
 return {chapters,plateKeys:keys};
});
const root='/home/user/metaworld';result.bundleSha256=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'index.html'))).digest('hex');result.extractedFrom='live preview http://127.0.0.1:8080/ via CATALOGUE_ALL + getWorld + STUDENT_CHAPTERS + WORLDS + CHAPTER_PACKS + WORLD.plate2dKeys';result.browserErrors=errors;
fs.writeFileSync('/home/user/eduverse_topic_audit/runtime_inventory.json',JSON.stringify(result,null,2)+'\n');console.log('CHAPTERS',result.chapters.length,'SPREADS',result.chapters.reduce((a,c)=>a+c.spreads.length,0),'ERRORS',errors);for(const c of result.chapters)console.log(c.cls,c.id,c.spreads.length,'student',c.student,'pack',c.hasRuntimePack,'world',c.hasAuthoredWorld,'sceneTypes',Array.from(new Set(c.spreads.map(s=>s.sceneType))).join(','));await b.close()})().catch(e=>{console.error(e);process.exit(1)});
