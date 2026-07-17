// Traduzioni italiane del glossario Segundo Cerebro (src/data/glossaryRegistry.js).
// Indicizzato per slug. Campi/slug mancanti -> ripiego sulla fonte spagnola,
// vedi getLocalizedEntry() in ./index.js.
const w = (slug, label) => `<a class="wiki-link" href="/cerebro/${slug}" target="_blank" rel="noopener">${label}</a>`

export const it = {
  // ── Storia ───────────────────────────────────────────────────────────
  sumerios: {
    term: 'Sumeri',
    summary: 'Il popolo della Mesopotamia meridionale che creò la prima civiltà urbana conosciuta, intorno al 4500 a.C.',
    content: `<p>I <strong>Sumeri</strong> si stabilirono nella Mesopotamia meridionale (l'odierno Iraq) tra i fiumi Tigri ed Eufrate. Non si sa con certezza da dove provenissero né a quale famiglia linguistica appartenesse la loro lingua — il sumero è una "lingua isolata", senza parenti conosciuti.</p><p>Fondarono città-stato indipendenti come Uruk, Ur, Eridu e Lagash, ciascuna con il proprio sovrano e tempio principale. Sono loro attribuite l'invenzione della scrittura, della ruota, del primo codice di leggi conosciuto e del sistema sessagesimale che usiamo ancora oggi per misurare il tempo.</p>`,
  },
  mesopotamia: {
    term: 'Mesopotamia',
    summary: 'La regione tra i fiumi Tigri ed Eufrate ("tra i fiumi" in greco), culla di diverse tra le prime civiltà del mondo.',
    content: `<p><strong>Mesopotamia</strong> significa "terra tra i fiumi" in greco, riferendosi al Tigri e all'Eufrate. Il suo suolo fertile, rinnovato ogni anno dalle piene dei fiumi, permise un'agricoltura così produttiva da generare eccedenze alimentari — la base economica che rese possibili le prime città.</p><p>Nel corso di migliaia di anni, la regione fu casa di Sumeri, Accadi, Babilonesi e Assiri, ciascuno costruendo sull'eredità del precedente.</p>`,
  },
  cuneiforme: {
    term: 'Scrittura cuneiforme',
    summary: 'Il primo sistema di scrittura conosciuto, inventato dai Sumeri usando segni a forma di cuneo su tavolette di argilla umida.',
    content: `<p>La <strong>scrittura cuneiforme</strong> ("cuneiforme" viene dal latino <em>cuneus</em>, "cuneo") nacque a Uruk intorno al 3200 a.C. Gli scribi premevano uno stilo di canna su tavolette di argilla umida, lasciando segni a forma di cuneo. Le tavolette venivano poi essiccate al sole o cotte, alcune sopravvivendo intatte per oltre 5000 anni.</p><p>Iniziò come sistema di pittogrammi per tenere i conti di grano e bestiame — contabilità, non letteratura. Col tempo si evolse fino a poter rappresentare suoni ed esprimere idee astratte, poesia e leggi.</p>`,
  },
  uruk: {
    term: 'Uruk',
    summary: 'Una delle prime e più grandi città sumere, culla della scrittura e casa leggendaria del re Gilgameš.',
    content: `<p><strong>Uruk</strong> arrivò ad avere, secondo stime archeologiche, tra i 40.000 e gli 80.000 abitanti intorno al 2900 a.C. — una dimensione senza precedenti per l'epoca. Era circondata da mura che la tradizione attribuisce allo stesso Gilgameš.</p><p>È il luogo dove compaiono le più antiche tavolette di scrittura conosciute, e dà il nome al "periodo di Uruk", in cui la società sumera passò da villaggi agricoli a vere città con governo, templi e specializzazione del lavoro.</p>`,
  },
  gilgamesh: {
    term: 'Gilgameš',
    summary: 'Re storico di Uruk (intorno al 2700 a.C.) diventato eroe leggendario del più antico poema epico conservato.',
    content: `<p><strong>Gilgameš</strong> fu, secondo le liste reali sumere, un vero re di Uruk intorno al 2700 a.C. Col tempo la sua figura si trasformò in leggenda, protagonista dell'<em>Epopea di Gilgameš</em> — considerata la più antica opera letteraria narrativa conservata.</p><p>Il poema narra la sua amicizia con Enkidu, la sua ricerca dell'immortalità dopo la morte dell'amico, e un racconto di un diluvio universale che presenta notevoli parallelismi con quello di Noè, scritto secoli dopo.</p>`,
  },
  enheduanna: {
    term: 'Enheduanna',
    summary: 'Sacerdotessa sumero-accadica (circa 2285-2250 a.C.), la prima autrice della storia conosciuta con il proprio nome.',
    content: `<p><strong>Enheduanna</strong> fu figlia del re Sargon di Accad e somma sacerdotessa del dio lunare Nanna nella città di Ur. Scrisse inni e poemi che firmò con il proprio nome — per questo è considerata la prima persona autrice conosciuta in tutta la storia della scrittura, uomo o donna.</p><p>I suoi inni alla dea Inanna continuarono a essere copiati e studiati nelle scuole di scribi per secoli dopo la sua morte.</p>`,
  },
  zigurat: {
    term: 'Zigurat',
    summary: 'Tempio a gradoni a forma di piramide tronca, l\'edificio religioso centrale di ogni città sumera.',
    content: `<p>Uno <strong>zigurat</strong> è una struttura religiosa a forma di piramide a gradoni, fatta di mattoni di fango, con un tempio in cima dedicato al dio patrono della città. Funzionava come centro amministrativo, economico e religioso della città-stato.</p><p>Il più noto e meglio conservato è lo Zigurat di Ur, costruito intorno al 2100 a.C. e ancora oggi parzialmente in piedi in Iraq.</p>`,
  },
  'codigo-ur-nammu': {
    term: 'Codice di Ur-Nammu',
    summary: 'Il più antico codice di leggi scritto conosciuto, circa 300 anni precedente al famoso Codice di Hammurabi.',
    content: `<p>Il <strong>Codice di Ur-Nammu</strong> fu promulgato dal re di Ur omonimo intorno al 2100-2050 a.C. — quasi tre secoli prima del più famoso Codice di Hammurabi. È il più antico codice di leggi scritto conosciuto.</p><p>A differenza della "legge del taglione" (occhio per occhio) che Hammurabi avrebbe poi reso popolare, molte delle sue pene erano compensazioni economiche: ad esempio, tagliare il piede a un'altra persona si pagava con una multa in argento, non con la mutilazione dell'aggressore.</p>`,
  },
  'sistema-sexagesimal': {
    term: 'Sistema sessagesimale',
    summary: 'Il sistema numerico in base 60 inventato dai Sumeri — il motivo per cui un\'ora ha 60 minuti e un cerchio 360 gradi.',
    content: `<p>I Sumeri contavano in <strong>base 60</strong> (sessagesimale) invece che in base 10 come noi. Il 60 ha il vantaggio pratico di dividersi esattamente per 2, 3, 4, 5, 6, 10, 12, 15, 20 e 30 — molto più versatile per ripartire le cose rispetto al 10, che si divide esattamente solo per 2 e 5.</p><p>Quel sistema sopravvive ancora oggi nelle unità che usi tutti i giorni: 60 secondi per minuto, 60 minuti per ora, e 360 (60×6) gradi in un cerchio completo.</p>`,
  },

  // ── Medicina ─────────────────────────────────────────────────────────
  imhotep: {
    term: 'Imhotep',
    summary: 'Architetto, sacerdote e primo medico della storia identificato con il suo vero nome (c. 2650 a.C.).',
    content: `<p><strong>Imhotep</strong> visse nell'antico Egitto intorno al 2650 a.C., durante il regno del faraone Zoser, al quale servì come cancelliere, architetto e sacerdote oltre che medico. Gli viene attribuito il progetto della piramide a gradoni di Saqqara, una delle prime grandi strutture in pietra della storia.</p><p>Secoli dopo la sua morte, gli egizi lo venerarono come divinità associata alla medicina e alla guarigione. È, per quanto ne sappiamo, il primo medico della storia identificato con il suo vero nome e non con una leggenda anonima.</p>`,
  },
  'papiro-edwin-smith': {
    term: 'Papiro di Edwin Smith',
    summary: 'Testo medico egizio (c. 1600 a.C.) con 48 casi chirurgici descritti con osservazione clinica, quasi senza magia.',
    content: `<p>Il <strong>Papiro di Edwin Smith</strong>, scritto intorno al 1600 a.C. come copia di un testo ancora più antico, descrive 48 casi chirurgici reali, ciascuno con la stessa struttura: esame, diagnosi e trattamento (o l'onesto riconoscimento che il caso non aveva cura).</p><p>È notevole perché, a differenza della maggior parte dei testi medici del mondo antico, descrive i casi con osservazione clinica quasi pura, senza incantesimi né spiegazioni religiose — prova che il metodo "osservare, registrare, trattare" esisteva già 3600 anni fa. Prende il nome dall'egittologo che lo acquistò nel 1862, non dal suo autore originale.</p>`,
  },
  hipocrates: {
    term: 'Ippocrate',
    summary: 'Medico greco (460-370 a.C.) che affermò che la malattia ha cause naturali, non divine. Origine del "primo, non nuocere".',
    content: `<p><strong>Ippocrate di Coo</strong> (460-370 a.C.) è considerato il padre della medicina occidentale. Il suo contributo centrale fu affermare che le malattie hanno cause naturali — squilibri del corpo, del clima, della dieta — e non sono un castigo divino.</p><p>Il "Corpus Ippocratico" raccoglie circa 60 testi medici della sua scuola. Da quella tradizione nasce il <strong>Giuramento di Ippocrate</strong> e il principio "Primum non nocere" (prima di tutto, non nuocere), ancora citato nei codici di etica medica di tutto il mondo, 2400 anni dopo.</p>`,
  },
  galeno: {
    term: 'Galeno',
    summary: 'Medico più influente della storia occidentale per 1400 anni (129-216 d.C.), autorità indiscussa nonostante errori anatomici.',
    content: `<p><strong>Galeno di Pergamo</strong> (129-216 d.C.) lavorò come medico dei gladiatori a Roma, fonte unica di esperienza pratica con ferite e anatomia umana reale. I suoi scritti dominarono la medicina occidentale per oltre 1400 anni.</p><p>Poiché la dissezione di cadaveri umani era proibita alla sua epoca, dissezionò animali (maiali, scimmie) e presunse che la loro anatomia si applicasse agli umani, sbagliandosi in oltre 200 punti — descrisse ad esempio il fegato umano con cinque lobi, come quello di un maiale. La sua autorità era così assoluta che metterla in dubbio era considerato quasi un'eresia intellettuale, finché ${w('vesalio', 'Vesalio')} lo sfidò con vere dissezioni umane.</p>`,
  },
  avicena: {
    term: 'Avicenna (Ibn Sina)',
    summary: 'Medico persiano (980-1037), autore del Canone della Medicina, testo medico usato in Europa fino al XVII secolo.',
    content: `<p><strong>Avicenna</strong> (Ibn Sina, 980-1037) scrisse il <strong>Canone della Medicina</strong>, un'enciclopedia medica così completa e organizzata da essere il principale testo nelle università europee fino al XVII secolo — oltre 600 anni di validità.</p><p>Fece parte di un'epoca d'oro della medicina nel mondo islamico medievale, che inventò anche l'ospedale come istituzione organizzata (con reparti per tipo di malattia e registri dei pazienti), secoli prima della maggior parte delle città europee.</p>`,
  },
  vesalio: {
    term: 'Andrea Vesalio',
    summary: 'Anatomista (1514-1564) che dissezionò cadaveri umani reali e corresse oltre 200 errori di Galeno.',
    content: `<p><strong>Andrea Vesalio</strong> (1514-1564) si arrischiò a dissezionare cadaveri umani reali — visto con sospetto dalla Chiesa della sua epoca — invece di affidarsi all'anatomia animale che ${w('galeno', 'Galeno')} aveva esteso agli umani 1400 anni prima.</p><p>Pubblicò "De humani corporis fabrica" (1543), con illustrazioni anatomiche così precise e dettagliate da dimostrare oltre 200 errori nell'anatomia descritta da Galeno. È considerato il fondatore dell'anatomia moderna.</p>`,
  },
  'william-harvey': {
    term: 'William Harvey',
    summary: 'Medico inglese (1578-1657) che dimostrò matematicamente che il sangue circola in un sistema chiuso pompato dal cuore.',
    content: `<p><strong>William Harvey</strong> (1578-1657) confutò con un colpo solo 1400 anni di credenza medica: calcolò quanto sangue pompa il cuore in un'ora, e il risultato superava il peso corporeo totale di una persona — quindi il fegato non poteva fabbricare costantemente sangue nuovo, come si credeva sin da Galeno.</p><p>Pubblicò la sua scoperta nel 1628: il cuore è una pompa e lo stesso sangue circola in un circuito chiuso. Ci riuscì con matematica semplice e ragionamento logico, senza tecnologia avanzata.</p>`,
  },
  'van-leeuwenhoek': {
    term: 'Antonie van Leeuwenhoek',
    summary: 'Commerciante di tessuti olandese (1632-1723) senza formazione scientifica, primo essere umano a vedere batteri con un microscopio casalingo.',
    content: `<p><strong>Antonie van Leeuwenhoek</strong> (1632-1723) era commerciante di tessuti in Olanda. Imparò a levigare lenti di vetro con precisione eccezionale per esaminare fili, e con i suoi microscopi casalinghi (alcuni con oltre 270 ingrandimenti) iniziò a osservare acqua di stagno, placca dentale e altri campioni.</p><p>Nel 1676 vide minuscoli esseri muoversi — li chiamò "animalcoli". Aveva scoperto ciò che oggi chiamiamo batteri e protozoi, il primo essere umano a vederli. Nessuno, nemmeno lui, avrebbe saputo per quasi 200 anni ancora che alcuni di quegli esseri causavano malattie.</p>`,
  },
  'edward-jenner': {
    term: 'Edward Jenner',
    summary: 'Medico inglese (1749-1823) che creò il primo vaccino della storia, basato sul vaiolo bovino, nel 1796.',
    content: `<p><strong>Edward Jenner</strong> (1749-1823) verificò con metodo scientifico un'osservazione popolare tra i contadini: le mungitrici contagiate dal vaiolo bovino (lieve) quasi mai si ammalavano di vaiolo umano (mortale).</p><p>Nel 1796 inoculò a un bambino materiale di vaiolo bovino e poi lo espose deliberatamente al vaiolo umano — il bambino non si ammalò. Chiamò la sua tecnica "vaccinazione" (da "vacca", mucca in latino). Grazie a campagne di vaccinazione di massa, il vaiolo fu dichiarato eradicato nel 1980 — l'unica malattia umana eliminata completamente dal pianeta.</p>`,
  },
  semmelweis: {
    term: 'Ignaz Semmelweis',
    summary: 'Medico ungherese (1818-1865) che ridusse la mortalità materna di 10 volte lavandosi le mani — e fu ridicolizzato per questo.',
    content: `<p><strong>Ignaz Semmelweis</strong> (1818-1865) notò che, nell'Ospedale Generale di Vienna, i medici che arrivavano da autopsie senza lavarsi le mani prima di assistere ai parti avevano un reparto con fino al 10% di mortalità materna, contro l'1-2% nel reparto assistito dalle ostetriche.</p><p>Propose di lavarsi le mani con una soluzione di cloro prima di ogni parto — la mortalità crollò subito a meno dell'1%. Ciononostante, la comunità medica si rifiutò di accettarlo, lo ridicolizzò, e finì internato in un manicomio dove morì a 47 anni. Oggi è considerato un pioniere dell'igiene ospedaliera.</p>`,
  },
  pasteur: {
    term: 'Louis Pasteur',
    summary: 'Chimico e microbiologo francese (1822-1895) che confutò la generazione spontanea e pose le basi della teoria dei germi.',
    content: `<p><strong>Louis Pasteur</strong> (1822-1895) progettò palloni "a collo di cigno" che dimostrarono che i microrganismi provengono dall'aria esterna e non sorgono spontaneamente dalla materia — ponendo fine a secoli di credenza nella generazione spontanea.</p><p>Collegò ciò che ${w('van-leeuwenhoek', 'Van Leeuwenhoek')} aveva visto (i microrganismi) con ciò che causava le malattie: identificò i germi responsabili del colera dei polli e sviluppò un vaccino contro la rabbia. Il suo lavoro diede origine alla teoria dei germi.</p>`,
  },
  koch: {
    term: 'Robert Koch',
    summary: 'Medico tedesco (1843-1910) che stabilì il metodo rigoroso per provare quale germe causa quale malattia.',
    content: `<p><strong>Robert Koch</strong> (1843-1910) risolse un problema che ${w('pasteur', 'Pasteur')} aveva lasciato aperto: come provare rigorosamente che un germe specifico causa una malattia specifica. Stabilì quattro criteri (i "postulati di Koch") usati come standard ancora oggi.</p><p>Con questo metodo identificò gli agenti responsabili della tubercolosi (1882) e del colera (1883), malattie che uccidevano milioni di persone senza che nessuno sapesse esattamente perché.</p>`,
  },
  lister: {
    term: 'Joseph Lister',
    summary: 'Chirurgo inglese (1827-1912) che introdusse gli antisettici in chirurgia, riducendo drasticamente le infezioni postoperatorie.',
    content: `<p>Prima di <strong>Joseph Lister</strong> (1827-1912), sopravvivere a un intervento chirurgico dipendeva in buona parte dalla fortuna — non per il taglio in sé, ma per le infezioni successive, che uccidevano fino al 50% dei pazienti di chirurgia maggiore in alcuni ospedali.</p><p>Lister applicò la teoria dei germi di ${w('pasteur', 'Pasteur')} alla sala operatoria: usò acido fenico per sterilizzare strumenti, ferite e persino l'aria della sala operatoria. La mortalità postoperatoria crollò drasticamente, ponendo le basi della chirurgia moderna.</p>`,
  },
  'florence-nightingale': {
    term: 'Florence Nightingale',
    summary: 'Infermiera britannica (1820-1910) che usò statistiche visive per riformare la sanità militare e fondò l\'infermieristica moderna.',
    content: `<p><strong>Florence Nightingale</strong> (1820-1910) arrivò negli ospedali militari britannici durante la Guerra di Crimea e trovò condizioni igieniche spaventose. Invece di limitarsi a denunciarlo, raccolse dati meticolosamente e li presentò in grafici visivi (una sua versione del diagramma ad area polare).</p><p>I suoi grafici dimostrarono che più soldati morivano per infezioni ospedaliere evitabili che per ferite di combattimento, convincendo il governo britannico a riformare la sanità militare. Fondò la prima scuola infermieristica basata su principi scientifici.</p>`,
  },
  fleming: {
    term: 'Alexander Fleming',
    summary: 'Batteriologo scozzese (1881-1955) che scoprì la penicillina per caso nel 1928, dando origine agli antibiotici.',
    content: `<p><strong>Alexander Fleming</strong> (1881-1955) lasciò una piastra di coltura con batteri senza lavarla prima di andare in vacanza nel 1928. Al ritorno, notò che una muffa (<em>Penicillium</em>) aveva contaminato la piastra, e i batteri vicini ad essa erano morti.</p><p>Identificò che la muffa produceva una sostanza — la penicillina — capace di uccidere i batteri senza danneggiare le cellule umane. Howard Florey ed Ernst Chain riuscirono a produrla in massa negli anni '40, giusto in tempo per la Seconda Guerra Mondiale. Si stima che la penicillina e gli antibiotici successivi abbiano salvato oltre 200 milioni di vite.</p>`,
  },
  'watson-crick': {
    term: 'Watson e Crick',
    summary: 'James Watson e Francis Crick pubblicarono nel 1953 il modello della doppia elica del DNA.',
    content: `<p><strong>James Watson</strong> e <strong>Francis Crick</strong> pubblicarono nel 1953 il modello della struttura del DNA: una doppia elica, due catene intrecciate che spiegava come l'informazione genetica si copia e si trasmette.</p><p>Il loro modello si basò in modo cruciale sulla "Fotografia 51", un'immagine di diffrazione a raggi X scattata da ${w('rosalind-franklin', 'Rosalind Franklin')}, vista senza il suo permesso esplicito tramite un collega. Watson, Crick e Maurice Wilkins ricevettero il premio Nobel nel 1962.</p>`,
  },
  'rosalind-franklin': {
    term: 'Rosalind Franklin',
    summary: 'Scienziata britannica (1920-1958) la cui "Fotografia 51" fu chiave per scoprire la struttura del DNA, senza riceverne il merito all\'epoca.',
    content: `<p><strong>Rosalind Franklin</strong> (1920-1958) scattò, insieme al suo studente Raymond Gosling, la "Fotografia 51" — un'immagine di diffrazione a raggi X che risultò cruciale per dedurre la struttura a doppia elica del DNA.</p><p>${w('watson-crick', 'Watson e Crick')} videro l'immagine senza il suo permesso esplicito, tramite un suo collega, e la usarono per completare il loro modello. Franklin ricevette pochissimo riconoscimento all'epoca e morì nel 1958, prima del premio Nobel del 1962 (che non viene assegnato postumo). Oggi è riconosciuta come una delle scienziate il cui lavoro essenziale fu storicamente sottovalutato.</p>`,
  },
  crispr: {
    term: 'CRISPR',
    summary: 'Tecnologia di editing genetico di precisione, adattata da un sistema di difesa batterico naturale, sviluppata come strumento nel 2012.',
    content: `<p><strong>CRISPR</strong> è una tecnologia che permette di modificare sequenze specifiche di DNA con una precisione senza precedenti — qualcosa come "taglia e incolla" nel codice genetico. È adattata da un sistema di difesa che alcuni batteri usano naturalmente contro i virus.</p><p>Dal suo sviluppo come strumento di editing genetico nel 2012, viene attivamente studiata per curare malattie genetiche ereditarie. Solleva anche importanti domande etiche: chi decide quali geni vengono modificati, e chi ha accesso a questa tecnologia?</p>`,
  },

  // ── Prompt Engineering ───────────────────────────────────────────────
  'zero-shot': {
    term: 'Zero-Shot Prompting',
    summary: 'Chiedere all\'IA di fare qualcosa senza fornirle esempi precedenti — solo l\'istruzione diretta.',
    content: `<p>Lo <strong>zero-shot prompting</strong> è il tipo di istruzione più comune: dici all'IA cosa fare senza mostrarle alcun esempio di come farlo. Funziona bene per compiti di comprensione del testo, domande di conoscenza generale e trasformazioni di formato semplici.</p><p>Fallisce più spesso in compiti molto specifici, formati poco standard o domini molto specializzati — è lì che entra in gioco il ${w('few-shot', 'few-shot prompting')} o il ${w('chain-of-thought', 'Chain-of-Thought')}.</p>`,
  },
  'few-shot': {
    term: 'Few-Shot Prompting',
    summary: 'Includere diversi esempi di input/output all\'interno del prompt affinché il modello impari il pattern al momento.',
    content: `<p>Il <strong>few-shot prompting</strong> consiste nel mostrare all'IA alcuni esempi del pattern esatto che vuoi (formato, tono, struttura) prima di chiederle di completarne uno nuovo. Il modello non si "allena" con questi esempi — li usa come contesto immediato per dedurre il pattern.</p><p>Regole di base: 3-5 esempi è di solito il punto ottimale, devono essere rappresentativi e coerenti tra loro, e gli ultimi esempi pesano di più nella decisione del modello (recency bias). Il few-shot insegna pattern, non ragionamento — per quello esiste il ${w('chain-of-thought', 'Chain-of-Thought')}.</p>`,
  },
  'chain-of-thought': {
    term: 'Chain-of-Thought (CoT)',
    summary: 'Tecnica che fa ragionare il modello passo dopo passo prima di dare la risposta finale, riducendo gli errori in compiti complessi.',
    content: `<p>Il <strong>Chain-of-Thought</strong> (ragionamento a catena) è la tecnica che ha scoperto che chiedere a un modello di "pensare passo dopo passo" prima di rispondere migliora drasticamente la sua precisione in problemi matematici, logici e a più passaggi.</p><p>L'articolo originale (Wei et al., 2022, Google) mostrò miglioramenti fino al 40% in problemi matematici con modelli grandi. Esistono due forme: Zero-Shot CoT (aggiungi solo la frase magica) e Few-Shot CoT (mostri esempi con il ragionamento già scritto). La sua evoluzione più ambiziosa è il ${w('tree-of-thoughts', 'Tree of Thoughts')}.</p>`,
  },
  'tree-of-thoughts': {
    term: 'Tree of Thoughts (ToT)',
    summary: 'Evoluzione del Chain-of-Thought: il modello esplora diversi percorsi di ragionamento in parallelo e sceglie il più promettente.',
    content: `<p>Il <strong>Tree of Thoughts</strong> (Yao et al., 2023) rompe con il ragionamento lineare del ${w('chain-of-thought', 'Chain-of-Thought')}: invece di seguire un solo percorso di ragionamento, il modello genera diversi approcci distinti, li valuta tra loro, e sviluppa in dettaglio il più valido.</p><p>Consuma più token del CoT, quindi è riservato a problemi dove esistono davvero diversi percorsi validi: decisioni strategiche, progettazione architetturale, problemi senza un'unica soluzione corretta.</p>`,
  },
  'react-prompting': {
    term: 'ReAct (Reasoning + Acting)',
    summary: 'Framework che alterna ragionamento (Thought) con azioni concrete (Action) e osservazioni (Observation) in un ciclo.',
    content: `<p><strong>ReAct</strong> (2022) è il framework dietro la maggior parte degli agenti IA moderni: il modello alterna tra "pensare" ad alta voce (Thought), decidere un'azione concreta (Action, come cercare informazioni), e processare il risultato (Observation) — ripetendo il ciclo fino ad arrivare a una risposta finale.</p><p>Riduce le allucinazioni perché il modello cerca informazioni invece di inventarle, ed è trasparente: puoi vedere il ragionamento completo prima della risposta.</p>`,
  },
  'meta-prompting': {
    term: 'Meta-Prompting',
    summary: 'Usare un\'IA per progettare, analizzare o migliorare prompt che verranno usati con un\'altra IA (o la stessa).',
    content: `<p>Il <strong>meta-prompting</strong> è ricorsivo: invece di scrivere tu il prompt perfetto, chiedi all'IA di analizzare un prompt esistente e migliorarlo, o di generare diverse varianti di un prompt affinché tu scelga la migliore — la tecnica formale dietro a ciò si chiama Automatic Prompt Engineer (APE).</p><p>Il flusso tipico: scrivi un prompt → lo testi → identifichi cosa fallisce → chiedi all'IA di migliorarlo con quel feedback → testi la nuova versione. È esattamente così che i team IA in produzione ottimizzano i loro sistemi.</p>`,
  },
  'prompt-injection': {
    term: 'Prompt Injection',
    summary: 'Attacco in cui vengono inserite istruzioni malevole in dati che l\'IA elaborerà, affinché ignori le sue istruzioni originali.',
    content: `<p>Il <strong>prompt injection</strong> è uno dei rischi di sicurezza più importanti nella costruzione di applicazioni IA. Esistono due varianti: <em>diretta</em> (l'utente stesso tenta di sovrascrivere le istruzioni di sistema) e <em>indiretta</em> (un attaccante nasconde istruzioni dentro dati esterni — un documento, un'email, una pagina web — che l'IA elaborerà).</p><p>Difese principali: separare chiaramente istruzioni e dati, dare privilegi minimi all'IA, e validare qualsiasi azione prima di eseguirla — mai fidarsi solo del fatto che il prompt "si comporti bene".</p>`,
  },
  'temperatura-llm': {
    term: 'Temperatura (parametro IA)',
    summary: 'Parametro che controlla quanto è prevedibile o casuale la risposta di un modello di linguaggio.',
    content: `<p>La <strong>temperatura</strong> è il parametro più importante per controllare il comportamento di un modello di linguaggio tramite API. Con temperatura 0.0 la risposta è praticamente deterministica (ideale per codice o estrazione di dati); con temperatura alta (0.8-1.0) le risposte sono più variate e creative, utili per brainstorming o scrittura creativa.</p><p>Nelle interfacce di chat normali (ChatGPT, Claude.ai) non la controlli direttamente — conta solo quando lavori con l'API del modello.</p>`,
  },
  rctfs: {
    term: 'Framework RCTFS',
    summary: 'Struttura a 5 elementi per prompt efficaci: Ruolo, Contesto, Compito, Formato, Senza (restrizioni).',
    content: `<p><strong>RCTFS</strong> è un framework mnemonico per non dimenticare gli elementi chiave di un prompt ben costruito: <strong>R</strong>uolo (chi è l'IA per questo compito), <strong>C</strong>ontesto (background necessario), <strong>T</strong>ask/Compito (istruzione specifica e attuabile), <strong>F</strong>ormato (come vuoi la risposta), e <strong>S</strong>enza — restrizioni su cosa evitare.</p><p>Non servono sempre tutti e 5 gli elementi: per compiti semplici, Compito + Formato di solito basta. Per compiti complessi o creativi, includili tutti.</p>`,
  },
  'llm-as-judge': {
    term: 'LLM-as-Judge',
    summary: 'Usare un modello di linguaggio per valutare e valutare la qualità della risposta di un altro modello (o di se stesso).',
    content: `<p><strong>LLM-as-Judge</strong> è una tecnica di valutazione: invece che una persona valuti manualmente centinaia di risposte IA, chiedi a un altro modello (o allo stesso) di valutare ogni risposta secondo criteri espliciti — completezza, precisione, formato, concisione — con una breve giustificazione.</p><p>È la base di come strumenti come LangSmith o Weights & Biases automatizzano la valutazione dei sistemi IA in produzione, anche se per imparare, valutare manualmente con un framework di criteri resta molto utile.</p>`,
  },

  // ── Etica ────────────────────────────────────────────────────────────
  consecuencialismo: {
    term: 'Consequenzialismo',
    summary: 'Corrente etica che giudica se un\'azione è corretta in base alle sue conseguenze — la sua versione più famosa è l\'utilitarismo.',
    content: `<p>Il <strong>consequenzialismo</strong> sostiene che un'azione è moralmente corretta se le sue conseguenze sono buone, indipendentemente dall'intenzione o dal fatto che segua una regola fissa. La sua versione più influente, l'<strong>utilitarismo</strong> (Jeremy Bentham, John Stuart Mill), propone di massimizzare il benessere totale di tutti gli interessati.</p><p>La sua critica più citata: può giustificare azioni che la maggior parte considera sbagliate se il risultato netto è "migliore" — il che porta alla corrente opposta, la ${w('deontologia-kant', 'deontologia di Kant')}.</p>`,
  },
  'deontologia-kant': {
    term: 'Deontologia (Kant)',
    summary: 'Corrente etica di Immanuel Kant: certe azioni sono giuste o sbagliate in sé, indipendentemente dal risultato.',
    content: `<p>La <strong>deontologia</strong> di Immanuel Kant (1724-1804) sostiene che il giusto si definisce da doveri e regole, non da conseguenze. Il suo test centrale, l'<strong>imperativo categorico</strong>, chiede se potresti volere che tutti seguissero la stessa regola che stai per seguire tu.</p><p>Un'altra formulazione chiave: tratta sempre le persone come fini in se stesse, mai solo come mezzi per i tuoi scopi.</p>`,
  },
  'aristoteles-etica': {
    term: 'Aristotele e l\'etica della virtù',
    summary: 'Corrente che chiede che tipo di persona vuoi essere, invece di quale regola seguire o quale risultato produrre.',
    content: `<p><strong>Aristotele</strong> (384-322 a.C.) propose che l'etica non riguarda il calcolo dei risultati né il seguire regole, ma il coltivare il carattere. Ogni virtù (coraggio, generosità, onestà) è una via di mezzo tra un vizio per difetto e uno per eccesso — il coraggio, ad esempio, tra la codardia e la temerarietà.</p><p>Per Aristotele, la virtù si impara praticandola ripetutamente, come un mestiere, non memorizzando definizioni.</p>`,
  },

  // ── Donne che hanno cambiato il mondo ────────────────────────────────
  'ada-lovelace': {
    term: 'Ada Lovelace',
    summary: 'Matematica inglese (1815-1852), autrice del primo algoritmo pubblicato pensato per essere eseguito da una macchina.',
    content: `<p><strong>Ada Lovelace</strong> (1815-1852), figlia del poeta Lord Byron, lavorò con Charles Babbage alla sua "Macchina Analitica" — un progetto di computer meccanico mai costruito ai suoi tempi. Nelle sue note sulla macchina, Lovelace scrisse quello che oggi è considerato il primo algoritmo pubblicato pensato esplicitamente per essere eseguito da una macchina.</p><p>Anticipò anche, più di un secolo prima che esistessero i veri computer, che queste macchine avrebbero potuto essere usate per musica e arte, non solo per calcoli numerici — una visione notevolmente in anticipo sui tempi.</p>`,
  },
  'marie-curie': {
    term: 'Marie Curie',
    summary: 'Fisica e chimica polacco-francese (1867-1934), prima persona a vincere due Premi Nobel in scienze diverse.',
    content: `<p><strong>Marie Curie</strong> (1867-1934) scoprì, insieme al marito Pierre, gli elementi polonio e radio, e sviluppò il concetto di <strong>radioattività</strong> — termine che lei stessa coniò. Fu la prima donna a vincere un Premio Nobel (Fisica, 1903) e la prima persona, uomo o donna, a vincere un secondo Nobel in una scienza diversa (Chimica, 1911).</p><p>Durante la Prima Guerra Mondiale sviluppò unità mobili a raggi X per ospedali da campo. Morì per esposizione prolungata alle radiazioni — il suo stesso lavoro finì per costarle la vita.</p>`,
  },
  'hedy-lamarr': {
    term: 'Hedy Lamarr',
    summary: 'Attrice e inventrice austro-americana (1914-2000), co-inventrice di una tecnologia radio precursore del Wi-Fi e del Bluetooth.',
    content: `<p><strong>Hedy Lamarr</strong> (1914-2000) fu un'attrice di Hollywood nell'epoca d'oro del cinema, ma anche un'inventrice autodidatta. Durante la Seconda Guerra Mondiale, co-sviluppò con il compositore George Antheil un sistema di "salto di frequenza" per evitare che i siluri guidati via radio venissero disturbati dal nemico.</p><p>La tecnologia non fu usata militarmente all'epoca, ma decenni dopo divenne la base concettuale di tecnologie wireless moderne come il Wi-Fi, il GPS e il Bluetooth.</p>`,
  },
  'malala-yousafzai': {
    term: 'Malala Yousafzai',
    summary: 'Attivista pakistana (nata nel 1997) per l\'istruzione delle ragazze, la persona più giovane a ricevere un Premio Nobel.',
    content: `<p><strong>Malala Yousafzai</strong> iniziò a scrivere pubblicamente sulla vita sotto il regime talebano in Pakistan, difendendo il diritto delle ragazze all'istruzione, quando era ancora un'adolescente. Nel 2012, a 15 anni, sopravvisse a un colpo alla testa da parte di un miliziano talebano in rappresaglia per il suo attivismo.</p><p>Si riprese e continuò il suo lavoro a livello internazionale. Nel 2014, a 17 anni, divenne la persona più giovane a ricevere un Premio Nobel (per la Pace), e fondò il Malala Fund per l'istruzione delle ragazze in tutto il mondo.</p>`,
  },
  'frida-kahlo': {
    term: 'Frida Kahlo',
    summary: 'Pittrice messicana (1907-1954) la cui opera, profondamente personale, la trasformò in un\'icona dell\'arte e dell\'identità latinoamericana.',
    content: `<p><strong>Frida Kahlo</strong> (1907-1954) sopravvisse alla poliomielite nell'infanzia e a un grave incidente stradale in gioventù, che le causò dolore cronico per tutta la vita. Buona parte della sua opera — profondamente autobiografica e simbolica — nacque dall'elaborazione di quel dolore fisico ed emotivo, così come della sua identità messicana e indigena.</p><p>Sebbene avesse minor riconoscimento in vita rispetto al marito, il muralista Diego Rivera, oggi è una delle pittrici più riconosciute e influenti del XX secolo in tutto il mondo.</p>`,
  },
  'rigoberta-menchu': {
    term: 'Rigoberta Menchú',
    summary: 'Attivista indigena guatemalteca (nata nel 1959) per i diritti dei popoli originari, Premio Nobel per la Pace 1992.',
    content: `<p><strong>Rigoberta Menchú</strong> è un'attivista maya k'iche' che denunciò a livello internazionale le violazioni dei diritti umani dei popoli indigeni durante la guerra civile del Guatemala, un conflitto in cui perse diversi familiari.</p><p>Nel 1992 ricevette il Premio Nobel per la Pace per il suo lavoro a favore della riconciliazione etnico-culturale e dei diritti dei popoli indigeni, diventando una delle voci indigene più riconosciute a livello internazionale.</p>`,
  },
  'wangari-maathai': {
    term: 'Wangari Maathai',
    summary: 'Ambientalista e attivista keniota (1940-2011), fondatrice del Movimento della Cintura Verde, prima donna africana a vincere un Nobel per la Pace.',
    content: `<p><strong>Wangari Maathai</strong> fu la prima donna dell'Africa centrale e orientale a ottenere un dottorato. Nel 1977 fondò il <strong>Movimento della Cintura Verde</strong>, che ha promosso la piantumazione di decine di milioni di alberi in Kenya, dando lavoro a donne rurali e combattendo la deforestazione e l'erosione del suolo.</p><p>Nel 2004 divenne la prima donna africana a ricevere il Premio Nobel per la Pace, riconoscendo il legame tra protezione ambientale, democrazia e diritti delle donne.</p>`,
  },
}