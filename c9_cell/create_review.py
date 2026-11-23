#!/usr/bin/env python3
"""Generate an offline, self-contained review page and a provenance manifest.
No modification to the running EduVerse app. AI drafts require subject review.
"""
from pathlib import Path
import base64, csv, hashlib, html, json
from PIL import Image

HERE = Path(__file__).resolve().parent
AUDIT = Path('/home/user/eduverse_topic_audit/COMPLETE_TOPIC_CHECKLIST.csv')
files = [
 '2-01-discovery.jpg','2-02-plant-animal.jpg','2-03-prokaryote-eukaryote.jpg',
 '2-04-membrane.jpg','2-05-wall-vacuole.jpg','2-06-nucleus.jpg',
 '2-07-mitochondria-chloroplast.jpg','2-08-er-golgi-lysosomes.jpg',
 '2-09-cell-division.jpg','2-10-biomolecules.jpg','2-11-division-cancer.jpg']
prompts = [
"One high-resolution, photorealistic scientific educational illustration for Class IX: a historically plausible seventeenth-century compound microscope beside a thin cork slice and a magnified honeycomb-like field of the empty rectangular cork cell walls that Robert Hooke observed. The cork chambers are dead cell walls, not living green cells. Continuous still-life composition, natural museum lighting, clean margins for software-added labels. No text, letters, numerals, arrows, logos, watermarks, grid or collage.",
"One photorealistic educational scientific illustration of plant and animal cells in one coherent scene. Plant: cellulose wall outside plasma membrane, central vacuole, chloroplasts and nucleus. Animal: nucleus but no cell wall or chloroplasts. Anatomically plausible cutaway models, clear differentiable silhouettes, clean background and room for later labels. No generated text, arrows, logo or watermark.",
"One photorealistic scientific illustration with a small bacterial prokaryote and a larger eukaryotic cell in one continuous microscopic field. The bacterium has a nucleoid with DNA and no nuclear envelope; the eukaryote has a membrane-bound nucleus and membrane-bound organelles. Conceptual scale rather than a claimed measured micrograph. Space for added labels; no text, arrows or watermark.",
"One photorealistic scientific cutaway of a continuous plasma-membrane phospholipid bilayer: hydrophilic heads face watery exterior/interior and hydrophobic tails face inward; include plausible membrane proteins and a transmembrane channel. A few nearby small molecules without invented transport. Clear margins for added labels; no words, arrows or watermark.",
"One photorealistic plant-cell cutaway: cellulose cell wall outside the plasma membrane, a large central vacuole with tonoplast, nucleus and chloroplasts in peripheral cytoplasm. Realistic textbook visualization, clear space for later labels. No words, arrows, watermark or separated panels.",
"One photorealistic scientific interphase nucleus cutaway: double nuclear envelope with pores, diffuse uncondensed chromatin, nucleolus, and adjacent rough endoplasmic reticulum. Do not show condensed X-shaped chromosomes in an intact interphase nucleus. Conceptual visualization with space for later labels; no words or watermark.",
"One photorealistic scientific plant-cell illustration highlighting a cutaway mitochondrion with double membrane and cristae and a cutaway chloroplast with envelope and stacks of thylakoids. No claim of literal micrograph. Clear margins; no words, arrows, watermark or panels.",
"One high-resolution realistic animal-cell cutaway showing rough ER adjacent to the nucleus and studded with ribosomes, smooth ER, a distinct Golgi cisternal stack and a few membrane-bound lysosomes and vesicles. Space for later labels. No generated words, arrows or watermark.",
"One high-resolution microscopy-inspired scientific illustration of one animal cell in mitotic metaphase, with duplicated chromosomes aligned at the metaphase plate and spindle fibers toward opposite poles. This depicts mitosis only; meiosis must be separately illustrated and reviewed. No text, arrows, sequential panels or watermark.",
"One high-resolution realistic molecular-scale scientific visualization of a ribosome with messenger RNA and an emerging polypeptide. This covers protein synthesis only, not all biomolecule classes. Do not present it as a literal optical micrograph. No generated text, arrows or watermark.",
"One high-resolution realistic microscopy-inspired educational illustration about cancer and cell division, depicting a conceptual tissue section containing irregular proliferating cells among nearby normal cells, with one dividing cell. No gore; do not imply appearance alone proves a diagnosis or that this is a real clinical specimen. No text, arrows, logos, watermark or multi-panel layout."
]
risks = {
 '2.1':'Verify historical microscope design and cork-cell wall representation against a subject reference.',
 '2.2':'Verify plant and animal cell boundaries, organelles, and the distinctions on the rendered image.',
 '2.3':'Verify prokaryotic nucleoid, eukaryotic nucleus, envelopes and relative scale; illustration is conceptual.',
 '2.4':'Verify bilayer orientation and the actual placement of membrane proteins before anchoring labels.',
 '2.5':'Verify cell wall, plasma membrane and vacuole/tonoplast depiction.',
 '2.6':'Verify interphase chromatin, nuclear pores and nucleolus depiction.',
 '2.7':'Verify organelle membranes, cristae and thylakoid/grana structures.',
 '2.8':'Verify rough/smooth ER, Golgi and lysosome identification; do not reuse vector-plate anchor coordinates.',
 '2.9':'Mitosis and a separate meiosis draft are available; verify both and their coverage.',
 '2.10':'Protein synthesis and a biomolecules supplement are available; verify all required biomolecule classes and coverage.',
 '2.11':'Conceptual cancer illustration; verify scientific framing and avoid implying visual diagnosis.'}
