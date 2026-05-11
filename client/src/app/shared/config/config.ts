import { type IntlDateTimeFormats, createI18n } from 'vue-i18n';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons/faArrowDown';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons/faArrowUp';
import { faArchive } from '@fortawesome/free-solid-svg-icons/faArchive';
import { faAsterisk } from '@fortawesome/free-solid-svg-icons/faAsterisk';
import { faBan } from '@fortawesome/free-solid-svg-icons/faBan';
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars';
import { faBell } from '@fortawesome/free-solid-svg-icons/faBell';
import { faBook } from '@fortawesome/free-solid-svg-icons/faBook';
import { faBuildingColumns } from '@fortawesome/free-solid-svg-icons/faBuildingColumns';
import { faCalendar } from '@fortawesome/free-solid-svg-icons/faCalendar';
import { faChartBar } from '@fortawesome/free-solid-svg-icons/faChartBar';
import { faChartLine } from '@fortawesome/free-solid-svg-icons/faChartLine';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons/faCheckCircle';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { faClipboard } from '@fortawesome/free-solid-svg-icons/faClipboard';
import { faClipboardList } from '@fortawesome/free-solid-svg-icons/faClipboardList';
import { faClock } from '@fortawesome/free-solid-svg-icons/faClock';
import { faCloud } from '@fortawesome/free-solid-svg-icons/faCloud';
import { faCog } from '@fortawesome/free-solid-svg-icons/faCog';
import { faCogs } from '@fortawesome/free-solid-svg-icons/faCogs';
import { faCommentAlt } from '@fortawesome/free-solid-svg-icons/faCommentAlt';
import { faCreditCard } from '@fortawesome/free-solid-svg-icons/faCreditCard';
import { faDatabase } from '@fortawesome/free-solid-svg-icons/faDatabase';
import { faDollarSign } from '@fortawesome/free-solid-svg-icons/faDollarSign';
import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons/faEllipsisV';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons/faExclamationCircle';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle';
import { faEye } from '@fortawesome/free-solid-svg-icons/faEye';
import { faFileInvoice } from '@fortawesome/free-solid-svg-icons/faFileInvoice';
import { faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons/faFileInvoiceDollar';
import { faFilter } from '@fortawesome/free-solid-svg-icons/faFilter';
import { faFlag } from '@fortawesome/free-solid-svg-icons/faFlag';
import { faHeart } from '@fortawesome/free-solid-svg-icons/faHeart';
import { faHistory } from '@fortawesome/free-solid-svg-icons/faHistory';
import { faHome } from '@fortawesome/free-solid-svg-icons/faHome';
import { faList } from '@fortawesome/free-solid-svg-icons/faList';
import { faLock } from '@fortawesome/free-solid-svg-icons/faLock';
import { faMedal } from '@fortawesome/free-solid-svg-icons/faMedal';
import { faNewspaper } from '@fortawesome/free-solid-svg-icons/faNewspaper';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons/faPencilAlt';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { faRoad } from '@fortawesome/free-solid-svg-icons/faRoad';
import { faSave } from '@fortawesome/free-solid-svg-icons/faSave';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
import { faServer } from '@fortawesome/free-solid-svg-icons/faServer';
import { faShieldAlt } from '@fortawesome/free-solid-svg-icons/faShieldAlt';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons/faSignInAlt';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons/faSignOutAlt';
import { faSort } from '@fortawesome/free-solid-svg-icons/faSort';
import { faSortDown } from '@fortawesome/free-solid-svg-icons/faSortDown';
import { faSortUp } from '@fortawesome/free-solid-svg-icons/faSortUp';
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner';
import { faSync } from '@fortawesome/free-solid-svg-icons/faSync';
import { faTachometerAlt } from '@fortawesome/free-solid-svg-icons/faTachometerAlt';
import { faTasks } from '@fortawesome/free-solid-svg-icons/faTasks';
import { faThLarge } from '@fortawesome/free-solid-svg-icons/faThLarge';
import { faThList } from '@fortawesome/free-solid-svg-icons/faThList';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons/faTimesCircle';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import { faTint } from '@fortawesome/free-solid-svg-icons/faTint';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons/faUserCircle';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons/faUserPlus';
import { faUsers } from '@fortawesome/free-solid-svg-icons/faUsers';
import { faUsersCog } from '@fortawesome/free-solid-svg-icons/faUsersCog';
import { faWrench } from '@fortawesome/free-solid-svg-icons/faWrench';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight';
import { faNetworkWired } from '@fortawesome/free-solid-svg-icons/faNetworkWired';
import { faFile } from '@fortawesome/free-solid-svg-icons/faFile';
import { faTabletAlt } from '@fortawesome/free-solid-svg-icons/faTabletAlt';
import { faMobileAlt } from '@fortawesome/free-solid-svg-icons/faMobileAlt';
import { faQuoteLeft } from '@fortawesome/free-solid-svg-icons/faQuoteLeft';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons/faEnvelope';
import { faPhone } from '@fortawesome/free-solid-svg-icons/faPhone';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons/faMapMarkerAlt';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons/faEyeSlash';
import { faCalculator } from '@fortawesome/free-solid-svg-icons/faCalculator';
import { faCode } from '@fortawesome/free-solid-svg-icons/faCode';
import { faPrint } from '@fortawesome/free-solid-svg-icons/faPrint';

const datetimeFormats: IntlDateTimeFormats = {
  es: {
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    },
    medium: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
    },
    long: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: 'numeric',
      minute: 'numeric',
    },
  },
  // jhipster-needle-i18n-language-date-time-format - JHipster will add/remove format options in this object
};

export function initFortAwesome(vue) {
  vue.component('font-awesome-icon', FontAwesomeIcon);

  library.add(
    faArrowLeft,
    faArrowDown,
    faArrowUp,
    faArchive,
    faAsterisk,
    faBan,
    faBars,
    faBell,
    faBook,
    faBuildingColumns,
    faCalendar,
    faChartBar,
    faChartLine,
    faCheckCircle,
    faChevronRight,
    faClipboard,
    faClipboardList,
    faClock,
    faCloud,
    faCog,
    faCogs,
    faCommentAlt,
    faCreditCard,
    faDatabase,
    faDollarSign,
    faDownload,
    faEllipsisV,
    faExclamationCircle,
    faExclamationTriangle,
    faEye,
    faFileInvoice,
    faFileInvoiceDollar,
    faFilter,
    faFlag,
    faHeart,
    faHistory,
    faHome,
    faList,
    faLock,
    faMedal,
    faNewspaper,
    faPencilAlt,
    faPlus,
    faRoad,
    faSave,
    faSearch,
    faServer,
    faShieldAlt,
    faSignInAlt,
    faSignOutAlt,
    faSort,
    faSortDown,
    faSortUp,
    faSpinner,
    faSync,
    faTachometerAlt,
    faTasks,
    faThLarge,
    faThList,
    faTimes,
    faTimesCircle,
    faTint,
    faTrash,
    faUser,
    faUserCircle,
    faUserPlus,
    faUsers,
    faUsersCog,
    faWrench,
    faArrowRight,
    faNetworkWired,
    faFile,
    faTabletAlt,
    faMobileAlt,
    faQuoteLeft,
    faEnvelope,
    faPhone,
    faMapMarkerAlt,
    faEyeSlash,
    faCalculator,
    faCode,
    faPrint,
  );
}
export function initI18N(opts: any = {}) {
  return createI18n({
    missingWarn: false,
    fallbackWarn: false,
    legacy: false,
    datetimeFormats,
    silentTranslationWarn: true,
    ...opts,
  });
}
