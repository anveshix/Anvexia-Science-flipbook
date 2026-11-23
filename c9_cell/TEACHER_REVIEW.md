# Class IX Cell — realistic 2D pilot review

**State:** AI-generated drafts only; not integrated into the working app. 13 images are available for 11 topics, including two supplements; a separate staging copy previews the Cell drafts. All scientific, bilingual, visual and accessibility approvals are **PENDING**. Do not mark any image as a real photomicrograph or as teacher-approved.

**Actual image dimensions:** 1408 × 768 pixels each. They have not been generated or verified as 4K/8K. `REVIEW.html` is a self-contained offline review gallery; click an image to enlarge it. Its bilingual headings are topic titles, **not** anchored scientific labels. `manifest.json` contains file identities, non-verbatim prompt summaries and review issues.

## Four review passes for every topic

- [ ] **Subject:** independently verify the visible structures, scale caveats, relationships, depicted process and full topic coverage against a suitable authoritative reference.
- [ ] **Bilingual language:** check each English/Hindi label and caption with a subject/language reviewer.
- [ ] **Visual:** manually define and verify each label's position and leader line against the generated image; confirm no overlap, clipping, or ambiguous pointers, including full-screen zoom and projection.
- [ ] **Machine/UI:** after real integration, test 2D/3D transitions, scene interaction, original text page, offline file access, missing-asset fallback, CSP, keyboard/focus and existing regression gates.

## Topic checklist

| Section | Topic | Draft | Specific check |
|---|---|---|---|
| [ ] 2.1 | Discovery | Generated; unreviewed | Verify historical microscope design and cork cell-wall depiction. |
| [ ] 2.2 | Plant and animal cells | Generated; unreviewed | Verify wall, membrane, vacuole and organelles; don't infer invisible structures. |
| [ ] 2.3 | Prokaryotic and eukaryotic cells | Generated; unreviewed | Verify nucleoid versus nucleus, envelopes and conceptual scale. |
| [ ] 2.4 | Plasma membrane | Generated; unreviewed | Verify orientation of bilayer and identification of each protein. |
| [ ] 2.5 | Cell wall and vacuoles | Generated; unreviewed | Verify cell wall, membrane, vacuole and tonoplast. |
| [ ] 2.6 | Nucleus and chromosomes | Generated; unreviewed | Verify interphase chromatin, pores and nucleolus; chromosome topic may need an additional visual. |
| [ ] 2.7 | Mitochondria and chloroplast | Generated; unreviewed | Verify double membranes, cristae and thylakoids. |
| [ ] 2.8 | ER, Golgi and lysosomes | Generated; unreviewed | Verify which structures are actually identifiable; provide missing detail if necessary. |
| [ ] 2.9 | Mitosis and meiosis | Generated; **coverage unverified** | Mitosis and meiosis drafts exist; verify both and full topic coverage. |
| [ ] 2.10 | Biomolecules and functions | Generated; **coverage unverified** | A biomolecules supplement is available; check coverage and accuracy of all required classes. |
| [ ] 2.11 | Advances, division and cancer | Generated | Verify the conceptual tissue illustration and avoid visual diagnosis claims. |

Do not reuse label anchor coordinates from the old vector plates: the new images have different layouts. Three tools-shelf fallback chapters in the larger inventory contain generic placeholder titles and require actual subject specifications before their images can be designed.

## Offline integration engineering note

A Chromium `file://` test confirmed that a relative local JPEG can be displayed directly by an HTML `<img>`, but drawing it to a canvas and exporting the canvas raises a tainted-canvas `SecurityError`. Consequently, simply substituting these files into the existing WebGL page texture/lightbox export is not a safe offline implementation. A DOM image layer or another separately tested offline architecture is needed; it must be aligned to the existing right-page presentation and must not intercept live 3D controls. A standalone review gallery is **not** that integration.

Per the standing review protocol, do not promote the pilot or proceed to the next chapter until the 11 topics and the four review passes are completed and the teacher team signs off. The earlier vector pilot remains a separate unapproved candidate.
