#!/usr/bin/env python3
"""EduVerse curriculum compiler.

authoring/syllabus_ix.txt + syllabus_x.txt  ->  src/chapters_generated.js
                                            ->  SYLLABUS_2026_27.md (coverage ledger)
                                            ->  authoring/coverage.json (machine check)

Design rules (the "master mind" part):
  * ONE declarative knowledge base; no chapter is hand-written in JS.
  * ONE spread per NCERT topic/subtopic. The section picker exposes every one.
  * Every spread is bilingual, has a pure numeric lab, a 3D declarative figure,
    a contrastive prediction, a quiz item, a challenge and a completion stamp.
  * Nothing is silently dropped: formative-only and out-of-syllabus topics are
    retained with an explicit status and shown in the Tools shelf.
  * Copyright / Developer : Paras Pranav
"""
from __future__ import annotations
import json, math, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CREDIT = "Copyright / Developer : Paras Pranav"
FILES = [ROOT / "authoring/syllabus_ix.txt", ROOT / "authoring/syllabus_x.txt"]

# Chapter ids that are retained but are NOT part of the 26 assessed student chapters.
REFERENCE_IDS = {"c10_periodic", "c10_sources", "c10_sustainable"}

# Existing catalogue rows whose 2026-27 title/source must be corrected in place.
EXISTING_X = {
    "c10_reactions", "c10_acids", "c10_metals", "c10_carbon", "c10_life",
    "c10_control", "c10_repro", "c10_heredity", "c10_light", "c10_eye",
    "c10_electricity", "c10_magnetism", "c10_env",
}
EXISTING_IX = {"c9_cell", "c9_tissues"}
# Curated deep chapters have no @CH line; refresh only their syllabus source.
CURATED_UPDATES = [
    dict(id="c10_carbon", source="CBSE 2026-27 · Unit I · Ch 4 · NCERT Science X",
         status="syllabus-2026-27"),
    dict(id="c10_light", source="CBSE 2026-27 · Unit III · Ch 9 · NCERT Science X",
         status="syllabus-2026-27"),
]

ORDER_IX = ["c9_exploration", "c9_cell", "c9_tissues", "c9_motion", "c9_mixtures",
            "c9_forces", "c9_work_energy", "c9_atom", "c9_atomic_foundations",
            "c9_sound", "c9_reproduction9", "c9_diversity", "c9_earth"]
ORDER_X = ["c10_reactions", "c10_acids", "c10_metals", "c10_carbon", "c10_life",
           "c10_control", "c10_repro", "c10_heredity", "c10_light", "c10_eye",
           "c10_electricity", "c10_magnetism", "c10_env"]
STUDENT_ORDER = ORDER_IX + ORDER_X

KINDS = {"flow", "cycle", "tree", "bars", "graph", "layers", "rays", "circuit",
         "molecule", "cell", "wave", "field", "machine", "table"}


def js(s) -> str:
    """JSON string literal, safe inside an inline <script>."""
    return json.dumps(str(s), ensure_ascii=False).replace("</", "<\\/").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")


