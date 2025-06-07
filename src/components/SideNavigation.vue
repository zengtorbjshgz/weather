<template>
  <nav class="md-navigation-drawer md-surface-container md-elevation-1">
    <div class="nav-header">
      <div class="nav-header-content">
        <div class="app-identity">
          <div class="app-icon md-primary-container md-shape-corner-medium">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.74 2.32a.5.5 0 0 0-.48 0l-10 5A.5.5 0 0 0 2 8v8a.5.5 0 0 0 .26.44l10 5a.5.5 0 0 0 .48 0l10-5A.5.5 0 0 0 23 16V8a.5.5 0 0 0-.26-.44l-10-5zM12 3.2L21.26 8 12 12.8 2.74 8 12 3.2zM3 8.82l9 4.5v8.36l-9-4.5V8.82zm10 12.86v-8.36l9-4.5v8.36l-9 4.5z"/>
            </svg>
          </div>
          <div class="app-info">
            <h2 class="app-name md-typescale-title-large">天气助手</h2>
            <p class="app-subtitle md-typescale-label-large">实时天气信息</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="nav-content">
      <!-- 主要功能 -->
      <div class="nav-section">
        <h3 class="section-title md-typescale-label-large">主要功能</h3>
        <div class="nav-items">
          <div 
            v-for="item in menuItems" 
            :key="item.id"
            class="nav-item md-shape-corner-large"
            :class="{ 'nav-item--active': item.active }"
            @click="handleItemClick(item)"
            role="button"
            tabindex="0"
          >
            <div class="nav-item-content">
              <div class="nav-item-icon">
                <component :is="item.icon" />
              </div>
              <span class="nav-item-text md-typescale-label-large">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 设置与帮助 -->
      <div class="nav-section">
        <h3 class="section-title md-typescale-label-large">设置与帮助</h3>
        <div class="nav-items">
          <div 
            v-for="item in generalItems" 
            :key="item.id"
            class="nav-item md-shape-corner-large"
            @click="handleItemClick(item)"
            role="button"
            tabindex="0"
          >
            <div class="nav-item-content">
              <div class="nav-item-icon">
                <component :is="item.icon" />
              </div>
              <span class="nav-item-text md-typescale-label-large">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue'
import type { DefineComponent } from 'vue'
import IconHome from '@/assets/icons/icon-home.svg?component'
import IconWallet from '@/assets/icons/icon-wallet.svg?component'
import IconChart from '@/assets/icons/icon-chart.svg?component'
import IconTime from '@/assets/icons/icon-time.svg?component'
import IconNews from '@/assets/icons/icon-news.svg?component'
import IconInfo from '@/assets/icons/icon-info.svg?component'
import IconSettings from '@/assets/icons/icon-settings.svg?component'
import IconLogout from '@/assets/icons/icon-logout.svg?component'

interface MenuItem {
  id: string
  label: string
  icon: DefineComponent
  active?: boolean
  route?: string
}

const emit = defineEmits<{
  itemClick: [item: MenuItem]
}>()

// 主要功能项目
const menuItems = ref<MenuItem[]>([
  {
    id: 'weather',
    label: '实时天气',
    icon: IconHome,
    active: true,
    route: '/'
  },
  {
    id: 'forecast',
    label: '天气预报',
    icon: IconChart,
    route: '/forecast'
  },
  {
    id: 'history',
    label: '历史记录',
    icon: IconTime,
    route: '/history'
  },
  {
    id: 'locations',
    label: '我的位置',
    icon: IconWallet,
    route: '/locations'
  },
  {
    id: 'alerts',
    label: '天气预警',
    icon: IconNews,
    route: '/alerts'
  }
])

// 设置与帮助项目
const generalItems = ref<MenuItem[]>([
  {
    id: 'settings',
    label: '设置',
    icon: IconSettings,
    route: '/settings'
  },
  {
    id: 'help',
    label: '帮助',
    icon: IconInfo,
    route: '/help'
  },
  {
    id: 'about',
    label: '关于',
    icon: IconLogout,
    route: '/about'
  }
])

// 处理菜单项点击
const handleItemClick = (item: MenuItem) => {
  // 如果是菜单项，更新激活状态
  if (menuItems.value.includes(item)) {
    menuItems.value.forEach(menuItem => {
      menuItem.active = menuItem.id === item.id
    })
  }
  
  emit('itemClick', item)
}
</script>

