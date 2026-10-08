/* ═══════════════════════════════════════════════════════
   A WORLD OF CHANGE — TEST QUESTION BANKS (same ids + text as the review)
   Source (word for word, answers checked against each key):
     A World of Change - Vocabulary Test.docx     → VOCAB_BANK  V01–V34
     A World of Change - Comprehension Test.docx  → COMP_BANK   P01–P20
     A World of Change - CLOZE Test.docx          → CLOZE_BANK  C01–C34
   answer = index into choices (choices are shuffled at run time).
   Comprehension: page = the story page the question is about
   (the story panel opens to it). P11–P20 are Part A / Part B pairs.
   The dashboard reads this file too (REVIEW_FILES in the teacher
   dashboard) to show answer choices — keep ids stable.
═══════════════════════════════════════════════════════ */

/* Part II: the sentence, with the word underlined, then the question */
function awocInContext(sentence, word) {
  const underlined = sentence.replace(new RegExp('\\b' + word + '\\b', 'i'), m => `<u>${m}</u>`);
  return `${underlined}<br>What does <b>${word}</b> mean in this sentence?`;
}

window.VOCAB_BANK = [
  /* ── PART I: DEFINITIONS ──────────────────────────── */
  { id:"V01", q:"Which word means “to make something less tight”?", choices:["alter","loosen","prevent","collapse"], answer:1 },
  { id:"V02", q:"Which word means “to change something”?", choices:["alter","collapse","prevent","evacuate"], answer:0 },
  { id:"V03", q:"Which word means “to stop something from happening”?", choices:["alter","collapse","prevent","loosen"], answer:2 },
  { id:"V04", q:"Which word means “the top or outside part of something”?", choices:["landform","structure","process","surface"], answer:3 },
  { id:"V05", q:"Which word means “made by nature, not by people”?", choices:["constant","severe","unfortunate","natural"], answer:3 },
  { id:"V06", q:"Which word means “damage so bad that something is ruined”?", choices:["pressure","destruction","effect","landform"], answer:1 },
  { id:"V07", q:"Which word means “a strong push on something”?", choices:["pressure","process","effect","crisis"], answer:0 },
  { id:"V08", q:"Which word means “something that can hurt you”?", choices:["hazard","process","contrast","potential"], answer:0 },
  { id:"V09", q:"Which word means “going on all the time without stopping”?", choices:["natural","gradual","constant","severe"], answer:2 },
  { id:"V10", q:"Which word means “when rain, snow, sun, and wind break rocks into smaller pieces”?", choices:["weathering","erosion","deposition","eruption"], answer:0 },
  { id:"V11", q:"Which word means “to fall down or cave in”?", choices:["alter","loosen","evacuate","collapse"], answer:3 },
  { id:"V12", q:"Which word means “when rocks and dirt slide down a hill or mountain”?", choices:["landslide","eruption","erosion","deposition"], answer:0 },
  { id:"V13", q:"Which word means “a dangerous time when people must act fast”?", choices:["contrast","crisis","process","potential"], answer:1 },
  { id:"V14", q:"Which word means “very fast”?", choices:["gradual","swift","constant","severe"], answer:1 },
  { id:"V15", q:"Which word means “when broken pieces of rock are carried away by water, wind, or ice”?", choices:["weathering","deposition","erosion","landslide"], answer:2 },
  { id:"V16", q:"Which word means “happening slowly over a long time”?", choices:["swift","constant","substantial","gradual"], answer:3 },
  { id:"V17", q:"Which word means “when dirt and rocks are dropped in a new place”?", choices:["erosion","weathering","deposition","pressure"], answer:2 },

  /* ── PART II: WORD USAGE ──────────────────────────── */
  { id:"V18", q:awocInContext("Families had to evacuate before the flood reached their street.", "evacuate"), choices:["to stop something from happening","to change something","to fall down or cave in","to leave a dangerous place and go somewhere safe"], answer:3 },
  { id:"V19", q:awocInContext("The science fair is the biggest event of the year.", "event"), choices:["something that can hurt you","a strong push on something","a difference between two things","something that happens"], answer:3 },
  { id:"V20", q:awocInContext("He stayed home from school with a severe headache.", "severe"), choices:["happening slowly over a long time","made by nature, not by people","very bad or very serious","not able to be known before it happens"], answer:2 },
  { id:"V21", q:awocInContext("The storm dropped a substantial amount of snow on the city.", "substantial"), choices:["big in size or amount","happening slowly over a long time","unlucky or sad","very fast"], answer:0 },
  { id:"V22", q:awocInContext("The ending of the movie was unpredictable.", "unpredictable"), choices:["happening slowly over a long time","big in size or amount","unlucky or sad","not able to be known before it happens"], answer:3 },
  { id:"V23", q:awocInContext("Building a house is a process that takes many months.", "process"), choices:["a set of steps that make something happen","a dangerous time when people must act fast","something that can hurt you","the chance that something could happen"], answer:0 },
  { id:"V24", q:awocInContext("The oil spill was a disaster for the fish and birds.", "disaster"), choices:["something people build, like a wall","something that happens and causes great harm","the chance that something could happen","a shape on Earth’s surface"], answer:1 },
  { id:"V25", q:awocInContext("The hikers stopped to look at a landform called a canyon.", "landform"), choices:["a strong push on something","damage so bad that something is ruined","a shape on Earth’s surface","a set of steps that make something happen"], answer:2 },
  { id:"V26", q:awocInContext("Ash filled the sky during the eruption.", "eruption"), choices:["when rocks and dirt slide down a hill or mountain","when dirt and rocks are dropped in a new place","when a volcano bursts open and hot rock and ash come out","when rain, snow, sun, and wind break rocks into smaller pieces"], answer:2 },
  { id:"V27", q:awocInContext("The loud siren was a warning to stay inside.", "warning"), choices:["the people who live in the same area","a message that tells you danger is coming","a set of steps that make something happen","damage so bad that something is ruined"], answer:1 },
  { id:"V28", q:awocInContext("The workers built a tall structure next to the school.", "structure"), choices:["a shape on Earth’s surface","the top or outside part of something","something that can hurt you","something people build"], answer:3 },
  { id:"V29", q:awocInContext("It was unfortunate that the rain ruined our field trip.", "unfortunate"), choices:["unlucky or sad","very fast","big in size or amount","going on all the time without stopping"], answer:0 },
  { id:"V30", q:awocInContext("Although it was cold, we played outside.", "although"), choices:["because","until","even though","instead of"], answer:2 },
  { id:"V31", q:awocInContext("The medicine had a good effect on her cough.", "effect"), choices:["what happens because of something else","a set of steps that make something happen","a strong push on something","a difference between two things"], answer:0 },
  { id:"V32", q:awocInContext("Our community held a parade on Main Street.", "community"), choices:["something people build, like a wall","the people who live in the same area","a message that tells you danger is coming","a shape on Earth’s surface"], answer:1 },
  { id:"V33", q:awocInContext("This puppy has the potential to become a great helper dog.", "potential"), choices:["a difference between two things","the chance that something could happen","something that can hurt you","what happens because of something else"], answer:1 },
  { id:"V34", q:awocInContext("There is a big contrast between the desert and the rain forest.", "contrast"), choices:["a set of steps that make something happen","a dangerous time when people must act fast","a strong push on something","a difference between two things"], answer:3 },
];