def parse():
    chapters, cur = [], None
    for path in FILES:
        for raw in path.read_text(encoding="utf-8").splitlines():
            line = raw.strip()
            if not line or line.startswith("#"):
                continue
            # author-friendly shorthand: "@CH id|..." and "@T sec|..."
            if line.startswith("@CH "):
                line = "@CH|" + line[4:]
            elif line.startswith("@T "):
                line = "@T|" + line[3:]
            bits = [b.strip() for b in line.split("|")]
            if bits[0] == "@CH":
                assert len(bits) == 15, f"{path.name}: @CH needs 15 fields, got {len(bits)}: {line[:80]}"
                _, cid, cls, subject, en, hi, source, color, grammar, fl, fe, fn, params, readouts, terms = bits
                ps = []
                for spec in params.split(";"):
                    a = [x.strip() for x in spec.strip().split(":")]
                    assert len(a) == 5, f"bad param {spec} in {cid}"
                    ps.append(dict(id=a[0], min=float(a[1]), max=float(a[2]), value=float(a[3]), label=a[4]))
                rs = []
                for spec in readouts.split(";"):
                    a = [x.strip() for x in spec.strip().split(":")]
                    assert len(a) == 3, f"bad readout {spec} in {cid}"
                    rs.append(dict(label=a[0], expr=a[1], unit=a[2]))
                ts = []
                for spec in terms.split(";"):
                    a = [x.strip() for x in spec.strip().split(":")]
                    assert len(a) == 2, f"bad term {spec} in {cid}"
                    ts.append((a[0], a[1]))
                cur = dict(id=cid, cls=cls, subject=subject, en=en, hi=hi, source=source,
                           color=color, grammar=grammar, formula=(fl, fe, fn),
                           params=ps, readouts=rs, terms=ts, topics=[])
                chapters.append(cur)
            elif bits[0] == "@T":
                assert cur is not None, "@T before @CH"
                assert len(bits) >= 10, f"bad @T: {line[:90]}"
                _, sec, en, hi, concept, hconcept, fact, hfact, kind, labels = bits[:10]
                status = bits[10] if len(bits) > 10 else "assessed"
                assert kind in KINDS, f"unknown figure kind {kind} in {cur['id']} {sec}"
                assert status in ("assessed", "formative", "archive"), status
                labs = [x.strip() for x in labels.split(";") if x.strip()]
                assert 3 <= len(labs) <= 8, f"{cur['id']} {sec}: need 3-8 labels, got {labs}"
                cur["topics"].append(dict(sec=sec, en=en, hi=hi, concept=concept,
                                          hconcept=hconcept, fact=fact, hfact=hfact,
                                          kind=kind, labels=labs, status=status))
            else:
                raise SystemExit(f"unknown line in {path.name}: {line[:80]}")
    return chapters


def safe_eval(expr, vals):
    """Python mirror of the JS A3eval, used at build time to validate expressions."""
    e = expr.replace("^", "**")
    ns = dict(vals)
    ns.update(sqrt=math.sqrt, abs=abs, min=min, max=max, round=round,
              pow=math.pow, sin=math.sin, cos=math.cos)
    try:
        v = eval(e, {"__builtins__": {}}, ns)  # noqa: S307 - authored literals only
        return float(v) if isinstance(v, (int, float, bool)) else 0.0
    except Exception as ex:
        raise SystemExit(f"INVALID EXPR {expr!r}: {ex}")


def vals_for(params, override=None):
    v = {p["id"]: p["value"] for p in params}
    if override:
        v.update(override)
    return v


def challenge_for(ch):
    """Pick a reachable target that requires actually moving a slider."""
    rs, ps = ch["readouts"], ch["params"]
    if not rs or not ps:
        return dict(text="Move the slider and observe the readings.", textHi="स्लाइडर चलाएँ और रीडिंग देखें।",
                    target={"key": "r0", "value": 0, "op": "gte"})
    expr = rs[0]["expr"]
    p0 = ps[0]
    base = safe_eval(expr, vals_for(ps))
    hi = safe_eval(expr, vals_for(ps, {p0["id"]: p0["max"]}))
    lo = safe_eval(expr, vals_for(ps, {p0["id"]: p0["min"]}))
    if hi > base + 1e-9:
        val, op = base + 0.35 * (hi - base), "gte"
    elif lo > base + 1e-9:
        val, op = base + 0.35 * (lo - base), "gte"
    else:
        val, op = base - 0.35 * (base - min(hi, lo)), "lte"
    val = round(val, 2)
    label = rs[0]["label"]
    text = f"Set {label} to {'at least' if op == 'gte' else 'at most'} {val} {rs[0]['unit']}, then touch two diagram cards."
    textHi = f"{label} को {'कम से कम' if op == 'gte' else 'अधिक से अधिक'} {val} {rs[0]['unit']} तक ले जाएँ और दो चित्र कार्ड छूएँ।"
    return dict(text=text, textHi=textHi, target={"key": "r0", "value": val, "op": op})


