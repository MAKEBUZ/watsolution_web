import { getAccessToken, setAccessToken, refreshAccessToken, getSessionGeneration, logoutStorageKey, sessionRequestTimeout } from '@/shared/config/web-session';
import { defineStore } from 'pinia';
import axios from 'axios';

export interface AccountStateStorable {
  logon: Promise<unknown> | null;
  userIdentity: null | any;
  authenticated: boolean;
  profilesLoaded: boolean;
  ribbonOnProfiles: string;
  activeProfiles: string;
  logoutStatus: 'idle' | 'pending' | 'failed' | 'confirmed';
}

export const defaultAccountState: AccountStateStorable = {
  logon: null,
  userIdentity: null,
  authenticated: false,
  profilesLoaded: false,
  ribbonOnProfiles: '',
  activeProfiles: '',
  logoutStatus: 'idle',
};

export const useAccountStore = defineStore('main', {
  state: (): AccountStateStorable => ({ ...defaultAccountState,
    logoutStatus: localStorage.getItem(logoutStorageKey)?.startsWith('pending:') ? 'failed' : 'idle',
  }),
  getters: {
    account: state => state.userIdentity,
  },
  actions: {
    authenticate(promise) {
      this.logon = promise;
    },
    setAuthentication(identity) {
      this.userIdentity = identity;
      this.authenticated = true;
      this.logon = null;
      this.logoutStatus = 'idle';
    },
    clearLocalSession() {
      setAccessToken(null);
      this.userIdentity = null;
      this.authenticated = false;
      this.logon = null;
      localStorage.removeItem('jhi-authenticationToken');
      sessionStorage.removeItem('jhi-authenticationToken');
    },
    applyRemoteLogout() {
      this.clearLocalSession();
      this.logoutStatus = localStorage.getItem(logoutStorageKey)?.startsWith('pending:') ? 'failed' : 'confirmed';
    },
    async logout(): Promise<boolean> {
      if (this.logoutStatus === 'pending') return false;
      const marker = `pending:${Date.now()}:${Math.random()}`;
      localStorage.setItem(logoutStorageKey, marker);
      this.clearLocalSession();
      const generation = getSessionGeneration();
      this.logoutStatus = 'pending';
      try {
        const response = await axios.create().post(`${SERVER_API_URL}api/session/logout`, {}, {
          withCredentials: true, timeout: sessionRequestTimeout, headers: { 'X-Session-Transport': 'web' },
        });
        if (response.data?.revoked !== true) throw new Error('Logout was not confirmed');
        if (generation === getSessionGeneration() && localStorage.getItem(logoutStorageKey) === marker) {
          localStorage.setItem(logoutStorageKey, `confirmed:${marker}`);
          this.logoutStatus = 'confirmed';
        }
        return true;
      } catch {
        if (generation === getSessionGeneration()) this.logoutStatus = 'failed';
        return false;
      }
    },
    setProfilesLoaded() {
      this.profilesLoaded = true;
    },
    setActiveProfiles(profile) {
      this.activeProfiles = profile;
    },
    setRibbonOnProfiles(ribbon) {
      this.ribbonOnProfiles = ribbon;
    },
    async initAccount() {
      if (this.authenticated || localStorage.getItem(logoutStorageKey)) return;
      if (this.logon) { await this.logon; return; }
      const generation = getSessionGeneration();
      const restoring = (async () => {
        try {
          if (!getAccessToken()) await refreshAccessToken();
          if (generation === getSessionGeneration()) await this.loadAccountAction();
        } catch {
          // An anonymous visitor, expired cookie or network failure is not an explicit logout.
          if (generation === getSessionGeneration() && (getAccessToken() || this.authenticated)) this.clearLocalSession();
        }
      })();
      this.authenticate(restoring);
      try { await restoring; }
      finally { if (this.logon === restoring) this.authenticate(null); }
    },
    async loadAccountAction() {
      const generation = getSessionGeneration();
      try {
        const response = await axios.get<any>('api/account');
        if (generation !== getSessionGeneration()) return;
        if (response.status === 200 && response.data?.login) {
          this.setAuthentication(response.data);
        }
      } catch (error) {
        if (generation === getSessionGeneration()) this.clearLocalSession();
      }
    },
  },
});
