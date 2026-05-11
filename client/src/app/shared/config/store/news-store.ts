import { defineStore } from 'pinia';
import axios from 'axios';

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: 'operativo' | 'institucional' | 'comunidad';
  date: string;
  image: string;
  isArchived: boolean;
}

export const useNewsStore = defineStore('news', {
  state: () => ({
    news: [
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
        content: 'Estamos orgulloso de presentar watsolution, la nueva forma de gestionar tu consumo hídrico.',
        category: 'institucional',
        date: '2026-04-24',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
        isArchived: false
      }
    ] as NewsItem[],
  }),
  getters: {
    activeNews: state => state.news.filter(n => !n.isArchived),
  },
  actions: {
    async fetchNews() {
      try {
        const response = await axios.get('api/noticias');
        if (response.data) {
          this.news = response.data;
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    },
    addNews(item: NewsItem) {
      this.news.unshift(item);
    },
    deleteNews(id: string) {
      this.news = this.news.filter(n => n.id !== id);
    },
    updateNews(updatedItem: NewsItem) {
      const index = this.news.findIndex(n => n.id === updatedItem.id);
      if (index !== -1) {
        this.news[index] = updatedItem;
      }
    },
  },
});