def build_spread(ch, i, t):
    topics = ch["topics"]
    n = len(topics)
    # contrastive distractors: real facts from two OTHER topics of the same chapter
    d1 = topics[(i + 1 + n) % n] if n > 1 else t
    d2 = topics[(i + 2 + n) % n] if n > 1 else t
    pos = i % 3
    opts, hopts = [d1["fact"], d2["fact"]], [d1["hfact"], d2["hfact"]]
    opts.insert(pos, t["fact"]); hopts.insert(pos, t["hfact"])
    q = f"Which statement belongs to {t['en']}?"
    qh = f"कौन-सा कथन '{t['hi']}' से मेल खाता है?"
    ans = pos
    why = t["fact"]
    whyh = t["hfact"]

    fl, fe, fn = ch["formula"]
    terms = ch["terms"]
    vocab = [[terms[(i + k) % len(terms)][0], t["concept"][:58]] for k in range(3)]
    vocab_hi = [[terms[(i + k) % len(terms)][1], t["hconcept"][:58]] for k in range(3)]

    p0 = ch["params"][0] if ch["params"] else dict(label="control", min=0, max=1, value=1, id="p")
    r0 = ch["readouts"][0]["label"] if ch["readouts"] else "reading"
    hint = f"Move {p0['label']} and watch {r0}; touch two diagram cards."
    hinthi = f"{p0['label']} बदलें और {r0} देखें, दो चित्र कार्ड छूएँ।"

    return dict(
        id=f"{ch['id']}_{t['sec'].replace('.', '_').replace(' ', '_')}",
        section=t["sec"], title=t["en"], titleHi=t["hi"], short=t["en"][:22],
        concept=t["concept"], conceptHi=t["hconcept"],
        formula=dict(label=fl, eq=fe, note=fn),
        predict=dict(q=q, options=opts, a=ans, why=why),
        predictHi=dict(q=qh, options=hopts, a=ans, why=whyh),
        explain=why, explainHi=whyh,
        vocab=vocab, vocabHi=vocab_hi,
        fig=f"3D {t['kind']} · {t['en']} · " + " → ".join(t["labels"][:4]),
        figHi=f"3D {t['kind']} चित्र · {t['hi']} · " + " / ".join(t["labels"][:3]),
        tryHint=hint, hintHi=hinthi,
        challenge=challenge_for(ch),
        quiz=dict(q=q, options=opts, a=ans, why=why),
        scene=dict(type="atlas", fig=dict(kind=t["kind"], labels=t["labels"]),
                   controls=ch["params"], readouts=ch["readouts"], params={}),
        status=t["status"])


def js_value(v, indent=0):
    """Emit a JS literal, with bilingual function labels for controls."""
    if isinstance(v, dict):
        pad = "  " * indent
        parts = []
        for k, val in v.items():
            if k == "label" and isinstance(val, dict) and "hi" in val:
                parts.append(f"{pad}  label: function(){{ return BI({js(val['en'])}, {js(val['hi'])}); }}")
            else:
                parts.append(f"{pad}  {json.dumps(k)}: {js_value(val, indent + 1)}")
        return "{\n" + ",\n".join(parts) + "\n" + pad + "}"
    if isinstance(v, (list, tuple)):
        return "[" + ", ".join(js_value(x, indent) for x in v) + "]"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return str(v)
    return js(v)


