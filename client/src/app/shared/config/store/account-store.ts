import { getAccessToken, setAccessToken, refreshAccessToken, getSessionGeneration } from '@/shared/config/web-session';
import { defineStore } from 'pinia';
import axios from 'axios';

export interface AccountStateStorable {
  logon: boolean;
  userIdentity: null | any;
  authenticated: boolean;
  profilesLoaded: boolean;
  ribbonOnProfiles: string;
  activeProfiles: string;
}

export const defaultAccountState: AccountStateStorable = {
  logon: null,
  userIdentity: null,
  authenticated: false,
  profilesLoaded: false,
  ribbonOnProfiles: '',
  activeProfiles: '',
};

export const useAccountStore = defineStore('main', {
  state: (): AccountStateStorable => ({ ...defaultAccountState }),
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
    },
    logout() {
      const currentToken = getAccessToken();
      if (currentToken) void axios.create().post(`${SERVER_API_URL}api/session/logout`, {}, { withCredentials: true, headers: { Authorization: `Bearer ${currentToken}` } }).catch(() => {});
      setAccessToken(null);
      this.userIdentity = null;
      this.authenticated = false;
      this.logon = null;
      localStorage.removeItem('jhi-authenticationToken');
      sessionStorage.removeItem('jhi-authenticationToken');
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
      const generation = getSessionGeneration();
      try { await refreshAccessToken(); await this.loadAccountAction(); } catch { if (generation === getSessionGeneration()) this.logout(); }
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
        if (generation === getSessionGeneration()) this.logout();
      }
    },
  },
});