with AUDIT.open(encoding='utf-8-sig',newline='') as f:
 rows=sorted((r for r in csv.DictReader(f) if r['chapter_id']=='c9_cell'),key=lambda r:int(r['spread']))
assert len(rows)==len(files)==len(prompts)==11
records=[]
for row,name,prompt in zip(rows,files,prompts):
 p=HERE/name
 record={'key':'c9_cell:'+row['section'],'section':row['section'],'topic_en':row['runtime_title_en'],
         'topic_hi':row['runtime_title_hi'],'scene_type':row['scene_type'],'image':name if p.exists() else None,
         'status':'AI_DRAFT_REVIEW_PENDING' if p.exists() else 'NOT_GENERATED',
         'subject_review':'PENDING','bilingual_label_review':'PENDING','anchor_mapping':'NOT_DONE',
         'full_topic_visual_coverage':'NOT_GENERATED' if not p.exists() else 'UNVERIFIED',
         'known_review_issue':risks[row['section']],'generation_prompt_summary':prompt}
 if p.exists():
  with Image.open(p) as im: record.update(width=im.width,height=im.height,format=im.format)
  record.update(bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest())
 supplements={'2.9':'2-09-meiosis-supplement.jpg','2.10':'2-10-biomolecules-supplement.jpg'}
 if row['section'] in supplements and (HERE/supplements[row['section']]).exists():
  q=HERE/supplements[row['section']]
  with Image.open(q) as im: record['supplements']=[{'image':q.name,'sha256':hashlib.sha256(q.read_bytes()).hexdigest(),'width':im.width,'height':im.height,'bytes':q.stat().st_size,'review':'PENDING'}]
 records.append(record)
manifest={'schema':'eduverse.offline-realistic-draft/v1','chapter':'c9_cell','class':'IX',
          'source_audit_sha256':'1084fd0ed091e91a48e2c8a73b829f79099c8661df95a2ffb5d1b0650137dedb',
          'assets_generated':sum(r['image'] is not None for r in records),'total_topics':11,
          'image_kind':'AI-generated scientific illustration; not an authentic micrograph or photograph',
          'teacher_team_signoff':'PENDING','application_integration':'STAGING_ONLY',
          'notes':'Bilingual headings are from the app; anchored scientific labels have not been authored or reviewed. Individual images may be inaccurate. Prompt summaries are not verbatim generation-call records.',
          'topics':records}
