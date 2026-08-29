import { useState } from 'react'
import { PLAYER_CLASSES } from '../../stores/useGameStore'
import { useI18n } from '../../i18n'

// Selector de clase canónico (estilo WoW: lista + panel de detalle). ÚNICO
// componente de selección de clase del juego — el Templo tutorial y (próximamente)
// el resto de flujos lo reutilizan, en vez de reimplementar la UI. Solo elige la
// clase del AVATAR; la mascota se elige en VrMascotOnboarding, y la selección se
// persiste vía useGameStore.selectPlayerClass (que fuerza guardado en la nube).
//
// props: isAdmin (habilita la clase Hacker), onSelect(classId), onClose (opcional).

// Comentario de Oliver por clase, mostrado al previsualizar cada una.
const OLIVER_CLASS_LINES = {
  warrior:  '¿Guerrero? Eso es lo mío — pelear con garras afiladas. Aunque yo uso las patas. ⚔️🐱',
  paladin:  'Paladín, fuerza y luz en uno. Yo también soy fuente de luz (la que bloquea tu sueño a las 3 AM). 🛡️',
  hunter:   'Cazador. Rastrear presas… igual que yo cuando acecho al cursor del mouse por horas. 🏹',
  rogue:    'Pícaro, ¿eh? Sigiloso y astuto, justo como cuando me acerco sin hacer ruido y te asusto. 🗡️',
  priest:   'Sacerdote, el que sostiene al equipo. Yo sostengo el sofá. Una gran responsabilidad. ✨',
  shaman:   'Chamán, ¡el que habla con los elementos! Yo le hablo a la croqueta y ella nunca responde. ⚡',
  mage:     'Mago, el pensador de largo alcance. Yo también predigo cosas… como cuándo me vas a dar atún. 🔮',
  warlock:  'Brujo… invocas sombras y demonios. Yo invoco atención a las 3 AM. Básicamente somos iguales. 🌑',
  druid:    'Druida, maestro de las formas. Yo también tengo muchas formas: dormido, hambriento y caótico. 🌿',
}

// Versión en inglés de las mismas líneas — mismo criterio que
// vrNpcTranslations.js (lookup paralelo por id, nunca se toca el original).
const OLIVER_CLASS_LINES_EN = {
  warrior:  'Warrior? That\'s my thing — fighting with sharp claws. Though I use paws. ⚔️🐱',
  paladin:  'Paladin, strength and light in one. I\'m also a light source (the one blocking your sleep at 3 AM). 🛡️',
  hunter:   'Hunter. Tracking prey… just like me when I stalk the mouse cursor for hours. 🏹',
  rogue:    'Rogue, huh? Stealthy and cunning, just like when I sneak up without a sound and scare you. 🗡️',
  priest:   'Priest, the one who holds the team together. I hold the couch together. A huge responsibility. ✨',
  shaman:   'Shaman, the one who talks to the elements! I talk to my treat and it never answers. ⚡',
  mage:     'Mage, the long-range thinker. I predict things too… like when you\'re going to give me tuna. 🔮',
  warlock:  'Warlock… you summon shadows and demons. I summon attention at 3 AM. Basically the same thing. 🌑',
  druid:    'Druid, master of shapeshifting. I also have many shapes: asleep, hungry, and chaotic. 🌿',
}

// Version en français des mêmes lignes — même critère que
// vrNpcTranslations.js (lookup parallèle par id, l'original n'est jamais touché).
const OLIVER_CLASS_LINES_FR = {
  warrior:  'Guerrier ? C\'est mon truc — se battre avec des griffes acérées. Sauf que moi j\'utilise mes pattes. ⚔️🐱',
  paladin:  'Paladin, force et lumière en un seul. Moi aussi je suis une source de lumière (celle qui t\'empêche de dormir à 3h du matin). 🛡️',
  hunter:   'Chasseur. Traquer des proies… un peu comme moi quand je guette le curseur de la souris pendant des heures. 🏹',
  rogue:    'Voleur, hein ? Furtif et rusé, tout comme quand je m\'approche sans bruit pour te faire peur. 🗡️',
  priest:   'Prêtre, celui qui soude l\'équipe. Moi je soude le canapé. Une lourde responsabilité. ✨',
  shaman:   'Chaman, celui qui parle aux éléments ! Moi je parle à ma croquette et elle ne répond jamais. ⚡',
  mage:     'Mage, celui qui pense à long terme. Moi aussi je prédis des choses… comme le moment où tu vas me donner du thon. 🔮',
  warlock:  'Démoniste… tu invoques des ombres et des démons. Moi j\'invoque de l\'attention à 3h du matin. En gros, c\'est pareil. 🌑',
  druid:    'Druide, maître des formes. Moi aussi j\'ai plein de formes : endormi, affamé et chaotique. 🌿',
}

