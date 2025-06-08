<template>
  <div class="Div">
    <div class="AboutList">
      <suspense v-for="([id, item], index) in entries">
        <template #default>
          <item :category="category" :subcategory="subcategory" :id="id" :data="item"/>
        </template>
      </suspense>
    </div>
  </div>
</template>

<script setup lang="ts">
import item from "./item.vue";
import get from 'lodash/get';
import {computed, ref, toRaw} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useDataSourcesStore} from "@/stores/dataSources";
import {useSettingStore} from "@/stores/setting";

const route = useRoute()
const {category, subcategory} = route.params

const itemList = ref<any[]>([]);

const dataSources = useDataSourcesStore()

if (!dataSources.localRepositoriesData) {
  await dataSources.refreshData()
}

const root = toRaw(dataSources.localRepositoriesData)

const lang = computed(() => useSettingStore().setting.lang)

const items = get(root, ['docs', lang.value, category, subcategory])


if (items === undefined) {
  useRouter().push('/404')
}
const entries = computed(() => Object.entries(items ?? {} as Record<string, any>));
// else {
//   const entries = Object.entries(items);
//   const ids = entries.map(([id]) => id);
//   const objs = entries.map(([, obj]) => obj);
//   itemList.value.push(...objs)
// }
</script>

<style scoped>
.Div {
  display: flex;
  justify-content: center;
}

.Div .AboutList {
  width: 95%;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 20px;
  margin-top: 25px;
}
</style>