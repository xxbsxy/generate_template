
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
					
			<a-col :span="12">
			<a-form-item
				label="基站IP"
				name="stationIp"
				:rules="[{ required: true, message: '请输入基站IP' }]"
			>
				<a-input
					v-model:value="formState.stationIp"
					placeholder="请输入基站IP"
				/>
			</a-form-item>
		</a-col>
		
			<a-col :span="12">
			<a-form-item
				label="基站地址"
				name="stationAddress"
				:rules="[{ required: true, message: '请输入基站地址' }]"
			>
				<a-input
					v-model:value="formState.stationAddress"
					placeholder="请输入基站地址"
				/>
			</a-form-item>
		</a-col>
		
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

	<script setup lang="ts">
	import { computed, ref } from "vue";
	import { AddSupplier1, UpdateSupplier2 } from "./station.api";
	import { FormInstance } from "ant-design-vue";
	import { updateRefFromObject } from "@/utils";

	const formRef = ref<FormInstance>();

	const emit = defineEmits(["update:open", "success"]);

	const formState = ref({"stationIp":"","stationAddress":""});

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
			await UpdateSupplier2({
				...formState.value,
				showMessage: true,
			});
		} else {
			await AddSupplier1({
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


		