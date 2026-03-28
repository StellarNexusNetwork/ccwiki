<template>
  <div ref="mainDivRef" class="mainDiv">
    <div class="fireworksLayer" aria-hidden="true">
      <span
        v-for="particle in particles"
        :key="particle.id"
        class="particle"
        :style="{
          left: particle.x + 'px',
          top: particle.y + 'px',
          '--dx': particle.dx + 'px',
          '--dy': particle.dy + 'px',
          '--rot': particle.rotation + 'deg',
          '--dur': particle.duration + 'ms',
          '--scale': particle.scale.toString()
        }"
      >
        {{ particle.emoji }}
      </span>
    </div>
    <div class="div">
      <FestivalGear @burst="launchCatFireworks"/>
      <div class="title" id="title">{{ desktopTitle }}</div>
      <div class="title" id="title_m">{{ mobileTitle }}</div>
      <div id="details">
        <div class="data">{{ t('public.setting.default.version') }} 26w13a</div>
        <div class="data">{{ t('public.setting.default.releaseDate') }} 2026.03.28</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {computed, onBeforeUnmount, ref} from 'vue';
import {useI18n} from 'vue-i18n';
import FestivalGear from '@/components/settings/components/FestivalGear.vue';
import {useCatFestivalStatus} from '@/composables/useCatFestivalStatus';

const {t} = useI18n();
const {isCatFestivalActive, isPiDayActive, isPrideMonthActive} = useCatFestivalStatus();
const desktopTitle = computed(() => {
  if (isCatFestivalActive.value) {
    return 'Neko Wiki project';
  }
  if (isPiDayActive.value) {
    return 'Pi Wiki project';
  }
  if (isPrideMonthActive.value) {
    return 'CC Wiki project';
  }
  return 'CC Wiki project';
});
const mobileTitle = computed(() => {
  if (isCatFestivalActive.value) {
    return 'Neko Wiki';
  }
  if (isPiDayActive.value) {
    return 'Pi Wiki';
  }
  if (isPrideMonthActive.value) {
    return 'CC Wiki';
  }
  return 'CC Wiki';
});

type CatParticle = {
  id: number;
  emoji: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  rotation: number;
  duration: number;
  scale: number;
};

const particles = ref<CatParticle[]>([]);
const mainDivRef = ref<HTMLElement | null>(null);
const CAT_EMOJIS = ['🐱', '🐈', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🐾'];
const PI_EMOJIS = ['➕', '➖', '3️⃣', '1️⃣', '4️⃣'];
const PRIDE_EMOJIS = ['🌈', '❤️', '🧡', '💛', '💚', '💙', '💜', '🏳️‍⚧️', '🏳️‍🌈', '🍥'];
let particleId = 0;
const removeTimers: number[] = [];

function randomIn(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function launchCatFireworks(payload: { x: number; y: number; mode: 'cat' | 'pi' | 'pride' }) {
  const container = mainDivRef.value;
  if (!container) {
    return;
  }
  const rect = container.getBoundingClientRect();
  const clickX = payload.x - rect.left;
  const clickY = payload.y - rect.top;
  const activeEmojis = payload.mode === 'pi' ? PI_EMOJIS : payload.mode === 'pride' ? PRIDE_EMOJIS : CAT_EMOJIS;

  const burstCount = 22;
  const created: CatParticle[] = [];

  for (let i = 0; i < burstCount; i += 1) {
    const angle = randomIn(0, Math.PI * 2);
    const distance = randomIn(70, 180);
    created.push({
      id: particleId++,
      emoji: activeEmojis[Math.floor(Math.random() * activeEmojis.length)],
      x: clickX,
      y: clickY,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      rotation: randomIn(-210, 210),
      duration: randomIn(900, 1500),
      scale: randomIn(0.8, 1.7)
    });
  }

  particles.value = [...particles.value, ...created];
  for (const particle of created) {
    const timeoutId = window.setTimeout(() => {
      particles.value = particles.value.filter((item) => item.id !== particle.id);
    }, particle.duration);
    removeTimers.push(timeoutId);
  }
}

onBeforeUnmount(() => {
  for (const timerId of removeTimers) {
    clearTimeout(timerId);
  }
});
</script>
<style scoped>
@media (min-width: 670px) {
  .mainDiv .div #title_m {
    display: none;
  }
}

@media (max-width: 670px) {
  .mainDiv .div #title {
    display: none;
  }
}

.mainDiv {
  height: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.fireworksLayer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 3;
  --fireworks-fade-edge: 56px;
  -webkit-mask-image: linear-gradient(to right, transparent 0, #000 var(--fireworks-fade-edge), #000 calc(100% - var(--fireworks-fade-edge)), transparent 100%),
  linear-gradient(to bottom, transparent 0, #000 var(--fireworks-fade-edge), #000 calc(100% - var(--fireworks-fade-edge)), transparent 100%);
  -webkit-mask-composite: source-in;
  mask-image: linear-gradient(to right, transparent 0, #000 var(--fireworks-fade-edge), #000 calc(100% - var(--fireworks-fade-edge)), transparent 100%),
  linear-gradient(to bottom, transparent 0, #000 var(--fireworks-fade-edge), #000 calc(100% - var(--fireworks-fade-edge)), transparent 100%);
  mask-composite: intersect;
}

.mainDiv .div {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 2;
}

.particle {
  position: absolute;
  font-size: 26px;
  line-height: 1;
  user-select: none;
  pointer-events: none;
  transform: translate(-50%, -50%);
  animation: cat-firework var(--dur) cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
}

.mainDiv .div .title {
  margin-top: 10px;
  font-family: RHRCN-H;
  font-size: 35px;
  color: var(--color-text-caption);
}

.mainDiv .div #details {
  margin-top: 10px;
  margin-bottom: 50px;
  color: var(--color-text-caption);
  font-family: RHRCN-N;
}

@keyframes cat-firework {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) translate(0, 0) scale(1) rotate(0deg);
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(var(--scale)) rotate(var(--rot));
  }
}
</style>