window.COMP_BANK = [
  /* ── PART I: STORY DETAILS ────────────────────────── */
  { id:"P01", page:3, q:"According to the text, what do natural changes do to Earth? (page 3)", choices:["They make Earth a rock that never changes.","They alter the surface of Earth.","They happen only one time each year.","They stop rivers from flowing."], answer:1 },
  { id:"P02", page:3, q:"Which three natural processes change the surface of the world very slowly? (page 3)", choices:["weathering, erosion, and deposition","eruptions, landslides, and floods","rain, snow, and wind","rivers, beaches, and sand dunes"], answer:0 },
  { id:"P03", page:3, q:"What breaks down rocks into smaller pieces during weathering? (page 3)", choices:["rivers and oceans","magma and ash","rain, snow, sun, and wind","plants and heavy rocks"], answer:2 },
  { id:"P04", page:3, q:"What carved the Grand Canyon over thousands of years? (page 3)", choices:["a volcanic eruption","a large landslide","ocean waves","the Colorado River"], answer:3 },
  { id:"P05", page:3, q:"What can deposition by wind create? (page 3)", choices:["a beach","a sand dune","a canyon","a volcano"], answer:1 },
  { id:"P06", page:4, q:"How do plants help protect the shore from beach erosion? (page 4)", choices:["Their leaves block the ocean waves.","They soak up all of the ocean water.","Their roots help hold the soil.","They keep people away from the beach."], answer:2 },
  { id:"P07", page:4, q:"Why are fast natural processes often called natural disasters? (page 4)", choices:["because they happen every day","because they can’t be seen","because they take many years","because of the destruction they cause"], answer:3 },
  { id:"P08", page:4, q:"What is magma? (page 4)", choices:["hot melted rock","tiny pieces of rock that turn into soil","dirt and rocks dropped in a new location","ocean waves that hit the shore"], answer:0 },
  { id:"P09", page:5, q:"What loosens the rocks and dirt that slide down in a landslide? (page 5)", choices:["heavy rains","strong winds","ocean waves","hot magma"], answer:0 },
  { id:"P10", page:5, q:"Why is it important for communities to have an emergency plan in place? (page 5)", choices:["so that they can stop a volcano from erupting","so that they can be evacuated quickly","so that they can build a new beach","so that they can carve a canyon"], answer:1 },

  /* ── PART II: INFERENCES, CONCLUSIONS, AND EVIDENCE (A/B pairs) ── */
  { id:"P11", page:3, q:"Part A: What can the reader conclude about erosion from the Grand Canyon? (page 3)", choices:["Erosion happens in just a few minutes.","Erosion only happens where there is no water.","Erosion can change the land a great deal over a long time.","Erosion builds landforms up instead of wearing them down."], answer:2 },
  { id:"P12", page:3, q:"Part B: Which sentence from page 3 best supports the answer to Part A?", choices:["“This process is called deposition.”","“Deposition by water can build up a beach.”","“It was carved over thousands of years by the Colorado River.”","“Natural changes take place every day.”"], answer:2 },
  { id:"P13", page:4, q:"Part A: What can the reader infer about erosion that happens near where people live? (page 4)", choices:["It can put people and their towns in danger.","It is too slow to cause any problems.","It only happens far away from people.","It helps people build new homes."], answer:0 },
  { id:"P14", page:4, q:"Part B: Which sentence from page 4 best supports the answer to Part A?", choices:["“Volcanoes form around openings in Earth’s crust.”","“It flows up through the volcano and out through the opening.”","“Volcanic eruptions and landslides are just two examples.”","“They can be seen as a hazard to communities.”"], answer:3 },
  { id:"P15", page:4, q:"Part A: How are fast natural processes different from slow natural processes? (page 4)", choices:["Fast processes do not change the surface of Earth.","Fast processes are stronger and cause more damage.","Fast processes are easier for people to stop.","Fast processes happen one grain of sand at a time."], answer:1 },
  { id:"P16", page:4, q:"Part B: Which sentence from page 4 best supports the answer to Part A?", choices:["“Volcanoes form around openings in Earth’s crust.”","“Others grow plants along the shore.”","“They may also use heavy rocks to keep the land from eroding.”","“But fast processes are much more powerful.”"], answer:3 },
  { id:"P17", page:5, q:"Part A: What can the reader conclude about landslides? (page 5)", choices:["Every landslide causes the same amount of damage.","Landslides only happen near volcanoes.","Some landslides are much more dangerous than others.","Landslides always give people a warning first."], answer:2 },
  { id:"P18", page:5, q:"Part B: Which sentence from page 5 best supports the answer to Part A?", choices:["“Others can be quite large and cause severe damage.”","“These processes can be gradual or swift.”","“They help to make Earth the amazing planet that it is!”","“The surface of Earth constantly changes through natural processes.”"], answer:0 },
  { id:"P19", page:5, q:"Part A: Why do communities still need an emergency plan even though scientists try to predict natural disasters? (page 5)", choices:["Scientists do not study natural disasters.","Emergency plans can stop a disaster from happening.","Natural disasters only happen slowly.","Scientists cannot always tell when a disaster is coming."], answer:3 },
  { id:"P20", page:5, q:"Part B: Which sentence from page 5 best supports the answer to Part A?", choices:["“Some landslides are small.”","“Still, some disasters are unpredictable and strike without warning.”","“They help to make Earth the amazing planet that it is!”","“They occur when rocks and dirt, loosened by heavy rains, slide down a hill or mountain.”"], answer:1 },
];