// Versione in italiano delle stesse battute — stesso criterio di
// vrNpcTranslations.js (lookup parallelo per id, l'originale non si tocca mai).
const OLIVER_CLASS_LINES_IT = {
  warrior:  'Guerriero? È il mio pane — combattere con artigli affilati. Anche se io uso le zampe. ⚔️🐱',
  paladin:  'Paladino, forza e luce in uno. Anch\'io sono una fonte di luce (quella che ti impedisce di dormire alle 3 del mattino). 🛡️',
  hunter:   'Cacciatore. Braccare prede… proprio come me quando do la caccia al cursore del mouse per ore. 🏹',
  rogue:    'Ladro, eh? Furtivo e astuto, proprio come quando mi avvicino senza far rumore e ti spavento. 🗡️',
  priest:   'Sacerdote, quello che tiene unita la squadra. Io tengo unito il divano. Una grande responsabilità. ✨',
  shaman:   'Sciamano, quello che parla con gli elementi! Io parlo con la crocchetta e lei non risponde mai. ⚡',
  mage:     'Mago, il pensatore a lungo raggio. Anch\'io predico le cose… tipo quando mi darai il tonno. 🔮',
  warlock:  'Stregone… evochi ombre e demoni. Io evoco attenzione alle 3 del mattino. Praticamente la stessa cosa. 🌑',
  druid:    'Druido, maestro delle forme. Anch\'io ho tante forme: addormentato, affamato e caotico. 🌿',
}

// Versió en català de les mateixes frases — mateix criteri que
// vrNpcTranslations.js (lookup paral·lel per id, l'original no es toca mai).
const OLIVER_CLASS_LINES_CA = {
  warrior:  'Guerrer? Això és cosa meva — lluitar amb urpes esmolades. Encara que jo faig servir les potes. ⚔️🐱',
  paladin:  'Paladí, força i llum en un. Jo també sóc font de llum (la que et bloqueja el son a les 3 de la matinada). 🛡️',
  hunter:   'Caçador. Rastrejar preses… igual que jo quan aguaito el cursor del ratolí durant hores. 🏹',
  rogue:    'Pícaro, eh? Sigil·lós i astut, tal com quan m\'apropo sense fer soroll i t\'espanto. 🗡️',
  priest:   'Sacerdot, el que sosté l\'equip. Jo sostinc el sofà. Una gran responsabilitat. ✨',
  shaman:   'Xaman, el que parla amb els elements! Jo li parlo al pinso i mai em respon. ⚡',
  mage:     'Mag, el pensador de llarg abast. Jo també predic coses… com quan em donaràs tonyina. 🔮',
  warlock:  'Bruixot… invoques ombres i dimonis. Jo invoco atenció a les 3 de la matinada. Bàsicament el mateix. 🌑',
  druid:    'Druida, mestre de les formes. Jo també tinc moltes formes: adormit, famolenc i caòtic. 🌿',
}