HINT_HI = {
    "Steps in an inquiry": "जाँच के चरण", "Organelles seen": "देखे गए अंगक",
    "Microscope zoom": "सूक्ष्मदर्शी आवर्धन", "Tissue layers": "ऊतक परतें",
    "Cells per layer": "प्रति परत कोशिकाएँ", "Time t in seconds": "समय t सेकंड",
    "Initial speed u in m/s": "प्रारंभिक चाल u मी/से", "Solute mass in g": "विलेय द्रव्यमान ग्राम",
    "Solution mass in g": "विलयन द्रव्यमान ग्राम", "Force F in newtons": "बल F न्यूटन",
    "Mass m in kg": "द्रव्यमान m किग्रा", "Displacement s in m": "विस्थापन s मीटर",
    "Atomic number Z": "परमाणु क्रमांक Z", "Neutron count N": "न्यूट्रॉन संख्या N",
    "Atoms of A": "A के परमाणु", "Atoms of B": "B के परमाणु",
    "Frequency f in hertz": "आवृत्ति f हर्ट्ज़", "Speed v in m/s": "चाल v मी/से",
    "Stages completed": "पूर्ण चरण", "Cell divisions": "कोशिका विभाजन",
    "Taxonomic levels": "वर्गीकरण स्तर", "Shared characters": "साझा लक्षण",
    "Solar input units": "सौर निवेश इकाई", "Stored units": "संग्रहित इकाई",
    "Molecules of reactant": "अभिकारक अणु", "Molecules of product": "उत्पाद अणु",
    "pH value": "पीएच मान", "Acid amount": "अम्ल मात्रा",
    "Reactivity rank": "क्रियाशीलता क्रम", "Reaction time": "अभिक्रिया समय",
    "Glucose units": "ग्लूकोज़ इकाई", "Oxygen units": "ऑक्सीजन इकाई",
    "Signal steps": "संकेत चरण", "Signal speed": "संकेत गति",
    "Development stages": "विकास के चरण", "Offspring class": "संतति वर्ग",
    "Recessive class": "अप्रभावी वर्ग", "Near point in cm": "निकट बिंदु सेमी",
    "Lens power in dioptres": "लेंस क्षमता डायोप्टर",
    "Current I in amperes": "धारा I एम्पीयर", "Resistance R in ohms": "प्रतिरोध R ओम",
    "Turns in the coil": "कुंडली में फेरे", "Producer energy in kJ": "उत्पादक ऊर्जा kJ",
    "Trophic level": "पोषी स्तर", "Group number": "समूह संख्या",
    "Period number": "आवर्त संख्या", "Energy source rank": "ऊर्जा स्रोत क्रम",
    "Renewability score": "नवीकरणीयता अंक", "Resources managed": "प्रबंधित संसाधन",
    "Community participation": "सामुदायिक भागीदारी",
}
READOUT_HI = {
    "Observations": "प्रेक्षण", "Evidence": "प्रमाण", "Confidence": "विश्वास",
    "Parts identified": "पहचाने गए भाग", "Zoom": "आवर्धन", "Detail": "विवरण",
    "Layers": "परतें", "Cells": "कोशिकाएँ", "Strength": "मज़बूती",
    "Final speed": "अंतिम चाल", "Displacement": "विस्थापन",
    "Mass percent": "द्रव्यमान प्रतिशत", "Solvent": "विलायक",
    "Acceleration": "त्वरण", "Momentum": "संवेग", "Work": "कार्य",
    "Power": "शक्ति", "Energy": "ऊर्जा", "Mass number": "द्रव्यमान संख्या",
    "Electrons": "इलेक्ट्रॉन", "Shells": "कोश", "Formula mass": "सूत्र द्रव्यमान",
    "Ratio": "अनुपात", "Total atoms": "कुल परमाणु", "Wavelength": "तरंगदैर्घ्य",
    "Time period": "आवर्तकाल", "Audible": "श्रव्य", "Stages": "चरण",
    "Growth": "वृद्धि", "Groups": "समूह", "Shared": "साझा", "Rank": "श्रेणी",
    "Energy flow": "ऊर्जा प्रवाह", "Cycled matter": "चक्रित द्रव्य", "Balance": "संतुलन",
    "Atoms left": "बाएँ परमाणु", "Atoms right": "दाएँ परमाणु", "Balance ": "संतुलन",
    "H plus": "H प्लस", "OH minus": "OH माइनस", "Neutral": "उदासीन",
    "Reaction rate": "अभिक्रिया दर", "Stability": "स्थिरता", "Energy": "ऊर्जा",
    "CO2": "CO2", "Water": "जल", "Response time": "अनुक्रिया समय",
    "Path length": "पथ लंबाई", "Coordination": "समन्वय", "Variation": "विभिन्नता",
    "Dominant ratio": "प्रभावी अनुपात", "Total": "कुल", "Percent": "प्रतिशत",
    "Focal length": "फ़ोकस दूरी", "Accommodation": "समंजन", "Correction": "सुधार",
    "Potential": "विभवांतर", "Heat": "ऊष्मा", "Field": "क्षेत्र", "Range": "परास",
    "Available": "उपलब्ध", "Lost": "खोई ऊर्जा", "Levels": "स्तर",
    "Valence electrons": "संयोजकता इलेक्ट्रॉन", "Atomic number": "परमाणु क्रमांक",
    "Quality": "गुणवत्ता", "Waste": "अपशिष्ट", "Output": "निर्गम",
    "Conserved": "संरक्षित", "Participation": "भागीदारी", "Sustainability": "सततता",
}


def bilingual_controls(ch):
    out = []
    for p in ch["params"]:
        d = dict(p)
        d["label"] = {"en": p["label"], "hi": HINT_HI.get(p["label"], p["label"])}
        out.append(d)
    return out


