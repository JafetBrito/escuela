// English translations for the Segundo Cerebro glossary (src/data/glossaryRegistry.js).
// Keyed by slug. Missing fields/slugs fall back to the Spanish source — see
// getLocalizedEntry() in ./index.js. wiki() links keep the same slug (the
// target page localizes itself), only the visible label is translated.
const w = (slug, label) => `<a class="wiki-link" href="/cerebro/${slug}" target="_blank" rel="noopener">${label}</a>`

export const en = {
  // ── History ──────────────────────────────────────────────────────────
  sumerios: {
    term: 'Sumerians',
    summary: 'The people of southern Mesopotamia who created the first known urban civilization, around 4500 BC.',
    content: `<p>The <strong>Sumerians</strong> settled in southern Mesopotamia (modern-day Iraq) between the Tigris and Euphrates rivers. It isn't known for certain where they came from or which language family Sumerian belongs to — it's a "language isolate," with no known relatives.</p><p>They founded independent city-states such as Uruk, Ur, Eridu, and Lagash, each with its own ruler and main temple. They're credited with inventing writing, the wheel, the earliest known code of laws, and the sexagesimal system we still use to measure time.</p>`,
  },
  mesopotamia: {
    term: 'Mesopotamia',
    summary: 'The region between the Tigris and Euphrates rivers ("between rivers" in Greek), cradle of several of the world\'s earliest civilizations.',
    content: `<p><strong>Mesopotamia</strong> means "land between rivers" in Greek, referring to the Tigris and the Euphrates. Its fertile soil, renewed each year by the rivers' floods, allowed for such productive agriculture that it generated food surpluses — the economic base that made the first cities possible.</p><p>Over thousands of years, the region was home to the Sumerians, Akkadians, Babylonians, and Assyrians, each building on the legacy of the one before.</p>`,
  },
  cuneiforme: {
    term: 'Cuneiform writing',
    summary: 'The earliest known writing system, invented by the Sumerians using wedge-shaped marks on wet clay tablets.',
    content: `<p><strong>Cuneiform</strong> (from the Latin <em>cuneus</em>, "wedge") was born in Uruk around 3200 BC. Scribes pressed a reed stylus into wet clay tablets, leaving wedge-shaped marks. The tablets were then sun-dried or fired, some surviving intact for over 5,000 years.</p><p>It began as a system of pictographs for keeping track of grain and livestock — accounting, not literature. Over time it evolved to represent sounds and express abstract ideas, poetry, and laws.</p>`,
  },
  uruk: {
    term: 'Uruk',
    summary: 'One of the earliest and largest Sumerian cities, birthplace of writing and legendary home of King Gilgamesh.',
    content: `<p><strong>Uruk</strong> reached, by archaeological estimates, between 40,000 and 80,000 inhabitants around 2900 BC — an unprecedented size for the time. It was surrounded by walls that tradition attributes to Gilgamesh himself.</p><p>It's where the oldest known writing tablets appear, and it gives its name to the "Uruk period," when Sumerian society moved from farming villages to true cities with government, temples, and division of labor.</p>`,
  },
  gilgamesh: {
    term: 'Gilgamesh',
    summary: 'Historical king of Uruk (around 2700 BC) turned legendary hero of the oldest surviving epic poem.',
    content: `<p><strong>Gilgamesh</strong> was, according to Sumerian king lists, a real king of Uruk around 2700 BC. Over time his figure became legend, the protagonist of the <em>Epic of Gilgamesh</em> — considered the oldest surviving narrative work of literature.</p><p>The poem tells of his friendship with Enkidu, his quest for immortality after his friend's death, and a flood story with striking parallels to the story of Noah, written centuries later.</p>`,
  },
  enheduanna: {
    term: 'Enheduanna',
    summary: 'Sumerian-Akkadian priestess (around 2285–2250 BC), the earliest author in history known by name.',
    content: `<p><strong>Enheduanna</strong> was the daughter of King Sargon of Akkad and high priestess of the moon god Nanna in the city of Ur. She wrote hymns and poems that she signed with her own name — which is why she's considered the first known author in the entire history of writing, man or woman.</p><p>Her hymns to the goddess Inanna kept being copied and studied in scribal schools for centuries after her death.</p>`,
  },
  zigurat: {
    term: 'Ziggurat',
    summary: 'A stepped, pyramid-shaped temple — the central religious building of every Sumerian city.',
    content: `<p>A <strong>ziggurat</strong> is a stepped, pyramid-shaped religious structure made of mudbrick, with a temple at the top dedicated to the city's patron god. It served as the administrative, economic, and religious center of the city-state.</p><p>The best known and best preserved is the Great Ziggurat of Ur, built around 2100 BC and still partially standing today in Iraq.</p>`,
  },
  'codigo-ur-nammu': {
    term: 'Code of Ur-Nammu',
    summary: 'The oldest known written law code, roughly 300 years older than the famous Code of Hammurabi.',
    content: `<p>The <strong>Code of Ur-Nammu</strong> was issued by the king of Ur of the same name around 2100–2050 BC — nearly three centuries before the more famous Code of Hammurabi. It's the oldest known written law code.</p><p>Unlike the "law of retaliation" (an eye for an eye) that Hammurabi would later popularize, many of its penalties were financial compensation: for example, cutting off someone's foot was paid with a fine in silver, not by mutilating the offender.</p>`,
  },
  'sistema-sexagesimal': {
    term: 'Sexagesimal system',
    summary: 'The base-60 number system invented by the Sumerians — the reason an hour has 60 minutes and a circle has 360 degrees.',
    content: `<p>The Sumerians counted in <strong>base 60</strong> (sexagesimal) instead of base 10 like us. 60 has the practical advantage of dividing evenly by 2, 3, 4, 5, 6, 10, 12, 15, 20, and 30 — far more versatile for splitting things up than 10, which only divides evenly by 2 and 5.</p><p>That system survives today in units you use every day: 60 seconds per minute, 60 minutes per hour, and 360 (60×6) degrees in a full circle.</p>`,
  },

  // ── Medicine ─────────────────────────────────────────────────────────
  imhotep: {
    term: 'Imhotep',
    summary: 'Architect, priest, and the first physician in history identified by his real name (c. 2650 BC).',
    content: `<p><strong>Imhotep</strong> lived in ancient Egypt around 2650 BC, during the reign of Pharaoh Djoser, whom he served as chancellor, architect, and priest as well as physician. He's credited with designing the Step Pyramid of Saqqara, one of the first great stone structures in history.</p><p>Centuries after his death, the Egyptians worshipped him as a deity associated with medicine and healing. He is, as far as we know, the first physician in history identified by his real name rather than by anonymous legend.</p>`,
  },
  'papiro-edwin-smith': {
    term: 'Edwin Smith Papyrus',
    summary: 'Egyptian medical text (c. 1600 BC) with 48 surgical cases described through clinical observation, almost without magic.',
    content: `<p>The <strong>Edwin Smith Papyrus</strong>, written around 1600 BC as a copy of an even older text, describes 48 real surgical cases, each with the same structure: examination, diagnosis, and treatment (or the honest acknowledgment that the case had no cure).</p><p>It's notable because, unlike most medical texts of the ancient world, it describes cases with almost pure clinical observation, without spells or religious explanations — evidence that the "observe, record, treat" method already existed 3,600 years ago. It's named after the Egyptologist who acquired it in 1862, not its original author.</p>`,
  },
  hipocrates: {
    term: 'Hippocrates',
    summary: 'Greek physician (460–370 BC) who claimed disease has natural causes, not divine ones. Origin of "first, do no harm."',
    content: `<p><strong>Hippocrates of Kos</strong> (460–370 BC) is considered the father of Western medicine. His central contribution was claiming that diseases have natural causes — imbalances in the body, climate, diet — and are not punishment from the gods.</p><p>The "Hippocratic Corpus" gathers about 60 medical texts from his school. From that tradition comes the <strong>Hippocratic Oath</strong> and the principle "Primum non nocere" (first, do no harm), still cited in medical ethics codes worldwide, 2,400 years later.</p>`,
  },
  galeno: {
    term: 'Galen',
    summary: 'The most influential physician in Western history for 1,400 years (129–216 AD), an unquestioned authority despite anatomical errors.',
    content: `<p><strong>Galen of Pergamon</strong> (129–216 AD) worked as a physician to gladiators in Rome, a unique source of practical experience with wounds and real human anatomy. His writings dominated Western medicine for more than 1,400 years.</p><p>Since dissecting human corpses was forbidden in his time, he dissected animals (pigs, monkeys) and assumed their anatomy applied to humans, getting more than 200 points wrong — for example, he described the human liver as having five lobes, like a pig's. His authority was so absolute that questioning him was considered almost intellectual heresy, until ${w('vesalio', 'Vesalius')} challenged him with real human dissections.</p>`,
  },
  avicena: {
    term: 'Avicenna (Ibn Sina)',
    summary: 'Persian physician (980–1037), author of the Canon of Medicine, a medical textbook used in Europe until the 17th century.',
    content: `<p><strong>Avicenna</strong> (Ibn Sina, 980–1037) wrote the <strong>Canon of Medicine</strong>, a medical encyclopedia so thorough and well organized that it was the main textbook in European universities until the 17th century — more than 600 years of use.</p><p>He was part of a golden age of medicine in the medieval Islamic world, which also invented the hospital as an organized institution (with wards by type of illness and patient records), centuries before most European cities.</p>`,
  },
  vesalio: {
    term: 'Andreas Vesalius',
    summary: 'Anatomist (1514–1564) who dissected real human corpses and corrected more than 200 of Galen\'s errors.',
    content: `<p><strong>Andreas Vesalius</strong> (1514–1564) took the risk of dissecting real human corpses — something viewed with suspicion by the Church of his time — instead of relying on the animal anatomy that ${w('galeno', 'Galen')} had extrapolated to humans 1,400 years earlier.</p><p>He published "De humani corporis fabrica" (1543), with anatomical illustrations so precise and detailed that they exposed more than 200 errors in Galen's anatomy. He's considered the founder of modern anatomy.</p>`,
  },
  'william-harvey': {
    term: 'William Harvey',
    summary: 'English physician (1578–1657) who mathematically demonstrated that blood circulates in a closed system pumped by the heart.',
    content: `<p><strong>William Harvey</strong> (1578–1657) overturned 1,400 years of medical belief in one stroke: he calculated how much blood the heart pumps in an hour, and the result exceeded a person's entire body weight — so the liver couldn't be constantly manufacturing new blood, as had been believed since Galen.</p><p>He published his discovery in 1628: the heart is a pump and the same blood circulates in a closed loop. He achieved this with simple math and logical reasoning, without advanced technology.</p>`,
  },
  'van-leeuwenhoek': {
    term: 'Antonie van Leeuwenhoek',
    summary: 'Dutch cloth merchant (1632–1723) with no scientific training, the first human to see bacteria through a homemade microscope.',
    content: `<p><strong>Antonie van Leeuwenhoek</strong> (1632–1723) was a cloth merchant in Holland. He taught himself to grind glass lenses with exceptional precision to examine fabric threads, and with his homemade microscopes (some with over 270x magnification) he began looking at pond water, dental plaque, and other samples.</p><p>In 1676 he saw tiny creatures moving — he called them "animalcules." He had discovered what we now call bacteria and protozoa, the first human being to see them. No one, not even him, would know for almost 200 more years that some of those creatures caused disease.</p>`,
  },
  'edward-jenner': {
    term: 'Edward Jenner',
    summary: 'English physician (1749–1823) who created the first vaccine in history, based on cowpox, in 1796.',
    content: `<p><strong>Edward Jenner</strong> (1749–1823) tested with scientific method a popular observation among farmers: milkmaids infected with (mild) cowpox almost never caught (deadly) smallpox.</p><p>In 1796 he inoculated a boy with material from cowpox and later deliberately exposed him to human smallpox — the boy didn't get sick. He called his technique "vaccination" (from "vacca," Latin for cow). Thanks to mass vaccination campaigns, smallpox was declared eradicated in 1980 — the only human disease ever completely eliminated from the planet.</p>`,
  },
  semmelweis: {
    term: 'Ignaz Semmelweis',
    summary: 'Hungarian physician (1818–1865) who cut maternal mortality tenfold with handwashing — and was ridiculed for it.',
    content: `<p><strong>Ignaz Semmelweis</strong> (1818–1865) noticed that, at Vienna General Hospital, doctors who came from performing autopsies without washing their hands to attending births had a ward with up to 10% maternal mortality, versus 1-2% in the ward attended by midwives.</p><p>He proposed washing hands with a chlorine solution before every birth — mortality immediately fell to under 1%. Even so, the medical community refused to accept it, ridiculed him, and he ended up committed to an asylum where he died at 47. Today he's considered a pioneer of hospital hygiene.</p>`,
  },
  pasteur: {
    term: 'Louis Pasteur',
    summary: 'French chemist and microbiologist (1822–1895) who refuted spontaneous generation and laid the foundations of germ theory.',
    content: `<p><strong>Louis Pasteur</strong> (1822–1895) designed "swan-neck" flasks that showed microorganisms come from the outside air, not spontaneously from matter — ending centuries of belief in spontaneous generation.</p><p>He connected what ${w('van-leeuwenhoek', 'Van Leeuwenhoek')} had seen (microorganisms) with what caused disease: he identified the germs behind chicken cholera and developed a rabies vaccine. His work gave rise to the germ theory of disease.</p>`,
  },
  koch: {
    term: 'Robert Koch',
    summary: 'German physician (1843–1910) who established the rigorous method for proving which germ causes which disease.',
    content: `<p><strong>Robert Koch</strong> (1843–1910) solved a problem ${w('pasteur', 'Pasteur')} had left open: how to rigorously prove that a specific germ causes a specific disease. He established four criteria (Koch's postulates) still used as the standard today.</p><p>With this method he identified the agents behind tuberculosis (1882) and cholera (1883), diseases that killed millions without anyone knowing exactly why.</p>`,
  },
  lister: {
    term: 'Joseph Lister',
    summary: 'English surgeon (1827–1912) who introduced antiseptics into surgery, drastically reducing postoperative infections.',
    content: `<p>Before <strong>Joseph Lister</strong> (1827–1912), surviving surgery depended largely on luck — not because of the cut itself, but because of the infections that followed, which killed up to 50% of major-surgery patients in some hospitals.</p><p>Lister applied ${w('pasteur', 'Pasteur')}'s germ theory to the operating room: he used carbolic acid to sterilize instruments, wounds, and even the operating room air. Postoperative mortality dropped dramatically, laying the foundations of modern surgery.</p>`,
  },
  'florence-nightingale': {
    term: 'Florence Nightingale',
    summary: 'British nurse (1820–1910) who used visual statistics to reform military healthcare and founded modern nursing.',
    content: `<p><strong>Florence Nightingale</strong> (1820–1910) arrived at British military hospitals during the Crimean War and found appalling hygienic conditions. Instead of just denouncing it, she meticulously collected data and presented it in visual charts (her own version of the polar area diagram).</p><p>Her charts showed that more soldiers died from preventable hospital infections than from combat wounds, convincing the British government to reform military healthcare. She founded the first nursing school based on scientific principles.</p>`,
  },
  fleming: {
    term: 'Alexander Fleming',
    summary: 'Scottish bacteriologist (1881–1955) who accidentally discovered penicillin in 1928, giving rise to antibiotics.',
    content: `<p><strong>Alexander Fleming</strong> (1881–1955) left a culture plate with bacteria unwashed before going on vacation in 1928. Upon returning, he noticed a mold (<em>Penicillium</em>) had contaminated the plate, and the bacteria near it had died.</p><p>He identified that the mold produced a substance — penicillin — capable of killing bacteria without harming human cells. Howard Florey and Ernst Chain managed to mass-produce it in the 1940s, just in time for World War II. It's estimated that penicillin and later antibiotics have saved more than 200 million lives.</p>`,
  },
  'watson-crick': {
    term: 'Watson and Crick',
    summary: 'James Watson and Francis Crick published the double-helix model of DNA in 1953.',
    content: `<p><strong>James Watson</strong> and <strong>Francis Crick</strong> published the model of DNA's structure in 1953: a double helix, two intertwined strands that explained how genetic information is copied and passed on.</p><p>Their model relied crucially on "Photo 51," an X-ray diffraction image taken by ${w('rosalind-franklin', 'Rosalind Franklin')}, seen without her explicit permission through a colleague. Watson, Crick, and Maurice Wilkins received the Nobel Prize in 1962.</p>`,
  },
  'rosalind-franklin': {
    term: 'Rosalind Franklin',
    summary: 'British scientist (1920–1958) whose "Photo 51" was key to discovering the structure of DNA, without receiving credit at the time.',
    content: `<p><strong>Rosalind Franklin</strong> (1920–1958) took, together with her student Raymond Gosling, "Photo 51" — an X-ray diffraction image that proved crucial for deducing DNA's double-helix structure.</p><p>${w('watson-crick', 'Watson and Crick')} saw the image without her explicit permission, through a colleague of hers, and used it to complete their model. Franklin received very little recognition at the time and died in 1958, before the 1962 Nobel Prize (which is not awarded posthumously). Today she's recognized as one of the scientists whose essential work was historically underrated.</p>`,
  },
  crispr: {
    term: 'CRISPR',
    summary: 'Precision gene-editing technology, adapted from a natural bacterial defense system, developed as a tool in 2012.',
    content: `<p><strong>CRISPR</strong> is a technology that allows editing specific DNA sequences with unprecedented precision — something like "cut and paste" in the genetic code. It's adapted from a defense system that certain bacteria naturally use against viruses.</p><p>Since its development as a gene-editing tool in 2012, it's being actively researched to treat inherited genetic diseases. It also raises important ethical questions: who decides which genes get edited, and who has access to this technology?</p>`,
  },

  // ── Prompt Engineering ───────────────────────────────────────────────
  'zero-shot': {
    term: 'Zero-Shot Prompting',
    summary: 'Asking the AI to do something without giving it prior examples — just the direct instruction.',
    content: `<p><strong>Zero-shot prompting</strong> is the most common type of instruction: you tell the AI what to do without showing it any example of how to do it. It works well for text comprehension tasks, general knowledge questions, and simple format transformations.</p><p>It fails more often on very specific tasks, non-standard formats, or highly specialized domains — that's where ${w('few-shot', 'few-shot prompting')} or ${w('chain-of-thought', 'Chain-of-Thought')} come in.</p>`,
  },
  'few-shot': {
    term: 'Few-Shot Prompting',
    summary: 'Including several input/output examples within the prompt so the model learns the pattern on the spot.',
    content: `<p><strong>Few-shot prompting</strong> means showing the AI a few examples of the exact pattern you want (format, tone, structure) before asking it to complete a new one. The model doesn't "train" on those examples — it uses them as immediate context to infer the pattern.</p><p>Basic rules: 3-5 examples is usually the sweet spot, they should be representative and consistent with each other, and the last examples weigh more in the model's decision (recency bias). Few-shot teaches patterns, not reasoning — that's what ${w('chain-of-thought', 'Chain-of-Thought')} is for.</p>`,
  },
  'chain-of-thought': {
    term: 'Chain-of-Thought (CoT)',
    summary: 'Technique that gets the model to reason step by step before giving the final answer, reducing errors on complex tasks.',
    content: `<p><strong>Chain-of-Thought</strong> is the technique that discovered that asking a model to "think step by step" before answering dramatically improves its accuracy on math, logic, and multi-step problems.</p><p>The original paper (Wei et al., 2022, Google) showed improvements of up to 40% on math problems with large models. There are two forms: Zero-Shot CoT (you just add the magic phrase) and Few-Shot CoT (you show examples with the reasoning already written out). Its most ambitious evolution is ${w('tree-of-thoughts', 'Tree of Thoughts')}.</p>`,
  },
  'tree-of-thoughts': {
    term: 'Tree of Thoughts (ToT)',
    summary: 'Evolution of Chain-of-Thought: the model explores several reasoning paths in parallel and picks the most promising one.',
    content: `<p><strong>Tree of Thoughts</strong> (Yao et al., 2023) breaks with the linear reasoning of ${w('chain-of-thought', 'Chain-of-Thought')}: instead of following a single reasoning path, the model generates several different approaches, evaluates them against each other, and develops the most viable one in detail.</p><p>It uses more tokens than CoT, so it's reserved for problems where several valid paths truly exist: strategic decisions, architecture design, problems without a single correct solution.</p>`,
  },
  'react-prompting': {
    term: 'ReAct (Reasoning + Acting)',
    summary: 'Framework that alternates reasoning (Thought) with concrete actions (Action) and observations (Observation) in a loop.',
    content: `<p><strong>ReAct</strong> (2022) is the framework behind most modern AI agents: the model alternates between "thinking" out loud (Thought), deciding on a concrete action (Action, like searching for information), and processing the result (Observation) — repeating the cycle until reaching a final answer.</p><p>It reduces hallucinations because the model looks up information instead of inventing it, and it's transparent: you can see the full reasoning before the answer.</p>`,
  },
  'meta-prompting': {
    term: 'Meta-Prompting',
    summary: 'Using an AI to design, analyze, or improve prompts that will be used with another AI (or the same one).',
    content: `<p><strong>Meta-prompting</strong> is recursive: instead of writing the perfect prompt yourself, you ask the AI to analyze an existing prompt and improve it, or to generate several variations of a prompt for you to pick the best one from — the formal technique behind this is called Automatic Prompt Engineer (APE).</p><p>The typical flow: you write a prompt → test it → identify what's failing → ask the AI to improve it with that feedback → test the new version. This is exactly how production AI teams optimize their systems.</p>`,
  },
  'prompt-injection': {
    term: 'Prompt Injection',
    summary: 'Attack where malicious instructions are inserted into data the AI will process, so it ignores its original instructions.',
    content: `<p><strong>Prompt injection</strong> is one of the most important security risks when building AI applications. There are two variants: <em>direct</em> (the user themself tries to override the system instructions) and <em>indirect</em> (an attacker hides instructions inside external data — a document, an email, a web page — that the AI is going to process).</p><p>Main defenses: clearly separate instructions from data, give the AI minimal privileges, and validate any action before executing it — never just trust the prompt to "behave."</p>`,
  },
  'temperatura-llm': {
    term: 'Temperature (AI parameter)',
    summary: 'Parameter that controls how predictable or random a language model\'s response is.',
    content: `<p><strong>Temperature</strong> is the most important parameter for controlling a language model's behavior via API. At temperature 0.0 the response is practically deterministic (ideal for code or data extraction); at high temperature (0.8-1.0) responses are more varied and creative, useful for brainstorming or creative writing.</p><p>In normal chat interfaces (ChatGPT, Claude.ai) you don't control it directly — it only matters when you're working with the model's API.</p>`,
  },
  rctfs: {
    term: 'RCTFS Framework',
    summary: '5-element structure for effective prompts: Role, Context, Task, Format, Stop conditions (restrictions).',
    content: `<p><strong>RCTFS</strong> is a mnemonic framework for not forgetting the key elements of a well-built prompt: <strong>R</strong>ole (who the AI is for this task), <strong>C</strong>ontext (necessary background), <strong>T</strong>ask (specific, actionable instruction), <strong>F</strong>ormat (how you want the answer), and <strong>S</strong>top — restrictions on what to avoid.</p><p>You don't always need all 5 elements: for simple tasks, Task + Format is usually enough. For complex or creative tasks, include them all.</p>`,
  },
  'llm-as-judge': {
    term: 'LLM-as-Judge',
    summary: 'Using a language model to evaluate and score the quality of another model\'s (or its own) response.',
    content: `<p><strong>LLM-as-Judge</strong> is an evaluation technique: instead of a person manually grading hundreds of AI responses, you ask another model (or the same one) to score each response against explicit criteria — completeness, accuracy, format, conciseness — with a brief justification.</p><p>It's the basis for how tools like LangSmith or Weights & Biases automate the evaluation of production AI systems, though for learning, manually evaluating with a criteria framework is still very valuable.</p>`,
  },

  // ── Ethics ───────────────────────────────────────────────────────────
  consecuencialismo: {
    term: 'Consequentialism',
    summary: 'Ethical view that judges whether an action is right based on its consequences — its most famous form is utilitarianism.',
    content: `<p><strong>Consequentialism</strong> holds that an action is morally right if its consequences are good, regardless of intention or whether it follows a fixed rule. Its most influential version, <strong>utilitarianism</strong> (Jeremy Bentham, John Stuart Mill), proposes maximizing the total well-being of everyone affected.</p><p>Its most-cited criticism: it can justify actions most people consider wrong if the net result is "better" — which leads to the opposite view, ${w('deontologia-kant', "Kant's deontology")}.</p>`,
  },
  'deontologia-kant': {
    term: 'Deontology (Kant)',
    summary: 'Immanuel Kant\'s ethical view: certain actions are right or wrong in themselves, regardless of the outcome.',
    content: `<p>Immanuel Kant's (1724–1804) <strong>deontology</strong> holds that what's right is defined by duties and rules, not by consequences. His central test, the <strong>categorical imperative</strong>, asks whether you could want everyone to follow the same rule you're about to follow.</p><p>Another key formulation: always treat people as ends in themselves, never merely as means to your own purposes.</p>`,
  },
  'aristoteles-etica': {
    term: 'Aristotle and virtue ethics',
    summary: 'A view that asks what kind of person you want to be, rather than what rule to follow or what outcome to produce.',
    content: `<p><strong>Aristotle</strong> (384–322 BC) proposed that ethics isn't about calculating outcomes or following rules, but about cultivating character. Each virtue (courage, generosity, honesty) is a middle ground between a vice of deficiency and one of excess — courage, for example, between cowardice and recklessness.</p><p>For Aristotle, virtue is learned by practicing it repeatedly, like a craft, not by memorizing definitions.</p>`,
  },

  // ── Women Who Changed the World ──────────────────────────────────────
  'ada-lovelace': {
    term: 'Ada Lovelace',
    summary: 'English mathematician (1815–1852), author of the first published algorithm intended to be run by a machine.',
    content: `<p><strong>Ada Lovelace</strong> (1815–1852), daughter of the poet Lord Byron, worked with Charles Babbage on his "Analytical Engine" — a mechanical computer design never built in her time. In her notes on the machine, Lovelace wrote what's now considered the first published algorithm explicitly intended to be run by a machine.</p><p>She also anticipated, more than a century before real computers existed, that such machines could be used for music and art, not just numerical calculations — a remarkably ahead-of-its-time vision.</p>`,
  },
  'marie-curie': {
    term: 'Marie Curie',
    summary: 'Polish-French physicist and chemist (1867–1934), the first person to win two Nobel Prizes in different sciences.',
    content: `<p><strong>Marie Curie</strong> (1867–1934) discovered, together with her husband Pierre, the elements polonium and radium, and developed the concept of <strong>radioactivity</strong> — a term she herself coined. She was the first woman to win a Nobel Prize (Physics, 1903) and the first person, man or woman, to win a second Nobel Prize in a different science (Chemistry, 1911).</p><p>During World War I she developed mobile X-ray units for field hospitals. She died from prolonged radiation exposure — her own work ended up costing her her life.</p>`,
  },
  'hedy-lamarr': {
    term: 'Hedy Lamarr',
    summary: 'Austrian-American actress and inventor (1914–2000), co-inventor of a radio technology that preceded Wi-Fi and Bluetooth.',
    content: `<p><strong>Hedy Lamarr</strong> (1914–2000) was a Hollywood actress in cinema's golden age, but also a self-taught inventor. During World War II, she co-developed with composer George Antheil a "frequency-hopping" system to keep radio-guided torpedoes from being jammed by the enemy.</p><p>The technology wasn't used militarily at the time, but decades later it became the conceptual basis for modern wireless technologies like Wi-Fi, GPS, and Bluetooth.</p>`,
  },
  'malala-yousafzai': {
    term: 'Malala Yousafzai',
    summary: 'Pakistani activist (born 1997) for girls\' education, the youngest person ever to receive a Nobel Prize.',
    content: `<p><strong>Malala Yousafzai</strong> began writing publicly about life under Taliban rule in Pakistan, defending girls' right to education, while still a teenager. In 2012, at age 15, she survived being shot in the head by a Taliban gunman in retaliation for her activism.</p><p>She recovered and continued her work internationally. In 2014, at age 17, she became the youngest person ever to receive a Nobel Prize (Peace), and founded the Malala Fund for girls' education worldwide.</p>`,
  },
  'frida-kahlo': {
    term: 'Frida Kahlo',
    summary: 'Mexican painter (1907–1954) whose deeply personal work made her an icon of art and Latin American identity.',
    content: `<p><strong>Frida Kahlo</strong> (1907–1954) survived polio in childhood and a severe traffic accident in her youth, which caused her lifelong chronic pain. Much of her work — deeply autobiographical and symbolic — grew out of processing that physical and emotional pain, as well as her Mexican and indigenous identity.</p><p>Though she had less recognition in her lifetime than her husband, muralist Diego Rivera, she's today one of the most recognized and influential painters of the 20th century worldwide.</p>`,
  },
  'rigoberta-menchu': {
    term: 'Rigoberta Menchú',
    summary: 'Guatemalan indigenous activist (born 1959) for the rights of native peoples, 1992 Nobel Peace Prize winner.',
    content: `<p><strong>Rigoberta Menchú</strong> is a Maya K'iche' activist who internationally denounced human rights violations against indigenous peoples during Guatemala's civil war, a conflict in which she lost several family members.</p><p>In 1992 she received the Nobel Peace Prize for her work toward ethnic-cultural reconciliation and indigenous peoples' rights, becoming one of the most internationally recognized indigenous voices.</p>`,
  },
  'wangari-maathai': {
    term: 'Wangari Maathai',
    summary: 'Kenyan environmentalist and activist (1940–2011), founder of the Green Belt Movement, the first African woman to win a Nobel Peace Prize.',
    content: `<p><strong>Wangari Maathai</strong> was the first woman from Central and East Africa to earn a doctorate. In 1977 she founded the <strong>Green Belt Movement</strong>, which has driven the planting of tens of millions of trees in Kenya, employing rural women and fighting deforestation and soil erosion.</p><p>In 2004 she became the first African woman to receive the Nobel Peace Prize, recognizing the link between environmental protection, democracy, and women's rights.</p>`,
  },
}