// 日本語版の同じセリフ — vrNpcTranslations.js と同じ方針（idによる並行ルック
// アップ、オリジナルには一切触れない）。
const OLIVER_CLASS_LINES_JA = {
  warrior:  '戦士？それは僕の得意分野だ — 鋭い爪で戦うのさ。まあ僕は肉球を使うけどね。⚔️🐱',
  paladin:  '聖騎士、力と光が一つになった存在。僕も光源だよ（朝3時に君の眠りを妨げるやつね）。🛡️',
  hunter:   '狩人。獲物を追う…僕がマウスカーソルを何時間も狙っているのと同じだね。🏹',
  rogue:    '盗賊、へえ？忍び足で狡猾、まさに僕が音を立てずに近づいて君を驚かせるときと同じだ。🗡️',
  priest:   '司祭、チームを支える存在。僕はソファを支えているよ。大きな責任だ。✨',
  shaman:   'シャーマン、精霊と話す者！僕はおやつに話しかけるけど、絶対返事してくれないんだ。⚡',
  mage:     '魔法使い、長期的に考える者。僕も予知するよ…君がいつマグロをくれるかとかね。🔮',
  warlock:  '魔術師…影と悪魔を召喚するんだね。僕は朝3時に注目を召喚するよ。基本的に同じだ。🌑',
  druid:    'ドルイド、姿を変える達人。僕にもたくさんの姿があるよ：寝ている、腹ペコ、そしてカオス。🌿',
}

// 同じセリフの中国語（簡体字）版 — vrNpcTranslations.js と同じ方針（idによる
// 並行ルックアップ、オリジナルには触れない）。
const OLIVER_CLASS_LINES_ZH = {
  warrior:  '战士？那可是我的强项——用锋利的爪子战斗。虽然我用的是爪垫。⚔️🐱',
  paladin:  '圣骑士，力量与光明合一。我也是一种光源哦（凌晨3点让你睡不着的那种）。🛡️',
  hunter:   '猎人。追踪猎物……就像我盯着鼠标光标一追就是好几个小时一样。🏹',
  rogue:    '盗贼，是吗？潜行又狡猾，就像我悄无声息地靠近然后吓你一跳的时候。🗡️',
  priest:   '牧师，维系团队的人。我维系着沙发。责任重大啊。✨',
  shaman:   '萨满，和元素对话的人！我跟猫粮说话，它可从来不回答我。⚡',
  mage:     '法师，长远思考的人。我也会预知一些事情……比如你什么时候给我金枪鱼。🔮',
  warlock:  '术士……你召唤阴影和恶魔。我在凌晨3点召唤别人的注意力。基本上是一回事。🌑',
  druid:    '德鲁伊，变形大师。我也有很多形态：睡着的、饿肚子的，还有一团乱的。🌿',
}

