import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router';
import type AccountService from '@/account/account.service';
import type { AccountStore } from '@/store';

export function createSessionGuard(store: AccountStore, accounts: AccountService) {
  return async (to: RouteLocationNormalized): Promise<true | RouteLocationRaw> => {
    const authorities = to.meta?.authorities;
    // Public pages must stay reachable while session endpoints are unavailable.
    if (!Array.isArray(authorities) || authorities.length === 0) return true;
    if (!store.authenticated) await store.initAccount();
    if (!store.authenticated) return { path: '/login', query: { redirect: to.fullPath } };
    if (!await accounts.hasAnyAuthorityAndCheckAuth(authorities)) return { path: '/forbidden' };
    return true;
  };
}
