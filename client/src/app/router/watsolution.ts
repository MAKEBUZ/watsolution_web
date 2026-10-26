import { Authority } from '@/shared/security/authority';

const LoginPage = () => import('@/views/login/login.vue');
const PortalDashboard = () => import('@/views/portal/portal-dashboard.vue');
const CentroNoticias = () => import('@/views/noticias/centro-noticias.vue');
const PagosView = () => import('@/views/pagos/pagos.vue');
const AdminPanel = () => import('@/views/admin/admin-panel.vue');
const AdminResumen = () => import('@/views/admin/admin-resumen.vue');
const AdminActividad = () => import('@/views/admin/admin-actividad.vue');
const AdminUsuarios = () => import('@/views/admin/admin-usuarios.vue');
const AdminFacturacion = () => import('@/views/admin/admin-facturacion.vue');
const AdminNoticias = () => import('@/views/admin/admin-noticias.vue');
const UserPortal = () => import('@/views/admin/admin-portal.vue');
const PoliticaPrivacidad = () => import('@/views/politica/politica-privacidad.vue');

export default [
  { path: '/admin/whatsapp', name: 'AdminWhatsapp', component: () => import('@/views/admin/admin-whatsapp.vue'), meta: { authorities: [Authority.ADMIN] } },
  {
    path: '/notificaciones',
    name: 'Notificaciones',
    component: () => import('@/views/notifications/notifications.vue'),
    meta: { authorities: [Authority.USER, Authority.ADMIN] },
  },
  {
    path: '/admin/testimonios',
    name: 'AdminTestimonios',
    component: () => import('@/views/admin/admin-testimonios.vue'),
    meta: { authorities: [Authority.ADMIN] },
  },
  {
    path: '/admin/recorridos',
    name: 'AdminRecorridos',
    component: () => import('@/views/admin/admin-recorridos.vue'),
    meta: { authorities: [Authority.ADMIN] },
  },
  { path: '/noticias/:id', name: 'NoticiaDetalle', component: () => import('@/views/noticias/noticia-detalle.vue') },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/politica-privacidad',
    name: 'PoliticaPrivacidad',
    component: PoliticaPrivacidad,
  },
  {
    path: '/noticias',
    name: 'CentroNoticias',
    component: CentroNoticias,
  },
  {
    path: '/portal',
    name: 'PortalDashboard',
    component: PortalDashboard,
    meta: { authorities: [Authority.USER] },
  },
  {
    path: '/pagos',
    name: 'Pagos',
    component: PagosView,
    meta: { authorities: [Authority.USER] },
  },
  {
    path: '/admin-panel',
    name: 'AdminDashboard',
    redirect: '/admin/resumen',
    meta: { authorities: [Authority.ADMIN] },
  },
  {
    path: '/admin/resumen',
    name: 'AdminResumen',
    component: AdminResumen,
    meta: { authorities: [Authority.ADMIN] },
  },
  {
    path: '/admin/actividad',
    name: 'AdminActividad',
    component: AdminActividad,
    meta: { authorities: [Authority.ADMIN] },
  },
  {
    path: '/admin/usuarios',
    name: 'AdminUsuarios',
    component: AdminUsuarios,
    meta: { authorities: [Authority.ADMIN] },
  },
  {
    path: '/admin/facturacion',
    name: 'AdminFacturacion',
    component: AdminFacturacion,
    meta: { authorities: [Authority.ADMIN] },
  },
  {
    path: '/admin/noticias',
    name: 'AdminNoticias',
    component: AdminNoticias,
    meta: { authorities: [Authority.ADMIN] },
  },
  {
    path: '/admin/portal-usuario',
    name: 'AdminPortalUsuario',
    component: UserPortal,
    meta: { authorities: [Authority.ADMIN] },
  },
  {
    path: '/admin',
    name: 'admin-summary',
    redirect: '/admin/resumen',
  },
];
