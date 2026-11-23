from pathlib import Path
import csv,json,hashlib,html,base64
from PIL import Image
ROOT=Path(__file__).resolve().parent
risks={
'3.1':'Illustrates one tissue arrangement, not all tissues; inspect boundary and cells.',
'3.2':'Illustrates anatomy and muscle inset; the full cell → tissue → organ → organ system sequence needs explicit teaching.',
'3.3':'Root tip only; shoot and lateral meristems need coverage and verification.',
'3.4':'Plant cross-section does not distinguish all three simple permanent tissue types; add targeted visuals.',
'3.5':'Verify vessel walls and connections; a static image does not itself show the water transport process.',
'3.6':'Verify sieve tubes and companion cells; static structure does not fully show translocation.',
'3.7':'One epithelial form only; verify structure and assess coverage of different epithelial types.',
'3.8':'Loose connective tissue is only one example; blood, bone, cartilage and other connective types still need coverage.',
'3.9':'Neuromuscular-junction concept only; smooth and cardiac muscle, neuron structure and mechanism need additional treatment.',
'3.10':'Check elbow bone and tendon anatomy closely; one anatomical view does not cover musculoskeletal care.',
'3.11':'Exercise and posture concept only; injury prevention, response and nutrition require additional teaching.',
'4.1':'Bus scene is a still; reference-frame comparison and relative motion require explicit teaching.',
'4.2':'Curved path is visible, but start/end points and displacement line are not defined; add a verified diagram.',
'4.3':'Still scene has no measured elapsed time or distance; average-speed calculation needs explicit data and maths.',
'4.4':'A still train does not demonstrate velocity direction or uniform velocity; add measured examples.',
'4.5':'A still trolley does not demonstrate acceleration or retardation; add measured motion and direction.',
'4.6':'No plotted distance–time graph appears; an accurate labelled graph and its interpretation must be added.'}
status=ROOT/'ROLLOUT_STATUS.csv'
with status.open(encoding='utf-8-sig',newline='') as f: rows=list(csv.DictReader(f)); fields=list(rows[0])
records=[]
for ch in ('c9_tissues','c9_motion'):
 for r in rows:
  if r['chapter_id']!=ch or r['section'] not in risks:continue
  files=sorted((ROOT/ch).glob(r['section'].replace('.','-').split('-')[0]+'-'+r['section'].split('.')[1].zfill(2)+'-*.jpg'))
  assert len(files)==1,(r['section'],files)
  p=files[0]
  r.update(asset_generation_status='AI_DRAFT_REVIEW_PENDING',asset_file=f'{ch}/{p.name}',full_topic_visual_coverage='PARTIAL',review_notes=risks[r['section']],anchored_bilingual_labels='PENDING',teacher_signoff='PENDING',integrated_in_main_app='NO')
  with Image.open(p) as im: w,h=im.size
  records.append({'chapter_id':ch,'section':r['section'],'title_en':r['runtime_title_en'],'title_hi':r['runtime_title_hi'],'image':f'{ch}/{p.name}','sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'width':w,'height':h,'teacher_signoff':'PENDING','scientific_accuracy':'UNVERIFIED','anchored_bilingual_labels':'NOT_DONE','topic_coverage':'PARTIAL / UNVERIFIED','review_note':risks[r['section']]})
with status.open('w',encoding='utf-8-sig',newline='') as f:
 w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows(rows)
(ROOT/'TISSUES_MOTION_MANIFEST.json').write_text(json.dumps({'image_kind':'AI-generated conceptual illustration, not authentic micrograph','records':records},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
script='''(()=>{const d=document.getElementById('zoom'),im=document.getElementById('zoomImg'),title=document.getElementById('zoomTitle'),close=document.getElementById('closeZoom');let old=null;document.querySelectorAll('[data-image]').forEach(b=>b.addEventListener('click',()=>{old=b;im.src=b.querySelector('img').src;im.alt=b.querySelector('img').alt;title.textContent=b.getAttribute('data-title');d.showModal();close.focus()}));close.addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d)d.close()});d.addEventListener('close',()=>{im.removeAttribute('src');old?.focus()})})();'''
sha=base64.b64encode(hashlib.sha256(script.encode()).digest()).decode()
csp=f"default-src 'none'; base-uri 'none'; object-src 'none'; connect-src 'none'; img-src 'self'; script-src 'sha256-{sha}'; style-src 'unsafe-inline'"
cards=[]
for r in records:
 e=html.escape(r['title_en']); h=html.escape(r['title_hi']); section=html.escape(r['section']); note=html.escape(r['review_note']); path=html.escape(r['image']);
 cards.append(f'<article class="card"><button data-image data-title="{e} / {h}" aria-label="Enlarge {e} / {h}"><img loading="lazy" src="{path}" alt="Unreviewed AI illustration: {e} / {h}"></button><div><h2>§{section} · {e}</h2><p lang="hi">{h}</p><p class="note">{note}</p><p>Review pending · Labels not anchored</p></div></article>')
page=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="{html.escape(csp,quote=True)}"><title>Tissues and Motion – review drafts</title><style>
*{{box-sizing:border-box}}body{{margin:0;font:16px/1.5 system-ui,Arial,sans-serif;background:#edf2f6;color:#172638}}header{{background:#12304c;color:white;padding:24px}}main{{max-width:1350px;margin:auto;padding:20px}}h1{{margin:0}}.notice{{background:#fff6db;padding:15px;border-left:5px solid #bd8210}}.gallery{{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,315px),1fr));gap:18px}}.card{{background:white;border:1px solid #c5d3df;border-radius:9px;overflow:hidden}}.card div{{padding:12px}}.card h2{{font-size:17px;margin:0}}.card p{{font-size:14px;margin:5px 0}}.note{{color:#69420b}}.card button{{padding:0;border:0;width:100%;cursor:zoom-in;background:#eaf0f5}}.card img{{display:block;width:100%;aspect-ratio:11/6;object-fit:contain}}button:focus-visible{{outline:3px solid #b47907;outline-offset:-3px}}dialog{{width:min(96vw,1500px);height:min(94vh,950px);max-width:none;max-height:none;background:#11283d;color:white;border:1px solid #8babc4;border-radius:8px}}dialog::backdrop{{background:#000d}}.head{{display:flex;justify-content:space-between;align-items:center}}.head h2{{font-size:18px}}.head button{{min-width:44px;min-height:44px;font-size:24px;cursor:pointer}}.frame{{height:calc(100% - 95px);display:flex;align-items:center;justify-content:center}}.frame img{{max-height:100%;max-width:100%;object-fit:contain}}
</style></head><body><header><h1>Tissues and Motion · Draft review</h1><p>ऊतक और गति · प्रारूप समीक्षा</p></header><main><p class="notice"><b>Review only:</b> 17 AI-generated images for 17 spread topics. They are conceptual illustrations, not verified micrographs. Scientific and teacher review, bilingual anatomical labels, and complete topic coverage are pending. Headings are not anchored labels; several images need diagrams or further teaching. Click a draft to enlarge it. Keep this file next to its image folders.</p><section class="gallery">{''.join(cards)}</section></main><dialog id="zoom" aria-labelledby="zoomTitle"><div class="head"><h2 id="zoomTitle"></h2><button type="button" id="closeZoom" aria-label="Close / बंद करें">×</button></div><div class="frame"><img id="zoomImg" alt=""></div><p>Unreviewed AI draft · विज्ञान और लेबल की समीक्षा शेष</p></dialog><script>{script}</script></body></html>'''
(ROOT/'TISSUES_MOTION_REVIEW.html').write_text(page,encoding='utf-8')
print('records',len(records),'total spread drafts',sum(r['asset_generation_status']=='AI_DRAFT_REVIEW_PENDING' for r in rows),'of',len(rows))
