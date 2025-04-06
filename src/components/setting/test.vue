<template>
  <div>测试</div>
  <button @click="openFolder">打开文件夹</button>
</template>
<script setup lang="ts">
async function openFolder() {
  try {
    const handle = window.showDirectoryPicker();
    const root = await processHandle(handle)
  } catch {
    console.error("用户取消了操作");
  }
}

async function processHandle(handle: any) {
  if (handle.kind === 'file') {
    return handle
  }
  handle.children = []
  const iter = handle.entries();
  for await (const item of iter) {
    handle.children.push(await processHandle(item[1]));
  }
  return handle
}
</script>
<style scoped>
</style>