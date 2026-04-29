import { defineStore } from 'pinia';
import type { UserInfo } from '@/api/auth';

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null as UserInfo | null,
    isLoggedIn: false,
  }),
  getters: {
    hasPhone: (state) => !!state.userInfo?.phone,
  },
  actions: {
    setUser(user: UserInfo) {
      this.userInfo = user;
      this.isLoggedIn = true;
    },
    clearUser() {
      this.userInfo = null;
      this.isLoggedIn = false;
    },
  },
});
