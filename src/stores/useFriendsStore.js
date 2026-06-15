import { create } from 'zustand'

// Friends list for the VR world: a simple list of player display names the
// user has added from the "Agregar amigo" option when selecting another
// player. Online status is derived live from useVrPresenceStore, not stored
// here — this only persists who counts as a friend.
export const useFriendsStore = create((set, get) => ({
  friends: [],

  addFriend: (name) => {
    if (!name) return
    set((state) => (state.friends.includes(name) ? state : { friends: [...state.friends, name] }))
  },

  removeFriend: (name) =>
    set((state) => ({ friends: state.friends.filter((f) => f !== name) })),

  isFriend: (name) => get().friends.includes(name),

  loadFriends: (friends) => set({ friends: Array.isArray(friends) ? friends : [] }),
}))
