import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router';
import type AccountService from '@/account/account.service';
import type { AccountStore } from '@/store';

export function createSessionGuard(store: AccountStore, accounts: AccountService) {
  return async (to: RouteLocationNormalized): Promise<true | RouteLocationRaw> => {
    // Old bookmarks recover to the appropriate workspace; never render the obsolete 403 page.
    if (to.path.replace(/\/$/, '') === '/forbidden') {
      if (!store.authenticated) await store.initAccount();
      return { path: store.authenticated ? accountHome(store.account?.authorities) : '/login', replace: true };
    }
    const authorities = to.meta?.authorities;
    // Public pages must stay reachable while session endpoints are unavailable.
    if (!Array.isArray(authorities) || authorities.length === 0) return true;
    if (!store.authenticated) await store.initAccount();
    if (!store.authenticated) return { path: '/login', query: { redirect: to.fullPath } };
    if (store.account?.authorities?.includes('ROLE_ADMIN')) return true;
    if (!(await accounts.hasAnyAuthorityAndCheckAuth(authorities)))
      return { path: accountHome(store.account?.authorities), query: { access: 'restricted' }, replace: true };
    return true;
  };
}

export function accountHome(authorities: string[] = []): string {
  return authorities.includes('ROLE_ADMIN') ? '/admin/resumen' : authorities.includes('ROLE_USER') ? '/portal' : '/';
}
