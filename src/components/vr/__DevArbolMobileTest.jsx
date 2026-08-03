import { useEffect } from 'react'
import { useAuthStore } from '../../stores/useAuthStore'
import { useTutorialStore } from '../../stores/useTutorialStore'
import { useGameStore } from '../../stores/useGameStore'

export default function __DevArbolMobileTest() {
  useEffect(() => {
    useAuthStore.setState({
      authReady: true,
      isUnlocked: true,
      session: { user: { id: 'dev-user' } },
      profile: { id: 'dev-user', role: 'admin', email: 'dev@test.com', display_name: 'Dev Test', account_status: 'active' },
    })
    useTutorialStore.setState({ done: ['meet_jafet'] })
    useGameStore.setState((s) => ({ player: { ...s.player, class: 'programmer' } }))
  }, [])
  return null
}