export default function ClassPicker({ isAdmin, onSelect, onClose }) {
  const { t, lang } = useI18n()
  const classes = Object.values(PLAYER_CLASSES).filter((c) => c.id !== 'hacker' || isAdmin)
  const [selectedId, setSelectedId] = useState(classes[0]?.id ?? null)
  const cls = PLAYER_CLASSES[selectedId]
  const oliverLine = (lang === 'en' ? OLIVER_CLASS_LINES_EN : lang === 'fr' ? OLIVER_CLASS_LINES_FR : lang === 'it' ? OLIVER_CLASS_LINES_IT : lang === 'ca' ? OLIVER_CLASS_LINES_CA : lang === 'ja' ? OLIVER_CLASS_LINES_JA : lang === 'zh' ? OLIVER_CLASS_LINES_ZH : OLIVER_CLASS_LINES)[selectedId]

  return (
    <div className="fixed inset-0 z-[200] flex flex-col select-none" style={{ background: 'linear-gradient(160deg,#0a0407 0%,#140a12 100%)' }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.25em]" style={{ color: '#c79c6e' }}>Oliver Academy</p>
          <p className="text-lg font-black text-white">{t('vr.hud.classPicker.title')}</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="hidden text-[10px] sm:block" style={{ color: 'rgba(255,255,255,0.25)' }}>{t('vr.hud.classPicker.subtitle')}</p>
          {onClose && (
            <button type="button" onClick={onClose}
              className="rounded-xl px-3 py-1.5 text-xs font-bold transition-colors"
              style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: class list */}
        <div className="w-44 shrink-0 overflow-y-auto border-r p-2 sm:w-52" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {classes.map((c) => (
            <button key={c.id} type="button" onClick={() => setSelectedId(c.id)}
              className="mb-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all"
              style={{
                background: selectedId === c.id ? `${c.color}1a` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${selectedId === c.id ? c.color : 'rgba(255,255,255,0.07)'}`,
              }}>
              <span className="text-xl shrink-0">{c.icon}</span>
              <div className="min-w-0">
                <p className="truncate text-xs font-black" style={{ color: selectedId === c.id ? c.color : 'rgba(255,255,255,0.85)' }}>{c.name}</p>
                <p className="truncate text-[8px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{c.role}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Right: detail panel */}
        {cls && (
          <div className="flex-1 overflow-y-auto p-5">
            {/* Class header */}
            <div className="mb-4 flex items-center gap-4">
              <span className="text-5xl">{cls.icon}</span>
              <div>
                <p className="text-2xl font-black" style={{ color: cls.color }}>{cls.name}</p>
                <span className="mt-1 inline-block rounded-full px-3 py-0.5 text-[10px] font-black"
                  style={{ background: `${cls.color}22`, color: cls.color, border: `1px solid ${cls.color}44` }}>
                  {cls.role}
                </span>
              </div>
            </div>

            {/* Lore */}
            <p className="mb-5 max-w-lg text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{cls.lore}</p>

            {/* Stats + meta */}
            <div className="mb-5 flex gap-5">
              {/* Stat bars */}
              <div className="flex-1">
                <p className="mb-2 text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('vr.hud.classPicker.stats')}</p>
                <div className="flex flex-col gap-2">
                  {Object.entries(cls.baseStats).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="w-20 text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{t(`vr.hud.classPicker.statLabels.${key}`)}</span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.round((val / 25) * 100)}%`, background: cls.color }} />
                      </div>
                      <span className="w-5 text-right text-[10px] font-black" style={{ color: 'rgba(255,255,255,0.5)' }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meta: resource + armor */}
              <div className="w-36 shrink-0 flex flex-col gap-3">
                <div>
                  <p className="mb-1 text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('vr.hud.classPicker.resource')}</p>
                  <p className="text-sm font-bold" style={{ color: cls.resourceType === 'rage' ? '#f97316' : cls.resourceType === 'energy' ? '#eab308' : '#69ccf0' }}>
                    {cls.resourceType === 'rage' ? t('vr.hud.classPicker.rage') : cls.resourceType === 'energy' ? t('vr.hud.classPicker.energy') : t('vr.hud.classPicker.mana')}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('vr.hud.classPicker.armor')}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{cls.armor}</p>
                </div>
                <div>
                  <p className="mb-1 text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('vr.hud.classPicker.weapons')}</p>
                  <p className="text-[10px] leading-snug" style={{ color: 'rgba(255,255,255,0.5)' }}>{cls.weapons.join(', ')}</p>
                </div>
              </div>
            </div>

            {/* Signature abilities */}
            <div className="mb-5">
              <p className="mb-2 text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('vr.hud.classPicker.abilities')}</p>
              <div className="flex gap-2">
                {cls.signatureAbilities.map((ab) => (
                  <div key={ab.id} className="flex-1 rounded-xl px-3 py-2.5"
                    style={{ border: `1px solid ${cls.color}33`, background: `${cls.color}08` }}>
                    <p className="mb-1 text-xs font-black" style={{ color: 'rgba(255,255,255,0.9)' }}>{ab.name}</p>
                    <p className="text-[9px] leading-snug" style={{ color: 'rgba(255,255,255,0.45)' }}>{ab.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Oliver comment */}
            {oliverLine && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl px-3.5 py-2.5"
                style={{ border: '1px solid rgba(251,146,60,0.25)', background: 'rgba(251,146,60,0.06)' }}>
                <span className="text-xl shrink-0">🐱</span>
                <p className="text-[11px] italic leading-snug" style={{ color: 'rgba(253,186,116,0.8)' }}>{oliverLine}</p>
              </div>
            )}

            {/* Confirm */}
            <button type="button" onClick={() => onSelect(selectedId)}
              className="w-full rounded-2xl py-3.5 text-base font-black transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg, ${cls.color} 0%, ${cls.color}cc 100%)`, color: '#0a0407' }}>
              {t('vr.hud.classPicker.confirm', { name: cls.name })}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
