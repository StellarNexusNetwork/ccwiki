<template>
  <div class="iconArea">
    <img v-if="!isCatFestivalActive" src="/static/components/settings/svg/setting.svg" alt="SVG Image" draggable="false" class="gearIcon">
    <button v-else class="catButton" type="button" @click="emitBurst" aria-label="Cat Day Easter Egg">
      <span class="catIcon" aria-hidden="true">🐱</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useCatFestivalStatus } from '@/composables/useCatFestivalStatus';

const emit = defineEmits<{
  burst: [payload: { x: number; y: number }];
}>();

const { isCatFestivalActive } = useCatFestivalStatus();

function emitBurst(event: MouseEvent) {
  emit('burst', {
    x: event.clientX,
    y: event.clientY
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
</style>
