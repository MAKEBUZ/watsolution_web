import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeView from '../views/HomeView.vue'
import Hero from '../components/home/Hero.vue'
import Features from '../components/home/Features.vue'
import Demos from '../components/home/Demos.vue'
import Testimonials from '../components/home/Testimonials.vue'

describe('HomeView', () => {
  it('renders all sections', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.findComponent(Hero).exists()).toBe(true)
    expect(wrapper.findComponent(Features).exists()).toBe(true)
    expect(wrapper.findComponent(Demos).exists()).toBe(true)
    expect(wrapper.findComponent(Testimonials).exists()).toBe(true)
  })

  it('has the correct main container class', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.classes()).toContain('home')
  })
})
