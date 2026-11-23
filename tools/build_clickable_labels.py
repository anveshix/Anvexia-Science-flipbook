#!/usr/bin/env python3
"""Build review-pending bilingual label metadata for the complete draft set.
Older baked labels use renderer coordinates; newer visible overlay chips use
manually authored subject anchors. Neither method establishes scientific approval.
"""
from pathlib import Path
import hashlib
import json
from extra_label_info import EXTRA
from remaining_label_info import EXTRA as REMAINING_EXTRA
from additional_label_info import EXTRA as ADDITIONAL_EXTRA
from matter_atom_label_info import EXTRA as MATTER_ATOM_EXTRA
from class10_reproduction_label_info import EXTRA as REPRO10_EXTRA
from foundations_sound_label_info import EXTRA as FOUNDATIONS_SOUND_EXTRA
from carbon_first_label_info import EXTRA as CARBON_FIRST_EXTRA
from carbon_second_label_info import EXTRA as CARBON_SECOND_EXTRA
from atom_last_label_info import EXTRA as ATOM_LAST_EXTRA
from periodic_label_info import EXTRA as PERIODIC_EXTRA
from light_mirror_label_info import EXTRA as LIGHT_MIRROR_EXTRA
from light_refraction_label_info import EXTRA as LIGHT_REFRACTION_EXTRA
from eye_label_info import EXTRA as EYE_EXTRA
from electricity_label_info import EXTRA as ELECTRICITY_EXTRA
from magnetism_label_info import EXTRA as MAGNETISM_EXTRA
from placeholder_label_info import EXTRA as PLACEHOLDER_EXTRA
R=Path('/home/user'); T=R/'eduverse_2d_staging/tools'
info={
'Shoot':('The above-ground plant axis bears leaves and often grows toward light.','प्ररोह पौधे का ऊपर का भाग है; इसमें पत्तियाँ होती हैं और यह अक्सर प्रकाश की ओर बढ़ता है।'),
'Root':('Roots anchor the plant and absorb water and mineral nutrients.','जड़ें पौधे को थामती हैं और जल व खनिज पोषक तत्व ग्रहण करती हैं।'),
'Cell body':('The cell body contains the nucleus and integrates incoming signals.','कोशिका काय में केन्द्रक होता है और यह आने वाले संकेतों का समन्वय करता है।'),
'Axon':('An axon carries electrical signals away from the neuron cell body.','अक्षतंतु न्यूरॉन के कोशिका काय से विद्युत संकेत आगे ले जाता है।'),
'Hand':('Skin receptors can detect harmful heat and start a withdrawal reflex; do not touch hot objects.','त्वचा के ग्राही हानिकारक गर्मी पहचानकर वापसी प्रतिवर्त शुरू कर सकते हैं; गर्म वस्तु न छुएँ।'),
'Cerebrum':('The cerebrum supports thought, sensory interpretation and voluntary action.','प्रमस्तिष्क सोच, संवेदना की व्याख्या और ऐच्छिक क्रियाओं में सहायक है।'),
'Cerebellum':('The cerebellum helps coordinate movements, posture and balance.','अनुमस्तिष्क गति, मुद्रा और संतुलन के समन्वय में मदद करता है।'),
'Walking':('Walking involves voluntary control as well as coordinated automatic movement patterns.','चलने में ऐच्छिक नियंत्रण के साथ समन्वित स्वतः गति प्रतिरूप भी शामिल होते हैं।'),
'Thyroid model':('The thyroid gland produces hormones that help regulate metabolism; model anatomy is unverified.','थायरॉइड ग्रंथि उपापचय नियंत्रित करने वाले हार्मोन बनाती है; मॉडल की शारीरिक रचना असत्यापित है।'),
'Pancreas model':('The pancreas makes insulin, which helps regulate blood glucose; model anatomy is unverified.','अग्न्याशय इंसुलिन बनाता है जो रक्त ग्लूकोज़ नियंत्रित करने में मदद करता है; मॉडल असत्यापित है।'),
'Leaves':('Leaves capture light; many also exchange gases through stomata.','पत्तियाँ प्रकाश ग्रहण करती हैं; कई पत्तियाँ रंध्रों से गैसों का आदान-प्रदान भी करती हैं।'),
'Roots':('Roots anchor plants and absorb water and dissolved minerals.','जड़ें पौधे को थामती हैं तथा जल और घुले खनिज अवशोषित करती हैं।'),
'Leaf surface':('The leaf surface protects the leaf; stomata regulate gas exchange and water loss.','पत्ती की सतह रक्षा करती है; रंध्र गैस विनिमय और जल हानि नियंत्रित करते हैं।'),
'Mushroom-like forms':('Many fungi release digestive substances outside their bodies and absorb nutrients; identity here is unverified.','कई कवक शरीर के बाहर पाचक पदार्थ छोड़कर पोषक तत्व सोखते हैं; यहाँ पहचान असत्यापित है।'),
'Log':('Dead wood can provide organic matter for decomposers; decomposition is not demonstrated here.','मृत लकड़ी अपघटकों को कार्बनिक पदार्थ दे सकती है; यहाँ अपघटन दिखाया नहीं गया है।'),
'Stomach model':('The stomach churns food and begins protein digestion; this is an unverified model.','आमाशय भोजन मथता है और प्रोटीन पाचन शुरू करता है; यह असत्यापित मॉडल है।'),
'Intestines model':('Most digestion and nutrient absorption occur in the small intestine; anatomy needs review.','अधिकांश पाचन और पोषक अवशोषण छोटी आँत में होते हैं; रचना की समीक्षा शेष है।'),
'Mitochondrion model':('Mitochondria carry out major stages of aerobic respiration; the model is not a micrograph.','सूत्रकणिका वायवीय श्वसन के प्रमुख चरण करती है; मॉडल सूक्ष्मचित्र नहीं है।'),
'Trachea model':('The trachea carries air toward the bronchi; the model is anatomically unverified.','श्वासनली वायु को श्वसनी की ओर ले जाती है; मॉडल असत्यापित है।'),
'Lung model':('Lungs contain alveoli where gases exchange with blood; alveoli are not resolved here.','फेफड़ों में वायुकोष्ठिकाएँ होती हैं जहाँ रक्त से गैस विनिमय होता है; वे यहाँ नहीं दिखतीं।'),
'Diaphragm model':('The diaphragm contracts and flattens during inhalation; the AI model needs review.','श्वास लेने पर मध्यपट संकुचित होकर चपटा होता है; एआई मॉडल की समीक्षा शेष है।'),
'Heart model':('The heart pumps blood; internal chambers and flow are not visible in this unverified model.','हृदय रक्त पंप करता है; असत्यापित मॉडल में भीतरी कक्ष और प्रवाह नहीं दिखते।'),
'Large vessels':('Blood vessels carry blood between the heart, lungs and body; this model is unverified.','रक्त वाहिकाएँ हृदय, फेफड़ों और शरीर के बीच रक्त ले जाती हैं; मॉडल असत्यापित है।'),
'Kidney model':('Kidneys filter blood and help form urine; nephrons are not visible in this model.','वृक्क रक्त छानकर मूत्र बनाने में मदद करते हैं; इस मॉडल में नेफ्रॉन नहीं दिखते।'),
'Bladder model':('The urinary bladder stores urine before it leaves the body; model anatomy needs review.','मूत्राशय शरीर से बाहर निकलने तक मूत्र जमा करता है; मॉडल की समीक्षा शेष है।'),
'DNA model':('DNA carries genetic information; this AI model is illustrative and its pairing is unverified.','DNA आनुवंशिक सूचना रखता है; यह एआई मॉडल सांकेतिक है और युग्मन असत्यापित है।'),
'Shorter plant':('Plant height can vary; this generated plant has no verified genotype.','पौधों की ऊँचाई बदल सकती है; इस निर्मित पौधे का जीनप्ररूप सत्यापित नहीं है।'),
'Taller plant':('Plant height can vary; this generated plant has no verified genotype.','पौधों की ऊँचाई बदल सकती है; इस निर्मित पौधे का जीनप्ररूप सत्यापित नहीं है।'),
'Shorter':('Height alone does not reveal a plant’s genotype; this scene is illustrative.','केवल ऊँचाई से पौधे का जीनप्ररूप नहीं पता चलता; दृश्य सांकेतिक है।'),
'Taller':('Height alone does not reveal a plant’s genotype; this scene is illustrative.','केवल ऊँचाई से पौधे का जीनप्ररूप नहीं पता चलता; दृश्य सांकेतिक है।'),
'Pea-like plants':('In a simple Tt × Tt cross, the expected tall-to-dwarf ratio is 3:1; these plants are not observed offspring.','सरल Tt × Tt संकरण में लंबे और बौने का अपेक्षित अनुपात 3:1 है; ये पौधे प्रेक्षित संतति नहीं हैं।'),
'Seed-like samples':('Mendel studied pea seed traits; the AI samples have no verified genotypes.','मेंडेल ने मटर के बीज लक्षणों का अध्ययन किया; एआई नमूनों के जीनप्ररूप असत्यापित हैं।'),
'Chromosome-shaped models':('Chromosomes contain DNA and proteins; these are conceptual models, not real chromosomes.','गुणसूत्रों में DNA और प्रोटीन होते हैं; ये असली गुणसूत्र नहीं, सांकेतिक मॉडल हैं।'),
'Fossil-like model':('Fossils can provide evidence of past life; this AI object is not a verified fossil.','जीवाश्म पिछले जीवन का प्रमाण दे सकते हैं; यह एआई वस्तु सत्यापित जीवाश्म नहीं है।'),
'Pond water':('Water is a non-living ecosystem component and provides habitat for aquatic organisms.','जल पारितंत्र का निर्जीव घटक है और जलीय जीवों को आवास देता है।'),
'Plants':('Plants are producers in many ecosystems, using light to build organic substances.','कई पारितंत्रों में पौधे उत्पादक हैं और प्रकाश से कार्बनिक पदार्थ बनाते हैं।'),
'Grasshopper-like insect':('A grasshopper can be a primary consumer that feeds on plants; this animal is unverified.','टिड्डा पौधे खाने वाला प्राथमिक उपभोक्ता हो सकता है; यहाँ जीव असत्यापित है।'),
'Frog-like animal':('A frog may feed on insects; this AI scene does not establish a feeding relationship.','मेंढक कीट खा सकता है; यह एआई दृश्य आहार संबंध सिद्ध नहीं करता।'),
'Meadow':('A meadow can support producers and consumers; energy transfer is not measured in this scene.','घास का मैदान उत्पादकों और उपभोक्ताओं का आवास हो सकता है; ऊर्जा प्रवाह यहाँ मापा नहीं गया है।'),
'Small fish':('Some pollutants can accumulate in organisms; contamination is not established by this image.','कुछ प्रदूषक जीवों में जमा हो सकते हैं; इस चित्र से संदूषण सिद्ध नहीं होता।'),
'Larger fish':('Some persistent pollutants biomagnify through food webs; this image shows no measured concentration.','कुछ स्थायी प्रदूषकों का आहार जाल में जैव आवर्धन होता है; यहाँ कोई सांद्रता नहीं मापी गई।'),
'Earth horizon':('Stratospheric ozone absorbs much UV-B radiation; ozone is not visible in this AI scene.','समतापमंडलीय ओज़ोन बहुत सा UV-B सोखती है; इस एआई दृश्य में ओज़ोन दिखाई नहीं देती।'),
'Food scraps':('Appropriate food waste can biodegrade or be composted under suitable conditions.','उपयुक्त दशाओं में उचित खाद्य अवशेष जैव-अपघटित हो सकते हैं या उनकी खाद बन सकती है।'),
'Containers':('Separate waste according to local rules; not every container is recyclable.','अपशिष्ट स्थानीय नियमों के अनुसार अलग करें; हर पात्र पुनर्चक्रण योग्य नहीं होता।'),
'Reusable bins':('Reusing suitable containers can reduce waste; local hygiene and collection rules matter.','उपयुक्त पात्र दोबारा उपयोग करने से अपशिष्ट घट सकता है; स्थानीय स्वच्छता व संग्रह नियम महत्त्वपूर्ण हैं।'),
}
info.update(EXTRA)
info.update(REMAINING_EXTRA)
info.update(ADDITIONAL_EXTRA)
info.update(MATTER_ATOM_EXTRA)
info.update(REPRO10_EXTRA)
info.update(FOUNDATIONS_SOUND_EXTRA)
info.update(CARBON_FIRST_EXTRA)
info.update(CARBON_SECOND_EXTRA)
info.update(ATOM_LAST_EXTRA)
info.update(PERIODIC_EXTRA)
info.update(LIGHT_MIRROR_EXTRA)
info.update(LIGHT_REFRACTION_EXTRA)
info.update(EYE_EXTRA)
info.update(ELECTRICITY_EXTRA)
info.update(MAGNETISM_EXTRA)
info.update(PLACEHOLDER_EXTRA)
result={};used=set()
for filename in ('control_batch.json','life_data.json','heredity_env_data.json','earth_reactions_data.json','reactions_acids_data.json','acids_metals_data.json','remaining_batch.json','diversity_earth_labels.json','exploration_batch.json','repro_sound_labels.json','matter_atom_batch.json','sound103_107_labels.json','class10_reproduction_batch.json','foundations_sound_labels.json','carbon_first_batch.json','carbon_second_batch.json','atom_last_labels.json','periodic_batch.json','light_mirror_batch.json','light_refraction_batch.json','eye_batch.json','electricity_batch.json','magnetism_batch.json','placeholders_batch.json'):
 for item in json.loads((T/filename).read_text()):
  labels=[]
  for raw,x,y,w,dx,dy,*measured_h in item['labels']:
   en,hi=map(str.strip,raw.split(' / ',1)); assert en in info,(item['file'],en); used.add(en)
   entry={'en':en,'hi':hi,'x':x,'y':y,'w':w,'h':measured_h[0] if measured_h else 52,'info_en':info[en][0],'info_hi':info[en][1]}
   for field in ('font_size','line_height','pad_y','pad_x'):
    if field in item:entry[field]=item[field]
   labels.append(entry)
  result[item['world']+'/'+item['file']]=labels
assert len(result)==198
# Separately authored overlay chips and visually inspected anchors for Cell
# models without baked-in labels. These remain unreviewed teaching drafts.
cell_overlays=json.loads((R/'metaworld/tools/cell_overlay_labels.json').read_text())
assert not (set(result) & set(cell_overlays))
result.update(cell_overlays)
assert len(result)==201
# Manually inspected labels are pinned to exact image bytes: changing a JPEG
# requires inspecting and deliberately updating its anchor/hash metadata.
extra=json.loads((R/'metaworld/tools/remaining_overlay_labels.json').read_text())
hashes=json.loads((R/'metaworld/tools/remaining_overlay_image_hashes.json').read_text())
assert set(extra)==set(hashes) and not (set(result)&set(extra))
for key,h in hashes.items():
 assert hashlib.sha256((R/'metaworld/assets/2d'/key).read_bytes()).hexdigest()==h,key
result.update(extra)
assert len(result)==274
out=R/'metaworld/src/label_data.json';out.write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n');print('image metadata',len(result),'labels',sum(map(len,result.values())),'definitions',len(used))
