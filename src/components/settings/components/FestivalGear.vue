<template>
  <div class="iconArea">
    <img
      v-if="!isCatFestivalActive && !isPiDayActive && !isPrideMonthActive"
      src="/static/components/settings/svg/setting.svg"
      alt="SVG Image"
      draggable="false"
      class="gearIcon"
    >
    <button v-else-if="isCatFestivalActive" class="catButton" type="button" @click="emitBurst" aria-label="Cat Day Easter Egg">
      <span class="catIcon" aria-hidden="true">🐱</span>
    </button>
    <button v-else-if="isPiDayActive" class="piButton" type="button" @click="emitBurst" aria-label="Pi Day Easter Egg">
      <span class="piIcon" aria-hidden="true">🥧</span>
    </button>
    <button v-else class="prideButton" type="button" @click="emitBurst" aria-label="Pride Month Easter Egg">
      <span class="prideIcon" aria-hidden="true">🏳️‍🌈</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useCatFestivalStatus } from '@/composables/useCatFestivalStatus';

const emit = defineEmits<{
  burst: [payload: { x: number; y: number; mode: 'cat' | 'pi' | 'pride' }];
}>();

const { isCatFestivalActive, isPiDayActive, isPrideMonthActive } = useCatFestivalStatus();

function emitBurst(event: MouseEvent) {
  let mode: 'cat' | 'pi' | 'pride' = 'pride';
  if (isCatFestivalActive.value) {
    mode = 'cat';
  } else if (isPiDayActive.value) {
    mode = 'pi';
  } else if (isPrideMonthActive.value) {
    mode = 'pride';
  }
  emit('burst', {
    x: event.clientX,
    y: event.clientY,
    mode
  });
}
</script>

<style scoped>
.iconArea {
  width: 80px;
  height: 80px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.gearIcon {
  width: 80px;
  height: 80px;
  user-select: none;
}

.catButton {
  width: 80px;
  height: 80px;
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  position: relative;
  cursor: pointer;
  transform: translateY(-20px);
}

.piButton {
  width: 80px;
  height: 80px;
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  position: relative;
  cursor: pointer;
  transform: translateY(-20px);
}

.prideButton {
  width: 80px;
  height: 80px;
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  position: relative;
  cursor: pointer;
  transform: translateY(-20px);
}

.catIcon {
  position: absolute;
  left: 50%;
  top: 26%;
  transform: translate(-50%, -50%);
  font-size: 130px;
  line-height: 1;
  user-select: none;
  filter: drop-shadow(0 10px 20px var(--color-shadow-l));
  animation: cat-idle 1.6s ease-in-out infinite;
}

.piIcon {
  position: absolute;
  left: 50%;
  top: 42%;
  transform: translate(-50%, -50%);
  font-size: 108px;
  line-height: 1;
  user-select: none;
  filter: drop-shadow(0 8px 18px var(--color-shadow-l));
  animation: pi-idle 1.6s ease-in-out infinite;
}

.prideIcon {
  position: absolute;
  left: 50%;
  top: 40%;
  transform: translate(-50%, -50%);
  font-size: 100px;
  line-height: 1;
  user-select: none;
  filter: drop-shadow(0 8px 18px var(--color-shadow-l));
  animation: pride-idle 1.6s ease-in-out infinite;
}

@keyframes cat-idle {
  0% {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
  }

  50% {
    transform: translate(-50%, -50%) scale(1.03) rotate(-3deg);
  }

  100% {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
  }
}

@keyframes pi-idle {
  0% {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
  }

  50% {
    transform: translate(-50%, -50%) scale(1.04) rotate(4deg);
  }

  100% {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
  }
}

@keyframes pride-idle {
  0% {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
  }

  50% {
    transform: translate(-50%, -50%) scale(1.03) rotate(-2deg);
  }

  100% {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
  }
}
</style>