/* Part A → Part B pairs: asked back to back, Part A first */
window.COMP_PAIRS = [['P11','P12'], ['P13','P14'], ['P15','P16'], ['P17','P18'], ['P19','P20']];

window.CLOZE_BANK = [
  { id:"C01", q:"The __________ melting of the snow took the whole month of March.", choices:["unfortunate","severe","gradual"], answer:2 },
  { id:"C02", q:"Years of __________ from wind and rain wore the letters off the old stone wall.", choices:["eruption","weathering","deposition"], answer:1 },
  { id:"C03", q:"After the storm, a __________ sent rocks and mud sliding onto the road.", choices:["landslide","structure","community"], answer:0 },
  { id:"C04", q:"The __________ deer ran across the field in just a few seconds.", choices:["gradual","unfortunate","swift"], answer:2 },
  { id:"C05", q:"__________ she was tired, Maria finished all of her homework.", choices:["Potential","Although","Gradual"], answer:1 },
  { id:"C06", q:"An island is a __________ that has water on every side.", choices:["hazard","landform","process"], answer:1 },
  { id:"C07", q:"The cave is a __________ shelter that was not built by people.", choices:["natural","swift","constant"], answer:0 },
  { id:"C08", q:"The police told everyone to __________ the beach before the hurricane arrived.", choices:["alter","evacuate","prevent"], answer:1 },
  { id:"C09", q:"A broken step is a __________ because someone could trip and get hurt.", choices:["process","hazard","landform"], answer:1 },
  { id:"C10", q:"The baby’s __________ crying did not stop for even one minute.", choices:["gradual","natural","constant"], answer:2 },
  { id:"C11", q:"The __________ cold froze the pipes and closed every school in the city.", choices:["gradual","unfortunate","severe"], answer:2 },
  { id:"C12", q:"It was __________ that our team lost the game by only one point.", choices:["unfortunate","gradual","constant"], answer:0 },
  { id:"C13", q:"The bright red door was a sharp __________ to the plain white house.", choices:["contrast","crisis","effect"], answer:0 },
  { id:"C14", q:"Heavy rain caused __________ that carried the soil away from the hillside.", choices:["deposition","erosion","pressure"], answer:1 },
  { id:"C15", q:"Brushing your teeth every day helps __________ cavities.", choices:["alter","prevent","collapse"], answer:1 },
  { id:"C16", q:"The fire caused so much __________ that the barn had to be torn down.", choices:["destruction","potential","contrast"], answer:0 },
  { id:"C17", q:"A thin layer of ice covered the __________ of the pond.", choices:["surface","event","community"], answer:0 },
  { id:"C18", q:"The spelling bee was the most exciting __________ of the school year.", choices:["hazard","event","surface"], answer:1 },
  { id:"C19", q:"My cat is so __________ that I never know what she will do next.", choices:["unpredictable","gradual","substantial"], answer:0 },
  { id:"C20", q:"Lava poured down the side of the mountain after the __________.", choices:["weathering","eruption","contrast"], answer:1 },
  { id:"C21", q:"Mom will __________ the recipe by adding more cheese.", choices:["alter","collapse","evacuate"], answer:0 },
  { id:"C22", q:"Our __________ planted a garden that all the neighbors share.", choices:["structure","community","surface"], answer:1 },
  { id:"C23", q:"The bridge is the tallest __________ in our town.", choices:["surface","warning","structure"], answer:2 },
  { id:"C24", q:"Grandpa ate a __________ breakfast of eggs, toast, fruit, and pancakes.", choices:["substantial","gradual","unpredictable"], answer:0 },
  { id:"C25", q:"Staying up too late had a bad __________ on my spelling test.", choices:["hazard","landform","effect"], answer:2 },
  { id:"C26", q:"The river slowed down, and __________ left a pile of sand where the water stopped.", choices:["erosion","destruction","deposition"], answer:2 },
  { id:"C27", q:"The sand castle began to __________ when the big wave hit it.", choices:["collapse","prevent","evacuate"], answer:0 },
  { id:"C28", q:"The young singer has the __________ to become a star someday.", choices:["contrast","effect","potential"], answer:2 },
  { id:"C29", q:"He had to __________ his belt after eating a big dinner.", choices:["prevent","loosen","evacuate"], answer:1 },
  { id:"C30", q:"The earthquake was a __________ that left thousands of people without homes.", choices:["process","landform","disaster"], answer:2 },
  { id:"C31", q:"When the town ran out of drinking water, the mayor called it a __________ and asked for help right away.", choices:["crisis","process","landform"], answer:0 },
  { id:"C32", q:"Making maple syrup is a long __________ with many steps.", choices:["crisis","contrast","process"], answer:2 },
  { id:"C33", q:"The flashing red light was a __________ that a train was coming.", choices:["community","structure","warning"], answer:2 },
  { id:"C34", q:"Too much __________ from the heavy books made the shelf crack.", choices:["pressure","erosion","contrast"], answer:0 },
];
