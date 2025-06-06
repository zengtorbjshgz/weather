<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import SideNavigation from './components/SideNavigation.vue'

const router = useRouter()

interface MenuItem {
  id: string
  label: string
  icon: any
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
  <div id="app">
    <div class="app-layout">
      <!-- 侧边导航 -->
      <SideNavigation @item-click="handleNavigation" />
      
      <!-- 主内容区域 -->
      <main class="main-content">
        <header class="app-header">
          <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="60" height="60" />
          <h1>Weather Dashboard</h1>
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
  background-color: #f8fafc;
  overflow: hidden;
}

.app-header {
  display: flex;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.logo {
  margin-right: 1rem;
}

.app-header h1 {
  font-family: 'Poppins', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.content-wrapper {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }
  
  .app-header {
    padding: 1rem;
  }
  
  .app-header h1 {
    font-size: 1.25rem;
  }
  
  .content-wrapper {
    padding: 1rem;
  }
}
</style>
