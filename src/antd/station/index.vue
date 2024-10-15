
	<template>
	<div>
    <div>
      <a-space :size="18" class="mb-4">
        <a-button-create @create="handleCreate" />
      </a-space>
    </div>


		 <div>
      <a-space :size="18" class="mb-4">
        
				<a-input
					v-model:value="searchForm.stationIp"
					placeholder="请输入基站IP"
				/>
		
				<a-input
					v-model:value="searchForm.stationAddress"
					placeholder="请输入基站地址"
				/>
		
        <a-button-search @search="reload" />
        <a-button-reset @reset="reset" />
      </a-space>
    </div>

    <a-table
      :dataSource="dataSource"
      :columns="columns"
      :loading="loading"
      bordered
      :pagination="pagination"
      @change="handleTableChange"
      :row-class-name="(_record, index: number) => (index % 2 === 1 ? 'table-striped' : null)
				"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-space :size="15">
        		<a-button-edit @edit="handleEdit" :record="record" />
            <a-button-delete @delete="handleDelete(record)" />
          </a-space>
        </template>
      </template>
    </a-table>
    <StationModal v-model:open="open" ref="oneModalRef" @success="reload" />
  </div>
</template>

<script setup lang="ts">
	import { columns } from "./station.data";
	import  StationModal from "./StationModal.vue";
	import { onMounted, ref } from "vue";
	import { ShowSupplierPage2, DeleteSupplier2 } from "./station.api";
	import { usePagination } from "@/hooks/usePagination";
	import { Modal } from "ant-design-vue";

	const open = ref(false);

	const loading = ref(false);

	const { total, pageNo, pageSize, pagination, resetPagination } = usePagination();

	const stationModalRef = ref<InstanceType<typeof StationModal> | null>(null);

	const dataSource = ref([]);

	const handleCreate = () => {
		stationModalRef.value?.onLoad({ isUpdate: false });
	};

	const searchForm = ref({"stationIp":"","stationAddress":""});


	const handleTableChange = (p) => {
		pageNo.value = p.current;
		pageSize.value = p.pageSize;
		reload();
	};

	const handleDelete = (record) => {
		Modal.confirm({
			title: "提示",
			content: "此操作将永久删除该数据, 是否继续?",
			centered: true,
			async onOk() {
				await DeleteSupplier2({ id: record.id, showMessage: true });
				reload();
			},
		});
	};

	const handleEdit = (record) => {
		stationModalRef.value?.onLoad({ isUpdate: true, record });
	};

	const reload = async () => {
		try {
			loading.value = true;
			const res = await ShowSupplierPage2({
				pageSize: pageSize.value,
				pageNo: pageNo.value,
				...searchForm.value,
			});
			total.value = Number(res.totalRows);
			dataSource.value = res.records;
		} finally {
			loading.value = false;
		}
	};

	const reset = () => {
		resetPagination();
		searchForm.value = {"stationIp":"","stationAddress":""};
		reload();
};

	onMounted(() => {
		reload();
	});

</script>
	