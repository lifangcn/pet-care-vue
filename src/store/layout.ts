import { defineStore } from 'pinia'

interface LayoutState {
  sidebarCollapsed: boolean
  isMobile: boolean
}

export const useLayoutStore = defineStore('layout', {
  state: (): LayoutState => ({
    sidebarCollapsed: false,
    isMobile: false,
  }),
  getters: {
    sidebarWidth: (state) => {
      if (state.isMobile) return '0px'
      return '200px'
    },
    isSidebarVisible: (state) => {
      return !state.isMobile
    },
  },
  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    setSidebarCollapsed(collapsed: boolean) {
      this.sidebarCollapsed = collapsed
    },
    setMobile(isMobile: boolean) {
      this.isMobile = isMobile
      if (!isMobile) this.sidebarCollapsed = false
    },
  },
})

