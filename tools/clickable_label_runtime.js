/* Image label information: authored positions, no guessed hotspots. */
const EV_LABEL_DATA=__EV_LABEL_DATA__;
const EVLABEL=(()=>{
  const active=new WeakMap(); let serial=0;
  function destroy(host){const old=host&&active.get(host);if(!old)return;old.ro.disconnect();old.layer.remove();active.delete(host)}
  function render(host,key){
    if(!host)return; destroy(host);
    const specs=EV_LABEL_DATA[key]; const img=host.querySelector('img');
    if(!specs||!img)return;
    const layer=document.createElement('div');layer.className='ev-label-layer';
    const info=document.createElement('div');info.className='ev-label-pop';info.id='evLabelInfo'+(++serial);info.hidden=true;info.setAttribute('role','region');info.setAttribute('aria-live','polite');info.tabIndex=0;
    const heading=document.createElement('strong'),body=document.createElement('span'),close=document.createElement('button');
    close.type='button';close.className='ev-label-close';close.textContent='×';close.setAttribute('aria-label',BI('Close information','जानकारी बंद करें'));
    // Find the largest vertical band clear of all label buttons; some labels
    // are low in the picture, so simply placing info below the last one fails.
    const occupied=specs.map(s=>[Math.max(0,s.y/768*100-1),Math.min(100,(s.y+s.h)/768*100+1)]).sort((a,b)=>a[0]-b[0]);
    let cursor=1,best=[1,1];
    for(const [a,b] of occupied){if(a-cursor>best[1]-best[0])best=[cursor,a];cursor=Math.max(cursor,b)}
    if(99-cursor>best[1]-best[0])best=[cursor,99];
    info.style.top=best[0]+'%';info.style.maxHeight=(best[1]-best[0])+'%';
    info.append(heading,body,close); let selected=null; const buttons=[];
    function closeInfo(){info.hidden=true;if(selected){selected.setAttribute('aria-expanded','false');selected=null}}
    close.addEventListener('click',e=>{e.stopPropagation();const prior=selected;closeInfo();if(prior)prior.focus({preventScroll:true})});
    info.addEventListener('click',e=>e.stopPropagation());
    specs.forEach((spec,i)=>{
      const hit=document.createElement('button');hit.type='button';hit.className='ev-label-hit';hit.dataset.labelIndex=String(i);
      let right=spec.x+spec.w;
      for(const other of specs)if(other!==spec&&other.x>spec.x&&other.x<right&&other.y<spec.y+spec.h&&spec.y<other.y+other.h)right=other.x-2;
      hit.style.left=(spec.x/1408*100)+'%';hit.style.top=(spec.y/768*100)+'%';hit.style.width=((right-spec.x)/1408*100)+'%';hit.style.height=(spec.h/768*100)+'%';
      hit.setAttribute('aria-label',BI(spec.en,spec.hi)+' · '+BI('more information','और जानकारी'));hit.setAttribute('aria-controls',info.id);hit.setAttribute('aria-expanded','false');
      hit.addEventListener('click',e=>{e.stopPropagation();if(selected===hit&&!info.hidden){closeInfo();return}closeInfo();selected=hit;hit.setAttribute('aria-expanded','true');heading.textContent=BI(spec.en,spec.hi);body.textContent=BI(spec.info_en,spec.info_hi);info.hidden=false});
      layer.append(hit);buttons.push(hit);
    });
    layer.append(info);host.append(layer);
    function size(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;const iw=Math.min(w,h*1408/768),ih=iw*768/1408;layer.style.width=iw+'px';layer.style.height=ih+'px';layer.style.left=(w-iw)/2+'px';layer.style.top=(h-ih)/2+'px'}
    const ro=new ResizeObserver(size);ro.observe(host);img.addEventListener('load',size,{once:true});size();active.set(host,{ro,layer,closeInfo});
  }
  function closeOpen(host){const item=host&&active.get(host);if(!item)return false;const p=item.layer.querySelector('.ev-label-pop');if(!p||p.hidden)return false;item.closeInfo();return true}
  return {render,destroy,closeOpen,has:key=>!!EV_LABEL_DATA[key]};
})();

