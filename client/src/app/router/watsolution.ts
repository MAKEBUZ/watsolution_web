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

export default [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
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
    component: AdminPanel,
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
    redirect: '/admin/resumen'
  },
  {
    path: '/admin/usuarios',
    name: 'admin-users',
    redirect: '/admin/usuarios'
  },
  {
    path: '/admin/facturacion',
    name: 'admin-billing',
    redirect: '/admin/facturacion'
  },
  {
    path: '/admin/noticias',
    name: 'admin-news',
    redirect: '/admin/noticias'
  },
];
