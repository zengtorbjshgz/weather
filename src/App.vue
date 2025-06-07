<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import type { DefineComponent } from 'vue'
import SideNavigation from './components/SideNavigation.vue'

const router = useRouter()

interface MenuItem {
  id: string
  label: string
  icon: DefineComponent
  active?: boolean
  route?: string
}

// 处理导航点击
const handleNavigation = (item: MenuItem) => {
  console.log('Navigation clicked:', item)
  
  if (item.route) {
    router.push(item.route)
  } else if (item.id === 'logout') {
    // 处理登出逻辑
    console.log('Logout clicked')
  }
}
</script>

<template>
  <div id="app" class="md-surface">
    <div class="app-layout">
      <!-- 侧边导航 -->
      <SideNavigation @item-click="handleNavigation" />
      
      <!-- 主内容区域 -->
      <main class="main-content md-surface">
        <header class="app-header md-surface md-elevation-1">
          <div class="header-content">
            <div class="logo-section">
              <div class="logo-container md-primary-container md-shape-corner-large">
                <img alt="天气应用" class="logo" src="./assets/logo.svg" width="32" height="32" />
              </div>
              <h1 class="app-title md-typescale-headline-large">天气信息</h1>
            </div>
          </div>
        </header>
        
        <div class="content-wrapper">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
#app {
  height: 100vh;
  overflow: hidden;
}

.app-layout {
  display: flex;
  height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-header {
  position: relative;
  z-index: 4;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.header-content {
  padding: 16px 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.logo-container:hover {
  transform: scale(1.05);
}

.logo {
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.app-title {
  margin: 0;
  color: var(--md-sys-color-on-surface);
  font-weight: 400;
}

.content-wrapper {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: var(--md-sys-color-surface-container-low);
}

/* Material Design 3 响应式设计 */
@media (max-width: 840px) {
  .app-layout {
    flex-direction: column;
  }
  
  .header-content {
    padding: 12px 16px;
  }
  
  .logo-section {
    gap: 12px;
  }
  
  .logo-container {
    width: 48px;
    height: 48px;
  }
  
  .logo {
    width: 28px;
    height: 28px;
  }
  
  .app-title {
    font-size: 24px;
    line-height: 32px;
  }
  
  .content-wrapper {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 8px 12px;
  }
  
  .logo-section {
    gap: 8px;
  }
  
  .logo-container {
    width: 40px;
    height: 40px;
  }
  
  .logo {
    width: 24px;
    height: 24px;
  }
  
  .app-title {
    font-size: 20px;
    line-height: 28px;
  }
  
  .content-wrapper {
    padding: 12px;
  }
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .app-header {
    border-bottom-color: var(--md-sys-color-outline-variant);
  }
}
</style>
