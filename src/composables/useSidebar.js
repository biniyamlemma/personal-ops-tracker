import { reactive, inject, provide } from 'vue'

const SIDEBAR_KEY = Symbol('sidebar')

function createSidebarState() {
  return reactive({
    open: false,
    toggle() {
      this.open = !this.open
    },
    close() {
      this.open = false
    },
  })
}

export function provideSidebar() {
  const sidebar = createSidebarState()
  provide(SIDEBAR_KEY, sidebar)
  return sidebar
}

export function useSidebar() {
  return inject(SIDEBAR_KEY) ?? createSidebarState()
}
