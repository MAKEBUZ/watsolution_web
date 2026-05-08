import { computed, defineComponent, onMounted, ref } from 'vue';
import NoticiaService from '@/entities/noticia/noticia.service';
import { type INoticia } from '@/shared/model/noticia.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'AdminNoticias',
  setup() {
    const noticiaService = new NoticiaService();
    const noticias = ref<INoticia[]>([]);
    const isFetching = ref(false);
    const searchQuery = ref('');
    const showModal = ref(false);
    const isSaving = ref(false);

    const editForm = ref<INoticia>({
      title: '',
      summary: '',
      content: '',
      category: 'OPERATIVO',
      status: 'ACTIVE',
      publishDate: new Date() as any,
      imageUrl: '',
    });

    onMounted(() => loadNoticias());

    const loadNoticias = async () => {
      isFetching.value = true;
      try {
        const res = await noticiaService.retrieve({ page: 0, size: 100, sort: 'id,DESC' });
        noticias.value = res.data;
      } finally {
        isFetching.value = false;
      }
    };

    const filtered = computed(() =>
      noticias.value.filter(n =>
        !searchQuery.value || (n.title ?? '').toLowerCase().includes(searchQuery.value.toLowerCase()),
      ),
    );

    const openCreate = () => {
      editForm.value = { title: '', summary: '', content: '', category: 'OPERATIVO', status: 'ACTIVE', publishDate: new Date() as any, imageUrl: '' };
      showModal.value = true;
    };

    const openEdit = (n: INoticia) => {
      editForm.value = { ...n };
      showModal.value = true;
    };

    const saveNoticia = async () => {
      isSaving.value = true;
      try {
        if (editForm.value.id) {
          await noticiaService.update(editForm.value);
        } else {
          await noticiaService.create(editForm.value);
        }
        showModal.value = false;
        await loadNoticias();
      } finally {
        isSaving.value = false;
      }
    };

    const archiveNoticia = async (n: INoticia) => {
      await noticiaService.update({ ...n, status: 'INACTIVE' });
      await loadNoticias();
    };

    const deleteNoticia = async (id?: number) => {
      if (!id) return;
      if (confirm('¿Está seguro de eliminar esta noticia?')) {
        await noticiaService.delete(id);
        await loadNoticias();
      }
    };

    const categoryClass = (cat?: string | null) => {
      if (cat === 'URGENTE') return 'badge-urgente';
      if (cat === 'OPERATIVO') return 'badge-operativo';
      return 'badge-institucional';
    };

    const formatDate = (date?: Date | null) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('es-CO');
    };

    return {
      noticias, filtered, isFetching, searchQuery, showModal, editForm, isSaving,
      openCreate, openEdit, saveNoticia, archiveNoticia, deleteNoticia, categoryClass, formatDate,
    };
  },
});
