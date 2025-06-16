import {ref} from 'vue';

export function useTextOverflow() {
  const shouldAddGap = ref(false);

  function onOverflowDetected() {
    shouldAddGap.value = true;
  }

  function onOverflowCleared() {
    shouldAddGap.value = false;
  }

  return {
    shouldAddGap,
    onOverflowDetected,
    onOverflowCleared
  };
}