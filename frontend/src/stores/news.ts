import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface NewsItem {
  id: string
  title: string
  content: string
  category: 'operativo' | 'institucional' | 'comunidad'
  date: string
  image: string
  isArchived: boolean
}

export const useNewsStore = defineStore('news', () => {
  const news = ref<NewsItem[]>([
    {
      id: '1',
      title: 'Mantenimiento preventivo en Planta Central',
      content: 'Se informa que el próximo martes se realizarán labores de limpieza en los tanques principales...',
      category: 'operativo',
      date: '2026-04-20',
      image: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&q=80&w=800',
      isArchived: false
    },
    {
      id: '2',
      title: 'Nueva plataforma PWA lanzada',
      content: 'Estamos orgullosos de presentar watsolution, la nueva forma de gestionar tu consumo hídrico.',
      category: 'institucional',
      date: '2026-04-24',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
      isArchived: false
    }
  ])

  const addNews = (item: NewsItem) => {
    news.value.unshift(item)
  }

  const deleteNews = (id: string) => {
    news.value = news.value.filter(n => n.id !== id)
  }

  const updateNews = (updatedItem: NewsItem) => {
    const index = news.value.findIndex(n => n.id === updatedItem.id)
    if (index !== -1) {
      news.value[index] = updatedItem
    }
  }

  return {
    news,
    addNews,
    deleteNews,
    updateNews
  }
})
