#!/usr/bin/env python3
"""Produce a read-only checklist from a live EduVerse inventory and chapter packs."""
import csv, hashlib, json
from pathlib import Path
from collections import Counter
OUT = Path(__file__).resolve().parent
ROOT = OUT.parent if (OUT.parent / 'authoring').exists() else Path('/home/user/metaworld')
from restore_runtime_inventory import restore
restore()
inv = json.loads((OUT/'runtime_inventory.json').read_text(encoding='utf-8'))
ix = ['c9_cell','c9_tissues','c9_motion','c9_mixtures','c9_forces','c9_work_energy','c9_atom','c9_atomic_foundations','c9_sound','c9_diversity','c9_earth']
x = ['c10_reactions','c10_acids','c10_metals','c10_carbon','c10_heredity','c10_light','c10_eye','c10_electricity','c10_magnetism','c10_life','c10_control','c10_repro','c10_env']
requested = ix+x
by_id = {c['id']:c for c in inv['chapters']}
assert len(by_id) == 33 and len(requested) == 24 and all(i in by_id for i in requested)
others_student = [c['id'] for c in inv['chapters'] if c['student'] and c['id'] not in requested]
refs = [c['id'] for c in inv['chapters'] if not c['student'] and c['hasRuntimePack']]
tools = [c['id'] for c in inv['chapters'] if not c['student'] and not c['hasRuntimePack']]
order = requested + others_student + refs + tools
assert len(order) == len(set(order)) == 33
old = list(csv.DictReader((ROOT/'docs/2D_PLATE_COVERAGE.csv').open(encoding='utf-8',newline='')))
old_index = {(r['chapter_id'],int(r['spread'])):r for r in old}
rows, discrepancies = [], []
for cid in order:
    c=by_id[cid]
    scope='requested' if cid in requested else 'additional_student' if c['student'] else 'reference' if c['hasRuntimePack'] else 'tools_only'
    pp=ROOT/'authoring/packs'/f'{cid}.json'
    pack=json.loads(pp.read_text(encoding='utf-8')) if pp.exists() else None
    blocks = {int(b['spread']) for b in pack['3d_blocks']} if pack else set()
    if pack:
        assert len(pack['sections']) == len(c['spreads']), cid
    for s in c['spreads']:
        i=s['index']; sec=pack['sections'][i-1] if pack else None
        if sec:
            assert s['section'] == str(sec['id']) and i-1==sec['spread'], (cid,i)
        oldrow=old_index.get((cid,i))
        if c['student']:
            assert oldrow and oldrow['section_no']==s['section'] and oldrow['spread_title_en']==s['title'] and oldrow['scene_type']==s['sceneType'], (cid,i,'existing coverage mismatch')
        en=sec['title_en'] if sec else ''
        hi=sec['title_hi'] if sec else ''
        mismatch=bool(sec and (en!=s['title'] or hi!=s['titleHi']))
        if mismatch: discrepancies.append((cid,i,s['section']))
        rows.append({'scope':scope,'class':c['cls'],'chapter_id':cid,'chapter_title_en':c['title'],'chapter_title_hi':c['hi'],
          'spread':i,'section':s['section'],'scene_type':s['sceneType'],'runtime_scene_configured':bool(s['sceneType']),
          'runtime_title_en':s['title'],'runtime_title_hi':s['titleHi'],'pack_topic_en':en,'pack_topic_hi':hi,
          'pack_3d_block_for_spread':i-1 in blocks,'runtime_world_source':'authored' if c['hasAuthoredWorld'] else 'compiler_fallback',
          'existing_right_page_2d':'vector_candidate_teacher_review_pending' if s['plate2dKey'] else 'not_implemented',
          'required_realistic_2d':'not_generated','toggle_2d_currently_enabled':bool(s['plate2dKey']),
          'realistic_image_review':'pending','notes':'pack title differs from displayed title' if mismatch else ''})
assert len(rows)==266 and len({(r['chapter_id'],r['spread']) for r in rows})==266
assert all(r['scene_type'] for r in rows)
assert len(discrepancies)==26
assert Counter(r['scope'] for r in rows)=={'requested':225,'additional_student':15,'reference':13,'tools_only':13}
assert sum(r['existing_right_page_2d'].startswith('vector') for r in rows)==11
fields=list(rows[0])
with (OUT/'COMPLETE_TOPIC_CHECKLIST.csv').open('w',encoding='utf-8-sig',newline='') as f:
    w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows(rows)