def bilingual_readouts(ch):
    out = []
    for r in ch["readouts"]:
        d = dict(r)
        d["labelHi"] = READOUT_HI.get(r["label"], r["label"])
        out.append(d)
    return out



def emit_lab(ctrl, rd):
    """Shared per-chapter lab object, referenced by every spread (small bundle)."""
    def lit(v):
        if isinstance(v, dict):
            if "en" in v and "hi" in v:
                return "function(){ return BI(%s, %s); }" % (js(v["en"]), js(v["hi"]))
            return "{" + ", ".join(json.dumps(k) + ": " + lit(x) for k, x in v.items()) + "}"
        if isinstance(v, (list, tuple)):
            return "[" + ", ".join(lit(x) for x in v) + "]"
        if isinstance(v, bool):
            return "true" if v else "false"
        if isinstance(v, (int, float)):
            return str(v)
        return js(v)
    return "{ controls: %s, readouts: %s }" % (lit(ctrl), lit(rd))

def main():
    chapters = parse()
    by_id = {c["id"]: c for c in chapters}
    # validate every expression at default / min / max of each parameter
    for c in chapters:
        for r in c["readouts"]:
            safe_eval(r["expr"], vals_for(c["params"]))
            for p in c["params"]:
                safe_eval(r["expr"], vals_for(c["params"], {p["id"]: p["min"]}))
                safe_eval(r["expr"], vals_for(c["params"], {p["id"]: p["max"]}))
        assert len(c["topics"]) >= 3, f"{c['id']} needs >=3 spreads"
        assert len(set(t["sec"] for t in c["topics"])) == len(c["topics"]), f"duplicate section in {c['id']}"

    # ---- generated JS -----------------------------------------------------
    lines = [
        "/* GENERATED FILE — DO NOT EDIT.",
        "   Source of truth: authoring/syllabus_ix.txt + authoring/syllabus_x.txt",
        "   Rebuild: python3 tools/build_chapters.py && python3 build.py",
        f"   CBSE 2026-27 · 26 assessed chapters · {CREDIT} */",
        "(function () {",
        "  const LAB = {};",
    ]
    for c in chapters:
        ctrl = bilingual_controls(c)
        rd = bilingual_readouts(c)
        spreads = []
        for i, t in enumerate(c["topics"]):
            sp = build_spread(c, i, t)
            sp["scene"]["controls"] = {"__ref__": f"LAB[{js(c['id'])}].controls"}
            sp["scene"]["readouts"] = {"__ref__": f"LAB[{js(c['id'])}].readouts"}
            spreads.append(sp)
        # emit spread array with function-valued control labels
        lines.append(f"  LAB[{js(c['id'])}] = " + emit_lab(ctrl, rd) + ";")
        def emit(v, ind=2):
            pad = "  " * ind
            if isinstance(v, dict):
                if "__ref__" in v:
                    return v["__ref__"]
                parts = []
                for k, val in v.items():
                    if isinstance(val, dict) and "en" in val and "hi" in val and k == "label":
                        parts.append(f"{pad}  label: function(){{ return BI({js(val['en'])}, {js(val['hi'])}); }}")
                    else:
                        parts.append(f"{pad}  {json.dumps(k)}: {emit(val, ind + 1)}")
                return "{\n" + ",\n".join(parts) + "\n" + pad + "}"
            if isinstance(v, list):
                return "[" + ", ".join(emit(x, ind) for x in v) + "]"
            if isinstance(v, bool):
                return "true" if v else "false"
            if isinstance(v, (int, float)):
                return str(v)
            return js(v)
        lines.append(f"  WORLDS[{js(c['id'])}] = {emit(spreads)};")
        quiz = [dict(q=s["quiz"]["q"], options=s["quiz"]["options"], a=s["quiz"]["a"], why=s["quiz"]["why"]) for s in spreads]
        quiz_hi = [dict(q=s["predictHi"]["q"], options=s["predictHi"]["options"], a=s["predictHi"]["a"], why=s["predictHi"]["why"]) for s in spreads]
        sections = [dict(id=t["sec"], en=t["en"], hi=t["hi"], spread=i, color=c["color"]) for i, t in enumerate(c["topics"])]
        groups = [dict(id=t["sec"], en=t["en"], hi=t["hi"], color=c["color"], spread=i,
                       desc=t["fact"][:70]) for i, t in enumerate(c["topics"])]
        pack = dict(
            id=c["id"], cls=c["cls"], title=c["en"], titleHi=c["hi"], source=c["source"],
            generated_by=f"EduVerse · CBSE 2026-27 · {c['en']} · {CREDIT}",
            grammar=c["grammar"], activities=len(spreads), exercises=len(spreads),
            sections=sections, groups=groups, quiz=quiz, quizHi=quiz_hi,
            status=("reference" if c["id"] in REFERENCE_IDS else "assessed"))
        lines.append(f"  CHAPTER_PACKS[{js(c['id'])}] = {emit(pack)};")

    # catalogue: update existing 2026-27 rows, append new + reference rows
    updates = []
    newrows = []
    for c in chapters:
        row = dict(id=c["id"], cls=c["cls"], subject=c["subject"], title=c["en"],
                   hi=c["hi"], source=c["source"], color=c["color"],
                   status=("reference" if c["id"] in REFERENCE_IDS else "syllabus-2026-27"))
        if c["id"] in EXISTING_X or c["id"] in EXISTING_IX:
            updates.append(row)
        else:
            newrows.append(row)
    updates.extend(CURATED_UPDATES)
    lines.append("  const UPD = " + emit(updates) + ";")
    lines.append("  UPD.forEach(u => { const r = CATALOGUE.find(x => x.id === u.id); if (r) Object.assign(r, u); });")
    lines.append("  CATALOGUE.push.apply(CATALOGUE, " + emit(newrows) + ");")
    lines.append("  STUDENT_CHAPTERS.length = 0;")
    lines.append("  STUDENT_CHAPTERS.push.apply(STUDENT_CHAPTERS, " + emit(STUDENT_ORDER) + ");")
    lines.append("  window.EV_SYLLABUS = " + emit(dict(
        session="2026-27", credit=CREDIT, assessed=STUDENT_ORDER,
        reference=sorted(REFERENCE_IDS),
        packs={c["id"]: len(c["topics"]) for c in chapters},
        total_spreads=sum(len(c["topics"]) for c in chapters))) + ";")
    lines.append("})();")
    out = ROOT / "src" / "chapters_generated.js"
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")

    # ---- coverage ledger --------------------------------------------------
    total = sum(len(c["topics"]) for c in chapters)
    assessed = sum(1 for c in chapters for t in c["topics"] if t["status"] == "assessed")
    formative = sum(1 for c in chapters for t in c["topics"] if t["status"] == "formative")
    archive = sum(1 for c in chapters for t in c["topics"] if t["status"] == "archive")
    md = [
        "# CBSE 2026-27 Science · complete topic & subtopic coverage ledger",
        "",
        f"**{CREDIT}** · EduVerse offline 3D textbook",
        "",
        "| | |", "|---|---|",
        "| Session | 2026-27 (Class IX NCERT *Exploration*, April 2026 edition) |",
        "| Class IX | 13 chapters — including Chapter 1 *Exploration: Entering the World of Secondary Science*, which is introductory and not in the 80-mark unit table |",
        "| Class X | 13 assessed chapters · subject code 086 · 80 marks theory + 20 internal |",
        "| Student chapters | 26 (all live, one 3D spread per topic/subtopic) |",
        "| Reference packs | 3 (formative-only / outside syllabus, clearly labelled, Tools shelf only) |",
        f"| Generated packs | {len(chapters)} |",
        f"| Generated spreads | {total} authored + 26 curated (Ch4 Carbon 16 + Ch9 Light 10) |",
        f"| Topic status | assessed {assessed} · formative-only {formative} · archive {archive} |",
        "| Compiler | `python3 tools/build_chapters.py` → `src/chapters_generated.js` |",
        "| Validator | `node qa/syllabus_smoke.js` asserts one section per topic, bilingual parity, model + challenge reachability |",
        "",
        "## Source reconciliation (why this list is not the old 15-chapter list)",
        "",
        "- Class IX 2026-27 uses the new NCERT **Exploration** textbook: 13 chapters including an introductory Chapter 1. The older *Science: Textbook for Class IX* sequence (Matter in Our Surroundings, Gravitation, Why Do We Fall Ill, Improvement in Food Resources, …) is **not** the current assessed sequence; those catalogue rows are retained in the Tools shelf as legacy, never as student chapters.",
        "- Class X 2026-27 has 13 chapters. Ch 8 is **Heredity** (Evolution retained for formative assessment only), Ch 9 **Light – Reflection and Refraction**, Ch 10 **The Human Eye and the Colourful World**.",
        "- CBSE does **not** publish a separate 'deleted syllabus' list for 2026-27. The Note for Teachers names Periodic Classification of Elements, Evolution, and Electric Motor / Electromagnetic Induction / Electric Generator as topics **not assessed in the year-end examination** but still used for class work and portfolio. They are built here with status `formative`, never dropped silently.",
        "- Mirror/lens formula derivations, the logarithmic definition of pH, the sunrise/sunset colour explanation and NCERT boxed information are excluded from board assessment; the corresponding spreads are labelled `formative` where they occur.",
        "- Sources of Energy and Sustainable Management of Natural Resources are outside the 2026-27 syllabus. They are retained as `archive` reference packs in the Tools shelf so nothing is skipped without a label.",
        "- Secondary sources consulted: CBSE curriculum 2026-27 coverage, NCERT *Exploration* Grade 9 chapter list, NCERT Science X chapter PDFs (`jesc104.pdf`, `jesc109.pdf`, `jesc110.pdf`), myCBSEguide new-book topic table, Extramarks 2026-27 syllabus, Shiksha 2027 syllabus, LearnCBSE / SuperTutor notes on the Note for Teachers. Where secondary sources conflicted (12 vs 13 IX chapters, 'deleted' vs 'formative'), the more inclusive reading was used and the status recorded here.",
        "",
        "## Chapter-by-chapter ledger",
        "",
    ]
    for c in chapters:
        tag = "REFERENCE" if c["id"] in REFERENCE_IDS else ("STUDENT" if c["id"] in STUDENT_ORDER else "TOOLS")
        md += [f"### {c['cls']} · {c['en']} (`{c['id']}`) — {len(c['topics'])} spreads · {tag}", "",
               f"*{c['hi']}* · {c['source']} · figure grammar `{c['grammar']}` · formula `{c['formula'][1]}`", "",
               "| § | Topic / subtopic (EN) | हिंदी | status |", "|---|---|---|---|"]
        for t in c["topics"]:
            md.append(f"| {t['sec']} | {t['en']} | {t['hi']} | {t['status']} |")
        md.append("")
    md += ["## Curated deep chapters (already hand-built, preserved)", "",
           "| Chapter | Spreads |", "|---|---|",
           "| Class X Ch 4 Carbon and its Compounds (`c10_carbon`) | 16 spreads, 16 carbon 3D blocks, 20-item bilingual quiz, 5 monoliths |",
           "| Class X Ch 9 Light – Reflection and Refraction (`c10_light`) | 10 spreads, 7 optics 3D blocks, 12-item bilingual quiz, precision ray SVG |",
           "", "## Credit", "",
           f"**{CREDIT}** — application code, curriculum compiler, visual engine and documentation.",
           "NCERT textbook content, chapter titles and syllabus belong to NCERT / CBSE. EduVerse is an independent, unofficial visual study aid; see `CREDITS.md` and `THIRD_PARTY.md`.", ""]
    (ROOT / "SYLLABUS_2026_27.md").write_text("\n".join(md), encoding="utf-8")

    coverage = dict(session="2026-27", credit=CREDIT, student_chapters=STUDENT_ORDER,
                    reference=sorted(REFERENCE_IDS),
                    chapters={c["id"]: dict(cls=c["cls"], title=c["en"], source=c["source"],
                                            sections=[dict(id=t["sec"], en=t["en"], hi=t["hi"],
                                                           status=t["status"]) for t in c["topics"]])
                              for c in chapters},
                    totals=dict(packs=len(chapters), spreads=total, assessed=assessed,
                                formative=formative, archive=archive))
    (ROOT / "authoring" / "coverage.json").write_text(json.dumps(coverage, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"PACKS {len(chapters)}  SPREADS {total}  STUDENT {len(STUDENT_ORDER)}  "
          f"assessed {assessed} / formative {formative} / archive {archive}")
    print(f"JS {out.stat().st_size} bytes · SYLLABUS_2026_27.md · authoring/coverage.json")


if __name__ == "__main__":
    main()