<style scoped>
/* Material Design 3 Navigation Drawer */
.md-navigation-drawer {
  position: relative;
  width: 360px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--md-sys-color-outline-variant);
  overflow: hidden;
}

/* Navigation Header */
.nav-header {
  padding: 24px 16px 16px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.nav-header-content {
  display: flex;
  align-items: center;
}

.app-identity {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.app-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  color: var(--md-sys-color-on-primary-container);
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.app-icon:hover {
  transform: scale(1.05);
}

.app-info {
  flex: 1;
  min-width: 0;
}

.app-name {
  margin: 0 0 4px 0;
  color: var(--md-sys-color-on-surface);
  font-weight: 400;
}

.app-subtitle {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-weight: 400;
}

/* Navigation Content */
.nav-content {
  flex: 1;
  padding: 12px 12px 24px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--md-sys-color-outline-variant) transparent;
}

.nav-content::-webkit-scrollbar {
  width: 8px;
}

.nav-content::-webkit-scrollbar-track {
  background: transparent;
}

.nav-content::-webkit-scrollbar-thumb {
  background-color: var(--md-sys-color-outline-variant);
  border-radius: 4px;
}

.nav-section {
  margin-bottom: 24px;
}

.nav-section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 8px 16px;
  color: var(--md-sys-color-on-surface-variant);
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.1px;
}

/* Navigation Items */
.nav-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 56px;
  padding: 0;
  margin: 0 4px;
  cursor: pointer;
  border: none;
  background: transparent;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  outline: none;
}

.nav-item:hover {
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.nav-item:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.nav-item--active {
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.nav-item--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 32px;
  background-color: var(--md-sys-color-primary);
  border-radius: 0 2px 2px 0;
}

.nav-item-content {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 16px;
  gap: 12px;
}

.nav-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--md-sys-color-on-surface-variant);
  transition: color 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.nav-item:hover .nav-item-icon,
.nav-item--active .nav-item-icon {
  color: var(--md-sys-color-on-secondary-container);
}

.nav-item-icon svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.nav-item-text {
  flex: 1;
  color: var(--md-sys-color-on-surface-variant);
  font-weight: 500;
  transition: color 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-item:hover .nav-item-text,
.nav-item--active .nav-item-text {
  color: var(--md-sys-color-on-secondary-container);
}

/* 响应式设计 */
@media (max-width: 840px) {
  .md-navigation-drawer {
    width: 320px;
  }
  
  .nav-header {
    padding: 16px 12px 12px;
  }
  
  .app-identity {
    gap: 12px;
  }
  
  .app-icon {
    width: 48px;
    height: 48px;
  }
  
  .app-name {
    font-size: 20px;
    line-height: 28px;
  }
  
  .app-subtitle {
    font-size: 12px;
    line-height: 16px;
  }
  
  .nav-content {
    padding: 8px 8px 16px;
  }
  
  .nav-item {
    min-height: 48px;
    margin: 0 2px;
  }
  
  .nav-item-content {
    padding: 12px;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .md-navigation-drawer {
    width: 280px;
  }
  
  .nav-header {
    padding: 12px 8px 8px;
  }
  
  .app-identity {
    gap: 8px;
  }
  
  .app-icon {
    width: 40px;
    height: 40px;
  }
  
  .app-name {
    font-size: 18px;
    line-height: 24px;
  }
  
  .app-subtitle {
    font-size: 11px;
    line-height: 14px;
  }
  
  .nav-content {
    padding: 6px 6px 12px;
  }
  
  .section-title {
    margin: 0 0 6px 12px;
    font-size: 12px;
    line-height: 16px;
  }
  
  .nav-item {
    min-height: 44px;
    margin: 0 1px;
  }
  
  .nav-item-content {
    padding: 10px;
    gap: 8px;
  }
  
  .nav-item-text {
    font-size: 13px;
    line-height: 18px;
  }
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .md-navigation-drawer {
    border-right-color: var(--md-sys-color-outline-variant);
  }
  
  .nav-header {
    border-bottom-color: var(--md-sys-color-outline-variant);
  }
}
</style>