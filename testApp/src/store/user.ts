import { acceptHMRUpdate, defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const userName = ref<string>('')

  function setUserName(name: string): void {
    userName.value = name
  }

  return {
    userName,
    setUserName,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
