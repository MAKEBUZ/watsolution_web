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
    component: AdminPanel,
    meta: { authorities: [Authority.ADMIN] },
    children: [
      { path: '', redirect: 'resumen' },
      { path: 'resumen',     name: 'AdminResumen',     component: AdminResumen },
      { path: 'actividad',   name: 'AdminActividad',   component: AdminActividad },
      { path: 'usuarios',    name: 'AdminUsuarios',    component: AdminUsuarios },
      { path: 'facturacion', name: 'AdminFacturacion', component: AdminFacturacion },
      { path: 'noticias',    name: 'AdminNoticias',    component: AdminNoticias },
    ],
  },
];
