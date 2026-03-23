<template>
  <textarea class="auto-resize-textarea" v-model="content" @input="autoResize" rows="1"></textarea>
</template>

<script>
export default {
  name: 'AutoResizeTextarea',
  props: {
    modelValue: String,
  },
  emits: ['update:modelValue', 'update-height'], // 定义新的 'update-height' 事件
  data() {
    return {
      content: this.modelValue,
    };
  },
  watch: {
    modelValue(newVal) {
      this.content = newVal;
    },
  },
  methods: {
    autoResize(event) {
      const textarea = event.target;
      textarea.style.height = 'auto'; // 先重置高度
      textarea.style.height = `${textarea.scrollHeight}px`; // 动态设置高度
      this.$emit('update:modelValue', this.content);
      this.$emit('update-height', textarea.scrollHeight); // 将高度传递给父组件
    },
  },
};
</script>

<style scoped>
.auto-resize-textarea {
  width: calc(100% - 60px);
  min-height: 38px;
  max-height: 300px;
  padding: 5px;
  font-size: 18px;
  font-family: MiSans;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0);
  border: none;
  resize: none;
  outline: none;
}
</style>