lines=['# EduVerse: complete topic and scene audit', '',
 '**Stage:** read-only checklist for confirmation. No new image assets or application code were generated as part of this audit.', '',
 f"**Audited runtime:** local preview, `index.html` SHA-256 `{inv['bundleSha256']}`. The list is taken from the running app’s `CATALOGUE_ALL` + `getWorld()` and cross-checked against the chapter packs and the earlier 240-row coverage CSV.", '',
 '## Scope and interpretation', '',
 '| Scope | Chapters | Runtime spreads / planned 2D illustrations |', '|---|---:|---:|',
 '| Explicitly named in the request | 24 | 225 |', '| Additional student chapters present in the app | 2 | 15 |',
 '| Reference chapters outside the student list | 3 | 13 |', '| Tools-shelf-only catalogue entries | 4 | 13 |',
 '| **Total** | **33** | **266** |', '',
 'Each row is a distinct runtime spread and has a configured `scene.type`. This is a data-level inventory, not proof that each scene has been manually viewed, that its 3D model is scientifically correct, or that there are no unlisted concepts inside a spread. Where a spread bundles several concepts, the illustration plan must explicitly cover each concept; one row is the minimum planning unit, not proof that a single image suffices.', '',
 '**Current state:** all 266 rows still need the requested highly realistic, subject-reviewed 2D treatment. Eleven `c9_cell` rows have an existing **vector** 2D candidate and an enabled 2D toggle; these are not photorealistic and their teacher-team sign-off is pending. On other chapters the existing 2D plate option remains unavailable. The current zoom feature supports 2D pilot plates and an explicit 3D snapshot button; high-resolution assets and platform-wide image-click behavior have not been audited here.', '',
 '**Pack cross-check:** all 29 chapter-pack section counts and section/spread indices match their runtime worlds. Across Carbon (16) and Light (10), the runtime title and the pack title differ on 26 rows; both are preserved in the CSV and, below, the pack titles appear in parentheses. The pack’s `3d_blocks` are capped at six in 25 longer packs (169 blocks total across 29 packs), so those blocks are **not** a complete per-spread inventory. Runtime spread scene data—not the pack block count—is the mapping basis.', '',
 '**Tools fallback:** `c9_pure`, `c9_atoms`, and `c9_disease` use generated compiler-fallback worlds, including placeholder or generic titles. They are not evidence of fully authored science topics; retain them for scope review rather than inventing titles.', '',
 '**Constraints needing confirmation:** the current single-file offline build is '+f"{(ROOT/'index.html').stat().st_size:,}"+' bytes against its prior 5,000,000-byte budget, with no external runtime assets. Hundreds of high-resolution realistic images cannot be assumed to fit the remaining budget. Asset packaging and offline/network behaviour must be agreed before generation; scientific and bilingual labels require independent review.', '',
 'Legend: `[ ]` = requested realistic asset not yet generated. `Vector pilot` = an existing non-photorealistic candidate only; `—` = no implemented topic-specific 2D opposite-page plate.', '']
headings={'requested':'## Explicitly requested chapters','additional_student':'## Additional student chapters not named in the request','reference':'## Additional reference chapters','tools_only':'## Tools-shelf-only entries'}
last=None
for cid in order:
    group=[r for r in rows if r['chapter_id']==cid]; scope=group[0]['scope']
    if scope!=last: lines.extend([headings[scope],'']);last=scope
    c=by_id[cid]
    lines.extend([f"### Class {c['cls']} — {c['title']} (`{cid}`) — {len(group)} spreads",'', '| # | Section | Runtime topic (English) | Runtime topic (हिंदी) | Scene | Existing 2D |', '|---:|---|---|---|---|---|'])
    for r in group:
        def md(v):return str(v).strip().replace('|','\\|').replace('\n',' ')
        en=md(r['runtime_title_en']) or '*(blank)*';hi=md(r['runtime_title_hi']) or '*(blank)*'
        if r['notes']:
            en += '<br>Pack: '+md(r['pack_topic_en'])
            hi += '<br>Pack: '+md(r['pack_topic_hi'])
        existing='Vector pilot' if r['existing_right_page_2d'].startswith('vector') else '—'
        lines.append(f"| [ ] {r['spread']} | {md(r['section'])} | {en} | {hi} | `{md(r['scene_type'])}` | {existing} |")
    lines.append('')
lines += ['## Data files', '', '- `COMPLETE_TOPIC_CHECKLIST.csv`: same 266 rows with scope, section, runtime and pack titles, scene, pack-block presence, and current 2D status.', '- `runtime_inventory.json`: raw runtime scene records, useful for investigating the underlying scene labels and controls.', '', '**Review boundary:** topic titles and labels are transcribed from the app and packs, not certified against a CBSE/NCERT source. No teacher-team or final owner sign-off is implied.']
(OUT/'COMPLETE_TOPIC_CHECKLIST.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print('wrote 266 rows',Counter(r['scope'] for r in rows),'26 title discrepancies',len(discrepancies))
print('markdown bytes',(OUT/'COMPLETE_TOPIC_CHECKLIST.md').stat().st_size,'csv bytes',(OUT/'COMPLETE_TOPIC_CHECKLIST.csv').stat().st_size)
