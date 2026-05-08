import { computed, defineComponent, onMounted, ref } from 'vue';
import NoticiaService from '@/entities/noticia/noticia.service';
import { type INoticia } from '@/shared/model/noticia.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'CentroNoticias',
  setup() {
    const noticiaService = new NoticiaService();
    const noticias = ref<INoticia[]>([]);
    const searchQuery = ref('');
    const selectedCategory = ref('');
    const isFetching = ref(false);
    const categories = ['OPERATIVO', 'INSTITUCIONAL', 'URGENTE'];

    onMounted(async () => {
      isFetching.value = true;
      try {
        noticias.value = await noticiaService.retrievePublic();
      } catch {
        noticias.value = [];
      } finally {
        isFetching.value = false;
      }
    });

    const filtered = computed(() =>
      noticias.value.filter(n =>
        (!searchQuery.value || (n.title ?? '').toLowerCase().includes(searchQuery.value.toLowerCase())) &&
        (!selectedCategory.value || n.category === selectedCategory.value),
      ),
    );

    const categoryLabel = (cat: string) => {
      const map: Record<string, string> = { OPERATIVO: 'Operativo', INSTITUCIONAL: 'Institucional', URGENTE: 'Urgente' };
      return map[cat] ?? cat;
    };

    const categoryClass = (cat?: string | null) => {
      if (cat === 'URGENTE') return 'badge-urgente';
      if (cat === 'OPERATIVO') return 'badge-operativo';
      return 'badge-institucional';
    };

    const formatDate = (date?: Date | null) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return { filtered, searchQuery, selectedCategory, categories, isFetching, categoryLabel, categoryClass, formatDate };
  },
});
