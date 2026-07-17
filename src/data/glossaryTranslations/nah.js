// Nāhuatlahtolli itech Segundo Cerebro (src/data/glossaryRegistry.js).
// Tlein amo ticmatih quen ticihcuiloah ipan nahuatl (tocayomeh, tlahtolli
// tlatecpanaliztli quen "CRISPR", "prompt engineering") tictlaliah quen
// castellano/inglés, quen occequi tlahtolli ipan in proyecto (ver nah.js
// ipan src/i18n/locales/). Ni tlahtolcuepaliztli se achto borrador ika
// tlazohcamachiliztli — monequi se hablante melahuac nahuatl quiixyehyecoz.
// Amo ticpiah mochi cecen slug; tlein amo oncah, calaqui castellano (ver
// getLocalizedEntry() ipan ./index.js).
const w = (slug, label) => `<a class="wiki-link" href="/cerebro/${slug}" target="_blank" rel="noopener">${label}</a>`

export const nah = {
  // ── Ilhuitlahtolli (Historia) ────────────────────────────────────────
  sumerios: {
    term: 'Sumeriomeh',
    summary: 'Tlacameh tlein onoyah itzintlan Mesopotamia, oquichijchiuhqueh achto huei altepetl tlaixmatili, ipan 4500 xihuitl ayamo Cristo.',
    content: `<p>In <strong>Sumeriomeh</strong> omotlalihqueh itzintlan Mesopotamia (axcan Iraq) intzalan Tigris huan Éufrates atoyameh. Ahmo cualli ticmatih canin ohualehqueh noso catlehhuatl tlahtolcalpolli itech pohui intlahtol — sumerio tlahtolli amo aquin ica pohui.</p><p>Oquichijchiuhqueh altepemeh tlein amo aquin quinnahuatiaya quen Uruk, Ur, Eridu huan Lagash, cecen ica itlahtocauh huan itlazohteocal. Yehhuantin quintlaliliah tlahcuiloliztli, tlamalacatl, achto tlanahuatilamatl, ihuan sistema sexagesimal tlein oc ticuih para tictlapohuah tonalli.</p>`,
  },
  mesopotamia: {
    term: 'Mesopotamia',
    summary: 'Tlalli intzalan Tigris huan Éufrates atoyameh ("intzalan atoyameh" ipan griego), inantzin miac achto altepemeh cemanahuac.',
    content: `<p><strong>Mesopotamia</strong> quihtosnequi "tlalli intzalan atoyameh" ipan griego. Itlalnacayo cualli para tlaelimiquiliztli pampa mochipa yancuic mocahua ihcuac atoyameh molonih — inic omochiuh miac tlacualli, huan inic oncah huei altepemeh.</p><p>Ipan miac xihuitl, in tlalli inchan omochiuh Sumeriomeh, Acadiomeh, Babiloniomeh huan Asiriomeh, cecen quichijchiuhtoya itech tlein achtopa omochiuh.</p>`,
  },
  cuneiforme: {
    term: 'Tlahcuiloliztli Cuneiforme',
    summary: 'Achto tlahcuiloliztli tlein ticmatih, oquichijchiuhqueh Sumeriomeh ica machiotl quen cuña ipan zoquitl.',
    content: `<p>In <strong>tlahcuiloliztli cuneiforme</strong> (nahuatl castellano <em>cuneus</em>, "cuña") otlacat Uruk ipan 3200 xihuitl ayamo Cristo. Tlahcuilohqueh quitlaliayah ce acatl ipan zoquitl amo huaqui, quicahuayah machiotl quen cuña. Zatepan zoquitl huaqui ica tonatiuh noso tlatlac, cequin oyecoya cualli oc 5000 xihuitl.</p><p>Peuh quen machiotl para tlapohualiztli itech trigo huan yolcameh — amo pohualiztli tlazohtli. Ica tonalli omopatlac inic huel quinextiah tlacaquiliztli, tlahtolli tlazohtli huan tlanahuatilamatl.</p>`,
  },
  uruk: {
    term: 'Uruk',
    summary: 'Ce achto huan huei altepetl sumerio, inantzin tlahcuiloliztli huan ichan tlahtoani Gilgamesh.',
    content: `<p><strong>Uruk</strong> oquipix, quen quinemiliah tlaixmatinimeh, intzalan 40,000 huan 80,000 tlacameh ipan 2900 xihuitl ayamo Cristo — ce huei tamachihualli para in tonalli. Oyeya tepamitl tlein tlahtolli quihtoa Gilgamesh quichijchiuh.</p><p>Nican monextiah tlahcuiloliztli achto machiotl, ihuan ompa itoca "Uruk tonalli" — ihcuac Sumeriomeh omopatlaqueh itech altepetzin milchihqueh para huei altepemeh ica tlahtocayotl, teocalli huan tequitl xexeliuhqui.</p>`,
  },
  gilgamesh: {
    term: 'Gilgamesh',
    summary: 'Tlahtoani melahuac Uruk (ipan 2700 xihuitl ayamo Cristo) omochiuh tlacatlazohtli itech achto huecauh amatlahtolli tlein oc oncah.',
    content: `<p><strong>Gilgamesh</strong> omochiuh, quen tlahtocatlapohualli sumerio quihtoa, melahuac tlahtoani Uruk ipan 2700 xihuitl ayamo Cristo. Ica tonalli omochiuh tlacatlazohtli, itech <em>Epopeya de Gilgamesh</em> — quinemiliah achto amatlahtolli tlein oc oncah.</p><p>Amatlahtolli quihtoa iicniuhyotl ica Enkidu, itemoliz para nemiliztli para nochipa ihcuac iicniuh omic, ihuan ce tlahtolli itech huei atl tlein quinehnehuilia inic Noé, tlahcuilo miac xihuitl zatepan.</p>`,
  },
  enheduanna: {
    term: 'Enheduanna',
    summary: 'Cihuateopixqui sumerio-acadio (ipan 2285-2250 xihuitl ayamo Cristo), achto tlahcuiloani ticmatih itoca.',
    content: `<p><strong>Enheduanna</strong> oyeya ichpoch tlahtoani Sargón Acad, huan huei teopixqui teotl Nanna ipan altepetl Ur. Oquihcuiloh cuicameh huan tlahtolli tlazohtli ica itoca melahuac — ipampa inon quinemiliah achto tlacatl tlein melahuac oquihcuiloh itech mochi tlahcuiloliztli tlahtolpan, tlacatl noso cihuatl.</p><p>Icuicayo para teotl Inanna oc onocopiaya huan onomachtiaya ipan tlahcuiloani calmecac miac xihuitl zatepan imiquiliz.</p>`,
  },
  zigurat: {
    term: 'Zigurat',
    summary: 'Teocalli ica tlamamalacachiuhqui quen huei tepetl, itlahtoltlazohcayo teocalli cecen altepetl sumerio.',
    content: `<p>Ce <strong>zigurat</strong> quen teocalli tlamamalacachiuhqui, ica xamitl zoquitl, ica teocalli ipan tzontecomac tlein para teotl tlapixqui altepetl. Otequitiaya quen inantzin tlahtocayotl, tomin huan teoyotl itech altepetl.</p><p>Tlein oc cualli ticmatih huan cualli oncah axcan itoca Zigurat Ur, tlachijchiuhtli ipan 2100 xihuitl ayamo Cristo, oc onoya ipan Iraq.</p>`,
  },
  'codigo-ur-nammu': {
    term: 'Tlanahuatilamatl Ur-Nammu',
    summary: 'Achto tlanahuatilamatl tlahcuilolli tlein ticmatih, 300 xihuitl achtopa in tlazohtli Tlanahuatilamatl Hammurabi.',
    content: `<p>In <strong>Tlanahuatilamatl Ur-Nammu</strong> otlanahuatiloc itech tlahtoani Ur ica ineltoca ipan 2100-2050 xihuitl ayamo Cristo — achi eyi xihuitl-macuilpohualli achtopa in tlazohtli Tlanahuatilamatl Hammurabi. Achto tlanahuatilamatl tlahcuilolli tlein ticmatih.</p><p>Amo quen "tlanahuatilli tlaxtlahuiliztli" (ixtelolotl para ixtelolotl) tlein zatepan Hammurabi quimomachiotiliz, miac tlaixnahuatiliztli oyeya tomin tlaxtlahuilli: ejemplo, tictequiz icxi occe tlacatl otlaxtlahuiloya ica tomin iztac, amo ica tlacocoliztli.</p>`,
  },
  'sistema-sexagesimal': {
    term: 'Sistema Sexagesimal',
    summary: 'Tlapohualiztli ica 60 tlein Sumeriomeh oquichijchiuhqueh — ipampa in ce hora quipia 60 minutos huan ce circulo 360 grados.',
    content: `<p>Sumeriomeh otlapohuayah ica <strong>60</strong> (sexagesimal) amo quen 10 quen tehhuan. In 60 huelqui moxelohua melahuac ica 2, 3, 4, 5, 6, 10, 12, 15, 20 huan 30 — oc miac cualli para tlaxelohualiztli in 10, tlein zan huelqui moxelohua ica 2 huan 5.</p><p>In sistema oc onemi axcan ipan tlein ticuih mochi tonalli: 60 segundos ce minuto, 60 minutos ce hora, huan 360 (60×6) grados ce circulo tlamiliztli.</p>`,
  },

  // ── Pahtiliztli (Medicina) ───────────────────────────────────────────
  imhotep: {
    term: 'Imhotep',
    summary: 'Tepanchihchiuhqui, teopixqui huan achto tepahtihqui itech historia ica itoca melahuac (ipan 2650 xihuitl ayamo Cristo).',
    content: `<p><strong>Imhotep</strong> onemico ipan huehcauh Egipto, ipan 2650 xihuitl ayamo Cristo, itech tlahtocayotl Zoser, aquin quitequipanoaya quen chanciller, tepanchihchiuhqui huan teopixqui, ihuan tepahtihqui. Quinemiliah oquichijchiuh tepetl Saqqara ica escaleras, ce achto huei tetl tepanchihchiuhtli.</p><p>Miac xihuitl zatepan imiquiliz, Egipciomeh oquimotocayotiliqueh quen teotl para pahtiliztli. Ye, quen ticmatih, achto tepahtihqui itech historia ica itoca melahuac, amo tlahtolli amo aquin.</p>`,
  },
  'papiro-edwin-smith': {
    term: 'Amatlahtolli Edwin Smith',
    summary: 'Amatlahtolli pahtiliztli egipcio (ipan 1600 xihuitl ayamo Cristo) ica 48 tequitl tlacocoliztli, motlachializ melahuac, amo tlein nahualiztli.',
    content: `<p>In <strong>Amatlahtolli Edwin Smith</strong>, tlahcuilolli ipan 1600 xihuitl ayamo Cristo quen copia ce amatlahtolli oc huehcauhtli, quihtoa 48 tequitl tlacocoliztli melahuac, cecen ica in tlamantli: tlaittaliztli, tlaixmatiliztli huan pahtiliztli (noso tlaneltoquiliztli ica in tequitl amo pahtiliztli oncatca).</p><p>Cualli tlein pampa, amo quen occequi amatlahtolli pahtiliztli huehcauh cemanahuac, quihtoa tequitl ica motlachializ melahuac, amo nahualiztli — tlaneltiliztli in "tlachia, tlahcuilo, tepahti" ohuelqui oc yeya 3600 xihuitl. Itoca itech tlaixmatini oquicouh ipan 1862, amo itech tlahcuiloani melahuac.</p>`,
  },
  hipocrates: {
    term: 'Hipócrates',
    summary: 'Tepahtihqui griego (460-370 xihuitl ayamo Cristo) oquihtoh cocoliztli quipia tlein melahuac, amo teotl. Inantzin "achto, amo titlacocoz".',
    content: `<p><strong>Hipócrates Cos</strong> (460-370 xihuitl ayamo Cristo) quinemiliah tahtli pahtiliztli occidental. Itlazohtlapaleuiliz oquihtoh cocoliztli quipia tlein melahuac — tlanechicoliztli tonacayo, ehecatl, tlacualli — amo tlaixnahuatiliztli teotl.</p><p>In "Corpus Hipocrático" quinechicoa achi 60 amatlahtolli pahtiliztli itech icalmecac. Itech inon tlahtolnemiliztli otlacat <strong>Itenahuatil Hipócrates</strong> huan tlanahuatilli "Primum non nocere" (achto, amo titlacocoz), oc motenehua ipan tlanahuatilamatl pahtiliztli mochi cemanahuac, 2400 xihuitl zatepan.</p>`,
  },
  galeno: {
    term: 'Galeno',
    summary: 'Tepahtihqui tlazohtlalli occidental ipan 1400 xihuitl (129-216 xihuitl itech Cristo), amo aquin quinamiqui masqui oquipix tlaixpoloztli.',
    content: `<p><strong>Galeno Pérgamo</strong> (129-216 itech Cristo) otequiti quen tepahtihqui gladiadores ipan Roma, ce tlazohtli tlaixmatiliztli ica tlacocolli huan tonacayo tlacatl melahuac. Iamahcuilhuan otlanahuatih pahtiliztli occidental oc 1400 xihuitl.</p><p>Pampa amo mocahuaya titlaxima tonacayo tlacatl miquini ipan itonalli, oquixin yolcameh (pitzomeh, ozomatin) huan oquineltocac inacayo tlapohualtiaya para tlacameh, otlaxelo oc 200 tlamantli — ejemplo, oquihtoh eltapachtli tlacatl quipia macuilli lóbulo, quen pitzotl. Itlanahuatil oyeya inon huei inic tlaixnahuati ye oyeya quen tlaixpoloztli tlamatiliztli, hasta ${w('vesalio', 'Vesalio')} oquinamic ica tlaxima tonacayo melahuac.</p>`,
  },
  avicena: {
    term: 'Avicena (Ibn Sina)',
    summary: 'Tepahtihqui persa (980-1037), tlahcuiloani Canon de Medicina, amoxtli pahtiliztli tlein Europa oquitequitiltihqueh hasta siglo XVII.',
    content: `<p><strong>Avicena</strong> (Ibn Sina, 980-1037) oquihcuiloh <strong>Canon de Medicina</strong>, ce amoxtli pahtiliztli huei huan cualli tlatecpanalli, inic omochiuh amoxtli tlazohtlalli ipan calmecac Europa hasta siglo XVII — oc 600 xihuitl.</p><p>Oyeya itech ce tonalli teocuitlatl pahtiliztli itech cemanahuac islámico medieval, tlein noihqui oquichijchiuh cochihuayan quen calpolli tlatecpanalli (ica cuartos ica cocoliztli huan amatlahtolli tlacocolli), miac xihuitl achtopa in miac altepemeh Europa.</p>`,
  },
  vesalio: {
    term: 'Andrés Vesalio',
    summary: 'Tlamachtihqui tonacayo (1514-1564) oquixin tonacayo tlacatl melahuac huan oquimopatlac oc 200 tlaixpoloztli Galeno.',
    content: `<p><strong>Andrés Vesalio</strong> (1514-1564) omomayahui titlaxima tonacayo tlacatl melahuac — tlein Iglesia in tonalli quitlachializtoya ica tlaixmachiliztli — amo motlacanequiliz itech tonacayo yolcatl tlein ${w('galeno', 'Galeno')} oquipohualtih para tlacameh 1400 xihuitl achtopa.</p><p>Oquiquixtih "De humani corporis fabrica" (1543), ica machiotl tonacayo cualli huan tlazohtli, oquinextih oc 200 tlaixpoloztli itech tonacayo Galeno oquihtoh. Quinemiliah tahtli tlamachiliztli tonacayo yancuic.</p>`,
  },
  'william-harvey': {
    term: 'William Harvey',
    summary: 'Tepahtihqui inglés (1578-1657) oquinextih ica tlapohualiztli ezo momolonia ipan tlacaltilli tzatzapaltic tlein yolotl quimomayahuiliz.',
    content: `<p><strong>William Harvey</strong> (1578-1657) oquiixnamic ica ce tlamantli 1400 xihuitl tlaneltoquiliztli pahtiliztli: oquipohuh quezqui ezo yolotl quimomayahuiliz ipan ce hora, huan tlanahnahuiliztli opanoc mochi itonacayotl tlacatl — ipampa eltapachtli amo huelquiya quichijchiuhtiuh yancuic ezo mochipa, quen quineltocayah desde Galeno.</p><p>Oquiquixtih itlanextiliz ipan 1628: yolotl quen ce apachiuhcatl huan mismo ezo momolonia ipan ce tlacaltilli tzatzapaltic. Oquichiuh ica tlapohualiztli amo ohui huan tlanemiliztli, amo tlamatiliztli yancuic.</p>`,
  },
  'van-leeuwenhoek': {
    term: 'Antonie van Leeuwenhoek',
    summary: 'Tlanamacac tlaquemitl holandés (1632-1723) amo tlamachtiloni, achto tlacatl oquitac bacterias ica microscopio ichan chijchiuhtli.',
    content: `<p><strong>Antonie van Leeuwenhoek</strong> (1632-1723) tlanamacac tlaquemitl ipan Holanda. Omomachti quichipahuaz vidrio ica cualli melahuac para quitta hilos, huan ica imicroscopios ichan chijchiuhtli (cequin ica oc 270 huei) opeuh quitta atl atepetl, tlantli tlazolli huan occequi tlamantli.</p><p>Ipan 1676 oquitac tlamantli pipitzahuac molinia — oquintocayotih "animáculos". Oquinextih tlein axcan tictocayotiah bacterias huan protozoos, achto tlacatl oquintac. Amo aquin, nion yeh, quimatiz hasta achi 200 xihuitl zatepan tlein cequin inon tlamantli quichihuayah cocoliztli.</p>`,
  },
  'edward-jenner': {
    term: 'Edward Jenner',
    summary: 'Tepahtihqui inglés (1749-1823) oquichijchiuh achto vacuna itech historia, ica viruela vacas, ipan 1796.',
    content: `<p><strong>Edward Jenner</strong> (1749-1823) oquiixyehyecoh ica tlamatiliztli ce tlaittaliztli itech milchihqueh: cihuameh tlein ocococoyah viruela vaca (amo ohui) amo quimopiayah viruela tlacatl (miquiliztli).</p><p>Ipan 1796 oquimacac ce conetl tlein viruela vaca huan zatepan oquichiuh ma quinamiqui viruela tlacatl — conetl amo omococoh. Oquitocayotih itequiuh "vacunación" (itech "vacca", vaca ipan latín). Ica campañas huei vacunación, viruela omocuic amo oncah ipan 1980 — zan iceltzin cocoliztli tlacatl tlein mochi omopoloh cemanahuac.</p>`,
  },
  semmelweis: {
    term: 'Ignaz Semmelweis',
    summary: 'Tepahtihqui húngaro (1818-1865) oquipinauhti miquiliztli cihuameh 10 huelilizti ica tlamahtequiliztli — huan omocamanaloh ipampa inon.',
    content: `<p><strong>Ignaz Semmelweis</strong> (1818-1865) oquitac, ipan Hospital Viena, tepahtianimeh tlein hualahqueh itech autopsias amo tlamahtequitoya achtopa quinpalehuiah cihuameh oquimopiliaya hasta 10% miquiliztli, amo quen 1-2% ipan cuarto tlein palehuianimeh quimopalehuiliaya.</p><p>Oquipehualtih ma tlamahtequi ica atl cloro achtopa cecen tlacatiliztli — miquiliztli niman opanoc amo 1%. Masqui inon, tlaixmatinimeh pahtiliztli amo oquineltocaqueh, oquicamanalohqueh, huan otlaliloc ipan calli tlein amo quinemiliaya, ompa omic ica 47 xihuitl. Axcan quinemiliah tahtli tlachipahualiztli hospital.</p>`,
  },
  pasteur: {
    term: 'Louis Pasteur',
    summary: 'Tlamachtihqui química huan bacterias francés (1822-1895) oquiixnamic tlacatiliztli iyolca huan oquitlali inantzin teoría germinal.',
    content: `<p><strong>Louis Pasteur</strong> (1822-1895) oquichijchiuh botellas "cuello cisne" tlein oquinextih bacterias hualehua itech ehecatl, amo mocatiaya iselti itech tlamantli — otlan miac xihuitl tlaneltoquiliztli tlacatiliztli iyolca.</p><p>Oquinamic tlein ${w('van-leeuwenhoek', 'Van Leeuwenhoek')} oquitac (bacterias) ica tlein quichihuaya cocoliztli: oquixmat bacterias tlein quichihua cocoliztli totolin huan oquichijchiuh vacuna para rabia. Itequiuh otlacatili teoría germinal cocoliztli.</p>`,
  },
  koch: {
    term: 'Robert Koch',
    summary: 'Tepahtihqui alemán (1843-1910) oquitlali tlamantli melahuac para quinextiz catlehhuatl bacteria quichihua catlehhuatl cocoliztli.',
    content: `<p><strong>Robert Koch</strong> (1843-1910) oquipatlac ce tlamantli tlein ${w('pasteur', 'Pasteur')} oquicauh: quen quinextiz melahuac ce bacteria melahuac quichihua ce cocoliztli melahuac. Oquitlali nahui tlanahuatilli ("postulados Koch") tlein oc tequitih axcan.</p><p>Ica inon tlamantli oquixmat tlein quichihua tuberculosis (1882) huan cólera (1883), cocoliztli tlein oquinmicti miac tlacameh amo aquin quimatiya tlica.</p>`,
  },
  lister: {
    term: 'Joseph Lister',
    summary: 'Tepahtihqui tlaximani inglés (1827-1912) oquicalaqui antisépticos ipan tlaximaliztli, oquipinauhti miquiliztli zatepan tlaximaliztli.',
    content: `<p>Achtopa <strong>Joseph Lister</strong> (1827-1912), titomayahuiz tlaximaliztli quinequiaya tlazazanilli — amo pampa tlatectli, tlein pampa cocoliztli zatepan, tlein oquinmicti hasta 50% tlacocoxqueh ipan cequin hospitales.</p><p>Lister oquitequiti teoría germinal itech ${w('pasteur', 'Pasteur')} ipan cuarto tlaximaliztli: oquitequiti ácido carbólico para quichipahuaz tlatquitl, tlacocoliztli hasta ehecatl cuarto. Miquiliztli zatepan tlaximaliztli oniman opanoc, oquitlali inantzin tlaximaliztli yancuic.</p>`,
  },
  'florence-nightingale': {
    term: 'Florence Nightingale',
    summary: 'Tepalehuiani británica (1820-1910) oquitequiti tlapohualiztli tlein motta para quipatlaz pahtiliztli soldados huan oquichijchiuh tepalehuiani yancuic.',
    content: `<p><strong>Florence Nightingale</strong> (1820-1910) oyaya cochihuayan soldados británicos ipan Guerra Crimea huan oquitac tlachipahualiztli amo cualli. Amo zan oquihtoh, oquinechico tlapohualiztli melahuac huan oquiquixtih ipan machiotl motta.</p><p>Imachiotl oquinextih oc miac soldados omiquia ica cocoliztli cochihuayan huelilizti moyahuaz amo quen tlacocoliztli guerra, oquineltocac tlahtocayotl británico quipatlaz pahtiliztli soldados. Oquichijchiuh achto calmecac tepalehuiani ica tlamatiliztli melahuac.</p>`,
  },
  fleming: {
    term: 'Alexander Fleming',
    summary: 'Tlamachtihqui bacterias escocés (1881-1955) oquinextih penicilina amo quinequia ipan 1928, otlacatili antibióticos.',
    content: `<p><strong>Alexander Fleming</strong> (1881-1955) oquicauh ce platl bacterias amo tlachipahualli achtopa oya vacaciones ipan 1928. Ihcuac ohualla, oquitac ce hongo (<em>Penicillium</em>) oquitlazolo platl, huan bacterias inahuac omiqueh.</p><p>Oquixmat hongo quichihua ce tlamantli — penicilina — huelqui quinmictiz bacterias amo quicocoz tonacayo tlacatl. Howard Florey huan Ernst Chain ohuelqueh quichihuaz miac ipan 1940s, ihcuac Guerra Ome Cemanahuac. Quinemiliah penicilina huan antibióticos zatepan oquimpalehuih oc 200 millón tlacameh.</p>`,
  },
  'watson-crick': {
    term: 'Watson huan Crick',
    summary: 'James Watson huan Francis Crick oquiquixtihqueh ipan 1953 imachiotl ADN doble hélice.',
    content: `<p><strong>James Watson</strong> huan <strong>Francis Crick</strong> oquiquixtihqueh ipan 1953 imachiotl ADN itlanacayo: ce doble hélice, ome cordón tlazaloliztli tlein oquipohuh quen tlaixmatiliztli genético monopatlaz.</p><p>Imachiotl otlacatili melahuac ica "Fotografía 51", ce ilhuil rayos X tlein ${w('rosalind-franklin', 'Rosalind Franklin')} oquichiuh, otlachix amo tlanahuatiloz melahuac ica ce icniuh. Watson, Crick huan Maurice Wilkins ocelihqueh Premio Nobel ipan 1962.</p>`,
  },
  'rosalind-franklin': {
    term: 'Rosalind Franklin',
    summary: 'Tlamachtihqui británica (1920-1958) tlein "Fotografía 51" oyeya tlazohtli para quinextiz ADN itlanacayo, amo ocelic tlazohtlaliztli in tonalli.',
    content: `<p><strong>Rosalind Franklin</strong> (1920-1958) oquichiuh, ica imachtiani Raymond Gosling, "Fotografía 51" — ce ilhuil rayos X tlein omochiuh tlazohtli para quinextiz ADN itlanacayo doble hélice.</p><p>${w('watson-crick', 'Watson huan Crick')} otlachixqueh ilhuil amo tlanahuatiloz melahuac, ica ce icniuh, huan oquitequitiltihqueh para quitlamiz imachiotl. Franklin ocelic amo miac tlazohtlaliztli in tonalli huan omic ipan 1958, achtopa Premio Nobel 1962 (tlein amo quitemacah zatepan miquiliztli). Axcan quinemiliah ce tlamachtihqui tlein itequiuh melahuac amo cualli oquimatqueh in tonalli.</p>`,
  },
  crispr: {
    term: 'CRISPR',
    summary: 'Tlamatiliztli para quipatlaz ADN ica melahuac, motlacuiliz itech ce tlamantli tlapalehuiliztli bacterias, tlachijchiuhtli quen tlatquitl ipan 2012.',
    content: `<p><strong>CRISPR</strong> ce tlamatiliztli tlein huelqui quipatlaz ADN ica melahuac huei — quen "tictequiz huan ticzaloz" ipan tlahcuiloliztli genético. Motlacuiliz itech ce tlamantli tlapalehuiliztli tlein cequin bacterias tequitih iselti inahuac virus.</p><p>Desde omochiuh tlatquitl ipan 2012, oc quitemoah para quipahtiz cocoliztli genético tlein monopia. Noihqui quinextia tlahtlaniliztli yectlahtoliztli tlazohtli: aquin quitlaliz catlehhuatl gen mopatlaz, huan aquin huelqui quitequitiltiz in tlamatiliztli?</p>`,
  },

  // ── Prompt Engineering ───────────────────────────────────────────────
  'zero-shot': {
    term: 'Zero-Shot Prompting',
    summary: 'Titlatlaniz IA ma quichihua tlamantli amo titlamacaz ejemplomeh achtopa — zan tlanahuatilli melahuac.',
    content: `<p>In <strong>zero-shot prompting</strong> tlanahuatilli tlein oc quitequitiltiah: tiquilhuia IA tlein quichihuaz amo titlanextiliz quenin quichihuaz. Cualli tequiti para tlaixmatiliztli amatlahtolli, tlahtlaniliztli tlamachiliztli huan tlapatlaliztli formato amo ohui.</p><p>Zan poliuhqui ipan tequitl melahuac huei, formato amo tlacenpanoni noso tlamachiliztli tlazohtli — ompa ${w('few-shot', 'few-shot prompting')} noso ${w('chain-of-thought', 'Chain-of-Thought')} tequitih.</p>`,
  },
  'few-shot': {
    term: 'Few-Shot Prompting',
    summary: 'Ticalaquiz miac ejemplomeh calaquiliztli/quixtiliztli ipan prompt inic modelo quimachtiz machiotl niman.',
    content: `<p>In <strong>few-shot prompting</strong> tiquixtlantiliz IA cequin ejemplomeh machiotl melahuac tlein ticnequi (formato, tlahtoliztli, tlatecpanaliztli) achtopa titlatlaniz ma quitlamiz ce yancuic. Modelo amo momachtia ica inon ejemplomeh — quitequitiltia quen tlaixmatiliztli niman para quimatiz machiotl.</p><p>Tlanahuatilli achto: 3-5 ejemplomeh tlazohtli, monequi tlanextiliztli huan cencahuiliztli intzalan, huan ejemplomeh sepilliuhqui quitlaliah oc huei ipan modelo itlanemiliz. Few-shot quimachtia machiotl, amo tlanemiliztli — para inon oncah ${w('chain-of-thought', 'Chain-of-Thought')}.</p>`,
  },
  'chain-of-thought': {
    term: 'Chain-of-Thought (CoT)',
    summary: 'Tlamatiliztli tlein modelo quitlanemiliz cecen tlamantli achtopa quiquixtiz tlanahnahuiliztli tlamiliztli, quipinauhti tlaixpoloztli ipan tequitl ohui.',
    content: `<p>In <strong>Chain-of-Thought</strong> (tlanemiliztli cadena) tlamatiliztli oquinextih titlatlaniz modelo "xitlanemili cecen tlamantli" achtopa tlanahnahuia quipinauhti huei melahuac ipan tlamatemachiliztli, tlanemiliztli huan tequitl miac tlamantli.</p><p>Amatlahtolli achto (Wei et al., 2022, Google) oquinextih tlacualtiliztli hasta 40% ipan tlamatemachiliztli ica modelos huey. Oncah ome tlamantli: Zero-Shot CoT (zan ticalaquiz tlahtolli nahualli) huan Few-Shot CoT (titlanextiliz ejemplomeh ica tlanemiliztli ye tlahcuilolli). Icuepaliz oc huei ${w('tree-of-thoughts', 'Tree of Thoughts')}.</p>`,
  },
  'tree-of-thoughts': {
    term: 'Tree of Thoughts (ToT)',
    summary: 'Icuepaliz Chain-of-Thought: modelo quitemoa miac ohtli tlanemiliztli inhuan, huan quitlapehpenia tlein oc cualli.',
    content: `<p>In <strong>Tree of Thoughts</strong> (Yao et al., 2023) quixeloa tlanemiliztli melahuac ${w('chain-of-thought', 'Chain-of-Thought')}: amo zan ce ohtli tlanemiliztli, modelo quichihua miac tlamantli xexeliuhqui, quimopohua intzalan, huan quitlaliliz tlein oc cualli huelqui.</p><p>Quitequitiltia oc miac tokens in CoT, ipampa zan para tequitl tlein melahuac oncah miac ohtli cualli: tlanemiliztli tlazohtli, tepanchihchihualiztli, tequitl amo iceltzin tlanahnahuiliztli melahuac.</p>`,
  },
  'react-prompting': {
    term: 'ReAct (Reasoning + Acting)',
    summary: 'Tlamatiliztli tlein moxexeloa tlanemiliztli (Thought) ica tlachihualiztli melahuac (Action) huan tlaittaliztli (Observation) ipan ce cículo.',
    content: `<p><strong>ReAct</strong> (2022) tlamatiliztli tlein oncah zatlan miac agentes IA yancuic: modelo moxexeloa intzalan "tlanemiliz" ica tlatoliztli (Thought), quitlapehpenia ce tlachihualiztli melahuac (Action, quen titemoz tlaixmatiliztli), huan quitequiti tlanahnahuiliztli (Observation) — quicepiliz cículo hasta quitlamiz tlanahnahuiliztli tlamiliztli.</p><p>Quipinauhti tlaneltoquiliztli tlein amo melahuac pampa modelo quitemoa tlaixmatiliztli amo quichihchiuhtiuh, huan monextia: tihuelqui tictaz mochi tlanemiliztli achtopa tlanahnahuiliztli.</p>`,
  },
  'meta-prompting': {
    term: 'Meta-Prompting',
    summary: 'Titequitiltiz IA para tictlaliz, tictlachialtiz noso ticcualtiliz prompts tlein motequitiltiz ica occe IA (noso mismo).',
    content: `<p>In <strong>meta-prompting</strong> quen tlanechicoliztli: amo zan ticihcuiloz iceltzin prompt tlein cualli, titlatlaniz IA ma quitlachializ ce prompt tlein ye oncah huan quicualtiliz, noso ma quichihua miac tlamantli prompt para tehhuatzin tictlapehpeniz tlein oc cualli — tlamatiliztli melahuac itech inon motocayotia Automatic Prompt Engineer (APE).</p><p>Ohtli tlazohtli: ticihcuiloz ce prompt → tiquixyehyecoz → ticmatiz tlein amo cualli → titlatlaniz IA ma quicualtiliz ica inon tlanahnahuiliztli → tiquixyehyecoz yancuic. Inon melahuac quen equipos IA ipan tequitl huei quicualtiliah insistema.</p>`,
  },
  'prompt-injection': {
    term: 'Prompt Injection',
    summary: 'Tlacalaquiliztli canin tlanahuatilli amo cualli mocalaquia ipan tlamantli tlein IA quitequitiz, inic quielcahuaz itlanahuatil achto.',
    content: `<p>In <strong>prompt injection</strong> ce tlein tlazohtli ipan tlapaleuiliztli ihcuac ticchihchihuaz tlatquitl IA. Oncah ome tlamantli: <em>melahuac</em> (tlacatl iselti quiixyehyecoa quipatlaz tlanahuatilli sistema) huan <em>amo melahuac</em> (ce tlacatl amo cualli quitlatia tlanahuatilli ipan tlamantli hualehua occampa — ce amatlahtolli, ce correo, ce ilhuicac tlacuilolli — tlein IA quitequitiz).</p><p>Tlapaleuiliztli tlazohtli: xiquixeloa melahuac tlanahuatilli huan tlamantli, xictemaca IA amo miac huelitiliztli, huan xictlaneltili mochi tlachihualiztli achtopa xictlaliz — amo zan xictlaneltoca prompt "cualli monequi".</p>`,
  },
  'temperatura-llm': {
    term: 'Temperatura (tlanahuatilli IA)',
    summary: 'Tlanahuatilli tlein quipaleuia quenin monequi noso amo motta tlanahnahuiliztli ce modelo tlahtolli.',
    content: `<p>In <strong>temperatura</strong> tlanahuatilli tlazohtli para tictlaliz quenin monequi ce modelo tlahtolli ica API. Ica temperatura 0.0 tlanahnahuiliztli melahuac cualli (para código noso tlaquixtiliztli tlamantli); ica temperatura huei (0.8-1.0) tlanahnahuiliztli oc xexeliuhqui huan tlanemiliztli, cualli para brainstorming noso tlahcuiloliztli tlazohtli.</p><p>Ipan tlahtolli chat quen ChatGPT, Claude.ai, amo ticpaleuia melahuac — zan tequiti ihcuac titequiti ica API modelo.</p>`,
  },
  rctfs: {
    term: 'RCTFS Tlamatiliztli',
    summary: 'Tlatecpanaliztli 5 tlamantli para prompts cualli: Tequiuh, Tlein Inahuac, Tequitl, Formato, Amo (tlaixnahuatiliztli).',
    content: `<p><strong>RCTFS</strong> tlamatiliztli para amo tictelcahuaz tlamantli tlazohtli ce prompt cualli chijchiuhtli: <strong>R</strong>ol (aquin IA para inon tequitl), <strong>C</strong>ontexto (tlein inahuac monequi), <strong>T</strong>equitl (tlanahuatilli melahuac huan huelqui), <strong>F</strong>ormato (quenin ticnequi tlanahnahuiliztli), huan <strong>S</strong>in — tlaixnahuatiliztli tlein amo monequi.</p><p>Amo mochipa monequi mochi 5 tlamantli: para tequitl amo ohui, Tequitl + Formato tlazohtli monequi. Para tequitl ohui noso tlanemiliztli, xiquincalaqui mochi.</p>`,
  },
  'llm-as-judge': {
    term: 'LLM-as-Judge',
    summary: 'Titequitiltiz ce modelo tlahtolli para tictlachializ huan tictlaliz tlanahnahuiliztli occe modelo (noso mismo).',
    content: `<p><strong>LLM-as-Judge</strong> tlamatiliztli tlaittaliztli: amo ce tlacatl quitlaliz ica ima miac cientos tlanahnahuiliztli IA, titlatlaniz occe modelo (noso mismo) ma quitlaliz cecen tlanahnahuiliztli quen tlanahuatilli melahuac — tlamiliztli, melahuaca, formato, achi — ica ce tlanextiliztli amo huecapan.</p><p>Inon inantzin quenin tlatquitl quen LangSmith noso Weights & Biases quichihuah tlaittaliztli sistema IA ipan tequitl huei, masqui para timomachtiz, titlachializ ica ima ica ce tlamatiliztli tlanahuatilli oc tlazohtli.</p>`,
  },

  // ── Yectlahtoliztli (Ética) ──────────────────────────────────────────
  consecuencialismo: {
    term: 'Consecuencialismo',
    summary: 'Tlanemiliztli yectlahtoliztli tlein quitlaliz tla ce tlachihualiztli cualli quen itlanahnahuiliz — icuepaliz tlazohtli utilitarismo.',
    content: `<p>In <strong>consecuencialismo</strong> quihtoa ce tlachihualiztli cualli tla itlanahnahuiliz cualli, amo pampa tlanequiliztli noso tla quitoquilia ce tlanahuatilli tlacpicticac. Icuepaliz tlazohtli, <strong>utilitarismo</strong> (Jeremy Bentham, John Stuart Mill), quihtoa monequi tictlaliz oc huei paquiliztli mochi tlacameh tlein quinamiqui.</p><p>Itlaixnahuatiliztli oc motenehua: huelqui quineltoquiliz tlachihualiztli tlein miac tlacameh quinemiliah amo cualli tla itlanahnahuiliz "oc cualli" — inon oncah ${w('deontologia-kant', 'deontología Kant')}.</p>`,
  },
  'deontologia-kant': {
    term: 'Deontología (Kant)',
    summary: 'Tlanemiliztli yectlahtoliztli Immanuel Kant: cequin tlachihualiztli cualli noso amo cualli iselti, amo pampa itlanahnahuiliz.',
    content: `<p>In <strong>deontología</strong> Immanuel Kant (1724-1804) quihtoa cualli motlaliz ica tequiuh huan tlanahuatilli, amo ica tlanahnahuiliztli. Itlaixyehyecoliz inantzin, <strong>imperativo categórico</strong>, quitlatlania tla ticnequiz mochi tlacatl quitoquiliz mismo tlanahuatilli tlein tehhuatzin oc titoquiliz.</p><p>Occe tlahtolli tlazohtli: xiquinmati tlacameh mochipa quen tlamiliztli iselti, amo zan quen tlatquitl para motequiuh.</p>`,
  },
  'aristoteles-etica': {
    term: 'Aristóteles huan Yectlahtoliztli Cualtiliztli',
    summary: 'Tlanemiliztli tlein quitlatlania catlehhuatl tlacatl ticnequi timochihuaz, amo catlehhuatl tlanahuatilli tictoquiliz noso catlehhuatl tlanahnahuiliztli.',
    content: `<p><strong>Aristóteles</strong> (384-322 xihuitl ayamo Cristo) oquihtoh yectlahtoliztli amo pampa titlapohuaz tlanahnahuiliztli noso titoquiliz tlanahuatilli, tlein titlachipahuaz tlacayotl. Cecen cualtiliztli (yolchicahualiztli, tetlazohtlaliztli, tlaneltiliztli) tlamantli intzalan ce tlaixpoloztli tlein caxaniltic huan ce tlaixpoloztli tlein huei — yolchicahualiztli, ejemplo, intzalan tlamahuizti huan tlaixpoloztli.</p><p>Para Aristóteles, cualtiliztli momachtia titequitiz miac tlamantli, quen ce tequitl, amo titelnamictiz tlahtolli.</p>`,
  },

  // ── Cihuameh Tlein Oquimopatlaqueh Cemanahuac ────────────────────────
  'ada-lovelace': {
    term: 'Ada Lovelace',
    summary: 'Tlamatemachtihqui inglesa (1815-1852), tlahcuiloani achto algoritmo tlaquixtilli tlein motlanemiliz para ce máquina quichihuaz.',
    content: `<p><strong>Ada Lovelace</strong> (1815-1852), ichpoch tlahtolchihchiuhqui Lord Byron, otequiti ica Charles Babbage ipan "Máquina Analítica" — ce máquina tlapohualli amo omochijchiuh in itonalli. Ipan iamatlahtolhuan itech máquina, Lovelace oquihcuiloh tlein axcan quinemiliah achto algoritmo tlaquixtilli tlanemiliz melahuac para máquina quichihuaz.</p><p>Noihqui oquiixyehyecoh, oc ce siglo achtopa computadoras melahuac oyeya, in máquina huelqui motequitiltiz para cuicatl huan tlamahuizolli, amo zan tlapohualiztli — ce tlaixyehyecoliztli tlazohtli achtopa in itonalli.</p>`,
  },
  'marie-curie': {
    term: 'Marie Curie',
    summary: 'Tlamachtihqui física huan química polaco-francesa (1867-1934), achto tlacatl oquicelic ome Premio Nobel ipan tlamachiliztli xexeliuhqui.',
    content: `<p><strong>Marie Curie</strong> (1867-1934) oquinextih, inhuan itenamic Pierre, tlamantli polonio huan radio, huan oquichijchiuh tlanemiliztli <strong>radiactividad</strong> — tlahtolli tlein ye oquichijchiuh. Oyeya achto cihuatl oquicelic Premio Nobel (Física, 1903) huan achto tlacatl, tlacatl noso cihuatl, oquicelic ic ome Nobel ipan tlamachiliztli xexeliuhqui (Química, 1911).</p><p>Ipan Guerra Achto Cemanahuac oquichijchiuh tlatquitl rayos X para cochihuayan huehuentzitzin. Omic pampa oquipix tonatiuh miac tonalli — itequiuh melahuac oquimictih.</p>`,
  },
  'hedy-lamarr': {
    term: 'Hedy Lamarr',
    summary: 'Mahuiztlacatl huan tlachihchiuhqui austriaco-estadounidense (1914-2000), tlachihchiuhqui inhuan ce tlamatiliztli radio inantzin Wi-Fi huan Bluetooth.',
    content: `<p><strong>Hedy Lamarr</strong> (1914-2000) oyeya mahuiztlacatl Hollywood ipan tonalli teocuitlatl cine, ihuan tlachihchiuhqui iselti momachti. Ipan Guerra Ome Cemanahuac, inhuan tlahtolchihchiuhqui George Antheil oquichijchiuh sistema "salto frecuencia" para amo torpedos radio motlaixpoloz itech itlahuelica.</p><p>Tlamatiliztli amo omotequitiltih guerra ipan itonalli, achi xihuitl zatepan omochiuh inantzin tlamatiliztli yancuic quen Wi-Fi, GPS huan Bluetooth.</p>`,
  },
  'malala-yousafzai': {
    term: 'Malala Yousafzai',
    summary: 'Tepalehuiani pakistaní (otlacatili 1997) para tlamachtiliztli ichpochtin, tlacatl amo huehuentzin oquicelic Premio Nobel.',
    content: `<p><strong>Malala Yousafzai</strong> opeuh tlahcuiloa cemanahuac itech nemiliztli itzintlan talibán ipan Pakistán, quimopaleuiliz tequiuh ichpochtin para momachtiz, ihcuac zan telpocaton oyeya. Ipan 2012, ica 15 xihuitl, omoyoliti ce tepoztlacoyoctli itzontecon itech ce talibán pampa itequiuh.</p><p>Omopatlac huan ocuitlahuih itequiuh cemanahuac. Ipan 2014, ica 17 xihuitl, omochiuh tlacatl amo huehuentzin oquicelic Premio Nobel (Yecyoliztli), huan oquichijchiuh Malala Fund para tlamachtiliztli ichpochtin cemanahuac.</p>`,
  },
  'frida-kahlo': {
    term: 'Frida Kahlo',
    summary: 'Ihcuiloani mexicana (1907-1954) itequiuh, tlazohtli iselti, oquichiuh tlaixmatili itech tlamahuizolli huan tlacayotl latinoamericana.',
    content: `<p><strong>Frida Kahlo</strong> (1907-1954) omoyoliti poliomielitis ipan ipilhuayan huan ce tlacocoliztli huei ohtli ipan itelpocayo, oquimacac cocoliztli nochipa. Miac itequiuh — tlazohtli iselti huan machiotl — otlacatili itech quipatlaz inon cocoliztli tonacayo huan tlanemiliztli, ihuan itlacayo mexicana huan macehualli.</p><p>Masqui amo miac tlaixmatili in inemiliz quen itenamic, ihcuilocatzin Diego Rivera, axcan ce itech ihcuiloani oc tlaixmatili huan tlazohtli siglo XX cemanahuac.</p>`,
  },
  'rigoberta-menchu': {
    term: 'Rigoberta Menchú',
    summary: 'Tepalehuiani macehualli guatemalteca (otlacatili 1959) para tequiuh macehualtin, Premio Nobel Yecyoliztli 1992.',
    content: `<p><strong>Rigoberta Menchú</strong> ce tepalehuiani maya k\'iche\' tlein oquihtoh cemanahuac tlaixpoloztli tequiuh tlacameh macehualtin ipan guerra civil Guatemala, ce tlahuelli canin oquipoloh miac ichaneque.</p><p>Ipan 1992 ocelic Premio Nobel Yecyoliztli itequiuh para tlanechicoliztli tlacayotl huan tequiuh macehualtin, omochiuh ce tlahtolli macehualli oc tlaixmatili cemanahuac.</p>`,
  },
  'wangari-maathai': {
    term: 'Wangari Maathai',
    summary: 'Tepalehuiani tlalli huan tepalehuiani keniana (1940-2011), tlachihchiuhqui Movimiento Cinturón Verde, achto cihuatl africana oquicelic Nobel Yecyoliztli.',
    content: `<p><strong>Wangari Maathai</strong> oyeya achto cihuatl África Central huan Este oquicelic doctorado. Ipan 1977 oquichijchiuh <strong>Movimiento Cinturón Verde</strong>, tlein oquipaleuih titlatoquiz miac millón cuahuitl ipan Kenia, quintequipanoa cihuameh milchihqueh huan quixnamiqui tlacuahuitlapoloztli huan tlalli tlaixpoloztli.</p><p>Ipan 2004 omochiuh achto cihuatl africana oquicelic Premio Nobel Yecyoliztli, quineltoquiliz tlazaloliztli intzalan tlalli tlapaleuiliztli, tlahtocayotl macehualtin huan tequiuh cihuameh.</p>`,
  },
}