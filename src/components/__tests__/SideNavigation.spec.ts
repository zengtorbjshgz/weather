import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SideNavigation from '../SideNavigation.vue'

// Mock all SVG imports as simple components
vi.mock('@/assets/icons/icon-home.svg?component', () => ({
  default: {
    name: 'MockIcon',
    template: '<div class="mock-icon">home</div>'
  }
}))
vi.mock('@/assets/icons/icon-wallet.svg?component', () => ({
  default: {
    name: 'MockIcon',
    template: '<div class="mock-icon">wallet</div>'
  }
}))
vi.mock('@/assets/icons/icon-chart.svg?component', () => ({
  default: {
    name: 'MockIcon',
    template: '<div class="mock-icon">chart</div>'
  }
}))
vi.mock('@/assets/icons/icon-time.svg?component', () => ({
  default: {
    name: 'MockIcon',
    template: '<div class="mock-icon">time</div>'
  }
}))
vi.mock('@/assets/icons/icon-news.svg?component', () => ({
  default: {
    name: 'MockIcon',
    template: '<div class="mock-icon">news</div>'
  }
}))
vi.mock('@/assets/icons/icon-info.svg?component', () => ({
  default: {
    name: 'MockIcon',
    template: '<div class="mock-icon">info</div>'
  }
}))
vi.mock('@/assets/icons/icon-settings.svg?component', () => ({
  default: {
    name: 'MockIcon',
    template: '<div class="mock-icon">settings</div>'
  }
}))
vi.mock('@/assets/icons/icon-logout.svg?component', () => ({
  default: {
    name: 'MockIcon',
    template: '<div class="mock-icon">logout</div>'
  }
}))

describe('SideNavigation', () => {
  it('renders properly', () => {
    const wrapper = mount(SideNavigation)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.side-navigation').exists()).toBe(true)
  })

  it('displays correct section titles', () => {
    const wrapper = mount(SideNavigation)
    const sectionTitles = wrapper.findAll('.section-title')
    
    expect(sectionTitles).toHaveLength(2)
    expect(sectionTitles[0].text()).toBe('MENU')
    expect(sectionTitles[1].text()).toBe('GENERAL')
  })

  it('renders all menu items', () => {
    const wrapper = mount(SideNavigation)
    const menuItems = wrapper.findAll('.menu-item')
    
    // 5 menu items + 3 general items = 8 total
    expect(menuItems).toHaveLength(8)
  })

  it('displays correct menu item labels', () => {
    const wrapper = mount(SideNavigation)
    const itemTexts = wrapper.findAll('.item-text')
    
    const expectedLabels = [
      'Dashboard', 'My Asset', 'Analytics', 'History', 'News',
      'Help', 'Settings', 'Logout'
    ]
    
    itemTexts.forEach((item, index) => {
      expect(item.text()).toBe(expectedLabels[index])
    })
  })

  it('has Dashboard as active by default', () => {
    const wrapper = mount(SideNavigation)
    const activeItems = wrapper.findAll('.menu-item.active')
    
    expect(activeItems).toHaveLength(1)
    expect(activeItems[0].find('.item-text').text()).toBe('Dashboard')
  })

  it('shows active indicator for active item', () => {
    const wrapper = mount(SideNavigation)
    const activeIndicators = wrapper.findAll('.active-indicator')
    
    expect(activeIndicators).toHaveLength(1)
  })

  it('emits itemClick event when menu item is clicked', async () => {
    const wrapper = mount(SideNavigation)
    const menuItem = wrapper.findAll('.menu-item')[1] // My Asset
    
    await menuItem.trigger('click')
    
    expect(wrapper.emitted('itemClick')).toBeTruthy()
    expect(wrapper.emitted('itemClick')).toHaveLength(1)
    
    const emittedItem = wrapper.emitted('itemClick')![0][0] as any
    expect(emittedItem.id).toBe('my-asset')
    expect(emittedItem.label).toBe('My Asset')
  })

  it('updates active state when menu item is clicked', async () => {
    const wrapper = mount(SideNavigation)
    const analyticsItem = wrapper.findAll('.menu-item')[2] // Analytics
    
    await analyticsItem.trigger('click')
    
    // Check that Analytics is now active
    expect(analyticsItem.classes()).toContain('active')
    
    // Check that Dashboard is no longer active
    const dashboardItem = wrapper.findAll('.menu-item')[0]
    expect(dashboardItem.classes()).not.toContain('active')
  })

  it('does not change active state for general items', async () => {
    const wrapper = mount(SideNavigation)
    const helpItem = wrapper.findAll('.menu-item')[5] // Help
    
    await helpItem.trigger('click')
    
    // Dashboard should still be active
    const dashboardItem = wrapper.findAll('.menu-item')[0]
    expect(dashboardItem.classes()).toContain('active')
    
    // Help should not be active
    expect(helpItem.classes()).not.toContain('active')
  })

  it('applies correct CSS classes', () => {
    const wrapper = mount(SideNavigation)
    
    // Check main container
    expect(wrapper.find('.side-navigation').exists()).toBe(true)
    expect(wrapper.find('.nav-background').exists()).toBe(true)
    expect(wrapper.find('.nav-content').exists()).toBe(true)
    
    // Check sections
    expect(wrapper.findAll('.nav-section')).toHaveLength(2)
    
    // Check menu items structure
    const firstMenuItem = wrapper.find('.menu-item')
    expect(firstMenuItem.find('.item-background').exists()).toBe(true)
    expect(firstMenuItem.find('.item-content').exists()).toBe(true)
    expect(firstMenuItem.find('.item-icon').exists()).toBe(true)
    expect(firstMenuItem.find('.item-text').exists()).toBe(true)
  })

  describe('Menu Item Structure', () => {
    it('contains correct number of menu items in each section', () => {
      const wrapper = mount(SideNavigation)
      const sections = wrapper.findAll('.nav-section')
      
      // MENU section should have 5 items
      const menuSection = sections[0]
      const menuItems = menuSection.findAll('.menu-item')
      expect(menuItems).toHaveLength(5)
      
      // GENERAL section should have 3 items
      const generalSection = sections[1]
      const generalItems = generalSection.findAll('.menu-item')
      expect(generalItems).toHaveLength(3)
    })
  })

  describe('Event Handling', () => {
    it('emits correct item data for different menu items', async () => {
      const wrapper = mount(SideNavigation)
      const menuItems = wrapper.findAll('.menu-item')
      
      // Test Dashboard
      await menuItems[0].trigger('click')
      let emittedItem = wrapper.emitted('itemClick')![0][0] as any
      expect(emittedItem.id).toBe('dashboard')
      expect(emittedItem.route).toBe('/dashboard')
      
      // Test Logout
      await menuItems[7].trigger('click')
      emittedItem = wrapper.emitted('itemClick')![1][0] as any
      expect(emittedItem.id).toBe('logout')
      expect(emittedItem.route).toBeUndefined() // Logout doesn't have a route
    })
  })
})