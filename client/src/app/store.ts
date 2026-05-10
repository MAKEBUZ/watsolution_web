import { useAccountStore as useStore } from '@/shared/config/store/account-store';
export type AccountStore = ReturnType<typeof useStore>;
export { useStore };

import { useTranslationStore } from '@/shared/config/store/translation-store';
export { useTranslationStore };

import { useNewsStore as useNewsStoreFn } from '@/shared/config/store/news-store';
export type NewsStore = ReturnType<typeof useNewsStoreFn>;
export { useNewsStoreFn };
