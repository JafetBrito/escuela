// Traductions françaises du glossaire Segundo Cerebro (src/data/glossaryRegistry.js).
// Indexé par slug. Champs/slugs manquants -> repli sur la source espagnole,
// voir getLocalizedEntry() dans ./index.js.
const w = (slug, label) => `<a class="wiki-link" href="/cerebro/${slug}" target="_blank" rel="noopener">${label}</a>`

export const fr = {
  // ── Histoire ─────────────────────────────────────────────────────────
  sumerios: {
    term: 'Sumériens',
    summary: 'Le peuple du sud de la Mésopotamie qui créa la première civilisation urbaine connue, vers 4500 av. J.-C.',
    content: `<p>Les <strong>Sumériens</strong> se sont installés dans le sud de la Mésopotamie (l'Irak actuel) entre le Tigre et l'Euphrate. On ne sait pas avec certitude d'où ils venaient ni à quelle famille linguistique appartenait leur langue — le sumérien est une « langue isolée », sans parents connus.</p><p>Ils ont fondé des cités-États indépendantes comme Uruk, Ur, Eridu et Lagash, chacune avec son propre souverain et son temple principal. On leur attribue l'invention de l'écriture, de la roue, du premier code de lois connu, et du système sexagésimal que nous utilisons encore pour mesurer le temps.</p>`,
  },
  mesopotamia: {
    term: 'Mésopotamie',
    summary: 'La région entre le Tigre et l\'Euphrate (« entre les fleuves » en grec), berceau de plusieurs des premières civilisations du monde.',
    content: `<p>La <strong>Mésopotamie</strong> signifie « terre entre les fleuves » en grec, en référence au Tigre et à l'Euphrate. Son sol fertile, renouvelé chaque année par les crues des fleuves, a permis une agriculture si productive qu'elle a généré des surplus alimentaires — la base économique qui a rendu possibles les premières villes.</p><p>Pendant des milliers d'années, la région a abrité les Sumériens, les Akkadiens, les Babyloniens et les Assyriens, chacun bâtissant sur l'héritage du précédent.</p>`,
  },
  cuneiforme: {
    term: 'Écriture cunéiforme',
    summary: 'Le premier système d\'écriture connu, inventé par les Sumériens à l\'aide de marques en forme de coin sur des tablettes d\'argile humide.',
    content: `<p>L'<strong>écriture cunéiforme</strong> (du latin <em>cuneus</em>, « coin ») est née à Uruk vers 3200 av. J.-C. Les scribes pressaient un stylet de roseau sur des tablettes d'argile humide, laissant des marques en forme de coin. Les tablettes séchaient ensuite au soleil ou étaient cuites, certaines ayant survécu intactes plus de 5000 ans.</p><p>Elle a commencé comme un système de pictogrammes pour tenir les comptes de céréales et de bétail — de la comptabilité, pas de la littérature. Avec le temps, elle a évolué pour représenter des sons et exprimer des idées abstraites, de la poésie et des lois.</p>`,
  },
  uruk: {
    term: 'Uruk',
    summary: 'L\'une des premières et plus grandes villes sumériennes, berceau de l\'écriture et demeure légendaire du roi Gilgamesh.',
    content: `<p><strong>Uruk</strong> a compté, selon les estimations archéologiques, entre 40 000 et 80 000 habitants vers 2900 av. J.-C. — une taille sans précédent pour l'époque. Elle était entourée de murailles que la tradition attribue à Gilgamesh lui-même.</p><p>C'est là qu'apparaissent les plus anciennes tablettes d'écriture connues, et elle donne son nom à la « période d'Uruk », durant laquelle la société sumérienne est passée de villages agricoles à de véritables villes avec gouvernement, temples et spécialisation du travail.</p>`,
  },
  gilgamesh: {
    term: 'Gilgamesh',
    summary: 'Roi historique d\'Uruk (vers 2700 av. J.-C.) devenu héros légendaire du plus ancien poème épique conservé.',
    content: `<p><strong>Gilgamesh</strong> fut, selon les listes royales sumériennes, un véritable roi d'Uruk vers 2700 av. J.-C. Avec le temps, sa figure est devenue légende, protagoniste de l'<em>Épopée de Gilgamesh</em> — considérée comme la plus ancienne œuvre littéraire narrative conservée.</p><p>Le poème raconte son amitié avec Enkidu, sa quête de l'immortalité après la mort de son ami, et un récit de déluge universel qui présente des parallèles frappants avec celui de Noé, écrit des siècles plus tard.</p>`,
  },
  enheduanna: {
    term: 'Enheduanna',
    summary: 'Prêtresse sumérienne-akkadienne (vers 2285-2250 av. J.-C.), la première autrice de l\'histoire connue par son nom.',
    content: `<p><strong>Enheduanna</strong> était la fille du roi Sargon d'Akkad et grande prêtresse du dieu lunaire Nanna dans la ville d'Ur. Elle a écrit des hymnes et des poèmes qu'elle a signés de son propre nom — c'est pourquoi elle est considérée comme la première personne autrice connue dans toute l'histoire de l'écriture, homme ou femme.</p><p>Ses hymnes à la déesse Inanna ont continué d'être copiés et étudiés dans les écoles de scribes pendant des siècles après sa mort.</p>`,
  },
  zigurat: {
    term: 'Ziggourat',
    summary: 'Temple en forme de pyramide à degrés, le bâtiment religieux central de chaque ville sumérienne.',
    content: `<p>Une <strong>ziggourat</strong> est une structure religieuse en forme de pyramide à degrés, faite de briques d'adobe, avec un temple au sommet dédié au dieu patron de la ville. Elle servait de centre administratif, économique et religieux de la cité-État.</p><p>La plus connue et la mieux conservée est la Ziggourat d'Ur, construite vers 2100 av. J.-C. et encore partiellement debout aujourd'hui en Irak.</p>`,
  },
  'codigo-ur-nammu': {
    term: 'Code d\'Ur-Nammu',
    summary: 'Le plus ancien code de lois écrit connu, environ 300 ans antérieur au célèbre Code d\'Hammurabi.',
    content: `<p>Le <strong>Code d'Ur-Nammu</strong> fut promulgué par le roi d'Ur du même nom vers 2100-2050 av. J.-C. — près de trois siècles avant le plus célèbre Code d'Hammurabi. C'est le plus ancien code de lois écrit connu.</p><p>Contrairement à la « loi du talion » (œil pour œil) que popularisera plus tard Hammurabi, beaucoup de ses peines étaient des compensations financières : par exemple, couper le pied d'autrui se payait par une amende en argent, pas par la mutilation de l'agresseur.</p>`,
  },
  'sistema-sexagesimal': {
    term: 'Système sexagésimal',
    summary: 'Le système numérique en base 60 inventé par les Sumériens — la raison pour laquelle une heure compte 60 minutes et un cercle 360 degrés.',
    content: `<p>Les Sumériens comptaient en <strong>base 60</strong> (sexagésimale) plutôt qu'en base 10 comme nous. Le 60 a l'avantage pratique de se diviser exactement par 2, 3, 4, 5, 6, 10, 12, 15, 20 et 30 — bien plus polyvalent pour répartir des choses que le 10, qui ne se divise exactement que par 2 et 5.</p><p>Ce système survit aujourd'hui dans les unités que vous utilisez tous les jours : 60 secondes par minute, 60 minutes par heure, et 360 (60×6) degrés dans un cercle complet.</p>`,
  },

  // ── Médecine ─────────────────────────────────────────────────────────
  imhotep: {
    term: 'Imhotep',
    summary: 'Architecte, prêtre et premier médecin de l\'histoire identifié par son vrai nom (v. 2650 av. J.-C.).',
    content: `<p><strong>Imhotep</strong> vécut dans l'Égypte antique vers 2650 av. J.-C., sous le règne du pharaon Djéser, qu'il servit comme chancelier, architecte et prêtre en plus d'être médecin. On lui attribue la conception de la pyramide à degrés de Saqqarah, l'une des premières grandes structures en pierre de l'histoire.</p><p>Des siècles après sa mort, les Égyptiens le vénéraient comme une divinité associée à la médecine et à la guérison. C'est, à notre connaissance, le premier médecin de l'histoire identifié par son vrai nom et non par une légende anonyme.</p>`,
  },
  'papiro-edwin-smith': {
    term: 'Papyrus Edwin Smith',
    summary: 'Texte médical égyptien (v. 1600 av. J.-C.) décrivant 48 cas chirurgicaux avec observation clinique, presque sans magie.',
    content: `<p>Le <strong>Papyrus Edwin Smith</strong>, écrit vers 1600 av. J.-C. comme copie d'un texte encore plus ancien, décrit 48 cas chirurgicaux réels, chacun suivant la même structure : examen, diagnostic et traitement (ou la reconnaissance honnête que le cas n'avait pas de remède).</p><p>Il est remarquable car, contrairement à la plupart des textes médicaux du monde antique, il décrit les cas avec une observation clinique presque pure, sans sortilèges ni explications religieuses — preuve que la méthode « observer, consigner, traiter » existait déjà il y a 3600 ans. Il porte le nom de l'égyptologue qui l'a acquis en 1862, pas celui de son auteur original.</p>`,
  },
  hipocrates: {
    term: 'Hippocrate',
    summary: 'Médecin grec (460-370 av. J.-C.) qui affirma que la maladie a des causes naturelles, non divines. Origine du « d\'abord, ne pas nuire ».',
    content: `<p><strong>Hippocrate de Cos</strong> (460-370 av. J.-C.) est considéré comme le père de la médecine occidentale. Sa contribution centrale fut d'affirmer que les maladies ont des causes naturelles — déséquilibres du corps, climat, alimentation — et non une punition divine.</p><p>Le « Corpus hippocratique » réunit une soixantaine de textes médicaux de son école. C'est de cette tradition que naît le <strong>Serment d'Hippocrate</strong> et le principe « Primum non nocere » (d'abord, ne pas nuire), encore cité dans les codes de déontologie médicale du monde entier, 2400 ans plus tard.</p>`,
  },
  galeno: {
    term: 'Galien',
    summary: 'Médecin le plus influent de l\'histoire occidentale pendant 1400 ans (129-216 apr. J.-C.), autorité incontestée malgré des erreurs anatomiques.',
    content: `<p><strong>Galien de Pergame</strong> (129-216 apr. J.-C.) travailla comme médecin de gladiateurs à Rome, une source unique d'expérience pratique des blessures et de l'anatomie humaine réelle. Ses écrits ont dominé la médecine occidentale pendant plus de 1400 ans.</p><p>La dissection de cadavres humains étant interdite à son époque, il disséqua des animaux (porcs, singes) et supposa que leur anatomie s'appliquait aux humains, se trompant sur plus de 200 points — il décrivit par exemple le foie humain avec cinq lobes, comme celui d'un porc. Son autorité était si absolue que la remettre en question était presque considéré comme une hérésie intellectuelle, jusqu'à ce que ${w('vesalio', 'Vésale')} le défie avec de véritables dissections humaines.</p>`,
  },
  avicena: {
    term: 'Avicenne (Ibn Sina)',
    summary: 'Médecin perse (980-1037), auteur du Canon de la médecine, manuel médical utilisé en Europe jusqu\'au XVIIe siècle.',
    content: `<p><strong>Avicenne</strong> (Ibn Sina, 980-1037) écrivit le <strong>Canon de la médecine</strong>, une encyclopédie médicale si complète et organisée qu'elle fut le principal manuel des universités européennes jusqu'au XVIIe siècle — plus de 600 ans d'usage.</p><p>Il faisait partie d'un âge d'or de la médecine dans le monde islamique médiéval, qui inventa aussi l'hôpital en tant qu'institution organisée (avec des salles par type de maladie et des dossiers de patients), des siècles avant la plupart des villes européennes.</p>`,
  },
  vesalio: {
    term: 'André Vésale',
    summary: 'Anatomiste (1514-1564) qui disséqua de véritables cadavres humains et corrigea plus de 200 erreurs de Galien.',
    content: `<p><strong>André Vésale</strong> (1514-1564) prit le risque de disséquer de véritables cadavres humains — vu avec suspicion par l'Église de son époque — plutôt que de se fier à l'anatomie animale que ${w('galeno', 'Galien')} avait extrapolée aux humains 1400 ans plus tôt.</p><p>Il publia « De humani corporis fabrica » (1543), avec des illustrations anatomiques si précises et détaillées qu'elles ont démontré plus de 200 erreurs dans l'anatomie décrite par Galien. Il est considéré comme le fondateur de l'anatomie moderne.</p>`,
  },
  'william-harvey': {
    term: 'William Harvey',
    summary: 'Médecin anglais (1578-1657) qui démontra mathématiquement que le sang circule dans un système fermé pompé par le cœur.',
    content: `<p><strong>William Harvey</strong> (1578-1657) réfuta d'un coup 1400 ans de croyance médicale : il calcula la quantité de sang que le cœur pompe en une heure, et le résultat dépassait le poids corporel total d'une personne — le foie ne pouvait donc pas fabriquer constamment du nouveau sang, comme on le croyait depuis Galien.</p><p>Il publia sa découverte en 1628 : le cœur est une pompe et le même sang circule dans un circuit fermé. Il y parvint avec des mathématiques simples et un raisonnement logique, sans technologie avancée.</p>`,
  },
  'van-leeuwenhoek': {
    term: 'Antonie van Leeuwenhoek',
    summary: 'Marchand de tissus néerlandais (1632-1723) sans formation scientifique, premier humain à voir des bactéries au microscope artisanal.',
    content: `<p><strong>Antonie van Leeuwenhoek</strong> (1632-1723) était marchand de tissus en Hollande. Il apprit à polir des lentilles de verre avec une précision exceptionnelle pour examiner des fils, et avec ses microscopes artisanaux (certains avec plus de 270 grossissements) il se mit à observer de l'eau de mare, de la plaque dentaire et d'autres échantillons.</p><p>En 1676, il vit de minuscules êtres en mouvement — il les appela des « animalcules ». Il avait découvert ce que nous appelons aujourd'hui les bactéries et les protozoaires, premier être humain à les voir. Personne, pas même lui, ne saurait avant près de 200 ans que certains de ces êtres causaient des maladies.</p>`,
  },
  'edward-jenner': {
    term: 'Edward Jenner',
    summary: 'Médecin anglais (1749-1823) qui créa le premier vaccin de l\'histoire, à partir de la vaccine bovine, en 1796.',
    content: `<p><strong>Edward Jenner</strong> (1749-1823) testa avec la méthode scientifique une observation populaire chez les fermiers : les trayeuses contaminées par la vaccine bovine (bénigne) ne tombaient presque jamais malades de la variole humaine (mortelle).</p><p>En 1796, il inocula à un enfant du matériel de vaccine bovine puis l'exposa délibérément à la variole humaine — l'enfant ne tomba pas malade. Il appela sa technique « vaccination » (de « vacca », vache en latin). Grâce aux campagnes de vaccination de masse, la variole fut déclarée éradiquée en 1980 — la seule maladie humaine entièrement éliminée de la planète.</p>`,
  },
  semmelweis: {
    term: 'Ignaz Semmelweis',
    summary: 'Médecin hongrois (1818-1865) qui réduisit la mortalité maternelle par dix grâce au lavage des mains — et fut ridiculisé pour cela.',
    content: `<p><strong>Ignaz Semmelweis</strong> (1818-1865) remarqua qu'à l'Hôpital général de Vienne, les médecins venant de pratiquer des autopsies sans se laver les mains avant d'assister des accouchements avaient une salle avec jusqu'à 10 % de mortalité maternelle, contre 1-2 % dans la salle tenue par des sages-femmes.</p><p>Il proposa de se laver les mains avec une solution chlorée avant chaque accouchement — la mortalité chuta immédiatement à moins de 1 %. Malgré cela, la communauté médicale refusa de l'accepter, le ridiculisa, et il finit interné dans un asile où il mourut à 47 ans. Aujourd'hui, il est considéré comme un pionnier de l'hygiène hospitalière.</p>`,
  },
  pasteur: {
    term: 'Louis Pasteur',
    summary: 'Chimiste et microbiologiste français (1822-1895) qui réfuta la génération spontanée et posa les bases de la théorie des germes.',
    content: `<p><strong>Louis Pasteur</strong> (1822-1895) conçut des flacons « à col de cygne » qui démontrèrent que les micro-organismes viennent de l'air extérieur et ne surgissent pas spontanément de la matière — mettant fin à des siècles de croyance en la génération spontanée.</p><p>Il relia ce que ${w('van-leeuwenhoek', 'Van Leeuwenhoek')} avait observé (les micro-organismes) à ce qui causait les maladies : il identifia les germes responsables du choléra des poules et développa un vaccin contre la rage. Ses travaux donnèrent naissance à la théorie des germes.</p>`,
  },
  koch: {
    term: 'Robert Koch',
    summary: 'Médecin allemand (1843-1910) qui établit la méthode rigoureuse pour prouver quel germe cause quelle maladie.',
    content: `<p><strong>Robert Koch</strong> (1843-1910) résolut un problème que ${w('pasteur', 'Pasteur')} avait laissé ouvert : comment prouver rigoureusement qu'un germe spécifique cause une maladie spécifique. Il établit quatre critères (les « postulats de Koch ») encore utilisés comme référence aujourd'hui.</p><p>Avec cette méthode, il identifia les agents responsables de la tuberculose (1882) et du choléra (1883), des maladies qui tuaient des millions de personnes sans que personne ne sache exactement pourquoi.</p>`,
  },
  lister: {
    term: 'Joseph Lister',
    summary: 'Chirurgien anglais (1827-1912) qui introduisit les antiseptiques en chirurgie, réduisant drastiquement les infections postopératoires.',
    content: `<p>Avant <strong>Joseph Lister</strong> (1827-1912), survivre à une chirurgie dépendait en grande partie de la chance — non pas à cause de l'incision elle-même, mais des infections qui suivaient, tuant jusqu'à 50 % des patients de chirurgie majeure dans certains hôpitaux.</p><p>Lister appliqua la théorie des germes de ${w('pasteur', 'Pasteur')} à la salle d'opération : il utilisa de l'acide phénique pour stériliser les instruments, les plaies et même l'air du bloc opératoire. La mortalité postopératoire chuta radicalement, posant les bases de la chirurgie moderne.</p>`,
  },
  'florence-nightingale': {
    term: 'Florence Nightingale',
    summary: 'Infirmière britannique (1820-1910) qui utilisa des statistiques visuelles pour réformer la santé militaire et fonda le métier d\'infirmière moderne.',
    content: `<p><strong>Florence Nightingale</strong> (1820-1910) arriva dans les hôpitaux militaires britanniques pendant la guerre de Crimée et y trouva des conditions hygiéniques effroyables. Au lieu de simplement le dénoncer, elle recueillit méticuleusement des données et les présenta sous forme de graphiques visuels (sa propre version du diagramme en secteurs polaires).</p><p>Ses graphiques démontrèrent que davantage de soldats mouraient d'infections hospitalières évitables que de blessures de combat, convainquant le gouvernement britannique de réformer la santé militaire. Elle fonda la première école d'infirmières basée sur des principes scientifiques.</p>`,
  },
  fleming: {
    term: 'Alexander Fleming',
    summary: 'Bactériologiste écossais (1881-1955) qui découvrit la pénicilline par accident en 1928, donnant naissance aux antibiotiques.',
    content: `<p><strong>Alexander Fleming</strong> (1881-1955) laissa une boîte de culture avec des bactéries sans la laver avant de partir en vacances en 1928. À son retour, il remarqua qu'une moisissure (<em>Penicillium</em>) avait contaminé la boîte, et que les bactéries proches d'elle étaient mortes.</p><p>Il identifia que la moisissure produisait une substance — la pénicilline — capable de tuer les bactéries sans endommager les cellules humaines. Howard Florey et Ernst Chain réussirent à la produire en masse dans les années 1940, juste à temps pour la Seconde Guerre mondiale. On estime que la pénicilline et les antibiotiques qui ont suivi ont sauvé plus de 200 millions de vies.</p>`,
  },
  'watson-crick': {
    term: 'Watson et Crick',
    summary: 'James Watson et Francis Crick publièrent en 1953 le modèle de la double hélice de l\'ADN.',
    content: `<p><strong>James Watson</strong> et <strong>Francis Crick</strong> publièrent en 1953 le modèle de la structure de l'ADN : une double hélice, deux brins entrelacés qui expliquait comment l'information génétique se copie et se transmet.</p><p>Leur modèle reposait de façon cruciale sur la « Photo 51 », une image de diffraction des rayons X prise par ${w('rosalind-franklin', 'Rosalind Franklin')}, vue sans son autorisation explicite par l'intermédiaire d'un collègue. Watson, Crick et Maurice Wilkins reçurent le prix Nobel en 1962.</p>`,
  },
  'rosalind-franklin': {
    term: 'Rosalind Franklin',
    summary: 'Scientifique britannique (1920-1958) dont la « Photo 51 » fut essentielle à la découverte de la structure de l\'ADN, sans en recevoir le crédit à l\'époque.',
    content: `<p><strong>Rosalind Franklin</strong> (1920-1958) prit, avec son étudiant Raymond Gosling, la « Photo 51 » — une image de diffraction des rayons X qui s'avéra cruciale pour déduire la structure en double hélice de l'ADN.</p><p>${w('watson-crick', 'Watson et Crick')} virent l'image sans son autorisation explicite, par l'intermédiaire d'un de ses collègues, et l'utilisèrent pour compléter leur modèle. Franklin reçut très peu de reconnaissance à l'époque et mourut en 1958, avant le prix Nobel de 1962 (qui n'est pas décerné à titre posthume). Aujourd'hui, elle est reconnue comme l'une des scientifiques dont le travail essentiel fut historiquement sous-estimé.</p>`,
  },
  crispr: {
    term: 'CRISPR',
    summary: 'Technologie d\'édition génétique de précision, adaptée d\'un système de défense bactérien naturel, développée comme outil en 2012.',
    content: `<p><strong>CRISPR</strong> est une technologie qui permet d'éditer des séquences spécifiques d'ADN avec une précision sans précédent — une sorte de « couper-coller » dans le code génétique. Elle est adaptée d'un système de défense que certaines bactéries utilisent naturellement contre les virus.</p><p>Depuis son développement comme outil d'édition génétique en 2012, elle fait l'objet de recherches actives pour traiter les maladies génétiques héréditaires. Elle soulève aussi d'importantes questions éthiques : qui décide quels gènes sont édités, et qui a accès à cette technologie ?</p>`,
  },

  // ── Prompt Engineering ───────────────────────────────────────────────
  'zero-shot': {
    term: 'Zero-Shot Prompting',
    summary: 'Demander à l\'IA de faire quelque chose sans lui donner d\'exemples préalables — juste l\'instruction directe.',
    content: `<p>Le <strong>zero-shot prompting</strong> est le type d'instruction le plus courant : vous dites à l'IA quoi faire sans lui montrer aucun exemple de comment le faire. Cela fonctionne bien pour la compréhension de texte, les questions de culture générale et les transformations de format simples.</p><p>Cela échoue plus souvent sur des tâches très spécifiques, des formats peu standards ou des domaines très spécialisés — c'est là qu'intervient le ${w('few-shot', 'few-shot prompting')} ou le ${w('chain-of-thought', 'Chain-of-Thought')}.</p>`,
  },
  'few-shot': {
    term: 'Few-Shot Prompting',
    summary: 'Inclure plusieurs exemples d\'entrée/sortie dans le prompt pour que le modèle apprenne le motif sur le moment.',
    content: `<p>Le <strong>few-shot prompting</strong> consiste à montrer à l'IA quelques exemples du motif exact que vous voulez (format, ton, structure) avant de lui demander d'en compléter un nouveau. Le modèle ne s'« entraîne » pas avec ces exemples — il les utilise comme contexte immédiat pour déduire le motif.</p><p>Règles de base : 3 à 5 exemples est souvent le point optimal, ils doivent être représentatifs et cohérents entre eux, et les derniers exemples pèsent davantage dans la décision du modèle (biais de récence). Le few-shot enseigne des motifs, pas du raisonnement — c'est le rôle du ${w('chain-of-thought', 'Chain-of-Thought')}.</p>`,
  },
  'chain-of-thought': {
    term: 'Chain-of-Thought (CoT)',
    summary: 'Technique qui fait raisonner le modèle étape par étape avant de donner la réponse finale, réduisant les erreurs sur les tâches complexes.',
    content: `<p>Le <strong>Chain-of-Thought</strong> (raisonnement en chaîne) est la technique qui a découvert que demander à un modèle de « réfléchir étape par étape » avant de répondre améliore radicalement sa précision sur les problèmes mathématiques, logiques et à plusieurs étapes.</p><p>L'article original (Wei et al., 2022, Google) a montré des améliorations allant jusqu'à 40 % sur des problèmes mathématiques avec de grands modèles. Il existe deux formes : Zero-Shot CoT (on ajoute juste la phrase magique) et Few-Shot CoT (on montre des exemples avec le raisonnement déjà rédigé). Son évolution la plus ambitieuse est le ${w('tree-of-thoughts', 'Tree of Thoughts')}.</p>`,
  },
  'tree-of-thoughts': {
    term: 'Tree of Thoughts (ToT)',
    summary: 'Évolution du Chain-of-Thought : le modèle explore plusieurs chemins de raisonnement en parallèle et choisit le plus prometteur.',
    content: `<p>Le <strong>Tree of Thoughts</strong> (Yao et al., 2023) rompt avec le raisonnement linéaire du ${w('chain-of-thought', 'Chain-of-Thought')} : au lieu de suivre un seul chemin de raisonnement, le modèle génère plusieurs approches distinctes, les évalue entre elles, et développe en détail la plus viable.</p><p>Il consomme plus de tokens que le CoT, il est donc réservé aux problèmes où plusieurs chemins valides existent réellement : décisions stratégiques, conception d'architecture, problèmes sans solution unique correcte.</p>`,
  },
  'react-prompting': {
    term: 'ReAct (Reasoning + Acting)',
    summary: 'Framework qui alterne raisonnement (Thought) et actions concrètes (Action) et observations (Observation) en boucle.',
    content: `<p><strong>ReAct</strong> (2022) est le framework derrière la plupart des agents IA modernes : le modèle alterne entre « penser » à voix haute (Thought), décider d'une action concrète (Action, comme rechercher une information), et traiter le résultat (Observation) — répétant le cycle jusqu'à obtenir une réponse finale.</p><p>Il réduit les hallucinations car le modèle recherche l'information au lieu de l'inventer, et il est transparent : vous pouvez voir tout le raisonnement avant la réponse.</p>`,
  },
  'meta-prompting': {
    term: 'Meta-Prompting',
    summary: 'Utiliser une IA pour concevoir, analyser ou améliorer des prompts qui seront utilisés avec une autre IA (ou la même).',
    content: `<p>Le <strong>meta-prompting</strong> est récursif : au lieu d'écrire vous-même le prompt parfait, vous demandez à l'IA d'analyser un prompt existant et de l'améliorer, ou de générer plusieurs variantes d'un prompt pour que vous choisissiez la meilleure — la technique formelle derrière cela s'appelle Automatic Prompt Engineer (APE).</p><p>Le flux typique : vous écrivez un prompt → vous le testez → vous identifiez ce qui échoue → vous demandez à l'IA de l'améliorer avec ce retour → vous testez la nouvelle version. C'est exactement ainsi que les équipes IA en production optimisent leurs systèmes.</p>`,
  },
  'prompt-injection': {
    term: 'Prompt Injection',
    summary: 'Attaque où des instructions malveillantes sont insérées dans des données que l\'IA va traiter, pour qu\'elle ignore ses instructions d\'origine.',
    content: `<p>Le <strong>prompt injection</strong> est l'un des risques de sécurité les plus importants lors de la construction d'applications IA. Il existe deux variantes : <em>directe</em> (l'utilisateur lui-même tente d'écraser les instructions du système) et <em>indirecte</em> (un attaquant cache des instructions dans des données externes — un document, un email, une page web — que l'IA va traiter).</p><p>Principales défenses : séparer clairement les instructions des données, donner des privilèges minimaux à l'IA, et valider toute action avant de l'exécuter — ne jamais se fier uniquement au fait que le prompt « se comporte bien ».</p>`,
  },
  'temperatura-llm': {
    term: 'Température (paramètre d\'IA)',
    summary: 'Paramètre qui contrôle à quel point la réponse d\'un modèle de langage est prévisible ou aléatoire.',
    content: `<p>La <strong>température</strong> est le paramètre le plus important pour contrôler le comportement d'un modèle de langage via API. À une température de 0,0, la réponse est pratiquement déterministe (idéal pour le code ou l'extraction de données) ; à haute température (0,8-1,0), les réponses sont plus variées et créatives, utiles pour le brainstorming ou l'écriture créative.</p><p>Dans les interfaces de chat normales (ChatGPT, Claude.ai), vous ne la contrôlez pas directement — elle ne compte que lorsque vous travaillez avec l'API du modèle.</p>`,
  },
  rctfs: {
    term: 'Framework RCTFS',
    summary: 'Structure en 5 éléments pour des prompts efficaces : Rôle, Contexte, Tâche, Format, Sans (restrictions).',
    content: `<p><strong>RCTFS</strong> est un framework mnémotechnique pour ne pas oublier les éléments clés d'un prompt bien construit : <strong>R</strong>ôle (qui est l'IA pour cette tâche), <strong>C</strong>ontexte (arrière-plan nécessaire), <strong>T</strong>âche (instruction spécifique et actionnable), <strong>F</strong>ormat (comment vous voulez la réponse), et <strong>S</strong>ans — restrictions sur ce qu'il faut éviter.</p><p>Vous n'avez pas toujours besoin des 5 éléments : pour des tâches simples, Tâche + Format suffit généralement. Pour des tâches complexes ou créatives, incluez-les tous.</p>`,
  },
  'llm-as-judge': {
    term: 'LLM-as-Judge',
    summary: 'Utiliser un modèle de langage pour évaluer et noter la qualité de la réponse d\'un autre modèle (ou de lui-même).',
    content: `<p>Le <strong>LLM-as-Judge</strong> est une technique d'évaluation : au lieu qu'une personne note manuellement des centaines de réponses d'IA, vous demandez à un autre modèle (ou au même) de noter chaque réponse selon des critères explicites — complétude, précision, format, concision — avec une brève justification.</p><p>C'est la base de la façon dont des outils comme LangSmith ou Weights & Biases automatisent l'évaluation des systèmes IA en production, bien que pour apprendre, évaluer manuellement avec un framework de critères reste très précieux.</p>`,
  },

  // ── Éthique ──────────────────────────────────────────────────────────
  consecuencialismo: {
    term: 'Conséquentialisme',
    summary: 'Courant éthique qui juge si une action est correcte selon ses conséquences — sa version la plus célèbre est l\'utilitarisme.',
    content: `<p>Le <strong>conséquentialisme</strong> soutient qu'une action est moralement correcte si ses conséquences sont bonnes, sans se soucier de l'intention ni de savoir si elle suit une règle fixe. Sa version la plus influente, l'<strong>utilitarisme</strong> (Jeremy Bentham, John Stuart Mill), propose de maximiser le bien-être total de toutes les personnes concernées.</p><p>Sa critique la plus citée : il peut justifier des actions que la plupart considèrent incorrectes si le résultat net est « meilleur » — ce qui mène au courant opposé, la ${w('deontologia-kant', 'déontologie de Kant')}.</p>`,
  },
  'deontologia-kant': {
    term: 'Déontologie (Kant)',
    summary: 'Courant éthique d\'Emmanuel Kant : certaines actions sont correctes ou incorrectes en elles-mêmes, indépendamment du résultat.',
    content: `<p>La <strong>déontologie</strong> d'Emmanuel Kant (1724-1804) soutient que le bien se définit par des devoirs et des règles, non par des conséquences. Son test central, l'<strong>impératif catégorique</strong>, demande si vous pourriez vouloir que tout le monde suive la même règle que vous êtes sur le point de suivre.</p><p>Autre formulation clé : traitez toujours les personnes comme des fins en elles-mêmes, jamais seulement comme des moyens pour vos propres fins.</p>`,
  },
  'aristoteles-etica': {
    term: 'Aristote et l\'éthique de la vertu',
    summary: 'Courant qui demande quel genre de personne vous voulez être, plutôt que quelle règle suivre ou quel résultat produire.',
    content: `<p><strong>Aristote</strong> (384-322 av. J.-C.) proposa que l'éthique ne consiste pas à calculer des résultats ni à suivre des règles, mais à cultiver le caractère. Chaque vertu (courage, générosité, honnêteté) est un juste milieu entre un vice par défaut et un vice par excès — le courage, par exemple, entre la lâcheté et la témérité.</p><p>Pour Aristote, la vertu s'apprend en la pratiquant de manière répétée, comme un métier, et non en mémorisant des définitions.</p>`,
  },

  // ── Femmes qui ont changé le monde ───────────────────────────────────
  'ada-lovelace': {
    term: 'Ada Lovelace',
    summary: 'Mathématicienne anglaise (1815-1852), autrice du premier algorithme publié conçu pour être exécuté par une machine.',
    content: `<p><strong>Ada Lovelace</strong> (1815-1852), fille du poète Lord Byron, travailla avec Charles Babbage sur sa « Machine analytique » — un ordinateur mécanique jamais construit à son époque. Dans ses notes sur la machine, Lovelace écrivit ce qui est aujourd'hui considéré comme le premier algorithme publié explicitement conçu pour être exécuté par une machine.</p><p>Elle anticipa aussi, plus d'un siècle avant l'existence des ordinateurs réels, que ces machines pourraient être utilisées pour la musique et l'art, pas seulement pour des calculs numériques — une vision remarquablement en avance sur son temps.</p>`,
  },
  'marie-curie': {
    term: 'Marie Curie',
    summary: 'Physicienne et chimiste polono-française (1867-1934), première personne à remporter deux prix Nobel dans des sciences différentes.',
    content: `<p><strong>Marie Curie</strong> (1867-1934) découvrit, avec son mari Pierre, les éléments polonium et radium, et développa le concept de <strong>radioactivité</strong> — terme qu'elle a elle-même inventé. Elle fut la première femme à remporter un prix Nobel (Physique, 1903) et la première personne, homme ou femme, à remporter un second Nobel dans une science différente (Chimie, 1911).</p><p>Pendant la Première Guerre mondiale, elle développa des unités mobiles de radiographie pour les hôpitaux de campagne. Elle mourut d'une exposition prolongée aux radiations — son propre travail finit par lui coûter la vie.</p>`,
  },
  'hedy-lamarr': {
    term: 'Hedy Lamarr',
    summary: 'Actrice et inventrice austro-américaine (1914-2000), co-inventrice d\'une technologie radio précurseure du Wi-Fi et du Bluetooth.',
    content: `<p><strong>Hedy Lamarr</strong> (1914-2000) fut une actrice hollywoodienne à l'âge d'or du cinéma, mais aussi une inventrice autodidacte. Pendant la Seconde Guerre mondiale, elle co-développa avec le compositeur George Antheil un système de « saut de fréquence » pour empêcher que les torpilles guidées par radio soient brouillées par l'ennemi.</p><p>La technologie ne fut pas utilisée militairement à l'époque, mais des décennies plus tard, elle devint la base conceptuelle de technologies sans fil modernes comme le Wi-Fi, le GPS et le Bluetooth.</p>`,
  },
  'malala-yousafzai': {
    term: 'Malala Yousafzai',
    summary: 'Activiste pakistanaise (née en 1997) pour l\'éducation des filles, la plus jeune personne à recevoir un prix Nobel.',
    content: `<p><strong>Malala Yousafzai</strong> commença à écrire publiquement sur la vie sous le régime taliban au Pakistan, défendant le droit des filles à l'éducation, alors qu'elle n'était qu'une adolescente. En 2012, à 15 ans, elle survécut à un tir à la tête par un milicien taliban en représailles à son activisme.</p><p>Elle se rétablit et poursuivit son œuvre à l'international. En 2014, à 17 ans, elle devint la plus jeune personne à recevoir un prix Nobel (de la Paix), et fonda le Malala Fund pour l'éducation des filles dans le monde.</p>`,
  },
  'frida-kahlo': {
    term: 'Frida Kahlo',
    summary: 'Peintre mexicaine (1907-1954) dont l\'œuvre, profondément personnelle, fit d\'elle une icône de l\'art et de l\'identité latino-américaine.',
    content: `<p><strong>Frida Kahlo</strong> (1907-1954) survécut à la poliomyélite dans son enfance et à un grave accident de la route dans sa jeunesse, qui lui causa une douleur chronique à vie. Une bonne partie de son œuvre — profondément autobiographique et symbolique — naquit du traitement de cette douleur physique et émotionnelle, ainsi que de son identité mexicaine et indigène.</p><p>Bien qu'elle ait eu moins de reconnaissance de son vivant que son mari, le muraliste Diego Rivera, elle est aujourd'hui l'une des peintres les plus reconnues et influentes du XXe siècle dans le monde entier.</p>`,
  },
  'rigoberta-menchu': {
    term: 'Rigoberta Menchú',
    summary: 'Activiste indigène guatémaltèque (née en 1959) pour les droits des peuples autochtones, prix Nobel de la Paix 1992.',
    content: `<p><strong>Rigoberta Menchú</strong> est une activiste maya k'iche' qui dénonça internationalement les violations des droits humains des peuples indigènes pendant la guerre civile du Guatemala, un conflit dans lequel elle perdit plusieurs membres de sa famille.</p><p>En 1992, elle reçut le prix Nobel de la Paix pour son travail en faveur de la réconciliation ethnico-culturelle et des droits des peuples indigènes, devenant l'une des voix indigènes les plus reconnues internationalement.</p>`,
  },
  'wangari-maathai': {
    term: 'Wangari Maathai',
    summary: 'Environnementaliste et activiste kényane (1940-2011), fondatrice du Mouvement de la Ceinture Verte, première femme africaine à remporter un Nobel de la Paix.',
    content: `<p><strong>Wangari Maathai</strong> fut la première femme d'Afrique centrale et de l'Est à obtenir un doctorat. En 1977, elle fonda le <strong>Mouvement de la Ceinture Verte</strong>, qui a favorisé la plantation de dizaines de millions d'arbres au Kenya, employant des femmes rurales et luttant contre la déforestation et l'érosion des sols.</p><p>En 2004, elle devint la première femme africaine à recevoir le prix Nobel de la Paix, reconnaissant le lien entre protection environnementale, démocratie et droits des femmes.</p>`,
  },
}