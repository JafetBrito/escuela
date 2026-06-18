import { create } from 'zustand'
import { SKILL_REGISTRY } from '../data/skillRegistry'
import { getRandomQuestion } from '../data/battleQuestions'
import { useGameStore } from './useGameStore'
import { useLevelStore } from './useLevelStore'
import { useCurrencyStore } from './useCurrencyStore'

// ponytail: energyCost thresholds proxy for damage — add explicit baseDamage to
// skillRegistry if balancing matters later
function skillDamage(skillId) {
  const sk = SKILL_REGISTRY[skillId]
  if (!sk) return 15
  if (sk.energyCost >= 35) return 50
  if (sk.energyCost >= 20) return 28
  return 15
}

let _timer = null
function clearTimer() { clearInterval(_timer); _timer = null }

export const useCombatStore = create((set, get) => ({
  active:        false,
  phase:         'idle',   // player_turn | asking | resolving | enemy_turn | victory | defeat
  enemy:         null,
  enemyHp:       0,
  enemyMaxHp:    0,
  playerHp:      0,
  playerMaxHp:   0,
  playerEnergy:  0,
  playerMaxEnergy: 0,
  pendingSkillId: null,
  question:      null,
  timeLeft:      10,
  eliminated:    [],       // option indices removed by debug_pulse skill
  log:           [],
  rewards:       null,

  startBattle(enemy) {
    clearTimer()
    const { player } = useGameStore.getState()
    set({
      active: true, phase: 'player_turn', enemy,
      enemyHp: enemy.battleStats.hp, enemyMaxHp: enemy.battleStats.hp,
      playerHp: player.hp.current, playerMaxHp: player.hp.max,
      playerEnergy: player.energy.current, playerMaxEnergy: player.energy.max,
      pendingSkillId: null, question: null, timeLeft: 10, eliminated: [],
      log: [`⚔️ ¡${enemy.name} te desafía a un duelo!`],
      rewards: null,
    })
  },

  selectSkill(skillId) {
    const { playerEnergy, phase } = get()
    if (phase !== 'player_turn') return
    const sk = SKILL_REGISTRY[skillId]
    if (!sk) return
    if (sk.energyCost > playerEnergy) {
      set(s => ({ log: [`⚡ Sin energía para ${sk.name}`, ...s.log.slice(0, 8)] }))
      return
    }
    const { enemy } = get()
    const q = getRandomQuestion(enemy?.battleStats?.questionCategory)
    // debug_pulse: pre-eliminate one wrong answer before question shows
    const preElim = skillId === 'debug_pulse' ? [_wrongOptionExcept(q, [])] : []
    set({ phase: 'asking', pendingSkillId: skillId, question: q, timeLeft: 10, eliminated: preElim })
    _startTimer(set, get)
  },

  submitAnswer(optionIndex) {
    clearTimer()
    const { question, pendingSkillId, enemyHp, playerEnergy } = get()
    if (!question || !pendingSkillId) return

    const sk = SKILL_REGISTRY[pendingSkillId]
    const correct = optionIndex === question.correct
    const hit = correct || Math.random() < 0.5   // 50% chance on wrong answer
    const dmg = hit ? skillDamage(pendingSkillId) : 0
    const newEnemyHp = Math.max(0, enemyHp - dmg)
    const newEnergy  = Math.max(0, playerEnergy - sk.energyCost)

    const entry = correct
      ? `✅ ¡Correcto! ${sk.icon} ${sk.name} → ${dmg} daño`
      : hit
        ? `⚠️ Incorrecto, pero el golpe conectó por suerte → ${dmg} daño`
        : `❌ Incorrecto — ¡${sk.name} falló!`

    set(s => ({
      phase: 'resolving', enemyHp: newEnemyHp, playerEnergy: newEnergy,
      pendingSkillId: null, question: null,
      log: [entry, ...s.log.slice(0, 8)],
    }))

    if (newEnemyHp <= 0) { get()._victory(); return }
    setTimeout(() => get()._enemyTurn(), 1400)
  },

  endBattle() {
    clearTimer()
    const { playerHp } = get()
    useGameStore.getState().setCurrentHp(playerHp)
    set({ active: false, phase: 'idle', enemy: null, rewards: null })
  },

  // ── internal ────────────────────────────────────────────────────────────

  _enemyTurn() {
    const { enemy, playerHp } = get()
    const dmg = Math.floor(Math.random() * (enemy.battleStats.maxDamage ?? 12) + (enemy.battleStats.minDamage ?? 6))
    const newHp = Math.max(0, playerHp - dmg)
    set(s => ({
      phase: 'player_turn', playerHp: newHp,
      log: [`💀 ${enemy.name} ataca → ${dmg} daño`, ...s.log.slice(0, 8)],
    }))
    if (newHp <= 0) get()._defeat()
  },

  _victory() {
    const { enemy } = get()
    const xp    = enemy?.battleStats?.xpReward    ?? 60
    const coins = enemy?.battleStats?.coinReward  ?? 600
    useLevelStore.getState().addXp(xp)
    useCurrencyStore.getState().earnCoins(coins)
    set({ phase: 'victory', rewards: { xp, coins } })
  },

  _defeat() {
    const { playerMaxHp } = get()
    set(s => ({
      phase: 'defeat',
      playerHp: Math.floor(playerMaxHp * 0.5),   // penalty: restore to 50%
      log: ['💔 Fuiste derrotado…', ...s.log.slice(0, 8)],
    }))
  },
}))

// ── helpers ──────────────────────────────────────────────────────────────────

function _wrongOptionExcept(question, alreadyEliminated) {
  const wrong = [0, 1, 2, 3].filter(i => i !== question.correct && !alreadyEliminated.includes(i))
  return wrong[Math.floor(Math.random() * wrong.length)]
}

function _startTimer(set, get) {
  clearTimer()
  _timer = setInterval(() => {
    const { timeLeft, phase } = get()
    if (phase !== 'asking') { clearTimer(); return }
    if (timeLeft <= 1) {
      clearTimer()
      const { pendingSkillId, playerEnergy } = get()
      const sk = SKILL_REGISTRY[pendingSkillId] ?? { energyCost: 0 }
      set(s => ({
        phase: 'resolving',
        playerEnergy: Math.max(0, playerEnergy - sk.energyCost),
        pendingSkillId: null, question: null,
        log: ['⏰ ¡Tiempo agotado! Perdiste el turno.', ...s.log.slice(0, 8)],
      }))
      setTimeout(() => get()._enemyTurn(), 1000)
      return
    }
    set({ timeLeft: timeLeft - 1 })
  }, 1000)
}
