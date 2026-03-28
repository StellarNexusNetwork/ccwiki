import {onBeforeUnmount, onMounted, readonly, ref} from 'vue';
import {eventBus} from '@/utils/eventBus';

const CAT_DAY_MONTH = 1; // February (0-based month)
const CAT_DAY_DATE = 22;
const CAT_FESTIVAL_DURATION_DAYS = 7;
const PI_DAY_MONTH = 2; // March (0-based month)
const PI_DAY_DATE = 14;
const PI_FESTIVAL_DURATION_DAYS = 7;
const PRIDE_MONTH = 5; // June (0-based month)

export function isCatFestival(date = new Date()): boolean {
  const year = date.getFullYear();
  const festivalStart = new Date(year, CAT_DAY_MONTH, CAT_DAY_DATE);
  const festivalEnd = new Date(festivalStart);
  festivalEnd.setDate(festivalStart.getDate() + CAT_FESTIVAL_DURATION_DAYS);
  return date >= festivalStart && date < festivalEnd;
}

export function isPiDay(date = new Date()): boolean {
  const year = date.getFullYear();
  const piStart = new Date(year, PI_DAY_MONTH, PI_DAY_DATE);
  const piEnd = new Date(piStart);
  piEnd.setDate(piStart.getDate() + PI_FESTIVAL_DURATION_DAYS);
  return date >= piStart && date < piEnd;
}

export function isPrideMonth(date = new Date()): boolean {
  return date.getMonth() === PRIDE_MONTH;
}

export function useCatFestivalStatus() {
  const isCatFestivalActive = ref(isCatFestival());
  const isPiDayActive = ref(isPiDay());
  const isPrideMonthActive = ref(isPrideMonth());

  const refreshCatFestivalStatus = () => {
    isCatFestivalActive.value = isCatFestival();
    isPiDayActive.value = isPiDay();
    isPrideMonthActive.value = isPrideMonth();
  };

  onMounted(() => {
    refreshCatFestivalStatus();
    eventBus.on('settingsDialogOpened', refreshCatFestivalStatus);
  });

  onBeforeUnmount(() => {
    eventBus.off('settingsDialogOpened', refreshCatFestivalStatus);
  });

  return {
    isCatFestivalActive: readonly(isCatFestivalActive),
    isPiDayActive: readonly(isPiDayActive),
    isPrideMonthActive: readonly(isPrideMonthActive),
    refreshCatFestivalStatus
  };
}
