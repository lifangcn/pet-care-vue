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
      return state.sidebarCollapsed ? '64px' : '200px'
    },
    isSidebarVisible: (state) => {
      return !state.isMobile || !state.sidebarCollapsed
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
      // 移动端时自动折叠侧边栏
      if (isMobile) {
        this.sidebarCollapsed = true
      }
    },
  },
})

