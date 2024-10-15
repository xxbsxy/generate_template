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

	const apiList = JSON.parse(data.toString()).api as ApiList[];

	const columnList = JSON.parse(data.toString()).columns as Column[];

	const formSchemaList = JSON.parse(data.toString()).formSchema as FormSchema[];

	const searchFormSchemaList = JSON.parse(data.toString()).searchFormSchema as FormSchema[];

	fileName = JSON.parse(data.toString()).fileName as string;

	FileName = fileName.replace(fileName[0], fileName[0].toUpperCase());

	fs.mkdir(__dirname + `/${fileName}`, () => {})

	generateApiFile(apiList);

	generateDataFile(columnList, formSchemaList, searchFormSchemaList);

	generateIndex()

	generateModal()
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
	import { defHttp } from '/@/utils/http/axios';

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
		}`
	})

	const searchFormSchema = searchFormSchemaList.map(v => {
		return `{
			field: '${v.field}',
			label:'${v.label}',
			component: 'Input',
		}`
	})

	const formSchema = formSchemaList.map(v => {
		return `{
			field: '${v.field}',
			label:'${v.label}',
			component: 'Input',
			required: true,
		}`
	})

	const string = `
	import { BasicColumn } from '/@/components/Table'; 
	import { FormSchema } from '/@/components/Table';	\n
	export const columns: BasicColumn[] = [${columns}] \n
	export const searchFormSchema: FormSchema[] = [${searchFormSchema}] \n
	export const formSchema: FormSchema[] = [${formSchema}]
	`;
	fs.writeFile(__dirname + `/${fileName}/${fileName}.data.ts`, string, (err) => { });
};

// 生成index.vue
const generateIndex = () => {

	const string = `
	<template>
  <div>
    <BasicTable @register="registerTable" :columns="columns">
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate">
          新增</a-button
        >
      </template>
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <${FileName}Modal @register="registerModal" @success="reload" />
  </div>
</template>

<script setup lang="ts">
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { ${searchMethod}, ${deleteMethod} } from './${fileName}.api';
  import ${FileName}Modal from './${FileName}Modal.vue';
  import { columns, searchFormSchema } from './${fileName}.data';
  import { useModal } from '/@/components/Modal';
  import { message } from 'ant-design-vue';

  const [registerModal, { openModal }] = useModal();

  const { tableContext } = useListPage({
    designScope: 'apply-template',
    tableProps: {
      api: ${searchMethod},
      actionColumn: {
        width: '180px',
      },
      showIndexColumn: true,
      formConfig: {
        schemas: searchFormSchema,
      },
    },
  });

  const [registerTable, { reload }] = tableContext;

  const handleCreate = () => {
    openModal(true, {
      isUpdate: false,
    });
  };

  const handleEdit = (record) => {
    openModal(true, {
      record,
      isUpdate: true,
    });
  };

  const handleDelete = async (record) => {
    await ${deleteMethod}({...record});
		message.success('操作成功');
    await reload();
  };

  const getTableAction = (record) => {
    return [
      {
        icon: 'clarity:note-edit-line',
        label: '编辑',
        onClick: handleEdit.bind(null, record),
      },

      {
        icon: 'ant-design:delete-outlined',
        label: '删除',
        color: 'error',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record),
        },
      },
    ];
  };
</script>
	`
	fs.writeFile(__dirname + `/${fileName}/index.vue`, string, (err) => { });
}

// 生成modal.vue
const generateModal = () => {

	const string = `
		<template>
    <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="getTitle"
    width="700px"
    @ok="handleSubmit"
    destroyOnClose
  >
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { formSchema } from './${fileName}.data';
  import { ${editMethod},${addMethod} } from './${fileName}.api';
	import { message } from 'ant-design-vue';

  const emit = defineEmits(['success', 'register']);

  const isUpdate = ref(true);

  const [registerForm, { getFieldsValue, resetFields, setFieldsValue, validate }] = useForm({
    labelWidth: 90,
    schemas: formSchema,
    showActionButtonGroup: false,
		baseColProps: { span: 23 }
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    resetFields();
    isUpdate.value = data.isUpdate;
    if (isUpdate.value) {
      setFieldsValue({...data.record});
    }
  });

  const getTitle = computed(() => (isUpdate.value ? '编辑' : '新增'));

  async function handleSubmit() {
    try {
      await validate();
			const values = getFieldsValue()
      setModalProps({ confirmLoading: true });
			if(isUpdate.value) {
			   await ${editMethod}({...values});
			} else {
				 await ${addMethod}({...values})
			 }
      closeModal();
		  message.success('操作成功');
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>

		`
	fs.writeFile(__dirname + `/${fileName}/${FileName}Modal.vue`, string, (err) => { });
}

