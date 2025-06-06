<template>
  <div class="side-navigation">
    <!-- 背景 -->
    <div class="nav-background"></div>
    
    <!-- 菜单内容 -->
    <div class="nav-content">
      <!-- MENU 分组 -->
      <div class="nav-section">
        <h3 class="section-title">MENU</h3>
        <div class="menu-items">
          <div 
            v-for="item in menuItems" 
            :key="item.id"
            class="menu-item"
            :class="{ active: item.active }"
            @click="handleItemClick(item)"
          >
            <div class="item-background"></div>
            <div v-if="item.active" class="active-indicator"></div>
            <div class="item-content">
              <div class="item-icon" :class="{ active: item.active }">
                <component :is="item.icon" />
              </div>
              <span class="item-text" :class="{ active: item.active }">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- GENERAL 分组 -->
      <div class="nav-section">
        <h3 class="section-title">GENERAL</h3>
        <div class="menu-items">
          <div 
            v-for="item in generalItems" 
            :key="item.id"
            class="menu-item"
            @click="handleItemClick(item)"
          >
            <div class="item-background"></div>
            <div class="item-content">
              <div class="item-icon">
                <component :is="item.icon" />
              </div>
              <span class="item-text">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue'
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
  icon: any
  active?: boolean
  route?: string
}

const emit = defineEmits<{
  itemClick: [item: MenuItem]
}>()

// MENU 分组项目
const menuItems = ref<MenuItem[]>([
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: IconHome,
    active: true,
    route: '/dashboard'
  },
  {
    id: 'my-asset',
    label: 'My Asset',
    icon: IconWallet,
    route: '/my-asset'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: IconChart,
    route: '/analytics'
  },
  {
    id: 'history',
    label: 'History',
    icon: IconTime,
    route: '/history'
  },
  {
    id: 'news',
    label: 'News',
    icon: IconNews,
    route: '/news'
  }
])

// GENERAL 分组项目
const generalItems = ref<MenuItem[]>([
  {
    id: 'help',
    label: 'Help',
    icon: IconInfo,
    route: '/help'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: IconSettings,
    route: '/settings'
  },
  {
    id: 'logout',
    label: 'Logout',
    icon: IconLogout
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
.side-navigation {
  position: relative;
  width: 256px;
  height: 636px;
}

.nav-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #ffffff;
  box-shadow: 24px 0px 80px 0px rgba(49, 79, 124, 0.02);
}

.nav-content {
  position: relative;
  padding: 32px 16px;
  height: 100%;
  box-sizing: border-box;
}

.nav-section {
  margin-bottom: 32px;
}

.section-title {
  font-family: 'Poppins', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.714;
  color: #8F98B7;
  margin: 0 0 16px 16px;
  text-transform: uppercase;
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-item {
  position: relative;
  width: 224px;
  height: 56px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.menu-item:hover .item-background {
  background: rgba(244, 246, 248, 0.9);
}

.item-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(244, 246, 248, 0.73);
  border-radius: 8px;
  transition: background 0.2s ease;
}

.active-indicator {
  position: absolute;
  right: 0;
  top: 13px;
  width: 14.5px;
  height: 29px;
  background: linear-gradient(135deg, #1CAC70 0%, #EDDC46 100%);
  border-radius: 4px 0 0 4px;
}

.item-content {
  position: relative;
  display: flex;
  align-items: center;
  padding: 16px;
  height: 100%;
  box-sizing: border-box;
}

.item-icon {
  width: 24px;
  height: 24px;
  margin-right: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.item-icon.active {
  background: linear-gradient(135deg, #1CAC70 0%, #EDDC46 100%);
  border: none;
}

.item-icon:not(.active) {
  border-color: #E5E7EB;
}

.item-icon svg {
  width: 16px;
  height: 16px;
}

.item-icon.active svg {
  filter: brightness(0) invert(1);
}

.item-icon:not(.active) svg {
  filter: brightness(0) saturate(100%) invert(45%) sepia(8%) saturate(1238%) hue-rotate(202deg) brightness(95%) contrast(87%);
}

.item-text {
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.5;
  color: #6B7280;
  transition: color 0.2s ease;
}

.item-text.active {
  color: #1F2937;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .side-navigation {
    width: 100%;
    height: auto;
  }
  
  .nav-content {
    padding: 16px;
  }
  
  .menu-item {
    width: 100%;
  }
}
</style>