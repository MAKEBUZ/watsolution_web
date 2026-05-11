import { defineStore } from 'pinia';
import axios from 'axios';
import { type INoticia } from '@/shared/model/noticia.model';

export const useNewsStore = defineStore('news', {
  state: () => ({
    news: [] as INoticia[],
  }),
  getters: {
    activeNews: (state) => state.news.filter(n => n.status === 'ACTIVE'),
  },
  actions: {
    async fetchNews() {
      try {
        const response = await axios.get('api/public/noticias');
        if (response.data) {
          this.news = response.data;
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    },
  },
});
