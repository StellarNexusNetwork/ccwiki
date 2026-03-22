import {onBeforeUnmount, onMounted, readonly, ref} from 'vue';
import {eventBus} from '@/utils/eventBus';

const CAT_DAY_MONTH = 1; // February (0-based month)
const CAT_DAY_DATE = 22;
const CAT_FESTIVAL_DURATION_DAYS = 7;

export function isCatFestival(date = new Date()): boolean {
  const year = date.getFullYear();
  const festivalStart = new Date(year, CAT_DAY_MONTH, CAT_DAY_DATE);
  const festivalEnd = new Date(festivalStart);
  festivalEnd.setDate(festivalStart.getDate() + CAT_FESTIVAL_DURATION_DAYS);
  return date >= festivalStart && date < festivalEnd;
}

export function useCatFestivalStatus() {
  const isCatFestivalActive = ref(isCatFestival());

  const refreshCatFestivalStatus = () => {
    isCatFestivalActive.value = isCatFestival();
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
    refreshCatFestivalStatus
  };
}