(HERE/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

script='''
(() => {
  const dialog = document.getElementById('lightbox');
  const image = document.getElementById('lightboxImage');
  const title = document.getElementById('lightboxTitle');
  let trigger = null;
  for (const button of document.querySelectorAll('[data-review-image]')) {
    button.addEventListener('click', () => {
      const source = button.querySelector('img');
      if (!source) return;
      trigger = button; image.src = source.src; image.alt = source.alt;
      title.textContent = button.dataset.topic;
      dialog.showModal(); document.getElementById('closeLightbox').focus();
    });
  }
  document.getElementById('closeLightbox').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { image.removeAttribute('src'); if (trigger) trigger.focus(); });
})();
'''
sha=base64.b64encode(hashlib.sha256(script.encode()).digest()).decode()
csp=f"default-src 'none'; base-uri 'none'; object-src 'none'; connect-src 'none'; img-src data:; script-src 'sha256-{sha}'; style-src 'unsafe-inline'"
css='''
*{box-sizing:border-box}body{margin:0;background:#e9eff5;color:#12263c;font-family:system-ui,Arial,sans-serif;line-height:1.45}
header{background:#0d2844;color:white;padding:26px max(20px,calc((100vw - 1300px)/2));border-bottom:5px solid #d5ad5e}
header h1{margin:5px 0;font-size:clamp(24px,4vw,36px)}header p{margin:8px 0;max-width:950px;color:#e5eff7}
main{max-width:1340px;margin:auto;padding:20px}.notice{background:#fff7df;border-left:5px solid #b57608;padding:14px 18px;border-radius:4px;margin:0 0 20px}
.gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,330px),1fr));gap:18px}.card{background:white;border:1px solid #c4d2e0;border-radius:12px;overflow:hidden;box-shadow:0 3px 12px #0a274015}.card h2{font-size:17px;margin:12px 14px 2px}.card p{margin:4px 14px 12px;font-size:14px}.card .risk{font-size:13px;color:#603b09}.card button{width:100%;padding:0;border:0;background:#dfe7ee;cursor:zoom-in;display:block}.card button:focus-visible,.close:focus-visible{outline:4px solid #d28b08;outline-offset:-4px}.card img{display:block;width:100%;height:auto;aspect-ratio:11/6;object-fit:contain}.missing{min-height:190px;display:grid;place-items:center;background:#e4e8ed;color:#4d5966;font-weight:bold;padding:24px;text-align:center}.status{color:#825b13;font-weight:700}.foot{margin:24px 0;color:#39516a;font-size:14px}
dialog{border:1px solid #8aabc8;border-radius:12px;background:#0b1c30;color:white;width:min(96vw,1500px);max-width:none;height:min(94vh,1000px);max-height:none;padding:12px}dialog::backdrop{background:rgba(2,8,15,.90)}.dialog-head{display:flex;gap:12px;justify-content:space-between;align-items:center}.dialog-head h2{font-size:clamp(14px,2.3vw,22px);margin:0}.close{width:44px;height:44px;flex:none;border-radius:7px;background:#164062;color:white;border:1px solid #9dc8eb;font-size:26px;cursor:pointer}.dialog-image{height:calc(100% - 96px);display:flex;align-items:center;justify-content:center}.dialog-image img{max-width:100%;max-height:100%;object-fit:contain}dialog p{margin:4px 0;font-size:13px;color:#e1e9f0}
'''
cards=[]
for r in records:
 en=html.escape(r['topic_en']);hi=html.escape(r['topic_hi']);sec=html.escape(r['section']);risk=html.escape(r['known_review_issue'])
 if r['image']:
  data=base64.b64encode((HERE/r['image']).read_bytes()).decode('ascii')
  view=f'<button type="button" data-review-image data-topic="{en} / {hi}" aria-label="Enlarge {en}"><img loading="lazy" src="data:image/jpeg;base64,{data}" alt="AI-generated draft illustration: {en} / {hi}"></button>'
  for supplement in r.get('supplements',[]):
   data2=base64.b64encode((HERE/supplement['image']).read_bytes()).decode('ascii')
   view+=f'<button type="button" data-review-image data-topic="Supplement: {en} / {hi}" aria-label="Enlarge supplementary draft: {en}"><img loading="lazy" src="data:image/jpeg;base64,{data2}" alt="Supplementary AI-generated draft: {en} / {hi}"></button>'
 else:
  view='<div class="missing">Image not generated yet<br>चित्र अभी तैयार नहीं है</div>'
 cards.append(f'<article class="card">{view}<h2>§ {sec} · {en}</h2><p lang="hi">{hi}</p><p class="status">Teacher and label review pending</p><p class="risk">{risk}</p></article>')
body='\n'.join(cards)
out=f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="{html.escape(csp,quote=True)}"><title>EduVerse · Cell image review</title><style>{css}</style></head>
<body><header><p>EDUVERSE · OFFLINE REVIEW ONLY</p><h1>Cell illustrations / कोशिका चित्र</h1><p>13 AI-generated images for 11 topics · Class IX · Click an image to enlarge it</p></header>
<main><p class="notice"><strong>Not yet approved; integrated only in a separate staging app.</strong> Images are AI-generated illustrations, not real microscope photographs. Scientific accuracy, detailed bilingual annotations and teacher sign-off are pending. Topic headings below are not anchored labels. 2.9 and 2.10 have supplemental images, but coverage remains unverified.</p><section class="gallery" aria-label="Cell illustration review">{body}</section><p class="foot">Copyright / Developer : Paras Pranav · This review gallery does not change the working 3D app; a separate staging app previews the drafts.</p></main>
<dialog id="lightbox" aria-labelledby="lightboxTitle"><div class="dialog-head"><h2 id="lightboxTitle">Image review</h2><button type="button" class="close" id="closeLightbox" aria-label="Close enlarged image / बड़ा चित्र बंद करें">×</button></div><div class="dialog-image"><img id="lightboxImage" alt=""></div><p>AI-generated draft · accuracy and labels not yet approved. Close to return / वापस जाने के लिए बंद करें.</p></dialog><script>{script}</script></body></html>'''
(HERE/'REVIEW.html').write_text(out,encoding='utf-8')
print('review html', (HERE/'REVIEW.html').stat().st_size, 'assets',manifest['assets_generated'],'topics',len(records))
