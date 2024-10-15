import fs from "fs";

import type { ApiList, Column, FormSchema } from "../type";

let fileName = ''

let FileName = ''

let addMethod = ''

let deleteMethod = ''

let editMethod = ''

let searchMethod = ''

fs.readFile(__dirname + "/config.json", function (err, data) {
	if (err) {
		return console.error(err);
	}
	const dataArr = JSON.parse(data.toString()) as any[]

	for (let index = 0; index < dataArr.length; index++) {
		const element = dataArr[index];

		const apiList = element.api as ApiList[];

		const columnList = element.columns as Column[];

		const formSchemaList = element.formSchema as FormSchema[];

		const searchFormSchemaList = element.searchFormSchema as FormSchema[];

		fileName = element.fileName as string;

		FileName = fileName.replace(fileName[0], fileName[0].toUpperCase());

		fs.mkdir(__dirname + `/${fileName}`, () => { })

		generateApiFile(apiList);

		generateDataFile(columnList, formSchemaList, searchFormSchemaList);

		generateIndex(searchFormSchemaList)

		generateModal(formSchemaList)

	}



});

// 生成api.ts
const generateApiFile = (apiList: ApiList[]) => {
	const enumValues = apiList
		.map((api) => {
			const v = api;
			const v1 = v.url.split("/");
			const title = v1[v1.length - 1];
			return `${title} = "${api.url}"`;
		})
		.join(",\n\t\t");

	const exportValues = apiList
		.map((api, index) => {
			const v = api;
			const v1 = v.url.split("/");
			const title = v1[v1.length - 1];

			switch (index) {
				case 0:
					addMethod = title
					break;
				case 1:
					deleteMethod = title
					break;
				case 2:
					editMethod = title
					break;
				case 3:
					searchMethod = title
					break;
			}

			return `export const ${title} = (params) => {
			return defHttp.${api.method}({ url: Api.${title}, params });
		};`;
		})
		.join("\n\n\t");

	const string = `
	import defHttp from "@/api/index";

	export enum Api {
		${enumValues}
	}
	${exportValues}
	`;
	fs.writeFile(__dirname + `/${fileName}/${fileName}.api.ts`, string, (err) => { });
};

// 生成data.ts
const generateDataFile = (columnList: Column[], formSchemaList: FormSchema[], searchFormSchemaList: FormSchema[]) => {

	const columns = columnList.map(v => {
		return `{
			title: '${v.title}',
			dataIndex: '${v.dataIndex}',
			align: 'center',
			ellipsis: true,
		}`
	})

	columns.push("{title: '操作', key: 'action', align: 'center', width: 200}")


	const string = `
	import { ColumnType } from "ant-design-vue/es/table"; \n
	export const columns: ColumnType[] = [${columns}] 
	`;
	fs.writeFile(__dirname + `/${fileName}/${fileName}.data.ts`, string, (err) => { });
};

// 生成index.vue
const generateIndex = (searchFormSchemaList: FormSchema[]) => {
	const formArr = searchFormSchemaList.map((v) => {
		return `
				<a-input
					v-model:value="searchForm.${v.field}"
					placeholder="请输入${v.label}"
				/>
		`
	})

	let F: { [key: string]: string } = {}

	searchFormSchemaList.forEach(v => {
		F[v.field] = ''
	})

	let searchForm = JSON.stringify(F)

	const string = `
	<template>
	<div>
    <div>
      <a-space :size="18" class="mb-4">
        <a-button-create @create="handleCreate" />
      </a-space>
    </div>


		 <div>
      <a-space :size="18" class="mb-4">
        ${formArr.join('')}
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
    <${FileName}Modal v-model:open="open" ref="${fileName}ModalRef" @success="reload" />
  </div>
</template>

<script setup lang="ts">
	import { columns } from "./${fileName}.data";
	import  ${FileName}Modal from "./${FileName}Modal.vue";
	import { onMounted, ref } from "vue";
	import { ${searchMethod}, ${deleteMethod} } from "./${fileName}.api";
	import { usePagination } from "@/hooks/usePagination";
	import { Modal } from "ant-design-vue";

	const open = ref(false);

	const loading = ref(false);

	const { total, pageNo, pageSize, pagination, resetPagination } = usePagination();

	const ${fileName}ModalRef = ref<InstanceType<typeof ${FileName}Modal> | null>(null);

	const dataSource = ref([]);

	const handleCreate = () => {
		${fileName}ModalRef.value?.onLoad({ isUpdate: false });
	};

	const searchForm = ref(${searchForm});


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
				await ${deleteMethod}({ id: record.id, showMessage: true });
				reload();
			},
		});
	};

	const handleEdit = (record) => {
		${fileName}ModalRef.value?.onLoad({ isUpdate: true, record });
	};

	const reload = async () => {
		try {
			loading.value = true;
			const res = await ${searchMethod}({
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
		searchForm.value = ${searchForm};
		reload();
};

	onMounted(() => {
		reload();
	});

</script>
	`
	fs.writeFile(__dirname + `/${fileName}/index.vue`, string, (err) => { });
}

// 生成modal.vue
const generateModal = (formSchemaList: FormSchema[]) => {

	const formArr = formSchemaList.map((v) => {
		return `
			<a-col :span="12">
			<a-form-item
				label="${v.label}"
				name="${v.field}"
				:rules="[{ required: true, message: '请输入${v.label}' }]"
			>
				<a-input
					v-model:value="formState.${v.field}"
					placeholder="请输入${v.label}"
				/>
			</a-form-item>
		</a-col>
		`
	})

	let F: { [key: string]: string } = {}

	formSchemaList.forEach(v => {
		F[v.field] = ''
	})

	let formState = JSON.stringify(F)


	const string = `
<template>
  <div>
    <a-modal
      :title="getTitle"
      v-bind="$attrs"
      width="800px"
      @cancel="handelCancel"
      @ok="handleOk"
    >
      <a-form :model="formState" ref="formRef">
        <a-row :gutter="36" class="mt-8">
					${formArr.join('')}
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

	<script setup lang="ts">
	import { computed, ref } from "vue";
	import { ${addMethod}, ${editMethod} } from "./${fileName}.api";
	import { FormInstance } from "ant-design-vue";
	import { updateRefFromObject } from "@/utils";

	const formRef = ref<FormInstance>();

	const emit = defineEmits(["update:open", "success"]);

	const formState = ref(${formState});

	const isUpdate = ref(false);

	const getTitle = computed(() => (isUpdate.value ? "编辑" : "新增"));

	const onLoad = (data) => {
		isUpdate.value = data.isUpdate;

		if (data.isUpdate) {
			updateRefFromObject(formState, data.record);
		}

		emit("update:open", true);
	};

	const handelCancel = () => {
		formRef.value?.resetFields();
		emit("update:open", false);
	};

	const handleOk = async () => {
		await formRef.value?.validate();

		if (isUpdate.value) {
			await ${editMethod}({
				...formState.value,
				showMessage: true,
			});
		} else {
			await ${addMethod}({
				...formState.value,
				showMessage: true,
			});
		}

		emit("update:open", false);

		emit("success");
	};

	defineExpose({
		onLoad,
	});
	</script>


		`
	fs.writeFile(__dirname + `/${fileName}/${FileName}Modal.vue`, string, (err) => { });
}

