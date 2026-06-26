import { useEffect } from 'react'
import { useAuthStore } from '../../stores/useAuthStore'
import { useAiCredentialsStore } from '../../stores/useAiCredentialsStore'
import { useMascotMemoryStore } from '../../stores/useMascotMemoryStore'

// Loads the user's saved AI/Notion connections (id/provider/model only,
// never the key — see useAiCredentialsStore.js) and long-term mascot
// memories once they're logged in. A separate component instead of wiring
// this into useAuthStore directly to avoid a circular import between the
// stores.
export default function AiCredentialsLoader() {
  const userId = useAuthStore((s) => s.user?.id)
  useEffect(() => {
    if (userId) {
      useAiCredentialsStore.getState().loadConnections()
      useMascotMemoryStore.getState().loadMemories()
    }
  }, [userId])
  return null
}
