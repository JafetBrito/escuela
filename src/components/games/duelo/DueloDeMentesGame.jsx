const GAME_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0a0a0f; color: #e2e8f0; font-family: 'Segoe UI', sans-serif; overflow: hidden; height: 100vh; }
.game { display: flex; flex-direction: column; height: 100vh; }
.arena { flex: 1; position: relative; background: radial-gradient(ellipse at center, #0d1a2e 0%, #060a14 100%); overflow: hidden; }
.bottom-bar { height: 130px; background: #080c18; border-top: 1px solid #1e2d4a; display: flex; gap: 0; }
.arena-label { position: absolute; font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; color: #ffffff20; font-weight: 700; }
.arena-line { position: absolute; width: 100%; height: 1px; background: linear-gradient(to right, transparent, #ffffff10, transparent); top: 50%; }
.lp-bar { position: absolute; top: 10px; left: 0; right: 0; display: flex; justify-content: space-between; padding: 0 14px; }
.lp-chip { display: flex; align-items: center; gap: 6px; background: #00000060; border: 1px solid #ffffff15; padding: 4px 10px; border-radius: 20px; }
.lp-name { font-size: 10px; font-weight: 700; color: #94a3b8; }
.lp-val { font-size: 13px; font-weight: 900; }
.lp-bar-fill { width: 80px; height: 4px; border-radius: 2px; background: #1e293b; overflow: hidden; }
.lp-bar-inner { height: 100%; border-radius: 2px; transition: width 0.5s; }
.field-top { position: absolute; top: 38px; left: 0; right: 0; display: flex; justify-content: center; gap: 8px; padding: 8px 16px; }
.field-bottom { position: absolute; bottom: 0; left: 0; right: 0; display: flex; justify-content: center; gap: 8px; padding: 8px 16px; }
.unit { width: 68px; cursor: pointer; position: relative; transition: transform 0.2s; }
.unit:hover { transform: translateY(-4px) scale(1.05); }
.unit-body { border-radius: 8px; overflow: hidden; border: 2px solid; }
.unit-art { width: 100%; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-size: 28px; position: relative; }
.unit-art::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 60%, #00000080); }
.unit-stats { padding: 3px 4px; display: flex; justify-content: space-between; }
.atk { font-size: 9px; font-weight: 800; color: #f97316; }
.def { font-size: 9px; font-weight: 800; color: #60a5fa; }
.unit-name { font-size: 8px; text-align: center; padding: 2px 2px 4px; font-weight: 700; color: #e2e8f0; background: #00000060; }
.unit-empty { width: 68px; height: 92px; border: 1px dashed #ffffff15; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; opacity: 0.3; }
.level-stars { position: absolute; top: 3px; left: 3px; font-size: 7px; z-index: 2; }
.atk-badge { position: absolute; bottom: 2px; right: 2px; background: #f9731620; border: 1px solid #f9731640; padding: 1px 3px; border-radius: 3px; font-size: 7px; font-weight: 800; color: #f97316; z-index: 2; }
.hand { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 12px; overflow: hidden; }
.hand-card { width: 60px; flex-shrink: 0; border-radius: 8px; border: 2px solid; overflow: hidden; cursor: pointer; transition: transform 0.15s; position: relative; }
.hand-card:hover { transform: translateY(-10px) scale(1.1); z-index: 10; }
.hand-card.selected { transform: translateY(-16px) scale(1.12); z-index: 20; }
.hand-card-art { width: 100%; aspect-ratio: 0.7; display: flex; align-items: center; justify-content: center; font-size: 22px; }
.hand-card-name { font-size: 7px; font-weight: 700; text-align: center; padding: 2px 2px 3px; background: #00000080; color: #e2e8f0; }
.side-panel { width: 160px; border-left: 1px solid #1e2d4a; display: flex; flex-direction: column; padding: 8px; gap: 6px; overflow: hidden; }
.phase-row { display: flex; gap: 4px; }
.phase-btn { flex: 1; padding: 4px 2px; text-align: center; font-size: 8px; font-weight: 700; border-radius: 4px; border: 1px solid; cursor: pointer; transition: all 0.2s; letter-spacing: 0.3px; }
.phase-btn.active-phase { background: #1d4ed8; border-color: #3b82f6; color: white; }
.phase-btn.done-phase { background: #166534; border-color: #22c55e; color: #86efac; }
.phase-btn.inactive-phase { background: #0f172a; border-color: #1e293b; color: #475569; }
.info-box { background: #0f172a; border: 1px solid #1e293b; border-radius: 6px; padding: 6px 8px; font-size: 10px; color: #94a3b8; line-height: 1.5; flex: 1; overflow: hidden; }
.info-box .title { font-size: 11px; font-weight: 800; color: #e2e8f0; margin-bottom: 4px; }
.info-box .effect { color: #a78bfa; font-style: italic; font-size: 9px; margin-top: 3px; }
.summon-btn { padding: 6px; background: #1d4ed8; border: none; border-radius: 6px; color: white; font-size: 10px; font-weight: 800; cursor: pointer; transition: background 0.2s; letter-spacing: 0.4px; }
.summon-btn:hover { background: #2563eb; }
.summon-btn:disabled { background: #1e293b; color: #475569; cursor: not-allowed; }
.attack-btn { padding: 5px; background: #7f1d1d; border: 1px solid #ef4444; border-radius: 6px; color: #fca5a5; font-size: 10px; font-weight: 800; cursor: pointer; transition: all 0.2s; }
.attack-btn:hover { background: #991b1b; }
.turn-btn { padding: 5px; background: #14532d; border: 1px solid #22c55e; border-radius: 6px; color: #86efac; font-size: 10px; font-weight: 800; cursor: pointer; }
.damage-fx { position: absolute; font-size: 28px; font-weight: 900; pointer-events: none; animation: floatUp 1.2s ease-out forwards; z-index: 100; }
@keyframes floatUp { 0% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-60px) scale(1.5); } }
.deck-zone { width: 48px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; border-right: 1px solid #1e2d4a; padding: 8px 4px; }
.deck-stack { width: 36px; height: 50px; position: relative; cursor: pointer; }
.deck-stack-card { position: absolute; width: 34px; height: 48px; border-radius: 5px; border: 1px solid; }
.deck-count { font-size: 9px; color: #64748b; font-weight: 700; }
.dev-banner { position: absolute; bottom: 8px; right: 8px; background: #7c3aed20; border: 1px solid #7c3aed50; padding: 3px 8px; border-radius: 6px; font-size: 9px; color: #a78bfa; font-weight: 700; letter-spacing: 0.5px; z-index: 50; }
</style>
</head>
<body>
<div class="game">
  <div class="arena" id="arena">
    <div class="arena-line"></div>
    <div class="arena-label" style="top:42px; left:16px;">Oponente</div>
    <div class="arena-label" style="bottom:8px; left:16px;">Tú</div>
    <div class="lp-bar">
      <div class="lp-chip">
        <span class="lp-name">ARISTÓTELES</span>
        <div class="lp-bar-fill"><div class="lp-bar-inner" id="lp-bar-opp" style="width:75%;background:#f87171"></div></div>
        <span class="lp-val" id="lp-opp" style="color:#f87171">6000</span>
      </div>
      <div class="lp-chip">
        <span class="lp-val" id="lp-me" style="color:#4ade80">8000</span>
        <div class="lp-bar-fill"><div class="lp-bar-inner" id="lp-bar-me" style="width:100%;background:#4ade80"></div></div>
        <span class="lp-name">MARIE CURIE</span>
      </div>
    </div>
    <div class="field-top" id="field-opp"></div>
    <div class="field-bottom" id="field-me"></div>
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#00000080;border:1px solid #ffffff20;padding:4px 12px;border-radius:20px;font-size:10px;font-weight:800;color:#a78bfa;letter-spacing:1px;" id="turn-label">TU TURNO — FASE PRINCIPAL</div>
    <div class="dev-banner">⚙ DEV ALPHA</div>
  </div>
  <div class="bottom-bar">
    <div class="deck-zone">
      <div class="deck-stack">
        <div class="deck-stack-card" style="background:#1e1b4b;border-color:#4f46e5;top:4px;left:2px;"></div>
        <div class="deck-stack-card" style="background:#1e1b4b;border-color:#4f46e5;top:2px;left:1px;"></div>
        <div class="deck-stack-card" style="background:#1e1b4b;border-color:#6366f1;top:0;left:0;display:flex;align-items:center;justify-content:center;font-size:14px;">🔮</div>
      </div>
      <span class="deck-count" id="deck-count">32</span>
    </div>
    <div class="hand" id="hand"></div>
    <div class="side-panel">
      <div class="phase-row">
        <div class="phase-btn done-phase">ROBAR</div>
        <div class="phase-btn active-phase" id="phase-main">MAIN</div>
        <div class="phase-btn inactive-phase" id="phase-battle">BATALLA</div>
        <div class="phase-btn inactive-phase" id="phase-end">FIN</div>
      </div>
      <div class="info-box" id="info-box">
        <div class="title" id="info-title">Selecciona una carta</div>
        <div id="info-body" style="color:#64748b;font-size:9px">Haz clic en una carta de tu mano para ver sus datos.</div>
        <div class="effect" id="info-effect"></div>
      </div>
      <button class="summon-btn" id="summon-btn" disabled onclick="summonCard()">⬆ INVOCAR</button>
      <button class="attack-btn" id="attack-btn" disabled onclick="doAttack()">⚔ ATACAR</button>
      <button class="turn-btn" onclick="endTurn()">➤ FIN DE TURNO</button>
    </div>
  </div>
</div>
<script>
const CARDS=[{id:'curie',name:'Marie Curie',emoji:'👩‍🔬',color:'#7c3aed',bg:'#1e1b4b',atk:2400,def:2000,level:6,type:'Científica',effect:'Radiación X: Reduce DEF del oponente en 500 al ser invocada.'},{id:'turing',name:'Alan Turing',emoji:'💻',color:'#0ea5e9',bg:'#0c1a2e',atk:2100,def:1600,level:5,type:'Matemático/Hacker',effect:'Máquina Universal: Al destruir una carta, roba 1 carta del deck.'},{id:'lovelace',name:'Ada Lovelace',emoji:'🖥️',color:'#d946ef',bg:'#2a0a2e',atk:1800,def:1400,level:4,type:'Programadora',effect:'Primer Algoritmo: Puedes ver las 2 próximas cartas del deck oponente.'},{id:'euler',name:'Leonhard Euler',emoji:'∞',color:'#f59e0b',bg:'#1c1208',atk:2200,def:1900,level:5,type:'Matemático',effect:'Fórmula de Euler: eⁱᵖ+1=0 — Niega el efecto de una carta mágica.'},{id:'darwin',name:'Charles Darwin',emoji:'🦋',color:'#22c55e',bg:'#0a1a0a',atk:1900,def:2100,level:5,type:'Científico',effect:'Selección Natural: Cada turno que sobrevive, gana +200 ATK acumulativo.'}];
const OPP_FIELD=[{id:'aristotle',name:'Aristóteles',emoji:'🏛️',color:'#dc2626',bg:'#1a0505',atk:2000,def:1700,level:5,type:'Filósofo',effect:'Lógica Aristotélica: Niega la primera habilidad activada por turno.'},null,{id:'plato',name:'Platón',emoji:'💎',color:'#8b5cf6',bg:'#150a2e',atk:1700,def:2200,level:4,type:'Filósofo',effect:'Mundo de las Ideas: En modo defensa no puede ser destruido por batalla.'},null,null];
let hand=[...CARDS],myField=[null,null,null,null,null],selectedCard=null,selectedFieldSlot=null,phase='main',deckCount=32,oppLp=6000,meLp=8000;
function stars(n){return'★'.repeat(n)}
function renderOppField(){const el=document.getElementById('field-opp');el.innerHTML='';OPP_FIELD.forEach((card,i)=>{if(!card){const e=document.createElement('div');e.className='unit-empty';e.textContent='+';el.appendChild(e);}else{el.appendChild(makeUnit(card,false,i));}})}
function makeUnit(card,isMe,idx){const div=document.createElement('div');div.className='unit';div.style.color=card.color;div.onclick=()=>isMe?selectFieldUnit(idx):attackTarget(idx);div.innerHTML=\`<div class="unit-body" style="border-color:\${card.color}"><div class="unit-art" style="background:\${card.bg}"><span style="font-size:28px">\${card.emoji}</span><span class="level-stars" style="color:\${card.color}">\${stars(card.level)}</span><span class="atk-badge">\${card.atk}</span></div><div class="unit-stats"><span class="atk">\${card.atk}</span><span class="def">\${card.def}</span></div><div class="unit-name">\${card.name.split(' ').pop()}</div></div>\`;return div}
function renderMyField(){const el=document.getElementById('field-me');el.innerHTML='';myField.forEach((card,i)=>{if(!card){const e=document.createElement('div');e.className='unit-empty';e.textContent=selectedCard!==null?'↓':'+';e.onclick=()=>summonToSlot(i);e.style.cursor=selectedCard!==null?'pointer':'default';if(selectedCard!==null){e.style.borderColor='#3b82f680';e.style.opacity='0.7';}el.appendChild(e);}else{el.appendChild(makeUnit(card,true,i));}})}
function renderHand(){const el=document.getElementById('hand');el.innerHTML='';hand.forEach((card,i)=>{const div=document.createElement('div');div.className=\`hand-card\${selectedCard===i?' selected':''}\`;div.style.borderColor=card.color;div.onclick=()=>selectHandCard(i);div.innerHTML=\`<div class="hand-card-art" style="background:\${card.bg}"><span>\${card.emoji}</span></div><div class="hand-card-name" style="color:\${card.color}">\${card.name}</div>\`;el.appendChild(div);})}
function selectHandCard(i){if(phase!=='main')return;selectedCard=(selectedCard===i)?null:i;selectedFieldSlot=null;const c=selectedCard!==null?hand[i]:null;document.getElementById('info-title').textContent=c?c.name:'Selecciona una carta';document.getElementById('info-body').textContent=c?\`★×\${c.level} | \${c.type} | ATK: \${c.atk} | DEF: \${c.def}\`:'Haz clic en una carta de tu mano.';document.getElementById('info-effect').textContent=c?c.effect:'';document.getElementById('summon-btn').disabled=!c;document.getElementById('attack-btn').disabled=true;renderMyField();renderHand();}
function selectFieldUnit(i){if(phase!=='battle')return;selectedFieldSlot=i;const c=myField[i];if(!c)return;document.getElementById('info-title').textContent=c.name;document.getElementById('info-body').textContent=\`ATK: \${c.atk} | DEF: \${c.def} — Selecciona un objetivo oponente\`;document.getElementById('attack-btn').disabled=false;}
function summonCard(){if(selectedCard===null)return;renderMyField();}
function summonToSlot(slotIdx){if(selectedCard===null)return;const card=hand[selectedCard];myField[slotIdx]=card;hand.splice(selectedCard,1);selectedCard=null;document.getElementById('info-title').textContent='¡'+card.name+' invocado!';document.getElementById('info-body').textContent=card.effect;document.getElementById('summon-btn').disabled=true;document.getElementById('attack-btn').disabled=true;renderHand();renderMyField();}
function attackTarget(targetIdx){if(phase!=='battle')return;if(selectedFieldSlot===null){document.getElementById('info-body').textContent='Primero selecciona una de tus unidades en el campo.';return;}const attacker=myField[selectedFieldSlot];const defender=OPP_FIELD[targetIdx];if(!attacker)return;if(!defender){const dmg=attacker.atk;dealDamage('opp',dmg);spawnFx(true,dmg);document.getElementById('info-title').textContent='⚔ Ataque directo!';document.getElementById('info-body').textContent=\`\${attacker.name} golpea directo. \${dmg} de daño.\`;return;}if(attacker.atk>defender.atk){OPP_FIELD[targetIdx]=null;const excess=attacker.atk-defender.atk;dealDamage('opp',excess);spawnFx(true,excess);document.getElementById('info-title').textContent='💥 ¡'+defender.name+' destruido!';document.getElementById('info-body').textContent=\`\${attacker.name} supera por \${excess}. Daño al oponente.\`;renderOppField();}else if(attacker.atk<defender.def){const dmg=defender.def-attacker.atk;dealDamage('me',dmg);spawnFx(false,dmg);document.getElementById('info-title').textContent='🛡 Ataque fallido';document.getElementById('info-body').textContent=\`\${defender.name} aguanta. -\${dmg} de tus LP.\`;}else{document.getElementById('info-title').textContent='🤝 Empate';OPP_FIELD[targetIdx]=null;myField[selectedFieldSlot]=null;renderOppField();renderMyField();}selectedFieldSlot=null;document.getElementById('attack-btn').disabled=true;}
function doAttack(){document.getElementById('info-body').textContent='Haz clic en una unidad oponente para atacar.';}
function spawnFx(isOpp,dmg){const arena=document.getElementById('arena');const el=document.createElement('div');el.className='damage-fx';el.textContent='-'+dmg;el.style.color=isOpp?'#f87171':'#fbbf24';el.style.left=isOpp?'40%':'55%';el.style.top=isOpp?'35%':'55%';arena.appendChild(el);setTimeout(()=>el.remove(),1300);}
function dealDamage(who,dmg){if(who==='opp'){oppLp=Math.max(0,oppLp-dmg);document.getElementById('lp-opp').textContent=oppLp;document.getElementById('lp-bar-opp').style.width=(oppLp/8000*100)+'%';if(oppLp===0)setTimeout(()=>alert('🏆 ¡Victoria! Marie Curie derrota a Aristóteles.'),400);}else{meLp=Math.max(0,meLp-dmg);document.getElementById('lp-me').textContent=meLp;document.getElementById('lp-bar-me').style.width=(meLp/8000*100)+'%';if(meLp===0)setTimeout(()=>alert('💀 ¡Derrota! Aristóteles gana esta ronda.'),400);}}
function endTurn(){if(phase==='main'){phase='battle';document.getElementById('phase-main').className='phase-btn done-phase';document.getElementById('phase-battle').className='phase-btn active-phase';document.getElementById('turn-label').textContent='TU TURNO — FASE DE BATALLA';document.getElementById('info-title').textContent='Fase de Batalla';document.getElementById('info-body').textContent='Selecciona una de tus unidades, luego haz clic en el objetivo oponente.';document.getElementById('info-effect').textContent='';}else if(phase==='battle'){phase='end';document.getElementById('phase-battle').className='phase-btn done-phase';document.getElementById('phase-end').className='phase-btn active-phase';document.getElementById('turn-label').textContent='TURNO DEL OPONENTE';document.getElementById('info-title').textContent='Turno de Aristóteles';document.getElementById('info-body').textContent='El oponente está pensando...';document.getElementById('attack-btn').disabled=true;document.getElementById('summon-btn').disabled=true;setTimeout(()=>{const aliveOpp=OPP_FIELD.filter(Boolean);const aliveMe=myField.filter(Boolean);if(aliveOpp.length&&aliveMe.length){const att=aliveOpp[0];const def=aliveMe[0];if(att.atk>def.atk){myField[myField.indexOf(def)]=null;dealDamage('me',att.atk-def.atk);spawnFx(false,att.atk-def.atk);document.getElementById('info-body').textContent=att.name+' destruye a '+def.name+'.';renderMyField();}else{document.getElementById('info-body').textContent=def.name+' aguanta el ataque de '+att.name+'.';};}else if(aliveOpp.length&&!aliveMe.length){const att=aliveOpp[0];dealDamage('me',att.atk);spawnFx(false,att.atk);document.getElementById('info-body').textContent=att.name+' ataca directo. -'+att.atk+' LP.';}setTimeout(()=>startMyTurn(),800);},900);}}
function startMyTurn(){phase='main';if(deckCount>0&&CARDS.length>hand.length){hand.push({...CARDS[Math.floor(Math.random()*CARDS.length)]});deckCount--;document.getElementById('deck-count').textContent=deckCount;}document.getElementById('phase-main').className='phase-btn active-phase';document.getElementById('phase-battle').className='phase-btn inactive-phase';document.getElementById('phase-end').className='phase-btn inactive-phase';document.getElementById('turn-label').textContent='TU TURNO — FASE PRINCIPAL';document.getElementById('info-title').textContent='Tu turno';document.getElementById('info-body').textContent='Robaste una carta. Invoca y ataca.';document.getElementById('info-effect').textContent='';renderHand();renderMyField();}
renderOppField();renderMyField();renderHand();
</script>
</body>
</html>`

export default function DueloDeMentesGame() {
  return (
    <iframe
      srcDoc={GAME_HTML}
      title="Duelo de Mentes — Dev Alpha"
      style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
      sandbox="allow-scripts"
    />
  )
}
