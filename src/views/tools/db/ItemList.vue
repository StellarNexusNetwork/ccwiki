<template>
  <div class="Div">
    <div class="card">
      <DataTable
        ref="dt"
        :value="products"
        dataKey="id"
        :paginator="true"
        :rows="10"
        :filters="filters"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25,50,100,150,200]"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Manage Products</h4>
            <IconField>
              <InputIcon>
                <i class="pi pi-search"/>
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Search..."/>
            </IconField>
          </div>
        </template>


        <Column field="id" header="ID" sortable style="min-width: 12rem"></Column>
        <Column field="text" header="Text" sortable style="min-width: 16rem"></Column>


        <!--        <Column field="inventoryStatus" header="Status" sortable style="min-width: 12rem">-->
        <!--          <template #body="slotProps">-->
        <!--            <Tag :value="slotProps.data.inventoryStatus" :severity="getStatusLabel(slotProps.data.inventoryStatus)"/>-->
        <!--          </template>-->
        <!--        </Column>-->
        <Column :field="labelItem.display" :header="labelItem.display" sortable style="min-width: 12rem" v-for="(labelItem) in labelGroup">
          <template #body="slotProps">
            <div class="card flex justify-center">
              <!--              <Select v-model="slotProps.data[labelItem.labelName]" :options="labelItem.labels" optionLabel="name" optionValue="code" placeholder="选择一个标签" class="w-full md:w-56" @value-change="(e) => handleValueChange(slotProps.data.id,labelItem.labelName,e)"/>-->
              <SelectButton v-model="slotProps.data[labelItem.labelName]" :options="labelItem.labels" optionLabel="name" optionValue="code" placeholder="选择一个标签" class="w-full md:w-56" @value-change="(e) => handleValueChange(slotProps.data.id,labelItem.labelName,e)"/>
            </div>
          </template>
        </Column>

        <Column field="intent" header="intent" sortable style="min-width: 16rem"></Column>

        <Column field="created_at" header="创建时间" sortable style="min-width: 16rem"></Column>
        <Column field="edit_at" header="编辑时间" sortable style="min-width: 16rem"></Column>

        <Column :exportable="false" style="min-width: 12rem">
          <template #body="slotProps">
            <Button icon="pi pi-trash" variant="outlined" rounded severity="danger" @click="confirmDeleteProduct(slotProps.data)">
              <img class="icon" src="/views/tools/db/svg/delete.svg" alt="SVG Image" draggable="false">
            </Button>
          </template>
        </Column>
      </DataTable>
    </div>


    <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl"/>
        <span v-if="product"
        >Are you sure you want to delete <b>{{ product.id }}</b
        >?</span
        >
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteProductDialog = false" severity="secondary" variant="text"/>
        <Button label="Yes" icon="pi pi-check" @click="deleteProduct" severity="danger"/>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import {useNoticeStore} from '@/stores/setting';
import {FilterMatchMode} from '@primevue/core/api';
import {ref} from 'vue';
import axios from 'axios';

const deleteProductDialog = ref(false);
const product = ref({});
const labelGroup = ref()
const products = ref()
const idIndex = ref()
const notice = useNoticeStore();

// 获取所有标签
const getLabelGroupn = async () => {
  try {
    const response = await axios.get('http://localhost:7999/api/db/getLabels')
    labelGroup.value = response.data.labelGroup
  } catch (err) {
    console.log(err)
    notice.addNotice({
      'type': 'error',
      'title': '错误！',
      'content': err
    });
  }
}

// 获取所有数据
const getSqlData = async () => {
  try {
    const response = await axios.get('http://localhost:7999/api/db/getData')
    products.value = response.data.data
  } catch (err) {
    console.log(err)
    notice.addNotice({
      'type': 'error',
      'title': '错误！',
      'content': err
    });
  }
}

const getIdIndex = async () => {
  try {
    const response = await axios.get('http://localhost:7999/api/db/getIdIndex')
    idIndex.value = response.data
  } catch (err) {
    console.log(err)
    notice.addNotice({
      'type': 'error',
      'title': '错误！',
      'content': err
    });
  }
}

const updataDataByID = async (item_id: number) => {
  try {
    const response = await axios.get('http://localhost:7999/api/db/getDataById/' + item_id)
    products.value[idIndex.value[item_id.toString()]] = response.data
  } catch (err) {
    console.log(err)
    notice.addNotice({
      'type': 'error',
      'title': '错误！',
      'content': err
    });
  }
}

// POST 请求
const updateItem = async (id: number, name: string, context: string) => {
  try {
    const response = await axios.post('http://localhost:7999/api/db/updateItem', {
      id: id,
      name: name,
      context: context
    })
    if (response.data.id === id) {
      updataDataByID(id)
    } else {
      throw new Error("更新失败");
    }
  } catch (err) {
    console.log(err)
    notice.addNotice({
      'type': 'error',
      'title': '错误！',
      'content': err
    });
  }
}

const DeleteItem = async (item_id: number) => {
  try {
    const response = await axios.delete('http://localhost:7999/api/db/delete/' + item_id)
    console.log(response.data, item_id)
    if (response.data.id === item_id) {
      products.value.splice(idIndex.value[response.data.id.toString()], 1)
      getIdIndex()
    } else {
      throw new Error("系统异常");
    }
  } catch (err) {
    console.log(err)
    notice.addNotice({
      'type': 'error',
      'title': '错误！',
      'content': err
    });
  }
}

getSqlData()
getIdIndex()
getLabelGroupn()

const filters = ref({
  'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
});


const confirmDeleteProduct = (prod: any) => {
  product.value = prod;
  deleteProductDialog.value = true;
};

const deleteProduct = () => {
  console.log(product.value.id)
  DeleteItem(product.value.id)
  deleteProductDialog.value = false;
};

function handleValueChange(id, name, newValue) {
  console.log('更新:', id, name, newValue);
  updateItem(id, name, newValue)
}

</script>

<style scoped>
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

.fade-leave-active {
  position: absolute;
}

.Div {

}
</style>
