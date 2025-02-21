import { defineStore } from "pinia";
import { ref,onMounted } from "vue";


export const useWindowStore = defineStore('window', () => {
    const windowWidth = ref(window.innerWidth);

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  updateWindowWidth(); // 初始化窗口宽度
  window.addEventListener('resize', updateWindowWidth); // 监听窗口大小变化
});

    return { windowWidth }
}
)